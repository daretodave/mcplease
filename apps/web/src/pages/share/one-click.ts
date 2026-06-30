import { getClient, type ClientId } from "@mcplease/client-matrix";
import type { LinkKind, PublicLink } from "@mcplease/model";
import { serverName } from "./clients";

// The one-click "Add" links — the share page's express lane, shown above the always-present manual steps.
// Three clients can be handed off to: Cursor and VS Code via a custom URL scheme (cursor:// / vscode:) that
// opens the app, and Claude via an https://claude.ai link that opens a pre-filled "Add custom connector"
// dialog the reader confirms. None of them can confirm completion back to the page, so the banner only ever
// claims "Opening", never "Added". Every other client is manual-only.

/** How complete a client's one-click is — `full` installs end to end, `partial` finishes in-app. */
export type OneClickMode = "full" | "partial";

/** Whether — and how completely — a client offers one-click for this transport. `partial` (Claude Desktop)
 *  is remote-only; a local (stdio) link only one-clicks where support is `full` (Cursor, VS Code). */
export function oneClickMode(client: ClientId, kind: LinkKind): OneClickMode | null {
  const entry = getClient(client);
  if (!entry || entry.oneClick === "none") return null;
  if (kind === "stdio" && entry.oneClick !== "full") return null;
  return entry.oneClick;
}

/** The install payload — a remote `{ url }`, or a local `{ command, args }` split from the run target. */
function payload(link: PublicLink): Record<string, unknown> {
  if (link.kind === "stdio") {
    // Whitespace-run split (not single-space) so a stray double space doesn't add an empty `""` arg.
    const parts = (link.runTarget || "node dist/server.js").trim().split(/\s+/);
    return { command: parts[0], args: parts.slice(1) };
  }
  return { url: link.serverUrl || "" };
}

/** Base64 of a UTF-8 string. `btoa` only speaks Latin-1, so widen to bytes first. */
function base64Utf8(value: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** The install deep link for a full one-click client (Cursor, VS Code), or `null` when the flow finishes
 *  in-app (Claude Desktop's partial mode) and there's no install URL to hand off. */
export function oneClickHref(client: ClientId, link: PublicLink): string | null {
  const name = serverName(link.name);
  if (client === "cursor") {
    const config = base64Utf8(JSON.stringify(payload(link)));
    return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encodeURIComponent(config)}`;
  }
  if (client === "vscode") {
    // VS Code wants a flat object that hoists `name`; a remote server must also carry `type` so VS Code
    // picks its transport (a local server is inferred from `command`/`args`).
    const obj =
      link.kind === "http" ? { name, type: "http", ...payload(link) } : { name, ...payload(link) };
    return `vscode:mcp/install?${encodeURIComponent(JSON.stringify(obj))}`;
  }
  if (client === "claude-desktop" && link.kind === "http") {
    // Claude has no install URL scheme; its real one-click is a claude.ai link that opens a PRE-FILLED
    // "Add custom connector" dialog the reader reviews and confirms (remote only — a local server is manual
    // config). The reader still authenticates in-app after adding; we only hand off the pre-fill.
    return `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(name)}&connectorUrl=${encodeURIComponent(link.serverUrl || "")}`;
  }
  return null;
}
