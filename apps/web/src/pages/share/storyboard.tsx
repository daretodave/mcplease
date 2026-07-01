import type { ClientId } from "@mcplease/client-matrix";
import type { PublicLink } from "@mcplease/model";
import type { ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { AuthScene } from "../../components/step-visual/auth-scene";
import type { BeatKindName } from "../../components/step-visual/beat-kind";
import { BrowserScene } from "../../components/step-visual/browser-scene";
import { ConfigMock } from "../../components/step-visual/config-mock";
import { MenuMock } from "../../components/step-visual/menu-mock";
import { ModalScene } from "../../components/step-visual/modal-scene";
import { TerminalMock } from "../../components/step-visual/terminal-mock";
import { CONNECT_LABEL, jsonRemoteFor, jsonStdioFor, serverName } from "./clients";

// The storyboard: per client, a short sequence of BEATS that walk the reader Add → Authenticate → connected.
// Each beat pairs a one-line instruction with a client-resembling scene and (where there's something to paste)
// a copy-paste payload. For an http server each client has its own tap-path + authenticate archetype (an
// explicit Connect/Authenticate control, or a browser that opens on its own); for a stdio server every client
// shares clone → build → point-at-it. The scene is orientation; the copy string is the real payload.

/** One beat: an instruction, the client-resembling scene it depicts, an optional archetype chip, and the
 *  copy-paste payload where there is one. */
export interface Beat {
  title: ReactNode;
  sub?: ReactNode;
  /** the archetype chip (authenticate / browser / add / configure), where the beat is one of those moves */
  kind?: BeatKindName;
  scene: ReactNode;
  copy?: { text: string; prompt?: boolean; block?: boolean };
  /** a one-line footnote under the copy block (e.g. the static-token alternative on a config-file beat) */
  note?: ReactNode;
}

/** A client's full storyboard: its beats, and the finish-line copy for the connected cap. */
export interface Storyboard {
  beats: Beat[];
  cap: string;
}

// Tints the server name inside a config scene so the reader's eye lands on the part that's theirs.
const accentName = css({ color: "accent.text" });
function nameLine(prefix: string, name: string, suffix: string): ReactNode {
  return (
    <>
      {prefix}
      <span className={accentName}>{name}</span>
      {suffix}
    </>
  );
}

// The static-token alternative — a footnote on the config beat for config-file clients that also accept a
// token in `headers`, which skips the browser/authenticate step entirely.
const tokenNote: ReactNode = (
  <>
    Prefer a static token? Add it to <code>headers</code> and skip the browser step.
  </>
);

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "acme.dev";
  }
}

/** Build the ordered storyboard for a client + link. */
export function buildStoryboard(client: ClientId, link: PublicLink): Storyboard {
  const name = serverName(link.name);
  const url = link.serverUrl || "https://acme.dev/mcp";
  const host = hostOf(url);

  if (link.kind === "stdio") return stdioStoryboard(client, link, name);

  switch (client) {
    case "claude-code":
      return {
        beats: [
          {
            title: "Run this in your terminal",
            sub: "One command adds the remote server.",
            scene: (
              <TerminalMock
                lines={[
                  {
                    prompt: true,
                    text: `claude mcp add --transport http ${name} ${url}`,
                    caret: true,
                  },
                ]}
              />
            ),
            copy: { text: `claude mcp add --transport http ${name} ${url}`, prompt: true },
          },
          {
            title: (
              <>
                Authorize from the <code>/mcp</code> menu
              </>
            ),
            sub: (
              <>
                Run <code>/mcp</code>, pick the server, press Enter to authenticate.
              </>
            ),
            kind: "auth",
            scene: (
              <TerminalMock
                title="claude · /mcp"
                lines={[
                  { head: true, text: "Manage MCP servers" },
                  { text: name, tag: "needs authentication", tagState: "warn", glow: true },
                  { dim: true, text: "github-mirror", tag: "connected", tagState: "ok" },
                  { dim: true, text: "Enter to authenticate · Esc to cancel" },
                ]}
              />
            ),
          },
        ],
        cap: "Authenticated — connected.",
      };

    case "claude-desktop":
      return {
        beats: [
          {
            title: "Customize → Connectors",
            sub: "Open your avatar menu, then Connectors.",
            scene: (
              <MenuMock
                app="Claude"
                crumb="Connectors"
                items={[
                  { label: "Browse connectors" },
                  { label: "Add custom connector", on: true },
                ]}
              />
            ),
          },
          {
            title: "Paste your server, then Add",
            sub: "Name + URL pre-fill; leave the OAuth fields blank.",
            kind: "add",
            scene: (
              <ModalScene
                fields={[
                  { label: "Name", value: link.name || "Acme MCP", filled: true },
                  { label: "Remote MCP server URL", value: url, filled: true, mono: true },
                ]}
              />
            ),
            copy: { text: url },
          },
          {
            title: "Connect to authenticate",
            sub: "Claude opens the provider’s consent, then returns connected.",
            kind: "auth",
            scene: <AuthScene name={name} url={url} button="Connect" />,
          },
        ],
        cap: "Connected in Claude.",
      };

    case "chatgpt":
      return {
        beats: [
          {
            title: "Developer mode → Connectors → Create",
            sub: "Needs developer mode (a paid tier). Remote URL only.",
            scene: (
              <MenuMock
                app="ChatGPT"
                crumb="Connectors"
                items={[{ label: "Connected apps" }, { label: "Create", on: true }]}
              />
            ),
            copy: { text: url },
          },
          {
            title: "A browser opens to authorize",
            sub: "The OAuth popup launches on its own — click Allow.",
            kind: "browser",
            scene: <BrowserScene name={name} host={host} />,
          },
        ],
        cap: "Authorized — connected.",
      };

    case "cursor":
      return {
        beats: [
          {
            title: "Settings → Tools & Integrations → Add",
            sub: (
              <>
                Or drop it into <code>~/.cursor/mcp.json</code>.
              </>
            ),
            scene: (
              <MenuMock
                app="Cursor"
                crumb="Tools & Integrations"
                items={[
                  { label: "Installed servers", right: "2" },
                  { label: "Add custom MCP", on: true },
                ]}
              />
            ),
            copy: { text: jsonRemoteFor("cursor", name, url), block: true },
          },
          {
            title: "Click Connect to authenticate",
            sub: "Cursor shows a Connect control, then the browser consent.",
            kind: "auth",
            scene: <AuthScene name={name} url={url} button="Connect" />,
          },
        ],
        cap: "Connected in Cursor.",
      };

    case "vscode":
      return {
        beats: [
          {
            title: (
              <>
                Add the server to <code>.vscode/mcp.json</code>
              </>
            ),
            sub: (
              <>
                Run <code>MCP: Add Server…</code> → HTTP → paste the URL, or edit the file — VS Code
                keys servers under <code>servers</code>.
              </>
            ),
            kind: "add",
            scene: (
              <ConfigMock
                file=".vscode/mcp.json"
                lines={[
                  "{",
                  '  "servers": {',
                  nameLine('    "', name, `": { "type": "http", "url": "${url}" }`),
                  "  }",
                  "}",
                ]}
              />
            ),
            copy: { text: jsonRemoteFor("vscode", name, url), block: true },
          },
          {
            title: "Trust dialog → browser opens",
            sub: "Approve trust, then the OAuth page launches itself.",
            kind: "browser",
            scene: <BrowserScene name={name} host={host} trust />,
          },
        ],
        cap: "Trusted & authorized — connected.",
      };

    case "windsurf":
      return {
        beats: [
          {
            title: "Settings → MCP → Add custom server",
            sub: (
              <>
                Windsurf keys the URL as <code>serverUrl</code>.
              </>
            ),
            scene: (
              <MenuMock
                app="Windsurf"
                crumb="Cascade · MCP"
                items={[{ label: "Manage plugins" }, { label: "Add custom server", on: true }]}
              />
            ),
            copy: { text: jsonRemoteFor("windsurf", name, url), block: true },
          },
          {
            title: "Refresh → browser consent opens",
            sub: "Hit refresh; the consent page opens on its own.",
            kind: "browser",
            scene: <BrowserScene name={name} host={host} />,
          },
        ],
        cap: "Consent granted — connected.",
      };

    case "cline":
      return {
        beats: [
          {
            title: "MCP Servers → Remote → Add",
            sub: (
              <>
                Transport = Streamable HTTP; keyed in <code>cline_mcp_settings.json</code>.
              </>
            ),
            scene: (
              <MenuMock
                app="Cline"
                crumb="MCP Servers"
                items={[{ label: "Installed" }, { label: "Remote · Add server", on: true }]}
              />
            ),
            copy: { text: jsonRemoteFor("cline", name, url), block: true },
          },
          {
            title: "Click Authenticate",
            sub: "Cline shows an Authenticate button, then the browser.",
            kind: "auth",
            scene: <AuthScene name={name} url={url} button="Authenticate" />,
          },
        ],
        cap: "Connected in Cline.",
      };

    case "zed":
      return {
        beats: [
          {
            title: (
              <>
                Run <code>agent: add context server</code>
              </>
            ),
            sub: (
              <>
                Zed calls them <code>context_servers</code>.
              </>
            ),
            scene: (
              <ConfigMock
                file="settings.json"
                lines={[
                  "{",
                  '  "context_servers": {',
                  nameLine('    "', name, `": { "url": "${url}" }`),
                  "  }",
                  "}",
                ]}
              />
            ),
            copy: { text: jsonRemoteFor("zed", name, url), block: true },
            note: tokenNote,
          },
          {
            title: "Click Authenticate",
            sub: "Zed shows an Authenticate button next to the server.",
            kind: "auth",
            scene: <AuthScene name={name} url={url} button="Authenticate" />,
          },
        ],
        cap: "Connected in Zed.",
      };

    case "goose":
      return {
        beats: [
          {
            title: "Extensions → Add custom extension",
            sub: "Choose Streamable HTTP, paste the URL.",
            scene: (
              <MenuMock
                app="Goose"
                crumb="Extensions"
                items={[
                  { label: "Built-in extensions" },
                  { label: "Add custom · Streamable HTTP", on: true },
                ]}
              />
            ),
            copy: { text: url },
          },
          {
            title: "Browser OAuth opens",
            sub: "The consent page launches itself — click Allow.",
            kind: "browser",
            scene: <BrowserScene name={name} host={host} />,
          },
        ],
        cap: "Authorized — connected.",
      };

    default: // generic / anywhere
      return {
        beats: [
          {
            title: "Use the URL + canonical JSON",
            sub: "Works in any MCP client.",
            scene: (
              <ConfigMock
                file="mcpServers"
                lines={[
                  "{",
                  '  "mcpServers": {',
                  nameLine('    "', name, `": { "url": "${url}", "type": "http" }`),
                  "  }",
                  "}",
                ]}
              />
            ),
            copy: { text: jsonRemoteFor("generic", name, url), block: true },
            note: tokenNote,
          },
          {
            title: "On 401, a browser opens to authorize",
            sub: "If the server is protected, OAuth launches itself.",
            kind: "browser",
            scene: <BrowserScene name={name} host={host} />,
          },
        ],
        cap: "Connected anywhere.",
      };
  }
}

/** The stdio path — clone → build → point the client's local config at it. The run-config file + key differ
 *  per client (VS Code's `servers` + `"type": "stdio"`, Zed's `context_servers`), which the copy payload and
 *  the shown lines both honor so they never diverge. */
function stdioStoryboard(client: ClientId, link: PublicLink, name: string): Storyboard {
  const repo = link.repoUrl || "https://github.com/you/your-mcp";
  const build = link.buildCmd || "npm install && npm run build";
  const run = link.runTarget || "node dist/server.js";
  const parts = run.trim().split(/\s+/);
  const file =
    client === "claude-desktop"
      ? "claude_desktop_config.json"
      : client === "vscode"
        ? ".vscode/mcp.json"
        : client === "cursor"
          ? "~/.cursor/mcp.json"
          : client === "zed"
            ? "settings.json"
            : "mcp config";
  const rootKey =
    client === "vscode" ? "servers" : client === "zed" ? "context_servers" : "mcpServers";
  const typeLine = client === "vscode";

  return {
    beats: [
      {
        title: "Clone the repo",
        sub: "Pull the source down to your machine.",
        scene: <TerminalMock lines={[{ prompt: true, text: `git clone ${repo}`, caret: true }]} />,
        copy: { text: `git clone ${repo}`, prompt: true },
      },
      {
        title: "Build it once",
        sub: "The author’s build step — run it after cloning.",
        scene: (
          <TerminalMock
            title="build"
            lines={[
              { prompt: true, text: build },
              { dim: true, text: "✓ built dist/server.js" },
            ]}
          />
        ),
        copy: { text: build, prompt: true },
      },
      {
        title: <>Point {CONNECT_LABEL[client]} at the local server</>,
        sub: (
          <>
            Drop this into <code>{file}</code>, then restart {CONNECT_LABEL[client]}.
          </>
        ),
        kind: "run",
        scene: (
          <ConfigMock
            file={file}
            lines={[
              "{",
              `  "${rootKey}": {`,
              nameLine('    "', name, '": {'),
              ...(typeLine ? ['      "type": "stdio",'] : []),
              `      "command": "${parts[0]}",`,
              `      "args": [${parts
                .slice(1)
                .map((a) => `"${a}"`)
                .join(", ")}]`,
              "    }",
              "  }",
              "}",
            ]}
          />
        ),
        copy: { text: jsonStdioFor(client, name, run), block: true },
      },
    ],
    cap: "Restarted? You’re connected.",
  };
}
