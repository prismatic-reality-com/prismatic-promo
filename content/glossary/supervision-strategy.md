+++
title = "Supervision Strategy"
weight = 50
[extra]
description = "OTP restart policy defining how a Supervisor responds to child process failures - one_for_one, one_for_all, or rest_for_one"
category = "otp"
related_terms = ["supervisor", "genserver", "otp", "process", "fault-tolerance", "beam", "supervision-tree"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["supervision strategy", "OTP", "restart policy", "one_for_one", "fault tolerance", "glossary", "Prismatic Platform"]
tags = ["glossary", "otp", "fault-tolerance"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Supervision Strategy - Prismatic Platform"
+++

## Definition & Overview

A supervision strategy is the policy that an OTP Supervisor uses to respond when one of its child processes crashes. The strategy determines which children are restarted and in what order. OTP provides three built-in strategies: `:one_for_one` (restart only the failed child), `:one_for_all` (restart all children when any one fails), and `:rest_for_one` (restart the failed child and all children started after it). The choice of strategy encodes the dependency relationships between child processes.

Choosing the correct supervision strategy is a critical design decision that directly affects system reliability. If child processes are independent (no shared state, no ordering dependencies), `:one_for_one` is correct because restarting unrelated processes would cause unnecessary disruption. If children share state that becomes inconsistent when any one crashes, `:one_for_all` ensures a clean restart of the entire group. If children have a sequential dependency (B depends on A, C depends on B), `:rest_for_one` ensures that dependent processes are restarted in the correct order.

The Prismatic Platform uses all three strategies across its supervision tree. Top-level application supervisors use `:one_for_one` because umbrella applications are independent. Domain supervisors within applications use `:rest_for_one` when child processes have initialization dependencies (e.g., registry must start before scheduler). The `PrismaticSupervisor` module provides dependency-aware startup that automatically selects the appropriate strategy based on declared dependency relationships.

## Technical Deep Dive

### Strategy Comparison

```elixir
defmodule PrismaticExample.StrategyDemo do
  @moduledoc """
  Demonstrates the three OTP supervision strategies
  with practical examples from the platform.
  """

  # Strategy 1: one_for_one
  # Independent children - restart only the failed process
  defmodule IndependentSupervisor do
    use Supervisor

    def start_link(opts) do
      Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl true
    def init(_opts) do
      children = [
        {PrismaticOsintCore.ToolRegistry, []},
        {PrismaticAcademy.TopicRegistry, []},
        {PrismaticDd.SourceRegistry, []}
      ]

      # Each registry is independent - no shared state
      # If ToolRegistry crashes, TopicRegistry and SourceRegistry continue
      Supervisor.init(children, strategy: :one_for_one)
    end
  end

  # Strategy 2: one_for_all
  # Interconnected children - all must restart together
  defmodule InterconnectedSupervisor do
    use Supervisor

    def start_link(opts) do
      Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl true
    def init(_opts) do
      children = [
        {PrismaticDd.EntityStore, []},
        {PrismaticDd.RelationshipStore, []},
        {PrismaticDd.GraphCache, []}
      ]

      # Entity and Relationship stores share graph state via GraphCache
      # If any one crashes, the shared state becomes inconsistent
      # All three must restart together to rebuild consistent state
      Supervisor.init(children, strategy: :one_for_all)
    end
  end

  # Strategy 3: rest_for_one
  # Sequential dependencies - restart failed and all that depend on it
  defmodule SequentialSupervisor do
    use Supervisor

    def start_link(opts) do
      Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
    end

    @impl true
    def init(_opts) do
      children = [
        # Must start first: provides ETS table
        {PrismaticDd.SourceRegistry, []},
        # Depends on SourceRegistry: reads source configs
        {PrismaticDd.Scheduler, []},
        # Depends on Scheduler: receives scheduling events
        {PrismaticDd.PipelineRunner, []}
      ]

      # If SourceRegistry crashes:
      #   - Scheduler and PipelineRunner lose access to source configs
      #   - All three restart in order
      # If Scheduler crashes:
      #   - PipelineRunner loses scheduling events
      #   - Scheduler and PipelineRunner restart
      # If PipelineRunner crashes:
      #   - Only PipelineRunner restarts (SourceRegistry and Scheduler are fine)
      Supervisor.init(children, strategy: :rest_for_one)
    end
  end
end
```

### Restart Intensity Configuration

Beyond the strategy, supervision parameters control restart rate limits:

```elixir
defmodule PrismaticSupervisor.DomainSupervisor do
  @moduledoc """
  Domain supervisor with configurable restart intensity.
  Prevents rapid restart loops from consuming resources.
  """

  use Supervisor

  def start_link(opts) do
    domain = Keyword.fetch!(opts, :domain)
    Supervisor.start_link(__MODULE__, opts, name: via_name(domain))
  end

  @impl true
  def init(opts) do
    children = Keyword.get(opts, :children, [])
    strategy = Keyword.get(opts, :strategy, :one_for_one)

    # max_restarts: maximum restarts within max_seconds
    # If exceeded, the supervisor itself crashes (and ITS supervisor handles it)
    Supervisor.init(children,
      strategy: strategy,
      max_restarts: 3,
      max_seconds: 5
    )
    # 3 restarts in 5 seconds = supervisor gives up
    # This prevents infinite restart loops from consuming CPU
  end

  defp via_name(domain) do
    {:via, Registry, {PrismaticSupervisor.Registry, {:domain, domain}}}
  end
end
```

### Dynamic Child Specification

The platform uses child specifications to control per-child restart behavior:

```elixir
defmodule PrismaticDd.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Permanent: always restart (critical infrastructure)
      %{
        id: PrismaticDd.SourceRegistry,
        start: {PrismaticDd.SourceRegistry, :start_link, [[]]},
        restart: :permanent,
        shutdown: 5_000
      },
      # Transient: restart only on abnormal exit (workers)
      %{
        id: PrismaticDd.Scheduler,
        start: {PrismaticDd.Scheduler, :start_link, [[]]},
        restart: :transient,
        shutdown: 10_000
      },
      # Temporary: never restart (one-shot tasks)
      %{
        id: PrismaticDd.InitialLoader,
        start: {PrismaticDd.InitialLoader, :start_link, [[]]},
        restart: :temporary,
        shutdown: 30_000
      }
    ]

    Supervisor.start_link(children, strategy: :rest_for_one, name: PrismaticDd.Supervisor)
  end
end
```

## Architecture & Implementation

The Prismatic Platform's supervision tree is documented before implementation, following the OTP-First rule from the Elixir best practices policy. Each application in the umbrella defines its supervision tree in the `Application` module, with the strategy choice justified by the dependency relationships between children.

The `PrismaticSupervisor` module adds a higher-level abstraction: dependency-aware startup. Applications declare their dependencies, and the supervisor resolves the dependency graph using topological sorting. This ensures that applications start in the correct order across the entire umbrella, not just within individual supervisors.

The platform's supervision tree follows a hierarchical pattern: the top-level Application supervisor uses `:one_for_one` (umbrella apps are independent), domain supervisors within apps use `:rest_for_one` (services within a domain have ordering dependencies), and worker groups use `:one_for_one` (individual workers are independent).

Restart intensity values are tuned based on the process's role. Critical infrastructure (registries, repos) uses `max_restarts: 5, max_seconds: 10` to tolerate transient failures. Workers use `max_restarts: 3, max_seconds: 5` to fail fast on persistent errors. The intent is to distinguish between recoverable transients (restart) and permanent failures (crash upward to the next supervisor).

## Usage in Prismatic Platform

Supervision strategies are defined in every Application module:

```elixir
# Check supervision tree
PrismaticSupervisor.DependencyResolver.resolve_order()

# Inspect running supervision tree
Supervisor.which_children(PrismaticDd.Supervisor)
```

## Cross-References

- [Supervisor](@/glossary/supervisor.md) - OTP process that implements supervision strategies
- [GenServer](@/glossary/genserver.md) - Common child process type managed by supervisors
- [OTP](@/glossary/otp.md) - Framework providing supervision abstractions
- [Fault Tolerance](@/glossary/fault-tolerance.md) - System property achieved through supervision

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
