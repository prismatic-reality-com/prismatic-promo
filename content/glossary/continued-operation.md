+++
title = "Continued Operation"
weight = 50
[extra]
tags = ["glossary", "resilience", "fault-tolerance", "availability", "operations"]
description = "Continued operation is the ability of a system to maintain essential functionality and service availability during component failures, degraded conditions, maintenance windows, and unexpected disruptions, forming the foundation of resilient distributed platform architecture."
category = "resilience"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "reliability-engineering"
related_concepts = ["fault tolerance", "graceful degradation", "high availability", "resilience engineering", "disaster recovery", "service continuity", "failover", "redundancy"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = "advanced"
prerequisites = ["fault-tolerance", "supervision-tree", "distributed-system", "genserver"]
learning_path = ["fault-tolerance", "supervision-tree", "circuit-breaker", "disaster-recovery", "let-it-crash"]
interactive_demos = ["supervisor-restart-simulation", "circuit-breaker-state-transitions", "graceful-degradation-dashboard"]
code_examples = true
external_resources = ["https://erlang.org/doc/design_principles/des_princ.html", "https://hexdocs.pm/elixir/Supervisor.html", "https://ferd.ca/it-s-about-the-guarantees.html"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["process crash recovery", "network partition handling", "cascading failure prevention", "graceful degradation under load", "hot code upgrade continuity"]
keywords = ["continued operation", "fault tolerance", "high availability", "resilience", "graceful degradation", "service continuity", "uptime", "recovery", "supervision", "let it crash"]
related_terms = ["fault-tolerance", "supervision-tree", "let-it-crash", "circuit-breaker", "disaster-recovery", "self-healing", "process-restart", "health-monitoring", "backpressure", "reliability"]
word_count = 1421
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Continued Operation - Prismatic Platform"
+++

## Definition

Continued operation refers to a system's capacity to sustain essential functionality and service delivery when individual components fail, external dependencies become unavailable, resources are constrained, or unexpected conditions arise. Rather than treating failure as an exceptional event to be prevented at all costs, continued operation embraces failure as an inevitable aspect of complex distributed systems and engineers the architecture to absorb, contain, and recover from faults without human intervention.

In the Erlang/OTP tradition that underpins the Prismatic Platform, continued operation is not merely a design goal but an architectural invariant. The BEAM virtual machine, supervision trees, process isolation, and the "let it crash" philosophy collectively ensure that the system continues operating even when individual processes terminate unexpectedly. This stands in stark contrast to defensive programming approaches that attempt to handle every possible error condition within a single process, often leading to increasingly complex and brittle error handling code.

## Overview

The concept of continued operation sits at the intersection of several related but distinct engineering disciplines: fault tolerance (surviving component failures), high availability (maintaining service uptime), resilience engineering (adapting to unexpected conditions), and graceful degradation (reducing functionality rather than failing completely).

### The Spectrum of Continued Operation

Continued operation exists on a spectrum from full functionality to minimal viable service:

**Level 1 -- Full Operation**: All components healthy, all features available, optimal performance. This is the normal steady-state that the system strives to maintain.

**Level 2 -- Degraded Operation**: Some non-critical components unavailable. The system continues serving primary functions but may disable secondary features, reduce refresh rates, or serve cached data.

**Level 3 -- Emergency Operation**: Critical components under stress. The system sheds load, activates circuit breakers, and focuses resources on the most essential services.

**Level 4 -- Minimal Viable Service**: Major subsystems unavailable. The system provides only core functionality -- perhaps read-only access to cached data -- while recovery mechanisms work to restore full capability.

**Level 5 -- Controlled Shutdown**: The system cannot maintain even minimal service and performs an orderly shutdown, preserving state for recovery rather than crashing unpredictably.

### Why Continued Operation Matters

Modern platforms are expected to provide continuous service. Users, API consumers, and dependent systems do not differentiate between "the database crashed" and "the entire platform is down." From their perspective, any service interruption is a failure. Continued operation ensures that internal failures remain internal, presenting a consistent and available interface to the outside world even when subsystems are recovering.

The economic impact is substantial: for a platform processing financial intelligence, security assessments, or OSINT data, even minutes of downtime can compromise time-sensitive investigations, violate SLA commitments, and erode trust. Continued operation transforms catastrophic failure scenarios into manageable degradation events.

## Technical Details

### OTP Supervision: The Foundation

The Erlang Open Telecom Platform (OTP) provides the foundational primitives for continued operation. Supervision trees define a hierarchical structure where parent processes (supervisors) monitor child processes (workers) and apply restart strategies when children terminate:

```elixir
defmodule Prismatic.ContinuedOperation.PlatformSupervisor do
  @moduledoc """
  Top-level supervisor demonstrating continued operation patterns.

  Uses :rest_for_one strategy to ensure dependent services
  restart in order when a foundational service crashes.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Foundation layer -- if this crashes, everything downstream restarts
      {Prismatic.ContinuedOperation.ConfigStore, []},

      # Core services -- depend on config
      {Prismatic.ContinuedOperation.AgentRegistry, []},
      {Prismatic.ContinuedOperation.HealthMonitor, []},

      # Application services -- depend on core
      {Prismatic.ContinuedOperation.QueryEngine, []},
      {Prismatic.ContinuedOperation.NotificationService, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one, max_restarts: 10, max_seconds: 60)
  end
end
```

### Circuit Breaker for External Dependencies

External services (databases, APIs, third-party providers) are the most common cause of continued operation challenges. Circuit breakers prevent a failed external dependency from cascading into platform-wide failure:

```elixir
defmodule Prismatic.ContinuedOperation.CircuitProtectedClient do
  @moduledoc """
  HTTP client with circuit breaker protection for continued operation.

  When an external service fails, the circuit opens and the system
  serves degraded responses (cached data or defaults) rather than
  blocking or crashing.
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @failure_threshold 5
  @reset_timeout_ms 30_000

  defstruct [
    :service_name,
    :base_url,
    state: :closed,
    failure_count: 0,
    last_failure_at: nil,
    cached_response: nil
  ]

  # --- Client API ---

  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @doc """
  Makes a request through the circuit breaker.

  Returns {:ok, response} on success, {:degraded, cached_response}
  when the circuit is open, or {:error, reason} on failure.
  """
  @spec request(GenServer.server(), String.t()) ::
          {:ok, map()} | {:degraded, map()} | {:error, term()}
  def request(server, path) do
    GenServer.call(server, {:request, path})
  end

  # --- Server Callbacks ---

  @impl GenServer
  def init(opts) do
    state = %__MODULE__{
      service_name: Keyword.fetch!(opts, :service_name),
      base_url: Keyword.fetch!(opts, :base_url)
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:request, path}, _from, %{state: :open} = state) do
    if circuit_reset_due?(state) do
      attempt_half_open_request(path, %{state | state: :half_open})
    else
      {:reply, {:degraded, state.cached_response}, state}
    end
  end

  def handle_call({:request, path}, _from, state) do
    case execute_request(state.base_url, path) do
      {:ok, response} ->
        new_state = %{state |
          state: :closed,
          failure_count: 0,
          cached_response: response
        }
        {:reply, {:ok, response}, new_state}

      {:error, reason} ->
        new_state = record_failure(state)
        {:reply, {:error, reason}, new_state}
    end
  end

  defp record_failure(state) do
    new_count = state.failure_count + 1
    new_state = if new_count >= @failure_threshold, do: :open, else: state.state

    %{state |
      failure_count: new_count,
      state: new_state,
      last_failure_at: System.monotonic_time(:millisecond)
    }
  end

  defp circuit_reset_due?(%{last_failure_at: last}) do
    System.monotonic_time(:millisecond) - last >= @reset_timeout_ms
  end

  defp attempt_half_open_request(path, state) do
    case execute_request(state.base_url, path) do
      {:ok, response} ->
        new_state = %{state | state: :closed, failure_count: 0, cached_response: response}
        {:reply, {:ok, response}, new_state}

      {:error, reason} ->
        new_state = %{state | state: :open, last_failure_at: System.monotonic_time(:millisecond)}
        {:reply, {:error, reason}, new_state}
    end
  end

  defp execute_request(base_url, path) do
    url = "#{base_url}#{path}"
    case Req.get(url, receive_timeout: 5_000) do
      {:ok, %{status: status, body: body}} when status in 200..299 ->
        {:ok, body}

      {:ok, %{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### Graceful Degradation Through Feature Flags

Continued operation often requires the ability to selectively disable features under stress:

```elixir
defmodule Prismatic.ContinuedOperation.DegradationManager do
  @moduledoc """
  Manages graceful degradation levels for continued operation.

  Features are organized into tiers. Under resource pressure,
  lower-tier features are disabled first to preserve core functionality.
  """

  use GenServer

  @type tier :: :critical | :standard | :enhanced | :experimental
  @type degradation_level :: 1..5

  defstruct degradation_level: 1, disabled_features: MapSet.new()

  @feature_tiers %{
    critical: [:authentication, :agent_dispatch, :health_checks],
    standard: [:search, :reporting, :notifications],
    enhanced: [:analytics, :recommendations, :audit_export],
    experimental: [:ai_analysis, :predictive_alerts, :graph_visualization]
  }

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc "Check if a feature is currently available."
  @spec feature_available?(atom()) :: boolean()
  def feature_available?(feature) do
    GenServer.call(__MODULE__, {:check_feature, feature})
  end

  @doc "Escalate degradation level (disable more features)."
  @spec escalate() :: {:ok, degradation_level()}
  def escalate do
    GenServer.call(__MODULE__, :escalate)
  end

  @doc "Recover to normal operation."
  @spec recover() :: {:ok, degradation_level()}
  def recover do
    GenServer.call(__MODULE__, :recover)
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %__MODULE__{}}
  end

  @impl GenServer
  def handle_call({:check_feature, feature}, _from, state) do
    available = not MapSet.member?(state.disabled_features, feature)
    {:reply, available, state}
  end

  def handle_call(:escalate, _from, state) do
    new_level = min(state.degradation_level + 1, 5)
    new_disabled = compute_disabled_features(new_level)
    new_state = %{state | degradation_level: new_level, disabled_features: new_disabled}
    {:reply, {:ok, new_level}, new_state}
  end

  def handle_call(:recover, _from, _state) do
    new_state = %__MODULE__{degradation_level: 1}
    {:reply, {:ok, 1}, new_state}
  end

  defp compute_disabled_features(level) when level <= 1, do: MapSet.new()
  defp compute_disabled_features(2), do: MapSet.new(@feature_tiers.experimental)
  defp compute_disabled_features(3) do
    MapSet.union(
      MapSet.new(@feature_tiers.experimental),
      MapSet.new(@feature_tiers.enhanced)
    )
  end
  defp compute_disabled_features(4) do
    MapSet.union(compute_disabled_features(3), MapSet.new(@feature_tiers.standard))
  end
  defp compute_disabled_features(_level), do: compute_disabled_features(4)
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements continued operation across every architectural layer:

### PrismaticSupervisor

The `PrismaticSupervisor` application provides dependency-aware startup and compositional supervision for all 115 umbrella apps. It uses domain supervisors to group related services, ensuring that a failure in the OSINT subsystem does not affect the quality monitoring subsystem. The supervision tree is automatically discovered and constructed at boot time using the `AutoDiscovery` module.

### Health Monitoring

The platform's health monitoring system continuously evaluates the operational status of all supervised processes. Health checks run on configurable intervals and report to the `HealthMonitor` GenServer, which aggregates status across domains. When degradation is detected, the system can automatically activate circuit breakers and shed non-essential load.

### Hot Code Reloading

BEAM's hot code reloading capability enables continued operation during deployments. New code versions are loaded without stopping running processes, allowing in-flight requests to complete on the old code while new requests use the updated modules. This eliminates deployment windows as a source of service interruption.

### Session Persistence

LiveView sessions maintain their state across process restarts through ETS-backed session stores. When a LiveView process crashes and restarts (via supervision), the user's session data is recovered from the durable store, providing a seamless experience despite the internal failure.

## Comparison with Alternatives

| Approach | Recovery Time | Data Loss | Complexity | Cost |
|----------|--------------|-----------|------------|------|
| OTP Supervision (Prismatic) | Milliseconds | None (process state) | Medium | Low |
| Kubernetes Pod Restart | Seconds | Container state | High | Medium |
| Active-Passive Failover | Seconds to minutes | Replication lag | High | High |
| Manual Intervention | Minutes to hours | Variable | Low | Very High |
| No Strategy | Permanent until fix | Complete | None | Catastrophic |

### OTP vs Kubernetes for Continued Operation

While Kubernetes provides container-level restart and orchestration, OTP supervision operates at the process level with microsecond-scale restart times. A crashed GenServer restarts in milliseconds; a crashed Kubernetes pod takes seconds. For fine-grained continued operation, OTP supervision is orders of magnitude faster and more granular.

## Best Practices

1. **Design supervision trees before writing business logic**: The supervision hierarchy defines your continued operation guarantees. Plan it as carefully as your data model.

2. **Separate state from logic**: Store critical state in ETS or a database, not in process memory. This allows processes to restart and recover state without loss.

3. **Use circuit breakers for all external dependencies**: Every HTTP client, database connection, and third-party API call should be protected by a circuit breaker.

4. **Implement health checks at every level**: Process-level, service-level, and system-level health checks provide layered visibility into operational status.

5. **Test failure scenarios explicitly**: Use property-based testing and chaos engineering to verify that the system maintains continued operation under realistic failure conditions.

6. **Define degradation tiers**: Know in advance which features can be disabled to preserve core functionality. Document this in runbooks.

7. **Monitor restart frequency**: A process that restarts frequently indicates an underlying issue. Track restart rates and alert on anomalies.

8. **Avoid shared mutable state**: Processes that share state create coupling that undermines continued operation. Use message passing and ETS for coordination.

## Common Pitfalls

**Restart loops**: A process that crashes immediately after restart creates a restart loop that eventually exhausts the supervisor's `max_restarts` budget. Ensure that initialization failures are handled with exponential backoff or deferred initialization.

**Cascading restarts**: Using `:one_for_all` strategy when `:one_for_one` would suffice causes unnecessary restarts of healthy processes. Choose the most targeted restart strategy for each supervision level.

**Ignoring backpressure**: Continued operation under load requires backpressure mechanisms. Without them, a recovering service can be immediately overwhelmed by queued requests, triggering another failure cycle.

**Over-reliance on timeouts**: Setting aggressive timeouts causes premature failure detection. Set timeouts based on measured P99 latencies with appropriate headroom.

**State loss on restart**: If a GenServer's state is complex and expensive to reconstruct, losing it on restart degrades service quality. Use persistent storage or periodic snapshotting for critical state.

**Single points of failure**: A system with excellent per-component continued operation can still fail if a single shared resource (such as a database connection pool) becomes a bottleneck. Identify and eliminate single points of failure.

## Use Cases

- **Platform Supervision**: 115 umbrella apps supervised with automatic restart and dependency ordering
- **OSINT Data Collection**: External API failures do not halt the intelligence pipeline; degraded sources are skipped
- **LiveView Sessions**: User sessions survive process crashes through ETS-backed state recovery
- **Agent Orchestration**: Failed agents are restarted by their domain supervisors without affecting other agents
- **Quality Gate Pipeline**: A failed quality check does not block the entire pre-commit pipeline; other checks continue
- **Database Connection Recovery**: Lost connections are transparently re-established by the connection pool supervisor
- **Deployment Continuity**: Hot code reloading enables zero-downtime deployments

## Related Concepts

- [Fault Tolerance](/glossary/fault-tolerance/) -- the broader capability that enables continued operation
- [Supervision Tree](/glossary/supervision-tree/) -- the hierarchical process monitoring structure
- [Let It Crash](/glossary/let-it-crash/) -- the philosophy of allowing failures and recovering through supervision
- [Circuit Breaker](/glossary/circuit-breaker/) -- preventing cascading failures from external dependencies
- [Self-Healing](/glossary/self-healing/) -- automated recovery mechanisms that restore full operation
- [Process Restart](/glossary/process-restart/) -- the fundamental mechanism for recovering from process crashes
- [Health Monitoring](/glossary/health-monitoring/) -- observing system status to detect degradation
- [Backpressure](/glossary/backpressure/) -- managing load to prevent continued operation failures
- [Disaster Recovery](/glossary/disaster-recovery/) -- recovering from catastrophic failures that exceed continued operation capabilities
- [Reliability](/glossary/reliability/) -- the overall quality attribute that continued operation supports

## See Also

- [BEAM VM](/glossary/beam-vm/) -- the runtime that provides lightweight processes and supervision
- [Distributed System](/glossary/distributed-system/) -- continued operation across network boundaries
- [Cascade Pattern](/glossary/cascade-pattern/) -- preventing failure propagation
- [GenServer](/glossary/genserver/) -- the primary stateful process abstraction

---

## Connect & Contribute

Prismatic Platform is built by [Tomas Korcak (korczis)](https://github.com/korczis) and the open-source community.

- [GitHub Repository](https://github.com/korczis/prismatic-platform) -- Source code, issues, and contributions
- [GitLab Mirror](https://gitlab.com/korczis/prismatic-platform) -- CI/CD and issue tracking
- [LinkedIn](https://linkedin.com/in/korczis) -- Professional network and updates
- [Contact](mailto:korczis@gmail.com) -- Direct communication
