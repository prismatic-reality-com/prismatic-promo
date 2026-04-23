+++
title = "/perimeter"
weight = 1420
[extra]
category = "Perimeter"
description = "External attack surface management dashboard and overview"
syntax = "/perimeter [options]"
authority = "L2+"
agent = "perimeter-scanner"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1212
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["perimeter", "External", "commands", "Prismatic Platform", "Phase", "EASM"]
tags = ["commands", "perimeter", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/perimeter - Prismatic Platform"
+++

## Overview

**/perimeter** is the primary production command in the **Perimeter** category of the Prismatic Platform, providing the central dashboard and command interface for External [Attack Surface](@/glossary/attack-surface.md) Management (EASM). This command serves as the entry point for all perimeter security operations, offering a unified view of an organization's internet-facing assets, their security posture, compliance status, and risk exposure across the entire external footprint.

The Perimeter module represents one of the platform's most strategically significant capabilities, competing directly with commercial EASM vendors such as BitSight, SecurityScorecard, and Black Kite. By integrating EASM functionality within the broader Prismatic intelligence ecosystem, the `/perimeter` command delivers contextual security intelligence that standalone EASM products cannot match. Asset discoveries feed into [OSINT](@/glossary/osint.md) investigations, security ratings inform compliance assessments, and risk findings correlate with threat intelligence -- all within a single operational workflow.

This command operates under the **L2+** authority level and is executed by the `perimeter-scanner` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The `/perimeter` command acts as the orchestration hub for all sub-commands in the Perimeter category, including [/perimeter-assets](@/commands/perimeter-assets.md), [/perimeter-compliance](@/commands/perimeter-compliance.md), and [/perimeter-easm](@/commands/perimeter-easm.md).

The dashboard presents key [metrics](@/glossary/metrics.md) at a glance: total discovered assets, overall security rating (A-F with numeric score 300-900), compliance posture against [NIS2](@/glossary/nis2.md) and [ZKB](@/glossary/zkb.md), critical findings requiring immediate attention, and trend indicators showing security posture changes over time. This executive-level overview enables rapid situational awareness while providing drill-down paths to detailed analysis through the specialized sub-commands.

## Architecture

The Perimeter dashboard architecture is built on the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) OTP application, which manages the full lifecycle of external attack surface monitoring through a supervision tree of specialized worker processes.

```
/perimeter Command
       │
       v
Perimeter Dashboard Controller
       │
       ├── Asset Summary Aggregator ──> ETS Asset Cache
       │         │
       │         v
       ├── Security Rating Widget ──> Score Calculator
       │         │
       │         v
       ├── Compliance Widget ──────> Compliance Engine
       │         │
       │         v
       ├── Critical Findings Feed ──> Finding Correlator
       │         │
       │         v
       └── Trend Analyzer ─────────> TimeSeries Storage
                 │
                 v
          LiveView Dashboard (Phoenix)
          Route: /perimeter
```

The dashboard is rendered as a Phoenix LiveView page, enabling real-time updates without page reloads. When new scan results arrive, the dashboard widgets update automatically through PubSub event broadcasting. This real-time architecture ensures that operators always see the most current security posture data.

The data layer implements a multi-tier caching strategy: ETS for hot data (current scan results, active findings), PostgreSQL for historical data (trends, baselines, audit trails), and Meilisearch for full-text search across asset metadata and finding descriptions. This architecture ensures sub-100ms response times for dashboard rendering while maintaining complete historical records for trend analysis and compliance auditing.

## Usage

### Dashboard Operations

```bash
# Launch main perimeter dashboard
/perimeter

# Dashboard for specific domain
/perimeter --domain example.com

# Dashboard with time range filter
/perimeter --range 90d

# Executive summary view
/perimeter --view executive
```

### Discovery Operations

```bash
# Discover external attack surface for a domain
/perimeter --discover example.com

# Discovery with deep scan
/perimeter --discover example.com --depth deep

# Discover and immediately assess
/perimeter --discover example.com --assess --rate
```

### Monitoring Operations

```bash
# Enable continuous perimeter monitoring
/perimeter --monitor --interval 6h

# Monitor with alert configuration
/perimeter --monitor --alert-critical --notify email

# Check current monitoring status
/perimeter --status
```

### Reporting

```bash
# Generate comprehensive perimeter report
/perimeter --report --format pdf --output perimeter-report.pdf

# Weekly executive summary
/perimeter --report --type executive --range 7d

# Detailed technical report with evidence
/perimeter --report --type technical --evidence --format html
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--domain` | string | all | Target domain for scoping |
| `--discover` | string | none | Domain to discover attack surface for |
| `--depth` | enum | standard | Discovery depth: quick, standard, deep |
| `--assess` | flag | false | Run security assessment after discovery |
| `--rate` | flag | false | Calculate security rating |
| `--view` | enum | full | Dashboard view: full, executive, technical, assets |
| `--range` | duration | 30d | Time range for trend data |
| `--monitor` | flag | false | Enable continuous monitoring |
| `--interval` | duration | 24h | Monitoring scan interval |
| `--alert-critical` | flag | false | Alert on critical findings |
| `--notify` | enum | none | Notification: email, webhook, slack |
| `--report` | flag | false | Generate report |
| `--type` | enum | full | Report type: full, executive, technical, compliance |
| `--format` | enum | table | Output: table, json, html, pdf |
| `--output` | path | stdout | Output file path |
| `--status` | flag | false | Show monitoring status |
| `--evidence` | flag | false | Include evidence artifacts |

## Execution Flow

The `/perimeter` command follows different execution paths depending on the operation mode selected.

**Dashboard Mode (default)**: When invoked without specific action flags, the command loads the Perimeter dashboard. Phase 1 retrieves the current asset inventory summary from the ETS cache (< 10ms). Phase 2 loads the current security rating and compliance status (< 50ms). Phase 3 queries critical findings sorted by severity and recency (< 30ms). Phase 4 calculates trend indicators from historical data (< 100ms). Phase 5 renders the LiveView dashboard with all widgets populated (< 100ms total server-side render time, compliant with the platform's 100ms render target).

**Discovery Mode** (`--discover`): Phase 1 initiates passive reconnaissance (DNS enumeration, certificate transparency, WHOIS). Phase 2 performs active reconnaissance (port scanning, service fingerprinting, web crawling). Phase 3 correlates discovered assets with existing inventory. Phase 4 calculates delta from previous discovery. Phase 5 persists new assets and generates discovery report. Total time varies by domain complexity: 30 seconds for simple domains to 5 minutes for large enterprise footprints.

**Monitoring Mode** (`--monitor`): Configures a recurring scan schedule through the OTP scheduler. Each monitoring cycle executes a standard discovery and assessment pipeline, comparing results against the previous cycle to detect changes. New assets, removed assets, and rating changes trigger alerts according to the configured notification policy.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Core Application | Full EASM engine and data layer |
| [Prismatic Web](@/apps/prismatic-web.md) | Dashboard | LiveView page at `/perimeter` route |
| [/perimeter-assets](@/commands/perimeter-assets.md) | Sub-command | Detailed asset management |
| [/perimeter-compliance](@/commands/perimeter-compliance.md) | Sub-command | Regulatory compliance assessment |
| [/perimeter-easm](@/commands/perimeter-easm.md) | Sub-command | Advanced EASM with security ratings |
| [/investigate](@/commands/investigate.md) | Cross-domain | Feed discovered assets into OSINT |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Persistence | Asset history, findings, trends |
| [Telemetry](@/glossary/telemetry.md) | Observability | Dashboard render times, scan metrics |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | `perimeter-scanner` agent orchestration |

The `/perimeter` command also serves as a navigation hub within the LiveView interface. The dashboard page includes links to all Perimeter sub-views: asset inventory (`/perimeter/assets`), compliance dashboard (`/perimeter/compliance`), and advanced EASM dashboard (`/perimeter/easm`). These routes are implemented as Phoenix LiveView pages within the [Prismatic Web](@/apps/prismatic-web.md) application.

## Best Practices

**Start with Discovery**: Before interpreting any security metrics, ensure the asset inventory is comprehensive. Run `/perimeter --discover example.com --depth deep` for the initial assessment. Shadow IT and forgotten assets often represent the highest risk and are only found through thorough discovery.

**Enable Monitoring Early**: The value of EASM increases dramatically with continuous monitoring. Configure `/perimeter --monitor` during initial setup to begin tracking attack surface changes from day one. Even a 24-hour monitoring interval catches most significant changes.

**Use the Executive View for Stakeholder Communication**: The `--view executive` option renders a board-friendly summary with clear risk indicators, trend arrows, and plain-language descriptions. This view is designed for non-technical stakeholders who need to understand security posture without deep technical context.

**Correlate with Intelligence**: The Perimeter module is most powerful when used in conjunction with the Intelligence commands. Discovered assets can be fed into [/investigate](@/commands/investigate.md) for deeper OSINT analysis, creating a comprehensive intelligence picture that no standalone EASM tool can match.

**Maintain Baseline Discipline**: Export a baseline report after each significant remediation effort. This creates an audit trail of security improvements and provides evidence for compliance assessments and management reporting.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| No domains configured | Prompt for domain input | Add domain via `--discover` |
| Scanner timeout | Partial results with warnings | Reduce `--depth` or narrow scope |
| Database unavailable | Dashboard shows cached data | Cache staleness indicator shown |
| Rate limiting by targets | Automatic backoff | Increase scan interval |
| LiveView connection lost | Auto-reconnect with stale indicator | Browser refresh if persistent |
| Invalid domain format | Validation error with format guidance | Correct domain syntax |

## Advanced Usage

### Programmatic Access

```elixir
# Discover attack surface programmatically
{:ok, surface} = PrismaticPerimeter.discover("example.com")

# Get security rating
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")
# => %{grade: :B, score: 780, industry_percentile: 72}

# Assess compliance
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])
```

### REST API Access

```bash
# Discover via REST API
curl -X POST https://prismatic-prod.fly.dev/api/v1/perimeter/discover \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'

# Get current rating
curl https://prismatic-prod.fly.dev/api/v1/perimeter/security_rating?domain=example.com
```

### Supply Chain Risk Assessment

```bash
# Assess vendor attack surfaces
/perimeter --discover vendor1.com,vendor2.com,vendor3.com \
  --assess --rate --compare --format pdf --output supply-chain-risk.pdf
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Asset discovery must be thorough -- no known discovery technique is skipped. Security ratings are never inflated. Findings are reported without minimization.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every discovered asset is verified before inclusion in the inventory. Security ratings are derived from observed evidence, not assumptions. The [NABLA](@/glossary/nabla-infinity.md) framework's Signal Plurality axiom ensures that findings are corroborated across multiple data sources.

## Related Commands

- [/perimeter-assets](@/commands/perimeter-assets.md) - Asset inventory with domain, IP, certificate discovery
- [/perimeter-compliance](@/commands/perimeter-compliance.md) - [NIS2](@/glossary/nis2.md) and [ZKB](@/glossary/zkb.md) compliance assessment with gap analysis
- [/perimeter-easm](@/commands/perimeter-easm.md) - Advanced EASM dashboard with [security rating](@/glossary/security-rating.md)s (A-F)
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)