// The accent registry — AGNOSTIC (structured values only; the agnostic-seam guard scans this file).
// mcplease is a single-brand product (no per-team accent): one confident violet carries brand, primary
// action, AND focus — deliberately not split. The accent is a full per-theme ramp because hover/press
// and the as-text/border reading differ between dark and light. The soft/line/ring washes are { hex,
// alpha } structured intent; the web binding turns them into rgba().

import type { AlphaToken } from "./tokens.js";

/** One theme's accent ramp. base = the fill; hover/active darken one then two steps; fg = text on the
 *  accent; text = the accent used AS text on a surface (links); soft/line/ring are the tinted
 *  fill / border / focus-glow washes. */
export interface AccentRamp {
  base: string;
  hover: string;
  active: string;
  fg: string;
  text: string;
  soft: AlphaToken;
  line: AlphaToken;
  ring: AlphaToken;
}

/** The accent in both themes. Dark base is AA on white text (~4.7:1); light base is deeper (~6.2:1).
 *  Hover darkens one step, press one deeper, in both. */
export const accent = {
  dark: {
    base: "#7A55F5",
    hover: "#694BE8",
    active: "#5B3FD6",
    fg: "#FFFFFF",
    text: "#9B82FF",
    soft: { hex: "#7C5CFF", alpha: 0.16 },
    line: { hex: "#7C5CFF", alpha: 0.34 },
    ring: { hex: "#8468FF", alpha: 0.55 },
  },
  light: {
    base: "#6A47F5",
    hover: "#5A38E0",
    active: "#4C2DC9",
    fg: "#FFFFFF",
    text: "#6A47F5",
    soft: { hex: "#6A47F5", alpha: 0.1 },
    line: { hex: "#6A47F5", alpha: 0.26 },
    ring: { hex: "#6A47F5", alpha: 0.4 },
  },
} as const satisfies Record<"dark" | "light", AccentRamp>;
