+++
title = "Getting Started with Prismatic Platform"
weight = 1
[extra]
description = "Your first steps into the Prismatic Platform umbrella architecture and OTP foundations"
category = "beginner"
difficulty = "beginner"
duration = "45 min"
prerequisites = []
glossary_terms = ["aiad", "no-mercy", "no-doubts", "quality-dna", "seadf"]
technologies = ["elixir", "otp", "phoenix", "postgresql"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1172
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Getting", "Started", "Prismatic", "Platform", "academy", "beginner", "Prismatic Platform", "Elixir", "Git Trees"]
tags = ["academy", "beginner", "getting-started-with-prismatic-platform", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Getting Started with Prismatic Platform - Prismatic Platform"
+++

## Overview

This guide introduces you to the Prismatic Platform -- a large-scale Elixir umbrella application comprising 90+ OTP applications, 400+ autonomous agents, and a comprehensive quality enforcement system. By the end of this tutorial, you will understand the platform's structure, know how to navigate its codebase, and be ready to make your first contribution.

You will learn:

- How the umbrella architecture organizes 90+ applications into cohesive domains
- Why OTP supervision trees form the backbone of platform reliability
- How to set up your local development environment
- How to navigate the codebase using Git Trees for fast file discovery
- The role of the [AIAD standard](/glossary/aiad/) in governing all platform components

## Prerequisites

Before starting, ensure you have the following installed:

- **Elixir 1.19+** with Erlang/OTP 27+ (use `asdf` for version management)
- **PostgreSQL 16+** running locally
- **Node.js 20+** for asset compilation
- **Git** with familiarity of basic operations
- Basic understanding of functional programming concepts

No prior Elixir experience is strictly required, but familiarity with at least one functional language will accelerate your learning.

## Core Concepts

### The Umbrella Architecture

Prismatic is not a single monolithic application. It is an Elixir umbrella project -- a collection of independent OTP applications that share a common build configuration but maintain strict boundaries. Each application in the `apps/` directory owns its domain:

```
apps/
  prismatic/               # Core coordination and main API
  prismatic_web/           # Phoenix LiveView dashboards
  prismatic_api/           # Auto-introspecting REST gateway
  prismatic_agents/        # Agent runtime (400+ agents)
  prismatic_storage_core/  # Storage traits and protocols
  prismatic_storage_ets/   # ETS adapter implementation
  prismatic_storage_ecto/  # PostgreSQL adapter via Ecto
  prismatic_perimeter/     # External Attack Surface Management
  prismatic_safety/        # Quality Floor Guardian
  prismatic_claude/        # Claude integration and session management
  ...
```

Each application declares its dependencies explicitly in its `mix.exs` file. There are no circular dependencies. If `prismatic_web` needs data from `prismatic_storage_ecto`, it declares that dependency and calls through public APIs only.

### OTP as the Foundation

Every stateful component in Prismatic runs inside an OTP process with proper supervision. The platform follows the [let-it-crash](/glossary/let-it-crash/) philosophy: individual processes can fail without bringing down the system, because [supervisors](/glossary/supervisor/) automatically restart them.

```elixir
# Every domain has a supervision tree
defmodule PrismaticAgents.Supervisor do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      {PrismaticAgents.Registry, []},
      {PrismaticAgents.Orchestrator, []},
      {PrismaticAgents.HealthMonitor, []}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### The Meta-Rule

There is one rule that supersedes all others when writing Elixir for Prismatic:

> **If the same solution could be written identically in Node.js, it is WRONG.**

This means: use OTP processes for state, supervision trees for reliability, pattern matching for control flow, and the pipe operator for data transformation. Do not write imperative, object-oriented code that happens to compile in Elixir.

## Step-by-Step Guide

### Step 1: Clone and Configure

```bash
git clone git@gitlab.com:korczis/prismatic-platform.git
cd prismatic-platform

# Install Elixir dependencies
mix deps.get

# Create and migrate the database
mix ecto.create
mix ecto.migrate

# Install Node.js dependencies for assets
cd apps/prismatic_web/assets && npm install && cd ../../..
```

### Step 2: Verify Your Environment

```bash
# Compile with zero warnings (this is enforced)
mix compile --warnings-as-errors

# Run the quality gates
mix quality.gates

# Run the test suite
mix test
```

If compilation produces warnings, you must fix them before proceeding. The [NO MERCY](/glossary/no-mercy/) doctrine enforces zero-warning builds across the entire platform.

### Step 3: Navigate with Git Trees

The platform contains over 37,000 files. Do not use `find` or `ls -R`. Instead, use Git Trees for instant navigation:

```bash
# Repository statistics
./scripts/git-trees.sh stats

# List all applications with file counts
./scripts/git-trees.sh apps

# Find files by pattern
./scripts/git-trees.sh find "quality.*guardian"

# List only Elixir source files
./scripts/git-trees.sh elixir

# Recently modified files
./scripts/git-trees.sh recent 20
```

Git Trees operates on the Git index and completes in approximately 80ms regardless of repository size, compared to 500ms+ for filesystem traversal.

### Step 4: Start the Development Server

```bash
# Start Phoenix with interactive Elixir shell
iex -S mix phx.server
```

Visit `http://localhost:4000` for the LiveView dashboard and `http://localhost:4004/api/v1/health` for the REST API health check.

### Step 5: Explore the AIAD Standard

Every agent, command, pipeline, and policy in the platform follows the [AIAD standard](/glossary/aiad/). Browse the registry:

```bash
# List all registered agents
ls .aiad/agents/ | head -20

# View a specific agent definition
cat .aiad/agents/quality-floor-guardian.agent.md

# View the command registry
cat .claude/COMMAND_REGISTRY.md
```

## Code Examples

### Reading Platform State

```elixir
# Check the Quality Floor Guardian status
{:ok, status} = PrismaticSafety.QualityFloorGuardian.status()
IO.inspect(status, label: "Quality Status")
# => %{score: 100, domains: 13, violations: 0, level: :optimal}

# List all registered agents
agents = PrismaticAgents.Registry.list_agents()
IO.puts("Total agents: #{length(agents)}")
# => Total agents: 434
```

### Understanding the Result Pattern

Every function in Prismatic returns tagged tuples. Never raise exceptions for expected failures:

```elixir
# Correct: tagged tuple returns
case PrismaticPerimeter.discover("example.com") do
  {:ok, surface} ->
    IO.inspect(surface.assets, label: "Discovered assets")

  {:error, :timeout} ->
    Logger.warning("Discovery timed out for example.com")

  {:error, reason} ->
    Logger.error("Discovery failed: #{inspect(reason)}")
end
```

### Using the Pipe Operator

Data transformation in Prismatic flows through pipes, keeping functions pure and composable:

```elixir
"example.com"
|> PrismaticPerimeter.normalize_domain()
|> PrismaticPerimeter.discover()
|> case do
  {:ok, surface} -> PrismaticPerimeter.score(surface)
  {:error, _} = error -> error
end
|> case do
  {:ok, rating} -> IO.puts("Security grade: #{rating.grade}")
  {:error, reason} -> IO.puts("Failed: #{reason}")
end
```

## Common Pitfalls

**Using `find` instead of Git Trees.** Filesystem traversal is slow on large repositories. Always use `./scripts/git-trees.sh` or `mix git_trees` for codebase navigation.

**Ignoring compilation warnings.** The pre-commit hook rejects code with warnings. Fix them immediately rather than accumulating technical debt. The platform maintains zero warnings across all 90+ applications.

**Writing stateless modules when state is needed.** If your module needs to track state, it needs a GenServer. Do not store state in module attributes or application environment as a workaround.

**Skipping the quality gates.** Running `mix quality.gates` before committing saves time. The CI pipeline runs the same checks and will reject non-compliant code.

**Creating circular dependencies between umbrella apps.** If app A depends on app B and app B depends on app A, you have a design problem. Extract the shared concern into a third application.

## Exercises

1. **Explore the apps directory.** Run `./scripts/git-trees.sh apps` and identify which application has the most files. Read its `CLAUDE.md` to understand its purpose.

2. **Trace a supervision tree.** Pick any application (e.g., `prismatic_safety`) and find its top-level supervisor. Draw the process tree on paper, noting the restart strategy at each level.

3. **Run a quality check.** Execute `mix quality.gates` and read the output. Identify which quality domains are checked and what score the platform currently achieves.

4. **Read an agent definition.** Open any `.aiad/agents/*.agent.md` file and identify its classification level, capabilities, and enforcement policies.

5. **Build and test.** Make a trivial change (add a comment to any module), then run `mix compile --warnings-as-errors && mix test` to experience the full validation cycle.

## Summary

The Prismatic Platform is a large-scale Elixir umbrella project built on OTP principles. Its 90+ applications maintain strict boundaries through explicit dependency declarations. Navigation uses Git Trees for speed, quality is enforced through automated gates, and every component follows the AIAD standard. The platform compiles with zero warnings and maintains a perfect quality score of 100/100.

Key takeaways:

- The umbrella architecture separates concerns into independent OTP applications
- Supervision trees provide fault tolerance through the let-it-crash philosophy
- Git Trees enable fast codebase navigation (80ms vs 500ms+)
- The NO MERCY doctrine enforces zero warnings, zero stubs, and 100% test coverage
- Every function returns `{:ok, value}` or `{:error, reason}` -- never bare raises

## Practical Implementation

### In Prismatic Platform

The concepts introduced here are implemented across these core applications:

- **prismatic** (`apps/prismatic/`) -- Main coordination app, central API facade, and mix tasks including `mix git_trees` for codebase navigation
- **prismatic_core** (`apps/prismatic_core/`) -- Shared types, protocols, and foundational modules used by all other apps
- **prismatic_web** (`apps/prismatic_web/`) -- Phoenix LiveView dashboards served at `http://localhost:4000`, the primary user interface
- **prismatic_api** (`apps/prismatic_api/`) -- Auto-introspecting REST API at `http://localhost:4004` with OpenAPI/SwaggerUI
- **prismatic_agents** (`apps/prismatic_agents/`) -- Runtime for 400+ autonomous agents, including the `PrismaticAgents.Registry` for process discovery
- **prismatic_safety** (`apps/prismatic_safety/`) -- Quality Floor Guardian (`PrismaticSafety.QualityFloorGuardian`) that monitors all 13 quality domains
- **prismatic_supervisor** (`apps/prismatic_supervisor/`) -- Compositional supervision with dependency-aware startup, domain supervisors, and pluggable backends (ETS/Horde)

### Code Examples from the Codebase

The umbrella architecture is defined in the root `mix.exs`:

```elixir
# Root mix.exs declares all umbrella apps
def project do
  [
    apps_path: "apps",
    # ... 90+ apps discovered automatically
  ]
end
```

Quality gates are invoked through mix tasks in `apps/prismatic/lib/mix/tasks/`:

```elixir
# Run the full quality gate suite
mix quality.gates

# Use Git Trees for fast navigation (80ms vs 500ms+)
mix git_trees apps          # List all 90+ apps with file counts
mix git_trees find "agent"  # Find files matching pattern
```

## See Also

### Related Applications
- [prismatic_claude](/apps/prismatic-claude/) -- Claude integration and session lifecycle management
- [prismatic_storage_core](/apps/prismatic-storage-core/) -- Storage traits and protocols forming the data layer foundation
- [prismatic_telemetry](/apps/prismatic-telemetry/) -- Observability infrastructure with structured telemetry events

### Glossary
- [AIAD](/glossary/aiad/) -- AI Agent Directive standard governing all platform components
- [NO MERCY](/glossary/no-mercy/) -- Execution quality enforcement doctrine
- [NO DOUBTS](/glossary/no-doubts/) -- Decision quality enforcement doctrine
- [Quality DNA](/glossary/quality-dna/) -- Persistent quality state tracked across sessions
- [SEADF](/glossary/seadf/) -- Self-Evolving Autonomous Development Framework
- [Umbrella Application](/glossary/umbrella-application/) -- Elixir project structure used by Prismatic
- [OTP](/glossary/otp/) -- Open Telecom Platform foundational runtime
- [Supervision Tree](/glossary/supervision-tree/) -- Fault tolerance through process hierarchies

### Architecture
- [Umbrella Apps](/architecture/umbrella-apps/) -- Deep dive into the umbrella architecture design
- [Supervision Trees](/architecture/supervision-trees/) -- Process topology and fault tolerance patterns
- [Telemetry](/architecture/telemetry/) -- Observability and metrics infrastructure

### Related Academy Topics
- [OTP Design Patterns](/academy/otp-fundamentals/) -- GenServer, Supervisor, and process topology
- [Storage Architecture](/academy/storage-patterns/) -- Trait-based storage layer with pluggable adapters
- [Development Workflow](/academy/development-workflow/) -- CI/CD pipeline and Git hooks

## Next Steps

- [Building Your First Autonomous Agent](/academy/first-agent/) -- create an AIAD-compliant agent from scratch
- [Understanding NO MERCY, NO DOUBTS](/academy/quality-standards/) -- deep dive into the quality enforcement system
- [OTP Design Patterns for Prismatic](/academy/otp-fundamentals/) -- master GenServer, Supervisor, and process topology
- [Development Workflow & CI/CD](/academy/development-workflow/) -- set up your complete development environment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)