+++
title = "Supervision Tree"
weight = 38
[extra]
description = "Hierarchical process monitoring with configurable restart strategies"
category = "elixir"
related_terms = ["genserver", "otp", "umbrella-application", "3nl", "agent", "beam", "cascade-pattern", "circuit-breaker", "dynamic-supervisor", "process-isolation", "self-healing", "supervisor"]
keywords = ["OTP supervision tree pattern", "fault-tolerant process hierarchy", "Elixir supervisor strategies", "let it crash philosophy", "process restart strategies", "one-for-one supervisor", "self-healing systems OTP", "Erlang supervision design"]
tags = ["supervision-tree", "otp", "fault-tolerance", "elixir"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 844
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Supervision Tree - Prismatic Platform"
+++

{% import "macros/flowbite.html" as fb %}

## Definition and Overview

A Supervision Tree is a fundamental OTP (Open Telecom Platform) pattern for organizing processes into a hierarchical structure where supervisor processes monitor their children and apply configurable restart strategies when failures occur. The tree structure enables fault-tolerant systems that automatically recover from process crashes without human intervention, implementing the "let it crash" philosophy central to Erlang/OTP and Elixir programming.

{{ fb::p5_interactive_dashboard(title="OTP Supervision Tree Hierarchy", sketch_type="network", data_source="supervision.tree_structure", controls=true) }}

{{ fb::divider(label="Interactive Visualization") }}

The supervision tree concept is based on a profound insight: instead of trying to handle every possible error condition (defensive programming), systems should be designed to detect failures and recover automatically (offensive programming). When a process encounters an unrecoverable error, it crashes. Its supervisor detects the crash, applies the appropriate restart strategy, and the system continues operating. This approach produces more reliable systems than defensive programming because it handles unanticipated failures -- the very failures that defensive code cannot prepare for.

**Interactive Demo**: The network visualization above illustrates how OTP supervision trees organize processes hierarchically. Watch as supervisor nodes (hexagons) monitor worker processes (circles). When failures occur, observe the different restart strategies: `:one_for_one` restarts only the failed process, `:one_for_all` restarts all siblings, and `:rest_for_one` restarts the failed process and all subsequent ones. The animation demonstrates the process lifecycle: start → crash → restart → recovery.

Supervision trees form a hierarchy where each level provides isolation and recovery for the level below. A crashed worker is restarted by its supervisor. If the supervisor itself crashes (perhaps due to repeated worker failures), its parent supervisor handles recovery. This layered approach means that failures are always handled at the most appropriate level, and only truly catastrophic failures (where recovery is impossible) propagate to the top of the tree and cause system-wide shutdown.

In the Prismatic Platform, supervision tree design is a mandatory prerequisite before writing any application code. The platform mandate states "Process for every stateful entity" and "Supervision tree documented before code." Each of the 90 umbrella applications maintains its own supervision tree, and the meta-rule "If the same solution could be written identically in Node.js, it's WRONG" ensures that developers leverage supervision trees rather than falling back to try-catch error handling patterns.

## Technical Deep Dive

### Restart Strategies

OTP provides three restart strategies that define how a supervisor responds to child process failures:

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| `:one_for_one` | Restart only the failed child | Independent children with no shared state |
| `:one_for_all` | Restart all children | Interdependent children that share state |
| `:rest_for_one` | Restart the failed child and all children started after it | Children with ordered dependencies |

{{ fb::p5_grid_2x2(
  title1="One-For-One Strategy", type1="network", data1="supervision.one_for_one",
  title2="One-For-All Strategy", type2="network", data2="supervision.one_for_all",
  title3="Rest-For-One Strategy", type3="network", data3="supervision.rest_for_one",
  title4="Process Lifecycle", type4="agents", data4="supervision.lifecycle"
) }}

### Supervisor Implementation

```elixir
defmodule PrismaticPerimeter.Supervisor do
  @moduledoc """
  Root supervisor for the Prismatic Perimeter EASM application.
  Organizes scanning, rating, and compliance subsystems.
  """

  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      # Core data stores - independent, restart individually
      {PrismaticPerimeter.AssetStore, []},
      {PrismaticPerimeter.RatingCache, []},

      # Scanner subsystem - ordered dependency
      {PrismaticPerimeter.Scanner.Supervisor, []},

      # Rating engine - depends on asset store
      {PrismaticPerimeter.Rating.Engine, []},

      # Compliance assessor - depends on rating engine
      {PrismaticPerimeter.Compliance.Assessor, []},

      # Dashboard coordinator - depends on all above
      {PrismaticPerimeter.Dashboard.Coordinator, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

### Dynamic Supervisors

For processes that are created and destroyed at runtime (such as per-scan or per-agent workers), DynamicSupervisor provides on-demand child management:

```elixir
defmodule PrismaticPerimeter.Scanner.DynamicSupervisor do
  @moduledoc """
  Dynamic supervisor for scan worker processes.
  Workers are started on demand and terminated on completion.
  """

  use DynamicSupervisor

  def start_link(opts) do
    DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    DynamicSupervisor.init(
      strategy: :one_for_one,
      max_restarts: 10,
      max_seconds: 60
    )
  end

  @spec start_scan(String.t(), keyword()) :: {:ok, pid()} | {:error, term()}
  def start_scan(domain, opts) do
    child_spec = {PrismaticPerimeter.Scanner.Worker, [domain: domain] ++ opts}
    DynamicSupervisor.start_child(__MODULE__, child_spec)
  end

  @spec stop_scan(pid()) :: :ok | {:error, :not_found}
  def stop_scan(pid) do
    DynamicSupervisor.terminate_child(__MODULE__, pid)
  end

  @spec active_scans() :: non_neg_integer()
  def active_scans do
    DynamicSupervisor.count_children(__MODULE__).active
  end
end
```

### Restart Intensity Configuration

Supervisors configure restart intensity to prevent infinite restart loops:

```elixir
defmodule PrismaticAgents.AgentSupervisor do
  @moduledoc """
  Supervises runtime agent processes with configured restart limits.
  Max 5 restarts in 30 seconds before the supervisor itself fails.
  """

  use Supervisor

  @impl true
  def init(_opts) do
    children = [
      {PrismaticAgents.AgentPool, []},
      {PrismaticAgents.CommandDispatcher, []},
      {PrismaticAgents.TelemetryReporter, []}
    ]

    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: 5,
      max_seconds: 30
    )
  end
end
```

### Child Specification

Every process in a supervision tree has a child specification defining how it should be started and restarted:

```elixir
defmodule PrismaticPerimeter.Scanner.Worker do
  @moduledoc """
  Scan worker with custom child specification.
  Transient restart - only restart on abnormal termination.
  """

  use GenServer, restart: :transient

  def child_spec(opts) do
    domain = Keyword.fetch!(opts, :domain)

    %{
      id: {__MODULE__, domain},
      start: {__MODULE__, :start_link, [opts]},
      restart: :transient,
      shutdown: 5_000,
      type: :worker
    }
  end

  def start_link(opts) do
    domain = Keyword.fetch!(opts, :domain)
    GenServer.start_link(__MODULE__, opts, name: via_registry(domain))
  end

  @impl true
  def init(opts) do
    domain = Keyword.fetch!(opts, :domain)
    {:ok, %{domain: domain, status: :initialized}, {:continue, :start_scan}}
  end

  @impl true
  def handle_continue(:start_scan, state) do
    # Begin scanning - if this crashes, supervisor restarts us
    {:noreply, %{state | status: :scanning}}
  end
end
```

## Architecture and Implementation

### Prismatic Platform Supervision Hierarchy

The platform's supervision tree follows a layered architecture:

```
Application.start/2
    |
    +-- PrismaticSupervisor (root)
            |
            +-- PrismaticStorageCore.Supervisor
            |       +-- ETS tables
            |       +-- Ecto repos
            |
            +-- Prismatic.Supervisor
            |       +-- Core services
            |       +-- API coordination
            |
            +-- PrismaticWeb.Supervisor
            |       +-- Phoenix endpoint
            |       +-- LiveView processes
            |       +-- PubSub
            |
            +-- PrismaticAgents.Supervisor
            |       +-- Agent pool
            |       +-- Command dispatcher
            |       +-- DynamicSupervisor (runtime agents)
            |
            +-- PrismaticPerimeter.Supervisor
            |       +-- Scanner supervisor
            |       +-- Rating engine
            |       +-- Compliance assessor
            |
            +-- PrismaticSafety.Supervisor
                    +-- Quality Floor Guardian
                    +-- Risk Pattern Detector
```

### PrismaticSupervisor Application

The `prismatic_supervisor` application provides compositional supervision with dependency-aware startup:

```elixir
defmodule PrismaticSupervisor do
  @moduledoc """
  Root supervisor with dependency-aware startup ordering.
  Ensures applications start in correct dependency order.
  """

  use Supervisor

  @impl true
  def init(_opts) do
    children =
      PrismaticSupervisor.DependencyResolver.resolve()
      |> Enum.map(&build_child_spec/1)

    Supervisor.init(children, strategy: :rest_for_one)
  end

  defp build_child_spec(app) do
    module = app.supervisor_module
    {module, app.config}
  end
end
```

### Supervision Tree Best Practices for Prismatic

| Principle | Implementation | Enforcement |
|-----------|---------------|-------------|
| Process per state | Every stateful entity has its own process | Code review mandate |
| Tree before code | Supervision tree documented before implementation | CLAUDE.md requirement |
| Crash isolation | Children isolated from sibling failures | OTP strategy selection |
| Ordered startup | Dependencies start before dependents | DependencyResolver |
| Graceful shutdown | 5-second shutdown timeout for cleanup | child_spec configuration |

## Usage in Prismatic Platform

### Creating a New Supervised Application

```elixir
defmodule MyApp.Application do
  @moduledoc """
  OTP Application for MyApp.
  Defines the supervision tree root.
  """

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start ETS tables first
      MyApp.Cache,
      # Then GenServer workers
      MyApp.StateManager,
      # Then dynamic supervisor for runtime processes
      {DynamicSupervisor, name: MyApp.DynamicSupervisor, strategy: :one_for_one}
    ]

    opts = [strategy: :rest_for_one, name: MyApp.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Inspecting Supervision Trees

```elixir
# List all children of a supervisor
Supervisor.which_children(PrismaticPerimeter.Supervisor)

# Count children (including dynamic ones)
Supervisor.count_children(PrismaticAgents.AgentSupervisor)

# Check if a specific child is alive
Process.alive?(GenServer.whereis(PrismaticPerimeter.Rating.Engine))
```

### Observer for Visual Inspection

```elixir
# Launch the Observer GUI to visualize supervision trees
:observer.start()
```

## Best Practices

1. **Design the supervision tree before writing any module**. The tree structure defines failure boundaries, restart behavior, and dependency ordering. Changing it later requires restructuring the application.

2. **Choose restart strategies based on child relationships**. Use `:one_for_one` for independent children, `:one_for_all` for tightly coupled children, and `:rest_for_one` for ordered dependencies.

3. **Set restart intensity conservatively**. Too many restarts in a short window indicate a systemic problem, not a transient failure. Let the supervisor escalate to its parent rather than endlessly restarting.

4. **Use `:transient` restart for task-like processes**. Processes that are expected to terminate normally should use `:transient` restart to avoid unnecessary restarts on normal completion.

5. **Keep supervision trees shallow where possible**. Deep trees add latency to restart propagation. Flat trees with clear `:one_for_one` strategies are easier to reason about.

## Common Pitfalls

- **Putting all processes under one supervisor**: A single flat supervisor with `:one_for_all` means any child crash restarts everything. Use hierarchy to isolate failure domains.

- **Using `:permanent` restart for ephemeral processes**: Processes that complete their work and exit normally should not use `:permanent` restart, which triggers unnecessary restarts.

- **Not setting shutdown timeouts**: The default shutdown timeout is 5 seconds, but long-running cleanup operations may need more time. Configure explicitly.

- **Circular dependencies in supervision**: If process A depends on process B and B depends on A, no startup order is correct. Break circular dependencies through message passing or redesign.

- **Forgetting to document the tree**: The supervision tree is the most important architectural document for an OTP application. Undocumented trees become unmaintainable.

## Related Concepts

- [GenServer](/glossary/genserver/) -- Stateful processes managed within supervision trees
- [OTP](/glossary/otp/) -- Framework providing supervisor behaviours
- [Umbrella Application](/glossary/umbrella-application/) -- Per-app supervision tree isolation
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Runtime child management
- [Process Isolation](/glossary/process-isolation/) -- BEAM isolation underlying supervision
- [Self-Healing](/glossary/self-healing/) -- Platform-level recovery complementing OTP supervision
- [Circuit Breaker](/glossary/circuit-breaker/) -- Failure detection pattern within supervised processes

## See Also

- [prismatic_supervisor](../../../apps/prismatic_supervisor/README.md) -- Compositional supervision with dependency-aware startup
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Domain supervisor hierarchy for 434 agents
- [prismatic_core](../../../apps/prismatic_core/README.md) -- Core platform supervision tree
- [prismatic_safety](../../../apps/prismatic_safety/README.md) -- Quality Floor Guardian supervised process
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- Application directory with per-app supervision trees

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)