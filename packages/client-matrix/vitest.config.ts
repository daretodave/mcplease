import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/**/*.test.ts"],
      // pure-logic packages carry a >=95% gate; CI fails below
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
