# Rothenburg Stadtrat – interaktiver Sitzplan

Erster funktionsfähiger Prototyp einer interaktiven 2D-Sitzordnung des Stadtrats Rothenburg ob der Tauber.

[![Tests](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/actions/workflows/tests.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-success)](https://alexschnapper.github.io/rothenburg-stadtrat-sitzplan/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45ba4b)
![Vitest](https://img.shields.io/badge/Unit%20tests-Vitest-6e9f18)

## Projektentwicklung

Die geplanten Ausbaustufen stehen in der [Roadmap](ROADMAP.md).  
Änderungen werden im [Changelog](CHANGELOG.md) dokumentiert.  
Hinweise zur Mitarbeit enthält [CONTRIBUTING.md](CONTRIBUTING.md).

## Inhalt des MVP

- reale U-förmige Anordnung aus Sicht der Besuchertribüne
- 24 Sitze nach Fraktionen:
  - 7 CSU
  - 3 UR
  - 5 FRV
  - 3 Grüne
  - 6 SPD
- Stadtspitze mit 1. Bürgermeister, Oberbürgermeister und 2. Bürgermeisterin
- Plätze für Verwaltung und zwei geladene Gäste
- Monitore in der Mitte
- anklickbare und per Tastatur bedienbare Sitze
- responsive Darstellung
- Daten getrennt in JSON-Dateien
- geeignet für GitHub Pages und iFrame-Einbindung

## Lokal starten

Da die JSON-Dateien per `fetch()` geladen werden, bitte einen kleinen lokalen Webserver verwenden:

```bash
python3 -m http.server 8080
```

Danach im Browser öffnen:

```text
http://localhost:8080
```

## iFrame-Einbindung

```html
<iframe
  src="https://alexschnapper.github.io/rothenburg-stadtrat-sitzplan/"
  title="Sitzordnung des Stadtrats Rothenburg ob der Tauber"
  width="100%"
  height="980"
  loading="lazy"
  style="border:0; max-width:1400px;"
></iframe>
```

## Personennamen ergänzen

Die Datei `data/persons.json` enthält aktuell Platzhalter. Das Sitzschema:

- `L01` bis `L07`: CSU, links von oben nach unten
- `L08` bis `L10`: UR, links anschließend
- `U01` bis `U05`: FRV, untere Reihe von links nach rechts
- `R01` bis `R03`: Grüne, rechts von unten nach oben
- `R04` bis `R09`: SPD, rechts anschließend nach oben

Beispiel:

```json
{
  "id": "person-l01",
  "name": "Vorname Nachname",
  "faction": "csu",
  "seat": "L01",
  "roles": ["Stadtratsmitglied"],
  "profileUrl": "https://ratsinfo.rothenburg.de/..."
}
```

## Nächste Ausbaustufen

- tatsächliche Personennamen und Profillinks eintragen
- Positionen anhand einer nummerierten Sitzskizze feinjustieren
- direkt einbettbares JavaScript-Widget
- optionales WordPress-Plugin mit Shortcode und Gutenberg-Block
- Exportansicht für SVG/PNG/PDF
- alternative Darstellung mit Namen direkt am Sitz
- Legislaturperioden als getrennte Datensätze

## Farbhinweis

Der FRV-Farbton ist aktuell als Arbeitswert `#b78b2e` angelegt und orientiert sich an einem warmen Ocker-/Goldton. Er kann in `data/factions.json` unkompliziert angepasst werden.

## Lizenz

MIT
