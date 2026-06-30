// The client matrix — a typed, tested table the share page reads. Each row declares the transports a
// client supports, a short description of the MANUAL mechanism the image-driven steps depict, whether a
// ONE-CLICK deep-link install exists, and (where it differs) the config key the client uses for a
// remote server URL — `url` here, `serverUrl` there — which is exactly the difference mcplease abstracts
// away. The EXACT command/deep-link strings are filled in (and verified) when the share page is built;
// this is the structural source of truth.

import type { LinkKind } from "@mcplease/model";

/** The connect targets, in picker order. */
export const CLIENT_IDS = [
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
] as const;

export type ClientId = (typeof CLIENT_IDS)[number];

/** Whether a one-click deep-link install exists, and how complete it is. */
export type OneClick = "none" | "partial" | "full";

/** The JSON config key a client uses for a remote server URL — the per-client difference mcplease
 *  hides. `undefined` for CLI-only / stdio-only / raw-snippet targets. */
export type RemoteConfigKey = "url" | "serverUrl";

export interface ClientEntry {
  id: ClientId;
  /** human label shown in the picker */
  label: string;
  /** supports a remote `http` server */
  http: boolean;
  /** supports a local `stdio` server */
  stdio: boolean;
  /** a short description of the manual mechanism the image-driven steps resemble */
  manual: string;
  /** whether a one-click deep-link install exists */
  oneClick: OneClick;
  /** the remote-URL config key, where the client takes a JSON config */
  remoteConfigKey?: RemoteConfigKey;
}

/** The ten rows. */
export const CLIENTS: readonly ClientEntry[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    http: true,
    stdio: true,
    manual:
      "CLI: claude mcp add --transport http <name> <url> (stdio: claude mcp add <name> -- <cmd>); auth via /mcp",
    oneClick: "none",
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    http: true,
    stdio: true,
    manual: "Settings → Connectors (remote URL); or claude_desktop_config.json mcpServers.<name>",
    oneClick: "partial",
    remoteConfigKey: "url",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    http: true,
    stdio: false,
    manual:
      "Settings → Connectors → add custom MCP (remote URL); needs developer mode / a paid tier",
    oneClick: "none",
  },
  {
    id: "cursor",
    label: "Cursor",
    http: true,
    stdio: true,
    manual: "Settings → MCP → Add; ~/.cursor/mcp.json (url / command)",
    oneClick: "full",
    remoteConfigKey: "url",
  },
  {
    id: "vscode",
    label: "VS Code (Copilot)",
    http: true,
    stdio: true,
    manual: "code --add-mcp '{…}'; or .vscode/mcp.json",
    oneClick: "full",
    remoteConfigKey: "url",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    http: true,
    stdio: true,
    manual: "Settings → Cascade → MCP → Add custom; mcp_config.json (serverUrl / command)",
    oneClick: "none",
    remoteConfigKey: "serverUrl",
  },
  {
    id: "cline",
    label: "Cline",
    http: true,
    stdio: true,
    manual: "MCP Servers panel; cline_mcp_settings.json mcpServers.<name>",
    oneClick: "none",
    remoteConfigKey: "url",
  },
  {
    id: "zed",
    label: "Zed",
    http: true,
    stdio: true,
    manual: "settings.json → context_servers.<name> (command)",
    oneClick: "none",
  },
  {
    id: "goose",
    label: "Goose",
    http: true,
    stdio: true,
    manual: "goose configure → add extension (SSE remote / command stdio)",
    oneClick: "none",
  },
  {
    id: "generic",
    label: "Generic / Anywhere",
    http: true,
    stdio: true,
    manual: "Raw URL + a canonical mcpServers JSON snippet (both forms)",
    oneClick: "none",
  },
];

/** Look a client up by id. */
export function getClient(id: ClientId): ClientEntry | undefined {
  return CLIENTS.find((c) => c.id === id);
}

/** The clients that support a given transport — a `stdio` link hides remote-only ChatGPT; an `http`
 *  link shows everyone. Returned in picker order. */
export function clientsForTransport(kind: LinkKind): readonly ClientEntry[] {
  return CLIENTS.filter((c) => (kind === "http" ? c.http : c.stdio));
}
