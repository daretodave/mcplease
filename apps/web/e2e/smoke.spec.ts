import { test, expect } from "@playwright/test";

test("the landing renders the brand and a link to the source", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "mcplease" })).toBeVisible();
  await expect(page.getByRole("link", { name: "github.com/daretodave/mcplease" })).toBeVisible();
});

test("a slug route resolves to the share placeholder via the SPA fallback", async ({ page }) => {
  await page.goto("/some-example-server");
  await expect(page.getByRole("heading", { name: "Connect to this MCP server" })).toBeVisible();
});
