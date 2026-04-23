+++
title = "architecture-review-specialist"
weight = 40
[extra]
domain = "quality-assurance"
level = "L3"
description = "Deep structural analysis of platform architecture"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "otp", "ets"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["architecture-review-specialist", "Deep", "agents", "agent", "Prismatic Platform", "The Architecture", "Review Specialist"]
tags = ["agents", "agent", "architecture-review-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "architecture-review-specialist - Prismatic Platform"
+++

## Overview

The Architecture Review Specialist operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Quality Assurance domain of the Prismatic Platform. This agent performs deep structural analysis of the platform's architecture, evaluating module dependencies, [supervision tree](/glossary/supervision-tree/) topology, process communication patterns, and domain boundary integrity. Every architectural change that affects the platform's structural properties passes through this agent's review pipeline before reaching production.

Architectural quality in a 90-application umbrella project demands continuous structural vigilance. The Architecture Review Specialist identifies anti-patterns such as circular dependencies between [umbrella application](/glossary/umbrella-application/)s, improper process topology that bypasses supervision trees, direct [ETS](/glossary/ets/) access from modules that should use storage adapters, and domain boundary violations where business logic leaks across application boundaries. This analysis goes beyond static code review to evaluate the runtime characteristics of the architecture under load, ensuring that structural decisions remain sound when the system operates at scale.

The agent's review methodology draws from established architectural analysis frameworks adapted for the [BEAM](/glossary/beam/) virtual machine and [OTP](/glossary/otp/) design principles. Unlike architecture review in conventional imperative language ecosystems, OTP architecture review must evaluate process topology, message passing patterns, supervision strategies, and the interplay between functional purity and stateful process boundaries. The Architecture Review Specialist encodes these OTP-specific concerns into its review protocols, ensuring that the platform's architecture exploits the BEAM's concurrency model rather than fighting it.

## Operational Domain

The Quality Assurance domain ensures that all platform components meet the Prismatic Platform's quality standards across compilation, static analysis, test coverage, and architectural integrity. The Architecture Review Specialist focuses specifically on structural quality, ensuring that the platform's modular architecture remains clean, maintainable, and aligned with OTP best practices as the codebase grows.

Within this domain, architectural review occupies a unique position: it evaluates properties that emerge from the interactions between components rather than properties of individual components. A module may compile cleanly, pass all tests, and satisfy Credo checks while still introducing an architectural anti-pattern that degrades the system's overall structural health. The Architecture Review Specialist catches these emergent structural issues that component-level quality tools cannot detect.

## Key Capabilities

- **Dependency graph analysis** that maps inter-application dependencies across the umbrella project, detecting circular references, unnecessary couplings, and opportunities for module extraction. The analysis operates on both compile-time dependencies (module references, behavior implementations) and runtime dependencies (process communication, registry lookups, ETS table access).

- **Supervision tree topology review** ensuring every stateful process has proper supervision, restart strategies are correctly configured, and process hierarchies follow OTP conventions. The review validates that supervision trees maintain the "let it crash" philosophy without creating restart storms or orphaned processes.

- **Domain boundary validation** that verifies business logic stays within its designated umbrella application, identifying cross-domain leakage and suggesting proper API boundary placement. This includes detecting cases where internal module functions are called directly across application boundaries instead of going through documented public APIs.

- **Pattern compliance checking** against established platform patterns including [CASCADE pattern](/glossary/cascade-pattern/)s, storage adapter contracts, and [GenServer](/glossary/genserver/) implementation standards. Each pattern has formal compliance criteria that the reviewer evaluates mechanically rather than relying on subjective judgment.

- **Architectural debt quantification** that measures structural quality [metrics](/glossary/metrics/) and tracks improvement trends across platform evolution generations. Debt is expressed in concrete terms: number of circular dependencies, count of boundary violations, depth of improper coupling chains.

- **Runtime architecture analysis** evaluating how the static code structure translates into runtime process topologies, message flow patterns, and resource utilization profiles under representative workloads.

## Review Methodology

The Architecture Review Specialist follows a structured four-phase review methodology that produces actionable, evidence-based assessments.

**Phase 1: Static Structure Analysis.** The reviewer ingests the platform's module dependency graph, computed from compile-time references across all 90 umbrella applications. This graph is analyzed for topological properties: strongly connected components (indicating circular dependencies), hub modules with excessive fan-in or fan-out (indicating improper abstraction boundaries), and orphan modules with no dependents (indicating dead code or missing integration).

**Phase 2: Process Topology Mapping.** The reviewer maps the platform's supervision tree hierarchy from application supervisors down to leaf worker processes. Each supervision strategy (one-for-one, one-for-all, rest-for-one) is evaluated against the semantics of its child processes. Worker processes are classified by their state management approach (GenServer state, ETS tables, external stores) and their failure domain isolation properties.

**Phase 3: Domain Boundary Audit.** The reviewer traverses cross-application function calls and process interactions, verifying that each interaction crosses domain boundaries through properly defined API surfaces. Direct internal module access, unauthorized ETS table reads, and undocumented process registry lookups are flagged as boundary violations.

**Phase 4: Compliance Synthesis.** Results from all three preceding phases are synthesized into an architectural compliance report that scores the reviewed changes against the platform's structural quality baseline. Regressions are blocked, improvements are recorded, and neutral changes are documented for trend analysis.

## Architectural Anti-Pattern Detection

The Architecture Review Specialist maintains a catalog of OTP-specific anti-patterns that it actively detects across the codebase.

| Anti-Pattern | Detection Method | Severity |
|-------------|-----------------|----------|
| Circular umbrella dependencies | Tarjan's SCC algorithm on module graph | Critical |
| Supervisor bypass | Process spawn without supervisor registration | Critical |
| ETS direct access | Cross-application ETS table reads | High |
| Domain boundary violation | Internal module function calls across apps | High |
| God process | GenServer with excessive state or responsibilities | Medium |
| Synchronous bottleneck | GenServer.call chains creating blocking paths | Medium |
| Missing circuit breaker | External service calls without timeout/fallback | Medium |
| Over-supervision | Unnecessary supervision layers adding latency | Low |

Each detected anti-pattern includes the specific code locations, the structural impact assessment, and a recommended remediation approach. Critical anti-patterns block merge operations until resolved.

## Integration with Quality Gates

The Architecture Review Specialist integrates directly with the platform's [quality gates](/glossary/quality-gates/) pipeline. Architectural review is one of several quality dimensions that must pass before any change reaches production. The review produces structured findings that feed into the `mix quality.gates` pipeline alongside compilation warnings, Credo violations, test coverage gaps, and [Dialyzer](/glossary/dialyzer/) type analysis results.

The integration operates through [telemetry](/glossary/telemetry/) events emitted under the `[:prismatic, :architecture, :review, *]` namespace, enabling real-time monitoring of architectural quality trends. Events include review initiation, anti-pattern detection, boundary violation discovery, and compliance score computation. These events feed into the platform's quality dashboards and are consumed by the [Quality Floor Guardian](/glossary/quality-floor-guardian/) for trend analysis.

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command. The Architecture Review Specialist has authority to block merges, request refactoring, and escalate structural concerns to the architecture decision authority.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [architecture-decision-specialist](/agents/architecture-decision-specialist/) | Decision Authority | Receives architectural decisions and validates structural impact |
| [code-review-specialist-agent-v20](/agents/code-review-specialist-agent-v20/) | Review Partner | Coordinates code-level review with architectural-level analysis |
| [cross-domain-quality-propagator](/agents/cross-domain-quality-propagator/) | Quality Propagator | Ensures architectural standards propagate across all domains |
| [cascade-quality-specialist](/agents/cascade-quality-specialist/) | Pattern Elimination | Coordinates CASCADE pattern detection with structural anti-pattern analysis |

## Performance Metrics

The Architecture Review Specialist tracks effectiveness through quantitative structural quality indicators.

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Circular dependency count | 0 | 0 | No circular references between umbrella applications |
| Domain boundary violations | 0 | 0 | No cross-domain leakage through internal APIs |
| Supervision coverage | 100% | 100% | Every stateful process under proper supervision |
| Review throughput | < 30s | < 60s | Time to complete structural analysis per review |
| Anti-pattern detection rate | > 98% | > 95% | Percentage of known anti-patterns detected |

## Enforcement

All architectural reviews are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Architectural anti-patterns identified during review must be resolved before merge. No circular dependency may be introduced between umbrella applications. Every new application must have a documented supervision tree and clearly defined domain boundaries. Architectural changes that degrade structural quality metrics are blocked at the quality gate with zero exceptions. The [Trinity Gate](/glossary/trinity-gate/) validates that architectural modifications maintain structural consistency, logical consistency across the dependency graph, and formal correctness of supervision strategies before any structural change is accepted into the platform baseline.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)