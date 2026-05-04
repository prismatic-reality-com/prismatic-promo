# Phase 3 — Prismatic Platform Integration Map

**Účel**: doložit, že DD case `kellner-cluster-amalar` je integrovaný s platformou (ne stand-alone markdown).

## Klíčové platformové vrstvy použité v této integraci

### 1. Case Store (PrismaticWeb)
- **Modul**: `PrismaticWeb.DD.CaseStore` (`apps/prismatic_web/lib/prismatic_web/dd/case_store.ex`)
- **Directory schema**: `apps/prismatic_web/priv/dd_cases/<case_id>/`
- **Použité subdirectory**:
  - `metadata.json` — case metadata (id, name, status, tags, entity_ids, subject, scope)
  - `README.md` — human-readable case overview
  - `findings/` — phase findings (sanctions, entities, platform map)
  - `evidence/` — raw evidence (Decision Engine input JSON)
  - `network/` — graph artifacts (Mermaid + Graphviz DOT)
  - `reports/` — pipeline outputs + render-ready reports

### 2. Entity Store (PrismaticDd)
- **Modul**: `PrismaticDd.Entity.Store` (`apps/prismatic_dd/lib/prismatic_dd/entity/store.ex`)
- **Directory schema**: `apps/prismatic_dd/priv/data/entities/<type>/<id>.json`
- **Type buckets used**: `person/`, `company/`
- **Files materialized**: 4 persons + 11 companies = 15 entity JSON files

### 3. Decision Engine RuntimePipeline (PrismaticDd.Decision)
- **Modul**: `PrismaticDd.Decision.RuntimePipeline` (`apps/prismatic_dd/lib/prismatic_dd/decision/runtime_pipeline.ex`)
- **Mix task**: `mix dd.runtime_pipeline --file inputs.txt --actors actors.txt --subject-type person --json`
- **10-stage pipeline**: normalize → analyze_signals → assess_sources → detect_anomalies → profile_actors → score → estimate_uncertainty → evaluate_hypotheses → recommend → explain
- **Run executed 2026-04-28T19:54Z**: ~66ms wall, verdict `caution`, risk `high`, score `60/100`, output saved to `reports/pipeline-output.json`

### 4. NbsReport Components (planned for Phase 4 UI rendering)
- **Modul**: `PrismaticDd.NbsReport.Transformer` (a8b2b6de62) + `apps/prismatic_web/lib/prismatic_web/components/dd/nbs_report/` (Core/Scoring/Evidence/Helpers)
- **LiveView route**: `/hub/dd/decisions/:id/report` (decision_detail_live.ex:.. action bar)
- **Status**: data ready, render not yet executed (requires LiveView session)

### 5. ConfidenceLens + RiskConsole UI components (planned)
- **Moduly**:
  - `PrismaticWeb.Components.DD.ConfidenceLens` (#1534) — lens_hero, confidence_gauge, probe_strip, alert_strip, drift_panel, brand_footer
  - `PrismaticWeb.Components.DD.RiskConsole` (#1533) — console_header, metric_card/bar, target_banner, dimension_grid, risk_feed
- **Status**: components exist, can render from `pipeline-output.json` decision block + `metadata.json` risk_level

### 6. OSINT Adapters (used implicitly via WebSearch/WebFetch tools, not direct adapter call)
- **Czech ARES**: `PrismaticOsintSources.Adapters.Czech.ARES` (circuit breaker + ETS 6h cache)
- **Czech Justice**: `PrismaticOsintSources.Adapters.Czech.Justice` (3-phase ML-enhanced, 12h cache)
- **EU Sanctions**: `PrismaticOsintSources.Adapters.Sanctions.EUSanctions` (fuzzy matching)
- **Note**: This investigation used WebFetch/WebSearch directly (~80 tool calls across Phase 1+2+3); the dedicated adapters provide caching + structured output and would be the productionized path for repeated runs.

## Integration verification

| Layer | File created | Verified |
|-------|--------------|----------|
| Case metadata | `apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/metadata.json` | ✅ |
| Case README | `apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/README.md` | ✅ |
| Person entities (4) | `apps/prismatic_dd/priv/data/entities/person/person-{renata,anna,otruba,sevela}-...json` | ✅ |
| Company entities (11) | `apps/prismatic_dd/priv/data/entities/company/company-*.json` | ✅ |
| Mermaid graph | `network/ownership-graph.mmd` | ✅ |
| Graphviz DOT | `network/ownership-graph.dot` | ✅ (`dot -Tpng ownership-graph.dot -o ownership-graph.png` to render) |
| Decision Engine input | `evidence/decision-engine-input.json` | ✅ (JSON valid) |
| Pipeline inputs (CLI form) | `reports/inputs.txt` + `reports/actors.txt` | ✅ |
| Pipeline executable | `reports/run-pipeline.sh` | ✅ +x |
| Pipeline output | `reports/pipeline-output.json` | ✅ verdict captured |

## Reproducing the Decision Engine run

```bash
cd /Users/korczis/dev/prismatic-platform
./apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/run-pipeline.sh --json --verbose > /tmp/pipeline.out 2>&1
# Or inline:
mix dd.runtime_pipeline \
  --file apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/inputs.txt \
  --actors apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/actors.txt \
  --subject-type person \
  --json
```

## Doctrine compliance

- ✅ NMND — žádné placeholders v entity JSONs ani pipeline inputs
- ✅ NWB — premise falsifications dokumentovány v metadata + entity attributes (forward-only correction)
- ✅ NCLB — všechny attributes mají source URLs v entity metadata.sources
- ✅ CZE — README + findings v češtině s EN technical bodies, identifikátory EN
- ✅ GDPR — pouze public-figure-as-public-role data, žádné soukromé adresy/kontakty
- ✅ TACH — žádné lib/ změny v této session, pouze data files a scripty (nepředpokládá test coverage)
- ✅ DEPS — žádné dependency změny

## Out-of-scope for this phase

- Lib/ code changes (would require TACH test coverage)
- Modifications to existing platform modules
- Database migrations (case is filesystem-resident, per CaseStore design)
- Network HTTP calls beyond OSINT WebFetch/WebSearch via agents
