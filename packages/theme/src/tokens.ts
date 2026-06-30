// mcplease design tokens — the AGNOSTIC core. Structured values ONLY: bare hexes, { hex, alpha }
// pairs, bare font families, numeric sizes/radii/spacing. Every CSS materialization (rgba / px units /
// platform font stacks / shadow strings) lives in the per-renderer binding (preset.ts for web), never
// here — the seam is CI-guarded (scripts/check-agnostic-seam.ts), so the contract is checked, not
// aspirational.
//
// Two first-class themes: the dark ramp is the default, the light ramp mirrors it key-for-key by ROLE
// so the web binding emits one conditional value per theme-varying token. Color distinctions never rely
// on hue alone — the state colors always travel with an icon + word in the components that use them.

/** An alpha wash as structured intent: a base hex + an alpha in [0, 1]. The web binding materializes
 *  rgba(); a native adapter would apply the opacity in its own terms. */
export interface AlphaToken {
  hex: string;
  alpha: number;
}

/** A state color (ok / bad / warn): a solid for fills + an as-text variant (deepened for contrast), plus
 *  a soft tint fill and a line border, both as structured alpha washes. */
export interface StateColor {
  base: string;
  text: string;
  soft: AlphaToken;
  line: AlphaToken;
}

/** Surfaces — the page → card → popover → inset-well ramp. */
export const surfaces = {
  dark: { canvas: "#0B0D12", surface: "#14171C", raised: "#1B1F26", inset: "#0E1116" },
  light: { canvas: "#FFFFFF", surface: "#F6F7F9", raised: "#FFFFFF", inset: "#F2F3F6" },
} as const;

/** Hairline borders define most edges; the strong border lifts on hover / structure. */
export const borders = {
  dark: { subtle: "#262B33", strong: "#3A424D" },
  light: { subtle: "#E6E8EC", strong: "#C9CDD4" },
} as const;

/** Text — primary, muted, and the faint step (placeholders, disabled). */
export const textColors = {
  dark: { primary: "#F2F4F7", muted: "#9BA3AE", faint: "#6B7480" },
  light: { primary: "#0B0D10", muted: "#5B6470", faint: "#98A2AE" },
} as const;

/** State colors — paired with an icon + the word in use, never hue-only. */
export const state = {
  dark: {
    ok: {
      base: "#3FB984",
      text: "#56C795",
      soft: { hex: "#3FB984", alpha: 0.15 },
      line: { hex: "#3FB984", alpha: 0.38 },
    },
    bad: {
      base: "#F2698B",
      text: "#F2698B",
      soft: { hex: "#F2698B", alpha: 0.15 },
      line: { hex: "#F2698B", alpha: 0.38 },
    },
    warn: {
      base: "#F2B544",
      text: "#F2B544",
      soft: { hex: "#F2B544", alpha: 0.14 },
      line: { hex: "#F2B544", alpha: 0.4 },
    },
  },
  light: {
    ok: {
      base: "#15915E",
      text: "#15915E",
      soft: { hex: "#15915E", alpha: 0.1 },
      line: { hex: "#15915E", alpha: 0.3 },
    },
    bad: {
      base: "#D6336C",
      text: "#D6336C",
      soft: { hex: "#D6336C", alpha: 0.09 },
      line: { hex: "#D6336C", alpha: 0.28 },
    },
    warn: {
      base: "#B5820E",
      text: "#946A05",
      soft: { hex: "#B5820E", alpha: 0.1 },
      line: { hex: "#B5820E", alpha: 0.3 },
    },
  },
} as const satisfies Record<"dark" | "light", Record<"ok" | "bad" | "warn", StateColor>>;

/** Shadow ink as structured intent: an rgb triple + two strength stops per theme. The web binding
 *  composes the soft, low box-shadow strings (geometry is renderer detail, so it lives in preset.ts). */
export const shadowInk = {
  dark: { rgb: [0, 0, 0], strength1: 0.4, strength2: 0.55 },
  light: { rgb: [11, 13, 16], strength1: 0.06, strength2: 0.12 },
} as const satisfies Record<
  "dark" | "light",
  { rgb: readonly [number, number, number]; strength1: number; strength2: number }
>;

/** Type families (bare — the web binding appends the platform fallback stack). Two families, no third:
 *  a friendly grotesque for UI + the lowercase wordmark, and a mono for every command, slug, and shield. */
export const fonts = {
  sans: { family: "Space Grotesk" },
  mono: { family: "JetBrains Mono" },
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Font sizes as numbers (the web binding appends the unit). display → the hero create prompt; code →
 *  mono commands and JSON. */
export const fontSizes = {
  display: 44,
  h1: 32,
  h2: 24,
  h3: 19,
  body: 15,
  sm: 13,
  xs: 12,
  code: 13.5,
} as const;

/** Line-heights as unitless numbers. */
export const lineHeights = {
  tight: 1.1,
  snug: 1.3,
  normal: 1.55,
} as const;

/** Letter-spacing as numbers in em (the web binding appends the unit). The wordmark sets tightest so
 *  "mc" + "please" read as one word; caps is the wide tracking on the small mono eyebrows. */
export const letterSpacings = {
  display: -0.02,
  wordmark: -0.03,
  normal: 0,
  wide: 0.02,
  caps: 0.08,
} as const;

/** Spacing on a 4px base scale (+ a 2px hairline step). Numbers; the web binding appends the unit. */
export const spacing = {
  "0.5": 2,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 24,
  "6": 32,
  "7": 48,
  "8": 64,
} as const;

/** Layout container widths as numbers (the web binding appends the unit). */
export const containers = {
  prose: 640,
  share: 760,
  wide: 1080,
} as const;

/** Corner radii as numbers (the web binding appends the unit). 999 is the pill sentinel; the binding
 *  adds a separate `round` (50%) for dots/avatars. */
export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/** Border widths as numbers (the web binding appends the unit). */
export const borderWidths = {
  hairline: 1,
} as const;

/** Responsive band boundaries as numbers (the web binding appends the unit + builds the queries). */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
} as const;
