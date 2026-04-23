+++
title = "Killed/Survived"
weight = 50
[extra]
description = "In mutation testing, Killed means a test suite detected and failed on a code mutant, while Survived means the mutant escaped detection -- indicating a gap in test coverage or assertion strength. The ratio produces the mutation score, the most rigorous metric of test suite effectiveness."
category = "quality"
domain = "testing"
complexity = "intermediate"
stability = "stable"
related_terms = ["mutation-testing", "mutation-score", "mutant", "mutation", "property-test", "quality-floor", "code-coverage", "test-suite", "exunit", "streamdata", "assertion", "regression", "quality-debt"]
tags = ["glossary", "mutation-testing", "killed", "survived", "test-quality", "coverage", "quality-assurance", "test-effectiveness", "assertion-strength"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
beam_related = true
key_takeaway = "A killed mutant proves test effectiveness while a survived mutant reveals gaps in test coverage or assertion precision that require remediation -- the mutation score derived from this ratio is more rigorous than code coverage."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["killed mutant", "survived mutant", "mutation testing", "test effectiveness", "test quality", "mutant detection", "assertion strength", "mutation score", "code coverage", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Killed/Survived - Prismatic Platform"
word_count = 3600
see_also = ["capabilities", "quality-floor", "mutation-testing"]
+++

## Definition

In [mutation testing](/glossary/mutation-testing/), every syntactic change (mutant) introduced into source code is classified as either **killed** or **survived** after the test suite executes against it. A **killed** mutant is one where at least one test failed -- proving that the test suite detected the defect introduced by the mutation. A **survived** mutant is one where all tests still passed despite the code change -- indicating that no test validates the behavior altered by the mutation. The ratio of killed to total mutants produces the [mutation score](/glossary/mutation-score/), a precise metric of test suite effectiveness that goes beyond simple [code coverage](/glossary/code-coverage/).

The killed/survived classification is binary and unambiguous: either the test suite rejects the mutant or it does not. This binary nature makes mutation testing a more rigorous quality metric than line or branch coverage, which can show 100% even when tests make no meaningful assertions. A test that exercises a code path without asserting anything useful produces high coverage but zero mutation kills.

Consider this critical distinction: **code coverage measures what code your tests execute; mutation score measures what code your tests actually verify**. The gap between these two metrics reveals "phantom coverage" -- code that appears tested but is not meaningfully validated.

## Core Concepts

### Mutant Classification States

Every mutant passes through a classification pipeline:

| State | Definition | Meaning | Action Required |
|-------|-----------|---------|-----------------|
| **Killed** | At least one test failed | Test suite detected the defect | None -- test is effective |
| **Survived** | All tests passed | No test validates this behavior | Write targeted test |
| **Equivalent** | Mutation produces identical behavior | Cannot be killed (semantic no-op) | Mark as equivalent |
| **Timeout** | Test suite exceeded time limit | Mutation may cause infinite loop | Investigate for boundary mutation |
| **Error** | Compilation failed | Mutation produced invalid code | Excluded from score |
| **No Coverage** | No test covers mutated line | Untested code entirely | Write tests for this code path |

### Mutation Operators and Kill Patterns

Different mutation operators target different classes of programming errors. Understanding which operators produce survived mutants reveals specific testing gaps:

| Operator | Mutation | Example | Killed By |
|----------|----------|---------|-----------|
| **Arithmetic** | `+` -> `-` | `a + b` -> `a - b` | Assertions on computed values |
| **Relational** | `>` -> `>=` | `x > 0` -> `x >= 0` | Boundary value tests |
| **Logical** | `&&` -> `\|\|` | `a && b` -> `a \|\| b` | Multi-condition tests |
| **Negation** | `!` insertion | `flag` -> `!flag` | Boolean result assertions |
| **Return Value** | Replace return | `{:ok, val}` -> `{:error, val}` | Pattern matching on return |
| **Constant** | Change literal | `0` -> `1` | Specific value assertions |
| **Deletion** | Remove statement | `Logger.info(...)` -> (removed) | Side-effect verification |
| **Conditional** | Remove condition | `if cond, do: x` -> `x` | Branch-specific tests |

### Why Survived Mutants Matter

A survived mutant is not just a metric -- it is a concrete, reproducible demonstration of a test gap:

```elixir
# Original code
def calculate_fee(amount) when amount > 1000, do: amount * 0.02
def calculate_fee(amount), do: amount * 0.05

# Mutant: boundary change (> to >=)
def calculate_fee(amount) when amount >= 1000, do: amount * 0.02  # SURVIVED!
def calculate_fee(amount), do: amount * 0.05

# The survival reveals: no test checks calculate_fee(1000)
# This is a real bug risk -- at exactly 1000, the fee could be wrong
```

The survived mutant at `amount >= 1000` tells you exactly what test to write:

```elixir
test "fee boundary at exactly 1000" do
  # This test kills the survived mutant
  assert calculate_fee(1000) == 1000 * 0.05  # Below threshold, 5% fee
  assert calculate_fee(1001) == 1001 * 0.02  # Above threshold, 2% fee
end
```

### Equivalent Mutants

Equivalent mutants present a theoretical challenge: some mutations produce semantically identical code that cannot be killed because the behavior is unchanged:

```elixir
# Original
def clamp(x) when x > 100, do: 100
def clamp(x) when x < 0, do: 0
def clamp(x), do: x

# Equivalent mutant (same behavior for all inputs)
def clamp(x) when x >= 101, do: 100  # Equivalent: integers only, > 100 == >= 101
```

Equivalent mutants inflate the denominator of the mutation score without being killable. Production mutation testing tools handle this through:

- **Heuristic detection** -- recognizing common equivalence patterns
- **Timeout detection** -- infinite loops from boundary mutations indicate non-equivalence
- **Statistical filtering** -- flagging mutants no test can kill across multiple runs
- **Human review** -- marking confirmed equivalents in the mutation report

In the BEAM ecosystem, immutable data structures and pattern matching make certain mutation categories more detectable than in imperative languages -- a mutated pattern match typically causes immediate `FunctionClauseError` failures, which are easy to test for.

## Technical Deep Dive

### Computational Cost

The computational cost of mutation testing is significant. For N mutants and a test suite of duration T, naive execution costs O(N * T). A codebase with 1000 mutable points and a 60-second test suite would take ~17 hours for full mutation analysis.

Optimization strategies reduce this dramatically:

| Strategy | Speedup | How It Works |
|----------|---------|--------------|
| **Coverage-based filtering** | 3-10x | Only run tests that cover the mutated line |
| **Mutant schemata** | 2-5x | Compile all mutants into one binary with runtime switches |
| **Parallel execution** | Nx | Run mutants across BEAM processes or machines |
| **Incremental analysis** | 10-100x | Only analyze mutants in changed files |
| **Sampling** | 2-5x | Analyze random subset of mutants for estimation |

```elixir
defmodule PrismaticQuality.MutationRunner do
  @moduledoc """
  Parallel mutation test runner leveraging BEAM concurrency.
  Distributes mutant evaluation across available schedulers.
  """

  @spec run_parallel(list(map()), module(), non_neg_integer()) :: list(map())
  def run_parallel(mutants, test_module, concurrency \\ System.schedulers_online()) do
    mutants
    |> Task.async_stream(
      fn mutant -> evaluate_mutant(mutant, test_module) end,
      max_concurrency: concurrency,
      timeout: :timer.seconds(30),
      on_timeout: :kill_task
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, :timeout} -> %{status: :timeout}
    end)
  end

  defp evaluate_mutant(mutant, test_module) do
    # Apply mutation, run relevant tests, classify result
    %{
      mutant: mutant,
      status: classify_result(mutant, test_module),
      duration_ms: 0
    }
  end

  defp classify_result(_mutant, _test_module), do: :killed
end
```

### Pattern Matching as Mutation Defense

Elixir's pattern matching is uniquely effective at killing mutants because it enforces structural contracts at every function boundary:

```elixir
# Pattern matching kills mutations automatically
def process_result({:ok, %{score: score}}) when is_float(score) and score >= 0.0 do
  # Mutations to the caller's return value are caught by pattern match
  # Mutations to score type are caught by the guard
  # Mutations to score range are caught by >= 0.0 guard
  {:processed, score}
end

def process_result({:error, reason}) do
  # Mutation of :ok to :error is caught by the separate head
  {:failed, reason}
end

# This function is highly mutation-resistant because:
# 1. Two function heads catch tag mutations (:ok/:error)
# 2. Map pattern catches missing/renamed keys
# 3. Guard catches type mutations (is_float)
# 4. Guard catches boundary mutations (>= 0.0)
```

Compare with a less mutation-resistant style:

```elixir
# Weakly mutation-resistant -- survived mutants likely
def process_result(result) do
  if result[:status] == :ok do
    {:processed, result[:score]}
  else
    {:failed, result[:reason]}
  end
end

# Mutations that SURVIVE:
# - result[:status] == :ok -> result[:status] != :ok (if no error path test)
# - result[:score] -> result[:other_key] (no structural validation)
# - No type checking on score value
```

### Mutation Score vs. Code Coverage Comparison

| Metric | What It Measures | 100% Means | Achievable | False Sense of Security |
|--------|------------------|------------|------------|-------------------------|
| **Line Coverage** | Lines executed by tests | All lines run at least once | Easy | High -- running != verifying |
| **Branch Coverage** | Decision branches taken | All if/else paths taken | Medium | Medium -- paths taken != validated |
| **Mutation Score** | Defects detected by tests | All mutations caught | Hard | Low -- proves test effectiveness |

Real-world example:

```elixir
# This test achieves 100% line AND branch coverage of calculate_fee/1
test "calculate_fee works" do
  result = calculate_fee(500)
  assert is_number(result)  # Weak assertion -- just checks type
end

# Line coverage: 100% (both clauses executed)
# Branch coverage: 100% (both paths taken if we add amount > 1000 test)
# Mutation score: ~20% (most mutants survive because assertion is too weak)
```

## Usage in Prismatic Platform

### Quality DNA Integration

The Prismatic Platform's NO MERCY doctrine demands 100% test coverage, but goes further by tracking mutation scores through [Quality DNA](/glossary/quality-debt/). The [Quality Floor Guardian](/glossary/quality-floor/) monitors killed/survived ratios across all umbrella apps:

```elixir
defmodule PrismaticQuality.MutationTracker do
  @moduledoc """
  Tracks mutation scores per module and domain over time.
  Integrates with Quality DNA for trend analysis and floor enforcement.
  """

  @type mutation_report :: %{
    module: module(),
    total_mutants: non_neg_integer(),
    killed: non_neg_integer(),
    survived: non_neg_integer(),
    equivalent: non_neg_integer(),
    timeout: non_neg_integer(),
    mutation_score: float(),
    survived_details: list(survived_detail())
  }

  @type survived_detail :: %{
    line: pos_integer(),
    operator: atom(),
    original: String.t(),
    mutated: String.t(),
    risk_level: :critical | :high | :medium | :low
  }

  @spec calculate_score(mutation_report()) :: float()
  def calculate_score(%{total_mutants: 0}), do: 1.0

  def calculate_score(report) do
    killable = report.total_mutants - report.equivalent
    if killable == 0, do: 1.0, else: report.killed / killable
  end

  @spec risk_classify(survived_detail()) :: :critical | :high | :medium | :low
  def risk_classify(%{operator: :return_value}), do: :critical
  def risk_classify(%{operator: :conditional_boundary}), do: :high
  def risk_classify(%{operator: :arithmetic}), do: :medium
  def risk_classify(%{operator: :constant_replacement}), do: :medium
  def risk_classify(%{operator: :statement_deletion}), do: :low
  def risk_classify(_), do: :low
end
```

### Property-Based Testing as Mutation Killer

The platform's [property-based testing](/glossary/property-based-testing/) (using [StreamData](/glossary/streamdata/)) is particularly effective at killing mutants because property tests generate hundreds of random inputs that exercise boundary conditions -- exactly the conditions that mutation operators target:

```elixir
defmodule PrismaticTest.MutationKillerProperties do
  @moduledoc "Property-based tests designed for maximum mutation kill rate."

  use ExUnit.Case
  use ExUnitProperties

  # This property kills: arithmetic, boundary, negation, and constant mutations
  property "sort/1 preserves length and ordering invariant" do
    check all list <- list_of(integer()) do
      sorted = Enum.sort(list)
      assert length(sorted) == length(list)
      assert sorted == Enum.sort(sorted)  # Idempotent
      assert Enum.zip(sorted, tl(sorted)) |> Enum.all?(fn {a, b} -> a <= b end)
    end
  end

  # This property kills: return value, conditional, and deletion mutations
  property "confidence scoring produces valid range" do
    check all evidence <- list_of(float(min: 0.0, max: 1.0), min_length: 1) do
      score = PrismaticDd.ScoringEngine.aggregate_confidence(evidence)
      assert score >= 0.0
      assert score <= 1.0
      assert is_float(score)
    end
  end

  # This property kills: boundary and relational mutations
  property "fee calculation respects threshold boundary" do
    check all amount <- positive_integer() do
      fee = PrismaticBilling.calculate_fee(amount)
      assert fee > 0
      assert fee <= amount  # Fee never exceeds amount

      if amount > 1000 do
        assert_in_delta fee, amount * 0.02, 0.01
      else
        assert_in_delta fee, amount * 0.05, 0.01
      end
    end
  end
end
```

### Prioritizing Survived Mutant Remediation

Not all survived mutants carry equal risk. The platform prioritizes remediation based on:

| Priority | Criteria | Action |
|----------|----------|--------|
| **P0 Critical** | Security-relevant code (authentication, authorization, encryption) | Immediate -- block merge |
| **P1 High** | Financial calculations, DD scoring, confidence metrics | Same session -- write test before moving on |
| **P2 Medium** | Business logic, data transformation, validation | Next sprint -- track in Quality DNA |
| **P3 Low** | Logging, formatting, non-critical display logic | Backlog -- fix when touching the module |

```elixir
defmodule PrismaticQuality.SurvivedMutantPrioritizer do
  @moduledoc "Prioritizes survived mutants by business risk for remediation planning."

  @security_modules ~w(Auth Crypto Security Permission Guard)
  @financial_modules ~w(Billing Scoring Pricing Fee)
  @critical_modules ~w(DD Investigation Intelligence)

  @spec prioritize(map()) :: :p0_critical | :p1_high | :p2_medium | :p3_low
  def prioritize(%{module: module, operator: operator}) do
    module_name = to_string(module)

    cond do
      any_match?(module_name, @security_modules) -> :p0_critical
      any_match?(module_name, @financial_modules) -> :p1_high
      any_match?(module_name, @critical_modules) -> :p1_high
      operator in [:return_value, :conditional_boundary] -> :p2_medium
      true -> :p3_low
    end
  end

  defp any_match?(name, patterns) do
    Enum.any?(patterns, &String.contains?(name, &1))
  end
end
```

## Code Examples

### Complete Mutation Analysis Pipeline

```elixir
defmodule PrismaticQuality.MutationAnalyzer do
  @moduledoc """
  Analyzes mutation testing results and classifies mutant outcomes.
  Produces actionable reports for test improvement.

  ## Examples

      iex> results = [%{status: :killed}, %{status: :killed}, %{status: :survived}]
      iex> PrismaticQuality.MutationAnalyzer.mutation_score(results)
      0.667
  """

  @type mutant_status :: :killed | :survived | :equivalent | :timeout | :error
  @type analysis_result :: %{
    score: float(),
    killed: non_neg_integer(),
    survived: non_neg_integer(),
    equivalent: non_neg_integer(),
    grade: :excellent | :good | :acceptable | :poor,
    recommendations: list(String.t())
  }

  @spec analyze(list(%{status: mutant_status()})) :: analysis_result()
  def analyze(results) do
    counts = Enum.frequencies_by(results, & &1.status)
    killed = Map.get(counts, :killed, 0)
    survived = Map.get(counts, :survived, 0)
    equivalent = Map.get(counts, :equivalent, 0)
    killable = killed + survived

    score = if killable > 0, do: Float.round(killed / killable, 3), else: 1.0

    %{
      score: score,
      killed: killed,
      survived: survived,
      equivalent: equivalent,
      grade: grade(score),
      recommendations: recommendations(score, survived, results)
    }
  end

  @spec classify_mutant(map()) :: mutant_status()
  def classify_mutant(%{test_results: results, original_behavior: original}) do
    cond do
      any_test_failed?(results) -> :killed
      timed_out?(results) -> :timeout
      equivalent_behavior?(results, original) -> :equivalent
      true -> :survived
    end
  end

  @spec mutation_score(list(%{status: mutant_status()})) :: float()
  def mutation_score(statuses) do
    killable = Enum.count(statuses, &(&1.status in [:killed, :survived]))
    killed = Enum.count(statuses, &(&1.status == :killed))
    if killable > 0, do: Float.round(killed / killable, 3), else: 1.0
  end

  defp grade(score) when score >= 0.90, do: :excellent
  defp grade(score) when score >= 0.75, do: :good
  defp grade(score) when score >= 0.60, do: :acceptable
  defp grade(_), do: :poor

  defp recommendations(score, survived, _results) do
    recs = []
    recs = if score < 0.90, do: ["Add boundary value tests for survived mutants" | recs], else: recs
    recs = if survived > 10, do: ["Prioritize survived mutants in security-critical modules" | recs], else: recs
    recs = if score < 0.60, do: ["Consider property-based testing for broader coverage" | recs], else: recs
    Enum.reverse(recs)
  end

  defp any_test_failed?(results), do: Enum.any?(results, &(&1.status == :failed))
  defp timed_out?(results), do: Enum.any?(results, &(&1.status == :timeout))
  defp equivalent_behavior?(results, original), do: results == original
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Chasing 100% mutation score | Equivalent mutants make 100% impossible | Aim for 85%+ after excluding equivalents |
| Treating all survived mutants equally | Low-risk survived mutants waste effort | Prioritize by module criticality |
| Weak assertions inflate coverage | `assert is_map(result)` kills no mutations | Assert specific values and structures |
| Running mutation tests on entire codebase | Takes hours, results stale | Incremental analysis on changed files |
| Ignoring equivalent mutants | Falsely low mutation score | Mark confirmed equivalents explicitly |
| Not testing error paths | `:error` tuple mutations survive | Test both success and failure paths |

## Best Practices

1. **Prioritize killing survived mutants in business-critical modules first** -- not all survived mutants carry equal risk.
2. **Use [property-based testing](/glossary/property-based-testing/)** to achieve high kill rates with minimal test code.
3. **Track mutation scores per module over time** through Quality DNA to detect test quality regression.
4. **When a survived mutant is found, write a targeted test** that fails on the specific mutation before adding assertions.
5. **Never ignore survived mutants in security, financial, or OSINT data validation modules**.
6. **Automate mutation testing in CI/CD** with time-boxed execution to balance thoroughness with build speed.
7. **Use pattern matching liberally** -- Elixir's pattern matching is the most effective mutation defense.
8. **Assert specific values, not types** -- `assert score == 0.85` kills more mutants than `assert is_float(score)`.
9. **Test boundary conditions explicitly** -- boundary mutations are the most commonly survived.
10. **Combine with [code coverage](/glossary/code-coverage/)** -- coverage identifies untested code, mutation score identifies weakly tested code.

## Related Terms

- [Mutation Testing](/glossary/mutation-testing/) -- the testing methodology that produces killed/survived classifications
- [Mutation Score](/glossary/mutation-score/) -- the quantitative metric derived from killed/survived ratios
- [Mutant](/glossary/mutant/) -- the modified code variant being classified
- [Property-Based Testing](/glossary/property-based-testing/) -- testing approach highly effective at killing mutants
- [Quality Floor](/glossary/quality-floor/) -- minimum quality threshold enforced by mutation analysis
- [Code Coverage](/glossary/code-coverage/) -- complementary metric that mutation score surpasses
- [Test Suite](/glossary/test-suite/) -- the collection of tests whose effectiveness mutation testing measures
- [ExUnit](/glossary/exunit/) -- Elixir's test framework that executes against mutants
- [StreamData](/glossary/streamdata/) -- property-based testing library effective at killing boundary mutants
- [Quality Debt](/glossary/quality-debt/) -- accumulated test gaps revealed by survived mutants

## See Also

- [Capabilities](/capabilities/) -- platform quality capabilities including mutation analysis
- [Architecture](/architecture/) -- quality enforcement architecture
- [Testing Guide](/developers/) -- comprehensive testing strategy documentation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
