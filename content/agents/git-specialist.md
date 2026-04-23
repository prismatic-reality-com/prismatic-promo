+++
title = "git-specialist"
weight = 187
[extra]
domain = "development"
level = "L3"
description = "Git version control expertise including branching strategies, commit hygiene, merge conflict resolution, and workflow management for the platform's development lifecycle"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["git-specialist", "version", "control", "expertise", "including", "branching", "strategies", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "git-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "git-specialist - Prismatic Platform"
+++

## Overview

The Git Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Development domain of the Prismatic Platform. This agent provides comprehensive Git version control expertise covering branching strategies, commit hygiene enforcement, merge conflict resolution, workflow management, and repository maintenance. For a platform with 37,486 files across 89 umbrella applications, disciplined version control is not a convenience but a structural necessity -- the Git Specialist ensures that the platform's development workflow scales effectively without introducing the chaos that large, multi-contributor codebases are prone to.

Within the platform's 434-agent autonomous ecosystem built on the [AIAD](@/glossary/aiad.md) standard, the Git Specialist works alongside the [code-specialist](@/agents/code-specialist.md) and [fix-specialist](@/agents/fix-specialist.md) to maintain the development domain's operational integrity. While the code specialist generates code and the fix specialist resolves defects, the Git Specialist manages the version control layer that tracks, organizes, and protects all code changes.

## Branching Strategy

The Git Specialist enforces a branching strategy adapted to the platform's development workflow and release management requirements.

Feature branches (prefixed `feature/`) isolate new development work from the main branch, enabling parallel development without interference. Each feature branch is scoped to a single logical change, preventing the anti-pattern of branches that accumulate unrelated modifications over extended periods.

Fix branches (prefixed `fix/`) isolate bug fix work with the same discipline applied to feature development. Fix branches are typically shorter-lived than feature branches, reflecting the urgency of defect resolution and the smaller scope of individual fixes.

The main branch represents the canonical state of the platform. Direct commits to main are restricted; all changes enter through merge requests that must pass quality gates before acceptance. This protection ensures that main always represents a buildable, testable, deployable state.

Branch lifecycle management prevents branch proliferation -- a common problem in large repositories. The Git Specialist tracks branch age, merge status, and activity level, identifying stale branches for cleanup. Merged branches are deleted after merge confirmation. Abandoned branches are archived after configurable inactivity periods.

## Commit Hygiene

Commit hygiene rules ensure that the repository's history remains a useful, navigable record of development decisions.

Atomic commits encapsulate single logical changes. A commit that adds a feature should not also fix an unrelated bug or refactor an unrelated module. This atomicity enables selective reversion, cherry-picking, and bisection -- operations that become impossible when commits bundle unrelated changes.

Commit message format follows the Conventional Commits standard: `type(scope): subject`. Types include feat, fix, docs, style, refactor, perf, test, and chore. Subject lines remain under 50 characters. Bodies provide additional context for complex changes. This standardized format enables automated changelog generation and semantic versioning.

Commit verification ensures that committed code passes quality checks before entry into the repository. Pre-commit hooks enforce compilation without warnings, Credo compliance, and test passage. The Git Specialist integrates with the platform's pre-commit infrastructure to ensure that these checks run consistently.

| Commit Rule | Enforcement | Purpose |
|------------|-------------|---------|
| Atomic changes | Review + hook enforcement | Enable selective reversion and bisection |
| Conventional format | Pre-commit hook + review | Standardized history and changelog generation |
| Subject under 50 chars | Pre-commit hook | Readable log output |
| No --no-verify bypass | Policy enforcement | Prevent quality gate circumvention |
| Frequent commits | Workflow guidance | Minimize merge conflicts and work loss |

## Merge Conflict Resolution

Merge conflict resolution is a critical capability for a large umbrella application where multiple development streams regularly touch shared code.

Structural conflict analysis identifies the nature of merge conflicts: textual conflicts (parallel edits to the same lines), semantic conflicts (compatible edits to the same function that create incorrect behavior when combined), and architectural conflicts (parallel changes to module interfaces that create incompatible signatures).

Resolution strategy selection matches the conflict type to an appropriate resolution approach. Textual conflicts may have obvious resolutions based on change intent. Semantic conflicts require understanding both changes and their interaction. Architectural conflicts may require redesign discussions and coordinated resolution across multiple modules.

Conflict prevention reduces merge conflicts through workflow guidance. The Git Specialist advises development agents to merge main into feature branches frequently, keep branches short-lived, and coordinate with other agents when working in shared code areas. Prevention is more effective than resolution for maintaining development velocity.

## Repository Maintenance

Repository maintenance ensures that the platform's git repository remains performant and well-organized as it grows.

Repository optimization addresses performance concerns in large repositories. The platform's repository contains over 37,000 files and extensive commit history. The Git Specialist leverages `git ls-tree` operations (the platform's Git Trees infrastructure) for efficient file listing rather than filesystem traversal, achieving approximately 100x performance improvement for common operations.

Large file management prevents binary files and other large assets from bloating the repository. The Git Specialist identifies large file additions during pre-commit review and advises appropriate handling -- Git LFS for necessary large files, external storage for assets that do not belong in version control.

History maintenance preserves the repository's commit history as a valuable development record while ensuring that sensitive data (accidentally committed credentials, personal information, proprietary content) is identified and handled appropriately.

## Pre-Commit Hook Integration

The Git Specialist integrates with the platform's multi-phase pre-commit hook infrastructure, which enforces quality standards before code enters the repository.

The platform's pre-commit system runs through multiple phases: compilation checks, Credo analysis, test verification, template validation, and design consistency checks. The Git Specialist ensures that these hooks execute correctly, maintains their configurations, and troubleshoots hook failures.

Hook bypass prevention enforces the platform's absolute prohibition on `--no-verify` flag usage. The [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine classifies hook bypass as an L4 Supreme Review violation. The Git Specialist monitors for bypass attempts and ensures that all agents and processes comply with this requirement.

## Workflow Management

The Git Specialist manages development workflows that coordinate version control operations across the platform's development lifecycle.

Session workflow enforces the platform's mandatory session discipline: frequent commits during work sessions, immediate push to remote after each commit, and no unpushed work at session end. This workflow prevents work loss, enables collaboration, and maintains the remote repository as the authoritative source.

Release workflow coordinates version tagging, changelog generation, and branch management during release preparation. The workflow ensures that release branches contain only intended changes and that version tags accurately reflect the release state.

GitLab integration connects version control operations with the platform's GitLab project management. Merge request creation, status tracking, and CI/CD pipeline triggering all flow through the Git Specialist's workflow management layer.

## Quality Gates Integration

The Git Specialist participates in the platform's [quality gates](@/glossary/quality-gates.md) as the version control layer of the quality enforcement pipeline.

Pre-commit quality gates prevent substandard code from entering the repository. Pre-push quality gates verify that pushed code meets distribution standards. Merge request quality gates ensure that merged code passes comprehensive validation including tests, type checking, and performance benchmarks.

## Epistemic Framework Compliance

The [NABLA Infinity](@/glossary/nabla-infinity.md) framework's Provenance Mandatory axiom aligns directly with version control's fundamental purpose: maintaining provenance for every line of code. Git provides the provenance infrastructure that enables traceability from current code back through its entire development history.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Phoenix](@/glossary/phoenix.md) Framework | Development target | Web application version control |
| [Elixir](@/glossary/elixir.md)/OTP | Platform codebase | Umbrella application repository management |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement pipeline | Pre-commit and merge request validation |
| GitLab CI/CD | Automation | Pipeline triggering and merge request management |
| Git Trees | Performance | Optimized repository traversal infrastructure |

## Related Agents

- [**code-specialist**](@/agents/code-specialist.md) (L3) - Code generation coordinating with version control for committed code management
- [**fix-specialist**](@/agents/fix-specialist.md) (L3) - Bug fix implementation coordinating commit and branch management for fix delivery
- [**doc-specialist**](@/agents/doc-specialist.md) (L3) - Documentation maintenance coordinating version control for documentation updates

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)