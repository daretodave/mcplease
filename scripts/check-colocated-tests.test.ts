import { describe, it, expect } from "vitest";
import {
  EXEMPT,
  isBarrel,
  hasSiblingTest,
  violations,
  type SourceFile,
} from "./check-colocated-tests.js";

describe("isBarrel", () => {
  it("treats a pure re-export module as a barrel", () => {
    expect(isBarrel(`export { a, b } from "./a.js";\nexport * from "./b.js";`)).toBe(true);
  });

  it("treats a `export type { … } from` module as a barrel", () => {
    expect(isBarrel(`export type { Foo } from "./types.js";`)).toBe(true);
  });

  it("ignores comments and blank lines when deciding", () => {
    const src = `// a leading line comment\n/* a block */\n\nexport * from "./x.js";\n`;
    expect(isBarrel(src)).toBe(true);
  });

  it("is not a barrel when any statement has behavior", () => {
    expect(isBarrel(`export const x = 1;\nexport * from "./y.js";`)).toBe(false);
  });

  it("is not a barrel when empty", () => {
    expect(isBarrel("")).toBe(false);
    expect(isBarrel("// only a comment\n")).toBe(false);
  });
});

describe("hasSiblingTest", () => {
  const all = new Set([
    "packages/slug/src/index.ts",
    "packages/slug/src/index.test.ts",
    "apps/web/src/app.tsx",
    "apps/web/src/app.behavior.test.tsx",
    "packages/data/src/client.ts",
  ]);

  it("matches a same-name .test sibling", () => {
    expect(hasSiblingTest("packages/slug/src/index.ts", all)).toBe(true);
  });

  it("matches a qualified <aspect>.test sibling", () => {
    expect(hasSiblingTest("apps/web/src/app.tsx", all)).toBe(true);
  });

  it("is false when no sibling test exists", () => {
    expect(hasSiblingTest("packages/data/src/client.ts", all)).toBe(false);
  });

  it("is false for a path that is not a ts module", () => {
    expect(hasSiblingTest("packages/slug/src/index.css", all)).toBe(false);
  });
});

describe("violations", () => {
  it("flags a source file without a neighbour test", () => {
    const files: SourceFile[] = [
      { path: "packages/slug/src/rules.ts", content: "export const x = 1;" },
    ];
    expect(violations(files)).toEqual(["packages/slug/src/rules.ts"]);
  });

  it("passes when the neighbour test is present", () => {
    const files: SourceFile[] = [
      { path: "packages/slug/src/rules.ts", content: "export const x = 1;" },
      { path: "packages/slug/src/rules.test.ts", content: "" },
    ];
    expect(violations(files)).toEqual([]);
  });

  it("exempts a barrel and the EXEMPT roster", () => {
    const files: SourceFile[] = [
      { path: "packages/model/src/index.ts", content: `export * from "./types.js";` },
      { path: "packages/model/src/types.ts", content: "export interface T { a: number }" },
      { path: "packages/model/src/database.types.ts", content: "export type Database = unknown;" },
    ];
    expect(violations(files)).toEqual([]);
  });

  it("ignores test files and declaration files as subjects", () => {
    const files: SourceFile[] = [
      { path: "packages/slug/src/index.test.ts", content: "" },
      { path: "packages/slug/src/global.d.ts", content: "" },
    ];
    expect(violations(files)).toEqual([]);
  });

  it("keeps the EXEMPT roster honest (each entry carries a reason)", () => {
    expect(EXEMPT.length).toBeGreaterThan(0);
    for (const e of EXEMPT) expect(e.reason.length).toBeGreaterThan(0);
  });
});
