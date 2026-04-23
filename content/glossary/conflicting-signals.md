+++
title = "Conflicting Signals"
weight = 50
[extra]
tags = ["glossary", "epistemology", "nabla", "signals", "contradiction", "evidence", "intelligence", "reasoning"]
description = "Conflicting signals arise when multiple evidence sources produce contradictory or incompatible conclusions about the same phenomenon, requiring structured preservation and resolution through frameworks like NABLA Infinity's contradiction preservation axiom"
category = "epistemology"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["contradiction-preservation", "signal-plurality", "nabla-infinity", "nabla-axioms", "evidence", "confidence-scoring", "confidence-threshold", "trinity-gate", "epistemic-reasoning", "bias-detection", "cherry-picking", "addiction-recovery", "bayesian-reasoning", "intelligence-fusion"]
learning_outcomes = ["Understand why conflicting signals must be preserved rather than resolved prematurely", "Implement signal contradiction detection and tracking in Elixir systems", "Apply the NABLA Infinity axioms to real-world evidence handling", "Design systems that maintain epistemic integrity under contradictory evidence", "Evaluate confidence thresholds when signals disagree"]
prerequisites = ["nabla-infinity", "evidence", "signal-plurality", "confidence-scoring"]
key_concepts = ["signal plurality", "contradiction preservation", "premature resolution", "confidence degradation", "evidence weight", "source independence", "temporal decay", "epistemic integrity"]
see_also = ["contradiction-preservation", "signal-plurality", "trinity-gate", "cherry-picking", "bayesian-reasoning"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
word_count = 1798
date_modified = "2026-02-23"
keywords = ["Conflicting", "Signals", "NABLA", "Infinitys", "glossary", "epistemology", "Prismatic Platform", "Axiom", "NABLA Infinity", "Contradiction Preservation"]
image = "/images/sections/glossary.png"
image_alt = "Conflicting Signals - Prismatic Platform"
+++

## Definition

Conflicting signals occur when two or more evidence sources produce contradictory, incompatible, or mutually exclusive conclusions about the same phenomenon or entity. In intelligence analysis, software systems, and epistemic reasoning frameworks, conflicting signals represent one of the most challenging and most valuable categories of information. They are challenging because they resist simple resolution and demand sophisticated handling. They are valuable because they frequently indicate either incomplete understanding, active deception, rapidly changing conditions, or boundary cases where simple models break down.

The Prismatic Platform treats conflicting signals as a first-class concern through its [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework. Rather than forcing premature resolution or silently discarding contradictory evidence, the platform's architecture mandates the preservation, tracking, and structured analysis of all conflicting signals through the [Contradiction Preservation](/glossary/contradiction-preservation/) axiom. This approach, termed "addiction preservation," reflects the platform's commitment to maintaining uncomfortable truths rather than rationalizing them away.

## The Nature of Contradiction in Complex Systems

Contradictory evidence is not an anomaly in complex systems -- it is the expected condition. Complex adaptive systems exhibit emergent behaviors that are context-dependent, observer-dependent, and temporally variable. A signal that is accurate from one vantage point may be contradicted by an equally valid signal from another. Understanding this fundamental property is essential for building systems that reason correctly under uncertainty.

### Sources of Signal Conflict

Conflicting signals arise from several distinct mechanisms, each requiring different analytical approaches:

**Temporal Inconsistency**: The state of a system changes between observation points. Two signals may both have been accurate at their respective measurement times but now contradict each other because the underlying reality shifted. In OSINT intelligence gathering, a company's registration status may show as "active" in one registry and "suspended" in another simply because the registries update at different frequencies.

**Perspective Divergence**: Different measurement instruments, methodologies, or vantage points produce legitimately different views of the same phenomenon. In security assessment, a vulnerability scanner may report a service as vulnerable while a configuration audit finds it properly patched. Both are correct within their observational framework.

**Source Reliability Variance**: Not all information sources are equally reliable. A highly reliable source contradicting a less reliable one is qualitatively different from two equally reliable sources in disagreement. The platform's confidence scoring system assigns source reliability weights to disambiguate these cases.

**Active Deception**: In adversarial environments, [malicious actors](/glossary/malicious-actors/) may deliberately inject false signals to confuse analysis. Honeypots, planted evidence, and disinformation campaigns specifically aim to create conflicting signals that waste analyst resources or drive incorrect conclusions.

**Model Inadequacy**: Sometimes signals conflict because the model used to interpret them is incomplete or incorrect. The conflict itself is evidence of model failure, making it invaluable for improving the analytical framework.

## NABLA Infinity and Contradiction Preservation

The [NABLA Infinity](/glossary/nabla-infinity/) framework establishes seven non-negotiable axioms for epistemic integrity. Three of these axioms directly govern the handling of conflicting signals.

### Axiom 1: Signal Plurality

No belief may be established from a single signal source. This axiom ensures that conflicting signals can always emerge, because the minimum requirement of two independent sources creates the structural possibility of disagreement. Without this axiom, a system could form beliefs from a single unchallenged source, eliminating the opportunity for contradiction detection.

### Axiom 2: Contradiction Preservation

When signals conflict, both sides of the contradiction must be preserved in the belief graph. Discarding either side -- even when one appears more credible -- violates epistemic integrity. The contradiction is itself a datum: it records the fact that available evidence does not converge, which is information that must be available to downstream reasoning.

### Axiom 6: Source Independence

Independent sources carry more epistemic weight than correlated sources. When evaluating conflicting signals, the independence of the sources is a critical factor. Two independently derived contradictory signals demand far more attention than a contradiction between a source and its derivative.

## Implementation Architecture

The Prismatic Platform implements conflicting signal detection and management through a dedicated subsystem that integrates with the broader [epistemic reasoning](/glossary/epistemic-reasoning/) infrastructure.

```elixir
defmodule Prismatic.Epistemics.SignalConflictDetector do
  @moduledoc """
  Detects and classifies conflicting signals within the platform's
  evidence pipeline. Implements the NABLA Infinity contradiction
  preservation axiom by ensuring all detected conflicts are recorded
  in the belief graph rather than silently resolved.
  """

  alias Prismatic.Epistemics.{Signal, ConflictRecord, BeliefGraph}

  @type conflict_class :: :temporal | :perspective | :reliability | :deception | :model_failure
  @type conflict_severity :: :low | :medium | :high | :critical

  @spec detect_conflicts([Signal.t()]) :: [ConflictRecord.t()]
  def detect_conflicts(signals) when is_list(signals) do
    signals
    |> group_by_subject()
    |> Enum.flat_map(&find_contradictions/1)
    |> Enum.map(&classify_conflict/1)
    |> Enum.map(&assess_severity/1)
  end

  @spec group_by_subject([Signal.t()]) :: %{term() => [Signal.t()]}
  defp group_by_subject(signals) do
    Enum.group_by(signals, & &1.subject)
  end

  @spec find_contradictions({term(), [Signal.t()]}) :: [{Signal.t(), Signal.t()}]
  defp find_contradictions({_subject, signals}) do
    for s1 <- signals,
        s2 <- signals,
        s1.id < s2.id,
        contradicts?(s1, s2) do
      {s1, s2}
    end
  end

  @spec contradicts?(Signal.t(), Signal.t()) :: boolean()
  defp contradicts?(signal_a, signal_b) do
    Signal.claims_overlap?(signal_a, signal_b) and
      Signal.conclusions_incompatible?(signal_a, signal_b)
  end
end
```

### Conflict Classification

Each detected conflict is classified to guide downstream handling. The classification determines how the conflict is presented to analysts, which resolution strategies are appropriate, and what confidence adjustments are applied to affected beliefs.

```elixir
defmodule Prismatic.Epistemics.ConflictClassifier do
  @moduledoc """
  Classifies detected signal conflicts by analyzing temporal patterns,
  source relationships, and claim structure. Classification drives
  the appropriate resolution strategy and analyst presentation.
  """

  alias Prismatic.Epistemics.{ConflictRecord, Signal}

  @spec classify(ConflictRecord.t()) :: ConflictRecord.t()
  def classify(%ConflictRecord{signal_a: sa, signal_b: sb} = record) do
    class = cond do
      temporal_gap_significant?(sa, sb) -> :temporal
      sources_correlated?(sa, sb) -> :perspective
      reliability_gap_significant?(sa, sb) -> :reliability
      deception_indicators_present?(sa, sb) -> :deception
      true -> :model_failure
    end

    %{record | conflict_class: class}
  end

  @spec temporal_gap_significant?(Signal.t(), Signal.t()) :: boolean()
  defp temporal_gap_significant?(sa, sb) do
    gap_seconds = abs(DateTime.diff(sa.observed_at, sb.observed_at, :second))
    gap_seconds > sa.subject_volatility_window_seconds
  end

  @spec reliability_gap_significant?(Signal.t(), Signal.t()) :: boolean()
  defp reliability_gap_significant?(sa, sb) do
    abs(sa.source_reliability - sb.source_reliability) > 0.3
  end
end
```

### Confidence Degradation Under Conflict

When signals conflict, the system's confidence in claims about the affected subject must decrease. The magnitude of degradation depends on the conflict classification, the relative reliability of sources, and the number of independent signals supporting each side.

```elixir
defmodule Prismatic.Epistemics.ConfidenceAdjuster do
  @moduledoc """
  Adjusts confidence scores when conflicting signals are detected.
  Implements Bayesian updating with contradiction penalties that
  reflect the epistemic cost of unresolved disagreement.
  """

  @type confidence :: float()

  @spec adjust_for_conflict(confidence(), ConflictRecord.t()) :: confidence()
  def adjust_for_conflict(current_confidence, conflict) do
    penalty = conflict_penalty(conflict)
    max(0.0, current_confidence * (1.0 - penalty))
  end

  @spec conflict_penalty(ConflictRecord.t()) :: float()
  defp conflict_penalty(%{conflict_class: :temporal}), do: 0.1
  defp conflict_penalty(%{conflict_class: :perspective}), do: 0.15
  defp conflict_penalty(%{conflict_class: :reliability}), do: 0.2
  defp conflict_penalty(%{conflict_class: :deception}), do: 0.4
  defp conflict_penalty(%{conflict_class: :model_failure}), do: 0.3
end
```

## The Addiction Preservation Doctrine

The platform's handling of conflicting signals is governed by the [Addiction Preservation](/glossary/addiction-recovery/) doctrine, which uses a deliberate metaphor from addiction recovery. Just as a person recovering from addiction must maintain constant vigilance against rationalization and denial, a reasoning system must maintain constant vigilance against the natural tendency to "smooth over" conflicting evidence.

### Anti-Patterns in Conflict Handling

The doctrine identifies and prohibits several common anti-patterns in conflicting signal management:

| Anti-Pattern | Description | NABLA Violation |
|-------------|-------------|-----------------|
| **Cherry Picking** | Selecting only signals that support a preferred conclusion | Axiom 1 (Signal Plurality) |
| **Premature Resolution** | Forcing agreement by discarding the weaker signal | Axiom 2 (Contradiction Preservation) |
| **False Synthesis** | Claiming a middle ground that neither signal supports | Axiom 7 (Provenance Mandatory) |
| **Source Silencing** | Downweighting a source because its signals are inconvenient | Axiom 6 (Source Independence) |
| **Temporal Dismissal** | Ignoring older signals without evidence of state change | Axiom 4 (Time Decay) |
| **Reasoning Opacity** | Resolving conflicts without documenting the reasoning | Axiom 7 (Provenance Mandatory) |

## OSINT Intelligence and Conflicting Signals

In the Prismatic Platform's [OSINT](/glossary/osint/) intelligence pipeline, conflicting signals are a daily occurrence. Entity resolution across multiple registries, sanctions lists, and public databases routinely produces contradictory information about the same legal entity.

### Real-World Conflict Scenarios

**Business Registry Conflicts**: A Czech company's ARES record shows an active ICO, but the Justice Ministry's commercial register shows a pending dissolution. Both are authoritative sources. The conflict indicates either a state transition in progress or a data synchronization delay between registries.

**Sanctions Cross-Reference**: An entity appears on the EU sanctions list but not on the OFAC SDN list. This is not necessarily an error -- different jurisdictions maintain independent sanctions regimes with different criteria. The conflicting signal (sanctioned vs. not sanctioned) is accurate for both contexts.

**Security Assessment Divergence**: The [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM system may receive conflicting signals about a target's security posture. A TLS certificate scan shows proper configuration while a header analysis reveals missing security headers. Both findings are accurate and must coexist in the security rating calculation.

## Color-Team Security and Adversarial Signals

The platform's [Color Teams](/glossary/color-teams/) security architecture specifically generates and analyzes conflicting signals as part of its adversarial testing methodology.

### Red Team Signal Injection

The [Red Team](/glossary/red-team/) deliberately creates conflicting signals to test the [Blue Team](/glossary/blue-team/)'s detection and handling capabilities. By injecting false positives alongside true positives, the Red Team evaluates whether the defensive systems maintain epistemic integrity under adversarial conditions.

### Purple Team Synthesis

The [Purple Team](/glossary/purple-team/) serves as the synthesis hub for Red-Blue signal conflicts. Its primary function is to determine whether apparent conflicts between Red findings and Blue defenses represent genuine gaps or expected behavior. The Purple Team's closure analysis must satisfy all four closure conditions before a conflict can be marked as resolved.

### Gray Team Boundary Exploration

The [Gray Team](/glossary/gray-team/) specifically seeks out boundary conditions where signals are most likely to conflict. By exploring specification gaps and edge cases, Gray operations surface the ambiguities that create conflicting interpretations.

## Trinity Gate and Conflict Resolution

The [Trinity Gate](/glossary/trinity-gate/) provides the formal framework for resolving conflicting signals when resolution is required for decision-making. All three gates must pass before a conflict can be considered resolved.

1. **Structural Consistency** (Graph Theory): The resolution must not introduce cycles or inconsistencies into the belief graph.
2. **Logical Consistency** (Rule-Based): The resolved claim must follow from the evidence through valid logical inference.
3. **Formal Necessity** (Modal Logic): The resolution must be provable in the formal system, not merely plausible.

If any gate fails, the conflict remains unresolved and the [confidence threshold](/glossary/confidence-threshold/) prevents the system from acting on the disputed claim in high-stakes contexts. This is by design: the system explicitly acknowledges its uncertainty rather than pretending certainty.

## Temporal Dynamics of Conflicting Signals

Conflicting signals have temporal dynamics that must be tracked. A conflict detected at time T may resolve naturally as new evidence arrives, or it may deepen as additional contradictory signals accumulate.

```elixir
defmodule Prismatic.Epistemics.ConflictTracker do
  @moduledoc """
  Tracks the temporal evolution of signal conflicts, monitoring
  whether conflicts are converging toward resolution or diverging
  toward deeper disagreement. Implements the time decay axiom for
  aging conflict records.
  """

  use GenServer

  @type conflict_trend :: :converging | :stable | :diverging | :resolved

  @spec track_conflict(ConflictRecord.t()) :: :ok
  def track_conflict(conflict) do
    GenServer.cast(__MODULE__, {:track, conflict})
  end

  @spec get_trend(conflict_id :: binary()) :: {:ok, conflict_trend()} | {:error, :not_found}
  def get_trend(conflict_id) do
    GenServer.call(__MODULE__, {:trend, conflict_id})
  end

  @impl GenServer
  def handle_cast({:track, conflict}, state) do
    history = Map.get(state.conflicts, conflict.id, [])
    updated = Map.put(state.conflicts, conflict.id, [conflict | history])
    {:noreply, %{state | conflicts: updated}}
  end

  @impl GenServer
  def handle_call({:trend, id}, _from, state) do
    case Map.get(state.conflicts, id) do
      nil -> {:reply, {:error, :not_found}, state}
      history -> {:reply, {:ok, compute_trend(history)}, state}
    end
  end

  @spec compute_trend([ConflictRecord.t()]) :: conflict_trend()
  defp compute_trend([_single]), do: :stable
  defp compute_trend(history) do
    severities = Enum.map(history, & &1.severity_score)
    if Enum.count(severities) >= 3 do
      recent = Enum.take(severities, 3)
      cond do
        monotonically_decreasing?(recent) -> :converging
        monotonically_increasing?(recent) -> :diverging
        true -> :stable
      end
    else
      :stable
    end
  end
end
```

## Quantitative Conflict Metrics

The platform tracks several quantitative metrics related to conflicting signals across the intelligence pipeline:

| Metric | Description | Healthy Range |
|--------|-------------|---------------|
| Conflict Rate | Percentage of subjects with active conflicts | 5-15% |
| Resolution Time (P50) | Median time from conflict detection to resolution | < 24 hours |
| False Conflict Rate | Conflicts caused by data format or timing issues | < 3% |
| Conflict Depth | Average number of signals per unresolved conflict | < 4 |
| Cherry-Pick Detection Rate | Automated detection of selective evidence usage | > 95% |

## Bayesian Reasoning Under Contradiction

The platform applies [Bayesian reasoning](/glossary/bayesian-reasoning/) to update beliefs when conflicting signals arrive. Rather than simple majority voting, the Bayesian approach weights each signal by its source reliability, temporal freshness, and independence from other sources.

When two signals conflict, the posterior probability of each claim is computed using:

```
P(H|E1, E2) = P(E1|H) * P(E2|H) * P(H) / P(E1, E2)
```

Where H is the hypothesis, E1 is the supporting signal, and E2 is the contradicting signal. The key insight is that the contradicting signal does not simply cancel the supporting signal -- it updates the belief proportionally to its reliability and independence.

## Best Practices for Handling Conflicting Signals

1. **Never discard silently**: Every detected conflict must be logged, classified, and preserved in the belief graph. Silent discarding is the most dangerous anti-pattern.

2. **Classify before resolving**: Understanding why signals conflict determines the appropriate resolution strategy. Temporal conflicts require different handling than deception-based conflicts.

3. **Track conflict history**: A conflict that has been stable for weeks carries different implications than one detected minutes ago. Temporal dynamics inform urgency and resolution approach.

4. **Maintain source provenance**: Every signal in a conflict must retain full provenance metadata so that downstream consumers can evaluate the conflict independently.

5. **Degrade confidence proportionally**: Unresolved conflicts should reduce confidence in affected claims. The degree of degradation should match the conflict severity and source reliability.

6. **Alert on escalating conflicts**: Conflicts that are diverging (accumulating more contradictory evidence over time) may indicate active deception or fundamental model failures and warrant immediate human analysis.

7. **Separate detection from resolution**: The system that detects conflicts should not be the same system that resolves them. This separation prevents confirmation bias in the resolution process.

## Related Concepts

- [Contradiction Preservation](/glossary/contradiction-preservation/) -- The NABLA axiom mandating conflict retention
- [Signal Plurality](/glossary/signal-plurality/) -- The requirement for multiple independent evidence sources
- [NABLA Infinity](/glossary/nabla-infinity/) -- The epistemic framework governing all evidence handling
- [Confidence Scoring](/glossary/confidence-scoring/) -- How confidence degrades under contradictory evidence
- [Trinity Gate](/glossary/trinity-gate/) -- The formal verification framework for resolving conflicts
- [Cherry Picking](/glossary/cherry-picking/) -- The prohibited anti-pattern of selective evidence usage
- [Bayesian Reasoning](/glossary/bayesian-reasoning/) -- The probabilistic framework for belief updating
- [Evidence](/glossary/evidence/) -- The raw material from which signals and conflicts derive
- [Bias Detection](/glossary/bias-detection/) -- Identifying systematic distortions in signal interpretation
- [Intelligence Fusion](/glossary/intelligence-fusion/) -- Combining signals from disparate sources

## Further Reading

- Heuer, Richards J. "Psychology of Intelligence Analysis." Center for the Study of Intelligence, CIA, 1999.
- Tetlock, Philip E. "Superforecasting: The Art and Science of Prediction." Crown Publishers, 2015.
- Kahneman, Daniel. "Thinking, Fast and Slow." Farrar, Straus and Giroux, 2011.
- Prismatic Platform NABLA Infinity Doctrine: `.aiad/doctrine/nabla-infinity.doctrine.md`

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
