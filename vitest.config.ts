import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["scripts/**"],
      exclude: ["scripts/**/*.test.ts"],
      // the house checkers are pure logic; they carry the strictest (pure-logic) gate
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
