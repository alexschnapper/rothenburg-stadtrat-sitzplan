import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFile);

const personsPath = resolve(
  currentDirectory,
  "../../data/persons.json"
);

const persons = JSON.parse(
  readFileSync(personsPath, "utf8")
);

describe("Personendaten", () => {
  test("enthält genau 24 Sitze", () => {
    expect(persons).toHaveLength(24);
  });

  test("jede Sitznummer ist eindeutig", () => {
    const seatIds = persons.map((person) => person.seat);

    expect(new Set(seatIds).size).toBe(persons.length);
  });

  test("jede Personen-ID ist eindeutig", () => {
    const personIds = persons.map((person) => person.id);

    expect(new Set(personIds).size).toBe(persons.length);
  });

  test("alle Pflichtfelder sind vorhanden", () => {
  const requiredFields = [
  "id",
  "seat",
  "name",
  "office",
  "faction",
  "party",
  "roles",
  "committees",
  "photo",
  "profileUrl",
  "email",
  "phone"
];

  const errors = [];

  for (const person of persons) {
    const missingFields = requiredFields.filter(
      (field) => !Object.prototype.hasOwnProperty.call(person, field)
    );

    if (missingFields.length > 0) {
      errors.push(
        `${person.id ?? "Unbekannter Eintrag"}: ${missingFields.join(", ")}`
      );
    }
  }

  expect(errors, errors.join("\n")).toEqual([]);
});

  test("nur bekannte Fraktionen werden verwendet", () => {
    const allowedFactions = [
      "csu",
      "ur",
      "frv",
      "gruene",
      "spd"
    ];

    for (const person of persons) {
      expect(allowedFactions).toContain(person.faction);
    }
  });
});

test("Listenfelder besitzen den richtigen Datentyp", () => {
  for (const person of persons) {
    expect(
      Array.isArray(person.roles),
      `${person.id}: roles muss ein Array sein`
    ).toBe(true);

    expect(
      Array.isArray(person.committees),
      `${person.id}: committees muss ein Array sein`
    ).toBe(true);
  }
});

test("Fraktion ist bei allen Stadtratsmitgliedern gesetzt", () => {
  for (const person of persons) {
    expect(typeof person.faction).toBe("string");
    expect(person.faction.length).toBeGreaterThan(0);
  }
});

test("Parteizugehörigkeit ist String oder null", () => {
  for (const person of persons) {
    expect(
      person.party === null ||
        typeof person.party === "string"
    ).toBe(true);
  }
});