+++
title = "/presales-price"
weight = 1900
[extra]
category = "Presales"
description = "Pricing strategy analysis for opportunities and cases"
syntax = "/presales-price [options]"
authority = "L2+"
agent = "pricing-strategist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1232
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-price", "Pricing", "commands", "Presales", "Prismatic Platform", "Phase"]
tags = ["commands", "presales", "presales-price", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales-price - Prismatic Platform"
+++

## Overview

**/presales-price** is a production command in the **Presales** category of the Prismatic Platform that performs comprehensive pricing strategy analysis for presales opportunities and cases. The command calculates optimal pricing based on technical assessment data, implementation effort estimates, competitive positioning, value-based pricing models, and market intelligence to produce detailed pricing recommendations with multiple packaging options and discount scenarios.

The pricing engine integrates multiple pricing methodologies to generate well-rounded recommendations. Cost-plus pricing establishes the floor by aggregating implementation effort, infrastructure costs, and margin requirements. Value-based pricing determines the ceiling by quantifying the business value the solution delivers to the prospect. Competitive pricing calibrates the recommendation within market context by benchmarking against known competitor offerings. The final recommendation balances these inputs to maximize win probability while maintaining healthy margins.

This command operates under the **L2+** authority level and is executed by the `pricing-strategist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The pricing strategist agent combines technical understanding with commercial acumen, drawing on the AIAD registry's knowledge of platform capabilities and effort requirements to produce pricing that is both technically grounded and commercially competitive.

Within the presales pipeline, `/presales-price` typically follows [/presales-assess](/commands/presales-assess/), which provides the technical effort estimates that form the cost basis, and precedes [/presales-propose](/commands/presales-propose/), which incorporates the pricing recommendation into the formal proposal. The pricing output can also feed back into [/presales-case](/commands/presales-case/) to update the opportunity value and inform pipeline forecasting.

## Architecture

The pricing engine architecture implements a multi-model calculation framework that produces pricing recommendations from multiple methodological perspectives.

```
Technical Assessment ──> Cost Calculator
(Effort estimates)       (Implementation + Infrastructure + Margin)
                                │
Competitive Data ──────> Market Calibrator
(Competitor pricing)     (Benchmark + Position)
                                │
Value Analysis ────────> Value Calculator
(Business impact)        (ROI + TCO + Risk Reduction)
                                │
                                v
                    Pricing Optimizer
                    (Multi-model synthesis)
                                │
                    ┌───────────┼───────────┐
                    v           v           v
              Subscription   License    Hybrid
              Model         Model      Model
                    │           │           │
                    v           v           v
              Pricing Recommendation Report
              (Options, scenarios, discounts)
```

The Pricing Optimizer synthesizes inputs from all three pricing models using configurable weights. For new market entries, value-based pricing receives higher weight. For competitive replacements, competitive pricing dominates. For government and enterprise deals with formal procurement processes, cost-plus pricing receives higher weight to support detailed cost justification requirements.

Each pricing model generates multiple scenarios: a base case (most likely), an optimistic case (maximum margin), and a defensive case (minimum viable price to win). This three-scenario approach gives the sales team flexibility to negotiate while maintaining clear guardrails on pricing floors.

## Usage

### Basic Pricing Analysis

```bash
# Price from existing case assessment
/presales-price --case-id "CASE-2026-042"

# Price from assessment data
/presales-price --from-assessment assessment-2026-02-15.json

# Quick pricing estimate
/presales-price --requirements "EASM for 500 domains, 12-month contract" --quick
```

### Model-Specific Pricing

```bash
# Subscription model pricing
/presales-price --case-id "CASE-2026-042" --model subscription --term 12m

# License model with support tiers
/presales-price --case-id "CASE-2026-042" --model license --support premium

# Hybrid (license + subscription services)
/presales-price --case-id "CASE-2026-042" --model hybrid

# Compare all pricing models
/presales-price --case-id "CASE-2026-042" --compare-models
```

### Scenario Analysis

```bash
# Generate multi-scenario pricing
/presales-price --case-id "CASE-2026-042" --scenarios base,optimistic,defensive

# Discount analysis with margin impact
/presales-price --case-id "CASE-2026-042" --discount-analysis --max-discount 25

# Volume pricing for multi-domain deals
/presales-price --case-id "CASE-2026-042" --volume-tiers "100,500,1000,5000"
```

### Competitive Pricing

```bash
# Price with competitive benchmark
/presales-price --case-id "CASE-2026-042" --benchmark "BitSight,SecurityScorecard"

# Price to win analysis
/presales-price --case-id "CASE-2026-042" --price-to-win --target-probability 70
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--case-id` | string | none | Presales case identifier |
| `--from-assessment` | path | none | Assessment file for effort data |
| `--requirements` | string | none | Direct requirements for quick pricing |
| `--quick` | flag | false | Quick estimate without full analysis |
| `--model` | enum | subscription | Pricing model: subscription, license, hybrid |
| `--term` | duration | 12m | Contract term for subscription models |
| `--support` | enum | standard | Support tier: basic, standard, premium, enterprise |
| `--compare-models` | flag | false | Compare all pricing models side-by-side |
| `--scenarios` | string | base | Scenarios: base, optimistic, defensive (comma-separated) |
| `--discount-analysis` | flag | false | Generate discount impact analysis |
| `--max-discount` | integer | 20 | Maximum discount percentage for analysis |
| `--volume-tiers` | string | none | Volume tier breakpoints for volume pricing |
| `--benchmark` | string | none | Competitor names for competitive pricing |
| `--price-to-win` | flag | false | Calculate price-to-win |
| `--target-probability` | integer | 60 | Target win probability for price-to-win |
| `--currency` | enum | EUR | Pricing currency: EUR, USD, CZK, GBP |
| `--margin-floor` | integer | 30 | Minimum acceptable margin percentage |
| `--format` | enum | table | Output: table, json, html, pdf |
| `--output` | path | stdout | Output file path |

## Execution Flow

The pricing analysis follows a structured calculation pipeline that builds from cost basis to final recommendation.

**Phase 1 -- Input Collection** (1-2 seconds): The command retrieves the technical assessment data (effort estimates, complexity ratings, infrastructure requirements) from the specified case or assessment file. If competitive benchmark data is requested, it queries the competitive intelligence database for relevant pricing data points.

**Phase 2 -- Cost-Plus Calculation** (< 1 second): Implementation effort (person-days) is multiplied by the applicable day rate. Infrastructure costs are estimated based on the solution architecture. Ongoing operational costs are annualized. The target margin is applied to produce the cost-plus price. This establishes the pricing floor -- below this price, the engagement would be unprofitable.

**Phase 3 -- Value-Based Calculation** (1-3 seconds): The business value of the solution is quantified across multiple dimensions: risk reduction (cost of potential breaches prevented), compliance value (cost of non-compliance penalties avoided), operational efficiency (staff time saved), and competitive advantage (market positioning improvement). The value-based price is set as a fraction of the total quantified value, typically targeting 10-30% value capture.

**Phase 4 -- Competitive Calibration** (1-2 seconds): If competitive benchmarks are provided, the pricing is calibrated against known competitor price points. The system evaluates the platform's competitive advantages and disadvantages to determine whether pricing should be positioned above, at, or below the competitive median.

**Phase 5 -- Scenario Generation** (< 1 second): Multiple pricing scenarios are generated by adjusting key parameters. The base case uses standard assumptions. The optimistic case maximizes margin. The defensive case minimizes price while maintaining the margin floor. Each scenario includes a probability-adjusted expected value calculation.

**Phase 6 -- Report Generation** (< 1 second): The pricing recommendation is rendered in the requested format with detailed breakdowns, margin analysis, scenario comparison, and recommended negotiation strategy.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales-assess](/commands/presales-assess/) | Upstream | Effort estimates feed cost calculation |
| [/presales-propose](/commands/presales-propose/) | Downstream | Pricing incorporated into proposals |
| [/presales-case](/commands/presales-case/) | Case Management | Pricing linked to case, updates value |
| [/presales-research](/commands/presales-research/) | Data Source | Competitive pricing intelligence |
| [/presales](/commands/presales/) | Parent Command | Top-level presales orchestration |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `pricing-strategist` agent |
| [Prismatic Storage](/apps/prismatic-storage/) | Persistence | Pricing history, competitive data |
| [Telemetry](/glossary/telemetry/) | Observability | Pricing accuracy and win-rate correlation |

## Best Practices

**Base Pricing on Assessment Data**: Always run [/presales-assess](/commands/presales-assess/) before pricing to ensure effort estimates reflect actual technical complexity. Ad-hoc pricing without technical grounding frequently results in underpricing or scope misalignment.

**Use Multiple Models**: Run `--compare-models` to see the opportunity from different pricing perspectives. Subscription models work well for ongoing services, while license models may be preferred by prospects with CapEx budgets. Having both options ready increases deal flexibility.

**Maintain the Margin Floor**: The `--margin-floor` parameter ensures that no pricing scenario drops below the minimum acceptable profitability. Resist the temptation to lower this floor to win deals -- unprofitable deals create delivery pressure that compromises quality.

**Generate Discount Scenarios**: Use `--discount-analysis` before entering negotiations. Having pre-calculated discount scenarios with margin impact data enables confident, real-time negotiation responses without risking margin erosion.

**Track Pricing Accuracy**: After deals close, compare actual implementation costs against pricing estimates. This feedback loop improves future pricing accuracy and identifies systematic biases in effort estimation.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Case not found | Error with available cases | Verify case ID |
| No assessment data | Error with guidance | Run `/presales-assess` first |
| Missing effort estimates | Partial pricing with warning | Complete technical assessment |
| Unknown competitor | Warning, benchmark excluded | Verify competitor name |
| Below margin floor | Warning with floor enforcement | Adjust scope or margin target |
| Currency conversion unavailable | Fallback to EUR | Specify supported currency |

## Advanced Usage

### Multi-Year Deal Structuring

```bash
# Multi-year pricing with annual escalation
/presales-price --case-id "CASE-2026-042" --model subscription \
  --term 36m --escalation 3 --front-load 20

# Phased implementation pricing
/presales-price --case-id "CASE-2026-042" --phases 3 \
  --phase-split "40,35,25" --format pdf
```

### Proposal-Ready Export

```bash
# Generate pricing section for proposal
/presales-price --case-id "CASE-2026-042" --compare-models \
  --scenarios base,optimistic,defensive --format pdf \
  --output pricing-section.pdf --proposal-ready
```

### ROI Calculation

```bash
# Generate ROI analysis for prospect
/presales-price --case-id "CASE-2026-042" --roi-analysis \
  --payback-period --format pdf --output roi-analysis.pdf
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Pricing is never generated without adequate cost basis data. Margin floors are enforced without exception. All pricing scenarios are calculated with the same rigor regardless of deal urgency.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every pricing component is traceable to specific cost drivers or market data points. The [NABLA](/glossary/nabla-infinity/) axiom of Signal Plurality requires that pricing recommendations consider multiple methodological perspectives (cost-plus, value-based, competitive) rather than relying on a single approach.

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