+++
title = "Zero Warning Policy"
weight = 57
[extra]
description = "All code must compile with --warnings-as-errors producing zero warnings"
category = "quality"
related_terms = ["clean-run", "quality-gates", "credo", "dialyzer", "no-mercy"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1334
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Zero", "Warning", "Policy", "--warnings-as-errors", "glossary", "quality", "Prismatic Platform", "Elixir", "Warnings", "Zero Warning"]
tags = ["glossary", "quality", "zero-warning-policy", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Zero Warning Policy - Prismatic Platform"
+++

## Definition & Overview

The Zero Warning Policy is a foundational quality enforcement rule mandating that all Elixir code in the Prismatic Platform must compile successfully with the `--warnings-as-errors` flag enabled. Under this policy, every compiler diagnostic---unused variables, deprecated function calls, missing return values, unreachable code, pattern match warnings, and all other compiler-generated warnings---is treated as a compilation failure. The build process terminates with a non-zero exit code, blocking all downstream operations: testing, deployment, commit, and merge.

This policy represents the most uncompromising approach to compiler diagnostics in software engineering. Most projects tolerate some level of warnings, relying on developers to exercise judgment about which warnings are "real problems" and which are "acceptable noise." The Zero Warning Policy rejects this distinction entirely. Every warning is a potential defect indicator. Every warning increases the noise floor that obscures genuinely critical diagnostics. The only acceptable number of warnings is zero.

The rationale is both practical and philosophical. Practically, maintaining zero warnings ensures that every new warning is immediately visible and attributable to a specific change, enabling instant root cause identification. A codebase with 200 existing warnings makes it trivial for a developer to introduce the 201st without noticing. A codebase with zero warnings makes every new warning an unmistakable signal. Philosophically, the policy aligns with the [NO MERCY](@/glossary/no-mercy.md) doctrine: there are no acceptable quality violations, no deferred fixes, and no tolerance for "good enough."

The Prismatic Platform enforces this policy across all 6,652 Elixir source files in 90 umbrella applications. The current status is **zero compilation warnings** across the entire codebase---a state that has been maintained through disciplined enforcement at every stage of the development lifecycle.

| Enforcement Point | Command | Blocking? |
|-------------------|---------|-----------|
| **Local compilation** | `mix compile --warnings-as-errors` | Yes - blocks development |
| **Pre-commit hook** | `.githooks/pre-commit` Phase 2 | Yes - blocks commit |
| **Quality Gates** | `mix quality.gates` | Yes - blocks merge |
| **CI Pipeline** | GitLab CI compilation stage | Yes - blocks deployment |
| **Mix project config** | `elixirc_options: [warnings_as_errors: true]` | Yes - permanent |

## Technical Deep Dive

### Elixir Compiler Warnings

The Elixir compiler produces several categories of warnings, each representing a different class of potential issue:

**Unused Variable Warnings** are generated when a variable is bound but never referenced. While seemingly harmless, unused variables often indicate incomplete implementations, copy-paste errors, or forgotten debug statements. The idiomatic Elixir fix is to prefix unused variables with an underscore (`_unused`) to explicitly signal intentional non-use.

**Deprecated Function Warnings** signal the use of functions scheduled for removal in future Elixir versions. Ignoring these warnings creates a ticking time bomb: the code compiles today but will break on the next Elixir upgrade. The Zero Warning Policy forces immediate migration to recommended alternatives.

**Unreachable Code Warnings** indicate logic that can never execute---dead branches in case statements, code after unconditional returns, or pattern matches that are subsumed by earlier clauses. Unreachable code is a strong indicator of logic errors or misunderstood control flow.

**Missing Return Value Warnings** flag expressions whose return values are ignored. In Elixir, where functions communicate results through return values, ignoring a return value often means ignoring an error condition.

**Pattern Match Warnings** include non-exhaustive matches and overlapping patterns. These can indicate unhandled edge cases or redundant logic.

### The Warning Accumulation Problem

The fundamental argument for the Zero Warning Policy is the warning accumulation problem. In codebases that tolerate warnings, the warning count follows a predictable trajectory:

```
Week 1:   3 warnings  - "We'll fix these soon"
Month 1:  15 warnings - "Most are harmless"
Month 3:  47 warnings - "Too many to fix, we have features to ship"
Month 6:  120 warnings - "Nobody looks at warnings anymore"
Month 12: 300+ warnings - "Is that a real problem or just a warning?"
```

At 300 warnings, the diagnostic system is effectively disabled. Genuine problems---type mismatches, deprecated APIs, logic errors---are invisible in the noise. The Zero Warning Policy prevents this trajectory from ever beginning by maintaining the count at exactly zero.

### Interaction with Other Quality Tools

The Zero Warning Policy operates alongside other quality enforcement tools, each covering a different quality dimension:

```
Compiler Warnings (Zero Warning Policy)
    |
    +--> Covers: unused vars, deprecated calls, unreachable code, type mismatches
    |
Credo (Static Analysis)
    |
    +--> Covers: code style, complexity, naming, design patterns
    |
Dialyzer (Type Analysis)
    |
    +--> Covers: type specification violations, unreachable code (deeper), contract violations
    |
ExUnit (Testing)
    |
    +--> Covers: behavioral correctness, edge cases, regressions
```

## Architecture & Implementation

### Mix Project Configuration

Every umbrella application in the Prismatic Platform includes the `warnings_as_errors` flag in its `mix.exs` configuration:

```elixir
defmodule PrismaticWeb.MixProject do
  use Mix.Project

  def project do
    [
      app: :prismatic_web,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixirc_options: [warnings_as_errors: true],
      elixirc_paths: elixirc_paths(Mix.env()),
      deps: deps(),
      test_coverage: [threshold: 80]
    ]
  end
end
```

This configuration ensures that even `mix compile` without explicit flags enforces the zero warning policy. The `--force` flag is added in CI environments to ensure full recompilation catches warnings in all files, not just changed ones.

### Pre-Commit Hook Integration

The `.githooks/pre-commit` script enforces zero warnings before any commit reaches the repository:

```elixir
defmodule PrismaticSafety.PreCommit.CompilationCheck do
  @moduledoc """
  Pre-commit compilation check enforcing zero warnings policy.
  Runs `mix compile --warnings-as-errors --force` and blocks
  commit on any warning.
  """

  @spec check(list(String.t())) :: :pass | {:fail, list(String.t())}
  def check(staged_files) do
    elixir_files = Enum.filter(staged_files, &String.ends_with?(&1, ".ex"))

    if Enum.empty?(elixir_files) do
      :pass
    else
      case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
             stderr_to_stdout: true) do
        {_output, 0} -> :pass
        {output, _exit_code} -> {:fail, extract_warnings(output)}
      end
    end
  end

  defp extract_warnings(output) do
    output
    |> String.split("\n")
    |> Enum.filter(&String.contains?(&1, "warning:"))
  end
end
```

### Quality Gate Integration

The `mix quality.gates` task includes compilation as its first check, ensuring that all subsequent checks (Credo, Dialyzer, tests) operate on warning-free code:

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc """
  Multi-phase quality gate enforcement.
  Phase 1: Zero Warning Compilation (BLOCKING)
  """

  use Mix.Task

  @spec run(list(String.t())) :: :ok | no_return()
  def run(_args) do
    Mix.shell().info("Phase 1: Zero Warning Compilation Check")

    case Mix.Task.run("compile", ["--warnings-as-errors", "--force"]) do
      :ok ->
        Mix.shell().info("PASS: Zero warnings")
        run_remaining_phases()

      {:error, _} ->
        Mix.shell().error("FAIL: Compilation warnings detected")
        Mix.shell().error("Fix all warnings before proceeding")
        System.halt(1)
    end
  end
end
```

### Warning Pattern Detection

The platform includes proactive detection of patterns known to generate warnings, catching issues before compilation:

```elixir
defmodule PrismaticSafety.WarningPatternDetector do
  @moduledoc """
  Proactive detection of code patterns that will generate
  compiler warnings. Catches issues before compilation.
  """

  @warning_patterns [
    {~r/\b([a-z_][a-z0-9_]*)\s*=.*\n(?!.*\b\1\b)/, :unused_variable},
    {~r/\bIO\.inspect\b/, :debug_statement},
    {~r/\bProcess\.sleep\b/, :process_sleep},
    {~r/\b:timer\.sleep\b/, :timer_sleep}
  ]

  @spec scan_file(String.t()) :: list(warning_pattern())
  def scan_file(file_path) do
    content = File.read!(file_path)

    @warning_patterns
    |> Enum.flat_map(fn {pattern, type} ->
      case Regex.scan(pattern, content) do
        [] -> []
        matches -> Enum.map(matches, fn _match -> {file_path, type} end)
      end
    end)
  end
end
```

## Usage in Prismatic Platform

### Daily Development Workflow

Developers working on the Prismatic Platform encounter the Zero Warning Policy at multiple points during their daily workflow:

1. **Writing code**: IDE integration (ElixirLS) shows warnings in real time as code is written
2. **Local compilation**: `mix compile` in the project enforces `warnings_as_errors: true` via `mix.exs`
3. **Running tests**: `mix test` recompiles changed files, triggering warning detection
4. **Committing**: Pre-commit hook runs full `--warnings-as-errors --force` compilation
5. **Pushing**: Pre-push hook runs quality gates including compilation check
6. **CI Pipeline**: GitLab CI runs full compilation as the first pipeline stage

### Common Warning Scenarios and Fixes

| Warning | Root Cause | Fix |
|---------|-----------|-----|
| `variable "x" is unused` | Bound but not referenced | Prefix with `_` or remove |
| `function is deprecated` | Using outdated API | Migrate to recommended alternative |
| `this clause cannot match` | Unreachable pattern | Remove dead clause or fix pattern |
| `missing @impl true` | Callback not annotated | Add `@impl true` annotation |
| `module attribute @foo was set but never used` | Unused module attribute | Remove or use the attribute |

### Standardization Achievement

The `mix quality.standardize_mix` task was used to enforce `warnings_as_errors: true` across all 99 umbrella applications simultaneously. This standardization was one of 321 transformations applied during the Universal Quality Standard implementation, ensuring consistent enforcement across the entire codebase.

## Code Examples

### Fixing Common Warnings

```elixir
# WARNING: variable "result" is unused
defmodule Example.Before do
  def process(data) do
    result = transform(data)  # Warning: result is unused
    :ok
  end
end

# FIXED: Either use the variable or prefix with underscore
defmodule Example.After do
  def process(data) do
    _result = transform(data)  # Explicitly unused
    :ok
  end

  # Or better: use the result
  def process_v2(data) do
    result = transform(data)
    {:ok, result}
  end
end
```

```elixir
# WARNING: this clause cannot match because a previous clause always matches
defmodule Router.Before do
  def route(path) do
    case path do
      "/" <> _rest -> handle_path(path)  # Always matches
      "/api" <> _rest -> handle_api(path)  # Unreachable!
    end
  end
end

# FIXED: Order clauses from specific to general
defmodule Router.After do
  def route(path) do
    case path do
      "/api" <> _rest -> handle_api(path)  # Specific first
      "/" <> _rest -> handle_path(path)     # General last
    end
  end
end
```

### Automated Warning Prevention

```elixir
defmodule PrismaticSafety.WarningPrevention do
  @moduledoc """
  Utilities for preventing common warning patterns
  in new code generation and templates.
  """

  @spec safe_variable_bind(String.t(), any()) :: String.t()
  def safe_variable_bind(name, value) when is_binary(name) do
    # Generate code that avoids unused variable warnings
    if value_used?(name) do
      "#{name} = #{inspect(value)}"
    else
      "_#{name} = #{inspect(value)}"
    end
  end

  @spec check_deprecations(module()) :: list({atom(), String.t()})
  def check_deprecations(module) do
    # Check all function calls in module for deprecated APIs
    module
    |> Module.definitions_in()
    |> Enum.flat_map(fn {function, arity} ->
      module
      |> Module.get_definition({function, arity})
      |> extract_called_functions()
      |> Enum.filter(&deprecated?/1)
      |> Enum.map(fn dep -> {function, "Calls deprecated #{inspect(dep)}"} end)
    end)
  end
end
```

## Best Practices

1. **Enable in `mix.exs`, not just CLI flags**: Setting `elixirc_options: [warnings_as_errors: true]` in the project configuration ensures enforcement regardless of how compilation is invoked. CLI flags can be forgotten; project configuration is permanent.

2. **Use `--force` in CI**: Incremental compilation only checks changed files. In CI environments, use `mix compile --warnings-as-errors --force` to ensure full recompilation catches warnings in all files, including those affected by dependency changes.

3. **Fix warnings immediately**: When a warning appears during development, fix it before doing anything else. Deferring warning fixes violates the Zero Warning Policy and risks commit rejection.

4. **Understand the warning before fixing**: Do not blindly suppress warnings with underscores. An unused variable warning may indicate a logic error (forgotten to use a computed result) rather than an intentional non-use. Understand the root cause before choosing the fix.

5. **Track warning categories**: Monitor which warning types appear most frequently. A spike in "unused variable" warnings may indicate copy-paste coding. A spike in "deprecated function" warnings may signal an upcoming Elixir version dependency.

6. **Combine with Credo and Dialyzer**: The compiler catches a subset of code quality issues. [Credo](@/glossary/credo.md) covers style and design patterns. [Dialyzer](@/glossary/dialyzer.md) covers type analysis. All three together provide comprehensive static analysis coverage.

## Common Pitfalls

- **Suppressing warnings without understanding**: Prefixing variables with `_` to silence "unused variable" warnings without investigating why the variable is unused can hide real bugs. Always understand the root cause before applying the fix.

- **Disabling for specific files**: Some projects use per-file or per-module warning suppression. This creates inconsistency and provides a pathway for warning accumulation. The Prismatic Platform does not support per-file suppression.

- **Forgetting `--force` in CI**: Without `--force`, incremental compilation may not recompile files affected by upstream changes. A module that compiled cleanly yesterday may generate warnings today due to a dependency change. Always force full recompilation in CI.

- **Treating warnings-as-errors as optional**: If the policy is not enforced at every gate (IDE, compile, pre-commit, CI), developers will learn which gates are soft and route around them. Consistent enforcement at all points is essential.

- **Not updating deprecated code promptly**: Deprecated function warnings are time bombs. They compile today but will fail on the next Elixir version upgrade. Treat them with the same urgency as correctness issues.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) - Enforcement pipeline including zero-warning compilation
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) - Local enforcement of zero-warning compilation
- [NO MERCY](@/glossary/no-mercy.md) - Doctrine mandating zero tolerance for quality violations
- [Clean Run](@/glossary/clean-run.md) - Extended clean compilation policy beyond warnings
- [Credo](@/glossary/credo.md) - Static analysis complementing compiler warnings
- [Dialyzer](@/glossary/dialyzer.md) - Type analysis complementing compiler warnings
- [Mix Task](@/glossary/mix-task.md) - Build tool providing the `--warnings-as-errors` compilation flag
- [Quality Debt](@/glossary/quality-debt.md) - Warnings tracked as QDP before elimination
- [Violation Protocol](@/glossary/violation-protocol.md) - Escalation levels for warning policy violations
- [NM/ND Doctrine](@/glossary/nm-nd.md) - Governing doctrine mandating zero tolerance

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Apps](@/apps/_index.md) - 90 umbrella applications under zero-warning enforcement
- [Commands](@/commands/_index.md) - Quality commands enforcing the policy

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)