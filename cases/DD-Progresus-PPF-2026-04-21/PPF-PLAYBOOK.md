# Protiútočný scénář pro PPF v2.1 — Progresus DD na straně prodávajícího

**Adresát**: JUDr. Lukáš Zrůst (principál), Lukáš Foral (spoluakcionář), Michal Dvořák, Tomáš Korčák, Karel Duchoň, Václav Faraga
**Účel**: Protiútočný scénář připravený pro představenstvo — předem zodpovězené otázky, rámování, pasti, scénáře pro živé jednání, body páky.
**Stav**: v2.1 (Pass-12 dry-run, 2026-04-28) — NAHRAZUJE v2.0. Zahrnuje informace z Pass 1–4 + Pass-12 deliverables stack (8 nových memos).
**Klasifikace**: INTERNÍ — POUZE TÝM PRODÁVAJÍCÍHO. Nešířit na PPF ani poradce bez schválení akcionářů.
**Propojený spis**: `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/` (MASTER-FINDINGS v1.1, RED-FLAGS v1.1, consolidated-intel-pass3/4, ppf-people-dossiers, cuzk-cadastre-forensics, sbirka-listin-audit, isir-court-průzkum + Pass-12 stack viz §0bis).

---

## 0bis. PASS-12 DRY-RUN AMENDMENTS (2026-04-28)

> 📌 **Co se změnilo proti v2.0**: 8 nových memos rozšiřuje obranu pro Q1, Q2, Q3, Q5, Q12, Q14. Žádný Q nezmizí; čísla zůstávají; jen evidence chain je hlubší.

| Q v §III | Pass-12 deliverable | Co přidává |
|----------|---------------------|------------|
| **Q1, Q2, Q14** (CoC, dluhopisy, refinancování) | `06-reports/BONDHOLDER-PRE-CONSENT-STRATEGY-v1.0.md` | 3-fáze sequencing (T-8 sounding → T-4 solicitation → T-1 cleanup); top 10 institucionálních; sériový-5 (RD Rýmařov IV) doporučeno **vyčlenit a redempovat na par** spíše než consent (cross-default risk). |
| **Q2, Q7** (ÚZ FY21-24 chybí) | `03-financial/UZ-BACKFILE-PREP.md` | T+45 plán dohnání; CZK 700k-1,2M budget; BDO/Mazars audit shortlist (NIKOLI EY — ten je u PPF). |
| **Q3, Q11** (DANCORE, ČÚZK title) | `04-legal/DANCORE-DEFENSE-MEMO-v1.0.md` + `02-entity/CUZK-PAID-PULL-REQUEST.md` | 3 obrana theses: §984 ObčZ materiální publicita / věcná obrana řetězce / settlement CZK 100M target. ČÚZK paid pull T+5 dnů, CZK 50k. |
| **Q5** (klíčová osoba Zrůst, RF-29) | `04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md` | Co-CEO interim (Alvarez & Marsal CZ), D&O 500M Side A + run-off 6 yr, notarizovaný incapacity protocol. CZK 11M Year 1. |
| **Q12** (DANCORE eskalace) | `04-legal/DANCORE-DEFENSE-MEMO-v1.0.md` §III + W&I carve-out coordination | Title insurance + W&I exclusion DANCORE → samostatný carve-out s broker (Marsh/Aon). |
| **§X. body páky** | `06-reports/ALTERNATIVE-BUYERS-WARM-POOL.md` v1.1 | Tier 1 trigger thresholds aktualizovány: < 3,8 mld = okamžitá Fáze 1; 3,8-4,2 mld = paralel; > 4,5 mld = pouze sounding. |
| **MASTER-FINDINGS refresh** | `MASTER-FINDINGS.md` v1.1 | 6 RSLV (CASPER, RONDAX, 4 řízení, HP, Studio Perspektiv, ÚP+EIA) + 5 SUPERSEDED-BY-RF mapping. **C1 (CASPER) je RSLV — neuplatňovat starou narativu.** |
| **RED-FLAGS triage** | `RED-FLAGS.md` v1.1 | Sjednoceny status tagy (OPEN/PENDING-EVIDENCE/MITG/RSLV/DEGR). 3 most-defended: RF-26 DANCORE, RF-31 AMALAR, RF-13 130 ha. |

### Nové red lines pro Pass-12 jednání

1. **RF-29 / Q5 přitvrzeno** — pokud PPF tlačí na single-stakeholder risk, **Co-CEO mandate je deal condition**, nikoli optional. Bez něho deal není closeable.
2. **Sériový-5 dluhopisy** (RD Rýmařov IV, prospekt 2026-01-28, 7 tranší únor 2026) — **DEFAULT na par redemption**, NE consent solicitation. Cross-default risk přes 5 sérií. Disclose proactively.
3. **ÚZ backfile timeline** — pokud PPF tlačí na faster-than-T+45 closing, vyžadovat closing extension. **Audited financials < T+45 nejsou věrohodně doručitelné.**

### Doplňující komunikační principy

- Pokud PPF zvedne RF-26 DANCORE, **nedebatuj judgement details** — odkaž na DANCORE-DEFENSE-MEMO + W&I carve-out + title insurance. Frame: „máme strukturu pro neutralizaci, ne otázku".
- Pokud PPF zvedne ÚZ filing gap, **proactively přiznej** — odkaž na UZ-BACKFILE-PREP s T+45 plánem. Frame: „discovered, scoped, funded, on track".
- Pokud PPF zvedne CoC consent risk, **rovnou ukáz** sériový-5 carve-out — to je signál sophistikace, NE slabosti.

---

---

## I. ZLATÁ PRAVIDLA (5 neměnných)

1. **Nikdy nelži. Nikdy nezlehčuj. Nikdy nehádej.** Tým PPF (Tošek + Ševela + Jirásková + lavička KŠB/BBH/DLA Piper) má forenzní DD schopnosti. Blafování se odhalí během minut a zničí důvěryhodnost celé transakce. Pokud nevíš, řekni „srovnám a vrátím se" — **ne** odhad.
2. **Proaktivní zveřejnění vítězí nad reaktivní obranou.** Každý red flag ve spisu (30 aktivních flagů) musí být v datové místnosti s připravenou narativou DŘÍVE, než se PPF zeptá. Najít problém sám je řádná péče; najít ho až poté, co ho PPF vytáhne, je zatajování.
3. **Čísla jsou posvátná — každé číslo provaž s dokumentem.** Každá vyřčená nebo napsaná částka musí být namapována na konkrétní ID dokumentu v datové místnosti. Žádné „přibližně", žádné „asi", žádné „myslím".
4. **Jeden hlas k jednomu tématu.** Lukáš Zrůst = strategie + právo + historie Progresu; Foral = finance + kapitálová struktura; Michal Dvořák = operace + data; externí poradci = formální právní pozice. Veřejně si neprotiřečte. Když otázka přesahuje domény, zastavte se a sjednoťte se před odpovědí.
5. **Mlčení je pozice.** Když je položena materiální otázka, na kterou nejsi připravený, řekni „nech mě to vzít na zvážení a vrátím se do [konkrétní čas]." To je nesrovnatelně lepší než ukvapená odpověď, která vytvoří expozici v prohlášeních a zárukách.

---

## II. BRIEFING PROTIVNÍKA — KOMU ČELÍŠ

### V místnosti (očekáváno 3–5 z nich)

#### 1. Jiří Tošek — CEO PPF Real Estate Holding — VEDOUCÍ TRANSAKCE
- **Datum nar.**: 1974-05-13 (51 let) | **Adresa**: Terasy IV 1214, Unhošť (Kladno)
- **Vzdělání**: Účetnictví (CZ) + MFin Central Queensland University (Sydney)
- **Kariéra**: ECM Real Estate IR → PPF ECM zástupce CFO → PPF RE (2011–) → CEO PPF RE Holding (~EUR 1,5 mld. AUM)
- **Stopa Hlídače státu**: 45 propojených subjektů, 210 mil. CZK státních zakázek, 162,6 mil. CZK dotací. Vede PPF RE provozní společnosti kancelářských budov (Art Office Gallery, Gen Office Gallery, NA KOŠINCE 2).
- **Nedávno vedené transakce**: Polish New City, Warsaw; rezidenční JV s Karlín Group; pravděpodobně Hilton Prague (2025).
- **Známé chování**: Operativní, ne bankéřský styl. 14 let v PPF RE. Bude řídit DD seznamy + požadavky na data. **Primární operativní protějšek.** Dělí kapacitu mezi Karlín JV + polskou expanzi — Progresus po uzavření soutěží o jeho pozornost.
- **Past**: RE zná do hloubky. Skočí na jakoukoli nesrovnalost mezi prospektem dluhopisů, výpisy z ČÚZK a prohlášeními.

#### 2. Robert Ševela, Ph.D. — Jednatel PPF RE s.r.o. / 20 let ex-PPF Group Investment Officer
- **Datum nar.**: 1975-11-02 (50 let) | **Adresa**: Jasanová 104, Lhota u Dolních Břežan
- **Vzdělání**: VŠE Praha (Ph.D. korporátní finance)
- **Stopa (NEPŘEKONANÁ)**: **115 propojených subjektů, 14 MILIARD CZK státních zakázek** (CzechToll 13 mld. + ČD-Telematika 2 mld.), sledováno 1,83 mld. CZK dotací.
- **Známé chování**: Vrchní investiční ředitel, který přerostl do RE operací. Myslí v IRR a výnosech fondu, ne v metrech čtverečních. 20 let v PPF — loajalita + institucionální paměť.
- **Rozhodovací váha**: Jediný PPF operátor s nejvyšší pákou. Tošek transakci řídí; **Ševela rozhoduje, zda se uskuteční.** Uzavření vyžaduje jeho souhlas víc než kohokoliv jiného.
- **Past**: Každou transakci považuje za jeden vstup do portfoliového IRR PPF — pokud cítí špatné ocenění nebo nepravděpodobné riziko, transakci zabije bez emocí.

#### 3. Kateřina Jirásková — Co-CEO PPF Group (může se objevit pro strategickou session, ne pro detaily DD)
- **Datum nar.**: 1974-01-15 (52 let) | **Adresa**: Zvonická 710/3, Dejvice, Praha 6 **(STEJNÁ JAKO PETR JIRÁSKO — MANŽEL)**
- **Vzdělání**: VŠE Praha
- **Kariéra**: Conseq securities → portfolio manažer PPF (2000) → CEO PPF Asset Mgmt / Generali PPF AM (2000–08) → CFO PPF (leden 2013) → +COO (2021) → předsedkyně PPF a.s. (2024) → spolu-CEO (červen 2025).
- **Známé chování**: 25 let v PPF. „Kellnerova manažerská konstanta" (profil HN). Nízký profil, zástupce establishmentu. „TOP ženy Česka 2025" (MAM.cz).
- **Strukturální asymetrie**: **Provdaná za Petra Jiráska (CEO + předseda představenstva, PPF banka).** Pokud PPF banka financuje jakoukoli část této transakce, jsme na území §23a ZoB ČNB pro spřízněné osoby — učebnicový střet zájmů.

#### 4. Didier Stoessel — spolu-CEO / CIO PPF Group (jen strategicky, v DD místnosti nepravděpodobně)
- **Datum nar.**: 1963-09-30 (62 let) | **Národnost**: francouzská | **Adresa**: Pařížská 98/17, Josefov
- **Kariéra**: Merrill Lynch International → HSBC IB → MTG media → CEO CME (2020, akvizice za 2,1 mld. USD) → CIO PPF (květen 2022) → spolu-CEO (červen 2025).
- **Známé chování**: Bankéřský/mediální rodokmen, žádné RE pozadí. Přepnul z CME operací (předal Samu Barnettovi v květnu 2025) na plné investiční zaměření. Pokud je IRR CME slabé, NAV PPF je slabší, než se reportuje.
- **Rozhodovací váha**: Strategické veto, ne operativní vstup.

#### 5. Ondřej Frydrych — Chief Performance Officer, představenstvo PPF (může pozorovat)
- **Datum nar.**: 1970-11-18 (55 let) | **Adresa**: U Golfu 751, Horní Měcholupy, Praha 10
- **Vzdělání**: Technická univerzita Liberec + **MBA Rochester Institute of Technology (RIT) NY**
- **Kariéra**: Kodak US → Adastra CZ CEO/MP → **CEO ruského Eldorada 2014–2016** → Home Credit 2016–2022 → CPO PPF (duben 2022) → představenstvo (květen 2025).
- **Známé chování**: Role pro ozdravení/optimalizaci. CPO = nákladový tlak napříč portfoliem PPF.
- **Strukturální asymetrie**: **Eldorado Russia 2014–2016** — postsankční prověrka je zranitelností na straně PPF, ne pouze položkou řádné péče. (Viz §X Bod páky #4.)

#### 6. Menno Verhoeff — představenstvo PPF Group (nizozemský právník; bude podepisovat)
- **Národnost**: nizozemská | **Lokace**: Amsterdam
- **Vzdělání**: Erasmus Rotterdam (právo)
- **Kariéra**: ING RE IM → CBRE GI EMEA (vedoucí transakcí) → PPF RE NL+UK (2016) → představenstvo (květen 2025).
- **Známé chování**: Čistý RE technokrat. Bude podepisovat SPA jako člen představenstva PPF Group. **Vymáhací jurisdikce je relevantní, pokud zůstane rezidentem NL po redomicilaci — zeptat se.**

#### 7. Aleš Minx — bývalý předseda představenstva → poradce AMALAR (není v místnosti; relevantní k tezi transakce)
- **Pozadí**: Bývalý předseda PPF Group N.V. Historický vlastník teze transakce spolu se Šmejcem. Nyní rodinný poradce v AMALAR HOLDING (od června 2025).
- **Relevance**: Pokud diskuse o Progresu vznikly před květnem 2025, Minx + Šmejc jsou původními sponzory. **Nový tým spolu-CEO (Jirásková + Stoessel) zdědil tezi a má méně osobního zájmu.** Vektor páky.

### Není v místnosti, ale ovlivňuje rozhodnutí

#### Petr Jirásko — CEO + předseda představenstva, PPF banka (signatář financování)
- **Datum nar.**: 1973-05-13 | Adresa: Zvonická 710/3 (stejná jako Jirásková — **MANŽEL, POTVRZENO**)
- Jmenován CEO PPF banky v říjnu 2013 — ve stejném roce, kdy Kellner povýšil Jiráskovou na CFO PPF Group. **Povýšovací dvojice.**
- **Pokud PPF banka poskytne jakoukoli úvěrovou facilitu** → §23a ZoB spřízněná osoba, vyžaduje se autorizační stopa dozorčí rady, zveřejnění ČNB.

#### Renáta Kellnerová + dcery (rodinná rada; finální UBO schválení)
- **Anna (nar. 1996)**, **Lara Kodl Kellnerová (nar. 2000)**, **Marie Isabella (nar. 2006)** — v představenstvu AMALAR.
- **Schválení rodinnou radou je nutné** pro velké akvizice (dle veřejné DD metodiky PPF). **Vektor zpoždění, pokud nejsou podmínky správné.**
- **Odkup Kellner Jr. za 1,9 mld. USD (srpen 2025)** = zdroj prostředků není veřejný. **Testuje pákovou kapacitu PPF ve stejnou chvíli jako tato transakce.**

### Lavička poradců PPF (pravděpodobná, ale nepotvrzená)
| Firma | Role | Evidence |
|------|------|----------|
| **BBH** | Právo (vedoucí) | Hilton Prague 2024–25, Diplomat, O2 — nejvyšší PPF pravděpodobnost |
| **DLA Piper** (Dubovský) | Právo (rezidenční zaměření) | Rezidenční JV s Karlín Group — RE-specializovaná lavička |
| **KŠB** (Dubecká) | Právo (záloha/struktura) | E-banka, restrukturalizace skupiny |
| **PwC/EY/KPMG/Deloitte** | Finanční DD | PPF rozšířila analytické týmy 2022–25 |
| **JLL / C&W** | RE poradenství | Aktivní český trh |
| **Savills** | Ocenění | Již ocenila NZ aktivum (1,6–2,2 mld. CZK dle prospektu dluhopisů) — **VEKTOR ÚNIKU, zátěžový test NDA** |

---

## III. PŘEDEM ZODPOVĚZENÉ OTÁZKY (20 — 11 aktualizováno + 9 NOVÝCH)

Pro každou: (a) úhel pohledu PPF, (b) rámec odpovědi (citovatelný scénář), (c) past, které se vyhnout, (d) podpůrné dokumenty v datové místnosti, (e) kritická příprava.

---

### Q1 — „Kdo skutečně vlastní Progresus a jaký je vlastnický řetězec?"

**Úhel PPF**: Skrytí skuteční majitelé, zahraniční holdingové vrstvy (Kypr/NL/LU), rodinní nominanti, AML/sankční expozice, nezveřejnění držitelé opcí nebo tichí partneři.

**Odpověď (Zrůst)**:
> „Progresus Group a.s. (IČO 10978216) je 50/50 vlastněna přímo mnou [Lukáš Zrůst] a Lukášem Foralem jako fyzickými osobami — žádné zahraniční holdingové vrstvy, žádná SPV, žádné trusty, žádní nominanti. Naše Evidence skutečných majitelů je aktuální a sedí. Kompletní UBO mapa pro všech ~100 entit skupiny, s každým přímým i nepřímým podílem, je v datové místnosti na [DR-UBO-001]. Žádné nezveřejněné opce ani tiché partnery. Notářské prohlášení v tomto smyslu poskytneme jako součást prohlášení a záruk."

**Past**: NEŘÍKEJ „vlastním Progresus" jako zkratku — PPF se zeptá na finanční struktury, zástavy, opce nebo požitkové zájmy. **Buď přesný ohledně právní entity, která drží tvých 50 %.**

**Datová místnost**: DR-UBO-001 (výpisy eSM obou partnerů), DR-UBO-002 (kompletní mapa skupiny), DR-UBO-003 (akcionářská smlouva Zrůst/Foral), DR-UBO-004 (jakékoli zástavy/opce na akciích Progresus Group).

**Kritická příprava**:
- Potvrdit nulové zástavy na akciích Progresus Group a.s. přes eSM + výpis od notáře
- Předem připravit UBO prohlášení v SPA jazyce

---

### Q2 — „Kolik dluhopisového dluhu je nesplaceno a jaké jsou implikace změny kontroly?"

**Úhel PPF**: Přesná nesplacená jistina, kovenantní harmonogram (prodejní práva, akcelerace, křížové selhání), zda CoC Nového Zelenče spouští akceleraci. **PPF zjistí přes dluhopisar.cz + ČNB CRR, že program tvoří 5 prospektů / 68 tranší / ≥7,6 mld. programové kapacity** — NIKOLI ~1 mld., kterou jste možná rámovali.

**Odpověď (Zrůst)**:
> „Dluhopisový program Progresu zahrnuje **pět prospektů schválených ČNB vydaných přes čtyři aktivní SPV**: (1) RD Rýmařov Invest Develop a.s. (IČO 10722696, 2021), (2) PROGRESUS RD Rýmařov a.s. (17053161, 2022), (3) PROGRESUS RD Rýmařov II a.s. (19287518, 2023), (4) PROGRESUS RD Rýmařov III a.s. (21515841, 2024), (5) PROGRESUS RD Rýmařov IV a.s. (23983922, schváleno 2026-01-28). Souhrnná schválená kapacita programu ~7,6 mld. CZK; umístěno 68 tranší; skutečná nesplacená jistina k [datum] je [X] mld. CZK dle naší interní rekonciliace. Všechny série jsou křížově garantované PROGRESUS Group a.s. Zmapovali jsme každý kovenant a předem připravili žádost o souhlas pro souhlasy související s transakcí."

**Past**: NETVRDIT „dluhopisy jsou izolované od Nového Zelenče", pokud to prospekty výslovně nestanoví. Garantované dluhopisy dosáhnou na všechen majetek skupiny. NEUVÁDĚT programovou kapacitu (7,6 mld.) jako nesplacenou — rozlišit schválenou kapacitu vs. umístěnou jistinu vs. aktuální nesplacenou.

**Datová místnost**: DR-BOND-001 (všech 5 prospektů), DR-BOND-002 (konsolidovaný harmonogram dluhu — dluhopis + úvěr + záruka + intercompany), DR-BOND-003 (kovenantní matice), DR-BOND-004 (počet držitelů + geografie), DR-BOND-005 (předem připravená žádost o souhlas), DR-BOND-006 (korespondence s ČNB ke všem 5 schválením).

**Kritická příprava**:
- **NALÉHAVÉ**: Vytáhnout přesnou nesplacenou částku z nejnovějšího účetnictví; rekonciliovat se Sbírkou listin + ČNB CRR + dluhopisar.cz
- Najmout externího bond counsel na CoC analýzu všech 5 prospektů
- Pokud existuje obava ohledně kovenantu → opravit PŘED hovorem, ne během

---

### Q3 — „Vidíme proveritele.cz a newstream.cz / HN.cz k taktikám prodeje dluhopisů Progresu. Co se děje?"

**Úhel PPF**: Regulatorní expozice (vymáhání ČNB), reputační riziko po akvizici, ocas spotřebitelských stížností, integrita prodejní praxe.

**Odpověď (Zrůst)**:
> „Jsme si vědomi článku proveritele.cz a pokrytí newstream / HN. Každá distribuce dluhopisů probíhá přes licencované obchodníky s cennými papíry v souladu se ZPKT + prospekty schválenými ČNB. Nemáme žádné otevřené vymáhací řízení ČNB ani cease-and-desist. Článek vznáší tři body — [bod 1: agresivní oslovení], [bod 2: charakterizace zajištění], [bod 3: vhodnost pro retailové investory]. Naše odpověď ke každému je zdokumentována na [DR-COMP-001]. Tam, kde Pro Věřitele upozornil na faktickou věc, kterou jsme mohli validovat, jsme již nápravu zapracovali do 5. prospektu (leden 2026)."

**Past**: NEZLEHČUJ Pro Věřitele jako „pouhý blog". Je to renomovaná organizace na ochranu investorů. Zlehčování zní arogantně. NETVRDIT, že obvinění jsou nepravdivá, pokud si nejsi JISTÝ — přemrštěná tvrzení se odhalí.

**Datová místnost**: DR-COMP-001 (kompletní korespondence s ČNB za posledních 5 let), DR-COMP-002 (distribuční smlouvy se všemi obchodníky s cennými papíry), DR-COMP-003 (compliance procedury pro oslovení k dluhopisům — skripty, formuláře vhodnosti), DR-COMP-004 (záznam stížností + dispozice), DR-COMP-005 (interní protiargumentační memo k Pro Věřitele), DR-COMP-006 (sebehodnocení vhodnosti dle ČNB).

**Kritická příprava**:
- **Potvrdit písemně** žádné aktivní vyšetřování ČNB (memo compliance officera)
- Vytáhnout každý dopis ČNB za 3 roky (i neškodné dotazy)
- Compliance counsel přezkoumá tři hlavní tvrzení Pro Věřitele — připravit bod-po-bodu protiargumentační memo
- **Pokud je jakékoli tvrzení Pro Věřitele fakticky správné** — disuzavření + strukturovat nápravu v datové místnosti DŘÍVE, než to PPF najde

---

### Q4 — „42 ha v Novém Zelenči je rozděleno mezi entity. Projděte nás vlastnickou historií a akvizičním řetězcem zpět k původnímu vlastníkovi."

**Úhel PPF**: Stopa akviziční řádné péče, zdroj prostředků, daňový základ, podmíněná protihodnota, expozice z krizového řetězce (Quinlan → Nuka Estates → Lébr → Progresus).

**Odpověď (Zrůst)**:
> „Cílem je **Nový Zeleneč a.s. (IČO 27825981)**, 100% vlastněná **RD Rýmařov Invest III. alpha s.r.o. (IČO 10800123, založeno 2021-04-30, Karlín)**, ta pod **PROGRESUS Developments s.r.o. (IČO 14148978)**. Pozemek leží v k.ú. Mstětice (kód **792764**). Projekt v marketingové prezentaci čítá ~130 ha; perimetr transakce je 42 ha, konkrétně parcely [budou uvedeny v SPA]. Řetězec vlastnictví: [původní vlastníci před 2007] → éra Quinlan Private / Nuka Estates → Josef Lébr / Ravantino Group (2020-2021) → Progresus (2021-01). Předložíme každou převodní smlouvu i stopu zdroje prostředků naší akvizice."

**Past**: NEHÁDAT u rozdělení hektarů ani parcelních čísel. Vytáhnout přesné výpisy ČÚZK pro LV 927 + LV 1326 (Mstětice 792764) PŘED hovorem. NEZAPOMENOUT, že `Nuka Estates s.r.o. v likvidaci` (IČO 27890104, Holická 1173/49a, Hodolany, Olomouc — likvidátorka Pavlína Zdařilová od 2023-04-19) je stále aktivní a dotýká se tohoto řetězce.

**Datová místnost**: DR-TITLE-001 (SPA: akvizice Nový Zeleneč a.s. 2021 + RD Rýmařov III. alpha 2021 + předchozí transakce s Lébrem), DR-TITLE-002 (kompletní řetězec vlastnictví zpět do katastru před 2007), DR-TITLE-003 (zdroj prostředků pro akvizici Progresu), DR-TITLE-004 (daňový základ + harmonogram odložené daně), DR-TITLE-005 (jakékoli vedlejší dohody, předkupní práva, opce od předchozích vlastníků), DR-TITLE-006 (LV 927 + LV 1326 aktuální + historické), DR-TITLE-007 (potvrzení uvolnění/uspokojení MARSEA MIA / Nuka Estates).

**Kritická příprava**:
- **P0**: Otevřít účet ČÚZK dálkový přístup, vytáhnout LV 927 + LV 1326 kompletní + historické, ověřit žádné aktivní zástavy/věcná břemena/předkupní práva
- **Ověřit, že MARSEA MIA (IČO 03454029)** je plně uspokojena a uvolněna — Jana Lébrová drží 60 % = orbita rodiny Lébr se aktiva stále dotýká
- Zmapovat řetězec Quinlan/Nuka Estates: existuje riziko clawbacku ze strany likvidátora? (Nuka v likvidaci od 2023-04-19)
- Nový Zeleneč a.s. založen 2007-12-20 — vlastníci před Progresem z let 2007-2020 musí být plně zmapováni

---

### Q5 — „ÚP Zeleneč byl schválen v únoru 2025. Občanská petice z roku 2022 namítá procesní pochybení (138 podpisů). Právní stav?"

**Úhel PPF**: Stabilita územního rozhodnutí (kritické pro ocenění ~1,6–2,2 mld. CZK kotvy dle Savills), riziko správního sporu, status promlčení, politické alignment s obcí.

**Odpověď (Zrůst + externí poradce)**:
> „Územní plán Zeleneč-Mstětice byl přijat 2025-02-18 po dokončení plné zákonné procedury. Petice z roku 2022 (138 podpisů) vznášela obavy ohledně přeměny zemědělské půdy a tvrdila procesní vazby mezi zástupcem plánu a projektantem plánu. Tyto obavy byly vypořádány ve finálním plánu + odpovědi obce [DR-UP-003]. Žádná správní žaloba není pendentní u NSS ani u krajského správního soudu k [datu ověření]. Zákonná lhůta pro přímou napadnutelnost (2 měsíce od přijetí plánu) uplynula. Držíme právní stanovisko od [externí poradce] potvrzující stabilitu."

**Past**: NETVRDIT „žádná opozice" — petice je veřejná. Uznej ji, rámuj jako vyřešenou. NETVRDIT, že lhůta uplynula, bez znovuověření v den hovoru (některé strany mají delší okna).

**Datová místnost**: DR-UP-001 (kompletní text ÚP + schvalovací usnesení + zápisy obce), DR-UP-002 (petice z 2022 + odpověď obce), DR-UP-003 (memo k procesní integritě: analýza střetu projektant/zástupce), DR-UP-004 (potvrzení vyhledávání u NSS + krajského soudu — nula aktivních případů), DR-UP-005 (externí právní stanovisko ke stabilitě rozhodnutí), DR-UP-006 (časový harmonogram obecních konzultací 2020-2025), DR-UP-007 (screening střetu zájmů politiků/úředníků).

**Kritická příprava**:
- Znovu ověřit vyhledávání u NSS + Krajského soudu Praha do 48 h před hovorem
- Nezávislé právní stanovisko, že lhůta je definitivně uzavřená
- Pokud existuje JAKÝKOLI pendentní případ — disuzavření + strategie urovnání DŘÍVE, než to PPF najde přes nssoud.cz

---

### Q6 — „Kompletní harmonogram sporů. Všechny aktivní, hrozící i urovnané za posledních 7 let."

**Úhel PPF**: Rozsah zveřejnění pro prohlášení a záruk, podmíněné závazky, kapacita managementu, reputace. DD průzkum z 2026-04-01 označil „4 řízení reportovaná jako 1" — **víme, že jde o sériovou DANCORE litigaci.** PPF to najde přes fulltextové vyhledávání justice.cz jediným dotazem.

**Odpověď (Zrůst + externí poradce)**:
> „Náš komplexní harmonogram sporů je na DR-LIT-001. Obsahuje [N] aktivních případů, [M] uzavřených za posledních 7 let, [P] hrozících věcí, [Q] regulatorních řízení. Celková expozice napříč aktivními věcmi: [částka]. Nejpodstatnější aktivní věcí je sériový spor o vlastnictví pozemku **DANCORE LLC** k parcelám Nového Zelenče — chci se k tomu otevřeně vyjádřit níže v Q12. Žádný jiný případ individuálně nepřesahuje 2 % hodnoty transakce. Máme D&O a obecné pojištění odpovědnosti za [podmínek]."

**Past**: NEPOČÍTAT z paměti. Předchozí zjištění „4 jako 1" jsou DANCORE kola 1-4 — řešit preventivně (viz Q12). NEZAPOMENOUT, že RD Rýmařov s.r.o. vystupuje jako věřitel ve 3 aktivních insolvencích — zmapovat každou.

**Datová místnost**: DR-LIT-001 (master schedule: soud, žalobce, částka, status, rezervy), DR-LIT-002 (pojistný harmonogram + limity), DR-LIT-003 (korespondence k hrozícím věcem), DR-LIT-004 (veškerá regulatorní korespondence — ČNB, FAÚ, ÚOOÚ, kataster), DR-LIT-005 (platné dohody o smíru), DR-LIT-006 (rekonciliace fulltextu justice.cz na entitu).

**Kritická příprava**:
- Vytáhnout fulltextové vyhledávání justice.cz pro KAŽDÉ IČO Progresu (Zrůst udělá; externí poradce validuje)
- Rekonciliovat proti internímu harmonogramu; identifikovat a vysvětlit jakoukoli mezeru
- Předem představit DANCORE, aby Q12 byla čistá

---

### Q7 — „Zajištění dluhopisů: Pro Věřitele tvrdí, že zastavené nemovitosti ‚nepatří emitentovi‘. Jak reagujete?"

**Úhel PPF**: Potenciální zabiják transakce. Pokud je to pravda, držitelé dluhopisů drží fantomové zajištění = skandál. **Kritické vědět, zda jsou dluhopisy zajištěné (specifické zajištění) vs. nezajištěné se skupinovou zárukou.**

**Odpověď — pokud je struktura prospektu pouze enterprise-guarantee (žádné konkrétní zástavy)**:
> „Charakterizace v článku není pro náš současný program správná. Naše dluhopisy jsou křížově garantovány **PROGRESUS Group a.s.** — která vlastní přímo nebo nepřímo 100 % aktiv skupiny. **Žádná konkrétní nemovitost není zastavena ve prospěch jednotlivých držitelů dluhopisů**; záruka je celopodniková. Předložíme harmonogram aktiv ručitele + konsolidovanou ÚZ FY24 (podaná 2026-02-03, DR-FIN-005). Právní stanovisko od [bond counsel] potvrzuje čistou strukturu."

**Odpověď — pokud kterýkoli prospekt specifikoval zajištění**:
> „1. a 2. prospekt (RD Rýmařov Invest Develop + PROGRESUS RD Rýmařov a.s.) odkazují na [konkrétní zajištění]. Připravili jsme rekonciliaci s rejstříkem zatížení ČÚZK na DR-BOND-007. [Případnou diskrepanci zde — zveřejnit.] 3.–5. prospekt používá enterprise záruku, posouzenou a schválenou ČNB."

**Past**: **Nikdy** neodbývat bez zdokumentované odpovědi. Pokud prospekt deklaruje konkrétní zajištění a rejstřík zatížení ČÚZK to neodpovídá, jde o prohlášení a záruk + potenciálně trestní expozici.

**Datová místnost**: DR-BOND-001..006 (viz Q2), DR-BOND-007 (rekonciliace zajištění z prospektu vs. zatížení v ČÚZK), DR-BOND-008 (harmonogram aktiv PROGRESUS Group a.s. + konsolidovaná ÚZ FY24 — SL5/B26471), DR-BOND-009 (stanovisko bond counsel), DR-BOND-010 (případné dodatky / opravná oznámení k prospektům).

**Kritická příprava — NALÉHAVÉ před jakýmkoli hovorem s PPF**:
- **Přečíst sekci o zajištění v každém jednotlivém prospektu dluhopisů Progresu**
- **Porovnat každé tvrzení prospektu s rejstříkem zatížení ČÚZK pro každou zmíněnou parcelu**
- Při jakékoli diskrepanci → externí bond counsel stanovisko + plán nápravy IHNED
- Připravit 2stránkové protiargumentační memo na Pro Věřitele s citacemi dokumentů

---

### Q8 — „Transakce se spřízněnými osobami — jak jsou na tržní bázi?"

**Úhel PPF**: Expozice transferových cen, únik hodnoty na vlastnictví, skryté dividendy, daňová struktura. Také — ekosystém Konreo / Casper / Progresus (viz Q15).

**Odpověď (Zrůst + daňový poradce)**:
> „Všechny vnitroskupinové transakce jsou dokumentovány s tržní cenotvorbou. Hlavní kategorie: (a) intercompany půjčky na ČNB 2T repo + [X]% spread, (b) manažerské služby, (c) nájmy nemovitostí. Dokumentace transferových cen existuje pro všechny materiální toky na DR-RPT-001. Žádné rozdělování zisku akcionářům nad [Y] CZK za posledních 5 let. Nulové transakce se spřízněnými osobami s Konreo v.o.s. nebo s entitou spravovanou Konreo (samostatné Chinese-wall memo na DR-RPT-004)."

**Datová místnost**: DR-RPT-001 (registr intercompany transakcí + TP dokumentace), DR-RPT-002 (metodika manažerských poplatků), DR-RPT-003 (historie rozdělování zisku akcionářům), DR-RPT-004 (Zrůst-Konreo Chinese-wall memo: certifikace, že žádné aktivum Progresu nepochází z konkursní podstaty spravované Konreo), DR-RPT-005 (korespondence s daňovou správou k TP).

**Kritická příprava**: Zadat nezávislou TP srovnávací studii PŘED hovorem.

---

### Q9 — „Skupina má 100+ entit. Co je v rozsahu transakce a co ne?"

**Úhel PPF**: Definice perimetr transakceu, mechanika vynětí, po uzavření náklady na separaci, závislosti na brandu + sdílených službách. Časově podezřelé: reorganizace 2023-04→2024-01 (9 dceřiných restrukturalizováno).

**Odpověď (Zrůst + Dvořák)**:
> „Perimetr transakce Nový Zeleneč zahrnuje [Nový Zeleneč a.s. (27825981), RD Rýmařov Invest III. alpha s.r.o. (10800123) a konkrétní SPV vyjmenované v DR-PERIM-001]. **Výslovně mimo rozsah**: výroba dřeva RD Rýmařov, Vitrablok/Seves Glass Block (již vystoupeno), všechny SPV emitenti dluhopisů, holding Progresus Group a.s., všechny operativní společnosti mimo nemovitosti (doplňky, právo, IT, poradenství). Máme návrh TSA + plán separace značky na DR-PERIM-002."

**Past**: NESOUHLASIT s volným perimetrem, který může PPF později rozšířit. Uzamknout pozitivní i negativní seznam výslovně v NDA / exclusivity letter.

**Datová místnost**: DR-PERIM-001 (seznam perimetr transakceu — pozitivní + negativní + zdůvodnění), DR-PERIM-002 (návrh TSA), DR-PERIM-003 (inventář sdílených služeb), DR-PERIM-004 (plán separace značky/IP), DR-PERIM-005 (dokumentace restrukturalizace 2023-04→2024-01 — vysvětlení obchodního zdůvodnění, žádný signál transakce).

---

### Q10 — „Environmentální expozice na 42 ha?"

**Úhel PPF**: Český zákon o environmentální odpovědnosti, historická kontaminace, kontingence nákladů na sanaci.

**Odpověď (Zrůst + environmentální konzultant)**:
> „EIA proveden (případ CENIA **EIA_STC2258**). Historické využití pozemku: zemědělské (viz rozpis druhu pozemku k.ú. Mstětice: 78 % orná půda). Žádná průmyslová minulost. Phase I ESA dokončena; Phase II cílené testování dokončeno. Žádná kontaminace nad akčními úrovněmi. Všechny zprávy v DR-ENV. Environmentální pojištění na DR-ENV-005."

**Datová místnost**: DR-ENV-001 (kompletní EIA EIA_STC2258), DR-ENV-002 (Phase I + II), DR-ENV-003 (rešerše historického využití pozemku — vlastníci před 2007, případné zemědělské/průmyslové využití), DR-ENV-004 (obecní záznamy), DR-ENV-005 (env pojištění).

---

### Q11 — „Historie pana Zrůsta jako insolvenčního správce. Implikace?"

**Úhel PPF**: Konflikty u zdrojů aktiv, překryvy s bývalými klienty, reputační zátěž, expozice osobních sporů. Ekosystém Konreo: ZOOT, Vítkovice Heavy Machinery (prodej za 1,2 mld.), Sberbank CZ, FAU, Vitrablok.

**Odpověď (Zrůst)**:
> „Moje insolvenční praxe přes Konreo v.o.s. (IČO 04706498) — 1 000+ případů včetně ZOOT, VHM, FAU, Vitrablok, Sberbank CZ — je veřejný záznam a je oddělená od investic Progresu. **Z veřejně jmenovaných případů Konreo se žádný z dlužnických subjektů nestal aktivem Progresu.** Chinese-wall memo na DR-RPT-004 certifikuje žádný osobní překryv. Moje profesní akreditace je v dobrém stavu u Ministerstva spravedlnosti. Náš architektonický přístup: rozhodnutí Konreo přijatá jako správcem jsou oddělena od investičních rozhodnutí Progresu formální politikou + jiným personálem + zveřejněním vůči věřitelským výborům."

**Past**: NEZNĚT defenzivně. Jde o legitimní DD. NETVRDIT, že je nulová architektonická obava — architektonický konflikt (1 000+ správ + 50% retailový emitent dluhopisů) je regulátorské úrovně a uznáván; soustředit se na zveřejnění + formální separaci.

**Datová místnost**: DR-INS-001 (kompletní seznam případů Konreo spravovaných Zrůstem), DR-INS-002 (akviziční historie Progresu + certifikát žádného překryvu), DR-INS-003 (aktuální profesní status MSp), DR-INS-004 (etické memo od externího poradce ke Chinese-wall architektuře), DR-INS-005 (případné kárné věci u MSp — potvrzeno nulové).

**Kritická příprava**:
- Vytáhnout úplný seznam případů spravovaných Zrůstem z ISIR (CAPTCHA — možná manuální session paralegala)
- Zkřížit s akvizicemi Progresu; **preventivně vyřešit jakýkoli překryv s zveřejnění + etickým memem**

---

### Q12 [NOVÉ] — „DANCORE LLC (Nevada) — 6letá sériová litigace s vazbou na USA, podáno odvolání. Vysvětlete."

**Úhel PPF**: Bomba č. 1, kterou PPF najde jedním hovorem s externím poradcem. DANCORE LLC (Nevada #E0353972015-2), spis Krajského soudu Praha **30 Co 228/2019-1538**, **dvakrát zamítnuto** (naposledy 2024-06-25), **odvolání podáno 2024-11-18 STÁLE ŽIVÉ**. Zveřejnění v prospektu dluhopisů jako „jediný spor" je pravděpodobně zavádějící.

**Odpověď (Zrůst + externí poradce — společně)**:
> „DANCORE LLC je nevadská entita, která v roce 2019 podala u Krajského soudu Praha žalobu na určení vlastnictví (spis 30 Co 228/2019-1538) k vybraným parcelám Zelenče. Jejich nárok byl **zamítnut** v prvním kole, podán znovu při odvolání/vrácení a **znovu zamítnut 2024-06-25**. DANCORE podal odvolání 2024-11-18 — aktuálně u Vrchního soudu Praha. Analýza našich externích poradců: vlastnické právo Progresu je z hlediska merita čisté; 6letá procesní historie odráží trvání DANCORE i přes dvě prohry. **Jsme připraveni řešit rezervy + smírčí pozici v SPA transparentně** — navrhujeme úschova vynětí specificky pro nepravděpodobné riziko DANCORE, abychom vás izolovali od jakéhokoli nepříznivého výsledku. Právní memo na DR-LIT-010."

**Past**: NEZLEHČOVAT jako „administrativní". NEŘÍKAT „jen nespokojený žalobce" — nevadská entita + 6 let + aktivní odvolání je vážné. NEDOPUSTIT, aby PPF objevil přes rámování „jediný spor" v prospektu a porovnal s procesní realitou — **zveřejni plnou procesní historii DŘÍVE, než se zeptají.**

**Datová místnost**: DR-LIT-010 (kompletní spis DANCORE 30 Co 228/2019-1538 včetně rozhodnutí 2024-06-25 + podání odvolání 2024-11-18), DR-LIT-011 (podání DANCORE u Nevada SoS + FinCEN BOI stopa: **kdo skutečně vlastní DANCORE LLC?**), DR-LIT-012 (memo externího poradce k obhajobě DANCORE: meritum, pravděpodobnost nepříznivého rozhodnutí, ocenění smíru), DR-LIT-013 (návrh znění SPA pro DANCORE úschova vynětí).

**Kritická příprava — P0**:
- Vytáhnout firemní podání DANCORE u Nevada SoS (veřejné, zdarma na nvsos.gov)
- Provést FinCEN BOI vyšetřování na skutečné vlastníky DANCORE
- Plné stažení spisu z Krajského soudu Praha
- Memo externího poradce k DANCORE v datové místnosti PŘED prvním hovorem s PPF

---

### Q13 [NOVÉ] — „Nový Zeleneč a.s. nemá ve sbírce listin účetní závěrky za FY2021-2024. Čtyřletá prodleva. Vysvětlete."

**Úhel PPF**: **Mezera kritická pro transakci** — PPF nemůže ocenit bez reálných čísel. Porušení §21a zákona o účetnictví. Pokud konsolidovaná ÚZ ručitele dluhopisů vynechává data cílové SPV, riziko zveřejnění dluhopisů se násobí.

**Odpověď (Zrůst + Foral + účetní)**:
> „Máte pravdu — cílová SPV naposledy podala FY2020. SPV operovala jako čistý pozemkový vehikl s minimální provozní aktivitou 2021-2024, což vedlo k uvolnění podání disciplíny. To není přijatelné vysvětlení a napravujeme to: **účetní závěrky FY2021-2024 jsou připravovány a budou podány do Sbírky listin před [datum — 14 dní před podpisem]**. Návrhy před podáním na DR-FIN-020..024. Podkladová data jsou jednoduchá — pozemkový SPV, financovaná intragroup půjčkou, žádné provozní výnosy — takže příprava je mechanická, ne forenzní. Akceptujeme uzavření podmínku navázanou na dokončení podání."

**Past**: NETVRDIT „minimální aktivita vysvětluje chybějící podání" bez doplnění „napravujeme to". Právní porušení je reálné, i když je ekonomický dopad nulový. NENECHÁVAT to jako otevřenou položku — **podej DŘÍVE, než s PPF voláte, pokud je to vůbec možné.**

**Datová místnost**: DR-FIN-020..024 (návrh ÚZ FY2021-2024 Nový Zeleneč a.s.), DR-FIN-025 (prohlášení účetního: integrita dat retroaktivní přípravy), DR-FIN-026 (plán podání + cílové datum), DR-FIN-027 (memo k riziku pokuty §21a — typické pokuty jsou v desítkách tisíc CZK).

**Kritická příprava — P0**:
- **Podat ÚZ Nový Zeleneč a.s. FY2021-2024 OKAMŽITĚ — to je dvoutýdenní práce účetního, ne diskuse v DD fázi.**
- Stejná náprava pro všechny 4 SPV emitenty dluhopisů s nulovou ÚZ (PROGRESUS RD Rýmařov a.s., II, III, IV, PROGRESUS Bonds s.r.o., RD Rýmařov Invest III. alpha s.r.o.)
- Dokumentovat dokončení podání v datové místnosti

---

### Q14 [NOVÉ] — „Stack dluhopisů je 7,6+ mld. CZK programové kapacity napříč 5 prospekty. Kovenanty, nesplaceno, CoC?"

**Úhel PPF**: Akcelerace při změny kontroly by mohla být zabiják transakceem. 5 prospektů složitelně násobí kovenantní komplexitu. 5. schválen 2026-01-28 **během jednání s PPF** — PPF se zeptá, zda byly výnosy z emise použity v kontemplaci transakce.

**Odpověď (Zrůst + Foral + bond counsel)**:
> „Programová kapacita schválena ~7,6 mld. CZK napříč 5 prospekty. Skutečná nesplacená jistina k [datum] je [X] mld. CZK; umístěno 68 tranší. Kovenanty CoC, prodejní a křížové selhání každého prospektu jsou zmapovány na DR-BOND-003. 5. prospekt (schválen 2026-01-28) byl součástí předem naplánované obnovy programu — použití výtěžku bylo standardní pozemkový financování, žádné specifické pro transakci vyhrazení [DR-BOND-011]. Předem připravenou žádost o souhlas pro držitele dluhopisů máme na DR-BOND-005 připravené pro jakýkoli požadavek na CoC souhlas. Počet držitelů + geografická koncenstopa na DR-BOND-004."

**Past**: NETVRDIT „žádná CoC expozice" bez přezkoumání ustanovení. NEUHÝBAT před načasováníem 2026-01-28 — preventivně dokumentací použití výtěžku.

**Datová místnost**: Viz Q2 + DR-BOND-011 (dokumentace použití výtěžku 5. prospektu s načasováníem vnitřního pro transakci rozhodnutí).

**Kritická příprava**: Rekonciliovat umístěnou jistinu vs. programovou kapacitu na CZK přesně, na emitenta. Memo bond counsel k CoC na úrovni ustanovení. Předem připravený balíček souhlasů.

---

### Q15 [NOVÉ] — „Co-investice Casper Group / David Štekl na Vitrabloku — 800M/229M. Plus historické vazby Alfa-Invest + Mostecká uhelná. Vysvětlete."

**Úhel PPF**: Casper Consulting = veřejně označován jako „obchodník s chudobou" (Euro.cz, cerd.com). Historické vazby: Alfa-Invest (vehikl ruského národního, příznak českých bezpečnostních služeb), Mostecká uhelná (privatizační podvodová sága). PPF to bude pojímat jako AML/reputační riziko.

**Odpověď (Zrůst)**:
> „Casper Group (David Štekl) byl spoluinvestorem na Vitrabloku / Seves Glass Block v letech 2023-2024. Celková hodnota transakce ~800M CZK; podíl Progresu ~229M. Akvizice byla přes veřejnou insolvenční dražbu se schválením věřitelského výboru a mezinárodním tendrem [DR-VIT-001]. Vystoupili jsme do Sediveru/Blackstonu za 25 mil. EUR v říjnu 2025 [DR-VIT-002]. Casper není v kapitálová tabulka Progresu, není věřitelem žádné entity skupiny a žádné zbytkové ujednání neexistuje. K historii Alfa-Invest / Mostecká uhelná pana Štekla: toto riziko jsme uvedli v naší vlastní řádné péči před investicí, ujistili jsme se, že současné operace Casperu nemají zakázané protistrany a strukturovali jsme naši spoluinvestici tak, abychom čistě vystoupili — což jsme po 12 měsících udělali [DR-VIT-003 memo o řádné péči]. **Progresus nemá žádné další vazby na Casper a žádné plány budoucích spoluinvesticí.**"

**Past**: NEPOPÍRAT reputační label. NETVRDIT, že jste neviděli tisk. **Přiznej + ukaž, žes to řídil + dokaž, žes čistě vystoupil.** NENECHÁVEJ žádné zbytkové vazby na Casper/Štekl — pokud existují, zveřejni.

**Datová místnost**: DR-VIT-001 (dokumentace akvizice Vitrablok — zápisy věřitelského výboru, příkaz k insolvenčnímu prodeji, záznamy mezinárodního tendru), DR-VIT-002 (SPA výstupu Sediver/Blackstone + rozdělení výnosů), DR-VIT-003 (interní memo o řádné péči Progresu ke Štekovi), DR-VIT-004 (certifikace: žádná přítomnost Casper/Štekl ve skupině Progresu po výstupu z Vitrabloku).

**Kritická příprava**: Provést interní průzkum pro potvrzení nulových Casper zbytků. Připravit 1stránkové memo k expozici Štekl předem.

---

### Q16 [NOVÉ] — „Pan Zrůst je jediným statutárem každé entity v transakční vertikále — cíl + matka + babička + SPV dluhopisů. Riziko klíčové osoby?"

**Úhel PPF**: Potvrzeno: **Zrůst je jediným statutárem Nového Zelenče a.s. + RD Rýmařov III. alpha s.r.o. + PROGRESUS Developments s.r.o. + PROGRESUS Bonds s.r.o. + všech 4 aktivních SPV emitentů dluhopisů.** Jediná indispozice = operativní rozpad. Transakce doslova prochází jednou osobou.

**Odpověď (Zrůst)**:
> „Máte pravdu, že jsem jediným statutárním ředitelem napříč transakční vertikálou. Odráží to operativní design pro rychlé rozhodování během pozemkový fáze, nikoli preferenci faktoru klíčové osoby. Pro tranzici do PPF jsme připraveni (a) jmenovat spoluředitele určeného PPF nebo vzájemně dohodnutého profesionála před podpisem, (b) zavést pojištění odpovědnosti vedení (D&O) se specifickým pokrytím transakce, (c) podepsat osobní závazky včetně plánu na případ indispozice, (d) přenést odpovědnost jediného ředitele při uzavřeníu. Memo k navrženému posílení governance na DR-GOV-001."

**Past**: NEHÁJIT strukturu pouze argumentem „efektivity" — obava je legitimní. NENABÍZET osobní záruky jako náhradu governance nápravy.

**Datová místnost**: DR-GOV-001 (před podpisem memo posílení governance: jmenování spoluředitele, D&O, plán pro indispozici, plán tranzice).

**Kritická příprava**: Připravit nominaci spoluředitele; prověřit kandidáty; připravit D&O závaznou indikaci s Marsh/Willis/AON.

---

### Q17 [NOVÉ] — „AMALAR 100% vlastnictví + 1,9 mld. USD Kellner Jr. odkup. Všimli jsme si — váš UBO je jednoduchý, náš je složitější. Symetrický požadavek na zdroj prostředků."

**Úhel PPF**: **OBRÁCENO — toto je zranitelnost PPF.** Pouze 8 % akcií AMALAR HOLDING je v přímých rodinných jménech (Renáta Kellnerová 2,3 %, tři dcery po 1,9 %). Zbývajících 92 % drženo přes [nejmenovaný zahraniční vehikl]. Vlastní UBO řetězec PPF má vrstvu neprůhlednosti, kterou Progresus nemá. Plus zdroj prostředků pro 1,9 mld. USD srpnového Kellner Jr. odkupu 2025 není znám — možná půjčka PPF banky → §23a konflikt manželů Jirásková/Jirásko.

**Odpověď (Zrůst — uhýbavá + asertivní, NIKOLI defenzivní)**:
> „Rád probereme symetricky. Náš UBO je transparentní přes dvě fyzické osoby, žádné zahraniční vrstvy a poskytli jsme úplné výpisy eSM. U transakce této velikosti očekáváme zrcadlový zveřejnění ze strany PPF: (a) kompletní kapitálová tabulka AMALAR HOLDING od přímých jmen fyzických osob až po jakoukoli entitu, která drží zbylých ~92 %, (b) potvrzení zdroje prostředků pro srpnový odkup Petra Kellnera Jr. za 1,9 mld. USD 2025, (c) pokud bude PPF banka poskytovat úvěr v této transakci, plnou autorizační stopu §23a ZoB pro spřízněné osoby, vzhledem k tomu, že paní Jirásková předsedá PPF a.s., zatímco její manžel pan Jirásko předsedá představenstvu PPF banky. Považujeme to za standardní hygienu po roce 2023 AML-DAC režimu."

**Past**: NEvytahovat, dokud PPF nevytáhne UBO/SOF první — ale mít to nacvičené a připravené. Pokud PPF tlačí na UBO/SOF Progresu, toto je protitah. **Tón faktický, ne konfrontační.**

**Datová místnost**: DR-REVERSE-001 (šablona symetrického zveřejnění požadavku na UBO PPF).

**Kritická příprava**: Externí poradce předem zhodnotí symetrický zveřejnění požadavek na případné riziko pomluvy / soutěžního práva při formálním vznesení §23a úhlu. Předem rozhodnout, zda toto je:
- (a) vznášeno proaktivně jako rozumné DD zrcadlení, nebo
- (b) nasazeno pouze, pokud PPF zbraňově použije transparentnost UBO/SOF Progresu.

**Doporučení**: Možnost (b). Držet v rezervě.

---

### Q18 [NOVÉ] — „PPF banka je přirozený finanční partner. Jirásková předsedá PPF a.s., Jirásko předsedá PPF bance — manželé, stejná adresa. Clearance §23a ČNB?"

**Úhel PPF**: Pokud PPF banka financuje jakoukoli část, je to učebnicový §23a ZoB (osoby se zvláštním vztahem k bance). Vyžaduje autorizaci dozorčí rady bez hlasování spřízněné osoby, ČNB zveřejnění, dokumentované tržní podmínky.

**Odpověď (Zrůst) — NEjde o defenzivní odpověď, je to strukturální požadavek ve VÁŠ prospěch**:
> „Předpokládáme, že PPF si určí vlastní finanční strukturu. Pokud bude PPF banka věřitelem na jakékoli tranši, budeme potřebovat autorizační stopu §23a ZoB jako součást uzavření podmínek — zápisy dozorčí rady (bez hlasování paní Jiráskové), podání spřízněné osoby u ČNB, tržní cenové stanovisko od nezávislé banky. Pokud PPF preferuje neaffiliovanou banku (syndikát, ČSOB, KB, Raiffeisen, ČNB-licencovaná zahraniční pobočka), můžeme podpořit rychlý časový harmonogram dokumentace. Obě cesty nám vyhovují — upozorňujeme to, protože vada §23a ve financování by mohla vytvořit transakční riziko, které přežije uzavření."

**Past**: NEFORMULOVAT jako obvinění. Formulovat jako **ochranu obou stran před budoucí vadou §23a**. NENAVRHOVAT konkrétní alternativní banku — nech PPF zvolit.

**Datová místnost**: DR-FIN-030 (návrh uzavření-condition jazyka §23a ZoB).

**Kritická příprava**: Bankovní poradci předem připraví uzavření-condition znění §23a. Zmapovat kapacitu středně velkých českých bank pro potenciální alternativní financování (indikativní podmínky).

---

### Q19 [NOVÉ] — „Schéma má 130 ha (k.ú. Mstětice celkem orná ≥5 ha). Perimetr transakce je 42 ha. Co dalších 88 ha?"

**Úhel PPF**: PPF bude chtít vědět, zda existuje opce / ROFR / etapová transakce pro získání dalších 88 ha — a pokud ano, za jakou cenu. To je strategická informace.

**Odpověď (Zrůst)**:
> „K.ú. Mstětice má 11 velkých orných parcel s celkem 135,1 ha (potvrzeno ČÚZK). Perimetr transakce 42 ha pokrývá [konkrétní parcely k vyjmenování, např. 73/1 + 178/1 = 41,7 ha]. Zbývající parcely drží [mix: třetí strany, zemědělské družstvo, ponechaný podíl Progresu]. Progresus drží [X] ha mimo perimetr transakce — jsme ochotni diskutovat opční strukturu nebo ROFR pro tuto část za tržních podmínek, oceněných separátně [DR-SCOPE-001]. Nemáme exkluzivitu na parcely vlastněné třetími stranami."

**Past**: NEPROZRAZOVAT schéma. NEZVEŘEJŇOVAT, kteří jiní developeři krouží. NEZAVAZOVAT se k opčnímu pricingu v DD.

**Datová místnost**: DR-SCOPE-001 (mapa vlastnictví parcel mimo perimetr — Progresus ponechaný vs. třetí strany), DR-SCOPE-002 (volitelná struktura pro po uzavření akvizici dalších parcel).

**Kritická příprava**: Rozhodnout pozici akcionářů, zda nabídnout ROFR na ponechaných parcelách Progresu před hovorem. Pokud ano, předem připravený smluvní rámec opční struktury. Pokud ne, jasné sdělení, že další parcely jsou retainované.

---

### Q20 [NOVÉ] — „Nuka Estates v likvidaci + zástavy MARSEA MIA. Čistá nemovitostní práva?"

**Úhel PPF**: Historický řetězec vlastnictví prošel přes Nuka Estates (éra kolapsu Quinlan Private, stále v likvidaci od 2023-04-19, likvidátorka Pavlína Zdařilová). MARSEA MIA s.r.o. (IČO 03454029, Jana Lébrová 60 % — rodina Lébr) byla historickým zajištěným věřitelem. Pokud existují zbytkové zástavy nebo expozice clawbacku ze strany likvidátora, vlastnictví není čisté.

**Odpověď (Zrůst + externí poradce)**:
> „Řetězec vlastnictví se v převodu z éry 2020 dotýká Nuka Estates s.r.o. (IČO 27890104). Nuka je v likvidaci od 2023-04-19 pod likvidátorkou Pavlínou Zdařilovou. Máme potvrzení likvidátorky na DR-TITLE-008, že žádný clawback ani zrušovací akce nejsou ve vztahu k naší akvizici z roku 2021 zvažovány. **MARSEA MIA** (IČO 03454029) byla historickým zajištěným věřitelem Nuka — máme na DR-TITLE-009 uspokojení a release od MARSEA MIA datované [datum], potvrzující žádnou zbytkovou zástavu na žádné parcele, kterou prodáváme. Aktuální výpisy LV 927 + LV 1326 ČÚZK [DR-TITLE-006] potvrzují čisté vlastnictví. Pozn.: Jana Lébrová (MARSEA MIA 60 %) je součástí orbity rodiny Lébr původních developerů; její uspokojení je datováno po převodu a plně zdokumentováno."

**Past**: NEŘÍKAT „čisté vlastnictví" bez výpisů LV v ruce. NEIGNOROVAT vazbu rodiny Jana Lébrová / Josef Lébr — řešit explicitně.

**Datová místnost**: DR-TITLE-006 (LV 927 + LV 1326 aktuální, datované do 7 dnů od hovoru s PPF), DR-TITLE-008 (potvrzení likvidátorky Nuka Estates: žádný clawback se neplánuje), DR-TITLE-009 (uspokojení + release MARSEA MIA), DR-TITLE-010 (memo k zveřejnění orbity rodiny Lébr: MARSEA MIA → Jana Lébrová → Valogante → Josef Lébr).

**Kritická příprava — P0**:
- Výpisy LV z ČÚZK dálkový přístup DO 7 DNŮ PŘED HOVOREM
- Certifikát uspokojení MARSEA MIA na spisu
- Dopis likvidátorky Nuka potvrzující žádnou akci proti Progresu
- Nezávislé stanovisko k titulu od českého RE poradce

---

## IV. TAKTICKÉ SCÉNÁŘE PRO ŽIVÉ JEDNÁNÍ

### Obecné (zachováno z v0.1, vylepšeno)

**Když nemáš odpověď**:
> „To je přesná otázka. Nech mě potvrdit s týmem a vrátím se do 4 hodin [nebo: další pracovní den]. Raději budu přesný než rychlý."

**Když tlačí na závazek, který nemůžeš dát**:
> „Chápu důležitost. Proberu to s mým spoluakcionářem a externím poradcem a vrátím se s formální pozicí."

**Když vytáhnou něco neočekávaného**:
> „Ten konkrétní dokument jsem neviděl. Pošlete referenci — přezkoumáme a vrátíme se s úplnou odpovědí na příští session."

**Když se snaží rozdělit Zrůsta a Forala**:
> „Nech mě potvrdit s [druhým akcionářem] a odpovědět společně. Naše praxe je hovořit jedním hlasem k materiálním otázkám."

**Když loví**:
> „Ptáte se na [X]. Pomozte mi pochopit, co konkrétně tu otázku vyvolává — můžeme to plně řešit, když víme, na co se díváte."

**Když citují média / proveritele.cz / HN**:
> „Tento článek znám. Pojďme spolu projít naším pohledem a podpůrnými dokumenty na [DR-REF]. Připravili jsme bod-po-bodu odpověď."

**Když hrozí odchodem**:
> „Chápeme, že DD vyžaduje čas. Jsme zavázáni k plné transparentnosti. Pokud jsou konkrétní obavy, řešme je — nemyslíme, že signál z této session je důvod ke zrušení transakce."

### Konkrétní scénáře pro předvídatelné tlakové body

**Když PPF cituje tvrzení proveritele.cz o zajištění**:
> „Článek vznáší tři konkrétní tvrzení: [vyjmenovat]. Náš dluhopisový program je struktura cross-guarantee enterprise — žádná konkrétní nemovitost nezastavená ve prospěch jednotlivých držitelů dluhopisů. Konsolidovaná ÚZ ručitele (PROGRESUS Group a.s.) FY24 na SL5/B26471 ukazuje plný harmonogram aktiv. Stanovisko bond counsel na DR-BOND-009 potvrzuje čisté. Připravili jsme rekonciliaci na DR-BOND-007 mezi každým výrokem o zajištění v prospektu a rejstříkem zatížení ČÚZK — nulové diskrepance."

**Když PPF cituje článek HN.cz „prodejní taktiky dluhopisů Progresu"**:
> „Článek HN z [datum] vznesl [konkrétní body]. Naše odpověď: (a) každý distribuční kanál je nezávisle licencovaný obchodník s cennými papíry s autorizací ZPKT, (b) náš ČNB-schválený prospekt obsahuje plnou zveřejnění rizika a požadavky na vhodnost, (c) náš compliance záznam ukazuje [X] stížností za [Y] let vs. [Z] umístěných tranší — nízká míra stížností v sektorových benchmarcích. Odpovídáme na investorské dotazy přes naše IR kanály a nemáme žádné otevřené vymáhání ČNB."

**Když se PPF ptá na Frydrychovy ruské/Eldorado dny (otoč otázku)**:
NEZVEDAT proaktivně. Pokud konverzace přejde k obecnému tématu po roce 2022 sankční expozice nebo ruské expozice kterékoli strany, můžeš nasadit:
> „Rád budu řešit ruskou expozici PPF symetricky. Pan Frydrych sloužil jako CEO ruského Eldorada 2014-2016 během období ruského portfolia PPF. Chápeme, že PPF Eldorado po roce 2022 odprodala. Uvítali bychom potvrzení jako součást balíčku prohlášení — obě strany těží z čistého sankčního statusu a náš vlastní právní tým může potvrdit nulovou ruskou expozici na straně Progresu. Symetrická prohlášení nám vyhovuje."

**Když PPF požaduje osobní záruky od Zrůsta (nebo Forala)**:
> „Osobní záruky nad rámec konkrétních prohlášení s časovými limity nejsme připraveni poskytnout. Naše pozice: standardní limitované odškodnění z prohlášení a záruk (10–15 % protihodnoty, 18–24 měsíců pro obecná prohlášení, 5–7 let pro daň a vlastnictví), s mechanismem úschovy max 10 %. Nad to jsme otevřeni rozumným strukturám — například tranše odloženého protiplnění navázaná na konkrétní milníky po uzavření nebo stabilitu územního rozhodnutí (Q5). Neudělíme neomezenou osobní odpovědnost ani jednomu z akcionářů; to je červená linie."

**Když PPF tlačí na klíčové osoby riziko (Zrůst jako jediný ředitel)**:
> „Souhlasíme, že struktura jediného ředitele není ideální pro protistranu velikosti PPF. Náš návrh — před podpisem (a) jmenujeme spoluředitele přijatelného PPF, (b) zajistíme pojištění odpovědnosti vedení (D&O) se specifickým pokrytím transakce, (c) podepíšeme plán pro indispozici pokrývající kontraktační kontinuitu. Memo na DR-GOV-001. To zvládneme za 2-3 týdny."

**Když PPF tlačí na CoC dluhopisového programu (obava z akcelerace)**:
> „CoC analýza je v DR-BOND-003, na úrovni ustanovení napříč všemi 5 prospekty. Tam, kde je vyžadován CoC souhlas, máme předem připravená žádost o souhlas pro držitele dluhopisů [DR-BOND-005]. Naše očekávání: 60-90 dní na proces souhlasu, podpořené opětovné potvrzení reálné hodnoty aktiv. Žádná série nemá auto-akceleraci na CoC bez okna souhlasu."

**Když PPF zvedne načasování 5. prospektu 2026-01-28** (schváleno během jednání):
> „5. prospekt byl plánovaná obnova programu, schválená ČNB 2026-01-28. Použití výtěžku zdokumentováno na DR-BOND-011 — standardní pozemkový financování, pro-rata napříč portfoliem; nulové výnosy alokované na související s transakcí účel. Načasování odráží schvalovací cyklus ČNB, ne signál transakce."

**Když PPF cituje Casper / Štekl label „obchodník s chudobou"**:
> „Veřejně dokumentováno — provedli jsme řádnou péči v roce 2023 před spoluinvesticí na Vitrabloku. Naše memo o řádné péči [DR-VIT-003] uzavřelo: (a) žádné aktuální Casper AML flagy, (b) strukturovaný výstup za 12 měsíců do Sediveru/Blackstonu v říjnu 2025 [DR-VIT-002], (c) žádné zbytkové vztahy. Každý záznam v datové místnosti podporuje, že jsme vstoupili s otevřenýma očima a vystoupili čistě. Žádné budoucí transakce s Casperem se neplánují."

**Když PPF zvedne Foral / Aleš Michl / optiku ČNB (éra fondu Quant)**:
> „Pan Foral předsedal dozorčí radě fondu Quant 2016-2023. Podíl Aleše Michla byl od 2018 (jmenování ČNB) držen ve svěřenském fondu MMXXV; zbylých 5 % prodal v roce 2023. Okno spoluúčasti bylo plně legální, žádná obvinění a obě strany se posunuly. Pro tuto transakci jsme objednali nezávislé memo expozice PEP [DR-PEP-001] potvrzující nulový pokračující kanál. Rád sdílíme."

**Když PPF odkazuje na rozsah 130 ha vs. 42 ha**:
> „K.ú. Mstětice má 135 ha velkých orných parcel. 42 ha je náš perimetr transakce [konkrétní harmonogram parcel DR-SCOPE-001]. Ze zbývajících parcel Progresus si ponechává [X] ha a třetí strany drží [Y] ha. Můžeme diskutovat ROFR / opční struktury na naší retainované půdě — [DR-SCOPE-002 předem připravený smluvní rámec]. Parcely třetích stran nejsou pod naší exkluzivitou."

**Když PPF odkazuje na Karlín Group (riziko paralelního zájemce)**:
> „Jakákoli NDA nebo exclusivity letter, kterou s PPF podepíšeme, výslovně zakáže sdílení DD materiálů s jakýmkoli JV partnerem PPF, včetně Karlín Group (Serge Borenstein). Považujeme to za standardní podmínku a předem jsme připravili vynětí jazyk na DR-NDA-001."

---

## V. LOGISTIKA SCHŮZKY

### Formát
- **Preferenčně živě naživo** (prostor Progresu — Brno nebo Praha). Videohovor, jen pokud je nevyhnutelný — Zoom/Teams, nikdy WhatsApp.
- **Žádní pozorovatelé bez předchozího písemného souhlasu.** Odmítej tiché PPF poradce, kteří se účastní, aniž by byli představeni.
- **Záznam**: Progresus by měl interně nahrávat (souhlas obou stran uveden do záznamu) nebo tým dělá současné poznámky.
- **Limit 60-90 minut na session.** Únava je tvůj nepřítel; více sessions > jeden maraton.

### Doporučení k denní době
- **Preferuj 10:00–12:00** středoevropského času. Tošek + Ševela jsou nejostřejší ráno; Jirásková má co-CEO kalendářní zátěž odpoledne. Poradci PPF jsou obvykle dostupní v dopoledním slotu.
- **Vyhni se pátečním odpolednům** a pondělním ránům. Preferuj úterý-čtvrtek.
- **Nikdy neplánuj blízko zasedání představenstva PPF** (historicky pásma květen + listopad).
- **Plánuj 30 min buffer po hovoru** pro interní vyhodnocení, dokud je vše čerstvé.

### Příprava před hovorem
- Datová místnost plně indexovaná a dostupná 24 h před hovorem
- Telefon na tichý, ale dostupný pro externího poradce
- Voda, blok, předznačený šanon top-20 exhibitů, výtisky LV
- Plný tým briefovaný + sjednocený; nácvik dokončen ≥24 h před
- Určený zapisovatel (Michal nebo Tomáš K.)

### Během hovoru
- **Poslouchej 2× tolik, kolik mluvíš.** Ticho tlačí PPF, aby ukázal kartu.
- **Nevyplňuj ticho.** Když se ptají a zaváhají, čekej — možná si sami odpoví.
- Používej **jejich vlastní slova zpět**: „Ptal jste se na sériovou DANCORE litigaci — k tomu se vyjádřím."
- **Otázky o více částech** — explicitně odpověz na každou část: „K vašemu prvnímu bodu... K druhému..."
- Pokud citují konkrétní dokument, **požádej, aby ho ukázali živě** předtím, než odpovíš — může se vynořit nedorozumění.

### Po hovoru
- Vyhodnocení do 60 minut, dokud je čerstvé (viz §VIII šablona)
- Zdokumentuj každý učiněný závazek
- Přiděl vlastníky na každý následný + termín
- Aktualizuj datovou místnost dle nových požadavků do 48 h
- Pošli stručný následný email do 24 h shrnující závazky (vytváří písemnou stopu příznivou pro prodávajícího)

---

## VI. KONTROLNÍ SEZNAM PŘED HOVOREM (48 h / 24 h / H-0)

### T-mínus 48 hodin (Zrůst + Dvořák + externí poradce)
- [ ] Kompletní UBO mapa (eSM + přímé akcionářství Progresus Group a.s.) — DR-UBO-001
- [ ] Mapa struktury skupiny se všemi ~100 entitami klasifikovanými (v rozsahu/mimo rozsah) — DR-UBO-002
- [ ] Konsolidovaný harmonogram dluhu z dluhopisů: nesplacená jistina podle emitenta, CoC, prodejní práva, křížové selhání — DR-BOND-001..005
- [ ] Plný harmonogram sporů (každé IČO Progresu přes justice.cz) — DR-LIT-001
- [ ] Výpisy LV z ČÚZK dálkový přístup pro LV 927 + LV 1326 (Mstětice 792764) — DR-TITLE-006
- [ ] Akviziční řetězec Nový Zeleneč a.s. 2007 → 2021 (vlastnictví + SPA) — DR-TITLE-001..003
- [ ] RD Rýmařov Invest III. alpha s.r.o. plná dokumentace — DR-TITLE-001
- [ ] EIA EIA_STC2258 + Phase I/II environmental — DR-ENV-001..003
- [ ] ÚP Zeleneč-Mstětice plný text + petice z 2022 + odpověď obce + certifikace vyhledávání u NSS — DR-UP-001..004
- [ ] Auditované účetní závěrky pro v rozsahu entity (urgentní náprava: Nový Zeleneč FY2021-2024) — DR-FIN-020..024
- [ ] Dokumentace transferových cen — DR-RPT-001
- [ ] Korespondence s ČNB za posledních 5 let (dluhopisy + compliance) — DR-COMP-001
- [ ] Pojistný harmonogram + D&O — DR-LIT-002
- [ ] DANCORE plný spis + Nevada SoS + FinCEN BOI — DR-LIT-010..012
- [ ] Casper/Vitrablok plné memo o řádné péči + dokumentace výstupu — DR-VIT-001..004
- [ ] Seznam případů Konreo Zrůsta + Chinese-wall memo — DR-INS-001..004

### Analýzy / Memorandy (T-mínus 48 h)
- [ ] Protiargumentační memo k proveritele.cz (3 tvrzení, bod-po-bodu, s citacemi dokumentů)
- [ ] Prohlášení k překryvu insolvenční praxe Zrůsta / aktiv Progresu
- [ ] Memo k odpovědi na petici ÚP Zeleneč
- [ ] CASPER / Vitrablok 800M/229M rekonciliace + waterfall výstupu
- [ ] DANCORE obranné memo (externí poradce)
- [ ] Memo k vyřešení 4 řízení vs. 1 (nyní DANCORE)
- [ ] Návrh uzavření-condition §23a ZoB (pro scénář PPF banka)
- [ ] Foral / Michl / fond Quant PEP memo
- [ ] Návrh posílení governance pro jediného ředitele (spoluředitel, D&O, plán pro indispozici)

### Externí (T-mínus 48 h)
- [ ] Externí poradce angažován + briefovaný (doporučuji Aegis Law + jednu nekonfliktní seniorní firmu — JŠK / White & Case / KŠB)
- [ ] Big 4 účetní v pohotovosti pro odpovědi na finanční DD
- [ ] Daňový poradce angažován
- [ ] Environmentální konzultant angažován
- [ ] Bond counsel na hovoru pro Q2 + Q7 + Q14

### T-mínus 24 hodin (Zrůst + Foral + externí poradce)
- [ ] Nácvik (90 minut, plně Q1-Q20)
- [ ] Kalibrace s externím poradcem — červené linie + záložní pozice
- [ ] Finální revize indexu datové místnosti + náprava chybějících dokumentů
- [ ] Potvrzení účastníků za PPF + finální briefing
- [ ] Ztišit telefony / e-mail na okno hovoru (2 h před až 1 h po)

### H-0 (Zrůst, Foral, Dvořák, Korčák, Duchoň, Faraga, externí poradce)
- [ ] Sjednocení týmu 15 min před hovorem
- [ ] Ověřený funkční přístup do datové místnosti
- [ ] Určený zapisovatel
- [ ] Voda, šanon, předznačené záložky připraveny
- [ ] Externí poradce na hot-line (ne v místnosti, pokud není dohodnuto)

---

## VII. ČERVENÉ LINIE — NEDOTKNUTELNÉ

1. **Žádné osobní záruky** od Zrůsta nebo Forala nad rámec konkrétních prohlášení s časovými limity
2. **Limit na indemnitu na 10-15 % protihodnoty** — nikoli neomezená
3. **Časový limit pro porušení prohlášení**: standard 18-24 měsíců general, 5-7 let daň + vlastnictví
4. **Limit na úschova 10 % protihodnoty, max 24 měsíců**
5. **Žádný široký MAC doložka** — pouze skutečně materiální nepříznivé události, prodávající práva na nápravu, kvantifikované prahy
6. **Zachování značky + IP** pro byznysy mimo rozsah (RD Rýmařov dřevo, dědictví Seves Glass Block, doplňky stravy, IT, právo, poradenství)
7. **Úzce definovaný konkurenční doložka** — časový limit max 3 roky, geografie ČR, rozsah pouze rezidenční RE development
8. **Důvěrnost podmínek transakce** — po uzavření mlčenlivostní doložka s reciproční povinností
9. **[NOVÉ] Symetrická transparentnost AMALAR** — pokud PPF požaduje plné UBO + SOF Progresu, zrcadlově žádáme PPF UBO (92% nerodinný vehikl) + SOF odkupu Kellner Jr. za 1,9 mld. USD (viz §X Páka #1)
10. **[NOVÉ] Zacházení s rezervami DANCORE** — nepravděpodobné riziko DANCORE jde do specifického úschova vynětí, NIKOLI do obecného prohlášení a záruk odškodnění poolu; navržené úschova odpovídá ocenění nezávislého poradce: pravděpodobnost nepříznivého výsledku × odhadované škody
11. **[NOVÉ] Uzavření podmínka §23a ZoB** — pokud PPF banka půjčuje, autorizační stopa §23a zdokumentována, selhání = právo prodávajícího odejít bez sankce
12. **[NOVÉ] Exkluzivita vůči paralelním zájemcům** — Karlín Group / Borenstein a jakýkoli další JV partner PPF výslovně vyňati ze sdílení informací podle NDA
13. **[NOVÉ] Dokončení podání FY21-24** — prodávající podá pozdní ÚZ před podpisem; žádné porušení prohlášení a záruk za historickou prodlevu
14. **[NOVÉ] Čerstvé výpisy ČÚZK** — výpisy LV datované do 7 dnů od uzavřeníu, stanovisko k titulu podepsané nezávislým poradcem

---

## VIII. ŠABLONA POST-CALL VYHODNOCENÍU

**Vyplnit do 60 minut od konce hovoru. Určený zapisovatel; rozeslat týž den Zrůstovi, Foralovi, Dvořákovi, externímu poradci.**

```
VYHODNOCENÍ Z HOVORU — PPF DD Session #[N]
Datum: [RRRR-MM-DD HH:MM–HH:MM CET]
Formát: [Naživo / Video]
Místo: [Lokace]

Účastníci PPF: [Jméno, role]
Účastníci Progresu: [Jméno, role]
Přítomní poradci: [Firma, jméno, role]

SHRNUTÍ (3-5 vět): [Co se stalo, jaký byl tón, co se změnilo]

POLOŽENÉ OTÁZKY:
[Číslovat každou, krátce parafrázovat, odpověď Progresu]
  Q#. [Otázka PPF]
       A. [Naše odpověď]
       Vlastník: [Osoba]

ZÁVAZKY ZE STRANY PROGRESU:
[Explicitní sliby — dokumenty k odeslání, vysvětlení k poskytnutí, analýzy k provedení]
  C#. [Závazek]
       Termín: [Datum]
       Vlastník: [Osoba]

ZÁVAZKY ZE STRANY PPF:
[Vzácné, ale možné — jejich next-steps, časové horizonty rozhodování]
  P#. [Závazek]
       Termín: [Datum]

SIGNÁLY (tón, řeč těla, neočekávané obraty):
[Co bylo řečeno mimo scénář; kdo se zdál skeptický; co bylo přejito]

VYNOŘENÉ RED FLAGY (jejich nebo naše):
[Případné nové obavy PPF; případné odhalené mezery Progresu]

NÁSLEDNÝ E-MAIL PRO PPF (návrh v příloze):
[Do 24 h — shrnout závazky pro vytvoření písemnou stopuu]

DALŠÍ AKCE PROGRESU (48 h):
[Aktualizace datové místnosti; memorandy k přípravě; práce poradců; interní sjednocení]

PŘEHODNOCENÍ RIZIK:
[Změnil dnešní hovor pravděpodobnost transakce, očekávání ocenění, výhled podmínek?]

POŽADOVANÉ AKTUALIZACE PLAYBOOKU:
[Nové otázky k předzodpovězení; scénáře k doplnění; červené linie k posílení]
```

---

## IX. ESKALAČNÍ PLAYBOOK

### Kdy zapojit externího poradce (okamžitě)
- Jakákoli zmínka o vymáhání ČNB, FAÚ (AML), ÚOOÚ, Úřadu pro ochranu hospodářské soutěže (soutěž)
- Jakékoli obvinění z podvodu, zkreslení nebo trestného jednání
- PPF žádá přímo závazný jazyk (smluvní rámec, LOI, exkluzivita)
- Jakýkoli odkaz na konkrétní spor, který nebyl v našem harmonogramu
- Jakýkoli požadavek na osobní informace akcionářů, osobní záruky nebo zástavy

### Kdy zavolat Lukáši Foralovi pro druhý názor
- Jakákoli otázka kapitálové struktury nebo financování (vede on)
- Jakákoli regulatorní otázka týkající se ČNB
- Jakákoli historická otázka PEP / AML / Michl / Quant
- Jakákoli neshoda mezi Zrůstem a externím poradcem ohledně strategie
- Materiální změna postoje k transakci (cena, struktura, perimetr)

### Kdy DD pozastavit (reflektovat, neodejít)
- PPF opakovaně cituje dokumenty, které nejsou v datové místnosti (signalizuje externí zdroj úniku)
- PPF vznáší obvinění, která nemůžeme validovat za 48 h
- Strana PPF neočekávaně přidává seniorní účastníky (eskalační signál)
- Interní objevení red flagu, který může PPF vznést (kup čas, naprav, znovu zapojit)
- Signály Karlín Group nebo jiného zájemce — nejprve ověř exkluzivitu

### Kdy odejít (vzácně, ale možné)
- PPF požaduje neomezené osobní záruky od Zrůsta nebo Forala
- PPF požaduje zveřejnění případů Konreo podléhajících advokátní mlčenlivosti nebo regulatorní povinnosti mlčenlivosti
- PPF odmítá paritu zveřejnění AMALAR / Kellnerová A tlačí na symetrický UBO Progresu
- PPF požaduje cenovou redukci > 15 % naší kotvy bez podloženosti
- PPF materiálně mění perimetr transakce po dohodě v principu
- Financování PPF banky s odmítnutím poskytnout stopu §23a clearance
- Porušení integrity: PPF sdílí datovou místnost s Karlín Group / neautorizovaným poradcem

### Odchod od jednání scénář (pro Zrůsta)
> „Vážíme si zájmu PPF a investovaného času. K [konkrétní bod] je naše pozice [zopakovat]. Nevidíme cestu k dohodě k [konkrétní požadavek]. Pozastavíme formální DD a jsme otevřeni opětovnému zapojení, pokud se pozice PPF vyvine. Mezitím náš dluhopisový program operuje nezávisle a aktivum zůstává komerčně životaschopné na samostatné bázi."

---

## X. BODY PÁKY PRO PRODÁVAJÍCÍHO (KRITICKÉ — NOVÁ SEKCE)

**PPF má zranitelnosti. Tým prodávajícího, který je rozumí, vyjednává ze symetrie, ne ze slabosti. Použij JEN tehdy, když PPF tlačí na srovnatelné body Progresu — režim je reciprocita, ne útok.**

### Páka #1 — Vlastní UBO opacita PPF (92 % nerodinné)
- **Fakt**: Pouze 8 % AMALAR HOLDING s.r.o. je v přímých rodinných jménech (Renáta Kellnerová 2,3 %, Anna 1,9 %, Lara 1,9 %, Marie 1,9 %). Zbylých 92 % drženo přes jinou entitu nezveřejněnou v českém rejstříku.
- **Kontext**: UBO Progresu je transparentní — 50/50 Zrůst + Foral, přímé fyzické osoby, žádné zahraniční vrstvy.
- **Použití**: Pokud PPF požaduje plné UBO / SOF Progresu, odpověz symetrickým zveřejnění požadavkem (odpověď Q17).
- **Eskalace**: Pokud PPF odmítá symetrický zveřejnění, vznes formálně v jednání o uzavření podmínkách.

### Páka #2 — Konflikt manželů Jirásková / Jirásko (§23a ZoB)
- **Fakt**: Co-CEO Jirásková provdaná za CEO PPF banky Jiráska; stejná adresa Zvonická 710/3.
- **Kontext**: Český zákon o bankách §23a (osoby se zvláštním vztahem k bance) vyžaduje autorizaci dozorčí rady bez hlasování spřízněné osoby, ČNB zveřejnění, dokumentované tržní podmínky.
- **Použití**: Pokud PPF banka půjčuje, trvej na stopě §23a autorizace jako uzavření podmínce (odpověď Q18). Rámuj jako ochranu obou stran.
- **Eskalace**: Pokud PPF banka půjčuje a odmítá §23a dokumentaci, je to odchodu od jednání bod.

### Páka #3 — Noví co-CEO zdědili tezi transakce od Šmejce/Minxe
- **Fakt**: Diskuse Progresus-PPF pravděpodobně vznikly před květnem 2025 pod Šmejcem + Alešem Minxem. Oba opustili operativní roli v červnu 2025. Jirásková + Stoessel nyní vedou; Minx poradce v AMALAR.
- **Kontext**: Nové vedení má méně osobního zájmu na tezi. Snadnější odejít, snadnější tlačit ústupky.
- **Použití**: NEŘÍKAT nahlas. Použij to pro určení tempa — **tlač na uzavření rychleji, než je apetit PPF**; čím déle se DD táhne, tím spíše noví co-CEO odejdou.
- **Taktika**: Nabízej těsné uzavření časový harmonograms (90denní rozbuška na klíčové podmínky po LOI).

### Páka #4 — Expozice Frydrych Rusko/Eldorado (postsankční zranitelnost)
- **Fakt**: Frydrych CEO ruského Eldorada 2014-2016, nyní CPO + člen představenstva PPF.
- **Kontext**: PPF rozplétá ruské portfolio po roce 2022, ale osobní sankční expozice klíčových manažerů je živý audit item pro bankovní protistrany.
- **Použití**: NEZVEDAT, dokud PPF nezbraňově nepoužije postsankční / AML otázku proti Progresu. Pokud nasazeno (dle scénáře §IV), rámuj jako požadavek symetrické prohlášení.

### Páka #5 — Riziko paralelního zájemce Karlín Group
- **Fakt**: PPF má existující rezidenční JV s Karlín Group (Borenstein), Simply Holešovice + Libeň ~4 mld. CZK 2022–.
- **Kontext**: Karlín Group by mohl být připraven pro paralelní licitaci s informační asymetrií ze vztahu JV. Nové Holešovice ukazují Borensteina aktivně litigujícího s magistrátem Prahy — je to agresivní hráč.
- **Použití**: Uzamknout exkluzivitní vynětí v NDA s vyloučením Karlín / Borenstein. Pokud PPF odporuje, je to signál paralelního obcházení trhuu.
- **Eskalace**: Pokud potvrzen paralelní obcházení trhu, okamžitě pozastavit DD do získání písemné exkluzivity.

### Páka #6 — Redomicilace PPF + nová struktura entit (governance se ještě usazuje)
- **Fakt**: PPF Group a.s. + PPF Holdings a.s. založeny 2026-04-01 (NL→CZ redomicilace). Zcela nové entity staré 20 dní v době prvních DD hovorů.
- **Kontext**: Nová dozorčí + statutární struktura; noví členové představenstva (Frydrych + Verhoeff květen 2025). Governance se stále usazuje. Interní mapy autority nemusí být plně definovány.
- **Použití**: Žádej předem jasnost ohledně podpisové autority. Získej výslovné písemné potvrzení, která entita PPF je kupujícím, s podpůrnými schváleními představenstva. **Také nutíš PPF se interně zformalizovat — zpomaluje to JEJICH tempo, zatímco ty využíváš čas na nápravy.**

### Páka #7 — Nutné schválení rodinnou radou Kellnerové (vektor zpoždění)
- **Fakt**: Veřejná DD metodika PPF (intel z Pass 3): rodinná poradní rada přezkoumává rizika před podpisem.
- **Kontext**: S Kellnerovou + 3 dcerami kontrolujícími 100 % PPF přes AMALAR a Alešem Minxem jako poradcem v AMALAR od června 2025 je schválení na rodinné úrovni reálnou bránou pro transakce nad určitým prahem.
- **Použití**: Cena je schvalována rodinnou radou. Pokud podmínky nejsou pro Progresus dobré, rada se stává druhým vetem; využij to **tím, že nutíš transakční tým PPF, aby vlastnil prezentaci rodinné radě**. To znamená: požaduj nyní podmínky, které dokážeš obhájit, protože přísné posouzení rodinné rady přijde.

### Páka #8 — Tošek CzechToll + státní zakázky (regulatorní citlivost)
- **Fakt**: Set propojených entit Ševela + Tošek dominován CzechTollem (13 mld. CZK, národní mýtné) a státními zakázkami. Celkem 14 mld. CZK státních zakázek.
- **Kontext**: Jakýkoli regulatorní nebo reputační incident sousedící s principály PPF RE ovlivňuje větší byznys CzechTollu. PPF je motivován vyhnout se jakémukoli skandálu spojenému s transakcí.
- **Použití**: **Implicitně**, NIKDY explicitně. To znamená, že PPF se bude držet vysokých reputačních standardů u této transakce — nemůže si dovolit chaotický DD únik ani skandální uzavření. Využij to k požadavku přísné NDA + důvěrnosti + pevného plánu mediální komunikaci. PPF bude souhlasit, protože PPF má více co ztratit než Progresus, pokud jakákoli strana udělá únik.

---

## XI. PŘÍPRAVNÝ TIMELINE

| Den | Akce | Vlastník |
|-----|--------|-------|
| Den -14 | Finalizace Playbooku v2.0; přidělení úkoly; briefing externích poradců | Zrůst + externí |
| Den -10 | Pozdní podání ÚZ (Nový Zeleneč FY21-24 + bond SPV) odesláno | Účetní |
| Den -7 | Vytaženy výpisy LV z ČÚZK; průzkum spisu DANCORE dokončen | Korčák + externí |
| Den -5 | Všechny exhibity v datové místnosti; protiargumentační memorandy + odpověď Pro Věřitele návrhována | Dvořák + Foral + externí |
| Den -3 | Nácvik #1 (90 min, Q1–Q10) | Plný tým |
| Den -2 | Nácvik #2 (90 min, Q11–Q20) + simulace v horkém křesle | Plný tým |
| Den -1 | Finální kalibrace; ztišit telefony; finální revize datové místnosti | Zrůst + Foral + externí |
| Den 0 | DD hovor s PPF | Progresus |
| Den +1 | Vyhodnocení + návrh následný e-mailu | Zrůst + zapisovatel |
| Den +2 | Následný e-mail odeslán + datová místnost aktualizována | Zrůst |
| Den +7 | Playbook aktualizován dle signálu PPF; příprava další session | Plný tým |

---

## PŘÍLOHY

- **A. Šablona indexu datové místnosti** (DR-* IDs zmíněné v celém textu) — udržováno odděleně
- **B. Vzorový prohlášení a záruk harmonogram SPA** — udržuje externí poradce
- **C. Vzorová žádost o souhlas držitelů dluhopisů** — udržuje bond counsel
- **D. Vzorový jazyk uzavření condition §23a ZoB** — udržuje banking counsel
- **E. DANCORE obranné memo** — externí poradce
- **F. Plný strom entit Progresu (~100 entit klasifikovaných v rozsahu + mimo rozsah)** — udržuje Dvořák
- **G. Cross-reference spisu**: všechna zjištění se vážou na soubory v `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/`; master index na `00-INDEX.md`

---

## ZÁVĚREČNÝ PRINCIP

Každá odpověď buď (a) posiluje vaši pozici demonstrováním přípravy, nebo (b) odkládá s konkrétním revertem. Nikdy neodpovídej, abys udělal dojem; odpovídej, abys dokumentoval. Každé ID exhibitu v datové místnosti, které citujeme, je budoucí důkaz, který vás chrání. Každý učiněný závazek je akce pro váš tým, okamžitě zalogovaná. Každý signál PPF jsou data — zaarchivuj, briefuj, aktualizuj tento scénář do 48 h.

Neprodáváte aktivum PPF. Umožňujete PPF, aby se přesvědčili sami. Tempo, příprava a přesnost — to je hra.

---

*Playbook v2.0 — živý dokument. Aktualizovat po každé interakci s PPF. Verzováno ve pracovním prostoru `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/`.*

**Vytvořeno**: 2026-04-21, intel-base z Pass 4 | **Plánovaná příští revize**: po vyhodnoceníu z PPF DD Call #1.

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [05-osint/ppf-side-deep/README.md](./05-osint/ppf-side-deep/README.md) — `../../PPF-PLAYBOOK.md` (3×)
- [04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md](./04-legal/GOVERNANCE-CONTINUITY-MEMO-v1.0.md) — PPF-PLAYBOOK.md
- [06-reports/WI-INSURANCE-MEMO.md](./06-reports/WI-INSURANCE-MEMO.md) — ../PPF-PLAYBOOK.md
- [06-reports/red-flags-dashboard.html](./06-reports/red-flags-dashboard.html) — 🎯 PPF Playbook
- [BACKLINKS-AUDIT.md](./BACKLINKS-AUDIT.md) — PPF-PLAYBOOK.md
- [MISSION-COMPLETE.md](./MISSION-COMPLETE.md) — `PPF-PLAYBOOK.md`

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](./index.html) · [Mapa stránek](./sitemap.html) · [Hledat](./search.html) · Focus ID: `PPF-PLAYBOOK.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
