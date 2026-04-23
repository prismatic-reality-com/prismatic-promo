+++
title = "/issues"
weight = 960
[extra]
category = "Operations"
description = "Intelligent issue tracking with automatic extraction and GitLab synchronization"
syntax = "/issues [options]"
authority = "L2+"
agent = "issue-tracking-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1069
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["issues", "Intelligent", "GitLab", "commands", "Operations", "Prismatic Platform", "Filter", "Extract"]
tags = ["commands", "operations", "issues", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/issues - Prismatic Platform"
+++

## Overview

**/issues** is a production command in the **Operations** category of the Prismatic Platform that provides intelligent issue tracking with automatic extraction capabilities and bidirectional GitLab synchronization. This command transforms the traditionally manual process of issue management into an automated, AI-assisted workflow that detects, categorizes, and tracks issues across the entire platform lifecycle.

Issue tracking in a platform with 99 umbrella applications, 400+ agents, and 2.8 million lines of code requires more than a simple ticketing system. The `/issues` command addresses this scale by integrating directly with the platform's code analysis tools, quality gates, and [telemetry](/glossary/telemetry/) infrastructure to automatically extract issues from compilation warnings, test failures, quality gate violations, and runtime anomalies. These automatically extracted issues are synchronized with GitLab, creating a single source of truth for all platform work items.

This command operates under the **L2+** authority level and is executed by the `issue-tracking-specialist` agent, which maintains deep understanding of the platform's issue taxonomy, priority classification system, and milestone structure. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The command supports the full issue lifecycle: creation, assignment, status tracking, progress monitoring, resolution verification, and closure. It enforces the platform's mandatory session discipline protocol, which requires GitLab issues for all work items. The command also provides analytics capabilities, generating reports on issue velocity, resolution time distributions, and category trends.

## Architecture

The issue tracking system integrates multiple data sources into a unified issue management pipeline.

```
+---------------------+     +-------------------+     +-------------------+
| Issue Extractors    | --> | Classification    | --> | GitLab Sync       |
| (Multi-Source)      |     | Engine            |     | (Bidirectional)   |
+---------------------+     +-------------------+     +-------------------+
  |  |  |  |                        |                         |
  |  |  |  +-- Runtime Telemetry    |                         v
  |  |  +----- Test Failures        v                 +-------------------+
  |  +-------- Quality Gates  +-------------------+   | Issue Store       |
  +----------- Manual Entry   | Priority Resolver |   | (ETS + GitLab)    |
                              | (P0-P4 + CVSS)   |   +-------------------+
                              +-------------------+           |
                                                              v
                                                    +-------------------+
                                                    | Analytics Engine  |
                                                    | (Velocity + Trend)|
                                                    +-------------------+
```

The **Issue Extractors** monitor multiple data sources for issue-worthy events. The **Classification Engine** categorizes issues by type (bug, feature, debt, security), domain (which app or subsystem), and impact. The **Priority Resolver** assigns priority based on severity, affected components, and strategic alignment with active milestones. **GitLab Sync** maintains bidirectional synchronization so that issues created or updated in either system are reflected in the other. The **Analytics Engine** computes velocity metrics, burndown charts, and trend analyses.

## Usage

### Issue Discovery and Listing

```bash
# List all open issues
/issues

# List issues filtered by priority
/issues --priority P0

# List issues for a specific app
/issues --app prismatic_perimeter

# List issues assigned to current session
/issues --mine

# Search issues by keyword
/issues --search "compilation warning"
```

### Issue Creation

```bash
# Create a new issue interactively
/issues create

# Create with inline specification
/issues create --title "Fix memory leak in agent pool" --priority P1 --label bug

# Create from a quality gate violation
/issues create --from-quality-gate --gate dialyzer

# Create from test failure
/issues create --from-test-failure --test test/prismatic_web/live/dashboard_test.exs

# Batch create from all current violations
/issues create --from-violations --auto-classify
```

### Issue Management

```bash
# Update issue status
/issues update 1234 --status in_progress

# Assign issue to an agent
/issues assign 1234 --agent elixir-core-specialist

# Add comment to issue
/issues comment 1234 "Root cause identified: race condition in GenServer init"

# Close issue with resolution
/issues close 1234 --resolution fixed --commit abc123

# Link related issues
/issues link 1234 1235 --type blocks
```

### Analytics and Reporting

```bash
# Show issue velocity report
/issues analytics --velocity

# Show issue distribution by category
/issues analytics --distribution

# Show burndown chart for active milestone
/issues analytics --burndown --milestone "MVP Prismatic Perimeter"

# Export analytics report
/issues analytics --format markdown --output issue-report.md
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| (subcommand) | string | list | Action: `list`, `create`, `update`, `assign`, `comment`, `close`, `link`, `analytics` |
| `--priority` | string | all | Filter by priority: `P0`, `P1`, `P2`, `P3`, `P4` |
| `--app` | string | all | Filter by application name |
| `--label` | string | - | Filter or assign label: `bug`, `feature`, `debt`, `security`, `enhancement` |
| `--status` | string | open | Filter or set status: `open`, `in_progress`, `review`, `closed` |
| `--mine` | boolean | false | Show only issues assigned to current session |
| `--search` | string | - | Full-text search across issue titles and descriptions |
| `--milestone` | string | - | Filter by or assign to milestone |
| `--from-quality-gate` | boolean | false | Extract issues from quality gate violations |
| `--from-test-failure` | boolean | false | Extract issues from test failures |
| `--from-violations` | boolean | false | Extract issues from all current violations |
| `--auto-classify` | boolean | false | Automatically classify extracted issues |
| `--gitlab-sync` | boolean | true | Enable GitLab synchronization |
| `--format` | string | table | Output format: `table`, `json`, `markdown`, `csv` |
| `--output` | string | stdout | Output file for reports |
| `--verbose` | boolean | false | Show detailed issue information |

## Execution Flow

1. **Source Identification**: The command determines which data sources to consult based on the subcommand and options. For `list` operations, the issue store is queried. For `create --from-*` operations, the appropriate extractor is invoked.

2. **Issue Extraction** (for automated creation): Extractors scan the specified source (quality gates, test results, telemetry logs) and produce raw issue candidates with source evidence.

3. **Classification**: Each issue candidate is classified by the classification engine, which assigns type, domain, severity, and initial priority. Auto-classification uses heuristics based on the source type, affected files, and error category.

4. **Deduplication**: Issue candidates are checked against existing issues to prevent duplicate creation. Deduplication considers issue titles, affected files, and error signatures.

5. **GitLab Synchronization**: New issues are created in GitLab with appropriate labels, milestones, and assignments. Existing issues are updated if their status has changed locally. Remote changes are pulled and merged with local state.

6. **Store Update**: The local [ETS](/glossary/ets/)-backed issue store is updated with the synchronized state.

7. **Output Rendering**: Results are formatted according to the `--format` option and displayed or written to the specified output.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Executed by the `issue-tracking-specialist` agent |
| GitLab API | Synchronization | Bidirectional issue sync via GitLab REST API |
| [Quality Gates](/glossary/quality-gates/) | Extraction | Quality violations automatically generate issues |
| [Telemetry](/glossary/telemetry/) | Extraction | Runtime anomalies can trigger issue creation |
| [ETS](/glossary/ets/) | Storage | Local issue cache for fast queries |
| [AIAD Registry](/glossary/aiad/) | Discovery | Command registered via AIAD standard |
| Session Lifecycle | Enforcement | Mandatory issue tracking for all sessions |
| Milestone Tracking | Planning | Issues linked to strategic milestones |

## Best Practices

**Use automatic extraction** rather than manual issue creation whenever possible. Automatically extracted issues include structured evidence (stack traces, quality gate output, test results) that accelerates diagnosis and resolution.

**Classify issues accurately at creation time.** Incorrect classification leads to misallocation of effort and distorts velocity analytics. When using `--auto-classify`, review the assigned categories before confirming batch creation.

**Link related issues** to build a dependency graph of work items. The link types (`blocks`, `relates-to`, `duplicates`) help identify critical path dependencies and prevent parallel work on duplicate issues.

**Use milestone assignment** to align issues with strategic objectives. Unassigned issues tend to languish, while milestone-tracked issues receive appropriate prioritization and visibility.

**Review analytics weekly.** The velocity and distribution reports reveal patterns in issue creation (which subsystems generate the most issues) and resolution (which types take longest to close). These insights drive targeted quality improvement efforts.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| GitLab API unreachable | Operates in local-only mode with sync retry | Check network, retry sync with `/issues --sync` |
| Duplicate issue detected | Shows existing issue with match confidence | Link as duplicate or update existing issue |
| Invalid priority assignment | Suggests valid priority with context | Use valid P0-P4 priority |
| Milestone not found | Lists available milestones | Select from available milestones |
| Rate limit exceeded | Queues remaining operations for batch retry | Wait for rate limit reset |

## Advanced Usage

### Automated Issue Triage

```bash
# Run automated triage on all open issues
/issues triage --auto

# Triage with specific strategy
/issues triage --strategy severity-first --reassign

# Generate triage report without applying changes
/issues triage --dry-run --format markdown
```

### Bulk Operations

```bash
# Bulk close resolved issues
/issues bulk-close --label resolved --milestone "MVP Prismatic Perimeter"

# Bulk reassign issues from one agent to another
/issues bulk-assign --from leon-cleaner --to elixir-core-specialist

# Bulk update labels
/issues bulk-label --add priority:P1 --filter "app:prismatic_perimeter status:open"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every quality gate violation, compilation warning, and test failure is eligible for automatic issue extraction. No quality problem goes untracked. The mandatory session discipline protocol requires GitLab issue tracking for all sessions -- sessions without issues are blocked.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Issues include structured evidence from their extraction source. Priority assignment is evidence-based, considering severity, affected components, and strategic alignment. Analytics reports are computed from verified data, not estimates.

## Related Commands

- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)