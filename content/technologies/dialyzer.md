+++
title = "Dialyzer"
weight = 60
[extra]
category = "testing"
description = "Static analysis tool for finding type discrepancies, dead code, and unreachable code in Erlang and Elixir"
url = "https://www.erlang.org/doc/man/dialyzer.html"
version = "Built-in"
icon = "dialyzer"
color = "red"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1143
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Dialyzer", "Static", "Erlang", "Elixir", "technologies", "testing", "Prismatic Platform", "Credo"]
tags = ["technologies", "testing", "dialyzer", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Dialyzer - Prismatic Platform"
+++

## Overview

Dialyzer (DIscrepancy AnaLYZer for ERlang) is the static analysis tool that enforces type safety across the Prismatic Platform's entire codebase. Unlike compile-time type checkers in statically typed languages, Dialyzer uses success typing -- a sound analysis technique that finds guaranteed bugs. If Dialyzer reports a warning, it has mathematically proven that the code will fail at runtime. This zero-false-positive property makes Dialyzer warnings actionable with complete confidence: every warning represents a real defect that must be fixed.

The Prismatic Platform enforces zero Dialyzer warnings as a mandatory [quality gate](/capabilities/quality-gates/). Every function has a `@spec` type specification, and the CI/CD pipeline blocks any commit that introduces a Dialyzer warning. This level of enforcement has eliminated entire categories of runtime errors from the platform -- type mismatches, unreachable code paths, and incorrect function call signatures are caught at analysis time rather than discovered in production. The platform's 90 umbrella applications produce zero Dialyzer warnings, a status maintained through continuous enforcement.

Dialyzer's PLT (Persistent Lookup Table) caches analysis results for dependencies, making incremental analysis fast even across the platform's massive codebase. The platform maintains a pre-built PLT for all dependencies that is refreshed during CI builds, reducing the analysis time for application code to seconds rather than minutes. The integration through the `dialyxir` library provides a clean Mix task interface that fits naturally into the platform's existing quality pipeline.

## Key Features

Dialyzer provides a unique combination of soundness and usability that makes it the most reliable static analysis tool in the [Elixir](/technologies/elixir/) ecosystem.

- **Success Typing**: Finds guaranteed runtime failures with zero false positives -- every warning is a real bug
- **Spec Checking**: Validates `@spec` annotations match actual function behavior, catching specification drift
- **Dead Code Detection**: Identifies unreachable code paths, impossible pattern matches, and functions that can never succeed
- **Race Conditions**: Detects certain classes of concurrency issues in message-passing code
- **PLT Caching**: Persistent analysis cache (Persistent Lookup Table) for fast incremental checks on large codebases
- **Pattern Match Analysis**: Validates pattern match completeness and identifies clauses that can never match
- **Return Type Inference**: Infers return types from function bodies and compares against declared specs
- **Cross-Module Analysis**: Traces type information across module boundaries for whole-program analysis

| Analysis Type | What It Finds | Platform Impact |
|--------------|---------------|-----------------|
| Type mismatches | Function called with wrong argument types | Eliminates argument errors in agent calls |
| Unreachable code | Pattern clauses that can never match | Removes dead code from the codebase |
| Spec violations | @spec does not match actual behavior | Keeps documentation accurate |
| Return type errors | Function returns unexpected types | Prevents cascading type errors |
| Callback violations | @impl functions with wrong signatures | Ensures OTP behaviour compliance |
| Guard failures | Guards that always fail | Catches logic errors in function heads |

## Platform Integration

Dialyzer enforces type safety across all platform modules through the `dialyxir` library, which wraps Dialyzer in a convenient Mix task interface with sensible defaults for Elixir projects.

```elixir
# dialyxir configuration in mix.exs
defp deps do
  [{:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false}]
end

# Example: Dialyzer catches type mismatches at analysis time
@spec security_rating(String.t()) :: {:ok, rating()} | {:error, term()}
def security_rating(domain) when is_binary(domain) do
  # Dialyzer verifies this function returns the declared types
  # and that callers pass the correct argument types
  case PrismaticPerimeter.assess(domain) do
    {:ok, assessment} -> {:ok, compute_rating(assessment)}
    {:error, _} = error -> error
  end
end

# Dialyzer would catch this bug:
# @spec process_rating(integer()) :: String.t()
# def process_rating(rating) when is_binary(rating) do
#   String.upcase(rating)
# end
# ^ Warning: function will never be called because guard always fails
#   (integer() will never satisfy is_binary/1)
```

The platform's spec coverage is comprehensive, with every public function annotated with type specifications:

```elixir
defmodule PrismaticPerimeter.SecurityRating do
  @moduledoc "Security rating computation with Dialyzer-verified type contracts."

  @type grade :: :A | :B | :C | :D | :F
  @type rating :: %{
    grade: grade(),
    score: non_neg_integer(),
    industry_percentile: non_neg_integer() | nil,
    assessed_at: DateTime.t()
  }

  @spec compute(map()) :: {:ok, rating()} | {:error, :insufficient_data}
  def compute(%{} = assessment) do
    case calculate_score(assessment) do
      score when score >= 850 -> {:ok, build_rating(:A, score, assessment)}
      score when score >= 700 -> {:ok, build_rating(:B, score, assessment)}
      score when score >= 550 -> {:ok, build_rating(:C, score, assessment)}
      score when score >= 400 -> {:ok, build_rating(:D, score, assessment)}
      score when score >= 0 -> {:ok, build_rating(:F, score, assessment)}
      _ -> {:error, :insufficient_data}
    end
  end

  @spec build_rating(grade(), non_neg_integer(), map()) :: rating()
  defp build_rating(grade, score, _assessment) do
    %{grade: grade, score: score, industry_percentile: nil, assessed_at: DateTime.utc_now()}
  end
end
```

## Architecture

Dialyzer operates as part of the platform's multi-layer quality enforcement pipeline, complementing [Credo](/technologies/credo/)'s style analysis and [ExUnit](/technologies/exunit/)'s runtime testing with mathematically sound type analysis.

| Quality Dimension | Tool | Enforcement Level |
|-------------------|------|-------------------|
| Type Safety | **Dialyzer** | **Zero warnings (CI blocking)** |
| Code Quality | [Credo](/technologies/credo/) | Zero violations (CI blocking) |
| Compilation | `mix compile` | `--warnings-as-errors` (CI blocking) |
| Runtime Correctness | [ExUnit](/technologies/exunit/) | Full test passage (CI blocking) |
| Coverage | ExCoveralls | Threshold enforcement (CI blocking) |

The PLT (Persistent Lookup Table) architecture is critical for performance. Dialyzer builds a PLT containing type information for all dependencies, which is then used as a baseline for analyzing application code. The platform's CI pipeline caches this PLT between builds to avoid the expensive 5-10 minute dependency analysis on every run.

```
PLT Build Process:
  Erlang/OTP modules --> Base PLT (~2 min)
      |
  Hex dependencies  --> Extended PLT (~3-5 min)
      |
  Application code  --> Full analysis (~30-60 sec)
      |
  Results           --> Zero warnings required
```

## Performance Characteristics

Dialyzer's performance characteristics are dominated by PLT construction time, which is a one-time cost amortized across many analysis runs.

| Operation | Duration | Notes |
|-----------|----------|-------|
| PLT build (from scratch) | 5-10 minutes | One-time per dependency set |
| Incremental analysis | 30-60 seconds | Application code only, with cached PLT |
| Single module analysis | 2-5 seconds | During development (watch mode) |
| PLT file size | ~50-100MB | Cached in `priv/plts/dialyzer.plt` |
| Memory usage during analysis | 500MB-1GB | Depends on codebase size |
| CI analysis (cached PLT) | 45-90 seconds | Full 90-app umbrella |

The "Nuclear Cache Fix" documented in the platform's CLAUDE.md addresses rare PLT corruption issues: `rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt`. This forces a full PLT rebuild, resolving analysis inconsistencies caused by incremental compilation state drift.

## Configuration

Dialyzer is configured through `mix.exs` with flags that control the analysis strictness and PLT location. The platform uses aggressive flags to maximize bug detection.

```elixir
# mix.exs Dialyzer configuration
def project do
  [
    dialyzer: [
      plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
      plt_add_apps: [:mix, :ex_unit],
      flags: [
        :error_handling,
        :no_opaque,
        :underspecs,
        :unmatched_returns
      ]
    ]
  ]
end
```

| Flag | Effect | Why Enabled |
|------|--------|-------------|
| `:error_handling` | Warns about improper error handling | Ensures all error cases are handled |
| `:no_opaque` | Warns about opaque type violations | Enforces abstraction boundaries |
| `:underspecs` | Warns when specs are too general | Keeps type specifications precise |
| `:unmatched_returns` | Warns about ignored return values | Prevents silent failures |

## Best Practices

The platform enforces Dialyzer best practices to maximize the value of type analysis and minimize the friction of maintaining type specifications.

- **Add `@spec` to every public function** -- comprehensive specs enable Dialyzer to perform cross-module type analysis and catch more bugs
- **Use custom types (`@type`)** -- define domain-specific types for clarity and reuse across modules (e.g., `@type grade :: :A | :B | :C | :D | :F`)
- **Never ignore Dialyzer warnings** -- every warning is a guaranteed bug; treat them with the same urgency as failing tests
- **Cache the PLT in CI** -- store `priv/plts/dialyzer.plt` as a CI artifact to avoid rebuilding on every pipeline run
- **Run incrementally during development** -- use `mix dialyzer` on changed modules for fast feedback during coding
- **Keep specs up to date** -- when refactoring, update specs alongside implementation to prevent specification drift
- **Use the Nuclear Cache Fix** when analysis produces unexpected results -- PLT corruption can cause false warnings or missed bugs
- **Combine with Credo** -- Dialyzer finds type bugs, Credo finds style issues; together they provide comprehensive static analysis

## Comparison

Dialyzer occupies a unique position in the static analysis landscape due to its success typing approach, which guarantees zero false positives at the cost of potentially missing some bugs.

| Criterion | Dialyzer | TypeScript | MyPy (Python) | GHC (Haskell) |
|-----------|----------|------------|---------------|---------------|
| Type system | Success typing | Structural | Gradual | Hindley-Milner |
| False positives | Zero (guaranteed) | Some (any/unknown) | Some (gradual typing) | Zero (sound) |
| Annotations required | @spec (optional but recommended) | Required | Optional (gradual) | Inferred |
| Analysis speed | Moderate (PLT-dependent) | Fast | Moderate | Fast |
| Cross-module analysis | Yes (via PLT) | Yes (via .d.ts) | Yes (via stubs) | Yes (native) |
| Incremental analysis | Yes (PLT caching) | Yes (watch mode) | Yes (daemon) | Yes (GHCi) |
| Dead code detection | Yes | Limited | Limited | Yes (with flags) |
| Opaque type enforcement | Yes | Yes (branded types) | Limited | Yes (abstract types) |

## Related Technologies

- [Credo](/technologies/credo/) - Code quality analysis that complements Dialyzer's type-level analysis with style and design checks
- [ExUnit](/technologies/exunit/) - Runtime testing that validates behavior Dialyzer cannot statically verify
- [Elixir](/technologies/elixir/) - The language providing the `@spec` and `@type` annotation system
- [Erlang/OTP](/technologies/erlang-otp/) - The runtime platform that Dialyzer was originally built for
- [BEAM](/technologies/beam/) - Virtual machine whose type system Dialyzer analyzes

## Related Apps

- All 90 Prismatic Platform applications are Dialyzer-checked with zero warnings as a mandatory quality gate
- [prismatic_safety](/apps/prismatic-safety/) - Quality Floor Guardian monitors Dialyzer compliance status
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Security-critical code with comprehensive type specifications
- [prismatic_agents](/apps/prismatic-agents/) - Agent interface contracts validated by Dialyzer spec checking

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)