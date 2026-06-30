import { expect, test } from "@playwright/test";

// Drives the shipped bundle's create form end-to-end through the UI. Hermetic: no slug here triggers a
// server lookup (an invalid one is judged locally; the others are left blank), and Turnstile is in its dev
// fallback, so nothing leaves the page. The backed submit (a real create against a local stack) lands with
// the supabase-backed harness.

test("reveals the right fields for each transport", async ({ page }) => {
  await page.goto("/");

  // http is the default — one remote URL field
  await expect(page.getByLabel("Server URL")).toBeVisible();

  // a local (stdio) server reveals the clone/build/run trio and hides the remote URL
  await page.getByRole("radio", { name: /Local server/i }).click();
  await expect(page.getByLabel("Clone")).toBeVisible();
  await expect(page.getByLabel(/Run target/i)).toBeVisible();
  await expect(page.getByLabel("Server URL")).toHaveCount(0);

  // back to remote
  await page.getByRole("radio", { name: /Remote URL/i }).click();
  await expect(page.getByLabel("Server URL")).toBeVisible();
});

test("the details expander reveals the optional fields", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Name")).toHaveCount(0);

  await page.getByRole("button", { name: /Add details/i }).click();

  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel(/Tagline/i)).toBeVisible();
});

test("submit unlocks once the server is filled and the human check passes", async ({ page }) => {
  await page.goto("/");

  // the dev Turnstile fallback shows the verified affordance
  await expect(page.getByText(/verified by Turnstile/i)).toBeVisible();

  const submit = page.getByRole("button", { name: /create my link/i });
  await expect(submit).toBeDisabled();

  await page.getByLabel("Server URL").fill("https://example.com/mcp");
  await expect(submit).toBeEnabled();
});

test("an invalid slug is flagged instantly, with no network round-trip", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel(/Claim your slug/i).fill("-");
  await expect(page.getByText(/letters, numbers and dashes/i)).toBeVisible();
});
