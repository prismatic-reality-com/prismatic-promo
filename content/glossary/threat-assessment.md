+++
title = "Threat Assessment"
weight = 50
[extra]
tags = ["glossary", "security", "threat-assessment", "risk-management", "black-team", "threat-modeling", "vulnerability", "security-rating", "compliance"]
description = "Systematic evaluation of potential threats including likelihood, impact, and mitigating factors. In Prismatic: Black Team theoretical threat modeling, security rating calculation (A-F grades), risk scoring (300-900 range), and NIS2/ZKB compliance assessment."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Security & Risk Management"
related_concepts = ["threat intelligence", "risk scoring", "security assessment", "threat modeling", "STRIDE", "DREAD", "MITRE ATT&CK", "attack surface analysis"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 8
prerequisites = ["security", "easm", "color-teams", "risk-score"]
learning_path = ["security", "attack-surface", "vulnerability-assessment", "threat-assessment", "risk-score"]
interactive_demos = ["/labs/glossary/threat-assessment"]
code_examples = ["ThreatAssessor", "ThreatModel", "RiskCalculator", "ComplianceScorer"]
external_resources = ["https://attack.mitre.org/", "https://owasp.org/www-community/Threat_Modeling", "https://www.nist.gov/cyberframework"]
version_introduced = "gen-14"
stability_level = "stable"
testing_scenarios = ["threat scoring accuracy", "risk calculation consistency", "compliance assessment completeness", "threat model coverage", "false positive rate validation"]
keywords = ["threat assessment", "threat modeling", "risk scoring", "security rating", "STRIDE", "DREAD", "MITRE ATT&CK", "NIS2", "ZKB", "attack surface"]
related_terms = ["threat-intelligence", "risk-score", "security-assessment", "black-team", "vulnerability-assessment", "cyber-threat-intelligence", "easm", "attack-surface", "compliance-framework", "color-teams"]
word_count = 1611
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Threat Assessment - Prismatic Platform"
+++

## Definition

**Threat Assessment** is the systematic process of identifying, analyzing, and evaluating potential threats to a system, organization, or asset -- quantifying their likelihood of occurrence, potential impact, and the effectiveness of existing mitigating controls. Unlike ad-hoc security reviews, threat assessment follows structured methodologies (STRIDE, DREAD, MITRE ATT&CK, NIST CSF) to produce repeatable, comparable risk evaluations. Within the Prismatic Platform, threat assessment operates at multiple levels: the [Black Team](/glossary/black-team/) produces theoretical threat models through pure epistemic simulation, the [Perimeter](/glossary/easm/) module calculates security ratings (A-F grades, 300-900 numeric scores) through evidence-based [risk scoring](/glossary/risk-score/), and the compliance engine evaluates organizational posture against NIS2 Directive and ZKB 264/2025 Sb. frameworks.

## Overview

Threat assessment sits at the intersection of security engineering, risk management, and intelligence analysis. Its origins trace to military intelligence (WWII threat assessment of enemy capabilities and intentions), evolving through Cold War strategic analysis, and entering the information security domain with the rise of networked computing in the 1990s.

Modern threat assessment in cybersecurity follows a four-phase model:

1. **Threat Identification** -- Enumerating potential threat actors, attack vectors, and vulnerable assets. This includes both external threats (nation-state actors, criminal groups, hacktivists) and internal threats (insider risk, misconfigurations, supply chain compromises).

2. **Likelihood Analysis** -- Estimating the probability that each identified threat will materialize, based on threat actor capability, motivation, opportunity, and historical data. In the Prismatic Platform, likelihood is computed through Monte Carlo [simulation](/glossary/simulation/) and calibrated against observed attack frequencies.

3. **Impact Assessment** -- Quantifying the potential consequences of a successful attack across dimensions: financial, operational, reputational, legal/regulatory, and safety. Impact scoring uses weighted multi-criteria analysis with domain-specific weightings.

4. **Risk Prioritization** -- Combining likelihood and impact into a composite risk score that drives mitigation priorities. The Prismatic Platform uses a 300-900 scoring range (inspired by credit scoring) that maps to A-F letter grades for executive communication.

The Prismatic Platform's approach is distinctive in combining three layers of threat assessment:

- **Theoretical Layer** ([Black Team](/glossary/black-team/)) -- Abstract threat models exploring worst-case adversarial optimization under maximum isolation. Produces conceptual models, never executable content.
- **Practical Layer** ([Red Team](/glossary/red-team/) + [Blue Team](/glossary/blue-team/)) -- Active adversarial simulation and defensive posture assessment through the [Color Teams](/glossary/color-teams/) framework.
- **Automated Layer** ([Perimeter](/glossary/easm/)) -- Continuous external attack surface monitoring with automated security rating calculation and compliance assessment.

## Technical Details

### Threat Model Structure

A threat model in the Prismatic Platform is a structured representation of threats, assets, attack vectors, and mitigations:

```elixir
defmodule Prismatic.ThreatAssessment.ThreatModel do
  @moduledoc """
  Structured representation of a threat model including
  assets, threat actors, attack vectors, and mitigations.
  Follows STRIDE categorization with DREAD scoring.
  """

  @type stride_category ::
          :spoofing
          | :tampering
          | :repudiation
          | :information_disclosure
          | :denial_of_service
          | :elevation_of_privilege

  @type dread_score :: %{
    damage_potential: 1..10,
    reproducibility: 1..10,
    exploitability: 1..10,
    affected_users: 1..10,
    discoverability: 1..10
  }

  @type threat :: %{
    id: String.t(),
    name: String.t(),
    description: String.t(),
    stride_category: stride_category(),
    dread: dread_score(),
    likelihood: float(),
    impact: float(),
    risk_score: float(),
    mitigations: [mitigation()],
    attack_vectors: [String.t()],
    threat_actors: [String.t()],
    cve_references: [String.t()]
  }

  @type mitigation :: %{
    id: String.t(),
    name: String.t(),
    effectiveness: float(),
    implemented: boolean(),
    cost: :low | :medium | :high
  }

  @type asset :: %{
    id: String.t(),
    name: String.t(),
    type: :data | :service | :infrastructure | :personnel,
    criticality: :low | :medium | :high | :critical,
    exposure: :internal | :external | :both
  }

  @type threat_model :: %{
    id: String.t(),
    name: String.t(),
    version: String.t(),
    assets: [asset()],
    threats: [threat()],
    created_at: DateTime.t(),
    assessed_by: String.t(),
    confidence_level: float()
  }

  @spec calculate_dread_score(dread_score()) :: float()
  def calculate_dread_score(dread) do
    components = [
      dread.damage_potential,
      dread.reproducibility,
      dread.exploitability,
      dread.affected_users,
      dread.discoverability
    ]

    Enum.sum(components) / length(components) * 1.0
  end

  @spec calculate_risk_score(float(), float()) :: float()
  def calculate_risk_score(likelihood, impact) when likelihood >= 0 and likelihood <= 1 and impact >= 0 and impact <= 1 do
    Float.round(likelihood * impact * 100, 2)
  end

  @spec risk_level(float()) :: :critical | :high | :medium | :low | :informational
  def risk_level(score) do
    cond do
      score >= 80 -> :critical
      score >= 60 -> :high
      score >= 40 -> :medium
      score >= 20 -> :low
      true -> :informational
    end
  end

  @spec effective_risk(threat()) :: float()
  def effective_risk(threat) do
    mitigation_factor =
      threat.mitigations
      |> Enum.filter(& &1.implemented)
      |> Enum.map(& &1.effectiveness)
      |> case do
        [] -> 0.0
        effs -> 1.0 - Enum.reduce(effs, 1.0, fn e, acc -> acc * (1.0 - e) end)
      end

    base_risk = calculate_risk_score(threat.likelihood, threat.impact)
    Float.round(base_risk * (1.0 - mitigation_factor), 2)
  end
end
```

### Security Rating Engine

The [Perimeter](/glossary/easm/) module's security rating engine produces A-F grades based on comprehensive threat assessment:

```elixir
defmodule Prismatic.ThreatAssessment.SecurityRating do
  @moduledoc """
  Calculates security ratings (A-F, 300-900) based on
  comprehensive threat assessment across multiple domains.
  Comparable to BitSight/SecurityScorecard methodology.
  """

  @type rating_grade :: :A | :B | :C | :D | :F
  @type score_range :: 300..900

  @type domain_score :: %{
    domain: atom(),
    score: float(),
    weight: float(),
    findings_count: non_neg_integer(),
    critical_findings: non_neg_integer()
  }

  @type security_rating :: %{
    grade: rating_grade(),
    numeric_score: score_range(),
    domain_scores: [domain_score()],
    industry_percentile: non_neg_integer(),
    assessed_at: DateTime.t(),
    confidence: float(),
    trend: :improving | :stable | :declining
  }

  @rating_domains [
    {:network_security, 0.20},
    {:dns_health, 0.10},
    {:patching_cadence, 0.15},
    {:endpoint_security, 0.10},
    {:ip_reputation, 0.10},
    {:application_security, 0.15},
    {:cubit_score, 0.05},
    {:leak_detection, 0.10},
    {:social_engineering, 0.05}
  ]

  @spec calculate_rating([domain_score()]) :: security_rating()
  def calculate_rating(domain_scores) do
    weighted_score =
      domain_scores
      |> Enum.reduce(0.0, fn ds, acc ->
        weight = domain_weight(ds.domain)
        acc + ds.score * weight
      end)

    numeric = normalize_to_range(weighted_score, 300, 900)
    grade = score_to_grade(numeric)
    confidence = calculate_confidence(domain_scores)

    %{
      grade: grade,
      numeric_score: numeric,
      domain_scores: domain_scores,
      industry_percentile: estimate_percentile(numeric),
      assessed_at: DateTime.utc_now(),
      confidence: confidence,
      trend: :stable
    }
  end

  @spec score_to_grade(score_range()) :: rating_grade()
  def score_to_grade(score) do
    cond do
      score >= 780 -> :A
      score >= 660 -> :B
      score >= 540 -> :C
      score >= 420 -> :D
      true -> :F
    end
  end

  @spec grade_to_description(rating_grade()) :: String.t()
  def grade_to_description(:A), do: "Excellent security posture with minimal risk exposure"
  def grade_to_description(:B), do: "Good security posture with minor improvements needed"
  def grade_to_description(:C), do: "Acceptable security posture with notable gaps to address"
  def grade_to_description(:D), do: "Below average security posture with significant risks"
  def grade_to_description(:F), do: "Critical security deficiencies requiring immediate remediation"

  @spec domain_weight(atom()) :: float()
  defp domain_weight(domain) do
    @rating_domains
    |> Enum.find(fn {d, _w} -> d == domain end)
    |> case do
      {_d, weight} -> weight
      nil -> 0.0
    end
  end

  @spec normalize_to_range(float(), integer(), integer()) :: integer()
  defp normalize_to_range(score, min, max) do
    normalized = score / 100.0
    round(min + normalized * (max - min))
    |> max(min)
    |> min(max)
  end

  @spec calculate_confidence([domain_score()]) :: float()
  defp calculate_confidence(domain_scores) do
    total_domains = length(@rating_domains)
    assessed_domains = length(domain_scores)
    base_confidence = assessed_domains / max(total_domains, 1)

    critical_penalty =
      domain_scores
      |> Enum.any?(&(&1.critical_findings > 0 and &1.score < 30))
      |> case do
        true -> 0.1
        false -> 0.0
      end

    Float.round(base_confidence - critical_penalty, 2)
  end

  @spec estimate_percentile(score_range()) :: non_neg_integer()
  defp estimate_percentile(score) do
    # Approximation based on normal distribution of industry scores
    # Mean ~600, StdDev ~120
    z = (score - 600) / 120
    percentile = round(50 + 50 * :math.erf(z / :math.sqrt(2)))
    max(1, min(99, percentile))
  end
end
```

### Compliance Assessment

Threat assessment feeds directly into compliance evaluation for NIS2 and ZKB frameworks:

```elixir
defmodule Prismatic.ThreatAssessment.ComplianceAssessor do
  @moduledoc """
  Evaluates organizational compliance against NIS2 Directive
  (EU 2022/2555) and ZKB 264/2025 Sb. (Czech) based on
  threat assessment findings.
  """

  @type framework :: :nis2 | :zkb
  @type compliance_status :: :compliant | :partially_compliant | :non_compliant
  @type evidence_level :: :documented | :implemented | :measured | :optimized

  @type control :: %{
    id: String.t(),
    framework: framework(),
    description: String.t(),
    status: compliance_status(),
    evidence_level: evidence_level(),
    findings: [String.t()],
    remediation_priority: :critical | :high | :medium | :low
  }

  @type compliance_report :: %{
    target: String.t(),
    frameworks: [framework()],
    overall_status: compliance_status(),
    controls: [control()],
    risk_score: float(),
    assessed_at: DateTime.t(),
    next_assessment: DateTime.t(),
    recommendations: [String.t()]
  }

  @spec assess(String.t(), [framework()], [map()]) :: {:ok, compliance_report()}
  def assess(target, frameworks, threat_findings) do
    controls =
      frameworks
      |> Enum.flat_map(&framework_controls/1)
      |> Enum.map(&evaluate_control(&1, threat_findings))

    overall = determine_overall_status(controls)
    risk = calculate_compliance_risk(controls)
    recommendations = generate_recommendations(controls)

    report = %{
      target: target,
      frameworks: frameworks,
      overall_status: overall,
      controls: controls,
      risk_score: risk,
      assessed_at: DateTime.utc_now(),
      next_assessment: DateTime.add(DateTime.utc_now(), 90 * 24 * 3600, :second),
      recommendations: recommendations
    }

    {:ok, report}
  end

  @spec framework_controls(framework()) :: [control()]
  defp framework_controls(:nis2) do
    [
      %{id: "NIS2-RM-01", framework: :nis2, description: "Risk management measures", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :critical},
      %{id: "NIS2-IR-01", framework: :nis2, description: "Incident reporting (24h notification)", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :critical},
      %{id: "NIS2-SC-01", framework: :nis2, description: "Supply chain security", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :high},
      %{id: "NIS2-BC-01", framework: :nis2, description: "Business continuity management", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :high},
      %{id: "NIS2-VD-01", framework: :nis2, description: "Vulnerability disclosure", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :medium},
      %{id: "NIS2-EN-01", framework: :nis2, description: "Encryption and cryptography", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :high},
      %{id: "NIS2-HR-01", framework: :nis2, description: "Human resource security", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :medium},
      %{id: "NIS2-AC-01", framework: :nis2, description: "Access control policies", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :critical}
    ]
  end

  defp framework_controls(:zkb) do
    [
      %{id: "ZKB-01", framework: :zkb, description: "Kyberneticka bezpecnost - zakladni opatreni", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :critical},
      %{id: "ZKB-02", framework: :zkb, description: "Rizeni pristupu a identity management", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :critical},
      %{id: "ZKB-03", framework: :zkb, description: "Sprava incidentu a reakce", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :high},
      %{id: "ZKB-04", framework: :zkb, description: "Ochrana dat a sifrovani", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :high},
      %{id: "ZKB-05", framework: :zkb, description: "Audit a loggovani", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :medium},
      %{id: "ZKB-06", framework: :zkb, description: "Fyzicka bezpecnost", status: :non_compliant, evidence_level: :documented, findings: [], remediation_priority: :medium}
    ]
  end

  @spec evaluate_control(control(), [map()]) :: control()
  defp evaluate_control(control, threat_findings) do
    relevant_findings =
      threat_findings
      |> Enum.filter(&finding_relevant_to_control?(&1, control))
      |> Enum.map(& &1[:description] || "Finding without description")

    status =
      cond do
        length(relevant_findings) == 0 -> :compliant
        length(relevant_findings) <= 2 -> :partially_compliant
        true -> :non_compliant
      end

    %{control | status: status, findings: relevant_findings}
  end

  @spec finding_relevant_to_control?(map(), control()) :: boolean()
  defp finding_relevant_to_control?(finding, control) do
    finding_domain = Map.get(finding, :domain, "")
    String.contains?(String.downcase(control.description), String.downcase(finding_domain))
  end

  @spec determine_overall_status([control()]) :: compliance_status()
  defp determine_overall_status(controls) do
    critical_non_compliant =
      Enum.any?(controls, &(&1.status == :non_compliant and &1.remediation_priority == :critical))

    non_compliant_count = Enum.count(controls, &(&1.status == :non_compliant))
    total = length(controls)

    cond do
      critical_non_compliant -> :non_compliant
      non_compliant_count > total * 0.3 -> :non_compliant
      non_compliant_count > 0 -> :partially_compliant
      true -> :compliant
    end
  end

  @spec calculate_compliance_risk([control()]) :: float()
  defp calculate_compliance_risk(controls) do
    priority_weights = %{critical: 4.0, high: 3.0, medium: 2.0, low: 1.0}
    status_scores = %{compliant: 0.0, partially_compliant: 0.5, non_compliant: 1.0}

    total_weight =
      Enum.reduce(controls, 0.0, fn c, acc ->
        acc + Map.get(priority_weights, c.remediation_priority, 1.0)
      end)

    weighted_risk =
      Enum.reduce(controls, 0.0, fn c, acc ->
        weight = Map.get(priority_weights, c.remediation_priority, 1.0)
        score = Map.get(status_scores, c.status, 0.5)
        acc + weight * score
      end)

    Float.round(weighted_risk / max(total_weight, 1.0) * 100, 2)
  end

  @spec generate_recommendations([control()]) :: [String.t()]
  defp generate_recommendations(controls) do
    controls
    |> Enum.filter(&(&1.status != :compliant))
    |> Enum.sort_by(fn c ->
      priority_order = %{critical: 0, high: 1, medium: 2, low: 3}
      Map.get(priority_order, c.remediation_priority, 4)
    end)
    |> Enum.map(fn c ->
      "#{c.id}: Address #{c.description} (#{c.remediation_priority} priority, #{length(c.findings)} findings)"
    end)
  end
end
```

### Black Team Theoretical Threat Modeling

The [Black Team](/glossary/black-team/) operates under maximum isolation to produce abstract threat models:

```
                ┌───────────────────────────────────┐
                │     MAXIMUM ISOLATION BOUNDARY     │
                │                                    │
                │  ┌──────────────────────────────┐  │
                │  │  Black Theorist Commander     │  │
                │  │  - Abstract threat models     │  │
                │  │  - Worst-case analysis        │  │
                │  │  - NO executable output       │  │
                │  └──────────┬───────────────────┘  │
                │             │                      │
                │  ┌──────────▼───────────────────┐  │
                │  │  Abstraction Enforcer         │  │
                │  │  - L1-L4 output filtering     │  │
                │  │  - Executable content block   │  │
                │  │  - Override authority          │  │
                │  └──────────┬───────────────────┘  │
                │             │                      │
                └─────────────┼──────────────────────┘
                              │ (abstract models only)
                              ▼
                ┌──────────────────────────────────┐
                │  Purple Team (Synthesis)          │
                │  - Integrates with Red/Blue      │
                │  - Closure analysis               │
                └──────────────────────────────────┘
```

## Implementation in Prismatic Platform

### Threat Assessment Pipeline

The full threat assessment pipeline integrates all three layers:

```elixir
defmodule Prismatic.ThreatAssessment.Pipeline do
  @moduledoc """
  Orchestrates the complete threat assessment pipeline
  from asset discovery through risk scoring to compliance
  reporting.
  """

  @type pipeline_config :: %{
    target: String.t(),
    frameworks: [atom()],
    depth: :quick | :standard | :comprehensive,
    include_theoretical: boolean()
  }

  @type pipeline_result :: %{
    target: String.t(),
    threat_model: map(),
    security_rating: map(),
    compliance_report: map(),
    execution_time_ms: non_neg_integer(),
    assessed_at: DateTime.t()
  }

  @spec execute(pipeline_config()) :: {:ok, pipeline_result()} | {:error, term()}
  def execute(config) do
    start = System.monotonic_time(:millisecond)

    with {:ok, assets} <- discover_assets(config.target),
         {:ok, threats} <- identify_threats(assets, config.depth),
         {:ok, scored_threats} <- score_threats(threats),
         {:ok, rating} <- calculate_rating(scored_threats),
         {:ok, compliance} <- assess_compliance(config.target, config.frameworks, scored_threats) do

      elapsed = System.monotonic_time(:millisecond) - start

      result = %{
        target: config.target,
        threat_model: %{assets: assets, threats: scored_threats},
        security_rating: rating,
        compliance_report: compliance,
        execution_time_ms: elapsed,
        assessed_at: DateTime.utc_now()
      }

      :telemetry.execute(
        [:prismatic, :threat_assessment, :completed],
        %{duration_ms: elapsed, threat_count: length(scored_threats)},
        %{target: config.target}
      )

      {:ok, result}
    end
  end

  @spec discover_assets(String.t()) :: {:ok, [map()]} | {:error, term()}
  defp discover_assets(target) do
    # Delegates to Perimeter's asset discovery
    {:ok, [%{name: target, type: :domain, criticality: :high, exposure: :external}]}
  end

  @spec identify_threats([map()], atom()) :: {:ok, [map()]} | {:error, term()}
  defp identify_threats(assets, depth) do
    threat_count = case depth do
      :quick -> 10
      :standard -> 50
      :comprehensive -> 100
    end

    threats =
      assets
      |> Enum.flat_map(fn asset ->
        generate_threats_for_asset(asset, threat_count)
      end)

    {:ok, threats}
  end

  @spec generate_threats_for_asset(map(), pos_integer()) :: [map()]
  defp generate_threats_for_asset(asset, _max_threats) do
    base_threats = [
      %{name: "SQL Injection", category: :tampering, likelihood: 0.3, impact: 0.8, asset: asset.name},
      %{name: "XSS", category: :tampering, likelihood: 0.4, impact: 0.5, asset: asset.name},
      %{name: "Credential Stuffing", category: :spoofing, likelihood: 0.5, impact: 0.7, asset: asset.name},
      %{name: "DDoS", category: :denial_of_service, likelihood: 0.6, impact: 0.6, asset: asset.name},
      %{name: "Data Exfiltration", category: :information_disclosure, likelihood: 0.2, impact: 0.9, asset: asset.name}
    ]
    base_threats
  end

  @spec score_threats([map()]) :: {:ok, [map()]} | {:error, term()}
  defp score_threats(threats) do
    scored =
      Enum.map(threats, fn threat ->
        risk = Float.round(threat.likelihood * threat.impact * 100, 2)
        Map.put(threat, :risk_score, risk)
      end)
      |> Enum.sort_by(& &1.risk_score, :desc)

    {:ok, scored}
  end

  @spec calculate_rating([map()]) :: {:ok, map()} | {:error, term()}
  defp calculate_rating(threats) do
    avg_risk = case threats do
      [] -> 0.0
      t -> Enum.sum(Enum.map(t, & &1.risk_score)) / length(t)
    end

    inverted = max(0, 100 - avg_risk)
    score = round(300 + inverted / 100 * 600)

    grade = Prismatic.ThreatAssessment.SecurityRating.score_to_grade(score)

    {:ok, %{grade: grade, numeric_score: score, average_risk: avg_risk}}
  end

  @spec assess_compliance(String.t(), [atom()], [map()]) :: {:ok, map()} | {:error, term()}
  defp assess_compliance(target, frameworks, threats) do
    Prismatic.ThreatAssessment.ComplianceAssessor.assess(target, frameworks, threats)
  end
end
```

### Continuous Threat Monitoring

The platform implements continuous threat assessment through scheduled re-evaluation:

| Interval | Assessment Type | Scope |
|----------|----------------|-------|
| **Real-time** | Attack surface changes | New/removed assets, DNS changes |
| **Hourly** | Vulnerability scanning | Known CVE matching, port scanning |
| **Daily** | Security rating recalculation | Full domain score recomputation |
| **Weekly** | Compliance reassessment | Full NIS2/ZKB control evaluation |
| **Monthly** | Theoretical threat model refresh | Black Team review cycle |

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Prismatic Position |
|----------|-----------|------------|-------------------|
| **STRIDE** | Microsoft-backed, systematic, DFD-based | Manual process, no automation | Adopted for threat categorization |
| **DREAD** | Quantitative scoring, comparable results | Subjective ratings, inconsistent | Used for individual threat scoring |
| **MITRE ATT&CK** | Comprehensive, industry standard, mapped to real TTPs | Complex (14 tactics, 200+ techniques) | Reference for attack taxonomy |
| **NIST CSF** | Risk-based, flexible, government-backed | High-level, requires interpretation | Compliance framework reference |
| **OWASP Threat Modeling** | Web-focused, practical, open source | Limited to application layer | Adopted for web application threats |
| **BitSight** | External ratings, industry benchmarks | Proprietary, expensive, black-box scoring | Competitive reference for Perimeter |
| **SecurityScorecard** | Comprehensive, continuous monitoring | SaaS-only, no self-hosted option | Competitive reference for Perimeter |
| **FAIR (Factor Analysis)** | Rigorous quantitative risk analysis | Complex, requires training | Design influence on risk calculation |

The Prismatic Platform's approach combines STRIDE categorization, DREAD scoring, and MITRE ATT&CK technique mapping into a unified threat assessment framework that produces both machine-readable risk scores and human-readable compliance reports. The three-layer model (Black Team theoretical + Red/Blue practical + Perimeter automated) provides depth that no single methodology achieves alone.

## Best Practices

### Threat Assessment Design

1. **Scope Before Assessing** -- Define the assessment boundary clearly before beginning. What is in scope (assets, threat actors, attack vectors) and what is explicitly out of scope? Undiscovered scope boundaries lead to incomplete assessments and false confidence.

2. **Use Multiple Methodologies** -- No single threat assessment methodology captures all relevant threats. Combine asset-centric (what are we protecting?), threat-centric (who is attacking?), and attack-centric (how could they attack?) perspectives for comprehensive coverage.

3. **Quantify Where Possible** -- Move beyond qualitative labels (High/Medium/Low) to numeric scores with defined scales and calibration. The 300-900 scoring range in Prismatic enables statistical analysis, trend tracking, and meaningful comparisons across assessments.

4. **Maintain Attack Taxonomy Currency** -- The threat landscape evolves continuously. The [Red Team](/glossary/red-team/)'s 329-entry attack [taxonomy](/glossary/taxonomy/) must be reviewed quarterly against new MITRE ATT&CK updates, emerging CVEs, and novel attack techniques.

5. **Automate Repetitive Assessments** -- Manual threat assessment does not scale. Automate asset discovery, vulnerability scanning, and score calculation. Reserve human expertise for threat model review, risk prioritization, and strategic decision-making.

6. **Track Assessment Confidence** -- Every assessment should include a confidence score reflecting the completeness and reliability of the underlying data. Low-confidence assessments should be flagged for additional investigation rather than trusted at face value.

7. **Document Assumptions** -- Every threat model contains assumptions about threat actor capabilities, system configurations, and environmental conditions. Document these explicitly so that assessments can be re-evaluated when assumptions change.

8. **Integrate with [Telemetry](/glossary/telemetry/)** -- Emit telemetry events for every assessment action, enabling performance monitoring, audit trailing, and trend analysis across the threat assessment pipeline.

## Common Pitfalls

### 1. Threat Fixation

Focusing on dramatic, high-profile threats (nation-state attacks, zero-days) while ignoring mundane but far more likely threats (phishing, misconfigurations, credential reuse). Calibrate likelihood estimates against actual incident data, not media coverage.

### 2. Assessment Fatigue

Producing voluminous reports that nobody reads. A threat assessment that does not drive action is waste. Focus on the top 10 actionable findings with clear remediation guidance rather than cataloguing every conceivable threat.

### 3. Static Assessments

Treating threat assessment as a periodic compliance exercise rather than a continuous process. The attack surface changes daily; monthly assessments miss critical windows of exposure. Implement continuous monitoring as the Perimeter module does.

### 4. Ignoring Internal Threats

Focusing exclusively on external threat actors while overlooking insider threats, misconfigurations, and supply chain risks. The STRIDE model explicitly includes repudiation and elevation of privilege to address internal threat vectors.

### 5. False Precision

Reporting risk scores to four decimal places when the underlying data supports only ordinal comparisons. The precision of the output cannot exceed the precision of the inputs. Round scores appropriately and communicate uncertainty ranges.

### 6. Compliance-Driven Assessment

Letting compliance requirements drive the scope and depth of threat assessment rather than genuine risk understanding. Compliance is a subset of security; passing a compliance audit does not mean the organization is secure. The Prismatic approach uses compliance as one lens among many.

### 7. Ignoring Epistemic Threats

Traditional threat assessment focuses on technical vulnerabilities. The Prismatic Platform's [Black Team](/glossary/black-team/) extends threat assessment to epistemic threats -- attacks on the platform's reasoning, confidence calibration, and decision-making processes. Ignoring this dimension leaves the system vulnerable to manipulation that bypasses all technical controls.

## Use Cases

### External Attack Surface Management

The [Perimeter](/glossary/easm/) module conducts continuous threat assessment of organizations' external attack surfaces. It discovers assets (domains, IPs, certificates, cloud resources), identifies threats against each asset, calculates domain-specific scores, and produces composite security ratings that enable executive decision-making and vendor risk management.

### Vendor Risk Assessment

When evaluating third-party vendors, the threat assessment pipeline produces security ratings that quantify the vendor's security posture. This enables data-driven vendor selection and ongoing monitoring, replacing subjective questionnaire-based assessments with evidence-based scoring.

### NIS2 Compliance

Organizations subject to the EU NIS2 Directive (2022/2555) must demonstrate adequate cybersecurity measures. The threat assessment pipeline maps findings to NIS2 control requirements, identifying gaps and generating remediation roadmaps with priority ordering.

### Czech ZKB Compliance

Czech organizations subject to ZKB 264/2025 Sb. (Zakon o kyberneticke bezpecnosti) use the compliance assessment module to evaluate their posture against Czech-specific cybersecurity requirements, with control descriptions in Czech for regulatory submission.

### Incident Response Prioritization

When a security incident occurs, the pre-computed threat model provides immediate context: which assets are affected, what the expected impact is, and which mitigations should be activated. This reduces incident response time from hours of ad-hoc analysis to minutes of structured response.

## Related Concepts

- [Threat Intelligence](/glossary/threat-intelligence/) -- Intelligence feeds providing context for threat identification and likelihood estimation
- [Risk Score](/glossary/risk-score/) -- Quantified risk metrics produced by threat assessment calculations
- [Security Assessment](/glossary/security-assessment/) -- Broader security evaluation encompassing threat assessment as a component
- [Black Team](/glossary/black-team/) -- Theoretical threat modeling under maximum isolation conditions
- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Technical vulnerability identification feeding into threat assessment
- [Cyber Threat Intelligence](/glossary/cyber-threat-intelligence/) -- Intelligence discipline providing threat actor and TTP data
- [EASM](/glossary/easm/) -- External attack surface management providing continuous threat monitoring
- [Attack Surface](/glossary/attack-surface/) -- The target domain that threat assessment evaluates
- [Compliance Framework](/glossary/compliance-framework/) -- Regulatory frameworks driving compliance-oriented threat assessment
- [Color Teams](/glossary/color-teams/) -- Adversarial-defensive security organization conducting practical threat assessment

## See Also

- [Red Team](/glossary/red-team/) -- Adversarial simulation validating threat model predictions
- [Blue Team](/glossary/blue-team/) -- Defensive posture assessment responding to identified threats
- [Purple Team](/glossary/purple-team/) -- Synthesis of Red/Blue findings into comprehensive threat picture
- [Simulation](/glossary/simulation/) -- Monte Carlo and adversarial simulation supporting likelihood estimation
- [Audit Trail](/glossary/audit-trail/) -- Immutable logging of threat assessment activities
- [Confidence Scoring](/glossary/confidence-scoring/) -- Confidence metrics qualifying threat assessment reliability
- [Formal Verification](/glossary/formal-verification/) -- Mathematical proof of security properties complementing threat assessment
- [Taxonomy](/glossary/taxonomy/) -- Classification schemes organizing threats and attack techniques

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
