+++
title = "/presales-research"
weight = 1920
[extra]
category = "Presales"
description = "Competitor research and market intelligence for presales"
syntax = "/presales-research [options]"
authority = "L2+"
agent = "competitor-researcher"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1214
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-research", "Competitor", "commands", "Presales", "Prismatic Platform", "Research", "Phase", "OSINT", "Competitive"]
tags = ["commands", "presales", "presales-research", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales-research - Prismatic Platform"
+++

## Overview

**/presales-research** is a production command in the **Presales** category of the Prismatic Platform that performs comprehensive competitor research and market intelligence gathering to support presales strategy formulation. The command systematically analyzes competitor offerings, market positioning, pricing intelligence, technology stacks, and customer sentiment to produce actionable competitive intelligence that strengthens proposal positioning and informs sales strategy.

The research engine combines structured data sources (vendor websites, product documentation, analyst reports, pricing pages) with unstructured intelligence (customer reviews, social media mentions, job postings, patent filings, press releases) to build multi-dimensional competitor profiles. These profiles go beyond surface-level feature comparisons to reveal strategic insights about competitor direction, market share trends, customer satisfaction levels, and potential vulnerabilities that can be leveraged in competitive positioning.

This command operates under the **L2+** authority level and is executed by the `competitor-researcher` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The competitor researcher agent specializes in open-source intelligence gathering techniques applied to commercial competitive analysis, leveraging the platform's [OSINT](/glossary/osint/) capabilities for business intelligence purposes.

Within the presales workflow, `/presales-research` enriches the intelligence available for opportunity assessment and proposal positioning. Competitive insights inform pricing strategy via [/presales-price](/commands/presales-price/), shape technical differentiation in proposals via [/presales-propose](/commands/presales-propose/), and contribute to win probability estimation in case management via [/presales-case](/commands/presales-case/). The command transforms raw market data into structured competitive intelligence that directly improves win rates.

## Architecture

The research architecture implements a multi-source intelligence gathering and synthesis pipeline with structured output generation.

```
Source Layer                Analysis Layer              Output Layer
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ Vendor Websites  │    │ Feature Extractor │    │ Competitor Profile  │
│ Product Docs     │───>│ (Capability Map)  │───>│                     │
│ Pricing Pages    │    │                   │    │ - Feature Matrix    │
│ Analyst Reports  │    │ Pricing Analyzer  │    │ - Pricing Comparison│
│ Review Sites     │───>│ (Rate Card,       │───>│ - SWOT Analysis     │
│ Social Media     │    │  Packaging)       │    │ - Win/Loss Intel    │
│ Job Postings     │    │                   │    │ - Market Position   │
│ Patent Filings   │───>│ Sentiment Engine  │───>│ - Differentiators   │
│ Press Releases   │    │ (NPS proxy,       │    │ - Battle Cards      │
│ GitHub/Forums    │    │  satisfaction)    │    │ - Strategy Recs     │
└──────────────────┘    └──────────────────┘    └─────────────────────┘
         │                       │                        │
         v                       v                        v
   Source Cache            Intelligence DB          Presales Pipeline
   (Rate-limited)        (Structured profiles)     (Case integration)
```

The Feature Extractor parses competitor documentation and marketing materials to construct a structured capability map. Each competitor feature is categorized, described, and compared against the Prismatic Platform's corresponding capability. The comparison identifies areas of parity, advantage, and disadvantage, providing the basis for competitive positioning statements.

The Pricing Analyzer collects publicly available pricing information from competitor websites, review sites, and analyst reports. When exact pricing is unavailable, the analyzer estimates pricing ranges based on publicly disclosed deal sizes, customer references, and market positioning signals. This intelligence feeds directly into the pricing strategy formulated by [/presales-price](/commands/presales-price/).

## Usage

### Basic Competitor Research

```bash
# Research specific competitor
/presales-research --competitor "BitSight"

# Research multiple competitors
/presales-research --competitors "BitSight,SecurityScorecard,Black Kite"

# Quick competitive overview
/presales-research --competitor "BitSight" --quick
```

### Market Intelligence

```bash
# Full market analysis for EASM segment
/presales-research --market easm --depth full

# Industry trend analysis
/presales-research --market cybersecurity --trends --range 12m

# Market sizing and share estimation
/presales-research --market easm --sizing --regions eu,us
```

### Battle Card Generation

```bash
# Generate sales battle card vs specific competitor
/presales-research --competitor "BitSight" --battle-card --format pdf

# Generate comprehensive battle card set
/presales-research --competitors "BitSight,SecurityScorecard,Black Kite" \
  --battle-cards --format pdf --output battle-cards/
```

### Case-Specific Research

```bash
# Research competitor mentioned in opportunity
/presales-research --case-id "CASE-2026-042" --competitive-context

# Enrich case with competitive positioning
/presales-research --case-id "CASE-2026-042" --competitor "BitSight" --link-to-case
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--competitor` | string | none | Single competitor to research |
| `--competitors` | string | none | Comma-separated competitor list |
| `--market` | string | none | Market segment for analysis |
| `--quick` | flag | false | Quick overview without deep analysis |
| `--depth` | enum | standard | Research depth: quick, standard, full |
| `--battle-card` | flag | false | Generate sales battle card |
| `--battle-cards` | flag | false | Generate battle cards for all competitors |
| `--case-id` | string | none | Link research to presales case |
| `--competitive-context` | flag | false | Research based on case context |
| `--link-to-case` | flag | false | Persist research to case record |
| `--trends` | flag | false | Include market trend analysis |
| `--sizing` | flag | false | Include market size estimation |
| `--regions` | string | global | Geographic regions: eu, us, apac, global |
| `--range` | duration | 6m | Time range for trend data |
| `--focus` | enum | all | Research focus: features, pricing, sentiment, technology, all |
| `--sources` | enum | all | Source filter: public, analyst, community, all |
| `--format` | enum | table | Output: table, json, html, pdf, markdown |
| `--output` | path | stdout | Output file path |

## Execution Flow

The research pipeline follows a structured intelligence gathering and synthesis process.

**Phase 1 -- Target Identification** (< 1 second): The research targets are identified from the command parameters or case context. For case-specific research, competitors mentioned in the opportunity analysis or assessment are automatically identified as targets. The research scope is configured based on depth and focus parameters.

**Phase 2 -- Source Collection** (5-30 seconds): The intelligence gathering engine queries multiple source categories concurrently. Vendor websites are crawled for product pages, pricing, and case studies. Review sites (G2, Gartner Peer Insights, TrustRadius) are queried for customer feedback and ratings. Job postings are analyzed for technology stack and growth signals. Press releases and news are collected for strategic direction indicators. All collection respects rate limits and terms of service.

**Phase 3 -- Intelligence Extraction** (3-10 seconds): Collected raw data is processed through specialized extractors. The feature extractor identifies product capabilities and maps them to the competitive comparison framework. The pricing analyzer normalizes pricing data across different models and packaging structures. The sentiment engine aggregates customer feedback into net promoter score proxies and satisfaction indicators.

**Phase 4 -- Analysis and Synthesis** (2-5 seconds): Extracted intelligence is synthesized into structured profiles. Feature comparison matrices identify areas of competitive advantage and disadvantage. SWOT analysis organizes intelligence into strategic frameworks. Win/loss patterns are identified from customer review data. Market positioning maps place competitors in strategic quadrants.

**Phase 5 -- Deliverable Generation** (1-3 seconds): The analysis is rendered into the requested output format. Battle cards are structured for quick reference during sales conversations. Full competitor profiles provide detailed intelligence for strategy sessions. Market analyses provide context for executive decision-making.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales](/commands/presales/) | Parent Command | Top-level presales orchestration |
| [/presales-analyze](/commands/presales-analyze/) | Complementary | Opportunity analysis enriched with competitive data |
| [/presales-price](/commands/presales-price/) | Downstream | Competitive pricing feeds pricing strategy |
| [/presales-propose](/commands/presales-propose/) | Downstream | Competitive positioning feeds proposals |
| [/presales-case](/commands/presales-case/) | Case Management | Research linked to presales cases |
| [/investigate](/commands/investigate/) | Cross-domain | OSINT capabilities for competitive intelligence |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `competitor-researcher` agent |
| [Telemetry](/glossary/telemetry/) | Observability | Research quality and freshness metrics |

## Best Practices

**Research Early and Update Regularly**: Start competitive research when an opportunity is first identified. Update before proposal submission to ensure positioning reflects the latest competitive landscape.

**Focus on Differentiators**: Rather than exhaustive feature comparisons, focus on identifying the key differentiators that matter for each specific opportunity. A few strong differentiators are more persuasive than comprehensive feature parity matrices.

**Use Battle Cards in Sales Calls**: Generate battle cards before prospect meetings. They provide concise, ready-to-use competitive positioning that enables confident responses to "how do you compare to X?" questions.

**Verify Pricing Intelligence**: Competitor pricing data from public sources may be outdated or incomplete. Flag pricing intelligence confidence levels and verify critical pricing assumptions through additional channels when possible.

**Link to Cases**: Always use `--link-to-case` when researching competitors for a specific opportunity. This creates a permanent record of competitive intelligence for the deal and enables win/loss analysis later.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Competitor not recognized | Warning with suggestion list | Verify competitor name |
| Source unavailable | Skip with warning, use cached data | Research continues with available sources |
| Rate limit exceeded | Automatic backoff and retry | Reduce scope or wait |
| Insufficient data | Partial profile with confidence ratings | Lower depth or broaden sources |
| Case not found | Error with available cases | Verify case ID |
| Market segment unknown | Error with available segments | Use supported segment identifier |

## Advanced Usage

### Competitive Monitoring

```bash
# Set up continuous competitive monitoring
/presales-research --competitors "BitSight,SecurityScorecard" \
  --monitor --interval 7d --alert-on-change

# Track competitor product launches
/presales-research --competitor "BitSight" --monitor --focus features \
  --alert-on "new-feature,pricing-change,acquisition"
```

### Strategic Analysis

```bash
# Full competitive landscape analysis
/presales-research --market easm --depth full --sizing --trends \
  --format pdf --output easm-landscape-2026.pdf

# Porter's Five Forces analysis
/presales-research --market easm --framework porters --format pdf
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Competitive analysis covers all identified competitors -- none are omitted due to data collection difficulty. Feature comparisons are honest, acknowledging competitor strengths as well as weaknesses.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every competitive claim is backed by source evidence with provenance tracking. The [NABLA](/glossary/nabla-infinity/) axiom of Signal Plurality requires that competitive assessments be corroborated across multiple independent sources. The Contradiction Preservation axiom ensures that conflicting market signals (e.g., positive analyst reports vs. negative customer reviews) are both presented rather than selectively filtered.

## Related Commands

- [/presales](/commands/presales/) - Presales intelligence for company analysis and opportunity identification
- [/presales-analyze](/commands/presales-analyze/) - Text, file and URL analysis for presales opportunity assessment
- [/presales-assess](/commands/presales-assess/) - Technical assessment of opportunities and cases
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)