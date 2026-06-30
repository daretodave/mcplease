import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // the /web binding touches document/window — jsdom gives the suite a DOM
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // index.ts is a pure re-export barrel — no behavior to cover
      exclude: ["src/**/*.test.ts", "src/index.ts"],
      // shared packages carry a >=95% gate; CI fails below
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 },
    },
  },
});
