import type { ClientId } from "@mcplease/client-matrix";
import type { PublicLink } from "@mcplease/model";
import type { ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { ConfigMock } from "../../components/step-visual/config-mock";
import { MenuMock } from "../../components/step-visual/menu-mock";
import { TerminalMock } from "../../components/step-visual/terminal-mock";
import { CONNECT_LABEL, jsonRemote, jsonStdio, serverName } from "./clients";

// The image-driven instructions, built per client from the link. For a remote (http) server each client
// has its own mechanism — a CLI line, a settings menu, or a config file — so the visual resembles THAT
// client's own surface. For a local (stdio) server every client shares the same clone → build → point-at-it
// shape. The copy-paste command beneath each step is the real payload; the visual is just orientation.

/** A single connect step: a heading, an optional inline-code description, the resembling visual, and the
 *  copy-paste command (with `prompt`/`block` controlling how the command renders). */
export interface ShareStep {
  title: ReactNode;
  description?: ReactNode;
  visual?: ReactNode;
  command: string;
  prompt?: boolean;
  block?: boolean;
}

// Tints the server name inside a config visual so the reader's eye lands on the part that's theirs.
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

/** Build the ordered connect steps for a client + link. */
export function buildSteps(client: ClientId, link: PublicLink): ShareStep[] {
  const name = serverName(link.name);
  const url = link.serverUrl || "https://acme.dev/mcp";

  if (link.kind === "stdio") {
    const repo = link.repoUrl || "https://github.com/you/your-mcp";
    const build = link.buildCmd || "npm install && npm run build";
    const run = link.runTarget || "node dist/server.js";
    // Whitespace-run split (matching jsonStdio) so a stray double space doesn't inject an empty arg.
    const parts = run.trim().split(/\s+/);
    return [
      {
        title: "Clone the repo",
        visual: <TerminalMock lines={[{ prompt: true, text: `git clone ${repo}`, caret: true }]} />,
        command: `git clone ${repo}`,
        prompt: true,
      },
      {
        title: "Build it once",
        description: "The author’s build step, run after clone.",
        command: build,
        prompt: true,
      },
      {
        title: `Point ${CONNECT_LABEL[client]} at the local server`,
        visual: (
          <ConfigMock
            file={client === "zed" ? "settings.json" : "mcp config"}
            lines={[
              "{",
              nameLine('  "', name, '": {'),
              `    "command": "${parts[0]}",`,
              // Same args formatting as jsonStdio, so the visual never diverges from the copied command
              // (a no-argument run target renders `[]`, not a phantom `[""]`).
              `    "args": [${parts
                .slice(1)
                .map((a) => `"${a}"`)
                .join(", ")}]`,
              "  }",
              "}",
            ]}
          />
        ),
        command: jsonStdio(name, run),
        block: true,
      },
    ];
  }

  switch (client) {
    case "claude-code":
      return [
        {
          title: "Run this in your terminal",
          description: (
            <>
              Then authorize when prompted with <code>/mcp</code>.
            </>
          ),
          visual: (
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
          command: `claude mcp add --transport http ${name} ${url}`,
          prompt: true,
        },
      ];
    case "claude-desktop":
      return [
        {
          title: "Settings → Connectors → Add",
          description: (
            <>
              Paste the URL, or drop this into <code>claude_desktop_config.json</code>.
            </>
          ),
          visual: (
            <MenuMock
              app="Claude"
              crumb="Connectors"
              items={[{ label: "Browse connectors" }, { label: "Add custom connector", on: true }]}
            />
          ),
          command: jsonRemote(name, url),
          block: true,
        },
      ];
    case "chatgpt":
      return [
        {
          title: "Settings → Connectors → custom MCP",
          description: "Needs developer mode / a paid tier. Remote URL only.",
          visual: (
            <MenuMock
              app="ChatGPT"
              crumb="Connectors"
              items={[{ label: "Connected apps" }, { label: "Add custom MCP server", on: true }]}
            />
          ),
          command: url,
        },
      ];
    case "cursor":
      return [
        {
          title: "Settings → MCP → Add",
          description: (
            <>
              Or drop it into <code>~/.cursor/mcp.json</code>.
            </>
          ),
          visual: (
            <MenuMock
              app="Cursor"
              crumb="MCP"
              items={[
                { label: "Installed servers", right: "2" },
                { label: "+ Add new MCP server", on: true },
              ]}
            />
          ),
          command: jsonRemote(name, url),
          block: true,
        },
      ];
    case "vscode":
      return [
        {
          title: "Add from the command line",
          description: (
            <>
              Or drop it into <code>.vscode/mcp.json</code>.
            </>
          ),
          visual: (
            <TerminalMock
              title="bash"
              lines={[
                {
                  prompt: true,
                  text: `code --add-mcp '{"name":"${name}","url":"${url}"}'`,
                  caret: true,
                },
              ]}
            />
          ),
          command: `code --add-mcp '{"name":"${name}","url":"${url}"}'`,
          prompt: true,
        },
      ];
    case "windsurf":
      return [
        {
          title: "Cascade → MCP → Add custom",
          description: (
            <>
              Windsurf keys the URL as <code>serverUrl</code>.
            </>
          ),
          visual: (
            <MenuMock
              app="Windsurf"
              crumb="Cascade · MCP"
              items={[{ label: "Manage plugins" }, { label: "Add custom server", on: true }]}
            />
          ),
          command: jsonRemote(name, url, "serverUrl"),
          block: true,
        },
      ];
    case "cline":
      return [
        {
          title: "Open the MCP Servers panel",
          description: (
            <>
              Add it to <code>cline_mcp_settings.json</code>.
            </>
          ),
          visual: (
            <MenuMock
              app="Cline"
              crumb="MCP Servers"
              items={[{ label: "Installed" }, { label: "Configure · Add server", on: true }]}
            />
          ),
          command: jsonRemote(name, url),
          block: true,
        },
      ];
    case "zed":
      return [
        {
          title: "Edit settings.json",
          description: (
            <>
              Zed calls them <code>context_servers</code>.
            </>
          ),
          visual: (
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
          command: `{\n  "context_servers": {\n    "${name}": { "url": "${url}" }\n  }\n}`,
          block: true,
        },
      ];
    case "goose":
      return [
        {
          title: "Run goose configure",
          description: "Add an extension → SSE (remote).",
          visual: (
            <TerminalMock
              lines={[
                { prompt: true, text: "goose configure" },
                { dim: true, text: "▸ Add Extension › Remote (SSE)" },
                { text: url, caret: true },
              ]}
            />
          ),
          command: url,
        },
      ];
    default:
      return [
        {
          title: "Any MCP client",
          description: "Use the raw URL, or the canonical JSON snippet.",
          visual: (
            <ConfigMock
              file="mcpServers"
              lines={[
                "{",
                '  "mcpServers": {',
                nameLine('    "', name, `": { "url": "${url}" }`),
                "  }",
                "}",
              ]}
            />
          ),
          command: url,
          block: false,
        },
      ];
  }
}
