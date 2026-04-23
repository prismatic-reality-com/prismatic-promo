+++
title = "/presales"
weight = 1860
[extra]
category = "Presales"
description = "Presales intelligence for company analysis and opportunity identification"
syntax = "/presales [options]"
authority = "L2+"
agent = "presales-intelligence-commander"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1165
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales", "commands", "Prismatic Platform", "Phase", "OSINT", "Company"]
tags = ["commands", "presales", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales - Prismatic Platform"
+++

## Overview

**/presales** is the top-level production command in the **Presales** category of the Prismatic Platform, serving as the orchestration hub for all presales intelligence operations. The command provides company analysis, opportunity identification, and strategic presales coordination through a unified interface that delegates to specialized sub-commands for detailed analysis, technical assessment, pricing, competitive research, proposal generation, and case management.

The presales intelligence system transforms raw business information into structured, actionable intelligence that accelerates the sales cycle and improves win rates. By integrating [OSINT](/glossary/osint/) capabilities from the platform's intelligence domain with business analysis tools from the presales domain, the command provides a uniquely comprehensive view of prospects that goes far beyond what traditional CRM systems or sales intelligence tools offer. Company analysis includes not just firmographic data but also technical infrastructure assessment, security posture evaluation, regulatory compliance status, and competitive positioning.

This command operates under the **L2+** authority level and is executed by the `presales-intelligence-commander` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. As a commander-level agent, the presales intelligence commander has the authority to orchestrate multiple sub-agents and sub-commands, coordinating the full presales pipeline from initial opportunity identification through proposal delivery.

The command family follows a structured workflow: `/presales` for initial intelligence gathering and opportunity identification, [/presales-analyze](/commands/presales-analyze/) for document and content analysis, [/presales-assess](/commands/presales-assess/) for technical feasibility evaluation, [/presales-price](/commands/presales-price/) for pricing strategy, [/presales-research](/commands/presales-research/) for competitive intelligence, [/presales-case](/commands/presales-case/) for lifecycle management, and [/presales-propose](/commands/presales-propose/) for proposal generation. The `/presales` command can orchestrate this entire pipeline or be used independently for company intelligence.

## Architecture

The presales intelligence architecture implements a layered intelligence gathering and analysis system with cross-domain data correlation.

```
Intelligence Sources        Analysis Engine          Presales Pipeline
┌────────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│ Public Registries  │    │ Company Profiler  │    │ /presales-analyze  │
│ (ARES, OR, RZP)   │───>│ (Firmographic     │───>│ /presales-assess   │
│                    │    │  Analysis)        │    │ /presales-price    │
│ Web Intelligence   │    │                   │    │ /presales-research │
│ (Website, Social)  │───>│ Tech Stack        │───>│ /presales-propose  │
│                    │    │ Analyzer          │    │ /presales-case     │
│ Financial Data     │    │                   │    │                    │
│ (Annual Reports)   │───>│ Opportunity       │───>│ Pipeline Dashboard │
│                    │    │ Scorer            │    │ (LiveView)         │
│ OSINT Sources      │    │                   │    │                    │
│ (121+ providers)   │───>│ Risk Assessor     │    │                    │
└────────────────────┘    └──────────────────┘    └────────────────────┘
         │                        │                        │
         v                        v                        v
   Source Cache             Company DB              Case Management
   (Rate-limited)        (Profiles, Intel)         (Lifecycle FSM)
```

The Company Profiler constructs multi-dimensional company profiles by correlating data from public registries (Czech ARES, Commercial Register), web intelligence (technology stack detection, website analysis), financial data (annual reports, credit ratings), and OSINT sources (the platform's 121+ intelligence providers). Each data point is timestamped and sourced for provenance tracking.

The Opportunity Scorer evaluates identified prospects against configurable ideal customer profile (ICP) criteria to prioritize opportunities. Scoring dimensions include company size, industry fit, technology alignment, budget indicators, compliance needs, and competitive situation. This automated scoring eliminates manual qualification effort and ensures consistent opportunity evaluation across the sales team.

## Usage

### Company Intelligence

```bash
# Comprehensive company analysis
/presales --company "Acme Corporation"

# Company analysis with Czech registry lookup
/presales --company "Acme s.r.o." --ico 12345678

# Quick company overview
/presales --company "Acme Corp" --quick

# Company analysis with technology stack detection
/presales --company "Acme Corp" --tech-stack --domain acme.com
```

### Opportunity Identification

```bash
# Identify opportunities in target market segment
/presales --market easm --region cz --identify

# Score prospect against ideal customer profile
/presales --company "Acme Corp" --score --icp enterprise-security

# Batch prospect scoring
/presales --prospects prospects.csv --score --icp enterprise-security --rank
```

### Pipeline Orchestration

```bash
# Full presales pipeline for new opportunity
/presales --company "Acme Corp" --pipeline --auto

# Pipeline status overview
/presales --pipeline --status

# Pipeline with specific workflow
/presales --company "Acme Corp" --workflow enterprise-easm
```

### Intelligence Dashboard

```bash
# Launch presales intelligence dashboard
/presales --dashboard

# Company comparison view
/presales --compare "Acme Corp,Beta Inc,Gamma GmbH"

# Market opportunity heatmap
/presales --market easm --heatmap --region eu
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--company` | string | none | Target company name |
| `--ico` | string | none | Czech company ICO for registry lookup |
| `--domain` | string | none | Company domain for web intelligence |
| `--quick` | flag | false | Quick overview without deep analysis |
| `--tech-stack` | flag | false | Include technology stack detection |
| `--market` | string | none | Target market segment |
| `--region` | string | global | Geographic region: cz, eu, us, apac, global |
| `--identify` | flag | false | Identify opportunities in segment |
| `--score` | flag | false | Score prospect against ICP |
| `--icp` | enum | default | Ideal customer profile: enterprise-security, smb, government |
| `--prospects` | file | none | CSV file for batch prospect processing |
| `--rank` | flag | false | Rank prospects by score |
| `--pipeline` | flag | false | Orchestrate full presales pipeline |
| `--auto` | flag | false | Automatic pipeline progression |
| `--status` | flag | false | Show pipeline status |
| `--workflow` | enum | standard | Pipeline workflow template |
| `--dashboard` | flag | false | Launch intelligence dashboard |
| `--compare` | string | none | Comma-separated companies for comparison |
| `--heatmap` | flag | false | Generate market opportunity heatmap |
| `--format` | enum | table | Output: table, json, html, pdf |
| `--output` | path | stdout | Output file path |

## Execution Flow

The presales command follows different execution paths based on the selected operation mode.

**Company Intelligence Mode** (5-30 seconds): Phase 1 queries public registries and web sources concurrently to gather raw company data. Phase 2 processes and normalizes the collected data into a structured company profile. Phase 3 enriches the profile with technology stack detection, financial analysis, and OSINT intelligence. Phase 4 generates the company intelligence report with opportunity indicators and recommended next steps.

**Opportunity Identification Mode** (10-60 seconds): Phase 1 defines the target market segment and geographic scope. Phase 2 identifies potential prospects through registry queries, market databases, and web intelligence. Phase 3 scores each prospect against the ideal customer profile criteria. Phase 4 ranks and presents the top opportunities with qualification scores and recommended engagement approaches.

**Pipeline Orchestration Mode** (variable): Phase 1 creates a presales case for the opportunity. Phase 2 runs company analysis and document analysis. Phase 3 triggers technical assessment. Phase 4 generates pricing recommendation. Phase 5 produces competitive research. Phase 6 generates the proposal. Each phase gates on the previous phase's completion and quality validation. In `--auto` mode, phases progress automatically; otherwise, each phase requires explicit operator approval.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales-analyze](/commands/presales-analyze/) | Sub-command | Document and content analysis |
| [/presales-assess](/commands/presales-assess/) | Sub-command | Technical feasibility assessment |
| [/presales-price](/commands/presales-price/) | Sub-command | Pricing strategy analysis |
| [/presales-research](/commands/presales-research/) | Sub-command | Competitive intelligence |
| [/presales-case](/commands/presales-case/) | Sub-command | Case lifecycle management |
| [/presales-propose](/commands/presales-propose/) | Sub-command | Proposal generation |
| [/investigate](/commands/investigate/) | Cross-domain | OSINT intelligence feeds |
| [/person-investigate](/commands/person-investigate/) | Cross-domain | Decision-maker intelligence |
| [/perimeter](/commands/perimeter/) | Cross-domain | Prospect security posture data |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `presales-intelligence-commander` agent |
| [Prismatic Storage](/apps/prismatic-storage/) | Persistence | Company profiles, cases, intelligence |
| [Telemetry](/glossary/telemetry/) | Observability | Pipeline metrics, conversion tracking |

## Best Practices

**Start with Company Intelligence**: Before engaging a prospect, run `/presales --company "Target Corp"` to build a comprehensive profile. This intelligence enables informed conversations and demonstrates expertise that differentiates from competitors.

**Use ICP Scoring for Prioritization**: Configure your ideal customer profile and use `--score --icp` to objectively prioritize opportunities. This data-driven approach prevents the common mistake of pursuing attractive but poorly-fitting opportunities.

**Leverage Cross-Domain Intelligence**: The presales command's integration with OSINT and Perimeter capabilities provides unique intelligence. A prospect's security posture (from [/perimeter](/commands/perimeter/)) or decision-maker profile (from [/person-investigate](/commands/person-investigate/)) can be decisive competitive advantages.

**Automate the Pipeline for Standard Deals**: For opportunities that fit standard engagement patterns, use `--pipeline --auto` to automate the full presales workflow. This reduces cycle time and ensures no steps are skipped.

**Maintain the Company Database**: Company intelligence depreciates over time. Re-run company analysis periodically for active prospects and key accounts to keep intelligence current.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Company not found | Warning with search suggestions | Try alternative names or ICO lookup |
| Registry unavailable | Partial profile from cached data | Retry when registry recovers |
| Domain not resolvable | Skip web intelligence with warning | Verify domain or provide alternative |
| ICP not configured | Error with available profiles | Use built-in or create custom ICP |
| Pipeline prerequisite unmet | Block with guidance | Complete required upstream step |
| Batch file format error | Error with format specification | Verify CSV structure |

## Advanced Usage

### Custom ICP Configuration

```bash
# Define custom ideal customer profile
/presales --configure-icp --name "fintech-easm" \
  --criteria "industry=fintech,size>100,region=eu,compliance=nis2"

# Score against custom ICP
/presales --company "Fintech Corp" --score --icp fintech-easm
```

### Market Intelligence Report

```bash
# Generate quarterly market intelligence report
/presales --market easm --report --type quarterly \
  --trends --sizing --competitive --format pdf --output market-intel-q1-2026.pdf
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Company profiles include all available intelligence dimensions. Pipeline stages enforce strict quality gates. No opportunity is forwarded to proposal without complete technical and commercial analysis.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Company intelligence is sourced from verified public data with full provenance tracking. Opportunity scores are derived from objective criteria, not subjective assessment. The [NABLA](/glossary/nabla-infinity/) framework ensures that business intelligence claims are supported by multiple independent sources and that contradictory signals (e.g., strong financials vs. negative employee reviews) are both preserved in the analysis.

## Related Commands

- [/presales-analyze](/commands/presales-analyze/) - Text, file and URL analysis for presales opportunity assessment
- [/presales-assess](/commands/presales-assess/) - Technical assessment of opportunities and cases
- [/presales-case](/commands/presales-case/) - Presales case management for status tracking and updates
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)