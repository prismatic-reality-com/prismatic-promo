+++
title = "brutal-gitlab-enforcer"
weight = 60
[extra]
domain = "absolute-authority"
level = "L4"
description = "Absolute GitLab issue enforcement with zero-tolerance policy for untracked operations"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "otp", "beam", "telemetry"]
domain_normalized = "supreme"
content_version = "2.1.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 88
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["brutal-gitlab-enforcer", "Absolute", "GitLab", "agents", "agent", "Prismatic Platform", "The Brutal", "GitLab Enforcer"]
tags = ["agents", "agent", "brutal-gitlab-enforcer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "brutal-gitlab-enforcer - Prismatic Platform"
+++

## Overview

The Brutal GitLab Enforcer operates as an L4 domain specialist within the Absolute Authority domain of the Prismatic Platform. This agent enforces zero-tolerance policy for untracked operations, ensuring that every development activity -- every commit, every session, every change -- is linked to a GitLab issue. No work happens without a ticket. No session starts without tracking. No commit lands without issue reference.

In a platform with 430+ autonomous agents and 90 [umbrella application](@/glossary/umbrella-application.md)s, untracked work creates invisible technical debt, unmeasurable progress, and unauditable decisions. The Brutal GitLab Enforcer prevents this by monitoring all development activity for GitLab issue references and blocking operations that lack proper tracking. This is not a suggestion system -- it is an absolute enforcement mechanism that treats untracked work as a policy violation requiring immediate correction.

The enforcer's design philosophy is deliberately aggressive. Development teams universally acknowledge that issue tracking is important, yet consistently fail to maintain discipline without enforcement. The Brutal GitLab Enforcer eliminates the gap between intention and action by making it technically impossible to produce work that is not tracked. This approach trades developer convenience for complete audit trail integrity, a trade-off that becomes increasingly valuable as the platform grows in complexity and regulatory exposure.

## Operational Domain

The Absolute Authority domain operates with the highest enforcement severity across the platform. The Brutal GitLab Enforcer specifically targets the mandatory [session discipline](@/glossary/session-discipline.md) [protocol](@/glossary/protocol.md), verifying that development sessions create issues, reference them in commits, push changes continuously, and update issue status upon completion. This creates a complete [audit trail](@/glossary/audit-trail.md) for every line of code and every decision.

The Absolute Authority domain is distinct from the Supreme domain in one critical respect: Absolute Authority agents have enforcement power that supersedes even Supreme domain operational directives. When tracking compliance conflicts with other operational priorities, tracking wins. Always.

## Key Capabilities

- **Commit-issue linking enforcement** verifying that every git commit references a valid GitLab issue, blocking commits without proper tracking references. The enforcer validates issue references against the GitLab API to confirm that referenced issues exist and are in an active state.

- **Session tracking validation** ensuring that development sessions create GitLab issues at start and update them with progress and outcomes throughout. Sessions without GitLab ticket creation are blocked from producing any tracked output.

- **Zero-bypass enforcement** detecting and blocking attempts to circumvent tracking through `--no-verify` flags, manual pushes, or other bypass mechanisms. The enforcer treats bypass attempts as the most severe violation class, escalating to L4 supreme review.

- **Continuous push verification** monitoring that commits are pushed to the remote repository immediately after creation, preventing accumulation of local-only work that exists outside the collaborative tracking system

- **Audit trail completeness** validating that the chain from session start through commits through pushes through issue updates forms a complete, unbroken record. Any break in the audit chain triggers investigation.

- **Violation escalation** automatically escalating untracked operations through the [violation protocol](@/glossary/violation-protocol.md) from L1 warnings through L4 supreme review, with severity proportional to the tracking gap and the violator's history

## Enforcement Architecture

The Brutal GitLab Enforcer implements enforcement at multiple points in the development workflow.

### Pre-Commit Hook

The primary enforcement point is the git pre-commit hook at `.githooks/pre-commit`. This hook validates that the commit message references a valid GitLab issue before allowing the commit to proceed. The hook runs as part of the platform's git hook infrastructure and cannot be bypassed without the explicitly forbidden `--no-verify` flag.

### Session Start Gate

Development sessions using Claude Code are gated by the Session Lifecycle GenServer, which requires GitLab issue creation before productive work can begin. The Brutal GitLab Enforcer validates that the session lifecycle correctly registers issue tracking before allowing session progression.

### Push Verification

The pre-push hook validates that all local commits have been pushed to the remote repository. The enforcer detects situations where commits accumulate locally without being pushed, treating delayed pushes as tracking gaps that weaken audit trail integrity.

### CI/CD Pipeline Gate

The GitLab CI/CD pipeline includes a verification stage that confirms all commits in a merge request reference valid GitLab issues. Merge requests with untracked commits are blocked from merging regardless of test results or review approvals.

## Violation Classification

The enforcer classifies tracking violations by severity with escalating consequences.

| Violation | Severity | Consequence | Escalation |
|-----------|----------|-------------|-----------|
| Commit without issue reference | L2 | Commit blocked | Warning + correction required |
| Session without GitLab ticket | L3 | Session output blocked | Block + mandatory ticket creation |
| Use of --no-verify | L4 | Immediate escalation | Supreme review + incident report |
| Accumulated unpushed commits | L2 | Push required | Warning + mandatory push |
| Merge request with untracked commits | L3 | Merge blocked | Block + retroactive tracking required |
| Systematic tracking avoidance | L4 | Development access review | Supreme review + access restriction |

## Audit Trail Requirements

The enforcer validates that tracked operations produce a complete audit trail linking every change to its context.

**Session-to-Issue Link.** Every development session references a GitLab issue that documents the session's objective, scope, and expected outcomes.

**Commit-to-Issue Link.** Every commit message includes a GitLab issue reference that provides context for the change. The reference must point to an active issue in the correct project.

**Push-to-Remote Link.** Every commit is pushed to the remote repository within the session that produced it. Local-only commits represent audit trail gaps.

**Issue-to-Outcome Link.** Every GitLab issue receives status updates documenting progress and is updated with outcomes upon session completion.

## Authority Level

**L4** - Domain Specialist - Focused domain expertise with deep specialization capabilities and absolute enforcement authority that supersedes operational directives.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [gitlab-security-specialist-agent](@/agents/gitlab-security-specialist-agent.md) | Security Coordination | Ensures GitLab security configurations complement tracking enforcement |
| [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) | Pipeline Enforcement | Coordinates CI/CD pipeline guardrails with issue tracking requirements |
| [commit-orchestrator](@/agents/commit-orchestrator.md) | Commit Flow | Validates commit workflow compliance with tracking requirements |
| [gitlab-mcp-orchestrator](@/agents/gitlab-mcp-orchestrator.md) | GitLab API | Coordinates issue existence verification through GitLab API |

## Performance Metrics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Tracking compliance rate | > 99% | 100% | Percentage of commits with valid issue references |
| Bypass attempt detection | 100% | 100% | All --no-verify attempts detected and escalated |
| Session tracking rate | > 98% | 100% | Percentage of sessions with associated GitLab tickets |
| Push compliance rate | > 99% | 100% | Percentage of commits pushed within session |
| Audit trail completeness | > 99% | 100% | Percentage of changes with complete audit chains |
| Violation resolution time | < 5 min | < 10 min | Average time from violation detection to resolution |

## Enforcement

The Brutal GitLab Enforcer IS the enforcement. [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine in its purest form. Untracked work is rejected. Bypassed hooks are treated as L4 violations requiring supreme review. Sessions without GitLab tickets are blocked from producing any output. The use of `--no-verify` is absolutely forbidden. There are no exceptions, no grace periods, no exemptions. The [Trinity Gate](@/glossary/trinity-gate.md) validates that tracking enforcement maintains structural consistency (all enforcement points active), logical consistency (violation classification follows defined rules), and formal correctness (audit trail completeness can be mechanically verified). The NABLA [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom is the philosophical foundation: every platform change must be traceable to its origin, rationale, and authorization.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)