+++
title = "/ma-analyze"
weight = 750
[extra]
category = "M&A Operations"
description = "Comprehensive M&A analysis including financial, legal and operational review"
syntax = "/ma-analyze [options]"
authority = "L3+"
agent = "ma-financial-analyst"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1452
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-analyze", "Comprehensive", "commands", "M&A Operations", "Prismatic Platform", "Analysis", "OSINT", "NABLA"]
tags = ["commands", "m&a-operations", "ma-analyze", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ma-analyze - Prismatic Platform"
+++

## Overview

**/ma-analyze** is a production command in the **M&A Operations** category of the Prismatic Platform that performs comprehensive Mergers and Acquisitions analysis spanning financial valuation, legal due diligence, operational assessment, and strategic fit evaluation. When an acquisition target has been identified through [/ma-create](/commands/ma-create/) and initial profiling is complete, the `/ma-analyze` command executes a deep, multi-dimensional analysis that produces the evidence base required for informed deal decisions.

This command operates under the **L3+** authority level and is executed by the `ma-financial-analyst` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3+ authority level reflects the sensitivity of M&A intelligence and ensures that analysis operations are restricted to operators with appropriate clearance for deal-sensitive material.

M&A analysis within the Prismatic Platform is distinguished by its integration of traditional financial analysis methods with the platform's intelligence capabilities. The [/investigate](/commands/investigate/) command provides OSINT intelligence on acquisition targets, [/email-osint](/commands/email-osint/) maps key personnel and organizational relationships, and [/ghost-recon](/commands/ghost-recon/) assesses the target's digital infrastructure. The `/ma-analyze` command synthesizes all of these intelligence streams alongside financial data, legal filings, and operational metrics into a unified analysis framework calibrated by the [NABLA](/glossary/nabla-infinity/) epistemic framework for confidence scoring.

The analysis engine supports multiple valuation methodologies including Discounted Cash Flow (DCF), Comparable Company Analysis, Precedent Transaction Analysis, and Asset-Based Valuation. Each methodology produces independent valuations that are then cross-referenced to establish a defensible valuation range with [NABLA](/glossary/nabla-infinity/)-calibrated confidence intervals.

## Architecture

The M&A analysis system is structured as a multi-domain assessment engine with parallel analysis tracks that converge into a unified deal assessment.

### Analysis Architecture

```
/ma-analyze -> Analysis Orchestrator -> Domain Analyzers -> Synthesis Engine
                      |                       |                    |
                      v                       v                    v
                Deal Context           Financial Analyzer    Unified Assessment
                Intel Integration      Legal Analyzer        Confidence Scoring
                Scope Management       Operational Analyzer  Recommendation Engine
                                       Strategic Analyzer
                                       Technical Analyzer
```

### Analysis Domains

| Domain | Analyzer | Key Outputs | Weight |
|--------|----------|-------------|--------|
| **Financial** | `ma-financial-analyst` | DCF, comparables, multiples, projections | 30% |
| **Legal** | `ma-legal-analyst` | Regulatory risk, IP portfolio, litigation, contracts | 20% |
| **Operational** | `ma-operations-analyst` | Capacity, supply chain, workforce, processes | 20% |
| **Strategic** | `ma-strategy-analyst` | Market position, synergies, competitive impact | 15% |
| **Technical** | `ma-technical-analyst` | Technology stack, technical debt, integration cost | 15% |

### Valuation Methodologies

| Methodology | Approach | Strengths | Limitations |
|-------------|----------|-----------|-------------|
| **DCF** | Projected free cash flows, discount rate | Forward-looking, intrinsic value | Sensitive to assumptions |
| **Comparable Companies** | Market multiples from similar firms | Market-based, current | Requires comparable firms |
| **Precedent Transactions** | Multiples from past M&A deals | Reflects acquisition premiums | Historical, may be stale |
| **Asset-Based** | Net asset value, replacement cost | Tangible floor value | Ignores growth potential |
| **LBO Analysis** | Leveraged buyout return model | Returns-focused, practical | Assumes specific capital structure |

## Usage

```bash
# Run comprehensive analysis on a deal
/ma-analyze DEAL-2026-001 --scope=full

# Financial analysis only
/ma-analyze DEAL-2026-001 --scope=financial

# Legal due diligence
/ma-analyze DEAL-2026-001 --scope=legal

# Quick strategic assessment
/ma-analyze DEAL-2026-001 --scope=strategic --depth=quick

# Analysis with OSINT intelligence integration
/ma-analyze DEAL-2026-001 --integrate-intel --osint-depth=full

# Run specific valuation methodology
/ma-analyze DEAL-2026-001 --valuation=dcf --discount-rate=0.12

# Comparable company analysis with custom peer set
/ma-analyze DEAL-2026-001 --valuation=comparables --peers="COMP-A,COMP-B,COMP-C"

# Export analysis to structured format
/ma-analyze DEAL-2026-001 --format=json --output=deal-analysis.json

# Update existing analysis with new data
/ma-analyze DEAL-2026-001 --update --data-source=q4-financials.xlsx

# Sensitivity analysis on key assumptions
/ma-analyze DEAL-2026-001 --sensitivity --variables="growth_rate,discount_rate,margin"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deal_id` | string | required | Deal identifier (positional argument) |
| `--scope` | string | full | Analysis scope: full, financial, legal, operational, strategic, technical |
| `--depth` | string | standard | Analysis depth: quick, standard, comprehensive, exhaustive |
| `--valuation` | string | all | Valuation method: dcf, comparables, precedent, asset-based, lbo, all |
| `--integrate-intel` | flag | false | Integrate OSINT intelligence from platform investigations |
| `--osint-depth` | string | standard | OSINT integration depth: quick, standard, full |
| `--discount-rate` | float | 0.10 | Discount rate for DCF analysis |
| `--projection-years` | integer | 5 | Number of years for financial projections |
| `--peers` | string | auto | Comma-separated peer company identifiers |
| `--format` | string | text | Output format: text, json, markdown, pdf |
| `--output` | string | stdout | Output file path |
| `--update` | flag | false | Update existing analysis with new data |
| `--data-source` | string | none | Additional data source file |
| `--sensitivity` | flag | false | Run sensitivity analysis |
| `--variables` | string | all | Comma-separated sensitivity variables |
| `--confidence-threshold` | float | 0.7 | Minimum confidence for reported findings |
| `--currency` | string | USD | Reporting currency |

## Execution Flow

1. **Deal Context Loading**: The specified deal is loaded from the M&A pipeline with all associated data including target company profile, preliminary assessments, and any existing analysis results. The deal must have been created through [/ma-create](/commands/ma-create/) and must be in an active state.

2. **Intelligence Integration**: If `--integrate-intel` is enabled, the system retrieves OSINT intelligence previously collected on the target through [/investigate](/commands/investigate/), [/email-osint](/commands/email-osint/), and [/ghost-recon](/commands/ghost-recon/). This intelligence supplements the financial and operational data.

3. **Parallel Domain Analysis**: Each analysis domain (financial, legal, operational, strategic, technical) is executed in parallel using `Task.async_stream`. Each domain analyzer operates independently, producing domain-specific findings with confidence scores.

4. **Financial Valuation**: The financial analyzer executes all requested valuation methodologies. Each methodology produces an independent valuation range. The analyzer also generates pro-forma financial statements, synergy estimates, and integration cost projections.

5. **Legal Assessment**: The legal analyzer evaluates regulatory requirements, antitrust implications, intellectual property portfolio strength, pending litigation, contractual obligations, and compliance posture. Regulatory risk is scored across all relevant jurisdictions.

6. **Operational Evaluation**: The operational analyzer assesses manufacturing capacity, supply chain dependencies, workforce composition, process maturity, and operational efficiency. Integration complexity is estimated across each operational dimension.

7. **Strategic Fit Analysis**: The strategic analyzer evaluates market position enhancement, competitive impact, synergy realization probability, customer overlap, and geographic complementarity. Strategic rationale is scored against the acquirer's stated objectives.

8. **Technical Assessment**: The technical analyzer evaluates the target's technology stack, technical debt levels, infrastructure requirements, integration complexity, and key technical talent. Compatibility with the acquirer's technology ecosystem is assessed.

9. **Cross-Domain Synthesis**: All domain analyses are synthesized into a unified deal assessment. Contradictory findings across domains are preserved per the [addiction preservation](/glossary/contradiction-preservation/) doctrine. Cross-domain correlations are identified and documented.

10. **Confidence Calibration**: All findings receive [NABLA](/glossary/nabla-infinity/)-calibrated confidence scores based on data quality, source reliability, and cross-domain corroboration. The overall deal confidence score aggregates domain confidence scores weighted by domain importance.

11. **Recommendation Generation**: Based on the synthesized analysis, the system generates a recommendation (Proceed, Proceed with Conditions, Hold for Additional Data, Do Not Proceed) with supporting evidence and risk factors.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `ma-financial-analyst` | Coordinates domain analysis agents |
| [/ma-create](/commands/ma-create/) | Deal source | Provides deal context and target profile |
| [/ma-report](/commands/ma-report/) | Report generation | Formats analysis into structured reports |
| [/ma-dashboard](/commands/ma-dashboard/) | Pipeline view | Analysis status visible in dashboard |
| [/investigate](/commands/investigate/) | OSINT intelligence | Target company intelligence integration |
| [/email-osint](/commands/email-osint/) | Personnel intelligence | Key personnel mapping |
| [/ghost-recon](/commands/ghost-recon/) | Infrastructure intel | Digital infrastructure assessment |
| [/intel-export](/commands/intel-export/) | Intelligence packaging | Structured intel for analysis |
| [NABLA Framework](/glossary/nabla-infinity/) | Confidence calibration | Epistemic scoring for all findings |
| [Quality Gates](/glossary/quality-gates/) | Analysis quality | Completeness and accuracy validation |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Analysis timing, coverage tracking |

## Best Practices

**Start with quick depth for initial screening.** The `quick` depth completes in under a minute and provides enough signal to determine whether a comprehensive analysis is warranted. This prevents spending significant compute and API resources on targets that fail basic financial or strategic criteria.

**Always integrate OSINT intelligence.** The platform's intelligence capabilities provide information that traditional financial analysis misses: key personnel social networks, organizational culture indicators, technology infrastructure quality, and digital security posture. Use `--integrate-intel` for all comprehensive analyses.

**Use multiple valuation methodologies.** No single valuation method is definitive. Running all available methodologies and comparing the resulting ranges provides a more defensible valuation basis. Significant divergence between methodologies often indicates areas requiring deeper investigation.

**Run sensitivity analysis on material assumptions.** M&A valuations are highly sensitive to growth rate, discount rate, and margin assumptions. Use `--sensitivity` to understand how changes in key assumptions affect the deal economics before committing to a recommendation.

**Review cross-domain contradictions.** The synthesis engine preserves contradictory findings across domains. A target that scores well on financial metrics but poorly on operational assessment may indicate financial engineering masking operational weakness. Always investigate contradictions.

**Document data limitations.** Use the confidence scores to communicate data limitations to stakeholders. A financial analysis with high confidence but low confidence in the operational assessment should be presented differently from one with uniformly high confidence.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `deal_not_found` | Deal ID does not exist in pipeline | Verify deal ID with `/ma-status` |
| `deal_not_active` | Deal is in closed or archived state | Reactivate deal or create new analysis |
| `insufficient_data` | Not enough data for requested analysis scope | Reduce scope or provide additional data sources |
| `intel_not_available` | No OSINT intelligence collected for target | Run `/investigate` on target first |
| `valuation_failed` | Insufficient financial data for valuation | Provide financial statements or use asset-based method |
| `peer_not_found` | Specified peer company not in database | Verify peer identifiers or use auto-selection |
| `timeout_exceeded` | Analysis exceeded configured timeout | Reduce depth or scope, retry with longer timeout |
| `confidence_below_threshold` | Analysis confidence below minimum | Collect additional data or lower threshold |

## Advanced Usage

### Multi-Deal Comparative Analysis

Compare multiple acquisition targets simultaneously.

```bash
# Compare three potential targets
/ma-analyze --compare="DEAL-001,DEAL-002,DEAL-003" --scope=full --format=markdown

# Rank targets by strategic fit
/ma-analyze --compare="DEAL-001,DEAL-002" --ranking=strategic --output=comparison.md
```

### Custom Valuation Models

Apply custom financial models to the analysis.

```bash
# DCF with custom assumptions
/ma-analyze DEAL-2026-001 --valuation=dcf \
  --discount-rate=0.12 --terminal-growth=0.03 \
  --projection-years=7 --margin-expansion=0.02

# LBO analysis with specific capital structure
/ma-analyze DEAL-2026-001 --valuation=lbo \
  --leverage-ratio=4.5 --interest-rate=0.065 --exit-year=5
```

### Automated Pipeline Analysis

Integrate analysis into automated deal screening workflows.

```bash
# Screen all new deals with quick analysis
/ma-analyze --batch=new-deals --depth=quick --format=json --output-dir=screening/

# Weekly comprehensive update for active deals
/ma-analyze --batch=active-deals --update --depth=standard --format=json
```

### Integration with External Data

Feed external financial data into the analysis engine.

```bash
# Import SEC filings
/ma-analyze DEAL-2026-001 --data-source=sec-10k-2025.pdf --scope=financial

# Import due diligence room data
/ma-analyze DEAL-2026-001 --data-source=vdr-export/ --scope=full
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every analysis domain must produce findings or explicitly document why findings could not be produced. Partial analyses are not delivered -- all requested domains must complete.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every financial projection, legal assessment, and strategic evaluation includes provenance, confidence scoring, and data quality indicators per [NABLA](/glossary/nabla-infinity/) requirements.

## Related Commands

- [/ma-create](/commands/ma-create/) - Create new M&A deal with target profiling and initial assessment
- [/ma-report](/commands/ma-report/) - Generate detailed M&A analysis report with visualizations
- [/ma-dashboard](/commands/ma-dashboard/) - M&A deal pipeline dashboard with real-time status tracking
- [/ma-status](/commands/ma-status/) - M&A deal pipeline status overview and progress tracking
- [/ma-enforce](/commands/ma-enforce/) - M&A enforcement actions for deal compliance and deadline tracking
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/intel-export](/commands/intel-export/) - Generate comprehensive intelligence packages for external LLM analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)