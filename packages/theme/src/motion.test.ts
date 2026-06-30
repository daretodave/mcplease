import { describe, it, expect } from "vitest";
import { motion } from "./motion.js";

describe("motion tokens", () => {
  it("carry a numeric duration and a timing-function string", () => {
    for (const token of Object.values(motion)) {
      expect(typeof token.durationMs).toBe("number");
      expect(token.easing).toContain("cubic-bezier");
    }
  });

  it("the fast token is quicker than the base token", () => {
    expect(motion.fast.durationMs).toBeLessThan(motion.base.durationMs);
  });
});
