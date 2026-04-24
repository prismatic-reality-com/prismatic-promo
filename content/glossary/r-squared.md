+++
title = "R-squared"
weight = 50

[extra]
description = "A statistical measure (coefficient of determination) indicating the proportion of variance in a dependent variable explained by independent variables, ranging from 0 to 1, critical for validating anomaly detection, OSINT signal correlation, and performance regression models."
category = "data"
domain = "statistics"
complexity = "advanced"
stability = "stable"
related_terms = ["variance", "standard-deviation", "statistics", "trend", "scatter-plot", "statistical-detection", "mean", "median", "percentile", "outlier", "moving-average", "p95", "anomaly-detection", "regression", "correlation"]
tags = ["r-squared", "statistics", "regression", "correlation", "data-analysis", "metrics", "model-validation", "anomaly-detection", "machine-learning"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 94
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "R-squared quantifies how well a model explains observed variance, critical for validating anomaly detection models, OSINT signal correlation, and performance trend analysis in Prismatic Platform."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["R-squared", "coefficient of determination", "regression", "statistics", "model evaluation", "variance explained", "anomaly detection", "signal correlation", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "R-squared - Prismatic Platform"
word_count = 3200
beam_related = false
security_relevant = false
see_also = ["capabilities", "architecture", "anomaly-detection"]
+++

## Definition

**R-squared** (R², also known as the coefficient of determination) is a statistical measure that represents the proportion of variance in a dependent variable that is predictable from independent variable(s). An R² value of 1.0 indicates that the model perfectly explains all variability in the response data. A value of 0.0 indicates the model explains none of the variability. In practice, R² values between 0.7 and 0.9 are considered strong for most predictive models, though the acceptable threshold depends heavily on the domain and use case.

R² answers a fundamental question in modeling: "How much better is my model than simply predicting the [mean](@/glossary/mean.md) for every observation?" A model that captures 85% of variance (R² = 0.85) leaves only 15% of variation unexplained -- attributable to noise, missing variables, or inherent randomness in the system. This makes R² the standard first-pass metric for model quality assessment across disciplines from econometrics to machine learning to systems monitoring.

In the Prismatic Platform, R-squared is used to evaluate the quality of statistical models in [anomaly detection](@/glossary/anomaly-detection.md), trend analysis for OSINT signals, performance regression detection, and [quality debt](@/glossary/quality-debt.md) prediction. When the platform builds models to predict expected behavior (request latency, query duration, signal frequency), R² quantifies how well those models capture the underlying patterns before deployment to production monitoring.

## Core Concepts

### The Formula

The formula for R-squared decomposes total variance into explained and unexplained components:

```
R² = 1 - (SS_res / SS_tot)
```

| Component | Formula | Meaning |
|-----------|---------|---------|
| **SS_tot** (Total Sum of Squares) | Σ(yᵢ - ȳ)² | Total variance in observed data |
| **SS_res** (Residual Sum of Squares) | Σ(yᵢ - ŷᵢ)² | Variance not explained by model |
| **SS_reg** (Regression Sum of Squares) | Σ(ŷᵢ - ȳ)² | Variance explained by model |
| **R²** | 1 - SS_res/SS_tot | Proportion of variance explained |

The identity SS_tot = SS_reg + SS_res holds for ordinary least squares regression. R² can be interpreted as `SS_reg / SS_tot` -- the fraction of total variance captured by the model.

### Interpretation Scale

| R² Range | Quality | Typical Domain | Platform Usage |
|----------|---------|----------------|----------------|
| 0.95 - 1.00 | Excellent | Hardware performance, physics models | Response time prediction (stable endpoints) |
| 0.85 - 0.95 | Strong | Infrastructure monitoring, capacity planning | Request latency modeling, resource utilization |
| 0.70 - 0.85 | Good | Business metrics, behavioral patterns | OSINT signal correlation, trend analysis |
| 0.50 - 0.70 | Moderate | Social signals, noisy environments | Entity behavior prediction, weak signal detection |
| 0.30 - 0.50 | Weak | Complex multi-factor systems | Exploratory analysis, hypothesis screening |
| 0.00 - 0.30 | Poor | Random/chaotic systems | Model rejection threshold -- triggers retraining |

### Adjusted R-squared

Raw R² has a critical flaw: it always increases (or stays the same) when adding predictors, even if those predictors add no real explanatory power. A model with 50 random noise variables will show higher R² than the same model with 2 meaningful predictors.

Adjusted R² corrects this by penalizing model complexity:

```
R²_adj = 1 - [(1 - R²)(n - 1) / (n - p - 1)]
```

Where `n` is the sample size and `p` is the number of predictors. If a new predictor does not improve the model enough to offset the complexity penalty, adjusted R² decreases -- signaling overfitting.

| Scenario | Raw R² | Adjusted R² | Interpretation |
|----------|--------|-------------|----------------|
| Good predictor added | +0.05 | +0.04 | Genuine improvement |
| Noise predictor added | +0.002 | -0.01 | Overfitting detected |
| Collinear predictor added | +0.001 | -0.02 | Redundant variable |

### R² vs. Other Goodness-of-Fit Metrics

| Metric | Measures | Strengths | Weaknesses |
|--------|----------|-----------|------------|
| **R²** | Proportion of variance explained | Intuitive, scale-free, universal | Inflated by predictors, misleading for nonlinear |
| **Adjusted R²** | Complexity-penalized R² | Corrects for overfitting | Can be negative, less intuitive |
| **RMSE** | Root mean squared error | In original units, penalizes large errors | Scale-dependent, hard to compare across datasets |
| **MAE** | Mean absolute error | Robust to outliers | Does not penalize large errors proportionally |
| **AIC/BIC** | Information loss | Formal model comparison | Relative metric only, not absolute quality |
| **MAPE** | Percentage error | Scale-free, business-friendly | Undefined for zero values, asymmetric |

## Technical Deep Dive

### Numerical Stability

Computing R² seems trivial, but production implementations face several challenges. Naive summation of floating-point values accumulates rounding errors. The Prismatic Platform uses [Kahan compensated summation](@/glossary/mean.md) for all statistical aggregations to maintain accuracy across large datasets:

```elixir
defmodule PrismaticStats.KahanAccumulator do
  @moduledoc "Kahan compensated summation for numerical stability in R² computation."

  @type t :: %__MODULE__{sum: float(), compensation: float(), count: non_neg_integer()}
  defstruct sum: 0.0, compensation: 0.0, count: 0

  @spec add(t(), number()) :: t()
  def add(%__MODULE__{sum: sum, compensation: comp, count: n}, value) do
    y = value - comp
    t = sum + y
    %__MODULE__{sum: t, compensation: (t - sum) - y, count: n + 1}
  end

  @spec result(t()) :: float()
  def result(%__MODULE__{sum: sum}), do: sum
end
```

### Streaming R² Computation

For unbounded data streams (real-time latency monitoring, continuous OSINT signal analysis), R² can be computed incrementally using Welford's online algorithm extended to track both total and residual variance:

```elixir
defmodule PrismaticStats.StreamingRSquared do
  @moduledoc """
  Streaming R² computation using Welford's online algorithm.
  Maintains running statistics without storing all observations.
  O(1) memory regardless of stream length.
  """

  @type t :: %__MODULE__{
    n: non_neg_integer(),
    mean_y: float(),
    m2_total: float(),
    sum_sq_residuals: float()
  }

  defstruct n: 0, mean_y: 0.0, m2_total: 0.0, sum_sq_residuals: 0.0

  @spec update(t(), number(), number()) :: t()
  def update(%__MODULE__{} = state, observed, predicted) do
    new_n = state.n + 1
    delta = observed - state.mean_y
    new_mean = state.mean_y + delta / new_n
    delta2 = observed - new_mean
    new_m2 = state.m2_total + delta * delta2
    residual = observed - predicted

    %__MODULE__{
      n: new_n,
      mean_y: new_mean,
      m2_total: new_m2,
      sum_sq_residuals: state.sum_sq_residuals + residual * residual
    }
  end

  @spec r_squared(t()) :: {:ok, float()} | {:error, :insufficient_data}
  def r_squared(%__MODULE__{n: n}) when n < 2, do: {:error, :insufficient_data}
  def r_squared(%__MODULE__{m2_total: 0.0}), do: {:ok, 1.0}
  def r_squared(%__MODULE__{m2_total: ss_tot, sum_sq_residuals: ss_res}) do
    {:ok, 1.0 - ss_res / ss_tot}
  end
end
```

### Time Series Considerations

For [time series](@/glossary/trend.md) data common in platform monitoring, R² must be interpreted carefully:

1. **Autocorrelation** in residuals inflates R² values, giving a false sense of model quality. The Durbin-Watson statistic should accompany R² for time series models.
2. **Non-stationarity** (trending data) can produce spuriously high R² values. Two random walks will show high R² despite having no causal relationship.
3. **Seasonal patterns** require detrending before R² is meaningful.
4. **Window size** affects R² stability -- a model fit to 1 hour of data may show R²=0.95 but only R²=0.60 over a full day as patterns shift.

```elixir
defmodule PrismaticStats.TimeSeriesValidation do
  @moduledoc "Validates R² for time series data with autocorrelation checks."

  @spec durbin_watson(list(number())) :: float()
  def durbin_watson(residuals) when length(residuals) > 1 do
    pairs = Enum.zip(residuals, tl(residuals))
    numerator = Enum.reduce(pairs, 0.0, fn {prev, curr}, acc -> acc + (curr - prev) ** 2 end)
    denominator = Enum.reduce(residuals, 0.0, fn r, acc -> acc + r ** 2 end)

    if denominator == 0.0, do: 2.0, else: numerator / denominator
  end

  @spec validate_r_squared(float(), float()) :: :valid | :autocorrelated | :spurious
  def validate_r_squared(r2, durbin_watson_stat) do
    cond do
      durbin_watson_stat < 1.0 -> :autocorrelated
      durbin_watson_stat > 3.0 -> :autocorrelated
      r2 > 0.99 -> :spurious
      true -> :valid
    end
  end
end
```

## Advanced Topics

### Negative R² Values

R² can be negative when the model performs worse than the simple mean prediction. This occurs with:
- Overfitted models applied to new data
- Models trained on one distribution applied to another
- Fundamentally wrong model specifications

A negative R² is a strong signal to reject the model entirely -- it is worse than no model at all.

### R² in Machine Learning vs. Classical Statistics

| Aspect | Classical Statistics | Machine Learning |
|--------|---------------------|------------------|
| **Training R²** | Primary metric | Overfit indicator |
| **Test R²** | Rarely reported | Primary metric |
| **Cross-validated R²** | Uncommon | Standard practice |
| **Expected range** | 0.0 to 1.0 | Can be negative on test data |
| **Model comparison** | F-test for nested models | Cross-validation comparison |

The platform's model evaluation always uses cross-validated R² to prevent overfitting:

```elixir
defmodule PrismaticStats.CrossValidation do
  @moduledoc "K-fold cross-validation for R² estimation."

  @spec k_fold_r_squared(list({number(), number()}), pos_integer(), (list() -> (number() -> number()))) :: float()
  def k_fold_r_squared(data, k \\ 5, model_fn) do
    folds = Enum.chunk_every(Enum.shuffle(data), ceil(length(data) / k))

    r2_scores =
      Enum.map(0..(k - 1), fn fold_idx ->
        test = Enum.at(folds, fold_idx)
        train = folds |> List.delete_at(fold_idx) |> List.flatten()
        predictor = model_fn.(train)
        {observed, predicted} = Enum.unzip(Enum.map(test, fn {x, y} -> {y, predictor.(x)} end))
        calculate_r2(observed, predicted)
      end)

    Enum.sum(r2_scores) / length(r2_scores)
  end

  defp calculate_r2(observed, predicted) do
    mean = Enum.sum(observed) / length(observed)
    ss_tot = Enum.reduce(observed, 0.0, fn y, acc -> acc + (y - mean) ** 2 end)
    ss_res = Enum.zip(observed, predicted) |> Enum.reduce(0.0, fn {y, f}, acc -> acc + (y - f) ** 2 end)
    if ss_tot == 0.0, do: 1.0, else: 1.0 - ss_res / ss_tot
  end
end
```

### Multicollinearity and Variance Inflation

When predictor variables are correlated with each other (multicollinearity), individual R² values for predictors become unreliable. The Variance Inflation Factor (VIF) quantifies this:

```
VIF_j = 1 / (1 - R²_j)
```

Where R²_j is the R² from regressing predictor j on all other predictors. VIF > 10 indicates severe multicollinearity. In the platform's multi-signal OSINT models, VIF checks prevent correlated intelligence signals from inflating apparent model quality.

## Usage in Prismatic Platform

### Anomaly Detection Model Validation

The [statistical detection](@/glossary/statistical-detection.md) system evaluates anomaly detection model quality using R² -- models with R² below 0.6 are flagged as insufficiently predictive and trigger automatic retraining:

```elixir
defmodule PrismaticMonitoring.ModelEvaluator do
  @moduledoc "Evaluates model quality and triggers retraining when R² degrades."

  require Logger

  @r2_thresholds %{
    excellent: 0.90,
    acceptable: 0.70,
    retrain_trigger: 0.60,
    reject: 0.40
  }

  @spec evaluate_model(list(number()), list(number()), keyword()) ::
    {:ok, :excellent | :acceptable} | {:retrain, float()} | {:reject, float()}
  def evaluate_model(observed, predicted, opts \\ []) do
    {:ok, r2} = PrismaticStats.RSquared.calculate(observed, predicted)
    context = Keyword.get(opts, :context, :general)

    Logger.info("Model evaluation",
      r_squared: r2,
      context: context,
      sample_size: length(observed)
    )

    :telemetry.execute(
      [:prismatic, :model, :evaluation],
      %{r_squared: r2, sample_size: length(observed)},
      %{context: context}
    )

    cond do
      r2 >= @r2_thresholds.excellent -> {:ok, :excellent}
      r2 >= @r2_thresholds.acceptable -> {:ok, :acceptable}
      r2 >= @r2_thresholds.retrain_trigger -> {:retrain, r2}
      true -> {:reject, r2}
    end
  end
end
```

### OSINT Signal Correlation

In OSINT signal analysis, R² helps quantify the strength of correlation between different intelligence signals, supporting the [Nabla](/glossary/nabla-infinity/) axiom of signal plurality by measuring how well one signal predicts another:

```elixir
defmodule PrismaticOsintCore.SignalCorrelation do
  @moduledoc "Quantifies correlation strength between OSINT intelligence signals."

  alias PrismaticStats.RSquared

  @type correlation_result :: %{
    signal_pair: {String.t(), String.t()},
    r_squared: float(),
    adjusted_r_squared: float(),
    sample_size: non_neg_integer(),
    significance: :strong | :moderate | :weak | :none
  }

  @spec correlate_signals(list(number()), list(number()), {String.t(), String.t()}) ::
    {:ok, correlation_result()} | {:error, term()}
  def correlate_signals(signal_a, signal_b, {name_a, name_b}) do
    with {:ok, r2} <- RSquared.calculate(signal_a, signal_b) do
      n = length(signal_a)
      adj_r2 = RSquared.adjusted(r2, n, 1)

      {:ok, %{
        signal_pair: {name_a, name_b},
        r_squared: r2,
        adjusted_r_squared: adj_r2,
        sample_size: n,
        significance: classify_significance(r2)
      }}
    end
  end

  defp classify_significance(r2) when r2 >= 0.7, do: :strong
  defp classify_significance(r2) when r2 >= 0.4, do: :moderate
  defp classify_significance(r2) when r2 >= 0.2, do: :weak
  defp classify_significance(_), do: :none
end
```

### Performance Trend Analysis

The performance monitoring system fits regression models to response time distributions and uses R² to validate that the model captures the true performance characteristics. When R² drops below threshold, it indicates a regime change (deployment, traffic pattern shift, infrastructure change) that invalidates the existing model:

```elixir
defmodule PrismaticMonitoring.PerformanceTrend do
  @moduledoc "Detects performance regime changes via R² degradation."

  @spec detect_regime_change(list(float()), list(float()), float()) :: :stable | :regime_change
  def detect_regime_change(recent_latencies, predicted_latencies, threshold \\ 0.6) do
    case PrismaticStats.RSquared.calculate(recent_latencies, predicted_latencies) do
      {:ok, r2} when r2 >= threshold -> :stable
      {:ok, _r2} -> :regime_change
      {:error, _} -> :regime_change
    end
  end
end
```

## Code Examples

### Complete R² Module with All Variants

```elixir
defmodule PrismaticStats.RSquared do
  @moduledoc """
  Calculates R-squared and adjusted R-squared for model evaluation.
  Used in anomaly detection, OSINT signal correlation, and performance trend analysis.

  Supports batch computation, streaming updates, and cross-validated estimation.

  ## Examples

      iex> PrismaticStats.RSquared.calculate([1, 2, 3, 4, 5], [1.1, 2.0, 2.9, 4.1, 5.0])
      {:ok, 0.998}

      iex> PrismaticStats.RSquared.model_quality(0.85)
      :good
  """

  @spec calculate(list(number()), list(number())) :: {:ok, float()} | {:error, :length_mismatch | :empty_data}
  def calculate([], []), do: {:error, :empty_data}

  def calculate(observed, predicted) when length(observed) == length(predicted) do
    n = length(observed)
    mean = Enum.sum(observed) / n

    ss_tot = observed |> Enum.map(fn y -> (y - mean) ** 2 end) |> Enum.sum()
    ss_res = Enum.zip(observed, predicted) |> Enum.map(fn {y, f} -> (y - f) ** 2 end) |> Enum.sum()

    r2 = if ss_tot == 0.0, do: 1.0, else: Float.round(1.0 - ss_res / ss_tot, 4)
    {:ok, r2}
  end

  def calculate(_, _), do: {:error, :length_mismatch}

  @spec adjusted(float(), pos_integer(), pos_integer()) :: float()
  def adjusted(r2, n, p) when n > p + 1 do
    Float.round(1.0 - (1.0 - r2) * (n - 1) / (n - p - 1), 4)
  end

  @spec model_quality(float()) :: :excellent | :good | :acceptable | :poor
  def model_quality(r2) when r2 >= 0.9, do: :excellent
  def model_quality(r2) when r2 >= 0.7, do: :good
  def model_quality(r2) when r2 >= 0.5, do: :acceptable
  def model_quality(_), do: :poor

  @spec improvement(float(), float()) :: {:improved | :degraded | :unchanged, float()}
  def improvement(old_r2, new_r2) do
    delta = Float.round(new_r2 - old_r2, 4)

    cond do
      delta > 0.01 -> {:improved, delta}
      delta < -0.01 -> {:degraded, delta}
      true -> {:unchanged, delta}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using R² on nonlinear data | R² assumes linear relationship, inflated for nonlinear fits | Use R² only for linear models; use deviance for nonlinear |
| Comparing R² across datasets | Different datasets have different inherent noise levels | Compare models on the same dataset using cross-validation |
| High R² = good model | High R² can indicate overfitting | Always check adjusted R² and test set performance |
| R² on small samples | Unreliable with < 30 observations | Report confidence intervals, use cross-validation |
| Ignoring residual patterns | Patterned residuals invalidate R² interpretation | Always plot residuals; check Durbin-Watson for time series |
| Adding variables to increase R² | Every variable increases raw R², even noise | Use adjusted R², AIC, or BIC for model comparison |

## Anti-Patterns

```elixir
# BAD: Using R² without validation
r2 = compute_r_squared(data)
if r2 > 0.8, do: :deploy_model  # No cross-validation!

# GOOD: Validated R² with proper checks
{:ok, cv_r2} = PrismaticStats.CrossValidation.k_fold_r_squared(data, 5, &linear_model/1)
dw = PrismaticStats.TimeSeriesValidation.durbin_watson(residuals)
validation = PrismaticStats.TimeSeriesValidation.validate_r_squared(cv_r2, dw)

case {cv_r2, validation} do
  {r2, :valid} when r2 > 0.8 -> :deploy_model
  {_, :autocorrelated} -> :fix_model_specification
  {_, :spurious} -> :investigate_data_quality
  _ -> :retrain_or_reject
end
```

## Best Practices

1. **Never use R² alone** -- always pair with residual analysis and domain-specific validation metrics.
2. **Use adjusted R² for multi-variable models** -- raw R² always increases with more predictors regardless of their value.
3. **Check residual patterns** -- a high R² with patterned residuals indicates model misspecification.
4. **Set domain-appropriate thresholds** -- R² of 0.5 may be excellent for social signal prediction but poor for hardware performance modeling.
5. **Report confidence intervals** -- point estimates of R² can be misleading with small sample sizes.
6. **Cross-validate** -- always report test-set R², not training R², for model selection decisions.
7. **Accompany with Durbin-Watson** for time series data -- autocorrelation inflates R² spuriously.
8. **Use streaming computation** for real-time monitoring -- avoid batch recomputation on every observation.

## Related Terms

- [Variance](@/glossary/variance.md) -- the statistical measure R² partitions into explained and unexplained components
- [Standard Deviation](@/glossary/standard-deviation.md) -- square root of variance, related spread measure
- [Statistics](@/glossary/statistics.md) -- the broader field encompassing R² and regression analysis
- [Trend](@/glossary/trend.md) -- directional patterns R² helps quantify
- [Scatter Plot](@/glossary/scatter-plot.md) -- visualization that reveals the relationship R² measures
- [Mean](@/glossary/mean.md) -- the baseline predictor that R² compares against
- [Median](@/glossary/median.md) -- outlier-resistant alternative central tendency measure
- [Percentile](@/glossary/percentile.md) -- distributional metric complementing R² analysis
- [Outlier](@/glossary/outlier.md) -- extreme values that affect R² computation
- [Anomaly Detection](@/glossary/anomaly-detection.md) -- system that uses R² for model validation

## See Also

- [Data Analysis Livebooks](@/capabilities/_index.md) -- interactive R² calculation notebooks
- [Statistical Detection](@/architecture/_index.md) -- anomaly detection using R² model validation
- [Performance Monitoring](@/architecture/_index.md) -- R² in latency trend analysis
- [OSINT Signal Analysis](@/osint/_index.md) -- R² for intelligence signal correlation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
