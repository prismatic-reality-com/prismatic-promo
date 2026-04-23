+++
title = "/perimeter-easm"
weight = 1450
[extra]
category = "Perimeter"
description = "Advanced EASM dashboard with security ratings (A-F)"
syntax = "/perimeter-easm [options]"
authority = "L3"
agent = "perimeter-scanner"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1309
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["perimeter-easm", "Advanced", "EASM", "commands", "Perimeter", "Prismatic Platform", "Phase"]
tags = ["commands", "perimeter", "perimeter-easm", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/perimeter-easm - Prismatic Platform"
+++

## Overview

**/perimeter-easm** is a production command in the **Perimeter** category of the Prismatic Platform that provides an advanced External Attack Surface Management dashboard with comprehensive [security rating](/glossary/security-rating/)s on an A-F grading scale. This command serves as the primary interface for organizations seeking to understand, monitor, and improve their external cybersecurity posture through continuous, automated assessment of all internet-facing assets and services.

The [EASM](/glossary/easm/) dashboard aggregates data from multiple reconnaissance and analysis engines within the [Prismatic Perimeter](/apps/prismatic-perimeter/) application to produce a unified view of an organization's external [attack surface](/glossary/attack-surface/). The security rating system evaluates assets across multiple dimensions -- including TLS configuration, DNS hygiene, email security, web application security headers, exposed services, and known vulnerability correlation -- to produce a numeric score between 300 and 900 that maps to a letter grade from A (excellent) to F (critical risk).

This command operates under the **L3** authority level, reflecting the elevated privileges required to access and interpret comprehensive attack surface data. It is executed by the `perimeter-scanner` agent and is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level ensures that only operators with sufficient security clearance can access the full scope of EASM intelligence, which may reveal sensitive information about organizational vulnerabilities.

The Prismatic EASM capability competes directly with commercial offerings from BitSight, SecurityScorecard, and Black Kite, but with the critical advantage of operating within a unified intelligence platform. Rather than existing as an isolated scoring service, `/perimeter-easm` feeds directly into compliance assessment, risk management, and incident response workflows across the Prismatic ecosystem.

## Architecture

The EASM dashboard architecture implements a multi-layer data collection and analysis pipeline built on OTP supervision trees for fault tolerance and concurrent processing.

```
Asset Discovery Layer          Analysis Layer              Presentation Layer
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ DNS Enumeration  │────>│ TLS Analyzer         │────>│ Security Scorecard  │
│ Certificate      │────>│ DNS Hygiene Checker  │────>│ Rating Dashboard    │
│   Transparency   │────>│ Email Security (SPF/ │────>│ Trend Visualization │
│ Port Scanner     │────>│   DKIM/DMARC)        │────>│ Asset Inventory     │
│ Cloud Asset      │────>│ Header Analyzer      │────>│ Risk Heatmap        │
│   Discovery      │────>│ CVE Correlator       │────>│ Compliance Overlay  │
│ WHOIS Resolver   │────>│ Reputation Checker   │────>│ Export Engine       │
└─────────────────┘     └──────────────────────┘     └─────────────────────┘
         │                        │                           │
         v                        v                           v
    ETS Asset Cache         Score Calculator            LiveView Dashboard
                           (Weighted Algorithm)         (Real-time Updates)
```

The scoring algorithm applies weighted evaluation across ten security domains. Each domain contributes to the overall score based on its relative risk importance. The weighting model is calibrated against industry benchmarks and regulatory requirements, ensuring that the resulting grades align with established cybersecurity maturity frameworks.

| Security Domain | Weight | Score Range | Key Indicators |
|----------------|--------|-------------|----------------|
| TLS/SSL Configuration | 15% | 0-100 | Protocol version, cipher strength, certificate validity |
| DNS Security | 12% | 0-100 | DNSSEC, CAA records, zone transfer protection |
| Email Security | 12% | 0-100 | SPF, DKIM, DMARC policies |
| Web Security Headers | 10% | 0-100 | CSP, HSTS, X-Frame-Options, permissions |
| Network Exposure | 15% | 0-100 | Open ports, unnecessary services, admin panels |
| Vulnerability Presence | 15% | 0-100 | Known CVEs, outdated software, patch status |
| Reputation | 8% | 0-100 | Blocklists, abuse reports, threat intelligence |
| Application Security | 8% | 0-100 | WAF presence, error handling, information leakage |
| Cloud Configuration | 5% | 0-100 | Storage exposure, misconfigurations, IAM issues |

## Usage

### Basic Security Assessment

```bash
# Full EASM assessment with security rating
/perimeter-easm

# Assess specific domain
/perimeter-easm --domain example.com

# Quick rating check without full dashboard
/perimeter-easm --domain example.com --quick-rating

# Assessment with industry benchmark comparison
/perimeter-easm --domain example.com --benchmark technology
```

### Dashboard Operations

```bash
# Launch interactive LiveView dashboard
/perimeter-easm --dashboard

# Dashboard with specific time range
/perimeter-easm --dashboard --range 90d

# Export dashboard snapshot
/perimeter-easm --dashboard --export pdf --output easm-report.pdf
```

### Monitoring and Alerting

```bash
# Continuous monitoring with drift detection
/perimeter-easm --monitor --interval 12h --alert-threshold B

# Set up rating regression alerts
/perimeter-easm --watch example.com --alert-on-downgrade --notify webhook

# Multi-domain monitoring
/perimeter-easm --domains domains.txt --monitor --parallel 5
```

### Competitive Analysis

```bash
# Compare ratings across multiple organizations
/perimeter-easm --compare "example.com,competitor1.com,competitor2.com"

# Industry percentile calculation
/perimeter-easm --domain example.com --percentile --industry financial
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--domain` | string | all discovered | Target domain for assessment |
| `--domains` | file | none | File containing domain list (one per line) |
| `--quick-rating` | flag | false | Rating only without full dashboard |
| `--dashboard` | flag | false | Launch interactive LiveView dashboard |
| `--benchmark` | enum | none | Industry benchmark: technology, financial, healthcare, government |
| `--range` | duration | 30d | Time range for trend visualization |
| `--monitor` | flag | false | Enable continuous monitoring |
| `--interval` | duration | 24h | Monitoring scan interval |
| `--alert-threshold` | grade | C | Alert when rating drops below grade |
| `--alert-on-downgrade` | flag | false | Alert on any grade downgrade |
| `--compare` | string | none | Comma-separated domains for comparison |
| `--percentile` | flag | false | Calculate industry percentile |
| `--industry` | enum | none | Industry vertical for percentile |
| `--parallel` | integer | 3 | Concurrent domain scanning limit |
| `--format` | enum | table | Output: table, json, html, pdf |
| `--export` | enum | none | Export format for dashboard |
| `--output` | path | stdout | Output file path |
| `--depth` | enum | standard | Scan depth: quick, standard, deep |
| `--notify` | enum | none | Notification channel: email, webhook, slack |

## Execution Flow

The EASM assessment follows a comprehensive multi-phase pipeline designed for thoroughness while maintaining performance targets.

**Phase 1 -- Asset Discovery** (5-30 seconds): The scanner performs passive and active reconnaissance to enumerate all internet-facing assets associated with the target domain. This includes DNS enumeration (A, AAAA, CNAME, MX, TXT, NS records), certificate transparency log queries, subdomain brute-forcing with smart wordlists, and reverse IP lookups. The discovery phase aims to identify the complete external footprint including shadow IT and forgotten assets.

**Phase 2 -- Service Enumeration** (10-60 seconds): For each discovered asset, the scanner identifies running services through port scanning and service fingerprinting. Service banners, version strings, and protocol behaviors are collected to build a detailed service inventory. This phase runs concurrently across multiple assets using OTP task supervision for fault isolation.

**Phase 3 -- Security Analysis** (5-20 seconds per domain): Each security domain is evaluated independently and concurrently. The TLS analyzer checks certificate chains, protocol versions, and cipher suites. The DNS hygiene checker validates DNSSEC deployment, CAA records, and zone transfer restrictions. The email security evaluator parses SPF, DKIM, and DMARC records. Web security headers are retrieved and evaluated against OWASP recommendations.

**Phase 4 -- Vulnerability Correlation** (2-10 seconds): Discovered services and their version information are correlated against known vulnerability databases. The CVE correlator identifies applicable vulnerabilities and assesses their exploitability in the context of the target's specific configuration.

**Phase 5 -- Score Calculation** (< 1 second): The weighted scoring algorithm aggregates individual domain scores into an overall security rating. The numeric score (300-900) is mapped to a letter grade and the industry percentile is calculated against the benchmark database.

**Phase 6 -- Dashboard Rendering** (< 1 second): Results are rendered into the requested output format. For interactive mode, the LiveView dashboard is launched with real-time data bindings.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Core Application | Asset discovery, scanning, and rating engine |
| [/perimeter-compliance](/commands/perimeter-compliance/) | Downstream | Security ratings feed compliance scoring |
| [/perimeter-assets](/commands/perimeter-assets/) | Data Sharing | Shared asset inventory and finding database |
| [Prismatic Web](/apps/prismatic-web/) | Dashboard | LiveView EASM dashboard at `/perimeter/easm` |
| [Prismatic Storage](/apps/prismatic-storage/) | Persistence | Historical ratings, trends, asset data |
| [Telemetry](/glossary/telemetry/) | Observability | Scan timing, asset counts, rating distributions |
| [Quality Gates](/glossary/quality-gates/) | Validation | Scan completeness and accuracy checks |
| [AIAD Registry](/glossary/aiad/) | Discovery | Command specification and routing |

## Best Practices

**Start with Discovery**: Before interpreting ratings, ensure the asset discovery phase is comprehensive. Run with `--depth deep` for the initial assessment to capture shadow IT and forgotten infrastructure that may represent the highest risk.

**Establish Monitoring Early**: Security ratings are most valuable as a trend indicator. Set up continuous monitoring from the first assessment so that improvements and regressions are tracked over time. The `--alert-on-downgrade` flag provides immediate notification of rating changes.

**Use Industry Benchmarks**: Raw scores are useful, but context matters. The `--benchmark` and `--percentile` options compare the organization's rating against industry peers, providing actionable context for executive reporting and board presentations.

**Address F-Grade Domains First**: When managing multiple domains, prioritize remediation on F-grade assets. These represent the highest risk and typically indicate critical misconfigurations (expired certificates, unpatched services, missing security headers) that can be remediated quickly.

**Integrate with Compliance**: Use the EASM rating data as input to [/perimeter-compliance](/commands/perimeter-compliance/) for regulatory framework alignment. Security ratings provide the technical evidence that compliance assessments require.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Domain not resolvable | Error with DNS diagnostic | Verify domain spelling and DNS configuration |
| Scan timeout | Partial results with warning | Use `--depth quick` or narrow scope |
| Rate limiting detected | Automatic backoff and retry | Increase `--interval` for monitoring |
| Asset discovery incomplete | Warning with discovered count | Re-run with `--depth deep` |
| Database unavailable | In-memory assessment only | Results not persisted to history |
| Invalid industry benchmark | Error with valid options | Use supported industry values |

## Advanced Usage

### API Integration

```bash
# Retrieve rating via REST API for dashboard integration
curl -H "Authorization: Bearer $TOKEN" \
  "https://prismatic-prod.fly.dev/api/v1/perimeter/security_rating?domain=example.com"

# Webhook notification on rating change
/perimeter-easm --watch example.com --notify webhook \
  --webhook-url "https://hooks.slack.com/services/xxx" \
  --alert-on-downgrade
```

### Batch Assessment

```bash
# Assess supply chain vendors
/perimeter-easm --domains vendor-list.txt --parallel 10 \
  --format json --output vendor-ratings.json

# Generate executive summary across all domains
/perimeter-easm --domains all --format pdf --summary executive
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every security domain must be evaluated for a rating to be issued. Partial assessments are clearly marked with confidence indicators and are never presented as definitive ratings.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Security ratings are derived exclusively from observed technical evidence. The [NABLA](/glossary/nabla-infinity/) axiom of Provenance Mandatory ensures every rating component is traceable to specific scan results and evidence artifacts.

## Related Commands

- [/perimeter](/commands/perimeter/) - External [attack surface](/glossary/attack-surface/) management dashboard and overview
- [/perimeter-assets](/commands/perimeter-assets/) - Asset inventory with domain, IP, certificate discovery
- [/perimeter-compliance](/commands/perimeter-compliance/) - [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) compliance assessment with gap analysis
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)