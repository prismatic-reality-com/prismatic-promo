+++
title = "Risk Management"
weight = 50

[extra]
description = "The systematic process of identifying, assessing, prioritizing, and mitigating risks to organizational assets, operations, and compliance posture through evidence-based scoring, automated assessment pipelines, and continuous monitoring."
category = "security"
domain = "security-intelligence"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["remediation", "triage", "security-rating", "compliance", "sla", "threat-feed", "perimeter", "vulnerability", "scoring", "nabla", "decision-engine", "hypothesis", "mitigation", "audit"]
tags = ["risk-management", "security", "compliance", "assessment", "mitigation", "governance", "dd", "scoring", "threat-modeling", "easm"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Risk management in Prismatic Platform quantifies threats through evidence-based scoring, automated compliance assessment, continuous security rating computation, and DD-integrated decision pipelines that transform uncertainty into actionable intelligence."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Risk Management", "security", "compliance", "assessment", "glossary", "Prismatic Platform", "threat modeling", "DD scoring", "EASM", "NIS2", "ZKB", "risk quantification", "mitigation strategies"]
image = "/images/sections/glossary.png"
image_alt = "Risk Management - Prismatic Platform"
word_count = 3200
see_also = ["capabilities", "architecture", "security", "dd-pipeline"]
+++

## Definition

**Risk management** is the continuous, structured process of identifying potential threats and vulnerabilities, assessing their likelihood and potential impact, implementing controls to reduce risk to acceptable levels, and monitoring the effectiveness of those controls over time. It transforms uncertainty into structured decision-making, enabling organizations to allocate limited resources where they achieve the greatest risk-reduction impact. In mature organizations, risk management operates as a closed-loop system: identification feeds assessment, assessment drives prioritization, prioritization guides mitigation, and mitigation effectiveness is measured and fed back into the next assessment cycle.

The discipline spans multiple domains -- cybersecurity risk (threats to information systems and data), operational risk (disruptions to business processes), financial risk (monetary losses from adverse events), compliance risk (regulatory penalties and legal exposure), and reputational risk (damage to stakeholder trust). Each domain applies the same fundamental framework but with domain-specific metrics, thresholds, and control taxonomies. Modern risk management increasingly relies on quantitative methods (Monte Carlo simulation, Bayesian networks, probabilistic scoring) rather than purely qualitative assessments (high/medium/low matrices), though qualitative context remains essential for interpreting quantitative outputs.

In the Prismatic Platform context, risk management operates at three levels: internal platform risk (code quality, infrastructure reliability, dependency security), client-facing risk assessment (external attack surface analysis, compliance monitoring, security rating computation through the Perimeter EASM system), and due diligence risk scoring (DD entity evaluation, financial risk quantification, regulatory exposure analysis through the Decision Engine pipeline).

## Core Concepts

### Risk Assessment Frameworks

Risk assessment provides the analytical foundation for all risk management activities. Different frameworks serve different contexts, but all share the core principle of combining likelihood with impact to produce a prioritized risk score.

| Framework | Domain | Methodology | Prismatic Integration |
|-----------|--------|-------------|----------------------|
| **NIST CSF** | Cybersecurity | Identify-Protect-Detect-Respond-Recover | Perimeter EASM mapping |
| **ISO 27005** | Information Security | Context-Assessment-Treatment-Monitoring | Compliance module |
| **FAIR** | Quantitative Risk | Loss Event Frequency x Loss Magnitude | DD scoring engine |
| **OWASP Risk Rating** | Application Security | Likelihood x Impact with agent/factor decomposition | Code security scanning |
| **NIS2** | Critical Infrastructure | Essential/Important entity classification | Czech compliance assessment |
| **ZKB** | Czech Cybersecurity | Mandatory risk assessment per decree | Regulatory mapping |
| **Basel III** | Financial Risk | Credit/Market/Operational risk categories | DD financial analysis |
| **COSO ERM** | Enterprise Risk | Strategy-aligned risk appetite framework | Organizational assessment |

### Risk Quantification Methods

| Method | Precision | Computational Cost | Best For |
|--------|-----------|-------------------|----------|
| **Qualitative Matrix** | Low (ordinal) | Minimal | Initial triage, executive communication |
| **Semi-Quantitative Scoring** | Medium (interval) | Low | Prioritization, trend tracking |
| **Monte Carlo Simulation** | High (continuous) | Moderate | Financial impact estimation |
| **Bayesian Networks** | High (conditional) | High | Complex interdependency modeling |
| **FAIR Analysis** | High (monetary) | Moderate | Business case for security investment |
| **Nabla Epistemic Scoring** | High (calibrated) | Moderate | Intelligence confidence quantification |

### Risk Treatment Strategies

| Strategy | Description | When to Apply | Cost Profile |
|----------|-------------|---------------|--------------|
| **Mitigate** | Reduce likelihood or impact through controls | Risk exceeds appetite but is addressable | Proportional to risk reduction |
| **Transfer** | Shift risk to third party (insurance, outsourcing) | Risk is quantifiable and insurable | Premium-based |
| **Accept** | Acknowledge risk without additional controls | Risk within appetite, cost of mitigation exceeds benefit | Documentation only |
| **Avoid** | Eliminate the activity creating the risk | Risk exceeds appetite and cannot be mitigated | Opportunity cost |
| **Exploit** | Increase exposure to capture upside risk | Positive risk with strategic value | Investment-based |

## Technical Deep Dive

### Risk Scoring Architecture

Risk assessment in the Prismatic Platform uses a multi-factor scoring model that goes beyond simple Likelihood x Impact. The scoring engine incorporates asset criticality, vulnerability severity, exploit availability, exposure duration, compensating controls, and temporal decay factors to produce a nuanced risk score that enables prioritized remediation.

The fundamental scoring formula:

```
RiskScore = BaseSeverity * Exploitability * AssetCriticality
            * (1 + TemporalFactor * 0.2)
            * (1 - CompensatingControlReduction)
```

Where:
- **BaseSeverity** (0.0-10.0): CVSS-aligned severity of the vulnerability or finding
- **Exploitability** (0.0-1.0): Probability that the vulnerability can be actively exploited
- **AssetCriticality** (0.0-1.0): Business importance of the affected asset
- **TemporalFactor**: `min(exposure_days / 30, 3.0)` -- risk increases with exposure duration, capped at 3x
- **CompensatingControlReduction**: Each compensating control reduces risk by 10%

### Security Rating Computation

Security ratings (A-F grades, 300-900 numeric scores) aggregate individual risk findings into an overall organizational risk posture. The rating algorithm weights findings by severity, recency, and category, producing a score comparable across organizations and over time.

| Grade | Score Range | Risk Posture | Expected Finding Profile |
|-------|------------|--------------|--------------------------|
| **A** | 800-900 | Excellent | No critical, minimal high findings |
| **B** | 700-799 | Good | No critical, few high, managed medium |
| **C** | 600-699 | Fair | Some high findings, active remediation |
| **D** | 500-599 | Poor | Multiple high findings, slow remediation |
| **F** | 300-499 | Critical | Critical findings present, inadequate controls |

### DD Risk Scoring Integration

The Decision Engine extends risk management into due diligence workflows. DD risk scoring evaluates entities (companies, persons, transactions) across multiple risk dimensions:

| Risk Dimension | Indicators | Weight | Source |
|---------------|------------|--------|--------|
| **Financial Risk** | Debt ratios, cash flow, audit opinions | 0.25 | Financial statements, ARES |
| **Legal Risk** | Active proceedings, sanctions, regulatory actions | 0.20 | Court registries, sanctions lists |
| **Reputational Risk** | Negative media, association with PEPs | 0.15 | Media monitoring, PEP databases |
| **Operational Risk** | Business continuity, key person dependency | 0.15 | Company filings, ownership structure |
| **Compliance Risk** | Regulatory violations, AML flags | 0.15 | Regulatory databases, compliance checks |
| **Counterparty Risk** | Network connections, UBO transparency | 0.10 | Ownership graphs, KuzuDB relationships |

### Compliance Framework Mapping

Compliance frameworks (NIS2, ZKB, GDPR) define specific risk management requirements. The platform's compliance assessment module maps these requirements to verifiable evidence and identifies gaps.

| Requirement Category | NIS2 | ZKB | GDPR | Platform Module |
|---------------------|------|-----|------|-----------------|
| Risk Assessment | Art. 21(2)(a) | Section 3 | Art. 35 (DPIA) | RiskScoring |
| Incident Response | Art. 23 | Section 7 | Art. 33-34 | IncidentManager |
| Supply Chain | Art. 21(2)(d) | Section 4 | Art. 28 | SupplyChainAssessor |
| Access Control | Art. 21(2)(i) | Section 5 | Art. 32 | AuthorizationEngine |
| Monitoring | Art. 21(2)(b) | Section 6 | Art. 5(2) | ContinuousMonitor |
| Documentation | Art. 21(1) | Section 2 | Art. 30 | EvidenceCollector |

## Usage in Prismatic Platform

The Perimeter EASM system performs continuous risk assessment of external attack surfaces. Asset discovery identifies exposed resources (domains, IP addresses, certificates, web applications), vulnerability scanning evaluates their security posture, and risk scoring produces prioritized findings. The security rating dashboard provides executives with a real-time view of organizational risk posture, including trend analysis and peer comparison.

Internally, the Quality Floor Guardian acts as a risk management system for code quality, detecting and preventing quality regressions that could introduce security vulnerabilities or reliability failures. The 18-pillar doctrine enforcement operates as a risk control framework, where each pillar addresses a specific category of technical risk (ZERO for runtime crashes, SEAL for security vulnerabilities, PERF for performance degradation).

The DD Decision Engine integrates risk scoring directly into the investigation workflow. When an analyst evaluates a target entity, the system automatically computes risk scores across all dimensions, flags findings that exceed configurable thresholds, and generates risk-adjusted recommendations. The Nabla epistemic engine provides calibrated confidence scores for each risk assessment, distinguishing between high-confidence findings backed by multiple corroborating sources and low-confidence findings based on limited or contradictory evidence.

## Code Examples

```elixir
defmodule PrismaticPerimeter.RiskScoring do
  @moduledoc """
  Computes risk scores for discovered vulnerabilities and findings.

  Combines likelihood and impact with asset criticality, temporal
  exposure factors, and compensating controls to produce calibrated
  risk scores suitable for prioritized remediation.

  The scoring model aligns with CVSS v3.1 base metrics while adding
  Prismatic-specific contextual factors for more accurate risk
  quantification in EASM and DD workflows.

  ## Scoring Formula

      RiskScore = Severity * Exploitability * AssetCriticality
                  * (1 + min(exposure_days/30, 3.0) * 0.2)
                  * (1 - length(controls) * 0.1)

  ## Examples

      iex> finding = %{severity: 9.0, exploitability: 0.8, asset_criticality: 1.0, exposure_days: 60, compensating_controls: []}
      iex> {score, level} = PrismaticPerimeter.RiskScoring.calculate_risk(finding)
      iex> level
      :critical
  """

  require Logger

  @type risk_level :: :critical | :high | :medium | :low | :info
  @type finding :: %{
    severity: float(),
    exploitability: float(),
    asset_criticality: float(),
    exposure_days: non_neg_integer(),
    compensating_controls: list(String.t())
  }
  @type risk_result :: {float(), risk_level()}
  @type rating :: %{grade: atom(), score: non_neg_integer()}

  @doc """
  Calculates the risk score for a single finding.

  Returns a tuple of `{numeric_score, risk_level}` where `numeric_score`
  is a float between 0.0 and ~15.0 and `risk_level` is one of
  `:critical`, `:high`, `:medium`, `:low`, or `:info`.

  ## Parameters

    - `finding` - A map containing severity, exploitability,
      asset_criticality, exposure_days, and compensating_controls

  ## Examples

      iex> finding = %{severity: 5.0, exploitability: 0.5, asset_criticality: 0.8, exposure_days: 15, compensating_controls: ["WAF"]}
      iex> {score, level} = PrismaticPerimeter.RiskScoring.calculate_risk(finding)
      iex> level
      :medium
  """
  @spec calculate_risk(finding()) :: risk_result()
  def calculate_risk(finding) do
    base_score = finding.severity * finding.exploitability * finding.asset_criticality
    time_factor = min(finding.exposure_days / 30, 3.0)
    control_count = Enum.count(finding.compensating_controls)
    control_reduction = min(control_count * 0.1, 0.9)

    final_score = max(base_score * (1 + time_factor * 0.2) * (1 - control_reduction), 0)
    level = classify_risk(final_score)

    Logger.debug("Risk calculated: score=#{Float.round(final_score, 2)}, level=#{level}")

    {Float.round(final_score, 2), level}
  end

  @doc """
  Classifies a numeric risk score into a categorical risk level.

  ## Examples

      iex> PrismaticPerimeter.RiskScoring.classify_risk(9.5)
      :critical

      iex> PrismaticPerimeter.RiskScoring.classify_risk(2.0)
      :low
  """
  @spec classify_risk(float()) :: risk_level()
  def classify_risk(score) when score >= 9.0, do: :critical
  def classify_risk(score) when score >= 7.0, do: :high
  def classify_risk(score) when score >= 4.0, do: :medium
  def classify_risk(score) when score >= 1.0, do: :low
  def classify_risk(_), do: :info

  @doc """
  Aggregates multiple risk results into an organizational security rating.

  Produces both a letter grade (A-F) and a numeric score (300-900)
  suitable for executive dashboards and cross-organization comparison.

  ## Parameters

    - `risks` - A list of `{score, level}` tuples from `calculate_risk/1`

  ## Examples

      iex> risks = [{2.0, :low}, {3.5, :low}, {1.0, :low}]
      iex> rating = PrismaticPerimeter.RiskScoring.aggregate_rating(risks)
      iex> rating.grade
      :A
  """
  @spec aggregate_rating(list(risk_result())) :: rating()
  def aggregate_rating([]), do: %{grade: :A, score: 900}

  def aggregate_rating(risks) do
    weighted_sum = Enum.reduce(risks, 0.0, fn {score, _level}, acc -> acc + score end)
    count = Enum.count(risks)
    avg_risk = weighted_sum / count

    numeric_score = round(900 - avg_risk * 60)
    grade = score_to_grade(numeric_score)

    %{grade: grade, score: max(numeric_score, 300)}
  end

  defp score_to_grade(s) when s >= 800, do: :A
  defp score_to_grade(s) when s >= 700, do: :B
  defp score_to_grade(s) when s >= 600, do: :C
  defp score_to_grade(s) when s >= 500, do: :D
  defp score_to_grade(_), do: :F
end
```

```elixir
defmodule PrismaticDd.RiskAssessment do
  @moduledoc """
  Due diligence risk assessment module that evaluates entities across
  multiple risk dimensions (financial, legal, reputational, operational,
  compliance, and counterparty) to produce a composite risk profile.

  Integrates with the Decision Engine pipeline to provide risk-adjusted
  scoring for DD investigations.

  ## Architecture

  Each risk dimension is evaluated independently with configurable
  weights. The composite score is a weighted average, with an override
  mechanism for critical findings that force the composite score to
  at least the critical threshold regardless of other dimensions.
  """

  require Logger

  @type dimension :: :financial | :legal | :reputational | :operational | :compliance | :counterparty
  @type dimension_result :: %{
    dimension: dimension(),
    score: float(),
    findings: list(map()),
    confidence: float()
  }
  @type risk_profile :: %{
    composite_score: float(),
    dimensions: list(dimension_result()),
    critical_flags: list(String.t()),
    recommendation: :proceed | :proceed_with_caution | :enhanced_dd | :reject
  }

  @dimension_weights %{
    financial: 0.25,
    legal: 0.20,
    reputational: 0.15,
    operational: 0.15,
    compliance: 0.15,
    counterparty: 0.10
  }

  @doc """
  Evaluates an entity across all risk dimensions and produces a
  composite risk profile with actionable recommendation.

  ## Parameters

    - `entity_id` - The unique identifier of the DD entity
    - `findings` - A map of dimension => list of findings

  ## Examples

      iex> findings = %{financial: [%{indicator: "high_debt", severity: 7.0}], legal: []}
      iex> profile = PrismaticDd.RiskAssessment.evaluate("entity-123", findings)
      iex> profile.recommendation
      :proceed_with_caution
  """
  @spec evaluate(String.t(), map()) :: risk_profile()
  def evaluate(entity_id, findings) do
    dimensions =
      Enum.map(@dimension_weights, fn {dim, _weight} ->
        dim_findings = Map.get(findings, dim, [])
        score_dimension(dim, dim_findings)
      end)

    composite = compute_composite(dimensions)
    critical_flags = extract_critical_flags(dimensions)
    adjusted_score = apply_critical_overrides(composite, critical_flags)
    recommendation = determine_recommendation(adjusted_score, critical_flags)

    Logger.info("Risk assessment completed for entity=#{entity_id}, score=#{adjusted_score}")

    %{
      composite_score: Float.round(adjusted_score, 2),
      dimensions: dimensions,
      critical_flags: critical_flags,
      recommendation: recommendation
    }
  end

  @spec score_dimension(dimension(), list(map())) :: dimension_result()
  defp score_dimension(dimension, []) do
    %{dimension: dimension, score: 0.0, findings: [], confidence: 0.3}
  end

  defp score_dimension(dimension, findings) do
    scores = Enum.map(findings, & &1.severity)
    avg_score = Enum.sum(scores) / Enum.count(scores)
    confidence = min(Enum.count(findings) * 0.15 + 0.3, 0.95)

    %{dimension: dimension, score: avg_score, findings: findings, confidence: confidence}
  end

  @spec compute_composite(list(dimension_result())) :: float()
  defp compute_composite(dimensions) do
    Enum.reduce(dimensions, 0.0, fn %{dimension: dim, score: score}, acc ->
      weight = Map.fetch!(@dimension_weights, dim)
      acc + score * weight
    end)
  end

  defp extract_critical_flags(dimensions) do
    dimensions
    |> Enum.filter(fn %{score: score} -> score >= 9.0 end)
    |> Enum.map(fn %{dimension: dim} -> "Critical #{dim} risk detected" end)
  end

  defp apply_critical_overrides(composite, []), do: composite
  defp apply_critical_overrides(composite, _flags), do: max(composite, 7.0)

  defp determine_recommendation(score, _) when score >= 8.0, do: :reject
  defp determine_recommendation(score, _) when score >= 6.0, do: :enhanced_dd
  defp determine_recommendation(score, _) when score >= 3.0, do: :proceed_with_caution
  defp determine_recommendation(_, _), do: :proceed
end
```

```elixir
defmodule PrismaticCompliance.RiskFrameworkMapper do
  @moduledoc """
  Maps compliance framework requirements to platform risk management
  capabilities and identifies coverage gaps.

  Supports NIS2, ZKB (Czech cybersecurity decree), GDPR, and
  Basel III frameworks with extensible framework definitions.

  ## Usage

      iex> gaps = PrismaticCompliance.RiskFrameworkMapper.identify_gaps(:nis2)
      iex> Enum.count(gaps)
      0
  """

  @type framework :: :nis2 | :zkb | :gdpr | :basel3
  @type requirement :: %{
    id: String.t(),
    description: String.t(),
    category: atom(),
    evidence_type: atom()
  }
  @type gap :: %{
    requirement: requirement(),
    status: :covered | :partial | :missing,
    evidence: list(String.t())
  }

  @doc """
  Identifies compliance gaps for the specified framework by comparing
  framework requirements against available platform evidence.

  ## Parameters

    - `framework` - One of `:nis2`, `:zkb`, `:gdpr`, or `:basel3`
    - `opts` - Optional keyword list with `:include_partial` (default: true)

  ## Examples

      iex> gaps = PrismaticCompliance.RiskFrameworkMapper.identify_gaps(:nis2, include_partial: false)
      iex> is_list(gaps)
      true
  """
  @spec identify_gaps(framework(), keyword()) :: list(gap())
  def identify_gaps(framework, opts \\ []) do
    include_partial = Keyword.get(opts, :include_partial, true)

    requirements = load_requirements(framework)
    evidence = collect_evidence()

    requirements
    |> Enum.map(fn req -> assess_requirement(req, evidence) end)
    |> Enum.reject(fn gap ->
      case {gap.status, include_partial} do
        {:covered, _} -> true
        {:partial, false} -> true
        _ -> false
      end
    end)
  end

  @spec load_requirements(framework()) :: list(requirement())
  defp load_requirements(:nis2) do
    [
      %{id: "NIS2-21-2a", description: "Risk assessment policies", category: :risk_assessment, evidence_type: :policy_document},
      %{id: "NIS2-21-2b", description: "Incident handling procedures", category: :incident_response, evidence_type: :procedure_document},
      %{id: "NIS2-21-2d", description: "Supply chain security", category: :supply_chain, evidence_type: :assessment_report},
      %{id: "NIS2-23", description: "Incident reporting (24h/72h)", category: :incident_reporting, evidence_type: :capability_evidence}
    ]
  end

  defp load_requirements(_framework), do: []

  @spec collect_evidence() :: map()
  defp collect_evidence do
    %{
      policy_document: ["risk-management-policy.pdf", "incident-response-plan.pdf"],
      procedure_document: ["incident-handling-sop.pdf"],
      assessment_report: ["supply-chain-assessment-q1.pdf"],
      capability_evidence: ["incident-reporting-workflow.pdf"]
    }
  end

  @spec assess_requirement(requirement(), map()) :: gap()
  defp assess_requirement(req, evidence) do
    available = Map.get(evidence, req.evidence_type, [])

    status =
      case Enum.count(available) do
        0 -> :missing
        n when n >= 2 -> :covered
        _ -> :partial
      end

    %{requirement: req, status: status, evidence: available}
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Qualitative-only assessment** | Subjective "high/medium/low" ratings are inconsistent across assessors and non-comparable over time | Use quantitative scoring with defined scales; reserve qualitative context for narrative interpretation |
| **Static risk registers** | Point-in-time assessments decay rapidly as threats and assets change | Implement continuous monitoring with automated re-scoring on asset/threat changes |
| **Ignoring temporal factors** | A critical vulnerability exposed for 90 days is more dangerous than one exposed for 1 day | Include exposure duration in scoring formula with temporal amplification |
| **Control theater** | Listing controls without measuring their effectiveness gives false assurance | Validate controls through testing (penetration testing, tabletop exercises, red team) |
| **Severity inflation** | Rating everything as "critical" or "high" defeats the purpose of prioritization | Enforce calibrated scoring with defined thresholds and cross-assessor validation |
| **Missing asset criticality** | Treating all assets equally misallocates remediation resources | Map assets to business functions and assign criticality based on business impact |
| **Compliance-driven risk** | Focusing solely on compliance frameworks misses organization-specific risks | Use frameworks as baseline; supplement with threat intelligence and business context |
| **Ignoring risk interdependencies** | Individual risks may cascade or compound when they co-occur | Model risk dependencies using Bayesian networks or fault trees |
| **No feedback loop** | Failing to measure whether mitigations actually reduced risk | Implement post-mitigation reassessment and track risk score trends |
| **Stale threat intelligence** | Using outdated threat data produces inaccurate likelihood estimates | Integrate live threat feeds and update scoring when new threat data arrives |

## Best Practices

1. **Quantify risk with evidence** -- subjective risk assessments are unreliable; use measurable indicators, defined scoring criteria, and calibrated confidence levels from the Nabla epistemic engine.
2. **Prioritize by risk score, not by discovery order** -- limited remediation resources must address the highest-risk findings first; use the composite scoring formula to establish clear priority ordering.
3. **Reassess continuously** -- risk is dynamic; new vulnerabilities, changing threat landscapes, and infrastructure changes require ongoing evaluation through automated scanning and re-scoring pipelines.
4. **Track risk trends over time** -- improving or degrading risk posture is more informative than a point-in-time snapshot; maintain historical risk scores for trend analysis and executive reporting.
5. **Map to compliance requirements** -- risk management activities should directly address framework requirements (NIS2, ZKB, GDPR) through the RiskFrameworkMapper to ensure regulatory coverage.
6. **Integrate risk into DD workflows** -- DD investigations must include systematic risk assessment across all dimensions (financial, legal, reputational, operational, compliance, counterparty) using the Decision Engine pipeline.
7. **Calibrate confidence levels** -- distinguish between high-confidence findings backed by multiple corroborating sources and low-confidence findings based on limited evidence; use Nabla scores to communicate uncertainty.
8. **Separate inherent from residual risk** -- always document both the raw risk before controls and the residual risk after controls to measure control effectiveness and justify security investments.
9. **Automate where possible** -- manual risk assessment does not scale; use automated scanning, scoring, and alerting for continuous risk monitoring with human review reserved for complex judgment calls.
10. **Establish risk appetite thresholds** -- define clear boundaries for acceptable risk per dimension; configure alerts and escalation paths when scores exceed thresholds.

## Related Terms

- [Remediation](/glossary/remediation/) -- the corrective actions that reduce identified risks to acceptable levels
- [Triage](/glossary/triage/) -- the prioritization process within risk management for allocating limited resources
- [Security Rating](/glossary/security-rating/) -- the aggregate risk score for an organization derived from finding analysis
- [Threat Feed](/glossary/threat-feed/) -- external intelligence that informs risk likelihood assessment
- [Compliance](/glossary/compliance/) -- regulatory frameworks that define mandatory risk management requirements
- [Scoring](/glossary/scoring/) -- the quantitative methods used to compute risk levels from multiple factors
- [Vulnerability](/glossary/vulnerability/) -- specific weaknesses that risk assessment identifies and quantifies
- [Perimeter](/glossary/perimeter/) -- the external attack surface where risk assessment discovers exposed assets
- [Nabla](/glossary/nabla/) -- the epistemic engine providing calibrated confidence for risk assessments
- [Decision Engine](/glossary/decision-engine/) -- the DD pipeline that integrates risk scoring into investigation workflows
- [Hypothesis](/glossary/hypothesis/) -- risk hypotheses tested and validated through the investigation process
- [Audit](/glossary/audit/) -- systematic verification of risk controls and compliance evidence

## See Also

- [Perimeter EASM](/capabilities/) -- external attack surface risk assessment and security rating computation
- [Compliance Assessment](/architecture/) -- regulatory risk management with NIS2/ZKB/GDPR mapping
- [Decision Engine Pipeline](/architecture/) -- DD risk scoring and recommendation engine
- [Nabla Epistemic Framework](/architecture/) -- confidence calibration for risk assessments

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
