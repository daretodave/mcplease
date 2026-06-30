import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readStored, resolveTheme, startAppearanceSync, useAppearance } from "./appearance";

interface FakeMql {
  matches: boolean;
  media: string;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
  dispatch: () => void;
}

function stubMatchMedia(matches: boolean): FakeMql {
  const listeners = new Set<() => void>();
  const mql: FakeMql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_type, cb) => listeners.add(cb),
    removeEventListener: (_type, cb) => listeners.delete(cb),
    dispatch: () => listeners.forEach((cb) => cb()),
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql));
  return mql;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", "");
  useAppearance.setState({ preference: "system" });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("readStored", () => {
  it("returns a stored valid value", () => {
    localStorage.setItem("mcplease-appearance", "dark");
    expect(readStored()).toBe("dark");
  });

  it("falls back to 'system' for an invalid value", () => {
    localStorage.setItem("mcplease-appearance", "rainbow");
    expect(readStored()).toBe("system");
  });

  it("falls back to 'system' when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStored()).toBe("system");
  });
});

describe("resolveTheme", () => {
  it("returns an explicit choice unchanged", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
  });

  it("follows the device for 'system'", () => {
    stubMatchMedia(true);
    expect(resolveTheme("system")).toBe("dark");
    stubMatchMedia(false);
    expect(resolveTheme("system")).toBe("light");
  });

  it("defaults to light when matchMedia is unavailable", () => {
    expect(resolveTheme("system")).toBe("light");
  });
});

describe("setPreference", () => {
  it("persists, repaints data-theme + theme-color, and updates state", () => {
    useAppearance.getState().setPreference("light");
    expect(localStorage.getItem("mcplease-appearance")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#FFFFFF",
    );
    expect(useAppearance.getState().preference).toBe("light");
  });

  it("survives storage being disabled", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => useAppearance.getState().setPreference("dark")).not.toThrow();
    expect(useAppearance.getState().preference).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("startAppearanceSync", () => {
  it("applies the current theme and tears down cleanly without matchMedia", () => {
    useAppearance.setState({ preference: "dark" });
    const stop = startAppearanceSync();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(() => stop()).not.toThrow();
  });

  it("repaints on a device flip while following 'system', then stops after teardown", () => {
    const mql = stubMatchMedia(false);
    useAppearance.setState({ preference: "system", resolved: "light" });
    const stop = startAppearanceSync();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(useAppearance.getState().resolved).toBe("light");

    mql.matches = true;
    mql.dispatch();
    expect(document.documentElement.dataset.theme).toBe("dark");
    // the published resolved theme flips too, so live consumers (the toggle glyph) re-render — the
    // preference itself never changed, so without this they'd be stuck on the stale icon
    expect(useAppearance.getState().resolved).toBe("dark");

    stop();
    mql.matches = false;
    mql.dispatch();
    expect(document.documentElement.dataset.theme).toBe("dark"); // listener removed — no repaint
    expect(useAppearance.getState().resolved).toBe("dark");
  });

  it("ignores a device flip when an explicit theme is chosen", () => {
    const mql = stubMatchMedia(false);
    useAppearance.setState({ preference: "light", resolved: "light" });
    const stop = startAppearanceSync();

    mql.matches = true; // the OS went dark, but the user pinned light
    mql.dispatch();
    expect(useAppearance.getState().resolved).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    stop();
  });
});
