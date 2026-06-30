import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Dummy public config so the data handle's Supabase client constructs under test; every network call
    // is mocked, so these values are never dialled. The sitekey stays unset, so Turnstile takes its dev
    // fallback unless a test opts into the widget path.
    env: {
      VITE_SUPABASE_URL: "http://localhost:55421",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
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
