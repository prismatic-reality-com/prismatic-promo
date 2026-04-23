+++
title = "/mega-evolve"
weight = 480
[extra]
category = "Evolution"
description = "Unified evolution orchestrator combining all evolution mechanisms in single cycle"
syntax = "/mega-evolve [options]"
authority = "SUPREME"
agent = "evolution-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1289
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mega-evolve", "Unified", "commands", "Evolution", "Prismatic Platform", "Phase", "Flag", "String"]
tags = ["commands", "evolution", "mega-evolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/mega-evolve - Prismatic Platform"
+++

## Overview

**/mega-evolve** is a production command in the **Evolution** category of the Prismatic Platform. It serves as the unified evolution orchestrator that combines all of the platform's evolution mechanisms -- genetic algorithms, mycelial pattern propagation, meta-evolution, quality debt elimination, and autonomous healing -- into a single comprehensive evolution cycle. Where individual evolution commands operate on specific subsystems, `/mega-evolve` orchestrates them all in concert, ensuring coordinated improvement across the entire platform in one atomic operation.

The concept behind mega-evolution is that platform improvement is most effective when all evolution mechanisms operate synergistically rather than independently. A quality improvement discovered by the autoheal system may create opportunities for pattern propagation via [mycelialize](@/commands/mycelialize.md), which in turn may unlock new genetic recombination opportunities detected by [mendelize](@/commands/mendelize.md). By running all mechanisms in a single coordinated cycle, `/mega-evolve` captures these cross-mechanism synergies that would be lost when running evolution commands independently.

This command operates under the **SUPREME** authority level -- the highest operational authority in the platform -- reflecting the scope and impact of a full mega-evolution cycle. It is executed by the `evolution-orchestrator` agent, a supreme-level agent with authority to invoke any subordinate evolution agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

A complete mega-evolution cycle is typically executed at the end of each development session as part of the platform's mandatory session lifecycle protocol. The session-end mega-evolution ensures that all improvements discovered during the session are propagated, validated, and integrated before the session state is persisted. This discipline has driven the platform from Generation 1 to Generation 18 over the course of its evolution, achieving a fitness score of 0.999.

## Architecture

The mega-evolution system is structured as a multi-phase orchestration pipeline that sequences individual evolution mechanisms in dependency order.

```
+---------------------+     +---------------------+     +---------------------+
|  Phase 1: Baseline  |---->|  Phase 2: Heal      |---->|  Phase 3: Evolve    |
|  (Quality Snapshot)  |     |  (AutoHeal Cycle)   |     |  (AutoEvolve Scan)  |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Phase 4: Propagate |---->|  Phase 5: Genetic    |---->|  Phase 6: Validate  |
|  (Mycelialize)      |     |  (Mendelize)        |     |  (Quality Gates)    |
+---------------------+     +---------------------+     +---------------------+
         |                           |                           |
         v                           v                           v
+---------------------+     +---------------------+     +---------------------+
|  Phase 7: Meta      |---->|  Phase 8: Report     |---->|  Phase 9: Persist   |
|  (Meta-Evolve)      |     |  (Evolution Report)  |     |  (State Save)       |
+---------------------+     +---------------------+     +---------------------+
```

Each phase operates as an independent unit with clearly defined inputs, outputs, and success criteria. The orchestrator manages phase transitions, ensuring that each phase completes successfully before the next begins. Phase failures can either halt the cycle (for critical phases like quality gates) or continue with degraded results (for optional enhancement phases).

The **Baseline Phase** captures a snapshot of the platform's current quality metrics, providing a comparison point for measuring evolution progress. The **Validation Phase** runs the full quality gate suite against the evolved platform, ensuring no regressions were introduced. The **Report Phase** generates a detailed evolution report showing what changed, what improved, and what the fitness delta was.

## Usage

### Standard Mega-Evolution

```bash
# Execute a complete mega-evolution cycle
/mega-evolve

# Execute with verbose progress reporting
/mega-evolve --verbose

# Execute with a specific focus area
/mega-evolve --focus=quality
```

### Controlled Execution

```bash
# Execute specific phases only
/mega-evolve --phases=heal,evolve,validate

# Skip specific phases
/mega-evolve --skip=genetic,meta

# Dry run showing what would be executed
/mega-evolve --dry-run
```

### Session Integration

```bash
# Session-end mega-evolution (includes state persistence)
/mega-evolve --session-end

# Quick evolution for mid-session checkpoints
/mega-evolve --quick

# Full evolution with GitLab tracking
/mega-evolve --track --gitlab-issue=auto
```

### Analysis and Reporting

```bash
# Show evolution history
/mega-evolve --history

# Compare current state with a previous evolution baseline
/mega-evolve --compare=baseline-2026-02-15

# Generate detailed evolution report without executing
/mega-evolve --report-only
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--focus` | String | all | Focus area (quality, performance, patterns, agents, all) |
| `--phases` | String | all | Comma-separated list of phases to execute |
| `--skip` | String | none | Comma-separated list of phases to skip |
| `--dry-run` | Flag | false | Show execution plan without running |
| `--quick` | Flag | false | Run abbreviated cycle (baseline, heal, validate only) |
| `--session-end` | Flag | false | Full session-end cycle with state persistence |
| `--track` | Flag | false | Enable GitLab issue tracking for evolution |
| `--gitlab-issue` | String | none | GitLab issue ID (auto = create new) |
| `--history` | Flag | false | Show evolution history across sessions |
| `--compare` | String | none | Compare current state with named baseline |
| `--report-only` | Flag | false | Generate report from current state without evolution |
| `--verbose` | Flag | false | Detailed progress output for each phase |
| `--timeout` | Duration | 10m | Maximum total cycle duration |
| `--format` | String | table | Output format for reports (table, json, markdown) |

## Execution Flow

1. **Authorization Check** -- SUPREME authority is verified. Mega-evolution affects the entire platform and requires the highest operational clearance.

2. **Phase Planning** -- The orchestrator constructs the phase execution plan based on options (focus, phases, skip). Dependencies between phases are validated; skipping a phase that is a dependency of an included phase triggers a warning.

3. **Baseline Capture** -- Current quality metrics, fitness score, generation number, and platform state are captured as the evolution baseline. This snapshot enables before/after comparison.

4. **AutoHeal Cycle** -- The `mix autoheal.cycle` process executes, identifying and automatically resolving quality issues, compilation warnings, and code style violations.

5. **AutoEvolve Scan** -- The `mix autoevolve.scan` process analyzes the codebase for evolution opportunities: pattern candidates, optimization potential, and structural improvements.

6. **Mycelial Propagation** -- Discovered patterns are propagated across the codebase through the mycelial network, ensuring that improvements found in one module are applied wherever applicable.

7. **Genetic Operations** -- Mendelian inheritance algorithms evaluate trait combinations across the platform's agent population, selecting beneficial trait combinations and retiring suboptimal ones.

8. **Quality Gate Validation** -- The full quality gate suite (`mix quality.gates`) executes, verifying that all evolution operations maintained or improved quality. Gate failures halt the cycle and trigger rollback of the current phase.

9. **Meta-Evolution** -- The evolution system itself is analyzed for improvement opportunities, enabling the evolution mechanisms to evolve their own parameters and strategies.

10. **Report Generation** -- A comprehensive evolution report is produced showing fitness delta, quality improvements, patterns propagated, traits evolved, and generation advancement.

11. **State Persistence** -- Evolution results, new baseline, and updated generation metadata are persisted for cross-session continuity.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Orchestration | Orchestrates multiple evolution agents through the `evolution-orchestrator` |
| AutoHeal | Phase Integration | AutoHeal cycle as Phase 2 |
| AutoEvolve | Phase Integration | AutoEvolve scan as Phase 3 |
| [Mycelialize](@/commands/mycelialize.md) | Phase Integration | Pattern propagation as Phase 4 |
| [Mendelize](@/commands/mendelize.md) | Phase Integration | Genetic operations as Phase 5 |
| [Meta-Evolve](@/commands/meta-evolve.md) | Phase Integration | Meta-evolution as Phase 7 |
| [Quality Gates](@/glossary/quality-gates.md) | Validation Gate | Quality gate validation as Phase 6 |
| [Telemetry](@/glossary/telemetry.md) | Observability | Comprehensive evolution cycle telemetry |
| [Quality DNA](@/glossary/quality-dna.md) | State Persistence | Evolution state persisted in Quality DNA |
| [GitLab](@/glossary/gitlab-ci.md) | Tracking | Optional GitLab issue tracking for evolution cycles |

## Best Practices

**Session-End Discipline**: Execute `/mega-evolve --session-end` at the end of every development session. This is a mandatory protocol that ensures all improvements are propagated and validated before session state is saved.

**Quick Cycles for Checkpoints**: Use `/mega-evolve --quick` for mid-session checkpoints when you want to verify quality but do not need full evolution. The quick cycle runs baseline, heal, and validate phases only.

**Track Major Evolutions**: For significant evolution cycles (generation advancement, major quality improvements), use `--track` to create GitLab issues documenting the evolution. This supports audit trail and historical analysis.

**Review Dry Runs**: Before running a full mega-evolution cycle after significant codebase changes, use `--dry-run` to understand the planned execution sequence and verify phase inclusion.

**Monitor Fitness Trends**: Use `--history` periodically to review fitness score trends across sessions. A declining trend indicates accumulated issues that need attention.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Insufficient authority (below SUPREME) | Permission denied | Escalate to SUPREME authority |
| Quality gate failure in Phase 6 | Cycle halted with gate failure details | Address quality issues before re-running |
| Phase timeout exceeded | Phase aborted with partial results | Increase timeout or skip problematic phase |
| AutoHeal cycle failure | Warning; subsequent phases proceed with reduced scope | Review autoheal logs for stuck issues |
| Baseline capture failure | Fatal; cycle cannot proceed without baseline | Resolve underlying metric collection issues |
| State persistence failure | Warning with manual save instructions | Manually save evolution state |

## Advanced Usage

### Custom Phase Ordering

For specialized evolution scenarios, override the default phase ordering:

```bash
# Run genetic operations before mycelial propagation
/mega-evolve --phase-order=baseline,heal,genetic,propagate,validate,report
```

### Evolution Experiments

Test evolution strategies without committing results:

```bash
# Run evolution in experimental mode (no state persistence)
/mega-evolve --experimental --no-persist

# Compare two evolution strategies
/mega-evolve --strategy=aggressive --compare-with=conservative
```

### Automated Scheduling

Configure mega-evolution to run on a schedule for continuous improvement:

```bash
# Configure daily evolution schedule
/mega-evolve --schedule=daily --time=02:00 --phases=heal,evolve,validate
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for evolution regressions. The quality gate phase is non-optional and non-bypassable. Any evolution that reduces platform quality is automatically rolled back. Every phase must produce measurable improvement or maintain the current baseline -- degradation is not an acceptable outcome.
- **NO DOUBTS**: Full measurement and verification at every phase boundary. The baseline phase establishes evidence-based starting metrics; the validation phase provides evidence-based confirmation of improvement. Evolution reports include provenance for every change, supporting audit and reproducibility.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)