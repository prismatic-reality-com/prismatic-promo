+++
title = "/gardener"
weight = 1300
[extra]
category = "Infrastructure"
description = "GARDEN legacy knowledge repository management across 116 repos"
syntax = "/gardener [options]"
authority = "L2+"
agent = "garden-cultivator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1073
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gardener", "GARDEN", "commands", "Infrastructure", "Prismatic Platform", "Include"]
tags = ["commands", "infrastructure", "gardener", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gardener - Prismatic Platform"
+++

## Overview

**/gardener** is the top-level production command in the **Infrastructure** category of the Prismatic Platform for managing the [GARDEN](@/glossary/garden.md) (Growing Archive of Reusable Development and Engineering Nuggets) legacy knowledge repository ecosystem. The GARDEN is a curated collection of 116 Git repositories spanning over 20 years of software engineering practice, containing 3,050+ files, 55+ documented patterns, and implementations across Elixir, Python, JavaScript, Rust, Go, and Ruby. The `/gardener` command provides centralized management, health monitoring, and orchestration for this entire ecosystem.

The command operates under the **L2+** authority level and is executed by the `garden-cultivator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The garden-cultivator agent serves as the steward of the GARDEN ecosystem, maintaining repository health, managing tier classifications, coordinating synchronization schedules, and tracking pattern extraction history.

The `/gardener` command is the parent command for the GARDEN command family: [/garden-explore](@/commands/garden-explore.md), [/garden-extract](@/commands/garden-extract.md), [/garden-search](@/commands/garden-search.md), and [/garden-sync](@/commands/garden-sync.md). While each child command handles a specific aspect of GARDEN interaction, `/gardener` provides the overarching management layer -- status monitoring, health reporting, tier management, and ecosystem-wide operations that span multiple child commands.

The philosophical foundation of the GARDEN is that no software knowledge should be discarded. Even repositories that are decades old may contain patterns, algorithms, or architectural insights that are relevant to current platform development. The gardener's role is to cultivate this archive, ensuring that knowledge remains accessible and extractable despite the inevitable passage of time and technology evolution.

## Architecture

The `/gardener` command operates as the central management hub for the GARDEN ecosystem, coordinating sub-commands and maintaining ecosystem-wide state.

```
/gardener --> Status Monitor --> Health Reporter --> Tier Manager --> Sub-Command Orchestrator
                  |                   |                  |                    |
             Repository          Quality            Classification       /garden-explore
             Health Checks       Assessment         Maintenance          /garden-extract
                                                                         /garden-search
                                                                         /garden-sync
```

### Management Components

| Component | Responsibility |
|-----------|---------------|
| **Status Monitor** | Tracks sync status, health, and activity across all 116 repositories |
| **Health Reporter** | Generates ecosystem health reports with tier breakdowns |
| **Tier Manager** | Manages repository tier classifications (T1-T5) |
| **Pattern Registry** | Tracks all known patterns and their extraction history |
| **Sub-Command Orchestrator** | Coordinates multi-step GARDEN operations |

### Repository Tier System

| Tier | Criteria | Count | Management Policy |
|------|----------|-------|-------------------|
| **T1 Production** | Active, production-quality, regularly maintained | 5 | Daily sync, continuous monitoring |
| **T2 Active** | Under active development, good quality | 8 | Daily sync, weekly health check |
| **T3 Libraries** | Stable utilities, minimal changes expected | 15 | Weekly sync, monthly health check |
| **T4 Archive** | Historical, read-only, extractable value | 70+ | Monthly sync, quarterly review |
| **T5 R&D** | Experimental, research, may be incomplete | 18 | On-demand sync, annual review |

## Usage

### Basic Usage

```bash
# Show GARDEN ecosystem status
/gardener status

# Show detailed status with health metrics
/gardener status --verbose

# Show repository listing with tier classification
/gardener list

# Show GARDEN statistics
/gardener stats
```

### Management Operations

```bash
# Run health check across all repositories
/gardener health

# Reclassify a repository to a different tier
/gardener classify kuzu-ex --tier t2

# Mark a repository as deprecated
/gardener deprecate old-project --reason "Superseded by prismatic-agents"

# Add a new repository to GARDEN
/gardener add https://github.com/user/new-repo.git --tier t3
```

### Orchestrated Operations

```bash
# Full GARDEN maintenance cycle
/gardener cultivate

# Sync, explore, and report in one operation
/gardener cultivate --sync --explore --report

# Generate a comprehensive GARDEN health report
/gardener report --format markdown --output .claude/reports/garden-health.md

# Run pattern inventory across all repositories
/gardener inventory --patterns
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `SUBCOMMAND` | string | status | Operation: status, list, stats, health, classify, deprecate, add, cultivate, report, inventory |
| `--verbose` | boolean | false | Include detailed information in output |
| `--tier` | string | all | Filter operations by tier: t1, t2, t3, t4, t5 |
| `--format` | string | table | Output format: table, json, markdown |
| `--output` | string | stdout | Write output to file |
| `--sync` | boolean | false | Include synchronization in cultivate operations |
| `--explore` | boolean | false | Include exploration in cultivate operations |
| `--report` | boolean | false | Generate report after operations |
| `--patterns` | boolean | false | Include pattern information in inventory |
| `--reason` | string | none | Reason for deprecation or reclassification |

## Execution Flow

### Status Operation

1. **Repository Enumeration**: List all 116 GARDEN submodules from `.gitmodules`.
2. **Health Aggregation**: Collect health status (sync freshness, integrity, pattern count) for each repository.
3. **Tier Summary**: Aggregate statistics by tier: repository counts, total files, total patterns, average freshness.
4. **Display**: Render the status dashboard with tier breakdown and health indicators.

### Cultivate Operation

1. **Pre-Assessment**: Run a quick health check to identify repositories needing attention.
2. **Synchronization**: If `--sync` is specified, execute [/garden-sync](@/commands/garden-sync.md) with appropriate tier-based strategies.
3. **Index Rebuild**: Rebuild the GARDEN search index and knowledge graph.
4. **Pattern Inventory**: Scan for new or modified patterns across all repositories.
5. **Health Validation**: Run a comprehensive health check post-cultivation.
6. **Reporting**: If `--report` is specified, generate a detailed cultivation report.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `garden-cultivator` agent |
| [/garden-explore](@/commands/garden-explore.md) | Sub-command | Structured exploration of GARDEN repositories |
| [/garden-extract](@/commands/garden-extract.md) | Sub-command | Pattern extraction from GARDEN repositories |
| [/garden-search](@/commands/garden-search.md) | Sub-command | Text search across GARDEN repositories |
| [/garden-sync](@/commands/garden-sync.md) | Sub-command | Submodule synchronization |
| [KuzuDB](@/glossary/kuzudb.md) | Storage | Knowledge graph for repository relationships |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Ecosystem health and operation metrics |
| [SEADF](@/glossary/seadf.md) | Evolution | GARDEN health feeds into platform evolution metrics |

## Best Practices

**Run `/gardener cultivate` weekly.** A weekly cultivation cycle ensures that the GARDEN ecosystem remains healthy and that new patterns are indexed. This is especially important for T1 and T2 repositories that are actively maintained.

**Review tier classifications quarterly.** Repository activity patterns change over time. A T2 repository that has not been updated in six months may warrant reclassification to T3 or T4. Conversely, a T4 repository that becomes relevant to a new platform initiative may deserve promotion to T2.

**Use health reports for planning.** The `/gardener health` output identifies repositories that need attention -- stale submodules, corrupted checkouts, or missing patterns. Address these findings as part of regular maintenance.

**Deprecate rather than delete.** When a repository is no longer useful, use `/gardener deprecate` rather than removing it from the ecosystem. Deprecated repositories remain searchable and extractable but are excluded from routine sync and cultivation operations.

**Track pattern extraction history.** The pattern registry maintained by `/gardener` records which patterns have been extracted, when, and into which platform applications. This history prevents redundant extraction and provides traceability for platform evolution.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :submodule_corrupted}` | One or more submodules have corrupted Git state | Run `git submodule update --init --force garden/REPO_NAME` |
| `{:error, :tier_invalid}` | Specified tier is not in the valid range (t1-t5) | Use a valid tier: t1, t2, t3, t4, or t5 |
| `{:error, :repo_already_exists}` | Attempting to add a repository that already exists | Use `--force` to re-add or choose a different name |
| `{:error, :cultivate_failed}` | One or more cultivation steps failed | Use `--verbose` to identify the failing step; address individually |
| `{:error, :index_build_failed}` | Knowledge graph or search index build failed | Check KuzuDB connectivity; rebuild manually with `--rebuild-index` |

## Advanced Usage

### Ecosystem Analytics

```bash
# Generate comprehensive ecosystem analytics
/gardener stats --format json | jq '{
  total_repos: .repos | length,
  total_files: [.repos[].file_count] | add,
  total_patterns: [.repos[].pattern_count] | add,
  tier_distribution: .repos | group_by(.tier) | map({tier: .[0].tier, count: length})
}'

# Identify the most pattern-rich repositories
/gardener inventory --patterns --format json | jq 'sort_by(-.pattern_count) | .[0:10]'
```

### Automated Maintenance Pipeline

```bash
# Full automated maintenance with reporting
/gardener cultivate --sync --explore --report --format markdown \
  --output .claude/reports/garden-cultivation-$(date +%F).md

# Tier-specific maintenance
/gardener cultivate --tier t1,t2 --sync --report
```

### GARDEN Evolution Tracking

```elixir
# Query GARDEN evolution metrics
PrismaticGarden.Metrics.query(
  metric: :pattern_extraction_rate,
  period: :monthly,
  since: ~D[2025-01-01]
)
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Cultivation operations must complete all specified phases. Partial cultivation is reported as a failure.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Health checks and status reports provide the evidence needed to make informed decisions about GARDEN management.

The gardener role embodies the [NABLA](@/glossary/nabla-infinity.md) addiction preservation principle: no knowledge is discarded, contradictory implementations are preserved, and historical context is maintained alongside modern implementations. The GARDEN is a living archive that resists the temptation to "clean up" by removing old or seemingly obsolete repositories.

## Related Commands

- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/garden-extract](@/commands/garden-extract.md) - Extract and integrate patterns from GARDEN repositories
- [/garden-search](@/commands/garden-search.md) - Fast pattern search across all GARDEN reference repositories
- [/garden-sync](@/commands/garden-sync.md) - Synchronize GARDEN submodules to latest remote commits
- [/ollama](@/commands/ollama.md) - Local AI Ollama model management, installation and optimization
- [/propagate-pattern](@/commands/propagate-pattern.md) - Propagate successful patterns across the ecosystem

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)