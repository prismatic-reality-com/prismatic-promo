+++
title = "Dialyzer"
weight = 55
[extra]
category = "quality"
description = "Erlang/Elixir type analysis via success typing for type safety verification"
related_terms = ["quality-gates", "credo", "zero-warning-policy", "behaviour", "typespec", "clean-run"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1737
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Dialyzer", "ErlangElixir", "glossary", "quality", "Prismatic Platform", "Erlang"]
tags = ["glossary", "quality", "dialyzer", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Dialyzer - Prismatic Platform"
+++

## Definition and Overview

Dialyzer (DIscrepancy AnalYZer for ERlang) is a static analysis tool for Erlang and Elixir that identifies type errors, unreachable code, redundant tests, and contract violations through an analysis technique called success typing. Unlike traditional type systems (such as those in Haskell, OCaml, or TypeScript) that require complete type annotations and reject programs that cannot be proven type-safe, Dialyzer takes the opposite approach: it infers types from code patterns and `@spec` annotations, reporting only definite type mismatches -- cases where a function call is guaranteed to fail at runtime. This design philosophy produces zero false positives in practice, meaning every warning Dialyzer reports represents a genuine bug.

The success typing approach was developed by Tobias Lindahl and Konstantinos Sagonas at Uppsala University and first released in 2005. Its core insight is that in a dynamically typed language, it is more useful to prove that code will definitely fail than to prove it will definitely succeed. Traditional type checkers reject programs that might fail; Dialyzer accepts programs that might succeed. This means Dialyzer never forces developers to add type annotations to make code compile -- it simply reports the bugs it can prove exist.

Dialyzer relies on Persistent Lookup Tables (PLTs) to cache type information across analysis runs. A PLT stores the inferred types for all modules in the Erlang standard library, the Elixir standard library, and the project's dependencies. Building the initial PLT is expensive (minutes to tens of minutes), but subsequent analyses are incremental, re-analyzing only changed modules. This caching mechanism makes Dialyzer practical for large codebases where full re-analysis on every change would be prohibitively slow.

## Technical Deep Dive

### Success Typing vs. Traditional Type Systems

Understanding the distinction between success typing and traditional type checking is essential for using Dialyzer effectively:

| Aspect | Traditional Type System | Dialyzer (Success Typing) |
|--------|------------------------|---------------------------|
| **Approach** | Proves code will succeed | Proves code will fail |
| **False positives** | Possible (rejects valid programs) | None (only definite failures) |
| **False negatives** | None (catches all type errors) | Possible (misses some errors) |
| **Annotation requirement** | Mandatory | Optional (improves analysis) |
| **Compilation impact** | Blocks compilation on errors | Advisory (warnings only) |
| **Developer burden** | Must satisfy the type checker | Must only fix real bugs |

This design makes Dialyzer uniquely suited to Elixir's ecosystem: it adds value without imposing the rigid constraints of a static type system, preserving Elixir's dynamic flexibility while catching real bugs.

### Type Inference Engine

Dialyzer's type inference builds a type lattice for every function in the codebase through a sophisticated multi-phase analysis process. The lattice represents type information as a directed acyclic graph where each node represents a type constraint and edges represent type dependencies between functions.

The inference engine tracks multiple type dimensions:

- **Input types**: What types each function parameter can accept, including union types and complex structures
- **Return types**: What types each function can return, considering all possible execution paths
- **Success types**: The narrowest types for which the function can succeed without guaranteed failure
- **Contract types**: Types declared via `@spec` annotations, treated as constraints to verify
- **Failure types**: Types that would cause guaranteed runtime crashes (e.g., calling `String.length/1` on an integer)
- **Guard types**: Type constraints enforced by guard clauses in function heads

The inference process operates in three major phases:

1. **Bottom-up analysis**: Starting from leaf functions (those with no dependencies), Dialyzer infers the most general success types by examining function bodies and patterns
2. **Top-down constraint propagation**: Using call sites and specifications, the engine propagates more specific type constraints downward
3. **Fixpoint iteration**: The engine iterates between phases until type information stabilizes (reaches a fixpoint)

When a `@spec` annotation declares a narrower type than the inferred success type, Dialyzer reports a contract violation. When a function call passes arguments outside the callee's success type, Dialyzer reports a type mismatch. The engine also detects more subtle issues like functions that can never return (infinite recursion) or code paths that are unreachable due to type constraints.

```elixir
# Dialyzer can detect this guaranteed runtime failure:
defmodule Example do
  @spec add(integer(), integer()) :: integer()
  def add(a, b), do: a + b

  def usage do
    # Dialyzer warns: "The call Example.add('hello', 'world')"
    # will never return since the success typing is
    # (integer(), integer()) -> integer()
    add("hello", "world")
  end
end
```

### PLT Management

Persistent Lookup Tables are the foundation of Dialyzer's performance model and represent one of its most innovative architectural features. PLTs are essentially compiled type databases that store the inferred success types for all functions in the analyzed codebase's dependencies.

```
PLT Build Process:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Erlang/OTP libs  │────>│ PLT Construction │────>│ priv/plts/       │
│ Elixir stdlib    │────>│ (Type inference   │────>│ dialyzer.plt     │
│ Hex dependencies │────>│  for all modules) │────>│ (~50-100 MB)     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                          |
                                                          v
                                                  ┌──────────────────┐
                                                  │ Incremental      │
                                                  │ Analysis         │
                                                  │ (changed modules │
                                                  │  only, seconds)  │
                                                  └──────────────────┘
```

The PLT construction process involves several sophisticated steps:

**Phase 1: Module Discovery**: Dialyzer scans all BEAM files in the specified applications, building a dependency graph of modules and their inter-relationships.

**Phase 2: Core Library Analysis**: The engine analyzes Erlang/OTP standard library functions first, as they form the foundation for all type inference. This includes modules like `:lists`, `:gen_server`, `:ets`, and hundreds of others.

**Phase 3: Dependency Analysis**: Third-party dependencies are analyzed in dependency order, ensuring that lower-level libraries are fully typed before higher-level ones that depend on them.

**Phase 4: Cross-Module Resolution**: The engine resolves type information across module boundaries, handling complex patterns like behaviours, protocols, and callback specifications.

PLT files are structured as optimized binary data with hash-based lookups for function signatures. A typical PLT contains:
- Function success types (parameter and return types)
- Callback specifications for behaviours
- Opaque type definitions and their invariants
- Cross-reference information for incremental updates

PLT corruption is a known issue, particularly after dependency version changes or Erlang/OTP upgrades. The corruption manifests as inconsistent type information between the cached PLT and the actual BEAM files. The nuclear cache fix addresses this:

```bash
# Nuclear cache fix for PLT corruption
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
# Then rebuild: mix dialyzer

# Advanced PLT management for large projects
mix dialyzer.plt.info                    # Show PLT contents and statistics
mix dialyzer.plt.check                   # Verify PLT consistency
mix dialyzer --plt-add -f fresh_deps.txt # Add new dependencies
```

For enterprise deployments, PLT management becomes a critical performance consideration. Teams often maintain shared PLTs in CI/CD systems, with careful cache invalidation strategies based on `mix.lock` checksums and Erlang/OTP version hashes.

### Warnings Classification

Dialyzer produces several categories of warnings:

| Warning Type | Description | Severity |
|-------------|-------------|----------|
| **Type mismatch** | Function called with incompatible argument types | High |
| **Contract violation** | `@spec` disagrees with inferred success type | High |
| **Unreachable code** | Code path can never execute | Medium |
| **Redundant guard** | Guard clause that is always true or always false | Medium |
| **Callback violation** | `@impl` does not match behaviour spec | High |
| **Unknown function** | Call to undefined function | High |
| **Opaque violation** | Internal structure of opaque type accessed | Medium |

## Architecture and Implementation

### Integration in the Quality Stack

Dialyzer occupies the deepest analysis layer in the Prismatic Platform's quality enforcement:

```elixir
defmodule PrismaticQuality.DialyzerGate do
  @moduledoc """
  Dialyzer quality gate for the CI pipeline and pre-commit enforcement.
  Manages PLT lifecycle and warning thresholds.
  """

  @plt_path "priv/plts/dialyzer.plt"
  @warning_types [
    :error_handling,
    :matching,
    :no_contracts,
    :no_fail_call,
    :no_match,
    :no_return,
    :no_unused,
    :underspecs,
    :unknown,
    :unmatched_returns
  ]

  @spec run_analysis() :: {:ok, :clean} | {:error, list(map())}
  def run_analysis do
    ensure_plt_exists()

    case System.cmd("mix", ["dialyzer", "--format", "dialyxir"],
           stderr_to_stdout: true
         ) do
      {_output, 0} ->
        {:ok, :clean}

      {output, _code} ->
        warnings = parse_warnings(output)
        {:error, warnings}
    end
  end

  defp ensure_plt_exists do
    unless File.exists?(@plt_path) do
      Mix.shell().info("Building Dialyzer PLT (this may take several minutes)...")
      System.cmd("mix", ["dialyzer", "--plt"])
    end
  end

  defp parse_warnings(output) do
    output
    |> String.split("\n")
    |> Enum.filter(&String.contains?(&1, "warning:"))
    |> Enum.map(&parse_warning_line/1)
  end

  defp parse_warning_line(line) do
    %{raw: line, timestamp: DateTime.utc_now()}
  end
end
```

### Dialyxir Integration

The Elixir ecosystem uses Dialyxir as the Mix integration layer for Dialyzer:

```elixir
# mix.exs configuration
defp deps do
  [
    {:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false}
  ]
end

# Dialyxir configuration in mix.exs
def project do
  [
    dialyzer: [
      plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
      plt_add_apps: [:mix, :ex_unit],
      flags: [
        :error_handling,
        :no_opaque,
        :race_conditions,
        :underspecs,
        :unmatched_returns
      ]
    ]
  ]
end
```

## Usage in Prismatic Platform

Dialyzer runs as a mandatory quality gate with zero violations permitted across all 6,652 Elixir source files in 89 umbrella applications.

### Current Status

| Metric | Value |
|--------|-------|
| Files analyzed | 6,652 |
| Current violations | 0 |
| `@impl` annotations verified | 709+ |
| `@spec` annotations validated | All public functions |
| PLT location | `priv/plts/dialyzer.plt` |
| Analysis time (incremental) | 30-90 seconds |
| Analysis time (full rebuild) | 5-15 minutes |

### `@impl` Verification

Dialyzer validates that all `@impl` annotations correctly match their behaviour callback specifications. With 709+ `@impl` annotations across the platform, this verification ensures that no behaviour implementation has drifted from its contract:

```elixir
defmodule PrismaticStorage.ETS do
  @moduledoc """
  ETS-backed storage adapter implementing the StorageCore behaviour.
  All @impl annotations verified by Dialyzer against callback specs.
  """
  @behaviour PrismaticStorageCore

  @impl PrismaticStorageCore
  @spec get(term(), keyword()) :: {:ok, term()} | {:error, :not_found}
  def get(key, _opts) do
    case :ets.lookup(:storage, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @impl PrismaticStorageCore
  @spec put(term(), term(), keyword()) :: :ok
  def put(key, value, _opts) do
    :ets.insert(:storage, {key, value})
    :ok
  end
end
```

### `@spec` Coverage

The platform mandates `@spec` annotations on all public functions, which Dialyzer then validates:

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc """
  Security rating calculation with Dialyzer-verified type contracts.
  """

  @type grade :: :A | :B | :C | :D | :F
  @type score :: 300..900
  @type rating :: %{grade: grade(), score: score(), percentile: float()}

  @spec calculate(String.t()) :: {:ok, rating()} | {:error, term()}
  def calculate(domain) when is_binary(domain) do
    with {:ok, findings} <- assess_security(domain),
         {:ok, score} <- compute_score(findings) do
      {:ok, %{
        grade: score_to_grade(score),
        score: score,
        percentile: calculate_percentile(score)
      }}
    end
  end

  @spec score_to_grade(score()) :: grade()
  defp score_to_grade(score) when score >= 800, do: :A
  defp score_to_grade(score) when score >= 700, do: :B
  defp score_to_grade(score) when score >= 600, do: :C
  defp score_to_grade(score) when score >= 450, do: :D
  defp score_to_grade(_score), do: :F
end
```

## Code Examples

### Writing Dialyzer-Friendly Code

```elixir
defmodule DialyzerFriendlyPatterns do
  @moduledoc """
  Demonstrates patterns that maximize Dialyzer's analytical power.
  """

  # Pattern 1: Explicit return types with @spec
  @spec fetch_user(integer()) :: {:ok, map()} | {:error, :not_found}
  def fetch_user(id) when is_integer(id) do
    case UserStore.get(id) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  # Pattern 2: Custom types for domain concepts
  @type severity :: :critical | :high | :medium | :low | :info
  @type finding :: %{
    id: String.t(),
    severity: severity(),
    description: String.t(),
    timestamp: DateTime.t()
  }

  @spec create_finding(String.t(), severity(), String.t()) :: finding()
  def create_finding(id, severity, description) do
    %{
      id: id,
      severity: severity,
      description: description,
      timestamp: DateTime.utc_now()
    }
  end

  # Pattern 3: Guard clauses that help Dialyzer narrow types
  @spec process_score(number()) :: :pass | :fail | :warning
  def process_score(score) when is_number(score) and score >= 80, do: :pass
  def process_score(score) when is_number(score) and score >= 50, do: :warning
  def process_score(score) when is_number(score), do: :fail
end
```

## Best Practices

**Write `@spec` annotations on all public functions.** While Dialyzer can infer types without annotations, explicit specs serve dual purposes: they document the intended contract for human readers, and they allow Dialyzer to detect cases where the implementation diverges from the intended behavior.

**Use custom types for domain concepts.** Define `@type` declarations for domain-specific concepts (e.g., `@type severity :: :critical | :high | :medium | :low`). This gives Dialyzer richer type information and produces more readable specs.

**Run Dialyzer incrementally during development.** Full PLT rebuilds are slow, but incremental analysis of changed modules completes in seconds. Integrate Dialyzer into the development workflow as a continuous check, not just a CI gate.

**Keep PLTs fresh.** Rebuild PLTs after Erlang/OTP upgrades, major dependency updates, and when adding new applications to the umbrella. Stale PLTs can produce false warnings or miss real issues.

**Treat Dialyzer warnings as bugs.** Dialyzer's zero-false-positive design means every warning represents a genuine issue. Never suppress warnings without understanding and fixing the underlying problem.

## Common Pitfalls

**PLT corruption after dependency changes.** Updating Hex dependencies or changing Erlang/OTP versions can corrupt the PLT, causing spurious warnings or crashes. The nuclear cache fix resolves this: `rm -rf _build/dev/lib/*/ebin && rm -rf priv/plts/dialyzer.plt`. Signs of PLT corruption include crashes during analysis, warnings about functions that don't exist, or sudden increases in warning count after dependency updates.

**Overly broad specs that hide bugs.** Declaring `@spec process(any()) :: any()` passes Dialyzer but provides zero analytical value. Specs should be as narrow as the implementation allows, giving Dialyzer the information needed to detect mismatches. A common anti-pattern is widening specs to silence Dialyzer warnings instead of fixing the underlying type issues in the implementation.

**Ignoring opaque type violations.** Opaque types (defined with `@opaque`) are meant to be manipulated only through their module's public API. Dialyzer reports violations when code accesses opaque type internals directly, indicating a coupling problem. These violations often indicate architectural issues where modules are too tightly coupled or abstraction boundaries are being violated.

**Confusing Dialyzer with a type checker.** Dialyzer is not a type checker -- it is a discrepancy analyzer. It will not catch every type error; it catches guaranteed failures. Supplement Dialyzer with property-based testing and comprehensive unit tests for complete coverage. Understanding this distinction is crucial: Dialyzer optimizes for zero false positives, not zero false negatives.

**Slow CI due to PLT rebuilds.** Cache the PLT file in CI (using `.gitlab-ci.yml` cache directives with the PLT path) to avoid rebuilding from scratch on every pipeline run. The PLT should be keyed on the `mix.lock` hash to invalidate on dependency changes. Improper caching strategies can lead to 10-20 minute CI runs instead of 2-3 minute incremental analyses.

**Type variable confusion in generic code.** When writing generic functions, developers sometimes create specs with type variables that don't properly constrain the relationships between parameters and return types. For example: `@spec transform(a, (a -> b)) :: b` is better than `@spec transform(any(), fun()) :: any()` because it preserves the relationship between input and output types.

**Missing `when` clauses in specs.** Dialyzer performs better analysis when function specifications include the same guard clauses as the function heads. If a function has `when is_binary(input)`, the spec should include the same constraint: `@spec process(input) :: result() when input: binary()`.

**Recursive type definitions without proper termination.** When defining recursive data structures, ensure that Dialyzer can infer termination conditions. Poorly specified recursive types can cause analysis to run indefinitely or produce overly broad type signatures that miss bugs in tree traversal or list processing functions.

## Related Concepts

- [Quality Gates](/glossary/quality-gates/) -- Enforcement pipeline including Dialyzer as a mandatory check
- [Credo](/glossary/credo/) -- Complementary static analysis tool for style and pattern checking
- [Behaviour](/glossary/behaviour/) -- Callback contracts whose compliance Dialyzer verifies
- [Typespec](/glossary/typespec/) -- Type annotations that Dialyzer validates against actual code
- [Zero Warning Policy](/glossary/zero-warning-policy/) -- Related compilation standard mandating zero violations
- [Clean Run](/glossary/clean-run/) -- Overall quality standard that Dialyzer contributes to
- [Continuous Integration](/glossary/continuous-integration/) -- CI pipeline running Dialyzer in the analyze stage
- [OTP](/glossary/otp/) -- Framework whose behaviours Dialyzer validates

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Umbrella applications analyzed by Dialyzer

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)