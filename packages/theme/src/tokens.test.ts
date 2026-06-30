import { describe, it, expect } from "vitest";
import {
  borderWidths,
  borders,
  breakpoints,
  containers,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  radii,
  shadowInk,
  spacing,
  state,
  surfaces,
  textColors,
} from "./tokens.js";

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe("the agnostic token core", () => {
  it("ships dark + light surface/border/text ramps that mirror by role", () => {
    expect(Object.keys(surfaces.dark)).toEqual(Object.keys(surfaces.light));
    expect(Object.keys(borders.dark)).toEqual(Object.keys(borders.light));
    expect(Object.keys(textColors.dark)).toEqual(Object.keys(textColors.light));
  });

  it("keeps surface/border/text colors as bare hexes (no CSS materialization)", () => {
    const all = [surfaces, borders, textColors].flatMap((group) => [
      ...Object.values(group.dark),
      ...Object.values(group.light),
    ]);
    for (const hex of all) expect(hex).toMatch(HEX);
  });

  it("ships ok/bad/warn state colors in both themes, each with a soft + line wash", () => {
    for (const theme of [state.dark, state.light]) {
      for (const key of ["ok", "bad", "warn"] as const) {
        const c = theme[key];
        expect(c.base).toMatch(HEX);
        expect(c.text).toMatch(HEX);
        expect(c.soft).toEqual({ hex: expect.stringMatching(HEX), alpha: expect.any(Number) });
        expect(c.line).toEqual({ hex: expect.stringMatching(HEX), alpha: expect.any(Number) });
      }
    }
  });

  it("carries the shadow ink as an rgb triple + two strength stops per theme", () => {
    for (const ink of [shadowInk.dark, shadowInk.light]) {
      expect(ink.rgb).toHaveLength(3);
      expect(typeof ink.strength1).toBe("number");
      expect(typeof ink.strength2).toBe("number");
    }
  });

  it("keeps every dimension as a number (the binding appends the unit)", () => {
    expect(typeof fontSizes.display).toBe("number");
    expect(typeof radii.lg).toBe("number");
    expect(typeof spacing["4"]).toBe("number");
    expect(typeof containers.prose).toBe("number");
    expect(typeof borderWidths.hairline).toBe("number");
    expect(typeof breakpoints.md).toBe("number");
    expect(typeof fontWeights.bold).toBe("number");
    expect(typeof lineHeights.normal).toBe("number");
    expect(typeof letterSpacings.wordmark).toBe("number");
  });
});
