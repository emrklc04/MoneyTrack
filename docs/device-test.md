# Manueller Geraetetest

Status: TEILWEISE BESTANDEN. Am 7. November 2026 hat der Nutzer die unten aufgefuehrten Tests auf seinem iPhone in Expo Go durchgefuehrt und im Chat bestaetigt. Die Ergebnisse beruhen auf diesen Rueckmeldungen, nicht auf direktem Zugriff auf das iPhone. Auf dem Pruefhost sind weder adb noch Android-SDK verfuegbar.

Automatisch am 7. November 2026 geprueft: Unit-Tests, Lint und Typecheck erfolgreich; Android-JavaScript/Hermes-Bundle erfolgreich exportiert. Echter REST-Aufruf USD/EUR erfolgreich. Kein nativer App-Build und kein Geraetestart durchgefuehrt.

Native Konfiguration mit `expo config --type introspect --json` geprueft: iOS NSCameraUsageDescription ist gesetzt; NSMicrophoneUsageDescription fehlt wie beabsichtigt. Android enthaelt android.permission.CAMERA und keine RECORD_AUDIO-Berechtigung in den ausgewerteten App-Mod-Ergebnissen. Dies prueft die Plugin-Auswertung, nicht ein fertig gebautes Binary oder die Expo-Go-Host-App.

Geraet: iPhone mit Expo Go fuer SDK 58; genaues Modell und iOS-Version nicht erfasst.

Bestaetigt durch den Nutzer:

- MoneyTrack startet nach dem SDK-Upgrade erfolgreich.
- Ausgabe "Kameratest", 10 EUR, mit Kamerafoto gespeichert; Betrag und Foto in den Details sichtbar.
- Expo Go vollstaendig geschlossen und neu geoeffnet; Transaktion und Foto weiterhin vorhanden (mit Netzwerkverbindung).
- Anschliessend Flugmodus aktiviert und WLAN ausgeschaltet, waehrend MoneyTrack geoeffnet blieb: Ausgabe "Offline-Test", 5 EUR, gespeichert und alter Kamerabeleg weiterhin sichtbar.

Weitere Nutzerbestaetigungen aus dem gemeinsamen Test:

- Online zeigt das Formular fuer 10 USD Wechselkurs, Kursdatum und EUR-Umrechnung.
- Nach dem Speichern zeigt die Detailansicht den EUR-Betrag und den Originalbetrag 10 USD.
- Ein Lebensmittelbudget von 1 EUR zeigt vorhandene Ausgaben und die Warnung bei Ueberschreitung.
- Speichern eines leeren Formulars zeigt die Eingabepruefung und legt keine Transaktion an.
- Ein vollstaendiger Offline-Neustart gelang in Expo Go nicht; nach erneutem Oeffnen waren die gespeicherten Daten weiterhin abrufbar. Offline-Kaltstart bleibt fuer einen installierten Build offen.

Noch nicht bestaetigt: vollstaendiger Offline-Neustart eines installierten Builds, Kameraablehnung, Fotoersetzung, Offline-Loeschen, Cache-/API-Ausfall auf dem Geraet, Waehrungswechsel und alle Tabs. Die bisherigen Bestaetigungen zeigen funktionierende Kernablaeufe auf einem echten Geraet; ein vollstaendiger Stabilitaetstest ist damit noch nicht abgeschlossen.

SDK-Upgrade am 7. November 2026: Das iPhone meldete Expo Go SDK 58 bei einem SDK-57-Projekt. Projekt auf Expo ~58.0.23, React Native 0.88.1 und React 19.3.0 aktualisiert. SDK-kompatible Module und Jest 30 installiert; Theme-Fallback und Icon-Farbtypen angepasst. expo-font als direkte Icon-Abhaengigkeit ergaenzt. Danach: 29 Tests bestanden, Typecheck und Lint erfolgreich, Expo Doctor 20/20, Abhaengigkeitspruefung erfolgreich, iOS-Hermes-Bundle exportiert. Ein exportiertes Bundle ist kein nativer iOS-Build. Die anschliessenden iPhone-Ergebnisse sind oben separat dokumentiert.

Auf mindestens einem Android-/iOS-Geraet oder Emulator pruefen; fuer Kamera ein echtes Geraet verwenden.

- Datum und Tester:
- Geraet/Emulator und Betriebssystem:
- App-Version/Build:
- Ergebnis und Fehler:

Die folgende vollstaendige Checkliste bleibt offen, soweit oben keine konkrete Teilpruefung bestaetigt wurde:

| Pruefung | Erwartung |
|---|---|
| Alle Tabs, Modal, Details und Zuruecknavigation | Keine Abstuerze, korrekte Ansichten |
| Einnahme 100 EUR und Ausgabe 30 EUR | Liste/Dashboard aktualisieren sich; Saldo 70 EUR |
| Ungueltiges Formular | Validierung, kein neuer Eintrag |
| Fremdwaehrung online | Laden, Kurs, Datum und Umrechnung sichtbar |
| Kurs erneut laden | Neuer Ladezustand und Ergebnis |
| Flugmodus nach Kursabfrage | Cache-Hinweis, Speichern moeglich |
| Neues Waehrungspaar offline | Fehler/Wiederholen, keine falsche Speicherung |
| Hauptwaehrung offline | Anlegen und Loeschen funktioniert |
| Budget speichern und ueberschreiten | Aktualisierte Anzeige und Warnung |
| Hauptwaehrung mit Daten wechseln | Betraege und Budgets korrekt umgerechnet |
| Hauptwaehrung ohne Kurs wechseln | Fehler, bisheriger Stand bleibt erhalten |
| Kamera ablehnen | Hinweis; App weiter bedienbar |
| Kamera erlauben; Foto aufnehmen/ersetzen | Richtiger Beleg in Vorschau und Details |
| App beenden, im Flugmodus neu starten | Transaktionen, Budgets, Einstellung und Fotos bleiben erhalten |
| Transaktion loeschen und neu starten | Eintrag bleibt geloescht |

Erst nach bestandener Durchfuehrung den Kurs-Punkt Geraetestabilitaet als erfuellt markieren.
