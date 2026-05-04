# Phase 3 — Entity Extraction (ARES + justice.cz)

**Datum**: 2026-04-28
**Tools used**: 17 distinct (5 ARES JSON + 12 WebSearch/WebFetch)
**Entit doloženo s IČO**: 11 / 10 plánovaných (s identifikovanými sub-entitami Krkonoše holding stack)

## Verified entities

| # | Name | IČO | Type | Established | Address |
|---|------|-----|------|-------------|---------|
| 1 | AMALAR HOLDING s.r.o. | 19696477 | Family superholding | 2023-09-06 | Evropská 2690/17, Praha 6 |
| 2 | PPF a.s. | 25099345 | Operating PPF entity | 1997-01-13 | Evropská 2690/17, Praha 6 |
| 3 | Nadace The Kellner Family Foundation | 28902254 | Foundation | 2009 | Evropská 2690/17, Praha 6 |
| 4 | Mgr. Tomáš Otruba — advokát | 60178779 | OSVČ | 2000-01-01 | Velká Úpa 297, Pec p.S. |
| 5 | Nordic Investors Group / Hospitality a.s. | 08034371 | Investor vehicle | 2019 (CZ) | Bedřichov 106, Špindl. |
| 6 | Krkonoše Resort Invest a.s. | 01868616 | Hotel pyramid holdco | 2016-12-27 | Pec p. Sněžkou 137 |
| 7 | GRAND HOTEL HRADEC s.r.o. | 07024223 | Hotel | — | Pec p. Sněžkou |
| 8 | Harmony Špindlerův Mlýn a.s. | 21539065 | JV SPV | 2024-05-06 | Bohdalecká 1490/25, Praha 4 |
| 9 | Harmony Špindlerův Mlýn Operations s.r.o. | 22175806 | Operating sub | 2024-10-18 | Bohdalecká 1490/25, Praha 4 |
| 10 | CzechToll s.r.o. | 06315160 | Mýtný operator | 2017 | Argentinská 1610/4, Praha 7 |
| 11 | Nordic Telecom Regional s.r.o. | 04593332 | Exit (sold to O2) | 2015-11-26 | Za Brumlovkou 266/2, Praha 4 |

## Critical findings

### Shared Kellner compound address
**Evropská 2690/17, Praha 6 — Dejvice** sídlí 3 entity:
- AMALAR HOLDING (#1)
- PPF a.s. (#2)
- Nadace TKFF (#3)

### Otruba's hotel pyramid
```
Mgr. Tomáš Otruba (osoba, IČO 60178779)
└── Krkonoše Resort Invest a.s. (01868616) — chair SR
    ├── GRAND HOTEL HRADEC s.r.o. (07024223)
    ├── Horní Maršov Resort Invest s.r.o. *
    ├── Janské Lázně Resort Invest s.r.o. * (operates Omnia + Vyhlídka)
    ├── Pec pod Sněžkou Resort Invest s.r.o. *
    └── Velkoobchod hotelovými víny a.s. (22283340)

* sub-IČO not extracted in this phase
```

### AMALAR ownership
| Holder | Stake | Role |
|--------|-------|------|
| Renáta Kellnerová | 66.667% | Jednatelka |
| Anna Kellnerová | 11.111% | Společník |
| Lara Kodl Kellnerová | 11.111% | Společník |
| Marie Isabella Kellnerová | 11.111% | Společník |

### Harmony JV
| Holder | Stake |
|--------|-------|
| Tomáš Otruba | 51% |
| RKE Holding (Renáta) | 26% |
| AKE Holding (Anna) | 22% |

Acquired from Václav Junek (ex-Chemapol) for >700 mil CZK. ÚOHS approved March + May 2025.

## Open issues / Phase 4 follow-up

1. **RKE Holding** (Renáta) — IČO not extracted via WebSearch; needs interactive justice.cz POST
2. **AKE Holding** (Anna) — IČO not extracted; founded 2024 for Harmony deal
3. **Nordic Investors Hospitality** post-rebrand (6/2025) — verify if same IČO 08034371 or new entity
4. **Janské Lázně Resort Invest** sub-IČO — needs ARES POST
5. **Horní Maršov Resort Invest** sub-IČO
6. **Pec pod Sněžkou Resort Invest** sub-IČO
7. **ITIS Holding** (CzechToll mateřská post-konsolidace) — IČO + structure
8. **PPF a.s. shareholder list 2026** — likely 100% AMALAR HOLDING after relocation
9. **Beneficial owners registry** verification per zákon 37/2021 Sb. (CZ UBO)

## Sources

ARES detail endpoint, podnikatel.cz, peníze.cz, kurzy.cz, hlidacstatu.cz vazby map, lei-ceska.cz, lupa.cz/itbiz.cz pro M&A coverage. Full URL list in entity JSON files (`apps/prismatic_dd/priv/data/entities/company/*.json`).
