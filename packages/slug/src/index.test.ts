import { describe, it, expect } from "vitest";
import {
  RESERVED_SLUGS,
  SLUG_MAX,
  SLUG_MIN,
  isReserved,
  isValidSlug,
  normalizeSlug,
  slugProblem,
} from "./index.js";

describe("isReserved", () => {
  it("flags the route/edge names and the denylist", () => {
    expect(isReserved("api")).toBe(true);
    expect(isReserved("badge")).toBe(true);
    expect(isReserved("mcplease")).toBe(true);
  });

  it("flags any `_`-prefixed slug (the internal namespace)", () => {
    expect(isReserved("_next")).toBe(true);
    expect(isReserved("_")).toBe(true);
  });

  it("leaves an ordinary slug alone", () => {
    expect(isReserved("my-server")).toBe(false);
  });

  it("exposes a non-empty reserved set", () => {
    expect(RESERVED_SLUGS.size).toBeGreaterThan(0);
  });
});

describe("slugProblem", () => {
  it("returns null for a valid slug", () => {
    expect(slugProblem("my-cool-server")).toBeNull();
    expect(slugProblem("ab")).toBeNull();
    expect(slugProblem("a1")).toBeNull();
  });

  it("names each rule it breaks, in order", () => {
    expect(slugProblem("")).toBe("empty");
    expect(slugProblem("a")).toBe("too-short");
    expect(slugProblem("a".repeat(SLUG_MAX + 1))).toBe("too-long");
    expect(slugProblem("Has Caps")).toBe("charset");
    expect(slugProblem("under_score")).toBe("charset");
    expect(slugProblem("-edge")).toBe("dash-edge");
    expect(slugProblem("edge-")).toBe("dash-edge");
    expect(slugProblem("a--b")).toBe("double-dash");
    expect(slugProblem("api")).toBe("reserved");
  });

  it("treats the boundary lengths as valid", () => {
    expect(slugProblem("a".repeat(SLUG_MIN))).toBeNull();
    expect(slugProblem("a".repeat(SLUG_MAX))).toBeNull();
  });
});

describe("isValidSlug", () => {
  it("mirrors slugProblem === null", () => {
    expect(isValidSlug("good-slug")).toBe(true);
    expect(isValidSlug("api")).toBe(false);
  });
});

describe("normalizeSlug", () => {
  it("lowercases, dashes the junk, and trims edge dashes", () => {
    expect(normalizeSlug("My Cool Server!!")).toBe("my-cool-server");
    expect(normalizeSlug("  spaced  ")).toBe("spaced");
    expect(normalizeSlug("a___b///c")).toBe("a-b-c");
  });

  it("clamps to SLUG_MAX and trims a dash the clamp leaves", () => {
    const out = normalizeSlug("a".repeat(50));
    expect(out).toHaveLength(SLUG_MAX);
    // a run that would clamp mid-dash leaves no trailing dash
    const clamped = normalizeSlug("a".repeat(SLUG_MAX) + " tail");
    expect(clamped.endsWith("-")).toBe(false);
  });

  it("returns empty string when there's nothing usable", () => {
    expect(normalizeSlug("!!!")).toBe("");
    expect(normalizeSlug("")).toBe("");
  });
});
