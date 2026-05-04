# DD Case — AK Procházka & Co. (Brno) — v2

**Case ID**: `DD-AK-Prochazka-Brno-2026-05-03`
**Subjekt**: Procházka & Co., advokátní kancelář, s.r.o. (IČO 09963430)
**Datum**: 2026-05-03 | **Verze**: v2 (po ARCHER deep verification)
**Verdikt**: 🟢 ZELENÁ s podmínkami | **Riziko**: NÍZKÉ až STŘEDNÍ (skóre 6.4/10)

## 🔄 Klíčové korekce v2

1. **Judikát 22 Co 2256/2016** — Procházka zastupoval **OHL ŽS, a.s.** (NE SITA CZ). Klient prohrál v meritu žaloby 16,7M Kč. Pozitivně: OHL ŽS = Tier-class korporátní reference.
2. **"Beneficial ownership 12/2025"** = SYSTÉMOVÁ změna ČR (ESM uzavřena pro veřejnost). NE specifický red flag.
3. **Klientská koncentrace ~80% na SMB** = significant Key Client Risk.
4. **10 smluv bez ceny v 2021–2023** + **splitting podezření** multifunkční haly. V 2024–2026 napraveno (0 rizik).
5. **Sdílené zakázky s Frank Bold** = cluster brněnských AK kolem SMB.

## Obsah case adresáře

```
DD-AK-Prochazka-Brno-2026-05-03/
├── README.md                              ← TENTO SOUBOR (entry point)
├── case.md                                ← Kompletní DD report (v2 narrativa)
├── index.html                             ← Interaktivní dashboard
├── manifest.json                          ← Strojový stav + nálezy
├── 06-reports/                            ← Per-stream raw výstupy
│   ├── 01-judikatura-media.md             ← v1 mělká rešerše
│   ├── 02-shortlist-konkurence.md         ← 5 brněnských AK alternativ
│   ├── 03-team-osint.md                   ← LinkedIn + publikace
│   ├── 04-karna-evidence-deep.md          ← ARCHER A — ČAK kárná verifikace
│   ├── 05-hlidac-statu-deep.md            ← ARCHER B — Hlídač státu deep
│   ├── 06-soudni-lustrace-deep.md         ← ARCHER C — KOREKCE OHL ŽS
│   └── 07-cenovy-benchmark.md             ← ARCHER D — cenový benchmark Brno
├── 08-comms-templates/                    ← Připravené k odeslání
│   ├── 01-RFP-dotaznik.md                 ← 43 otázek + hodnotící matice
│   ├── 02-engagement-letter-template.md   ← Smlouva (11 článků, 3vrstvý cenový model)
│   ├── 03-conflict-matrix-template.md     ← Konfliktová matice s Procházka specifiky
│   └── 04-email-test-responzivity.md      ← 5 e-mail variant + hodnotící matice
└── _assets/                               ← (rezervováno pro PDF/obrázky)
```

## Otevření dashboardu

```bash
open cases/DD-AK-Prochazka-Brno-2026-05-03/index.html
```

Dashboard obsahuje 13 sekcí:
- 3 KPI karty (Verdikt 🟢 ZELENÁ, Riziko NÍZKÉ až STŘEDNÍ, Skóre 6.4/10)
- **Banner s korekcemi v2**
- 11 stream cards (✅ × 8, ⏸️ × 3 pending na klienta)
- Disambiguační tabulka 5 kandidátů
- Tým charts (rolí, vzdělání, specializací) + plná tabulka 12 osob
- Komerční stopa (timeline + KCR flag)
- Riziková radar (10 dimenzí v2 vs. Tier A benchmark)
- Komparativní radar 6 brněnských AK
- **Interaktivní p5.js síťový graf** (15 uzlů, force-directed)
- **Templates accordion** (Alpine.js taby pro 4 šablony)
- **🎯 ARCHER audit trail** (4 paralelní tracks → ~530 sec)
- Akční kroky (10 kroků, P0/P1/P2)
- Verdikt + zdroje

## Status (v2)

| # | Stream | Status |
|---|--------|--------|
| 1 | Disambiguace + identifikace | ✅ completed |
| 2 | ČAK + ARES + OR | ✅ completed |
| 3 | Hlídač státu / Registr smluv | ✅ completed |
| 4 | Judikátová stopa (KOREKCE) | 🔄 completed_v2 |
| 5 | Komparativní shortlist (5 AK) | ✅ completed |
| 6 | Extended OSINT týmu (12 osob) | ✅ completed |
| 7 | ARCHER deep verification (4 paral.) | 🎯 completed |
| 8 | RFP + engagement + conflict + email | 📋 completed |
| 9 | Konfliktová matice (vyplnění klientem) | ⏸️ pending_input |
| 10 | Test responzivity (klient odešle e-mail) | ⏸️ pending_action |
| 11 | RFP odeslání + 2-3 alternativy paralelně | ⏸️ pending_action |

## Doporučení (zkráceně)

🟢 **Vhodný** pro standardní regionální komerční/civilní/správní/real estate mandáty v Jihomoravském kraji.

⚠️ **Vyžaduje doplnění** pro:
- Cross-border M&A (chybí jazyková a Tier 1 expertíza)
- Spory proti SMB/TSB/ARENA BRNO/STAREZ-SPORT/Teplárny Brno/Veletrhy Brno (klient AK)
- Spory proti OHL ŽS, a.s. (historický klient — možný konflikt)
- Banking & finance, kapitálové trhy, telecom regulace

**Další kroky pro klienta:**
1. Vyplnit `08-comms-templates/03-conflict-matrix-template.md` (P0)
2. Odeslat `08-comms-templates/01-RFP-dotaznik.md` paralelně 3 AK (Procházka & Co. + Štourač + Fiala+Tejkal)
3. Spustit test responzivity (`08-comms-templates/04-email-test-responzivity.md`)
4. Po získání nabídek finalizovat výběr a podepsat `02-engagement-letter-template.md`
