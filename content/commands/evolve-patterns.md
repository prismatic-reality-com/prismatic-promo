+++
title = "/evolve-patterns"
weight = 530
[extra]
category = "Evolution"
description = "Pattern evolution through meta-evolution analysis"
syntax = "/evolve-patterns [options]"
authority = "L3"
agent = "evolution-orchestrator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1271
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evolve-patterns", "Pattern", "commands", "Evolution", "Prismatic Platform", "Meta", "GARDEN"]
tags = ["commands", "evolution", "evolve-patterns", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evolve-patterns - Prismatic Platform"
+++

## Overview

**/evolve-patterns** is a production command in the **Evolution** category of the Prismatic Platform. It performs pattern evolution through meta-evolution analysis -- the process of evolving the patterns themselves rather than the code they describe. While standard evolution ([/evolve](/commands/evolve/)) improves the codebase through mutations, `/evolve-patterns` operates at a higher abstraction level, improving the mutation strategies, pattern libraries, and evolutionary heuristics that drive the entire evolution system.

Meta-evolution is a concept from evolutionary computation: the parameters of an evolutionary algorithm are themselves subject to evolution. In the Prismatic Platform, this means that the patterns used for code improvement, the fitness functions used for evaluation, and the selection strategies used for mutation retention are all treated as evolvable artifacts. The `/evolve-patterns` command drives this meta-evolutionary process, continuously refining the platform's capacity for self-improvement.

The platform maintains a library of 55+ patterns sourced from 20+ years of development history across 116 [GARDEN](/glossary/garden/) repositories. These patterns range from low-level code idioms (OTP supervision tree structures, GenServer callback patterns) to high-level architectural patterns (hexagonal architecture boundaries, event-driven communication). The `/evolve-patterns` command analyzes the effectiveness of each pattern, identifies patterns that are underperforming or redundant, discovers new pattern candidates from recent code changes, and retires patterns that no longer contribute to fitness improvement.

This command operates under the **L3** authority level and is executed by the `evolution-orchestrator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The pattern evolution system operates as a meta-layer above the standard evolution engine:

```
Pattern Library --> Effectiveness Analyzer --> Meta-Evolution Engine --> Updated Patterns
      |                     |                        |                       |
 55+ Patterns         Application History      Genetic Operations       New Library
      |                     |                        |                       |
 Pattern Specs        Success/Fail Data       Mutation/Crossover        Validated
      \                     |                  Selection/Retirement          /
       --> Pattern Fitness Evaluator --> Meta-Selection --> Validation Gate
                     |
              GARDEN Knowledge Base
              (116 repos, 20+ years)
```

**Effectiveness Analyzer**: Evaluates each pattern's historical effectiveness by analyzing its application history. Metrics include: how many applications successfully adopted the pattern, the quality improvement per application, the compilation success rate, and the test pass rate after pattern application.

**Meta-Evolution Engine**: Applies evolutionary operations to the pattern library itself. Mutation modifies pattern parameters and applicability criteria. Crossover combines elements from related patterns to create novel hybrids. Selection retains high-fitness patterns. Retirement removes patterns with consistently low effectiveness scores.

**Pattern Fitness Evaluator**: Computes a multi-dimensional fitness score for each pattern based on adoption rate, quality impact, applicability breadth, and maintenance cost. Patterns that require frequent manual adjustment after application receive fitness penalties.

**GARDEN Knowledge Base**: The 116-repository [GARDEN](/glossary/garden/) legacy knowledge system provides historical context for pattern evolution, including patterns that succeeded or failed in past projects spanning two decades.

## Usage

### Standard Pattern Evolution

```bash
# Run meta-evolution cycle on pattern library
/evolve-patterns

# Analyze pattern effectiveness without modifying library
/evolve-patterns --analyze-only

# Evolve patterns for a specific domain
/evolve-patterns --domain=supervision
```

### Pattern Discovery

```bash
# Discover new patterns from recent code changes
/evolve-patterns --discover --since=7d

# Discover patterns from GARDEN repositories
/evolve-patterns --discover --source=garden --repos="sig,prismatic-legacy"

# Identify pattern candidates from high-quality modules
/evolve-patterns --mine --quality-threshold=95
```

### Pattern Management

```bash
# Show pattern library status
/evolve-patterns --status

# List patterns by fitness score
/evolve-patterns --list --sort=fitness --format=table

# Show patterns pending retirement
/evolve-patterns --pending-retirement

# Generate pattern evolution report
/evolve-patterns --report --verbose --format=markdown
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--analyze-only` | flag | false | Analyze pattern effectiveness without modifications |
| `--domain` | string | all | Focus on specific pattern domain |
| `--discover` | flag | false | Enable new pattern discovery mode |
| `--since` | string | 30d | Time window for pattern discovery from changes |
| `--source` | string | current | Discovery source (current, garden, all) |
| `--repos` | string | all | Specific GARDEN repositories for discovery |
| `--mine` | flag | false | Mine patterns from high-quality existing code |
| `--quality-threshold` | integer | 90 | Minimum quality score for pattern mining source |
| `--status` | flag | false | Display pattern library status overview |
| `--list` | flag | false | List all patterns with metadata |
| `--sort` | string | name | Sort order for listing (name, fitness, domain, age) |
| `--pending-retirement` | flag | false | Show patterns below retirement threshold |
| `--report` | flag | false | Generate pattern evolution report |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--verbose` | flag | false | Include detailed metrics per pattern |
| `--crossover-rate` | float | 0.3 | Rate of pattern crossover in meta-evolution |
| `--mutation-rate` | float | 0.1 | Rate of pattern mutation in meta-evolution |

## Execution Flow

The `/evolve-patterns` command follows a structured 6-phase meta-evolutionary pipeline:

1. **Pattern Census**: The current pattern library is enumerated with full metadata: applicability criteria, historical effectiveness scores, dependency requirements, and last-evolution timestamps.

2. **Effectiveness Analysis**: Each pattern's application history is analyzed to compute effectiveness metrics. The analyzer examines every instance where the pattern was applied (successfully or not) across all umbrella applications and calculates aggregate success rates, quality impact distributions, and failure mode classifications.

3. **Meta-Fitness Evaluation**: Effectiveness metrics are synthesized into a multi-dimensional fitness score per pattern. The fitness function considers adoption breadth (how many applications use the pattern), depth (how much quality improvement it produces), reliability (success rate across diverse contexts), and maintenance cost (how often applications need post-application adjustment).

4. **Meta-Evolution Cycle**: Genetic operations are applied to the pattern library. High-fitness patterns are retained unchanged. Medium-fitness patterns undergo mutation (parameter adjustment, applicability criteria refinement). Low-fitness patterns are candidates for crossover (combining with related patterns) or retirement.

5. **Validation**: Modified and newly created patterns are validated through simulation. Each candidate pattern is tested against a representative sample of applications to verify that it produces positive quality impact without introducing regressions.

6. **Library Update**: Validated patterns are committed to the pattern library. Retired patterns are archived with their historical effectiveness data. The updated library is persisted through [Quality DNA](/glossary/quality-dna/) for cross-session continuity.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Evolution Engine](/glossary/autoevolve/) | Consumer | Standard evolution consumes patterns from the library |
| [Mycelial Network](/glossary/mycelial-network/) | Distribution | Evolved patterns propagate via mycelial network |
| [GARDEN](/glossary/garden/) | Knowledge Source | Legacy patterns from 116 repositories |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Pattern library state and fitness history |
| [Quality Gates](/glossary/quality-gates/) | Validation | Pattern validation against quality standards |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Evolution-orchestrator drives meta-evolution |
| [Telemetry](/glossary/telemetry/) | Monitoring | Pattern effectiveness [metrics](/glossary/metrics/) |
| AIAD Registry | Discovery | Command specification and pattern indexing |

## Best Practices

**Evolve patterns incrementally**: Meta-evolution should produce gradual refinements, not revolutionary changes. High mutation and crossover rates can destabilize the pattern library. Use the default rates (0.1 mutation, 0.3 crossover) unless specific experimentation is needed.

**Analyze before evolving**: Always run `--analyze-only` first to understand current pattern effectiveness. This prevents blind evolution cycles that might retire useful patterns or mutate well-performing ones.

**Mine from high-quality code**: The `--mine` mode discovers new patterns by analyzing code that scores highly on quality metrics. Focus mining on modules with 95+ quality scores for the highest-fidelity pattern extraction.

**Leverage GARDEN for diversity**: The GARDEN knowledge base contains patterns from diverse technology eras and project contexts. Use `--source=garden` to inject diversity into the pattern library and prevent convergence on a narrow set of solutions.

**Monitor retirement candidates**: Patterns pending retirement may be underperforming due to changed circumstances rather than inherent weakness. Review `--pending-retirement` output manually before allowing meta-evolution to retire patterns.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `PATTERN_VALIDATION_FAILED` | Evolved pattern fails quality gates in test applications | Refine pattern applicability criteria or roll back mutation |
| `GARDEN_REPOSITORY_UNAVAILABLE` | GARDEN repository not accessible for discovery | Verify GARDEN configuration and repository access |
| `META_FITNESS_COMPUTATION_ERROR` | Insufficient application history for fitness calculation | Accumulate more pattern application data before meta-evolution |
| `CROSSOVER_INCOMPATIBLE` | Selected patterns too dissimilar for meaningful crossover | Restrict crossover to patterns within the same domain |
| `PATTERN_LIBRARY_LOCKED` | Another evolution cycle has exclusive lock on pattern library | Wait for concurrent cycle to complete |

## Advanced Usage

### Pattern Genealogy

```bash
# Trace the evolution history of a specific pattern
/evolve-patterns --genealogy --pattern="supervision-tree-standard"

# Visualize pattern family tree
/evolve-patterns --genealogy --format=mermaid --all-domains
```

### Pattern Impact Forecasting

```bash
# Predict the impact of evolving a specific pattern
/evolve-patterns --forecast --pattern="genserver-callback" --target-apps=10

# Simulate a full meta-evolution cycle without applying changes
/evolve-patterns --simulate --iterations=5 --verbose
```

### Integration with Formal Verification

Evolved patterns can optionally be verified through the [/mycelialize-formal](/commands/mycelialize-formal/) pipeline, ensuring that meta-evolved patterns maintain formal correctness properties through [Lean4](/glossary/lean4/) proof construction.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for ineffective patterns in the library. Patterns that consistently fail to produce quality improvements are retired without sentiment. The meta-evolution system operates on empirical effectiveness, not historical attachment.
- **NO DOUBTS**: Full investigation through comprehensive effectiveness analysis before any pattern modification. Every meta-evolution decision is backed by application history data spanning the entire umbrella ecosystem.

Pattern evolution embodies the platform's commitment to continuous improvement at every abstraction level -- not just improving the code, but improving the tools and strategies used to improve the code.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/evolve-enforced](/commands/evolve-enforced/) - Evolution with mandatory QDP reduction
- [/evolve-mycelialize](/commands/evolve-mycelialize/) - Unified evolution-propagation cycles
- [/evolve-quality-gates](/commands/evolve-quality-gates/) - Quality gate evolution for warnings, tests and static analysis
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](/commands/mycelialize-formal/) - [Lean4](/glossary/lean4/) + Prolog [formal verification](/glossary/formal-verification/) for mathematically proven pattern propagation
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)