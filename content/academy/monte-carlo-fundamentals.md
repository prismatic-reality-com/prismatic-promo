+++
title = "Monte Carlo Fundamentals - Probabilistic Analysis and Risk Assessment"
description = "Master Monte Carlo simulation techniques for data science, risk assessment, and system reliability analysis using PrismaticCore.MonteCarlo"
weight = 100
date = 2026-02-23
updated = 2026-02-23

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "45 min"
difficulty = "intermediate"
prerequisites = ["Basic Probability Theory", "Elixir Programming", "Statistical Concepts"]
learning_outcomes = [
  "Understand Monte Carlo simulation principles and applications",
  "Implement drift detection using Population Stability Index",
  "Perform financial risk assessment with VaR/CVaR calculations",
  "Design A/B testing with statistical power analysis",
  "Apply bootstrap methods for confidence interval estimation"
]
technologies = ["PrismaticCore.MonteCarlo", "Elixir", "Statistical Analysis", "Risk Assessment"]
course_type = "hands-on-tutorial"
estimated_completion = "3-4 hours"
certification_eligible = true
related_courses = ["probabilistic-algorithms", "data-drift-detection", "financial-risk-modeling"]
+++

# Monte Carlo Fundamentals - Probabilistic Analysis and Risk Assessment

**Harness the power of probabilistic simulation for data-driven decision making**

## Course Overview

This comprehensive tutorial teaches you to use Monte Carlo simulation for real-world applications including **drift detection**, **risk assessment**, **system reliability analysis**, and **model validation**. You'll master `PrismaticCore.MonteCarlo` through hands-on examples and practical exercises.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   MONTE CARLO LEARNING JOURNEY                     │
│                                                                     │
│   Theory          Hands-On         Real-World      Advanced        │
│   ┌─────────────┐ ┌─────────────┐   ┌─────────────┐ ┌─────────────┐ │
│   │ • Sampling  │ │ • Code Labs │   │ • Drift     │ │ • Portfolio │ │
│   │ • Distrib.  │─▶│ • Examples  │──▶│   Detection │▶│   Risk      │ │
│   │ • Central   │ │ • Exercises │   │ • A/B Tests │ │ • Reliability│ │
│   │   Limit     │ │             │   │ • Validation│ │ • Bootstrap │ │
│   └─────────────┘ └─────────────┘   └─────────────┘ └─────────────┘ │
│                                                                     │
│   Foundation       Skills           Application     Mastery         │
└─────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

**Required Knowledge**:
- **Probability Theory**: Basic understanding of distributions, expectation, variance
- **Statistics**: Hypothesis testing, confidence intervals, sampling theory
- **Elixir Programming**: Functions, pattern matching, GenServer basics
- **Mathematical Notation**: Comfortable with Greek letters (μ, σ, λ, etc.)

**Recommended Background**:
- Data science or quantitative analysis experience
- Financial modeling or risk management knowledge
- Experience with statistical software (R, Python, MATLAB)

## Learning Objectives

By completing this course, you will:

1. **Master Monte Carlo Theory**
   - Understand Law of Large Numbers and Central Limit Theorem
   - Implement various probability distributions
   - Apply convergence detection techniques

2. **Detect Data Drift**
   - Calculate Population Stability Index (PSI)
   - Perform Kolmogorov-Smirnov tests
   - Monitor ML model performance in production

3. **Assess Financial Risk**
   - Compute Value-at-Risk (VaR) and Expected Shortfall
   - Design stress testing scenarios
   - Model correlated market factors

4. **Analyze System Reliability**
   - Predict SLA compliance rates
   - Model multiple failure modes
   - Optimize maintenance schedules

5. **Validate Models**
   - Bootstrap confidence intervals
   - Statistical power analysis for A/B testing
   - Cross-validation with uncertainty quantification

## Module 1: Monte Carlo Foundations

### 1.1 Theory and Mathematical Background

Monte Carlo methods use repeated random sampling to solve problems that might be deterministic in principle. Named after the Monte Carlo Casino in Monaco, these methods are particularly useful for:

- **High-dimensional integration**
- **Optimization problems with many local optima**
- **Risk assessment under uncertainty**
- **System simulation with stochastic components**

**Key Insight**: As sample size increases, sample statistics converge to population parameters (Law of Large Numbers).

### 1.2 Hands-On Lab: Basic Sampling

**Objective**: Implement sampling from different distributions and verify convergence.

```elixir
# Start IEx in the project root
# iex -S mix

alias PrismaticCore.MonteCarlo

# Lab 1.1: Verify Law of Large Numbers
defmodule Lab1 do
  def verify_convergence(distribution, true_mean, sample_sizes \\ [100, 1000, 10000, 100000]) do
    Enum.map(sample_sizes, fn n ->
      samples = MonteCarlo.sample_n(distribution, n, mean: true_mean, std: 2.0)
      sample_mean = Enum.sum(samples) / n
      error = abs(sample_mean - true_mean)

      %{
        n: n,
        sample_mean: sample_mean,
        true_mean: true_mean,
        error: error,
        relative_error: error / abs(true_mean)
      }
    end)
  end
end

# Test convergence for normal distribution
results = Lab1.verify_convergence(:normal, 100.0)
IO.inspect(results)

# Expected output: error decreases as n increases
# %{n: 100, sample_mean: 99.87, error: 0.13, relative_error: 0.0013}
# %{n: 1000, sample_mean: 100.02, error: 0.02, relative_error: 0.0002}
# ...
```

**Exercise 1.1**: Repeat the experiment with different distributions and parameters. Observe how convergence rate depends on the underlying variance.

### 1.3 Distribution Zoo

`PrismaticCore.MonteCarlo` supports multiple probability distributions:

```elixir
# Continuous distributions
uniform_sample = MonteCarlo.sample(:uniform, min: 0, max: 10)
normal_sample = MonteCarlo.sample(:normal, mean: 0, std: 1)
exponential_sample = MonteCarlo.sample(:exponential, lambda: 0.5)
beta_sample = MonteCarlo.sample(:beta, alpha: 2, beta: 5)

# Discrete distributions
bernoulli_sample = MonteCarlo.sample(:bernoulli, p: 0.3)
poisson_sample = MonteCarlo.sample(:poisson, lambda: 3.0)

# Custom distributions
custom_sampler = fn _opts ->
  # Mixture of two normals
  if :rand.uniform() < 0.7 do
    MonteCarlo.sample(:normal, mean: 0, std: 1)
  else
    MonteCarlo.sample(:normal, mean: 5, std: 0.5)
  end
end

mixture_sample = MonteCarlo.sample({:custom, custom_sampler}, [])
```

**Exercise 1.2**: Implement a custom sampler for a **log-normal distribution** using the relationship: if X ~ Normal(μ, σ²), then exp(X) ~ LogNormal.

## Module 2: Data Drift Detection

**Real-World Problem**: Your ML model was trained on data from Q1 2024. Now in Q4 2024, you notice model performance declining. How do you quantify whether the input data distribution has changed?

### 2.1 Population Stability Index (PSI)

PSI measures how much a variable has shifted over time:

```
PSI = Σ[(Actual% - Expected%) × ln(Actual% / Expected%)]
```

**Interpretation**:
- PSI < 0.1: No significant change
- 0.1 ≤ PSI < 0.2: Moderate change
- PSI ≥ 0.2: Significant change (model retraining recommended)

### 2.2 Hands-On Lab: Drift Detection Implementation

```elixir
defmodule DriftLab do
  alias PrismaticCore.MonteCarlo

  @doc """
  Lab 2.1: Implement PSI-based drift detection with Monte Carlo confidence intervals.
  """
  def detect_drift_with_confidence(baseline_data, current_data, opts \\ []) do
    n_simulations = Keyword.get(opts, :simulations, 5000)
    confidence_level = Keyword.get(opts, :confidence, 0.95)

    # Bootstrap simulation to get PSI distribution under null hypothesis
    psi_simulation = fn _iter, _params ->
      # Under null hypothesis: no drift, so resample from baseline
      simulated_current = Enum.map(1..length(current_data), fn _ ->
        Enum.random(baseline_data)
      end)

      compute_psi(baseline_data, simulated_current)
    end

    {:ok, result} = MonteCarlo.simulate(psi_simulation, %{}, iterations: n_simulations)

    # Observed PSI
    observed_psi = compute_psi(baseline_data, current_data)

    # P-value: what proportion of null simulations exceed observed PSI?
    p_value = Enum.count(result.samples, fn x -> x >= observed_psi end) / n_simulations

    # Critical threshold
    alpha = 1 - confidence_level
    critical_threshold = result.statistics.percentiles[trunc((1-alpha) * 100)]

    %{
      observed_psi: observed_psi,
      p_value: p_value,
      critical_threshold: critical_threshold,
      drift_detected: observed_psi > critical_threshold,
      drift_severity: case observed_psi do
        x when x < 0.1 -> :none
        x when x < 0.2 -> :moderate
        x when x < 0.5 -> :significant
        _ -> :severe
      end,
      recommendation: if observed_psi > 0.2 do
        "Model retraining recommended due to significant data drift"
      else
        "Continue monitoring - no immediate action required"
      end
    }
  end

  defp compute_psi(expected_data, actual_data) do
    # Create bins based on expected data quantiles
    bins = create_quantile_bins(expected_data, 10)

    # Count observations in each bin
    expected_counts = count_in_bins(expected_data, bins)
    actual_counts = count_in_bins(actual_data, bins)

    # Convert to percentages
    n_expected = length(expected_data)
    n_actual = length(actual_data)

    expected_pcts = Enum.map(expected_counts, &(&1 / n_expected))
    actual_pcts = Enum.map(actual_counts, &(&1 / n_actual))

    # PSI calculation with smoothing for zero counts
    expected_pcts
    |> Enum.zip(actual_pcts)
    |> Enum.map(fn {exp, act} ->
      exp_smooth = max(exp, 0.0001)
      act_smooth = max(act, 0.0001)
      (act_smooth - exp_smooth) * :math.log(act_smooth / exp_smooth)
    end)
    |> Enum.sum()
  end

  defp create_quantile_bins(data, n_bins) do
    sorted = Enum.sort(data)
    n = length(sorted)

    for i <- 0..(n_bins-1) do
      start_idx = div(i * n, n_bins)
      end_idx = min(div((i + 1) * n, n_bins), n) - 1

      lower = if i == 0, do: :neg_infinity, else: Enum.at(sorted, start_idx)
      upper = if i == n_bins - 1, do: :pos_infinity, else: Enum.at(sorted, end_idx)

      {lower, upper}
    end
  end

  defp count_in_bins(data, bins) do
    Enum.map(bins, fn {lower, upper} ->
      Enum.count(data, fn x ->
        lower_ok = case lower do
          :neg_infinity -> true
          val -> x >= val
        end

        upper_ok = case upper do
          :pos_infinity -> true
          val -> x <= val
        end

        lower_ok and upper_ok
      end)
    end)
  end
end

# Lab Exercise: Test drift detection
baseline_scores = Enum.map(1..2000, fn _ ->
  MonteCarlo.sample(:normal, mean: 0.75, std: 0.10)
end)

# Simulate drifted data (lower performance)
current_scores = Enum.map(1..1500, fn _ ->
  MonteCarlo.sample(:normal, mean: 0.68, std: 0.12)  # Mean shift + variance increase
end)

drift_analysis = DriftLab.detect_drift_with_confidence(
  baseline_scores,
  current_scores,
  simulations: 10000,
  confidence: 0.95
)

IO.inspect(drift_analysis)
```

**Expected Output**:
```elixir
%{
  observed_psi: 0.234,
  p_value: 0.002,
  critical_threshold: 0.089,
  drift_detected: true,
  drift_severity: :significant,
  recommendation: "Model retraining recommended due to significant data drift"
}
```

### 2.3 Real-World Exercise: Feature Drift Dashboard

**Exercise 2.1**: Create a monitoring system that tracks drift across multiple features:

```elixir
defmodule FeatureDriftMonitor do
  alias DriftLab

  def monitor_feature_drift(baseline_features, current_features) do
    feature_names = Map.keys(baseline_features)

    drift_results = Enum.map(feature_names, fn feature ->
      baseline_values = Map.get(baseline_features, feature)
      current_values = Map.get(current_features, feature)

      drift_result = DriftLab.detect_drift_with_confidence(
        baseline_values,
        current_values
      )

      {feature, drift_result}
    end)
    |> Enum.into(%{})

    # Overall drift assessment
    significant_drifts = drift_results
                        |> Enum.filter(fn {_feat, result} -> result.drift_severity in [:significant, :severe] end)
                        |> length()

    %{
      individual_features: drift_results,
      overall_assessment: %{
        total_features: length(feature_names),
        significant_drifts: significant_drifts,
        drift_rate: significant_drifts / length(feature_names),
        action_required: significant_drifts > length(feature_names) * 0.3
      }
    }
  end
end

# Test with multi-feature dataset
baseline_features = %{
  age: Enum.map(1..5000, fn _ -> MonteCarlo.sample(:normal, mean: 35, std: 10) end),
  income: Enum.map(1..5000, fn _ -> MonteCarlo.sample(:normal, mean: 50000, std: 15000) end),
  credit_score: Enum.map(1..5000, fn _ -> MonteCarlo.sample(:normal, mean: 720, std: 80) end)
}

current_features = %{
  age: Enum.map(1..3000, fn _ -> MonteCarlo.sample(:normal, mean: 37, std: 12) end),  # Slight drift
  income: Enum.map(1..3000, fn _ -> MonteCarlo.sample(:normal, mean: 48000, std: 18000) end),  # Significant drift
  credit_score: Enum.map(1..3000, fn _ -> MonteCarlo.sample(:normal, mean: 715, std: 85) end)  # Minor drift
}

dashboard_result = FeatureDriftMonitor.monitor_feature_drift(baseline_features, current_features)
IO.inspect(dashboard_result.overall_assessment)
```

## Module 3: Financial Risk Assessment

### 3.1 Value-at-Risk (VaR) and Expected Shortfall

**Value-at-Risk (VaR)**: Maximum expected loss over a given time period at a specified confidence level.

**Expected Shortfall (CVaR)**: Expected value of losses that exceed the VaR threshold.

**Example**: "We are 95% confident that our portfolio will not lose more than $1M tomorrow (VaR). If losses do exceed this threshold, we expect them to average $1.5M (CVaR)."

### 3.2 Hands-On Lab: Portfolio Risk Modeling

```elixir
defmodule PortfolioRisk do
  alias PrismaticCore.MonteCarlo

  @doc """
  Lab 3.1: Monte Carlo VaR calculation for multi-asset portfolio
  """
  def calculate_portfolio_var(portfolio, market_params, opts \\ []) do
    confidence_levels = Keyword.get(opts, :confidence_levels, [0.95, 0.99])
    horizon_days = Keyword.get(opts, :horizon_days, 1)
    n_simulations = Keyword.get(opts, :simulations, 100_000)

    portfolio_simulation = fn _iter, _params ->
      # Simulate correlated asset returns
      asset_returns = simulate_correlated_returns(market_params, horizon_days)

      # Portfolio return
      portfolio_return = portfolio.weights
                        |> Enum.zip(asset_returns)
                        |> Enum.map(fn {weight, return} -> weight * return end)
                        |> Enum.sum()

      # Portfolio P&L
      portfolio.value * portfolio_return
    end

    {:ok, result} = MonteCarlo.simulate(
      portfolio_simulation,
      %{},
      iterations: n_simulations,
      parallel: true
    )

    # Calculate VaR and CVaR
    var_results = Enum.map(confidence_levels, fn confidence ->
      alpha = 1 - confidence

      # VaR: percentile of loss distribution (negative values)
      losses = Enum.map(result.samples, fn pnl -> -pnl end)  # Convert to losses
      sorted_losses = Enum.sort(losses)
      var_index = trunc(confidence * length(sorted_losses))
      var = Enum.at(sorted_losses, var_index)

      # CVaR: expected value beyond VaR
      tail_losses = Enum.drop(sorted_losses, var_index)
      cvar = if length(tail_losses) > 0 do
        Enum.sum(tail_losses) / length(tail_losses)
      else
        var
      end

      %{
        confidence: confidence,
        var: var,
        cvar: cvar,
        var_as_percent_of_portfolio: var / portfolio.value,
        tail_expectation: length(tail_losses) / n_simulations
      }
    end)

    %{
      portfolio_value: portfolio.value,
      expected_return: result.statistics.mean,
      portfolio_volatility: result.statistics.std_dev,
      horizon_days: horizon_days,
      var_results: var_results,
      simulation_stats: result.statistics
    }
  end

  defp simulate_correlated_returns(market_params, horizon_days) do
    # Simulate independent normal variables
    n_assets = length(market_params.means)
    independent_normals = for _ <- 1..n_assets do
      MonteCarlo.sample(:normal, mean: 0, std: 1)
    end

    # Apply correlation (simplified Cholesky decomposition)
    correlated_normals = apply_correlation(independent_normals, market_params.correlation_matrix)

    # Scale to daily returns
    horizon_factor = :math.sqrt(horizon_days)
    correlated_normals
    |> Enum.zip(market_params.means)
    |> Enum.zip(market_params.volatilities)
    |> Enum.map(fn {{normal, daily_mean}, daily_vol} ->
      daily_mean * horizon_days + daily_vol * normal * horizon_factor
    end)
  end

  # Simplified correlation application (use proper matrix library in production)
  defp apply_correlation(normals, _correlation_matrix) do
    # Placeholder - implement proper Cholesky decomposition
    normals
  end
end

# Lab Exercise: Calculate VaR for balanced portfolio
portfolio = %{
  value: 10_000_000,  # $10M
  weights: [0.6, 0.3, 0.1]  # 60% stocks, 30% bonds, 10% commodities
}

market_params = %{
  means: [0.0008, 0.0002, 0.0005],        # Daily expected returns
  volatilities: [0.018, 0.006, 0.025],    # Daily volatilities
  correlation_matrix: [
    [1.0, 0.2, 0.1],
    [0.2, 1.0, 0.0],
    [0.1, 0.0, 1.0]
  ]
}

risk_analysis = PortfolioRisk.calculate_portfolio_var(
  portfolio,
  market_params,
  confidence_levels: [0.95, 0.99, 0.999],
  horizon_days: 1,
  simulations: 250_000
)

IO.inspect(risk_analysis.var_results)
```

**Exercise 3.1**: Extend the model to include **jump risk** (sudden market crashes) by adding a compound Poisson process to the return simulation.

### 3.3 Stress Testing with Historical Scenarios

```elixir
defmodule StressTesting do
  alias PrismaticCore.MonteCarlo

  @doc """
  Lab 3.2: Stress test portfolio against historical crisis scenarios
  """
  def stress_test_historical(portfolio, crisis_scenarios, opts \\ []) do
    n_simulations = Keyword.get(opts, :simulations, 50_000)
    scenario_weight = Keyword.get(opts, :scenario_weight, 0.1)

    stress_simulation = fn _iter, _params ->
      if :rand.uniform() < scenario_weight do
        # Historical crisis scenario
        scenario = Enum.random(crisis_scenarios)
        simulate_crisis_impact(portfolio, scenario)
      else
        # Normal market simulation
        simulate_normal_market(portfolio)
      end
    end

    {:ok, result} = MonteCarlo.simulate(stress_simulation, %{}, iterations: n_simulations)

    # Separate normal vs stress results
    n_stress = trunc(n_simulations * scenario_weight)
    stress_samples = Enum.take(result.samples, n_stress)
    normal_samples = Enum.drop(result.samples, n_stress)

    %{
      overall_stats: result.statistics,
      stress_scenario_impact: compute_stats(stress_samples),
      normal_market_stats: compute_stats(normal_samples),
      worst_case_loss: Enum.min(result.samples),
      stress_var_95: percentile(stress_samples, 5),  # 5th percentile of stress scenarios
      probability_extreme_loss: probability_below_threshold(result.samples, -portfolio.value * 0.2)
    }
  end

  defp simulate_crisis_impact(portfolio, scenario) do
    portfolio_return = portfolio.weights
                      |> Enum.zip(scenario.asset_returns)
                      |> Enum.map(fn {weight, return} -> weight * return end)
                      |> Enum.sum()

    portfolio.value * portfolio_return
  end

  defp simulate_normal_market(portfolio) do
    # Simplified normal market simulation
    market_return = MonteCarlo.sample(:normal, mean: 0.0005, std: 0.015)
    portfolio.value * market_return
  end

  defp compute_stats([]), do: %{mean: 0, std_dev: 0, min: 0, max: 0}
  defp compute_stats(samples) do
    n = length(samples)
    mean = Enum.sum(samples) / n
    variance = samples |> Enum.map(&((&1 - mean) ** 2)) |> Enum.sum() |> Kernel./(n)

    %{
      mean: mean,
      std_dev: :math.sqrt(variance),
      min: Enum.min(samples),
      max: Enum.max(samples)
    }
  end

  defp percentile(samples, p) do
    sorted = Enum.sort(samples)
    index = trunc((p / 100) * (length(sorted) - 1))
    Enum.at(sorted, index)
  end

  defp probability_below_threshold(samples, threshold) do
    Enum.count(samples, fn x -> x < threshold end) / length(samples)
  end
end

# Historical crisis scenarios
crisis_scenarios = [
  %{
    name: "2008 Financial Crisis",
    asset_returns: [-0.37, -0.05, -0.30],  # Stocks, bonds, commodities
    probability: 0.4
  },
  %{
    name: "COVID-19 Crash (March 2020)",
    asset_returns: [-0.30, 0.08, -0.25],
    probability: 0.3
  },
  %{
    name: "Dot-com Crash (2000)",
    asset_returns: [-0.50, 0.15, -0.10],
    probability: 0.3
  }
]

stress_results = StressTesting.stress_test_historical(
  portfolio,
  crisis_scenarios,
  simulations: 100_000,
  scenario_weight: 0.15
)

IO.inspect(stress_results)
```

## Module 4: System Reliability Analysis

### 4.1 SLA Compliance Modeling

**Problem**: Your system must maintain 99.9% uptime (SLA). Given historical failure rates, what's the probability of meeting this target over the next year?

### 4.2 Hands-On Lab: Reliability Prediction

```elixir
defmodule ReliabilityAnalysis do
  alias PrismaticCore.MonteCarlo

  @doc """
  Lab 4.1: Monte Carlo reliability analysis for complex systems
  """
  def predict_system_reliability(components, sla_target, opts \\ []) do
    simulation_days = Keyword.get(opts, :days, 365)
    n_simulations = Keyword.get(opts, :simulations, 25_000)

    system_simulation = fn _iter, _params ->
      daily_downtimes = for _day <- 1..simulation_days do
        # Simulate each component's downtime
        component_downtimes = Enum.map(components, fn component ->
          simulate_component_downtime(component)
        end)

        # System downtime depends on architecture
        case opts[:architecture] do
          :parallel -> Enum.max(component_downtimes)  # System fails if any component fails
          :series -> Enum.sum(component_downtimes)    # Independent failures
          _ -> Enum.sum(component_downtimes)
        end
      end

      total_downtime_hours = Enum.sum(daily_downtimes)
      total_hours = simulation_days * 24
      uptime = (total_hours - total_downtime_hours) / total_hours

      %{
        uptime: uptime,
        downtime_hours: total_downtime_hours,
        sla_met: uptime >= sla_target,
        longest_outage: Enum.max(daily_downtimes)
      }
    end

    {:ok, result} = MonteCarlo.simulate(
      system_simulation,
      %{},
      iterations: n_simulations,
      parallel: true
    )

    # Analysis
    uptimes = Enum.map(result.samples, & &1.uptime)
    sla_compliance_rate = Enum.count(result.samples, & &1.sla_met) / n_simulations
    downtimes = Enum.map(result.samples, & &1.downtime_hours)

    %{
      sla_target: sla_target,
      predicted_uptime: %{
        mean: Enum.sum(uptimes) / length(uptimes),
        p50: median(uptimes),
        p95: percentile(uptimes, 95),
        p99: percentile(uptimes, 99)
      },
      sla_compliance_probability: sla_compliance_rate,
      expected_annual_downtime: Enum.sum(downtimes) / length(downtimes),
      risk_level: assess_risk(sla_compliance_rate),
      recommended_improvements: recommend_improvements(components, sla_compliance_rate)
    }
  end

  defp simulate_component_downtime(component) do
    # Hardware failures
    hw_downtime = if MonteCarlo.sample(:poisson, lambda: component.hw_failure_rate) > 0 do
      MonteCarlo.sample(:exponential, lambda: 1/component.mttr_hours)
    else
      0
    end

    # Software failures
    sw_downtime = if MonteCarlo.sample(:poisson, lambda: component.sw_failure_rate) > 0 do
      MonteCarlo.sample(:gamma, shape: 2, scale: component.sw_fix_time/2)
    else
      0
    end

    # Planned maintenance
    maintenance_downtime = if MonteCarlo.sample(:bernoulli, p: component.maintenance_freq) == 1.0 do
      component.maintenance_duration
    else
      0
    end

    hw_downtime + sw_downtime + maintenance_downtime
  end

  defp median(values) do
    sorted = Enum.sort(values)
    n = length(sorted)
    if rem(n, 2) == 0 do
      (Enum.at(sorted, div(n, 2) - 1) + Enum.at(sorted, div(n, 2))) / 2
    else
      Enum.at(sorted, div(n, 2))
    end
  end

  defp percentile(values, p) do
    sorted = Enum.sort(values)
    index = trunc((p / 100) * (length(sorted) - 1))
    Enum.at(sorted, index)
  end

  defp assess_risk(compliance_rate) do
    cond do
      compliance_rate >= 0.95 -> :low
      compliance_rate >= 0.80 -> :moderate
      compliance_rate >= 0.60 -> :high
      true -> :critical
    end
  end

  defp recommend_improvements(components, compliance_rate) do
    recommendations = []

    # Check for high-failure components
    high_failure_components = Enum.filter(components, fn c ->
      c.hw_failure_rate > 0.001 or c.sw_failure_rate > 0.1
    end)

    recommendations = if length(high_failure_components) > 0 do
      ["Improve reliability of: #{Enum.map(high_failure_components, & &1.name) |> Enum.join(", ")}"] ++ recommendations
    else
      recommendations
    end

    # Overall system assessment
    recommendations = if compliance_rate < 0.8 do
      ["CRITICAL: Implement redundancy and failover mechanisms"] ++ recommendations
    else
      recommendations
    end

    recommendations
  end
end

# System components
system_components = [
  %{
    name: "Load Balancer",
    hw_failure_rate: 0.0001,      # Very reliable
    sw_failure_rate: 0.01,        # Occasional software issues
    mttr_hours: 2.0,
    sw_fix_time: 1.0,
    maintenance_freq: 0.004,       # Monthly maintenance
    maintenance_duration: 4.0
  },
  %{
    name: "Database Server",
    hw_failure_rate: 0.0005,      # Higher failure rate
    sw_failure_rate: 0.005,       # Stable software
    mttr_hours: 6.0,              # Longer repair time
    sw_fix_time: 3.0,
    maintenance_freq: 0.007,       # Weekly maintenance
    maintenance_duration: 8.0
  },
  %{
    name: "Application Server",
    hw_failure_rate: 0.0002,
    sw_failure_rate: 0.02,        # More frequent software updates
    mttr_hours: 3.0,
    sw_fix_time: 1.5,
    maintenance_freq: 0.014,       # Bi-weekly deployments
    maintenance_duration: 2.0
  }
]

reliability_analysis = ReliabilityAnalysis.predict_system_reliability(
  system_components,
  0.999,  # 99.9% SLA target
  days: 365,
  simulations: 50_000,
  architecture: :parallel  # System fails if any component fails
)

IO.inspect(reliability_analysis)
```

**Exercise 4.1**: Model a **redundant system** where each component has a backup. How does this change the reliability predictions?

## Module 5: Model Validation and A/B Testing

### 5.1 Bootstrap Confidence Intervals

Bootstrap resampling provides a non-parametric way to estimate the sampling distribution of any statistic.

### 5.2 Hands-On Lab: Model Performance Validation

```elixir
defmodule ModelValidation do
  alias PrismaticCore.MonteCarlo

  @doc """
  Lab 5.1: Bootstrap confidence intervals for model metrics
  """
  def bootstrap_model_metrics(y_true, y_pred, metrics, opts \\ []) do
    n_bootstrap = Keyword.get(opts, :bootstrap_samples, 25_000)
    confidence_levels = Keyword.get(opts, :confidence_levels, [0.90, 0.95, 0.99])

    bootstrap_simulation = fn _iter, _params ->
      n = length(y_true)
      indices = for _ <- 1..n, do: :rand.uniform(n) - 1

      # Bootstrap sample
      y_true_boot = Enum.map(indices, fn i -> Enum.at(y_true, i) end)
      y_pred_boot = Enum.map(indices, fn i -> Enum.at(y_pred, i) end)

      # Compute metrics on bootstrap sample
      Enum.map(metrics, fn metric ->
        {metric, compute_metric(metric, y_true_boot, y_pred_boot)}
      end)
      |> Enum.into(%{})
    end

    {:ok, result} = MonteCarlo.simulate(
      bootstrap_simulation,
      %{},
      iterations: n_bootstrap,
      parallel: true
    )

    # Process results for each metric
    metric_results = Enum.map(metrics, fn metric ->
      metric_values = Enum.map(result.samples, & &1[metric])

      # Point estimate on original data
      point_estimate = compute_metric(metric, y_true, y_pred)

      # Bootstrap statistics
      bootstrap_mean = Enum.sum(metric_values) / length(metric_values)
      bootstrap_std = compute_std(metric_values)

      # Confidence intervals
      confidence_intervals = Enum.map(confidence_levels, fn confidence ->
        alpha = 1 - confidence
        lower_p = (alpha / 2) * 100
        upper_p = (1 - alpha / 2) * 100

        sorted_values = Enum.sort(metric_values)
        n = length(sorted_values)

        lower_idx = max(0, trunc(lower_p / 100 * n))
        upper_idx = min(n - 1, trunc(upper_p / 100 * n))

        lower_bound = Enum.at(sorted_values, lower_idx)
        upper_bound = Enum.at(sorted_values, upper_idx)

        {confidence, {lower_bound, upper_bound}}
      end)
      |> Enum.into(%{})

      {metric, %{
        point_estimate: point_estimate,
        bootstrap_mean: bootstrap_mean,
        bootstrap_std: bootstrap_std,
        bias: bootstrap_mean - point_estimate,
        confidence_intervals: confidence_intervals
      }}
    end)
    |> Enum.into(%{})

    %{
      sample_size: length(y_true),
      bootstrap_samples: n_bootstrap,
      metrics: metric_results
    }
  end

  # Metric implementations
  defp compute_metric(:accuracy, y_true, y_pred) do
    correct = y_true |> Enum.zip(y_pred) |> Enum.count(fn {t, p} -> t == p end)
    correct / length(y_true)
  end

  defp compute_metric(:precision, y_true, y_pred) do
    {tp, fp, _, _} = confusion_matrix_counts(y_true, y_pred)
    if tp + fp == 0, do: 0.0, else: tp / (tp + fp)
  end

  defp compute_metric(:recall, y_true, y_pred) do
    {tp, _, fn_, _} = confusion_matrix_counts(y_true, y_pred)
    if tp + fn_ == 0, do: 0.0, else: tp / (tp + fn_)
  end

  defp compute_metric(:f1_score, y_true, y_pred) do
    precision = compute_metric(:precision, y_true, y_pred)
    recall = compute_metric(:recall, y_true, y_pred)
    if precision + recall == 0, do: 0.0, else: 2 * precision * recall / (precision + recall)
  end

  defp compute_metric(:auc, y_true, y_scores) do
    # Simplified AUC calculation (use proper implementation in production)
    # This is a placeholder - implement proper ROC AUC
    0.75  # Placeholder
  end

  defp confusion_matrix_counts(y_true, y_pred) do
    tp = y_true |> Enum.zip(y_pred) |> Enum.count(fn {1, 1} -> true; _ -> false end)
    fp = y_true |> Enum.zip(y_pred) |> Enum.count(fn {0, 1} -> true; _ -> false end)
    fn_ = y_true |> Enum.zip(y_pred) |> Enum.count(fn {1, 0} -> true; _ -> false end)
    tn = y_true |> Enum.zip(y_pred) |> Enum.count(fn {0, 0} -> true; _ -> false end)
    {tp, fp, fn_, tn}
  end

  defp compute_std(values) do
    mean = Enum.sum(values) / length(values)
    variance = values |> Enum.map(&((&1 - mean) ** 2)) |> Enum.sum() |> Kernel./(length(values))
    :math.sqrt(variance)
  end
end

# Lab Exercise: Model performance with uncertainty
y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0] ++
         List.duplicate(1, 100) ++ List.duplicate(0, 80)  # Larger dataset

y_pred = [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1] ++
         Enum.map(1..180, fn _ -> if MonteCarlo.sample(:bernoulli, p: 0.85) == 1.0, do: 1, else: 0 end)

validation_results = ModelValidation.bootstrap_model_metrics(
  y_true,
  y_pred,
  [:accuracy, :precision, :recall, :f1_score],
  bootstrap_samples: 50_000,
  confidence_levels: [0.90, 0.95, 0.99]
)

IO.inspect(validation_results.metrics[:accuracy])
IO.puts("\n=== Model Performance Summary ===")
Enum.each(validation_results.metrics, fn {metric, stats} ->
  {lower_95, upper_95} = stats.confidence_intervals[0.95]
  IO.puts("#{metric |> to_string() |> String.upcase()}: #{Float.round(stats.point_estimate, 3)} (95% CI: #{Float.round(lower_95, 3)} - #{Float.round(upper_95, 3)})")
end)
```

### 5.3 A/B Test Power Analysis

**Exercise 5.1**: Design an A/B test to detect a 2% improvement in conversion rate:

```elixir
defmodule ABTestDesign do
  alias PrismaticCore.MonteCarlo

  def power_analysis(baseline_rate, effect_size, opts \\ []) do
    alpha = Keyword.get(opts, :alpha, 0.05)
    power_target = Keyword.get(opts, :power, 0.80)
    sample_sizes = Keyword.get(opts, :sample_sizes, [1000, 2500, 5000, 10000])
    n_simulations = Keyword.get(opts, :simulations, 10_000)

    power_curve = Enum.map(sample_sizes, fn n ->
      power_simulation = fn _iter, _params ->
        # Simulate A/B test with given sample size
        group_a = Enum.map(1..n, fn _ ->
          MonteCarlo.sample(:bernoulli, p: baseline_rate)
        end)

        group_b = Enum.map(1..n, fn _ ->
          MonteCarlo.sample(:bernoulli, p: baseline_rate + effect_size)
        end)

        # Two-sample proportion test
        p_value = two_sample_proportion_test(group_a, group_b)
        p_value < alpha
      end

      {:ok, result} = MonteCarlo.simulate(power_simulation, %{}, iterations: n_simulations)

      statistical_power = Enum.count(result.samples, &(&1)) / n_simulations

      %{
        sample_size_per_group: n,
        statistical_power: statistical_power,
        meets_target: statistical_power >= power_target
      }
    end)

    # Find minimum sample size
    min_sample_size = power_curve
                     |> Enum.filter(& &1.meets_target)
                     |> Enum.map(& &1.sample_size_per_group)
                     |> Enum.min(fn -> nil end)

    %{
      baseline_conversion_rate: baseline_rate,
      effect_size: effect_size,
      alpha: alpha,
      power_target: power_target,
      power_curve: power_curve,
      recommended_sample_size_per_group: min_sample_size,
      total_traffic_needed: if(min_sample_size, do: min_sample_size * 2, else: nil)
    }
  end

  # Simplified statistical test (use proper library in production)
  defp two_sample_proportion_test(group_a, group_b) do
    n_a = length(group_a)
    n_b = length(group_b)
    x_a = Enum.sum(group_a)
    x_b = Enum.sum(group_b)

    p_a = x_a / n_a
    p_b = x_b / n_b
    p_pooled = (x_a + x_b) / (n_a + n_b)

    if p_pooled == 0 or p_pooled == 1 do
      1.0  # No difference detectable
    else
      se = :math.sqrt(p_pooled * (1 - p_pooled) * (1/n_a + 1/n_b))
      z = (p_b - p_a) / se

      # Two-tailed p-value approximation
      2 * (1 - normal_cdf(abs(z)))
    end
  end

  defp normal_cdf(z) do
    0.5 * (1 + erf(z / :math.sqrt(2)))
  end

  defp erf(x) do
    # Taylor series approximation for error function
    sign = if x >= 0, do: 1, else: -1
    x = abs(x)

    # Abramowitz and Stegun approximation
    a1 =  0.254829592
    a2 = -0.284496736
    a3 =  1.421413741
    a4 = -1.453152027
    a5 =  1.061405429
    p  =  0.3275911

    t = 1.0 / (1.0 + p * x)
    y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * :math.exp(-x * x)
    sign * y
  end
end

# Design A/B test for conversion rate improvement
ab_test_design = ABTestDesign.power_analysis(
  0.15,   # 15% baseline conversion rate
  0.02,   # 2 percentage point improvement
  alpha: 0.05,
  power: 0.80,
  sample_sizes: [1000, 2000, 3000, 5000, 7500, 10000, 15000],
  simulations: 25_000
)

IO.inspect(ab_test_design.power_curve)
IO.puts("\n=== A/B Test Design Recommendation ===")
IO.puts("Effect size: #{ab_test_design.effect_size * 100}% improvement")
IO.puts("Minimum sample size per group: #{ab_test_design.recommended_sample_size_per_group}")
IO.puts("Total traffic needed: #{ab_test_design.total_traffic_needed}")

# Calculate test duration
daily_traffic = 10_000
if ab_test_design.total_traffic_needed do
  test_days = ceil(ab_test_design.total_traffic_needed / daily_traffic)
  IO.puts("Estimated test duration: #{test_days} days at #{daily_traffic} visitors/day")
end
```

## Final Project: Comprehensive Risk Dashboard

**Project**: Build a Monte Carlo-based risk monitoring system that combines multiple techniques.

```elixir
defmodule RiskDashboard do
  alias PrismaticCore.MonteCarlo
  alias DriftLab
  alias PortfolioRisk
  alias ReliabilityAnalysis
  alias ModelValidation

  @doc """
  Final Project: Comprehensive risk monitoring dashboard
  """
  def generate_risk_report(data_inputs, opts \\ []) do
    report_date = Keyword.get(opts, :date, Date.utc_today())
    confidence_level = Keyword.get(opts, :confidence, 0.95)

    # 1. Data Drift Analysis
    drift_analysis = if data_inputs[:baseline_features] and data_inputs[:current_features] do
      analyze_data_drift(data_inputs.baseline_features, data_inputs.current_features)
    else
      %{status: :no_data}
    end

    # 2. Financial Risk Assessment
    financial_risk = if data_inputs[:portfolio] and data_inputs[:market_params] do
      PortfolioRisk.calculate_portfolio_var(
        data_inputs.portfolio,
        data_inputs.market_params,
        confidence_levels: [confidence_level]
      )
    else
      %{status: :no_data}
    end

    # 3. System Reliability
    system_reliability = if data_inputs[:system_components] do
      ReliabilityAnalysis.predict_system_reliability(
        data_inputs.system_components,
        data_inputs[:sla_target] || 0.99,
        simulations: 25_000
      )
    else
      %{status: :no_data}
    end

    # 4. Model Performance Monitoring
    model_performance = if data_inputs[:y_true] and data_inputs[:y_pred] do
      ModelValidation.bootstrap_model_metrics(
        data_inputs.y_true,
        data_inputs.y_pred,
        [:accuracy, :precision, :recall, :f1_score],
        confidence_levels: [confidence_level]
      )
    else
      %{status: :no_data}
    end

    # 5. Overall Risk Score
    overall_risk = calculate_overall_risk_score(%{
      drift: drift_analysis,
      financial: financial_risk,
      system: system_reliability,
      model: model_performance
    })

    %{
      report_date: report_date,
      confidence_level: confidence_level,
      sections: %{
        data_drift: drift_analysis,
        financial_risk: financial_risk,
        system_reliability: system_reliability,
        model_performance: model_performance
      },
      overall_risk_score: overall_risk.score,
      risk_level: overall_risk.level,
      critical_alerts: overall_risk.alerts,
      recommended_actions: overall_risk.recommendations
    }
  end

  defp analyze_data_drift(baseline_features, current_features) do
    feature_names = Map.keys(baseline_features)

    drift_results = Enum.map(feature_names, fn feature ->
      baseline_values = Map.get(baseline_features, feature)
      current_values = Map.get(current_features, feature)

      drift_result = DriftLab.detect_drift_with_confidence(baseline_values, current_values)
      {feature, drift_result}
    end)
    |> Enum.into(%{})

    significant_drifts = drift_results
                        |> Enum.count(fn {_, result} -> result.drift_severity in [:significant, :severe] end)

    %{
      individual_features: drift_results,
      total_features: length(feature_names),
      significant_drifts: significant_drifts,
      drift_rate: significant_drifts / length(feature_names),
      overall_status: case significant_drifts / length(feature_names) do
        rate when rate < 0.1 -> :healthy
        rate when rate < 0.3 -> :warning
        _ -> :critical
      end
    }
  end

  defp calculate_overall_risk_score(risk_components) do
    alerts = []
    risk_factors = []

    # Data drift risk
    {drift_score, alerts} = case risk_components.drift do
      %{status: :no_data} -> {0, alerts}
      %{overall_status: :healthy} -> {0.1, alerts}
      %{overall_status: :warning} -> {0.3, ["Data drift detected in multiple features"] ++ alerts}
      %{overall_status: :critical} -> {0.6, ["CRITICAL: Significant data drift across features"] ++ alerts}
    end

    # Financial risk
    {financial_score, alerts} = case risk_components.financial do
      %{status: :no_data} -> {0, alerts}
      %{var_results: [%{var_as_percent_of_portfolio: var_pct}]} when var_pct < 0.05 -> {0.2, alerts}
      %{var_results: [%{var_as_percent_of_portfolio: var_pct}]} when var_pct < 0.1 -> {0.4, alerts}
      %{var_results: [%{var_as_percent_of_portfolio: var_pct}]} ->
        {0.7, ["HIGH: Portfolio VaR exceeds 10%"] ++ alerts}
    end

    # System reliability risk
    {system_score, alerts} = case risk_components.system do
      %{status: :no_data} -> {0, alerts}
      %{sla_compliance_probability: prob} when prob >= 0.95 -> {0.1, alerts}
      %{sla_compliance_probability: prob} when prob >= 0.8 -> {0.3, ["SLA at risk"] ++ alerts}
      %{sla_compliance_probability: prob} -> {0.8, ["CRITICAL: SLA failure likely"] ++ alerts}
    end

    # Model performance risk
    {model_score, alerts} = case risk_components.model do
      %{status: :no_data} -> {0, alerts}
      %{metrics: %{accuracy: %{point_estimate: acc}}} when acc >= 0.9 -> {0.1, alerts}
      %{metrics: %{accuracy: %{point_estimate: acc}}} when acc >= 0.8 -> {0.3, alerts}
      %{metrics: %{accuracy: %{point_estimate: acc}}} ->
        {0.5, ["Model performance degraded"] ++ alerts}
    end

    # Composite risk score
    weights = %{drift: 0.3, financial: 0.4, system: 0.2, model: 0.1}
    composite_score = drift_score * weights.drift +
                     financial_score * weights.financial +
                     system_score * weights.system +
                     model_score * weights.model

    risk_level = case composite_score do
      score when score < 0.2 -> :low
      score when score < 0.4 -> :moderate
      score when score < 0.6 -> :high
      _ -> :critical
    end

    recommendations = generate_recommendations(risk_components, risk_level)

    %{
      score: composite_score,
      level: risk_level,
      alerts: alerts,
      recommendations: recommendations
    }
  end

  defp generate_recommendations(risk_components, risk_level) do
    recommendations = []

    recommendations = case risk_components.drift[:overall_status] do
      :critical -> ["Retrain models due to significant data drift"] ++ recommendations
      :warning -> ["Monitor data quality and consider model updates"] ++ recommendations
      _ -> recommendations
    end

    recommendations = if risk_level in [:high, :critical] do
      ["Schedule emergency risk review meeting"] ++ recommendations
    else
      recommendations
    end

    recommendations = case risk_components.system do
      %{risk_level: :critical} -> ["Implement system redundancy immediately"] ++ recommendations
      _ -> recommendations
    end

    recommendations
  end
end

# Example usage with comprehensive data
data_inputs = %{
  # Data drift monitoring
  baseline_features: %{
    age: Enum.map(1..5000, fn _ -> MonteCarlo.sample(:normal, mean: 35, std: 10) end),
    income: Enum.map(1..5000, fn _ -> MonteCarlo.sample(:normal, mean: 50000, std: 15000) end),
    credit_score: Enum.map(1..5000, fn _ -> MonteCarlo.sample(:normal, mean: 720, std: 80) end)
  },
  current_features: %{
    age: Enum.map(1..3000, fn _ -> MonteCarlo.sample(:normal, mean: 37, std: 12) end),
    income: Enum.map(1..3000, fn _ -> MonteCarlo.sample(:normal, mean: 45000, std: 18000) end),
    credit_score: Enum.map(1..3000, fn _ -> MonteCarlo.sample(:normal, mean: 700, std: 90) end)
  },

  # Portfolio risk
  portfolio: %{
    value: 50_000_000,
    weights: [0.7, 0.2, 0.1]
  },
  market_params: %{
    means: [0.0008, 0.0002, 0.0005],
    volatilities: [0.018, 0.006, 0.025],
    correlation_matrix: [[1.0, 0.3, 0.1], [0.3, 1.0, 0.0], [0.1, 0.0, 1.0]]
  },

  # System reliability
  system_components: [
    %{name: "API Gateway", hw_failure_rate: 0.0001, sw_failure_rate: 0.01,
      mttr_hours: 2.0, sw_fix_time: 1.0, maintenance_freq: 0.004, maintenance_duration: 4.0},
    %{name: "Database", hw_failure_rate: 0.0005, sw_failure_rate: 0.005,
      mttr_hours: 6.0, sw_fix_time: 3.0, maintenance_freq: 0.007, maintenance_duration: 8.0}
  ],
  sla_target: 0.995,

  # Model performance
  y_true: List.duplicate(1, 800) ++ List.duplicate(0, 700),
  y_pred: Enum.map(1..1500, fn _ -> if MonteCarlo.sample(:bernoulli, p: 0.82) == 1.0, do: 1, else: 0 end)
}

comprehensive_report = RiskDashboard.generate_risk_report(
  data_inputs,
  date: Date.utc_today(),
  confidence: 0.95
)

IO.puts("=== COMPREHENSIVE RISK DASHBOARD ===")
IO.puts("Report Date: #{comprehensive_report.report_date}")
IO.puts("Overall Risk Level: #{comprehensive_report.risk_level |> to_string() |> String.upcase()}")
IO.puts("Risk Score: #{Float.round(comprehensive_report.overall_risk_score, 3)}")
IO.puts("\nCritical Alerts:")
Enum.each(comprehensive_report.critical_alerts, fn alert ->
  IO.puts("  • #{alert}")
end)

IO.puts("\nRecommended Actions:")
Enum.each(comprehensive_report.recommended_actions, fn action ->
  IO.puts("  • #{action}")
end)
```

## Course Completion and Certification

### Assessment Criteria

To complete this course, you must:

1. **Complete all hands-on labs** (5 modules)
2. **Submit final project** (Risk Dashboard implementation)
3. **Pass theoretical assessment** (80% minimum)
4. **Demonstrate practical application** in a real scenario

### Certification Requirements

- **Code submission**: All lab solutions with documentation
- **Project presentation**: 10-minute demo of your risk dashboard
- **Peer review**: Review 2 other students' final projects
- **Written reflection**: 1-page summary of key learnings and applications

### Next Steps

**Advanced Courses**:
- **Bayesian Monte Carlo Methods** - MCMC, Gibbs sampling, variational inference
- **High-Performance Computing** - GPU acceleration, distributed simulation
- **Financial Engineering** - Advanced derivative pricing, credit risk modeling
- **Machine Learning Uncertainty** - Bayesian neural networks, conformal prediction

**Professional Applications**:
- Risk management in financial services
- Quality assurance in manufacturing
- Reliability engineering in aerospace
- A/B testing in technology companies

## Resources and References

### Academic Sources
- **Rubinstein, R.Y. & Kroese, D.P.** (2016). *Simulation and the Monte Carlo Method*, 3rd Edition
- **Owen, A.B.** (2013). *Monte Carlo theory, methods and examples*
- **Glasserman, P.** (2003). *Monte Carlo Methods in Financial Engineering*

### Prismatic Platform Documentation
- `PrismaticCore.MonteCarlo` [API Documentation](../../apps/prismatic_core/lib/prismatic_core/monte_carlo.ex)
- `PrismaticAlgorithms` [Algorithm Library](../../apps/prismatic_algorithms/README.md)
- [Platform Architecture](../../docs/architecture/README.md)

### Community and Support
- [GitHub Issues](https://github.com/korczis/prismatic-platform/issues)
- [Discussion Forum](https://github.com/korczis/prismatic-platform/discussions)
- [Contributing Guidelines](../../CONTRIBUTING.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)