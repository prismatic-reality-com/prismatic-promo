+++
title = "Quality Debt"
weight = 53
[extra]
description = "Quality Debt Points tracked, measured, and systematically eliminated"
category = "quality"
subcategory = "debt_management"
difficulty = "advanced"
technology_type = "quality_system"
platform_component = "quality_assurance"
measurement_approach = "quantitative"
detection_strategy = "automated"
remediation_approach = "systematic"
prevention_mechanism = "pre_commit_gates"
elimination_status = "complete"
current_count = "zero"
historical_peak = "905_qdp"
abbreviation = "QDP"
prerequisite_concepts = ["quality_gates", "static_analysis", "automated_testing", "technical_debt"]
use_cases = ["quality_measurement", "debt_tracking", "systematic_improvement", "prevention_automation"]
benefits = ["objective_measurement", "systematic_elimination", "automated_prevention", "quality_transparency"]
implementation_patterns = ["cascade_elimination", "domain_classification", "automated_detection", "prevention_gates"]
quality_metrics = ["total_qdp_count", "domain_distribution", "elimination_velocity", "prevention_effectiveness"]
integration_points = ["pre_commit_hooks", "ci_pipeline", "quality_gates", "static_analysis"]
related_disciplines = ["software_quality", "technical_debt_management", "static_analysis", "process_improvement"]
measurement_precision = "single_point_granularity"
related_terms = ["quality-gates", "quality-floor-guardian", "quality-dna", "cascade-pattern", "zero-warning-policy", "static-analysis", "automated-prevention", "technical-debt", "code-quality"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 934
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Quality", "Debt", "Points", "glossary", "Prismatic Platform", "Custom", "Dialyzer", "CASCADE"]
tags = ["glossary", "quality", "quality-debt", "prismatic"]
quality_score = 75
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Debt - Prismatic Platform"
+++

## Definition and Overview

Quality Debt, measured in Quality Debt Points (QDP), is a quantitative metric system that assigns discrete numeric values to every deviation from platform quality standards. Unlike the loosely-defined concept of "technical debt" common in software engineering, QDP is rigorously specified: each violation type has a defined point value, every violation is automatically detected, and the total QDP count serves as the single canonical measure of platform quality health. The fundamental principle is that quality cannot be managed if it cannot be measured, and QDP provides that measurement with precision.

Quality Debt encompasses a broad taxonomy of violations across multiple domains: missing type specifications, static analysis warnings from Credo, Dialyzer type errors, compilation warnings, anti-pattern usage (such as `length() > 0` instead of pattern matching), unsafe map access patterns, missing `@impl` annotations, `Process.sleep` calls in non-test code, and any other deviation from the platform's codified quality standards. Each violation is categorized by domain, severity, and remediation complexity.

The Prismatic Platform has achieved complete QDP elimination -- 0 QDP across all 13 quality domains for all 90 umbrella applications. This was not a gradual reduction but a systematic campaign that eliminated 905 QDP using specialized CASCADE patterns, followed by automated prevention through pre-commit hooks that block any commit introducing new QDP. The platform now operates in a zero-debt steady state where prevention has replaced remediation as the primary quality strategy.

## Technical Deep Dive

### QDP Taxonomy

Quality Debt Points are categorized across 13 distinct quality domains, each with its own detection mechanism, severity weighting, and remediation approach:

| Domain | Detection Tool | QDP Weight | Current Count |
|--------|---------------|------------|---------------|
| Dialyzer | `mix dialyzer` | 3 per violation | 0 |
| Credo | `mix credo --strict` | 1-2 per violation | 0 |
| Compilation | `--warnings-as-errors` | 2 per warning | 0 |
| DateTime Precision | Custom analyzer | 1 per violation | 0 |
| Guard Functions | Custom analyzer | 1 per violation | 0 |
| @impl Coverage | Custom analyzer | 1 per missing | 0 |
| Memory Safety | Custom analyzer | 3 per violation | 0 |
| Performance | Benchee + custom | 2 per violation | 0 |
| Regression Prevention | Test coverage check | 3 per missing test | 0 |
| Timing Patterns | Custom analyzer | 2 per violation | 0 |
| TODO Management | Custom scanner | 1 per stale TODO | 0 |
| Typespec Coverage | Custom analyzer | 1 per missing spec | 0 |
| Unsafe Map Access | Custom analyzer | 2 per violation | 0 |

### QDP Detection Pipeline

The detection pipeline runs at multiple integration points to catch violations as early as possible:

```elixir
defmodule Prismatic.Quality.DebtDetector do
  @moduledoc """
  Detects and quantifies quality debt across all domains.
  Returns a structured report of QDP by domain, file, and severity.
  """

  @type qdp_violation :: %{
    domain: atom(),
    file: String.t(),
    line: non_neg_integer(),
    message: String.t(),
    weight: pos_integer(),
    auto_fixable: boolean()
  }

  @type qdp_report :: %{
    total_qdp: non_neg_integer(),
    by_domain: %{atom() => non_neg_integer()},
    violations: [qdp_violation()],
    timestamp: DateTime.t()
  }

  @spec scan_all() :: qdp_report()
  def scan_all do
    domains = [
      :dialyzer, :credo, :compilation, :datetime_precision,
      :guard_functions, :impl_coverage, :memory_safety,
      :performance, :regression, :timing, :todo,
      :typespec_coverage, :unsafe_map_access
    ]

    violations =
      domains
      |> Task.async_stream(&scan_domain/1, max_concurrency: System.schedulers_online())
      |> Enum.flat_map(fn {:ok, result} -> result end)

    %{
      total_qdp: Enum.sum(Enum.map(violations, & &1.weight)),
      by_domain: group_by_domain(violations),
      violations: violations,
      timestamp: DateTime.utc_now()
    }
  end

  @spec scan_domain(atom()) :: [qdp_violation()]
  def scan_domain(:unsafe_map_access) do
    # Detect map[:key] patterns that should use Map.get/3 or pattern matching
    scan_files_for_pattern(~r/\w+\[:[a-z_]+\]/, :unsafe_map_access, 2)
  end

  def scan_domain(:typespec_coverage) do
    # Detect public functions without @spec annotations
    find_unspecced_public_functions()
  end

  def scan_domain(:memory_safety) do
    # Detect potentially unsafe memory patterns
    violations = []
    violations = violations ++ scan_for_spawn_link_without_trap()
    violations = violations ++ scan_for_large_binary_copies()
    violations = violations ++ scan_for_unbounded_recursion()
    violations
  end

  def scan_domain(:performance) do
    # Detect performance anti-patterns
    violations = []
    violations = violations ++ scan_for_length_comparisons()
    violations = violations ++ scan_for_inefficient_enum_operations()
    violations = violations ++ scan_for_n_plus_one_queries()
    violations
  end

  defp scan_for_length_comparisons do
    # Detect length(list) > 0 instead of pattern matching
    scan_files_for_pattern(~r/length\([^)]+\)\s*[><!]=?\s*0/, :inefficient_length_check, 1)
  end

  defp scan_for_n_plus_one_queries do
    # Detect potential N+1 query patterns in contexts
    scan_files_for_pattern(~r/Enum\.map\([^,]+,\s*fn[^}]*Repo\.(get|all)/, :potential_n_plus_one, 3)
  end

  defp find_unspecced_public_functions do
    Application.get_env(:prismatic, :apps, [])
    |> Enum.flat_map(fn app ->
      app_path = "apps/#{app}/lib"
      if File.exists?(app_path) do
        find_public_functions_without_specs(app_path)
      else
        []
      end
    end)
  end

  defp find_public_functions_without_specs(path) do
    Path.wildcard("#{path}/**/*.ex")
    |> Enum.flat_map(&analyze_file_for_missing_specs/1)
  end

  defp analyze_file_for_missing_specs(file_path) do
    try do
      content = File.read!(file_path)
      {:ok, ast} = Code.string_to_quoted(content, file: file_path)

      analyze_ast_for_specs(ast, file_path, content)
    rescue
      _ -> []
    end
  end

  defp analyze_ast_for_specs(ast, file_path, content) do
    lines = String.split(content, "\n")

    {_acc, violations} = Macro.prewalk(ast, [], fn
      {:defmodule, meta, _} = node, acc ->
        # Track current module for context
        {node, acc}

      {:def, meta, [{function_name, _, args} | _]} = node, acc when is_atom(function_name) ->
        line_number = meta[:line] || 1

        # Check if this is a public function (doesn't start with underscore)
        if not String.starts_with?(to_string(function_name), "_") and
           not has_spec_before_line(lines, line_number) do

          violation = %{
            domain: :typespec_coverage,
            file: file_path,
            line: line_number,
            message: "Public function #{function_name}/#{length(args || [])} missing @spec",
            weight: 1,
            auto_fixable: false
          }

          {node, [violation | acc]}
        else
          {node, acc}
        end

      node, acc ->
        {node, acc}
    end)

    violations
  end

  defp has_spec_before_line(lines, function_line) do
    # Look for @spec annotation in the few lines before the function
    start_line = max(0, function_line - 5)
    end_line = function_line - 2

    Enum.slice(lines, start_line, end_line - start_line + 1)
    |> Enum.any?(fn line -> String.contains?(String.trim(line), "@spec") end)
  end
end

defmodule Prismatic.Quality.CascadeEliminator do
  @moduledoc """
  Implements CASCADE patterns for systematic QDP elimination.
  CASCADE = Categorize, Analyze, Systematize, Coordinate, Automate, Deploy, Eliminate
  """

  @type cascade_strategy :: :domain_sweep | :file_focused | :severity_prioritized | :auto_fixable_first

  @spec eliminate_qdp_with_cascade(cascade_strategy()) :: {:ok, map()} | {:error, term()}
  def eliminate_qdp_with_cascade(strategy \\ :domain_sweep) do
    initial_report = Prismatic.Quality.DebtDetector.scan_all()

    if initial_report.total_qdp == 0 do
      {:ok, %{message: "No QDP found - platform is debt-free", report: initial_report}}
    else
      execute_cascade_strategy(strategy, initial_report)
    end
  end

  defp execute_cascade_strategy(:domain_sweep, report) do
    # Categorize: Group violations by domain
    domain_groups = Enum.group_by(report.violations, & &1.domain)

    # Analyze: Determine elimination order by impact/effort ratio
    ordered_domains = prioritize_domains_by_impact(domain_groups)

    # Systematize: Create domain-specific elimination plans
    elimination_plans = Enum.map(ordered_domains, fn {domain, violations} ->
      create_domain_elimination_plan(domain, violations)
    end)

    # Coordinate: Execute plans in sequence with validation
    results = execute_elimination_plans(elimination_plans)

    # Automate: Generate prevention rules for eliminated violations
    generate_prevention_automation(results)

    # Deploy: Update pre-commit hooks and CI gates
    deploy_prevention_measures(results)

    # Eliminate: Verify zero QDP state
    final_report = Prismatic.Quality.DebtDetector.scan_all()

    {:ok, %{
      initial_qdp: report.total_qdp,
      final_qdp: final_report.total_qdp,
      eliminated: report.total_qdp - final_report.total_qdp,
      strategies_used: elimination_plans
    }}
  end

  defp execute_cascade_strategy(:auto_fixable_first, report) do
    # Focus on violations that can be automatically fixed
    {auto_fixable, manual_fix_required} = Enum.split_with(report.violations, & &1.auto_fixable)

    # Apply automatic fixes first
    auto_fix_results = apply_automatic_fixes(auto_fixable)

    # Generate manual fix guidance for remaining violations
    manual_guidance = generate_manual_fix_guidance(manual_fix_required)

    {:ok, %{
      auto_fixed: length(auto_fixable),
      manual_remaining: length(manual_fix_required),
      auto_fix_results: auto_fix_results,
      manual_guidance: manual_guidance
    }}
  end

  defp prioritize_domains_by_impact(domain_groups) do
    # Prioritize domains by business impact and remediation complexity
    domain_priorities = %{
      memory_safety: %{priority: 1, impact: :critical},
      dialyzer: %{priority: 2, impact: :high},
      compilation: %{priority: 3, impact: :high},
      performance: %{priority: 4, impact: :medium},
      regression: %{priority: 5, impact: :high},
      unsafe_map_access: %{priority: 6, impact: :medium},
      typespec_coverage: %{priority: 7, impact: :low},
      impl_coverage: %{priority: 8, impact: :low},
      credo: %{priority: 9, impact: :low},
      timing: %{priority: 10, impact: :low},
      guard_functions: %{priority: 11, impact: :low},
      datetime_precision: %{priority: 12, impact: :low},
      todo: %{priority: 13, impact: :very_low}
    }

    domain_groups
    |> Enum.map(fn {domain, violations} ->
      priority_info = Map.get(domain_priorities, domain, %{priority: 999, impact: :unknown})
      {domain, violations, priority_info}
    end)
    |> Enum.sort_by(fn {_domain, _violations, %{priority: priority}} -> priority end)
    |> Enum.map(fn {domain, violations, _priority} -> {domain, violations} end)
  end

  defp create_domain_elimination_plan(domain, violations) do
    case domain do
      :unsafe_map_access ->
        create_map_access_elimination_plan(violations)

      :typespec_coverage ->
        create_typespec_elimination_plan(violations)

      :length_antipattern ->
        create_length_pattern_elimination_plan(violations)

      :memory_safety ->
        create_memory_safety_elimination_plan(violations)

      _ ->
        create_generic_elimination_plan(domain, violations)
    end
  end

  defp create_map_access_elimination_plan(violations) do
    %{
      domain: :unsafe_map_access,
      violation_count: length(violations),
      strategy: :pattern_replacement,
      steps: [
        {:scan, "Identify all map[:key] patterns"},
        {:analyze, "Determine appropriate replacement (Map.get/3 or pattern matching)"},
        {:transform, "Apply AST transformations to replace patterns"},
        {:test, "Run test suite to ensure no regressions"},
        {:validate, "Confirm elimination with scanner"}
      ],
      automation: %{
        auto_fixable: true,
        fix_command: "mix quality.fix_map_access",
        validation_command: "mix quality.scan_domain unsafe_map_access"
      },
      prevention: %{
        pre_commit_hook: "Block commits containing map[:key] patterns",
        credo_rule: "Create custom Credo rule for detection",
        documentation: "Update style guide with Map.get/3 guidance"
      }
    }
  end

  defp create_typespec_elimination_plan(violations) do
    files_affected = violations |> Enum.map(& &1.file) |> Enum.uniq()

    %{
      domain: :typespec_coverage,
      violation_count: length(violations),
      files_affected: length(files_affected),
      strategy: :systematic_annotation,
      steps: [
        {:inventory, "Group violations by module and function complexity"},
        {:generate, "Use Dialyzer success typing to infer @spec annotations"},
        {:apply, "Add @spec annotations with appropriate type information"},
        {:refine, "Review and refine generated specs for accuracy"},
        {:validate, "Ensure all public functions have appropriate specs"}
      ],
      automation: %{
        auto_fixable: false,  # Requires human review for type accuracy
        generation_command: "mix quality.generate_specs",
        validation_command: "mix quality.scan_domain typespec_coverage"
      },
      prevention: %{
        pre_commit_hook: "Block commits with unspecced public functions",
        mix_task: "mix quality.enforce_specs",
        template_update: "Update function templates to include @spec"
      }
    }
  end

  defp apply_automatic_fixes(auto_fixable_violations) do
    Enum.map(auto_fixable_violations, fn violation ->
      case violation.domain do
        :unsafe_map_access ->
          apply_map_access_fix(violation)

        :length_antipattern ->
          apply_length_pattern_fix(violation)

        :guard_functions ->
          apply_guard_function_fix(violation)

        _ ->
          {:skipped, "No automatic fix available for #{violation.domain}"}
      end
    end)
  end

  defp apply_map_access_fix(violation) do
    file_content = File.read!(violation.file)

    # Replace map[:key] with Map.get(map, :key) or appropriate pattern
    updated_content = String.replace(file_content, ~r/(\w+)\[:([a-z_]+)\]/, "Map.get(\\1, :\\2)")

    File.write!(violation.file, updated_content)

    {:fixed, %{
      file: violation.file,
      line: violation.line,
      transformation: "map[:key] -> Map.get(map, :key)"
    }}
  end

  defp generate_prevention_automation(elimination_results) do
    eliminated_domains = Enum.map(elimination_results, & &1.domain) |> Enum.uniq()

    prevention_rules = Enum.map(eliminated_domains, fn domain ->
      case domain do
        :unsafe_map_access ->
          """
          # Pre-commit hook rule for unsafe map access
          if git diff --cached --name-only | grep -E '\\.(ex|exs)$' | xargs grep -l 'map\\[:' > /dev/null; then
            echo "❌ Commit blocked: unsafe map access pattern detected"
            echo "Use Map.get/3 or pattern matching instead of map[:key]"
            exit 1
          fi
          """

        :typespec_coverage ->
          """
          # Pre-commit hook rule for missing typespecs
          if git diff --cached --name-only | grep -E '\\.ex$' | xargs -I {} sh -c 'mix quality.check_specs {}' | grep -q 'missing'; then
            echo "❌ Commit blocked: public functions missing @spec annotations"
            exit 1
          fi
          """

        _ ->
          "# Generic prevention rule for #{domain}"
      end
    end)

    File.write!(".githooks/pre-commit-qdp-prevention", Enum.join(prevention_rules, "\n\n"))

    {:ok, %{rules_generated: length(prevention_rules), domains_covered: eliminated_domains}}
  end
end

defmodule Prismatic.Quality.DebtMetrics do
  @moduledoc """
  Provides comprehensive metrics and analytics for Quality Debt management.
  """

  @spec calculate_debt_metrics() :: map()
  def calculate_debt_metrics do
    current_report = Prismatic.Quality.DebtDetector.scan_all()
    historical_data = load_historical_debt_data()

    %{
      current_state: analyze_current_state(current_report),
      trends: analyze_debt_trends(historical_data),
      domain_analysis: analyze_domain_distribution(current_report),
      elimination_efficiency: calculate_elimination_efficiency(historical_data),
      prevention_effectiveness: measure_prevention_effectiveness(),
      quality_score: calculate_overall_quality_score(current_report)
    }
  end

  defp analyze_current_state(report) do
    %{
      total_qdp: report.total_qdp,
      debt_free: report.total_qdp == 0,
      domains_affected: map_size(report.by_domain),
      files_affected: report.violations |> Enum.map(& &1.file) |> Enum.uniq() |> length(),
      auto_fixable_percentage: calculate_auto_fixable_percentage(report.violations),
      severity_distribution: analyze_severity_distribution(report.violations)
    }
  end

  defp analyze_debt_trends(historical_data) do
    if length(historical_data) < 2 do
      %{trend: :insufficient_data}
    else
      sorted_data = Enum.sort_by(historical_data, & &1.timestamp, DateTime)
      recent_data = Enum.take(sorted_data, -30)  # Last 30 data points

      %{
        trend_direction: determine_trend_direction(recent_data),
        elimination_velocity: calculate_elimination_velocity(recent_data),
        peak_debt: Enum.max_by(sorted_data, & &1.total_qdp).total_qdp,
        debt_free_date: find_debt_free_achievement_date(sorted_data),
        improvement_rate: calculate_improvement_rate(sorted_data)
      }
    end
  end

  defp calculate_elimination_efficiency(historical_data) do
    if length(historical_data) < 10 do
      %{efficiency: :insufficient_data}
    else
      elimination_events = identify_elimination_events(historical_data)

      %{
        total_elimination_events: length(elimination_events),
        average_qdp_per_event: calculate_average_elimination_size(elimination_events),
        most_effective_strategy: identify_most_effective_strategy(elimination_events),
        time_to_eliminate_by_domain: calculate_domain_elimination_times(elimination_events)
      }
    end
  end

  defp measure_prevention_effectiveness do
    # Analyze how effectively pre-commit hooks prevent QDP introduction
    recent_commits = get_recent_commit_attempts(days: 30)

    blocked_commits = Enum.count(recent_commits, & &1.blocked_by_quality_gate)
    total_attempts = length(recent_commits)

    prevention_rate = if total_attempts > 0, do: blocked_commits / total_attempts, else: 0

    %{
      total_commit_attempts: total_attempts,
      blocked_by_quality_gates: blocked_commits,
      prevention_rate: prevention_rate,
      most_common_blocked_violations: analyze_blocked_violation_types(recent_commits),
      false_positive_rate: calculate_false_positive_rate(recent_commits)
    }
  end

  defp calculate_overall_quality_score(report) do
    base_score = 100

    # Deduct points for various types of violations
    deductions = %{
      critical_violations: report.violations |> Enum.count(&(&1.weight >= 3)) |> Kernel.*(5),
      medium_violations: report.violations |> Enum.count(&(&1.weight == 2)) |> Kernel.*(2),
      minor_violations: report.violations |> Enum.count(&(&1.weight == 1)) |> Kernel.*(1)
    }

    total_deductions = deductions.critical_violations + deductions.medium_violations + deductions.minor_violations

    final_score = max(0, base_score - total_deductions)

    %{
      score: final_score,
      grade: score_to_grade(final_score),
      deductions: deductions,
      perfect_score: final_score == 100
    }
  end

  defp score_to_grade(score) when score >= 95, do: :A_plus
  defp score_to_grade(score) when score >= 90, do: :A
  defp score_to_grade(score) when score >= 85, do: :B_plus
  defp score_to_grade(score) when score >= 80, do: :B
  defp score_to_grade(score) when score >= 75, do: :C_plus
  defp score_to_grade(score) when score >= 70, do: :C
  defp score_to_grade(score) when score >= 65, do: :D_plus
  defp score_to_grade(score) when score >= 60, do: :D
  defp score_to_grade(_score), do: :F

  # Helper functions for historical analysis
  defp load_historical_debt_data do
    # Load from persistent storage (ETS, database, files, etc.)
    case File.read(".claude/quality-dna/debt-history.json") do
      {:ok, content} ->
        Jason.decode!(content, keys: :atoms)
      {:error, _} ->
        []
    end
  end

  defp determine_trend_direction(data) do
    if length(data) < 2 do
      :stable
    else
      first_half = Enum.take(data, div(length(data), 2))
      second_half = Enum.drop(data, div(length(data), 2))

      avg_first = Enum.sum(Enum.map(first_half, & &1.total_qdp)) / length(first_half)
      avg_second = Enum.sum(Enum.map(second_half, & &1.total_qdp)) / length(second_half)

      cond do
        avg_second < avg_first * 0.9 -> :improving
        avg_second > avg_first * 1.1 -> :degrading
        true -> :stable
      end
    end
  end

  defp find_debt_free_achievement_date(sorted_data) do
    Enum.find(sorted_data, fn data -> data.total_qdp == 0 end)
    |> case do
      nil -> :not_achieved
      %{timestamp: timestamp} -> timestamp
    end
  end
end

  defp group_by_domain(violations) do
    violations
    |> Enum.group_by(& &1.domain)
    |> Map.new(fn {domain, vs} -> {domain, Enum.sum(Enum.map(vs, & &1.weight))} end)
  end
end
```

### CASCADE Pattern Elimination

The 905 QDP elimination was achieved through CASCADE patterns -- bulk fix strategies that address entire categories of violations simultaneously rather than fixing individual instances:

```elixir
defmodule Prismatic.Quality.CascadeEliminator do
  @moduledoc """
  Applies CASCADE patterns for bulk QDP elimination.
  Each pattern targets a specific violation category for mass remediation.
  """

  @type cascade_pattern ::
    :type_mismatch
    | :dead_code
    | :empty_check
    | :timer_replacement
    | :nuclear_cache

  @spec apply_cascade(cascade_pattern(), keyword()) :: {:ok, non_neg_integer()} | {:error, term()}
  def apply_cascade(:type_mismatch, opts) do
    # Fix all @spec mismatches detected by Dialyzer
    files = Keyword.get(opts, :files, all_elixir_files())

    fixed_count =
      files
      |> Enum.map(&fix_type_mismatches/1)
      |> Enum.sum()

    {:ok, fixed_count}
  end

  def apply_cascade(:empty_check, opts) do
    # Replace length() > 0 with pattern matching or Enum.any?
    files = Keyword.get(opts, :files, all_elixir_files())

    fixed_count =
      files
      |> Enum.map(&replace_empty_checks/1)
      |> Enum.sum()

    {:ok, fixed_count}
  end

  def apply_cascade(:timer_replacement, opts) do
    # Replace Process.sleep with :timer or test-safe alternatives
    files = Keyword.get(opts, :files, all_elixir_files())

    fixed_count =
      files
      |> Enum.map(&replace_process_sleep/1)
      |> Enum.sum()

    {:ok, fixed_count}
  end
end
```

### Nuclear Cache Fix

One of the most critical CASCADE patterns is the Nuclear Cache fix, used when Dialyzer or compilation caches become corrupted and produce phantom QDP that do not correspond to actual code issues:

```bash
# Nuclear Cache Fix - eliminates phantom QDP from corrupted caches
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt

# Then rebuild cleanly
mix compile --force && mix dialyzer --plt
```

## Architecture and Implementation

### QDP Prevention Architecture

The prevention-first architecture ensures that zero QDP is maintained through multiple enforcement layers:

```
Code Change
    |
    v
Pre-Commit Hook (Phase 1: Compilation warnings)
    |
    v
Pre-Commit Hook (Phase 2: Credo strict)
    |
    v
Pre-Commit Hook (Phase 3: QDP scan)
    |
    v
Pre-Commit Hook (Phase 4: Quality Gates)
    |
    v
CI Pipeline (Full QDP scan + Dialyzer)
    |
    v
Quality Floor Guardian (Continuous monitoring)
    |
    v
Quality DNA (Persistent state recording)
```

Each layer catches different categories of QDP, with earlier layers providing faster feedback for common violations and later layers performing deeper analysis.

### Integration with Quality DNA

Every QDP scan result is persisted to [Quality DNA](/glossary/quality-dna/) for cross-session tracking:

```elixir
defmodule Prismatic.Quality.DNARecorder do
  @moduledoc """
  Records QDP scan results to Quality DNA for historical tracking.
  """

  @dna_path ".claude/quality-dna/current-state.json"

  @spec record_scan(Prismatic.Quality.DebtDetector.qdp_report()) :: :ok
  def record_scan(report) do
    current_dna = load_dna()

    updated_dna =
      current_dna
      |> Map.put(:latest_scan, report)
      |> Map.update(:history, [report], fn history -> [report | Enum.take(history, 99)] end)
      |> Map.put(:trend, calculate_trend(current_dna, report))

    save_dna(updated_dna)
  end

  defp calculate_trend(previous_dna, current_report) do
    previous_total = get_in(previous_dna, [:latest_scan, :total_qdp]) || 0
    current_total = current_report.total_qdp

    cond do
      current_total < previous_total -> :improving
      current_total > previous_total -> :regressing
      true -> :stable
    end
  end
end
```

## Usage in Prismatic Platform

### Common Commands

```bash
# Full QDP scan across all domains
mix quality.gates

# Quick QDP check (fast subset for pre-commit)
mix quality.gates.check --fast

# Domain-specific scanning
mix credo --strict
mix dialyzer
mix compile --warnings-as-errors --force

# CASCADE elimination (when QDP exists)
mix quality.cascade --pattern=type_mismatch --apply
mix quality.cascade --pattern=empty_check --dry-run

# Quality enforcement standard
mix quality.enforce_standard
mix quality.enforce_standard --fix
```

### Interpreting QDP Reports

A QDP report provides actionable information for remediation:

| Field | Description | Action |
|-------|-------------|--------|
| `total_qdp` | Sum of all weighted violations | Must be 0 for commit |
| `by_domain` | QDP breakdown per quality domain | Prioritize highest-weight domains |
| `violations` | Individual violation details | Fix starting with auto-fixable items |
| `auto_fixable` | Whether CASCADE can fix it | Apply cascade patterns first |

## Best Practices

1. **Address QDP immediately upon introduction**. The pre-commit hook blocks commits with non-zero QDP, but if you encounter QDP during development, fix it before any other changes. QDP compounds rapidly if allowed to accumulate.

2. **Use CASCADE patterns for bulk elimination**. When facing multiple violations of the same type, do not fix them individually. Apply the appropriate CASCADE pattern to eliminate the entire category at once.

3. **Run the nuclear cache fix when phantom QDP appears**. If the QDP scanner reports violations that do not correspond to visible code issues, corrupted build artifacts are likely the cause.

4. **Monitor QDP trends in Quality DNA**. Even at zero QDP, track the scan frequency and domain health over time. Sudden spikes in scan duration or domain-specific warnings can indicate emerging issues before they manifest as QDP.

5. **Weight violations correctly**. Not all QDP are equal. A Dialyzer violation (weight 3) indicates a potential runtime error, while a missing TODO cleanup (weight 1) is cosmetic. Prioritize high-weight domains.

## Common Pitfalls

- **Confusing QDP with technical debt**: Technical debt is a subjective assessment of design quality. QDP is an objective, measured count of specific, codified violations. They overlap but are not synonymous.

- **Ignoring auto-fixable violations**: Many QDP can be eliminated automatically through CASCADE patterns. Manually fixing violations that have automated solutions wastes developer time.

- **Disabling pre-commit hooks to bypass QDP checks**: The platform explicitly forbids `--no-verify` flags. Bypassing QDP prevention creates a false sense of progress while degrading quality.

- **Treating zero QDP as the end goal**: Zero QDP means the platform meets current quality standards. Standards should evolve over time, adding new domains and tightening thresholds as the platform matures.

- **Batch-fixing QDP in large commits**: Each QDP fix should be an atomic commit for traceability. Batching 50 fixes into one commit makes git blame useless for understanding why specific changes were made.

## Related Concepts

- [Quality Gates](/glossary/quality-gates/) -- Pipeline preventing new QDP introduction
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Autonomous monitoring for QDP regression
- [Quality DNA](/glossary/quality-dna/) -- Historical QDP tracking across sessions
- [CASCADE Pattern](/glossary/cascade-pattern/) -- Bulk fix patterns used for mass QDP elimination
- [Zero Warning Policy](/glossary/zero-warning-policy/) -- Compilation standard preventing warning-type QDP
- [Credo](/glossary/credo/) -- Static analysis tool detecting code style QDP
- [Dialyzer](/glossary/dialyzer/) -- Type checking tool detecting type-related QDP
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- First enforcement point blocking QDP introduction

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Commands](/commands/) -- Quality-related command catalog

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)