+++
title = "Evolves By Necessity"
weight = 50
[extra]
tags = ["glossary", "core", "philosophy", "evolution", "design-principle", "architecture", "doctrine", "pragmatism"]
description = "Evolves By Necessity is a foundational design principle of the Prismatic Platform stating that every evolutionary change must be driven by a concrete, measurable need rather than speculation, trend-following, or premature optimization -- ensuring that the platform grows in response to real pressures, not imagined ones."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["evolution", "autoevolve", "fitness-score", "quality-gates", "no-mercy-no-doubts", "decisive-action", "evidence-over-opinion", "disciplined-approach", "pragmatism", "system-design-principle"]
key_technologies = ["Elixir", "OTP", "GenServer", "Mix Tasks"]
platform_relevance = "critical"
aliases = ["necessity-driven-evolution", "evolution-by-need"]
version = "2.0.0"
date_created = "2025-04-10"
date_updated = "2026-02-22"
word_count = 1930
date_modified = "2026-02-23"
keywords = ["Evolves", "Necessity", "Prismatic", "Platform", "glossary", "core", "Prismatic Platform", "Necessity Test"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Evolves By Necessity - Prismatic Platform"
+++

## Definition

Evolves By Necessity is a foundational design principle of the Prismatic Platform that mandates every evolutionary change must be driven by a concrete, measurable need rather than speculation, trend-following, or premature optimization. The principle states that software should grow in response to genuine operational pressures -- performance bottlenecks, security threats, quality gaps, or capability requirements -- and that every proposed change must demonstrate a clear connection between an identified need and its proposed solution.

This principle stands in deliberate opposition to two common anti-patterns in software engineering: building features "just in case" (speculative development) and adopting technologies because they are popular (trend-driven development). Both waste resources, introduce unnecessary complexity, and dilute the platform's architectural coherence. Evolves By Necessity ensures that every line of code, every architectural decision, and every new capability exists because the platform genuinely needs it, with that need verified through evidence.

The principle is deeply integrated with the NABLA Infinity epistemic framework. A proposed change is treated as a hypothesis ("the platform needs X"), and the evolution pipeline requires evidence to support that hypothesis before the change is accepted. The evidence must come from multiple independent sources (signal plurality), must be recent (time decay), and must not be contradicted by other evidence (contradiction preservation).

## Overview

The Evolves By Necessity principle emerged from the observation that most software complexity is accidental rather than essential. Systems accumulate features, abstractions, and integrations that seemed like good ideas at the time but were never validated against real operational needs. Over time, this speculative growth becomes the primary source of technical debt, maintenance burden, and architectural degradation.

The Prismatic Platform's growth from 5 apps to 115 apps, from a single generation to 19 generations, and from a handful of agents to 530+ agents was not planned in advance. Each expansion was driven by a specific, documented need:

- The AIAD agent framework (Generations 4-6) was built because manual orchestration of platform operations became a bottleneck.
- The quality gate infrastructure (Generations 7-9) was built because quality regressions were causing production incidents.
- The EASM module (Generations 16-17) was built because clients needed attack surface management capabilities.
- The OSS ecosystem (Generations 18-19) was built because community adoption required extractable, standalone packages.

In each case, the need preceded the solution. The platform did not build an agent framework because "AI agents are trending" but because operational complexity demanded automated orchestration. It did not build quality gates because "CI/CD best practices recommend them" but because real quality regressions caused real problems.

### The Necessity Test

Before any significant evolutionary change is accepted, it must pass the Necessity Test:

1. **Identified Need**: What specific, concrete problem does this change address?
2. **Evidence of Need**: What evidence demonstrates that this problem is real and significant?
3. **Impact of Inaction**: What happens if we do not make this change?
4. **Alternatives Considered**: Were simpler solutions evaluated and found insufficient?
5. **Fitness Improvement**: What measurable fitness improvement will this change produce?

Changes that cannot answer all five questions are deferred until the need crystallizes. This is not procrastination; it is disciplined resource allocation that ensures every evolutionary step moves the platform forward.

### Necessity vs. Laziness

Evolves By Necessity is frequently misunderstood as an excuse for inaction. It is the opposite. The NO MERCY, NO DOUBTS doctrine demands decisive action when a need is identified. The principle constrains _what_ is acted upon (only genuine needs), not _how_ it is acted upon (with full commitment and complete execution). Once a need passes the Necessity Test, the response is immediate and thorough. The principle eliminates wasted motion, not urgency.

## Technical Details

The Evolves By Necessity principle is enforced through the AutoEvolve pipeline and integrated with the quality gate infrastructure.

### Necessity Assessment Module

```elixir
defmodule Prismatic.AutoEvolve.NecessityAssessor do
  @moduledoc """
  Evaluates whether a proposed evolution meets the Necessity Test.
  Proposals that fail the assessment are deferred, not rejected --
  they may become necessary later as conditions change.
  """

  @type necessity_result :: %{
    passes: boolean(),
    identified_need: String.t() | nil,
    evidence_score: float(),
    inaction_risk: :low | :medium | :high | :critical,
    alternatives_evaluated: non_neg_integer(),
    expected_fitness_delta: float(),
    assessment_timestamp: DateTime.t()
  }

  @spec assess(map()) :: {:ok, necessity_result()} | {:error, term()}
  def assess(proposal) do
    with {:ok, need} <- identify_need(proposal),
         {:ok, evidence} <- gather_need_evidence(need),
         {:ok, risk} <- assess_inaction_risk(need, evidence),
         {:ok, alternatives} <- evaluate_alternatives(proposal),
         {:ok, fitness_delta} <- estimate_fitness_improvement(proposal) do
      result = %{
        passes: evidence.score >= 0.7 and risk in [:high, :critical],
        identified_need: need.description,
        evidence_score: evidence.score,
        inaction_risk: risk,
        alternatives_evaluated: length(alternatives),
        expected_fitness_delta: fitness_delta,
        assessment_timestamp: DateTime.utc_now()
      }

      {:ok, result}
    end
  end

  defp identify_need(proposal) do
    case proposal.need_statement do
      nil -> {:error, :no_need_identified}
      "" -> {:error, :empty_need_statement}
      statement -> {:ok, %{description: statement, category: categorize_need(statement)}}
    end
  end

  defp categorize_need(statement) do
    cond do
      String.contains?(statement, ["performance", "latency", "throughput"]) -> :performance
      String.contains?(statement, ["security", "vulnerability", "threat"]) -> :security
      String.contains?(statement, ["quality", "regression", "debt"]) -> :quality
      String.contains?(statement, ["capability", "feature", "requirement"]) -> :capability
      String.contains?(statement, ["architecture", "coupling", "cohesion"]) -> :architecture
      true -> :general
    end
  end

  defp gather_need_evidence(need) do
    evidence_sources = [
      &check_telemetry_data/1,
      &check_incident_history/1,
      &check_user_feedback/1,
      &check_quality_metrics/1,
      &check_security_scans/1
    ]

    evidence_items =
      evidence_sources
      |> Enum.flat_map(fn source ->
        case source.(need) do
          {:ok, items} -> items
          {:error, _} -> []
        end
      end)

    score =
      if length(evidence_items) == 0 do
        0.0
      else
        evidence_items
        |> Enum.map(& &1.weight)
        |> Enum.sum()
        |> min(1.0)
      end

    {:ok, %{items: evidence_items, score: score}}
  end

  defp assess_inaction_risk(need, evidence) do
    risk =
      cond do
        need.category == :security and evidence.score > 0.8 -> :critical
        need.category == :quality and evidence.score > 0.7 -> :high
        need.category == :performance and evidence.score > 0.7 -> :high
        evidence.score > 0.5 -> :medium
        true -> :low
      end

    {:ok, risk}
  end

  defp evaluate_alternatives(proposal) do
    alternatives = proposal[:alternatives] || []
    {:ok, alternatives}
  end

  defp estimate_fitness_improvement(proposal) do
    {:ok, proposal[:expected_fitness_delta] || 0.0}
  end

  defp check_telemetry_data(_need), do: {:ok, []}
  defp check_incident_history(_need), do: {:ok, []}
  defp check_user_feedback(_need), do: {:ok, []}
  defp check_quality_metrics(_need), do: {:ok, []}
  defp check_security_scans(_need), do: {:ok, []}
end
```

### Deferred Proposal Tracking

```elixir
defmodule Prismatic.AutoEvolve.DeferralTracker do
  @moduledoc """
  Tracks proposals that were deferred because they did not pass the
  Necessity Test. Deferred proposals are periodically re-evaluated
  as conditions change and new evidence emerges.
  """

  use GenServer

  @type deferred_proposal :: %{
    proposal: map(),
    deferred_at: DateTime.t(),
    reassessment_count: non_neg_integer(),
    last_reassessed_at: DateTime.t() | nil,
    necessity_trend: :increasing | :stable | :decreasing
  }

  @reassessment_interval_hours 168

  @spec defer(map(), map()) :: :ok
  def defer(proposal, _assessment_result) do
    GenServer.cast(__MODULE__, {:defer, proposal})
  end

  @spec reassess_all() :: {:ok, [map()]} | {:error, term()}
  def reassess_all do
    GenServer.call(__MODULE__, :reassess_all, 120_000)
  end

  @spec list_deferred() :: {:ok, [deferred_proposal()]}
  def list_deferred do
    GenServer.call(__MODULE__, :list)
  end

  @impl GenServer
  def handle_info(:periodic_reassessment, state) do
    now = DateTime.utc_now()

    promotable =
      state.deferred
      |> Enum.filter(fn dp ->
        hours_since = DateTime.diff(now, dp.deferred_at, :hour)
        hours_since >= @reassessment_interval_hours
      end)
      |> Enum.filter(fn dp ->
        case Prismatic.AutoEvolve.NecessityAssessor.assess(dp.proposal) do
          {:ok, %{passes: true}} -> true
          _ -> false
        end
      end)

    Enum.each(promotable, fn dp ->
      Prismatic.AutoEvolve.propose_evolution(dp.proposal)
    end)

    schedule_reassessment()
    {:noreply, remove_promoted(state, promotable)}
  end

  defp schedule_reassessment do
    Process.send_after(self(), :periodic_reassessment, @reassessment_interval_hours * 3_600_000)
  end

  defp remove_promoted(state, promoted) do
    promoted_ids = Enum.map(promoted, & &1.proposal.id) |> MapSet.new()
    %{state | deferred: Enum.reject(state.deferred, &(&1.proposal.id in promoted_ids))}
  end
end
```

### Integration with Quality Gates

```elixir
defmodule Prismatic.Quality.NecessityGate do
  @moduledoc """
  Quality gate that verifies evolutionary changes are necessity-driven.
  Part of the pre-commit quality pipeline.
  """

  @spec check(map()) :: :pass | {:fail, String.t()}
  def check(change) do
    case change[:necessity_assessment] do
      nil ->
        {:fail, "No necessity assessment found. Run `mix autoevolve.assess` before committing."}

      %{passes: false, inaction_risk: risk} ->
        {:fail, "Necessity test failed. Inaction risk: #{risk}. Defer this change."}

      %{passes: true} ->
        :pass
    end
  end
end
```

## Implementation

Implementing the Evolves By Necessity principle requires cultural discipline as much as technical infrastructure.

### Step 1: Need Identification

Every proposed change begins with a need statement. This is not a feature request or a wish list item. It is a concrete description of a problem observed in the platform's operation, backed by evidence. "The authentication module's P99 latency exceeds 200ms under load" is a valid need statement. "We should add GraphQL support" is not, unless accompanied by evidence of clients unable to achieve their goals with the existing REST API.

### Step 2: Evidence Gathering

The NecessityAssessor gathers evidence from multiple sources: telemetry data (performance metrics, error rates), incident history (past failures related to the need), user feedback (documented requests tied to operational impact), quality metrics (Credo scores, test coverage gaps), and security scans (vulnerability reports). At least two independent sources must support the need.

### Step 3: Alternative Evaluation

Before accepting a complex evolution, simpler alternatives must be evaluated. Can the problem be solved by configuration changes? By a smaller targeted fix? By improving documentation? Only when simpler approaches are demonstrably insufficient should a significant evolution be pursued.

### Step 4: Fitness Impact Estimation

The expected fitness improvement is estimated before the change is made and compared to the actual improvement afterward. This feedback loop calibrates the Necessity Assessor over time, improving its accuracy in predicting which changes will yield genuine improvements.

### Step 5: Execution or Deferral

Changes that pass the Necessity Test are executed immediately with full commitment (NO MERCY). Changes that fail are deferred to the DeferralTracker, which periodically re-evaluates them as conditions change. A deferred proposal is not rejected -- it is waiting for its necessity to become evident.

## Comparison

### Evolves By Necessity vs. YAGNI

| Aspect | YAGNI | Evolves By Necessity |
|--------|-------|---------------------|
| **Scope** | Individual features | Platform-wide evolution |
| **Evidence** | Developer judgment | Multi-source evidence pipeline |
| **Deferral** | Permanent (build it when needed) | Tracked and re-assessed |
| **Integration** | Code review convention | Automated quality gate |
| **Feedback** | Retrospective | Fitness measurement before/after |

YAGNI ("You Ain't Gonna Need It") is a related but simpler principle. Evolves By Necessity goes further by providing a formal assessment framework, tracking deferred proposals, and measuring the actual impact of accepted changes.

### Evolves By Necessity vs. Lean Development

Lean development's "eliminate waste" principle aligns with Evolves By Necessity, but Lean operates at the process level (eliminating wasteful activities) while Evolves By Necessity operates at the architectural level (eliminating unnecessary evolution). Lean asks "are we building this efficiently?" while Evolves By Necessity asks "should we be building this at all?"

### Evolves By Necessity vs. Agile Prioritization

Agile frameworks use backlogs and sprint planning to prioritize work. Evolves By Necessity is more rigorous: it requires evidence that a change is needed before it enters the backlog at all. An agile team might prioritize based on stakeholder votes; necessity-driven evolution requires evidence-based justification.

## Best Practices

1. **Document the need before proposing the solution.** Write the need statement first, gather evidence second, propose the solution third. Never start with a solution looking for a problem.

2. **Require multi-source evidence.** A single metric anomaly is not sufficient evidence of need. Combine telemetry data with incident history, user feedback, or quality metrics.

3. **Track deferred proposals.** Do not discard proposals that fail the Necessity Test. Track them in the DeferralTracker and re-assess periodically. Today's premature optimization may be tomorrow's critical need.

4. **Measure fitness impact.** After every accepted evolution, compare expected vs. actual fitness improvement. Use this data to improve future necessity assessments.

5. **Resist trend pressure.** The fact that other platforms are adopting a technology is not evidence of need. The platform's own operational data determines what is necessary.

6. **Apply the principle recursively.** The necessity principle applies not just to features but to dependencies, tools, processes, and even team structure. Everything in the platform should justify its existence through operational need.

7. **Distinguish urgency from importance.** A production outage creates urgent need. A gradual quality decline creates important need. Both are valid necessities but require different response timescales.

## Common Pitfalls

1. **Using necessity as an excuse for inaction.** The principle demands that genuine needs are acted upon immediately and thoroughly. Dismissing real problems as "not necessary yet" violates the NO MERCY doctrine.

2. **Setting the evidence bar too high.** Requiring absolute proof before acting leads to paralysis. The threshold is "sufficient evidence from multiple sources," not "mathematical certainty."

3. **Ignoring slow-burn needs.** A gradual increase in latency or a slow accumulation of technical debt may not trigger incident alerts but represents a genuine need for evolution. The Necessity Assessor must detect trends, not just thresholds.

4. **Conflating desire with necessity.** "It would be nice to have" is not a need. "Without this, the platform cannot serve its operational requirements" is a need. The distinction is critical.

5. **Failing to re-evaluate deferrals.** Deferred proposals that are never re-assessed create a growing backlog of potentially valuable changes. Regular reassessment is essential.

6. **Applying necessity only to new features.** The principle also applies to keeping existing features. If a capability is no longer needed, removing it is as valid an evolution as adding a new one.

7. **Individual bias in need assessment.** The Necessity Test must be evidence-based, not opinion-based. A senior engineer's intuition about what is needed must be backed by data, not authority.

## Use Cases

### Infrastructure Scaling

When telemetry data shows P99 response times approaching the 250ms limit, the NecessityAssessor identifies a genuine performance need. Evidence comes from production metrics (telemetry), user impact data (error rates), and trend analysis (latency increasing over time). The evolution system proposes scaling changes (connection pooling, caching, query optimization) and validates them against the full quality gate pipeline.

### New Module Introduction

When the platform needed EASM capabilities, the need was documented through client requirements (evidence source 1), competitive analysis (evidence source 2), and security audit recommendations (evidence source 3). The module was not built because "EASM is hot in cybersecurity" but because specific operational requirements demanded it.

### Dependency Updates

When a dependency is updated, the change must pass the Necessity Test. Security patches for known vulnerabilities have clear necessity (inaction risk: critical). Feature updates that do not address any identified need are deferred until a need for the new features emerges.

### Architectural Refactoring

When coupling analysis reveals that two modules have excessive interdependency, the architectural need is documented with evidence (dependency graph metrics, compilation coupling data, change frequency correlation). The refactoring is executed only when the evidence demonstrates that the coupling is causing real operational problems, not just violating theoretical cleanliness standards.

### Agent Expansion

The growth from initial agents to 530+ was necessity-driven. Each new agent was created to address a specific operational gap that existing agents could not fill. The agent count is not a vanity metric; it reflects 530 distinct operational needs that required automated handling.

## Related Concepts

- [Evolution](@/glossary/evolution.md) -- The broader evolutionary process within which Evolves By Necessity constrains which changes are accepted.
- [AutoEvolve](@/glossary/autoevolve.md) -- The automation system that implements necessity-driven evolution at the technical level.
- [Fitness Score](@/glossary/fitness-score.md) -- The metric used to measure whether an evolution actually improved the platform.
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- The doctrine that demands complete execution once a genuine need is identified.
- [Evidence Over Opinion](@/glossary/evidence-over-opinion.md) -- The epistemic principle that underpins necessity assessment.
- [Quality Gates](@/glossary/quality-gates.md) -- The enforcement mechanism that validates necessity-driven changes.
- [Decisive Action](@/glossary/decisive-action.md) -- The execution principle applied after the Necessity Test passes.
- [Disciplined Approach](@/glossary/disciplined-approach.md) -- The methodology that Evolves By Necessity represents in practice.
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework that provides evidence standards for necessity assessment.
- [Continuous Evolution](@/glossary/continuous-evolution.md) -- The ongoing process shaped by the Evolves By Necessity constraint.

## See Also

- [System Design Principle](@/glossary/system-design-principle.md) -- The category of architectural principles that includes Evolves By Necessity.
- [Technical Debt](@/glossary/technical-debt.md) -- What accumulates when the platform evolves without necessity, adding complexity that provides no operational value.
- [Autonomous Evolution](@/glossary/autonomous-evolution.md) -- The self-driving evolution system constrained by necessity assessment.
- [Generation Evolution](@/glossary/generation-evolution.md) -- How generations advance through necessity-validated improvements.
- [Platform Enhancements](@/glossary/platform-enhancements.md) -- Specific improvements that have passed the Necessity Test.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** -- Building necessity-driven systems that grow only when growth serves a purpose.

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | Glossary Index
