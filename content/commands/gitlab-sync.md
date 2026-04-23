+++
title = "/gitlab-sync"
weight = 1600
[extra]
category = "GitLab"
description = "GitLab issue synchronization and tracking operations"
syntax = "/gitlab-sync [options]"
authority = "L2+"
agent = "gitlab-issue-sync-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1172
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gitlab-sync", "GitLab", "commands", "Prismatic Platform", "Issue"]
tags = ["commands", "gitlab", "gitlab-sync", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gitlab-sync - Prismatic Platform"
+++

## Overview

**/gitlab-sync** is a production command in the **GitLab** category of the Prismatic Platform that manages bidirectional synchronization between local development state and GitLab's issue tracking system. The command ensures that the platform's mandatory session discipline protocol is maintained by keeping GitLab issues, milestones, labels, and work item states in sync with the current development session's progress and objectives.

This command operates under the **L2+** authority level and is executed by the `gitlab-issue-sync-specialist` agent, which specializes in issue lifecycle management, label taxonomy enforcement, milestone tracking, and work item state transitions. The agent maintains a local cache of GitLab state in ETS for fast access during development operations, reducing API calls while ensuring data freshness through configurable synchronization intervals. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

Issue synchronization is a critical component of the Prismatic Platform's development workflow because the mandatory session discipline protocol requires that all development work be tracked through GitLab issues. Without proper synchronization, developers risk creating commits without issue references, working on outdated issue states, or missing important updates from collaborators. The `/gitlab-sync` command eliminates these risks by providing real-time issue state awareness and automatic progress tracking.

The command operates in three primary modes: pull synchronization (fetching remote state to local), push synchronization (updating remote state from local progress), and full bidirectional synchronization. Each mode supports filtering by milestone, label, assignee, and status, allowing developers to focus on the subset of issues most relevant to their current work. The command also supports webhook-based real-time synchronization when the platform's web server is running, enabling instant notifications of remote state changes.

## Architecture

```
/gitlab-sync Command
    |
    +-- Pull Synchronizer
    |       +-- Issue Fetcher (paginated, filtered)
    |       +-- Milestone Fetcher
    |       +-- Label Synchronizer
    |       +-- Note/Comment Fetcher
    |       +-- State Differ
    |
    +-- Push Synchronizer
    |       +-- Issue State Updater
    |       +-- Progress Comment Writer
    |       +-- Label Applicator
    |       +-- Time Tracking Reporter
    |       +-- Milestone Updater
    |
    +-- Local Cache (ETS)
    |       +-- Issue Cache Table
    |       +-- Milestone Cache Table
    |       +-- Label Cache Table
    |       +-- Sync Metadata Table
    |       +-- Last Sync Timestamp
    |
    +-- Conflict Resolver
    |       +-- State Conflict Detector
    |       +-- Merge Strategy Selector
    |       +-- Manual Resolution Prompter
    |       +-- Audit Logger
    |
    +-- Notification Handler
            +-- State Change Detector
            +-- Session Context Updater
            +-- Telemetry Emitter
```

The ETS-based local cache is the performance cornerstone of the synchronization architecture. By maintaining a local copy of GitLab state, the command can serve queries instantly without API calls, reducing latency from hundreds of milliseconds to microseconds. The cache is invalidated and refreshed on each explicit sync operation or when webhook notifications indicate remote state changes.

## Usage

### Pull Synchronization

```bash
# Sync all issues from GitLab to local cache
/gitlab-sync pull

# Sync issues for a specific milestone
/gitlab-sync pull --milestone="MVP Prismatic Perimeter"

# Sync only open issues assigned to current user
/gitlab-sync pull --status=open --assignee=me

# Sync with label filter
/gitlab-sync pull --labels=P0,security
```

### Push Synchronization

```bash
# Update GitLab issue with current progress
/gitlab-sync push --issue=1234 --progress="Implemented security rating engine"

# Close an issue with completion note
/gitlab-sync push --issue=1234 --close --note="Completed in MR !456"

# Add labels to issues
/gitlab-sync push --issue=1234 --add-labels=done,verified

# Update time tracking
/gitlab-sync push --issue=1234 --time-spent=2h
```

### Bidirectional Synchronization

```bash
# Full bidirectional sync
/gitlab-sync full

# Full sync with conflict resolution preference
/gitlab-sync full --conflict=remote-wins

# Full sync for specific milestone
/gitlab-sync full --milestone="Czech Registry Autocrawler"
```

### Status and Queries

```bash
# Show sync status and cache freshness
/gitlab-sync status

# List cached issues by milestone
/gitlab-sync list --milestone="MVP Prismatic Perimeter"

# Show issue details from cache
/gitlab-sync show --issue=1234

# Search issues by keyword
/gitlab-sync search --query="NIS2 compliance"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--milestone` | string | all | Filter by milestone name or ID |
| `--status` | string | open | Issue status filter (open, closed, all) |
| `--assignee` | string | all | Filter by assignee (use `me` for current user) |
| `--labels` | string | all | Comma-separated label filter |
| `--issue` | integer | none | Specific issue IID for push operations |
| `--progress` | string | none | Progress note to add to an issue |
| `--close` | flag | false | Close the specified issue |
| `--note` | string | none | Note to add when closing or updating |
| `--add-labels` | string | none | Labels to add to an issue |
| `--remove-labels` | string | none | Labels to remove from an issue |
| `--time-spent` | string | none | Time tracking entry (e.g., 2h, 30m) |
| `--conflict` | string | prompt | Conflict resolution strategy (remote-wins, local-wins, prompt) |
| `--query` | string | none | Keyword search across issue titles and descriptions |
| `--format` | string | text | Output format (text, json, markdown) |
| `--cache-ttl` | integer | 300 | Cache time-to-live in seconds |

## Execution Flow

1. **Cache Initialization**: Check ETS cache for existing GitLab state. Verify cache freshness against configured TTL. If cache is stale or empty, trigger a pull synchronization before proceeding.

2. **Authentication**: Verify `GITLAB_TOKEN` and `GITLAB_PROJECT_ID` environment variables are set and valid. Test API connectivity with a lightweight health check request.

3. **Filter Application**: Apply milestone, status, assignee, and label filters to scope the synchronization operation. Build the corresponding GitLab API query parameters.

4. **Data Retrieval**: For pull operations, paginate through the GitLab API to fetch all matching issues, including comments, labels, milestones, and time tracking data. Handle API pagination transparently using `per_page=100` and link header parsing.

5. **State Diffing**: Compare fetched remote state with local cache to identify additions, modifications, and deletions. For bidirectional sync, also compare local state changes against remote state to detect conflicts.

6. **Conflict Resolution**: When conflicts are detected (both local and remote state changed), apply the configured resolution strategy. `remote-wins` takes the GitLab state, `local-wins` pushes local state, and `prompt` asks the user to decide.

7. **State Application**: Apply resolved state changes to both local cache and remote GitLab as appropriate. For push operations, make API calls to update issue states, add comments, and modify labels.

8. **Verification**: Re-fetch modified resources from GitLab to verify that state changes were applied successfully. Log any discrepancies for investigation.

9. **Reporting**: Output synchronization summary showing counts of synced, created, updated, and conflicted items. Emit [telemetry](/glossary/telemetry/) events for sync metrics.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `gitlab-issue-sync-specialist` at L2+ authority |
| [/gitlab-supreme-sync](/commands/gitlab-supreme-sync/) | Superset | Supreme sync extends this command with forensics and strategy |
| [/gitlab-enforce](/commands/gitlab-enforce/) | Policy Checking | Enforces issue management policies during sync |
| [Quality Gates](/glossary/quality-gates/) | Issue-Quality Linking | Links quality metrics to GitLab issue progress |
| [Telemetry](/glossary/telemetry/) | Metrics | Reports sync latency, conflict rates, and throughput |
| Session Lifecycle | Mandatory Hook | Triggered at session start to ensure issue awareness |
| ETS Cache | Local Storage | Maintains fast-access copy of GitLab state |
| [/commit](/commands/commit/) | Issue References | Provides issue data for commit message issue linking |

## Best Practices

**Session Start Sync**: Always execute `/gitlab-sync pull` at the start of every development session. This ensures awareness of any remote changes, new issues, or milestone updates that occurred between sessions.

**Frequent Progress Updates**: Use `/gitlab-sync push --issue=N --progress="..."` to record incremental progress throughout a development session. This creates a traceable record of work and keeps collaborators informed.

**Label Hygiene**: Maintain consistent label usage by relying on the sync command's label management rather than manual GitLab UI operations. This ensures labels follow the platform's taxonomy and are applied consistently.

**Cache Management**: The default cache TTL of 300 seconds (5 minutes) balances freshness against API usage. For active collaboration sessions, reduce the TTL (`--cache-ttl=60`) to catch remote changes more quickly.

**Conflict Prevention**: Pull before pushing to minimize conflict risk. The sequence `/gitlab-sync pull && /gitlab-sync push` ensures you are working with the latest remote state before applying local changes.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `GITLAB_TOKEN not set` | Missing authentication | Configure the `GITLAB_TOKEN` environment variable |
| `Issue not found (404)` | Invalid issue IID | Verify issue exists in the project |
| `Sync conflict detected` | Both local and remote changed | Use `--conflict` strategy or resolve manually |
| `Cache corruption` | ETS table integrity issue | Run `/gitlab-sync --flush-cache` to rebuild |
| `API pagination timeout` | Too many issues to paginate | Use filters to reduce result set size |
| `Rate limit exceeded` | High-frequency API operations | Wait for rate limit reset, increase cache TTL |

## Advanced Usage

### Webhook-Based Real-Time Sync

When the platform's web server is running, the sync command can register a webhook handler for real-time issue state updates.

```bash
# Enable real-time sync via webhooks
/gitlab-sync --realtime

# Check webhook registration status
/gitlab-sync --webhook-status
```

### Bulk Operations

```bash
# Close all issues in a completed milestone
/gitlab-sync bulk-close --milestone="SPARKLINE NEXT" --note="Milestone completed"

# Apply label to all open P0 issues
/gitlab-sync bulk-label --status=open --labels=P0 --add-labels=in-progress
```

### Export and Reporting

```bash
# Export issue summary for a milestone
/gitlab-sync export --milestone="MVP Prismatic Perimeter" --format=markdown

# Generate issue velocity report
/gitlab-sync report --velocity --days=30
```

## Doctrine Compliance

All synchronization operations enforce the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine.

- **NO MERCY**: The mandatory session discipline protocol requires GitLab issue tracking for all work. Sessions without proper issue synchronization are blocked. Synchronization operations complete fully or not at all -- partial sync states are not persisted.
- **NO DOUBTS**: All synchronized data is verified against the GitLab API after application. Conflict resolution is explicit and audited. The command never silently overwrites data without detection and logging.

## Related Commands

- [/gitlab-api](/commands/gitlab-api/) - GitLab API operations for project and repository management
- [/gitlab-auto-sync](/commands/gitlab-auto-sync/) - Automatic GitLab integration for all AIAD workflows
- [/gitlab-ci](/commands/gitlab-ci/) - [GitLab CI](/glossary/gitlab-ci/)/CD pipeline management and configuration
- [/gitlab-enforce](/commands/gitlab-enforce/) - GitLab enforcement for compliance and workflow standards
- [/gitlab-mr](/commands/gitlab-mr/) - GitLab merge request creation and management
- [/gitlab-supreme-sync](/commands/gitlab-supreme-sync/) - Comprehensive GitLab synchronization with commit forensics
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)