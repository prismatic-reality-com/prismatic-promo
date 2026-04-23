+++
title = "issue-tracking-specialist"
weight = 220
[extra]
domain = "domain-expertise"
level = "L3"
description = "Automated issue extraction, classification, and lifecycle management from specifications, conversations, and code review artifacts"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "lean4", "gitlab-ci", "genserver"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["issue-tracking-specialist", "Automated", "agents", "agent", "Prismatic Platform", "GitLab", "Extraction", "Relationship"]
tags = ["agents", "agent", "issue-tracking-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "issue-tracking-specialist - Prismatic Platform"
+++

## Overview

The issue-tracking-specialist is an L3 [Strategic Command](@/glossary/strategic-command.md) agent operating within the domain expertise area of the Prismatic Platform. This agent automates the extraction, classification, prioritization, and lifecycle management of issues from diverse input sources including raw text, specifications, conversation transcripts, code review comments, and error logs. It transforms unstructured problem descriptions into structured, actionable issue records compatible with the platform's GitLab-based project management workflow.

Built on the [AIAD](@/glossary/aiad.md) standard, the issue-tracking-specialist addresses a persistent challenge in software development: the gap between problem identification and problem tracking. Developers encounter issues during code review, testing, conversation, and specification analysis, but the cognitive overhead of creating properly classified, prioritized, and contextualized issue records often leads to informal tracking (notes, messages, mental lists) that creates organizational knowledge loss. This agent eliminates that gap by automatically detecting issue-worthy content in text streams and producing fully formed issue records with classification, priority, acceptance criteria, and relationship metadata.

## Issue Extraction Engine

The issue extraction engine analyzes input text to identify segments that represent actionable issues. Extraction operates through multiple detection channels, each tuned to recognize different manifestations of issues in text.

Problem statement detection identifies explicit descriptions of bugs, defects, and malfunctions. Linguistic markers such as "doesn't work," "fails when," "crash," "error," and "regression" trigger problem statement extraction. The engine captures not just the problem description but also surrounding context that might contain reproduction steps, affected components, and expected versus actual behavior.

Requirement gap detection identifies discrepancies between specifications and current implementation. Phrases indicating missing functionality ("should also," "needs to support," "doesn't handle the case where") signal requirement gaps that should be tracked as feature requests or enhancement issues. The engine differentiates between definitive requirements (must/shall language) and aspirational suggestions (could/might language), assigning different priority levels accordingly.

Technical debt detection identifies code quality concerns expressed in review comments and technical discussions. Markers such as "TODO," "FIXME," "hack," "workaround," "temporary," and "refactor" signal technical debt items that should be formally tracked. The engine extracts sufficient context to make the technical debt item actionable, including the affected code location and the desired end state.

Risk identification detects expressions of concern about potential future problems. Phrases like "might break," "could cause issues if," "performance concern," and "security risk" signal risks that should be tracked as preemptive issues with appropriate monitoring criteria.

## Key Capabilities

- **Multi-source issue extraction** -- Detects and extracts issues from raw text, specifications, code review comments, conversation transcripts, error logs, and CI/CD pipeline output
- **Automatic classification** -- Assigns issue types (bug, feature, enhancement, technical debt, risk, question) based on linguistic analysis and contextual indicators
- **Priority assignment** -- Determines issue priority (critical, high, medium, low) based on severity indicators, affected component criticality, and user impact assessment
- **Acceptance criteria generation** -- Produces structured acceptance criteria for extracted issues, defining testable conditions that must be satisfied for issue resolution
- **Duplicate detection** -- Compares extracted issues against existing issue databases to identify potential duplicates, linking new extractions to existing issues when appropriate
- **Relationship mapping** -- Identifies and records relationships between issues including blocks/blocked-by, relates-to, duplicates, and parent/child hierarchies
- **GitLab integration** -- Creates, updates, and manages GitLab issues with full metadata including labels, milestones, assignee suggestions, and time estimates
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous monitoring of text streams for issue extraction
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for extraction accuracy and pipeline performance monitoring

## Classification Framework

The issue classification framework applies a multi-dimensional taxonomy to each extracted issue. The primary dimension is issue type, distinguishing between bugs (existing functionality that is broken), features (new functionality that does not yet exist), enhancements (improvements to existing functionality), technical debt (code quality improvements that reduce maintenance cost), risks (potential future problems requiring monitoring), and questions (uncertainties requiring investigation before action).

The secondary dimension is component scope, mapping each issue to the affected platform component based on file paths, module names, and functional area references found in the extraction context. This mapping leverages the platform's application registry to resolve informal component references to canonical application identifiers.

The tertiary dimension is impact assessment, estimating the user-facing impact of the issue based on the severity of the described problem, the breadth of affected functionality, and the availability of workarounds. Impact assessment drives priority assignment: issues affecting critical path functionality with no workarounds receive higher priority than cosmetic issues with easy workarounds.

## Lifecycle Management

Beyond initial extraction, the issue-tracking-specialist manages issue lifecycle transitions. It monitors code commits for references to tracked issues, automatically updating issue status when referenced in commit messages that indicate resolution. It tracks issue age and escalates stale issues that have remained in open status without activity beyond configurable thresholds. It detects issues that have been partially addressed (some but not all acceptance criteria satisfied) and updates their status to reflect partial completion.

The lifecycle management system integrates with the platform's GitLab CI/CD pipeline to correlate issue resolutions with test results. When a commit references an issue and the associated tests pass, the agent automatically transitions the issue to a "ready for review" state. When tests fail, the agent adds a comment to the issue with the relevant failure details.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority enabling the agent to access text streams across platform components, create and modify GitLab issues, and coordinate with development workflow agents for lifecycle management.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Domain agent runtime and lifecycle management |
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | Issue creation, modification, and pipeline status integration |
| AIAD [Registry](@/glossary/registry-otp.md) | Agent specification, component registry, and application mapping |
| Prismatic Telemetry | Extraction accuracy metrics and lifecycle event tracking |
| LLM Client | Natural language processing for issue extraction and classification |
| [Prismatic Storage](@/glossary/prismatic-storage.md) | Issue record persistence and duplicate detection indexing |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/issues extract <text>` | Extract issues from provided text | L3+ |
| `/issues scan <file_path>` | Scan a file for issue-worthy content | L3+ |
| `/issues classify <issue_id>` | Reclassify an existing issue with updated analysis | L3+ |
| `/issues stale --days=30` | Report issues with no activity in the specified period | L2+ |
| `/issues duplicates` | Detect and report potential duplicate issues | L2+ |

## Coordination with Related Agents

| Agent | Relationship |
|-------|-------------|
| [**gitlab-issue-sync-specialist**](@/agents/gitlab-issue-sync-specialist.md) (L3) | Synchronizes issue state between platform tracking and GitLab |
| [**documentation-verifier**](@/agents/documentation-verifier.md) (L3) | Extracts documentation-related issues from verification findings |
| [**cascade-quality-specialist**](@/agents/cascade-quality-specialist.md) (L3) | Technical debt issues feed into CASCADE quality elimination campaigns |

## Quality Metrics

The issue-tracking-specialist tracks extraction quality through several key metrics. Extraction precision measures the percentage of extracted items that are genuine issues (true positives versus false positives). Extraction recall measures the percentage of actual issues in the input that were successfully extracted (detected versus missed). Classification accuracy measures the percentage of correctly classified issue types and priorities. Duplicate detection accuracy measures the percentage of correctly identified duplicates versus missed duplicates and false duplicate matches.

These metrics feed into continuous improvement of the extraction and classification algorithms through the [SEADF](@/glossary/seadf.md) evolution framework.

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that extracted issues are complete and actionable. Every extracted issue includes a clear description, a classification, a priority assignment, and at minimum one acceptance criterion. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that extraction confidence is explicitly stated -- when the agent is uncertain whether a text segment represents a genuine issue or an informational observation, it flags the ambiguity rather than making an unsupported classification decision.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)