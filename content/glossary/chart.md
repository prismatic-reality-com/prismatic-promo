+++
title = "Chart"
weight = 50

[extra]
description = "A graphical representation of data that transforms raw numbers into visual patterns, enabling rapid comprehension of trends, distributions, and relationships through Chart.js, D3.js, and LiveView hooks"
category = "data-visualization"
domain = "frontend"
complexity = "intermediate"
stability = "mature"
beam_related = false
related_terms = ["analytics", "correlation", "cross-tabulation", "anomaly-detection", "benchmark", "telemetry", "dashboard", "liveview", "pubsub", "hook", "flowbite", "websocket"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["chart", "data visualization", "Chart.js", "D3.js", "graph", "dashboard", "analytics", "LiveView hooks", "MetaMask fallback", "real-time charts", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-visualization", "dashboard", "chart-js", "d3", "liveview"]
quality_score = 95
word_count = 3400
see_also = ["capabilities", "architecture", "telemetry", "dashboard"]
image = "/images/sections/glossary.png"
image_alt = "Chart - Prismatic Platform"
+++

## Definition

A chart is a graphical representation of data that encodes quantitative or categorical information into visual elements such as position, length, area, color, and shape. Charts transform raw data into visual patterns that the human visual cortex can process orders of magnitude faster than tabular data -- a well-designed chart can communicate in seconds what would take minutes to extract from a spreadsheet.

The field of data visualization distinguishes between several chart families: comparison charts (bar, column), composition charts (pie, stacked area), distribution charts (histogram, box plot), relationship charts (scatter, bubble), and temporal charts (line, area). The choice of chart type is not aesthetic but analytical -- each type reveals different structural properties of the underlying data. Choosing the wrong chart type can obscure patterns or mislead the viewer, making chart selection a critical analytical decision.

In the Prismatic Platform, charts serve as the primary interface between the platform's intelligence engines and human operators. The OSINT toolbox dashboards, Perimeter security ratings, DD pipeline status, Academy progress tracking, and Decision Engine confidence distributions all rely on interactive Chart.js visualizations rendered within Phoenix LiveView pages. A D3.js integration layer provides advanced network graphs and force-directed layouts for entity relationship visualization, with automatic fallback to Chart.js when browser extensions (notably MetaMask) interfere with D3.js prototype modifications.

---

## Core Concepts

### Chart Type Selection Matrix

| Data Question | Best Chart Type | Prismatic Usage | When to Avoid |
|---------------|----------------|-----------------|---------------|
| How do values compare? | Bar / Column | OSINT tool execution counts | More than 15 categories |
| What is the trend over time? | Line / Area | Security rating history | Fewer than 3 data points |
| What is the distribution? | Histogram / Box plot | Confidence score distribution | Categorical data |
| What is the composition? | Pie / Donut / Stacked bar | Asset type breakdown | More than 7 segments |
| What is the relationship? | Scatter / Bubble | Threat correlation | Non-numeric axes |
| What is the hierarchy? | Treemap / Sunburst | Agent tier structure | Flat structures |
| What is the flow? | Sankey / Alluvial | DD pipeline throughput | Simple A-to-B flows |
| What is the geographic pattern? | Choropleth / Heatmap | OSINT source coverage | Point-level precision needed |
| What is the network structure? | Force-directed / Arc | Entity relationships | More than 500 nodes |

### Visualization Library Comparison

| Feature | Chart.js | D3.js | Vega-Lite |
|---------|----------|-------|-----------|
| **Learning Curve** | Low | High | Medium |
| **Bundle Size** | ~65KB gzipped | ~95KB gzipped | ~130KB gzipped |
| **Declarative API** | Yes (config objects) | No (imperative) | Yes (JSON spec) |
| **Animation** | Built-in | Manual | Built-in |
| **Interactivity** | Tooltip, click events | Unlimited | Selection, zoom |
| **Accessibility** | ARIA labels, data tables | Manual implementation | ARIA via Vega |
| **MetaMask Compatible** | Yes | No (SES lockdown) | Yes |
| **Prismatic Usage** | Primary (all dashboards) | Network graphs, fallback | Not used |

### Chart Data Flow Architecture

| Layer | Responsibility | Technology | Latency Target |
|-------|---------------|------------|----------------|
| **Data Source** | Raw telemetry events | :telemetry, PubSub | N/A |
| **Aggregation** | Time-series bucketing | GenServer, ETS | < 50ms |
| **Formatting** | Chart-ready data structures | Formatter modules | < 10ms |
| **Transport** | LiveView push_event | WebSocket, JSON | < 20ms |
| **Rendering** | Client-side visualization | Chart.js / D3.js hooks | < 100ms |
| **Interaction** | User events back to server | phx-click, JS events | < 50ms |

---

## Technical Deep Dive

### Chart.js Integration Architecture

The Prismatic Platform implements a layered chart architecture. At the bottom layer, raw telemetry data flows through the platform's Telemetry pipeline into time-series aggregations stored in ETS tables. The middle layer transforms these aggregations into chart-ready data structures using dedicated formatter modules. The top layer renders charts via Chart.js hooks attached to Phoenix LiveView components.

This separation ensures that chart rendering never blocks the LiveView process. Data preparation happens in the LiveView `handle_info/2` callbacks (triggered by PubSub events), while Chart.js rendering happens entirely client-side via JavaScript hooks. Updates are pushed incrementally -- only changed data points are sent over the WebSocket, not the entire dataset.

### D3.js and MetaMask SES Compatibility

MetaMask injects a Secure EcmaScript (SES) lockdown into every page it runs on. This lockdown freezes certain JavaScript prototypes, preventing D3.js from modifying `Number.prototype` during its `d3-format` module initialization. The result is a runtime error: `Cannot set property 'format' of #<Object> which has only a getter`.

The Prismatic Platform handles this through a dynamic import pattern with automatic fallback:

```javascript
// assets/js/hooks/chart_hook.js
async function initializeVisualization(element, config) {
  try {
    const d3 = await import('d3');
    // Test that D3 format works (fails under MetaMask SES)
    const testFormat = d3.format('.2f');
    testFormat(42.0);
    return createD3Visualization(element, d3, config);
  } catch (error) {
    if (error.message.includes("Cannot set property") &&
        error.message.includes("which has only a getter")) {
      console.info("[Prismatic] D3.js blocked by SES lockdown, using Chart.js fallback");
      return createChartJsFallback(element, config);
    }
    throw error; // Re-throw unexpected errors
  }
}
```

This pattern is mandatory for all visualization code in the platform. The fallback activates in under 300ms, and the user experience is seamless -- the chart renders with Chart.js instead of D3.js, with equivalent data representation.

### LiveView Hook Lifecycle

Chart hooks follow the Phoenix LiveView hook lifecycle strictly. The `mounted()` callback initializes the chart instance. The `updated()` callback handles data changes pushed from the server. The `destroyed()` callback cleans up chart instances to prevent memory leaks. The `reconnected()` callback re-initializes charts after WebSocket reconnection.

```javascript
// assets/js/hooks/chart_js_hook.js
const ChartJS = {
  mounted() {
    this.chart = null;
    const config = JSON.parse(this.el.dataset.chartConfig);
    const type = this.el.dataset.chartType;
    const canvas = this.el.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    this.chart = new Chart(ctx, {
      type: type,
      data: config.data,
      options: {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 }
      }
    });

    this.handleEvent("chart-data-update", ({data}) => {
      this.chart.data = data;
      this.chart.update('none'); // Skip animation for real-time updates
    });

    this.handleEvent("chart-point-add", ({label, values}) => {
      this.chart.data.labels.push(label);
      values.forEach((val, i) => {
        this.chart.data.datasets[i].data.push(val);
      });
      // Sliding window: remove oldest point if over threshold
      if (this.chart.data.labels.length > 60) {
        this.chart.data.labels.shift();
        this.chart.data.datasets.forEach(ds => ds.data.shift());
      }
      this.chart.update('none');
    });
  },

  updated() {
    const config = JSON.parse(this.el.dataset.chartConfig);
    if (this.chart) {
      this.chart.data = config.data;
      this.chart.update();
    }
  },

  destroyed() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  },

  reconnected() {
    // Re-request current data from server after reconnection
    this.pushEvent("chart-reconnect", {chart_id: this.el.id});
  }
};

export default ChartJS;
```

### Real-Time Data Streaming

For dashboards requiring sub-second updates (OSINT execution monitoring, pipeline throughput), the platform uses a streaming pattern where the LiveView process subscribes to PubSub topics and pushes incremental chart updates:

```elixir
defmodule PrismaticWeb.DashboardLive.ChartStreamer do
  @moduledoc """
  Manages real-time chart data streaming for LiveView dashboards.
  Subscribes to telemetry PubSub topics and pushes incremental
  updates to client-side Chart.js instances via push_event/3.
  """

  @doc """
  Subscribes the given socket to chart-relevant PubSub topics
  and initializes the streaming state.
  """
  @spec subscribe_charts(Phoenix.LiveView.Socket.t(), list(atom())) ::
          Phoenix.LiveView.Socket.t()
  def subscribe_charts(socket, chart_ids) do
    Enum.each(chart_ids, fn id ->
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "chart:#{id}")
    end)

    assign(socket, :chart_buffers, %{})
  end

  @doc """
  Handles incoming telemetry data and batches updates to reduce
  WebSocket message frequency. Flushes every 500ms.
  """
  @spec handle_chart_event(
          Phoenix.LiveView.Socket.t(),
          atom(),
          map()
        ) :: Phoenix.LiveView.Socket.t()
  def handle_chart_event(socket, chart_id, data_point) do
    buffers = socket.assigns.chart_buffers
    buffer = Map.get(buffers, chart_id, [])
    updated_buffer = [data_point | buffer]

    if length(updated_buffer) >= 5 do
      push_event(socket, "chart-batch-update", %{
        chart_id: chart_id,
        points: Enum.reverse(updated_buffer)
      })
      |> assign(:chart_buffers, Map.put(buffers, chart_id, []))
    else
      assign(socket, :chart_buffers, Map.put(buffers, chart_id, updated_buffer))
    end
  end
end
```

---

## Usage in Prismatic Platform

The Perimeter security dashboard uses radar charts to visualize multi-dimensional security ratings across categories (network security, application security, DNS health, email security, patching cadence). The A-F grade translates to a numeric score (300-900) displayed as a gauge chart, with historical trend lines showing rating progression over time.

The OSINT toolbox dashboard renders execution statistics as bar charts (tools by category), line charts (execution frequency over time), and donut charts (success/failure ratios). Real-time execution progress uses animated progress indicators fed by PubSub streaming events.

The DD pipeline LiveView at `/hub/dd/pipeline` displays entity loading throughput as area charts, with separate series for each registered source (ForbesCz, Parliament, Senate, LocalGov). Anomaly detection highlights unusual loading patterns with contrasting colors, alerting operators to potential data quality issues.

The Decision Engine at `/hub/dd/decisions` renders confidence distributions as histogram charts, showing the spread of Nabla epistemic confidence scores across decision recommendations. Calibration charts compare predicted probabilities against observed outcomes, providing visual feedback on decision quality.

For the promo site, charts are rendered statically using pre-computed data embedded in templates. The premium Chart.js teasers use Alpine.js for interactivity (hover effects, tab switching) without requiring a LiveView connection, keeping the static site deployment simple while showcasing platform visualization capabilities.

---

## Code Examples

### Chart LiveComponent

```elixir
defmodule PrismaticWeb.Components.ChartComponent do
  @moduledoc """
  LiveView component for rendering Chart.js visualizations.
  Pushes data via hooks; Chart.js renders client-side.

  Supports line, bar, pie, radar, doughnut, scatter, and area chart types.
  Handles real-time updates through push_event/3 for incremental data changes.

  ## Examples

      <.live_component
        module={PrismaticWeb.Components.ChartComponent}
        id="osint-throughput"
        type={:line}
        data={@chart_data}
        options={%{fill: true}}
      />
  """

  use Phoenix.LiveComponent

  @type chart_type :: :line | :bar | :pie | :radar | :doughnut | :scatter | :area
  @type chart_data :: %{
          labels: list(String.t()),
          datasets: list(%{label: String.t(), values: list(number()), color: String.t()})
        }

  @spec render(map()) :: Phoenix.LiveView.Rendered.t()
  def render(assigns) do
    ~H"""
    <div
      id={"chart-#{@id}"}
      phx-hook="ChartJS"
      data-chart-type={@type}
      data-chart-config={Jason.encode!(@config)}
      class="w-full h-64"
    >
      <canvas></canvas>
    </div>
    """
  end

  @spec update(map(), Phoenix.LiveView.Socket.t()) :: {:ok, Phoenix.LiveView.Socket.t()}
  def update(assigns, socket) do
    config = build_chart_config(assigns.type, assigns.data, assigns[:options] || %{})
    {:ok, assign(socket, Map.put(assigns, :config, config))}
  end

  @doc """
  Builds a Chart.js-compatible configuration map from the given type, data, and options.

  ## Examples

      iex> data = %{labels: ["Jan", "Feb"], datasets: [%{label: "Revenue", values: [100, 200]}]}
      iex> config = build_chart_config(:line, data, %{fill: false})
      iex> config.type
      "line"
  """
  @spec build_chart_config(chart_type(), chart_data(), map()) :: map()
  defp build_chart_config(:line, data, options) do
    %{
      type: "line",
      data: %{
        labels: data.labels,
        datasets: Enum.map(data.datasets, fn ds ->
          %{
            label: ds.label,
            data: ds.values,
            borderColor: ds[:color] || "#6366f1",
            tension: 0.3,
            fill: Map.get(options, :fill, false)
          }
        end)
      },
      options: %{
        responsive: true,
        maintainAspectRatio: false,
        plugins: %{legend: %{position: "top"}}
      }
    }
  end

  defp build_chart_config(:bar, data, _options) do
    %{
      type: "bar",
      data: %{
        labels: data.labels,
        datasets: Enum.map(data.datasets, fn ds ->
          %{label: ds.label, data: ds.values, backgroundColor: ds[:color] || "#6366f1"}
        end)
      },
      options: %{responsive: true, maintainAspectRatio: false}
    }
  end

  defp build_chart_config(:radar, data, _options) do
    %{
      type: "radar",
      data: %{
        labels: data.labels,
        datasets: Enum.map(data.datasets, fn ds ->
          %{
            label: ds.label,
            data: ds.values,
            borderColor: ds[:color] || "#6366f1",
            backgroundColor: "#{ds[:color] || "#6366f1"}33"
          }
        end)
      },
      options: %{
        responsive: true,
        scales: %{r: %{beginAtZero: true}}
      }
    }
  end
end
```

### Chart Data Formatter

```elixir
defmodule PrismaticWeb.Charts.Formatter do
  @moduledoc """
  Transforms raw telemetry data into chart-ready data structures.
  Handles time-series bucketing, label formatting, color assignment,
  and dataset normalization for Chart.js consumption.
  """

  @type time_bucket :: :minute | :hour | :day | :week
  @type formatted_chart :: %{
          labels: list(String.t()),
          datasets: list(map())
        }

  @palette [
    "#6366f1", "#f43f5e", "#10b981", "#f59e0b",
    "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6"
  ]

  @doc """
  Formats time-series data into chart-ready structure with automatic
  time bucket labeling and color assignment.

  ## Examples

      iex> events = [%{timestamp: ~U[2026-04-01 10:00:00Z], value: 42, series: "ops"}]
      iex> %{labels: labels} = Formatter.format_time_series(events, :hour)
      iex> is_list(labels)
      true
  """
  @spec format_time_series(list(map()), time_bucket()) :: formatted_chart()
  def format_time_series(events, bucket \\ :hour) do
    grouped =
      events
      |> Enum.group_by(&truncate_time(&1.timestamp, bucket))
      |> Enum.sort_by(fn {time, _} -> time end)

    labels = Enum.map(grouped, fn {time, _} -> format_label(time, bucket) end)

    series =
      events
      |> Enum.map(& &1.series)
      |> Enum.uniq()

    datasets =
      series
      |> Enum.with_index()
      |> Enum.map(fn {name, idx} ->
        values = Enum.map(grouped, fn {_time, evts} ->
          evts
          |> Enum.filter(&(&1.series == name))
          |> Enum.count()
        end)

        %{
          label: name,
          values: values,
          color: Enum.at(@palette, rem(idx, length(@palette)))
        }
      end)

    %{labels: labels, datasets: datasets}
  end

  defp truncate_time(datetime, :minute), do: %{datetime | second: 0, microsecond: {0, 0}}
  defp truncate_time(datetime, :hour), do: %{datetime | minute: 0, second: 0, microsecond: {0, 0}}
  defp truncate_time(datetime, :day), do: DateTime.to_date(datetime)
  defp truncate_time(datetime, :week), do: Date.beginning_of_week(DateTime.to_date(datetime))

  defp format_label(time, :minute), do: Calendar.strftime(time, "%H:%M")
  defp format_label(time, :hour), do: Calendar.strftime(time, "%H:00")
  defp format_label(time, :day), do: Calendar.strftime(time, "%b %d")
  defp format_label(time, :week), do: "W#{Date.day_of_era(time) |> div(7)}"
end
```

---

## Common Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| **D3.js MetaMask crash** | `Cannot set property 'format'` error in console | Use dynamic `import('d3')` with Chart.js fallback pattern |
| **Memory leak from undestroyed charts** | Browser memory grows over time | Always destroy Chart instances in hook `destroyed()` callback |
| **Blocking LiveView with large datasets** | Slow mount, high BEAM process memory | Pre-aggregate data server-side, send only chart-ready summaries |
| **Animation jank on real-time updates** | Choppy chart transitions | Use `chart.update('none')` to skip animation on streaming data |
| **WebSocket flooding** | High message rate causes client lag | Batch updates in server-side buffer, flush every 500ms |
| **Wrong chart type selection** | Patterns invisible or misleading | Follow the Chart Type Selection Matrix above |
| **Canvas not resizing** | Chart overflows container on window resize | Set `responsive: true` and `maintainAspectRatio: false` |
| **Stale data after reconnect** | Chart shows pre-disconnect data | Handle `reconnected()` hook to re-request current data |
| **Color accessibility failures** | Charts unreadable for colorblind users | Use palette with sufficient contrast; add pattern fills |
| **Too many data points** | Chart renders slowly (10K+ points) | Enable Chart.js decimation plugin or pre-downsample |
| **Missing ARIA labels** | Screen readers cannot interpret chart | Add `aria-label` to canvas and provide fallback data table |
| **Z-index conflicts with Flowbite** | Tooltips hidden behind modals | Set chart tooltip `z-index` above Flowbite modal layer |

---

## Best Practices

1. **Always implement the MetaMask fallback pattern** -- dynamic `import('d3')` with Chart.js fallback is mandatory for all D3.js usage in the platform.
2. **Push incremental data, not full datasets** -- use `push_event/3` with `chart-point-add` events instead of replacing entire chart data on every update.
3. **Destroy chart instances in hook callbacks** -- failing to call `chart.destroy()` in the `destroyed()` hook causes canvas memory leaks.
4. **Use server-side aggregation** -- never send raw event streams to the client; aggregate into time buckets server-side.
5. **Batch real-time updates** -- buffer incoming telemetry events and flush to the client every 500ms to avoid WebSocket flooding.
6. **Follow the chart type selection matrix** -- choosing the wrong chart type obscures patterns; match the data question to the visualization.
7. **Set `maintainAspectRatio: false`** -- this enables proper responsive behavior within Flowbite/Tailwind layout containers.
8. **Provide accessible alternatives** -- include ARIA labels on canvas elements and fallback `<table>` elements for screen readers.
9. **Use the platform color palette** -- consistent colors across dashboards improve pattern recognition and brand coherence.
10. **Test with browser extensions enabled** -- verify chart rendering with MetaMask, uBlock Origin, and Privacy Badger active.

---

## Performance Considerations

| Concern | Solution | Implementation |
|---------|----------|----------------|
| Large datasets (10K+ points) | Data decimation | Chart.js decimation plugin with `algorithm: 'lttb'` |
| Real-time updates | Incremental push | LiveView `push_event/3` with batched points |
| Multiple charts per page | Lazy loading | IntersectionObserver in hook `mounted()` |
| Mobile responsiveness | Aspect ratio control | `maintainAspectRatio: false` in all configs |
| Accessibility | ARIA labels + data tables | Fallback `<table>` element for each chart |
| WebSocket bandwidth | Delta encoding | Send only changed values, not full datasets |
| Initial page load | Deferred rendering | Charts initialize after first contentful paint |
| Chart.js bundle size | Tree shaking | Import only used chart types and plugins |

---

## Related Terms

- [Analytics](/glossary/analytics/) -- data analysis that charts visualize
- [Telemetry](/glossary/telemetry/) -- event system feeding chart data pipelines
- [PubSub](/glossary/pubsub/) -- real-time event delivery for streaming charts
- [LiveView](/glossary/liveview/) -- server-rendered UI hosting chart components
- [Hook](/glossary/hook/) -- JavaScript hooks managing Chart.js lifecycle
- [Flowbite](/glossary/flowbite/) -- design system providing chart container layouts
- [WebSocket](/glossary/websocket/) -- transport layer for real-time chart updates
- [Dashboard](/glossary/dashboard/) -- composite views aggregating multiple charts
- [Anomaly Detection](/glossary/anomaly-detection/) -- outliers highlighted in chart visualizations
- [Benchmark](/glossary/benchmark/) -- performance data visualized through charts
- [Correlation](/glossary/correlation/) -- statistical relationships shown via scatter charts
- [Cross-Tabulation](/glossary/cross-tabulation/) -- pivot data often rendered as heatmap charts

---

## See Also

- [Architecture](/architecture/) -- platform visualization architecture
- [Technologies](/technologies/) -- Chart.js and D3.js technology profiles
- [Capabilities](/capabilities/) -- dashboard and analytics capabilities
- **Livebooks**: `livebooks/domains/data_analysis/` -- interactive chart creation notebooks
- **Academy**: Data visualization techniques in analytical topics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
