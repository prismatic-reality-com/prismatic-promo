+++
title = "/optimize"
weight = 90
[extra]
category = "Development"
description = "Performance optimization with measurement validation"
syntax = "/optimize [options]"
authority = "L3"
agent = "performance-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1056
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["optimize", "Performance", "commands", "Development", "Prismatic Platform", "Phase", "PrismaticPerformance", "Profiler"]
tags = ["commands", "development", "optimize", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/optimize - Prismatic Platform"
+++

## Overview

**/optimize** is a production command in the **Development** category of the Prismatic Platform. It performs performance optimization with measurement validation, ensuring that every optimization claim is backed by quantitative evidence from before-and-after benchmarking, profiling data, and regression verification.

Performance optimization in the Prismatic Platform follows a disciplined methodology that rejects premature optimization and gut-feeling improvements. The `/optimize` command enforces this discipline by requiring baseline measurements before any changes, automated benchmarking after changes, and statistical validation that improvements are genuine rather than measurement noise. This evidence-based approach prevents the common antipattern of "optimization" that degrades code clarity without measurable benefit.

The command integrates with the platform's comprehensive [telemetry](@/glossary/telemetry.md) infrastructure to capture performance data at multiple granularity levels: function-level execution time, module-level throughput, application-level latency, and system-level resource utilization. All measurements are stored in the platform's time-series database for historical trend analysis and regression detection.

The platform enforces hard performance limits: all pages must load under 250ms, server-side rendering must complete under 100ms, LiveView mounts under 150ms, and handle_event callbacks under 50ms. The `/optimize` command is the primary tool for achieving and maintaining compliance with these standards.

This command operates under the **L3** authority level and is executed by the `performance-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The `/optimize` command implements a measurement-driven optimization pipeline built on Benchee for microbenchmarks and custom [telemetry](@/glossary/telemetry.md) for application-level measurements.

### Optimization Pipeline

```
Target Identification --> Baseline Measurement
                               |
                         Profile Analysis
                               |
                    Optimization Strategy Selection
                               |
                    +----------+----------+
                    |          |          |
               Algorithm   Memory    Concurrency
               Optimization Reduction Tuning
                    |          |          |
                    +----------+----------+
                               |
                    Post-Optimization Measurement
                               |
                    Statistical Validation
                               |
                    Regression Verification
                               |
                    Report Generation
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Baseline Collector** | `PrismaticPerformance.BaselineCollector` | Pre-optimization measurement capture |
| **Profiler** | `PrismaticPerformance.Profiler` | :fprof, :eprof, :cprof integration |
| **Strategy Selector** | `PrismaticPerformance.StrategySelector` | Optimization approach recommendation |
| **Benchmark Runner** | `PrismaticPerformance.BenchmarkRunner` | Benchee-based measurement execution |
| **Validator** | `PrismaticPerformance.StatisticalValidator` | Statistical significance testing |
| **Regression Guard** | `PrismaticPerformance.RegressionGuard` | Regression detection across test suite |

## Usage

### Basic Optimization

```bash
# Optimize a specific module
/optimize --target PrismaticPerimeter.SecurityRating

# Optimize a specific function
/optimize --target PrismaticPerimeter.SecurityRating.calculate/2

# Optimize with automatic profiling
/optimize --target PrismaticWeb.PerimeterLive --profile auto

# Quick optimization check (baseline + suggestions only)
/optimize --target PrismaticStorage.Query --mode analyze
```

### Performance Profiling

```bash
# Full profile with flame graph
/optimize --target PrismaticPerimeter --profile full --flame-graph

# Memory profiling
/optimize --target PrismaticStorage.ETS --profile memory

# Concurrency profiling
/optimize --target PrismaticAgents.Orchestrator --profile concurrency

# IO profiling
/optimize --target PrismaticStorage.Ecto --profile io
```

### Benchmarking

```bash
# Run benchmarks with statistical analysis
/optimize --target PrismaticPerimeter.Scanner --benchmark --iterations 1000

# Compare implementations
/optimize --compare "v1:PrismaticPerimeter.Scanner.scan_v1/1" "v2:PrismaticPerimeter.Scanner.scan_v2/1"

# Benchmark against performance budget
/optimize --target PrismaticWeb.PerimeterLive --benchmark --budget 100ms
```

### System-Wide Optimization

```bash
# Optimize all modules in an application
/optimize --app prismatic_perimeter --mode sweep

# Optimize based on production telemetry hotspots
/optimize --source telemetry --top 10

# Optimize ETS table configurations
/optimize --target ets-tables --mode memory-layout
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--target` | String | Required | Module, function, or application to optimize |
| `--app` | String | - | Target umbrella application |
| `--mode` | Enum | `optimize` | Mode: `analyze`, `optimize`, `sweep`, `verify` |
| `--profile` | Enum | `auto` | Profiler: `auto`, `fprof`, `eprof`, `cprof`, `memory`, `concurrency`, `io`, `full` |
| `--benchmark` | Boolean | `false` | Run Benchee benchmarks |
| `--iterations` | Integer | `100` | Benchmark iteration count |
| `--warmup` | Duration | `2s` | Benchmark warmup time |
| `--budget` | Duration | - | Performance budget target |
| `--compare` | List | - | Compare two or more implementations |
| `--flame-graph` | Boolean | `false` | Generate flame graph visualization |
| `--source` | Enum | `code` | Data source: `code`, `telemetry`, `benchmarks` |
| `--top` | Integer | `5` | Number of hotspots to analyze |
| `--min-improvement` | Float | `0.1` | Minimum improvement ratio to accept (10%) |
| `--output` | Enum | `text` | Output format: `text`, `json`, `html`, `markdown` |
| `--file` | Path | - | Write results to file |

## Execution Flow

**Phase 1 -- Target Analysis** (0-5s): The target module or function is analyzed for its current structure, complexity, and integration points. The analyzer identifies potential optimization targets including hot paths, memory allocation patterns, and concurrency bottlenecks.

**Phase 2 -- Baseline Measurement** (5-30s): A comprehensive baseline is established through automated benchmarking. The baseline captures execution time (mean, median, P95, P99), memory allocation, garbage collection frequency, and process message queue depth. Multiple measurement runs ensure statistical reliability.

**Phase 3 -- Profiling** (30-60s): The selected profiler instruments the target code and captures detailed execution traces. For `:fprof`, this includes call counts, accumulated time, and own time for every function in the call tree. Results are analyzed to identify the most impactful optimization candidates.

**Phase 4 -- Strategy Selection** (60-65s): Based on profiling data, the Strategy Selector recommends optimization approaches ranked by expected impact. Common strategies include algorithm replacement, caching, concurrency adjustment, data structure optimization, and lazy evaluation.

**Phase 5 -- Optimization Implementation** (65-variable): The performance-specialist agent implements the recommended optimizations. Each optimization is applied incrementally with intermediate measurements to validate impact.

**Phase 6 -- Post-Optimization Measurement** (variable): The same benchmark suite from the baseline phase is re-executed against the optimized code. Results are compared using statistical tests (t-test or Mann-Whitney U) to determine if improvements are statistically significant.

**Phase 7 -- Regression Verification** (variable): The full test suite is executed to verify that optimizations have not introduced functional regressions. Any test failure aborts the optimization and reverts changes.

**Phase 8 -- Report Generation** (2-5s): A detailed optimization report is generated including before/after measurements, improvement percentages, statistical confidence, and recommendations for further optimization.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Managed by `performance-specialist` agent |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post validation | Performance gates as quality checkpoints |
| [Telemetry](@/glossary/telemetry.md) | Data source | Production [metrics](@/glossary/metrics.md) for hotspot identification |
| Benchee | Measurement | Statistical benchmarking framework |
| [Test Suite](@/glossary/exunit.md) | Regression guard | Functional verification after optimization |
| [CI/CD Pipeline](@/glossary/gitlab-ci.md) | Gate | Performance budgets enforced in pipeline |
| Page Load Policy | Standards | 250ms page load, 100ms render targets |

## Best Practices

**Measure First**: Never optimize without baseline measurements. The `/optimize --mode analyze` flag provides profiling data and optimization suggestions without making any changes. Use this to identify whether optimization is warranted before investing effort.

**Statistical Rigor**: A single benchmark run is not evidence of improvement. Use `--iterations 1000` or higher for microbenchmarks. The statistical validator will reject improvements that are not statistically significant at the 95% confidence level.

**Optimize Bottlenecks**: Focus on the hottest code paths identified by profiling. Optimizing code that consumes 1% of execution time cannot produce meaningful overall improvement regardless of how much faster it becomes.

**Preserve Clarity**: Reject optimizations that reduce code readability without providing at least 10% improvement (configurable via `--min-improvement`). Maintainability is a long-term performance characteristic that premature optimization degrades.

**Regression Testing**: Always verify the full test suite after optimization. Performance improvements that break functionality are not improvements. The platform's mandatory regression test protocol applies to optimization changes.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Target not found | Error with module/function suggestions | Command does not execute |
| Baseline instability | Increased warmup and iterations automatically | Longer baseline phase |
| Profiler overhead too high | Switch to lighter profiler | Less detailed profiling data |
| Optimization causes test failure | Automatic revert, failure report | Changes rolled back |
| Improvement not statistically significant | Reported as inconclusive | No changes applied |
| Memory limit during profiling | Profiling scope reduced | Partial profiling results |

## Advanced Usage

### Continuous Performance Monitoring

```bash
# Set up performance monitoring for a module
/optimize --target PrismaticWeb.PerimeterLive --mode monitor --alert-threshold 200ms

# Review performance trends
/optimize --trends --target PrismaticPerimeter --period 30d
```

### A/B Implementation Testing

```bash
# Compare two implementations with statistical rigor
/optimize --ab-test \
  --control PrismaticPerimeter.Scanner.scan_sequential/1 \
  --variant PrismaticPerimeter.Scanner.scan_concurrent/1 \
  --iterations 5000 --confidence 0.99
```

### O(1) Pattern Detection

The platform has achieved O(1) pattern detection providing 90-250x speedup over traditional approaches. Verify and maintain this performance:

```bash
# Verify O(1) detection performance
/optimize --verify-o1 --target PrismaticSafety.PatternDetector --input-sizes "100,1000,10000,100000"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every optimization must be fully measured, validated, and regression-tested. No "it feels faster" claims. No optimization without evidence.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Profiling before optimizing. Statistical validation of improvements. Quantitative reporting with confidence intervals.

## Related Commands

- [/perf-profile](@/commands/perf-profile.md) - Application profiling and performance hotspot identification
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)