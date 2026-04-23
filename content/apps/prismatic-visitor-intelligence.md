+++
title = "Prismatic Visitor Intelligence"
weight = 19
[extra]
icon = "eye"
color = "amber"
description = "HAWKEYE - Advanced visitor analysis with behavioral profiling and threat detection"
category = "Intelligence"
files = "423"
status = "Production"
port = "4000"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 926
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Visitor", "Intelligence", "HAWKEYE", "Advanced", "apps", "Prismatic Platform", "AbuseIPDB", "GreyNoise", "Shodan"]
tags = ["apps", "intelligence", "prismatic-visitor-intelligence", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Visitor Intelligence - Prismatic Platform"
+++

## Overview

Prismatic Visitor Intelligence (codename: [HAWKEYE](@/glossary/hawkeye.md)) is the platform's advanced visitor analysis system. It goes beyond basic web analytics to provide behavioral profiling, threat detection, risk scoring, and real-time intelligence about every visitor interacting with monitored web properties.

HAWKEYE combines signals from browser fingerprinting, geolocation, behavioral analysis, and external [threat intelligence](@/glossary/threat-intelligence.md) feeds ([AbuseIPDB](@/osint/abuseipdb.md), [GreyNoise](@/osint/greynoise.md), [Shodan](@/osint/shodan.md)) to build a comprehensive visitor profile and assign a dynamic [risk score](@/glossary/risk-score.md). The system processes each visitor request in under 100 milliseconds, enabling real-time threat assessment without perceptible impact on page load times.

The intelligence pipeline operates as a multi-stage analysis chain where each stage enriches the visitor profile with additional context. Browser-side collection gathers device and behavioral signals, server-side processing correlates these signals with external intelligence, and the risk engine synthesizes all available data into an actionable threat assessment. This layered approach ensures that the system can provide useful assessments even when individual intelligence sources are unavailable or rate-limited.

## Architecture

```
PrismaticVisitorIntelligence (HAWKEYE)
+-- Collector          # Browser-side data collection (JS)
+-- Fingerprinter      # Device fingerprinting engine
+-- Geolocator         # IP geolocation and network analysis
+-- BehavioralEngine   # Behavioral pattern analysis
|   +-- MouseAnalyzer  # Mouse movement patterns
|   +-- ScrollAnalyzer # Scroll behavior analysis
|   +-- ClickAnalyzer  # Click pattern analysis
|   +-- BotDetector    # Automated behavior detection
+-- Enrichment         # External intelligence integration
|   +-- AbuseIPDB      # IP reputation
|   +-- GreyNoise      # Scanner identification
|   +-- Shodan         # Infrastructure intelligence
+-- RiskEngine         # Dynamic risk scoring
+-- Classification     # Visitor classification
+-- Dashboard          # LiveView real-time monitoring
```

### Processing Pipeline

```
Browser --> JS Collector --> WebSocket --> Collector GenServer
                                         |
                                   Fingerprinting
                                         |
                                   Geolocation + Enrichment (parallel)
                                         |
                                   Behavioral Analysis
                                         |
                                   Risk Scoring --> Classification
                                         |
                                   Dashboard Update (PubSub)
```

The pipeline processes visitor data through supervised [OTP](@/glossary/otp.md) processes with backpressure management. The Collector GenServer receives WebSocket messages from the browser-side JavaScript collector and dispatches them through the analysis chain. Fingerprinting and geolocation execute concurrently through `Task.async_stream/3`, and enrichment queries to external intelligence sources run in parallel with configurable timeouts to prevent slow sources from blocking the pipeline.

## Visitor Profiling

HAWKEYE constructs comprehensive visitor profiles that combine device characteristics, network context, behavioral patterns, and external intelligence into a unified representation.

```elixir
# Get comprehensive visitor profile
{:ok, profile} = PrismaticVisitorIntelligence.profile(session_id)
# => %{
#   session_id: "sess_abc123",
#   visitor_id: "vis_xyz789",  # Cross-session identification
#   fingerprint: %{
#     browser: "Chrome 122",
#     os: "macOS 14.3",
#     device: "desktop",
#     screen: "2560x1440",
#     timezone: "Europe/Prague",
#     languages: ["cs", "en"],
#     canvas_hash: "a1b2c3d4",
#     webgl_hash: "e5f6g7h8"
#   },
#   geolocation: %{
#     ip: "1.2.3.4",
#     country: "CZ",
#     city: "Prague",
#     asn: 47232,
#     isp: "CESNET",
#     is_vpn: false,
#     is_tor: false,
#     is_proxy: false
#   },
#   behavior: %{
#     pages_viewed: 12,
#     session_duration: 847,
#     click_patterns: :normal,
#     scroll_behavior: :human,
#     navigation_pattern: :organic,
#     form_interactions: 3
#   },
#   risk_score: 15,  # 0-100 scale
#   risk_level: :low,
#   classification: :legitimate_user
# }
```

Cross-session identification uses a combination of fingerprint hashing and probabilistic matching to recognize returning visitors even when cookies are cleared or different browsers are used. The identification algorithm weighs stable features (screen resolution, timezone, installed fonts) more heavily than volatile features (browser version, user agent string) to maintain identification accuracy across browser updates.

## Threat Detection and Risk Scoring

The threat detection system synthesizes signals from multiple independent sources into a unified risk assessment. Each signal source produces a confidence-weighted indicator, and the risk engine combines these indicators using a Bayesian fusion model that accounts for source independence and correlation.

```elixir
# Real-time threat assessment
{:ok, threat} = PrismaticVisitorIntelligence.assess_threat(request)
# => %{
#   risk_score: 85,
#   risk_level: :high,
#   threat_indicators: [
#     %{type: :known_malicious_ip, source: :abuseipdb, confidence: 0.92},
#     %{type: :automated_behavior, source: :behavioral_analysis, confidence: 0.88},
#     %{type: :mass_scanner, source: :greynoise, confidence: 0.95}
#   ],
#   classification: :automated_scanner,
#   recommended_action: :rate_limit,
#   details: "IP identified as mass scanner by GreyNoise, high abuse score on AbuseIPDB"
# }
```

The risk scoring model uses a 0-100 scale with five classification levels:

| Score Range | Level | Classification | Typical Action |
|------------|-------|---------------|----------------|
| 0-20 | Low | Legitimate user | Allow |
| 21-40 | Moderate | Suspicious activity | Monitor |
| 41-60 | Elevated | Potential threat | Challenge (CAPTCHA) |
| 61-80 | High | Likely threat | Rate limit |
| 81-100 | Critical | Confirmed threat | Block |

## Intelligence Enrichment

HAWKEYE enriches visitor data by querying external intelligence sources in parallel with configurable timeout and fallback behavior.

```elixir
defmodule PrismaticVisitorIntelligence.Enrichment do
  @moduledoc """
  Enriches visitor profiles with external intelligence.
  """

  def enrich(visitor_ip) do
    # Parallel queries to intelligence sources
    tasks = [
      Task.async(fn -> AbuseIpdb.check(visitor_ip) end),
      Task.async(fn -> GreyNoise.quick(visitor_ip) end),
      Task.async(fn -> Shodan.host(visitor_ip) end)
    ]

    [abuse, greynoise, shodan] = Task.await_many(tasks, 10_000)

    {:ok, %{
      abuse_confidence: extract_score(abuse),
      is_noise: extract_noise(greynoise),
      noise_classification: extract_classification(greynoise),
      open_ports: extract_ports(shodan),
      services: extract_services(shodan),
      overall_threat_level: calculate_threat(abuse, greynoise, shodan)
    }}
  end
end
```

Enrichment results are cached in [ETS](@/apps/prismatic-storage-ets.md) with configurable TTL (default: 1 hour for IP reputation, 24 hours for infrastructure data) to minimize external API calls. Cache keys include the IP address and the source identifier, enabling selective invalidation when a specific source's data changes.

When external sources are unavailable (rate limited, network error, or timeout), the enrichment module gracefully degrades by using cached data if available or by computing risk scores from local signals only. The risk engine adjusts confidence weights downward when enrichment data is missing, ensuring that the final risk score accurately reflects the available evidence.

## Behavioral Analysis

```elixir
# Bot detection through behavioral analysis
{:ok, analysis} = PrismaticVisitorIntelligence.analyze_behavior(session_id)
# => %{
#   is_bot: false,
#   bot_confidence: 0.12,
#   human_indicators: [
#     :natural_mouse_movement,
#     :variable_typing_speed,
#     :scroll_with_pauses,
#     :non_linear_navigation
#   ],
#   bot_indicators: [],
#   behavioral_score: 92  # Higher = more human-like
# }

# Anomaly detection across visitor population
{:ok, anomalies} = PrismaticVisitorIntelligence.detect_anomalies(
  timeframe: :last_hour,
  threshold: 2.0  # Standard deviations from baseline
)
```

The behavioral analysis engine processes client-side interaction events (mouse movements, scroll patterns, click timing, keyboard dynamics) to distinguish human visitors from automated agents. Human behavior exhibits characteristic patterns: mouse movements follow smooth curves with acceleration and deceleration, scrolling includes pauses at content boundaries, and typing speed varies with content complexity. Automated agents typically lack these naturalistic patterns.

## Dashboard

The HAWKEYE dashboard is accessible at `/visitors` within the [Prismatic Web](@/apps/prismatic-web.md) interface, providing real-time visibility into visitor activity.

Dashboard Features:
- Live visitor feed with real-time risk scores
- Geographic distribution heat map
- Behavioral pattern timeline
- Threat indicator breakdown
- Bot vs. human traffic ratio
- Top risk indicators
- Session replay capability

## Testing

```bash
mix test apps/prismatic_visitor_intelligence/test
mix test apps/prismatic_visitor_intelligence/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Fingerprinting | 12 | Hash stability, feature extraction, cross-browser consistency |
| Behavioral Analysis | 10 | Bot detection accuracy, human pattern recognition |
| Risk Scoring | 12 | Score calculation, source fusion, confidence weighting |
| Enrichment | 8 | Parallel queries, caching, graceful degradation |
| Classification | 6 | Level assignment, recommended action accuracy |
| Dashboard | 4 | LiveView rendering, PubSub update propagation |

## Dependencies

| Application | Relationship |
|-------------|-------------|
| [Prismatic Web](@/apps/prismatic-web.md) | Dashboard hosting and [LiveView](@/glossary/liveview.md) |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Threat intelligence sharing |
| [Prismatic Cache](@/apps/prismatic-cache.md) | Intelligence query caching |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Visitor [metrics](@/glossary/metrics.md) |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Visitor data persistence |
| [Prismatic Auth](@/apps/prismatic-auth.md) | Dashboard access control |

## NABLA Compliance

HAWKEYE's risk scoring model maintains full provenance for every risk assessment, recording which intelligence sources contributed, their individual confidence scores, and the fusion algorithm used, satisfying the Provenance Mandatory axiom. The multi-source enrichment pipeline implements Signal Plurality by querying independent intelligence sources (AbuseIPDB, GreyNoise, Shodan) and preserving their individual assessments rather than simply averaging them. When sources disagree (AbuseIPDB reports clean while GreyNoise reports scanner), both assessments are preserved in the visitor profile, satisfying Contradiction Preservation. The risk score's confidence weight is adjusted downward to reflect the disagreement, and analysts can inspect both assessments to form their own judgment.

## Related OSINT Sources

- [AbuseIPDB](@/osint/abuseipdb.md) - IP reputation scoring
- [GreyNoise](@/osint/greynoise.md) - Mass scanner identification
- [Shodan](@/osint/shodan.md) - Infrastructure fingerprinting

## Related Agents

- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Manages visitor threat alerts with severity-based routing
- [GitLab Security Specialist](@/agents/gitlab-security-specialist-agent.md) -- Security posture assessment for visitor threat detection validation
- [DX Brutalist Analyst](@/agents/dx-brutalist-analyst.md) -- Evaluates HAWKEYE dashboard usability and analyst workflow efficiency

## Related Capabilities

- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Sub-100ms visitor analysis with live dashboard updates via PubSub
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-source threat intelligence fusion from AbuseIPDB, GreyNoise, and Shodan
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Visitor processing metrics and bot detection accuracy monitoring

## Production Status

**Status**: Production Active
**Visitor Processing**: Sub-100ms analysis per request
**Intelligence Sources**: 3 real-time feeds (AbuseIPDB, GreyNoise, Shodan)
**Bot Detection**: 98.5% accuracy
**Dashboard**: Real-time LiveView at `/visitors`
**Risk Scoring**: Dynamic 0-100 scale with 5 classification levels

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)