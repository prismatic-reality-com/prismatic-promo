+++
title = "Functionally Correct"
weight = 50
[extra]
tags = ["glossary", "quality", "verification", "correctness", "testing", "formal-methods", "elixir", "otp"]
description = "Functionally correct software produces the expected output for every valid input as defined by its specification, serving as the foundational quality criterion in the Prismatic Platform's zero-compromise quality regime."
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
related_terms = ["quality-gates", "formal-verification", "property-based-testing", "regression-testing", "trinity-gate", "typespec", "dialyzer", "no-mercy-no-doubts", "quality-dna", "test-coverage"]
platforms = ["prismatic-platform", "elixir-otp"]
audience = ["engineers", "architects", "quality-leads"]
prerequisite_knowledge = ["elixir", "testing", "type-systems"]
technical_level = "advanced"
domain_category = "Software Quality Engineering"
implementation_status = "production"
authority_level = "platform-wide"
keywords = ["functional correctness", "Hoare logic", "property-based testing", "formal verification", "correctness by construction", "invariants", "specifications"]
learning_path = ["testing", "typespec", "property-based-testing", "formal-verification", "functionally-correct"]
stability_level = "stable"
word_count = 1641
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Functionally Correct - Prismatic Platform"
+++

## Definition

Functional correctness is the property of a software system whereby every function, module, and subsystem produces the expected output for every valid input as defined by its formal or informal specification. A functionally correct program does not merely avoid crashing -- it computes the right answer in all specified circumstances, handles edge cases gracefully, and maintains its behavioral contract across the full range of operating conditions. In the Prismatic Platform, functional correctness is not a nice-to-have aspiration but a hard prerequisite enforced at every stage from development through deployment, backed by static analysis, property-based testing, formal verification with Lean4, and a 13-layer Trinity Gate that blocks any claim not proven through structural, logical, and formal consistency checks.

## Overview

The concept of functional correctness originated in the earliest days of computer science, formalized by Tony Hoare in his 1969 paper "An Axiomatic Basis for Computer Programming" through what is now known as Hoare triples: `{P} C {Q}`, where precondition P, program C, and postcondition Q together define a correctness assertion. If P holds before C executes, then Q must hold after execution. Edsger Dijkstra extended this with his weakest-precondition calculus, and the field of formal methods has continued to refine the theoretical underpinnings ever since.

In practice, most production software relies on testing rather than formal proofs for correctness assurance. Unit tests verify individual functions, integration tests verify module interactions, and end-to-end tests verify system behavior. The Prismatic Platform takes this further by combining multiple correctness assurance strategies into a unified quality pipeline:

- **Type specifications** (`@spec`) analyzed by Dialyzer for static type correctness
- **Property-based tests** via StreamData that verify behavioral invariants across random inputs
- **Regression tests** that are mandatory for every bug fix (no exceptions, no bypass)
- **Formal proofs** in Lean4 for critical algorithmic claims via the Trinity Gate
- **Quality gates** that block compilation, commits, and deployments when correctness violations are detected

This layered approach reflects the platform's NO MERCY, NO DOUBTS doctrine: functional correctness is not negotiable, and incomplete or incorrect implementations are rejected outright.

## Technical Details

### Formal Foundations

Functional correctness can be expressed precisely using Hoare logic. For a function `f` with specification `S`:

```
{Pre(x)} f(x) {Post(x, result)}
```

Where `Pre(x)` defines valid inputs and `Post(x, result)` defines the expected relationship between input and output. A function is **totally correct** if it also terminates for all valid inputs (as opposed to merely **partially correct**, where non-termination is permitted).

In Elixir, the type specification system provides a lightweight version of this contract:

```elixir
defmodule Prismatic.Math do
  @doc """
  Computes the factorial of a non-negative integer.

  ## Specification

  - Pre: n >= 0
  - Post: result == n!
  - Terminates: yes (structural recursion on decreasing n)
  """
  @spec factorial(non_neg_integer()) :: pos_integer()
  def factorial(0), do: 1
  def factorial(n) when is_integer(n) and n > 0 do
    n * factorial(n - 1)
  end
end
```

The `@spec` annotation tells Dialyzer what types to expect. The guard clause `when is_integer(n) and n > 0` enforces the precondition at runtime. The pattern match on `factorial(0)` provides the base case that guarantees termination. Together, these mechanisms provide a high degree of confidence in functional correctness without requiring a full formal proof.

### Correctness by Construction in OTP

Erlang/OTP's design philosophy aligns naturally with functional correctness. The "let it crash" philosophy combined with supervision trees means that processes that violate their behavioral contract are restarted to a known-good state rather than allowed to propagate incorrect results:

```elixir
defmodule Prismatic.Correctness.Guardian do
  @moduledoc """
  A GenServer that monitors function correctness at runtime
  by validating return values against known invariants.
  """
  use GenServer

  require Logger

  @type invariant :: (term() -> boolean())
  @type state :: %{
    invariants: %{mfa() => invariant()},
    violations: list(map()),
    check_count: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec register_invariant(module(), atom(), non_neg_integer(), invariant()) :: :ok
  def register_invariant(module, function, arity, invariant_fn) do
    GenServer.call(__MODULE__, {:register, {module, function, arity}, invariant_fn})
  end

  @spec check_result(module(), atom(), list(), term()) :: :ok | {:violation, map()}
  def check_result(module, function, args, result) do
    GenServer.call(__MODULE__, {:check, module, function, args, result})
  end

  @spec violations() :: list(map())
  def violations do
    GenServer.call(__MODULE__, :violations)
  end

  @impl true
  @spec init(keyword()) :: {:ok, state()}
  def init(_opts) do
    {:ok, %{invariants: %{}, violations: [], check_count: 0}}
  end

  @impl true
  def handle_call({:register, mfa, invariant_fn}, _from, state) do
    updated = Map.update!(state, :invariants, &Map.put(&1, mfa, invariant_fn))
    {:reply, :ok, updated}
  end

  def handle_call({:check, module, function, args, result}, _from, state) do
    arity = length(args)
    mfa = {module, function, arity}
    state = Map.update!(state, :check_count, &(&1 + 1))

    case Map.get(state.invariants, mfa) do
      nil ->
        {:reply, :ok, state}

      invariant_fn ->
        if invariant_fn.(result) do
          {:reply, :ok, state}
        else
          violation = %{
            mfa: mfa,
            args: args,
            result: result,
            timestamp: DateTime.utc_now(),
            check_number: state.check_count
          }

          Logger.warning("Correctness violation: #{inspect(mfa)} returned #{inspect(result)}")
          updated = Map.update!(state, :violations, &[violation | &1])
          {:reply, {:violation, violation}, updated}
        end
    end
  end

  def handle_call(:violations, _from, state) do
    {:reply, Enum.reverse(state.violations), state}
  end
end
```

This Guardian process embodies the Prismatic approach: correctness invariants are registered declaratively, results are checked against those invariants at runtime, and violations are recorded with full context for debugging and regression test creation.

### Property-Based Testing for Correctness

While unit tests verify specific input-output pairs, property-based testing verifies behavioral invariants across entire input domains. This provides far stronger correctness guarantees:

```elixir
defmodule Prismatic.Correctness.PropertyTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  # Property: sorting is idempotent
  property "sort(sort(list)) == sort(list)" do
    check all list <- list_of(integer()) do
      sorted = Enum.sort(list)
      assert Enum.sort(sorted) == sorted
    end
  end

  # Property: sorted output contains same elements as input
  property "sort preserves all elements" do
    check all list <- list_of(integer()) do
      sorted = Enum.sort(list)
      assert length(sorted) == length(list)
      assert Enum.sort(list) -- sorted == []
      assert sorted -- Enum.sort(list) == []
    end
  end

  # Property: sorted output is monotonically non-decreasing
  property "sort produces ordered output" do
    check all list <- list_of(integer(), min_length: 2) do
      sorted = Enum.sort(list)

      sorted
      |> Enum.chunk_every(2, 1, :discard)
      |> Enum.each(fn [a, b] -> assert a <= b end)
    end
  end
end
```

These three properties together constitute a strong correctness specification for sorting: idempotency, element preservation, and ordering. If all three hold across thousands of randomly generated inputs, the sorting implementation is functionally correct with high confidence.

## Implementation in the Prismatic Platform

The Prismatic Platform enforces functional correctness through a multi-layer pipeline:

### Layer 1: Compile-Time Analysis

```bash
# Zero warnings policy -- any warning indicates potential correctness issue
mix compile --warnings-as-errors --force

# Dialyzer checks type specifications against actual code
mix dialyzer

# Credo enforces coding standards that promote correctness
mix credo --strict
```

### Layer 2: Test-Time Verification

```bash
# All tests must pass with 100% coverage target
mix test --cover

# Quality gates aggregate all correctness checks
mix quality.gates
```

### Layer 3: Commit-Time Enforcement

The pre-commit hook runs an 11-phase pipeline that includes correctness checks at multiple stages. Code that fails any phase is blocked from entering the repository.

### Layer 4: Trinity Gate

For critical claims and algorithmic assertions, the Trinity Gate requires passage through three independent verification channels:

1. **Structural Consistency** -- the belief network forms a valid directed acyclic graph
2. **Logical Consistency** -- propositions follow formal logical rules
3. **Formal Necessity** -- claims are proven in Lean4 or equivalent formal systems

Only when all three gates pass is a correctness claim accepted into the platform's knowledge base.

### Correctness Contract Pattern

The platform uses a contract pattern for critical modules where correctness must be guaranteed:

```elixir
defmodule Prismatic.Contract do
  @moduledoc """
  Macro-based contract enforcement for functional correctness.
  Defines preconditions, postconditions, and invariants.
  """

  defmacro contract(function_name, opts) do
    pre = Keyword.get(opts, :pre, true)
    post = Keyword.get(opts, :post, fn _result -> true end)

    quote do
      def unquote(function_name)(args) do
        unless unquote(pre).(args) do
          raise Prismatic.Contract.PreconditionError,
            function: unquote(function_name),
            args: args
        end

        result = do_execute(unquote(function_name), args)

        unless unquote(post).(result) do
          raise Prismatic.Contract.PostconditionError,
            function: unquote(function_name),
            result: result
        end

        result
      end
    end
  end
end
```

## Comparison with Related Approaches

| Approach | Scope | Strength | Limitation |
|----------|-------|----------|------------|
| **Unit Testing** | Individual functions | Easy to write, fast feedback | Only tests specific cases |
| **Integration Testing** | Module boundaries | Tests real interactions | Combinatorial explosion |
| **Property-Based Testing** | Behavioral invariants | Covers input domain broadly | Requires identifying properties |
| **Static Type Analysis** | Type contracts | Catches errors at compile time | Cannot verify semantic correctness |
| **Formal Verification** | Mathematical proof | Complete correctness guarantee | Expensive, limited scalability |
| **Prismatic Approach** | All of the above | Layered defense in depth | Requires discipline and tooling |

### Functional Correctness vs. Non-Functional Correctness

Functional correctness addresses *what* the system computes. Non-functional properties address *how* it computes:

- **Performance**: A functionally correct sorting algorithm that takes O(n!) time is correct but unusable
- **Reliability**: A correct function that crashes under load is correct but unreliable
- **Security**: A correct function that leaks data is correct but unsafe

The Prismatic Platform treats functional correctness as the foundation upon which all other quality attributes are built. A system that produces wrong answers fast is worse than one that produces right answers slowly.

## Best Practices

### 1. Specification Before Implementation

Write the `@spec` and `@doc` before writing the function body. This forces you to think about the contract before the implementation, reducing the likelihood of specification drift.

### 2. Guard Clauses as Preconditions

Use Elixir's guard clauses to enforce preconditions at the function head level. This makes preconditions visible, testable, and enforceable:

```elixir
def divide(a, b) when is_number(a) and is_number(b) and b != 0 do
  {:ok, a / b}
end

def divide(_a, 0), do: {:error, :division_by_zero}
def divide(_a, _b), do: {:error, :invalid_arguments}
```

### 3. Pattern Matching for Exhaustive Handling

Leverage Elixir's pattern matching to ensure all cases are handled. Unmatched patterns cause a `FunctionClauseError`, which is preferable to silently producing incorrect results.

### 4. Tagged Return Tuples

Always return `{:ok, result}` or `{:error, reason}` from functions that can fail. This forces callers to handle both outcomes explicitly, preventing silent correctness violations.

### 5. Regression Tests for Every Bug

The Prismatic Platform mandates that every bug fix includes a regression test that fails before the fix and passes after. This prevents correctness regressions from recurring.

### 6. Continuous Verification

Run the full quality pipeline on every commit, not just before releases. Correctness violations caught early are orders of magnitude cheaper to fix than those caught in production.

## Common Pitfalls

### Silent Failures

The most dangerous correctness violation is one that produces plausible but wrong output without any error or warning. Common causes include:

- Integer overflow wrapping silently
- Floating-point precision loss in financial calculations
- Off-by-one errors in boundary conditions
- Implicit type coercion producing unexpected values

### Specification Drift

When the specification changes but the tests do not, or vice versa, the system may appear correct against outdated criteria while actually violating the current specification. The Prismatic approach of co-locating specs, docs, and tests mitigates this risk.

### Partial Correctness Assumptions

Assuming that a function is correct because it works for tested inputs ignores the vast space of untested inputs. Property-based testing addresses this by generating inputs from the full domain, but developers must identify the right properties to test.

### Mocking-Induced Blindness

Over-mocking in tests can hide correctness issues at integration boundaries. The Prismatic Platform forbids mocks in production code entirely and limits them in test code to external service boundaries only.

### Ignoring Error Returns

Pattern matching on only the happy path (`{:ok, result}`) while ignoring or discarding error tuples is a common source of correctness violations. Dialyzer and Credo checks help catch these, but developer discipline remains essential.

## Use Cases

### Financial Calculations

Financial software demands absolute functional correctness. A rounding error in currency conversion can cascade into material discrepancies. The Prismatic Platform uses Decimal arithmetic with explicit precision control for all financial operations, verified by property-based tests that check against known mathematical identities.

### Security Rating Computation

The Prismatic Perimeter EASM module computes security ratings (A-F grades with numeric scores 300-900) for organizations. A functionally incorrect rating could lead to wrong risk assessments. The scoring algorithms are verified through multiple independent implementations that must agree, with discrepancies triggering investigation.

### OSINT Data Correlation

When correlating intelligence from 120+ OSINT sources, functional correctness in entity resolution is critical. A false positive (incorrectly merging two distinct entities) or false negative (failing to link related records) can invalidate an entire investigation. The platform uses confidence-scored matching with explicit thresholds verified by property-based tests.

### Agent Orchestration

With 530+ AIAD agents, the orchestration layer must correctly route tasks, aggregate results, and manage agent lifecycles. A correctness bug in the orchestrator can cascade to affect every agent in the system. The platform uses supervision trees with correctness monitors at each level.

### Compliance Assessment

NIS2 and ZKB compliance assessments must be functionally correct because incorrect assessments can expose organizations to regulatory penalties. The compliance engine is verified against published regulatory requirements with test cases derived directly from the legal text.

## Related Concepts

Functional correctness connects to numerous concepts across the Prismatic Platform:

- [Quality Gates](@/glossary/quality-gates.md) enforce correctness requirements at every stage of the development pipeline
- [Formal Verification](@/glossary/formal-verification.md) provides mathematical proof of correctness for critical algorithms
- [Property-Based Testing](@/glossary/property-based-testing.md) verifies behavioral invariants across entire input domains
- [Regression Testing](@/glossary/regression-testing.md) prevents previously fixed correctness bugs from recurring
- [Trinity Gate](@/glossary/trinity-gate.md) requires three independent verification channels for correctness claims
- [Typespec](@/glossary/typespec.md) defines function contracts checked by Dialyzer at compile time
- [Dialyzer](@/glossary/dialyzer.md) performs static analysis to detect type-level correctness violations
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) is the doctrine that makes correctness non-negotiable
- [Quality DNA](@/glossary/quality-dna.md) tracks correctness metrics across sessions for continuous improvement
- [Test Coverage](@/glossary/test-coverage.md) measures how much of the codebase is exercised by correctness tests

## See Also

- [Credo](@/glossary/credo.md) -- static analysis tool that detects patterns known to cause correctness issues
- [ExUnit](@/glossary/exunit.md) -- Elixir's built-in test framework for verifying functional correctness
- [Error Handling](@/glossary/error-handling.md) -- patterns for graceful handling of correctness boundary violations
- [Static Analysis](@/glossary/static-analysis.md) -- automated detection of potential correctness defects
- [Clean Run](@/glossary/clean-run.md) -- the zero-warning policy that treats all warnings as potential correctness signals

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
