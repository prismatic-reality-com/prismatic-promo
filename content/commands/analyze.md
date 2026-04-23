+++
title = "/analyze"
weight = 800
[extra]
category = "Architecture"
description = "System architecture analysis with dependency mapping"
syntax = "/analyze [options]"
authority = "L3"
agent = "architecture-analyst"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1175
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["analyze", "System", "commands", "Architecture", "Prismatic Platform", "Analysis"]
tags = ["commands", "architecture", "analyze", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/analyze - Prismatic Platform"
+++

## Overview

The **/analyze** command provides deep system architecture analysis with comprehensive dependency mapping for the Prismatic Platform. As an [Elixir](@/glossary/elixir.md)/OTP umbrella application comprising over 100 applications, understanding the dependency relationships, module boundaries, and architectural patterns across the codebase is essential for maintaining system integrity and planning architectural evolution. The `/analyze` command delivers this understanding through automated static analysis, dependency graph construction, and pattern recognition across the entire platform.

The command goes beyond simple dependency listing. It constructs a complete architectural model of the system, identifying circular dependencies, coupling hotspots, module boundary violations, and architectural drift from intended design patterns. In an OTP application, where supervision trees, GenServer hierarchies, and inter-application message flows define the runtime architecture, static code analysis alone is insufficient. The `/analyze` command combines static analysis of module dependencies with OTP-aware analysis that understands supervision tree topology, process communication patterns, and application startup order dependencies.

Operating at the L3 (Strategic) authority level, the command is executed by the `architecture-analyst` agent. This elevated authority level reflects the command's access to cross-application analysis capabilities and its role in informing architectural decisions that affect the entire platform. The agent brings expertise in [Elixir](@/glossary/elixir.md)/OTP architectural patterns, distributed systems design, and the Prismatic Platform's specific architectural conventions to produce analysis outputs that are both technically precise and architecturally meaningful.

## Usage

```bash
/analyze [TARGET] [OPTIONS]
```

### Full Platform Architecture Analysis

```bash
/analyze
```

### Analyze a Specific Application's Dependencies

```bash
/analyze prismatic_storage_core --depth 3
```

### Dependency Graph Generation

```bash
/analyze --graph --output deps.dot
```

### Circular Dependency Detection

```bash
/analyze --circular --verbose
```

### Cross-Application Coupling Analysis

```bash
/analyze --coupling --threshold 5
```

## Options and Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target` | string | all | Application or module to analyze (omit for full platform) |
| `--depth` | integer | `2` | Dependency traversal depth (1-5) |
| `--graph` | boolean | `false` | Generate visual dependency graph |
| `--output` | string | -- | Output file path for graph or report |
| `--circular` | boolean | `false` | Detect circular dependencies |
| `--coupling` | boolean | `false` | Analyze cross-application coupling |
| `--threshold` | integer | `10` | Minimum coupling score to report |
| `--verbose` | boolean | `false` | Include detailed per-module analysis |
| `--format` | string | `text` | Output format: `text`, `json`, `dot`, `mermaid` |
| `--include-tests` | boolean | `false` | Include test files in analysis |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L3 (Strategic) |
| **Executing Agent** | `architecture-analyst` |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Architecture |
| **Classification** | Strategic Analysis |
| **Scope** | Cross-application, full umbrella visibility |
| **Analysis Target** | 100+ umbrella applications, 6,600+ .ex files |
| **Output Formats** | Text, JSON, DOT (Graphviz), Mermaid |

## Technical Implementation

The `/analyze` command constructs its architectural model through a multi-phase analysis pipeline. The first phase uses `mix xref` and custom AST traversal to build a complete module dependency graph. The second phase overlays OTP supervision tree information extracted from Application module callbacks. The third phase applies architectural pattern recognition rules to identify violations and drift. The implementation leverages the platform's Git Trees infrastructure for efficient file discovery across the 37,000+ file codebase.

```elixir
defmodule PrismaticArchitecture.Analyzer do
  @moduledoc """
  System architecture analyzer with dependency mapping,
  circular dependency detection, and coupling analysis.
  Operates across the full umbrella application ecosystem.
  """

  alias PrismaticArchitecture.{DependencyGraph, CouplingAnalyzer, PatternDetector}

  @spec analyze(keyword()) :: {:ok, map()} | {:error, term()}
  def analyze(opts \\ []) do
    target = Keyword.get(opts, :target, :all)
    depth = Keyword.get(opts, :depth, 2)

    with {:ok, modules} <- discover_modules(target),
         {:ok, dep_graph} <- DependencyGraph.build(modules, depth: depth),
         {:ok, coupling} <- CouplingAnalyzer.analyze(dep_graph),
         {:ok, patterns} <- PatternDetector.detect(dep_graph, coupling) do
      {:ok, %{
        modules: length(modules),
        dependencies: DependencyGraph.edge_count(dep_graph),
        circular: DependencyGraph.find_cycles(dep_graph),
        coupling_hotspots: CouplingAnalyzer.hotspots(coupling),
        pattern_violations: patterns.violations,
        recommendations: generate_recommendations(dep_graph, coupling, patterns)
      }}
    end
  end

  @spec analyze_circular(keyword()) :: {:ok, [list()]}
  def analyze_circular(opts \\ []) do
    with {:ok, modules} <- discover_modules(Keyword.get(opts, :target, :all)),
         {:ok, dep_graph} <- DependencyGraph.build(modules) do
      cycles = DependencyGraph.find_cycles(dep_graph)
      {:ok, cycles}
    end
  end

  defp discover_modules(:all) do
    modules =
      :code.all_loaded()
      |> Enum.filter(fn {mod, _} -> prismatic_module?(mod) end)
      |> Enum.map(fn {mod, _} -> mod end)

    {:ok, modules}
  end

  defp discover_modules(app) when is_atom(app) do
    case Application.spec(app, :modules) do
      nil -> {:error, {:app_not_found, app}}
      modules -> {:ok, modules}
    end
  end

  defp generate_recommendations(dep_graph, coupling, patterns) do
    []
    |> maybe_add_cycle_recommendations(dep_graph)
    |> maybe_add_coupling_recommendations(coupling)
    |> maybe_add_pattern_recommendations(patterns)
    |> Enum.sort_by(& &1.priority)
  end
end
```

The dependency graph is represented as a directed graph using Erlang's `:digraph` module, providing efficient cycle detection through Tarjan's strongly connected components algorithm. Coupling analysis computes afferent and efferent coupling metrics for each application, identifying modules that are either excessively depended upon (high afferent coupling) or dependent on too many other modules (high efferent coupling). Pattern detection applies a library of architectural anti-patterns specific to OTP applications, including God supervisors, process bottlenecks, and layer violation patterns.

Output can be generated in multiple formats. The text format provides human-readable summaries suitable for terminal display. JSON format enables integration with CI/CD pipelines and automated reporting tools. DOT format produces Graphviz-compatible dependency graphs for visual analysis. Mermaid format generates diagrams embeddable in documentation and ADRs.

## Workflow Integration

The `/analyze` command occupies a central position in the platform's architectural governance workflow. It is invoked in three primary contexts. First, during architectural reviews and design sessions, where the full analysis provides a shared understanding of current system structure. Second, as part of the CI/CD pipeline, where circular dependency detection and coupling threshold checks act as architectural quality gates. Third, during refactoring campaigns, where before-and-after analysis demonstrates the architectural impact of changes.

The command integrates naturally with the [/adr](@/commands/adr.md) command. When the analysis reveals architectural issues, operators create ADRs documenting the identified problem, the proposed resolution, and the expected improvement in analysis metrics. This creates a traceable link between automated analysis findings and architectural decisions.

For large-scale refactoring efforts, the `--format json` output enables scripted analysis that tracks coupling metrics and dependency counts over time. Teams can establish architectural fitness functions that monitor these metrics and alert when they drift beyond acceptable thresholds.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `architecture-analyst` agent |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Architecture analysis feeds quality gate assessments |
| [Telemetry](@/glossary/telemetry.md) | Analysis execution [metrics](@/glossary/metrics.md) and event tracking |
| [/adr](@/commands/adr.md) | Analysis findings documented as Architecture Decision Records |
| [/architect](@/commands/architect.md) | Architecture design recommendations informed by analysis |
| [/refactor](@/commands/refactor.md) | Refactoring campaigns guided by analysis outputs |
| Git Trees | High-performance file discovery for 37,000+ file codebase |
| Mix Xref | Underlying Elixir cross-reference analysis tool |
| [Session Context](@/glossary/session-discipline.md) | Analysis results persisted for cross-session reference |

## Doctrine Compliance

All architecture analysis operations are governed by the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Every circular dependency is reported. Every coupling violation above the threshold is surfaced. Architectural anti-patterns are identified without exception or excuse. The analysis does not suppress findings because they are inconvenient or difficult to resolve. Zero tolerance for known architectural violations -- identified issues must be addressed or explicitly accepted via ADR.
- **NO DOUBTS**: All analysis findings are backed by concrete evidence in the form of specific module paths, dependency chains, and coupling metrics. The command does not report suspected issues -- only issues with traceable proof in the codebase. Recommendations are generated from established architectural principles and OTP best practices, not speculation. Each finding includes the specific files and modules involved, enabling immediate verification.

The command also supports the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework through the Provenance Mandatory axiom: every architectural claim produced by the analysis is traceable to specific code paths and dependency relationships.

## Best Practices

1. **Run full analysis before major changes**: Before initiating significant refactoring or new application additions, run `/analyze` to establish a baseline. Compare post-change analysis results to verify that architectural quality improved or at minimum did not degrade.

2. **Monitor circular dependencies continuously**: Circular dependencies in OTP applications can cause startup failures and subtle runtime issues. Run `/analyze --circular` regularly and treat any new cycles as high-priority issues.

3. **Set coupling thresholds for your domain**: Different applications have different acceptable coupling levels. Core applications like `prismatic_storage_core` naturally have high afferent coupling. Set thresholds that are meaningful for each application's role in the architecture.

4. **Generate visual graphs for architecture reviews**: Use `--graph --format mermaid` to generate diagrams that can be embedded in ADRs, documentation, and review discussions. Visual representations make complex dependency relationships accessible to all stakeholders.

5. **Integrate with CI/CD**: Add `/analyze --circular --format json` to the CI/CD pipeline as an architectural quality gate. This prevents new circular dependencies from being introduced and catches coupling violations early.

6. **Combine with ADR documentation**: When analysis reveals issues, document them immediately using [/adr](@/commands/adr.md). This creates an auditable link between automated findings and architectural decisions.

## Related Commands

- [/architect](@/commands/architect.md) - Architecture design and recommendation generation
- [/adr](@/commands/adr.md) - Create and manage Architecture Decision Records
- [/migrate](@/commands/migrate.md) - Safe migration planning with rollback strategies
- [/integrate](@/commands/integrate.md) - Cross-system integration design and implementation
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/3nl](@/commands/3nl.md) - Three-layer neural linguistic processing for deep analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)