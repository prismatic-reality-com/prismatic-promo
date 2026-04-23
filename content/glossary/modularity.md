+++
title = "Modularity"
weight = 50
[extra]
tags = ["glossary", "architecture", "design-principles", "software-engineering", "elixir", "otp", "umbrella", "composability"]
description = "Design principle of decomposing systems into independent, interchangeable components with well-defined interfaces, enabling parallel development, isolated testing, and evolutionary architecture across the Prismatic Platform's 115 umbrella applications"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "software-architecture"
related_concepts = ["composability", "adapter-pattern", "bounded-context", "dependency-injection", "separation-of-concerns", "cohesion", "coupling"]
implementation_status = "production"
authority_level = "platform-architecture"
difficulty_rating = 5
prerequisites = ["elixir", "otp", "umbrella-application", "behaviour"]
learning_path = ["application", "umbrella-application", "behaviour", "adapter-pattern", "modularity", "composability"]
interactive_demos = ["/labs/glossary/modularity"]
code_examples = ["behaviour-definition", "adapter-pattern", "umbrella-structure", "dependency-injection"]
external_resources = ["https://hexdocs.pm/elixir/modules-and-functions.html", "https://hexdocs.pm/mix/Mix.Tasks.New.html", "https://en.wikipedia.org/wiki/Modular_programming"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["module-isolation", "adapter-swapping", "cross-app-integration", "behaviour-compliance"]
keywords = ["modularity", "modular design", "decomposition", "separation of concerns", "umbrella application", "OTP application", "adapter pattern", "behaviour", "interface", "encapsulation"]
related_terms = ["composability", "adapter-pattern", "bounded-context", "umbrella-application", "dependency-injection", "behaviour", "otp-application", "domain-driven-design", "microservices", "cohesion"]
word_count = 1816
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Modularity - Prismatic Platform"
+++

## Definition

Modularity is the design principle of decomposing a software system into discrete, independent, and interchangeable components -- called modules -- each encapsulating a coherent set of responsibilities behind well-defined interfaces. A modular system allows individual components to be developed, tested, deployed, and evolved independently while maintaining clear contracts for inter-component communication. In the context of the Prismatic Platform, modularity manifests as 115 [umbrella applications](/glossary/umbrella-application/) organized by domain, connected through [behaviours](/glossary/behaviour/), [protocols](/glossary/protocol/), and the [adapter pattern](/glossary/adapter-pattern/).

## Overview

Modularity is not merely a structural convenience -- it is a foundational architectural decision that determines a system's capacity for growth, maintainability, and resilience. Systems that lack modularity suffer from tight coupling, where changes in one area cascade unpredictably into others. They resist testing because components cannot be isolated. They resist evolution because refactoring any single piece requires understanding the entire monolith.

The Prismatic Platform embraces modularity at every level of its architecture. At the macro level, the Elixir [umbrella application](/glossary/umbrella-application/) structure divides the platform into 115 distinct applications, each with its own supervision tree, test suite, and dependency manifest. At the micro level, individual modules use [behaviours](/glossary/behaviour/) and [protocols](/glossary/protocol/) to define contracts that enable multiple implementations to coexist transparently. At the operational level, the [AIAD](/glossary/aiad/) standard organizes 530+ agents into modular hierarchies where each agent has a single, well-defined responsibility.

The benefits compound over time. When the platform needed to add KuzuDB graph storage alongside existing PostgreSQL and ETS backends, modularity through the [adapter pattern](/glossary/adapter-pattern/) meant the new backend could be added without modifying a single line of existing storage code. When the OSINT toolbox grew from 20 to 120 tools, each tool was an independent module conforming to a shared [behaviour](/glossary/behaviour/), making the expansion trivial to manage.

## Technical Details

### Modularity Dimensions

Modularity operates across several orthogonal dimensions, each contributing to the overall decomposability of a system:

**Structural Modularity** concerns the physical organization of code into separate compilation units, packages, or applications. In Elixir, this means separate `mix.exs` files, distinct `lib/` directories, and isolated `test/` folders for each umbrella application.

**Behavioral Modularity** concerns the definition of contracts that multiple implementations can satisfy. Elixir's `@behaviour` and `@callback` mechanisms provide compile-time enforcement of these contracts, while protocols offer runtime polymorphism based on data types.

**Deployment Modularity** concerns the ability to build, release, and scale individual components independently. OTP releases can include subsets of umbrella applications, enabling targeted deployment of specific capabilities.

**Data Modularity** concerns the isolation of data ownership. Each module owns its data structures and exposes them through explicit APIs rather than sharing internal representations. This prevents the "shared database" anti-pattern that plagues monolithic architectures.

### Key Metrics

The quality of modular decomposition can be measured through several metrics:

| Metric | Definition | Prismatic Target |
|--------|-----------|-----------------|
| **Cohesion** | How related are elements within a module | High (single domain per app) |
| **Coupling** | How dependent are modules on each other | Low (behaviour-mediated) |
| **Fan-in** | Number of modules depending on this module | Controlled via facade pattern |
| **Fan-out** | Number of modules this module depends on | Minimized via DI |
| **Instability** | Fan-out / (Fan-in + Fan-out) | Balanced per dependency direction |
| **Abstractness** | Ratio of abstract to concrete elements | High for core, low for adapters |

### Information Hiding

The principle of information hiding, introduced by David Parnas in 1972, is the theoretical foundation of modularity. Each module conceals its internal design decisions behind a stable interface. When internal decisions change -- algorithm optimizations, data structure modifications, implementation language switches -- the rest of the system remains unaffected.

In Elixir, information hiding is achieved through:
- Module-level encapsulation (private functions via `defp`)
- Opaque types that prevent callers from depending on internal structure
- Facade modules that expose curated public APIs for entire applications

## Implementation in Prismatic Platform

### Umbrella Application Structure

The Prismatic Platform's primary modularity mechanism is the Elixir umbrella application structure. Each of the 115 applications represents a bounded domain with explicit dependencies:

```elixir
defmodule PrismaticStorageCore.MixProject do
  use Mix.Project

  @spec project() :: keyword()
  def project do
    [
      app: :prismatic_storage_core,
      version: "0.1.0",
      build_path: "../../_build",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.19",
      deps: deps(),
      dialyzer: [plt_add_apps: [:ex_unit]],
      test_coverage: [threshold: 80]
    ]
  end

  @spec deps() :: [tuple()]
  defp deps do
    [
      # Only explicit, declared dependencies
      {:prismatic_storage_core, in_umbrella: true},
      {:telemetry, "~> 1.2"}
    ]
  end
end
```

### Behaviour-Based Modularity

The platform uses behaviours extensively to define module contracts. Storage backends, agent implementations, and OSINT adapters all follow this pattern:

```elixir
defmodule PrismaticStorageCore.Adapter do
  @moduledoc """
  Behaviour contract for all storage adapters in the Prismatic Platform.
  Implementations include ETS, Ecto (PostgreSQL), Meilisearch, and KuzuDB.
  """

  @type key :: term()
  @type value :: term()
  @type opts :: keyword()
  @type error :: {:error, atom() | String.t()}

  @callback init(opts()) :: {:ok, state :: term()} | error()
  @callback get(key(), opts()) :: {:ok, value()} | {:error, :not_found} | error()
  @callback put(key(), value(), opts()) :: :ok | error()
  @callback delete(key(), opts()) :: :ok | error()
  @callback list(opts()) :: {:ok, [value()]} | error()

  @doc "Returns adapter metadata for introspection."
  @callback adapter_info() :: %{
    name: atom(),
    version: String.t(),
    capabilities: [atom()]
  }
end
```

### Adapter Swapping at Runtime

Because modules communicate through behaviours rather than concrete implementations, the platform can swap adapters without code changes:

```elixir
defmodule PrismaticStorage.Registry do
  @moduledoc """
  Selects the appropriate storage adapter based on configuration.
  Demonstrates runtime modularity through behaviour-based dispatch.
  """

  @spec adapter() :: module()
  def adapter do
    Application.get_env(:prismatic_storage, :adapter, PrismaticStorage.ETS)
  end

  @spec get(term(), keyword()) :: {:ok, term()} | {:error, atom()}
  def get(key, opts \\ []) do
    adapter().get(key, opts)
  end

  @spec put(term(), term(), keyword()) :: :ok | {:error, atom()}
  def put(key, value, opts \\ []) do
    adapter().put(key, value, opts)
  end
end
```

### AIAD Agent Modularity

The AIAD standard extends modularity to agent definitions. Each of the 530+ agents is a self-contained specification with explicit dependencies, capabilities, and interfaces:

```elixir
defmodule PrismaticAgents.Runtime.Agent do
  @moduledoc """
  Runtime agent behaviour defining the contract for all AIAD agents.
  Each agent is an independent module with lifecycle management.
  """

  @type agent_id :: String.t()
  @type agent_state :: map()
  @type command :: atom()
  @type result :: {:ok, term()} | {:error, term()}

  @callback init(config :: map()) :: {:ok, agent_state()} | {:error, term()}
  @callback handle_command(command(), args :: map(), agent_state()) :: {result(), agent_state()}
  @callback capabilities() :: [atom()]
  @callback dependencies() :: [agent_id()]
  @callback tier() :: 1..5
end
```

### Dependency Graph Enforcement

The platform enforces modularity through automated dependency analysis, preventing circular dependencies and ensuring layered architecture compliance:

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @moduledoc """
  Validates and resolves inter-application dependencies.
  Detects circular dependencies and enforces layered architecture.
  """

  @type app :: atom()
  @type dep_graph :: %{app() => [app()]}

  @spec resolve(dep_graph()) :: {:ok, [app()]} | {:error, {:circular, [app()]}}
  def resolve(graph) do
    case topological_sort(graph) do
      {:ok, sorted} -> {:ok, sorted}
      {:error, cycle} -> {:error, {:circular, cycle}}
    end
  end

  @spec validate_layers([app()], %{app() => atom()}) :: :ok | {:error, [{app(), app()}]}
  def validate_layers(apps, layer_map) do
    violations =
      for app <- apps,
          dep <- Map.get(app, :deps, []),
          layer_rank(layer_map[app]) < layer_rank(layer_map[dep]),
          do: {app, dep}

    case violations do
      [] -> :ok
      list -> {:error, list}
    end
  end

  @spec layer_rank(atom()) :: non_neg_integer()
  defp layer_rank(:core), do: 0
  defp layer_rank(:storage), do: 1
  defp layer_rank(:domain), do: 2
  defp layer_rank(:web), do: 3
  defp layer_rank(_), do: 4

  @spec topological_sort(dep_graph()) :: {:ok, [app()]} | {:error, [app()]}
  defp topological_sort(graph) do
    # Kahn's algorithm for topological sorting
    in_degrees = compute_in_degrees(graph)
    queue = for {node, 0} <- in_degrees, do: node

    do_sort(queue, graph, in_degrees, [])
  end

  @spec compute_in_degrees(dep_graph()) :: %{app() => non_neg_integer()}
  defp compute_in_degrees(graph) do
    all_nodes = Map.keys(graph) ++ List.flatten(Map.values(graph))

    base = Map.new(Enum.uniq(all_nodes), fn node -> {node, 0} end)

    Enum.reduce(graph, base, fn {_node, deps}, acc ->
      Enum.reduce(deps, acc, fn dep, inner_acc ->
        Map.update(inner_acc, dep, 1, &(&1 + 1))
      end)
    end)
  end

  @spec do_sort([app()], dep_graph(), map(), [app()]) ::
          {:ok, [app()]} | {:error, [app()]}
  defp do_sort([], _graph, in_degrees, sorted) do
    if Enum.all?(in_degrees, fn {_k, v} -> v == 0 end) do
      {:ok, Enum.reverse(sorted)}
    else
      cycle = for {node, deg} <- in_degrees, deg > 0, do: node
      {:error, cycle}
    end
  end

  defp do_sort([node | rest], graph, in_degrees, sorted) do
    deps = Map.get(graph, node, [])

    updated_degrees =
      Enum.reduce(deps, in_degrees, fn dep, acc ->
        Map.update!(acc, dep, &(&1 - 1))
      end)

    new_queue = for dep <- deps, Map.get(updated_degrees, dep) == 0, do: dep
    updated_degrees = Map.put(updated_degrees, node, 0)

    do_sort(rest ++ new_queue, graph, updated_degrees, [node | sorted])
  end
end
```

## Comparison with Alternatives

### Modularity vs. Monolithic Architecture

| Aspect | Modular (Prismatic) | Monolithic |
|--------|---------------------|------------|
| **Deployment** | Independent per app | All-or-nothing |
| **Testing** | Isolated, parallel | Global, sequential |
| **Team scaling** | Teams own modules | Everyone touches everything |
| **Compile time** | Incremental | Full rebuild |
| **Dependency control** | Explicit, enforced | Implicit, often circular |
| **Risk of change** | Localized | System-wide |

### Modularity vs. Microservices

Microservices take modularity to the extreme by running each module as an independent network service. The Prismatic Platform uses a middle ground -- umbrella applications that are modular at the code level but deploy as a single BEAM node. This avoids the operational complexity of microservices (service discovery, network latency, distributed transactions) while retaining the development benefits of modularity.

| Aspect | Umbrella Modularity | Microservices |
|--------|---------------------|---------------|
| **Communication** | Function calls (microseconds) | Network calls (milliseconds) |
| **Consistency** | Local transactions | Distributed sagas |
| **Deployment** | Single release | Independent services |
| **Operational overhead** | Low (single node) | High (orchestration, networking) |
| **Fault isolation** | OTP supervision trees | Process isolation |
| **Data sharing** | Shared BEAM VM memory | Serialized over network |

### Modularity vs. Plugin Architecture

Plugin architectures provide extensibility through dynamic loading of components. While powerful for third-party extensibility, they sacrifice compile-time guarantees. Prismatic's [behaviour](/glossary/behaviour/)-based modularity provides both extensibility and compile-time contract verification -- a stronger guarantee than most plugin systems offer.

## Best Practices

### 1. Define Boundaries Before Writing Code

Start by identifying [bounded contexts](/glossary/bounded-context/) in your domain. Each context becomes a separate umbrella application with its own supervision tree and public API. This prevents the common failure mode of splitting modules after a monolith has already formed.

### 2. Depend on Abstractions, Not Implementations

All inter-module communication should flow through [behaviours](/glossary/behaviour/) or [protocols](/glossary/protocol/), never through direct calls to internal functions. This is the Dependency Inversion Principle applied to Elixir -- high-level modules should not depend on low-level modules; both should depend on abstractions.

### 3. Enforce One-Way Dependencies

Dependencies should flow in a single direction: from high-level application modules down to low-level infrastructure modules. The `PrismaticSupervisor.DependencyResolver` enforces this at build time by detecting circular dependencies and layer violations.

### 4. Keep Module Public APIs Minimal

Each module should expose the smallest possible public interface. Use `defp` for internal functions, opaque types for internal data structures, and facade modules to present a curated API. The smaller the interface, the easier it is to maintain backward compatibility.

### 5. Co-locate Related Concerns

Group related functions, types, and tests within the same module or application. Avoid the "layers by type" anti-pattern (all controllers in one directory, all models in another). Instead, organize by feature or domain -- the approach used throughout Prismatic's `apps/` directory.

### 6. Design for Independent Testability

Every module should be testable in complete isolation. If testing a module requires starting the entire application, it is too tightly coupled. Use [dependency injection](/glossary/dependency-injection/) to replace collaborators with test doubles during testing.

### 7. Version Module Interfaces

When a module's public API changes, treat it as a contract change. Use semantic versioning for umbrella applications and maintain changelog documentation. Breaking changes should be rare and well-communicated.

## Common Pitfalls

### 1. Over-Modularization

Creating too many tiny modules with trivial responsibilities leads to "module soup" -- a system where understanding any feature requires tracing through dozens of files. Each module should represent a meaningful abstraction, not just a single function. The Prismatic Platform avoids this by anchoring modularity at the [bounded context](/glossary/bounded-context/) level.

### 2. Shared Mutable State Across Modules

Modules that share ETS tables, GenServer state, or database tables directly break encapsulation. All cross-module data access should go through the owning module's public API. This is enforced in Prismatic through the storage adapter pattern.

### 3. Cyclic Dependencies

When module A depends on module B and module B depends on module A, modularity is compromised. Cycles indicate that the module boundaries are drawn incorrectly. The platform's `mix supervisor deps --cycles` command detects these at build time.

### 4. Leaky Abstractions

When a module's internal implementation details leak through its public API -- for example, returning raw Ecto structs instead of domain-specific types -- callers become coupled to those internal details. Changes to the internal implementation then break callers, defeating the purpose of modularity.

### 5. God Modules

A single module that accumulates responsibilities over time becomes a de facto monolith within the modular structure. Watch for modules with more than 500 lines of code, more than 20 public functions, or names ending in "Manager", "Handler", or "Utils" -- all signs of insufficient decomposition.

### 6. Ignoring Compile-Time Dependencies

In Elixir, compile-time dependencies (macros, `use`, `import`) create stronger coupling than runtime dependencies. A module that `use`s another must recompile when the used module changes. Prefer runtime function calls over compile-time dependencies where possible.

## Use Cases

### 1. Storage Backend Evolution

When the platform needed to add [KuzuDB](/glossary/kuzudb/) graph storage for entity relationships, the modular adapter pattern meant creating a new `PrismaticStorageKuzu` application that implemented the existing `PrismaticStorageCore.Adapter` behaviour. Zero changes were required in any consuming module.

### 2. OSINT Tool Expansion

The OSINT toolbox grew from 20 to 120 adapters across 7 categories. Each adapter is an independent module implementing a shared behaviour. New tools are added by creating a single module file -- no coordination with existing tools required.

### 3. Multi-Team Development

With 115 umbrella applications, multiple developers can work on different parts of the platform simultaneously without merge conflicts. Team A can refactor the storage layer while Team B builds new OSINT adapters, because module boundaries ensure isolation.

### 4. Incremental Platform Evolution

The platform evolved through 19 generations without requiring full rewrites. Modularity enabled incremental improvement -- individual applications could be rewritten, optimized, or replaced while the rest of the system continued operating unchanged.

### 5. Quality Gate Isolation

The [quality gates](/glossary/quality-gates/) system (`mix quality.gates`) can analyze and enforce quality standards on a per-application basis. Failing quality in one module does not block development in unrelated modules, enabling parallel quality improvement.

## Related Concepts

- [Composability](/glossary/composability/) -- the ability to combine modular components into larger structures, building on modularity's independent units
- [Adapter Pattern](/glossary/adapter-pattern/) -- a specific design pattern enabling modularity through interface-based backend swapping
- [Bounded Context](/glossary/bounded-context/) -- Domain-Driven Design concept that informs where module boundaries should be drawn
- [Umbrella Application](/glossary/umbrella-application/) -- Elixir's primary mechanism for structural modularity in large codebases
- [Dependency Injection](/glossary/dependency-injection/) -- technique for decoupling modules by injecting dependencies rather than hardcoding them
- [Behaviour](/glossary/behaviour/) -- Elixir's compile-time contract mechanism that enforces modular interface compliance
- [Domain-Driven Design](/glossary/domain-driven-design/) -- strategic design approach that uses bounded contexts to guide modular decomposition
- [OTP Application](/glossary/otp-application/) -- the runtime unit of modularity in Erlang/OTP systems, with its own supervision tree
- [Microservices](/glossary/microservices/) -- an alternative modularity strategy using network-separated services
- [Protocol](/glossary/protocol/) -- Elixir's data-type-based polymorphism mechanism complementing behaviour-based modularity
- [Supervision Tree](/glossary/supervision-tree/) -- OTP's hierarchical fault isolation structure that reinforces module independence

## See Also

- [Architecture Overview](/architecture/) -- how modularity shapes the platform's overall structure
- [AIAD Standard](/glossary/aiad/) -- modular agent specification framework
- [Composability](/glossary/composability/) -- building larger systems from modular primitives
- [Fault Tolerance](/glossary/fault-tolerance/) -- how modular isolation enables graceful degradation
- [PrismaticSupervisor](/glossary/supervisor/) -- compositional supervision leveraging modular application boundaries

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
