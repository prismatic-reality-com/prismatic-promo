+++
title = "Mark"
weight = 50

[extra]
description = "In mutation testing, a Mark is a syntactic location in source code identified as a candidate for mutation, representing a specific code construct (operator, literal, branch) that a mutation engine will systematically alter to assess test suite effectiveness and code verification completeness."
category = "quality"
domain = "testing-quality"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["mutant", "mutation", "mutation-testing", "killed-survived", "mutation-score", "ast", "code-coverage", "quality-floor", "test-coverage", "cyclomatic-complexity", "property-testing", "macro"]
tags = ["glossary", "mark", "mutation-testing", "code-location", "test-quality", "syntactic-target", "ast", "quality-assurance", "code-verification"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Marks identify the precise syntactic locations in source code where mutation operators will introduce changes, forming the basis for systematic mutation testing that measures test suite effectiveness beyond simple line coverage by verifying that tests actually detect behavioral changes."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["mark", "mutation mark", "mutation target", "syntactic location", "code mutation point", "mutation candidate", "test target", "AST", "mutation testing", "code quality", "test effectiveness"]
image = "/images/sections/glossary.png"
image_alt = "Mark - Prismatic Platform"
word_count = 3300
see_also = ["capabilities", "quality-floor", "architecture", "mutation-testing"]
+++

## Definition

In mutation testing, a **Mark** is a specific syntactic location in source code that a mutation engine identifies as a candidate for modification. Each mark represents a code construct -- an arithmetic operator, comparison operator, boolean literal, return value, function call, or conditional branch -- that can be systematically altered by one or more mutation operators to produce mutants. The set of all marks in a codebase defines the mutation testing surface: the total number of code points that can be tested for adequate verification by the test suite.

Marks are distinct from mutants: a single mark may produce multiple mutants (e.g., a `+` operator mark produces mutants for `-`, `*`, and `/` replacements). The mark is the location; the mutant is the specific alteration at that location. Understanding this distinction is important for interpreting mutation testing reports: high mark coverage with low kill rates indicates that tests reach the code but do not verify its behavior thoroughly -- the tests execute the code path but do not assert on the output correctly or completely.

Mutation testing addresses a fundamental limitation of traditional code coverage metrics. A line of code can be "covered" (executed during a test) without being "verified" (its behavior checked by an assertion). Marks identify exactly where this gap exists, enabling targeted test improvement that increases genuine verification rather than superficial coverage numbers.

## Core Concepts

### Mark Categories and Mutation Operators

| Mark Category | Original Construct | Mutation Operators | Mutant Count | Detection Difficulty |
|--------------|-------------------|-------------------|--------------|---------------------|
| **Arithmetic** | `a + b` | `-`, `*`, `/`, `%` | 4 per mark | Easy -- numerical output changes |
| **Comparison** | `a > b` | `>=`, `<`, `<=`, `==`, `!=` | 5 per mark | Medium -- boundary conditions |
| **Boolean** | `true` | `false` | 1 per mark | Easy -- branch reversal |
| **Negation** | `!condition` | Remove negation | 1 per mark | Medium -- logic inversion |
| **Return Value** | `{:ok, result}` | `{:error, result}`, `nil` | 2 per mark | Hard -- error path testing |
| **Guard** | `when x > 0` | `when true`, `when false` | 2 per mark | Medium -- guard necessity |
| **Pattern Match** | `{:ok, val}` | `{:error, val}`, `_` | 2 per mark | Hard -- match exhaustiveness |
| **Function Call** | `String.trim(s)` | Remove call, return argument | 2 per mark | Hard -- side-effect detection |
| **Constant** | `@timeout 5000` | `0`, `1`, `-1`, max_int | 3-4 per mark | Medium -- boundary values |
| **List Operation** | `[head \| tail]` | `[]`, `[head]`, `tail` | 3 per mark | Medium -- list processing |

### Mark Density by Module Type

| Module Type | Typical Mark Density | Example | Testing Priority |
|-------------|---------------------|---------|-----------------|
| **Business Logic** | High (15-30 marks/100 LOC) | Scoring engines, decision rules | Critical -- highest mutation testing value |
| **Validators** | High (20-40 marks/100 LOC) | Input validation, constraint checking | Critical -- boundary mutations essential |
| **Parsers** | Medium-High (10-25 marks/100 LOC) | TOML/JSON parsing, response mapping | High -- incorrect parsing is subtle |
| **Controllers** | Medium (8-15 marks/100 LOC) | HTTP handlers, parameter extraction | Medium -- integration tests cover many |
| **Data Structures** | Low (3-8 marks/100 LOC) | Struct definitions, accessors | Low -- mostly boilerplate |
| **Configuration** | Very Low (1-3 marks/100 LOC) | Module attributes, constants | Low -- rarely mutated meaningfully |
| **GenServer** | Medium (10-20 marks/100 LOC) | State transitions, message handling | High -- state mutation bugs are critical |

### Mark-to-Test Relationship Quality

| Relationship | Meaning | Action |
|-------------|---------|--------|
| **Mark covered, mutant killed** | Test both reaches and verifies the code point | Ideal state -- no action needed |
| **Mark covered, mutant survived** | Test reaches but does not verify the code point | Add stronger assertions for the specific behavior |
| **Mark not covered** | No test reaches this code point | Add a test that exercises the code path |
| **Equivalent mutant** | Mutation produces semantically identical behavior | Exclude from kill rate calculation |
| **Redundant mark** | Multiple marks on the same logical decision | Consider consolidating or prioritizing |

### Mutation Testing vs. Code Coverage

| Metric | Code Coverage | Mutation Testing (Marks) |
|--------|--------------|--------------------------|
| **Measures** | Lines executed during tests | Code points verified by assertions |
| **False Positives** | High -- executed != verified | Low -- killed mutant = verified |
| **Computational Cost** | Minimal (single test run) | High (one run per mutant) |
| **Actionability** | "Write more tests" | "This specific operator at line X is not verified" |
| **Completeness** | Binary (covered/not covered) | Granular (which mutations survive) |
| **Gaming** | Easy (run code without asserting) | Hard (must actually verify behavior) |

## Technical Deep Dive

### AST-Based Mark Identification in Elixir

Mark identification operates on the Abstract Syntax Tree (AST) of the source code. The mutation engine traverses the AST and applies pattern matching rules to identify nodes eligible for mutation. In Elixir, the AST is accessible via `Macro.prewalk/3` and `Code.string_to_quoted/1`, making mark identification particularly straightforward compared to languages with opaque compilation pipelines.

The Elixir AST represents code as three-element tuples: `{function_or_operator, metadata, arguments}`. For example, `a + b` becomes `{:+, [line: 1], [{:a, [], nil}, {:b, [], nil}]}`. This regular structure makes it trivial to pattern-match on operators, literals, and function calls during AST traversal.

Mark identification follows a two-phase process:

1. **Discovery Phase**: Traverse the AST, matching patterns against known mark categories. Each match produces a mark record containing file location (line, column), node type, original value, and the set of applicable mutation operators.

2. **Filtering Phase**: Remove marks that would produce only equivalent mutants (e.g., mutating `x * 1` to `x * 0` is meaningful, but some mutations produce identical behavior due to surrounding context). Also filter marks in non-critical code paths (test files, configuration modules) that are intentionally excluded from mutation testing.

### Mark Prioritization Strategy

Not all marks carry equal testing value. The Prismatic Platform prioritizes marks using a multi-factor scoring system:

- **Business criticality**: Marks in DD scoring engines, compliance validators, and security modules receive the highest priority
- **Defect likelihood**: Comparison operators (`>` vs `>=`) and guard clauses have historically higher defect rates than arithmetic operators
- **Mark density context**: Isolated marks in simple functions are lower priority than marks in dense conditional logic
- **Historical defect correlation**: Marks at locations where previous bugs were found receive elevated priority

### Integration with Quality Floor Guardian

The Quality Floor Guardian tracks mark counts per module as a complexity indicator. Modules with high mark counts relative to their test coverage are flagged for additional testing. The platform's TACH doctrine ensures that every module in `lib/` has a corresponding test file, but mutation testing via marks goes further by measuring whether those tests actually verify the code's behavior.

The pre-commit pipeline does not run full mutation testing (too expensive for commit-time validation), but the CI pipeline can run targeted mutation testing on changed modules, ensuring that new code has adequate mark coverage before merge.

## Usage in Prismatic Platform

The Prismatic Platform's quality infrastructure identifies marks across all umbrella apps using AST analysis. The Quality Floor Guardian tracks mark counts per module as a complexity indicator -- modules with high mark counts relative to their test coverage are flagged for additional testing. The platform's TACH doctrine ensures that every mark in business-critical modules has at least one mutant that the test suite kills.

For the **OSINT tool adapters**, marks concentrate in the response parsing and validation logic where incorrect operator usage (e.g., `>=` vs `>` in confidence threshold comparison) could produce subtly wrong intelligence results. A single comparison operator mark in a sanctions screening adapter could mean the difference between flagging a sanctioned entity and silently passing it through.

For the **DD Decision Engine**, marks are densest in the scoring algorithms (ScoringEngine, UncertaintyEstimator, Pipeline) where arithmetic and comparison operators directly determine risk scores and recommendations. Mutation testing here validates that the scoring formula produces different outputs when operators are changed -- ensuring the test suite catches any regression in scoring behavior.

The **Academy knowledge check evaluation** code has marks at every score comparison point, ensuring that grading logic (pass/fail thresholds, partial credit calculations) is thoroughly verified through mutation testing.

## Code Examples

```elixir
defmodule PrismaticSafety.MutationEngine.MarkIdentifier do
  @moduledoc """
  Identifies mutation marks in Elixir source code by traversing the AST
  and pattern-matching against known mark categories.

  The identifier supports arithmetic operators, comparison operators,
  boolean literals, guard expressions, pattern match clauses, and
  return value constructs. Each identified mark includes its source
  location, node type, original value, and applicable mutation operators.

  ## Architecture

  Uses `Code.string_to_quoted/2` with `:columns` option to parse source
  code into an AST with precise source location metadata. Then traverses
  the AST with `Macro.prewalk/3`, collecting marks at each eligible node.

  ## Examples

      iex> {:ok, marks} = PrismaticSafety.MutationEngine.MarkIdentifier.identify_marks("x = a + b * c")
      iex> length(marks)
      2
  """

  require Logger

  @type mark :: %{
    file: String.t() | nil,
    line: pos_integer(),
    column: pos_integer() | nil,
    node_type: :arithmetic | :comparison | :boolean | :guard | :return_value,
    original: term(),
    operators: list(atom()),
    priority: :critical | :high | :medium | :low
  }

  @arithmetic_ops [:+, :-, :*, :/]
  @comparison_ops [:>, :>=, :<, :<=, :==, :!=]
  @boolean_literals [true, false]

  @doc """
  Identifies all mutation marks in the given source code string.

  Returns a list of mark records sorted by line number, each containing
  the source location, node type, original value, applicable mutation
  operators, and a priority classification.

  ## Parameters

    - `source_code` - Elixir source code string
    - `opts` - Options:
      - `:file` - Source file path for mark records (default: nil)
      - `:include_low_priority` - Include low-priority marks (default: true)

  ## Examples

      iex> {:ok, marks} = PrismaticSafety.MutationEngine.MarkIdentifier.identify_marks("if x > 0, do: x + 1, else: x - 1")
      iex> Enum.map(marks, & &1.node_type)
      [:comparison, :arithmetic, :arithmetic]

      iex> {:ok, marks} = PrismaticSafety.MutationEngine.MarkIdentifier.identify_marks("true && false")
      iex> length(marks) > 0
      true
  """
  @spec identify_marks(String.t(), keyword()) :: {:ok, list(mark())} | {:error, term()}
  def identify_marks(source_code, opts \\ []) do
    file = Keyword.get(opts, :file)
    include_low = Keyword.get(opts, :include_low_priority, true)

    case Code.string_to_quoted(source_code, columns: true) do
      {:ok, ast} ->
        marks =
          ast
          |> collect_marks(file)
          |> maybe_filter_low_priority(include_low)
          |> Enum.sort_by(& &1.line)

        Logger.debug("Identified #{length(marks)} marks#{if file, do: " in #{file}", else: ""}")
        {:ok, marks}

      {:error, {location, message, _token}} ->
        {:error, "Parse error at #{inspect(location)}: #{message}"}
    end
  end

  @doc """
  Counts marks by category for a given source file.

  Useful for complexity analysis and prioritization without
  materializing all mark records.

  ## Examples

      iex> {:ok, counts} = PrismaticSafety.MutationEngine.MarkIdentifier.count_marks("x + y > z")
      iex> counts.arithmetic
      1
      iex> counts.comparison
      1
  """
  @spec count_marks(String.t()) :: {:ok, map()} | {:error, term()}
  def count_marks(source_code) do
    case identify_marks(source_code) do
      {:ok, marks} ->
        counts =
          marks
          |> Enum.group_by(& &1.node_type)
          |> Enum.map(fn {type, type_marks} -> {type, length(type_marks)} end)
          |> Map.new()
          |> Map.merge(%{total: length(marks)})

        {:ok, counts}

      error ->
        error
    end
  end

  @doc """
  Calculates the mutation testing surface (total possible mutants)
  from identified marks.

  ## Examples

      iex> {:ok, marks} = PrismaticSafety.MutationEngine.MarkIdentifier.identify_marks("a + b > c")
      iex> PrismaticSafety.MutationEngine.MarkIdentifier.mutation_surface(marks)
      8
  """
  @spec mutation_surface(list(mark())) :: non_neg_integer()
  def mutation_surface(marks) do
    Enum.reduce(marks, 0, fn mark, acc -> acc + length(mark.operators) end)
  end

  @spec collect_marks(Macro.t(), String.t() | nil) :: list(mark())
  defp collect_marks(ast, file) do
    {_ast, marks} =
      Macro.prewalk(ast, [], fn
        {op, meta, [_left, _right]} = node, acc when op in @arithmetic_ops ->
          mark = %{
            file: file,
            line: meta[:line] || 0,
            column: meta[:column],
            node_type: :arithmetic,
            original: op,
            operators: @arithmetic_ops -- [op],
            priority: :medium
          }
          {node, [mark | acc]}

        {op, meta, [_left, _right]} = node, acc when op in @comparison_ops ->
          mark = %{
            file: file,
            line: meta[:line] || 0,
            column: meta[:column],
            node_type: :comparison,
            original: op,
            operators: @comparison_ops -- [op],
            priority: :high
          }
          {node, [mark | acc]}

        {bool_val, meta} = node, acc when bool_val in @boolean_literals and is_list(meta) ->
          mark = %{
            file: file,
            line: meta[:line] || 0,
            column: meta[:column],
            node_type: :boolean,
            original: bool_val,
            operators: [!bool_val],
            priority: :high
          }
          {node, [mark | acc]}

        bool_val = node, acc when bool_val in @boolean_literals ->
          mark = %{
            file: file,
            line: 0,
            column: nil,
            node_type: :boolean,
            original: bool_val,
            operators: [!bool_val],
            priority: :high
          }
          {node, [mark | acc]}

        node, acc ->
          {node, acc}
      end)

    Enum.reverse(marks)
  end

  @spec maybe_filter_low_priority(list(mark()), boolean()) :: list(mark())
  defp maybe_filter_low_priority(marks, true), do: marks
  defp maybe_filter_low_priority(marks, false) do
    Enum.reject(marks, fn mark -> mark.priority == :low end)
  end
end
```

```elixir
defmodule PrismaticSafety.MutationEngine.MarkAnalyzer do
  @moduledoc """
  Analyzes mark distribution across modules and correlates with
  test coverage to identify verification gaps.

  Produces actionable reports that guide test improvement efforts
  by highlighting modules with high mark density but low mutation
  kill rates.

  ## Examples

      iex> report = PrismaticSafety.MutationEngine.MarkAnalyzer.analyze_module("lib/scoring_engine.ex")
      iex> is_map(report)
      true
  """

  alias PrismaticSafety.MutationEngine.MarkIdentifier

  @type module_report :: %{
    file: String.t(),
    total_marks: non_neg_integer(),
    marks_by_type: map(),
    mutation_surface: non_neg_integer(),
    density_per_100loc: float(),
    priority_distribution: map(),
    risk_assessment: :critical | :high | :medium | :low
  }

  @doc """
  Analyzes mark distribution for a single source file.

  ## Parameters

    - `file_path` - Path to the Elixir source file
    - `opts` - Options passed through to `MarkIdentifier.identify_marks/2`

  ## Examples

      iex> report = PrismaticSafety.MutationEngine.MarkAnalyzer.analyze_module("lib/example.ex")
      iex> report.total_marks >= 0
      true
  """
  @spec analyze_module(String.t(), keyword()) :: module_report()
  def analyze_module(file_path, opts \\ []) do
    source = File.read!(file_path)
    loc = source |> String.split("\n") |> length()

    case MarkIdentifier.identify_marks(source, Keyword.put(opts, :file, file_path)) do
      {:ok, marks} ->
        total = length(marks)
        surface = MarkIdentifier.mutation_surface(marks)
        density = if loc > 0, do: Float.round(total / loc * 100, 1), else: 0.0

        by_type =
          marks
          |> Enum.group_by(& &1.node_type)
          |> Map.new(fn {type, ms} -> {type, length(ms)} end)

        by_priority =
          marks
          |> Enum.group_by(& &1.priority)
          |> Map.new(fn {pri, ms} -> {pri, length(ms)} end)

        risk = assess_risk(density, total, by_priority)

        %{
          file: file_path,
          total_marks: total,
          marks_by_type: by_type,
          mutation_surface: surface,
          density_per_100loc: density,
          priority_distribution: by_priority,
          risk_assessment: risk
        }

      {:error, _reason} ->
        %{
          file: file_path,
          total_marks: 0,
          marks_by_type: %{},
          mutation_surface: 0,
          density_per_100loc: 0.0,
          priority_distribution: %{},
          risk_assessment: :low
        }
    end
  end

  @doc """
  Generates a prioritized list of modules needing mutation testing,
  sorted by risk assessment and mark density.

  ## Parameters

    - `source_paths` - List of source file paths to analyze

  ## Examples

      iex> priorities = PrismaticSafety.MutationEngine.MarkAnalyzer.prioritize_modules(["lib/a.ex", "lib/b.ex"])
      iex> is_list(priorities)
      true
  """
  @spec prioritize_modules(list(String.t())) :: list(module_report())
  def prioritize_modules(source_paths) do
    risk_order = %{critical: 0, high: 1, medium: 2, low: 3}

    source_paths
    |> Enum.map(&analyze_module/1)
    |> Enum.sort_by(fn report ->
      {Map.get(risk_order, report.risk_assessment, 4), -report.density_per_100loc}
    end)
  end

  @spec assess_risk(float(), non_neg_integer(), map()) :: :critical | :high | :medium | :low
  defp assess_risk(density, total, priority_dist) do
    critical_count = Map.get(priority_dist, :critical, 0)
    high_count = Map.get(priority_dist, :high, 0)

    cond do
      critical_count > 5 or (density > 25.0 and total > 30) -> :critical
      high_count > 10 or density > 15.0 -> :high
      total > 10 or density > 8.0 -> :medium
      true -> :low
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Conflating marks with mutants** | Reporting "100 marks" as "100 mutation tests" understates the testing surface (each mark produces multiple mutants) | Track both mark count and mutation surface (total mutants) separately |
| **Ignoring equivalent mutants** | Counting all survived mutants as test failures inflates the deficiency rate | Identify and exclude equivalent mutants from kill rate calculations |
| **Running full mutation testing in CI** | Mutation testing is O(mutants * test_suite_time), which is prohibitively expensive for large codebases | Run targeted mutation testing on changed modules only; full suite as periodic audit |
| **Treating all marks equally** | Business-critical scoring logic and logging code receive the same testing attention | Prioritize marks by module criticality and defect likelihood |
| **High coverage false confidence** | 95% line coverage but 40% mutation kill rate -- tests execute code without verifying it | Use mutation testing to identify verification gaps beyond coverage metrics |
| **Missing guard marks** | Guard expressions in function heads are often overlooked by mark identification | Explicitly scan for guard clauses (`when` expressions) as mark candidates |
| **Pattern match ordering** | Reordering pattern match clauses changes behavior but standard mark identification misses this | Add pattern match clause reordering as a mutation operator |
| **Macro-generated marks** | Code generated by macros may contain marks that are not visible in the source | Expand macros before mark identification using `Macro.expand/2` |
| **Non-deterministic tests** | Flaky tests cause random mutant survival/kill, producing unreliable mutation scores | Fix flaky tests before running mutation testing; use deterministic seeds |
| **Insufficient timeout** | Mutants that cause infinite loops are not detected if the test timeout is too generous | Set strict per-test timeouts; classify timed-out mutants as killed |

## Best Practices

1. **Focus on high-density, high-impact modules first** -- not all marks carry equal risk; prioritize DD scoring engines, compliance validators, and security modules.
2. **Track mark counts as a complexity metric** -- modules with high mark density (> 20 marks per 100 LOC) indicate complex logic that warrants thorough mutation testing.
3. **Filter equivalent marks** -- code locations where all possible mutations produce semantically identical behavior should be excluded to avoid inflating survived mutant counts.
4. **Use mark-to-test mapping** -- identify which tests cover which marks, enabling targeted test improvement for specific uncovered marks rather than generic "write more tests" guidance.
5. **Integrate mark identification into CI** -- detect new untested marks introduced by code changes before merge; report mark count trends over time.
6. **Combine with property-based testing** -- property tests are particularly effective at killing arithmetic and comparison mutants because they test behavior across many input values.
7. **Document intentionally uncovered marks** -- modules with performance-only code paths or platform-specific branches should have explicit justification for uncovered marks.
8. **Prioritize comparison operator marks** -- boundary mutations (`>` vs `>=`) historically produce the most escaped defects in production; these marks should always have killed mutants.
9. **Run targeted mutation testing on changed files** -- full-codebase mutation testing is expensive; limit to changed modules in CI and run full audits periodically.
10. **Use mutation score as a quality gate** -- set minimum mutation kill rates (e.g., 80% for business-critical modules) and block merges that degrade the score.

## Related Terms

- [Mutant](/glossary/mutant/) -- the altered code produced from a mark by applying a mutation operator
- [Mutation](/glossary/mutation/) -- the specific change applied at a mark location
- [Mutation Testing](/glossary/mutation-testing/) -- the methodology using marks for test quality assessment
- [Killed/Survived](/glossary/killed-survived/) -- outcome classification of mutants generated from marks
- [Mutation Score](/glossary/mutation-score/) -- the ratio of killed mutants to total non-equivalent mutants
- [AST](/glossary/ast/) -- Abstract Syntax Tree used for mark identification via pattern matching
- [Code Coverage](/glossary/code-coverage/) -- line-level execution tracking that marks complement with verification measurement
- [Quality Floor](/glossary/quality-floor/) -- minimum quality thresholds enforced by the Quality Floor Guardian
- [Cyclomatic Complexity](/glossary/cyclomatic-complexity/) -- complexity metric correlated with mark density
- [Property Testing](/glossary/property-testing/) -- ExUnitProperties-based testing particularly effective at killing mutants
- [Macro](/glossary/macro/) -- Elixir metaprogramming constructs that may generate additional marks
- [Test Coverage](/glossary/test-coverage/) -- the broader test adequacy measurement that mutation testing strengthens

## See Also

- [Capabilities](/capabilities/) -- quality assurance and mutation testing capabilities
- [Architecture](/architecture/) -- testing architecture and quality infrastructure patterns
- [Quality Floor Guardian](/architecture/) -- the system that tracks mark counts and mutation scores

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
