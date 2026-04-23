+++
title = "Evidence Over Opinion"
weight = 50
[extra]
description = "Epistemic principle requiring that all decisions, claims, and beliefs be grounded in verifiable evidence rather than subjective opinions, gut feelings, or authority claims. Core to NABLA Infinity's provenance mandatory axiom and the Prismatic Platform's commitment to epistemic integrity."
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "epistemic-framework"
related_concepts = ["nabla-infinity", "provenance-mandatory", "scientific-rigor", "proves-before-claiming", "quality-evidence-truth", "contradiction-preservation", "trinity-gate"]
implementation_status = "production"
authority_level = "doctrine"
difficulty_rating = 5
prerequisites = ["basic understanding of epistemic reasoning", "familiarity with scientific method", "NABLA framework awareness"]
learning_path = ["scientific-rigor", "evidence-over-opinion", "provenance-mandatory", "trinity-gate", "nabla-infinity"]
interactive_demos = ["/labs/glossary/evidence-over-opinion"]
code_examples = ["EvidenceValidator", "ClaimVerifier", "ProvenanceTracker"]
external_resources = ["https://plato.stanford.edu/entries/epistemology/", "https://en.wikipedia.org/wiki/Evidence-based_practice"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["claim validation with evidence", "rejection of unsubstantiated claims", "provenance chain verification", "multi-source evidence aggregation"]
keywords = ["evidence", "opinion", "epistemic", "verification", "provenance", "truth", "scientific method", "empiricism"]
tags = ["glossary", "epistemic", "nabla", "doctrine", "evidence", "verification"]
related_terms = ["nabla-infinity", "provenance-mandatory", "scientific-rigor", "proves-before-claiming", "quality-evidence-truth", "contradiction-preservation", "trinity-gate", "confidence-scoring", "belief-graph", "epistemic-robustness"]
word_count = 1985
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Evidence Over Opinion - Prismatic Platform"
+++

## Definition

Evidence Over Opinion is the epistemic principle that all decisions, claims, and beliefs within a system must be grounded in verifiable, traceable evidence rather than subjective opinions, gut feelings, hierarchical authority, or social consensus. In formal terms: a proposition P is accepted if and only if there exists evidence E such that E is independently verifiable, E has traceable provenance, and E supports P through a valid chain of inference. Claims lacking evidence are not merely deprioritized -- they are rejected outright until evidence is provided.

This principle is distinct from mere "data-driven decision making" in that it imposes stricter requirements on the quality and traceability of the evidence itself. Data can be cherry-picked, misinterpreted, or presented without context. Evidence, in the sense used here, must satisfy provenance requirements: where did it come from, how was it collected, what are its limitations, and can it be independently reproduced?

## Overview

The Evidence Over Opinion principle addresses a fundamental vulnerability in complex systems: the tendency for human cognitive biases, social dynamics, and authority structures to override empirical reality. In software engineering, this manifests as architecture decisions driven by resume-driven development, technology choices based on hype cycles, and quality assessments based on developer confidence rather than test results.

The principle has deep roots in the philosophy of science. The empiricist tradition, from Francis Bacon through Karl Popper, established that knowledge claims must be falsifiable and grounded in observation. The [scientific rigor](@/glossary/scientific-rigor.md) tradition extends this further, requiring reproducibility, peer review, and transparent methodology.

Within the Prismatic Platform, Evidence Over Opinion is not merely a guideline -- it is an enforced axiom of the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. The [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom requires that every belief in the system be traceable to its source evidence. The [Trinity Gate](@/glossary/trinity-gate.md) validation pipeline refuses to accept claims that lack structural, logical, and formal backing. The [proves-before-claiming](@/glossary/proves-before-claiming.md) principle ensures that verification precedes assertion, never the reverse.

### Historical Context

The need for this principle became apparent through repeated failures in software systems where opinions masqueraded as evidence:

- **Estimation by authority**: Senior engineers estimating project timelines based on intuition rather than historical data, leading to systematic underestimation
- **Architecture by committee**: Design decisions driven by the loudest voice in the room rather than benchmark data and load testing
- **Quality by assertion**: Claims like "the system is stable" without supporting metrics, test results, or production telemetry
- **Security by assumption**: Believing a system is secure because "we followed best practices" rather than conducting penetration testing and vulnerability scanning

Each of these failure modes represents an opinion substituting for evidence. The Evidence Over Opinion principle eliminates these failure modes systematically.

## Technical Details

### Formal Definition

The Evidence Over Opinion principle can be formalized using epistemic logic notation:

```
Accept(P) iff exists E:
  1. Verifiable(E)       -- E can be independently checked
  2. Traceable(E)        -- E has documented provenance
  3. Supports(E, P)      -- E logically supports P
  4. NotContradicted(E)  -- No stronger evidence contradicts E
  5. Fresh(E)            -- E is within its validity window
```

This formalization distinguishes Evidence Over Opinion from weaker notions like "data-informed" or "evidence-aware." The conjunction of all five conditions is required -- a single missing condition renders the claim unacceptable.

### Evidence Classification

Not all evidence carries equal weight. The Prismatic Platform classifies evidence into a hierarchy based on reliability and independence:

| Level | Evidence Type | Weight | Example |
|-------|--------------|--------|---------|
| **L1** | Formal proof | 1.0 | Lean4 theorem, mathematical derivation |
| **L2** | Automated test | 0.9 | ExUnit pass/fail, property-based test |
| **L3** | Benchmark data | 0.8 | Benchee results, production telemetry |
| **L4** | Independent review | 0.7 | Code review finding, audit report |
| **L5** | Historical pattern | 0.6 | Past incident data, regression records |
| **L6** | Expert assessment | 0.4 | Engineer analysis (with methodology) |
| **L7** | Anecdotal report | 0.2 | Bug report without reproduction steps |
| **L8** | Unsubstantiated opinion | 0.0 | "I think it works" |

Evidence at L8 carries zero weight. No amount of L8 evidence can substitute for a single piece of L1-L5 evidence. This is not a democratic system where enough votes override facts.

### Evidence Aggregation

When multiple pieces of evidence address the same claim, they are aggregated using a weighted scheme that accounts for source independence. Independent sources receive full weight; correlated sources are discounted:

```
confidence(P) = 1 - product(1 - weight(e_i) * independence(e_i))
                for all e_i in Evidence(P)
```

This formula ensures that truly independent evidence compounds (increasing confidence toward 1.0) while redundant evidence from the same source saturates quickly. This prevents the anti-pattern of citing the same study or metric multiple times to artificially inflate confidence.

## Implementation in Prismatic Platform

The Evidence Over Opinion principle is implemented across multiple layers of the Prismatic Platform, from the epistemic framework through the quality gates to the agent system.

### Evidence Validator

The core implementation provides a module for validating evidence chains before accepting claims:

```elixir
defmodule PrismaticNabla.EvidenceValidator do
  @moduledoc """
  Validates that claims are supported by sufficient evidence
  before they can be accepted into the belief graph.
  Enforces the Evidence Over Opinion principle.
  """

  alias PrismaticNabla.{Evidence, Claim, ProvenanceChain}

  @type validation_result ::
          {:ok, %{confidence: float(), evidence_chain: [Evidence.t()]}}
          | {:error, :insufficient_evidence | :no_provenance | :stale_evidence | :contradicted}

  @min_confidence_threshold 0.80
  @max_evidence_age_hours 720

  @spec validate_claim(Claim.t(), [Evidence.t()]) :: validation_result()
  def validate_claim(%Claim{} = claim, evidence_list) when is_list(evidence_list) do
    with :ok <- check_evidence_exists(evidence_list),
         :ok <- check_provenance(evidence_list),
         :ok <- check_freshness(evidence_list),
         :ok <- check_no_contradictions(claim, evidence_list),
         {:ok, confidence} <- compute_confidence(evidence_list) do
      if confidence >= @min_confidence_threshold do
        {:ok, %{confidence: confidence, evidence_chain: evidence_list}}
      else
        {:error, :insufficient_evidence}
      end
    end
  end

  @spec check_evidence_exists([Evidence.t()]) :: :ok | {:error, :insufficient_evidence}
  defp check_evidence_exists([]), do: {:error, :insufficient_evidence}
  defp check_evidence_exists([_ | _]), do: :ok

  @spec check_provenance([Evidence.t()]) :: :ok | {:error, :no_provenance}
  defp check_provenance(evidence_list) do
    all_have_provenance? =
      Enum.all?(evidence_list, fn evidence ->
        ProvenanceChain.valid?(evidence.provenance)
      end)

    if all_have_provenance?, do: :ok, else: {:error, :no_provenance}
  end

  @spec check_freshness([Evidence.t()]) :: :ok | {:error, :stale_evidence}
  defp check_freshness(evidence_list) do
    cutoff = DateTime.add(DateTime.utc_now(), -@max_evidence_age_hours, :hour)

    all_fresh? =
      Enum.all?(evidence_list, fn evidence ->
        DateTime.compare(evidence.collected_at, cutoff) != :lt
      end)

    if all_fresh?, do: :ok, else: {:error, :stale_evidence}
  end

  @spec check_no_contradictions(Claim.t(), [Evidence.t()]) :: :ok | {:error, :contradicted}
  defp check_no_contradictions(%Claim{} = claim, evidence_list) do
    contradicting =
      Enum.filter(evidence_list, fn evidence ->
        evidence.direction == :against and evidence.weight > 0.6
      end)

    supporting =
      Enum.filter(evidence_list, fn evidence ->
        evidence.direction == :for
      end)

    support_weight = aggregate_weight(supporting)
    contradiction_weight = aggregate_weight(contradicting)

    if support_weight > contradiction_weight do
      :ok
    else
      {:error, :contradicted}
    end
  end

  @spec compute_confidence([Evidence.t()]) :: {:ok, float()}
  defp compute_confidence(evidence_list) do
    supporting = Enum.filter(evidence_list, &(&1.direction == :for))

    confidence =
      supporting
      |> Enum.map(fn e -> 1.0 - e.weight * e.independence_factor end)
      |> Enum.reduce(1.0, &(&1 * &2))
      |> then(fn product -> 1.0 - product end)

    {:ok, Float.round(confidence, 4)}
  end

  @spec aggregate_weight([Evidence.t()]) :: float()
  defp aggregate_weight(evidence_list) do
    evidence_list
    |> Enum.map(fn e -> e.weight * e.independence_factor end)
    |> Enum.sum()
  end
end
```

### Claim Verification Pipeline

Claims flow through a pipeline that enforces Evidence Over Opinion at each stage:

```elixir
defmodule PrismaticNabla.ClaimPipeline do
  @moduledoc """
  Pipeline for processing claims through the Evidence Over Opinion
  verification stages before acceptance into the belief graph.
  """

  alias PrismaticNabla.{EvidenceValidator, TrinityGate, BeliefGraph}

  @spec process_claim(map()) ::
          {:accepted, map()} | {:rejected, atom()} | {:pending, map()}
  def process_claim(%{proposition: proposition, evidence: evidence} = claim) do
    with {:ok, validation} <- EvidenceValidator.validate_claim(claim, evidence),
         {:ok, trinity_result} <- TrinityGate.evaluate(proposition, validation),
         {:ok, _node} <- BeliefGraph.insert(proposition, validation, trinity_result) do
      emit_telemetry(:claim_accepted, %{
        proposition: proposition,
        confidence: validation.confidence,
        evidence_count: length(evidence)
      })

      {:accepted, %{claim | status: :verified, confidence: validation.confidence}}
    else
      {:error, reason} ->
        emit_telemetry(:claim_rejected, %{
          proposition: proposition,
          reason: reason
        })

        {:rejected, reason}
    end
  end

  @spec emit_telemetry(atom(), map()) :: :ok
  defp emit_telemetry(event, metadata) do
    :telemetry.execute(
      [:prismatic, :nabla, :claim_pipeline, event],
      %{count: 1, timestamp: System.monotonic_time()},
      metadata
    )
  end
end
```

### Integration with Quality Gates

The Evidence Over Opinion principle manifests directly in the platform's quality gate system. Every quality assertion requires evidence:

| Quality Claim | Required Evidence | Rejection If Missing |
|---------------|-------------------|---------------------|
| "Code is correct" | Passing tests + type specs | Commit blocked |
| "Code is performant" | Benchee results | Performance gate fails |
| "Code is secure" | Static analysis + Credo pass | Security gate fails |
| "Code compiles cleanly" | `--warnings-as-errors` output | Compilation gate fails |
| "Bug is fixed" | Regression test (fails before, passes after) | Fix rejected |

The quality gate system does not ask "do you think the code is correct?" -- it asks "can you prove the code is correct?" This distinction is the practical manifestation of Evidence Over Opinion.

## Comparison with Alternatives

### Evidence Over Opinion vs. Data-Driven Decision Making

Data-Driven Decision Making (DDDM) is a weaker principle that merely requires decisions to reference data. Evidence Over Opinion goes further by requiring:

| Dimension | DDDM | Evidence Over Opinion |
|-----------|------|----------------------|
| **Provenance** | Data is cited | Evidence source is traceable and verified |
| **Independence** | Not required | Multiple independent sources required |
| **Contradiction handling** | Data is selected to support | Contradictions are preserved and weighted |
| **Freshness** | Historical data acceptable | Evidence must be within validity window |
| **Formal verification** | Optional | Required for critical claims (Trinity Gate) |

DDDM is susceptible to [cherry-picking](@/glossary/cherry-picking.md) -- selecting data that supports a predetermined conclusion while ignoring contradicting data. Evidence Over Opinion explicitly prevents this through the [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom.

### Evidence Over Opinion vs. Consensus-Based Decision Making

Consensus-based approaches seek agreement among stakeholders. Evidence Over Opinion rejects consensus as a valid mechanism for establishing truth:

- Consensus can be wrong (geocentrism was consensus for millennia)
- Consensus is susceptible to groupthink and authority bias
- Consensus conflates social agreement with empirical truth
- Evidence does not become more or less valid based on how many people agree with it

The NABLA axiom "Reality is not a democracy" encapsulates this distinction. A single piece of strong evidence outweighs unanimous opinion.

### Evidence Over Opinion vs. Expert Judgment

Expert judgment occupies a middle ground. Experts bring valuable pattern recognition and domain knowledge. However, Evidence Over Opinion classifies expert judgment as L6 evidence (weight 0.4) -- useful but insufficient on its own. Expert judgment must be:

1. Accompanied by methodology (how did the expert arrive at this conclusion?)
2. Validated against available empirical data
3. Subject to the same provenance requirements as any other evidence
4. Open to contradiction by higher-weight evidence (L1-L5)

## Best Practices

### Implementing Evidence Over Opinion in Development Workflows

1. **Require test evidence for every change**: No pull request merges without passing tests that specifically exercise the changed functionality. Not just "CI is green" but "tests exist that would fail without this change."

2. **Document decisions with evidence**: Architecture Decision Records (ADRs) must include the evidence that motivated the decision, not just the rationale. "We chose PostgreSQL because benchmarks showed 3x throughput for our workload" vs. "We chose PostgreSQL because it is a good database."

3. **Use property-based testing for invariants**: When claiming an invariant holds, [property-based testing](@/glossary/property-based-testing.md) provides stronger evidence than example-based tests by exercising the property across thousands of random inputs.

4. **Instrument everything**: [Telemetry](@/glossary/telemetry.md) and [observability](@/glossary/observability.md) infrastructure provide continuous evidence about system behavior. Claims about performance, reliability, or correctness should be backed by production metrics.

5. **Preserve contradicting evidence**: When evidence contradicts a current belief, do not discard it. Store it, weight it, and let the aggregation system handle it. Suppressing contradictions is the single most dangerous anti-pattern.

### Evidence Quality Checklist

Before accepting any claim, verify:

- [ ] At least two independent pieces of evidence support the claim
- [ ] All evidence has documented provenance (source, method, timestamp)
- [ ] Evidence is within its validity window (not stale)
- [ ] Contradicting evidence has been acknowledged and weighted
- [ ] The evidence chain passes the [Trinity Gate](@/glossary/trinity-gate.md) (for critical claims)
- [ ] No single source accounts for more than 60% of the total evidence weight

## Common Pitfalls

### Pitfall 1: Confusing Popularity with Evidence

A library having 50,000 GitHub stars is not evidence that it is the right choice for your system. Popularity metrics measure social adoption, not technical fitness. Evidence for a technology choice requires benchmarks, compatibility analysis, and maintenance trajectory assessment.

### Pitfall 2: Treating Test Absence as Test Success

If no tests exist for a feature, the correct epistemic state is "unknown" -- not "working." The absence of failure evidence is not evidence of success. This is a common instance of the broader logical fallacy: absence of evidence is not evidence of absence (though in some cases it is informative, per NABLA's Absence Informative axiom).

### Pitfall 3: Authority Override

When a senior engineer or manager overrides evidence-based conclusions with "I have more experience," the Evidence Over Opinion principle is being violated. Experience is valuable (L6 evidence) but does not override L1-L5 evidence. The correct response is to request that the authority articulate their reasoning in a form that can be verified.

### Pitfall 4: Stale Evidence

Evidence decays over time. A benchmark from six months ago may no longer reflect current system behavior after significant code changes. The freshness requirement exists to prevent decisions based on outdated information. Evidence must be refreshed periodically, especially for performance claims and security assessments.

### Pitfall 5: Correlation as Causation

Observing that deployments on Fridays correlate with weekend incidents is data. Concluding that Friday deployments cause weekend incidents requires additional evidence (confounding variables, A/B testing, mechanism identification). Evidence Over Opinion requires that causal claims meet a higher evidence bar than correlational observations.

## Use Cases

### Use Case 1: Security Assessment

When assessing whether a system is secure, Evidence Over Opinion requires:

- Automated vulnerability scan results (L3)
- Penetration testing reports (L4)
- Static analysis findings (L2)
- Dependency audit results (L2)
- Compliance framework checklist completion (L5)

It explicitly rejects: "We followed OWASP Top 10" (L6) as sufficient evidence without the supporting scan results.

### Use Case 2: Performance Optimization

Before claiming a performance improvement, Evidence Over Opinion requires:

- Benchmark results showing before/after metrics with statistical significance (L3)
- Production telemetry confirming the improvement under real load (L3)
- Regression tests ensuring no performance degradation elsewhere (L2)

It explicitly rejects: "The new code looks faster" (L8) or "Big-O analysis suggests improvement" (L6) without empirical validation.

### Use Case 3: Agent Decision Making

When Prismatic agents make decisions about system evolution, each decision must be backed by evidence:

```elixir
# Agent evidence collection for an autoheal decision
%Decision{
  action: :restart_service,
  evidence: [
    %Evidence{type: :telemetry, source: "health_check", weight: 0.9,
              data: %{error_rate: 0.15, threshold: 0.05}},
    %Evidence{type: :log_pattern, source: "structured_log", weight: 0.7,
              data: %{pattern: "connection_timeout", count: 47, window: "5m"}},
    %Evidence{type: :metric, source: "prometheus", weight: 0.8,
              data: %{p99_latency_ms: 4500, baseline_ms: 200}}
  ],
  confidence: 0.97
}
```

### Use Case 4: Quality Gate Enforcement

The pre-commit quality gates are a direct enforcement mechanism for Evidence Over Opinion. Each gate demands specific evidence:

| Gate | Evidence Required | Evidence Type |
|------|-------------------|---------------|
| Compilation | `--warnings-as-errors` exit code 0 | L2 (automated test) |
| Credo | `mix credo --strict` zero violations | L2 (automated test) |
| Dialyzer | PLT analysis zero warnings | L1 (type-level proof) |
| Tests | `mix test` all passing | L2 (automated test) |
| Forbidden patterns | Pattern scan zero matches | L2 (automated test) |

## Related Concepts

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework that formalizes Evidence Over Opinion as a core axiom
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom requiring all evidence to have traceable origins
- [Scientific Rigor](@/glossary/scientific-rigor.md) -- The broader methodological tradition underlying this principle
- [Proves Before Claiming](@/glossary/proves-before-claiming.md) -- Principle that verification must precede assertion
- [Quality Evidence Truth](@/glossary/quality-evidence-truth.md) -- Quality framework grounded in evidence-based truth
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Axiom preserving conflicting evidence rather than discarding it
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer validation gate requiring structural, logical, and formal consistency
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Quantitative measurement of belief strength based on evidence weight
- [Belief Graph](@/glossary/belief-graph.md) -- Graph structure storing evidence-backed beliefs and their relationships
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- System resilience against epistemic attacks and misinformation
- [Cherry Picking](@/glossary/cherry-picking.md) -- Anti-pattern explicitly prevented by this principle
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- Processing pipeline that enforces evidence requirements at each stage

## See Also

- [NABLA Doctrine](@/glossary/nabla-infinity.md) -- Complete documentation of the epistemic framework
- [Addiction Preservation](@/glossary/contradiction-preservation.md) -- Platform commitment to preserving inconvenient truths
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Threshold levels for evidence-based acceptance
- [Architecture](@/architecture/_index.md) -- Platform architecture grounded in evidence-based design
- [Capabilities](@/capabilities/_index.md) -- Platform capabilities enforcing epistemic integrity

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
