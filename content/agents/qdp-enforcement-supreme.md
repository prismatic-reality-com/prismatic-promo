+++
title = "qdp-enforcement-supreme"
weight = 326
[extra]
domain = "quality-enforcement"
level = "L1"
description = "QDP must decrease or stay same, never increase"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "seadf"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["qdp-enforcement-supreme", "decrease", "never", "increase", "agents", "agent", "Prismatic Platform", "CASCADE", "Quality Debt"]
tags = ["agents", "agent", "qdp-enforcement-supreme", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "qdp-enforcement-supreme - Prismatic Platform"
+++

## Overview

The [qdp](/glossary/qdp/)-enforcement-supreme operates as an L1 Supreme Authority within the Prismatic Platform's quality-enforcement domain, enforcing the absolute invariant that Quality Debt Points (QDP) must decrease or remain constant across every commit, session, and evolution cycle -- they must never increase. This agent holds the highest authority level in the platform hierarchy, reflecting the foundational principle that quality is not negotiable and that no feature development, performance optimization, or operational urgency justifies introducing new quality debt. The QDP enforcement supreme is the ultimate guardian of the platform's 100/100 quality score, with the authority to block any operation -- including those authorized by other L1 agents -- that would increase the platform's quality debt.

The agent's enforcement mechanism operates as an immutable ratchet: the QDP count at any point in time serves as an upper bound for all future QDP counts. This monotonic decrease property is formally verified through [Lean4](/glossary/lean4/) theorems and enforced at every stage of the development lifecycle -- pre-commit hooks, CI/CD pipeline gates, and production deployment checks. The current platform QDP count stands at zero, representing complete quality debt elimination, and the enforcement supreme ensures this remains the case through continuous monitoring and absolute enforcement authority.

## Quality Debt Points Framework

Quality Debt Points (QDP) provide a quantified measure of accumulated quality deficiencies across the platform's codebase. Each QDP represents a specific, identifiable quality violation that deviates from the platform's defined quality standards.

**QDP Categories** span thirteen quality domains, each contributing a scored assessment to the total QDP count. Compilation warnings, [Dialyzer](/glossary/dialyzer/) type analysis violations, [Credo](/glossary/credo/) style violations, DateTime precision inconsistencies, guard function hygiene issues, missing @impl annotations, memory safety violations, performance anti-patterns, missing regression tests, timing pattern violations (Process.sleep usage), TODO/FIXME markers, missing typespecs, and unsafe map access patterns all contribute to the QDP count. Each violation is weighted by severity: critical violations count as 10 QDP, high severity as 5 QDP, medium as 2 QDP, and low as 1 QDP.

**QDP Measurement** is deterministic and reproducible. The QDP count for any code state is computed by running the complete quality gate battery (`mix quality.gates`) and aggregating weighted violation counts across all domains. The measurement process is idempotent -- running it multiple times on the same code state always produces the same count -- enabling reliable before/after comparison for enforcement decisions.

**QDP Baseline** records the QDP count at defined reference points (session start, commit, deployment). The enforcement supreme compares the current QDP count against the baseline to determine whether quality debt has increased. Any increase, regardless of magnitude, triggers enforcement action.

## Enforcement Mechanisms

The qdp-enforcement-supreme deploys multiple enforcement mechanisms across the development lifecycle to prevent QDP increase.

**Pre-Commit Gate** runs as a git pre-commit hook that measures the QDP count of staged changes and compares it against the repository baseline. If the staged changes would increase QDP, the commit is blocked with a detailed report identifying the specific new violations. This is the primary enforcement point, catching quality debt before it enters the version control system.

**Session Monitoring** tracks QDP count throughout Claude agent sessions, measuring after each code modification. If a session's cumulative changes increase QDP, the enforcement supreme issues a warning and requires remediation before the session can commit any changes. Sessions that end with elevated QDP are flagged for immediate follow-up.

**CI/CD Pipeline Gate** provides redundant enforcement in the continuous integration pipeline. Even if pre-commit hooks are bypassed (a forbidden action under platform doctrine), the pipeline gate catches QDP increases and fails the build. Pipeline gate failures generate investigation alerts, as they indicate a potential enforcement mechanism bypass.

**Evolution Cycle Integration** ensures that autonomous evolution operations -- the platform's self-improvement cycles -- maintain the QDP invariant. Every evolution proposal is evaluated for its QDP impact before application. Evolution proposals that increase QDP are rejected, regardless of other benefits they might provide.

## CASCADE Pattern Enforcement

The enforcement supreme maintains specialized detection and elimination capabilities for [CASCADE](/glossary/cascade-pattern/) patterns -- systemic quality anti-patterns that tend to propagate across the codebase if not immediately eliminated.

**Type Mismatch CASCADE** detects function calls with incorrect argument types that Dialyzer identifies as potential runtime failures. These violations cascade because incorrect types in one module often propagate through function call chains to other modules.

**Dead Code CASCADE** identifies unreachable code paths, unused functions, and obsolete modules. Dead code cascades because it obscures the actual program structure, making other quality assessments less accurate and hiding additional violations behind unreachable code.

**Empty Check CASCADE** detects the `length(list) > 0` anti-pattern, which creates unnecessary O(n) operations when `list != []` achieves the same result in O(1). This pattern cascades through code review -- developers who see the anti-pattern in existing code replicate it in new code.

**Timer Replacement CASCADE** identifies `Process.sleep` usage that should be replaced with receive-after patterns or GenServer timeout mechanisms. Sleep-based timing cascades because it introduces non-deterministic test behavior and masks underlying race conditions.

**Nuclear Cache CASCADE** detects corrupted compilation caches that cause phantom compilation failures. The enforcement supreme maintains the nuclear cache fix procedure (`rm -rf _build/dev/lib/*/ebin && rm -rf priv/plts/dialyzer.plt`) as a documented recovery operation.

## Formal Verification

The QDP monotonic decrease property is formally verified through Lean4 theorems that prove the enforcement mechanisms are sound.

**Theorem: Monotonic Decrease** -- For any code state S with QDP(S) = n, the enforcement mechanisms guarantee that no subsequent code state S' reachable through the normal development workflow has QDP(S') > n. The proof establishes that every workflow transition (commit, merge, deployment) passes through at least one enforcement gate that verifies QDP non-increase.

**Theorem: Measurement Consistency** -- For any code state S, all QDP measurement methods (pre-commit, pipeline, evolution) produce the same count. The proof establishes that the measurement process is deterministic and that all enforcement gates use the same measurement function.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/qdp status` | Display current QDP count with per-domain breakdown | L4+ |
| `/qdp baseline` | Record current QDP count as the enforcement baseline | L1 |
| `/qdp history` | Display QDP count history across recent sessions and commits | L2+ |
| `/qdp investigate` | Analyze a specific QDP violation with root cause identification | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-gates-specialist](/agents/quality-gates-specialist/) | Quality gate execution providing QDP measurement data |
| [quality-enforcement-commander](/agents/quality-enforcement-commander/) | Operational quality enforcement under QDP supreme direction |
| [quality-intelligence-commander](/agents/quality-intelligence-commander/) | Quality trend analysis and predictive QDP risk assessment |
| [quality-bypass-enforcer-agent](/agents/quality-bypass-enforcer-agent/) | Prevention of quality gate bypass attempts |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Prismatic Telemetry | QDP measurement [metrics](/glossary/metrics/) and enforcement event tracking |
| [AIAD](/glossary/aiad/) [Registry](/glossary/registry-otp/) | Agent specification and quality enforcement coordination |
| Git Pre-Commit Hooks | Primary enforcement gate integration |
| GitLab CI/CD Pipeline | Redundant enforcement gate for pipeline verification |
| [Trinity Gate](/glossary/trinity-gate/) | Three-layer validation for QDP measurement accuracy |

## Enforcement

The QDP enforcement supreme operates under the [NO MERCY](/glossary/no-mercy/) doctrine at its most absolute level. Quality debt increase is prohibited without exception, without override, and without compromise. As an L1 Supreme Authority, this agent's enforcement decisions cannot be overridden by any other agent in the platform hierarchy. The [NO DOUBTS](/glossary/no-doubts/) principle requires that all QDP measurements are deterministic, reproducible, and independently verifiable. The [NABLA Infinity](/glossary/nabla-infinity/) provenance axiom ensures that every QDP count is traceable to specific code analysis results, preventing both false positives that block legitimate development and false negatives that permit quality degradation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)