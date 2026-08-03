# Datenmodell

## Überblick

Die Anwendung trennt bewusst zwischen Personen, Sitzzuordnungen,
Fraktionen, Officials und Raumgeometrie. 

Dieses Dokument beschreibt das logische Datenmodell.

Es dokumentiert sowohl den aktuellen Stand als auch bereits
beschlossene Zielstrukturen zukünftiger Versionen.

| Datei | Aufgabe |
|-------|----------|
| `factions.json` | Fraktionen und Farben |
| `persons.json` | Stammdaten der Personen |
| `council-seats.json` | Zuordnung Person ↔ Sitz ↔ Fraktion |
| `officials.json` | Stadtspitze, Verwaltung und Gäste |
| `room.json` | Räumliche Anordnung des Sitzungssaals |

## Beziehungen der Datenquellen

Das folgende Diagramm zeigt, wie die verschiedenen Datenquellen
miteinander verbunden sind.

```mermaid
flowchart TD
    people["people.json<br/>Personenstammdaten"]
    factions["factions.json<br/>Fraktionen und Farben"]
    councilSeats["council-seats.json<br/>Sitz- und Fraktionszuordnungen"]
    officials["officials.json<br/>Stadtspitze, Verwaltung und Gäste"]
    room["room.json<br/>Raum und Geometrie"]
    renderer["seatmap.js<br/>Darstellung und Interaktion"]

    people -->|"personId"| councilSeats
    factions -->|"factionId"| councilSeats

    people -.->|"optionale personId"| officials

    room -->|"Sitzkennungen und Positionen"| councilSeats
    room -->|"Official-Plätze"| officials

    people --> renderer
    factions --> renderer
    councilSeats --> renderer
    officials --> renderer
    room --> renderer
```

## Vereinfachtes UML-Datenmodell

> Die Beziehungen zwischen `room.json`, den Stadtratssitzen und den
> Official-Plätzen beschreiben das geplante Zielmodell. Die Koordinaten
> werden erst in nachfolgenden Issues aus `seatmap.js` und
> `officials.json` in die Raumkonfiguration verschoben.

```mermaid
classDiagram
    class Person {
        +String id
        +String name
        +String|null partyId
        +String photo
        +String profileUrl
        +String email
        +String phone
    }

    class Faction {
        +String id
        +String name
        +String shortName
        +String color
        +String textColor
        +Number seats
    }

    class CouncilSeat {
        +String id
        +String seat
        +String personId
        +String factionId
        +String office
        +String[] roles
        +String[] committees
    }

    class Official {
        +String id
        +String seat
        +String|null personId
        +String shortLabel
        +String office
        +String type
        +String[] roles
    }

    class Room {
        +Metadata metadata
        +ViewBox viewBox
        +SeatRows seatRows
    }

    class Metadata {
        +String id
        +String name
        +Number version
    }

    class ViewBox {
        +Number width
        +Number height
    }

    Person "1" <-- "0..*" CouncilSeat : personId
    Faction "1" <-- "0..*" CouncilSeat : factionId
    Person "0..1" <-- "0..*" Official : personId

    Room *-- Metadata
    Room *-- ViewBox
    Room ..> CouncilSeat : definiert Positionen
    Room ..> Official : definiert Plätze
```


## factions.json

Beschreibt ausschließlich Fraktionen.

Enthält beispielsweise:

- Name
- Kurzname
- Farben
- Anzahl der Sitze

Enthält keine Personen.

## persons.json

Beschreibt Personen unabhängig von ihrer Sitzposition.

Enthält keine Koordinaten des Sitzungssaals.

## council-seats.json

Ordnet Personen einer Sitzposition und einer Fraktion zu.

Enthält keine geometrischen Informationen.

## officials.json

Beschreibt Plätze der Stadtspitze, Verwaltung und Gäste.

Derzeit enthält die Datei zusätzlich Positionsinformationen.

Diese werden künftig nach `room.json` verschoben.

## room.json

Beschreibt ausschließlich den Sitzungssaal.

Aktuell enthält die Datei lediglich das Grundschema.

Später werden hier unter anderem gespeichert:

- SVG ViewBox
- Sitzreihen
- Sitzkoordinaten
- Positionen der Officials
- Tischgeometrie
- Position des Informationsbildschirms

Personenbezogene Informationen werden hier bewusst nicht gespeichert.

## Gemeinsame Personenfelder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | String | Eindeutige technische ID |
| `seat` | String | Eindeutige Sitzkennung |
| `name` | String | Anzeigename; darf bei wechselnden Plätzen leer sein |
| `office` | String | Amt oder besondere Funktion |
| `faction` | String oder null | Fraktions-ID |
| `party` | String oder null | Optionale Parteizugehörigkeit |
| `roles` | Array | Weitere Rollen |
| `committees` | Array | Ausschüsse oder Gremien |
| `photo` | String | Relativer Pfad zum Bild |
| `profileUrl` | String | Öffentliche Profiladresse |
| `email` | String | Öffentliche Kontaktadresse |
| `phone` | String | Öffentliche Telefonnummer |

## Officials-spezifische Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `type` | String | Art des Platzes |
| `shortLabel` | String | Kürzel im Sitzplan |
| `x` | Number | Horizontale SVG-Position |
| `y` | Number | Vertikale SVG-Position |
| `radius` | Number | Radius des sichtbaren Kreises |

> Hinweis:
> Diese Felder dienen derzeit der Darstellung.
> Im Rahmen der Raumkonfiguration (room.json) werden sie künftig
> aus officials.json ausgelagert.

## Konventionen

- Leere Texte werden als `""` gespeichert.
- Nicht vorhandene Zuordnungen werden als `null` gespeichert.
- Listen sind immer Arrays.
- IDs und Sitzkennungen müssen eindeutig sein.

