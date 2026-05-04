# Bondholder Pre-Consent Strategy — Pass-12

**Pracovní prostor**: DD-Progresus-PPF-2026-04-21
**Verze**: v1.0
**Datum**: 2026-04-28
**Vlastník**: Tomáš Korčák
**Klasifikace**: DŮVĚRNÉ — Sell-side DD
**Délka**: ~1900 řádků
**Status**: Working paper — vyžaduje validaci externím dluhopisovým právním zástupcem před exekucí

---

## OBSAH

- I. Executive Summary
- II. Bond Stack Overview
- III. CoC Covenant Inventory
- IV. Top 10 Institutional Holders — Hypothesis
- V. Sequencing Strategy
- VI. Consent Pricing
- VII. Risk Scenarios
- VIII. Communication Templates
- IX. Action Plan
- X. Open Questions for Legal
- Apendix A — Decision matrix (per-emitent path)
- Apendix B — Glossary

---

## I. Executive Summary

### I.1 Cíl mise

Zajistit **change-of-control (CoC) waivery nebo amendmenty** u **68 tranší dluhopisů Progresus napříč 5 schválenými prospekty (kapacita ≥ 7,6 mld. CZK, odhadovaný outstanding 2-3 mld. CZK)** dříve, než dojde k podpisu SPA s PPF na akvizici Nový Zeleneč a.s. (42 ha greenfield, k.ú. Mstětice).

Důvod: prodej cílového aktiva spouští formální CoC ustanovení napříč všemi pěti prospekty (cross-guarantee přes PROGRESUS Group a.s.). **Bez pre-consent solicitation se transakce stává podmíněnou downstream událostí**, kterou kupující (PPF) může použít jako tlak na cenu nebo důvod k odstoupení. **S** pre-consent solicitation prodávající přebírá kontrolu nad procesem, nakupuje opci na "clean closing" a mění CoC z deal-killer rizika v rutinní administrativní krok.

### I.2 Tři klíčová omezení

1. **Časové okno**: PPF exclusivity = ~8 týdnů. Bondholder solicitation v české praxi = 60-90 dní. **Buďto začneme T-8 týdnů před SPA, nebo budeme negotiovat pod tlakem closing dependency.**

2. **Transparentnost vs. confidentiality**: Pre-consent solicitation **nutně signalizuje** trhu, že transakce je na stole. Tím **prolomí** dosavadní confidentiality status (potvrzeno neporušený k 2026-04-21 dle MASTER-DD-REPORT §2.1). Tento trade-off je akceptovatelný **pouze** pokud PPF souhlasí s code-name closing strategy a kontrolovaným zveřejněním vůči trustees, nikoli vůči médiím.

3. **Dokumentační deficit**: 4 z 5 emitentů (PROGRESUS RD Rýmařov a.s., II, III, IV) **nepodali žádné účetní závěrky** ve Sbírce listin (RF-3, RF-27). To znamená, že institucionální držitelé budou pravděpodobně **požadovat dodatečné finanční vyrovnání před udělením souhlasu** — nelze prezentovat čistý "good news" narativ bez paralelní kompletace ÚZ minimálně FY2024.

### I.3 Top 3 risk vektory v sekvencování

1. **Holdout coalition**: Pokud 3-5 největších institucionálních držitelů (kombinovaně 60-70 % outstanding) vytvoří neformální koordinaci a podmíní souhlas vyšším poplatkem nebo dodatečnými covenanty (např. cash sweep, restricted payments), náklady solicitation eskalují z odhadovaných 50 bps na 150-200 bps. Mitigace = sekvenční bilateral soundings před formal launch.
2. **Retail dispersion**: Prospekty Progresus byly distribuovány retailovými kanály (newstream.cz, proveritele.cz). Pokud retailová báze přesahuje 30 % outstanding, written-resolution path není dosažitelná a každá série půjde nucenou meeting cestou — to přidá 4-6 týdnů per série.
3. **Cross-default cascade**: Pokud jediná série (typicky nejmenší = nejvíce retail = nejhůře řiditelná) odmítne, cross-default mezi sériemi (přes společného guarantora PROGRESUS Group a.s.) může technicky akcelerovat všechny ostatní. Mitigace = strukturovat cross-default carve-out v consent solicitation samotné.

### I.4 Doporučený postup ve 4 větách

(1) Spustit **soft sounding** s 10 institucionálními držiteli **T-8 weeks** před indikovaným SPA, pod individual NDA, s minimálním materiálem (no-name basis pro PPF).
(2) Konvertovat na **formal solicitation** v **T-5** s consent fee **50 bps** (early-bird +25 bps pro souhlas v prvních 5 BD).
(3) Spustit paralelní **per-emitent** schůzky vlastníků dluhopisů v **T-3** pro retailovou bázi v sériích, kde písemné usnesení selže.
(4) **Cleanup holdouts** v **T-1** přes opt-in early redemption (par + accrued interest) financovaný overdraft facility nebo PPF break-money escrow.

### I.5 Metriky úspěchu

| Metrika | Best case | Mid case | Worst case |
|---------|-----------|----------|------------|
| % outstanding consented | ≥ 95 % | 75–90 % | < 75 % |
| Náklady consent (bps × outstanding) | 50 bps × 2,5 mld. = ~12,5 mil. CZK | 75 bps × 2,5 mld. = ~19 mil. CZK + ~50 mil. refinancing | 150 bps × 2,5 mld. = ~37,5 mil. + ~500 mil. refinancing |
| Časové ovlivnění closing | 0 | +2-4 týdny | +8-12 týdnů nebo deal pull |
| Reputační dopad | Žádný | Lokální (Hospodářské noviny krátká zmínka) | Newstream / E15 / proveritele.cz materiální |

---

## II. Bond Stack Overview

### II.1 Inventář emitentů (per Sbírka listin audit, 2026-04-21)

| # | Emitent | IČO | Subjekt ID | Datum vzniku | Účetní závěrky podány | Společný jednatel |
|---|---------|-----|-----------|--------------|----------------------|-------------------|
| 1 | RD Rýmařov Invest Develop a.s. | 10722696 | 1117603 | 2021-03-31 | FY21-23 ✅ podány retroaktivně 2025-03-13; FY24 ❌ chybí | Lukáš Zrůst |
| 2 | PROGRESUS RD Rýmařov a.s. | 17053161 | 1156058 | 2022-04-19 | **NIKDY** žádná ÚZ | Lukáš Zrůst |
| 3 | PROGRESUS RD Rýmařov II a.s. | 19287518 | 1202423 | 2023-04-26 | **NIKDY** žádná ÚZ | Lukáš Zrůst |
| 4 | PROGRESUS RD Rýmařov III a.s. | 21515841 | 1238031 | 2024-04-27 | **NIKDY** žádná ÚZ | Lukáš Zrůst |
| 5 | PROGRESUS RD Rýmařov IV a.s. | 23983922 | 1298146 | 2025-11-21 | n/a (před první závěrkou) | Lukáš Zrůst |

Reference: `03-financial/sbirka-listin-audit.md` §1, §6.

### II.2 Přehled prospektů a tranší

| Prospekt | Schválení ČNB | Schválená kapacita (mld. CZK) | Umístěné tranše | Odhadovaný outstanding |
|----------|---------------|-------------------------------|-----------------|-------------------------|
| 1 | 2021-06-29 | ~3,0 | 18 | 600-900 mil. |
| 2 | 2022-07-04 | ~3,0 | 22 | 700-1100 mil. |
| 3 | 2023-08-10 | ~0,8 | 15 | 350-550 mil. |
| 4 | 2024-12-18 | ~0,8 | 7 | 250-400 mil. |
| 5 | 2026-01-28 | nezveřejněno | 7 (únor 2026) | 250-400 mil. |
| **Total** | | **≥ 7,6 mld. CZK kapacita** | **68 tranší** | **2,15-3,35 mld. CZK** |

**Source caveat**: Outstanding čísla jsou **odhady na základě dluhopisar.cz**. Přesný outstanding per ISIN vyžaduje stažení dodatků k prospektům z databáze ČNB nebo přímý dotaz emitenta. **Krok 1 v Action Plan** = vyžádat si od Lukáše Zrůsta authoritative outstanding schedule per ISIN.

### II.3 Mateřská guarantee architektura

**Společný ručitel**: PROGRESUS Group a.s. (IČO 10978216) ručí napříč všemi pěti emisemi.

**Implikace pro CoC**:
- Spouštěč CoC na úrovni ručitele = **jedna událost ovlivňující paralelně všech 68 tranší**.
- Cross-default mezi sériemi je **vysoce pravděpodobný** (typický český retail bond template) → odmítnutí jediné série technicky akceleruje ostatní.
- **Negotiation point**: žádost o **carve-out cross-default during consent window** (např. 90 dnů) je standardní a rozumný. Bez carve-outu jediný holdout může destabilizovat celou strukturu.

### II.4 Velikostní distribuce tranší

Z dluhopisar.cz: typické emisní velikosti 20-100 mil. CZK + některé EUR (eurové tranše tipicky odpovídají ~25-50 mil. EUR; podléhají ČNB CRR pravidlům).

**Distribuční hypotéza** (vyžaduje validaci CSD outstanding listy):
- ~15-20 tranší velikosti 50-100 mil. CZK = **institucionální** kotvy
- ~30-35 tranší velikosti 20-50 mil. CZK = **smíšené** (mid-market institucionál + advisor wealth)
- ~15-20 tranší velikosti < 20 mil. CZK = **retail-dominované**

Implikace: **40-50 % outstanding je v institucionálních tranších**, kde jednání probíhá s 3-10 IM houses; **50-60 % outstanding je rozprostřené v retailové bázi** s desítkami až stovkami fyzických osob a wealth advisorů.

### II.5 Geografická a kanálová distribuce

- **Primární**: ČR retailoví investoři (proveritele.cz, dluhopisar.cz mass market, LEXXUS retail kanál).
- **Sekundární**: Slovenští retailoví investoři (cross-border passport).
- **Institucionální**: pravděpodobně 5-10 českých asset manažerů (viz §IV) + případně 1-2 Cypriot/Lux fondy (typický CZ EUR tranche buyer).
- **EU passport**: některé EUR tranše mohou být dle prospektů marketovány pod EU passport directive — ověřit, zda jsou drženy v EU IM-ech mimo ČR (typicky Pioneer/Amundi Lux fondy).

---

## III. CoC Covenant Inventory

### III.1 Status disclosure

**Aktuální stav (2026-04-28)**: **plné texty CoC ustanovení nejsou v této session přístupné** — tým má pouze sekundární zdroje (financial-analysis.md §"Riziko změny kontroly"; MASTER-DD-REPORT §6, §11.4 RF-H8).

**Co víme z RF-H8 (MASTER-DD-REPORT)**:
> "Typické české retailové dluhopisy obsahují prodejní právo (put) investora při MAC + spouštěč CoC + cross-default > prah + akceleraci při insolvenci ručitele. Specifická kovenanta vyžadují klauzulový přezkum — vyhotovit srovnávací matici pro všech 5 prospektů."

**Action item v T-8**: stáhnout všech 5 prospektů z databáze ČNB (centrální evidence cenných papírů) a vytvořit row-by-row CoC matrix per prospekt. Bez této matrix nemohou advisory teams (právní + IR) skutečně targetovat institucionální držitele s validovaným CoC narrativem.

### III.2 Předpokládaná CoC struktura per prospekt (hypotéza pending document review)

| Klauzule | Předpokládaný obsah |
|----------|---------------------|
| Definice "Change of Control" | Změna ≥ 50 % v hlasovacích právech ručitele PROGRESUS Group a.s. NEBO převod "podstatné části aktiv" emitenta nebo ručitele |
| Trigger event | Closing převodu kontroly. Notification typicky 30 dnů před. |
| Investor's put right | Right to put bondy zpět emitentovi za nominal + accrued interest. Někdy + premium 1-2 %. Window typicky 30-60 dnů od notification. |
| Cross-default threshold | Materiální default na jakémkoli "Indebtedness" > prah (typicky 50-100 mil. CZK) napříč skupinou |
| Acceleration on guarantor insolvency | Automatic acceleration; nelze waivovat retroaktivně |
| Quorum pro waiver | **Otázka pro legal**: 50 %, 66 %, nebo 75 % outstanding nominal? Per emisní podmínky každé série jednotlivě. Český zákon č. 190/2004 Sb. §21 specifikuje **kvalifikovaná většina = 3/4** přítomných na schůzi vlastníků dluhopisů. |
| Written resolution path | Možná, pokud emisní podmínky výslovně umožňují (na rozdíl od dispoz. legal default = schůze). |

### III.3 Proč prodávající **musí** předpokládat CoC trigger

**Argumentační linie**:
1. Cílové aktivum (Nový Zeleneč a.s., IČO 27825981) je nepřímo "podstatným aktivem" PROGRESUS Group a.s. (ručitele).
2. PPF nakupuje 100 % III. alpha (jediný akcionář NZ a.s.) → mateřský PROGRESUS dceřiný řetězec ztrácí kontrolu nad NZ a.s.
3. I když převod **není** technicky "Change of Control of guarantor" (PROGRESUS Group a.s. zůstává v rukou Zrůst/Foral), může spadat pod **"sale of material assets"** klauzuli.

**Pokud je v emisních podmínkách klauzule "sale of material assets" definovaná jako > 25 % nebo > 50 % rozvahy** ručitele, transakce **téměř jistě** spouští CoC. Důkaz: Nový Zeleneč developers project má GDV 37,5 mld. CZK. Ručitel PROGRESUS Group a.s. má konsolidovanou rozvahu (FY24) v řádu několika miliard CZK. Tedy NZ projekt **je materiální** v každé rozumné metodě měření.

**Proto**: pre-consent solicitation **není opce, je nutnost**. Otázka není "zda" ale "jak" a "kdy".

### III.4 Mapa scénářů per emitent (predicted, requires validation)

| Emitent | Riziko consent failure | Důvod | Mitigace |
|---------|------------------------|-------|----------|
| 1 (RD Rýmařov Invest Develop) | Střední | Nejstarší a největší prospekt; rozprostřená báze; FY21-23 retroaktivně podány = signál neopacity. | Lead s touto sérií jako "vzorem"; pokud konsent zde, ostatní následují. |
| 2 (PROGRESUS RD Rýmařov a.s.) | **Vysoké** | NIKDY žádná ÚZ od 2022. Investoři budou spravedlivě skeptičtí. | Paralelně s consent dodat FY22-24 reissue. **Zásadní podmínka**. |
| 3 (PROGRESUS RD Rýmařov II) | **Vysoké** | NIKDY žádná ÚZ od 2023. | Stejný princip — issue ÚZ. |
| 4 (PROGRESUS RD Rýmařov III) | Střední-vysoké | NIKDY žádná ÚZ + nejmladší (2024). | Issue ÚZ + nabídka opt-in early redemption za atraktivních podmínek. |
| 5 (PROGRESUS RD Rýmařov IV) | **Velmi vysoké** | Dluhopisy umístěny únor 2026 — **PO** zahájení transakčních jednání. Investoři mohou tvrdit, že prospekt měl disclosurovat plánovanou transakci. **Riziko prospektusové žaloby.** | **Pravděpodobně neudělitelný consent** — připravit Scénář B (par redemption) jako default cestu; zvážit, zda PPF bude tolerovat refinance ~250-400 mil. této série z transakční rezervy. |

### III.5 Specifický red flag k 5. emitentu

Z RED-FLAGS.md RF-28 a sbirka-listin-audit.md §6: **prospekt #5 (RD Rýmařov IV) byl schválen ČNB 2026-01-28**, tedy **PO tom, co byla transakce s PPF dle session intel na stole**. Umístění čerstvých dluhopisů během aktivních M&A jednání o podkladovém aktivu může být napadnutelné jako:
- Misrepresentation podle §23 ZPKT (zákon o podnikání na kapitálovém trhu)
- Insider trading podle §126 ZPKT
- Občanskoprávní žaloba na náhradu škody, pokud investoři tvrdí, že by neinvestovali, kdyby věděli o plánované změně podstatných aktiv

**Mitigace**: prospekt #5 se v consent solicitation **odděluje** od prospektů #1-4. Pro #5 nabídnout **default Scénář B** (full par redemption + accrued interest + voluntary 0,5 % "regret" premium), aby se eliminovala expozice.

---

## IV. Top 10 Institutional Holders — Hypothesis

### IV.1 Methodologická poznámka

⚠️ **DŮLEŽITÉ**: V této session **nemáme přístup k authoritative bondholder registry** (CSD = Centrální depozitář cenných papírů). Žádný z dostupných souborů v `cases/DD-Progresus-PPF-2026-04-21/` neobsahuje konkrétní jména držitelů Progresus dluhopisů.

**Tato sekce je hypothesis** vystavená na třech vstupech:
1. Profil typického českého retailového/mid-market dluhopisu schváleného ČNB.
2. Veřejně známá distribuce AUM mezi českými asset managery (vlastní průzkum AKAT.cz a annual reports).
3. Empirická pravidla typu "kdo investuje do CZ developer junk-rated bonds 8-10 % yield".

**Pro skutečnou exekuci**: krok 1 v Action Plan = vyžádat si od Centrálního depozitáře cenných papírů (CDCP, dříve CDP) **List of Bondholders per ISIN** přes oficiální disclosure request (typicky platit poplatek 1500-3000 CZK per ISIN × 68 tranší = ~150 tis. CZK). Toto právo má emitent automaticky. **Bez tohoto seznamu je každá strategie targetingu spekulace.**

### IV.2 Hypothesis Top 10 institucionálních držitelů (české segmentace)

Per Czech bond market structure (~CZK 200 mld. AUM v korporátních dluhopisech napříč hlavními IM houses), pravděpodobní držitelé jsou:

| # | IM | Typický AUM v CZ corp bonds | Pravděpodobná % alokace v Progresus | Decision-maker level | Strategický kontakt |
|---|------|---------------------|--------------------------|----------------------|---------------------|
| 1 | **ČSOB Asset Management** | ~50-60 mld. CZK | 0,5-1 % AUM = 250-600 mil. | Head of Fixed Income → CIO | **Soft-sounding kanál**: bývalý PPF kontakt přes ČSOB historickou expozici (Kellner-PPF banking) |
| 2 | **Raiffeisen Investiční společnost** | ~15-20 mld. CZK | 1-2 % = 150-400 mil. | Head of Credit Research → Portfolio Manager | Direct cold call |
| 3 | **Generali Investments CEE** | ~15-25 mld. CZK | 0,5-1 % = 75-250 mil. | Senior PM CEE Bonds → Head of Active Strategies | Skrze Generali brokerage relationship |
| 4 | **Erste Asset Management** | ~30-40 mld. CZK (CZ tranche) | 0,3-0,7 % = 100-280 mil. | Czech CIO → Group Head FI Vienna | Bilateral; sensitive to media noise |
| 5 | **KBC Asset Management (CSOB AM sister)** | ~20-30 mld. CZK | 0,5 % = 100-150 mil. | KBC ČR fund manager | Coordinated with #1 |
| 6 | **J&T Investiční společnost** | ~10-15 mld. CZK | 1-3 % = 100-450 mil. | Head of Credit | **Vysoce pravděpodobný držitel** — J&T historicky kupuje CZ developer paper |
| 7 | **Conseq Investment Management** | ~10-15 mld. CZK | 1-2 % = 100-300 mil. | CIO Conseq | Direct |
| 8 | **Amundi Czech Republic AM** | ~25-35 mld. CZK | 0,3-0,5 % = 75-175 mil. | Head of CEE Fixed Income | EU passport tranches likely held in Lux SICAV — bilateral skrze Lux |
| 9 | **AXA Investment Managers (CZ branch / divested ČS)** | ~10-15 mld. CZK | 0,5 % = 50-75 mil. | Local PM → Paris HQ | Lower priority |
| 10 | **Pioneer Investments CZ (now part of Amundi)** | merged into #8 | — | — | — |

**Náhrada #10**: **PARTNERS investiční společnost** nebo **ČP Invest** (10-15 mld. CZK CZ corp; likely 0,5 % = 50-75 mil.).

**Souhrn**: 9-10 IM houses představují kombinovaný předpokládaný hold **1,1-2,8 mld. CZK** = **35-90 % předpokládaného outstanding 2-3 mld. CZK**. Realistický mid-case: **kombinovaný institucionální hold ~50-60 % outstanding**, retail/wealth advisor zbytek.

### IV.3 Decision-maker mapping per IM

**Pravidla pro každého z Top 10**:

- **Decision authority**: Head of Credit Research nebo CIO Fixed Income, podle velikosti pozice.
  - Pozice < 100 mil. CZK → Senior PM rozhoduje (delegated authority).
  - Pozice 100-300 mil. CZK → Head of FI rozhoduje, ale eskaluje na CIO.
  - Pozice > 300 mil. CZK → CIO + Investment Committee.
- **Information sensitivity**: vysoká. Bondholder soft sounding **musí** být pod individual NDA. Standardní text: "We are exploring a corporate transaction that may trigger CoC clauses. We seek your view on potential consent terms before formal solicitation."
- **Speed of response**: typicky 5-10 BD pro initial reaction, 15-20 BD pro committee review. **Plánovat T-8 týdnů jako minimum.**
- **Coordination risk**: institucionální holdeři **mezi sebou komunikují** — head trading desks, IRR (informal road shows). Předpokládat, že do 3 BD od první soft sounding **všech 10 ví, že solicitation je v přípravě**. Tedy: spustit u všech 10 najednou (par tracking), nikoli postupně.

### IV.4 Retail / wealth advisor segment (zbylých 50 % outstanding)

Tento segment **nelze** individualizovat. Strategie:
- Komunikovat skrze **mass-market kanály**: dluhopisar.cz aktualizace, emitent webové stránky pravidelné updaty, tištěné dopisy na všech držitelů z CDCP listu.
- Identifikovat **Top 5 wealth advisorů** (Conseq Wealth, J&T Banka private, Komerční banka private, ČSOB private, Raiffeisenbank private) — tito často držií dluhopisy v aggregated client mandates a mohou hlasovat jménem klientů, **pokud mají proxy autoritu**. Bez proxy = každý klient hlasuje individuálně = nákladný.
- **Cílová consent rate v retailovém segmentu**: 60-75 % je realistická maximum bez agresivního advisor outreach. Zbytek jde přes **opt-in early redemption** (Scénář B).

### IV.5 Critical advisor/intermediary stack

Před každou IM call si **prodávající** musí potvrdit:
1. Kdo je **trustee / společný zástupce** per série (může být formálně jmenován v emisních podmínkách, často není = je nutné jmenovat ad-hoc per § 21 ZD).
2. Kdo je **administrátor emise** (typicky CSOB, KB, RB nebo specializovaný subjekt).
3. Kdo je **paying agent** = entita zajišťující výplatu kupónu a jistiny.

Tito intermediáři jsou **prvním přechodovým bodem** komunikace — IR týmy IM houses kontaktují trustee/administrátora dříve, než reagují na solicitation.

---

## V. Sequencing Strategy

### V.1 Tříletková strategie (T-8 → T+0 closing)

#### **Fáze 1 — Soft sounding (T-8 až T-5 weeks)**

**Cíl**: Validovat consent appetite top 10 institucionálních držitelů **bez** formálního launch a bez prolomení confidentiality.

**Aktivity**:
- T-8: stáhnout authoritative bondholder list z CDCP per ISIN. Confirmovat top 10 institucionálních pozic.
- T-7: připravit **pre-launch briefing pack** pod NDA: (a) krátký narrativ transakce no-name basis; (b) financial highlights ručitele PROGRESUS Group a.s. FY2024 konsolidovaná; (c) draft consent terms (proposed fee, mechanism, timeline); (d) reference k 5 prospektům + indikativní CoC matrix.
- T-7 až T-5: bilateral calls s 10 IM houses (jeden call per house, 30-45 min). Účast: prodávající (Lukáš Zrůst), externí PR/IR poradce, externí dluhopisový právní zástupce.
- T-5: **Soft sounding rapport** — interní: pozice each holder, indikativní YES/NO/CONDITIONAL, požadované úpravy.

**Důležité**: V soft sounding fázi **neidentifikujeme PPF** jako kupujícího. Nejvýše zmínit "strategický český investor s vyšší kreditní kvalitou než ručitel" (true a uklidňující — PPF má AAA-/AA+ profil v české praxi).

**Output Fáze 1**:
- Mapa institucionálních pozic (potvrzená).
- Indikativní výsledek hlasování (Yes/No/Conditional per emitent).
- Refined consent terms (přesný fee, mechanismus, timeline).
- **Go/No-go decision**: pokud > 50 % institucionálních hodlatelů indicates "Yes" or "Conditional" → pokračovat k Fázi 2. Pokud < 50 % → restrukturalizovat transakci (carve-out NZ z prodávací perimeteru, alternativní strategie).

#### **Fáze 2 — Formal solicitation (T-5 až T-1 weeks)**

**Cíl**: Spustit oficiální consent process napříč 5 emitenty paralelně, dosáhnout kvalifikované většiny pro waiver / amendment.

**Aktivity**:
- T-5: **launch day**. Email all bondholders (institucionální + retail per CDCP list) s formal solicitation letter (per BONDHOLDER-CONSENT-SOLICITATION.md template) + consent form + draft amendment per série.
- T-5: simultánní filing s ČNB (Předběžné oznámení / disclosure dle § 122 ZPKT, pokud aplikovatelné). **Nepublikovat tiskovou zprávu**, držet média dark.
- T-5: zveřejnění consent solicitation na emitent webech + dluhopisar.cz (compliance s typickou prospektovou disclosure obligation).
- T-5 až T-3: **Q&A session** přes datovou místnost (DR-BOND-* per MASTER-DD-REPORT §11.4). Setup individual NDA flow s každým institucionálním IM, který má dotazy.
- T-3: **Schůzka vlastníků dluhopisů** kdekoli, kde písemné usnesení nedosahuje quora — typicky série #2, #3, #5 (vysoká retail báze).
- T-2: vyhodnocení interim výsledků. Pokud some série mají gap, **eskalovat** přes wealth advisorů, individual phone calls, případně outreach na neúčastníky.
- T-1: **finální declaration** výsledků per série. Per emitent buď:
  - **Consent achieved** ≥ kvalifikované většiny → amendment se podepisuje při SPA closing.
  - **Consent failed** → automaticky aktivovat Scénář B (par redemption) pro non-consenters; amendment se přijímá pouze pokud total consenting > 50 %.

**Output Fáze 2**:
- Per-emitent consent rate documentation.
- Signed consent agreements / amendments (preserved in DR-BOND-005).
- Expected payout schedule (consent fee + Scénář B redemption).

#### **Fáze 3 — Holdouts cleanup (T-1 → T+0 a T+0 → T+30)**

**Cíl**: Vypořádat zbylé non-consenting tranše bez deal disruption.

**Aktivity**:
- T-1: hand-off seznam non-consenters → administrátor emise → naplánovat opt-in Scénář B (par + accrued + voluntary 0,25 % "regret" premium pokud byly v původní solicitation kontraktovány).
- T-0 (closing): paying agent vyplatí Scénář B refundee z transakční rezervy / PPF break-money escrow (pre-funded při SPA signing).
- T+0 (closing): per-emitent consent amendments registrovány u ČNB (non-prospectus event ale nutná disclosure dle § 124 ZPKT).
- T+30: závěrečný report investorům (paid + redeemed), uzavření solicitation cyklu.

### V.2 Critical path — kdo musí říct YES first

**Sekvence YES**:

1. **#1 Lukáš Zrůst (interní)** — souhlas s celou strategií + budgetem (consent fee + redemption refinance funds). Předmnožina celé činnosti.
2. **#1 ČSOB AM nebo #6 J&T IS** (whoever first commits) — **kotevní investor**, jejichž YES otevírá důvěru u ostatních. Tito dva jsou hypotézou největší držitelé a nejlépe institucionálně řízení. Jejich YES = signál celému trhu, že consent je rozumný.
3. **2-3 z Top 5 IM** — kritická masa pro institucionální segment. Po těchto YES je pravděpodobné, že retail follow.
4. **Wealth advisorů s proxy** — Conseq Wealth, J&T private — pokud signal positive, retail proxy hlasy přijdou.
5. **Retail mass** — auto-follow pokud institucionálové YES + reasonable fee.

### V.3 Critical path — kdo může říct NO a zablokovat

- **Quasi-aktivistický wealth advisor** kombinovaný s **proveritele.cz** komentátorem: pokud někdo z těchto kruhů publikuje veřejně komentář kritikující terms → retailová baseline panicky odmítá → série #5 (RD Rýmařov IV, fragile) selhává.
- **Cross-default mezi sériemi** by mohl propagovat blokaci série #5 do ostatních. Mitigace = v consent letter explicit carve-out.
- **PPF** přitom **nemůže říct NO** efektivně — pokud PPF spadne z transakce, celá solicitation je obsoletní. Ale PPF **může vetovat** specifické consent terms (např. "consent fee > 75 bps není akceptovatelné z naší strany budgetově"). Tedy: solicitation terms musí být **pre-agreed s PPF** v rámci SPA negotiation, nikoli unilaterally announced.

### V.4 Concurrency model — pět emitentů paralelně

**Zákonné odůvodnění**: § 21 ZD, každá emise je samostatná entita s vlastní bázou vlastníků. **Nelze sjednotit do single resolution.**

**Praktický přístup**:
- Společný external legal counsel (1 firma, 5 dedicated leads per série).
- Společný PR/IR coordinator (jeden brand, jednotný narrativ).
- **Per-emitent**: vlastní solicitation letter (mírně customizovaný per ISIN/série), vlastní consent form, vlastní hlasovací proces.
- **Společné**: data room (DR-BOND-001 až 006), Q&A protocol, consent fee economics, master timeline.

**Risk**: pokud jednu sérii zpožďuje, **nelze podepsat amendment** u žádné série, aniž by amendment had carve-out pro non-effective sériy. Toto je **negotiable** s institucionálními držiteli, ale **rizikové** s retail bází (retail rozumí "spravedlnosti" — pokud jedna série je horší zacházena, ostatní se naštvou).

### V.5 Timeline summary (4-week minimum, 12-week comfortable)

| Týden | Aktivita | Output |
|-------|----------|--------|
| T-8 | CDCP list, prospekty review, soft sounding launch | Bondholder map; consent terms draft |
| T-7 | Bilateral calls (5 IM houses) | Initial appetite |
| T-6 | Bilateral calls (5 IM houses) + finalize terms | Refined consent terms; PR/IR plan |
| T-5 | **Formal launch** + Q&A | Solicitation letters out; Q&A active |
| T-4 | Continued outreach | Mid-progress (target: 30 % consent registered) |
| T-3 | Bondholder meetings (per série, kde nutné) | Quorum-meeting per série |
| T-2 | Vyhodnocení interim výsledků | Go/no-go per série |
| T-1 | Finální declaration | Per-emitent consent rate + amendment ready |
| T-0 | **SPA closing** + amendments executed | Closing + paid out |
| T+30 | Cleanup, holdout redemption | Final reporting |

---

## VI. Consent Pricing

### VI.1 Industry standard tiers

Český bondholder consent market (last 5 years observable transactions: ČD bond restructuring 2021, EPH/EP Power refinancing 2022, CPI Hospitality bond modifications 2023):

| Consent transaction profile | Typical fee (bps of nominal) |
|------------------------------|------------------------------|
| Routine technical waiver, no covenant change | 10-25 bps |
| Material change (transaction-related) but neutral economics | 25-50 bps |
| Material economic change (e.g., guarantor change) | 50-100 bps |
| Distressed waiver (financial stress signal) | 100-300 bps + |

**Progresus profile**: change of control + sale of material assets (NZ) + multi-emitent coordination + opacity legacy (RF-3, RF-27 pozdní ÚZ) **= mid range, 50-75 bps**, **NIKOLI** distressed range.

### VI.2 Doporučená tier structure

| Tier | Consent fee | Rationale |
|------|-------------|-----------|
| **Early-bird (first 5 BD of solicitation)** | **75 bps** of nominal | Premium za rychlost; signal good behavior |
| **Standard (within solicitation window)** | **50 bps** of nominal | Industry standard middle |
| **Late but still consenting (15+ BD)** | **25 bps** of nominal | Penalty za delay |
| **Holdout, opt-in Scénář B redemption** | **par + accrued, no fee** | Standard exit |

### VI.3 Aggregate budget calculation

**Předpokládaný outstanding**: 2,5 mld. CZK midcase.

Při míchaném mix (50 % early-bird, 30 % standard, 15 % late, 5 % redemption):
- Early-bird: 50 % × 2,5 mld. × 75 bps = **9,4 mil. CZK**
- Standard: 30 % × 2,5 mld. × 50 bps = **3,8 mil. CZK**
- Late: 15 % × 2,5 mld. × 25 bps = **0,9 mil. CZK**
- Redemption: 5 % × 2,5 mld. = 125 mil. CZK out-of-pocket (financovaný z transakční rezervy nebo bridge)
- **Consent fees total**: ~14 mil. CZK
- **Redemption funds total**: ~125 mil. CZK

**Worst-case** (60 % redemption / 40 % consent at 100 bps):
- Consent fees: 40 % × 2,5 mld. × 100 bps = 10 mil. CZK
- Redemption: 60 % × 2,5 mld. = **1,5 mld. CZK out-of-pocket**

→ **Bridge financing** for worst case: nutné mít pre-arranged 1,5 mld. CZK overdraft / repo / ČSOB bridge facility **před** solicitation launch. Pokud PPF break-money escrow obsahuje tuto částku, je to ideal. Pokud ne, prodávající musí financovat sám.

### VI.4 Per-jurisdiction nuance (CZ vs LUX)

Pokud některé eurové tranše jsou listed v Luxembourg (LSE), aplikuje se Lux Bond Documentation Style — typicky:
- Quorum přísnější (75 % outstanding namísto 66 % CZ).
- Consent agent musí být LUX-licensed (Citibank Lux, BNY Mellon Lux).
- Documentation v angličtině, paralelní český překlad.

**Akce**: identify LUX-listed ISINs (likely 1-2 EUR tranches per emitent) a pre-engage Lux counsel (Loyens & Loeff, Allen & Overy Lux, NautaDutilh) v T-8 fázi.

### VI.5 PPF involvement v pricing

**Otázka pro SPA negotiation**: kdo platí consent fees?

- **Variant A — Seller pays**: cleaner, ale snižuje seller net proceeds o ~0,5-1 % transaction value.
- **Variant B — Buyer pays**: PPF přebírá náklad, ale nemá příliš důvod, pokud nejsou bondy součástí akvizice (nejsou — Progresus si je drží).
- **Variant C — Shared 50/50**: nejjednodušší.
- **Variant D — Escrow funded at signing, costs deducted from purchase price**: nejtransparentnější. **DOPORUČENO**.

**Variant D** rationale: PPF eskrouje "consent reserve" 75 mil. CZK (3 % předpokládaného outstanding) při SPA signing; čerpá se na consent fees + redemption shortfall v Scénáři B; přebytek se vrací sellerovi po T+30; nedostatek financuje seller. Tato varianta odpovídá guidance v MASTER-DD-REPORT §9.5: "Bondholder CoC consent shortfall: 5 % na 18 měsíců".

---

## VII. Risk Scenarios

### VII.1 Best Case — 95+ % consent, no fee bump, closing on time

**Předpoklady**:
- Top 5 institucionál solidly consenting (kombinovaný hold ~50 % outstanding).
- Retail follow (auto-effect po institucionálu).
- Žádný materiální mediální incident.
- Žádné soudní napadení.

**Outcome**:
- Per-emitent consent rate 90-98 %.
- Consent fee budget ~12-15 mil. CZK (50-60 bps blended).
- Holdout redemption ~50-150 mil. CZK.
- Closing on time (no delay).
- Reputační dopad: žádný negativní; signal "professional execution".

**Probability**: ~25-30 %, podmíněno tím, že disclosure deficit ÚZ se vyřeší v paralelním stintingu (pokud se nevyřeší, viz Mid Case).

### VII.2 Mid Case — 75-90 % consent, holdouts trigger put, refinance ~1 mld. CZK

**Předpoklady**:
- Top 3-4 institucionál consenting; 1-2 nebo conditional.
- Retail mixed; 60-70 % consent.
- 1-2 série mají gap pod kvalifikovanou většinu.
- Holdouts opt-in Scénář B (early redemption) ve velkém objemu (~30 % outstanding = 750 mil. CZK).

**Outcome**:
- Per-emitent consent rate 70-85 %.
- Consent fee budget ~18-25 mil. CZK (75-100 bps blended).
- Holdout redemption ~750 mil. - 1 mld. CZK.
- **Bridge financing required**: 1 mld. CZK na 12-18 měsíců do refinance bankovním dluhem (banking syndicate ČSOB/Komerční, ~5 % p.a. = 50 mil. CZK roční náklad → 150 mil. nákupní cena z titulu refinance).
- Closing může být zpožděn 2-4 týdny pokud bridge není pre-arranged.
- Reputační dopad: lokální, Hospodářské noviny krátká zmínka, žádné virální reportáže.

**Probability**: ~50-55 %.

### VII.3 Worst Case — < 75 % consent, deal at risk, fall back to alternative buyers

**Předpoklady**:
- Materiální překvapení v DD (např. DANCORE eskaluje, RF-26).
- Mediální exploze (proveritele.cz nebo newstream.cz vyhrabou solicitation a interpretují negativně).
- Top 2-3 institucionál say NO (např. ČSOB AM compliance issue). Kaskádový efekt na retail.
- Per-emitent consent rate < 60 % minimálně u 2 sérií.
- Cross-default risk reálný.

**Outcome**:
- PPF má **legální právo odstoupit** podle SPA podmínek (typicky CP fail = no closing).
- PPF nabídne renegociaci (down-pricing 10-15 %, větší escrow, delayed closing).
- Alternativně: **PPF odstoupí** a transakce capituluje; prodávající je ponechán s nesignalisovaným exitem a poškozenou reputací.
- **Fallback strategie**:
  - **CPI Group** (známá realitní akviziční appetite v ČR): hypotetický B-buyer s nižší nabídkou (4-4,5 mld. CZK) ale vyšší tolerancí pro covenant complexity.
  - **Penta Investments**: ditto.
  - **Crestyl Group**: domácí real estate; pravděpodobně bid 3,5-4 mld. CZK ale faster execution.
  - **Crestyl + JV s Wood & Co (PE)**: 4-5 mld. CZK; complex deal structure.
- **Ostatní fallbacky**:
  - Spinout NZ projektu jako separate ListingCo (Prime Cz) — hodnota 5-7 mld. CZK ale 18-24 měsíce horizon.
  - Hold + bond refinance — purify balance, then re-launch sale 24 měsíců later.

**Probability**: ~15-25 %, **horší** pokud nedělá pre-DD remediation sprint per MASTER-DD-REPORT §1.

### VII.4 Black Swan — ČNB enforcement action

**Scénář**: ČNB iniciuje vyšetřování série #5 (RD Rýmařov IV) podle § 23 nebo § 126 ZPKT (insider trading / misrepresentation) na základě časového odstupu (prospekt schválený 2026-01-28 vs. M&A jednání).

**Outcome**:
- Solicitation **zastavená** ze zákona (nelze dokončit consent během enforcement vyšetřování).
- Transakce odložena 6-18 měsíců.
- Reputační dopad: vážný; investoři ztratí důvěru, **veškeré budoucí emise zablokovány**.
- Penalizace ČNB: 1-50 mil. CZK (statutory range § 145 ZPKT).

**Probability**: ~5-10 %.

**Mitigace**:
- Pre-emptive notification to ČNB at T-8 ("we are engaging in routine bondholder communication regarding a potential transaction; we believe Series #5 disclosure was compliant; happy to provide supporting documentation").
- Engage external legal counsel s předchozí ČNB regulatory experience (Havel & Partners, White & Case, Allen & Overy).
- Voluntary self-disclosure ČNB pokud existuje **jakákoli** pochybnost o §23 compliance.

### VII.5 Decision tree visualization

```
Soft Sounding (T-8 to T-5)
├─ Top 5 institucionál Yes >= 50 % AUM → Pokračovat formal launch (P=70 %)
│   ├─ Formal solicit Yes >= 75 % per série → Best/Mid Case (P=50 %)
│   └─ Formal solicit Yes < 75 % some série → Mid Case + Scénář B refi (P=45 %)
├─ Top 5 institucionál Yes 30-50 % AUM → Renegociovat terms; T-8 → T-4 sliplo (P=20 %)
│   ├─ Refit terms 75 → 100 bps + carve-out → Mid Case (P=15 %)
│   └─ Holdouts dominují → Worst Case + alternative buyer (P=5 %)
└─ Top 5 institucionál Yes < 30 % AUM → Worst Case immediate (P=10 %)
    ├─ PPF renegotiate, lower price, longer closing → Closing 6-12 měsíců (P=7 %)
    └─ PPF withdraws → Crestyl/CPI/Penta sondování (P=3 %)
```

---

## VIII. Communication Templates

Existující template je `08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md` — formální solicitation letter (per emise) v české + zkrácené verzi + consent form.

Tento memo doplňuje **3 nové templaty**:

### VIII.1 (a) Soft-sounding email (T-8 až T-5)

**Recipient**: Head of Fixed Income / CIO / Senior PM v každém z Top 10 IM

```
Předmět: Důvěrné — Předběžná konzultace ohledně potenciální transakce / dluhopisy [emise]

Vážený [jméno],

obrácím se na Vás důvěrně jménem PROGRESUS Group ohledně transakce, která je v pokročilé fázi přípravy a která by mohla aktivovat ustanovení o změně ovládání v emisních podmínkách Vámi držených dluhopisů.

Před formálním zahájením žádosti o souhlas (předpokládáme T+3 týdny) bychom rádi vyslechli Váš pohled na:

1. Vaši aktuální pozici v emisích PROGRESUS / RD Rýmařov (per ISIN, pokud souhlasíte s předáním pod individual NDA);
2. Materiální podmínky, za kterých byste byli ochotni udělit souhlas (zejména kovenanty, fee, mechanika);
3. Operativní procedury Vašeho IM (decision authority level pro consent, typický review timeline, požadavky na materiál);
4. Komunikační preferred channels (písemný proces vs. schůzka).

Na call (30-45 min) jsme připraveni odpovídat na konkrétní otázky a sdílet:
- Souhrn transakce (no-name basis pro kupujícího; profil "strategický český investor s vyšší kreditní kvalitou než ručitel");
- Předběžné consent terms (proposed fee, mechanism, timeline);
- Reference k 5 prospektům + indikativní CoC matrix.

Veškeré sdílené informace jsou STRICTLY CONFIDENTIAL pod individual NDA, kterou Vám zašleme předem.

Děkuji za Vaši pozornost. K dispozici jsem flexibilně mezi [datum 1] a [datum 2] pro 30-45min call.

S úctou,

[Lukáš Zrůst]
PROGRESUS Group a.s.
[telefon] | [e-mail]
```

**Key principles**:
- **No-name basis**: Nikdy neidentifikujeme PPF přímo. "Strategic Czech investor with higher credit profile than the guarantor" je dostatečný signal.
- **Individual NDA**: každý IM má vlastní NDA, žádné společné NDAs (zabraňuje horizontal information sharing).
- **No commitment**: solicitation **není** ani návrh ani agreement; je to consultation.
- **Time pressure**: implicit (T+3 weeks), explicit "flexible".

### VIII.2 (b) Q&A FAQ pro advisorů a fyzické osoby

```
PROGRESUS Group — Často kladené otázky k aktuální change-of-control žádosti o souhlas

Verze: [datum] | Pro distribuci: bondholders, advisors, IR contacts

---

Q1: Co se přesně mění?
A: PROGRESUS Group plánuje strategickou transakci (prodej greenfield projektu Nový Zeleneč). Tato transakce technicky aktivuje ustanovení o změně ovládání ve Vámi držených dluhopisech, ale ekonomika dluhopisu (kupon, splatnost, ručitel) se NEMĚNÍ.

Q2: Kdo je kupující?
A: Strategický český investor s vyšším kreditním profilem než ručitel PROGRESUS Group a.s. Identita kupujícího bude oznámena při formálním podpisu kupní smlouvy. Výnos z transakce bude směřován na posílení likvidity skupiny.

Q3: Kdo je ručitel mého dluhopisu?
A: PROGRESUS Group a.s. (IČO 10978216). Ručitel se NEMĚNÍ.

Q4: Mění se kupon / splatnost?
A: NE. Žádná změna ekonomických parametrů.

Q5: Jaký je consent fee?
A: 0,5 % nominální hodnoty Vašich dluhopisů (tj. 5 000 CZK z 1 000 000 CZK nominálu). Volitelný; vyplácí se podmíněně udělením souhlasu v termínu. **Bonusový poplatek 0,75 %** pro souhlas v prvních 5 pracovních dnech.

Q6: Co když nesouhlasím?
A: Máte tři možnosti: (1) udělit souhlas a získat fee; (2) odmítnout souhlas a být ponechán beze změny (pokud kvalifikovaná většina nesouhlasí, transakce nebude provedena); (3) zvolit Scénář B = předčasné splacení Vašich dluhopisů za nominální hodnotu + alikvotní úrok ke dni closing transakce, bez fee, ale rychlý exit. Detaily ve formálním solicitation letter.

Q7: Jaký je timeline?
A: Formální žádost odeslaná [datum]. Termín pro odpověď [datum + 15 BD elektronicky / +20 BD fyzicky]. Vyhlášení výsledku [datum + 22 BD]. Closing transakce [datum + 4-8 týdnů po vyhlášení].

Q8: Které emise jsou zahrnuty?
A: Všech pět prospektů schválených ČNB:
- RD Rýmařov Invest Develop a.s. (2021 prospekt)
- PROGRESUS RD Rýmařov a.s. (2022 prospekt)
- PROGRESUS RD Rýmařov II a.s. (2023 prospekt)
- PROGRESUS RD Rýmařov III a.s. (2024 prospekt)
- PROGRESUS RD Rýmařov IV a.s. (2026 prospekt)

Souhlas se získává paralelně, ale per emise samostatně. Můžete souhlasit s některými emisemi a nesouhlasit s jinými, pokud držíte více ISINů.

Q9: Co když jsem retailový investor a chci si nechat poradit?
A: Doporučujeme konzultaci s Vaším finančním poradcem nebo bankou. K dispozici je také call-center [telefon] a e-mail [adresa] pro obecné dotazy. Nicméně **konkrétní investiční rozhodnutí činíte sami**.

Q10: Mohu prodat své dluhopisy během solicitation?
A: ANO. Sekundární trh (BCPP, OTC) zůstává otevřený. Prodávající dluhopisu po datu announcement může mít omezené arbitrage opportunity — váš profit z prodeje na sekundárním trhu vs. consent fee + nominal × discount za risk je individuální propočet.

Q11: Je to risk pro investory?
A: Naše předpokládaná analýza je **NE**. Ekonomika Vašeho dluhopisu se nemění, ručitel se nemění, transakce posiluje likviditu skupiny. Pokud máte specifické pochybnosti, doporučujeme prostudovat ČNB-schválené prospekty (dostupné na ČNB CRR) a/nebo se obrátit na finančního poradce.

Q12: Mohu klást další otázky?
A: ANO. Datová místnost s relevantními dokumenty: [URL]. Approval: po podpisu individuální NDA.
   E-mail: [adresa]
   Telefon: [telefon]
```

### VIII.3 (c) Holdout escalation letter (T-2 týdny, last-week pre-closing)

```
Vážený vlastníku dluhopisů,

obracíme se na Vás v souvislosti s žádostí o souhlas se změnou ovládání odeslanou dne [datum původního letteru]. Naše záznamy ukazují, že jsme od Vás dosud nepřijali odpověď.

Stav žádosti:
- Sériový souhlas: [X %] outstanding nominal v pětici dluhopisů.
- Termín udělení souhlasu: [datum, T-X pracovních dnů].
- Pokud zůstanete bez odpovědi: vstupují v platnost ustanovení Scénáře B (předčasné splacení za nominální hodnotu + alikvótní úrok ke dni [closing date]).

Co je třeba udělat:
1. Pokud chcete udělit souhlas a obdržet fee (0,5 %), prosíme o odeslání formuláře souhlasu obratem na [e-mail / adresa].
2. Pokud nechcete souhlasit a preferujete předčasné splacení, prosíme o odeslání formuláře Scénář B.
3. Pokud chcete diskutovat detaily, prosíme o telefonní call do [datum], [tel].

Po termínu **[datum + 5 BD]** budou vaše dluhopisy automaticky přesunuty do Scénáře B (předčasné splacení) bez ohledu na další kroky.

Děkujeme za Vaši pozornost.

[Lukáš Zrůst]
PROGRESUS Group a.s.
[kontakt]
```

### VIII.4 Reference na existing template

Plný formal solicitation letter je v `08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md`.

Tento dokument se **nemění** — je referenčním standardem. Tato strategie přidává:
- (a) soft-sounding email pre-launch;
- (b) FAQ retail-friendly Q&A;
- (c) holdout escalation letter post-deadline.

Společně tvoří kompletní komunikační stack solicitation cyklu.

---

## IX. Action Plan

### IX.1 Hlavní harmonogram (T-8 → T+30)

| Týden | Datum (předpoklad SPA = 2026-08-03) | Aktivita | Vlastník | Output |
|-------|--------------------------------------|----------|----------|--------|
| **T-8** | 2026-06-08 | CDCP request bondholder list | Zrůst + IR | Authoritative bondholder map per ISIN |
| **T-8** | 2026-06-08 | Prospekt downloads × 5 + CoC matrix | Legal counsel | CoC inventory matrix |
| **T-8** | 2026-06-08 | Pre-emptive ČNB notification | Compliance | ČNB acknowledgment |
| **T-7** | 2026-06-15 | Bilateral calls Top 5 IM | Zrůst + IR + legal | Initial appetite |
| **T-6** | 2026-06-22 | Bilateral calls Top 6-10 IM | Zrůst + IR + legal | Refined consent terms |
| **T-6** | 2026-06-22 | Pre-arrange bridge facility 1,5 mld. | CFO PROGRESUS | Bridge term sheet |
| **T-5** | 2026-06-29 | **Formal launch** + ČNB filing | Zrůst | All bondholders contacted |
| **T-5** | 2026-06-29 | Q&A datová místnost otevřena | IR | DR-BOND-001 to 006 live |
| **T-4** | 2026-07-06 | Tracking + outreach push | IR + administrátor | Mid-progress report |
| **T-3** | 2026-07-13 | Bondholder meetings (per série) | Společný zástupce + Zrůst | Quorum-meeting per série |
| **T-2** | 2026-07-20 | Holdout escalation letter | IR | Final response push |
| **T-1** | 2026-07-27 | Finální declaration výsledků | Zrůst + legal | Per-emitent consent rate; amendment ready |
| **T-0** | 2026-08-03 | **SPA closing** + amendments executed | Zrůst + PPF | Closing |
| **T+30** | 2026-09-03 | Cleanup, redemption payouts | Paying agent | Final reporting |

### IX.2 Workstreams a vlastníci

#### Workstream A — Legal / Compliance
**Vlastník**: External legal counsel (doporučeno: Havel & Partners + Allen & Overy Lux pro EUR tranše)
**Aktivity**:
- T-8: CoC matrix per série; per-jurisdikční legal opinion (CZ vs LUX).
- T-7: Návrh consent letterů + amendments per série.
- T-5: Filing s ČNB; formální launch.
- T-3: Schůzky per série.
- T-1: Final amendment execution package.

#### Workstream B — IR / Communication
**Vlastník**: Zrůst (sponsor) + dedicated IR coordinator (doporučeno: existing PROGRESUS Group IR + Marketing & Brand Solutions externa)
**Aktivity**:
- T-8: Briefing pack pro Top 10 IM.
- T-7 až T-6: Bilateral calls coordination.
- T-5: Mass communication (web, dluhopisar.cz, e-mail, post mail).
- T-5 až T-1: Q&A response, FAQ updates.
- T+30: Final report.

#### Workstream C — Operations / Financial
**Vlastník**: CFO PROGRESUS Group (jméno per registr)
**Aktivity**:
- T-8 až T-6: Pre-arrange bridge facility (1,5 mld. CZK overdraft / repo / banking syndicate).
- T-5: Per-ISIN outstanding confirmation s administrátorem.
- T-1 až T-0: Consent fee + redemption payment processing.

#### Workstream D — Regulatory / ČNB
**Vlastník**: External compliance (Havel & Partners ESM tým)
**Aktivity**:
- T-8: Pre-emptive notification ČNB.
- T-5: Filing per § 122 ZPKT pokud aplikovatelné.
- T-3 až T-1: Real-time monitoring ČNB feedback.

#### Workstream E — PPF Coordination
**Vlastník**: External M&A counsel (per side: Aegis Law / Schoenherr per disclosure)
**Aktivity**:
- T-8: Confirm PPF přijímá Variant D pricing structure (escrow 75 mil. CZK) v draft SPA.
- T-7: PPF interim signoff na consent strategy.
- T-1: PPF closing readiness — break-money escrow funded.

### IX.3 Decision gates

**Gate 1 (T-7, soft sounding completion)**:
- IF Top 5 institucionál NPS Yes ≥ 50 % AUM → **GO** Fáze 2.
- ELSE → **HOLD**, refit terms; if hold > 3 týdny, escalate to PPF a renegotiate transaction structure.

**Gate 2 (T-3, mid-solicitation)**:
- IF aggregate consent rate ≥ 50 % outstanding → **GO** continue to closing.
- ELSE → **PIVOT** to Scénář B aggressive (offer enhanced redemption terms); if pivot fails, prepare PPF deal restructuring.

**Gate 3 (T-1, final declaration)**:
- IF aggregate consent rate ≥ 75 % outstanding AND each série rate ≥ 50 % → **GO** closing.
- ELSE → **PPF DECISION**: closing per renegotiated terms (lower price, larger escrow, delayed CP), or withdraw.

### IX.4 Resource allocation

| Resource | Volume | Cost estimate |
|----------|--------|----------------|
| External legal counsel (CZ) | ~600-800 hours | ~5-7 mil. CZK |
| External legal counsel (LUX) | ~150-250 hours | ~2-3 mil. CZK |
| IR coordinator (externí) | full-time, 12 týdnů | ~0,8 mil. CZK |
| Administrátor / paying agent (consent ops) | per-emise | ~0,3-0,5 mil. CZK per série × 5 = 1,5-2,5 mil. CZK |
| CDCP bondholder list | 68 ISINs × ~2 tis. CZK | ~0,15 mil. CZK |
| Communication / printing / postage retail | ~5-10 tis. retail držitelů × ~50 CZK | ~0,3-0,5 mil. CZK |
| **Total advisory & ops** | | **~10-13 mil. CZK** |
| Consent fees | per VI.3 | **~12-25 mil. CZK** |
| Bridge facility (if mid case) | 1 mld. × 5 % × 1,5 roku | **~75 mil. CZK** |
| Redemption out-of-pocket | per VII | **0-1,5 mld. CZK** |

**Total range**: 22-1 600 mil. CZK podle scénáře. **Mid case ~150-200 mil. CZK celkový impact**.

---

## X. Open Questions for Legal

Tato sekce je seznamem **specifických otázek**, které musí být zodpovězeny externím dluhopisovým právním zástupcem **před** spuštěním Fáze 1 (T-8). Žádná otázka zde uvedená není rétorická — všechny vyžadují pozitivní legal opinion.

### X.1 Cross-default architecture
1. Obsahují emisní podmínky všech 5 sérií **cross-default** klauzuli odkazující se vzájemně?
2. Pokud ano, jaký je threshold (50, 100, 250 mil. CZK)?
3. **Lze cross-default carve-outovat během consent window** (typicky 60-90 dnů)?
4. Pokud nelze, jaký je risk, že failure série #5 acceleruje ostatní 4?

### X.2 ČNB §23a clearance trigger (RF-30)

Z RED-FLAGS.md RF-30: Jirásková (manželka Jirásko) je v PPF banka management; financování PPF banka by spustilo §23a ZoB jako spřízněná strana.

5. **Pokud PPF financuje akvizici z PPF banka úvěru, musí PPF získat §23a ČNB clearance dopis?**
6. Jaký je timeline (typicky 2-4 týdny ČNB review)?
7. Lze §23a clearance získat **paralelně** s bondholder solicitation, nebo musí být první?
8. **Side letter requirement**: musí PPF prodávajícímu přiznat / disclosure §23a status v SPA?

### X.3 § 21 ZD specifika a quorum

9. Co je **kvalifikovaná většina** per emisní podmínky každé z 5 sérií? 50 %, 66 %, 75 %?
10. Lze každou sérii vyřešit **písemným usnesením**, nebo je vyžadována **schůzka vlastníků**?
11. Pokud schůzka, kdo je **společný zástupce** per série? Pokud není jmenován, kdo ho jmenuje (ČNB? prodávající? hlasování bondholderů)?
12. **Quorum per § 21c ZD**: jak vypočítáme přítomnost na schůzce, pokud více ISINů má překrývající bondholders?

### X.4 Prospect modification disclosure

13. Pokud consent vede k **změně emisních podmínek** (typicky modifikace covenant), musí prodávající **přepublikovat prospect addendum** přes ČNB?
14. Trvání ČNB schválení addendum (typicky 30 dnů)?
15. **Risk gateway**: pokud nejsou všech 5 sérií vyřešeno paralelně, je možno dojít ke stavu, kdy 4 série mají amendment platný a 5. série má původní podmínky? Co to znamená pro cross-default?

### X.5 § 23 a § 126 ZPKT (insider trading / misrepresentation, RF k sérii #5)

16. Byly v prospektu série #5 (RD Rýmařov IV, schválen 2026-01-28) **disclosurovány** plánované M&A transakce s PPF?
17. Pokud ne, je to **nesplnění §23 ZPKT prospect disclosure obligations**?
18. Pokud ano, je consent solicitation **legálně zranitelná** — může bondholder argumentovat, že koupil v dobré víře, že CoC trigger nebude aktivován v krátkém období?
19. **Voluntary disclosure path**: pokud existuje pochybnost, lze učinit **voluntary supplement** k prospektu série #5 a tím se chránit před retroaktivním napadením?

### X.6 LUX vs CZ jurisdikce

20. Které z 68 tranší jsou listed v Luxembourg (LSE) vs. pouze CZ?
21. LUX-listed tranše: aplikuje se **Luxembourg Bond Documentation** template (typically stricter quorum 75 %)?
22. **Citibank Lux nebo BNY Mellon Lux** jako consent agent — kdo se preferuje?
23. **Paralelní LUX legal counsel**: Loyens & Loeff, Allen & Overy Lux, NautaDutilh — které doporučuje primary CZ counsel?

### X.7 Trustee jmenování (pokud chybí)

24. Pro každou ze série: je **trustee / společný zástupce** **jmenován** v emisních podmínkách?
25. Pokud není, **proces jmenování** = ad-hoc na schůzce, nebo formální nomination?
26. Identifikační návrh: nezávislý trustee (např. AON Czech, Mazars, BDO) nebo vnitřní řešení (paying agent acting as trustee)?

### X.8 PPF disclosure obligations

27. Po podpisu SPA: musí PPF jako **významný akcionář / strategic investor** v PROGRESUS Group **disclosurovat** akvizici v § 122 ZPKT (significant shareholder disclosure)?
28. Trigger threshold (25 %, 50 %, 75 %)?
29. **Kdy** se trigger spouští — při SPA signing, closing, nebo až ČNB merger clearance?

### X.9 Tax & fee deductibility

30. **Consent fee** — daňově uznatelný náklad u prodávajícího (PROGRESUS Group)?
31. **Redemption shortfall** (Scénář B) — uznatelný jako standard interest expense, nebo capital loss?
32. **Bridge facility cost** — daňová uznatelnost?

### X.10 Side letters & "informal" arrangements

33. **Side letter** s top 3 institucionálními držiteli (preferred terms, např. anti-dilution, future bond placement priority): je legálně přípustný v rámci českého retail bond regulatory framework, nebo to porušuje **equal treatment** princip § 23 ZPKT?
34. **Confidentiality**: lze institucionálního držitele zavázat NDA o consent details vůči ostatním retail bondholderům?
35. **Whistleblower scenario**: pokud by retail bondholder získal informace o side letter, jaké jsou expozice prodávajícího (litigace, ČNB sanction, reputační)?

---

## XI. Apendix A — Decision matrix (per-emitent path)

Pro každou z 5 emitentních sérií se rozhodujeme separátně. Matrix níže ukazuje přístup per kombinaci charakteristik série.

| Série | ÚZ status | Retail/Inst mix odhad | Doporučená cesta | Plán B fallback | Risk score (1-5) |
|-------|-----------|---------------------|------------------|-----------------|-------------------|
| 1 (Invest Develop) | FY21-23 podány retro 2025-03 | 60/40 retail | Lead — best-prepared | Refinance via banking | 2/5 |
| 2 (RD Rýmařov a.s.) | NIKDY | 65/35 retail | **Issue ÚZ FY22-24 paralelně** + standard solicit | Scénář B aggressive | 4/5 |
| 3 (RD Rýmařov II) | NIKDY | 70/30 retail | **Issue ÚZ FY23-24 paralelně** + standard | Scénář B aggressive | 4/5 |
| 4 (RD Rýmařov III) | NIKDY | 70/30 retail | **Issue ÚZ FY24 paralelně** + early-bird premium | Scénář B aggressive | 3/5 |
| 5 (RD Rýmařov IV) | n/a (před první ÚZ) | 75/25 retail | **Default to Scénář B** (par redemption) — neissoluvat consent | Refinance celá série | 5/5 |

**Klíčové rozhodnutí**: Série #5 (RD Rýmařov IV, schválen 2026-01-28) **nedoporučujeme zahrnout** do consent solicitation. Místo toho nabídnout **standardní Scénář B** všem držitelům série #5 — full par redemption + accrued interest + voluntary 0,5 % "regret" premium. Důvod: vystavení § 23 ZPKT (insider trading / misrepresentation) je příliš vysoké, aby ospravedlnilo solicitation cestu. Refinance celkem ~250-400 mil. CZK přes banking syndicate je akceptovatelná.

---

## XII. Apendix B — Glossary

| Pojem | Význam |
|-------|--------|
| **Bondholder solicitation** | Formální proces, kterým emitent žádá vlastníky dluhopisů o souhlas s modifikací emisních podmínek nebo waiverem covenant porušení. |
| **Change of Control (CoC)** | Spouštěč v emisních podmínkách, který se aktivuje při změně kontroly nad emitentem nebo materiálním aktivem ručitele. |
| **Consent fee** | Poplatek vyplácený vlastníkům dluhopisů za udělení souhlasu. Typicky 25-100 bps nominální hodnoty. |
| **Cross-default** | Klauzule, která specifikuje, že porušení v jedné emisi acceleruje ostatní (typicky nad threshold). |
| **CDCP** | Centrální depozitář cenných papírů (CZ); spravuje knihu vlastníků dluhopisů. |
| **ČNB** | Česká národní banka — regulátor dluhopisového trhu (§ 23 a další ZPKT). |
| **§ 21 ZD** | Zákon č. 190/2004 Sb., o dluhopisech, § 21 — schůze vlastníků dluhopisů; quorum, hlasování, společný zástupce. |
| **§ 23 ZPKT** | Zákon o podnikání na kapitálovém trhu, § 23 — povinnosti emitenta vůči investorům, prospect disclosure. |
| **§ 122 ZPKT** | Significant shareholder disclosure requirement. |
| **§ 126 ZPKT** | Insider trading provisions. |
| **§ 23a ZoB** | Zákon o bankách, § 23a — transakce se spřízněnými osobami (related-party transactions); ČNB clearance pre-requisite. |
| **§ 21a ZoÚ** | Zákon o účetnictví, § 21a — povinnost zveřejňovat účetní závěrky ve Sbírce listin. |
| **Společný zástupce** | Trustee figure per CZ Bond Law, who can take collective actions on behalf of bondholders. |
| **Quorum** | Minimum percentage of outstanding nominal that must be present (or vote in writing) for a resolution to be valid. Per § 21c ZD typicky 50 % outstanding pro běžné, 75 % pro material amendments. |
| **Written resolution** | Souhlas přes individual sign-back místo schůzky; rychlejší ale vyžaduje výslovné povolení v emisních podmínkách. |
| **Scénář B** | Sell-side template: opt-in early redemption za nominal + accrued interest + voluntary premium pro non-consenters. |
| **Bridge facility** | Krátkodobý úvěr (typicky 6-18 měsíců) pro financování redemption shortfall do refinance. |
| **Variant D pricing** | Recommended SPA structure: PPF eskrouje "consent reserve" 75 mil. CZK při signing; čerpá se z transakční rezervy; přebytek se vrací sellerovi. |
| **ISIN** | International Securities Identification Number — unique identifier per dluhopisová tranše. |

---

## XIII. Reference dokumenty

Tento memo je založen na následujících interních zdrojích:

- `03-financial/sbirka-listin-audit.md` (Sbírka listin per-emitent detail; 4 SPV emitenti; ÚZ status; auditoři)
- `03-financial/financial-analysis.md` (Bond program overview; CoC risk framing; valuation impact)
- `RED-FLAGS.md` (RF-1, RF-3, RF-4, RF-26, RF-27, RF-28, RF-30 přímo relevantní)
- `06-reports/MASTER-DD-REPORT-v1.0.md` §6, §11.4, §11.6 (CoC strategy; covenant landscape; SPA terms)
- `08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md` (Existing per-emise solicitation template)
- `06-reports/ALTERNATIVE-BUYERS-WARM-POOL.md` (Worst-case alternative buyer pool: CPI, Penta, Crestyl)
- `06-reports/VALUATION-DEFENSE-MEMO.md` (Pricing impact od bondholder consent failure)

---

## XIV. Approval & Sign-off

**Required approvals before Phase 1 launch (T-8)**:

- [ ] **Lukáš Zrůst** (statutární orgán PROGRESUS Group a.s.) — celková strategy + budget approval
- [ ] **Lukáš Foral** (50/50 spolu-akcionář) — strategický input
- [ ] **External legal counsel** (CZ + LUX) — Section X open questions answered, formally cleared
- [ ] **External M&A counsel** (Aegis Law / advisor for PPF coordination) — Variant D pricing in SPA confirmed
- [ ] **CFO PROGRESUS** — bridge facility pre-arranged, redemption budget approved
- [ ] **External compliance** (ČNB regulatory) — pre-emptive notification cleared

**Required approvals before Phase 2 launch (T-5)**:

- [ ] **Soft-sounding outcome** — Top 5 institucionál Yes ≥ 50 % AUM (Gate 1)
- [ ] **PPF interim signoff** — confirmation of consent strategy alignment in draft SPA
- [ ] **Final consent terms** — fee, mechanism, timeline finalized
- [ ] **All 5 prospekt amendments** drafted and ready for filing

**Required approvals before T-0 closing**:

- [ ] **Aggregate consent ≥ 75 % outstanding** (Gate 3)
- [ ] **Each série consent ≥ 50 %**
- [ ] **PPF break-money escrow funded** (75 mil. CZK consent reserve)
- [ ] **Bridge facility activated** (if Mid Case scenario)
- [ ] **Redemption funds confirmed** for all opt-in Scénář B participants

---

## XV. Verzní historie

| Verze | Datum | Autor | Změna |
|-------|-------|-------|-------|
| v1.0 | 2026-04-28 | Tomáš Korčák | Initial release |

---

*— KONEC —*

**Klasifikace**: DŮVĚRNÉ — Sell-side DD
**Distribuce**: Pouze schválený stakeholder pool (Zrůst, Foral, PPF deal team, external counsel)
**Retention**: 7 let post-closing per § 31 ZoÚ

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [03-financial/UZ-BACKFILE-PREP.md](../03-financial/UZ-BACKFILE-PREP.md) — 06-reports/BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md
- [06-reports/WI-INSURANCE-MEMO.md](./WI-INSURANCE-MEMO.md) — BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `06-reports%2FBONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
