import { expect, test } from "@playwright/test";

test("lädt die Sitzplanseite", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Sitzordnung des Rothenburger Stadtrats"
    })
  ).toBeVisible();
});

test("zeigt lokal Version und Entwicklungshinweis im Footer", async ({
  page
}) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");

  await expect(footer.locator("#appVersion")).toHaveText("v0.4.0");

  await expect(
    footer.locator("#localBuildHint")
  ).toContainText("Lokale Entwicklung");

  await expect(
    footer.locator("#buildDetails")
  ).toBeHidden();

  await expect(
    footer.getByRole("link", { name: "Projekt auf GitHub" })
  ).toHaveAttribute(
    "href",
    "https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan"
  );
});

test("zeigt automatisch erzeugte Buildinformationen", async ({
  page
}) => {
  await page.route("**/data/build-info.json", async (route) => {
    await route.fulfill({
      json: {
        version: "0.4.0",
        buildNumber: "42",
        buildDate: "04.08.2026"
      }
    });
  });

  await page.goto("/");

  const footer = page.getByRole("contentinfo");

  await expect(footer.locator("#appVersion")).toHaveText("v0.4.0");
  await expect(footer.locator("#appBuildNumber")).toHaveText("42");
  await expect(footer.locator("#appBuildDate")).toHaveText(
    "04.08.2026"
  );

  await expect(
    footer.locator("#buildDetails")
  ).toContainText("Build 42 · Stand 04.08.2026");

  await expect(
    footer.locator("#localBuildHint")
  ).toBeHidden();
});

test("zeigt fünf Fraktionsbereiche", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".faction-area")).toHaveCount(5);
  await expect(page.locator(".seat")).toHaveCount(0);
});

test("öffnet Fraktionsdetails nach Auswahl eines Bereichs", async ({
  page
}) => {
  await page.goto("/");

  const firstArea = page.locator(".faction-area").first();

  await firstArea.click();

  await expect(page.locator("#personDetails")).toBeVisible();
  await expect(page.locator("#detailFaction")).not.toBeEmpty();
  await expect(firstArea).toHaveAttribute("aria-pressed", "true");
  await expect(
    firstArea.locator(".faction-area-selection")
  ).toBeVisible();
});

test("entfernt die sichtbare Fraktionsauswahl beim Reset", async ({
  page
}) => {
  await page.goto("/");

  const firstArea = page.locator(".faction-area").first();
  const selection = firstArea.locator(".faction-area-selection");

  await expect(selection).toBeHidden();
  await firstArea.click();
  await expect(selection).toBeVisible();

  await page
    .getByRole("button", { name: "Auswahl zurücksetzen" })
    .click();

  await expect(firstArea).toHaveAttribute("aria-pressed", "false");
  await expect(selection).toBeHidden();
});

test("verlinkt Fraktionsdetails mit dem Ratsinformationssystem", async ({
  page
}) => {
  await page.goto("/");

  await page.locator(".faction-area").first().click();

  const link = page.getByRole("link", {
    name: "Zum Ratsinformationssystem"
  });

  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute(
    "href",
    "https://ratsinfo.rothenburg.de/fraktionen"
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener");
});

test("Fraktionsbereiche können mit der Tastatur ausgewählt werden", async ({
  page
}) => {
  await page.goto("/");

  const firstArea = page.locator(".faction-area").first();

  await firstArea.focus();
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

    await expect(page.locator(".faction-area")).toHaveCount(5);
    await page.locator(".faction-area").first().click();

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
    await page.locator(".faction-area").first().click();

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
    await page.locator(".faction-area").first().click();

    await expect(page.locator("#personDetails")).toBeVisible();

    await expect(page.locator("#centralDisplayFrame")).toBeHidden();
    await expect(page.locator("#monitorDefault")).toBeHidden();
    await expect(page.locator("#monitorPersonDetails")).toBeHidden();
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
test("zeigt einen zentralen Informationsbildschirm", async ({
  page
}) => {
  await page.goto("/");

  await expect(
    page.locator("#centralDisplayFrame")
  ).toHaveCount(1);

  await expect(
    page.locator(
      "#centralDisplayFrame .central-display-screen"
    )
  ).toHaveCount(1);

  await expect(
    page.locator("#monitorDefault")
  ).not.toHaveAttribute("hidden", "");
});
test("behält den Displayrahmen nach Fraktionsauswahl", async ({
  page
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) <= 600,
    "Die zentrale Detailanzeige wird mobil nicht verwendet."
  );

  await page.goto("/");

  await page.locator(".faction-area").first().click();

  await expect(
    page.locator("#centralDisplayFrame")
  ).toHaveCount(1);

  await expect(
    page.locator("#monitorPersonDetails")
  ).not.toHaveAttribute("hidden", "");

  await expect(
    page.locator("#monitorPersonDetails")
  ).toHaveAttribute("aria-hidden", "false");
});

test("zeigt den längsten Fraktionsnamen vollständig im Monitor", async ({
  page
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) <= 600,
    "Die zentrale Detailanzeige wird mobil nicht verwendet."
  );

  await page.goto("/");

  await page
    .getByRole("button", {
      name: /Sozialdemokratische Partei Deutschlands/
    })
    .click();

  await expect(
    page.locator("#monitorPersonName tspan")
  ).toHaveText([
    "Sozialdemokratische Partei",
    "Deutschlands"
  ]);

  const bounds = await page.evaluate(() => {
    const screen = document
      .querySelector(".central-display-screen")
      .getBoundingClientRect();
    const name = document
      .querySelector("#monitorPersonName")
      .getBoundingClientRect();

    return {
      screenLeft: screen.left,
      screenRight: screen.right,
      screenTop: screen.top,
      screenBottom: screen.bottom,
      nameLeft: name.left,
      nameRight: name.right,
      nameTop: name.top,
      nameBottom: name.bottom
    };
  });

  expect(bounds.nameLeft).toBeGreaterThan(bounds.screenLeft);
  expect(bounds.nameRight).toBeLessThan(bounds.screenRight);
  expect(bounds.nameTop).toBeGreaterThan(bounds.screenTop);
  expect(bounds.nameBottom).toBeLessThan(bounds.screenBottom);
});
test("blendet den zentralen Monitor mobil vollständig aus", async ({
  page
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) > 600,
    "Dieser Test ist nur für mobile Ansichten relevant."
  );

  await page.goto("/");

  await expect(page.locator("#centralDisplayFrame")).toBeHidden();
  await expect(page.locator("#monitorDefault")).toBeHidden();
  await expect(page.locator("#monitorPersonDetails")).toBeHidden();

  await page.locator(".faction-area").first().click();

  await expect(page.locator("#centralDisplayFrame")).toBeHidden();
  await expect(page.locator("#monitorDefault")).toBeHidden();
  await expect(page.locator("#monitorPersonDetails")).toBeHidden();
  await expect(page.locator("#personDetails")).toBeVisible();
});
test("setzt mobil den unteren Detailbereich zurück", async ({
  page
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) > 600,
    "Dieser Test ist nur für mobile Ansichten relevant."
  );

  await page.goto("/");

  await page.locator(".faction-area").first().click();

  await expect(page.locator("#personDetails")).toBeVisible();

  await page
    .getByRole("button", { name: "Auswahl zurücksetzen" })
    .click();

  await expect(page.locator("#personDetails")).toBeHidden();
  await expect(page.locator("#emptyState")).toBeVisible();
  await expect(page.locator("#centralDisplayFrame")).toBeHidden();
});
