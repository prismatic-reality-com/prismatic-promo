+++
title = "real-estate-valuation-specialist"
weight = 335
[extra]
domain = "real"
level = "L3"
description = "Specialized intelligence gathering and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "osint"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["real-estate-valuation-specialist", "Specialized", "agents", "agent", "Prismatic Platform", "OSINT", "Strategic Command", "AIAD"]
tags = ["agents", "agent", "real-estate-valuation-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "real-estate-valuation-specialist - Prismatic Platform"
+++

## Overview

The real-estate-valuation-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's real estate intelligence domain, providing automated property valuation analysis through multi-source data aggregation and market intelligence. This agent synthesizes public cadastral records, transaction histories, zoning data, development permits, and market comparable analysis to produce evidence-based property valuations with quantified confidence intervals. Its outputs support due diligence operations, investment analysis, and asset verification workflows.

Governed by the [AIAD](/glossary/aiad/) standard and the [NO DOUBTS](/glossary/no-doubts/) principle, every valuation produced by this agent carries explicit confidence scores and full provenance chains. The agent applies [NABLA Infinity](/glossary/nabla-infinity/) [signal plurality](/glossary/signal-plurality/) requirements, refusing to produce valuations from a single data source. Market data is subject to mandatory [time decay](/glossary/time-decay/) validation -- older comparables receive reduced weight in valuation models, and the agent flags stale data that may distort current estimates.

## Operational Domain

The real estate intelligence domain encompasses property identification, ownership verification, market value estimation, and portfolio-level analysis. The agent operates across residential, commercial, and industrial property classes, adapting its valuation models to local market characteristics. Data sources include public land registries, tax assessment databases, building permit records, and [OSINT](/glossary/osint/)-accessible listing platforms.

## Key Capabilities

- **Automated comparable analysis** -- Identifies and scores comparable transactions based on property characteristics, location proximity, temporal relevance, and market conditions to establish fair market value ranges
- **Cadastral data integration** -- Extracts and correlates property records from public registries, including ownership chains, encumbrances, easements, and zoning classifications
- **Development potential assessment** -- Evaluates undeveloped or underdeveloped properties against current zoning regulations and development permit patterns to estimate highest-and-best-use value
- **Portfolio aggregation** -- Produces consolidated valuation reports across multi-property portfolios, identifying concentration risks and diversification characteristics
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed data collection and model calibration cycles
- **[Telemetry integration](/capabilities/telemetry-integration/)** for valuation pipeline monitoring and data freshness tracking

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to initiate property data collection operations and publish valuation products.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/real-estate valuate` | Initiate property valuation for a specified address or parcel | L3+ |
| `/real-estate compare` | Run comparable analysis for a target property | L3+ |
| `/real-estate portfolio` | Generate portfolio-level valuation summary | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [risk-assessment-commander](/agents/risk-assessment-commander/) | Provides property asset values for collateral risk models |
| [regulatory-compliance-risk-specialist](/agents/regulatory-compliance-risk-specialist/) | Ensures valuation methods comply with jurisdictional regulatory requirements |
| [opportunity-analyzer](/agents/opportunity-analyzer/) | Supplies valuation data for investment opportunity qualification |

## Valuation Methodology

The real-estate-valuation-specialist applies three complementary valuation approaches, selecting and weighting them based on property type, data availability, and purpose of the valuation.

### Comparable Sales Approach

The primary valuation method identifies recent transactions of similar properties and adjusts for differences in characteristics, location, and market conditions. The agent scores potential comparables on a multi-factor similarity metric that accounts for property type, size, age, condition, location proximity, and transaction recency. Adjustments are applied systematically: location adjustments use spatial regression models, size adjustments use per-unit cost curves, and temporal adjustments use market index movements.

### Income Capitalization Approach

For commercial and investment properties, the income approach estimates value based on the property's income-producing potential. The agent models net operating income from rental income data, vacancy rates, and operating expense ratios, then applies market-derived capitalization rates to produce value estimates. Cap rate selection considers property class, location, tenant quality, and lease term structure.

### Cost Approach

The cost approach estimates the replacement cost of the improvements plus land value minus depreciation. This method is applied primarily to special-purpose properties where comparable sales and income data are limited. The agent models construction costs using regional cost databases and applies depreciation estimates for physical deterioration, functional obsolescence, and external obsolescence.

## Implementation Architecture

```elixir
defmodule Prismatic.RealEstate.ValuationEngine do
  @moduledoc """
  Multi-approach property valuation engine with confidence
  scoring and NABLA Infinity provenance compliance.
  """

  alias Prismatic.RealEstate.{ComparableAnalyzer, IncomeCapitalizer, CostEstimator}

  @type valuation :: %{
    property_id: String.t(),
    estimated_value: Decimal.t(),
    confidence_interval: {Decimal.t(), Decimal.t()},
    approach_weights: map(),
    data_sources: [source()],
    freshness: :current | :stale | :expired
  }

  @spec valuate(String.t(), keyword()) :: {:ok, valuation()} | {:error, term()}
  def valuate(property_id, opts \\ []) do
    with {:ok, property} <- load_property_data(property_id),
         {:ok, comparable} <- ComparableAnalyzer.estimate(property, opts),
         {:ok, income} <- IncomeCapitalizer.estimate(property, opts),
         {:ok, cost} <- CostEstimator.estimate(property, opts) do
      weights = determine_approach_weights(property, comparable, income, cost)
      value = weighted_reconciliation(comparable, income, cost, weights)

      {:ok, %{
        property_id: property_id,
        estimated_value: value.point_estimate,
        confidence_interval: value.interval,
        approach_weights: weights,
        data_sources: collect_sources(comparable, income, cost),
        freshness: assess_data_freshness(comparable, income, cost)
      }}
    end
  end
end
```

## Data Source Integration

| Source Type | Data Provided | Freshness Requirement | Jurisdictions |
|-------------|--------------|----------------------|---------------|
| **Cadastral Records** | Ownership, boundaries, encumbrances | Updated on registration | Multi-jurisdiction |
| **Transaction Databases** | Sale prices, dates, parties | < 90 days for comparables | Local registries |
| **Tax Assessment** | Assessed values, tax rates | Annual update cycle | Municipality-specific |
| **Building Permits** | Construction, renovation activity | Current year | Local authorities |
| **Listing Platforms** | Asking prices, market activity | Real-time via OSINT | Regional platforms |
| **Market Indices** | Price trends, volume trends | Monthly updates | National/regional |

## Valuation Quality Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Comparable Coverage** | Number of valid comparables per valuation | >= 5 for high confidence |
| **Data Recency** | Age of most recent comparable transaction | < 180 days |
| **Confidence Width** | Spread of confidence interval relative to estimate | < 15% for confirmed |
| **Source Plurality** | Independent data sources per valuation | >= 3 per NABLA axiom |
| **Temporal Consistency** | Agreement between time-adjusted comparables | Coefficient of variation < 0.20 |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Valuation pipeline [metrics](/glossary/metrics/) and data freshness tracking |
| [AIAD](/glossary/aiad/) [Registry](/glossary/registry-otp/) | Agent specification and discovery |
| [SEADF](/glossary/seadf/) Pipeline | Valuation model accuracy assessment within evolution workflows |
| [OSINT](/glossary/osint/) Infrastructure | Public data collection for market intelligence |

## Enforcement

All valuations must pass [Trinity Gate](/glossary/trinity-gate/) validation before publication. The [NO MERCY](/glossary/no-mercy/) doctrine prohibits delivery of incomplete valuations -- every property assessment must include confidence intervals, data source citations, and explicit disclosure of any information gaps or assumptions. The [NO DOUBTS](/glossary/no-doubts/) principle requires that valuation claims are traceable to specific data sources with quantified confidence. Valuations based on stale data (comparables older than 180 days without market adjustment) are flagged with explicit freshness warnings.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)