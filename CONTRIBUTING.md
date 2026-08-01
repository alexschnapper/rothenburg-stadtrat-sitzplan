# Mitwirken

Vielen Dank für dein Interesse an diesem Projekt.

## Entwicklungsablauf

1. Repository forken oder lokal klonen.
2. Einen thematisch passenden Branch erstellen.
3. Änderungen lokal umsetzen und prüfen.
4. Pull Request nach `main` erstellen.
5. Änderungen erst nach erfolgreichen automatisierten Checks mergen.

## Branch-Namen

Für Branches werden folgende Präfixe verwendet:

- `feature/*` für neue Funktionen
- `fix/*` für Fehlerbehebungen
- `docs/*` für Dokumentation
- `refactor/*` für interne Umstrukturierungen
- `test/*` für reine Teständerungen

Beispiele:

```text
feature/monitor-details
fix/mobile-overflow
docs/repository-quality
test/accessibility
```

## Lokale Entwicklung

### Voraussetzungen

Für die lokale Entwicklung werden benötigt:

- Node.js
- npm
- Python 3 für den lokalen Webserver
- ein moderner Browser

### Repository installieren

```bash
npm ci
```

`npm ci` installiert die in `package-lock.json` festgelegten Abhängigkeiten reproduzierbar.

### Lokalen Webserver starten

```bash
npm run serve
```

Die Anwendung ist anschließend üblicherweise unter folgender Adresse erreichbar:

```text
http://localhost:8080
```

### Alle Prüfungen ausführen

```bash
npm run test:all
```

Dieser Befehl führt nacheinander aus:

1. Validierung der Personendaten
2. Unit-Tests mit Vitest
3. Browser-Tests mit Playwright

### Einzelne Prüfungen ausführen

Personendaten validieren:

```bash
npm run validate:data
```

Unit-Tests ausführen:

```bash
npm test
```

Unit-Tests im Watch-Modus ausführen:

```bash
npm run test:watch
```

Browser-Tests ausführen:

```bash
npm run test:e2e
```

Browser-Tests mit sichtbarem Browser ausführen:

```bash
npm run test:e2e:headed
```

Playwright im interaktiven UI-Modus starten:

```bash
npm run test:e2e:ui
```

Den zuletzt erzeugten Playwright-Bericht öffnen:

```bash
npm run test:report
```

## Commits

Commit-Nachrichten sollten:

- kurz und verständlich sein,
- vorzugsweise auf Englisch formuliert werden,
- die durchgeführte Änderung beschreiben,
- möglichst nur ein zusammenhängendes Thema enthalten.

Beispiele:

```text
Add person details to monitor area
Fix mobile seatmap overflow
Update contribution guide
Add Playwright report artifacts
```

## Pull Requests

Ein Pull Request sollte:

- ein klar abgegrenztes Thema behandeln,
- eine verständliche Beschreibung enthalten,
- die Motivation der Änderung erklären,
- getestete Ansichten oder Szenarien nennen,
- bei visuellen Änderungen Screenshots enthalten,
- keine generierten Dateien enthalten,
- erfolgreiche automatisierte Checks besitzen.

Für Feature- und Fix-Branches wird derzeit bevorzugt `Squash and merge` verwendet.

## Datenänderungen

Bei Änderungen an `data/persons.json` müssen:

- alle Pflichtfelder vorhanden sein,
- Sitz-IDs eindeutig bleiben,
- Personen-IDs eindeutig bleiben,
- nur bekannte Fraktionswerte verwendet werden,
- Listenfelder als Arrays definiert sein,
- `npm run validate:data` erfolgreich sein.

Ein Personeneintrag besitzt grundsätzlich folgende Struktur:

```json
{
  "id": "person-l01",
  "name": "Vorname Nachname",
  "faction": "csu",
  "seat": "L01",
  "office": "",
  "roles": [
    "Stadtratsmitglied"
  ],
  "committees": [],
  "photo": "",
  "profileUrl": "https://ratsinfo.rothenburg.de/..."
}
```

Optionale Inhalte können leer bleiben, die Felder selbst sollten jedoch vorhanden sein.

## Responsive Änderungen

Bei Änderungen an Layout oder SVG sollten mindestens folgende Ansichten geprüft werden:

```text
320 × 568
375 × 667
390 × 844
768 × 1024
844 × 390
Desktop
```

Dabei ist insbesondere zu prüfen:

- keine horizontale Seitenüberbreite,
- alle Sitze bleiben erreichbar,
- Touch-Ziele funktionieren,
- Texte werden nicht abgeschnitten,
- Hoch- und Querformat bleiben nutzbar.

## Barrierefreiheit

Interaktive Änderungen sollen mindestens folgende Anforderungen berücksichtigen:

- vollständige Tastaturbedienung,
- sichtbarer Fokus,
- verständliche ARIA-Beschriftungen,
- ausreichende Farbkontraste,
- keine ausschließlich farbliche Informationsvermittlung,
- Screenreader-kompatible Status- und Detailausgaben.

## Generierte Dateien

Folgende Dateien und Verzeichnisse werden nicht eingecheckt:

```text
node_modules/
playwright-report/
test-results/
coverage/
.DS_Store
```

Diese Einträge müssen in `.gitignore` enthalten sein.

## Issues

Vor größeren Änderungen sollte geprüft werden, ob bereits ein passendes Issue existiert.

Neue Issues sollten:

- das Problem oder Ziel nachvollziehbar beschreiben,
- Akzeptanzkriterien enthalten,
- einem passenden Milestone zugeordnet werden,
- mit passenden Labels versehen werden.

## Verhaltenskodex

Für die Zusammenarbeit gilt der in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) dokumentierte Verhaltenskodex.