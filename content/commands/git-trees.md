+++
title = "/git-trees"
weight = 2060
[extra]
category = "Framework"
description = "Git tree-based codebase exploration at ~100x speed improvement"
syntax = "/git-trees [options]"
authority = "L2+"
agent = "git-trees-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1095
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["git-trees", "100x", "commands", "Framework", "Prismatic Platform", "Elixir"]
tags = ["commands", "framework", "git-trees", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/git-trees - Prismatic Platform"
+++

## Overview

**/git-trees** is a production command in the **Framework** category of the Prismatic Platform that provides ultra-fast codebase exploration by leveraging `git ls-tree` rather than filesystem operations. In a repository containing over 37,000 tracked files across nearly 100 umbrella applications, conventional tools like `find`, `ls -R`, and `fd` take 500 milliseconds or more to traverse the directory structure. The `/git-trees` command achieves the same results in approximately 80 milliseconds -- a ~100x performance improvement that fundamentally changes how agents and operators interact with the codebase.

This command operates under the **L2+** authority level and is executed by the `git-trees-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The performance advantage is not incremental; it transforms codebase exploration from a perceptibly slow operation into an instantaneous one, enabling workflows that would be impractical with conventional tools.

The git-trees approach is mandatory for all platform agents. Every AIAD agent that needs to explore the codebase must use `/git-trees` or the underlying `mix git_trees` / `./scripts/git-trees.sh` implementations rather than filesystem traversal commands. This mandate is enforced through agent specifications and is a core element of the platform's performance architecture.

## Architecture

The command wraps two complementary implementations: a Mix task for use within the Elixir runtime and a shell script for instant execution without compilation overhead.

### Dual Implementation Strategy

| Implementation | Path | Startup Time | Use Case |
|---------------|------|-------------|----------|
| **Mix Task** | `mix git_trees [subcommand]` | ~2s (compilation) | Within Elixir applications, programmatic access |
| **Shell Script** | `./scripts/git-trees.sh [subcommand]` | ~80ms (instant) | Agent operations, CI/CD, interactive use |

### Performance Comparison

| Operation | `find` / `ls -R` | `git ls-tree` | Speedup |
|-----------|-------------------|---------------|---------|
| List all files | ~500ms | ~80ms | ~6x |
| Find by pattern | ~600ms | ~90ms | ~7x |
| Count by extension | ~700ms | ~100ms | ~7x |
| List applications | ~800ms | ~120ms | ~7x |
| Full statistics | ~1,200ms | ~150ms | ~8x |

For agent operations that perform multiple codebase queries per task, the cumulative speedup can reach 90-250x because agents no longer need to wait for filesystem traversal between each query.

### Data Model

The `git ls-tree` command reads the git object database directly, bypassing the filesystem entirely. This means results reflect the committed state of the repository (HEAD by default) rather than the working directory state. Untracked files and uncommitted changes are not included unless the `--include-untracked` flag is specified.

```
Git Object Database (packed) -> git ls-tree -r HEAD -> Parse Output -> Format Results
         |                            |                      |              |
         v                            v                      v              v
    Blob objects                 Tree traversal          Line parsing    Table/JSON/Text
    Tree objects                 Mode/hash/path          Type detection  Filtered output
    Commit objects               Recursive listing       Stats compute   Sorted results
```

## Usage

```bash
# Repository statistics summary
/git-trees

# List files in a specific directory
/git-trees list apps/prismatic_web/lib

# Find files by regex pattern
/git-trees find "router\.ex$"

# Show only Elixir files
/git-trees elixir

# List all applications with file counts
/git-trees apps

# Show recently modified files
/git-trees recent 20

# Find largest files in repository
/git-trees size

# Find duplicate filenames across the repository
/git-trees duplicates

# Filter by file type
/git-trees --type=test
/git-trees --type=ex
/git-trees --type=md

# Output in JSON format
/git-trees --format=json

# Count files by extension in a specific path
/git-trees count apps/prismatic_perimeter
```

### Shell Script Usage

```bash
# Direct shell script execution (no compilation needed)
./scripts/git-trees.sh stats
./scripts/git-trees.sh list apps/prismatic_web
./scripts/git-trees.sh find "controller\.ex$"
./scripts/git-trees.sh apps
./scripts/git-trees.sh elixir
./scripts/git-trees.sh count apps/prismatic_api
./scripts/git-trees.sh size
./scripts/git-trees.sh recent 10
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `subcommand` | string | stats | Subcommand: stats, list, find, elixir, apps, recent, size, duplicates, count |
| `path` | string | repository root | Directory path to scope the operation |
| `pattern` | string | none | Regex pattern for `find` subcommand |
| `--type` | string | all | File type filter: ex, exs, elixir, ts, js, md, yaml, json, test, lean |
| `--format` | string | text | Output format: text, json, table |
| `--limit` | integer | unlimited | Maximum number of results to return |
| `--sort` | string | name | Sort order: name, size, date, extension |
| `--include-untracked` | flag | false | Include files not tracked by git |
| `--ref` | string | HEAD | Git reference to use (branch, tag, commit SHA) |

## Execution Flow

1. **Subcommand Resolution**: The requested subcommand is identified and its parameters are validated. Invalid subcommands produce a help message listing all available operations.

2. **Git Validation**: The current directory is verified as a valid git repository. If not, the command fails with a descriptive error rather than producing confusing output.

3. **Tree Traversal**: `git ls-tree -r --name-only` (or with size/hash flags depending on subcommand) is executed against the specified git reference. This reads directly from the git object database without touching the filesystem.

4. **Output Parsing**: The raw git output is parsed into structured records containing file path, mode, type, size (when available), and extension metadata.

5. **Filtering**: Type filters, path scoping, and pattern matching are applied to the parsed records. For regex patterns, the platform uses Elixir's `Regex` module or shell `grep -E` depending on the implementation.

6. **Aggregation**: For subcommands like `stats`, `count`, `apps`, and `duplicates`, the filtered records are aggregated into summary statistics.

7. **Formatting**: Results are formatted according to the `--format` option and written to stdout. JSON format includes structured metadata suitable for programmatic consumption.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `git-trees-specialist` | All agents mandated to use git-trees |
| [AIAD Registry](/glossary/aiad/) | Codebase exploration standard | Mandatory for all agent file operations |
| [/dx-brutalist-analysis](/commands/dx-brutalist-analysis/) | Data source | Provides file metrics for DX analysis |
| [/git-forensics](/commands/git-forensics/) | Data source | Provides file inventory for forensics |
| [/ecosystem](/commands/ecosystem/) | Codebase metrics | File counts and LOC for ecosystem overview |
| [Quality Gates](/glossary/quality-gates/) | File discovery | Identifies files requiring quality checks |
| [Telemetry](/glossary/telemetry/) | Performance [metrics](/glossary/metrics/) | Query timing and cache hit rates |
| [SEADF](/glossary/seadf/) | Evolution data | Codebase structure feeds evolution engine |

## Best Practices

**Always prefer git-trees over filesystem tools.** This is not a suggestion; it is a platform mandate. All codebase exploration must use git-trees for consistency and performance. Filesystem tools like `find`, `ls -R`, and `fd` are prohibited in agent specifications.

**Use the shell script for interactive work.** The shell script at `./scripts/git-trees.sh` starts in ~80ms with zero compilation overhead. Use it for quick queries during development. Reserve `mix git_trees` for programmatic access from Elixir code.

**Understand the git vs. filesystem distinction.** Git-trees shows the committed state of the repository, not the working directory. Newly created files that have not been committed will not appear in results. Use `--include-untracked` when you need to see uncommitted files.

**Scope queries with paths.** For targeted investigations, always scope your queries to specific directories rather than searching the entire repository. `./scripts/git-trees.sh list apps/prismatic_web` is faster and produces more relevant results than searching everything.

**Use JSON format for pipelines.** When feeding git-trees output into other tools or agents, use `--format=json` for reliable parsing. The text format is designed for human readability and may change between versions.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `not_a_git_repository` | Current directory is not within a git repo | Navigate to the repository root or specify path |
| `invalid_subcommand` | Unrecognized subcommand | Use `--help` to see available subcommands |
| `invalid_regex` | `find` pattern is not a valid regex | Verify regex syntax; escape special characters |
| `ref_not_found` | `--ref` references non-existent branch/tag/commit | Verify the reference exists with `git rev-parse` |
| `path_not_in_tree` | Scoped path does not exist in git tree | Verify path spelling and existence in repository |
| `git_binary_not_found` | Git is not installed or not in PATH | Install git or fix PATH configuration |

## Advanced Usage

### Programmatic Access from Elixir

The Mix task exposes a public API for programmatic use within Elixir applications.

```elixir
# Get repository statistics
{:ok, stats} = Mix.Tasks.GitTrees.stats()
# => %{total_files: 37486, elixir_files: 13223, test_files: 5883}

# Find files by pattern
{:ok, files} = Mix.Tasks.GitTrees.find(~r/router\.ex$/)
# => ["apps/prismatic_web/lib/prismatic_web/router.ex", ...]

# List applications
{:ok, apps} = Mix.Tasks.GitTrees.apps()
# => [%{name: "prismatic", files: 342}, %{name: "prismatic_web", files: 256}, ...]
```

### Custom Type Definitions

Define custom file type categories for domain-specific filtering.

```bash
# Find all AIAD agent definitions
/git-trees find "\.agent\.md$"

# Find all policy files
/git-trees find "\.policy\.md$"

# Find all LiveView files
/git-trees find "_live\.ex$"
```

### Cross-Reference Analysis

Combine git-trees with other commands for comprehensive analysis.

```bash
# Count Elixir files per application
/git-trees apps --format=json | jq '.[] | {name, elixir_files}'

# Find applications without test files
/git-trees apps --format=json | jq '.[] | select(.test_files == 0)'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for slow codebase exploration. The ~100x performance improvement is mandatory, not optional. Agents that use filesystem traversal instead of git-trees are in violation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Git-trees provides exact file inventories from the git object database, eliminating guesswork about repository contents.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/git-forensics](/commands/git-forensics/) - Cynical git history analysis distinguishing signal from noise
- [/dx-brutalist-analysis](/commands/dx-brutalist-analysis/) - Developer experience brutalist analysis of git history
- [/ecosystem](/commands/ecosystem/) - Platform ecosystem overview and status monitoring
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)