+++
title = "pricing-strategist"
weight = 308
[extra]
domain = "primary-producer"
level = "L2"
description = "Pricing strategy development and competitive pricing analysis specialist"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pricing-strategist", "Pricing", "agents", "agent", "Prismatic Platform", "Competitive", "Revenue", "Value"]
tags = ["agents", "agent", "pricing-strategist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "pricing-strategist - Prismatic Platform"
+++

## Overview

The pricing-strategist operates as an L2 Tactical Operations authority within the Prismatic Platform's primary-producer domain, providing automated pricing strategy development and competitive pricing analysis for intelligence products and platform services. In multi-sided intelligence platforms, pricing is not a simple cost-plus exercise -- it requires continuous analysis of competitive positioning, value perception, customer segmentation, and market dynamics. This agent synthesizes market intelligence, competitor pricing data, usage patterns, and value metrics to produce evidence-based pricing recommendations with quantified confidence intervals and projected revenue impacts.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO DOUBTS](@/glossary/no-doubts.md) principle, every pricing recommendation carries explicit provenance chains linking the recommendation to the underlying market data, competitive intelligence, and analytical models that produced it. The agent applies [NABLA Infinity](@/glossary/nabla-infinity.md) [signal plurality](@/glossary/signal-plurality.md) requirements to pricing decisions, refusing to base strategies on single-source competitive data. [Contradiction preservation](@/glossary/contradiction-preservation.md) ensures that when market signals conflict -- for example, when competitor pricing moves suggest both premium and discount strategies simultaneously -- both perspectives are surfaced for decision-maker evaluation.

## Operational Domain

The pricing strategy domain encompasses competitive intelligence gathering, price elasticity modeling, customer segmentation analysis, value-based pricing framework construction, and dynamic pricing optimization. The agent operates across multiple product categories including intelligence subscriptions, API access tiers, platform licensing, and per-query pricing models. Data sources include public competitor pricing pages, market analyst reports, customer usage telemetry, churn correlation analysis, and industry benchmark databases.

The agent maintains continuous competitive pricing monitoring across the intelligence platform market, tracking pricing changes by competitors in real-time and correlating pricing events with market share movements and customer migration patterns.

## Key Capabilities

- **Competitive pricing intelligence** -- Monitors and analyzes competitor pricing structures, packaging models, tier configurations, and promotional strategies across the intelligence platform market, maintaining current pricing matrices for all tracked competitors
- **Price elasticity modeling** -- Constructs demand elasticity models from historical usage data and pricing experiments, identifying optimal price points that maximize revenue while maintaining market competitiveness and customer retention
- **Customer segmentation pricing** -- Develops segment-specific pricing strategies based on usage patterns, willingness-to-pay analysis, and value realization metrics, enabling differential pricing that captures maximum value across diverse customer profiles
- **Dynamic pricing optimization** -- Implements usage-based pricing algorithms that adjust per-query and per-API-call costs based on demand patterns, capacity utilization, and marginal cost analysis
- **Revenue impact projection** -- Models the revenue impact of proposed pricing changes across customer segments, accounting for elasticity effects, competitive responses, and migration probabilities
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed competitive monitoring and pricing model recalibration cycles
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for pricing experiment tracking and revenue metric monitoring

## Pricing Framework Architecture

The agent implements a multi-layer pricing framework that separates strategic positioning from tactical execution.

The **value assessment layer** quantifies the economic value delivered to customers through intelligence products. This includes time savings from automated analysis, risk reduction from early warning systems, and opportunity identification value from proactive intelligence. Value metrics are tracked through customer outcome measurement and correlated with pricing tier adoption patterns.

The **competitive positioning layer** maps the platform's pricing against competitive alternatives, identifying positioning gaps, premium justification requirements, and price-sensitive market segments. Competitive analysis extends beyond direct competitors to include substitute products and build-versus-buy cost comparisons.

The **optimization layer** applies algorithmic pricing optimization using customer behavior data, A/B test results, and elasticity models to recommend specific price points, tier boundaries, and packaging configurations. Optimization targets are configurable -- revenue maximization, market share growth, or customer lifetime value optimization.

## Implementation Architecture

```elixir
defmodule PrismaticPricing.StrategyEngine do
  @moduledoc """
  Core pricing strategy engine implementing multi-factor
  pricing optimization with competitive intelligence integration.
  """

  use GenServer
  alias PrismaticPricing.{CompetitiveIntel, ElasticityModel, SegmentAnalyzer}

  @type pricing_recommendation :: %{
    tier: atom(),
    price_point: Decimal.t(),
    confidence: float(),
    elasticity: float(),
    revenue_impact: Decimal.t(),
    competitive_position: atom()
  }

  @spec generate_recommendation(String.t(), keyword()) ::
    {:ok, pricing_recommendation()} | {:error, term()}
  def generate_recommendation(product_id, opts \\ []) do
    with {:ok, competitive} <- CompetitiveIntel.current_landscape(product_id),
         {:ok, elasticity} <- ElasticityModel.calculate(product_id, opts),
         {:ok, segments} <- SegmentAnalyzer.value_analysis(product_id) do
      recommendation = optimize_price(competitive, elasticity, segments, opts)
      {:ok, recommendation}
    end
  end

  defp optimize_price(competitive, elasticity, segments, opts) do
    target = Keyword.get(opts, :optimization_target, :revenue)

    %{
      tier: determine_tier(competitive),
      price_point: calculate_optimal_price(elasticity, target),
      confidence: calculate_confidence(competitive, elasticity, segments),
      elasticity: elasticity.coefficient,
      revenue_impact: project_revenue_impact(elasticity, segments),
      competitive_position: assess_position(competitive)
    }
  end
end
```

## Pricing Model Categories

| Model Type | Description | Use Case | Complexity |
|------------|-------------|----------|------------|
| **Subscription Tiered** | Fixed monthly/annual pricing with feature tiers | Platform access | Low |
| **Usage-Based** | Per-query or per-API-call pricing | API consumers | Medium |
| **Value-Based** | Pricing tied to measurable customer outcomes | Enterprise deals | High |
| **Hybrid** | Base subscription plus usage overage | Mid-market | Medium |
| **Dynamic** | Real-time pricing based on demand and capacity | Commodity queries | High |

## Competitive Analysis Framework

| Dimension | Metric | Data Source | Update Frequency |
|-----------|--------|-------------|-----------------|
| **Direct Pricing** | Competitor list prices per tier | Public pricing pages | Weekly |
| **Effective Pricing** | Actual transaction prices (discounted) | Market intelligence | Monthly |
| **Feature Density** | Value per dollar across feature sets | Product comparison | Monthly |
| **Switching Cost** | Cost of migration between platforms | Customer surveys | Quarterly |
| **Market Share** | Revenue share by pricing segment | Analyst reports | Quarterly |

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](@/glossary/tactical-execution.md) with authority to develop pricing recommendations, conduct competitive pricing analysis, and execute pricing experiments within approved parameters.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pricing analyze` | Generate competitive pricing analysis for a product category | L2+ |
| `/pricing recommend` | Produce pricing recommendation with revenue impact projections | L2+ |
| `/pricing experiment` | Design and evaluate a pricing experiment with A/B test framework | L2+ |
| `/pricing monitor` | Display competitive pricing dashboard with change alerts | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [risk-assessment-commander](@/agents/risk-assessment-commander.md) | Revenue risk from pricing changes feeds into financial risk models |
| [report-synthesis-specialist](@/agents/report-synthesis-specialist.md) | Pricing analysis synthesized into executive intelligence reports |
| [reputation-risk-specialist](@/agents/reputation-risk-specialist.md) | Reputational impact assessment of pricing strategy changes |

## Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Recommendation accuracy** | >85% within 10% of optimal | Post-implementation revenue analysis |
| **Competitive data freshness** | <7 days on direct pricing | Last-updated timestamps |
| **Elasticity model R-squared** | >0.75 | Model validation against holdout data |
| **Analysis latency** | <30 seconds | End-to-end recommendation generation |
| **Signal plurality** | 3+ sources per recommendation | Source count tracking |

## Enforcement

Pricing recommendations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no recommendations are published without complete competitive context, confidence intervals, and revenue impact projections. The [NO DOUBTS](@/glossary/no-doubts.md) principle mandates that all pricing claims are backed by quantitative evidence from market data and analytical models. Every pricing recommendation must pass [Trinity Gate](@/glossary/trinity-gate.md) structural consistency validation, ensuring that recommended prices are coherent across tiers, segments, and product categories.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)