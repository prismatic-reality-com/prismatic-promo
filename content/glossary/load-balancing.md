+++
title = "Load Balancing"
weight = 41
[extra]
category = "architecture"
subcategory = "scalability"
difficulty = "intermediate"
technology_type = "infrastructure_pattern"
platform_component = "traffic_distribution"
scalability_dimension = "horizontal"
reliability_pattern = "redundancy"
performance_optimization = "throughput_latency"
geographic_scope = "global"
protocol_layers = "layer_4_7"
algorithmic_complexity = "medium"
health_monitoring = "integrated"
prerequisite_concepts = ["distributed_systems", "networking", "concurrency", "fault_tolerance"]
use_cases = ["horizontal_scaling", "fault_tolerance", "geographic_distribution", "performance_optimization"]
benefits = ["increased_throughput", "reduced_latency", "improved_reliability", "graceful_degradation"]
implementation_patterns = ["round_robin", "least_connections", "consistent_hashing", "health_checks"]
quality_metrics = ["request_distribution", "response_time", "error_rate", "availability"]
integration_points = ["api_gateway", "service_mesh", "connection_pools", "health_monitors"]
related_disciplines = ["systems_architecture", "network_engineering", "performance_engineering", "reliability_engineering"]
algorithmic_strategies = "workload_aware"
description = "Distributing incoming requests across multiple server instances to optimize throughput, reduce latency, and increase reliability through redundancy."
related_terms = ["distributed-system", "cluster", "fly-io", "rate-limiting", "api-gateway", "fault-tolerance", "beam", "backpressure", "connection-pooling", "anycast", "geographic-routing", "scheduler"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1104
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Load", "Balancing", "Distributing", "glossary", "architecture", "Prismatic Platform", "BEAM", "Load Balancing", "HTTP"]
tags = ["glossary", "architecture", "load-balancing", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Load Balancing - Prismatic Platform"
+++

## Definition

Load balancing is the practice of distributing incoming network traffic, computational work, or data processing across multiple server instances, CPU cores, or processing units to prevent any single resource from becoming a bottleneck. By spreading work evenly, load balancers improve system throughput, reduce response latency, and increase reliability through redundancy -- if one instance fails, traffic is redirected to healthy instances without service interruption. Load balancing operates at multiple layers of the network stack: Layer 4 (TCP/UDP transport), Layer 7 (HTTP/application), and internally within application runtimes.

The core challenge of load balancing is the selection algorithm -- how to choose which instance receives the next unit of work. Simple algorithms like round-robin distribute work evenly but ignore instance health and current load. Weighted algorithms account for heterogeneous instance capacities. Least-connections algorithms route to the instance handling the fewest active requests. Consistent hashing maps requests to instances deterministically, enabling cache affinity. Health-check-aware algorithms remove unhealthy instances from the pool and reintroduce them after recovery. The optimal algorithm depends on the workload characteristics: stateless HTTP APIs benefit from round-robin, WebSocket connections require sticky sessions or consistent hashing, and CPU-intensive tasks benefit from least-connections.

Modern cloud platforms provide load balancing as a managed service with global reach. Geographic load balancing routes users to the nearest healthy instance across multiple regions, minimizing network latency. Edge networks like Cloudflare, AWS CloudFront, and [Fly.io](/glossary/fly-io/)'s Anycast routing distribute traffic at the network edge, often before it reaches application servers. Within the [BEAM](/glossary/beam/) virtual machine, the scheduler itself acts as an internal load balancer, distributing process execution across available CPU cores through preemptive scheduling with reduction-based time budgets.

## Context in Prismatic

The Prismatic Platform employs load balancing at three distinct layers. At the edge, [Fly.io](/glossary/fly-io/)'s Anycast network provides geographic load balancing, routing users to the nearest healthy instance across deployment regions for minimum latency. At the application layer, the [BEAM](/glossary/beam/) scheduler naturally load-balances work across available CPU cores through its preemptive process scheduling -- each of the 434 agent processes receives fair CPU time regardless of workload. At the infrastructure layer, [connection pooling](/glossary/connection-pooling/) distributes database queries across PostgreSQL connection pools, and the PrismaticSupervisor coordinates process placement for optimal resource utilization across [cluster](/glossary/cluster/) nodes.

The platform's [API Gateway](/glossary/api-gateway/) (`PrismaticApi.Endpoint` on port 4004) handles request routing to the appropriate internal service, while [rate limiting](/glossary/rate-limiting/) prevents any single client from monopolizing capacity. The [backpressure](/glossary/backpressure/) mechanisms in [Broadway](/glossary/broadway/) pipelines provide internal load balancing for data processing, ensuring that producer speed does not overwhelm consumer capacity.

## Load Balancing Algorithms

| Algorithm | Description | Optimal For | Trade-off |
|-----------|-------------|------------|-----------|
| **Round Robin** | Sequential rotation through instances | Stateless, uniform requests | Ignores instance load |
| **Weighted Round Robin** | Round robin with capacity weights | Heterogeneous instances | Requires manual weight config |
| **Least Connections** | Route to instance with fewest active connections | Long-lived connections, variable processing time | Requires connection tracking |
| **Least Response Time** | Route to instance with lowest latency | Latency-sensitive APIs | Requires latency monitoring |
| **Consistent Hashing** | Hash-based deterministic routing | Cache affinity, session stickiness | Uneven distribution possible |
| **Random** | Random instance selection | Large instance pools, uniform requests | Statistically even, not guaranteed |
| **IP Hash** | Route based on client IP hash | Session persistence without cookies | Uneven with skewed IP distribution |
| **Resource-Based** | Route based on instance CPU/memory | Resource-intensive workloads | Requires health metric collection |

## BEAM Scheduler as Internal Load Balancer

The BEAM virtual machine's scheduler is one of the most sophisticated internal load balancers in any runtime:

```
BEAM Scheduler Architecture:

  CPU Core 1: Scheduler 1 --> [Process Run Queue]
  CPU Core 2: Scheduler 2 --> [Process Run Queue]
  CPU Core 3: Scheduler 3 --> [Process Run Queue]
  CPU Core N: Scheduler N --> [Process Run Queue]

  Work Stealing: When a scheduler's queue is empty,
  it steals processes from busy schedulers' queues.
```

| Feature | BEAM Scheduler | Traditional Thread Pool |
|---------|---------------|------------------------|
| **Scheduling Unit** | Lightweight process (~2KB) | OS thread (~1MB stack) |
| **Preemption** | Reduction-based (guaranteed fairness) | Cooperative or OS-preemptive |
| **Work Stealing** | Automatic across schedulers | Manual implementation required |
| **Per-Unit Cost** | ~2KB memory, ~3us creation | ~1MB memory, ~1ms creation |
| **Max Concurrent** | Millions of processes | Thousands of threads |
| **GC Impact** | Per-process (no stop-the-world) | Global GC pauses |

```elixir
# BEAM scheduler distributes agent processes across all cores
defmodule PrismaticAgents.Spawner do
  @moduledoc "Spawn agent processes across BEAM schedulers."

  @spec spawn_agents(non_neg_integer()) :: [pid()]
  def spawn_agents(count) do
    # Each agent gets its own BEAM process
    # The scheduler automatically distributes across CPU cores
    for _i <- 1..count do
      {:ok, pid} = DynamicSupervisor.start_child(
        PrismaticAgents.DynamicSupervisor,
        {PrismaticAgents.Worker, []}
      )
      pid
    end
  end
end

# Check scheduler utilization
:scheduler.utilization(1000)
# Returns per-scheduler CPU utilization over 1 second
```

## Geographic Load Balancing

[Fly.io](/glossary/fly-io/)'s Anycast network provides geographic load balancing for the Prismatic Platform:

```
User (Prague) ----> Fly.io Edge (Frankfurt) ----> Prismatic Instance (EU)
User (NYC)    ----> Fly.io Edge (Newark)    ----> Prismatic Instance (US)
User (Tokyo)  ----> Fly.io Edge (Tokyo)     ----> Prismatic Instance (APAC)
```

| Feature | Fly.io Edge Balancing | Traditional DNS Balancing |
|---------|----------------------|--------------------------|
| **Routing** | Anycast (network-level) | DNS round robin |
| **Failover** | Automatic, sub-second | TTL-dependent (seconds to minutes) |
| **Health Checks** | Active TCP/HTTP probes | External monitoring required |
| **TLS Termination** | At edge | At origin or separate LB |
| **Sticky Sessions** | Cookie or header based | Not natively supported |
| **WebSocket Support** | Full duplex pass-through | Limited |

## Connection Pooling as Load Balancing

[Connection pooling](/glossary/connection-pooling/) distributes database queries across a pool of persistent connections:

```elixir
# Ecto connection pool configuration
config :prismatic, PrismaticStorage.Repo,
  pool_size: 20,              # 20 connections distributed across queries
  queue_target: 50,           # Target queue time (ms)
  queue_interval: 1_000       # Queue monitoring interval

# DBConnection checkout distributes work across pool
# Each query gets the next available connection
# Overloaded pools trigger backpressure (queue_target exceeded)
```

| Pool Strategy | Description | Use Case |
|--------------|-------------|----------|
| **FIFO** | First available connection | Default, fairest distribution |
| **LIFO** | Most recently used connection | Cache-warm connections |
| **Random** | Random connection selection | Large pools with uniform queries |

## Health-Based Load Balancing

Effective load balancing requires health monitoring to avoid routing traffic to degraded instances:

| Health Check | Method | Frequency | Failure Action |
|-------------|--------|-----------|---------------|
| **TCP** | SYN/ACK probe | Every 5s | Remove from pool |
| **HTTP** | GET /health endpoint | Every 10s | Remove from pool |
| **Application** | Custom health function | Every 30s | Reduce weight |
| **Deep** | Database + cache + dependencies | Every 60s | Remove from pool |

```elixir
defmodule PrismaticWeb.HealthController do
  @moduledoc "Health check endpoint for load balancer probes."
  use PrismaticWeb, :controller

  @spec check(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def check(conn, _params) do
    checks = %{
      database: check_database(),
      ets_cache: check_ets(),
      agents: check_agent_supervisor()
    }

    status = if Enum.all?(checks, fn {_, v} -> v == :ok end), do: 200, else: 503
    json(conn, %{status: status_text(status), checks: checks})
  end
end
```

## Load Balancing Patterns

### Blue-Green Deployment Load Balancing

During deployments, the load balancer routes traffic between old (blue) and new (green) instances:

| Phase | Blue (Old) | Green (New) | Traffic Split |
|-------|-----------|-------------|---------------|
| **Pre-deploy** | 100% | 0% | All to blue |
| **Deploy** | 100% | 0% (starting) | All to blue |
| **Verify** | 50% | 50% | Split traffic |
| **Switch** | 0% | 100% | All to green |
| **Rollback** | 100% | 0% | Revert if needed |

### Internal Service Load Balancing

Within the platform, services communicate through internal load balancing:

| Communication | Balancing Mechanism | Protocol |
|--------------|-----------------------|----------|
| **Agent-to-Agent** | Registry-based routing | [Message Passing](/glossary/message-passing/) |
| **App-to-Database** | Connection pool (DBConnection) | PostgreSQL protocol |
| **App-to-Cache** | ETS partitioning | Direct memory access |
| **App-to-Search** | Finch connection pool | HTTP |
| **Cross-Node** | Distribution protocol | BEAM distribution |

## Advanced Load Balancing Strategies

### Adaptive Load Balancing

Modern load balancers adjust their behavior based on real-time metrics:

```elixir
defmodule PrismaticLoadBalancer.AdaptiveBalancer do
  @moduledoc """
  Implements adaptive load balancing that adjusts strategy based on system conditions.
  """

  use GenServer

  defstruct [
    :instances,
    :current_strategy,
    :metrics_window,
    :strategy_weights,
    :adaptation_threshold
  ]

  @strategies [:round_robin, :least_connections, :least_response_time, :weighted_round_robin]
  @metrics_window_size 60_000  # 60 seconds
  @adaptation_interval 10_000  # Check every 10 seconds

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def route_request(request) do
    GenServer.call(__MODULE__, {:route_request, request})
  end

  def report_response(instance_id, response_time, status_code) do
    GenServer.cast(__MODULE__, {:report_response, instance_id, response_time, status_code})
  end

  @impl true
  def init(opts) do
    instances = Keyword.get(opts, :instances, [])

    state = %__MODULE__{
      instances: initialize_instances(instances),
      current_strategy: :round_robin,
      metrics_window: :queue.new(),
      strategy_weights: %{},
      adaptation_threshold: 0.1
    }

    # Schedule periodic strategy evaluation
    Process.send_after(self(), :evaluate_strategy, @adaptation_interval)

    {:ok, state}
  end

  @impl true
  def handle_call({:route_request, request}, _from, state) do
    {selected_instance, updated_state} = select_instance(request, state)

    # Track the routing decision
    tracked_state = track_routing_decision(selected_instance, updated_state)

    {:reply, {:ok, selected_instance}, tracked_state}
  end

  @impl true
  def handle_cast({:report_response, instance_id, response_time, status_code}, state) do
    updated_state = record_response_metrics(instance_id, response_time, status_code, state)
    {:noreply, updated_state}
  end

  @impl true
  def handle_info(:evaluate_strategy, state) do
    # Analyze current performance and potentially switch strategies
    new_strategy = evaluate_best_strategy(state)

    updated_state = if new_strategy != state.current_strategy do
      Logger.info("Switching load balancing strategy from #{state.current_strategy} to #{new_strategy}")
      %{state | current_strategy: new_strategy}
    else
      state
    end

    # Schedule next evaluation
    Process.send_after(self(), :evaluate_strategy, @adaptation_interval)

    {:noreply, updated_state}
  end

  defp select_instance(request, state) do
    case state.current_strategy do
      :round_robin -> select_round_robin(state)
      :least_connections -> select_least_connections(state)
      :least_response_time -> select_least_response_time(state)
      :weighted_round_robin -> select_weighted_round_robin(state)
    end
  end

  defp select_least_response_time(state) do
    instance = state.instances
                |> Enum.filter(&instance_healthy?/1)
                |> Enum.min_by(fn instance ->
                    get_average_response_time(instance.id)
                   end, fn -> List.first(state.instances) end)

    updated_instances = update_instance_stats(state.instances, instance.id, :selected)

    {instance, %{state | instances: updated_instances}}
  end

  defp evaluate_best_strategy(state) do
    # Simulate different strategies and measure their theoretical performance
    strategy_scores = Enum.map(@strategies, fn strategy ->
      score = calculate_strategy_score(strategy, state)
      {strategy, score}
    end)

    {best_strategy, _score} = Enum.max_by(strategy_scores, &elem(&1, 1))
    best_strategy
  end

  defp calculate_strategy_score(strategy, state) do
    recent_metrics = get_recent_metrics(state, 30_000)  # Last 30 seconds

    simulated_performance = simulate_strategy_performance(strategy, recent_metrics, state)

    # Score based on multiple factors
    response_time_score = 1.0 / (simulated_performance.avg_response_time + 1)
    fairness_score = calculate_fairness_score(simulated_performance.distribution)
    stability_score = 1.0 / (simulated_performance.variance + 1)

    response_time_score * 0.5 + fairness_score * 0.3 + stability_score * 0.2
  end

  defp simulate_strategy_performance(strategy, metrics, state) do
    # Simulate how this strategy would have performed on recent requests
    routes = Enum.map(metrics, fn metric ->
      simulate_routing_decision(strategy, metric, state)
    end)

    %{
      avg_response_time: calculate_avg_response_time(routes),
      distribution: calculate_distribution(routes),
      variance: calculate_variance(routes)
    }
  end
end
```

### Multi-Layer Load Balancing

Complex systems often require load balancing at multiple layers:

```elixir
defmodule PrismaticLoadBalancer.MultiLayer do
  @moduledoc """
  Implements multi-layer load balancing for complex request routing.
  """

  @layers [
    {:edge, PrismaticLoadBalancer.EdgeLayer},
    {:api_gateway, PrismaticLoadBalancer.APIGatewayLayer},
    {:service, PrismaticLoadBalancer.ServiceLayer},
    {:database, PrismaticLoadBalancer.DatabaseLayer}
  ]

  def route_request(request) do
    Enum.reduce_while(@layers, {:ok, request}, fn {layer_name, layer_module}, {:ok, req} ->
      case layer_module.route(req) do
        {:ok, updated_request} ->
          {:cont, {:ok, updated_request}}

        {:error, reason} ->
          Logger.error("Load balancing failed at #{layer_name}: #{inspect(reason)}")
          {:halt, {:error, {layer_name, reason}}}
      end
    end)
  end
end

defmodule PrismaticLoadBalancer.EdgeLayer do
  @moduledoc """
  Edge-level load balancing based on geographic proximity.
  """

  def route(request) do
    client_ip = get_client_ip(request)
    geographic_location = GeoIP.lookup(client_ip)

    edge_servers = get_available_edge_servers()
    selected_edge = select_closest_edge(geographic_location, edge_servers)

    updated_request = Map.put(request, :edge_server, selected_edge)
    {:ok, updated_request}
  end

  defp select_closest_edge(location, edge_servers) do
    Enum.min_by(edge_servers, fn edge ->
      calculate_distance(location, edge.location)
    end)
  end

  defp calculate_distance(%{lat: lat1, lon: lon1}, %{lat: lat2, lon: lon2}) do
    # Haversine distance formula
    :math.acos(
      :math.sin(lat1) * :math.sin(lat2) +
      :math.cos(lat1) * :math.cos(lat2) * :math.cos(lon1 - lon2)
    ) * 6371  # Earth's radius in km
  end
end

defmodule PrismaticLoadBalancer.ServiceLayer do
  @moduledoc """
  Service-level load balancing with circuit breaker integration.
  """

  def route(request) do
    service_name = extract_service_name(request)
    instances = get_healthy_service_instances(service_name)

    case instances do
      [] ->
        {:error, :no_healthy_instances}

      available_instances ->
        selected = select_with_circuit_breaker(available_instances, request)
        updated_request = Map.put(request, :target_instance, selected)
        {:ok, updated_request}
    end
  end

  defp select_with_circuit_breaker(instances, request) do
    # Filter instances by circuit breaker state
    healthy_instances = Enum.filter(instances, fn instance ->
      CircuitBreaker.allow_request?(instance.id)
    end)

    case healthy_instances do
      [] ->
        # All circuits open, select least recently failed
        Enum.min_by(instances, &CircuitBreaker.last_failure_time/1)

      available ->
        # Use least connections among healthy instances
        Enum.min_by(available, &get_active_connections/1)
    end
  end
end
```

### Load Balancing with Session Affinity

Handling stateful connections that require sticky sessions:

```elixir
defmodule PrismaticLoadBalancer.SessionAffinity do
  @moduledoc """
  Implements session affinity (sticky sessions) for stateful connections.
  """

  use GenServer

  defstruct [
    :session_store,
    :affinity_strategy,
    :session_timeout,
    :cleanup_timer
  ]

  @session_timeout 30 * 60 * 1000  # 30 minutes
  @cleanup_interval 5 * 60 * 1000  # 5 minutes

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def route_with_affinity(request) do
    GenServer.call(__MODULE__, {:route_with_affinity, request})
  end

  @impl true
  def init(opts) do
    strategy = Keyword.get(opts, :affinity_strategy, :consistent_hashing)

    state = %__MODULE__{
      session_store: :ets.new(:sessions, [:set, :private]),
      affinity_strategy: strategy,
      session_timeout: @session_timeout,
      cleanup_timer: schedule_cleanup()
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:route_with_affinity, request}, _from, state) do
    session_id = extract_session_id(request)

    {instance, updated_state} = case session_id do
      nil ->
        # New session, create affinity
        create_session_affinity(request, state)

      existing_session ->
        # Existing session, check affinity
        get_or_create_affinity(existing_session, request, state)
    end

    {:reply, {:ok, instance}, updated_state}
  end

  @impl true
  def handle_info(:cleanup_expired_sessions, state) do
    current_time = System.system_time(:millisecond)

    # Remove expired sessions
    :ets.select_delete(state.session_store, [
      {{'$1', '$2', '$3'}, [{:<, '$3', current_time - state.session_timeout}], [true]}
    ])

    # Schedule next cleanup
    new_timer = schedule_cleanup()

    {:noreply, %{state | cleanup_timer: new_timer}}
  end

  defp create_session_affinity(request, state) do
    session_id = generate_session_id()
    instance = select_instance_by_strategy(session_id, state.affinity_strategy)

    # Store session affinity
    :ets.insert(state.session_store, {session_id, instance.id, System.system_time(:millisecond)})

    # Add session ID to response for client
    updated_request = Map.put(request, :session_id, session_id)

    {instance, state}
  end

  defp get_or_create_affinity(session_id, request, state) do
    case :ets.lookup(state.session_store, session_id) do
      [{^session_id, instance_id, _timestamp}] ->
        # Update last access time
        :ets.insert(state.session_store, {session_id, instance_id, System.system_time(:millisecond)})

        # Check if instance is still healthy
        case get_instance_by_id(instance_id) do
          {:ok, instance} when instance.healthy? ->
            {instance, state}

          _ ->
            # Instance unhealthy, reassign to new instance
            reassign_session(session_id, request, state)
        end

      [] ->
        # Session not found, create new affinity
        create_session_affinity(request, state)
    end
  end

  defp select_instance_by_strategy(session_id, strategy) do
    instances = get_healthy_instances()

    case strategy do
      :consistent_hashing ->
        select_by_consistent_hash(session_id, instances)

      :round_robin ->
        select_by_round_robin(instances)

      :least_sessions ->
        select_by_least_sessions(instances)
    end
  end

  defp select_by_consistent_hash(session_id, instances) do
    # Use consistent hashing to minimize session redistribution
    hash = :erlang.phash2(session_id)
    instance_count = length(instances)
    selected_index = rem(hash, instance_count)

    Enum.at(instances, selected_index)
  end

  defp select_by_least_sessions(instances) do
    # Select instance with fewest active sessions
    Enum.min_by(instances, fn instance ->
      count_active_sessions(instance.id)
    end)
  end

  defp count_active_sessions(instance_id) do
    current_time = System.system_time(:millisecond)
    timeout_threshold = current_time - @session_timeout

    :ets.select_count(:sessions, [
      {{'$1', ^instance_id, '$3'}, [{:>, '$3', timeout_threshold}], [true]}
    ])
  end
end
```

### Auto-Scaling Integration

Load balancers that automatically adjust capacity based on demand:

```elixir
defmodule PrismaticLoadBalancer.AutoScaling do
  @moduledoc """
  Integrates load balancing with automatic scaling decisions.
  """

  use GenServer

  defstruct [
    :instances,
    :scaling_policy,
    :metrics_collector,
    :scaling_cooldown
  ]

  @scale_up_threshold %{cpu_utilization: 0.70, request_queue: 50, response_time_p95: 1000}
  @scale_down_threshold %{cpu_utilization: 0.30, request_queue: 5, response_time_p95: 200}
  @scaling_cooldown 5 * 60 * 1000  # 5 minutes between scaling actions

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      instances: [],
      scaling_policy: Keyword.get(opts, :scaling_policy, :conservative),
      metrics_collector: start_metrics_collector(),
      scaling_cooldown: nil
    }

    # Start periodic scaling evaluation
    Process.send_after(self(), :evaluate_scaling, 30_000)

    {:ok, state}
  end

  @impl true
  def handle_info(:evaluate_scaling, state) do
    if scaling_allowed?(state) do
      metrics = collect_current_metrics(state)
      scaling_decision = evaluate_scaling_decision(metrics, state)

      updated_state = case scaling_decision do
        {:scale_up, count} ->
          execute_scale_up(count, state)

        {:scale_down, count} ->
          execute_scale_down(count, state)

        :no_action ->
          state
      end

      # Schedule next evaluation
      Process.send_after(self(), :evaluate_scaling, 30_000)
      {:noreply, updated_state}
    else
      # Still in cooldown period
      Process.send_after(self(), :evaluate_scaling, 30_000)
      {:noreply, state}
    end
  end

  defp evaluate_scaling_decision(metrics, state) do
    current_instance_count = length(state.instances)

    cond do
      should_scale_up?(metrics, state.scaling_policy) ->
        scale_up_count = calculate_scale_up_count(metrics, current_instance_count)
        {:scale_up, scale_up_count}

      should_scale_down?(metrics, state.scaling_policy) ->
        scale_down_count = calculate_scale_down_count(metrics, current_instance_count)
        {:scale_down, scale_down_count}

      true ->
        :no_action
    end
  end

  defp should_scale_up?(metrics, policy) do
    case policy do
      :aggressive ->
        metrics.cpu_utilization > 0.60 or
        metrics.request_queue > 30 or
        metrics.response_time_p95 > 800

      :conservative ->
        metrics.cpu_utilization > @scale_up_threshold.cpu_utilization and
        metrics.request_queue > @scale_up_threshold.request_queue

      :predictive ->
        # Use trend analysis for predictive scaling
        trend = analyze_metrics_trend(metrics)
        trend.cpu_growth_rate > 0.1 or trend.queue_growth_rate > 0.2
    end
  end

  defp execute_scale_up(count, state) do
    Logger.info("Scaling up by #{count} instances")

    # Launch new instances
    new_instances = launch_instances(count)

    # Wait for instances to become healthy
    Task.start(fn ->
      wait_for_instances_healthy(new_instances)
      GenServer.cast(__MODULE__, {:instances_ready, new_instances})
    end)

    %{state |
      scaling_cooldown: System.system_time(:millisecond) + @scaling_cooldown
    }
  end

  defp execute_scale_down(count, state) do
    Logger.info("Scaling down by #{count} instances")

    # Select instances to terminate (prefer least loaded)
    instances_to_terminate = select_instances_for_termination(state.instances, count)

    # Drain connections gracefully
    Enum.each(instances_to_terminate, &drain_instance_gracefully/1)

    # Schedule termination after drain period
    Task.start(fn ->
      :timer.sleep(60_000)  # 60 second drain period
      Enum.each(instances_to_terminate, &terminate_instance/1)

      remaining_instances = state.instances -- instances_to_terminate
      GenServer.cast(__MODULE__, {:instances_terminated, remaining_instances})
    end)

    %{state |
      scaling_cooldown: System.system_time(:millisecond) + @scaling_cooldown
    }
  end

  defp drain_instance_gracefully(instance) do
    # Stop routing new requests to this instance
    LoadBalancer.mark_instance_draining(instance.id)

    # Allow existing connections to complete
    Logger.info("Draining instance #{instance.id}")
  end

  defp analyze_metrics_trend(current_metrics) do
    # Implement trend analysis using historical metrics
    historical_data = MetricsCollector.get_historical_metrics(300_000)  # 5 minutes

    %{
      cpu_growth_rate: calculate_growth_rate(historical_data, :cpu_utilization),
      queue_growth_rate: calculate_growth_rate(historical_data, :request_queue),
      response_time_trend: calculate_growth_rate(historical_data, :response_time_p95)
    }
  end
end
```

## Monitoring and Metrics

| Metric | Measurement | Alert Threshold |
|--------|-------------|----------------|
| **Request Distribution** | Requests per instance per minute | > 2x variance between instances |
| **Response Time** | p50/p95/p99 latency per instance | p99 > 500ms |
| **Active Connections** | Current connections per instance | > 80% of pool size |
| **Error Rate** | 5xx responses per instance | > 1% of requests |
| **Scheduler Utilization** | Per-scheduler CPU usage | > 90% sustained |
| **Queue Depth** | Pending requests in load balancer | > 100 queued |

## Related Terms

- [Distributed System](/glossary/distributed-system/) - Systems requiring load distribution across nodes
- [Cluster](/glossary/cluster/) - BEAM cluster with distributed process scheduling
- [Fly.io](/glossary/fly-io/) - Edge network providing geographic load balancing
- [Rate Limiting](/glossary/rate-limiting/) - Complementary traffic control preventing overload
- [API Gateway](/glossary/api-gateway/) - Entry point where application-level routing decisions occur
- [Fault Tolerance](/glossary/fault-tolerance/) - Resilience enabled by multi-instance distribution
- [BEAM](/glossary/beam/) - VM with built-in scheduler-based load balancing
- [Backpressure](/glossary/backpressure/) - Flow control complementing load balancing
- [Connection Pooling](/glossary/connection-pooling/) - Database load distribution across connections
- [Consensus Algorithm](/glossary/consensus-algorithm/) - Leader election for load balancer coordination

## See Also

- [Architecture](/architecture/) - Infrastructure and deployment architecture
- [Technologies](/technologies/) - Deployment and hosting infrastructure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)