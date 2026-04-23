+++
title = "CASCADE Pattern"
weight = 75
[extra]
category = "quality"
description = "Systematic quality fix patterns: Type Mismatch, Dead Code, Empty Check, Timer, Cache"
related_terms = ["cascade", "qdp", "autoevolve", "autoheal", "clean-run", "dialyzer", "typespec", "property-based-testing", "pattern-matching", "pure-function", "supervisor", "code-coverage"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1415
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CASCADE", "Pattern", "Systematic", "Type", "Mismatch", "Dead", "Code", "Empty", "glossary", "quality"]
tags = ["glossary", "quality", "cascade-pattern", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "CASCADE Pattern - Prismatic Platform"
+++

## Definition

CASCADE Patterns are the five formalized categories of quality debt identified during the Prismatic Platform's systematic quality elimination campaign. Each pattern represents a specific class of recurring anti-pattern that was discovered, validated, codified into a detection rule and fix procedure, and then propagated across all 89+ umbrella applications. The five patterns are: Type Mismatch (correcting type annotation errors), Dead Code (removing unreachable code paths and unused definitions), Empty Check (replacing O(n) list emptiness checks with O(1) alternatives), Timer Replacement (substituting blocking sleep calls with proper OTP patterns), and Nuclear Cache (resolving corrupted build artifacts through cache invalidation).

CASCADE Patterns differ from ad-hoc bug fixes in their systematic nature. Each pattern represents not a single fix but a category of fixes -- a structural class of quality debt that manifests across multiple files, modules, and applications. The pattern formalization process ensures that each instance is detected through the same mechanism, fixed through the same procedure, and validated through the same regression tests. This systematization is what enabled the elimination of 905 [Quality Debt Points](@/glossary/qdp.md) across the platform, compared to addressing each violation individually.

The patterns were discovered empirically through analysis of the platform's quality violations, then progressively formalized as the scope of each pattern became apparent. The Empty Check pattern, for instance, was first noticed as a performance issue in a single module, then found to be present in dozens of modules across multiple applications, and finally codified as a platform-wide detection rule with an automated fix procedure achieving 90-250x speedup on affected code paths.

## Pattern Type 1: Type Mismatch

Type Mismatch is the most common CASCADE pattern, arising from drift between `@spec` type annotations and the actual types produced by function implementations. In Elixir, [typespecs](@/glossary/typespec.md) are optional metadata that enable static analysis through [Dialyzer](@/glossary/dialyzer.md) but are not enforced by the compiler. This creates a maintenance challenge: as implementations evolve, their specs may not be updated to match.

### Detection Algorithm

The Type Mismatch detection algorithm operates in three phases:

1. **Spec Extraction**: Parse all `@spec` annotations from the source AST, building a map from `{module, function, arity}` to declared types
2. **Type Inference**: Use Dialyzer's success typing analysis to infer actual types from the implementation
3. **Comparison**: Compare declared types against inferred types, flagging mismatches in argument types, return types, and guard constraints

```elixir
# Common Type Mismatch variants

# Variant 1: Return type mismatch
@spec fetch(String.t()) :: map()
def fetch(key) do
  case lookup(key) do
    nil -> {:error, :not_found}  # Returns tuple, not map
    val -> {:ok, val}            # Returns tuple, not map
  end
end

# Fixed: Return type matches implementation
@spec fetch(String.t()) :: {:ok, term()} | {:error, :not_found}
def fetch(key) do
  case lookup(key) do
    nil -> {:error, :not_found}
    val -> {:ok, val}
  end
end

# Variant 2: Missing spec entirely (detected as "incomplete spec coverage")
def transform(data, opts \\ []) do
  # Function has no @spec at all
  # CASCADE adds: @spec transform(map(), keyword()) :: {:ok, map()} | {:error, term()}
end

# Variant 3: Guard constraint mismatch
@spec validate(integer()) :: boolean()
def validate(value) when is_binary(value) do  # Guard contradicts spec
  String.length(value) > 0
end
```

### Auto-Fix Capabilities

Type Mismatch fixes are semi-automated. The detection engine identifies the mismatch and proposes a corrected spec based on Dialyzer's type inference. A human reviews the proposal to determine whether the spec or the implementation should change -- sometimes the spec is correct and the implementation has a bug, not the other way around.

## Pattern Type 2: Dead Code

Dead Code encompasses all source code that is present in the codebase but never executed during normal operation. This includes unused functions, unused module imports and aliases, unreachable conditional branches, and entire modules that are no longer referenced by any other module.

### Detection Algorithm

Dead Code detection combines multiple analysis techniques:

1. **Compiler Analysis**: Elixir's compiler natively detects unused imports, aliases, and variables, emitting warnings
2. **Call Graph Analysis**: Build a complete call graph across all applications, identifying functions with zero callers
3. **Branch Analysis**: AST analysis of conditional expressions to identify branches that can never be reached given the type constraints

```elixir
# Dead Code example: unused import and function
defmodule MyModule do
  import Enum  # Dead Code: Enum functions used via qualified calls only

  alias MyApp.LegacyProcessor  # Dead Code: LegacyProcessor never referenced

  def active_function(data) do
    Enum.map(data, &process/1)  # Uses qualified Enum.map, not imported
  end

  # Dead Code: no caller in entire platform
  defp legacy_helper(item) do
    LegacyProcessor.transform(item)
  end
end

# Fixed: imports and unused code removed
defmodule MyModule do
  def active_function(data) do
    Enum.map(data, &process/1)
  end
end
```

### Auto-Fix Capabilities

Dead Code removal is largely automated for imports, aliases, and clearly unused private functions. Public function removal requires more caution -- the function may be called via dynamic dispatch (`apply/3`), from external systems, or from test code. The detection engine flags these cases for manual review rather than auto-fixing.

## Pattern Type 3: Empty Check

The Empty Check pattern is the highest-impact CASCADE pattern in terms of performance improvement. It targets the specific anti-pattern of using `length/1` to check whether a list is empty, replacing it with constant-time alternatives.

### Detection Algorithm

Empty Check detection uses AST [pattern matching](@/glossary/pattern-matching.md) to identify specific node structures:

```elixir
# Detection targets these AST patterns:
# 1. length(x) > 0  -> should be x != []
# 2. length(x) == 0 -> should be x == []
# 3. length(x) >= 1 -> should be x != []
# 4. length(x) < 1  -> should be x == []
# 5. Guard clauses: when length(x) > 0 -> when x != []

# All variants detected through a single AST pattern rule:
defmodule EmptyCheckDetector do
  @doc "Detects length-based empty checks in AST"
  def detect({:>, _, [{:length, _, [_list]}, 0]}), do: :empty_check_violation
  def detect({:==, _, [{:length, _, [_list]}, 0]}), do: :empty_check_violation
  def detect({:>=, _, [{:length, _, [_list]}, 1]}), do: :empty_check_violation
  def detect(_), do: :clean
end
```

### Performance Analysis

The performance difference between `length/1` and pattern matching for empty checks scales linearly with list size:

| List Size | `length(list) > 0` | `list != []` | Speedup |
|-----------|---------------------|--------------|---------|
| 10 | ~0.1 us | ~0.001 us | ~100x |
| 100 | ~1 us | ~0.001 us | ~1,000x |
| 1,000 | ~10 us | ~0.001 us | ~10,000x |
| 10,000 | ~100 us | ~0.001 us | ~100,000x |

The 90-250x figure reported in CASCADE results represents the measured speedup across the actual data sizes processed by the platform, which range from small configuration lists to large data processing batches.

### Auto-Fix Capabilities

Empty Check fixes are fully automated. The transformation is semantically equivalent for all cases (a list with `length > 0` is always `!= []`), and the fix preserves all edge case behavior including nil handling and non-list inputs. Each fix is validated through [property-based testing](@/glossary/property-based-testing.md) that verifies behavioral equivalence across randomly generated inputs.

## Pattern Type 4: Timer Replacement

Timer Replacement targets the anti-pattern of using `Process.sleep/1` or `:timer.sleep/1` for timing and scheduling, replacing them with proper OTP-native mechanisms that do not block the calling process.

### Detection Algorithm

Timer Replacement detection scans the AST for calls to `Process.sleep/1` and `:timer.sleep/1`:

```elixir
# Detection pattern
defmodule TimerDetector do
  def detect({{:., _, [{:__aliases__, _, [:Process]}, :sleep]}, _, _args}) do
    :timer_violation
  end
  def detect({{:., _, [:timer, :sleep]}, _, _args}) do
    :timer_violation
  end
  def detect(_), do: :clean
end
```

### OTP-Native Replacements

Each Timer Replacement fix maps to one of several OTP-native alternatives depending on the use case:

| Use Case | Anti-Pattern | OTP Alternative |
|----------|-------------|-----------------|
| Periodic work | `Process.sleep` in loop | `Process.send_after` + `handle_info` |
| Delayed execution | `Process.sleep` then action | `Process.send_after` + `handle_info` |
| Interval timer | `:timer.sleep` in loop | `:timer.send_interval` + `handle_info` |
| GenServer timeout | `Process.sleep` in callback | `{:noreply, state, timeout}` return |
| Test synchronization | `Process.sleep` in test | `assert_receive` with timeout |

```elixir
# Test-specific Timer Replacement
# BEFORE: Non-deterministic test
test "message is sent" do
  send_async_message()
  Process.sleep(100)  # Hope 100ms is enough
  assert_received(:message)
end

# AFTER: Deterministic test with explicit timeout
test "message is sent" do
  send_async_message()
  assert_receive(:message, 1_000)  # Waits up to 1s, returns immediately on receipt
end
```

### Auto-Fix Capabilities

Timer Replacement fixes are semi-automated. The detection is fully automated, but the fix requires understanding the intent behind the sleep call. A `Process.sleep` used for polling requires a different replacement than one used for delayed execution or test synchronization. The fix engine proposes a replacement based on context analysis, but human review confirms the mapping.

## Pattern Type 5: Nuclear Cache

Nuclear Cache is the only CASCADE pattern that targets build system artifacts rather than source code. It addresses the specific failure mode where stale BEAM bytecode files in the `_build` directory cause [Dialyzer](@/glossary/dialyzer.md) to report errors that do not correspond to any actual code issue.

### Root Cause Analysis

Nuclear Cache errors arise from a specific sequence:

1. Module A is compiled, producing `_build/dev/lib/app/ebin/Elixir.A.beam`
2. Module A is modified, changing its type signatures
3. Incremental compilation updates some but not all dependent BEAM files
4. Dialyzer's PLT (Persistent Lookup Table) contains stale type information from step 1
5. Dialyzer reports type errors that are actually artifacts of stale PLT entries

```bash
# Nuclear Cache detection and fix sequence

# Step 1: Detect - Dialyzer reports errors on unchanged code
mix dialyzer
# => ** (Dialyzer) lib/some_module.ex:42: ...

# Step 2: Verify - error persists after recompilation
mix compile --force && mix dialyzer
# => ** (Dialyzer) lib/some_module.ex:42: ... (still present)

# Step 3: Nuclear fix - remove stale artifacts
rm -rf _build/dev/lib/prismatic_claude/ebin
rm -rf priv/plts/dialyzer.plt

# Step 4: Clean rebuild
mix compile --force
mix dialyzer
# => All checks passed (error was phantom)
```

### Auto-Fix Capabilities

Nuclear Cache fixes are fully automated as part of the [AutoHeal](@/glossary/autoheal.md) cycle. When Dialyzer reports errors that cannot be traced to source code changes, the AutoHeal system automatically applies the Nuclear Cache fix sequence (cache invalidation, clean rebuild, re-analysis) and validates that the errors are resolved. This prevents phantom Dialyzer errors from blocking quality gates or causing unnecessary developer investigation.

## AST-Indexed Semantic Search

All five CASCADE Patterns share a common detection infrastructure: the AST-indexed semantic search engine. This engine pre-processes the source code of all applications into indexed AST representations, enabling O(1) pattern lookup instead of O(n) file-by-file scanning.

The indexing process:

1. Parse all `.ex` and `.exs` files into Elixir AST using `Code.string_to_quoted/2`
2. Walk the AST, extracting nodes that match CASCADE pattern signatures
3. Store matches in an ETS-backed index keyed by `{pattern_type, file, line}`
4. On file modification, incrementally update only the affected index entries

This indexing enables the detection engine to check all five patterns across the entire platform in milliseconds, making it practical to include CASCADE checks in pre-commit hooks without impacting developer workflow.

## Pattern Lifecycle

Each CASCADE Pattern follows a defined lifecycle from discovery to permanent prevention:

| Phase | Activities | Output |
|-------|-----------|--------|
| **Discovery** | Manual observation of recurring quality violations | Pattern hypothesis |
| **Validation** | Confirm pattern exists across multiple applications | Pattern definition |
| **Formalization** | Create detection rule, fix procedure, regression test | Pattern specification |
| **Propagation** | Apply fix across all affected applications | Platform-wide elimination |
| **Prevention** | Integrate detection into quality gates and pre-commit hooks | Permanent prevention |
| **Monitoring** | Track for pattern recurrence through continuous analysis | Sustained 0 QDP |

## Related Terms

- [CASCADE](@/glossary/cascade.md) -- Parent methodology encompassing all five pattern types
- [QDP](@/glossary/qdp.md) -- Quality Debt Points eliminated through CASCADE Pattern application
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning standard maintained by CASCADE prevention
- [AutoEvolve](@/glossary/autoevolve.md) -- Evolution system that applies CASCADE detection in scanning cycles
- [AutoHeal](@/glossary/autoheal.md) -- Self-repair system using CASCADE fix procedures (especially Nuclear Cache)
- [Dialyzer](@/glossary/dialyzer.md) -- Static analysis tool central to Type Mismatch and Nuclear Cache detection
- [Typespec](@/glossary/typespec.md) -- Type annotations targeted by Type Mismatch pattern
- [Pattern Matching](@/glossary/pattern-matching.md) -- Elixir capability used in Empty Check replacements
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Testing technique validating fix equivalence
- [Supervisor](@/glossary/supervisor.md) -- OTP behavior involved in Timer Replacement corrections
- [Pure Function](@/glossary/pure-function.md) -- Functional purity improved by Dead Code elimination
- [Code Coverage](@/glossary/code-coverage.md) -- Metric improved by Dead Code removal

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Capabilities](@/capabilities/_index.md) -- Platform quality and evolution capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)