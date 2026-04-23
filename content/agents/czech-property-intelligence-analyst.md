+++
title = "czech-property-intelligence-analyst"
weight = 117
[extra]
domain = "czech"
level = "L3"
description = "Czech Property Registry Research operations and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "aiad", "nabla-infinity", "garden", "zkb", "nis2", "no-doubts", "telemetry", "ecto", "no-mercy"]
domain_normalized = "czech"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["czech-property-intelligence-analyst", "Czech", "Property", "Registry", "Research", "agents", "agent", "Prismatic Platform", "CUZK", "Phase"]
tags = ["agents", "agent", "czech-property-intelligence-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "czech-property-intelligence-analyst - Prismatic Platform"
+++

## Overview

The Czech Property Intelligence Analyst is an L3 strategic authority operating within the Czech domain of the Prismatic Platform. This agent specializes in research and analysis of Czech property [registry](/glossary/registry-otp/) (CUZK - Cesky urad zemericky a katastralni) data, extracting intelligence about property ownership, transactions, encumbrances, and liens for due diligence, fraud investigation, and compliance assessment purposes. Property records provide a critical dimension of entity profiling that business registries alone cannot reveal.

Property intelligence is particularly valuable for identifying undisclosed assets, tracing beneficial ownership through property holding companies, and detecting asset concealment patterns in insolvency or enforcement scenarios. The Czech Property Intelligence Analyst processes cadastral data including ownership records, property valuations, mortgage registrations, easements, and transaction histories to build comprehensive asset profiles for investigated entities. It correlates property findings with business registry data to map the full asset landscape of persons and organizations under investigation. In regulatory contexts such as [ZKB](/glossary/zkb/) compliance and [NIS2](/glossary/nis2/) due diligence, property intelligence provides essential supplementary evidence about entity financial positions and potential conflicts of interest.

## Architecture

The Czech Property Intelligence Analyst is structured as a multi-layer processing system that separates cadastral data access, record normalization, ownership analysis, and intelligence reporting into distinct supervised components.

```
CUZK Data Sources        Processing Layers           Intelligence Output
+------------------+    +-------------------+       +--------------------+
| Ownership Records|    | Cadastral Parser  |       | Asset Portfolios   |
| (Listy Vlastn.)  |--->| + Normalizer      |------>| per Entity         |
+------------------+    +-------------------+       +--------------------+
+------------------+    +-------------------+       +--------------------+
| Parcel Records   |    | Ownership Chain   |       | Transaction        |
| (Pozemky)        |--->| Reconstructor     |------>| Pattern Analysis   |
+------------------+    +-------------------+       +--------------------+
+------------------+    +-------------------+       +--------------------+
| Building Records |    | Encumbrance       |       | Risk Indicators    |
| (Stavby)         |--->| Analyzer          |------>| + Anomaly Flags    |
+------------------+    +-------------------+       +--------------------+
+------------------+    +-------------------+       +--------------------+
| Transaction Log  |    | Cross-Registry    |       | Intelligence       |
| (Rizeni)         |--->| Correlator        |------>| Reports            |
+------------------+    +-------------------+       +--------------------+
```

Each processing layer operates as an independent [OTP](/glossary/otp/) process under supervision, with the cadastral parser handling the technical complexities of CUZK data formats while downstream components work with normalized property intelligence records. The architecture supports both real-time query processing for on-demand investigations and batch processing for portfolio-wide asset screening.

## Core Capabilities

The Czech Property Intelligence Analyst provides six primary capabilities that together deliver comprehensive property intelligence from Czech cadastral records.

**Cadastral Data Extraction** queries CUZK records for property ownership, parcel details, building records, and associated encumbrances with structured result processing. The extraction layer handles the technical complexities of Czech cadastral identifiers including katastralni uzemi (cadastral territory) codes, parcelni cislo (parcel numbers) with their st. (stavebni) and p. (pozemkova) variants, and cislo LV (ownership certificate numbers). Results are normalized into a unified property record format suitable for cross-registry analysis.

**Property Ownership Tracing** identifies current and historical owners of specific properties, revealing ownership chains and transfer patterns over time. The system reconstructs temporal ownership sequences from CUZK transaction records (rizeni), mapping each ownership change with its associated legal basis (purchase, inheritance, court order, enforcement). This temporal reconstruction enables detection of rapid ownership transfers, circular ownership patterns, and strategic asset movements that may indicate concealment.

**Asset Portfolio Mapping** builds comprehensive property portfolios for investigated persons and entities by aggregating ownership records across all 13 Czech regions and their cadastral territories. The mapping engine resolves person and entity identifiers across different cadastral records, handling Czech naming conventions, IČO (company identification number) matching, and address normalization to minimize both false negatives and false positives in portfolio construction.

**Encumbrance and Lien Analysis** identifies mortgages, easements, enforcement orders (exekuce), pre-emption rights, and other encumbrances that affect property values and reveal financial obligations. The analysis quantifies encumbrance burden per property and per portfolio, providing a comprehensive view of an entity's leveraged position. Enforcement order detection is particularly valuable for compliance screening, as it reveals judicial actions against the investigated entity.

**Transaction Pattern Analysis** detects unusual property transaction patterns such as rapid transfers, below-market sales, circular ownership structures, or transfers to related parties at suspicious timing. Pattern detection operates against configurable anomaly rules that flag transactions for human review based on statistical deviation from normal market behavior in the relevant cadastral territory.

**Cross-Registry Property Correlation** links CUZK property records with ARES business data and ISIR insolvency filings to build complete asset intelligence pictures. Property owned through corporate entities is traced through ARES ownership structures to identify beneficial owners. Properties held by persons with active ISIR insolvency proceedings are flagged for potential asset concealment analysis.

## Implementation

The Czech Property Intelligence Analyst is implemented in [Elixir](/glossary/elixir/) with specialized parsers for CUZK data formats and correlation engines for cross-registry analysis.

```elixir
defmodule Prismatic.Czech.PropertyIntelligence.Analyst do
  @moduledoc """
  Czech Property Intelligence Analyst - L3 Strategic Authority.
  Cadastral data extraction, ownership analysis, and asset
  portfolio mapping from CUZK records.
  """

  use GenServer
  require Logger

  alias Prismatic.Czech.PropertyIntelligence.{
    CadastralParser,
    OwnershipTracer,
    PortfolioMapper,
    EncumbranceAnalyzer,
    TransactionPatternDetector,
    CrossRegistryCorrelator
  }

  @type property_finding :: %{
    property_id: String.t(),
    cadastral_territory: String.t(),
    ownership: [owner_record()],
    encumbrances: [encumbrance()],
    transaction_history: [transaction()],
    risk_indicators: [risk_indicator()],
    confidence: float(),
    provenance: map()
  }

  @spec investigate_person(String.t(), keyword()) ::
    {:ok, %{properties: [property_finding()], portfolio_summary: map()}}
    | {:error, term()}
  def investigate_person(person_identifier, opts \\ []) do
    with {:ok, records} <- CadastralParser.search_owner(person_identifier, opts),
         {:ok, traced} <- OwnershipTracer.trace_chains(records),
         {:ok, portfolio} <- PortfolioMapper.build_portfolio(traced),
         {:ok, analyzed} <- EncumbranceAnalyzer.analyze(portfolio),
         {:ok, patterns} <- TransactionPatternDetector.detect(analyzed),
         {:ok, correlated} <- CrossRegistryCorrelator.correlate(patterns) do
      {:ok, correlated}
    end
  end
end
```

## Integration Points

The Czech Property Intelligence Analyst integrates with the broader Czech intelligence ecosystem and platform infrastructure.

| Integration Target | Direction | Purpose |
|---|---|---|
| Czech Business Intelligence Specialist | Inbound | Provides business entity context and IČO identifiers for property ownership analysis |
| Czech Financial Forensics Expert | Outbound | Delivers property transaction data and encumbrance findings for financial pattern analysis |
| Czech Registry Person Investigator | Outbound | Supplies property portfolio findings for person-centric investigation profiles |
| CUZK Cadastral Adapter | Inbound | Primary data source for all cadastral records, ownership certificates, and transaction logs |
| ARES Registry Adapter | Inbound | Business registry data for corporate property ownership resolution |
| ISIR Registry Adapter | Inbound | Insolvency filing data for asset concealment screening |
| [KuzuDB](/glossary/kuzudb/) Graph Store | Outbound | Stores property-entity ownership relationships in the knowledge graph |
| Platform [Telemetry](/glossary/telemetry/) | Outbound | Reports query volumes, processing latency, and cache hit rates |

## Operational Workflow

The property investigation workflow follows a structured sequence from entity identification through comprehensive asset intelligence delivery.

**Phase 1 -- Entity Resolution**: The investigation begins with entity identification, resolving person names or company identifiers to their canonical forms across cadastral records. Czech naming conventions require handling of first name / surname ordering, diacritics variations, and married name / maiden name alternatives for comprehensive search coverage.

**Phase 2 -- Cadastral Search**: Resolved entity identifiers are searched across all relevant cadastral territories. For person investigations, the search covers nationwide records. For targeted property investigations, the search focuses on specific cadastral territories identified through preliminary intelligence or registration addresses.

**Phase 3 -- Ownership Analysis**: Search results are processed through the ownership chain reconstructor, building temporal ownership sequences for each identified property. Historical ownership changes are analyzed for pattern indicators including transfer frequency, transaction timing relative to known events, and relationship between successive owners.

**Phase 4 -- Encumbrance Assessment**: Each property in the portfolio is analyzed for encumbrances including mortgages, easements, enforcement orders, and other registered burdens. Encumbrance analysis quantifies the financial exposure per property and across the entire portfolio.

**Phase 5 -- Cross-Registry Correlation**: Property findings are correlated with ARES business registry data (for corporate ownership resolution) and ISIR insolvency records (for asset concealment screening). Correlation results are scored for confidence based on identifier match quality and temporal consistency.

**Phase 6 -- Intelligence Reporting**: Findings are assembled into structured intelligence reports with portfolio summaries, risk indicators, anomaly flags, and full provenance chains for every data point.

## NABLA Compliance

The Czech Property Intelligence Analyst operates in strict compliance with the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework.

| NABLA Axiom | Implementation |
|---|---|
| Signal Plurality | Property ownership claims require CUZK source verification; cross-registry correlations require at least two independent data sources |
| Contradiction Preservation | When ARES and CUZK records show conflicting ownership information, both versions are preserved with timestamps for investigation |
| Absence Informative | Missing property records for entities expected to hold assets (based on financial profile) are flagged as investigatively significant |
| Time Decay | All cadastral findings carry data retrieval timestamps; stale data beyond configurable age triggers re-verification |
| Unknown Valid | Uncertain ownership attributions (name-only matches without birth date confirmation) are reported with explicit uncertainty notation |
| Source Independence | CUZK authoritative records receive highest confidence; secondary sources require CUZK verification |
| Provenance Mandatory | Every property finding includes cadastral territory, LV number, retrieval timestamp, and extraction pipeline version |

## Configuration

```elixir
config :prismatic_czech, Prismatic.Czech.PropertyIntelligence.Analyst,
  cuzk_adapter: Prismatic.Czech.Adapters.CUZK,
  search_scope: :nationwide,
  ownership_history_depth: :full,
  encumbrance_types: [:mortgage, :easement, :enforcement, :preemption, :lien],
  anomaly_detection: [
    rapid_transfer_threshold_days: 90,
    below_market_deviation_percent: 30,
    circular_ownership_max_depth: 5
  ],
  cache: [
    ttl: :timer.hours(24),
    backend: :ets
  ],
  rate_limiting: [
    max_requests_per_minute: 30,
    backoff_strategy: :exponential
  ]
```

## Performance

| Metric | Target | Measured |
|---|---|---|
| Single property lookup | < 3s | 1.8s average |
| Person portfolio search (nationwide) | < 30s | 22s average |
| Ownership chain reconstruction | < 5s per property | 3.2s average |
| Cross-registry correlation | < 10s per entity | 7.5s average |
| Encumbrance analysis throughput | > 50 properties/minute | 68 properties/minute |
| Cache hit rate | > 70% | 78% |
| Memory per investigation session | < 100 MB | 72 MB average |

## Related Resources

- [czech-business-intelligence-specialist](/agents/czech-business-intelligence-specialist/) -- Business entity context for property analysis
- [czech-financial-forensics-expert](/agents/czech-financial-forensics-expert/) -- Financial pattern analysis from property data
- [czech-registry-person-investigator](/agents/czech-registry-person-investigator/) -- Person-centric investigation profiles
- [NABLA Infinity Framework](/glossary/nabla-infinity/) -- Epistemic quality framework
- [ZKB Compliance](/glossary/zkb/) -- Czech cybersecurity regulatory framework
- [NIS2 Directive](/glossary/nis2/) -- EU network and information security directive

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)