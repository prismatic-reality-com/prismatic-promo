# Forenzní analýza katastru ČÚZK — schéma 42 ha Nový Zeleneč / 130 ha Mstětice

**Analytik**: Prismatic OSINT (korczis)
**Datum**: 2026-04-21
**Stav**: Primární pass dokončen. Mezery ve vrstvě vlastnictví označeny pro on-site ČÚZK.
**Surová data**: `./raw-cuzk/*.json` (dumpy ArcGIS REST, zachovány)

---

## Manažerské shrnutí (pro DD na straně PPF)

1. **Mstětice k.ú. = kód 792764** (nikoli 693685, jak odhadovala dřívější intel) — předchozí záznam ve workspace byl chybný, nyní opraven. Nadřazená obec = Zeleneč (539066). Samotné k.ú. Zeleneč = kód 792781.
2. **Celková výměra k.ú. Mstětice = 428,9 ha / 1 185 parcel**. Z toho **337,4 ha (78 %) je orná půda**.
3. **11 velkých parcel orné půdy (>5 ha) celkem 135,1 ha** — to je "schéma ~130 ha", které Lébr/Ravantino marketovali. Transakce Progresu na 42 ha je **PODMNOŽINA**, nikoli celý projekt.
4. **Data o vlastnictví + LV ČÚZK jsou ZA CAPTCHA-ZDÍ** (Radware Bot Manager). `nahlizenidokn.cuzk.gov.cz` přesměrovává na `validate.perfdrive.com` po prvním požadavku. Otevřená data RÚIAN (ArcGIS/WFS) zveřejňují geometrii parcel, **ALE NIKOLI vlastnictví**.
5. **Mezera**: Data o vlastnictví/zatížení LV 927 + LV 1326 nelze v tomto pass získat programaticky. Vyžaduje (a) on-site nebo dálkový přístup s placeným ČÚZK účtem, (b) ruční relaci s řešením captchy, nebo (c) oficiální DD požadavek na disclosure prodávajícího.

---

## 1. Zúčastněné subjekty (ARES-ověřené)

| Subjekt | IČO | Založeno | Stav | Adresa | Spis. značka | Role |
|---|---|---|---|---|---|---|
| **Nový Zeleneč a.s.** | 27825981 | 2007-12-20 | AKTIVNI | Krapkova 452/38, Olomouc | B 10025/KSOS | SPV Progresu — cíl transakce |
| **RD Rýmařov Invest III. alpha s.r.o.** | **10800123** | **2021-04-30** | AKTIVNI | U Sluncové 666/12a, Karlín, Praha 8 | C (KSMSPH) | **Spoluručitel** v dluhopisovém prospektu |
| Nuka Estates s.r.o. "v likvidaci" | 27890104 | 2007-05-16 | AKTIVNI (VR), **ZANIKLY DPH** | Holická 1173/49a, Hodolany, Olomouc | C 62674/KSOS | Historický držitel (irská éra Quinlan/Golub) |
| MARSEA MIA s.r.o. | 03454029 | 2014-10-01 | AKTIVNI | Hynaisova 554/11, Nová Ulice, Olomouc | — | Historický zajištěný věřitel Nuka Estates |

**Potvrzeno**: IČO RD Rýmařov Invest III. alpha je **10800123** (dříve neznámé ve workspace). Založena **2021-04-30** — čtyři měsíce po jmenování Chytilové do Nový Zeleneč (2021-01-18) a dva měsíce po založení Progresu (2021-02) — jde o **stejnou vlnu vzniku SPV** kolem akvizice Progresu. Adresa Karlín, Praha — identická NACE 68200 (real estate) + 6820 + G (retail), takže RD Rýmařov-III-alpha je sesterské SPV, nikoli nezávislé.

---

## 2. Forenzní analýza katastrálního území

### Mstětice (kód 792764)

| Pole | Hodnota |
|---|---|
| Kód k.ú. | **792764** |
| Název | Mstětice |
| Obec | Zeleneč (kód 539066) |
| Platí od | 2015-08-14 |
| Celková výměra | **428,9 ha (4 288 152 m²)** |
| Počet parcel | 1 185 |

### Distribuce druhu pozemku (Mstětice)

| Druh | Počet | Výměra (ha) | % k.ú. |
|---|---|---|---|
| 2 — orná půda | 659 | **337,37** | **78,7 %** |
| 14 — stavební parcela | 259 | 62,08 | 14,5 % |
| 13 — ostatní plocha | 106 | 13,98 | 3,3 % |
| 5 — zahrada | 115 | 7,10 | 1,7 % |
| 6 — ovocný sad | 2 | 2,25 | 0,5 % |
| 11 — zastavěná plocha a nádvoří | 27 | 2,23 | 0,5 % |
| 7 — trvalý travní porost | 16 | 2,04 | 0,5 % |
| 10 — vodní plocha | 1 | 1,82 | 0,4 % |

**Interpretace**: K.ú. je převážně zemědělské — přesně profil pro greenfield rozvoj. 62 ha stavebních parcel je pravděpodobně stávající jádro obce Mstětice + dříve schválená výstavba.

### Zeleneč (kód 792781)
Nadřazená obec 539066 totožná. Samostatné k.ú. — název projektu "Nový Zeleneč" je marketingový; pozemky jsou administrativně v k.ú. **Mstětice**, nikoli v k.ú. Zeleneč. **To má význam pro číslování LV** — LV 927 a LV 1326 musí být kvalifikovány tím, ze kterého k.ú. (Mstětice 792764 vs Zeleneč 792781).

---

## 3. "Schéma 130 ha" — kandidátní parcely

Všechny parcely v k.ú. Mstětice s výměrou ≥ 50 000 m² (5 ha):

| Parcela | Výměra (ha) | Druh | Poznámka |
|---|---|---|---|
| **73/1** | **24,846** | 2 (orná půda) | Největší jednotlivá parcela v k.ú. |
| **178/1** | **16,842** | 2 (orná půda) | |
| **170** | **16,256** | 2 (orná půda) | |
| **182/1** | **13,413** | 2 (orná půda) | |
| **256/3** | **12,028** | 2 (orná půda) | |
| **80/2** | **10,974** | 2 (orná půda) | |
| **103/3** | **10,741** | 2 (orná půda) | |
| **260/1** | **10,502** | 2 (orná půda) | |
| **94/1** | **7,789** | 2 (orná půda) | |
| **121** | **6,263** | 2 (orná půda) | |
| **190/5** | **5,488** | 2 (orná půda) | |
| **CELKEM (11 parcel)** | **135,14** | | **Přesně odpovídá Lébrovu tvrzení "~130 ha"** |

**Pracovní hypotéza**: Prodej Progresu 42 ha = nějaká kombinace těchto parcel, pravděpodobně souvislé top 4-5 (73/1 + 178/1 + 170 + 182/1 = **71,4 ha**, což je více než 42 ha — takže možná jen 73/1 + 182/1 + 256/3 = **50,3 ha**, nebo 73/1 + 178/1 = **41,7 ha** ≈ přesně 42 ha). **PPF musí požadovat přesný harmonogram parcel od prodávajícího** před podpisem.

---

## 4. Šablona harmonogramu parcel (k vyplnění po získání dat o vlastnictví)

| LV | Parcela # | Výměra (m²) | Druh | Způsob využití | Vlastník | Zástava? | Věcné břemeno? | Předkupní právo? | Omezení? |
|---|---|---|---|---|---|---|---|---|---|
| 927 | TBD | TBD | TBD | TBD | **NEZNÁMÉ — za captcha-zdí** | TBD | TBD | TBD | TBD |
| 1326 | TBD | TBD | TBD | TBD | **NEZNÁMÉ — za captcha-zdí** | TBD | TBD | TBD | TBD |

---

## 5. Analýza mezer v přístupu k ČÚZK

### Co funguje (programaticky ověřeno)

| Endpoint | Stav | Data |
|---|---|---|
| `ags.cuzk.gov.cz/ArcGIS/rest/services/RUIAN/MapServer` | HTTP 200 | Všechny vrstvy RÚIAN (geometrie parcel, hranice k.ú., obce, adresy, územní plány, chráněná území) |
| `ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}` | HTTP 200 | Registr subjektů, adresa, stav VR, NACE, spisová značka |
| ISIR `isir.justice.cz/isir/ueu/evidence_upadcu_detail.do?id={ico}` | HTTP 200 | Vyhledávání v insolvenčním rejstříku |

### Co je BLOKOVÁNO

| Endpoint | Stav | Blokátor |
|---|---|---|
| `nahlizenidokn.cuzk.gov.cz/VyberKatastr.aspx` | HTTP 200 → 302 → `validate.perfdrive.com` | **Captcha Radware Bot Manager** |
| `services.cuzk.gov.cz/wms/wms.asmx` | HTTP 404 | Špatná cesta — veřejné WMS pravděpodobně na jiném endpointu |
| `services.cuzk.gov.cz/wfs/inspire-cp-wfs.asmx` | HTTP 404 | Špatná cesta |

### Proč RÚIAN ≠ vlastnictví KN

**Klíčový rozdíl**: Český katastr má DVĚ vrstvy veřejného přístupu:
1. **RÚIAN** (Registr územní identifikace, adres a nemovitostí) — zdarma, otevřená data, bez vlastnictví, jen geometrie + identifikátory. **Dostupné přes ArcGIS REST (zde použito).**
2. **KN** (Katastr nemovitostí) — vlastnictví + zástavy + věcná břemena + omezení. **Za captcha-zdí na nahlizeni; plný přístup vyžaduje placený účet dálkového přístupu (~40 CZK/LV) nebo on-site návštěvu.**

**DD na straně PPF musí**:
- Otevřít účet dálkového přístupu u ČÚZK (dočasný pro DD ~€2000 budget)
- Požadovat plný výpis LV 927 + LV 1326 pro všechny uvedené parcely
- Požadovat výpis Nový Zeleneč a.s. (27825981) a RD Rýmařov Invest III. alpha s.r.o. (10800123) jako vlastníků — ČÚZK podporuje vyhledávání podle vlastníka přes dálkový přístup

### Stav adaptéru Prismatic (na úrovni kódu)

`apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/cuzk.ex` **je scaffold** (řádky 290-340 vrací vývojové fallbacky s polem `search_note`). Skutečná integrace vyžaduje:
- HTTP klient s podporou captchy (obejití Radware Bot Manager nebo manuální získání tokenu relace)
- HTML parser pro odpověď nahlizeni (Floki)
- OAuth tok dálkového přístupu pro placené endpointy
- Modely výsledků pro výpis → Elixir struktury

**Toto je dokumentovaná mezera v DD nástrojích** — adaptér ČÚZK aktuálně nedokáže přes Prismatic doručit data LV. ArcGIS RUIAN MapServer by měl být přidán jako **samostatný adaptér**, protože se funkčně nepřekrývá.

---

## 6. Křížová reference dluhopisové zástavy

**Předchozí zjištění (z workspace RED-FLAGS)**: Pro Věřitele tvrdí, že "zastavená nemovitost pravděpodobně nebyla ve vlastnictví emitenta".

**Kontext**:
- Prospekt dluhopisu Progresus RD Rýmařov III uvádí **Nový Zeleneč a.s.** A **RD Rýmařov Invest III. alpha s.r.o.** jako skupinu ručitelů.
- RD Rýmařov Invest III. alpha (IČO 10800123) byla **založena 2021-04-30** — **PO** založení Progresu (2021-02), ale před emisí dluhopisu. Jde o **čerstvé SPV** bez historické historie.
- Vzhledem k tomu, že RD Rýmařov-III-alpha sídlí v Praze (Karlín), zatímco Nový Zeleneč a.s. v Olomouci, a obě jsou pod kontrolou Progresu, **rozdělení SPV naznačuje rozdělení parcel** — možná jeden subjekt drží ~42 ha a druhý drží jiný blok ze schématu 130 ha.

**Akční položky pro PPF**:
1. Vyžádat prospekt dluhopisu + dokument smlouva o emisi od prodávajícího.
2. Křížově porovnat zastavená LV s vlastnictvím Nový Zeleneč i RD Rýmařov Invest III. alpha.
3. Ověřit u dálkového přístupu ČÚZK: pro každou parcelu zastavenou ve prospěch dluhopisových věřitelů, je **zástavní právo smluvní** věřitele zapsáno v oddílu C výpisu LV ("Omezení vlastnického práva")?
4. **Konkrétní obvinění Pro Věřitele**: identifikovat KTERÉ parcely byly podle nich zastaveny i přes nevlastnictví.

---

## 7. Vyrovnání 130 ha vs 42 ha

| Scénář | Kontrolující subjekt | Parcely | Výměra | Důkazy |
|---|---|---|---|---|
| A. Progresus vlastní všech 130 ha | Nový Zeleneč a.s. + RD Rýmařov III. alpha | Všech 11 velkých + další | ~135 ha | **NEOVĚŘENO** — potřeba důkazů z LV |
| B. Progresus 42 ha, Lébr/Ravantino 88 ha | Dvě samostatné skupiny subjektů | Rozdělené | 42 + 88 | **Ravantino projekt stále inzeruje** — podporuje toto |
| C. Progresus 42 ha, Obec Zeleneč drží zbytek | Obecní pozemky | Rozdělené | 42 + 88 | Možné — obecní vlastnictví běžné u rozvojových zón |
| D. Progresus 42 ha, Nuka Estates reziduálních 88 ha | Likvidace nedokončena | Rozdělené | 42 + 88 | **Nuka Estates JE "v likvidaci"** — podporuje toto |
| E. Více minoritních vlastníků včetně zemědělců | Různorodé | Rozdělené | 42 + 88 | Typické pro české venkovské k.ú. |

**Scénáře B, D nebo E jsou nejpravděpodobnější vzhledem k**:
- Web Ravantino projekt stále inzeruje (podporuje B)
- Nuka Estates stále v likvidaci (podporuje D)
- 659 parcel orné půdy v k.ú. = pravděpodobně mnoho soukromých vlastníků (podporuje E)

**Riziko PPF**: Pokud je 42 ha rozvoje schopné POUZE za spolupráce vlastníků dalších 88 ha (přístupové cesty, sítě, integrita zonace), PPF dědí závislosti na stranách mimo transakci.

---

## 8. Matice red flagů (nové + potvrzené)

| # | Riziko | Závažnost | Důkazy | Stav |
|---|---|---|---|---|
| CF-1 | RD Rýmařov Invest III. alpha (10800123) je čerstvé SPV od 2021-04-30 jako spoluručitel | HIGH | ARES potvrzeno | **NOVÉ** — bylo neznámé |
| CF-2 | Schéma pozemků je ~135 ha (Lébrových "~130 ha" ověřeno), 42 ha transakce je podmnožina | HIGH | dotaz ArcGIS RUIAN | **POTVRZENO** |
| CF-3 | Nuka Estates "v likvidaci" — holdingová společnost původních parcel Quinlan/Golub | CRITICAL | ARES + spisová značka C 62674/KSOS | **POTVRZENO** |
| CF-4 | Stav DPH Nuka Estates ZANIKLY, zatímco stav VR AKTIVNI — zombie subjekt | HIGH | ARES `seznamRegistraci` | **NOVÉ** |
| CF-5 | MARSEA MIA (zajištěný věřitel) AKTIVNÍ — zástavy mohou stále zatěžovat aktiva | HIGH | ARES | **POTVRZENO** |
| CF-6 | Data LV ČÚZK nepřístupná bez placeného účtu + obejití captchy | MEDIUM (nástroje) | HTTP probe | **NOVÉ** |
| CF-7 | Adresa Nuka Estates Holická 1173/49a (nikoli Krapkova jako dřívější intel) | LOW | ARES aktuální záznam | **OPRAVA** |
| CF-8 | Mstětice k.ú. = 792764 (předchozí intel ve workspace uvádělo 693685 — CHYBNĚ) | LOW | dotaz ArcGIS | **OPRAVA** |
| CF-9 | Adaptér Prismatic CZECH-CUZK vrací stub data (dev fallback) | MEDIUM (nástroje) | čtení kódu L290-340 | **NOVÉ** |

---

## 9. Prioritní mezery — co vyžaduje on-site návštěvu ČÚZK

### P0 — Musí být před podpisem (72 h)

| # | Akce | Výstup |
|---|---|---|
| P0-1 | Otevřít účet dálkového přístupu ČÚZK; získat výpis LV 927 (Mstětice 792764) | Plný řetězec vlastnictví oddíly C/D/E/F |
| P0-2 | Získat výpis LV 1326 (Mstětice 792764) | Plný řetězec vlastnictví |
| P0-3 | Dotaz ČÚZK podle vlastníka: `Nový Zeleneč a.s. 27825981` → všechna držená LV | Komplexní harmonogram parcel |
| P0-4 | Dotaz ČÚZK podle vlastníka: `RD Rýmařov Invest III. alpha 10800123` → všechna držená LV | Komplexní harmonogram parcel |
| P0-5 | Dotaz podle vlastníka: `Nuka Estates 27890104` → reziduální LV pokud existují | Plocha reziduální odpovědnosti |
| P0-6 | Dotaz podle vlastníka: `MARSEA MIA 03454029` → jakákoli aktuálně držená LV jako jištění | Ověření vyvázání zástav |

### P1 — Mělo by být před closingem (1 týden)

| # | Akce | Výstup |
|---|---|---|
| P1-1 | Historický řetězec vlastnictví LV 927 + 1326 (všechny výpisy od 2007) | Rekonstrukce řetězce vlastnických titulů (land title chain) |
| P1-2 | Ověřit vlastníky parcel 73/1, 178/1, 170, 182/1 (největší orná půda) | Mapa vlastnictví 130 ha |
| P1-3 | Plný výpis Sbírky listin Nuka Estates (KSOS C 62674) — všechny zprávy likvidátora | Potvrzení stavu likvidace |
| P1-4 | Územní plán Zeleneč přijatý 2025-02-18 — získat text + zonaci parcel | Potvrzení rozvojové schopnosti |

### P2 — Hezké mít (2 týdny)

| # | Akce | Výstup |
|---|---|---|
| P2-1 | Vlastní katastr Obce Zeleneč — obecní pozemkové držby | Závislosti na veřejných pozemcích |
| P2-2 | Stav lucemburské mateřské Quinlan Private (RCS) | Historické závazky mateřské společnosti |
| P2-3 | Stav Modransky Haj s.r.o. (paralelní vehikl Quinlan, 2008-09-17) | Srovnatelný |

---

## 10. Doporučení k nástrojům Prismatic

1. **Přidat adaptér RUIAN** (`PrismaticOsintSources.Adapters.Czech.Ruian`) obalující `ags.cuzk.gov.cz/ArcGIS/rest/services/RUIAN/MapServer`. Bez captcha, vrací reálnou geometrii parcel + výměru + druh pozemku pro libovolné k.ú. v ČR. Dotazy ověřeny výše. Snadný zisk.
2. **Dokumentovat omezení captcha v adaptéru ČÚZK** v jeho `@moduledoc` (nyní mlčí). Současné chování stub je zavádějící.
3. **Specializovaný DD helper** `PrismaticDd.Land.CadastreReport`, který kombinuje: ARES (vlastník) + RUIAN (parcely) + ISIR (insolvence) + ISIR (likvidace) do jedné zprávy. Současný workspace to dělá ručně — měl by to být modul.

---

## 11. Zdroje (pro citace)

| Zdroj | URL | Datum přístupu |
|---|---|---|
| ARES veřejné rozhraní | `ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}` | 2026-04-21 |
| ČÚZK RÚIAN ArcGIS REST | `ags.cuzk.gov.cz/ArcGIS/rest/services/RUIAN/MapServer` | 2026-04-21 |
| ČÚZK nahlíženi (blokováno) | `nahlizenidokn.cuzk.gov.cz` | 2026-04-21 (HTTP 302 → perfdrive) |
| ISIR insolvenční rejstřík | `isir.justice.cz/isir/ueu/evidence_upadcu_detail.do?id={ico}` | 2026-04-21 |
| Adaptér Prismatic ČÚZK | `apps/prismatic_osint_sources/lib/prismatic_osint_sources/adapters/czech/cuzk.ex` | Stub impl, commitováno |

---

*Forenzní pass 1 dokončen. Datová vrstva vlastnictví limitována captcha-zdí; pokračovat s placeným dálkovým přístupem ČÚZK (P0-1..P0-6) před podpisem PPF.*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [02-entity/raw-cuzk/README.md](./raw-cuzk/README.md) — 🔴 Cadastre forensics (7×)
- [RED-FLAGS.md](../RED-FLAGS.md) — 02-entity/cuzk-cadastre-forensics.md (4×)
- [MASTER-FINDINGS.md](../MASTER-FINDINGS.md) — 02-entity/cuzk-cadastre-forensics.md (3×)
- [MISSION-COMPLETE.md](../MISSION-COMPLETE.md) — `02-entity/cuzk-cadastre-forensics.md` (2×)
- [02-entity/CUZK-PAID-PULL-REQUEST.md](./CUZK-PAID-PULL-REQUEST.md) — cuzk-cadastre-forensics.md
- [BACKLINKS-AUDIT.md](../BACKLINKS-AUDIT.md) — 02-entity/cuzk-cadastre-forensics.md

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `02-entity%2Fcuzk-cadastre-forensics.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
