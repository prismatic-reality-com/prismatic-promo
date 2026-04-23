+++
title = "Canary Release"
weight = 54
[extra]
category = "architecture"
subcategory = "deployment_strategy"
difficulty = "advanced"
technology_type = "deployment_pattern"
platform_component = "release_management"
risk_mitigation = "progressive_exposure"
monitoring_requirement = "real_time"
rollback_capability = "automatic"
traffic_distribution = "percentage_based"
blast_radius = "limited"
prerequisite_concepts = ["load_balancing", "monitoring", "metrics", "traffic_routing"]
use_cases = ["risk_reduction", "gradual_rollout", "performance_testing", "user_feedback"]
benefits = ["limited_blast_radius", "early_detection", "gradual_validation", "automated_rollback"]
implementation_patterns = ["traffic_splitting", "metric_monitoring", "automated_promotion", "rollback_triggers"]
quality_metrics = ["error_rate", "response_time", "user_satisfaction", "business_metrics"]
integration_points = ["load_balancers", "monitoring_systems", "feature_flags", "deployment_pipelines"]
related_disciplines = ["devops", "site_reliability_engineering", "deployment_automation", "risk_management"]
deployment_paradigm = "progressive"
description = "Gradual rollout strategy routing a small percentage of traffic to a new version first"
related_terms = ["blue-green-deployment", "feature-flag", "continuous-deployment", "load-balancing", "observability", "traffic-splitting", "progressive-delivery", "blast-radius", "rollback-automation"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 942
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Canary", "Release", "Gradual", "glossary", "architecture", "Prismatic Platform", "Based", "Users", "Plug", "Conn"]
tags = ["glossary", "architecture", "canary-release", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Canary Release - Prismatic Platform"
+++

## Definition and Overview

A canary release is a deployment strategy where a new software version is gradually rolled out to a small percentage of users before being deployed to the entire infrastructure. Named after the canary-in-a-coal-mine practice, it allows teams to detect problems by monitoring error rates, latency, and user behavior on the canary population. If metrics remain healthy, traffic is progressively shifted to the new version; if issues appear, the canary is terminated with minimal user impact.

The term derives from the historical practice of coal miners carrying caged canaries into mine shafts. Canaries are more sensitive to toxic gases than humans, so a distressed canary served as an early warning system for dangerous conditions. In software deployment, the canary population serves the same purpose: a small group of users or requests that encounter the new version first, providing early warning of defects before the broader population is affected.

Canary releases represent a middle ground between the all-or-nothing approach of [blue-green deployment](@/glossary/blue-green-deployment.md) and the full commitment of a direct deployment. By exposing only a fraction of traffic to the new version, the blast radius of any defect is mathematically bounded. A canary serving 5% of traffic means that even a catastrophic bug affects at most 5% of users, and rollback is immediate.

## Technical Deep Dive

### Traffic Distribution Models

Canary releases support several traffic distribution strategies:

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Percentage-Based | Fixed percentage of requests routed to canary | General-purpose, simplest to implement |
| User-Based | Specific user cohorts routed to canary | Beta testing, dogfooding |
| Geographic | Requests from specific regions routed to canary | Regional compliance, latency testing |
| Header-Based | Requests with specific headers routed to canary | Internal testing, QA validation |
| Cookie-Based | Users with canary cookies consistently routed | Session consistency requirements |
| Random | Random selection per request | Statistically representative sampling |

### Progressive Rollout Phases

A typical canary release follows a multi-phase progression:

```
Phase 1: 1% traffic  -> Monitor 15 min -> Pass? -> Phase 2
Phase 2: 5% traffic  -> Monitor 30 min -> Pass? -> Phase 3
Phase 3: 25% traffic -> Monitor 1 hour -> Pass? -> Phase 4
Phase 4: 50% traffic -> Monitor 2 hours -> Pass? -> Phase 5
Phase 5: 100% traffic -> Promotion complete
```

At each phase, automated monitoring evaluates key metrics against baseline thresholds. Any degradation triggers automatic rollback to the previous phase or complete termination of the canary.

### Key Metrics for Canary Evaluation

| Metric Category | Specific Metrics | Threshold Example |
|-----------------|-----------------|-------------------|
| **Errors** | 5xx error rate, exception count | < 0.1% increase |
| **Performance** | p95 response time, throughput | < 10% degradation |
| **Business** | conversion rate, user engagement | < 2% decrease |
| **Infrastructure** | CPU, memory, disk usage | < 20% increase |

## Advanced Canary Implementation

### Automated Canary Controller

```elixir
defmodule PrismaticDeploy.CanaryController do
  @moduledoc """
  Manages automated canary deployments with progressive traffic shifting
  and automatic rollback based on metric thresholds.
  """

  use GenStateMachine, callback_mode: :handle_event_function

  defstruct [
    :deployment_id,
    :canary_version,
    :baseline_version,
    :current_traffic_percentage,
    :target_traffic_percentage,
    :start_time,
    :phase_start_time,
    :metrics_collector,
    :rollout_config,
    :metric_thresholds
  ]

  @rollout_phases [
    %{percentage: 1, duration_minutes: 15, name: :initial},
    %{percentage: 5, duration_minutes: 30, name: :small_scale},
    %{percentage: 25, duration_minutes: 60, name: :medium_scale},
    %{percentage: 50, duration_minutes: 120, name: :large_scale},
    %{percentage: 100, duration_minutes: 0, name: :complete}
  ]

  @default_thresholds %{
    error_rate_increase: 0.001,    # 0.1% increase
    latency_p95_increase: 0.1,     # 10% increase
    throughput_decrease: 0.05,     # 5% decrease
    cpu_increase: 0.2,             # 20% increase
    memory_increase: 0.2           # 20% increase
  }

  def start_canary(deployment_config) do
    GenStateMachine.start_link(__MODULE__, deployment_config)
  end

  @impl true
  def init(config) do
    state_data = %__MODULE__{
      deployment_id: config.deployment_id,
      canary_version: config.canary_version,
      baseline_version: config.baseline_version,
      current_traffic_percentage: 0,
      target_traffic_percentage: 0,
      start_time: System.system_time(:millisecond),
      metrics_collector: start_metrics_collector(config),
      rollout_config: Map.get(config, :rollout_phases, @rollout_phases),
      metric_thresholds: Map.merge(@default_thresholds, Map.get(config, :thresholds, %{}))
    }

    {:ok, :initializing, state_data, [{:next_event, :internal, :start_canary}]}
  end

  def handle_event(:internal, :start_canary, :initializing, state_data) do
    # Start with first phase
    first_phase = List.first(state_data.rollout_config)

    Logger.info("Starting canary deployment: #{state_data.deployment_id}")
    Logger.info("Phase 1: #{first_phase.percentage}% traffic for #{first_phase.duration_minutes} minutes")

    case set_traffic_percentage(state_data.deployment_id, first_phase.percentage) do
      :ok ->
        updated_state = %{state_data |
          current_traffic_percentage: first_phase.percentage,
          target_traffic_percentage: first_phase.percentage,
          phase_start_time: System.system_time(:millisecond)
        }

        # Schedule metric evaluation
        timeout = first_phase.duration_minutes * 60 * 1000
        actions = [{:state_timeout, timeout, :evaluate_phase}]

        {:next_state, :monitoring, updated_state, actions}

      {:error, reason} ->
        Logger.error("Failed to start canary: #{inspect(reason)}")
        {:stop, {:error, {:canary_start_failed, reason}}}
    end
  end

  def handle_event(:state_timeout, :evaluate_phase, :monitoring, state_data) do
    case evaluate_canary_metrics(state_data) do
      {:ok, :healthy} ->
        # Proceed to next phase
        proceed_to_next_phase(state_data)

      {:error, :unhealthy, metrics} ->
        # Rollback immediately
        Logger.error("Canary failed health check: #{inspect(metrics)}")
        {:next_state, :rolling_back, state_data, [{:next_event, :internal, :initiate_rollback}]}

      {:ok, :inconclusive} ->
        # Extend monitoring period
        Logger.info("Metrics inconclusive, extending monitoring period")
        actions = [{:state_timeout, 10 * 60 * 1000, :evaluate_phase}]
        {:keep_state, state_data, actions}
    end
  end

  def handle_event(:internal, :initiate_rollback, :rolling_back, state_data) do
    Logger.warning("Initiating canary rollback for deployment #{state_data.deployment_id}")

    case set_traffic_percentage(state_data.deployment_id, 0) do
      :ok ->
        # Notify stakeholders
        notify_rollback(state_data)
        {:stop, :normal}

      {:error, reason} ->
        Logger.error("Failed to rollback canary: #{inspect(reason)}")
        escalate_rollback_failure(state_data, reason)
        {:stop, {:error, {:rollback_failed, reason}}}
    end
  end

  defp proceed_to_next_phase(state_data) do
    current_phase_index = find_current_phase_index(state_data)
    next_phase_index = current_phase_index + 1

    case Enum.at(state_data.rollout_config, next_phase_index) do
      nil ->
        # Canary complete
        Logger.info("Canary deployment completed successfully: #{state_data.deployment_id}")
        notify_success(state_data)
        {:stop, :normal}

      next_phase ->
        Logger.info("Proceeding to phase #{next_phase_index + 1}: #{next_phase.percentage}% traffic")

        case set_traffic_percentage(state_data.deployment_id, next_phase.percentage) do
          :ok ->
            updated_state = %{state_data |
              current_traffic_percentage: next_phase.percentage,
              target_traffic_percentage: next_phase.percentage,
              phase_start_time: System.system_time(:millisecond)
            }

            timeout = next_phase.duration_minutes * 60 * 1000
            actions = [{:state_timeout, timeout, :evaluate_phase}]

            {:keep_state, updated_state, actions}

          {:error, reason} ->
            Logger.error("Failed to proceed to next phase: #{inspect(reason)}")
            {:next_state, :rolling_back, state_data, [{:next_event, :internal, :initiate_rollback}]}
        end
    end
  end

  defp evaluate_canary_metrics(state_data) do
    baseline_metrics = collect_baseline_metrics(state_data)
    canary_metrics = collect_canary_metrics(state_data)

    evaluation_results = [
      evaluate_error_rate(baseline_metrics, canary_metrics, state_data.metric_thresholds),
      evaluate_latency(baseline_metrics, canary_metrics, state_data.metric_thresholds),
      evaluate_throughput(baseline_metrics, canary_metrics, state_data.metric_thresholds),
      evaluate_resource_usage(baseline_metrics, canary_metrics, state_data.metric_thresholds)
    ]

    failed_checks = Enum.filter(evaluation_results, fn
      {:failed, _reason} -> true
      _ -> false
    end)

    cond do
      length(failed_checks) > 0 ->
        {:error, :unhealthy, failed_checks}

      Enum.all?(evaluation_results, fn result -> result == {:passed, :healthy} end) ->
        {:ok, :healthy}

      true ->
        {:ok, :inconclusive}
    end
  end

  defp evaluate_error_rate(baseline, canary, thresholds) do
    baseline_error_rate = calculate_error_rate(baseline)
    canary_error_rate = calculate_error_rate(canary)

    error_rate_increase = canary_error_rate - baseline_error_rate

    if error_rate_increase > thresholds.error_rate_increase do
      {:failed, {:error_rate_too_high, %{
        baseline: baseline_error_rate,
        canary: canary_error_rate,
        increase: error_rate_increase,
        threshold: thresholds.error_rate_increase
      }}}
    else
      {:passed, :healthy}
    end
  end

  defp evaluate_latency(baseline, canary, thresholds) do
    baseline_p95 = get_percentile(baseline.response_times, 95)
    canary_p95 = get_percentile(canary.response_times, 95)

    latency_increase_ratio = (canary_p95 - baseline_p95) / baseline_p95

    if latency_increase_ratio > thresholds.latency_p95_increase do
      {:failed, {:latency_degradation, %{
        baseline_p95: baseline_p95,
        canary_p95: canary_p95,
        increase_ratio: latency_increase_ratio,
        threshold: thresholds.latency_p95_increase
      }}}
    else
      {:passed, :healthy}
    end
  end

  defp set_traffic_percentage(deployment_id, percentage) do
    # Integration with load balancer or traffic routing system
    LoadBalancer.set_canary_traffic(deployment_id, percentage)
  end

  defp collect_baseline_metrics(state_data) do
    MetricsCollector.get_metrics(
      state_data.baseline_version,
      state_data.phase_start_time,
      System.system_time(:millisecond)
    )
  end

  defp collect_canary_metrics(state_data) do
    MetricsCollector.get_metrics(
      state_data.canary_version,
      state_data.phase_start_time,
      System.system_time(:millisecond)
    )
  end

  defp notify_rollback(state_data) do
    message = """
    🔴 CANARY ROLLBACK: #{state_data.deployment_id}

    Canary deployment failed health checks and has been automatically rolled back.

    Version: #{state_data.canary_version}
    Traffic Percentage: #{state_data.current_traffic_percentage}%
    Duration: #{format_duration(System.system_time(:millisecond) - state_data.start_time)}

    Action Required: Investigate failed metrics and address issues before next deployment.
    """

    NotificationService.send_alert(:canary_rollback, message)
  end
end

defmodule PrismaticDeploy.CanaryMetrics do
  @moduledoc """
  Specialized metrics collection and analysis for canary deployments.
  """

  def collect_comprehensive_metrics(version, start_time, end_time) do
    tasks = [
      Task.async(fn -> collect_error_metrics(version, start_time, end_time) end),
      Task.async(fn -> collect_performance_metrics(version, start_time, end_time) end),
      Task.async(fn -> collect_business_metrics(version, start_time, end_time) end),
      Task.async(fn -> collect_infrastructure_metrics(version, start_time, end_time) end)
    ]

    results = Task.await_many(tasks)

    %{
      errors: Enum.at(results, 0),
      performance: Enum.at(results, 1),
      business: Enum.at(results, 2),
      infrastructure: Enum.at(results, 3),
      collection_timestamp: System.system_time(:millisecond)
    }
  end

  defp collect_error_metrics(version, start_time, end_time) do
    # Query error tracking system for version-specific errors
    error_logs = ErrorTracker.query_errors(%{
      version: version,
      start_time: start_time,
      end_time: end_time
    })

    total_requests = RequestCounter.count_requests(%{
      version: version,
      start_time: start_time,
      end_time: end_time
    })

    %{
      total_errors: length(error_logs),
      error_rate: if total_requests > 0, do: length(error_logs) / total_requests, else: 0,
      error_types: Enum.frequencies_by(error_logs, & &1.type),
      critical_errors: Enum.count(error_logs, &(&1.severity == :critical)),
      total_requests: total_requests
    }
  end

  defp collect_performance_metrics(version, start_time, end_time) do
    response_times = PerformanceTracker.get_response_times(%{
      version: version,
      start_time: start_time,
      end_time: end_time
    })

    %{
      response_times: response_times,
      p50_response_time: Statistics.percentile(response_times, 50),
      p95_response_time: Statistics.percentile(response_times, 95),
      p99_response_time: Statistics.percentile(response_times, 99),
      avg_response_time: Enum.sum(response_times) / length(response_times),
      max_response_time: Enum.max(response_times),
      throughput: length(response_times) / ((end_time - start_time) / 1000)
    }
  end

  defp collect_business_metrics(version, start_time, end_time) do
    # Collect business-specific metrics that might indicate user impact
    %{
      conversion_rate: BusinessMetrics.get_conversion_rate(version, start_time, end_time),
      user_engagement: BusinessMetrics.get_engagement_metrics(version, start_time, end_time),
      feature_usage: BusinessMetrics.get_feature_usage(version, start_time, end_time),
      user_satisfaction: BusinessMetrics.get_satisfaction_score(version, start_time, end_time)
    }
  end

  defp collect_infrastructure_metrics(version, start_time, end_time) do
    instances = InfrastructureMonitor.get_instances_for_version(version)

    instance_metrics = Enum.map(instances, fn instance ->
      InfrastructureMonitor.get_instance_metrics(instance.id, start_time, end_time)
    end)

    %{
      avg_cpu_usage: calculate_average_metric(instance_metrics, :cpu_usage),
      avg_memory_usage: calculate_average_metric(instance_metrics, :memory_usage),
      avg_disk_usage: calculate_average_metric(instance_metrics, :disk_usage),
      network_io: calculate_average_metric(instance_metrics, :network_io),
      instance_count: length(instances),
      unhealthy_instances: Enum.count(instance_metrics, &(&1.health_status != :healthy))
    }
  end

  defp calculate_average_metric(metrics, field) when is_list(metrics) do
    values = Enum.map(metrics, &Map.get(&1, field, 0))

    if length(values) > 0 do
      Enum.sum(values) / length(values)
    else
      0
    end
  end
end

defmodule PrismaticDeploy.CanaryStrategies do
  @moduledoc """
  Different canary deployment strategies for various use cases.
  """

  def user_cohort_canary(deployment_config, user_selector_fn) do
    # Route specific user cohorts to canary
    %{
      strategy: :user_cohort,
      selector: user_selector_fn,
      traffic_percentage: 0,  # Not applicable for user-based
      user_percentage: deployment_config.user_percentage,
      duration: deployment_config.duration
    }
  end

  def geographic_canary(deployment_config, target_regions) do
    # Route users from specific geographic regions to canary
    %{
      strategy: :geographic,
      target_regions: target_regions,
      traffic_percentage: 0,  # All traffic from target regions
      duration: deployment_config.duration,
      fallback_regions: deployment_config.fallback_regions
    }
  end

  def feature_flag_canary(deployment_config, feature_flags) do
    # Use feature flags to control canary exposure
    %{
      strategy: :feature_flag,
      feature_flags: feature_flags,
      rollout_percentage: deployment_config.rollout_percentage,
      increment_schedule: deployment_config.increment_schedule
    }
  end

  def dark_launch_canary(deployment_config) do
    # Deploy new version but don't serve traffic initially
    %{
      strategy: :dark_launch,
      shadow_traffic_percentage: deployment_config.shadow_percentage,
      promotion_criteria: deployment_config.promotion_criteria,
      shadow_duration: deployment_config.shadow_duration
    }
  end
end
| Error Rate | HTTP 5xx, exception count, panic rate | < 0.1% above baseline |
| Latency | P50, P95, P99 response times | < 10% above baseline |
| Throughput | Requests per second, successful completions | > 95% of baseline |
| Resource Usage | CPU, memory, connection count | < 120% of baseline |
| Business Metrics | Conversion rate, session duration, bounce rate | < 5% below baseline |
| Custom | Domain-specific health indicators | Configurable per domain |

### Statistical Significance

Canary evaluation requires statistical rigor to avoid false positives and false negatives:

```elixir
defmodule CanaryAnalysis do
  @moduledoc """
  Statistical analysis for canary release health assessment.
  Uses chi-squared test for error rate comparison.
  """

  @spec compare_error_rates(map(), map()) :: {:pass | :fail, float()}
  def compare_error_rates(baseline, canary) do
    baseline_rate = baseline.errors / max(baseline.total, 1)
    canary_rate = canary.errors / max(canary.total, 1)

    # Chi-squared test for proportions
    z_score = (canary_rate - baseline_rate) /
      :math.sqrt(baseline_rate * (1 - baseline_rate) / canary.total)

    p_value = 1 - :math.erf(abs(z_score) / :math.sqrt(2))

    if p_value > 0.05 or canary_rate <= baseline_rate do
      {:pass, p_value}
    else
      {:fail, p_value}
    end
  end
end
```

### Comparison with Other Deployment Strategies

| Feature | Canary | Blue-Green | Rolling Update | Feature Flags |
|---------|--------|-----------|---------------|---------------|
| Blast radius | Controlled (1-100%) | All or nothing | Gradual | Per-feature |
| Infrastructure cost | 1x + canary instances | 2x | 1x | 1x |
| Rollback speed | Fast (kill canary) | Instant (switch) | Slow (reverse roll) | Instant (toggle) |
| Traffic control | Percentage-based | Binary switch | Instance-based | Code-level |
| Monitoring required | High (comparative analysis) | Moderate | Moderate | Low |
| Statistical confidence | Yes (A/B comparison) | No (sequential) | No (sequential) | Yes (A/B possible) |

## Architecture and Implementation

### Load Balancer Configuration for Canary

```elixir
# Weighted routing for canary traffic distribution
defmodule PrismaticWeb.CanaryRouter do
  @moduledoc """
  Routes incoming requests between stable and canary instances
  based on configurable traffic weight.
  """

  @canary_weight 0.05  # 5% of traffic to canary

  def route(conn) do
    if :rand.uniform() < @canary_weight do
      route_to_canary(conn)
    else
      route_to_stable(conn)
    end
  end

  defp route_to_canary(conn) do
    conn
    |> Plug.Conn.put_resp_header("x-served-by", "canary")
    |> Plug.Conn.put_resp_header("x-canary-version", canary_version())
  end

  defp route_to_stable(conn) do
    conn
    |> Plug.Conn.put_resp_header("x-served-by", "stable")
  end
end
```

### Automated Canary Analysis Engine

```elixir
defmodule PrismaticDeploy.CanaryAnalyzer do
  @moduledoc """
  Continuously monitors canary health and makes promotion/rollback decisions.
  """

  use GenServer

  @check_interval :timer.seconds(30)
  @promotion_phases [0.01, 0.05, 0.25, 0.50, 1.0]

  defstruct [:current_phase, :start_time, :metrics_baseline, :canary_metrics]

  @impl true
  def handle_info(:analyze, state) do
    canary_health = collect_canary_metrics()
    baseline_health = collect_baseline_metrics()

    case evaluate_health(canary_health, baseline_health) do
      :healthy ->
        if ready_for_promotion?(state) do
          promote_to_next_phase(state)
        else
          schedule_next_check()
          {:noreply, state}
        end

      :degraded ->
        Logger.warning("Canary degradation detected, holding at phase #{state.current_phase}")
        schedule_next_check()
        {:noreply, state}

      :unhealthy ->
        Logger.error("Canary failure detected, initiating rollback")
        rollback_canary()
        {:noreply, %{state | current_phase: 0}}
    end
  end

  defp evaluate_health(canary, baseline) do
    cond do
      canary.error_rate > baseline.error_rate * 1.1 -> :unhealthy
      canary.p99_latency > baseline.p99_latency * 1.2 -> :degraded
      canary.throughput < baseline.throughput * 0.9 -> :degraded
      true -> :healthy
    end
  end
end
```

### Fly.io Canary Configuration

```toml
# fly.toml canary configuration
[deploy]
  strategy = "canary"
  canary_steps = [5, 25, 50, 100]
  canary_interval = "5m"

[checks]
  [checks.canary_health]
    type = "http"
    port = 4000
    path = "/health"
    interval = "5s"
    timeout = "2s"
```

## Usage in Prismatic Platform

The Prismatic Platform supports canary releases through Fly.io's traffic weighting and the platform's comprehensive observability stack.

### Quality Floor Guardian Integration

The Quality Floor Guardian's threshold monitoring automatically detects degradation in canary instances:

```elixir
defmodule PrismaticSafety.CanaryGuardian do
  @moduledoc """
  Extends Quality Floor Guardian with canary-specific health monitoring.
  Compares canary instance quality scores against the stable baseline.
  """

  @quality_degradation_threshold 0.95

  def evaluate_canary(canary_scores, baseline_scores) do
    canary_avg = Enum.sum(canary_scores) / max(length(canary_scores), 1)
    baseline_avg = Enum.sum(baseline_scores) / max(length(baseline_scores), 1)

    ratio = canary_avg / max(baseline_avg, 1)

    cond do
      ratio >= 1.0 -> {:promote, "Canary quality equals or exceeds baseline"}
      ratio >= @quality_degradation_threshold -> {:hold, "Canary quality slightly below baseline"}
      true -> {:rollback, "Canary quality degradation: #{Float.round(ratio * 100, 1)}%"}
    end
  end
end
```

### Telemetry-Driven Canary Decisions

The platform's telemetry infrastructure provides the metrics needed for canary evaluation:

| Metric Source | What It Measures | Canary Relevance |
|--------------|-----------------|------------------|
| Phoenix Telemetry | Request latency, status codes | Primary health indicators |
| Ecto Telemetry | Query performance, pool utilization | Database impact detection |
| BEAM Telemetry | Scheduler utilization, memory | Resource consumption comparison |
| Custom Events | Business metrics, quality scores | Domain-specific health |

### LiveView Canary Considerations

Phoenix LiveView adds complexity to canary releases because WebSocket connections are long-lived:

```elixir
defmodule PrismaticWeb.CanaryLiveViewPlug do
  @moduledoc """
  Ensures LiveView WebSocket connections route to the same
  version (stable or canary) for the duration of the session.
  """

  def init(opts), do: opts

  def call(conn, _opts) do
    case get_session(conn, :canary_assignment) do
      nil ->
        assignment = if :rand.uniform() < canary_weight(), do: :canary, else: :stable
        put_session(conn, :canary_assignment, assignment)
      _existing ->
        conn
    end
  end
end
```

## Best Practices

1. **Start small** -- Begin with 1% of traffic, not 10%. Smaller initial populations provide early warning with minimal user impact.

2. **Monitor comparatively** -- Always compare canary metrics against baseline metrics from the stable version. Absolute thresholds miss relative degradation.

3. **Automate promotion decisions** -- Manual canary evaluation introduces delays and human error. Automate the promote/hold/rollback decision based on statistical analysis.

4. **Ensure session consistency** -- Users should not bounce between canary and stable versions during a session. Use sticky sessions or user-based routing.

5. **Include business metrics** -- Technical metrics (latency, errors) catch bugs, but business metrics (conversion, engagement) catch UX regressions that technical metrics miss.

6. **Set maximum canary duration** -- A canary that runs indefinitely at low traffic is not providing confidence. Set time limits for promotion decisions.

## Common Pitfalls

- **Insufficient traffic volume**: A canary serving 1% of a low-traffic application may not receive enough requests for statistical significance. Increase the percentage or extend the monitoring window.

- **Ignoring database compatibility**: A canary running new code against a shared database can cause schema conflicts. Ensure migrations are backward-compatible.

- **Session leakage**: Users switching between canary and stable mid-session encounter inconsistent behavior. Implement sticky routing by user ID or session token.

- **Alert fatigue**: Too-sensitive thresholds trigger false rollbacks. Calibrate thresholds against historical variance in your metrics.

- **Missing rollback automation**: A canary release without automated rollback requires human intervention to stop a bad release. Always automate the rollback path.

## Related Concepts

- [Blue-Green Deployment](@/glossary/blue-green-deployment.md) -- Atomic switching alternative to gradual canary rollout
- [Feature Flag](@/glossary/feature-flag.md) -- Runtime toggles enabling per-user canary targeting
- [Observability](@/glossary/observability.md) -- Monitoring capabilities required for canary health assessment
- [Continuous Deployment](@/glossary/continuous-deployment.md) -- Pipeline orchestrating canary release stages
- [Load Balancing](@/glossary/load-balancing.md) -- Traffic distribution mechanism enabling canary routing

## Further Reading

- [Accelerate by Nicole Forsgren](https://itrevolution.com/product/accelerate/) -- Research on deployment practices and organizational performance
- [Architecture](@/architecture/_index.md) -- Release strategy architecture
- [Technologies](@/technologies/_index.md) -- Deployment infrastructure
- [Apps](@/apps/_index.md) -- Applications deployed via canary strategy

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)