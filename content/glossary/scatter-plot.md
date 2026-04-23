+++
title = "Scatter Plot"
weight = 50
[extra]
description = "Two-variable data visualization plotting individual observations as points in a Cartesian coordinate space"
category = "data-analysis"
related_terms = ["percentile", "precision", "pivot-table", "seasonality", "profiling"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["scatter plot", "visualization", "data analysis", "correlation", "Chart.js", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "visualization", "charting"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Scatter Plot - Prismatic Platform"
+++

## Definition & Overview

A scatter plot (also called a scatter diagram or scatter chart) is a data visualization that displays the relationship between two numerical variables by plotting individual observations as points in a two-dimensional Cartesian coordinate system. The horizontal axis (x) represents one variable and the vertical axis (y) represents the other. The resulting pattern of points reveals the nature, direction, and strength of the relationship between the variables -- whether it is positive (both increase together), negative (one increases as the other decreases), linear, nonlinear, or absent.

Scatter plots are the foundational visualization for correlation analysis, regression modeling, and outlier detection. In security analytics, scatter plots reveal relationships between vulnerability severity and exploitation likelihood, between asset exposure and incident frequency, or between compliance score and breach probability. In performance analysis, scatter plots of request latency versus payload size identify nonlinear scaling behavior, and latency versus time plots reveal temporal patterns.

The Prismatic Platform renders scatter plots using Chart.js in its LiveView dashboards and promo site application teasers. The platform's analytics subsystem produces scatter plot data for security rating distributions (score versus industry percentile), OSINT tool performance (accuracy versus response time), and quality metric correlations (test coverage versus defect density).

## Technical Deep Dive

Scatter plot data preparation in Elixir involves transforming structured records into x-y coordinate pairs suitable for Chart.js rendering. The platform provides a standardized data preparation module that handles common transformations including log scaling, jittering (for overlapping discrete values), and color mapping for categorical dimensions.

```elixir
defmodule PrismaticAnalytics.ScatterPlot do
  @moduledoc """
  Scatter plot data preparation and transformation for Chart.js
  rendering in LiveView dashboards.
  """

  @type point :: %{x: number(), y: number(), label: String.t() | nil, category: atom() | nil}
  @type scatter_data :: %{
    points: [point()],
    x_label: String.t(),
    y_label: String.t(),
    correlation: float() | nil
  }

  @spec prepare([map()], atom(), atom(), keyword()) :: scatter_data()
  def prepare(records, x_field, y_field, opts \\ []) do
    label_field = Keyword.get(opts, :label_field)
    category_field = Keyword.get(opts, :category_field)

    points =
      records
      |> Enum.map(fn record ->
        %{
          x: Map.get(record, x_field),
          y: Map.get(record, y_field),
          label: label_field && Map.get(record, label_field),
          category: category_field && Map.get(record, category_field)
        }
      end)
      |> Enum.reject(fn p -> is_nil(p.x) or is_nil(p.y) end)

    correlation = compute_correlation(points)

    %{
      points: points,
      x_label: to_string(x_field),
      y_label: to_string(y_field),
      correlation: correlation
    }
  end

  @spec to_chartjs(scatter_data()) :: map()
  def to_chartjs(%{points: points} = data) do
    grouped = Enum.group_by(points, & &1.category)

    datasets =
      Enum.map(grouped, fn {category, category_points} ->
        %{
          label: to_string(category || "Data"),
          data: Enum.map(category_points, fn p -> %{x: p.x, y: p.y} end),
          backgroundColor: color_for_category(category),
          pointRadius: 4,
          pointHoverRadius: 6
        }
      end)

    %{
      type: "scatter",
      data: %{datasets: datasets},
      options: %{
        responsive: true,
        plugins: %{
          title: %{display: true, text: "#{data.x_label} vs #{data.y_label}"},
          tooltip: %{
            callbacks: %{
              label: "function(ctx) { return ctx.raw.x + ', ' + ctx.raw.y; }"
            }
          }
        },
        scales: %{
          x: %{title: %{display: true, text: data.x_label}},
          y: %{title: %{display: true, text: data.y_label}}
        }
      }
    }
  end

  defp compute_correlation(points) when length(points) < 3, do: nil

  defp compute_correlation(points) do
    xs = Enum.map(points, & &1.x)
    ys = Enum.map(points, & &1.y)
    n = length(points)

    mean_x = Enum.sum(xs) / n
    mean_y = Enum.sum(ys) / n

    numerator =
      Enum.zip(xs, ys)
      |> Enum.reduce(0, fn {x, y}, acc -> acc + (x - mean_x) * (y - mean_y) end)

    denom_x = xs |> Enum.reduce(0, fn x, acc -> acc + (x - mean_x) ** 2 end) |> :math.sqrt()
    denom_y = ys |> Enum.reduce(0, fn y, acc -> acc + (y - mean_y) ** 2 end) |> :math.sqrt()

    denominator = denom_x * denom_y

    if denominator == 0, do: 0.0, else: Float.round(numerator / denominator, 4)
  end

  defp color_for_category(nil), do: "rgba(99, 102, 241, 0.6)"
  defp color_for_category(:high), do: "rgba(239, 68, 68, 0.6)"
  defp color_for_category(:medium), do: "rgba(245, 158, 11, 0.6)"
  defp color_for_category(:low), do: "rgba(34, 197, 94, 0.6)"
  defp color_for_category(_), do: "rgba(156, 163, 175, 0.6)"
end
```

## Architecture & Implementation

Scatter plot rendering follows the platform's standard LiveView + Chart.js architecture. The server prepares data and serializes it as JSON, which is pushed to the client via LiveView hooks. The Chart.js library renders the scatter plot in a canvas element with interactive tooltips, zoom, and pan capabilities.

The architecture separates data preparation (server-side Elixir) from rendering (client-side JavaScript). This ensures that large datasets are aggregated and sampled server-side before transmission, keeping the WebSocket payload size manageable and client-side rendering performant.

For very large datasets (over 10,000 points), the platform applies density-based sampling that preserves the visual distribution shape while reducing point count. Outliers are always preserved (they are often the most interesting points), while dense clusters are sampled proportionally.

## Usage in Prismatic Platform

Scatter plots appear across the platform's dashboards for security analytics, performance monitoring, and quality assessment. The Perimeter dashboard uses scatter plots to visualize the relationship between organizational risk scores and compliance levels.

```elixir
defmodule PrismaticWeb.Analytics.ScatterLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    chart_data =
      PrismaticPerimeter.list_assessments()
      |> PrismaticAnalytics.ScatterPlot.prepare(:risk_score, :compliance_score,
        category_field: :industry,
        label_field: :organization_name
      )
      |> PrismaticAnalytics.ScatterPlot.to_chartjs()

    {:ok, assign(socket, :chart_data, Jason.encode!(chart_data))}
  end
end
```

## Cross-References

- [Percentile](/glossary/percentile/) - Statistical distribution visualized alongside scatter plots
- [Precision](/glossary/precision/) - ML metric plotted in precision-recall scatter plots
- [Pivot Table](/glossary/pivot-table/) - Aggregated summary complementing scatter plot detail
- **Seasonality** - Temporal patterns visible in time-based scatter plots
- [Profiling](/glossary/profiling/) - Performance data visualized as latency scatter plots

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
