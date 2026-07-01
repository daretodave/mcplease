import { track } from "@mcplease/analytics";
import type { PublicLink } from "@mcplease/model";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditPage } from "./edit";

// The seam is mocked so the editor is exercised without a network: getForEdit hands back the loaded link,
// update/remove record the token + fields the form sends, and slugAvailable drives the live claim check.
const getForEdit = vi.fn<(token: string) => Promise<PublicLink | null>>();
const update = vi.fn();
const remove = vi.fn();
const slugAvailable = vi.fn<(slug: string) => Promise<boolean | null>>();
vi.mock("../../lib/data", () => ({
  data: {
    links: {
      getForEdit: (t: string) => getForEdit(t),
      update: (t: string, f: unknown) => update(t, f),
      remove: (t: string) => remove(t),
      slugAvailable: (s: string) => slugAvailable(s),
    },
  },
}));

const HTTP_LINK: PublicLink = {
  slug: "my-mcp",
  kind: "http",
  serverUrl: "https://acme.dev/mcp",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: "Acme",
  description: "internal-only",
  tagline: "one paste away",
};

const STDIO_LINK: PublicLink = {
  slug: "local-mcp",
  kind: "stdio",
  serverUrl: null,
  repoUrl: "https://github.com/me/mcp",
  buildCmd: "npm install",
  runTarget: "node dist/server.js",
  name: "Local",
  description: null,
  tagline: null,
};

function renderEdit(token = "tok-123") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/e/${token}`]}>
        <Routes>
          <Route path="/e/:uuid" element={<EditPage />} />
          <Route path="/:slug" element={<div>share page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("EditPage", () => {
  afterEach(() => {
    getForEdit.mockReset();
    update.mockReset();
    remove.mockReset();
    slugAvailable.mockReset();
    vi.restoreAllMocks();
  });

  it("loads the link behind the token and seeds the form", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    const page = renderEdit();

    expect(await page.findByText("Editing mcplease.io/my-mcp")).toBeInTheDocument();
    expect(getForEdit).toHaveBeenCalledWith("tok-123");
    expect((page.getByLabelText("Slug") as HTMLInputElement).value).toBe("my-mcp");
    expect((page.getByLabelText("Server URL") as HTMLInputElement).value).toBe(
      "https://acme.dev/mcp",
    );
    expect((page.getByLabelText("Name") as HTMLInputElement).value).toBe("Acme");
  });

  it("renders the not-found screen for a dead or expired token", async () => {
    getForEdit.mockResolvedValue(null);
    const page = renderEdit("gone");
    expect(await page.findByText(/this link doesn’t resolve/i)).toBeInTheDocument();
  });

  it("shows the transport read-only — both segments disabled", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/my-mcp");

    expect(page.getByRole("radio", { name: /Remote URL/i })).toBeDisabled();
    expect(page.getByRole("radio", { name: /Local server/i })).toBeDisabled();
  });

  it("shows the clone/build/run trio for a stdio link", async () => {
    getForEdit.mockResolvedValue(STDIO_LINK);
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/local-mcp");

    expect((page.getByLabelText("Clone") as HTMLInputElement).value).toBe(
      "https://github.com/me/mcp",
    );
    expect((page.getByLabelText(/Run target/i) as HTMLInputElement).value).toBe(
      "node dist/server.js",
    );
    expect(page.queryByLabelText("Server URL")).toBeNull();
  });

  it("checks a changed slug and blocks save while it is taken", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    slugAvailable.mockResolvedValue(false); // the new slug is taken
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/my-mcp");

    fireEvent.change(page.getByLabelText("Slug"), { target: { value: "acme" } });
    expect(await page.findByText(/taken/i)).toBeInTheDocument();
    expect(page.getByRole("button", { name: /save changes/i })).toBeDisabled();
    expect(update).not.toHaveBeenCalled();
  });

  it("saves through the token-authorized RPC, preserving unshown fields, and flashes Saved", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    update.mockResolvedValue({ ...HTTP_LINK, name: "Acme Corp" });
    const editSave = vi.spyOn(track, "editSave");
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/my-mcp");

    fireEvent.change(page.getByLabelText("Name"), { target: { value: "Acme Corp" } });
    fireEvent.click(page.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith("tok-123", {
        slug: "my-mcp",
        serverUrl: "https://acme.dev/mcp",
        repoUrl: null,
        buildCmd: null,
        runTarget: null,
        name: "Acme Corp",
        description: "internal-only", // not on the edit surface — preserved, never nulled
        tagline: "one paste away",
      }),
    );
    expect(editSave).toHaveBeenCalledWith({ transport: "http" });
    expect(await page.findByRole("button", { name: /saved/i })).toBeInTheDocument();
  });

  it("keeps save disabled when the required server field is emptied", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/my-mcp");

    fireEvent.change(page.getByLabelText("Server URL"), { target: { value: "   " } });
    expect(page.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  it("soft-deletes only after a two-step confirm, then routes to the not-found page", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    remove.mockResolvedValue(true);
    const editDelete = vi.spyOn(track, "editDelete");
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/my-mcp");

    // Step one: the danger button reveals a confirm — nothing is deleted yet.
    fireEvent.click(page.getByRole("button", { name: "Delete" }));
    expect(page.getByText("Delete this link?")).toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();

    // Step two: confirming removes the row and lands on the share route, which now misses.
    fireEvent.click(page.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("tok-123"));
    expect(editDelete).toHaveBeenCalled();
    expect(await page.findByText("share page")).toBeInTheDocument();
  });

  it("can back out of the delete confirm without removing anything", async () => {
    getForEdit.mockResolvedValue(HTTP_LINK);
    const page = renderEdit();
    await page.findByText("Editing mcplease.io/my-mcp");

    fireEvent.click(page.getByRole("button", { name: "Delete" }));
    fireEvent.click(page.getByRole("button", { name: /cancel/i }));

    expect(page.queryByText("Delete this link?")).toBeNull();
    expect(remove).not.toHaveBeenCalled();
  });
});
