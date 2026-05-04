# 07-sources — Manifest důkazů a řetězec původu

[← Zpět na 00-INDEX.md](../reader.html?file=00-INDEX.md) | [🏠 Portál](../index.html) | [📋 Manifest důkazů](../reader.html?file=07-sources/evidence-manifest.md) | [🏆 Žebříček citací](../reader.html?file=07-sources/citation-rank.md)

> **Účel** — Páteř důkazů. Každé tvrzení v této DD pracovní složce musí citovat URL + datum získání + záznam archive.org uvedený zde. Bez původu je DD memo pouze názorem.

---

## 📂 Soubory v tomto adresáři

| Soubor | Účel | Shrnutí v 1 řádku | Nadřazený index |
|------|---------|----------------|--------------|
| [evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md) | 🟢 Manifest zdrojů | URL, data získání, záznamy archive.org, SHA hashe, pravidla integrity citací | [00-INDEX §Důkazy](../reader.html?file=00-INDEX.md) |

> ℹ️ Adresář je záměrně úzký — manifest je jediný artefakt; raw datové cache leží vedle své domény (viz raw datové doplňky níže).

---

## 🔑 Klíčová zjištění

- 🟡 **Primární české registry DOSUD NESTAŽENY** k 2026-04-21: ARES, Obchodní rejstřík, ISIR, ESM, ČÚZK Nahlížení, ČNB rozhodnutí. Všechny zdrojové URL jsou evidovány; stahování je zařazeno do MASTER-ACTION-PLAN P0/P1.
- 🟢 **Pravidlo integrity citací**: každé numerické tvrzení, IČO, ID katastrální parcely, číslo spisu musí mít zpětný odkaz na řádek v `evidence-manifest.md`.
- 🟢 **Postoj k archive.org** — pro jakýkoli zdroj, který může být upraven nebo stažen (Hlídač, HN.cz, news, Lébr/Ravantino), je spuštěn záznam Wayback a Wayback URL je zaznamenána vedle živé URL.
- 🟡 **ČÚZK dálkový-přístup (placený, LV 927 + LV 1326)** zařazeno (~50 tis. Kč, 72h P0). Bez toho jsou prohlášení o vlastnictví v SPA nekapitalizovaná.
- 🟢 **Surové OSINT výstupy sem směřují duchem, fyzicky jsou však umístěny** se svou doménou — viz [02-entity/raw-cuzk/](../02-entity/raw-cuzk/), [03-financial/raw/](../03-financial/raw/), [05-osint/ppf-side-deep/](../05-osint/ppf-side-deep/).

---

## 🔗 Křížové odkazy

- Každá doména používá tento manifest k podložení svých tvrzení:
  - [01-intel/](../01-intel/) — dossiery PPF + citace advisor-bench
  - [02-entity/](../02-entity/) — katastr + řetězec vlastnictví + ověření entit
  - [03-financial/](../03-financial/) — listiny ze Sbírky listin + prospekty ČNB
  - [04-legal/](../04-legal/) — spisy ISIR + justice.cz + federální PACER spisy
  - [05-osint/](../05-osint/) — JSONy z ARES + Hlídač + HN.cz
- Doplněk metodiky → [../METHODOLOGY.md](../reader.html?file=METHODOLOGY.md)
- Konzumenti konsolidovaného reportu → [06-reports/MASTER-DD-REPORT-v1.0.md](../reader.html?file=06-reports/MASTER-DD-REPORT-v1.0.md)
- Mapa dataroomu → [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../reader.html?file=06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md)
- Log odchozích dopisů → každá šablona v [08-comms-templates/](../08-comms-templates/) získá své potvrzení o doručení zde zalogováno

---

## ❓ Otevřené otázky / mezery

- **ČÚZK placené stažení** — dosud neprovedeno (P0 tento týden, ~50 tis. Kč).
- **Obchodní rejstřík Sbírka listin** — listiny FY21-24 pro Nový Zeleneč a.s. + 4 SPV emitenty dluhopisů chybí (nelze citovat to, co neexistuje).
- **ISIR spis 30 Co 228/2019-1538** — 1 538 dokumentů nevyjmenováno; selektivní stažení PACER pro Dancore v. Zika 2:18-cv-01136 také čeká.
- **ESM AML přístupová cesta** — blokováno 2025-12-17; obejít v [04-legal/ubo-disclosure-memo.md](../reader.html?file=04-legal/ubo-disclosure-memo.md).
- **Audit úplnosti pokrytí Wayback** — potřeba periodický průchod pro zachycení úprav/odstranění sledovaných URL.

---

## ⚡ Rychlé akce

- Pokud potřebujete **ověřit tvrzení před citováním při zveřejnění v SPA** → nejprve zkontrolujte [evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md). Pokud chybí, přidejte zdroj před citováním.
- Pokud potřebujete **stáhnout primární zdroje** → fronta sleduje pořadí MASTER-ACTION-PLAN (ČÚZK > ISIR > Sbírka > ČNB > ARES).
- Pokud potřebujete **citovat zjištění z PPF dossieru** → odkažte na surový JSON v [../05-osint/ppf-side-deep/](../05-osint/ppf-side-deep/), pak zpět na řádek tohoto manifestu.
- Pokud chcete **přidat nový zdroj** → přidejte řádek do [evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md), spusťte záznam Wayback, zařaďte pod příslušnou třídu primárního zdroje.

---

📋 **Sledování důkazů** → [evidence-manifest.md](../reader.html?file=07-sources/evidence-manifest.md) (počty podle třídy zdroje, data získání, pokrytí archive.org) · [citation-rank.md](../reader.html?file=07-sources/citation-rank.md) (top-10 nejvíce odkazovaných souborů s příchozími referencemi)

---

*Naposledy aktualizováno: 2026-04-21 | Verze 1.0 | Připravenost: 1 manifest + 3 surové datové vyrovnávací paměti jej napájející*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [01-intel/README.md](../01-intel/README.md) — 07-sources/README.md (2×)
- [02-entity/README.md](../02-entity/README.md) — 07-sources/README.md (2×)
- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — 07-sources/README.md (2×)
- [03-financial/README.md](../03-financial/README.md) — 07-sources/README.md (2×)
- [04-legal/README.md](../04-legal/README.md) — 07-sources/README.md (2×)
- [05-osint/README.md](../05-osint/README.md) — 07-sources/README.md (2×)
- [06-reports/README.md](../06-reports/README.md) — 07-sources/README.md (2×)
- [08-comms-templates/README.md](../08-comms-templates/README.md) — 07-sources/README.md (2×)
- [LINK-AUDIT.md](../LINK-AUDIT.md) — 07-sources/README.md (2×)
- [00-INDEX.md](../00-INDEX.md) — 07-sources/README.md
- [04-legal/ubo-disclosure-memo.md](../04-legal/ubo-disclosure-memo.md) — 07-sources/README.md
- [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) — 07-sources/README.md
- [06-reports/MASTER-DD-REPORT-v1.0.md](../06-reports/MASTER-DD-REPORT-v1.0.md) — 07-sources/README.md
- [07-sources/evidence-manifest.md](./evidence-manifest.md) — 07-sources/README.md
- [BACKLINKS-AUDIT.md](../BACKLINKS-AUDIT.md) — 07-sources/README.md

## 🏷️ Související soubory (podle shody tagů)

- [01-intel/README.md](../01-intel/README.md) — podobnost 1.00 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [02-entity/README.md](../02-entity/README.md) — podobnost 1.00 · 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů
- [03-financial/README.md](../03-financial/README.md) — podobnost 1.00 · 03-financial — Dluhopisy, listiny, daňová struktura
- [05-osint/README.md](../05-osint/README.md) — podobnost 1.00 · 05-osint — Zpravodajství z otevřených zdrojů + governance PPF
- [04-legal/README.md](../04-legal/README.md) — podobnost 1.00 · 04-legal — Soudní spory, Povolení, Životní prostředí, UBO

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `07-sources%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
