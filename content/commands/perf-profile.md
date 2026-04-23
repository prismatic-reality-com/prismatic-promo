+++
title = "/perf-profile"
weight = 170
[extra]
category = "Development"
description = "Application profiling and performance hotspot identification"
syntax = "/perf-profile [options]"
authority = "L3"
agent = "performance-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 834
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["perf-profile", "Application", "commands", "Development", "Prismatic Platform", "Profiling", "Performance", "Benchee"]
tags = ["commands", "development", "perf-profile", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/perf-profile - Prismatic Platform"
+++

## Overview

**/perf-profile** is a production command in the **Development** category of the Prismatic Platform that performs comprehensive application profiling and performance hotspot identification across the platform's 89-application umbrella architecture. The command leverages the BEAM VM's built-in profiling capabilities -- including `:fprof`, `:eprof`, `:cprof`, and custom telemetry-based profilers -- to identify performance bottlenecks at the function, process, and system levels. Profiling results are presented as actionable reports with specific optimization recommendations.

Performance profiling in the Prismatic Platform context presents unique challenges due to the concurrent, distributed nature of OTP applications. A single user request may traverse multiple GenServers, Task processes, and supervision trees across several umbrella applications. The `/perf-profile` command addresses this complexity by supporting both focused (single-function) and systemic (cross-process) profiling modes, with automatic correlation of profiling data across process boundaries.

This command operates under the **L3** authority level and is executed by the `performance-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the performance impact of profiling operations, which can introduce observable overhead in production-like environments.

The platform enforces strict performance standards: all pages must load under 250ms, server-side rendering must complete within 100ms, and LiveView mount operations must finish within 150ms. The `/perf-profile` command is the primary diagnostic tool for identifying violations of these standards and guiding their resolution. It transforms abstract performance requirements into concrete, file-level, function-level optimization targets.

## Syntax and Usage

```bash
/perf-profile [options]
```

The command accepts options that specify the profiling target, mode, and output format.

```bash
# Profile specific function
/perf-profile --function="PrismaticPerimeter.discover/1"

# Profile LiveView page load
/perf-profile --liveview="/perimeter/assets" --mode=mount

# System-wide profiling for a duration
/perf-profile --duration=30s --mode=system

# Profile with flamegraph output
/perf-profile --function="PrismaticWeb.Router.call/2" --format=flamegraph

# Profile memory allocation
/perf-profile --mode=memory --app=prismatic_storage_ets

# Profile specific Mix task
/perf-profile --task="quality.gates" --mode=cpu

# Profile with Benchee integration
/perf-profile --benchmark --function="Scanner.scan/2" --iterations=1000

# Profile ETS operations
/perf-profile --mode=ets --table=:prismatic_cache

# Profile process message queues
/perf-profile --mode=mailbox --threshold=100
```

## Parameters and Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--function` | string | none | Target function in `Module.function/arity` format |
| `--liveview` | string | none | LiveView route to profile |
| `--task` | string | none | Mix task to profile |
| `--mode` | enum | `cpu` | Profiling mode: `cpu`, `memory`, `system`, `ets`, `mailbox`, `io` |
| `--duration` | string | `10s` | Profiling duration for system-wide mode |
| `--format` | enum | `table` | Output format: `table`, `flamegraph`, `callgrind`, `json`, `markdown` |
| `--output` | path | stdout | Output destination |
| `--app` | string | all | Target umbrella application |
| `--profiler` | enum | auto | Profiler backend: `fprof`, `eprof`, `cprof`, `auto` |
| `--benchmark` | boolean | false | Enable Benchee benchmarking mode |
| `--iterations` | integer | 100 | Benchmark iteration count |
| `--warmup` | string | `2s` | Benchmark warmup duration |
| `--threshold` | integer | 10 | Minimum call count or queue depth for reporting |
| `--sort` | enum | `time` | Sort results: `time`, `calls`, `memory`, `reductions` |
| `--top` | integer | 20 | Number of top results to display |
| `--trace-gc` | boolean | false | Include garbage collection events |
| `--include-nifs` | boolean | false | Include NIF call profiling |

The `--profiler` parameter defaults to auto-selection based on the profiling mode and environment. The auto-selection logic chooses `:cprof` for quick call counting (lowest overhead), `:eprof` for time distribution analysis (moderate overhead), and `:fprof` for detailed call graphs (highest overhead). The custom telemetry-based profiler is selected for production environments where the overhead of `:fprof` would be unacceptable.

## Implementation Architecture

The profiling system implements a layered architecture that abstracts over multiple BEAM profiling backends while providing a unified analysis interface.

```
Profiling Request
    |
    v
[Target Resolution]
    +---> Function target (specific MFA)
    +---> LiveView target (route -> module)
    +---> System target (all processes)
    +---> Task target (Mix task process tree)
    |
    v
[Profiler Selection]
    +---> :fprof (detailed call graph, high overhead)
    +---> :eprof (time profiling, moderate overhead)
    +---> :cprof (call counting, low overhead)
    +---> Custom telemetry profiler (production-safe)
    |
    v
[Data Collection]
    +---> Process-level instrumentation
    +---> Cross-process correlation
    +---> GC event tracking (optional)
    +---> Memory allocation sampling
    |
    v
[Analysis Engine]
    +---> Call graph construction
    +---> Hotspot identification
    +---> Critical path analysis
    +---> Anomaly detection
    |
    v
[Report Generation]
    +---> Tabular summaries
    +---> Flamegraph SVG
    +---> Optimization recommendations
    +---> Benchmark comparisons
```

### Profiler Backend Characteristics

| Backend | Overhead | Data Granularity | Best For |
|---------|----------|-----------------|----------|
| `:cprof` | < 5% | Call counts per function | Quick overview, production-safe |
| `:eprof` | 10-30% | Time per function | Development, time distribution |
| `:fprof` | 50-200% | Full call graph with timing | Detailed analysis, development only |
| Telemetry | < 1% | Sampling-based metrics | Production monitoring |
| Benchee | N/A | Statistical analysis | Comparative benchmarking |

The analysis engine processes raw profiling data to identify actionable hotspots. Call graph construction reveals which functions consume the most time both individually (self time) and inclusively (including calls to child functions). Critical path analysis identifies the longest execution path through the call graph. Anomaly detection flags functions whose execution characteristics deviate significantly from historical baselines.

## Examples

### LiveView Performance Audit

```bash
/perf-profile --liveview="/perimeter/assets" --mode=cpu --format=table
# Output:
# Function                              Calls   Time(ms)  %Total
# PrismaticPerimeter.list_assets/1      1       45.2      38.1%
# PrismaticStorageEts.query/3           12      23.8      20.1%
# Phoenix.LiveView.Rendered.to_iodata   1       18.4      15.5%
# ...
# TOTAL: 118.6ms (PASS: under 150ms LiveView mount limit)
```

### Memory Profiling

```bash
/perf-profile --mode=memory --app=prismatic_agents --top=10
# Identifies top memory consumers, process heap sizes, and ETS table sizes
```

### Benchmarking with Comparison

```bash
/perf-profile --benchmark --function="Scanner.scan/2" \
  --iterations=1000 --format=markdown
# Produces Benchee-style comparison with P50/P95/P99 latencies
```

### Flamegraph Generation

```bash
/perf-profile --function="PrismaticWeb.Router.call/2" --format=flamegraph \
  --output=/tmp/router-flame.svg
# Generates an interactive SVG flamegraph for visual hotspot identification
```

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `performance-specialist` | Performance domain expertise |
| [Quality Gates](@/glossary/quality-gates.md) | Performance gate enforcement | 250ms page load, 100ms render limits |
| [Telemetry](@/glossary/telemetry.md) | Profiling data source | Custom telemetry-based profiler |
| [/benchmark](@/commands/benchmark.md) | Benchmarking backend | Benchee integration for comparative analysis |
| [/quality-gates](@/commands/quality-gates.md) | Performance validation | Profile results feed gate decisions |
| BEAM VM | Profiling backends | :fprof, :eprof, :cprof native tools |
| [/fix](@/commands/fix.md) | Optimization workflow | Profile -> identify -> fix -> re-profile |
| [/deploy](@/commands/deploy.md) | Post-deployment validation | Performance regression detection |

## Workflow Integration

The `/perf-profile` command integrates into the platform's performance management workflow at multiple stages:

1. **Development-Time Profiling**: During development, rapid `:cprof` profiling provides immediate feedback on the performance characteristics of new code. This catches performance regressions before they reach code review.

2. **Pre-Commit Validation**: Before commits affecting performance-sensitive paths, `:eprof` time distribution analysis validates that changes do not introduce bottlenecks. The page load performance standard (P0 ABSOLUTE) mandates all pages load under 250ms.

3. **Performance Regression Investigation**: When a performance regression is detected, the typical workflow is: `/perf-profile --liveview=<route>` to identify the bottleneck, then [/fix](@/commands/fix.md) to implement the optimization, then `/perf-profile` again to verify the improvement, and finally [/quality-gates](@/commands/quality-gates.md) to confirm the fix meets all performance thresholds.

4. **Benchmarking**: Before and after optimization work, the Benchee integration provides statistically rigorous performance comparisons with P50/P95/P99 latency metrics.

5. **Production Monitoring**: The telemetry-based profiler mode enables lightweight continuous profiling without impacting user experience, feeding data into the platform's monitoring infrastructure.

## NABLA Compliance

Profiling results adhere to [NABLA](@/glossary/nabla-infinity.md) epistemic standards:

| Axiom | Enforcement |
|-------|-------------|
| **Evidence-Based** | All performance claims backed by profiling data, not assumptions |
| **Provenance Mandatory** | Profiling configuration (backend, iterations, warmup) included in every report |
| **Signal Plurality** | Multi-backend profiling (CPU, memory, call counts) provides independent signals |
| **Contradiction Preservation** | Contradictions between metrics (low CPU but high memory) highlighted |
| **Time Decay** | Profiling results timestamped; stale baselines flagged for re-measurement |
| **Source Independence** | Different profiler backends operate independently; consensus increases confidence |

## Performance

| Metric | Overhead | Notes |
|--------|----------|-------|
| :cprof (call counting) | < 5% | Production-safe |
| :eprof (time profiling) | 10-30% | Development/staging |
| :fprof (full call graph) | 50-200% | Development only |
| Telemetry profiler | < 1% | Production-safe, sampling-based |
| Benchee mode | N/A | Dedicated benchmark process |
| Flamegraph generation | < 5s | Post-processing overhead |
| Report generation | < 2s | Analysis and formatting |

The overhead figures represent the performance impact of the profiling itself on the target application. The `:cprof` backend is suitable for production environments due to its minimal overhead. The `:fprof` backend should never be used in production due to its 50-200% overhead, which would violate the platform's performance standards.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/benchmark](@/commands/benchmark.md) - Comprehensive performance benchmarking with P95/P99 analysis
- [/deploy](@/commands/deploy.md) - Deployment to staging environment via GitLab CI/CD

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)