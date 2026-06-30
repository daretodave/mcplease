import { create } from "zustand";

/** The user's appearance choice; 'system' follows the device. */
export type Appearance = "dark" | "light" | "system";

const STORAGE_KEY = "mcplease-appearance";
const DARK_CANVAS = "#0B0D12";
const LIGHT_CANVAS = "#FFFFFF";

interface AppearanceState {
  /** the persisted preference */
  preference: Appearance;
  /** set + persist the preference, and repaint immediately */
  setPreference: (next: Appearance) => void;
}

/** The persisted preference, defaulting to 'system' when unset, invalid, or storage is unavailable. */
export function readStored(): Appearance {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

/** Resolve a preference to the concrete theme, consulting the device for 'system'. */
export function resolveTheme(pref: Appearance): "dark" | "light" {
  if (pref === "dark" || pref === "light") return pref;
  const prefersDark =
    typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/** Apply the resolved theme to <html data-theme> + the theme-color meta (matches the index.html boot). */
function applyTheme(pref: Appearance): void {
  const theme = resolveTheme(pref);
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? DARK_CANVAS : LIGHT_CANVAS);
}

export const useAppearance = create<AppearanceState>((set) => ({
  preference: readStored(),
  setPreference: (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage disabled (private mode) — the in-memory preference still applies this session
    }
    applyTheme(next);
    set({ preference: next });
  },
}));

/**
 * Re-affirm the theme from the store on mount (the index.html boot already painted it before first
 * paint), and repaint live when the OS theme flips while the preference follows the device. Returns a
 * teardown for the media listener.
 */
export function startAppearanceSync(): () => void {
  applyTheme(useAppearance.getState().preference);
  const mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
  const onChange = (): void => {
    if (useAppearance.getState().preference === "system") applyTheme("system");
  };
  mq?.addEventListener("change", onChange);
  return () => mq?.removeEventListener("change", onChange);
}
