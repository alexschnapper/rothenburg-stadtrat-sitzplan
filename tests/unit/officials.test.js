import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const officials = JSON.parse(
  readFileSync(
    resolve("data/officials.json"),
    "utf8"
  )
);

const requiredFields = [
  "id",
  "seat",
  "shortLabel",
  "name",
  "office",
  "type",
  "faction",
  "party",
  "roles",
  "committees",
  "photo",
  "profileUrl",
  "email",
  "phone",
  "x",
  "y",
  "radius"
];

const allowedTypes = [
  "administration",
  "mayor",
  "lord-mayor",
  "guest"
];

describe("Official-Daten", () => {
  test("enthält neun Plätze", () => {
    expect(officials).toHaveLength(9);
  });

  test("jede ID ist eindeutig", () => {
    const ids = officials.map((official) => official.id);

    expect(new Set(ids).size).toBe(officials.length);
  });

  test("jede Sitzkennung ist eindeutig", () => {
    const seats = officials.map((official) => official.seat);

    expect(new Set(seats).size).toBe(officials.length);
  });

  test("alle Pflichtfelder sind vorhanden", () => {
    for (const official of officials) {
      for (const field of requiredFields) {
        expect(
          Object.hasOwn(official, field),
          `${official.id}: Feld "${field}" fehlt`
        ).toBe(true);
      }
    }
  });

  test("verwendet nur bekannte Official-Typen", () => {
    for (const official of officials) {
      expect(
        allowedTypes,
        `${official.id}: unbekannter Typ "${official.type}"`
      ).toContain(official.type);
    }
  });

  test("Listenfelder sind Arrays", () => {
    for (const official of officials) {
      expect(
        Array.isArray(official.roles),
        `${official.id}: roles muss ein Array sein`
      ).toBe(true);

      expect(
        Array.isArray(official.committees),
        `${official.id}: committees muss ein Array sein`
      ).toBe(true);
    }
  });

  test("optionale Zuordnungen sind String oder null", () => {
    for (const official of officials) {
      expect(
        official.faction === null ||
          typeof official.faction === "string"
      ).toBe(true);

      expect(
        official.party === null ||
          typeof official.party === "string"
      ).toBe(true);
    }
  });

  test("Position und Radius sind gültige Zahlen", () => {
    for (const official of officials) {
      expect(Number.isFinite(official.x)).toBe(true);
      expect(Number.isFinite(official.y)).toBe(true);
      expect(Number.isFinite(official.radius)).toBe(true);
      expect(official.radius).toBeGreaterThan(0);
    }
  });
});

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