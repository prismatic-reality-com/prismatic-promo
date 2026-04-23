+++
title = "Observer"
weight = 52
[extra]
category = "otp"
subcategory = "monitoring"
type = "tool"
status = "stable"
maturity_level = "production"
scope = ["monitoring", "debugging", "performance", "beam"]
context = ["runtime_introspection", "process_debugging", "system_monitoring", "performance_analysis"]
description = "Erlang/OTP graphical system monitoring tool providing real-time visibility into processes, ETS tables, application trees, and system metrics on the BEAM VM"
keywords = ["observer", "monitoring", "beam", "processes", "ets", "supervision", "debugging", "livedashboard", "performance-analysis"]
gui_toolkit = "wx"
alternative_interfaces = ["live_dashboard", "remote_observer", "process_info"]
monitoring_capabilities = ["process_inspection", "memory_analysis", "scheduler_utilization", "message_queues"]
debugging_features = ["process_state", "message_tracing", "memory_allocation", "port_inspection"]
visualization_types = ["supervision_trees", "load_charts", "process_tables", "ets_browsers"]
production_alternatives = ["phoenix_live_dashboard", "telemetry_metrics", "external_monitoring"]
connection_methods = ["local", "remote_node", "ssh_tunnel"]
security_considerations = ["cookie_authentication", "network_exposure", "production_safety"]
performance_impact = "moderate"
scalability_limits = ["gui_responsiveness", "remote_latency", "data_volume"]
integration_points = ["iex", "phoenix", "telemetry", "ecto"]
complexity = "intermediate"
implementation_guide = "yes"
code_examples = "yes"
best_practices = "yes"
use_cases = ["development-debugging", "performance-analysis", "production-monitoring", "system-introspection"]
prerequisites = ["erlang-otp", "elixir-basics", "beam-vm"]
learning_path = ["beam-vm", "processes", "supervision-trees", "observability"]
difficulty = "intermediate"
time_to_learn = "1-2 weeks"
industry_usage = "high"
pattern_type = "monitoring-tool"
architecture_layer = "observability"
quality_gates = ["monitoring-coverage", "performance-impact", "security"]
testing_approach = ["observability-testing", "monitoring-validation"]
monitoring = ["process-health", "memory-usage", "scheduler-utilization"]
scalability = "development-focused"
related_terms = ["observability", "metrics", "beam", "supervisor", "distributed-tracing", "structured-logging", "process-isolation", "dynamic-supervisor"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1125
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "otp", "observer", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Observer - Prismatic Platform"
+++

## Definition

Observer is a graphical monitoring and debugging tool included in the Erlang/OTP standard library that provides real-time visibility into the internals of a running [BEAM](@/glossary/beam.md) virtual machine. Launched via `:observer.start()` in an IEx session, Observer displays live information about system resources (CPU, memory, I/O), individual processes (state, message queue length, memory usage, reductions), ETS tables (size, memory, access patterns), application supervision trees (hierarchical process view), and network connections to other BEAM nodes. It is the primary tool for understanding what a BEAM system is doing at runtime without adding instrumentation to application code.

Observer provides what no logging or [metrics](@/glossary/metrics.md) system can: a complete, live view of every process in the system, its current state, and its relationships to other processes. In a system like Prismatic with hundreds of concurrent agent processes, Observer reveals which processes consume the most memory, which have growing message queues (indicating potential bottlenecks), which are linked or monitored by which [supervisors](@/glossary/supervisor.md), and whether the scheduler is distributing work evenly across CPU cores. This level of introspection is unique to the BEAM platform -- no equivalent tool exists for JVM, V8, or CPython runtimes.

For production systems where a graphical desktop is unavailable, Phoenix LiveDashboard provides a web-based alternative with similar capabilities, accessible through a browser. LiveDashboard integrates with Telemetry events and [Ecto](@/glossary/ecto.md) query logging, providing production-safe [observability](@/glossary/observability.md) without the overhead or security implications of exposing Observer remotely. Both tools complement [structured logging](@/glossary/structured-logging.md) and [distributed tracing](@/glossary/distributed-tracing.md) in the platform's observability stack.

## Context in Prismatic

In the Prismatic Platform, Observer serves as the primary debugging and performance analysis tool during development and staging. With 90 umbrella applications, 434 agent processes, and complex supervision hierarchies, Observer provides the only practical way to visualize the entire system's process architecture in real-time. Developers use Observer to identify memory leaks in long-running agent processes, detect message queue buildup in [Broadway](@/glossary/broadway.md) pipelines, verify that [Dynamic Supervisors](@/glossary/dynamic-supervisor.md) are correctly managing agent lifecycles, and ensure that ETS table memory usage remains within expected bounds.

In production on [Fly.io](@/glossary/fly-io.md), Phoenix LiveDashboard replaces Observer as the primary monitoring interface. LiveDashboard is configured on the `PrismaticWeb.Endpoint` (port 4000) behind admin authentication, providing process inspection, ETS monitoring, and system metrics through a web interface. The platform's Telemetry events feed both LiveDashboard and external [metrics](@/glossary/metrics.md) collectors for comprehensive [observability](@/glossary/observability.md).

## Observer Interface Tabs

Observer organizes system information into specialized tabs:

| Tab | Information | Key Use Cases |
|-----|------------|--------------|
| **System** | CPU usage, memory allocation, I/O statistics, scheduler utilization | Overall system health assessment |
| **Load Charts** | Real-time graphs of scheduler usage, memory, and I/O | Identifying load trends and spikes |
| **Memory Allocators** | BEAM memory allocator statistics by type | Memory leak investigation |
| **Applications** | Supervision tree visualization for each OTP application | Process hierarchy understanding |
| **Processes** | List of all processes with sortable columns | Finding problematic processes |
| **Ports** | File descriptors, sockets, and driver ports | Connection leak detection |
| **Table Viewer** | ETS and Mnesia table inspector | Cache analysis, data verification |
| **Trace Overview** | Erlang trace configuration | Runtime debugging |

## Process Inspection

The Processes tab is the most frequently used feature, providing detailed information about every process in the system:

| Column | Description | Diagnostic Value |
|--------|-------------|-----------------|
| **Pid** | Process identifier | Unique process reference |
| **Name/Registered** | Registered name (if any) | Identify named processes |
| **Reds** | Reductions (work units) | CPU usage indicator |
| **Memory** | Process heap + stack size | Memory consumption |
| **MsgQ** | Message queue length | Bottleneck detection (growing = problem) |
| **Current Function** | Currently executing function | What the process is doing right now |
| **Initial Call** | Function that started the process | Process type identification |

```elixir
# Launch Observer in development
iex> :observer.start()

# Process inspection via code (when Observer GUI is unavailable)
iex> Process.info(pid, [:memory, :message_queue_len, :reductions, :current_function])
[
  memory: 2688,
  message_queue_len: 0,
  reductions: 1523,
  current_function: {:gen_server, :loop, 7}
]

# Find processes with large message queues (potential bottlenecks)
iex> for pid <- Process.list(),
...>     {:message_queue_len, len} = Process.info(pid, :message_queue_len),
...>     len > 100 do
...>   {pid, len, Process.info(pid, :registered_name)}
...> end
```

## Application Supervision Tree Visualization

Observer renders OTP application supervision trees graphically, showing the parent-child relationships between supervisors and workers:

```
PrismaticWeb.Application (Supervisor)
  |-- PrismaticWeb.Endpoint (Supervisor)
  |     |-- Bandit.PhoenixAdapter
  |     |-- Phoenix.PubSub.Supervisor
  |     |-- Phoenix.LiveView.Socket.Pool
  |
  |-- PrismaticAgents.Supervisor (Supervisor)
  |     |-- PrismaticAgents.DynamicSupervisor
  |     |     |-- Agent.Worker #PID<0.412.0>
  |     |     |-- Agent.Worker #PID<0.413.0>
  |     |     |-- ... (434 agent processes)
  |     |
  |     |-- PrismaticAgents.Registry
  |
  |-- PrismaticStorage.Supervisor (Supervisor)
        |-- PrismaticStorage.Repo (Ecto pool)
        |-- PrismaticStorage.ETS.Manager
        |-- PrismaticStorage.Cache.Server
```

Each process in the tree is clickable, revealing detailed state information, linked processes, monitored processes, and the process dictionary.

## ETS Table Inspection

The Table Viewer tab provides detailed information about all ETS tables in the system:

| Table Property | Description | Diagnostic Value |
|---------------|-------------|-----------------|
| **Name** | Table identifier | Identify table purpose |
| **Size** | Number of entries | Data volume tracking |
| **Memory** | Memory consumed (words) | Memory usage monitoring |
| **Type** | set, ordered_set, bag, duplicate_bag | Access pattern understanding |
| **Protection** | public, protected, private | Concurrent access analysis |
| **Owner** | Process owning the table | Lifecycle management |
| **Read/Write Concurrency** | Optimization flags | Performance tuning |

```elixir
# List all ETS tables with size and memory
iex> for table <- :ets.all() do
...>   info = :ets.info(table)
...>   {info[:name], info[:size], info[:memory] * :erlang.system_info(:wordsize)}
...> end |> Enum.sort_by(&elem(&1, 2), :desc) |> Enum.take(10)
```

## LiveDashboard: Web-Based Alternative

Phoenix LiveDashboard provides Observer-like functionality through a web interface, suitable for production environments:

```elixir
# In router.ex
import Phoenix.LiveDashboard.Router

scope "/" do
  pipe_through [:browser, :admin_auth]

  live_dashboard "/dashboard",
    metrics: PrismaticWeb.Telemetry,
    ecto_repos: [PrismaticStorage.Repo],
    env_keys: ["PHX_HOST", "DATABASE_URL"],
    allow_destructive_actions: false
end
```

| Feature | Observer | LiveDashboard |
|---------|---------|---------------|
| **Access** | Desktop GUI (wx) | Web browser |
| **Environment** | Development, local | Development + Production |
| **Process List** | Full process table | Full process table |
| **Supervision Trees** | Graphical tree view | Expandable tree view |
| **ETS Tables** | Table viewer with data | Table viewer with data |
| **Metrics** | System-level charts | Telemetry-based custom metrics |
| **Ecto** | Not integrated | Query log, pool status |
| **Custom Pages** | Not extensible | Plugin system for custom pages |
| **Security** | Local access only | Authentication, admin-only access |
| **Performance Impact** | Moderate (GUI rendering) | Low (server-side rendering) |

## Diagnostic Workflows

### Identifying Memory Leaks

```
1. Observer -> Processes tab -> Sort by Memory (descending)
2. Identify processes with unexpectedly high memory
3. Click process -> State tab -> Examine state size
4. Check for growing lists, large binaries, or accumulated state
5. Observer -> Memory Allocators -> Check for binary fragmentation
```

### Finding Bottleneck Processes

```
1. Observer -> Processes tab -> Sort by MsgQ (descending)
2. Any process with MsgQ > 0 may be a bottleneck
3. MsgQ growing over time = producer faster than consumer
4. Solutions: add backpressure, increase consumer count, optimize processing
```

### Scheduler Analysis

```
1. Observer -> Load Charts tab -> Scheduler utilization
2. All schedulers near 100% = CPU-bound (need more cores or optimization)
3. One scheduler high, others idle = work not distributed (fix with Task.async)
4. Uneven distribution = possible dirty scheduler monopolization
```

## Remote Observer

Observer can connect to remote BEAM nodes for debugging distributed systems:

```elixir
# On the remote node (enable distribution)
# Start with: iex --sname remote@host --cookie secret

# On the local machine
iex> Node.connect(:"remote@host")
iex> :observer.start()
# Select remote node from Observer's "Nodes" menu
```

| Remote Method | Use Case | Security |
|--------------|----------|----------|
| **Direct connect** | Same network, development | Cookie-based auth |
| **SSH tunnel** | Production debugging | SSH authentication |
| **LiveDashboard** | Production monitoring | Web auth (recommended) |

## Advanced Observer Techniques

### Memory Analysis Deep Dive

Observer's memory analysis capabilities extend far beyond simple process memory consumption. The Memory Allocators tab provides detailed insight into BEAM's sophisticated memory management:

```elixir
# Detailed memory analysis via code
defmodule PrismaticObserver.MemoryAnalysis do
  @moduledoc """
  Advanced memory analysis utilities for Observer investigation.
  """

  @spec process_memory_breakdown(pid()) :: map()
  def process_memory_breakdown(pid) when is_pid(pid) do
    case Process.info(pid, [:memory, :heap_size, :stack_size, :message_queue_len]) do
      nil -> {:error, :process_dead}
      info ->
        %{
          total_memory: info[:memory],
          heap_size: info[:heap_size],
          stack_size: info[:stack_size],
          message_queue: info[:message_queue_len],
          dictionary_size: map_size(Process.info(pid, :dictionary) || %{}),
          binary_references: count_binary_references(pid)
        }
    end
  end

  @spec find_memory_hogs(pos_integer()) :: [{pid(), non_neg_integer(), atom()}]
  def find_memory_hogs(limit \\ 10) do
    Process.list()
    |> Enum.map(fn pid ->
      case Process.info(pid, [:memory, :registered_name, :initial_call]) do
        nil -> nil
        info -> {pid, info[:memory], info[:registered_name], info[:initial_call]}
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.sort_by(&elem(&1, 1), :desc)
    |> Enum.take(limit)
  end

  defp count_binary_references(pid) do
    # Estimate binary references in process state
    case Process.info(pid, :dictionary) do
      nil -> 0
      dict -> count_binaries_in_term(dict)
    end
  end

  defp count_binaries_in_term(term) when is_binary(term), do: 1
  defp count_binaries_in_term(term) when is_list(term),
    do: Enum.sum(Enum.map(term, &count_binaries_in_term/1))
  defp count_binaries_in_term(term) when is_tuple(term),
    do: term |> Tuple.to_list() |> Enum.sum(&count_binaries_in_term/1)
  defp count_binaries_in_term(term) when is_map(term),
    do: Enum.sum(for {k, v} <- term, do: count_binaries_in_term(k) + count_binaries_in_term(v))
  defp count_binaries_in_term(_), do: 0
end
```

### Scheduler Analysis and Optimization

Observer's Load Charts tab reveals critical information about BEAM scheduler utilization. Understanding scheduler patterns is crucial for performance optimization:

```elixir
defmodule PrismaticObserver.SchedulerAnalysis do
  @moduledoc """
  Analyze and optimize scheduler utilization patterns.
  """

  @spec scheduler_statistics() :: map()
  def scheduler_statistics do
    schedulers = :erlang.system_info(:scheduler_threads)
    dirty_cpu = :erlang.system_info(:dirty_cpu_schedulers)
    dirty_io = :erlang.system_info(:dirty_io_schedulers)

    %{
      scheduler_count: schedulers,
      dirty_cpu_schedulers: dirty_cpu,
      dirty_io_schedulers: dirty_io,
      scheduler_utilization: sample_scheduler_utilization(),
      load_balancing_analysis: analyze_load_balancing()
    }
  end

  defp sample_scheduler_utilization do
    # Sample scheduler statistics over a 1-second window
    start_stats = :scheduler.sample_all()
    Process.sleep(1000)
    end_stats = :scheduler.sample_all()

    :scheduler.utilization(start_stats, end_stats)
    |> Enum.with_index(1)
    |> Enum.map(fn {{type, id, utilization, _}, scheduler_num} ->
      %{
        scheduler: scheduler_num,
        type: type,
        utilization_percent: Float.round(utilization * 100, 2),
        status: categorize_utilization(utilization),
        recommendation: utilization_recommendation(utilization)
      }
    end)
  end

  defp categorize_utilization(util) when util > 0.95, do: :overloaded
  defp categorize_utilization(util) when util > 0.80, do: :high
  defp categorize_utilization(util) when util > 0.20, do: :normal
  defp categorize_utilization(_), do: :underutilized

  defp utilization_recommendation(util) when util > 0.95,
    do: "Critical - consider CPU scaling or process optimization"
  defp utilization_recommendation(util) when util < 0.10,
    do: "Low utilization - potential for work consolidation"
  defp utilization_recommendation(_), do: "Normal utilization"
end
```

## Integration with Production Monitoring

Observer's development-focused capabilities translate to production monitoring through Phoenix LiveDashboard and telemetry integration:

### LiveDashboard Custom Metrics

```elixir
defmodule PrismaticWeb.LiveDashboard.ProcessMetrics do
  @moduledoc """
  Custom LiveDashboard page for process-specific metrics that mirror Observer capabilities.
  """

  use Phoenix.LiveDashboard.PageBuilder

  @impl true
  def menu_link(_, _), do: {:ok, "Process Analysis"}

  @impl true
  def render_page(_assigns) do
    table(
      columns: columns(),
      id: :process_analysis,
      row_attrs: &row_attrs/1,
      rows: &fetch_process_data/2,
      title: "Process Analysis (Observer-style)",
      limit: 50
    )
  end

  defp columns do
    [
      %{field: :pid, header: "PID"},
      %{field: :name, header: "Name/Registered"},
      %{field: :memory, header: "Memory (KB)", sortable: :desc},
      %{field: :message_queue_len, header: "MsgQ", sortable: :desc},
      %{field: :reductions, header: "Reductions", sortable: :desc},
      %{field: :current_function, header: "Current Function"}
    ]
  end

  defp fetch_process_data(_params, _node) do
    Process.list()
    |> Stream.map(&process_info_safe/1)
    |> Stream.reject(&is_nil/1)
    |> Enum.sort_by(& &1.memory, :desc)
  end

  defp process_info_safe(pid) do
    case Process.info(pid, [:registered_name, :memory, :message_queue_len,
                            :reductions, :current_function, :initial_call]) do
      nil -> nil
      info ->
        %{
          pid: inspect(pid),
          name: format_process_name(info),
          memory: div(info[:memory] || 0, 1024),
          message_queue_len: info[:message_queue_len] || 0,
          reductions: info[:reductions] || 0,
          current_function: format_function(info[:current_function])
        }
    end
  end

  defp format_process_name(info) do
    case info[:registered_name] do
      nil -> format_function(info[:initial_call])
      name -> Atom.to_string(name)
    end
  end

  defp format_function({mod, fun, arity}), do: "#{mod}.#{fun}/#{arity}"
  defp format_function(other), do: inspect(other)
end
```

### Telemetry Integration for Observer-like Metrics

```elixir
defmodule PrismaticWeb.Telemetry.ObserverMetrics do
  @moduledoc """
  Telemetry metrics that provide Observer-like monitoring in production.
  """

  def setup_observer_metrics do
    # Process-related metrics
    :telemetry.attach_many(
      "observer-process-metrics",
      [
        [:vm, :memory],
        [:vm, :total_run_queue_lengths],
        [:prismatic, :process_analysis]
      ],
      &handle_observer_metrics/4,
      %{}
    )

    # Schedule periodic process analysis
    :timer.apply_interval(30_000, __MODULE__, :emit_process_metrics, [])
  end

  def emit_process_metrics do
    process_stats = analyze_all_processes()

    :telemetry.execute([:prismatic, :process_analysis], %{
      total_processes: process_stats.total_count,
      memory_usage_mb: div(process_stats.total_memory, 1024 * 1024),
      processes_with_messages: process_stats.processes_with_messages,
      high_memory_processes: process_stats.high_memory_count,
      scheduler_utilization: get_scheduler_utilization_sample()
    })
  end

  defp analyze_all_processes do
    processes = Process.list()

    stats = Enum.reduce(processes, %{total_memory: 0, processes_with_messages: 0,
                                     high_memory_count: 0}, fn pid, acc ->
      case Process.info(pid, [:memory, :message_queue_len]) do
        nil -> acc
        [memory: mem, message_queue_len: queue_len] ->
          %{
            total_memory: acc.total_memory + mem,
            processes_with_messages: acc.processes_with_messages + (if queue_len > 0, do: 1, else: 0),
            high_memory_count: acc.high_memory_count + (if mem > 10_000_000, do: 1, else: 0)
          }
      end
    end)

    Map.put(stats, :total_count, length(processes))
  end

  defp get_scheduler_utilization_sample do
    # Quick scheduler utilization sample for telemetry
    case :scheduler.sample_all() do
      schedulers when is_list(schedulers) ->
        length(schedulers)
      _ ->
        :erlang.system_info(:scheduler_threads)
    end
  end
end
```

## Best Practices for Observer Usage

### Development Workflow Integration

Observer should be integrated into the standard development workflow for Elixir applications. Launch Observer at the start of each development session to establish baseline measurements, then monitor changes as new features are added or performance optimizations are made.

### Performance Regression Detection

Use Observer's memory and process monitoring to catch performance regressions early. A sudden increase in process memory consumption, growing message queues, or uneven scheduler utilization often indicates introduced bugs that would be difficult to detect through testing alone.

### Production Debugging Strategies

While Observer itself should not be used in production, the diagnostic techniques learned through Observer usage translate directly to production debugging through LiveDashboard, remote shell connections, and telemetry data analysis. The mental model of processes, message queues, and memory allocation patterns remains consistent across all monitoring approaches.

## Related Terms

- [Observability](@/glossary/observability.md) - Broader discipline of system monitoring and understanding
- [Metrics](@/glossary/metrics.md) - Quantitative measurements collected from running systems
- [BEAM](@/glossary/beam.md) - Virtual machine that Observer introspects
- [Supervisor](@/glossary/supervisor.md) - Process hierarchy visualized by Observer
- [Dynamic Supervisor](@/glossary/dynamic-supervisor.md) - Runtime process management inspectable in Observer
- [Structured Logging](@/glossary/structured-logging.md) - Complementary text-based diagnostics
- [Distributed Tracing](@/glossary/distributed-tracing.md) - Cross-service request tracking
- [Process Isolation](@/glossary/process-isolation.md) - BEAM property enabling per-process monitoring
- [Broadway](@/glossary/broadway.md) - Data pipeline whose stages are visible in Observer
- [Connection Pooling](@/glossary/connection-pooling.md) - Database pools monitorable through Observer

## See Also

- [Architecture](@/architecture/_index.md) - Platform observability architecture
- [Technologies](@/technologies/_index.md) - Monitoring and debugging tools

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)