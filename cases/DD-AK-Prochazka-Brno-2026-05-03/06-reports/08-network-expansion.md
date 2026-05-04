# Stream 08 — Síť vazeb depth+2 (kompletní mapping)

**Datum**: 2026-05-03 | **Agenti**: 3× general-purpose (orchestrate paralel)
**Cíl**: Rozšířit síťový graf z 15 uzlů na ~80 uzlů s depth+2 zanořením

---

## I. Cluster Statutární město Brno (depth +1 a +2)

**Centrální uzel**: SMB, IČO 44992785, Dominikánské nám. 196/1, Brno

### Dceřiné a.s. (vrstva +1, ovládané osoby — 11 entit)

| Entita | IČO | % vlastnictví | Předmět |
|--------|-----|---------------|---------|
| Dopravní podnik města Brna (DPMB) | 25508881 | 100% | MHD |
| Brněnské komunikace (BKOM) | 60733098 | majoritní | Komunikace, parking |
| Brněnské vodárny a kanalizace (BVK) | 46347275 | SMB+Veolia | Vodovody, kanalizace |
| **Teplárny Brno** | 46347534 | 100% | CZT |
| **SAKO Brno** | 60713470 | 100% | Odpady, ZEVO Líšeň |
| Lesy města Brna | 60713356 | 100% | Lesy |
| **Veletrhy Brno** | 25582518 | 100% | BVV |
| **Technické sítě Brno (TSB)** | 25512285 | 100% | Osvětlení, kolektory, ICT |
| **STAREZ-SPORT** | 26932211 | 100% | Sportoviště |
| **ARENA BRNO** | (verifikovat OR) | 100% | Multifunkční hala |
| Realitní spol. města Brna (RSMB) | (verifikovat OR) | 100% | Správa majetku |

**Klienti AK Procházka & Co.** = vyznačeno tučně (8/11 = 73%).

### Příspěvkové organizace SMB (vrstva +1, ~15 klíčových)

Národní divadlo Brno, Městské divadlo Brno, Filharmonie Brno, CED, Divadlo Radost, **Muzeum města Brna**, Dům umění města Brna, Knihovna J. Mahena, TIC Brno, ZOO Brno, Hvězdárna a planetárium, Nemocnice Milosrdných bratří, Úrazová nemocnice, 10× domov pro seniory.

### Městské části (vrstva +1, **29 MČ**, ne 24!)

Brno-střed, Brno-sever, Brno-Židenice, **Brno-Královo Pole** (klient AK), Brno-Žabovřesky, Brno-Bystrc, Brno-Líšeň, Brno-Řečkovice a Mokrá Hora, Brno-Vinohrady, Brno-Černovice, Brno-Maloměřice a Obřany, Brno-Husovice, Brno-Bosonohy, Brno-Chrlice, Brno-Slatina, Brno-Tuřany, Brno-Bohunice, Brno-Starý Lískovec, Brno-Nový Lískovec, Brno-Kohoutovice, Brno-Jundrov, Brno-Komín, Brno-Medlánky, Brno-Ivanovice, Brno-Jehnice, Brno-Ořešín, Brno-Útěchov, Brno-Žebětín.

### Klíčoví funkcionáři SMB 2026 (vrstva +1, osoby)

| Pozice | Jméno | Strana | Pozn. |
|--------|-------|--------|-------|
| **Primátorka** | JUDr. Markéta Vaňková | ODS (SPOLU) | abs. PrF MU 2000, advokátka od 2003; zdravotní problémy 2026 |
| 1. náměstek | Robert Kerndl (po Hladíkovi → ministr ŽP) | ODS | investice, doprava, sociální |
| Náměstek | René Černý | ANO | |
| Náměstek | Jaroslav Suchý | KDU-ČSL/STAN | |
| Náměstek | Karin Karasová | ANO | |
| Tajemník MMB | Oliver Pospíšil | nestraník (ex-ČSSD) | |

### Cluster brněnských AK pracujících pro SMB (konkurence!)

| AK | IČO | Smluv s SMB | Specializace |
|----|-----|-------------|--------------|
| **Solkind s.r.o., advokátní kancelář** (ex MT Legal+Urban&Hejduk) | 28305043 | **191** | Vlajkový ZZVZ |
| **Frank Bold Advokáti** | 28359640 | 31 | Veřejná správa, životní prostředí |
| **AK Procházka & Co.** (subjekt DD) | 09963430 | ~30 | Generalistická pro SMB |
| **Petra Vymazalová** (notářka) | 04595858 | 140 | Převody, ověřování |

> **DŮLEŽITÝ NÁLEZ**: **Solkind** je **6× větší** než Procházka & Co. v SMB segmentu. Frank Bold = environmentální/územní specializace. Cluster konkurence kolem SMB je hustý.

---

## II. OHL ŽS — depth +1 (Tier-class klient z judikátu)

**OHLA ŽS, a.s.** (přejmenováno 2021) — IČO 46342796, Burešova 938/17, Brno-Veveří

### Korporátní vrstva (vlastnická hierarchie, vrstva +1 a +2)

```
OBRASCÓN HUARTE LAIN, S.A. (OHLA Group)  [reg. A-48010573, Madrid, BME:OHLA]
   Rating Caa1 (Moody's), debt restructuring 2024
   ▼ 100%
OHLA Central Europe, a.s. (přejmenováno 2019)
   ▼ 100%
OHLA ŽS, a.s. (Brno-Veveří, IČO 46342796)
   - Předseda představenstva: Juan Antonio Felices Romo (od 08/2017, ES management)
   - Členka představenstva: JUDr. Isabela Vršková (od 11/2025, in-house právník)
   - 3 dceřiné subjekty
```

### Subdodavatelé z judikátu SITA-azbest (vrstva +1)

| Entita | IČO | Sídlo | Role |
|--------|-----|-------|------|
| MAPOZ – Zliv s.r.o. | (nezveřejněno) | Školní 576, 373 44 Zliv (okr. ČB) | Subdodavatel, fyzicky odstraňoval boletické panely |
| **SITA CZ a.s.** | **25638955** (NIKOLI 46342796!) | Španělská 10/1073, Praha 2 | Sanace, dekontaminace |
| Foster Bohemia s.r.o. | 28895576 | Krátká 1148/32, Praha 10 | Akreditovaná měření, ČIA č. 206/2025 |

### Znalecké ústavy z procesu (vrstva +1, akademie)

- **VŠCHT Praha** — Doc. Ing. František Skácel CSc. (Ústav plynných a pevných paliv)
- **VUT Brno** — Doc. Ing. Jiří Hirš CSc. (Stavební fakulta, Ústav TZB)
- **ČVUT Stavební fakulta** — Doc. Ing. Vladimír Zmrhal Ph.D. (Ústav techniky prostředí)

### OHL ŽS top zadavatelé 2026 (vrstva +1)

| # | Zadavatel | Vztah |
|---|-----------|-------|
| 1 | **Správa železnic, s.o.** | Strategický #1 (železnice) |
| 2 | Národní divadlo | Renovace |
| 3 | Moravskoslezský kraj | Infrastruktura |
| 4 | Kraj Vysočina | Infrastruktura |
| 5 | Fakultní nemocnice HK | Stavba |

**Hlídač státu OHL ŽS souhrn**: 2 648 smluv / 587 mld. Kč kumulativně. 2025: 370 smluv / 43 mld. Kč.

### Sportovní vazby OHL ŽS (vrstva +2)

- **FC Zbrojovka Brno** — historický sponzor (před 2024)
- **Václav Bartoněk** — ex-ředitel OHL ŽS (do 2013), poté ředitel FC Zbrojovka (klasický patronální vzorec)
- **04/2024**: Libor Zábranský (majitel HC Kometa Brno) koupil Zbrojovku → konsolidace brněnských sportovních klubů

---

## III. Akademie + civilní pole (depth +1 a +2)

### Masaryk University (centrální uzel pro 11 z 12 advokátů Procházka & Co.)

**MU**, IČO 00216224, Žerotínovo nám. 617/9, Brno
- **Rektor**: prof. MUDr. Martin Bareš, Ph.D.

**PrF MU** (Veveří 158/70, Brno):
- **Děkan**: doc. JUDr. Mgr. Martin Škop, Ph.D.
- **Klíčové katedry** (vrstva +2, kde studoval tým):
  - Katedra občanského práva (Procházka, Davidová, Maliňák, Kapplerová, Javora)
  - Katedra obchodního práva (Jurenová, Klaška)
  - Katedra trestního práva (Procházka, Maliňák)
  - Katedra správního práva a správní vědy (Kučerová, Mosler)
  - Katedra mezinárodního a evropského práva (Novák)
  - Katedra finančního práva a národního hospodářství (Kapplerová)

**FSS MU** (Joštova 218/10, Brno):
- Katedra mediálních studií + Genderová studia (Helena Musilová Bc. 2008–2011)

### VUT Brno

**FP VUT** (Kolejní 2906/4):
- **Děkan**: prof. Ing. et Ing. Stanislav Škapa, Ph.D. (od 11/2024)
- **Ústav financí**: vedoucí nezveřejněn
- **Helena Musilová**: asistent (od 2001), member Komory akadem. pracovníků AS FP, Disciplinární komise FP, Legislativní komise AS VUT, pedagogická komise FP

### PF UPOL (Vladimír Kyrych abs. 2000)

- **Děkan**: doc. JUDr. Václav Stehlík, Ph.D., LL.M.

### Amnesty International ČR (Mgr. Procházka člen)

- IČO 44793430, Seifertova 455/17, Praha 3
- **Ředitelka 2026**: Lucie Laštíková (od 01/2026)
- **Brněnská skupina** (od 1999): brno@amnesty.cz, FB amnestyinternationalbrno

---

## IV. Česká advokátní komora — orgány k 2026 (depth +1 a +2)

**Vedení 2025–2029**:
- **Předsedkyně**: JUDr. Monika Novotná
- **Místopředseda**: JUDr. Lukáš Trojan
- **Místopředsedkyně**: JUDr. Michala Plachká
- **Výbor pro odbornou pomoc**: JUDr. Marek Nespala
- **Insolvenční expert**: JUDr. Michal Žižlavský

**Pobočka ČAK Brno**: Nám. Svobody 84/15, brno@cak.cz, 513 030 111

**Sekce ČAK** relevantní pro tým:
- Sekce trestního práva (Procházka, Maliňák)
- Sekce občanského práva (většina týmu)
- Sekce obchodního práva (Jurenová, Klaška)
- Sekce real estate / nemovitostí
- Sekce pro veřejné právo
- Sekce IT a duševní vlastnictví

---

## V. Soudní instituce z judikátu (vrstva +1)

- **Krajský soud v Českých Budějovicích** (odvolací — 22 Co 2256/2016)
- **Okresní soud v Českých Budějovicích** (1. stupeň — 25 C 169/2013-1302)
- **Senát**: JUDr. Helena Papoušková (předsedkyně), JUDr. Marie Korbelová, JUDr. František Koláře

**Strany sporu**:
- **Statutární město České Budějovice** (žalobce, IČ 00244732), zast. **Mgr. Jiří Jarůšek** (advokát ČB, Radniční 7a)

---

## VI. Souhrn — uzly pro p5.js sketch

**Celkem ~85 uzlů** v 7 kategoriích:

| Kategorie | Počet | Barva sketch |
|-----------|-------|--------------|
| **AK Procházka & Co. + tým (subjekt + 12 osob)** | 13 | Fialová (#7c3aed) / Modrá (#2563eb) |
| **SMB skupina (město + 11 a.s. + 5 přísp. + 6 funkcionářů)** | 23 | Zelená (#16a34a) |
| **OHL ŽS skupina (matka, OHLA, OHL ŽS, 3 subdodavatelé, 3 znalci, 4 zadavatelé, 2 sport)** | 14 | Červená (#dc2626) |
| **Akademie (MU, PrF, FSS, 6 kateder, VUT FP, UPOL, 5 osob)** | 16 | Oranžová (#f97316) |
| **ČAK + sekce (centrála, pobočka Brno, 5 funkcionářů, 6 sekcí)** | 13 | Cyan (#06b6d4) |
| **Konkurence brněnských AK (5 z shortlistu + Solkind + Frank Bold + Vymazalová)** | 8 | Šedá (#94a3b8) |
| **Soudní instituce + judikát strany** | 5 | Hnědá (#a16207) |

**Celkem**: ~92 uzlů (před deduplikací). Po sloučení duplicit (např. VUT je v 2 kategoriích) ~85.

**Hran (edges)**: ~150 (vlastnictví, zaměstnanecký vztah, klient↔dodavatel, zástupce↔žalovaný, akademická vazba, členství v orgánu).

---

## Doporučení pro sketch implementation

1. **Hierarchická layout** — clustery dle kategorií + force-directed mezi clustery
2. **Velikost uzlu** podle role (tier) — větší pro centrální entity (Procházka & Co., SMB, OHL ŽS, MU)
3. **Tloušťka hrany** podle síly vazby (např. 80% klient = silná hrana)
4. **Interaktivní filter** — toggle per kategorii (zapnout/vypnout SMB / akademie / ČAK / atd.)
5. **Zoom + drag** — pro navigaci v hustém grafu
6. **Tooltip** při hover — IČO, role, vztah

## Zdroje

Stream A (SMB):
- [Hlídač státu — SMB vazby](https://www.hlidacstatu.cz/subjekt/Vazby/44992785)
- [Brno — Městské organizace](https://www.brno.cz/mestske-organizace)
- [Wikipedia — MČ Brna](https://cs.wikipedia.org/wiki/Seznam_m%C4%9Bstsk%C3%BDch_%C4%8D%C3%A1st%C3%AD_Brna)

Stream B (OHL ŽS):
- [OHLA ŽS — Hlídač státu](https://www.hlidacstatu.cz/subjekt/46342796)
- [OHLA Group ES (matka)](https://ohla-group.com/)
- [OHLA Central Europe](https://www.ohla-central-europe.com/)
- [SITA CZ — IČO 25638955](https://www.estav.cz/sita)
- [Foster Bohemia — ČIA](https://www.cai.cz/?subjekt=1150-foster-bohemia-s-r-o)

Stream C (Akademie + ČAK):
- [Masarykova univerzita](https://www.muni.cz/)
- [PrF MU](https://www.law.muni.cz/)
- [FP VUT](https://www.fp.vut.cz/)
- [PF UPOL](https://www.pf.upol.cz/)
- [Amnesty International ČR](https://amnesty.cz/)
- [Česká advokátní komora 2025–2029](https://www.ceska-justice.cz/2025/10/advokati-zvolili-vedeni-kdo-je-povede-v-letech-2025-2029/)
- [Pobočka ČAK Brno](https://www.cak.cz/pobocka-cak-brno-1)
