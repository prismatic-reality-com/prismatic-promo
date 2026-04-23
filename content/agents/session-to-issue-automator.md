+++
title = "session-to-issue-automator"
weight = 373
[extra]
domain = "aiad-automation-specialist"
level = "L4"
description = "Automatically transforms session artifacts into GitLab issues with proper labeling, assignment, and milestone linkage"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity", "otp", "genserver", "telemetry", "lean4"]
domain_normalized = "aiad"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session-to-issue-automator", "Automatically", "GitLab", "agents", "agent", "Prismatic Platform", "Medium", "Based", "Domain Authority"]
tags = ["agents", "agent", "session-to-issue-automator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "session-to-issue-automator - Prismatic Platform"
+++

## Overview

The session-to-issue-automator operates as an L4 Domain Authority within the Prismatic Platform's [AIAD](@/glossary/aiad.md)-automation-specialist domain, responsible for automatically transforming session context artifacts -- open questions, next steps, identified bugs, and improvement proposals -- into properly structured GitLab issues with appropriate labeling, priority assignment, milestone linkage, and description formatting. Under the Mandatory Session Discipline Protocol, every development session must be tracked through GitLab issues, and this agent automates the bridge between session debrief outputs and the issue tracking system.

Manual issue creation from session debriefs is error-prone and inconsistent. Developers may forget to create issues for identified items, may create issues with insufficient detail, or may apply inconsistent labeling that undermines issue triage effectiveness. The session-to-issue-automator eliminates these failure modes by systematically processing every session debrief and generating issues for all actionable items with standardized formatting and metadata. This automation supports the platform's commitment to complete traceability between development activity and project management.

## Operational Domain

The AIAD-automation-specialist domain covers the interface between session intelligence systems and external project management tools. The automator processes structured debrief documents produced by the [session-debrief-specialist](@/agents/session-debrief-specialist.md), extracts actionable items, classifies them by type and priority, and creates corresponding GitLab issues through the GitLab API. The domain includes issue template management, label taxonomy maintenance, milestone mapping logic, and duplicate detection to prevent creating issues for items that already have existing trackers.

The domain extends to bidirectional synchronization. When issues created from sessions are closed, updated, or reassigned in GitLab, the automator can propagate those status changes back to the session context to maintain synchronization between the two systems.

## Key Capabilities

- **Automatic item extraction** -- Parses session debrief documents to identify actionable items including open questions, next steps, discovered bugs, refactoring proposals, documentation needs, and test coverage gaps. Uses section-aware parsing to classify items by their debrief context
- **Issue template generation** -- Creates well-structured GitLab issues using templates appropriate for each item type (bug report, feature request, improvement proposal, documentation task). Templates include reproducibility steps for bugs, acceptance criteria for features, and scope definitions for improvements
- **Label taxonomy application** -- Applies consistent labels based on item classification including domain labels, priority labels, type labels, and effort estimate labels. The label taxonomy is maintained centrally and applied uniformly across all generated issues
- **Milestone linkage** -- Automatically associates issues with the appropriate GitLab milestone based on priority, domain, and the current milestone strategic plan. Critical items link to the current active milestone; future work links to upcoming milestones
- **Duplicate detection** -- Before creating a new issue, searches existing open issues for potential duplicates using title similarity, label overlap, and description content matching. Duplicate candidates are flagged for human review rather than automatically merged
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with automatic issue creation triggered at session lifecycle end
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing automation metrics under the `:prismatic, :session_to_issue` namespace

## Item Classification Framework

The automator classifies extracted items to determine issue type, priority, and template selection.

| Item Source | Issue Type | Default Priority | Template |
|-------------|-----------|-----------------|----------|
| **Open Questions** | Investigation | Medium | Investigation template |
| **Next Steps** | Task | Based on urgency markers | Task template |
| **Discovered Bugs** | Bug | Based on severity | Bug report template |
| **Quality Findings** | Improvement | Based on quality impact | Quality improvement template |
| **Architecture Proposals** | Enhancement | Medium | Enhancement template |
| **Documentation Gaps** | Documentation | Low | Documentation template |
| **Test Coverage Gaps** | Testing | Medium | Test task template |

## Issue Generation Pipeline

The issue generation pipeline processes debrief documents through several stages to produce high-quality issues.

```
Session Debrief
    |
    v
Item Extraction (parse structured sections)
    |
    v
Classification (type, priority, domain)
    |
    v
Duplicate Check (search existing issues)
    |
    v
Template Rendering (type-specific templates)
    |
    v
Label Application (taxonomy-compliant labeling)
    |
    v
Milestone Linkage (strategic plan alignment)
    |
    v
GitLab API Creation (with error handling and retry)
    |
    v
Session Context Update (link issue IDs back to debrief)
```

## Authority Level

**L4** - Domain Authority - Specialized domain expertise in session-to-issue automation. The agent operates autonomously within its domain but escalates to L3 authority when issue creation requires cross-domain coordination or when duplicate detection identifies complex overlapping issues.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/session-to-issues` | Process current session debrief and create issues for all actionable items | L4+ |
| `/session-to-issues --dry-run` | Show what issues would be created without actually creating them | L4+ |
| `/session-to-issues --session <date>` | Process a specific historical session debrief | L4+ |
| `/session-to-issues status` | Display automation statistics and recent issue creation activity | L4+ |
| `/session-to-issues sync` | Synchronize issue status changes back to session context records | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [session-debrief-specialist](@/agents/session-debrief-specialist.md) | Produces the debrief documents that this agent processes |
| [session-context-coordinator](@/agents/session-context-coordinator.md) | Session context updated with issue links after creation |
| [session-pattern-analyzer](@/agents/session-pattern-analyzer.md) | Pattern analysis identifies recurring issues that may warrant parent epics |
| [seadf-ecosystem-commander](@/agents/seadf-ecosystem-commander.md) | Evolution-related items link to SEADF milestones |

## GitLab Integration Architecture

The automator integrates with GitLab through the API using authentication credentials managed by the [secrets-management-specialist](@/agents/secrets-management-specialist.md).

| Integration Point | Purpose | Authentication |
|-------------------|---------|---------------|
| **Issues API** | Create, update, and search issues | `GITLAB_TOKEN` (glpat-xxx) |
| **Labels API** | Create and manage label taxonomy | `GITLAB_TOKEN` |
| **Milestones API** | Query and link milestones | `GITLAB_TOKEN` |
| **Notes API** | Add comments for status updates | `GITLAB_TOKEN` |

The integration includes retry logic with exponential backoff for API failures, rate limiting compliance to avoid GitLab API throttling, and webhook processing for bidirectional synchronization.

## Quality Standards

Generated issues must meet quality standards before creation.

| Standard | Requirement | Verification |
|----------|-------------|-------------|
| **Title clarity** | Descriptive, actionable title under 100 characters | Automated length and content check |
| **Description completeness** | Sufficient context for another developer to act | Template completeness validation |
| **Label accuracy** | Labels match item classification | Taxonomy validation |
| **Milestone relevance** | Linked milestone matches item priority and timeline | Strategic plan cross-reference |
| **No duplicates** | No existing open issue covers the same item | Similarity search with human review |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine and the Mandatory Session Discipline Protocol require that every session produces corresponding GitLab issues for all actionable items. Sessions that end without issue creation for identified items are flagged as L2 violations. The automator maintains an audit trail linking every created issue to its source session debrief, satisfying [NABLA Infinity](@/glossary/nabla-infinity.md) provenance requirements and enabling bidirectional traceability between session work and project management.

## Related Agents

Agents in the **AIAD-automation-specialist** domain work together to reduce manual overhead in the platform's development workflow. The session-to-issue-automator ensures that the gap between session intelligence and project management is bridged automatically, preventing actionable items from being lost and maintaining the complete traceability demanded by the platform's quality standards.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)