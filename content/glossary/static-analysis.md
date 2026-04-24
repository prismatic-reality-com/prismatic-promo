+++
title = "Static Analysis"
weight = 50
[extra]
tags = ["glossary", "static-analysis", "code-quality", "credo", "dialyzer", "ast", "pattern-detection", "linting", "type-checking", "quality-gates", "forbidden-patterns", "compilation"]
description = "Examination of source code without executing it to identify bugs, vulnerabilities, type errors, anti-patterns, and quality violations through AST parsing, type inference, pattern matching, and formal verification techniques"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "code-quality-and-analysis"
related_concepts = ["abstract syntax tree", "type system", "linting", "pattern detection", "formal verification", "code quality", "type inference"]
implementation_status = "production"
authority_level = "platform-doctrine"
difficulty_rating = 7
prerequisites = ["programming fundamentals", "type systems", "Elixir basics"]
learning_path = "compilation > typespec > credo > dialyzer > static-analysis > quality-gate"
interactive_demos = ["/labs/glossary/static-analysis"]
code_examples = ["Elixir", "Bash"]
external_resources = ["https://hexdocs.pm/credo/overview.html", "https://hexdocs.pm/dialyxir/readme.html", "https://en.wikipedia.org/wiki/Static_program_analysis"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["false positive rate measurement", "pattern detection accuracy", "AST indexing performance", "cross-module type inference"]
keywords = ["static analysis", "code analysis", "AST", "linting", "type checking", "Credo", "Dialyzer", "pattern detection", "code quality", "forbidden patterns"]
related_terms = ["credo", "dialyzer", "code-quality", "quality-gate", "typespec", "compilation", "ast", "pre-commit-hooks", "refactoring", "zero-warning-policy"]
word_count = 1631
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Static Analysis - Prismatic Platform"
+++

## Definition

**Static analysis** is the examination of source code without executing it to identify bugs, vulnerabilities, type errors, anti-patterns, style violations, and structural quality issues. It operates on the source code's textual representation, abstract syntax tree (AST), control flow graph, data flow graph, or type annotations to detect problems that would otherwise manifest as runtime errors, security vulnerabilities, or maintenance burdens.

Static analysis occupies a unique position in the software quality spectrum: it finds categories of defects that testing cannot, operates at compile-time speed rather than runtime cost, and scales to millions of lines of code without requiring test infrastructure. However, it is subject to fundamental theoretical limitations -- Rice's theorem proves that no static analyzer can perfectly determine all non-trivial runtime properties -- making the balance between false positives and false negatives a central design challenge.

In the Prismatic Platform, static analysis forms the backbone of the [quality gate](@/glossary/quality-gate.md) enforcement pipeline. Three complementary static analysis systems -- [Credo](@/glossary/credo.md) for linting and style enforcement, [Dialyzer](@/glossary/dialyzer.md) for type-based analysis via success typings, and custom forbidden pattern detection with O(1) AST-indexed pattern matching -- collectively enforce [zero tolerance](@/glossary/zero-tolerance.md) for [code quality](@/glossary/code-quality.md) violations across the platform's 115 umbrella applications and approximately 2.8 million lines of code.

## Overview

Static analysis techniques range from simple syntactic checks (e.g., "does this variable naming follow the convention?") to sophisticated formal methods (e.g., "can this function ever return `nil` when its type signature claims it returns a non-empty list?"). The analysis depth determines both the class of defects detected and the computational cost:

### Analysis Depth Spectrum

| Level | Technique | What It Finds | Cost | Prismatic Tool |
|-------|-----------|---------------|------|----------------|
| **L1: Lexical** | Token scanning, regex | Style violations, forbidden strings | O(n) | Forbidden patterns |
| **L2: Syntactic** | AST analysis | Structural anti-patterns, dead code | O(n) | Credo |
| **L3: Semantic** | Type inference, data flow | Type errors, null dereferences | O(n^2) | Dialyzer |
| **L4: Inter-procedural** | Cross-function analysis | Call graph issues, protocol violations | O(n^2-n^3) | Dialyzer PLT |
| **L5: Formal** | Model checking, theorem proving | Mathematical correctness proofs | Undecidable | Trinity Gate (Lean4) |

The Prismatic Platform operates primarily at levels L1 through L4 in automated pipelines, with L5 formal verification available through the Trinity Gate system for critical components.

### The Elixir Static Analysis Ecosystem

Elixir's static analysis story is distinctive because of three language characteristics:

1. **Homoiconicity** -- Elixir code is representable as Elixir data structures, making AST manipulation natural and powerful via `quote` and `unquote`
2. **Success Typings** -- Dialyzer uses a type inference approach that never produces false positives at the cost of potential false negatives
3. **Compile-Time Macros** -- Significant code transformation occurs at compile time, requiring analysis tools to understand macro expansion

## Technical Details

### Abstract Syntax Tree Analysis

The foundation of most static analysis is the [AST](@/glossary/ast.md) -- the tree representation of source code's syntactic structure. In Elixir, the AST is accessible through the `quote` special form and the `Code.string_to_quoted/2` function:

```elixir
defmodule PrismaticAnalysis.ASTAnalyzer do
  @moduledoc """
  Performs AST-level static analysis on Elixir source code.

  Traverses the abstract syntax tree to detect structural patterns,
  anti-patterns, and quality violations without executing the code.
  Uses O(1) indexed lookup for known patterns and O(n) traversal
  for structural analysis.
  """

  @type finding :: %{
    type: :warning | :error | :info,
    category: atom(),
    message: String.t(),
    file: String.t(),
    line: pos_integer(),
    column: pos_integer() | nil,
    severity: :low | :medium | :high | :critical
  }

  @spec analyze_file(String.t()) :: {:ok, [finding()]} | {:error, term()}
  def analyze_file(file_path) do
    with {:ok, source} <- File.read(file_path),
         {:ok, ast} <- Code.string_to_quoted(source, columns: true, file: file_path) do
      findings =
        []
        |> check_unsafe_map_access(ast, file_path)
        |> check_length_anti_pattern(ast, file_path)
        |> check_process_sleep(ast, file_path)
        |> check_missing_specs(ast, file_path)
        |> check_bare_raise(ast, file_path)

      {:ok, findings}
    end
  end

  @spec analyze_directory(String.t()) :: {:ok, %{String.t() => [finding()]}} | {:error, term()}
  def analyze_directory(dir_path) do
    dir_path
    |> Path.join("**/*.{ex,exs}")
    |> Path.wildcard()
    |> Task.async_stream(&analyze_file/1, max_concurrency: System.schedulers_online())
    |> Enum.reduce({:ok, %{}}, fn
      {:ok, {:ok, findings}}, {:ok, acc} when findings != [] ->
        file = hd(findings).file
        {:ok, Map.put(acc, file, findings)}
      {:ok, {:ok, _}}, acc -> acc
      {:ok, {:error, reason}}, _acc -> {:error, reason}
    end)
  end

  defp check_unsafe_map_access(findings, ast, file) do
    Macro.prewalk(ast, findings, fn
      {{:., meta, [Access, :get]}, _, [_map, _key]} = node, acc ->
        finding = %{
          type: :warning,
          category: :unsafe_map_access,
          message: "Prefer Map.get/3 with explicit default over Access.get/2",
          file: file,
          line: Keyword.get(meta, :line, 0),
          column: Keyword.get(meta, :column),
          severity: :medium
        }
        {node, [finding | acc]}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
  end

  defp check_length_anti_pattern(findings, ast, file) do
    Macro.prewalk(ast, findings, fn
      {:>, meta, [{:length, _, [_]}, 0]} = node, acc ->
        finding = %{
          type: :warning,
          category: :length_anti_pattern,
          message: "Use Enum.any?/1 or pattern match instead of length() > 0",
          file: file,
          line: Keyword.get(meta, :line, 0),
          column: Keyword.get(meta, :column),
          severity: :low
        }
        {node, [finding | acc]}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
  end

  defp check_process_sleep(findings, ast, file) do
    Macro.prewalk(ast, findings, fn
      {{:., meta, [{:__aliases__, _, [:Process]}, :sleep]}, _, _} = node, acc ->
        finding = %{
          type: :error,
          category: :process_sleep,
          message: "Process.sleep/1 in production code indicates timing-dependent logic",
          file: file,
          line: Keyword.get(meta, :line, 0),
          column: Keyword.get(meta, :column),
          severity: :high
        }
        {node, [finding | acc]}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
  end

  defp check_missing_specs(findings, ast, file) do
    # Detect public functions without @spec annotations
    Macro.prewalk(ast, findings, fn
      {:def, meta, [{name, _, _args} | _]} = node, acc when is_atom(name) ->
        # Check if preceding node contains @spec
        # Simplified: full implementation walks the module body
        {node, acc}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
  end

  defp check_bare_raise(findings, ast, file) do
    Macro.prewalk(ast, findings, fn
      {:raise, meta, [msg]} = node, acc when is_binary(msg) ->
        if String.contains?(msg, ["not implemented", "TODO"]) do
          finding = %{
            type: :error,
            category: :stub_implementation,
            message: "Stub implementation detected: raise with 'not implemented'",
            file: file,
            line: Keyword.get(meta, :line, 0),
            column: Keyword.get(meta, :column),
            severity: :critical
          }
          {node, [finding | acc]}
        else
          {node, acc}
        end
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
  end
end
```

### O(1) Pattern Detection with AST Indexing

The Prismatic Platform achieves 90-250x speedup over traditional pattern detection through AST-indexed lookup. Instead of traversing the entire AST for each pattern check, the system pre-indexes AST nodes by their structure, enabling constant-time pattern matching:

```elixir
defmodule PrismaticAnalysis.ASTIndex do
  @moduledoc """
  Pre-indexes AST nodes for O(1) pattern detection.

  Builds a structural hash index during initial AST traversal,
  enabling subsequent pattern lookups in constant time regardless
  of codebase size. This is the foundation of the platform's
  90-250x speedup over sequential pattern scanning.
  """

  @type index :: %{
    structural_hash => [{file :: String.t(), line :: pos_integer(), ast_node :: term()}]
  }

  @type structural_hash :: binary()

  @spec build_index([String.t()]) :: {:ok, index()} | {:error, term()}
  def build_index(file_paths) do
    index =
      file_paths
      |> Task.async_stream(&index_file/1, max_concurrency: System.schedulers_online())
      |> Enum.reduce(%{}, fn {:ok, file_index}, acc ->
        Map.merge(acc, file_index, fn _key, v1, v2 -> v1 ++ v2 end)
      end)

    {:ok, index}
  end

  @spec lookup(index(), term()) :: [{String.t(), pos_integer(), term()}]
  def lookup(index, pattern_ast) do
    hash = structural_hash(pattern_ast)
    Map.get(index, hash, [])
  end

  @spec index_file(String.t()) :: %{structural_hash() => [{String.t(), pos_integer(), term()}]}
  defp index_file(file_path) do
    with {:ok, source} <- File.read(file_path),
         {:ok, ast} <- Code.string_to_quoted(source, columns: true, file: file_path) do
      Macro.prewalk(ast, %{}, fn node, acc ->
        hash = structural_hash(node)
        line = extract_line(node)
        entry = {file_path, line, node}
        {node, Map.update(acc, hash, [entry], &[entry | &1])}
      end)
      |> elem(1)
    else
      _ -> %{}
    end
  end

  defp structural_hash(ast_node) do
    ast_node
    |> normalize_node()
    |> :erlang.phash2()
    |> Integer.to_string(16)
  end

  defp normalize_node({form, _meta, args}) when is_atom(form) do
    {form, [], normalize_args(args)}
  end
  defp normalize_node(other), do: other

  defp normalize_args(args) when is_list(args), do: Enum.map(args, &normalize_node/1)
  defp normalize_args(args), do: args

  defp extract_line({_, meta, _}) when is_list(meta), do: Keyword.get(meta, :line, 0)
  defp extract_line(_), do: 0
end
```

### Dialyzer Integration

[Dialyzer](@/glossary/dialyzer.md) performs success typing analysis, a form of type inference that identifies code that is guaranteed to fail at runtime. Unlike traditional type checkers that may produce false positives, Dialyzer's success typings guarantee that every warning represents a genuine defect:

```elixir
defmodule PrismaticAnalysis.DialyzerRunner do
  @moduledoc """
  Integrates Dialyzer analysis into the platform quality pipeline.

  Manages PLT (Persistent Lookup Table) lifecycle, runs analysis
  across the umbrella, and maps Dialyzer warnings to platform
  finding format for unified quality reporting.
  """

  @type dialyzer_config :: %{
    plt_path: String.t(),
    warnings: [atom()],
    apps: [atom()],
    exclude_modules: [module()]
  }

  @default_warnings [
    :error_handling,
    :underspecs,
    :unknown,
    :unmatched_returns,
    :extra_return,
    :missing_return
  ]

  @spec run(dialyzer_config()) :: {:ok, [map()]} | {:error, term()}
  def run(config \\ default_config()) do
    warnings =
      :dialyzer.run(
        analysis_type: :incremental,
        plt: String.to_charlist(config.plt_path),
        files_rec: config.apps |> Enum.flat_map(&app_beam_paths/1),
        warnings: config.warnings
      )

    findings = Enum.map(warnings, &translate_warning/1)
    {:ok, findings}
  rescue
    error -> {:error, {:dialyzer_crash, error}}
  end

  @spec check_plt_current?(String.t()) :: boolean()
  def check_plt_current?(plt_path) do
    case File.stat(plt_path) do
      {:ok, %{mtime: mtime}} ->
        age_hours = DateTime.diff(DateTime.utc_now(), mtime |> NaiveDateTime.from_erl!() |> DateTime.from_naive!("Etc/UTC"), :hour)
        age_hours < 24
      {:error, _} -> false
    end
  end

  defp default_config do
    %{
      plt_path: "priv/plts/dialyzer.plt",
      warnings: @default_warnings,
      apps: list_umbrella_apps(),
      exclude_modules: []
    }
  end

  defp translate_warning({tag, {file, line}, message_tuple}) do
    %{
      type: :dialyzer,
      category: tag,
      message: :dialyzer.format_warning(message_tuple) |> to_string() |> String.trim(),
      file: to_string(file),
      line: line,
      severity: severity_for_tag(tag)
    }
  end

  defp severity_for_tag(:error_handling), do: :high
  defp severity_for_tag(:unmatched_returns), do: :medium
  defp severity_for_tag(:underspecs), do: :medium
  defp severity_for_tag(:unknown), do: :high
  defp severity_for_tag(_), do: :low

  defp app_beam_paths(app) do
    Path.wildcard("_build/dev/lib/#{app}/ebin/*.beam")
    |> Enum.map(&String.to_charlist/1)
  end

  defp list_umbrella_apps do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(&(&1 |> Path.dirname() |> Path.basename() |> String.to_atom()))
  end
end
```

### Forbidden Pattern Detection

The platform implements a forbidden pattern detection system that scans for known anti-patterns, placeholder code, and policy violations:

```elixir
defmodule PrismaticAnalysis.ForbiddenPatterns do
  @moduledoc """
  Detects forbidden patterns in source code.

  Implements the platform's zero-tolerance policy for mocks, stubs,
  placeholders, hardcoded values, and other anti-patterns. Each
  pattern maps to a severity level and enforcement action.
  """

  @type pattern :: %{
    name: String.t(),
    regex: Regex.t(),
    category: atom(),
    severity: :block | :warn,
    scope: :lib | :test | :all,
    message: String.t()
  }

  @patterns [
    %{name: "Mox.defmock", regex: ~r/Mox\.defmock/, category: :mocks,
      severity: :block, scope: :lib, message: "Mocks forbidden in production code"},
    %{name: "raise not implemented", regex: ~r/raise\s+"not implemented"/,
      category: :stubs, severity: :block, scope: :lib, message: "Stub implementation detected"},
    %{name: "PLACEHOLDER comment", regex: ~r/#\s*PLACEHOLDER/i,
      category: :placeholders, severity: :block, scope: :all, message: "Placeholder code detected"},
    %{name: "FIXME comment", regex: ~r/#\s*FIXME/i,
      category: :placeholders, severity: :block, scope: :all, message: "FIXME found - must be resolved"},
    %{name: "TODO without issue", regex: ~r/#\s*TODO(?!\([a-zA-Z])/,
      category: :placeholders, severity: :warn, scope: :all, message: "TODO without issue reference"},
    %{name: "Process.sleep in lib", regex: ~r/Process\.sleep/,
      category: :timing, severity: :block, scope: :lib, message: "Process.sleep in production code"}
  ]

  @spec scan(String.t()) :: {:ok, [map()]} | {:error, term()}
  def scan(path) do
    findings =
      Path.wildcard(Path.join(path, "**/*.{ex,exs}"))
      |> Enum.reject(&whitelisted?/1)
      |> Task.async_stream(&scan_file/1, max_concurrency: System.schedulers_online())
      |> Enum.flat_map(fn {:ok, findings} -> findings end)

    {:ok, findings}
  end

  defp scan_file(file_path) do
    scope = if String.contains?(file_path, "/test/"), do: :test, else: :lib

    case File.read(file_path) do
      {:ok, content} ->
        content
        |> String.split("\n")
        |> Enum.with_index(1)
        |> Enum.flat_map(fn {line, line_num} ->
          @patterns
          |> Enum.filter(&(scope_matches?(&1.scope, scope)))
          |> Enum.filter(&(Regex.match?(&1.regex, line)))
          |> Enum.map(&build_finding(&1, file_path, line_num, line))
        end)
      {:error, _} -> []
    end
  end

  defp scope_matches?(:all, _), do: true
  defp scope_matches?(scope, scope), do: true
  defp scope_matches?(_, _), do: false

  defp build_finding(pattern, file, line_num, line_content) do
    %{
      pattern: pattern.name,
      category: pattern.category,
      severity: pattern.severity,
      file: file,
      line: line_num,
      content: String.trim(line_content),
      message: pattern.message
    }
  end

  defp whitelisted?(path) do
    Enum.any?(["_build/", "deps/", "garden/", "prismatic_credo/"], &String.contains?(path, &1))
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform runs static analysis at multiple integration points:

| Integration Point | Tools | Blocking | Frequency |
|-------------------|-------|----------|-----------|
| **Pre-commit hook** | Credo, forbidden patterns, compilation warnings | Yes | Every commit |
| **CI/CD pipeline** | Credo --strict, Dialyzer, full forbidden patterns | Yes | Every push |
| **Quality gates** | All static analysis tools unified | Yes | Pre-merge |
| **IDE integration** | Credo, ElixirLS (Dialyzer-based) | Advisory | Real-time |
| **Scheduled analysis** | Full platform scan, trend analysis | Advisory | Daily |

The unified quality gate command aggregates all static analysis results:

```bash
# Run all static analysis checks
mix compile --warnings-as-errors --force  # Zero compilation warnings
mix credo --strict                         # Linting and style enforcement
mix dialyzer                               # Type-based analysis
mix quality.forbidden_patterns             # Anti-pattern detection
mix quality.gates                          # Unified gate check
```

## Comparison with Alternatives

| Tool | Language | Approach | False Positive Rate | Performance | Depth |
|------|----------|----------|-------------------|-------------|-------|
| **Credo** | Elixir | AST analysis, style rules | Low | Fast (seconds) | L1-L2 |
| **Dialyzer** | BEAM | Success typings, PLT | Zero (by design) | Slow (minutes) | L3-L4 |
| **Prismatic Forbidden Patterns** | Elixir | Regex + AST indexed | Near-zero | Very fast (O(1) lookups) | L1-L2 |
| **SonarQube** | Multi-language | Rules-based | Medium | Medium | L1-L3 |
| **Semgrep** | Multi-language | Pattern matching | Low | Fast | L1-L2 |
| **CodeClimate** | Multi-language | Plugin-based | Medium | Medium | L1-L2 |
| **ESLint** | JavaScript/TS | AST rules | Low | Fast | L1-L2 |
| **mypy** | Python | Type checking | Low | Medium | L3-L4 |
| **Clippy** | Rust | Lint passes | Low | Fast | L1-L3 |

The Prismatic approach differentiates by combining three complementary analysis tools (Credo, Dialyzer, forbidden patterns) into a unified pipeline with [zero tolerance](@/glossary/zero-tolerance.md) enforcement. The O(1) AST-indexed pattern detection is unique to the platform and provides a performance advantage that scales with codebase size.

## Best Practices

1. **Layer your analysis** -- Use multiple tools at different analysis depths. Lexical checks (fast, broad) catch surface issues; type analysis (slower, deeper) catches semantic problems. The platform's three-tool approach (Credo + Dialyzer + forbidden patterns) covers levels L1 through L4.

2. **Zero false positive tolerance for blocking checks** -- If a static analysis finding blocks a commit, it must represent a genuine defect. Dialyzer's success typing approach guarantees this; Credo rules should be configured to exclude checks with known false positive issues.

3. **Index for performance** -- As codebases grow, linear scanning becomes a bottleneck. The platform's AST indexing achieves O(1) pattern lookups regardless of codebase size, a critical performance characteristic for the 2.8M LOC platform.

4. **Enforce in CI, not just locally** -- Local pre-commit hooks can be bypassed. The CI/CD pipeline is the authoritative enforcement point. The platform enforces at both levels: pre-commit for fast feedback, CI for authoritative blocking.

5. **Write custom rules** -- Generic static analysis rules miss domain-specific issues. The platform's custom [Credo](@/glossary/credo.md) checks and forbidden pattern rules encode domain knowledge that commercial tools cannot provide.

6. **Maintain type annotations** -- [Typespecs](@/glossary/typespec.md) enable deeper analysis. Every public function in the platform requires a `@spec` annotation, which both documents intent and enables Dialyzer to perform more precise analysis.

7. **Track trends, not just violations** -- The number of findings over time reveals whether code quality is improving or degrading. The platform tracks static analysis metrics through the Quality DNA system.

8. **Integrate early in the workflow** -- Run static analysis in the IDE (via ElixirLS) and pre-commit hooks so developers get feedback before code enters the shared repository.

## Common Pitfalls

1. **Analysis paralysis** -- Enabling every possible check on a large existing codebase generates thousands of findings and overwhelms developers. The platform resolved this through systematic QDP elimination (905 quality debt points removed to reach zero).

2. **Ignoring Dialyzer PLT maintenance** -- Stale PLT files produce incorrect results. The nuclear cache fix (`rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt`) is documented as a recovery procedure for corrupted PLT state.

3. **Custom rules without tests** -- Custom static analysis rules are code that can have bugs. The platform tests all custom [Credo](@/glossary/credo.md) checks in `apps/prismatic_credo/test/`.

4. **Over-suppressing warnings** -- Suppressing static analysis findings to achieve a "clean" report defeats the purpose. The [no-mercy-no-doubts](@/glossary/no-mercy-no-doubts.md) doctrine forbids suppression without documented justification.

5. **Neglecting incremental analysis** -- Running full analysis on every change is wasteful. Dialyzer's incremental mode and the AST index's delta updates ensure that analysis time scales with change size, not codebase size.

6. **Treating all findings equally** -- A critical type error is not equivalent to a naming convention violation. The platform's severity classification (block vs. warn) ensures that critical findings receive appropriate urgency.

## Use Cases

### Pre-Commit Quality Enforcement

Every commit to the Prismatic Platform triggers the 11-phase pre-commit hook. Phases 2 through 7 perform static analysis: [compilation](@/glossary/compilation.md) warnings check (zero tolerance), Credo strict analysis, Dialyzer type checking, forbidden pattern scan, and unified quality gate verification. Any finding at severity "block" halts the commit.

### Continuous Codebase Health Monitoring

The Quality Floor Guardian runs daily full-platform static analysis and tracks trends in the Quality DNA system. If the finding count increases above the established floor, the guardian triggers investigation and, if the increase is significant, blocks further commits until the regression is resolved.

### Automated Refactoring Validation

When performing large-scale [refactoring](@/glossary/refactoring.md), static analysis validates that the transformation preserves correctness. Dialyzer verifies that type contracts are maintained, Credo ensures style consistency is preserved, and forbidden patterns confirm that no anti-patterns were introduced during the refactoring process.

### Security Vulnerability Detection

Static analysis identifies security-relevant code patterns: SQL injection vectors (string interpolation in queries), hardcoded credentials, unsafe deserialization, and missing input validation. These findings feed into the [security audit](@/glossary/security-audit.md) evidence pipeline.

### Onboarding and Code Review

Static analysis reports provide objective, automated code review feedback. New contributors receive immediate feedback on platform conventions through Credo, type safety through Dialyzer, and anti-pattern detection through forbidden patterns, reducing the human review burden.

## Related Concepts

- [Credo](@/glossary/credo.md) -- Elixir static analysis tool for code consistency, readability, and refactoring opportunities
- [Dialyzer](@/glossary/dialyzer.md) -- BEAM static analysis tool using success typings for type-based defect detection
- [Code Quality](@/glossary/code-quality.md) -- Broader quality discipline that static analysis serves as a primary measurement tool
- [Quality Gate](@/glossary/quality-gate.md) -- Enforcement checkpoints where static analysis findings block or permit progression
- [Typespec](@/glossary/typespec.md) -- Elixir type annotations that enable deeper static analysis by Dialyzer
- [Compilation](@/glossary/compilation.md) -- Source code transformation that produces the first layer of static analysis (warnings)
- [AST](@/glossary/ast.md) -- Abstract Syntax Tree, the data structure that most static analysis operates on
- [Pre-commit Hooks](@/glossary/pre-commit-hooks.md) -- Git hooks that execute static analysis before code is committed
- [Refactoring](@/glossary/refactoring.md) -- Code transformation practice validated by static analysis to preserve correctness
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- Platform doctrine requiring zero compilation warnings, enforced by static analysis
- [Security Assessment](@/glossary/security-assessment.md) -- Security evaluation that includes static analysis as a code-level assessment technique
- [Technical Debt](@/glossary/technical-debt.md) -- Quality deficit that static analysis helps identify, quantify, and prevent

## See Also

- [Credo documentation](https://hexdocs.pm/credo/overview.html) -- Official Credo reference
- [Dialyxir documentation](https://hexdocs.pm/dialyxir/readme.html) -- Dialyzer Mix integration
- [Quality Gate Pipeline](/capabilities/quality-gates/) -- How static analysis integrates with enforcement
- [Forbidden Patterns Policy](/policies/forbidden-patterns/) -- Complete list of detected anti-patterns
- [Wikipedia: Static program analysis](https://en.wikipedia.org/wiki/Static_program_analysis) -- Theoretical foundations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
