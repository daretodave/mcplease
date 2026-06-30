import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // database.types.ts is generated, types.ts is pure declarations, index.ts is a
      // pure re-export barrel — no behavior to cover in any of them
      exclude: ["src/**/*.test.ts", "src/database.types.ts", "src/types.ts", "src/index.ts"],
      // pure-logic packages carry a >=95% gate; CI fails below
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
