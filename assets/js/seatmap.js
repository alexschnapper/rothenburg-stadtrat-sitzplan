let uiTexts = null;
async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} konnte nicht geladen werden.`);
  }

  return response.json();
}

function valueAtPath(source, path) {
  return path
    .split(".")
    .reduce(
      (current, segment) => current?.[segment],
      source
    );
}

function uiText(path, fallback = "") {
  const value = valueAtPath(uiTexts, path);

  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function applyUiTexts(texts) {
  document.title = uiText(
    "page.documentTitle",
    document.title
  );

  const description =
    document.getElementById("pageDescription");

  if (description) {
    description.content = uiText(
      "page.description",
      description.content
    );
  }

  document
    .querySelectorAll("[data-ui-text]")
    .forEach((element) => {
      const path =
        element.dataset.uiText;

      const value =
        valueAtPath(texts, path);

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        element.textContent = value;
      }
    });

  document
    .querySelectorAll("[data-ui-aria-label]")
    .forEach((element) => {
      const path =
        element.dataset.uiAriaLabel;

      const value =
        valueAtPath(texts, path);

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        element.setAttribute(
          "aria-label",
          value
        );
      }
    });
}

function applyProjectMetadata(metadata) {
  const version = document.getElementById("appVersion");

  if (
    version &&
    typeof metadata.version === "string" &&
    metadata.version.trim()
  ) {
    version.textContent = `v${metadata.version}`;
  }
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

/*
 * Daten-Lookups
 */

function factionFor(id, factions) {
  return (
    factions.find((faction) => faction.id === id) ??
    null
  );
}

function personFor(personId, people) {
  if (!personId) {
    return null;
  }

  return (
    people.find((person) => person.id === personId) ??
    null
  );
}

function councilSeatFor(seatId, councilSeats) {
  return (
    councilSeats.find(
      (assignment) => assignment.seat === seatId
    ) ?? null
  );
}

/*
 * Anzeigeobjekte
 *
 * people.json enthält die Stammdaten.
 * council-seats.json und officials.json enthalten die jeweilige
 * Zuordnung beziehungsweise Funktion.
 */

function buildCouncilDisplayData(assignment, person) {
  return {
    id: assignment.id,
    seat: assignment.seat,
    name:
      person?.name ||
      uiText(
        "details.unassignedName",
        "Nicht besetzt"
      ),
    office: assignment.office || "",
    roles: Array.isArray(assignment.roles)
      ? assignment.roles
      : [],
    committees: Array.isArray(assignment.committees)
      ? assignment.committees
      : [],
    profileUrl: person?.profileUrl || "",
    photo: person?.photo || ""
  };
}

function buildOfficialDisplayData(official, person) {
  return {
    ...official,
    name: person?.name || "",
    profileUrl: person?.profileUrl || "",
    photo: person?.photo || ""
  };
}

/*
 * Legende
 */

function renderLegend(factions) {
  const legend =
    document.getElementById("legend");

  const seatsLabel = uiText(
    "legend.seatsLabel",
    "Sitze"
  );

  legend.innerHTML = factions
    .map(
      (faction) => `
        <span class="legend-item">
          <span
            class="legend-dot"
            style="background:${faction.color}"
          ></span>

          <strong>${faction.shortName}</strong>
          ${faction.seats} ${seatsLabel}
        </span>
      `
    )
    .join("");
}

/*
 * Text-Hilfsfunktionen
 */

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

/*
 * Allgemeine Auswahl
 */

function clearSelectedElements() {
  document
    .querySelectorAll(".seat, .official")
    .forEach((element) => {
      element.setAttribute("aria-pressed", "false");
    });
}

/*
 * Officials
 */

function officialCategory(type) {
  const labels = {
    administration: uiText(
      "categories.administration",
      "Stadtverwaltung"
    ),
    mayor: uiText(
      "categories.leadership",
      "Stadtspitze"
    ),
    "lord-mayor": uiText(
      "categories.leadership",
      "Stadtspitze"
    ),
    guest: uiText(
      "categories.invitedGuests",
      "Geladene Gäste"
    )
  };

  return labels[type] || uiText(
    "categories.officialsFallback",
    "Stadtspitze und Verwaltung"
  );
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

  parts.push(
    `${uiText("details.placeLabel", "Platz")} ` +
    `${official.seat}`
  );

  return parts.join(", ");
}

function renderOfficials(officials, people) {
  const layer = document.getElementById(
    "officialsLayer"
  );

  if (!layer) {
    throw new Error(
      "Das SVG-Element #officialsLayer wurde nicht gefunden."
    );
  }

  layer.replaceChildren();

  officials.forEach((official) => {
    const person = personFor(
      official.personId,
      people
    );

    const displayOfficial =
      buildOfficialDisplayData(
        official,
        person
      );

    const group = svgEl("g", {
      class: `official ${displayOfficial.type}`,
      transform:
        `translate(${displayOfficial.x} ${displayOfficial.y})`,
      tabindex: "0",
      role: "button",
      "aria-label":
        buildOfficialAriaLabel(displayOfficial),
      "aria-pressed": "false"
    });

    const hitArea = svgEl("circle", {
      class: "official-hit-area",
      r: String(
        Math.max(displayOfficial.radius + 8, 30)
      ),
      fill: "transparent"
    });

    const visibleCircle = svgEl("circle", {
      class: "official-marker",
      r: String(displayOfficial.radius)
    });

    const text = svgEl("text", {
      y: "4"
    });

    text.textContent =
      displayOfficial.shortLabel;

    const title = svgEl("title");

    title.textContent = displayOfficial.name
      ? `${displayOfficial.name} – ${displayOfficial.office}`
      : displayOfficial.office;

    group.append(
      hitArea,
      visibleCircle,
      text,
      title
    );

    group.addEventListener("click", () => {
      showOfficial(
        displayOfficial,
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

          showOfficial(
            displayOfficial,
            group
          );
        }
      }
    );

    layer.appendChild(group);
  });
}

/*
 * Detailbereich
 */

function setDetailLink(profileUrl) {
  const detailLink =
    document.getElementById("detailLink");

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
    document.getElementById(
      "detailCommitteesRow"
    );

  const committeesValue =
    document.getElementById(
      "detailCommittees"
    );

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
  document.getElementById(
    "emptyState"
  ).hidden = true;

  document.getElementById(
    "personDetails"
  ).hidden = false;

  const badge =
    document.getElementById(
      "detailFactionBadge"
    );

  badge.textContent = badgeText;
  badge.style.background = badgeColor;
  badge.style.color = badgeTextColor;

  document.getElementById(
    "detailName"
  ).textContent = name;

  document.getElementById(
    "detailRole"
  ).textContent = detailText;

  document.getElementById(
    "detailSeat"
  ).textContent = seat;

  document.getElementById(
    "detailCategoryLabel"
  ).textContent = categoryLabel;

  document.getElementById(
    "detailFaction"
  ).textContent = categoryValue;

  setCommittees(committees);
  setDetailLink(profileUrl);
}

/*
 * Zentraler Informationsbildschirm
 */

function showPersonInMonitor(person, faction) {
  if (
    window.matchMedia(
      "(max-width: 600px)"
    ).matches
  ) {
    return;
  }

  const monitorDefault =
    document.getElementById(
      "monitorDefault"
    );

  const monitorDetails =
    document.getElementById(
      "monitorPersonDetails"
    );

  const factionLabel =
    document.getElementById(
      "monitorFaction"
    );

  const personName =
    document.getElementById(
      "monitorPersonName"
    );

  const personOffice =
    document.getElementById(
      "monitorPersonOffice"
    );

  const personRoles =
    document.getElementById(
      "monitorPersonRoles"
    );

  const factionAccent =
    document.getElementById(
      "monitorFactionAccent"
    );

  factionLabel.textContent =
    faction.shortName;

  setSvgTextLines(
    personName,
    splitText(person.name, 27),
    392,
    320,
    28
  );

  personOffice.textContent =
    truncateText(person.office, 38);

  const roleText =
    Array.isArray(person.roles)
      ? person.roles.join(" · ")
      : "";

  personRoles.textContent =
    truncateText(roleText, 46);

  personOffice.style.display =
    person.office ? "inline" : "none";

  personRoles.style.display =
    roleText ? "inline" : "none";

  factionAccent.style.fill =
    faction.color;

  monitorDefault.setAttribute(
    "hidden",
    ""
  );

  monitorDefault.setAttribute(
    "aria-hidden",
    "true"
  );

  monitorDetails.removeAttribute(
    "hidden"
  );

  monitorDetails.setAttribute(
    "aria-hidden",
    "false"
  );
}

function showOfficialInMonitor(official) {
  if (
    window.matchMedia(
      "(max-width: 600px)"
    ).matches
  ) {
    return;
  }

  const monitorDefault =
    document.getElementById(
      "monitorDefault"
    );

  const monitorDetails =
    document.getElementById(
      "monitorPersonDetails"
    );

  const categoryLabel =
    document.getElementById(
      "monitorFaction"
    );

  const personName =
    document.getElementById(
      "monitorPersonName"
    );

  const personOffice =
    document.getElementById(
      "monitorPersonOffice"
    );

  const personRoles =
    document.getElementById(
      "monitorPersonRoles"
    );

  const factionAccent =
    document.getElementById(
      "monitorFactionAccent"
    );

  categoryLabel.textContent =
    officialCategory(official.type);

  setSvgTextLines(
    personName,
    splitText(
      official.name || official.office,
      27
    ),
    392,
    320,
    28
  );

  personOffice.textContent =
    official.name
      ? truncateText(official.office, 38)
      : "";

  const roleText =
    Array.isArray(official.roles)
      ? official.roles.join(" · ")
      : "";

  personRoles.textContent =
    truncateText(roleText, 46);

  personOffice.style.display =
    official.name && official.office
      ? "inline"
      : "none";

  personRoles.style.display =
    roleText ? "inline" : "none";

  factionAccent.style.fill =
    officialColor(official.type);

  monitorDefault.setAttribute(
    "hidden",
    ""
  );

  monitorDefault.setAttribute(
    "aria-hidden",
    "true"
  );

  monitorDetails.removeAttribute(
    "hidden"
  );

  monitorDetails.setAttribute(
    "aria-hidden",
    "false"
  );
}

/*
 * Auswahl von Ratsmitgliedern und Officials
 */

function showPerson(
  person,
  faction,
  seatNode
) {
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
    categoryLabel: uiText(
      "details.factionLabel",
      "Fraktion"
    ),
    categoryValue: faction.name,
    committees: person.committees,
    profileUrl: person.profileUrl
  });

  showPersonInMonitor(person, faction);
  updateMobileMonitorHint(true);
}

function showOfficial(
  official,
  officialNode
) {
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
    badgeColor:
      officialColor(official.type),
    badgeTextColor:
      officialTextColor(official.type),
    name:
      official.name || official.office,
    detailText:
      detailParts.join(" · "),
    seat: official.seat,
    categoryLabel: uiText(
      "details.areaLabel",
      "Bereich"
    ),
    categoryValue:
      officialCategory(official.type),
    committees: [],
    profileUrl: official.profileUrl
  });

  showOfficialInMonitor(official);
  updateMobileMonitorHint(true);
}

/*
 * Reset und mobile Hinweise
 */

function resetSelection() {
  clearSelectedElements();

  document.getElementById(
    "emptyState"
  ).hidden = false;

  document.getElementById(
    "personDetails"
  ).hidden = true;

  const monitorDefault =
    document.getElementById(
      "monitorDefault"
    );

  const monitorDetails =
    document.getElementById(
      "monitorPersonDetails"
    );

  monitorDefault.removeAttribute(
    "hidden"
  );

  monitorDefault.setAttribute(
    "aria-hidden",
    "false"
  );

  monitorDetails.setAttribute(
    "hidden",
    ""
  );

  monitorDetails.setAttribute(
    "aria-hidden",
    "true"
  );

  updateMobileMonitorHint(false);
}

function updateMobileMonitorHint(
  hasSelection
) {
  if (
    !window.matchMedia(
      "(max-width: 600px)"
    ).matches
  ) {
    return;
  }

  const hint =
    document.getElementById(
      "monitorDefaultHint"
    );

  if (!hint) {
    return;
  }

  hint.textContent = hasSelection
    ? uiText(
        "display.mobileSelectionHint",
        "Details unterhalb des Sitzplans"
      )
    : uiText(
        "display.defaultHint",
        "Bitte einen Sitz auswählen"
      );
}

/*
 * Stadtratssitze
 */

function renderCouncilSeats(
  people,
  councilSeats,
  factions,
  seatPositions
) {
  const layer =
    document.getElementById(
      "seatsLayer"
    );

  if (!layer) {
    throw new Error(
      "Das SVG-Element #seatsLayer wurde nicht gefunden."
    );
  }

  if (!Array.isArray(seatPositions)) {
    throw new Error(
      "room.seatPositions muss ein Array sein."
    );
  }

  layer.replaceChildren();

  seatPositions.forEach((position) => {
    const assignment =
      councilSeatFor(
        position.seat,
        councilSeats
      );

    if (!assignment) {
      console.warn(
        `Keine Sitzzuordnung für ${position.seat} gefunden.`
      );

      return;
    }

    const person =
      personFor(
        assignment.personId,
        people
      );

    const faction =
      factionFor(
        assignment.factionId,
        factions
      );

    if (!faction) {
      console.warn(
        `Keine Fraktion für Sitz ${position.seat} gefunden.`
      );

      return;
    }

    const displayData =
      buildCouncilDisplayData(
        assignment,
        person
      );

    const group = svgEl("g", {
      class: "seat",
      transform:
        `translate(${position.x} ${position.y})`,
      tabindex: "0",
      role: "button",
      "aria-label":
        `${displayData.name}, ${faction.name}, Sitz ${displayData.seat}`,
      "aria-pressed": "false"
    });

    const hitArea = svgEl("circle", {
      class: "seat-hit-area",
      r: "32",
      fill: "transparent"
    });

    const visibleCircle =
      svgEl("circle", {
        r: "21",
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
      `${displayData.name} – ${faction.shortName}`;

    group.append(
      hitArea,
      visibleCircle,
      text,
      title
    );

    group.addEventListener(
      "click",
      () => {
        showPerson(
          displayData,
          faction,
          group
        );
      }
    );

    group.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          showPerson(
            displayData,
            faction,
            group
          );
        }
      }
    );

    layer.appendChild(group);
  });
}

/*
 * Initialisierung
 */

async function init() {
  try {
    const [
      factions,
      people,
      councilSeats,
      officials,
      room,
      loadedUiTexts,
      projectMetadata
    ] = await Promise.all([
      loadJson("data/factions.json"),
      loadJson("data/people.json"),
      loadJson("data/council-seats.json"),
      loadJson("data/officials.json"),
      loadJson("data/room.json"),
      loadJson("data/ui-texts.json"),
      loadJson("package.json")
    ]);

    uiTexts = loadedUiTexts;
    applyUiTexts(uiTexts);
    applyProjectMetadata(projectMetadata);

    renderLegend(factions);

    renderOfficials(
      officials,
      people
    );

    renderCouncilSeats(
      people,
      councilSeats,
      factions,
      room.seatPositions
    );

    document
      .getElementById(
        "resetSelection"
      )
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

    const title = uiText(
      "errors.dataLoadTitle",
      "Hinweis:"
    );

    const text = uiText(
      "errors.dataLoadText",
      "Die Daten konnten nicht geladen werden."
    );

    document
      .querySelector(".map-wrap")
      .insertAdjacentHTML(
        "afterbegin",
        `<p role="alert">
          <strong>${title}</strong>
          ${text}
        </p>`
      );
  }
}

init();
