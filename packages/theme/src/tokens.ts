// mcplease design tokens — the AGNOSTIC core. Structured values ONLY: bare hexes, { hex, alpha }
// pairs, bare font families, numeric radii/borders/breakpoints. Every CSS materialization (rgba / px
// units / platform font stacks / color-mix) lives in the per-renderer binding (preset.ts for web),
// never here — the seam is CI-guarded (scripts/check-agnostic-seam.ts), so the contract is checked,
// not aspirational.
//
// ⚠️ PLACEHOLDER values. The design system pass REPLACES the hexes/numbers; the
// SHAPE — semantic names (surface/ink/accent/step), a dark default + light ramp — is the seam that
// stays. Never invent finals here; a design pass lands them.

/** Palette anchors. */
export const palette = {
  ink: "#0B0D12",
  paper: "#F7F7F5",
  accent: "#6E56CF",
} as const;

/** Dark ramp — the default theme. */
export const darkRamp = {
  canvas: "#0B0D12",
  surface: "#14171F",
  raised: "#1C2030",
  line: "#272C3A",
} as const;

/** Light ramp — mirrors `darkRamp` key-for-key by ROLE so the web binding emits one conditional value
 *  per surface token. */
export const lightRamp = {
  canvas: "#F7F7F5",
  surface: "#FFFFFF",
  raised: "#F0F0EE",
  line: "#E3E3DF",
} as const;

/** Light-mode ink: the primary text on paper, plus the hex the muted-ink alpha ladder is built from. */
export const lightInk = { solid: "#14171F", alphaBase: "#14171F" } as const;

/** An alpha wash as structured intent: a base hex + an alpha in [0, 1]. The web binding materializes
 *  rgba(); a native adapter would apply the opacity in its own terms. */
export interface AlphaToken {
  hex: string;
  alpha: number;
}

/** Muted-ink washes at the steps the placeholder UI uses (dark base = paper ink). */
export const inkAlpha = {
  55: { hex: palette.paper, alpha: 0.55 },
  70: { hex: palette.paper, alpha: 0.7 },
} as const satisfies Record<number, AlphaToken>;

/** Type families (bare — the web binding appends the platform fallback stack). */
export const fonts = {
  ui: { family: "Inter" },
  mono: { family: "JetBrains Mono" },
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Corner radii as numbers (the web binding appends the unit). 999 is the pill sentinel. */
export const radii = {
  control: 8,
  card: 12,
  pill: 999,
} as const;

/** Border widths as numbers (the web binding appends the unit). */
export const borderWidths = {
  hairline: 1,
  card: 1.5,
} as const;

/** Responsive band boundaries as numbers (the web binding appends the unit + builds the queries). */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
} as const;
