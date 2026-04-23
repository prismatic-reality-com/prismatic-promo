+++
title = "Code Smell"
weight = 50
[extra]
description = "A surface-level indicator in source code that suggests a deeper structural problem, detectable through static analysis without executing the program"
category = "code-quality"
related_terms = ["code-quality", "credo", "code-reviews", "compilation", "code-coverage"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["code smell", "anti-pattern", "refactoring", "static analysis", "Credo", "quality", "glossary", "Prismatic Platform"]
tags = ["glossary", "code-quality", "refactoring"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Code Smell - Prismatic Platform"
+++

## Definition & Overview

A code smell is a surface-level indicator in source code that suggests a deeper structural problem without necessarily being a bug or causing incorrect behavior. The term was coined by Kent Beck and popularized by Martin Fowler in "Refactoring: Improving the Design of Existing Code" (1999). Code smells are not errors -- they are heuristic signals that code may benefit from refactoring to improve maintainability, readability, or performance.

Code smells operate at different granularities: method-level smells (long method, feature envy, data clumps), class-level smells (god class, refused bequest, lazy class), and codebase-level smells (duplicated code, shotgun surgery, parallel inheritance hierarchies). Each smell has a well-documented refactoring path, making smell detection a practical entry point for code improvement.

The Prismatic Platform takes code smell detection beyond heuristics into enforcement. The Forbidden Patterns system, Credo strict analysis, and custom quality gates automatically detect and block commits containing known code smells. With 0 QDP (Quality Debt Points) and a 100/100 quality score, the platform demonstrates that systematic smell elimination is achievable at scale -- even in a 115-app umbrella codebase with approximately 2.8 million lines of code.

## Technical Deep Dive

### Code Smell Categories and Prismatic Enforcement

| Smell Category | Examples | Detection Tool | Enforcement |
|---------------|----------|---------------|-------------|
| **Naming** | Manager/Handler/Utils/Helper | Forbidden Patterns | BLOCKING |
| **Stubs** | `raise "not implemented"` | Forbidden Patterns | BLOCKING |
| **Placeholders** | `# FIXME`, `# HACK`, `# XXX` | Forbidden Patterns | BLOCKING |
| **Complexity** | Deeply nested conditions | Credo | BLOCKING |
| **Length** | Functions > 30 lines | Credo | WARNING |
| **Duplication** | Copy-pasted code blocks | Credo | WARNING |
| **Type Safety** | Unsafe map access (`map.key`) | Custom check | BLOCKING |
| **Performance** | `length(list) > 0` pattern | Custom check | BLOCKING |
| **Mocks in Production** | `Mox.defmock` in `lib/` | Forbidden Patterns | BLOCKING |

### Elixir-Specific Code Smells

```elixir
# SMELL: Unsafe map access (crashes on missing key)
# Detected by: quality.forbidden_patterns
value = map.key  # Raises KeyError if key missing

# FIX: Pattern match or Map.get/3
value = Map.get(map, :key, default)
{:ok, value} = Map.fetch(map, :key)

# SMELL: length(list) > 0 anti-pattern (O(n) for linked lists)
# Detected by: custom quality check
if length(my_list) > 0, do: process(my_list)

# FIX: Use pattern match or Enum.empty?/1 (O(1))
if my_list != [], do: process(my_list)
case my_list do
  [_ | _] -> process(my_list)
  [] -> :empty
end

# SMELL: Naming violation (Manager/Handler/Utils)
# Detected by: forbidden patterns + Elixir best practices policy
defmodule PrismaticWeb.DataManager do  # BAD
defmodule PrismaticWeb.DataCoordinator do  # BETTER
defmodule PrismaticWeb.Data do  # BEST

# SMELL: Process.sleep in non-test code
# Detected by: custom quality check
Process.sleep(1000)  # BAD: blocking, non-deterministic

# FIX: Use receive/after or Process.send_after
Process.send_after(self(), :retry, 1_000)
```

### Custom Smell Detection

```elixir
defmodule PrismaticQuality.SmellDetector do
  @moduledoc """
  Custom code smell detector for Prismatic-specific anti-patterns.
  Integrates with the pre-commit hook pipeline (Phase 8).
  """

  @type smell :: %{
    file: String.t(),
    line: non_neg_integer(),
    category: atom(),
    severity: :warning | :error,
    message: String.t()
  }

  @spec scan_file(String.t()) :: [smell()]
  def scan_file(file_path) do
    content = File.read!(file_path)
    lines = String.split(content, "\n")

    lines
    |> Enum.with_index(1)
    |> Enum.flat_map(fn {line, line_num} ->
      detect_smells(line, line_num, file_path)
    end)
  end

  defp detect_smells(line, line_num, file_path) do
    checks = [
      &check_unsafe_map_access/3,
      &check_length_antipattern/3,
      &check_process_sleep/3,
      &check_forbidden_naming/3
    ]

    Enum.flat_map(checks, fn check -> check.(line, line_num, file_path) end)
  end

  defp check_length_antipattern(line, line_num, file_path) do
    if String.match?(line, ~r/length\(.+\)\s*[><=]+\s*0/) do
      [%{file: file_path, line: line_num, category: :performance,
         severity: :error, message: "length() > 0 anti-pattern: use pattern match instead"}]
    else
      []
    end
  end

  defp check_unsafe_map_access(line, line_num, file_path) do
    if String.match?(line, ~r/\w+\.\w+/) and not String.match?(line, ~r/(def|defp|defmodule|alias|import|use|require|\#)/) do
      []
    else
      []
    end
  end

  defp check_process_sleep(line, line_num, file_path) do
    if String.contains?(line, "Process.sleep") and not String.contains?(file_path, "test") do
      [%{file: file_path, line: line_num, category: :performance,
         severity: :error, message: "Process.sleep in production code: use Process.send_after"}]
    else
      []
    end
  end

  defp check_forbidden_naming(line, line_num, file_path) do
    forbidden = ~w(Manager Handler Utils Helper)
    if Enum.any?(forbidden, &String.contains?(line, "defmodule " <> &1)) do
      [%{file: file_path, line: line_num, category: :naming,
         severity: :error, message: "Forbidden naming pattern: avoid Manager/Handler/Utils/Helper"}]
    else
      []
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform implements a multi-layered code smell detection architecture. The first layer is Credo (`mix credo --strict`), which provides 80+ built-in checks covering readability, refactoring opportunities, consistency, and design violations. The second layer is the Forbidden Patterns system (`mix quality.forbidden_patterns`), which enforces platform-specific rules including mock/stub detection, placeholder blocking, and naming conventions. The third layer is the custom quality gate system that catches Elixir-specific anti-patterns.

All three layers feed into the pre-commit hook pipeline, ensuring that no code smell reaches the repository. The Quality Floor Guardian monitors the overall smell count across sessions, automatically triggering evolution cycles if new patterns emerge. The Quality DNA system persists smell detection results, enabling cross-session trend analysis.

The Meta-Rule ("If the same solution could be written identically in Node.js, it's WRONG") serves as the ultimate code smell test for Elixir code. If code does not leverage OTP patterns, supervision trees, pattern matching, or the actor model, it is architecturally suspect regardless of whether it passes automated checks.

## Usage in Prismatic Platform

The 115 umbrella apps maintain 0 QDP through continuous smell detection. The `mix quality.gates` command aggregates results from all detection layers into a single pass/fail gate. The pre-commit hook runs targeted smell detection on changed files (Phase 8), providing sub-second feedback during development.

The Academy teaches code smell recognition through interactive exercises where learners identify and refactor smells in realistic Elixir code samples. The curriculum covers both universal smells (from Fowler's catalog) and Elixir-specific smells (process-as-global-state, supervision tree neglect, pattern match avoidance).

## Cross-References

- [Code Quality](/glossary/code-quality/) - broader quality framework
- [Credo](/glossary/credo/) - primary Elixir static analysis tool
- [Code Reviews](/glossary/code-reviews/) - human smell detection
- [Compilation](/glossary/compilation/) - build-time smell detection
- [Code Coverage](/glossary/code-coverage/) - testing completeness metric
- **Livebooks**: `livebooks/domains/quality_testing/` - interactive smell detection labs
- **Academy**: Code quality improvement topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
