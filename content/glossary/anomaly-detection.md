+++
title = "Anomaly Detection"
weight = 50
[extra]
description = "Automated identification of patterns, data points, or behaviors that deviate significantly from expected norms, using statistical, machine learning, or rule-based methods"
category = "data-analytics"
related_terms = ["anomaly", "alert", "behavioral-drift", "accuracy", "confidence-score", "correlation", "benchmark", "aggregation"]
tags = ["glossary", "anomaly-detection", "machine-learning", "statistics", "security", "monitoring", "osint", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
difficulty = "advanced"
quality_score = 87
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Anomaly detection systems automatically identify deviations from normal patterns, forming the backbone of security monitoring, quality assurance, and intelligence analysis in the Prismatic Platform"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["anomaly detection", "outlier detection", "statistical analysis", "machine learning", "security monitoring", "drift detection", "time series", "pattern recognition", "threshold detection"]
image = "/images/sections/glossary.png"
image_alt = "Anomaly Detection - Prismatic Platform"
word_count = 1050
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

Anomaly detection is the automated process of identifying data points, events, or patterns that deviate significantly from expected behavior within a system. Unlike simple threshold monitoring, anomaly detection systems learn or model normal behavior and can identify deviations that static thresholds would miss -- including gradual drifts, contextual anomalies, and previously unseen attack patterns. Effective anomaly detection balances sensitivity (catching real anomalies) against specificity (avoiding false alarms).

In the Prismatic Platform, anomaly detection operates across security monitoring (Blue Team drift detection), quality assurance (Quality Floor Guardian), OSINT intelligence (entity behavior analysis), and infrastructure performance (response time analysis).

## Technical Deep Dive

### Detection Methods

| Method | Approach | Strengths | Weaknesses | Prismatic Usage |
|--------|----------|-----------|------------|-----------------|
| **Statistical** | Z-score, IQR, Grubbs test | Simple, interpretable | Assumes distribution | Performance metrics |
| **Time-series** | ARIMA, seasonal decomposition | Handles trends/seasonality | Requires history | Quality score tracking |
| **Rule-based** | Expert-defined conditions | Domain-specific precision | Manual maintenance | Security policy checks |
| **Clustering** | DBSCAN, isolation forest | Finds unknown patterns | Computational cost | OSINT entity analysis |
| **Ensemble** | Multiple methods combined | High accuracy | Complexity | Platform-wide fusion |

### Detection Pipeline

```
Data Stream → Preprocessing → Feature Extraction → Model Evaluation → Scoring → Alerting
                   ↓                                       ↑
            Baseline Update                         Model Retraining
```

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Detection Rate** | % of real anomalies caught | > 95% |
| **False Positive Rate** | % of normal flagged as anomalous | < 5% |
| **Detection Latency** | Time from occurrence to detection | < 60s |
| **Mean Time to Detect** | Average across all anomalies | < 5 min |

## Architecture and Implementation

```elixir
defmodule PrismaticMonitoring.AnomalyDetector do
  @moduledoc """
  Multi-method anomaly detection engine for the Prismatic Platform.
  Combines statistical and rule-based methods with configurable
  sensitivity per monitored metric. Results feed into the alert
  manager via telemetry events.
  """

  use GenServer

  @type detection_config :: %{
          metric: String.t(),
          method: :z_score | :iqr | :rule_based | :ewma,
          sensitivity: float(),
          window_size: pos_integer(),
          min_samples: pos_integer()
        }

  @type detection_result :: %{
          metric: String.t(),
          is_anomaly: boolean(),
          score: float(),
          method: atom(),
          value: number(),
          threshold: number(),
          detected_at: DateTime.t()
        }

  @spec evaluate(String.t(), number()) :: {:ok, detection_result()}
  def evaluate(metric, value) do
    GenServer.call(__MODULE__, {:evaluate, metric, value})
  end

  @impl GenServer
  def init(configs) do
    state = %{
      configs: Map.new(configs, fn c -> {c.metric, c} end),
      history: %{},
      baselines: %{}
    }
    {:ok, state}
  end

  @impl GenServer
  def handle_call({:evaluate, metric, value}, _from, state) do
    config = Map.get(state.configs, metric, default_config(metric))
    history = Map.get(state.history, metric, [])
    updated_history = Enum.take([value | history], config.window_size)

    result = case config.method do
      :z_score -> detect_z_score(value, updated_history, config)
      :iqr -> detect_iqr(value, updated_history, config)
      :ewma -> detect_ewma(value, updated_history, config)
      :rule_based -> detect_rule_based(value, config)
    end

    if result.is_anomaly do
      :telemetry.execute(
        [:prismatic, :anomaly, :detected],
        %{score: result.score},
        %{metric: metric, method: config.method}
      )
    end

    new_state = put_in(state, [:history, metric], updated_history)
    {:reply, {:ok, result}, new_state}
  end

  @spec detect_z_score(number(), [number()], detection_config()) :: detection_result()
  defp detect_z_score(value, history, config) when length(history) >= config.min_samples do
    mean = Enum.sum(history) / length(history)
    variance = Enum.reduce(history, 0.0, fn v, acc -> acc + (v - mean) * (v - mean) end) / length(history)
    stddev = :math.sqrt(variance)
    z_score = if stddev > 0, do: abs(value - mean) / stddev, else: 0.0
    threshold = 3.0 / config.sensitivity

    %{
      metric: config.metric,
      is_anomaly: z_score > threshold,
      score: Float.round(z_score, 4),
      method: :z_score,
      value: value,
      threshold: Float.round(threshold, 4),
      detected_at: DateTime.utc_now()
    }
  end

  defp detect_z_score(value, _history, config) do
    %{metric: config.metric, is_anomaly: false, score: 0.0, method: :z_score,
      value: value, threshold: 0.0, detected_at: DateTime.utc_now()}
  end
end
```

## Usage in Prismatic Platform

- **Blue Team Drift Detection**: `blue-drift-detector` agent uses anomaly detection for behavioral, configuration, dependency, and performance drift
- **Quality Floor Guardian**: Monitors quality scores across 115 apps, detecting anomalous drops
- **Perimeter EASM**: Detects anomalous changes in external attack surface (new services, certificate changes)
- **OSINT Intelligence**: Identifies anomalous entity behavior patterns in DD pipeline data
- **Performance Monitoring**: Detects response time anomalies against rolling P95 baselines
- **Session Lifecycle**: Circuit breaker pattern triggered by anomalous failure rates

## Code Examples

### Streaming Anomaly Detection with EWMA

```elixir
defmodule PrismaticMonitoring.EWMADetector do
  @moduledoc """
  Exponentially Weighted Moving Average anomaly detection.
  Suitable for streaming data with varying baselines.
  """

  @type ewma_state :: %{mean: float(), variance: float(), alpha: float()}

  @spec init_state(float()) :: ewma_state()
  def init_state(alpha \\ 0.1) do
    %{mean: 0.0, variance: 0.0, alpha: alpha}
  end

  @spec update(ewma_state(), number()) :: {ewma_state(), boolean()}
  def update(state, value) do
    new_mean = state.alpha * value + (1 - state.alpha) * state.mean
    diff = value - new_mean
    new_variance = state.alpha * diff * diff + (1 - state.alpha) * state.variance
    stddev = :math.sqrt(new_variance)

    is_anomaly = stddev > 0 and abs(value - new_mean) > 3 * stddev
    new_state = %{state | mean: new_mean, variance: new_variance}

    {new_state, is_anomaly}
  end
end
```

## Best Practices

1. **Start with simple methods**: Z-score and threshold-based detection cover most cases. Add complexity only when simple methods prove insufficient.

2. **Maintain rolling baselines**: Static baselines become stale. Use rolling windows or EWMA to adapt to legitimate changes.

3. **Tune per-metric sensitivity**: Security metrics warrant higher sensitivity than performance metrics. Configure detection thresholds per domain.

4. **Combine multiple methods**: Ensemble detection reduces false positives by requiring agreement across methods.

5. **Track detector performance**: Regularly measure detection rate and false positive rate. Retrain or recalibrate as needed.

6. **Handle cold starts**: New metrics lack history for statistical detection. Use rule-based fallbacks until sufficient data accumulates.

## Related Terms

- [Anomaly](@/glossary/anomaly.md) -- the detected deviation itself
- [Alert](@/glossary/alert.md) -- notification generated upon anomaly detection
- [Behavioral Drift](@/glossary/behavioral-drift.md) -- gradual anomalies detectable through trend analysis
- [Accuracy](@/glossary/accuracy.md) -- detection correctness measurement
- **Confidence Score** -- certainty of anomaly classification
- **Correlation** -- relating anomalies across sources

## See Also

- [Academy Security Livebook](@/academy/_index.md) -- interactive anomaly detection exercises
- [Perimeter EASM](/perimeter/) -- real-time attack surface anomaly monitoring
- [Quality Gates](@/glossary/quality-gates.md) -- quality anomaly enforcement

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
