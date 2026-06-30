import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // index.ts is a pure re-export barrel — no behavior to cover
      exclude: ["src/**/*.test.ts", "src/index.ts"],
      // the design source carries the >=95% gate; CI fails below
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
