+++
title = "multiuser-coordination-commander"
weight = 261
[extra]
domain = "coordination"
level = "L3"
description = "Supreme commander for multiuser session coordination across AI providers. Enforces parallel-safe operations via MCP Blackboard and Mycelial Networks. capabilities: - session_syn..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "otp", "genserver", "supervision-tree", "dynamic-supervisor", "message-passing", "no-doubts", "seadf", "telemetry", "mycelial-network"]
domain_normalized = "orchestration"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2400
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["multiuser-coordination-commander", "Supreme", "Enforces", "Blackboard", "Mycelial", "Networks", "agents", "agent", "Prismatic Platform", "Resource"]
tags = ["agents", "agent", "multiuser-coordination-commander", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "multiuser-coordination-commander - Prismatic Platform"
+++

## Overview

The multiuser-coordination-commander operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's coordination domain, serving as the [supreme commander](/glossary/supreme-commander/) for multiuser session coordination across multiple AI providers. This agent ensures that when multiple users or AI sessions operate concurrently against the same codebase, their operations remain conflict-free, consistent, and parallel-safe. It achieves this through the MCP [Blackboard](/glossary/blackboard/) pattern for shared state management and the [mycelial network](/glossary/mycelial-network/) for cross-session communication.

Built on [OTP](/glossary/otp/) [supervision trees](/glossary/supervision-tree/) and [dynamic supervisors](/glossary/dynamic-supervisor/), every user session runs within its own supervised process group, with the coordination commander managing session lifecycle, resource allocation, and conflict resolution. The [AIAD](/glossary/aiad/) standard governs all coordination protocols, and the [NO MERCY](/glossary/no-mercy/) doctrine ensures that conflicting operations are never silently merged -- conflicts are detected, surfaced, and resolved explicitly.

## Operational Domain

The coordination domain covers all scenarios where multiple agents, users, or AI sessions interact with shared platform resources simultaneously. This includes concurrent code modifications (file-level locking and merge coordination), shared database operations (transaction isolation and conflict detection), parallel test execution (resource partitioning and result aggregation), and cross-session intelligence sharing (blackboard-mediated knowledge propagation). The agent maintains a real-time session registry that tracks all active sessions, their resource claims, and their operational scopes.

| Coordination Scenario | Mechanism | Conflict Resolution |
|----------------------|-----------|-------------------|
| Concurrent File Edits | File-level advisory locks | First-commit-wins with merge assistance |
| Shared Database Access | Transaction isolation levels | Serializable isolation for critical ops |
| Parallel Test Execution | Resource partitioning | Non-overlapping test process namespaces |
| Cross-Session Knowledge | Blackboard pub/sub | Eventually consistent with vector clocks |
| Agent Task Assignment | Distributed work queue | Exactly-once task delivery guarantee |
| Configuration Changes | Optimistic concurrency | Version-gated updates with retry |

## Key Capabilities

- **Session lifecycle management** -- Manages the complete lifecycle of concurrent user sessions from initialization through active operation to graceful termination, including session state persistence and recovery
- **Conflict detection and resolution** -- Monitors resource access patterns across sessions to detect potential conflicts before they occur, implementing both optimistic (version checking) and pessimistic (advisory locking) conflict prevention strategies
- **[Blackboard](/glossary/blackboard/) coordination** -- Maintains the MCP Blackboard as a shared knowledge space where sessions publish discoveries, claim resources, and coordinate activities through structured message protocols
- **[Mycelial network](/glossary/mycelial-network/) session propagation** -- Broadcasts session state changes and coordination signals through the mycelial network, enabling real-time awareness of other sessions' activities
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-healing session recovery when sessions fail or disconnect unexpectedly
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing session count, conflict rates, coordination latency, and resource utilization metrics

## Session Coordination Architecture

```elixir
defmodule Prismatic.Coordination.SessionManager do
  @moduledoc """
  Manages concurrent user sessions with conflict detection
  and blackboard-mediated resource coordination.
  """

  use GenServer

  alias Prismatic.Coordination.{SessionRegistry, ConflictDetector, Blackboard}

  @type session :: %{
    id: String.t(),
    user: String.t(),
    provider: atom(),
    started_at: DateTime.t(),
    resource_claims: MapSet.t(),
    status: :active | :suspended | :terminating
  }

  @impl GenServer
  def init(_opts) do
    {:ok, %{sessions: %{}, locks: %{}, blackboard: Blackboard.init()}}
  end

  @spec register_session(String.t(), atom()) :: {:ok, session()} | {:error, term()}
  def register_session(user, provider) do
    GenServer.call(__MODULE__, {:register, user, provider})
  end

  @impl GenServer
  def handle_call({:register, user, provider}, _from, state) do
    session = %{
      id: Ecto.UUID.generate(),
      user: user,
      provider: provider,
      started_at: DateTime.utc_now(),
      resource_claims: MapSet.new(),
      status: :active
    }

    new_state = put_in(state, [:sessions, session.id], session)
    Blackboard.publish(state.blackboard, :session_registered, session)

    :telemetry.execute(
      [:prismatic, :coordination, :session_registered],
      %{active_sessions: map_size(new_state.sessions)},
      %{user: user, provider: provider}
    )

    {:reply, {:ok, session}, new_state}
  end

  @spec claim_resource(String.t(), String.t()) :: :ok | {:error, :conflict}
  def claim_resource(session_id, resource_path) do
    GenServer.call(__MODULE__, {:claim, session_id, resource_path})
  end

  @impl GenServer
  def handle_call({:claim, session_id, resource_path}, _from, state) do
    case ConflictDetector.check(state.locks, session_id, resource_path) do
      :available ->
        new_locks = Map.put(state.locks, resource_path, session_id)
        {:reply, :ok, %{state | locks: new_locks}}

      {:conflict, holder_id} ->
        :telemetry.execute(
          [:prismatic, :coordination, :conflict_detected],
          %{count: 1},
          %{resource: resource_path, claimant: session_id, holder: holder_id}
        )
        {:reply, {:error, :conflict}, state}
    end
  end
end
```

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with supreme authority over session lifecycle, resource allocation, and conflict resolution across all concurrent platform operations.

## Session Coordination Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Active Sessions | Number of concurrent user sessions | Monitored, no hard limit |
| Conflict Rate | Resource conflicts per session-hour | < 0.1 conflicts/hour |
| Coordination Latency | Time to acquire resource claims | < 5ms for local, < 50ms distributed |
| Session Recovery Time | Time to restore failed session state | < 2 seconds |
| Blackboard Message Rate | Cross-session messages per second | < 100ms propagation delay |
| Lock Contention | Percentage of claims requiring retry | < 5% of all claims |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/sessions list` | Display all active concurrent sessions with their resource claims | L3+ |
| `/sessions resolve` | Manually resolve resource conflicts between competing sessions | L3+ |
| `/sessions terminate` | Gracefully terminate a session with resource release and state cleanup | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [session-debrief-specialist](/agents/session-debrief-specialist/) | Captures coordination events and session outcomes for debrief |
| [code-quality-commander](/agents/code-quality-commander/) | Ensures concurrent code modifications maintain quality standards |
| [evolution-orchestrator-supreme](/agents/evolution-orchestrator-supreme/) | Coordinates evolutionary operations across concurrent sessions |
| [service-mesh-specialist](/agents/service-mesh-specialist/) | Routes inter-session communication through the service mesh |

## Blackboard Protocol

The MCP Blackboard serves as the central coordination substrate. Sessions publish structured messages to topic channels, subscribe to relevant resource notifications, and query the shared state for coordination decisions. The blackboard implements eventual consistency with vector clock ordering, ensuring that all sessions converge on the same view of shared state even under concurrent updates. Messages carry [NABLA Infinity](/glossary/nabla-infinity/) provenance chains, enabling audit trail reconstruction for conflict resolution analysis.

## Session Isolation Model

The multiuser-coordination-commander implements a multi-layered isolation model that ensures concurrent sessions cannot interfere with each other while still enabling controlled knowledge sharing through the blackboard.

### Process-Level Isolation

Each user session runs within its own [DynamicSupervisor](/glossary/dynamic-supervisor/)-managed process group. This provides hard isolation at the [BEAM](/glossary/beam/) process level: a crash in one session's processes cannot propagate to another session. Session processes are monitored, and unexpected termination triggers automatic cleanup of the session's resource claims, preventing resource leaks that could block other sessions.

### File-Level Coordination

Concurrent file modifications represent the most common coordination challenge. The commander implements advisory file locks that follow a "first-claim-wins" model. When a session claims a file for modification, other sessions are blocked from modifying the same file until the claim is released (either explicitly through commit or implicitly through session termination). The advisory nature of these locks means they do not prevent read access -- sessions can always read any file to understand the current state of the codebase.

### Database-Level Isolation

For operations that modify shared database state, the commander ensures appropriate transaction isolation levels. Critical operations (schema migrations, data transformations) use serializable isolation to prevent anomalies. Standard operations use read-committed isolation with optimistic concurrency control -- operations proceed optimistically and retry if they encounter version conflicts. The commander tracks the isolation level required for each operation type and automatically configures the appropriate database transaction settings.

### Knowledge-Level Sharing

While file and database access is isolated, knowledge sharing is explicitly encouraged through the blackboard. Sessions publish their discoveries, decisions, and outcomes to structured blackboard topics, enabling other sessions to benefit from concurrent work. This intentional sharing is mediated through typed message protocols that prevent accidental data leakage while enabling collaborative intelligence.

## Distributed Coordination

When the platform operates across multiple [BEAM](/glossary/beam/) nodes, the coordination commander extends its protocols to handle distributed session management. Resource claims are replicated across nodes using a distributed lock service built on [OTP](/glossary/otp/) distributed Erlang primitives. The blackboard synchronizes across nodes through Phoenix.PubSub's distributed adapter, ensuring that all nodes maintain a consistent view of active sessions and their resource claims. Network partition handling follows a conservative approach: during a partition, sessions on each side of the partition can continue operating on resources they have already claimed, but new claims that conflict with sessions on the other partition are rejected until connectivity is restored.

## Enforcement

All multiuser coordination operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: conflicting writes are never silently merged, resource claims are atomic and consistent, and session failures trigger complete resource release to prevent deadlocks. The [NO DOUBTS](/glossary/no-doubts/) principle requires that all conflict resolution decisions are deterministic and auditable, with full provenance chains linking resource claims to session identities and timestamps.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)