+++
title = "/garden-explore"
weight = 1310
[extra]
category = "Infrastructure"
description = "Explore GARDEN repositories for patterns and knowledge"
syntax = "/garden-explore [options]"
authority = "L2+"
agent = "garden-cultivator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1124
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-explore", "Explore", "GARDEN", "commands", "Infrastructure", "Prismatic Platform", "Exploration", "Filter"]
tags = ["commands", "infrastructure", "garden-explore", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/garden-explore - Prismatic Platform"
+++

## Overview

**/garden-explore** is a production command in the **Infrastructure** category of the Prismatic Platform that provides interactive exploration of [GARDEN](@/glossary/garden.md) (Growing Archive of Reusable Development and Engineering Nuggets) repositories for patterns, knowledge, and reusable components. The GARDEN ecosystem comprises 116 repositories spanning over 20 years of software engineering practice, containing 3,050+ files, 55+ documented patterns, and implementations across multiple languages and frameworks. The `/garden-explore` command is the primary discovery tool for navigating this legacy knowledge base.

The command operates under the **L2+** authority level and is executed by the `garden-cultivator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The garden-cultivator agent maintains a comprehensive index of all GARDEN repositories, their contents, and the patterns they contain, enabling rapid discovery of relevant knowledge regardless of the repository's age or technology stack.

Unlike [/garden-search](@/commands/garden-search.md), which performs text-based pattern matching, `/garden-explore` provides a structured, navigable view of the GARDEN ecosystem organized by repository tier, technology domain, pattern category, and relevance to the current platform context. This makes it suitable for open-ended exploration where the operator does not yet know what they are looking for -- a common scenario when investigating architectural options, seeking precedent for a design decision, or mining historical implementations for reusable components.

The GARDEN ecosystem is organized into five tiers based on maturity and relevance: T1 Production (active, production-quality repositories like `sig` and `prismatic`), T2 Active (maintained repositories under active development), T3 Libraries (stable utility libraries), T4 Archive (historical repositories with extractable value), and T5 R&D (experimental and research repositories). The `/garden-explore` command respects this tiering system, prioritizing results from higher tiers while still providing access to the full archive.

## Architecture

The `/garden-explore` command is built on a three-layer architecture: index, navigator, and presenter.

```
GARDEN Repos (116) --> Indexer --> Knowledge Graph --> Navigator --> Presenter
      |                   |              |                |            |
  Git Submodules     Pattern         KuzuDB/ETS       Interactive    Formatted
  in garden/        Extraction       Storage          Traversal      Output
```

### Component Layers

| Layer | Component | Responsibility |
|-------|-----------|---------------|
| **Index** | `Garden.Indexer` | Scans repositories, extracts metadata, builds knowledge graph |
| **Storage** | `Garden.KnowledgeGraph` | Stores repository relationships, patterns, and cross-references |
| **Navigator** | `Garden.Navigator` | Provides structured traversal of the knowledge graph |
| **Presenter** | `Garden.Presenter` | Formats exploration results for display |

### Repository Classification

| Tier | Count | Examples | Quality Level |
|------|-------|----------|---------------|
| **T1 Production** | 5 | sig (OSINT), prismatic (AI) | Production-grade, actively maintained |
| **T2 Active** | 8 | kuzu-ex, crisstal, code-weaver | Under active development |
| **T3 Libraries** | 15 | simple_geocoder, job-processor | Stable, minimal maintenance |
| **T4 Archive** | 70+ | prismatic-legacy (1,302 files) | Historical, extractable value |
| **T5 R&D** | 18 | comtesse (Rust), prismatic-scrapper | Experimental, research |

## Usage

### Basic Usage

```bash
# Explore the entire GARDEN ecosystem (top-level overview)
/garden-explore

# Explore a specific repository
/garden-explore sig

# Explore repositories by tier
/garden-explore --tier t1

# Explore repositories by technology
/garden-explore --tech elixir
```

### Pattern Discovery

```bash
# Explore pattern categories across all repositories
/garden-explore --patterns

# Find repositories containing blackboard pattern implementations
/garden-explore --pattern blackboard

# Explore OSINT-related patterns and providers
/garden-explore --domain osint

# Find repositories with GenServer implementations
/garden-explore --pattern genserver --tech elixir
```

### Deep Exploration

```bash
# Explore a repository's internal structure
/garden-explore sig --depth 3

# Show file statistics for a repository
/garden-explore prismatic-legacy --stats

# Explore cross-repository dependencies
/garden-explore --dependencies

# Find repositories that share common patterns
/garden-explore --shared-patterns --min-repos 3
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `REPO` | string | none | Specific repository name to explore |
| `--tier` | string | all | Filter by tier: t1, t2, t3, t4, t5 |
| `--tech` | string | all | Filter by technology: elixir, python, rust, go, javascript |
| `--domain` | string | all | Filter by domain: osint, ai, storage, web, security |
| `--patterns` | boolean | false | Show pattern categories instead of repositories |
| `--pattern` | string | none | Filter by specific pattern name |
| `--depth` | integer | 1 | Exploration depth for repository structure |
| `--stats` | boolean | false | Show file statistics and metrics |
| `--dependencies` | boolean | false | Show cross-repository dependency graph |
| `--shared-patterns` | boolean | false | Find patterns shared across multiple repositories |
| `--min-repos` | integer | 2 | Minimum repository count for shared pattern filter |
| `--format` | string | table | Output format: table, json, tree, markdown |
| `--verbose` | boolean | false | Include detailed metadata for each result |

## Execution Flow

1. **Scope Resolution**: Determine the exploration scope based on provided arguments -- full ecosystem, specific tier, technology filter, or individual repository.

2. **Index Verification**: Check that the GARDEN index is current. If the index is stale (last updated more than 24 hours ago), trigger an incremental re-index of modified repositories.

3. **Knowledge Graph Query**: Query the knowledge graph for entities matching the exploration criteria. For pattern exploration, this involves traversing pattern-repository relationships. For repository exploration, it involves loading repository metadata and structure.

4. **Tier-Based Prioritization**: Results are sorted with T1 repositories first, followed by T2, T3, T4, and T5. Within each tier, results are sorted by relevance to the query.

5. **Depth Expansion**: If `--depth` is specified, expand the results to show internal repository structure up to the requested depth level.

6. **Cross-Reference Resolution**: Resolve cross-references between repositories and patterns, annotating results with related items.

7. **Presentation**: Format the results according to the specified output format and display them.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `garden-cultivator` agent |
| [GARDEN Ecosystem](@/glossary/garden.md) | Core | Primary interface to the 116-repository knowledge base |
| [/garden-extract](@/commands/garden-extract.md) | Workflow | Exploration findings feed into extraction operations |
| [/garden-search](@/commands/garden-search.md) | Complementary | Text search complements structured exploration |
| [/garden-sync](@/commands/garden-sync.md) | Prerequisite | Sync ensures repositories are current before exploration |
| [/gardener](@/commands/gardener.md) | Parent | Gardener provides top-level GARDEN management |
| [KuzuDB](@/glossary/kuzudb.md) | Storage | Knowledge graph stored in KuzuDB for relationship queries |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Exploration events tracked for usage analysis |

## Best Practices

**Start broad, then narrow.** Begin with `/garden-explore` to get the ecosystem overview, then drill into specific tiers or domains. This prevents tunnel vision and may surface unexpected relevant repositories.

**Use pattern exploration for architectural decisions.** Before designing a new subsystem, run `/garden-explore --patterns` to see what patterns have been successfully applied across the GARDEN ecosystem. Historical precedent is a valuable signal for architectural decision-making.

**Sync before exploring.** Run [/garden-sync](@/commands/garden-sync.md) before deep exploration to ensure that repository contents are current. Stale submodules may cause the explorer to miss recently added patterns or files.

**Combine exploration with extraction.** After identifying a relevant pattern or component through exploration, use [/garden-extract](@/commands/garden-extract.md) to bring the discovered knowledge into the active platform. Exploration without extraction leaves value on the table.

**Leverage tier prioritization for time-constrained work.** When time is limited, restrict exploration to T1 and T2 repositories with `--tier t1` or `--tier t2`. These tiers contain the highest-quality, most relevant implementations.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :repo_not_found}` | Specified repository name does not match any GARDEN repo | Check repository name spelling; use `/garden-explore` without arguments to list all repos |
| `{:error, :index_stale}` | GARDEN index is older than 24 hours | Run [/garden-sync](@/commands/garden-sync.md) to update the index |
| `{:error, :submodule_missing}` | Git submodule is not initialized | Run `git submodule update --init garden/REPO_NAME` |
| `{:error, :knowledge_graph_unavailable}` | KuzuDB storage is not accessible | Verify KuzuDB configuration in `config/config.exs` |
| `{:error, :pattern_not_indexed}` | Specified pattern is not in the index | The pattern may exist but not yet be indexed; run manual re-index |

## Advanced Usage

### Cross-Domain Pattern Analysis

```bash
# Find patterns that appear in both OSINT and AI domains
/garden-explore --shared-patterns --domain osint,ai

# Explore how the blackboard pattern evolved across repositories
/garden-explore --pattern blackboard --format tree --verbose

# Map the technology migration path across tiers
/garden-explore --stats --format json | jq '.[] | {name, tier, primary_tech}'
```

### Knowledge Extraction Pipeline

Combine exploration with extraction for systematic knowledge mining:

```bash
# Step 1: Explore to identify candidates
/garden-explore --pattern provider --tech elixir --tier t1,t2

# Step 2: Extract identified patterns
/garden-extract sig --pattern osint-provider --target apps/prismatic_agents/

# Step 3: Verify integration
/garden-search --verify-integration osint-provider
```

### GARDEN Metrics and Health

```bash
# Get comprehensive GARDEN statistics
/garden-explore --stats --format markdown > garden-health-report.md

# Identify repositories with the most extractable value
/garden-explore --stats --tier t4 --format json | jq 'sort_by(-.file_count) | .[0:10]'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Exploration results include only verified, indexed content -- never stale or corrupted data.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Exploration provides comprehensive context before extraction decisions are made, ensuring that knowledge transfer is deliberate and evidence-based.

The command supports [NABLA](@/glossary/nabla-infinity.md) signal plurality by surfacing multiple pattern implementations across different repositories and technology stacks, enabling operators to compare approaches and select the most appropriate solution based on diverse evidence.

## Related Commands

- [/gardener](@/commands/gardener.md) - GARDEN legacy knowledge repository management across 116 repos
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