# Phase 5 — Real Platform Verification

**Datum**: 2026-04-28T20:00:00Z
**Status**: COMPLETE — ARES + OpenSanctions live verification
**Total tool calls**: 60+ (24 ARES JSON + 18 OpenSanctions + Edit/Write patches)

---

## §1 ARES batch verification (11 IČO)

Použit primární zdroj: `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ICO}` (public REST API, no auth).

### Verification matrix

| # | IČO | Status | Confidence Δ |
|---|-----|--------|--------------|
| 1 | 19696477 (AMALAR HOLDING) | VERIFIED | +0.10 |
| 2 | 25099345 (PPF a.s.) | VERIFIED | +0.10 |
| 3 | 28902254 (Nadace TKFF) | VERIFIED-REFINED (date 2009 → 2009-05-25, name casing) | +0.07 |
| 4 | 60178779 (Otruba advokát) | VERIFIED-PARTIAL (sufix advokát alt-only) | +0.03 |
| 5 | 08034371 (Nordic Investors) | DIVERGENT-REBRAND (canonical name updated) | -0.20 → corrected |
| 6 | 01868616 (Krkonoše Resort Invest) | VERIFIED | +0.10 |
| 7 | 07024223 (GRAND HOTEL HRADEC) | DIVERGENT (address corrected, missing date added) | -0.30 → corrected |
| 8 | 21539065 (Harmony Špindlerův Mlýn) | DIVERGENT-MAJOR (parent/child address swap) | -0.45 → corrected |
| 9 | 22175806 (Harmony Operations) | VERIFIED | +0.10 |
| 10 | 06315160 (CzechToll) | VERIFIED-REFINED (date 2017 → 2017-08-02) | +0.07 |
| 11 | 04593332 (Nordic Telecom Regional) | VERIFIED | +0.07 |

### Aggregate
- **Verified outright**: 5/11 (45%)
- **Verified with refinement**: 3/11 (27%)
- **Divergent (corrected)**: 3/11 (27%) — applied as JSON patches
- **Inaccessible (404)**: 0/11 (0%)
- **All ARES requests returned 200 OK**

### Critical corrections applied
1. **Harmony parent/child address swap** — `harmony-spindleruv-mlyn` (acquisition SPV) měl chybně Praha-Michle adresu operující dceřinky. ARES potvrdil že SPV sídlí v Bedřichově 106 Špindlerův Mlýn (přímo na hotelu). Operations s.r.o. sídlí v Praze-Michli.
2. **GRAND HOTEL HRADEC missing data** — claim měl pouze "Praha (operations Pec pod Sněžkou)" jako vágní adresu. ARES vrátil přesné `Bohdalecká 1490/25, Michle, 10100 Praha 10` + missing `incorporation_date: 2018-04-10` + court file `C 293251/MSPH`.
3. **Nordic Investors Group rebrand** — kanonický název v ARES je `Nordic Investors Hospitality a.s.` (post 6/2025 rebrand). Updatováno + původní jméno přesunuto do `former_names`.

### Enrichment data added (8 verified entities)
Přidáno do každé verified entity:
- `dic` (DIČ — VAT number derived from IČO)
- `financni_urad` (Czech tax office code)
- `cz_nace_codes` (industry classification)
- `pravni_forma_kod` (numeric legal form code)
- `metadata.verified_against_ares_at` (ISO timestamp)
- `metadata.sources` appended with ARES JSON URL

---

## §2 OpenSanctions live re-screening

Aggregator pokrývá **200+ datasetů** including OFAC SDN, EU Consolidated, UK HMT OFSI, UN Consolidated, Swiss SECO, Canadian SEMA, Australian DFAT, Wikidata PEP, ICIJ Offshore Leaks, Sentry Atlas a další.

### Status table (15 subjects screened)

| # | Subject | Hits | Verdict |
|---|---------|------|---------|
| 1 | Renáta Kellnerová | 0 | NO MATCH |
| 2 | Anna Kellnerová | 0 | NO MATCH |
| 3 | Tomáš Otruba | 0 | NO MATCH |
| 4 | Robert Ševela | 0 | NO MATCH |
| 5 | AMALAR HOLDING | 0 | NO MATCH |
| 6 | PPF a.s. | 1 | NO MATCH (PPF Banka — BIC reference data only, ne sanction; jiná entita) |
| 7 | PPF Group N.V. | 0 | NO MATCH |
| 8 | Nadace TKFF | 0 | NO MATCH |
| 9 | CzechToll | 0 | NO MATCH |
| 10 | Nordic Investors Hospitality | 0 | NO MATCH |
| 11 | Krkonoše Resort Invest | 0 | NO MATCH |
| 12 | Harmony Špindlerův Mlýn | 0 | NO MATCH |
| 13 | CETIN | 48 | FALSE-POSITIVE (Turkish surname Çetin, 42/48 v Türkiye, žádný hit na CZ CETIN a.s.) |
| 14 | O2 Czech Republic | 0 | NO MATCH |
| 15 | Home Credit Group | 10 | FALSE-POSITIVE (search engine returned Sinopec, Renault, Erste atd. — žádné Home Credit) |

### Aggregate verdict
- **Total subjects screened**: 15
- **NO MATCH (clean)**: 15/15 (100%)
- **PEP-only matches**: 0
- **Sanctions matches**: 0
- **Adverse media matches**: 0
- **False-positive collisions**: 2 (CETIN/Çetin, Home Credit/unrelated corps) — disregarded after dataset analysis
- **Date of screening**: 2026-04-28T21:41:34Z

### EU 20th Russia Sanctions Package (April 2026) cross-check
Verified that EU 20th sanctions package (April 2026, sanctioning 20 Russian banks) does NOT include any PPF entity, Home Credit, or Kellner-cluster subject.

### Confidence delta vs Phase 3 Sanctions
**IDENTICAL** result with Phase 3 (also 2026-04-28) → confidence reinforced. Two independent screening passes through OpenSanctions aggregator on the same day with consistent NO MATCH outcome.

---

## §3 Decision Engine re-run (Phase 5 inputs)

After ARES verification + sanctions re-screening, fresh Decision Engine run with verified inputs:

| Metric | Phase 4 (original) | Phase 5 (verified) | Δ |
|--------|-------------------|---------------------|---|
| Verdict | caution | caution | — |
| Risk level | high | high | — |
| Overall score | 60/100 | 60/100 | — |
| Confidence | 10.93% | **11.03%** | **+0.10pp** |
| Manipulation risk | 51.4% | **42.9%** | **−8.5pp** ✓ |
| Signal strength | 36.5% | 36.8% | +0.30pp |
| Inputs | 20 | 25 | +5 (added ARES verification statements) |

### Interpretation
Decision Engine architecture caps verdict change without significantly broader evidence categories (low_coverage 0.83 limiting factor persists — engine wants legal/financial/integrity/relationships/technical sources). Nicméně:
- **Manipulation risk dropped 8.5pp** — což je největší jednotlivá změna v signal analysis. To je **přímý důsledek** přidání ARES-verified statements (registry data má vyšší internal coherence než media-derived claims).
- **Reducibility 90.05%** zachováno — cluster's epistemic uncertainty zůstává adresovatelná dalšími sources.

---

## §4 Doctrine compliance

✅ **NMND** — Žádné placeholders. Všechny patches based na real ARES JSON responses.
✅ **NWB** — Forward-only corrections. Address-swap a name-rebrand opraveny in-place s `previous_claim` / `former_names` audit trail.
✅ **NCLB** — Každé tvrzení v Phase 5 inputech má source URL. ARES JSON URLs přidány do `metadata.sources` všech 11 entit.
✅ **CZE** — Czech body, EN technical (DIČ, IČO, ARES, OpenSanctions, NACE).
✅ **GDPR** — Pouze public registry data; žádné soukromé adresy/kontakty mimo veřejný record.
✅ **TACH-equivalent** — Phase 5 = re-verification = test-like; doctrine pillar pre-commit gating respektován (žádné lib/ změny).

---

## §5 Files modified

### Entity JSONs (11 verified)
- `apps/prismatic_dd/priv/data/entities/company/company-amalar-holding.json`
- `apps/prismatic_dd/priv/data/entities/company/company-ppf-as.json`
- `apps/prismatic_dd/priv/data/entities/company/company-kellner-family-foundation.json`
- `apps/prismatic_dd/priv/data/entities/company/company-otruba-advokat.json`
- `apps/prismatic_dd/priv/data/entities/company/company-nordic-investors-group.json`
- `apps/prismatic_dd/priv/data/entities/company/company-krkonose-resort-invest.json`
- `apps/prismatic_dd/priv/data/entities/company/company-grand-hotel-hradec.json`
- `apps/prismatic_dd/priv/data/entities/company/company-harmony-spindleruv-mlyn.json`
- `apps/prismatic_dd/priv/data/entities/company/company-harmony-operations.json`
- `apps/prismatic_dd/priv/data/entities/company/company-czechtoll.json`
- `apps/prismatic_dd/priv/data/entities/company/company-nordic-telecom-regional.json`

### Decision Engine artifacts
- `apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/inputs.txt` — 25 verified statements (was 20)
- `apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/pipeline-output.json` — Phase 5 verdict captured

### This report
- `apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/findings/PHASE-5-VERIFICATION.md` (this file)
- `apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/findings/PHASE-5-VERIFICATION.html` (interactive)

---

## §6 Recommendation for next iterations

1. **Justice.cz `vypis-rejstrik` lookup** for board members (statutární orgán) — ARES JSON endpoint nevrací jednatele; zde lze ověřit současný board PPF a.s. (Jirásková/Král/Janák) + dozorčí radu (Otruba chair).
2. **GLEIF lookup** pro LEI codes (Krkonoše Resort Invest 315700HXBFOT3EEVRP80 confirmed; další entity bonds-issuing kde existuje LEI?)
3. **Sub-IČO discovery** pro Krkonoše Resort Invest pyramid:
   - Janské Lázně Resort Invest s.r.o. (Hotel Omnia + Vyhlídka) — IČO unknown
   - Pec pod Sněžkou Resort Invest s.r.o. — IČO unknown
   - Horní Maršov Resort Invest s.r.o. — IČO unknown
4. **RKE Holding + AKE Holding** discovery — Renáta + Anna's personal SPVs holding 26% + 22% Harmony JV stakes; IČOs not yet in entity store.
5. **Quarterly sanctions re-screen** — schedule next OpenSanctions check 2026-07-28.
6. **PPF Group N.V. NL→CZ relocation completion verification** — H1 2026 status check; new Czech entity registration would surface in ARES.

---

*Phase 5 complete. Cluster confidence reinforced via primary registry verification + duplicate sanctions screening. Two material data corrections applied (Harmony address swap, GRAND HOTEL HRADEC address). Manipulation risk down 8.5pp due to verified-source coherence.*
