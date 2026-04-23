+++
title = "ma-market-analyst"
weight = 239
[extra]
domain = "market-analysis"
level = "L3"
description = "Comprehensive market analysis for M&A transactions including competitive landscape assessment, market sizing (TAM/SAM/SOM), customer segmentation, growth opportunity identificat..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "aiad", "trinity-gate", "no-doubts", "seadf", "telemetry", "no-mercy"]
domain_normalized = "financial"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-market-analyst", "Comprehensive", "TAMSAMSOM", "agents", "agent", "Prismatic Platform", "Market", "Phase"]
tags = ["agents", "agent", "ma-market-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ma-market-analyst - Prismatic Platform"
+++

## Overview

The ma-market-analyst agent operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's market-analysis domain, providing comprehensive market intelligence for mergers and acquisitions transactions. This agent specializes in competitive landscape assessment, market sizing using TAM/SAM/SOM frameworks, customer segmentation analysis, growth opportunity identification, and industry trend evaluation. Its market intelligence outputs inform deal valuation, strategic fit assessment, and post-acquisition growth planning across the M&A pipeline.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy/) doctrine, the ma-market-analyst applies the [NABLA Infinity](/glossary/nabla-infinity/) framework's [signal plurality](/glossary/signal-plurality/) axiom to every market assessment. No market sizing figure, competitive positioning claim, or growth projection enters the analysis pipeline without corroboration from at least two independent intelligence sources. The agent leverages the platform's [OSINT](/glossary/osint/) capabilities and [entity resolution](/glossary/entity-resolution/) infrastructure to build comprehensive market maps from publicly available data sources including industry reports, patent filings, job posting analysis, conference participation records, and digital footprint indicators.

Market intelligence is a critical input for M&A decision-making because it determines whether an acquisition target's value proposition is defensible, its growth trajectory is sustainable, and its market position provides meaningful strategic advantage to the acquirer. The ma-market-analyst transforms scattered market signals into structured competitive intelligence that directly informs valuation models and strategic assessments.

## Architecture

The ma-market-analyst implements a multi-layer intelligence architecture that progressively builds market understanding from raw signals through structured analysis to strategic insight.

```
Intelligence Sources           Analysis Layer                 Output Layer
+-------------------+        +--------------------+         +------------------+
| Industry Reports  |---+    | Market Sizer       |         | Market Map       |
+-------------------+   |    | (TAM/SAM/SOM)      |---+     | (Visual + Data)  |
| Patent Databases  |---+--->+--------------------+   |  +->+------------------+
+-------------------+   |    | Competitive        |   |  |  | Competitor       |
| Job Postings      |---+    | Landscape Mapper   |---+--+  | Profiles         |
+-------------------+   |    +--------------------+   |  |  +------------------+
| Conference Data   |---+    | Segment Analyzer   |   |  |  | Growth           |
+-------------------+   |    | (Customer Groups)  |---+  +->| Projections      |
| Digital Footprint |---+    +--------------------+   |     +------------------+
+-------------------+        | Trend Identifier   |   |     | Strategic        |
                             | (Industry Signals) |---+     | Recommendations  |
                             +--------------------+         +------------------+
```

The intelligence source layer aggregates market data from diverse channels. The analysis layer applies specialized analytical models to produce structured market intelligence. The output layer synthesizes findings into actionable market assessments for downstream M&A agents.

## Core Capabilities

The ma-market-analyst provides comprehensive market intelligence through several specialized capability domains.

**Market Sizing (TAM/SAM/SOM)** quantifies the addressable market opportunity using top-down and bottom-up estimation methodologies. Total Addressable Market (TAM) estimates the complete market potential, Serviceable Addressable Market (SAM) narrows to segments reachable by the target's business model, and Serviceable Obtainable Market (SOM) estimates realistic capture potential. All estimates carry confidence intervals and methodology documentation.

**Competitive Landscape Mapping** identifies and profiles competitors across multiple dimensions: market share, product positioning, technology differentiation, pricing strategy, geographic coverage, and growth trajectory. The competitive map highlights strategic groups, competitive dynamics, and barrier structures that affect acquisition value.

**Customer Segmentation Analysis** analyzes the target's customer base composition, identifying segment concentrations, retention patterns, switching costs, and expansion opportunities. Customer analysis directly informs revenue sustainability and growth potential assessments.

**Growth Opportunity Identification** identifies untapped market opportunities accessible through the acquisition, including geographic expansion, product extension, cross-sell potential, and technology-enabled market creation. Growth opportunities are quantified with probability-weighted revenue projections.

**Industry Trend Evaluation** monitors macro-level industry trends including regulatory changes, technology shifts, demand pattern evolution, and competitive structure dynamics. Trend analysis provides context for evaluating the target's strategic positioning and growth sustainability.

**Strategic Fit Assessment** evaluates how well the acquisition target's market position complements or extends the acquirer's existing portfolio, identifying synergy opportunities and potential conflicts across market dimensions.

## Implementation

The market analyst is implemented as an [OTP](/glossary/otp/) application with concurrent intelligence gathering and analysis operations.

```elixir
defmodule Prismatic.MA.MarketAnalyst do
  @moduledoc """
  L3 Strategic Command agent for M&A market intelligence.
  Provides comprehensive market analysis including TAM/SAM/SOM,
  competitive landscape, and growth opportunity assessment.
  """

  use GenServer
  require Logger

  alias Prismatic.MA.Market.{Sizer, CompetitiveLandscape, SegmentAnalyzer, TrendIdentifier}
  alias Prismatic.OSINT.EntityResolver

  @intelligence_sources [:industry_reports, :patent_data, :job_postings,
                         :conference_data, :digital_footprint, :financial_data]

  defstruct [:target_id, :market_definition, :competitors, :segments, :trends, :sizing]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: via_tuple(opts[:target_id]))
  end

  @spec analyze_market(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def analyze_market(target_id, opts \\ []) do
    GenServer.call(via_tuple(target_id), {:analyze_market, opts}, 180_000)
  end

  @impl true
  def handle_call({:analyze_market, opts}, _from, state) do
    :telemetry.execute(
      [:prismatic, :ma, :market, :analysis_start],
      %{timestamp: System.monotonic_time()},
      %{target_id: state.target_id}
    )

    with {:ok, market_def} <- define_market(state.target_id, opts),
         {:ok, sizing} <- Sizer.compute_tam_sam_som(market_def),
         {:ok, landscape} <- CompetitiveLandscape.map(market_def),
         {:ok, segments} <- SegmentAnalyzer.analyze(state.target_id, market_def),
         {:ok, trends} <- TrendIdentifier.evaluate(market_def) do
      assessment = %{
        market_definition: market_def,
        sizing: sizing,
        competitive_landscape: landscape,
        customer_segments: segments,
        industry_trends: trends,
        growth_opportunities: identify_opportunities(sizing, landscape, trends),
        strategic_fit: compute_strategic_fit(landscape, segments),
        confidence: compute_confidence(sizing, landscape),
        generated_at: DateTime.utc_now()
      }
      {:reply, {:ok, assessment}, update_state(state, assessment)}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [ma-financial-analyst](/agents/ma-financial-analyst/) | Shares revenue benchmarking and market-based valuation multiples | Bidirectional |
| [ma-risk-assessor](/agents/ma-risk-assessor/) | Market concentration risk and competitive threat indicators | Outbound |
| [ma-integration-planner](/agents/ma-integration-planner/) | Market dynamics inform commercial integration strategy | Outbound |
| [ma-enforcement-commander](/agents/ma-enforcement-commander/) | Market share data for antitrust compliance evaluation | Outbound |
| [OSINT](/glossary/osint/) Agents | Market intelligence gathering from open sources | Inbound |
| [Entity Resolution](/glossary/entity-resolution/) | Competitor and customer entity disambiguation | Inbound |
| Prismatic Telemetry | Analysis pipeline [metrics](/glossary/metrics/) and event tracking | Outbound |

## Operational Workflow

**Phase 1 -- Market Definition**: Define the relevant market boundaries including industry classification, geographic scope, product/service categories, and customer segments. Market definition directly shapes all subsequent analysis.

**Phase 2 -- Intelligence Gathering**: Concurrent collection from multiple OSINT channels and proprietary databases. Each source is validated for recency, authority, and relevance before incorporation.

**Phase 3 -- Competitive Mapping**: Identify, profile, and position competitors within the defined market space. Build competitive dynamics model including rivalries, substitution threats, and new entrant risks.

**Phase 4 -- Market Quantification**: Compute TAM/SAM/SOM estimates using both top-down and bottom-up methodologies. Cross-validate sizing estimates across independent approaches.

**Phase 5 -- Strategic Assessment**: Synthesize market intelligence into strategic recommendations for the deal, including fit scoring, growth opportunity quantification, and risk identification.

## NABLA Compliance

| Axiom | Market Analysis Application |
|-------|----------------------------|
| Signal Plurality | Market sizing requires minimum two independent estimation approaches |
| Contradiction Preservation | Conflicting market data from different sources is preserved and analyzed |
| Absence Informative | Lack of competitive intelligence for a segment signals potential hidden competitors |
| Time Decay | Market data older than 12 months is flagged for refresh |
| Unknown Valid | Market uncertainties expressed as confidence intervals, not point estimates |
| Source Independence | Independent research sources weighted higher than aggregated data |
| Provenance Mandatory | Every market figure carries source attribution and collection methodology |

## Configuration

```elixir
config :prismatic_ma, Prismatic.MA.MarketAnalyst,
  analysis_timeout_ms: 180_000,
  min_independent_sources: 2,
  market_data_ttl_months: 12,
  sizing_methodology: :hybrid,  # :top_down | :bottom_up | :hybrid
  competitor_depth: :comprehensive,
  osint_channels: [:industry_reports, :patent_data, :job_postings, :conference_data],
  telemetry_prefix: [:prismatic, :ma, :market]
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full market analysis | < 120s | 68s (P95) |
| Market sizing computation | < 30s | 15s (P95) |
| Competitive landscape mapping | < 45s | 22s (P95) |
| Segment analysis | < 30s | 14s (P95) |
| Concurrent target capacity | 15+ | 20 tested |

## Related Resources

- [ma-financial-analyst](/agents/ma-financial-analyst/) -- Financial benchmarking correlation
- [ma-risk-assessor](/agents/ma-risk-assessor/) -- Market risk indicators
- [ma-integration-planner](/agents/ma-integration-planner/) -- Commercial integration strategy
- [ma-enforcement-commander](/agents/ma-enforcement-commander/) -- Antitrust compliance data
- [ma-tech-assessor](/agents/ma-tech-assessor/) -- Technology market positioning
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework for market intelligence
- [Entity Resolution](/glossary/entity-resolution/) -- Competitor entity disambiguation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)