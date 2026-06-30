// The byte ceiling: the emitted browser bundle carries a committed gzip budget
// per entry, and the build FAILS when a JS asset crosses it — the same "fail-the-build, not a
// dashboard" shape as the coverage thresholds, the co-located test law, and the agnostic-seam guard.
// A share link is meant to open instantly on a stranger's phone, so first-paint byte-weight earns a
// gate exactly like coverage and strictTokens do. A pure, tested violations() + a committed table;
// the dist read + node:zlib glue is /* v8 ignore */'d. Runs as one root script AFTER `build`,
// never re-building.

import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

/** One emitted asset: its repo-relative path (forward slashes) and raw bytes. */
export interface Asset {
  path: string;
  bytes: Uint8Array;
}

/** A committed ceiling: which assets it governs and the gzip cap. */
export interface Budget {
  /** human label, printed on overage */
  label: string;
  /** an asset is governed by the first budget whose match() passes */
  match: (path: string) => boolean;
  /** the ceiling, in SI kB (1000 bytes), gzip — NOT KiB */
  maxGzipKb: number;
  /** why this number — printed on overage so a future reader sees the rationale */
  reason: string;
}

// ---- The contract. Each ceiling is a diffable, reviewed number, never auto-bumped; the gate exists
//      to make a silent regression loud. Units are SI kB (1000 bytes) — the unit is law.
export const BUDGETS: readonly Budget[] = [
  {
    label: "web entry chunk (first paint of the share page)",
    match: (p) => /^apps\/web\/dist\/assets\/index-[\w-]+\.js$/.test(p),
    // The framework floor for the SPA shell: React 19 + react-dom + react-router-dom v7 + TanStack
    // Query + Zustand + Panda's runtime, plus the placeholder routes. A share link must open fast on
    // a stranger's phone, so the entry is gated from day one. Generous while the screens are
    // placeholders; TIGHTEN once the real create/share screens + route code-splitting land
    // and the entry shrinks to a shell — each tightening a reviewed edit.
    maxGzipKb: 200,
    reason:
      "React 19 + router v7 + TanStack Query + Zustand + Panda runtime floor (placeholder shell)",
  },
  {
    label: "lazy async chunks (per-route screens — NOT first paint)",
    match: (p) => /^apps\/web\/dist\/assets\/chunk-[\w-]+\.js$/.test(p),
    // The create/share/edit screens become lazy() route chunks once they land — reached on navigation,
    // never on the share page's first paint. No such chunk exists yet; this caps each one
    // generously until route-splitting arrives, then it becomes per-route ceilings (a reviewed edit).
    maxGzipKb: 60,
    reason: "per-route lazy screens; no async chunk emitted yet — a forward-looking ceiling",
  },
];

/** gzip size in SI kB (1000 bytes), node:zlib — deterministic for a given input. */
export function gzipKb(bytes: Uint8Array): number {
  return gzipSync(bytes).length / 1000;
}

function fmt(kb: number): string {
  return kb.toFixed(2);
}

/**
 * Pure: which emitted JS assets breach — or escape — the committed budgets. An asset that matches no
 * budget is itself a violation (a future code-split chunk must declare its ceiling, never ship
 * uncapped — the "no silent caps" discipline).
 */
export function violations(assets: readonly Asset[], budgets: readonly Budget[]): string[] {
  const out: string[] = [];
  for (const asset of assets) {
    const kb = gzipKb(asset.bytes);
    const budget = budgets.find((b) => b.match(asset.path));
    if (!budget) {
      out.push(
        `${asset.path} (${fmt(kb)} kB gzip) matches no budget — add a ceiling to BUDGETS; no JS chunk ships uncapped`,
      );
      continue;
    }
    if (kb > budget.maxGzipKb) {
      out.push(
        `${budget.label}: ${asset.path} is ${fmt(kb)} kB gzip, over the ${fmt(budget.maxGzipKb)} kB ceiling — ${budget.reason}`,
      );
    }
  }
  return out;
}

// CI's gzip measures the entry chunk slightly HEAVIER than a local box (a different zlib/Node build on
// the runner). 1.0 kB is a deliberately-CONSERVATIVE cushion: the local-only projection below uses it to
// print a LOUD near-ceiling warning so you bump (with a reason) or trim BEFORE pushing — instead of
// learning it from a ~10-min red CI build. Local-only (`!process.env.CI`): CI itself gates on the real
// ceiling, so the projection never double-counts there.
export const CI_GZIP_OVERHEAD_KB = 1.0;

/** One budget's worst (tightest) governed asset — the headroom that decides the verdict. */
export interface BudgetSummary {
  label: string;
  ceiling: number;
  /** how many emitted assets this budget governs (e.g. 1 entry, N lazy chunks) */
  count: number;
  /** the LARGEST gzip among them (the one nearest the ceiling) */
  tightestKb: number;
  /** ceiling − tightestKb (negative ⇒ already over) */
  headroom: number;
}

/**
 * Pure: per-budget margin + the unbudgeted strays — the always-printed picture so the headroom is
 * visible on EVERY run (success included), not just discovered as a red CI build.
 */
export function summarize(
  assets: readonly Asset[],
  budgets: readonly Budget[],
): { perBudget: BudgetSummary[]; uncapped: { path: string; kb: number }[] } {
  const uncapped: { path: string; kb: number }[] = [];
  const acc = new Map<Budget, { count: number; maxKb: number }>();
  for (const asset of assets) {
    const kb = gzipKb(asset.bytes);
    const budget = budgets.find((b) => b.match(asset.path));
    if (!budget) {
      uncapped.push({ path: asset.path, kb });
      continue;
    }
    const cur = acc.get(budget) ?? { count: 0, maxKb: 0 };
    acc.set(budget, { count: cur.count + 1, maxKb: Math.max(cur.maxKb, kb) });
  }
  const perBudget: BudgetSummary[] = [];
  for (const b of budgets) {
    const a = acc.get(b);
    if (!a) continue; // a budget that governs no emitted asset
    perBudget.push({
      label: b.label,
      ceiling: b.maxGzipKb,
      count: a.count,
      tightestKb: a.maxKb,
      headroom: b.maxGzipKb - a.maxKb,
    });
  }
  return { perBudget, uncapped };
}

/**
 * Pure: budgets that PASS the real ceiling locally but whose tightest asset, plus the CI gzip overhead,
 * would breach it — i.e. a local-green / CI-red landmine. Empty when every governed asset keeps at least
 * `overheadKb` of headroom. Drives the local pre-push guard (CI's own run skips it).
 */
export function ciRisks(perBudget: readonly BudgetSummary[], overheadKb: number): BudgetSummary[] {
  return perBudget.filter((s) => s.headroom >= 0 && s.headroom < overheadKb);
}

/* v8 ignore start — filesystem + process glue; the budget logic itself is tested above */
const DIST_DIRS = ["apps/web/dist/assets"];

function collectAssets(root: string): Asset[] {
  const assets: Asset[] = [];
  for (const dir of DIST_DIRS) {
    const abs = join(root, dir);
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
      const full = join(abs, entry.name);
      assets.push({
        path: relative(root, full).split(sep).join("/"),
        bytes: readFileSync(full),
      });
    }
  }
  return assets;
}

function main(): void {
  const root = process.cwd();
  const assets = collectAssets(root);
  if (assets.length === 0) {
    console.error("Bundle budget: no emitted JS assets found — run `npm run build` first.");
    process.exit(1);
  }

  // ALWAYS print the margin table FIRST — every run, pass or fail. The headroom + the projected-CI
  // number are right here so a near-ceiling change is obvious BEFORE a push, not after a red build.
  const { perBudget } = summarize(assets, BUDGETS); // uncapped strays are caught by violations() below
  const inCi = !!process.env.CI;
  console.log(
    `bundle budget — gzip vs the committed ceiling (CI gzips ~${fmt(CI_GZIP_OVERHEAD_KB)} kB heavier than this box; CI is the ship size):`,
  );
  for (const s of [...perBudget].sort((a, b) => a.headroom - b.headroom)) {
    const projCi = s.tightestKb + CI_GZIP_OVERHEAD_KB;
    const mark = s.headroom < 0 ? "✗" : s.headroom < CI_GZIP_OVERHEAD_KB ? "⚠" : "✓";
    const note =
      s.headroom < 0
        ? " — OVER the ceiling"
        : s.headroom < CI_GZIP_OVERHEAD_KB
          ? " — NEAR the ceiling (CI may exceed)"
          : "";
    const many = s.count > 1 ? ` (tightest of ${s.count})` : "";
    console.log(`  ${mark} ${s.label}${many}`);
    console.log(
      `      ${fmt(s.tightestKb)} / ${fmt(s.ceiling)} kB gzip · ${fmt(s.headroom)} kB headroom · projected CI ~${fmt(projCi)} kB${note}`,
    );
  }

  // The hard gate (real ceiling) — this is what CI fails on, and a local real-overage too.
  const found = violations(assets, BUDGETS);
  if (found.length > 0) {
    console.error("\nBundle budget exceeded (the share page's byte ceiling):\n");
    for (const v of found) console.error(`  ${v}`);
    console.error(
      "\nThis is a fail-the-build gate, not a warning. Trim the bytes, or raise the ceiling in " +
        "scripts/check-bundle-budget.ts with a reason (a reviewed edit, never an auto-bump).",
    );
    process.exit(1);
  }

  // The LOCAL near-ceiling heads-up: under the real ceiling here, but CI's heavier gzip would breach it.
  // A WARN, never a fail — it prints LOUD so the bump/trim happens before the push. Local-only.
  const risks = !inCi ? ciRisks(perBudget, CI_GZIP_OVERHEAD_KB) : [];
  if (risks.length > 0) {
    console.warn(
      "\n⚠ NEAR-CEILING PROJECTION (a heads-up, NOT a real overage) — passes the local ceiling, but CI's heavier gzip will LIKELY red the deploy build:\n",
    );
    for (const s of risks) {
      console.warn(
        `  ${s.label}: ${fmt(s.tightestKb)} kB local + ~${fmt(CI_GZIP_OVERHEAD_KB)} kB CI overhead ≈ ${fmt(s.tightestKb + CI_GZIP_OVERHEAD_KB)} kB > ${fmt(s.ceiling)} kB ceiling`,
      );
    }
    console.warn(
      `\nBEFORE PUSHING: raise the ceiling in scripts/check-bundle-budget.ts with a reason (a reviewed ` +
        `edit — leave headroom for CI's heavier number), or trim the entry.`,
    );
  }

  const summary = `bundle budget: ${assets.length} JS asset(s) within the committed ceiling`;
  console.log(
    risks.length > 0
      ? `\n${summary} — but see the near-ceiling projection above.`
      : `\n${summary}. ✓`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
/* v8 ignore stop */
