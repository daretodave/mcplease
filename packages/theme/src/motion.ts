// Motion tokens — AGNOSTIC (structured values only; the agnostic-seam guard scans this file). Durations
// are numbers (ms); easings are bare timing-function strings. The web binding materializes these into
// CSS animation/transition strings + keyframes. Placeholder until the design pass.

export interface MotionToken {
  /** duration in milliseconds */
  durationMs: number;
  /** a CSS timing function, applied verbatim by the web binding */
  easing: string;
}

export const motion = {
  /** quick affordance feedback (a button press, a copy flash) */
  fast: { durationMs: 120, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  /** the default transition (panel reveals, the create→success cross) */
  base: { durationMs: 200, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
} as const satisfies Record<string, MotionToken>;
