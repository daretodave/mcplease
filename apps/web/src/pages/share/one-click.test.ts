import type { PublicLink } from "@mcplease/model";
import { describe, expect, it } from "vitest";
import { oneClickHref, oneClickMode } from "./one-click";

const http: PublicLink = {
  slug: "acme",
  kind: "http",
  serverUrl: "https://acme.dev/mcp",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: "Acme MCP",
  description: null,
  tagline: null,
};

const stdio: PublicLink = {
  slug: "local",
  kind: "stdio",
  serverUrl: null,
  repoUrl: "https://github.com/you/x",
  buildCmd: null,
  runTarget: "node dist/server.js",
  name: "Local Tool",
  description: null,
  tagline: null,
};

describe("oneClickMode", () => {
  it("is full for Cursor and VS Code on http", () => {
    expect(oneClickMode("cursor", "http")).toBe("full");
    expect(oneClickMode("vscode", "http")).toBe("full");
  });

  it("is partial for Claude Desktop on http, and absent on stdio", () => {
    expect(oneClickMode("claude-desktop", "http")).toBe("partial");
    expect(oneClickMode("claude-desktop", "stdio")).toBeNull();
  });

  it("stays full for Cursor and VS Code on stdio", () => {
    expect(oneClickMode("cursor", "stdio")).toBe("full");
    expect(oneClickMode("vscode", "stdio")).toBe("full");
  });

  it("is null for manual-only clients", () => {
    expect(oneClickMode("claude-code", "http")).toBeNull();
    expect(oneClickMode("zed", "http")).toBeNull();
    expect(oneClickMode("generic", "http")).toBeNull();
  });
});

describe("oneClickHref", () => {
  it("builds a Cursor deep link carrying a base64 remote config", () => {
    const href = oneClickHref("cursor", http) ?? "";
    expect(href).toContain("cursor://anysphere.cursor-deeplink/mcp/install?name=acme-mcp&config=");
    const config = decodeURIComponent(href.split("config=")[1] ?? "");
    expect(JSON.parse(atob(config))).toEqual({ url: "https://acme.dev/mcp" });
  });

  it("builds a VS Code deep link with name + url json", () => {
    const href = oneClickHref("vscode", http) ?? "";
    const json = JSON.parse(decodeURIComponent(href.replace("vscode:mcp/install?", "")));
    expect(json).toEqual({ name: "acme-mcp", url: "https://acme.dev/mcp" });
  });

  it("encodes a stdio run target as command + args", () => {
    const href = oneClickHref("vscode", stdio) ?? "";
    const json = JSON.parse(decodeURIComponent(href.replace("vscode:mcp/install?", "")));
    expect(json).toEqual({ name: "local-tool", command: "node", args: ["dist/server.js"] });
  });

  it("collapses whitespace runs so the deep link carries no empty arg", () => {
    const href = oneClickHref("vscode", { ...stdio, runTarget: "node  dist/server.js" }) ?? "";
    const json = JSON.parse(decodeURIComponent(href.replace("vscode:mcp/install?", "")));
    expect(json.args).toEqual(["dist/server.js"]);
  });

  it("has no deep link for partial or manual clients", () => {
    expect(oneClickHref("claude-desktop", http)).toBeNull();
    expect(oneClickHref("claude-code", http)).toBeNull();
  });
});
