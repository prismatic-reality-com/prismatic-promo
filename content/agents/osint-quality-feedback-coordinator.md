+++
title = "osint-quality-feedback-coordinator"
weight = 287
[extra]
domain = "general"
level = "L3"
description = "This agent propagates quality patterns to:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "osint", "cascade"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-quality-feedback-coordinator", "agent", "propagates", "quality", "patterns", "agents", "Prismatic Platform", "OSINT", "Source"]
tags = ["agents", "agent", "osint-quality-feedback-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "osint-quality-feedback-coordinator - Prismatic Platform"
+++

## Overview

The osint-quality-feedback-coordinator operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform, serving as the bridge between [OSINT](/glossary/osint/) intelligence quality [metrics](/glossary/metrics/) and the platform's broader quality management infrastructure. This agent monitors the accuracy, completeness, timeliness, and relevance of intelligence outputs produced by OSINT collection agents, feeding quality signals back into the evolutionary pipeline to drive continuous improvement. Without this feedback loop, OSINT agents would operate without awareness of whether their outputs meet consumer expectations.

Built on the [AIAD](/glossary/aiad/) standard, this agent propagates quality patterns across the OSINT agent ecosystem through the [mycelial network](/glossary/mycelial-network/). When a quality pattern is identified -- whether positive (a collection technique that consistently produces high-value intelligence) or negative (a source that exhibits systematic accuracy degradation) -- the coordinator disseminates this knowledge to all relevant agents through [SEADF](/glossary/seadf/) feedback channels. The [NO MERCY](/glossary/no-mercy/) doctrine applies to quality standards: OSINT agents that consistently produce below-threshold quality trigger mandatory remediation cycles.

## Operational Domain

The quality feedback domain spans all OSINT collection, analysis, and reporting operations. The coordinator monitors output quality across dimensions including data accuracy (verifiable against ground truth), completeness (information gaps identified), timeliness (age of intelligence relative to need), and relevance (signal-to-noise ratio in produced intelligence). Quality metrics are tracked per agent, per source, and per intelligence type to identify systemic patterns.

| Quality Dimension | Measurement Method | Target Threshold |
|------------------|-------------------|-----------------|
| Accuracy | Ground truth validation, cross-source verification | > 95% for confirmed findings |
| Completeness | Gap analysis against intelligence requirements | > 80% requirement satisfaction |
| Timeliness | Intelligence age vs. consumer time sensitivity | < 24 hours for operational intel |
| Relevance | Signal-to-noise ratio in produced output | > 70% relevant content |
| Source Reliability | Historical accuracy tracking per source | Dynamic, Bayesian-updated |
| Consistency | Cross-agent agreement on overlapping findings | > 90% convergence rate |

## Key Capabilities

- **Quality metric collection** -- Aggregates quality signals from intelligence consumers, validation pipelines, and automated accuracy checks to build comprehensive quality profiles for each OSINT agent and source
- **Pattern propagation** -- Disseminates identified quality patterns (both positive best practices and negative anti-patterns) across the OSINT agent ecosystem through [CASCADE](/glossary/cascade/) channels
- **Source reliability scoring** -- Maintains dynamic reliability scores for intelligence sources based on historical accuracy, consistency, and timeliness, informing source selection priorities
- **Remediation trigger** -- Initiates mandatory quality improvement cycles for OSINT agents whose output quality falls below defined thresholds, escalating persistent degradation
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed quality monitoring cycles and adaptive threshold management
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing quality metrics under OSINT-specific telemetry namespaces

## Quality Feedback Pipeline

```elixir
defmodule Prismatic.OSINT.QualityFeedback do
  @moduledoc """
  Collects, analyzes, and propagates quality feedback signals
  across the OSINT agent ecosystem to drive continuous improvement.
  """

  alias Prismatic.OSINT.{QualityMetrics, SourceScorer, RemediationEngine}

  @type quality_report :: %{
    agent_id: atom(),
    period: {DateTime.t(), DateTime.t()},
    accuracy: float(),
    completeness: float(),
    timeliness: float(),
    relevance: float(),
    overall_score: float(),
    trend: :improving | :stable | :degrading
  }

  @spec evaluate_agent(atom(), pos_integer()) :: {:ok, quality_report()} | {:error, term()}
  def evaluate_agent(agent_id, window_hours \\ 168) do
    metrics = QualityMetrics.collect(agent_id, window_hours)

    report = %{
      agent_id: agent_id,
      period: {metrics.start_time, metrics.end_time},
      accuracy: metrics.accuracy_rate,
      completeness: metrics.completeness_rate,
      timeliness: metrics.timeliness_rate,
      relevance: metrics.relevance_rate,
      overall_score: calculate_overall(metrics),
      trend: calculate_trend(agent_id, metrics)
    }

    if report.overall_score < quality_threshold(agent_id) do
      RemediationEngine.trigger(agent_id, report)
    end

    emit_quality_telemetry(report)
    {:ok, report}
  end

  @spec update_source_reliability(String.t(), feedback()) :: :ok
  def update_source_reliability(source_id, feedback) do
    SourceScorer.bayesian_update(source_id, feedback)
    propagate_source_score(source_id)
    :ok
  end

  defp calculate_overall(metrics) do
    metrics.accuracy_rate * 0.35 +
    metrics.completeness_rate * 0.25 +
    metrics.timeliness_rate * 0.20 +
    metrics.relevance_rate * 0.20
  end
end
```

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to trigger quality remediation across OSINT agents and adjust source reliability weights.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/osint-quality status` | Display current quality metrics across OSINT agent ecosystem | L3+ |
| `/osint-quality sources` | Show source reliability scores and trend indicators | L3+ |
| `/osint-quality remediate` | Trigger quality remediation cycle for underperforming agents | L3+ |

## Quality Remediation Protocol

| Degradation Level | Trigger | Response | Escalation |
|------------------|---------|----------|-----------|
| Minor (5-10% below target) | Single metric below threshold | Warning + parameter adjustment | Agent self-correction |
| Moderate (10-20% below target) | Multiple metrics below threshold | Mandatory technique review | L3 coordinator intervention |
| Severe (> 20% below target) | Persistent degradation (3+ periods) | Source restriction + retrain | L2 escalation to evolution |
| Critical (systemic) | Multiple agents degrading simultaneously | Ecosystem-wide audit | L1 supreme authority review |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [code-quality-commander](/agents/code-quality-commander/) | Aligns OSINT quality standards with platform-wide quality governance |
| [linkedin-intelligence-specialist](/agents/linkedin-intelligence-specialist/) | Monitors and scores LinkedIn intelligence output quality |
| [reddit-intelligence-specialist](/agents/reddit-intelligence-specialist/) | Monitors and scores Reddit intelligence output quality |
| [osint-pattern-propagator](/agents/osint-pattern-propagator/) | Quality signals inform pattern effectiveness evaluation |
| [session-debrief-specialist](/agents/session-debrief-specialist/) | Quality observations are captured in session debrief artifacts |

## Source Reliability Model

The quality feedback coordinator maintains a Bayesian source reliability model that continuously updates reliability estimates based on observed accuracy. Each source starts with a prior reliability score based on the source category (official government databases receive high priors, user-generated content receives moderate priors, anonymous sources receive low priors). As intelligence from each source is validated against ground truth or corroborated by independent sources, the posterior reliability estimate is updated using Bayes' theorem.

The Bayesian approach provides several advantages over simple accuracy tracking. It naturally handles the cold-start problem (new sources with few observations are assigned appropriately uncertain reliability estimates rather than misleading perfect or zero scores). It incorporates the base rate of accuracy for the source category, preventing a single accurate result from a generally unreliable source category from inflating the reliability estimate. And it produces full probability distributions rather than point estimates, enabling the coordinator to communicate not just "how reliable is this source" but "how confident are we in our reliability estimate."

## Quality Dimension Weighting

The coordinator's overall quality score is a weighted combination of four dimensions: accuracy (35%), completeness (25%), timeliness (20%), and relevance (20%). These weights reflect the relative importance of each dimension for intelligence consumer satisfaction and are calibrated through historical analysis of which quality dimensions most strongly predict downstream consumer feedback scores.

The weights are not fixed -- they can be adjusted per intelligence type. For time-sensitive operational intelligence, the timeliness weight increases to 35% while completeness decreases to 15%. For due diligence reports where thoroughness is paramount, completeness increases to 35% while timeliness decreases to 10%. The coordinator automatically selects the appropriate weighting scheme based on the intelligence product type being evaluated.

## Quality Threshold Calibration

Quality thresholds are not static values. The coordinator implements adaptive threshold management that adjusts targets based on the maturity and operational context of each OSINT agent. Newly deployed agents receive initial grace periods with lower thresholds (typically 70% of the standard target) that gradually increase to full enforcement over their first 30 days of operation. Agents operating in novel domains where collection techniques are still being refined may receive temporarily adjusted thresholds pending pattern stabilization.

Threshold calibration also accounts for source quality variability. Agents that rely heavily on volatile sources (social media, user-generated content) receive slightly lower accuracy thresholds than agents that consume stable, structured sources (government databases, official registries). This recognition of inherent source-quality differences prevents unfair penalization of agents operating in challenging collection environments.

## Feedback Loop Architecture

The quality feedback coordinator implements a closed-loop feedback architecture that connects intelligence consumers back to intelligence producers. Consumer feedback is collected through structured evaluation forms that rate intelligence products on each quality dimension. This feedback flows through the coordinator to the producing agent as a quality signal, enabling the agent to adjust its collection and analysis techniques. The feedback loop has a typical latency of 24-48 hours from product delivery to producer feedback receipt, enabling rapid quality correction.

The feedback loop also connects to the [SEADF](/glossary/seadf/) evolutionary framework. Quality trends over time -- whether an agent's output quality is improving, stable, or degrading -- feed into the evolutionary fitness function for OSINT agents. Agents with consistently improving quality receive higher fitness scores, which influences resource allocation and task priority decisions in the platform's evolutionary cycle.

## Enforcement

Quality standards are enforced under the [NO MERCY](/glossary/no-mercy/) doctrine. OSINT agents operating below quality thresholds receive mandatory remediation directives. Source reliability scores are evidence-based per [NO DOUBTS](/glossary/no-doubts/), and all quality assessments carry [NABLA Infinity](/glossary/nabla-infinity/) provenance chains with [time decay](/glossary/time-decay/) applied to historical quality metrics. Quality scoring algorithms are validated through the [Trinity Gate](/glossary/trinity-gate/) to ensure structural, logical, and formal consistency.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)