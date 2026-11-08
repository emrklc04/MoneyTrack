# Testing und Performance: Vorbereitung für Class 7

## Was wird womit geprüft?

| Prüfung | Frage | MoneyTrack-Beispiel |
|---|---|---|
| Unit-Test | Arbeitet eine einzelne Funktion korrekt? | Saldo, Reducer, Wechselkurs-Cache |
| UI-Komponententest | Zeigt eine gerenderte Komponente das richtige Ergebnis und reagiert sie auf Bedienung? | Fehler anzeigen, Wiederholen drücken |
| Gerätetest | Funktioniert der Ablauf mit Hardware und Betriebssystem? | Belegfoto, SQLite, Neustart |
| Performance-Profiling | Wo verbraucht die App Zeit oder Speicher? | Statistikberechnung, Render-Vorgänge, Bilder |

Ein bestandener Funktionstest beweist keine flüssige Bedienung.

## Tests ausführen und erklären

```powershell
npm run test:unit
npm run test:components
npm test -- --runInBand
npm run lint
npm run typecheck
```

Unit-Tests liegen bei Context, Services und Utils. Die UI-Tests in `src/components/__tests__/ExchangeRatePreview.test.tsx` verwenden React Native Testing Library 14 mit asynchronem `render` und `userEvent`.

**Arrange–Act–Assert:** Zuerst die Antwort des Wechselkurs-Service vorbereiten, dann die echte Komponente rendern und bedienen, anschließend sichtbare Texte, zugängliche Rollen und übergebene Ergebnisse prüfen.

Nur der Wechselkurs-Service wird ersetzt. Die Komponente und ihre Text-/Button-Darstellung werden tatsächlich gerendert. Kontrollierte Promises simulieren langsame Antworten ohne echte Netzwerk-Wartezeiten.

Abgedeckt sind Ladeanzeige, Kurs/Datum/Umrechnung, Cache-Warnung, Fehler mit erfolgreichem Wiederholen, Verwerfen des alten Kurses beim Wiederholen, Betragsänderung ohne neue Anfrage und verspätete Antwort nach Verlassen der Ansicht. Die Tests prüfen weder Hardware/SQLite noch Bildschirm-Layout oder vollständige Navigation.

Beispiel fürs Review: Der Unit-Test prüft, dass ein Cache-Kurs zurückgegeben wird. Der Komponententest prüft, dass der Nutzer den Hinweis auf einen möglicherweise veralteten Kurs sieht.

## Performance-Profiling am iPhone

Status: **Vorbereitet, noch nicht gemessen.** Die Funktionsbestätigungen des Nutzers sind keine Performance-Aufzeichnung.

1. MoneyTrack mit `npx expo start` starten und in Expo Go öffnen. Einen bereits laufenden Server weiterverwenden.
2. Im Expo-Terminal `j` drücken, um React Native DevTools zu öffnen. Das iPhone muss mit dem Entwicklungsserver verbunden sein.
3. Im **Profiler** eine Aufnahme starten, Dashboard → Transaktionen → Statistiken bedienen und Aufnahme stoppen. Häufige Commits und Render-Dauer ansehen.
4. Im **Performance**-Panel denselben Ablauf aufzeichnen. Lange JavaScript-Aufgaben und React-Updates untersuchen. Wartezeit auf die API von blockierter JavaScript-Ausführung unterscheiden.
5. Im Formular den Betrag ändern und zusätzlich im **Network**-Panel prüfen, dass nicht für jeden Tastendruck ein neuer Kurs geladen wird.
6. Im **Memory**-Panel vergleichbare Heap-Snapshots vor und nach wiederholtem Öffnen/Schließen eines Belegs aufnehmen. Ein einmaliger Cache-Anstieg beweist kein Leck; auf wiederholtes Wachstum achten.

Entwicklungsmodus, Debugger und Aufnahme beeinflussen die Laufzeit. Diese Profile helfen bei der Ursachensuche; ihre absoluten Zeiten sind kein Release-Benchmark.

### Reproduzierbarer Messplan

Gleiches Gerät, gleicher App-Stand, gleiche Datenmenge und gleicher Ablauf. Größere künstliche Datenmengen nur in einer separaten Testinstallation verwenden. Nach einem Aufwärmdurchlauf mindestens drei Messungen machen und Einzelwerte sowie Median festhalten.

| Szenario | Beobachtung | Ergebnis |
|---|---|---|
| Transaktionsliste öffnen und scrollen | Eingabeverzögerung, JS-Aufgaben, Render-Vorgänge | Noch nicht gemessen |
| Statistiken mit mehr Einträgen | Rechenzeit der Aggregation und Diagrammdarstellung | Noch nicht gemessen |
| Betrag im Formular ändern | Flüssige Eingabe, keine unnötigen Kursabfragen | Noch nicht gemessen |
| Belegansicht wiederholt öffnen/schließen | Wiederholtes Heap-Wachstum und Bildspeicher | Noch nicht gemessen |

Bei 60 Hz stehen rechnerisch etwa 16,7 ms pro Frame zur Verfügung, bei 120 Hz etwa 8,3 ms. React-Renderdauer allein misst nicht die gesamte Framezeit; JS- und UI-Arbeit unterscheiden.

Für belastbare Aussagen zur Gerätegeschwindigkeit zusätzlich einen installierten Build ohne Entwicklungsmodus prüfen. Native Analysen benötigen passende Werkzeuge wie Instruments unter macOS oder den Android Studio Profiler. Auf dem aktuellen Windows-Host können wir keine iOS-Instruments-Aufnahme durchführen.

Protokollieren: Datum, Gerätemodell, Betriebssystem, App-/SDK-Version, Debug/Release, Datenmenge, Szenario, Wiederholungen, Zeiten/Render-Anzahl/Speicher und Trace-Datei. Erst messen, dann gezielt ändern und unter gleichen Bedingungen erneut vergleichen.

## CI/CD später

CI führt Tests, Lint und Typecheck automatisch aus. Die Konfiguration unter `.github/workflows/ci.yml` ergänzt außerdem einen Secret-Scan der ausgecheckten Git-Historie und läuft bei Pushes auf `main` sowie Pull Requests. Den tatsächlichen Status nach dem Push im Actions-Tab prüfen. CD erstellt oder verteilt Builds; diese Pipeline veröffentlicht keine App. Gerätetests und Profiling bleiben eigene Nachweise.

## Referenzen

- [Expo: Jest](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing Library 14](https://oss.callstack.com/react-native-testing-library/docs/start/quick-start)
- [Expo: Debugging und Profiling](https://docs.expo.dev/debugging/tools/)
- [React Native DevTools](https://reactnative.dev/docs/react-native-devtools)
- [React Native: Profiling](https://reactnative.dev/docs/profiling)
