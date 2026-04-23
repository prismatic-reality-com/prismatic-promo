+++
title = "Real-Time Dashboards: Chart.js with Phoenix LiveView"
date = 2026-03-30
description = "Building real-time dashboards using Chart.js with LiveView hooks, handling live data updates, D3.js fallback patterns, and MetaMask browser extension compatibility."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["chartjs", "liveview", "dashboards", "real-time", "d3js", "hooks"]
reading_time = "11 min"
keywords = ["chartjs liveview", "real-time dashboards elixir", "phoenix liveview charts", "d3js fallback", "metamask compatibility", "dashboard patterns"]
image = "/images/blog/real-time-dashboards-chartjs.png"
word_count = 1450
date_created = "2026-03-30"
date_modified = "2026-03-30"
quality_score = 88
see_also = ["developers", "tutorials"]
image_alt = "Real-Time Dashboards with Chart.js - Prismatic Platform"
+++

Real-time data visualization in Phoenix LiveView requires bridging two worlds: Elixir's server-side rendering and JavaScript's client-side charting libraries. This tutorial covers the patterns we use in Prismatic to create responsive, real-time dashboards using Chart.js with LiveView hooks, including our battle-tested D3.js fallback for browser extension compatibility.

## The Hook Architecture

LiveView hooks are the bridge between server-pushed data and client-side chart rendering. The pattern is straightforward: LiveView pushes events, hooks receive them and update charts.

```javascript
// assets/js/hooks/chart_hook.js
const ChartHook = {
  mounted() {
    this.chart = null;
    this.chartType = this.el.dataset.chartType || 'line';
    this.initChart();

    this.handleEvent('chart-data-update', (payload) => {
      this.updateChart(payload);
    });

    this.handleEvent('chart-reset', () => {
      this.resetChart();
    });
  },

  initChart() {
    const ctx = this.el.querySelector('canvas').getContext('2d');
    const config = JSON.parse(this.el.dataset.chartConfig || '{}');

    this.chart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: [],
        datasets: config.datasets || [{
          label: 'Value',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: { display: true },
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: config.showLegend !== false }
        }
      }
    });
  },

  updateChart(payload) {
    if (!this.chart) return;

    const { labels, datasets } = payload;

    this.chart.data.labels = labels;
    datasets.forEach((ds, i) => {
      if (this.chart.data.datasets[i]) {
        this.chart.data.datasets[i].data = ds.data;
      }
    });

    this.chart.update('none'); // Skip animation for real-time updates
  },

  destroyed() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
};

export default ChartHook;
```

## Server-Side Data Pushing

The LiveView component manages data collection and pushes updates at a controlled interval:

```elixir
defmodule PrismaticWebWeb.DashboardLive do
  @moduledoc """
  Real-time dashboard with Chart.js integration.
  Pushes metric updates at 2-second intervals.
  """

  use PrismaticWebWeb, :live_view

  @update_interval_ms 2_000
  @max_data_points 60

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(@update_interval_ms, :tick)
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "system_metrics")
    end

    {:ok, assign(socket,
      metrics_history: [],
      current_metrics: %{}
    )}
  end

  @impl true
  def handle_info(:tick, socket) do
    metrics = collect_current_metrics()
    history = append_and_trim(socket.assigns.metrics_history, metrics)

    chart_data = format_chart_data(history)

    {:noreply,
     socket
     |> assign(metrics_history: history, current_metrics: metrics)
     |> push_event("chart-data-update", chart_data)}
  end

  defp append_and_trim(history, new_point) do
    [new_point | history]
    |> Enum.take(@max_data_points)
    |> Enum.reverse()
  end

  defp format_chart_data(history) do
    %{
      labels: Enum.map(history, &format_timestamp(&1.timestamp)),
      datasets: [
        %{data: Enum.map(history, & &1.ops_per_second)},
        %{data: Enum.map(history, & &1.avg_latency_ms)}
      ]
    }
  end
end
```

## The HEEx Template

The template wires the hook to a DOM element with configuration via data attributes:

```heex
<div id="operations-chart"
     phx-hook="ChartHook"
     data-chart-type="line"
     data-chart-config={Jason.encode!(%{
       datasets: [
         %{label: "Ops/sec", borderColor: "rgb(59, 130, 246)"},
         %{label: "Latency (ms)", borderColor: "rgb(239, 68, 68)", yAxisID: "y1"}
       ],
       showLegend: true
     })}
     class="relative h-64 w-full">
  <canvas></canvas>
</div>
```

## Update Strategies

Not all charts need the same update frequency. We use three strategies:

### Streaming (every 1-2 seconds)

For operational dashboards where operators need to see current state:

```elixir
# Push every tick
def handle_info(:tick, socket) do
  {:noreply, push_event(socket, "chart-data-update", collect_data())}
end
```

### Batched (every 10-30 seconds)

For trend charts where smoothness matters more than immediacy:

```elixir
# Accumulate and push in batches
def handle_info(:tick, socket) do
  buffer = [collect_point() | socket.assigns.buffer]

  if length(buffer) >= 5 do
    {:noreply,
     socket
     |> assign(buffer: [])
     |> push_event("chart-data-update", aggregate(buffer))}
  else
    {:noreply, assign(socket, buffer: buffer)}
  end
end
```

### Event-Driven (on PubSub message)

For charts that update only when something happens:

```elixir
def handle_info({:new_investigation, investigation}, socket) do
  {:noreply, push_event(socket, "chart-data-update", format_investigation(investigation))}
end
```

## D3.js Fallback and MetaMask Compatibility

This is where production reality diverges from tutorial simplicity. MetaMask and similar browser extensions that use Secure ECMAScript (SES) lockdown modify the global prototype chain. D3.js, which extends prototypes for number formatting, throws errors in this environment:

```
Cannot set property 'format' of #<Object> which has only a getter
```

Our solution: dynamic D3.js import with Chart.js fallback.

```javascript
// assets/js/hooks/visualization_hook.js
const VisualizationHook = {
  async mounted() {
    try {
      const d3 = await import('d3');
      // Test if D3 can actually work in this environment
      const testFormat = d3.format('.2f');
      testFormat(3.14);
      this.renderer = 'd3';
      this.d3 = d3;
      this.initD3Visualization();
    } catch (error) {
      if (error.message.includes('Cannot set property') &&
          error.message.includes('which has only a getter')) {
        console.info('[Prismatic] D3.js blocked by browser extension, using Chart.js fallback');
        this.renderer = 'chartjs';
        this.initChartJsFallback();
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
  },

  initD3Visualization() {
    // Full D3.js visualization with force-directed graphs,
    // custom scales, and interactive tooltips
    const svg = this.d3.select(this.el).append('svg');
    // ... D3 rendering
  },

  initChartJsFallback() {
    // Chart.js equivalent that provides similar functionality
    // without prototype modification
    const ctx = this.el.querySelector('canvas').getContext('2d');
    this.chart = new Chart(ctx, this.getFallbackConfig());
  }
};
```

This pattern is critical for production deployments. You cannot control what browser extensions your users have installed. The fallback must be seamless -- users should not notice they are seeing Chart.js instead of D3.js unless they inspect the DOM.

## Multi-Dataset Charts

Complex dashboards often need multiple datasets on a single chart with different Y axes:

```javascript
const dualAxisConfig = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Operations/sec',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        yAxisID: 'y'
      },
      {
        label: 'P95 Latency (ms)',
        data: [],
        borderColor: 'rgb(239, 68, 68)',
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Ops/sec' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Latency (ms)' },
        grid: { drawOnChartArea: false }
      }
    }
  }
};
```

## Memory Management

Charts that update every 2 seconds for hours will leak memory if not managed carefully. Three rules:

1. **Cap data points**: Never let arrays grow unboundedly. Use `Enum.take/2` on the server and array slicing on the client.

2. **Destroy on disconnect**: The `destroyed()` hook callback must call `chart.destroy()` to free canvas memory.

3. **Skip animations for real-time**: Use `chart.update('none')` instead of `chart.update()` for frequent updates. Animation frames accumulate and cause jank at high update rates.

```javascript
updateChart(payload) {
  // Cap at 120 data points (2 minutes at 1-second intervals)
  const maxPoints = 120;
  if (this.chart.data.labels.length > maxPoints) {
    this.chart.data.labels = this.chart.data.labels.slice(-maxPoints);
    this.chart.data.datasets.forEach(ds => {
      ds.data = ds.data.slice(-maxPoints);
    });
  }

  this.chart.update('none');
}
```

## Performance Metrics

Our production dashboards achieve these performance targets:

- **Initial render**: < 150ms (LiveView mount + first chart draw)
- **Update latency**: < 50ms (server push to visual update)
- **Memory usage**: Stable at ~15MB per chart instance over 8 hours
- **CPU usage**: < 2% on modern browsers with 4 active charts

The combination of server-side data management (Elixir controls what data to send and when) and client-side rendering (Chart.js handles the visual update) provides the best of both worlds: the reliability and state management of LiveView with the rendering performance of native JavaScript charting.

These patterns power every dashboard in Prismatic, from the system health overview to the DD pipeline monitor to the OSINT investigation progress display. The hook architecture is extensible -- new chart types require only a new configuration object, not new hook code.
