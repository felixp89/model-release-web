"""
Baut die Web-Version aus der index.html der Android-App.
Aufruf:  python3 build-web.py <Pfad zur Android-index.html>
Ergebnis: site/index.html
"""
import sys, datetime
src = sys.argv[1] if len(sys.argv) > 1 else "../ModelRelease/app/src/main/assets/index.html"
s = open(src, encoding="utf-8").read()
head = '''<meta name="theme-color" content="#EEEEEA">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Model Release">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" href="icons/icon-192.png">
<script src="web-bridge.js"></script>
'''
assert '<script src="jspdf.umd.min.js"></script>' in s
s = s.replace('<script src="jspdf.umd.min.js"></script>', head + '<script src="jspdf.umd.min.js"></script>', 1)
# Datenschutz: Hinweis zur Web-Version
marker = "<h2>2. Grundsatz: Deine Verträge bleiben auf deinem Handy</h2>"
assert marker in s
s = s.replace(marker, marker + '''
  <p><b>Web-Version (iPhone, iPad, Computer):</b> Die App wird über GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, USA) ausgeliefert. Beim Aufruf verarbeitet GitHub technisch bedingt deine IP-Adresse, um die App-Dateien zu übertragen. Deine Daten speichert die App ausschließlich im Speicher deines Browsers auf deinem Gerät; an GitHub werden keine Vertragsdaten übertragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung der App).</p>''', 1)
open("site/index.html", "w", encoding="utf-8").write(s)
print("Web-Version gebaut: site/index.html")
