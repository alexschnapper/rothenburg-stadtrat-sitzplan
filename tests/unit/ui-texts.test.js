import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readJson(path) {
  return JSON.parse(
    readFileSync(resolve(path), "utf8")
  );
}

const uiTexts = readJson("data/ui-texts.json");

function valueAtPath(source, path) {
  return path
    .split(".")
    .reduce(
      (current, segment) => current?.[segment],
      source
    );
}

describe("UI-Texte", () => {
  test("enthält die erwarteten Hauptbereiche", () => {
    expect(Object.keys(uiTexts).sort()).toEqual(
      [
        "audience",
        "categories",
        "details",
        "display",
        "errors",
        "explanation",
        "legend",
        "page",
        "seatmap"
      ].sort()
    );
  });

  test("alle Pflichttexte sind vorhanden und nicht leer", () => {
    const requiredTextPaths = [
      "page.documentTitle",
      "page.description",
      "page.eyebrow",
      "page.title",
      "page.lead",

      "seatmap.title",
      "seatmap.summary",
      "seatmap.officialsLabel",
      "seatmap.resetButton",
      "seatmap.svgTitle",
      "seatmap.svgDescription",
      "seatmap.officialsAriaLabel",
      "seatmap.councilSeatsAriaLabel",

      "display.eyebrow",
      "display.title",
      "display.description",
      "display.defaultHint",
      "display.mobileSelectionHint",
      "display.detailHint",

      "details.emptyTitle",
      "details.emptyText",
      "details.seatLabel",
      "details.placeLabel",
      "details.factionLabel",
      "details.areaLabel",
      "details.committeesLabel",
      "details.profileLink",
      "details.unassignedName",

      "categories.administration",
      "categories.leadership",
      "categories.invitedGuests",
      "categories.officialsFallback",

      "legend.ariaLabel",
      "legend.seatsLabel",

      "audience.label",

      "explanation.leadershipTitle",
      "explanation.leadershipText",
      "explanation.administrationTitle",
      "explanation.administrationText",
      "explanation.displayTitle",
      "explanation.displayText",

      "errors.dataLoadTitle",
      "errors.dataLoadText",
      "errors.missingOfficialsLayer",
      "errors.missingSeatsLayer",
      "errors.invalidSeatPositions"
    ];

    const invalidPaths = requiredTextPaths.filter(
      (path) => {
        const value = valueAtPath(uiTexts, path);

        return (
          typeof value !== "string" ||
          value.trim().length === 0
        );
      }
    );

    expect(
      invalidPaths,
      `Fehlende oder leere UI-Texte:\n${invalidPaths.join("\n")}`
    ).toEqual([]);
  });

  test("enthält keine unerwarteten Nicht-String-Werte", () => {
    const invalidValues = [];

    function inspect(value, path = "") {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        for (
          const [key, nestedValue] of Object.entries(value)
        ) {
          inspect(
            nestedValue,
            path ? `${path}.${key}` : key
          );
        }

        return;
      }

      if (typeof value !== "string") {
        invalidValues.push(path);
      }
    }

    inspect(uiTexts);

    expect(
      invalidValues,
      `UI-Werte müssen Strings sein:\n${invalidValues.join("\n")}`
    ).toEqual([]);
  });
});