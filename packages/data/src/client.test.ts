import { afterAll, describe, expect, it, vi } from "vitest";
import { createBrowserClient } from "./client.js";

// The browser client is for browsers: fake the WebSocket global the realtime client probes for at
// construction (Node 20 has none — a real connection is never opened here).
vi.stubGlobal("WebSocket", class {});
afterAll(() => vi.unstubAllGlobals());

describe("createBrowserClient", () => {
  it("builds a Supabase client exposing the RPC + query surface", () => {
    const client = createBrowserClient("https://example.supabase.co", "anon-key");
    // construction is offline — no network until a query runs
    expect(typeof client.rpc).toBe("function");
    expect(typeof client.from).toBe("function");
  });

  it("does not persist a session (mcplease has no accounts)", () => {
    const client = createBrowserClient("https://example.supabase.co", "anon-key");
    expect((client.auth as unknown as { persistSession?: boolean }).persistSession ?? false).toBe(
      false,
    );
  });
});
