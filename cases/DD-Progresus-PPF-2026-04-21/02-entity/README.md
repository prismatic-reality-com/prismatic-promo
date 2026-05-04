# 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů

[← Zpět na 00-INDEX.md](../reader.html?file=00-INDEX.md) | [🏠 Portál](../index.html) | [📊 Graf subjektů](./entity-graph.html)

> **Účel** — Kdo co vlastní a prostřednictvím které SPV. Mapuje 25+ subjektů na obou stranách; ukotvuje rozsah transakce 42 ha ke konkrétním parcelám katastru Mstětic; trasuje řetězec vlastnických titulů od zkrachovalého irského PE fondu přes Lucembursko a Lébra až po Progresus.

---

## 📂 Soubory v tomto adresáři

| Soubor | Účel | Shrnutí jednou větou | Nadřazený index |
|------|---------|----------------|--------------|
| [entity-structure.md](../reader.html?file=02-entity/entity-structure.md) | Stromy skupin subjektů | Stromy skupin Progresus + PPF (zmapovány obě strany) | [00-INDEX §Struktura subjektů](../reader.html?file=00-INDEX.md) |
| [confirmed-entities.md](../reader.html?file=02-entity/confirmed-entities.md) | Ověřená IČO | Kanonická IČO všech subjektů v perimetru transakce | [00-INDEX](../reader.html?file=00-INDEX.md) |
| [cuzk-cadastre-forensics.md](../reader.html?file=02-entity/cuzk-cadastre-forensics.md) | 🔴 Forenzní analýza katastru | Mstětice k.ú. **792764** — 11 kandidátních parcel, 135,1 ha orné půdy, hypotéza 42 ha | [00-INDEX top-10 #8](../reader.html?file=00-INDEX.md) |
| [land-title-chain.md](../reader.html?file=02-entity/land-title-chain.md) | 🔴 Řetězec vlastnických titulů | Řetězec Quinlan → Nuka → Lébr → Progresus (analýza distressed původu) | [RED-FLAGS RF-9..12](../reader.html?file=RED-FLAGS.md) |
| [HP-sharing-ban-resolution.md](../reader.html?file=02-entity/HP-sharing-ban-resolution.md) | 🟢 Vyřešení RF-8 | HP "sharing ban" identifikován jako **OCR artefakt** v dokumentech 2026-04-01 — sníženo z CRITICAL→LOW | [RED-FLAGS RF-8](../reader.html?file=RED-FLAGS.md) |
| `raw-cuzk/` | Surová data ČÚZK | JSON metadata + parcely pro k.ú. Mstětice + Zeleneč | — |

---

## 🔑 Klíčová zjištění

- 🔴 **Rozsah transakce ukotven na Mstětice k.ú. 792764** (nikoli 693685 — častá záměna identifikace). 135,1 ha orné půdy na 11 velkých parcelách; kandidátních 42 ha = parcely **73/1 (24,85 ha) + 178/1 (16,84 ha) = 41,69 ha**.
- 🔴 **Potvrzen dvouvrstvý vertikální stack SPV**: RD Rýmařov Invest III. alpha s.r.o. (IČO **10800123**, založena 2021-04-30, Karlín) vlastní 100 % Nový Zeleneč a.s. (IČO **27825981**). Transakce = akciový obchod na III. alpha (zachovává ÚP + EIA + plánovací smlouvu).
- 🔴 **Tísňový (distressed) původ řetězce titulů** — 42 ha trasováno přes Quinlan Private (zkrachovalý irský PE) → Nuka Estates Lucembursko → Lébr → Progresus. Nuka Estates s.r.o. (IČO 27890104) **stále v likvidaci** (likvidátorka Pavlína Zdařilová od 2023-04-19).
- 🔴 **Status zajištěného věřitele MARSEA MIA stále AKTIVNÍ** — zástavy mohou stále zatěžovat poolu 130 ha. Vazba na rodinu Lébrových (Jana Lébrová 60 %). Nezbytný placený výpis ČÚZK pro LV 927 + LV 1326 k potvrzení čistého titulu.
- 🟢 **HP "sharing/cohabitation ban" = OCR artefakt** — pojem v české územně-plánovací terminologii neexistuje; sníženo z CRITICAL na LOW (informativní).

---

## 🔗 Křížové odkazy

- Spor DANCORE na parcelách NZ → [04-legal/DANCORE-FORENSIC-DOSSIER.md](../reader.html?file=04-legal/DANCORE-FORENSIC-DOSSIER.md), [04-legal/isir-court-sweep.md](../reader.html?file=04-legal/isir-court-sweep.md) (RF-26)
- Spor o vlastnictví zástavy dluhopisů → [03-financial/sbirka-listin-audit.md](../reader.html?file=03-financial/sbirka-listin-audit.md) + [RED-FLAGS RF-1](../reader.html?file=RED-FLAGS.md)
- Daňové důsledky akciového obchodu na III. alpha → [03-financial/TAX-STRUCTURE-MEMO.md](../reader.html?file=03-financial/TAX-STRUCTURE-MEMO.md) §1.1
- Strom subjektů na straně PPF → [05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md](../reader.html?file=05-osint/ppf-side-deep/PPF-GOVERNANCE-MAP.md)
- Architektonický vzor akvizice z insolvence → [05-osint/insolvency-acquisition-pattern.md](../reader.html?file=05-osint/insolvency-acquisition-pattern.md)
- Konsolidovaný brief pro představenstvo → [06-reports/MASTER-DD-REPORT-v1.0.md](../reader.html?file=06-reports/MASTER-DD-REPORT-v1.0.md) §3 (Subjekty + tituly)

---

## ❓ Otevřené otázky / mezery

- **Placený výpis dálkového přístupu ČÚZK pro LV 927 + LV 1326 DOSUD NEPROVEDEN** (P0, ~50 tis. CZK, 72 h). Bez něj jsou prohlášení o vlastnictví v SPA nepodložené.
- **Stav vyvázání zástav MARSEA MIA** — potřeba aktuální výpis zatížení s razítkem LV.
- **Lhůta pro odporovatelnost likvidátorky Nuka Estates** — nutná analýza promlčení dle §234 InsZ / §589 ObčZ.
- **Reziduální vztah Lébr / Ravantino** — web Ravantino projekt stále inzeruje; požadován formální dopis o "neexistenci zájmu".
- **Plné rozdělení 11 parcel vs 42 ha držených/třetí strany** — DR-SCOPE-001 dosud nebylo vypracováno.

---

## ⚡ Rychlé akce

- Pokud potřebujete **obhájit titul na schůzce 1 s PPF** → čtěte [cuzk-cadastre-forensics.md](../reader.html?file=02-entity/cuzk-cadastre-forensics.md) + [land-title-chain.md](../reader.html?file=02-entity/land-title-chain.md) (45 min).
- Pokud potřebujete **vyčíslit expozici DANCORE proti titulu** → čtěte [land-title-chain.md](../reader.html?file=02-entity/land-title-chain.md) + [../04-legal/DANCORE-FORENSIC-DOSSIER.md](../reader.html?file=04-legal/DANCORE-FORENSIC-DOSSIER.md).
- Pokud potřebujete **vysvětlit dvouvrstvou strukturu SPV čtenáři poprvé** → čtěte [entity-structure.md](../reader.html?file=02-entity/entity-structure.md) + [confirmed-entities.md](../reader.html?file=02-entity/confirmed-entities.md).
- Pokud potřebujete **vytáhnout data z ČÚZK** → začněte od [cuzk-cadastre-forensics.md](../reader.html?file=02-entity/cuzk-cadastre-forensics.md) §9 (seznam mezer datové místnosti) + [raw-cuzk/](./raw-cuzk/).
- Pokud potřebujete **uzavřít red flag "HP sharing ban"** → čtěte [HP-sharing-ban-resolution.md](../reader.html?file=02-entity/HP-sharing-ban-resolution.md) (vyřešeno → LOW).

---

📊 **Interaktivní přehled** → [entity-graph.html](./entity-graph.html) *(graf subjektů, překryv mapy parcel Mstětic, časová osa řetězce titulů)*

---

*Naposledy aktualizováno: 2026-04-21 | Verze 1.0 | Připravenost: 5/5 souborů aktivních + data raw-cuzk/*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [02-entity/raw-cuzk/README.md](./raw-cuzk/README.md) — ← Zpět na 02-entity (3×)
- [01-intel/README.md](../01-intel/README.md) — 02-entity/README.md (2×)
- [03-financial/README.md](../03-financial/README.md) — 02-entity/README.md (2×)
- [04-legal/README.md](../04-legal/README.md) — 02-entity/README.md (2×)
- [05-osint/README.md](../05-osint/README.md) — 02-entity/README.md (2×)
- [07-sources/README.md](../07-sources/README.md) — 02-entity/README.md (2×)
- [08-comms-templates/README.md](../08-comms-templates/README.md) — 02-entity/README.md (2×)
- [00-INDEX.md](../00-INDEX.md) — 02-entity/README.md
- [02-entity/HP-sharing-ban-resolution.md](./HP-sharing-ban-resolution.md) — 02-entity/README.md
- [02-entity/confirmed-entities.md](./confirmed-entities.md) — 02-entity/README.md
- [02-entity/cuzk-cadastre-forensics.md](./cuzk-cadastre-forensics.md) — 02-entity/README.md
- [02-entity/entity-graph.html](./entity-graph.html) — 🏢 02-entity
- [02-entity/entity-structure.md](./entity-structure.md) — 02-entity/README.md
- [02-entity/land-title-chain.md](./land-title-chain.md) — 02-entity/README.md
- [06-reports/README.md](../06-reports/README.md) — 02-entity/README.md

## 🏷️ Související soubory (podle shody tagů)

- [07-sources/README.md](../07-sources/README.md) — podobnost 1.00 · 07-sources — Manifest důkazů a řetězec původu
- [01-intel/README.md](../01-intel/README.md) — podobnost 1.00 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [03-financial/README.md](../03-financial/README.md) — podobnost 1.00 · 03-financial — Dluhopisy, listiny, daňová struktura
- [05-osint/README.md](../05-osint/README.md) — podobnost 1.00 · 05-osint — Zpravodajství z otevřených zdrojů + governance PPF
- [04-legal/README.md](../04-legal/README.md) — podobnost 1.00 · 04-legal — Soudní spory, Povolení, Životní prostředí, UBO

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `02-entity%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
