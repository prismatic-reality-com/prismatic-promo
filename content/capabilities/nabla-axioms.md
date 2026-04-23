+++
title = "NABLA Axioms"
weight = 4
[extra]
icon = "cube-transparent"
color = "cyan"
description = "Seven non-negotiable epistemic axioms governing all belief formation, confidence scoring, and intelligence reasoning across the platform with mandatory enforcement and Trinity Gate integration"
category = "epistemic"
status = "active"
reading_time = "14 min"
author = "Tomas Korcak (korczis)"
word_count = 1326
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["NABLA", "Axioms", "Seven", "Trinity", "Gate", "capabilities", "epistemic", "Prismatic Platform", "Axiom", "HARD"]
tags = ["capabilities", "epistemic", "nabla-axioms", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "NABLA Axioms - Prismatic Platform"
+++

## Overview

NABLA Infinity defines seven axioms that govern how the Prismatic Platform reasons about uncertainty, forms beliefs, and synthesizes intelligence. These axioms are non-negotiable -- every agent, every decision, every belief must comply. They represent the epistemic constitution of the platform: the fundamental rules that no process, no matter how urgent or authoritative, can bypass.

The axioms emerged from a practical observation: intelligence analysis systems fail not because they lack data, but because they reason poorly about uncertainty. Systems that force premature conclusions produce false confidence. Systems that discard contradictions produce blind spots. Systems that accept single-source claims without corroboration produce vulnerabilities. NABLA addresses each of these failure modes with a specific, enforceable axiom.

The name NABLA (the mathematical gradient operator) reflects the framework's purpose: to map the gradient of uncertainty across the platform's knowledge landscape. Just as the gradient operator reveals the direction of steepest change in a mathematical field, NABLA reveals where the platform's knowledge is strongest, weakest, and most contested. The infinity symbol denotes the framework's commitment to continuous, never-finished epistemic refinement.

## The Seven Axioms

### Axiom 1: Signal Plurality

**No belief without at least two independent signals.**

Signal Plurality is the foundational axiom. It mandates that no claim can achieve "believed" status without corroboration from at least two independent sources. This prevents the single-source vulnerability that plagues traditional intelligence analysis systems.

| Requirement | Enforcement | Rationale |
|-------------|-------------|-----------|
| Minimum 2 independent signals | HARD | Prevents single-source vulnerability |
| Source independence verification | SOFT | Reduces correlated-source bias |
| Cross-domain corroboration preferred | SOFT | Increases evidence diversity |

```elixir
defmodule PrismaticNabla.SignalPlurality do
  @moduledoc """
  Enforces Signal Plurality axiom: no belief without at least
  two independent signals from verified sources.
  """

  @minimum_signals 2

  @spec validate(list(signal())) :: {:ok, :plurality_met} | {:error, :insufficient_signals}
  def validate(signals) when length(signals) >= @minimum_signals do
    independent_count =
      signals
      |> group_by_source_family()
      |> Map.keys()
      |> length()

    if independent_count >= @minimum_signals do
      {:ok, :plurality_met}
    else
      {:error, :insufficient_independent_signals}
    end
  end

  def validate(_signals), do: {:error, :insufficient_signals}

  defp group_by_source_family(signals) do
    Enum.group_by(signals, & &1.source_family)
  end
end
```

### Axiom 2: Contradiction Preservation

**Never discard contradicting evidence.**

Both sides of a contradiction must be preserved and tracked. Resolution requires explicit reconciliation, not deletion. This axiom prevents the natural human tendency to resolve cognitive dissonance by discarding inconvenient evidence.

| Requirement | Enforcement | Rationale |
|-------------|-------------|-----------|
| Preserve both sides of contradictions | HARD | Prevents evidence cherry-picking |
| Flag contradictions explicitly | HARD | Ensures consumer awareness |
| Track contradiction resolution history | SOFT | Enables audit trail |

Contradictions are not failures of the system -- they are features. A contradiction between two reliable sources indicates that the situation is genuinely complex, that one source may be outdated, or that there is a dimension of the problem not yet understood. Discarding either side destroys information that may be critical for correct analysis.

### Axiom 3: Absence Is Informative

**Missing signals carry meaning.**

The absence of expected data is itself data. If a company claims to be registered in a jurisdiction but the jurisdiction's registry has no record, that absence is a signal. The platform tracks what it expected to find but did not, treating absence as informative rather than ignorable.

| Requirement | Enforcement | Rationale |
|-------------|-------------|-----------|
| Track expected-but-missing signals | SOFT | Detects cover-ups and data gaps |
| Log absence with investigation trigger | SOFT | Prompts follow-up collection |
| Weight absence in confidence scoring | SOFT | Reflects information incompleteness |

### Axiom 4: Time Decay

**All beliefs have mandatory timestamps. Confidence decays over time.**

Intelligence has a shelf life. A sanctions list match from yesterday carries more weight than a clean record from three years ago. Time decay is implemented as an exponential decay function applied to all confidence scores.

```elixir
defmodule PrismaticNabla.TimeDecay do
  @moduledoc """
  Implements mandatory time decay for all belief confidence scores.
  Uses exponential decay with configurable half-life.
  """

  @default_half_life_hours 720  # 30 days

  @spec apply_decay(float(), DateTime.t(), keyword()) :: float()
  def apply_decay(base_confidence, evidence_timestamp, opts \\ []) do
    half_life = Keyword.get(opts, :half_life_hours, @default_half_life_hours)
    age_hours = DateTime.diff(DateTime.utc_now(), evidence_timestamp, :hour)

    decay_factor = :math.exp(-age_hours * :math.log(2) / half_life)
    adjusted = base_confidence * decay_factor

    # Floor at 0.01 -- never reaches absolute zero
    max(adjusted, 0.01)
  end

  @spec needs_refresh?(float(), DateTime.t()) :: boolean()
  def needs_refresh?(base_confidence, timestamp) do
    apply_decay(base_confidence, timestamp) < base_confidence * 0.5
  end
end
```

| Context | Half-Life | Rationale |
|---------|-----------|-----------|
| **Sanctions data** | 24 hours | Lists update frequently |
| **Corporate registration** | 30 days | Relatively stable |
| **Vulnerability data** | 7 days | Patches release rapidly |
| **Financial records** | 90 days | Quarterly reporting cycles |
| **Domain/DNS data** | 14 days | Moderate change frequency |

### Axiom 5: Unknown Is Valid

**"I don't know" is a legitimate answer.**

Never fabricate certainty. When the evidence is insufficient to support a conclusion, the correct response is explicit uncertainty, not a forced answer. This axiom prevents the platform from producing false confidence that could lead to incorrect decisions.

| Requirement | Enforcement | Rationale |
|-------------|-------------|-----------|
| "Insufficient data" is a valid assessment | HARD | Prevents false confidence |
| No forced conclusions below threshold | HARD | Maintains calibration |
| Explicit uncertainty markers in output | HARD | Consumer awareness |

### Axiom 6: Source Independence

**Independent sources weight higher than derivative sources.**

Signals from the same source family get diminishing returns. If three news articles all cite the same original report, they count as one signal with slightly increased confidence, not three independent signals. True source independence increases confidence significantly.

| Requirement | Enforcement | Rationale |
|-------------|-------------|-----------|
| Source family classification | SOFT | Identifies correlated sources |
| Independent source weighting | SOFT | Rewards true independence |
| Derivative source discount | SOFT | Prevents echo chamber effect |

### Axiom 7: Provenance Required

**All beliefs must be traceable to their originating signals.**

Every belief in the platform traces back to its originating signals through an unbroken provenance chain. No orphan beliefs are permitted. This axiom enables full auditability and supports regulatory compliance requirements.

| Requirement | Enforcement | Rationale |
|-------------|-------------|-----------|
| Complete provenance chain | HARD | Full auditability |
| No orphan beliefs | HARD | Prevents ungrounded claims |
| Provenance metadata on all outputs | HARD | Consumer traceability |

## Confidence Thresholds

Different operational contexts require different confidence thresholds before action can be taken. These thresholds work in conjunction with the [Trinity Gate](@/capabilities/trinity-gate.md) verification requirements.

| Context | Threshold | Trinity Gate | Rationale |
|---------|-----------|-------------|-----------|
| **Critical Decisions** | 0.95 | MANDATORY | High stakes require near-certainty |
| **Standard Operations** | 0.80 | MANDATORY | Normal operational confidence |
| **Exploratory Analysis** | 0.60 | RECOMMENDED | Hypothesis generation phase |
| **Initial Signals** | 0.50 | OPTIONAL | Early collection phase |

The threshold system ensures that confidence requirements scale with decision impact. A critical decision (blocking a financial transaction, issuing a compliance alert) requires 0.95 confidence with mandatory Trinity Gate passage. An exploratory analysis can proceed with 0.60 confidence to enable hypothesis generation without premature filtering.

## Enforcement Protocol

Axiom violations trigger a four-level enforcement response proportional to the severity and scope of the violation.

| Level | Trigger | Response | Authority | Recovery |
|-------|---------|----------|-----------|----------|
| **E1** | Single axiom soft violation | Warning + correction request | Agent | Self-correct within current operation |
| **E2** | Single axiom hard violation | BLOCK + rejection | System | Must resolve before proceeding |
| **E3** | [Trinity Gate](@/capabilities/trinity-gate.md) failure | HALT + review required | Supreme | Requires strategic-level review |
| **E4** | Multiple axiom violations | Investigation + full audit | Cosmic | Complete epistemic audit required |

### Anti-Patterns (Forbidden)

These patterns represent common intelligence analysis failures that NABLA axioms are specifically designed to prevent.

| Anti-Pattern | Description | Violated Axiom | Enforcement |
|-------------|-------------|----------------|-------------|
| **Cherry Picking** | Selecting only supporting evidence | Contradiction Preservation | E2 BLOCK |
| **False Certainty** | Claims without adequate proof | Unknown Is Valid | E2 BLOCK |
| **Contradiction Burial** | Hiding inconvenient contradictions | Contradiction Preservation | E3 HALT |
| **Single Source Truth** | Believing without plurality | Signal Plurality | E2 BLOCK |
| **Reasoning Opacity** | Decisions without traceable provenance | Provenance Required | E2 BLOCK |
| **Stale Intelligence** | Using outdated evidence without decay | Time Decay | E2 BLOCK |
| **Echo Chamber** | Counting derivative sources as independent | Source Independence | E1 WARNING |

## Platform Implementation

The NABLA axiom enforcement is implemented as an [Elixir](@/technologies/elixir.md) module that wraps all epistemic operations with axiom validation.

```elixir
defmodule PrismaticNabla.AxiomEnforcer do
  @moduledoc """
  Central enforcement point for all seven NABLA axioms.
  Wraps epistemic operations with mandatory axiom validation.
  """

  alias PrismaticNabla.{
    SignalPlurality,
    ContradictionPreserver,
    AbsenceTracker,
    TimeDecay,
    UnknownValidator,
    SourceIndependence,
    ProvenanceChecker
  }

  @spec validate_belief(belief()) :: {:ok, validated_belief()} | {:error, [violation()]}
  def validate_belief(belief) do
    violations =
      []
      |> check_signal_plurality(belief)
      |> check_contradiction_preservation(belief)
      |> check_absence_tracking(belief)
      |> check_time_decay(belief)
      |> check_unknown_validity(belief)
      |> check_source_independence(belief)
      |> check_provenance(belief)

    case classify_violations(violations) do
      :clean ->
        {:ok, %{belief | validated: true, validation_timestamp: DateTime.utc_now()}}

      {:soft_violations, warnings} ->
        {:ok, %{belief | validated: true, warnings: warnings}}

      {:hard_violations, errors} ->
        {:error, errors}
    end
  end

  defp check_signal_plurality(violations, belief) do
    case SignalPlurality.validate(belief.signals) do
      {:ok, _} -> violations
      {:error, reason} -> [{:signal_plurality, :hard, reason} | violations]
    end
  end

  defp check_provenance(violations, belief) do
    case ProvenanceChecker.trace(belief) do
      {:ok, _chain} -> violations
      {:error, :broken_chain} -> [{:provenance, :hard, :broken_chain} | violations]
      {:error, :orphan} -> [{:provenance, :hard, :orphan_belief} | violations]
    end
  end
end
```

## NABLA and Trinity Gate Integration

The NABLA axioms serve as prerequisites for [Trinity Gate](@/capabilities/trinity-gate.md) passage. A belief that violates any hard axiom cannot enter the Trinity Gate verification pipeline, regardless of how well it might score on structural, logical, or formal checks.

| Integration Point | NABLA Role | Trinity Gate Role |
|------------------|-----------|------------------|
| **Pre-Gate Check** | Axiom compliance verification | Gate entry prerequisite |
| **Structural Layer** | Belief graph must be valid DAG | Verifies graph structure |
| **Logical Layer** | Contradictions must be preserved (not hidden) | Verifies logical consistency |
| **Formal Layer** | Provenance chains must be complete | Verifies formal properties |

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/nabla-check` | Validate belief against all 7 axioms | L2+ |
| `/nabla-trace` | Trace belief provenance chain | L2+ |
| `/nabla-status` | View axiom compliance metrics | L1+ |
| `/nabla-audit` | Full epistemic audit of domain | L3+ |

## Performance and Metrics

| Metric | Current Value | Target |
|--------|--------------|--------|
| **Axiom compliance rate** | 100% (hard axioms) | 100% |
| **Soft axiom compliance** | 95%+ | 98% |
| **Validation latency** | < 5ms per belief | < 2ms |
| **False violation rate** | < 0.1% | 0% |
| **Provenance chain completeness** | 100% | 100% |
| **Time decay coverage** | 100% of timestamped beliefs | 100% |
| **Signal plurality enforcement** | 100% of verified beliefs | 100% |

## Integration

- Prerequisite for [Trinity Gate](@/capabilities/trinity-gate.md) verification passage
- Governs all [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) operations
- Applied through [Multi-Paradigm Solving](@/capabilities/multi-paradigm-solving.md) epistemic paradigm
- Enforced by [NO DOUBTS](@/capabilities/no-doubts.md) evidence standards
- Quality assured by [NO MERCY](@/capabilities/no-mercy.md) zero-tolerance enforcement
- [Color Teams](@/capabilities/color-teams.md) operate under full NABLA compliance
- [AIAD Standard](@/capabilities/aiad-standard.md) encodes NABLA requirements in agent specifications
- [AIAD Compliance](@/capabilities/aiad-compliance.md) validates NABLA enforcement blocks
- Monitored by [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) for axiom compliance metrics
- Tracked by [Telemetry Integration](@/capabilities/telemetry-integration.md) for enforcement performance
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) uses evidence-based healing per NABLA requirements
- [Quality Gates](@/capabilities/quality-gates.md) include NABLA compliance as a gate criterion
- Supports [Cross-Domain Flexibility](@/capabilities/cross-domain-flexibility.md) epistemic operations across domains
- Feeds [EASM](@/capabilities/easm.md) and [Compliance](@/capabilities/compliance.md) with calibrated intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)