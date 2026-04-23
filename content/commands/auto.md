+++
title = "/auto"
weight = 20
[extra]
category = "Orchestration"
description = "Intelligent autonomous evolution engine for zero-human-intervention improvements"
syntax = "/auto [options]"
authority = "COSMIC - ARCHER SUPREME"
agent = "auto-intelligence-engine"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1097
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["auto", "Intelligent", "commands", "Orchestration", "Prismatic Platform", "Credo", "COSMIC", "ARCHER SUPREME"]
tags = ["commands", "orchestration", "auto", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/auto - Prismatic Platform"
+++

## Overview

The **/auto** command is the intelligent autonomous evolution engine at the heart of the Prismatic Platform's self-improvement infrastructure. Designed for zero-human-intervention operation, it automatically scans the codebase for improvement opportunities, prioritizes them by impact and risk, implements safe changes, and verifies that all quality gates pass before committing results. This is the foundational command in the platform's three-tier autonomous development hierarchy, with [/auto-pro](/commands/auto-pro/) and [/auto-ultimate](/commands/auto-ultimate/) building progressively more sophisticated capabilities on top of its core architecture.

The philosophy behind /auto is rooted in the observation that software platforms accumulate technical debt, quality inconsistencies, and optimization opportunities at a rate that exceeds what manual review processes can address. Rather than relying exclusively on human-initiated improvement cycles, the /auto command operates as a continuous improvement engine that can be invoked at any time to autonomously identify and implement beneficial changes. It achieves this through a four-phase cycle: analysis, planning, implementation, and validation.

Operating at the highest authority level (COSMIC - [ARCHER SUPREME](/glossary/archer-supreme/)), the /auto command has full platform access and is executed by the `auto-intelligence-engine` agent. This elevated authority is necessary because autonomous evolution may touch any application within the 90-app umbrella, requiring cross-boundary read and write permissions. The command is classified as high-usage within the platform's 216-command [registry](/glossary/registry-otp/) and is integral to the mandatory Universal Autonomous Evolution Protocol that runs at every session boundary.

## Usage

```bash
/auto [action] [scope] [options]
```

The command accepts an optional action parameter (defaulting to `evolve`) and an optional scope that limits the analysis to a specific application or module path.

### Examples

```bash
# Start autonomous evolution with defaults (3 cycles, full platform)
/auto

# Evolve a specific application
/auto evolve apps/prismatic_storage_core

# Analyze without making changes (dry run)
/auto analyze --dry-run

# Check the current status of the autonomous evolution system
/auto status

# Generate a comprehensive evolution report
/auto report

# Run extended evolution with more cycles
/auto evolve --cycles=5
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **action** | string | No | `evolve` | Action to perform: `evolve` (full cycle), `analyze` (scan only), `improve` (apply improvements), `status` (system status), `report` (generate report) |
| **scope** | string | No | Platform-wide | Scope of operation: path to specific app, module, or `apps/` for all |
| **--cycles** | integer | No | `3` | Number of evolution cycles to execute per invocation |
| **--dry-run** | boolean | No | `false` | Preview changes without applying them to the codebase |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | COSMIC - ARCHER SUPREME |
| **Executing Agent** | `auto-intelligence-engine` |
| **Status** | Production |
| **Usage Frequency** | High |
| **Category** | Orchestration |
| **Read Access** | All applications, tests, configuration, quality DNA |
| **Write Access** | Source files, test files, documentation, quality metrics |
| **Escalation Path** | ARCHER SUPREME for cross-cutting evolution decisions |
| **Rollback Capability** | Automatic rollback on any quality gate failure |

## Technical Implementation

The /auto command implements a four-phase evolution cycle that repeats for the configured number of iterations. Each cycle builds on the outcomes of the previous one, allowing the system to discover deeper improvement opportunities as surface-level issues are resolved. The implementation uses the `with` pattern for clean error propagation and automatic rollback.

```elixir
defmodule Prismatic.Commands.Auto do
  @moduledoc """
  Autonomous evolution engine for zero-human-intervention improvements.
  Operates at COSMIC authority with full platform access.
  """

  @default_cycles 3
  @quality_floor 100

  @spec execute(action :: String.t(), scope :: String.t(), opts :: keyword()) ::
          {:ok, EvolutionReport.t()} | {:error, term()}
  def execute(action \\ "evolve", scope \\ "apps/", opts \\ []) do
    cycles = Keyword.get(opts, :cycles, @default_cycles)
    dry_run = Keyword.get(opts, :dry_run, false)

    case action do
      "evolve" -> run_evolution_cycles(scope, cycles, dry_run)
      "analyze" -> analyze_opportunities(scope, dry_run)
      "improve" -> apply_improvements(scope, dry_run)
      "status" -> get_evolution_status()
      "report" -> generate_evolution_report(scope)
    end
  end

  defp run_evolution_cycles(scope, cycles, dry_run) do
    Enum.reduce_while(1..cycles, {:ok, []}, fn cycle, {:ok, acc} ->
      case execute_single_cycle(scope, cycle, dry_run) do
        {:ok, results} -> {:cont, {:ok, acc ++ results}}
        {:error, _} = error -> {:halt, error}
      end
    end)
  end

  defp execute_single_cycle(scope, cycle_number, dry_run) do
    with {:ok, opportunities} <- scan_for_opportunities(scope),
         {:ok, plan} <- prioritize_by_impact(opportunities),
         {:ok, changes} <- implement_safely(plan, dry_run),
         {:ok, verified} <- verify_quality_gates(changes) do
      {:ok, %{cycle: cycle_number, changes: verified}}
    end
  end
end
```

The analysis phase scans the codebase using Git Trees for file discovery, Credo for static analysis, and custom pattern detectors for anti-pattern identification. The planning phase applies a multi-objective ranking function that balances impact (how many files/modules benefit), risk (likelihood of regression), and effort (complexity of the change). The implementation phase applies changes through the Edit tool with atomic file-level granularity. The validation phase runs compilation with `--warnings-as-errors`, Credo strict checks, and the relevant test suite.

## Workflow Integration

The /auto command is designed to be invoked at multiple points in the development workflow. The Universal Autonomous Evolution Protocol mandates its execution at session boundaries: `mix autoevolve status` at session start and `mix autoevolve.mega` at session end. This ensures that every interaction with the platform contributes to its continuous improvement.

Beyond the mandatory protocol, /auto integrates into several workflow patterns:

1. **Session Start**: Run `/auto status` to see pending improvement opportunities and recent evolution metrics
2. **Post-Feature Development**: After completing a feature, run `/auto evolve apps/[modified-app]` to clean up any quality debt introduced during rapid development
3. **Pre-Deployment Gate**: Use `/auto analyze --dry-run` as a pre-deployment check to identify any remaining improvement opportunities that should be addressed before production release
4. **Continuous Improvement Sprints**: Dedicate periodic sessions to running `/auto evolve --cycles=5` across the entire platform for comprehensive quality uplift
5. **Quality Floor Maintenance**: When the Quality Floor Guardian detects score degradation, /auto can be targeted at the affected domains to restore quality levels

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `auto-intelligence-engine` agent with COSMIC authority |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](/glossary/quality-gates/) | Mandatory pass/fail validation after every evolution cycle |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and evolution tracking |
| Quality Floor Guardian | Triggers /auto when quality score drops below threshold |
| Quality DNA | Persists evolution metrics and improvement trajectories across sessions |
| SEADF Framework | Autonomous evolution subsystem coordination |
| Git Trees | Rapid file discovery and codebase traversal for analysis phase |
| Credo | Static analysis integration for pattern detection |
| Session Lifecycle | Mandatory invocation at session start and session end |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: The /auto command enforces a quality floor of 100/100. Any evolution cycle that would reduce the quality score below this threshold is automatically rolled back. Zero warnings, zero Credo violations, zero compilation errors are tolerated at any point during execution. Incomplete evolution cycles are rejected entirely rather than partially applied.
- **NO DOUBTS**: Every improvement identified by /auto is backed by concrete evidence from static analysis, pattern detection, or test coverage metrics. The command never applies speculative changes. Each modification includes a traceable rationale linking it to a specific quality metric or anti-pattern detection. Dry-run mode enables full investigation before committing to action.
- **NABLA Compliance**: Evolution decisions respect signal plurality by aggregating findings from multiple analysis tools (Credo, Dialyzer, compilation warnings, custom pattern detectors) rather than relying on any single source. Contradictions between different analysis tools are preserved and surfaced in the evolution report rather than silently resolved.

## Best Practices

1. **Start with status**: Always run `/auto status` before `/auto evolve` to understand the current state of the evolution system and any pending opportunities
2. **Use dry-run first**: For unfamiliar scopes, run `/auto analyze --dry-run` to preview what changes would be made before committing
3. **Scope appropriately**: Target specific applications with `/auto evolve apps/[app]` rather than always running platform-wide to reduce cycle time and improve focus
4. **Review reports**: After evolution cycles complete, review the generated report to understand what was changed and why, building institutional knowledge
5. **Combine with /auto-pro**: For domains that have exhausted basic /auto improvements, escalate to [/auto-pro](/commands/auto-pro/) which adds genetic optimization and mycelial intelligence
6. **Monitor quality DNA**: Track the evolution trajectory over time through Quality DNA metrics to ensure continuous positive momentum

## Related Commands

- [/orchestrate](/commands/orchestrate/) - Revolutionary AI-powered task orchestration with 10x development efficiency
- [/auto-pro](/commands/auto-pro/) - Steroids edition with genetic optimization, swarm intelligence and quantum decisions
- [/auto-ultimate](/commands/auto-ultimate/) - Maximum [intelligence fusion](/glossary/intelligence-fusion/) combining MENDEL, MYCELIALIZE and AXON/EXLA neural computing
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/cascade](/commands/cascade/) - Execute [CASCADE pattern](/glossary/cascade-pattern/) fix for systematic anti-pattern removal
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)