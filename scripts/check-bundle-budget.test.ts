import { describe, it, expect } from "vitest";
import { gzipSync } from "node:zlib";
import {
  BUDGETS,
  CI_GZIP_OVERHEAD_KB,
  ciRisks,
  gzipKb,
  summarize,
  violations,
  type Asset,
  type Budget,
  type BudgetSummary,
} from "./check-bundle-budget.js";

const bytesOf = (s: string): Uint8Array => new Uint8Array(Buffer.from(s, "utf8"));
const asset = (path: string, content: string): Asset => ({ path, bytes: bytesOf(content) });

const huge: Budget = {
  label: "huge",
  match: (p) => p.endsWith(".js"),
  maxGzipKb: 9999,
  reason: "r",
};
const tiny: Budget = {
  label: "tiny",
  match: (p) => p.endsWith(".js"),
  maxGzipKb: 0.001,
  reason: "r",
};
const onlyKnown: Budget = {
  label: "known",
  match: (p) => p === "known.js",
  maxGzipKb: 9999,
  reason: "r",
};

describe("gzipKb", () => {
  it("returns the gzip size in SI kB (bytes / 1000)", () => {
    const raw = bytesOf("x".repeat(2000));
    expect(gzipKb(raw)).toBeCloseTo(gzipSync(raw).length / 1000, 10);
  });
});

describe("violations", () => {
  it("passes assets under their ceiling", () => {
    expect(violations([asset("app.js", "console.log(1)")], [huge])).toEqual([]);
  });

  it("flags an asset over its ceiling with the label + reason", () => {
    const out = violations([asset("app.js", "console.log(1)")], [tiny]);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("tiny");
    expect(out[0]).toContain("over the");
  });

  it("flags an asset that matches no budget (no silent caps)", () => {
    const out = violations([asset("unknown.js", "x")], [onlyKnown]);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("matches no budget");
  });
});

describe("summarize", () => {
  it("reports per-budget headroom and the uncapped strays", () => {
    const { perBudget, uncapped } = summarize(
      [asset("known.js", "a"), asset("stray.js", "b")],
      [onlyKnown],
    );
    expect(perBudget).toHaveLength(1);
    expect(perBudget[0]?.count).toBe(1);
    expect(perBudget[0]?.headroom).toBeCloseTo(
      perBudget[0]!.ceiling - perBudget[0]!.tightestKb,
      10,
    );
    expect(uncapped.map((u) => u.path)).toEqual(["stray.js"]);
  });

  it("omits a budget that governs no emitted asset", () => {
    const { perBudget } = summarize([asset("a.js", "x")], [huge, onlyKnown]);
    expect(perBudget.map((p) => p.label)).toEqual(["huge"]);
  });
});

describe("ciRisks", () => {
  const mk = (label: string, headroom: number): BudgetSummary => ({
    label,
    ceiling: 100,
    count: 1,
    tightestKb: 100 - headroom,
    headroom,
  });

  it("flags a budget whose headroom is positive but under the CI overhead", () => {
    const risks = ciRisks([mk("near", 0.5), mk("ample", 5), mk("over", -1)], CI_GZIP_OVERHEAD_KB);
    expect(risks.map((r) => r.label)).toEqual(["near"]);
  });
});

describe("the committed BUDGETS table", () => {
  it("caps the web entry chunk and carries a reason on each ceiling", () => {
    expect(BUDGETS.some((b) => b.match("apps/web/dist/assets/index-abc123.js"))).toBe(true);
    for (const b of BUDGETS) {
      expect(b.maxGzipKb).toBeGreaterThan(0);
      expect(b.reason.length).toBeGreaterThan(0);
    }
  });
});
