import { CLIENT_IDS } from "@mcplease/client-matrix";
import { describe, expect, it } from "vitest";
import { CONNECT_LABEL, jsonRemote, jsonStdio, serverName } from "./clients";

describe("serverName", () => {
  it("lowercases and dashes a display name", () => {
    expect(serverName("Acme MCP")).toBe("acme-mcp");
  });

  it("collapses punctuation to dashes but keeps letters and digits", () => {
    expect(serverName("My Cool Server!")).toBe("my-cool-server-");
  });

  it("falls back to 'server' when there's no name", () => {
    expect(serverName(null)).toBe("server");
    expect(serverName("")).toBe("server");
  });
});

describe("json builders", () => {
  it("formats a remote snippet with the default url key", () => {
    expect(jsonRemote("acme", "https://x.dev/mcp")).toBe(
      `{\n  "mcpServers": {\n    "acme": { "url": "https://x.dev/mcp" }\n  }\n}`,
    );
  });

  it("honors a serverUrl key (Windsurf)", () => {
    expect(jsonRemote("acme", "https://x.dev/mcp", "serverUrl")).toContain(
      `"serverUrl": "https://x.dev/mcp"`,
    );
  });

  it("splits a run target into command and args", () => {
    const json = jsonStdio("acme", "node dist/server.js --flag");
    expect(json).toContain(`"command": "node"`);
    expect(json).toContain(`"args": ["dist/server.js", "--flag"]`);
  });

  it("collapses whitespace runs so a stray double space adds no empty arg", () => {
    expect(jsonStdio("acme", "node  dist/server.js")).toContain(`"args": ["dist/server.js"]`);
  });

  it('emits an empty args array (not [""]) for a bare command', () => {
    const json = jsonStdio("acme", "myserver");
    expect(json).toContain(`"command": "myserver"`);
    expect(json).toContain(`"args": []`);
    expect(json).not.toContain(`"args": [""]`);
  });
});

describe("CONNECT_LABEL", () => {
  it("names every client in the matrix", () => {
    for (const id of CLIENT_IDS) expect(CONNECT_LABEL[id]).toBeTruthy();
  });
});
