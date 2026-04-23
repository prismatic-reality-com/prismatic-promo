+++
title = "Codebase"
weight = 50
[extra]
description = "The complete collection of source code, configuration, tests, and documentation that constitutes a software system"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "beginner"
quality_score = 95
technical_level = "beginner-intermediate"
domain_category = "software-engineering"
related_concepts = ["umbrella-application", "lines-of-code", "project-structure", "git-trees", "compilation", "architecture", "modular-design"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 3
prerequisites = ["project-structure", "elixir"]
learning_path = ["project-structure", "codebase", "umbrella-application", "architecture", "git-trees"]
interactive_demos = ["/labs/glossary/codebase"]
code_examples = ["Elixir", "Shell"]
external_resources = ["https://elixir-lang.org/getting-started/mix-otp/dependencies-and-umbrella-projects.html", "https://hexdocs.pm/mix/Mix.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["codebase-metrics-collection", "file-tree-traversal", "dependency-analysis", "compilation-verification"]
keywords = ["codebase", "source code", "repository", "umbrella project", "monorepo", "lines of code", "file structure", "project organization"]
tags = ["glossary", "core", "architecture", "project-management"]
related_terms = ["lines-of-code", "umbrella-application", "project-structure", "git-trees", "compilation", "mix", "elixir", "architecture", "application", "mix-task", "code-quality", "quality-dna"]
word_count = 1675
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Codebase - Prismatic Platform"
+++

## Definition

A codebase is the complete collection of source code, configuration files, tests, documentation, build scripts, and related artifacts that together constitute a software system. It represents the totality of human-written (and increasingly machine-generated) instructions that define a system's behavior, structure, and operational characteristics. The codebase is the single source of truth for what a software system does, how it does it, and how it is built, tested, and deployed. In the Prismatic Platform, the codebase encompasses approximately 2.8 million lines of code across 115 [umbrella applications](@/glossary/umbrella-application.md), 48,124 total files, 530 AIAD agents, and 225 commands -- representing one of the most comprehensive Elixir platforms in existence.

## Overview

The concept of a codebase extends beyond mere source files. A modern codebase is a living system that evolves continuously through contributions, refactoring, and automated evolution. It encapsulates not just executable logic but also the accumulated design decisions, architectural patterns, quality standards, and domain knowledge of everyone who has contributed to it. The codebase is simultaneously a product (the thing that gets built and deployed), a process artifact (the output of development work), and a knowledge repository (the encoded understanding of the problem domain).

Codebase organization profoundly impacts developer productivity, system reliability, and long-term maintainability. Research from Google's monorepo team and Microsoft's codebase studies demonstrates that codebase structure directly correlates with team effectiveness -- well-organized codebases reduce onboarding time, minimize merge conflicts, enable faster code reviews, and reduce defect rates. Conversely, poorly organized codebases create friction that compounds over time, leading to what is commonly called "technical debt."

The scale of a codebase introduces distinct engineering challenges. Small codebases (under 100K LOC) can be held entirely in a single developer's mental model. Medium codebases (100K-1M LOC) require structured organization and tooling. Large codebases (1M+ LOC) demand sophisticated tooling for navigation, analysis, and build management. The Prismatic Platform, at 2.8M LOC, operates firmly in the large codebase category and employs specialized tools like [Git Trees](@/glossary/git-trees.md) for efficient navigation and [compilation](@/glossary/compilation.md) pipelines for build management.

Two primary organizational strategies exist for large codebases: the monorepo (single repository containing all code) and the polyrepo (multiple repositories for different components). Prismatic uses a monorepo with [umbrella application](@/glossary/umbrella-application.md) structure, which provides the benefits of unified versioning and atomic cross-cutting changes while maintaining logical separation between components.

## Technical Details

### Codebase Anatomy

A comprehensive codebase contains several categories of artifacts:

| Category | Purpose | Examples | Quality Considerations |
|----------|---------|----------|------------------------|
| **Source Code** | Executable business logic | `.ex`, `.exs`, `.eex` files | Readability, maintainability, testability |
| **Configuration** | Runtime and build-time parameters | `config/*.exs`, `mix.exs` | Externalization, environment separation |
| **Tests** | Quality assurance and behavior specification | `test/**/*.exixr` | Coverage, clarity, execution speed |
| **Documentation** | Human-readable explanations | `README.md`, `@moduledoc`, `@doc` | Completeness, accuracy, currency |
| **Build Scripts** | Automation for compilation and deployment | `mix.exs`, `Dockerfile`, CI/CD configs | Reproducibility, reliability |
| **Schema** | Data structure definitions | Ecto migrations, GraphQL schemas | Versioning, backward compatibility |
| **Assets** | UI resources and static files | CSS, JS, images, templates | Optimization, caching strategies |
| **Tooling** | Development productivity enhancers | Linters, formatters, analysis tools | Automation, consistency enforcement |

### Codebase Metrics and Analysis

Understanding codebase health requires quantitative measurement across multiple dimensions:

```elixir
defmodule PrismaticPlatform.CodebaseAnalyzer do
  @moduledoc """
  Comprehensive codebase analysis and metrics collection.

  Provides insights into codebase structure, quality, and evolution
  patterns to support development decisions and architectural reviews.
  """

  alias PrismaticPlatform.GitTrees
  alias PrismaticStorage.ETS

  @type metric_result :: %{
    metric: atom(),
    value: term(),
    timestamp: DateTime.t(),
    metadata: map()
  }

  @spec analyze_comprehensive() :: {:ok, map()} | {:error, term()}
  def analyze_comprehensive do
    start_time = System.monotonic_time(:microsecond)

    with {:ok, file_metrics} <- analyze_file_distribution(),
         {:ok, complexity_metrics} <- analyze_code_complexity(),
         {:ok, quality_metrics} <- analyze_quality_indicators(),
         {:ok, evolution_metrics} <- analyze_evolution_patterns(),
         {:ok, dependency_metrics} <- analyze_dependency_structure() do

      duration = System.monotonic_time(:microsecond) - start_time

      result = %{
        file_metrics: file_metrics,
        complexity_metrics: complexity_metrics,
        quality_metrics: quality_metrics,
        evolution_metrics: evolution_metrics,
        dependency_metrics: dependency_metrics,
        analysis_duration_us: duration,
        analyzed_at: DateTime.utc_now()
      }

      # Cache results for performance
      ETS.put(:codebase_analysis, :latest, result)
      {:ok, result}
    end
  end

  @spec analyze_file_distribution() :: {:ok, map()}
  def analyze_file_distribution do
    files_by_extension = GitTrees.files_by_extension()

    total_files = files_by_extension |> Map.values() |> Enum.sum()

    distribution = Map.new(files_by_extension, fn {ext, count} ->
      {ext, %{
        count: count,
        percentage: Float.round(count / total_files * 100, 2)
      }}
    end)

    size_analysis = analyze_file_sizes()

    {:ok, %{
      total_files: total_files,
      distribution_by_extension: distribution,
      size_analysis: size_analysis,
      largest_files: identify_largest_files(20)
    }}
  end

  @spec analyze_code_complexity() :: {:ok, map()}
  def analyze_code_complexity do
    elixir_files = GitTrees.list_files(".", type: :elixir)

    complexity_data = Enum.map(elixir_files, fn file ->
      analyze_single_file_complexity(file)
    end)
    |> Enum.reject(&is_nil/1)

    average_complexity = complexity_data
                        |> Enum.map(& &1.cyclomatic_complexity)
                        |> Statistics.mean()

    high_complexity_files = Enum.filter(complexity_data,
                                      & &1.cyclomatic_complexity > 10)

    {:ok, %{
      total_elixir_files: length(elixir_files),
      average_complexity: Float.round(average_complexity, 2),
      high_complexity_count: length(high_complexity_files),
      high_complexity_files: high_complexity_files,
      complexity_distribution: calculate_complexity_distribution(complexity_data)
    }}
  end

  @spec analyze_quality_indicators() :: {:ok, map()}
  def analyze_quality_indicators do
    # Analyze various quality indicators across the codebase
    with {:ok, typespec_coverage} <- calculate_typespec_coverage(),
         {:ok, documentation_coverage} <- calculate_documentation_coverage(),
         {:ok, test_coverage} <- calculate_test_coverage_distribution(),
         {:ok, code_style_compliance} <- analyze_code_style_compliance() do

      {:ok, %{
        typespec_coverage: typespec_coverage,
        documentation_coverage: documentation_coverage,
        test_coverage: test_coverage,
        style_compliance: code_style_compliance,
        quality_score: calculate_composite_quality_score([
          typespec_coverage.percentage,
          documentation_coverage.percentage,
          test_coverage.average_percentage,
          code_style_compliance.compliance_percentage
        ])
      }}
    end
  end

  @spec analyze_evolution_patterns() :: {:ok, map()}
  def analyze_evolution_patterns do
    # Analyze how the codebase has evolved over time
    with {:ok, commit_history} <- get_recent_commit_history(90),
         {:ok, file_churn} <- analyze_file_churn(commit_history),
         {:ok, contributor_patterns} <- analyze_contributor_patterns(commit_history) do

      {:ok, %{
        commits_last_90_days: length(commit_history),
        most_active_files: Enum.take(file_churn, 10),
        contributor_distribution: contributor_patterns,
        evolution_velocity: calculate_evolution_velocity(commit_history)
      }}
    end
  end

  defp analyze_single_file_complexity(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        case Code.string_to_quoted(content) do
          {:ok, ast} ->
            %{
              file: file_path,
              lines_of_code: count_lines_of_code(content),
              cyclomatic_complexity: calculate_cyclomatic_complexity(ast),
              function_count: count_functions(ast),
              module_count: count_modules(ast),
              average_function_length: calculate_average_function_length(ast)
            }
          {:error, _} ->
            nil
        end
      {:error, _} ->
        nil
    end
  end

  defp calculate_cyclomatic_complexity(ast) do
    # Traverse AST and count decision points
    complexity = 1  # Base complexity

    Macro.prewalk(ast, complexity, fn
      {:if, _, _}, acc -> {nil, acc + 1}
      {:case, _, _}, acc -> {nil, acc + 1}
      {:cond, _, _}, acc -> {nil, acc + 1}
      {:unless, _, _}, acc -> {nil, acc + 1}
      {:try, _, _}, acc -> {nil, acc + 1}
      {:receive, _, _}, acc -> {nil, acc + 1}
      {:|>, _, _}, acc -> {nil, acc + 1}  # Pipe adds decision complexity
      node, acc -> {node, acc}
    end)
    |> elem(1)
  end

  defp count_functions(ast) do
    {_, count} = Macro.prewalk(ast, 0, fn
      {:def, _, _}, acc -> {nil, acc + 1}
      {:defp, _, _}, acc -> {nil, acc + 1}
      node, acc -> {node, acc}
    end)
    count
  end

  defp calculate_composite_quality_score(percentages) do
    # Weighted average of quality indicators
    weights = [0.3, 0.25, 0.35, 0.1]  # typespec, docs, tests, style

    weighted_sum = percentages
                  |> Enum.zip(weights)
                  |> Enum.map(fn {score, weight} -> score * weight end)
                  |> Enum.sum()

    Float.round(weighted_sum, 1)
  end
end
```

### Codebase Navigation and Search

Efficient codebase navigation becomes critical at scale. The platform provides several tools for code discovery:

```elixir
defmodule PrismaticPlatform.CodebaseNavigator do
  @moduledoc """
  Advanced codebase navigation and code discovery utilities.

  Provides semantic search, pattern matching, and relationship
  analysis across the entire platform codebase.
  """

  alias PrismaticStorage.{ETS, Meilisearch}
  alias PrismaticPlatform.GitTrees

  @spec semantic_search(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def semantic_search(query, opts \\ []) do
    # Multi-faceted search across code, documentation, and comments
    search_scopes = Keyword.get(opts, :scopes, [:code, :docs, :comments])

    tasks = Enum.map(search_scopes, fn scope ->
      Task.async(fn -> search_in_scope(query, scope) end)
    end)

    results = Task.await_many(tasks, 10_000)
    combined_results = combine_and_rank_results(results, query)

    {:ok, combined_results}
  end

  @spec find_related_code(String.t()) :: {:ok, [map()]}
  def find_related_code(file_path) do
    with {:ok, dependencies} <- analyze_file_dependencies(file_path),
         {:ok, callers} <- find_code_callers(file_path),
         {:ok, similar_patterns} <- find_similar_patterns(file_path) do

      related_code = %{
        direct_dependencies: dependencies,
        calling_code: callers,
        similar_patterns: similar_patterns,
        relationship_strength: calculate_relationship_strength(dependencies, callers)
      }

      {:ok, related_code}
    end
  end

  @spec analyze_codebase_hotspots() :: {:ok, map()}
  def analyze_codebase_hotspots do
    # Identify frequently modified, highly coupled, or complex areas
    with {:ok, change_frequency} <- analyze_change_frequency(),
         {:ok, coupling_analysis} <- analyze_coupling_hotspots(),
         {:ok, complexity_hotspots} <- identify_complexity_hotspots() do

      hotspots = %{
        high_churn_files: change_frequency.high_churn,
        coupling_hotspots: coupling_analysis.hotspots,
        complexity_hotspots: complexity_hotspots,
        composite_risk_areas: identify_composite_risk_areas(
          change_frequency, coupling_analysis, complexity_hotspots
        )
      }

      {:ok, hotspots}
    end
  end

  defp search_in_scope(query, :code) do
    # Search in actual source code
    GitTrees.find(query, type: :elixir)
    |> Enum.map(&extract_code_context(&1, query))
  end

  defp search_in_scope(query, :docs) do
    # Search in documentation and comments
    Meilisearch.search(query, index: "documentation")
  end

  defp search_in_scope(query, :comments) do
    # Search in inline comments and module docs
    find_in_comments(query)
  end

  defp analyze_file_dependencies(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        {:ok, ast} = Code.string_to_quoted(content)
        dependencies = extract_dependencies_from_ast(ast)
        {:ok, dependencies}
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp extract_dependencies_from_ast(ast) do
    # Extract all module references, function calls, and imports
    dependencies = %{
      aliases: [],
      imports: [],
      module_references: [],
      function_calls: []
    }

    Macro.prewalk(ast, dependencies, fn
      {:alias, _, [{:__aliases__, _, modules}]}, acc ->
        module_name = Module.concat(modules)
        {nil, %{acc | aliases: [module_name | acc.aliases]}}

      {:import, _, [{:__aliases__, _, modules}]}, acc ->
        module_name = Module.concat(modules)
        {nil, %{acc | imports: [module_name | acc.imports]}}

      {{:., _, [{:__aliases__, _, modules}, _]}, _, _}, acc ->
        module_name = Module.concat(modules)
        {nil, %{acc | module_references: [module_name | acc.module_references]}}

      node, acc ->
        {node, acc}
    end)
    |> elem(1)
    |> Map.new(fn {key, list} -> {key, Enum.uniq(list)} end)
  end
end
```

## Codebase Evolution and Maintenance

Large codebases require systematic approaches to evolution and maintenance. The Prismatic Platform employs several strategies:

### Automated Quality Gates

Every code change passes through quality gates that enforce consistency and prevent regression:

```elixir
defmodule PrismaticPlatform.QualityGates do
  @moduledoc """
  Automated quality enforcement for codebase changes.
  """

  @spec validate_changeset([String.t()]) :: {:ok, :passed} | {:error, [violation()]}
  def validate_changeset(changed_files) do
    validations = [
      &validate_compilation/1,
      &validate_tests/1,
      &validate_documentation/1,
      &validate_type_coverage/1,
      &validate_style_consistency/1,
      &validate_performance_impact/1
    ]

    violations = Enum.flat_map(validations, fn validator ->
      case validator.(changed_files) do
        {:ok, _} -> []
        {:error, violations} -> violations
      end
    end)

    case violations do
      [] -> {:ok, :passed}
      violations -> {:error, violations}
    end
  end

  defp validate_type_coverage(changed_files) do
    elixir_files = Enum.filter(changed_files, &String.ends_with?(&1, ".ex"))

    violations = Enum.flat_map(elixir_files, fn file ->
      case check_typespec_coverage(file) do
        coverage when coverage < 0.95 ->
          [%{
            type: :insufficient_type_coverage,
            file: file,
            coverage: coverage,
            required: 0.95
          }]
        _ ->
          []
      end
    end)

    case violations do
      [] -> {:ok, :passed}
      violations -> {:error, violations}
    end
  end
end
```

| Category | Description | Prismatic Examples |
|----------|-------------|-------------------|
| **Source Code** | Executable logic, modules, functions | `apps/*/lib/**/*.ex` |
| **Tests** | Verification code, assertions, fixtures | `apps/*/test/**/*.exs` |
| **Configuration** | Environment settings, feature flags | `config/*.exs`, `.env` |
| **Build Scripts** | Compilation, dependency management | `mix.exs`, `Makefile` |
| **Documentation** | READMEs, guides, API docs | `CLAUDE.md`, `docs/` |
| **Infrastructure** | Deployment, CI/CD, containerization | `Dockerfile`, `.gitlab-ci.yml` |
| **Tooling** | Developer productivity, quality checks | `scripts/`, `.githooks/` |
| **Agent Definitions** | AIAD agent and command specs | `.aiad/agents/`, `.aiad/commands/` |
| **Static Assets** | CSS, JavaScript, images | `apps/prismatic_web/assets/` |
| **Migrations** | Database schema evolution | `apps/*/priv/repo/migrations/` |

### Codebase Metrics

Quantitative analysis of a codebase reveals its complexity, health, and evolution trajectory:

```elixir
defmodule Prismatic.Codebase.Analyzer do
  @moduledoc """
  Provides comprehensive codebase analysis including file counts,
  line metrics, dependency graphs, and complexity measurements.

  Uses git ls-tree for O(1) file enumeration (vs O(n) for find/ls)
  as mandated by the Git Trees protocol.
  """

  @type codebase_stats :: %{
          total_files: non_neg_integer(),
          total_lines: non_neg_integer(),
          source_files: non_neg_integer(),
          test_files: non_neg_integer(),
          umbrella_apps: non_neg_integer(),
          agents: non_neg_integer(),
          commands: non_neg_integer(),
          languages: map()
        }

  @type file_breakdown :: %{
          extension: String.t(),
          count: non_neg_integer(),
          total_lines: non_neg_integer(),
          percentage: float()
        }

  @spec analyze() :: {:ok, codebase_stats()} | {:error, term()}
  def analyze do
    with {:ok, files} <- list_all_files(),
         {:ok, stats} <- compute_statistics(files) do
      {:ok, stats}
    end
  end

  @spec list_all_files() :: {:ok, list(String.t())} | {:error, term()}
  defp list_all_files do
    case System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD"]) do
      {output, 0} ->
        files = String.split(output, "\n", trim: true)
        {:ok, files}

      {error, _code} ->
        {:error, {:git_error, error}}
    end
  end

  @spec compute_statistics(list(String.t())) :: {:ok, codebase_stats()} | {:error, term()}
  defp compute_statistics(files) do
    source_files = Enum.filter(files, &String.ends_with?(&1, ".ex"))
    test_files = Enum.filter(files, &String.ends_with?(&1, ".exs"))

    umbrella_apps =
      files
      |> Enum.filter(&String.starts_with?(&1, "apps/"))
      |> Enum.map(fn path -> path |> String.split("/") |> Enum.at(1) end)
      |> Enum.uniq()
      |> length()

    agents = Enum.count(files, &String.ends_with?(&1, ".agent.md"))
    commands = Enum.count(files, &String.ends_with?(&1, ".cmd.md"))

    stats = %{
      total_files: length(files),
      total_lines: 0,
      source_files: length(source_files),
      test_files: length(test_files),
      umbrella_apps: umbrella_apps,
      agents: agents,
      commands: commands,
      languages: compute_language_breakdown(files)
    }

    {:ok, stats}
  end

  @spec compute_language_breakdown(list(String.t())) :: map()
  defp compute_language_breakdown(files) do
    files
    |> Enum.group_by(&Path.extname/1)
    |> Enum.map(fn {ext, group} -> {ext, length(group)} end)
    |> Enum.sort_by(fn {_ext, count} -> count end, :desc)
    |> Map.new()
  end

  @spec file_breakdown() :: {:ok, list(file_breakdown())} | {:error, term()}
  def file_breakdown do
    with {:ok, files} <- list_all_files() do
      breakdown =
        files
        |> Enum.group_by(&Path.extname/1)
        |> Enum.map(fn {ext, group} ->
          %{
            extension: ext,
            count: length(group),
            total_lines: 0,
            percentage: length(group) / length(files) * 100
          }
        end)
        |> Enum.sort_by(& &1.count, :desc)

      {:ok, breakdown}
    end
  end
end
```

### Codebase Navigation with Git Trees

Efficient navigation of large codebases requires specialized tooling. The Prismatic Platform mandates use of [Git Trees](@/glossary/git-trees.md) for all codebase exploration, achieving approximately 100x performance improvement over traditional `find` and `ls -R` commands:

```bash
# Repository-wide statistics (~80ms for 48,124 files)
./scripts/git-trees.sh stats

# List files in a specific path
./scripts/git-trees.sh list apps/prismatic_web/lib

# Find files by regex pattern
./scripts/git-trees.sh find ".*_live\.ex$"

# List all umbrella applications with file counts
./scripts/git-trees.sh apps

# Elixir files only
./scripts/git-trees.sh elixir

# Recently modified files
./scripts/git-trees.sh recent 20

# Largest files by size
./scripts/git-trees.sh size
```

The performance difference is critical at scale: `git ls-tree` operates in approximately 80ms for the entire repository, while `find` requires 500ms or more -- a difference that compounds across thousands of daily operations.

### Monorepo vs. Polyrepo Trade-offs

| Factor | Monorepo | Polyrepo | Prismatic (Umbrella Monorepo) |
|--------|----------|----------|-------------------------------|
| **Atomic changes** | Cross-cutting changes in single commit | Requires coordinated multi-repo releases | Single commit across all 115 apps |
| **Dependency management** | Unified versioning | Independent versioning per repo | Mix umbrella dependency resolution |
| **Build complexity** | Requires sophisticated build system | Simpler per-repo builds | Mix handles incremental compilation |
| **CI/CD** | Longer pipelines (unless optimized) | Independent pipelines | Selective testing based on changed files |
| **Code sharing** | Direct imports | Package publication | Direct umbrella app references |
| **Repository size** | Grows large over time | Smaller individual repos | 48,124 files, managed via Git Trees |
| **Access control** | Repository-level only | Per-repo permissions | Umbrella app-level isolation |
| **Discoverability** | All code in one place | Requires registry/docs | `mix git_trees` + AIAD agent registry |

### Codebase Evolution Tracking

The Prismatic Platform tracks codebase evolution through multiple mechanisms:

| Mechanism | Purpose | Implementation |
|-----------|---------|----------------|
| **Quality DNA** | Cross-session quality continuity | `.claude/quality-dna/current-state.json` |
| **Session Context** | Development history tracking | `.claude/session-context/` |
| **Git History** | Version-level change tracking | Standard git log and diff |
| **AIAD Registry** | Agent and command evolution | `.claude/AGENT_REGISTRY.md` |
| **Generation Tracking** | Platform evolution generations | Currently Gen 19 (0.9995 fitness) |

## Implementation in Prismatic Platform

### Platform Codebase Architecture

The Prismatic Platform codebase is organized as an Elixir umbrella project with 115 applications:

```
prismatic-platform/
├── apps/                          # 115 umbrella applications
│   ├── prismatic/                 # Main API and coordination
│   ├── prismatic_web/             # LiveView dashboards (port 4000)
│   ├── prismatic_api/             # REST API gateway (port 4004)
│   ├── prismatic_agents/          # 370+ agent runtime
│   ├── prismatic_perimeter/       # EASM security ratings
│   ├── prismatic_storage_core/    # Storage traits and protocols
│   ├── prismatic_storage_ets/     # ETS adapter
│   ├── prismatic_storage_ecto/    # PostgreSQL adapter
│   ├── prismatic_storage_kuzu/    # KuzuDB graph adapter
│   ├── prismatic_storage_meili/   # Meilisearch adapter
│   ├── prismatic_claude/          # Claude integration
│   ├── prismatic_supervisor/      # Compositional supervision
│   ├── prismatic_safety/          # Quality floor guardian
│   └── ...                        # 100+ additional apps
├── .aiad/                         # Agent/command specifications
│   ├── agents/                    # 530 agent definitions
│   ├── commands/                  # 225 command definitions
│   ├── policies/                  # Enforcement policies
│   └── doctrine/                  # NM/ND, NABLA axioms
├── config/                        # Application configuration
├── priv/                          # Static assets, migrations
├── scripts/                       # Build and utility scripts
├── sites/                         # Promo site (Zola)
├── garden/                        # Legacy knowledge (22 repos)
├── docs/                          # Architecture documentation
└── .claude/                       # Session context, quality DNA
```

### Codebase Statistics (Current)

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | ~2.8 million |
| **Total Files** | 48,124 |
| **Umbrella Applications** | 115 |
| **AIAD Agents** | 530 |
| **AIAD Commands** | 214 |
| **Quality Score** | 100/100 (PERFECT) |
| **Quality Domains** | 13/13 (ALL PERFECT) |
| **Evolution Generation** | Gen 19 |
| **Fitness Score** | 0.9995 |
| **Primary Language** | Elixir |
| **Secondary Languages** | JavaScript, CSS, SQL, Lean4 |

### Quality Enforcement Across the Codebase

Every file in the codebase is subject to quality enforcement:

- **Source files** (`.ex`): [Compilation](@/glossary/compilation.md) with `--warnings-as-errors`, [Credo](@/glossary/credo.md) strict analysis, [Dialyzer](@/glossary/dialyzer.md) type checking, typespec coverage, forbidden pattern detection
- **Test files** (`.exs`): Test execution with coverage, regression test requirements
- **Configuration** (`.exs`): Compilation validation, security scanning for secrets
- **Documentation** (`.md`): Content quality scoring (word count, sections, cross-references)
- **Templates** (`.heex`): Template validation, Flowbite compliance, TailwindCSS enforcement

## Comparison with Alternatives

| Codebase Strategy | Scale | Coordination | Build Speed | Team Size |
|-------------------|-------|--------------|-------------|-----------|
| **Single App** | Small (<50K LOC) | Minimal | Fast | 1-5 devs |
| **Polyrepo** | Medium-Large | High overhead | Per-repo fast | 10-100 devs |
| **Monorepo (Google-style)** | Massive (1B+ LOC) | Unified | Custom build system | 1000+ devs |
| **Elixir Umbrella** | Medium-Large | Built-in Mix support | Incremental compilation | 5-50 devs |
| **Prismatic Umbrella** | Large (2.8M LOC) | AIAD + Git Trees + Quality DNA | Optimized incremental | Platform-scale |

The Elixir umbrella approach provides a natural middle ground between monorepo and polyrepo strategies. Each umbrella application maintains its own `mix.exs`, test suite, and configuration while sharing a common build infrastructure and enabling cross-application references without package publication.

## Best Practices

1. **Organize by domain, not by type**: Group related code into coherent umbrella applications rather than separating by file type (models, views, controllers).

2. **Enforce consistent structure**: Every umbrella application should follow the same directory layout, naming conventions, and quality standards.

3. **Use efficient navigation tools**: At scale, traditional file system tools become bottlenecks. Use specialized tools like Git Trees for codebase exploration.

4. **Track codebase health metrics**: Monitor lines of code, test coverage, compilation warnings, type coverage, and quality scores continuously.

5. **Document architecture decisions**: Maintain ADRs (Architecture Decision Records) and per-application documentation so the codebase is self-documenting.

6. **Automate quality enforcement**: Use pre-commit hooks, CI/CD gates, and automated analysis to maintain quality standards without manual intervention.

7. **Version everything together**: In a monorepo, all applications version together, ensuring compatibility and enabling atomic cross-cutting changes.

8. **Manage dependencies explicitly**: Use Mix's built-in dependency management for umbrella applications, with explicit `deps` declarations in each application's `mix.exs`.

## Common Pitfalls

1. **Letting the codebase grow without structure**: Uncontrolled growth leads to tangled dependencies, circular references, and increasingly difficult maintenance. Regular refactoring is essential.

2. **Ignoring build performance**: As codebases grow, build times increase. Without optimization (incremental compilation, caching, selective testing), developer productivity degrades.

3. **Inconsistent conventions across applications**: When different parts of the codebase follow different conventions, cognitive overhead increases for every developer working across boundaries.

4. **Missing documentation**: A codebase without documentation forces every new developer to reverse-engineer intent from code, wasting significant time.

5. **Tight coupling between applications**: Umbrella applications should communicate through well-defined interfaces. Direct access to another application's internal modules creates hidden dependencies.

6. **Neglecting dead code removal**: Unused modules, functions, and files accumulate over time, increasing codebase size without providing value. Regular cleanup is necessary.

7. **Over-abstracting prematurely**: Creating abstractions before patterns are clear leads to wrong abstractions that are harder to change than duplicate code.

8. **Not tracking technical debt**: Unmeasured debt compounds silently. Systematic tracking (like Prismatic's Quality DNA) makes debt visible and manageable.

## Use Cases

### Platform Development at Scale

The Prismatic Platform demonstrates how a 2.8M LOC codebase can maintain perfect quality scores through rigorous automated enforcement. The combination of umbrella application structure, Git Trees navigation, and multi-domain quality checking enables productive development at scale.

### Knowledge Preservation

A well-organized codebase serves as institutional memory. When developers leave or priorities shift, the codebase -- with its tests, documentation, and commit history -- preserves the accumulated knowledge. Prismatic's session context system and AIAD agent definitions extend this further by capturing decision rationale alongside code.

### Automated Evolution

The codebase is the substrate on which automated evolution operates. Prismatic's autoevolve and autoheal systems scan the codebase for improvement opportunities, suggest refactorings, and enforce quality standards -- treating the codebase as a living system that continuously improves.

### Open Source Distribution

The promo site at `sites/promo/` demonstrates how a codebase can include public-facing content alongside private implementation code, with strict separation ensuring no source code leaks into the public site.

## Related Concepts

- [Umbrella Application](@/glossary/umbrella-application.md) -- Elixir's native multi-application project structure
- [Lines of Code](@/glossary/lines-of-code.md) -- Quantitative measurement of codebase size
- [Project Structure](@/glossary/project-structure.md) -- Organizational patterns for source code
- [Git Trees](@/glossary/git-trees.md) -- Efficient codebase navigation using git ls-tree
- [Compilation](@/glossary/compilation.md) -- Transforming source code into executable form
- [Code Quality](@/glossary/code-quality.md) -- Standards and practices for maintaining high-quality code
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session quality tracking and continuity
- [Architecture](@/glossary/architecture.md) -- System-level structural design decisions
- [Mix](@/glossary/mix.md) -- Elixir's build tool for managing the codebase
- [Application](@/glossary/application.md) -- Individual OTP application within the umbrella

## See Also

- Glossary Index -- Complete glossary of Prismatic Platform terminology
- [Elixir](@/glossary/elixir.md) -- The primary language of the Prismatic codebase
- [Quality Gates](@/glossary/quality-gates.md) -- Automated quality enforcement checkpoints

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
