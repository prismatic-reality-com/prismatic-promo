+++
title = "/gitlab-auto-sync"
weight = 1550
[extra]
category = "GitLab"
description = "Automatic GitLab integration for all AIAD workflows"
syntax = "/gitlab-auto-sync [options]"
authority = "L2+"
agent = "gitlab-auto-sync-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1115
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gitlab-auto-sync", "Automatic", "GitLab", "AIAD", "commands", "Prismatic Platform", "Sync"]
tags = ["commands", "gitlab", "gitlab-auto-sync", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gitlab-auto-sync - Prismatic Platform"
+++

## Overview

**/gitlab-auto-sync** is a production command in the **GitLab** category of the Prismatic Platform that provides automatic bidirectional synchronization between the platform's [AIAD](@/glossary/aiad.md) workflow system and GitLab project management. When enabled, this command ensures that every AIAD workflow action -- agent deployments, command executions, quality gate results, and evolution cycles -- is automatically reflected in GitLab issues, milestones, labels, and merge requests without manual intervention.

This command operates under the **L2+** authority level and is executed by the `gitlab-auto-sync-orchestrator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the AIAD (Autonomous Intelligence Agent Design) standard. The automatic synchronization eliminates the manual overhead of updating GitLab project state to reflect development activities, ensuring that the GitLab project always accurately represents the current state of platform development.

The synchronization is bidirectional: changes in GitLab (new issues, label changes, milestone updates) can trigger AIAD workflow actions, and AIAD workflow events automatically create or update GitLab resources. This tight coupling ensures that the GitLab project serves as a reliable single source of truth for project status, even when most development activities are driven by AIAD agents and slash commands.

## Architecture

The auto-sync system operates as a continuous synchronization engine with event-driven triggers and conflict resolution.

### Synchronization Architecture

```
AIAD Events ----+                              +---- GitLab Webhooks
                |                              |
                v                              v
        Event Collector <-- Conflict Resolver --> Event Collector
                |                |                    |
                v                v                    v
        Transform Engine    State Store         Transform Engine
                |           (ETS + Disk)              |
                v                                     v
        GitLab API Client                    AIAD Command Dispatcher
                |                                     |
                v                                     v
        GitLab Project                         AIAD Workflows
```

### Event Types

| Direction | Event | AIAD Trigger | GitLab Action |
|-----------|-------|-------------|---------------|
| AIAD -> GitLab | Session start | Session lifecycle hook | Create/update issue |
| AIAD -> GitLab | Quality gate result | Quality gate execution | Update issue labels |
| AIAD -> GitLab | Evolution cycle | Autoevolve completion | Update milestone progress |
| AIAD -> GitLab | Agent deployment | Agent specification change | Create merge request |
| AIAD -> GitLab | Command execution | Slash command invocation | Add issue comment |
| GitLab -> AIAD | Issue created | New GitLab issue | Create AIAD task |
| GitLab -> AIAD | Label changed | Issue label modification | Trigger workflow |
| GitLab -> AIAD | Milestone updated | Milestone due date change | Update priority |

### Sync State Management

The synchronization state is maintained in an ETS table with disk persistence to ensure consistency across sessions and recover from interruptions.

| State Component | Storage | Purpose |
|----------------|---------|---------|
| **Sync cursor** | ETS + disk | Last synced event timestamp per direction |
| **Resource mapping** | ETS + disk | AIAD entity to GitLab resource ID mappings |
| **Conflict log** | Disk | Record of detected and resolved conflicts |
| **Queue** | ETS | Pending sync events awaiting processing |

## Usage

```bash
# Enable automatic synchronization
/gitlab-auto-sync enable

# Disable automatic synchronization
/gitlab-auto-sync disable

# Check synchronization status
/gitlab-auto-sync status

# Force full synchronization
/gitlab-auto-sync force-sync

# Sync specific entity type
/gitlab-auto-sync sync --type=issues
/gitlab-auto-sync sync --type=milestones
/gitlab-auto-sync sync --type=labels

# View sync history
/gitlab-auto-sync history --limit=20

# Resolve sync conflicts
/gitlab-auto-sync conflicts --resolve

# Configure sync rules
/gitlab-auto-sync configure --auto-issue=true --auto-label=true

# Test sync connectivity
/gitlab-auto-sync test

# Reset sync state (caution: re-syncs everything)
/gitlab-auto-sync reset
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `action` | string | status | Action: enable, disable, status, force-sync, sync, history, conflicts, configure, test, reset |
| `--type` | string | all | Entity type filter: issues, milestones, labels, mrs, all |
| `--limit` | integer | 10 | Number of history entries to display |
| `--resolve` | flag | false | Auto-resolve detected conflicts |
| `--auto-issue` | boolean | true | Automatically create issues for sessions |
| `--auto-label` | boolean | true | Automatically sync labels from AIAD |
| `--auto-milestone` | boolean | true | Sync milestones with AIAD phases |
| `--auto-comment` | boolean | false | Add comments for command executions |
| `--format` | string | text | Output format: text, json |
| `--dry-run` | flag | false | Show what would be synced without executing |
| `--verbose` | flag | false | Show detailed sync operation logs |

## Execution Flow

1. **Configuration Loading**: Sync configuration is loaded from `.aiad/config/gitlab-sync.yaml` and environment variables (`GITLAB_TOKEN`, `GITLAB_PROJECT_ID`).

2. **Connectivity Verification**: The GitLab API connection is verified and the project access level is confirmed. The command requires at least `Developer` access for full sync functionality.

3. **State Recovery**: The sync state is loaded from ETS/disk. If no previous state exists (first run or after reset), a full initial sync is performed.

4. **Event Collection**: Pending events from both AIAD and GitLab are collected. AIAD events are gathered from the telemetry event stream; GitLab events are fetched via the API since the last sync cursor.

5. **Conflict Detection**: Events that modify the same resource from both directions are identified as potential conflicts. The conflict resolver applies configurable rules (last-write-wins, AIAD-priority, or manual resolution).

6. **Transform and Apply**: Non-conflicting events are transformed into their target format and applied. AIAD events become GitLab API calls; GitLab events become AIAD command dispatches.

7. **State Update**: Successful sync operations update the sync cursor and resource mappings. Failed operations are queued for retry.

8. **Status Report**: A summary of the sync operation is displayed, including events processed, conflicts detected, and any failures requiring attention.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `gitlab-auto-sync-orchestrator` | Manages bidirectional sync |
| [/gitlab-api](@/commands/gitlab-api.md) | API backend | All GitLab operations go through the API client |
| [/gitlab-ci](@/commands/gitlab-ci.md) | Pipeline sync | Pipeline status reflected in sync state |
| [/gitlab-enforce](@/commands/gitlab-enforce.md) | Compliance | Enforcement actions synced to GitLab |
| [Session Lifecycle](@/glossary/session-discipline.md) | Session tracking | Session start/end creates/updates issues |
| [Quality Gates](@/glossary/quality-gates.md) | Quality sync | Gate results synced as issue labels |
| [Telemetry](@/glossary/telemetry.md) | Event source | AIAD events collected from telemetry stream |
| [AIAD Registry](@/glossary/aiad.md) | Entity mapping | AIAD entities mapped to GitLab resources |

## Best Practices

**Enable auto-sync from the start.** Enabling synchronization at the beginning of a project ensures complete traceability from day one. Retroactive synchronization is possible but produces a flood of catch-up events.

**Configure comment verbosity carefully.** Setting `--auto-comment=true` provides detailed command-level tracking but can generate high volumes of issue comments. Enable it for critical issues and milestones, disable it for routine development.

**Review conflicts promptly.** Sync conflicts indicate that the same resource was modified independently in both AIAD and GitLab. Unresolved conflicts can cause state divergence that becomes increasingly difficult to reconcile.

**Use dry-run for major operations.** Before running `force-sync` or `reset`, use `--dry-run` to preview what would happen. Force-sync on a large project can generate hundreds of API calls.

**Monitor sync lag.** The `status` action shows the time since the last successful sync. If sync lag exceeds a few minutes during active development, investigate potential connectivity or rate limit issues.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `gitlab_auth_failure` | Invalid or expired `GITLAB_TOKEN` | Regenerate token with appropriate scopes |
| `project_access_denied` | Insufficient project permissions | Request Developer or Maintainer access |
| `sync_conflict` | Same resource modified in both directions | Use `conflicts --resolve` or resolve manually |
| `rate_limit_exceeded` | Too many API calls in short period | Sync will auto-retry after rate limit reset |
| `state_corruption` | ETS table or disk state inconsistent | Use `reset` to rebuild sync state from scratch |
| `webhook_delivery_failed` | GitLab webhook cannot reach platform | Verify webhook URL and network connectivity |
| `transform_error` | Event cannot be mapped to target format | Check sync configuration and entity mappings |

## Advanced Usage

### Custom Sync Rules

Define custom synchronization rules for specific event types.

```yaml
# .aiad/config/gitlab-sync.yaml
rules:
  - event: quality_gate_failed
    action: create_issue
    labels: ["quality-regression", "P1"]
    assignee: "quality-lead"
    milestone: "current"

  - event: agent_deployed
    action: add_comment
    template: "Agent {{agent_name}} deployed at {{timestamp}}"

  - event: evolution_cycle_complete
    action: update_milestone
    progress_field: "evolution_fitness"
```

### Webhook Configuration

Set up GitLab webhooks for real-time bidirectional sync.

```bash
# Configure webhook for instant sync (vs polling)
/gitlab-auto-sync configure --webhook-url="https://platform.example.com/webhooks/gitlab"
/gitlab-auto-sync configure --webhook-events="issues,merge_requests,pipelines"
```

### Selective Sync

Sync only specific milestones or label groups.

```bash
# Sync only P0 issues
/gitlab-auto-sync sync --type=issues --filter="labels:P0"

# Sync only active milestones
/gitlab-auto-sync sync --type=milestones --filter="state:active"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every AIAD action is reflected in GitLab; no development activity goes untracked.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Sync state is verified before every operation. Conflicts are detected and resolved rather than silently ignored.

## Related Commands

- [/gitlab-api](@/commands/gitlab-api.md) - GitLab API operations for project and repository management
- [/gitlab-ci](@/commands/gitlab-ci.md) - [GitLab CI](@/glossary/gitlab-ci.md)/CD pipeline management and configuration
- [/gitlab-enforce](@/commands/gitlab-enforce.md) - GitLab enforcement for compliance and workflow standards
- [/cicd-unified](@/commands/cicd-unified.md) - Unified CI/CD workflow actions for pipeline management
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)