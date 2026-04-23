+++
title = "Prismatic Tooling"
weight = 58
[extra]
icon = "wrench-screwdriver"
color = "slate"
description = "Developer tooling - mix tasks, generators, debugging utilities, and platform CLI"
category = "DevOps"
files = "175"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1096
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Tooling", "Developer", "apps", "DevOps", "Prismatic Platform", "Task"]
tags = ["apps", "devops", "prismatic-tooling", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Tooling - Prismatic Platform"
+++

## Overview

Prismatic Tooling provides developer productivity tools that accelerate development across all platform applications. It includes custom [mix task](@/glossary/mix-task.md)s for codebase exploration, code generators for scaffolding new components, debugging utilities for runtime inspection, and the platform CLI for operational control. The tooling module reduces boilerplate, enforces code standards, and ensures that developers can navigate and modify a 90-application umbrella with confidence.

The cornerstone tool is `mix git_trees`, which provides codebase exploration approximately 100x faster than traditional `find` or `ls -R` commands by leveraging Git's internal tree data structures. For a repository with 37,000+ files, this translates to sub-100ms response times for file searches, [pattern matching](@/glossary/pattern-matching.md), and repository statistics -- making it practical to explore the codebase interactively during development.

Code generators ensure that new applications, adapters, and test suites follow established platform patterns. Rather than copying and modifying existing code, generators produce standards-compliant scaffolds with proper [supervision tree](@/glossary/supervision-tree.md)s, [quality DNA](@/glossary/quality-dna.md) files, CLAUDE.md documentation, and test infrastructure pre-configured. This eliminates the "drift" that occurs when manually created components subtly deviate from platform conventions.

## Architecture

```
Prismatic Tooling
+-- Mix Tasks              # Custom mix commands
|   +-- git_trees          # Fast codebase exploration
|   +-- quality.*          # Quality gate validation
|   +-- autoheal.*         # Automatic quality healing
|   +-- autoevolve.*       # Evolution scanning
+-- Generators             # Code scaffolding
|   +-- osint_adapter      # OSINT adapter scaffold
|   +-- storage_adapter    # Storage adapter scaffold
|   +-- app_scaffold       # New application scaffold
+-- Debug Utilities        # Runtime inspection
    +-- sup_tree           # Supervision tree dump
    +-- process_tree       # Process visualization
    +-- ets_browser        # ETS table inspection
```

All mix tasks follow the standard Mix.Task [behaviour](@/glossary/behaviour.md) and integrate with the platform's [telemetry](@/glossary/telemetry.md) system for execution tracking.

## Git Trees: High-Performance Codebase Exploration

The `mix git_trees` tool is the most frequently used developer tool in the platform. It leverages Git's internal tree objects to enumerate files, search patterns, and compute statistics without traversing the filesystem. This approach bypasses the overhead of filesystem `stat()` calls, directory traversal, and file permission checks that make traditional `find` commands slow on large repositories.

The implementation uses `git ls-tree` to read Git's pre-computed tree index, which contains file paths, sizes, and modification timestamps for every tracked file. Because this index is a single file that Git maintains incrementally, reading it is a single I/O operation regardless of repository size. The Elixir wrapper parses the index output, applies user-specified filters (file type, path prefix, pattern match), and formats results for display.

For a repository with 37,000+ files, `git ls-tree` completes in approximately 80ms compared to 500ms+ for an equivalent `find` command. This 6x speedup makes interactive codebase exploration practical during development conversations and enables tools like the autonomous evolution scanner to rapidly assess the entire codebase.

The shell script variant (`scripts/git-trees.sh`) provides instant access without requiring Elixir compilation, making it usable even when the development environment is not fully initialized.

## Code Generators

The generator system produces complete scaffolds for new platform components. Each generator follows the same pattern: accept configuration parameters, validate constraints, produce file content from templates, write files to the appropriate locations, and update dependent configuration files (mix.exs, application lists, quality DNA).

### Application Scaffold Generator

The application scaffold generator creates a new umbrella application with the complete structure expected by the platform's quality and testing infrastructure. A single command produces:

- `lib/` directory with Application module, Supervisor, and initial facade
- `test/` directory with test helper, unit tests, and contract test setup
- `mix.exs` with standard dependencies, quality aliases, and coverage configuration
- `.claude/quality-dna/current-state.json` for quality tracking
- `CLAUDE.md` with application-specific documentation template

### Storage Adapter Generator

The storage adapter generator creates a new storage backend implementation that conforms to the [Prismatic Storage Core](@/apps/prismatic-storage-core.md) contract. It generates the adapter module with trait declarations, callback implementations with TODO markers for backend-specific logic, and a complete contract test suite that verifies protocol compliance.

### OSINT Adapter Generator

The OSINT adapter generator scaffolds a new intelligence source integration with provider-specific configuration, rate limiting setup, result normalization, and integration tests that verify the adapter's compliance with the OSINT provider protocol.

## Key Features

### Mix Tasks
- `mix git_trees` -- Fast codebase exploration with pattern matching (~100x faster than find)
- `mix quality.gates` -- Run all quality checks across 13 domains
- `mix autoheal.cycle` -- Automatic quality issue remediation
- `mix autoevolve.scan` -- Detect evolution and improvement opportunities
- `mix seadf status` -- [SEADF](@/glossary/seadf.md) framework health and status

### Debugging Utilities
- [Supervision tree](@/glossary/supervision-tree.md) visualization and health inspection
- Process tree rendering with memory and message queue stats
- [ETS](@/glossary/ets.md) table browser for runtime state inspection
- Message queue inspection for detecting mailbox buildup

## Key Commands

| Task | Description |
|------|-------------|
| `mix git_trees` | Repository statistics and file search |
| `mix git_trees find <regex>` | Pattern-based file discovery |
| `mix quality.gates` | Run all quality domain checks |
| `mix quality.gates.check --fast` | Quick quality validation |
| `mix autoheal.baseline` | Establish quality baseline |
| `mix autoheal.cycle` | Automatic quality healing |
| `mix autoevolve.mega` | Full evolution cycle |
| `mix seadf status` | SEADF framework status |

## Debugging Utilities

The debugging utilities provide runtime visibility into the platform's OTP process topology. The supervision tree dumper traverses the entire supervision hierarchy and renders it as an indented tree with process IDs, module names, and health indicators. This is essential for diagnosing issues in the platform's complex supervision topology, which spans hundreds of processes across 90 applications.

The process tree renderer adds memory consumption and message queue depth to each process in the tree, enabling rapid identification of processes that are accumulating messages faster than they can process them (a common symptom of backpressure issues in GenStage pipelines) or consuming more memory than expected (a symptom of state accumulation in long-running GenServers).

The ETS table browser lists all ETS tables in the BEAM instance with their owner processes, entry counts, memory consumption, and access modes. It enables quick verification of table topology, cache sizes, and memory budgets during development and debugging.

## Usage

```bash
# Generate a new OSINT adapter with full scaffold
mix prismatic.gen.osint_adapter my_source

# Run all quality gates with detailed output
mix quality.gates

# Explore codebase for specific patterns
mix git_trees find "defmodule.*Controller"

# Debug supervision tree of a specific application
mix prismatic.debug.sup_tree prismatic_perimeter

# List all applications with file counts
mix git_trees apps
```

## Testing

```bash
mix test apps/prismatic_tooling/test
mix test apps/prismatic_tooling/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Git Trees | 10 | File listing, pattern search, statistics accuracy |
| Code Generators | 12 | Scaffold completeness, contract compliance, file structure |
| Quality Tasks | 8 | Gate evaluation, healing cycle, evolution scanning |
| Debug Utilities | 6 | Tree traversal, memory stats, table listing |

## Integration Points

- **[Prismatic Quality Intelligence](@/apps/prismatic-quality-intelligence.md)** -- Quality tasks powered by Quality Intelligence scoring
- **[Prismatic Claude](@/apps/prismatic-claude.md)** -- Session lifecycle hooks invoke tooling tasks automatically
- **[Prismatic Testing](@/apps/prismatic-testing.md)** -- Test generators produce testing infrastructure
- **[Prismatic Telemetry](@/apps/prismatic-telemetry.md)** -- Task execution [metrics](@/glossary/metrics.md) emitted as telemetry events

## NABLA Compliance

Tooling tasks emit provenance metadata through telemetry events that record task name, execution duration, and result status, satisfying the Provenance Mandatory axiom. Quality gate evaluation provides Signal Plurality by assessing code quality across 13 independent domains rather than relying on a single quality metric. The autoheal and autoevolve tasks implement the Unknown Valid axiom by explicitly acknowledging areas of uncertainty (low-confidence quality scores, ambiguous evolution opportunities) rather than making unsupported claims about platform health.

## Related Components

- [Prismatic Credo](@/apps/prismatic-credo.md) -- Custom Credo checks invoked through [quality gates](@/glossary/quality-gates.md)
- [Prismatic Core](@/apps/prismatic-core.md) -- Core platform utilities used by tooling implementations
- [Prismatic Safety](@/apps/prismatic-safety.md) -- Safety constraints on automated healing and evolution actions

## Related Agents

- [CI/CD Guardrails Enforcer](@/agents/cicd-guardrails-enforcer.md) -- Enforces quality gates within the CI/CD pipeline using tooling tasks
- [Evolution Analyzer Specialist](@/agents/evolution-analyzer-specialist.md) -- Analyzes quality metrics produced by tooling mix tasks
- [DX Brutalist Analyst](@/agents/dx-brutalist-analyst.md) -- Evaluates developer experience with platform tooling and identifies friction

## Related Capabilities

- [Quality Gates](@/capabilities/quality-gates.md) -- Mix tasks implementing the 13-domain quality gate validation pipeline
- [Regression Tests](@/capabilities/regression-tests.md) -- Test generators producing regression test infrastructure for bug fixes
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Autoheal mix tasks performing automatic quality remediation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)