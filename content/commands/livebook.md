+++
title = "/livebook"
weight = 890
[extra]
category = "Operations"
description = "Livebook integration for interactive Elixir notebooks"
syntax = "/livebook [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1254
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["livebook", "Elixir", "commands", "Operations", "Prismatic Platform", "Server", "Notebook", "BEAM"]
tags = ["commands", "operations", "livebook", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/livebook - Prismatic Platform"
+++

## Overview

**/livebook** is a production command in the **Operations** category of the Prismatic Platform that manages the integration between the platform and [Livebook](https://livebook.dev), the interactive notebook environment for [Elixir](@/glossary/elixir.md). Livebook provides a web-based interface for writing and executing Elixir code in an interactive, cell-by-cell fashion with rich output rendering, Mermaid diagram support, and real-time collaboration. The `/livebook` command handles Livebook server lifecycle management, notebook generation from platform data, and bidirectional synchronization between Livebook notebooks and platform components.

This command operates under the **L2+** authority level and is executed by the `elixir-core-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. Livebook integration is particularly valuable for exploratory data analysis, interactive debugging, documentation with executable examples, and training materials that combine explanation with live code.

In the context of the Prismatic Platform's nearly 100 umbrella applications, Livebook serves as an interactive exploration tool that allows developers to experiment with modules, test hypotheses about system behavior, and visualize data flows without the overhead of writing full test suites or Mix tasks. The `/livebook` command streamlines this workflow by managing server instances, generating contextual notebooks, and ensuring that Livebook sessions have access to the platform's compiled modules.

The interactive notebook paradigm represents a fundamentally different interaction model from traditional command-line tooling. Where most platform commands execute and produce static output, Livebook sessions create living documents where code, output, and documentation coexist. This makes Livebook particularly valuable for onboarding, where new team members can explore the platform interactively rather than reading static documentation.

## Syntax and Usage

```bash
/livebook <action> [options]
```

The command accepts a required action parameter: `start`, `stop`, `status`, `generate`, `open`, `list`, `import`, or `validate`.

```bash
# Start Livebook server attached to platform runtime
/livebook start

# Start in standalone mode
/livebook start --mode=standalone

# Start on custom port
/livebook start --port=8090

# Stop the running Livebook server
/livebook stop

# Check Livebook server status
/livebook status

# Generate an explorer notebook for a specific module
/livebook generate --type=explorer --module=PrismaticPerimeter

# Generate a debugging notebook
/livebook generate --type=debugger --target=prismatic_web

# Generate a data analysis notebook
/livebook generate --type=analyzer --query="from p in PrismaticStorage.Schema.Asset"

# Open a specific notebook
/livebook open path/to/notebook.livemd

# List available notebooks
/livebook list

# Import a notebook from URL
/livebook import https://example.com/notebook.livemd
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `action` | string | `status` | Action: `start`, `stop`, `status`, `generate`, `open`, `list`, `import`, `validate` |
| `--mode` | string | `attached` | Server mode: `attached`, `standalone` |
| `--port` | integer | `8080` | HTTP port for Livebook web interface |
| `--type` | string | `explorer` | Notebook type: `explorer`, `debugger`, `analyzer`, `documentation`, `training` |
| `--module` | string | none | Target module for notebook generation |
| `--target` | string | none | Target application for debugging notebooks |
| `--query` | string | none | Ecto query for analysis notebooks |
| `--output` | string | auto | Output path for generated notebooks |
| `--password` | string | auto-generated | Access password for Livebook web interface |
| `--auto-open` | flag | `true` | Automatically open browser after start |
| `--verbose` | flag | `false` | Show detailed server output |
| `--include` | string | none | Additional modules to include in generation scope |

The `--mode` parameter controls the level of platform access. Attached mode connects the Livebook instance to the running platform's BEAM node, providing direct access to all compiled modules, running GenServers, ETS tables, and the supervision tree. Standalone mode launches an independent BEAM instance with no platform access, suitable for experimentation without risk of affecting the running system.

## Implementation Architecture

The Livebook integration operates through a managed server process that connects to the platform's BEAM runtime.

### Server Architecture

```
/livebook command -> Server Manager -> Livebook Instance
                          |                  |
                          v                  v
                    Process Monitor     Web Interface (port 8080)
                    Health Checker      Notebook Storage
                    Config Manager      Runtime Attachment
                          |                  |
                          v                  v
                    Platform BEAM        File System
                    (attached node)      (.livemd files)
```

### Runtime Modes

| Mode | Configuration | Use Case | Risk Level |
|------|-------------|----------|------------|
| **Attached** | Connects to running platform node | Full access to all compiled modules and running processes | Medium (read-only recommended) |
| **Standalone** | Independent BEAM instance | Isolated experimentation without affecting running system | Low |

### Notebook Types

| Type | Purpose | Generated Content |
|------|---------|-------------------|
| **Explorer** | Codebase exploration | Module documentation, function examples, type specifications |
| **Debugger** | Interactive debugging | Process inspection, state examination, ETS table browsing |
| **Analyzer** | Data analysis | Query execution, result visualization, statistical summaries |
| **Documentation** | Living docs | Executable examples with explanations, API walkthroughs |
| **Training** | Onboarding material | Step-by-step tutorials with exercises and validation checks |

### Notebook Generation Pipeline

The generation process follows a structured pipeline that produces contextually rich notebooks:

1. **Module Introspection**: The target module is introspected using `Code.fetch_docs/1` and `Module.__info__/1` to extract function signatures, documentation strings, type specifications, and callback definitions.

2. **Example Synthesis**: For each public function, the generator creates executable example cells with realistic data derived from the function's type specifications and documentation.

3. **Dependency Resolution**: The generator identifies module dependencies and creates setup cells that configure the necessary aliases, imports, and runtime connections.

4. **Visualization Integration**: Where applicable, VegaLite chart cells and Kino interactive widget cells are added to visualize data structures and process relationships.

5. **Validation Cells**: Each notebook includes assertion cells that verify the examples produce expected results, transforming the notebook into a self-validating document.

## Examples

### Platform-Aware Module Explorer

```bash
/livebook generate --type=explorer --module=PrismaticPerimeter \
  --include="PrismaticPerimeter.SecurityRating,PrismaticPerimeter.AssetDiscovery"
```

Generates a notebook that explores the Perimeter module's public API with executable examples for security rating calculation, asset discovery, and compliance assessment. Each function is demonstrated with realistic input data and annotated output.

### Interactive Process Debugging

```bash
/livebook generate --type=debugger --target=PrismaticAgents.Supervisor
```

Creates a debugging notebook pre-configured with cells for inspecting the agent supervisor's child processes, their states, message queue depths, and memory consumption. Includes cells for sending test messages and observing state transitions.

### Onboarding Training Suite

```bash
/livebook generate --type=training --modules="PrismaticStorage,PrismaticWeb,PrismaticAgents" \
  --output-dir=training/onboarding/
```

Produces a series of progressive training notebooks that walk new team members through the platform's core systems, starting with basic concepts and building to advanced usage patterns.

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `elixir-core-specialist` | Server management and notebook generation |
| [Elixir Runtime](@/glossary/elixir.md) | BEAM attachment | Direct access to compiled modules |
| [OTP Supervision](@/glossary/otp.md) | Process management | Livebook runs under supervision |
| [Quality Gates](@/glossary/quality-gates.md) | Documentation quality | Notebooks validated for completeness |
| [Telemetry](@/glossary/telemetry.md) | Usage [metrics](@/glossary/metrics.md) | Server uptime and notebook activity |
| [/code](@/commands/code.md) | Development workflow | Interactive prototyping before formal implementation |
| [/test](@/commands/test.md) | Test exploration | Interactive test development and debugging |
| [/analyze](@/commands/analyze.md) | Data analysis | Interactive analysis workflows |
| VegaLite | Visualization | Chart rendering in notebook cells |
| Kino | Interactive widgets | Dynamic UI components in notebooks |

## Workflow Integration

The /livebook command integrates into several platform workflows:

1. **Exploratory Development**: Before implementing a new feature, developers use Livebook to explore existing module APIs, test hypotheses about data structures, and prototype algorithms. Successful prototypes are then formalized through [/code](@/commands/code.md).

2. **Interactive Debugging**: When investigating complex issues, attached-mode Livebook provides direct access to running processes, enabling real-time state inspection and message tracing without restarting the application.

3. **Documentation Maintenance**: Generated documentation notebooks serve as living documentation that validates itself on execution. Notebooks committed to the repository ensure that documentation examples remain accurate as the codebase evolves.

4. **Team Onboarding**: Training notebooks provide structured, interactive learning paths for new team members. The progressive disclosure of platform concepts, combined with hands-on exercises, accelerates the onboarding process.

5. **CI Integration**: Notebooks can be validated in CI to ensure all example cells execute successfully, catching documentation drift early in the development cycle.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Generated notebooks contain working, tested code examples. Non-functional examples are not permitted. Every generated notebook must execute cleanly from start to finish.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Notebooks provide interactive verification of claims through executable code cells. Assertions in validation cells provide empirical evidence for documented behavior.

NABLA axiom compliance:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | Generated notebooks include generation metadata (source module, timestamp) |
| **Signal Plurality** | Multiple example cells demonstrate the same concept from different angles |
| **Time Decay** | Notebooks include version stamps; stale notebooks flagged during validation |
| **Evidence-Based** | Every claim in documentation notebooks is backed by executable code |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Server start (attached) | < 10s | ~5s |
| Server start (standalone) | < 15s | ~8s |
| Notebook generation (explorer) | < 10s | ~4s |
| Notebook generation (training suite) | < 60s | ~25s |
| Module introspection | < 1s per module | ~200ms per module |
| Notebook validation | < 30s per notebook | ~10s per notebook |
| Memory overhead (attached) | < 100MB | ~50MB |
| Memory overhead (standalone) | < 200MB | ~80MB |

The server startup time includes BEAM node connection (attached mode) or compilation (standalone mode). Notebook generation speed depends on the number of public functions in the target modules and the complexity of the type specifications being used for example synthesis.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/quickstart](@/commands/quickstart.md) - Project quickstart scaffolding and boilerplate generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)