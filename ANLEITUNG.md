# Model Release – Web-Version für iPhone, iPad, Windows und Mac

Die Web-App braucht **kein Apple-Konto** und keinen App Store. Sie läuft im Browser
und lässt sich auf dem iPhone wie eine App auf den Home-Bildschirm legen.

## 1. Einmalig einrichten (GitHub Pages, kostenlos)

1. Auf GitHub ein **neues Repository** anlegen, z. B. `model-release-web`,
   und **Public** wählen (kostenloses GitHub Pages gibt es nur für öffentliche Repositorys).
   Hier liegt **kein Schlüssel** und keine Zugangsdaten drin – das ist unbedenklich.
2. Den **Inhalt** dieses Ordners hochladen (`site`, `.github`, `build-web.py`, `ANLEITUNG.md`).
   Wichtig: der versteckte Ordner `.github` muss mit.
3. Im Repository: **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.
4. Unter **Actions** läuft „Web-App veröffentlichen“ (1–2 Minuten).
5. Danach ist die App erreichbar unter:
   **https://DEIN-GITHUB-NAME.github.io/model-release-web/**

## 2. Auf dem iPhone installieren

1. Den Link in **Safari** öffnen (nicht in Chrome oder der Instagram-Vorschau).
2. Unten auf **Teilen ⬆︎** tippen → **„Zum Home-Bildschirm“** → **Hinzufügen**.
3. Ab jetzt die App über das Symbol auf dem Home-Bildschirm starten.

Auf Windows/Mac: Link in Chrome oder Edge öffnen → in der Adressleiste auf
**„App installieren“** klicken.

## 3. Updates

Die Web-App holt sich Updates automatisch beim nächsten Start.
Wenn sich die Android-App ändert:
```
python3 build-web.py ../ModelRelease/app/src/main/assets/index.html
```
Danach `site/index.html` auf GitHub hochladen – fertig. (Oder du schickst mir die neue
Android-Version, dann baue ich dir die Web-Datei.)

## 4. Unterschiede zur Android-App

- Verträge, Unterschriften, Archiv, Vorlagen, Gruppen, Nachträge, Lizenzen: **wie Android**
- Senden: über das **Teilen-Menü** von iOS (WhatsApp, Mail, Dateien …).
  Falls iOS beim ersten Tippen nicht teilt, erscheint „PDF ist bereit → Jetzt teilen“.
- PDF speichern: Teilen-Menü → **„In Dateien sichern“**
- Vertrag von einem anderen Nutzer übernehmen: PDF speichern → in der App
  **„+ Hinzufügen“** → PDF auswählen. Sie wird automatisch erkannt.
- **Nicht** verfügbar: Kontakte, Benachrichtigungen, Fingerabdruck/Face ID (PIN geht),
  Sync-Datei, „Öffnen mit“.
- **Geräte-ID**: wird beim ersten Start zufällig erzeugt. Wird die App vom Home-Bildschirm
  gelöscht oder werden Safari-Daten gelöscht, gibt es eine neue ID → im Sheet
  „Gerät entfernen“ und neu aktivieren.

## 5. Wichtig: Datensicherung

Die Daten liegen im Speicher von Safari. Bitte regelmäßig unter
**Einstellungen → Datensicherung → Sicherung erstellen** sichern
(z. B. „In Dateien sichern“ → iCloud Drive).
