# Skupina Progresus — Struktura subjektů

**Stav**: Částečná mapa sestavená z veřejného OSINT (2026-04-21). K dokončení vyžaduje detailní průzkum ARES/OR.

## Vrchol struktury

```
PROGRESUS Group a.s.                   ← konečný holding (zároveň ručitel dluhopisů)
    ├── Progresus Invest Holding a.s.  ← veřejně vystupující značka "Progresus"
    ├── Progresus Invest Holding core a.s. (IČO 13995758) ← účel nejasný
    └── [provozní dceřiné společnosti — 100+ společností]
```

**AKCE**: Získat plnou evidenci skutečného majitele (UBO) z justice.cz prokazující řetězec vlastnictví od Lukáše Zrůsta + Lukáše Forala přes každou vrstvu až po PROGRESUS Group a.s.

## Konečný skutečný majitel (UBO)

| UBO | Podíl | Funkce |
|-----|-------|----------|
| JUDr. Lukáš Zrůst, Ph.D. | 50 % | Zakladatel, jednatel |
| Lukáš Foral | 50 % | Zakladatel, investiční partner |

**DD akce**: Ověřit přímo v Evidenci skutečných majitelů (eSM) — **jakákoli odchylka** od 50/50 indikuje neuvedené mezivrstvy.

## Projekt Nový Zeleneč — subjekty držící pozemky

### Subjekt A: Nový Zeleneč a.s.
| Pole | Hodnota |
|-------|-------|
| **IČO** | 27825981 |
| **DIČ** | CZ27825981 |
| **Sídlo** | Krapkova 452/38, Nová Ulice, 779 00 Olomouc |
| **Soud** | KS Ostrava, spis. zn. B 10025 |
| **Založena** | 2007-12-20 |
| **Základní kapitál** | 2 000 000 CZK |
| **Akcie** | 20× listinné na jméno/doručitele, jmenovitá hodnota 100 000 CZK |
| **Představenstvo (k 2026)** | Mgr. Jindřiska Chytilová (členka od 2021-01-18) |
| **Předmět podnikání** | Pronájem a správa vlastních nebo pronajatých nemovitostí |

### 🚨 KRITICKÝ PROBLÉM TIMELINE
- Nový Zeleneč a.s. **založena 2007-12-20** — 14 let před vznikem Progresu
- Chytilová vstoupila do představenstva **2021-01-18**
- Progresus založen **únor 2021**

**Závěr**: Progresus **akvíroval** Nový Zeleneč a.s. okolo ledna 2021, pravděpodobně včetně již držených 42 ha pozemků.

**Otázky PPF k očekávání**:
1. Kdo byl původní vlastník Nový Zeleneč a.s. v letech 2007-2020?
2. Kupní cena, kterou Progresus zaplatil v 2021?
3. Zdroj prostředků na akvizici?
4. Existuje stále nevypořádaný earn-out doplatek, úschova nebo podmíněná protihodnota?
5. Daňový režim akvizice — navýšení základu nebo přenesení (carry-over)?
6. Mají někteří prodávající stále mezilehlé nároky (prodejci, opce, předkupní právo)?

**DD akce URGENTNĚ**:
- Historické záznamy OR pro IČO 27825981 před 2021
- Smlouva o převodu akcií z 2021
- Důkaz o zdroji prostředků
- Jakýkoli tok mezi spojenými osobami

### Subjekt B: RD Rýmařov Invest III. alpha s.r.o.
| Pole | Hodnota |
|-------|-------|
| IČO | NEZNÁMÉ — potřeba ARES vyhledávání |
| Role | Spoluvlastník 42 ha pozemku (dle článku Aegis Law) |
| Vzorec pojmenování | "Invest III" = naznačuje vazbu na dluhopisovou sérii 2024 PROGRESUS RD Rýmařov III a.s. |

### 🚨 SIGNÁL DUÁLNÍHO VLASTNICTVÍ
Pozemek je rozdělen mezi subjekty A a B. Důvody pro vyšetřování:
1. **Vzorec historické akvizice** — různé parcely získané v různých časech
2. **Struktura zástavy dluhopisů** — subjekt B může být zastaven dluhopisovým věřitelům
3. **Daňová optimalizace** — některé parcely v jiném daňovém režimu
4. **Vyňaté financování** — různí věřitelé na různých parcelách

Do ověření je nutno považovat za **zvýšené riziko pro čistý převod titulu**.

## Struktura dluhopisového programu

### Současný emitent (2026-)
**PROGRESUS RD Rýmařov IV a.s.**
- 10letý dluhopisový program
- Maximální emise 2 mld. CZK
- Garantován PROGRESUS Group a.s.
- Současný prospekt schválen ČNB

### Předchozí emitent (2024-2026)
**PROGRESUS RD Rýmařov III a.s.**
- IČO: 21515841
- Nabídka ukončena: 2026-01-02
- Nesplacená jistina: **NEZNÁMÁ — potřeba Sbírka listin**

### Předchozí emitent (2021-2022)
**RD Rýmařov Invest Develop a.s.**
- Nabídka ukončena: 2022-06-29
- Nesplacená jistina: **NEZNÁMÁ — potřeba Sbírka listin**

### Další související
**PROGRESUS RD Rýmařov a.s.** (IČO: 17053161)
- Role nejasná — veřejně neidentifikován jako emitent dluhopisů
- Může být provozní subjekt

## Další segmenty skupiny (dle Wikipedie)

Portfolio Progresu dle veřejných prohlášení: 100+ společností v segmentech:
- **Dřevostavby** — RD Rýmařov, deriváty
- **Rezidenční rozvoj** — Nový Zeleneč + další
- **Průmyslové nemovitosti** — portfolio TBD
- **Skleněné tvárnice** — Vitrablok / Seves Glass Block (akvírováno)
- **IT** — společnosti TBD
- **Doplňky stravy** — společnosti TBD
- **Právo** — pravděpodobně Zrůstova vlastní praxe nebo spřízněná kancelář
- **Insolvence** — Zrůstova historická praxe

**DD akce URGENTNĚ**:
- Plný groupový diagram od PROGRESUS Group a.s. dolů ke každému z ~100+ subjektů
- Klasifikace dle segmentu
- Identifikace, které jsou v rozsahu transakce vs. mimo rozsah
- Mapování mezipodnikových finančních toků

## Subjekty vyžadující vyhledávání v ARES / OR (priorita)

| Priorita | Subjekt | Důvod |
|----------|--------|-----|
| P1 | Nový Zeleneč a.s. (27825981) | Historický řetězec vlastnictví 2007-2021 |
| P1 | RD Rýmařov Invest III. alpha s.r.o. | Spoluvlastnictví pozemků, vazba na dluhopisy |
| P1 | PROGRESUS Group a.s. | UBO řetězec + mateřská skupiny |
| P1 | PROGRESUS RD Rýmařov III a.s. (21515841) | Nesplacené dluhopisy + CoC kovenanty |
| P1 | PROGRESUS RD Rýmařov IV a.s. | Současná dluhopisová série |
| P1 | RD Rýmařov Invest Develop a.s. | Rezidua nejstarší dluhopisové série |
| P2 | PROGRESUS RD Rýmařov a.s. (17053161) | Vyjasnění role |
| P2 | Progresus Invest Holding core a.s. (13995758) | Duální pojmenování subjektů |
| P2 | RD Rýmařov (provozní subjekt IČO) | Provozní byznys |
| P3 | Všech 100+ dceřiných | Plný diagram |
| P3 | RONDAX | Ověřit existenci (zjištění z 2026-04-01) |
| P3 | CASPER | Ověřit jako kód projektu nebo samostatný subjekt |
| P3 | DANCORE | Ověřit jako kód projektu nebo samostatný subjekt |

## Úskalí, kterým se vyhnout při disclosure subjektů

1. **Neuvádět diagram bez pojmenování každé materiální dceřiné společnosti** — PPF najde vynechané přes plnotextové vyhledávání ARES
2. **Netvrdit čistých 50/50 UBO, pokud existují mezivrstvy** — ověřit při každém kroku přes eSM
3. **Nereprezentovat všechny subjekty jako "spící" bez důkazů** — spící v ČR má specifický význam (žádná aktivita, žádní zaměstnanci)
4. **Nezatajovat společnosti blíže ke Zrůstovi osobně** — právní praxe, insolvenční praxe, rodinné svěřenské fondy (trusty)
5. **Uvádět každou změnu adresy subjektu** — PPF křížově porovnává historické adresy pro detekci podvodných vzorců

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [RED-FLAGS.md](../RED-FLAGS.md) — 02-entity/entity-structure.md (8×)
- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 02-entity/entity-structure.md#dalsi-segmenty-skupiny (2×)

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `02-entity%2Fentity-structure.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
