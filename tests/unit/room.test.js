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
  test("sichtbare Sitzmarkierungen überlappen sich nicht", () => {
    const visibleSeatRadius = 21;
    const minimumDistance = visibleSeatRadius * 2;
    const conflicts = [];

    for (
      let firstIndex = 0;
      firstIndex < room.seatPositions.length;
      firstIndex += 1
    ) {
      const first = room.seatPositions[firstIndex];

      for (
        let secondIndex = firstIndex + 1;
        secondIndex < room.seatPositions.length;
        secondIndex += 1
      ) {
        const second = room.seatPositions[secondIndex];

        const distance = Math.hypot(
          second.x - first.x,
          second.y - first.y
        );

        if (distance < minimumDistance) {
          conflicts.push(
            `${first.seat} ↔ ${second.seat}: ` +
            `${distance.toFixed(1)}`
          );
        }
      }
    }

    expect(
      conflicts,
      `Überlappende Sitzmarkierungen:\n${conflicts.join("\n")}`
    ).toEqual([]);
  });

  test("untere Eckbereiche bleiben frei", () => {
    const positionBySeat = new Map(
      room.seatPositions.map((position) => [
        position.seat,
        position
      ])
    );

    const leftBottom = positionBySeat.get("L10");
    const bottomLeft = positionBySeat.get("U01");
    const bottomRight = positionBySeat.get("U05");
    const rightBottom = positionBySeat.get("R01");

    expect(leftBottom).toBeDefined();
    expect(bottomLeft).toBeDefined();
    expect(bottomRight).toBeDefined();
    expect(rightBottom).toBeDefined();

    const leftCornerDistance = Math.hypot(
      bottomLeft.x - leftBottom.x,
      bottomLeft.y - leftBottom.y
    );

    const rightCornerDistance = Math.hypot(
      rightBottom.x - bottomRight.x,
      rightBottom.y - bottomRight.y
    );

    const minimumCornerDistance = 100;

    expect(
      leftCornerDistance,
      `Linker Eckbereich ist mit ${leftCornerDistance.toFixed(1)} zu eng`
    ).toBeGreaterThanOrEqual(minimumCornerDistance);

    expect(
      rightCornerDistance,
      `Rechter Eckbereich ist mit ${rightCornerDistance.toFixed(1)} zu eng`
    ).toBeGreaterThanOrEqual(minimumCornerDistance);
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