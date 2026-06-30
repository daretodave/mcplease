import { CLIENT_IDS, type ClientId } from "@mcplease/client-matrix";
import type { PublicLink } from "@mcplease/model";
import { describe, expect, it } from "vitest";
import { buildSteps } from "./build-steps";

const http = (over: Partial<PublicLink> = {}): PublicLink => ({
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
});

const stdio = (over: Partial<PublicLink> = {}): PublicLink => ({
  slug: "local",
  kind: "stdio",
  serverUrl: null,
  repoUrl: "https://github.com/you/tool",
  buildCmd: "pnpm build",
  runTarget: "node dist/server.js",
  name: "Local Tool",
  description: null,
  tagline: null,
  ...over,
});

describe("buildSteps · http", () => {
  it("gives Claude Code one terminal step with the sanitized name in the command", () => {
    const steps = buildSteps("claude-code", http());
    expect(steps).toHaveLength(1);
    expect(steps[0]?.command).toBe("claude mcp add --transport http acme-mcp https://acme.dev/mcp");
    expect(steps[0]?.prompt).toBe(true);
  });

  it("keys Windsurf's snippet as serverUrl, everyone else as url", () => {
    expect(buildSteps("windsurf", http())[0]?.command).toContain(`"serverUrl"`);
    expect(buildSteps("cursor", http())[0]?.command).toContain(`"url"`);
    expect(buildSteps("cursor", http())[0]?.command).not.toContain(`"serverUrl"`);
  });

  it("hands ChatGPT and the generic target the raw URL", () => {
    expect(buildSteps("chatgpt", http())[0]?.command).toBe("https://acme.dev/mcp");
    const generic = buildSteps("generic", http());
    expect(generic).toHaveLength(1);
    expect(generic[0]?.command).toBe("https://acme.dev/mcp");
  });

  it("falls back to a placeholder URL when the link has none", () => {
    expect(buildSteps("claude-code", http({ serverUrl: null }))[0]?.command).toContain(
      "https://acme.dev/mcp",
    );
  });

  it("gives every client one http step with its spec command and a visual", () => {
    // Each client's exact command per the matrix (substring is enough to pin the mechanism).
    const expected: Record<ClientId, string> = {
      "claude-code": "claude mcp add --transport http acme-mcp https://acme.dev/mcp",
      "claude-desktop": `"acme-mcp": { "url": "https://acme.dev/mcp" }`,
      chatgpt: "https://acme.dev/mcp",
      cursor: `"acme-mcp": { "url": "https://acme.dev/mcp" }`,
      vscode: `code --add-mcp '{"name":"acme-mcp","url":"https://acme.dev/mcp"}'`,
      windsurf: `"acme-mcp": { "serverUrl": "https://acme.dev/mcp" }`,
      cline: `"acme-mcp": { "url": "https://acme.dev/mcp" }`,
      zed: `"context_servers"`,
      goose: "https://acme.dev/mcp",
      generic: "https://acme.dev/mcp",
    };
    for (const id of CLIENT_IDS) {
      const steps = buildSteps(id, http());
      expect(steps).toHaveLength(1);
      expect(steps[0]?.command).toContain(expected[id]);
      expect(steps[0]?.title).toBeTruthy();
      expect(steps[0]?.visual).toBeTruthy();
    }
  });
});

describe("buildSteps · stdio", () => {
  it("is the same clone → build → point-at-it shape for every client", () => {
    const steps = buildSteps("cursor", stdio());
    expect(steps).toHaveLength(3);
    expect(steps[0]?.command).toBe("git clone https://github.com/you/tool");
    expect(steps[1]?.command).toBe("pnpm build");
    expect(steps[2]?.command).toContain(`"command": "node"`);
    expect(steps[2]?.command).toContain(`"args": ["dist/server.js"]`);
  });

  it("names the client in the final step's title", () => {
    expect(buildSteps("vscode", stdio())[2]?.title).toBe("Point VS Code at the local server");
    expect(buildSteps("generic", stdio())[2]?.title).toBe(
      "Point any MCP client at the local server",
    );
  });

  it("ignores the client's http mechanism — stdio shape wins", () => {
    // ChatGPT is http-only, but if a stdio link reaches buildSteps it still gets the local flow.
    expect(buildSteps("chatgpt", stdio())).toHaveLength(3);
  });

  it("fills placeholder defaults when the stdio fields are blank", () => {
    const steps = buildSteps("zed", stdio({ repoUrl: null, buildCmd: null, runTarget: null }));
    expect(steps[0]?.command).toBe("git clone https://github.com/you/your-mcp");
    expect(steps[1]?.command).toBe("npm install && npm run build");
    expect(steps[2]?.command).toContain(`"command": "node"`);
    expect(steps[2]?.command).toContain(`"args": ["dist/server.js"]`);
  });

  it("renders empty args (not a phantom empty string) for a bare run target", () => {
    const steps = buildSteps("zed", stdio({ runTarget: "myserver" }));
    expect(steps[2]?.command).toContain(`"args": []`);
    expect(steps[2]?.command).not.toContain(`"args": [""]`);
  });
});
