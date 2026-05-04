# Master Zjištění — DD Progresus

**Poslední aktualizace**: 2026-04-28
**Pass-12 refresh** — file-based facts derived from Pass 1–4 evidence (2026-04-21 baseline + Pass-4 forenzní rozšíření)
**Celkem zjištění**: 25 (7 KRITICKÝCH + 11 VYSOKÝCH + 7 STŘEDNÍCH) — z výchozí prověrky 2026-04-01, mapováno na aktivní Red Flags RF-1..RF-36

Legenda stavů:
- `OPEN` = nevyřešeno, evidence stále chybí
- `PARTIAL` = částečně doloženo, zbývá mezera
- `DISC` = zveřejněno v dataroom (placeholder; dataroom v této fázi neexistuje)
- `MITG` = probíhá zmírnění (memo + akční plán)
- `RSLV` = vyřešeno (resolution memo + cesta zavření)
- `SUPERSEDED-BY-RF-XX` = nahrazeno autoritativní červenou vlajkou ze sady RF-1..RF-36

---

## KRITICKÉ (7)

| # | Zjištění | Stav | Mapping | Evidence (file#anchor) | Riziko PPF | Obrana / Stav řešení |
|---|---------|------|---------|------------------------|------------|----------------------|
| C1 | **Nesrovnalost CASPER: 800M CZK vs. 229M CZK** | RSLV | Vyřešeno v Pass 2–4 (RED-FLAGS „VYŘEŠENO/DEGRADOVÁNO" #1) | [RED-FLAGS.md#vyresenodegradovano-6](./RED-FLAGS.md), [03-financial/sbirka-listin-audit.md#6-red-flags-overene-vyvracene](./03-financial/sbirka-listin-audit.md), [03-financial/financial-analysis.md#c1-rozpor-casper-800m-vs-229m](./03-financial/financial-analysis.md) | Tvrzení o zkreslení → porušení P&Z; uplatnění odškodnění | **Casper Group (David Štekl)** je externí spoluinvestor na Vitrablok; **800M = celkový projekt, 229M = příspěvek Progresus**. Reputační tail Štekl/MUS (RF nepřímo, ne core entita). Závěr: žádný rozpor, jen dvě různé částky pro dva různé pohledy. |
| C2 | **Skrytá / nezveřejněná entita RONDAX** | RSLV | Vyřešeno v Pass 2–4 (RED-FLAGS „VYŘEŠENO/DEGRADOVÁNO" #6) | [RED-FLAGS.md#vyresenodegradovano-6](./RED-FLAGS.md), [02-entity/confirmed-entities.md#subjekty-nenalezene-ve-verejnem-osint](./02-entity/confirmed-entities.md) | Nezveřejněná dceřiná → manipulace UBO, daňová strukturace | **RONDAX nenalezen v ARES** ani v žádném českém registru. Nejpravděpodobněji **OCR chyba v 2026-04-01 reportu** (kandidát: chybně přečtené „Ravantino"). Žádná evidence existence reálné entity. Uzavřeno jako false positive. |
| C3 | **Agregátní dluh skupiny ~1 mld. CZK** | SUPERSEDED-BY-RF-28 | Nahrazeno RF-28 (KRITICKÉ): podhodnoceno ~7,6×, skutečnost ≥7,6 mld. CZK kapacita | [RED-FLAGS.md#rf-28](./RED-FLAGS.md), [03-financial/sbirka-listin-audit.md#aggregat-bond-program-cap](./03-financial/sbirka-listin-audit.md), [03-financial/financial-analysis.md#dluhova-struktura](./03-financial/financial-analysis.md) | Kaskáda křížového selhání; spouštěče covenantů CoC výrazně širší než původně odhadováno | **5 schválených dluhopisových prospektů, 68 tranší, kapacita ≥7,6 mld. CZK**. 5. prospekt schválen ČNB 2026-01-28 v průběhu jednání s PPF (RF-28). Konzervativní zůstatek 2-3 mld. CZK. Nutné: dodatky prospektů ČNB + per-ISIN aktuální jistina. |
| C4 | **DANCORE LLC Nevada — 6letý živý spor o NZ pozemky (30 Co 228/2019-1538)** | SUPERSEDED-BY-RF-26 | Nahrazeno RF-26 (KRITICKÉ, ROZŠÍŘENO 2026-04-21) | [RED-FLAGS.md#rf-26](./RED-FLAGS.md), [04-legal/DANCORE-FORENSIC-DOSSIER.md](./04-legal/DANCORE-FORENSIC-DOSSIER.md), [04-legal/isir-court-sweep.md#4-rizeni-jako-1-overeni](./04-legal/isir-court-sweep.md), [04-legal/dancore-timeline.html](./04-legal/dancore-timeline.html) | Riziko titulu na 1,1 mil. m² NZ; odvolání 2024-11-18 ŽIVÉ; novelní Dancore v. Zika 2:18-cv-01136 (D. Nev.) NEZVEŘEJNĚN; expozice Zrůst dobrověrný nabyvatel | **Plná forenzní složka 466 řádků, 10 sekcí**. Vážená očekávaná škoda CZK 102,5M / doporučená úschova CZK 250–400M / nepravděpodobná škoda CZK 1,0 mld. + W&I + pojištění titulu vynětí DANCORE. |
| C5 | **4 právní řízení vykázána jako 1** | RSLV | Vyřešeno v Pass 2–4 (RED-FLAGS „VYŘEŠENO/DEGRADOVÁNO" #3) — překryv s RF-26 | [RED-FLAGS.md#vyresenodegradovano-6](./RED-FLAGS.md), [04-legal/isir-court-sweep.md#4-rizeni-jako-1-overeni](./04-legal/isir-court-sweep.md), [04-legal/legal-exposure.md#kategorie-a-soudni-spory](./04-legal/legal-exposure.md) | Materiální zatajení → P&Z, může zrušit transakci | **Jedná se o 4 sériové procesní fáze SOUVISEJÍCÍ S DANCORE** (původní 2019, první zamítnutí, vrácení/druhá petice, odvolání 2024-11-18) — JEDNA protistrana, JEDEN podkladový spor. Zveřejnění v dluhopisovém prospektu jako „jeden spor" obhajitelné v sub specie procesní; **forenzně problematické v rovině transparentního DD**. Materiálně řešeno cestou RF-26. |
| C6 | **HP („Hospodářské Pozemky") — zákaz sdílení/spoluobývání** | RSLV | RF-8 sníženo na INFORMATIONAL (false positive / OCR artefakt) | [02-entity/HP-sharing-ban-resolution.md](./02-entity/HP-sharing-ban-resolution.md), [02-entity/cuzk-cadastre-forensics.md](./02-entity/cuzk-cadastre-forensics.md), [RED-FLAGS.md#rf-8](./RED-FLAGS.md) | Omezení použitelnosti aktiva → přímý dopad na ocenění | **NEŘEŠITELNÉ V UVEDENÉ FORMULACI**. 5 hypotéz testováno (druh pozemku, ÚP zóna, stavební uzávěra, věcné břemeno, OCR/přepisová chyba) — všechny H1–H4 zamítnuty; H5 (OCR artefakt z „HPp/HP PP" notace nebo HPM zóna) je nejpravděpodobnější vysvětlení. Žádné omezení v ÚP Zeleneč-Mstětice Změna č. 3 (přijata 2025-02-18). Uzavřeno; požadovat pouze L-21 plné zónování v dataroomu. |
| C7 | **Studio Perspektiv „3. místo, ne vítěz" tendru** | RSLV | Vyřešeno v Pass-7 (separátní memo) | [04-legal/studio-perspektiv-resolution.md](./04-legal/studio-perspektiv-resolution.md) | Spor o IP / smluvní; reputační riziko; chybějící licence designu | **Záměna dvou různých projektů**: (A) Nový Zeleneč 42 ha — soukromý developer, žádná veřejná soutěž, **Studio Perspektiv vůbec NEÚČASTNILO**; (B) Nové centrum Zeleneč — CCEA MOBA soutěž obecního centra v jádru vesnice (~1-2 ha brownfield), 1. cena Apropos Architects 2025-04-28. Marketing Progresus Studio Perspektiv neodkazuje. Závěr: faktická chyba v reportu 2026-04-01, žádná právní expozice. |

## VYSOKÉ (11)

| # | Zjištění | Stav | Mapping | Evidence (file#anchor) | Riziko PPF | Obrana / Stav řešení |
|---|---------|------|---------|------------------------|------------|----------------------|
| H1 | Nesrovnalosti dluhopisového prospektu (Progresus Invest) | PARTIAL → SUPERSEDED-BY-RF-3+RF-27+RF-28 | Rozšířeno na RF-3 (pozdní finance) + RF-27 (NZ a.s. 4letá prodleva) + RF-28 (kapacita 7,6 mld.) | [RED-FLAGS.md#rf-27](./RED-FLAGS.md), [03-financial/sbirka-listin-audit.md#5-papirova-stopa-restrukturalizace](./03-financial/sbirka-listin-audit.md) | Porušení informační povinnosti vůči ČNB, nároky držitelů dluhopisů | **Potvrzeno horší než uvedeno**: 4/5 SPV emitentů NEMAJÍ ŽÁDNÉ ÚZ; 5. (RD Rýmařov IV) emitoval dluhopisy před uzavřením prvního FY. Sjednotit s podáním ČNB CRR + per-ISIN dodatky. Evidence-gap: úplná korespondence s ČNB. |
| H2 | Stav územního plánu / stavebního povolení Nový Zeleneč | RSLV (ÚP, EIA) → MITG (URR/SP, JES) | — | [04-legal/permitting-status-memo.md](./04-legal/permitting-status-memo.md) | Riziko fázového povolování, prodleva monetizace | **ÚP Změna č. 3 přijata 2025-02-18 (právní moc); EIA STC2258 souhlasné stanovisko 2020-10-21 (verifikace dle §9a splatná 2025-10-21)**. URR fáze 1 pravděpodobně VYDÁNO; fáze 2-4 PROJEDNÁVÁNO pod novým stavebním zákonem 283/2021 + JES. Vyžádat L-40 (URR) + L-41 (SP) + L-42 (smlouvy o připojení ČEZ/Veolia/GasNet/CETIN). |
| H3 | Závislost na klíčové osobě JUDr. Lukáše Zrůsta | OPEN → SUPERSEDED-BY-RF-29 | Rozšířeno na RF-29 (operativní koncentrace u Zrůsta) | [RED-FLAGS.md#rf-29](./RED-FLAGS.md), [03-financial/sbirka-listin-audit.md#3-materialni-fakta](./03-financial/sbirka-listin-audit.md), [04-legal/isir-court-sweep.md](./04-legal/isir-court-sweep.md) | Faktor klíčové osoby, riziko přechodu | **Zrůst je jediným statutárním orgánem CELÉ DEALOVÉ VERTIKÁLY**: NZ a.s. + RD Rýmařov III. alpha + PROGRESUS Developments + PROGRESUS Bonds. Jediná nezpůsobilost = provozní kolaps. Plán nástupnictví + retenční struktura + key-person kovenant + governance review. |
| H4 | Půjčky mezi spřízněnými stranami v rámci skupiny | OPEN | — | [03-financial/sbirka-listin-audit.md#7-prioritni-mezery](./03-financial/sbirka-listin-audit.md), [03-financial/financial-analysis.md#financni-dd-podklady](./03-financial/financial-analysis.md) | Transferové ceny, skrytá podřízenost | Evidence-gap: **CHYBÍ úplný registr vnitropodnikových půjček**. Vyžaduje PROGRESUS Group a.s. FY24 konsolidovaná VZ (B 26471/SL5, 72 stran, 2026-02-03 — jediný dostupný konsolidovaný pohled). Nutné PDF stažení přes autentizovaný účet. |
| H5 | Zatížení LV 927 + LV 1326 (katastr) | OPEN (mezera evidence — captcha) | — | [02-entity/cuzk-cadastre-forensics.md](./02-entity/cuzk-cadastre-forensics.md), [02-entity/land-title-chain.md](./02-entity/land-title-chain.md), [02-entity/raw-cuzk/](./02-entity/raw-cuzk/) | Zástavy, věcná břemena na klíčových pozemcích | **Mstětice k.ú. = kód 792764 ověřeno** (oprava dříve chybné 693685). 11 velkých parcel orné půdy >5 ha celkem 135,1 ha; 42ha transakce = podmnožina. Evidence-gap: **LV 927 + 1326 vlastnictví/zatížení za CAPTCHA-ZDÍ** (Radware Bot Manager na nahlizenidokn.cuzk.gov.cz). Vyžaduje placený účet ČÚZK nebo on-site. **Nejkritičtější mezera 90denního pre-DD sprintu**. |
| H6 | Postoj obce Zeleneč — politické sladění | PARTIAL → SUPERSEDED-BY-RF-2 | Mapuje na RF-2 (procesní integrita ÚP — petice 138 podpisů 2022) | [RED-FLAGS.md#rf-2](./RED-FLAGS.md), [04-legal/legal-exposure.md#c1-petice-k-uzemnimu-planu](./04-legal/legal-exposure.md), [07-sources/evidence-manifest.md#e10](./07-sources/evidence-manifest.md) | Riziko zablokování povolení po převodu | Petice 2022 NEZABRÁNILA přijetí ÚP. Zbytkové riziko: jakákoli skupina může podat správní žalobu. Evidence-gap: ověření zda byla podána věc u KS Praha (krajský správní soud) — zatím nezjištěno (sken NSS / nssoud čistý). |
| H7 | Historické environmentální závazky na 42 ha | RSLV (lokalita) → PARTIAL (Čepro blízkost) | — | [04-legal/environmental-liability-memo.md](./04-legal/environmental-liability-memo.md) | CERCLA-typ české expozice za sanaci | **Lokalita = bývalá zemědělská půda od 17. století; žádné průmyslové dědictví na pozemku**. EIA STC2258 baseline 2019-2020 nezjistila hot-spot kontaminaci. **Materiální riziko blízkosti: Čepro Mstětice velkoobchodní sklad pohonných hmot < 2 km, havarijní zóna překrývá železniční stanici Mstětice**. Vyžadována Phase I ESA + Phase II baseline pro PPF. |
| H8 | Doložky dluhopisů ohledně změny kontroly | OPEN | — | [03-financial/financial-analysis.md#riziko-zmeny-kontroly](./03-financial/financial-analysis.md), [03-financial/sbirka-listin-audit.md](./03-financial/sbirka-listin-audit.md) | Spuštění prodejního práva, refinanční tlak | Standardní české retail dluhopisy: putovní právo investora pri MAC + cross-default. Souhlas dluhopisových investorů odhad 1-3 % zůstatku. Evidence-gap: **plné texty CoC klauzulí 5 prospektů** — vyžaduje stažení PDF z ČNB CRR. Doporučeno: žádost o waiver CoC zahájit při podpisu SPA. |
| H9 | Ocenění výroby/zásob RD Rýmařov | OPEN | — | [02-entity/confirmed-entities.md#tier-3-emitenti-dluhopisu](./02-entity/confirmed-entities.md) | Alokace protiplnění při sloučení | RD Rýmařov = největší český výrobce dřevostaveb (jádrový provoz). Při akciovém obchodě na 100 % III. alpha s.r.o. (doporučená struktura) RD Rýmařov **mimo rozsah transakce** — vyjmuto z širší skupiny Progresus. Evidence-gap: pokud strukturováno jako majetkový obchod, samostatné ocenění RD Rýmařov nutné. |
| H10 | Daňová expozice — transferové ceny, řetězce DPH | OPEN | — | [03-financial/TAX-STRUCTURE-MEMO.md](./03-financial/TAX-STRUCTURE-MEMO.md), [03-financial/sbirka-listin-audit.md](./03-financial/sbirka-listin-audit.md) | Víceleté zpětné daňové nároky | TAX-STRUCTURE-MEMO existuje (54 KB) — viz file pro plnou analýzu daňových toků. Evidence-gap: **dokumentace transferových cen napříč 100+ entitami** + daňové memo k restrukturalizaci 2023-04→2024-01. |
| H11 | Koncentrace protistran (klíčoví dodavatelé/odběratelé) | OPEN | — | [02-entity/entity-structure.md#dalsi-segmenty-skupiny](./02-entity/entity-structure.md) | Provozní šok po uzavření | Evidence-gap: **top-10 protistrany seznam neexistuje**. Vyžaduje interní data Progresus (CFO Heyduk). Při akciovém obchodě na NZ a.s. cestou III. alpha kontinuita smluv zachována. |

## STŘEDNÍ (7)

| # | Zjištění | Stav | Mapping | Evidence (file#anchor) | Riziko PPF | Obrana / Stav řešení |
|---|---------|------|---------|------------------------|------------|----------------------|
| M1 | Soulad GDPR v DD dataroomu | OPEN | — | [04-legal/legal-exposure.md#e2-gdpr](./04-legal/legal-exposure.md) | Standardní DD požadavek | DPIA + smlouvy o zpracování + jmenování DPO. Specifická obava: data tisíců retailových držitelů dluhopisů. Žádný materiál v workspace zatím. |
| M2 | Standardizace pracovních smluv | OPEN | — | [04-legal/legal-exposure.md](./04-legal/legal-exposure.md) | Riziko retence | Evidence-gap: audit standardních HR smluv neexistuje. |
| M3 | Řetězec přiřazení IP (loga, marketing) | OPEN | — | [04-legal/studio-perspektiv-resolution.md](./04-legal/studio-perspektiv-resolution.md) | Nízké riziko IP | Studio Perspektiv vyřešeno (C7). Zbývá: smlouvy o postoupení IP od HKR Praha (urbanistická studie 2011), 20-20 ARCHITEKTI (RD fáze 1), Ravantino Architekti (in-house masterplan). |
| M4 | Adekvátnost pojistného krytí (D&O, majetek) | OPEN | — | [04-legal/legal-exposure.md#g1-do-pojisteni](./04-legal/legal-exposure.md) | Mezera po uzavření | Evidence-gap: rozpis pojištění + plán prodloužení doběhového (tail) D&O po uzavření. PPF bude vyžadovat tail krytí poskytované Progresusem nebo kupujícím. |
| M5 | Soulad s dotacemi (EU fondy) | OPEN | — | [07-sources/evidence-manifest.md](./07-sources/evidence-manifest.md) | Riziko zpětného vymáhání | Evidence-gap: dotinfo.cz / smlouvy.gov.cz prověrka pro skupinu Progresus zatím neproběhla. |
| M6 | Struktury odměňování představenstva / vedení | OPEN | — | [03-financial/sbirka-listin-audit.md](./03-financial/sbirka-listin-audit.md) | Výplaty při změně kontroly | Evidence-gap: bonusy managementu / change-of-control payouts rozvrh — vyžaduje interní data Progresus + smluvní kopie. |
| M7 | Stav kybernetické bezpečnosti | OPEN | — | (žádný workspace dokument) | Únik dat po uzavření | Evidence-gap: **žádný cyber DD materiál v workspace**. Penetration test report + bezpečnostní směrnice + IS audit zatím nedoručeny. |

---

## Souhrn stavu (Pass-12, 2026-04-28)

**Celkem zjištění**: 25
- **RSLV (vyřešeno)**: 6 / 25 (24 %) — C1, C2, C5, C6, C7, H2 (částečně H7 lokalita)
- **SUPERSEDED by RF (mapováno na autoritativní červené vlajky)**: 5 / 25 (20 %) — C3→RF-28, C4→RF-26, H1→RF-3+27+28, H3→RF-29, H6→RF-2
- **PARTIAL / MITG (částečně doloženo, zbývá mezera)**: 2 / 25 (8 %) — H7 (Čepro blízkost) + H1
- **OPEN (evidence-gap, čeká na DD sprint)**: 12 / 25 (48 %) — H4, H5, H8, H9, H10, H11, M1, M2, M3, M4, M5, M6, M7

**Změna stavu před → po Pass-12**:
- Před (baseline 2026-04-21): 25/25 OPEN (100 %)
- Po (Pass-12): 6 RSLV / 5 SUPERSEDED-BY-RF / 2 PARTIAL / 12 OPEN — **52 % kvalifikovaně řešeno nebo nahrazeno**

**Zarovnání s RED-FLAGS**: 11 z 25 původních findings nyní mapováno na 7 jedinečných RF-XX (RF-2, RF-3, RF-8, RF-26, RF-27, RF-28, RF-29). RED-FLAGS.md je now autoritativní zdroj pro pohyblivý risk register; MASTER-FINDINGS.md je historická baseline + status tabulka.

---

## Evidence chain

Tento dokument deriváty file-based facts z 8 primárních zdrojových dokumentů workspace:

| Sekce | Primární zdroj | Sekundární odkaz |
|-------|----------------|-------------------|
| Entitní fakta | [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md), [02-entity/entity-structure.md](./02-entity/entity-structure.md) | [02-entity/cuzk-cadastre-forensics.md](./02-entity/cuzk-cadastre-forensics.md), [02-entity/land-title-chain.md](./02-entity/land-title-chain.md) |
| Finanční / Sbírka listin | [03-financial/sbirka-listin-audit.md](./03-financial/sbirka-listin-audit.md) | [03-financial/financial-analysis.md](./03-financial/financial-analysis.md), [03-financial/TAX-STRUCTURE-MEMO.md](./03-financial/TAX-STRUCTURE-MEMO.md) |
| Soudní spory / ISIR | [04-legal/isir-court-sweep.md](./04-legal/isir-court-sweep.md) | [04-legal/DANCORE-FORENSIC-DOSSIER.md](./04-legal/DANCORE-FORENSIC-DOSSIER.md), [04-legal/legal-exposure.md](./04-legal/legal-exposure.md) |
| Resolution memos (per-finding) | [02-entity/HP-sharing-ban-resolution.md](./02-entity/HP-sharing-ban-resolution.md), [04-legal/studio-perspektiv-resolution.md](./04-legal/studio-perspektiv-resolution.md), [04-legal/permitting-status-memo.md](./04-legal/permitting-status-memo.md), [04-legal/environmental-liability-memo.md](./04-legal/environmental-liability-memo.md), [04-legal/ubo-disclosure-memo.md](./04-legal/ubo-disclosure-memo.md) | — |
| Aktivní red-flags | [RED-FLAGS.md](./RED-FLAGS.md) | [06-reports/MASTER-DD-REPORT-v1.0.md](./06-reports/MASTER-DD-REPORT-v1.0.md) |
| Master citation chain | [07-sources/evidence-manifest.md](./07-sources/evidence-manifest.md) | [07-sources/citation-rank.md](./07-sources/citation-rank.md) |

**Plný řetězec důkazů + URL archivu** viz [07-sources/evidence-manifest.md](./07-sources/evidence-manifest.md). Tento manifest je závazný; každé tvrzení v této tabulce musí mít odkaz na zdroj zde.

**Příští krok**: Spustit 90denní pre-DD remediační sprint (definováno v [06-reports/MASTER-ACTION-PLAN.md](./06-reports/MASTER-ACTION-PLAN.md)) — priority pro 12 OPEN findings: (1) ČÚZK LV 927+1326 placený výpis (H5), (2) PROGRESUS Group FY24 konsolidovaná PDF stažení (H4, H10), (3) plné CoC texty 5 dluhopisových prospektů z ČNB CRR (H8).

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [LINK-AUDIT.md](./LINK-AUDIT.md) — MASTER-FINDINGS.md (2×)
- [WORKSPACE-STATS.md](./WORKSPACE-STATS.md) — MASTER-FINDINGS.md (2×)
- [_assets/CANVAS-AUDIT.md](./_assets/CANVAS-AUDIT.md) — MASTER-FINDINGS.md (2×)
- [01-intel/README.md](./01-intel/README.md) — MASTER-FINDINGS.md
- [02-entity/README.md](./02-entity/README.md) — MASTER-FINDINGS.md
- [04-legal/README.md](./04-legal/README.md) — MASTER-FINDINGS.md
- [07-sources/README.md](./07-sources/README.md) — MASTER-FINDINGS.md
- [CHANGELOG.md](./CHANGELOG.md) — MASTER-FINDINGS.md

## 🏷️ Související soubory (podle shody tagů)

- [LINK-AUDIT.md](./LINK-AUDIT.md) — podobnost 0.35 · AUDIT ODKAZŮ

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `MASTER-FINDINGS.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
