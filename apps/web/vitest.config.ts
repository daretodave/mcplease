import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // main.tsx is the DOM bootstrap (the e2e suite boots it for real); index.ts files are barrels.
      exclude: ["src/**/*.test.{ts,tsx}", "src/main.tsx", "src/**/index.ts"],
      // the app carries the 85% gate; CI fails below
      thresholds: { lines: 85, functions: 85, branches: 85, statements: 85 },
    },
  },
});
