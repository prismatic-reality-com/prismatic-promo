# _assets — Bundlované frontendové knihovny (offline-first)

[← Zpět na README](../README.md) | [🏠 Portál](../index.html) | [🔎 Hledat](../search.html)

> **Účel** — Všechny interaktivní HTML dashboardy v tomto pracovním prostoru se vykreslují **bez síťového připojení**. Každá JS/CSS závislost je zde vendorovaná jako minifikovaný balíček. Žádné CDN, žádný tracking, žádná překvapení v dodavatelském řetězci během živé schůzky ve Faradayově kleci.

---

## 📦 Bundlované knihovny

| Soubor | Velikost | Knihovna | Verze | Účel | Zdroj |
|------|-----:|---------|---------|---------|----------|
| `tailwind.min.js` | 555 KB | [Tailwind CSS](https://tailwindcss.com/) | 3.4.x (play CDN build) | Utility-first stylování přes `<script>` include | https://cdn.tailwindcss.com |
| `flowbite.min.css` | 182 KB | [Flowbite](https://flowbite.com/) | 2.3.x | Komponentové CSS (karty, taby, modály, navbary) | https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.css |
| `flowbite.min.js` | 136 KB | Flowbite | 2.3.x | Komponentové JS (dropdowny, drawery, tooltipy) | https://cdn.jsdelivr.net/npm/flowbite@2.3.0/dist/flowbite.min.js |
| `alpine.min.js` | 46 KB | [Alpine.js](https://alpinejs.dev/) | 3.14.x | Reaktivní šablonování (x-data, x-show, x-for) | https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js |
| `chart.min.js` | 205 KB | [Chart.js](https://www.chartjs.org/) | 4.4.x | Sloupcové grafy bondové struktury, finanční časové řady, koláčové grafy | https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js |
| `p5.min.js` | 1.0 MB | [p5.js](https://p5js.org/) | 1.9.x | 2D entitní grafy, vizualizace parcel, síťové skici | https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js |
| `three.min.js` | 652 KB | [three.js](https://threejs.org/) | r150+ | 3D věže bondové struktury, exploratorní pohledy | https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js |

---

## 🧭 Offline-first filozofie

1. **Žádné CDN závislosti** — každý HTML soubor je odkazuje pomocí relativních cest `./_assets/<file>` (nebo `../_assets/<file>` z podadresářů).
2. **Deterministické buildy** — pracovní prostor je samostatný. `tar czf` + předání představenstvu má zaručeně identické vykreslení.
3. **Žádná telemetrie / žádná analytika** — vendorované balíčky jsou syrové bundly knihoven. Žádné CDN nevolá domů.
4. **Faraday-safe** — použitelné z air-gapped notebooku během obhlídky s nepřátelskou stranou.
5. **Atomicita předání** — zazipujte kořen pracovního prostoru, předejte; příjemce dvojklikem otevře `index.html` a vše funguje.

---

## 📄 Poznámky k licencím

| Knihovna | Licence | Vyžadována atribuce |
|---------|---------|----------------------|
| Tailwind CSS | MIT | ne (informativní atribuce doporučena) |
| Flowbite | MIT | ne |
| Alpine.js | MIT | ne |
| Chart.js | MIT | ne |
| p5.js | LGPL-2.1 | **ano při redistribuci modifikované verze** — dodáváme nemodifikovaný min build |
| three.js | MIT | ne |

Všechny bundly jsou dodány **bez modifikací** (vanilla minifikované CDN buildy). Žádné vlastní patche aplikovány. Pokud je některá knihovna lokálně patchovaná, zaznamenejte diff pod `./patches/<library>.patch` a uveďte zde poznámku.

---

## 🔄 Jak upgradovat knihovnu

1. Vyberte cílovou verzi z upstream CDN URL (viz tabulka výše).
2. `curl -L <cdn-url> -o /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/_assets/<file>`
3. Ověřte, že velikost souboru je ve správném řádu (viz tabulka).
4. `grep -rl "<old-version>" /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/*.html` — aktualizujte verzové stopy, pokud některé HTML reference obsahují natvrdo zapsané verzové komentáře.
5. Otevřete `index.html` + `search.html` + každý `*.html` v podadresářích a otestujte: dropdowny se otevírají, grafy se vykreslují, vyhledávací filtr reaguje.
6. Aktualizujte sloupec verze v tabulce výše a aktualizujte řádek na konci.

### Kontrola integrity (volitelné)

Spočítejte SHA-256 každého bundlu a zaznamenejte je zde, pokud chcete důkaz neporušenosti:

```bash
shasum -a 256 /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/_assets/*.min.* \
  > /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/_assets/.sha256sums
```

Spusťte znovu před každým předáním představenstvu, abyste prokázali, že balíček nebyl modifikován během přenosu.

---

## 🔗 Křížové odkazy

- Každý `*.html` soubor v tomto pracovním prostoru odkazuje na tyto assety pomocí relativní cesty.
- Vstupní bod portálu: [`../index.html`](../index.html).
- Vyhledávací stránka: [`../search.html`](../search.html) (používá Alpine + Tailwind + Flowbite).
- Sitemapa: [`../sitemap.html`](../sitemap.html).
- Entitní graf: [`../02-entity/entity-graph.html`](../02-entity/entity-graph.html) (používá p5.js).
- Bond stack: [`../03-financial/bond-stack.html`](../03-financial/bond-stack.html) (používá Chart.js).

---

*Poslední aktualizace: 2026-04-21 | Verze asset bundlu 1.0 | Všechny bundly ověřeny, že se vykreslují offline.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — _assets/README.md
- [README.md](../README.md) — _assets/README.md

## 🏷️ Související soubory (podle shody tagů)

- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — podobnost 0.31 · raw-cuzk — Surové ArcGIS staženiny ČÚZK (Mstětice + Zeleneč)

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `_assets%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
