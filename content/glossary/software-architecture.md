+++
title = "Software Architecture"
weight = 50
[extra]
tags = ["glossary", "architecture", "software-architecture", "design", "umbrella", "otp", "domain-driven-design", "patterns", "modularity"]
description = "The fundamental organization of a software system embodied in its components, their relationships, and the principles governing its design and evolution. In Prismatic: umbrella architecture with 115 apps, 3NL epistemic framework, adapter pattern, domain-driven design."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Architecture & Design"
related_concepts = ["umbrella applications", "domain-driven design", "adapter pattern", "supervision trees", "bounded contexts", "hexagonal architecture", "event-driven architecture"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 8
prerequisites = ["elixir", "otp", "phoenix", "behaviour"]
learning_path = ["elixir", "otp", "behaviour", "supervision", "domain-driven-design", "software-architecture"]
interactive_demos = ["/labs/glossary/software-architecture"]
code_examples = ["UmbrellaApp", "AdapterBehaviour", "DomainSupervisor", "BoundedContext"]
external_resources = ["https://hexdocs.pm/elixir/Application.html", "https://hexdocs.pm/mix/Mix.Tasks.New.html", "https://martinfowler.com/architecture/"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["dependency graph validation", "circular dependency detection", "adapter contract testing", "domain boundary enforcement", "compilation order verification"]
keywords = ["software architecture", "umbrella", "domain-driven design", "adapter pattern", "bounded context", "hexagonal architecture", "3NL", "supervision tree", "OTP design"]
related_terms = ["domain-driven-design", "adapter-pattern", "3nl", "enterprise-architecture", "layered-architecture", "microservices", "bounded-context", "supervision", "otp", "behaviour"]
word_count = 1665
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Software Architecture - Prismatic Platform"
+++

## Definition

**Software Architecture** is the set of structures needed to reason about a software system -- comprising software elements, relations among them, and properties of both. It defines the fundamental organization of a system: its components, their responsibilities, the interfaces through which they communicate, and the principles and constraints governing their composition and evolution. Within the Prismatic Platform, software architecture manifests as a 115-application Elixir umbrella organized by domain boundaries, governed by the [3NL](/glossary/3nl/) epistemic framework, enforced through [adapter pattern](/glossary/adapter-pattern/) contracts and [behaviour](/glossary/behaviour/) specifications, and validated by 13 quality domains achieving a 100/100 quality score.

## Overview

Software architecture emerged as a distinct discipline in the 1990s, drawing from decades of systems engineering, structured programming, and object-oriented design. The foundational insight -- that large systems require deliberate structural organization to remain comprehensible, maintainable, and evolvable -- has only grown more important as systems have scaled from thousands to millions of lines of code.

The Prismatic Platform's architecture reflects several key decisions that differentiate it from typical web application architectures:

1. **Umbrella Monorepo** -- Rather than distributed microservices or a monolithic single-app design, Prismatic uses Elixir's umbrella project structure to achieve modular boundaries within a single repository. This provides compile-time dependency checking, shared tooling, and atomic refactoring while maintaining clear domain separation across 115 applications.

2. **Behaviour-Driven Contracts** -- Every inter-module boundary is defined by an Elixir [behaviour](/glossary/behaviour/) (callback specification). This enforces interface contracts at compile time through Dialyzer and enables hot-swapping of implementations without breaking consumers.

3. **Domain-Driven Organization** -- Applications are grouped by business domain ([Domain-Driven Design](/glossary/domain-driven-design/)), not by technical layer. Storage, business logic, and presentation for a given domain live in related but separate umbrella apps (e.g., `prismatic_storage_core`, `prismatic_storage_ets`, `prismatic_storage_ecto`).

4. **OTP Supervision Topology** -- The runtime architecture is defined by [supervision trees](/glossary/supervision/) that encode fault tolerance directly into the system structure. Process topology is documented before code is written, ensuring that every stateful component has explicit restart strategies and failure isolation.

5. **Epistemic Architecture (3NL)** -- Unique to Prismatic, the [3NL framework](/glossary/3nl/) layers epistemic guarantees (signal plurality, contradiction preservation, provenance tracking) onto the structural architecture, ensuring that the system's reasoning about itself is architecturally sound.

## Technical Details

### Architectural Styles in Context

Software architecture encompasses several established styles, each with distinct trade-offs:

**Monolithic Architecture** places all functionality in a single deployment unit. Simple to develop initially, but becomes difficult to maintain, test, and deploy as the system grows. Prismatic explicitly avoided this pattern.

**Microservices Architecture** decomposes the system into independently deployable services communicating over the network. Provides deployment independence but introduces distributed systems complexity (network failures, eventual consistency, operational overhead). Prismatic borrows the modularity benefits while avoiding the distributed overhead.

**Umbrella Architecture** (Prismatic's approach) achieves microservice-like modularity within a single BEAM runtime. Each umbrella app is a separate OTP application with its own supervision tree, configuration, and dependency list, but all apps share the same deployment artifact and can communicate through direct function calls and message passing:

```elixir
defmodule Prismatic.Architecture.DependencyGraph do
  @moduledoc """
  Validates the dependency graph of the umbrella architecture,
  ensuring no circular dependencies and proper layering.
  """

  @type app_node :: %{
    name: atom(),
    deps: [atom()],
    domain: String.t(),
    layer: :core | :storage | :business | :web | :api
  }

  @type graph :: %{atom() => app_node()}

  @spec build_graph() :: {:ok, graph()} | {:error, term()}
  def build_graph do
    apps =
      Path.wildcard("apps/*/mix.exs")
      |> Enum.map(&parse_mix_file/1)
      |> Enum.reject(&is_nil/1)
      |> Map.new(fn app -> {app.name, app} end)

    {:ok, apps}
  end

  @spec detect_cycles(graph()) :: {:ok, :acyclic} | {:error, {:cycle, [atom()]}}
  def detect_cycles(graph) do
    visited = MapSet.new()
    stack = MapSet.new()

    result =
      Enum.reduce_while(Map.keys(graph), {:ok, visited, stack}, fn node, {:ok, v, s} ->
        case dfs_cycle(node, graph, v, s, []) do
          {:ok, new_v, new_s} -> {:cont, {:ok, new_v, new_s}}
          {:error, cycle} -> {:halt, {:error, {:cycle, cycle}}}
        end
      end)

    case result do
      {:ok, _, _} -> {:ok, :acyclic}
      error -> error
    end
  end

  @spec validate_layering(graph()) :: {:ok, :valid} | {:error, [String.t()]}
  def validate_layering(graph) do
    layer_order = %{core: 0, storage: 1, business: 2, web: 3, api: 3}

    violations =
      Enum.flat_map(graph, fn {name, app} ->
        app_layer = Map.get(layer_order, app.layer, 0)

        Enum.flat_map(app.deps, fn dep ->
          case Map.get(graph, dep) do
            nil -> []
            dep_app ->
              dep_layer = Map.get(layer_order, dep_app.layer, 0)
              if dep_layer > app_layer do
                ["#{name} (#{app.layer}) depends on #{dep} (#{dep_app.layer})"]
              else
                []
              end
          end
        end)
      end)

    case violations do
      [] -> {:ok, :valid}
      v -> {:error, v}
    end
  end

  @spec parse_mix_file(String.t()) :: app_node() | nil
  defp parse_mix_file(path) do
    case File.read(path) do
      {:ok, content} ->
        name = extract_app_name(content)
        deps = extract_deps(content)
        domain = infer_domain(name)
        layer = infer_layer(name)
        %{name: name, deps: deps, domain: domain, layer: layer}
      _ -> nil
    end
  end

  @spec extract_app_name(String.t()) :: atom()
  defp extract_app_name(content) do
    case Regex.run(~r/app:\s*:(\w+)/, content) do
      [_, name] -> String.to_atom(name)
      _ -> :unknown
    end
  end

  @spec extract_deps(String.t()) :: [atom()]
  defp extract_deps(content) do
    Regex.scan(~r/\{:(\w+),\s*in_umbrella:\s*true\}/, content)
    |> Enum.map(fn [_, dep] -> String.to_atom(dep) end)
  end

  @spec infer_domain(atom()) :: String.t()
  defp infer_domain(name) do
    name
    |> Atom.to_string()
    |> String.replace_prefix("prismatic_", "")
    |> String.split("_")
    |> List.first()
  end

  @spec infer_layer(atom()) :: :core | :storage | :business | :web | :api
  defp infer_layer(name) do
    str = Atom.to_string(name)
    cond do
      String.contains?(str, "storage_core") -> :core
      String.contains?(str, "storage") -> :storage
      String.contains?(str, "web") -> :web
      String.contains?(str, "api") -> :api
      true -> :business
    end
  end

  @spec dfs_cycle(atom(), graph(), MapSet.t(), MapSet.t(), [atom()]) ::
          {:ok, MapSet.t(), MapSet.t()} | {:error, [atom()]}
  defp dfs_cycle(node, graph, visited, stack, path) do
    cond do
      MapSet.member?(stack, node) ->
        {:error, Enum.reverse([node | path])}

      MapSet.member?(visited, node) ->
        {:ok, visited, stack}

      true ->
        new_stack = MapSet.put(stack, node)
        deps = Map.get(graph, node, %{deps: []}) |> Map.get(:deps, [])

        result =
          Enum.reduce_while(deps, {:ok, visited, new_stack}, fn dep, {:ok, v, s} ->
            case dfs_cycle(dep, graph, v, s, [node | path]) do
              {:ok, nv, ns} -> {:cont, {:ok, nv, ns}}
              error -> {:halt, error}
            end
          end)

        case result do
          {:ok, final_v, final_s} ->
            {:ok, MapSet.put(final_v, node), MapSet.delete(final_s, node)}
          error -> error
        end
    end
  end
end
```

### Architectural Decision Records

The Prismatic Platform documents significant architectural decisions through a structured ADR (Architectural Decision Record) approach. Key decisions include:

- **ADR-001**: Elixir umbrella over microservices -- chosen for compile-time safety, shared tooling, and atomic deployments
- **ADR-002**: Behaviour-based adapter pattern -- enables implementation swapping (ETS in dev, Horde in production)
- **ADR-003**: Domain-first directory organization -- group by business capability, not technical layer
- **ADR-004**: PrismaticSupervisor for dependency-aware startup -- ensures correct initialization order across 115 apps
- **ADR-005**: 3NL epistemic layer -- structural guarantees for reasoning integrity at the architectural level

### The Adapter Pattern in Architecture

The [adapter pattern](/glossary/adapter-pattern/) is the primary mechanism for architectural flexibility in Prismatic. Every external dependency, storage backend, and service integration is accessed through a [behaviour](/glossary/behaviour/) contract:

```elixir
defmodule Prismatic.Architecture.AdapterRegistry do
  @moduledoc """
  Manages the mapping between behaviour contracts and their
  runtime implementations, supporting hot-swapping and
  environment-specific configuration.
  """

  use GenServer

  @type adapter_mapping :: %{
    behaviour: module(),
    implementation: module(),
    environment: :dev | :test | :prod,
    health_check: (-> boolean())
  }

  @type state :: %{
    mappings: %{module() => adapter_mapping()},
    health_cache: %{module() => {boolean(), integer()}}
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get_implementation(module()) :: {:ok, module()} | {:error, :not_registered}
  def get_implementation(behaviour) do
    GenServer.call(__MODULE__, {:get_impl, behaviour})
  end

  @spec register(module(), module(), keyword()) :: :ok
  def register(behaviour, implementation, opts \\ []) do
    GenServer.call(__MODULE__, {:register, behaviour, implementation, opts})
  end

  @impl true
  def init(_opts) do
    {:ok, %{mappings: %{}, health_cache: %{}}}
  end

  @impl true
  def handle_call({:get_impl, behaviour}, _from, state) do
    case Map.get(state.mappings, behaviour) do
      nil -> {:reply, {:error, :not_registered}, state}
      mapping -> {:reply, {:ok, mapping.implementation}, state}
    end
  end

  @impl true
  def handle_call({:register, behaviour, impl, opts}, _from, state) do
    mapping = %{
      behaviour: behaviour,
      implementation: impl,
      environment: Keyword.get(opts, :env, :dev),
      health_check: Keyword.get(opts, :health_check, fn -> true end)
    }
    new_state = put_in(state, [:mappings, behaviour], mapping)
    {:reply, :ok, new_state}
  end
end
```

### Domain Boundary Enforcement

Architectural integrity requires that domain boundaries are respected at compile time. The platform achieves this through umbrella app dependency declarations in `mix.exs`:

```
                ┌─────────────────────────────────────┐
                │          prismatic_web (UI)          │
                │     LiveView, Controllers, Views     │
                └──────────┬───────────┬──────────────┘
                           │           │
              ┌────────────▼───┐   ┌───▼────────────┐
              │  prismatic     │   │  prismatic_api  │
              │  (coordination)│   │  (REST gateway) │
              └────────┬───┬──┘   └───┬─────────────┘
                       │   │          │
         ┌─────────────▼─┐ │  ┌───────▼────────────┐
         │ prismatic_     │ │  │ prismatic_perimeter │
         │ agents (530)   │ │  │ (EASM, ratings)    │
         └───────┬───────┘ │  └───────┬────────────┘
                 │         │          │
              ┌──▼─────────▼──────────▼──┐
              │   prismatic_storage_core  │
              │   (traits, behaviours)    │
              └──────────┬───────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
     ┌──────▼──────┐ ┌──▼──────┐ ┌──▼───────────┐
     │ storage_ets │ │ storage │ │ storage_     │
     │ (dev/test)  │ │ _ecto   │ │ meilisearch  │
     └─────────────┘ └─────────┘ └──────────────┘
```

## Implementation in Prismatic Platform

### Umbrella Structure

The platform's 115 umbrella applications are organized into distinct architectural domains:

| Domain | Apps | Examples |
|--------|------|----------|
| **Core** | 8 | `prismatic`, `prismatic_core`, `prismatic_types` |
| **Storage** | 12 | `prismatic_storage_core`, `prismatic_storage_ets`, `prismatic_storage_ecto` |
| **Intelligence** | 15 | `prismatic_agents`, `prismatic_osint`, `prismatic_visitor_intelligence` |
| **Security** | 10 | `prismatic_perimeter`, `prismatic_safety`, `prismatic_dark` |
| **Web** | 6 | `prismatic_web`, `prismatic_api`, `prismatic_live` |
| **Quality** | 8 | `prismatic_credo`, `prismatic_quality`, `prismatic_lean` |
| **Infrastructure** | 12 | `prismatic_supervisor`, `prismatic_claude`, `prismatic_telemetry` |
| **Domain-Specific** | 44+ | Various business domain applications |

### PrismaticSupervisor Composition

The [PrismaticSupervisor](/glossary/supervision/) implements dependency-aware startup ordering across all 115 applications:

```elixir
defmodule Prismatic.Architecture.StartupOrchestrator do
  @moduledoc """
  Orchestrates application startup respecting dependency
  ordering derived from the umbrella dependency graph.
  Uses topological sort to determine safe startup order.
  """

  @spec startup_order([atom()], %{atom() => [atom()]}) ::
          {:ok, [atom()]} | {:error, {:cycle, [atom()]}}
  def startup_order(apps, dep_graph) do
    case topological_sort(apps, dep_graph) do
      {:ok, sorted} -> {:ok, sorted}
      {:error, cycle} -> {:error, {:cycle, cycle}}
    end
  end

  @spec topological_sort([atom()], %{atom() => [atom()]}) ::
          {:ok, [atom()]} | {:error, [atom()]}
  defp topological_sort(nodes, graph) do
    in_degree =
      Enum.reduce(nodes, Map.new(nodes, &{&1, 0}), fn node, acc ->
        deps = Map.get(graph, node, [])
        Enum.reduce(deps, acc, fn dep, inner_acc ->
          Map.update(inner_acc, dep, 1, &(&1 + 1))
        end)
      end)

    queue = Enum.filter(nodes, &(Map.get(in_degree, &1, 0) == 0))
    process_queue(queue, in_degree, graph, [])
  end

  @spec process_queue([atom()], map(), map(), [atom()]) ::
          {:ok, [atom()]} | {:error, [atom()]}
  defp process_queue([], in_degree, _graph, result) do
    remaining = Enum.filter(Map.keys(in_degree), &(Map.get(in_degree, &1, 0) > 0))
    case remaining do
      [] -> {:ok, Enum.reverse(result)}
      cycle -> {:error, cycle}
    end
  end

  defp process_queue([node | rest], in_degree, graph, result) do
    dependents =
      Enum.filter(Map.keys(graph), fn n ->
        node in Map.get(graph, n, [])
      end)

    {new_degree, new_queue_additions} =
      Enum.reduce(dependents, {in_degree, []}, fn dep, {deg, additions} ->
        new_deg = Map.update!(deg, dep, &(&1 - 1))
        if Map.get(new_deg, dep) == 0 do
          {new_deg, [dep | additions]}
        else
          {new_deg, additions}
        end
      end)

    process_queue(rest ++ new_queue_additions, new_degree, graph, [node | result])
  end
end
```

### Quality Architecture

The platform's 13 quality domains form an architectural layer that validates structural integrity:

```elixir
defmodule Prismatic.Architecture.QualityDomainRegistry do
  @moduledoc """
  Registry of the 13 quality domains that validate
  architectural and code quality across the platform.
  """

  @type quality_domain :: %{
    name: String.t(),
    module: module(),
    severity: :blocking | :warning,
    scope: :compile_time | :runtime | :both
  }

  @spec all_domains() :: [quality_domain()]
  def all_domains do
    [
      %{name: "Dialyzer", module: Prismatic.Quality.Dialyzer, severity: :blocking, scope: :compile_time},
      %{name: "Credo", module: Prismatic.Quality.Credo, severity: :blocking, scope: :compile_time},
      %{name: "Compilation", module: Prismatic.Quality.Compilation, severity: :blocking, scope: :compile_time},
      %{name: "DateTime Precision", module: Prismatic.Quality.DateTime, severity: :blocking, scope: :both},
      %{name: "Guard Functions", module: Prismatic.Quality.Guards, severity: :blocking, scope: :compile_time},
      %{name: "@impl Coverage", module: Prismatic.Quality.ImplCoverage, severity: :blocking, scope: :compile_time},
      %{name: "Memory Safety", module: Prismatic.Quality.MemorySafety, severity: :blocking, scope: :runtime},
      %{name: "Performance", module: Prismatic.Quality.Performance, severity: :blocking, scope: :runtime},
      %{name: "Regression Prevention", module: Prismatic.Quality.Regression, severity: :blocking, scope: :both},
      %{name: "Timing Patterns", module: Prismatic.Quality.Timing, severity: :blocking, scope: :runtime},
      %{name: "TODO Management", module: Prismatic.Quality.TodoManagement, severity: :warning, scope: :compile_time},
      %{name: "Typespec Coverage", module: Prismatic.Quality.Typespec, severity: :blocking, scope: :compile_time},
      %{name: "Unsafe Map Access", module: Prismatic.Quality.UnsafeMapAccess, severity: :blocking, scope: :compile_time}
    ]
  end

  @spec blocking_domains() :: [quality_domain()]
  def blocking_domains do
    Enum.filter(all_domains(), &(&1.severity == :blocking))
  end
end
```

## Comparison with Alternatives

| Architecture | Strengths | Weaknesses | Prismatic Decision |
|-------------|-----------|------------|-------------------|
| **Monolith** | Simple deployment, easy debugging | Scaling bottleneck, tight coupling | Rejected -- 115 apps need boundaries |
| **Microservices** | Independent deployment, polyglot | Network overhead, operational complexity | Rejected -- BEAM provides enough isolation |
| **Elixir Umbrella** | Compile-time safety, shared tooling, atomic deploys | Single runtime, shared release | Chosen -- optimal for BEAM ecosystem |
| **Hexagonal (Ports & Adapters)** | Clean boundaries, testable | Boilerplate, indirection | Adopted -- via behaviour-based adapters |
| **Event-Driven** | Loose coupling, async processing | Complexity, debugging difficulty | Partial -- [event sourcing](/glossary/event-sourcing/) in specific domains |
| **Layered** | Clear separation, well-understood | Rigid, performance overhead | Partial -- [layered](/glossary/layered-architecture/) within domains |
| **Service Mesh** | Observability, traffic control | Infrastructure complexity | Not needed -- BEAM provides native distribution |

The key architectural insight of the Prismatic Platform is that the BEAM runtime already provides the isolation, fault tolerance, and distribution capabilities that microservices achieve through infrastructure. An Elixir umbrella with proper [behaviour](/glossary/behaviour/) contracts offers the modularity benefits of microservices with the simplicity and performance of a monolith.

## Best Practices

### Architectural Governance

1. **Document Decisions Before Code** -- Every significant architectural change must be captured in an ADR before implementation begins. This prevents architecture-by-accident and ensures that trade-offs are explicitly evaluated.

2. **Enforce Boundaries at Compile Time** -- Use umbrella app dependencies and [behaviour](/glossary/behaviour/) specifications to make boundary violations compilation errors, not runtime surprises. If an app should not depend on another, the `mix.exs` dependency list must not include it.

3. **Domain-First Organization** -- Organize by business capability, not by technical layer. Place the storage, logic, and presentation for a domain in related but separate umbrella apps. This keeps related code close together and unrelated code far apart.

4. **Supervision Topology as Architecture** -- The [supervision tree](/glossary/supervision/) IS the runtime architecture. Document it explicitly and review it as carefully as you review the code itself. Every stateful process must have a named place in the tree.

5. **Behaviour Contracts for Every Boundary** -- Every inter-module interface must be defined by an Elixir behaviour with `@callback` declarations and `@spec` types. This enables [Dialyzer](/glossary/dialyzer/) to catch contract violations at compile time.

6. **Incremental Evolution** -- Architecture evolves through small, validated steps. Never attempt a "big bang" rewrite. Extract new umbrella apps from existing code when domain boundaries become clear.

7. **Quality as Architecture** -- The 13 quality domains are architectural components, not afterthoughts. They enforce invariants that keep the architecture healthy as the codebase grows.

## Common Pitfalls

### 1. Circular Dependencies

Umbrella apps that depend on each other in cycles create compilation deadlocks and indicate unclear domain boundaries. The platform uses `mix git_trees` and dependency graph analysis to detect and prevent cycles at pre-commit time.

### 2. Leaky Abstractions

When higher-level modules directly access lower-level implementation details (bypassing the adapter layer), the architecture degrades. Every access to a storage backend or external service must go through the defined [behaviour](/glossary/behaviour/) contract.

### 3. God Modules

Modules that accumulate too many responsibilities (often named "Manager", "Handler", or "Utils") indicate architectural breakdown. The Prismatic naming policy explicitly forbids these names, forcing developers to find precise, domain-specific names.

### 4. Configuration-Driven Architecture

Over-reliance on runtime configuration to control architectural behavior makes the system unpredictable. Prefer compile-time decisions (module selection, dependency injection) over runtime configuration where possible.

### 5. Ignoring OTP Principles

Writing Elixir code that could be written identically in Node.js means the architecture is not leveraging OTP. Every stateful entity should be a process, every recovery strategy should be a supervision tree, and every side effect should be at the system's edges.

### 6. Premature Decomposition

Creating too many umbrella apps too early leads to excessive indirection and ceremony. Start with fewer, larger apps and extract smaller ones when domain boundaries crystallize through usage.

## Use Cases

### 115-App Umbrella Management

The platform demonstrates that Elixir umbrella projects can scale well beyond typical usage. With 115 applications, architectural governance through automated dependency validation, quality gates, and compile-time boundary enforcement is essential for maintaining coherence.

### Multi-Domain Platform

The Prismatic Platform spans multiple domains (OSINT, security ratings, AI agents, web dashboards, API gateway) that must coexist without contaminating each other. The umbrella architecture with strict dependency rules ensures that `prismatic_perimeter` cannot accidentally depend on `prismatic_web` or vice versa.

### Hot-Swappable Backends

The adapter architecture enables switching from [ETS](/glossary/ets/) storage in development to [Ecto](/glossary/ecto/)/PostgreSQL in production without changing business logic. This is achieved through [behaviour](/glossary/behaviour/) contracts and the AdapterRegistry.

### Evolutionary Architecture

As the platform has evolved from Generation 1 to Generation 19, the architecture has grown from a handful of apps to 115 without requiring a rewrite. The umbrella structure supports incremental growth through app extraction and boundary refinement.

### Quality-Enforced Architecture

The 13 quality domains act as architectural fitness functions, continuously validating that the architecture remains healthy. This is the software equivalent of structural monitoring in civil engineering -- sensors that detect degradation before it becomes catastrophic.

## Related Concepts

- [Domain-Driven Design](/glossary/domain-driven-design/) -- Strategic design approach organizing code by business domains
- [Adapter Pattern](/glossary/adapter-pattern/) -- Structural pattern enabling implementation flexibility behind stable interfaces
- [3NL](/glossary/3nl/) -- Epistemic framework providing reasoning guarantees at the architectural level
- [Enterprise Architecture](/glossary/enterprise-architecture/) -- Organization-wide architectural governance and alignment
- [Layered Architecture](/glossary/layered-architecture/) -- Horizontal layering within domain verticals
- [Microservices](/glossary/microservices/) -- Alternative decomposition strategy using network-separated services
- [Bounded Context](/glossary/bounded-context/) -- DDD concept mapping to umbrella app boundaries
- [Supervision](/glossary/supervision/) -- OTP supervision trees defining runtime process topology
- [OTP](/glossary/otp/) -- The framework providing architectural primitives for fault-tolerant systems
- [Behaviour](/glossary/behaviour/) -- Elixir mechanism for defining interface contracts between modules
- [Architectural Pattern](/glossary/architectural-pattern/) -- Reusable solutions to common architectural challenges
- [Fault Tolerance](/glossary/fault-tolerance/) -- Architectural quality achieved through supervision and isolation

## See Also

- [Elixir](/glossary/elixir/) -- The programming language providing umbrella project capabilities
- [Phoenix](/glossary/phoenix/) -- Web framework built on OTP architectural principles
- [BEAM](/glossary/beam/) -- Virtual machine providing process isolation and distribution
- [Distributed System](/glossary/distributed-system/) -- Architectural category for multi-node deployments
- [Event Sourcing](/glossary/event-sourcing/) -- Architectural pattern for append-only event storage
- [Circuit Breaker](/glossary/circuit-breaker/) -- Resilience pattern within the architectural toolkit
- [Dialyzer](/glossary/dialyzer/) -- Static analysis tool validating architectural contracts
- [Credo](/glossary/credo/) -- Code quality tool enforcing architectural conventions

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
