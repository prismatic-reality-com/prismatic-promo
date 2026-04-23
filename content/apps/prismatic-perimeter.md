+++
title = "Prismatic Perimeter"
weight = 1
[extra]
icon = "shield"
color = "red"
description = "External Attack Surface Management (EASM) with security ratings A-F"
category = "Security"
files = "847"
status = "Production"
port = "4003"
keywords = ["external attack surface management", "EASM security ratings", "NIS2 compliance assessment", "security scorecard alternative", "A-F security grading system", "BitSight competitor platform", "Czech ZKB compliance", "continuous security monitoring"]
tags = ["security", "easm", "compliance", "perimeter"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1566
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Perimeter - Prismatic Platform"
+++

## Abstract

Prismatic Perimeter is an External [Attack Surface](@/glossary/attack-surface.md) Management ([EASM](@/glossary/easm.md)) platform that discovers, inventories, and continuously monitors an organization's internet-facing assets to compute evidence-based [security rating](@/glossary/security-rating.md)s on a 300-900 numeric scale with A-F letter grades. The system integrates data from over 121 [OSINT](@/glossary/osint.md) intelligence sources, applies multi-factor scoring algorithms grounded in the NABLA epistemic framework, and assesses compliance against the [NIS2](@/glossary/nis2.md) Directive (EU 2022/2555) and Czech [ZKB](@/glossary/zkb.md) (264/2025 Sb.) regulatory frameworks. Positioned competitively against BitSight, Black Kite, and SecurityScorecard, Prismatic Perimeter delivers its assessments through a real-time [Phoenix LiveView](@/glossary/phoenix-liveview.md) dashboard, a RESTful API, and structured compliance reports. The architecture follows a three-layer separation of concerns -- core business logic, web presentation, and intelligence collection -- enabling independent scaling and testing of each layer.

## 1. Introduction

### 1.1 Problem Statement

Organizations face an expanding and increasingly opaque external attack surface. Cloud migrations, shadow IT, SaaS sprawl, certificate proliferation, and acquisitions introduce internet-facing assets that security teams cannot enumerate manually. Traditional vulnerability management operates from the inside out; EASM inverts this perspective, assessing an organization as an attacker would see it from the outside. Without continuous external monitoring, organizations discover exposures only after exploitation, compliance audits, or third-party breach notifications -- all of which carry significant operational and reputational cost.

The European regulatory landscape compounds this challenge. The NIS2 Directive imposes cybersecurity risk management obligations on essential and important entities across 18 sectors, while the Czech ZKB (264/2025 Sb.) transposes NIS2 into national law with additional Czech-specific requirements including NUKIB registration and Czech-language documentation. Organizations need automated tooling that maps external exposure directly to regulatory control requirements.

### 1.2 Design Goals

1. **Comprehensive asset discovery** -- enumerate all internet-facing assets (domains, subdomains, IPs, certificates, cloud resources, services) using passive and active reconnaissance.
2. **Evidence-based security ratings** -- compute scores from verifiable evidence rather than heuristic guesses, with full provenance tracing through [NABLA axioms](@/capabilities/nabla-axioms.md).
3. **Regulatory compliance mapping** -- automatically assess NIS2 and ZKB compliance from external evidence, generating audit-ready reports.
4. **[Real-time monitoring](@/capabilities/real-time-monitoring.md)** -- detect changes to the attack surface within hours through continuous OSINT source polling and change detection.
5. **Industry benchmarking** -- provide percentile rankings against industry peers for meaningful comparative assessment.
6. **Separation of concerns** -- isolate scoring algorithms, web presentation, and data collection into independently deployable [OTP](@/glossary/otp.md) applications.

### 1.3 Scope

Prismatic Perimeter covers external attack surface assessment only. Internal vulnerability scanning, endpoint detection and response, and internal network monitoring are explicitly out of scope. The system assesses organizations from an external vantage point using publicly available data and authorized active scanning.

## 2. Architecture

### 2.1 System Design

The Perimeter subsystem is decomposed into three OTP applications within the Prismatic umbrella:

```
                         +---------------------------+
                         |   Prismatic Perimeter     |
                         |   (Facade / Orchestrator) |
                         +---------------------------+
                                |          |
                   +------------+          +------------+
                   |                                    |
      +------------------------+        +------------------------+
      | Prismatic Perimeter    |        | Prismatic Perimeter    |
      | Core                   |        | Web                    |
      | (Business Logic)       |        | (LiveView Dashboard)   |
      +------------------------+        +------------------------+
              |       |                         |
      +-------+-------+-------+         +------+------+
      |       |       |       |         | Phoenix     |
      | Score | Compl | Risk  |         | LiveView    |
      | Engine| iance | Model |         | Components  |
      +-------+-------+-------+         +-------------+
              |
      +-------+--------+--------+--------+
      | Shodan | Censys | crt.sh | ARES   | ...121+ sources
      +--------+--------+--------+--------+
```

The facade module `PrismaticPerimeter` provides the public API, delegating to `PrismaticPerimeterCore` for computation and `PrismaticPerimeterWeb` for presentation. This separation allows the scoring engine to be invoked from the [REST API](@/glossary/rest-api.md), CLI, or agent system without loading web dependencies.

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticPerimeter` | Public facade: `discover/1`, `security_rating/1`, `assess_compliance/2` |
| `PrismaticPerimeterCore.ScoreEngine` | Multi-factor security score computation (300-900 scale) |
| `PrismaticPerimeterCore.ComplianceEngine` | NIS2 and ZKB control assessment from external evidence |
| `PrismaticPerimeterCore.RiskModel` | Evidence-weighted risk aggregation with NABLA confidence |
| `PrismaticPerimeterCore.AssetDiscovery` | Asset enumeration orchestration across OSINT sources |
| `PrismaticPerimeterCore.GradeMapper` | Numeric score to A-F letter grade conversion with thresholds |
| `PrismaticPerimeterCore.Benchmarker` | Industry percentile computation from historical data |
| `PrismaticPerimeterWeb.DashboardLive` | Main LiveView dashboard at `/perimeter` |
| `PrismaticPerimeterWeb.AssetsLive` | Asset inventory with filtering at `/perimeter/assets` |
| `PrismaticPerimeterWeb.ComplianceLive` | Compliance detail view at `/perimeter/compliance` |
| `PrismaticPerimeterWeb.EasmLive` | Advanced EASM dashboard at `/perimeter/easm` |

### 2.3 Process Topology

```
PrismaticPerimeter.Application (Supervisor, :one_for_one)
+-- PrismaticPerimeterCore.ScoreEngine (GenServer)
|     Maintains score computation state, caches recent computations
+-- PrismaticPerimeterCore.AssetDiscovery.Scheduler (GenServer)
|     Schedules periodic discovery sweeps per monitored entity
+-- PrismaticPerimeterCore.ComplianceEngine (GenServer)
|     Manages compliance framework rule sets and assessment state
+-- PrismaticPerimeterCore.Benchmarker (GenServer)
|     Computes and caches industry percentile data
+-- PrismaticPerimeterCore.ChangeDetector (GenServer)
|     Monitors asset state changes between discovery cycles
+-- Task.Supervisor
      Supervises concurrent OSINT query tasks during discovery
```

All GenServers follow the `:one_for_one` restart strategy. The `Task.Supervisor` isolates concurrent OSINT queries so that a single source timeout does not cascade to other queries.

### 2.4 Data Flow

```
Entity (domain) --> AssetDiscovery.Scheduler
                         |
                    [Parallel OSINT Queries]
                    |    |    |    |    |
                Shodan Censys crt.sh DNS WHOIS ...
                    |    |    |    |    |
                    +----+----+----+----+
                         |
                    Evidence Aggregation
                         |
                  +------+------+
                  |             |
             ScoreEngine  ComplianceEngine
                  |             |
             SecurityRating  ComplianceReport
                  |             |
              GradeMapper   RiskModel
                  |             |
              Benchmarker  ChangeDetector
                  |             |
              Dashboard    Alert System
```

## 3. Implementation

### 3.1 Key Algorithms

**Security Score Computation**. The scoring algorithm evaluates 12 security dimensions, each producing a sub-score on a 0-100 scale. Sub-scores are weighted by risk significance and aggregated into a composite score mapped to the 300-900 range:

- DNS security (DNSSEC, CAA records, SPF/DKIM/DMARC)
- [TLS](@/glossary/tls.md) configuration ([protocol](@/glossary/protocol.md) version, cipher strength, certificate validity)
- HTTP security headers (HSTS, CSP, X-Frame-Options)
- Open port exposure (unnecessary services, high-risk ports)
- Vulnerability presence (CVEs on detected services)
- Email security (SPF, DKIM, DMARC alignment)
- Web application security (known CMS vulnerabilities, WAF presence)
- Patching cadence (time from [CVE](@/glossary/cve.md) disclosure to remediation)
- Information leakage (exposed admin panels, directory listings)
- Cloud configuration (S3 bucket exposure, metadata services)
- Reputation data (presence on blocklists, abuse reports)
- Certificate management (expiry proximity, chain completeness)

**Grade Mapping**. Numeric scores map to letter grades via configurable thresholds: A (810-900), B (720-809), C (630-719), D (540-629), F (300-539).

### 3.2 Data Structures

```elixir
defmodule PrismaticPerimeterCore.SecurityRating do
  @type t :: %__MODULE__{
    entity: String.t(),
    score: 300..900,
    grade: :A | :B | :C | :D | :F,
    industry_percentile: 0..100,
    dimensions: %{atom() => dimension_score()},
    evidence: [Evidence.t()],
    confidence: float(),
    computed_at: DateTime.t(),
    trend: :improving | :stable | :declining
  }

  defstruct [:entity, :score, :grade, :industry_percentile,
             :dimensions, :evidence, :confidence, :computed_at, :trend]
end
```

### 3.3 API Surface

```elixir
# Discover external attack surface for a domain
@spec discover(String.t(), keyword()) :: {:ok, AttackSurface.t()} | {:error, term()}
PrismaticPerimeter.discover("example.com", depth: :full)
# => {:ok, %AttackSurface{
#   domains: ["example.com", "www.example.com", "api.example.com"],
#   ip_addresses: ["93.184.216.34"],
#   certificates: [%Certificate{subject: "*.example.com", expires: ~U[2026-06-15]}],
#   services: [%Service{port: 443, protocol: :https, version: "nginx/1.25"}],
#   technologies: ["nginx", "Let's Encrypt"],
#   discovery_time_ms: 4_520
# }}

# Compute security rating
@spec security_rating(String.t(), keyword()) :: {:ok, SecurityRating.t()} | {:error, term()}
PrismaticPerimeter.security_rating("example.com")
# => {:ok, %SecurityRating{
#   score: 780, grade: :B, industry_percentile: 72,
#   dimensions: %{tls: 95, dns: 82, headers: 70, ports: 88, ...},
#   confidence: 0.91, trend: :improving
# }}

# Assess compliance against regulatory frameworks
@spec assess_compliance(String.t(), [atom()]) :: {:ok, ComplianceAssessment.t()} | {:error, term()}
PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])
# => {:ok, %ComplianceAssessment{
#   frameworks: %{
#     nis2: %{score: 72, status: :partially_compliant, controls: 42},
#     zkb: %{score: 68, status: :partially_compliant, controls: 38}
#   },
#   remediation_items: [...],
#   evidence_count: 156
# }}
```

### 3.4 Configuration

```elixir
config :prismatic_perimeter,
  # Score computation
  grade_thresholds: %{A: 810, B: 720, C: 630, D: 540},
  dimension_weights: %{
    tls: 1.2, dns: 1.0, headers: 0.8, ports: 1.1,
    vulnerabilities: 1.5, email: 0.7, patching: 1.3,
    leakage: 0.9, cloud: 1.0, reputation: 0.8, certificates: 0.9
  },

  # Discovery configuration
  discovery_sources: [:shodan, :censys, :crtsh, :dns, :whois, :securitytrails],
  discovery_timeout: 30_000,
  max_concurrent_sources: 10,

  # Monitoring
  monitoring_interval: :timer.hours(6),
  change_notification_threshold: :medium
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | Source data for asset discovery and evidence collection |
| [Prismatic OSINT Network](@/apps/prismatic-osint-network.md) | IP, DNS, and infrastructure intelligence |
| [Prismatic Algorithms](@/apps/prismatic-algorithms.md) | Security score computation primitives |
| [Prismatic Nabla](@/apps/prismatic-nabla.md) | Epistemic confidence in ratings and assessments |
| [Prismatic Compliance](@/apps/prismatic-compliance.md) | NIS2 and ZKB framework definitions |
| [Prismatic Cache](@/apps/prismatic-cache.md) | OSINT query result caching (reduces API costs) |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Rating history and asset persistence |
| [Prismatic Resilience](@/apps/prismatic-resilience.md) | [Circuit breaker](@/glossary/circuit-breaker.md)s for OSINT source failures |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Web](@/apps/prismatic-web.md) | Dashboard route hosting |
| [Prismatic API](@/apps/prismatic-api.md) | REST endpoint exposure |
| [Prismatic Presales](@/apps/prismatic-presales.md) | Demo environment data |
| [Prismatic Compliance](@/apps/prismatic-compliance.md) | Evidence from perimeter scans feeds compliance |

### 4.3 Inter-Process Communication

The Perimeter subsystem communicates with other applications via Phoenix [PubSub](@/glossary/pubsub.md) for event broadcasting, direct [GenServer](@/glossary/genserver.md) calls for synchronous queries, and [ETS](@/glossary/ets.md) for shared cached state. Discovery results are broadcast on the `"perimeter:discovery"` PubSub topic. Rating changes are broadcast on `"perimeter:rating_change"`.

### 4.4 External Integrations

The system queries 121+ external OSINT sources through the [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) adapter layer. Key external services include [Shodan](@/glossary/shodan.md) (host intelligence), [Censys](@/glossary/censys.md) (certificate and host data), crt.sh ([certificate transparency](@/glossary/certificate-transparency.md)), SecurityTrails (DNS history), VirusTotal (reputation), and AbuseIPDB (IP reputation). All external calls pass through [Prismatic Resilience](@/apps/prismatic-resilience.md) circuit breakers and [Prismatic Cache](@/apps/prismatic-cache.md) for [fault tolerance](@/glossary/fault-tolerance.md) and cost optimization.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Full discovery (single domain) | 4-8 seconds | Parallel OSINT queries, 10 concurrent sources |
| Security rating computation | 200-500ms | From cached evidence; excludes discovery |
| Compliance assessment (NIS2 + ZKB) | 300-800ms | 80 combined controls evaluated |
| Dashboard initial load | < 100ms | Server-rendered LiveView |
| Dashboard live update | < 10ms | [WebSocket](@/glossary/websocket.md) push via PubSub |

### 5.2 Scalability

Discovery workloads scale horizontally through Task.[Supervisor](@/glossary/supervisor.md) fan-out. Each monitored entity runs an independent discovery pipeline, limited only by OSINT source rate limits and available process slots. The scoring engine is CPU-bound and scales vertically with additional cores. Dashboard connections scale through Phoenix PubSub, which supports millions of concurrent WebSocket connections.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 512 MB | 2 GB (with discovery cache) |
| CPU | 2 cores | 4 cores (for concurrent discovery) |
| Storage | 1 GB | 10 GB (with historical ratings) |
| Network | Outbound HTTPS to OSINT sources | Low bandwidth (API queries) |

## 6. Testing Strategy

### 6.1 Unit Tests

Each scoring dimension has dedicated unit tests verifying score computation from known evidence inputs. Grade mapping tests cover boundary conditions at every threshold. Compliance control tests verify correct pass/fail/partial assessment for each NIS2 and ZKB control.

### 6.2 Integration Tests

Cross-application tests verify the full pipeline from OSINT source query through evidence aggregation, score computation, and dashboard rendering. Mock OSINT responses are used for deterministic testing while preserving the full processing pipeline.

### 6.3 Property-Based Testing

StreamData generators produce random evidence sets to verify scoring algorithm invariants: scores always fall within 300-900, grades are monotonically ordered, and confidence scores decrease appropriately when evidence is sparse.

## 7. Security Considerations

### 7.1 Threat Model

The primary threat is manipulation of external evidence to inflate or deflate security ratings. Mitigations include multi-source corroboration (NABLA [Signal Plurality](@/glossary/signal-plurality.md) axiom), temporal consistency checks, and anomaly detection on sudden score changes. Rating computation is deterministic from evidence, preventing operator manipulation.

### 7.2 Access Control

Dashboard access requires authentication through [Prismatic Auth](@/apps/prismatic-auth.md) with the `perimeter_read` permission. Discovery operations require `perimeter_scan`. API access requires a valid API key with appropriate permissions. All access is logged to the [Prismatic Audit](@/apps/prismatic-audit.md) trail.

## 8. Operational Considerations

### 8.1 Deployment

The Perimeter subsystem deploys as part of the Prismatic umbrella [release](@/glossary/release.md). The web dashboard is served on port 4003. Discovery scheduling begins automatically on application start. No manual configuration is required beyond OSINT API credentials.

### 8.2 Monitoring

[Telemetry](@/glossary/telemetry.md) events are emitted for discovery operations (`[:prismatic, :perimeter, :discovery]`), rating computations (`[:prismatic, :perimeter, :rating]`), and compliance assessments (`[:prismatic, :perimeter, :compliance]`). Key [metrics](@/glossary/metrics.md) include discovery latency, source availability, score distribution, and compliance coverage.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Discovery timeout | OSINT source [rate limiting](@/glossary/rate-limiting.md) | Check source rate limits; verify API keys |
| Low confidence scores | Insufficient evidence | Add more OSINT sources; check source health |
| Stale ratings | Discovery scheduler stopped | Verify scheduler GenServer is running |
| Dashboard not updating | PubSub disconnection | Check WebSocket connection; restart LiveView |

## 9. Future Work

Planned enhancements include active scanning capabilities (with opt-in authorization), historical rating comparison across organizations, automated remediation recommendations with effort estimates, integration with vulnerability management platforms for patching feedback loops, and expansion of [compliance framework](@/glossary/compliance-framework.md)s to include [ISO 27001](@/glossary/iso-27001.md) and SOC 2.

## References

- [Prismatic Perimeter Core](@/apps/prismatic-perimeter-core.md) -- Business logic module
- [Prismatic Perimeter Web](@/apps/prismatic-perimeter-web.md) -- LiveView dashboard
- [Prismatic Compliance](@/apps/prismatic-compliance.md) -- NIS2/ZKB framework definitions
- [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) -- Intelligence source layer
- [NIS2 Directive (EU 2022/2555)](https://eur-lex.europa.eu/eli/dir/2022/2555) -- EU cybersecurity directive
- [ZKB 264/2025 Sb.](https://www.nukib.cz/) -- Czech cybersecurity act
- [BitSight](https://www.bitsight.com/) -- Competitive reference: security ratings
- [SecurityScorecard](https://securityscorecard.com/) -- Competitive reference: security ratings

## Related Agents

- [CER Compliance Commander](@/agents/cer-compliance-commander.md) -- Drives NIS2 Directive and ZKB compliance assessment with article-level regulatory mapping
- [Competitor Researcher](@/agents/competitor-researcher.md) -- Provides competitive positioning analysis against BitSight, Black Kite, and SecurityScorecard
- [GitLab Security Specialist Agent](@/agents/gitlab-security-specialist-agent.md) -- Integrates security findings from CI/CD pipelines into attack surface monitoring

## Related Capabilities

- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Continuous OSINT source polling with change detection for attack surface surveillance
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Evidence-based security ratings from 121+ OSINT sources with multi-factor scoring
- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Ratings grounded in epistemic axioms with provenance tracing and confidence scoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)