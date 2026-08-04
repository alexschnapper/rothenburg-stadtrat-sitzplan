# Buildinformationen

Der Footer unterscheidet zwischen der Release-Version und automatisch
erzeugten Angaben zum Deployment.

## Datenquellen

- `package.json` ist die zentrale Quelle für die Release-Version.
- `GITHUB_RUN_NUMBER` liefert beim Pages-Deployment die Buildnummer.
- Das Build-Datum wird während des Deployments in der Zeitzone
  `Europe/Berlin` erzeugt und als `TT.MM.YYYY` ausgegeben.

Der Workflow `.github/workflows/deploy-pages.yml` erzeugt daraus die Datei
`data/build-info.json` im Website-Artefakt. Diese Datei wird nicht im
Repository gepflegt und ist deshalb in `.gitignore` eingetragen.

Beispiel:

```json
{
  "version": "0.4.0",
  "buildNumber": "42",
  "buildDate": "04.08.2026"
}
```

## Lokale Entwicklung

Ohne `data/build-info.json` zeigt der Footer neben der Versionsnummer den
Hinweis „Lokale Entwicklung“. Für eine lokale Vorschau können
Buildinformationen gezielt erzeugt werden:

```bash
npm run generate:build-info -- --build-number 42
```

Die erzeugte Datei bleibt unversioniert und kann jederzeit gelöscht oder
neu erzeugt werden.

## GitHub Pages

Der Deployment-Workflow veröffentlicht ausschließlich die für die Website
benötigten Dateien aus dem temporären Verzeichnis `_site`. Vor dem Upload
wird dort bei jedem Lauf eine neue `data/build-info.json` erzeugt.

Damit der Workflow deployen kann, muss unter **Settings → Pages → Build and
deployment → Source** die Option **GitHub Actions** ausgewählt sein.
