+++
title = "ma-risk-assessor"
weight = 240
[extra]
domain = "risk-management"
level = "L3"
description = "Comprehensive risk identification, assessment, and mitigation planning for M&A transactions across all risk categories with probability and impact quantification, correlation an..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nabla-infinity", "trinity-gate", "aiad", "no-mercy", "attack-surface", "no-doubts", "seadf", "telemetry"]
domain_normalized = "risk"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-risk-assessor", "Comprehensive", "agents", "agent", "Prismatic Platform", "Risk", "Phase", "Every", "Inbound"]
tags = ["agents", "agent", "ma-risk-assessor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ma-risk-assessor - Prismatic Platform"
+++

## Overview

The ma-risk-assessor agent operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's risk-management domain, providing comprehensive risk identification, assessment, and mitigation planning for mergers and acquisitions transactions. This agent evaluates risks across all categories -- financial, legal, operational, technical, regulatory, reputational, and cybersecurity -- quantifying each risk with probability and impact scores, analyzing risk correlations, and developing structured mitigation strategies that inform deal decisions and post-acquisition planning.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy/) doctrine, the ma-risk-assessor refuses to produce risk assessments based on incomplete evidence. Every risk identification requires corroboration from at least two independent intelligence sources per the [NABLA Infinity](/glossary/nabla-infinity/) framework's [signal plurality](/glossary/signal-plurality/) axiom. The agent applies the [contradiction preservation](/glossary/contradiction-preservation/) principle to ensure that conflicting risk signals from different assessment domains are surfaced rather than silently resolved, preserving the decision-maker's ability to evaluate ambiguous situations.

Risk assessment is the connective tissue of M&A due diligence, integrating findings from financial, technical, market, and legal analysis into a unified risk picture that drives both go/no-go decisions and deal structuring. The ma-risk-assessor addresses the challenge of risk correlation -- the phenomenon where individually acceptable risks combine to create unacceptable aggregate exposure -- by modeling risk interactions across categories and computing portfolio-level risk metrics.

## Architecture

The ma-risk-assessor implements a multi-dimensional risk analysis architecture that processes risk signals from all specialist M&A agents and produces unified risk profiles with correlation analysis.

```
Risk Signal Inputs              Risk Engine                    Risk Outputs
+-------------------+         +--------------------+         +------------------+
| Financial Risks   |---+     | Risk Identifier    |         | Risk Register    |
+-------------------+   |     | (Pattern Matching) |---+     | (Structured)     |
| Technical Risks   |---+---->+--------------------+   |  +->+------------------+
+-------------------+   |     | Probability Engine |   |  |  | Risk Matrix      |
| Market Risks      |---+     | (Quantification)   |---+--+  | (Heat Map)       |
+-------------------+   |     +--------------------+   |  |  +------------------+
| Legal Risks       |---+     | Correlation Engine |   |  |  | Mitigation Plan  |
+-------------------+   |     | (Cross-Category)   |---+  +->| (Strategies)     |
| Cyber Risks       |---+     +--------------------+   |     +------------------+
+-------------------+         | Aggregation Engine |   |     | Portfolio Risk   |
                              | (Portfolio View)   |---+     | (Aggregate Score)|
                              +--------------------+         +------------------+
```

The risk engine processes signals through four stages: identification (pattern matching against risk taxonomies), quantification (probability and impact scoring), correlation (cross-category interaction analysis), and aggregation (portfolio-level risk computation). Each stage publishes [telemetry](/glossary/telemetry/) events for pipeline monitoring and audit.

## Core Capabilities

The ma-risk-assessor provides comprehensive M&A risk intelligence through several specialized capability domains.

**Risk Identification** systematically catalogs risks across seven categories using structured taxonomies derived from M&A historical data and industry frameworks. The identification engine combines pattern matching against known risk indicators with anomaly detection for novel risk patterns not captured by existing taxonomies.

**Probability Quantification** assigns probability scores to identified risks using Bayesian inference models that combine prior probabilities from historical M&A data with target-specific evidence. Probability estimates carry explicit confidence intervals reflecting the quality and completeness of available evidence.

**Impact Assessment** evaluates the potential impact of each identified risk across financial, operational, strategic, and reputational dimensions. Impact scoring uses structured rubrics calibrated against historical M&A outcomes, with adjustments for deal-specific context factors.

**Correlation Analysis** models risk interactions across categories, identifying clusters of risks that amplify each other's probability or impact. Correlation analysis is critical for detecting scenarios where individually manageable risks combine to create material aggregate exposure. The engine uses graph-based models to represent risk dependencies and propagation paths.

**Mitigation Strategy Development** generates structured mitigation strategies for each identified risk, including preventive measures, contingency plans, risk transfer mechanisms (insurance, indemnification), and residual risk acceptance criteria. Mitigation strategies are linked to integration plan activities through the integration planner.

**Portfolio Risk Aggregation** computes aggregate risk scores that account for risk correlations, providing a portfolio-level view of deal risk exposure. Aggregate metrics include expected loss distribution, worst-case scenario analysis, and risk-adjusted return indicators.

## Implementation

The risk assessor is implemented as a [GenServer](/glossary/genserver/) process managing risk assessment state for each deal.

```elixir
defmodule Prismatic.MA.RiskAssessor do
  @moduledoc """
  L3 Strategic Command agent for M&A risk assessment.
  Comprehensive risk identification, quantification, and mitigation planning.
  """

  use GenServer
  require Logger

  alias Prismatic.MA.Risk.{Identifier, Quantifier, CorrelationEngine, Aggregator, MitigationPlanner}

  @risk_categories [:financial, :legal, :operational, :technical, :regulatory, :reputational, :cyber]
  @max_acceptable_aggregate_risk 0.85

  defstruct [:deal_id, :risk_register, :correlations, :aggregate_score, :mitigations]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: via_tuple(opts[:deal_id]))
  end

  @spec assess_target(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def assess_target(target_id, opts \\ []) do
    GenServer.call(via_tuple(target_id), {:assess, opts}, 120_000)
  end

  @impl true
  def handle_call({:assess, opts}, _from, state) do
    :telemetry.execute(
      [:prismatic, :ma, :risk, :assessment_start],
      %{timestamp: System.monotonic_time()},
      %{deal_id: state.deal_id}
    )

    with {:ok, risks} <- Identifier.identify(state.deal_id, @risk_categories),
         {:ok, quantified} <- Quantifier.quantify(risks),
         {:ok, correlations} <- CorrelationEngine.analyze(quantified),
         {:ok, aggregate} <- Aggregator.compute_portfolio_risk(quantified, correlations),
         {:ok, mitigations} <- MitigationPlanner.develop(quantified, correlations) do
      assessment = %{
        risk_register: quantified,
        correlations: correlations,
        aggregate_score: aggregate,
        mitigations: mitigations,
        within_bounds: aggregate.score <= @max_acceptable_aggregate_risk,
        confidence: compute_assessment_confidence(quantified),
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
| [ma-financial-analyst](/agents/ma-financial-analyst/) | Receives financial risk indicators and anomaly flags | Inbound |
| [ma-tech-assessor](/agents/ma-tech-assessor/) | Consumes technology risk scores and technical debt indicators | Inbound |
| [ma-market-analyst](/agents/ma-market-analyst/) | Market concentration risk and competitive threat intelligence | Inbound |
| [ma-enforcement-commander](/agents/ma-enforcement-commander/) | Risk profiles inform enforcement gate evaluation | Outbound |
| [ma-integration-planner](/agents/ma-integration-planner/) | Risk mitigations feed contingency planning | Outbound |
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Assessment pipeline [metrics](/glossary/metrics/) and event tracking | Outbound |
| [SEADF](/glossary/seadf/) | Self-healing for assessment pipeline failures | Bidirectional |

## Operational Workflow

The risk assessor follows a structured assessment workflow for each acquisition target.

**Phase 1 -- Intelligence Collection**: Gather risk-relevant intelligence from all specialist M&A agents. Validate completeness of risk input coverage across all seven categories. Identify intelligence gaps that limit assessment confidence.

**Phase 2 -- Risk Identification**: Apply structured taxonomies and anomaly detection to identify risks across all categories. Each identified risk is tagged with its category, source intelligence, and preliminary severity estimate.

**Phase 3 -- Quantification**: Assign probability and impact scores to each identified risk using Bayesian models calibrated against historical M&A data. Compute expected value and worst-case exposure for each risk.

**Phase 4 -- Correlation Analysis**: Model risk interactions across categories, identifying amplification effects and dependency chains. Produce correlation matrix and risk cluster visualization.

**Phase 5 -- Mitigation Planning**: Develop structured mitigation strategies for all risks above acceptable thresholds. Link mitigations to integration plan activities and estimate residual risk after mitigation.

**Phase 6 -- Portfolio Assessment**: Compute aggregate portfolio risk accounting for correlations. Produce risk-adjusted deal recommendations with explicit confidence levels.

## NABLA Compliance

| Axiom | Risk Assessment Application |
|-------|----------------------------|
| Signal Plurality | Every risk identification requires evidence from minimum two independent sources |
| Contradiction Preservation | Conflicting risk signals across domains are preserved and analyzed |
| Absence Informative | Missing risk intelligence for a category reduces assessment confidence |
| Time Decay | Risk assessments carry timestamps; risk intelligence expires after configurable intervals |
| Unknown Valid | Explicit uncertainty ranges on probability and impact estimates |
| Source Independence | Independent risk sources weighted higher than correlated assessments |
| Provenance Mandatory | Every risk finding carries full evidence chain traceability |

All risk conclusions must pass [Trinity Gate](/glossary/trinity-gate/) validation before informing deal decisions.

## Configuration

```elixir
config :prismatic_ma, Prismatic.MA.RiskAssessor,
  assessment_timeout_ms: 120_000,
  risk_categories: [:financial, :legal, :operational, :technical, :regulatory, :reputational, :cyber],
  max_aggregate_risk: 0.85,
  min_source_count: 2,
  correlation_threshold: 0.30,
  mitigation_coverage: :comprehensive,
  telemetry_prefix: [:prismatic, :ma, :risk]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_aggregate_risk` | 0.85 | Maximum acceptable portfolio risk score |
| `min_source_count` | 2 | Minimum sources per risk identification (NABLA) |
| `correlation_threshold` | 0.30 | Minimum correlation coefficient for cross-category analysis |
| `mitigation_coverage` | `:comprehensive` | Depth of mitigation strategy development |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full risk assessment | < 90s | 48s (P95) |
| Risk identification | < 20s | 12s (P95) |
| Quantification | < 15s | 8s (P95) |
| Correlation analysis | < 30s | 16s (P95) |
| Portfolio aggregation | < 5s | 2.1s (P95) |
| Concurrent target capacity | 20+ | 25 tested |

## Related Resources

- [ma-enforcement-commander](/agents/ma-enforcement-commander/) -- Consumes risk profiles for gate evaluation
- [ma-financial-analyst](/agents/ma-financial-analyst/) -- Financial risk input provider
- [ma-tech-assessor](/agents/ma-tech-assessor/) -- Technology risk input provider
- [ma-market-analyst](/agents/ma-market-analyst/) -- Market risk input provider
- [ma-integration-planner](/agents/ma-integration-planner/) -- Risk mitigation integration
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework for evidence-based risk assessment
- [Trinity Gate](/glossary/trinity-gate/) -- Three-layer validation for risk conclusions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)