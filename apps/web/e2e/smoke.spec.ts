import { test, expect } from "@playwright/test";

test("the landing renders the create form and a link to the source", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your MCP server/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
});

test("a deep-linked slug boots the share SPA via the fallback", async ({ page }) => {
  await page.goto("/some-example-server");
  // Deep-linking past "/" must serve the SPA shell, not a host 404. The hermetic suite has no backend,
  // so the slug's data state is nondeterministic (it loads, errors, or misses) — but every share-page
  // state renders the same chrome, so the home link is the stable proof the app booted on this route.
  await expect(page.getByRole("link", { name: "mcplease home" })).toBeVisible();
});
