// The accent registry — AGNOSTIC (structured values only; the agnostic-seam guard scans this file).
// mcplease is a single-brand product (no per-team accent), so this is just the brand accent + its
// light companion (deepened for >=4.5:1 as text/border on paper) and the wash strengths the web
// binding turns into color-mix()/rgba(). Placeholder until the design pass.

/** The brand accent + its light companion (the accent-on-light rule: accent-as-text/border on paper
 *  deepens one step; fills/rings keep the full accent in both themes). */
export const accent = {
  base: "#6E56CF",
  light: "#5B46B0",
} as const;

/** Accent wash strengths in percent — the web binding materializes each into a color-mix()/rgba(). */
export const accentSteps = [8, 12, 45] as const;
