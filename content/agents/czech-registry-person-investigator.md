+++
title = "czech-registry-person-investigator"
weight = 118
[extra]
domain = "czech-republic-legal-intelligence"
level = "L3"
description = "ARCHER SUPREME specialist for comprehensive Czech Registry person investigations and due diligence reporting"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "aiad", "nabla-infinity", "garden", "zkb", "nis2", "no-doubts", "telemetry", "ecto", "no-mercy"]
domain_normalized = "czech"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["czech-registry-person-investigator", "ARCHER", "SUPREME", "Czech", "Registry", "agents", "agent", "Prismatic Platform", "Inbound", "ARES"]
tags = ["agents", "agent", "czech-registry-person-investigator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "czech-registry-person-investigator - Prismatic Platform"
+++

## Overview

The Czech [Registry](/glossary/registry-otp/) Person Investigator is an L3 strategic authority operating within the Czech Republic Legal Intelligence domain of the Prismatic Platform. This agent conducts comprehensive person-centric investigations across Czech public registries, combining data from business registries, insolvency records, property records, and court filings to build complete profiles of natural persons for due diligence, compliance screening, and intelligence operations. Operating with [ARCHER SUPREME](/glossary/archer-supreme/) authority, it delivers investigation-grade reports that meet regulatory standards for CER and AML compliance.

Person investigations in the Czech context require navigating multiple interconnected registries with different data formats, access methods, and update frequencies. The Czech Registry Person Investigator automates this complex cross-registry correlation, searching for a person's name across ARES (business roles and ownership), Justice.cz (court proceedings), ISIR (insolvency filings), CUZK (property ownership), and additional specialized registries. It handles Czech naming conventions, diacritics, and common name variants to minimize false negatives while managing false positives through multi-source validation. The comprehensive nature of this cross-registry approach distinguishes it from single-registry lookup tools, providing an integrated intelligence picture that reveals connections invisible in any individual data source.

## Architecture

The Czech Registry Person Investigator employs a fan-out / fan-in architecture where a central investigation coordinator dispatches parallel queries to multiple registry adapters, then consolidates and correlates the results into a unified person profile.

```
                     +------------------------+
                     | Investigation          |
                     | Coordinator            |
                     +------------------------+
                        |    |    |    |    |
            +-----------+    |    |    |    +----------+
            |                |    |    |               |
      +----------+   +----------+  +----------+  +----------+
      | ARES     |   | Justice  |  | ISIR     |  | CUZK     |
      | Adapter  |   | Adapter  |  | Adapter  |  | Adapter  |
      +----------+   +----------+  +----------+  +----------+
            |                |    |    |               |
            +-----------+    |    |    +----------+    |
                        |    |    |    |          |    |
                     +------------------------+   |    |
                     | Entity Resolution      |   |    |
                     | + Deduplication         |---+----+
                     +------------------------+
                              |
                     +------------------------+
                     | Profile Assembly        |
                     | + Risk Assessment       |
                     +------------------------+
                              |
                     +------------------------+
                     | Report Generator        |
                     +------------------------+
```

The fan-out pattern enables parallel registry queries that reduce total investigation time from the sequential sum of individual registry lookups to the duration of the slowest single registry plus correlation overhead. Each adapter operates as an independent [OTP](/glossary/otp/) process with its own [circuit breaker](/glossary/circuit-breaker/) to prevent a single unresponsive registry from blocking the entire investigation.

## Core Capabilities

The Czech Registry Person Investigator provides six primary capabilities that together deliver comprehensive person intelligence from Czech public registries.

**Multi-Registry Person Search** simultaneously queries ARES, Justice.cz, ISIR, CUZK, and trade registries to build comprehensive person profiles with cross-referenced findings. The search engine generates multiple query variants per person to handle Czech naming patterns, submits them in parallel to all configured registries, and collects results for entity resolution processing. Search coverage is configurable to include or exclude specific registries based on investigation scope requirements.

**Czech Naming Convention Handling** processes diacritics, common name variants, maiden names, and historical name changes to maximize search recall across registries. The naming engine maintains a database of common Czech name equivalences (e.g., Josef/Pepa, Katerina/Katka) and applies morphological rules for Czech declension patterns that cause names to appear in different grammatical forms. Maiden name handling is critical for female subject investigations where marriage may cause registry entries under different surnames.

**Ownership Chain Reconstruction** traces person-to-company-to-subsidiary relationships through registry data to reveal beneficial ownership structures and hidden connections. Starting from direct statutory roles identified in ARES, the system follows corporate ownership chains through parent-subsidiary relationships, identifying both direct and indirect control positions. Circular ownership structures and shell company patterns are flagged for investigator review.

**Insolvency and Litigation Screening** identifies active insolvency proceedings, court cases, and enforcement actions associated with the investigated person. ISIR screening covers personal bankruptcy, debt relief applications, and corporate insolvency where the person serves as a statutory body. Justice.cz screening identifies civil and criminal proceedings. The screening results include case status, key dates, and outcome information where available.

**Due Diligence Report Generation** produces structured, evidence-grade investigation reports with sourced findings, confidence scores, and risk assessments suitable for regulatory compliance. Reports follow configurable templates that meet CER (Czech enhanced due diligence) and AML (anti-money laundering) standards. Each finding in the report carries provenance information linking it to the specific registry source, query parameters, and retrieval timestamp.

**Historical Timeline Construction** builds chronological profiles showing the person's registry footprint over time, including role changes, company formations, property transactions, and legal proceedings. The timeline reveals patterns of behavior that point-in-time snapshots cannot capture: serial company formations followed by insolvencies, asset transfers preceding enforcement actions, or progressive consolidation of business interests.

## Implementation

The implementation uses Elixir's concurrent processing capabilities to parallelize registry queries while maintaining strict result correlation discipline.

```elixir
defmodule Prismatic.Czech.PersonInvestigator do
  @moduledoc """
  Czech Registry Person Investigator - L3 Strategic Authority.
  Comprehensive person-centric investigations across Czech
  public registries with ARCHER SUPREME authority.
  """

  use GenServer
  require Logger

  alias Prismatic.Czech.PersonInvestigator.{
    QueryDispatcher,
    EntityResolver,
    OwnershipChainBuilder,
    RiskAssessor,
    ReportGenerator
  }

  @type investigation_result :: %{
    subject: person_profile(),
    registries_searched: [atom()],
    findings: %{
      business_roles: [business_role()],
      property_holdings: [property_record()],
      insolvency_records: [insolvency_record()],
      court_proceedings: [court_record()],
      ownership_chains: [ownership_chain()]
    },
    risk_assessment: risk_assessment(),
    timeline: [timeline_event()],
    confidence: float(),
    report_metadata: map()
  }

  @spec investigate(String.t(), String.t(), keyword()) ::
    {:ok, investigation_result()} | {:error, term()}
  def investigate(first_name, last_name, opts \\ []) do
    registries = Keyword.get(opts, :registries, [:ares, :justice, :isir, :cuzk])

    with {:ok, queries} <- QueryDispatcher.build_queries(first_name, last_name, opts),
         {:ok, raw_results} <- QueryDispatcher.execute_parallel(queries, registries),
         {:ok, resolved} <- EntityResolver.resolve(raw_results),
         {:ok, chains} <- OwnershipChainBuilder.build(resolved),
         {:ok, assessed} <- RiskAssessor.assess(chains),
         {:ok, report} <- ReportGenerator.generate(assessed, opts) do
      {:ok, report}
    end
  end
end
```

## Integration Points

| Integration Target | Direction | Purpose |
|---|---|---|
| Czech Business Intelligence Specialist | Inbound | Provides business registry context and entity metadata for person-to-company mapping |
| Czech Property Intelligence Analyst | Inbound | Supplies property registry data including ownership certificates and encumbrances |
| Czech Legal Extraction Specialist | Inbound | Handles legal document extraction and analysis for court proceeding findings |
| Czech Financial Forensics Expert | Outbound | Receives investigation findings for financial pattern analysis |
| ARES Registry Adapter | Inbound | Business roles, company ownership, trade license data |
| Justice.cz Adapter | Inbound | Court proceedings, judicial decisions, legal entity records |
| ISIR Adapter | Inbound | Insolvency filings, debt relief proceedings, creditor claims |
| CUZK Cadastral Adapter | Inbound | Property ownership, transaction history, encumbrances |
| Report Generation Pipeline | Outbound | Structured investigation report assembly and delivery |

## Operational Workflow

**Phase 1 -- Subject Identification**: The investigator receives a person identification request with available identifiers (name, date of birth, address, company associations). Name variants are generated including diacritics permutations, maiden name possibilities, and common abbreviations.

**Phase 2 -- Parallel Registry Query**: Generated query variants are dispatched simultaneously to all configured registry adapters. Each adapter manages its own connection pool, rate limiting, and error handling. Results stream back to the coordinator as they become available.

**Phase 3 -- Entity Resolution**: Raw registry results from different sources are processed through the entity resolution engine. Records referring to the same natural person are merged based on matching criteria (name + date of birth, name + address, name + company role). Ambiguous matches are flagged for confidence scoring rather than automatic resolution.

**Phase 4 -- Chain Reconstruction**: Resolved person records are processed through the ownership chain builder, tracing corporate relationships from direct statutory roles through parent-subsidiary hierarchies. Property ownership through corporate entities is linked back to the investigated person through ARES ownership data.

**Phase 5 -- Risk Assessment**: Consolidated findings are evaluated against configurable risk criteria including insolvency history, enforcement actions, related-party transactions, and jurisdictional exposure. Risk scores are computed per finding category and aggregated into an overall risk profile.

**Phase 6 -- Report Assembly**: All findings, risk assessments, and timeline events are assembled into the final investigation report. The report includes an executive summary, detailed findings by registry, ownership structure diagrams, timeline visualization data, and full provenance for every data point.

## NABLA Compliance

| NABLA Axiom | Implementation |
|---|---|
| Signal Plurality | Person identification across registries requires multi-source confirmation; single-registry findings carry reduced confidence |
| Contradiction Preservation | Conflicting information across registries (e.g., different addresses in ARES vs. CUZK) is preserved and flagged |
| Absence Informative | Missing records in expected registries are noted (e.g., no ARES entries for a person known to hold business roles) |
| Time Decay | All findings carry retrieval timestamps; investigation validity periods are configurable per compliance requirement |
| Unknown Valid | Ambiguous entity resolution results are reported with explicit uncertainty rather than forced matching |
| Source Independence | Each registry is treated as an independent source; cross-registry confirmation increases confidence scores |
| Provenance Mandatory | Every finding traces to specific registry, query parameters, retrieval timestamp, and extraction version |

## Configuration

```elixir
config :prismatic_czech, Prismatic.Czech.PersonInvestigator,
  registries: [:ares, :justice, :isir, :cuzk, :trade_license],
  query_generation: [
    diacritics_variants: true,
    maiden_name_search: true,
    nickname_expansion: true,
    max_variants_per_name: 8
  ],
  entity_resolution: [
    min_confidence_threshold: 0.70,
    auto_merge_threshold: 0.95,
    manual_review_range: {0.70, 0.95}
  ],
  ownership_chains: [
    max_depth: 10,
    circular_detection: true,
    include_historical: true
  ],
  report: [
    format: :structured_json,
    include_timeline: true,
    include_provenance: true,
    compliance_standard: :cer_aml
  ]
```

## Performance

| Metric | Target | Measured |
|---|---|---|
| Full person investigation | < 60s | 42s average |
| Parallel registry query phase | < 20s | 14s average |
| Entity resolution | < 10s | 6.8s average |
| Ownership chain depth 5 | < 15s | 11s average |
| Report generation | < 5s | 3.2s average |
| Concurrent investigations | > 10 parallel | 15 supported |
| Registry adapter availability | > 99% | 99.4% |

## Related Resources

- [czech-business-intelligence-specialist](/agents/czech-business-intelligence-specialist/) -- Business registry context
- [czech-property-intelligence-analyst](/agents/czech-property-intelligence-analyst/) -- Property registry data
- [czech-legal-extraction-specialist](/agents/czech-legal-extraction-specialist/) -- Legal document extraction
- [ARCHER SUPREME](/glossary/archer-supreme/) -- Supreme authority framework
- [NABLA Infinity Framework](/glossary/nabla-infinity/) -- Epistemic quality framework
- [ZKB Compliance](/glossary/zkb/) -- Czech cybersecurity regulatory framework

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)