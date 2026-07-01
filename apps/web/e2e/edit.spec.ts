import { expect, test } from "@playwright/test";

// The edit route drives the shipped bundle. The hermetic suite has no backend, so the token's data state is
// nondeterministic (it loads, errors, or misses) — but every edit-page state (loading, error, dead-token
// not-found) renders the same topbar, so the home link is the stable proof the SPA booted on /e/<uuid>
// past the two-segment deep link, rather than 404ing on the edge. The backed edit flow (a real link minted
// against a local stack, then loaded behind its token) lands with the supabase-backed harness.
test("a deep-linked edit token boots the SPA via the fallback", async ({ page }) => {
  await page.goto("/e/00000000-0000-4000-8000-000000000000");
  await expect(page.getByRole("link", { name: "mcplease home" })).toBeVisible();
});
