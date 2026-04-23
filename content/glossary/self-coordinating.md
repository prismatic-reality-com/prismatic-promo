+++
title = "Self-Coordinating"
weight = 50
[extra]
description = "Property of systems or agents that can organize and synchronize their activities without central control, using decentralized communication patterns and emergent coordination protocols."
category = "agents"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "multi-agent-systems"
related_concepts = ["autonomous-agent", "multi-agent-system", "orchestration", "distributed-system", "cooperative-systems", "pubsub", "color-teams"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 8
prerequisites = ["distributed-system", "pubsub", "genserver", "multi-agent-system"]
learning_path = ["genserver", "pubsub", "multi-agent-system", "self-coordinating", "orchestration", "color-teams"]
interactive_demos = ["/labs/glossary/self-coordinating"]
code_examples = ["CoordinationProtocol behaviour", "AgentNegotiator GenServer", "ConsensusBuilder pipeline"]
external_resources = ["https://en.wikipedia.org/wiki/Self-organization", "https://en.wikipedia.org/wiki/Swarm_intelligence", "https://mitpress.mit.edu/9780262731898/"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["multi-agent task allocation", "consensus convergence under partition", "deadlock detection and resolution", "coordination overhead measurement", "graceful degradation without coordinator"]
keywords = ["self-coordinating", "decentralized", "multi-agent", "coordination", "consensus", "PubSub", "emergent behavior", "swarm", "autonomous"]
tags = ["glossary", "agents", "distributed-systems", "coordination", "multi-agent", "autonomy"]
related_terms = ["autonomous-agent", "multi-agent-system", "orchestration", "distributed-system", "cooperative-systems", "pubsub", "color-teams", "agent-orchestration", "consensus-algorithm", "collective-intelligence"]
word_count = 2018
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Self-Coordinating - Prismatic Platform"
+++

## Definition

Self-coordinating describes a property of systems, agents, or processes that can organize and synchronize their activities without relying on a central controller or coordinator. In a self-coordinating system, each participant makes local decisions based on local information and communication with peers, yet the collective behavior produces coherent, goal-directed outcomes that no single participant planned or directed.

This property is distinct from orchestration, where a central controller assigns tasks and manages workflows. In [orchestration](/glossary/orchestration/), removing the orchestrator halts the system. In self-coordination, removing any individual participant degrades capacity but does not halt the system -- the remaining participants adapt, redistribute work, and continue operating. The coordination protocol is distributed across all participants rather than centralized in one.

Self-coordination emerges from three interacting mechanisms: communication (agents can exchange information), decision rules (each agent has local rules for choosing actions based on available information), and feedback (agents observe the effects of their actions and adjust). When these mechanisms are well-designed, complex global behavior emerges from simple local interactions -- a phenomenon studied extensively in complexity science, swarm intelligence, and distributed systems theory.

## Overview

The study of self-coordinating systems spans multiple disciplines. In biology, ant colonies, bee swarms, and fish schools exhibit coordinated behavior without any individual directing the group. In computer science, distributed consensus protocols, gossip-based dissemination, and peer-to-peer networks achieve coordination without central servers. In economics, market mechanisms coordinate millions of actors through price signals without central planning.

The common thread is that coordination emerges from protocol design rather than hierarchy. The protocol defines how agents communicate, what information they share, and how they respond to signals. The protocol does not specify the outcome directly -- it creates the conditions under which desirable outcomes emerge reliably.

For software platforms, self-coordination provides several advantages over centralized orchestration:

**Fault tolerance**: No single point of failure. If any participant fails, the remaining participants detect the failure and compensate. The [supervisor](/glossary/supervisor/) restarts the failed participant, which re-joins the coordination protocol upon recovery.

**Scalability**: Adding new participants increases the system's capacity without requiring changes to a central controller. Each new participant joins the coordination protocol and begins contributing immediately.

**Adaptability**: Self-coordinating systems naturally adapt to changing conditions -- load spikes, resource constraints, participant failures -- because each participant continuously adjusts its behavior based on current conditions rather than following a pre-planned script.

**Reduced bottlenecks**: Central coordinators become bottlenecks under load. Self-coordinating systems distribute decision-making across all participants, eliminating the throughput limitations of a single coordinator.

### Coordination Spectrum

Systems exist on a spectrum from fully centralized to fully decentralized:

```
Fully Centralized          Partially Distributed         Fully Self-Coordinating
     (Master)                  (Leader-Based)                   (Peer-to-Peer)
        |                          |                                |
   Orchestrator              Raft/Paxos leader              Gossip protocol
   assigns all tasks         coordinates consensus          each peer decides
   Single point              Failover-capable               No single point
   of failure                with leader election           of failure
```

The Prismatic Platform operates primarily in the "partially distributed" to "fully self-coordinating" range, using different coordination strategies for different domains. The [color teams](/glossary/color-teams/) use structured self-coordination with designated commanders but peer-to-peer information flow. The [SEADF](/glossary/seadf/) subsystems use a pipeline coordination pattern where each subsystem independently processes its inputs and publishes outputs for downstream consumers.

## Technical Details

### Coordination Protocols in Elixir/OTP

The BEAM virtual machine provides native primitives for building self-coordinating systems: lightweight processes, message passing, process monitoring, and the [PubSub](/glossary/pubsub/) pattern. Each agent is an Erlang process that can send and receive messages, monitor other processes for failures, and subscribe to topics for event-driven coordination.

```elixir
defmodule PrismaticCoordination.Protocol do
  @moduledoc """
  Defines the coordination protocol behaviour for self-coordinating agents.
  Each agent implements this behaviour to participate in decentralized coordination.
  """

  @type agent_id :: String.t()
  @type task :: %{id: String.t(), type: atom(), payload: term(), priority: non_neg_integer()}
  @type capability :: atom()
  @type bid :: %{agent_id: agent_id(), task_id: String.t(), cost: float(), eta: non_neg_integer()}

  @doc "Returns the capabilities this agent offers for task allocation."
  @callback capabilities() :: [capability()]

  @doc "Evaluates a task and returns a bid indicating cost and estimated time."
  @callback evaluate_task(task()) :: {:bid, bid()} | :pass

  @doc "Executes an awarded task and returns the result."
  @callback execute_task(task()) :: {:ok, term()} | {:error, term()}

  @doc "Handles notification that a peer agent has failed."
  @callback handle_peer_failure(agent_id(), [task()]) :: :ok

  @doc "Returns current load factor (0.0 = idle, 1.0 = fully loaded)."
  @callback current_load() :: float()
end
```

### Contract Net Protocol

The Contract Net Protocol (CNP) is a well-established coordination mechanism for multi-agent task allocation. A task announcer broadcasts a task description, agents evaluate the task and submit bids, and the announcer awards the task to the best bidder. In a self-coordinating variant, there is no central announcer -- any agent can announce tasks, and the bidding/awarding process is distributed.

```elixir
defmodule PrismaticCoordination.ContractNet do
  @moduledoc """
  Implements the Contract Net Protocol for decentralized task allocation.
  Any agent can announce tasks; agents bid based on capability and load.
  """

  use GenServer

  alias PrismaticCoordination.Protocol

  @type state :: %{
          agent_id: Protocol.agent_id(),
          pending_announcements: %{String.t() => task_announcement()},
          active_tasks: [Protocol.task()],
          known_peers: MapSet.t(Protocol.agent_id()),
          bid_timeout: non_neg_integer()
        }

  @type task_announcement :: %{
          task: Protocol.task(),
          bids: [Protocol.bid()],
          deadline: integer(),
          announced_at: integer()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)
    GenServer.start_link(__MODULE__, opts, name: via_tuple(agent_id))
  end

  @impl GenServer
  @spec init(keyword()) :: {:ok, state()}
  def init(opts) do
    agent_id = Keyword.fetch!(opts, :agent_id)

    # Subscribe to coordination topics
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "coordination:announcements")
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "coordination:bids")
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "coordination:awards")
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "coordination:heartbeat")

    state = %{
      agent_id: agent_id,
      pending_announcements: %{},
      active_tasks: [],
      known_peers: MapSet.new(),
      bid_timeout: Keyword.get(opts, :bid_timeout, 5_000)
    }

    # Announce presence
    broadcast_heartbeat(state)
    schedule_heartbeat()

    {:ok, state}
  end

  @spec announce_task(Protocol.agent_id(), Protocol.task()) :: :ok
  def announce_task(agent_id, task) do
    GenServer.cast(via_tuple(agent_id), {:announce, task})
  end

  @impl GenServer
  def handle_cast({:announce, task}, state) do
    announcement = %{
      task: task,
      bids: [],
      deadline: System.monotonic_time(:millisecond) + state.bid_timeout,
      announced_at: System.monotonic_time(:millisecond)
    }

    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "coordination:announcements",
      {:task_announced, state.agent_id, task}
    )

    Process.send_after(self(), {:bid_deadline, task.id}, state.bid_timeout)

    updated = %{state | pending_announcements: Map.put(state.pending_announcements, task.id, announcement)}
    {:noreply, updated}
  end

  @impl GenServer
  def handle_info({:task_announced, announcer_id, task}, state) when announcer_id != state.agent_id do
    # Evaluate task and submit bid if capable
    agent_module = get_agent_module(state.agent_id)

    case agent_module.evaluate_task(task) do
      {:bid, bid} ->
        Phoenix.PubSub.broadcast(
          Prismatic.PubSub,
          "coordination:bids",
          {:bid_submitted, state.agent_id, task.id, bid}
        )

      :pass ->
        :ok
    end

    {:noreply, state}
  end

  @impl GenServer
  def handle_info({:bid_submitted, bidder_id, task_id, bid}, state) do
    case Map.get(state.pending_announcements, task_id) do
      nil ->
        {:noreply, state}

      announcement ->
        updated_announcement = %{announcement | bids: [bid | announcement.bids]}
        updated_pending = Map.put(state.pending_announcements, task_id, updated_announcement)
        {:noreply, %{state | pending_announcements: updated_pending}}
    end
  end

  @impl GenServer
  def handle_info({:bid_deadline, task_id}, state) do
    case Map.pop(state.pending_announcements, task_id) do
      {nil, _} ->
        {:noreply, state}

      {announcement, remaining} ->
        case select_winner(announcement.bids) do
          nil ->
            emit_telemetry(:task_unawarded, %{task_id: task_id, bid_count: 0})
            {:noreply, %{state | pending_announcements: remaining}}

          winner ->
            Phoenix.PubSub.broadcast(
              Prismatic.PubSub,
              "coordination:awards",
              {:task_awarded, winner.agent_id, announcement.task}
            )

            emit_telemetry(:task_awarded, %{
              task_id: task_id,
              winner: winner.agent_id,
              bid_count: length(announcement.bids)
            })

            {:noreply, %{state | pending_announcements: remaining}}
        end
    end
  end

  @impl GenServer
  def handle_info({:heartbeat, peer_id}, state) do
    {:noreply, %{state | known_peers: MapSet.put(state.known_peers, peer_id)}}
  end

  @impl GenServer
  def handle_info({:task_awarded, winner_id, task}, state) when winner_id == state.agent_id do
    agent_module = get_agent_module(state.agent_id)

    # Execute in a monitored task to avoid blocking the coordination loop
    Task.Supervisor.start_child(PrismaticCoordination.TaskSupervisor, fn ->
      case agent_module.execute_task(task) do
        {:ok, result} ->
          emit_telemetry(:task_completed, %{task_id: task.id, agent: state.agent_id})
          {:ok, result}

        {:error, reason} ->
          emit_telemetry(:task_failed, %{task_id: task.id, agent: state.agent_id, reason: reason})
          {:error, reason}
      end
    end)

    {:noreply, %{state | active_tasks: [task | state.active_tasks]}}
  end

  @impl GenServer
  def handle_info({:task_awarded, _winner_id, _task}, state), do: {:noreply, state}
  def handle_info({:task_announced, _self, _task}, state), do: {:noreply, state}

  @spec select_winner([Protocol.bid()]) :: Protocol.bid() | nil
  defp select_winner([]), do: nil
  defp select_winner(bids) do
    # Select lowest cost bid; ties broken by earliest ETA
    Enum.min_by(bids, fn bid -> {bid.cost, bid.eta} end)
  end

  defp broadcast_heartbeat(state) do
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "coordination:heartbeat",
      {:heartbeat, state.agent_id}
    )
  end

  defp schedule_heartbeat do
    Process.send_after(self(), :send_heartbeat, 10_000)
  end

  defp via_tuple(agent_id), do: {:via, Registry, {PrismaticCoordination.Registry, agent_id}}
  defp get_agent_module(_agent_id), do: PrismaticCoordination.DefaultAgent

  defp emit_telemetry(event, metadata) do
    :telemetry.execute([:prismatic, :coordination, event], %{count: 1}, metadata)
  end
end
```

### Gossip-Based State Dissemination

For coordination tasks that do not require strict consensus -- load information, capability discovery, health status -- gossip protocols provide efficient, scalable information dissemination. Each agent periodically shares its state with a random subset of peers. Information propagates exponentially through the network, reaching all participants in O(log N) rounds.

```elixir
defmodule PrismaticCoordination.Gossip do
  @moduledoc """
  Gossip-based state dissemination for agent coordination.
  Propagates load, capability, and health information across the agent mesh.
  """

  use GenServer

  @type gossip_state :: %{
          agent_id: String.t(),
          local_state: map(),
          peer_states: %{String.t() => %{state: map(), version: pos_integer(), received_at: integer()}},
          gossip_interval: pos_integer(),
          fanout: pos_integer()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  @spec init(keyword()) :: {:ok, gossip_state()}
  def init(opts) do
    state = %{
      agent_id: Keyword.fetch!(opts, :agent_id),
      local_state: %{load: 0.0, capabilities: [], health: :healthy},
      peer_states: %{},
      gossip_interval: Keyword.get(opts, :gossip_interval, 5_000),
      fanout: Keyword.get(opts, :fanout, 3)
    }

    schedule_gossip(state.gossip_interval)
    {:ok, state}
  end

  @spec update_local_state(map()) :: :ok
  def update_local_state(updates) do
    GenServer.cast(__MODULE__, {:update_local, updates})
  end

  @spec get_cluster_state() :: %{String.t() => map()}
  def get_cluster_state do
    GenServer.call(__MODULE__, :cluster_state)
  end

  @spec find_available_agents(atom()) :: [{String.t(), float()}]
  def find_available_agents(capability) do
    GenServer.call(__MODULE__, {:find_agents, capability})
  end

  @impl GenServer
  def handle_cast({:update_local, updates}, state) do
    updated_local = Map.merge(state.local_state, updates)
    {:noreply, %{state | local_state: updated_local}}
  end

  @impl GenServer
  def handle_call(:cluster_state, _from, state) do
    all_states =
      state.peer_states
      |> Enum.map(fn {id, %{state: s}} -> {id, s} end)
      |> Map.new()
      |> Map.put(state.agent_id, state.local_state)

    {:reply, all_states, state}
  end

  @impl GenServer
  def handle_call({:find_agents, capability}, _from, state) do
    available =
      state.peer_states
      |> Enum.filter(fn {_id, %{state: s}} ->
        capability in Map.get(s, :capabilities, []) and
        Map.get(s, :health) == :healthy and
        Map.get(s, :load, 1.0) < 0.8
      end)
      |> Enum.map(fn {id, %{state: s}} -> {id, Map.get(s, :load, 0.0)} end)
      |> Enum.sort_by(fn {_id, load} -> load end)

    {:reply, available, state}
  end

  @impl GenServer
  def handle_info(:gossip, state) do
    # Select random peers for gossip
    peers = select_gossip_targets(state)

    digest = %{
      agent_id: state.agent_id,
      state: state.local_state,
      version: System.monotonic_time(:millisecond),
      known_peers: Map.keys(state.peer_states)
    }

    Enum.each(peers, fn peer_id ->
      Phoenix.PubSub.broadcast(
        Prismatic.PubSub,
        "coordination:gossip:#{peer_id}",
        {:gossip_digest, digest}
      )
    end)

    schedule_gossip(state.gossip_interval)
    {:noreply, state}
  end

  @impl GenServer
  def handle_info({:gossip_digest, digest}, state) do
    updated_peers =
      Map.put(state.peer_states, digest.agent_id, %{
        state: digest.state,
        version: digest.version,
        received_at: System.monotonic_time(:millisecond)
      })

    # Expire stale peer entries (5x gossip interval)
    max_age = state.gossip_interval * 5
    now = System.monotonic_time(:millisecond)

    pruned_peers =
      Enum.reject(updated_peers, fn {_id, %{received_at: received}} ->
        now - received > max_age
      end)
      |> Map.new()

    {:noreply, %{state | peer_states: pruned_peers}}
  end

  defp select_gossip_targets(state) do
    all_peers = Map.keys(state.peer_states)
    count = min(state.fanout, length(all_peers))
    Enum.take_random(all_peers, count)
  end

  defp schedule_gossip(interval) do
    # Add jitter to prevent synchronization
    jitter = :rand.uniform(div(interval, 4))
    Process.send_after(self(), :gossip, interval + jitter)
  end
end
```

### Consensus Mechanisms

For decisions that require agreement among all participants (leader election, configuration changes, critical state transitions), self-coordinating systems use consensus protocols. The key insight is that consensus can be achieved without a pre-designated leader -- the leader emerges from the protocol itself.

| Protocol | Consistency | Fault Tolerance | Latency | Use in Prismatic |
|----------|------------|-----------------|---------|------------------|
| **Raft** | Strong | N/2 failures | 2 round trips | Horde cluster coordination |
| **Gossip** | Eventual | Arbitrary failures | O(log N) | Agent state dissemination |
| **CRDTs** | Strong eventual | Network partitions | Local (merge on sync) | Distributed counters, sets |
| **Contract Net** | Task-level | Individual agent failures | 1 bidding round | Multi-agent task allocation |

## Implementation in Prismatic Platform

### Color Team Self-Coordination

The [color teams](/glossary/color-teams/) provide the most visible example of self-coordination in the Prismatic Platform. Six teams (Gray, Red, Blue, Purple, White, Black) coordinate through a structured signal flow without a central controller.

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis) --> Blue (defense)
                                    ^                          |       ^           |
                                    |                          v       |           v
                               Black (threat models)     White (proofs)    Platform Defense
```

Each team operates autonomously within its domain. Gray team discovers boundary conditions and publishes findings. Red team consumes Gray findings and generates adversarial scenarios. Purple team synthesizes Red attack findings with Blue defensive posture. No single entity orchestrates this flow -- each team subscribes to relevant topics and acts on published signals.

The coordination protocol is defined by the signal types and topics:

| Signal | Publisher | Subscribers | Topic |
|--------|-----------|-------------|-------|
| Boundary finding | Gray | Red, Purple | `color_team:gray:findings` |
| Attack scenario | Red | Purple, Blue | `color_team:red:scenarios` |
| Defensive posture | Blue | Purple | `color_team:blue:posture` |
| Synthesis report | Purple | All teams | `color_team:purple:synthesis` |
| Verification proof | White | Purple | `color_team:white:proofs` |
| Threat model | Black | Red, Purple | `color_team:black:models` |

### AIAD Agent Mesh

The 530+ [AIAD](/glossary/aiad/) agents form a self-coordinating mesh where agents discover each other through the [agent registry](/glossary/agent-registry/), advertise capabilities, and negotiate task execution through the coordination protocol. Each agent operates independently but contributes to platform-wide goals through the coordination patterns described above.

The agent mesh uses a layered coordination architecture:

1. **Discovery layer**: Agents register capabilities in the registry at startup
2. **Heartbeat layer**: Gossip protocol disseminates load and health information
3. **Task layer**: Contract Net Protocol handles task allocation and execution
4. **Supervision layer**: OTP supervisors restart failed agents, which re-join the mesh

### PubSub as Coordination Infrastructure

Phoenix [PubSub](/glossary/pubsub/) provides the communication backbone for self-coordination. Topics are organized hierarchically, allowing agents to subscribe to specific domains or broad categories:

| Topic Pattern | Scope | Example |
|---------------|-------|---------|
| `coordination:*` | All coordination messages | Heartbeats, bids, awards |
| `color_team:*` | All color team signals | Findings, scenarios, posture |
| `quality:*` | Quality domain events | Violations, improvements, metrics |
| `evolution:*` | Evolution events | Fitness changes, generation advances |

PubSub's broadcast model is inherently self-coordinating: publishers do not need to know their subscribers, subscribers do not need to know their publishers, and the system continues functioning when participants join or leave.

## Comparison with Alternatives

### Self-Coordinating vs. Centralized Orchestration

| Dimension | Self-Coordinating | Centralized Orchestration |
|-----------|-------------------|---------------------------|
| **Single point of failure** | None | Orchestrator is SPOF |
| **Scalability** | Linear (add participants) | Limited by orchestrator capacity |
| **Latency** | Peer-to-peer (low) | Through orchestrator (higher) |
| **Complexity** | Distributed (harder to debug) | Centralized (easier to trace) |
| **Consistency** | Eventual (typically) | Strong (orchestrator enforces) |
| **Adaptability** | High (agents adapt locally) | Low (orchestrator must be updated) |

### Self-Coordinating vs. Choreography

Choreography defines interactions through contracts between pairs of services. Self-coordination defines interactions through protocols that any participant can follow. Choreography requires explicit bilateral contracts; self-coordination uses broadcast protocols. The distinction is subtle but important: choreography is point-to-point, self-coordination is many-to-many.

### Self-Coordinating vs. Event-Driven Architecture

[Event-driven architecture](/glossary/event-sourcing/) is a communication pattern; self-coordination is a behavioral property. Event-driven systems may or may not be self-coordinating -- an event-driven system with a central event processor is not self-coordinating. Self-coordinating systems typically use event-driven communication (PubSub) as their coordination mechanism, but the self-coordination emerges from the agent decision rules, not from the event infrastructure alone.

## Best Practices

**Design coordination protocols, not coordinators**. Instead of building a central brain that tells agents what to do, design the rules that agents follow to decide what to do. The protocol should produce correct collective behavior when followed by any number of independent agents.

**Use gossip for state dissemination, consensus for decisions**. Not every coordination task requires strong consensus. Load balancing, capability discovery, and health monitoring work well with eventual consistency (gossip). Only critical decisions -- leader election, configuration changes -- require consensus protocols.

**Implement heartbeats for failure detection**. Self-coordinating systems must detect participant failures to redistribute work. Heartbeat mechanisms with configurable timeouts provide reliable failure detection. The Prismatic Platform's gossip protocol includes heartbeat information in every gossip round.

**Bound coordination overhead**. Self-coordination has communication costs. Each agent exchanges messages with peers, consuming bandwidth and processing time. Bound the fanout (number of peers per gossip round), the gossip interval, and the message size to keep overhead proportional to the coordination benefit.

**Test coordination under partition**. Network partitions split self-coordinating systems into disconnected groups. Test that each partition continues functioning independently and that the system reconverges when the partition heals. The BEAM's distribution primitives (`Node.monitor/2`, `:net_kernel.monitor_nodes/1`) enable partition simulation in test environments.

## Common Pitfalls

**Assuming self-coordination is simpler than orchestration**. Self-coordinating systems trade centralized complexity for distributed complexity. Debugging, tracing, and reasoning about system behavior is harder when there is no central point to inspect. Invest in [observability](/glossary/observability/) and [distributed tracing](/glossary/distributed-tracing/) to compensate.

**Designing for the happy path only**. Self-coordination must handle agent failures, message loss, network partitions, split-brain scenarios, and message reordering. A protocol that works when all agents are healthy but fails under partial failure is not self-coordinating -- it is fragile.

**Ignoring convergence time**. After a perturbation (agent failure, load spike, configuration change), self-coordinating systems need time to reach a new stable state. If convergence takes too long, the system may appear chaotic during transitions. Design protocols with bounded convergence time and test convergence under realistic conditions.

**Creating implicit coordination dependencies**. If agent A assumes agent B will always handle certain tasks, the system has an implicit coordination dependency that breaks self-coordination. Each agent should be prepared to handle any task it is capable of, based on the coordination protocol's allocation, not on assumptions about other agents.

**Neglecting the thundering herd problem**. When a failure occurs, all agents may simultaneously attempt to compensate, creating a thundering herd that overwhelms the system. Jitter (random delays), exponential backoff, and [rate limiting](/glossary/rate-limiting/) prevent this cascading response.

## Use Cases

### Multi-Agent Security Assessment

The [color team](/glossary/color-teams/) system demonstrates self-coordination in security operations. When a [gray team](/glossary/gray-team/) agent discovers a boundary condition, it publishes the finding. Multiple [red team](/glossary/red-team/) agents independently evaluate whether the finding is exploitable. The red team agents that find viable attack scenarios publish them, and [blue team](/glossary/blue-team/) agents independently develop defensive responses. No central coordinator manages this flow -- the signal types and PubSub topics define the coordination pattern.

### Quality Domain Monitoring

Each of the 13 quality domains in the Prismatic Platform is monitored by independent processes that self-coordinate through telemetry events. When one domain detects a violation, it publishes a telemetry event. The [Quality Floor Guardian](/glossary/quality-floor-guardian/) subscribes to all domain events and synthesizes them into a composite quality assessment. Individual domain monitors do not communicate with each other directly -- they coordinate through the shared telemetry infrastructure.

### Distributed OSINT Collection

The platform's 120 [OSINT](/glossary/osint/) tools operate as a self-coordinating collection system. Each tool independently queries its data source, processes results, and publishes findings to a shared topic. An [entity resolution](/glossary/entity-resolution/) system subscribes to all OSINT findings and merges them into unified entity profiles. Adding a new OSINT tool requires only implementing the tool and subscribing to the appropriate topic -- no central coordinator needs modification.

### Autonomous Evolution Coordination

The [SEADF](/glossary/seadf/) subsystems (Scanner, Pipeline, Quality Guardian, Knowledge Sync, Cross-Domain Innovator, Autonomous Reporter, Enhanced Healing) are self-coordinating. The Scanner identifies improvement opportunities and publishes them. The Pipeline processes improvements through validation stages. The Quality Guardian monitors for regressions. Each subsystem operates on its own schedule and reacts to events from other subsystems without central direction.

## Related Concepts

- [Autonomous Agent](/glossary/autonomous-agent/) -- Individual agents that participate in self-coordinating systems
- [Multi-Agent System](/glossary/multi-agent-system/) -- Systems composed of multiple interacting autonomous agents
- [Orchestration](/glossary/orchestration/) -- Centralized coordination pattern that self-coordination replaces
- [Distributed System](/glossary/distributed-system/) -- Systems where self-coordination operates across network boundaries
- [Cooperative Systems](/glossary/cooperative-systems/) -- Systems where agents work toward shared goals through coordination
- [PubSub](/glossary/pubsub/) -- Communication infrastructure enabling decentralized coordination
- [Color Teams](/glossary/color-teams/) -- Security teams demonstrating structured self-coordination
- [Agent Orchestration](/glossary/agent-orchestration/) -- Higher-level patterns for managing agent interactions
- [Consensus Algorithm](/glossary/consensus-algorithm/) -- Protocols enabling distributed agreement without central authority
- [Collective Intelligence](/glossary/collective-intelligence/) -- Emergent intelligence from coordinated agent interactions
- [Supervisor](/glossary/supervisor/) -- OTP supervision enabling fault-tolerant self-coordination
- [SEADF](/glossary/seadf/) -- Self-coordinating framework for platform evolution

## See Also

- [Architecture](/architecture/) -- Platform architecture enabling self-coordinating systems
- [Agents](/agents/) -- 530+ agents participating in the self-coordinating mesh
- [Capabilities](/capabilities/) -- Platform capabilities emerging from self-coordination

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
