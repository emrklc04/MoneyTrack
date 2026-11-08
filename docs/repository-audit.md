# Repository-Audit

Stand: 8. November 2026. Repository: `emrklc04/MoneyTrack`, Standardbranch `main`.

## Identität und Historie

Das lokale Projekt wurde mit der vorhandenen Git-Historie verbunden. Vorhandene Commits bleiben erhalten. Der angemeldete GitHub-Nutzer ist `kokoloko99`; die lokale Commit-Identität stimmt mit der E-Mail des verbundenen Kontos überein. Commits werden mit dem tatsächlichen Datum erstellt. Beiträge des Kollegen werden nicht umgeschrieben oder künstlich einem anderen Autor zugeordnet.

## Secret-Audit

- Gitleaks 8.30.1 aus dem offiziellen Release, Windows-Archiv vor Verwendung per SHA-256 geprüft.
- Alle zum Auditzeitpunkt lokal verfügbaren Repository-Branches und deren Commit-Historie geprüft; kein Fund nach Prüfung zweier Fehlalarme.
- Zwei Treffer im bisherigen IDE-Cache `.idea/claudeCodeEditorTabs.xml` waren UUIDs für Editor-Tabs, keine Zugangsdaten. Ausschließlich diese beiden Commit-/Pfad-/Zeilen-Fingerprints stehen mit Begründung in `.gitleaksignore`.
- `.env` und `.env.*` werden ignoriert. `.env.example` bleibt als öffentliche Vorlage erhalten und enthält keinen geheimen Schlüssel.
- Persönliche IDE-Zustände, lokale Expo-Dateien, Abhängigkeiten und Exportdateien werden nicht neu veröffentlicht. Zuvor versionierte `.idea`-Dateien werden aus dem aktuellen Stand entfernt, bleiben aber in der unveränderten Historie.
- Im App-Code gibt es keine Anmeldung und keine gespeicherten Auth-Tokens oder privaten Provider-Schlüssel. SQLite enthält Finanzdaten und Einstellungen, das App-Dateisystem Belege. Diese Daten sind nicht automatisch verschlüsselt.

Ein Muster-Scan kann unbekannte oder nicht erkannte Secrets nicht ausschließen. Der Audit umfasst Git-Inhalte, nicht andere Konten, GitHub-Artefakte oder nicht zugängliche/verlorene Historie.

## Automatische Qualitätssicherung

Die CI-Konfiguration unter `.github/workflows/ci.yml` ist für Pushes auf `main`, Pull Requests und manuelle Ausführung vorbereitet. Sie installiert mit `npm ci` unter Node 22 und führt Lint, Typecheck und Unit-/Komponententests aus. Ein separater Job prüft die vollständige ausgecheckte Historie mit Gitleaks. Actions sind auf Commit-SHAs festgelegt; der Workflow braucht nur lesenden Repository-Zugriff und keine privaten API-Secrets.

Der tatsächliche GitHub-Ausführungsstatus muss nach dem Push im Actions-Tab geprüft werden. Eine CI-Pipeline erstellt noch keinen installierbaren App-Build und ersetzt keine Gerätetests.

## Noch gesondert abzuschließen

- Der Repository-Inhaber muss die Kursvorgabe „privat“ beziehungsweise die Ablage in `FHTW-CPD` klären. Das verbundene Konto hat Schreib-, aber keine Administrationsrechte; Sichtbarkeit und Eigentümer wurden nicht verändert.
- Herkunft aus dem offiziellen Kurs-Template ist anhand der aktuell verfügbaren Informationen nicht bestätigt.
- Screenshots oder GIFs echter App-Abläufe für die README ergänzen.
- Noch offene Gerätefälle stehen in `docs/device-test.md`; Performance-Aufzeichnungen stehen noch aus.
- Beide Teammitglieder müssen ihre eigenen Beiträge erklären können und die konkrete AI Usage Policy beachten.
- Moodle-Abgabe und harte Deadline müssen vom Team kontrolliert werden. Es wurde nichts auf Moodle eingereicht.
