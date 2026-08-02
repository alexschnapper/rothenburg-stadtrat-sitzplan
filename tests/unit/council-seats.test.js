import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readJson(path) {
  return JSON.parse(
    readFileSync(resolve(path), "utf8")
  );
}

const people = readJson("data/people.json");
const factions = readJson("data/factions.json");
const councilSeats = readJson("data/council-seats.json");

const requiredFields = [
  "id",
  "seat",
  "personId",
  "factionId",
  "office",
  "roles",
  "committees"
];

describe("Stadtratssitz-Zuordnungen", () => {
  test("enthält genau 24 Sitzzuordnungen", () => {
    expect(councilSeats).toHaveLength(24);
  });

  test("alle Pflichtfelder sind vorhanden", () => {
    const errors = [];

    for (const assignment of councilSeats) {
      const missingFields = requiredFields.filter(
        (field) => !Object.hasOwn(assignment, field)
      );

      if (missingFields.length > 0) {
        errors.push(
          `${assignment.id ?? "unbekannter Eintrag"}: ` +
          `${missingFields.join(", ")}`
        );
      }
    }

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("technische IDs sind eindeutig", () => {
    const ids = councilSeats.map(
      (assignment) => assignment.id
    );

    expect(new Set(ids).size).toBe(councilSeats.length);
  });

  test("Sitzkennungen sind eindeutig", () => {
    const seats = councilSeats.map(
      (assignment) => assignment.seat
    );

    expect(new Set(seats).size).toBe(councilSeats.length);
  });

  test("Personenreferenzen sind gültig", () => {
    const personIds = new Set(
      people.map((person) => person.id)
    );

    const errors = councilSeats
      .filter(
        (assignment) =>
          !personIds.has(assignment.personId)
      )
      .map(
        (assignment) =>
          `${assignment.id}: unbekannte personId ` +
          `"${assignment.personId}"`
      );

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("Fraktionsreferenzen sind gültig", () => {
    const factionIds = new Set(
      factions.map((faction) => faction.id)
    );

    const errors = councilSeats
      .filter(
        (assignment) =>
          !factionIds.has(assignment.factionId)
      )
      .map(
        (assignment) =>
          `${assignment.id}: unbekannte factionId ` +
          `"${assignment.factionId}"`
      );

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("office ist immer ein String", () => {
    for (const assignment of councilSeats) {
      expect(
        typeof assignment.office,
        `${assignment.id}: office muss ein String sein`
      ).toBe("string");
    }
  });

  test("Rollen und Ausschüsse sind Arrays", () => {
    for (const assignment of councilSeats) {
      expect(
        Array.isArray(assignment.roles),
        `${assignment.id}: roles muss ein Array sein`
      ).toBe(true);

      expect(
        Array.isArray(assignment.committees),
        `${assignment.id}: committees muss ein Array sein`
      ).toBe(true);
    }
  });
});