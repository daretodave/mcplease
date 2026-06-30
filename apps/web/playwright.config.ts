import { defineConfig } from "@playwright/test";

// E2E runs against the real production bundle (build && preview), never the dev server. It is hermetic
// by construction: the suite drives the UI only — the create page builds its data client from the dummy
// public env below but makes no real calls (an unreachable lookup fails open, by design), and Turnstile
// takes its dev fallback when the sitekey is empty. The backed submit path (a LOCAL supabase stack + the
// edge functions under wrangler + a test Turnstile secret) slots in here next. No sleeps, retries:0.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
    env: {
      // analytics stays OFF for the hermetic suite — a process-env VITE_ var wins over .env files
      VITE_GA4_MEASUREMENT_ID: "",
      // Dummy public config so the data client constructs; no real Supabase is dialled by the UI suite.
      VITE_SUPABASE_URL: "http://127.0.0.1:55421",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
      // Empty sitekey → the Turnstile widget takes its dev fallback (no third-party script, fully hermetic).
      VITE_TURNSTILE_SITEKEY: "",
    },
  },
});
