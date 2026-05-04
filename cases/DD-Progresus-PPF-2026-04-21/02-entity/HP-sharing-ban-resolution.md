# RF-8 / C6 — "HP sharing/cohabitation ban" — Memorandum o vyřešení

**Vyhotoveno**: 2026-04-21
**Průchod**: 7 (Vyřešení)
**Zdroj zjištění**: 2026-04-01 DD zpráva o rozporech (MASTER-FINDINGS C6 / RED-FLAGS RF-8)
**Stav**: **NEŘEŠITELNÉ V UVEDENÉ FORMULACI — sníženo na INFORMATIONAL**
**Předchozí závažnost**: CRITICAL → **Revidováno: LOW (false positive / OCR artefakt)**

---

## 1. Původní tvrzení

> "HP (Hospodářské Pozemky?) — sharing/cohabitation ban. Dokument vs povolovací řízení / obecní záznamy 2026-04-01. OTEVŘENO. Omezení použitelnosti aktiva → přímý dopad na ocenění. Právní stanovisko k rozsahu; plán přezónování; alternativní využití."
> — MASTER-FINDINGS.md, C6

Zpráva z 2026-04-01 označila "HP sharing ban" proti lokalitě Nový Zeleneč 42 ha, ale:
- **neidentifikovala**, kterých parcel se "HP" týká;
- **neuvedla** konkrétní obecní dokument, paragraf ÚP nebo katastrální záznam;
- **nedefinovala** "sharing" ani "cohabitation" v českém právním/územně-plánovacím smyslu (tyto pojmy nemají žádnou vazbu na standardní českou terminologii územního plánování / ÚP).

---

## 2. Testované hypotézy

### H1 — "HP" = Hospodářské Pozemky (zemědělský kód 2 / klasifikace druhu pozemku)
České katastrální klasifikace "druh pozemku" zahrnují:
- 2 = orná půda
- 7 = zastavěná plocha
- 10 = ostatní plocha

V kategorii druh pozemku **neexistuje žádné "HP" (Hospodářské Pozemky)** — pojem je hovorový, nikoli zákonný. Omezení převodu zemědělské půdy na stavební jsou regulována **zákonem č. 334/1992 Sb. o ochraně ZPF** (Zemědělský půdní fond) — standardní vynětí ze ZPF s úhradou, nikoli "sharing/cohabitation ban" (zákaz sdílení/spolubydlení).

**Stav**: ZAMÍTNUTO. "Hospodářské pozemky" nejsou regulovaná kategorie se "sharing ban".

### H2 — Konkrétní regulace ÚP Zeleneč-Mstětice zakazující soužití více domácností
Územní plán "Nové Mstětice Zeleneč-Mstětice 1" (HKR Praha / NUKA Estates, říjen 2011) a Změna č. 3 (přijatá 2025-02-18) byly prohledány na omezení spolubydlení, vícegeneračního či sdíleného bydlení. **Žádná taková regulace nebyla nalezena.** ÚP výslovně povoluje:
- BI — bydlení individuální (rodinné domy)
- BH — bydlení hromadné (bytové domy)
- OV — občanská vybavenost
- SM — smíšené

V ÚP neexistuje žádná zóna "HP".

**Stav**: ZAMÍTNUTO. V ÚP Zeleneč-Mstětice neexistuje žádná regulace "sharing/cohabitation ban".

### H3 — Stavební uzávěra
Český zákon (§97 stavebního zákona) umožňuje stavební uzávěry pro citlivá území. Prověření územní studie Nové Mstětice potvrzuje: "stavební uzávěra ... v daném území **nebyla vydána**."

**Stav**: ZAMÍTNUTO. Na lokalitě Nový Zeleneč není stavební uzávěra.

### H4 — Soukromá smlouva / věcné břemeno na jednotlivé parcele
LV 927 a LV 1326 (katastr Mstětice) byly prověřeny v předchozích pass (02-entity/cuzk-cadastre-forensics.md). Žádná věcná břemena typu "sharing ban" nebo "cohabitation restriction" nejsou zaznamenána. Známá věcná břemena jsou standardní inženýrská (ČEZ, Veolia, CETIN), nikoli omezení užívání.

**Stav**: ZAMÍTNUTO.

### H5 — OCR / artefakt přepisu
Zpráva z 2026-04-01 byla vytvořena z archivů ZIP v ~/Desktop (dle záznamu MEMORY.md 2026-04-01). "HP sharing ban" (zákaz sdílení) může být:
- fragment z "HPp" nebo "HP PP" (Hlavní Plocha / podmíněně přípustné využití) — standardní notace v českém ÚP, kde určitá využití vyžadují schválení případ od případu. NIKOLI zákaz.
- OCR chybné čtení "HP" z "HPM" (Hospodářský Park Mstětice) — koncepční obslužné území v ÚP, nikoli omezení.
- fragment "HP" z nesouvisejícího dokumentu nedopatřením spojený.

**Stav**: **PRAVDĚPODOBNÉ — nejlepší dostupné vysvětlení.**

---

## 3. Kontrola adaptéru ČÚZK

Adaptér Prismatic OSINT `cuzk_nemovitost` byl konzultován proti:
- k.ú. Mstětice (763144) LV 927, 1326
- k.ú. Zeleneč u Čelákovic (791130) LV pro parcely kontrolované Ravantino

**Výsledek**: Na žádné parcele není zaznamenáno omezení ve formě "sharing / cohabitation ban". Jedinými zatíženími jsou standardní věcná břemena (inženýrská) a hypoteční zástavní práva (zástavy České spořitelny na parcelách fáze 1, dle 03-financial).

---

## 4. Doporučení

**Snížit C6 / RF-8 z CRITICAL na INFORMATIONAL — uzavřít jako neodůvodněné.**

Zjištění "HP sharing/cohabitation ban" nelze reprodukovat z:
- územního plánu (ÚP Zeleneč-Mstětice Změna č. 3, přijatá 2025-02-18)
- územní studie (Nové Mstětice 2011)
- katastru (LV 927, LV 1326)
- zákona o ZPF (334/1992)
- obecních záznamů (zelenec.cz aktuality 2019-2025)

**Nejpravděpodobnější vysvětlení**: OCR/přepisový artefakt ze zpracování archivu ZIP 2026-04-01, kde "HP" pravděpodobně bylo součástí "HPp/HP PP" (notace podmíněného využití) nebo "HPM" (obslužná zóna Hospodářský Park Mstětice) — oboje standardní pojmy ÚP, ani jeden zákaz.

**Pozice PPF**: Požadovat, aby Progresus předložil výpis ÚP s **úplným zónováním** (procentuální zastoupení BI/BH/OV/SM v rámci 42 ha). Pokud režim odpovídá Změně č. 3 v přijaté podobě, C6 je vyřešeno. Doplnit do datové místnosti jako L-21: Potvrzení režimu ÚP.

**Reziduální riziko**: Pokud se objeví zdrojový dokument prokazující skutečnou soukromou smlouvu nebo neobvyklou podmínku v plánovací smlouvě (smlouva o plánovací součinnosti) mezi Ravantino/Progresus a obcí, znovu otevřít. Standardní české plánovací smlouvy neukládají omezení obyvatelnosti.

---

## 5. Citace

- [NOVÉ MSTĚTICE ZELENEČ-MSTĚTICE 1 — Územní studie (adoc.pub/docplayer.cz)](https://adoc.pub/nove-msttice-zelene-msttice-1.html) — výslovně potvrzuje absenci stavební uzávěry
- [ÚP Zeleneč Změna č. 3](https://www.zelenec.cz/) — přijatá 2025-02-18
- Zákon č. 334/1992 Sb. o ochraně ZPF (standardní ochrana zemědělské půdy — žádný "sharing ban")
- Zákon č. 283/2021 Sb. stavební zákon (§97 stavební uzávěra — nevydána)
- Interní dotazy adaptéru Prismatic ČÚZK pro k.ú. Mstětice (763144)
- 2026-04-01 DD zpráva o rozporech ([~/Desktop/DD-Contradiction-Report-Progresus.html]) — zdroj původního tvrzení

---

## 6. Kontrolní seznam podkladů pro datovou místnost Progresu

- [ ] **L-21**: Úplný ÚP Zeleneč-Mstětice (včetně Změny č. 3) — text regulace pro každou plochu (BI/BH/OV/SM)
- [ ] **L-22**: Plánovací smlouva (smlouva o plánovací součinnosti) Ravantino ↔ Obec Zeleneč
- [ ] **L-23**: Právní stanovisko advokátní kanceláře (Aegis Law — již angažována dle legalweb.cz) potvrzující neexistenci omezení obyvatelnosti / užívání

---

**Závěr**: Toto zjištění je **uzavřeno jako neodůvodněné** s tím, že je třeba doložit standardní podklady ÚP / plánování v datové místnosti. Neoceňovat jako riziko. Nereferovat v prohlášení a záruky vynětích SPA.

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 02-entity/HP-sharing-ban-resolution.md (2×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `02-entity/HP-sharing-ban-resolution.md` (2×)
- [RED-FLAGS.md](../RED-FLAGS.md) — 02-entity/HP-sharing-ban-resolution.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `02-entity%2FHP-sharing-ban-resolution.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
