+++
title = "/pack-sources"
weight = 2000
[extra]
category = "Framework"
description = "Create optimized source archives for AI/LLM analysis with mycelial evolution options"
syntax = "/pack-sources [options]"
authority = "L2+"
agent = "source-archive-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1128
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pack-sources", "Create", "AILLM", "commands", "Framework", "Prismatic Platform", "Files", "Phase", "Description"]
tags = ["commands", "framework", "pack-sources", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pack-sources - Prismatic Platform"
+++

## Overview

**/pack-sources** is a production command in the **Framework** category of the Prismatic Platform. It creates optimized, context-rich source archives specifically designed for consumption by AI models and Large Language Models (LLMs). The command intelligently selects, filters, and packages source code, configuration files, documentation, and metadata into compressed archives that maximize the useful context an LLM can extract while staying within token limits. Optional mycelial evolution integration enables the archives to include pattern propagation data, evolution history, and quality metrics alongside raw source code.

This command operates under the **L2+** authority level and is executed by the `source-archive-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command recognizes that modern development workflows increasingly involve AI-assisted analysis, and that the quality of AI outputs depends heavily on the quality and organization of the input context.

In a platform with 90+ applications, 6,600+ Elixir source files, and millions of lines of code, blindly concatenating source files produces archives that exceed LLM context windows and dilute relevant information with noise. `/pack-sources` solves this through intelligent selection heuristics, dependency-aware ordering, and configurable filtering that produces archives tuned for specific analysis tasks.

## Architecture

The source packing system operates as a pipeline that transforms a raw codebase into an optimized archive.

### Pipeline Architecture

```
             /pack-sources
                   |
           Source Scanner
                   |
          +--------+--------+
          |        |        |
       Filter   Dependency  Metadata
       Engine   Resolver    Enricher
          |        |        |
          +--------+--------+
                   |
           Context Optimizer
                   |
          +--------+--------+
          |        |        |
       Token     Priority   Format
       Budget    Ranker     Converter
          |        |        |
          +--------+--------+
                   |
           Archive Builder
                   |
           Output (tar.gz/zip)
```

### Core Components

| Component | Responsibility | Key Feature |
|-----------|---------------|-------------|
| **Source Scanner** | Discovers all files in scope | Git-tree based, 100x faster than filesystem scan |
| **Filter Engine** | Removes irrelevant files (build artifacts, deps, etc.) | Configurable exclusion rules |
| **Dependency Resolver** | Orders files by dependency graph | Ensures LLM reads definitions before usage |
| **Metadata Enricher** | Adds context annotations to source files | Module descriptions, test coverage, quality scores |
| **Context Optimizer** | Fits content within token budget | Intelligent truncation and summarization |
| **Priority Ranker** | Ranks files by relevance to analysis goal | Recently modified, high-complexity, or flagged files first |
| **Format Converter** | Outputs in LLM-friendly formats | Markdown, concatenated text, or structured JSON |
| **Archive Builder** | Packages final output | Compressed archives with manifest |

## Usage

```bash
# Pack all sources with defaults
/pack-sources

# Pack specific application
/pack-sources --app prismatic_web

# Pack with token budget for specific LLM
/pack-sources --token-budget 128000 --model claude

# Pack only recently modified files
/pack-sources --since 7d

# Pack with mycelial evolution data included
/pack-sources --include-mycelial

# Pack specific file types only
/pack-sources --types ex,exs,md

# Pack with full metadata enrichment
/pack-sources --enrich full

# Output as single concatenated markdown file
/pack-sources --format markdown --output ./context.md

# Pack for specific analysis goal
/pack-sources --goal "security audit" --app prismatic_api

# Exclude test files
/pack-sources --exclude-tests
```

### Practical Examples

```bash
# Prepare context for LLM-assisted security review
/pack-sources --app prismatic_perimeter --goal "security audit" --enrich full --format markdown

# Pack quality-related code for evolution analysis
/pack-sources --domain quality --include-mycelial --token-budget 200000

# Create minimal context for a quick code review
/pack-sources --app prismatic_web --since 3d --format markdown --token-budget 50000

# Pack entire platform with maximum compression for archival
/pack-sources --all --format tar.gz --compress max --output ./archives/
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | `string` | all | Specific application to pack |
| `--apps` | `string` | all | Comma-separated list of applications |
| `--domain` | `string` | all | Pack files related to specific quality domain |
| `--types` | `string` | `ex,exs` | Comma-separated file extensions to include |
| `--since` | `duration` | all | Include only files modified within period |
| `--token-budget` | `integer` | 200000 | Maximum token count for output |
| `--model` | `enum` | `claude` | Target LLM model for token estimation |
| `--format` | `enum` | `tar.gz` | Output format: `tar.gz`, `zip`, `markdown`, `json`, `text` |
| `--output` | `path` | `./packed-sources/` | Output directory or file path |
| `--include-mycelial` | `flag` | false | Include mycelial evolution metadata |
| `--enrich` | `enum` | `basic` | Metadata enrichment: `none`, `basic`, `full` |
| `--goal` | `string` | none | Analysis goal hint for priority ranking |
| `--exclude-tests` | `flag` | false | Exclude test files from archive |
| `--exclude-docs` | `flag` | false | Exclude documentation files |
| `--compress` | `enum` | `standard` | Compression level: `none`, `standard`, `max` |
| `--manifest` | `flag` | true | Include file manifest with metadata |
| `--all` | `flag` | false | Pack entire platform (override app filter) |
| `--verbose` | `flag` | false | Show detailed packing progress |

## Execution Flow

### Phase 1: Scope Definition

The command determines which files fall within scope based on the provided filters. It uses the Git tree index (via `git ls-tree`) for rapid file enumeration, applying extension filters, recency filters, and application boundaries.

### Phase 2: Dependency Analysis

Files within scope are analyzed for dependency relationships. In Elixir, this means parsing `alias`, `import`, `use`, and `require` directives to build a dependency graph. Files are then topologically sorted so that definitions appear before their usages in the final archive.

### Phase 3: Priority Ranking

Each file receives a priority score based on multiple factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Recency | 0.25 | Recently modified files score higher |
| Complexity | 0.20 | Higher cyclomatic complexity scores higher |
| Centrality | 0.20 | Files with many dependents score higher |
| Goal Relevance | 0.20 | Files matching `--goal` keywords score higher |
| Quality Flags | 0.15 | Files with quality issues score higher for audit goals |

### Phase 4: Token Budget Allocation

The total token budget is allocated across files based on priority scores. High-priority files receive their full content allocation, while lower-priority files may be truncated or summarized. The token estimator uses model-specific tokenization rules to ensure accurate budget management.

### Phase 5: Metadata Enrichment

When enrichment is enabled, each file is annotated with:
- Module documentation (from `@moduledoc`)
- Function typespecs and documentation
- Test coverage percentage
- Quality score and known issues
- Mycelial propagation history (if `--include-mycelial`)
- Last modification timestamp and author

### Phase 6: Archive Assembly

The final archive is assembled with files in dependency-sorted, priority-ranked order. A manifest file is included at the top listing all files with their metadata, token counts, and priority scores.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/seadf](@/commands/seadf.md) | Framework | SEADF provides source scanning infrastructure |
| [/analyze](@/commands/analyze.md) | Peer | Architecture analysis enriches metadata |
| [/scan-mycelium](@/commands/scan-mycelium.md) | Data Source | Mycelial patterns included in enriched archives |
| [Git Trees](@/glossary/git-trees.md) | Infrastructure | Fast file enumeration from git index |
| [Quality Gates](@/glossary/quality-gates.md) | Data Source | Quality scores used for metadata enrichment |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Packing statistics and timing metrics |
| [GARDEN](@/glossary/garden.md) | Data Source | Legacy patterns available for inclusion |

## Best Practices

### Token Budget Management

Different LLMs have different context window sizes. Set `--token-budget` to approximately 80% of the target model's context window to leave room for the analysis prompt and model response. For Claude Opus with a 200K context window, a budget of 150,000-160,000 tokens is appropriate.

### Goal-Directed Packing

Always specify `--goal` when the analysis has a specific focus. The priority ranker uses goal keywords to boost relevant files. "Security audit" boosts authentication, authorization, and input validation code. "Performance optimization" boosts hot paths and database queries.

### Incremental Context Building

For iterative analysis sessions, start with a small `--since` window and expand as needed. This prevents overwhelming the LLM with irrelevant context while ensuring recent changes are prominently featured.

### Mycelial Integration

Enable `--include-mycelial` when the analysis involves understanding pattern propagation, evolution history, or quality improvement trends. The mycelial data adds approximately 10-15% to archive size but provides valuable context about how the codebase has evolved.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `TOKEN_BUDGET_EXCEEDED` | Content exceeds budget even after truncation | Narrow scope with `--app` or `--since` |
| `GIT_TREE_UNAVAILABLE` | Git index not accessible | Ensure working directory is a git repository |
| `APP_NOT_FOUND` | Specified application not found in umbrella | Check application name spelling |
| `FORMAT_UNSUPPORTED` | Requested output format not available | Use supported format: tar.gz, zip, markdown, json, text |
| `DEPENDENCY_CYCLE` | Circular dependency detected in file graph | Files included in arbitrary order for cycle members |
| `ENRICHMENT_FAILURE` | Metadata enrichment failed for some files | Files included without enrichment; check compilation |

## Advanced Usage

### Custom Priority Functions

Override the default priority ranking with a custom function:

```bash
/pack-sources --priority-fn "fn file -> if String.contains?(file, 'controller'), do: 1.0, else: 0.5 end"
```

### Diff-Based Packing

Pack only the changes between two git refs:

```bash
/pack-sources --diff main..feature-branch --format markdown
```

### Multi-Model Output

Generate archives optimized for multiple LLMs simultaneously:

```bash
/pack-sources --app prismatic_api --models claude,gpt4,gemini --output ./multi-model/
```

### Pipeline Integration

Use pack-sources as part of an automated analysis pipeline:

```bash
/pack-sources --app prismatic_web --format json --output - | /analyze --input-format packed-json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Archives include quality metadata so analysis can identify violations.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Manifests provide complete provenance for every included file.

## Related Commands

- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/rc1-orchestrate](@/commands/rc1-orchestrate.md) - Complete RC1 delivery pipeline execution with ROC optimization
- [/inject](@/commands/inject.md) - AIAD injection coordination for pattern and agent deployment
- [/migrate](@/commands/migrate.md) - Safe migration planning with rollback strategies
- [/integrate](@/commands/integrate.md) - Cross-system integration design and implementation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)