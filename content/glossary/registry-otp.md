+++
title = "Registry (OTP)"
weight = 15
[extra]
category = "architecture"
description = "Process registry enabling name-based lookup and dispatch of dynamically created processes in OTP applications."
related_terms = ["dynamic-supervisor", "supervisor", "cluster", "agent", "beam", "process-isolation", "message-passing", "pubsub", "adapter-pattern"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 853
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Registry", "OTP", "Process", "glossary", "architecture", "Prismatic Platform"]
tags = ["glossary", "architecture", "registry-otp", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Registry (OTP) - Prismatic Platform"
+++

## Definition

Registry is an OTP module included in Elixir's standard library that provides a decentralized, scalable process registry for name-based process lookup and dispatch. Unlike Erlang's built-in `:global` module (which requires cluster-wide coordination) or atom-based naming (which is limited by the atom table), Registry allows processes to be registered under arbitrary keys -- strings, tuples, integers, or any Elixir term -- enabling dynamic, runtime-determined process naming without the risk of atom table exhaustion. Registry supports both unique registrations (exactly one process per key, like a key-value store) and duplicate registrations (multiple processes per key, enabling [PubSub](/glossary/pubsub/)-like fan-out patterns).

Registry achieves high concurrency by partitioning its internal state across multiple ETS tables, one per scheduler, so that concurrent lookups and registrations on different keys do not contend for the same lock. This partitioned design means that Registry scales linearly with the number of CPU cores, making it suitable for systems with thousands or millions of dynamically created processes. Registrations are automatically cleaned up when the registered process terminates, eliminating the need for manual deregistration and preventing stale entries -- a property that leverages the [BEAM](/glossary/beam/)'s process monitoring infrastructure.

The Registry module is commonly used in conjunction with [Dynamic Supervisors](/glossary/dynamic-supervisor/) through the "via tuple" pattern, where processes are started under a DynamicSupervisor and simultaneously registered in a Registry. This combination enables the core OTP pattern for managing pools of dynamically created, named processes -- each process can be looked up by its domain-specific key rather than its process identifier (PID), which changes on restart.

## Context in Prismatic

The Prismatic Platform uses Registry extensively for managing its 434 dynamically spawned agent processes. When agents are created at runtime through [DynamicSupervisor](/glossary/dynamic-supervisor/), they register under domain-specific keys in partitioned registries. This enables efficient O(1) lookup by agent type, domain, tier, or task identifier without maintaining external state or querying a central coordinator. The pattern is critical for the agent ecosystem where processes are frequently created, terminated, and restarted by supervisors.

The platform implements a pluggable registry backend through the [Adapter Pattern](/glossary/adapter-pattern/) with `PrismaticSupervisor.Registry.Behaviour`. In development and single-node production, the `Registry.ETS` backend uses Elixir's standard Registry module backed by local ETS tables. In distributed production with multiple [cluster](/glossary/cluster/) nodes, the `Registry.Horde` backend uses Horde's CRDT-based distributed registry, providing [eventual consistency](/glossary/eventual-consistency/) of process registrations across nodes. The backend is selected at configuration time without code changes, enabling transparent scaling from single-node to multi-node deployments.

## Via Tuples: The Registration Pattern

The "via tuple" is the standard OTP mechanism for integrating Registry with GenServer, Agent, and other OTP behaviours:

```elixir
defmodule PrismaticAgents.Worker do
  use GenServer

  @registry PrismaticAgents.Registry

  # Start with via tuple -- registers in Registry automatically
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    agent_id = Keyword.fetch!(opts, :id)
    name = via_tuple(agent_id)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  # Lookup and call by agent_id -- no PID needed
  @spec get_status(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_status(agent_id) do
    case Registry.lookup(@registry, agent_id) do
      [{pid, _value}] -> GenServer.call(pid, :get_status)
      [] -> {:error, :not_found}
    end
  end

  # Via tuple encapsulates Registry lookup in process naming
  defp via_tuple(agent_id) do
    {:via, Registry, {@registry, agent_id}}
  end

  # GenServer callbacks
  def init(opts) do
    {:ok, %{id: opts[:id], tier: opts[:tier], started_at: DateTime.utc_now()}}
  end

  def handle_call(:get_status, _from, state) do
    {:reply, {:ok, state}, state}
  end
end
```

The via tuple `{:via, Registry, {RegistryName, key}}` tells the GenServer to use Registry for name resolution. When the process starts, it registers under `key` in `RegistryName`. When another process calls `GenServer.call(via_tuple(key), msg)`, the Registry resolves the key to a PID transparently.

## Registry Configuration

Registry is started as a supervised child process, typically in the application's supervision tree:

```elixir
defmodule PrismaticAgents.Application do
  use Application

  def start(_type, _args) do
    children = [
      # Unique registry: one process per key
      {Registry, keys: :unique, name: PrismaticAgents.Registry, partitions: System.schedulers_online()},

      # Duplicate registry: multiple processes per key (for pub-sub)
      {Registry, keys: :duplicate, name: PrismaticAgents.EventRegistry, partitions: System.schedulers_online()},

      # Dynamic supervisor using the registry for process naming
      {DynamicSupervisor, name: PrismaticAgents.DynamicSupervisor, strategy: :one_for_one}
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

| Option | Values | Purpose |
|--------|--------|---------|
| **keys** | `:unique` or `:duplicate` | One process per key vs. many processes per key |
| **name** | Module atom | Registry identifier for lookups |
| **partitions** | Integer (default: 1) | Number of ETS partitions for concurrency |
| **listeners** | List of PIDs | Processes notified on register/unregister events |
| **meta** | Keyword list | Metadata stored in the registry |

## Unique vs. Duplicate Registries

Registry supports two fundamentally different modes:

| Feature | Unique Registry | Duplicate Registry |
|---------|----------------|-------------------|
| **Key Cardinality** | Exactly one process per key | Multiple processes per key |
| **Primary Use** | Process naming, singleton lookup | Fan-out dispatch, event routing |
| **Analogy** | Key-value store | Pub-sub topic subscriptions |
| **Lookup** | Returns single `{pid, value}` | Returns list of `[{pid, value}]` |
| **Registration** | Fails if key already taken | Always succeeds |
| **Prismatic Use** | Agent worker registration | Event listener groups |

```elixir
# Unique: lookup single agent by ID
[{pid, _}] = Registry.lookup(PrismaticAgents.Registry, "agent-001")

# Duplicate: dispatch event to all listeners for a topic
Registry.dispatch(PrismaticAgents.EventRegistry, "security_alert", fn entries ->
  for {pid, _} <- entries do
    send(pid, {:alert, "Critical vulnerability detected"})
  end
end)
```

## Partitioned Architecture

Registry partitions its internal ETS tables across schedulers for concurrent access:

```
Registry with partitions: 4

  Partition 0 (ETS Table):  key_hash % 4 == 0  -->  {key, pid, value}
  Partition 1 (ETS Table):  key_hash % 4 == 1  -->  {key, pid, value}
  Partition 2 (ETS Table):  key_hash % 4 == 2  -->  {key, pid, value}
  Partition 3 (ETS Table):  key_hash % 4 == 3  -->  {key, pid, value}

  Concurrent lookups on different partitions do not contend.
  Optimal partitions = System.schedulers_online()
```

| Partitions | Concurrency | Memory | Optimal For |
|-----------|-------------|--------|------------|
| **1** | Serial access | Minimal | Small registries (< 100 processes) |
| **N (schedulers)** | Full concurrency | N * overhead | Large registries (1000+ processes) |
| **> schedulers** | No additional benefit | Wasted memory | Never recommended |

## Registry.ETS vs. Registry.Horde Backend

The Prismatic Platform abstracts the registry implementation behind a behaviour:

```elixir
defmodule PrismaticSupervisor.Registry.Behaviour do
  @moduledoc "Behaviour for pluggable registry backends."

  @callback register(key :: term(), value :: term()) :: {:ok, pid()} | {:error, term()}
  @callback lookup(key :: term()) :: [{pid(), term()}]
  @callback unregister(key :: term()) :: :ok
  @callback keys() :: [term()]
  @callback count() :: non_neg_integer()
end
```

| Feature | Registry.ETS (Local) | Registry.Horde (Distributed) |
|---------|---------------------|------------------------------|
| **Scope** | Single BEAM node | All nodes in [cluster](/glossary/cluster/) |
| **Consistency** | Strong (immediate) | [Eventually consistent](/glossary/eventual-consistency/) |
| **Performance** | O(1) lookup, microseconds | O(1) lookup, sub-millisecond |
| **Failure Mode** | Lost on node crash | Survives node failures (replicated) |
| **Data Structure** | ETS tables | delta-CRDTs |
| **Configuration** | `config :prismatic, registry: :ets` | `config :prismatic, registry: :horde` |
| **Use Case** | Development, single-node | Production, multi-node |

```elixir
# config/config.exs (development -- local ETS)
config :prismatic_supervisor, :registry_backend, PrismaticSupervisor.Registry.ETS

# config/prod.exs (production -- distributed Horde)
config :prismatic_supervisor, :registry_backend, PrismaticSupervisor.Registry.Horde
```

## Dispatch Patterns

Registry supports efficient dispatch to registered processes:

```elixir
# Dispatch to all processes registered under a key (duplicate registry)
Registry.dispatch(PrismaticAgents.EventRegistry, "domain:security", fn entries ->
  for {pid, metadata} <- entries do
    if metadata.tier in [:l1, :l2] do
      send(pid, {:security_event, event_data})
    end
  end
end)

# Select processes matching a pattern (unique registry)
# Find all agents in the "perimeter" domain
matches = Registry.select(PrismaticAgents.Registry, [
  {{:"$1", :"$2", %{domain: :perimeter}}, [], [{{:"$1", :"$2"}}]}
])

# Count registered processes
count = Registry.count(PrismaticAgents.Registry)
# => 434

# Count processes matching a key pattern
domain_count = Registry.count_match(PrismaticAgents.Registry, "perimeter:*", :_)
```

## Process Lifecycle Integration

Registry integrates with the BEAM's process monitoring to provide automatic cleanup:

```
1. Process starts: GenServer.start_link(Worker, opts, name: {:via, Registry, {Reg, key}})
   --> Registry.register(Reg, key, value)
   --> Registry monitors the process

2. Process runs: Registry.lookup(Reg, key) --> [{pid, value}]

3. Process crashes: Supervisor detects crash
   --> Registry receives :DOWN monitor message
   --> Registry removes {key, pid} entry automatically
   --> No stale entries, no manual cleanup

4. Supervisor restarts: New process registers under same key
   --> Registry.register(Reg, key, new_value)
   --> Lookup returns new PID transparently
```

This lifecycle integration means that callers using via tuples automatically get the restarted process after a crash, without any explicit re-registration code.

## Performance Characteristics

| Operation | Time Complexity | Typical Latency |
|-----------|----------------|-----------------|
| **lookup/2** | O(1) amortized | < 1 microsecond |
| **register/3** | O(1) amortized | < 5 microseconds |
| **unregister/2** | O(1) amortized | < 5 microseconds |
| **dispatch/3** | O(n) where n = matching entries | < 100 microseconds for 100 entries |
| **select/2** | O(n) full scan | Depends on registry size |
| **count/1** | O(partitions) | < 10 microseconds |

## Related Terms

- [Dynamic Supervisor](/glossary/dynamic-supervisor/) - Runtime process creation paired with Registry
- [Supervisor](/glossary/supervisor/) - Static supervision tree using registered names
- [Cluster](/glossary/cluster/) - Multi-node deployment requiring distributed registry
- [Agent](/glossary/agent/) - Platform agents managed via Registry lookup
- [BEAM](/glossary/beam/) - VM providing process monitoring for automatic cleanup
- [Process Isolation](/glossary/process-isolation/) - Each registered process runs independently
- [Message Passing](/glossary/message-passing/) - Communication between registered processes
- [PubSub](/glossary/pubsub/) - Higher-level broadcasting built on duplicate registries
- [Adapter Pattern](/glossary/adapter-pattern/) - Pluggable registry backend pattern
- [Eventual Consistency](/glossary/eventual-consistency/) - Horde registry consistency model

## See Also

- [Architecture](/architecture/) - Platform process management architecture
- [Technologies](/technologies/) - OTP infrastructure components

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)