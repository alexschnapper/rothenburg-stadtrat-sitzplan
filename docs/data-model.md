# Datenmodell

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

## Konventionen

- Leere Texte werden als `""` gespeichert.
- Nicht vorhandene Zuordnungen werden als `null` gespeichert.
- Listen sind immer Arrays.
- IDs und Sitzkennungen müssen eindeutig sein.