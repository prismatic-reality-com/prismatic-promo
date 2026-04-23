+++
title = "Quality Evidence Truth"
weight = 50
[extra]
tags = ["glossary", "epistemic", "quality", "evidence", "truth", "verification", "nabla", "trinity-gate", "formal-methods", "provenance"]
description = "Quality Evidence Truth (QET) is the epistemic framework requiring that every quality claim in a software system be grounded in verifiable evidence that has passed through formal verification gates, eliminating the gap between asserted and actual quality"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["quality-and-transparency", "trinity-gate", "nabla-infinity", "evidence", "formal-verification", "contradiction-preservation", "provenance-mandatory", "quality-gate", "epistemic-robustness", "proves-before-claiming"]
keywords = ["quality evidence", "evidence-based quality", "quality truth", "verifiable quality", "quality provenance", "epistemic quality", "quality verification", "quality proof", "evidence chain", "quality epistemology"]
testing_scenarios = ["verify every quality claim has traceable evidence chain", "validate Trinity Gate passage for critical quality assertions", "test evidence provenance is complete from raw data to verdict", "confirm stale evidence triggers re-verification", "ensure contradictory evidence is preserved not suppressed"]
prerequisites = ["quality-gate", "trinity-gate", "nabla-infinity", "formal-verification"]
learning_path = ["evidence", "quality", "quality-evidence-truth", "trinity-gate", "nabla-infinity"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
word_count = 1845
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Evidence Truth - Prismatic Platform"
+++

## Definition

Quality Evidence Truth (QET) is the epistemic framework that governs how quality claims are established, validated, and maintained within the Prismatic Platform. The framework operates on a simple but powerful premise: a quality claim is only as strong as the evidence supporting it, and that evidence must be verifiable, traceable, and resistant to manipulation. QET bridges the gap between software engineering (where quality is measured) and epistemology (where truth is established), creating a rigorous foundation for quality assertions that goes far beyond conventional testing approaches.

At its core, QET requires three properties for any quality claim to be considered established:

1. **Evidence**: There must be concrete, machine-verifiable evidence supporting the claim (test results, static analysis outputs, formal proofs)
2. **Provenance**: The evidence must have a complete chain of custody from raw observation to final verdict
3. **Trinity Passage**: For critical claims, the evidence must pass all three gates of the Trinity Gate (structural consistency, logical consistency, formal necessity)

Without all three properties, a quality claim remains a hypothesis, not an established truth. This distinction is not academic -- it determines whether code can be merged, deployed, or trusted.

## Overview

The software industry has a chronic problem with quality assertions. Teams say "the code is well-tested" when coverage is 60%. Organizations claim "we follow best practices" without defining what those practices are or measuring compliance. CI pipelines show green checkmarks that hide suppressed warnings, skipped tests, and ignored linter outputs. The distance between claimed quality and actual quality is often enormous, and the tools to bridge that gap are inadequate.

Quality Evidence Truth addresses this problem by applying epistemic rigor to quality claims. Drawing from the NABLA Infinity framework's seven axioms (Signal Plurality, Contradiction Preservation, Absence Informative, Time Decay, Unknown Valid, Source Independence, Provenance Mandatory), QET constructs a quality epistemology that treats quality assertions with the same skepticism and rigor that scientific claims receive in peer-reviewed research.

The framework recognizes several categories of quality evidence:

**Direct Evidence**: Test results, compilation outputs, static analysis findings. These are the most common form of quality evidence and the easiest to automate. A passing test suite is direct evidence of functional correctness for the tested scenarios.

**Derived Evidence**: Metrics computed from direct evidence, such as code coverage percentages, cyclomatic complexity scores, and defect density calculations. Derived evidence is useful for aggregation but carries the risk of metric gaming.

**Structural Evidence**: Properties of the code's structure that imply quality characteristics, such as module cohesion, coupling measurements, and dependency graph analysis. Structural evidence is harder to game because it reflects deep architectural properties.

**Temporal Evidence**: Quality trends over time, including regression detection, quality score trajectories, and defect escape rates. Temporal evidence provides context that point-in-time measurements cannot.

**Absence Evidence**: The notable lack of something -- no warnings, no type errors, no security vulnerabilities found. Per the NABLA axiom, absence is informative and must be treated as evidence, not ignored.

Each category has different strengths and weaknesses, and QET requires plurality (multiple independent evidence sources) before establishing a quality claim as truth.

## Technical Details

### The Evidence Chain

```elixir
defmodule Prismatic.Quality.EvidenceChain do
  @moduledoc """
  Implements a complete evidence chain from raw observation to
  quality verdict. Every link in the chain is immutable and
  timestamped, creating a provenance trail that satisfies
  the NABLA Provenance Mandatory axiom.
  """

  @type evidence_link :: %{
          id: binary(),
          type: :observation | :analysis | :derivation | :verdict,
          source: atom(),
          timestamp: DateTime.t(),
          parent_ids: [binary()],
          payload: map(),
          confidence: float(),
          hash: binary()
        }

  @type chain :: %{
          verdict_id: binary(),
          links: %{binary() => evidence_link()},
          root_ids: [binary()],
          integrity: :valid | :broken
        }

  @spec build_link(atom(), map(), [binary()], float()) :: evidence_link()
  def build_link(source, payload, parent_ids, confidence) do
    link = %{
      id: generate_id(),
      type: classify_type(parent_ids),
      source: source,
      timestamp: DateTime.utc_now(),
      parent_ids: parent_ids,
      payload: payload,
      confidence: confidence,
      hash: nil
    }

    %{link | hash: compute_hash(link)}
  end

  @spec validate_chain(chain()) :: {:ok, chain()} | {:error, :broken_provenance}
  def validate_chain(%{links: links} = chain) do
    valid? =
      Enum.all?(links, fn {_id, link} ->
        Enum.all?(link.parent_ids, &Map.has_key?(links, &1)) and
          verify_hash(link)
      end)

    if valid? do
      {:ok, %{chain | integrity: :valid}}
    else
      {:error, :broken_provenance}
    end
  end

  @spec compute_confidence(chain()) :: float()
  def compute_confidence(%{links: links, verdict_id: verdict_id}) do
    verdict = Map.fetch!(links, verdict_id)
    traverse_confidence(verdict, links)
  end

  defp traverse_confidence(%{parent_ids: [], confidence: c}, _links), do: c

  defp traverse_confidence(%{parent_ids: parents, confidence: c}, links) do
    parent_confidences =
      parents
      |> Enum.map(&Map.fetch!(links, &1))
      |> Enum.map(&traverse_confidence(&1, links))

    min_parent = Enum.min(parent_confidences)
    c * min_parent
  end

  defp generate_id, do: :crypto.strong_rand_bytes(16) |> Base.encode16(case: :lower)

  defp classify_type([]), do: :observation
  defp classify_type(_parents), do: :derivation

  defp compute_hash(link) do
    data = :erlang.term_to_binary(Map.delete(link, :hash))
    :crypto.hash(:sha256, data) |> Base.encode16(case: :lower)
  end

  defp verify_hash(link) do
    expected = compute_hash(link)
    link.hash == expected
  end
end
```

### Trinity Gate Integration

```elixir
defmodule Prismatic.Quality.TrinityVerifier do
  @moduledoc """
  Verifies quality claims through the three gates of the
  Trinity Gate: Structural Consistency, Logical Consistency,
  and Formal Necessity. All three MUST pass for a quality
  claim to be elevated from hypothesis to established truth.
  """

  alias Prismatic.Quality.EvidenceChain

  @type gate_result :: %{
          gate: :structural | :logical | :formal,
          passed: boolean(),
          evidence: [map()],
          confidence: float()
        }

  @type trinity_result :: %{
          all_passed: boolean(),
          gates: [gate_result()],
          overall_confidence: float(),
          verdict: :established | :hypothesis | :refuted
        }

  @spec verify(EvidenceChain.chain(), keyword()) :: {:ok, trinity_result()} | {:error, term()}
  def verify(chain, opts \\ []) do
    with {:ok, validated_chain} <- EvidenceChain.validate_chain(chain),
         {:ok, structural} <- gate_structural(validated_chain, opts),
         {:ok, logical} <- gate_logical(validated_chain, opts),
         {:ok, formal} <- gate_formal(validated_chain, opts) do
      gates = [structural, logical, formal]
      all_passed = Enum.all?(gates, & &1.passed)

      overall_confidence =
        gates
        |> Enum.map(& &1.confidence)
        |> Enum.min()

      verdict =
        cond do
          all_passed and overall_confidence >= 0.95 -> :established
          all_passed -> :hypothesis
          true -> :refuted
        end

      {:ok, %{
        all_passed: all_passed,
        gates: gates,
        overall_confidence: overall_confidence,
        verdict: verdict
      }}
    end
  end

  defp gate_structural(chain, _opts) do
    {:ok, valid_chain} = EvidenceChain.validate_chain(chain)
    confidence = EvidenceChain.compute_confidence(valid_chain)

    {:ok, %{
      gate: :structural,
      passed: valid_chain.integrity == :valid,
      evidence: [%{check: :dag_validity, result: :valid}],
      confidence: confidence
    }}
  end

  defp gate_logical(chain, _opts) do
    links = Map.values(chain.links)
    contradictions = find_contradictions(links)
    passed = Enum.empty?(contradictions) or all_acknowledged?(contradictions)

    {:ok, %{
      gate: :logical,
      passed: passed,
      evidence: [%{contradictions_found: length(contradictions)}],
      confidence: if(passed, do: 0.95, else: 0.0)
    }}
  end

  defp gate_formal(chain, opts) do
    critical? = Keyword.get(opts, :critical, false)
    confidence = EvidenceChain.compute_confidence(chain)
    passed = if critical?, do: confidence >= 0.95, else: confidence >= 0.80

    {:ok, %{
      gate: :formal,
      passed: passed,
      evidence: [%{confidence_threshold_met: passed}],
      confidence: confidence
    }}
  end

  defp find_contradictions(links) do
    links
    |> Enum.group_by(& &1.source)
    |> Enum.flat_map(fn {_source, source_links} ->
      source_links
      |> Enum.chunk_every(2, 1, :discard)
      |> Enum.filter(fn [a, b] -> contradicts?(a, b) end)
    end)
  end

  defp contradicts?(a, b) do
    a.payload[:verdict] != nil and b.payload[:verdict] != nil and
      a.payload[:verdict] != b.payload[:verdict]
  end

  defp all_acknowledged?(contradictions) do
    Enum.all?(contradictions, fn [a, _b] ->
      Map.get(a.payload, :contradiction_acknowledged, false)
    end)
  end
end
```

### Time Decay for Evidence Freshness

```elixir
defmodule Prismatic.Quality.EvidenceFreshness do
  @moduledoc """
  Implements the NABLA Time Decay axiom for quality evidence.
  Evidence loses confidence over time and must be refreshed
  to maintain quality truth claims.
  """

  @decay_rates %{
    test_result: {24, :hours},
    static_analysis: {48, :hours},
    security_scan: {7, :days},
    formal_proof: {90, :days},
    coverage_report: {24, :hours}
  }

  @spec freshness_coefficient(atom(), DateTime.t()) :: float()
  def freshness_coefficient(evidence_type, timestamp) do
    {amount, unit} = Map.get(@decay_rates, evidence_type, {24, :hours})
    max_age_seconds = to_seconds(amount, unit)
    age_seconds = DateTime.diff(DateTime.utc_now(), timestamp, :second)

    cond do
      age_seconds <= 0 -> 1.0
      age_seconds >= max_age_seconds -> 0.0
      true -> 1.0 - age_seconds / max_age_seconds
    end
  end

  @spec evidence_stale?(atom(), DateTime.t()) :: boolean()
  def evidence_stale?(evidence_type, timestamp) do
    freshness_coefficient(evidence_type, timestamp) < 0.1
  end

  defp to_seconds(amount, :hours), do: amount * 3600
  defp to_seconds(amount, :days), do: amount * 86_400
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements Quality Evidence Truth through several interconnected systems that together create an evidence-based quality epistemology.

### Quality Gates as Evidence Producers

Every quality gate in the platform (`mix quality.gates`) is not just a pass/fail check but an evidence producer. When the Dialyzer gate runs, it produces evidence in the form of a typed analysis result. When the Credo gate runs, it produces evidence in the form of static analysis findings. When the test suite runs, it produces evidence in the form of test results with coverage data. These evidence artifacts are the raw material of QET.

### Evidence Aggregation Through Quality DNA

Quality DNA files serve as the evidence ledger for each umbrella application. The `current-state.json` file in each application records the latest quality evidence across all domains. This creates a distributed evidence store that satisfies the Provenance Mandatory axiom: you can trace any quality claim back to specific evidence in specific DNA files.

### Pre-Commit as Evidence Verification

The 11-phase pre-commit pipeline is the enforcement point where evidence is verified before code enters the repository. Each phase produces evidence, and the pipeline as a whole requires that all evidence chains are complete and all Trinity Gate conditions are met before allowing the commit.

### NABLA Axiom Compliance

QET is designed to comply with all seven NABLA axioms:

- **Signal Plurality**: Multiple independent quality checks contribute to each quality claim
- **Contradiction Preservation**: When checks disagree (e.g., tests pass but Dialyzer finds a type error), both results are preserved
- **Absence Informative**: Missing evidence (a check that did not run) is treated as a quality signal, not ignored
- **Time Decay**: Quality evidence ages and loses confidence, requiring periodic re-verification
- **Unknown Valid**: "We do not know the quality of this code" is a legitimate and important quality state
- **Source Independence**: Quality checks from independent tools (Dialyzer, Credo, ExUnit) are weighted higher than multiple checks from one tool
- **Provenance Mandatory**: Every quality verdict can be traced to specific evidence through a complete chain

## Comparison with Alternative Approaches

| Aspect | QET (Prismatic) | Traditional Testing | SonarQube Model | Formal Methods Only |
|---|---|---|---|---|
| **Evidence requirement** | Complete chain with provenance | Test pass/fail binary | Metric thresholds | Mathematical proofs |
| **Contradiction handling** | Preserved and visible | Ignored (last run wins) | Averaged into scores | Not applicable |
| **Time decay** | Built-in freshness model | None (green is green) | Historical tracking | Proofs are eternal |
| **Absence handling** | Treated as evidence | Ignored | Some gap analysis | Completeness proofs |
| **Confidence model** | Continuous 0.0-1.0 with propagation | Binary pass/fail | Letter grades | Binary proven/unproven |
| **Epistemic foundation** | NABLA 7 axioms + Trinity Gate | None (pragmatic) | Industry benchmarks | Mathematical logic |

## Best Practices

**1. Never suppress contradictory evidence.** If two quality checks disagree, both results must be preserved and visible. The Contradiction Preservation axiom exists precisely because suppressing contradictions leads to false confidence. A system that shows "all green" while hiding a type error is worse than a system that shows one failure.

**2. Treat evidence freshness seriously.** A test suite that passed three months ago does not prove current quality. Dependencies change, runtime environments evolve, and code that was correct yesterday may be incorrect today. QET's time decay model ensures that stale evidence is discounted appropriately.

**3. Require plurality for critical claims.** A single test passing is not sufficient evidence for a critical quality claim. QET requires multiple independent evidence sources (unit tests + integration tests + static analysis + type checking) before elevating a claim to "established" status.

**4. Make the evidence chain auditable.** Every quality verdict should be traceable back to raw evidence through a complete provenance chain. This is not just good practice -- it is required for regulatory compliance in many industries and for maintaining trust in AI-generated code.

**5. Distinguish between hypothesis and truth.** A quality claim that has partial evidence is a hypothesis, not a truth. QET makes this distinction explicit through the Trinity Gate verdict system: claims are either "established" (all three gates passed), "hypothesis" (some evidence, incomplete verification), or "refuted" (contradicted by evidence).

**6. Measure the evidence system itself.** The quality evidence infrastructure should be subject to its own quality standards. If the test framework has bugs, the evidence it produces is unreliable. Meta-quality ensures the evidence system is trustworthy.

## Common Pitfalls

**Confusing test coverage with quality evidence.** Code coverage is derived evidence, not direct evidence. 100% coverage with shallow assertions proves only that code was executed, not that it is correct. QET requires that coverage be combined with assertion quality, mutation testing results, and property-based testing to form a complete evidence chain.

**Treating CI green as quality truth.** A green CI pipeline is evidence of a specific set of checks passing at a specific point in time. It is not a comprehensive quality truth. CI pipelines can be configured to skip checks, ignore warnings, and suppress failures. QET requires explicit verification that the CI configuration itself has not been weakened.

**Ignoring temporal context.** A quality score of 95 might represent improvement (from 90 last week) or degradation (from 100 yesterday). Without temporal context, quality numbers are ambiguous. QET's time decay model and Quality DNA history provide this essential context.

**Single-source quality assessment.** Relying on a single tool (just Credo, or just Dialyzer, or just tests) for quality assessment violates the Signal Plurality axiom. Different tools detect different classes of problems, and no single tool provides a complete quality picture.

**Evidence chain gaps.** If a quality verdict references evidence that no longer exists (deleted test files, cleared CI logs), the evidence chain is broken and the verdict is no longer valid. QET requires evidence persistence and chain integrity verification.

## Use Cases

### Regulatory Audit Response

When regulators ask "how do you ensure software quality?", QET provides a concrete, verifiable answer. The evidence chain from raw test results through analysis to quality verdicts creates an audit trail that satisfies even the most demanding regulatory frameworks (NIS2, SOC2, ISO 27001).

### AI Code Trust Verification

As AI agents generate increasing amounts of code, the question "can we trust this code?" becomes critical. QET provides the framework for answering this question: AI-generated code is subject to the same evidence requirements as human-written code, and its quality claims must pass the same Trinity Gate verification.

### Cross-Team Quality Negotiation

When multiple teams contribute to a shared platform, quality standards must be negotiated and enforced. QET provides an objective framework for these negotiations: instead of arguing about subjective quality assessments, teams can point to specific evidence chains and Trinity Gate results.

### Quality Debt Prioritization

QET's confidence model provides a natural mechanism for prioritizing quality debt: code with low-confidence quality claims (stale evidence, missing checks, broken evidence chains) should be addressed before code with high-confidence claims. This prioritization is objective and automated.

### Post-Incident Root Cause Analysis

After a production incident, QET's evidence chain enables precise root cause analysis. By examining the evidence chain for the code involved in the incident, teams can identify exactly where the quality assurance process failed: which evidence was missing, which checks were incomplete, which contradictions were suppressed.

## Related Concepts

Quality Evidence Truth connects deeply with the epistemic and quality frameworks in the Prismatic Platform:

- [Trinity Gate](@/glossary/trinity-gate.md) -- The three-gate verification system that elevates quality claims from hypothesis to established truth
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework providing the seven axioms that govern QET
- [Quality Gate](@/glossary/quality-gate.md) -- The enforcement mechanism that produces the evidence consumed by QET
- [Quality and Transparency](@/glossary/quality-and-transparency.md) -- The principle that quality evidence must be openly visible and auditable
- [Formal Verification](@/glossary/formal-verification.md) -- The mathematical proof techniques that provide the strongest form of quality evidence
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- The axiom requiring that conflicting evidence be maintained rather than suppressed
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- The axiom requiring complete traceability from evidence to verdict
- [Evidence](@/glossary/evidence.md) -- The foundational concept of observable, verifiable data supporting claims
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- The system property of maintaining correct beliefs under adversarial conditions
- [Proves Before Claiming](@/glossary/proves-before-claiming.md) -- The operational principle that evidence must precede assertion

## See Also

- [Quality DNA](@/glossary/quality-dna.md) -- The evidence persistence system that maintains quality truth across sessions
- [Quality Measurement System](@/glossary/quality-measurement-system.md) -- The infrastructure for quantifying quality evidence
- [Property-Based Testing](@/glossary/property-based-testing.md) -- A testing technique that generates stronger quality evidence than example-based testing
- [Dialyzer](@/glossary/dialyzer.md) -- The static analysis tool providing type-level quality evidence
- [Credo](@/glossary/credo.md) -- The linting tool providing style and consistency quality evidence

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis)
