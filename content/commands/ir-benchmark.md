+++
title = "/ir-benchmark"
weight = 1840
[extra]
category = "PVM"
description = "Comprehensive performance benchmarking with Benchee integration for IR workflows"
syntax = "/ir-benchmark [options]"
authority = "L2+"
agent = "ir-pvm-profiler"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1256
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ir-benchmark", "Comprehensive", "Benchee", "commands", "PVM", "Prismatic Platform", "Regression", "Benchmark"]
tags = ["commands", "pvm", "ir-benchmark", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ir-benchmark - Prismatic Platform"
+++

## Overview

**/ir-benchmark** is a production command in the **[PVM](@/glossary/pvm.md)** category of the Prismatic Platform that provides comprehensive performance benchmarking capabilities for Intermediate Representation (IR) workflows. By integrating directly with the [Benchee](https://github.com/bencheeorg/benchee) benchmarking library, this command delivers statistically rigorous performance measurements across the entire IR processing pipeline, from parsing and validation through compilation and execution phases.

Performance benchmarking of IR workflows is a critical concern in the Prismatic Platform because IR serves as the foundational layer between high-level workflow descriptions and low-level [PVM](@/glossary/pvm.md) bytecode execution. Any regression in IR processing performance directly impacts the throughput and latency of the entire agent execution pipeline. The `/ir-benchmark` command addresses this by providing repeatable, statistically sound benchmarks that can be integrated into continuous integration pipelines and quality gate enforcement.

This command operates under the **L2+** authority level and is executed by the `ir-pvm-profiler` agent, a specialist agent with deep knowledge of PVM internals and performance optimization patterns. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The profiler agent instruments IR workflows at multiple granularity levels, from coarse-grained phase timing to fine-grained instruction-level analysis.

The command produces structured benchmark reports that include statistical measures such as mean execution time, standard deviation, percentile distributions (P50, P95, P99), memory allocation profiles, and reduction counts. These reports can be output in multiple formats including human-readable tables, JSON for machine processing, and Markdown for documentation integration.

## Architecture

The `/ir-benchmark` command is built on a layered architecture that separates concern between benchmark orchestration, measurement collection, and report generation.

```
+---------------------+     +--------------------+     +------------------+
|  Benchmark Runner   | --> | Measurement Engine | --> | Report Generator |
| (Benchee Wrapper)   |     | (ETS Collectors)   |     | (Multi-Format)   |
+---------------------+     +--------------------+     +------------------+
         |                           |                          |
         v                           v                          v
+---------------------+     +--------------------+     +------------------+
| Scenario Builder    |     | Telemetry Hooks    |     | Comparison Engine|
| (IR Workflow Specs) |     | (Event Capture)    |     | (Baseline Diff)  |
+---------------------+     +--------------------+     +------------------+
```

The **Benchmark Runner** wraps Benchee with Prismatic-specific configuration, handling warm-up cycles, measurement iterations, and garbage collection isolation. The **Measurement Engine** uses [ETS](@/glossary/ets.md)-backed collectors to capture fine-grained timing data without introducing measurement overhead. The **Scenario Builder** constructs benchmark scenarios from IR workflow specifications, allowing users to benchmark specific pipeline stages or entire workflows. The **Comparison Engine** supports baseline comparison, enabling detection of performance regressions against saved benchmark results.

## Usage

### Basic Benchmarking

```bash
# Benchmark all IR workflows in the current project
/ir-benchmark

# Benchmark a specific IR workflow file
/ir-benchmark --file workflows/data_pipeline.ir

# Benchmark with extended warm-up and measurement cycles
/ir-benchmark --warmup 5s --time 30s
```

### Targeted Phase Benchmarking

```bash
# Benchmark only the parsing phase
/ir-benchmark --phase parse

# Benchmark validation and type-checking phases
/ir-benchmark --phase validate,typecheck

# Benchmark the compilation phase with optimization levels
/ir-benchmark --phase compile --opt-levels 0,1,2,3

# Benchmark end-to-end pipeline execution
/ir-benchmark --phase all --e2e
```

### Comparison and Regression Detection

```bash
# Save current benchmark as baseline
/ir-benchmark --save-baseline v1.0

# Compare against saved baseline
/ir-benchmark --compare v1.0

# Run regression check with threshold
/ir-benchmark --regression-check --threshold 5%

# Generate comparison report
/ir-benchmark --compare v1.0 --format markdown --output report.md
```

### Memory and Allocation Profiling

```bash
# Include memory allocation profiling
/ir-benchmark --memory

# Profile reduction counts (scheduler work units)
/ir-benchmark --reductions

# Full profiling (time, memory, reductions)
/ir-benchmark --profile full
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file` | string | all | Specific IR workflow file to benchmark |
| `--phase` | string | all | Pipeline phase(s) to benchmark: `parse`, `validate`, `typecheck`, `optimize`, `compile`, `all` |
| `--warmup` | duration | 2s | Warm-up duration before measurement begins |
| `--time` | duration | 10s | Measurement duration per scenario |
| `--memory` | boolean | false | Enable memory allocation profiling |
| `--reductions` | boolean | false | Enable BEAM reduction counting |
| `--profile` | string | time | Profiling mode: `time`, `memory`, `reductions`, `full` |
| `--format` | string | table | Output format: `table`, `json`, `markdown`, `csv` |
| `--output` | string | stdout | Output file path for benchmark results |
| `--save-baseline` | string | - | Save results as named baseline for future comparison |
| `--compare` | string | - | Compare against a saved baseline |
| `--regression-check` | boolean | false | Enable regression detection mode |
| `--threshold` | percentage | 10% | Regression detection threshold |
| `--opt-levels` | string | default | Optimization levels to benchmark |
| `--parallel` | integer | 1 | Number of parallel benchmark processes |
| `--e2e` | boolean | false | Include end-to-end pipeline measurement |
| `--verbose` | boolean | false | Enable detailed benchmark progress output |

## Execution Flow

The `/ir-benchmark` command follows a structured execution flow designed to produce reliable, reproducible measurements.

1. **Configuration Loading**: The command loads benchmark configuration from the project's `.ir-benchmark.exs` file if present, merging with command-line options. Default Benchee configuration is applied for any unspecified parameters.

2. **Scenario Discovery**: IR workflow files are discovered either from the specified `--file` parameter or by scanning the project's workflow directories. Each workflow is parsed to determine applicable benchmark phases.

3. **Environment Preparation**: The benchmark environment is prepared by performing garbage collection, establishing baseline memory measurements, and verifying that no competing processes are consuming significant resources.

4. **Warm-up Execution**: Each benchmark scenario runs through the configured warm-up period. During warm-up, measurements are discarded, but the JIT compilation and ETS cache warming effects are captured.

5. **Measurement Collection**: The Benchee measurement engine executes each scenario for the configured duration, collecting timing data, memory allocation data, and reduction counts as specified.

6. **Statistical Analysis**: Raw measurements are processed through Benchee's statistical analysis pipeline, computing mean, median, standard deviation, and percentile distributions for all collected metrics.

7. **Baseline Comparison**: If `--compare` is specified, results are compared against the saved baseline. Regression detection applies the configured threshold to identify statistically significant performance changes.

8. **Report Generation**: Final reports are generated in the requested format and written to the specified output destination.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Executed by the `ir-pvm-profiler` agent with PVM expertise |
| PVM Compiler | Data Source | Benchmarks the IR-to-PVM compilation pipeline |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Benchmark results feed into quality gate decisions |
| [Telemetry](@/glossary/telemetry.md) | Observability | All benchmark events emitted as telemetry for monitoring |
| [AIAD Registry](@/glossary/aiad.md) | Discovery | Command registered and discoverable via AIAD standard |
| Benchee | External Library | Statistical benchmarking engine providing measurement rigor |
| [ETS](@/glossary/ets.md) | Storage | Baseline storage and measurement collection backing |
| CI/CD Pipeline | Automation | Benchmark regression checks integrated into merge gates |

## Best Practices

**Isolate benchmark runs** from other workloads. The BEAM scheduler shares CPU time across all processes, so concurrent workloads will introduce measurement noise. Use `--parallel 1` for the most reliable single-threaded measurements, and only increase parallelism when specifically testing concurrent performance characteristics.

**Save baselines at release milestones.** Use semantic version names (e.g., `--save-baseline v2.3.0`) to create a historical record of performance evolution. This enables long-term trend analysis and helps identify gradual performance degradation that per-commit checks might miss.

**Use appropriate measurement durations.** Short-lived IR operations (sub-millisecond) require longer measurement durations to accumulate enough samples for statistical significance. The default 10-second measurement window is suitable for most workflows, but micro-benchmarks may need 30 seconds or more.

**Profile memory separately from timing.** Memory profiling adds measurement overhead that can skew timing results. Run timing benchmarks and memory benchmarks as separate passes when precision matters.

**Benchmark at multiple optimization levels.** The IR compiler supports multiple optimization levels, and performance characteristics can vary significantly across levels. Use `--opt-levels 0,1,2,3` to understand the performance impact of each optimization pass.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| IR file not found | Exits with file path suggestion | Verify file path and retry |
| Invalid IR syntax | Reports parse errors before benchmarking | Fix IR syntax with [/ir-lint](@/commands/ir-lint.md) |
| Baseline not found | Warning with available baselines listed | Save a baseline first with `--save-baseline` |
| Insufficient measurements | Warning with recommendation for longer `--time` | Increase measurement duration |
| Memory limit exceeded | Graceful abort with partial results | Reduce benchmark scope or increase system memory |
| Regression detected | Non-zero exit code with regression report | Investigate regression, optimize, or update baseline |

## Advanced Usage

### Custom Benchmark Scenarios

Create a `.ir-benchmark.exs` configuration file to define custom benchmark scenarios with specific inputs, expected performance envelopes, and comparison strategies:

```elixir
# .ir-benchmark.exs
%{
  scenarios: [
    %{name: "small_pipeline", file: "workflows/small.ir", expected_p99: "5ms"},
    %{name: "large_dag", file: "workflows/large_dag.ir", expected_p99: "50ms"},
    %{name: "deeply_nested", file: "workflows/nested.ir", expected_p99: "25ms"}
  ],
  warmup: "3s",
  time: "20s",
  memory_time: "5s",
  formatters: [
    {Benchee.Formatters.Console, extended_statistics: true},
    {Benchee.Formatters.HTML, file: "benchmarks/output.html"}
  ]
}
```

### CI/CD Integration

```bash
# In CI pipeline - fail build on regression
/ir-benchmark --regression-check --compare main --threshold 5% --format json --output benchmark-results.json

# Generate trend report across multiple baselines
/ir-benchmark --compare v1.0,v1.1,v1.2,v2.0 --format markdown --output trend-report.md
```

### Comparative Analysis Across IR Versions

```bash
# Benchmark current IR against an alternative representation
/ir-benchmark --file workflow.ir --compare-ir workflow.ir.v2 --format table
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Benchmark results must be statistically significant -- insufficient sample sizes trigger warnings rather than producing misleading results. Regression detection uses strict thresholds with no allowance for "acceptable" degradation without explicit baseline updates.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All performance claims are backed by Benchee's statistical analysis framework. Measurements include confidence intervals and standard deviations. No performance assertion is made without sufficient evidence.

The command integrates with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework by ensuring that performance claims satisfy the Signal Plurality axiom (multiple measurement samples), Time Decay axiom (timestamped baselines), and Provenance Mandatory axiom (full measurement methodology documented in reports).

## Related Commands

- [/ir-generate](@/commands/ir-generate.md) - Generate IR workflows from natural language descriptions
- [/ir-validate](@/commands/ir-validate.md) - Comprehensive validation of IR workflows with DAG analysis and type safety
- [/ir-lint](@/commands/ir-lint.md) - Static analysis and code quality enforcement for IR workflows
- [/ir-examples](@/commands/ir-examples.md) - Interactive examples, templates and learning resources for IR workflows
- [/pvm-compile](@/commands/pvm-compile.md) - Compile validated IR to optimized PVM bytecode
- [/pvm-execute](@/commands/pvm-execute.md) - Execute compiled PVM programs with [fault tolerance](@/glossary/fault-tolerance.md) and [real-time monitoring](@/capabilities/real-time-monitoring.md)
- [/pvm-trace](@/commands/pvm-trace.md) - Real-time execution tracing and debugging for PVM programs
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)