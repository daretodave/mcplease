import type { PublicLink } from "@mcplease/model";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BadgePanel } from "./badge-panel";

const link: PublicLink = {
  slug: "acme",
  kind: "http",
  serverUrl: "https://acme.dev/mcp",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: "Acme MCP",
  description: null,
  tagline: null,
};

describe("BadgePanel", () => {
  it("previews the connect and info shields", () => {
    render(<BadgePanel link={link} onCopyBadge={() => {}} />);
    expect(screen.getByText("Connect to MCP")).toBeInTheDocument();
    expect(screen.getByText("Acme MCP")).toBeInTheDocument();
  });

  it("defaults to the Markdown embed", () => {
    render(<BadgePanel link={link} onCopyBadge={() => {}} />);
    expect(
      screen.getByText(
        "[![Connect to MCP](https://mcplease.io/badge/acme.svg)](https://mcplease.io/acme)",
      ),
    ).toBeInTheDocument();
  });

  it("switches the embed to the bare URL", () => {
    render(<BadgePanel link={link} onCopyBadge={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "URL" }));
    expect(screen.getByText("https://mcplease.io/acme")).toBeInTheDocument();
  });

  it("fires the copy hook when the embed is copied", () => {
    const onCopyBadge = vi.fn();
    render(<BadgePanel link={link} onCopyBadge={onCopyBadge} />);
    fireEvent.click(screen.getByRole("button", { name: /Copy Markdown/ }));
    expect(onCopyBadge).toHaveBeenCalledTimes(1);
  });

  it("shows the not-found degraded shield", () => {
    render(<BadgePanel link={link} onCopyBadge={() => {}} />);
    expect(screen.getByText("link not found")).toBeInTheDocument();
  });

  it("falls back to the slug when the link has no name", () => {
    render(<BadgePanel link={{ ...link, name: null }} onCopyBadge={() => {}} />);
    expect(screen.getByText("acme")).toBeInTheDocument();
  });
});
