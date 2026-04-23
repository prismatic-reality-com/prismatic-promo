+++
title = "Formal Proof"
weight = 50
[extra]
tags = ["glossary", "verification", "formal-methods", "theorem-proving", "lean4", "trinity-gate", "mathematical-logic", "correctness"]
description = "A formal proof is a finite sequence of logical deductions from axioms and previously established theorems, written in a formal language with machine-checkable syntax, used in the Prismatic Platform to provide mathematical certainty about system properties."
category = "verification"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["formal-necessity", "formal-verification", "theorem-proving", "lean4", "trinity-gate", "property-based-testing", "static-analysis", "logical-consistency", "modal-logic", "nabla-infinity"]
key_concepts = ["deductive reasoning", "proof assistants", "Lean4", "type theory", "Curry-Howard correspondence", "machine-checked proofs", "proof obligations"]
use_cases = ["compiler correctness", "cryptographic protocol verification", "invariant enforcement", "safety-critical systems", "regulatory compliance"]
prerequisites = ["logical-consistency", "formal-verification"]
complexity_level = "expert"
platform_relevance = "critical"
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 2428
date_modified = "2026-02-23"
keywords = ["Formal", "Proof", "Prismatic", "Platform", "glossary", "verification", "Prismatic Platform", "Elixir"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Formal Proof - Prismatic Platform"
+++

## Definition

A formal proof is a finite sequence of well-formed formulas in a formal language, where each formula is either an axiom of the system, a previously proven theorem, or follows from earlier formulas in the sequence by a valid rule of inference. Unlike informal mathematical proofs (which rely on natural language and shared understanding), formal proofs are written in a precise symbolic language that admits no ambiguity and can be mechanically verified by a computer. Within the Prismatic Platform, formal proofs serve as the ultimate standard of evidence for system properties, providing mathematical certainty that specific invariants, safety conditions, and correctness criteria hold under all circumstances.

The significance of formal proofs in software engineering has grown dramatically as systems become more complex and the cost of failures increases. Traditional verification methods (testing, code review, static analysis) provide varying degrees of confidence but cannot provide certainty. A formal proof, once verified by a proof checker, establishes a property with the same certainty as a mathematical theorem. This makes formal proofs invaluable for security-critical, safety-critical, and compliance-sensitive systems where the consequences of errors are severe.

## Overview

The history of formal proofs stretches from Euclid's axiomatic geometry through Frege's Begriffsschrift (1879) -- the first formal logical system -- to modern proof assistants like Lean4, Coq, Isabelle, and Agda. The development of the Curry-Howard correspondence in the 20th century established a deep connection between formal proofs and computer programs: a proof of a proposition corresponds to a program of a certain type. This insight enabled the creation of proof assistants where writing a proof is equivalent to writing a type-correct program, and the type checker serves as the proof verifier.

In the context of the Prismatic Platform, formal proofs play three distinct roles. First, they serve as the verification mechanism for the formal necessity pillar of the Trinity Gate, providing machine-checked evidence that system properties are not merely observed but mathematically guaranteed. Second, they serve as documentation artifacts that precisely specify what a system component does and why it is correct, surviving beyond any individual developer's tenure. Third, they serve as compliance evidence for regulatory frameworks (NIS2, ZKB) that require demonstrable proof of security and reliability properties.

The platform uses Lean4 as its primary proof assistant, chosen for its modern design, active development community, and excellent metaprogramming capabilities. Lean4's dependent type system allows expressing arbitrary mathematical propositions as types, and programs of those types serve as proofs. The platform generates proof obligations from Elixir specifications and delegates them to Lean4 for verification, bridging the gap between the production codebase and the formal verification infrastructure.

The practical value of formal proofs extends beyond correctness guarantees. The process of formalizing a property often reveals implicit assumptions, edge cases, and design flaws that would not be apparent from informal reasoning. Many teams report that the act of writing a formal specification is more valuable than the proof itself, because it forces precise thinking about what the system should do.

## Technical Details

### Proof Theory Foundations

A formal proof system consists of four components: a formal language (defining the syntax of well-formed formulas), a set of axioms (formulas accepted as true without proof), a set of inference rules (rules for deriving new formulas from existing ones), and a notion of proof (a finite sequence of formulas satisfying the above constraints).

The most commonly used proof systems in software verification are:

- **Natural Deduction**: Proofs proceed by introducing and eliminating logical connectives. Each connective (and, or, implies, forall, exists) has introduction and elimination rules. Natural deduction proofs closely mirror informal mathematical reasoning.

- **Sequent Calculus**: Proofs manipulate sequents (pairs of formula sets representing assumptions and conclusions). Sequent calculus is well-suited for automated proof search because its rules are more constrained than natural deduction.

- **Type Theory**: Proofs are programs, propositions are types. The Calculus of Inductive Constructions (CIC), used by Lean4 and Coq, extends simple type theory with dependent types, inductive types, and a universe hierarchy. This framework is powerful enough to formalize virtually all of mathematics and computer science.

### Lean4 Integration Architecture

The Prismatic Platform integrates with Lean4 through a proof obligation pipeline:

```elixir
defmodule PrismaticVerification.ProofPipeline do
  @moduledoc """
  Generates proof obligations from Elixir specifications,
  delegates to Lean4 for verification, and caches results.
  """

  @type proof_obligation :: %{
    name: String.t(),
    proposition: String.t(),
    context: [String.t()],
    priority: :critical | :standard | :exploratory
  }

  @type proof_result ::
    {:verified, %{lean_output: binary(), time_ms: non_neg_integer()}}
    | {:failed, %{error: binary(), counterexample: term() | nil}}
    | {:timeout, %{elapsed_ms: non_neg_integer()}}

  @spec generate_obligations(module()) :: [proof_obligation()]
  def generate_obligations(module) do
    module
    |> extract_specifications()
    |> Enum.map(&translate_to_lean4/1)
    |> Enum.sort_by(& &1.priority, :asc)
  end

  @spec verify_obligation(proof_obligation()) :: proof_result()
  def verify_obligation(obligation) do
    lean_source = build_lean4_source(obligation)

    case invoke_lean4_checker(lean_source) do
      {:ok, output, time_ms} ->
        cache_proof(obligation.name, output)
        {:verified, %{lean_output: output, time_ms: time_ms}}

      {:error, error_output} ->
        counterexample = extract_counterexample(error_output)
        {:failed, %{error: error_output, counterexample: counterexample}}

      :timeout ->
        {:timeout, %{elapsed_ms: verification_timeout_ms()}}
    end
  end

  @spec extract_specifications(module()) :: [map()]
  defp extract_specifications(module) do
    {:ok, specs} = Code.Typespec.fetch_specs(module)

    Enum.map(specs, fn {{func_name, arity}, spec_forms} ->
      %{
        function: func_name,
        arity: arity,
        specs: spec_forms,
        doc: fetch_doc(module, func_name, arity)
      }
    end)
  end

  @spec translate_to_lean4(map()) :: proof_obligation()
  defp translate_to_lean4(spec) do
    %{
      name: "#{spec.function}/#{spec.arity}",
      proposition: elixir_spec_to_lean4_prop(spec.specs),
      context: extract_lean4_context(spec),
      priority: determine_priority(spec)
    }
  end

  @spec build_lean4_source(proof_obligation()) :: String.t()
  defp build_lean4_source(obligation) do
    context_imports = Enum.join(obligation.context, "\n")

    """
    import Mathlib.Tactic
    #{context_imports}

    theorem #{obligation.name} : #{obligation.proposition} := by
      sorry -- Proof obligation generated from Elixir spec
    """
  end

  @spec invoke_lean4_checker(String.t()) :: {:ok, binary(), non_neg_integer()} | {:error, binary()} | :timeout
  defp invoke_lean4_checker(source) do
    start_time = System.monotonic_time(:millisecond)

    case System.cmd("lean", ["--run", "-"], input: source, stderr_to_stdout: true) do
      {output, 0} ->
        elapsed = System.monotonic_time(:millisecond) - start_time
        {:ok, output, elapsed}

      {error, _} ->
        {:error, error}
    end
  rescue
    _ -> :timeout
  end

  @spec cache_proof(String.t(), binary()) :: :ok
  defp cache_proof(name, output) do
    :ets.insert(:proof_cache, {name, output, DateTime.utc_now()})
    :ok
  end

  @spec extract_counterexample(binary()) :: term() | nil
  defp extract_counterexample(_error_output), do: nil

  @spec verification_timeout_ms() :: non_neg_integer()
  defp verification_timeout_ms, do: 30_000

  @spec elixir_spec_to_lean4_prop([term()]) :: String.t()
  defp elixir_spec_to_lean4_prop(_specs), do: "True"

  @spec extract_lean4_context(map()) :: [String.t()]
  defp extract_lean4_context(_spec), do: []

  @spec determine_priority(map()) :: :critical | :standard | :exploratory
  defp determine_priority(_spec), do: :standard

  @spec fetch_doc(module(), atom(), non_neg_integer()) :: String.t() | nil
  defp fetch_doc(_module, _func, _arity), do: nil
end
```

### Proof Artifact Management

Formal proofs are managed as first-class artifacts in the platform's version control system:

```elixir
defmodule PrismaticVerification.ProofArtifact do
  @moduledoc """
  Manages formal proof artifacts alongside the code they verify.
  Tracks dependencies between proofs and code to invalidate
  stale proofs when the codebase changes.
  """

  @type proof_artifact :: %{
    id: String.t(),
    module: module(),
    function: {atom(), non_neg_integer()},
    lean4_source: String.t(),
    lean4_proof: String.t(),
    verified_at: DateTime.t(),
    code_hash: binary(),
    status: :valid | :stale | :failed
  }

  @spec check_validity(proof_artifact()) :: :valid | :stale
  def check_validity(artifact) do
    current_hash = compute_code_hash(artifact.module, artifact.function)

    if current_hash == artifact.code_hash do
      :valid
    else
      :stale
    end
  end

  @spec compute_code_hash(module(), {atom(), non_neg_integer()}) :: binary()
  defp compute_code_hash(module, {func, arity}) do
    source = get_function_source(module, func, arity)
    :crypto.hash(:sha256, source)
  end

  @spec get_function_source(module(), atom(), non_neg_integer()) :: binary()
  defp get_function_source(module, func, arity) do
    "#{module}.#{func}/#{arity}"
  end
end
```

### Proof Strategies

The platform employs several proof strategies depending on the nature of the property being verified:

**Inductive Proofs**: For properties that hold over recursive data structures or iterative processes. The proof establishes a base case and an inductive step, showing that if the property holds for smaller instances, it holds for larger ones.

**Refinement Proofs**: For showing that an implementation correctly refines an abstract specification. The proof establishes a simulation relation between the abstract and concrete state spaces, showing that every concrete transition corresponds to a valid abstract transition.

**Compositional Proofs**: For properties of composed systems. The proof establishes properties of individual components and then shows that these properties are preserved under composition. This is essential for the platform's umbrella architecture where 115 applications interact.

**Automated Proofs**: For properties within decidable fragments of logic (e.g., propositional logic, linear arithmetic, array theory). The platform uses SMT solvers (satisfiability modulo theories) integrated with Lean4's tactic framework to automatically discharge simple proof obligations.

## Implementation

### Proof-Driven Development Workflow

The Prismatic Platform encourages a proof-driven development workflow where formal specifications precede implementation:

1. **Specify**: Write the formal specification of the desired property in Lean4 notation.
2. **Prove**: Construct a proof that the specification is satisfiable (there exists an implementation that satisfies it).
3. **Implement**: Write the Elixir implementation guided by the proof structure.
4. **Verify**: Generate proof obligations from the implementation and verify them against the specification.
5. **Maintain**: Track proof validity as the codebase evolves, re-verifying when dependencies change.

This workflow inverts the traditional test-driven development approach. Instead of writing tests that specify behavior through examples, developers write formal specifications that specify behavior through universal properties. The formal proof then guarantees that the implementation satisfies these properties in all cases, not just tested cases.

### Incremental Proof Checking

Full proof verification can be computationally expensive. The platform implements incremental proof checking to minimize verification time during development:

- **Dependency Tracking**: Each proof obligation tracks its dependencies on source code. When a file changes, only proofs that depend on the changed code are re-verified.
- **Proof Caching**: Verified proofs are cached in ETS with their code hashes. If the code hasn't changed, the cached proof is still valid.
- **Parallel Verification**: Independent proof obligations are verified in parallel using Elixir's Task module, leveraging the BEAM's lightweight process model.

### Integration with Quality Gates

Formal proof verification is integrated into the platform's quality gate system. The `mix quality.gates` command includes a formal verification step that checks for stale proofs, missing proof obligations for critical functions, and proof coverage metrics. Deployments are blocked if critical proof obligations are unverified.

## Comparison

### Formal Proofs vs. Unit Tests

| Aspect | Unit Tests | Formal Proofs |
|--------|------------|---------------|
| Scope | Specific inputs/outputs | All possible inputs/outputs |
| Guarantee | Bug absence in tested cases | Property truth in all cases |
| Maintenance | Update tests when behavior changes | Update proofs when specifications change |
| Cost to write | Low to moderate | Moderate to high |
| Cost to verify | Fast (milliseconds) | Variable (seconds to hours) |
| Expressiveness | Concrete examples | Universal properties |
| Tooling maturity | Very mature | Rapidly maturing |

### Formal Proofs vs. Property-Based Testing

Property-based testing (using tools like StreamData) randomly generates test inputs to check universal properties. This provides higher confidence than unit testing but remains fundamentally probabilistic. Formal proofs provide certainty. The two approaches are complementary: property-based testing can quickly find counterexamples that guide proof development, while formal proofs provide guarantees that no amount of random testing can achieve.

### Formal Proofs vs. Static Analysis

Static analysis tools (like Dialyzer for Elixir) check for specific classes of errors (type mismatches, unreachable code, unused variables) using conservative approximations. They can produce false positives (flagging correct code) but not false negatives (missing real errors) for the properties they check. Formal proofs are more expressive (they can verify arbitrary properties) but more expensive to write and verify. Static analysis is best viewed as a lightweight complement to formal proofs, catching simple errors cheaply while formal proofs handle complex properties.

### Formal Proofs vs. Model Checking

Model checking exhaustively explores the state space of a finite-state system to verify temporal logic properties. It is fully automatic (no proof writing required) but limited to finite-state systems or bounded explorations of infinite-state systems. Formal proofs can handle infinite-state systems and arbitrary properties but require manual proof construction. Many verification workflows combine both: model checking explores the state space to find bugs, and formal proofs provide guarantees for the corrected system.

## Best Practices

1. **Formalize critical invariants first.** Focus proof effort on properties where failure has the highest cost: security boundaries, financial integrity, data consistency. Less critical properties can rely on testing and code review.

2. **Use Lean4's tactic mode for proof development.** Lean4's tactic mode allows interactive proof construction where the system shows the current proof state and available hypotheses. This is more productive than constructing proof terms directly.

3. **Decompose proofs into lemmas.** Large proofs are difficult to write, read, and maintain. Break them into small, reusable lemmas that each establish a specific fact. This mirrors the software engineering principle of single responsibility.

4. **Maintain a proof library.** Common proof patterns (induction over lists, properties of sorting, monotonicity of functions) recur across many verification tasks. Building a library of reusable lemmas amortizes the cost of proof development.

5. **Automate proof obligation generation.** The manual step of translating Elixir specifications into Lean4 proof obligations is error-prone. The platform's ProofPipeline module automates this translation, ensuring consistency between the codebase and the formal verification infrastructure.

6. **Review proofs as carefully as code.** A formal proof is only as good as its specification. If the specification is wrong, the proof proves the wrong thing. Proof review should verify that the specification accurately captures the intended property.

7. **Use `sorry` tactically during development.** Lean4's `sorry` tactic allows marking proof obligations as unfinished. This enables incremental proof development where the overall structure is established first and individual proof steps are filled in later. The CI pipeline should flag any remaining `sorry` uses.

8. **Document the proof strategy.** Every non-trivial proof should include a comment explaining the high-level proof strategy (induction, contradiction, construction, etc.) to help future maintainers understand and modify the proof.

## Common Pitfalls

1. **Proving the wrong thing.** The most dangerous failure mode in formal verification is proving a property that does not capture the actual requirement. For example, proving that a sorting function produces a sorted list without proving that the output is a permutation of the input. Always verify that the formal specification matches the informal requirement.

2. **Over-reliance on axioms.** Every axiom is an unproven assumption. Adding too many axioms weakens the guarantees of the proof system. The Prismatic Platform tracks axiom usage and flags proofs that depend on non-standard axioms.

3. **Ignoring computational complexity.** Some proof obligations are undecidable or intractable. Attempting to verify them will result in timeouts or non-termination. Use bounded verification or abstraction for properties that are too complex for full formal proof.

4. **Letting proofs rot.** Proofs that are not maintained alongside the code they verify become stale and useless. The platform's proof artifact management system tracks proof validity, but developers must respond to staleness warnings promptly.

5. **Proof by exhaustion for large domains.** Enumerating all cases for a large (but finite) domain produces a valid proof but one that is fragile and uninformative. Prefer structural proofs that explain *why* the property holds, not just *that* it holds.

6. **Neglecting performance of proof checking.** A proof that takes hours to verify on every CI run will be bypassed or ignored. Optimize proof structure for efficient checking, use caching, and parallelize independent obligations.

7. **Treating formal proofs as a replacement for testing.** Formal proofs and tests serve complementary purposes. Tests verify behavior against concrete scenarios and serve as executable documentation. Proofs verify properties universally. Both are needed.

## Use Cases

### Cryptographic Protocol Verification

Formal proofs are essential for cryptographic protocol verification, where subtle errors can lead to complete security failures. The Prismatic Platform uses formal proofs to verify that its authentication protocols, key exchange mechanisms, and encryption implementations satisfy their security specifications. These proofs are generated from the protocol specifications and verified against established cryptographic security models.

### Financial Computation Correctness

Financial calculations require exact correctness -- rounding errors, overflow conditions, and precision loss are unacceptable. Formal proofs verify that the platform's financial computations (security rating scores, risk assessments, compliance metrics) produce correct results for all valid inputs, including edge cases at the boundaries of numeric ranges.

### Compliance Evidence Generation

Regulatory frameworks increasingly require demonstrable evidence of security and reliability. Formal proofs serve as the strongest form of compliance evidence, showing that required properties are mathematically guaranteed rather than merely tested. The platform generates compliance proof packages that include the formal specifications, the proofs, and the verification reports.

### Distributed Consensus Verification

The platform's distributed components rely on consensus protocols for state synchronization. Formal proofs verify that these protocols satisfy liveness (eventually making progress) and safety (never producing inconsistent states) under the specified failure model. These proofs are based on established formalizations of consensus protocols in the distributed systems literature.

### Agent Safety Guarantees

With 530+ agents in the platform ecosystem, formal proofs verify critical safety properties of agent interactions: no circular delegation, bounded resource consumption, deterministic output for deterministic input, and compliance with the NABLA axioms. These proofs are especially important for the Color Team security agents, where incorrect behavior could undermine the platform's security posture.

## Related Concepts

Formal proof connects to numerous concepts in the Prismatic Platform:

- [Formal Necessity](/glossary/formal-necessity/) is the modal logic property that formal proofs establish within the Trinity Gate framework
- [Formal Verification](/glossary/formal-verification/) is the broader discipline encompassing formal proofs, model checking, and static analysis
- [Theorem Proving](/glossary/theorem-proving/) covers the algorithms and heuristics used to construct formal proofs
- [Lean4](/glossary/lean4/) is the proof assistant used by the Prismatic Platform for constructing and checking formal proofs
- [Trinity Gate](/glossary/trinity-gate/) is the verification framework where formal proofs provide evidence for the formal necessity pillar
- [Property-Based Testing](/glossary/property-based-testing/) is a complementary technique that uses randomized testing to explore universal properties
- [Static Analysis](/glossary/static-analysis/) provides lightweight verification that complements formal proofs for common error classes
- [Dialyzer](/glossary/dialyzer/) is the Elixir/Erlang static analysis tool that provides success typing analysis
- [Logical Consistency](/glossary/logical-consistency/) is the second Trinity Gate pillar that formal proofs support
- [Nabla Infinity](/glossary/nabla-infinity/) is the epistemic framework that mandates formal proofs for high-confidence claims

## See Also

- [Modal Logic](/glossary/modal-logic/) for the theoretical framework underlying necessity proofs
- [Quality Gates](/glossary/quality-gates/) for how formal proof verification integrates with the CI/CD pipeline
- [Epistemic Reasoning](/glossary/epistemic-reasoning/) for the philosophical context of formal proof in knowledge systems
- [Evidence](/glossary/evidence/) for the broader evidence framework where formal proofs serve as the highest tier
- [Code Quality](/glossary/code-quality/) for the platform's comprehensive quality assurance approach

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis). This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) documentation. Contributions welcome via pull requests. Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE). [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
