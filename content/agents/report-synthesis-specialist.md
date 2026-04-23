+++
title = "report-synthesis-specialist"
weight = 353
[extra]
domain = "investigations"
level = "L3"
description = "Synthesizes actionable intelligence reports from IR (Intermediate Result) artifacts"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "seadf", "telemetry"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1850
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["report-synthesis-specialist", "Synthesizes", "Intermediate", "Result", "agents", "agent", "Prismatic Platform", "Contradiction", "Entity", "High"]
tags = ["agents", "agent", "report-synthesis-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "report-synthesis-specialist - Prismatic Platform"
+++

## Overview

The report-synthesis-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's investigations domain, synthesizing actionable intelligence reports from Intermediate Result (IR) artifacts produced by the platform's diverse collection of intelligence-gathering agents. Raw intelligence data -- entity records, relationship graphs, risk scores, reputation signals, financial indicators -- has limited value in isolation. This agent transforms that raw data into structured, contextualized intelligence reports that support decision-making by presenting findings with explicit confidence levels, source attribution, and actionable recommendations.

The synthesis process is not mere aggregation. It involves identifying patterns across disparate data sources, resolving contradictions between intelligence signals, establishing narrative coherence across temporal sequences of events, and producing confidence-weighted conclusions that account for information quality, source reliability, and analytical uncertainty. The specialist produces reports that an analyst or decision-maker can consume without needing to understand the underlying collection methodology or navigate raw data formats.

Built on the [AIAD](@/glossary/aiad.md) standard and deeply integrated with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, the report-synthesis-specialist applies all seven axioms to the synthesis process. [Signal plurality](@/glossary/signal-plurality.md) requires that report conclusions draw from multiple independent sources. [Contradiction preservation](@/glossary/contradiction-preservation.md) ensures that conflicting intelligence signals are presented transparently rather than silently resolved. [Time decay](@/glossary/time-decay.md) applies temporal weighting to source data, ensuring that older intelligence receives appropriate discounting in current assessments.

## Synthesis Pipeline Architecture

The report synthesis pipeline operates through four structured phases that transform raw IR artifacts into polished intelligence products.

**Collection aggregation** gathers all IR artifacts relevant to the report's subject from the platform's storage infrastructure. This includes entity records from [KuzuDB](@/glossary/kuzudb.md) graph storage, structured data from [PostgreSQL](@/glossary/postgresql.md) operational storage, risk scores from the risk assessment pipeline, and [OSINT](@/glossary/osint.md) collection results from intelligence-gathering agents. The aggregation phase applies relevance filtering to exclude artifacts that fall outside the report's scope while ensuring comprehensive coverage within scope.

**Cross-source analysis** examines the aggregated artifacts for patterns, correlations, and contradictions. [Entity resolution](@/glossary/entity-resolution.md) ensures that references to the same real-world entity across different sources are correctly identified and merged. Temporal analysis sequences events to establish causal narratives. Contradiction detection identifies cases where different sources provide conflicting information about the same fact.

**Confidence assessment** evaluates the strength of each finding based on source reliability, source independence, corroboration count, and temporal freshness. Findings supported by multiple independent, reliable, recent sources receive high confidence scores. Findings based on single sources, older data, or sources with known reliability issues receive lower confidence scores. The assessment is transparent -- every confidence score carries an explanation of the factors that determined it.

**Report composition** assembles the analyzed findings into a structured report following the platform's intelligence report template. The composition phase writes executive summaries, detailed findings sections, evidence annexes, and recommendation sets. All claims in the report carry source attribution and confidence levels.

## Key Capabilities

- **Multi-source intelligence synthesis** -- Aggregates and analyzes intelligence from [OSINT](@/glossary/osint.md) collectors, risk assessors, reputation monitors, and financial analysts into unified intelligence products
- **Contradiction-preserving reporting** -- Surfaces conflicting intelligence signals transparently with explicit notation of the conflict, source attribution for each position, and analytical assessment of relative credibility
- **Confidence-scored findings** -- Every finding, conclusion, and recommendation carries explicit confidence scores with traceable factor explanations
- **Temporal narrative construction** -- Sequences intelligence across time to establish event chronologies, identify inflection points, and detect trend changes
- **[Entity resolution](@/glossary/entity-resolution.md) integration** -- Resolves entity references across multiple sources to produce unified entity profiles within reports
- **Evidence chain management** -- Maintains complete provenance chains from raw source data through intermediate analysis to final report conclusions
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with triggered report generation when sufficient new intelligence accumulates
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for synthesis pipeline latency and report quality metric tracking

## Report Structure Template

| Section | Content | Confidence Required |
|---------|---------|-------------------|
| **Executive Summary** | Key findings, risk assessment, recommended actions | High (>0.85) |
| **Subject Profile** | Entity identification, background, key relationships | High (>0.85) |
| **Detailed Findings** | Evidence-backed analytical findings with source attribution | Medium (>0.65) |
| **Risk Assessment** | Quantified risk evaluation across relevant dimensions | Medium (>0.65) |
| **Contradictions** | Explicitly noted conflicting signals with analytical commentary | N/A (all noted) |
| **Evidence Annex** | Raw source citations and evidence chain documentation | N/A (complete) |
| **Recommendations** | Actionable recommendations ranked by priority and confidence | High (>0.85) |

## Implementation Architecture

```elixir
defmodule PrismaticIntel.ReportSynthesizer do
  @moduledoc """
  Intelligence report synthesis engine transforming IR artifacts
  into structured, confidence-scored intelligence products.
  """

  alias PrismaticIntel.{Aggregator, Analyzer, ConfidenceEngine, Composer}

  @type report :: %{
    id: String.t(),
    subject: String.t(),
    classification: atom(),
    sections: [section()],
    overall_confidence: float(),
    source_count: non_neg_integer(),
    contradictions: [contradiction()]
  }

  @type section :: %{
    title: String.t(),
    findings: [finding()],
    confidence: float()
  }

  @type finding :: %{
    statement: String.t(),
    evidence: [evidence()],
    confidence: float(),
    sources: [String.t()]
  }

  @spec synthesize(String.t(), keyword()) :: {:ok, report()} | {:error, term()}
  def synthesize(subject, opts \\ []) do
    with {:ok, artifacts} <- Aggregator.collect(subject, opts),
         {:ok, analysis} <- Analyzer.cross_source(artifacts),
         {:ok, scored} <- ConfidenceEngine.assess(analysis),
         {:ok, report} <- Composer.compose(scored, opts) do
      {:ok, report}
    end
  end
end
```

## Confidence Scoring Model

| Factor | Weight | Description |
|--------|--------|-------------|
| **Source Count** | 30% | Number of independent sources supporting the finding |
| **Source Reliability** | 25% | Historical accuracy track record of each source |
| **Source Independence** | 20% | Degree of editorial independence between sources |
| **Temporal Freshness** | 15% | Recency of source data relative to report date |
| **Corroboration Depth** | 10% | Specificity of corroboration (exact vs. directional) |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to access intelligence artifacts from all collection agents, synthesize cross-domain findings, and publish intelligence reports.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/report synthesize` | Generate intelligence report for a specified subject | L3+ |
| `/report status` | Display report pipeline status and queue depth | L3+ |
| `/report template` | Configure report template and section requirements | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [risk-assessment-commander](@/agents/risk-assessment-commander.md) | Risk scores integrated into report risk assessment sections |
| [reputation-risk-specialist](@/agents/reputation-risk-specialist.md) | Reputation signals synthesized into entity profiles |
| [risk-intelligence-commander](@/agents/risk-intelligence-commander.md) | Strategic context shapes report framing and recommendations |
| [pricing-strategist](@/agents/pricing-strategist.md) | Pricing intelligence products included in commercial reports |
| [primary-identity-verification-commander](@/agents/primary-identity-verification-commander.md) | Verified entity identities anchor report subject profiles |

## Enforcement

Report synthesis complies with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no reports are published with incomplete source attribution, missing confidence scores, or suppressed contradictions. The [NO DOUBTS](@/glossary/no-doubts.md) principle mandates that every claim in a report is traceable to specific evidence. The [Trinity Gate](@/glossary/trinity-gate.md) validates report structural consistency (all sections present), logical consistency (conclusions follow from evidence), and formal completeness (all required metadata present).

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)