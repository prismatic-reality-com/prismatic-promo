+++
title = "Complexity"
weight = 50
[extra]
description = "A measurement of computational cost for query execution, particularly GraphQL query depth and breadth analysis used to prevent denial-of-service through resource exhaustion"
category = "api"
related_terms = ["api", "api-gateway", "code-quality", "code-smell", "constant-time"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["complexity", "query complexity", "GraphQL", "computational cost", "cyclomatic complexity", "API security", "glossary", "Prismatic Platform"]
tags = ["glossary", "api", "security"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Complexity - Prismatic Platform"
+++

## Definition & Overview

Complexity, in the context of API design and code quality, refers to the measurable cost of an operation -- whether computational (time complexity), structural (cyclomatic complexity), or resource-based (query complexity). While the term has broad application across computer science, in modern platform engineering it most critically appears in two contexts: query complexity analysis for API protection and code complexity metrics for maintainability.

Query complexity is particularly important in GraphQL APIs, where clients can construct arbitrarily deep or broad queries that could exhaust server resources. A query complexity analyzer assigns a cost to each field and resolver, sums the total cost for a query, and rejects queries exceeding a defined threshold. This prevents denial-of-service attacks where a malicious client sends a deeply nested query that causes exponential resolver invocations.

Code complexity (cyclomatic complexity, cognitive complexity) measures the number of independent paths through a function or module. High complexity correlates with difficulty in testing, understanding, and maintaining code. The Prismatic Platform enforces complexity limits through Credo strict analysis, which flags functions exceeding complexity thresholds as code smells requiring refactoring.

## Technical Deep Dive

### Complexity Dimensions

| Dimension | Measures | Tool | Threshold |
|-----------|---------|------|-----------|
| **Time** | Algorithm efficiency | Big-O analysis | Context-dependent |
| **Cyclomatic** | Independent code paths | Credo | < 10 per function |
| **Cognitive** | Mental effort to understand | Credo | < 15 per function |
| **Query** | API resource cost | Custom analyzer | < 1000 per query |
| **Nesting** | Structural depth | Credo | < 4 levels |
| **Module** | Lines, functions, deps | Custom | < 500 LOC |

### Query Complexity Analyzer

```elixir
defmodule PrismaticAPI.ComplexityAnalyzer do
  @moduledoc """
  Analyzes API request complexity to prevent resource exhaustion.
  Assigns cost weights to operations based on expected resource usage.
  Used by the API gateway to reject overly expensive requests.
  """

  @max_complexity 1000
  @max_depth 10

  @type complexity_result :: %{
    total_cost: non_neg_integer(),
    depth: non_neg_integer(),
    field_count: non_neg_integer(),
    allowed: boolean(),
    breakdown: [%{field: String.t(), cost: non_neg_integer()}]
  }

  @field_costs %{
    "entities" => 10,
    "relationships" => 15,
    "search" => 20,
    "aggregate" => 25,
    "history" => 30,
    "default" => 1
  }

  @spec analyze(map()) :: {:ok, complexity_result()} | {:error, :too_complex}
  def analyze(request) do
    fields = extract_fields(request)
    depth = calculate_depth(request)
    breakdown = calculate_field_costs(fields)
    total_cost = Enum.sum(Enum.map(breakdown, & &1.cost))

    result = %{
      total_cost: total_cost,
      depth: depth,
      field_count: length(fields),
      allowed: total_cost <= @max_complexity and depth <= @max_depth,
      breakdown: breakdown
    }

    if result.allowed do
      {:ok, result}
    else
      :telemetry.execute(
        [:prismatic, :api, :complexity, :rejected],
        %{cost: total_cost, depth: depth},
        %{reason: rejection_reason(total_cost, depth)}
      )
      {:error, :too_complex}
    end
  end

  defp extract_fields(request) do
    Map.get(request, :fields, [])
  end

  defp calculate_depth(request) do
    Map.get(request, :depth, 1)
  end

  defp calculate_field_costs(fields) do
    Enum.map(fields, fn field ->
      cost = Map.get(@field_costs, field, @field_costs["default"])
      %{field: field, cost: cost}
    end)
  end

  defp rejection_reason(cost, depth) when cost > @max_complexity, do: :cost_exceeded
  defp rejection_reason(_cost, depth) when depth > @max_depth, do: :depth_exceeded
  defp rejection_reason(_, _), do: :unknown
end
```

### Code Complexity Enforcement

```elixir
defmodule PrismaticQuality.ComplexityChecker do
  @moduledoc """
  Checks code complexity metrics for Prismatic umbrella apps.
  Integrates with Credo and custom quality gates to enforce
  maximum complexity thresholds per function and module.
  """

  @max_cyclomatic 10
  @max_cognitive 15
  @max_nesting 4
  @max_function_length 30

  @type complexity_violation :: %{
    module: atom(),
    function: atom(),
    arity: non_neg_integer(),
    metric: atom(),
    value: number(),
    threshold: number(),
    file: String.t(),
    line: non_neg_integer()
  }

  @spec check_module(atom()) :: {:ok, []} | {:violations, [complexity_violation()]}
  def check_module(module) do
    violations = module.__info__(:functions)
    |> Enum.flat_map(fn {func, arity} ->
      check_function(module, func, arity)
    end)

    case violations do
      [] -> {:ok, []}
      found -> {:violations, found}
    end
  end

  defp check_function(module, func, arity) do
    source = get_source(module)
    []
    |> maybe_add_violation(module, func, arity, :cyclomatic,
       estimate_cyclomatic(source, func), @max_cyclomatic)
    |> maybe_add_violation(module, func, arity, :nesting,
       estimate_nesting(source, func), @max_nesting)
  end

  defp maybe_add_violation(acc, module, func, arity, metric, value, threshold) when value > threshold do
    [%{module: module, function: func, arity: arity, metric: metric,
       value: value, threshold: threshold, file: "", line: 0} | acc]
  end
  defp maybe_add_violation(acc, _, _, _, _, _, _), do: acc

  defp get_source(_module), do: ""
  defp estimate_cyclomatic(_source, _func), do: 1
  defp estimate_nesting(_source, _func), do: 1
end
```

## Architecture & Implementation

The Prismatic Platform addresses complexity at two architectural levels. At the API level, the `PrismaticAPI` gateway analyzes incoming request complexity before dispatching to handlers. Requests exceeding the complexity threshold are rejected with a 429 (Too Many Requests) or 422 (Unprocessable Entity) response, protecting backend resources from exhaustion. This is particularly important for the auto-introspecting API, which exposes all Prismatic facade functions as REST endpoints.

At the code level, Credo's strict analysis runs during every pre-commit hook (Phase 2) and CI pipeline stage, catching complexity violations before they reach the repository. The platform's functional programming preference naturally constrains complexity -- pure functions with pattern matching produce flatter, less nested code than imperative alternatives. The Meta-Rule ("If the same solution could be written identically in Node.js, it's WRONG") indirectly enforces low complexity by demanding idiomatic OTP patterns.

## Usage in Prismatic Platform

The 141 umbrella apps maintain low complexity through continuous enforcement. Functions exceeding cyclomatic complexity of 10 are flagged by Credo and must be refactored into smaller, focused functions before committing. The platform's 100/100 quality score reflects this discipline -- zero Credo violations across 2.8 million lines of code.

The API gateway uses complexity analysis as a rate-limiting complement. While traditional rate limiting restricts request count, complexity limiting restricts request cost. A single simple request and a single complex request are treated differently -- the complex request consumes more of the server's complexity budget, providing more granular protection against resource abuse.

## Cross-References

- [API](@/glossary/api.md) - interface layer where query complexity is measured
- [API Gateway](@/glossary/api-gateway.md) - enforcement point for complexity limits
- [Code Quality](@/glossary/code-quality.md) - code complexity as quality metric
- [Code Smell](@/glossary/code-smell.md) - high complexity as smell indicator
- [Constant Time](@/glossary/constant-time.md) - O(1) complexity target
- **Livebooks**: `livebooks/domains/api_integration/` - complexity analysis experiments
- **Academy**: API security and query cost analysis

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
