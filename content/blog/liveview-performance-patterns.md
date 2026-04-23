+++
title = "LiveView Performance Patterns for Complex Dashboards"
date = 2026-03-07
description = "Practical patterns for building high-performance Phoenix LiveView dashboards: defensive mounts, efficient assigns, PubSub-driven updates, and Chart.js integration with sub-150ms mount times."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["liveview", "phoenix", "performance", "dashboards", "elixir", "real-time"]
reading_time = "10 min"
keywords = ["Phoenix LiveView performance", "LiveView dashboard patterns", "real-time Elixir dashboard", "LiveView mount optimization", "Chart.js LiveView", "PubSub LiveView"]
image = "/images/blog/liveview-performance.png"
word_count = 1800
date_created = "2026-03-07"
date_modified = "2026-03-07"
quality_score = 84
see_also = ["developers", "architecture", "capabilities"]
image_alt = "LiveView Performance Patterns for Complex Dashboards - Prismatic Platform"
+++

Prismatic Platform serves 30+ LiveView pages including real-time dashboards, OSINT tool interfaces, and investigation case views. Keeping mount times under 150ms while loading complex data requires disciplined patterns. This post shares the patterns that work.

## Defensive Mount Pattern

The most important pattern for production LiveView code is the defensive mount. When data loading fails during mount, the entire page returns a 500 error. This is unacceptable for a dashboard that should always render.

```elixir
def mount(params, session, socket) do
  socket = assign_defaults(socket, session)

  socket =
    try do
      cases = PrismaticDD.list_cases(limit: 50)
      stats = PrismaticDD.case_statistics()

      socket
      |> assign(:cases, cases)
      |> assign(:stats, stats)
      |> assign(:loading_error, nil)
    rescue
      e in [Ecto.QueryError, DBConnection.ConnectionError] ->
        Logger.warning("DD dashboard mount failed: #{inspect(e)}")

        socket
        |> assign(:cases, [])
        |> assign(:stats, %{total: 0, active: 0})
        |> assign(:loading_error, "Data temporarily unavailable")
    end

  {:ok, socket}
end
```

This pattern has eliminated 65+ route failures across the platform. The key: always render something, log the error, and let the user retry.

## Two-Phase Mount

LiveView's `mount/3` is called twice: once for the static HTML render (dead render) and once when the WebSocket connects (live render). Expensive data loading should happen only on the live render:

```elixir
def mount(_params, _session, socket) do
  socket = assign(socket, cases: [], loading: true)

  if connected?(socket) do
    send(self(), :load_data)
  end

  {:ok, socket}
end

def handle_info(:load_data, socket) do
  cases = PrismaticDD.list_cases(limit: 50)
  {:noreply, assign(socket, cases: cases, loading: false)}
end
```

The dead render shows a loading skeleton. The live render loads actual data. This keeps the initial page load fast while avoiding duplicate data fetches.

## Efficient Assigns

LiveView diffs assigns between renders. Large assigns that change frequently cause large diffs and slow updates. Strategies to minimize this:

**Use streams for lists**: Instead of assigning a full list, use LiveView streams:

```elixir
def mount(_params, _session, socket) do
  cases = PrismaticDD.list_cases(limit: 50)
  {:ok, stream(socket, :cases, cases)}
end

def handle_info({:case_updated, case}, socket) do
  {:noreply, stream_insert(socket, :cases, case)}
end
```

Streams send only the changed items, not the entire list.

**Avoid nested maps in assigns**: Deeply nested maps are expensive to diff. Flatten your data structures:

```elixir
# Avoid
assign(socket, :dashboard, %{
  stats: %{total: 100, active: 50},
  filters: %{category: "all", status: "open"}
})

# Prefer
socket
|> assign(:stats_total, 100)
|> assign(:stats_active, 50)
|> assign(:filter_category, "all")
|> assign(:filter_status, "open")
```

## PubSub-Driven Updates

Instead of polling for updates, subscribe to PubSub topics:

```elixir
def mount(_params, _session, socket) do
  if connected?(socket) do
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "dd:cases")
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "dd:pipeline")
  end

  {:ok, load_initial_data(socket)}
end

def handle_info({:case_created, case}, socket) do
  {:noreply, stream_insert(socket, :cases, case, at: 0)}
end

def handle_info({:pipeline_progress, progress}, socket) do
  {:noreply, assign(socket, :pipeline_progress, progress)}
end
```

PubSub delivers updates only when data changes, eliminating unnecessary work.

## Chart.js Integration

For real-time charts, use JavaScript hooks with push_event:

```elixir
# Server side
def handle_info(:tick, socket) do
  data_point = %{
    timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
    value: get_current_metric()
  }

  socket = push_event(socket, "chart-update", data_point)
  Process.send_after(self(), :tick, 5_000)
  {:noreply, socket}
end
```

```javascript
// Client side hook
Hooks.RealtimeChart = {
  mounted() {
    this.chart = new Chart(this.el, chartConfig);

    this.handleEvent("chart-update", ({timestamp, value}) => {
      this.chart.data.labels.push(timestamp);
      this.chart.data.datasets[0].data.push(value);

      // Keep last 60 data points
      if (this.chart.data.labels.length > 60) {
        this.chart.data.labels.shift();
        this.chart.data.datasets[0].data.shift();
      }

      this.chart.update('none'); // Skip animation for performance
    });
  }
}
```

The `'none'` animation mode is critical for real-time charts -- animating every update creates visual jitter and consumes CPU.

## Browser Extension Compatibility

A subtle but important issue: browser extensions like MetaMask modify the JavaScript runtime environment. D3.js in particular fails when MetaMask's SES lockdown prevents prototype modification.

The solution is a fallback pattern:

```javascript
async function createVisualization(data) {
  try {
    const d3 = await import('d3');
    d3.format('.2f'); // Test if SES allows this
    return createD3Chart(d3, data);
  } catch (error) {
    if (error.message.includes("which has only a getter")) {
      return createChartJsFallback(data);
    }
    throw error;
  }
}
```

This pattern ensures dashboards work regardless of which browser extensions are installed.

## Performance Budget

We enforce strict performance budgets:

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Page load | < 250ms | PERF gate |
| Server render | < 100ms | PERF gate |
| LiveView mount | < 150ms | PERF gate |
| Health check | < 10ms | PERF gate |
| Chart update | < 16ms | 60fps budget |

These targets are validated in CI. Any LiveView that exceeds the mount budget triggers a review.

## Conclusion

High-performance LiveView dashboards are achievable with disciplined patterns: defensive mounts for resilience, two-phase loading for fast initial render, streams for efficient list updates, PubSub for real-time data, and Chart.js hooks for visualization. The patterns are simple individually but compound to deliver a responsive real-time experience.

---

*Try the [Interactive Academy](@/academy/_index.md) for hands-on LiveView exercises or explore the [Developer Portal](@/developers/_index.md) for the complete component library.*
