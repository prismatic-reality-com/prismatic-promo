+++
title = "Prismatic HAWKEYE"
weight = 3
[extra]
icon = "eye"
color = "amber"
description = "Visitor Intelligence with behavioral analysis and risk assessment"
category = "Intelligence"
files = "423"
status = "Production"
port = "4000"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1409
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "HAWKEYE", "Visitor", "Intelligence", "apps", "Prismatic Platform", "PrismaticVisitorIntelligence", "AbuseIPDB", "GreyNoise", "Shodan"]
tags = ["apps", "intelligence", "prismatic-hawkeye", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic HAWKEYE - Prismatic Platform"
+++

## Abstract

[HAWKEYE](/glossary/hawkeye/) is the Prismatic Platform's Visitor Intelligence system, providing real-time behavioral analysis, device fingerprinting, geolocation intelligence, and dynamic risk scoring for every visitor interacting with monitored web properties. The system correlates browser-side behavioral signals (mouse movement, scroll patterns, click cadence, navigation flow) with server-side intelligence from external threat feeds -- AbuseIPDB, [GreyNoise](/glossary/greynoise/), and [Shodan](/glossary/shodan/) -- to classify visitors on a 0-100 risk scale across five threat levels. HAWKEYE's architecture employs a [GenStage](/glossary/genstage/)-based processing pipeline that handles visitor profiling in under 100 milliseconds per request, with bot detection accuracy exceeding 98%. The system delivers its intelligence through a real-time [Phoenix LiveView](/glossary/phoenix-liveview/) dashboard and programmatic APIs, enabling both human analysts and automated systems to act on visitor threat assessments.

## 1. Introduction

### 1.1 Problem Statement

Web-facing applications receive traffic from a spectrum of actors ranging from legitimate users to automated scanners, credential stuffers, web scrapers, and targeted attack tools. Traditional web analytics tools measure page views and session durations but lack the security intelligence needed to distinguish benign visitors from threats. Conversely, Web Application Firewalls (WAFs) operate on static rule sets that miss behavioral anomalies and context-dependent threats. The gap between analytics and security creates blind spots where sophisticated automated attacks succeed precisely because they mimic human behavior.

HAWKEYE bridges this gap by combining behavioral analysis with external [threat intelligence](/glossary/threat-intelligence/), producing a contextual risk assessment that adapts in real time as visitor behavior evolves throughout a session.

### 1.2 Design Goals

1. **Sub-100ms profiling latency** -- visitor risk assessment must complete within the HTTP request lifecycle to enable inline blocking decisions.
2. **Multi-signal correlation** -- combine browser fingerprints, geolocation, behavioral patterns, and external threat feeds into a unified [risk score](/glossary/risk-score/).
3. **Adaptive bot detection** -- detect automated behavior through behavioral analysis rather than static signatures, achieving over 98% accuracy.
4. **Real-time dashboard** -- provide a LiveView interface showing live visitor feeds, geographic distribution, and threat indicators.
5. **Privacy compliance** -- minimize data collection to what is necessary for security assessment, with configurable retention policies.
6. **Integration with platform intelligence** -- share threat assessments with [Prismatic Perimeter](/apps/prismatic-perimeter/) and the broader [OSINT](/glossary/osint/) pipeline.

### 1.3 Scope

HAWKEYE monitors web traffic to Prismatic-managed properties. It does not function as a general-purpose web analytics platform, an intrusion detection system for network-level attacks, or a DDoS mitigation service. Its scope is visitor-level intelligence and behavioral risk assessment.

## 2. Architecture

### 2.1 System Design

```
Browser                                           Server
+------------------+                    +---------------------------+
| JS Collector     |  WebSocket/HTTP    | Collector GenServer       |
| - Mouse events   | ----------------> | - Event ingestion         |
| - Scroll events  |                    | - Session tracking        |
| - Click events   |                    +---------------------------+
| - Navigation     |                              |
| - Fingerprints   |                    +---------+---------+
+------------------+                    |                   |
                                  Fingerprinter       Geolocator
                                        |                   |
                                  +-----+-----+    +-------+-------+
                                  | Device ID  |    | IP Geoloc     |
                                  | Canvas     |    | ASN / ISP     |
                                  | WebGL      |    | VPN / Tor     |
                                  | Fonts      |    | Proxy detect  |
                                  +-----+------+    +-------+-------+
                                        |                   |
                                  +-----+-------------------+-----+
                                  |    Enrichment Pipeline         |
                                  | (Parallel external queries)    |
                                  | AbuseIPDB | GreyNoise | Shodan |
                                  +-----+-------------------------+
                                        |
                                  +-----+------+
                                  | Behavioral  |
                                  | Engine      |
                                  | - Mouse     |
                                  | - Scroll    |
                                  | - Click     |
                                  | - Bot Det.  |
                                  +-----+------+
                                        |
                                  +-----+------+
                                  | Risk Engine |
                                  | Score 0-100 |
                                  | Classify    |
                                  +-----+------+
                                        |
                                  +-----+------+
                                  | Dashboard   |
                                  | PubSub push |
                                  +------------+
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticVisitorIntelligence.Collector` | [WebSocket](/glossary/websocket/)/HTTP event ingestion from browser-side JavaScript collector |
| `PrismaticVisitorIntelligence.Fingerprinter` | Device fingerprinting from canvas, WebGL, font, and browser attributes |
| `PrismaticVisitorIntelligence.Geolocator` | IP geolocation, ASN resolution, VPN/Tor/proxy detection |
| `PrismaticVisitorIntelligence.Enrichment` | Parallel external intelligence queries (AbuseIPDB, GreyNoise, Shodan) |
| `PrismaticVisitorIntelligence.BehavioralEngine` | Behavioral pattern analysis: mouse, scroll, click, navigation |
| `PrismaticVisitorIntelligence.BotDetector` | Automated behavior detection with ML-assisted classification |
| `PrismaticVisitorIntelligence.RiskEngine` | Dynamic 0-100 risk scoring and five-level classification |
| `PrismaticVisitorIntelligence.SessionTracker` | Cross-request session management with visitor identity correlation |
| `PrismaticVisitorIntelligence.Dashboard` | LiveView components for [real-time monitoring](/capabilities/real-time-monitoring/) |

### 2.3 Process Topology

```
PrismaticVisitorIntelligence.Application (Supervisor, :one_for_one)
+-- PrismaticVisitorIntelligence.Collector (GenServer)
|     Ingests browser events, manages session state in ETS
+-- PrismaticVisitorIntelligence.SessionTracker (GenServer)
|     Cross-session visitor identification via fingerprint matching
+-- PrismaticVisitorIntelligence.RiskEngine (GenServer)
|     Maintains risk computation state and classification thresholds
+-- PrismaticVisitorIntelligence.Enrichment.Supervisor (Task.Supervisor)
|     Supervises parallel external intelligence queries
+-- PrismaticVisitorIntelligence.AlertManager (GenServer)
      Manages alert generation and routing for high-risk visitors
```

### 2.4 Data Flow

Visitor data enters through the browser-side JavaScript collector, which transmits behavioral events over a WebSocket connection. The Collector [GenServer](/glossary/genserver/) ingests these events and routes them through a sequential pipeline: fingerprinting, geolocation, external enrichment (parallel), behavioral analysis, and risk scoring. The final risk assessment is stored in [ETS](/glossary/ets/) and broadcast via [PubSub](/glossary/pubsub/) to the LiveView dashboard.

## 3. Implementation

### 3.1 Key Algorithms

**Behavioral Bot Detection**. The bot detector analyzes four behavioral dimensions: mouse movement (acceleration, curvature, jitter), scroll behavior (speed variability, pause distribution), click patterns (inter-click intervals, target accuracy), and navigation flow (page visit order, dwell time distribution). Each dimension produces a 0-1 human-likeness score. Scores below 0.3 on any dimension trigger automated classification. Combined scores below 0.5 across all dimensions yield high-confidence bot detection.

**Risk Score Computation**. The risk engine aggregates signals from fingerprinting (known bad fingerprints), geolocation (high-risk countries, VPN/Tor usage), external intelligence (AbuseIPDB confidence score, GreyNoise classification), and behavioral analysis (bot likelihood). Each signal contributes a weighted sub-score; the final score is clamped to 0-100 and mapped to classification levels: Low (0-25), Medium (26-50), High (51-75), Critical (76-100).

### 3.2 Data Structures

```elixir
defmodule PrismaticVisitorIntelligence.VisitorProfile do
  @type t :: %__MODULE__{
    session_id: String.t(),
    visitor_id: String.t(),
    fingerprint: Fingerprint.t(),
    geolocation: Geolocation.t(),
    behavior: BehaviorAnalysis.t(),
    risk_score: 0..100,
    risk_level: :low | :medium | :high | :critical,
    classification: :legitimate_user | :suspicious | :automated_scanner | :known_threat,
    threat_indicators: [ThreatIndicator.t()],
    first_seen: DateTime.t(),
    last_seen: DateTime.t()
  }
end
```

### 3.3 API Surface

```elixir
# Profile a visitor session
@spec profile(String.t()) :: {:ok, VisitorProfile.t()} | {:error, term()}
PrismaticVisitorIntelligence.profile(session_id)

# Assess threat level for a request
@spec assess_threat(Plug.Conn.t()) :: {:ok, ThreatAssessment.t()} | {:error, term()}
PrismaticVisitorIntelligence.assess_threat(request)

# Analyze behavioral patterns
@spec analyze_behavior(String.t()) :: {:ok, BehaviorAnalysis.t()} | {:error, term()}
PrismaticVisitorIntelligence.analyze_behavior(session_id)
# => {:ok, %BehaviorAnalysis{is_bot: false, bot_confidence: 0.12, behavioral_score: 92}}

# Detect anomalies across visitor population
@spec detect_anomalies(keyword()) :: {:ok, [Anomaly.t()]} | {:error, term()}
PrismaticVisitorIntelligence.detect_anomalies(timeframe: :last_hour, threshold: 2.0)

# Track visitor across sessions
@spec track_visitor(Plug.Conn.t()) :: {:ok, Session.t()} | {:error, term()}
PrismaticVisitorIntelligence.track_visitor(request)
```

### 3.4 Configuration

```elixir
config :prismatic_visitor_intelligence,
  # Risk scoring
  risk_weights: %{
    external_intelligence: 0.35,
    behavioral_analysis: 0.30,
    geolocation: 0.20,
    fingerprint: 0.15
  },
  classification_thresholds: %{low: 25, medium: 50, high: 75},

  # External sources
  enrichment_sources: [:abuseipdb, :greynoise, :shodan],
  enrichment_timeout: 5_000,

  # Behavioral analysis
  bot_detection_threshold: 0.5,
  behavioral_window: :timer.minutes(5),

  # Data retention
  session_retention: :timer.hours(24),
  visitor_retention: :timer.days(30)
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Web](/apps/prismatic-web/) | Dashboard hosting and LiveView components |
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | AbuseIPDB, GreyNoise, Shodan intelligence feeds |
| [Prismatic Cache](/apps/prismatic-cache/) | Intelligence query caching (reduces API costs) |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Visitor [metrics](/glossary/metrics/) and performance monitoring |
| [Prismatic Storage](/apps/prismatic-storage/) | Visitor data persistence |
| [Prismatic Auth](/apps/prismatic-auth/) | Dashboard access control |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Threat intelligence sharing |
| [Prismatic Signals](/apps/prismatic-signals/) | Visitor threat signals feed |
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Behavioral anomaly findings |

### 4.3 Inter-Process Communication

The dashboard receives updates via Phoenix PubSub on the `"hawkeye:visitor_update"` topic. External intelligence queries are dispatched as supervised tasks to avoid blocking the profiling pipeline. Risk assessments are cached in ETS for sub-microsecond retrieval on subsequent requests from the same visitor.

### 4.4 External Integrations

Three real-time threat intelligence feeds: AbuseIPDB (IP reputation scoring), GreyNoise (mass scanner identification), and Shodan (infrastructure fingerprinting). All queries pass through [Prismatic Resilience](/apps/prismatic-resilience/) [circuit breaker](/glossary/circuit-breaker/)s and [Prismatic Cache](/apps/prismatic-cache/).

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Fingerprint computation | < 5ms | Server-side hash of browser attributes |
| Geolocation lookup | < 2ms | Local MaxMind database |
| External enrichment (parallel) | 50-200ms | AbuseIPDB + GreyNoise + Shodan in parallel |
| Behavioral analysis | < 10ms | [Pattern matching](/glossary/pattern-matching/) on session events |
| Total profiling pipeline | < 100ms | End-to-end per request |
| Bot detection accuracy | 98.5% | Validated against labeled test set |

### 5.2 Scalability

Each visitor session is independently tracked in ETS, allowing horizontal scaling through load-balanced instances. External intelligence queries are cached for 1-24 hours depending on source, reducing API load. Behavioral analysis is stateless per session window, requiring no cross-instance coordination.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 512 MB | 2 GB (with session cache) |
| CPU | 2 cores | 4 cores (behavioral analysis) |
| Storage | 500 MB | 5 GB (with visitor history) |

## 6. Testing Strategy

### 6.1 Unit Tests

Each behavioral analyzer (mouse, scroll, click, navigation) has unit tests with known-human and known-bot behavioral samples. Risk engine tests verify score computation from predetermined signal combinations. Fingerprint tests verify consistent hashing across browser attribute variations.

### 6.2 Integration Tests

Full pipeline tests exercise the visitor profiling flow from HTTP request through enrichment and risk scoring. Tests use recorded visitor sessions (both human and automated) to verify end-to-end classification accuracy.

### 6.3 Property-Based Testing

StreamData generators produce random behavioral event sequences to verify that the risk engine always produces scores within the 0-100 range and that classification levels are consistent with score thresholds.

## 7. Security Considerations

### 7.1 Threat Model

Adversaries may attempt to evade detection by mimicking human behavioral patterns or spoofing fingerprints. Mitigations include multi-dimensional behavioral analysis (difficult to fake all dimensions simultaneously), external intelligence correlation (IP reputation is independent of browser behavior), and adaptive thresholds that adjust based on population-wide anomalies.

### 7.2 Access Control

Dashboard access requires `dashboard_access` and `hawkeye_read` permissions through [Prismatic Auth](/apps/prismatic-auth/). Visitor data is subject to configurable retention policies. No personally identifiable information beyond IP addresses is collected, and IPs are hashed after the retention period.

## 8. Operational Considerations

### 8.1 Deployment

HAWKEYE deploys as part of the main Prismatic Web application on port 4000. The browser-side JavaScript collector is served as a static asset. No additional infrastructure is required beyond the OSINT API credentials for enrichment sources.

### 8.2 Monitoring

Telemetry events cover visitor profiling latency (`[:prismatic, :hawkeye, :profile]`), bot detection rates (`[:prismatic, :hawkeye, :bot_detected]`), and enrichment source health (`[:prismatic, :hawkeye, :enrichment]`). The dashboard itself serves as the primary monitoring interface.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| High false positive rate | Bot detection threshold too aggressive | Adjust `bot_detection_threshold` upward |
| Slow profiling | External enrichment timeouts | Check OSINT source health; verify circuit breakers |
| Missing risk scores | Enrichment sources all failing | Verify API keys; check rate limits |
| Dashboard not updating | PubSub disconnection | Check WebSocket; restart LiveView mount |

## 9. Future Work

Planned enhancements include machine learning model integration for behavioral classification (replacing rule-based analysis), session replay for forensic investigation of high-risk visitors, integration with WAF systems for automated blocking, cross-property visitor correlation, and support for mobile application behavioral analysis.

## References

- [Prismatic Visitor Intelligence](/apps/prismatic-visitor-intelligence/) -- Extended implementation with code examples
- [Prismatic Hawkeye Web](/apps/prismatic-hawkeye-web/) -- Dashboard web interface
- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Intelligence source layer
- [AbuseIPDB](https://www.abuseipdb.com/) -- IP reputation database
- [GreyNoise](https://www.greynoise.io/) -- Internet noise and scanner identification
- [Shodan](https://www.shodan.io/) -- Internet-connected device search engine

## Related Agents

- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages threat alert routing, deduplication, and escalation for HAWKEYE visitor risk notifications
- [Competitor Researcher](/agents/competitor-researcher/) -- Provides competitive intelligence analysis that enriches visitor profiling with organizational context
- [Evolution Analyzer Specialist](/agents/evolution-analyzer-specialist/) -- Analyzes behavioral pattern evolution in visitor intelligence data over time

## Related Capabilities

- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Foundation for HAWKEYE's sub-100ms visitor profiling and live dashboard updates
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source intelligence fusion combining behavioral signals with external threat feeds
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Comprehensive event coverage for visitor profiling latency and bot detection metrics

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)