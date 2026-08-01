import { expect, test } from "@playwright/test";

test("lädt die Sitzplanseite", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Sitzordnung des Rothenburger Stadtrats"
    })
  ).toBeVisible();
});

test("zeigt genau 24 Stadtratssitze", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".seat")).toHaveCount(24);
});

test("öffnet Personendetails nach Auswahl eines Sitzes", async ({
  page
}) => {
  await page.goto("/");

  const firstSeat = page.locator(".seat").first();

  await firstSeat.click();

  await expect(page.locator("#personDetails")).toBeVisible();
  await expect(page.locator("#detailSeat")).not.toBeEmpty();
  await expect(firstSeat).toHaveAttribute("aria-pressed", "true");
});

test("Sitze können mit der Tastatur ausgewählt werden", async ({
  page
}) => {
  await page.goto("/");

  const firstSeat = page.locator(".seat").first();

  await firstSeat.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("#personDetails")).toBeVisible();
});

test("verursacht keine horizontale Überbreite", async ({ page }) => {
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth
  }));

  expect(dimensions.contentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth
  );
});