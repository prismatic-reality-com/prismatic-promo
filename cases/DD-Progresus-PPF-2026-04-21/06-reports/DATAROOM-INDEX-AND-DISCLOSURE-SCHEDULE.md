# INDEX DATAROOMU & DISCLOSURE SCHEDULE — Progresus → PPF DD

**Cílová transakce**: akvizice 42 ha Nový Zeleneč (k.ú. Mstětice 792764) ze strany PPF, prodávající Progresus Group
**Vehikl kupujícího**: PPF reality 2 s.r.o. (IČO 24654744, člen PPF CYPRUS RE MANAGEMENT LIMITED)
**Cílové SPV prodávajícího**: Nový Zeleneč a.s. (IČO 27825981)
**Holdingová společnost prodávajícího**: PROGRESUS Group a.s. (IČO 10978216, ručitel dluhopisů)
**Verze**: 1.0 (2026-04-21) — autoritativní po Pass 4 intel
**Vlastník**: DD desk prodávajícího Progresus (operativní vedoucí: JUDr. Lukáš Zrůst)
**Klasifikace**: DŮVĚRNÉ — pracovní produkt prodávajícího; částečná podmnožina uvolněna PPF pod NDA

---

## EXECUTIVE PREAMBULE — PROČ TENTO DOKUMENT EXISTUJE

Po hloubkových OSINT průchodech 1–4 (ARES / ČÚZK / Sbírka listin / ISIR / soudní rejstříky / dosiery) bylo potvrzeno **18 KRITICKÝCH a 12 VYSOKÝCH red flags**. Tlak na ocenění činí **-18 % až -33 %**, pokud tyto skutečnosti vyplynou během DD PPF bez přípravy prodávajícího.

DD osobnost PPF (Pattern 5, `01-intel/ppf-dd-profile.md`) je "6–8týdenní okno, víkendové dodávky, 4–8hodinový grilling zakladatelů, adversariální prohlášení a záruky (prohlášení a záruky)". Jejich in-house právníci + externí (typicky pro CZ Allen & Overy Shearman / White & Case) najdou každý z těchto flagů během **10 pracovních dnů**. Prodávající vítězí **předzveřejněním s nápravou + strukturou úschovy**, nikoli obhajobou ceny.

**Tento dokument je hlavní kontrolou pro**:
1. Co existuje (READY) vs. co musí být vyrobeno (GAP)
2. Co PPF dostane v dataroomu vs. co zůstává v privilegiu
3. Které výjimky (vynětí) jdou do disclosure schedule SPA
4. Kdo vlastní každý dodatelný výstup + kdy musí být odeslán

---

## ČÁST 1 — INDEX DATAROOMU

### Legenda

| Flag | Význam |
|------|---------|
| READY | Dokument existuje, je zkontrolován, připraven k uploadu |
| PARTIAL | Částečné pokrytí — některé entity / období pokryty; mezera k opravě před uploadem |
| MISSING | Musí být vyroben / získán |
| GAP | Strukturální problém — skutkový stav brání čisté disclosure; vyžaduje návrh mitigace |
| PRIV | Privilegovaný — zveřejnit v čisté místnosti / pouze externí poradce |
| REDACT | Před uploadem nutné redakce (osobní údaje, citlivé obchodní, privilegované) |

---

### A. KORPORÁTNÍ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| A.1 | Osvědčení o zápisu (výpis z OR) + úplné historické výpisy | **Nový Zeleneč a.s. 27825981** | READY | ARES + justice.cz (B 10025/KSOS); `02-entity/cuzk-cadastre-forensics.md` | Public | Zahrnout PLATNY i ÚPLNY výpis |
| A.1 | Výpis — PROGRESUS Group a.s. 10978216 | Holding skupiny | READY | Justice.cz B 26471/MS Praha (subjektId 1126254) | Public | |
| A.1 | Výpis — RD Rýmařov Invest III. alpha s.r.o. 10800123 | Přímý rodič cílové společnosti | READY | Justice.cz C /KSMSPH (subjektId 1120801) | Public | Založena **2021-04-30** — 2 měsíce po vzniku Progresusu |
| A.1 | Výpis — PROGRESUS Developments s.r.o. 14148978 | Rodič rodiče | READY | Justice.cz | Public | |
| A.1 | Výpis — PROGRESUS Bonds s.r.o. 14066661 | Držitel bond SPV | READY | Justice.cz subjektId 1144793 | Public | |
| A.1 | Úplný diagram vlastnického řetězce (od cíle po konečné UBO) | Celý řetězec | **GAP** | Musí vyrobit diagram zobrazující Zrůst (50 %) + Foral (50 %) nahoře | Public | **≥5 úrovní hluboko** — PPF bude požadovat jednostránkovou vizualizaci |
| A.2 | Seznam akcionářů — Nový Zeleneč a.s. (kapitálová struktura, akcie na jméno, listinné) | 27825981 | READY | Interní u prodávajícího; základní kapitál **2 000 000 CZK (20 × 100 000)** | Public | Pozn.: základní kapitál je pro 42ha projekt nepatrný — vyžadováno vysvětlující memorandum |
| A.2 | Seznam akcionářů — PROGRESUS Group a.s. | 10978216 | READY | Interní u prodávajícího | Public | |
| A.2 | Plně rozředěná kapitálová struktura (bez skrytých opcí/warrantů) | Celá skupina | **PARTIAL** | Interní u prodávajícího — potvrdit absenci SAR / phantom / ESOP | Public | |
| A.3 | Zápisy z představenstva / valných hromad — posledních 5 let | **Nový Zeleneč a.s.** | **PARTIAL** | **GAP: vyžaduje se zápis o jmenování Chytilové 2021-01-18** (legacy z Lébrovy éry) | Privileged | **Disclose**: viz Část 2 §1 |
| A.3 | Zápisy z představenstva / valných hromad — PROGRESUS Group a.s. | 10978216 | PARTIAL | V SL pouze rozhodnutí jediného akcionáře 2024 datované 2024-08-30 | Privileged | Požádat interního corporate secretary o kompilaci |
| A.3 | Zápisy z představenstva / valných hromad — stack emitentů dluhopisů (5 emitentů) | 10722696, 17053161, 19287518, 21515841, 23983922 | PARTIAL | Nutno kompilovat per-entitu za posledních 5 let | Privileged | Koncentrace klíčové osoby na Zrůstovi — viz RF-29 |
| A.4 | Schvalovací rezoluce pro plánovanou transakci PPF | PROGRESUS Group + cíl | MISSING | Přijmou se při podpisu | Privileged | Akcionáři holdingu Zrůst/Foral + každé SPV |
| A.4 | Schválení představenstvem — schválení transakce, signatáři | Každá podepisující entita | MISSING | Přijmou se při podpisu | Privileged | |
| A.5 | Evidence skutečných majitelů (výpis z BO registru) | Všechny entity skupiny | **GAP — přístup k UBO registru omezen od prosince 2025** (RF-25) | Justice.cz evidence-skutecnych-majitelu API (nový omezený režim) | Restricted | Vyrobit CSV ze strany prodávajícího + spolehnout se na potvrzení ČNB pro UBO emitentů dluhopisů |
| A.5 | Výpis z BO registru — strana PPF | 24908487, 24908151, 19696477 | N/A | Strana kupujícího; reverzně potvrdit konzistenci | Restricted | |
| A.6 | Diagram struktury skupiny + detaily dceřiných společností (deklarováno 100+ entit skupiny) | Vše | **GAP — pouze 25+ zmapováno v Pass 2; 75+ vyžaduje ARES drill** (`02-entity/confirmed-entities.md`) | Interní u prodávajícího + ARES drill | Public | **Vyrobit kompletní org chart; flagovat reorganizaci 2023-04 → 2024-01** |
| A.6 | Memorandum k reorganizaci skupiny 2023-04 → 2024-01 — co bylo přesunuto, proč, daňové a věřitelské implikace | 9 dceřiných společností 09932836 | **GAP — memorandum dosud neexistuje** | Vyrobit s externím poradcem | Privileged | **RF-14 KRITICKÉ** — načasování vs. příprava transakce |
| A.6 | Projekt rozdělení odštěpením Nový Zeleneč a.s. 2021-05-21 (20 stran) | 27825981 | READY | Sbírka listin SL11 (B 14700) | Public | Mapuje vynětí 42 ha z původní skupiny |
| A.6 | Projekt fúze + projekt přeměny 2023-02-17 → 2023-04-01 | Progresus invest holding core 13995758 | READY | Sbírka listin | Public | Součást reorganizačního clusteru |

---

### B. FINANČNÍ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| B.1 | Auditované účetní závěrky FY2020-2024 — Nový Zeleneč a.s. (cíl) | 27825981 | **MISSING — 4letá prodleva** (RF-27 KRITICKÉ) | Ve spisu pouze FY2020. **FY2021-2024 VŠE CHYBÍ**, porušení §21a zákona o účetnictví | Public | **Plán nápravy povinný — viz Část 3 P0** |
| B.1 | Auditovaná konsolidovaná VZ FY2024 — PROGRESUS Group a.s. | 10978216 | READY | Sbírka listin SL5/B26471 (72 stran, podáno 2026-02-03) | Public | **Jediný nejhodnotnější dokument na straně prodávajícího.** Extrahovat identitu auditora, výnosy, EBITDA, jistinu dluhopisů, schedule kolaterálu, pokračování činnosti (pokračování činnosti), RPT, ručení |
| B.1 | Samostatné výkazy FY21-23 — PROGRESUS Group a.s. | 10978216 | **MISSING — nikdy nepodáno** | Vyrobit retrospektivně | Public | Ručitel dluhopisů bez samostatné historie = red flag pro PPF |
| B.1 | FY21-24 — PROGRESUS invest holding s.r.o. | 09932836 | READY | FY23+FY24 podáno 2026-02-10 (pozdě, ale ve spisu) | Public | |
| B.1 | FY21-24 — RD Rýmařov Invest Holding a.s. | 09963758 | PARTIAL | FY21-23 podáno retrospektivně 2025-03-13; FY24 po termínu | Public | |
| B.1 | FY21-24 — RD Rýmařov Invest Develop a.s. (1. emitent dluhopisů) | 10722696 | PARTIAL | FY21-23 podáno retrospektivně 2025-03-13; FY24 po termínu | Public | |
| B.1 | FY — PROGRESUS RD Rýmařov a.s. (2. emitent dluhopisů) | 17053161 | **MISSING — ŽÁDNÁ podání** | Nutno podat FY22/23/24 | Public | 22 nesplacených tranší dluhopisů |
| B.1 | FY — PROGRESUS RD Rýmařov II a.s. (3. emitent dluhopisů) | 19287518 | **MISSING — ŽÁDNÁ podání** | Nutno podat FY23/24 | Public | 15 tranší dluhopisů |
| B.1 | FY — PROGRESUS RD Rýmařov III a.s. (4. emitent dluhopisů) | 21515841 | **MISSING — ŽÁDNÁ podání** | Nutno podat krátké období FY24 | Public | 7 tranší dluhopisů leden 2025 |
| B.1 | FY — PROGRESUS RD Rýmařov IV a.s. (5. emitent dluhopisů, 2026-01-28) | 23983922 | N/A — dosud nesplatné | — | Public | 7 tranší únor 2026; **vydáno před uzavřením prvního FY — RF-28** |
| B.1 | FY — PROGRESUS Bonds s.r.o. | 14066661 | **MISSING — ŽÁDNÁ podání** | Nutno podat | Public | Drží 3 a.s. emitující dluhopisy |
| B.1 | FY — RD Rýmařov Invest III. alpha s.r.o. | 10800123 | **MISSING — ŽÁDNÁ podání** | Nutno podat | Public | Přímý rodič cíle — materiální |
| B.2 | Měsíční manažerské účetnictví — aktuální FY | Cíl + ručitel | MISSING | Vyrobit z interního ERP | Confidential | Lze očekávat, že PPF si vyžádá trailing 12 měsíců |
| B.3 | Rozpočet + 5letý forecast (development Nový Zeleneč 42 ha) | Cíl | PARTIAL | Existuje interně; nutno formalizovat pro DD | Confidential | Navázat na fázování ÚP 2025-02-18; dokončení Fáze 1 v roce 2030 |
| B.4 | Schedule bankovních účtů + signatáři | Každá entita skupiny | MISSING | Vyrobit z treasury | Confidential | REDIGOVAT IBAN / čísla účtů při uploadu |
| B.5 | **Master schedule dluhopisů** — 5 prospektů, 68 tranší, kapacita programu cca 7,6 mld. CZK | 5 SPV emitujících dluhopisy | **GAP — konsolidovaná master tabulka neexistuje** | Vyrobit konsolidovanou tabulku: ISIN / emitent / nominál / nesplaceno / kupón / splatnost / CoC / covenanty | Public (prospekty) + Confidential (aktuální nesplacené) | **RF-28 KRITICKÉ.** Odhad nesplacené jistiny 2–3 mld. CZK. Viz Část 3 P0 |
| B.5 | Každý ČNB schválený prospekt + final terms + ručitelská listina | 5 emitentů | READY | Veřejná databáze ČNB + indenturní dokumenty u prodávajícího | Public | 1. schválen 2021-06-29, 5. schválen **2026-01-28 během jednání s PPF** |
| B.5 | Křížový přehled Change-of-control (CoC) covenantů per prospekt | Každý emitent | **GAP — NUTNO VYROBIT** | Externí dluhopisový poradce | Privileged | Předtím, než se PPF zeptá |
| B.5 | Matice cross-default napříč 5 indenturami (smlouvami o emisi) | Všichni emitenti | **GAP** | Externí dluhopisový poradce | Privileged | |
| B.5 | Registr držitelů dluhopisů (retailoví investoři, tisíce na prospekt) | PROGRESUS Group (ručitel) | PARTIAL | Registrátor (centrální evidence cenných papírů / interní) | **REDACT — osobní údaje** | Zpracování GDPR údajů držitelů dluhopisů — viz J.3 |
| B.5 | Ručitelská listina — PROGRESUS Group a.s. jako cross-ručitel | 10978216 | READY | Indentury (smlouvy o emisi) dluhopisů | Public | |
| B.6 | Normalizace pracovního kapitálu | Cíl + skupina | MISSING | Standardní schedule úprav WC | Confidential | |
| B.7 | Schedule capexu — development Nový Zeleneč 42 ha | Cíl | PARTIAL | Navázán na dokončení Fáze 1 v roce 2030 | Confidential | |
| B.7 | Schedule capexu — infrastruktura (Inženýrské a technické služby Mstětice 10745246) | 10745246 | PARTIAL | Pre-Progresus nebo Progresus-formed? Vyjasnit | Confidential | |
| B.8 | Manažerské dopisy auditora (poslední 3 roky) — PPF a.s., PPF RE, PPF FH, AMALAR | — | READY | PPF spisy KPMG + BDO | — | Pouze referenční pro stranu kupujícího |
| B.8 | Manažerské dopisy auditora — PROGRESUS Group FY24 | 10978216 | **MISSING — identita auditora není v SL HTML indexu** | Extrahovat z SL PDF (72 stran) | Privileged | |
| B.9 | Účetní postupy (Czech GAAP) | Cíl + skupina | PARTIAL | Obvykle v poznámkách k účetní závěrce | Public | |
| B.9 | **Matice intercompany transakcí** — pohledávky/závazky se spřízněnými stranami, použití výtěžku z dluhopisů, akcionářské půjčky, manažerské poplatky | Celá skupina | **GAP — NUTNO VYROBIT** (PPF Pattern 2) | Externí daňový + právní | Confidential | PPF si toto zrekonstruuje z podání OR — předběhněte je |
| B.9 | **Reconcilace CASPER / Casper Group / Štekl Vitrablok** — 800M celkem vs. 229M podíl Progresusu | Casper Group (David Štekl) + Vitrablok | **GAP — odsouhlasit interně** | 2026-04-01 OCR / interní memoranda | Privileged | Viz Část 2 §3. 229M je podíl Progresusu; 800M je celková transakce s externím spoluinvestorem |
| B.9 | **AMALAR reciproční dotaz** — USD 1,9 mld. zdroj prostředků pro buyout Kellnera Jr. | AMALAR HOLDING 19696477 (strana PPF) | N/A — reciproční | Požádat PPF o zveřejnění pod rámcem vzájemné DD | Confidential | RF-31. Mohlo by jít o úvěr PPF banky → eskaluje konflikt Jiráskové |

---

### C. NEMOVITOSTI (JÁDRO TRANSAKCE)

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| C.1 | Úplný schedule parcel — všechny LV ve vlastnictví Nový Zeleneč a.s. (27825981) v k.ú. Mstětice 792764 | Cíl | **GAP — captcha-walled; nutno stáhnout přes placený ČÚZK dálkový přístup (~2 tis. €)** | ČÚZK dálkový přístup owner query | Public | **RF-13** |
| C.1 | **LV 927 Mstětice 792764 výpis** (kompletní A/B/B1/C/D/E/F) | TBD vlastník | **GAP — NUTNO STÁHNOUT (P0)** | ČÚZK dálkový přístup | Public | Kandidátské parcely 73/1 (24,85 ha) + 178/1 (16,84 ha) = 41,7 ha ≈ 42 ha |
| C.1 | **LV 1326 Mstětice 792764 výpis** | TBD vlastník | **GAP — NUTNO STÁHNOUT (P0)** | ČÚZK dálkový přístup | Public | |
| C.1 | Úplný schedule parcel — všechny LV ve vlastnictví RD Rýmařov Invest III. alpha (10800123) | Spoluručitel | **GAP** | ČÚZK dálkový přístup owner query | Public | Vysvětluje rozdělení projektu ~130 ha |
| C.1 | Rekonstrukce chain-of-title 2007 → 2026 (Quinlan/Golub → Nuka → Lébr/Ravantino → Progresus) | Cílové parcely | **GAP — vyžaduje historické LV pulls** | ČÚZK archival + Sbírka listin Nuka Estates | Public | Viz `02-entity/land-title-chain.md` |
| C.1 | Mapa projektu 130 ha — co vlastní Progresus vs. co vlastní ostatní (Obec Zeleneč, Nuka residual, soukromí zemědělci) | Mstětice k.ú. | **GAP — vyrobit přes ArcGIS RUIAN + owner-queries** | Prismatic RUIAN adapter (navrženo) | Public | PPF bude chtít CELÉ schéma, nikoli jen 42 ha |
| C.2 | Pojistné smlouvy na vlastnické tituly (pokud existují) | Cíl | MISSING — pravděpodobně žádné | Prodávající potvrdí | Confidential | Pojištění titulu je na českém trhu vzácné; možná bude nutno strukturovat při closingu |
| C.3 | Nájemní smlouvy (vstupní / výstupní) — 42 ha je nyní orná půda | Cíl | PARTIAL — pravděpodobně zemědělské pachty (propachtovní smlouvy) | Interní u prodávajícího | Confidential | Standardní zemědělské nájemní klauzule (5-10 let) |
| C.4 | **EIA STC2258** (CENIA) — dokumentace posuzování vlivů na životní prostředí | Cíl (investor = 27825981) | READY | Veřejný portál CENIA | Public | |
| C.4 | Environmentální zprávy Phase I + Phase II | Cílové parcely | MISSING | Zadat externímu environmentálnímu konzultantovi | Privileged | Standard PPF vyžaduje minimálně Phase I |
| C.5 | Testy půdy / podzemních vod | Cílové parcely | MISSING | Zadat | Privileged | Historické zemědělské užívání = riziko zbytků pesticidů/hnojiv |
| C.6 | **Územní plán Zeleneč 2025-02-18** — úplný text, mapy, regulativy | Obec Zeleneč | READY | Obecní portál + archiv prodávajícího | Public | **První územní plán Zelenče vůbec (RF-19)** |
| C.6 | **Petice 2022** ("V Zelenči jsme doma, z.s.", 138 podpisů) — text napadení procesní integrity + odpověď obce | Obec Zeleneč | **GAP — třeba pass v obecním archivu + check Frank Bold advokáti** | Spis odpovědi obce | Public | **RF-2 KRITICKÉ** |
| C.6 | Územní rozhodnutí — Fáze 1 (pokud vydáno) | Cíl | PARTIAL | Stavební úřad Zeleneč | Public | |
| C.6 | Stav stavebního povolení — per parcela / per fáze | Cíl | PARTIAL — nejpravděpodobněji dosud NEvydáno | Stavební úřad Zeleneč | Public | |
| C.7 | Smlouvy o připojení utilit — voda (VaK) | Cíl | MISSING | Vyžádat od VaK Zeleneč | Public | |
| C.7 | Smlouvy o připojení utilit — kanalizace | Cíl | MISSING | | Public | |
| C.7 | Smlouvy o připojení utilit — elektřina (ČEZ Distribuce) | Cíl | MISSING | ČEZ | Public | |
| C.7 | Smlouvy o připojení utilit — plyn (GasNet) | Cíl | MISSING | | Public | |
| C.7 | Potvrzení rezervace kapacity utilit | Cíl | MISSING | | Public | PPF bude požadovat kapacitu per-parcela |
| C.8 | Korespondence s obcí (Obec Zeleneč) | Cíl | PARTIAL | Interní u prodávajícího | Confidential | |
| C.9 | Sousedské dohody / spory | Cíl | UNKNOWN | Interní u prodávajícího | Confidential | Přístupové cesty přes sousední parcely klíčové |
| C.9 | **Dopisy o uvolnění Nuka Estates** — potvrzení o uvolnění všech pre-2021 věřitelských nároků | Nuka Estates s.r.o. v likvidaci 27890104 | **GAP — likvidace STÁLE AKTIVNÍ** (likvidátorka Pavlína Zdařilová od 2023-04-19) | Vyžadovat dopis o uvolnění od likvidátorky; stáhnout Sbírka listin KSOS C 62674 | Privileged | **RF-10 KRITICKÉ** |
| C.9 | **Stav uvolnění zástav MARSEA MIA s.r.o.** | 03454029 | **GAP — stále AKTIVNÍ entita, zástavy mohou zatěžovat pool 130 ha** | ČÚZK dálkový přístup — LV oddíl C "Omezení vlastnického práva"; vyžádat dopis o uvolnění od MARSEA MIA | Privileged | **RF-11 KRITICKÉ.** Jana Lébrová 60 % — propojení s rodinou Lébr |

---

### D. KOMERČNÍ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| D.1 | Smlouvy s top zákazníky (>5M CZK) | Cíl + skupina | PARTIAL | Interní u prodávajícího | Confidential | Pro 42 ha: zatím žádné materiální zákaznické smlouvy (pre-revenue) |
| D.2 | Smlouvy s top dodavateli / subdodavateli | Cíl | PARTIAL | Interní u prodávajícího | Confidential | |
| D.3 | **Pověřovací dopis Aegis Law** — planning counsel | Cíl | **GAP — vyrobit** | Aegis Law | Privileged (vztah advokát-klient) | **PPF bude chtít rozsah + limity poplatků** |
| D.3 | **Architektonická smlouva Studio Perspektiv** | Cíl | **GAP — vyrobit + vyjasnit otázku "3. místo, ne vítěz"** | Studio Perspektiv + ČKA | Confidential | **RF ohledně rizika nesprávné reprezentace, pokud prospekt tvrdí "award-winning"** — viz Část 2 §4 |
| D.3 | Rámec stavebního managementu (jakmile budou vydána povolení) | Cíl | N/A — budoucí | — | — | |
| D.4 | **Dopis o oddělení Lébr / Ravantino** — potvrzení o absenci reziduálních nároků, pokračujícího JV, earn-out doplatku, předkupního práva | Josef Lébr / Ravantino Group | **GAP — NUTNO ZÍSKAT** | Právní zástupce Lébra | Privileged | **RF-12 KRITICKÉ.** Web Ravantino projekt stále inzeruje |
| D.4 | JV / partnerské smlouvy | Cíl + skupina | MISSING (pravděpodobně žádné) | Interní u prodávajícího | Privileged | |
| D.5 | **Inženýrské a technické služby Mstětice s.r.o. 10745246** — role, vlastnictví, rozsah služeb | Infrastrukturní SPV | **GAP — vyjasnit pre-Progresus nebo Progresus-formed** | Interní u prodávajícího + ARES | Public | |

---

### E. PRÁVNÍ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| E.1 | **DANCORE LLC (Nevada #E0353972015-2) sériový spor o vlastnické tituly — KOMPLETNÍ SPIS** | Cíl | **GAP — NUTNO VYROBIT (P0)** | Krajský soud Praha docket **30 Co 228/2019-1538**; všechna 4 procesní kola; odvolání 2024-11-18 stále živé | Privileged | **RF-26 KRITICKÉ.** Viz Část 2 §4 |
| E.1 | Sledování beneficial ownera DANCORE (Nevada SoS + FinCEN BOI) | DANCORE LLC | **GAP** | Nevada SoS + FinCEN BOI (US filings) | Public | Záleží na tom, kdo financoval 6 let soudních sporů |
| E.1 | DANCORE memorandum o právní obhajobě — proč toto není území pro snížení ceny | Cíl | **GAP — vyrobit (P1)** | Externí litigation counsel | Privileged | Předejít odpočtu ocenění PPF |
| E.1 | Úplný schedule sporů — aktivní + hrozící + 7letá ohlédnutí (každá entita Progresus) | Celá skupina | **PARTIAL — zmapováno pouze DANCORE + RD Rýmařov 2009 (zamítnuto)** | Právní oddělení prodávajícího + pull justice.cz | Privileged | Viz `04-legal/isir-court-sweep.md` |
| E.1 | ISIR sweep — každá entita skupiny jako věřitel (nejen dlužník) | Celá skupina | **GAP — vyžaduje CAPTCHA autorizovanou ISIR session nebo dump Hlídač státu** | ISIR + Hlídač státu | Public | RF-17 RD Rýmařov nárok věřitele ve 3 aktivních insolvencích |
| E.1 | Historický insolvenční návrh — RD Rýmařov s.r.o. 2009 (zamítnut do 3 dnů jako "nesmyslný") | 18953581 | READY (disclose jako downgraded) | Archiv HN 2009 + soudní záznam | Public | Viz Část 2 §4 — **nepřehrávat**; disclose faktograficky |
| E.2 | Regulatorní řízení — ČNB (dohled nad dluhopisy) — potvrzení neexistence aktivního vyšetřování | 5 emitentů dluhopisů + ručitel PROGRESUS Group | **GAP — získat clearance letter od ČNB** | ČNB | Privileged | **B1 — distribuční taktiky zmiňované Pro Věřitele + newstream.cz** |
| E.2 | Stavební úřad Zeleneč — probíhající řízení | Cíl | PARTIAL | Obecní | Public | |
| E.2 | Finanční úřad — daňové audity / vyměření / odvolání (posledních 5 let) | Celá skupina | MISSING | FÚ | Confidential | |
| E.3 | Korespondence se státními orgány — materiální | Celá skupina | PARTIAL | Interní u prodávajícího | Confidential | |
| E.4 | Materiální korespondence ke sporům | Celá skupina | PARTIAL | Interní u prodávajícího | Privileged | |
| E.4 | **Insolvenční praxe Zrůsta — certifikace informační bariéra (informační bariéra)** | JUDr. Lukáš Zrůst + Konreo v.o.s. | **GAP — vyrobit (P1)** | Zrůstovy Konreo pověřovací dopisy + atestace informační bariéra (informační bariéra) | Privileged | **RF-16 sníženo, ale architektonická obava zůstává.** Viz Část 2 §5 |
| E.4 | Úplný seznam administrativních případů Konreo (1000+ řízení) vs. deklarace nepřekrývání s portfoliem Progresus | Konreo 04706498 | **GAP** | Hlídač státu IČO dump + ISIR administrator search | Public | |
| E.4 | Obsah doporučení Pro Věřitele + newstream.cz — memorandum odpovědi prodávajícího | PROGRESUS Group | **GAP — vyrobit** | Public | Public | Agresivní retailové prodejní taktiky dluhopisů (RF-4) |
| E.4 | Stav Zrůsta jako registrovaného insolvenčního správce — aktivní / disciplinární záznam | Zrůst osobně | **GAP — potvrdit** | Komora insolvenčních správců + Ministerstvo spravedlnosti | Public | |

---

### F. DAŇOVÉ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| F.1 | Daňová přiznání FY2019-2024 — Nový Zeleneč a.s. | 27825981 | **PARTIAL — stav daňového podání by měl být cross-checknut proti chybějícím účetním závěrkám** | Potvrzovací dopis FÚ | Confidential | |
| F.1 | Daňová přiznání FY2019-2024 — PROGRESUS Group a.s. + emitenti dluhopisů | Skupina | PARTIAL | Interní u prodávajícího | Confidential | |
| F.2 | Daňové audity / vyměření / odvolání (5letý tail) | Celá skupina | MISSING | FÚ | Confidential | |
| F.3 | **Dokumentace převodních cen — intercompany půjčky, management fees, ručení za dluhopisy** | Celá skupina | **GAP — NUTNO VYROBIT (PPF Pattern 2)** | Externí daňový poradce (pravděpodobně Deloitte/EY/PwC Czech) | Confidential | Navazuje na intercompany matici B.9 |
| F.4 | DPH registrace + specifické expozice | Celá skupina | PARTIAL | FÚ | Confidential | Pozn.: Nuka Estates DPH ZANIKLY zatímco VR AKTIVNI (zombie entita — CF-4) |
| F.4 | Účtenky daně z nemovitých věcí — parcely 42 ha | Cíl | PARTIAL | Interní u prodávajícího | Public | |
| F.5 | **Memorandum k daňovému základu — 2021 Lébr → Progresus navýšení** | Akciový obchod cíle | **GAP — VYROBIT (P1)** | Externí daňový poradce | Privileged | **Jde-li o akciový obchod, PPF zdědí historický nízký základ → ovlivňuje daň z budoucího prodeje. Kritické pro oceňovací model PPF** |
| F.5 | Memorandum k expozici pozdního podání — penále za 4letou prodlevu | Cíl + emitenti dluhopisů | **GAP — VYROBIT (P0)** | Externí daňový poradce | Privileged | Rezerva k vytvoření v closing accounts |

---

### G. ZAMĚSTNANECKÉ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| G.1 | Seznam zaměstnanců (anonymizovaný) — headcount per entitu | Celá skupina | PARTIAL | HR prodávajícího | Confidential | Cílové SPV má pravděpodobně minimum / nula přímých zaměstnanců |
| G.2 | Smlouvy klíčových zaměstnanců — Zrůst, Foral, Chytilová | Skupina | **GAP — vyrobit** | HR prodávajícího | Confidential | **Koncentrace klíčové osoby (RF-29) — Zrůst jediný jednatel 4 jádrových entit** |
| G.3 | Struktura odměňování — představenstvo / management | Celá skupina | PARTIAL | HR prodávajícího | Confidential | |
| G.4 | Penze / benefity | Celá skupina | PARTIAL | HR prodávajícího | Confidential | |
| G.5 | Odbory / kolektivní smlouvy | Celá skupina | N/A (nepravděpodobné) | — | — | |
| G.6 | HR spory | Celá skupina | UNKNOWN | Právní oddělení prodávajícího | Privileged | |

---

### H. IP / IT / DATA

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| H.1 | Registrace ochranných známek — "Nový Zeleneč", "PROGRESUS", "RD Rýmařov" | Skupina | **GAP — zkontrolovat ÚPV + EUIPO** | Databáze ÚPV + EUIPO | Public | |
| H.2 | Registrace domén — novyzelenec.com, progresus.cz, rdrymarov.cz, atd. | Skupina | **GAP — vyrobit WHOIS extrakty registrátora** | Registrátor (pravděpodobně CZ.NIC / GoDaddy) | Public | |
| H.3 | Softwarové licence (ERP, CAD, project management) | Cíl + skupina | PARTIAL | IT prodávajícího | Confidential | |
| H.4 | **Řetězec postoupení architektonického IP Studio Perspektiv** | Cíl | **GAP** | Studio Perspektiv + smlouva s architektem | Confidential | Navazuje na D.3 a §4 vyjasnění "3. místo, nikoli vítěz" |
| H.5 | **GDPR — smlouvy o zpracování osobních údajů držitelů dluhopisů** | 5 emitentů dluhopisů + ručitel PROGRESUS Group | **GAP — KRITICKÉ** | DPO (pokud jmenován) + externí GDPR poradce | REDACT | **Tisíce retailových investorů.** Vyžadováno DPIA + DPO. Viz J.1 |
| H.6 | Kybernetická bezpečnostní pozice — portál držitelů dluhopisů, interní systémy | Skupina | PARTIAL | PROGRESUS IT s.r.o. 10916644 | Confidential | |
| H.7 | Diagram architektury IT systémů | Skupina | PARTIAL | PROGRESUS IT | Confidential | |

---

### I. POJIŠTĚNÍ

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| I.1 | Schedule pojistek — majetkové, obecná odpovědnost, profesní odpovědnost, D&O | Celá skupina | **GAP — vyrobit konsolidovaný** | Makléř (pravděpodobně Marsh / Aon / Renomia) | Confidential | **D&O KRITICKÉ — osobní expozice Zrůst / Foral, vyžadováno krytí dosahem (tail)** |
| I.2 | Historie nároků (5letý dosah) | Celá skupina | PARTIAL | Makléř | Confidential | |
| I.3 | Záznamy o ztrátách — per pojistka | Celá skupina | PARTIAL | Makléř | Confidential | |

---

### J. ESG / COMPLIANCE

| # | Dokument | Cílová entita / IČO | Stav | Umístění / Zdroj | Gate | Poznámky |
|---|----------|---------------------|--------|-------------------|------|-------|
| J.1 | Antikorupční / antiúplatkářská politika | Skupina | **GAP — vyrobit, pokud chybí** | Compliance prodávajícího | Public | Standard PPF je kodifikovaná politika + záznamy o školení |
| J.1 | Compliance politika sankcí — EU + UK + US (OFAC) | Skupina | **GAP — vyrobit** | Compliance prodávajícího | Public | |
| J.1 | **Historický reputační tag Casper / David Štekl ("obchodník s chudobou")** — memorandum o zveřejnění | Casper Group + David Štekl | **GAP — vyrobit proaktivní memorandum o zveřejnění** | Interní + veřejný zdroj Euro.cz | Privileged | PPF toto najde. Viz Část 2 §3. Status ve struktuře Progresus: externí spoluinvestor pouze na Vitrablok — NIKOLI v kapitálové struktuře Progresus |
| J.2 | **Memorandum k politické expozici Foral / Michl Quant fund** | Lukáš Foral osobně + Quant SICAV | **GAP — vyrobit** | Archiv HN + texty.hlidacstatu.cz | Privileged | Michl odprodal 2023; okno společné účasti reálné, ale legální. Reputační optika reportovatelná |
| J.2 | **Odsouhlasení Foral Dubai / Nakheel 2006-2012 zprostředkování** | Lukáš Foral osobně | **GAP — vyrobit** | Interní + veřejné zdroje | Privileged | Tok 2,3 mld. CZK byl zprostředkovatelský poplatek + syndikační vehikl, NIKOLI věřitelská expozice |
| J.3 | AML / KYC pozice — pro distribuci dluhopisů | 5 emitentů dluhopisů | **GAP** | Pověření distributora | REDACT | |
| J.3 | KYC záznamy držitelů dluhopisů (retailoví investoři) | 5 emitentů dluhopisů | READY, ale REDACT | Registrátor | REDACT | Osobní údaje — striktní přístup |
| J.4 | ESG reporting / ratingy | Skupina | N/A — pravděpodobně bez ratingu | — | — | |
| J.4 | Uhlíková stopa / fyzické klimatické riziko (Mstětice) | Cíl | MISSING | Environmentální konzultant | Public | ESG tým PPF se může zeptat |

---

## ČÁST 2 — DISCLOSURE SCHEDULE (VÝJIMKY V SPA)

**Rámec**: Pro každou materiální prohlášení a záruky (prohlášení a záruky) kategorii v očekávaném SPA předpřipravená vynětí + prahy materiality + mitigace limitu. Disclosure schedule funguje jako **opěrný bod alokace odpovědnosti** — každá výjimka zde omezuje nároky PPF z porušení záruky po closingu.

**Obecné zásady**:
- **Kvalifikace vědomostí**: "Dle vědomí prodávajících" navázáno na jmenovaný seznam (Zrůst, Foral, Chytilová + M&A lead na straně prodávajícího)
- **Práh materiality**: 5M CZK per jednotlivá položka / 15M CZK agregátně (typické pro transakci této velikosti)
- **Časové limity**: Standardní prohlášení 18 měsíců; daňové 5 let; environmentální 7 let; fundamentální prohlášení (titul, autorita, kapitalizace) 7 let nebo neomezeně
- **Limit odškodnění**: Cíl 10–15 % protiplnění (PPF bude tlačit 20 %+)
- **Úschova**: 7,5–10 % protiplnění, 24–36 měsíců
- **Vynětí pro podvod**: Neomezené, ale vyžaduje skutečný podvod (nikoli nedbalost nebo konstruktivní vědomí)

---

### §1. prohlášení a záruky (prohlášení a záruky) KAPITALIZACE — Výjimky

**Očekávaná klauzule**: "Nejsou nesplaceny žádné warranty, opce, konvertibilní cenné papíry, phantom shares, SAR, ESOP ani jiná práva k nabytí akcií Cíle nebo jakékoli materiální entity skupiny."

**Text vynětí (draft)**:
> "Prodávající uvádějí: (i) jmenování Mgr. Jindřišky Chytilové členkou představenstva Nový Zeleneč a.s. (IČO 27825981) dne 2021-01-18, předcházející vzniku Progresusu (2021-02), je dědictvím jmenování z Lébrovy éry; její korporátní mandát byl ratifikován následnými usneseními akcionářů a nedrží žádná reziduální majetková ani opční práva. (ii) Základní kapitál Nový Zeleneč a.s. je 2 000 000 CZK (20 nominálních akcií à 100 000 CZK, na jméno, listinné); žádné akcie na doručitele, žádná předkupní práva mimo zákonný rámec. (iii) RD Rýmařov Invest III. alpha s.r.o. (IČO 10800123, založena 2021-04-30) je jediným společníkem Cíle; žádné menšinové podíly, žádná akcionářská dohoda mimo standardní společenskou smlouvu s.r.o."

**Materialita**: N/A — fundamentální prohlášení
**Expozice limitu**: Celé protiplnění (fundamentální prohlášení typicky bez limitu)
**Mitigace**: Pre-closing certifikace seznamu akcionářů nezávislým notářem; post-closing právo na odstoupení při porušení fundamentálního prohlášení

---

### §2. prohlášení a záruky (prohlášení a záruky) ÚČETNÍCH ZÁVĚREK — Vynětí pro 4letou prodlevu podání

**Očekávaná klauzule**: "Účetní závěrky Cíle a každé entity skupiny jsou (a) věrný a poctivý obraz v souladu s českým GAAP, (b) podány do Sbírky listin v zákonných lhůtách, (c) nezkresleny v materiálním rozsahu."

**Text vynětí (draft)**:
> "Prodávající výslovně uvádějí: (i) **Nový Zeleneč a.s. (IČO 27825981)**: účetní závěrky za FY2021, FY2022, FY2023 a FY2024 nebyly podány do Sbírky listin v souladu s §21a zákona č. 563/1991 Sb. (zákon o účetnictví). Prodávající zadali [AUDITOR] retrospektivní audit a přípravu všech opožděných závěrek k podání do [DATUM NEJPOZDĚJI CLOSING + 30 dnů]. Riziko zákonných pokut odhadováno na [X] CZK per entita per rok (uvážení Finančního úřadu). Rezerva [Y] CZK byla vytvořena v rozvaze ke closingu. (ii) **PROGRESUS RD Rýmařov a.s. (17053161)**: žádné účetní závěrky podány od založení 2022-04-19; (iii) **PROGRESUS RD Rýmařov II a.s. (19287518)**: žádné účetní závěrky podány od 2023; (iv) **PROGRESUS RD Rýmařov III a.s. (21515841)**: žádné účetní závěrky podány od 2024-04-27; (v) **PROGRESUS Bonds s.r.o. (14066661)** a **RD Rýmařov Invest III. alpha s.r.o. (10800123)**: žádné účetní závěrky nikdy podány. Všechny tyto entity budou uvedeny do compliance do [DATUM]. Prodávající potvrzují, že žádné nezveřejněné závazky nepřesahují částky odražené v manažerských účtech dodaných v B.2."

**Materialita**: 5M CZK individuálně / 15M CZK agregátně (mimo zákonné penále za pozdní podání, která jsou rezervována zvlášť)
**Expozice limitu**: Rezervovaná položka v účtech ke closingu; post-closing dorovnávací (true-up) mechanismus
**Mitigace**: (a) Vyhrazená úschova [X] CZK pro retrospektivní audit; (b) Odškodnění za jakékoli penále Finančního úřadu / Ministerstva spravedlnosti, daňové přeměření nebo věřitelský nárok plynoucí z prodlevy, bez limitu na 5 let; (c) Daňový dosah záruky prodloužen na 7 let pro tyto specifické entity.

---

### §3. prohlášení a záruky (prohlášení a záruky) ABSENCE NEZVEŘEJNĚNÝCH ZÁVAZKŮ

**Očekávaná klauzule**: "Žádné závazky Cíle / Skupiny neexistují vyjma těch odražených v účetních závěrkách nebo vzniklých v běžném obchodním styku."

**Text vynětí (draft)**:
> "Prodávající uvádějí kompletní schedule dluhopisového dluhu skupiny, shrnuto následovně:
>
> | Prospekt | IČO emitenta | Schválení ČNB | Tranší umístěno | Odhad nesplaceno (2026-04-21) |
> | 1. | 10722696 | 2021-06-29 | 18 | [X1] |
> | 2. | 17053161 | 2022-07-04 | 22 | [X2] |
> | 3. | 19287518 | 2023-08-10 | 15 | [X3] |
> | 4. | 21515841 | 2024-12-18 | 7 | [X4] |
> | 5. | 23983922 | 2026-01-28 | 7 | [X5] |
> | **Celkem** | | | **68** | **[Xtot] odhad 2–3 mld. CZK ze ≥7,6 mld. kapacity programu** |
>
> PROGRESUS Group a.s. (IČO 10978216) je cross-ručitel pro všech pět prospektů. Change-of-control covenanty platí per dluhopisová indentura (smlouva o emisi); Prodávající zajistí CoC waivery nebo žádosti o souhlas před closingem pro jakýkoli instrument, kde by CoC trigger vyvolal akceleraci. Prodávající dále uvádějí **spor o vlastnické tituly DANCORE LLC (Nevada #E0353972015-2)** (docket 30 Co 228/2019-1538, Krajský soud Praha) jako podmíněný závazek (viz §4)."

**Materialita**: Kompletní schedule dluhopisů je fundamentální; DANCORE je specifické zveřejnění
**Expozice limitu**: Odškodnění s limitem 15 % protiplnění + úschova
**Mitigace**: (a) Kampaň žádosti o souhlas CoC před podpisem s dluhopisovým poradcem (White & Case nebo A&O); (b) Draft žádosti připravený pro schůzi držitelů dluhopisů; (c) Kompletní křížový přehled CoC covenantů indentura-po-indentuře dodaný s master tabulkou dluhopisů (položka B.5 v Indexu dataroomu); (d) Pojištění proti riziku akcelerace (W&I nebo specifické) pro pokrytí spouštěčových scénářů.

---

### §4. prohlášení a záruky (prohlášení a záruky) SPORŮ — DANCORE explicitně + historická insolvence

**Očekávaná klauzule**: "Žádný spor, správní, rozhodčí ani trestní řízení nejsou neukončena ani nehrozí proti Cíli nebo jakékoli entitě skupiny, vyjma uvedených."

**Text vynětí (draft)**:

> **(a) DANCORE LLC (Nevada #E0353972015-2) v. Progresus spor o vlastnické tituly.**
>
> Prodávající výslovně uvádějí sériový spor vedený DANCORE LLC, společností s ručením omezeným podle práva Nevady, docket **30 Co 228/2019-1538** u Krajského soudu Praha, týkající se určení vlastnictví specifických parcel v k.ú. Mstětice (792764), které tvoří součást projektu Nový Zeleneč. Procesní historie:
>
> 1. 2019: Původní žaloba DANCORE o určení vlastnictví
> 2. První instance — zamítnutí ve prospěch Progresusu
> 3. Odvolací / vrácení k novému projednání
> 4. **2024-06-25**: Druhé zamítnutí (Krajský soud Praha), stejný docket
> 5. **2024-11-18**: Podáno odvolání DANCORE — **STÁLE ŽIVÉ** k 2026-04-21, směřuje k Vrchnímu soudu Praha (odvolací) a potenciálně k Nejvyššímu soudu (kasace)
>
> **Pozn.**: Dřívější odkazy v prospektu dluhopisů na "jediný spor" byly technicky správné (jedna protistrana, jedna podkladová majetková otázka), ale Prodávající uznávají, že PPF může čtyřstupňový procesní záznam považovat za materiálně informativní. Prodávající zadali [LITIGATION FIRM] memorandum k právní obhajobě se závěrem, že pravděpodobnost finálního převrácení titulu je [NÍZKÁ / VZDÁLENÁ]. Prodávající odškodní Kupujícího proti (i) jakémukoli pravomocnému rozsudku nebo narovnání přiznávajícímu DANCORE vlastnictví jakékoli uvedené parcely, a (ii) nákladům právní obhajoby, s ohledem na materialitu a limit.
>
> Prodávající dále uvádějí, že beneficiální vlastnictví DANCORE nebylo veřejně potvrzeno (Nevada SoS + FinCEN BOI lookup probíhá) a vyhrazují si právo tuto disclosure upravit po obdržení uvedených informací.

> **(b) RD Rýmařov s.r.o. (IČO 18953581) insolvenční návrh 2009.**
>
> Prodávající uvádějí pro úplnost, že v roce 2009 byl podán insolvenční návrh proti RD Rýmařov s.r.o. bývalou zaměstnankyní (Hana Černohorská) z titulu nezaplacené provize. Návrh byl **zamítnut do tří dnů** soudkyní Sosnovcovou (Krajský soud Ostrava) jako "nesmyslný". Žádná insolvence nebyla nikdy adjudikována. Nejde o věcnou záležitost a je uvedena pouze v zájmu plné transparentnosti."

> **(c) Insolvenční administrativní praxe Zrůst / Konreo v.o.s.**
>
> Prodávající uvádějí, že JUDr. Lukáš Zrůst (50% vlastník a operativní principal Progresusu) je statutárním ředitelem **Konreo v.o.s. (IČO 04706498)**, registrovaného insolvenčního správce s >1 000 případovými ustanoveními včetně Sberbank CZ, Vítkovice Heavy Machinery, ZOOT a.s. a Amati-Denak. Prodávající po nezávislém přezkumu potvrzují, že **žádný** z veřejně jmenovaných majetkových podstat administrovaných Konreo se nestal aktivem portfolia Progresus (viz certifikace informační bariéra (informační bariéra), §5). Prodávající poskytují atestaci souladu informační bariéra (informační bariéry) od Zrůsta potvrzující (i) žádné využití důvěrných informací dlužníka ve prospěch Progresusu, (ii) žádné nabytí jakéhokoli aktiva Progresusem z řízení Konreo, a (iii) soulad s §16 zákona o advokacii a relevantními požadavky ČNB MiFID.

**Materialita**:
- (a) DANCORE: uvedeno; odškodnění spuštěno při (i) finálním převrácení titulu, (ii) nákladech obhajoby nad 10M CZK
- (b) RD Rýmařov 2009: nemateriální, uvedeno pro transparentnost
- (c) Zrůst/Konreo: nárokována žádná finanční expozice; zveřejnění je reputační

**Expozice limitu**:
- DANCORE: specifické odškodnění rovné pro-rata valuaci dotčených parcel (vymezit LV číslem v příloze SPA) + náklady obhajoby, s limitem [X] M CZK, 10letý dosah
- Zbytek: obecný limit prohlášení a záruky (prohlášení a záruky)

**Mitigace**:
- DANCORE-specifická W&I policy (pojištění titulu + krytí výsledku sporu, je-li dostupné)
- Rezerva na soudní spor v úschově specificky vyčleněná pro DANCORE, uvolněná na finální nenapadnutelné rozhodnutí ve prospěch prodávajícího nebo s limitem stropu nákladů obhajoby
- Atestace informační bariéra (informační bariéra) + průběžná závazková klauzule v SPA

---

### §5. prohlášení a záruky (prohlášení a záruky) SOULADU SE ZÁKONY — Insolvenční praxe Zrůsta

**Očekávaná klauzule**: "Cíl a každá entita skupiny je ve všech materiálních ohledech v souladu se všemi aplikovatelnými zákony a regulacemi, včetně ČNB regulace cenných papírů, zákona o advokacii a aplikovatelných směrnic EU."

**Text vynětí (draft)**:
> "Prodávající uvádějí: (i) Duální role JUDr. Lukáše Zrůsta jako statutárního ředitele **Konreo v.o.s.** (registrovaný insolvenční správce, >1 000 případů) A jediného jednatele čtyř Progresus emitentů dluhopisů (PROGRESUS Bonds s.r.o. 14066661 a jeho dceřiné společnosti) je **architektonická úvaha**, kterou Prodávající adresovali prostřednictvím: (a) procesních kontrol informační bariéra (informační bariéra) mezi kancelářemi Konreo a Progresus; (b) každoroční compliance atestace ČNB v rámci MiFID; (c) zveřejnění konfliktu zájmů dle §16 zákona o advokacii. Žádné vymáhací řízení ČNB nebylo přijato; žádné disciplinární řízení Komory insolvenčních správců neprobíhá (potvrdit certifikací Komory dodanou při closingu). (ii) Agresivní distribuční taktiky retailových dluhopisů zmiňované Pro Věřitele a newstream.cz byly přezkoumány; Prodávající potvrzují soulad s pravidly distribuce ČNB a požadavky vhodnosti MiFID. Záznamy o posouzeních vhodnosti držitelů dluhopisů jsou k dispozici na vyžádání."

**Materialita**: 10M CZK individuálně / 25M CZK agregátně pro compliance porušení
**Expozice limitu**: Obecný limit prohlášení a záruky (prohlášení a záruky)
**Mitigace**: (a) Vyjasňující dopis ČNB získán pre-closing; (b) Certifikace Komory insolvenčních správců získána; (c) Závazek SPA pro Zrůsta udržovat procedury informační bariéra (informační bariéry) 5 let po closingu (s auditním právem kupujícího)

---

### §6. prohlášení a záruky (prohlášení a záruky) DANÍ — Expozice pozdního podání + navýšení

**Očekávaná klauzule**: "Všechna daňová přiznání jsou správně podána, všechny daně zaplaceny, žádné audity neprobíhají."

**Text vynětí (draft)**:
> "Prodávající uvádějí prodlevy v podání účetních závěrek popsané v §2. Odpovídající daňová podání (daň z příjmů právnických osob, DPH) byla podána včas [POTVRDIT], ale absence auditovaných účetních závěrek může vyústit v (a) zpochybnění účetních hodnot Finančním úřadem, (b) odložené daňové dorovnání (true-up), (c) administrativní penále za pozdní podání. Prodávající rezervují [X] CZK v rozvaze ke closingu a odškodní Kupujícího za jakoukoli částku přesahující rezervu, s limitem [Y] na 5 let. Prodávající uvádějí, že akvizice Nový Zeleneč a.s. od Lébra/Ravantino v roce 2021 byla strukturována jako **akciový obchod** (potvrdit kopií SPA z 2021); v důsledku toho Kupující zdědí historický daňový základ podkladového 42 ha v [ZÁKLAD] CZK/m², což znamená, že budoucí prodej Kupujícím vygeneruje zisk nad historickou cenou, nikoli fair value. Prodávající poskytují memorandum k daňovému základu [F.5] s úplným výpočtem."

**Materialita**: Zahrnuto v daňovém odškodnění
**Expozice limitu**: Limit daňového odškodnění — typicky 7–10 % protiplnění, 5letý dosah
**Mitigace**: Daňově specifické W&I pojištění (standardní česká M&A praxe); rezerva [X] CZK v účtech ke closingu; úplná dokumentace převodních cen dodaná před podpisem

---

### §7. prohlášení a záruky (prohlášení a záruky) NEMOVITOSTÍ — Řetězec Nuka + MARSEA MIA

**Očekávaná klauzule**: "Cíl (a každá entita skupiny vlastnící nemovitosti) má řádný a převoditelný titul ke všem nemovitostem, prostý a bez zatížení vyjma uvedených v Schedule [X]; žádné neukončené ani hrozící nároky."

**Text vynětí (draft)**:
> "Prodávající uvádějí historický řetězec titulu pro parcely Nový Zeleneč 42 ha (LV 927 + LV 1326, k.ú. Mstětice 792764):
>
> **Řetězec**: ~2007 akvizice Quinlan Private Residential II Reporting S.à.r.l. (Lucembursko) / Golub Capital (Chicago) → **Nuka Estates s.r.o. (IČO 27890104, nyní "v likvidaci")** → 2008-2010 Globální finanční krize (kolaps Quinlan) → ~2017-2020 zájem Lébr / Ravantino Group → **2021-01 akvizice Progresus** → současná vlastnická struktura přes RD Rýmařov Invest III. alpha s.r.o. (IČO 10800123).
>
> Prodávající uvádějí, že **Nuka Estates s.r.o. zůstává v likvidaci** (likvidátorka Pavlína Zdařilová, jmenována 2023-04-19). Prodávající získali (nebo získají do closingu) písemné potvrzení o uvolnění od likvidátorky potvrzující absenci nesplněných nároků proti parcelám 42 ha. Akvizice Progresus 2021 byla strukturována tak, aby Nuka Estates zachovala všechny pre-akviziční závazky.
>
> Prodávající dále uvádějí, že **MARSEA MIA s.r.o. (IČO 03454029, 60% vlastnictví Jana Lébrová)** historicky držela status zajištěného věřitele vůči Nuka Estates. Prodávající získali (nebo získají do closingu) písemný dopis o uvolnění potvrzující, že všechny zástavy MARSEA MIA proti parcelám 42 ha byly uvolněny. Aktuální výpisy LV (k dodání v položce dataroomu C.1 přes ČÚZK dálkový přístup) neukáží žádné zástavní právo smluvní ve prospěch MARSEA MIA na parcelách 42 ha.
>
> Prodávající uvádějí, že web **Ravantino Group (Josef Lébr, 50 % vlastník)** nadále inzeruje projekt Nový Zeleneč. Jde o **selhání údržby webu**, nikoli pokračující obchodní vztah; formální dopis o oddělení od Lébr/Ravantino potvrzující (a) úplný prodej všech podílů Progresusu v roce 2021, (b) žádná reziduální práva, earn-out doplatky, předkupní práva ani smlouvy o development managementu, (c) Ravantino aktualizuje web do 30 dnů od podpisu, je zahrnut v položce D.4."

**Materialita**: Fundamentální prohlášení — titul je bez limitu
**Expozice limitu**: Specifické odškodnění za ztrátu titulu bez limitu na 7 let; náklady obhajoby v rámci limitu
**Mitigace**:
- **Pojištění titulu** (W&I + specifická pojistka titulu) — silně doporučeno, rozpočet 50–100 tis. EUR pojistné na aktivu 42 ha
- Dopis o uvolnění od likvidátorky Nuka Estates dodaný při podpisu
- Dopis MARSEA MIA o uvolnění zástav + aktuální výpisy LV (oddíly C / D / E prázdné pro zatížení) dodány při podpisu
- Formální dopis o oddělení Lébr / Ravantino dodaný při podpisu
- Spor DANCORE specificky vyčleněn do §4

---

### §8. prohlášení a záruky (prohlášení a záruky) MATERIÁLNÍCH SMLUV — Aegis, Studio Perspektiv, utility

**Očekávaná klauzule**: "Všechny materiální smlouvy (práh >5M CZK roční hodnoty nebo kritické pro provoz) jsou uvedeny v Schedule [X]; žádné materiální porušení; žádné neukončené ukončení."

**Text vynětí (draft)**:
> "Prodávající uvádějí: (i) **Aegis Law** pověření pro planning a regulatorní poradenství (rozsah v položce D.3); (ii) **Studio Perspektiv** smlouva o architektonickém návrhu (položka D.3 + H.4). Prodávající poznamenávají, že předchozí marketingové materiály mohly Studio Perspektiv charakterizovat jako 'vítěze soutěže' pro architektonický koncept Nový Zeleneč; Prodávající vyjasňují, že umístění Studio Perspektiv v zmíněné soutěži bylo [POZICE K POTVRZENÍ PŘES ARCHIV ČKA]. Pokud jakékoli předchozí marketingové nebo prospektové formulace toto přehnaly, Prodávající uznávají a opraví v následných komunikacích. Žádná materiální nesprávná reprezentace nepřipuštěna; vyjasnění je preventivní; (iii) rámcové smlouvy o připojení utilit s VaK, ČEZ Distribuce, GasNet (položka C.7). Prodávající potvrzují, že rezervace kapacity utilit jsou dostatečné pro Fázi 1 (cíl 2030)."

**Materialita**: 5M CZK individuálně / 15M CZK agregátně
**Expozice limitu**: Obecný limit prohlášení a záruky (prohlášení a záruky)
**Mitigace**: Memorandum k vyjasnění Studio Perspektiv pre-signing; ověřovací pull archivu ČKA; revize předchozích marketingových materiálů (kontrola formulací prospektu); vydána opravená zveřejnění

---

### §9. prohlášení a záruky (prohlášení a záruky) OCHRANY DAT — Registr držitelů dluhopisů

**Očekávaná klauzule**: "Cíl a každá entita skupiny je v souladu ve všech materiálních ohledech s GDPR a českým zákonem o ochraně osobních údajů."

**Text vynětí (draft)**:
> "Prodávající uvádějí, že **tisíce retailových investorů** jsou evidovány v registrech držitelů dluhopisů napříč 5 prospekty (záznamy na úrovni registrátora). Smlouvy o zpracování osobních údajů jsou uzavřeny s [REGISTRÁTOR] jednajícím jako zpracovatel dle GDPR čl. 28. DPIA pro oslovení držitelů dluhopisů byla provedena dne [DATUM] [DPO / EXTERNÍM PORADCEM]; zpráva DPIA je k dispozici v položce H.5. DPO [JMÉNO/EXTERNÍ FIRMA] je jmenováno. Prodávající potvrzují absenci materiálního porušení GDPR, řízení ÚOOÚ ani stížnosti subjektu údajů přesahující [PRÁH] v posledních 7 letech."

**Materialita**: 5M CZK individuálně / 15M CZK agregátně (GDPR pokuty mohou dosáhnout 4 % skupinových výnosů — specifické vynětí doporučeno)
**Expozice limitu**: Specifický sub-limit pro GDPR (typicky vyšší než obecný limit vzhledem k expozici pokut)
**Mitigace**: Potvrzení DPO při closingu; DPIA ve spisu; specifické GDPR odškodnění pro pre-closing stížnosti subjektů údajů

---

### §10. prohlášení a záruky (prohlášení a záruky) TRANSAKCÍ SE SPŘÍZNĚNÝMI STRANAMI

**Očekávaná klauzule**: "Všechny transakce se spřízněnými stranami jsou za podmínek arm's-length (s odstupem), uvedeny v účetních závěrkách a uzavřeny v běžném obchodním styku."

**Text vynětí (draft)**:
> "Prodávající uvádějí kompletní registr intercompany transakcí (položka B.9) shrnující: (a) intercompany půjčky mezi PROGRESUS Group a.s. a 5 SPV emitujícími dluhopisy (upstreaming výtěžku z dluhopisů); (b) akcionářské půjčky Zrůsta / Forala (pokud existují); (c) manažerské poplatky mezi PROGRESUS Service center s.r.o. a provozními entitami; (d) převodní ceny za IT služby (PROGRESUS IT s.r.o. 10916644); (e) cross-ručení mezi emitentskými SPV pod indenturami (smlouvami o emisi) dluhopisů; (f) historické protiplnění zaplacené Lébrovi/Ravantinu při akvizici 2021 (uvedeno v položce H.4 + F.5). Každá materiální transakce se spřízněnou stranou je podpořena písemnou smlouvou, memorandem zdůvodňujícím arm's-length (s odstupem) a dokumentací převodních cen pod F.3. Prodávající potvrzují absenci nezveřejněných toků se spřízněnými stranami zahrnujících osobní účty Zrůst / Foral / Chytilová."

**Materialita**: 5M CZK individuálně
**Expozice limitu**: Obecný limit prohlášení a záruky (prohlášení a záruky)
**Mitigace**: Dokumentace převodních cen + memoranda arm's-length (s odstupem) dodány v položce F.3

---

### §11. FUNDAMENTÁLNÍ PROHLÁŠENÍ — AUTORITA PRODÁVAJÍCÍHO + ŽÁDNÁ INSOLVENCE

**Očekávaná klauzule**: "Prodávající mají plnou korporátní pravomoc prodat Akcie; žádný z Prodávajících ani Cíl není insolventní ani předmětem insolvenčního řízení."

**Text vynětí (draft)**:
> "Prodávající potvrzují: (i) žádná entita skupiny není dlužníkem v žádném insolvenčním řízení (ISIR ověřeno čisté pro všechny zmapované IČO skupiny k 2026-04-21; viz §4(b) pro uvedený nemateriální návrh RD Rýmařov 2009); (ii) každý Prodávající platně přijal schvalovací rezoluce (položka A.4); (iii) žádný Prodávající není předmětem exekučního řízení k podpisu (potvrzeno přes Centrální evidenci exekucí pre-closing)."

**Expozice limitu**: Fundamentální prohlášení — bez limitu
**Mitigace**: CEE (exekuce) certifikát + ISIR screen + certifikát Komory insolvenčních správců — vše datováno dnem podpisu

---

## ČÁST 3 — WORKLIST PŘÍPRAVY DOKUMENTŮ

**Priority tiers**:
- **P0 (72 hodin)**: kritická cesta pro připravenost na první call PPF; transakce-breaker mezery
- **P1 (2 týdny)**: podpůrné dokumenty požadované před formálním otevřením DD PPF
- **P2 (4 týdny)**: úklid / úplnost / residuální záležitosti po podpisu

### P0 — 72 HODIN (kritické pro transakci)

| Doc ID | Popis | Vlastník | Stav | Mezera | Termín |
|--------|-------|----------|------|-----|--------|
| P0-01 | DANCORE kompletní spis sporu — docket 30 Co 228/2019-1538, všechna 4 kola, odvolání 2024-11-18 | Externí litigation counsel (TBC) | GAP | Sestavit z Krajského soudu Praha | 2026-04-24 |
| P0-02 | Sledování beneficial ownera DANCORE — Nevada SoS + FinCEN BOI | US counsel přes referal CZ firmy | GAP | Pull US filings | 2026-04-24 |
| P0-03 | PROGRESUS Group a.s. FY24 konsolidovaná VZ — kompletní PDF + memorandum k extrakci po řádcích (ID auditora, výnosy, EBITDA, dluhopisový dluh, kolaterál, ručení, RPT, pokračování činnosti (pokračování činnosti) poznámka) | CFO prodávajícího + externí auditor | PARTIAL (podáno v SL — třeba interní deep-dive) | Extrakce + memorandum | 2026-04-24 |
| P0-04 | Nový Zeleneč a.s. FY2021-2024 retrospektivní audit — engagement letter podepsán + start auditu | CFO prodávajícího + nový auditor (pravděpodobně Big-4 nebo BDO) | MISSING | Zadat auditora okamžitě | 2026-04-24 |
| P0-05 | Master tabulka dluhopisového dluhu — 5 prospektů, 68 tranší, ISIN-po-ISIN nesplaceno, CoC covenanty, cross-default | Externí dluhopisový poradce + treasury skupiny | GAP | Konsolidovaná tabulka | 2026-04-24 |
| P0-06 | LV 927 + LV 1326 výpis — kompletní oddíly C/D/E/F přes ČÚZK dálkový přístup | Právní oddělení prodávajícího + externí property counsel | GAP — vyžadován placený účet | Setup účtu ~2 tis. € | 2026-04-23 |
| P0-07 | Všechny LV držené Nový Zeleneč a.s. + RD Rýmařov Invest III. alpha (ČÚZK owner-based query) | Tentýž | GAP | Stejný účet | 2026-04-23 |
| P0-08 | Dopis o uvolnění likvidátorky Nuka Estates — potvrzení absence nesplněných nároků na 42 ha | Právní oddělení prodávajícího + Pavlína Zdařilová | GAP | Vyžádat + získat | 2026-04-26 |
| P0-09 | Dopis o uvolnění zástav MARSEA MIA + aktuální LV potvrzují absenci zástavního práva | Právní oddělení prodávajícího + counsel MARSEA MIA | GAP | Vyžádat + získat | 2026-04-26 |
| P0-10 | Dopis o oddělení Lébr / Ravantino — žádné reziduální nároky, žádné JV, žádný earn-out doplatek | Právní oddělení prodávajícího + counsel Lébra | GAP | Vyžádat + získat | 2026-04-28 |
| P0-11 | Diagram struktury skupiny (jedna stránka, ≥5 úrovní k UBO) | M&A lead prodávajícího | GAP | Vyrobit diagram | 2026-04-23 |
| P0-12 | DANCORE memorandum k právní obhajobě — pravděpodobnost převrácení titulu | Externí litigation counsel | GAP | Vyrobit memorandum | 2026-04-28 |
| P0-13 | Memorandum k expozici penále za pozdní podání — FÚ + Ministerstvo spravedlnosti | Externí daňový poradce | GAP | Vyrobit memorandum | 2026-04-25 |
| P0-14 | Vyjasňující dopis ČNB — žádné aktivní vymáhání / vyšetřování | Externí dluhopisový poradce + ČNB | GAP | Vyžádat | 2026-04-28 |
| P0-15 | Memorandum k reorganizaci skupiny 2023-04 → 2024-01 — co se přesunulo, daňové a věřitelské implikace | Externí daňový + korporátní poradce | GAP | Vyrobit memorandum | 2026-04-28 |

### P1 — 2 TÝDNY (před otevřením DD PPF)

| Doc ID | Popis | Vlastník | Stav | Mezera | Termín |
|--------|-------|----------|------|-----|--------|
| P1-01 | Nový Zeleneč a.s. FY2021-2024 retrospektivní audit — draft závěrek dodán | Auditor | MISSING | Audit work | 2026-05-05 |
| P1-02 | PROGRESUS RD Rýmařov a.s. (17053161) FY2022-2024 retrospektivní audit | Auditor | MISSING | Audit work | 2026-05-05 |
| P1-03 | PROGRESUS RD Rýmařov II a.s. (19287518) FY2023-2024 retrospektivní audit | Auditor | MISSING | Audit work | 2026-05-05 |
| P1-04 | PROGRESUS RD Rýmařov III a.s. (21515841) FY2024 retrospektivní audit | Auditor | MISSING | Audit work | 2026-05-05 |
| P1-05 | PROGRESUS Bonds s.r.o. (14066661) FY2021-2024 retrospektivní audit | Auditor | MISSING | Audit work | 2026-05-05 |
| P1-06 | RD Rýmařov Invest III. alpha s.r.o. (10800123) FY2021-2024 retrospektivní audit | Auditor | MISSING | Audit work | 2026-05-05 |
| P1-07 | Matice intercompany transakcí — 7letý tail | CFO prodávajícího + externí daňový | GAP | Vyrobit | 2026-05-05 |
| P1-08 | Dokumentace převodních cen — celá skupina | Externí daňový (Deloitte/EY/PwC/BDO) | GAP | Vyrobit | 2026-05-05 |
| P1-09 | Memorandum k daňovému základu — 2021 Lébr → Progresus analýza navýšení | Externí daňový | GAP | Vyrobit | 2026-05-05 |
| P1-10 | CASPER / David Štekl / Vitrablok 800M-vs-229M memorandum o odsouhlasení | CFO prodávajícího + externí forenzní účetní | GAP | Vyrobit | 2026-05-05 |
| P1-11 | Zrůst atestace informační bariéra (informační bariéra) + deklarace nepřekrývání Konreo | Zrůst + externí compliance | GAP | Vyrobit | 2026-05-05 |
| P1-12 | Foral / Michl Quant / Dubai-Nakheel memorandum k politické expozici | Externí reputační/compliance | GAP | Vyrobit | 2026-05-05 |
| P1-13 | Kompletní kapitálová struktura (plně rozředěná) — všechny entity skupiny | M&A lead prodávajícího | PARTIAL | Vyčištění + potvrzení | 2026-04-30 |
| P1-14 | Zápisy z představenstva / valných hromad — všechny entity skupiny, 5letý dosah | Corporate secretary | PARTIAL | Kompilovat | 2026-05-05 |
| P1-15 | Materiály žádosti o souhlas CoC — draft balíčků pro schůzi držitelů dluhopisů | Externí dluhopisový poradce | GAP | Draft | 2026-05-05 |
| P1-16 | Phase I environmentální zpráva — 42 ha | Environmentální konzultant | MISSING | Zadat + obdržet | 2026-05-05 |
| P1-17 | Testy půdy / podzemních vod — 42 ha | Environmentální konzultant | MISSING | Zadat + obdržet | 2026-05-05 |
| P1-18 | Kompletní ARES drill — zbývajících ~75 entit skupiny (deklarace "100+ společností") | OSINT / externí poradce | GAP | Drill + zmapovat | 2026-05-05 |
| P1-19 | Výpis z UBO registru — v rámci nového omezeného režimu | Právní oddělení prodávajícího | GAP | Pull nebo kompilovat ekvivalent na straně prodávajícího | 2026-05-05 |
| P1-20 | Petice Zeleneč 2022 — pass v obecním archivu + odpověď | Externí planning counsel | GAP | Pull | 2026-05-05 |
| P1-21 | Studio Perspektiv vyjasnění "3. místo" — archiv ČKA | Externí IP poradce | GAP | Pull + opravit | 2026-05-05 |
| P1-22 | Pověřovací dopis Aegis Law (redigovaný) | Aegis Law | GAP | Vyžádat + redigovat | 2026-05-05 |
| P1-23 | Rezervace kapacit připojení utilit — VaK, ČEZ, GasNet | Project lead prodávajícího | MISSING | Kompilovat | 2026-05-05 |
| P1-24 | Dodatky k prospektu dluhopisů — aktuální nesplaceno per ISIN | Externí dluhopisový poradce | GAP | Kompilovat | 2026-05-05 |
| P1-25 | D&O schedule pojistek + struktura krytí dosahem (tail) | Makléř | GAP | Kompilovat | 2026-05-05 |
| P1-26 | Analýza klíčové osoby — centralita Zrůsta | Externí M&A poradce | GAP | Memorandum | 2026-05-05 |
| P1-27 | GDPR DPIA + jmenování DPO — registr držitelů dluhopisů | Externí GDPR poradce | GAP | Potvrdit | 2026-05-05 |
| P1-28 | Historie pojistných nároků — 5letý dosah | Makléř | PARTIAL | Kompilovat | 2026-05-05 |
| P1-29 | Frank Bold advokáti check — napadení planning Zeleneč | Externí | GAP | Ověřit | 2026-05-05 |
| P1-30 | Kompletní ISIR case-level sweep — každá entita skupiny jako věřitel | Externí OSINT | GAP | Pull | 2026-05-05 |

### P2 — 4 TÝDNY (úplnost + po podpisu)

| Doc ID | Popis | Vlastník | Stav | Termín |
|--------|-------|----------|------|--------|
| P2-01 | Historické LV výpisy — 2007 → 2026 úplný řetězec titulu | Externí property counsel | GAP | 2026-05-19 |
| P2-02 | Quinlan Private RCS / Lucembursko stav mateřské společnosti — revize historických nároků investorů | Lucemburský counsel | GAP | 2026-05-19 |
| P2-03 | Golub Capital (Chicago) revize historických nároků — irské / US právo | US / irský counsel | GAP | 2026-05-19 |
| P2-04 | Modransky Haj s.r.o. (paralelní vehikl Quinlan) stav | Externí | GAP | 2026-05-19 |
| P2-05 | Memorandum k riziku paralelního zájemce Karlín Group (Borenstein/Samii/Brun) | M&A lead prodávajícího | GAP | 2026-05-19 |
| P2-06 | Frydrych Rusko / Eldorado 2014-2016 post-sankční memorandum (reciproční dotaz PPF) | Compliance prodávajícího | GAP | 2026-05-19 |
| P2-07 | Jirásková/Jirásko PPF-banka spřízněné strany / ČNB §23a ZoB vyjasnění — reciproční dotaz | M&A lead prodávajícího | GAP | 2026-05-19 |
| P2-08 | AMALAR USD 1,9 mld. Kellner Jr. buyout — zdroj prostředků — reciproční dotaz | M&A lead prodávajícího | GAP | 2026-05-19 |
| P2-09 | Registrace ochranných známek — kompletní výpis ÚPV + EUIPO | Externí IP poradce | GAP | 2026-05-19 |
| P2-10 | Domény WHOIS + verifikace vlastnictví — všechny domény skupiny | Externí IP poradce | GAP | 2026-05-19 |
| P2-11 | Seznam zaměstnanců + klíčové smlouvy — celá skupina | HR prodávajícího | PARTIAL | 2026-05-19 |
| P2-12 | Struktura odměňování + incentivní plány | HR prodávajícího | PARTIAL | 2026-05-19 |
| P2-13 | Kompletní registr držitelů dluhopisů — REDIGOVÁN pro GDPR | Registrátor | READY (redigovat) | 2026-05-19 |
| P2-14 | Atestace kybernetické bezpečnosti + nedávný pen-test | Externí IT konzultant | GAP | 2026-05-19 |
| P2-15 | Diagram architektury IT systémů — konsolidovaný | PROGRESUS IT | PARTIAL | 2026-05-19 |
| P2-16 | Antikorupční / antiúplatkářská politika — písemná + záznamy o školení | Compliance prodávajícího | GAP | 2026-05-19 |
| P2-17 | Compliance politika sankcí + screeningové záznamy | Compliance prodávajícího | GAP | 2026-05-19 |
| P2-18 | Uhlíková stopa / fyzické klimatické riziko — Mstětice | ESG konzultant | MISSING | 2026-05-19 |
| P2-19 | ArcGIS RUIAN-based mapa projektu 130 ha + overlay vlastníků | OSINT / externí GIS | GAP | 2026-05-19 |
| P2-20 | Prismatic ČÚZK adapter extension (captcha-aware + PDF dálkový přístup) | Prismatic dev | GAP (tooling) | 2026-05-19 |
| P2-21 | Inženýrské a technické služby Mstětice s.r.o. 10745246 — kompletní due diligence | Právní oddělení prodávajícího | GAP | 2026-05-19 |
| P2-22 | Všechny entity "Acquisitions" (založené 2023-2024) — účel + akviziční záznamy | Právní oddělení prodávajícího | GAP | 2026-05-19 |
| P2-23 | PPF reality 2 s.r.o. + PPF CYPRUS RE MANAGEMENT LIMITED (reciproční dotaz) | M&A lead prodávajícího | GAP | 2026-05-19 |
| P2-24 | Menno Verhoeff + Ondřej Frydrych + Robert Ševela + Aleš Minx revize představenstva PPF (reciproční) | M&A lead prodávajícího | GAP | 2026-05-19 |
| P2-25 | PROGRESUS invest holding core a.s. 2023 fúze/rozdělení | Právní oddělení prodávajícího | PARTIAL | 2026-05-19 |
| P2-26 | RD Rýmařov Invest Develop a.s. revize retrospektivního auditu 2021-2023 | Auditor | PARTIAL | 2026-05-19 |
| P2-27 | Konreo seznam 1000+ případů — deklarace neoverlapu | Zrůst + compliance | GAP | 2026-05-19 |
| P2-28 | Hospodářské Pozemky "sharing ban" (RF-8) — vyjasňující memorandum | Právní oddělení prodávajícího | GAP | 2026-05-19 |
| P2-29 | Nabídkové řízení — případné předkupní právo obce na 42 ha | Právní oddělení prodávajícího | GAP | 2026-05-19 |
| P2-30 | Refresh 5letého forecastu — navázáno na ÚP Fáze 1 2030 | CFO prodávajícího + externí | PARTIAL | 2026-05-19 |
| P2-31 | Mechanismus normalizace pracovního kapitálu | CFO prodávajícího | MISSING | 2026-05-19 |
| P2-32 | Bankovní účet úschovy + smlouva o agentu | Counsel prodávajícího + kupujícího | N/A (closing) | 2026-05-19 |
| P2-33 | Pověření makléře W&I pojištění | Makléř (Marsh/Aon/Willis) | MISSING | 2026-05-19 |
| P2-34 | Pojištění titulu (specifické) — 42 ha | Makléř | MISSING | 2026-05-19 |
| P2-35 | Spuštění kampaně žádosti o souhlas věřitele / držitele dluhopisů | Externí dluhopisový poradce | MISSING | 2026-05-19 |
| P2-36 | Manažerský prezentační podklad (příprava na 4–8hodinový grilling zakladatelů) | M&A lead prodávajícího + komunikace | MISSING | 2026-05-19 |
| P2-37 | Reputační memorandum — Pro Věřitele + newstream.cz | Externí komunikace | MISSING | 2026-05-19 |
| P2-38 | Korespondence s obcí Zeleneč — kompletní pull | Project lead prodávajícího | PARTIAL | 2026-05-19 |
| P2-39 | Historická SPA — 2021 akvizice Nový Zeleneč a.s. Progresusem od Lébra | Právní oddělení prodávajícího | PARTIAL | 2026-05-19 |
| P2-40 | Zdroj prostředků 2021 — financování počáteční akvizice Progresusu | CFO prodávajícího | GAP | 2026-05-19 |
| P2-41 | Memorandum k mezerám čerstvých nul / nástrojů — stav scaffolu Prismatic OSINT adapteru | Prismatic dev (interní) | N/A (nezveřejněno PPF) | — |
| P2-42 | Compliance struktura ČNB §23a ZoB, pokud PPF banka financuje transakci | Externí dluhopisový / bankovní poradce | GAP | 2026-05-19 |
| P2-43 | Pojistné krytí pro specifické DANCORE výsledky (W&I + specifické) | Makléř | GAP | 2026-05-19 |
| P2-44 | Výpočet rezervy zákonných penále — všechny opožděné entity | CFO prodávajícího + daňový | GAP | 2026-05-19 |
| P2-45 | ESG reporting memorandum — co skupina PPF vyžaduje po closingu | Externí ESG | MISSING | 2026-05-19 |
| P2-46 | Balíček manažerské retence — Zrůst, Foral, Chytilová | Prodávající + PPF | MISSING | 2026-05-19 |
| P2-47 | Memorandum k rozsahu zákazu konkurence + zákazu navrhování | Právní oddělení prodávajícího | MISSING | 2026-05-19 |
| P2-48 | Odsouhlasení daně z nemovitých věcí — historická podání | CFO prodávajícího | PARTIAL | 2026-05-19 |
| P2-49 | Aktualizace studie kapacity utilit — horizont Fáze 2+ | Infrastrukturní konzultant | MISSING | 2026-05-19 |
| P2-50 | Sousedské dohody — přístupové cesty, odvodnění, věcná břemena | Právní oddělení prodávajícího | PARTIAL | 2026-05-19 |
| P2-51 | Closing mechanika — notářský zápis / zvláštní usnesení pro převod akcií | Český notář + counsel | MISSING | 2026-05-19 |

---

## ČÁST 4 — DOPORUČENÍ TECHNOLOGIE DATAROOMU

### Výběr platformy

| Možnost | Silné stránky | Slabé stránky | Doporučení |
|---------|---------------|---------------|------------|
| **Ansarada** | Lídr trhu pro M&A; silný modul otázky a odpovědi (otázky a odpovědi) s asistencí AI; robustní audit log; dostupná EU data residency; PPF dříve používala | Prémiové ceny (~15–25 tis. € za 6měsíční DD) | **DOPORUČENO** — v souladu s preferencí PPF |
| iDeals (Virtual Data Room) | Konkurenceschopné ceny; silné technické funkce; vodoznak; workflow otázky a odpovědi (otázek a odpovědí) | Menší brand recognition u protistran úrovně PPF | Sekundární možnost |
| Intralinks / SS&C | Špičkové zabezpečení; používá top-tier banking; robustní oprávnění | Vysoká cena; těžší UI | Nadbytečné pro aktivum této velikosti |
| SharePoint / Dropbox Business | Levné; snadné nastavení | **NEPOUŽÍVAT** — nedostatečný granulární audit, slabý vodoznak, žádný modul otázky a odpovědi (otázky a odpovědi), hosting na straně prodávajícího = expozice privilegia | **ZAMÍTNUTO** |
| **Datasite** | Silná historie adopce u PPF; dobrá přítomnost na českém trhu | Podobná cenová úroveň jako Ansarada | **ALTERNATIVA** k Ansaradě |

**Finální doporučení**: **Ansarada** (primární) nebo **Datasite** (alternativa). Rozpočet 20 tis. EUR na 6měsíční DD okno s opcí prodloužení.

### Architektura řízení přístupů

| Role | Oprávnění | Přístup ke složkám |
|------|-----------|--------------------|
| **PPF Principal team** (Tošek + Jirásková + Stoessel + Ševela) | View + otázky a odpovědi (otázky a odpovědi) | VŠECHNY složky kromě §PRIV |
| **PPF Externí counsel** (např. Allen & Overy Shearman) | View + otázky a odpovědi (otázky a odpovědi) | VŠECHNY složky včetně §PRIV (pouze externí counsel) |
| **PPF finanční poradce** (pokud najat) | Pouze view | Složky A, B, C, F |
| **PPF environmentální konzultant** | Pouze view | Složka C (environmentální subset) |
| **Principal team prodávajícího** (Zrůst + Foral + M&A lead) | Admin | VŠE |
| **Externí counsel prodávajícího** (TBD) | Admin + upload | VŠE |
| **Auditor prodávajícího** | Pouze upload | Složka B (retrospektivní závěrky) |

**Granularita**: Per-uživatel per-složka s auditně logovanými výjimkami. Žádné plošné "all team" role.

### Vodoznak

- **Povinné**: každé PDF s vodoznakem emailu uživatele + časové razítko + IP (viditelné na každé stránce)
- **Razítko Confidential**: všechny finanční + právní dokumenty
- **"OUTSIDE COUNSEL ONLY"** banner na složkách §PRIV
- **Detekce manipulace**: zakázat stahování spustitelných formátů; pouze PDF doručení

### Modul otázky a odpovědi (otázky a odpovědi)

- **Moderátor**: M&A lead prodávajícího + externí counsel prodávajícího (dvouklíčové schválení pro všechny odpovědi)
- **SLA**: 48 hodin pro faktografické odpovědi; 72 hodin pro materiální právní otázky; 7 dnů pro složité (s potvrzením do 24 h)
- **Taxonomie typů odpovědí**: Faktografická / Odkaz na dokument / Potvrzení / Neaplikovatelné / Privilegované / Odložit-na-manažerskou-schůzku
- **Žádný volný text od CFO nebo principalů prodávajícího** — všechny odpovědi schvaluje M&A lead
- **Kategorie Z (Red flags)**: předpřipravené odpovědi pro každý RF-* flag v `RED-FLAGS.md`

### Audit log

- **Retence**: 10 let po closingu (odráží český daňový + prohlášení a záruky (prohlášení a záruky) dosah + GDPR promlčení)
- **Export**: týdenní automatizované PDF + čtvrtletní archiv u prodávajícího + buyer legal hold
- **Forenzní**: vzor přístupu per uživatele, historie stahování, vyhledávací dotazy, otázky a odpovědi (otázky a odpovědi) interakce

### Omezení exportu

- **Stahování zakázáno** pro všechny §PRIV dokumenty
- **Pouze view** pro §REDACT (varování o snímku obrazovky s vodoznakem)
- **Stahování povoleno** pro dokumenty obecného zveřejnění s DRM obalem
- **Tisk zakázán** pro citlivá finanční data + data držitelů dluhopisů
- **Po closingu**: všechen PPF přístup odvolán do 30 dnů; pouze ke čtení archiv pro externí counsel PPF na 10 let

### Posílení kybernetické bezpečnosti

- **MFA povinné** (SMS nebo autentizační aplikace)
- **Geografický IP allowlisting**: CZ + EU + kanceláře PPF pouze
- **Registrace zařízení**: žádný přístup z neregistrovaných zařízení
- **Blokování sdílení obrazovky** (kde podporováno)
- **VDR poskytovatel SOC 2 Type II** potvrzeno před pověřením

---

## ČÁST 5 — SEKVENCOVÁNÍ EXEKUCE (KRITICKÁ CESTA)

### Týden -3 (okamžitě — 2026-04-21 až 2026-04-28)
- Najmout externí counsel (korporátní, daňový, litigation, property, dluhopisový)
- Otevřít účet ČÚZK dálkový přístup (2 tis. €); stažení P0-06/07
- Najmout firmu pro retrospektivní audit
- Návrh memoranda obhajoby DANCORE (P0-12)
- Vyžádat dopisy Nuka Estates + MARSEA MIA + Lébr (P0-08/09/10)
- Vyrobit diagram struktury skupiny (P0-11)
- PROGRESUS Group FY24 konsolidovaná VZ deep-dive (P0-03)
- Pořídit dataroom platformu (Ansarada/Datasite)
- **MILNÍK**: forenzní self-knowledge na straně prodávajícího = 85 %

### Týden -2 (2026-04-28 až 2026-05-05)
- Návrhy závěrek z retrospektivního auditu
- Matice intercompany + převodní ceny (P1-07/08)
- Všechny P1 položky v pohybu
- Reciproční dotazy zarámovány a dodány protistraně PPF
- **MILNÍK**: Dataroom Tier 1 naplněn (všechny P0 + 50 % P1)

### Týden -1 (2026-05-05 až 2026-05-12)
- Retrospektivní audity dokončeny + podány
- Žádost o souhlas CoC spuštěna
- Zbývající P1 položky nahrány
- Manažerská prezentace nacvičena (4–8 hodin)
- Pojištění titulu + W&I pojistka uzavřeny
- **MILNÍK**: 95%+ připravenost

### Týden 0 (otevření DD PPF)
- Dataroom otevřen nejprve externímu counsel PPF (den 1)
- PPF principal team + poradci den 3
- První dávka otázky a odpovědi (otázek a odpovědí) očekávána den 5–7
- Manažerská prezentace týden 2 DD
- Návštěva místa týden 3

---

## PŘÍLOHA A — CROSS-REFERENCE RED-FLAG → DATAROOM

| RF # | Flag | Dataroom položky | Disclosure § | P-Level |
|------|------|------------------|--------------|---------|
| RF-1 | Spor o vlastnictví dluhopisového kolaterálu (Pro Věřitele) | B.5, C.1, C.9 | §3, §7 | P0 |
| RF-2 | Procesní integrita ÚP Zeleneč (petice 138 podpisů) | C.6 | §7, §8 | P1 |
| RF-3 | Pozdní publikace — rozšířeno na RF-27 | B.1 | §2 | P0 |
| RF-4 | Agresivní prodejní taktiky retailových dluhopisů | E.4 | §5 | P1 |
| RF-5 | Duální vlastnictví pozemků (NZ a.s. + III.alpha) | A.1, C.1 | §1, §7 | P0 |
| RF-8 | HP sharing ban (nevyřešeno) | — | §7 | P2 |
| RF-9 | Distressed původ Quinlan Private | C.1 chain-of-title | §7 | P2 |
| RF-10 | Nuka Estates stále v likvidaci | C.9, A.6 | §7 | P0 |
| RF-11 | MARSEA MIA aktivní zajištěný věřitel | C.9 | §7 | P0 |
| RF-12 | Lébr / Ravantino reziduál | D.4 | §7 | P0 |
| RF-13 | Rozsah 130 ha vs. 42 ha | C.1 (mapa projektu) | §7 | P1 |
| RF-14 | Reorganizace 2023-04 → 2024-01 | A.6 | §1, §10 | P0 |
| RF-25 | Přístup k UBO registru omezen | A.5 | §1 | P1 |
| RF-26 | DANCORE LLC 6letý spor | E.1 | §4(a) | P0 |
| RF-27 | NZ a.s. 4letá prodleva podání | B.1 | §2, §6 | P0 |
| RF-28 | Dluhopisový stack 7,6+ mld. CZK (5 prospektů) | B.5 | §3 | P0 |
| RF-29 | Operativní koncentrace na Zrůstovi | G.2, E.4 | §5 | P1 |
| RF-30 | Jirásková + Jirásko manželé (strana PPF) | J.2 (reciproční) | §5 | P2 |
| RF-31 | AMALAR 100 % PPF + buyout USD 1,9 mld. | B.9 reciproční | §10 | P2 |
| RF-32 | PPF NL→CZ redomicile 2026-04-01 | (reciproční) | — | P2 |
| RF-33 | Ševela — operátor PPF s nejvyšší pákou | (intel) | — | — |
| RF-34 | Frydrych Rusko / Eldorado | J.1 (reciproční) | §5 | P2 |
| RF-35 | Verhoeff dodatečný v představenstvu PPF | (reciproční) | — | P2 |
| RF-36 | Minx historický transakce-thesis owner | (reciproční) | — | P2 |

---

## PŘÍLOHA B — ROZHODOVACÍ STROM PRIVILEGE & DISCLOSURE

```
Pro každý dokument:
  1. Je privilegovaný (vztah advokát-klient)?  → Pouze externí counsel (§PRIV)
  2. Obsahuje osobní údaje (GDPR)?             → REDIGOVAT před uploadem
  3. Je obchodně citlivý (cenotvorba,
     seznamy zákazníků, obchodní tajemství)?   → Omezený přístup; vodoznak
  4. Je to CoC covenant indentury (smlouvy o emisi) dluhopisů? → Plné zveřejnění (není privilegované)
  5. Je to regulatorní korespondence?          → Privilegované POKUD vytvořené advokátem;
                                                 Veřejné POKUD podáno regulátorovi
  6. Je to pracovní materiál daňového auditu?  → Privilegované, je-li vyrobeno pro counsel;
                                                 Zveřejnit, je-li podáno na FÚ
  7. Výchozí                                   → Volně zveřejnitelné pod NDA
```

---

## PŘÍLOHA C — RECIPROČNÍ DD DOTAZY (PPF → Progresus)

**Rámec**: Vzájemná DD je vhodná vzhledem k (a) PPF je nová entita (2026-04-01), (b) riziko půjčování spřízněným stranám přes PPF banku (Jirásková/Jirásko), (c) zdroj prostředků AMALAR buyout. PPF bude vzdorovat, ale tržní standard v transakcích tohoto profilu.

| # | Dotaz | Cíl | Důvod |
|---|-------|-----|-------|
| R1 | PPF reality 2 s.r.o. (24654744) — úplný vlastnický řetězec ke konečnému UBO, včetně PPF CYPRUS RE MANAGEMENT LIMITED | Vehikl kupujícího | Daňová strukturace + beneficiální vlastnictví |
| R2 | Smluvní rámec financování PPF banka (pokud je PPF banka věřitelem) | Financování transakce | ČNB §23a ZoB compliance se spřízněnými stranami |
| R3 | ČNB §23a vyjasňující dopis NEBO alternativa třetí banky | Financování transakce | Konflikt manželů Jirásková/Jirásko |
| R4 | AMALAR USD 1,9 mld. Kellner Jr. buyout zdroj prostředků | AMALAR 19696477 | Transakční kontext |
| R5 | PPF Group a.s. + Holdings a.s. (2026-04-01) — akcionářská smlouva, pokud existuje | Mateřská společnost PPF | Solventnost protistrany transakce |
| R6 | Frydrych Rusko / Eldorado post-sankční compliance memorandum | Představenstvo PPF | Signatář PPF v transakci |
| R7 | Ševela 115 společností + 14 mld. CZK státní zakázky — kontrola konfliktu vs. Nový Zeleneč | Investment Officer PPF | Předpojatost schvalovatele transakce |
| R8 | Karlín Group ověření paralelní nabídky (pokud existuje) | Konkurenční tenze | Tržní kontrola |

---

*Konec dokumentu. v1.0 | Sestaveno 2026-04-21. Při každé následné iteraci udržujte verzování.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [03-financial/raw/README.md](../03-financial/raw/README.md) — `../../06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md` (2×)
- [03-financial/UZ-BACKFILE-PREP.md](../03-financial/UZ-BACKFILE-PREP.md) — 06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md
- [04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md](../04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md) — 06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md
- [06-reports/WI-INSURANCE-MEMO.md](./WI-INSURANCE-MEMO.md) — DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `06-reports%2FDATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
