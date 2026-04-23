+++
title = "production-deployment-specialist"
weight = 312
[extra]
domain = "deployment"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["production-deployment-specialist", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Theorem", "Every", "State Preservation"]
tags = ["agents", "agent", "production-deployment-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "production-deployment-specialist - Prismatic Platform"
+++

## Overview

The production-deployment-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's deployment domain, orchestrating the complete lifecycle of production releases from build artifact preparation through canary validation and full traffic cutover. This agent manages the intricate coordination required to deploy changes across a distributed [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md) umbrella application comprising over 90 applications, ensuring that every release maintains the platform's 100/100 quality score and zero-downtime operational requirements. Its deployment authority extends from staging environment verification through production rollout, with autonomous rollback capability when health metrics deviate from established baselines.

The agent's foundational guarantee rests on five core [Lean4](@/glossary/lean4.md) theorems that formally verify the safety properties of every deployment operation. These theorems establish mathematical proofs for state preservation during hot code upgrades, data migration consistency, supervision tree stability across version boundaries, configuration compatibility verification, and rollback completeness. By grounding deployment safety in formal verification rather than empirical testing alone, the production-deployment-specialist achieves a level of deployment confidence that exceeds traditional CI/CD pipeline approaches. Every deployment decision is traceable to specific theorem satisfaction, aligning with the [NABLA Infinity](@/glossary/nabla-infinity.md) provenance axiom.

## Formal Safety Theorems

The five core Lean4 theorems provide mathematical guarantees for production deployment safety. Each theorem addresses a specific class of deployment failure that, historically, has caused production incidents in distributed systems.

**Theorem 1: State Preservation** -- Formally proves that all [GenServer](@/glossary/genserver.md) state is preserved across hot code upgrades. The proof establishes that for any running process with state S under module version V1, the upgrade to V2 produces a state S' that is semantically equivalent through the defined code_change callback. This theorem prevents the most common class of deployment failures: state corruption during live upgrades on the [BEAM](@/glossary/beam.md) virtual machine.

**Theorem 2: Migration Consistency** -- Guarantees that database migrations are idempotent and reversible. For any migration M applied to schema S, the proof establishes that applying M twice yields the same result as applying it once, and that the reverse migration M' restores S exactly. This protects [PostgreSQL](@/glossary/postgresql.md) schema integrity during deployment and rollback sequences.

**Theorem 3: Supervision Stability** -- Proves that [supervision tree](@/glossary/supervision-tree.md) topology remains valid across version transitions. The theorem establishes that child specifications, restart strategies, and shutdown sequences maintain their safety properties when modules are upgraded. This prevents cascading supervisor failures during deployment.

**Theorem 4: Configuration Compatibility** -- Verifies that runtime configuration changes between versions are backward-compatible. The proof establishes that any configuration accepted by version V2 produces valid behavior when fallback to V1 occurs. This eliminates configuration-driven rollback failures.

**Theorem 5: Rollback Completeness** -- Formally proves that any deployment can be fully reversed to restore the previous operational state. The proof covers code, configuration, database schema, and [ETS](@/glossary/ets.md) table state, establishing that rollback is always a total function with no partial failure modes.

## Deployment Pipeline Architecture

The production-deployment-specialist manages a multi-stage deployment pipeline that progresses through formally verified gates before advancing to each subsequent phase.

The pipeline begins with the **Build Verification** stage, where release artifacts are compiled with `--warnings-as-errors`, all quality gates pass, and the Lean4 theorem checker validates safety properties against the specific changeset. The agent rejects any build that fails theorem verification, regardless of test suite results.

The **Staging Deployment** stage deploys the verified artifact to the staging environment (prismatic-staging.fly.dev), executing the full integration test suite against real infrastructure. Health checks verify that all 90+ applications start correctly, supervision trees initialize without errors, and endpoint response times remain within the 250ms page load requirement.

**Canary Release** routes a configurable percentage of production traffic (typically 5-10%) to instances running the new version. The agent monitors error rates, latency percentiles (P50, P95, P99), and application-specific health metrics during a configurable observation window. Any metric deviation beyond established thresholds triggers automatic rollback without human intervention.

**Full Rollout** proceeds only after the canary window completes with all metrics within acceptable ranges. The agent orchestrates a rolling deployment across production instances, maintaining minimum capacity throughout the transition. Post-rollout validation confirms theorem satisfaction against the live production state.

## Hot Code Upgrade Management

Operating on the [BEAM](@/glossary/beam.md) virtual machine, the production-deployment-specialist leverages Erlang's native hot code upgrade capabilities for zero-downtime deployments. The agent generates and validates `appup` and `relup` files that define the precise sequence of module upgrades, state transformations, and supervision tree modifications required for live code replacement.

For each module being upgraded, the agent verifies that a valid `code_change/3` callback exists and that it satisfies Theorem 1 (State Preservation). [Dynamic supervisors](@/glossary/dynamic-supervisor.md) receive special handling -- the agent ensures that dynamically spawned children are compatible with both the old and new module versions during the transition window when both versions coexist in memory. [Circuit breaker](@/glossary/circuit-breaker.md) patterns protect against transient failures during the upgrade window.

## Rollback Automation

The rollback subsystem implements Theorem 5 (Rollback Completeness) as an operational capability. When triggered -- either automatically by health metric deviation or manually by operator command -- the rollback procedure executes a deterministic sequence that restores the previous deployment state completely.

Rollback operations proceed in reverse order: traffic is shifted away from new-version instances, database migrations are reversed (verified by Theorem 2), hot code downgrades are applied (verified by Theorem 1), and configuration is restored to the previous version. The agent maintains a deployment journal that records every state change during the forward deployment, enabling precise reversal without guesswork.

The system distinguishes between fast rollback (code-only changes that can be reversed via hot code downgrade in seconds) and full rollback (changes involving database migrations or infrastructure modifications that require more comprehensive reversal procedures). The agent selects the appropriate rollback strategy based on the changeset composition.

## Health Monitoring Integration

The production-deployment-specialist maintains continuous integration with the platform's [telemetry](@/glossary/telemetry.md) infrastructure throughout all deployment phases. Key health indicators monitored during deployment include application error rates, response latency distributions, memory consumption patterns, message queue depths across GenServer processes, database connection pool utilization, and supervision tree restart frequencies.

Health baselines are established from the pre-deployment steady state and updated continuously during canary observation. The agent applies statistical significance testing to metric deviations, distinguishing genuine regressions from normal variance. This evidence-based approach aligns with the [NO DOUBTS](@/glossary/no-doubts.md) principle -- deployment decisions are driven by measured data rather than assumptions about deployment success.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/deploy staging` | Deploy current build to staging environment | L3+ |
| `/deploy canary` | Initiate canary release to production | L3+ |
| `/deploy rollout` | Proceed to full production rollout | L3+ |
| `/deploy rollback` | Trigger immediate rollback to previous version | L2+ |
| `/deploy status` | Display current deployment state and health metrics | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-gates-specialist](@/agents/quality-gates-specialist.md) | Pre-deployment quality verification and gate enforcement |
| [performance-profiling-agent](@/agents/performance-profiling-agent.md) | Post-deployment performance regression detection |
| [blue-drift-detector](@/agents/blue-drift-detector.md) | Configuration and behavioral drift monitoring during rollout |
| [pvm-executor](@/agents/pvm-executor.md) | Runtime execution environment preparation for deployment targets |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Deployment health [metrics](@/glossary/metrics.md) and canary monitoring |
| [AIAD](@/glossary/aiad.md) [Registry](@/glossary/registry-otp.md) | Agent specification, version tracking, and deployment coordination |
| Fly.io Infrastructure | Target deployment platform with rolling update orchestration |
| GitLab CI/CD | Build artifact production and pipeline gate integration |

## Enforcement

All deployment operations are governed by the [NO MERCY](@/glossary/no-mercy.md) doctrine with zero tolerance for incomplete or unverified deployments. Every release must satisfy all five Lean4 safety theorems, pass the complete quality gate battery, and demonstrate acceptable health metrics during canary observation before receiving authorization for full rollout. The [Trinity Gate](@/glossary/trinity-gate.md) validates deployment safety claims through structural consistency (deployment graph validity), logical consistency (theorem satisfaction), and formal necessity (Lean4 proof verification). Rollback capability is verified before every forward deployment -- no deployment proceeds without a proven path to safe reversal.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)