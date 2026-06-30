import { track } from "@mcplease/analytics";
import type { PublicLink } from "@mcplease/model";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { data } from "../../lib/data";
import { SharePage } from "./share";

vi.mock("../../lib/data", () => ({ data: { links: { getPublic: vi.fn() } } }));
vi.mock("@mcplease/analytics", () => ({
  track: {
    selectClient: vi.fn(),
    copyCommand: vi.fn(),
    oneClick: vi.fn(),
    copyBadge: vi.fn(),
  },
}));

const getPublic = vi.mocked(data.links.getPublic);

const httpLink: PublicLink = {
  slug: "acme",
  kind: "http",
  serverUrl: "https://acme.dev/mcp",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: "Acme MCP",
  description: null,
  tagline: "One paste away.",
};

function renderShare(slug = "acme") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/${slug}`]}>
        <Routes>
          <Route path="/:slug" element={<SharePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("SharePage", () => {
  it("shows an announced loading state while the link resolves", () => {
    getPublic.mockReturnValue(new Promise<PublicLink | null>(() => {}));
    renderShare();
    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the not-found screen for an unknown slug", async () => {
    getPublic.mockResolvedValue(null);
    renderShare("ghost");
    expect(await screen.findByText("This link doesn’t resolve.")).toBeInTheDocument();
    expect(screen.getByText("mcplease.io/ghost")).toBeInTheDocument();
  });

  it("resolves a link into a header, picker, and the default client's steps", async () => {
    getPublic.mockResolvedValue(httpLink);
    renderShare();
    // The name shows in both the page heading and the badge preview — pin to the heading.
    expect(await screen.findByRole("heading", { name: /Acme MCP/ })).toBeInTheDocument();
    expect(screen.getByText("One paste away.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pick your client" })).toBeInTheDocument();
    const picker = screen.getByRole("radiogroup", { name: "Pick your client" });
    expect(within(picker).getAllByRole("radio")).toHaveLength(10);
    // The default client is Claude Code — its terminal command carries the sanitized name + url.
    // (It shows twice: once drawn in the terminal visual, once in the copy block.)
    expect(
      screen.getAllByText("claude mcp add --transport http acme-mcp https://acme.dev/mcp").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Add a badge to your README")).toBeInTheDocument();
  });

  it("switches client, tracks the choice, and surfaces one-click where supported", async () => {
    getPublic.mockResolvedValue(httpLink);
    renderShare();
    await screen.findByRole("heading", { name: /Acme MCP/ });
    fireEvent.click(screen.getByRole("radio", { name: /Cursor/ }));
    expect(track.selectClient).toHaveBeenCalledWith({ client: "cursor", transport: "http" });
    expect(screen.getByText("Add to Cursor in one click")).toBeInTheDocument();
    expect(screen.getByText("Settings → MCP → Add")).toBeInTheDocument();
  });

  it("renders an announced error state when the fetch fails", async () => {
    getPublic.mockRejectedValue(new Error("boom"));
    renderShare();
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn’t load this link/);
  });
});
