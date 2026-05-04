# raw — Sbírka Listin + Surové ARES staženiny (Progresus + PPF)

[← Zpět na 03-financial](../README.md) | [📑 Audit Sbírky listin](../sbirka-listin-audit.md) | [🏠 Portál](../../index.html)

> **Účel** — Surový ARES JSON + HTML Obchodního Rejstříku + HTML Sbírky Listin pro každé IČO v perimetru transakce (obě strany). Vstup pro [`sbirka-listin-audit.md`](../sbirka-listin-audit.md) (audit účetních závěrek (filing-by-filing)) a vizualizaci Chart.js stacku dluhopisů.

---

## 📂 Struktura

```
raw/
├── README.md                        ← jste zde
├── entity-map.tsv                   ← kanonický index IČO → název → spisová značka
├── sl-rows.json                     ← naskrejpané řádky indexu SL (všechny subjekty, strojově čitelné)
├── test-novy-zelenec.html           ← fixture pro testování scraperu
├── progresus/                       ← 8 IČO × 4 artefakty na každé
│   ├── ares-*.json                  ← ARES ekonomický subjekt JSON (per IČO)
│   ├── or-search-*.html             ← vnější vyhledávací/výsledková stránka OR
│   ├── detail-*.html                ← detail subjektu v OR (rozhodnutí, orgány, registrace)
│   └── sl-*.html                    ← HTML seznamu listin Sbírky listin
└── ppf/                             ← 9 IČO × 4 artefakty na každé
    ├── ares-*.json
    ├── or-search-*.html
    ├── detail-*.html
    └── sl-*.html
```

Plus:
- `progresus/detail-bond-*.html` + `progresus/sl-bond-*.html` — speciální pully pro konkrétní emisní tranše dluhopisů identifikované v auditu.
- `ppf/doc-ppfas-2024.html` — připojený dokument SL (ostatní jsou za paywallem, tento byl dostupný).

---

## 🧮 Kanonický index IČO (z `entity-map.tsv`)

### Strana Progresus (8 subjektů)

| IČO | Subjekt | Spisová značka |
|-----|---------|----------------|
| **27825981** | Nový Zeleneč a.s. | B 10025 / KS Ostrava |
| **10978216** | PROGRESUS Group a.s. | B 26471 / MS Praha |
| **09932836** | PROGRESUS invest holding s.r.o. | C 84836 / KS Ostrava |
| **13995758** | Progresus invest holding core a.s. | B 26807 / MS Praha |
| **21515841** | PROGRESUS RD Rýmařov III a.s. | B 28846 / MS Praha |
| **17053161** | PROGRESUS RD Rýmařov a.s. | B 27212 / MS Praha |
| **09963758** | RD Rýmařov Invest Holding a.s. | B 11297 / KS Ostrava |
| **27890104** | Nuka Estates s.r.o. v likvidaci | C 62674 / KS Ostrava |

Navíc (tranše dluhopisů, bez samostatné řádky v `entity-map.tsv`):
- **10800123** — RD Rýmařov Invest III. alpha s.r.o. (100% mateřská společnost Nový Zeleneč a.s., klíčové SPV transakce)
- **14066661** — sesterské SPV ve vertikálním stacku (viz sbirka-listin-audit.md)

### Strana PPF (9 subjektů)

| IČO | Subjekt | Spisová značka |
|-----|---------|----------------|
| **25099345** | PPF a.s. | B 4495 / MS Praha |
| **24908487** | PPF Group a.s. | B 30605 / MS Praha |
| **24908151** | PPF Holdings a.s. | B 30604 / MS Praha |
| **29030072** | PPF reality a.s. | B 15918 / MS Praha |
| **24654744** | PPF reality 2 s.r.o. | C 444857 / MS Praha |
| **27638987** | PPF Real Estate s.r.o. | C 120743 / MS Praha |
| **24225657** | PPF RE Consulting s.r.o. | C 190405 / MS Praha |
| **10907718** | PPF Financial Holdings a.s. | B 26382 / MS Praha |
| **19696477** | AMALAR HOLDING s.r.o. | C 390328 / MS Praha |

Celkový perimetr transakce: **17 primárních subjektů** (8 + 9), s 2–4 dalšími SPV identifikovanými při rozpracování stacku dluhopisů (10800123, 14066661, 1117603, 1202423, 1298146).

---

## 🔄 Jak obnovit staženinu

### ARES JSON (otevřené, bez autentizace)

```bash
# Nahraďte 27825981 cílovým IČO
curl -sS -H 'Accept: application/json' \
  "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/27825981" \
  > /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/03-financial/raw/progresus/ares-27825981.json
```

### Vyhledávací + detailová stránka OR (HTML scrape)

```bash
# Vnější vyhledávání (upravte podminkyHledani podle spisové značky nebo IČO)
curl -sS "https://or.justice.cz/ias/ui/rejstrik-$firma?nazev=&ico=27825981" \
  -o /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/03-financial/raw/progresus/or-search-27825981.html

# Detailová stránka — získejte anchor href="detail-..." z HTML vyhledávání, pak:
curl -sS "https://or.justice.cz/ias/ui/rejstrik-$firma?subjektId=362662&typ=UPLNY" \
  -o /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/03-financial/raw/progresus/detail-27825981.html
```

### Index Sbírky listin (HTML scrape)

```bash
curl -sS "https://or.justice.cz/ias/ui/vypis-sl-firma?subjektId=362662" \
  -o /Users/korczis/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/03-financial/raw/progresus/sl-27825981.html
```

`subjektId` pochází z 3. sloupce `entity-map.tsv`. **NEZAMĚŇUJTE** s IČO.

---

## 🔒 Známé mezery

### PDF jsou blokovány captchou

Každá položka v HTML indexu Sbírky Listin odkazuje na individuální PDF (např. účetní závěrka, výroční zpráva, schválení). **Tato PDF jsou za captchou na úrovni session** a nelze je hromadně stáhnout. HTML index stačí pro časové osy data podání, ale obsah konkrétního dokumentu vyžaduje ruční proklik.

| Co máme | Co nemáme |
|---------|-----------|
| ✅ Data podání, typy podání, popisky dokumentů (z `sl-*.html`) | ⛔ Skutečná PDF účetních závěrek pro kterýkoli subjekt |
| ✅ Historii statutárního orgánu, data registrace (z `detail-*.html`) | ⛔ Podané auditorské zprávy, dopisy vedení |
| ✅ Strukturovaný ekonomický subjekt z ARES (z `ares-*.json`) | ⛔ Historické roční finanční výkazy v podobě PDF |

**Akce**: Pokud konkrétní dokument blokuje audit, zaznamenejte jej do [`../../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md`](../../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) jako požadavek na data-room. Prodávající dodá PDF přes data-room, nikoli přes OR.

### Účetní závěrka PPFaS 2024

Soubor `ppf/doc-ppfas-2024.html` je vyrenderovaný HTML dokumentu Sbírky Listin (~10 KB) — **tento byl dostupný bez captchy**, což je neobvyklé. Účetní závěrky většiny ostatních subjektů PPF zůstávají za paywallem.

### Chybějící prospekty dluhopisů

Tři detailové pully tranší dluhopisů (`progresus/detail-bond-*.html`) poskytují pouze záznam o registraci v OR, nikoli prospekt cenného papíru. Prospekty se podávají u ČNB, nikoli u OR. Viz [`../bond-stack.html`](../bond-stack.html) pro vizualizaci sestavenou z 68 tranší identifikovaných v [`../sbirka-listin-audit.md`](../sbirka-listin-audit.md).

---

## 🔗 Křížový odkaz na `sbirka-listin-audit.md`

Každé tvrzení v [`../sbirka-listin-audit.md`](../sbirka-listin-audit.md) by mělo být dohledatelné k souboru v tomto adresáři:

| Sekce auditu | Surové zdrojové soubory |
|--------------|-------------------------|
| §2 — Časová osa podání Nový Zeleneč | `progresus/sl-27825981.html`, `progresus/detail-27825981.html` |
| §3 — Korporátní akce PROGRESUS Group | `progresus/sl-10978216.html`, `progresus/detail-10978216.html` |
| §4 — Emise dluhopisů (68 tranší) | `progresus/sl-bond-1117603.html`, `sl-bond-1202423.html`, `sl-bond-1298146.html` + `sl-rows.json` |
| §5 — Historie statutárního orgánu skupiny PPF | `ppf/detail-25099345.html`, `ppf/detail-24908487.html`, `ppf/detail-24908151.html` |
| §6 — Subjekty PPF reality na straně transakce | `ppf/sl-29030072.html`, `ppf/sl-24654744.html`, `ppf/sl-27638987.html` |
| §7 — AMALAR Holding (nový vehicle) | `ppf/sl-19696477.html`, `ppf/detail-19696477.html` |

Pokud upravíte tvrzení v auditu, dotkněte se odpovídajícího názvu souboru v této tabulce také.

### `sl-rows.json`

45 KB denormalizovaná plochá tabulka řádků indexu Sbírky Listin přes všech 17 subjektů — `{ico, subjektId, filing_date, filing_type, doc_label, href}`. Generováno parsováním každého souboru `sl-*.html` skriptem ekvivalentním Cheerio. Snazší diffovat a dotazovat než surové HTML.

---

## 📜 Poznámka k licenci

Data ARES a OR jsou **veřejná data podle českého práva** (zákon č. 304/2013 Sb.). Opětovné použití pro účely DD je povoleno bez omezení. Atribuce ARES / MSp ČR / OR se doporučuje, ale není právně vyžadována.

---

*Naposledy aktualizováno: 2026-04-21 | 17 subjektů × ~4 artefakty = 68+ souborů | Datum pullu: 2026-04-21 ~13:54–14:02 místního času*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [03-financial/README.md](../README.md) — 03-financial/raw/README.md
- [03-financial/sbirka-listin-audit.md](../sbirka-listin-audit.md) — 03-financial/raw/README.md
- [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) — 03-financial/raw/README.md
- [BACKLINKS-AUDIT.md](../../BACKLINKS-AUDIT.md) — 03-financial/raw/README.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../../index.html) · [Mapa stránek](../../sitemap.html) · [Hledat](../../search.html) · Focus ID: `03-financial%2Fraw%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
