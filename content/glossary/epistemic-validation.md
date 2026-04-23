+++
title = "Epistemic Validation"
weight = 50
[extra]
tags = ["glossary", "epistemic", "validation", "verification", "nabla", "trinity-gate", "quality", "evidence"]
description = "Epistemic validation is the rigorous verification process that ensures every knowledge claim, system assertion, and architectural decision in the Prismatic Platform meets evidence-based standards before being accepted as operational truth."
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["epistemic-development", "epistemic-reasoning", "epistemic-robustness", "trinity-gate", "nabla-infinity", "formal-verification", "signal-plurality", "contradiction-preservation", "confidence-threshold", "evidence"]
key_technologies = ["Elixir", "OTP", "GenServer", "Dialyzer", "ExUnit", "Lean4"]
platform_relevance = "critical"
aliases = ["knowledge-validation", "epistemic-verification"]
version = "2.0.0"
date_created = "2025-06-15"
date_updated = "2026-02-22"
word_count = 1814
date_modified = "2026-02-23"
keywords = ["Epistemic", "Validation", "Prismatic", "Platform", "glossary", "Prismatic Platform", "Trinity Gate", "Epistemic Validation"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Epistemic Validation - Prismatic Platform"
+++

## Definition

Epistemic validation is the systematic process of verifying that knowledge claims within a software system meet rigorous evidence-based standards before being accepted as operational truth. In contrast to conventional software validation -- which asks "does the code do what the specification says?" -- epistemic validation asks a deeper question: "do we have sufficient, independent, non-contradictory evidence to believe this claim, and can we prove it structurally, logically, and formally?"

Within the Prismatic Platform, epistemic validation serves as the gatekeeper between unverified assertions and accepted knowledge. No system output, architectural decision, or operational claim is emitted without passing through the epistemic validation pipeline. This discipline ensures that the platform's quality score (currently 100/100 across 13 domains) reflects genuine verified knowledge rather than accumulated assumptions.

The concept originates from epistemology's distinction between belief and justified belief. A developer might believe their code handles all edge cases; epistemic validation demands proof. A monitoring dashboard might display "system healthy"; epistemic validation requires that this claim be backed by evidence from multiple independent sources, with any contradictions explicitly preserved and flagged.

## Overview

Epistemic validation operates at multiple granularities within the Prismatic Platform, from individual function assertions to system-wide architectural claims.

At the **micro level**, every function's type specification is validated by Dialyzer, every behavior contract is verified by ExUnit, and every property assertion is tested across randomized inputs by StreamData. These validations produce evidence artifacts that feed into the broader epistemic pipeline.

At the **meso level**, module-level claims about performance, reliability, and correctness are validated through integration tests, telemetry analysis, and cross-module consistency checks. A module claiming O(1) lookup performance must produce benchmark evidence. A module claiming fault tolerance must survive chaos engineering scenarios.

At the **macro level**, architectural claims about system properties (scalability, security posture, compliance) are validated through the Trinity Gate: structural consistency (the dependency graph forms a valid DAG), logical consistency (architectural invariants are not contradicted by implementation), and formal necessity (critical properties are proven in formal systems like Lean4).

The validation pipeline is not a one-time gate but a continuous process. Time decay reduces the confidence of older validations, and new evidence from runtime observations can invalidate previously accepted claims. The system maintains a living knowledge graph where every node represents a validated claim and every edge represents an evidence relationship.

A critical principle of epistemic validation is non-destructive contradiction handling. When new evidence contradicts a previously validated claim, the system does not silently overwrite the old claim. Instead, it preserves both claims, records the contradiction, and escalates for investigation. This follows the Addiction Preservation doctrine: the platform refuses to smooth over inconvenient truths.

## Technical Details

The epistemic validation subsystem in the Prismatic Platform is implemented as a set of composable Elixir modules that integrate with the OTP supervision hierarchy.

### The Validation Pipeline

```elixir
defmodule Prismatic.Epistemic.Validator do
  @moduledoc """
  Core epistemic validation engine. Processes knowledge claims through
  a multi-stage pipeline enforcing NABLA axioms and Trinity Gate passage.
  """

  alias Prismatic.Epistemic.{EvidenceCollector, ContradictionDetector, TrinityGate}

  @type validation_result :: %{
    claim_id: String.t(),
    status: :validated | :rejected | :insufficient_evidence | :contradiction_detected,
    confidence: float(),
    evidence_summary: [evidence_summary()],
    contradictions: [contradiction()],
    trinity_gate_result: trinity_result(),
    validated_at: DateTime.t()
  }

  @type evidence_summary :: %{
    source_type: atom(),
    source_count: non_neg_integer(),
    supporting: non_neg_integer(),
    contradicting: non_neg_integer()
  }

  @type trinity_result :: %{
    structural: :pass | :fail,
    logical: :pass | :fail,
    formal: :pass | :fail | :skipped
  }

  @type contradiction :: %{
    claim_a: String.t(),
    claim_b: String.t(),
    nature: String.t(),
    severity: :low | :medium | :high | :critical
  }

  @spec validate(map(), keyword()) :: {:ok, validation_result()} | {:error, term()}
  def validate(claim, opts \\ []) do
    context = Keyword.get(opts, :context, :standard)

    with {:ok, evidence} <- EvidenceCollector.gather(claim),
         {:ok, plurality} <- check_plurality(evidence),
         {:ok, contradictions} <- ContradictionDetector.scan(claim, evidence),
         {:ok, trinity} <- TrinityGate.evaluate(claim, evidence),
         {:ok, confidence} <- compute_confidence(evidence, contradictions, trinity) do
      result = %{
        claim_id: claim.id,
        status: determine_status(confidence, context, contradictions),
        confidence: confidence,
        evidence_summary: summarize_evidence(evidence),
        contradictions: contradictions,
        trinity_gate_result: trinity,
        validated_at: DateTime.utc_now()
      }

      {:ok, result}
    end
  end

  defp check_plurality(evidence) do
    source_types =
      evidence
      |> Enum.map(& &1.source_type)
      |> Enum.uniq()
      |> length()

    if source_types >= 2 do
      {:ok, source_types}
    else
      {:error, {:insufficient_plurality, source_types, "minimum 2 independent source types required"}}
    end
  end

  defp compute_confidence(evidence, contradictions, trinity) do
    base_confidence =
      evidence
      |> Enum.map(& &1.weight)
      |> Enum.sum()
      |> min(1.0)

    contradiction_penalty = length(contradictions) * 0.05

    trinity_bonus =
      case trinity do
        %{structural: :pass, logical: :pass, formal: :pass} -> 0.1
        %{structural: :pass, logical: :pass, formal: :skipped} -> 0.05
        _ -> 0.0
      end

    final = max(0.0, min(1.0, base_confidence - contradiction_penalty + trinity_bonus))
    {:ok, final}
  end

  defp determine_status(confidence, context, contradictions) do
    threshold = Prismatic.Epistemic.ConfidenceThreshold.get(context)

    cond do
      length(contradictions) > 0 and Enum.any?(contradictions, &(&1.severity == :critical)) ->
        :contradiction_detected

      confidence >= threshold ->
        :validated

      confidence >= threshold * 0.8 ->
        :insufficient_evidence

      true ->
        :rejected
    end
  end

  defp summarize_evidence(evidence) do
    evidence
    |> Enum.group_by(& &1.source_type)
    |> Enum.map(fn {type, items} ->
      %{
        source_type: type,
        source_count: length(items),
        supporting: Enum.count(items, &(&1.verdict == :supporting)),
        contradicting: Enum.count(items, &(&1.verdict == :contradicting))
      }
    end)
  end
end
```

### Evidence Collection from Multiple Sources

```elixir
defmodule Prismatic.Epistemic.EvidenceCollector do
  @moduledoc """
  Collects evidence from multiple independent sources to support
  or contradict knowledge claims. Enforces source independence.
  """

  @evidence_sources [
    Prismatic.Epistemic.Sources.StaticAnalysis,
    Prismatic.Epistemic.Sources.DynamicTesting,
    Prismatic.Epistemic.Sources.RuntimeObservation,
    Prismatic.Epistemic.Sources.FormalProof,
    Prismatic.Epistemic.Sources.HistoricalData
  ]

  @spec gather(map()) :: {:ok, [map()]} | {:error, term()}
  def gather(claim) do
    evidence =
      @evidence_sources
      |> Task.async_stream(fn source -> source.collect(claim) end,
        max_concurrency: 5,
        timeout: 30_000
      )
      |> Enum.flat_map(fn
        {:ok, {:ok, items}} -> items
        {:ok, {:error, _reason}} -> []
        {:exit, _reason} -> []
      end)
      |> apply_time_decay()

    {:ok, evidence}
  end

  defp apply_time_decay(evidence) do
    now = DateTime.utc_now()

    Enum.map(evidence, fn item ->
      age_hours = DateTime.diff(now, item.collected_at, :hour)
      decay = :math.exp(-age_hours / 720)
      %{item | weight: item.weight * decay}
    end)
  end
end
```

### Contradiction Detection with Preservation

```elixir
defmodule Prismatic.Epistemic.ContradictionDetector do
  @moduledoc """
  Detects contradictions between evidence items and existing beliefs.
  Contradictions are PRESERVED, never discarded. This implements the
  Addiction Preservation doctrine at the code level.
  """

  @spec scan(map(), [map()]) :: {:ok, [map()]} | {:error, term()}
  def scan(claim, evidence) do
    contradictions =
      evidence
      |> find_internal_contradictions()
      |> Kernel.++(find_external_contradictions(claim))
      |> Enum.map(&classify_severity/1)

    {:ok, contradictions}
  end

  defp find_internal_contradictions(evidence) do
    for a <- evidence,
        b <- evidence,
        a.id < b.id,
        contradicts?(a, b) do
      %{
        claim_a: a.id,
        claim_b: b.id,
        nature: "Internal evidence conflict: #{a.summary} vs #{b.summary}",
        severity: :medium
      }
    end
  end

  defp find_external_contradictions(claim) do
    case Prismatic.Epistemic.BeliefRegistry.find_contradictions(claim.id) do
      {:ok, found} -> found
      {:error, _} -> []
    end
  end

  defp contradicts?(evidence_a, evidence_b) do
    evidence_a.verdict != evidence_b.verdict and
      evidence_a.domain == evidence_b.domain
  end

  defp classify_severity(contradiction) do
    severity =
      cond do
        String.contains?(contradiction.nature, "security") -> :critical
        String.contains?(contradiction.nature, "performance") -> :high
        String.contains?(contradiction.nature, "correctness") -> :high
        true -> :medium
      end

    %{contradiction | severity: severity}
  end
end
```

## Implementation

Implementing epistemic validation within the Prismatic Platform requires integration at multiple levels of the software lifecycle.

### Build-Time Validation

During compilation, the platform runs Dialyzer for type-level validation and Credo for style and consistency checks. These tools produce evidence artifacts that are automatically registered in the evidence pipeline. The `--warnings-as-errors` flag ensures that any ambiguity in type specifications is treated as an epistemic failure, not a mere warning.

### Test-Time Validation

ExUnit tests produce behavioral evidence. Property-based tests with StreamData produce statistical evidence across randomized inputs. Each test assertion is mapped to a specific knowledge claim, creating a direct traceability link between test results and epistemic beliefs. The platform currently maintains 121 tests across three phases, with each test producing structured evidence records.

### Runtime Validation

Telemetry events from the Phoenix application, GenServer state observations, and ETS table statistics provide continuous runtime evidence. The Quality Floor Guardian monitors these signals and triggers re-validation when metrics drift outside expected ranges. The circuit breaker pattern in the SessionLifecycle GenServer provides runtime evidence about system stability.

### Formal Validation

For critical properties, Lean4 proofs provide the highest level of evidence. While not all claims require formal proof, security-critical and safety-critical properties (such as the isolation guarantees of the Black Team sandbox) are backed by formal verification. The Trinity Gate's formal necessity check determines which claims require this level of evidence.

### Continuous Re-Validation

A scheduled process re-validates aging beliefs by re-running evidence collection against current system state. Claims whose confidence drops below the threshold for their operational context are flagged for human review. This prevents the accumulation of stale knowledge that no longer reflects reality.

## Comparison

### Epistemic Validation vs. Input Validation

| Aspect | Input Validation | Epistemic Validation |
|--------|-----------------|---------------------|
| **Scope** | User-provided data | All system knowledge claims |
| **Method** | Schema/type checking | Multi-source evidence pipeline |
| **Output** | Accept/reject | Confidence score with evidence chain |
| **Lifecycle** | Per-request | Continuous with time decay |
| **Contradictions** | N/A | Explicitly preserved and tracked |

### Epistemic Validation vs. Quality Gates

Quality gates are a subset of epistemic validation. A quality gate checks whether specific metrics meet thresholds (test coverage, Credo violations, compilation warnings). Epistemic validation goes further by asking whether those metrics actually prove what they claim to prove, whether contradictory evidence exists, and whether the evidence is sufficiently independent and recent.

### Epistemic Validation vs. Formal Verification

Formal verification provides mathematical proofs within a defined model. Epistemic validation uses formal verification as one evidence source among many, recognizing that the model itself may not capture all real-world conditions. Formal verification answers "is this true in the model?"; epistemic validation answers "do we have sufficient reason to believe this is true in production?"

## Best Practices

1. **Validate early and continuously.** Do not treat validation as a gate at the end of the pipeline. Integrate it at every stage: compilation, testing, deployment, and runtime.

2. **Require independent evidence sources.** A claim supported only by unit tests lacks signal plurality. Combine unit tests with integration tests, static analysis, and runtime observation.

3. **Never discard contradicting evidence.** When evidence contradicts a validated claim, preserve both the claim and the contradiction. Resolution requires new evidence, not deletion of inconvenient data.

4. **Track validation provenance.** For every validated claim, maintain a complete chain from the original evidence through each transformation step to the final confidence score. This enables auditing and debugging of false validations.

5. **Apply context-appropriate thresholds.** Critical production paths require confidence >= 0.95 with mandatory Trinity Gate passage. Exploratory research can operate at confidence >= 0.60 with optional Trinity Gate.

6. **Automate re-validation.** Do not rely on manual re-testing. Implement scheduled re-validation that automatically rechecks aging claims against current evidence.

7. **Monitor the validators themselves.** The validation pipeline is itself a system that can fail. Apply epistemic principles recursively: validate that your validators are working correctly.

## Common Pitfalls

1. **Validation theater.** Running tests without connecting them to epistemic claims creates the appearance of validation without the substance. Every test must map to a specific knowledge claim.

2. **False confidence from passing tests.** A test suite with 100% pass rate does not mean 100% confidence. The tests may not cover the relevant claims, or they may test against a model that does not match production reality.

3. **Ignoring absence of evidence.** The absence of contradicting evidence is not the same as the presence of supporting evidence. If a claim has not been tested, its confidence should be zero, not assumed high.

4. **Over-reliance on a single validation method.** Using only Dialyzer, or only unit tests, or only formal proofs creates a brittle validation structure. Diversity of evidence sources is the foundation of robust epistemic validation.

5. **Treating validation as binary.** Claims are not simply "valid" or "invalid." They exist on a confidence spectrum that changes over time. Building systems that only accept binary validation results throws away critical nuance.

6. **Skipping formal checks for convenience.** Under time pressure, teams may skip Trinity Gate passage for "simple" changes. This creates epistemic debt that compounds over time and undermines the integrity of the entire knowledge base.

7. **Conflating correlation with evidence.** Two metrics that move together do not necessarily validate each other. Evidence must be causally connected to the claim it supports, not merely correlated.

## Use Cases

### Security Rating Validation

When the Prismatic Perimeter module assigns a security rating to a domain (e.g., grade B+, score 780), this rating is an epistemic claim. The validation pipeline gathers evidence from certificate analysis, vulnerability scanning, DNS configuration checks, and compliance assessments. Each evidence source independently contributes to the confidence score. Contradictions (e.g., valid certificate but deprecated cipher suite) are preserved in the rating explanation.

### Agent Promotion Decisions

When an AIAD agent is proposed for promotion from L2 (tactical) to L3 (strategic), the promotion decision is treated as an epistemic claim. Evidence is gathered from the agent's performance history, test coverage, decision accuracy, and peer review. The Trinity Gate ensures structural consistency (the agent's dependencies are valid), logical consistency (the agent's behavior follows from its specification), and formal necessity (critical invariants are maintained).

### Quality Score Maintenance

The platform's quality score of 100/100 is itself an epistemic claim that must be continuously validated. Each of the 13 quality domains produces independent evidence. The quality monitoring system detects contradictions (e.g., zero Credo violations but a newly introduced pattern that should be flagged) and triggers re-validation cycles.

### Compliance Assertion

When the platform asserts NIS2 or ZKB compliance, each compliance requirement maps to specific evidence sources. The epistemic validation pipeline checks that evidence is recent (time decay), independent (source diversity), and non-contradictory. Compliance reports include confidence levels for each requirement, allowing stakeholders to understand exactly where certainty is high and where additional evidence is needed.

### Evolution Gate

Before the platform advances to a new generation (currently Gen 19), the evolution proposal is validated as an epistemic claim. Expected improvements must be supported by evidence from benchmarks, regression tests, and architectural analysis. The system does not evolve based on hope; it evolves based on validated knowledge.

## Related Concepts

- [Epistemic Development](@/glossary/epistemic-development.md) -- The broader methodology within which epistemic validation operates as the primary verification mechanism.
- [Trinity Gate](@/glossary/trinity-gate.md) -- The three-layer verification gate (structural, logical, formal) that provides the highest level of epistemic validation.
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework defining the seven axioms enforced during validation.
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- The doctrine ensuring that contradicting evidence is never discarded during validation.
- [Signal Plurality](@/glossary/signal-plurality.md) -- The axiom requiring minimum two independent evidence sources for validated beliefs.
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- The context-dependent minimum confidence levels enforced by the validation pipeline.
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proof techniques serving as one evidence source in the validation pipeline.
- [Evidence](@/glossary/evidence.md) -- The fundamental data unit consumed and produced by the validation process.
- [Quality Gates](@/glossary/quality-gates.md) -- Enforcement mechanisms that integrate epistemic validation into the CI/CD pipeline.
- [Proves Before Claiming](@/glossary/proves-before-claiming.md) -- The operational principle that epistemic validation must precede any system assertion.

## See Also

- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- The concrete multi-stage implementation of the validation flow.
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- How well validated knowledge withstands adversarial challenges.
- [Continuous Validation](@/glossary/continuous-validation.md) -- The practice of re-validating beliefs over time with fresh evidence.
- [Verification](@/glossary/verification.md) -- General verification concepts and their relationship to epistemic validation.
- [Property-Based Testing](@/glossary/property-based-testing.md) -- A statistical evidence source that feeds into the epistemic validation pipeline.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** -- Building verifiable knowledge systems with rigorous epistemic foundations.

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | Glossary Index
