import type { ClientId, RemoteConfigKey } from "@mcplease/client-matrix";

// The display vocabulary + JSON-snippet builders the share page's steps, one-click banner, and badge panel
// share. The "connect label" is the short, in-sentence name a client goes by ("VS Code", "any MCP client") —
// deliberately distinct from the picker's fuller label ("VS Code (Copilot)") — so headings and banner copy
// read like prose, not a settings list.

/** Where the share page remembers your last-picked client, so a return visit opens on it. */
export const LAST_CLIENT_KEY = "mcplease-last-client";

/** The short, in-sentence name for each client — used in headings, the one-click banner, and step titles. */
export const CONNECT_LABEL: Record<ClientId, string> = {
  "claude-code": "Claude Code",
  "claude-desktop": "Claude Desktop",
  chatgpt: "ChatGPT",
  cursor: "Cursor",
  vscode: "VS Code",
  windsurf: "Windsurf",
  cline: "Cline",
  zed: "Zed",
  goose: "Goose",
  generic: "any MCP client",
};

/** Fold a display name into a config-safe server key — only [a-z0-9-], lowercased, with a sensible default
 *  so an unnamed link still yields a clean `"server"` in every snippet. */
export function serverName(name: string | null): string {
  return (name || "server").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

/** The canonical `mcpServers` snippet for a remote (http) server. `key` is the client's URL field — most
 *  take `url`, Windsurf takes `serverUrl` — which is exactly the per-client difference mcplease hides. */
export function jsonRemote(name: string, url: string, key: RemoteConfigKey = "url"): string {
  return `{\n  "mcpServers": {\n    "${name}": { "${key}": "${url}" }\n  }\n}`;
}

/** The canonical `mcpServers` snippet for a local (stdio) server, splitting the run target into the
 *  launch command and its argument list. */
export function jsonStdio(name: string, run: string): string {
  // Split on whitespace runs (not a single space) so a stray double space in the run target doesn't
  // inject an empty `""` argument into the launched argv.
  const parts = run.trim().split(/\s+/);
  const args = parts
    .slice(1)
    .map((a) => `"${a}"`)
    .join(", ");
  return `{\n  "mcpServers": {\n    "${name}": {\n      "command": "${parts[0]}",\n      "args": [${args}]\n    }\n  }\n}`;
}
