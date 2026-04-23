+++
title = "Nuclear Cache Invalidation Specialist"
weight = 277
[extra]
domain = "tactical"
level = "L3"
description = "Specialized agent for resolving phantom violations through strategic cache invalidation across compilation, analysis, and runtime caches"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Nuclear", "Cache", "Invalidation", "Specialist", "Specialized", "agents", "agent", "Prismatic Platform", "Step", "Credo"]
tags = ["agents", "agent", "nuclear-cache-invalidation-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Nuclear Cache Invalidation Specialist - Prismatic Platform"
+++

## Overview

The Nuclear Cache Invalidation Specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's tactical domain, specializing in the identification and resolution of phantom violations caused by stale cache state across the platform's compilation, analysis, and runtime infrastructure. In a large-scale Elixir [umbrella application](@/glossary/umbrella-application.md) with 90+ applications and thousands of modules, cache coherency is a persistent challenge: compilation caches (_build directory), Dialyzer persistent lookup tables (PLTs), Credo analysis caches, and [ETS](@/glossary/ets.md) runtime state can all become stale in ways that produce false-positive violations -- quality check failures that appear real but are actually artifacts of inconsistent cache state.

The "nuclear" designation reflects this agent's authority to perform complete cache invalidation when surgical approaches are insufficient. Built on the [AIAD](@/glossary/aiad.md) standard, the specialist distinguishes between three invalidation strategies: **surgical invalidation** (clearing specific cache entries that are identified as stale), **targeted invalidation** (clearing cache segments related to modified code), and **nuclear invalidation** (complete destruction and rebuild of all cache layers). The [NO DOUBTS](@/glossary/no-doubts.md) principle governs invalidation decisions: caches are never invalidated speculatively, but phantom violations are never tolerated once identified.

## Theoretical Foundations

Cache invalidation is famously one of the hardest problems in computer science (attributed to Phil Karlton). In multi-layer cache architectures, the problem is compounded by dependency chains between caches: a change in source code should invalidate the compilation cache, which should invalidate the Dialyzer PLT, which should invalidate type-dependent analysis results. When these invalidation chains break -- due to incremental compilation bugs, filesystem timestamp inconsistencies, or interrupted builds -- phantom violations emerge.

The specialist's theoretical framework models the platform's cache architecture as a directed acyclic graph (DAG) of cache dependencies. Source files sit at the DAG's root, compilation artifacts depend on source files, analysis artifacts (Dialyzer PLTs, Credo results) depend on compilation artifacts, and runtime state depends on all preceding layers. The invalidation algorithm traverses this DAG forward from the point of detected staleness, invalidating all downstream caches that depend on the stale entry.

The decision between surgical, targeted, and nuclear invalidation is based on the staleness detection confidence and the blast radius calculation. When the specific stale entry can be identified with high confidence and its downstream dependencies are bounded, surgical invalidation is preferred. When the staleness is known to exist in a region but cannot be precisely localized, targeted invalidation clears the region. When staleness evidence is ambiguous or spans multiple cache layers, nuclear invalidation provides guaranteed resolution at the cost of full rebuild time.

## Operational Domain

The tactical domain for cache invalidation covers all caching layers in the platform's development and deployment pipeline. The **compilation cache** (_build directory) stores compiled .beam files that are reused during incremental compilation. The **Dialyzer PLT** stores persistent type analysis results that accelerate subsequent Dialyzer runs. The **Credo cache** stores code analysis results for unchanged files. The **runtime caches** include [ETS](@/glossary/ets.md) tables, agent state caches, and application-level memoization.

The specialist monitors quality gate outputs for patterns that indicate phantom violations: quality check failures that disappear after a clean rebuild, failures that contradict the source code (reporting violations in code that does not exhibit the reported pattern), and failures that appear only in specific build configurations. These patterns trigger investigation into cache coherency.

## Key Capabilities

- **Phantom violation detection** -- Identifies quality check failures that are artifacts of stale cache state rather than genuine code issues, using pattern matching against known phantom violation signatures and contradiction analysis between violation reports and source code
- **Cache dependency analysis** -- Models the complete cache dependency DAG for the platform, tracing invalidation implications from source changes through compilation, analysis, and runtime cache layers
- **Surgical cache invalidation** -- Precisely invalidates specific cache entries identified as stale, minimizing rebuild cost while resolving the phantom violation
- **Targeted cache invalidation** -- Clears cache segments associated with modified applications or modules when surgical precision is insufficient but full nuclear invalidation is disproportionate
- **Nuclear cache invalidation** -- Performs complete destruction and rebuild of all cache layers when staleness is widespread or cannot be precisely localized, executing the canonical `rm -rf _build/dev/lib/<app>/ebin && rm -rf priv/plts/dialyzer.plt` sequence
- **Post-invalidation verification** -- Runs quality gates after cache invalidation to confirm that phantom violations are resolved and no new genuine violations were masked by the stale cache
- **Invalidation history tracking** -- Records all cache invalidation events with triggers, scope, resolution status, and rebuild costs, enabling pattern analysis for recurring cache coherency issues
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed cache monitoring and automatic invalidation when phantom violation patterns are detected
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing cache metrics including invalidation frequency, phantom violation detection rates, rebuild times, and cache hit ratios

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to invalidate any cache layer across the platform, trigger full rebuilds, and enforce quality gate re-evaluation after invalidation.

## Invalidation Decision Framework

The specialist applies a decision tree to determine the appropriate invalidation strategy. **Step 1**: Detect anomalous quality gate output (failure pattern matching phantom signatures). **Step 2**: Correlate failure with recent source changes to identify potentially stale cache entries. **Step 3**: Assess staleness confidence (high = surgical, medium = targeted, low = nuclear). **Step 4**: Calculate blast radius (number of downstream dependencies affected). **Step 5**: Select strategy based on confidence-vs-blast-radius matrix. **Step 6**: Execute invalidation. **Step 7**: Verify resolution through quality gate re-execution.

The confidence-vs-blast-radius matrix prioritizes cost-effectiveness: high-confidence narrow-scope situations warrant surgical intervention, while low-confidence wide-scope situations warrant nuclear intervention. Intermediate cases use targeted invalidation as the balanced approach.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/cache invalidate surgical` | Perform surgical invalidation of specified cache entries | L3+ |
| `/cache invalidate targeted` | Clear cache segments for specified applications or modules | L3+ |
| `/cache invalidate nuclear` | Execute full nuclear cache invalidation and rebuild | L3+ |
| `/cache status` | Display cache health metrics with staleness indicators | L3+ |
| `/cache history` | Show invalidation history with trigger analysis | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality gate failures trigger phantom violation investigation |
| [performance-benchmarking-agent](@/agents/performance-benchmarking-agent.md) | Benchmarks cache rebuild costs to inform invalidation strategy selection |
| [session-debrief-specialist](@/agents/session-debrief-specialist.md) | Invalidation events and phantom violation patterns are captured in session context |
| [neuroevolution-coordinator](@/agents/neuroevolution-coordinator.md) | Evolutionary processes may trigger cache invalidation when agent code evolves |

## Known Phantom Violation Patterns

The specialist maintains a library of recognized phantom violation signatures. **Type mismatch phantoms** occur when Dialyzer PLT retains type signatures for modules whose types have changed. **Dead code phantoms** appear when compilation cache retains .beam files for deleted modules. **Empty check phantoms** emerge when Credo analysis cache reports violations in code that has been refactored. **Timer replacement phantoms** occur when runtime ETS state references timer configurations that have been updated. Each pattern has a documented invalidation recipe that specifies the minimum cache scope requiring invalidation.

## Enforcement

Cache invalidation follows the [NO MERCY](@/glossary/no-mercy.md) doctrine: phantom violations are never accepted as "known issues," every detected phantom triggers investigation and resolution, and invalidation scope is never restricted by rebuild cost considerations when quality integrity is at stake. The [NO DOUBTS](@/glossary/no-doubts.md) principle ensures that invalidation decisions are evidence-based, and post-invalidation verification confirms that resolution was achieved. The [Trinity Gate](@/glossary/trinity-gate.md) validates that invalidation operations maintain structural cache consistency across all layers.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)