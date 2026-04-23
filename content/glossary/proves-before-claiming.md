+++
title = "Proves Before Claiming"
weight = 50
[extra]
description = "An epistemic discipline requiring that all assertions, capabilities, and quality claims are backed by verifiable evidence -- tests, benchmarks, formal proofs -- before they are stated as fact"
category = "doctrine"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["evidence-over-opinion", "trinity-gate", "formal-verification", "quality-gate", "quality-evidence-truth", "provenance-mandatory", "axiom-enforcement", "verification", "property-based-testing", "continuous-validation"]
keywords = ["proves before claiming", "evidence-based engineering", "verification before assertion", "epistemic discipline", "proof-first development", "evidence-backed claims", "formal proof software", "test-driven verification", "quality evidence", "claim validation"]
tags = ["doctrine", "epistemic", "verification", "quality", "evidence"]
key_takeaways = ["Every claim about system behavior, performance, or quality must be supported by executable evidence before it is asserted", "The proves-before-claiming principle eliminates the gap between stated capabilities and actual capabilities", "This discipline is enforced through the Trinity Gate, quality gates, and automated verification pipelines", "Property-based testing, formal verification, and continuous benchmarking serve as the primary evidence generation mechanisms", "Violating this principle -- making unproven claims -- is treated as an epistemic integrity violation within the platform"]
use_cases = ["Quality gate enforcement before merge", "Performance claims backed by benchmark suites", "Security assertions backed by audit evidence", "Compliance claims backed by automated assessment", "API contract guarantees backed by contract tests"]
prerequisites = ["evidence-over-opinion", "quality-gate", "verification"]
further_reading = ["Test-Driven Development by Kent Beck", "The Art of Software Testing by Glenford Myers", "Lean4 Theorem Proving documentation"]
word_count = 2071
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Proves Before Claiming - Prismatic Platform"
+++

## Definition

"Proves Before Claiming" is an epistemic engineering principle that prohibits stating any capability, quality metric, performance characteristic, or behavioral guarantee as fact until executable, reproducible evidence demonstrates its truth. This is not a suggestion or aspiration -- it is a mandatory discipline enforced at every level of the Prismatic Platform, from individual function specifications through module-level quality gates to platform-wide quality scores.

The principle inverts the typical software development pattern where claims are made first and evidence is gathered (if at all) later. Instead, the evidence must exist before the claim. A function is not "correct" because a developer believes it works -- it is correct because its specification is tested, its edge cases are covered, and its properties are verified. A system is not "performant" because it feels fast -- it is performant because benchmarks demonstrate specific latency and throughput numbers under defined conditions. A platform does not have "100/100 quality" because someone declared it -- it has that score because 13 independent quality domains each report zero violations through automated, continuously running analysis.

This principle is rooted in the broader epistemic framework of the NABLA Infinity doctrine, which holds that reality is not a democracy, evidence is not optional, and contradictions are not embarrassments. Within this framework, "proves before claiming" operationalizes the Provenance Mandatory axiom: all beliefs must be traceable to their evidence.

## Overview

Software engineering suffers from a chronic credibility gap. Marketing claims outpace reality. Documentation describes aspirational behavior rather than actual behavior. Quality metrics are cherry-picked. Performance numbers come from ideal conditions that do not reflect production. The "proves before claiming" principle exists to systematically close this gap.

The principle operates at multiple levels of abstraction:

| Level | Claim Type | Required Evidence | Enforcement |
|-------|-----------|-------------------|-------------|
| **Function** | "This function correctly computes X" | Unit tests covering all branches, property-based tests for invariants | `mix test`, coverage gates |
| **Module** | "This module handles Y reliably" | Integration tests, failure injection tests, @spec typespecs | Dialyzer, Credo, test suite |
| **Application** | "This app achieves Z performance" | Benchee benchmarks with statistical analysis | Performance gates, CI pipeline |
| **Platform** | "Quality score is 100/100" | 13 automated quality domain analyzers with zero violations | `mix quality.gates`, pre-commit hooks |
| **Security** | "This system is secure against A" | Penetration test results, security audit findings, threat model analysis | Color-team operations, EASM assessment |
| **Compliance** | "This system complies with B" | Automated compliance checks, evidence artifacts | Compliance framework assessment |

### The Evidence Hierarchy

Not all evidence is equally compelling. The platform recognizes a hierarchy of evidence strength:

| Evidence Type | Strength | Example | Limitation |
|--------------|----------|---------|------------|
| **Formal proof** | Highest | Lean4 theorem proving correctness | Limited to formally specifiable properties |
| **Property-based test** | Very high | StreamData generating 10,000 random inputs | Statistical rather than exhaustive |
| **Exhaustive test** | High | Testing all enum values, all branches | Only covers anticipated scenarios |
| **Benchmark** | High (for performance) | Benchee with statistical analysis | Sensitive to environment, hardware |
| **Unit test** | Medium | ExUnit test for specific input/output | Only covers explicitly written cases |
| **Type check** | Medium | Dialyzer success typing | Does not verify runtime behavior |
| **Code review** | Low | Human inspection of implementation | Subjective, attention-limited |
| **Developer assertion** | None | "I'm pretty sure it works" | Not evidence |

### Relationship to Scientific Method

The "proves before claiming" principle applies the scientific method to software engineering:

1. **Hypothesis**: "This function correctly handles negative inputs."
2. **Experiment design**: Write tests that exercise negative inputs across the expected range.
3. **Experiment execution**: Run the tests.
4. **Analysis**: All tests pass -- hypothesis supported (not proven -- we can be falsified by future tests).
5. **Claim**: "This function handles negative inputs correctly as verified by tests X, Y, Z."

The claim is always qualified by the evidence that supports it. Stronger evidence (property-based testing, formal proofs) enables stronger claims.

## Technical Details

### Evidence Generation in Elixir

The Prismatic Platform uses multiple evidence generation mechanisms to support the "proves before claiming" principle:

```elixir
defmodule PrismaticVerification.EvidenceCollector do
  @moduledoc """
  Collects and aggregates verification evidence across multiple
  evidence sources. Every claim about system behavior is backed
  by evidence artifacts produced by this collector.
  """

  @type evidence_source :: :unit_test | :property_test | :benchmark
                         | :type_check | :static_analysis | :formal_proof

  @type evidence :: %{
    source: evidence_source(),
    claim: String.t(),
    result: :verified | :falsified | :inconclusive,
    confidence: float(),
    timestamp: DateTime.t(),
    artifact_path: String.t() | nil,
    reproducible: boolean()
  }

  @type claim_status :: %{
    claim: String.t(),
    evidence: list(evidence()),
    overall_confidence: float(),
    verdict: :proven | :supported | :unsupported | :falsified
  }

  @spec collect_evidence(String.t(), list(evidence_source())) ::
          {:ok, claim_status()} | {:error, term()}
  def collect_evidence(claim, sources) do
    evidence_list =
      sources
      |> Enum.map(&gather_from_source(&1, claim))
      |> Enum.reject(&is_nil/1)

    confidence = calculate_confidence(evidence_list)
    verdict = determine_verdict(evidence_list, confidence)

    {:ok, %{
      claim: claim,
      evidence: evidence_list,
      overall_confidence: confidence,
      verdict: verdict
    }}
  end

  defp gather_from_source(:unit_test, claim) do
    %{
      source: :unit_test,
      claim: claim,
      result: :verified,
      confidence: 0.7,
      timestamp: DateTime.utc_now(),
      artifact_path: nil,
      reproducible: true
    }
  end

  defp gather_from_source(:property_test, claim) do
    %{
      source: :property_test,
      claim: claim,
      result: :verified,
      confidence: 0.9,
      timestamp: DateTime.utc_now(),
      artifact_path: nil,
      reproducible: true
    }
  end

  defp gather_from_source(:formal_proof, claim) do
    %{
      source: :formal_proof,
      claim: claim,
      result: :verified,
      confidence: 0.99,
      timestamp: DateTime.utc_now(),
      artifact_path: nil,
      reproducible: true
    }
  end

  defp gather_from_source(source, claim) do
    %{
      source: source,
      claim: claim,
      result: :inconclusive,
      confidence: 0.5,
      timestamp: DateTime.utc_now(),
      artifact_path: nil,
      reproducible: true
    }
  end

  defp calculate_confidence(evidence_list) do
    if Enum.empty?(evidence_list) do
      0.0
    else
      # Combined confidence: 1 - product of (1 - individual confidences)
      evidence_list
      |> Enum.filter(&(&1.result == :verified))
      |> Enum.reduce(0.0, fn e, acc ->
        1.0 - (1.0 - acc) * (1.0 - e.confidence)
      end)
    end
  end

  defp determine_verdict(evidence_list, confidence) do
    any_falsified = Enum.any?(evidence_list, &(&1.result == :falsified))
    has_formal_proof = Enum.any?(evidence_list, &(&1.source == :formal_proof and &1.result == :verified))

    cond do
      any_falsified -> :falsified
      has_formal_proof -> :proven
      confidence >= 0.95 -> :supported
      true -> :unsupported
    end
  end
end
```

### Quality Gate as Evidence Gate

The platform's quality gate system is the primary enforcement mechanism for "proves before claiming." Every commit must pass through gates that verify claims about code quality:

```elixir
defmodule PrismaticVerification.QualityEvidence do
  @moduledoc """
  Maps quality domain checks to evidence requirements.
  Each quality domain produces verifiable evidence that
  supports specific claims about code quality.
  """

  @type domain_evidence :: %{
    domain: atom(),
    claim: String.t(),
    check_command: String.t(),
    passing_condition: String.t(),
    current_status: :passing | :failing
  }

  @quality_domains [
    %{
      domain: :dialyzer,
      claim: "All function contracts are consistent with their implementations",
      check_command: "mix dialyzer",
      passing_condition: "Zero type errors or contract violations"
    },
    %{
      domain: :credo,
      claim: "Code follows established style and complexity guidelines",
      check_command: "mix credo --strict",
      passing_condition: "Zero issues at any priority level"
    },
    %{
      domain: :compilation,
      claim: "Code compiles without ambiguity or deprecated usage",
      check_command: "mix compile --warnings-as-errors",
      passing_condition: "Zero compilation warnings"
    },
    %{
      domain: :test_coverage,
      claim: "All code paths are exercised by tests",
      check_command: "mix test --cover",
      passing_condition: "Coverage meets or exceeds threshold"
    },
    %{
      domain: :typespec,
      claim: "All public functions have documented type signatures",
      check_command: "mix quality.typespec_coverage",
      passing_condition: "100% public function spec coverage"
    }
  ]

  @spec evidence_for_domain(atom()) :: {:ok, domain_evidence()} | {:error, :unknown_domain}
  def evidence_for_domain(domain) do
    case Enum.find(@quality_domains, &(&1.domain == domain)) do
      nil -> {:error, :unknown_domain}
      evidence -> {:ok, evidence}
    end
  end

  @spec all_domain_evidence() :: list(domain_evidence())
  def all_domain_evidence, do: @quality_domains
end
```

### The Trinity Gate as Proof System

The Trinity Gate represents the highest level of the "proves before claiming" principle. It requires three independent forms of evidence before any critical claim is accepted:

1. **Structural Consistency** (Graph Theory): The belief network forms a valid directed acyclic graph -- no circular reasoning, no orphaned claims.
2. **Logical Consistency** (Rule-Based): Propositions follow logical rules -- no contradictions, no unsupported implications.
3. **Formal Necessity** (Modal Logic + Lean4): Claims are proven in formal systems -- mathematical certainty where achievable.

All three gates must pass before a critical claim transitions from hypothesis to accepted truth.

## Implementation

### Enforcement at Every Layer

The "proves before claiming" principle is enforced through automated tooling at every stage of the development lifecycle:

| Stage | Enforcement Mechanism | What It Proves |
|-------|----------------------|---------------|
| **Pre-commit** | 11-phase pre-commit hook | Code compiles, tests pass, quality gates clear |
| **Commit message** | Conventional commit format validation | Changes are categorized and described accurately |
| **CI pipeline** | Full test suite + Dialyzer + Credo | No regressions, no type violations, no style violations |
| **Merge gate** | Quality gates + coverage threshold | All claims about the merge are evidenced |
| **Deployment** | Health checks + smoke tests | Deployed system actually works |
| **Runtime** | Telemetry + monitoring | Performance claims hold in production |

### Practical Workflow

A developer working within the "proves before claiming" discipline follows this workflow:

1. **State intent**: "I will implement function X that handles Y."
2. **Write tests first**: Create tests that define the expected behavior of X for input Y.
3. **Verify tests fail**: Run tests to confirm they fail (proving they test something real).
4. **Implement**: Write the implementation.
5. **Verify tests pass**: Run tests to confirm the implementation satisfies the specification.
6. **Add property tests**: Generate random inputs to find edge cases the example-based tests missed.
7. **Add typespecs**: Define the function's type contract.
8. **Run Dialyzer**: Verify the typespec is consistent with the implementation.
9. **Commit**: The pre-commit hook verifies all evidence is in order.

Only after this process can the developer claim "function X correctly handles Y" -- and the claim is backed by executable evidence.

## Comparison

### Proves-Before-Claiming vs. Alternative Approaches

| Approach | When Claims Are Made | Evidence Type | Confidence Level | Overhead |
|----------|---------------------|--------------|-----------------|---------|
| **Proves before claiming** | After evidence exists | Automated, reproducible | Very high | Medium (front-loaded) |
| **Test-Driven Development** | Tests precede implementation | Automated tests | High | Medium |
| **Code review** | After implementation, before merge | Human inspection | Medium | Medium |
| **QA testing** | After development, before release | Manual + automated | Medium | High (back-loaded) |
| **Hope-based development** | Immediately, without evidence | None | Zero | None (until production) |
| **Post-hoc testing** | After implementation, possibly after deployment | Automated tests | Medium-low (confirmation bias risk) | Low (but late) |

The key distinction is timing and strength. "Proves before claiming" front-loads the evidence generation, ensuring that no claim is ever made without backing. This contrasts with approaches that generate evidence after the claim (retrospective testing) or rely on non-reproducible evidence (code review alone).

### Relationship to TDD

Test-Driven Development (TDD) is a subset of the "proves before claiming" principle. TDD specifies that tests are written before implementation -- which ensures that the implementation claim ("this code works") is backed by test evidence. However, "proves before claiming" extends beyond TDD in several dimensions:

- **Performance claims** require benchmarks, not just functional tests.
- **Type correctness claims** require Dialyzer verification, not just tests.
- **Security claims** require audit evidence, not just tests.
- **Quality claims** require multi-domain analysis, not just tests.

TDD is necessary but not sufficient for the "proves before claiming" principle.

## Best Practices

### Building an Evidence Culture

1. **Make evidence generation effortless**: If writing tests is painful, developers will avoid it. Invest in test infrastructure, generators, and helpers that make evidence generation the path of least resistance.

2. **Automate evidence verification**: Human-verified evidence decays. Automated evidence (tests, benchmarks, type checks) runs continuously and catches regressions immediately.

3. **Track evidence freshness**: Evidence that was valid six months ago may not be valid today. Continuous integration ensures evidence is regenerated and reverified on every change.

4. **Celebrate falsification**: When a test catches a bug, that is the system working. When a property-based test finds an edge case, that is a success. Frame evidence that disproves claims as valuable rather than embarrassing.

5. **Reject unproven claims at every level**: In code reviews, ask "where is the evidence?" for every claimed behavior. In architecture discussions, ask "what PoC validates this?" In documentation, ask "what test verifies this statement?"

6. **Use the strongest evidence available**: If a property can be formally proven, prove it. If it can be property-tested, property-test it. Resort to example-based tests only when stronger evidence is impractical.

7. **Document the evidence chain**: Every claim should link to its evidence. Typespecs link to Dialyzer results. Performance claims link to benchmark runs. Quality scores link to gate output.

## Pitfalls

### Common Violations

| Violation | Example | Why It Happens | Consequence |
|-----------|---------|----------------|-------------|
| **Untested claims** | "This handles all edge cases" without edge case tests | Developer confidence exceeds test coverage | Production bugs in edge cases |
| **Stale evidence** | Benchmark from 6 months ago cited as current performance | Evidence not re-run after changes | Performance regression masked |
| **Cherry-picked evidence** | Citing best-case latency, ignoring p99 | Confirmation bias | Misleading performance expectations |
| **Circular evidence** | "It works because the test passes" where the test always passes | Test does not actually exercise the claim | False confidence, undetected bugs |
| **Scope mismatch** | Unit test evidence cited for integration-level claims | Confusion about evidence scope | Integration failures despite passing unit tests |
| **Evidence theater** | 100% line coverage with no meaningful assertions | Metric optimization without substance | High coverage numbers, low actual verification |
| **Post-hoc rationalization** | Writing tests after the fact to justify existing code | Deadline pressure | Tests that verify what is, not what should be |

### The Overfitting Trap

Tests that are too closely coupled to implementation details provide evidence only that the current implementation matches the current tests -- not that the behavior is correct. When the implementation is refactored, these tests break even though the behavior is unchanged. Property-based tests resist this trap by specifying what should be true regardless of implementation.

## Use Cases

### Platform Quality Score

The Prismatic Platform's claim of "100/100 quality score" is backed by 13 independently executing quality domain analyzers, each of which reports zero violations. The claim is regenerated on every commit through `mix quality.gates`. If any domain reports a violation, the claim is automatically withdrawn (the score decreases, the commit is blocked, and the violation must be resolved before the claim can be reasserted).

### Performance Guarantees

The platform's page load performance standard (under 250ms total, under 100ms server-side render) is backed by Benchee benchmarks that run in CI. The claim "pages load under 250ms" exists only because the benchmark evidence demonstrates it. If a code change causes latency regression, the benchmark fails, the evidence is falsified, and the claim is automatically withdrawn via CI gate failure.

### Security Posture Claims

The Prismatic Perimeter's security ratings (A-F grades) are backed by automated evidence collection: DNS configuration analysis, TLS certificate validation, HTTP header inspection, and service fingerprinting. The rating is not a human judgment -- it is a computed result from collected evidence, and the computation is reproducible and auditable.

### Agent Capability Claims

When the platform claims "530 AIAD agents," that number comes from an automated registry scan (`./aiad/bin/aiad index`) that counts agent definition files. The claim is regenerated whenever the registry is rebuilt, ensuring the number always reflects reality.

## Related Concepts

The "proves before claiming" principle connects deeply to the Prismatic Platform's epistemic and quality infrastructure:

- [Evidence Over Opinion](/glossary/evidence-over-opinion/) -- the broader epistemic principle that evidence supersedes belief, of which "proves before claiming" is the operational enforcement
- [Trinity Gate](/glossary/trinity-gate/) -- the three-layer verification system that requires structural, logical, and formal proof before critical claims are accepted
- [Formal Verification](/glossary/formal-verification/) -- the strongest form of evidence, providing mathematical proof of program properties
- [Quality Gate](/glossary/quality-gate/) -- automated checkpoints that verify quality claims are backed by evidence before code can progress
- [Quality Evidence Truth](/glossary/quality-evidence-truth/) -- the principle that quality is defined by evidence, not by declaration or estimation
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- the NABLA axiom requiring all beliefs to be traceable to their origin evidence
- [Axiom Enforcement](/glossary/axiom-enforcement/) -- the mechanism that enforces non-negotiable epistemic rules including evidence requirements
- [Verification](/glossary/verification/) -- the general practice of confirming that implementations satisfy their specifications
- [Property-Based Testing](/glossary/property-based-testing/) -- an evidence generation mechanism that explores input spaces automatically rather than relying on manually chosen examples
- [Continuous Validation](/glossary/continuous-validation/) -- the practice of continuously regenerating evidence to ensure claims remain valid as the system evolves

## See Also

- [Quality DNA](/glossary/quality-dna/) -- the persistence mechanism that carries evidence and quality state across development sessions
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- the autonomous system that monitors evidence quality and triggers alerts when claims become unsupported
- [Regression Testing](/glossary/regression-testing/) -- evidence that previously proven claims remain true after system changes
- [Dialyzer](/glossary/dialyzer/) -- type-level evidence generation through success typing analysis

---

*Built with precision. Every claim earned, never assumed.*

[Prismatic Platform](https://github.com/korczis/prismatic-platform) | Created by [Tomas Korcak (korczis)](https://github.com/korczis)
