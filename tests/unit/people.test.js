import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readJson(path) {
  return JSON.parse(
    readFileSync(resolve(path), "utf8")
  );
}

const people = readJson("data/people.json");

const requiredFields = [
  "id",
  "name",
  "partyId",
  "photo",
  "profileUrl",
  "email",
  "phone"
];

describe("Personenstammdaten", () => {
  test("enthält genau 24 Personen", () => {
    expect(people).toHaveLength(24);
  });

  test("jede Personen-ID ist eindeutig", () => {
    const ids = people.map((person) => person.id);

    expect(new Set(ids).size).toBe(people.length);
  });

  test("alle Pflichtfelder sind vorhanden", () => {
    const errors = [];

    for (const person of people) {
      const missingFields = requiredFields.filter(
        (field) => !Object.hasOwn(person, field)
      );

      if (missingFields.length > 0) {
        errors.push(
          `${person.id}: ${missingFields.join(", ")}`
        );
      }
    }

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("Namen sind nicht leer", () => {
    for (const person of people) {
      expect(
        typeof person.name,
        `${person.id}: name muss ein String sein`
      ).toBe("string");

      expect(
        person.name.trim().length,
        `${person.id}: name darf nicht leer sein`
      ).toBeGreaterThan(0);
    }
  });

  test("partyId ist String oder null", () => {
    for (const person of people) {
      expect(
        person.partyId === null ||
          typeof person.partyId === "string",
        `${person.id}: partyId muss String oder null sein`
      ).toBe(true);
    }
  });

  test("Kontakt- und Profilfelder sind Strings", () => {
    const stringFields = [
      "photo",
      "profileUrl",
      "email",
      "phone"
    ];

    for (const person of people) {
      for (const field of stringFields) {
        expect(
          typeof person[field],
          `${person.id}: ${field} muss ein String sein`
        ).toBe("string");
      }
    }
  });
});