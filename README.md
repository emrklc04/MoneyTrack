# MoneyTrack

Mobiles Haushaltsbuch mit Expo SDK 58, React Native und TypeScript. Dashboard, Transaktionen, Statistiken, Monatsbudgets, Einstellungen und fotografierte Belege.

Repository: [emrklc04/MoneyTrack](https://github.com/emrklc04/MoneyTrack). Gemeinsamer Zustand mit React Context und `useReducer`.

[![CI](https://github.com/emrklc04/MoneyTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/emrklc04/MoneyTrack/actions/workflows/ci.yml)

Team: [emrklc04](https://github.com/emrklc04) und [kokoloko99](https://github.com/kokoloko99). Beide Konten haben eigene Commits auf `main`.

## Start

Node.js 22.13 oder neuer innerhalb der 22er-Reihe und npm verwenden. Repository klonen und in den Projektordner wechseln:

```powershell
git clone https://github.com/emrklc04/MoneyTrack.git
cd MoneyTrack
```

```powershell
npm ci
Copy-Item .env.example .env
npx expo start
```

Eine vorhandene .env behalten. Auf einem passenden Expo Go oder Development Build auf Android/iOS starten. Web ersetzt keinen nativen Test.

## Konfiguration und Sicherheit

.env konfiguriert EXPO_PUBLIC_EXCHANGE_API_URL. .env und Varianten sind ausgeschlossen; .env.example bleibt als Vorlage erhalten. Expo nimmt EXPO_PUBLIC_-Werte ins App-Bundle auf: nur oeffentliche Konfiguration verwenden. Keine privaten API-/AI-Schluessel im Client hinterlegen; diese gehoeren auf einen Server. Die Wechselkurs-API benoetigt keinen Schluessel.

## Architektur

- src/app: Expo Router, fuenf Tabs plus Formular-Modal und Detail-Stack.
- src/context: AppContext mit useReducer fuer gemeinsame Daten und kontrollierte Updates nach erfolgreichem Speichern.
- src/models: TypeScript-Datenmodelle.
- src/services: REST-Abfragen, Umrechnung und Belegspeicherung.
- src/config: Umgebungskonfiguration.
- src/database: SQLite und parametrisierte Abfragen.
- src/components und src/hooks: wiederverwendbare UI und Hooks.
- src/utils: Finanzberechnungen und Formatierung.

Datenfluss: Formular -> Wechselkurs-Service -> Context -> SQLite -> Reducer -> Dashboard/Liste. Alle Screens lesen denselben Context.

## Offline und Waehrungen

Transaktionen, Budgets, Hauptwaehrung und Kurse liegen in SQLite; Fotos im Dokumentenverzeichnis. Beim Start werden gespeicherte Daten geladen. Bei Ladefehlern erscheint eine Wiederholungsoption.

Die Kursanzeige zeigt Laden, Erfolg mit Kursdatum und Umrechnung sowie Fehler mit Wiederholen. Eine Anfrage hat zehn Sekunden Timeout. Bei API-Ausfall wird ein vorhandener Kurs mit Cache-Hinweis verwendet; Aktualitaet ist dann nicht garantiert.

Neue Fremdwaehrungstransaktionen ohne Kurs werden nicht gespeichert. Hauptwaehrung funktioniert offline. Alte Fremdwaehrungseintraege ohne Umrechnung erscheinen im Original und werden mit Hinweis aus Summen ausgeschlossen.

Beim Wechsel der Hauptwaehrung werden bisherige umgerechnete Betraege und Budgets gemeinsam umgerechnet und atomar gespeichert. Originalbetraege bleiben erhalten. Alte Eintraege ohne Umrechnung werden aus ihrer Originalwaehrung umgerechnet. Fehlt ein noetiger Kurs, bleibt der Stand erhalten. Dies konvertiert bisherige Buchwerte und rekonstruiert keine historischen Tageskurse.

## Pruefungen

```powershell
npm test -- --runInBand
npm run lint
npx tsc --noEmit
npx expo export --platform android
```

Tests: Reducer, Finanzberechnungen, API-/Cache-Fehler, ungueltige Kurse, Timeout und Waehrungswechsel. Unit-Tests ersetzen keine nativen Kamera-/SQLite-Tests. Manuelles Protokoll: docs/device-test.md.

UI-Komponententests: `npm run test:components`. Einzelne Unit-Tests: `npm run test:unit`. Grundlagen, Testbeispiele und Profiling-Messplan stehen in [docs/testing-and-performance.md](docs/testing-and-performance.md). Profiling auf dem iPhone ist vorbereitet, aber noch nicht gemessen.

GitHub Actions prueft Pushes auf `main` und Pull Requests mit Lint, Typecheck, Tests und einem Secret-Scan der Git-Historie. Der aktuelle Ausfuehrungsstatus steht unter [Actions](https://github.com/emrklc04/MoneyTrack/actions). Details und verbleibende Abgabepunkte stehen in [docs/repository-audit.md](docs/repository-audit.md).

## Code-Walkthrough

1. Navigation in beiden _layout.tsx erklaeren.
2. Eine Transaktion durch Formular, Service, Context und Datenbank bis zum Dashboard verfolgen.
3. Reducer und unveraenderliche Updates erklaeren.
4. API-Erfolg, Timeout, Cache und fehlenden Kurs demonstrieren.
5. Kamera-Berechtigung, Aufnahme und dauerhafte Bildspeicherung erklaeren.
6. Waehrungswechsel und Tests anhand konkreter Beispiele erlaeutern.

Die genaue AI Usage Policy muss das Team noch pruefen. Hilfsmittel und eigene Beitraege entsprechend dokumentieren.
