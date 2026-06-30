// The PandaCSS preset — the WEB binding of the agnostic core (the seam). Every CSS materialization lives
// HERE, never in tokens.ts/accents.ts/motion.ts: this file turns structured intent into web CSS — rgba()
// from { hex, alpha }, the soft shadow strings, px/em units, the platform font stacks. apps/web/
// panda.config.ts consumes `mcpleasePreset` with `strictTokens: true` (a raw hex is a compile error).
//
// LIGHT/DARK: the dark ramp is the base; the light ramp rides a Panda CONDITION (`light` →
// `[data-theme=light] &`) on every theme-varying token, so each emits one conditional value
// (`{ base: dark, _light }`). The appearance store sets `<html data-theme>`.
//
// The semantic token NAMES mirror the design system (bg.canvas, accent.base, state.ok, …) so components
// read the names the system documents.

import type { Preset } from "@pandacss/dev";
import { accent } from "./accents.js";
import { durations, easings } from "./motion.js";
import {
  borderWidths,
  borders,
  breakpoints,
  containers,
  fontSizes,
  fontWeights,
  fonts,
  letterSpacings,
  lineHeights,
  radii,
  shadowInk,
  spacing,
  state,
  surfaces,
  textColors,
  type AlphaToken,
} from "./tokens.js";

/** Materialize an { hex, alpha } wash as rgba(). The web binding's sole rgba builder. */
export function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** A theme-conditional token: dark is the base, light swaps in under `[data-theme=light]`. */
function themed(dark: string, light: string): { value: { base: string; _light: string } } {
  return { value: { base: dark, _light: light } };
}

type ThemedToken = ReturnType<typeof themed>;

/** A conditional rgba token from a per-theme { hex, alpha } pair. */
function themedWash(dark: AlphaToken, light: AlphaToken): ThemedToken {
  return themed(hexAlpha(dark.hex, dark.alpha), hexAlpha(light.hex, light.alpha));
}

/** A group of bare-hex colors that vary by theme → conditional tokens, key-for-key. */
function themedGroup<K extends string>(
  dark: Record<K, string>,
  light: Record<K, string>,
): Record<K, ThemedToken> {
  return Object.fromEntries(
    (Object.keys(dark) as K[]).map((k) => [k, themed(dark[k], light[k])]),
  ) as Record<K, ThemedToken>;
}

/** numeric dimensions → px value tokens. */
function pxTokens(source: Record<string, number>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, { value: `${v}px` }]));
}

/** numeric tracking → em value tokens. */
function emTokens(source: Record<string, number>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, { value: `${v}em` }]));
}

/** numeric durations → ms value tokens. */
function msTokens(source: Record<string, number>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, { value: `${v}ms` }]));
}

/** scalar values → plain value tokens (font weights, line-heights, easings…). */
function tokenMap(source: Record<string, string | number>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, { value: String(v) }]));
}

/** The accent group: a per-theme ramp (every value differs between dark and light, so the whole group
 *  is conditional). soft/line/ring materialize from their { hex, alpha } washes. */
const accentColors = {
  base: themed(accent.dark.base, accent.light.base),
  hover: themed(accent.dark.hover, accent.light.hover),
  active: themed(accent.dark.active, accent.light.active),
  fg: themed(accent.dark.fg, accent.light.fg),
  text: themed(accent.dark.text, accent.light.text),
  soft: themedWash(accent.dark.soft, accent.light.soft),
  line: themedWash(accent.dark.line, accent.light.line),
  ring: themedWash(accent.dark.ring, accent.light.ring),
};

/** One state color (ok/bad/warn) as a conditional token group: the solid is `DEFAULT`, plus text / soft
 *  fill / line border. */
function stateGroup(key: "ok" | "bad" | "warn"): Record<string, ThemedToken> {
  const d = state.dark[key];
  const l = state.light[key];
  return {
    DEFAULT: themed(d.base, l.base),
    text: themed(d.text, l.text),
    soft: themedWash(d.soft, l.soft),
    line: themedWash(d.line, l.line),
  };
}

/** Compose the soft, low box-shadow set for one theme from its structured ink + strength stops. */
function shadowSet(ink: {
  rgb: readonly [number, number, number];
  strength1: number;
  strength2: number;
}): { card: string; raised: string; inset: string } {
  const i = ink.rgb.join(",");
  const s1 = `rgba(${i},${ink.strength1})`;
  const s2 = `rgba(${i},${ink.strength2})`;
  return {
    card: `0 1px 2px ${s1}, 0 10px 30px -14px ${s2}`,
    raised: `0 2px 6px ${s1}, 0 24px 60px -20px ${s2}`,
    inset: `inset 0 1px 2px ${s1}`,
  };
}

const darkShadows = shadowSet(shadowInk.dark);
const lightShadows = shadowSet(shadowInk.light);

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
        sans: {
          value: `"${fonts.sans.family}", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
        },
        mono: {
          value: `"${fonts.mono.family}", ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace`,
        },
      },
      fontWeights: tokenMap(fontWeights),
      fontSizes: pxTokens(fontSizes),
      lineHeights: tokenMap(lineHeights),
      letterSpacings: emTokens(letterSpacings),
      spacing: pxTokens(spacing),
      sizes: pxTokens(containers),
      radii: { ...pxTokens(radii), round: { value: "50%" } },
      borderWidths: pxTokens(borderWidths),
      durations: msTokens(durations),
      easings: tokenMap(easings),
      // The focus ring + accent glow reference the conditional accent washes, so they stay theme-correct
      // through a single value.
      shadows: {
        ring: { value: "0 0 0 3px {colors.accent.ring}" },
        ringTight: { value: "0 0 0 2px {colors.accent.ring}" },
        glow: { value: "0 6px 20px -8px {colors.accent.line}" },
      },
    },
    // The theme-CONDITIONAL tokens — each carries `{ base: dark, _light }`.
    semanticTokens: {
      colors: {
        bg: themedGroup(surfaces.dark, surfaces.light),
        border: themedGroup(borders.dark, borders.light),
        text: themedGroup(textColors.dark, textColors.light),
        accent: accentColors,
        state: {
          ok: stateGroup("ok"),
          bad: stateGroup("bad"),
          warn: stateGroup("warn"),
        },
      },
      // The card/popover/inset shadows tune their ink per theme.
      shadows: {
        card: themed(darkShadows.card, lightShadows.card),
        raised: themed(darkShadows.raised, lightShadows.raised),
        inset: themed(darkShadows.inset, lightShadows.inset),
      },
    },
    breakpoints: Object.fromEntries(
      Object.entries(breakpoints).map(([name, px]) => [name, `${px}px`]),
    ),
    // Design-system motion as named keyframes. `spin` drives every loading/checking glyph; `sparkBloom`
    // is the one delight beat — the accent spark blooms up and fades at the moment of copy/connect. The
    // rest are the screen entrances: `fade`/`pop` bring the success overlay in, `bloom` settles its body,
    // and `reveal` slides the conditional fields (the stdio trio, the details panel) down on appear. Each
    // resolves to a settled base state, so a paused clock under reduced-motion never strands hidden content.
    keyframes: {
      spin: { to: { transform: "rotate(360deg)" } },
      sparkBloom: {
        "0%": { transform: "translate(-50%, -50%) scale(0.35) rotate(-18deg)", opacity: "0" },
        "55%": { transform: "translate(-50%, -118%) scale(1.15) rotate(12deg)", opacity: "1" },
        "100%": { transform: "translate(-50%, -185%) scale(0.85) rotate(12deg)", opacity: "0" },
      },
      fade: { from: { opacity: "0" }, to: { opacity: "1" } },
      pop: { from: { transform: "translateY(10px) scale(0.98)" }, to: { transform: "none" } },
      bloom: { from: { transform: "translateY(6px)" }, to: { transform: "none" } },
      reveal: { from: { transform: "translateY(-6px)" }, to: { transform: "none" } },
    },
  },
  globalCss: {
    "*, *::before, *::after": { boxSizing: "border-box" },
    html: { WebkitTextSizeAdjust: "100%" },
    body: {
      margin: "0",
      minHeight: "100dvh",
      background: "{colors.bg.canvas}",
      color: "{colors.text.primary}",
      fontFamily: "{fonts.sans}",
      fontSize: "{fontSizes.body}",
      lineHeight: "{lineHeights.normal}",
      fontWeight: "{fontWeights.regular}",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    "::selection": { background: "{colors.accent.soft}", color: "{colors.text.primary}" },
    a: { color: "{colors.accent.text}", textDecoration: "none" },
    "a:hover": { textDecoration: "underline", textUnderlineOffset: "2px" },
    "code, pre, kbd, samp": { fontFamily: "{fonts.mono}" },
    // Visible focus by construction — the accent ring on keyboard focus only.
    ":where(a, button, input, textarea, select, [tabindex]):focus-visible": {
      outline: "none",
      boxShadow: "{shadows.ring}",
      borderRadius: "{radii.sm}",
    },
    // The motion system degrades to instant under reduced-motion; the delight beat becomes a static seal.
    "@media (prefers-reduced-motion: reduce)": {
      "*, *::before, *::after": {
        animationDuration: "0.001ms !important",
        animationIterationCount: "1 !important",
        transitionDuration: "0.001ms !important",
        scrollBehavior: "auto !important",
      },
    },
  },
};
