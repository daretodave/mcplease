import { defineConfig } from "@playwright/test";

// E2E runs against the real production bundle (build && preview), never the dev server. It is hermetic
// by construction: today's smoke suite makes no data calls, so it needs no database. When the create /
// share flows land, the suite gains a LOCAL supabase stack (started in CI before this runs) + a typed
// world factory — never the cloud, never a sleep, retries:0 (a retried-green test is a red test).
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
    },
  },
});
