+++
title = "osint-pattern-propagator"
weight = 286
[extra]
domain = "osint-architecture"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "easm", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "attack-surface", "no-doubts"]
domain_normalized = "osint"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-pattern-propagator", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "OSINT", "Pattern", "Quality", "Strategic Command"]
tags = ["agents", "agent", "osint-pattern-propagator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "osint-pattern-propagator - Prismatic Platform"
+++

## Overview

The osint-pattern-propagator operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's OSINT architecture domain, responsible for identifying, codifying, and propagating successful intelligence collection and analysis patterns across the [OSINT](/glossary/osint/) agent ecosystem. This agent functions as the institutional memory and knowledge distribution mechanism for OSINT operations, ensuring that effective techniques discovered by individual agents are systematically shared and adapted for use across the entire intelligence collection apparatus.

Built on the [AIAD](/glossary/aiad/) standard and leveraging the [mycelial network](/glossary/mycelial-network/) for pattern distribution, the propagator maintains a pattern library that catalogs proven OSINT techniques with their applicability conditions, success rates, and adaptation guidelines. The [SEADF](/glossary/seadf/) evolutionary framework provides the feedback loop: patterns that consistently improve intelligence quality propagate more widely, while patterns that underperform are deprecated and replaced. The [NABLA Infinity](/glossary/nabla-infinity/) framework ensures pattern effectiveness claims are evidence-backed.

## Operational Domain

The OSINT pattern architecture domain sits above individual collection disciplines, operating at the meta-level of intelligence methodology. The agent monitors the effectiveness of collection techniques, analysis frameworks, and source exploitation strategies across all OSINT agents, identifying patterns that generalize beyond their original context. Pattern propagation follows a staged model: discovery in a single agent, validation across multiple operations, codification into the pattern library, and dissemination through the mycelial network.

| Pattern Category | Description | Propagation Scope |
|-----------------|-------------|-------------------|
| Collection Patterns | Effective search strategies, query templates | All OSINT collection agents |
| Correlation Patterns | Entity linking heuristics, cross-source matching | Entity resolution agents |
| Analysis Patterns | Analytical frameworks, assessment methodologies | All analytical agents |
| Source Patterns | Source reliability indicators, access methods | Source management agents |
| Evasion Patterns | Counter-detection techniques, OPSEC methods | Tactical OSINT agents |
| Quality Patterns | Quality indicators, validation techniques | Quality feedback agents |

## Key Capabilities

- **Pattern discovery** -- Monitors OSINT agent telemetry to identify collection and analysis techniques that consistently produce high-quality intelligence, extracting generalizable patterns from specific operational successes
- **Pattern codification** -- Formalizes discovered patterns into structured specifications that include applicability conditions, required inputs, expected outputs, success metrics, and known limitations
- **Adaptive propagation** -- Distributes patterns through the [mycelial network](/glossary/mycelial-network/) with context-aware adaptation, modifying pattern parameters based on the receiving agent's domain and capabilities
- **Effectiveness tracking** -- Monitors the success rate of propagated patterns across the agent ecosystem, identifying which patterns transfer effectively and which require domain-specific adaptation
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed pattern discovery cycles based on telemetry analysis
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing pattern discovery rates, propagation success metrics, and ecosystem effectiveness indicators

## Pattern Propagation Engine

```elixir
defmodule Prismatic.OSINT.PatternPropagator do
  @moduledoc """
  Discovers, codifies, and propagates successful OSINT patterns
  across the intelligence agent ecosystem via mycelial network.
  """

  alias Prismatic.OSINT.{PatternLibrary, TelemetryAnalyzer, MycelialBroadcast}

  @type pattern :: %{
    id: String.t(),
    name: String.t(),
    category: atom(),
    applicability: [condition()],
    technique: map(),
    success_rate: float(),
    propagation_count: non_neg_integer(),
    discovered_by: atom(),
    validated: boolean()
  }

  @spec discover_patterns(time_window :: pos_integer()) :: {:ok, [pattern()]}
  def discover_patterns(window_hours \\ 24) do
    telemetry_data = TelemetryAnalyzer.collect_osint_metrics(window_hours)

    candidates =
      telemetry_data
      |> identify_high_performers()
      |> extract_technique_signatures()
      |> filter_generalizable()
      |> deduplicate_against_library()

    validated =
      Enum.map(candidates, fn candidate ->
        case validate_pattern(candidate) do
          {:ok, validated} -> validated
          {:error, _} -> nil
        end
      end)
      |> Enum.reject(&is_nil/1)

    Enum.each(validated, &PatternLibrary.register/1)
    {:ok, validated}
  end

  @spec propagate(pattern(), target_agents :: [atom()]) :: :ok
  def propagate(pattern, target_agents) do
    adapted_patterns =
      Enum.map(target_agents, fn agent ->
        adapted = adapt_for_agent(pattern, agent)
        {agent, adapted}
      end)

    Enum.each(adapted_patterns, fn {agent, adapted} ->
      MycelialBroadcast.send(agent, :pattern_update, adapted)
    end)

    :telemetry.execute(
      [:prismatic, :osint, :pattern, :propagated],
      %{targets: length(target_agents)},
      %{pattern_id: pattern.id, category: pattern.category}
    )

    :ok
  end
end
```

## Pattern Lifecycle

| Stage | Activity | Validation |
|-------|----------|-----------|
| 1. Discovery | Telemetry analysis identifies effective technique | Statistical significance test |
| 2. Extraction | Technique signature isolated from operational context | Generalizability assessment |
| 3. Codification | Formal pattern specification created | Peer agent validation |
| 4. Pilot | Pattern tested in 2-3 agents outside discovery context | Success rate measurement |
| 5. Propagation | Pattern distributed through mycelial network | Adaptation verification |
| 6. Monitoring | Effectiveness tracked across all adopting agents | Continuous performance review |
| 7. Evolution | Pattern parameters refined based on ecosystem feedback | Version management |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to define OSINT methodology standards and propagate patterns across the intelligence agent ecosystem.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/osint-pattern discover` | Run pattern discovery cycle across recent OSINT telemetry | L3+ |
| `/osint-pattern library` | Display cataloged patterns with success rates and propagation status | L3+ |
| `/osint-pattern propagate` | Manually trigger pattern propagation to specified agent set | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [osint-quality-feedback-coordinator](/agents/osint-quality-feedback-coordinator/) | Quality metrics inform pattern effectiveness evaluation |
| [osint-engines-specialist](/agents/osint-engines-specialist/) | Collection patterns propagated to search engine orchestration |
| [osint-digital-profile-specialist](/agents/osint-digital-profile-specialist/) | Profiling patterns shared for cross-platform correlation improvement |
| [evolution-orchestrator-supreme](/agents/evolution-orchestrator-supreme/) | Pattern propagation integrated with platform evolution pipeline |

## GARDEN Legacy Patterns

The propagator maintains a curated set of patterns extracted from the [GARDEN](/glossary/garden/) legacy knowledge base, representing 20+ years of OSINT operational experience. These battle-tested patterns from the `sig` repository's 250+ OSINT providers serve as the foundation pattern library, supplemented by patterns discovered through the platform's autonomous operations. Legacy pattern adaptation ensures that proven techniques remain effective in the current operational environment.

## Pattern Discovery Methodology

The propagator uses a structured methodology to discover patterns from OSINT operational telemetry. The discovery process begins with telemetry aggregation: operational metrics from all OSINT agents are collected for a configurable analysis window (default 24 hours). Metrics include collection success rates, result relevance scores, source response times, and consumer satisfaction signals.

From the aggregated telemetry, the propagator identifies "high performers" -- specific collection techniques, query formulations, or analysis approaches that produced statistically significantly better results than the baseline. Statistical significance is determined using a two-sample t-test against historical performance, requiring a p-value below 0.05 for a technique to qualify as a candidate pattern.

Candidate patterns undergo a generalizability assessment: the propagator evaluates whether the technique's success depends on specific context (a particular target type, source, or domain) or whether it transfers to broader operational contexts. Techniques that are highly context-dependent are noted but not propagated broadly; instead, they are tagged with their applicability conditions and propagated only to agents operating in matching contexts.

## Pattern Versioning and Deprecation

Patterns in the library are versioned and subject to lifecycle management. When a pattern is first codified, it enters version 1.0 with a "pilot" status. After successful validation across 3+ independent operations, it graduates to "validated" status. Patterns whose effectiveness degrades below statistical thresholds over a rolling evaluation window are automatically deprecated, and agents that adopted the pattern receive deprecation notices through the [mycelial network](/glossary/mycelial-network/).

Pattern versioning supports evolution: when an existing pattern is refined through operational feedback, the updated version is published alongside the original, with agents gradually migrating to the newer version based on A/B testing results that confirm the improvement. This prevents disruptive "big bang" pattern changes that could simultaneously affect multiple agents' operational effectiveness.

## Cross-Domain Pattern Transfer

Some of the most valuable patterns are those that transfer across domain boundaries. A correlation technique developed for digital profiling may prove equally effective for entity resolution in legal records. A query optimization discovered for search engine orchestration may improve collection efficiency for social media intelligence. The propagator actively monitors for cross-domain transfer opportunities by comparing pattern technique signatures across categories. When structural similarity is detected between a successful pattern in one domain and an underperforming approach in another domain, the propagator initiates a cross-domain transfer pilot to evaluate whether the pattern's success generalizes across the domain boundary.

Cross-domain transfer is one of the highest-value activities the propagator performs because it enables the OSINT ecosystem to benefit from insights generated in any single operational context. The [GARDEN](/glossary/garden/) legacy knowledge base contributes particularly valuable cross-domain patterns, as many of the techniques refined over 20+ years of OSINT operations embody principles that transcend specific collection disciplines.

## Enforcement

All pattern propagation complies with the [NO MERCY](/glossary/no-mercy/) doctrine: no pattern enters the library without statistical validation across multiple operations, underperforming patterns are automatically deprecated, and propagation targets are verified for compatibility before distribution. The [NO DOUBTS](/glossary/no-doubts/) principle requires that pattern effectiveness claims are backed by measured success rates with confidence intervals. [Trinity Gate](/glossary/trinity-gate/) validates pattern consistency before ecosystem-wide propagation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)