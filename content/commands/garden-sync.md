+++
title = "/garden-sync"
weight = 1350
[extra]
category = "Infrastructure"
description = "Synchronize garden submodules to latest commits from remote repositories"
syntax = "/garden-sync [options]"
authority = "L2+"
agent = "garden-explorer"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1209
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-sync", "Synchronize", "commands", "Infrastructure", "Prismatic Platform", "GARDEN", "HEAD", "Fast"]
tags = ["commands", "infrastructure", "garden-sync", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/garden-sync - Prismatic Platform"
+++

## Overview

**/garden-sync** is a production command in the **Infrastructure** category of the Prismatic Platform that synchronizes [GARDEN](@/glossary/garden.md) (Growing Archive of Reusable Development and Engineering Nuggets) submodules to their latest commits from remote repositories. The GARDEN ecosystem comprises 116 Git submodules, each representing an independent repository with its own commit history and remote origin. The `/garden-sync` command ensures that the local copies of these submodules reflect the most current state of their upstream sources.

The command operates under the **L2+** authority level and is executed by the `garden-explorer` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The garden-explorer agent manages the synchronization process with careful attention to network efficiency, conflict detection, and index rebuilding, ensuring that the GARDEN ecosystem remains current without disrupting ongoing development work.

Synchronization is a prerequisite for accurate [/garden-explore](@/commands/garden-explore.md) and [/garden-search](@/commands/garden-search.md) operations. When GARDEN submodules are outdated, exploration and search may miss recently added patterns, updated implementations, or new repositories. The `/garden-sync` command addresses this by pulling the latest changes from all configured remote origins and rebuilding the GARDEN index to reflect the updated content.

The command is designed for efficiency over the heterogeneous GARDEN ecosystem. Not all 116 repositories are actively maintained -- T4 Archive and T5 R&D repositories may not have changed in years. The sync process detects which repositories have upstream changes and only fetches those that are out of date, minimizing network traffic and execution time. For a typical sync operation where only a handful of repositories have changed, the entire process completes in under 30 seconds.

## Architecture

The synchronization process follows a parallel fetch-and-update architecture with conflict detection.

```
GARDEN Index --> Change Detector --> Parallel Fetcher --> Conflict Resolver --> Index Rebuilder
     |                |                    |                    |                    |
  116 repos      Remote HEAD         git fetch/pull       Merge/Rebase         ETS + Disk
  in garden/     comparison          (parallel)           Strategy             Index Update
```

### Synchronization Components

| Component | Responsibility |
|-----------|---------------|
| **Change Detector** | Compares local HEAD with remote HEAD for each submodule |
| **Parallel Fetcher** | Fetches upstream changes for outdated submodules concurrently |
| **Conflict Resolver** | Detects and reports merge conflicts without automatic resolution |
| **Index Rebuilder** | Updates the GARDEN search index and knowledge graph after sync |
| **Progress Reporter** | Provides real-time progress feedback during synchronization |

### Sync Strategy per Tier

| Tier | Strategy | Frequency |
|------|----------|-----------|
| **T1 Production** | Fast-forward merge | Every sync (highest priority) |
| **T2 Active** | Fast-forward merge | Every sync |
| **T3 Libraries** | Fast-forward merge | Every sync |
| **T4 Archive** | Fetch only (no merge) | Weekly or on-demand |
| **T5 R&D** | Fetch only (no merge) | Monthly or on-demand |

## Usage

### Basic Usage

```bash
# Synchronize all GARDEN submodules
/garden-sync

# Synchronize a specific repository
/garden-sync sig

# Synchronize only T1 and T2 repositories
/garden-sync --tier t1,t2

# Check what would be synchronized without executing
/garden-sync --dry-run
```

### Selective Synchronization

```bash
# Sync only repositories that have upstream changes
/garden-sync --changed-only

# Sync a specific set of repositories
/garden-sync sig kuzu-ex crisstal

# Sync repositories by technology
/garden-sync --tech elixir

# Sync and rebuild the search index
/garden-sync --rebuild-index
```

### Maintenance Operations

```bash
# Initialize missing submodules and sync
/garden-sync --init

# Sync and prune deleted remote branches
/garden-sync --prune

# Full sync with index rebuild and health check
/garden-sync --full

# Force sync even if no changes detected
/garden-sync --force
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `REPOS` | string(s) | all | Specific repository names to synchronize |
| `--tier` | string | all | Filter by tier: t1, t2, t3, t4, t5 (comma-separated) |
| `--tech` | string | all | Filter by technology: elixir, python, rust, go, javascript |
| `--changed-only` | boolean | false | Only sync repositories with upstream changes |
| `--dry-run` | boolean | false | Show what would be synchronized without executing |
| `--init` | boolean | false | Initialize missing submodules before syncing |
| `--prune` | boolean | false | Prune deleted remote branches during sync |
| `--rebuild-index` | boolean | false | Force rebuild of the GARDEN search index after sync |
| `--full` | boolean | false | Full sync: init + prune + rebuild-index + health check |
| `--force` | boolean | false | Force sync even if no changes are detected |
| `--parallel` | integer | 8 | Maximum number of parallel fetch operations |
| `--timeout` | integer | 60000 | Timeout per repository in milliseconds |
| `--verbose` | boolean | false | Show detailed progress for each repository |

## Execution Flow

1. **Inventory**: Enumerate all GARDEN submodules from `.gitmodules` and the `garden/` directory. Build a list of repositories to synchronize based on filters.

2. **Change Detection**: For each target repository, compare the local HEAD commit with the remote HEAD using `git ls-remote`. Repositories with matching HEADs are skipped unless `--force` is specified.

3. **Initialization**: If `--init` is specified, initialize any submodules that exist in `.gitmodules` but lack a local checkout.

4. **Parallel Fetch**: Fetch upstream changes for all outdated repositories concurrently, limited by the `--parallel` option. Each fetch operation has an independent timeout.

5. **Conflict Detection**: After fetching, check for merge conflicts. If conflicts are detected, the repository is flagged but not automatically merged. Conflict details are reported to the operator.

6. **Fast-Forward Merge**: For repositories without conflicts, apply a fast-forward merge to update the local branch. Non-fast-forward changes are reported but not automatically resolved.

7. **Pruning**: If `--prune` is specified, remove local references to remote branches that no longer exist.

8. **Index Rebuild**: If `--rebuild-index` is specified or if any repositories were updated, rebuild the GARDEN search index in ETS and persist to disk.

9. **Health Check**: Verify the integrity of all synchronized submodules. Report any repositories with detached HEAD, uncommitted changes, or other anomalies.

10. **Summary Report**: Display a summary of the sync operation: repositories updated, unchanged, failed, and any conflicts detected.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Invoked by `garden-explorer` agent |
| [GARDEN Ecosystem](@/glossary/garden.md) | Core | Manages the 116-repository submodule ecosystem |
| [/garden-explore](@/commands/garden-explore.md) | Consumer | Exploration accuracy depends on sync currency |
| [/garden-search](@/commands/garden-search.md) | Consumer | Search index is rebuilt after sync |
| [/garden-extract](@/commands/garden-extract.md) | Consumer | Extraction requires current source repositories |
| [/gardener](@/commands/gardener.md) | Parent | Gardener coordinates all GARDEN operations |
| [Git Trees](@/commands/git-trees.md) | Infrastructure | Uses git operations for efficient submodule management |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Sync operations, durations, and failures tracked |

## Best Practices

**Run sync at session start.** Execute `/garden-sync --changed-only` at the beginning of each session that involves GARDEN operations. This ensures that exploration and search operate on current data without unnecessary fetching of unchanged repositories.

**Use tier-based sync for routine operations.** For daily development, syncing T1 and T2 repositories (`--tier t1,t2`) is usually sufficient. Reserve full ecosystem syncs for weekly maintenance or when exploring archive repositories.

**Monitor sync failures.** Repository sync failures (network issues, authentication problems, repository deletions) should be investigated promptly. Use `--verbose` to identify the specific failure cause for each repository.

**Run full sync before extraction campaigns.** Before performing a large-scale pattern extraction from multiple GARDEN repositories, run `/garden-sync --full` to ensure all sources are current and the index is rebuilt.

**Keep parallel count reasonable.** The default of 8 parallel fetches balances speed against network bandwidth. On limited connections, reduce with `--parallel 4`. On fast connections, increase to `--parallel 16`.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :network_unavailable}` | No network connectivity for remote fetches | Check network connection; use `--dry-run` to see what would sync |
| `{:error, :auth_failed}` | Authentication failure for private repositories | Verify SSH keys or access tokens for the remote |
| `{:error, :conflict_detected}` | Non-fast-forward changes in a repository | Manually resolve the conflict in `garden/REPO_NAME/` |
| `{:error, :timeout}` | Repository fetch exceeded the timeout | Increase `--timeout` or retry; large repositories may need more time |
| `{:error, :submodule_corrupted}` | Local submodule state is corrupted | Remove and re-initialize: `rm -rf garden/REPO_NAME && git submodule update --init garden/REPO_NAME` |
| `{:error, :remote_not_found}` | Remote origin URL is invalid or repository deleted | Update `.gitmodules` with the correct URL or remove the submodule |

## Advanced Usage

### Scheduled Synchronization

Set up automated sync as part of CI/CD or cron:

```bash
# CI/CD pipeline sync (T1/T2 only, fail-fast)
/garden-sync --tier t1,t2 --parallel 4 --timeout 30000

# Weekly full maintenance sync
/garden-sync --full --verbose > .claude/reports/garden-sync-$(date +%F).log
```

### Selective Repository Management

```bash
# Add a new repository to GARDEN
git submodule add git@github.com:user/new-repo.git garden/new-repo
/garden-sync new-repo --init --rebuild-index

# Remove a deprecated repository
git submodule deinit garden/old-repo
/garden-sync --rebuild-index
```

### Sync Health Monitoring

```bash
# Check sync status without fetching
/garden-sync --dry-run --verbose --format json | jq '.repos[] | select(.status == "outdated")'

# Find repositories that haven't been synced recently
/garden-sync --dry-run --format json | jq '.repos[] | select(.last_sync < "2026-01-01")'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Sync failures are reported immediately and do not silently degrade the GARDEN index. Every repository is either successfully synced or explicitly flagged as failed.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The change detection phase ensures that only repositories with actual upstream changes are fetched, preventing unnecessary operations and providing clear evidence of what changed.

The command supports the [NABLA](@/glossary/nabla-infinity.md) time decay axiom by maintaining temporal metadata for all GARDEN content. Each sync operation timestamps the repository state, enabling other GARDEN commands to assess the freshness of their data.

## Related Commands

- [/gardener](@/commands/gardener.md) - GARDEN legacy knowledge repository management across 116 repos
- [/garden-explore](@/commands/garden-explore.md) - Explore GARDEN repositories for patterns and knowledge
- [/garden-extract](@/commands/garden-extract.md) - Extract and integrate patterns from GARDEN repositories
- [/garden-search](@/commands/garden-search.md) - Fast pattern search across all GARDEN reference repositories
- [/git-trees](@/commands/git-trees.md) - Git tree-based codebase exploration at ~100x speed improvement
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)