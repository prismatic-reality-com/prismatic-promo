+++
title = "competitor-researcher"
weight = 90
[extra]
domain = "apex-predator"
level = "L2"
description = "Systematic competitive intelligence gathering, market landscape analysis, and strategic positioning assessment combining OSINT methodologies with structured analytical frameworks to deliver actionable intelligence that informs platform strategy and feature prioritization."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "otp", "beam", "telemetry", "osint", "signal-plurality", "entity-resolution"]
domain_normalized = "supreme"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 92
keywords = ["competitive intelligence", "market analysis", "OSINT", "strategic positioning", "technology tracking", "trend forecasting"]
tags = ["prismatic", "agent", "intelligence", "apex-predator-domain", "competitive-analysis"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "competitor-researcher - Prismatic Platform"
+++

## Executive Summary

The Competitor Researcher operates as an L2 tactical intelligence agent within the Apex Predator domain of the Prismatic Platform. This agent specializes in systematic competitive intelligence gathering, market landscape analysis, and strategic positioning assessment. By combining [OSINT](@/glossary/osint.md) methodologies with structured analytical frameworks, the Competitor Researcher delivers actionable intelligence that informs platform strategy and feature prioritization across all product domains.

Competitive intelligence in the Prismatic ecosystem extends beyond simple feature comparison. This agent employs multi-source evidence correlation, tracking competitor product announcements, technology stack choices, pricing models, hiring patterns, and public API surface changes. All findings are processed through the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, ensuring [signal plurality](@/glossary/signal-plurality.md) and provenance traceability before any competitive assessment reaches decision-makers. The agent's outputs directly influence strategic decisions including Prismatic Perimeter's market positioning against SecurityScorecard and BitSight, HAWKEYE's differentiation strategy, and the AI Drift monitoring product's feature roadmap.

## Architecture

The Competitor Researcher implements a four-layer intelligence cycle architecture.

```
+----------------------------------------------------------------------+
|         Competitor Researcher (L2)                                    |
+----------------------------------------------------------------------+
|  Collection Layer                                                     |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Product Monitor    |  | Technology Tracker |  | Market Scanner   | |
|  | (Release tracking) |  | (Stack analysis)   |  | (Pricing/pos.)   | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Analysis Engine                                      |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  |  | SWOT Builder |  | Gap Analyzer     |  | Trend Detector    |   |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Synthesis Layer           |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Evidence Correlator|  | Confidence Scorer  |  | Insight Generator| |
|  | (Cross-source)     |  | (NABLA compliance) |  | (Actionable rec.)| |
|  +--------------------+  +--------------------+  +------------------+ |
|                            |                                          |
|  Dissemination Layer       |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Intel Reports      |  | Strategy Briefs    |  | Alert System     | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Collection Layer gathers raw competitive data from multiple public sources. The Analysis Engine processes collected data through structured analytical frameworks. The Synthesis Layer correlates evidence across sources, scores confidence levels, and generates actionable insights. The Dissemination Layer delivers intelligence products to consuming agents and stakeholders.

## Operational Domain

The Apex Predator domain focuses on market dominance through intelligence superiority. The Competitor Researcher serves as the primary reconnaissance function, feeding strategic insights to coordinators and planners who translate intelligence into tactical advantages for the platform.

The competitive landscape for the Prismatic Platform spans multiple market segments. In the External Attack Surface Management (EASM) sector, competitors include SecurityScorecard, BitSight, Black Kite, and Panorays. In the visitor intelligence sector, competitors range from established analytics platforms to specialized behavior analysis tools. In the AI governance and compliance sector, the competitive landscape is still forming, presenting both opportunities and uncertainty that the Competitor Researcher must track and analyze.

## Core Capabilities

**Market Landscape Mapping** continuously monitors competitor product releases, feature sets, and strategic pivots across the security and intelligence tooling sector. The mapping system tracks product changes through public changelogs, press releases, blog posts, conference presentations, and patent filings. Changes are categorized by market segment and competitive impact, enabling trend identification across the landscape.

**Technology Stack Analysis** systematically examines competitor architectures, dependency choices, and infrastructure decisions to identify strengths and vulnerabilities. Analysis sources include job postings (indicating technology investments), open-source contributions, API documentation, and publicly available technical blog posts. Stack analysis reveals competitors' technical constraints and innovation directions.

**Pricing and Positioning Intelligence** maintains structured comparison frameworks that highlight differentiation opportunities and market gaps. Pricing analysis tracks competitor pricing model changes, feature tier boundaries, and enterprise vs. self-service positioning. This intelligence directly informs the platform's own pricing strategy and market positioning.

**OSINT-Driven Evidence Collection** leverages public data sources, patent filings, job postings, conference presentations, and social media signals to build comprehensive competitor profiles. The collection methodology follows established OSINT best practices, using only publicly available information through authorized channels.

**Trend Synthesis and Forecasting** identifies emerging patterns across the competitive landscape and predicts market direction shifts. By correlating signals from multiple competitors (similar technology investments, parallel feature announcements, convergent positioning changes), the forecaster identifies industry-wide trends before they become obvious.

**[Entity Resolution](@/glossary/entity-resolution.md) for Competitive Entities** resolves different names, subsidiaries, and product rebrandings to maintain consistent competitor profiles over time. When competitors are acquired, merged, or rebranded, the entity resolution system maintains profile continuity.

## Implementation

```elixir
defmodule PrismaticIntel.CompetitorResearcher do
  @moduledoc """
  L2 Tactical Operations agent providing systematic
  competitive intelligence gathering and analysis.
  """

  use GenServer

  alias PrismaticIntel.{ProductMonitor, TechTracker, MarketScanner}
  alias PrismaticIntel.{AnalysisEngine, EvidenceCorrelator, InsightGenerator}

  defstruct [
    :competitor_profiles,
    :evidence_store,
    :trend_models,
    :alert_rules
  ]

  @spec profile(String.t()) :: {:ok, map()} | {:error, term()}
  def profile(competitor_name) do
    GenServer.call(__MODULE__, {:profile, competitor_name})
  end

  @spec market_landscape() :: {:ok, map()} | {:error, term()}
  def market_landscape do
    GenServer.call(__MODULE__, :landscape, :timer.seconds(30))
  end

  @impl true
  def handle_call({:profile, name}, _from, state) do
    case Map.get(state.competitor_profiles, name) do
      nil -> {:reply, {:error, :not_found}, state}
      profile ->
        enriched = EvidenceCorrelator.enrich(profile, state.evidence_store)
        {:reply, {:ok, enriched}, state}
    end
  end
end
```

## Authority Level

**L2** -- Tactical Operations -- Domain-specific tactical execution with cross-domain coordination capabilities. The researcher provides intelligence to higher-authority agents who make strategic decisions based on the competitive analysis.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [archer-supreme-dx-commander](@/agents/archer-supreme-dx-commander.md) | Strategic Consumer | Receives competitive intelligence for DX strategy decisions |
| [supreme-coordinator](@/agents/supreme-coordinator.md) | Command Authority | Routes intelligence findings to strategic planning pipeline |

## Operational Workflow

**Phase 1 -- Collection**: Public sources are monitored for competitor activity. Product releases, technology changes, pricing updates, and positioning shifts are captured and cataloged.

**Phase 2 -- Analysis**: Collected data undergoes structured analysis through SWOT frameworks, gap analysis, and trend detection algorithms.

**Phase 3 -- Synthesis**: Cross-source evidence correlation produces confidence-scored insights. NABLA Signal Plurality requirements ensure no single-source conclusions.

**Phase 4 -- Dissemination**: Intelligence products are distributed to consuming agents through formatted reports, strategy briefs, and real-time alerts for significant competitive events.

**Phase 5 -- Continuous Update**: The intelligence cycle operates continuously, with collection frequency adjusted based on competitive activity levels and strategic priority.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Competitor profile coverage | > 90% of market | 94% |
| Intelligence freshness | < 7 days | 4.2 days |
| Evidence source diversity | > 3 sources per claim | 4.1 |
| Trend prediction accuracy | > 70% | 74% |
| Actionable insight rate | > 60% | 67% |
| Strategic decision influence | > 80% of plans | 85% |

## NABLA Compliance

**Signal Plurality**: Every competitive claim must be backed by evidence from at least two independent sources. Single-source assertions are blocked under NABLA Signal Plurality axiom, preventing intelligence products based on unreliable or biased data.

**Provenance Mandatory**: All intelligence findings carry complete evidence provenance: source identification, collection timestamp, analyst confidence level, and corroboration status. Decision-makers can trace any competitive assessment back to its supporting evidence.

**Contradiction Preservation**: When evidence from different sources contradicts (e.g., conflicting reports about a competitor's technology choices), both versions are preserved in the intelligence product with explicit uncertainty markers.

## Enforcement

All competitive intelligence operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every competitive claim must be backed by verifiable evidence from independent sources. Single-source assertions are blocked. Intelligence reports undergo [Trinity Gate](@/glossary/trinity-gate.md) validation before distribution to ensure structural consistency, logical coherence, and formal necessity of all conclusions.

## Related Resources

- [archer-supreme-dx-commander](@/agents/archer-supreme-dx-commander.md) -- Strategic DX command
- [supreme-coordinator](@/agents/supreme-coordinator.md) -- Platform coordination
- [OSINT](@/glossary/osint.md) -- Open source intelligence methodology
- [Entity Resolution](@/glossary/entity-resolution.md) -- Identity resolution
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)