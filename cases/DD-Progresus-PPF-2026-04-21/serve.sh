#!/bin/bash
# Mycelium DD — Spouštěč lokálního serveru
# Otevře pracovní prostor na http://localhost:8000 — nutné pro plnou podporu fetch()
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "🏛️  Project Mycelium — DD Command"
echo "📂 Pracovní prostor: $(pwd)"
echo "🌐 Spouštím na http://localhost:$PORT"
echo "   → Otevře portál: http://localhost:$PORT/index.html"
echo "   → Čtečka:        http://localhost:$PORT/reader.html?file=RED-FLAGS.md"
echo "   → Ctrl+C pro zastavení"
echo ""
# Preferovat Python 3, fallback na Python 2 nebo Node
if command -v python3 >/dev/null; then
  python3 -m http.server "$PORT"
elif command -v python >/dev/null; then
  python -m SimpleHTTPServer "$PORT"
elif command -v npx >/dev/null; then
  npx http-server -p "$PORT" --cors
else
  echo "❌ Není dostupný žádný HTTP server. Nainstalujte Python 3 nebo Node.js."
  exit 1
fi
