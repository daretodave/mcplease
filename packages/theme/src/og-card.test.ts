import { describe, it, expect } from "vitest";
import { buildShareMeta } from "./og-card.js";

const origin = "https://mcplease.io";

describe("buildShareMeta", () => {
  it("uses the link name + description when present", () => {
    const meta = buildShareMeta(
      { name: "Acme MCP", tagline: "tag", description: "The Acme server." },
      "acme",
      origin,
    );
    expect(meta.title).toBe("Acme MCP · mcplease");
    expect(meta.description).toBe("The Acme server.");
    expect(meta.image).toBe("https://mcplease.io/og/acme.png");
    expect(meta.imageAlt).toBe("Connect to Acme MCP");
    expect(meta.url).toBe("https://mcplease.io/acme");
  });

  it("falls back to the tagline, then a default, for the description", () => {
    expect(
      buildShareMeta({ name: "Acme", tagline: "Tag line", description: null }, "acme", origin)
        .description,
    ).toBe("Tag line");
    expect(
      buildShareMeta({ name: "Acme", tagline: null, description: "  " }, "acme", origin)
        .description,
    ).toContain("Pick your client");
  });

  it("falls back to a generic title when the link has no name", () => {
    const meta = buildShareMeta({ name: "  ", tagline: null, description: null }, "x", origin);
    expect(meta.title).toBe("Connect to an MCP server · mcplease");
    expect(meta.imageAlt).toBe("Connect to an MCP server");
  });

  it("renders a neutral not-found card for an unknown slug", () => {
    const meta = buildShareMeta(null, "ghost", origin);
    expect(meta.title).toBe("Link not found · mcplease");
    expect(meta.image).toBe("https://mcplease.io/og-default.png");
    expect(meta.url).toBe("https://mcplease.io/ghost");
  });
});
