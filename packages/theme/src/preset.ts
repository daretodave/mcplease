// The PandaCSS preset — the WEB binding of the agnostic core (the seam). Every CSS
// materialization lives HERE, never in tokens.ts/accents.ts/motion.ts: this file turns structured
// intent into web CSS — rgba() from { hex, alpha }, color-mix() accent washes, px units, the platform
// font stacks. apps/web/panda.config.ts consumes `mcpleasePreset` with `strictTokens: true` (a raw hex
// is a compile error).
//
// LIGHT/DARK: the dark ramp is the base; the light ramp rides a Panda CONDITION (`light` →
// `[data-theme=light] &`) on the surface/ink/line color tokens, so each emits one conditional value
// (`{ base: dark, _light }`). The appearance store sets `<html data-theme>`.
//
// ⚠️ PLACEHOLDER token values — the design pass replaces them; this binding's
// SHAPE is the durable part.

import type { Preset } from "@pandacss/dev";
import { accent, accentSteps } from "./accents.js";
import { motion } from "./motion.js";
import {
  borderWidths,
  breakpoints,
  darkRamp,
  fontWeights,
  fonts,
  inkAlpha,
  lightInk,
  lightRamp,
  palette,
  radii,
  type AlphaToken,
} from "./tokens.js";

/** Materialize an { hex, alpha } wash as rgba(). The web binding's sole rgba builder. */
export function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** A theme-conditional color token: dark is the base, light swaps in under `[data-theme=light]`. */
function themed(dark: string, light: string): { value: { base: string; _light: string } } {
  return { value: { base: dark, _light: light } };
}

/** numeric dimensions → px value tokens. */
function pxTokens(source: Record<string, number>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, { value: `${v}px` }]));
}

/** scalar values → plain value tokens (font weights, durations…). */
function tokenMap(source: Record<string, string | number>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, { value: String(v) }]));
}

/** { hex, alpha } steps → CONDITIONAL rgba tokens (paper ink in dark, night ink on paper in light). */
function themedAlphaTokens(
  source: Record<string, AlphaToken>,
  lightBase: string,
): Record<string, { value: { base: string; _light: string } }> {
  return Object.fromEntries(
    Object.entries(source).map(([k, v]) => [
      k,
      themed(hexAlpha(v.hex, v.alpha), hexAlpha(lightBase, v.alpha)),
    ]),
  );
}

/** A brand-accent surface wash at `percent` strength (theme-invariant — the hue is preserved). */
function accentMix(percent: number): string {
  return `color-mix(in srgb, ${accent.base} ${percent}%, transparent)`;
}

const accentTokens = {
  DEFAULT: { value: accent.base },
  ...Object.fromEntries(accentSteps.map((p) => [`a${p}`, { value: accentMix(p) }])),
  // accent used as text/border deepens on paper (the accent-on-light rule); fills keep the full hue.
  ink: themed(accent.base, accent.light),
};

export const mcpleasePreset: Preset = {
  name: "mcplease",
  conditions: {
    // Light theme: the appearance store sets `<html data-theme="light">`; absence / "dark" is the base.
    light: "[data-theme=light] &",
  },
  theme: {
    tokens: {
      colors: {
        transparent: { value: "transparent" },
      },
      fonts: {
        ui: { value: `"${fonts.ui.family}", system-ui, sans-serif` },
        mono: { value: `"${fonts.mono.family}", ui-monospace, monospace` },
      },
      fontWeights: tokenMap(fontWeights),
      radii: pxTokens(radii),
      borderWidths: pxTokens(borderWidths),
      durations: {
        fast: { value: `${motion.fast.durationMs}ms` },
        base: { value: `${motion.base.durationMs}ms` },
      },
      easings: {
        fast: { value: motion.fast.easing },
        base: { value: motion.base.easing },
      },
    },
    // The theme-CONDITIONAL colors (light/dark) — same `colors.*` namespace, each carrying
    // `{ base: dark, _light }`.
    semanticTokens: {
      colors: {
        canvas: themed(darkRamp.canvas, lightRamp.canvas),
        surface: themed(darkRamp.surface, lightRamp.surface),
        raised: themed(darkRamp.raised, lightRamp.raised),
        line: themed(darkRamp.line, lightRamp.line),
        ink: {
          DEFAULT: themed(palette.paper, lightInk.solid),
          ...themedAlphaTokens(inkAlpha, lightInk.alphaBase),
        },
        // The accent group: DEFAULT + the color-mix washes are theme-invariant (the hue is preserved);
        // `ink` (accent as text/border) deepens on paper — a conditional value, so the whole group lives
        // here in semanticTokens, never in raw tokens.
        accent: accentTokens,
      },
    },
    breakpoints: Object.fromEntries(
      Object.entries(breakpoints).map(([name, px]) => [name, `${px}px`]),
    ),
  },
  globalCss: {
    "*": { boxSizing: "border-box" },
    body: {
      margin: "0",
      minHeight: "100dvh",
      background: "{colors.canvas}",
      color: "{colors.ink}",
      fontFamily: "{fonts.ui}",
      WebkitFontSmoothing: "antialiased",
    },
  },
};
