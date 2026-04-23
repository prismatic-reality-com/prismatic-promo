+++
title = "IPS (Iterations Per Second)"
weight = 50
[extra]
description = "Benchmark metric measuring how many iterations of a particular operation a system can complete in one second, used for performance comparison."
category = "performance"
related_terms = ["benchmark", "throughput", "latency", "p95"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["IPS", "iterations per second", "benchmark", "performance", "throughput", "glossary", "Prismatic Platform"]
tags = ["glossary", "performance"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "IPS - Prismatic Platform"
+++

## Definition & Overview

Iterations Per Second (IPS) is a benchmark metric that measures how many times a particular operation can be executed within one second. It provides a straightforward throughput measurement for comparing the performance of different implementations, algorithms, or system configurations. Higher IPS values indicate faster execution, making it an intuitive metric for performance optimization work.

IPS is the inverse of average execution time: if an operation takes 10 microseconds on average, the IPS is 100,000. This relationship makes IPS particularly useful for communicating performance differences to stakeholders who may not intuitively grasp microsecond-level timing differences. Saying "the optimized version runs at 500K IPS versus the original's 50K IPS" immediately conveys the 10x improvement in a way that "reduced from 20 microseconds to 2 microseconds" may not.

In the Prismatic Platform, IPS is the primary metric reported by Benchee, the Elixir benchmarking library used for all performance testing. Every performance-critical path (ETS lookups, query execution, tool registry operations, serialization) has documented IPS baselines that are verified in CI to prevent performance regressions.

## Technical Deep Dive

IPS measurement requires careful methodology to produce reliable results. The benchmarking tool must account for warmup time (JIT compilation, cache population), system noise (other processes, GC pauses), and statistical variation (standard deviation, outliers). Raw iteration counting without these considerations produces misleading results.

Benchee, the standard benchmarking tool in the Elixir ecosystem, implements best practices automatically. It runs a warmup phase to stabilize the BEAM's JIT and scheduler, executes many iterations to gather statistically significant data, computes mean, median, standard deviation, and percentile statistics, and handles garbage collection timing. The output includes IPS along with confidence intervals, making it straightforward to determine whether performance differences are statistically significant.

```elixir
defmodule PrismaticBench.ToolRegistryBench do
  @moduledoc """
  Benchmarks for OSINT ToolRegistry operations.
  Measures IPS for critical hot-path operations.
  """

  @spec run() :: :ok
  def run do
    # Setup: populate registry with realistic data
    tools = generate_test_tools(127)
    Enum.each(tools, &PrismaticOsintCore.ToolRegistry.register/1)

    Benchee.run(
      %{
        "ToolRegistry.get/1 (single lookup)" => fn ->
          PrismaticOsintCore.ToolRegistry.get("shodan-host-search")
        end,

        "ToolRegistry.all/0 (full scan)" => fn ->
          PrismaticOsintCore.ToolRegistry.all()
        end,

        "ToolRegistry.by_category/1 (filtered)" => fn ->
          PrismaticOsintCore.ToolRegistry.by_category(:global)
        end,

        "ETS direct lookup (baseline)" => fn ->
          :ets.lookup(:osint_tool_registry, "shodan-host-search")
        end
      },
      warmup: 2,
      time: 10,
      memory_time: 2,
      reduction_time: 2,
      formatters: [
        {Benchee.Formatters.Console, extended_statistics: true},
        {Benchee.Formatters.HTML, file: "bench/results/tool_registry.html"}
      ]
    )
  end

  defp generate_test_tools(count) do
    for i <- 1..count do
      %{
        slug: "tool-#{i}",
        name: "Test Tool #{i}",
        category: Enum.random([:czech, :global, :sanctions, :eu, :uk, :us]),
        input_fields: [%{name: :query, type: :text, required: true}]
      }
    end
  end
end
```

When comparing IPS across implementations, it is essential to use the same hardware, system load, and data sizes. IPS numbers are not portable across machines. The Prismatic Platform maintains benchmark baselines recorded on specific CI hardware, and regression detection uses relative comparison (percentage change from baseline) rather than absolute IPS thresholds.

The relationship between IPS and latency percentiles is important. High average IPS can mask poor tail latency: a system averaging 100K IPS might have P99 latency 100x worse than the median. The platform reports both IPS and P95/P99 latency for performance-critical paths, ensuring that optimization efforts improve both throughput and consistency.

## Architecture & Implementation

Benchmarks in the Prismatic Platform follow a standardized structure. Each umbrella app with performance-critical code contains a `bench/` directory with Benchee scripts. CI runs benchmarks nightly and compares against stored baselines, flagging regressions exceeding 10% as warnings and 25% as failures. The benchmark results are stored as JSON artifacts for trend analysis.

The platform's performance policy (page load under 250ms, server render under 100ms, LiveView mount under 150ms, handle_event under 50ms) translates into minimum IPS requirements for individual operations. If server render must complete in 100ms and involves 5 ETS lookups, each lookup must sustain at least 50 IPS (in practice, ETS lookups achieve millions of IPS, providing enormous margin).

Memory allocation IPS is also tracked. Benchee's memory_time option measures allocations per iteration, which is critical in the BEAM where excessive allocation triggers garbage collection pauses that degrade tail latency. Operations on the hot path target zero-allocation execution where possible.

## Usage in Prismatic Platform

Regression-detecting benchmark integration:

```elixir
defmodule PrismaticBench.RegressionDetector do
  @moduledoc """
  Compares current benchmark IPS against stored baselines
  to detect performance regressions.
  """

  @regression_warning_threshold 0.10
  @regression_failure_threshold 0.25

  @type comparison :: %{
    name: String.t(),
    baseline_ips: float(),
    current_ips: float(),
    change_pct: float(),
    status: :ok | :warning | :failure
  }

  @spec compare_with_baseline(String.t()) :: {:ok, [comparison()]}
  def compare_with_baseline(baseline_path) do
    {:ok, baseline} = read_baseline(baseline_path)
    current = run_current_benchmarks()

    comparisons =
      Enum.map(current, fn {name, current_ips} ->
        baseline_ips = Map.get(baseline, name, current_ips)
        change_pct = (current_ips - baseline_ips) / baseline_ips

        status =
          cond do
            change_pct < -@regression_failure_threshold -> :failure
            change_pct < -@regression_warning_threshold -> :warning
            true -> :ok
          end

        %{
          name: name,
          baseline_ips: baseline_ips,
          current_ips: current_ips,
          change_pct: change_pct,
          status: status
        }
      end)

    {:ok, comparisons}
  end

  defp read_baseline(path) do
    path |> File.read!() |> Jason.decode!(keys: :atoms) |> then(&{:ok, &1})
  end

  defp run_current_benchmarks do
    # Execute benchmarks and extract IPS values
    %{}
  end
end
```

IPS tracking ensures that the platform's performance characteristics are measurable, comparable, and protected against regression throughout the development lifecycle.

## Cross-References

- [Benchmark](@/glossary/benchmark.md) - Broader performance measurement context
- **P95** - Complementary latency percentile metric
- **P99** - Tail latency metric paired with IPS
- [Throughput](@/glossary/throughput.md) - System-level capacity metric
- **Page Load** - User-facing performance target driven by IPS

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
