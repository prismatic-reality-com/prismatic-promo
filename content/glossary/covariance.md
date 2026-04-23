+++
title = "Covariance"
weight = 50
[extra]
description = "A statistical measure of the joint variability of two random variables, indicating whether they tend to increase or decrease together"
category = "data-analysis"
related_terms = ["correlation", "cross-tabulation", "confidence-score", "anomaly-detection", "accuracy"]
complexity_level = "advanced"
platform_integration = "reference"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["covariance", "joint variability", "statistics", "variance", "covariance matrix", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "statistics"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Covariance - Prismatic Platform"
+++

## Definition & Overview

Covariance is a statistical measure that quantifies the degree to which two random variables change together. Positive covariance indicates that when one variable increases, the other tends to increase as well. Negative covariance indicates an inverse relationship -- when one increases, the other tends to decrease. Zero covariance suggests no linear relationship. Mathematically, covariance is the expected value of the product of the deviations of each variable from its respective mean: Cov(X,Y) = E[(X - mu_X)(Y - mu_Y)].

Unlike correlation (which is standardized to [-1, 1]), covariance is unstandardized -- its magnitude depends on the scales of the variables. This makes covariance useful for mathematical computation but less intuitive for interpretation. Correlation is derived from covariance by dividing by the product of the standard deviations: r = Cov(X,Y) / (sigma_X * sigma_Y). The covariance matrix extends this concept to multiple variables simultaneously, with each cell (i,j) containing the covariance between variable i and variable j.

In the Prismatic Platform, covariance calculations underpin the correlation engine's signal analysis capabilities, the Perimeter security rating's multi-dimensional risk assessment, and the OSINT intelligence aggregation pipeline. The covariance matrix is used in principal component analysis (PCA) for dimensionality reduction when analyzing high-dimensional OSINT data, and in portfolio-style risk assessment when combining multiple security rating dimensions.

## Technical Deep Dive

### Covariance Properties

| Property | Formula | Significance |
|----------|---------|-------------|
| **Symmetry** | Cov(X,Y) = Cov(Y,X) | Direction does not matter |
| **Self-covariance** | Cov(X,X) = Var(X) | Diagonal of cov matrix = variances |
| **Linearity** | Cov(aX+b, cY+d) = ac*Cov(X,Y) | Scale-dependent |
| **Independence** | If X,Y independent, Cov = 0 | Zero cov does not imply independence |
| **Variance sum** | Var(X+Y) = Var(X) + Var(Y) + 2Cov(X,Y) | Portfolio risk |

### Covariance Computation

```elixir
defmodule PrismaticAnalytics.CovarianceEngine do
  @moduledoc """
  Computes covariance and covariance matrices for multi-dimensional
  data analysis. Used by the correlation engine, PCA, and portfolio
  risk assessment within the Prismatic Platform.
  """

  @type covariance_matrix :: %{
    variables: [String.t()],
    matrix: [[float()]],
    sample_size: non_neg_integer()
  }

  @spec covariance([number()], [number()]) :: {:ok, float()} | {:error, atom()}
  def covariance(xs, ys) when length(xs) == length(ys) and length(xs) >= 2 do
    n = length(xs)
    mean_x = Enum.sum(xs) / n
    mean_y = Enum.sum(ys) / n

    cov = Enum.zip(xs, ys)
    |> Enum.map(fn {x, y} -> (x - mean_x) * (y - mean_y) end)
    |> Enum.sum()
    |> Kernel./(n - 1)

    {:ok, cov}
  end

  def covariance(_, _), do: {:error, :invalid_input}

  @spec covariance_matrix(%{String.t() => [number()]}) :: {:ok, covariance_matrix()}
  def covariance_matrix(variables) do
    var_names = Map.keys(variables) |> Enum.sort()
    n = var_names |> List.first() |> then(&Map.get(variables, &1)) |> length()

    matrix = Enum.map(var_names, fn var_i ->
      Enum.map(var_names, fn var_j ->
        xs = Map.get(variables, var_i)
        ys = Map.get(variables, var_j)
        case covariance(xs, ys) do
          {:ok, cov} -> Float.round(cov, 6)
          _ -> 0.0
        end
      end)
    end)

    {:ok, %{variables: var_names, matrix: matrix, sample_size: n}}
  end

  @spec portfolio_variance([float()], covariance_matrix()) :: {:ok, float()}
  def portfolio_variance(weights, cov_matrix) do
    n = length(weights)
    matrix = cov_matrix.matrix

    variance = Enum.with_index(weights)
    |> Enum.map(fn {w_i, i} ->
      Enum.with_index(weights)
      |> Enum.map(fn {w_j, j} ->
        w_i * w_j * Enum.at(Enum.at(matrix, i), j)
      end)
      |> Enum.sum()
    end)
    |> Enum.sum()

    {:ok, variance}
  end
end
```

### Application in Security Rating

```elixir
defmodule PrismaticPerimeter.RiskCovarianceAnalyzer do
  @moduledoc """
  Uses covariance analysis to understand risk relationships
  between security rating dimensions. High positive covariance
  between dimensions suggests correlated risk factors.
  """

  @dimensions ~w(network_security application_security dns_health email_security patching)a

  @spec analyze_risk_correlations(String.t()) :: {:ok, map()}
  def analyze_risk_correlations(target) do
    historical_scores = fetch_historical_scores(target, @dimensions)

    variables = @dimensions
    |> Enum.map(fn dim ->
      scores = Enum.map(historical_scores, &Map.get(&1, dim, 0.0))
      {Atom.to_string(dim), scores}
    end)
    |> Map.new()

    {:ok, cov_matrix} = PrismaticAnalytics.CovarianceEngine.covariance_matrix(variables)

    correlated_pairs = find_high_covariance_pairs(cov_matrix, 0.5)

    {:ok, %{
      covariance_matrix: cov_matrix,
      correlated_dimensions: correlated_pairs,
      risk_diversification: calculate_diversification(cov_matrix)
    }}
  end

  defp find_high_covariance_pairs(cov_matrix, threshold) do
    vars = cov_matrix.variables

    for {var_i, i} <- Enum.with_index(vars),
        {var_j, j} <- Enum.with_index(vars),
        i < j,
        cov_val = Enum.at(Enum.at(cov_matrix.matrix, i), j),
        abs(cov_val) > threshold do
      %{dimension_a: var_i, dimension_b: var_j, covariance: cov_val}
    end
  end

  defp calculate_diversification(cov_matrix) do
    n = length(cov_matrix.variables)
    equal_weights = List.duplicate(1.0 / n, n)

    case PrismaticAnalytics.CovarianceEngine.portfolio_variance(equal_weights, cov_matrix) do
      {:ok, portfolio_var} ->
        individual_vars = Enum.with_index(cov_matrix.matrix)
        |> Enum.map(fn {row, i} -> Enum.at(row, i) end)
        |> Enum.sum()
        |> Kernel./(n * n)

        if individual_vars > 0 do
          1.0 - portfolio_var / individual_vars
        else
          0.0
        end

      _ -> 0.0
    end
  end

  defp fetch_historical_scores(_target, _dimensions), do: []
end
```

## Architecture & Implementation

The covariance engine provides the mathematical foundation for several higher-level analytical capabilities in the Prismatic Platform. The correlation engine normalizes covariance into correlation coefficients for human-interpretable analysis. The PCA module uses the covariance matrix to identify principal components for dimensionality reduction. The risk analyzer uses covariance-based portfolio theory to assess diversification of security risk factors.

The implementation uses sample covariance (dividing by n-1 rather than n) to provide unbiased estimates, which is appropriate for the finite sample sizes typical in security assessments and OSINT investigations. For large-scale covariance matrix computation (many variables, many observations), the engine supports incremental online computation using Welford's algorithm, avoiding the need to store all data in memory.

Matrix operations are implemented in pure Elixir for portability, with an optional NIF-based backend using BLAS/LAPACK for performance-critical workloads involving matrices larger than 100x100. The platform's typical use cases (5-20 dimensions) perform efficiently with the pure Elixir implementation.

## Usage in Prismatic Platform

The Perimeter security rating uses covariance analysis to distinguish between organizations with correlated security weaknesses (suggesting systemic issues) and those with independent weaknesses (suggesting targeted gaps). An organization with high positive covariance between network security and application security scores likely has either consistent security practices (both high) or consistent neglect (both low).

The OSINT signal analysis pipeline uses covariance to identify signal sources that move together, which has implications for the NABLA Signal Plurality axiom. Two sources with high positive covariance may share a common upstream data provider, reducing their combined evidential value compared to truly independent sources.

The data analysis Livebooks include interactive covariance computation and visualization, enabling analysts to explore relationships between any combination of numerical variables in the platform's datasets. The covariance matrix visualization uses heatmaps where cell color intensity represents covariance magnitude.

## Cross-References

- [Correlation](@/glossary/correlation.md) - standardized version of covariance
- [Cross-Tabulation](@/glossary/cross-tabulation.md) - categorical data analysis complement
- [Confidence Score](@/glossary/confidence-score.md) - reliability metrics analyzed by covariance
- [Anomaly Detection](@/glossary/anomaly-detection.md) - detecting unusual covariance changes
- [Chart](@/glossary/chart.md) - heatmap visualization of covariance matrices
- **Livebooks**: `livebooks/domains/data_analysis/` - statistical analysis studio
- **Academy**: Statistical methods and data analysis topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
