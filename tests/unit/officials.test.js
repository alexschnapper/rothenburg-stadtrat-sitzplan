import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const officials = JSON.parse(
  readFileSync(
    resolve("data/officials.json"),
    "utf8"
  )
);

describe("Stadtspitze und Verwaltung", () => {
  test("enthält neun Plätze", () => {
    expect(officials).toHaveLength(9);
  });

  test("jede ID und Sitznummer ist eindeutig", () => {
    const ids = officials.map((item) => item.id);
    const seats = officials.map((item) => item.seat);

    expect(new Set(ids).size).toBe(officials.length);
    expect(new Set(seats).size).toBe(officials.length);
  });

  test("jeder Platz enthält die Pflichtfelder", () => {
    const requiredFields = [
      "id",
      "seat",
      "shortLabel",
      "name",
      "office",
      "type",
      "x",
      "y",
      "radius",
      "roles",
      "profileUrl"
    ];

    for (const official of officials) {
      for (const field of requiredFields) {
        expect(
          Object.hasOwn(official, field),
          `${official.id}: ${field} fehlt`
        ).toBe(true);
      }
    }
  });
});