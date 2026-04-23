+++
title = "/genetic-evolve"
weight = 470
[extra]
category = "Evolution"
description = "Genetic evolution targeting spec-coverage, test-coverage and documentation"
syntax = "/genetic-evolve [options]"
authority = "L3"
agent = "evolution-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1174
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["genetic-evolve", "Genetic", "commands", "Evolution", "Prismatic Platform", "Generate", "Credo", "Fitness"]
tags = ["commands", "evolution", "genetic-evolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/genetic-evolve - Prismatic Platform"
+++

## Overview

**/genetic-evolve** is a production command in the **Evolution** category of the Prismatic Platform that applies genetic algorithm principles to systematically improve platform quality across three critical dimensions: type specification coverage (`@spec`), test coverage, and documentation completeness (`@doc`/`@moduledoc`). Rather than relying on manual identification of improvement targets, this command treats quality improvement as an optimization problem and applies evolutionary strategies to converge on maximum coverage across the entire codebase.

The command operates under the **L3** authority level and is executed by the `evolution-orchestrator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level grants the evolution-orchestrator the ability to create and modify files across the platform, subject to quality gate validation before any changes are committed.

The genetic evolution metaphor is implemented literally: quality improvements are treated as a population of candidate changes, each evaluated for fitness against the platform's quality metrics. The fittest candidates -- those that improve coverage metrics without introducing regressions -- survive and are applied, while ineffective candidates are discarded. Over successive generations, this process converges on optimal coverage across all three dimensions.

The platform's current quality score of 100/100 with zero violations across 13 quality domains is the direct result of sustained genetic evolution across 18 generations. The `/genetic-evolve` command is the operational tool that drove this improvement, starting from Gen 1's initial quality baseline and progressively eliminating quality debt through targeted, measured evolution cycles.

## Architecture

The genetic evolution engine implements a classic evolutionary algorithm adapted for software quality optimization.

```
Population Init --> Fitness Evaluation --> Selection --> Mutation --> Quality Gate --> Integration
       |                  |                   |            |              |               |
  Candidate           Metric              Tournament    Generate      Compile +       Apply to
  Improvements        Collection          Selection     Variants      Test + Credo     Codebase
       |                  |                                               |
  Seed from          @spec coverage                                 Pass/Fail
  Quality Scans      Test coverage                                  Filter
                     Doc coverage
```

### Evolutionary Components

| Component | Role | Implementation |
|-----------|------|---------------|
| **Population** | Candidate improvements | List of `{file, improvement_type, proposed_change}` tuples |
| **Fitness Function** | Quality measurement | Composite score: spec_coverage * 0.4 + test_coverage * 0.35 + doc_coverage * 0.25 |
| **Selection** | Choose best candidates | Tournament selection (k=3) with elitism (top 10% always survive) |
| **Mutation** | Generate variants | Random parameter variation within type-safe bounds |
| **Crossover** | Combine strategies | Merge successful patterns from different quality dimensions |
| **Quality Gate** | Validation | Full compilation + Credo + Dialyzer must pass |

### Fitness Dimensions

| Dimension | Weight | Metric | Current Platform Score |
|-----------|--------|--------|----------------------|
| **Spec Coverage** | 40% | Percentage of public functions with `@spec` | 100% (709 @impl) |
| **Test Coverage** | 35% | Line coverage from `mix test --cover` | 100% across quality domains |
| **Doc Coverage** | 25% | Percentage of public functions with `@doc`/`@moduledoc` | 100% (11,308 docs) |

## Usage

### Basic Usage

```bash
# Run a single generation of genetic evolution
/genetic-evolve

# Target a specific quality dimension
/genetic-evolve --target spec-coverage

# Target a specific umbrella application
/genetic-evolve --app prismatic_perimeter

# Run multiple generations
/genetic-evolve --generations 5
```

### Targeted Evolution

```bash
# Focus on test coverage for a specific app
/genetic-evolve --target test-coverage --app prismatic_web

# Focus on documentation completeness
/genetic-evolve --target documentation --min-fitness 0.95

# Evolve only modules below a coverage threshold
/genetic-evolve --target spec-coverage --below-threshold 80

# Evolve with specific population size
/genetic-evolve --population 50 --generations 3
```

### Advanced Evolution

```bash
# Multi-objective evolution across all dimensions
/genetic-evolve --target all --generations 10 --report

# Evolution with custom fitness weights
/genetic-evolve --weight-spec 0.5 --weight-test 0.3 --weight-doc 0.2

# Dry-run evolution showing proposed changes
/genetic-evolve --dry-run --target spec-coverage --app prismatic_api

# Export evolution history as JSON
/genetic-evolve --history --format json --output evolution-report.json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | string | all | Evolution target: spec-coverage, test-coverage, documentation, all |
| `--app` | string | all | Target specific umbrella application |
| `--generations` | integer | 1 | Number of evolution generations to run |
| `--population` | integer | 30 | Population size per generation |
| `--min-fitness` | float | 0.80 | Minimum fitness threshold for candidate survival |
| `--below-threshold` | integer | 100 | Only evolve modules below this coverage percentage |
| `--weight-spec` | float | 0.40 | Fitness weight for spec coverage |
| `--weight-test` | float | 0.35 | Fitness weight for test coverage |
| `--weight-doc` | float | 0.25 | Fitness weight for documentation coverage |
| `--dry-run` | boolean | false | Show proposed changes without applying them |
| `--report` | boolean | false | Generate evolution report after completion |
| `--history` | boolean | false | Show evolution history across past sessions |
| `--format` | string | table | Output format: table, json, markdown |
| `--output` | string | stdout | Write results to file |
| `--verbose` | boolean | false | Show detailed evolution steps |

## Execution Flow

1. **Baseline Measurement**: Measure current fitness across all three dimensions for the target scope. This establishes the starting point for evolution.

2. **Population Seeding**: Generate the initial population of candidate improvements. Candidates are seeded from quality scan results, missing spec/doc analysis, and untested module detection.

3. **Fitness Evaluation**: Evaluate each candidate's fitness by simulating the improvement and measuring the resulting coverage delta.

4. **Selection**: Apply tournament selection to choose the fittest candidates for reproduction. The top 10% (elites) are always preserved.

5. **Mutation & Crossover**: Generate new candidate variants through parameter mutation and strategy crossover. This introduces diversity into the population.

6. **Quality Gate Validation**: Apply each selected candidate and validate through the full quality gate pipeline: `mix compile --warnings-as-errors`, `mix credo --strict`, and `mix test`.

7. **Integration**: Candidates that pass all quality gates are integrated into the codebase. Failed candidates are discarded with their failure reasons logged.

8. **Generation Report**: Summarize the generation's results: fitness improvement, candidates applied, candidates rejected, and current coverage levels.

9. **Iteration**: If `--generations > 1`, repeat from step 2 with the improved codebase as the new baseline.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `evolution-orchestrator` agent |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Every evolved change must pass quality gates |
| [Credo](@/glossary/credo.md) | Static Analysis | Evolved code must pass Credo strict mode |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Evolution metrics tracked as telemetry events |
| [Quality DNA](@/glossary/quality-dna.md) | History | Evolution history persisted in quality DNA |
| [SEADF](@/glossary/seadf.md) | Framework | Genetic evolution is a component of the SEADF pipeline |
| [/evolve](@/commands/evolve.md) | Parent | Part of the broader evolution command family |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Quality gates validate evolution outputs |

## Best Practices

**Target one dimension at a time for focused improvement.** While `--target all` provides multi-objective optimization, targeting a single dimension (spec-coverage, test-coverage, or documentation) produces more predictable and verifiable results per generation.

**Use small populations for initial exploration.** Start with `--population 10 --generations 1` to understand what the evolution engine proposes before running larger campaigns. This is especially important when evolving unfamiliar applications.

**Run evolution as part of session discipline.** The platform's Universal Autonomous Evolution Protocol mandates evolution activity in every session. Use `/genetic-evolve --generations 1 --target all` as a lightweight evolution step that satisfies this requirement.

**Monitor fitness convergence.** Over successive generations, fitness should increase monotonically. If fitness plateaus, the remaining improvements may require manual intervention (complex architectural changes that the evolution engine cannot generate automatically).

**Preserve evolution history for analysis.** Use `--report --format json` to persist evolution results. Historical fitness trajectories reveal the platform's quality improvement velocity and identify areas where evolution has been most effective.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :no_candidates}` | No improvement candidates found for the target scope | The target scope may already be at 100% coverage; verify with quality gates |
| `{:error, :quality_gate_failed}` | All candidates failed quality validation | Review candidate proposals with `--dry-run`; some improvements may need manual refinement |
| `{:error, :fitness_regression}` | Evolution produced a fitness decrease | This should not happen with proper quality gating; investigate the fitness function |
| `{:error, :compilation_failed}` | Generated code does not compile | Check for dependency issues; the evolution engine may need updated module context |
| `{:error, :test_failure}` | Generated tests or existing tests fail | Review the failing test; the evolution may have exposed a pre-existing bug |

## Advanced Usage

### Custom Fitness Functions

Define project-specific fitness criteria:

```elixir
# Custom fitness function for security-critical code
fitness = fn module ->
  spec_score = PrismaticQuality.spec_coverage(module) * 0.50
  test_score = PrismaticQuality.test_coverage(module) * 0.30
  guard_score = PrismaticQuality.guard_clause_coverage(module) * 0.20
  spec_score + test_score + guard_score
end
```

### Evolution Pipeline Integration

Chain evolution with other platform commands:

```bash
# Evolve, verify, and commit in a single workflow
/genetic-evolve --target spec-coverage --app prismatic_api && \
  mix compile --warnings-as-errors && \
  mix test apps/prismatic_api/ && \
  /commit "evolution: improve spec coverage for prismatic_api"
```

### Cross-Generation Analysis

```bash
# Compare fitness across multiple sessions
/genetic-evolve --history --format json | \
  jq '[.generations[] | {gen: .number, fitness: .final_fitness}]'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every evolved change must pass the full quality gate pipeline. No partial improvements, no TODO placeholders, no quality regressions.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Fitness measurements provide quantitative evidence for every evolution decision. No changes are applied based on heuristic guesses.

The genetic evolution process is a direct implementation of the platform's Generation 1 through 18 evolution trajectory, which achieved 0.999 apex fitness through sustained, measured, evidence-based improvement -- the epitome of NO MERCY, NO DOUBTS in practice.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/mycelialize-formal](@/commands/mycelialize-formal.md) - [Lean4](@/glossary/lean4.md) + Prolog [formal verification](@/glossary/formal-verification.md) for mathematically proven pattern propagation
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)