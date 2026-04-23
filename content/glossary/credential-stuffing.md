+++
title = "Credential Stuffing"
weight = 50
[extra]
description = "An automated cyberattack where stolen username/password pairs from one breach are systematically tested against other services to exploit password reuse"
category = "security"
related_terms = ["credential", "authentication", "attack-surface", "anomaly-detection", "compliance"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["credential stuffing", "password reuse", "account takeover", "brute force", "breach data", "dark web", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "attack"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Credential Stuffing - Prismatic Platform"
+++

## Definition & Overview

Credential stuffing is an automated cyberattack where large volumes of username/password pairs -- typically obtained from data breaches of other services -- are systematically tested against target authentication endpoints to exploit password reuse. Unlike brute force attacks (which guess passwords), credential stuffing uses known-valid credentials from breached databases, making each attempt more likely to succeed. Industry estimates suggest that 0.1-2% of credential stuffing attempts succeed, a devastating rate when millions of credentials are tested.

The attack exploits a fundamental human behavior: password reuse. Despite decades of security awareness campaigns, surveys consistently show that 50-80% of users reuse passwords across multiple services. When a service suffers a data breach and its credential database is leaked (often to dark web marketplaces), attackers harvest these credentials and test them against high-value targets: banking, email, social media, and corporate VPN endpoints.

In the Prismatic Platform, credential stuffing is addressed from two perspectives. Defensively, the Blue Team's `blue-auth-sentinel` agent monitors authentication patterns for credential stuffing indicators (high-volume failed logins from distributed IPs, successful logins from unusual geographic locations). Offensively (in simulation), the Red Team's `red-scenario-generator` includes credential stuffing scenarios in its adversarial modeling, testing the platform's detection and response capabilities.

## Technical Deep Dive

### Attack Characteristics

| Characteristic | Brute Force | Credential Stuffing | Password Spraying |
|---------------|-------------|--------------------|--------------------|
| **Passwords** | Generated/guessed | Known-valid from breaches | Common passwords |
| **Usernames** | Single target | From breach data | Known user list |
| **Volume** | Many passwords/account | One password/many accounts | Few passwords/many accounts |
| **Success rate** | < 0.001% | 0.1-2% | 0.1-1% |
| **Detection** | Easy (high failure rate) | Hard (distributed, low rate) | Moderate |
| **Mitigation** | Account lockout | Rate limiting + MFA | Rate limiting + complexity |

### Detection Engine

```elixir
defmodule PrismaticDark.BlueTeam.CredentialStuffingDetector do
  @moduledoc """
  Detects credential stuffing attacks by analyzing authentication
  event patterns. Part of the Blue Team's defensive monitoring.
  Uses statistical analysis of login patterns to identify
  automated credential testing campaigns.
  """

  @type detection_result :: %{
    detected: boolean(),
    confidence: float(),
    indicators: [indicator()],
    recommended_action: atom()
  }

  @type indicator :: %{
    type: atom(),
    value: term(),
    severity: :low | :medium | :high | :critical
  }

  @window_minutes 15
  @failure_threshold 50
  @geographic_anomaly_threshold 3
  @velocity_threshold 10

  @spec analyze(String.t(), [map()]) :: {:ok, detection_result()}
  def analyze(target_service, auth_events) do
    recent = filter_recent(auth_events, @window_minutes)
    indicators = []

    indicators = indicators ++ check_failure_volume(recent)
    indicators = indicators ++ check_distributed_sources(recent)
    indicators = indicators ++ check_geographic_anomalies(recent)
    indicators = indicators ++ check_velocity(recent)
    indicators = indicators ++ check_known_breach_credentials(recent)

    confidence = calculate_detection_confidence(indicators)

    result = %{
      detected: confidence > 0.7,
      confidence: confidence,
      indicators: indicators,
      recommended_action: recommend_action(confidence)
    }

    if result.detected do
      :telemetry.execute(
        [:prismatic, :security, :credential_stuffing, :detected],
        %{confidence: confidence, indicator_count: length(indicators)},
        %{service: target_service}
      )
    end

    {:ok, result}
  end

  defp check_failure_volume(events) do
    failures = Enum.count(events, &(&1.status == :failed))

    if failures > @failure_threshold do
      [%{type: :high_failure_volume, value: failures, severity: :high}]
    else
      []
    end
  end

  defp check_distributed_sources(events) do
    unique_ips = events
    |> Enum.map(& &1.source_ip)
    |> Enum.uniq()
    |> length()

    if unique_ips > 20 and length(events) / unique_ips < 3 do
      [%{type: :distributed_sources, value: unique_ips, severity: :high}]
    else
      []
    end
  end

  defp check_geographic_anomalies(events) do
    countries = events
    |> Enum.map(& &1.geo_country)
    |> Enum.uniq()

    if length(countries) > @geographic_anomaly_threshold do
      [%{type: :geographic_anomaly, value: length(countries), severity: :medium}]
    else
      []
    end
  end

  defp check_velocity(events) do
    per_second = length(events) / max(@window_minutes * 60, 1)

    if per_second > @velocity_threshold do
      [%{type: :high_velocity, value: per_second, severity: :critical}]
    else
      []
    end
  end

  defp check_known_breach_credentials(_events), do: []

  defp calculate_detection_confidence(indicators) do
    severity_weights = %{low: 0.1, medium: 0.2, high: 0.3, critical: 0.4}

    score = Enum.sum(Enum.map(indicators, fn i ->
      Map.get(severity_weights, i.severity, 0.1)
    end))

    min(score, 1.0)
  end

  defp recommend_action(confidence) when confidence > 0.9, do: :block_and_alert
  defp recommend_action(confidence) when confidence > 0.7, do: :challenge_and_monitor
  defp recommend_action(confidence) when confidence > 0.5, do: :monitor_closely
  defp recommend_action(_), do: :continue_monitoring

  defp filter_recent(events, minutes) do
    cutoff = DateTime.add(DateTime.utc_now(), -minutes * 60, :second)
    Enum.filter(events, &(DateTime.compare(&1.timestamp, cutoff) == :gt))
  end
end
```

### Defense Mechanisms

| Defense | Effectiveness | User Impact | Implementation |
|---------|-------------|-------------|----------------|
| **MFA** | Very High | Medium | Authentication middleware |
| **Rate Limiting** | High | Low | API gateway / Phoenix plug |
| **CAPTCHA** | Medium-High | Medium | Challenge on suspicious activity |
| **IP Reputation** | Medium | Low | IP blocklist integration |
| **Account Lockout** | Medium | High (DoS risk) | Temporary lockout |
| **Credential Monitoring** | High | None | Dark web monitoring |
| **Device Fingerprinting** | High | Low | Client-side fingerprint |

## Architecture & Implementation

The credential stuffing detection system operates as a real-time analysis pipeline within the Blue Team's monitoring infrastructure. Authentication events from the Phoenix endpoint flow through a PubSub channel, where the detection engine applies its multi-factor analysis. The system uses a sliding window approach (default 15 minutes) to maintain a current picture of authentication activity without unbounded memory growth.

Detection indicators are weighted by severity and combined into a composite confidence score. A single indicator (e.g., high failure volume) might not trigger detection (many legitimate scenarios cause login failures), but multiple correlated indicators (high failure volume + distributed sources + unusual geography) provide high-confidence detection. This multi-signal approach aligns with the NABLA Signal Plurality axiom.

When credential stuffing is detected with high confidence, the system can automatically apply defensive measures: progressive rate limiting, CAPTCHA challenges for suspicious sessions, and temporary IP blocking. All actions are logged in the immutable audit trail, and alerts are sent to the security operations dashboard.

## Usage in Prismatic Platform

The OSINT toolbox includes dark web monitoring capabilities that identify compromised credentials associated with target entities. When investigating an organization, the platform can check whether employee credentials have appeared in known breach databases, providing a proactive indicator of credential stuffing risk.

The Red Team's adversarial simulation includes credential stuffing scenarios in its attack modeling. Using synthetic credentials (never real breach data), the `red-scenario-generator` simulates credential stuffing campaigns to test the Blue Team's detection capabilities and measure response time. The Purple Team evaluates whether the detection-to-response loop achieves closure.

The Perimeter security rating factors authentication defense mechanisms into its assessment. Organizations with multi-factor authentication, rate limiting, and proper account lockout policies receive higher scores than those with basic password-only authentication, as these defenses directly reduce credential stuffing risk.

## Cross-References

- [Credential](/glossary/credential/) - authentication artifacts targeted by stuffing
- [Authentication](/glossary/authentication/) - identity verification attacked by stuffing
- [Attack Surface](/glossary/attack-surface/) - authentication endpoints as attack surface
- [Anomaly Detection](/glossary/anomaly-detection/) - detecting stuffing patterns
- [Compliance](/glossary/compliance/) - regulatory requirements for breach response
- **Livebooks**: `livebooks/domains/security_compliance/` - credential security labs
- **Academy**: Threat intelligence and attack pattern analysis

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
