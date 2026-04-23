+++
title = "Prismatic Perimeter Core"
weight = 43
[extra]
icon = "shield-check"
color = "red"
description = "Core EASM logic - scoring algorithms, compliance engines, and rating computation"
category = "Security"
files = "320"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 954
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Perimeter", "Core", "EASM", "apps", "Security", "Prismatic Platform", "PrismaticPerimeterCore", "Multi", "Evidence"]
tags = ["apps", "security", "prismatic-perimeter-core", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Perimeter Core - Prismatic Platform"
+++

## Overview

[Prismatic Perimeter](/glossary/prismatic-perimeter/) Core contains the business logic for [External Attack Surface Management](/glossary/easm/). It implements [security rating](/glossary/security-rating/) algorithms, compliance assessment engines, and risk scoring models as pure computational modules, independent of any web interface or API layer. This separation enables the same scoring logic to serve the [LiveView dashboard](/apps/prismatic-perimeter-web/), the [REST API](/apps/prismatic-api/), and CLI tooling without duplication.

The security rating engine evaluates entities across 12 security dimensions -- including [TLS](/glossary/tls/) configuration, DNS security, email authentication, vulnerability exposure, and network hygiene -- to compute a composite grade from A (excellent) to F (critical risk) backed by a numeric score on a 300-900 scale. Each dimension produces an evidence-based sub-score with confidence weights aligned to the platform's [NABLA epistemic framework](/glossary/nabla-infinity/), ensuring that ratings reflect verified observations rather than assumptions.

Compliance assessment engines implement full evaluation logic for the [NIS2](/glossary/nis2/) Directive (EU 2022/2555) and [ZKB](/glossary/zkb/) 264/2025 Sb. (Czech Republic cybersecurity regulation). The framework is extensible, allowing new compliance standards to be added through configuration-driven rule definitions without code changes. This positions the platform to rapidly support emerging regulations across EU member states.

## Architecture

```
Evidence Collection --> Evidence Store --> Rating Engine --> Grade + Score
        |                   |               |              |
  Scanner Results      Normalized       12 Dimension    A-F Grade
  OSINT Data           Evidence Sets    Sub-Scorers     300-900 Score
  Compliance Data      Confidence       Aggregation     Percentile
        |                                    |
  Compliance Engine <-- Rule Definitions --> Assessment Report
        |                                    |
  NIS2 Evaluator                        ZKB Evaluator
```

All computation follows functional programming principles with [pure function](/glossary/pure-function/)s at the core. Side effects (database writes, event emission) occur only at the boundary layer, making the rating algorithms fully testable and deterministic.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticPerimeterCore` | Public facade: `compute_rating/1`, `assess_nis2/1`, `assess_zkb/1`, `risk_trajectory/1` |
| `PrismaticPerimeterCore.Application` | OTP application entry point (minimal supervision, pure computation focus) |
| `PrismaticPerimeterCore.RatingEngine` | Multi-factor security rating computation across 12 dimensions |
| `PrismaticPerimeterCore.DimensionScorer` | Per-dimension evidence evaluation and sub-score computation |
| `PrismaticPerimeterCore.GradeComputer` | Numeric score to letter grade mapping with percentile calculation |
| `PrismaticPerimeterCore.Nis2Evaluator` | NIS2 Directive compliance evaluation with article-level mapping |
| `PrismaticPerimeterCore.ZkbEvaluator` | ZKB 264/2025 Sb. compliance evaluation for Czech entities |
| `PrismaticPerimeterCore.ComplianceFramework` | Extensible compliance engine for adding new regulatory standards |
| `PrismaticPerimeterCore.RiskTrajectory` | Temporal risk trend analysis with trajectory prediction |

## Key Features

### Security Rating Engine

The 12-dimension rating engine evaluates distinct security aspects with independent evidence sets and confidence weights:

| Dimension | Weight | Evidence Sources | Score Range |
|-----------|--------|-----------------|-------------|
| TLS Configuration | 12% | Certificate analysis, cipher suites, protocol versions | 0-100 |
| DNS Security | 10% | DNSSEC, SPF, DKIM, DMARC configuration | 0-100 |
| Email Authentication | 8% | SPF, DKIM, DMARC records and policies | 0-100 |
| Vulnerability Exposure | 15% | CVE matching, service version analysis | 0-100 |
| Network Hygiene | 10% | Open ports, unnecessary services, banner leaks | 0-100 |
| Web Security | 10% | Security headers, CSP, HSTS, cookie flags | 0-100 |
| Patching Cadence | 8% | Version currency, update frequency | 0-100 |
| Reputation | 7% | IP/domain blocklists, threat feeds | 0-100 |
| Information Leakage | 5% | Exposed metadata, directory listings | 0-100 |
| Application Security | 5% | Misconfigurations, default credentials | 0-100 |
| Cloud Security | 5% | Cloud misconfiguration, exposed storage | 0-100 |
| Supply Chain | 5% | Third-party risk, CDN/service dependencies | 0-100 |

```elixir
defmodule PrismaticPerimeterCore.RatingEngine do
  @spec compute(EvidenceSet.t()) :: {:ok, Rating.t()} | {:error, term()}
  def compute(evidence_set) do
    dimensions = @dimensions
    |> Enum.map(fn dim ->
      evidence = EvidenceSet.for_dimension(evidence_set, dim.id)
      score = DimensionScorer.score(dim, evidence)
      confidence = DimensionScorer.confidence(dim, evidence)
      {dim, score, confidence}
    end)

    weighted_score = compute_weighted_score(dimensions)
    grade = GradeComputer.to_grade(weighted_score)
    overall_confidence = compute_overall_confidence(dimensions)

    {:ok, %Rating{
      grade: grade,
      score: weighted_score,
      dimensions: format_dimensions(dimensions),
      confidence: overall_confidence,
      evidence_count: EvidenceSet.count(evidence_set),
      computed_at: DateTime.utc_now()
    }}
  end

  defp compute_weighted_score(dimensions) do
    {total_score, total_weight} = Enum.reduce(dimensions, {0.0, 0.0}, fn
      {dim, score, confidence}, {sum, weight} when confidence > 0.3 ->
        adjusted = score * confidence
        {sum + adjusted * dim.weight, weight + dim.weight}
      _low_confidence, acc ->
        acc
    end)

    round(total_score / max(total_weight, 0.01) * 6 + 300)
  end
end
```

- Multi-factor scoring across 12 security dimensions with evidence weighting
- Grade computation (A-F) with numeric scores (300-900) for granular comparison
- Industry percentile benchmarking against peer entity populations
- Trend analysis and trajectory prediction for rating evolution

### Grade Mapping

| Grade | Score Range | Description | Percentile Range |
|-------|------------|-------------|-----------------|
| A | 810-900 | Excellent security posture | 90th-100th |
| B | 720-809 | Good security with minor gaps | 70th-89th |
| C | 630-719 | Average security, improvement needed | 40th-69th |
| D | 540-629 | Below average, significant gaps | 20th-39th |
| F | 300-539 | Critical risk, immediate action required | 0th-19th |

### Compliance Engines

- NIS2 Directive (EU 2022/2555) full assessment with article-level mapping and gap identification
- ZKB 264/2025 Sb. (Czech Republic) compliance evaluation with section-level detail
- Extensible framework for custom compliance standards via configuration-driven rule definitions
- Evidence-based compliance scoring with gap identification and remediation recommendations

```elixir
defmodule PrismaticPerimeterCore.Nis2Evaluator do
  @spec assess(map()) :: {:ok, Nis2Assessment.t()} | {:error, term()}
  def assess(entity_data) do
    articles = @nis2_articles
    |> Enum.map(fn article ->
      evidence = extract_evidence(entity_data, article.requirements)
      status = evaluate_compliance(evidence, article.criteria)
      {article, status, evidence}
    end)

    overall = compute_overall_compliance(articles)

    {:ok, %Nis2Assessment{
      compliant: overall.score >= @compliance_threshold,
      score: overall.score,
      gaps: identify_gaps(articles),
      articles: format_article_results(articles),
      recommendations: generate_recommendations(articles),
      assessed_at: DateTime.utc_now()
    }}
  end
end
```

### Risk Models

- Evidence-weighted risk aggregation across all intelligence sources
- Temporal risk trajectory analysis with configurable time windows
- Confidence-adjusted [risk score](/glossary/risk-score/)s integrated with [NABLA axioms](/capabilities/nabla-axioms/)
- Multi-source evidence fusion with contradiction detection

## Usage

```elixir
# Compute security rating from evidence
{:ok, rating} = PrismaticPerimeterCore.compute_rating(evidence_set)
# => %{grade: :B, score: 780, factors: [...], confidence: 0.92}

# NIS2 compliance assessment
{:ok, assessment} = PrismaticPerimeterCore.assess_nis2(entity_data)
# => %{compliant: false, gaps: [article_21: :partial], score: 0.74}

# ZKB compliance check
{:ok, zkb} = PrismaticPerimeterCore.assess_zkb(entity_data)
# => %{compliant: true, score: 0.91, gaps: []}

# Risk trajectory over time
{:ok, trajectory} = PrismaticPerimeterCore.risk_trajectory(
  entity: "example.com", window: :last_90_days
)
# => %{trend: :improving, current: 0.23, predicted_30d: 0.19}

# Per-dimension scoring breakdown
{:ok, breakdown} = PrismaticPerimeterCore.dimension_scores(evidence_set)
# => %{tls: 92, dns: 78, email: 65, vulnerability: 88, ...}
```

## NABLA Compliance

| NABLA Axiom | Perimeter Core Enforcement | Implementation |
|-------------|---------------------------|----------------|
| Provenance Mandatory | Every rating dimension traceable to source evidence | Evidence sets maintain full provenance chains per observation |
| Signal Plurality | Rating requires multi-source evidence per dimension | DimensionScorer requires minimum 2 evidence sources for score > 0.3 confidence |
| Time Decay | Evidence freshness weighted in scoring | Temporal decay function reduces evidence weight based on observation age |
| Contradiction Preservation | Conflicting evidence across sources preserved | Dimension scores computed independently per source, conflicts flagged |
| Source Independence | Independent sources weighted higher | Source correlation detection prevents double-counting dependent observations |

## Testing

Rating engine tests verify scoring algorithm correctness, grade boundary accuracy, and weighted aggregation stability against known evidence sets. Compliance engine tests verify NIS2 article-level evaluation accuracy and ZKB section-level assessment against labeled compliance scenarios. Risk trajectory tests verify trend computation and prediction accuracy.

Dimension scorer tests verify per-dimension evidence evaluation and confidence computation with edge cases (missing evidence, contradictory observations, single-source data). Property-based tests generate random evidence sets to verify rating monotonicity invariants -- adding positive evidence should never decrease ratings.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter Web](/apps/prismatic-perimeter-web/) | LiveView dashboard rendering core rating and compliance data |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Orchestration layer coordinating discovery and rating workflows |
| [Prismatic Traits](/apps/prismatic-traits/) | Entity trait vectors feed into security dimension scoring |
| [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) | Probabilistic risk modeling for uncertainty quantification |
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | Primary evidence source for rating computation |
| [Prismatic Compliance](/apps/prismatic-compliance/) | High-level [compliance framework](/glossary/compliance-framework/) management |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Full rating computation | < 200ms | 12 dimensions with evidence weighting |
| Single dimension score | < 20ms | Pure function computation |
| NIS2 compliance assessment | < 500ms | All articles evaluated |
| ZKB compliance assessment | < 300ms | All sections evaluated |
| Risk trajectory computation | < 1s | 90-day window with trend analysis |
| Grade computation | < 1ms | Numeric to letter mapping |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :perimeter_core, :rating_computed]`, `[:prismatic, :perimeter_core, :compliance_assessed]`, `[:prismatic, :perimeter_core, :dimension_scored]`.

## Related Resources

- [Prismatic Detection Engine](/apps/prismatic-detection-engine/) -- Detection findings influence security rating adjustments
- [CER Compliance Commander](/agents/cer-compliance-commander/) -- Drives NIS2 and ZKB compliance assessment logic and regulatory control mapping
- [Competitor Researcher](/agents/competitor-researcher/) -- Provides industry benchmarking intelligence for peer comparison in security rating percentiles
- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Designs the extensible compliance engine framework enabling new standards through configuration
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Confidence-adjusted risk scores and evidence-weighted ratings grounded in epistemic axioms
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source evidence fusion across 12 security dimensions with contradiction detection
- [Quality Gates](/capabilities/quality-gates/) -- Scoring algorithm invariant verification ensuring grades remain monotonically ordered and bounded

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)