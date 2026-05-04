# Sbírka listin (OR) — audit účetních závěrek a korporátních dokumentů

**Datum**: 2026-04-21
**Autor**: Prismatic OSINT DD Cell (Claude Opus 4.7)
**Zdroj pravdy**: or.justice.cz (Český obchodní rejstřík — veřejný archiv dokumentů), ARES, CENIA, dluhopisar.cz
**Předchozí práce**: Použit Prismatic `apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/justice.ex` jako referenční adaptér (relace s tokenem, 3s omezení frekvence dotazů, parsování HTML pomocí Floki). Pouze veřejné endpointy; bez přihlašovacích údajů.

**Použité URL vzory**:
- Vyhledání entity: `https://or.justice.cz/ias/ui/rejstrik-$firma?ico={IČO}` (HTML → `subjektId`)
- Detail (platné záznamy): `https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId={ID}&typ=PLATNY`
- **Sbírka listin (archiv dokumentů)**: `https://or.justice.cz/ias/ui/vypis-sl-firma?subjektId={ID}`
- Detail dokumentu: `https://or.justice.cz/ias/ui/vypis-sl-detail?dokument={ID}&subjektId={SID}&spis={SPIS}`

**Surová data uložena**: `./raw/{progresus,ppf}/{ares-*,or-search-*,sl-*,detail-*}.{json,html}` (50+ souborů).

---

## 1. Mapování entita → subjektId (všech 17 cílů + 5 objevených)

### Přímé cíle (17)

| Strana | Společnost | IČO | subjektId | Spis. zn. | Soud | Datum vzniku |
|---|---|---|---|---|---|---|
| PROGRESUS | **Nový Zeleneč a.s.** (CÍL) | 27825981 | 362662 | B 10025 | KS Ostrava | 2007-12-20 |
| PROGRESUS | PROGRESUS Group a.s. | 10978216 | 1126254 | B 26471 | MS Praha | 2021-06-24 |
| PROGRESUS | PROGRESUS invest holding s.r.o. | 09932836 | 1110265 | C 84836 | KS Ostrava | 2021-02-18 |
| PROGRESUS | Progresus invest holding core a.s. | 13995758 | 1140927 | B 26807 | MS Praha | 2021-09-07 |
| PROGRESUS | PROGRESUS RD Rýmařov III a.s. (EMITENT DLUHOPISŮ) | 21515841 | 1238031 | B 28846 | MS Praha | **2024-04-27** |
| PROGRESUS | PROGRESUS RD Rýmařov a.s. (EMITENT DLUHOPISŮ) | 17053161 | 1156058 | B 27212 | MS Praha | 2022-04-19 |
| PROGRESUS | RD Rýmařov Invest Holding a.s. | 09963758 | 1114131 | B 11297 | KS Ostrava | 2021-02-18 |
| PROGRESUS | Nuka Estates s.r.o. v likvidaci | 27890104 | 690747 | C 62674 | KS Ostrava | historický |
| PPF | PPF a.s. | 25099345 | 141526 | B 4495 | MS Praha | 1997-01-13 |
| PPF | PPF Group a.s. | 24908487 | 1314907 | B 30605 | MS Praha | **2026-04-01** |
| PPF | PPF Holdings a.s. | 24908151 | 1314906 | B 30604 | MS Praha | **2026-04-01** |
| PPF | PPF reality a.s. | 29030072 | 131474 | B 15918 | MS Praha | 2010-01 |
| PPF | PPF reality 2 s.r.o. | 24654744 | 1313117 | C 444857 | MS Praha | **2026-03-19** |
| PPF | PPF Real Estate s.r.o. | 27638987 | 329576 | C 120743 | MS Praha | před 2010 |
| PPF | PPF RE Consulting s.r.o. | 24225657 | 6048 | C 190405 | MS Praha | před 2013 |
| PPF | PPF Financial Holdings a.s. | 10907718 | 1123873 | B 26382 | MS Praha | 2021-06 |
| PPF | AMALAR HOLDING s.r.o. | 19696477 | 1214040 | C 390328 | MS Praha | 2023-09-06 |

### Objevený další stack dluhopisových SPV Progresu (KRITICKÉ)

| Společnost | IČO | subjektId | Role |
|---|---|---|---|
| **RD Rýmařov Invest Develop a.s.** | 10722696 | 1117603 | Emitent 1. dluhopisového prospektu (2021) |
| **PROGRESUS Bonds s.r.o.** | 14066661 | 1144793 | 100% držitel 3 emitentů dluhopisů; jednatel: **Lukáš Zrůst** |
| **RD Rýmařov Invest III. alpha s.r.o.** | 10800123 | 1120801 | 100% vlastník Nový Zeleneč a.s.; jednatel: Lukáš Zrůst |
| **PROGRESUS RD Rýmařov II a.s.** | 19287518 | 1202423 | Emitent 3. dluhopisového prospektu (2023) |
| **PROGRESUS RD Rýmařov IV a.s.** | 23983922 | 1298146 | **Emitent 5. dluhopisového prospektu (2025-11-21)** — NOVÝ, ne v našem cílovém seznamu |

---

## 2. Matice včasnosti podání — účetní závěrka

Zákonná lhůta: podání musí být ve Sbírce listin do ~8 měsíců od konce účetního období. K datu 2026-04-21 by měly být FY2023 I FY2024 podány u všech entit s kalendářním rokem.

### Strana Progresus

| Společnost | FY2021 | FY2022 | FY2023 | FY2024 | Poznámky |
|---|---|---|---|---|---|
| Nový Zeleneč a.s. (CÍL, 27825981) | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | **Pouze FY2020 ve sbírce.** Poslední podání: 2024-08 — pouze rozhodnutí jediného akcionáře (ne ÚZ). **FY2021-2024 vše po lhůtě.** |
| PROGRESUS Group a.s. (10978216, ručitel dluhopisů) | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | ✅ 2026-02-03 | Pouze FY2024 **konsolidovaná** podána (2026-02). Žádné samostatné FY21/22/23 — masivní mezera u ručitele dluhopisů. |
| PROGRESUS invest holding s.r.o. (09932836) | ✅ 2023-05 | ✅ 2023-11 | ✅ 2026-02 | ✅ 2026-02 | FY23+FY24 podány společně 2026-02-10 — obě po lhůtě (FY23 byla splatná ~2024-08). |
| Progresus invest holding core a.s. (13995758) | n/a | ✅ 2023-04 (ÚZ k 31.3.2022) | ❌ CHYBÍ | ❌ CHYBÍ | Krátké účetní období do 2022-03-31 pouze; žádné FY2023/2024. |
| **PROGRESUS RD Rýmařov III a.s.** (21515841, **aktivní emitent dluhopisů**) | n/a | n/a | n/a | ❌ CHYBÍ | **NIKDY nepodány žádné účetní závěrky.** Entita založena 2024-04-27. FY2024 výkazy za krátké období splatné. |
| **PROGRESUS RD Rýmařov a.s.** (17053161, **aktivní emitent dluhopisů**) | n/a | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | **NIKDY nepodány žádné účetní závěrky.** Entita založena 2022-04-19. FY2022/23/24 vše po lhůtě. **Potvrzuje předchozí zjištění, že RD Rýmařov nemá veřejně dostupné účty.** |
| RD Rýmařov Invest Holding a.s. (09963758) | ✅ 2025-03 | ✅ 2025-03 | ✅ 2025-03 | ❌ CHYBÍ | FY21-23 vše podáno tentýž den (2025-03-13) = retroaktivní dohánění. FY24 po lhůtě. |
| Nuka Estates s.r.o. v likvidaci (27890104) | — | — | — | — | Poslední FY2016. Od té doby žádná podání; v likvidaci. |

### Objevený další stack dluhopisových SPV Progresu

| Společnost | FY2021 | FY2022 | FY2023 | FY2024 | Poznámky |
|---|---|---|---|---|---|
| **RD Rýmařov Invest Develop a.s.** (10722696, emitent 1. prospektu) | ✅ 2025-03 | ✅ 2025-03 | ✅ 2025-03 | ❌ CHYBÍ | FY21-23 vše podáno tentýž den 2025-03-13 (retroaktivně). FY24 po lhůtě. |
| **PROGRESUS RD Rýmařov II a.s.** (19287518, emitent 3. prospektu) | n/a | n/a | ❌ CHYBÍ | ❌ CHYBÍ | **NULA účetních závěrek.** Dluhopisy umístěny 2023-2024. |
| **PROGRESUS RD Rýmařov IV a.s.** (23983922, emitent 5. prospektu) | n/a | n/a | n/a | n/a | Založena 2025-11-21; 7 dluhopisových tranší umístěno v únoru 2026 — **emitovala dluh, než byla splatná její první závěrka**. |
| **PROGRESUS Bonds s.r.o.** (14066661, holdingové SPV) | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | **NIKDY žádné ÚZ.** Drží 3 emitentní a.s. dluhopisů. |
| **RD Rýmařov Invest III. alpha s.r.o.** (10800123, drží Nový Zeleneč a.s.) | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | ❌ CHYBÍ | **NIKDY žádné ÚZ.** Přímý mateřský subjekt cílové společnosti. |

### Strana PPF

| Společnost | FY2021 | FY2022 | FY2023 | FY2024 | Poznámky |
|---|---|---|---|---|---|
| PPF a.s. (25099345) | ✅ 2022-08 | ✅ 2023-09 | ✅ 2024-07 | ✅ 2025-07 + konsolidovaná 2026-01 | Včas. **51 podání ÚZ, 42 výročních zpráv, 43 zpráv auditora od 2009**. Příkladné. |
| PPF Group a.s. (24908487, NOVÁ 2026-04-01) | n/a | n/a | n/a | n/a | 20 dnů stará. Žádná podání očekávána. |
| PPF Holdings a.s. (24908151, NOVÁ 2026-04-01) | n/a | n/a | n/a | n/a | 20 dnů stará. Žádná podání očekávána. |
| PPF reality a.s. (29030072) | ✅ 2022-06 | ✅ 2023-06 | ✅ 2024-06 | ✅ 2025-06 | Včas každý rok. 14 ÚZ, 3 VZ, 7 zpráv auditora. |
| PPF reality 2 s.r.o. (24654744, NOVÁ 2026-03-19) | n/a | n/a | n/a | n/a | 33 dnů stará. Jednatel **Jiří Tošek** (CEO PPF RE). Vlastník: PPF CYPRUS RE MANAGEMENT LIMITED (Nicosia, HE 251908). |
| PPF Real Estate s.r.o. (27638987) | ✅ 2022-07 | ✅ 2023-07 | ✅ 2024-06 | ✅ 2025-07 + konsolid 2026-01 | Včas. 25 ÚZ, 21 VZ, 23 auditor. |
| PPF RE Consulting s.r.o. (24225657) | ✅ 2022-06 | ✅ 2023-05 | ✅ 2024-04 | ✅ 2025-03 | Včas. 14 ÚZ. |
| PPF Financial Holdings a.s. (10907718) | ✅ 2022-12 | ✅ 2023-07/12 | ✅ 2024-04/12 | ✅ 2025-07/12 | Včas. Duální podání (samostatná + konsolidovaná). |
| AMALAR HOLDING s.r.o. (19696477) | n/a | n/a | ✅ 2024-07 (období 2023-09-06..12-31) | ✅ 2025-12 konsolidovaná | Obě včas. Pouze 2 podání celkem (entita 2023). |

---

## 3. Materiální fakta po jednotlivých entitách

### CÍL — Nový Zeleneč a.s. (IČO 27825981)

- **Sídlo**: Krapkova 452/38, Nová Ulice, 779 00 **Olomouc** — *nikoli Zeleneč*. Olomouc je legální kancelář administrátora Progresu; fyzický 42ha projekt je v Zelenči poblíž Prahy (potvrzeno přes CENIA EIA případ EIA_STC2258, kde investorem = toto IČO).
- **Základní kapitál**: 2 000 000 CZK (20 x 100 000 akcie na jméno, listinné). Drobný pro 42ha projekt.
- **Jediný akcionář**: **RD Rýmařov Invest III. alpha s.r.o.** (IČO 10800123) — SPV na adrese U Sluncové 666/12a, Karlín, Praha 8.
- **Akcionář vlastníka**: PROGRESUS Developments s.r.o. (IČO 14148978). Tedy řetězec vlastnictví cíl ← III. alpha ← Developments ← ... (≥4 vrstvy).
- **Naposled podaná ÚZ**: FY2020 (2021-06-28). **FY2021, 2022, 2023, 2024 vše CHYBÍ** ve Sbírce listin.
- **Jediná aktivita 2024**: rozhodnutí jediného akcionáře z 2024-08-30.
- **Historická stopa**: Entita původně u B 14700/MS Praha; rozdělena (projekt rozdělení) 2021-05-21, reorganizována pod KS Ostrava.
- **Nikdy nebyla podána zpráva auditora.**

### Vehikly emitentů dluhopisů (5 aktivních prospektů, 4 emitenti BEZ ÚZ)

| Prospekt # | Emitent | IČO | Schválení ČNB | Umístěné dluhopisy | Podaná ÚZ? |
|---|---|---|---|---|---|
| 1. | RD Rýmařov Invest Develop a.s. | 10722696 | 2021-06-29 | 18 tranší | **Ano** — FY21-23 podány 2025-03-13 (retroaktivně hromadně). FY24 chybí. |
| 2. | PROGRESUS RD Rýmařov a.s. | 17053161 | 2022-07-04 | 22 tranší | **NIKDY ŽÁDNÉ** |
| 3. | PROGRESUS RD Rýmařov II a.s. | 19287518 | 2023-08-10 | 15 tranší | **NIKDY ŽÁDNÉ** |
| 4. | PROGRESUS RD Rýmařov III a.s. | 21515841 | 2024-12-18 | 7 tranší leden 2025 | **NIKDY ŽÁDNÉ** |
| 5. | **PROGRESUS RD Rýmařov IV a.s.** | **23983922** | **2026-01-28** | **7 tranší únor 2026** | Entita vznikla 2025-11-21. Umístila dluhopisy před uzavřením prvního účetního období. |

**Agregovaný strop schváleného dluhopisového programu**: Předchozí zjištění „~1 mld. CZK" bylo nízké. Z prospektů schválených ČNB: 1.=3 mld. CZK, 2.=3 mld. CZK, 3.=800 mil., 4.=800 mil., 5.=zde nezveřejněno. **Kapacita programu ≥ ~7,6 mld. CZK.** Skutečně umístěno dle dluhopisar.cz: 68 tranší (typické velikosti 20-100 mil. CZK + některé EUR). Konzervativní odhad zůstatku: **2-3 mld. CZK** napříč emitentními SPV — **ověřit přesnou aktuální jistinu z ČNB CRR / dodatků k dluhopisovým prospektům**.

- Všichni 4 současní emitenti sdílí společného člena statutárního orgánu: **JUDr. Lukáš Zrůst, BA (Hons), LL.M., MBA** (Kabátníkova 219/7, Ponava, 602 00 Brno). Známý český insolvenční správce. 50/50 vlastník s Lukášem Foralem (dle dluhopisar).
- PROGRESUS Group a.s. (10978216) je **křížovým ručitelem** těchto dluhopisů. Její konsolidovaná FY24 ÚZ podaná 2026-02-03 je **jediným** konsolidovaným pohledem na agregovaný dluhopisový dluh. **Tento dokument získat naléhavě** — je to jediný nejdůležitější finanční dokument tohoto DD.
- **POTVRZENÝ RED FLAG**: „RD Rýmařov nezveřejňoval výsledky" → částečně potvrzeno. Invest Develop a.s. podala FY21-23 retroaktivně v březnu 2025; pozdější 4 emitenti dluhopisů (RD Rýmařov a.s., II, III, IV) **nikdy nepodali žádné účetní závěrky** přesto, že umístili veřejné dluhopisy.

### Nové entity strany PPF (restrukturalizace 2026-03/04)

- **PPF Group a.s.** (24908487, B 30605) vznikla **2026-04-01**. Základní kapitál **541 645 EUR** (541 645 akcie x 1 EUR). Akcie jsou na jméno, listinné, s **omezením převodu vyžadujícím souhlas valné hromady**. Pouze zakladatelská listina viditelná — *žádná akcionářská smlouva* zatím ve Sbírce listin.
- **PPF Holdings a.s.** (24908151, B 30604) vznikla **2026-04-01**. Základní kapitál **82 017 EUR** (12 618 akcie x 6,50 EUR). Stejné omezení převodu akcií. Stejná adresa (Evropská 2690/17, Praha 6).
- **PPF reality 2 s.r.o.** (24654744, C 444857) vznikla **2026-03-19**. Vklad 1 000 CZK (shellová společnost). Jednatel: **Jiří Tošek** (13.5.1974, Unhošť) — CEO PPF RE a dle MASTER-FINDINGS vedoucí transakce. **Jediný společník: PPF CYPRUS RE MANAGEMENT LIMITED** (Nicosia, HE 251908) — kyperský vehikl. **Toto s.r.o. se jeví jako účelově vytvořené akviziční vehikulum pro transakci Nový Zeleneč.**
- **AMALAR HOLDING s.r.o.** (19696477, vehikulum rodiny Kellnerové): jak FY23 (krátké období 2023-09-06..12-31), tak FY24 konsolidovaná podány včas. Auditor: **BDO** (dle textu řádku SL — jediná shoda Big-4/BDO nalezená napříč všemi SL stránkami 17 entit). **Žádná akcionářská smlouva viditelná ve Sbírce listin.** Rozdělení vdova + 3 dcery není ve veřejném OR — pravděpodobně v soukromé společenské smlouvě s.r.o. neuložené (v ČR ne povinné).

### Materiální podmíněné závazky / pokračování činnosti / propojené osoby (z hlaviček řádků SL — plný PDF review zablokován)

- PPF a.s. podává **konsolidovanou ÚZ** každý rok — verze 2024 (SL155, 231 stran, 2026-01-07) je veřejně dostupná a bude obsahovat plné zveřejnění RPT (related party transactions / propojené osoby) v rámci skupiny.
- PPF reality a.s., PPF Real Estate s.r.o., PPF Financial Holdings a.s. — všechny ročně podávají zprávu o vztazích.
- **PROGRESUS Group a.s.** FY24 konsolidovaná (SL5, 72 stran, 2026-02-03) je jediný dostupný konsolidovaný pohled na realitní a dluhopisové podnikání Progresu. **Získat a řádkově projít před jakoukoli nabídkou.**

---

## 4. Mapa auditorů

| Entita | Auditor (identifikováno) | Zdroj identifikace |
|---|---|---|
| PPF a.s. | **KPMG Česká republika Audit, s.r.o.** | Předchozí publikovaná VZ 2022 odkazuje KPMG; KPMG uvedeno v rejstříku auditorů KAČR; vzor konzistentní napříč 43 zprávami auditora PPF a.s. 2010–2024. *Ověřit otevřením konsolidované VZ 2024 (dokument 89499868).* |
| PPF Financial Holdings, PPF Real Estate, PPF RE Consulting, PPF reality | *Předpokládá se KPMG* (skupinově) | Stejný vzor podavatele; potvrdit otevřením vzorku zprávy auditora 2024. |
| AMALAR HOLDING s.r.o. | **BDO** | Přímá textová shoda v indexové stránce Sbírky listin. |
| PROGRESUS Group a.s. FY24 konsolidovaná | **NEZNÁMÉ — vyžaduje PDF review** | Jednotlivé podání 2026-02-03, 72 stran. |
| RD Rýmařov Invest Develop a.s. FY21-23 | **NEZNÁMÉ — vyžaduje PDF review** | Tři zprávy auditora podány 2025-03-13. |
| Všechny ostatní SPV emitentů dluhopisů | **NIKDY NEPODÁNA ZPRÁVA AUDITORA** | Nula podání v SL. |

**Mezera**: Justice.cz neposkytuje přímé URL ke stažení PDF ve svém veřejném HTML; tok stažení používá prohlížeč. K potvrzení auditorů u 3-5 buněk „Ověřit" výše je třeba stáhnout PDF přes autentizovaný účet nebo zrcadlo WebArchive; 72stranná konsolidovaná VZ PROGRESUS Group 2024 je prioritní.

---

## 5. Papírová stopa restrukturalizace

### Strana Progresus (budování 2021–2024)

| Datum | Událost |
|---|---|
| 2021-02-18 | PROGRESUS invest holding s.r.o. + RD Rýmařov Invest Holding a.s. obě založeny tentýž den — paralelní vytvoření top-co. |
| 2021-03-31 | RD Rýmařov Invest Develop a.s. (1. emitent dluhopisů) založena. |
| 2021-04-30 | RD Rýmařov Invest III. alpha s.r.o. (jediný akcionář Nový Zeleneč) založena. |
| 2021-05-21 | **Projekt přeměny (rozdělení odštěpením)** na Nový Zeleneč a.s. — 20 stran. Cíl byl vyčleněn z původní skupiny. |
| 2021-06-24 | PROGRESUS Group a.s. (ručitel dluhopisů) založena. |
| 2021-09-07 | Progresus invest holding core a.s. založena. |
| 2021-12-23 | PROGRESUS Bonds s.r.o. (mezizdrojový držitel pro emitenty dluhopisů) založena. |
| 2022-04-19 | PROGRESUS RD Rýmařov a.s. (2. emitent dluhopisů) založena. |
| 2023-02-17 až 2023-04-01 | Projekt fúze + projekt přeměny (rozdělení odštěpením) v Progresus invest holding core — další reorganizace. |
| 2023-04-26 | PROGRESUS RD Rýmařov II a.s. (3. emitent) založena. |
| 2024-04-27 | PROGRESUS RD Rýmařov III a.s. (4. emitent) založena. |
| 2025-11-21 | **PROGRESUS RD Rýmařov IV a.s. (5. emitent) založena.** |

### Strana PPF (budování 2026-03/04)

| Datum | Událost |
|---|---|
| 2026-03-19 | PPF reality 2 s.r.o. založena (jednatel Jiří Tošek; jediný společník PPF CYPRUS RE MANAGEMENT LIMITED, Nicosia). |
| 2026-04-01 | PPF Group a.s. + PPF Holdings a.s. založeny tentýž den. Různé základní kapitály (541 645 EUR vs 82 017 EUR). |

---

## 6. Red flags — ověřené / vyvrácené

| Předchozí zjištění | Stav po auditu | Důkaz |
|---|---|---|
| RD Rýmařov nezveřejnil výsledky za poslední rok | **POTVRZENO (horší než uvedeno)**: 4 z 5 SPV emitentů dluhopisů NEMAJÍ vůbec žádnou ÚZ. 5. (RD Rýmařov IV) umístil dluhopisy před uzavřením prvního FY. 1. emitent (Invest Develop) podal FY21-23 retroaktivně v březnu 2025. | SL stránky pro všech 5 IČO emitentů (raw/progresus/sl-*.html) |
| ~1 mld. CZK agregovaný dluhopisový dluh | **PODHODNOCENO**: Kapacita programu ≥7,6 mld. CZK napříč 5 schválenými prospekty; 68 umístěných tranší; zůstatek pravděpodobně 2-3 mld. CZK. | dluhopisar.cz/emitenti/rd-rymarov; schválení prospektů ČNB |
| CASPER 800M vs 229M | **Z tohoto auditu nelze řešit** — ani entita „Casper" ani číslo 800/229 se nevyskytuje na žádné ze 17 cílových OR stránek. Vyžaduje vlastní řešení entity (předchozí DD artefakt). | n/a |
| Adresy Jirásková/Stoessel označeny | Zde netestováno — vyžaduje samostatné vyhledávání osob-adres v záznamech statutárních orgánů PPF. | Zaznamenáno pro samostatný úkol |
| Stanovy / akcionářská smlouva PPF Group a.s. (nová 2026-04-01) | **Pouze zakladatelská listina / stanovy v SL.** Žádná akcionářská smlouva veřejně podána. Klauzule omezení převodu akcií (článek 6 stanov) vyžaduje souhlas valné hromady — konzistentní s úzce drženou rodinnou kontrolou. | detail-24908487.html |
| Akcionářská smlouva AMALAR (vdova Kellnerová + 3 dcery) | **Veřejně neuložena.** Dohody společníků s.r.o. v ČR (dohoda společníků) NEJSOU povinné k uložení. Pouze 2 podání celkem: ÚZ FY23 + konsolidovaná ÚZ FY24 (BDO). | sl-19696477.html |
| Podání PPF Real Estate Holding B.V. (nizozemská) | Mimo rozsah českého OR. Vyžaduje výpis z KVK. | — |

### NOVÉ red flags zjištěné v tomto auditu

1. **Nový Zeleneč a.s. nepodal ŽÁDNÉ účetní závěrky za FY2021-2024** (4 roky podání po lhůtě). Zákonné porušení. Riziko penalizace a signál opacity.
2. **Sídlo Nového Zeleneče je Olomouc** — nikoli Zeleneč. Právní domicil je administrativní kancelář Progresu, ne projektová lokalita. Administrativní/daňová volba; stojí za zmínku pro doručování.
3. **Jediný akcionář Nového Zeleneče a.s. NENÍ Progresus Group** — je to RD Rýmařov Invest III. alpha s.r.o., 5patrový SPV řetězec pod Lukášem Zrůstem. PPF bude potřebovat due diligence na cestu převodu akcií nebo aktiv právě po tomto řetězci.
4. **PROGRESUS Group a.s. (ručitel dluhopisů) podal pouze konsolidovanou FY24** — žádné samostatné výkazy za FY21/22/23. Toto je nejmateriálnější dostupný finanční dokument na straně Progresu a musí být prioritou pro review akvírujícího.
5. **5. dluhopisový prospekt (RD Rýmařov IV)** byl schválen 2026-01-28 — **PO tom, co bylo dle předchozích session intel známé, že je transakce s PPF na stole**. Emitování čerstvých dluhopisů během aktivních M&A jednání o podkladové zástavě je potenciální obavou kupujícího.
6. **PPF reality 2 s.r.o. (nová 2026-03-19)** má **kyperského společníka (PPF CYPRUS RE MANAGEMENT LIMITED, HE 251908)** — konzistentní s offshore holdingovým vzorcem PPF, ale pozoruhodné pro daňové/regulatorní post-close strukturování.
7. **Pouze 1 explicitní shoda Big-4** napříč všemi 17 indexovými stránkami SL (BDO u AMALAR). Jména auditorů jsou uvnitř PDF, která nelze přímo linkovat přes veřejné UI. Formální ověření auditora vyžaduje stažení PDF přes účet nebo alternativní archiv.
8. Společný statutární orgán: **JUDr. Lukáš Zrůst** je jediný jednatel PROGRESUS Bonds s.r.o. (vlastník 3 emitentů dluhopisů) I RD Rýmařov Invest III. alpha s.r.o. (vlastník cíle). Vysoká koncentrace rizika na jednoho jednotlivce; potřeba kovenantu governance/key-person.

---

## 7. Prioritní mezery (podání nepřímo přístupná v této session)

1. **PROGRESUS Group a.s. konsolidovaná VZ 2024** (B 26471/SL5, 72 stran, podáno 2026-02-03) — *jediný nejhodnotnější dokument v DD na straně Progresu*. Stáhnout PDF a extrahovat: identitu auditora, výnosy, EBITDA, jistinu dluhopisového dluhu, zástavní rozvrh, going concern poznámku, RPT, ručení.
2. **Nový Zeleneč a.s. stanovy** (B 14700/SL9, 2019-10-23) a **projekt přeměny 2021** (SL11, 20 stran) — k vystopování přesného odštěpení 42ha pozemkového fondu.
3. **PROGRESUS Bonds s.r.o. úplný výpis** (subjektId 1144793) — vystopovat všechny historické změny společníků.
4. **Dodatky k dluhopisovým prospektům** pro všech 5 emitentů — nejsou v OR (podány u ČNB). Zdrojovat z progresusinvest.cz a databáze ČNB k získání aktuálního zůstatku jistiny per ISIN.
5. **Identita auditora** pro PROGRESUS Group 2024 konsolidovaná, entity PPF strany 2024 (pravděpodobně KPMG), RD Rýmařov Invest Develop FY21-23 retroaktivně.
6. **Zakladatelská listina PPF Group a.s. + PPF Holdings a.s.** (úplný text) — k potvrzení, zda nějaká klauzule akcionářské smlouvy nebo trustové struktury odkazuje na nástupnictví Kellner.
7. **Dokumenty k registraci společníka PPF reality 2 s.r.o.** — potvrdit vlastnický řetězec PPF CYPRUS RE MANAGEMENT LIMITED a zda vede k PPF Group N.V. (Amsterdam) nebo k paralelnímu vehiklu Kellnerová.
8. **Křížová kontrola osobních adres** (Jirásková/Stoessel) — označeno dříve; v tomto auditu neřešeno; vyžaduje rejstřík-$osoba lookup.

### Metodologická poznámka
Veřejné UI Justice.cz zatemňuje přímé URL ke stažení PDF. Endpoint `vypis-sl-detail` vrací HTML, ne PDF. Plnotextová identifikace auditora by vyžadovala buď (a) autentizovaný účet (ePodání), (b) službu třetí strany (kurzy.cz / podnikatel.cz republikuje některá PDF), nebo (c) přímé výpisy z databáze prospektů ČNB pro dokumenty související s dluhopisy. **Adaptér Prismatic justice.ex aktuálně nemá cestu stažení PDF a měl by být rozšířen, pokud má řádková kontrola tohoto DD škálovat.**

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 03-financial/sbirka-listin-audit.md#6-red-flags-overene-vyvracene (9×)
- [RED-FLAGS.md](../RED-FLAGS.md) — 03-financial/sbirka-listin-audit.md#3 (8×)
- [03-financial/raw/README.md](./raw/README.md) — 📑 Audit Sbírky listin (5×)
- [03-financial/bond-stack.html](./bond-stack.html) — sbirka-listin-audit.md (2×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `03-financial/sbirka-listin-audit.md` (2×)
- [02-entity/CUZK-PAID-PULL-REQUEST.md](../02-entity/CUZK-PAID-PULL-REQUEST.md) — 03-financial/sbirka-listin-audit.md
- [03-financial/UZ-BACKFILE-PREP.md](./UZ-BACKFILE-PREP.md) — sbirka-listin-audit.md
- [04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md](../04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md) — 03-financial/sbirka-listin-audit.md
- [BACKLINKS-AUDIT.md](../BACKLINKS-AUDIT.md) — 03-financial/sbirka-listin-audit.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `03-financial%2Fsbirka-listin-audit.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
