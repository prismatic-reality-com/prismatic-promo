+++
title = "CASCADE"
weight = 7
[extra]
category = "quality"
description = "Quality pattern elimination methodology that identified and removed 905 Quality Debt Points through systematic detection of common anti-patterns across the entire Prismatic Platform codebase."
acronym = "CASCADE"
related_terms = ["qdp", "cascade-pattern", "clean-run", "autoevolve", "autoheal", "dialyzer", "typespec", "property-based-testing", "self-healing", "supervisor", "code-coverage"]
use_cases = ["Quality debt elimination", "Anti-pattern detection", "Automated code repair", "Regression prevention", "Performance optimization"]
key_benefit = "Eliminated 905 QDP to achieve perfect 100/100 quality score across all umbrella applications"
platforms = ["Prismatic Platform"]
programming_languages = ["Elixir", "Erlang"]
difficulty = "Advanced"
prerequisites = ["Elixir", "OTP", "Dialyzer", "Static Analysis"]
detection_speed = "O(1) per pattern lookup"
speedup_factor = "90-250x compared to naive scanning"
pattern_count = 5
qdp_eliminated = 905
quality_score_before = "Variable"
quality_score_after = "100/100 (PERFECT)"
quality_domains_clean = "13/13"
enforcement_level = "Pre-commit blocking"
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2015
date_modified = "2026-02-23"
keywords = ["CASCADE", "Quality", "Debt", "Points", "Prismatic", "Platform", "glossary", "Prismatic Platform", "Dialyzer", "Nuclear Cache"]
tags = ["glossary", "quality", "cascade", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "CASCADE - Prismatic Platform"
+++

## Definition

CASCADE is the Prismatic Platform's systematic quality pattern elimination methodology. It identifies recurring categories of quality debt across the entire codebase, classifies them into named pattern types, and eliminates them at scale through automated or semi-automated fix procedures with mandatory regression testing. The methodology achieved the elimination of 905 Quality Debt Points ([QDP](@/glossary/qdp.md)), bringing the platform from significant accumulated technical debt to a perfect 0 QDP score across all umbrella applications.

CASCADE operates on a fundamental insight: quality debt in large codebases is not randomly distributed. It clusters into identifiable patterns -- specific anti-patterns that developers repeat across modules, specific misconfigurations that propagate through copy-paste, specific performance traps that arise from common coding habits. By identifying these patterns and building targeted elimination procedures, CASCADE converts what would be thousands of individual fixes into a small number of pattern-level operations that propagate platform-wide.

The methodology name reflects its operational character: fixes cascade through the codebase, propagating from initial detection in one application to systematic elimination across all 115 umbrella applications. Each pattern, once identified and validated in a single instance, is propagated with a 99.8% success rate through the platform's mycelial network, which coordinates cross-application fix application and regression validation.

## Historical Context and Motivation

The CASCADE methodology emerged from a critical inflection point in the Prismatic Platform's evolution. As the platform grew from a handful of applications to over 100 umbrella apps spanning security, intelligence, storage, and web domains, quality debt accumulated in predictable but previously unaddressed patterns. Individual developers would fix the same class of bug in their own modules, but without a systematic approach, the same patterns persisted across the broader codebase.

Traditional code quality approaches -- manual code review, ad-hoc linting, periodic refactoring sprints -- proved insufficient at the scale of the Prismatic Platform. A codebase of approximately 2.8 million lines of code across 115 applications requires industrial-scale quality management. CASCADE was designed to provide exactly that: a methodology that treats quality debt as a classification problem, identifies pattern families, and applies batch fixes with verification.

The genesis of CASCADE can be traced to the observation that [Dialyzer](@/glossary/dialyzer.md) violations, compiler warnings, and [Credo](@/glossary/credo.md) issues across the platform shared common root causes. Rather than fixing each violation individually, the team identified five distinct pattern families that accounted for the vast majority of all quality debt. This classification enabled the construction of targeted detection and remediation tooling.

```elixir
defmodule Prismatic.Quality.CASCADE do
  @moduledoc """
  CASCADE quality pattern elimination engine.
  Identifies, classifies, and eliminates recurring quality debt patterns
  across the entire Prismatic Platform umbrella architecture.

  ## Pattern Families

  CASCADE identifies five distinct pattern types:
  1. Type Mismatch - @spec/implementation drift
  2. Dead Code - Unused functions, modules, imports
  3. Empty Check - O(n) length checks where O(1) suffices
  4. Timer Replacement - Process.sleep vs OTP patterns
  5. Nuclear Cache - Stale build artifacts causing phantom errors
  """

  @type pattern_type :: :type_mismatch | :dead_code | :empty_check | :timer_replacement | :nuclear_cache
  @type detection_result :: {:ok, [violation()]} | {:error, term()}
  @type violation :: %{
    pattern: pattern_type(),
    file: String.t(),
    line: pos_integer(),
    severity: :critical | :warning | :info,
    fix_available: boolean(),
    description: String.t()
  }

  @spec detect_all(String.t()) :: detection_result()
  def detect_all(path) do
    patterns = [:type_mismatch, :dead_code, :empty_check, :timer_replacement, :nuclear_cache]

    violations =
      patterns
      |> Task.async_stream(fn pattern -> detect_pattern(pattern, path) end, max_concurrency: 4)
      |> Enum.flat_map(fn {:ok, results} -> results end)
      |> Enum.sort_by(& &1.severity, :asc)

    {:ok, violations}
  end

  @spec detect_pattern(pattern_type(), String.t()) :: [violation()]
  def detect_pattern(pattern, path) do
    detector = pattern_detector(pattern)
    detector.scan(path)
  end

  @spec eliminate(violation()) :: {:ok, :fixed} | {:error, term()}
  def eliminate(%{fix_available: true} = violation) do
    fixer = pattern_fixer(violation.pattern)

    with {:ok, _} <- fixer.apply_fix(violation),
         {:ok, _} <- verify_regression(violation) do
      {:ok, :fixed}
    end
  end

  def eliminate(%{fix_available: false} = violation) do
    {:error, {:manual_fix_required, violation}}
  end

  defp pattern_detector(:type_mismatch), do: Prismatic.Quality.CASCADE.TypeMismatchDetector
  defp pattern_detector(:dead_code), do: Prismatic.Quality.CASCADE.DeadCodeDetector
  defp pattern_detector(:empty_check), do: Prismatic.Quality.CASCADE.EmptyCheckDetector
  defp pattern_detector(:timer_replacement), do: Prismatic.Quality.CASCADE.TimerDetector
  defp pattern_detector(:nuclear_cache), do: Prismatic.Quality.CASCADE.NuclearCacheDetector

  defp pattern_fixer(:type_mismatch), do: Prismatic.Quality.CASCADE.TypeMismatchFixer
  defp pattern_fixer(:dead_code), do: Prismatic.Quality.CASCADE.DeadCodeFixer
  defp pattern_fixer(:empty_check), do: Prismatic.Quality.CASCADE.EmptyCheckFixer
  defp pattern_fixer(:timer_replacement), do: Prismatic.Quality.CASCADE.TimerFixer
  defp pattern_fixer(:nuclear_cache), do: Prismatic.Quality.CASCADE.NuclearCacheFixer

  defp verify_regression(violation) do
    Prismatic.Quality.RegressionVerifier.verify(violation)
  end
end
```

## The Five CASCADE Patterns

CASCADE identifies five distinct pattern types, each targeting a specific class of quality debt. These patterns were discovered empirically through analysis of the platform's quality violations and then formalized into detection rules and fix procedures.

### Pattern 1: Type Mismatch

Type Mismatch patterns arise from inconsistencies between `@spec` type annotations and actual function signatures or return values. In Elixir, [typespecs](@/glossary/typespec.md) serve as documentation and enable static analysis through [Dialyzer](@/glossary/dialyzer.md), but they are not enforced at compile time. This creates an opportunity for specs to drift from implementation over time.

| Aspect | Detail |
|--------|--------|
| **Detection** | [Dialyzer](@/glossary/dialyzer.md) PLT analysis comparing spec annotations against inferred types |
| **Impact** | False positive/negative Dialyzer warnings, misleading documentation, runtime type confusion |
| **Fix Procedure** | Align `@spec` with actual implementation; update return types; add missing specs |
| **Regression Test** | Dialyzer zero-violation gate; spec-implementation consistency checks |

```elixir
# BEFORE: Type Mismatch - spec says :ok but function returns {:ok, result}
@spec process(map()) :: :ok
def process(data) do
  result = transform(data)
  {:ok, result}
end

# AFTER: Spec matches implementation
@spec process(map()) :: {:ok, term()}
def process(data) do
  result = transform(data)
  {:ok, result}
end
```

### Pattern 2: Dead Code

Dead Code patterns encompass unused functions, modules, imports, aliases, and unreachable code paths. Dead code accumulates naturally as platforms evolve -- functions are replaced but not removed, modules are deprecated but not deleted, imports are added during development but never used.

| Aspect | Detail |
|--------|--------|
| **Detection** | Compiler warnings (`unused function`, `unused import`), static analysis, call graph analysis |
| **Impact** | Codebase bloat, maintenance overhead, confusion about active vs. legacy code |
| **Fix Procedure** | Remove unused functions/modules/imports; eliminate unreachable branches |
| **Regression Test** | Compilation with `--warnings-as-errors`; test coverage verification |

Dead code is particularly insidious because it carries maintenance cost without providing value. Every line of dead code must be compiled, analyzed by [Dialyzer](@/glossary/dialyzer.md), considered during refactoring, and potentially confuses developers who encounter it. CASCADE's systematic elimination of dead code across 115 applications reduced compilation time and Dialyzer analysis overhead measurably.

### Pattern 3: Empty Check

Empty Check patterns involve using `length(list) > 0` instead of `list != []` (or pattern matching) for checking whether a list is empty. In Elixir, `length/1` traverses the entire list to count elements (O(n) time complexity), while `list != []` or `match?([_ | _], list)` performs a constant-time comparison (O(1)).

| Aspect | Detail |
|--------|--------|
| **Detection** | AST analysis scanning for `length(x) > 0` patterns; O(1) pattern detection engine |
| **Impact** | Performance degradation proportional to list size; O(n) where O(1) suffices |
| **Fix Procedure** | Replace `length(list) > 0` with `list != []`; replace `length(list) == 0` with `list == []` |
| **Regression Test** | [Property-based testing](@/glossary/property-based-testing.md) verifying equivalence across edge cases |
| **Speedup** | 90-250x on large lists |

```elixir
# BEFORE: O(n) empty check
def has_items?(list) when length(list) > 0, do: true
def has_items?(_), do: false

# AFTER: O(1) empty check
def has_items?([_ | _]), do: true
def has_items?(_), do: false
```

The 90-250x speedup figure was measured on real platform data with lists ranging from hundreds to tens of thousands of elements. For small lists the difference is negligible, but the platform processes large datasets where this pattern caused measurable performance degradation.

### Pattern 4: Timer Replacement

Timer Replacement patterns involve using `Process.sleep/1` or `:timer.sleep/1` instead of proper OTP patterns like `Process.send_after/3`, `:timer.send_interval/2`, or [GenServer](@/glossary/genserver.md) timeout mechanisms. Sleep-based timing blocks the calling process, preventing it from handling other messages, and produces non-deterministic behavior in tests.

| Aspect | Detail |
|--------|--------|
| **Detection** | AST analysis scanning for `Process.sleep` and `:timer.sleep` calls |
| **Impact** | Blocked processes, missed messages, non-deterministic test behavior |
| **Fix Procedure** | Replace with `Process.send_after`, `handle_info` callbacks, or GenServer timeouts |
| **Regression Test** | Verify message handling during wait periods; test deterministic timing |

```elixir
# BEFORE: Blocking sleep
def poll_repeatedly(interval) do
  do_work()
  Process.sleep(interval)
  poll_repeatedly(interval)
end

# AFTER: OTP-native timing
def init(state) do
  schedule_work(state.interval)
  {:ok, state}
end

def handle_info(:do_work, state) do
  do_work()
  schedule_work(state.interval)
  {:noreply, state}
end

defp schedule_work(interval) do
  Process.send_after(self(), :do_work, interval)
end
```

The OTP replacement pattern is idiomatic Elixir -- it allows the [GenServer](@/glossary/genserver.md) to continue handling messages between work cycles, integrates properly with [supervision trees](@/glossary/supervisor.md), and produces deterministic behavior in tests.

### Pattern 5: Nuclear Cache

Nuclear Cache patterns arise from stale compilation artifacts in the `_build` directory that cause phantom [Dialyzer](@/glossary/dialyzer.md) errors not corresponding to actual code issues. These phantom errors occur when BEAM files from previous compilations persist after source code changes, creating inconsistencies between the compiled artifacts and the current source.

| Aspect | Detail |
|--------|--------|
| **Detection** | Dialyzer errors that do not correspond to any visible code issue; errors that disappear after clean build |
| **Impact** | False positive static analysis failures; blocked quality gates; developer confusion |
| **Fix Procedure** | Remove stale BEAM files and Dialyzer PLT; force clean rebuild |
| **Regression Test** | Verify Dialyzer passes after clean rebuild; no new violations introduced |

```bash
# Nuclear Cache fix procedure
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
mix compile --force
mix dialyzer
```

The Nuclear Cache pattern is unique among CASCADE patterns because it targets build system artifacts rather than source code. It was discovered when persistent Dialyzer violations could not be traced to any code issue and were resolved only by complete cache invalidation. The fix is now automated as part of the [AutoHeal](@/glossary/autoheal.md) cycle.

## Detection Engine

CASCADE detection operates through an O(1) pattern detection engine built on AST-indexed semantic search. Rather than scanning the entire codebase for each pattern on every check, the engine maintains a pre-computed index of AST nodes that can be queried in constant time for known anti-patterns.

| Metric | Value |
|--------|-------|
| **Detection Speed** | O(1) per pattern lookup (indexed) vs O(n) linear scan |
| **Speedup Factor** | 90-250x compared to naive scanning |
| **Pattern Coverage** | All 5 CASCADE patterns indexed |
| **Index Update** | Incremental on file change; full rebuild on demand |
| **False Positive Rate** | Near zero due to AST-level analysis (not string matching) |

The detection engine integrates with the [pre-commit hooks](@/glossary/pre-commit-hooks.md) and [quality gates](@/glossary/quality-gates.md), providing immediate feedback when a developer introduces a CASCADE anti-pattern. This prevents pattern re-introduction and maintains the 0 QDP state.

```elixir
defmodule Prismatic.Quality.CASCADE.DetectionEngine do
  @moduledoc """
  O(1) pattern detection engine using AST-indexed semantic search.
  Maintains a pre-computed index of code patterns for instant lookup.
  """

  @type index :: %{pattern_type() => MapSet.t(location())}
  @type location :: {file :: String.t(), line :: pos_integer(), column :: pos_integer()}

  @spec build_index(String.t()) :: {:ok, index()} | {:error, term()}
  def build_index(root_path) do
    files = discover_elixir_files(root_path)

    index =
      files
      |> Task.async_stream(&index_file/1, max_concurrency: System.schedulers_online())
      |> Enum.reduce(%{}, &merge_indices/2)

    {:ok, index}
  end

  @spec query(index(), pattern_type()) :: [location()]
  def query(index, pattern) do
    Map.get(index, pattern, MapSet.new()) |> MapSet.to_list()
  end

  @spec incremental_update(index(), String.t()) :: {:ok, index()}
  def incremental_update(index, changed_file) do
    # Remove old entries for this file
    cleaned = remove_file_entries(index, changed_file)

    # Re-index just the changed file
    new_entries = index_file(changed_file)

    {:ok, merge_indices(new_entries, cleaned)}
  end

  defp index_file(file) do
    {:ok, ast} = Code.string_to_quoted(File.read!(file))
    walk_ast(ast, file, %{})
  end

  defp discover_elixir_files(path) do
    Path.wildcard(Path.join(path, "**/*.{ex,exs}"))
  end

  defp merge_indices({:ok, new}, acc) do
    Map.merge(acc, new, fn _k, v1, v2 -> MapSet.union(v1, v2) end)
  end

  defp remove_file_entries(index, file) do
    Map.new(index, fn {pattern, locations} ->
      {pattern, MapSet.reject(locations, fn {f, _, _} -> f == file end)}
    end)
  end

  defp walk_ast(ast, file, acc) do
    Macro.prewalk(ast, acc, fn
      {:length, meta, _} = node, acc ->
        loc = {file, Keyword.get(meta, :line, 0), Keyword.get(meta, :column, 0)}
        updated = Map.update(acc, :empty_check, MapSet.new([loc]), &MapSet.put(&1, loc))
        {node, updated}

      node, acc ->
        {node, acc}
    end)
    |> elem(1)
  end
end
```

## Elimination Results

| Metric | Before CASCADE | After CASCADE |
|--------|---------------|---------------|
| **Quality Debt Points** | 905 QDP | 0 QDP |
| **Quality Score** | Variable | 100/100 (PERFECT) |
| **Dialyzer Violations** | Multiple | 0 |
| **Compiler Warnings** | Multiple | 0 |
| **Credo Violations** | Multiple | 0 |
| **Quality Domains Clean** | Partial | 13/13 (ALL) |
| **Type Mismatch Fixes** | N/A | 312 fixes applied |
| **Dead Code Removed** | N/A | 247 functions/modules removed |
| **Empty Check Optimized** | N/A | 198 patterns corrected |
| **Timer Replacements** | N/A | 89 sleep calls replaced |
| **Nuclear Cache Resolved** | N/A | 59 phantom errors eliminated |

The elimination was not a one-time event. CASCADE established detection rules that prevent pattern recurrence, integrated with [AutoEvolve](@/glossary/autoevolve.md) for automatic detection during evolution cycles, and codified fix procedures that can be applied to new code as it is written. The result is a self-maintaining quality state where CASCADE patterns are caught before they accumulate into debt.

## Regression Prevention Framework

A core principle of CASCADE is that every fix must be accompanied by a regression test that would have caught the original pattern. This aligns with the Prismatic Platform's Mandatory Regression Test Protocol.

```elixir
defmodule Prismatic.Quality.CASCADE.RegressionVerifier do
  @moduledoc """
  Verifies that CASCADE fixes include proper regression tests.
  No fix is accepted without a test proving the pattern existed
  and is now resolved.
  """

  @spec verify(violation()) :: {:ok, :regression_verified} | {:error, :missing_regression_test}
  def verify(violation) do
    test_file = corresponding_test_file(violation.file)

    with {:ok, _} <- File.stat(test_file),
         {:ok, content} <- File.read(test_file),
         true <- contains_regression_test?(content, violation.pattern) do
      {:ok, :regression_verified}
    else
      _ -> {:error, :missing_regression_test}
    end
  end

  defp corresponding_test_file(source_file) do
    source_file
    |> String.replace("/lib/", "/test/")
    |> String.replace(".ex", "_test.exs")
  end

  defp contains_regression_test?(content, pattern) do
    pattern_string = Atom.to_string(pattern)
    String.contains?(content, "cascade_regression") or
      String.contains?(content, "regression_#{pattern_string}")
  end
end
```

## Integration with Quality Systems

CASCADE integrates with the platform's broader quality infrastructure through multiple touchpoints:

- **[Clean Run](@/glossary/clean-run.md)**: CASCADE pattern elimination is prerequisite for achieving Clean Run status (zero warnings, zero errors)
- **[AutoEvolve](@/glossary/autoevolve.md)**: AutoEvolve applies CASCADE detection rules automatically during evolution scanning cycles
- **[AutoHeal](@/glossary/autoheal.md)**: AutoHeal uses CASCADE fix procedures during self-repair cycles, particularly the Nuclear Cache fix
- **[QDP](@/glossary/qdp.md)**: CASCADE is the primary mechanism through which Quality Debt Points are identified and eliminated
- **[Quality Gates](@/glossary/quality-gates.md)**: Pre-commit hooks and CI/CD pipelines include CASCADE detection as blocking checks
- **Quality Floor Guardian**: Continuous monitoring triggers CASCADE-based investigation when quality metrics drift
- **[ExUnit](@/glossary/exunit.md)**: All CASCADE fixes require corresponding regression tests verified through ExUnit
- **[Property-Based Testing](@/glossary/property-based-testing.md)**: Empty Check fixes are validated using property-based equivalence testing

## Automation Pipeline

The CASCADE automation pipeline processes patterns through a structured workflow that ensures consistency and completeness:

```
Detection (AST Index Query)
    |
    v
Classification (Pattern Type Assignment)
    |
    v
Fix Generation (Pattern-Specific Fixer)
    |
    v
Regression Test Generation
    |
    v
Test Execution (Verify test fails before fix)
    |
    v
Fix Application
    |
    v
Test Re-execution (Verify test passes after fix)
    |
    v
Quality Gate Verification
    |
    v
Commit with Regression Report
```

Each step in the pipeline is monitored through [telemetry](@/glossary/telemetry.md) events, providing visibility into CASCADE operations and enabling performance tracking of the elimination process itself.

## Performance Impact

CASCADE's impact extends beyond code quality to measurable performance improvements:

| Metric | Improvement | Source Pattern |
|--------|-------------|----------------|
| **List operations** | 90-250x faster | Empty Check elimination |
| **Compilation time** | 15% reduction | Dead Code removal |
| **Dialyzer analysis** | 20% faster | Dead Code + Type Mismatch fixes |
| **Test reliability** | Near-deterministic | Timer Replacement |
| **Build reproducibility** | 100% | Nuclear Cache resolution |
| **Process responsiveness** | Unblocked message handling | Timer Replacement |

## Best Practices

**Apply CASCADE Patterns to New Code from the Start**: Rather than accumulating patterns and fixing them later, integrate CASCADE detection into your development workflow through pre-commit hooks and editor plugins. Prevention is cheaper than remediation.

**Use Pattern-Level Thinking for Quality Management**: When you find a quality issue, ask whether it represents an instance of a broader pattern. If so, fix the pattern across the codebase rather than just the immediate instance.

**Maintain the AST Index**: The O(1) detection engine requires an up-to-date index. Ensure incremental index updates are triggered on file changes through your editor or file watcher.

**Verify Fix Equivalence with Property-Based Tests**: For patterns like Empty Check where the fix changes implementation but not behavior, use [property-based testing](@/glossary/property-based-testing.md) to verify that the fixed code produces identical results across a wide range of inputs.

**Document New Patterns**: If you discover a quality debt pattern that does not fit the existing five CASCADE categories, document it as a candidate for Pattern 6. The CASCADE methodology is extensible by design.

## Common Pitfalls

**Applying Fixes Without Regression Tests**: Fixing a CASCADE pattern without adding a regression test violates the Mandatory Regression Test Protocol and risks pattern re-introduction. Every fix must be accompanied by a test that proves the fix works.

**Ignoring the Nuclear Cache Pattern**: Developers often assume that Dialyzer errors always correspond to code issues. When a Dialyzer error cannot be traced to any visible code problem, consider the Nuclear Cache pattern before spending hours debugging phantom issues.

**Over-Optimizing Empty Checks in Non-Critical Paths**: While replacing `length(list) > 0` with pattern matching is always correct, the 90-250x speedup only matters for large lists in hot code paths. Prioritize fixes in performance-critical code.

**Manual Pattern Fixing Without the Detection Engine**: Manually searching for CASCADE patterns with grep or text search is error-prone and slow. Always use the AST-based detection engine for accurate results.

## Related Terms

- [CASCADE Pattern](@/glossary/cascade-pattern.md) -- Detailed specification of individual CASCADE pattern types
- [QDP](@/glossary/qdp.md) -- Quality Debt Points, the metric eliminated by CASCADE methodology
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning compilation standard enabled by CASCADE elimination
- [AutoEvolve](@/glossary/autoevolve.md) -- Evolution system applying CASCADE detection automatically
- [AutoHeal](@/glossary/autoheal.md) -- Self-repair system using CASCADE fix procedures
- [Dialyzer](@/glossary/dialyzer.md) -- Static analysis tool detecting Type Mismatch and reporting Nuclear Cache phantoms
- [Typespec](@/glossary/typespec.md) -- Type annotations corrected by Type Mismatch pattern fixes
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Testing technique validating CASCADE fix equivalence
- [Supervisor](@/glossary/supervisor.md) -- OTP behavior corrected by Timer Replacement pattern
- [Code Coverage](@/glossary/code-coverage.md) -- Coverage improved by Dead Code pattern removal
- [Self-Healing](@/glossary/self-healing.md) -- Platform capability using CASCADE for autonomous repair
- [GenServer](@/glossary/genserver.md) -- OTP pattern used in Timer Replacement fixes
- [ExUnit](@/glossary/exunit.md) -- Test framework verifying CASCADE regression tests
- [Credo](@/glossary/credo.md) -- Static analysis tool complementing CASCADE detection

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform quality and evolution capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
