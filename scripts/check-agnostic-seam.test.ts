import { describe, it, expect } from "vitest";
import {
  BANNED,
  CORE_FILES,
  literals,
  violations,
  type SourceFile,
} from "./check-agnostic-seam.js";

describe("literals", () => {
  it("collects string and template-literal values with 1-based lines", () => {
    const src = `const a = "first";\nconst b = \`tmpl \${a} tail\`;\n`;
    const found = literals(src);
    expect(found.map((l) => l.text)).toContain("first");
    expect(found.find((l) => l.text === "first")?.line).toBe(1);
    // the template head ("tmpl ") + tail (" tail") are both literal segments
    expect(found.some((l) => l.text.includes("tmpl"))).toBe(true);
    expect(found.some((l) => l.text.includes("tail"))).toBe(true);
  });

  it("does not treat comment text as a literal", () => {
    const src = `// rgba(1,2,3,0.5) is fine in a comment\nconst x = 1;\n`;
    expect(literals(src)).toHaveLength(0);
  });
});

describe("violations", () => {
  it("flags a rgba() materialization in a literal", () => {
    const files: SourceFile[] = [
      { path: "packages/theme/src/tokens.ts", content: `export const w = "rgba(0,0,0,0.5)";` },
    ];
    const out = violations(files);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("rgb()/rgba()");
    expect(out[0]).toContain("packages/theme/src/tokens.ts:1");
  });

  it("flags a px dimension, a color-mix, a var(), and font stacks", () => {
    const files: SourceFile[] = [
      { path: "a.ts", content: `const a = "14px";` },
      { path: "b.ts", content: `const b = "color-mix(in srgb, red 6%, transparent)";` },
      { path: "c.ts", content: `const c = "var(--accent)";` },
      { path: "d.ts", content: `const d = "Nunito, system-ui, sans-serif";` },
    ];
    // d.ts trips BOTH system-ui and sans-serif → two findings
    expect(violations(files)).toHaveLength(5);
  });

  it("passes structured values (a bare hex, a numeric, a bare unit label)", () => {
    const files: SourceFile[] = [
      {
        path: "packages/theme/src/tokens.ts",
        content: `export const c = "#0C0E13";\nexport const n = 14;\nexport const unit = "px";`,
      },
    ];
    expect(violations(files)).toEqual([]);
  });

  it("exposes the three core files and a non-empty ban list", () => {
    expect(CORE_FILES).toHaveLength(3);
    expect(CORE_FILES).toContain("packages/theme/src/tokens.ts");
    expect(BANNED.length).toBeGreaterThan(0);
  });
});
