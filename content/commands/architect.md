+++
title = "/architect"
weight = 810
[extra]
category = "Architecture"
description = "Architecture design and recommendation generation"
syntax = "/architect [options]"
authority = "L3"
agent = "architecture-analyst"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1517
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["architect", "Architecture", "commands", "Prismatic Platform", "Analysis", "Phase", "System"]
tags = ["commands", "architecture", "architect", "prismatic"]
quality_score = 90
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/architect - Prismatic Platform"
+++

## Overview

The **/architect** command provides comprehensive architectural analysis and design recommendation generation for the Prismatic Platform. As the primary entry point for architecture-level decision making, this command enables developers and system designers to perform deep structural analysis of individual components, services, or the entire platform, producing actionable insights in the form of reports, Architecture Decision Records (ADRs), and system diagrams.

Architecture is the skeleton upon which all other platform capabilities depend. Without deliberate, well-documented architectural decisions, systems inevitably accumulate structural debt that compounds over time. The /architect command addresses this challenge by automating the analytical process that typically requires senior engineering effort, synthesizing knowledge from the platform's [AIAD](/glossary/aiad/) agent ecosystem, code structure analysis, dependency graphs, and established architectural patterns to produce recommendations that are both evidence-based and immediately actionable.

Within the Prismatic Platform's 216-command [registry](/glossary/registry-otp/), /architect occupies the Architecture category alongside related structural analysis tools. It operates at the L3 authority level, granting it sufficient permissions to read across all application boundaries, inspect supervision trees, analyze inter-process communication patterns, and generate formal architectural artifacts. The command is executed by the `architecture-analyst` agent, a specialist in structural evaluation, pattern recognition, and design trade-off analysis.

The command's analytical capability extends beyond static code analysis. By leveraging the BEAM VM's introspection capabilities, /architect can examine running supervision trees, process communication topologies, and message-passing patterns that are invisible in source code alone. This runtime awareness distinguishes the command from conventional architecture analysis tools that operate solely on source code artifacts.

## Syntax and Usage

```bash
/architect [scope] [depth] [output]
```

The command accepts a required scope parameter that determines the breadth of analysis, with optional depth and output format modifiers.

### Complete System-Wide Architecture Analysis

```bash
/architect system
```

### Detailed Analysis of a Specific Service

```bash
/architect service payment-service detailed
```

### Comprehensive Component Analysis with ADR Output

```bash
/architect component api-gateway comprehensive adr
```

### High-Level Overview for Architecture Review Meetings

```bash
/architect system high-level report
```

### Generate Architecture Diagram for the Storage Layer

```bash
/architect service prismatic-storage detailed diagram
```

### Cross-Application Dependency Analysis

```bash
/architect system comprehensive report --focus dependencies
```

## Parameters and Options

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **scope** | string | Yes | - | Architecture scope to analyze: `system` (full platform), `service` (individual app), or `component` (specific module) |
| **depth** | string | No | `detailed` | Analysis depth: `high-level` (executive summary), `detailed` (standard analysis), or `comprehensive` (exhaustive deep-dive) |
| **output** | string | No | `report` | Output format: `report` (markdown document), `adr` (Architecture Decision Record), or `diagram` (visual representation) |
| **--focus** | string | No | `all` | Analysis focus area: `dependencies`, `coupling`, `cohesion`, `patterns`, `all` |
| **--app** | string | No | - | Target specific umbrella application (for service scope) |
| **--include-runtime** | boolean | No | `false` | Include runtime process topology analysis |
| **--format** | string | No | `markdown` | Document format: `markdown`, `json`, `html` |

The scope parameter determines the breadth of analysis. System scope examines the entire 90-application umbrella, identifying cross-cutting concerns, dependency hotspots, and architectural patterns that emerge at scale. Service scope focuses on a single umbrella application, analyzing its internal structure, supervision tree, and external interfaces. Component scope drills into a specific module or module group within an application.

## Implementation Architecture

The /architect command follows a five-phase execution workflow that progressively builds a comprehensive architectural understanding before generating its output artifacts. Internally, the command leverages the platform's Git Trees infrastructure for rapid codebase traversal and the AIAD agent registry for accessing domain-specific knowledge.

```elixir
defmodule Prismatic.Commands.Architect do
  @moduledoc """
  Comprehensive architectural analysis and design recommendation generation.
  Operates at L3 authority with full cross-application read access.
  """

  @spec execute(scope :: String.t(), opts :: keyword()) :: {:ok, ArchitectureReport.t()} | {:error, term()}
  def execute(scope, opts \\ []) do
    depth = Keyword.get(opts, :depth, "detailed")
    output = Keyword.get(opts, :output, "report")

    with {:ok, topology} <- analyze_topology(scope),
         {:ok, dependencies} <- map_dependencies(scope),
         {:ok, patterns} <- detect_patterns(topology, dependencies),
         {:ok, recommendations} <- generate_recommendations(patterns, depth),
         {:ok, artifact} <- format_output(recommendations, output) do
      {:ok, artifact}
    end
  end
end
```

**Phase 1 -- Topology Analysis**: Maps the supervision tree structure, process relationships, and message-passing patterns within the specified scope. For system scope, this produces a complete map of all 90+ applications and their interconnections. The topology analysis uses both static analysis (module references, alias chains, import graphs) and optional runtime analysis (process links, registered names, ETS table ownership) to build a comprehensive structural model.

**Phase 2 -- Dependency Mapping**: Builds a dependency graph covering both compile-time module dependencies and runtime process interactions. The graph distinguishes between hard dependencies (compile-time references that prevent compilation without the target), soft dependencies (runtime lookups that degrade gracefully), and optional dependencies (features that are available only when certain applications are present). Circular dependency detection is built into this phase.

**Phase 3 -- Pattern Detection**: Applies pattern detection algorithms to identify architectural patterns and anti-patterns against the platform's established pattern library of 55+ patterns. Detection operates at multiple granularities: module-level (GenServer patterns, Supervisor strategies), application-level (facade patterns, adapter patterns), and system-level (microservice boundaries, shared-nothing architecture). Anti-patterns such as God modules, circular dependencies, and leaky abstractions are flagged with severity ratings.

**Phase 4 -- Recommendation Synthesis**: Synthesizes findings into prioritized recommendations with trade-off analysis. Each recommendation includes the evidence that triggered it, the expected benefit of implementing it, the estimated effort, and potential risks. Recommendations are categorized as structural (refactoring needed), operational (configuration change), or strategic (architectural direction change).

**Phase 5 -- Output Formatting**: Formats the analysis into the requested artifact type. Reports include executive summaries, detailed findings, and appendices with raw data. ADRs follow the platform's established ADR template with context, decision, consequences, and status sections. Diagrams are generated as Mermaid markup compatible with the platform's rendering pipeline.

## Examples

### Pre-Refactoring Impact Analysis

```bash
/architect service prismatic_storage_ets comprehensive report
```

Before refactoring a storage adapter, this comprehensive analysis reveals all consumers of the adapter's public API, internal coupling between modules, supervision tree structure, and process communication patterns. The report identifies which changes will require updates in downstream applications and which interfaces are safely encapsulated.

### Architecture Decision Record for New Service

```bash
/architect component PrismaticPerimeter.SecurityRating comprehensive adr
```

When adding a new capability like security ratings, generating an ADR captures the architectural context, alternatives considered, and rationale for the chosen approach. The ADR is committed to `docs/architecture/` as a permanent record.

### System Health Check

```bash
/architect system high-level report --include-runtime
```

A periodic system-level analysis with runtime data provides a current-state overview that identifies emerging architectural drift, dependency accumulation, and coupling increases before they become critical debt.

## Integration with Platform

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `architecture-analyst` agent with cross-domain knowledge |
| AIAD Registry | Command specification, discovery, and version management |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation ensuring architectural standards |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and event tracking |
| Git Trees | Rapid codebase traversal for dependency analysis (~100x faster than filesystem) |
| Supervision Trees | OTP supervision hierarchy inspection for topology mapping |
| SEADF Framework | Scanner subsystem integration for ecosystem-wide analysis |
| Quality DNA | Architecture quality metrics persisted across sessions |
| [/pattern](/commands/pattern/) | Pattern library consulted for pattern detection |
| [/analyze](/commands/analyze/) | Complementary analysis with different focus areas |

The architecture-analyst agent coordinates with domain-specific agents when analyzing applications outside its primary expertise. For example, when analyzing the Perimeter module's security architecture, it consults the security specialist agent for domain-specific pattern evaluation.

## Workflow Integration

The /architect command is most effective when used at specific points in the development lifecycle:

1. **Pre-Implementation Analysis**: Run before starting a new feature to understand the current landscape. `/architect system high-level` provides context that informs design decisions and prevents accidental duplication or architectural conflicts.

2. **Post-Refactoring Validation**: Verify that refactoring preserved or improved architectural quality. Compare pre-refactoring and post-refactoring reports to quantify the structural improvement achieved.

3. **Architecture Review Preparation**: Generate reports for scheduled architecture review meetings. The `diagram` output format is particularly effective for visual communication of structural relationships.

4. **Dependency Audit**: Identify circular dependencies, coupling hotspots, and unnecessary cross-application references. The dependency graph produced by system-scope analysis reveals the true coupling structure of the platform.

5. **ADR Maintenance**: When the analysis reveals a decision point, use the `adr` output format to create a permanent record that captures the context, options, and rationale. ADRs generated by /architect include empirical data from the analysis, not just subjective reasoning.

6. **CI/CD Integration**: Architecture reports can be generated automatically on pull requests that modify critical application boundaries, ensuring that structural changes receive appropriate review before merging.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Architectural analysis is exhaustive. No dependencies are overlooked, no coupling is ignored, no anti-patterns are tolerated. Reports that fail to meet completeness thresholds are rejected and re-generated. The command enforces zero tolerance for incomplete analysis results.
- **NO DOUBTS**: Every recommendation is backed by evidence from the codebase. Pattern detections include file paths, line numbers, and concrete examples. Trade-off analyses present both sides with quantified metrics. The command never produces speculative recommendations without supporting data.

NABLA axiom compliance is enforced throughout the analysis pipeline:

| Axiom | Enforcement |
|-------|-------------|
| **Signal Plurality** | Recommendations require at least two independent sources of evidence |
| **Contradiction Preservation** | Conflicting architectural pressures surfaced rather than suppressed |
| **Provenance Mandatory** | Every finding traceable to specific files, modules, and line numbers |
| **Time Decay** | Analysis includes modification timestamps; stale components flagged |
| **Source Independence** | Static analysis, runtime analysis, and pattern detection operate independently |

Architectural claims pass through the Trinity Gate verification system before being included in reports. Claims that fail any gate are downgraded from "established" to "observed" with the failing gate identified.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Component scope analysis | < 30s | ~10s |
| Service scope analysis | < 2min | ~45s |
| System scope (high-level) | < 5min | ~2min |
| System scope (comprehensive) | < 15min | ~8min |
| Dependency graph construction | < 60s | ~20s (Git Trees) |
| Pattern detection | < 30s per app | ~10s per app |
| ADR generation | < 10s | ~3s |
| Diagram generation | < 5s | ~2s |

The command leverages Git Trees for file discovery, achieving approximately 100x faster enumeration compared to filesystem scanning. For system-scope analyses, the five phases are pipelined where possible, with dependency mapping beginning before topology analysis completes for applications that have been fully scanned.

## Related Commands

- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/cascade](/commands/cascade/) - Execute [CASCADE pattern](/glossary/cascade-pattern/) fix for systematic anti-pattern removal
- [/benchmark](/commands/benchmark/) - Comprehensive performance benchmarking with P95/P99 analysis
- [/pattern](/commands/pattern/) - AI pattern lookup and pattern library access

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)