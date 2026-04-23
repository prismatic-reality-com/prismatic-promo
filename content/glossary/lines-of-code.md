+++
title = "Lines of Code"
weight = 50
[extra]
tags = ["glossary", "metrics", "code-quality", "measurement", "software-engineering", "codebase", "productivity", "quantitative-analysis", "technical-debt", "complexity"]
description = "Lines of Code (LOC) is a quantitative software metric that counts the number of text lines in source code, used as a proxy for project size, complexity estimation, productivity analysis, and maintenance burden assessment -- though its interpretation requires significant nuance."
category = "metrics"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "beginner"
quality_score = 95
related_terms = ["code-quality", "codebase", "quantitative-measure", "technical-debt", "code-coverage", "quality-measurement-system", "metrics", "complexity", "refactoring", "maintainability"]
key_concepts = ["physical LOC", "logical LOC", "source lines of code (SLOC)", "blank lines", "comment lines", "code density", "LOC per function", "productivity measurement"]
use_cases = ["project estimation", "complexity assessment", "maintenance planning", "team productivity", "codebase health monitoring"]
see_also = ["cyclomatic complexity", "function points", "code churn", "technical debt quantification"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 2039
date_modified = "2026-02-23"
keywords = ["Lines", "Code", "glossary", "metrics", "Prismatic Platform", "SLOC", "Elixir", "The Prismatic"]
image = "/images/sections/glossary.png"
image_alt = "Lines of Code - Prismatic Platform"
+++

## Definition

Lines of Code (LOC) is a software metric that quantifies the size of a program by counting the number of lines in its source text. Variants include **physical LOC** (total lines including blanks and comments), **source lines of code (SLOC)** (only executable statements), and **logical LOC** (counting logical statements regardless of formatting). Despite its apparent simplicity, LOC is one of the most debated metrics in software engineering -- praised for its objectivity and ease of measurement, criticized for its inability to capture code quality, complexity, or value. In the Prismatic Platform, which spans approximately 2.8 million lines across 115 umbrella applications, LOC serves as a coarse-grained indicator of project scale but is always interpreted alongside quality metrics like Credo compliance, Dialyzer type coverage, test coverage, and the platform's 100/100 quality score.

## Overview

The idea of counting lines of code as a measure of software production dates back to the 1960s, when hardware constraints made code volume a meaningful indicator of both effort and resource consumption. In the mainframe era, a program with 10,000 lines was genuinely more complex than one with 1,000 lines, because languages were low-level and each line corresponded to a concrete operation.

Modern software development has complicated this relationship. A single line of Elixir pattern matching can replace dozens of lines of conditional logic in a lower-level language. A well-designed macro can eliminate thousands of lines of boilerplate. A refactoring that reduces a module from 500 lines to 200 lines is almost always an improvement, yet by the LOC metric it represents negative "productivity."

Despite these limitations, LOC remains widely used because it is objective, automatable, language-agnostic in principle, and correlated (if loosely) with project characteristics that matter: maintenance burden, testing effort, onboarding complexity, and compilation time. The key is to use LOC as one input among many, never as the sole basis for decisions about quality, productivity, or value.

The Prismatic Platform's approximately 2.8 million LOC represents the cumulative output of an ambitious technical vision: 115 umbrella applications covering AI agent orchestration, OSINT intelligence, security assessment, graph databases, formal verification, and web interfaces. That number conveys scale -- but the platform's quality score of 100/100, zero Credo violations, zero Dialyzer warnings, and zero compilation warnings convey quality. Both dimensions matter; neither alone tells the full story.

### LOC Variants

**Physical LOC (PLOC)**: Counts every line in the source file, including blank lines, comments, and formatting-only lines. Easiest to measure (`wc -l`) but noisiest. A file reformatted with different whitespace conventions changes its PLOC without changing its functionality.

**Source Lines of Code (SLOC)**: Counts only lines containing executable statements, excluding blanks and comments. More meaningful than PLOC but still sensitive to formatting (a single statement split across three lines counts as three SLOC in physical counting, one in logical counting).

**Logical Lines of Code (LLOC)**: Counts logical statements regardless of physical formatting. A multi-line function call counts as one LLOC. Most accurate for cross-language comparison but hardest to measure, requiring language-specific parsers.

**Comment Lines of Code (CLOC)**: Counts only comment lines. The ratio of CLOC to SLOC (comment density) is sometimes used as a documentation metric, though modern practices prefer separate documentation over inline comments.

## Technical Details

### Measuring LOC in Elixir Projects

The Prismatic Platform uses multiple approaches to measure LOC across its umbrella:

```elixir
defmodule Prismatic.Metrics.LinesOfCode do
  @moduledoc """
  Counts lines of code across the Prismatic Platform umbrella,
  broken down by application, file type, and line category.
  Integrates with git-trees for efficient file discovery.
  """

  @type line_category :: :code | :comment | :blank | :doc
  @type file_stats :: %{
    path: String.t(),
    total: non_neg_integer(),
    code: non_neg_integer(),
    comment: non_neg_integer(),
    blank: non_neg_integer(),
    doc: non_neg_integer()
  }

  @type app_stats :: %{
    app: atom(),
    files: non_neg_integer(),
    total_loc: non_neg_integer(),
    code_loc: non_neg_integer(),
    comment_loc: non_neg_integer(),
    blank_loc: non_neg_integer(),
    doc_loc: non_neg_integer(),
    avg_file_size: float()
  }

  @spec count_all(keyword()) :: {:ok, [app_stats()]}
  def count_all(opts \\ []) do
    apps_dir = Keyword.get(opts, :apps_dir, "apps")
    file_types = Keyword.get(opts, :file_types, [".ex", ".exs"])

    stats =
      File.ls!(apps_dir)
      |> Enum.filter(&File.dir?(Path.join(apps_dir, &1)))
      |> Enum.map(fn app_name ->
        app_dir = Path.join(apps_dir, app_name)
        files = find_source_files(app_dir, file_types)
        file_stats = Enum.map(files, &analyze_file/1)

        aggregate_stats(String.to_atom(app_name), file_stats)
      end)
      |> Enum.sort_by(& &1.total_loc, :desc)

    {:ok, stats}
  end

  @spec analyze_file(String.t()) :: file_stats()
  def analyze_file(path) do
    lines = File.read!(path) |> String.split("\n")

    categorized = Enum.map(lines, &categorize_line/1)

    %{
      path: path,
      total: length(lines),
      code: Enum.count(categorized, &(&1 == :code)),
      comment: Enum.count(categorized, &(&1 == :comment)),
      blank: Enum.count(categorized, &(&1 == :blank)),
      doc: Enum.count(categorized, &(&1 == :doc))
    }
  end

  defp categorize_line(line) do
    trimmed = String.trim(line)

    cond do
      trimmed == "" -> :blank
      String.starts_with?(trimmed, "#") -> :comment
      String.starts_with?(trimmed, "@moduledoc") -> :doc
      String.starts_with?(trimmed, "@doc") -> :doc
      true -> :code
    end
  end

  defp find_source_files(dir, extensions) do
    Path.wildcard(Path.join(dir, "**/*"))
    |> Enum.filter(fn path ->
      ext = Path.extname(path)
      ext in extensions and not String.contains?(path, "_build")
    end)
  end

  defp aggregate_stats(app_name, file_stats) do
    total = Enum.sum(Enum.map(file_stats, & &1.total))
    code = Enum.sum(Enum.map(file_stats, & &1.code))
    comment = Enum.sum(Enum.map(file_stats, & &1.comment))
    blank = Enum.sum(Enum.map(file_stats, & &1.blank))
    doc = Enum.sum(Enum.map(file_stats, & &1.doc))
    file_count = length(file_stats)

    %{
      app: app_name,
      files: file_count,
      total_loc: total,
      code_loc: code,
      comment_loc: comment,
      blank_loc: blank,
      doc_loc: doc,
      avg_file_size: if(file_count > 0, do: total / file_count, else: 0.0)
    }
  end
end
```

### Git-Based LOC Tracking Over Time

Tracking LOC changes over time reveals codebase growth patterns, refactoring waves, and feature development bursts:

```elixir
defmodule Prismatic.Metrics.LocHistory do
  @moduledoc """
  Tracks lines of code changes over time using git history.
  Enables trend analysis, growth rate calculation, and
  identification of LOC inflection points.
  """

  @type snapshot :: %{
    commit: String.t(),
    date: Date.t(),
    total_loc: non_neg_integer(),
    delta: integer(),
    files_changed: non_neg_integer(),
    insertions: non_neg_integer(),
    deletions: non_neg_integer()
  }

  @spec history(non_neg_integer()) :: {:ok, [snapshot()]}
  def history(num_commits \\ 100) do
    {output, 0} = System.cmd("git", [
      "log",
      "--format=%H|%as",
      "--shortstat",
      "-n", Integer.to_string(num_commits)
    ])

    snapshots = parse_git_log(output)
    {:ok, snapshots}
  end

  @spec growth_rate(non_neg_integer()) :: {:ok, float()}
  def growth_rate(days \\ 30) do
    {:ok, snapshots} = history(days * 3)

    recent = snapshots
    |> Enum.filter(fn s ->
      Date.diff(Date.utc_today(), s.date) <= days
    end)

    if length(recent) >= 2 do
      first = List.last(recent)
      last = List.first(recent)
      rate = (last.total_loc - first.total_loc) / max(first.total_loc, 1) * 100
      {:ok, Float.round(rate, 2)}
    else
      {:ok, 0.0}
    end
  end

  @doc """
  Identifies commits where LOC changed significantly,
  indicating major features, refactors, or bulk operations.
  """
  @spec inflection_points(non_neg_integer()) :: {:ok, [snapshot()]}
  def inflection_points(threshold \\ 1000) do
    {:ok, snapshots} = history(500)

    inflections = Enum.filter(snapshots, fn s ->
      abs(s.delta) >= threshold
    end)

    {:ok, inflections}
  end
end
```

### LOC-Based Complexity Indicators

While LOC alone is insufficient for complexity measurement, it can be combined with other metrics to produce useful indicators:

```elixir
defmodule Prismatic.Metrics.ComplexityIndicators do
  @moduledoc """
  Derives complexity indicators from LOC combined with
  structural analysis. These indicators supplement pure LOC
  with actionable quality signals.
  """

  @type indicator :: %{
    module: module(),
    loc: non_neg_integer(),
    function_count: non_neg_integer(),
    avg_function_length: float(),
    max_function_length: non_neg_integer(),
    public_function_ratio: float(),
    complexity_score: float()
  }

  @max_recommended_module_loc 300
  @max_recommended_function_loc 20
  @warning_function_loc 40

  @spec analyze_module(String.t()) :: {:ok, indicator()} | {:error, term()}
  def analyze_module(file_path) do
    with {:ok, content} <- File.read(file_path),
         {:ok, ast} <- Code.string_to_quoted(content) do
      functions = extract_functions(ast)
      loc = content |> String.split("\n") |> length()

      function_lengths = Enum.map(functions, &function_loc(&1, content))
      public_count = Enum.count(functions, &public_function?/1)

      indicator = %{
        module: extract_module_name(ast),
        loc: loc,
        function_count: length(functions),
        avg_function_length: safe_average(function_lengths),
        max_function_length: Enum.max(function_lengths, fn -> 0 end),
        public_function_ratio: safe_ratio(public_count, length(functions)),
        complexity_score: calculate_complexity(loc, function_lengths)
      }

      {:ok, indicator}
    end
  end

  @spec recommendations(indicator()) :: [String.t()]
  def recommendations(%{loc: loc} = indicator) when loc > @max_recommended_module_loc do
    base = ["Module exceeds #{@max_recommended_module_loc} LOC (#{loc}). Consider splitting."]

    base ++ function_recommendations(indicator)
  end

  def recommendations(indicator), do: function_recommendations(indicator)

  defp function_recommendations(%{max_function_length: max}) when max > @warning_function_loc do
    ["Longest function is #{max} lines. Functions over #{@max_recommended_function_loc} lines should be decomposed."]
  end

  defp function_recommendations(_indicator), do: []

  defp calculate_complexity(loc, function_lengths) do
    size_factor = loc / @max_recommended_module_loc
    length_factor = safe_average(function_lengths) / @max_recommended_function_loc
    variance_factor = standard_deviation(function_lengths) / 10.0

    Float.round(size_factor * 0.4 + length_factor * 0.4 + variance_factor * 0.2, 2)
  end

  defp safe_average([]), do: 0.0
  defp safe_average(list), do: Enum.sum(list) / length(list)

  defp safe_ratio(_numerator, 0), do: 0.0
  defp safe_ratio(numerator, denominator), do: numerator / denominator

  defp standard_deviation([]), do: 0.0
  defp standard_deviation(list) do
    mean = safe_average(list)
    variance = Enum.map(list, fn x -> (x - mean) ** 2 end) |> safe_average()
    :math.sqrt(variance)
  end
end
```

### Mix Task for LOC Reporting

```elixir
defmodule Mix.Tasks.Loc do
  @moduledoc """
  Reports lines of code statistics across the platform.

  ## Usage

      mix loc                    # Full report
      mix loc --app prismatic    # Single app
      mix loc --format json      # Machine-readable
      mix loc --top 10           # Top 10 largest apps
  """

  use Mix.Task

  @shortdoc "Reports lines of code statistics"

  @impl Mix.Task
  def run(args) do
    {opts, _rest, _invalid} = OptionParser.parse(args,
      strict: [app: :string, format: :string, top: :integer]
    )

    {:ok, stats} = Prismatic.Metrics.LinesOfCode.count_all()

    stats = filter_stats(stats, opts)

    case Keyword.get(opts, :format, "table") do
      "json" -> output_json(stats)
      "table" -> output_table(stats)
      "csv" -> output_csv(stats)
    end
  end

  defp output_table(stats) do
    total = Enum.reduce(stats, 0, fn s, acc -> acc + s.total_loc end)

    Mix.shell().info("\nPrismatic Platform - Lines of Code Report")
    Mix.shell().info(String.duplicate("=", 70))

    for stat <- stats do
      Mix.shell().info(
        String.pad_trailing(to_string(stat.app), 35) <>
        String.pad_leading(Integer.to_string(stat.total_loc), 10) <>
        String.pad_leading(Integer.to_string(stat.files), 8) <>
        String.pad_leading(Integer.to_string(stat.code_loc), 10)
      )
    end

    Mix.shell().info(String.duplicate("-", 70))
    Mix.shell().info("Total: #{total} lines across #{length(stats)} applications")
  end
end
```

## Implementation

### Integrating LOC into Quality Dashboards

LOC metrics become valuable when presented alongside quality metrics in dashboards that show the relationship between code volume and code health:

**Size vs. Quality Matrix**: Plot each application's LOC against its quality score. Applications in the high-LOC/low-quality quadrant are maintenance risks. Applications in the low-LOC/high-quality quadrant are exemplars.

**Growth Rate Monitoring**: Track LOC growth rate per sprint or per month. Sudden spikes indicate bulk code generation or large feature additions that need review. Sustained linear growth suggests healthy incremental development.

**Deletion Rate**: A healthy codebase deletes almost as many lines as it adds. If the deletion rate drops to zero while the addition rate remains high, technical debt is accumulating. The Prismatic Platform's refactoring and quality gate enforcement ensures regular code deletion through simplification.

**Per-Application LOC Budgets**: Setting soft LOC limits per application (e.g., 5,000 SLOC for a storage adapter, 15,000 for a web interface) creates a natural trigger for architectural review. When an application exceeds its budget, the team evaluates whether it should be split.

### Automating LOC Collection

The platform integrates LOC collection into the CI/CD pipeline:

1. **Pre-commit**: `mix loc --format json > priv/metrics/loc.json` captures current LOC snapshot.
2. **CI pipeline**: Compares LOC delta against the previous release. Large deltas trigger additional review requirements.
3. **Quality dashboard**: LOC trends are displayed alongside quality score, test coverage, and Dialyzer status.
4. **Git Trees integration**: `./scripts/git-trees.sh stats` provides fast LOC approximation (~80ms) for interactive use.

## Comparison

### LOC vs. Function Points

Function Points measure the amount of functionality delivered to the user, independent of implementation language. One function point might require 50 LOC in Java but 15 LOC in Elixir. Function Points are better for cross-language comparison and project estimation, while LOC is better for same-language internal analysis and trend tracking.

### LOC vs. Cyclomatic Complexity

Cyclomatic complexity counts the number of linearly independent paths through code. A 100-line function with no branches has cyclomatic complexity 1; a 10-line function with nested conditionals might have complexity 8. LOC and cyclomatic complexity are complementary: LOC measures size, cyclomatic complexity measures structural difficulty.

### LOC vs. Code Churn

Code churn measures how frequently code changes over time. A module with high LOC and low churn is stable; a module with low LOC and high churn is volatile. Both metrics together identify modules that need attention: high-LOC, high-churn modules are the most dangerous maintenance targets.

### LOC vs. Test Coverage

Test coverage (percentage of code exercised by tests) is inversely related to effective LOC in a specific way: the more LOC, the more test code needed to achieve the same coverage percentage. The Prismatic Platform's combination of ~2.8M LOC with quality score 100/100 demonstrates that large LOC is compatible with comprehensive quality when engineering practices are rigorous.

### Physical LOC vs. Logical LOC

Physical LOC counts lines in the file. Logical LOC counts executable statements. In Elixir, a pipeline like `data |> map(&transform/1) |> filter(&valid?/1) |> Enum.take(10)` might span 4 physical lines but represents 1 logical statement. Logical LOC is harder to measure but more meaningful for comparing code density across styles and languages.

## Best Practices

1. **Never use LOC as a productivity metric**: Measuring developer productivity by LOC produced incentivizes bloated code. A developer who refactors 1,000 lines into 200 has delivered more value than one who wrote 1,000 new lines of redundant code.

2. **Track trends, not absolutes**: The absolute LOC of a project is less informative than the trend. Is the codebase growing, stable, or shrinking? Is growth accelerating or decelerating? Trends reveal process health.

3. **Normalize by application**: Compare LOC across applications of similar type, not across the entire umbrella. A web application will naturally have more LOC than a storage adapter. Per-application baselines enable meaningful comparison.

4. **Combine with quality metrics**: Present LOC alongside Credo compliance, Dialyzer coverage, test coverage, and compilation warnings. LOC in isolation is a vanity metric; LOC paired with quality indicators is an engineering tool.

5. **Use LOC for estimation, not evaluation**: LOC correlates with maintenance effort, review time, and test requirements. Use it to plan work, not to judge work. A module with 500 LOC needs more review time than one with 50 LOC, regardless of quality.

6. **Automate collection**: Manually counting LOC is error-prone and unsustainable. Integrate LOC collection into CI/CD pipelines and quality dashboards for continuous, zero-effort monitoring.

7. **Distinguish between generated and written code**: Code generated by macros, scaffolding tools, or code generators should be counted separately from hand-written code. The Prismatic Platform's AIAD system generates significant boilerplate that should not be attributed to developer productivity.

8. **Set architecture review triggers**: Define LOC thresholds per application type that trigger architectural review. When a storage adapter exceeds 3,000 SLOC, review whether it should be decomposed. These are guidelines, not hard limits.

## Common Pitfalls

1. **LOC as a KPI**: Making lines of code a key performance indicator for individuals or teams. This incentivizes verbosity, copy-paste coding, and resistance to refactoring -- the exact opposite of quality engineering.

2. **Cross-language LOC comparison**: Comparing LOC between projects written in different languages. 10,000 lines of Elixir represents fundamentally different functionality than 10,000 lines of assembly. Even comparing Elixir to Ruby or Python requires calibration.

3. **Ignoring deleted lines**: Only tracking additions without crediting deletions. In a healthy codebase, deletions represent simplification, deduplication, and debt reduction -- some of the most valuable engineering work.

4. **Counting generated files**: Including auto-generated files (migrations, API specs, compiled assets) in LOC counts. This inflates the number and obscures the actual development effort.

5. **Confusing LOC with complexity**: A 1,000-line module with simple functions is less complex than a 200-line module with deeply nested pattern matching and recursive algorithms. LOC is a size metric, not a complexity metric.

6. **Setting LOC targets**: Requiring teams to produce a minimum number of lines per sprint. This is one of the most reliably destructive management practices in software engineering.

7. **Neglecting comment and doc ratios**: Ignoring the proportion of comments and documentation in LOC counts. A module with 500 SLOC and 200 doc lines is better documented than one with 500 SLOC and 10 doc lines, but raw LOC treats them identically.

8. **Snapshot without history**: Measuring LOC at a single point in time without historical context. A project with 100,000 LOC today might have been 150,000 LOC last month (healthy refactoring) or 50,000 LOC last month (rapid unsustainable growth).

## Use Cases

### Project Scale Communication

The Prismatic Platform's "~2.8M LOC" figure communicates project scale to stakeholders, potential contributors, and evaluators. It immediately conveys that this is a large, mature platform, setting appropriate expectations for onboarding time, build infrastructure, and team size.

### Maintenance Burden Estimation

When planning quarterly maintenance cycles, LOC per application helps estimate the effort required for dependency upgrades, deprecation handling, and security patching. Larger applications require proportionally more maintenance effort.

### Architecture Decision Support

LOC distribution across the umbrella reveals architectural imbalance. If one application contains 40% of the total LOC, it may need decomposition. If 50 applications each have fewer than 500 LOC, some may be candidates for consolidation.

### Onboarding Time Estimation

New developers joining the platform can estimate onboarding time based on the LOC of the subsystems they will work on. The glossary, learning paths, and documentation reduce this time, but LOC provides the baseline complexity they will encounter.

### Build and CI Optimization

LOC correlates with compilation time and test execution time. Applications with high LOC benefit disproportionately from incremental compilation, parallel test execution, and caching strategies. LOC-based analysis helps prioritize CI/CD optimization efforts.

## Related Concepts

Lines of code connects to measurement, quality, and engineering practice concepts across the platform:

- [Code Quality](/glossary/code-quality/) -- the multidimensional assessment of code that LOC measures only the size dimension of
- [Codebase](/glossary/codebase/) -- the complete collection of source files whose aggregate LOC represents the platform's scale
- [Quantitative Measure](/glossary/quantitative-measure/) -- the category of numeric metrics that includes LOC alongside coverage, latency, and throughput
- [Technical Debt](/glossary/technical-debt/) -- accumulated maintenance burden that often correlates with LOC growth without corresponding quality improvement
- [Code Coverage](/glossary/code-coverage/) -- the percentage of LOC exercised by tests, a quality metric that directly references line counts
- [Quality Measurement System](/glossary/quality-measurement-system/) -- the comprehensive framework within which LOC is one of many tracked metrics
- [Metrics](/glossary/metrics/) -- the broader discipline of software measurement that provides context for interpreting LOC
- [Refactoring](/glossary/refactoring/) -- the practice of improving code structure that typically reduces LOC while preserving or improving functionality
- [Maintainability](/glossary/maintainability/) -- the ease of modifying software, for which LOC is a coarse but useful predictor
- [Complexity](/glossary/system-complexity-chaos/) -- the inherent difficulty of a system, of which LOC captures only the surface area

## See Also

- [Static Analysis](/glossary/static-analysis/) -- automated code inspection that provides deeper insights than LOC counting alone
- [Git Trees](/glossary/git-trees/) -- the platform's fast file indexing tool that supports efficient LOC approximation
- [Quality Gates](/glossary/quality-gates/) -- automated checkpoints that evaluate code against multiple metrics including LOC-derived indicators
- [Compilation](/glossary/compilation/) -- the build process whose duration correlates with total LOC in the dependency graph
- [Performance Tracking](/glossary/performance-tracking/) -- monitoring system that can correlate LOC changes with runtime performance impacts

---

*Built with precision. Ready for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
