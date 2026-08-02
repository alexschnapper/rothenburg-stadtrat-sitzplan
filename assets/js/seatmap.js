const seatCoordinates = [
  // Linke Tischseite, von oben nach unten:
  // 7 CSU, anschließend 3 UR.
  ...Array.from(
    { length: 10 },
    (_, index) => ({
      id: `L${String(index + 1).padStart(2, "0")}`,
      x: 185,
      y: 220 + index * 36
    })
  ),

  // Untere Reihe, von links nach rechts:
  // 5 FRV.
  ...Array.from(
    { length: 5 },
    (_, index) => ({
      id: `U${String(index + 1).padStart(2, "0")}`,
      x: 330 + index * 95,
      y: 600
    })
  ),

  // Rechte Tischseite, von unten nach oben:
  // 3 Grüne, anschließend 6 SPD.
  ...Array.from(
    { length: 9 },
    (_, index) => ({
      id: `R${String(index + 1).padStart(2, "0")}`,
      x: 855,
      y: 575 - index * 42
    })
  )
];

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} konnte nicht geladen werden.`);
  }

  return response.json();
}

function svgEl(name, attrs = {}) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    name
  );

  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function factionFor(id, factions) {
  return factions.find((faction) => faction.id === id);
}

function renderLegend(factions) {
  const legend = document.getElementById("legend");

  legend.innerHTML = factions
    .map(
      (faction) => `
        <span class="legend-item">
          <span
            class="legend-dot"
            style="background:${faction.color}"
          ></span>

          <strong>${faction.shortName}</strong>
          ${faction.seats} Sitze
        </span>
      `
    )
    .join("");
}

function truncateText(value, maxLength = 32) {
  if (!value) {
    return "";
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}…`
    : value;
}

function splitText(value, maxLength = 23) {
  if (!value) {
    return [];
  }

  const words = value.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (candidate.length <= maxLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
}

function setSvgTextLines(
  element,
  lines,
  startX,
  startY,
  lineHeight
) {
  element.replaceChildren();

  lines.forEach((line, index) => {
    const tspan = svgEl("tspan", {
      x: String(startX),
      y: String(startY + index * lineHeight)
    });

    tspan.textContent = line;
    element.appendChild(tspan);
  });
}

function clearSelectedElements() {
  document
    .querySelectorAll(".seat, .official")
    .forEach((element) => {
      element.setAttribute("aria-pressed", "false");
    });
}

function officialCategory(type) {
  const labels = {
    administration: "Stadtverwaltung",
    mayor: "Stadtspitze",
    "lord-mayor": "Stadtspitze",
    guest: "Geladene Gäste"
  };

  return labels[type] || "Stadtspitze und Verwaltung";
}

function officialColor(type) {
  const colors = {
    administration: "#6f767c",
    mayor: "#8b6f52",
    "lord-mayor": "#34302c",
    guest: "#b78b2e"
  };

  return colors[type] || "#6f767c";
}

function officialTextColor(type) {
  return type === "guest"
    ? "#241b08"
    : "#ffffff";
}

function buildOfficialAriaLabel(official) {
  const parts = [];

  if (official.name) {
    parts.push(official.name);
  }

  if (official.office) {
    parts.push(official.office);
  }

  parts.push(`Platz ${official.seat}`);

  return parts.join(", ");
}

function renderOfficials(officials) {
  const layer = document.getElementById("officialsLayer");

  if (!layer) {
    throw new Error(
      "Das SVG-Element #officialsLayer wurde nicht gefunden."
    );
  }

  layer.replaceChildren();

  officials.forEach((official) => {
    const group = svgEl("g", {
      class: `official ${official.type}`,
      transform: `translate(${official.x} ${official.y})`,
      tabindex: "0",
      role: "button",
      "aria-label": buildOfficialAriaLabel(official),
      "aria-pressed": "false"
    });

    const hitArea = svgEl("circle", {
      class: "official-hit-area",
      r: String(Math.max(official.radius + 8, 30)),
      fill: "transparent"
    });

    const visibleCircle = svgEl("circle", {
      class: "official-marker",
      r: String(official.radius)
    });

    const text = svgEl("text", {
      y: "4"
    });

    text.textContent = official.shortLabel;

    const title = svgEl("title");

    title.textContent = official.name
      ? `${official.name} – ${official.office}`
      : official.office;

    group.append(
      hitArea,
      visibleCircle,
      text,
      title
    );

    group.addEventListener("click", () => {
      showOfficial(official, group);
    });

    group.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        showOfficial(official, group);
      }
    });

    layer.appendChild(group);
  });
}

function setDetailLink(profileUrl) {
  const detailLink = document.getElementById("detailLink");

  if (profileUrl) {
    detailLink.href = profileUrl;
    detailLink.hidden = false;
    return;
  }

  detailLink.removeAttribute("href");
  detailLink.hidden = true;
}

function setCommittees(committees) {
  const committeesRow =
    document.getElementById("detailCommitteesRow");

  const committeesValue =
    document.getElementById("detailCommittees");

  if (
    Array.isArray(committees) &&
    committees.length > 0
  ) {
    committeesValue.textContent =
      committees.join(", ");

    committeesRow.hidden = false;
    return;
  }

  committeesValue.textContent = "";
  committeesRow.hidden = true;
}

function showDetailsPanel({
  badgeText,
  badgeColor,
  badgeTextColor,
  name,
  detailText,
  seat,
  categoryLabel,
  categoryValue,
  committees = [],
  profileUrl = ""
}) {
  document.getElementById("emptyState").hidden = true;
  document.getElementById("personDetails").hidden = false;

  const badge =
    document.getElementById("detailFactionBadge");

  badge.textContent = badgeText;
  badge.style.background = badgeColor;
  badge.style.color = badgeTextColor;

  document.getElementById("detailName").textContent =
    name;

  document.getElementById("detailRole").textContent =
    detailText;

  document.getElementById("detailSeat").textContent =
    seat;

  document
    .getElementById("detailCategoryLabel")
    .textContent = categoryLabel;

  document.getElementById("detailFaction").textContent =
    categoryValue;

  setCommittees(committees);
  setDetailLink(profileUrl);
}

function showPersonInMonitor(person, faction) {
  if (
    window.matchMedia("(max-width: 600px)").matches
  ) {
    return;
  }

  const monitorDefault =
    document.getElementById("monitorDefault");

  const monitorDetails =
    document.getElementById("monitorPersonDetails");

  const factionLabel =
    document.getElementById("monitorFaction");

  const personName =
    document.getElementById("monitorPersonName");

  const personOffice =
    document.getElementById("monitorPersonOffice");

  const personRoles =
    document.getElementById("monitorPersonRoles");

  const factionAccent =
    document.getElementById("monitorFactionAccent");

  factionLabel.textContent = faction.shortName;

  setSvgTextLines(
    personName,
    splitText(person.name, 23),
    425,
    348,
    27
  );

  personOffice.textContent =
    truncateText(person.office, 32);

  const roleText = Array.isArray(person.roles)
    ? person.roles.join(" · ")
    : "";

  personRoles.textContent =
    truncateText(roleText, 38);

  personOffice.style.display =
    person.office ? "inline" : "none";

  personRoles.style.display =
    roleText ? "inline" : "none";

  factionAccent.style.fill = faction.color;

  monitorDefault.setAttribute("hidden", "");
  monitorDefault.setAttribute(
    "aria-hidden",
    "true"
  );

  monitorDetails.removeAttribute("hidden");
  monitorDetails.setAttribute(
    "aria-hidden",
    "false"
  );
}

function showOfficialInMonitor(official) {
  if (
    window.matchMedia("(max-width: 600px)").matches
  ) {
    return;
  }

  const monitorDefault =
    document.getElementById("monitorDefault");

  const monitorDetails =
    document.getElementById("monitorPersonDetails");

  const categoryLabel =
    document.getElementById("monitorFaction");

  const personName =
    document.getElementById("monitorPersonName");

  const personOffice =
    document.getElementById("monitorPersonOffice");

  const personRoles =
    document.getElementById("monitorPersonRoles");

  const factionAccent =
    document.getElementById("monitorFactionAccent");

  categoryLabel.textContent =
    officialCategory(official.type);

  setSvgTextLines(
    personName,
    splitText(
      official.name || official.office,
      23
    ),
    425,
    348,
    27
  );

  personOffice.textContent =
    official.name
      ? truncateText(official.office, 32)
      : "";

  const roleText = Array.isArray(official.roles)
    ? official.roles.join(" · ")
    : "";

  personRoles.textContent =
    truncateText(roleText, 38);

  personOffice.style.display =
    official.name && official.office
      ? "inline"
      : "none";

  personRoles.style.display =
    roleText ? "inline" : "none";

  factionAccent.style.fill =
    officialColor(official.type);

  monitorDefault.setAttribute("hidden", "");
  monitorDefault.setAttribute(
    "aria-hidden",
    "true"
  );

  monitorDetails.removeAttribute("hidden");
  monitorDetails.setAttribute(
    "aria-hidden",
    "false"
  );
}

function showPerson(person, faction, seatNode) {
  clearSelectedElements();

  seatNode.setAttribute(
    "aria-pressed",
    "true"
  );

  const detailParts = [];

  if (person.office) {
    detailParts.push(person.office);
  }

  if (
    Array.isArray(person.roles) &&
    person.roles.length > 0
  ) {
    detailParts.push(...person.roles);
  }

  showDetailsPanel({
    badgeText: faction.shortName,
    badgeColor: faction.color,
    badgeTextColor: faction.textColor,
    name: person.name,
    detailText: detailParts.join(" · "),
    seat: person.seat,
    categoryLabel: "Fraktion",
    categoryValue: faction.name,
    committees: person.committees,
    profileUrl: person.profileUrl
  });

  showPersonInMonitor(person, faction);
}

function showOfficial(official, officialNode) {
  clearSelectedElements();

  officialNode.setAttribute(
    "aria-pressed",
    "true"
  );

  const detailParts = [];

  if (
    official.name &&
    official.office
  ) {
    detailParts.push(official.office);
  }

  if (
    Array.isArray(official.roles) &&
    official.roles.length > 0
  ) {
    detailParts.push(...official.roles);
  }

  showDetailsPanel({
    badgeText: official.shortLabel,
    badgeColor: officialColor(official.type),
    badgeTextColor:
      officialTextColor(official.type),
    name: official.name || official.office,
    detailText: detailParts.join(" · "),
    seat: official.seat,
    categoryLabel: "Bereich",
    categoryValue:
      officialCategory(official.type),
    committees: [],
    profileUrl: official.profileUrl
  });

  showOfficialInMonitor(official);
}

function resetSelection() {
  clearSelectedElements();

  document.getElementById("emptyState").hidden =
    false;

  document.getElementById("personDetails").hidden =
    true;

  const monitorDefault =
    document.getElementById("monitorDefault");

  const monitorDetails =
    document.getElementById("monitorPersonDetails");

  monitorDefault.removeAttribute("hidden");
  monitorDefault.setAttribute(
    "aria-hidden",
    "false"
  );

  monitorDetails.setAttribute("hidden", "");
  monitorDetails.setAttribute(
    "aria-hidden",
    "true"
  );
}

function renderCouncilSeats(
  persons,
  factions
) {
  const layer =
    document.getElementById("seatsLayer");

  layer.replaceChildren();

  seatCoordinates.forEach((position) => {
    const person = persons.find(
      (candidate) =>
        candidate.seat === position.id
    );

    if (!person) {
      return;
    }

    const faction = factionFor(
      person.faction,
      factions
    );

    if (!faction) {
      console.warn(
        `Unbekannte Fraktion für ${person.id}: ${person.faction}`
      );

      return;
    }

    const group = svgEl("g", {
      class: "seat",
      transform:
        `translate(${position.x} ${position.y})`,
      tabindex: "0",
      role: "button",
      "aria-label":
        `${person.name}, ${faction.name}, Sitz ${person.seat}`,
      "aria-pressed": "false"
    });

    const hitArea = svgEl("circle", {
      class: "seat-hit-area",
      r: "30",
      fill: "transparent"
    });

    const visibleCircle = svgEl("circle", {
      r: "18",
      fill: faction.color
    });

    const text = svgEl("text", {
      fill: faction.textColor,
      y: "1"
    });

    text.textContent =
      faction.shortName === "Grüne"
        ? "GR"
        : faction.shortName;

    const title = svgEl("title");

    title.textContent =
      `${person.name} – ${faction.shortName}`;

    group.append(
      hitArea,
      visibleCircle,
      text,
      title
    );

    group.addEventListener("click", () => {
      showPerson(
        person,
        faction,
        group
      );
    });

    group.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          showPerson(
            person,
            faction,
            group
          );
        }
      }
    );

    layer.appendChild(group);
  });
}

async function init() {
  try {
    const [
      factions,
      persons,
      officials
    ] = await Promise.all([
      loadJson("data/factions.json"),
      loadJson("data/persons.json"),
      loadJson("data/officials.json")
    ]);

    renderLegend(factions);
    renderOfficials(officials);
    renderCouncilSeats(persons, factions);

    document
      .getElementById("resetSelection")
      .addEventListener(
        "click",
        resetSelection
      );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          resetSelection();
        }
      }
    );
  } catch (error) {
    console.error(error);

    document
      .querySelector(".map-wrap")
      .insertAdjacentHTML(
        "afterbegin",
        `
          <p role="alert">
            <strong>Hinweis:</strong>
            Die Daten konnten nicht geladen werden.
            Starte die Seite über einen lokalen Webserver
            oder GitHub Pages, nicht direkt als Datei.
          </p>
        `
      );
  }
}

init();