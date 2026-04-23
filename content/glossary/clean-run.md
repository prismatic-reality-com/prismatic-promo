+++
title = "Clean Run"
weight = 5
[extra]
category = "doctrine"
description = "Zero runtime warnings, zero info/debug logs, --warnings-as-errors compilation across the entire platform"
related_terms = ["cascade", "cascade-pattern", "qdp", "dialyzer", "typespec", "autoevolve", "autoheal", "code-coverage", "property-based-testing", "mix", "supervisor"]
platform_relevance = "critical"
complexity = "intermediate"
domain = "quality-enforcement"
layer = "compilation-and-runtime"
paradigm = "zero-tolerance"
doctrine = "no-mercy-no-doubts"
enforcement_level = "absolute"
prismatic_usage = "compilation-standard, ci-gate, pre-commit-enforcement"
quality_impact = "foundational"
safety_level = "p0-absolute"
documentation_required = true
testing_strategy = "compile-time-and-runtime-validation"
current_status = "100-percent-compliant"
quality_score = "100/100"
quality_domains_clean = "13/13"
compiler_warnings = "0"
credo_violations = "0"
dialyzer_violations = "0"
related_apps = ["prismatic_safety", "prismatic_claude", "prismatic"]
see_also = ["cascade", "qdp", "dialyzer", "credo", "autoheal", "autoevolve"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1934
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Clean", "Run", "Zero", "--warnings-as-errors", "glossary", "doctrine", "Prismatic Platform", "Clean Run", "Credo", "Dialyzer"]
tags = ["glossary", "doctrine", "clean-run", "prismatic"]
image = "/images/sections/glossary.png"
image_alt = "Clean Run - Prismatic Platform"
+++

## Definition

A Clean Run is the mandatory compilation and runtime standard requiring zero warnings, zero extraneous info/debug log output, and successful compilation with the `--warnings-as-errors` flag across the entire Prismatic Platform. No runtime warnings, no informational log noise, and no compiler warnings are permitted in any code that enters the platform. This standard ensures that genuine warnings indicating real problems are never buried under noise, maintaining the highest possible signal-to-noise ratio across the codebase.

The Clean Run standard addresses a pervasive problem in large software systems: warning fatigue. When a codebase produces dozens or hundreds of warnings during compilation, developers stop reading them. Critical warnings about type mismatches, unused variables that indicate logic errors, or deprecated function usage are lost in a sea of noise. By maintaining absolute zero warnings, Clean Run ensures that any warning that does appear is immediately visible, immediately investigated, and immediately resolved. There is no baseline noise level to habituate to.

Clean Run is not merely a quality preference -- it is a structural enforcement integrated into the platform's compilation pipeline, [pre-commit hooks](@/glossary/pre-commit-hooks.md), CI/CD [quality gates](@/glossary/quality-gates.md), and continuous monitoring systems. Code that produces warnings cannot be compiled in production mode, cannot pass pre-commit validation, cannot merge into the main branch, and cannot be deployed. The enforcement is absolute and non-bypassable, governed by the [NO MERCY](@/glossary/no-mercy.md) doctrine.

## Historical Context and Motivation

The Clean Run standard evolved from painful experience with warning accumulation in large Elixir umbrella projects. Before Clean Run was instituted, the Prismatic Platform carried hundreds of compiler warnings -- unused variables, deprecated function calls, unreachable pattern match clauses, and missing typespec annotations. These warnings were individually trivial but collectively catastrophic. A genuine warning about a type mismatch in a critical security module was invisible among hundreds of benign warnings about unused imports.

The tipping point came during a quality assessment that identified 905 Quality Debt Points ([QDP](@/glossary/qdp.md)) across the codebase. The [CASCADE](@/glossary/cascade.md) methodology was developed specifically to eliminate this debt systematically, and Clean Run was established as the standard that would prevent debt from reaccumulating. The elimination campaign took multiple sessions and touched every umbrella application, but the result was a platform where every compiler message is meaningful and every warning demands immediate attention.

The decision to extend Clean Run beyond compilation to runtime behavior was driven by a similar observation: log noise in production systems has the same desensitizing effect as compiler warning noise. When every request produces informational log output, operators stop monitoring logs. When a genuine error appears, it drowns in noise. Clean Run's runtime silence standard ensures that log output is reserved for events that warrant human attention, maintaining operational signal clarity.

The standard also draws inspiration from the aerospace and medical device software industries, where warning-free compilation has been a regulatory requirement for decades. The DO-178C standard for airborne software and IEC 62304 for medical device software both mandate zero-warning compilation. The Prismatic Platform applies this same rigor to cybersecurity software, recognizing that security tools with quality deficits are worse than no tools at all -- they provide false confidence.

## Enforcement Layers

Clean Run is enforced at multiple independent layers, creating defense-in-depth against warning introduction.

### Layer 1: Compiler Enforcement

The [Elixir](@/glossary/elixir.md) compiler's `--warnings-as-errors` flag converts all compiler warnings to compilation errors. When this flag is active, any warning -- unused variable, deprecated function call, unreachable clause, missing return type -- causes compilation to fail entirely.

```bash
# Clean Run compilation command
mix compile --warnings-as-errors --force

# Common warnings that become errors:
# - warning: variable "x" is unused (Elixir.SomeModule)
# - warning: function foo/1 is unused
# - warning: module SomeModule is not available or is being defined
# - warning: Enum.uniq/2 is deprecated, use Enum.uniq_by/2
```

The `--force` flag ensures complete recompilation, preventing stale artifacts from masking new warnings. This is particularly important in the context of [CASCADE](@/glossary/cascade.md) Nuclear Cache patterns, where incremental compilation can produce inconsistent results.

### Layer 2: Static Analysis (Credo)

[Credo](@/glossary/credo.md) enforces code consistency, readability, and design rules in strict mode. Clean Run requires zero Credo violations.

```bash
# Clean Run Credo check
mix credo --strict

# Credo categories enforced:
# - Consistency: naming, spacing, module structure
# - Readability: function complexity, nesting depth
# - Refactoring: code duplication, long parameter lists
# - Design: alias organization, module dependencies
# - Warning: IO.inspect left in code, dbg() calls
```

Credo's strict mode enables all optional checks and reduces thresholds for complexity warnings. This catches not just errors but code quality issues that would degrade maintainability over time.

### Layer 3: Type Analysis (Dialyzer)

[Dialyzer](@/glossary/dialyzer.md) performs success typing analysis across all modules, detecting type inconsistencies that the compiler cannot catch. Clean Run requires zero Dialyzer violations.

```bash
# Clean Run Dialyzer check
mix dialyzer

# Dialyzer detects:
# - Type mismatches between @spec and implementation
# - Unreachable code branches due to type constraints
# - Pattern match failures guaranteed by types
# - Invalid function calls (wrong argument types)
```

Dialyzer analysis is computationally expensive (minutes for a full platform analysis), but the [AutoHeal](@/glossary/autoheal.md) system maintains the PLT (Persistent Lookup Table) incrementally to keep check times reasonable during development.

### Layer 4: Pre-Commit Hooks

Pre-commit hooks execute a subset of Clean Run checks on staged files before allowing a commit. These hooks run automatically and cannot be bypassed (the `--no-verify` flag is absolutely forbidden per platform doctrine).

```elixir
defmodule PrismaticSafety.PreCommitValidator do
  @moduledoc """
  Validates staged changes against Clean Run standards before
  allowing commits. Executes compilation, Credo, and pattern
  checks on modified files only for fast feedback.
  """

  @spec validate_staged_changes() :: :ok | {:error, [violation()]}
  def validate_staged_changes do
    with :ok <- compile_check(),
         :ok <- credo_check(),
         :ok <- cascade_pattern_check(),
         :ok <- runtime_noise_check() do
      :ok
    end
  end

  defp compile_check do
    case System.cmd("mix", ["compile", "--warnings-as-errors"]) do
      {_, 0} -> :ok
      {output, _} -> {:error, {:compilation_warnings, output}}
    end
  end

  defp runtime_noise_check do
    staged_files = get_staged_files()

    violations =
      staged_files
      |> Enum.flat_map(&scan_for_noise_patterns/1)

    case violations do
      [] -> :ok
      found -> {:error, {:runtime_noise, found}}
    end
  end

  defp scan_for_noise_patterns(file) do
    patterns = [
      {~r/IO\.inspect/, "IO.inspect residue"},
      {~r/IO\.puts/, "IO.puts debug output"},
      {~r/dbg\(/, "dbg() macro"},
      {~r/Logger\.debug\(/, "Ungated debug logging"},
      {~r/Logger\.info\("Processing/, "Routine info logging noise"}
    ]

    file
    |> File.read!()
    |> String.split("\n")
    |> Enum.with_index(1)
    |> Enum.flat_map(fn {line, num} ->
      Enum.filter(patterns, fn {pattern, _desc} -> Regex.match?(pattern, line) end)
      |> Enum.map(fn {_pattern, desc} -> %{file: file, line: num, violation: desc} end)
    end)
  end
end
```

### Layer 5: CI/CD Quality Gates

The [GitLab CI](@/glossary/gitlab-ci.md) pipeline runs the complete Clean Run validation suite on every push, including full compilation, complete Credo analysis, full Dialyzer run, and test suite execution. This catches any violations that might have slipped past local pre-commit hooks due to environment differences.

### Layer 6: Quality Floor Guardian

The Quality Floor Guardian continuously monitors the platform's quality metrics, including Clean Run compliance. If a regression is detected, the Guardian triggers an [AutoHeal](@/glossary/autoheal.md) intervention and escalates according to severity.

| Quality Score | Level | Response |
|---------------|-------|----------|
| 100-99% | OPTIMAL | Monitor only |
| 98-99% | WARNING | Alert + investigation |
| 95-98% | CRITICAL | Auto-evolution trigger |
| <95% | EMERGENCY | Block commits + escalate |

## Runtime Silence

Clean Run extends beyond compilation to runtime behavior. The standard requires that application code produces no extraneous log output during normal operation.

- **No debug-level logs in production code**: Debug logging must be explicitly gated behind configuration flags
- **No info-level noise**: Routine operations should not produce info-level log output; info is reserved for significant state changes
- **No IO.inspect residue**: Development debugging calls must be removed before commit
- **No dbg() calls**: Elixir's debug macro must not appear in committed code
- **Intentional logging only**: Every log statement must serve a documented purpose at an appropriate level

```elixir
# VIOLATION: Runtime noise
def process(data) do
  IO.inspect(data, label: "processing")  # Debug residue
  Logger.info("Processing data")          # Noise: routine operation
  Logger.debug("Data: #{inspect(data)}")  # Ungated debug output
  do_work(data)
end

# CLEAN: Intentional logging only
def process(data) do
  case do_work(data) do
    {:ok, result} ->
      {:ok, result}

    {:error, reason} ->
      Logger.warning("Processing failed: #{inspect(reason)}", module: __MODULE__)
      {:error, reason}
  end
end
```

This runtime silence standard ensures that when log output does appear, it signals a genuine event worth investigating -- not routine operational noise that gets ignored.

## Implementation Details

### The Nuclear Cache Fix

One of the most critical aspects of maintaining Clean Run in a large umbrella project is handling stale compilation artifacts. Elixir's incremental compilation system can sometimes produce false positives (warnings from stale code) or false negatives (masking warnings from cached artifacts). The Nuclear Cache Fix addresses this by performing a complete artifact purge.

```bash
# Nuclear Cache Fix - use when incremental compilation produces inconsistent results
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
mix compile --warnings-as-errors --force
```

This operation is expensive (full recompilation of the entire umbrella) but guarantees accurate warning detection. The [AutoHeal](@/glossary/autoheal.md) system triggers this operation automatically when inconsistent compilation results are detected.

### Automated Clean Run Validation

```elixir
defmodule PrismaticSafety.CleanRunValidator do
  @moduledoc """
  Comprehensive Clean Run validation combining all enforcement
  layers into a single verification pipeline. Used by quality
  gates, CI/CD, and the Quality Floor Guardian.
  """

  @type validation_result :: %{
    compilation: :pass | :fail,
    credo: :pass | :fail,
    dialyzer: :pass | :fail,
    runtime_noise: :pass | :fail,
    overall: :pass | :fail,
    violations: [violation()],
    duration_ms: non_neg_integer()
  }

  @spec validate() :: {:ok, validation_result()} | {:error, validation_result()}
  def validate do
    start = System.monotonic_time(:millisecond)

    results = %{
      compilation: run_compilation_check(),
      credo: run_credo_check(),
      dialyzer: run_dialyzer_check(),
      runtime_noise: run_noise_scan()
    }

    violations = collect_violations(results)
    overall = if Enum.empty?(violations), do: :pass, else: :fail
    duration = System.monotonic_time(:millisecond) - start

    result = Map.merge(results, %{
      overall: overall,
      violations: violations,
      duration_ms: duration
    })

    case overall do
      :pass -> {:ok, result}
      :fail -> {:error, result}
    end
  end

  defp run_compilation_check do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_, 0} -> :pass
      _ -> :fail
    end
  end
end
```

## Scope and Scale

Clean Run is enforced uniformly across the entire platform.

| Metric | Value |
|--------|-------|
| **Umbrella Applications** | 115 (all compliant) |
| **Elixir Source Files** | 6,652+ `.ex` files |
| **Total Elixir Files** | 13,223+ (including `.exs`) |
| **Compiler Warnings** | 0 (zero) |
| **Credo Violations** | 0 (zero) |
| **Dialyzer Violations** | 0 (zero) |
| **Quality Score** | 100/100 (PERFECT) |
| **Quality Domains Clean** | 13/13 (ALL) |
| **Lines of Code** | ~2.8M LOC |
| **QDP (Quality Debt Points)** | 0 (zero) |

Maintaining zero warnings across this scale is not trivial. Every new module, every dependency update, and every refactoring must preserve the Clean Run standard. The [CASCADE](@/glossary/cascade.md) methodology and [AutoEvolve](@/glossary/autoevolve.md) system work together to detect and eliminate warnings as they arise, maintaining the standard automatically rather than through manual vigilance.

## Relationship to QDP

Clean Run compliance is directly connected to the platform's [QDP](@/glossary/qdp.md) (Quality Debt Points) metric. Each compiler warning, Credo violation, or Dialyzer error contributes to QDP accumulation. The [CASCADE](@/glossary/cascade.md) methodology eliminated 905 QDP to achieve the current 0 QDP state, and Clean Run enforcement prevents new QDP from accumulating.

The relationship is bidirectional: Clean Run enforcement prevents QDP introduction, and QDP elimination (through CASCADE) is necessary to achieve Clean Run status. A codebase with accumulated quality debt cannot achieve Clean Run until that debt is systematically eliminated.

## Relationship to NO MERCY Doctrine

Clean Run is one of the primary enforcement mechanisms of the [NO MERCY](@/glossary/no-mercy.md) doctrine's quality requirements. The doctrine mandates zero tolerance for incomplete implementations, all quality gates must pass before any merge, no excuses for deferred fixes, and every line of code must be production-ready from the moment of creation.

Clean Run operationalizes these principles at the compilation and static analysis level. A warning is an incomplete implementation. A Credo violation is a quality gate failure. Runtime log noise is deferred cleanup. Clean Run converts these doctrine principles into automated enforcement that operates without human judgment or intervention.

## Integration with Platform Systems

### AutoHeal Integration

The [AutoHeal](@/glossary/autoheal.md) system monitors Clean Run status and automatically intervenes when regressions are detected. AutoHeal maintains the Dialyzer PLT incrementally, triggers Nuclear Cache Fix operations when needed, and generates fix suggestions for common warning patterns.

### AutoEvolve Integration

The [AutoEvolve](@/glossary/autoevolve.md) system uses Clean Run as a baseline quality indicator. When the platform evolves (new modules, refactored code, updated dependencies), AutoEvolve verifies that the evolution maintains Clean Run compliance and triggers corrective action if violations are detected.

### Quality DNA Persistence

Clean Run status is recorded in each application's Quality DNA file (`.claude/quality-dna/current-state.json`), providing cross-session continuity. When a new Claude session begins, it can immediately verify whether the platform's Clean Run status has changed since the last session.

## Best Practices

1. **Enable Early**: Activate `--warnings-as-errors` from the beginning of a project, not retroactively. Retrofitting zero-warning enforcement onto a codebase with hundreds of existing warnings requires a dedicated elimination campaign.

2. **Force Full Recompilation**: Run `mix compile --warnings-as-errors --force` periodically (especially before commits) to catch warnings that incremental compilation misses due to stale artifacts.

3. **Treat Test Code Equally**: Apply the same Clean Run standards to test files as production code. Test code with warnings degrades over time and becomes unreliable.

4. **Monitor Continuously**: Use the Quality Floor Guardian to detect warning regressions between explicit checks. Continuous monitoring catches issues faster than periodic manual checks.

5. **Log at Appropriate Levels**: Reserve `Logger.warning` for conditions that warrant operator attention, `Logger.error` for failures, and eliminate routine `Logger.info` calls that produce operational noise.

6. **Nuclear Cache Fix When in Doubt**: When compilation results seem inconsistent, perform a full artifact purge and recompile. The cost of a clean recompilation is always less than the cost of debugging a false positive or missing a real warning.

## Common Pitfalls

- **Suppressing warnings instead of fixing them**: Using `@dialyzer {:nowarn_function, ...}` or `# credo:disable-for-next-line` to silence warnings without addressing the underlying issue defeats the purpose of Clean Run.

- **Dependency warnings**: Third-party dependencies may produce warnings that the platform cannot fix. These must be addressed through dependency updates, forks with fixes, or documented exceptions with tracking issues.

- **Incremental compilation false negatives**: Relying solely on incremental compilation for Clean Run validation. Stale artifacts can mask warnings. Always use `--force` for authoritative checks.

- **Test-only warnings**: Ignoring warnings in test files because they are "just tests." Test code quality directly impacts test reliability and maintainability.

## Use Cases

- **Pre-Commit Validation**: Enforcing zero warnings before any code enters the repository, preventing quality debt accumulation
- **CI/CD Quality Gates**: Blocking merges that introduce warnings, Credo violations, or Dialyzer errors
- **Platform Quality Scoring**: Contributing to the 100/100 quality score across 13 quality domains
- **Deployment Confidence**: Ensuring production releases are built from warning-free codebases
- **Developer Discipline**: Maintaining a culture where warnings are treated as errors, keeping the signal-to-noise ratio at maximum
- **Operational Clarity**: Ensuring production log output contains only genuine events warranting attention

## Related Concepts

- [CASCADE](@/glossary/cascade.md) -- Methodology that eliminated 905 QDP to achieve Clean Run
- [CASCADE Pattern](@/glossary/cascade-pattern.md) -- Specific anti-patterns that violated Clean Run
- [QDP](@/glossary/qdp.md) -- Quality Debt Points prevented by Clean Run enforcement
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis tool contributing to zero-violation standard
- [Credo](@/glossary/credo.md) -- Static analysis tool enforcing code quality rules
- [Typespec](@/glossary/typespec.md) -- Type annotations validated as part of Clean Run
- [AutoEvolve](@/glossary/autoevolve.md) -- Evolution system maintaining Clean Run through automatic detection
- [AutoHeal](@/glossary/autoheal.md) -- Self-repair system triggered by Clean Run regressions
- [Mix](@/glossary/mix.md) -- Build tool executing Clean Run compilation checks
- [Code Coverage](@/glossary/code-coverage.md) -- Coverage metric complementing Clean Run quality checks
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Testing technique validating Clean Run fixes
- [Quality Gates](@/glossary/quality-gates.md) -- Enforcement pipeline incorporating Clean Run checks

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform quality capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
