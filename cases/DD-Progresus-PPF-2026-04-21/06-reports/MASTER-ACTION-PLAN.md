# HLAVNÍ AKČNÍ PLÁN — Project Mycelium

**Transakce**: Progresus → PPF | Nový Zeleneč 42 ha (k.ú. Mstětice 792764)
**Vehikul kupce**: PPF reality 2 s.r.o. (IČO 24654744)
**Cíl prodávajícího**: Nový Zeleneč a.s. (IČO 27825981) přes RD Rýmařov Invest III. alpha s.r.o. (IČO 10800123)
**Verze**: 1.0 | **Datum**: 2026-04-21 | **Vlastník**: DD desk Progresu na straně prodávajícího (operativní lead: JUDr. Lukáš Zrůst)
**Autor**: Tomáš Korčák (Discovery Lead & Chief Solution Architect, Able Group)
**Klasifikace**: DŮVĚRNÉ — Pracovní produkt na straně prodávajícího
**Nahrazuje**: ad-hoc akční seznamy vložené do MASTER-DD-REPORT §12, PPF-PLAYBOOK §VI/§XI, DATAROOM-INDEX Část 3, DANCORE-FORENSIC §10, cuzk-cadastre §9, sbirka-listin §7

**Toto je JEDINÝ ZDROJ PRAVDY pro denní/týdenní DD přípravu. Všechny předchozí worklisty jsou nahrazené.**

---

## Sekce 1 — PŘEHLED

### 1.1 Akce celkem (baseline 2026-04-21)

| Tier | Počet | Okno | Tvrdý deadline |
|------|-------|--------|---------------|
| **P0** (kritické pro transakci) | 32 | 72 hodin | **2026-04-28** |
| **P1** (před otevřením DD) | 42 | 2 týdny | **2026-05-05** |
| **P2** (úplnost) | 58 | 4 týdny | **2026-05-19** |
| **CELKEM** | **132** | 5 týdnů | 2026-05-19 |

### 1.2 Pokrok (start 2026-04-21)

| Metrika | Hodnota |
|--------|-------|
| % dokončeno dnes | **0 %** (baseline den) |
| P0 v procesu | 0 |
| P0 zablokované | 0 |
| Zafixovaný rozpočet | €0 z ~€520 000 |
| Skóre připravenosti | **55 %** (post Pass-4 zjištění; cíl ≥90 % pro první call s PPF) |

### 1.3 Nadcházející milníky / pevná data

| Datum | Událost | Vlastník |
|------|-------|-------|
| 2026-04-23 | ČÚZK dálkový přístup účet otevřen + LV 927 + LV 1326 staženo | Korčák + property counsel |
| 2026-04-24 | DANCORE plný defenzivní brief v1 doručen | Externí litigation counsel |
| 2026-04-24 | PROGRESUS Group FY24 konsolidovaná VZ deep-dive memo | Heyduk (CFO) |
| 2026-04-25 | Externí (ne-Aegis) counsel angažován — KŠB / JŠK / White & Case | Zrůst |
| 2026-04-26 | Nuka Estates + MARSEA MIA + Lébr dopisy o uvolnění vyžádány | Pelikán + externí |
| 2026-04-28 | **P0 BRÁNA** — všech 32 P0 položek dokončeno nebo explicitně odloženo s mitigací | Zrůst |
| 2026-05-05 | **P1 BRÁNA** — plný dataroom tier-1 naplněn; retroaktivní audity podány | CFO + auditor |
| 2026-05-12 | Adverzní red team review na straně prodávajícího | Externí counsel |
| 2026-05-14 | **Zrůstův 8hodinový blok nácviku** (hot-seat drill Q1-Q20 z PPF Scénáře) | Plný tým |
| 2026-05-19 | **BRÁNA PŘIPRAVENOSTI** — 95+ % připravenosti, finální review dataroomu | Zrůst + Foral |
| 2026-05-20 do 2026-05-27 | Okno prvního zapojení s PPF (rozsah + exkluzivita + NDA) | Zrůst |
| 2026-06-02 do 2026-06-29 | PPF formální DD sprint (200-400 požadavků) | Plný tým |
| 2026-07-14 do 2026-07-27 | Okno vyjednávání SPA | Externí counsel + Zrůst |
| 2026-07-28 do 2026-08-03 | Cílové okno podpisu | Všichni |

### 1.4 Legenda statusu

| Vlajka | Význam |
|------|---------|
| ⬜ NEZAHÁJENO | Není odstartováno |
| 🟡 V PROCESU | Aktivní práce |
| 🔴 ZABLOKOVÁNO | Závislost nesplněna nebo externí zpoždění |
| 🟢 DOKONČENO | Dodatelný výstup vytvořen a přijat |
| ⚠️ ODLOŽENO | Záměrně de-prioritizováno; zdůvodnění v poznámkách |

---

## Sekce 2 — P0 AKCE (72 hodin / splatné 2026-04-28)

**Kritérium brány**: Všech 32 položek musí být buď 🟢 DOKONČENÉ nebo explicitně 🟡 V PROCESU s důvěryhodnou cestou k uzavření před prvním callem s PPF.

| ID | Akce | Vlastník | Dodatelný výstup | Závisí na | Status | Cena (€) | Splatné | Zdroj |
|----|--------|-------|-------------|------------|--------|----------|-----|--------|
| **P0-01** | DANCORE plný spis sporu — spis **30 Co 228/2019-1538** KS Praha, všechna 4 procesní kola + odvolání 2024-11-18 | Externí CZ litigation counsel (KŠB / JŠK) | PDF spis + memo procesní chronologie | — | ⬜ | 8 000 | 2026-04-24 | DATAROOM P0-01; DANCORE-DOSSIER §10 |
| **P0-02** | DANCORE Nevada SoS plný entity záznam — E0353972015-2 managing member + registered agent + roční podání | US counsel (NV-licensovaný) | NV SoS certifikovaný extrakt | — | ⬜ | 1 500 | 2026-04-24 | DANCORE §10 #1 |
| **P0-03** | PACER pull — **Dancore LLC v. Zika, 2:18-cv-01136** (D. Nev.) — kompletní spis včetně žaloby, rozhodnutí, právního zástupce | US counsel | PACER spis + memo | P0-02 | ⬜ | 2 500 | 2026-04-25 | DANCORE §10 #3 |
| **P0-04** | DANCORE FinCEN BOI přístup — posoudit subpoena / OFAC / CTA exemption status | US counsel | Memo právního stanoviska | P0-02 | ⬜ | 3 000 | 2026-04-25 | DANCORE §1.3, §1.4 |
| **P0-05** | PROGRESUS Group a.s. FY24 konsolidovaná VZ — plná 72stránková PDF extrakce + memo po řádcích (auditor ID, výnosy, EBITDA, dluhopisový dluh, zástava, RPT, záruky, pokračování činnosti (pokračování činnosti)) | Heyduk (CFO) + externí forenzní účetní | Interní deep-dive memo | — | ⬜ | 5 000 | 2026-04-24 | DATAROOM P0-03; sbirka-listin §7 #1 |
| **P0-06** | **Otevření účtu ČÚZK dálkový přístup** — pro pro-DD použití | Pelikán + property counsel | Aktivní účet s přístupovými údaji | — | ⬜ | 2 000 | 2026-04-23 | MASTER §12; cuzk-forensics §9 P0-1 |
| **P0-07** | **LV 927 Mstětice 792764** plný výpis — sekce A/B/B1/C/D/E/F | Property counsel | Výpis LV + mapa zástav/věcných břemen | P0-06 | ⬜ | 500 | 2026-04-23 | DATAROOM C.1; cuzk-forensics P0-1 |
| **P0-08** | **LV 1326 Mstětice 792764** plný výpis | Property counsel | Výpis LV | P0-06 | ⬜ | 500 | 2026-04-23 | DATAROOM C.1; cuzk-forensics P0-2 |
| **P0-09** | ČÚZK dotaz dle vlastníka — **Nový Zeleneč a.s. 27825981** všechny držené LV | Property counsel | Komplexní rozvrh parcel | P0-06 | ⬜ | 800 | 2026-04-24 | cuzk-forensics P0-3 |
| **P0-10** | ČÚZK dotaz dle vlastníka — **RD Rýmařov Invest III. alpha 10800123** všechny držené LV | Property counsel | Rozvrh parcel | P0-06 | ⬜ | 800 | 2026-04-24 | cuzk-forensics P0-4 |
| **P0-11** | ČÚZK dotaz dle vlastníka — **Nuka Estates 27890104** jakékoli reziduální LV | Property counsel | Potvrzení čistého stavu | P0-06 | ⬜ | 500 | 2026-04-24 | cuzk-forensics P0-5 |
| **P0-12** | ČÚZK dotaz dle vlastníka — **MARSEA MIA 03454029** jakékoli aktuální LV držené jako zajištění | Property counsel | Ověření splacení zástavy | P0-06 | ⬜ | 500 | 2026-04-24 | cuzk-forensics P0-6 |
| **P0-13** | **Nový Zeleneč a.s. FY2021-2024 retroaktivní audit — pověřovací dopis podepsán + auditor začíná** | Heyduk + nový auditor (Big-4 nebo BDO) | Podepsané pověření | — | ⬜ | 80 000 | 2026-04-24 | DATAROOM P0-04, B.1 RF-27 |
| **P0-14** | Master tabulka dluhopisů — 5 prospektů, 68 tranší, ISIN-po-ISIN nesplaceno, CoC kovenanty, matice cross-default | Externí bond counsel + treasury skupiny | Konsolidovaná master tabulka + křížový přehled | — | ⬜ | 15 000 | 2026-04-26 | DATAROOM P0-05, B.5 RF-28 |
| **P0-15** | **Dopis o uvolnění likvidátora Nuka Estates** — Pavlína Zdařilová potvrzuje žádné nevypořádané nároky na 42 ha | Pelikán + externí property counsel | Podepsaný dopis o uvolnění | P0-07, P0-08 | ⬜ | 2 000 | 2026-04-26 | DATAROOM P0-08, C.9 RF-10 |
| **P0-16** | **MARSEA MIA dopis o uvolnění zástav** + LV potvrzení žádného zástavního práva smluvního | Pelikán + MARSEA MIA counsel | Podepsaný dopis o uvolnění | P0-07, P0-08, P0-12 | ⬜ | 2 500 | 2026-04-26 | DATAROOM P0-09, C.9 RF-11 |
| **P0-17** | **Lébr / Ravantino dopis o oddělení** — žádné reziduální nároky, žádný JV, žádný earn-out doplatek, žádné předkupní právo, závazek aktualizace webu | Pelikán + Lébr counsel | Podepsaný dopis o oddělení | — | ⬜ | 3 000 | 2026-04-28 | DATAROOM P0-10, D.4 RF-12 |
| **P0-18** | Jednostránkový diagram struktury skupiny (≥5 vrstev k UBO) | Dvořák (M&A lead) | Diagram schválený Zrůstem | — | ⬜ | — | 2026-04-23 | DATAROOM P0-11, A.6 |
| **P0-19** | DANCORE memorandum právní obhajoby — pravděpodobnost zvrácení titulu + §984 stress-test argumentu dobré víry | Externí CZ litigation counsel | Memo připravené pro představenstvo | P0-01 | ⬜ | 15 000 | 2026-04-28 | DATAROOM P0-12, DANCORE §5 |
| **P0-20** | Memo o expozici penále za pozdní podání — FÚ + Ministerstvo spravedlnosti riziko pro NZ a.s. + 5 delikventních subjektů | Externí tax counsel | Písemné memo s rezervní kalkulací | — | ⬜ | 5 000 | 2026-04-25 | DATAROOM P0-13 |
| **P0-21** | **Žádost o ČNB §23a / vyjasňující dopis** — buď (a) potvrzení, že PPF banka není věřitelem, nebo (b) §23a autorizační cesta | Externí banking / bond counsel | Písemná odpověď ČNB | — | ⬜ | 8 000 | 2026-04-28 | DATAROOM P0-14; 08-comms/CNB-23A-CLEARANCE-REQUEST.md |
| **P0-22** | Memo o reorganizaci skupiny 2023-04 → 2024-01 — 9 přesunů dceřinek, daňové + věřitelské implikace | Externí tax + corporate counsel | Memo připravené pro představenstvo | — | ⬜ | 12 000 | 2026-04-28 | DATAROOM P0-15, A.6 RF-14 |
| **P0-23** | **Najmout externí (ne-Aegis) M&A counsel** — adverzní recenzent druhého stanoviska | Zrůst | Podepsaný pověřovací dopis (KŠB / JŠK / White & Case) | — | ⬜ | 50 000 (retainer) | 2026-04-25 | MASTER §12 Týden 3; PPF-PLAYBOOK §VI |
| **P0-24** | **Najmout Big-4 firmu pro přípravu finanční DD** (EY nebo Deloitte preferováno dle preference PPF) | Heyduk + Zrůst | Podepsané pověření | P0-23 | ⬜ | 60 000 (retainer) | 2026-04-25 | MASTER §12 Týden 3 |
| **P0-25** | **Najmout environmentálního poradce** — Phase I + soil/groundwater na 42 ha | Dvořák | Podepsané pověření | — | ⬜ | 25 000 | 2026-04-28 | MASTER §12 Týden 3; DATAROOM C.4/C.5 |
| **P0-26** | **Indikativní cenová nabídka pojištění titulu** — W&I + specifické vynětí DANCORE | Broker (Marsh / Aon / Willis) | Smluvní rámec | P0-19 | ⬜ | 0 (cenová nabídka) | 2026-04-28 | DANCORE §7.3, §10 #6 |
| **P0-27** | **NDA + návrh exkluzivity finalizován a připraven k odeslání** PPF | Externí M&A counsel | Podpisová kopie | P0-23 | ⬜ | 5 000 (drafting) | 2026-04-28 | 08-comms/NDA-EXCLUSIVITY-DRAFT.md |
| **P0-28** | **Spuštění žádosti o souhlas držitelů dluhopisů** — trustee angažován, materiály žádosti předem připraveny | Externí bond counsel | Návrh žádosti + plán harmonogramu | P0-14 | ⬜ | 20 000 | 2026-04-28 | 08-comms/BONDHOLDER-CONSENT-SOLICITATION.md; MASTER §11.4 |
| **P0-29** | **Stress-test Savills NDA** — potvrdit žádné zveřejnění ocenění Progresu na straně PPF zájemce | Externí counsel | Písemné potvrzení od Savills | — | ⬜ | 2 000 | 2026-04-26 | 08-comms/SAVILLS-NDA-STRESS-TEST-EMAIL.md |
| **P0-30** | **Aegis Law kontrola konfliktu** — formální dopis re planning pověření + jakákoli práce na straně PPF | Pelikán | Písemná certifikace konfliktu Aegis | — | ⬜ | — | 2026-04-25 | DATAROOM D.3 |
| **P0-31** | DANCORE dopis o zveřejnění připraven pro PPF před prvním callem | Externí M&A counsel + litigation counsel | Podpisový dopis | P0-19 | ⬜ | — | 2026-04-28 | 08-comms/DANCORE-DISCLOSURE-LETTER.md |
| **P0-32** | Pořízení dataroom platformy — Ansarada nebo Datasite, 6měsíční okno | Dvořák | Podepsaná SOW + nakonfigurované tenanty | — | ⬜ | 20 000 | 2026-04-26 | DATAROOM Část 4 |

**P0 mezisoučty**:
- **DANCORE cluster**: P0-01, 02, 03, 04, 19, 26, 31 (7 položek)
- **ČÚZK cluster**: P0-06..12 (7 položek) — vše brané za P0-06
- **Finance / Dluhopisový cluster**: P0-05, 13, 14, 20, 28 (5 položek)
- **Dopisy o uvolnění protistran**: P0-15, 16, 17, 30 (4 položky)
- **Pověření / infrastruktura**: P0-23, 24, 25, 27, 32 (5 položek)
- **Ostatní**: P0-18, 21, 22, 29 (4 položky)

**P0 rozpočet celkem**: ≈ €321 600 (z toho retainery pro externí counsel + Big-4 + cenová nabídka pojištění titulu + dataroom = ~€175k jednorázově, audit pověření ~€80k, zbytek forenzika / právní stanoviska)

---

## Sekce 3 — P1 AKCE (2 týdny / splatné 2026-05-05)

| ID | Akce | Vlastník | Dodatelný výstup | Závisí na | Status | Cena (€) | Splatné | Zdroj |
|----|--------|-------|-------------|------------|--------|----------|-----|--------|
| P1-01 | Nový Zeleneč a.s. FY2021-2024 retroaktivní audit — návrh závěrek doručen | Auditor | 4 návrh ÚZ sady | P0-13 | ⬜ | (v P0-13) | 2026-05-05 | DATAROOM P1-01 |
| P1-02 | PROGRESUS RD Rýmařov a.s. (17053161) FY22-24 retroaktivní audit | Auditor | Návrh ÚZ | P0-13 | ⬜ | 30 000 | 2026-05-05 | DATAROOM P1-02 |
| P1-03 | PROGRESUS RD Rýmařov II a.s. (19287518) FY23-24 retroaktivní audit | Auditor | Návrh ÚZ | P0-13 | ⬜ | 25 000 | 2026-05-05 | DATAROOM P1-03 |
| P1-04 | PROGRESUS RD Rýmařov III a.s. (21515841) FY24 retroaktivní audit | Auditor | Návrh ÚZ | P0-13 | ⬜ | 15 000 | 2026-05-05 | DATAROOM P1-04 |
| P1-05 | PROGRESUS Bonds s.r.o. (14066661) FY21-24 retroaktivní audit | Auditor | Návrh ÚZ | P0-13 | ⬜ | 30 000 | 2026-05-05 | DATAROOM P1-05 |
| P1-06 | RD Rýmařov Invest III. alpha s.r.o. (10800123) FY21-24 retroaktivní audit | Auditor | Návrh ÚZ | P0-13 | ⬜ | 20 000 | 2026-05-05 | DATAROOM P1-06 |
| P1-07 | Matice mezipodnikových transakcí — 7letá stopa (mezipůjčky, RPT, záruky, management fee) | Heyduk + externí tax | Excel master + memo | P0-24 | ⬜ | 15 000 | 2026-05-05 | DATAROOM P1-07, B.9 |
| P1-08 | Dokumentace převodních cen — celá česká skupina | Externí tax (EY/Deloitte/PwC/BDO) | TP file | P0-24 | ⬜ | 25 000 | 2026-05-05 | DATAROOM P1-08, F.3 |
| P1-09 | Memo daňového základu — 2021 Lébr → Progresus analýza navýšení | Externí tax | Písemné memo + tabulka základu | — | ⬜ | 8 000 | 2026-05-05 | DATAROOM P1-09, F.5 |
| P1-10 | CASPER / David Štekl / Vitrablok 800M-vs-229M memo o odsouhlasení | Heyduk + externí forenzní účetní | Memo + waterfall exitu | — | ⬜ | 12 000 | 2026-05-05 | DATAROOM P1-10, B.9; PPF-PLAYBOOK Q15 |
| P1-11 | Zrůst atestace informační bariéra (informační bariéra) + Konreo deklarace nepřekrývání | Zrůst + externí compliance | Notářská atestace | — | ⬜ | 5 000 | 2026-05-05 | DATAROOM P1-11, E.4; PPF-PLAYBOOK Q11, Q16 |
| P1-12 | Foral / Michl Quant / Dubai-Nakheel memo o politické expozici + Big-4 AML opinion | Externí reputace/compliance | Písemné memo + AML dopis | — | ⬜ | 18 000 | 2026-05-05 | DATAROOM P1-12, J.2 |
| P1-13 | Kompletní kapitálová struktura (plně rozředěná) — všechny entity skupiny, žádné skryté opce/SAR/ESOP | Dvořák (M&A lead) | Excel + notářská certifikace | — | ⬜ | 3 000 | 2026-04-30 | DATAROOM P1-13, A.2 |
| P1-14 | Zápisy z představenstva / valných hromad — všechny entity skupiny, 5letý dosah | Tajemník | Kniha zápisů | — | ⬜ | 2 000 | 2026-05-05 | DATAROOM P1-14, A.3 |
| P1-15 | Materiály žádosti o souhlas CoC — návrh balíčků setkání pro držitele dluhopisů, všech 5 prospektů | Externí bond counsel | Návrh balíčku žádosti × 5 | P0-14 | ⬜ | 25 000 | 2026-05-05 | DATAROOM P1-15 |
| P1-16 | Phase I environmentální zpráva — 42 ha | Environmentální poradce | Phase I zpráva | P0-25 | ⬜ | (v P0-25) | 2026-05-05 | DATAROOM P1-16, C.4 |
| P1-17 | Soil / groundwater testy — 42 ha | Environmentální poradce | Lab zpráva | P0-25 | ⬜ | (v P0-25) | 2026-05-05 | DATAROOM P1-17, C.5 |
| P1-18 | Plný ARES drill — zbývajících ~75 entit skupiny (nárok „100+ společností") | OSINT / externí | Kompletní rozvrh entit | — | ⬜ | 3 000 | 2026-05-05 | DATAROOM P1-18, A.6 |
| P1-19 | UBO rejstřík extrakt — celá skupina, přes nový režim restricted-access | Pelikán | eSM CSV + certifikace prodávajícího | — | ⬜ | 1 000 | 2026-05-05 | DATAROOM P1-19, A.5 RF-25 |
| P1-20 | Petice Zeleneč 2022 — městský archív pass + spis odpovědi + Frank Bold check | Externí planning counsel | Memo + archívní spis | — | ⬜ | 5 000 | 2026-05-05 | DATAROOM P1-20, C.6 RF-2 |
| P1-21 | Studio Perspektiv „3. místo" vyjasnění — CKA archívní ověření | Externí IP counsel | CKA certifikované umístění + opravené marketingové memo | — | ⬜ | 2 000 | 2026-05-05 | DATAROOM P1-21, D.3, H.4 |
| P1-22 | Aegis Law pověřovací dopis (redigovaný) | Pelikán + Aegis | Redigovaný dokument | P0-30 | ⬜ | — | 2026-05-05 | DATAROOM P1-22, D.3 |
| P1-23 | Rezervace kapacity připojení utilit — VaK, ČEZ, GasNet | Project lead | Podepsaná potvrzení | — | ⬜ | 2 000 | 2026-05-05 | DATAROOM P1-23, C.7 |
| P1-24 | Doplňky prospektu dluhopisů — aktuální nesplaceno per ISIN | Externí bond counsel | Doplňky + tabulka nesplaceno | P0-14 | ⬜ | 5 000 | 2026-05-05 | DATAROOM P1-24 |
| P1-25 | D&O schedule pojistek + struktura krytí dosahem (tail) | Broker | Schedule pojistek + cenová nabídka dosahu | — | ⬜ | 3 000 | 2026-05-05 | DATAROOM P1-25, I.1 |
| P1-26 | Analýza pokrytí klíčové osoby — centralita Zrůst, plán jmenování co-direktora, protokol nezpůsobilosti | Externí M&A counsel | Písemné memo + návrh jmenování | — | ⬜ | 8 000 | 2026-05-05 | DATAROOM P1-26, RF-29; PPF-PLAYBOOK Q16 |
| P1-27 | GDPR DPIA + jmenování DPO — rejstřík držitelů dluhopisů | Externí GDPR counsel | DPIA + DPO potvrzení | — | ⬜ | 8 000 | 2026-05-05 | DATAROOM P1-27, H.5, J.1 |
| P1-28 | Historie pojistných nároků — 5letý dosah (majetek, GL, PI, D&O) | Broker | Záznamy o ztrátách | — | ⬜ | — | 2026-05-05 | DATAROOM P1-28, I.2 |
| P1-29 | Frank Bold advokáti check — jakékoli aktivní napadení planning Zeleneč NSS / Krajský soud admin | Externí | Vyhledávací certifikace | — | ⬜ | 2 000 | 2026-05-05 | DATAROOM P1-29 |
| P1-30 | Plný ISIR sweep na úrovni případů — každá entita skupiny jako věřitel | Externí OSINT | ISIR extrakt + RD Rýmařov memo věřitele | — | ⬜ | 3 000 | 2026-05-05 | DATAROOM P1-30, E.1 RF-17 |
| P1-31 | Pro Věřitele + newstream.cz memo o vyvrácení — 3 nároky bod-po-bodu | Externí komunikace + compliance | Memo o vyvrácení připravené pro představenstvo | — | ⬜ | 5 000 | 2026-05-05 | PPF-PLAYBOOK Q3; DATAROOM E.4 |
| P1-32 | ČNB vyjasňující dopis — žádné aktivní vymáhání / vyšetřování na 5 emitentech dluhopisů | Externí bond counsel + ČNB | Písemná odpověď ČNB | — | ⬜ | — | 2026-05-05 | DATAROOM E.2 |
| P1-33 | CENIA EIA STC2258 kompletní spis + opinion o kontinuitě | Externí environmentální counsel | EIA spis + poznámka kontinuity | — | ⬜ | 2 000 | 2026-05-05 | DATAROOM C.4 |
| P1-34 | KN rekonstrukce řetězce titulu 2007 → 2026 (Quinlan / Nuka / Lébr / Progresus) | Externí property counsel | Memo historického řetězce | P0-07, P0-08 | ⬜ | 10 000 | 2026-05-05 | DATAROOM C.1 řetězec |
| P1-35 | Mapa schématu 130 ha — Progresus vs Obec Zeleneč vs Nuka reziduál vs soukromí farmáři | Externí GIS / OSINT | Mapa + překryv vlastníků | P0-09, P0-10 | ⬜ | 4 000 | 2026-05-05 | DATAROOM C.1 schéma |
| P1-36 | Memo o rozsahu retence / zákazu konkurence pro Zrůst + Foral + Chytilovou | Externí M&A counsel | Návrhy smluv | — | ⬜ | 6 000 | 2026-05-05 | MASTER §11.7 |
| P1-37 | Balík recipročních dotazů doručen PPF — R1-R8 (AMALAR SOF, §23a vyjasnění, atd.) | Zrůst + externí counsel | Dopis PPF protistraně | P0-27 | ⬜ | — | 2026-05-05 | DATAROOM Příloha C |
| P1-38 | Adverzní red team review na straně prodávajícího (externí ne-Aegis) | Externí M&A counsel | Red-team report | P0-23, P1-01..06 | ⬜ | 15 000 | 2026-05-12 | MASTER §12 Týden 3 |
| P1-39 | Dataroom tier 1 naplněn (všechna P0 + 50 % P1) | Dvořák | Indexovaný dataroom | P0-32 + všechna P0 + P1-01..20 | ⬜ | — | 2026-05-05 | DATAROOM Část 5 Týden -2 |
| P1-40 | Eskalační matice nouzových kontaktů + řetězec velení | Zrůst + Dvořák | Eskalační SOP | — | ⬜ | — | 2026-04-30 | PPF-PLAYBOOK §IX |
| P1-41 | Šablona debriefu po schůzce otestována v dry runu | Plný tým | Schválená šablona | — | ⬜ | — | 2026-04-30 | 08-comms/POST-MEETING-DEBRIEF-TEMPLATE.md |
| P1-42 | Manažerský prezentační podklad (pro 4-8h grilování zakladatelů) | Dvořák + Zrůst | Slide deck | P1-39 | ⬜ | 5 000 | 2026-05-12 | PPF-PLAYBOOK §VI; DATAROOM P2-36 |

**P1 rozpočet celkem**: ≈ €315 000

---

## Sekce 4 — P2 AKCE (4 týdny / splatné 2026-05-19)

| ID | Akce | Vlastník | Dodatelný výstup | Závisí na | Status | Cena (€) | Splatné | Zdroj |
|----|--------|-------|-------------|------------|--------|----------|-----|--------|
| P2-01 | Historické LV výpisy — 2007 → 2026 plný řetězec titulu všech 42 ha parcel | Externí property counsel | Dossier historického řetězce | P1-34 | ⬜ | 5 000 | 2026-05-19 | DATAROOM P2-01 |
| P2-02 | Quinlan Private RCS / lucemburská mateřská status — historický review investorských nároků | LU counsel | RCS extrakt + memo | — | ⬜ | 4 000 | 2026-05-19 | DATAROOM P2-02 |
| P2-03 | Golub Capital (Chicago) historický review nároků — irské/US právo | US / IE counsel | Memo | — | ⬜ | 4 000 | 2026-05-19 | DATAROOM P2-03 |
| P2-04 | Modransky Haj s.r.o. (Quinlan paralelní vehikul) status | Externí | Status memo | — | ⬜ | 1 000 | 2026-05-19 | DATAROOM P2-04 |
| P2-05 | Memo o riziku paralelního zájemce Karlín Group (Borenstein/Samii/Brun + 11 SPV + Ungelt + Stelleri Holding) | Korčák (Able) | Monitorovací SOP + schedule NDA vyloučení | — | ⬜ | — | 2026-05-05 | 01-intel/karlin-group-parallel-bidder-dossier.md |
| P2-06 | Frydrych Russia / Eldorado 2014-2016 post-sankční memo (reciproční PPF dotaz) | Compliance | Memo | — | ⬜ | 2 000 | 2026-05-19 | DATAROOM P2-06; RF-34 |
| P2-07 | Jirásková/Jirásko PPF-banka spřízněné strany / §23a ZoB vyjasnění — reciproční dotaz | M&A lead | Doručený dotaz | P0-21 | ⬜ | — | 2026-05-19 | DATAROOM P2-07; RF-30 |
| P2-08 | AMALAR USD 1,9 mld Kellner Jr. vykoupení — zdroj prostředků — reciproční dotaz | M&A lead | Doručený dotaz | — | ⬜ | — | 2026-05-19 | DATAROOM P2-08; RF-31 |
| P2-09 | Registrace ochranných známek — plný ÚPV + EUIPO extrakt („Nový Zeleneč", „PROGRESUS", „RD Rýmařov") | Externí IP counsel | Inventář portfolia | — | ⬜ | 2 000 | 2026-05-19 | DATAROOM P2-09 |
| P2-10 | Domain WHOIS — všechny domény skupiny | Externí IP counsel | Inventář domén | — | ⬜ | — | 2026-05-19 | DATAROOM P2-10 |
| P2-11 | Seznam zaměstnanců + klíčové smlouvy — celá skupina | HR | Inventář | — | ⬜ | — | 2026-05-19 | DATAROOM P2-11, G.1 |
| P2-12 | Struktura odměňování + incentivní plány | HR | Inventář | — | ⬜ | — | 2026-05-19 | DATAROOM P2-12, G.3 |
| P2-13 | Plný rejstřík držitelů dluhopisů — REDIGOVANÝ pro GDPR | Registrátor | Redigovaný rejstřík | — | ⬜ | — | 2026-05-19 | DATAROOM P2-13 |
| P2-14 | Atestace kybernetické bezpečnosti + nedávný pen-test | Externí IT | Pen-test report + atestace | — | ⬜ | 8 000 | 2026-05-19 | DATAROOM P2-14, H.6 |
| P2-15 | Diagram architektury IT systémů — konsolidovaný | PROGRESUS IT | Diagram | — | ⬜ | — | 2026-05-19 | DATAROOM P2-15, H.7 |
| P2-16 | Antikorupční / antiúplatkářská politika — písemná + záznamy školení | Compliance | Politika + log školení | — | ⬜ | 3 000 | 2026-05-19 | DATAROOM P2-16, J.1 |
| P2-17 | Sankční compliance politika + screeningové záznamy | Compliance | Politika | — | ⬜ | 2 000 | 2026-05-19 | DATAROOM P2-17, J.1 |
| P2-18 | Uhlíková stopa / fyzické klimatické riziko — Mstětice | ESG poradce | Memo | — | ⬜ | 5 000 | 2026-05-19 | DATAROOM P2-18, J.4 |
| P2-19 | ArcGIS RUIAN-based mapa schématu 130 ha + překryv vlastníků | OSINT / externí GIS | Interaktivní mapa | P1-35 | ⬜ | — | 2026-05-12 | DATAROOM P2-19 |
| P2-20 | Prismatic ČÚZK adapter rozšíření — captcha-aware + PDF dálkový přístup | Prismatic dev (Able) | Adapter modul (pouze interní použití; nezveřejněno) | — | ⬜ | — | 2026-05-19 | DATAROOM P2-20 |
| P2-21 | Inženýrské a technické služby Mstětice s.r.o. (10745246) — plné DD (role, vlastnictví, rozsah služeb, pre/post Progresus) | Pelikán | Memo | — | ⬜ | 2 000 | 2026-05-19 | DATAROOM P2-21, D.5 |
| P2-22 | Všechny entity „Acquisitions" (založené 2023-2024) — účel + akviziční záznamy | Pelikán | Rozvrh | P1-18 | ⬜ | — | 2026-05-19 | DATAROOM P2-22 |
| P2-23 | PPF reality 2 s.r.o. + PPF CYPRUS RE MANAGEMENT LIMITED plný UBO řetězec (reciproční) | M&A lead | Log recipročních odpovědí | — | ⬜ | — | 2026-05-19 | DATAROOM P2-23; R1 |
| P2-24 | Verhoeff + Frydrych + Ševela + Minx PPF BoD reciproční review | M&A lead | Log recipročních odpovědí | — | ⬜ | — | 2026-05-19 | DATAROOM P2-24 |
| P2-25 | PROGRESUS invest holding core a.s. 2023 fúze/rozdělení plné dokumenty | Pelikán | Papírová stopa | P0-22 | ⬜ | — | 2026-05-19 | DATAROOM P2-25 |
| P2-26 | RD Rýmařov Invest Develop a.s. retroaktivní 2021-2023 audit review | Auditor | Audit memo | P0-13 | ⬜ | — | 2026-05-19 | DATAROOM P2-26 |
| P2-27 | Konreo seznam 1000+ případů — deklarace nepřekrývání | Zrůst + compliance | Certifikovaný seznam nepřekrývání | P1-11 | ⬜ | 8 000 | 2026-05-19 | DATAROOM P2-27 |
| P2-28 | Hospodářské Pozemky „sharing ban" (RF-8) — vyjasňující memo | Pelikán | Memo | — | ⬜ | 2 000 | 2026-05-19 | DATAROOM P2-28 |
| P2-29 | Nabídkové řízení — jakékoli městské předkupní právo na 42 ha | Pelikán | Certifikace | — | ⬜ | 1 500 | 2026-05-19 | DATAROOM P2-29 |
| P2-30 | 5letý forecast refresh — propojit s ÚP Phase 1 2030 | Heyduk + externí | Balík forecastu | — | ⬜ | 8 000 | 2026-05-19 | DATAROOM P2-30, B.3 |
| P2-31 | Mechanismus normalizace pracovního kapitálu | Heyduk | Schedule úpravy WC | — | ⬜ | — | 2026-05-19 | DATAROOM P2-31, B.6 |
| P2-32 | Bankovní účet úschovy + smlouva s agentem (cíl ČSOB nebo KB — NE PPF banka) | Seller + Buyer counsel | Návrh SOW úschovy | — | ⬜ | 5 000 | 2026-05-19 | DATAROOM P2-32; FINANCING-ANALYSIS §8 |
| P2-33 | Pověření brokera W&I pojištění | Broker (Marsh/Aon/Willis) | Pověření + cenová nabídka | P0-26 | ⬜ | 5 000 (broker fee) | 2026-05-19 | DATAROOM P2-33 |
| P2-34 | Pojištění titulu (specifické vynětí DANCORE) — vázání pojistky | Broker | Vázaná pojistka | P0-26 | ⬜ | 50 000 (premium) | 2026-05-19 | DATAROOM P2-34; DANCORE §7.4 |
| P2-35 | Spuštěna kampaň žádosti o souhlas věřitelů / držitelů dluhopisů | Externí bond counsel | Žádost otevřena | P0-28, P1-15 | ⬜ | (v P0-28) | 2026-05-19 | DATAROOM P2-35 |
| P2-36 | Plný nácvik manažerského prezentačního podkladu (4-8h grilování zakladatelů) | Zrůst + Dvořák | Podklad + záznam nácviku | P1-42 | ⬜ | — | 2026-05-14 | DATAROOM P2-36; PPF-PLAYBOOK §VI |
| P2-37 | Reputační memo — Pro Věřitele + newstream.cz veřejné prohlášení | Externí komunikace | Záložní prohlášení | P1-31 | ⬜ | — | 2026-05-19 | DATAROOM P2-37 |
| P2-38 | Korespondence s obcí Zeleneč — plné stažení | Project lead | Log korespondence | — | ⬜ | — | 2026-05-19 | DATAROOM P2-38 |
| P2-39 | Historické SPA — 2021 Progresus akvizice Nového Zelenče od Lébra | Pelikán | Kopie + redakce | — | ⬜ | — | 2026-05-19 | DATAROOM P2-39 |
| P2-40 | Zdroj prostředků 2021 — Progresus počáteční akviziční financování | Heyduk | SOF memo + bankovní potvrzení | — | ⬜ | — | 2026-05-19 | DATAROOM P2-40 |
| P2-41 | Prismatic OSINT memo o mezerách v nástrojích interní (stav scaffolu ČÚZK adapteru) — NEZVEŘEJNĚNO PPF | Prismatic dev (Able) | Pouze interní memo | — | ⬜ | — | 2026-05-19 | DATAROOM P2-41 |
| P2-42 | Struktura compliance ČNB §23a ZoB pokud PPF banka financuje transakci | Externí bond/banking counsel | Strukturální memo | P0-21 | ⬜ | 5 000 | 2026-05-19 | DATAROOM P2-42 |
| P2-43 | Pojistné krytí pro DANCORE specifické výsledky (W&I + specifické) | Broker | Vázané pojistky | P2-34 | ⬜ | (v P2-34) | 2026-05-19 | DATAROOM P2-43 |
| P2-44 | Kalkulace rezervy zákonných penalizací — všechny delikventní entity | Heyduk + tax | Kalkulace rezervy | P0-20 | ⬜ | — | 2026-05-19 | DATAROOM P2-44 |
| P2-45 | ESG reporting memo — co PPF Group vyžaduje post-closing | Externí ESG | Memo | — | ⬜ | 3 000 | 2026-05-19 | DATAROOM P2-45 |
| P2-46 | Balíček manažerské retence — Zrůst, Foral, Chytilová | Seller + PPF | Návrhy balíků | — | ⬜ | — | 2026-05-19 | DATAROOM P2-46 |
| P2-47 | Memo o rozsahu zákazu konkurence + zákazu navrhování | Legal | Memo | P1-36 | ⬜ | — | 2026-05-19 | DATAROOM P2-47 |
| P2-48 | Odsouhlasení daně z nemovitosti — historická podání | Heyduk | Odsouhlasení | — | ⬜ | — | 2026-05-19 | DATAROOM P2-48 |
| P2-49 | Aktualizace studie kapacit utilit — horizont Fáze 2+ | Infrastruktura poradce | Studie | — | ⬜ | 5 000 | 2026-05-19 | DATAROOM P2-49 |
| P2-50 | Smlouvy se sousedy — přístupové cesty, drenáž, věcná břemena | Pelikán | Rozvrh | — | ⬜ | — | 2026-05-19 | DATAROOM P2-50 |
| P2-51 | Mechanika closingu — notářský zápis / zvláštní usnesení pro převod akcií | Český notář + counsel | Návrh | — | ⬜ | 3 000 | 2026-05-19 | DATAROOM P2-51 |
| P2-52 | Teplý pool alternativních kupců (CTP, Accolade, Central Group, Penta, Crestyl, Finep, Daramis, CPIPG) — bezejmenné upoutávky | Savills/JLL light-touch (externí) | Upoutávka odeslána | — | ⬜ | 3 000 | 2026-05-12 | Karlín-dossier §12 #3; MASTER §2.2 bench |
| P2-53 | Memo o riziku zpoždění schválení AMALAR — analýza úzkého místa rodinné rady | M&A lead | Memo | — | ⬜ | — | 2026-05-19 | FINANCING-ANALYSIS §9.2 |
| P2-54 | Memo o kyperské mezilehlé daňové struktuře — dopad flexibility budoucího exitu na podmínky transakce | Externí tax | Memo | — | ⬜ | 4 000 | 2026-05-19 | FINANCING-ANALYSIS §4 |
| P2-55 | Memo o FX denominaci — CZK vs EUR protiplnění + zajišťovací mechanismus | Heyduk + externí tax | Memo | — | ⬜ | 2 000 | 2026-05-19 | FINANCING-ANALYSIS §10 #4 |
| P2-56 | ÚOHS antimonopolní podání screen — analýza prahu raw-land | Externí M&A counsel | Memo | — | ⬜ | 2 000 | 2026-05-19 | FINANCING-ANALYSIS §10 #5 |
| P2-57 | Monitor stavu důvěrnosti — týdenní open-web + media watch | Korčák (Able) | Týdenní scan report | — | ⬜ | — | průběžně | MASTER §2.1 |
| P2-58 | Post-closing scénář — integrační plánování, transition services, D&O dosah | Externí M&A counsel | Scénářový dokument | — | ⬜ | — | 2026-05-19 | MASTER §11.7 |

**P2 rozpočet celkem**: ≈ €135 500

---

## Sekce 5 — ZDROJOVÝ GANTT

### Týden 1 — 2026-04-21 → 2026-04-28 : FORENZNÍ DOHÁNĚNÍ + POVĚŘOVÁNÍ EXPERTŮ
**Fokus**: P0-01..32. Zamknout counsel + auditora + environmentálního. ČÚZK výpisy. DANCORE spis. FY24 VZ memo.

| Den | Milníky |
|-----|-----------|
| Po 04-21 | Baseline. P0-18 diagram skupiny, P0-32 dataroom RFP, P0-06 ČÚZK účet otevřen |
| Út 04-22 | P0-23 externí counsel užší výběr + schůzky, P0-24 Big-4 užší výběr |
| St 04-23 | P0-06/07/08 ČÚZK výpisy, P0-18 diagram schválen |
| Čt 04-24 | P0-01/02 DANCORE stahování kick off, P0-05 FY24 VZ memo, P0-09/10/11/12 vlastnické dotazy |
| Pá 04-25 | P0-03 PACER, P0-13 audit pověření podepsáno, P0-20 memo o pozdních podáních, P0-23/24 dopisy podepsány, P0-30 Aegis dopis o konfliktu |
| So 04-26 | P0-15/16 dopisy o uvolnění odeslány, P0-29 Savills NDA stress test, P0-14 master tabulka dluhopisů v1 |
| Ne 04-27 | Interní víkendový review — týmový huddle, audit mezer |
| Po 04-28 | **P0 BRÁNA** — P0-17/19/21/22/25/26/27/28/31 splatné |

**Zdroje na výplatě tento týden**: Zrůst (ops lead), Pelikán (interní legal), Dvořák (DD ops), Korčák (forenzika + dataroom), Heyduk (CFO), + angažovaný externí counsel (CZ M&A + CZ litigation + CZ tax + NV-US counsel + property counsel + bond counsel), Big-4 audit firma, environmentální poradce, broker, dataroom SaaS.

### Týden 2 — 2026-04-28 → 2026-05-05 : AUDIT SPRINT + SESTAVOVÁNÍ ZVEŘEJNĚNÍ
**Fokus**: P1-01..42. Retroaktivní audity běžící paralelně pro 6 entit. Mezipodniková matice + TP dokumenty. Casper odsouhlasení. Atestace informační bariéra (informační bariéry).

| Den | Milníky |
|-----|-----------|
| Út 04-29 | P1-13 vyčištění kapitálové struktury; P1-40 eskalační matice |
| St 04-30 | P1-41 dry run šablony debriefu; P1-13 kapitálová struktura podepsaná |
| Čt 05-01 | Státní svátek (CZ) — buffer den |
| Pá 05-02 | P1-07 mezipodniková matice v1; P1-10 Casper odsouhlasení v1 |
| Po 05-05 | **P1 BRÁNA** — P1-01..39 splatné; retroaktivní audity dodány; dataroom tier 1 naplněn |

### Týden 3 — 2026-05-05 → 2026-05-12 : ADVERZNÍ REVIEW + DATAROOM FINÁL
**Fokus**: Red-team review (P1-38), zbývající P2 cluster, nácvik manažerského podkladu.

| Den | Milníky |
|-----|-----------|
| Út 05-06 | P2-05 Karlín monitorovací SOP live; P2-19 130ha mapa v1 |
| Čt 05-08 | P1-38 red-team report dodán; P2-34 vázání pojištění titulu |
| Po 05-12 | P1-42 manažerský podklad v1; P2-52 upoutávky alternativních kupců odeslány |

### Týden 4 — 2026-05-12 → 2026-05-19 : PPF DRY RUN + 95 % PŘIPRAVENOST
**Fokus**: Zrůstův 8hodinový hot seat. Finální uzavření mezer. Úschova + pojištění titulu vázané.

| Den | Milníky |
|-----|-----------|
| St 05-14 | **Zrůstův 8hodinový blok nácviku** (Q1-Q20 z PPF-PLAYBOOK) |
| Čt 05-15 | Interní „druhý red team" review simulující PPF přístup |
| Pá 05-16 | Finální dataroom index zamčen, všechny P2 položky za bránou |
| Po 05-19 | **BRÁNA PŘIPRAVENOSTI** — 95+ %, žádost o souhlas CoC spuštěna |

### Týden 5+ — od 2026-05-19 dále : PRVNÍ CALL S PPF + LIVE DD
**Fokus**: Scope schůzka → exkluzivita → seznam DD požadavků → SLA odpověď (48-72h per požadavek).

| Okno | Milníky |
|--------|-----------|
| 2026-05-19 → 2026-05-27 | PPF první zapojení: rozsah + exkluzivita + NDA (vynětí Karlín zamčeno) |
| 2026-06-02 → 2026-06-29 | PPF DD sprint (200-400 požadavků napříč 10 buckety A-J) |
| 2026-06-30 → 2026-07-13 | Rekalibrace ocenění + smluvní rámec SPA |
| 2026-07-14 → 2026-07-27 | Vyjednávání SPA + prohlášení a záruky (prohlášení a záruky) + disclosure schedule |
| 2026-07-28 → 2026-08-03 | Okno podpisu |
| 2026-08-04 → 2026-09-14 | Splnění CP + closing |

---

## Sekce 6 — MATICE ODPOVĚDNOSTI VLASTNÍKŮ

| Osoba | Role | P0 položky | P1 položky | P2 položky | Celkem |
|--------|------|----------|----------|----------|-------|
| **JUDr. Lukáš Zrůst** | Principál, jediný jednatel transakční vertikály | 23, 24, 27, 31 (sign-off na všechny) | 11, 36, 37 (sign-off na všechny), 38, 42 | 08, 23, 24, 53 (dohled) | Dohled na 100 %; přímý vlastník 8 |
| **Lukáš Foral** | Co-principál (finance) | 05 (dohled) | 12 (Dubai/Michl), 37 | 40 (2021 SOF) | 3 přímé + dohled finanční oblasti |
| **Michal Dvořák** | Progresus DD Lead | 18, 32 | 13 (kapitálová struktura), 18 (ARES drill), 39 (naplnění dataroomu), 40, 41, 42 | 05, 11, 23, 24, 52 | 10 přímých |
| **Ing. Petr Heyduk** | CFO | 05, 13 (s auditorem) | 01-06 (audit dohled), 07, 08, 09, 10 | 30, 31, 40, 44, 48, 55 | 15 přímých |
| **Michal Pelikán** | Právní poradce (interní) | 15, 16, 17, 18 (podpora), 30 | 14, 19, 22 | 21, 22, 25, 28, 29, 38, 39, 50 | 15 přímých |
| **Mgr. Jindřiska Chytilová** | Členka představenstva NZ a.s. | — (sign-off na 15, 16, 17) | 14 (knihy zápisů) | 46 (retention) | Podpisová pravomoc |
| **Tomáš Korčák** | Able Discovery Lead / Architect (tento workspace) | 18 (podpora), 32 | 18 (OSINT podpora), 35, 39 (dataroom design) | 05, 19, 20, 41, 52 (Savills), 57 (monitor) | 10 přímých |
| **Karel Duchoň** | Able AI Lead | P0-32 podpora (dataroom tech) | 39 podpora | 20, 41 | Podpůrná role |
| **Václav Faraga** | Able CEO / komerční | 27 (NDA komerční) | — | — | Komerční dohled |
| **Vojtěch Faltus (Aegis Law)** | Planning counsel prodávajícího | 30 | 20 (petice/planning), 22, 33 | 25, 38 | 6 přímých |
| **Externí M&A counsel (KŠB / JŠK / W&C — angažovat P0-23)** | Adverzní / primární | 22, 23, 26, 27, 31 | 09, 26, 36, 38, 42 | 32, 47, 51, 56, 58 | 15 přímých |
| **Externí litigation counsel (CZ — angažovat P0-23)** | DANCORE + spory | 01, 19, 31 | 30, 33 | — | 5 přímých |
| **Externí litigation counsel (US / NV)** | DANCORE US úhly | 02, 03, 04 | — | 03 | 4 přímé |
| **Externí bond counsel** | Dluhopisy/CoC | 14, 21, 28 | 15, 24, 32 | 35, 42 | 8 přímých |
| **Externí tax counsel** | Tax/restrukturalizace | 20, 22 | 07, 08, 09 | 44, 54, 55 | 8 přímých |
| **Externí property counsel** | ČÚZK / řetězec titulu | 06, 07, 08, 09, 10, 11, 12, 15, 16, 17 | 34, 35 | 01 | 13 přímých |
| **Big-4 financial DD** (EY / Deloitte / KPMG / PwC) | Finanční DD + auditor | 13, 24 | 01, 02, 03, 04, 05, 06 | 26, 30 | 10 přímých |
| **Environmentální poradce** | Phase I / II / EIA | 25 | 16, 17, 33 | 45, 49 | 6 přímých |
| **Broker (Marsh / Aon / Willis)** | Pojištění + W&I + title | 26 | 25, 28 | 33, 34, 43 | 6 přímých |
| **Externí GDPR counsel** | Ochrana dat | — | 27 | — | 1 přímý |
| **Externí compliance / reputace** | AML / PEP / politiky | — | 11, 12, 31 | 06, 16, 17 | 6 přímých |
| **Externí komunikace** | PR / narrativ | — | 31 | 37 | 2 přímé |
| **Externí IP counsel** | TM / domény / Studio Perspektiv | — | 21 | 09, 10 | 3 přímé |
| **Externí IT / cyber** | Pen-test + architektura | — | — | 14 | 1 přímý |
| **Externí ESG** | ESG + uhlík | — | — | 18, 45 | 2 přímé |
| **Externí LU counsel** | Quinlan RCS historický | — | — | 02 | 1 přímý |
| **Externí IE/US counsel** | Golub historické nároky | — | — | 03 | 1 přímý |
| **Český notář** | Closing převodu akcií | — | — | 51 | 1 přímý |

---

## Sekce 7 — MAPA ZÁVISLOSTÍ

### 7.1 Řetězce kritické cesty (musí být sekvenovány)

**Řetězec A — ČÚZK / Titul (7položková sekvence)**
```
P0-06 (ČÚZK účet otevřen)
  ├─ P0-07 (LV 927 výpis)
  │   └─ P0-15 (Nuka uvolnění) ──┐
  │   └─ P0-16 (MARSEA uvolnění)┤
  ├─ P0-08 (LV 1326 výpis)        ┤
  ├─ P0-09..12 (vlastnické dotazy)┤
  └─ P1-34 (řetězec titulu)       ┘
        → P1-35 (130ha mapa) → P2-01 (historické LV) → P2-19 (ArcGIS overlay)
```

**Řetězec B — DANCORE obhajoba (6položková sekvence)**
```
P0-01 (stažení spisu) ─┐
P0-02 (NV SoS) ────────┤
P0-03 (PACER) ─────────┤→ P0-19 (memorandum obhajoby) → P0-26 (cenová nabídka pojištění titulu) → P2-34 (vázání pojištění titulu)
P0-04 (FinCEN) ────────┘                                                                       → P0-31 (PPF dopis o zveřejnění)
```

**Řetězec C — Náprava účetních závěrek (7položková sekvence)**
```
P0-13 (pověřovací dopis)
  ├─ P1-01 (NZ a.s. audit)
  ├─ P1-02 (PROGRESUS RD Rýmařov audit)
  ├─ P1-03 (PROGRESUS RD Rýmařov II audit)
  ├─ P1-04 (PROGRESUS RD Rýmařov III audit)
  ├─ P1-05 (PROGRESUS Bonds audit)
  └─ P1-06 (III. alpha audit)
       → P2-26 (Develop audit review) → P2-44 (kalkulace rezervy penalizací)
```

**Řetězec D — Žádost o souhlas CoC (4položková sekvence)**
```
P0-14 (master tabulka dluhu)
  → P0-28 (spuštění žádosti)
    → P1-15 (materiály žádosti)
      → P1-24 (doplňky prospektu)
        → P2-35 (spuštění žádosti) → CoC souhlas dosažen (60-90 dnů)
```

**Řetězec E — Brány retaineru externího counselu** (kritická cesta pro vše ostatní)
```
P0-23 (externí M&A counsel) — brány P0-27, P0-31, P1-36, P1-38, P2-47, P2-51, P2-56, P2-58
P0-24 (Big-4 audit) — brány P0-13, P1-01..06, P2-26, P2-30
P0-25 (environmentální) — brány P1-16, P1-17, P1-33, P2-45, P2-49
```

**Řetězec F — Doručení recipročních dotazů (3položková sekvence)**
```
P0-21 (ČNB §23a dopis) ─┐
P0-27 (NDA návrh)        ├─→ P1-37 (reciproční dotazy doručeny) → P2-07/08/23/24 (odpovědi)
```

### 7.2 Tvrdé brány omezení

- **ŽÁDNÝ první call s PPF** dokud: P0-23 counsel angažován ∧ P0-01/19 DANCORE memorandum připraveno ∧ P0-27 NDA připraveno ∧ P0-29 Savills potvrzeno
- **ŽÁDNÉ podepisování** dokud: P2-34 pojištění titulu vázáno ∧ souhlas CoC držitelů dluhopisů ≥66 % ∨ refinancování zajištěno ∧ ČNB §23a vyjasněno ∨ ne-PPF-banka věřitel potvrzen
- **ŽÁDNÉ otevření dataroomu PPF** dokud: P1-39 tier-1 naplněn ∧ P1-38 red team prošel

---

## Sekce 8 — ODHAD ROZPOČTU

### 8.1 Dle kategorie (€ odhadem; CZK konverze 25 CZK/EUR)

| Kategorie | Rozpočet (€) | Rozpočet (CZK) | Zdroj |
|----------|-----------:|-------------:|--------|
| **Legal — externí M&A (adverzní, ne-Aegis)** | 80 000 | 2 000 000 | P0-23 retainer + drafting + review |
| **Legal — externí CZ litigation (DANCORE)** | 35 000 | 875 000 | P0-01, 19; DANCORE-DOSSIER §7.3 |
| **Legal — US/NV counsel (DANCORE)** | 15 000 | 375 000 | P0-02, 03, 04 |
| **Legal — externí bond counsel (CoC)** | 55 000 | 1 375 000 | P0-14, 28; P1-15, 24 |
| **Legal — externí tax counsel** | 35 000 | 875 000 | P0-20, 22; P1-07, 08, 09; P2-44, 54, 55 |
| **Legal — externí property counsel** | 25 000 | 625 000 | P0-06..17; P1-34 |
| **Legal — externí LU + IE/US historický counsel** | 10 000 | 250 000 | P2-02, 03 |
| **Legal — banking / §23a counsel** | 15 000 | 375 000 | P0-21; P2-42 |
| **Legal — GDPR + IP + compliance + různé** | 20 000 | 500 000 | P1-12, 21, 27; P2-09, 10, 16 |
| **Finance — Big-4 retroaktivní audit (6 entit)** | 200 000 | 5 000 000 | P0-13; P1-01..06 |
| **Finance — Big-4 příprava finanční DD** | 60 000 | 1 500 000 | P0-24 retainer + TP + mezipodniková |
| **Environmentální — Phase I + soil/groundwater** | 25 000 | 625 000 | P0-25; P1-16, 17, 33 |
| **Environmentální — ESG + uhlík + studie utilit** | 10 000 | 250 000 | P2-18, 45, 49 |
| **Poplatky pojišťovacího brokera** | 5 000 | 125 000 | P2-33 |
| **Pojistné pojištění titulu** | 50 000 | 1 250 000 | P2-34 (DANCORE-specifické vynětí) |
| **Pojistné W&I** | 100 000 | 2 500 000 | MASTER §11 (2-3 % z ~4,5 mld; alokováno konzervativně; finální cenová nabídka potřebná) |
| **Dataroom SaaS (Ansarada / Datasite 6měsíční)** | 20 000 | 500 000 | P0-32 |
| **Pen-test kybernetické bezpečnosti** | 8 000 | 200 000 | P2-14 |
| **ČÚZK dálkový přístup + LV poplatky** | 2 500 | 62 500 | P0-06..12 |
| **Forenzní účetní (Casper / Dubai)** | 15 000 | 375 000 | P1-10, 12 |
| **Komunikace / reputace** | 10 000 | 250 000 | P1-31; P2-37 |
| **Notář + mechanika closingu** | 5 000 | 125 000 | P2-51 |
| **Rezerva (10 % z celkového ≈ €795k)** | 80 000 | 2 000 000 | buffer pro rozšíření rozsahu |
| **CELKEM** | **€880 500** | **≈ CZK 22 000 000** | |

### 8.2 Cash timing

| Okno | Výdej (€) |
|--------|----------:|
| Týden 1 (P0) | 321 600 |
| Týden 2 (P1) | 315 000 |
| Týdny 3-4 (P2) | 135 500 |
| Pojistná pojistná (podpis) | 150 000 |
| Rezerva | 80 000 |
| **Mezisoučet** | **1 002 100** (zaokrouhleno; zahrnuje překryv mezi retainery a poplatky) |
| **Po odečtení dvojího počítání (retainery jsou účtovány proti následným poplatkům)** | **≈ 880 500** |

### 8.3 Schvalovací pravomoci

- **Do €25k/položka**: Zrůst unilaterálně
- **€25k-€75k/položka**: Zrůst + Foral společně
- **>€75k/položka**: Zrůst + Foral + Dvořák, dokumentované písemné usnesení
- **Vázání W&I / pojištění titulu >€100k**: Zrůst + Foral + externí M&A counsel sign-off
- **Překročení rozpočtu >150 % řádky kategorie**: Vyžadováno schválení Zrůsta (Sekce 10 eskalace)

---

## Sekce 9 — KALENDÁŘ SCHŮZEK

### 9.1 Potvrzené / cílové sessions

| Datum | Session | Účastníci | Agenda | Doba |
|------|---------|-----------|--------|---------:|
| 2026-04-22 09:00 | Přehlídka externího counselu | Zrůst, Foral, Dvořák, Korčák + 3 firmy | Vybrat adverzního M&A counsela (KŠB / JŠK / W&C) | 3h |
| 2026-04-23 10:00 | Přehlídka Big-4 | Heyduk, Zrůst, Dvořák + 3 firmy | Vybrat finanční DD + retroaktivní audit | 3h |
| 2026-04-24 14:00 | DANCORE strategický call | Zrůst, Pelikán, litigation counsel (CZ), US counsel | Defenzivní strategie + dimenzování úschovy | 2h |
| 2026-04-25 10:00 | Kickoff environmentálního poradce | Dvořák, environmentální poradce | Phase I rozsah + 42 ha průchod | 2h |
| 2026-04-28 14:00 | **Review P0 BRÁNY** | Zrůst, Foral, Dvořák, Korčák, Pelikán, externí counsel | Status 32 P0 položek; odložení + mitigace | 3h |
| 2026-05-01 | Bond counsel + treasurer — průchod master tabulkou CoC | Heyduk, bond counsel, treasurer | 5-prospektová matice CoC | 2h |
| 2026-05-05 14:00 | **Review P1 BRÁNY** | Plný tým | Retroaktivní audity + mezipodniková + TP + red flags | 3h |
| 2026-05-08 10:00 | Red-team review kickoff | Zrůst + externí M&A counsel (ne-Aegis) | Adverzní review aktuálního stavu dataroomu | 4h |
| 2026-05-12 16:00 | Debrief red-team reportu | Plný tým | Zjištění + plán nápravy | 2h |
| 2026-05-14 09:00-17:00 | **ZRŮSTŮV 8HODINOVÝ NÁCVIK** | Zrůst + Foral + Dvořák + Korčák + Duchoň + Faraga + externí counsel | Q1-Q20 hot seat z PPF-PLAYBOOK; plný dataroom drill | 8h |
| 2026-05-15 14:00 | Druhý interní red team („PPF simulace") | Plný tým | Simulovaný PPF DD sprint — rychlopalný drill | 4h |
| 2026-05-19 14:00 | **BRÁNA PŘIPRAVENOSTI** — go/no-go pro oslovení PPF | Zrůst, Foral | Finální rozhodnutí | 2h |
| 2026-05-20 → 2026-05-27 | **OKNO PRVNÍHO CALLU S PPF** | Zrůst + Dvořák + externí counsel | Rozsah + exkluzivita + NDA | varies |

### 9.2 Opakující se rytmy

| Frekvence | Session | Účastníci | Agenda |
|-----------|---------|-----------|--------|
| Denně 08:30 (Týden 1) | 15min stand-up | Zrůst + Dvořák + Pelikán + Korčák | Kontrola statusu P0 |
| Týdně pondělí 09:00 (Týdny 2-5) | 60min týdenní review | Plný tým + externí counsel dial-in | Pokrok + brány + eskalace |
| Ad-hoc | Status DANCORE | Zrůst + litigation counsel | Procesní aktualizace |
| Ad-hoc | Status CoC dluhopisů | Heyduk + bond counsel + treasurer | Pokrok žádosti o souhlas |

### 9.3 Komunikační kanály

- **Primární**: Signal privátní skupina „Mycelium-Seller" (Zrůst, Foral, Dvořák, Korčák, Heyduk, Pelikán)
- **Externí counsel**: dedikovaný email se značkou předmětu „[PROJECT MYCELIUM — DŮVĚRNÉ]"
- **Dataroom otázky a odpovědi (otázky a odpovědi)**: jakmile je live, SLA 48h faktické / 72h právní / 7d komplexní
- **Nikdy**: žádná diskuse o transakci přes Gmail / WhatsApp / veřejný Slack

---

## Sekce 10 — ESKALAČNÍ SPOUŠTĚČE

### 10.1 Automatická eskalace (notifikace Zrůst + externí counsel do 1 hodiny)

| Spouštěč | Akce |
|---------|--------|
| Jakákoli P0 položka zmeškána o **24h vs splatnost** | Okamžitý Signal alert + 1h status call; plán nápravy do 24h |
| Jakákoli P0-01/02/03/19 DANCORE položka zablokována | Angažovat alternativního US counsela; zvážit nouzový PACER zrychlený požadavek |
| Selhání přístupu ČÚZK (P0-06) | Přepnout na osobní návštěvu ČÚZK Praha; akceptovat 3denní zpoždění |
| Dopis o uvolnění odmítnut (P0-15, 16, 17) | Angažovat externí litigation counsel pro alternativní cestu (soudní vyjasnění nebo obejití přes pojištění titulu) |
| Vyplyne konflikt Aegis Law (P0-30) | Okamžité odpojení; nouzové angažmá čerstvého planning counsela |
| PPF naváže kontakt před připraveností | „Potvrzujeme přijetí a odpovíme do 10 pracovních dnů dle našeho interního protokolu" — zdržovat dokud ≥90 % ready |
| Porušení Savills NDA / signál úniku | Okamžitý P0-29 follow-through + právní dopis; pozastavit Savills přístup |
| Karlín Group provede první přístup | Protokol mlčení; NDA §11 vyhotoveno připraveno; okamžitá eskalace na Zrůsta |

### 10.2 Rozpočtová eskalace

| Práh | Vyžadované schválení |
|-----------|-------------------|
| Jediný řádek ≥150 % odhadu | Zrůst |
| Kumulativně ≥110 % celkového | Zrůst + Foral společně |
| Kumulativně ≥125 % celkového | Zrůst + Foral + Dvořák dokumentované usnesení |
| Kumulativně ≥150 % celkového | Zrůst + Foral + formální přeplánování + notifikace dozorčí radě |

### 10.3 Eskalace události PPF dataroomu

| Událost | Akce |
|-------|--------|
| PPF zvedne položku NENÍ v dataroomu | 48h odpověď: buď (a) upload se zveřejněním, (b) uznat mezeru s harmonogramem nápravy, (c) potvrzení privilegia s sign-off externího counsela |
| PPF zvedne tvrzení, které nemůžeme validovat za 48h | Pozastavit relevantní vlákno otázky a odpovědi (otázek a odpovědí); koupit čas s „pod posouzením — vrátíme se [datum]"; napravit s externím counselem |
| PPF sdílí dataroom s Karlín Group / neautorizovanou stranou | Porušení NDA §11 — okamžité ukončení vyjednávání + nárok na liquidated damages |
| PPF požaduje neomezené osobní záruky | Skript odchodu (PPF-PLAYBOOK §IX) |
| PPF požaduje cenové snížení >15 % kotvy bez podložení | Pauza; znovu zaujmout podlahu; eskalovat na Forala + externího counsela |
| PPF banka odmítá stopu vyjasnění §23a | Odchod (PPF-PLAYBOOK §VII red line 11) |

### 10.4 Eskalace externího signálu

| Signál | Akce |
|--------|--------|
| České médium (HN, Seznam, Radio Prague, HlídacíPes) začíná vyšetřovat DANCORE nebo dluhopisové taktiky Progresu | Předem připravené záložní prohlášení uvolněno (P2-37); právní monitoring aktivován |
| Vymáhací oznámení ČNB přichází na jakémkoli emitentovi dluhopisů | Nouzový právní + compliance huddle; P1-31/32 memo aktualizováno; zveřejnit PPF do 24h s připraveným narrativem |
| Karlín Group registruje nové očíslované SPV během DD okna | Považovat za signál úniku dle Karlín-dossier §12 #4; napsat PPF s odkazem na atestaci NDA §11 |
| PPF přidává senior účastníky uprostřed DD | Eskalační signál — pauza 48h, sjednotit interně, validovat složení týmu |
| Konkurenční zájemce (CTP/Accolade/Central Group) provede nezvané oslovení | Nezapojovat; pouze potvrdit přijetí; předejít porušení exkluzivity ve stylu Karlín |

---

## Příloha A — PŘEHLED STATUSOVÝCH SPOUŠTĚČŮ

**Exec-read šablona (k denní údržbě). Všech 132 akcí uvedeno. Každá změna statusu loguje datum + poznámky.**

| ID | Akce (krátká) | Start | Splatné | Skutečně dokončeno | Status | Blokátory | Poznámky |
|----|----------------|-------|-----|-----------------|--------|----------|-------|
| P0-01 | DANCORE spis sporu | 2026-04-22 | 2026-04-24 | — | ⬜ | Externí CZ litigation counsel výběr stále otevřen (P0-23) | Brief běží |
| P0-02 | NV SoS DANCORE | 2026-04-22 | 2026-04-24 | — | ⬜ | US counsel výběr | $1 500 |
| P0-03 | PACER 2:18-cv-01136 | 2026-04-22 | 2026-04-25 | — | ⬜ | — | |
| P0-04 | FinCEN BOI přístup | 2026-04-22 | 2026-04-25 | — | ⬜ | — | CTA exemption analýza |
| P0-05 | FY24 VZ deep-dive | 2026-04-21 | 2026-04-24 | — | ⬜ | Interní CFO kapacita | 72stránkové PDF |
| P0-06 | ČÚZK DP účet | 2026-04-21 | 2026-04-23 | — | ⬜ | — | ~€2k |
| P0-07 | LV 927 | 2026-04-23 | 2026-04-23 | — | ⬜ | P0-06 | |
| P0-08 | LV 1326 | 2026-04-23 | 2026-04-23 | — | ⬜ | P0-06 | |
| P0-09 | NZ vlastnický dotaz | 2026-04-23 | 2026-04-24 | — | ⬜ | P0-06 | |
| P0-10 | III. alpha vlastnický dotaz | 2026-04-23 | 2026-04-24 | — | ⬜ | P0-06 | |
| P0-11 | Nuka vlastnický dotaz | 2026-04-23 | 2026-04-24 | — | ⬜ | P0-06 | |
| P0-12 | MARSEA vlastnický dotaz | 2026-04-23 | 2026-04-24 | — | ⬜ | P0-06 | |
| P0-13 | NZ audit pověření | 2026-04-21 | 2026-04-24 | — | ⬜ | P0-24 Big-4 výběr | €80k |
| P0-14 | Master tabulka dluhopisů | 2026-04-22 | 2026-04-26 | — | ⬜ | Bond counsel retainer | |
| P0-15 | Nuka dopis o uvolnění | 2026-04-22 | 2026-04-26 | — | ⬜ | — | |
| P0-16 | MARSEA dopis o uvolnění | 2026-04-22 | 2026-04-26 | — | ⬜ | — | |
| P0-17 | Lébr dopis o oddělení | 2026-04-22 | 2026-04-28 | — | ⬜ | — | |
| P0-18 | Diagram skupiny | 2026-04-21 | 2026-04-23 | — | ⬜ | — | |
| P0-19 | DANCORE memorandum obhajoby | 2026-04-25 | 2026-04-28 | — | ⬜ | P0-01 | |
| P0-20 | Memo penále za pozdní podání | 2026-04-22 | 2026-04-25 | — | ⬜ | Tax counsel | |
| P0-21 | ČNB §23a dopis | 2026-04-22 | 2026-04-28 | — | ⬜ | Banking counsel | |
| P0-22 | Memo o reorganizaci skupiny | 2026-04-22 | 2026-04-28 | — | ⬜ | Tax + corporate counsel | |
| P0-23 | Externí M&A counsel | 2026-04-21 | 2026-04-25 | — | 🟡 | Přehlídka 04-22 | €50k retainer |
| P0-24 | Big-4 finanční DD | 2026-04-21 | 2026-04-25 | — | 🟡 | Přehlídka 04-23 | €60k retainer |
| P0-25 | Environmentální poradce | 2026-04-22 | 2026-04-28 | — | ⬜ | — | €25k |
| P0-26 | Cenová nabídka pojištění titulu | 2026-04-25 | 2026-04-28 | — | ⬜ | P0-19 + výběr brokera | |
| P0-27 | Návrh NDA + exkluzivity | 2026-04-24 | 2026-04-28 | — | ⬜ | P0-23 | |
| P0-28 | Spuštění žádosti o souhlas držitelů dluhopisů | 2026-04-25 | 2026-04-28 | — | ⬜ | P0-14 | |
| P0-29 | Savills NDA stress-test | 2026-04-22 | 2026-04-26 | — | ⬜ | — | |
| P0-30 | Aegis dopis o konfliktu | 2026-04-22 | 2026-04-25 | — | ⬜ | — | |
| P0-31 | DANCORE dopis o zveřejnění | 2026-04-26 | 2026-04-28 | — | ⬜ | P0-19 | Podpisový dopis |
| P0-32 | Dataroom platforma | 2026-04-21 | 2026-04-26 | — | 🟡 | Ansarada vs Datasite | €20k |
| P1-01..42 | [viz Sekce 3] | 2026-04-28 | 2026-05-05 | — | ⬜ | Průběžné | |
| P2-01..58 | [viz Sekce 4] | 2026-05-05 | 2026-05-19 | — | ⬜ | Průběžné | |

**Kadence aktualizace**:
- **Denně** (Týden 1): Dvořák aktualizuje status všech aktivních P0 položek do 18:00 CET
- **Týdně** (Týdny 2-5): Dvořák konsolidovaný status report každé pondělí 09:00, distribuováno přes Signal
- **Ad-hoc**: jakákoli změna statusu na ZABLOKOVÁNO → okamžitý Signal alert + 1h eskalační call dle §10.1

---

## Příloha B — KŘÍŽOVÉ ODKAZY NA ZDROJOVÉ DOKUMENTY

| Zdroj | Sekce | Extrahováno do |
|--------|---------|----------------|
| `RED-FLAGS.md` | Všech 30 flagů | Mapováno na akce přes DATAROOM §Příloha A |
| `EXECUTIVE-ONE-PAGER.md` | Kritické riziko (LV výpisy) | P0-06..12 |
| `06-reports/MASTER-DD-REPORT-v1.0.md §12` | Týden 1-16 kritická cesta | Sekce 5, 9 |
| `PPF-PLAYBOOK.md §VI + §XI` | T-48h / T-24h / H-0 příprava checklist | P1-40, 41, 42; Sekce 9 |
| `06-reports/VALUATION-DEFENSE-MEMO.md` | Rezervy řízené oceněním | Pojištění (§8 rozpočet); DANCORE úschova (P0-19) |
| `06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md Část 3` | Plné P0/P1/P2 worklisty | Sekce 2, 3, 4 přímá extrakce |
| `04-legal/DANCORE-FORENSIC-DOSSIER.md §10` | DANCORE P0/P1 akce | P0-01, 02, 03, 04, 19, 26, 31; P2-34 |
| `01-intel/karlin-group-parallel-bidder-dossier.md §11, §12` | Jazyk NDA §11 + monitorovací SOP | P2-05, P2-52; Sekce 10.4 |
| `01-intel/ppf-deal-financing-analysis.md §5, §9, §10` | §23a / CRR 395 omezení; úschova; FX | P0-21, P2-32, P2-42, P2-54, P2-55, P2-56 |
| `02-entity/cuzk-cadastre-forensics.md §9` | P0-1..P0-6 ČÚZK výpisy | P0-06..12 |
| `03-financial/sbirka-listin-audit.md §7` | Mezery prioritních podání | P0-05, P0-14, P1-01..06 |
| `08-comms-templates/*.md` | NDA, CNB 23A, DANCORE zveřejnění, souhlas držitelů dluhopisů, debrief, PPF odpověď, Savills NDA | P0-27, 21, 31, 28, 29; P1-41 |

---

## Příloha C — JEDNOSTRÁNKOVÝ EXEC BRIEF (pro denní carry-sheet Zrůsta)

**Týden 1 jediný fokus: UZAVŘÍT VŠECH 32 P0 POLOŽEK DO 2026-04-28.**

**Dnešní top tři závazky (nosit v kapse)**:
1. **ČÚZK účet otevřen + LV 927 + 1326 staženo** (P0-06, 07, 08) — bez tohoto je každé prohlášení k titulu nepodložené.
2. **Externí M&A counsel + Big-4 vybráno** (P0-23, 24) — brány vše navazující.
3. **DANCORE strategie nastavena + memorandum obhajoby spuštěno** (P0-01, 19) — PPF to najde za 10 dnů; musíme být v předstihu.

**Tři věty Zrůstovi každé ráno 08:30**:
- „Co je dnes jediná položka s nejvyšším rizikem?" → řešit ji první.
- „Co řeknu, pokud PPF zavolá v poledne?" → procvičit odpověď.
- „Kdo vlastní call-back, pokud jsem mimo?" → potvrdit řetězec velení.

**Tři otázky Foralovi každé pondělí**:
- Hotovost v ruce vs spotřeba rozpočtu?
- Jakýkoli PEP / regulatorní šum zachycený přes víkend?
- Jsme stále sjednoceni na podlaze 3,7 mld / cíl 4,5-5,0 mld?

---

**KONEC HLAVNÍHO AKČNÍHO PLÁNU v1.0**

*Udržováno Tomášem Korčákem. Další revize ≤24h dle aktualizací statusu od jakéhokoli vlastníka. v1.1 očekávána 2026-04-28 při uzavření P0 BRÁNY. Append-only changelog od v1.0 dále.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — `../../06-reports/MASTER-ACTION-PLAN.md` (2×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `06-reports/MASTER-ACTION-PLAN.md` (2×)
- [06-reports/pressure-radar.html](./pressure-radar.html) — MASTER-ACTION-PLAN.md
- [06-reports/roadmap-gantt.html](./roadmap-gantt.html) — 📄 Plán
- [BACKLINKS-AUDIT.md](../BACKLINKS-AUDIT.md) — 06-reports/MASTER-ACTION-PLAN.md
- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 06-reports/MASTER-ACTION-PLAN.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `06-reports%2FMASTER-ACTION-PLAN.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
