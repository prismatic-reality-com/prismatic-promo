+++
title = "Alert"
weight = 50
[extra]
description = "An automated notification triggered when monitored conditions exceed defined thresholds, requiring human or agent attention for security events, system anomalies, or quality violations"
category = "security"
related_terms = ["anomaly-detection", "advisory", "containment", "csirt", "compliance", "configuration-drift", "behavioral-drift"]
tags = ["glossary", "alert", "monitoring", "notification", "security", "telemetry", "threshold", "pubsub", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "beginner"
quality_score = 84
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Alerts are threshold-triggered notifications that bridge automated monitoring and human/agent response, distributed via PubSub across the Prismatic Platform's telemetry infrastructure"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["alert", "notification", "monitoring", "threshold", "PubSub", "telemetry", "security alert", "anomaly alert", "quality alert", "incident response"]
image = "/images/sections/glossary.png"
image_alt = "Alert - Prismatic Platform"
word_count = 950
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

An alert is an automated notification generated when a monitored metric, condition, or pattern exceeds a predefined threshold or matches a detection rule. Alerts bridge the gap between continuous automated monitoring and human or agent response, ensuring that conditions requiring attention are surfaced promptly. A well-designed alerting system minimizes both false positives (alert fatigue) and false negatives (missed incidents) while providing sufficient context for rapid triage.

In the Prismatic Platform, alerts flow through the Phoenix PubSub system and telemetry infrastructure, triggered by security events, quality violations, performance degradation, or OSINT intelligence findings.

## Technical Deep Dive

### Alert Severity Levels

| Severity | Response SLA | Example | Routing |
|----------|-------------|---------|---------|
| **Critical** | Immediate | Security breach detected | All channels + pager |
| **High** | < 1 hour | Quality gate failure | PubSub + dashboard |
| **Medium** | < 4 hours | Performance degradation | Dashboard + log |
| **Low** | < 24 hours | Configuration drift detected | Log + metrics |
| **Informational** | None | Routine status update | Log only |

### Alert Lifecycle

```
Condition → Detection → Threshold Check → Alert Generation → Routing → Acknowledgment → Resolution
                                              ↓
                                        Deduplication
                                              ↓
                                        Suppression (if in maintenance window)
```

## Architecture and Implementation

```elixir
defmodule PrismaticMonitoring.AlertManager do
  @moduledoc """
  Centralized alert management for the Prismatic Platform.
  Receives alert triggers from telemetry handlers, deduplicates,
  applies suppression rules, and routes to appropriate channels.
  """

  use GenServer

  @type alert :: %{
          id: String.t(),
          severity: :critical | :high | :medium | :low | :informational,
          source: String.t(),
          title: String.t(),
          description: String.t(),
          metadata: map(),
          triggered_at: DateTime.t(),
          acknowledged: boolean(),
          resolved: boolean()
        }

  @spec trigger_alert(atom(), String.t(), String.t(), map()) :: :ok
  def trigger_alert(severity, title, description, metadata \\ %{}) do
    GenServer.cast(__MODULE__, {:trigger, severity, title, description, metadata})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{active_alerts: %{}, suppression_rules: [], dedup_window: :timer.minutes(5)}}
  end

  @impl GenServer
  def handle_cast({:trigger, severity, title, description, metadata}, state) do
    alert = %{
      id: generate_alert_id(),
      severity: severity,
      source: Map.get(metadata, :source, "unknown"),
      title: title,
      description: description,
      metadata: metadata,
      triggered_at: DateTime.utc_now(),
      acknowledged: false,
      resolved: false
    }

    if not suppressed?(alert, state) and not duplicate?(alert, state) do
      route_alert(alert)
      new_alerts = Map.put(state.active_alerts, alert.id, alert)

      :telemetry.execute(
        [:prismatic, :alert, :triggered],
        %{count: 1},
        %{severity: severity, source: alert.source}
      )

      {:noreply, %{state | active_alerts: new_alerts}}
    else
      {:noreply, state}
    end
  end

  @spec route_alert(alert()) :: :ok
  defp route_alert(%{severity: :critical} = alert) do
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "alerts:critical", {:alert, alert})
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "alerts:all", {:alert, alert})
  end

  defp route_alert(alert) do
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "alerts:all", {:alert, alert})
  end
end
```

## Usage in Prismatic Platform

- **Quality Floor Guardian**: Triggers alerts when quality scores drop below thresholds (98% = WARNING, 95% = CRITICAL)
- **Perimeter EASM**: Alerts on new vulnerability discoveries, certificate expirations, and rating changes
- **OSINT Toolbox**: Alerts when intelligence sources become unavailable or return anomalous data
- **Performance Monitoring**: Alerts when page load times exceed 250ms or server render exceeds 100ms
- **Security Operations**: Blue Team drift detector alerts on behavioral, configuration, and dependency drift
- **CI/CD Pipeline**: Alerts on build failures, test regressions, and deployment issues

## Code Examples

### Telemetry-Based Alert Trigger

```elixir
defmodule PrismaticMonitoring.TelemetryAlertHandler do
  @moduledoc """
  Attaches to telemetry events and triggers alerts when
  metrics exceed configured thresholds.
  """

  @spec attach() :: :ok
  def attach do
    :telemetry.attach(
      "alert-page-load",
      [:prismatic, :web, :page_load],
      &handle_page_load/4,
      %{threshold_ms: 250}
    )
  end

  @spec handle_page_load(atom(), map(), map(), map()) :: :ok
  def handle_page_load(_event, %{duration: duration}, metadata, %{threshold_ms: threshold}) do
    duration_ms = System.convert_time_unit(duration, :native, :millisecond)

    if duration_ms > threshold do
      PrismaticMonitoring.AlertManager.trigger_alert(
        :high,
        "Page load time exceeded #{threshold}ms",
        "Route #{metadata.route} took #{duration_ms}ms",
        %{route: metadata.route, duration_ms: duration_ms}
      )
    end
  end
end
```

## Best Practices

1. **Set meaningful thresholds**: Alerts that fire too often cause fatigue. Calibrate thresholds based on actual impact.

2. **Include actionable context**: Every alert must contain enough information for the responder to begin triage immediately.

3. **Deduplicate aggressively**: Multiple triggers of the same condition within a short window should generate one alert, not many.

4. **Implement suppression windows**: During planned maintenance, suppress non-critical alerts to avoid noise.

5. **Track alert-to-resolution metrics**: Measure mean time to acknowledge (MTTA) and mean time to resolve (MTTR).

6. **Route by severity**: Critical alerts go to all channels; informational alerts go to logs only.

## Related Terms

- [Anomaly Detection](@/glossary/anomaly-detection.md) -- detection systems that trigger alerts
- [Advisory](@/glossary/advisory.md) -- external notifications that may trigger internal alerts
- **Containment** -- automated response to critical alerts
- **CSIRT** -- teams that respond to security alerts
- **Configuration Drift** -- drift conditions that generate alerts
- [Behavioral Drift](@/glossary/behavioral-drift.md) -- behavioral changes triggering drift alerts

## See Also

- [Prometheus Alerting](https://prometheus.io/docs/alerting/latest/overview/) -- industry-standard alerting
- [PubSub](@/glossary/pubsub.md) -- Prismatic Platform alert distribution mechanism

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
