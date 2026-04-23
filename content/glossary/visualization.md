+++
title = "Visualization"
weight = 50
[extra]
description = "Graphical representation of data through charts, graphs, maps, and interactive displays for pattern discovery and communication"
category = "data"
related_terms = ["vegalite", "livebook", "dashboard", "chart"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["visualization", "data visualization", "charts", "graphs", "dashboards", "glossary", "Prismatic Platform"]
tags = ["glossary", "data"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Visualization - Prismatic Platform"
+++

## Definition & Overview

Visualization is the practice of representing data graphically through charts, graphs, maps, tables, and interactive displays to make patterns, trends, outliers, and relationships visible to human perception. Effective visualization transforms abstract numbers and relationships into spatial representations that leverage the human visual system's innate ability to detect patterns, clusters, and anomalies far faster than scanning raw data.

The field of data visualization spans from simple bar charts and line graphs to complex network visualizations, geographic maps, and multidimensional interactive explorations. The choice of visualization type depends on the data structure (temporal, categorical, hierarchical, network), the analytical goal (comparison, distribution, relationship, composition), and the audience (technical analysts, executives, automated systems).

In the Prismatic Platform, visualization serves three distinct purposes. Operational visualization through LiveView dashboards provides real-time system health monitoring, OSINT tool status, and quality metric tracking. Analytical visualization through Livebook notebooks enables interactive data exploration for intelligence analysis and performance investigation. Communication visualization through the promo site's Chart.js teasers presents platform capabilities to potential users through engaging, interactive demonstrations.

## Technical Deep Dive

The platform implements visualization through multiple rendering technologies:

```elixir
defmodule PrismaticViz.Renderer do
  @moduledoc """
  Multi-format visualization renderer supporting VegaLite,
  Chart.js specs, and SVG generation for different contexts.
  """

  @type render_target :: :liveview | :livebook | :static | :promo
  @type chart_spec :: map()

  @spec render(chart_spec(), render_target(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def render(spec, :liveview, _opts) do
    json = Jason.encode!(spec)
    {:ok, ~s(<div phx-hook="VegaLiteChart" data-spec='#{json}'></div>)}
  end

  def render(spec, :livebook, _opts) do
    vl = VegaLite.from_json(Jason.encode!(spec))
    {:ok, Kino.VegaLite.new(vl)}
  end

  def render(spec, :static, opts) do
    format = Keyword.get(opts, :format, :svg)
    generate_static(spec, format)
  end

  def render(spec, :promo, _opts) do
    chartjs_spec = convert_to_chartjs(spec)
    {:ok, Jason.encode!(chartjs_spec)}
  end

  defp generate_static(spec, :svg) do
    {:ok, VegaLite.Export.to_svg(spec)}
  end

  defp generate_static(spec, :png) do
    {:ok, VegaLite.Export.to_png(spec)}
  end

  defp convert_to_chartjs(vegalite_spec) do
    %{
      "type" => infer_chartjs_type(vegalite_spec),
      "data" => extract_chartjs_data(vegalite_spec),
      "options" => %{
        "responsive" => true,
        "plugins" => %{"legend" => %{"display" => true}}
      }
    }
  end

  defp infer_chartjs_type(%{"mark" => "line"}), do: "line"
  defp infer_chartjs_type(%{"mark" => "bar"}), do: "bar"
  defp infer_chartjs_type(%{"mark" => "arc"}), do: "doughnut"
  defp infer_chartjs_type(_), do: "bar"

  defp extract_chartjs_data(spec) do
    values = get_in(spec, ["data", "values"]) || []
    %{"datasets" => [%{"data" => Enum.map(values, & &1["value"])}]}
  end
end
```

Dashboard visualization components in LiveView:

```elixir
defmodule PrismaticWeb.Components.Visualization do
  @moduledoc """
  LiveView visualization components for embedding charts,
  metrics cards, and interactive displays.
  """

  use Phoenix.Component

  attr :title, :string, required: true
  attr :value, :string, required: true
  attr :change, :float, default: 0.0
  attr :unit, :string, default: ""

  def metric_card(assigns) do
    ~H"""
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 class="text-sm font-medium text-gray-400"><%= @title %></h3>
      <div class="mt-2 flex items-baseline">
        <p class="text-2xl font-semibold text-white"><%= @value %><%= @unit %></p>
        <span class={[
          "ml-2 text-sm font-medium",
          if(@change >= 0, do: "text-green-400", else: "text-red-400")
        ]}>
          <%= if @change >= 0, do: "+", else: "" %><%= Float.round(@change, 1) %>%
        </span>
      </div>
    </div>
    """
  end

  attr :id, :string, required: true
  attr :spec, :map, required: true
  attr :class, :string, default: ""

  def vegalite_chart(assigns) do
    ~H"""
    <div
      id={@id}
      class={["bg-gray-800 rounded-lg p-4 border border-gray-700", @class]}
      phx-hook="VegaLiteChart"
      data-spec={Jason.encode!(@spec)}
    >
      <div class="flex items-center justify-center h-64 text-gray-500">
        Loading visualization...
      </div>
    </div>
    """
  end

  attr :title, :string, required: true
  attr :items, :list, required: true
  attr :value_key, :atom, required: true
  attr :label_key, :atom, required: true

  def ranked_list(assigns) do
    ~H"""
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-4"><%= @title %></h3>
      <div class="space-y-3">
        <%= for {item, index} <- Enum.with_index(@items) do %>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-gray-500 w-6"><%= index + 1 %>.</span>
              <span class="text-gray-200"><%= Map.get(item, @label_key) %></span>
            </div>
            <span class="text-indigo-400 font-mono"><%= Map.get(item, @value_key) %></span>
          </div>
        <% end %>
      </div>
    </div>
    """
  end
end
```

## Architecture & Implementation

Visualization in the Prismatic Platform follows a layered architecture:

**Data Layer**: Raw data from telemetry, monitoring, OSINT executions, and quality tracking is aggregated and shaped into visualization-ready formats. Time series data is bucketed, categorical data is grouped, and network data is projected into layout coordinates.

**Specification Layer**: VegaLite specifications describe the mapping between data and visual properties. These specifications are built using Elixir builder functions that encapsulate common chart patterns (time series, distributions, heatmaps, network graphs) while remaining customizable.

**Rendering Layer**: Specifications are rendered through the appropriate technology based on the delivery context. LiveView uses JavaScript-based Vega-Lite rendering via Phoenix hooks. Livebook uses Kino.VegaLite for inline notebook rendering. The promo site uses Chart.js for lightweight interactive teasers.

**Interaction Layer**: Interactive visualizations support tooltips, zoom, selection, and cross-filtering. LiveView charts can trigger server-side events when users interact with data points, enabling drill-down workflows where clicking a metric on a dashboard loads detailed analysis.

The 100 Livebooks across 10 domains leverage visualization extensively. The OSINT Command Center livebook visualizes tool execution patterns. The Performance Profiling Lab livebook renders flame graphs and latency distributions. The Security Operations Center livebook displays attack surface maps and threat timelines.

## Usage in Prismatic Platform

The platform's monitoring dashboard combines multiple visualization types for comprehensive system overview:

```elixir
defmodule PrismaticWeb.MonitoringLive do
  use PrismaticWeb, :live_view

  alias PrismaticViz.Charts

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(5_000, :refresh)
    end

    {:ok, assign_visualizations(socket)}
  end

  @impl true
  def handle_info(:refresh, socket) do
    {:noreply, assign_visualizations(socket)}
  end

  defp assign_visualizations(socket) do
    latency_data = PrismaticMonitoring.get_recent_latencies(300)
    tool_usage = PrismaticOsintCore.ToolRegistry.usage_stats()
    quality_scores = PrismaticSafety.QualityDNA.current_scores()

    assign(socket,
      latency_chart: Charts.time_series_chart("Response Latency", latency_data,
        y_title: "ms", color_field: "endpoint"),
      tool_distribution: Charts.distribution_chart("Tool Execution Times",
        Enum.map(tool_usage, & &1.avg_duration_ms)),
      quality_chart: PrismaticViz.QualityDashboard.domain_comparison_chart(quality_scores)
    )
  end
end
```

The promo site features 25 premium Chart.js interactive teasers across 626 application pages, demonstrating platform capabilities through engaging visualizations that prospective users can interact with directly in their browsers.

## Cross-References

- [VegaLite](/glossary/vegalite/) - Declarative visualization grammar
- [Livebook](/glossary/livebook/) - Interactive notebook platform
- [Dashboard](/glossary/dashboard/) - Operational monitoring interface
- [Trend](/glossary/trend/) - Pattern revealed through visualization
- [Time Series](/glossary/time-series/) - Data commonly visualized

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
