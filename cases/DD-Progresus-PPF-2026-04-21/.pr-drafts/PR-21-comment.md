## Související práce: DD-Progresus-PPF-2026-04-21 (Pass-11)

Souběžně s touto PR proběhl Pass-11 v DD workspace `~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21/` (ne v tomto repu — standalone složka).

**Rozsah** (8 commitů, baseline `1b420dd` → tip `4dcada4`):
- Český překlad celého workspace (65 .md + 30 .html, formální obchodně-právní registr)
- 13 portů z `~/dev/prismatic-platform`:
  - **Quant**: Monte Carlo valuation (Box-Muller, P10/P50/P90, P(<floor)), Bayesian red-flags (prior×LR), PageRank + komunity + Brandes betweenness na knowledge graphu
  - **Viz**: Sankey bond stack (Canvas), ⌘K command palette (cmdk.js, sjednoceno na 24 stránkách), ČR choropleth na geo mapě
  - **Linking**: Sdílený URL state napříč kalkulátory + 4 presety, bidirectional entity↔doc linking (76 entit × 64 souborů = 5503 zmínek), temporal replay 2007→2026 na deal-journey
  - **Operational**: Live ticker + cross-tab sync, A4 print pack (~13–17 stran), AB scenario compare s diff sloupcem
- 3 maintenance porty: sw.js v1.2.0 cache, manifest/graph indexes regen, CHANGELOG Pass-11
- Code review fixes: 3 CRITICAL (MC main thread freeze, duplicate md-store, Alpine init crash) + 4 HIGH (NaN guards, dark mode persistence, Safari regex compat)

**Workspace**: Static HTML/MD running over file:// or HTTP, 0 backend, offline-first PWA.

**Vztah k této PR**: Workspace je samostatný produkt pro DD tým prodávajícího; tato PR (`progresus-ai-transformation`) je software platforma. Sdílí Project Mycelium thema, ale code bases jsou nezávislé.

**Rollback**: `cd ~/dev/prismatic-platform/cases/DD-Progresus-PPF-2026-04-21 && git reset --hard 1b420dd`
