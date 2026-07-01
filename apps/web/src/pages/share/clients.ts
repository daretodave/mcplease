import type { ClientId } from "@mcplease/client-matrix";

// The display vocabulary + JSON-snippet builders the share page's storyboard, one-click banner, and badge
// panel share. The "connect label" is the short, in-sentence name a client goes by ("Claude", "any MCP
// client") — deliberately distinct from the picker's fuller label — so headings and banner copy read like
// prose. The JSON builders key each snippet the way THAT client actually wants it (top-level `servers` for VS
// Code, `context_servers` for Zed, a `streamableHttp` type for Cline) — exactly the per-client difference
// mcplease hides.

/** Where the share page remembers your last-picked client, so a return visit opens on it. */
export const LAST_CLIENT_KEY = "mcplease-last-client";

/** The short, in-sentence name for each client — used in headings, the one-click banner, and beat titles. */
export const CONNECT_LABEL: Record<ClientId, string> = {
  "claude-code": "Claude Code",
  "claude-desktop": "Claude",
  chatgpt: "ChatGPT",
  cursor: "Cursor",
  vscode: "VS Code",
  windsurf: "Windsurf",
  cline: "Cline",
  zed: "Zed",
  goose: "Goose",
  generic: "any MCP client",
};

/** Fold a display name into a config-safe server key: dash out anything non-alphanumeric, collapse dash runs,
 *  trim edge dashes, then re-default. The trim + re-default matter — a name like ".NET MCP" or "@scope/pkg"
 *  must not become a leading-dash key ("-net-mcp"), which reads as a flag in `claude mcp add <name>` and
 *  breaks the copy-paste; an all-symbol name folds back to a clean "server" rather than a bare "-". */
export function serverName(name: string | null): string {
  return (
    (name || "server")
      .replace(/[^a-z0-9-]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "server"
  );
}

/** The remote (http) config snippet, keyed and typed the way each client actually wants it — the per-client
 *  difference mcplease abstracts away. */
export function jsonRemoteFor(client: ClientId, name: string, url: string): string {
  switch (client) {
    case "vscode":
      // VS Code's .vscode/mcp.json uses a top-level `servers` key, and a remote server must carry `type`.
      return `{\n  "servers": {\n    "${name}": { "type": "http", "url": "${url}" }\n  }\n}`;
    case "cline":
      // Cline selects the transport with a `type` — Streamable HTTP for a remote URL.
      return `{\n  "mcpServers": {\n    "${name}": { "type": "streamableHttp", "url": "${url}" }\n  }\n}`;
    case "zed":
      // Zed calls them `context_servers`.
      return `{\n  "context_servers": {\n    "${name}": { "url": "${url}" }\n  }\n}`;
    case "windsurf":
      // Windsurf keys the URL as `serverUrl`.
      return `{\n  "mcpServers": {\n    "${name}": { "serverUrl": "${url}" }\n  }\n}`;
    case "generic":
      // The most portable form — the canonical `mcpServers` with an explicit http `type`.
      return `{\n  "mcpServers": {\n    "${name}": { "url": "${url}", "type": "http" }\n  }\n}`;
    default:
      // Cursor, Claude, and the rest: the canonical `mcpServers.url`.
      return `{\n  "mcpServers": {\n    "${name}": { "url": "${url}" }\n  }\n}`;
  }
}

/** The local (stdio) run-config snippet, keyed and typed per client. VS Code's file uses top-level `servers`
 *  with an explicit `"type": "stdio"`; Zed uses `context_servers`; everyone else the canonical `mcpServers`. */
export function jsonStdioFor(client: ClientId, name: string, run: string): string {
  // Split on whitespace runs (not a single space) so a stray double space in the run target doesn't inject
  // an empty `""` argument into the launched argv.
  const parts = run.trim().split(/\s+/);
  const args = parts
    .slice(1)
    .map((a) => `"${a}"`)
    .join(", ");
  const rootKey =
    client === "vscode" ? "servers" : client === "zed" ? "context_servers" : "mcpServers";
  const typeLine = client === "vscode" ? '      "type": "stdio",\n' : "";
  return `{\n  "${rootKey}": {\n    "${name}": {\n${typeLine}      "command": "${parts[0]}",\n      "args": [${args}]\n    }\n  }\n}`;
}
