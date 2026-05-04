# Přehled ČERVENÝCH PRAPORŮ — DD Progresus → PPF

**Verze**: 1.1 — Pass-12 triage 2026-04-28
**Předchozí verze**: 1.0 — Pass 4 (2026-04-21)
**Last reviewed**: 2026-04-28
**Celkem aktivních flagů**: 30 (18 KRIT + 12 VYS) + 6 RSLV/DEGR
**Status legend**: `OPEN` = aktivní, evidence neúplná · `PENDING-EVIDENCE` = aktivní, čeká se na konkrétní zdroj (ČÚZK placený přístup, FinCEN BOI, atd.) · `MITG` = aktivní, mitigace v běhu · `RSLV` = vyřešeno · `DEGR` = degradováno na nižší úroveň · `KRIT` = kritické · `VYS` = vysoké

---

## 🟢 VYŘEŠENO / DEGRADOVÁNO (6)

| # | Předchozí zjištění | Vyřešení | Status | Evidence |
|---|---------------|------------|--------|----------|
| ✓ C1 (dříve RF-6→26) | CASPER 800M/229M | **Casper Group (Štekl)** externí spoluinvestor na Vitrablok; 800M = celkem, 229M = Progresus | RSLV | [03-financial/financial-analysis.md#C1](./03-financial/financial-analysis.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#7-4](./06-reports/MASTER-DD-REPORT-v1.0.md) |
| ✓ C4 | DANCORE 209,6M | **DANCORE LLC Nevada** — 6letý spor o NZ pozemky (povýšeno na RF-26 KRIT) | RSLV | [04-legal/DANCORE-FORENSIC-DOSSIER.md#4](./04-legal/DANCORE-FORENSIC-DOSSIER.md) · [04-legal/isir-court-sweep.md#4-řízení-jako-1](./04-legal/isir-court-sweep.md) |
| ✓ C5 | 4 řízení jako 1 | = sériové spory DANCORE (jedna protistrana, několik kol) | RSLV | [04-legal/isir-court-sweep.md](./04-legal/isir-court-sweep.md) · [04-legal/DANCORE-FORENSIC-DOSSIER.md#2-1](./04-legal/DANCORE-FORENSIC-DOSSIER.md) |
| ↓ RF-6 | Historická insolvence RD Rýmařov | Návrh z 2009 zamítnut do 3 dnů jako „nesmyslný" — NENÍ SUBSTANTIVNÍ | DEGR | [04-legal/isir-court-sweep.md](./04-legal/isir-court-sweep.md) |
| ↓ RF-16 (architektonická obava) | Čínská zeď Zrůsta | **Žádný přímý konflikt ve veřejných záznamech** (ZOOT/VHM/Sberbank/Amati ≠ aktiva Progresus); architektonická obava trvá jako VYS RF-16 | DEGR | [04-legal/isir-court-sweep.md#zrust-konreo](./04-legal/isir-court-sweep.md) · [01-intel/principals-deep-osint.md#mandáty](./01-intel/principals-deep-osint.md) |
| ✓ C2 | RONDAX skrytý | Nenalezen v ARES — **pravděpodobně OCR chyba** v dokumentech 2026-04-01 | RSLV | [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md) |

---

## 🔴 KRITICKÉ (18)

### RF-1: Spor o vlastnictví zástavy dluhopisů (Pro Věřitele)
- **Status**: PENDING-EVIDENCE (čeká placený ČÚZK účet pro LV 927 / LV 1326)
- **Tvrzení** (pro-veritele.cz 2024–25): zastavená nemovitost „pravděpodobně není ve vlastnictví emitenta"; „nedostatečné, sporné, obtížně ověřitelné zajištění".
- **Riziko**: ve spojení s RF-3/RF-27 + RF-28 by mohlo spustit ČNB přezkoumání souladu prospektu.
- **Evidence**: [03-financial/sbirka-listin-audit.md#3](./03-financial/sbirka-listin-audit.md) · [02-entity/cuzk-cadastre-forensics.md](./02-entity/cuzk-cadastre-forensics.md) · [02-entity/land-title-chain.md](./02-entity/land-title-chain.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-1](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-2: Procesní integrita zelenečského územního plánu
- **Status**: OPEN (KS Praha správní spis check pending)
- **Fakta**: Petice se 138 podpisy (V Zelenči jsme doma, z.s., 2022) namítá „nepatřičné vazby mezi zástupcem plánu a projektantem"; ÚP přijat 2025-02-18.
- **Evidence**: [04-legal/permitting-status-memo.md](./04-legal/permitting-status-memo.md) · [04-legal/legal-exposure.md](./04-legal/legal-exposure.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-8-H2](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-3: Pozdní zveřejnění finančních výsledků Progresus
- **Status**: OPEN (rozšířeno na RF-27)
- **Pozn.**: Nyní rozšířeno na RF-27: **Nový Zeleneč a.s. FY2021–2024 vše chybí, 4letá prodleva**.
- **Evidence**: [03-financial/sbirka-listin-audit.md#3-novy-zelenec](./03-financial/sbirka-listin-audit.md) · viz též RF-27.

### RF-4: Agresivní taktiky retailového prodeje dluhopisů
- **Status**: OPEN (audit korespondence ČNB pending)
- **Fakta**: newstream.cz + proveritele.cz — nátlakové oslovování, intenzivní kampaně; 68 tranší napříč 5 emitentskými SPV.
- **Evidence**: [03-financial/financial-analysis.md#K-Pro-Věřitele](./03-financial/financial-analysis.md) · [03-financial/sbirka-listin-audit.md#bond-spv](./03-financial/sbirka-listin-audit.md) · [01-intel/comms-footprint.md](./01-intel/comms-footprint.md)

### RF-5: Duální vlastnictví pozemků (Nový Zeleneč a.s. + RD Rýmařov Invest III. alpha s.r.o.)
- **Status**: OPEN (struktura objasněna, parcelní rozpis pending)
- **Fakta**: IČO 27825981 (NZ) + **10800123** (III.alpha, založeno 2021-04-30, Karlín). Vnitřně naskládáno (III.alpha 100 % vlastník NZ a.s.).
- **Evidence**: [02-entity/entity-structure.md](./02-entity/entity-structure.md) · [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md) · [02-entity/land-title-chain.md](./02-entity/land-title-chain.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-5](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-8: HP (Hospodářské Pozemky?) zákaz sdílení
- **Status**: PENDING-EVIDENCE (memo vypracováno, zdroj-dokument re-load potřebný)
- **Evidence**: [02-entity/HP-sharing-ban-resolution.md](./02-entity/HP-sharing-ban-resolution.md)

### RF-9: Quinlan Private — distresový původ pozemků
- **Status**: OPEN (mapping titulů 2007 → dnes pending)
- **Fakta**: 42 ha přes zkrachovalý irský PE → Nuka Estates Luxembourg → Lébr → Progresus.
- **Evidence**: [02-entity/land-title-chain.md#fáze-1](./02-entity/land-title-chain.md) · [04-legal/legal-exposure.md](./04-legal/legal-exposure.md)

### RF-10: Nuka Estates s.r.o. stále v likvidaci
- **Status**: OPEN (likvidátorka certifikát pending)
- **Fakta**: IČO 27890104; likvidátorka Pavlína Zdařilová od 2023-04-19; **adresa Holická 1173/49a Hodolany Olomouc**.
- **Evidence**: [02-entity/cuzk-cadastre-forensics.md#1](./02-entity/cuzk-cadastre-forensics.md) · [02-entity/land-title-chain.md#fáze-2](./02-entity/land-title-chain.md) · [01-intel/principals-deep-osint.md#zdařilová](./01-intel/principals-deep-osint.md)

### RF-11: Status zajištěného věřitele MARSEA MIA
- **Status**: OPEN (discharge letter pending)
- **Fakta**: IČO 03454029, Hynaisova 554/11 Olomouc. **Stále AKTIVNÍ — zástavy mohou nadále zatěžovat 130ha pool**. Vazba na rodinu Lébr (Jana Lébrová 60 %, Jaroslav Lochman 40 %).
- **Evidence**: [02-entity/cuzk-cadastre-forensics.md#1](./02-entity/cuzk-cadastre-forensics.md) · [02-entity/land-title-chain.md#fáze-2](./02-entity/land-title-chain.md) · [04-legal/legal-exposure.md](./04-legal/legal-exposure.md)

### RF-12: Reziduální vztah Lébr / Ravantino Group
- **Status**: OPEN (formální dopis Lébra pending; web Ravantino čištění pending)
- **Fakta**: Web Ravantino stále inzeruje projekt; ITS Mstětice s.r.o. (IČO 10745246) byl výhradně Lébrovo 2021-04-14 → 2024-10-30.
- **Evidence**: [01-intel/principals-deep-osint.md#osoba-3-lébr](./01-intel/principals-deep-osint.md) · [02-entity/land-title-chain.md#fáze-3](./02-entity/land-title-chain.md) · [01-intel/comms-footprint.md](./01-intel/comms-footprint.md)

### RF-13: Rozsah 130 ha vs. 42 ha
- **Status**: MITG (perimetr ověřen — další 88 ha mimo transakci)
- **Fakta**: k.ú. Mstětice (**792764**) = 135,1 ha orné půdy (11 parcel ≥5 ha). Kandidát na transakce = 73/1 (24,85 ha) + 178/1 (16,84 ha) = 41,7 ha ≈ 42 ha.
- **Evidence**: [02-entity/cuzk-cadastre-forensics.md#3-schéma-130ha](./02-entity/cuzk-cadastre-forensics.md) · [02-entity/land-title-chain.md#q3](./02-entity/land-title-chain.md)

### RF-14: Reorganizace skupiny 2023-04 → 2024-01 (strana Progresus)
- **Status**: OPEN (memo + tax opinion pending)
- **Fakta**: 9 dceřinek PROGRESUS invest holding s.r.o. mělo období vztahu končící 2023-04-13 → 2024-01-30. Načasování podezřelé vůči transakci.
- **Evidence**: [02-entity/entity-structure.md](./02-entity/entity-structure.md) · [03-financial/sbirka-listin-audit.md#5-papírová-stopa](./03-financial/sbirka-listin-audit.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-14](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-26: DANCORE LLC — 6letý spor s vazbou na USA o NZ pozemky
- **Status**: OPEN — KRIT (odvolání 2024-11-18 stále živé)
- Nevadská LLC #E0353972015-2, založena **2015-07-23**, Las Vegas
- Spis 30 Co 228/2019-1538 Krajský soud Praha (1 538 dokumentů)
- Dvakrát zamítnuto (naposledy 2024-06-25), **odvolání podáno 2024-11-18 STÁLE ŽIVÉ**
- V dluhopisovém prospektu zavádějícně zveřejněno jako „jeden spor"
- **Dancore LLC v. Zika, 2:18-cv-01136 (D. Nev. 2018)** — samostatný americký federální spor NEZVEŘEJNĚN v žádném dokumentu Progresus
- **Očekávaná expozice**: vážená CZK 102,5M / doporučená úschova CZK 250–400M / nepravděpodobná škoda CZK 1,0 mld.
- **Evidence**: [04-legal/DANCORE-FORENSIC-DOSSIER.md](./04-legal/DANCORE-FORENSIC-DOSSIER.md) (466 řádků, 10 sekcí) · [04-legal/isir-court-sweep.md#4-řízení-jako-1](./04-legal/isir-court-sweep.md) · [04-legal/dancore-timeline.html](./04-legal/dancore-timeline.html) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-26](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-27: Nový Zeleneč a.s. — 4letá prodleva v podání účetních závěrek
- **Status**: OPEN — KRIT (remediační sprint nutný před PPF disclosure)
- **Fakta**: NULA podání za FY2021, 2022, 2023, 2024. Pouze FY2020 ve spisu. Porušuje §21a zákona o účetnictví.
- **Evidence**: [03-financial/sbirka-listin-audit.md#3-cíl-nový-zeleneč](./03-financial/sbirka-listin-audit.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-3-RF-27](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-28: Soubor dluhopisů je 7,6+ mld. CZK (ne ~1 mld.)
- **Status**: OPEN — KRIT (waiver kampaň 60–90 dní pending)
- **Fakta**: 5 schválených prospektů ČNB, 68 tranší. 4/5 emitentů má NULU finančních podání. 5. prospekt schválen 2026-01-28 v průběhu jednání s PPF.
- **Evidence**: [03-financial/sbirka-listin-audit.md#bond-spv](./03-financial/sbirka-listin-audit.md) · [03-financial/financial-analysis.md#dluhopisový-program](./03-financial/financial-analysis.md) · [03-financial/bond-stack.html](./03-financial/bond-stack.html) · [06-reports/MASTER-DD-REPORT-v1.0.md#7-1](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-29: Operativní koncentrace u Zrůsta (single-point-of-failure)
- **Status**: OPEN — KRIT (druhý jednatel pre-podpis required)
- **Fakta**: Jediný jednatel celé dealové vertikály: NZ a.s. + RD Rýmařov III.alpha + PROGRESUS Developments + PROGRESUS Bonds + 5 dluhopisových emitentů.
- **Evidence**: [01-intel/principals-deep-osint.md#osoba-1-zrůst](./01-intel/principals-deep-osint.md) · [02-entity/entity-structure.md](./02-entity/entity-structure.md) · [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md)

### RF-30: Jirásková + Jirásko POTVRZENI jako manželé (konflikt na straně PPF)
- **Status**: OPEN — KRIT (páka pro Progresus, akce: vyžadovat 3rd-party banku NEBO §23a clearance ČNB)
- **Fakta**: Potvrzeno přes HN.cz. Stejná adresa Zvonická 710/3, Dejvice. Oba povýšeni Kellnerem 2013. Financování přes PPF banka = §23a ZoB území spřízněných osob.
- **Evidence**: [01-intel/ppf-people-dossiers.md#osoba-1-jirásková](./01-intel/ppf-people-dossiers.md) · [01-intel/ppf-people-dossiers.md#osoba-7-jirásko](./01-intel/ppf-people-dossiers.md) · [01-intel/ppf-deal-financing-analysis.md](./01-intel/ppf-deal-financing-analysis.md)

### RF-31: AMALAR 100% vlastnictví PPF + odkup Kellnera Jr. za USD 1,9 mld.
- **Status**: OPEN — KRIT (zdroj prostředků 4 hypotézy, přímý dotaz na 1. DD hovor)
- **Fakta**: Srpen 2025: Kellnerová + 3 dcery odkoupily 10% podíl Petra Kellnera Jr. za **USD 1,9 mld.** Zdroj prostředků NEZNÁMÝ. AMALAR HOLDING s.r.o. (IČO 19696477), nikoli zahraniční vehikl.
- **Evidence**: [01-intel/ppf-people-dossiers.md#osoba-8-kellnerová](./01-intel/ppf-people-dossiers.md) · [03-financial/sbirka-listin-audit.md#amalar](./03-financial/sbirka-listin-audit.md) · [01-intel/ppf-deal-financing-analysis.md](./01-intel/ppf-deal-financing-analysis.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-31](./06-reports/MASTER-DD-REPORT-v1.0.md)

---

## 🟠 VYSOKÉ (12)

### RF-15: Financování akvizice RD Rýmařov 2020 ze strany rodiny SIKO / Valový
- **Status**: MITG (čistý exit potvrzen, dokumentace pending)
- **Fakta**: úvěr 65 mil. CZK přes Lucros SICAV a.s. (IČO 28507428), 20 % úrok, splaceno do roka.
- **Evidence**: [01-intel/principals-deep-osint.md#valoví](./01-intel/principals-deep-osint.md) · [03-financial/financial-analysis.md](./03-financial/financial-analysis.md)

### RF-16: Vzor akvizic z insolvencí (Zrůst/Konreo/Casper/Progresus) — architektonický
- **Status**: DEGR (žádný přímý konflikt — architektonická obava trvá)
- **Evidence**: [04-legal/isir-court-sweep.md#zrust-konreo](./04-legal/isir-court-sweep.md) · [01-intel/principals-deep-osint.md#mandáty](./01-intel/principals-deep-osint.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-2-R1](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-17: RD Rýmařov s.r.o. jako věřitel ve 3 aktivních insolvencích
- **Status**: OPEN (ISIR per-case výpisy pending)
- **Evidence**: [04-legal/isir-court-sweep.md](./04-legal/isir-court-sweep.md) · [06-reports/MASTER-DD-REPORT-v1.0.md#RF-17](./06-reports/MASTER-DD-REPORT-v1.0.md)

### RF-18: Nevysvětlená duální entita Progresus „core" a.s.
- **Status**: OPEN (strukturní memo pending)
- **Fakta**: Progresus invest holding core a.s. (IČO 13995758) vs. PROGRESUS invest holding s.r.o. (IČO 09932836).
- **Evidence**: [02-entity/entity-structure.md](./02-entity/entity-structure.md) · [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md)

### RF-19: První územní plán Zeleneč až z 02/2025
- **Status**: OPEN (vazba na RF-2)
- **Evidence**: [04-legal/permitting-status-memo.md](./04-legal/permitting-status-memo.md)

### RF-20: Komplexita 100+ entit skupiny
- **Status**: OPEN (skupinový diagram + scope mapping pending)
- **Evidence**: [02-entity/entity-structure.md](./02-entity/entity-structure.md) · [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md) · [02-entity/entity-graph.html](./02-entity/entity-graph.html)

### RF-21: Neobvyklý mix oborů (doplňky stravy, právo, IT)
- **Status**: OPEN (zdůvodňující memo pending)
- **Evidence**: [02-entity/entity-structure.md](./02-entity/entity-structure.md)

### RF-22: Nový Zeleneč a.s. registrován v Olomouci (odkaz Lébr)
- **Status**: OPEN
- **Evidence**: [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md) · [02-entity/entity-offices-map.html](./02-entity/entity-offices-map.html)

### RF-23: Více entit „Acquisitions" z restrukturalizace 2023
- **Status**: OPEN (vazba na RF-14)
- **Evidence**: [02-entity/entity-structure.md](./02-entity/entity-structure.md)

### RF-24: Více podobně pojmenovaných entit „Developments"
- **Status**: OPEN
- **Evidence**: [02-entity/confirmed-entities.md](./02-entity/confirmed-entities.md) · [02-entity/entity-structure.md](./02-entity/entity-structure.md)

### RF-25: Přístup k registru UBO omezen 12/2025
- **Status**: PENDING-EVIDENCE (alternativní cesty: ARES + manuální dohledávání)
- **Evidence**: [04-legal/ubo-disclosure-memo.md](./04-legal/ubo-disclosure-memo.md)

### RF-32: Redomicil PPF NL→CZ 2026-04-01
- **Status**: OPEN (strukturální páka pro Progresus — nový tým co-CEO zdědil tezi)
- **Evidence**: [01-intel/ppf-people-dossiers.md#manažerské-shrnutí](./01-intel/ppf-people-dossiers.md) · [03-financial/sbirka-listin-audit.md#ppf-nové-entity](./03-financial/sbirka-listin-audit.md) · [01-intel/transaction-context.md](./01-intel/transaction-context.md)

### RF-33: Robert Ševela mnohem výše postavený, než předchozí intel naznačoval
- **Status**: OPEN (přímá kultivace vztahu — operátor PPF s nejvyšší pákou)
- **Fakta**: 20letý vrchní investiční ředitel PPF, 115 propojených společností, CZK 14 mld. státních zakázek.
- **Evidence**: [01-intel/ppf-people-dossiers.md#osoba-6-ševela](./01-intel/ppf-people-dossiers.md) · [01-intel/ppf-governance.html](./01-intel/ppf-governance.html)

### RF-34: Expozice Frydrycha Rusko/Eldorado
- **Status**: OPEN (postsankční prověrka pending)
- **Fakta**: CEO ruského Eldoradu 2014–2016.
- **Evidence**: [01-intel/ppf-people-dossiers.md#osoba-3-frydrych](./01-intel/ppf-people-dossiers.md)

### RF-35: Menno Verhoeff — další signatář představenstva PPF
- **Status**: OPEN (residence post-redomicil ověřit pro signing-jurisdiction)
- **Fakta**: Holanďan, ex-CBRE, vede PPF RE NL+UK; nastoupil do BoD PPF Group v květnu 2025.
- **Evidence**: [01-intel/ppf-people-dossiers.md#osoba-4-verhoeff](./01-intel/ppf-people-dossiers.md)

### RF-36: Aleš Minx (bývalý předseda představenstva PPF → poradce AMALAR)
- **Status**: OPEN (vyjednávací psychologie — ověřit, kdo schválil první kontakt)
- **Evidence**: [01-intel/ppf-people-dossiers.md#osoba-9-minx](./01-intel/ppf-people-dossiers.md)

---

## Souhrn

- **KRITICKÉ**: 18 (6 NOVÝCH v Pass 4)
- **VYSOKÉ**: 12 (5 NOVÝCH v Pass 4)
- **VYŘEŠENO/DEGRADOVÁNO**: 6
- **Celkem aktivních flagů**: 30
- **Pozn. RF-7 absentuje**: záměrně přeskočen v Pass 1; nikdy přidělen.

**Stav statusů po Pass-12 triage 2026-04-28**:
- OPEN: 25
- PENDING-EVIDENCE: 3 (RF-1, RF-8, RF-25)
- MITG: 2 (RF-13, RF-15)
- DEGR (aktivní, snížená): 1 (RF-16)

**Agregátní tlak na ocenění**: **−18 až −33 %**, pokud zjištění zasáhnou PPF v rámci DD bez přípravy prodávajícího.

**Připravenost po Pass 4 / Pass-12 triage**: 55 % (z 25 % před Pass 4)
**Cíl pro první jednání s PPF**: 90 %+

**Konzolidace tagů v1.1**: KRITICKÉ → KRIT, VYSOKÉ → VYS; statusy: OPEN / PENDING-EVIDENCE / MITG / RSLV / DEGR (jednotně).

**Cross-link**: detailní narativ + obrana jednotlivých flagů v [06-reports/MASTER-DD-REPORT-v1.0.md sekce 6](./06-reports/MASTER-DD-REPORT-v1.0.md).

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MASTER-FINDINGS.md](./MASTER-FINDINGS.md) — RED-FLAGS.md#vyresenodegradovano-6 (10×)
- [02-entity/raw-cuzk/README.md](./02-entity/raw-cuzk/README.md) — `../../RED-FLAGS.md` (2×)
- [05-osint/ppf-side-deep/README.md](./05-osint/ppf-side-deep/README.md) — `../../RED-FLAGS.md` (2×)
- [06-reports/red-flags-dashboard.html](./06-reports/red-flags-dashboard.html) — RED-FLAGS.md (2×)
- [06-reports/monte-carlo-valuation.html](./06-reports/monte-carlo-valuation.html) — Rizikové signály
- [06-reports/pressure-radar.html](./06-reports/pressure-radar.html) — RED-FLAGS.md
- [BACKLINKS-AUDIT.md](./BACKLINKS-AUDIT.md) — RED-FLAGS.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `RED-FLAGS.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
