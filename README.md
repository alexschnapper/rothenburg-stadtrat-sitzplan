# Interaktiver Sitzplan für kommunale Gremien

[![Tests](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/actions/workflows/tests.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-success)](https://alexschnapper.github.io/rothenburg-stadtrat-sitzplan/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45ba4b)
![Vitest](https://img.shields.io/badge/Unit%20tests-Vitest-6e9f18)

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| [README.md](README.md) | Projektüberblick |
| [ROADMAP.md](ROADMAP.md) | Geplante Entwicklung |
| [CHANGELOG.md](CHANGELOG.md) | Änderungen je Version |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Lokale Entwicklung |
| [docs/data-model.md](docs/data-model.md) | Datenmodell und Architektur |

Referenzimplementierung für den Stadtrat Rothenburg ob der Tauber.

## Ziel des Projekts

Viele kommunale Sitzpläne werden ausschließlich als PDF oder Bild oder auch gar nicht veröffentlicht.

Dieses Projekt verfolgt das Ziel, eine moderne, interaktive und barrierearme Darstellung zu entwickeln, die langfristig auch für andere Kommunen wiederverwendbar sein kann.

Als Referenz dient der Sitzungssaal des Stadtrats Rothenburg ob der Tauber.

## Aktueller Schwerpunkt

Der aktuelle Entwicklungsstand orientiert sich an den GitHub-Milestones.

### 🎨 v0.4.x
Verbesserung der Benutzerfreundlichkeit und Darstellung.

### 🏛️ v0.5.x
Trennung von Datenmodell und Raumkonfiguration (`room.json`).

➡️ [Milestones ansehen](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/milestones)

## Projektstatus und Projektentwicklung

Die geplanten Ausbaustufen stehen in der [Roadmap](ROADMAP.md).  
Änderungen werden im [Changelog](CHANGELOG.md) dokumentiert.  
Eine ausführliche Beschreibung der lokalen Entwicklung findest du in [CONTRIBUTING.md](CONTRIBUTING.md).

🚧 Dieses Projekt befindet sich in aktiver Entwicklung.

Bereits umgesetzt:

- Interaktiver Sitzplan
- Responsive Darstellung
- GitHub Pages
- Automatisierte Tests
- GitHub Actions
- Konfigurierbare Stadtspitze

Geplant:

- Verbesserte Informationsfläche
- JavaScript-Widget
- WordPress-Integration

## Inhalt des MVP
MVP (Minimum Viable Product)

Der aktuelle Stand des Projekts umfasst:

- interaktive Darstellung des Sitzungssaals
- 24 Sitzplätze mit Fraktionszuordnung
- Detailinformationen zu Ratsmitgliedern
- responsive Darstellung für Desktop und Smartphone
- GitHub Pages Demo
- automatisierte Tests mit Vitest und Playwright
- Datenvalidierung

## Projektstruktur

```text
data/
├── factions.json
├── people.json
├── council-seats.json
├── officials.json
└── room.json

docs/
├── data-model.md
├── CONTRIBUTING.md
├── ROADMAP.md
└── CHANGELOG.md

assets/
tests/
```
## Architekturprinzipien

Dieses Projekt folgt einigen einfachen Grundsätzen:

- 📦 Eine Datenquelle pro Information (*Single Source of Truth*)
- 🧩 Trennung von Daten und Darstellung
- 🏛️ Raumkonfiguration über `room.json`
- 🧪 Automatisierte Tests mit Vitest und Playwright
- ♿ Fokus auf Barrierefreiheit und Wiederverwendbarkeit

## Lokale Entwicklung

```bash
git clone https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan.git

cd rothenburg-stadtrat-sitzplan

npm ci

npm run serve
```
## Geplante Ausbaustufen

- JavaScript Widget
- WordPress Plugin
- Web Component
- Unterstützung weiterer Sitzungssäle
- Erweiterte Raumkonfiguration (`room.json`)

## iFrame Einbindung
<iframe
  src="https://alexschnapper.github.io/rothenburg-stadtrat-sitzplan/"
  width="100%"
  height="900"
  loading="lazy"
></iframe>