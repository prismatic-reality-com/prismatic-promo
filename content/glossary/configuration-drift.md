+++
title = "Configuration Drift"
weight = 50
[extra]
description = "The gradual divergence of a system's actual configuration from its intended or documented state, creating security risks and operational unpredictability"
category = "devops"
related_terms = ["configuration", "consistency", "containment", "compliance", "continuous-validation"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["configuration drift", "state divergence", "infrastructure drift", "environment consistency", "drift detection", "glossary", "Prismatic Platform"]
tags = ["glossary", "devops", "security"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Configuration Drift - Prismatic Platform"
+++

## Definition & Overview

Configuration drift is the gradual, often undetected divergence of a system's actual operational state from its intended, documented, or baseline configuration. Drift occurs through manual changes not captured in configuration management, failed or partial deployments, automatic updates, environmental differences, and time-dependent state changes. The resulting gap between "what we think the system is" and "what the system actually is" creates security vulnerabilities, operational failures, and compliance violations.

Configuration drift is particularly insidious because it is often invisible until it causes a failure. A server that was properly configured six months ago may have accumulated dozens of small changes -- a manually-added firewall rule, an updated library, a changed environment variable -- each individually harmless but collectively creating an undocumented, untested, and potentially vulnerable configuration state.

The Prismatic Platform combats configuration drift at multiple levels. The Blue Team's `blue-drift-detector` agent continuously monitors for behavioral, configuration, dependency, and performance drift across the platform. The Quality DNA system maintains a configuration baseline that detects cross-session drift. The Perimeter EASM module assesses external organizations for configuration drift as part of its security rating, since drift is a leading indicator of security posture degradation.

## Technical Deep Dive

### Drift Categories

| Category | Description | Detection Method | Prismatic Agent |
|----------|-------------|-----------------|-----------------|
| **Configuration** | Settings changed from baseline | Baseline comparison | `blue-drift-detector` |
| **Behavioral** | System behavior deviates from expected | Anomaly detection | `blue-drift-detector` |
| **Dependency** | Library versions changed | Lock file diff | Quality gates |
| **Performance** | Metrics deviate from baseline | Statistical analysis | Quality Floor Guardian |
| **Security** | Security posture degraded | Continuous scanning | Perimeter EASM |
| **Compliance** | Regulatory conformance changed | Compliance engine | Perimeter compliance |

### Drift Detection Engine

```elixir
defmodule PrismaticDark.DriftDetector do
  @moduledoc """
  Detects configuration drift across the Prismatic Platform.
  Part of the Blue Team's defensive monitoring capabilities.
  Compares current state against baseline snapshots.
  """

  @type drift_report :: %{
    category: atom(),
    severity: :info | :warning | :critical,
    baseline_value: term(),
    current_value: term(),
    drift_magnitude: float(),
    detected_at: DateTime.t(),
    description: String.t()
  }

  @drift_threshold 0.05

  @spec detect_configuration_drift(map(), map()) :: [drift_report()]
  def detect_configuration_drift(baseline, current) do
    Map.keys(baseline)
    |> Enum.flat_map(fn key ->
      baseline_val = Map.get(baseline, key)
      current_val = Map.get(current, key)

      if baseline_val != current_val do
        magnitude = calculate_magnitude(baseline_val, current_val)
        severity = magnitude_to_severity(magnitude)

        [%{
          category: :configuration,
          severity: severity,
          baseline_value: baseline_val,
          current_value: current_val,
          drift_magnitude: magnitude,
          detected_at: DateTime.utc_now(),
          description: "Config key '#{key}' drifted from #{inspect(baseline_val)} to #{inspect(current_val)}"
        }]
      else
        []
      end
    end)
  end

  @spec detect_dependency_drift(String.t(), String.t()) :: [drift_report()]
  def detect_dependency_drift(baseline_lockfile, current_lockfile) do
    baseline_deps = parse_lockfile(baseline_lockfile)
    current_deps = parse_lockfile(current_lockfile)

    changed = Map.keys(baseline_deps)
    |> Enum.filter(fn dep ->
      Map.get(baseline_deps, dep) != Map.get(current_deps, dep)
    end)

    Enum.map(changed, fn dep ->
      %{
        category: :dependency,
        severity: :warning,
        baseline_value: Map.get(baseline_deps, dep),
        current_value: Map.get(current_deps, dep),
        drift_magnitude: 1.0,
        detected_at: DateTime.utc_now(),
        description: "Dependency '#{dep}' version changed"
      }
    end)
  end

  defp calculate_magnitude(old, new) when is_number(old) and is_number(new) do
    if old != 0, do: abs(new - old) / abs(old), else: 1.0
  end
  defp calculate_magnitude(_old, _new), do: 1.0

  defp magnitude_to_severity(mag) when mag > 0.50, do: :critical
  defp magnitude_to_severity(mag) when mag > 0.10, do: :warning
  defp magnitude_to_severity(_mag), do: :info

  defp parse_lockfile(content) do
    content
    |> String.split("\n", trim: true)
    |> Enum.map(fn line -> String.split(line, ":", parts: 2) end)
    |> Enum.filter(&(length(&1) == 2))
    |> Map.new(fn [k, v] -> {String.trim(k), String.trim(v)} end)
  end
end
```

### Anti-Drift Strategies

| Strategy | Description | Prismatic Implementation |
|----------|-------------|-------------------------|
| **Infrastructure as Code** | All config in version control | `config/` directory, Dockerfile |
| **Immutable Infrastructure** | Replace, never modify | Fly.io deployment model |
| **Continuous Validation** | Regular baseline checks | Quality Floor Guardian |
| **Automated Remediation** | Auto-fix detected drift | Autoheal cycle |
| **Drift Alerts** | Real-time drift notification | Blue Team PubSub alerts |
| **Baseline Snapshots** | Regular state capture | Quality DNA persistence |

## Architecture & Implementation

The Prismatic Platform's drift detection operates in three domains. First, the Blue Team's `blue-drift-detector` agent monitors runtime platform state, comparing current configuration, behavior metrics, and dependency versions against stored baselines. Detected drift produces structured findings that enter the Color Team pipeline for assessment and potential remediation.

Second, the Quality DNA system (`/.claude/quality-dna/current-state.json`) captures configuration and quality baselines between sessions. When a new session starts, the platform loads the previous baseline and checks for drift -- changes in quality scores, compilation warnings, test coverage, or dependency versions that occurred outside the session context.

Third, the Perimeter EASM module detects external configuration drift when assessing target organizations. Changes in TLS configurations, DNS records, HTTP security headers, and exposed services between assessment scans indicate configuration drift that may signal security posture degradation.

## Usage in Prismatic Platform

The Red Team's `red-drift-inducer` agent simulates sub-threshold drift attacks in the sandboxed environment, testing whether the Blue Team's detection systems can identify gradual, intentional configuration drift designed to evade point-in-time comparisons. This adversarial testing ensures the drift detection system remains effective against sophisticated threats.

The Quality Floor Guardian uses drift detection to enforce the quality floor. If quality metrics drift below the established floor (100/100 currently), the guardian blocks commits and triggers an emergency evolution cycle to restore the baseline. This prevents the insidious accumulation of small quality regressions that individually seem harmless.

The Perimeter compliance engine treats configuration drift as a compliance risk indicator. Organizations whose configurations drift significantly between assessments receive lower stability ratings, as drift correlates with inadequate change management processes -- a key NIS2 Article 21 requirement.

## Cross-References

- [Configuration](@/glossary/configuration.md) - system settings that drift from baseline
- **Consistency** - state coherence that drift undermines
- [Compliance](@/glossary/compliance.md) - regulatory conformance affected by drift
- **Containment** - incident response when drift causes incidents
- [Continuous Validation](@/glossary/continuous-validation.md) - ongoing drift monitoring
- **Livebooks**: `livebooks/domains/security_compliance/` - drift detection exercises
- **Academy**: Security monitoring and drift detection topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
