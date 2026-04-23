+++
title = "System Architecture"
description = "Comprehensive guide to system architecture: the fundamental structural organization of software systems encompassing components, relationships, design principles, and quality attributes, with deep Elixir/OTP patterns and Prismatic Platform implementation."
weight = 50

[extra]
category = "architecture"
tags = ["system-architecture", "software-architecture", "design-patterns", "quality-attributes", "otp", "supervision", "distributed-systems", "microservices", "umbrella-application", "architectural-decisions"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
status = "active"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["system-analysis", "supervision-tree", "distributed-systems", "microservices", "layered-architecture", "otp", "umbrella-application", "architectural-pattern", "quality-gates", "scalability"]
key_takeaway = "System architecture defines the fundamental structural decisions that shape a software system's quality attributes -- performance, reliability, scalability, and maintainability -- and these decisions, once made, are the most expensive to change."
platforms = ["elixir", "phoenix", "prismatic"]
use_cases = ["system-design", "architecture-review", "technology-selection", "quality-attribute-optimization", "team-organization"]
prerequisites = ["software-architecture", "distributed-systems", "otp"]
word_count = 934
date_modified = "2026-02-23"
keywords = ["System", "Architecture", "Comprehensive", "ElixirOTP", "Prismatic", "Platform", "glossary", "Prismatic Platform", "Tactics", "Enforcement"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "System Architecture - Prismatic Platform"
+++

## Definition

System architecture is the set of structures needed to reason about a software system, comprising software elements, the relationships among them, and the properties of both. This definition, from Bass, Clements, and Kazman's seminal "Software Architecture in Practice," captures the essence: architecture is not a single diagram or document, but a collection of complementary views (module decomposition, runtime processes, deployment topology) that together describe how a system is organized and why.

Architecture decisions are distinguished from implementation decisions by their scope and cost of change. An architectural decision affects multiple components, constrains future implementation choices, and is expensive to reverse once the system is built. Choosing between a monolithic and microservice deployment model, selecting synchronous versus asynchronous communication patterns, deciding on a supervision hierarchy versus flat process topology -- these are architectural decisions. Choosing a sorting algorithm or formatting a log message are implementation details.

The [Prismatic Platform](/glossary/prismatic-perimeter/) embodies a specific architectural philosophy: an Elixir/OTP umbrella application comprising 115 applications organized into layered domains, communicating through well-defined interfaces, supervised by a hierarchical fault-tolerance tree, and continuously validated by automated [quality gates](/glossary/quality-gates/). This architecture was not arrived at by accident -- it is the result of deliberate architectural decisions optimized for the platform's quality attributes.

## Architectural Views and Perspectives

A complete architectural description requires multiple complementary views. No single diagram captures the full complexity of a non-trivial system:

### Module View

The module view describes how the system is decomposed into code units -- modules, packages, libraries, and their dependency relationships. In the Prismatic Platform, the primary module view is the umbrella application structure:

```elixir
defmodule Prismatic.Architecture.ModuleView do
  @moduledoc """
  Describes the module decomposition of the Prismatic
  Platform umbrella. Each umbrella app represents a
  bounded context with explicit dependencies.
  """

  @layers %{
    core: [
      :prismatic,
      :prismatic_storage_core
    ],
    storage: [
      :prismatic_storage_ets,
      :prismatic_storage_ecto,
      :prismatic_storage_meilisearch,
      :prismatic_storage_kuzu
    ],
    intelligence: [
      :prismatic_agents,
      :prismatic_visitor_intelligence,
      :prismatic_perimeter
    ],
    presentation: [
      :prismatic_web,
      :prismatic_api
    ],
    infrastructure: [
      :prismatic_supervisor,
      :prismatic_safety,
      :prismatic_credo
    ]
  }

  @spec layer_for(atom()) :: atom() | nil
  def layer_for(app) do
    Enum.find_value(@layers, fn {layer, apps} ->
      if app in apps, do: layer
    end)
  end

  @spec allowed_dependency?(atom(), atom()) :: boolean()
  def allowed_dependency?(from_app, to_app) do
    from_layer = layer_for(from_app)
    to_layer = layer_for(to_app)

    layer_order = [:presentation, :intelligence, :storage, :core, :infrastructure]
    from_idx = Enum.find_index(layer_order, &(&1 == from_layer))
    to_idx = Enum.find_index(layer_order, &(&1 == to_layer))

    to_layer == :infrastructure or (from_idx != nil and to_idx != nil and from_idx <= to_idx)
  end

  @spec validate_all_dependencies() :: :ok | {:error, [String.t()]}
  def validate_all_dependencies do
    violations =
      for {app, deps} <- list_all_dependencies(),
          dep <- deps,
          not allowed_dependency?(app, dep) do
        "#{app} -> #{dep}: #{layer_for(app)} cannot depend on #{layer_for(dep)}"
      end

    case violations do
      [] -> :ok
      vs -> {:error, vs}
    end
  end

  defp list_all_dependencies do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(fn path ->
      app = path |> Path.dirname() |> Path.basename() |> String.to_atom()
      deps = Application.spec(app, :applications, [])
        |> Enum.filter(&prismatic_app?/1)
      {app, deps}
    end)
  end

  defp prismatic_app?(app), do: app |> to_string() |> String.starts_with?("prismatic")
end
```

### Component and Connector View

The component and connector (C&C) view describes runtime entities (processes, services, databases) and their communication mechanisms (function calls, messages, HTTP, TCP):

```elixir
defmodule Prismatic.Architecture.RuntimeView do
  @moduledoc """
  Describes the runtime topology of the Prismatic Platform.
  Maps OTP applications to processes, supervisors, and
  communication patterns.
  """

  @type component :: %{
    name: String.t(),
    type: :supervisor | :genserver | :task_supervisor | :registry | :ets_table,
    app: atom(),
    children: [component()]
  }

  @spec describe_runtime_topology() :: [component()]
  def describe_runtime_topology do
    [
      %{
        name: "PrismaticSupervisor",
        type: :supervisor,
        app: :prismatic_supervisor,
        children: [
          %{name: "DomainSupervisor.Core", type: :supervisor, app: :prismatic,
            children: [
              %{name: "AppRegistry", type: :genserver, app: :prismatic, children: []},
              %{name: "HealthMonitor", type: :genserver, app: :prismatic, children: []}
            ]},
          %{name: "DomainSupervisor.Storage", type: :supervisor, app: :prismatic_storage_core,
            children: [
              %{name: "StorageRegistry", type: :registry, app: :prismatic_storage_core, children: []},
              %{name: "ConnectionPool", type: :supervisor, app: :prismatic_storage_ecto, children: []}
            ]},
          %{name: "DomainSupervisor.Intelligence", type: :supervisor, app: :prismatic_agents,
            children: [
              %{name: "AgentPool", type: :supervisor, app: :prismatic_agents, children: []},
              %{name: "TaskSupervisor", type: :task_supervisor, app: :prismatic_agents, children: []}
            ]},
          %{name: "DomainSupervisor.Web", type: :supervisor, app: :prismatic_web,
            children: [
              %{name: "Endpoint", type: :supervisor, app: :prismatic_web, children: []},
              %{name: "PubSub", type: :supervisor, app: :prismatic_web, children: []}
            ]}
        ]
      }
    ]
  end
end
```

### Deployment View

The deployment view maps software components to physical or virtual infrastructure:

```elixir
defmodule Prismatic.Architecture.DeploymentView do
  @moduledoc """
  Describes the deployment topology for staging and
  production environments on Fly.io infrastructure.
  """

  @spec describe_deployment(:staging | :production) :: map()
  def describe_deployment(:staging) do
    %{
      platform: "fly.io",
      app_name: "prismatic-staging",
      url: "https://prismatic-staging.fly.dev",
      regions: ["fra"],
      instances: 1,
      resources: %{
        memory_mb: 512,
        cpu_kind: "shared",
        cpus: 1
      },
      services: %{
        web: %{port: 4000, protocol: :https},
        api: %{port: 4004, protocol: :https}
      },
      databases: %{
        postgresql: %{provider: "fly-postgres", size: "shared-cpu-1x"},
        redis: %{provider: "upstash", tier: "free"}
      }
    }
  end

  def describe_deployment(:production) do
    %{
      platform: "fly.io",
      app_name: "prismatic-prod",
      url: "https://prismatic-prod.fly.dev",
      regions: ["fra", "ams"],
      instances: 2,
      resources: %{
        memory_mb: 1024,
        cpu_kind: "shared",
        cpus: 2
      },
      services: %{
        web: %{port: 4000, protocol: :https},
        api: %{port: 4004, protocol: :https}
      },
      databases: %{
        postgresql: %{provider: "fly-postgres", size: "shared-cpu-2x"},
        redis: %{provider: "upstash", tier: "standard"},
        meilisearch: %{provider: "fly-app", version: "1.6"}
      }
    }
  end
end
```

## Architectural Styles in the Prismatic Platform

The platform combines several architectural styles, each addressing different quality attribute requirements:

### Umbrella Application (Modular Monolith)

The 115-app umbrella structure provides the modularity benefits of [microservices](/glossary/microservices/) (independent compilation, explicit dependencies, separate test suites) without the operational complexity (network partitions, distributed transactions, service discovery):

```elixir
defmodule Prismatic.Umbrella.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: releases(),
      dialyzer: [
        plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
        plt_add_apps: [:mix, :ex_unit]
      ]
    ]
  end

  defp releases do
    [
      prismatic: [
        applications: [
          prismatic: :permanent,
          prismatic_web: :permanent,
          prismatic_api: :permanent,
          prismatic_agents: :permanent,
          prismatic_perimeter: :permanent,
          prismatic_supervisor: :permanent
        ]
      ]
    ]
  end

  defp deps do
    []
  end
end
```

### Supervision Hierarchy (Fault Tolerance)

OTP [supervision trees](/glossary/supervision-tree/) provide the platform's fault tolerance architecture. Each domain has its own supervisor with restart strategies tuned to that domain's failure characteristics:

```elixir
defmodule Prismatic.DomainSupervisor do
  @moduledoc """
  Domain-level supervisor implementing layered fault
  isolation. Each domain's failures are contained
  within its supervision subtree.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    domain = Keyword.fetch!(opts, :domain)
    children = Keyword.fetch!(opts, :children)
    Supervisor.start_link(__MODULE__, {domain, children}, name: via(domain))
  end

  @impl Supervisor
  def init({domain, children}) do
    strategy = strategy_for_domain(domain)
    Supervisor.init(children, strategy: strategy)
  end

  defp strategy_for_domain(:core), do: :one_for_one
  defp strategy_for_domain(:storage), do: :rest_for_one
  defp strategy_for_domain(:intelligence), do: :one_for_one
  defp strategy_for_domain(:web), do: :one_for_one
  defp strategy_for_domain(_), do: :one_for_one

  defp via(domain) do
    {:via, Registry, {Prismatic.DomainRegistry, {__MODULE__, domain}}}
  end
end
```

### Event-Driven Architecture (Decoupling)

[PubSub](/glossary/pubsub/) and [Telemetry](/glossary/telemetry/) provide event-driven communication that decouples producers from consumers:

```elixir
defmodule Prismatic.Architecture.EventBus do
  @moduledoc """
  Event-driven communication layer. Publishers emit events
  without knowing who subscribes. This decouples domains
  and enables extensibility without modification.
  """

  @type event :: %{
    topic: String.t(),
    payload: map(),
    metadata: %{
      source: atom(),
      timestamp: DateTime.t(),
      correlation_id: String.t()
    }
  }

  @spec publish(String.t(), map(), keyword()) :: :ok
  def publish(topic, payload, opts \\ []) do
    event = %{
      topic: topic,
      payload: payload,
      metadata: %{
        source: Keyword.get(opts, :source, :unknown),
        timestamp: DateTime.utc_now(),
        correlation_id: Keyword.get(opts, :correlation_id, generate_id())
      }
    }

    Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, {:event, event})
  end

  @spec subscribe(String.t()) :: :ok | {:error, term()}
  def subscribe(topic) do
    Phoenix.PubSub.subscribe(Prismatic.PubSub, topic)
  end

  defp generate_id, do: Base.encode16(:crypto.strong_rand_bytes(8))
end
```

## Quality Attributes and Architectural Tactics

Architecture exists to satisfy quality attributes. Each quality attribute is achieved through specific architectural tactics:

### Performance

**Tactics**: Caching (ETS tables), connection pooling (Ecto), async processing (Task.async_stream), pagination, lazy evaluation.

**Enforcement**: The platform mandates <250ms page loads, <100ms server renders, <50ms LiveView event handling. Violations block merges.

### Reliability

**Tactics**: [Supervision](/glossary/supervision/) (automatic restart), [circuit breakers](/glossary/circuit-breaker/) (failure isolation), [bulkheads](/glossary/bulkhead-pattern/) (resource isolation), [backpressure](/glossary/backpressure/) (load shedding).

**Enforcement**: [Let-it-crash](/glossary/let-it-crash/) philosophy -- processes fail fast, supervisors restart them. The platform's `:rest_for_one` strategy on storage ensures dependent processes restart when their dependencies fail.

### Scalability

**Tactics**: Process-per-entity concurrency, horizontal scaling via [distributed Erlang](/glossary/distributed-systems/), stateless web tier, database read replicas.

**Enforcement**: The Fly.io deployment supports multi-region instances. The architecture separates state (PostgreSQL, ETS) from compute (Phoenix endpoints).

### Maintainability

**Tactics**: Umbrella decomposition, explicit dependencies, comprehensive [static analysis](/glossary/static-analysis/), automated quality gates, 100% test coverage.

**Enforcement**: 13 quality domains at 100/100 score. Pre-commit hooks block code that degrades any domain.

### Security

**Tactics**: Defense in depth, input validation, authentication/authorization layers, encrypted communication, audit logging.

**Enforcement**: [Prismatic Perimeter](/glossary/prismatic-perimeter/) provides continuous external attack surface monitoring. Color teams conduct adversarial assessment.

## Architectural Decision Records

Significant architectural decisions are documented as Architectural Decision Records (ADRs), providing context, rationale, and consequences for future reference:

```elixir
defmodule Prismatic.Architecture.ADR do
  @moduledoc """
  Represents an Architectural Decision Record.
  Captures the context, decision, rationale, and
  consequences of significant architectural choices.
  """

  @type t :: %__MODULE__{
    id: String.t(),
    title: String.t(),
    status: :proposed | :accepted | :deprecated | :superseded,
    context: String.t(),
    decision: String.t(),
    rationale: String.t(),
    consequences: [String.t()],
    date: Date.t(),
    superseded_by: String.t() | nil
  }

  defstruct [:id, :title, :status, :context, :decision,
             :rationale, :consequences, :date, :superseded_by]

  @spec umbrella_over_microservices() :: t()
  def umbrella_over_microservices do
    %__MODULE__{
      id: "ADR-001",
      title: "Umbrella application over microservices",
      status: :accepted,
      context: """
      The platform requires modular decomposition with independent
      development and testing, but the team size (1 developer)
      cannot sustain microservice operational overhead.
      """,
      decision: """
      Use an Elixir umbrella application with 115+ apps, each
      representing a bounded context with explicit mix.exs dependencies.
      """,
      rationale: """
      Umbrella apps provide compile-time dependency enforcement,
      independent test suites, and module-level isolation without
      requiring service discovery, network serialization, or
      distributed transaction coordination.
      """,
      consequences: [
        "Single deployment artifact simplifies operations",
        "Compile-time dependency checking prevents circular deps",
        "Shared BEAM VM enables efficient inter-app communication",
        "Cannot independently scale individual apps",
        "Single failure domain (mitigated by supervision trees)"
      ],
      date: ~D[2025-01-01]
    }
  end
end
```

## Architecture Evaluation

Systematic architecture evaluation assesses whether the chosen architecture satisfies its quality attribute requirements. The Architecture Tradeoff Analysis Method (ATAM) provides a structured approach:

**Scenario Generation**: Stakeholders generate scenarios describing expected system behaviors and quality requirements. "The system handles a 10x traffic spike with <500ms P99 latency" is a performance scenario.

**Architectural Approach Identification**: For each scenario, the architectural mechanisms that address it are identified. Supervision trees address availability scenarios. ETS caching addresses performance scenarios.

**Sensitivity and Tradeoff Analysis**: Points where the architecture is sensitive (small changes cause large effects) and where quality attributes trade off against each other are documented.

**Risk Identification**: Scenarios that the architecture fails to address, or addresses poorly, are classified as architectural risks requiring mitigation.

## Architecture Evolution and Technical Debt

Architectures evolve over time in response to changing requirements, growing scale, and accumulated learning. Managing this evolution requires balancing forward progress with [technical debt](/glossary/technical-debt/) management:

The Prismatic Platform's evolution from Generation 1 to Generation 19 demonstrates disciplined architectural evolution: each generation introduced new capabilities while maintaining quality. The 0.9995 fitness score indicates near-optimal alignment between the architecture and its requirements.

Key evolutionary patterns include:

**Strangler Fig**: New capabilities are built alongside existing ones, gradually replacing legacy implementations. The storage layer's evolution from direct Ecto calls to the `StorageCore` trait system exemplifies this pattern.

**Expand-Contract**: Interface changes deploy in two phases. First, the new interface is added alongside the old one (expand). Then, consumers migrate to the new interface and the old one is removed (contract).

**Feature Flags**: New architectural capabilities are deployed behind configuration flags, enabling gradual rollout and instant rollback without redeployment.

## Related Concepts

- [System Analysis](/glossary/system-analysis/) -- the examination of existing architectures
- [Supervision Tree](/glossary/supervision-tree/) -- OTP fault tolerance hierarchy
- [Distributed Systems](/glossary/distributed-systems/) -- multi-node architectural concerns
- [Microservices](/glossary/microservices/) -- alternative decomposition strategy
- [Layered Architecture](/glossary/layered-architecture/) -- vertical structural organization
- [OTP](/glossary/otp/) -- the runtime platform enabling BEAM architectures
- [Umbrella Application](/glossary/umbrella-application/) -- Elixir's modular monolith pattern
- [Architectural Pattern](/glossary/architectural-pattern/) -- reusable architectural solutions
- [Quality Gates](/glossary/quality-gates/) -- automated architecture conformance checking
- [Scalability](/glossary/scalability/) -- growth capacity enabled by architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
