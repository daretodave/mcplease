// Motion tokens — AGNOSTIC (structured values only; the agnostic-seam guard scans this file). Easings
// are bare timing-function strings; durations are numbers (ms). The web binding materializes these into
// CSS transition/animation strings + keyframes.
//
// Calm, ease-out by default — `out` is the house curve. The delight beat (the spark bloom + "Copied!"
// seal) is capped at <= 1.5s and is decorative only, never blocking; everything degrades to instant
// under prefers-reduced-motion (the web binding's globalCss handles that).

/** Timing functions, applied verbatim by the web binding. */
export const easings = {
  /** the house curve — calm ease-out */
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** material-standard, for symmetric moves */
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  /** one gentle overshoot — the success card's single spring */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** the delight beat's curve */
  delight: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/** Durations in milliseconds. fast = hover/press; base = most transitions; slow = overlays/reveals;
 *  delight = the spark bloom + seal (under the 1.5s ceiling). */
export const durations = {
  instant: 90,
  fast: 140,
  base: 220,
  slow: 340,
  delight: 1100,
} as const;
