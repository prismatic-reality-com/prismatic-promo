+++
title = "/chatgpt-sync"
weight = 250
[extra]
category = "Development"
description = "Synchronize context and progress between Claude and ChatGPT"
syntax = "/chatgpt-sync [options]"
authority = "L2+"
agent = "chatgpt-bridge"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 954
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-sync", "Synchronize", "Claude", "ChatGPT", "commands", "Development", "Prismatic Platform", "GitLab", "Sync", "Mode"]
tags = ["commands", "development", "chatgpt-sync", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-sync - Prismatic Platform"
+++

## Overview

**/chatgpt-sync** is a production command in the **Development** category of the Prismatic Platform that synchronizes context and progress between the Claude-driven development environment and ChatGPT project spaces. The command manages the full synchronization lifecycle including project creation, incremental updates, conflict resolution, and status monitoring across AI collaboration boundaries.

In a multi-AI development workflow, maintaining synchronized context is essential for productive consultations. Without synchronization, each ChatGPT session starts from stale context, leading to recommendations based on outdated platform state. The `/chatgpt-sync` command solves this by providing automated, incremental synchronization that keeps ChatGPT projects current with the latest platform changes while minimizing bandwidth and processing overhead.

This command operates under the **L2+** authority level and is executed by the `chatgpt-bridge` agent, specifically the `chatgpt-integration-commander`. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command supports five synchronization actions (sync, upload, create, status, list) and three synchronization modes (full, incremental, forced), with GitLab CI/CD integration for automated synchronization on every merge to main.

The synchronization engine uses git-based change detection to identify modified files since the last successful sync, creating minimal delta archives that efficiently update ChatGPT projects without redundant full uploads. Conflict detection and resolution mechanisms handle cases where both Claude and ChatGPT sessions have produced changes that need reconciliation.

## Architecture

The synchronization system is built on a change-detection and upload pipeline architecture.

```
Change Detection (git diff / git log)
    |
    v
Delta Calculator (files added, modified, removed)
    |
    v
Archive Creator (minimal incremental package)
    |
    v
Upload Manager (retry, resume, verify)
    |
    v
State Recorder (sync timestamp, content hash)
```

### Core Components

| Component | Responsibility |
|-----------|---------------|
| Integration Commander | Orchestrates sync lifecycle |
| Change Detector | Git-based delta calculation |
| Archive Creator | Incremental archive assembly |
| Upload Manager | Reliable upload with retry logic |
| Conflict Resolver | Handles sync conflicts |
| State Manager | Tracks sync history and timestamps |

## Usage

### Basic Synchronization

```bash
# Auto-sync with current project (incremental by default)
/chatgpt-sync

# Sync to specific project
/chatgpt-sync --project "prismatic-platform-v2"

# Full synchronization (complete re-upload)
/chatgpt-sync --mode full
```

### Incremental Updates

```bash
# Sync changes since last week
/chatgpt-sync --mode incremental --since "2025-11-28"

# Sync changes since specific commit
/chatgpt-sync --mode incremental --since "a1b2c3d"

# Automatic incremental (detects last sync point)
/chatgpt-sync --mode incremental
```

### Project Management

```bash
# Create new ChatGPT project
/chatgpt-sync --action create --project "prismatic-consultation-2025"

# Check sync status
/chatgpt-sync --action status

# List all ChatGPT projects
/chatgpt-sync --action list
```

### Preview and Validation

```bash
# Dry run to preview what would be synced
/chatgpt-sync --dry-run

# Forced sync (override conflicts)
/chatgpt-sync --mode forced --project "emergency-consultation"
```

### Combined Workflows

```bash
# Pack and sync in one command
/chatgpt-sync --action upload --mode full --auto-create

# Emergency full refresh
/chatgpt-sync --mode forced --action create --project "emergency-$(date +%Y%m%d)"
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--action` | string | `sync` | Action: sync, upload, create, status, list |
| `--project` | string | auto-detected | ChatGPT project name |
| `--mode` | string | `incremental` | Mode: full, incremental, forced |
| `--since` | string | auto-detected | Reference point for incremental sync |
| `--dry-run` | boolean | false | Preview changes without uploading |
| `--auto-create` | boolean | true | Create project if it does not exist |

## Synchronization Actions

| Action | Purpose | Mode Support | Duration |
|--------|---------|-------------|----------|
| **sync** | Intelligent sync of platform state | full, incremental, forced | 30s - 8min |
| **upload** | Direct upload of current state | full, forced | 3-8 min |
| **create** | Create new project with initial context | full only | 5-10 min |
| **status** | Display current sync status | N/A (info only) | <5s |
| **list** | List all ChatGPT projects | N/A (info only) | <5s |

## Synchronization Modes

| Mode | Strategy | Performance | Bandwidth | Best For |
|------|----------|------------|-----------|----------|
| **incremental** | Only changes since last sync | 30s - 2 min | Minimal | Regular development |
| **full** | Complete re-synchronization | 3-8 min | High | Initial setup, major changes |
| **forced** | Override conflicts and force sync | Variable | Variable | Emergency updates |

## Execution Flow

```
PHASE 1: INITIALIZATION
    |-- Parse action and mode parameters
    |-- Resolve target project (auto-detect or specified)
    |-- Load sync state history
    |
PHASE 2: CHANGE DETECTION (sync/upload actions)
    |-- Determine last sync timestamp
    |-- Run git diff for file changes
    |-- Detect documentation updates
    |-- Identify architecture changes
    |-- Calculate configuration deltas
    |
PHASE 3: ARCHIVE PREPARATION
    |-- Build incremental or full archive
    |-- Optimize for target size constraints
    |-- Run security scan
    |-- Generate manifest
    |
PHASE 4: UPLOAD EXECUTION
    |-- Initiate upload with progress tracking
    |-- Handle retries with exponential backoff
    |-- Support resume for interrupted uploads
    |-- Verify upload integrity
    |
PHASE 5: CONFLICT RESOLUTION (if needed)
    |-- Detect synchronization conflicts
    |-- Analyze conflict causes
    |-- Apply resolution strategy (merge/override/manual)
    |-- Validate post-resolution state
    |
PHASE 6: STATE RECORDING
    |-- Record sync timestamp and content hash
    |-- Update sync history
    |-- Emit telemetry events
    |-- Report completion status
```

## GitLab CI/CD Integration

The synchronization runs automatically on every merge to the main branch:

```yaml
chatgpt:sync:main:
  stage: audit
  script:
    - ./scripts/pack-sources.sh --manifest
    - ./scripts/chatgpt-project-sync.sh --method all --notify
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
```

### Required CI/CD Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for project access |
| `PRISMATIC_ASSISTANT_ID` | No | Existing assistant to update |
| `SLACK_WEBHOOK_URL` | No | Slack notification webhook |
| `AWS_S3_BUCKET` | No | S3 bucket for archive backup |

### Sync Methods (Priority Order)

1. **OpenAI Assistants API** - Creates or updates Assistant with project files
2. **S3 Backup** - Stores archive for manual retrieval as fallback

### Mix Task Interface

```bash
mix chatgpt.sync              # Auto-detect method
mix chatgpt.sync --method all # Try all methods
mix chatgpt.sync --notify     # With Slack notifications
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `chatgpt-bridge` agent | Integration commander |
| AIAD Registry | Command specification and discovery | Standard AIAD interface |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation | Sync integrity checks |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) | Sync performance tracking |
| Git Integration | Change detection engine | `git diff`, `git log` for deltas |
| GitLab CI/CD | Automated sync on merge | `.gitlab-ci/chatgpt-sync.yml` |
| OpenAI API | Assistant project management | File upload and project lifecycle |
| MCP PubSub | Real-time event broadcasting | `chatgpt:sync:*` events |

## Best Practices

1. **Use Incremental Mode for Daily Work**: Full syncs are expensive and slow. Incremental mode captures all changes since the last sync point with minimal overhead.

2. **Sync Before Major Consultations**: Always run `/chatgpt-sync` before starting a `/chatgpt-consult` session to ensure ChatGPT has current platform context.

3. **Set Up CI/CD Auto-Sync**: Configure the GitLab CI pipeline to automatically sync on merges to main, ensuring the ChatGPT project is always current without manual intervention.

4. **Monitor Sync Status Regularly**: Run `/chatgpt-sync --action status` periodically to verify sync health and detect any drift between local state and ChatGPT project state.

5. **Use Forced Mode Sparingly**: Forced mode overrides conflict detection and can result in data loss. Only use for emergency situations where you are confident about the correct state.

6. **Review Dry Run Output**: For full syncs, always use `--dry-run` first to preview the scope of changes before committing to the upload.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `NETWORK_TIMEOUT` | Connection to OpenAI API timed out | Retry with `--mode forced`, check network |
| `AUTH_FAILED` | Invalid or expired API key | Update OPENAI_API_KEY environment variable |
| `PROJECT_NOT_FOUND` | Specified project does not exist | Use `--auto-create` or create manually |
| `CONFLICT_DETECTED` | Sync conflict between local and remote | Review conflicts, use forced mode or manual resolution |
| `SIZE_EXCEEDED` | Archive exceeds project file limits | Reduce content with focus filters |
| `PARTIAL_UPLOAD` | Upload interrupted | Resume automatically on next sync attempt |

## Advanced Usage

### Project Auto-Detection

```elixir
def detect_chatgpt_project() do
  case load_project_config() do
    {:ok, project} -> {:ok, project}
    {:error, :not_found} -> auto_discover_project()
  end
end

def auto_discover_project() do
  project_name = generate_project_name()
  case find_existing_project(project_name) do
    {:ok, project} -> {:ok, project}
    {:error, :not_found} -> create_project_if_needed(project_name)
  end
end
```

### Change Detection Engine

```elixir
def detect_changes_since_last_sync(project) do
  last_sync = get_last_sync_timestamp(project)

  %{
    files_changed: detect_file_changes(last_sync),
    documentation_updates: detect_doc_changes(last_sync),
    architecture_changes: detect_arch_changes(last_sync),
    configuration_updates: detect_config_changes(last_sync),
    new_features: detect_feature_additions(last_sync)
  }
end
```

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Incremental Sync | 30s - 2 min | Delta-only upload |
| Full Sync | 3-8 min | Complete archive upload |
| Status Check | <5s | Local state query |
| Project List | <5s | API query |
| Change Detection | ~10s | Git diff analysis |
| Upload Retry | Exponential backoff | Max 3 retries |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Sync operations must complete fully or report failure clearly. Partial syncs are not accepted as success.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Change detection provides complete visibility into what will be synchronized before any upload begins.

## Related Commands

- [/chatgpt-pack](@/commands/chatgpt-pack.md) - Context packing for ChatGPT collaboration and knowledge transfer
- [/chatgpt-consult](@/commands/chatgpt-consult.md) - Consult ChatGPT for alternative perspectives and solutions
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/debrief](@/commands/debrief.md) - Comprehensive session debrief with platform state analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)