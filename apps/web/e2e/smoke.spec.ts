import { test, expect } from "@playwright/test";

test("the landing renders the create form and a link to the source", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your MCP server/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
});

test("a slug route resolves to the share placeholder via the SPA fallback", async ({ page }) => {
  await page.goto("/some-example-server");
  await expect(page.getByRole("heading", { name: "Connect to this MCP server" })).toBeVisible();
});
