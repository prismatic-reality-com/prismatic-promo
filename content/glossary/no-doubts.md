+++
title = "NO DOUBTS"
weight = 2
[extra]
description = "Full investigation before action, decisive execution after decision"
category = "doctrine"
related_terms = ["no-mercy", "nm-nd", "violation-protocol", "nabla-infinity", "trinity-gate", "confidence-threshold"]
tier = "TIER_0"
domain = "governance"
complexity = "foundational"
audience = ["all-agents", "developers", "architects", "platform-operators"]
maturity = "doctrine"
doctrine_level = "L3"
enforcement = "mandatory"
confidence_threshold = 0.95
transition_mechanism = "nabla-to-execution"
axiom_count = 7
trinity_gate_required = true
companion_principle = "no-mercy"
combined_doctrine = "nm-nd"
prismatic_integration = "all-agents"
platform_modules = ["prismatic_claude", "prismatic_agents", "prismatic_safety"]
violation_levels = ["L1-warning", "L2-block", "L3-rejection", "L4-supreme-review"]
phase_model = "investigate-then-execute"
evidence_model = "multi-signal-convergence"
keywords = ["doctrine", "investigation", "decisive action", "confidence", "evidence-based", "epistemic", "verification", "execution"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1740
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "doctrine", "no-doubts", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "NO DOUBTS - Prismatic Platform"
+++

## Definition

NO DOUBTS is the epistemic arm of the NM/ND Doctrine that establishes a rigorous two-phase approach to software development and platform operations. The first phase demands full investigation and complete understanding before any action is taken. The second phase requires decisive, fully committed execution once a decision has been made. Every claim must be backed by tests, benchmarks, or formal verification -- no unvalidated claims, unchecked outputs, or assumption-based decisions are permitted.

The principle addresses a fundamental tension in engineering: the need for thoroughness versus the need for speed. Rather than compromising on either, NO DOUBTS separates them temporally. During the investigation phase, there is no pressure to act -- uncertainty is mapped, contradictions are preserved, and parallel hypotheses are explored using the [NABLA Infinity](@/glossary/nabla-infinity.md) framework. During the execution phase, there is no room for hesitation -- the decision has been made with sufficient evidence, and full commitment is required.

NO DOUBTS prevents two of the most damaging failure modes in software engineering: **premature action** (committing to an approach before understanding the problem) and **analysis paralysis** (investigating indefinitely without ever committing to execution). The confidence threshold mechanism (0.95 with [Trinity Gate](@/glossary/trinity-gate.md) validation) provides a precise, measurable transition point between investigation and execution, eliminating subjective judgment about "when we know enough."

## Overview

The principle is particularly important in the context of a platform with 530 autonomous agents, where each agent's decisions can cascade through the system. An agent acting without sufficient evidence can introduce subtle errors that compound across the agent network. The NO DOUBTS framework ensures that every agent decision is grounded in validated evidence before execution begins.

The NO DOUBTS principle operates at every level of the platform: individual function implementations, module-level architectural decisions, cross-app integration patterns, and platform-wide governance. At the code level, it manifests as thorough test coverage before merging. At the agent level, it manifests as confidence scoring before action. At the platform level, it manifests as [quality gates](@/glossary/quality-gates.md) that accumulate evidence from multiple verification sources before authorizing deployment.

The philosophical foundation draws from epistemic rigor: the discipline of distinguishing between what is known, what is believed, and what is unknown. Most engineering failures stem not from lack of knowledge but from treating beliefs as knowledge -- acting on assumptions that have not been verified. NO DOUBTS enforces a hard boundary between investigation (where beliefs are held provisionally) and execution (where verified knowledge drives action).

## Investigation Phase Architecture

The investigation phase operates under [NABLA Infinity](@/glossary/nabla-infinity.md) governance with seven non-negotiable axioms that structure the evidence-gathering process:

| Axiom | Role in NO DOUBTS | Enforcement |
|-------|-------------------|-------------|
| Signal Plurality | Minimum 2 independent signals for any belief | HARD -- blocks action with single signal |
| Contradiction Preservation | Both sides of contradictions preserved | HARD -- blocks resolution by ignoring evidence |
| Absence Informative | Missing signals treated as meaningful data | SOFT -- tracked and investigated |
| Time Decay | Beliefs carry mandatory timestamps | HARD -- stale evidence loses weight |
| Unknown Valid | "I don't know" is legitimate conclusion | HARD -- blocks forced certainty |
| Source Independence | Independent sources weighted higher | SOFT -- bias assessment required |
| Provenance Mandatory | All beliefs traceable to sources | HARD -- untraced beliefs rejected |

These axioms prevent the most common investigation failures: cherry-picking evidence (Signal Plurality prevents), hiding inconvenient findings (Contradiction Preservation prevents), ignoring gaps (Absence Informative prevents), relying on outdated data (Time Decay prevents), and fabricating certainty (Unknown Valid prevents).

## Confidence Accumulation Model

NO DOUBTS uses a structured confidence accumulation model where evidence from multiple independent sources converges toward the action threshold. Each evidence source contributes a confidence increment based on its verification strength and independence:

```
Evidence Source 1 (e.g., unit tests pass)        --> confidence += 0.20
Evidence Source 2 (e.g., type checker clean)      --> confidence += 0.20
Evidence Source 3 (e.g., property tests pass)     --> confidence += 0.20
Evidence Source 4 (e.g., integration tests pass)  --> confidence += 0.20
Evidence Source 5 (e.g., manual review complete)  --> confidence += 0.15

Total Confidence: 0.95 --> Meets threshold
Trinity Gate: structural + logical + formal consistency --> PASS
Transition to Execution: AUTHORIZED
```

The confidence contributions are not additive in a naive sense. Correlated evidence sources (two unit tests from the same module) contribute less than independent sources (a unit test plus a property-based test plus a Dialyzer check). The model applies independence weighting to prevent confidence inflation from redundant signals.

## Transition Mechanics

The NABLA-to-NM/ND transition is not a simple threshold check. It requires three simultaneous conditions:

1. **Confidence >= 0.95**: Accumulated evidence from multiple independent sources reaches the threshold
2. **Trinity Gate Passed**: The claim passes all three verification layers (structural consistency via graph theory, logical consistency via rule-based evaluation, and formal necessity via modal logic)
3. **Axioms Compliant**: No NABLA axiom violations remain unresolved in the active evidence set

```elixir
defmodule PrismaticClaude.NoDoubtsTransition do
  @moduledoc """
  Implements the NO DOUBTS transition from investigation to execution.
  Validates confidence threshold, Trinity Gate, and axiom compliance
  before authorizing decisive action. This module is the formal
  gatekeeper between exploration and commitment.
  """

  @confidence_threshold 0.95

  @type transition_result ::
    {:authorized, :execute} |
    {:blocked, :insufficient_confidence, float()} |
    {:blocked, :trinity_gate_failed, list()} |
    {:blocked, :axiom_violation, list()}

  @spec evaluate_transition(map()) :: transition_result()
  def evaluate_transition(evidence_set) do
    confidence = calculate_confidence(evidence_set)
    trinity_result = evaluate_trinity_gate(evidence_set)
    axiom_result = check_axiom_compliance(evidence_set)

    cond do
      confidence < @confidence_threshold ->
        {:blocked, :insufficient_confidence, confidence}

      not trinity_passed?(trinity_result) ->
        {:blocked, :trinity_gate_failed, trinity_result.failures}

      not axioms_compliant?(axiom_result) ->
        {:blocked, :axiom_violation, axiom_result.violations}

      true ->
        {:authorized, :execute}
    end
  end

  @spec calculate_confidence(map()) :: float()
  defp calculate_confidence(evidence_set) do
    evidence_set.signals
    |> apply_independence_weighting()
    |> apply_time_decay()
    |> Enum.map(& &1.confidence_contribution)
    |> Enum.sum()
    |> min(1.0)
  end

  @spec apply_independence_weighting(list()) :: list()
  defp apply_independence_weighting(signals) do
    signals
    |> Enum.group_by(& &1.source_category)
    |> Enum.flat_map(fn {_category, group} ->
      weight_factor = 1.0 / :math.sqrt(length(group))
      Enum.map(group, &Map.update!(&1, :confidence_contribution, fn c -> c * weight_factor end))
    end)
  end

  @spec apply_time_decay(list()) :: list()
  defp apply_time_decay(signals) do
    now = System.monotonic_time(:second)

    Enum.map(signals, fn signal ->
      age_seconds = now - signal.timestamp
      decay_factor = :math.exp(-age_seconds / signal.half_life)
      Map.update!(signal, :confidence_contribution, fn c -> c * decay_factor end)
    end)
  end
end
```

## Decisive Execution Phase

Once the transition is authorized, the execution phase operates under [NO MERCY](@/glossary/no-mercy.md) governance with no room for second-guessing:

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Full Commitment** | The chosen approach is executed completely, not partially | L3 rejection for incomplete delivery |
| **No Mid-Execution Doubts** | If the investigation was thorough, execution proceeds without hesitation | L4 review if execution stalls |
| **Completion Guarantee** | Work continues until the deliverable is production-ready | No partial merges |
| **Immediate Verification** | Results are verified against the evidence that authorized execution | Post-execution check mandatory |
| **No Backtracking** | If new evidence invalidates the approach, return to investigation formally | Explicit phase transition required |

The execution phase is characterized by speed and completeness. The investigation phase already answered all questions and resolved all ambiguities. The execution phase implements the decided solution without revisiting those decisions. This separation prevents the common anti-pattern of "code, doubt, refactor, doubt, refactor" loops that waste time and produce inconsistent results.

## Evidence Pipeline Architecture

```
Evidence Sources                   Confidence Engine          Decision Gate
+------------------+          +--------------------+     +------------------+
| Unit Tests       |--------->|                    |     |                  |
| Type Checker     |--------->| Signal Aggregation |---->| Threshold Check  |
| Property Tests   |--------->| Time Decay         |     | Trinity Gate     |
| Integration Tests|--------->| Provenance Verify  |     | Axiom Compliance |
| Manual Review    |--------->| Independence Weight|     |                  |
| Benchmarks       |--------->|                    |     |                  |
+------------------+          +--------------------+     +--------+---------+
                                                                  |
                                                    +-------------v---------+
                                                    |   >= 0.95 + Pass?     |
                                                    +--+------------------+-+
                                                       |                  |
                                                   YES |              NO  |
                                                       v                  v
                                              +--------+------+  +-------+--------+
                                              | EXECUTE       |  | CONTINUE       |
                                              | (NO MERCY)    |  | INVESTIGATION  |
                                              +---------------+  +----------------+
```

## Implementation Across Platform Layers

NO DOUBTS is implemented across multiple system layers within the Prismatic Platform:

### Agent Layer

Each of the 530 agents evaluates confidence before taking action, using structured evidence accumulation against the threshold. The [Blue Team](@/glossary/blue-team.md) defensive agents accumulate evidence from multiple detection sources before raising alerts. The [Purple Team](@/glossary/purple-team.md) requires four closure conditions before accepting that a security finding is resolved. The [White Team](@/glossary/white-team.md) constructs formal proofs before declaring invariants verified.

```elixir
defmodule PrismaticAgents.DecisionEngine do
  @moduledoc """
  NO DOUBTS decision engine for agent operations.
  Ensures all agent actions are backed by sufficient evidence
  before transitioning from investigation to execution.
  """

  @spec make_decision(atom(), map(), map()) ::
    {:ok, :execute, map()} | {:ok, :investigate_more, map()}
  def make_decision(agent_id, context, evidence) do
    confidence = assess_confidence(evidence)
    trinity = verify_trinity_gate(evidence)

    if confidence >= 0.95 and trinity.passed? do
      action_plan = formulate_action(agent_id, context, evidence)
      {:ok, :execute, action_plan}
    else
      gaps = identify_evidence_gaps(evidence, confidence)
      {:ok, :investigate_more, %{gaps: gaps, current_confidence: confidence}}
    end
  end

  @spec assess_confidence(map()) :: float()
  defp assess_confidence(evidence) do
    evidence
    |> Map.get(:signals, [])
    |> Enum.filter(& &1.validated?)
    |> Enum.map(& &1.weight)
    |> Enum.sum()
  end

  @spec identify_evidence_gaps(map(), float()) :: map()
  defp identify_evidence_gaps(evidence, current_confidence) do
    needed = 0.95 - current_confidence
    %{
      confidence_gap: needed,
      missing_signals: find_missing_signal_types(evidence),
      stale_signals: find_stale_signals(evidence),
      unverified_claims: find_unverified(evidence)
    }
  end
end
```

### Quality Layer

Quality gates verify that changes are backed by evidence (tests, type checks, static analysis) before accepting them. The 13-domain quality scoring system accumulates evidence from Dialyzer, Credo, compilation warnings, typespec coverage, and other verification tools. A commit that passes all 13 domains has accumulated sufficient evidence for the quality gate transition.

### Session Layer

The session lifecycle protocol ensures developers investigate before implementing and verify after completing. The mandatory session discipline requires reading code, running tests, and analyzing behavior before making changes. Once changes are made, they must be immediately verified through local testing before committing.

### CI/CD Layer

Pipeline stages accumulate evidence (compilation, testing, analysis) before authorizing deployment. Each stage contributes to the overall confidence that a change is safe to deploy. The pre-commit hook system runs 11 phases of verification, each adding evidence toward the deployment confidence threshold.

## Verification After Execution

The NO DOUBTS cycle does not end at execution. Post-execution verification ensures that the results match the evidence that authorized the action:

```elixir
defmodule PrismaticSafety.PostExecutionVerifier do
  @moduledoc """
  Verifies that execution results match the evidence
  that authorized the action, completing the NO DOUBTS cycle.
  Detects drift between expected and actual outcomes.
  """

  @spec verify_execution(map(), map()) ::
    {:ok, :verified} | {:error, :mismatch, map()}
  def verify_execution(expected_from_evidence, actual_result) do
    mismatches =
      expected_from_evidence
      |> Enum.map(fn {key, expected} ->
        actual = Map.get(actual_result, key)
        {key, expected, actual, expected == actual}
      end)
      |> Enum.reject(fn {_, _, _, match?} -> match? end)

    case mismatches do
      [] -> {:ok, :verified}
      failures -> {:error, :mismatch, %{failures: failures, action: :reinvestigate}}
    end
  end
end
```

## Confidence Thresholds by Context

Different operational contexts require different confidence levels, reflecting the varying cost of incorrect action:

| Context | Threshold | Trinity Gate | Rationale |
|---------|-----------|-------------|-----------|
| Critical decisions (architecture, security) | 0.95 | MANDATORY | High cost of error, irreversible consequences |
| Standard operations (features, refactoring) | 0.80 | MANDATORY | Moderate cost, recoverable if wrong |
| Exploratory analysis (research, prototyping) | 0.60 | RECOMMENDED | Low cost, designed for learning |
| Research queries (investigation, benchmarking) | 0.50 | OPTIONAL | Informational, no commitment implied |

## Best Practices

**Explicit Evidence Tracking**: Maintain a clear record of what evidence supports each decision. When confidence reaches the threshold, you should be able to enumerate exactly which signals contributed. This traceability is essential for post-incident analysis and for building institutional knowledge.

**Time-Box Investigation**: While NO DOUBTS demands thorough investigation, it does not endorse infinite analysis. Set explicit time bounds for investigation phases and escalate if the threshold cannot be reached within bounds. The escalation triggers additional resources, not premature action.

**Independent Signal Sources**: Seek evidence from genuinely independent sources. Two unit tests from the same test file provide less confidence than one unit test plus one property-based test plus one type checker result. Independence is the key to robust confidence accumulation.

**Preserve Uncertainty Honestly**: During investigation, resist the temptation to round up confidence. If you are at 0.80, you are at 0.80 -- not "close enough to 0.95." The threshold exists for a reason, and circumventing it undermines the entire framework.

**Commit Fully Once Decided**: The execution phase is not a second investigation phase. Once you cross the threshold, execute with conviction. If new contradictory evidence appears during execution, pause, return to investigation formally, and re-evaluate. Do not operate in a hybrid state.

**Document the Transition**: When transitioning from investigation to execution, explicitly record: what the decision is, what evidence supports it, what the confidence score is, and what the Trinity Gate result was. This record serves as both accountability and future reference.

## Common Pitfalls

**Artificial Confidence Inflation**: Counting the same evidence multiple times or treating correlated sources as independent to reach the 0.95 threshold. This undermines the entire framework and produces decisions that appear well-founded but are actually based on thin evidence.

**Perpetual Investigation**: Using NO DOUBTS as an excuse to never act. The principle requires decisive action once evidence is sufficient, not indefinite investigation. If investigation consistently fails to reach the threshold, the problem may be poorly defined rather than insufficiently investigated.

**Ignoring Contradictions**: Discarding evidence that contradicts a preferred conclusion. The [Addiction Preservation](@/glossary/contradiction-preservation.md) doctrine requires preserving contradictions, not resolving them by selective evidence elimination. Contradictions that persist after thorough investigation indicate genuine complexity that must be addressed in the execution plan.

**Executing Without Verification**: Skipping the post-execution verification step. NO DOUBTS is a complete cycle: investigate, decide, execute, verify. The verification step ensures the execution matched expectations and catches silent failures.

**Conflating Doubt with Caution**: NO DOUBTS does not mean acting recklessly. It means acting decisively once evidence supports the action. Caution during investigation is expected; hesitation during execution is prohibited. These are different behaviors appropriate to different phases.

## Violation Protocol

| Level | Description | Trigger | Action |
|-------|-------------|---------|--------|
| **L1** | Minor deviation | Insufficient evidence documentation | Warning + immediate correction |
| **L2** | Quality violation | Acting below confidence threshold | Block + required re-investigation |
| **L3** | Incomplete delivery | Execution abandoned mid-way | Rejection + restart from investigation |
| **L4** | Doubt-compromised | Persistent hesitation despite evidence | Rejection + Supreme Review |

## Related Concepts

- [NO MERCY](@/glossary/no-mercy.md) - The enforcement counterpart requiring zero tolerance
- [NM/ND Doctrine](@/glossary/nm-nd.md) - The combined governance framework
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework governing the investigation phase
- [Trinity Gate](@/glossary/trinity-gate.md) - Verification gate for confidence validation before action
- [Confidence Threshold](@/glossary/confidence-threshold.md) - The 0.95 threshold triggering action transition
- [Violation Protocol](@/glossary/violation-protocol.md) - Escalation for NO DOUBTS violations
- [Quality Gates](@/glossary/quality-gates.md) - Evidence accumulation pipeline
- [Addiction Preservation](@/glossary/contradiction-preservation.md) - Contradiction preservation during investigation
- [Blue Team](@/glossary/blue-team.md) - Defensive agents applying NO DOUBTS to threat detection
- [Metrics](@/glossary/metrics.md) - Quantitative evidence feeding confidence accumulation

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Agents Registry](@/agents/_index.md) - Agents implementing NO DOUBTS decision making

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
