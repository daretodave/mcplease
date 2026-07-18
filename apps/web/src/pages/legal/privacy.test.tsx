import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyPage } from "./privacy";

describe("PrivacyPage", () => {
  it("renders the Privacy page with its seven sections", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent?.replace(/^\d+/, "")),
    ).toEqual([
      "What we store",
      "What we never have",
      "On your device",
      "Anonymous analytics",
      "Who runs the plumbing",
      "Deleting your page",
      "Changes & questions",
    ]);
  });

  it("renders the whole schema as the what-we-store table", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("the links table · the whole database")).toBeInTheDocument();
    const fields = screen.getAllByRole("term").map((dt) => dt.textContent);
    expect(fields).toEqual([
      "slug",
      "kind",
      "server details",
      "name · description · tagline",
      "edit-token hash",
      "timestamps",
    ]);
    expect(screen.getByText(/the token itself is never stored/)).toBeInTheDocument();
  });

  it("names the exact localStorage keys and claims no first-party cookies", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("mcplease-appearance")).toBeInTheDocument();
    expect(screen.getByText("mcplease-last-client")).toBeInTheDocument();
    expect(screen.getByText("no cookies")).toBeInTheDocument();
  });

  it("describes analytics as consent-denied, cookieless, and free of identifying params", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/wired to “denied”/)).toBeInTheDocument();
    expect(screen.getByText(/cookieless and keeps no identifier/)).toBeInTheDocument();
    expect(
      screen.getByText(/a server URL, a slug, or anything that could identify/),
    ).toBeInTheDocument();
  });

  it("links each infrastructure provider's privacy policy", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("link", { name: "Cloudflare" })).toHaveAttribute(
      "href",
      "https://www.cloudflare.com/privacypolicy/",
    );
    expect(screen.getByRole("link", { name: "Supabase" })).toHaveAttribute(
      "href",
      "https://supabase.com/privacy",
    );
    expect(screen.getByRole("link", { name: "Google" })).toHaveAttribute(
      "href",
      "https://policies.google.com/privacy",
    );
  });

  it("explains deletion via the edit link, the soft-delete, and the hard-delete path", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/the slug is freed for\s*anyone to claim/)).toBeInTheDocument();
    expect(screen.getByText(/marked deleted and excluded from every read/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open an issue" })).toHaveAttribute(
      "href",
      "https://github.com/daretodave/mcplease/issues",
    );
  });
});
