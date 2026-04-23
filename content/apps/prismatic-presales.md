+++
title = "Prismatic Presales"
weight = 54
[extra]
icon = "currency-dollar"
color = "emerald"
description = "Presales intelligence and demo environment for customer engagements"
category = "Business"
files = "145"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1056
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Presales", "apps", "Business", "Prismatic Platform", "PrismaticPresales", "Demo"]
tags = ["apps", "business", "prismatic-presales", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Presales - Prismatic Platform"
+++

## Overview

Prismatic Presales provides tooling for customer demonstrations, proof-of-concept deployments, and presales intelligence gathering. It generates tailored demo environments showcasing platform capabilities against prospect-relevant scenarios, and supports the sales process with automated competitive intelligence. Unlike static demo scripts, Presales dynamically provisions isolated [Phoenix LiveView](/glossary/phoenix-liveview/) instances populated with prospect-specific data, allowing sales engineers to demonstrate real platform functionality rather than slide decks. The module embodies the platform's philosophy that the best way to sell security intelligence is to demonstrate it against the prospect's own infrastructure.

The module draws on the platform's [OSINT](/glossary/osint/) capabilities to enrich the presales process itself. Before a customer engagement, Presales automatically collects publicly available information about the prospect's domain, technology stack, and [security rating](/glossary/security-rating/) using [Prismatic Perimeter](/apps/prismatic-perimeter/) scanning. This means the first demo already shows real findings for the prospect's own [attack surface](/glossary/attack-surface/), making the value proposition immediately tangible. The [NABLA](/glossary/nabla-infinity/) framework's [confidence scoring](/glossary/confidence-scoring/) ensures that every finding presented to prospects includes epistemic rigor -- no unsupported claims, no inflated severity, no false positives that would undermine credibility.

Presales also maintains a competitive intelligence [knowledge graph](/glossary/knowledge-graph/) that tracks feature releases, pricing changes, and public evaluations of competitors including BitSight, Black Kite, and SecurityScorecard. This intelligence feeds directly into proposal generation, ensuring comparison matrices are always current and evidence-based.

## Architecture

```
Prospect Onboard --> OSINT Scan --> Demo Provisioning --> Live Demo --> Proposal
       |               |              |                 |           |
  Domain Input    Perimeter API    Fly.io Instance    LiveView    PDF/HTML
  Requirements    Tech Stack       Isolated DB        Real Data   ROI Model
  Industry Tag    Security Scan    Seed Data          Scenarios   Comparison
  Contact Map     Competitor DB    Config Apply       Findings    Timeline
```

Presales follows a three-layer architecture. The **Demo Engine** manages isolated [Fly.io](/glossary/fly-io/) instances with time-limited lifespans, each running a stripped-down platform deployment with prospect-specific configuration. The **Intelligence Layer** aggregates competitive data from OSINT sources, analyst reports, and public API documentation into a structured knowledge base stored in [Prismatic Storage](/apps/prismatic-storage/). The **Proposal Generator** combines templates, prospect intelligence, and competitive positioning into formatted deliverables.

Demo instances are supervised by a `DynamicSupervisor` with automatic teardown after the configured expiry period, preventing resource leaks. Each instance runs under [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/) management with [Telemetry](/glossary/telemetry/) instrumentation for usage tracking.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticPresales` | Public facade: `create_demo/1`, `compare/1`, `generate_proposal/1`, `prospect_scan/1` |
| `PrismaticPresales.Application` | OTP application entry point with DynamicSupervisor for demo instances |
| `PrismaticPresales.DemoEngine` | Isolated demo instance provisioning, configuration, and lifecycle management |
| `PrismaticPresales.ProspectScanner` | Automated prospect domain reconnaissance using Perimeter scanning |
| `PrismaticPresales.CompetitiveIntel` | Competitive intelligence knowledge graph maintenance and querying |
| `PrismaticPresales.ProposalGenerator` | Template-based proposal document generation with ROI modeling |
| `PrismaticPresales.ComparisonMatrix` | Feature comparison matrix generation against competitor products |
| `PrismaticPresales.RoiModel` | Return-on-investment calculation engine based on prospect parameters |
| `PrismaticPresales.InstanceManager` | Demo instance lifecycle management with automatic teardown and monitoring |

## Key Features

### Demo Environment

The Demo Engine provisions isolated instances that showcase real platform functionality against prospect-specific data:

```elixir
defmodule PrismaticPresales.DemoEngine do
  @spec provision(keyword()) :: {:ok, DemoInstance.t()} | {:error, term()}
  def provision(opts) do
    prospect = Keyword.fetch!(opts, :prospect)
    scenario = Keyword.get(opts, :scenario, :easm_security_rating)
    duration = Keyword.get(opts, :duration, :days_14)

    with {:ok, scan_results} <- ProspectScanner.scan(prospect),
         {:ok, instance} <- InstanceManager.create(prospect, scenario),
         :ok <- seed_demo_data(instance, scan_results),
         :ok <- apply_scenario_config(instance, scenario),
         :ok <- schedule_teardown(instance, duration) do
      {:ok, %DemoInstance{
        id: instance.id,
        url: instance.url,
        prospect: prospect,
        scenario: scenario,
        findings: length(scan_results.findings),
        expires_at: compute_expiry(duration),
        status: :ready
      }}
    end
  end

  defp schedule_teardown(instance, duration) do
    ttl_ms = duration_to_ms(duration)
    Process.send_after(self(), {:teardown, instance.id}, ttl_ms)
    :ok
  end
end
```

- On-demand demo instance provisioning with isolated [PostgreSQL](/glossary/postgresql/) databases and configuration
- Scenario-based demonstration scripts covering [EASM](/glossary/easm/), [compliance framework](/glossary/compliance-framework/), and [risk score](/glossary/risk-score/) rating workflows
- Pre-loaded sample data with realistic [entity resolution](/glossary/entity-resolution/) graphs and security findings
- Customizable [LiveView](/glossary/liveview/) dashboards configured per prospect's industry and needs

### Competitive Intelligence

The competitive intelligence system maintains a structured knowledge graph of competitor capabilities:

| Competitor | Tracked Dimensions | Update Frequency | Sources |
|------------|-------------------|-----------------|---------|
| BitSight | Features, pricing, market share, API | Weekly | Public docs, analyst reports |
| Black Kite | Scoring methodology, integrations, compliance | Weekly | Whitepapers, webinars |
| SecurityScorecard | Rating factors, coverage, partnerships | Weekly | Product pages, SEC filings |
| RiskRecon | Assessment methodology, data sources | Monthly | Public documentation |
| UpGuard | Features, pricing tiers, API access | Monthly | Product pages, reviews |

- Feature comparison matrices against BitSight, Black Kite, SecurityScorecard, and RiskRecon
- Win/loss analysis tracking with structured tagging for loss reasons
- Competitor monitoring from OSINT sources including job postings, patent filings, and press releases
- Pricing intelligence gathering from public RFP responses and analyst reports

### Proposal Support

- Automated proposal generation from structured requirements documents
- ROI calculation models based on prospect size, industry, and current tooling
- Technical architecture recommendations tailored to prospect's existing infrastructure
- Implementation timeline estimation with milestone-based delivery plans

### Prospect Intelligence

The prospect scanner leverages the platform's own EASM capabilities to provide immediate value during the sales process:

```elixir
defmodule PrismaticPresales.ProspectScanner do
  @spec scan(String.t()) :: {:ok, ProspectProfile.t()} | {:error, term()}
  def scan(domain) do
    with {:ok, rating} <- PrismaticPerimeter.security_rating(domain),
         {:ok, assets} <- PrismaticPerimeter.discover(domain),
         {:ok, tech_stack} <- detect_technologies(domain),
         {:ok, compliance} <- assess_compliance_posture(domain) do
      {:ok, %ProspectProfile{
        domain: domain,
        security_grade: rating.grade,
        security_score: rating.score,
        assets_discovered: length(assets),
        technologies: tech_stack,
        compliance_gaps: compliance.gaps,
        findings: compile_findings(rating, assets, compliance),
        scanned_at: DateTime.utc_now()
      }}
    end
  end
end
```

- Automated domain reconnaissance using [Prismatic Perimeter](/apps/prismatic-perimeter/) scanning capabilities
- Technology stack fingerprinting from public-facing infrastructure analysis
- [Vulnerability assessment](/glossary/vulnerability-assessment/) preview showing real findings for prospect domains
- Industry benchmarking using aggregate [security rating](/glossary/security-rating/) data

### ROI Modeling

The ROI model calculates projected value based on prospect-specific parameters:

| Factor | Input | Calculation | Impact |
|--------|-------|-------------|--------|
| Breach cost avoidance | Industry, company size | IBM Cost of Data Breach * risk reduction | Primary |
| Compliance savings | Current audit costs | Manual effort reduction percentage | Secondary |
| Operational efficiency | Current tool count | Consolidation savings | Secondary |
| Incident response time | Current MTTR | Improvement percentage | Tertiary |

## Usage

```elixir
# Create a demo environment for a prospect
{:ok, demo} = PrismaticPresales.create_demo(
  prospect: "Example Corp",
  scenario: :easm_security_rating,
  duration: :days_14,
  seed_domain: "example.com")
# => %{url: "https://demo-abc123.fly.dev", findings: 47, expires_at: ~U[...]}

# Generate competitive comparison matrix
{:ok, comparison} = PrismaticPresales.compare(
  competitors: [:bitsight, :black_kite, :securityscorecard],
  features: [:asset_discovery, :risk_scoring, :compliance, :api_access],
  format: :html)

# Generate a tailored proposal document
{:ok, proposal} = PrismaticPresales.generate_proposal(
  prospect: "Example Corp",
  requirements: requirements_map,
  format: :pdf)

# Scan prospect domain for immediate value demonstration
{:ok, profile} = PrismaticPresales.prospect_scan("example.com")
# => %{grade: :B, assets: 89, findings: 23, compliance_gaps: [:nis2_article_21]}

# Calculate ROI estimate
{:ok, roi} = PrismaticPresales.estimate_roi(
  prospect_size: :enterprise,
  industry: :financial_services,
  current_tools: [:legacy_scanner, :manual_compliance])
# => %{annual_savings: 285_000, payback_months: 4.2, five_year_roi: 340}
```

## NABLA Compliance

| NABLA Axiom | Presales Enforcement | Implementation |
|-------------|---------------------|----------------|
| Provenance Mandatory | Every finding shown in demo traceable to source scan | Prospect scan results carry full provenance from OSINT sources |
| Signal Plurality | Demo findings require multi-source corroboration | Perimeter scanner enforces plurality before reporting findings |
| Unknown Valid | Gaps in prospect data explicitly acknowledged | Scanner reports "insufficient data" rather than making unsupported claims |
| Contradiction Preservation | Conflicting competitive intelligence preserved | Competitor knowledge graph maintains contradictory data points |
| Source Independence | Competitive intelligence from independent sources | Multiple analyst reports and public sources cross-referenced |

## Testing

Demo engine tests verify instance provisioning, data seeding, scenario configuration, and automatic teardown timing. Prospect scanner tests verify domain reconnaissance accuracy, technology fingerprinting, and compliance assessment against known domains. Competitive intelligence tests verify knowledge graph maintenance, comparison matrix accuracy, and update freshness.

Proposal generator tests verify template rendering, ROI calculation accuracy, and format output correctness. Integration tests exercise the full presales pipeline from prospect onboarding through demo provisioning to proposal delivery.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Live [attack surface](/glossary/attack-surface/) scanning during demos using real prospect domains |
| [Prismatic CER](/apps/prismatic-cer/) | Demonstrates [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) compliance reporting capabilities |
| [Prismatic Storage](/apps/prismatic-storage/) | Demo data seeding across PostgreSQL and [ETS](/glossary/ets/) backends |
| [Prismatic Narrative](/apps/prismatic-narrative/) | Report generation engine for proposal documents and executive summaries |
| [Prismatic Override](/apps/prismatic-override/) | Demo instance lifecycle management and resource allocation |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Prospect domain scan | 30-120s | Full EASM scan with multi-source intelligence |
| Demo instance provisioning | 2-5 minutes | Fly.io deployment + DB seed + config |
| Competitive comparison generation | < 5s | Knowledge graph query + template render |
| Proposal generation (PDF) | 5-15s | Template + ROI model + comparison matrix |
| ROI calculation | < 100ms | Pure function computation |
| Instance teardown | < 30s | Clean shutdown with data archival |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :presales, :demo_created]`, `[:prismatic, :presales, :prospect_scanned]`, `[:prismatic, :presales, :proposal_generated]`.

## Related Resources

- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- Live EASM scanning for demo environments
- [Prismatic CER](/apps/prismatic-cer/) -- Compliance demonstration capabilities
- [Prismatic Narrative](/apps/prismatic-narrative/) -- Report generation for proposal documents
- [Prismatic Override](/apps/prismatic-override/) -- Demo instance lifecycle management
- [Competitor Researcher](/agents/competitor-researcher/) -- Automated competitive intelligence gathering and analysis
- [CER Compliance Commander](/agents/cer-compliance-commander/) -- Compliance scenario preparation for demo environments
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source competitive intelligence fusion for prospect briefings
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Live demo dashboards showcasing real-time security monitoring
- [AIAD Compliance](/capabilities/aiad-compliance/) -- Demo agent configurations follow AIAD standards for consistency

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)