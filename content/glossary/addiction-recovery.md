+++
title = "Addiction Recovery"
weight = 50

[extra]
description = "The platform's epistemic discipline principle requiring constant vigilance against evidence rationalization, cherry-picking, and premature contradiction resolution, analogous to addiction recovery's perpetual vigilance against relapse."
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "epistemic-hygiene"
related_concepts = ["nabla-infinity", "contradiction-preservation", "cherry-picking", "signal-plurality", "evidence-handling"]
implementation_status = "production"
authority_level = "L3"
difficulty_rating = 7
prerequisites = ["nabla-infinity", "contradiction-preservation", "belief-graph"]
learning_path = "epistemic-foundations"
interactive_demos = ["/labs/glossary/addiction-recovery"]
code_examples = ["PrismaticNabla.AddictionPreservation.check/1", "PrismaticNabla.VigilanceMonitor.scan/1"]
external_resources = ["Festinger - Cognitive Dissonance Theory (1957)", "Kahneman - Thinking Fast and Slow (2011)"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["contradiction-suppression-detection", "rationalization-pattern-recognition", "cherry-pick-guard-validation"]
keywords = ["epistemic hygiene", "evidence integrity", "rationalization prevention", "cognitive bias defense", "contradiction vigilance"]
tags = ["epistemic", "nabla", "doctrine", "quality", "integrity"]
related_terms = ["nabla-infinity", "contradiction-preservation", "cherry-picking", "signal-plurality", "evidence-over-opinion", "belief-graph", "confidence-scoring", "trinity-gate", "provenance-mandatory", "epistemic-robustness", "time-decay", "qeve"]
word_count = 2550
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Addiction Recovery - Prismatic Platform"
+++

## Definition

Addiction Recovery is a foundational epistemic discipline principle within the Prismatic Platform that mandates constant, automated vigilance against the human and systemic tendency to rationalize away inconvenient evidence, suppress contradictions, and cherry-pick data to support predetermined conclusions. The term draws a deliberate and precise analogy to addiction recovery programs: just as a person in recovery must maintain perpetual awareness that the impulse to relapse never fully disappears, an epistemic system must maintain perpetual awareness that the impulse to smooth over contradictions, dismiss outlier signals, and fabricate false certainty never fully disappears. The principle is encoded as a structural constraint in the [NABLA Infinity](@/glossary/nabla-infinity.md) framework and enforced through automated detection of rationalization patterns across all belief-forming operations.

## Overview

### Historical and Philosophical Context

The Addiction Recovery principle emerged from a critical observation during the Prismatic Platform's early development: epistemic systems degrade not through sudden catastrophic failures but through the gradual accumulation of small, individually reasonable compromises. A single instance of discarding a contradictory signal seems harmless. A single instance of rounding up a confidence score appears pragmatic. A single instance of treating correlated sources as independent looks like an honest mistake. But these small compromises compound. Over weeks and months, they erode the epistemic foundations of the entire system until conclusions that appear verified rest on a network of suppressed contradictions, inflated confidence, and unchallenged assumptions.

This pattern mirrors addiction dynamics with uncomfortable precision. Addiction researchers have long recognized that relapse does not begin with the act of using a substance. It begins with a sequence of cognitive shifts: minimization ("one drink won't matter"), rationalization ("I've been doing well, I've earned this"), and selective attention ("I'll focus on the positive outcomes"). Each shift is individually small and subjectively reasonable. Collectively, they reconstruct the mental framework that enables relapse.

The Prismatic Platform applies this insight to epistemology. Epistemic relapse -- the degradation of knowledge integrity -- follows the same pattern. It begins not with gross data fabrication but with a sequence of cognitive shortcuts: minimization ("this contradiction is probably noise"), rationalization ("we have enough supporting evidence to override this outlier"), and selective attention ("the strong signals clearly point in one direction"). Each shortcut is individually defensible. Collectively, they produce a belief system that has been shaped more by convenience than by evidence.

### The Core Metaphor

The Addiction Recovery metaphor is not decorative. It identifies specific structural parallels between substance addiction recovery and epistemic integrity maintenance:

| Addiction Recovery | Epistemic Integrity | Platform Enforcement |
|-------------------|---------------------|---------------------|
| **Triggers** -- External cues that activate craving | **Rationalization triggers** -- Situations that tempt evidence suppression | Automated trigger detection in belief pipeline |
| **Vigilance** -- Constant awareness of vulnerability | **Epistemic vigilance** -- Continuous monitoring for bias patterns | Real-time NABLA axiom compliance checking |
| **Relapse prevention** -- Structured protocols against recurrence | **Anti-pattern enforcement** -- Hard blocks on known epistemic failures | E2/E3 enforcement levels with no bypass |
| **Sponsor/accountability** -- External validation of decisions | **[Trinity Gate](@/glossary/trinity-gate.md)** -- Multi-layer independent verification | Structural, logical, and formal consistency gates |
| **One day at a time** -- Not permanent cure but continuous practice | **Continuous verification** -- Not one-time validation but ongoing compliance | Per-operation axiom checks, not periodic audits |
| **Meetings/community** -- Shared vigilance structures | **[Color Teams](@/glossary/color-teams.md)** -- Adversarial-defensive team dynamics | 6-team continuous challenge and verification |

The insight that ties these parallels together is that neither addiction recovery nor epistemic integrity can be "solved." There is no point at which the system can declare itself permanently immune to rationalization, just as there is no point at which a person in recovery can declare themselves permanently immune to relapse. The correct posture is perpetual, structured vigilance -- not paranoia, but disciplined awareness maintained through automated systems that do not suffer from the cognitive fatigue that degrades human vigilance over time.

### Significance Within the Platform

Addiction Recovery is not a standalone principle but a meta-level framing that infuses the entire [NABLA Infinity](@/glossary/nabla-infinity.md) framework. Every NABLA axiom can be understood as a specific anti-relapse mechanism:

- **[Signal Plurality](@/glossary/signal-plurality.md)**: Prevents the rationalization "this one source is authoritative enough"
- **[Contradiction Preservation](@/glossary/contradiction-preservation.md)**: Prevents the minimization "this disagreement is probably just noise"
- **Absence Informative**: Prevents the selective attention "if there's no evidence of a problem, there is no problem"
- **Time Decay**: Prevents the staleness rationalization "this evidence is still good enough"
- **Unknown Valid**: Prevents the false certainty "we need to give an answer even if we're not sure"
- **Source Independence**: Prevents the correlation blindness "ten articles confirm this" (from the same source)
- **[Provenance Mandatory](@/glossary/provenance-mandatory.md)**: Prevents the accountability evasion "everyone knows this"

## Technical Details

### Rationalization Pattern Taxonomy

The Addiction Recovery principle defines a structured taxonomy of epistemic rationalization patterns, each analogous to a specific relapse trigger in addiction recovery:

| Pattern | Addiction Analogy | Description | Detection Method | Enforcement |
|---------|------------------|-------------|-----------------|-------------|
| **Contradiction Dismissal** | "One drink won't hurt" | Discarding contradictory evidence as noise without investigation | Graph integrity check for missing contradiction nodes | E2 BLOCK |
| **Confidence Inflation** | "I can handle it this time" | Artificially raising confidence scores beyond what evidence supports | Statistical deviation from calibrated confidence model | E2 BLOCK |
| **Source Laundering** | "Everyone does it" | Treating correlated sources as independent to meet plurality requirements | Independence group analysis on evidence provenance | E2 BLOCK |
| **Selective Framing** | "I only had a little" | Presenting evidence in a way that minimizes contradictory signals without removing them | Salience analysis on downstream signal propagation | E1 WARNING |
| **Temporal Evasion** | "That was in the past" | Using stale evidence without applying time decay to support current conclusions | Timestamp analysis with mandatory decay function application | E2 BLOCK |
| **Absence Blindness** | "No news is good news" | Failing to track expected-but-missing evidence as a signal | Expected signal registry comparison | E1 WARNING |
| **Premature Closure** | "I'm cured now" | Declaring a contradiction resolved without new evidence | Resolution status transition audit | E3 HALT |
| **Authority Substitution** | "My doctor said I'm fine" | Replacing evidence plurality with appeal to a single authoritative source | Source authority vs. independence tracking | E2 BLOCK |

### Vigilance Architecture

The platform implements Addiction Recovery through a multi-layered vigilance architecture:

```elixir
defmodule PrismaticNabla.AddictionPreservation do
  @moduledoc """
  Implements the Addiction Recovery principle through continuous
  monitoring of belief-forming operations for rationalization
  patterns. Every operation that modifies the belief graph is
  checked against the rationalization pattern taxonomy.
  """

  alias PrismaticNabla.{BeliefGraph, ContradictionIndex, VigilanceMonitor}

  @type vigilance_result ::
    {:clean, map()}
    | {:warning, String.t(), map()}
    | {:block, String.t(), map()}
    | {:halt, String.t(), map()}

  @spec check(BeliefGraph.operation()) :: vigilance_result()
  def check(%{type: :evidence_removal} = operation) do
    case ContradictionIndex.affected_contradictions(operation) do
      [] ->
        {:clean, %{operation: operation, patterns_checked: 8}}

      contradictions ->
        {:block,
         "Contradiction Dismissal detected: removing evidence " <>
         "#{operation.evidence_id} would suppress #{length(contradictions)} " <>
         "active contradictions. Addiction Recovery protocol requires " <>
         "explicit contradiction resolution through new evidence.",
         %{pattern: :contradiction_dismissal, contradictions: contradictions}}
    end
  end

  def check(%{type: :confidence_update} = operation) do
    calibrated = VigilanceMonitor.calibrated_confidence(operation.hypothesis_id)
    proposed = operation.new_confidence

    deviation = abs(proposed - calibrated) / max(calibrated, 0.01)

    cond do
      deviation > 0.30 ->
        {:block,
         "Confidence Inflation detected: proposed confidence #{proposed} " <>
         "deviates #{Float.round(deviation * 100, 1)}% from calibrated " <>
         "value #{calibrated}. Addiction Recovery protocol blocks " <>
         "unsupported confidence adjustments.",
         %{pattern: :confidence_inflation, deviation: deviation}}

      deviation > 0.15 ->
        {:warning,
         "Potential Confidence Inflation: #{Float.round(deviation * 100, 1)}% " <>
         "deviation from calibrated confidence. Investigation recommended.",
         %{pattern: :confidence_inflation, deviation: deviation}}

      true ->
        {:clean, %{operation: operation, deviation: deviation}}
    end
  end

  def check(%{type: :resolution_transition} = operation) do
    case operation.new_status do
      :resolved ->
        if has_new_evidence?(operation) do
          {:clean, %{operation: operation, resolution_basis: :new_evidence}}
        else
          {:halt,
           "Premature Closure detected: attempting to resolve contradiction " <>
           "#{operation.contradiction_id} without new evidence. Addiction " <>
           "Recovery protocol requires evidence-backed resolution. " <>
           "Analyst judgment alone is insufficient.",
           %{pattern: :premature_closure, contradiction_id: operation.contradiction_id}}
        end

      _ ->
        {:clean, %{operation: operation}}
    end
  end

  defp has_new_evidence?(%{resolution_evidence: evidence}) when is_list(evidence) do
    Enum.any?(evidence, fn e ->
      DateTime.diff(DateTime.utc_now(), e.collected_at, :hour) < 72
    end)
  end

  defp has_new_evidence?(_), do: false
end
```

### Vigilance Monitor

The Vigilance Monitor runs continuously, scanning for patterns that indicate epistemic drift toward rationalization:

```elixir
defmodule PrismaticNabla.VigilanceMonitor do
  @moduledoc """
  Continuous monitoring process implementing the Addiction Recovery
  principle. Tracks belief graph modifications over time to detect
  gradual rationalization patterns that individual operation checks
  might miss.
  """

  use GenServer

  @type state :: %{
    operation_history: [map()],
    pattern_counts: %{atom() => non_neg_integer()},
    vigilance_score: float(),
    last_scan: DateTime.t()
  }

  @scan_interval :timer.minutes(5)
  @pattern_threshold 3
  @vigilance_decay_rate 0.95

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec scan(keyword()) :: {:ok, map()} | {:warning, String.t(), map()}
  def scan(opts \\ []) do
    GenServer.call(__MODULE__, {:scan, opts})
  end

  @spec calibrated_confidence(String.t()) :: float()
  def calibrated_confidence(hypothesis_id) do
    GenServer.call(__MODULE__, {:calibrated_confidence, hypothesis_id})
  end

  @impl true
  def init(opts) do
    schedule_scan()
    {:ok, %{
      operation_history: [],
      pattern_counts: %{},
      vigilance_score: 1.0,
      last_scan: DateTime.utc_now(),
      window_hours: Keyword.get(opts, :window_hours, 24)
    }}
  end

  @impl true
  def handle_call({:scan, _opts}, _from, state) do
    {result, new_state} = perform_scan(state)
    {:reply, result, new_state}
  end

  def handle_call({:calibrated_confidence, hypothesis_id}, _from, state) do
    confidence = compute_calibrated_confidence(hypothesis_id, state)
    {:reply, confidence, state}
  end

  @impl true
  def handle_info(:scheduled_scan, state) do
    {_result, new_state} = perform_scan(state)
    schedule_scan()
    {:noreply, new_state}
  end

  defp perform_scan(state) do
    recent_ops = filter_recent(state.operation_history, state.window_hours)
    pattern_counts = count_patterns(recent_ops)

    elevated_patterns =
      pattern_counts
      |> Enum.filter(fn {_pattern, count} -> count >= @pattern_threshold end)

    vigilance_score = compute_vigilance_score(elevated_patterns, state.vigilance_score)

    new_state = %{state |
      pattern_counts: pattern_counts,
      vigilance_score: vigilance_score,
      last_scan: DateTime.utc_now()
    }

    result =
      if Enum.empty?(elevated_patterns) do
        {:ok, %{vigilance_score: vigilance_score, patterns: pattern_counts}}
      else
        {:warning,
         "Addiction Recovery alert: elevated rationalization patterns detected " <>
         "in last #{state.window_hours}h: #{inspect(elevated_patterns)}",
         %{vigilance_score: vigilance_score, elevated: elevated_patterns}}
      end

    {result, new_state}
  end

  defp filter_recent(history, hours) do
    cutoff = DateTime.add(DateTime.utc_now(), -hours, :hour)
    Enum.filter(history, fn op -> DateTime.compare(op.timestamp, cutoff) == :gt end)
  end

  defp count_patterns(operations) do
    operations
    |> Enum.map(& &1.pattern)
    |> Enum.frequencies()
  end

  defp compute_vigilance_score([], current), do: min(current * (1 / @vigilance_decay_rate), 1.0)
  defp compute_vigilance_score(elevated, current) do
    penalty = length(elevated) * 0.05
    max(current - penalty, 0.0)
  end

  defp compute_calibrated_confidence(hypothesis_id, state) do
    case fetch_hypothesis_evidence(hypothesis_id) do
      {:ok, evidence} ->
        base = compute_evidence_strength(evidence)
        base * state.vigilance_score

      {:error, _} ->
        0.0
    end
  end

  defp fetch_hypothesis_evidence(_hypothesis_id), do: {:ok, []}
  defp compute_evidence_strength(_evidence), do: 0.5

  defp schedule_scan do
    Process.send_after(self(), :scheduled_scan, @scan_interval)
  end
end
```

## Implementation in Prismatic Platform

### Integration with NABLA Infinity

The Addiction Recovery principle is implemented as the enforcement meta-layer of the [NABLA Infinity](@/glossary/nabla-infinity.md) framework. While NABLA defines the seven axioms that govern belief formation, Addiction Recovery defines the monitoring and enforcement mechanisms that ensure those axioms are not gradually circumvented through accumulation of small compromises.

The integration operates at three levels:

1. **Per-Operation Level**: Every operation that modifies the belief graph passes through the `AddictionPreservation.check/1` function, which tests against the rationalization pattern taxonomy. This catches individual violations in real time.

2. **Temporal Pattern Level**: The `VigilanceMonitor` GenServer tracks patterns across operations over configurable time windows (default 24 hours). This catches gradual drift that individual checks miss -- for example, a sequence of individually permissible confidence adjustments that collectively inflate a hypothesis beyond its evidence base.

3. **Structural Level**: Periodic graph integrity scans verify that the belief graph's structure is consistent with Addiction Recovery requirements -- no orphaned evidence, no missing contradiction nodes, no untracked provenance gaps. These scans catch corruption that may have entered through code paths not yet instrumented with per-operation checks.

### Color Team Integration

The [Red Team](@/glossary/red-team.md) specifically tests Addiction Recovery resilience through two attack primitives:

- **Confidence Manipulation**: Red Team scenarios attempt to inflate confidence scores through sequences of small, individually permissible adjustments. The Vigilance Monitor's temporal pattern detection is calibrated against these scenarios.

- **Drift Induction**: Red Team drift scenarios introduce sub-threshold rationalization patterns to test whether the Vigilance Monitor detects the cumulative effect. The `red-drift-inducer` agent specializes in these attacks.

The [Blue Team](@/glossary/blue-team.md) maintains the defensive posture against Addiction Recovery violations, with `blue-drift-detector` specifically monitoring for the gradual erosion patterns the principle targets. The [Purple Team](@/glossary/purple-team.md) synthesizes Red findings with Blue defensive data to calibrate detection thresholds and update the rationalization pattern taxonomy.

### Enforcement Escalation

| Level | Trigger | Response | Recovery Action |
|-------|---------|----------|-----------------|
| E1 | Soft pattern warning (selective framing, absence blindness) | WARNING logged, investigation flag raised | Review flagged operations within 24h |
| E2 | Hard pattern detection (contradiction dismissal, confidence inflation, source laundering) | BLOCK operation, reject modification | Correct the operation, provide valid evidence basis |
| E3 | Premature closure or contradiction burial detected | HALT all operations on affected hypothesis subgraph | Supreme review required, full audit of recent modifications |
| E4 | Systematic pattern across multiple hypotheses suggesting coordinated rationalization | Full investigation, audit of all belief graph modifications in window | Cosmic clearance required, root cause analysis mandatory |

## Comparison with Alternatives

| Approach | Description | Strengths | Weaknesses |
|----------|-------------|-----------|------------|
| **Addiction Recovery (Prismatic)** | Continuous automated vigilance with pattern taxonomy and multi-level enforcement | Catches gradual drift, non-bypassable, no human fatigue | Requires careful calibration to avoid false positives |
| **Manual Code Review** | Human reviewers check for evidence handling quality | Catches novel patterns, contextual understanding | Subject to same biases it attempts to detect, does not scale |
| **Static Analysis Only** | One-time checks against fixed rules | Fast, deterministic, easy to implement | Misses temporal patterns, cannot detect gradual drift |
| **Confidence Calibration** | Statistical recalibration of confidence scores | Well-studied methodology, strong theoretical basis | Does not address the upstream evidence suppression problem |
| **Bayesian Updating** | Formal probabilistic framework for belief revision | Mathematically rigorous, well-understood | Assumes evidence is not suppressed before reaching the updater |
| **Adversarial Testing Alone** | Red Team attacks without structural prevention | Identifies weaknesses effectively | Reactive not preventive, vulnerabilities exist until tested |

The key distinction is that Addiction Recovery is a **preventive** mechanism, not a **detective** one. Traditional approaches detect problems after they occur. Addiction Recovery prevents the conditions that lead to problems by blocking the individual operations that, while seemingly benign in isolation, constitute the building blocks of epistemic degradation.

## Best Practices

1. **Never Disable Monitoring**: The Vigilance Monitor must run continuously. Temporary disabling "for performance" or "during batch operations" creates exactly the gap that gradual rationalization exploits. If performance is a concern, adjust scan intervals rather than disabling monitoring.

2. **Calibrate Against Red Team Results**: Detection thresholds should be calibrated using Red Team drift induction scenarios as ground truth. Under-sensitive thresholds miss real drift; over-sensitive thresholds produce alert fatigue that leads to ignored warnings.

3. **Track Vigilance Score Trends**: The vigilance score should trend upward over time (toward 1.0). A persistently declining trend indicates that the system is accumulating rationalization patterns faster than they are being resolved.

4. **Investigate Warnings Promptly**: E1 warnings are not informational messages to be reviewed at leisure. They indicate the early stages of rationalization patterns. Delayed investigation allows patterns to compound into E2 or E3 violations.

5. **Preserve the Full Pattern History**: Operation history should be retained for at least the configured window period (default 24 hours). Premature history truncation prevents the Vigilance Monitor from detecting temporal patterns, effectively blinding the Addiction Recovery system.

6. **Treat All Belief Graph Modifications Equally**: No operation should bypass the `AddictionPreservation.check/1` gate, regardless of the source's authority level, the operation's urgency, or the perceived triviality of the modification. Authority-based bypasses are themselves a rationalization pattern (Authority Substitution).

7. **Document Every Enforcement Action**: When an operation is blocked or halted, the enforcement reason must be recorded with full context. This creates an institutional memory of rationalization attempts that informs future pattern taxonomy updates.

## Common Pitfalls

- **Treating the principle as metaphorical rather than structural**: Addiction Recovery is not a philosophical stance or a team culture aspiration. It is a concrete set of automated checks, enforced at the code level, with no manual bypass. Teams that treat it as a "mindset" rather than an enforcement mechanism will find it degrading as organizational pressure increases.

- **Optimizing for false positive reduction at the expense of detection**: Tuning thresholds to reduce false positives inevitably reduces true positive detection. The asymmetric cost analysis (Section 4 of [Contradiction Preservation](@/glossary/contradiction-preservation.md)) applies here: the cost of a false positive (one unnecessary investigation) is far lower than the cost of a missed rationalization pattern (corrupted belief graph).

- **Assuming that smart people are immune to rationalization**: Research consistently shows that higher intelligence correlates with more sophisticated rationalization, not less. Smart people are better at constructing plausible-sounding justifications for biased conclusions. Automated enforcement is necessary precisely because human judgment, regardless of expertise, is vulnerable.

- **Confusing epistemic vigilance with epistemic paralysis**: Addiction Recovery does not prevent conclusions or decisions. It prevents conclusions and decisions based on suppressed evidence, inflated confidence, or unresolved contradictions. A belief that passes all vigilance checks with a clean graph can proceed to execution with full [NM/ND](@/glossary/nm-nd.md) commitment.

- **Neglecting the temporal dimension**: Individual operations may appear clean in isolation. The Addiction Recovery principle specifically addresses the case where a sequence of individually clean operations collectively produces rationalization. Without the temporal pattern analysis provided by the Vigilance Monitor, this failure mode goes undetected.

- **Treating enforcement as punitive rather than protective**: E2 BLOCK and E3 HALT are not punishments for bad behavior. They are safety mechanisms that prevent epistemic damage. The framing matters: teams that view enforcement as punitive will resist it; teams that view it as protective will welcome it.

## Use Cases

### Use Case 1: Due Diligence Evidence Integrity

During M&A due diligence, the Addiction Recovery principle prevents the common failure mode where initial findings bias subsequent evidence gathering. When an early assessment suggests the target company is low-risk, the natural tendency is to weight subsequent confirming evidence more heavily and treat contradictory signals as anomalies. The Vigilance Monitor detects this pattern through asymmetric confidence movement tracking: if confidence consistently moves in one direction without corresponding contradiction resolution, a warning is raised.

### Use Case 2: OSINT Source Validation

In Open Source Intelligence operations, the Addiction Recovery principle guards against source laundering -- the tendency to treat multiple articles referencing the same original source as independent confirmations. The independence group tracking mechanism traces provenance chains through media amplification networks, ensuring that ten news articles citing the same press release are counted as one signal, not ten.

### Use Case 3: Security Rating Calibration

The [Prismatic Perimeter](@/glossary/easm.md) security rating system uses Addiction Recovery to prevent rating drift. When a company's security posture is assessed, the rating must reflect current evidence with proper time decay applied. The Temporal Evasion pattern detection prevents ratings from remaining artificially stable when their evidence base has decayed below reliability thresholds.

### Use Case 4: Agent Reasoning Integrity

AI agents within the platform form beliefs through multi-step reasoning chains. The Addiction Recovery principle monitors these chains for progressive confidence inflation -- cases where each inference step slightly increases confidence beyond what the evidence supports, resulting in a final conclusion with dramatically inflated confidence. The per-operation check catches each inflation attempt, while the Vigilance Monitor catches cases where individually permissible increases accumulate beyond calibrated bounds.

## Related Concepts

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The parent epistemic framework whose seven axioms Addiction Recovery enforces through continuous vigilance
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- The specific axiom most directly protected by Addiction Recovery's anti-rationalization enforcement
- [Cherry Picking](@/glossary/cherry-picking.md) -- The evidence selection anti-pattern that Addiction Recovery detects and blocks
- [Signal Plurality](@/glossary/signal-plurality.md) -- The axiom preventing single-source beliefs, reinforced by source laundering detection
- [Belief Graph](@/glossary/belief-graph.md) -- The data structure monitored by the Vigilance Monitor for structural rationalization patterns
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- The quantitative system protected from inflation through calibrated deviation monitoring
- [Trinity Gate](@/glossary/trinity-gate.md) -- The verification gate that provides structural defense complementary to Addiction Recovery's temporal monitoring
- [Red Team](@/glossary/red-team.md) -- The adversarial team that tests Addiction Recovery resilience through drift induction scenarios
- [Blue Team](@/glossary/blue-team.md) -- The defensive team maintaining monitoring posture against rationalization patterns
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- The axiom enforcing traceability, preventing accountability evasion rationalization
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- The overall system property that Addiction Recovery protects from gradual erosion
- [QEVE](@/glossary/qeve.md) -- The verification engine implementing NABLA axiom checks that Addiction Recovery monitors for bypass attempts

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Agents](@/agents/_index.md) -- Full agent catalog including Vigilance Monitor agents

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
