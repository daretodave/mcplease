import { describe, it, expect } from "vitest";
import { durations, easings } from "./motion.js";

describe("motion tokens", () => {
  it("expresses every easing as a cubic-bezier timing function", () => {
    for (const easing of Object.values(easings)) {
      expect(easing).toContain("cubic-bezier");
    }
  });

  it("orders durations from instant up to the delight beat", () => {
    expect(durations.instant).toBeLessThan(durations.fast);
    expect(durations.fast).toBeLessThan(durations.base);
    expect(durations.base).toBeLessThan(durations.slow);
    expect(durations.slow).toBeLessThan(durations.delight);
  });

  it("caps the delight beat at 1.5s (a non-blocking garnish)", () => {
    expect(durations.delight).toBeLessThanOrEqual(1500);
  });
});
