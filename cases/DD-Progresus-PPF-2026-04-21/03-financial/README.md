# 03-financial — Dluhopisy, listiny, daňová struktura

[← Zpět na 00-INDEX.md](../reader.html?file=00-INDEX.md) | [🏠 Portál](../index.html) | [📊 Bond Stack](./bond-stack.html)

> **Účel** — Peněžní vrstva. Realitní kontrola dluhopisové struktury, audit prodlení s podáním do Sbírky listin, sesouhlasení CASPER/Vitrablok a scénář daňové struktury pro akciový obchod na IČO 10800123.

---

## 📂 Soubory v tomto adresáři

| Soubor | Účel | Jednovětný souhrn | Nadřazený index |
|------|---------|----------------|--------------|
| [financial-analysis.md](../reader.html?file=03-financial/financial-analysis.md) | Finanční toky + sesouhlasení | Kapitálové toky + sesouhlasení CASPER 800M/229M (Vitrablok) | [00-INDEX](../reader.html?file=00-INDEX.md) |
| [sbirka-listin-audit.md](../reader.html?file=03-financial/sbirka-listin-audit.md) | 🔴 Audit listin + dluhopisů | 4leté prodlení + dluhopisová struktura (7,6 mld. CZK / 68 tranší / 5 prospektů) | [00-INDEX top-10 #10](../reader.html?file=00-INDEX.md) |
| [TAX-STRUCTURE-MEMO.md](../reader.html?file=03-financial/TAX-STRUCTURE-MEMO.md) | 🟢 Daňový scénář | Akciový obchod vs majetkový obchod + Kypr/NL přeshraniční režim + osvobození podílu | [00-INDEX](../reader.html?file=00-INDEX.md) |
| [contradictions-critical-high.tsv](./contradictions-critical-high.tsv) | 🗂️ Evidence rozporů | TSV log CRITICAL/HIGH rozporů z Pass 0 (prázdný — re-derivováno v Pass 2-4) | [MASTER-FINDINGS.md](../reader.html?file=MASTER-FINDINGS.md) |
| `raw/` | Surové finanční artefakty | `entity-map.tsv`, `sl-rows.json`, PPF/Progresus výpisy, testovací HTML | — |

---

## 🔑 Klíčová zjištění

- 🔴 **Dluhopisová struktura je 7,6+ mld. CZK, nikoli ~1 mld.** (RF-28). 5 schválených prospektů, 68 tranší napříč křížově ručenou strukturou skupiny PROGRESUS. **5. prospekt schválen 2026-01-28 během jednání s PPF** — optický problém.
- 🔴 **Nový Zeleneč a.s. — 4leté prodlení s podáním účetní závěrky** (RF-27). NULA podání za FY2021, 2022, 2023, 2024. Ve sbírce pouze FY2020. Porušení §21a zákona o účetnictví. **PPF nemůže ocenit bez reálných finančních výkazů.**
- 🔴 **CASPER 800M vs 229M vyřešeno (C1)** — Casper Group (Štekl) je externím spoluinvestorem na Vitrabloku. 800M = celkový tiket Vitrabloku; 229M = portion Progresu. Ne rozpor — dvě různé protistrany.
- 🟢 **Akciový obchod na RD Rýmařov Invest III. alpha s.r.o. (IČO 10800123) je daňově optimální cestou** pro Progresus: osvobození podílu (§19 odst. 1 písm. ze) potenciálně eliminuje 600M-1,2 mld. CZK korporátní daně ze zisku, pokud držba ≥12m a podíl ≥10 %.
- 🔴 **4 z 5 emitentů dluhopisů mají NULOVÉ účetní závěrky** — materiální mezera v disclosure pro jakoukoli žádost o souhlas k změně kontroly.

---

## 🔗 Křížové odkazy

- Spor o vlastnictví zástavy dluhopisů (alegace Pro Věřitele) → [RED-FLAGS RF-1, RF-3, RF-4, RF-27, RF-28](../reader.html?file=RED-FLAGS.md), [../PPF-PLAYBOOK.md](../reader.html?file=PPF-PLAYBOOK.md) Q2 + Q7 + Q14
- Šablona procesu žádosti o souhlas ke změně kontroly → [08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md](../reader.html?file=08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md)
- Vlastnická vertikála entit, kterou daňové memo optimalizuje → [02-entity/entity-structure.md](../reader.html?file=02-entity/entity-structure.md), [02-entity/confirmed-entities.md](../reader.html?file=02-entity/confirmed-entities.md)
- Riziko propojené osoby (RPT) AMALAR / PPF banka (ovlivňuje financování na straně kupujícího) → [01-intel/ppf-deal-financing-analysis.md](../reader.html?file=01-intel/ppf-deal-financing-analysis.md), [08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md](../reader.html?file=08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md)
- Vstupy pro ocenění (DCF / komparativní / precedenční / likvidační) → [06-reports/VALUATION-DEFENSE-MEMO.md](../reader.html?file=06-reports/VALUATION-DEFENSE-MEMO.md)
- Harmonogram zveřejnění (disclosure schedule) datové místnosti pro FIN dokumenty → [06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md](../reader.html?file=06-reports/DATAROOM-INDEX-AND-DISCLOSURE-SCHEDULE.md) (DR-FIN-020..024)

---

## ❓ Otevřené otázky / mezery

- **Podání ÚZ za FY21-24 pro Nový Zeleneč a.s. + 4 SPV emitentů dluhopisů** — P0 tento týden (náprava Sbírky listin, než se PPF zeptá).
- **Kompletní matice expozice CoC pro 68 tranší** — top-10 koncentrace dluhopisových investorů neznámá.
- **Daňová rezidence Cyprus PPF CRM HE 251908** — strana kupujícího. Pokud zneužívání smluv (treaty shopping), Progresus je indiferentní, ale ovlivňuje apetit PPF k odškodnění.
- **Test 12měsíční držby pro osvobození podílu** — držela III. alpha Nový Zeleneč a.s. ≥12 měsíců? Ověřit z historie obchodního rejstříku.
- **Spouštěcí události 5. prospektu (2026-01-28)** — existuje ustanovení o povinném splacení vázané na nějakou událost související s transakcí?

---

## ⚡ Rychlé akce

- Pokud potřebujete **porozumět expozici dluhopisové struktury pro grilování od PPF** → přečtěte [sbirka-listin-audit.md](../reader.html?file=03-financial/sbirka-listin-audit.md) + [RED-FLAGS RF-27, RF-28](../reader.html?file=RED-FLAGS.md).
- Pokud potřebujete **vybrat strukturu transakce (akciový vs majetkový obchod)** → přečtěte [TAX-STRUCTURE-MEMO.md](../reader.html?file=03-financial/TAX-STRUCTURE-MEMO.md) §1 (Manažerské shrnutí) — akciový obchod na III. alpha doporučen.
- Pokud potřebujete **sesouhlasit CASPER/Vitrablok** → přečtěte [financial-analysis.md](../reader.html?file=03-financial/financial-analysis.md) + [05-osint/insolvency-acquisition-pattern.md](../reader.html?file=05-osint/insolvency-acquisition-pattern.md).
- Pokud potřebujete **připravit nápravné podání za FY21-24** → přečtěte [sbirka-listin-audit.md](../reader.html?file=03-financial/sbirka-listin-audit.md) §7 (Akční plán).
- Pokud potřebujete **sepsat dopis o souhlasu pro dluhopisové investory** → začněte z [../08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md](../reader.html?file=08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md).

---

📊 **Interaktivní přehled** → [bond-stack.html](./bond-stack.html) *(vodopád dluhopisové struktury, časová osa prodlení s podáním, rozhodovací strom daňové struktury)*

---

*Naposledy aktualizováno: 2026-04-21 | Verze 1.0 | Připravenost: 3/4 aktivní + raw/ artefakty; TSV rozporů prázdný (re-derivováno v Pass 2-4)*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

Na tento soubor odkazují:

- [01-intel/README.md](../01-intel/README.md) — 03-financial/README.md (2×)
- [02-entity/README.md](../02-entity/README.md) — 03-financial/README.md (2×)
- [02-entity/raw-cuzk/README.md](../02-entity/raw-cuzk/README.md) — 03-financial/README.md (2×)
- [03-financial/raw/README.md](./raw/README.md) — ← Zpět na 03-financial (2×)
- [04-legal/README.md](../04-legal/README.md) — 03-financial/README.md (2×)
- [05-osint/README.md](../05-osint/README.md) — 03-financial/README.md (2×)
- [07-sources/README.md](../07-sources/README.md) — 03-financial/README.md (2×)
- [08-comms-templates/README.md](../08-comms-templates/README.md) — 03-financial/README.md (2×)
- [00-INDEX.md](../00-INDEX.md) — 03-financial/README.md
- [01-intel/ppf-deal-financing-analysis.md](../01-intel/ppf-deal-financing-analysis.md) — 03-financial/README.md
- [02-entity/confirmed-entities.md](../02-entity/confirmed-entities.md) — 03-financial/README.md
- [02-entity/entity-structure.md](../02-entity/entity-structure.md) — 03-financial/README.md
- [03-financial/TAX-STRUCTURE-MEMO.md](./TAX-STRUCTURE-MEMO.md) — 03-financial/README.md
- [03-financial/bond-stack.html](./bond-stack.html) — 💰 03-financial
- [03-financial/financial-analysis.md](./financial-analysis.md) — 03-financial/README.md

## 🏷️ Související soubory (podle shody tagů)

- [07-sources/README.md](../07-sources/README.md) — podobnost 1.00 · 07-sources — Manifest důkazů a řetězec původu
- [01-intel/README.md](../01-intel/README.md) — podobnost 1.00 · 01-intel — Kontext transakce, stakeholdeři, komunikace
- [02-entity/README.md](../02-entity/README.md) — podobnost 1.00 · 02-entity — Korporátní struktura, katastr, řetězec vlastnických titulů
- [05-osint/README.md](../05-osint/README.md) — podobnost 1.00 · 05-osint — Zpravodajství z otevřených zdrojů + governance PPF
- [04-legal/README.md](../04-legal/README.md) — podobnost 1.00 · 04-legal — Soudní spory, Povolení, Životní prostředí, UBO

## 🌐 Pohled grafu

[Otevřít v portálu](../index.html) · [Mapa stránek](../sitemap.html) · [Hledat](../search.html) · Focus ID: `03-financial%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
