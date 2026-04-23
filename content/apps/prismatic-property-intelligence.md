+++
title = "Prismatic Property Intelligence"
weight = 55
[extra]
icon = "home-modern"
color = "teal"
description = "Real estate intelligence from Czech land registry and property databases"
category = "Intelligence"
files = "130"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1082
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Property", "Intelligence", "Real", "Czech", "apps", "Prismatic Platform", "PrismaticPropertyIntelligence", "Corporate", "CUZK"]
tags = ["apps", "intelligence", "prismatic-property-intelligence", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Property Intelligence - Prismatic Platform"
+++

## Overview

Prismatic Property Intelligence provides real estate analysis capabilities focused on the Czech market. It integrates with CUZK (Czech Office for Surveying, Mapping and Cadastre) land registry data, property databases, and market sources to enable property-based investigations, asset mapping, and real estate due diligence. In the context of [OSINT](/glossary/osint/) investigations, property records are among the most reliable public data sources because real estate transactions require legal registration that cannot be easily obscured. The Czech land registry (Katastr nemovitosti) provides a uniquely complete public dataset that Property Intelligence transforms into actionable intelligence through systematic extraction, correlation, and analysis.

The module reconstructs ownership chains by traversing historical land registry entries, identifying when properties changed hands, through which legal entities, and at what declared valuations. This is particularly valuable for corporate due diligence where shell company structures may be used to obscure beneficial ownership of valuable real estate assets. By correlating property ownership data with corporate registry information from [Prismatic Czech Registry](/apps/prismatic-czech-autocrawler/), the module can reveal connections between seemingly unrelated entities -- a capability central to the platform's [entity resolution](/glossary/entity-resolution/) pipeline. The [NABLA](/glossary/nabla-infinity/) framework's [signal plurality](/glossary/signal-plurality/) axiom is enforced throughout: property ownership claims require corroboration from multiple registry sources before being established as facts.

Property Intelligence also monitors the real estate market for anomalies -- properties sold significantly below market value, rapid ownership transfers suggesting money laundering patterns, or concentrated property acquisition by entities with opaque ownership structures. These anomalies are surfaced with [confidence scoring](/glossary/confidence-scoring/) that reflects the strength of the underlying evidence.

## Architecture

```
CUZK ISKN --> Registry Pipeline --> Normalization --> Graph Construction --> Analysis
Market DB --> Market Pipeline  -->       |                  |               |
Corp Reg  --> Entity Pipeline  --> Unified Schema    KuzuDB Storage    Anomaly Detection
                                     |                  |               |
                              Deduplication      Ownership Chains   Alert Generation
                              Geocoding          Valuation Model    Report Output
```

The module is structured around three [data pipeline](/glossary/data-pipeline/)s. The **Registry Pipeline** connects to CUZK's ISKN system to fetch parcel data, ownership records, and encumbrance information. The **Market Pipeline** aggregates listings, transaction prices, and valuation estimates from commercial real estate databases. The **Analysis Pipeline** combines both data sources with corporate registry data to produce enriched property intelligence graphs stored in [KuzuDB](/glossary/kuzudb/) for relationship traversal.

Each pipeline runs as a supervised [GenServer](/glossary/genserver/) with configurable polling intervals and [rate limiting](/glossary/rate-limiting/) to respect data source constraints. The [Elixir](/glossary/elixir/) [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/) ensures that pipeline failures are isolated and automatically recovered without affecting other active analyses.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticPropertyIntelligence` | Public facade: `portfolio/1`, `ownership_chain/1`, `estimate_value/1`, `detect_anomalies/1` |
| `PrismaticPropertyIntelligence.Application` | OTP application entry point with pipeline supervision |
| `PrismaticPropertyIntelligence.RegistryPipeline` | CUZK ISKN data fetching, parsing, and normalization |
| `PrismaticPropertyIntelligence.MarketPipeline` | Real estate market data aggregation and valuation modeling |
| `PrismaticPropertyIntelligence.OwnershipTracer` | Historical ownership chain reconstruction and traversal |
| `PrismaticPropertyIntelligence.AnomalyDetector` | Transaction anomaly detection with configurable thresholds |
| `PrismaticPropertyIntelligence.ValuationEngine` | Comparable sales analysis and property value estimation |
| `PrismaticPropertyIntelligence.GeocodingService` | Address normalization and geocoding for spatial analysis |
| `PrismaticPropertyIntelligence.EntityCorrelator` | Cross-referencing property owners with corporate registry data |

## Key Features

### Property Analysis

The ownership chain reconstruction traverses historical registry entries to build a complete transfer history:

```elixir
defmodule PrismaticPropertyIntelligence.OwnershipTracer do
  @spec trace(String.t(), keyword()) :: {:ok, OwnershipChain.t()} | {:error, term()}
  def trace(parcel_id, opts \\ []) do
    depth = Keyword.get(opts, :depth, :full)

    with {:ok, current} <- RegistryPipeline.fetch_current_owner(parcel_id),
         {:ok, history} <- RegistryPipeline.fetch_ownership_history(parcel_id, depth),
         {:ok, entities} <- resolve_owner_entities(history),
         {:ok, corporate_links} <- EntityCorrelator.correlate(entities) do
      chain = build_chain(current, history, corporate_links)

      {:ok, %OwnershipChain{
        parcel_id: parcel_id,
        current_owner: current,
        transfers: format_transfers(history),
        corporate_connections: corporate_links,
        suspicious_patterns: detect_patterns(chain),
        total_transfers: length(history),
        span_years: compute_span(history),
        confidence: compute_chain_confidence(history)
      }}
    end
  end

  defp detect_patterns(chain) do
    [
      rapid_transfers(chain),
      below_market_sales(chain),
      circular_ownership(chain),
      shell_company_involvement(chain)
    ]
    |> List.flatten()
    |> Enum.filter(& &1.significance > @pattern_threshold)
  end
end
```

- Ownership chain reconstruction across historical land registry entries with full transfer history
- Property valuation estimation using comparable sales and location-based models
- Encumbrance and lien tracking including mortgages, easements, and court orders
- Transaction history analysis with price anomaly detection using [Monte Carlo verification](/glossary/monte-carlo-verification/)

### Asset Mapping

Corporate real estate portfolio mapping connects company identifiers to all owned properties:

| Mapping Method | Input | Output | Use Case |
|---------------|-------|--------|----------|
| ICO-to-parcel | Company ICO | All owned parcels | Corporate portfolio mapping |
| Person-to-parcel | Name + DOB | All owned properties | Personal asset investigation |
| Parcel-to-owners | Parcel ID | Full ownership history | Transaction investigation |
| Address-to-parcel | Street address | Parcel identifier and details | Location-based lookup |
| Area-to-portfolio | Region boundary | All entities with holdings | Regional analysis |

- Corporate real estate portfolio mapping from ICO (company ID) to all owned parcels
- Beneficial ownership [inference](/glossary/inference/) through property chains and corporate structures
- Shell company property detection using ownership pattern heuristics in the [knowledge graph](/glossary/knowledge-graph/)
- Cross-border property intelligence for entities with Czech and foreign holdings

### Market Intelligence

- Regional market trend analysis with price-per-square-meter tracking
- Comparable property identification for valuation support
- Development activity monitoring through building permit data
- Zoning and planning data integration from municipal sources

### Anomaly Detection

The anomaly detection system identifies suspicious transaction patterns using configurable scoring:

```elixir
defmodule PrismaticPropertyIntelligence.AnomalyDetector do
  @spec detect(keyword()) :: {:ok, list(Anomaly.t())} | {:error, term()}
  def detect(opts) do
    region = Keyword.fetch!(opts, :region)
    period = Keyword.fetch!(opts, :period)
    threshold = Keyword.get(opts, :threshold, 0.3)

    transactions = RegistryPipeline.fetch_transactions(region, period)
    market_data = MarketPipeline.fetch_market_prices(region, period)

    anomalies = transactions
    |> Enum.map(fn tx ->
      scores = %{
        price_deviation: price_deviation_score(tx, market_data),
        transfer_velocity: velocity_score(tx),
        entity_opacity: entity_opacity_score(tx),
        pattern_match: known_pattern_score(tx)
      }
      {tx, aggregate_anomaly_score(scores)}
    end)
    |> Enum.filter(fn {_tx, score} -> score > threshold end)
    |> Enum.sort_by(fn {_tx, score} -> score end, :desc)

    {:ok, format_anomalies(anomalies)}
  end
end
```

### Due Diligence Reporting

- Automated due diligence report generation with [audit trail](/glossary/audit-trail/) for every finding
- [GDPR](/glossary/gdpr/)-compliant data handling for personal property ownership records
- [Compliance framework](/glossary/compliance-framework/) alignment with Czech AML regulations
- Evidence packaging for regulatory submission through [Prismatic CER](/apps/prismatic-cer/)

## Usage

```elixir
# Map all properties owned by a company (by ICO)
{:ok, portfolio} = PrismaticPropertyIntelligence.portfolio(ico: "12345678")
# => %{parcels: [...], total_area_m2: 45_230, estimated_value_czk: 128_500_000}

# Reconstruct ownership chain for a specific parcel
{:ok, chain} = PrismaticPropertyIntelligence.ownership_chain(
  parcel_id: "KU:732234/LV:1542",
  depth: :full)
# => %{current_owner: "Example s.r.o.", transfers: 7, span_years: 23, patterns: [...]}

# Property valuation estimate based on comparables
{:ok, valuation} = PrismaticPropertyIntelligence.estimate_value(
  property_id: property_id,
  method: :comparable_sales,
  radius_km: 5)
# => %{estimated_value_czk: 4_500_000, confidence: 0.87, comparables_used: 12}

# Detect anomalous transactions in a region
{:ok, anomalies} = PrismaticPropertyIntelligence.detect_anomalies(
  region: :praha,
  period: {~D[2025-01-01], ~D[2025-12-31]},
  threshold: 0.3)
# => %{anomalies: [...], total_transactions: 12_450, flagged: 47}

# Cross-reference property ownership with corporate registry
{:ok, connections} = PrismaticPropertyIntelligence.corporate_connections(
  parcel_id: "KU:732234/LV:1542",
  include_subsidiaries: true)
```

## NABLA Compliance

| NABLA Axiom | Property Intelligence Enforcement | Implementation |
|-------------|----------------------------------|----------------|
| Provenance Mandatory | Every property claim traceable to CUZK registry entry | Registry Pipeline maintains full fetch metadata per record |
| Signal Plurality | Ownership claims require multi-source corroboration | EntityCorrelator cross-references CUZK with corporate registry |
| Source Independence | Registry and market data processed independently | Separate pipeline processes with independent data paths |
| Time Decay | Registry data freshness tracked with update timestamps | Polling intervals ensure data currency within configurable thresholds |
| Contradiction Preservation | Conflicting ownership records preserved for investigation | Multiple registry sources maintained independently without forced resolution |

## Testing

Ownership chain tests verify traversal correctness, transfer history completeness, and corporate correlation accuracy against known parcel fixtures. Anomaly detection tests verify scoring algorithms, threshold sensitivity, and pattern recognition against labeled datasets of suspicious and legitimate transactions. Valuation engine tests verify comparable selection, price estimation accuracy, and confidence score calibration.

Integration tests exercise the full pipeline from CUZK data fetching through normalization, graph construction, and anomaly detection. Property-based tests generate random parcel ownership histories to verify chain reconstruction invariants.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Czech Registry](/apps/prismatic-czech-autocrawler/) | Corporate registry data for ownership correlation and [entity resolution](/glossary/entity-resolution/) |
| [Prismatic Narrative](/apps/prismatic-narrative/) | Timeline generation from property transaction histories for investigation reports |
| [Prismatic CER](/apps/prismatic-cer/) | Compliance evidence storage and regulatory submission for due diligence reports |
| [Prismatic Deduction](/apps/prismatic-deduction/) | Rule-based [inference](/glossary/inference/) over property ownership patterns for shell company detection |
| [Prismatic Graph](/apps/prismatic-graph/) | Property ownership graph stored in KuzuDB for relationship traversal |
| [Prismatic DD](/apps/prismatic-dd/) | Due diligence case workflows consuming property intelligence findings |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Portfolio mapping (by ICO) | 2-10s | Depends on portfolio size |
| Ownership chain reconstruction | 1-5s | Depends on history depth |
| Property valuation | 500ms-3s | Comparable selection + price model |
| Anomaly detection (region) | 5-30s | Depends on transaction volume |
| Corporate correlation | 500ms-2s | Cross-registry entity resolution |
| Geocoding | < 200ms | Cached address normalization |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :property, :portfolio_mapped]`, `[:prismatic, :property, :chain_traced]`, `[:prismatic, :property, :anomaly_detected]`.

## Related Resources

- [Prismatic Czech Registry](/apps/prismatic-czech-autocrawler/) -- Corporate registry data for ownership correlation
- [Prismatic Narrative](/apps/prismatic-narrative/) -- Timeline generation from property transaction histories
- [Prismatic CER](/apps/prismatic-cer/) -- Compliance evidence storage for due diligence reports
- [Prismatic Deduction](/apps/prismatic-deduction/) -- Rule-based inference over property ownership patterns
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures property intelligence claims meet evidentiary standards
- [Cross Pollination Specialist](/agents/cross-pollination-specialist/) -- Connects property insights with corporate and financial intelligence domains
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews data pipeline architecture for scalability and resilience
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source property data fusion for comprehensive ownership analysis
- [Trinity Gate](/capabilities/trinity-gate/) -- Property ownership claims validated through structural, logical, and formal verification
- [Nabla Axioms](/capabilities/nabla-axioms/) -- Signal plurality enforcement on property intelligence assertions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)