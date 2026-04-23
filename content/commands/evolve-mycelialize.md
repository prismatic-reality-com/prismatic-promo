+++
title = "/evolve-mycelialize"
weight = 500
[extra]
category = "Evolution"
description = "Unified evolution-propagation cycles integrating /evolve and /mycelialize capabilities"
syntax = "/evolve-mycelialize [options]"
authority = "SUPREME"
agent = "evolution-mycelial-fusion-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1242
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evolve-mycelialize", "Unified", "commands", "Evolution", "Prismatic Platform", "Pattern", "Propagation"]
tags = ["commands", "evolution", "evolve-mycelialize", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evolve-mycelialize - Prismatic Platform"
+++

## Overview

**/evolve-mycelialize** is a production command in the **Evolution** category of the Prismatic Platform. It provides unified evolution-propagation cycles that integrate the capabilities of [/evolve](/commands/evolve/) and [/mycelialize](/commands/mycelialize/) into a single cohesive operation. Where `/evolve` focuses on generational fitness improvement and `/mycelialize` handles biological-inspired pattern propagation, `/evolve-mycelialize` fuses both capabilities to simultaneously evolve the platform while propagating successful patterns across the entire ecosystem.

The biological metaphor underlying this command is instructive. In natural ecosystems, evolution and mycelial networks are deeply interconnected -- fungal mycelium networks facilitate nutrient transfer and communication between organisms, accelerating evolutionary adaptation across the ecosystem. The `/evolve-mycelialize` command replicates this synergy in the software domain: evolution generates beneficial mutations (quality improvements, pattern discoveries, architectural refinements), while the mycelial propagation network distributes these improvements across all 100+ umbrella applications simultaneously.

This fusion is not merely a sequential composition of two commands. The [evolution-mycelial-fusion-commander](/agents/evolution-mycelial-fusion-commander/) agent implements a co-evolutionary protocol where evolution and propagation inform each other in real time. Patterns that propagate successfully across many applications receive higher fitness scores, biasing future evolution toward patterns with proven cross-application applicability. Conversely, evolution cycles that discover novel patterns immediately feed the mycelial network for rapid ecosystem-wide distribution.

This command operates under the **SUPREME** authority level, the highest non-self-recursive authority in the platform hierarchy. SUPREME authority is required because unified evolution-propagation cycles modify code across the entire umbrella ecosystem simultaneously. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The evolve-mycelialize system implements a co-evolutionary feedback loop between the evolution engine and mycelial network:

```
                    ┌─────────────────────────────────────────┐
                    │         Co-Evolution Controller          │
                    └───────────┬───────────────┬─────────────┘
                                │               │
                    ┌───────────▼───────┐ ┌─────▼───────────┐
                    │  Evolution Engine  │ │ Mycelial Network │
                    │  (5-Phase Cycle)   │ │ (Propagation)    │
                    └───────┬───────────┘ └─────┬───────────┘
                            │                   │
                    ┌───────▼───────┐   ┌───────▼───────┐
                    │ Fitness Eval  │   │ Pattern Router │
                    │ (per domain)  │   │ (500K/sec)     │
                    └───────┬───────┘   └───────┬───────┘
                            │                   │
                    ┌───────▼───────────────────▼───────┐
                    │    Feedback Synthesizer            │
                    │  (propagation success → fitness)   │
                    └───────────────────────────────────┘
```

**Co-Evolution Controller**: Orchestrates the synchronized execution of evolution and propagation cycles. The controller manages timing, conflict resolution, and resource allocation between the two subsystems. It ensures that evolution mutations do not conflict with propagation targets and vice versa.

**Evolution Engine**: The standard 5-phase evolution pipeline (scanning, analysis, mutation, selection, validation) with additional feedback input from propagation results. Successfully propagated patterns receive fitness bonuses, biasing future mutation strategies toward propagatable improvements.

**Mycelial Network**: The biological-inspired pattern propagation system operating at 500,000 patterns per second. The network routes patterns from source applications to target applications based on applicability scoring, structural compatibility, and dependency analysis.

**Feedback Synthesizer**: The critical bridge between evolution and propagation. This component transforms propagation success metrics (how many applications accepted a pattern, how much quality improved) into fitness adjustments for the evolution engine, creating a virtuous cycle of improvement.

## Usage

### Standard Unified Cycle

```bash
# Run unified evolve-mycelialize cycle
/evolve-mycelialize

# Run with specific evolution focus
/evolve-mycelialize --evolution-focus=quality --propagation-scope=all

# Run with propagation-first strategy
/evolve-mycelialize --strategy=propagation-first
```

### Targeted Operations

```bash
# Focus on a specific application domain
/evolve-mycelialize --domain=storage --apps="prismatic_storage_*"

# Focus on a specific pattern type
/evolve-mycelialize --pattern-type=supervision-tree

# Run with emergence detection enabled
/evolve-mycelialize --detect-emergence --threshold=0.85
```

### Monitoring and Analysis

```bash
# Show co-evolution status
/evolve-mycelialize --status

# Display propagation success rates
/evolve-mycelialize --propagation-stats

# Generate co-evolution report
/evolve-mycelialize --report --format=table --verbose
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--evolution-focus` | string | balanced | Evolution focus (quality, capability, architecture) |
| `--propagation-scope` | string | all | Propagation scope (all, domain, app-list) |
| `--strategy` | string | balanced | Execution strategy (balanced, evolution-first, propagation-first) |
| `--domain` | string | all | Target specific application domain |
| `--apps` | string | all | Comma-separated list of target applications |
| `--pattern-type` | string | all | Focus on specific pattern types |
| `--detect-emergence` | flag | false | Enable emergence detection for novel patterns |
| `--threshold` | float | 0.80 | Propagation success threshold for pattern acceptance |
| `--status` | flag | false | Display current co-evolution status |
| `--propagation-stats` | flag | false | Show detailed propagation statistics |
| `--report` | flag | false | Generate comprehensive co-evolution report |
| `--format` | string | text | Output format (text, json, table) |
| `--verbose` | flag | false | Include detailed metrics and diagnostics |
| `--max-iterations` | integer | 10 | Maximum co-evolution iterations per cycle |
| `--fitness-boost` | float | 0.1 | Fitness bonus for successfully propagated patterns |

## Execution Flow

The `/evolve-mycelialize` command follows a structured 7-phase co-evolutionary pipeline:

1. **Ecosystem Snapshot**: A point-in-time snapshot of the entire umbrella ecosystem is captured, including all application states, quality scores, active patterns, and dependency relationships. This snapshot serves as both the evolution baseline and propagation context.

2. **Evolution Cycle**: The standard 5-phase evolution cycle executes, producing a set of candidate mutations. Each mutation is annotated with its propagation potential -- an estimate of how many other applications could benefit from the same change.

3. **Pattern Extraction**: Successfully validated mutations are extracted as reusable patterns. Pattern extraction identifies the invariant structure of each mutation (the generalizable improvement) separate from its application-specific context.

4. **Mycelial Propagation**: Extracted patterns are fed into the mycelial network for cross-application distribution. The network evaluates each pattern against every target application using structural compatibility analysis, dependency checking, and quality impact prediction.

5. **Propagation Validation**: Each propagated pattern instance is validated in its target application context. Validation includes compilation checking, test execution, and quality gate verification. Failed propagations are rolled back without affecting the source application.

6. **Feedback Synthesis**: Propagation results (success rates, quality improvements, application coverage) are synthesized into fitness adjustments. Patterns that propagated successfully to many applications receive higher fitness scores, influencing future evolution strategy.

7. **State Persistence**: The final state -- evolution results, propagation outcomes, and fitness adjustments -- is persisted to [Quality DNA](/glossary/quality-dna/) for cross-session continuity.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Evolution Engine](/glossary/autoevolve/) | Core | 5-phase evolution cycle with fitness evaluation |
| [Mycelial Network](/glossary/mycelial-network/) | Core | Pattern propagation at 500K patterns/sec |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Cross-session state and fitness history |
| [Quality Gates](/glossary/quality-gates/) | Validation | Pre/post cycle quality verification |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Fusion commander agent orchestrates |
| [Telemetry](/glossary/telemetry/) | Monitoring | Co-evolution [metrics](/glossary/metrics/) and propagation events |
| [SEADF](/glossary/seadf/) | Framework | Self-evolving framework integration |
| AIAD Registry | Discovery | Command specification and agent binding |

## Best Practices

**Use balanced strategy for general improvement**: The default balanced strategy alternates between evolution-focused and propagation-focused iterations, producing the most consistent cross-application improvement.

**Enable emergence detection for novel systems**: When working with new application domains or experimental features, enable `--detect-emergence` to identify novel patterns that emerge from the co-evolutionary process.

**Set appropriate propagation thresholds**: The default 0.80 threshold means patterns must succeed in 80% of target applications to be retained. Lower thresholds (0.60) for experimental propagation, higher (0.95) for production-critical domains.

**Monitor feedback synthesis**: The feedback loop between propagation success and evolution fitness is the most powerful -- and most sensitive -- aspect of the system. Use `--verbose` to monitor how propagation results influence subsequent evolution strategies.

**Run after major cross-cutting changes**: When architectural changes affect multiple applications, `/evolve-mycelialize` is more effective than running `/evolve` and `/mycelialize` independently, because the co-evolutionary feedback ensures consistency.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `CO_EVOLUTION_CONFLICT` | Evolution and propagation targeting the same code | Increase conflict resolution timeout or serialize operations |
| `PROPAGATION_THRESHOLD_NOT_MET` | Pattern success rate below configured threshold | Lower threshold or refine pattern for broader compatibility |
| `FEEDBACK_LOOP_DIVERGENCE` | Feedback synthesis producing unstable fitness adjustments | Reduce `--fitness-boost` value to dampen feedback |
| `ECOSYSTEM_SNAPSHOT_FAILED` | Cannot capture consistent ecosystem state | Ensure no other evolution cycles are running concurrently |
| `MYCELIAL_NETWORK_SATURATED` | Pattern volume exceeds network capacity | Reduce `--max-iterations` or narrow propagation scope |

## Advanced Usage

### Custom Co-Evolution Strategies

```bash
# Define a custom strategy prioritizing security patterns
/evolve-mycelialize --custom-strategy="security-hardening" \
  --evolution-focus=security --pattern-type="input-validation,auth" \
  --propagation-scope=all --fitness-boost=0.2

# Multi-phase co-evolution with increasing scope
/evolve-mycelialize --phase=1 --propagation-scope=core-apps && \
/evolve-mycelialize --phase=2 --propagation-scope=all --inherit-patterns
```

### Emergence Analysis

```bash
# Analyze emerged patterns from recent co-evolution cycles
/evolve-mycelialize --analyze-emergence --last=5 --verbose

# Export emerged patterns for manual review
/evolve-mycelialize --export-emergence --format=json
```

### Integration with Formal Verification

The co-evolutionary pipeline can optionally route emerged patterns through the [/mycelialize-formal](/commands/mycelialize-formal/) formal verification pipeline, using [Lean4](/glossary/lean4/) proofs to validate pattern correctness before ecosystem-wide propagation.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for degradation during co-evolution. Every propagated pattern must pass quality gates in every target application. Failed propagations are rolled back completely -- no partial application, no "good enough" compromises.
- **NO DOUBTS**: Full investigation through the co-evolutionary feedback loop. Pattern effectiveness is measured empirically through propagation success rates. Fitness adjustments are evidence-based, not heuristic.

The SUPREME authority level reflects the scope of this command's impact. Unified evolution-propagation cycles modify code across the entire umbrella ecosystem. This level of authority requires commensurate validation rigor.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for mathematically proven pattern propagation
- [/evolve-enforced](/commands/evolve-enforced/) - Evolution with mandatory QDP reduction
- [/evolve-patterns](/commands/evolve-patterns/) - Pattern evolution through meta-evolution analysis
- [/evolve-quality-gates](/commands/evolve-quality-gates/) - Quality gate evolution for warnings, tests and static analysis
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)