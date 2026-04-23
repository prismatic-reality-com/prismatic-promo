+++
title = "societies-quality-feedback-coordinator"
weight = 378
[extra]
domain = "general"
level = "L3"
description = "This is the quality hub that connects all domains:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 138
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["societies-quality-feedback-coordinator", "quality", "connects", "domains", "agents", "agent", "Prismatic Platform", "High", "Medium", "Critical"]
tags = ["agents", "agent", "societies-quality-feedback-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "societies-quality-feedback-coordinator - Prismatic Platform"
+++

## Overview

The Societies Quality Feedback Coordinator is an L3 agent operating in the **general** domain of the Prismatic Platform. This agent serves as the quality hub that connects all domains within the platform's epistemic society architecture, aggregating quality feedback signals from every operational domain and routing them to the appropriate remediation agents. The coordinator ensures that quality insights discovered in one domain are propagated to all other domains where they may be relevant, creating a platform-wide quality feedback loop that continuously elevates standards.

The concept of "epistemic societies" in the Prismatic Platform refers to the self-organizing groups of agents that collaborate within and across domains to maintain and improve the collective intelligence of the system. Quality feedback is the connective tissue of these societies -- without it, domains become isolated silos where quality improvements in one area never benefit others. The Societies Quality Feedback Coordinator prevents this fragmentation by maintaining a bidirectional flow of quality intelligence across all domain boundaries.

This agent is part of the platform's 434-strong autonomous agent ecosystem, enforcing the [NO MERCY](@/glossary/no-mercy.md) doctrine's zero-tolerance quality standards through cross-domain feedback synthesis.

## Quality Feedback Architecture

The coordinator maintains a hub-and-spoke architecture where each domain contributes quality signals and receives quality directives.

```
Intelligence Domain ──┐
Architecture Domain ──┤
Security Domain ──────┤
Quality Domain ───────┼──> Societies Quality Feedback Coordinator ──> Quality Directives
Development Domain ───┤                                               Improvement Plans
Social Domain ────────┤                                               Cross-Domain Alerts
Epistemic Domain ─────┘
```

| Domain | Signal Types | Feedback Volume | Priority |
|--------|-------------|-----------------|----------|
| **Quality Assurance** | Test coverage, Credo, Dialyzer results | High | Critical |
| **Architecture** | Design violations, pattern compliance | Medium | High |
| **Security** | Vulnerability detections, compliance gaps | Medium | Critical |
| **Intelligence** | Data quality, source reliability | High | Medium |
| **Development** | Build metrics, development velocity | High | Medium |
| **Epistemic** | Reasoning accuracy, confidence calibration | Low | High |

## Core Responsibilities

| Responsibility | Description | Frequency |
|---------------|-------------|-----------|
| **Signal Aggregation** | Collect quality signals from all domain agents | Continuous |
| **Pattern Detection** | Identify cross-domain quality patterns | Every 10 minutes |
| **Feedback Routing** | Route quality insights to relevant domains | Real-time |
| **Trend Analysis** | Track quality trajectory across the platform | Hourly |
| **Escalation Management** | Escalate critical quality issues to Strategic Command | As needed |
| **Improvement Planning** | Generate coordinated improvement plans | Daily |
| **Society Health** | Monitor epistemic society cohesion metrics | Every 30 minutes |

## Technical Implementation

```elixir
defmodule PrismaticAgents.SocietiesQualityFeedbackCoordinator do
  @moduledoc """
  L3 Societies Quality Feedback Coordinator.
  Cross-domain quality hub connecting all epistemic societies.
  """

  use GenServer
  require Logger

  @aggregation_interval_ms :timer.minutes(10)

  defstruct [
    :domain_signals,
    :cross_domain_patterns,
    :quality_directives,
    :last_aggregation_at,
    :society_health_score,
    status: :coordinating
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    subscribe_to_domain_telemetry()
    schedule_aggregation()
    {:ok, %__MODULE__{domain_signals: %{}, cross_domain_patterns: []}}
  end

  @impl true
  def handle_info(:aggregate, state) do
    patterns = detect_cross_domain_patterns(state.domain_signals)
    directives = generate_quality_directives(patterns)
    health = calculate_society_health(state.domain_signals)

    Enum.each(directives, &dispatch_directive/1)

    :telemetry.execute(
      [:prismatic, :agents, :societies_quality, :aggregation],
      %{patterns_detected: length(patterns), directives_issued: length(directives)},
      %{society_health: health}
    )

    schedule_aggregation()

    {:noreply, %{state |
      cross_domain_patterns: patterns,
      quality_directives: directives,
      society_health_score: health,
      last_aggregation_at: DateTime.utc_now()
    }}
  end

  @impl true
  def handle_info({:quality_signal, domain, signal}, state) do
    updated_signals =
      Map.update(state.domain_signals, domain, [signal], fn existing ->
        [signal | Enum.take(existing, 99)]
      end)

    {:noreply, %{state | domain_signals: updated_signals}}
  end

  defp subscribe_to_domain_telemetry do
    :telemetry.attach_many(
      "societies-quality-feedback",
      [
        [:prismatic, :quality, :domain_check],
        [:prismatic, :agents, :quality_report],
        [:prismatic, :security, :assessment]
      ],
      &handle_telemetry_event/4,
      %{}
    )
  end
end
```

## Cross-Domain Pattern Detection

The coordinator identifies quality patterns that span multiple domains, revealing systemic issues that individual domain agents cannot detect in isolation.

| Pattern Type | Description | Example | Response |
|-------------|-------------|---------|----------|
| **Cascade Failure** | Quality drop in one domain causing drops in others | Architecture violation causing test failures | Immediate escalation |
| **Parallel Degradation** | Multiple domains degrading simultaneously | Platform-wide performance regression | Coordinated response |
| **Inverse Correlation** | Quality improvement in one domain hurting another | Optimization breaking security constraints | Trade-off analysis |
| **Latent Defect** | Issue present in signals but not yet manifesting | Growing technical debt across domains | Preventive action |
| **Recovery Pattern** | Quality improvements propagating across domains | Fix in one domain resolving issues in others | Pattern amplification |

## Quality Directive Types

When the coordinator detects cross-domain quality patterns, it generates quality directives that are dispatched to the relevant domain agents.

| Directive Type | Authority Level | Target | Urgency |
|---------------|----------------|--------|---------|
| **Immediate Fix** | Blocking | Specific agent | Critical |
| **Investigation Request** | Advisory | Domain coordinator | High |
| **Pattern Alert** | Informational | All domain coordinators | Medium |
| **Improvement Suggestion** | Advisory | Specific domain | Low |
| **Trend Warning** | Informational | Strategic Command | Medium |

## Society Health Metrics

| Metric | Description | Target | Weight |
|--------|-------------|--------|--------|
| **Signal Freshness** | Age of latest quality signal per domain | < 15 minutes | 25% |
| **Cross-Domain Coverage** | Percentage of domains reporting | 100% | 25% |
| **Pattern Resolution Rate** | Detected patterns resolved within SLA | > 95% | 25% |
| **Directive Compliance** | Quality directives acted upon | > 98% | 25% |

## Feedback Loop Architecture

The Societies Quality Feedback Coordinator implements a closed-loop feedback architecture where quality improvements in one domain trigger reassessment across all related domains. This creates a positive reinforcement cycle where improvements compound across the platform rather than remaining isolated within individual domains.

### Feedback Propagation Model

When a quality improvement is detected in one domain, the coordinator evaluates whether the improvement has implications for other domains and propagates relevant feedback signals accordingly.

```elixir
defmodule PrismaticAgents.SocietiesQualityFeedbackCoordinator.FeedbackPropagator do
  @moduledoc """
  Propagates quality feedback signals across domain boundaries.
  Implements closed-loop quality improvement cycles.
  """

  @domain_relationships %{
    quality: [:architecture, :development, :security],
    architecture: [:quality, :development, :epistemic],
    security: [:quality, :intelligence, :architecture],
    intelligence: [:security, :epistemic, :social],
    development: [:quality, :architecture],
    epistemic: [:intelligence, :architecture],
    social: [:intelligence, :security]
  }

  @spec propagate_improvement(atom(), map()) :: list(map())
  def propagate_improvement(source_domain, improvement) do
    related_domains = Map.get(@domain_relationships, source_domain, [])

    related_domains
    |> Enum.map(fn target_domain ->
      relevance = calculate_relevance(improvement, target_domain)

      if relevance > 0.3 do
        %{
          source: source_domain,
          target: target_domain,
          improvement: improvement,
          relevance: relevance,
          directive_type: determine_directive_type(relevance),
          propagated_at: DateTime.utc_now()
        }
      end
    end)
    |> Enum.reject(&is_nil/1)
  end

  defp determine_directive_type(relevance) when relevance > 0.8, do: :immediate_action
  defp determine_directive_type(relevance) when relevance > 0.5, do: :investigation
  defp determine_directive_type(_relevance), do: :informational
end
```

| Propagation Type | Trigger | Target Selection | Expected Impact |
|-----------------|---------|-----------------|-----------------|
| **Direct Impact** | Fix in one domain resolves issue in another | Domains sharing the affected component | Immediate resolution |
| **Pattern Transfer** | Quality pattern applicable across domains | Domains with similar quality profiles | Preventive improvement |
| **Trend Alert** | Quality trend detected in one domain | All domains for awareness | Proactive monitoring |
| **Cascade Prevention** | Quality drop detected that could cascade | Downstream dependent domains | Defensive posture |

## Quality Signal Taxonomy

The coordinator classifies incoming quality signals into a structured taxonomy that enables consistent processing and pattern detection across disparate domains. This taxonomy ensures that signals from different domains are comparable and can be meaningfully correlated.

| Signal Category | Signal Types | Priority Range | Example |
|----------------|-------------|----------------|---------|
| **Metric Deviation** | Score change, threshold breach, trend shift | P1-P3 | Dialyzer warning count increased |
| **Process Failure** | Build failure, test failure, gate failure | P0-P2 | Pre-commit hook rejected commit |
| **Pattern Detection** | CASCADE match, anti-pattern detected | P2-P3 | `length() > 0` anti-pattern found |
| **Improvement** | Score increase, defect elimination, optimization | P3-P4 | Memory usage reduced 20% |
| **Compliance** | AIAD compliance change, policy violation | P1-P2 | Agent spec missing required field |

## Integration Points

- [**Quality Gates**](@/capabilities/quality-gates.md) -- Feeds into platform-wide quality gate decisions
- [**Autonomous Self-Healing**](@/capabilities/autonomous-self-healing.md) -- Triggers auto-healing when cross-domain patterns detected
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Subscribes to all domain telemetry streams
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- Full agent specification compliance

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 14 rules defined |
| [Telemetry](@/glossary/telemetry.md) integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Related Agents

- [**Six Sigma Psycho Coordinator**](@/agents/six-sigma-psycho-coordinator.md) -- Apex quality enforcement agent
- [**Society Coordinator**](@/agents/society-coordinator.md) -- Epistemic society management
- [**Trinity Bridge Coordinator**](@/agents/trinity-bridge-coordinator.md) -- Formal verification quality feedback

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to issue quality directives across all platform domains.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)