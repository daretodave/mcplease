import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // index.ts is a pure re-export barrel — no behavior to cover
      exclude: ["src/**/*.test.ts", "src/index.ts"],
      // the seam is vendor glue, not pure logic — the overall 85% gate applies
      thresholds: { lines: 85, functions: 85, branches: 85, statements: 85 },
    },
  },
});
