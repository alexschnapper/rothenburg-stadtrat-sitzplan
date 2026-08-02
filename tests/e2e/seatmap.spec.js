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

test.describe("Monitor-Personendetails", () => {
  test("zeigt initial die Monitoransicht", async ({ page }) => {
    await page.goto("/");

    const monitorDefault = page.locator("#monitorDefault");
    const monitorDetails = page.locator("#monitorPersonDetails");

    await expect(monitorDefault).not.toHaveAttribute("hidden", "");
    await expect(monitorDefault).toHaveAttribute("aria-hidden", "false");

    await expect(monitorDetails).toHaveAttribute("hidden", "");
    await expect(monitorDetails).toHaveAttribute("aria-hidden", "true");
  });

  test("zeigt auf Desktop die ausgewählte Person zentral", async ({
    page
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) <= 600,
      "Zentrale Personendetails werden mobil nicht verwendet."
    );

    await page.goto("/");

    await expect(page.locator(".seat")).toHaveCount(24);
    await page.locator(".seat").first().click();

    const monitorDefault = page.locator("#monitorDefault");
    const monitorDetails = page.locator("#monitorPersonDetails");

    await expect(monitorDefault).toHaveAttribute("hidden", "");
    await expect(monitorDefault).toHaveAttribute("aria-hidden", "true");

    await expect(monitorDetails).not.toHaveAttribute("hidden", "");
    await expect(monitorDetails).toHaveAttribute("aria-hidden", "false");

    await expect(page.locator("#monitorPersonName")).not.toBeEmpty();
    await expect(page.locator("#monitorFaction")).not.toBeEmpty();
  });

  test("stellt nach Reset die Monitore wieder her", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) <= 600,
      "Zentrale Personendetails werden mobil nicht verwendet."
    );

    await page.goto("/");
    await page.locator(".seat").first().click();

    await page
      .getByRole("button", { name: "Auswahl zurücksetzen" })
      .click();

    const monitorDefault = page.locator("#monitorDefault");
    const monitorDetails = page.locator("#monitorPersonDetails");

    await expect(monitorDefault).not.toHaveAttribute("hidden", "");
    await expect(monitorDefault).toHaveAttribute("aria-hidden", "false");

    await expect(monitorDetails).toHaveAttribute("hidden", "");
    await expect(monitorDetails).toHaveAttribute("aria-hidden", "true");
  });

  test("zeigt mobil weiterhin den unteren Detailbereich", async ({
    page
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) > 600,
      "Dieser Test ist nur für mobile Ansichten relevant."
    );

    await page.goto("/");
    await page.locator(".seat").first().click();

    await expect(page.locator("#personDetails")).toBeVisible();

    await expect(page.locator("#monitorDefault"))
      .not.toHaveAttribute("hidden", "");

    await expect(page.locator("#monitorPersonDetails"))
      .toHaveAttribute("hidden", "");
  });
});

test.describe("Stadtspitze und Verwaltung", () => {
  test("zeigt neun konfigurierbare Plätze", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("#officialsLayer .official")
    ).toHaveCount(9);
  });

  test("zeigt die erwarteten Platztypen", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("#officialsLayer .administration")
    ).toHaveCount(4);

    await expect(
      page.locator("#officialsLayer .mayor")
    ).toHaveCount(2);

    await expect(
      page.locator("#officialsLayer .lord-mayor")
    ).toHaveCount(1);

    await expect(
      page.locator("#officialsLayer .guest")
    ).toHaveCount(2);
  });

  test("öffnet Details nach Auswahl eines offiziellen Platzes", async ({
    page
  }) => {
    await page.goto("/");

    const official = page.locator(
      "#officialsLayer .official"
    ).first();

    await official.click();

    await expect(official).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await expect(
      page.locator("#personDetails")
    ).toBeVisible();

    await expect(
      page.locator("#detailName")
    ).not.toBeEmpty();

    await expect(
      page.locator("#detailCategoryLabel")
    ).toHaveText("Bereich");
  });

  test("kann einen offiziellen Platz per Tastatur auswählen", async ({
    page
  }) => {
    await page.goto("/");

    const official = page.locator(
      "#officialsLayer .official"
    ).first();

    await official.focus();
    await page.keyboard.press("Enter");

    await expect(official).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await expect(
      page.locator("#personDetails")
    ).toBeVisible();
  });
});