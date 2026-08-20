import { test, expect } from "@playwright/test";

/**
 * The mobile drawer looked correct in the markup for several rounds while being
 * unusable in a browser. These assert the behaviour rather than the HTML.
 */
test.use({ viewport: { width: 390, height: 844 } });

test("the hamburger opens the drawer", async ({ page }) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Open menu" });
  await expect(trigger).toBeVisible();

  await trigger.click();

  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Close menu" })).toBeVisible();
});

test("the close button dismisses the drawer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();

  await page.getByRole("dialog").getByRole("button", { name: "Close menu" }).click();

  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
});

test("Escape dismisses the drawer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
});

test("a nav link closes the drawer and moves to the section", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();

  await page.getByRole("dialog").getByRole("link", { name: "How It Works" }).click();

  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
  await expect(page).toHaveURL(/#how$/);
});

test("the drawer covers the viewport and locks the page behind it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();

  const drawer = page.getByRole("dialog", { name: "Site menu" });
  await expect(drawer).toBeVisible();

  // Page-width overflow is covered properly in responsive.spec.ts, which knows
  // to ignore the marquees. What matters here is that the drawer actually
  // covers what is behind it and that the page cannot scroll away underneath.
  const box = await drawer.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(box!.height).toBeGreaterThanOrEqual(viewport.height - 1);
  expect(box!.x).toBeLessThanOrEqual(1);
  expect(box!.y).toBeLessThanOrEqual(1);

  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
});

test("the desktop nav replaces the drawer above lg", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Join as Mentee" }).first()).toBeVisible();
});
