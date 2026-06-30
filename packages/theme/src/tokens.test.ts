import { describe, it, expect } from "vitest";
import {
  borderWidths,
  breakpoints,
  darkRamp,
  fontWeights,
  inkAlpha,
  lightRamp,
  radii,
} from "./tokens.js";

describe("the agnostic token core", () => {
  it("ships a dark + light ramp that mirror by role", () => {
    expect(Object.keys(darkRamp)).toEqual(Object.keys(lightRamp));
  });

  it("keeps colors as bare hexes (no CSS materialization)", () => {
    for (const hex of Object.values(darkRamp)) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("keeps dimensions as numbers and alpha steps as { hex, alpha }", () => {
    expect(typeof radii.card).toBe("number");
    expect(typeof borderWidths.hairline).toBe("number");
    expect(typeof breakpoints.md).toBe("number");
    expect(typeof fontWeights.bold).toBe("number");
    expect(inkAlpha[55]).toEqual({ hex: expect.any(String), alpha: 0.55 });
  });
});
