+++
title = "/gitlab-mr"
weight = 1580
[extra]
category = "GitLab"
description = "GitLab merge request creation and management"
syntax = "/gitlab-mr [options]"
authority = "L2+"
agent = "gitlab-mr-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1223
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gitlab-mr", "GitLab", "commands", "Prismatic Platform", "Target", "Auto"]
tags = ["commands", "gitlab", "gitlab-mr", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gitlab-mr - Prismatic Platform"
+++

## Overview

**/gitlab-mr** is a production command in the **GitLab** category of the Prismatic Platform that provides comprehensive merge request creation, management, and lifecycle orchestration. The command automates the entire merge request workflow from branch analysis through description generation, reviewer assignment, label application, milestone linking, and post-merge cleanup, ensuring every merge request meets the platform's rigorous quality and documentation standards.

This command operates under the **L2+** authority level and is executed by the `gitlab-mr-specialist` agent, which has deep understanding of the platform's branching strategy, conventional commit format, and quality gate requirements. The agent analyzes commit history, detects modified applications within the umbrella structure, generates appropriate descriptions with test plans, and assigns labels based on the nature of the changes. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

Merge requests within the Prismatic Platform are not simple code review containers. They serve as the primary quality enforcement boundary where all platform standards must be verified before code enters the main branch. The `/gitlab-mr` command ensures that every merge request includes a complete description of changes, links to relevant GitLab issues, passes all CI/CD pipeline stages, maintains zero compilation warnings, achieves required test coverage, and receives appropriate reviewer approval. The command also enforces the platform's mandatory session discipline protocol by ensuring that all work items are tracked through GitLab issues before merge requests are created.

The command supports the full merge request lifecycle: creation from feature branches, draft/ready state management, reviewer assignment and reassignment, conflict resolution guidance, rebase operations, and post-merge branch cleanup. It integrates with the [/gitlab-enforce](@/commands/gitlab-enforce.md) command to verify that merge request configurations comply with the platform's compliance policies before submission.

## Architecture

```
/gitlab-mr Command
    |
    +-- Branch Analyzer
    |       +-- Commit History Parser
    |       +-- Modified File Detector
    |       +-- Umbrella App Mapper
    |       +-- Dependency Impact Analyzer
    |
    +-- MR Generator
    |       +-- Title Generator (Conventional Commit)
    |       +-- Description Builder
    |       +-- Test Plan Generator
    |       +-- Label Applicator
    |       +-- Milestone Linker
    |       +-- Reviewer Assigner
    |
    +-- Lifecycle Manager
    |       +-- Draft/Ready State Controller
    |       +-- Conflict Detector
    |       +-- Rebase Orchestrator
    |       +-- Approval Tracker
    |       +-- Post-Merge Cleanup
    |
    +-- Quality Integrator
            +-- Pipeline Status Monitor
            +-- Quality Gate Verifier
            +-- Coverage Reporter
            +-- Warning Detector
```

The Branch Analyzer examines the current feature branch's commit history relative to the target branch (typically `main`), identifying all modified files, mapping them to affected umbrella applications, and analyzing the dependency impact across the 89+ application ecosystem. This analysis informs the MR Generator, which produces a structured merge request with conventional commit-formatted title, comprehensive description, and targeted test plan.

## Usage

### Creating Merge Requests

```bash
# Create MR from current branch to main
/gitlab-mr create

# Create MR with specific target branch
/gitlab-mr create --target=staging

# Create draft MR (not ready for review)
/gitlab-mr create --draft

# Create MR with explicit title and description
/gitlab-mr create --title="feat(perimeter): add NIS2 compliance engine" --description="Implements NIS2 directive compliance checking"
```

### Managing Merge Requests

```bash
# List open merge requests
/gitlab-mr list --status=open

# Show details of a specific MR
/gitlab-mr show --mr=456

# Mark draft MR as ready for review
/gitlab-mr ready --mr=456

# Assign reviewers
/gitlab-mr assign --mr=456 --reviewers=user1,user2

# Add labels
/gitlab-mr label --mr=456 --add=enhancement,perimeter
```

### Merge Operations

```bash
# Merge when pipeline succeeds
/gitlab-mr merge --mr=456 --when-pipeline-succeeds

# Rebase MR branch onto target
/gitlab-mr rebase --mr=456

# Check merge conflicts
/gitlab-mr conflicts --mr=456

# Close MR without merging
/gitlab-mr close --mr=456 --reason="Superseded by #789"
```

### Batch Operations

```bash
# List all MRs for a milestone
/gitlab-mr list --milestone="MVP Prismatic Perimeter"

# Close stale draft MRs older than 30 days
/gitlab-mr cleanup --stale --days=30 --dry-run
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | string | main | Target branch for the merge request |
| `--draft` | flag | false | Create as draft MR (not ready for review) |
| `--title` | string | auto | MR title (auto-generated from commits if omitted) |
| `--description` | string | auto | MR description (auto-generated if omitted) |
| `--mr` | integer | latest | Specific merge request IID to target |
| `--reviewers` | string | auto | Comma-separated reviewer usernames |
| `--labels` | string | auto | Comma-separated labels to apply |
| `--milestone` | string | none | Milestone to associate with the MR |
| `--status` | string | open | Filter by status (open, merged, closed, all) |
| `--when-pipeline-succeeds` | flag | false | Auto-merge when pipeline passes |
| `--squash` | flag | false | Squash commits on merge |
| `--delete-branch` | flag | true | Delete source branch after merge |
| `--stale` | flag | false | Target stale/inactive MRs |
| `--days` | integer | 30 | Age threshold for stale MR detection |
| `--dry-run` | flag | false | Preview operations without executing |

## Execution Flow

1. **Branch Analysis**: Analyze the current branch's divergence from the target branch. Parse commit messages to extract conventional commit types, scopes, and subjects. Identify all modified files and map them to umbrella applications.

2. **Issue Linking**: Search for GitLab issues related to the current work. The mandatory session discipline protocol requires that all development work has associated GitLab issues. The command warns if no linked issues are found.

3. **Title Generation**: Generate a conventional commit-formatted title from the branch's commit history. If multiple commit types are present, use the most significant type (feat > fix > refactor > chore). Include the primary scope based on the most-modified application.

4. **Description Building**: Construct a comprehensive MR description including a summary of changes, list of affected applications, test plan with verification steps, related issue references, and any breaking change notices. The description follows the platform's MR template format.

5. **Quality Verification**: Verify that the current branch passes all quality gates before creating the MR. Check for compilation warnings, test failures, Credo violations, and coverage thresholds. Block MR creation if critical quality issues are detected.

6. **MR Creation**: Submit the merge request to GitLab via the API. Apply labels, assign reviewers, link to milestones, and set merge options. Configure pipeline-based auto-merge if requested.

7. **Post-Creation**: Emit [telemetry](@/glossary/telemetry.md) events for MR tracking. Update session context with the MR URL and details. Monitor the pipeline triggered by the MR creation.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by `gitlab-mr-specialist` agent with L2+ authority |
| [/gitlab-enforce](@/commands/gitlab-enforce.md) | Compliance Check | Verifies MR compliance before creation |
| [/gitlab-ci](@/commands/gitlab-ci.md) | Pipeline Monitoring | Tracks pipeline status for auto-merge decisions |
| [Quality Gates](@/glossary/quality-gates.md) | Pre-creation Check | Blocks MR creation when quality gates fail |
| [Telemetry](@/glossary/telemetry.md) | Metrics Tracking | Reports MR lifecycle metrics for process optimization |
| [/commit](@/commands/commit.md) | Commit Format | Relies on conventional commit format for title generation |
| GitLab API | External Service | Full CRUD operations on merge request resources |
| Session Context | State Tracking | Records MR details for session continuity |

## Best Practices

**Conventional Commits**: Ensure all commits on the feature branch follow the conventional commit format (`type(scope): subject`). The MR title is auto-generated from these commits, so consistent formatting produces clear, informative MR titles.

**Draft First**: For complex changes, create the MR as a draft (`--draft`) early in development. This allows collaborators to see work-in-progress, provide early feedback, and track progress without triggering premature reviews.

**Issue Linking**: Always ensure GitLab issues exist before creating merge requests. The platform's mandatory session discipline protocol requires issue tracking for all work items. Use `Closes #123` syntax in MR descriptions for automatic issue closure on merge.

**Small MRs**: Prefer multiple small, focused merge requests over large omnibus changes. Each MR should address a single concern, making review faster, reducing merge conflict risk, and enabling easier rollback if issues arise.

**Reviewer Selection**: When using auto-assignment, the specialist agent considers file ownership patterns and recent activity to select appropriate reviewers. Override with `--reviewers` only when domain-specific expertise is required.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `No commits ahead of target` | Branch is up-to-date with target | Ensure you have committed changes and pushed to remote |
| `Quality gate failed` | Compilation warnings or test failures | Fix quality issues before creating the MR |
| `No linked GitLab issue` | Session discipline violation | Create GitLab issue for the work item first |
| `Branch has conflicts` | Target branch has diverged | Rebase onto target with `/gitlab-mr rebase` |
| `MR already exists` | Duplicate MR for same source/target | Use `/gitlab-mr show` to find existing MR |
| `Pipeline failed` | Auto-merge blocked by failing pipeline | Fix pipeline failures and retry |

## Advanced Usage

### Auto-Generated Test Plans

The MR generator automatically creates test plans based on modified files.

```markdown
## Test Plan
- [ ] Run `mix test apps/prismatic_perimeter/test/` for modified Perimeter modules
- [ ] Verify compilation: `mix compile --warnings-as-errors`
- [ ] Check Credo compliance: `mix credo --strict`
- [ ] Verify LiveView pages load under 250ms
- [ ] Manual smoke test of /perimeter dashboard
```

### MR Templates

```bash
# Use a predefined MR template
/gitlab-mr create --template=feature

# Available templates: feature, bugfix, hotfix, refactor, docs
/gitlab-mr templates --list
```

### Pipeline-Aware Merging

```bash
# Merge only when all quality stages pass (not just pipeline success)
/gitlab-mr merge --mr=456 --when-pipeline-succeeds --require-quality-gates
```

## Doctrine Compliance

All merge request operations enforce the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine.

- **NO MERCY**: Merge requests that fail quality gates are blocked from creation. Incomplete descriptions, missing test plans, and unlinked issues trigger warnings or blocks depending on severity. No MR is permitted to merge without passing all mandatory pipeline stages.
- **NO DOUBTS**: MR descriptions are evidence-based, generated from actual commit analysis and file modification data. Reviewer assignments are informed by file ownership patterns. All decisions are traceable through the GitLab API audit trail.

The command enforces the Mandatory Regression Test Protocol by checking that bug fix MRs include regression test additions in their changeset.

## Related Commands

- [/gitlab-api](@/commands/gitlab-api.md) - GitLab API operations for project and repository management
- [/gitlab-auto-sync](@/commands/gitlab-auto-sync.md) - Automatic GitLab integration for all AIAD workflows
- [/gitlab-ci](@/commands/gitlab-ci.md) - [GitLab CI](@/glossary/gitlab-ci.md)/CD pipeline management and configuration
- [/gitlab-enforce](@/commands/gitlab-enforce.md) - GitLab enforcement for compliance and workflow standards
- [/gitlab-sync](@/commands/gitlab-sync.md) - GitLab issue synchronization and tracking operations
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)