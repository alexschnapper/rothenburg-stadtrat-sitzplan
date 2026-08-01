@ -0,0 +1,37 @@
import { readFileSync } from "node:fs";

const persons = JSON.parse(
  readFileSync(new URL("../data/persons.json", import.meta.url), "utf8")
);

const requiredFields = [
  "id",
  "name",
  "faction",
  "seat",
  "office",
  "roles",
  "committees",
  "photo",
  "profileUrl"
];

let hasErrors = false;

for (const person of persons) {
  const missingFields = requiredFields.filter(
    (field) => !Object.prototype.hasOwnProperty.call(person, field)
  );

  if (missingFields.length > 0) {
    hasErrors = true;

    console.error(
      `${person.id ?? "Unbekannter Eintrag"}: fehlt ${missingFields.join(", ")}`
    );
  }
}

if (!hasErrors) {
  console.log("Alle Personeneinträge enthalten die erwarteten Felder.");
}