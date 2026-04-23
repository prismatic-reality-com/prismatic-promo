+++
title = "Registry"
weight = 50
[extra]
description = "A centralized or distributed name-to-process mapping mechanism in Elixir/OTP that enables dynamic process discovery, service location, and pub/sub communication within the Prismatic Platform's 115 umbrella applications"
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "process-infrastructure"
related_concepts = ["genserver", "ets", "otp", "process-isolation", "supervision-tree"]
implementation_status = "production"
authority_level = "platform-foundation"
difficulty_rating = 6
prerequisites = ["elixir", "otp", "genserver", "process-isolation"]
learning_path = ["elixir", "otp", "genserver", "registry", "pubsub", "cluster"]
interactive_demos = ["/labs/glossary/registry"]
code_examples = ["process registration and lookup", "registry-based pub/sub", "partitioned registry for concurrency", "dynamic supervisor with registry"]
external_resources = ["https://hexdocs.pm/elixir/Registry.html", "https://erlang.org/doc/man/global.html", "https://hexdocs.pm/horde/Horde.Registry.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["concurrent registration stress test", "partition affinity validation", "distributed registry convergence", "name conflict resolution"]
keywords = ["Elixir Registry", "OTP process registry", "process name registration", "service discovery Elixir", "pub/sub registry", "partitioned registry", "distributed registry", "Horde Registry"]
tags = ["registry", "otp", "elixir", "process-management", "service-discovery", "infrastructure", "concurrency"]
related_terms = ["genserver", "ets", "otp", "process-isolation", "supervision-tree", "pubsub", "cluster", "agent", "adapter", "scalability"]
word_count = 1771
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Registry - Prismatic Platform"
+++

## Definition

A **Registry** in the Elixir/OTP ecosystem is a process-based data structure that maps arbitrary keys to process identifiers (PIDs), enabling dynamic service discovery, name-based process lookup, and pub/sub communication patterns without relying on global mutable state. Unlike simple atom-based process naming (`Process.register/2`), which is limited to unique atom keys and a single process per name, the Elixir `Registry` module supports both unique and duplicate key modes, partitioning for concurrent access, and metadata attachment -- making it the backbone of dynamic process management in production systems.

In the context of the [Prismatic Platform](/glossary/elixir/), registries serve as the nervous system connecting the platform's 530+ [AIAD agents](/glossary/aiad/), 120 [OSINT](/glossary/osint/) adapters, and hundreds of [supervision trees](/glossary/supervision-tree/) across 115 umbrella applications. Every dynamically spawned process that needs to be discoverable -- whether it is an agent runtime, a storage adapter, or a LiveView session handler -- registers itself through a registry, enabling the rest of the platform to locate and communicate with it by logical name rather than ephemeral PID.

## Overview

The need for a registry arises from a fundamental tension in concurrent systems: processes are identified by PIDs, but PIDs are ephemeral. When a process crashes and its [supervisor](/glossary/supervision-tree/) restarts it, the new process receives a different PID. Any other process holding a reference to the old PID now has a dangling pointer. A registry solves this by providing a stable logical name that automatically updates when processes restart and re-register.

Elixir's built-in `Registry` module, introduced in Elixir 1.4, provides a local (single-node) registry implemented on top of [ETS](/glossary/ets/) tables. For distributed systems spanning multiple nodes, libraries like Horde provide a distributed registry built on Conflict-free Replicated Data Types (CRDTs) that synchronize registrations across a [cluster](/glossary/cluster/).

### Registry Modes

| Mode | Key Constraint | Use Case | Example |
|------|---------------|----------|---------|
| **Unique** | One process per key | Service location, singleton processes | Agent lookup by name |
| **Duplicate** | Multiple processes per key | Pub/sub, event broadcasting | Topic subscribers |

### Registry vs. Alternatives

| Mechanism | Scope | Key Type | Dynamic | Concurrent | Distributed |
|-----------|-------|----------|---------|------------|-------------|
| `Process.register/2` | Node | Atom only | No (fixed set) | No | No |
| `:global` | Cluster | Any term | Yes | Limited | Yes (global lock) |
| `Registry` | Node | Any term | Yes | Yes (partitioned) | No |
| `Horde.Registry` | Cluster | Any term | Yes | Yes | Yes (CRDT) |
| `:pg` (process groups) | Cluster | Any term | Yes | Yes | Yes (gossip) |

## Technical Details

### Architecture

The Elixir `Registry` is implemented as a supervision tree of [ETS](/glossary/ets/) tables. When you start a registry with `N` partitions, it creates `N` ETS tables, and keys are distributed across partitions using `:erlang.phash2/2`. This partitioning eliminates write contention -- concurrent registrations to different partitions proceed without blocking each other.

```
+------------------------------------------------------+
|                  Registry Supervisor                   |
|                                                        |
|  +--------------+  +--------------+  +--------------+ |
|  | Partition 0   |  | Partition 1   |  | Partition N   | |
|  | (ETS Table)   |  | (ETS Table)   |  | (ETS Table)   | |
|  |               |  |               |  |               | |
|  | Key -> {PID,  |  | Key -> {PID,  |  | Key -> {PID,  | |
|  |       meta}   |  |       meta}   |  |       meta}   | |
|  +--------------+  +--------------+  +--------------+ |
|                                                        |
|  Partition = :erlang.phash2(key, N)                    |
|  Process monitors: auto-cleanup on process death       |
+------------------------------------------------------+
```

Key implementation details:

- **Process Monitoring**: The registry automatically monitors every registered process. When a process dies, its entries are automatically cleaned up -- no stale entries accumulate.
- **ETS-Backed**: All lookups are O(1) amortized via ETS hash tables, providing microsecond-level lookup performance.
- **Partition Count**: Defaults to 1 for unique registries and `System.schedulers_online()` for duplicate registries. More partitions reduce contention but increase memory.

### Process Registration

```elixir
defmodule Prismatic.Registry.ProcessManager do
  @moduledoc """
  Demonstrates Registry-based process registration and lookup
  patterns used across the Prismatic Platform for dynamic
  service discovery.
  """

  @registry Prismatic.AgentRegistry

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: via_tuple(name))
  end

  @spec lookup(String.t()) :: {:ok, pid()} | {:error, :not_found}
  def lookup(name) do
    case Registry.lookup(@registry, name) do
      [{pid, _metadata}] -> {:ok, pid}
      [] -> {:error, :not_found}
    end
  end

  @spec list_all() :: [{String.t(), pid(), term()}]
  def list_all do
    Registry.select(@registry, [{{:"$1", :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}])
  end

  @spec count() :: non_neg_integer()
  def count do
    Registry.count(@registry)
  end

  @spec via_tuple(String.t()) :: {:via, Registry, {atom(), String.t()}}
  defp via_tuple(name) do
    {:via, Registry, {@registry, name}}
  end

  @impl GenServer
  def init(opts) do
    state = %{
      name: Keyword.fetch!(opts, :name),
      domain: Keyword.get(opts, :domain, :general),
      started_at: System.monotonic_time(:millisecond)
    }

    {:ok, state}
  end
end
```

### Via Tuples: The Registration Protocol

The `{:via, Registry, {registry, key}}` tuple is the standard mechanism for integrating registries with [GenServer](/glossary/genserver/), [GenStateMachine](/glossary/state-machine/), and other OTP behaviours. When passed as the `:name` option to `GenServer.start_link/3`, the GenServer automatically registers itself in the specified registry under the given key, and unregisters when it terminates.

```elixir
defmodule Prismatic.Registry.ViaDemo do
  @moduledoc """
  Shows how via tuples enable transparent registry integration
  with OTP behaviours. Processes register on start and
  unregister on termination automatically.
  """

  use GenServer

  @registry Prismatic.ServiceRegistry

  @spec start_service(String.t(), map()) :: GenServer.on_start()
  def start_service(service_name, config) do
    GenServer.start_link(
      __MODULE__,
      %{name: service_name, config: config},
      name: {:via, Registry, {@registry, service_name, %{type: :service}}}
    )
  end

  @spec call_service(String.t(), term()) :: term()
  def call_service(service_name, request) do
    GenServer.call({:via, Registry, {@registry, service_name}}, request)
  end

  @spec service_exists?(String.t()) :: boolean()
  def service_exists?(service_name) do
    case Registry.lookup(@registry, service_name) do
      [{_pid, _meta}] -> true
      [] -> false
    end
  end

  @impl GenServer
  def init(state), do: {:ok, state}

  @impl GenServer
  def handle_call(:status, _from, state) do
    {:reply, {:ok, %{name: state.name, uptime_ms: uptime(state)}}, state}
  end

  defp uptime(%{started_at: started_at} = _state) do
    System.monotonic_time(:millisecond) - started_at
  end
end
```

### Pub/Sub with Duplicate Registries

When configured in `:duplicate` mode, a registry allows multiple processes to register under the same key, enabling efficient pub/sub patterns without external dependencies like [Redis](/glossary/redis/) or dedicated message brokers:

```elixir
defmodule Prismatic.Registry.PubSub do
  @moduledoc """
  Registry-based pub/sub implementation. Subscribers register
  under topic keys in a duplicate-mode registry. Publishers
  dispatch messages to all processes registered under a topic.
  """

  @registry Prismatic.PubSubRegistry

  @spec subscribe(String.t()) :: {:ok, term()} | {:error, term()}
  def subscribe(topic) do
    Registry.register(@registry, topic, %{
      subscribed_at: DateTime.utc_now(),
      pid: self()
    })
  end

  @spec unsubscribe(String.t()) :: :ok
  def unsubscribe(topic) do
    Registry.unregister(@registry, topic)
  end

  @spec publish(String.t(), term()) :: :ok
  def publish(topic, message) do
    Registry.dispatch(@registry, topic, fn entries ->
      for {pid, _metadata} <- entries do
        send(pid, {:pubsub_message, topic, message})
      end
    end)
  end

  @spec subscriber_count(String.t()) :: non_neg_integer()
  def subscriber_count(topic) do
    Registry.count_match(@registry, topic, :_)
  end

  @spec all_topics() :: [String.t()]
  def all_topics do
    Registry.select(@registry, [{{:"$1", :_, :_}, [], [:"$1"]}])
    |> Enum.uniq()
  end
end
```

### Partitioned Registry for High Concurrency

For registries that experience heavy concurrent writes (such as the platform's agent registry handling hundreds of agent startups during boot), partitioning distributes the load across multiple ETS tables:

```elixir
defmodule Prismatic.Registry.Setup do
  @moduledoc """
  Registry configuration for the Prismatic Platform.
  Partitioned registries reduce write contention across
  scheduler threads during high-concurrency operations.
  """

  @spec child_specs() :: [Supervisor.child_spec()]
  def child_specs do
    [
      # Unique registry for agent lookup (partitioned for boot performance)
      {Registry, keys: :unique, name: Prismatic.AgentRegistry,
       partitions: System.schedulers_online()},

      # Unique registry for service discovery
      {Registry, keys: :unique, name: Prismatic.ServiceRegistry,
       partitions: System.schedulers_online()},

      # Duplicate registry for pub/sub (partitioned for dispatch throughput)
      {Registry, keys: :duplicate, name: Prismatic.PubSubRegistry,
       partitions: System.schedulers_online()},

      # Unique registry for OSINT adapter management
      {Registry, keys: :unique, name: Prismatic.OSINTRegistry,
       partitions: System.schedulers_online(),
       meta: [started_at: DateTime.utc_now()]}
    ]
  end
end
```

### Dynamic Supervisor + Registry Pattern

The combination of `DynamicSupervisor` and `Registry` is the canonical pattern for managing pools of dynamically created processes in OTP. The supervisor provides fault tolerance (restart on crash) while the registry provides discoverability (lookup by name):

```elixir
defmodule Prismatic.Registry.DynamicPool do
  @moduledoc """
  Combines DynamicSupervisor with Registry to create a
  fault-tolerant, discoverable pool of worker processes.
  Used across the platform for agent runtimes and adapter pools.
  """

  @supervisor Prismatic.WorkerSupervisor
  @registry Prismatic.WorkerRegistry

  @spec start_worker(String.t(), map()) :: {:ok, pid()} | {:error, term()}
  def start_worker(worker_id, config) do
    child_spec = {Prismatic.Worker, id: worker_id, config: config}

    case DynamicSupervisor.start_child(@supervisor, child_spec) do
      {:ok, pid} -> {:ok, pid}
      {:error, {:already_started, pid}} -> {:ok, pid}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec stop_worker(String.t()) :: :ok | {:error, :not_found}
  def stop_worker(worker_id) do
    case Registry.lookup(@registry, worker_id) do
      [{pid, _meta}] ->
        DynamicSupervisor.terminate_child(@supervisor, pid)

      [] ->
        {:error, :not_found}
    end
  end

  @spec worker_count() :: non_neg_integer()
  def worker_count do
    Registry.count(@registry)
  end

  @spec all_workers() :: [%{id: String.t(), pid: pid(), meta: term()}]
  def all_workers do
    Registry.select(@registry, [
      {{:"$1", :"$2", :"$3"}, [], [%{id: :"$1", pid: :"$2", meta: :"$3"}]}
    ])
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses registries at multiple levels of its architecture, from low-level process management to high-level agent orchestration.

### Agent Registry

Every [AIAD agent](/glossary/aiad/) running in the platform registers itself in a dedicated agent registry. This enables the orchestration layer to discover agents by name, domain, or capability without maintaining a separate directory:

| Registry | Mode | Purpose | Typical Entry Count |
|----------|------|---------|-------------------|
| `Prismatic.AgentRegistry` | Unique | Agent lookup by name | 530+ |
| `Prismatic.ServiceRegistry` | Unique | Service discovery | ~200 |
| `Prismatic.PubSubRegistry` | Duplicate | Event broadcasting | ~1,000 subscriptions |
| `Prismatic.OSINTRegistry` | Unique | Adapter management | 120 |
| `Prismatic.QualityRegistry` | Unique | Quality monitor processes | ~50 |

### Storage Adapter Discovery

Each [storage adapter](/glossary/adapter/) (ETS, [Ecto](/glossary/ecto/)/[PostgreSQL](/glossary/postgresql/), [Meilisearch](/glossary/meilisearch/), KuzuDB) registers itself under a canonical name, allowing the storage routing layer to dynamically resolve the appropriate adapter for a given data type:

```elixir
defmodule Prismatic.Registry.StorageDiscovery do
  @moduledoc """
  Storage adapter discovery via Registry. Adapters register
  themselves on startup, and the routing layer resolves
  the correct adapter for each storage operation.
  """

  @registry Prismatic.ServiceRegistry

  @spec resolve_adapter(atom()) :: {:ok, pid()} | {:error, :no_adapter}
  def resolve_adapter(storage_type) do
    key = {:storage_adapter, storage_type}

    case Registry.lookup(@registry, key) do
      [{pid, %{status: :ready}}] -> {:ok, pid}
      [{_pid, %{status: status}}] -> {:error, {:adapter_not_ready, status}}
      [] -> {:error, :no_adapter}
    end
  end

  @spec registered_adapters() :: [%{type: atom(), pid: pid(), status: atom()}]
  def registered_adapters do
    Registry.select(@registry, [
      {{{:storage_adapter, :"$1"}, :"$2", :"$3"}, [], [%{type: :"$1", pid: :"$2", meta: :"$3"}]}
    ])
  end
end
```

### LiveView Session Tracking

Each [LiveView](/glossary/liveview/) session registers in a registry keyed by user session ID, enabling the platform to track active dashboard users, send targeted real-time updates, and enforce session limits.

## Distributed Registry Patterns

For multi-node deployments on [Fly.io](/glossary/fly-io/), the platform uses Horde.Registry, which synchronizes registrations across nodes using CRDTs:

### CRDT-Based Convergence

Horde.Registry uses delta-CRDTs (specifically, an Observed-Remove Map) to replicate registry state across nodes. When a process registers on Node A, the registration propagates to Node B and Node C through periodic delta synchronization. Conflicts (two processes registering the same unique key on different nodes simultaneously) are resolved deterministically using the CRDT's conflict resolution rules.

| Property | Local Registry | Horde Registry |
|----------|---------------|----------------|
| **Scope** | Single node | Cluster-wide |
| **Consistency** | Immediate | Eventually consistent |
| **Conflict Resolution** | First-write-wins | CRDT deterministic merge |
| **Latency** | Microseconds | Milliseconds (cross-node) |
| **Failure Mode** | Node loss = registry loss | Node loss = CRDT reconverges |

### Split-Brain Considerations

In network partition scenarios, a distributed registry faces the fundamental CAP theorem trade-off. Horde chooses availability over consistency -- both sides of a partition can register processes, and when the partition heals, the CRDT merge reconciles the registrations. This matches the Prismatic Platform's operational requirements where continued operation during partitions is more important than strict registration uniqueness.

## Performance Characteristics

Registry performance is critical for the Prismatic Platform's boot time (starting 530+ agents) and runtime operation (continuous lookup and dispatch).

### Benchmark Results

| Operation | Local Registry | Horde Registry | :global |
|-----------|---------------|----------------|---------|
| **Register** | ~2 us | ~50 us | ~500 us |
| **Lookup** | ~1 us | ~5 us | ~100 us |
| **Dispatch (100 subscribers)** | ~10 us | ~50 us | N/A |
| **Count** | ~1 us | ~10 us | ~200 us |
| **Boot (530 registrations)** | ~1 ms | ~30 ms | ~300 ms |

The partitioned local registry achieves near-linear scaling with partition count for concurrent write workloads, because each partition's ETS table has its own write lock.

## Best Practices

**Use via tuples for all dynamically named processes.** The `{:via, Registry, {registry, key}}` pattern integrates seamlessly with GenServer, GenStateMachine, and all OTP behaviours. It handles registration on start and cleanup on termination automatically.

**Partition registries that handle concurrent writes.** Set `partitions: System.schedulers_online()` for registries where multiple processes register simultaneously (boot time, dynamic pool expansion). Leave partition count at 1 for registries with infrequent writes and frequent reads.

**Attach metadata to registrations.** The third element in a via tuple or `Registry.register/3` call stores arbitrary metadata alongside the PID. Use this for process capabilities, health status, or configuration -- it avoids needing to call the process just to inspect its properties.

**Use duplicate registries for pub/sub instead of GenServer-based broadcast.** `Registry.dispatch/3` iterates over subscribed processes in the registry's ETS table, which is faster than maintaining a subscriber list in a GenServer's state and sending messages from a single process.

**Monitor registry size in production.** A growing registry without corresponding process cleanup indicates a resource leak. The platform's [telemetry](/glossary/telemetry/) integration tracks registry count metrics and alerts when thresholds are exceeded.

## Common Pitfalls

**Forgetting that local registries are node-scoped.** A process registered on Node A is not discoverable from Node B through a local `Registry`. Use Horde.Registry or `:pg` for cross-node discovery.

**Using atoms as registry keys at scale.** While atoms are valid registry keys, dynamically generated atom keys (from user input or external data) risk exhausting the atom table. Use strings or tuples as keys for dynamic registrations.

**Not handling the `{:error, {:already_started, pid}}` return.** When restarting a process that re-registers under the same key, the second registration attempt returns this error. The supervisor or caller must handle this case gracefully rather than crashing.

**Blocking inside `Registry.dispatch/3` callbacks.** The dispatch callback runs in the calling process. If it performs blocking operations (GenServer calls, IO), it serializes what should be concurrent work. Use `send/2` in the dispatch callback and handle the message asynchronously in subscribers.

**Over-partitioning registries.** Each partition creates a separate ETS table with its own memory overhead. For small registries (fewer than 100 entries), a single partition is more memory-efficient and equally fast.

## Use Cases

### Agent Orchestration

The platform's 530+ [AIAD agents](/glossary/aiad/) register in `Prismatic.AgentRegistry` on startup. The orchestration layer uses registry lookups to route commands to specific agents by name, discover agents by domain capability, and broadcast coordination messages to agent groups via duplicate registry dispatch.

### OSINT Adapter Pool

Each of the 120 [OSINT](/glossary/osint/) adapters registers under its provider name. When an intelligence query arrives, the routing layer looks up the appropriate adapter by provider key, checks its metadata for health status, and routes the request. If an adapter crashes, the supervisor restarts it and re-registration happens automatically.

### Quality Monitor Discovery

The platform's [quality monitoring](/glossary/quality/) subsystem uses a dedicated registry to track active quality check processes. The [autoheal](/glossary/autoheal/) system queries this registry to discover which monitors are running, their current status, and when they last completed a check cycle.

### Real-Time Dashboard Sessions

[Phoenix LiveView](/glossary/phoenix/) sessions register by user ID, enabling targeted push of [telemetry](/glossary/telemetry/) data to specific dashboard views. When a quality metric changes, the platform dispatches an update only to LiveView processes subscribed to that metric's topic.

## Comparison with External Service Discovery

| Approach | Complexity | Latency | Dependencies | Failure Mode |
|----------|-----------|---------|--------------|-------------|
| **Elixir Registry** | Low | Microseconds | None (stdlib) | Node-scoped |
| **Horde Registry** | Medium | Milliseconds | Horde library | Eventually consistent |
| **Consul** | High | Milliseconds | External service | Consul cluster failure |
| **etcd** | High | Milliseconds | External service | etcd cluster failure |
| **Kubernetes DNS** | Medium | Milliseconds | K8s cluster | DNS propagation delay |
| **ZooKeeper** | High | Milliseconds | External service | ZK ensemble failure |

The Prismatic Platform's choice of Elixir-native registries eliminates external service dependencies for process discovery, reducing operational complexity and failure modes. External service discovery (Consul, etcd) is reserved for cross-language service boundaries where BEAM-native registries cannot reach.

## Related Concepts

- [Registry (OTP)](/glossary/registry-otp/) -- The OTP-specific registry patterns and :global module
- [GenServer](/glossary/genserver/) -- Primary consumer of registry via tuples for named processes
- [ETS](/glossary/ets/) -- Underlying storage mechanism for Registry partitions
- [OTP](/glossary/otp/) -- Framework providing the behaviours that integrate with registries
- [Process Isolation](/glossary/process-isolation/) -- Each registered process runs in its own isolation boundary
- [Supervision Tree](/glossary/supervision-tree/) -- Provides restart guarantees for registered processes
- [PubSub](/glossary/pubsub/) -- Communication pattern enabled by duplicate-mode registries
- [Cluster](/glossary/cluster/) -- Multi-node deployments requiring distributed registries
- [Adapter](/glossary/adapter/) -- Storage and OSINT adapters discovered through registry lookup
- [Scalability](/glossary/scalability/) -- Registry partitioning enables concurrent scaling

## See Also

- [AIAD](/glossary/aiad/) -- Agent framework using registries for agent discovery
- [OSINT](/glossary/osint/) -- Intelligence tools registered as discoverable adapters
- [Telemetry](/glossary/telemetry/) -- Metrics integration for registry monitoring
- [Phoenix](/glossary/phoenix/) -- Web framework leveraging registries for channel/LiveView tracking
- [Fault Tolerance](/glossary/fault-tolerance/) -- Automatic cleanup on process death
- [Ecto](/glossary/ecto/) -- Database adapters discovered through service registry
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- 115 umbrella applications using registries

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
