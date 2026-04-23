+++
title = "/seadf"
weight = 1930
[extra]
category = "Framework"
description = "Self-Evolving Autonomous Development Framework control and monitoring"
syntax = "/seadf [options]"
authority = "L2+"
agent = "seadf-ecosystem-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 918
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["seadf", "Self-Evolving", "Autonomous", "Development", "Framework", "commands", "Prismatic Platform", "Active", "Knowledge Sync", "Scanner"]
tags = ["commands", "framework", "seadf", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/seadf - Prismatic Platform"
+++

## Overview

**/seadf** is a production command in the **Framework** category of the Prismatic Platform. It provides control and monitoring for the Self-Evolving Autonomous Development Framework (SEADF), the meta-system that governs how the platform improves itself over time. SEADF coordinates seven subsystems: Scanner, Pipeline, Quality Guardian, Knowledge Sync, Cross-Domain Innovator, Autonomous Reporter, and Enhanced Healing. Together, these subsystems form a closed-loop improvement cycle where the platform continuously scans for issues, generates improvements, validates them, and promotes successful changes.

This command operates under the **L2+** authority level and is executed by the `seadf-ecosystem-commander` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The ecosystem commander has visibility across all seven subsystems and authority to start, stop, and configure individual subsystems as well as the overall framework.

SEADF represents the platform's capacity for autonomous improvement. Rather than relying exclusively on human-directed changes, SEADF enables the platform to identify improvement opportunities, generate candidate fixes, validate them through the quality gate pipeline, and promote successful improvements. Human oversight remains central: all promotions require quality gate passage and significant changes are flagged for review.

## Architecture

SEADF operates as a seven-subsystem ecosystem with a central coordinator.

### Ecosystem Architecture

```
                    /seadf
                      |
              Ecosystem Commander
                      |
    +------+------+------+------+------+------+------+
    |      |      |      |      |      |      |      |
  Scanner Pipe-  Quality Know-  Cross  Auto   Enhanced
         line   Guardian ledge  Domain Report  Healing
                        Sync   Innov
    |      |      |      |      |      |      |
    v      v      v      v      v      v      v
  Scan   Process Enforce  Sync  Innov  Report  Heal
  Issues  Fixes  Quality  Know  Cross  Status  Quality
                                Domain
```

### Subsystem Overview

| Subsystem | Role | Key Capability | Status |
|-----------|------|----------------|--------|
| **Scanner** | Issue discovery | Codebase-wide pattern scanning, defect detection | Active |
| **Pipeline** | Improvement processing | Fix generation, validation, promotion pipeline | Active |
| **Quality Guardian** | Quality enforcement | Quality floor monitoring, regression prevention | Active |
| **Knowledge Sync** | Cross-session continuity | Quality DNA management, session context | Active |
| **Cross-Domain Innovator** | Innovation transfer | Pattern transplantation across domains | Active |
| **Autonomous Reporter** | Status communication | Progress reports, metric dashboards, alerts | Active |
| **Enhanced Healing** | 5-level autonomous healing | Progressive fix complexity from L1 (trivial) to L5 (architectural) | Active |

### Healing Levels

| Level | Complexity | Example | Automation |
|-------|-----------|---------|------------|
| **L1** | Trivial | Formatting, import ordering | Fully automated |
| **L2** | Simple | Missing typespecs, guard addition | Fully automated |
| **L3** | Moderate | Function refactoring, pattern fix | Semi-automated |
| **L4** | Complex | Module restructuring, API change | Assisted |
| **L5** | Architectural | System design change | Advisory only |

## Usage

```bash
# Show SEADF ecosystem status
/seadf status

# Show verbose status with subsystem details
/seadf status --verbose

# Start SEADF evolution cycle
/seadf evolve ecosystem

# Heal quality issues
/seadf heal quality_guardian

# Sync knowledge across sessions
/seadf sync knowledge

# Run specific subsystem
/seadf run scanner

# Stop specific subsystem
/seadf stop pipeline

# Show healing history
/seadf history --since 7d

# Configure subsystem parameters
/seadf config scanner --scan-depth deep

# Export SEADF metrics
/seadf metrics --format json --export ./seadf-metrics.json
```

### Practical Examples

```bash
# Full ecosystem evolution cycle with detailed output
/seadf evolve ecosystem --verbose

# Targeted healing of Dialyzer violations
/seadf heal quality_guardian --domain dialyzer --level L2

# Cross-domain innovation scan for performance patterns
/seadf run cross_domain --source-domain quality --target-domain performance

# Generate autonomous status report
/seadf report --format markdown --export ./seadf-report.md

# Configure scanner for deep analysis
/seadf config scanner --scan-depth deep --focus anti-patterns
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--verbose` | `flag` | false | Detailed output with subsystem metrics |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export output to file |
| `--subsystem` | `string` | all | Target specific subsystem |
| `--domain` | `string` | all | Quality domain focus |
| `--level` | `enum` | `auto` | Healing level: `L1`, `L2`, `L3`, `L4`, `L5`, `auto` |
| `--since` | `duration` | all | Time filter for history/metrics |
| `--dry-run` | `flag` | false | Show plan without executing |
| `--auto-commit` | `flag` | false | Auto-commit L1/L2 healing results |
| `--scan-depth` | `enum` | `standard` | Scanner depth: `quick`, `standard`, `deep` |
| `--focus` | `string` | all | Focus area for scanning |

## Execution Flow

### Evolution Cycle

The `evolve ecosystem` command triggers a complete SEADF evolution cycle:

1. **Scanner Phase** -- Identify all current issues, patterns, and improvement opportunities
2. **Pipeline Phase** -- Generate fix candidates for identified issues
3. **Quality Guardian Phase** -- Validate fixes against quality gates
4. **Knowledge Sync Phase** -- Update quality DNA and session context
5. **Cross-Domain Phase** -- Transplant successful patterns to other domains
6. **Reporter Phase** -- Generate evolution summary report
7. **Healing Phase** -- Apply validated fixes at appropriate healing levels

### Healing Workflow

```
Issue Detected → Classify Severity → Select Healing Level
     → Generate Fix → Validate → Promote/Reject → Log
```

Each healing level has specific automation boundaries. L1-L2 fixes can be fully automated (formatting, missing annotations). L3-L4 fixes require semi-automated assistance (refactoring, API changes). L5 fixes produce advisory recommendations only.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/evolve](/commands/evolve/) | Framework | SEADF is the infrastructure behind /evolve |
| [/quality-gates](/commands/quality-gates/) | Enforcement | All SEADF changes pass quality gates |
| [/quality-evolve](/commands/quality-evolve/) | Consumer | Quality evolution uses SEADF infrastructure |
| [/mycelialize](/commands/mycelialize/) | Pattern | Mycelial propagation uses SEADF scanner data |
| [/scan-mycelium](/commands/scan-mycelium/) | Scanner | Mycelium scanning is a SEADF scanner mode |
| [/pack-sources](/commands/pack-sources/) | Infrastructure | Source packing uses SEADF file analysis |
| [Quality DNA](/glossary/quality-dna/) | State | Knowledge Sync manages Quality DNA |
| [Telemetry](/glossary/telemetry/) | Monitoring | All subsystem metrics streamed to telemetry |

## Best Practices

### Regular Evolution Cycles

Run `seadf evolve ecosystem` at the start and end of each development session. This ensures the platform's quality DNA stays current and improvement opportunities are continuously identified.

### Healing Level Selection

Use `auto` healing level (default) to let SEADF classify issues appropriately. Override with specific levels only when you know the exact complexity of the issue. Attempting L5 healing on a trivial issue wastes resources; attempting L1 healing on an architectural issue produces inadequate fixes.

### Quality Guardian Monitoring

Monitor the Quality Guardian's floor enforcement. If the guardian detects quality regression, it triggers automatic healing cycles. Persistent regressions indicate that the healing process needs human intervention.

### Knowledge Sync Discipline

Ensure Knowledge Sync runs at session boundaries to preserve quality DNA across sessions. Interrupted sessions without sync lose improvement context.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `SUBSYSTEM_UNAVAILABLE` | Target subsystem not responding | Restart subsystem with `/seadf restart <subsystem>` |
| `EVOLUTION_CYCLE_FAILURE` | Evolution cycle failed mid-execution | Check subsystem logs; retry with `--verbose` |
| `HEALING_REGRESSION` | Healing fix caused quality regression | Fix reverted automatically; investigate root cause |
| `KNOWLEDGE_SYNC_CONFLICT` | Conflicting quality DNA from parallel sessions | Manual merge required; check `.claude/quality-dna/` |
| `SCANNER_OVERLOAD` | Scanner processing exceeds resource limits | Reduce `--scan-depth` or narrow scope with `--domain` |
| `PIPELINE_BLOCKED` | Fix pipeline blocked by quality gate failure | Review gate failures; fix blocking issues first |

## Advanced Usage

### Custom Evolution Profiles

Create profiles for different evolution scenarios:

```bash
/seadf evolve --profile "pre-release" --level L1,L2 --auto-commit
/seadf evolve --profile "deep-analysis" --scan-depth deep --level L1-L5
```

### Subsystem Configuration

Fine-tune individual subsystems:

```bash
/seadf config quality_guardian --floor 95 --alert-threshold 98
/seadf config scanner --ignore-patterns "test_helper,factory"
/seadf config healing --max-l3-per-cycle 10
```

### Metrics Dashboard

Generate a comprehensive metrics dashboard:

```bash
/seadf metrics --since 30d --format json --detailed --export ./metrics/
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. SEADF healing fixes must pass all quality gates.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every evolution decision is backed by scanner data and quality metrics.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-evolve](/commands/quality-evolve/) - Quality-focused evolution targeting specific quality domains
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/scan-mycelium](/commands/scan-mycelium/) - Mycelial pattern scanning across documentation and code
- [/pack-sources](/commands/pack-sources/) - Create optimized source archives for AI/LLM analysis
- [/rc1-orchestrate](/commands/rc1-orchestrate/) - Complete RC1 delivery pipeline execution with ROC optimization
- [/ecosystem](/commands/ecosystem/) - Platform ecosystem overview and status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)