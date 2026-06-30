import { describe, it, expect } from "vitest";
import { accent, accentSteps } from "./accents.js";

describe("the accent registry", () => {
  it("carries a base accent + a deepened light companion, both bare hexes", () => {
    expect(accent.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(accent.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(accent.base).not.toBe(accent.light);
  });

  it("exposes ascending wash strengths in percent", () => {
    expect(accentSteps.length).toBeGreaterThan(0);
    expect([...accentSteps]).toEqual([...accentSteps].sort((a, b) => a - b));
  });
});
