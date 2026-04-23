+++
title = "Real-time"
weight = 50

[extra]
description = "System behavior where data processing and delivery occur with minimal latency, typically sub-second, enabling live updates, streaming dashboards, and immediate user feedback -- powered by Phoenix LiveView, PubSub event broadcasting, and the BEAM's soft real-time scheduling guarantees."
category = "architecture"
domain = "web-infrastructure"
complexity = "intermediate-advanced"
stability = "stable"
beam_related = true
related_terms = ["websocket", "server-sent-events", "liveview", "pubsub", "time-to-first-byte", "throughput", "phoenix-channel", "genserver", "scheduler", "reduction", "garbage-collection", "ets"]
tags = ["real-time", "liveview", "websocket", "streaming", "pubsub", "latency", "phoenix", "beam", "scheduler", "soft-real-time", "channels", "dashboard", "preemptive-scheduling"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Prismatic Platform achieves real-time behavior through Phoenix LiveView (server-rendered live UI), PubSub event broadcasting (decoupled event distribution), and BEAM's soft real-time scheduling guarantees (preemptive reduction-based scheduling with per-process garbage collection ensuring no stop-the-world pauses)."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Real-time", "LiveView", "PubSub", "streaming", "glossary", "Prismatic Platform", "BEAM", "soft real-time", "preemptive scheduling", "WebSocket", "Phoenix Channels", "dashboard", "latency"]
image = "/images/sections/glossary.png"
image_alt = "Real-time - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "performance-testing"]
+++

## Definition

**Real-time** describes systems that process and deliver data with latency low enough that users perceive updates as instantaneous. In computing, "real-time" spans a spectrum: **hard real-time** systems (embedded controllers, safety-critical avionics) guarantee response within a fixed deadline where a missed deadline is a system failure; **firm real-time** systems (video streaming, audio processing) tolerate occasional deadline misses with degraded quality; and **soft real-time** systems (web applications, dashboards, chat) aim for sub-second latency with statistical guarantees rather than absolute ones, where occasional delays are acceptable but consistently high latency degrades user experience.

The BEAM virtual machine provides **soft real-time guarantees** through preemptive scheduling -- no single process can monopolize a scheduler for more than a reduction budget (approximately 4,000 function calls or equivalent work), ensuring all processes receive fair CPU time regardless of workload distribution. This makes Elixir and Phoenix naturally suited for real-time web applications, as hundreds of thousands of concurrent WebSocket connections can coexist without any single connection starving others of CPU time. Combined with per-process garbage collection (no stop-the-world pauses), the BEAM delivers consistent sub-millisecond inter-process latency even under heavy load.

Phoenix LiveView leverages these BEAM guarantees to provide a server-rendered real-time UI framework where state lives on the server, DOM updates are computed as minimal diffs, and changes are pushed to the browser over a persistent WebSocket connection. This architecture eliminates the complexity of client-side state management, API design, and data synchronization that characterizes traditional SPA approaches, while delivering equivalent or better perceived performance for most interactive applications.

## Core Concepts

### Real-Time Spectrum

| Category | Deadline Tolerance | Consequence of Miss | Examples | BEAM Suitability |
|----------|-------------------|--------------------|---------|--------------------|
| **Hard real-time** | Zero -- deadline is absolute | System failure, safety hazard | Flight control, pacemaker, ABS braking | Not suitable (use C/Ada/RTOS) |
| **Firm real-time** | Rare misses tolerable | Quality degradation, dropped frames | Video encoding, audio streaming, game servers | Possible with careful design |
| **Soft real-time** | Statistical compliance | User experience degradation | Web dashboards, chat, notifications, LiveView | Excellent -- BEAM's sweet spot |
| **Near real-time** | Seconds acceptable | Stale data visible briefly | Analytics dashboards, search indexes | Excellent |
| **Batch** | Minutes to hours | Delayed results | Report generation, ETL pipelines | Adequate |

### BEAM Scheduling Guarantees

| Property | Mechanism | Impact on Real-Time |
|----------|-----------|---------------------|
| **Preemptive scheduling** | Reduction counting (~4000 reductions per time slice) | No process can hog CPU; all connections get fair time |
| **Per-process GC** | Each process has its own heap and garbage collector | No stop-the-world pauses; GC in one process does not affect others |
| **SMP schedulers** | One scheduler thread per CPU core; work-stealing | Parallel execution; no single-core bottleneck |
| **IO scheduling** | Dirty schedulers for NIF and IO-bound work | Long IO operations do not block normal schedulers |
| **Priority levels** | `:low`, `:normal`, `:high`, `:max` process priorities | Critical real-time processes can be prioritized |
| **Reduction budgets** | BIFs like `:ets.select` yield periodically | Long-running BIFs do not starve other processes |

### Real-Time Transport Mechanisms

| Transport | Direction | Connection | Latency | Use Case in Prismatic |
|-----------|-----------|------------|---------|----------------------|
| **WebSocket** | Full-duplex | Persistent | ~1ms overhead | LiveView, Phoenix Channels |
| **Server-Sent Events (SSE)** | Server-to-client | Persistent | ~1ms overhead | Event streaming, log tailing |
| **Long-polling** | Simulated duplex | Repeated requests | 50-500ms overhead | Fallback when WebSocket blocked |
| **HTTP/2 push** | Server-to-client | Multiplexed | ~5ms overhead | Asset preloading |
| **PubSub (internal)** | Process-to-process | In-memory | ~0.01ms | Internal event distribution |

### Prismatic Platform Real-Time Performance Standards

| Metric | Target | Enforcement Level | Measurement Point |
|--------|--------|-------------------|-------------------|
| Page load (full) | < 250ms | Blocking quality gate | Browser navigation timing |
| Server-side render | < 100ms | Blocking quality gate | Phoenix telemetry |
| LiveView mount | < 150ms | Blocking quality gate | `mount/3` duration |
| `handle_event` | < 50ms | Advisory | Event handler duration |
| `handle_info` (PubSub) | < 10ms | Advisory | Message handler duration |
| Health check response | < 10ms | Blocking quality gate | `/api/v1/health` latency |
| PubSub broadcast delivery | < 5ms | Advisory | Broadcast-to-handler latency |
| Fallback activation (D3/MetaMask) | < 300ms | Advisory | Chart.js substitution time |

## Technical Deep Dive

### Phoenix LiveView Real-Time Architecture

Phoenix LiveView's real-time model inverts the traditional web architecture. Instead of the browser maintaining state and synchronizing with the server via API calls, LiveView keeps all state on the server in the LiveView process's memory. When state changes (from user events, PubSub messages, or periodic timers), LiveView:

1. Re-renders the affected template portions using the updated assigns
2. Computes a minimal diff between the previous and current rendered output
3. Serializes the diff as a compact binary format
4. Pushes the diff to the browser over the WebSocket connection
5. The client-side JavaScript applies the diff to the DOM

This diff-based approach means that even for complex pages with hundreds of dynamic elements, LiveView typically pushes only a few hundred bytes per update -- far less than a full page re-render or even a JSON API response. The BEAM's per-process memory model means each connected user's LiveView process is isolated: a slow operation in one user's session does not affect any other user.

### PubSub Event Broadcasting

The real-time data flow in Phoenix follows a PubSub pattern that decouples event producers from consumers. When state changes occur -- a new OSINT tool execution completes, a DD pipeline stage finishes, an alert triggers -- the responsible process broadcasts a message to a PubSub topic. All LiveView processes subscribed to that topic receive the message via their `handle_info/2` callback and push DOM patches to their connected clients.

PubSub in the Prismatic Platform uses the `Phoenix.PubSub` library backed by `:pg2` (process groups) for local node distribution. For multi-node deployments, `Phoenix.PubSub.PG2` or Redis-backed PubSub can distribute messages across nodes. The broadcast is asynchronous and fire-and-forget -- the broadcaster does not wait for subscribers to process the message, maintaining the real-time guarantee for the producing process.

### BEAM Scheduler Deep Dive

Each BEAM scheduler thread runs on a dedicated CPU core and maintains a run queue of processes. The scheduler picks the highest-priority runnable process from the queue and executes it until either:

- The process exhausts its reduction budget (~4,000 reductions)
- The process yields voluntarily (e.g., waiting for a message with `receive`)
- The process performs a context-switching BIF (e.g., IO operations)

The reduction budget is the key to soft real-time behavior. A "reduction" is approximately one function call, one pattern match, or one arithmetic operation. By limiting each process to ~4,000 reductions before preemption, the scheduler ensures that even a process in an infinite loop cannot starve other processes for more than a few hundred microseconds.

Long-running NIFs (Native Implemented Functions) can break this guarantee because they execute outside the reduction counting system. The BEAM provides "dirty schedulers" -- separate scheduler threads dedicated to long-running NIF or IO-bound operations -- to isolate these from the normal schedulers. The Prismatic Platform's native dependencies (KuzuDB, Meilisearch client) use dirty schedulers to avoid blocking real-time operations.

### Garbage Collection and Real-Time

The BEAM's per-process garbage collection is critical for real-time behavior. Each process has its own heap, and garbage collection runs independently per process. When a process accumulates enough dead references, only that process is paused for GC -- all other processes continue executing uninterrupted. This is fundamentally different from the JVM's stop-the-world GC pauses or Go's concurrent GC with write barriers, which affect all goroutines simultaneously.

For real-time LiveView processes handling high-frequency PubSub messages, careful attention to memory allocation patterns prevents GC pauses from exceeding the real-time budget. The key strategies are:

- Keep process heap size small by avoiding large data accumulation in assigns
- Use ETS for shared data rather than copying large terms between processes
- Prefer binaries (reference-counted, heap-external) over charlists for large strings
- Hibernate idle LiveView processes to compact their heaps

## Usage in Prismatic Platform

Real-time behavior is central to several platform features and is enforced through performance quality gates:

The **OSINT toolbox** provides streaming progress updates during tool execution via PubSub topic `"osint:execution:#{slug}"`. When a user initiates a tool execution from the LiveView interface, a supervised Task executes the tool asynchronously while broadcasting progress updates. The LiveView receives these updates via `handle_info/2` and pushes UI changes to the browser in real-time -- progress bars advance, result counts update, and final results appear without any page refresh or polling.

The **DD pipeline dashboard** at `/hub/dd/pipeline` receives real-time updates through the `"dd:pipeline"` PubSub topic. Pipeline stages (fetch, parse, extract, score) broadcast their status changes, enabling operators to watch the investigation pipeline process documents in real-time. The dashboard displays source group grids with live entity counts, color-coded status indicators, and scheduler state.

The **Error Intelligence Feed** at `/admin/error-feed` streams live error events from the SASL logger, pattern-matched and categorized by the PatternTracker GenServer. New errors appear instantly in the dashboard without polling, including stack traces, frequency counters, and categorization badges.

The **Perimeter EASM dashboard** shows live security rating changes as asset discovery progresses. When the scanner discovers a new asset or detects a configuration change, it broadcasts to the `"perimeter:scan"` topic, and all connected dashboards update simultaneously.

The platform enforces real-time performance standards as blocking quality gates: page loads under 250ms, server-side render under 100ms, LiveView mount under 150ms. Violations prevent merge. The `handle_event` under 50ms target is advisory but tracked via telemetry.

## Code Examples

```elixir
defmodule PrismaticWeb.OsintToolLive do
  @moduledoc """
  Real-time OSINT tool execution with streaming progress updates.

  Demonstrates the core PubSub subscription pattern for real-time
  LiveView interfaces: subscribe on connected mount, receive updates
  via handle_info, and push DOM changes to the browser.

  ## Real-Time Flow

  1. User clicks "Execute" -> `handle_event("execute", ...)`
  2. Task spawned under TaskSupervisor -> async execution begins
  3. Task broadcasts progress -> `handle_info({:execution_progress, ...})`
  4. LiveView assigns updated -> DOM diff pushed to browser
  5. Task broadcasts completion -> `handle_info({:execution_complete, ...})`
  6. Results rendered -> final DOM diff pushed

  All steps are non-blocking. The LiveView process handles other
  events (navigation, form input) concurrently with the execution.
  """

  use PrismaticWeb, :live_view

  alias PrismaticOsintCore.ToolRegistry

  require Logger

  @impl true
  @doc """
  Mounts the LiveView with PubSub subscription for real-time updates.

  Only subscribes when the socket is connected (WebSocket phase),
  not during the initial static HTTP render phase. This prevents
  unnecessary subscriptions for search engine crawlers and prevents
  duplicate subscriptions.
  """
  @spec mount(map(), map(), Phoenix.LiveView.Socket.t()) ::
          {:ok, Phoenix.LiveView.Socket.t()}
  def mount(%{"tool" => slug}, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "osint:execution:#{slug}")
    end

    tool = ToolRegistry.get_by_slug(slug)

    socket =
      socket
      |> assign(tool: tool, status: :idle, progress: 0, results: nil)
      |> assign(execution_start: nil, elapsed_ms: 0)

    {:ok, socket}
  end

  @impl true
  @doc "Handles real-time progress updates from the execution task."
  @spec handle_info(term(), Phoenix.LiveView.Socket.t()) ::
          {:noreply, Phoenix.LiveView.Socket.t()}
  def handle_info({:execution_progress, progress}, socket) do
    elapsed =
      case socket.assigns.execution_start do
        nil -> 0
        start -> System.monotonic_time(:millisecond) - start
      end

    {:noreply, assign(socket, progress: progress, status: :running, elapsed_ms: elapsed)}
  end

  def handle_info({:execution_complete, results}, socket) do
    elapsed =
      case socket.assigns.execution_start do
        nil -> 0
        start -> System.monotonic_time(:millisecond) - start
      end

    Logger.info("Tool execution displayed to user",
      tool: socket.assigns.tool.slug,
      total_elapsed_ms: elapsed,
      result_count: length(Map.get(results, :items, []))
    )

    {:noreply,
     assign(socket,
       results: results,
       status: :complete,
       progress: 100,
       elapsed_ms: elapsed
     )}
  end

  def handle_info(_msg, socket), do: {:noreply, socket}

  @impl true
  @doc """
  Handles the "execute" event from the user clicking the execute button.

  Spawns a supervised task that executes the OSINT tool asynchronously
  and broadcasts progress/completion events back to this LiveView
  via PubSub.
  """
  @spec handle_event(String.t(), map(), Phoenix.LiveView.Socket.t()) ::
          {:noreply, Phoenix.LiveView.Socket.t()}
  def handle_event("execute", params, socket) do
    tool = socket.assigns.tool
    topic = "osint:execution:#{tool.slug}"
    caller_metadata = Logger.metadata()

    Task.Supervisor.start_child(PrismaticOsintCore.TaskSupervisor, fn ->
      Logger.metadata(caller_metadata)
      Logger.info("Async tool execution started", tool: tool.slug)

      case ToolRegistry.execute(tool.slug, params) do
        {:ok, results} ->
          Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, topic, {:execution_complete, results})

        {:error, reason} ->
          Logger.warning("Tool execution failed",
            tool: tool.slug,
            reason: inspect(reason)
          )

          Phoenix.PubSub.broadcast(
            PrismaticWeb.PubSub,
            topic,
            {:execution_complete, %{error: reason, items: []}}
          )
      end
    end)

    {:noreply,
     assign(socket,
       status: :running,
       progress: 0,
       execution_start: System.monotonic_time(:millisecond)
     )}
  end

  def handle_event(_event, _params, socket), do: {:noreply, socket}
end
```

```elixir
defmodule PrismaticWeb.RealTimeBroadcaster do
  @moduledoc """
  Centralized real-time event broadcasting with throttling support.

  Provides rate-limited broadcasting for high-frequency events
  (progress bars, metrics, counters) to prevent overwhelming
  LiveView clients with too-frequent DOM updates. Implements
  a minimum interval between broadcasts per topic, coalescing
  intermediate updates.

  ## Architecture

  Runs as a GenServer that buffers incoming broadcast requests
  and emits them at a controlled rate. Each topic has an independent
  throttle timer, ensuring that high-frequency topics do not delay
  low-frequency ones.
  """

  use GenServer

  require Logger

  @default_throttle_ms 100

  @doc """
  Starts the broadcaster.

  ## Examples

      iex> RealTimeBroadcaster.start_link(throttle_ms: 200)
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Broadcasts a message with throttling.

  If a broadcast was sent to this topic within the last `throttle_ms`
  milliseconds, the message is buffered and sent when the throttle
  window expires. Only the latest message is kept; intermediate
  messages are discarded (last-write-wins coalescing).

  ## Examples

      iex> RealTimeBroadcaster.throttled_broadcast("dd:pipeline", {:progress, 42})
      :ok
  """
  @spec throttled_broadcast(String.t(), term()) :: :ok
  def throttled_broadcast(topic, message) do
    GenServer.cast(__MODULE__, {:broadcast, topic, message})
  end

  @doc """
  Broadcasts a message immediately without throttling.

  Use for low-frequency, high-importance events (completion,
  error, state transitions) that must be delivered immediately.

  ## Examples

      iex> RealTimeBroadcaster.immediate_broadcast("dd:pipeline", {:complete, results})
      :ok
  """
  @spec immediate_broadcast(String.t(), term()) :: :ok
  def immediate_broadcast(topic, message) do
    Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, topic, message)
  end

  @impl true
  def init(opts) do
    throttle_ms = Keyword.get(opts, :throttle_ms, @default_throttle_ms)

    state = %{
      throttle_ms: throttle_ms,
      pending: %{},
      timers: %{}
    }

    {:ok, state}
  end

  @impl true
  def handle_cast({:broadcast, topic, message}, state) do
    case Map.get(state.timers, topic) do
      nil ->
        Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, topic, message)
        timer = Process.send_after(self(), {:throttle_expired, topic}, state.throttle_ms)

        {:noreply, %{state | timers: Map.put(state.timers, topic, timer)}}

      _existing_timer ->
        {:noreply, %{state | pending: Map.put(state.pending, topic, message)}}
    end
  end

  @impl true
  def handle_info({:throttle_expired, topic}, state) do
    timers = Map.delete(state.timers, topic)

    case Map.pop(state.pending, topic) do
      {nil, pending} ->
        {:noreply, %{state | timers: timers, pending: pending}}

      {message, pending} ->
        Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, topic, message)
        timer = Process.send_after(self(), {:throttle_expired, topic}, state.throttle_ms)

        {:noreply, %{state | timers: Map.put(timers, topic, timer), pending: pending}}
    end
  end
end
```

```elixir
defmodule PrismaticWeb.PerformanceGuard do
  @moduledoc """
  Runtime enforcement of real-time performance standards.

  Instruments LiveView callbacks to measure execution time and
  log warnings when real-time performance targets are exceeded.
  Publishes metrics via Telemetry for dashboard visualization.
  """

  require Logger

  @targets %{
    mount: 150,
    handle_event: 50,
    handle_info: 10,
    handle_params: 50
  }

  @doc """
  Measures execution time of a callback and logs if target exceeded.

  ## Examples

      iex> PerformanceGuard.measure(:handle_event, "click", fn -> :ok end)
      {:ok, 2}
  """
  @spec measure(atom(), String.t(), (() -> term())) :: {term(), non_neg_integer()}
  def measure(callback_type, label, fun) do
    start = System.monotonic_time(:microsecond)
    result = fun.()
    duration_us = System.monotonic_time(:microsecond) - start
    duration_ms = div(duration_us, 1000)

    target = Map.get(@targets, callback_type, 100)

    :telemetry.execute(
      [:prismatic, :liveview, callback_type],
      %{duration_us: duration_us},
      %{label: label}
    )

    if duration_ms > target do
      Logger.warning("Real-time target exceeded",
        callback: callback_type,
        label: label,
        duration_ms: duration_ms,
        target_ms: target,
        exceeded_by_ms: duration_ms - target
      )
    end

    {result, duration_ms}
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Subscribing to PubSub in disconnected mount | Subscription fires during static render; process dies after render | Guard with `if connected?(socket) do ... end` |
| Broadcasting too frequently | Client overwhelmed with DOM patches; browser janks | Throttle broadcasts to 100ms intervals for progress-type updates |
| Using global PubSub topics | Every LiveView receives every message; massive fan-out waste | Use specific topics: `"dd:pipeline:#{run_id}"` not `"dd:pipeline"` |
| Blocking operations in `handle_info` | LiveView process frozen; no events processed; UI appears frozen | Keep handlers under 10ms; spawn Tasks for heavy work |
| Large assigns in LiveView state | GC pauses grow; memory per connection increases; DOM diffs grow | Store large data in ETS; keep assigns minimal |
| Not testing under concurrent load | Single-user latency looks fine; multi-user degrades due to contention | Load test with realistic concurrent connection counts |
| Ignoring BEAM scheduler saturation | All schedulers at 100%; preemption still fair but latency increases | Monitor scheduler utilization; add capacity before saturation |
| Using Process.sleep in LiveView | Blocks the LiveView process; no events processed during sleep | Use `Process.send_after/3` for delayed actions |
| Synchronous external calls in handlers | HTTP calls to external APIs block the LiveView process | Use Task.async or GenServer for external calls; push results via PubSub |
| Not handling PubSub message backpressure | Slow LiveView accumulates messages in mailbox; memory grows | Implement mailbox overflow detection; drop stale messages |

## Best Practices

1. **Subscribe only when connected** -- guard PubSub subscriptions with `connected?(socket)` to avoid subscribing during static render.

2. **Throttle high-frequency updates** -- for progress bars, counters, and metrics, debounce broadcasts to 100ms intervals to avoid overwhelming clients with DOM patches.

3. **Use targeted PubSub topics** -- broadcast to specific topics (e.g., `"dd:pipeline:#{run_id}"`) rather than global topics to minimize unnecessary message delivery and reduce fan-out.

4. **Keep `handle_info` and `handle_event` fast** -- real-time handlers should assign data and return immediately; never perform blocking operations (HTTP calls, database queries) in callbacks.

5. **Test with concurrent connections** -- real-time behavior under load differs from single-user testing; use tools like `k6`, Locust, or custom WebSocket load generators.

6. **Monitor BEAM scheduler utilization** -- use `:scheduler.utilization/1` to detect when schedulers are approaching saturation, which degrades real-time guarantees.

7. **Minimize LiveView assign sizes** -- large assigns increase GC pressure and DOM diff computation time; use ETS or external storage for large datasets.

8. **Propagate Logger metadata across async boundaries** -- capture metadata before spawning Tasks; restore in the Task function for complete tracing.

9. **Use `Process.send_after/3` instead of `Process.sleep/1`** -- delayed actions in LiveView should use message scheduling, not blocking sleep.

10. **Implement graceful degradation** -- if real-time updates fail (WebSocket disconnect), fall back to polling; if D3.js fails (MetaMask SES), fall back to Chart.js.

## Related Terms

- [LiveView](/glossary/liveview/) -- Phoenix's server-rendered real-time UI framework
- [WebSocket](/glossary/websocket/) -- the transport protocol enabling persistent real-time connections
- [PubSub](/glossary/pubsub/) -- publish-subscribe pattern for decoupled real-time event distribution
- [Phoenix Channel](/glossary/phoenix-channel/) -- topic-based real-time communication abstraction
- [Server-Sent Events](/glossary/server-sent-events/) -- unidirectional real-time server-to-client streaming
- [Scheduler](/glossary/scheduler/) -- BEAM's preemptive scheduler providing soft real-time guarantees
- [Reduction](/glossary/reduction/) -- the work unit used for BEAM preemptive scheduling budgets
- [Garbage Collection](/glossary/garbage-collection/) -- per-process GC enabling real-time behavior
- [GenServer](/glossary/genserver/) -- the process abstraction commonly used for real-time state management
- [Telemetry](/glossary/telemetry/) -- metrics and events system for monitoring real-time performance
- [Time to First Byte](/glossary/time-to-first-byte/) -- latency metric for initial response delivery
- [Throughput](/glossary/throughput/) -- volume metric complementing latency in real-time systems

## See Also

- [Phoenix LiveView Documentation](https://hexdocs.pm/phoenix_live_view/) -- official LiveView guide
- [Platform Architecture](/architecture/) -- real-time infrastructure design
- [Performance Standards](/capabilities/) -- real-time latency targets and enforcement
- [BEAM Scheduler Documentation](https://www.erlang.org/doc/man/erl.html#+S) -- scheduler configuration
- [Phoenix PubSub](https://hexdocs.pm/phoenix_pubsub/) -- PubSub library documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
