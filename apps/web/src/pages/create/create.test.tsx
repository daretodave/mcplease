import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreatePage } from "./create";

// The slug hook talks to the data handle; keep it from a real network and default every claim to free.
vi.mock("../../lib/data", () => ({
  data: { links: { slugAvailable: vi.fn().mockResolvedValue(true) } },
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<CreatePage />} />
          <Route path="/:slug" element={<div>connect page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CreatePage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the hero and the http server field by default", () => {
    const { getByText, getByLabelText } = renderPage();
    expect(getByText(/your MCP server/i)).toBeInTheDocument();
    expect(getByLabelText("Server URL")).toBeInTheDocument();
  });

  it("swaps the revealed fields when the transport changes", () => {
    const { getByRole, getByLabelText, queryByLabelText } = renderPage();
    expect(getByLabelText("Server URL")).toBeInTheDocument();

    fireEvent.click(getByRole("radio", { name: /Local server/i }));

    expect(getByLabelText("Clone")).toBeInTheDocument();
    expect(getByLabelText(/Run target/i)).toBeInTheDocument();
    expect(queryByLabelText("Server URL")).toBeNull();

    // the revealed fields are wired to their state
    fireEvent.change(getByLabelText("Clone"), { target: { value: "https://github.com/me/mcp" } });
    fireEvent.change(getByLabelText(/^Build/), { target: { value: "npm install" } });
    fireEvent.change(getByLabelText(/Run target/i), { target: { value: "node dist/server.js" } });
    expect((getByLabelText("Clone") as HTMLInputElement).value).toBe("https://github.com/me/mcp");
  });

  it("reveals the optional detail fields and counts what's filled", () => {
    const { getByRole, getByLabelText, queryByLabelText, getByText } = renderPage();
    expect(queryByLabelText("Name")).toBeNull();

    fireEvent.click(getByRole("button", { name: /Add details/i }));

    expect(getByLabelText("Name")).toBeInTheDocument();
    fireEvent.change(getByLabelText("Name"), { target: { value: "Acme MCP" } });
    fireEvent.change(getByLabelText("Description"), { target: { value: "Does things." } });
    fireEvent.change(getByLabelText(/Tagline/i), { target: { value: "One paste away." } });
    // the expander reflects how many optional fields are filled
    expect(getByText(/3 added/)).toBeInTheDocument();
  });

  it("keeps submit disabled until the required field is filled", async () => {
    const { getByRole, getByLabelText } = renderPage();
    const submit = getByRole("button", { name: /create my link/i });
    expect(submit).toBeDisabled();

    fireEvent.change(getByLabelText("Server URL"), {
      target: { value: "https://example.com/mcp" },
    });

    // the dev Turnstile token is granted on mount, so a filled field is now enough
    await waitFor(() => expect(submit).not.toBeDisabled());
  });

  function mockCreateOk() {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ slug: "my-mcp", editUrl: "https://mcplease.io/e/uuid" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  async function submitValid(page: ReturnType<typeof renderPage>) {
    fireEvent.change(page.getByLabelText("Server URL"), {
      target: { value: "https://example.com/mcp" },
    });
    const submit = page.getByRole("button", { name: /create my link/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);
    return page.findByRole("dialog", { name: "Your link is live" });
  }

  it("creates a link, then gates the connect CTA behind the acknowledgment", async () => {
    const fetchMock = mockCreateOk();
    const page = renderPage();

    const dialog = await submitValid(page);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/links",
      expect.objectContaining({ method: "POST" }),
    );

    const view = within(dialog).getByRole("button", { name: /view my connect page/i });
    expect(view).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("checkbox"));
    expect(view).not.toBeDisabled();

    // clicking through navigates to the connect page, unmounting the form + overlay
    fireEvent.click(view);
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  });

  it("can dismiss the success overlay", async () => {
    mockCreateOk();
    const page = renderPage();

    const dialog = await submitValid(page);
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
  });

  it("surfaces the edge error on a failed create", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: "slug_taken" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const page = renderPage();

    fireEvent.change(page.getByLabelText("Server URL"), {
      target: { value: "https://example.com/mcp" },
    });
    const submit = page.getByRole("button", { name: /create my link/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    expect(await page.findByText(/that slug was just taken/i)).toBeInTheDocument();
    expect(page.queryByRole("dialog")).toBeNull();
  });
});
