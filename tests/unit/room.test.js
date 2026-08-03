import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readJson(path) {
  return JSON.parse(
    readFileSync(resolve(path), "utf8")
  );
}

const room = readJson("data/room.json");
const councilSeats = readJson("data/council-seats.json");

describe("Raumkonfiguration", () => {
  test("enthält die erwarteten Hauptbereiche", () => {
    expect(room).toHaveProperty("metadata");
    expect(room).toHaveProperty("viewBox");
    expect(room).toHaveProperty("seatRows");
  });

  test("enthält gültige Metadaten", () => {
    expect(typeof room.metadata.id).toBe("string");
    expect(room.metadata.id.trim().length).toBeGreaterThan(0);

    expect(typeof room.metadata.name).toBe("string");
    expect(room.metadata.name.trim().length).toBeGreaterThan(0);

    expect(Number.isInteger(room.metadata.version)).toBe(true);
    expect(room.metadata.version).toBeGreaterThan(0);
  });

  test("enthält eine gültige SVG-ViewBox", () => {
    expect(Number.isFinite(room.viewBox.width)).toBe(true);
    expect(Number.isFinite(room.viewBox.height)).toBe(true);

    expect(room.viewBox.width).toBeGreaterThan(0);
    expect(room.viewBox.height).toBeGreaterThan(0);
  });

  test("enthält die drei erwarteten Sitzreihen", () => {
    expect(Object.keys(room.seatRows).sort()).toEqual(
      ["bottom", "left", "right"].sort()
    );
  });

  test("enthält insgesamt 24 Stadtratssitze", () => {
    const totalSeats = Object.values(room.seatRows)
      .reduce((sum, row) => sum + row.count, 0);

    expect(totalSeats).toBe(24);
  });

  test("verwendet positive ganzzahlige Sitzanzahlen", () => {
    for (const [rowId, row] of Object.entries(room.seatRows)) {
      expect(
        Number.isInteger(row.count),
        `${rowId}: count muss eine ganze Zahl sein`
      ).toBe(true);

      expect(
        row.count,
        `${rowId}: count muss größer als 0 sein`
      ).toBeGreaterThan(0);
    }
  });
});

test("enthält genau 24 Sitzpositionen", () => {
  expect(room.seatPositions).toHaveLength(24);
});

test("jede Sitzposition verwendet eine eindeutige Sitzkennung", () => {
  const seatIds = room.seatPositions.map(
    (position) => position.seat
  );

  const duplicates = seatIds.filter(
    (seat, index) => seatIds.indexOf(seat) !== index
  );

  expect(
    [...new Set(duplicates)],
    `Doppelte Sitzpositionen: ${duplicates.join(", ")}`
  ).toEqual([]);
});

test("jede Sitzposition enthält gültige Koordinaten", () => {
  for (const position of room.seatPositions) {
    expect(
      typeof position.seat,
      "seat muss ein String sein"
    ).toBe("string");

    expect(
      position.seat.trim().length,
      "seat darf nicht leer sein"
    ).toBeGreaterThan(0);

    expect(
      Number.isFinite(position.x),
      `${position.seat}: x muss eine Zahl sein`
    ).toBe(true);

    expect(
      Number.isFinite(position.y),
      `${position.seat}: y muss eine Zahl sein`
    ).toBe(true);
  }
});

test("Raumpositionen und Sitzzuordnungen stimmen überein", () => {
  const positionSeats = new Set(
    room.seatPositions.map((position) => position.seat)
  );

  const assignmentSeats = new Set(
    councilSeats.map((assignment) => assignment.seat)
  );

  const positionsWithoutAssignment = [...positionSeats]
    .filter((seat) => !assignmentSeats.has(seat));

  const assignmentsWithoutPosition = [...assignmentSeats]
    .filter((seat) => !positionSeats.has(seat));

  expect(
    positionsWithoutAssignment,
    `Positionen ohne Sitzzuordnung: ${positionsWithoutAssignment.join(", ")}`
  ).toEqual([]);

  expect(
    assignmentsWithoutPosition,
    `Sitzzuordnungen ohne Position: ${assignmentsWithoutPosition.join(", ")}`
  ).toEqual([]);
});