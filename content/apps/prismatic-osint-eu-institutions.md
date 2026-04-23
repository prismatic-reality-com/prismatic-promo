+++
title = "Prismatic OSINT EU Institutions"
weight = 66
[extra]
icon = "flag"
color = "blue"
description = "EU institutional data adapters - ECB, Europol, EU sanctions, and regulatory bodies"
category = "OSINT"
files = "150"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1031
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Institutions", "Europol", "apps", "Prismatic Platform", "PrismaticOsintEuInstitutions", "ECHA"]
tags = ["apps", "osint", "prismatic-osint-eu-institutions", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT EU Institutions - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](/glossary/osint/) EU Institutions provides [adapter pattern](/glossary/adapter-pattern/) implementations for European Union institutional data sources, integrating with EU sanctions lists, ECB financial data, Europol threat assessments, and EU regulatory databases for comprehensive European intelligence collection. Each adapter normalizes source-specific data formats into the platform's unified [entity resolution](/glossary/entity-resolution/) schema, enabling cross-source correlation and [knowledge graph](/glossary/knowledge-graph/) integration through consistent data structures.

The application implements real-time monitoring of EU sanctions list updates, automatically detecting additions, removals, and modifications to consolidated restrictive measures lists. Entity matching against sanctions lists uses fuzzy name resolution with transliteration support for names across European languages, combined with [confidence scoring](/glossary/confidence-scoring/) derived from the platform's [NABLA epistemic framework](/glossary/nabla-infinity/) to distinguish true matches from coincidental name similarities. All screening results pass through [Trinity Gate](/glossary/trinity-gate/) validation before being reported as findings.

Financial intelligence adapters integrate with ECB reference rates, EU trade statistics, and state aid databases, providing the economic context necessary for comprehensive due diligence assessments. Regulatory data adapters cover ECHA chemical substance registrations, EMA medicinal product authorizations, and TED public procurement data, enabling cross-domain intelligence synthesis that connects business entities to their regulatory footprint across the European Union.

## Architecture

```
Source Adapters --> Response Parser --> Entity Normalizer --> Evidence Store
       |                  |                    |                    |
  EU Sanctions       XML/JSON/CSV          Unified Schema      Knowledge Graph
  ECB Data           Normalization         Confidence Score     PostgreSQL
  TED Tenders        Validation            Source Provenance    Meilisearch
  ECHA/EMA           Rate Limiting         Deduplication        ETS Cache
       |                  |                    |                    |
       +------------------+--------------------+--------------------+
                                 |
                          Update Monitor --> Change Notifications
                                 |
                          Screening Engine --> Fuzzy Entity Matching
```

All parsing and entity normalization follows [pure function](/glossary/pure-function/) principles. Network requests use [rate limiting](/glossary/rate-limiting/) and [backpressure](/glossary/backpressure/) to comply with EU API usage policies. Each adapter runs in its own supervised [process](/glossary/process-isolation/) under the [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/).

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticOsintEuInstitutions` | Public facade: `sanctions_screen/2`, `ted_search/1`, `ecb_rates/2`, `echa_lookup/1` |
| `PrismaticOsintEuInstitutions.Application` | OTP application entry point with per-source adapter supervision |
| `PrismaticOsintEuInstitutions.SanctionsAdapter` | EU consolidated sanctions list fetching, parsing, and update monitoring |
| `PrismaticOsintEuInstitutions.ScreeningEngine` | Fuzzy entity matching against sanctions with transliteration support |
| `PrismaticOsintEuInstitutions.EcbAdapter` | ECB reference rates, monetary statistics, and financial data retrieval |
| `PrismaticOsintEuInstitutions.TedAdapter` | TED procurement data search, contract award monitoring, and supplier analysis |
| `PrismaticOsintEuInstitutions.EchaAdapter` | ECHA chemical substance registration and REACH compliance data |
| `PrismaticOsintEuInstitutions.EmaAdapter` | EMA medicinal product authorization and pharmacovigilance data |
| `PrismaticOsintEuInstitutions.UpdateMonitor` | Real-time monitoring of EU data source updates with change detection |

## Key Features

### EU Sanctions Screening

The sanctions screening engine implements multi-criteria matching against the EU consolidated sanctions list, handling the complexity of names across European languages:

```elixir
defmodule PrismaticOsintEuInstitutions.ScreeningEngine do
  @spec screen(String.t(), keyword()) :: {:ok, ScreeningResult.t()} | {:error, term()}
  def screen(entity_name, opts \\ []) do
    lists = Keyword.get(opts, :lists, [:eu_consolidated])
    threshold = Keyword.get(opts, :threshold, 0.85)

    candidates = Enum.flat_map(lists, fn list ->
      SanctionsAdapter.search(list, entity_name)
    end)

    matches = candidates
    |> Enum.map(fn candidate ->
      scores = %{
        exact: exact_match_score(entity_name, candidate.name),
        fuzzy: fuzzy_match_score(entity_name, candidate.name),
        transliterated: transliteration_score(entity_name, candidate.name),
        alias: alias_match_score(entity_name, candidate.aliases)
      }
      {candidate, aggregate_score(scores)}
    end)
    |> Enum.filter(fn {_candidate, score} -> score >= threshold end)
    |> Enum.sort_by(fn {_candidate, score} -> score end, :desc)

    {:ok, %ScreeningResult{
      entity: entity_name,
      matches: format_matches(matches),
      clear: Enum.empty?(matches),
      screening_id: generate_screening_id(),
      confidence: compute_result_confidence(matches),
      timestamp: DateTime.utc_now()
    }}
  end
end
```

- Consolidated EU sanctions list screening with real-time update monitoring and automatic list refresh
- Entity matching with fuzzy name resolution, transliteration support, and alias cross-referencing
- Sanctions program categorization (terrorism, proliferation, human rights, regional) with regime mapping
- Screening result [confidence scoring](/glossary/confidence-scoring/) with configurable thresholds for automated vs. manual review routing

### Financial Intelligence

- ECB reference rates and monetary statistics with historical time-series access for currency analysis
- EU trade statistics and cross-border transaction pattern analysis for trade-based intelligence
- Financial regulation entity lists (banking, insurance, investment supervision) for authorized entity verification
- State aid database access for subsidy and government support tracking across member states

### Regulatory Data Integration

| EU Body | Data Type | Update Frequency | Coverage |
|---------|-----------|-----------------|----------|
| EU Council | Sanctions lists | Daily | All EU restrictive measures |
| ECB | Reference rates | Daily (workdays) | 30+ currencies |
| TED | Procurement | Daily | EU-wide public procurement above thresholds |
| ECHA | Chemical registration | Weekly | REACH registered substances |
| EMA | Medicinal products | Weekly | Authorized products, pharmacovigilance |
| Europol | Threat assessments | Quarterly | SOCTA, IOCTA reports |

- European Chemicals Agency (ECHA) substance registration and REACH compliance data
- European Medicines Agency (EMA) medicinal product authorization and pharmacovigilance
- EU procurement data from TED (Tenders Electronic Daily) with contract award monitoring
- EU regulatory body decision databases for enforcement action tracking

### Real-Time Update Monitoring

The UpdateMonitor process continuously tracks changes to EU data sources, detecting additions, removals, and modifications:

```elixir
defmodule PrismaticOsintEuInstitutions.UpdateMonitor do
  use GenServer

  @check_interval :timer.minutes(15)

  def handle_info(:check_updates, state) do
    updates = Enum.flat_map(state.monitored_sources, fn source ->
      case check_source_updates(source, state.last_check[source]) do
        {:ok, changes} -> [{source, changes}]
        {:error, _} -> []
      end
    end)

    Enum.each(updates, fn {source, changes} ->
      PrismaticPubSub.broadcast("eu_institutions:updates", {:source_updated, source, changes})
    end)

    Process.send_after(self(), :check_updates, @check_interval)
    {:noreply, update_last_check(state, updates)}
  end
end
```

### Source Health Monitoring

- Availability tracking per EU data source with automatic failover and retry logic
- [Circuit breaker](/glossary/circuit-breaker/) patterns preventing cascading failures when EU portals are unavailable
- [Telemetry](/glossary/telemetry/) emission for source response times, error rates, and data freshness [metrics](/glossary/metrics/)

## Integrated Sources

| Source | Data Type | Key Capability |
|--------|-----------|----------------|
| EU Sanctions List | Sanctions | Consolidated restrictive measures with daily updates |
| TED (Tenders) | Procurement | EU-wide public procurement data above threshold values |
| ECB | Financial | Exchange rates, monetary statistics, and financial stability data |
| Europol | Threat | SOCTA, IOCTA [threat intelligence](/glossary/threat-intelligence/) assessments and trend analysis |
| ECHA | Regulatory | Chemical substance registration and REACH compliance verification |
| EMA | Regulatory | Medicinal product authorization and safety signal monitoring |

## Usage

```elixir
# EU sanctions screening with confidence scoring
{:ok, result} = PrismaticOsintEuInstitutions.sanctions_screen("Entity Name",
  lists: [:eu_consolidated, :eu_terrorism],
  threshold: 0.85
)
# => %{matches: [...], confidence: 0.92, screening_id: "scr_..."}

# EU procurement search via TED
{:ok, tenders} = PrismaticOsintEuInstitutions.ted_search(
  keywords: "cybersecurity", country: "CZ", min_value: 100_000)
# => %{tenders: [...], total: 47, page: 1}

# ECB reference rate data
{:ok, rates} = PrismaticOsintEuInstitutions.ecb_rates(:CZK, period: :last_90_days)
# => %{current: 25.12, history: [...], trend: :stable}

# ECHA substance lookup
{:ok, substance} = PrismaticOsintEuInstitutions.echa_lookup(cas: "64-17-5")
# => %{name: "Ethanol", reach_status: :registered, tonnage_band: "1000+"}

# Monitor EU source updates
{:ok, _} = PrismaticOsintEuInstitutions.subscribe_updates(:eu_sanctions)
```

## NABLA Compliance

| NABLA Axiom | EU Institutions Enforcement | Implementation |
|-------------|---------------------------|----------------|
| Provenance Mandatory | Every data point traceable to EU institutional source | Source URL, retrieval timestamp, and list version on all records |
| Signal Plurality | Sanctions matches require multi-criteria corroboration | Screening combines name, alias, DOB, and address signals |
| Time Decay | EU data freshness tracked with update monitoring | UpdateMonitor timestamps all retrievals, staleness triggers re-fetch |
| Source Independence | Each EU institutional adapter operates independently | Per-source process isolation with independent health monitoring |
| Contradiction Preservation | Conflicting data across EU sources preserved | Cross-source discrepancies maintained with confidence scores |

## Testing

Sanctions screening tests verify fuzzy matching accuracy, transliteration correctness, and false positive rates against labeled datasets of known sanctioned and non-sanctioned entities. ECB adapter tests verify rate data parsing, historical series accuracy, and update detection. TED adapter tests verify procurement search relevance and contract data completeness.

Integration tests exercise the full pipeline from EU source fetching through parsing, normalization, and evidence store persistence. Update monitoring tests verify change detection accuracy across simulated list updates.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Sources](/apps/prismatic-osint-sources/) | EU adapters registered in the unified OSINT source catalog with capability metadata |
| [Prismatic OSINT Business](/apps/prismatic-osint-business-financial/) | EU financial and sanctions data feeding business intelligence profiles |
| [Prismatic Storage Ecto](/apps/prismatic-storage-ecto/) | [PostgreSQL](/glossary/postgresql/) persistence for screening results and regulatory data |
| [Prismatic Graph](/apps/prismatic-graph/) | Entity relationship mapping connecting EU data to the knowledge graph |
| [Prismatic Compliance](/apps/prismatic-compliance/) | [NIS2](/glossary/nis2/) and [compliance framework](/glossary/compliance-framework/) assessment consuming EU regulatory data |
| [Prismatic DD](/apps/prismatic-dd/) | Due diligence workflows incorporating EU sanctions screening results |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Sanctions screening | 500ms-3s | Fuzzy matching across consolidated list |
| ECB rate retrieval | < 200ms | Cached with 1-hour TTL |
| TED procurement search | 1-5s | Depends on query complexity |
| ECHA substance lookup | 500ms-2s | API-based retrieval |
| Update check (per source) | < 1s | HTTP HEAD/conditional GET |
| Entity normalization | < 50ms | Pure function transformation |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :osint_eu, :sanctions_screened]`, `[:prismatic, :osint_eu, :source_updated]`, `[:prismatic, :osint_eu, :rate_fetched]`.

## Related Resources

- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Core OSINT infrastructure shared across all source adapters
- [Business Financial Intelligence Specialist](/agents/business-financial-intelligence-specialist/) -- Coordinates EU financial intelligence analysis
- [Competitor Researcher](/agents/competitor-researcher/) -- Leverages EU procurement data for competitive intelligence
- [Cross Pollination Specialist](/agents/cross-pollination-specialist/) -- Cross-domain intelligence synthesis from EU sources
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source EU evidence fusion for entity assessment
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Epistemic confidence scoring for sanctions screening results
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- EU source availability and data freshness monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)