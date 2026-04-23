+++
title = "Prismatic Monte Carlo"
weight = 27
[extra]
icon = "chart-bar"
color = "orange"
description = "Monte Carlo simulation engine with 25 probability distributions, GenStage streaming, Flow-based parallelism, epistemic calibration, and convergence detection for risk analysis and uncertainty quantification"
category = "Analytics"
files = "130"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
word_count = 5000
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Monte Carlo", "Simulation", "Distributions", "Risk Analysis", "Uncertainty", "GenStage", "Streaming", "Convergence", "Epistemic", "VaR", "CVaR", "Analytics", "Prismatic Platform", "PrismaticMonteCarlo"]
tags = ["apps", "analytics", "prismatic-monte-carlo", "prismatic", "simulation", "risk-analysis", "probability"]
quality_score = 95
see_also = ["technologies", "agents", "glossary", "capabilities"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Monte Carlo - Prismatic Platform"
+++

## Overview

Prismatic Monte Carlo provides a comprehensive probabilistic simulation engine for risk analysis, uncertainty quantification, and evidence-based decision support across the Prismatic Platform. By running thousands to millions of simulations with varying parameters sampled from configurable probability distributions, the engine models outcome distributions that capture the full range of possible results -- enabling the platform to express security assessments and threat probabilities with statistical rigor rather than point estimates.

In security and intelligence contexts, uncertainty is not a weakness but a fundamental property of the problem domain. A [security rating](/glossary/security-rating/) of "B" is far more informative when accompanied by a confidence interval showing the 95th percentile range. Monte Carlo simulation makes this possible by sampling from probability distributions that model real-world variability in vulnerability discovery rates, patch deployment times, attacker capabilities, and defensive effectiveness. The difference between a rating with a narrow confidence interval and one with a wide interval fundamentally changes the risk management response.

The engine operates as part of the platform's [QEVE](/glossary/qeve/) (Quantitative Epistemic Verification Engine) alongside [Prismatic Lean](/apps/prismatic-lean/) for formal proof. Where Lean verifies that properties hold with mathematical certainty, Monte Carlo quantifies the likelihood of outcomes under uncertainty -- complementary approaches that together provide both rigor and practical utility. This duality is central to the platform's [Trinity Gate](/glossary/trinity-gate/) verification architecture.

## Architecture

```
PrismaticMonteCarlo.Application
+-- PrismaticMonteCarlo.UnifiedOrchestrator (GenServer)
|   +-- Model registry and lifecycle management
|   +-- Simulation scheduling and resource allocation
|   +-- Result aggregation and convergence monitoring
|
+-- PrismaticMonteCarlo.Pipeline (GenStage)
|   +-- Pipeline.Producer (distribution sampling)
|   +-- Pipeline.Processor (simulation execution)
|   +-- Pipeline.Consumer (result collection)
|
+-- PrismaticMonteCarlo.Streaming (GenServer)
|   +-- Real-time result streaming via PubSub
|   +-- Live convergence monitoring
|
+-- PrismaticMonteCarlo.NablaIntegration (GenServer)
|   +-- Epistemic calibration pipeline
|   +-- Trinity Gate integration
|   +-- Confidence interval validation
|
+-- PrismaticMonteCarlo.MendelIntegration (GenServer)
    +-- Genetic algorithm parameter optimization
    +-- Evolutionary distribution fitting
```

The simulation engine leverages [Elixir](/glossary/elixir/)'s concurrency model to distribute iterations across all available CPU cores through [OTP](/glossary/otp/) task supervision. The [GenStage](/glossary/genstage/) pipeline provides demand-driven [backpressure](/glossary/backpressure/) management, ensuring that result collection does not fall behind simulation execution. Early convergence detection monitors result stability and terminates simulation runs once statistical significance thresholds are met, avoiding unnecessary computation.

### Data Flow

```
Model Definition --> Parameter Sampling --> Simulation Engine --> Result Analysis
       |                  |                    |                   |
  Distribution       Random Variable      Parallel Execution   Distribution
  Specifications     Generation           Across CPU Cores     Statistics
  Correlation        Seed Management      Early Convergence    Confidence
  Matrices           Stratified Sampling  Detection            Intervals
       |                  |                    |                   |
       +------------------+--------------------+-------------------+
                                |
                    NABLA Epistemic Calibration --> Trinity Gate
                                |
                    Mendel Evolutionary Optimization
```

## Distribution Library (25 Distributions)

The engine implements a comprehensive library of probability distributions, each conforming to the `Distribution` behaviour with callbacks for sampling, PDF/CDF computation, moment calculation, and parameter estimation. This makes distributions interchangeable and composable.

### Continuous Distributions (15)

| Distribution | Module | Parameters | Primary Use Case |
|-------------|--------|-----------|-----------------|
| Normal | `Distributions.Normal` | mean, std_dev | General-purpose symmetric uncertainty |
| Log-Normal | `Distributions.LogNormal` | mu, sigma | Positive-valued outcomes (costs, durations) |
| Beta | `Distributions.Beta` | alpha, beta | Probability and proportion modeling |
| Exponential | `Distributions.Exponential` | lambda | Time-between-events (attack intervals) |
| Gamma | `Distributions.Gamma` | shape, rate | Aggregate wait times, severity distributions |
| Uniform | `Distributions.Uniform` | min, max | Maximum uncertainty within bounds |
| Weibull | `Distributions.Weibull` | shape, scale | Failure time modeling (reliability engineering) |
| Cauchy | `Distributions.Cauchy` | location, scale | Heavy-tailed risk scenarios (extreme events) |
| Pareto | `Distributions.Pareto` | shape, scale | Extreme value modeling (breach costs, power-law) |
| Triangular | `Distributions.Triangular` | min, mode, max | Expert elicitation with mode estimate |
| Student-t | `Distributions.StudentT` | degrees_of_freedom | Small-sample uncertainty (limited data) |
| Gumbel | `Distributions.Gumbel` | location, scale | Extreme value analysis (max/min of samples) |
| Laplace | `Distributions.Laplace` | location, scale | Double-exponential risk modeling |
| Von Mises | `Distributions.VonMises` | mu, kappa | Directional data (attack timing patterns, seasonal) |
| Chi-Squared | `Distributions.ChiSquared` | degrees_of_freedom | Goodness-of-fit testing |

### Discrete Distributions (7)

| Distribution | Module | Parameters | Primary Use Case |
|-------------|--------|-----------|-----------------|
| Poisson | `Distributions.Poisson` | lambda | Event count modeling (attacks per period) |
| Bernoulli | `Distributions.Bernoulli` | probability | Binary outcome simulation (breach/no-breach) |
| Binomial | `Distributions.Binomial` | n, p | Success count from fixed trials (patches applied) |
| Geometric | `Distributions.Geometric` | p | Trials until first success (time to detection) |
| Negative Binomial | `Distributions.NegativeBinomial` | r, p | Trials until r successes |
| Hypergeometric | `Distributions.Hypergeometric` | N, K, n | Sampling without replacement (audit sampling) |
| Multinomial | `Distributions.Multinomial` | n, probabilities | Multi-category classification outcomes |

### Multivariate Distributions (3)

| Distribution | Module | Parameters | Primary Use Case |
|-------------|--------|-----------|-----------------|
| Dirichlet | `Distributions.Dirichlet` | alpha_vector | Probability simplex sampling (category weights) |
| F-Distribution | `Distributions.FDistribution` | d1, d2 | Variance ratio testing (model comparison) |
| Zipf | `Distributions.Zipf` | s, n | Power-law frequency modeling (vulnerability severity) |

## Real-World Application Scenarios

### Security Rating Confidence Intervals

Traditional security ratings produce single scores (e.g., "B" or "780"). Monte Carlo enables expressing the full uncertainty around these assessments:

```elixir
# Model security rating with uncertain inputs
{:ok, result} = PrismaticMonteCarlo.simulate(%{
  model: :security_rating,
  parameters: %{
    vuln_discovery_rate: {:poisson, 3.2},          # vulns discovered per month
    mean_patch_time: {:lognormal, 15, 8},           # days to patch
    attack_surface_size: {:normal, 2400, 300},      # exposed endpoints
    config_drift_rate: {:exponential, 0.05}         # drift events per day
  },
  iterations: 100_000
})

# Result: %{
#   mean: 742, median: 756,
#   p5: 620, p95: 835,
#   grade_distribution: %{A: 0.12, B: 0.58, C: 0.27, D: 0.03}
# }
```

This tells the risk committee: "We rate this entity as B with 95% confidence the true score lies between 620 and 835. There is a 3% probability the true rating is D." Fundamentally different from a bare "B".

### Breach Probability Modeling

```elixir
# Estimate annual breach probability
{:ok, breach_sim} = PrismaticMonteCarlo.simulate(%{
  model: :annual_breach_probability,
  parameters: %{
    attack_attempts: {:poisson, 120},               # per year
    success_rate_per_attempt: {:beta, 2, 98},        # ~2% per attempt
    detection_probability: {:beta, 8, 2},            # ~80% detection rate
    response_time_hours: {:lognormal, 4, 2}          # hours to respond
  },
  iterations: 200_000
})

# Sensitivity analysis: which factor matters most?
{:ok, sensitivity} = PrismaticMonteCarlo.sensitivity(breach_sim)
# => %{attack_attempts: 0.08, success_rate: 0.52,
#       detection_prob: 0.31, response_time: 0.09}
# Insight: success_rate dominates -- invest in prevention over detection
```

### AI Drift Calibration

The Monte Carlo engine directly addresses the "pinata-style threshold tuning" problem. Instead of manually adjusting thresholds, use bootstrap simulation to find statistically optimal operating points:

```elixir
# Bootstrap confidence intervals on FPR/TPR at various thresholds
thresholds = Enum.map(0..100, fn i -> i / 100 end)

results = Enum.map(thresholds, fn t ->
  {:ok, sim} = PrismaticMonteCarlo.simulate(%{
    model: :drift_detection_performance,
    parameters: %{
      threshold: {:fixed, t},
      noise_level: {:normal, 0.0, 0.05},
      sample_size: {:poisson, 200}
    },
    iterations: 10_000
  })
  {t, sim.statistics}
end)

# Find threshold minimizing expected cost
# Cost_FP * FPR + Cost_FN * (1 - TPR)
optimal = find_min_expected_cost(results, cost_fp: 1.0, cost_fn: 5.0)
```

This replaces magic constants with derived values grounded in a formal cost model.

### Investment ROI Under Uncertainty

```elixir
# Model security investment return
{:ok, roi} = PrismaticMonteCarlo.simulate(%{
  model: :security_investment_roi,
  parameters: %{
    investment_cost: {:fixed, 250_000},
    breach_cost_if_unprotected: {:lognormal, 500_000, 200_000},
    risk_reduction_factor: {:beta, 3, 7},           # 30% expected reduction
    breach_probability_baseline: {:beta, 2, 18}      # ~10% baseline
  },
  iterations: 50_000
})

# Value at Risk: worst-case loss at 99% confidence
var_99 = PrismaticMonteCarlo.value_at_risk(roi.samples, 0.99)

# Expected Shortfall: average loss in worst 5% of scenarios
cvar_95 = PrismaticMonteCarlo.expected_shortfall(roi.samples, 0.95)
```

### OSINT Source Reliability

```elixir
# Model reliability of intelligence source combination
{:ok, intel_quality} = PrismaticMonteCarlo.simulate(%{
  model: :source_reliability,
  parameters: %{
    source_accuracy: {:dirichlet, [8, 5, 3, 2]},    # 4 sources, varying quality
    data_freshness: {:exponential, 0.1},              # days since last update
    cross_validation_rate: {:beta, 6, 4}              # 60% cross-validatable
  },
  iterations: 100_000
})
```

## Advanced Features

### Convergence Detection

The engine monitors simulation stability and terminates early when statistical significance is reached:

```elixir
{:ok, result} = PrismaticMonteCarlo.simulate_until_converged(
  simulation_fn,
  params,
  convergence_threshold: 0.01,   # 1% relative change threshold
  min_iterations: 100,
  max_iterations: 100_000,
  check_interval: 1000
)

result.converged                # true/false
result.iterations_to_converge   # Actual iterations used
result.final_std_error          # Standard error at convergence
```

### Flow-Based Parallel Processing

For large-scale simulations, the Flow integration provides optimal multi-core utilization:

```elixir
alias PrismaticMonteCarlo.Flow, as: MCFlow

# 1M iterations across all cores
{:ok, result} = MCFlow.simulate(
  simulation_fn, params,
  iterations: 1_000_000,
  stages: System.schedulers_online(),
  max_demand: 1000
)

# Windowed simulation for periodic statistics
{:ok, windows} = MCFlow.windowed_simulate(
  simulation_fn, params,
  iterations: 100_000,
  window_size: 10_000
)
```

### Streaming Simulations

Real-time result streaming for live dashboards via PubSub:

```elixir
# Start streaming simulation
{:ok, stream_id} = PrismaticMonteCarlo.Streaming.start_stream(
  simulation_fn, params,
  batch_size: 100,
  interval_ms: 50,
  pubsub_topic: "monte_carlo:dashboard"
)

# Subscribe to updates
PrismaticMonteCarlo.Streaming.subscribe(stream_id)

# Receive in process mailbox
receive do
  {:monte_carlo_update, ^stream_id, update} ->
    IO.puts("Running mean: #{update.statistics.mean}")
    IO.puts("Samples processed: #{update.total_samples}")
end
```

### Epistemic Calibration

The NABLA integration ensures simulation results are never treated as ground truth. Calibration checks whether the engine's confidence intervals actually contain the true value at the stated frequency:

```elixir
# Calibrate simulation against observed outcomes
{:ok, calibration} = PrismaticMonteCarlo.calibrate(result, observed_outcomes)
# => %{calibration_score: 0.92, adjustments: [...]}
```

A calibration score of 0.92 means: when the engine says "95% confidence interval", the true value falls within that interval 92% of the time. This meta-level assessment is critical for regulatory-grade systems where overconfident predictions are worse than uncertain ones.

### Risk Metrics

```elixir
# Value at Risk (worst case at confidence level)
var_95 = PrismaticMonteCarlo.value_at_risk(samples, 0.95)
var_99 = PrismaticMonteCarlo.value_at_risk(samples, 0.99)

# Expected Shortfall / Conditional VaR
cvar_95 = PrismaticMonteCarlo.expected_shortfall(samples, 0.95)

# Sharpe Ratio (risk-adjusted returns)
sharpe = PrismaticMonteCarlo.sharpe_ratio(samples, risk_free_rate: 0.02)
```

### Sensitivity Analysis

Identifies which input parameters have the greatest impact on output variability -- crucial for directing investigation and investment:

```elixir
{:ok, results} = PrismaticMonteCarlo.sensitivity_analysis(
  simulation_fn, base_params,
  :volatility,
  [0.1, 0.15, 0.2, 0.25, 0.3],
  iterations: 5_000
)

# Tornado diagram data for visualization
tornado = PrismaticMonteCarlo.AdvancedStatistics.tornado_diagram(results)
```

## Composition with Other Subsystems

Monte Carlo does not operate in isolation. Its power comes from composition with other platform subsystems:

| Subsystem | Integration |
|-----------|-------------|
| **[Prismatic Algorithms](/apps/prismatic-algorithms/)** | Calibration algorithms (Platt, isotonic) consume Monte Carlo confidence intervals |
| **[Prismatic Core Bifurcation](/apps/prismatic-core/)** | Bifurcation analysis uses Monte Carlo to model parameter uncertainty around critical transitions |
| **Quantum Optimizer** | Stochastic objective function evaluation via Monte Carlo sampling |
| **Mycelial Network** | Convergence signals propagated across domains |
| **[Prismatic Nabla](/apps/prismatic-nabla/)** | Epistemic confidence scoring informed by simulation provenance |
| **[Prismatic Lean](/apps/prismatic-lean/)** | Formal proofs complement probabilistic guarantees in QEVE |
| **[Prismatic Perimeter](/apps/prismatic-perimeter/)** | Security rating confidence intervals and breach probability models |

## Configuration

```elixir
config :prismatic_monte_carlo,
  # Simulation defaults
  default_iterations: 100_000,
  max_iterations: 1_000_000,
  convergence_threshold: 0.001,
  convergence_check_interval: 1_000,

  # Parallelism
  max_concurrent_simulations: 4,
  task_pool_size: System.schedulers_online(),

  # Seed management
  seed_strategy: :reproducible,
  default_seed: 42,

  # Streaming
  streaming_enabled: true,
  streaming_interval_ms: 100,

  # NABLA integration
  epistemic_calibration: true,
  trinity_gate_validation: true
```

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Simple simulation (10K) | < 100ms | Single parameter, single core |
| Complex simulation (100K) | 1-5s | Multi-parameter, parallel execution |
| Large-scale simulation (1M) | 10-30s | Full parallelism with streaming |
| Distribution sampling | 1M+ samples/s | Per distribution, single core |
| Sensitivity analysis | < 500ms | Post-simulation computation |
| Convergence detection | < 1ms | Per check interval |
| Epistemic calibration | 50-200ms | Per calibration cycle |
| VaR/CVaR computation | < 10ms | On pre-computed samples |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Signal Plurality | HARD -- simulation results are one signal, not sole decision basis | Results tagged as Monte Carlo signals requiring corroboration |
| Contradiction Preservation | HARD -- bimodal distributions and conflicting scenarios preserved | Multi-modal result distributions surfaced explicitly |
| Provenance Mandatory | HARD -- every simulation traceable to model definition and seed | Full model spec, seed, iteration count recorded per run |
| Unknown Valid | HARD -- uncertainty ranges explicitly reported | Confidence intervals mandatory in all simulation outputs |
| Time Decay | SOFT -- simulation validity decreases as input parameters age | Staleness warnings when input distributions use outdated data |

## Testing

```bash
# Run all Monte Carlo tests
cd apps/prismatic_monte_carlo && mix test

# Run distribution property tests
mix test test/prismatic_monte_carlo/distributions

# Run convergence tests
mix test test/prismatic_monte_carlo/convergence_test.exs

# Run epistemic calibration tests
mix test test/prismatic_monte_carlo/epistemic_calibration_test.exs
```

Testing includes property-based tests for distribution sampling correctness (verifying statistical moments match theoretical values within tolerance), convergence detection accuracy tests, sensitivity analysis validation against known analytical models, and epistemic calibration tests ensuring simulation confidence intervals align with observed outcome frequencies. The distribution library has dedicated benchmark suites measuring sampling throughput per distribution type.

## CLI Interface

```bash
# Run simulations from command line
mix monte_carlo simulate -d normal -m 100 -s 15 -n 10000

# Risk analysis with VaR and CVaR
mix monte_carlo risk --var 0.99 --cvar 0.99 --iterations 50000

# Sensitivity analysis sweep
mix monte_carlo sensitivity --param volatility --range 0.1:0.3:0.05

# Performance benchmark
mix monte_carlo benchmark

# JSON output for integration
mix monte_carlo simulate -d normal -n 10000 -o json
```

## Related Resources

- [Prismatic Core](/apps/prismatic-core/) -- Foundation library with Monte Carlo integration facade
- [Prismatic Algorithms](/apps/prismatic-algorithms/) -- Calibration and drift detection algorithms consuming Monte Carlo outputs
- [Prismatic Nabla](/apps/prismatic-nabla/) -- Epistemic confidence scoring informed by simulation results
- [Prismatic Storage DuckDB](/apps/prismatic-storage-duckdb/) -- Analytical storage for simulation result datasets
- [Trinity Gate](/capabilities/trinity-gate/) -- Monte Carlo provides probabilistic complement to Lean4 formal proofs in QEVE
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Simulation-based confidence intervals enrich intelligence assessments
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Statistical simulation combined with formal verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
