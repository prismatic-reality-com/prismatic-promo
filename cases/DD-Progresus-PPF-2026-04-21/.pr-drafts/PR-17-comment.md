## Související: DD workspace Pass-11 (translation + 13 portů)

Souběžně se sprintem na `korczis/tooling` proběhl Pass-11 v DD workspace `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/` (samostatná složka mimo tento repo).

**Statistika**: 8 commitů, ~3000 LOC kódu / ~50000 LOC obsahu, 4 nové dashboardy, 9 nových _assets souborů.

**Klíčové dodávky pro DD tým**:
- 65 .md + 30 .html stránek plně v češtině (formální obchodně-právní registr)
- Monte Carlo simulace ocenění (10k–100k iterací, P10/P50/P90, P(<floor=3,7 mld)=3,6%)
- AB porovnání scénářů (Default vs PPF anchor → 5/5 metrik pro Default)
- ⌘K globální command palette (24 stránek)
- Bidirectional entity↔doc linking: 76 entit × 64 souborů = 5503 zmínek (nejvíc PPF=164×, Nový Zeleneč=40× v MASTER-DD-REPORT.md)
- Temporal replay 2007→2026 na deal-journey
- Live ticker s cross-tab sync
- A4 tiskový balík (cover + one-pager + red-flags + DD exec + valuation + playbook + action plan, ~13–17 stran)
- 3 reader.html bug fixy (double-encoded URLs, root-file path joins)
- Code review pass: 3 CRITICAL + 4 HIGH issues opraveny

**Návaznost na ADNZ tickety**: Pass-11 je z větší části ADNZ-73 (Czech i18n) + ADNZ-77 (cockpit redesign UX patterns ported into DD reader/dashboards) + ADNZ-85 (Claude prompts → DD entity extraction patterns). Worklogy zatím neuložené v Tempo.

**Rollback**: `cd ~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21 && git reset --hard 1b420dd`
