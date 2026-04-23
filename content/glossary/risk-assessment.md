+++
title = "Risk Assessment"
description = "Systematic process of identifying, analyzing, and evaluating risks to determine their likelihood and impact, enabling evidence-based decisions about risk treatment and resource allocation."
weight = 50

[extra]
category = "security"
tags = ["risk-assessment", "security", "compliance", "easm", "nis2", "zkb", "scoring", "threat-intelligence", "vulnerability"]
related_terms = ["security-rating", "vulnerability-assessment", "threat-assessment", "compliance-framework", "prismatic-perimeter", "attack-surface", "security-audit", "confidence-scoring", "risk-score", "sanctions-screening"]
date_created = "2026-02-22"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
version = "1.0.0"
tldr = "Risk assessment is the systematic identification, analysis, and evaluation of risks to determine their likelihood and potential impact, forming the evidential basis for security ratings, compliance decisions, and resource allocation in the Prismatic Platform."
word_count = 1401
date_modified = "2026-02-23"
keywords = ["Risk", "Assessment", "Systematic", "glossary", "security", "Prismatic Platform", "Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Risk Assessment - Prismatic Platform"
+++

## Definition

Risk assessment is a systematic, evidence-based process of identifying threats and vulnerabilities, analyzing the likelihood and potential impact of adverse events, and evaluating the resulting risks against acceptance criteria to determine appropriate treatment strategies. In information security, risk assessment provides the analytical foundation for all security decisions -- from prioritizing vulnerability remediation to allocating security budgets, from regulatory compliance to insurance underwriting.

A risk assessment answers three fundamental questions: What can go wrong? How likely is it? How bad would it be? The answers are expressed as risk values that combine likelihood (probability of occurrence) and impact (consequence severity), producing a risk magnitude that can be compared, ranked, and tracked over time. This quantification transforms subjective security concerns into actionable, measurable data that supports rational decision-making.

Modern risk assessment has evolved from periodic, manual exercises (annual risk assessments conducted by consultants) to continuous, automated processes that integrate with real-time threat intelligence, [vulnerability](@/glossary/vulnerability-assessment.md) scanning, and attack surface monitoring. The Prismatic Platform implements continuous risk assessment through its [Perimeter](@/glossary/prismatic-perimeter.md) module, which combines asset discovery, vulnerability detection, and evidence-based scoring to produce real-time [security ratings](@/glossary/security-rating.md) for monitored organizations.

## Risk Assessment Frameworks

Several industry-standard frameworks provide structured methodologies for conducting risk assessments:

| Framework | Origin | Focus | Approach |
|-----------|--------|-------|----------|
| **ISO 27005** | ISO/IEC | Information security risk management | Process-oriented, asset-based |
| **NIST SP 800-30** | NIST (US) | IT risk assessment guide | Threat-source/event/vulnerability model |
| **FAIR** | Open Group | Quantitative risk analysis | Financial impact quantification |
| **OCTAVE** | CMU/SEI | Organizational risk | Self-directed, operationally focused |
| **CRAMM** | UK CCTA | Comprehensive risk analysis | Asset valuation, countermeasure selection |
| **EBIOS** | ANSSI (France) | Threat scenario risk | Stakeholder-driven, scenario-based |

The Prismatic Platform's risk assessment methodology draws primarily from NIST SP 800-30 for its threat taxonomy and ISO 27005 for its process structure, while incorporating FAIR principles for quantitative scoring where sufficient data exists.

## The Risk Assessment Process

Risk assessment follows a structured lifecycle that moves from identification through analysis to evaluation:

```
 Asset Discovery     Threat Identification     Vulnerability Detection
       |                      |                         |
       v                      v                         v
  +---------+          +------------+            +-------------+
  | Assets  |--------->| Threat     |----------->| Risk        |
  | Inventory|         | Scenarios  |            | Analysis    |
  +---------+          +------------+            +-------------+
                                                       |
                                                       v
                                              +----------------+
                                              | Risk Evaluation|
                                              | (Likelihood x  |
                                              |  Impact)       |
                                              +----------------+
                                                       |
                                                       v
                                              +----------------+
                                              | Risk Treatment |
                                              | Decision       |
                                              +----------------+
```

### Phase 1: Context Establishment

Before assessing risks, the scope and criteria must be defined:

| Parameter | Description | Example |
|-----------|------------|---------|
| **Scope** | What is being assessed | Organization's external attack surface |
| **Risk Appetite** | Acceptable risk level | Score above 700 (A-B rating) |
| **Assessment Criteria** | How risks are measured | CVSS for vulnerabilities, EPSS for likelihood |
| **Stakeholders** | Who consumes the results | CISO, compliance team, board |
| **Regulatory Context** | Applicable regulations | [NIS2](@/glossary/zkb.md), ZKB 264/2025 Sb. |

### Phase 2: Risk Identification

Risk identification discovers what could go wrong by combining asset inventory with threat intelligence:

| Source | Method | Output |
|--------|--------|--------|
| **Asset Discovery** | DNS enumeration, certificate transparency, port scanning | Asset inventory |
| **Vulnerability Scanning** | CVE detection, misconfiguration checks | Vulnerability list |
| **Threat Intelligence** | [OSINT](@/glossary/shodan.md) feeds, breach databases, dark web monitoring | Threat indicators |
| **Compliance Gaps** | Framework mapping, control assessment | Non-conformities |
| **Historical Incidents** | Incident database, breach records | Pattern indicators |

### Phase 3: Risk Analysis

Risk analysis determines the likelihood and impact of each identified risk:

| Factor | Quantitative Approach | Qualitative Approach |
|--------|---------------------|---------------------|
| **Likelihood** | EPSS score (0.0 - 1.0), historical frequency | Very Low / Low / Medium / High / Critical |
| **Impact** | Financial loss estimate (FAIR model) | Negligible / Minor / Moderate / Major / Catastrophic |
| **Risk Value** | Likelihood x Impact = Expected Annual Loss | Risk Matrix position |
| **Confidence** | Statistical confidence interval | Assessment certainty level |

### Phase 4: Risk Evaluation

Risk evaluation compares analyzed risks against acceptance criteria to determine treatment priority:

| Risk Level | Score Range | Treatment | Response Time |
|-----------|-----------|----------|--------------|
| **Critical** | 9.0 - 10.0 | Immediate remediation | 24 hours |
| **High** | 7.0 - 8.9 | Priority remediation | 7 days |
| **Medium** | 4.0 - 6.9 | Scheduled remediation | 30 days |
| **Low** | 2.0 - 3.9 | Accept or mitigate | 90 days |
| **Informational** | 0.0 - 1.9 | Accept and monitor | Next review cycle |

## Implementation in Elixir

The Prismatic Platform implements risk assessment as a composable pipeline of assessment stages, each producing evidence artifacts with [confidence scores](@/glossary/confidence-scoring.md):

```elixir
defmodule PrismaticPerimeter.RiskAssessment do
  @moduledoc """
  Evidence-based risk assessment engine for external attack surface monitoring.
  Combines asset discovery, vulnerability detection, and threat intelligence
  into a unified risk score with confidence levels.
  """

  alias PrismaticPerimeter.{AssetDiscovery, VulnerabilityScanner, ThreatIntel}
  alias PrismaticPerimeter.Scoring.{RiskCalculator, ConfidenceWeighter}

  @type risk_level :: :critical | :high | :medium | :low | :informational
  @type assessment_result :: %{
    domain: String.t(),
    risk_score: float(),
    grade: atom(),
    confidence: float(),
    findings: [finding()],
    compliance: map()
  }

  @spec assess(String.t(), keyword()) :: {:ok, assessment_result()} | {:error, term()}
  def assess(domain, opts \\ []) do
    frameworks = Keyword.get(opts, :frameworks, [:nis2, :zkb])

    with {:ok, assets} <- AssetDiscovery.discover(domain),
         {:ok, vulns} <- VulnerabilityScanner.scan(assets),
         {:ok, threats} <- ThreatIntel.enrich(assets),
         {:ok, compliance} <- assess_compliance(assets, vulns, frameworks) do
      findings = merge_findings(vulns, threats)
      risk_score = RiskCalculator.calculate(findings, assets)
      confidence = ConfidenceWeighter.compute(findings)
      grade = score_to_grade(risk_score)

      {:ok, %{
        domain: domain,
        risk_score: risk_score,
        grade: grade,
        confidence: confidence,
        findings: findings,
        compliance: compliance,
        assessed_at: DateTime.utc_now(),
        asset_count: length(assets)
      }}
    end
  end

  @spec score_to_grade(float()) :: atom()
  defp score_to_grade(score) when score >= 850, do: :A
  defp score_to_grade(score) when score >= 700, do: :B
  defp score_to_grade(score) when score >= 550, do: :C
  defp score_to_grade(score) when score >= 400, do: :D
  defp score_to_grade(_score), do: :F
end
```

## Risk Scoring Model

The Prismatic Platform uses a numeric scoring system (300-900) mapped to letter grades, similar to credit scoring models used by SecurityScorecard and BitSight:

| Grade | Score Range | Risk Level | Interpretation |
|-------|-----------|-----------|---------------|
| **A** | 850 - 900 | Minimal | Excellent security posture, proactive controls |
| **B** | 700 - 849 | Low | Good security posture, minor improvements possible |
| **C** | 550 - 699 | Moderate | Adequate security posture, several gaps to address |
| **D** | 400 - 549 | High | Poor security posture, significant remediation needed |
| **F** | 300 - 399 | Critical | Severe security deficiencies, immediate action required |

The score is computed from weighted risk categories:

```elixir
defmodule PrismaticPerimeter.Scoring.RiskCalculator do
  @moduledoc "Weighted risk score calculation from assessment findings."

  @category_weights %{
    network_security: 0.20,
    dns_health: 0.10,
    patching_cadence: 0.15,
    endpoint_security: 0.10,
    ip_reputation: 0.10,
    application_security: 0.15,
    leaked_credentials: 0.10,
    social_engineering: 0.10
  }

  @spec calculate([finding()], [asset()]) :: float()
  def calculate(findings, assets) do
    category_scores =
      findings
      |> Enum.group_by(& &1.category)
      |> Enum.map(fn {category, cat_findings} ->
        weight = Map.get(@category_weights, category, 0.05)
        category_score = compute_category_score(cat_findings, assets)
        {category, category_score * weight}
      end)

    base_score = category_scores |> Enum.map(&elem(&1, 1)) |> Enum.sum()
    normalize_to_range(base_score, 300, 900)
  end

  defp compute_category_score(findings, assets) do
    severity_penalties =
      findings
      |> Enum.map(&severity_to_penalty/1)
      |> Enum.sum()

    max(0.0, 1.0 - severity_penalties / max(length(assets), 1))
  end

  defp severity_to_penalty(%{severity: :critical}), do: 0.40
  defp severity_to_penalty(%{severity: :high}), do: 0.20
  defp severity_to_penalty(%{severity: :medium}), do: 0.10
  defp severity_to_penalty(%{severity: :low}), do: 0.03
  defp severity_to_penalty(_), do: 0.01
end
```

## Compliance Assessment

Risk assessment feeds directly into compliance evaluation. The Prismatic Platform maps risk findings to regulatory requirements for [NIS2](@/glossary/compliance-framework.md) Directive (EU 2022/2555) and ZKB 264/2025 Sb. (Czech cybersecurity law):

| Regulation | Scope | Key Requirements | Assessment Method |
|-----------|-------|-----------------|------------------|
| **NIS2** | Essential and important EU entities | Risk management, incident reporting, supply chain security | Control mapping against 21 security measures |
| **ZKB 264/2025** | Czech critical infrastructure | Asset management, access control, incident handling | Control mapping against 30 technical measures |
| **GDPR** | Personal data processors | Data protection impact assessment | Data flow analysis, control verification |
| **ISO 27001** | ISMS-certified organizations | Annex A control compliance | 93 controls across 4 themes |

```elixir
defmodule PrismaticPerimeter.Compliance.NIS2Assessor do
  @moduledoc "NIS2 Directive compliance assessment based on risk findings."

  @nis2_measures [
    :risk_analysis_policies,
    :incident_handling,
    :business_continuity,
    :supply_chain_security,
    :network_security,
    :vulnerability_handling,
    :effectiveness_assessment,
    :cryptography_encryption,
    :access_control,
    :multi_factor_auth
  ]

  @spec assess([finding()], [asset()]) :: {:ok, compliance_result()}
  def assess(findings, assets) do
    results =
      @nis2_measures
      |> Enum.map(fn measure ->
        relevant = Enum.filter(findings, &measure_relevant?(&1, measure))
        status = evaluate_measure(measure, relevant, assets)
        {measure, status}
      end)
      |> Map.new()

    overall = compute_overall_compliance(results)

    {:ok, %{
      framework: :nis2,
      measures: results,
      overall_score: overall,
      compliant: overall >= 0.80,
      gaps: identify_gaps(results)
    }}
  end
end
```

## Confidence Scoring

Every risk assessment in the Prismatic Platform carries a [confidence score](@/glossary/confidence-scoring.md) that quantifies the reliability of the assessment. This aligns with the platform's NABLA epistemic framework, where claims require evidence provenance:

| Confidence Level | Range | Interpretation | Action |
|-----------------|-------|---------------|--------|
| **High** | 0.85 - 1.00 | Multiple independent evidence sources, recent data | Act on findings |
| **Medium** | 0.60 - 0.84 | Some evidence, partially corroborated | Act with awareness of uncertainty |
| **Low** | 0.40 - 0.59 | Limited evidence, aged data, single source | Investigate further before acting |
| **Very Low** | 0.00 - 0.39 | Insufficient evidence | Do not act, collect more data |

```elixir
defmodule PrismaticPerimeter.Scoring.ConfidenceWeighter do
  @moduledoc "Computes confidence scores for risk assessment findings."

  @spec compute([finding()]) :: float()
  def compute(findings) do
    if Enum.empty?(findings) do
      0.0
    else
      findings
      |> Enum.map(&finding_confidence/1)
      |> then(fn scores ->
        Enum.sum(scores) / length(scores)
      end)
      |> Float.round(3)
    end
  end

  defp finding_confidence(finding) do
    base = source_reliability(finding.source)
    age_factor = data_freshness(finding.observed_at)
    corroboration = corroboration_factor(finding.corroborating_sources)

    min(1.0, base * age_factor * corroboration)
  end

  defp source_reliability(:active_scan), do: 0.95
  defp source_reliability(:certificate_transparency), do: 0.90
  defp source_reliability(:dns_query), do: 0.90
  defp source_reliability(:osint_feed), do: 0.70
  defp source_reliability(:passive_observation), do: 0.60
  defp source_reliability(_), do: 0.50

  defp data_freshness(observed_at) do
    age_hours = DateTime.diff(DateTime.utc_now(), observed_at, :hour)

    cond do
      age_hours < 24 -> 1.0
      age_hours < 168 -> 0.90
      age_hours < 720 -> 0.75
      age_hours < 2160 -> 0.50
      true -> 0.30
    end
  end
end
```

## Attack Surface Risk Assessment

The [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) module specializes in External Attack Surface Management (EASM), where risk assessment focuses on externally visible assets:

| Asset Type | Discovery Method | Risk Factors | Typical Findings |
|-----------|----------------|-------------|-----------------|
| **Domains** | DNS enumeration, subdomain brute-force | Dangling DNS, subdomain takeover | Expired subdomains, misconfigured CNAME |
| **IP Addresses** | DNS resolution, BGP analysis | Open ports, known-bad reputation | Exposed admin interfaces, unpatched services |
| **Certificates** | Certificate Transparency logs | Expiry, weak algorithms, SANs | Expired certs, SHA-1 usage, wildcard overuse |
| **Web Applications** | HTTP probing, technology fingerprinting | OWASP Top 10 vulnerabilities | Missing security headers, outdated frameworks |
| **Cloud Resources** | Cloud provider API, DNS patterns | Misconfiguration, public exposure | Open S3 buckets, public databases |
| **Email Infrastructure** | MX/SPF/DKIM/DMARC analysis | Spoofing susceptibility | Missing DMARC, weak SPF policies |

## Risk Treatment Strategies

After evaluation, each risk receives a treatment decision:

| Strategy | Description | When to Use | Example |
|----------|------------|------------|---------|
| **Mitigate** | Reduce likelihood or impact | Risk above appetite, cost-effective controls exist | Patch critical vulnerability |
| **Accept** | Acknowledge and monitor | Risk within appetite, treatment cost exceeds impact | Low-severity informational finding |
| **Transfer** | Share risk with third party | Financial risk, insurable events | Cyber insurance, SLA with vendor |
| **Avoid** | Eliminate the risk source | Risk unacceptable, no effective controls | Decommission exposed legacy system |

## Continuous Risk Monitoring

The Prismatic Platform implements continuous risk assessment rather than point-in-time snapshots. Risk scores update in real-time as new evidence arrives:

```elixir
defmodule PrismaticPerimeter.RiskMonitor do
  @moduledoc "Continuous risk monitoring with event-driven score updates."
  use GenServer

  alias PrismaticPerimeter.RiskAssessment

  @reassessment_interval :timer.minutes(15)

  @impl GenServer
  def init(opts) do
    domains = Keyword.fetch!(opts, :domains)
    schedule_reassessment()

    {:ok, %{domains: domains, scores: %{}, last_assessed: %{}}}
  end

  @impl GenServer
  def handle_info(:reassess, state) do
    updated_scores =
      state.domains
      |> Task.async_stream(&reassess_domain/1, max_concurrency: 5, timeout: 30_000)
      |> Enum.reduce(state.scores, fn
        {:ok, {:ok, result}}, acc ->
          emit_score_change(acc, result)
          Map.put(acc, result.domain, result)

        {:ok, {:error, _reason}}, acc ->
          acc
      end)

    schedule_reassessment()
    {:noreply, %{state | scores: updated_scores}}
  end

  defp reassess_domain(domain) do
    RiskAssessment.assess(domain, frameworks: [:nis2, :zkb])
  end

  defp emit_score_change(previous_scores, new_result) do
    case Map.get(previous_scores, new_result.domain) do
      nil -> :ok
      prev when prev.risk_score != new_result.risk_score ->
        :telemetry.execute(
          [:prismatic, :perimeter, :risk_score_changed],
          %{old_score: prev.risk_score, new_score: new_result.risk_score},
          %{domain: new_result.domain, grade: new_result.grade}
        )
      _ -> :ok
    end
  end

  defp schedule_reassessment do
    Process.send_after(self(), :reassess, @reassessment_interval)
  end
end
```

## Dashboard Visualization

Risk assessment results are presented through a [LiveView](@/glossary/phoenix-liveview.md) dashboard at `/perimeter`:

| Widget | Data Source | Update Frequency |
|--------|-----------|-----------------|
| **Security Rating** | Overall risk score with letter grade | Real-time |
| **Risk Trend** | 30-day risk score history chart | Every 15 minutes |
| **Top Risks** | Highest severity findings ranked | Real-time |
| **Compliance Status** | NIS2/ZKB compliance percentage | On assessment |
| **Asset Inventory** | Discovered assets with risk annotations | On discovery |
| **Threat Map** | Geographic distribution of threat sources | Hourly |

## Context in Prismatic

Risk assessment is a central capability of the [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) EASM module. The platform combines automated [attack surface](@/glossary/attack-surface.md) discovery with evidence-based risk scoring to produce [security ratings](@/glossary/security-rating.md) (A-F grades, 300-900 numeric scores) that compete with commercial platforms like BitSight and SecurityScorecard. Every assessment carries [confidence scores](@/glossary/confidence-scoring.md) in compliance with the platform's NABLA epistemic framework, ensuring that risk decisions are backed by verifiable evidence with known reliability levels.

The risk assessment engine integrates with 120+ [OSINT](@/glossary/shodan.md) tools and adapters for threat intelligence enrichment, and maps findings to regulatory frameworks including NIS2 Directive and ZKB 264/2025 Sb. for [compliance](@/glossary/compliance-framework.md) assessment.

## Related Terms

- [Security Rating](@/glossary/security-rating.md) -- Quantified output of the risk assessment process
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- Technical scanning that feeds into risk analysis
- [Threat Assessment](@/glossary/threat-assessment.md) -- Threat identification informing risk likelihood
- [Attack Surface](@/glossary/attack-surface.md) -- Scope of assets subject to risk assessment
- [Compliance Framework](@/glossary/compliance-framework.md) -- Regulatory requirements evaluated through risk assessment
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Reliability measure for risk assessment findings
- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- EASM module implementing continuous risk assessment
- [Risk Score](@/glossary/risk-score.md) -- Numeric representation of assessed risk magnitude
- [Sanctions Screening](@/glossary/sanctions-screening.md) -- Regulatory screening integrated with risk assessment
- [Security Audit](@/glossary/security-audit.md) -- Formal review validating risk assessment accuracy
- [Shodan](@/glossary/shodan.md) -- OSINT source enriching risk assessment with internet intelligence
- [Trinity Gate](@/glossary/trinity-gate.md) -- Epistemic verification ensuring risk claims meet evidence standards

## See Also

- [Architecture](@/architecture/_index.md) -- Platform security architecture
- [Capabilities](@/capabilities/_index.md) -- EASM and risk assessment capabilities
- [OSINT](@/osint/_index.md) -- Intelligence tools feeding risk assessment
- [Teams](@/teams/_index.md) -- Security teams conducting risk assessment

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
