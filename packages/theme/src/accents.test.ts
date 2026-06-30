import { describe, it, expect } from "vitest";
import { accent } from "./accents.js";

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe("the accent registry", () => {
  it("carries a full ramp in both themes, the light base distinct from dark", () => {
    expect(accent.dark.base).toMatch(HEX);
    expect(accent.light.base).toMatch(HEX);
    expect(accent.dark.base).not.toBe(accent.light.base);
  });

  it("keeps base/hover/active/fg/text as bare hexes", () => {
    for (const ramp of [accent.dark, accent.light]) {
      for (const v of [ramp.base, ramp.hover, ramp.active, ramp.fg, ramp.text]) {
        expect(v).toMatch(HEX);
      }
    }
  });

  it("expresses soft/line/ring as structured { hex, alpha } washes", () => {
    for (const ramp of [accent.dark, accent.light]) {
      for (const wash of [ramp.soft, ramp.line, ramp.ring]) {
        expect(wash.hex).toMatch(HEX);
        expect(wash.alpha).toBeGreaterThan(0);
        expect(wash.alpha).toBeLessThanOrEqual(1);
      }
    }
  });
});
