import { CLIENT_IDS } from "@mcplease/client-matrix";
import { describe, expect, it } from "vitest";
import { CONNECT_LABEL, jsonRemoteFor, jsonStdioFor, serverName } from "./clients";

describe("serverName", () => {
  it("lowercases and dashes a display name", () => {
    expect(serverName("Acme MCP")).toBe("acme-mcp");
  });

  it("collapses dash runs and trims edge dashes", () => {
    expect(serverName("My Cool Server!")).toBe("my-cool-server");
    expect(serverName("Acme (v2)")).toBe("acme-v2");
  });

  it("never emits a leading dash (which would read as a flag in `claude mcp add <name>`)", () => {
    expect(serverName(".NET MCP")).toBe("net-mcp");
    expect(serverName("@scope/pkg")).toBe("scope-pkg");
  });

  it("falls back to 'server' for an empty or all-symbol name", () => {
    expect(serverName(null)).toBe("server");
    expect(serverName("")).toBe("server");
    expect(serverName("!!!")).toBe("server");
  });
});

describe("jsonRemoteFor — the per-client remote config keys", () => {
  const url = "https://x.dev/mcp";

  it("uses the canonical mcpServers.url for Cursor and Claude", () => {
    expect(jsonRemoteFor("cursor", "acme", url)).toBe(
      `{\n  "mcpServers": {\n    "acme": { "url": "${url}" }\n  }\n}`,
    );
    expect(jsonRemoteFor("claude-desktop", "acme", url)).toContain(`"mcpServers"`);
  });

  it("keys VS Code under top-level `servers` with an http type (not mcpServers)", () => {
    const json = jsonRemoteFor("vscode", "acme", url);
    expect(json).toContain(`"servers": {`);
    expect(json).not.toContain(`"mcpServers"`);
    expect(json).toContain(`"type": "http"`);
  });

  it("keeps Cline under the mcpServers root, with a streamableHttp type", () => {
    const json = jsonRemoteFor("cline", "acme", url);
    expect(json).toContain(`"mcpServers"`);
    expect(json).toContain(`"type": "streamableHttp"`);
  });

  it("keys Zed under context_servers", () => {
    expect(jsonRemoteFor("zed", "acme", url)).toContain(`"context_servers"`);
  });

  it("keeps Windsurf under the mcpServers root, keying its URL as serverUrl", () => {
    const json = jsonRemoteFor("windsurf", "acme", url);
    expect(json).toContain(`"mcpServers"`);
    expect(json).toContain(`"serverUrl": "${url}"`);
  });

  it("keeps the generic snippet under the mcpServers root, with an explicit http type", () => {
    const json = jsonRemoteFor("generic", "acme", url);
    expect(json).toContain(`"mcpServers"`);
    expect(json).toContain(`"url": "${url}", "type": "http"`);
  });
});

describe("jsonStdioFor — the per-client run config", () => {
  it("splits a run target into command and args", () => {
    const json = jsonStdioFor("cursor", "acme", "node dist/server.js --flag");
    expect(json).toContain(`"command": "node"`);
    expect(json).toContain(`"args": ["dist/server.js", "--flag"]`);
  });

  it("collapses whitespace runs so a stray double space adds no empty arg", () => {
    expect(jsonStdioFor("cursor", "acme", "node  dist/server.js")).toContain(
      `"args": ["dist/server.js"]`,
    );
  });

  it('emits an empty args array (not [""]) for a bare command', () => {
    const json = jsonStdioFor("cursor", "acme", "myserver");
    expect(json).toContain(`"command": "myserver"`);
    expect(json).toContain(`"args": []`);
    expect(json).not.toContain(`"args": [""]`);
  });

  it("keys VS Code under `servers` with a stdio type", () => {
    const json = jsonStdioFor("vscode", "acme", "node dist/server.js");
    expect(json).toContain(`"servers": {`);
    expect(json).toContain(`"type": "stdio"`);
  });

  it("keys Zed under context_servers", () => {
    expect(jsonStdioFor("zed", "acme", "node dist/server.js")).toContain(`"context_servers"`);
  });

  it("uses mcpServers for the rest", () => {
    expect(jsonStdioFor("cursor", "acme", "node dist/server.js")).toContain(`"mcpServers"`);
  });
});

describe("CONNECT_LABEL", () => {
  it("names every client in the matrix", () => {
    for (const id of CLIENT_IDS) expect(CONNECT_LABEL[id]).toBeTruthy();
  });

  it("labels claude-desktop 'Claude' (the connector lives on the account)", () => {
    expect(CONNECT_LABEL["claude-desktop"]).toBe("Claude");
  });
});
