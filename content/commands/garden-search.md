+++
title = "/garden-search"
weight = 1340
[extra]
category = "Infrastructure"
description = "Fast pattern search across all garden reference repositories"
syntax = "/garden-search [options]"
authority = "L2+"
agent = "garden-explorer"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1194
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-search", "Fast", "commands", "Infrastructure", "Prismatic Platform", "GARDEN", "Search"]
tags = ["commands", "infrastructure", "garden-search", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/garden-search - Prismatic Platform"
+++

## Overview

**/garden-search** is a production command in the **Infrastructure** category of the Prismatic Platform that performs fast, full-text pattern search across all [GARDEN](@/glossary/garden.md) (Growing Archive of Reusable Development and Engineering Nuggets) reference repositories. While [/garden-explore](@/commands/garden-explore.md) provides structured navigation of the GARDEN ecosystem, `/garden-search` is optimized for targeted discovery -- finding specific patterns, function signatures, module names, or code constructs across 116 repositories containing 3,050+ files in a single operation.

The command operates under the **L2+** authority level and is executed by the `garden-explorer` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The garden-explorer agent leverages ripgrep-based indexing for sub-second search performance across the entire GARDEN corpus, making it practical to search the full 20+ year archive as part of routine development workflows.

The distinction between `/garden-search` and standard code search tools (like `grep` or IDE search) is scope and context. Standard search operates within the active repository. `/garden-search` extends the search boundary to encompass the entire GARDEN ecosystem -- 116 repositories that may contain solutions to problems that have already been solved in previous projects. This cross-repository search capability transforms the GARDEN from a passive archive into an active knowledge base that surfaces relevant precedent at the moment it is needed.

Search results are annotated with repository tier information (T1 through T5), file modification dates, and pattern classification metadata when available. This contextual enrichment enables operators to quickly assess the relevance and quality of each match without needing to manually inspect each file.

## Architecture

The search system is built on a three-tier architecture optimized for speed and relevance.

```
Search Query --> Query Parser --> Search Engine --> Result Ranker --> Presenter
                     |                |                  |              |
                 Regex/Glob      ripgrep-based       Tier-weighted   Formatted
                 Expansion       Index Search        Relevance       Output
                                      |
                              GARDEN Index Cache
                              (ETS, ~80ms refresh)
```

### Search Components

| Component | Technology | Responsibility |
|-----------|-----------|---------------|
| **Query Parser** | Custom | Parses search terms, regex patterns, and filter expressions |
| **Search Engine** | ripgrep + ETS index | Full-text search with regex support across all repositories |
| **Index Cache** | ETS | Pre-indexed file metadata for sub-second search on 3,050+ files |
| **Result Ranker** | Custom | Tier-weighted relevance scoring with recency boost |
| **Presenter** | Custom | Formats results with context lines, repository info, and tier badges |

### Search Index Structure

The search index is maintained as an ETS table with the following schema:

| Field | Type | Purpose |
|-------|------|---------|
| `file_path` | string | Full path within the GARDEN submodule |
| `repo_name` | string | Repository name |
| `repo_tier` | atom | T1 through T5 classification |
| `language` | atom | File language (elixir, python, javascript, etc.) |
| `last_modified` | DateTime | File modification timestamp |
| `pattern_tags` | list(string) | Extracted pattern tags from file content |
| `content_hash` | binary | SHA-256 hash for change detection |

## Usage

### Basic Usage

```bash
# Search for a term across all GARDEN repositories
/garden-search "GenServer"

# Search with regex pattern
/garden-search "def\s+handle_call"

# Search for a specific function name
/garden-search "fetch_results" --exact

# Search with file type filter
/garden-search "provider" --type elixir
```

### Filtered Search

```bash
# Search only in T1 production repositories
/garden-search "blackboard" --tier t1

# Search in a specific repository
/garden-search "websocket" --repo crisstal

# Search with language filter
/garden-search "async def" --lang python

# Search only in recently modified files
/garden-search "cache" --since 2025-01-01
```

### Advanced Pattern Search

```bash
# Search for module definitions matching a pattern
/garden-search "defmodule.*Provider" --type elixir

# Search for OTP behavior implementations
/garden-search "use GenServer" --type elixir --context 5

# Search for test patterns
/garden-search "describe.*integration" --type elixir --file-pattern "*_test.exs"

# Search with multiple terms (AND logic)
/garden-search "GenServer" --and "handle_info" --and "timeout"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `QUERY` | string | required | Search term or regex pattern |
| `--exact` | boolean | false | Match exact string (disable regex) |
| `--type` | string | all | File type filter: elixir, python, javascript, rust, go, markdown |
| `--lang` | string | all | Alias for `--type` |
| `--tier` | string | all | Repository tier filter: t1, t2, t3, t4, t5 |
| `--repo` | string | all | Search within a specific repository |
| `--context` | integer | 2 | Number of context lines around each match |
| `--since` | date | none | Only search files modified after this date |
| `--file-pattern` | string | all | Glob pattern to filter file names |
| `--and` | string | none | Additional term that must also match (AND logic) |
| `--max-results` | integer | 50 | Maximum number of results to return |
| `--format` | string | rich | Output format: rich, plain, json, paths-only |
| `--case-sensitive` | boolean | false | Enable case-sensitive matching |
| `--verify-integration` | string | none | Verify that a pattern has been integrated into the platform |

## Execution Flow

1. **Query Parsing**: Parse the search query, expanding regex metacharacters and applying escape rules. If `--exact` is specified, the query is treated as a literal string.

2. **Scope Resolution**: Determine the search scope based on filters (`--tier`, `--repo`, `--type`, `--since`). Build the list of files to search from the ETS index.

3. **Index Freshness Check**: Verify the ETS index is current. If stale, trigger an incremental re-index of modified files. The index refresh typically completes in under 80ms.

4. **Search Execution**: Execute the search using ripgrep against the resolved file list. ripgrep's SIMD-accelerated search ensures sub-second performance even for complex regex patterns across thousands of files.

5. **Result Collection**: Collect matches with context lines, file metadata, and repository information.

6. **Relevance Ranking**: Apply tier-weighted relevance scoring. T1 results receive a 5x boost, T2 receives 3x, T3 receives 2x, T4 receives 1x, and T5 receives 0.5x. Recent modifications receive an additional recency boost.

7. **Deduplication**: Remove duplicate matches that appear in multiple branches or copies of the same file across repositories.

8. **Presentation**: Format and display results with syntax highlighting, tier badges, and context lines.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `garden-explorer` agent |
| [GARDEN Ecosystem](@/glossary/garden.md) | Data Source | Searches across all 116 GARDEN repositories |
| [/garden-explore](@/commands/garden-explore.md) | Complementary | Structured exploration complements text search |
| [/garden-extract](@/commands/garden-extract.md) | Workflow | Search results identify extraction targets |
| [/garden-sync](@/commands/garden-sync.md) | Prerequisite | Sync ensures search index covers latest content |
| [/gardener](@/commands/gardener.md) | Parent | Gardener provides top-level GARDEN management |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Search queries and result counts tracked |
| [Git Trees](@/commands/git-trees.md) | Performance | Uses git-tree enumeration for file discovery |

## Best Practices

**Use regex for pattern discovery, exact match for known targets.** When searching for a specific function or module name, use `--exact` to avoid false matches from regex metacharacters. When exploring for patterns or conventions, regex provides the flexibility needed to discover variations.

**Filter by tier for quality-focused searches.** When seeking production-ready implementations to extract, filter to T1 and T2 repositories. When performing archaeological research into how a problem was previously approached, include T4 and T5.

**Combine with context lines for understanding.** Use `--context 5` or higher to see surrounding code that provides implementation context. A bare match line often lacks the context needed to understand the pattern.

**Use AND logic for precise multi-term searches.** The `--and` option narrows results to files containing all specified terms, which is more effective than manually intersecting multiple search results.

**Pipe results to extraction for automated workflows.** Use `--format paths-only` to get a list of files that can be piped to other tools or used as input for [/garden-extract](@/commands/garden-extract.md).

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :invalid_regex}` | Search query contains invalid regex syntax | Fix the regex pattern or use `--exact` for literal search |
| `{:error, :no_results}` | No matches found for the query | Broaden the search by removing filters or using a less specific pattern |
| `{:error, :index_stale}` | GARDEN index is outdated | Run [/garden-sync](@/commands/garden-sync.md) to refresh the index |
| `{:error, :repo_not_found}` | Specified `--repo` does not exist | Check repository name spelling |
| `{:error, :ripgrep_unavailable}` | ripgrep binary not found | Install ripgrep: `brew install ripgrep` or `cargo install ripgrep` |
| `{:error, :submodule_missing}` | One or more GARDEN submodules not initialized | Run `git submodule update --init --recursive garden/` |

## Advanced Usage

### Integration Verification

Verify that an extracted pattern is properly integrated into the platform:

```bash
# Check if the OSINT provider pattern from sig is integrated
/garden-search --verify-integration osint-provider

# Output shows:
# Source: garden/sig/lib/providers/base.ex
# Target: apps/prismatic_agents/lib/providers/base.ex
# Status: INTEGRATED (95% pattern match)
# Divergence: Target has additional error handling (expected evolution)
```

### Cross-Repository Pattern Analysis

```bash
# Find all implementations of a specific pattern across repositories
/garden-search "defmodule.*Blackboard" --type elixir --format json | \
  jq 'group_by(.repo) | map({repo: .[0].repo, count: length})'

# Find technology migration examples (Python -> Elixir)
/garden-search "def fetch" --lang python --repo sig --format paths-only
/garden-search "def fetch" --lang elixir --repo sig --format paths-only
```

### Search-Driven Development

Use GARDEN search as a starting point for new feature development:

```bash
# Research how rate limiting was implemented historically
/garden-search "rate_limit" --context 10 --tier t1,t2

# Find all event handling patterns
/garden-search "handle_event\|handle_info\|handle_cast" --type elixir --context 3
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Search results are always complete within the specified scope -- no partial results are returned due to timeouts or errors.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Search results include sufficient context (tier, language, modification date, context lines) to make evidence-based decisions about extraction and integration.

The command supports [NABLA](@/glossary/nabla-infinity.md) signal plurality by surfacing all matching implementations across the ecosystem, ensuring that decisions about pattern extraction are informed by the full range of available evidence rather than a single implementation.

## Related Commands

- [/gardener](@/commands/gardener.md) - GARDEN legacy knowledge repository management across 116 repos
- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/garden-extract](@/commands/garden-extract.md) - Extract and integrate patterns from GARDEN repositories
- [/garden-sync](@/commands/garden-sync.md) - Synchronize GARDEN submodules to latest remote commits
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/git-trees](@/commands/git-trees.md) - Git tree-based codebase exploration at ~100x speed improvement

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)