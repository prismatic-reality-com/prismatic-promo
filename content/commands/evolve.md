+++
title = "/evolve"
weight = 410
[extra]
category = "Evolution"
description = "Living AIAD ecosystem evolution with 5-phase cycle and GitLab observability"
syntax = "/evolve [options]"
authority = "SUPREME + SELF-RECURSIVE"
agent = "evolution-orchestrator"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1381
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evolve", "Living", "AIAD", "5-phase", "GitLab", "commands", "Evolution", "Prismatic Platform", "Phase"]
tags = ["commands", "evolution", "evolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evolve - Prismatic Platform"
+++

## Overview

**/evolve** is the flagship production command in the **Evolution** category of the Prismatic Platform. It drives living [AIAD](/glossary/aiad/) ecosystem evolution through a 5-phase cycle with full GitLab [observability](/glossary/observability/), serving as the primary mechanism by which the platform autonomously improves itself across generations. This is not incremental refactoring or manual optimization -- it is systematic, measured, generational evolution of the entire platform ecosystem.

The Prismatic Platform has evolved through 18 generations, from an initial Gen 1 state to the current Gen 18 apex with 0.999 fitness across 13 quality domains. Each generation represents a measurable improvement in code quality, agent capability, pattern diversity, and architectural coherence. The `/evolve` command orchestrates this entire evolutionary process, managing the lifecycle from mutation generation through fitness evaluation to selection and persistence.

The command's SUPREME + SELF-RECURSIVE authority level is unique in the platform's command registry. SUPREME authority grants it the ability to modify any platform component. SELF-RECURSIVE authority means the evolution system can evolve itself -- improving its own mutation strategies, fitness functions, and selection algorithms through the same evolutionary process it applies to the rest of the platform. This self-recursive capability is what enables exponential improvement: each generation's evolution is driven by a more capable evolution system than the previous generation's.

This command is executed by the `evolution-orchestrator` agent, the most powerful orchestration agent in the AIAD ecosystem. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the AIAD (Autonomous Intelligence Agent Design) standard, and represents the highest expression of the platform's autonomous intelligence capabilities.

## Architecture

The evolution engine implements a biological-inspired generational model with five distinct phases:

```
┌─────────────────────────────────────────────────────────────┐
│                   Evolution Orchestrator                     │
│              (SUPREME + SELF-RECURSIVE Authority)            │
└──────┬──────────┬──────────┬──────────┬──────────┬──────────┘
       │          │          │          │          │
  ┌────▼────┐ ┌──▼──┐ ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐
  │ SCAN    │ │ANAL.│ │ MUTATE  │ │ SELECT │ │VALIDATE │
  │ Phase 1 │ │Ph. 2│ │ Phase 3 │ │Phase 4 │ │ Phase 5 │
  └────┬────┘ └──┬──┘ └────┬────┘ └───┬────┘ └──┬──────┘
       │          │          │          │          │
  Codebase   Quality    Improvements  Fitness   Quality
  Survey     Analysis   Generation    Eval      Gates
       │          │          │          │          │
  Git Trees  13 Domains  Patterns    Selection  Compilation
  AST Index  Metrics     Mutations   Pressure   Tests/Credo
                                                 Dialyzer
```

**Phase 1 -- SCAN**: The evolution engine surveys the entire codebase using [git trees](/glossary/git-trees/) (~100x faster than filesystem traversal) and AST-indexed semantic search. The scan identifies all modules, their quality profiles, dependency relationships, and recent change patterns. Output: a comprehensive codebase map.

**Phase 2 -- ANALYZE**: Each module is analyzed across 13 quality domains. The analysis identifies quality gaps, improvement opportunities, and areas where patterns from the library could be applied. Historical analysis from previous generations provides trend context.

**Phase 3 -- MUTATE**: Based on analysis results, the engine generates candidate mutations. Mutations include code quality improvements (warning elimination, spec addition), architectural refinements (module extraction, dependency cleanup), and pattern applications (OTP patterns, error handling patterns). The mutation strategy is itself evolved through self-recursive evolution.

**Phase 4 -- SELECT**: Candidate mutations are evaluated using the multi-dimensional fitness function. Mutations that improve fitness across quality domains are selected. Mutations that improve one domain at the expense of another are evaluated for net benefit. The selection strategy uses a Pareto front approach for multi-objective optimization.

**Phase 5 -- VALIDATE**: Selected mutations are validated through the full quality gate pipeline: zero-warning compilation, complete test execution, Credo static analysis, and Dialyzer type checking. Only mutations that pass all gates are accepted into the new generation.

## Usage

### Standard Evolution

```bash
# Run full evolution cycle
/evolve

# Run evolution with verbose output
/evolve --verbose

# Run evolution targeting specific quality domains
/evolve --domains=dialyzer,compilation,credo
```

### Scoped Evolution

```bash
# Evolve a specific application
/evolve --app=prismatic_perimeter

# Evolve a specific domain type
/evolve --scope=storage --apps="prismatic_storage_*"

# Evolve with focus on a single quality domain
/evolve --focus=typespec-coverage
```

### Evolution Management

```bash
# Check evolution status and current generation
/evolve --status

# Show evolution history across generations
/evolve --history --generations=5

# Compare current generation with previous
/evolve --compare --gen=17

# Generate comprehensive evolution report
/evolve --report --format=markdown --verbose
```

### Self-Recursive Evolution

```bash
# Evolve the evolution system itself
/evolve --self-recursive

# Evolve mutation strategies
/evolve --evolve-strategies

# Evolve fitness functions
/evolve --evolve-fitness
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--verbose` | flag | false | Include detailed phase-by-phase output |
| `--domains` | string | all | Comma-separated quality domains to target |
| `--app` | string | all | Specific umbrella application to evolve |
| `--scope` | string | all | Domain scope for evolution (storage, web, agents, etc.) |
| `--apps` | string | all | Glob pattern for application selection |
| `--focus` | string | balanced | Single quality domain to prioritize |
| `--status` | flag | false | Show current evolution status |
| `--history` | flag | false | Display generation history |
| `--generations` | integer | 5 | Number of generations for history display |
| `--compare` | flag | false | Compare with a previous generation |
| `--gen` | integer | previous | Generation number for comparison |
| `--report` | flag | false | Generate comprehensive evolution report |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--self-recursive` | flag | false | Enable self-recursive evolution |
| `--evolve-strategies` | flag | false | Evolve mutation strategies |
| `--evolve-fitness` | flag | false | Evolve fitness functions |
| `--dry-run` | flag | false | Simulate evolution without applying changes |
| `--max-mutations` | integer | 100 | Maximum mutations per evolution cycle |
| `--gitlab-sync` | flag | true | Sync evolution results to GitLab observability |

## Execution Flow

The `/evolve` command follows the canonical 5-phase evolution cycle, wrapped in observability infrastructure:

1. **Initialization**: The evolution orchestrator loads the current generation state from [Quality DNA](/glossary/quality-dna/), initializes telemetry instrumentation, and optionally syncs with GitLab for observability. The previous generation's fitness scores serve as the baseline.

2. **Scan Phase**: The codebase is surveyed using git trees and AST indexing. All 100+ umbrella applications are catalogued with their module counts, quality profiles, and dependency graphs. The scan typically completes in under 500ms for the full 37,000-file codebase.

3. **Analysis Phase**: Each module is scored across 13 quality domains. The analysis identifies specific improvement opportunities and ranks them by expected fitness impact. Cross-application analysis detects pattern opportunities visible only at the ecosystem level.

4. **Mutation Phase**: Candidate mutations are generated based on analysis results. The mutation generator draws from the platform's 55+ pattern library, quality improvement strategies, and architectural refinement heuristics. Each mutation is annotated with its expected fitness impact.

5. **Selection Phase**: Candidates are evaluated using the multi-dimensional fitness function. Pareto-optimal mutations (improvements that do not degrade any domain) are preferred. Trade-off mutations are evaluated against configurable domain priority weights.

6. **Validation Phase**: Selected mutations pass through the full quality gate pipeline. This is the most computationally expensive phase, potentially involving full compilation and test execution for each mutation batch.

7. **Persistence**: Validated mutations are committed and the new generation state is persisted to Quality DNA. GitLab observability is updated with the generation's fitness improvement delta.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Quality DNA](/glossary/quality-dna/) | Persistence | Generation state, fitness history |
| [Quality Gates](/glossary/quality-gates/) | Validation | Mutation validation pipeline |
| [Git Trees](/glossary/git-trees/) | Scanning | Codebase survey (~100x faster) |
| [SEADF](/glossary/seadf/) | Framework | Self-evolving framework integration |
| [Mycelial Network](/glossary/mycelial-network/) | Distribution | Pattern propagation for evolved mutations |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | 434 agents participating in evolution |
| [Telemetry](/glossary/telemetry/) | Monitoring | Evolution [metrics](/glossary/metrics/) and phase timing |
| GitLab API | Observability | Generation tracking, milestone updates |
| [GARDEN](/glossary/garden/) | Knowledge | 116 repositories of legacy patterns |
| AIAD Registry | Discovery | Command and agent specifications |

## Best Practices

**Run evolution at session boundaries**: The mandatory session lifecycle protocol includes evolution triggers at session start and end. Adhere to this protocol to ensure continuous evolutionary pressure.

**Monitor fitness across all 13 domains**: A fitness improvement in one domain at the expense of another is not genuine progress. Use the `--domains` view to verify balanced improvement across all quality dimensions.

**Use self-recursive evolution sparingly**: Self-recursive evolution modifies the evolution system itself. While powerful, it should be applied with care and validated through multiple cycles before accepting changes.

**Sync with GitLab for team visibility**: The `--gitlab-sync` flag (on by default) publishes evolution results to GitLab, providing team-wide visibility into the platform's evolutionary trajectory.

**Evolve incrementally for stability**: Large mutations are more likely to introduce subtle regressions. Prefer many small mutations per cycle over few large ones. The `--max-mutations` parameter controls this balance.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `EVOLUTION_CYCLE_REGRESSION` | New generation has lower fitness than previous | Rollback to previous generation; investigate regression cause |
| `SCAN_PHASE_TIMEOUT` | Codebase survey exceeded time limit | Use scoped evolution with `--app` or `--scope` |
| `MUTATION_VALIDATION_FAILED` | Selected mutations fail quality gates | Review mutation strategy; increase validation stringency |
| `QUALITY_DNA_CORRUPTION` | Generation state file corrupted | Rebuild from last known good state |
| `GITLAB_SYNC_FAILED` | Cannot push evolution results to GitLab | Check GitLab token and connectivity; results persisted locally |
| `SELF_RECURSIVE_INSTABILITY` | Self-evolved components produce unstable behavior | Rollback self-recursive changes; increase validation depth |

## Advanced Usage

### Multi-Objective Evolution

```bash
# Configure custom fitness weights for multi-objective optimization
/evolve --fitness-weights="compilation:2.0,testing:1.5,typespec:1.0"

# Evolve with Pareto-front visualization
/evolve --pareto --visualize --format=html
```

### Generation Archaeology

```bash
# Deep analysis of a specific generation's improvements
/evolve --archaeology --gen=12 --verbose

# Trace the evolutionary lineage of a specific module
/evolve --lineage --module=PrismaticPerimeter.SecurityRating
```

### Evolution Benchmarking

```bash
# Benchmark evolution cycle performance
/evolve --benchmark --iterations=3 --report

# Profile phase timing for optimization
/evolve --profile --format=json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Evolution is mandatory and relentless. Every session contributes to generational improvement. Fitness regressions are treated as failures requiring immediate correction. No generation is accepted unless it meets or exceeds the fitness of the previous generation.
- **NO DOUBTS**: Every evolution decision is evidence-based. Fitness improvements are measured across 13 domains with quantified metrics. Mutations are validated through comprehensive quality gates. The evolution system never guesses -- it measures, evaluates, and selects based on empirical data.

The SUPREME + SELF-RECURSIVE authority level represents the platform's deepest commitment to continuous improvement: the system does not merely improve the code, it improves its own ability to improve the code.

## Related Commands

- [/evolve-enforced](/commands/evolve-enforced/) - Evolution with mandatory QDP reduction
- [/evolve-mycelialize](/commands/evolve-mycelialize/) - Unified evolution-propagation cycles
- [/evolve-patterns](/commands/evolve-patterns/) - Pattern evolution through meta-evolution analysis
- [/evolve-quality-gates](/commands/evolve-quality-gates/) - Quality gate evolution for warnings, tests and static analysis
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for mathematically proven pattern propagation
- [/mycelialize-living](/commands/mycelialize-living/) - Living self-evolving intelligence with introspection, AST manipulation and agent swarms
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/evo-stats](/commands/evo-stats/) - Evolution statistics and metrics reporting

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)