+++
title = "Prismatic Czech Courts"
weight = 38
[extra]
category = "OSINT"
files = 10
description = "Czech court decision and insolvency register data extraction"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 988
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Czech", "Courts", "apps", "OSINT", "Prismatic Platform", "ISIR", "PrismaticCzechCourts"]
tags = ["apps", "osint", "prismatic-czech-courts", "prismatic"]
quality_score = 77
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Czech Courts - Prismatic Platform"
+++

## Overview

Prismatic Czech Courts is an [OSINT](@/glossary/osint.md) component of the Prismatic Platform's [umbrella](@/glossary/umbrella-application.md) architecture. It extracts and structures data from Czech judicial sources including court decisions, insolvency proceedings, and enforcement records for intelligence analysis and compliance screening. The application connects to public judicial data sources through configurable provider adapters with [rate limiting](@/glossary/rate-limiting.md), caching, and error recovery built in.

Czech courts publish a substantial volume of structured and semi-structured data through public portals. This application transforms that raw judicial data into normalized, searchable intelligence that feeds into the platform's broader [intelligence synthesis](@/capabilities/intelligence-synthesis.md) pipeline. Every extracted record carries full [provenance](@/glossary/provenance-mandatory.md) metadata, enabling traceability from any intelligence product back to its original judicial source.

The module implements NLP extraction for unstructured court documents, identifying parties, dates, amounts, legal references, and outcome classifications with high accuracy. An [entity resolution](@/glossary/entity-resolution.md) engine links court party references to canonical entity records across all Czech legal sources. The ISIR (Insolvency Register) monitoring subsystem provides continuous monitoring with configurable alert policies for new filings, status changes, creditor deadlines, and cross-entity proceedings detection.

## Architecture

```
Source Portal --> HTTP Client --> HTML Parser --> Entity Extractor --> Normalizer --> Storage
      |               |              |                |                  |            |
   Public URL     Rate-limited    Floki/HTML5     Regex + NLP       Schema       Ecto +
   + Params       + Cached        Parsing         Extraction        Mapping       ETS
```

The ISIR monitoring architecture uses a polling worker with change detection:

```
ISIR API --> Polling Worker --> Change Detector --> Alert Engine --> Notification
    |             |                  |                  |               |
 REST API    Configurable        Diff against        Policy-based   PubSub +
 + RSS       interval (5min)    last known state    evaluation      webhook
```

Each source has a dedicated adapter implementing the OSINT provider [protocol](@/glossary/protocol.md), ensuring consistent behavior across all judicial data sources. The [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md) manages court crawlers, ISIR monitors, and entity linkers as independent supervised processes.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticCzechCourts` | Public facade: `extract_decision/1`, `resolve_party/1`, `monitor_isir/1` |
| `PrismaticCzechCourts.Application` | OTP application entry point |
| `PrismaticCzechCourts.NlpExtractor` | Named entity recognition and legal reference parsing |
| `PrismaticCzechCourts.EntityLinker` | Cross-registry entity resolution for court parties |
| `PrismaticCzechCourts.IsirMonitor` | Continuous insolvency register polling and change detection |
| `PrismaticCzechCourts.AlertEngine` | Policy-based alert generation from monitored events |

## Data Sources

| Data Source | URL | Data Type | Update Frequency |
|-------------|-----|-----------|-----------------|
| Justice.cz | justice.cz | Commercial register filings | Daily |
| ISIR | isir.justice.cz | Insolvency proceedings | Real-time |
| InfoSoud | infosoud.justice.cz | Court hearings and decisions | Daily |
| InfoJednani | infojednani.justice.cz | Court session schedules | Daily |
| eJustice | ejustice.cz | Electronic court submissions | Per submission |

Each data source presents unique parsing challenges. Justice.cz serves semi-structured HTML with inconsistent formatting across court districts. ISIR provides a REST API with XML responses that follow a well-defined schema. InfoSoud combines tabular HTML with embedded PDF documents that require OCR extraction for older decisions. The adapter layer abstracts these differences, presenting a uniform data model to downstream consumers.

## NLP Extraction Pipeline

The NLP extraction pipeline processes unstructured Czech legal text into structured intelligence records. Given the specialized vocabulary and citation patterns of Czech legal documents, the pipeline uses domain-specific models trained on annotated court decision corpora rather than general-purpose NLP tools.

| NLP Task | Technique | Accuracy |
|----------|-----------|----------|
| Party Identification | Named entity recognition with Czech morphology | > 95% |
| Date Extraction | Temporal expression parsing (Czech date formats) | > 98% |
| Amount Extraction | Currency pattern matching (CZK, EUR, USD) | > 97% |
| Legal Reference | Czech citation parsing (Sb., Coll., EU directives) | > 92% |
| Outcome Classification | Text classification (granted, dismissed, settled) | > 90% |

```elixir
# NLP extraction from court decision text
defmodule PrismaticCzechCourts.NlpExtractor do
  @spec extract(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def extract(court_text, opts \\ []) do
    with {:ok, parties} <- extract_parties(court_text),
         {:ok, dates} <- extract_dates(court_text),
         {:ok, amounts} <- extract_amounts(court_text),
         {:ok, references} <- extract_legal_references(court_text),
         {:ok, outcome} <- classify_outcome(court_text) do
      {:ok, %{
        parties: parties,
        dates: dates,
        amounts: amounts,
        legal_references: references,
        outcome: outcome,
        confidence: compute_aggregate_confidence(parties, dates, amounts)
      }}
    end
  end
end
```

## ISIR Monitoring System

The Insolvency Register monitoring system is one of the most operationally critical components of Czech Courts. Insolvency proceedings in the Czech Republic follow strict deadlines -- creditors must file claims within specified periods, and missing these deadlines results in permanent loss of claim rights. The monitoring system tracks these deadlines and generates proactive alerts.

The system maintains a watchlist of monitored entities (identified by ICO or name) and polls ISIR at configurable intervals. When a new insolvency proceeding is filed against a monitored entity, or when an existing proceeding transitions to a new stage, the alert engine evaluates configured policies and generates notifications through [PubSub](@/glossary/pubsub.md) and webhook channels.

```elixir
# ISIR monitoring configuration
{:ok, monitor} = PrismaticCzechCourts.monitor_isir(
  ico: "12345678",
  alerts: [:new_filing, :status_change, :creditor_deadline, :asset_sale],
  notification_channels: [:pubsub, :webhook],
  polling_interval: :timer.minutes(5)
)
```

## Configuration

```elixir
config :prismatic_czech_courts,
  sources: [:justice_cz, :isir, :infosoud, :infojednani, :ejustice],
  isir_polling_interval: :timer.minutes(5),
  rate_limit_per_source: {1, :second},
  entity_resolution_enabled: true,
  nlp_extraction_enabled: true,
  watchlist_matching: true,
  max_concurrent_extractions: 10,
  ocr_enabled: true
```

## API Reference

```elixir
# Extract court decision with full provenance
{:ok, decision} = PrismaticCzechCourts.extract_decision(%{
  court: "Mestsky soud v Praze",
  case_number: "25 Cm 42/2024",
  include_parties: true,
  include_related: true
})

# Resolve court party to canonical entity
{:ok, entity} = PrismaticCzechCourts.resolve_party(%{
  name: "FIRMA, s.r.o.",
  ico: "12345678",
  role: :defendant
})
# => %{canonical_id: "CZ-ICO-12345678", confidence: 0.98}

# Set up ISIR monitoring for entity
{:ok, monitor} = PrismaticCzechCourts.monitor_isir(ico: "12345678",
  alerts: [:new_filing, :status_change, :creditor_deadline])

# Search court decisions by entity
{:ok, decisions} = PrismaticCzechCourts.search_decisions(
  party_ico: "12345678",
  from: ~D[2024-01-01],
  courts: [:mestsky_soud_praha, :krajsky_soud_brno]
)
```

## Entity Resolution Across Court Sources

The entity linker resolves court party references to canonical entity records using a multi-strategy approach. Czech court documents reference entities through varying name formats, ICO numbers, and sometimes only partial identifying information. The linker applies progressively relaxed matching strategies until a resolution is achieved or the entity is flagged as unresolvable:

```elixir
defmodule PrismaticCzechCourts.EntityLinker do
  @spec resolve(map()) :: {:ok, CanonicalEntity.t()} | {:error, :unresolvable}
  def resolve(%{ico: ico} = party) when is_binary(ico) do
    case lookup_by_ico(ico) do
      {:ok, entity} -> {:ok, entity}
      {:error, _} -> resolve_by_name(party)
    end
  end

  def resolve(party), do: resolve_by_name(party)

  defp resolve_by_name(%{name: name}) do
    candidates = fuzzy_search(name, threshold: 0.85)
    case candidates do
      [single] -> {:ok, single}
      multiple when length(multiple) > 1 -> {:ok, best_match(multiple, name)}
      [] -> {:error, :unresolvable}
    end
  end
end
```

## Testing

Source adapter tests use HTML fixtures captured from actual Czech court portals. NLP extraction tests verify party identification, date extraction, and amount parsing against annotated court document samples. Entity resolution tests verify cross-registry linking using known entity relationships.

Integration tests exercise the full pipeline from source portal through extraction, NLP processing, entity resolution, and storage. ISIR monitoring tests verify change detection and alert generation using simulated insolvency proceeding state transitions. Property-based tests generate synthetic court documents to verify extraction robustness across formatting variations.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | Core OSINT framework protocols and provider abstractions |
| [Prismatic OSINT Czech Legal](@/apps/prismatic-osint-czech-legal.md) | Czech legal registry integration for cross-source correlation |
| [Prismatic Storage Core](@/apps/prismatic-storage-core.md) | Persistent storage for court records and monitoring state |
| [Prismatic Nabla](@/apps/prismatic-nabla.md) | [Confidence scoring](@/glossary/confidence-scoring.md) for entity resolution and risk assessment |
| [Prismatic](@/apps/prismatic.md) | Investigation workflow integration for legal intelligence |
| [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) | Cross-referencing court data with business registry records |

## NABLA Compliance

| NABLA Axiom | Czech Courts Enforcement | Implementation |
|-------------|------------------------|----------------|
| Provenance Mandatory | Every extracted record carries source URL, timestamp, and hash | Full judicial source provenance on all intelligence products |
| Signal Plurality | Cross-source correlation across multiple court portals | ISIR, InfoSoud, Justice.cz provide independent signals |
| Time Decay | Insolvency stage tracking with temporal metadata | Proceeding status timestamps enable temporal analysis |
| Contradiction Preservation | Conflicting court data across sources preserved | Cross-registry discrepancies flagged for review |
| Unknown Valid | Low-confidence entity resolutions explicitly marked | Confidence scores on all entity resolution results |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Decision extraction | 1-5s | Depends on source portal response |
| Entity resolution | < 100ms | Against cached canonical records |
| ISIR change detection | < 500ms | Diff against stored state |
| NLP extraction | 200ms-2s | Depends on document length |
| Watchlist evaluation | < 50ms | ETS-backed watchlist lookup |
| Full court search | 2-10s | Depends on query scope and portal response |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :czech_courts, :extraction]`, `[:prismatic, :czech_courts, :isir_alert]`, `[:prismatic, :czech_courts, :entity_resolved]`.

## Related Resources

- [Prismatic OSINT Czech Legal](@/apps/prismatic-osint-czech-legal.md) -- Czech legal registry adapters
- [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) -- Automated Czech registry crawling
- [Prismatic DD](@/apps/prismatic-dd.md) -- Due diligence workflows
- [Competitor Researcher](@/agents/competitor-researcher.md) -- Court intelligence for competitive due diligence
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Insolvency register monitoring alerts
- [Evidence Enforcement Agent](@/agents/evidence-enforcement-agent.md) -- Judicial provenance metadata enforcement
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-source legal intelligence fusion
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Continuous insolvency register monitoring
- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Provenance mandatory enforcement on court records

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)