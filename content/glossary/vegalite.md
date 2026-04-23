+++
title = "VegaLite"
weight = 50
[extra]
description = "Declarative visualization grammar for creating interactive charts and graphs from structured data specifications"
category = "visualization"
related_terms = ["visualization", "livebook", "chart", "data-analysis"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["VegaLite", "visualization", "declarative charts", "data visualization", "Livebook", "glossary", "Prismatic Platform"]
tags = ["glossary", "visualization"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "VegaLite - Prismatic Platform"
+++

## Definition & Overview

VegaLite is a high-level declarative visualization grammar that enables the creation of interactive charts and graphs by describing the visual encoding of data rather than imperatively drawing shapes. Based on the Vega-Lite specification from the University of Washington's Interactive Data Lab, VegaLite translates concise JSON or programmatic descriptions into rich, interactive visualizations. The "declarative" aspect means you describe what you want to see (data fields mapped to visual channels like position, color, and size) rather than how to draw it.

In the Elixir ecosystem, the `VegaLite` library (available as a Hex package) provides an Elixir-native API for building Vega-Lite specifications. It integrates seamlessly with Livebook for interactive notebook visualizations and with Phoenix LiveView through the `Kino.VegaLite` component for real-time updating charts. This makes VegaLite the natural choice for data visualization in BEAM applications.

The Prismatic Platform uses VegaLite across its 100 Livebook ecosystem for interactive data exploration, in the Academy for learning visualizations, and in the monitoring infrastructure for real-time performance dashboards. The platform's telemetry data, quality scores, OSINT tool statistics, and security ratings are all visualizable through VegaLite specifications that render in both Livebook and LiveView contexts.

## Technical Deep Dive

VegaLite specifications in Elixir use a fluent builder API:

```elixir
defmodule PrismaticViz.Charts do
  @moduledoc """
  VegaLite chart builders for common platform visualization
  patterns: time series, distributions, and hierarchies.
  """

  alias VegaLite, as: Vl

  @spec time_series_chart(String.t(), [map()], keyword()) :: VegaLite.t()
  def time_series_chart(title, data, opts \\ []) do
    width = Keyword.get(opts, :width, 600)
    height = Keyword.get(opts, :height, 300)
    color_field = Keyword.get(opts, :color_field, nil)

    base =
      Vl.new(width: width, height: height, title: title)
      |> Vl.data_from_values(data)
      |> Vl.mark(:line, point: true, tooltip: true)
      |> Vl.encode_field(:x, "timestamp",
        type: :temporal,
        title: "Time",
        axis: [format: "%H:%M", label_angle: -45]
      )
      |> Vl.encode_field(:y, "value",
        type: :quantitative,
        title: Keyword.get(opts, :y_title, "Value")
      )

    if color_field do
      Vl.encode_field(base, :color, color_field, type: :nominal)
    else
      base
    end
  end

  @spec distribution_chart(String.t(), [number()], keyword()) :: VegaLite.t()
  def distribution_chart(title, values, opts \\ []) do
    bins = Keyword.get(opts, :bins, 30)
    data = Enum.map(values, fn v -> %{"value" => v} end)

    Vl.new(width: 500, height: 300, title: title)
    |> Vl.data_from_values(data)
    |> Vl.mark(:bar, tooltip: true)
    |> Vl.encode_field(:x, "value",
      type: :quantitative,
      bin: [maxbins: bins],
      title: Keyword.get(opts, :x_title, "Value")
    )
    |> Vl.encode(:y, aggregate: :count, type: :quantitative, title: "Frequency")
  end

  @spec heatmap(String.t(), [map()], keyword()) :: VegaLite.t()
  def heatmap(title, data, opts \\ []) do
    x_field = Keyword.get(opts, :x_field, "x")
    y_field = Keyword.get(opts, :y_field, "y")
    value_field = Keyword.get(opts, :value_field, "value")

    Vl.new(width: 500, height: 400, title: title)
    |> Vl.data_from_values(data)
    |> Vl.mark(:rect, tooltip: true)
    |> Vl.encode_field(:x, x_field, type: :ordinal)
    |> Vl.encode_field(:y, y_field, type: :ordinal)
    |> Vl.encode_field(:color, value_field,
      type: :quantitative,
      scale: [scheme: "blues"]
    )
  end
end
```

For real-time updating charts in LiveView using Kino.VegaLite:

```elixir
defmodule PrismaticViz.LiveCharts do
  @moduledoc """
  Real-time updating VegaLite charts that receive
  data points via PubSub for live dashboards.
  """

  alias VegaLite, as: Vl

  @spec streaming_metric_chart(String.t(), keyword()) :: VegaLite.t()
  def streaming_metric_chart(metric_name, opts \\ []) do
    window = Keyword.get(opts, :window_seconds, 300)

    Vl.new(width: 700, height: 250, title: "#{metric_name} (Live)")
    |> Vl.mark(:line, point: false, interpolate: "monotone")
    |> Vl.encode_field(:x, "timestamp",
      type: :temporal,
      title: "Time",
      scale: [domain: [signal: "now() - #{window * 1000}", signal: "now()"]]
    )
    |> Vl.encode_field(:y, "value",
      type: :quantitative,
      title: metric_name,
      scale: [zero: false]
    )
    |> Vl.encode_field(:color, "source", type: :nominal)
  end

  @spec quality_radar_chart([map()]) :: VegaLite.t()
  def quality_radar_chart(domain_scores) do
    Vl.new(width: 400, height: 400, title: "Quality Domain Scores")
    |> Vl.data_from_values(domain_scores)
    |> Vl.mark(:arc, tooltip: true)
    |> Vl.encode_field(:theta, "score", type: :quantitative, stack: true)
    |> Vl.encode_field(:color, "domain",
      type: :nominal,
      scale: [scheme: "category20"]
    )
    |> Vl.encode_field(:tooltip, "domain", type: :nominal)
  end
end
```

## Architecture & Implementation

VegaLite visualization in the platform operates through three delivery mechanisms:

**Livebook Integration**: The 100 interactive Livebooks across 10 domains use VegaLite as their primary visualization tool. Livebook's native Kino.VegaLite support enables real-time chart updates where data streams from platform processes into live visualizations. The OSINT Command Center livebook, for example, renders tool execution statistics as updating time series charts.

**LiveView Dashboards**: Platform dashboards use VegaLite specifications rendered through JavaScript. The specifications are built server-side in Elixir and transmitted to the client as JSON, where the Vega-Lite JavaScript library renders them into SVG/Canvas visualizations. This approach keeps the visualization logic in Elixir while leveraging browser-native rendering.

**Static Reports**: The platform's reporting system generates VegaLite specifications that are rendered to static PNG/SVG images for inclusion in PDF reports and email notifications. This enables rich visualizations in contexts where interactive JavaScript is not available.

The chart building functions in `PrismaticViz.Charts` provide opinionated defaults for common visualization patterns while remaining fully customizable through keyword options. This balance between convenience and flexibility ensures that platform developers can quickly create standard charts while retaining the ability to build custom visualizations.

## Usage in Prismatic Platform

Quality DNA evolution is visualized using VegaLite charts in both Livebook and the monitoring dashboard:

```elixir
defmodule PrismaticViz.QualityDashboard do
  @moduledoc """
  VegaLite visualizations for the Quality DNA evolution
  dashboard, showing scores across generations.
  """

  alias VegaLite, as: Vl

  @spec generation_evolution_chart([map()]) :: VegaLite.t()
  def generation_evolution_chart(generation_data) do
    Vl.new(width: 800, height: 400, title: "Quality Score Evolution Across Generations")
    |> Vl.data_from_values(generation_data)
    |> Vl.mark(:area, opacity: 0.7, interpolate: "monotone", line: true)
    |> Vl.encode_field(:x, "generation",
      type: :ordinal,
      title: "Platform Generation",
      axis: [label_angle: 0]
    )
    |> Vl.encode_field(:y, "quality_score",
      type: :quantitative,
      title: "Quality Score",
      scale: [domain: [0, 100]]
    )
    |> Vl.encode_field(:color, "domain",
      type: :nominal,
      legend: [title: "Quality Domain"]
    )
  end

  @spec domain_comparison_chart(map()) :: VegaLite.t()
  def domain_comparison_chart(current_scores) do
    data =
      current_scores
      |> Enum.map(fn {domain, score} -> %{"domain" => to_string(domain), "score" => score} end)

    Vl.new(width: 600, height: 350, title: "Current Quality Domain Scores (100/100)")
    |> Vl.data_from_values(data)
    |> Vl.mark(:bar, tooltip: true, corner_radius_end: 4)
    |> Vl.encode_field(:x, "domain", type: :nominal, sort: "-y", title: "Domain")
    |> Vl.encode_field(:y, "score", type: :quantitative, title: "Score", scale: [domain: [0, 100]])
    |> Vl.encode_field(:color, "score",
      type: :quantitative,
      scale: [scheme: "greens", domain: [0, 100]]
    )
  end
end
```

The OSINT toolbox dashboard uses VegaLite to show tool execution frequency distribution, helping operators identify the most-used tools and optimize caching strategies for popular queries.

## Cross-References

- [Visualization](/glossary/visualization/) - Broader data representation concepts
- [Livebook](/glossary/livebook/) - Interactive notebook with VegaLite support
- [Telemetry](/glossary/telemetry/) - Data source for visualizations
- [Time Series](/glossary/time-series/) - Temporal data often visualized
- [Trend](/glossary/trend/) - Pattern visualization in time data

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
