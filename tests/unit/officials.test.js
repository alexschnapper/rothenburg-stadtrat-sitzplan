import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readJson(path) {
  return JSON.parse(
    readFileSync(resolve(path), "utf8")
  );
}

const people = readJson("data/people.json");
const officials = readJson("data/officials.json");

const allowedTypes = [
  "administration",
  "mayor",
  "lord-mayor",
  "guest"
];

const requiredFields = [
  "id",
  "seat",
  "personId",
  "shortLabel",
  "office",
  "type",
  "roles",
  "x",
  "y",
  "radius"
];

describe("Official-Zuordnungen", () => {
  test("enthält genau neun Plätze", () => {
    expect(officials).toHaveLength(9);
  });

  test("jede Official-ID ist eindeutig", () => {
    const ids = officials.map((official) => official.id);

    expect(new Set(ids).size).toBe(officials.length);
  });

  test("jede Sitzkennung ist eindeutig", () => {
    const counts = new Map();

    for (const official of officials) {
      counts.set(
        official.seat,
        (counts.get(official.seat) ?? 0) + 1
      );
    }

    const duplicates = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([seat, count]) => `${seat} (${count}×)`);

    expect(
      duplicates,
      `Doppelte Sitzkennungen: ${duplicates.join(", ")}`
    ).toEqual([]);
  });

  test("alle Pflichtfelder sind vorhanden", () => {
    const errors = [];

    for (const official of officials) {
      const missingFields = requiredFields.filter(
        (field) => !Object.hasOwn(official, field)
      );

      if (missingFields.length > 0) {
        errors.push(
          `${official.id}: ${missingFields.join(", ")}`
        );
      }
    }

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("verwendet nur bekannte Official-Typen", () => {
    for (const official of officials) {
      expect(
        allowedTypes,
        `${official.id}: unbekannter Typ "${official.type}"`
      ).toContain(official.type);
    }
  });

  test("personId ist String oder null", () => {
    for (const official of officials) {
      expect(
        official.personId === null ||
          typeof official.personId === "string",
        `${official.id}: personId muss String oder null sein`
      ).toBe(true);
    }
  });

  test("gesetzte Personenreferenzen sind gültig", () => {
    const personIds = new Set(
      people.map((person) => person.id)
    );

    for (const official of officials) {
      if (official.personId === null) {
        continue;
      }

      expect(
        personIds.has(official.personId),
        `${official.id}: unbekannte personId "${official.personId}"`
      ).toBe(true);
    }
  });

  test("roles ist immer ein Array", () => {
    for (const official of officials) {
      expect(
        Array.isArray(official.roles),
        `${official.id}: roles muss ein Array sein`
      ).toBe(true);
    }
  });

  test("Positionen und Radius sind gültige Zahlen", () => {
    for (const official of officials) {
      expect(
        Number.isFinite(official.x),
        `${official.id}: x muss eine Zahl sein`
      ).toBe(true);

      expect(
        Number.isFinite(official.y),
        `${official.id}: y muss eine Zahl sein`
      ).toBe(true);

      expect(
        Number.isFinite(official.radius),
        `${official.id}: radius muss eine Zahl sein`
      ).toBe(true);

      expect(
        official.radius,
        `${official.id}: radius muss größer als 0 sein`
      ).toBeGreaterThan(0);
    }
  });
  test("jede Position ist eindeutig", () => {
    const positions = officials.map(
      (official) => `${official.x}:${official.y}`
    );

    const duplicates = positions.filter(
      (position, index) =>
        positions.indexOf(position) !== index
    );

    expect(
      duplicates,
      `Doppelte Positionen: ${duplicates.join(", ")}`
    ).toEqual([]);
  });
});