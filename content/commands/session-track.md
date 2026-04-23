+++
title = "/session-track"
weight = 1530
[extra]
category = "Session"
description = "Session tracking actions for GitLab integration and progress monitoring"
syntax = "/session-track [options]"
authority = "MANDATORY"
agent = "session-gitlab-enforcer"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1209
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session-track", "Session", "GitLab", "commands", "Prismatic Platform", "PrismaticClaude"]
tags = ["commands", "session", "session-track", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/session-track - Prismatic Platform"
+++

## Overview

**/session-track** is a production command in the **Session** category of the Prismatic Platform that manages session tracking actions for GitLab integration and progress monitoring. Every development session within the Prismatic Platform must be tracked through GitLab issues, and this command serves as the primary interface for creating, updating, and closing those tracking artifacts. Without active session tracking, commits are blocked, pushes are rejected, and the session is considered incomplete under the platform's mandatory discipline protocol.

The command operates under the **MANDATORY** authority level -- the highest enforcement tier for session management -- and is executed by the `session-gitlab-enforcer` agent. This authority classification means that session tracking cannot be bypassed, deferred, or reduced in scope. Every session must have at least one associated GitLab issue, and progress updates must be recorded at meaningful intervals throughout the session's lifecycle.

Session tracking serves multiple purposes beyond simple accountability. It creates a persistent, searchable record of development activity that survives beyond individual Claude sessions. It provides project managers and stakeholders with real-time visibility into what is being worked on. It enables retrospective analysis through the [/rebrief](@/commands/rebrief.md) command, which can reconstruct development narratives from GitLab issue histories. And it feeds into the platform's quality metrics, tracking the ratio of planned work to unplanned work, bug fix velocity, and feature completion rates.

The `session-gitlab-enforcer` agent monitors compliance throughout the session. If a session runs for more than 15 minutes without an associated GitLab issue, the agent issues a warning. If a commit is attempted without an active tracking issue, the pre-commit hook blocks it. This enforcement is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The session tracking system bridges the gap between local Claude session state and the remote GitLab project management infrastructure.

```
Claude Session Start
       |
       v
  [Session Lifecycle Hook]     -- Triggers on :session_start
       |
       v
  [GitLab API Client]         -- Creates/updates issues via REST API
       |
       v
  [Issue Template Engine]      -- Generates structured issue bodies
       |
       v
  [Progress Monitor]           -- Tracks activity and posts updates
       |
       v
  [Session End Hook]           -- Closes/updates issues on session end
       |
       v
  GitLab Project Issues
```

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **GitLab API Client** | Authenticated REST client for GitLab issue management | `PrismaticClaude.GitLab.Client` |
| **Issue Template Engine** | Generates structured issue bodies with session metadata | `PrismaticClaude.GitLab.IssueTemplate` |
| **Progress Monitor** | Tracks commits, file changes, and quality gate results during session | `PrismaticClaude.SessionTracker.ProgressMonitor` |
| **Compliance Enforcer** | Blocks operations when session tracking requirements are not met | `PrismaticClaude.SessionTracker.ComplianceEnforcer` |
| **Session Lifecycle Integration** | Hooks into session start/end events for automatic tracking | `PrismaticClaude.SessionLifecycle` |

## Usage

### Session Initialization

```bash
# Create a new tracking issue for the current session
/session-track start "Implementing Perimeter asset discovery"

# Start with milestone association
/session-track start "MVP security ratings" --milestone "MVP Prismatic Perimeter"

# Start with labels
/session-track start "Fix compilation warnings" --labels "bug,quality,P1"
```

### Progress Updates

```bash
# Post a progress update to the tracking issue
/session-track update "Completed asset model schema, starting LiveView components"

# Update with completion percentage
/session-track update "Dashboard layout complete" --progress 60

# Update with file modification summary
/session-track update --auto-summary
```

### Session Completion

```bash
# Close the tracking issue with a final summary
/session-track close "Feature complete, all tests passing, deployed to staging"

# Close with next-steps for follow-up sessions
/session-track close "MVP delivered" --next-steps "Performance optimization needed for large asset sets"

# Close and link to merge request
/session-track close --link-mr 1234
```

### Status and Inspection

```bash
# Show current session tracking status
/session-track status

# List all open session tracking issues
/session-track list --state open

# Show tracking history for the current week
/session-track history --range 7d
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | required | Action to perform: `start`, `update`, `close`, `status`, `list`, `history` |
| `message` | string | - | Description or update message (required for `start`, `update`, `close`) |
| `--milestone` | string | - | Associate with a GitLab milestone by name |
| `--labels` | string | `session-tracking` | Comma-separated labels to apply to the issue |
| `--progress` | integer | - | Completion percentage (0-100) for progress updates |
| `--auto-summary` | flag | false | Auto-generate summary from git diff and recent commits |
| `--next-steps` | string | - | Document follow-up work when closing a session |
| `--link-mr` | integer | - | Link the tracking issue to a merge request by ID |
| `--assignee` | string | current user | GitLab username to assign the issue to |
| `--state` | string | `open` | Filter for `list` action: `open`, `closed`, `all` |
| `--range` | duration | `7d` | Time range for `history` action |
| `--format` | string | `table` | Output format: `table`, `json`, `markdown` |
| `--project` | string | configured default | GitLab project path (e.g., `korczis/prismatic-platform`) |

## Execution Flow

1. **Authentication Check** -- Verify that `GITLAB_TOKEN` environment variable is set and valid. If missing, display setup instructions and block further execution.

2. **Project Resolution** -- Resolve the target GitLab project from configuration or `--project` parameter. Verify API access and permissions.

3. **Action Dispatch** -- Route to the appropriate handler based on the specified action (`start`, `update`, `close`, `status`, `list`, `history`).

4. **For `start` action**:
   - Generate a structured issue body from the session template
   - Include session metadata: start time, platform version, quality score, branch name
   - Create the issue via GitLab API
   - Store the issue ID in the local session context for subsequent operations
   - Register session lifecycle hooks for automatic progress tracking

5. **For `update` action**:
   - Retrieve the active tracking issue ID from session context
   - Generate the update comment body (manual message or auto-summary)
   - If `--auto-summary`, gather git diff stats, recent commits, and quality gate results
   - Post the comment to the GitLab issue

6. **For `close` action**:
   - Generate a final summary comment with session statistics
   - Include total commits, files modified, tests added, quality delta
   - If `--next-steps` provided, add a follow-up section to the issue description
   - Close the issue via GitLab API
   - Clear the active tracking issue from session context

7. **Telemetry Emission** -- Emit telemetry events for all tracking actions, enabling observability dashboards to display session activity.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [GitLab CI/CD](@/glossary/gitlab-ci.md) | API | Creates and manages issues via GitLab REST API |
| [Session Lifecycle](@/apps/prismatic-claude.md) | Hook | Auto-triggered on session start and end events |
| [Pre-commit Hooks](@/glossary/quality-gates.md) | Enforcement | Blocks commits when no active tracking issue exists |
| [Quality Gates](@/glossary/quality-gates.md) | Reporting | Quality gate results are included in progress updates |
| [Telemetry](@/glossary/telemetry.md) | Observability | `[:prismatic_claude, :session_track, :*]` events |
| [/debrief](@/commands/debrief.md) | Data Source | Session tracking data feeds into debrief reports |
| [/rebrief](@/commands/rebrief.md) | Data Source | Historical tracking issues enable multi-session retrospectives |

## Best Practices

**Issue Granularity**: Create one tracking issue per logical unit of work per session. If a session covers multiple unrelated topics, create separate issues for each. This makes retrospective analysis far more useful than monolithic session issues.

**Progress Update Frequency**: Post progress updates at natural breakpoints: after completing a subtask, after passing a quality gate, or before switching context to a different area. Avoid both excessive updates (every commit) and insufficient updates (only at session end).

**Milestone Association**: Always associate tracking issues with the relevant GitLab milestone when working on milestone-tracked features. This provides automatic progress visibility at the milestone level and helps with capacity planning.

**Labels Strategy**: Use consistent labels that enable filtering. Recommended label taxonomy: category (`feature`, `bug`, `refactor`, `quality`), priority (`P0`, `P1`, `P2`), and area (`perimeter`, `hawkeye`, `api`, `web`).

**Auto-Summary Usage**: The `--auto-summary` flag is most useful for progress updates on implementation-heavy sessions where git activity tells the story. For architectural decisions or investigation sessions, manual summaries are more informative.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| `GITLAB_TOKEN` not set | Block all operations, display setup instructions | Set `export GITLAB_TOKEN="glpat-xxx"` in shell profile |
| GitLab API unreachable | Retry with exponential backoff (3 attempts), then fail gracefully | Check network connectivity and GitLab instance status |
| Invalid project path | Display error with list of accessible projects | Verify project path matches GitLab project URL structure |
| No active tracking issue (for `update`/`close`) | Prompt to create a new issue with `/session-track start` | Run `/session-track start` first |
| Rate limit exceeded | Queue updates and retry after rate limit reset | Reduce update frequency or use batch updates |
| Permission denied | Display required permissions and current token scope | Create a new token with `api` scope |

## Advanced Usage

### Automated Session Tracking Pipeline

```elixir
# Configure automatic session tracking in application config
config :prismatic_claude, :session_tracking,
  auto_start: true,
  auto_close: true,
  progress_interval: :timer.minutes(30),
  auto_summary_on_commit: true,
  default_labels: ["session-tracking", "claude-code"],
  default_milestone: "Current Sprint"
```

### Custom Issue Templates

```bash
# Use a custom template for tracking issues
/session-track start "Security audit session" --template security-audit

# Templates available:
# - default: Standard development session
# - security-audit: Security-focused with compliance checklist
# - investigation: OSINT/research session with findings format
# - bug-fix: Bug fix with regression test tracking
```

### Cross-Session Linkage

```bash
# Link current session to a parent issue
/session-track start "Continue Perimeter MVP" --parent-issue 1259

# Reference previous session tracking issue
/session-track start "Follow-up: asset discovery" --related 1280,1285

# Generate a cross-session timeline report
/session-track history --range 30d --format markdown > session-timeline.md
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Session tracking is non-negotiable. Every session must be tracked, every commit must have an associated issue, and every session must be closed properly. The `session-gitlab-enforcer` agent monitors compliance without exception. Attempts to bypass tracking (e.g., using `--no-verify` on commits) are classified as L4 violations subject to Supreme Review.
- **NO DOUBTS**: All tracking data is evidence-based and verifiable. Progress updates include concrete metrics (commits, files changed, test counts). Session summaries are generated from actual development activity, not self-reported estimates. The tracking history provides an auditable trail of platform development.

This command enforces the **Mandatory Session Discipline Protocol**, which requires GitLab issue tracking for every session, continuous commits, and pushes to remote. These requirements are absolute and cannot be bypassed.

## Related Commands

- [/debrief](@/commands/debrief.md) - Comprehensive session debrief with platform state analysis and changelog detection
- [/rebrief](@/commands/rebrief.md) - Retrospective analysis of development activity across multiple sessions
- [/session-compress](@/commands/session-compress.md) - Advanced session context compression with multi-session pattern detection
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)