import { describe, it, expect } from "vitest";
import { EVENT_NAMES, SURFACES } from "./events.js";

describe("the event roster", () => {
  it("is the starter set (ten events)", () => {
    expect(EVENT_NAMES).toHaveLength(10);
  });

  it("every name is snake_case and <= 40 chars", () => {
    for (const name of EVENT_NAMES) {
      expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(name.length).toBeLessThanOrEqual(40);
    }
  });

  it("every name begins with a lawful surface prefix", () => {
    for (const name of EVENT_NAMES) {
      expect(SURFACES.some((s) => name.startsWith(s))).toBe(true);
    }
  });

  it("has no duplicate names", () => {
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
  });
});
