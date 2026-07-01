import type { ClientId } from "@mcplease/client-matrix";
import type { PublicLink } from "@mcplease/model";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildStoryboard } from "./storyboard";

function link(over: Partial<PublicLink> = {}): PublicLink {
  return {
    slug: "acme",
    kind: "http",
    serverUrl: "https://acme.dev/mcp",
    repoUrl: null,
    buildCmd: null,
    runTarget: null,
    name: "Acme MCP",
    description: null,
    tagline: null,
    ...over,
  };
}

const HTTP_CLIENTS: ClientId[] = [
  "claude-code",
  "claude-desktop",
  "chatgpt",
  "cursor",
  "vscode",
  "windsurf",
  "cline",
  "zed",
  "goose",
  "generic",
];

// The copy payloads across a client's beats, joined — handy for asserting a key appears somewhere in the flow.
function payloads(client: ClientId): string {
  return buildStoryboard(client, link())
    .beats.map((b) => b.copy?.text ?? "")
    .join("\n");
}

describe("buildStoryboard — every http flow ends on connected", () => {
  it("gives each http client at least two beats and a connected cap", () => {
    for (const c of HTTP_CLIENTS) {
      const s = buildStoryboard(c, link());
      expect(s.beats.length).toBeGreaterThanOrEqual(2);
      expect(s.cap.length).toBeGreaterThan(0);
    }
  });
});

describe("buildStoryboard — the per-client config keys (the blockers the redesign fixes)", () => {
  it("Cursor pastes the canonical mcpServers.url", () => {
    expect(payloads("cursor")).toContain(`"mcpServers"`);
    expect(payloads("cursor")).toContain(`"url": "https://acme.dev/mcp"`);
  });

  it("VS Code keys http under top-level `servers` with a type (never mcpServers)", () => {
    const p = payloads("vscode");
    expect(p).toContain(`"servers"`);
    expect(p).not.toContain(`"mcpServers"`);
    expect(p).toContain(`"type": "http"`);
  });

  it("Cline uses a streamableHttp type", () => {
    expect(payloads("cline")).toContain(`"type": "streamableHttp"`);
  });

  it("Zed keys under context_servers", () => {
    expect(payloads("zed")).toContain(`"context_servers"`);
  });

  it("Windsurf keys the URL as serverUrl", () => {
    expect(payloads("windsurf")).toContain(`"serverUrl"`);
  });

  it("Generic carries an explicit http type", () => {
    expect(payloads("generic")).toContain(`"type": "http"`);
  });

  it("Claude Code's first beat is the CLI add command", () => {
    const s = buildStoryboard("claude-code", link());
    expect(s.beats[0]?.copy?.text).toBe(
      "claude mcp add --transport http acme-mcp https://acme.dev/mcp",
    );
  });

  it("tolerates a malformed server url (host falls back rather than throwing)", () => {
    const s = buildStoryboard("chatgpt", link({ serverUrl: "not a url" }));
    expect(s.beats.length).toBeGreaterThan(0);
  });
});

describe("buildStoryboard — the authenticate beat", () => {
  it("marks an explicit-control auth beat for the Connect/Authenticate clients", () => {
    // claude-code included: its /mcp beat is the archetype chip the whole redesign exists to surface, and
    // it's the default client, so an unguarded drop would silently ship on the first screen shown.
    for (const c of ["claude-code", "cursor", "claude-desktop", "cline", "zed"] as ClientId[]) {
      expect(buildStoryboard(c, link()).beats.map((b) => b.kind)).toContain("auth");
    }
  });

  it("surfaces the static-token footnote on the config-file clients (Zed + Generic)", () => {
    expect(buildStoryboard("zed", link()).beats[0]?.note).toBeTruthy();
    expect(buildStoryboard("generic", link()).beats[0]?.note).toBeTruthy();
  });

  it("marks a browser auth beat for the auto-launch clients", () => {
    for (const c of ["chatgpt", "vscode", "windsurf", "goose", "generic"] as ClientId[]) {
      expect(buildStoryboard(c, link()).beats.map((b) => b.kind)).toContain("browser");
    }
  });

  it("walks Claude through Customize → Add modal → Connect (three beats)", () => {
    const s = buildStoryboard("claude-desktop", link());
    expect(s.beats).toHaveLength(3);
    expect(s.beats[2]?.kind).toBe("auth");
    expect(s.cap).toContain("Claude");
  });
});

describe("buildStoryboard — stdio walks clone → build → run", () => {
  it("gives three run beats keyed to the client's config", () => {
    const s = buildStoryboard(
      "cursor",
      link({
        kind: "stdio",
        serverUrl: null,
        repoUrl: "https://github.com/you/acme",
        buildCmd: "npm run build",
        runTarget: "node dist/server.js",
      }),
    );
    expect(s.beats).toHaveLength(3);
    expect(s.beats[0]?.copy?.text).toBe("git clone https://github.com/you/acme");
    expect(s.beats[1]?.copy?.text).toBe("npm run build");
    expect(s.beats[2]?.copy?.text).toContain(`"mcpServers"`);
    expect(s.beats[2]?.copy?.text).toContain(`"command": "node"`);
  });

  it("keys VS Code's stdio run-config under `servers` with a stdio type", () => {
    const s = buildStoryboard(
      "vscode",
      link({ kind: "stdio", serverUrl: null, runTarget: "node dist/server.js" }),
    );
    const run = s.beats[2]?.copy?.text ?? "";
    expect(run).toContain(`"servers"`);
    expect(run).toContain(`"type": "stdio"`);
  });

  it("keys Zed's stdio run-config under context_servers", () => {
    const s = buildStoryboard("zed", link({ kind: "stdio", serverUrl: null }));
    expect(s.beats[2]?.copy?.text).toContain(`"context_servers"`);
  });

  it("points Claude's stdio at claude_desktop_config.json without throwing", () => {
    const s = buildStoryboard("claude-desktop", link({ kind: "stdio", serverUrl: null }));
    expect(s.beats[2]?.copy?.text).toContain(`"mcpServers"`);
  });

  it("falls back to sensible defaults when the stdio trio is empty", () => {
    const s = buildStoryboard("generic", link({ kind: "stdio", serverUrl: null }));
    expect(s.beats[0]?.copy?.text).toContain("git clone");
    expect(s.beats[2]?.copy?.text).toContain("mcpServers");
  });
});

describe("buildStoryboard — the depicted scene never drifts from the copied payload", () => {
  // Each config beat writes its root key in TWO independent places: the ConfigMock picture (hardcoded scene
  // lines) and the copy payload (json*For builder). A reader who hand-types from the picture must get the
  // same key they'd have pasted, so render the scene and assert it shows the root key the copy carries.
  function rootKey(json: string): string | null {
    const m = json.match(/"(mcpServers|servers|context_servers)"/);
    return m ? m[1]! : null;
  }

  const cases: Array<[ClientId, PublicLink]> = [
    ["vscode", link()],
    ["zed", link()],
    ["generic", link()],
    ["cursor", link({ kind: "stdio", serverUrl: null })],
    ["vscode", link({ kind: "stdio", serverUrl: null })],
    ["zed", link({ kind: "stdio", serverUrl: null })],
  ];

  for (const [client, l] of cases) {
    it(`${client} (${l.kind}) depicts the same root key it pastes`, () => {
      for (const beat of buildStoryboard(client, l).beats) {
        if (!beat.copy?.block) continue;
        const key = rootKey(beat.copy.text);
        if (!key) continue;
        const { container, unmount } = render(<>{beat.scene}</>);
        expect(container.textContent).toContain(`"${key}"`);
        unmount();
      }
    });
  }
});
