# Interaktiver Sitzplan für kommunale Gremien

[![Tests](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/actions/workflows/tests.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-success)](https://alexschnapper.github.io/rothenburg-stadtrat-sitzplan/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45ba4b)
![Vitest](https://img.shields.io/badge/Unit%20tests-Vitest-6e9f18)

Referenzimplementierung für den Stadtrat Rothenburg ob der Tauber.

## Ziel des Projekts

Viele kommunale Sitzpläne werden ausschließlich als PDF oder Bild oder auch gar nicht veröffentlicht.

Dieses Projekt verfolgt das Ziel, eine moderne, interaktive und barrierearme Darstellung zu entwickeln, die langfristig auch für andere Kommunen wiederverwendbar sein kann.

Als Referenz dient der Sitzungssaal des Stadtrats Rothenburg ob der Tauber.

## Aktueller Schwerpunkt

🎨 **v0.4.0 – Making it beautiful**

Aktuell arbeiten wir an einer hochwertigeren, intuitiveren und moderneren
Darstellung des Ratssaals.

[Fortschritt und offene Aufgaben im Milestone ansehen](https://github.com/alexschnapper/rothenburg-stadtrat-sitzplan/milestone/3)

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

## Lokale Entwicklung

git clone ...

cd rothenburg-stadtrat-sitzplan

npm ci

npm run serve

## iFrame Einbindung
<iframe
  src="https://alexschnapper.github.io/rothenburg-stadtrat-sitzplan/"
  width="100%"
  height="900"
  loading="lazy"
></iframe>

## Geplant

JavaScript Widget

WordPress Plugin

Web Component