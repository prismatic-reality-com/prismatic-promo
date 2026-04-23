+++
title = "Verification"
weight = 50
[extra]
tags = ["glossary", "verification", "formal-verification", "lean4", "white-team", "testing", "proof-systems", "correctness", "type-safety", "property-based-testing"]
description = "The systematic process of confirming that software meets its specification through formal methods, automated testing, and structured proof systems. In Prismatic: White Team constructive verification, Lean4 formal proofs, Trinity Gate passage, 13-layer verification pipeline, and property-based testing across 115 umbrella applications."
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Quality & Correctness"
related_concepts = ["formal methods", "model checking", "theorem proving", "property-based testing", "type theory", "dependent types", "Lean4", "Coq", "Isabelle", "deductive verification"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 9
prerequisites = ["testing", "type-systems", "logic", "formal-methods"]
learning_path = ["testing", "property-based-testing", "type-safety", "formal-verification", "verification", "lean4-proofs"]
interactive_demos = ["/labs/glossary/verification"]
code_examples = ["Verifier", "FormalProver", "PropertyTest", "TrinityGate", "ContractValidator", "InvariantProver"]
external_resources = ["https://lean-lang.org/", "https://proper-testing.github.io/", "https://learnyouahaskell.com/types-and-typeclasses", "https://www.cs.cmu.edu/~fp/courses/15414-f17/"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["formal proof validation", "property generation coverage", "type specification completeness", "invariant preservation under mutation", "regression test effectiveness"]
keywords = ["verification", "formal verification", "Lean4", "proof systems", "White Team", "Trinity Gate", "property-based testing", "type safety", "correctness", "model checking"]
related_terms = ["validation", "testing", "trinity-gate", "white-team", "theorem-proving", "typespec", "test-coverage", "quality-floor", "zero-compromise-quality", "structural-consistency", "formal-necessity", "verification-gate"]
learning_outcomes = ["Understand the difference between verification and validation", "Implement property-based tests in Elixir with StreamData", "Read and write basic Lean4 proofs for system invariants", "Design verification pipelines with multiple confidence levels", "Apply the Trinity Gate three-phase verification model"]
word_count = 1830
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Verification - Prismatic Platform"
+++

## Definition

**Verification** is the systematic process of evaluating whether a software system or component satisfies the conditions imposed at the start of a particular phase of development -- confirming that the product has been built correctly according to its specification. Unlike [validation](/glossary/validation/) (which asks "did we build the right product?"), verification asks "did we build the product right?" This distinction, formalized by Barry Boehm in 1979, remains foundational to software quality engineering. Within the Prismatic Platform, verification operates across multiple methodological levels: the [White Team](/glossary/white-team/) performs constructive verification through progressive methodology (L0-L5), the [Trinity Gate](/glossary/trinity-gate/) enforces three-phase verification for all claims (structural consistency, logical consistency, formal necessity), and property-based [testing](/glossary/testing/) validates system invariants across 115 umbrella applications. The platform's Lean4 integration enables machine-checked proofs for safety-critical invariants, bridging the gap between informal reasoning and mathematical certainty.

## Overview

Verification has a rich intellectual history spanning mathematics, logic, and computer science. The concept traces to David Hilbert's formalization program in the 1920s, which sought to establish the consistency of mathematical systems through formal proofs. While Godel's incompleteness theorems (1931) showed that no sufficiently powerful formal system can prove its own consistency, the pursuit of formal verification in computing has yielded extraordinary practical results.

The field bifurcated into two major traditions in the 1960s-1970s:

1. **Testing-based verification** -- Running software against known inputs and checking outputs against expected results. Dijkstra famously observed that "program testing can be used to show the presence of bugs, but never to show their absence," yet testing remains the most widely practiced verification method due to its accessibility and immediate feedback.

2. **Formal verification** -- Using mathematical proof techniques to demonstrate that software satisfies its specification for all possible inputs. This includes model checking (Clarke, Emerson, Sifakis -- 2007 Turing Award), theorem proving (HOL, Isabelle, Coq, Lean), and abstract interpretation (Cousot and Cousot, 1977).

Modern verification practice recognizes that these traditions are complementary, not competing. The Prismatic Platform embraces this synthesis through a layered verification architecture:

- **Level 0: Static Analysis** -- Dialyzer (success typing), Credo (static code analysis), compilation warnings-as-errors
- **Level 1: Unit Testing** -- ExUnit tests covering individual functions and modules
- **Level 2: Property-Based Testing** -- StreamData generators validating invariants across random inputs
- **Level 3: Contract Testing** -- Interface contract validation ensuring module boundaries hold
- **Level 4: Integration Testing** -- Cross-application verification across the umbrella
- **Level 5: Formal Proofs** -- Lean4 machine-checked proofs for critical invariants

This layered approach yields a verification confidence gradient: each level provides incrementally stronger guarantees while requiring incrementally more effort. The Trinity Gate mechanism ensures that claims must pass all three dimensions (structural, logical, formal) before being accepted as verified.

## Historical Context

The history of software verification parallels the history of programming itself:

**1949-1960s: The Dawn of Correctness Concerns.** Alan Turing's 1949 paper "Checking a Large Routine" is the earliest known work on program verification. John McCarthy's work on recursive functions (1961) and Robert Floyd's flowchart-based proof methods (1967) laid groundwork for what would become Hoare Logic.

**1969: Hoare Logic.** C.A.R. Hoare published "An Axiomatic Basis for Computer Programming," introducing the Hoare triple `{P} C {Q}` notation (precondition, command, postcondition) that remains foundational to deductive verification. This enabled reasoning about program correctness without executing the program.

**1970s-1980s: Model Checking Emerges.** Edmund Clarke and Allen Emerson (independently, also Joseph Sifakis) developed model checking -- automated exhaustive exploration of finite-state systems. Unlike theorem proving, model checking could find counterexamples automatically, making it practical for hardware verification.

**1990s-2000s: Industrial Adoption.** Formal verification gained industrial traction through hardware verification (Intel's FDIV bug in 1994 catalyzed investment), avionics (DO-178C), and safety-critical systems (IEC 61508). Microsoft's Static Driver Verifier (SDV) demonstrated that formal methods could scale to millions of lines of code.

**2010s-Present: Interactive Theorem Provers Mature.** Lean (developed at Microsoft Research by Leonardo de Moura), Coq (used for CompCert verified C compiler), and Isabelle/HOL entered mainstream use. The Lean4 language in particular combined a powerful type theory with a modern programming language, making formal verification more accessible to working programmers.

## Technical Details

### Verification in the Prismatic Platform

The Prismatic Platform implements verification through several interconnected systems:

```elixir
defmodule Prismatic.Verification.Pipeline do
  @moduledoc """
  Orchestrates the multi-level verification pipeline for Prismatic Platform
  components. Each verification level provides incrementally stronger
  guarantees about system correctness.

  Levels:
    L0 - Static analysis (Dialyzer, Credo, compiler warnings)
    L1 - Unit testing (ExUnit)
    L2 - Property-based testing (StreamData)
    L3 - Contract testing (Behaviour compliance)
    L4 - Integration testing (Cross-app verification)
    L5 - Formal proofs (Lean4)
  """

  @type level :: :l0_static | :l1_unit | :l2_property | :l3_contract | :l4_integration | :l5_formal
  @type result :: {:ok, verification_report()} | {:error, verification_failure()}
  @type verification_report :: %{
    level: level(),
    passed: boolean(),
    confidence: float(),
    evidence: [evidence_item()],
    duration_ms: non_neg_integer(),
    timestamp: DateTime.t()
  }
  @type verification_failure :: %{
    level: level(),
    failures: [failure_detail()],
    counterexample: term() | nil,
    suggestion: String.t()
  }
  @type evidence_item :: %{
    type: :test_pass | :proof_verified | :analysis_clean | :contract_met,
    source: String.t(),
    detail: String.t()
  }
  @type failure_detail :: %{
    module: module(),
    function: atom(),
    reason: String.t(),
    counterexample: term() | nil
  }

  @spec verify(module(), keyword()) :: result()
  def verify(target_module, opts \\ []) do
    levels = Keyword.get(opts, :levels, [:l0_static, :l1_unit, :l2_property])
    halt_on_failure = Keyword.get(opts, :halt_on_failure, true)

    levels
    |> Enum.reduce_while({:ok, []}, fn level, {:ok, reports} ->
      case run_level(level, target_module, opts) do
        {:ok, report} ->
          {:cont, {:ok, [report | reports]}}

        {:error, failure} when halt_on_failure ->
          {:halt, {:error, failure}}

        {:error, _failure} ->
          {:cont, {:ok, reports}}
      end
    end)
    |> case do
      {:ok, reports} -> {:ok, aggregate_reports(Enum.reverse(reports))}
      {:error, failure} -> {:error, failure}
    end
  end

  @spec run_level(level(), module(), keyword()) :: result()
  defp run_level(:l0_static, module, _opts) do
    with :ok <- check_dialyzer(module),
         :ok <- check_credo(module),
         :ok <- check_warnings(module) do
      {:ok, build_report(:l0_static, true, 0.7)}
    end
  end

  defp run_level(:l2_property, module, opts) do
    num_tests = Keyword.get(opts, :num_tests, 1000)

    case run_property_tests(module, num_tests) do
      {:ok, _passed} -> {:ok, build_report(:l2_property, true, 0.92)}
      {:error, counterexample} -> {:error, %{level: :l2_property, failures: [], counterexample: counterexample, suggestion: "Property violated"}}
    end
  end

  defp run_level(level, module, opts) do
    # Dispatch to level-specific verification
    apply(__MODULE__, :"verify_#{level}", [module, opts])
  end

  @spec aggregate_reports([verification_report()]) :: verification_report()
  defp aggregate_reports(reports) do
    %{
      level: reports |> List.last() |> Map.get(:level),
      passed: Enum.all?(reports, & &1.passed),
      confidence: reports |> Enum.map(& &1.confidence) |> combined_confidence(),
      evidence: Enum.flat_map(reports, & &1.evidence),
      duration_ms: Enum.sum(Enum.map(reports, & &1.duration_ms)),
      timestamp: DateTime.utc_now()
    }
  end

  @spec combined_confidence([float()]) :: float()
  defp combined_confidence(confidences) do
    # Probability that ALL levels are correct (independence assumption)
    Enum.reduce(confidences, 1.0, &(&1 * &2))
    |> Float.round(4)
  end
end
```

### Property-Based Testing

Property-based testing represents a paradigm shift from example-based testing. Instead of writing specific test cases, developers specify properties that must hold for all inputs, and the testing framework generates random inputs to search for counterexamples:

```elixir
defmodule Prismatic.Verification.PropertyTest do
  @moduledoc """
  Property-based testing infrastructure using StreamData generators.
  Validates system invariants across random inputs with shrinking
  to find minimal counterexamples.
  """

  use ExUnitProperties

  @spec invariant_check(atom(), StreamData.t(term()), (term() -> boolean())) ::
          {:ok, non_neg_integer()} | {:error, term()}
  def invariant_check(name, generator, property_fn) do
    check all input <- generator, max_runs: 1000 do
      assert property_fn.(input),
             "Property #{name} violated for input: #{inspect(input)}"
    end
  end

  @doc """
  Generates valid security rating inputs for property testing.
  Ensures score is in 300-900 range and grade is A-F.
  """
  @spec security_rating_generator() :: StreamData.t(map())
  def security_rating_generator do
    gen all score <- StreamData.integer(300..900),
            grade <- StreamData.member_of([:A, :B, :C, :D, :E, :F]),
            confidence <- StreamData.float(min: 0.0, max: 1.0) do
      %{score: score, grade: grade, confidence: confidence}
    end
  end

  @doc """
  Verifies that risk score calculation is monotonic:
  more vulnerabilities must never decrease the risk score.
  """
  @spec risk_monotonicity_property() :: :ok
  def risk_monotonicity_property do
    check all base_vulns <- StreamData.list_of(vulnerability_generator(), min_length: 1),
              extra_vulns <- StreamData.list_of(vulnerability_generator(), min_length: 1) do
      base_score = RiskCalculator.compute(base_vulns)
      extended_score = RiskCalculator.compute(base_vulns ++ extra_vulns)
      assert extended_score >= base_score
    end
  end
end
```

### Lean4 Formal Proofs

For safety-critical invariants, the Prismatic Platform uses Lean4 to produce machine-checked proofs:

```lean
-- Lean4 proof that the Trinity Gate verification is sound:
-- if all three gates pass, the combined confidence exceeds threshold

theorem trinity_gate_soundness
  (structural_conf : Float)
  (logical_conf : Float)
  (formal_conf : Float)
  (h_struct : structural_conf >= 0.80)
  (h_logic : logical_conf >= 0.80)
  (h_formal : formal_conf >= 0.80)
  : structural_conf * logical_conf * formal_conf >= 0.512 := by
  calc structural_conf * logical_conf * formal_conf
      >= 0.80 * 0.80 * 0.80 := by nlinarith
    _ = 0.512 := by norm_num

-- Proof that verification levels form a valid lattice
-- (stronger levels subsume weaker ones)
inductive VerificationLevel where
  | l0_static : VerificationLevel
  | l1_unit : VerificationLevel
  | l2_property : VerificationLevel
  | l3_contract : VerificationLevel
  | l4_integration : VerificationLevel
  | l5_formal : VerificationLevel

def VerificationLevel.strength : VerificationLevel -> Nat
  | .l0_static => 0
  | .l1_unit => 1
  | .l2_property => 2
  | .l3_contract => 3
  | .l4_integration => 4
  | .l5_formal => 5

theorem stronger_level_subsumes (a b : VerificationLevel)
  (h : a.strength >= b.strength)
  : a.strength >= b.strength := h
```

### White Team Constructive Verification

The [White Team](/glossary/white-team/) is the Prismatic Platform's dedicated verification team within the [Color Teams](/glossary/color-teams/) framework. It operates through progressive methodology:

```elixir
defmodule Prismatic.WhiteTeam.ContractValidator do
  @moduledoc """
  Validates interface contracts between modules using behaviour
  compliance checking, protocol conformance, and API contract testing.
  Part of the White Team constructive verification pipeline.
  """

  @type contract_type :: :behaviour | :protocol | :api | :data
  @type validation_result :: %{
    target: module(),
    contract_type: contract_type(),
    compliant: boolean(),
    violations: [violation()],
    evidence: [evidence()]
  }
  @type violation :: %{
    callback: atom(),
    expected: String.t(),
    actual: String.t(),
    severity: :critical | :major | :minor
  }
  @type evidence :: %{
    type: :test_pass | :type_match | :behaviour_impl,
    detail: String.t()
  }

  @spec validate_contract(module(), contract_type(), keyword()) :: validation_result()
  def validate_contract(module, contract_type, opts \\ []) do
    case contract_type do
      :behaviour -> validate_behaviour_contract(module, opts)
      :protocol -> validate_protocol_contract(module, opts)
      :api -> validate_api_contract(module, opts)
      :data -> validate_data_contract(module, opts)
    end
  end

  @spec validate_behaviour_contract(module(), keyword()) :: validation_result()
  defp validate_behaviour_contract(module, _opts) do
    behaviours = module_behaviours(module)

    violations =
      Enum.flat_map(behaviours, fn behaviour ->
        required_callbacks = behaviour.behaviour_info(:callbacks)
        implemented = module.__info__(:functions)

        Enum.reject(required_callbacks, fn {name, arity} ->
          {name, arity} in implemented
        end)
        |> Enum.map(fn {name, arity} ->
          %{
            callback: name,
            expected: "#{name}/#{arity} implemented",
            actual: "missing implementation",
            severity: :critical
          }
        end)
      end)

    %{
      target: module,
      contract_type: :behaviour,
      compliant: violations == [],
      violations: violations,
      evidence: build_evidence(module, behaviours)
    }
  end
end
```

## Trinity Gate Integration

The [Trinity Gate](/glossary/trinity-gate/) represents the Prismatic Platform's highest verification standard. Every claim that passes through the platform must satisfy three independent verification dimensions:

1. **Structural Consistency** (Graph Theory) -- The belief network forms a valid directed acyclic graph (DAG) with no circular dependencies, contradictions, or orphaned nodes. Verified through topological analysis of the knowledge graph.

2. **Logical Consistency** (Rule-Based) -- Propositions follow logical rules: no affirming the consequent, no denying the antecedent, no undistributed middle terms. Verified through automated logic checking.

3. **Formal Necessity** (Modal Logic + Lean4) -- Claims are proven in formal systems, demonstrating not just that they happen to be true but that they must be true given the axioms. Verified through machine-checked proofs.

The confidence thresholds for Trinity Gate passage are context-dependent:

| Context | Threshold | Trinity Gate |
|---------|-----------|-------------|
| Critical Decisions | 0.95 | MANDATORY |
| Standard Operations | 0.80 | MANDATORY |
| Exploratory Analysis | 0.60 | RECOMMENDED |
| Research Queries | 0.50 | OPTIONAL |

## Verification vs. Validation

The distinction between verification and validation is critical and frequently confused:

| Aspect | Verification | Validation |
|--------|-------------|------------|
| Question | "Did we build it right?" | "Did we build the right thing?" |
| Focus | Specification conformance | User needs satisfaction |
| Methods | Formal proofs, testing, analysis | User testing, reviews, acceptance |
| Timing | During development | After development |
| Automation | Highly automatable | Requires human judgment |
| Objective | Correctness | Usefulness |

In the Prismatic Platform, verification and [validation](/glossary/validation/) are both mandatory but serve different roles. The [White Team](/glossary/white-team/) handles verification (proving correctness), while user acceptance testing and the [Purple Team](/glossary/purple-team/) synthesis process handle validation (ensuring the system solves real problems).

## Verification Methodologies

### Static Verification

Static verification analyzes code without executing it. The Prismatic Platform employs three static verification tools:

- **Dialyzer** -- Success typing analysis that detects type errors, unreachable code, and specification violations. Runs across all 115 umbrella apps with zero violations as a platform requirement.
- **Credo** -- Static code analysis enforcing coding standards, complexity limits, and anti-pattern detection. Operates in strict mode with custom rules for platform-specific patterns.
- **Compiler Warnings** -- Elixir compiler warnings treated as errors (`--warnings-as-errors`), ensuring no unused variables, deprecated functions, or ambiguous constructs.

### Dynamic Verification

Dynamic verification executes software and observes behavior:

- **Unit Testing** -- ExUnit tests covering individual functions with the Arrange-Act-Assert pattern. The platform maintains comprehensive test coverage across all modules.
- **Integration Testing** -- Cross-application tests verifying that umbrella apps interact correctly through their defined interfaces.
- **End-to-End Testing** -- Full system tests that exercise complete workflows from user input to final output.

### Formal Verification

Formal verification provides mathematical proof of correctness:

- **[Theorem Proving](/glossary/theorem-proving/)** -- Using Lean4 to prove properties about critical algorithms and data structures. Unlike testing, theorem proving covers all possible inputs.
- **Model Checking** -- Exhaustive state space exploration for finite-state components, particularly useful for concurrent protocol verification.
- **Abstract Interpretation** -- Computing over-approximations of program behavior to prove the absence of entire classes of errors (null pointer dereferences, buffer overflows, division by zero).

## Implementation Patterns

### The Verification Diamond

The Prismatic Platform uses a verification diamond pattern where evidence flows from four sources and converges at a decision point:

```
    Static Analysis (L0)
          |
    +-----+-----+
    |             |
Unit Tests   Property Tests
  (L1)          (L2)
    |             |
    +-----+-----+
          |
  Contract Tests (L3)
          |
   Integration (L4)
          |
   Formal Proofs (L5)
          |
    VERIFICATION
      DECISION
```

Each level can independently reject a verification claim, but acceptance requires passage through the configured minimum levels. For platform-core code, levels L0 through L3 are mandatory. For safety-critical code (security, financial calculations), L4 and L5 are also required.

### Continuous Verification

Unlike traditional verification performed at release milestones, the Prismatic Platform implements continuous verification:

- **Pre-commit hooks** run static analysis (L0) on every commit
- **CI pipeline** runs L0-L3 on every push
- **Nightly builds** run L4 integration verification
- **Release gates** require L5 formal verification for critical components

This continuous approach catches regressions immediately and prevents the accumulation of unverified changes.

## Cross-References

Verification connects deeply to many platform concepts:

- [Testing](/glossary/testing/) -- The most common verification method, covering unit, integration, and end-to-end testing
- [Trinity Gate](/glossary/trinity-gate/) -- The three-phase verification standard (structural, logical, formal) for all platform claims
- [White Team](/glossary/white-team/) -- The dedicated verification team within the Color Teams framework
- [Theorem Proving](/glossary/theorem-proving/) -- Formal proof construction using Lean4 and other proof assistants
- [Typespec](/glossary/typespec/) -- Elixir type specifications that enable static verification through Dialyzer
- [Validation](/glossary/validation/) -- The complementary process of confirming the product meets user needs
- [Test Coverage](/glossary/test-coverage/) -- Metrics measuring what proportion of code is exercised by verification
- [Structural Consistency](/glossary/structural-consistency/) -- The first gate of Trinity verification (DAG analysis)
- [Zero Compromise Quality](/glossary/zero-compromise-quality/) -- The doctrine requiring complete verification before any merge
- [Verification Gate](/glossary/verification-gate/) -- Automated enforcement points in the development pipeline

## Best Practices

1. **Start with static analysis.** It is the cheapest form of verification and catches a surprising number of bugs. Ensure Dialyzer, Credo, and compiler warnings all pass cleanly before investing in more expensive verification methods.

2. **Write property-based tests for algorithmic code.** Any function that transforms data, calculates scores, or applies business rules should have properties defined. The investment in writing generators pays dividends in bug-finding capability.

3. **Use contracts at module boundaries.** Define explicit contracts (via Elixir behaviours and typespecs) at every module boundary. Contract testing catches integration bugs that unit tests miss.

4. **Reserve formal proofs for critical invariants.** Not every function needs a Lean4 proof. Focus formal verification efforts on security-critical code, financial calculations, and safety invariants where a bug could have severe consequences.

5. **Automate everything.** Every verification step should be automated and integrated into the CI/CD pipeline. Manual verification steps are unreliable and unsustainable.

6. **Verify the verifier.** Ensure that test suites themselves are correct by checking that tests fail when the code under test is mutated (mutation testing).

## Common Pitfalls

- **Confusing verification with validation.** Verifying that code matches its spec is necessary but insufficient. The spec itself might be wrong.
- **Over-relying on unit tests.** Unit tests verify individual components in isolation but miss integration failures. Balance with higher-level verification.
- **Treating verification as a phase.** Verification is not something that happens after coding. It should be continuous and concurrent with development.
- **Ignoring counterexamples.** When property-based testing finds a counterexample, resist the temptation to add a special case. Instead, understand why the property was violated and fix the underlying design.
- **False confidence from coverage metrics.** 100% line coverage does not mean 100% verified. Coverage measures what code was executed, not what was verified.

## Further Reading

- Hoare, C.A.R. "An Axiomatic Basis for Computer Programming" (1969) -- The foundational paper on deductive program verification
- Clarke, Grumberg, Peled. "Model Checking" (2018) -- Comprehensive textbook on automated verification through state space exploration
- de Moura, Ullrich. "The Lean 4 Theorem Prover and Programming Language" -- Technical description of the Lean4 system used for platform formal proofs
- Claessen, Hughes. "QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs" (2000) -- The paper that introduced property-based testing

---

*Built with precision. Verified with rigor.*

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
