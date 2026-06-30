import { describe, it, expect, afterEach, vi } from "vitest";
import { env, read } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("read", () => {
  it("returns a set VITE_ value", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    expect(read("VITE_SUPABASE_URL")).toBe("https://example.supabase.co");
  });

  it("defaults an unset key to the empty string (feature off)", () => {
    expect(read("VITE_DOES_NOT_EXIST")).toBe("");
  });
});

describe("env", () => {
  it("exposes the four public config strings", () => {
    expect(typeof env.supabaseUrl).toBe("string");
    expect(typeof env.supabaseAnonKey).toBe("string");
    expect(typeof env.turnstileSitekey).toBe("string");
    expect(typeof env.ga4MeasurementId).toBe("string");
  });
});
