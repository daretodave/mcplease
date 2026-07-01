import { describe, it, expect } from "vitest";
import { CLIENT_IDS, CLIENTS, clientsForTransport, getClient } from "./index.js";

describe("the matrix", () => {
  it("has exactly the ten locked clients, in picker order", () => {
    expect(CLIENTS).toHaveLength(10);
    expect(CLIENTS.map((c) => c.id)).toEqual([...CLIENT_IDS]);
  });

  it("every row supports at least http and carries a manual mechanism", () => {
    for (const c of CLIENTS) {
      expect(c.http).toBe(true); // every target supports a remote server
      expect(c.manual.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });

  it("labels the Claude row 'Claude' (the connector lives on the account, not just the desktop app)", () => {
    expect(getClient("claude-desktop")?.label).toBe("Claude");
  });

  it("declares a remote config key for every config-file http client (incl. Zed's context_servers.url)", () => {
    // A client that takes a remote URL via a JSON config file must name the key it uses; only CLI-only
    // (claude-code), remote-only-UI (chatgpt), and raw-snippet (goose, generic) targets leave it undefined.
    expect(getClient("zed")?.remoteConfigKey).toBe("url");
    const declared = CLIENTS.filter((c) => c.remoteConfigKey !== undefined).map((c) => c.id);
    expect(declared).toEqual(["claude-desktop", "cursor", "vscode", "windsurf", "cline", "zed"]);
  });

  it("ChatGPT is the one remote-only client (no stdio)", () => {
    expect(getClient("chatgpt")?.stdio).toBe(false);
    const stdioOnly = CLIENTS.filter((c) => !c.stdio).map((c) => c.id);
    expect(stdioOnly).toEqual(["chatgpt"]);
  });
});

describe("getClient", () => {
  it("finds a client by id", () => {
    expect(getClient("cursor")?.label).toBe("Cursor");
    expect(getClient("cursor")?.oneClick).toBe("full");
  });

  it("returns undefined for an unknown id", () => {
    // @ts-expect-error — exercising the not-found path with an off-roster id
    expect(getClient("emacs")).toBeUndefined();
  });
});

describe("clientsForTransport", () => {
  it("shows everyone for http", () => {
    expect(clientsForTransport("http")).toHaveLength(10);
  });

  it("hides the remote-only client for stdio", () => {
    const ids = clientsForTransport("stdio").map((c) => c.id);
    expect(ids).toHaveLength(9);
    expect(ids).not.toContain("chatgpt");
  });
});
