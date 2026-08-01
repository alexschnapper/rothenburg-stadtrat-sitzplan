
const seatCoordinates = [
  // linke Tischseite, von oben nach unten: 7 CSU, 3 UR
  ...Array.from({length: 10}, (_, i) => ({ id: `L${String(i+1).padStart(2,'0')}`, x: 185, y: 220 + i * 36 })),
  // untere Reihe, links nach rechts: 5 FRV
  ...Array.from({length: 5}, (_, i) => ({ id: `U${String(i+1).padStart(2,'0')}`, x: 330 + i * 95, y: 600 })),
  // rechte Tischseite, von unten nach oben: 3 Grüne, 6 SPD
  ...Array.from({length: 9}, (_, i) => ({ id: `R${String(i+1).padStart(2,'0')}`, x: 855, y: 575 - i * 42 }))
];

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} konnte nicht geladen werden.`);
  return response.json();
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function factionFor(id, factions) {
  return factions.find(f => f.id === id);
}

function renderLegend(factions) {
  const legend = document.getElementById("legend");
  legend.innerHTML = factions.map(f => `
    <span class="legend-item">
      <span class="legend-dot" style="background:${f.color}"></span>
      <strong>${f.shortName}</strong> ${f.seats} Sitze
    </span>`).join("");
}

function showPerson(person, faction, seatNode) {
  document.querySelectorAll(".seat").forEach(el => el.setAttribute("aria-pressed", "false"));
  seatNode.setAttribute("aria-pressed", "true");
  document.getElementById("emptyState").hidden = true;
  document.getElementById("personDetails").hidden = false;
  const badge = document.getElementById("detailFactionBadge");
  badge.textContent = faction.shortName;
  badge.style.background = faction.color;
  badge.style.color = faction.textColor;
  document.getElementById("detailName").textContent = person.name;
  document.getElementById("detailRole").textContent = person.roles.join(" · ");
  document.getElementById("detailSeat").textContent = person.seat;
  document.getElementById("detailFaction").textContent = faction.name;
  document.getElementById("detailLink").href = person.profileUrl;
}

function resetSelection() {
  document.querySelectorAll(".seat").forEach(el => el.setAttribute("aria-pressed", "false"));
  document.getElementById("emptyState").hidden = false;
  document.getElementById("personDetails").hidden = true;
}

async function init() {
  try {
    const [factions, persons] = await Promise.all([
      loadJson("data/factions.json"),
      loadJson("data/persons.json")
    ]);
    renderLegend(factions);
    const layer = document.getElementById("seatsLayer");

    seatCoordinates.forEach(position => {
      const person = persons.find(p => p.seat === position.id);
      if (!person) return;
      const faction = factionFor(person.faction, factions);
      const group = svgEl("g", {
        class: "seat",
        transform: `translate(${position.x} ${position.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": `${person.name}, ${faction.name}, Sitz ${person.seat}`,
        "aria-pressed": "false"
      });
      const circle = svgEl("circle", { r: "18", fill: faction.color });
      const text = svgEl("text", { fill: faction.textColor, y: "1" });
      text.textContent = faction.shortName === "Grüne" ? "GR" : faction.shortName;
      const title = svgEl("title");
      title.textContent = `${person.name} – ${faction.shortName}`;
      group.append(circle, text, title);
      group.addEventListener("click", () => showPerson(person, faction, group));
      group.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showPerson(person, faction, group);
        }
      });
      layer.appendChild(group);
    });

    document.getElementById("resetSelection").addEventListener("click", resetSelection);
    document.addEventListener("keydown", event => { if (event.key === "Escape") resetSelection(); });
  } catch (error) {
    console.error(error);
    document.querySelector(".map-wrap").insertAdjacentHTML("afterbegin",
      `<p role="alert"><strong>Hinweis:</strong> Die JSON-Daten konnten nicht geladen werden. Starte die Seite über einen lokalen Webserver oder GitHub Pages, nicht direkt als Datei.</p>`);
  }
}
init();
