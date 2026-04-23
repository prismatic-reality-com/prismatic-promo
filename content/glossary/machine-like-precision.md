+++
title = "Machine-Like Precision"
weight = 50
[extra]
description = "An execution standard demanding exact, repeatable, error-free operations comparable to mechanical systems, serving as a core enforcement principle of the NO MERCY, NO DOUBTS doctrine."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "platform-philosophy"
related_concepts = ["no-mercy", "no-mercy-no-doubts", "zero-tolerance", "quality-standard", "clean-run", "decisive-action", "machine-readable"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 7
prerequisites = ["no-mercy-no-doubts", "quality-gates", "clean-run"]
learning_path = ["quality-gates", "clean-run", "zero-tolerance", "machine-like-precision", "no-mercy-no-doubts"]
interactive_demos = ["/labs/glossary/machine-like-precision"]
code_examples = ["PrecisionEnforcer GenServer", "DeterministicExecution pipeline", "InvariantChecker behaviour"]
external_resources = ["https://en.wikipedia.org/wiki/Deterministic_system", "https://en.wikipedia.org/wiki/Formal_verification"]
version_introduced = "gen-5"
stability_level = "stable"
testing_scenarios = ["deterministic output verification", "idempotent operation validation", "invariant preservation under load", "precision degradation detection", "zero-tolerance enforcement"]
keywords = ["precision", "determinism", "repeatable", "error-free", "mechanical", "zero-tolerance", "exact", "invariant", "NM/ND", "enforcement"]
tags = ["glossary", "core", "philosophy", "quality", "doctrine", "enforcement"]
related_terms = ["no-mercy", "no-mercy-no-doubts", "zero-tolerance", "quality-standard", "clean-run", "decisive-action", "zero-tolerance-quality", "zero-compromise-quality", "technical-perfection", "determinism"]
word_count = 1948
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Machine-Like Precision - Prismatic Platform"
+++

## Definition

Machine-like precision is an execution standard that demands every operation in a software system be exact, repeatable, and error-free, achieving the reliability and predictability of a mechanical system. In the context of the Prismatic Platform, it is not an aspirational goal but an enforced invariant -- the system's [quality gates](/glossary/quality-gates/), [pre-commit hooks](/glossary/pre-commit-hooks/), and automated enforcement mechanisms reject any output that deviates from this standard.

The term "machine-like" is deliberate. Machines do not produce "almost correct" output. A CNC mill cuts to the specified tolerance or the part is rejected. A compiler either produces valid bytecode or reports an error. There is no "close enough" in mechanical systems. Machine-like precision applies this same intolerance for approximation to software development: zero warnings, zero violations, zero regressions, zero excuses.

This principle directly implements the NO MERCY aspect of the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. NO MERCY means no tolerance for incomplete implementations, no quality violations, no untested code. Machine-like precision is how NO MERCY manifests in daily operations -- every compilation, every test run, every quality check must produce a [clean run](/glossary/clean-run/) or the work is rejected.

## Overview

Software development culture traditionally tolerates imprecision. Warnings are ignored because they are "just warnings." Tests are skipped because they are "flaky." Code review comments are deferred because the deadline is approaching. Technical debt accumulates because "we will fix it later." Each tolerance individually seems harmless; collectively, they compound into systems that are unpredictable, fragile, and expensive to maintain.

Machine-like precision rejects this culture entirely. It holds that every warning is a defect. Every skipped test is a lie about coverage. Every deferred fix is a regression waiting to happen. The cost of enforcing precision on every operation is vastly lower than the cost of debugging imprecise systems in production.

The Prismatic Platform enforces machine-like precision across 13 quality domains, each monitored continuously. The enforcement is not advisory -- it is blocking. Code that produces warnings does not compile. Tests that are skipped do not count toward coverage. Commits that introduce violations do not pass the pre-commit hook. There is no override flag, no escape hatch, no "just this once."

### The Precision Spectrum

Different systems operate at different precision levels. Machine-like precision occupies the highest tier:

| Level | Description | Error Rate | Example |
|-------|-------------|------------|---------|
| **Casual** | Best effort, errors expected | 10^-1 (10%) | Prototype code, scripts |
| **Professional** | Quality-checked, some tolerance | 10^-2 (1%) | Production web applications |
| **Engineering** | Tested and validated rigorously | 10^-3 (0.1%) | Financial systems, databases |
| **Mechanical** | Zero-tolerance, deterministic | 10^-6 (0.0001%) | Avionics, medical devices |
| **Machine-like** | Provably correct, formally verified | 0 (zero defects) | Prismatic Platform target |

The distinction between "mechanical" and "machine-like" in software is important. Physical machines achieve precision through tight manufacturing tolerances. Software achieves precision through formal methods, exhaustive testing, type systems, and static analysis. The Prismatic Platform combines all four: [Dialyzer](/glossary/dialyzer/) for type checking, [ExUnit](/glossary/exunit/) for testing, [Credo](/glossary/credo/) for static analysis, and the [Trinity Gate](/glossary/trinity-gate/) for formal verification.

## Technical Details

### Deterministic Execution

Machine-like precision requires deterministic execution: given the same inputs, the system must always produce the same outputs. Non-determinism is the enemy of precision because it makes failures intermittent, debugging difficult, and testing unreliable.

Sources of non-determinism in Elixir/OTP systems and their mitigations:

| Source | Problem | Mitigation |
|--------|---------|------------|
| **Process scheduling** | Message order between processes is non-deterministic | Design for message-order independence; use `GenServer.call/3` for synchronous operations where ordering matters |
| **System time** | `DateTime.utc_now()` returns different values each call | Inject time as a dependency; use monotonic time for ordering |
| **Random generation** | `:rand.uniform()` produces different values | Seed RNG explicitly in tests; isolate randomness behind behaviours |
| **Network I/O** | External services respond differently each time | Circuit breakers, retries with jitter, deterministic fallbacks |
| **File system** | File modification times, directory ordering | Explicit sorting; canonical path resolution |
| **Concurrent state** | ETS/GenServer state depends on timing | Strict message protocols; test with deterministic schedulers |

```elixir
defmodule PrismaticPrecision.DeterministicExecution do
  @moduledoc """
  Utilities for ensuring deterministic execution in precision-critical contexts.
  Provides injectable dependencies for non-deterministic operations.
  """

  @type clock :: (-> DateTime.t())
  @type id_generator :: (-> String.t())

  @spec with_deterministic_context(keyword(), (-> result)) :: result when result: term()
  def with_deterministic_context(overrides, fun) do
    clock = Keyword.get(overrides, :clock, &DateTime.utc_now/0)
    id_gen = Keyword.get(overrides, :id_generator, &generate_id/0)

    Process.put(:prismatic_clock, clock)
    Process.put(:prismatic_id_generator, id_gen)

    try do
      fun.()
    after
      Process.delete(:prismatic_clock)
      Process.delete(:prismatic_id_generator)
    end
  end

  @spec now() :: DateTime.t()
  def now do
    case Process.get(:prismatic_clock) do
      nil -> DateTime.utc_now()
      clock -> clock.()
    end
  end

  @spec generate_unique_id() :: String.t()
  def generate_unique_id do
    case Process.get(:prismatic_id_generator) do
      nil -> generate_id()
      gen -> gen.()
    end
  end

  @spec generate_id() :: String.t()
  defp generate_id do
    Base.encode16(:crypto.strong_rand_bytes(16), case: :lower)
  end
end
```

### Invariant Enforcement

An invariant is a condition that must always be true. Machine-like precision demands that invariants are not merely documented but actively enforced through runtime checks, compile-time analysis, and pre-commit validation.

```elixir
defmodule PrismaticPrecision.InvariantChecker do
  @moduledoc """
  Enforces platform invariants at compile time and runtime.
  Invariant violations trigger immediate rejection.
  """

  @callback invariants() :: [{atom(), (term() -> boolean())}]
  @callback on_violation(atom(), term()) :: :halt | :warn

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticPrecision.InvariantChecker

      @spec check_invariants(term()) :: :ok | {:error, [{atom(), term()}]}
      def check_invariants(state) do
        violations =
          invariants()
          |> Enum.reject(fn {_name, check} -> check.(state) end)
          |> Enum.map(fn {name, _check} -> {name, state} end)

        case violations do
          [] ->
            :ok

          failed ->
            Enum.each(failed, fn {name, val} ->
              :telemetry.execute(
                [:prismatic, :precision, :invariant_violation],
                %{count: 1},
                %{invariant: name, module: __MODULE__}
              )

              on_violation(name, val)
            end)

            {:error, failed}
        end
      end
    end
  end
end
```

### Precision Metrics

The platform tracks precision metrics across all operations to detect degradation before it reaches production:

```elixir
defmodule PrismaticPrecision.Metrics do
  @moduledoc """
  Collects and reports precision metrics across the platform.
  Tracks determinism, consistency, and error rates.
  """

  @type precision_report :: %{
          compilation_warnings: non_neg_integer(),
          credo_violations: non_neg_integer(),
          dialyzer_errors: non_neg_integer(),
          test_failures: non_neg_integer(),
          flaky_test_count: non_neg_integer(),
          coverage_percentage: float(),
          typespec_coverage: float(),
          impl_coverage: float(),
          quality_score: non_neg_integer(),
          precision_grade: :perfect | :acceptable | :degraded | :failing
        }

  @spec generate_report() :: {:ok, precision_report()}
  def generate_report do
    report = %{
      compilation_warnings: count_metric(:compilation_warnings),
      credo_violations: count_metric(:credo_violations),
      dialyzer_errors: count_metric(:dialyzer_errors),
      test_failures: count_metric(:test_failures),
      flaky_test_count: count_metric(:flaky_tests),
      coverage_percentage: get_metric(:coverage_percentage),
      typespec_coverage: get_metric(:typespec_coverage),
      impl_coverage: get_metric(:impl_coverage),
      quality_score: get_metric(:quality_score),
      precision_grade: :perfect
    }

    graded = %{report | precision_grade: calculate_grade(report)}

    emit_telemetry(:precision_report, graded)
    {:ok, graded}
  end

  @spec calculate_grade(precision_report()) :: :perfect | :acceptable | :degraded | :failing
  defp calculate_grade(report) do
    zero_tolerance_clean =
      report.compilation_warnings == 0 and
      report.credo_violations == 0 and
      report.dialyzer_errors == 0 and
      report.test_failures == 0

    cond do
      zero_tolerance_clean and report.quality_score == 100 -> :perfect
      zero_tolerance_clean -> :acceptable
      report.quality_score >= 95 -> :degraded
      true -> :failing
    end
  end

  @spec count_metric(atom()) :: non_neg_integer()
  defp count_metric(metric) do
    case :persistent_term.get({:prismatic_precision, metric}, nil) do
      nil -> 0
      count when is_integer(count) -> count
    end
  end

  @spec get_metric(atom()) :: number()
  defp get_metric(metric) do
    :persistent_term.get({:prismatic_precision, metric}, 0)
  end

  defp emit_telemetry(event, report) do
    :telemetry.execute(
      [:prismatic, :precision, event],
      %{quality_score: report.quality_score},
      %{grade: report.precision_grade}
    )
  end
end
```

## Implementation in Prismatic Platform

### 11-Phase Pre-Commit Enforcement

Machine-like precision is enforced at the commit boundary through an 11-phase pre-commit hook. Each phase represents a non-negotiable quality check. If any phase fails, the commit is rejected.

| Phase | Check | Tolerance |
|-------|-------|-----------|
| 1 | File permissions and line endings | Zero violations |
| 2 | Compilation with `--warnings-as-errors` | Zero warnings |
| 3 | Credo strict mode | Zero violations |
| 4 | Dialyzer type checking | Zero errors |
| 5 | Test execution | 100% pass rate |
| 6 | Forbidden pattern detection | Zero matches in lib/ |
| 7 | TODO management | Zero untracked TODOs |
| 8 | Template validation | Zero invalid templates |
| 9 | Security scan | Zero critical/high issues |
| 10 | Design consistency | Zero violations |
| 11 | Quality gates composite | 100/100 score |

### Zero-Warning Compilation

The `--warnings-as-errors` flag transforms the Elixir compiler from advisory to enforcement mode. Every warning -- unused variables, deprecated function calls, missing pattern matches, unreachable code -- becomes a compilation failure. This single flag eliminates an entire category of precision degradation.

```
mix compile --warnings-as-errors --force
```

The `--force` flag ensures full recompilation, preventing stale BEAM files from masking new warnings. In CI/CD pipelines, this is mandatory on every run.

### Typespec and Dialyzer Integration

[Typespecs](/glossary/typespec/) declare the contract for every public function: what types it accepts and what types it returns. [Dialyzer](/glossary/dialyzer/) statically analyzes the codebase against these contracts, detecting type mismatches, unreachable code, and pattern match failures at compile time rather than runtime.

The combination provides a form of mechanical verification: if the code compiles and Dialyzer passes, certain classes of runtime errors are provably impossible. This is machine-like precision applied to type safety.

### Quality Score System

The platform's 100-point quality score aggregates 13 quality domains into a single precision metric. The current score is 100/100 (PERFECT), meaning all domains are at full compliance. The score is not a percentage of tests passing -- it is a composite evaluation of compilation cleanliness, type safety, code style, test coverage, documentation coverage, performance characteristics, and security posture.

## Comparison with Alternatives

### Machine-Like Precision vs. "Good Enough"

| Dimension | Machine-Like Precision | Good Enough |
|-----------|----------------------|-------------|
| **Warning tolerance** | Zero | Non-critical warnings acceptable |
| **Test coverage** | 100% on business logic | 80% target |
| **Enforcement** | Automated, blocking | Manual review, advisory |
| **Technical debt** | Zero tolerance | Tracked and managed |
| **Cost (short-term)** | Higher (more rigorous) | Lower (faster delivery) |
| **Cost (long-term)** | Lower (fewer bugs, easier maintenance) | Higher (debt compounds) |
| **Suitable for** | Platforms, infrastructure, security | Startups, prototypes, experiments |

### Machine-Like Precision vs. Formal Verification

Formal verification (model checking, theorem proving, proof assistants like [Lean4](/glossary/lean4/)) provides mathematical certainty about program properties. Machine-like precision is a practical approximation of formal verification using industrial tools (type checkers, static analyzers, property-based testing). The Prismatic Platform uses both: the [Trinity Gate](/glossary/trinity-gate/) includes a formal verification layer (Lean4 proofs) for critical invariants, while Dialyzer and Credo provide broader but less rigorous coverage across the entire codebase.

| Aspect | Formal Verification | Machine-Like Precision |
|--------|--------------------|-----------------------|
| **Guarantee** | Mathematical proof | Empirical confidence + static analysis |
| **Coverage** | Specific properties | Entire codebase |
| **Cost** | Very high (expert-dependent) | High (tooling-dependent) |
| **Scalability** | Limited by proof complexity | Scales with automation |
| **False positives** | None (proofs are exact) | Rare but possible |

### Machine-Like Precision vs. Test-Driven Development

TDD ensures that code meets its specifications (tests pass). Machine-like precision ensures that the code, its type contracts, its style, its documentation, its performance characteristics, and its security posture all meet platform standards simultaneously. TDD is a subset of machine-like precision -- necessary but not sufficient.

## Best Practices

**Enforce at the boundary, not in the mind**. Relying on developers to remember quality standards is imprecise by definition. Automated enforcement (pre-commit hooks, CI gates, compiler flags) is the only reliable mechanism. The Prismatic Platform's 11-phase pre-commit hook enforces precision without human memory or discipline.

**Make the precise path the easy path**. If doing the right thing requires extra effort, people will cut corners. Code formatters, auto-fix tools, and clear error messages reduce the friction of precision. `mix format` automatically fixes formatting; `mix credo --strict` identifies issues with specific remediation guidance.

**Track precision metrics over time**. A quality score of 100/100 today means nothing if it was 98/100 yesterday and you do not know why. Track all precision metrics in [quality DNA](/glossary/quality-dna/), visualize trends, and investigate any degradation immediately.

**Reject "temporary" precision compromises**. There is no such thing as a temporary warning, a temporary test skip, or a temporary quality violation. "Temporary" imprecision becomes permanent imprecision the moment attention moves to the next task. The NO MERCY doctrine exists precisely to prevent this rationalization.

**Use types as documentation and enforcement simultaneously**. `@spec` declarations in Elixir serve three purposes: they document the function's contract, they enable Dialyzer to detect violations, and they communicate intent to other developers. A function without a typespec is a function without a verified contract.

## Common Pitfalls

**Confusing rigidity with precision**. Precision means exact, correct output. Rigidity means refusing to change. A precise system adapts to new requirements with the same exactness it applies to existing ones. The Prismatic Platform's [continuous evolution](/glossary/continuous-evolution/) demonstrates this: 19 generations of change, each executed with machine-like precision.

**Applying precision to the wrong dimension**. Pixel-perfect UI layouts are not machine-like precision. Correct business logic with provable type safety is. Focus precision enforcement on dimensions where correctness matters -- data transformations, security boundaries, API contracts, state transitions.

**Using precision as a justification for slow delivery**. Machine-like precision should not make delivery slower. Automation (formatters, linters, type checkers, pre-commit hooks) absorbs the precision cost. If precision is slowing you down, the automation is insufficient, not the standard.

**Assuming precision is achieved once and maintained automatically**. Precision requires constant vigilance. New dependencies introduce new warning sources. New patterns create new anti-pattern risks. The [Quality Floor Guardian](/glossary/quality-floor-guardian/) continuously monitors for precision degradation, but the monitoring itself must be maintained and updated.

**Equating test count with precision**. A thousand tests that all check happy paths provide less precision than fifty tests that cover edge cases, error conditions, and invariant boundaries. Quality of tests matters more than quantity. [Property-based testing](/glossary/property-based-testing/) generates thousands of inputs automatically, providing more precision per test than hand-written example-based tests.

## Use Cases

### Zero-Warning Compilation Enforcement

Every compilation in the Prismatic Platform runs with `--warnings-as-errors`. This catches unused imports, deprecated function calls, missing function clauses, unreachable code, and unmatched return values at compile time. The result: zero runtime surprises from ignored warnings.

### Pre-Commit Quality Gates

The 11-phase pre-commit hook applies machine-like precision to every commit attempt. A developer who introduces a single Credo violation, a single compilation warning, or a single failing test receives immediate, specific feedback and the commit is blocked until the issue is resolved.

### API Contract Enforcement

The [Prismatic API](/glossary/prismatic-api/) uses [OpenApiSpex](/glossary/openapi/) to enforce exact request/response schemas. Every API endpoint has a machine-verified contract. Requests that do not match the schema are rejected with precise error descriptions. Responses that do not match the schema cause test failures in CI.

### Security Posture Verification

The [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM system applies machine-like precision to security assessment. Security ratings are computed from discrete evidence points, not subjective judgment. Each finding is classified, scored, and tracked with full provenance. The [Trinity Gate](/glossary/trinity-gate/) ensures that security claims pass structural, logical, and formal verification.

## Related Concepts

- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- The doctrine that machine-like precision implements
- [No Mercy](/glossary/no-mercy/) -- Zero tolerance for incomplete or imprecise work
- [Zero Tolerance](/glossary/zero-tolerance/) -- The enforcement philosophy that rejects any deviation from standards
- [Clean Run](/glossary/clean-run/) -- A compilation or test run with zero warnings, zero errors, zero violations
- [Decisive Action](/glossary/decisive-action/) -- The NO DOUBTS complement to machine-like precision
- [Quality Standard](/glossary/quality-standard/) -- The measurable benchmarks that define precision thresholds
- [Determinism](/glossary/determinism/) -- The property of producing identical outputs for identical inputs
- [Technical Perfection](/glossary/technical-perfection/) -- The aspiration that machine-like precision operationalizes
- [Formal Verification](/glossary/formal-verification/) -- Mathematical proofs of program correctness
- [Trinity Gate](/glossary/trinity-gate/) -- The 3-layer verification system ensuring claims are provably correct
- [Quality Gates](/glossary/quality-gates/) -- Automated checkpoints enforcing precision at commit boundaries
- [Dialyzer](/glossary/dialyzer/) -- Static type analysis providing machine-verified type contracts

## See Also

- [Architecture](/architecture/) -- Platform architecture designed for machine-like precision
- [Capabilities](/capabilities/) -- Quality capabilities enforcing precision across domains
- Glossary Index -- Full glossary of platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
