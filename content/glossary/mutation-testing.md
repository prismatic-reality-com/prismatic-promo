+++
title = "Mutation Testing"
weight = 50
[extra]
description = "A code quality verification technique that introduces small code changes (mutations) to evaluate whether the test suite detects them."
category = "testing"
related_terms = ["mutant", "mutation-score", "killedsurvived", "property-based-testing"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mutation testing", "test quality", "code verification", "fault injection", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Mutation Testing - Prismatic Platform"
+++

## Definition & Overview

Mutation testing is a software testing technique that evaluates the quality of a test suite by introducing small, deliberate changes (mutations) into the source code and checking whether the existing tests detect those changes. Each mutation creates a "mutant" version of the code. If at least one test fails when run against the mutant, the mutant is "killed," proving the tests verify that aspect of behavior. If all tests pass despite the mutation, the mutant "survives," indicating a test gap.

This technique addresses a fundamental limitation of code coverage metrics. A function can be 100% line-covered while having zero behavioral assertions, meaning no mutation would be caught. Mutation testing directly measures whether tests verify correctness, not just whether they execute code. The mutation score (percentage of killed mutants) is widely regarded as the most rigorous automated measure of test suite effectiveness.

The Prismatic Platform integrates mutation testing into its quality assurance pipeline, applying it systematically to security-critical code (Perimeter scoring, authentication), core business logic (DD pipeline, OSINT execution engine), and platform infrastructure (registries, supervision trees). The NO MERCY doctrine mandates minimum mutation scores by module criticality, with 100% required for security-critical paths.

## Technical Deep Dive

The mutation testing process follows a systematic pipeline. First, mutation operators are applied to the target source code, generating mutants. Operators model specific fault categories: Arithmetic Operator Replacement (changing `+` to `-`), Relational Operator Replacement (changing `<` to `<=`), Logical Connector Replacement (changing `and` to `or`), Constant Replacement (changing `0` to `1`), Statement Deletion (removing a line), and Return Value Replacement (changing return values).

Second, each mutant is compiled and the relevant tests are executed against it. If any test fails, the mutant is killed. If all tests pass, the mutant survives. The mutation score is then computed as the ratio of killed mutants to total non-equivalent mutants.

```elixir
defmodule PrismaticQuality.MutationTestingPipeline do
  @moduledoc """
  Complete mutation testing pipeline for the Prismatic Platform.
  Generates mutants, evaluates them, and produces quality reports.
  """

  alias PrismaticQuality.MutantGenerator
  alias PrismaticQuality.MutationScore

  @type pipeline_config :: %{
    target_files: [String.t()],
    test_dir: String.t(),
    operators: [MutantGenerator.operator()],
    timeout_ms: pos_integer(),
    max_concurrent: pos_integer()
  }

  @type pipeline_result :: %{
    config: pipeline_config(),
    results: [MutationScore.score_result()],
    aggregate_score: float(),
    duration_ms: non_neg_integer(),
    total_mutants: non_neg_integer()
  }

  @default_config %{
    operators: [:aor, :ror, :lcr, :cr, :sd],
    timeout_ms: 30_000,
    max_concurrent: System.schedulers_online()
  }

  @spec run(pipeline_config()) :: {:ok, pipeline_result()}
  def run(config) do
    config = Map.merge(@default_config, config)
    start_time = System.monotonic_time(:millisecond)

    results =
      config.target_files
      |> Enum.map(fn file ->
        {:ok, mutants} = MutantGenerator.generate(file)

        evaluated =
          mutants
          |> Enum.map(fn mutant ->
            evaluate_with_isolation(mutant, config)
          end)

        MutationScore.evaluate(file, evaluated, classify_criticality(file))
      end)

    total_mutants = Enum.sum(Enum.map(results, & &1.total))
    total_killed = Enum.sum(Enum.map(results, & &1.killed))
    aggregate = if total_mutants > 0, do: total_killed / total_mutants * 100, else: 100.0

    duration = System.monotonic_time(:millisecond) - start_time

    {:ok, %{
      config: config,
      results: results,
      aggregate_score: Float.round(aggregate, 2),
      duration_ms: duration,
      total_mutants: total_mutants
    }}
  end

  defp evaluate_with_isolation(mutant, config) do
    # Each mutant runs in isolation with file restoration guarantee
    original = File.read!(mutant.file)

    try do
      # Apply mutation
      mutated = apply_mutation(original, mutant)
      File.write!(mutant.file, mutated)

      # Recompile the affected module
      recompile_file(mutant.file)

      # Run tests with timeout
      case run_tests(config.test_dir, config.timeout_ms) do
        :all_passed -> %{mutant | status: :survived}
        :test_failures -> %{mutant | status: :killed}
        :timeout -> %{mutant | status: :timeout}
      end
    after
      # Always restore original
      File.write!(mutant.file, original)
      recompile_file(mutant.file)
    end
  end

  defp apply_mutation(source, mutant) do
    String.replace(source, mutant.original, mutant.replacement, global: false)
  end

  defp recompile_file(file) do
    Code.compile_file(file)
  rescue
    _ -> :compile_error
  end

  defp run_tests(test_dir, timeout) do
    task = Task.async(fn ->
      {_output, exit_code} = System.cmd("mix", ["test", test_dir, "--no-color"],
        stderr_to_stdout: true)
      if exit_code == 0, do: :all_passed, else: :test_failures
    end)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} -> result
      nil -> :timeout
    end
  end

  defp classify_criticality(file) do
    cond do
      String.contains?(file, "perimeter") -> :critical
      String.contains?(file, "scoring") -> :critical
      String.contains?(file, ["dd", "osint_core"]) -> :core
      true -> :standard
    end
  end
end
```

Performance optimization is crucial for practical mutation testing. The Prismatic Platform employs several strategies: test selection (running only tests that exercise the mutated code), parallel evaluation (multiple mutants tested concurrently on different BEAM schedulers), early termination (stopping test execution as soon as the first failure is detected for a mutant), and incremental mutation (only generating mutants for changed code in CI).

## Architecture & Implementation

The mutation testing pipeline integrates with the platform's quality infrastructure at three levels. The developer workflow level provides a mix task (`mix quality.mutations`) that runs mutation testing on specified modules during development. The CI level automatically runs mutation testing for all changed files on every pull request, blocking merges when critical modules fall below threshold. The quality DNA level persists mutation scores across sessions, enabling trend analysis and regression detection.

The pipeline's isolation mechanism is critical for correctness. Each mutant evaluation must be completely isolated to prevent state leakage between evaluations. The platform achieves this through file-level isolation (restore original after each evaluation), process isolation (tests run in separate OS processes), and compilation isolation (affected modules are recompiled in isolation). This ensures that no mutant evaluation affects any other.

The equivalent mutant problem (mutations that produce identical behavior) is addressed through heuristic detection. Mutants that change dead code, modify only debug/logging output, or alter unreachable branches are automatically classified as equivalent and excluded from the score calculation. A manual review workflow handles ambiguous cases.

## Usage in Prismatic Platform

Mix task integration for developer workflows:

```elixir
defmodule Mix.Tasks.Quality.Mutations do
  @moduledoc """
  Run mutation testing for specified modules.

  ## Usage

      mix quality.mutations --file apps/prismatic_perimeter/lib/scoring.ex
      mix quality.mutations --app prismatic_dd --criticality core
      mix quality.mutations --changed  # Only files changed since last commit
  """

  use Mix.Task

  alias PrismaticQuality.MutationTestingPipeline
  alias PrismaticQuality.MutationScore

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args,
      strict: [file: :string, app: :string, criticality: :string, changed: :boolean]
    )

    files = resolve_target_files(opts)

    if Enum.empty?(files) do
      Mix.shell().info("No files to test.")
    else
      Mix.shell().info("Running mutation testing on #{length(files)} files...")

      config = %{
        target_files: files,
        test_dir: resolve_test_dir(opts)
      }

      case MutationTestingPipeline.run(config) do
        {:ok, result} ->
          print_report(result)

          if result.aggregate_score < minimum_threshold(opts) do
            Mix.raise("Mutation score #{result.aggregate_score}% below threshold")
          end
      end
    end
  end

  defp resolve_target_files(opts) do
    cond do
      opts[:file] -> [opts[:file]]
      opts[:app] -> list_app_source_files(opts[:app])
      opts[:changed] -> list_changed_files()
      true -> []
    end
  end

  defp resolve_test_dir(opts) do
    if opts[:app], do: "apps/#{opts[:app]}/test/", else: "test/"
  end

  defp minimum_threshold(opts) do
    case opts[:criticality] do
      "critical" -> 100.0
      "core" -> 90.0
      _ -> 80.0
    end
  end

  defp print_report(result) do
    Mix.shell().info("\nMutation Testing Results:")
    Mix.shell().info("  Total mutants: #{result.total_mutants}")
    Mix.shell().info("  Aggregate score: #{result.aggregate_score}%")
    Mix.shell().info("  Duration: #{result.duration_ms}ms")

    Enum.each(result.results, fn r ->
      status = if r.compliance == :compliant, do: "PASS", else: "FAIL"
      Mix.shell().info("  [#{status}] #{r.module}: #{r.score}%")
    end)
  end

  defp list_app_source_files(_app), do: []
  defp list_changed_files, do: []
end
```

Mutation testing is a cornerstone of the platform's quality assurance strategy, providing the most rigorous available measure of test suite effectiveness and directly supporting the NO MERCY doctrine's zero-tolerance approach to untested code.

## Cross-References

- [Mutant](@/glossary/mutant.md) - Individual code modifications generated during testing
- [Mutation Score](@/glossary/mutation-score.md) - Aggregate metric measuring testing effectiveness
- [Killed/Survived](@/glossary/killedsurvived.md) - Binary outcome of mutant evaluation
- [Property-Based Testing](@/glossary/property-based-testing.md) - Complementary test quality technique
- [Invariant](@/glossary/invariant.md) - Properties that mutation testing validates

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
