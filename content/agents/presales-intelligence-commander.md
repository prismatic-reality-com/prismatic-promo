+++
title = "presales-intelligence-commander"
weight = 307
[extra]
domain = "large-predator"
level = "L1"
description = "Supreme commander for presales intelligence and opportunity management"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "predator"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2300
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-intelligence-commander", "Supreme", "agents", "agent", "Prismatic Platform", "OSINT", "Market", "Competitive"]
tags = ["agents", "agent", "presales-intelligence-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "presales-intelligence-commander - Prismatic Platform"
+++

## Overview

The presales-intelligence-commander operates as an L1 Supreme Authority within the Prismatic Platform's large-predator domain, serving as the [supreme commander](@/glossary/supreme-commander.md) for presales intelligence operations and opportunity management. This agent orchestrates the strategic layer of business development by directing intelligence collection on target markets, analyzing competitive landscapes, qualifying opportunities through data-driven frameworks, and optimizing the presales pipeline for maximum conversion. Unlike the tactical presales-coordinator that executes individual engagements, the commander operates at the strategic level -- deciding which opportunities to pursue, how to position the platform, and where to allocate presales resources.

Built on the [AIAD](@/glossary/aiad.md) standard and leveraging the platform's full [OSINT](@/glossary/osint.md) intelligence infrastructure, the commander conducts systematic intelligence gathering on prospects, competitors, and market dynamics. Through the [mycelial network](@/glossary/mycelial-network.md), strategic intelligence insights propagate to all agents involved in business development, ensuring coordinated pursuit of qualified opportunities. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework ensures that market assessments and competitive claims are evidence-backed with quantified confidence.

## Operational Domain

The presales intelligence domain spans strategic market analysis, opportunity qualification, competitive intelligence, prospect profiling, and pipeline optimization. The commander maintains a living model of the addressable market, tracking market segments, competitive dynamics, buyer personas, and technology adoption patterns. This intelligence informs resource allocation decisions -- concentrating effort on opportunities with the highest probability-weighted value.

| Strategic Function | Scope | Decision Authority |
|-------------------|-------|-------------------|
| Market Intelligence | Industry trends, market sizing, segmentation | Market entry/exit decisions |
| Opportunity Qualification | BANT/MEDDIC framework scoring | Pursue/no-pursue decisions |
| Competitive Intelligence | Feature comparison, positioning, pricing | Competitive strategy |
| Prospect Profiling | Company analysis, stakeholder mapping | Engagement approach |
| Pipeline Optimization | Conversion analysis, resource allocation | Priority ranking |
| Win/Loss Analysis | Outcome analysis, pattern identification | Strategy refinement |

## Key Capabilities

- **Market intelligence synthesis** -- Aggregates and analyzes market data from public filings, industry reports, technology surveys, and OSINT sources to produce strategic market assessments with opportunity sizing
- **Opportunity qualification framework** -- Applies structured qualification methodologies (BANT, MEDDIC, SCOTSMAN) to score and prioritize opportunities based on budget, authority, need, timeline, and competitive position
- **Competitive landscape mapping** -- Monitors competitor activities, product launches, pricing changes, and customer testimonials to maintain an up-to-date competitive intelligence database
- **Stakeholder intelligence** -- Profiles key decision-makers and influencers within target organizations using OSINT techniques, identifying their priorities, pain points, and decision-making patterns
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed market scanning and opportunity detection cycles
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing pipeline velocity, conversion rates, and market intelligence freshness metrics

## Strategic Intelligence Engine

```elixir
defmodule Prismatic.Presales.IntelligenceCommander do
  @moduledoc """
  Strategic presales intelligence with opportunity qualification,
  competitive analysis, and pipeline optimization.
  """

  alias Prismatic.Presales.{MarketAnalyzer, OpportunityQualifier, CompetitiveIntel, PipelineOptimizer}

  @type opportunity :: %{
    id: String.t(),
    prospect: String.t(),
    market_segment: atom(),
    estimated_value: float(),
    qualification_score: float(),
    competitive_position: atom(),
    stage: atom(),
    probability: float()
  }

  @spec qualify_opportunity(prospect :: String.t(), context :: map()) :: {:ok, opportunity()}
  def qualify_opportunity(prospect, context) do
    with {:ok, prospect_profile} <- profile_prospect(prospect),
         {:ok, market_context} <- MarketAnalyzer.segment_context(prospect_profile.industry),
         {:ok, competitive_pos} <- CompetitiveIntel.assess_position(prospect, context),
         {:ok, qualification} <- OpportunityQualifier.score(prospect_profile, context) do
      opportunity = %{
        id: Ecto.UUID.generate(),
        prospect: prospect,
        market_segment: prospect_profile.industry,
        estimated_value: estimate_deal_value(prospect_profile, context),
        qualification_score: qualification.overall_score,
        competitive_position: competitive_pos.position,
        stage: :qualified,
        probability: calculate_win_probability(qualification, competitive_pos)
      }

      emit_qualification_telemetry(opportunity)
      {:ok, opportunity}
    end
  end

  @spec optimize_pipeline([opportunity()]) :: {:ok, pipeline_recommendation()}
  def optimize_pipeline(opportunities) do
    ranked = PipelineOptimizer.rank_by_expected_value(opportunities)
    resource_plan = PipelineOptimizer.allocate_resources(ranked)
    risk_assessment = PipelineOptimizer.assess_pipeline_risk(ranked)

    {:ok, %{
      ranked_opportunities: ranked,
      resource_allocation: resource_plan,
      pipeline_risk: risk_assessment,
      expected_pipeline_value: sum_expected_values(ranked)
    }}
  end

  defp calculate_win_probability(qualification, competitive_pos) do
    base = qualification.overall_score
    competitive_factor = case competitive_pos.position do
      :strong_advantage -> 1.2
      :advantage -> 1.1
      :neutral -> 1.0
      :disadvantage -> 0.8
      :strong_disadvantage -> 0.6
    end

    min(base * competitive_factor, 0.95)
  end
end
```

## Opportunity Qualification Framework

| Criterion | Weight | Scoring Method | Threshold |
|----------|--------|----------------|-----------|
| Budget | 25% | Verified budget allocation vs. platform pricing | Budget >= 80% of price |
| Authority | 20% | Decision-maker access and engagement level | Direct sponsor identified |
| Need | 25% | Problem-solution fit assessment | >= 3 use cases matched |
| Timeline | 15% | Purchase timeline vs. sales cycle | Decision within 6 months |
| Competition | 15% | Competitive position analysis | Not sole-source competitor |

## Authority Level

**L1** - Supreme Authority - Platform-wide strategic and tactical control with authority to direct presales resource allocation, approve pursuit/no-pursuit decisions, and set competitive positioning strategy.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/presales-intel qualify` | Run opportunity qualification analysis on specified prospect | L1+ |
| `/presales-intel pipeline` | Display pipeline health with conversion metrics and risk assessment | L1+ |
| `/presales-intel compete` | Generate competitive analysis for specified engagement | L1+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [presales-coordinator](@/agents/presales-coordinator.md) | Receives strategic direction and executes individual presales engagements |
| [linkedin-intelligence-specialist](@/agents/linkedin-intelligence-specialist.md) | Provides stakeholder intelligence for prospect profiling |
| [risk-intelligence-commander](@/agents/risk-intelligence-commander.md) | Supplies prospect and market risk assessments |
| [regulatory-intelligence-commander](@/agents/regulatory-intelligence-commander.md) | Informs on regulatory compliance requirements affecting prospects |

## Win/Loss Intelligence

The commander maintains a structured win/loss analysis database that captures the factors contributing to each opportunity outcome. Pattern analysis across historical outcomes reveals which qualification criteria are most predictive of success, which competitive scenarios favor the platform, and which prospect profiles represent the highest conversion probability. These insights feed back into the qualification framework through the [SEADF](@/glossary/seadf.md) evolutionary pipeline, continuously improving opportunity scoring accuracy.

## Competitive Intelligence Framework

The presales-intelligence-commander maintains a structured competitive intelligence capability that tracks competitor activities, product capabilities, pricing strategies, and market positioning.

### Competitor Monitoring

The commander monitors competitor activities through a combination of [OSINT](@/glossary/osint.md) techniques: public product announcements and release notes, conference presentations and technical blog posts, customer testimonials and case study publications, job postings (indicating technology direction and capability gaps), patent filings (revealing R&D priorities), and analyst reports (providing third-party assessments). Monitoring is continuous, with intelligence summaries produced weekly and detailed competitive assessments updated monthly.

### Feature Comparison Matrix

The commander maintains a detailed feature comparison matrix that maps the platform's capabilities against those of primary competitors. Each feature comparison is evidence-based -- claimed competitor capabilities are verified through publicly available documentation, trial evaluations, or confirmed customer feedback. The matrix distinguishes between confirmed capabilities (verified through independent evidence), claimed capabilities (stated by the competitor but not independently verified), and capability gaps (features the competitor does not offer). This rigorous approach prevents the presales team from making competitive claims that could be contradicted during prospect evaluations.

### Win/Loss Pattern Analysis

The commander analyzes patterns across historical opportunity outcomes to identify factors that most strongly predict engagement success or failure. Key patterns tracked include competitive scenarios (which competitors were present and which won), prospect characteristics (industry, size, technical sophistication), engagement approach (demo-led vs. POC-led vs. proposal-led), and qualification scores at various pipeline stages. Pattern analysis uses statistical methods to identify correlations with sufficient confidence, avoiding spurious pattern identification from small sample sizes.

## Pipeline Optimization Strategy

The commander optimizes the presales pipeline through a systematic approach to resource allocation. Opportunities are ranked by expected value: the product of estimated deal value and win probability. Resources are allocated preferentially to high-expected-value opportunities, with minimum resource guarantees for pipeline diversity (maintaining opportunities across different market segments and competitive scenarios to prevent concentration risk).

Pipeline health is monitored through several metrics: **conversion velocity** (average time to progress between pipeline stages), **stage dropout rate** (percentage of opportunities lost at each stage), **pipeline balance** (distribution of opportunities across stages), and **forecast accuracy** (comparison of predicted vs. actual pipeline outcomes over rolling quarters). Anomalies in these metrics trigger investigation and corrective action by the commander.

## Market Intelligence Synthesis

The commander synthesizes market intelligence from multiple public sources to maintain current understanding of the addressable market. Sources include industry analyst reports, market sizing studies, technology adoption surveys, public company financial filings, industry conference themes and attendance patterns, and regulatory developments that create new compliance requirements. Market intelligence is structured into quarterly market landscape reports that inform strategic decisions about which market segments to target and how to position the platform within each segment.

## Enforcement

All presales intelligence complies with the [NO MERCY](@/glossary/no-mercy.md) doctrine: market claims are backed by verifiable data, competitive assessments are evidence-based rather than aspirational, and pipeline forecasts use probability-weighted values rather than optimistic projections. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that opportunity qualification scores are traceable to specific evidence, and that win probability estimates carry explicit confidence intervals. [NABLA Infinity](@/glossary/nabla-infinity.md) provenance chains link all intelligence products to their source data.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)