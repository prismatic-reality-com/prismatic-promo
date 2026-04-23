+++
title = "Risk Score"
weight = 9
[extra]
category = "security"
description = "Numeric assessment quantifying the security risk of individual assets or findings with confidence levels and evidence chains."
related_terms = ["easm", "attack-surface", "signal-plurality", "confidence-scoring", "nabla-infinity", "provenance-mandatory", "monte-carlo-verification", "epistemic-robustness", "blue-team", "risk-score", "shodan", "censys", "greynoise"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1794
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Risk", "Score", "Numeric", "glossary", "security", "Prismatic Platform", "Monte Carlo", "NABLA", "HARD"]
tags = ["glossary", "security", "risk-score", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Risk Score - Prismatic Platform"
+++

## Definition

A Risk Score is a numeric value quantifying the security risk associated with a specific asset, finding, or vulnerability. Unlike an aggregate Security Rating (which scores an entire organization on a letter grade from A to F), risk scores apply to individual items: a specific open port, a misconfigured service, an expired certificate, a DNS zone transfer vulnerability. Each score includes a confidence level indicating how certain the assessment is, and an evidence chain linking the score to specific observable data through [provenance mandatory](@/glossary/provenance-mandatory.md) compliance.

Risk scores serve as the atomic building blocks of the Prismatic Perimeter's security assessment system. They are computed from observable evidence using methodology aligned with CVSS (Common Vulnerability Scoring System) principles, adapted for external-only observation. The scores are then aggregated, weighted by asset criticality and finding severity, to produce the overall A-F Security Rating that organizations, compliance officers, and due diligence analysts consume.

The epistemological position embedded in the risk scoring system is that **risk is not a single number but a distribution with uncertainty**. A risk score of 72 with a confidence of 0.95 means something fundamentally different from a risk score of 72 with a confidence of 0.45. The first is a well-evidenced assessment; the second is an educated guess. The Prismatic Platform treats both the score and its confidence as first-class data, ensuring that downstream consumers can distinguish between high-confidence findings and tentative assessments.

## Scoring Methodology

The risk scoring methodology operates on a 0-100 numeric scale, which maps to letter grades for human consumption. The methodology considers multiple dimensions of risk, each contributing to the composite score through a weighted formula.

### Numeric Scale and Grade Mapping

| Score Range | Grade | Interpretation | Typical Characteristics |
|-------------|-------|---------------|------------------------|
| 90-100 | A | Excellent | Minimal exposure, strong controls, current patches |
| 80-89 | B | Good | Minor issues, generally well-maintained |
| 70-79 | C | Adequate | Notable gaps, some outdated services |
| 60-69 | D | Below Average | Significant exposure, multiple findings |
| 0-59 | F | Critical | Severe vulnerabilities, urgent remediation needed |

The alternative scale used in some contexts maps to 300-900 (similar to credit scores), where A = 800-900, B = 700-799, C = 600-699, D = 500-599, F = 300-499. Both scales are supported by the scoring engine, with the 0-100 scale used internally and the 300-900 scale available for external reporting contexts.

### Multi-Dimensional Risk Factors

Individual risk scores are computed from multiple observable dimensions:

| Dimension | Weight | Evidence Sources | Example Findings |
|-----------|--------|-----------------|-----------------|
| **Network Exposure** | 25% | Port scans, service banners | Open database ports, unencrypted services |
| **Cryptographic Posture** | 20% | TLS analysis, certificate inspection | Expired certs, weak ciphers, missing HSTS |
| **Patch Currency** | 20% | Version detection, CVE correlation | Outdated software, known vulnerabilities |
| **Configuration Hygiene** | 15% | Header analysis, DNS records | Missing security headers, SPF/DKIM gaps |
| **Information Leakage** | 10% | Content analysis, metadata inspection | Exposed admin panels, debug endpoints |
| **Reputation Signals** | 10% | Blocklist correlation, abuse databases | IP on blocklists, domain in threat feeds |

```elixir
defmodule PrismaticPerimeter.RiskScoring do
  @moduledoc """
  Computes risk scores from observable evidence with confidence tracking.
  Every score satisfies NABLA axioms: signal plurality, provenance, time decay.
  """

  @type risk_score :: %{
    score: 0..100,
    grade: :a | :b | :c | :d | :f,
    confidence: float(),
    dimensions: map(),
    evidence_chain: [evidence_ref()],
    computed_at: DateTime.t()
  }

  @dimension_weights %{
    network_exposure: 0.25,
    cryptographic_posture: 0.20,
    patch_currency: 0.20,
    configuration_hygiene: 0.15,
    information_leakage: 0.10,
    reputation_signals: 0.10
  }

  @spec compute(asset_id(), [finding()]) :: {:ok, risk_score()} | {:error, term()}
  def compute(asset_id, findings) do
    with {:ok, dimensions} <- score_dimensions(findings),
         {:ok, confidence} <- compute_confidence(findings),
         {:ok, composite} <- weighted_composite(dimensions) do
      {:ok, %{
        score: composite,
        grade: score_to_grade(composite),
        confidence: confidence,
        dimensions: dimensions,
        evidence_chain: extract_evidence_chain(findings),
        computed_at: DateTime.utc_now()
      }}
    end
  end

  defp score_to_grade(score) when score >= 90, do: :a
  defp score_to_grade(score) when score >= 80, do: :b
  defp score_to_grade(score) when score >= 70, do: :c
  defp score_to_grade(score) when score >= 60, do: :d
  defp score_to_grade(_score), do: :f

  defp weighted_composite(dimensions) do
    composite =
      @dimension_weights
      |> Enum.reduce(0.0, fn {dim, weight}, acc ->
        dim_score = Map.get(dimensions, dim, 100)
        acc + dim_score * weight
      end)
      |> round()

    {:ok, min(100, max(0, composite))}
  end
end
```

## EASM Security Ratings

In the context of [External Attack Surface Management](@/glossary/easm.md), risk scores aggregate into Security Ratings that provide a holistic view of an organization's external security posture. The aggregation follows a hierarchical structure:

```
Organization Security Rating (A-F)
|
+-- Domain Risk Scores
|   +-- example.com: 82 (B)
|   +-- api.example.com: 67 (D)
|   +-- mail.example.com: 91 (A)
|
+-- IP Range Risk Scores
|   +-- 203.0.113.0/24: 75 (C)
|   +-- 198.51.100.0/24: 88 (B)
|
+-- Certificate Risk Scores
|   +-- *.example.com: 95 (A)
|   +-- legacy.example.com: 42 (F)
|
+-- Service Risk Scores
    +-- HTTPS (443): 90 (A)
    +-- SMTP (25): 71 (C)
    +-- MySQL (3306): 23 (F) -- exposed database!
```

The aggregation applies asset criticality weighting: a finding on a primary domain weighs more than the same finding on a development subdomain. A critical production database scores higher impact than a staging environment. This weighting ensures that the aggregate Security Rating reflects the actual risk profile rather than being skewed by numerous but inconsequential findings on non-critical assets.

## NABLA-Backed Confidence

Every risk score in the Prismatic Platform satisfies [NABLA Infinity](@/glossary/nabla-infinity.md) axiom requirements, which fundamentally distinguishes Prismatic's risk scoring from conventional security rating services:

| NABLA Axiom | Application to Risk Scoring | Enforcement |
|-------------|---------------------------|-------------|
| **[Signal Plurality](@/glossary/signal-plurality.md)** | Minimum 2 independent sources must confirm a finding before it affects the score | HARD -- single-source findings quarantined |
| **[Contradiction Preservation](@/glossary/contradiction-preservation.md)** | If one scanner finds a vulnerability and another does not, both results are preserved | HARD -- contradiction reduces confidence |
| **[Time Decay](@/glossary/time-decay.md)** | Scan results older than 30 days receive progressively reduced weight | HARD -- stale findings decay toward neutral |
| **[Provenance Mandatory](@/glossary/provenance-mandatory.md)** | Every score traces back to specific scan data through documented evidence chain | HARD -- unprovenanced scores rejected |
| **Source Independence** | Scores from [Shodan](@/glossary/shodan.md), [Censys](@/glossary/censys.md), and [GreyNoise](@/glossary/greynoise.md) are weighted by source independence | SOFT -- correlated sources discounted |

The confidence calculation incorporates all axiom compliance factors:

```
confidence = base_confidence
  * signal_plurality_factor      (1.0 if 2+ sources, 0.5 if 1 source)
  * contradiction_factor         (1.0 if no contradictions, 0.7-0.9 if contradictions exist)
  * time_decay_factor            (1.0 if fresh, decays by ~2% per week)
  * source_independence_factor   (1.0 if fully independent, reduced for correlated sources)
```

This approach means that a risk score's confidence naturally degrades over time, with contradictory evidence, or with insufficient source diversity. Consumers of the score can filter by confidence threshold: a compliance report might require confidence >= 0.80, while an alert dashboard might display findings at confidence >= 0.50.

## Monte Carlo Validation

For critical risk assessments (organizations being evaluated for acquisition, regulatory compliance, or strategic partnership), the platform applies [Monte Carlo verification](@/glossary/monte-carlo-verification.md) to validate risk score distributions. Rather than producing a single point estimate, Monte Carlo simulation produces a probability distribution of likely risk scores.

The simulation process:

1. **Evidence Sampling**: For each finding, sample from the confidence distribution (accounting for measurement uncertainty, source reliability, and temporal decay)
2. **Weight Perturbation**: Apply random perturbation to dimension weights within validated ranges (reflecting uncertainty in the weighting model itself)
3. **Aggregation**: Compute the composite score for each Monte Carlo trial
4. **Distribution Analysis**: After 10,000+ trials, analyze the resulting score distribution

The output includes:

| Metric | Description | Example |
|--------|-------------|---------|
| **Mean Score** | Average across all trials | 73.2 |
| **Median Score** | 50th percentile | 74 |
| **95% CI Lower** | 2.5th percentile | 68 |
| **95% CI Upper** | 97.5th percentile | 79 |
| **Grade Probability** | Probability of each grade | C: 72%, B: 18%, D: 10% |

This probabilistic approach is particularly valuable for due diligence, where a point estimate of "C grade" is less useful than knowing "72% probability of C, 18% probability of B, 10% probability of D." The Monte Carlo distribution captures the uncertainty inherent in external-only observation.

## Due Diligence Application

Risk scores in the due diligence context serve a specific purpose: enabling informed decisions about business relationships (acquisitions, partnerships, vendor selection) by quantifying the target's external security posture. The due diligence use case imposes additional requirements beyond standard security monitoring and creates a distinct analytical framework.

| Requirement | Implementation | Rationale | Technical Details |
|-------------|---------------|-----------|-------------------|
| **Point-in-time snapshot** | Scores computed from evidence gathered within a defined assessment window | Due diligence conclusions must reference a specific date | Evidence collection period typically 7-14 days for comprehensive coverage |
| **Comparative benchmarking** | Scores include industry percentile ranking | "Grade C" means different things in different industries | Industry classification via NAICS codes, peer scoring distributions |
| **Trend analysis** | Historical score trajectory over available data points | Improving or degrading posture matters for risk assessment | Minimum 90-day lookback where data available, trend confidence intervals |
| **Finding materiality** | Risk findings classified by materiality (critical/major/minor) | Not all findings are material to a business decision | CVSS-derived impact scoring with business context weighting |
| **Remediation cost estimation** | Findings include estimated effort to remediate | Informs negotiation and due diligence valuation adjustments | Cost models based on finding type, organizational size, and complexity |

### Advanced Due Diligence Analytics

The platform provides specialized analytical capabilities for high-stakes due diligence scenarios:

```elixir
defmodule PrismaticPerimeter.DueDiligence do
  @moduledoc """
  Specialized risk scoring for merger & acquisition due diligence.
  Provides point-in-time snapshots with industry benchmarking.
  """

  @type assessment_report :: %{
    target_organization: String.t(),
    assessment_period: {Date.t(), Date.t()},
    overall_score: risk_score(),
    industry_benchmark: industry_comparison(),
    trend_analysis: trend_summary(),
    material_findings: [material_finding()],
    remediation_roadmap: remediation_plan()
  }

  def comprehensive_assessment(organization_id, industry_naics, assessment_window_days \\ 14) do
    assessment_period = {
      Date.add(Date.utc_today(), -assessment_window_days),
      Date.utc_today()
    }

    with {:ok, assets} <- discover_target_assets(organization_id, assessment_period),
         {:ok, findings} <- comprehensive_scan(assets, assessment_period),
         {:ok, scores} <- compute_asset_scores(findings),
         {:ok, benchmark} <- industry_benchmark_analysis(scores, industry_naics),
         {:ok, trends} <- historical_trend_analysis(organization_id, 90),
         {:ok, material} <- classify_material_findings(findings, organization_size(organization_id)),
         {:ok, roadmap} <- generate_remediation_roadmap(material) do

      {:ok, %{
        target_organization: organization_id,
        assessment_period: assessment_period,
        overall_score: aggregate_scores(scores),
        industry_benchmark: benchmark,
        trend_analysis: trends,
        material_findings: material,
        remediation_roadmap: roadmap,
        generated_at: DateTime.utc_now()
      }}
    end
  end

  defp industry_benchmark_analysis(target_scores, naics_code) do
    # Query historical assessments for same industry
    industry_scores = PrismaticStorage.query_industry_scores(naics_code, last_12_months: true)

    percentile = calculate_percentile(target_scores.overall, industry_scores)

    {:ok, %{
      industry_naics: naics_code,
      target_percentile: percentile,
      industry_median: Enum.median(industry_scores),
      industry_quartiles: quartiles(industry_scores),
      peer_count: length(industry_scores)
    }}
  end
end
```

### Materiality Classification Framework

Due diligence assessments distinguish between findings that are material to business decisions and those that represent routine security hygiene:

**Critical (Business-Blocking)**:
- Exposed databases containing personal data
- Active exploitation indicators in threat intelligence
- Critical infrastructure vulnerabilities (scoring CVSS >= 9.0)
- Certificate expiration within transaction timeline

**Major (Affects Valuation)**:
- Significant cryptographic weaknesses (weak TLS, expired certs)
- Unpatched vulnerabilities with public exploits
- Open services on critical business applications
- Regulatory compliance gaps (GDPR, SOX, etc.)

**Minor (Monitoring Required)**:
- Information disclosure (server banners, debug pages)
- Missing security headers
- Outdated software versions without active exploits
- DNS configuration improvements

This classification directly informs deal structuring: critical findings may block transactions or require escrow holdbacks, major findings affect valuation negotiations, and minor findings become part of integration planning.

## Relationship to Confidence Scoring

[Confidence scoring](@/glossary/confidence-scoring.md) and risk scoring are related but distinct concepts in the Prismatic Platform:

| Dimension | Risk Score | Confidence Score |
|-----------|-----------|-----------------|
| **What it measures** | How risky is this asset/finding? | How certain are we about this claim? |
| **Scale** | 0-100 (higher = more secure) | 0.0-1.0 (higher = more certain) |
| **Subject** | An asset, finding, or organization | A belief, claim, or assessment |
| **Governed by** | Security rating methodology | [NABLA Infinity](@/glossary/nabla-infinity.md) axioms |
| **Can be uncertain?** | Yes -- that is what the confidence score indicates | No -- confidence is itself the measure of uncertainty |

Every risk score carries a confidence score. The risk score says "this port is dangerous" (how risky). The confidence score says "we are 87% certain of this assessment" (how sure). Together, they provide both the assessment and the meta-assessment of that assessment's reliability.

## Relationship to Epistemic Robustness

[Epistemic robustness](@/glossary/epistemic-robustness.md) measures how well a risk score withstands adversarial challenge. A risk score is epistemically robust if it would survive [Red Team](@/glossary/red-team.md) epistemic attacks: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking.

### Robustness Validation Framework

The platform implements a multi-layered validation system to ensure risk scores maintain epistemic integrity even under adversarial conditions:

```elixir
defmodule PrismaticPerimeter.EpistemicValidation do
  @moduledoc """
  Validates risk score epistemic robustness through Blue Team defensive protocols.
  Implements multi-layer verification against the 5 epistemic attack primitives.
  """

  @attack_primitives [
    :truth_distortion,      # Manipulating source data to skew risk perception
    :confidence_manipulation, # Artificially inflating/deflating certainty levels
    :signal_poisoning,      # Injecting false signals into evidence streams
    :drift_induction,       # Gradually shifting baselines through persistent manipulation
    :salience_hijacking     # Redirecting attention to irrelevant or manufactured findings
  ]

  def validate_robustness(risk_score, evidence_chain) do
    validation_results =
      @attack_primitives
      |> Enum.map(fn primitive ->
        {primitive, test_resistance(risk_score, evidence_chain, primitive)}
      end)
      |> Enum.into(%{})

    overall_robustness = compute_robustness_score(validation_results)

    {overall_robustness, validation_results}
  end

  defp test_resistance(risk_score, evidence_chain, :truth_distortion) do
    # Test how score changes if individual evidence items are perturbed
    perturbation_tests =
      evidence_chain
      |> Enum.map(fn evidence ->
        perturbed_score = compute_with_perturbed_evidence(evidence, risk_score)
        abs(perturbed_score.score - risk_score.score)
      end)

    max_deviation = Enum.max(perturbation_tests)
    %{resistance: 1.0 - (max_deviation / 100), max_deviation: max_deviation}
  end

  defp test_resistance(risk_score, evidence_chain, :signal_poisoning) do
    # Test robustness against additional false signals
    false_signals = generate_adversarial_signals(evidence_chain)
    poisoned_score = compute_with_additional_evidence(risk_score, false_signals)

    deviation = abs(poisoned_score.score - risk_score.score)
    %{resistance: 1.0 - (deviation / 100), signal_impact: deviation}
  end
end
```

The [Blue Team](@/glossary/blue-team.md) continuously validates risk score robustness through:

- **Signal aggregation**: Verifying that multiple independent sources support each finding, cross-correlating findings across Shodan, Censys, and GreyNoise to detect inconsistencies
- **Drift detection**: Monitoring for gradual, sub-threshold changes that could manipulate scores, using statistical process control to identify baseline shifts
- **Authentication boundary monitoring**: Ensuring that data sources have not been compromised by validating API responses, checking for unexpected data patterns, and monitoring source health metrics
- **Evidence synthesis**: Producing structured evidence artifacts rather than simple alert-based assessments, maintaining full audit trails from raw scan data to final scores
- **Cross-temporal validation**: Comparing risk score stability across multiple assessment windows to identify manipulation attempts
- **Source correlation analysis**: Detecting when supposedly independent sources produce suspiciously similar results, indicating potential compromise or coordination

### Robustness Thresholds and Actions

Risk scores that fail epistemic robustness checks are subject to graduated response protocols:

| Robustness Score | Action | Authority | Timeline |
|------------------|--------|-----------|----------|
| **0.90-1.00** | Publish normally | Automated | Real-time |
| **0.75-0.89** | Publish with robustness warning | Blue Team | 1-4 hours |
| **0.60-0.74** | Hold for Purple Team synthesis | Purple Team | 4-24 hours |
| **Below 0.60** | Quarantine pending investigation | Red-Blue-Purple Triad | Manual review |

Risk scores that fail epistemic robustness checks are flagged with reduced confidence and routed to [Purple Team](@/glossary/purple-team.md) for synthesis and verification before being published. The Purple Team conducts bidirectional mapping between Red Team attack scenarios and Blue Team defensive evidence to determine if the robustness failure represents genuine uncertainty or systematic attack.

## Related Terms

- [EASM](@/glossary/easm.md) -- External Attack Surface Management producing items to score
- [Attack Surface](@/glossary/attack-surface.md) -- The total collection of assets being scored
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Meta-assessment of risk score reliability
- [Signal Plurality](@/glossary/signal-plurality.md) -- NABLA axiom requiring multiple evidence sources
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- NABLA axiom requiring traceable evidence chains
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing risk score evidence quality
- [Monte Carlo Verification](@/glossary/monte-carlo-verification.md) -- Statistical validation of score distributions
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- Measure of score resilience to epistemic attack
- [Blue Team](@/glossary/blue-team.md) -- Defensive team validating risk score integrity
- [Shodan](@/glossary/shodan.md) -- External scanner providing network exposure evidence
- [Censys](@/glossary/censys.md) -- External scanner providing certificate and service evidence
- [GreyNoise](@/glossary/greynoise.md) -- External scanner providing internet noise context
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- NABLA axiom handling conflicting scan results

## See Also

- [Architecture](@/architecture/_index.md) -- Platform security architecture
- [Technologies](@/technologies/_index.md) -- Scanning and assessment technology details
- [Capabilities](@/capabilities/_index.md) -- Platform risk assessment capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)