import { describe, expect, test } from "vitest";
import {
  createBuildInfo,
  formatBuildDate
} from "../../scripts/generate-build-info.mjs";

describe("Buildinformationen", () => {
  test("erzeugt Version, Buildnummer und deutsches Datum", () => {
    expect(
      createBuildInfo({
        version: "0.4.0",
        buildNumber: 42,
        date: new Date("2026-08-04T12:00:00Z")
      })
    ).toEqual({
      version: "0.4.0",
      buildNumber: "42",
      buildDate: "04.08.2026"
    });
  });

  test("formatiert das Datum in der Zeitzone Europe/Berlin", () => {
    expect(
      formatBuildDate(
        new Date("2026-08-03T22:30:00Z")
      )
    ).toBe("04.08.2026");
  });

  test("lehnt eine fehlende Versionsnummer ab", () => {
    expect(() =>
      createBuildInfo({
        version: "",
        buildNumber: 42
      })
    ).toThrow("Eine Versionsnummer ist erforderlich.");
  });

  test("lehnt eine nicht numerische Buildnummer ab", () => {
    expect(() =>
      createBuildInfo({
        version: "0.4.0",
        buildNumber: "lokal"
      })
    ).toThrow("Die Buildnummer muss numerisch sein.");
  });
});
