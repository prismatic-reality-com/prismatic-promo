+++
title = "/benchmark"
weight = 300
[extra]
category = "Quality"
description = "Comprehensive performance benchmarking with P95/P99 analysis"
syntax = "/benchmark [options]"
authority = "PERFORMANCE"
agent = "performance-benchmarking-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1178
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["benchmark", "Comprehensive", "P95P99", "commands", "Quality", "Prismatic Platform", "Benchee", "Performance"]
tags = ["commands", "quality", "benchmark", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/benchmark - Prismatic Platform"
+++

## Overview

The **/benchmark** command delivers comprehensive performance benchmarking with statistical rigor for the Prismatic Platform, providing P50/P95/P99/P999 percentile analysis, memory profiling, regression detection, and performance budget enforcement. Built on the Benchee benchmarking library, this command transforms performance validation from an ad-hoc activity into a systematic, reproducible, and enforceable quality gate that prevents performance regressions from reaching production.

Performance is a first-class concern in the Prismatic Platform, where the page load performance standard mandates sub-250ms total page loads and sub-100ms server-side render times with zero exceptions. The /benchmark command provides the measurement infrastructure that makes these standards enforceable. Rather than relying on intuition or manual profiling, it produces statistically valid performance measurements with controlled warmup periods, configurable iteration counts, and percentile analysis that accurately reflects production behavior at scale.

Operating under the PERFORMANCE authority level and executed by the `performance-benchmarking-specialist` agent, /benchmark is a production command in the Quality category of the platform's 216-command [registry](/glossary/registry-otp/). It integrates directly with the platform's CI/CD pipeline as a mandatory deployment gate, ensuring that every release meets its performance budget before reaching production. The command has been battle-tested through the Wave 3 Performance Squad, where it validated 95-99.8% improvements across 11 critical operations with 100% budget compliance.

## Usage

```bash
/benchmark [scope] [options]
```

The command accepts an optional scope parameter to target specific operation categories and a rich set of options for controlling benchmark execution, output, and enforcement behavior.

### Examples

```bash
# Run the complete benchmark suite with defaults
/benchmark

# Benchmark specific operation categories
/benchmark cases
/benchmark --scope batch

# High-accuracy benchmarking with 500 iterations
/benchmark --iterations 500

# Budget compliance check only (faster, fewer iterations)
/benchmark --gate true --iterations 50

# Export results in JSON format for CI/CD integration
/benchmark --output json --save-baseline

# Regression analysis against a previous baseline
/benchmark --compare --baseline latest

# Full suite with HTML report generation
/benchmark --output all --time 15 --warmup 5
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **scope** | string | No | `all` | Operations to benchmark: `cases`, `runs`, `ir-results`, `batch`, `api`, `database`, `storage`, `all` |
| **--category** | string | No | `all` | Benchmark category for budget level: `critical`, `standard`, `exploratory`, `all` |
| **--iterations** | integer | No | `100` | Number of iterations for statistical accuracy |
| **--time** | integer | No | `10` | Benchee execution time in seconds per scenario |
| **--warmup** | integer | No | `2` | Warmup time in seconds for JIT stabilization |
| **--parallel** | integer | No | `4` | Number of parallel benchmark processes |
| **--memory** | boolean | No | `true` | Enable memory profiling and allocation tracking |
| **--gate** | boolean | No | `false` | Run as quality gate (blocks on any budget violation) |
| **--compare** | boolean | No | `false` | Compare results against a baseline |
| **--baseline** | string | No | `latest` | Baseline file or tag for regression analysis |
| **--save-baseline** | boolean | No | `false` | Save current results as a new baseline |
| **--output** | string | No | `all` | Output format: `console`, `html`, `markdown`, `json`, `all` |
| **--strict** | boolean | No | `true` | Strict budget enforcement (fail on any violation) |
| **--regression-threshold** | float | No | `0.05` | Regression threshold percentage (5% default) |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | PERFORMANCE |
| **Executing Agent** | `performance-benchmarking-specialist` |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Quality |
| **Read Access** | All application code, performance baselines, budget configurations |
| **Write Access** | Benchmark results, baseline files, HTML/JSON/Markdown reports |
| **Blocking Authority** | Can block deployments when run as quality gate (`--gate true`) |
| **Support Agents** | `backend-performance-engineer`, `database-core-specialist`, `benchmark-execution-specialist` |

## Technical Implementation

The /benchmark command implements a multi-phase benchmarking pipeline built on Benchee, the Elixir benchmarking library. The pipeline progresses from environment initialization through benchmark execution to statistical analysis and budget compliance verification. Each phase is designed to produce statistically valid, reproducible results.

```elixir
defmodule Prismatic.Commands.Benchmark do
  @moduledoc """
  AIAD-integrated Benchee performance validation with
  budget compliance and statistical rigor.
  """

  @performance_budgets %{
    case_list: %{budget_ms: 10, category: :critical},
    case_get: %{budget_ms: 2, category: :critical},
    case_create: %{budget_ms: 20, category: :critical},
    run_create: %{budget_ms: 10, category: :critical},
    ir_create: %{budget_ms: 5, category: :critical},
    ir_list: %{budget_ms: 8, category: :standard},
    batch_10: %{budget_ms: 20, category: :standard},
    batch_100: %{budget_ms: 100, category: :standard}
  }

  @spec execute(scope :: String.t(), opts :: keyword()) ::
          {:ok, BenchmarkReport.t()} | {:error, term()}
  def execute(scope \\ "all", opts \\ []) do
    iterations = Keyword.get(opts, :iterations, 100)
    time = Keyword.get(opts, :time, 10)

    with {:ok, config} <- load_benchee_config(scope, iterations, time, opts),
         {:ok, env} <- initialize_benchmark_environment(scope),
         {:ok, results} <- execute_benchee_scenarios(config, env),
         {:ok, stats} <- calculate_percentiles(results),
         {:ok, compliance} <- validate_budgets(stats, @performance_budgets),
         {:ok, regression} <- detect_regressions(stats, opts),
         {:ok, reports} <- generate_reports(stats, compliance, regression, opts) do
      {:ok, %{stats: stats, compliance: compliance, reports: reports}}
    end
  end
end
```

The benchmark execution uses realistic data volumes (100+ cases, 500+ runs) to ensure that measurements reflect production conditions. Warmup phases allow the BEAM VM's JIT to stabilize before measurements begin. Statistical analysis calculates min, max, average, median, standard deviation, and percentiles (P50, P95, P99, P999) for each operation. Budget compliance verification checks P95 latencies against predefined budgets with zero tolerance for critical operations.

### Performance Budget Matrix

The following budgets are enforced with validated results from the Wave 3 Performance Squad:

| Operation | Budget | Achieved (Avg) | Achieved (P95) | Improvement |
|-----------|--------|-----------------|-----------------|-------------|
| Case List | 10ms | 0.17ms | 0.20ms | 98.3% |
| Case Get | 2ms | 0.28ms | 0.35ms | 86.0% |
| Case Create | 20ms | 1.0ms | 1.25ms | 95.0% |
| Run Create | 10ms | 0.41ms | 0.52ms | 95.9% |
| IR Create | 5ms | 0.00ms | 0.01ms | 99.8% |
| IR List | 8ms | 0.23ms | 0.30ms | 97.1% |
| Batch 10 | 20ms | 0.04ms | 0.06ms | 99.7% |
| Batch 100 | 100ms | 0.39ms | 0.55ms | 99.5% |

## Workflow Integration

The /benchmark command integrates into multiple points in the development and deployment lifecycle. Its primary role is as a mandatory deployment gate, but it also serves as a development tool for performance optimization and a CI/CD component for regression prevention.

Common workflow patterns include:

1. **Pre-Deployment Gate**: Run `/benchmark --gate true --strict` before every production deployment to enforce performance budgets
2. **Development Profiling**: During optimization work, use `/benchmark --scope [target] --iterations 500` for high-accuracy measurements of specific operations
3. **Regression Detection**: After code changes, run `/benchmark --compare --baseline latest` to detect performance regressions against the most recent baseline
4. **Baseline Management**: After performance improvements, run `/benchmark --save-baseline` to establish a new performance floor
5. **CI/CD Integration**: Include `/benchmark --gate true --output json` in the GitLab CI pipeline to block merges that violate budgets
6. **Performance Reporting**: Generate comprehensive reports with `/benchmark --output all` for stakeholder communication and audit trails

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `performance-benchmarking-specialist` agent |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](/glossary/quality-gates/) | Direct quality gate enforcement with blocking authority |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and benchmark event tracking |
| Benchee Library | Core benchmarking engine with statistical analysis |
| Performance Budgets | Predefined operation latency budgets with P95 enforcement |
| CI/CD Pipeline | Mandatory gate in deployment workflow |
| Page Load Performance Policy | Enforces sub-250ms page load standard |
| Baseline Storage | Historical performance baselines for regression detection |
| Report Generation | HTML, Markdown, JSON output via Benchee formatters |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Performance budgets are absolute. Any operation that exceeds its P95 budget in strict mode causes immediate failure with a non-zero exit code. There are no grace periods, no acceptable degradation thresholds, and no exceptions. The command enforces 100% budget compliance on all critical operations. Regressions exceeding the configured threshold (default 5%) are treated as blocking violations.
- **NO DOUBTS**: All performance claims are backed by statistical evidence. Measurements require a minimum of 100 iterations for statistical accuracy, with standard deviation ratio checks ensuring measurement reliability (std_dev_ratio < 25%). Results include percentile distributions, not just averages, because production performance is determined by tail latencies. Baselines provide objective comparison points that eliminate subjective assessment.
- **NABLA Compliance**: Performance measurements satisfy signal plurality by aggregating multiple independent measurement runs (iterations) rather than relying on single observations. The statistical analysis surfaces contradictions between different percentile levels (e.g., good average but poor P99), preventing premature optimization conclusions. Time decay is enforced through baseline versioning, ensuring that performance comparisons use temporally relevant reference points.

## Best Practices

1. **Always use sufficient iterations**: The default 100 iterations provides good statistical accuracy; increase to 500+ for critical measurements or noisy environments
2. **Warm up before measuring**: The default 2-second warmup is usually sufficient, but increase for benchmarks that involve database connections or external resources
3. **Save baselines after improvements**: Whenever you make a validated performance improvement, save a new baseline with `--save-baseline` to ratchet the performance floor upward
4. **Use gate mode in CI**: Always run with `--gate true` in CI pipelines to prevent performance regressions from reaching production
5. **Monitor P99, not just averages**: Average performance can hide tail latency problems; always check P99 and P999 for operations that affect user experience
6. **Benchmark realistic data volumes**: Use scopes that exercise realistic data volumes rather than trivial test datasets

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/cascade](/commands/cascade/) - Execute [CASCADE pattern](/glossary/cascade-pattern/) fix for systematic anti-pattern removal
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/architect](/commands/architect/) - Architecture design and recommendation generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)