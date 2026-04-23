+++
title = "ZKB"
weight = 50
[extra]
description = "Czech cybersecurity regulation (Zakon o kyberneticke bezpecnosti) 264/2025 Sb. governing critical infrastructure security with NIS2 transposition and Czech-specific requirements"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "compliance-regulation"
related_concepts = ["nis2", "compliance-framework", "security-rating", "easm", "risk-management"]
implementation_status = "production"
authority_level = "regulatory"
difficulty_rating = 7
prerequisites = ["nis2", "compliance-framework", "security-assessment", "easm"]
learning_path = ["compliance-framework", "nis2", "zkb", "security-rating", "security-assessment"]
interactive_demos = ["/labs/glossary/zkb"]
code_examples = ["PrismaticPerimeter.Compliance.ZKB", "PrismaticPerimeter.Compliance.ZKB.CzechRequirements", "PrismaticPerimeter.Compliance.UnifiedAssessment"]
external_resources = ["https://nukib.cz", "https://www.zakonyprolidi.cz/cs/2025-264"]
version_introduced = "0.9.0"
stability_level = "stable"
testing_scenarios = ["compliance-scoring", "czech-requirement-evaluation", "penalty-assessment", "unified-nis2-zkb-check", "incident-notification-timing"]
keywords = ["ZKB", "zakon o kyberneticke bezpecnosti", "264/2025 Sb", "NUKIB", "Czech cybersecurity", "NIS2 transposition", "critical infrastructure", "compliance"]
tags = ["glossary", "security", "compliance", "czech", "regulation", "nis2", "zkb"]
related_terms = ["nis2", "easm", "security-rating", "compliance-framework", "sanctions-screening", "security-assessment", "vulnerability-assessment", "penetration-testing", "attack-surface", "security-operations", "audit-logging", "encryption"]
abbreviation = "ZKB"
word_count = 1605
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "ZKB - Prismatic Platform"
+++

## Definition

ZKB (Zakon o kyberneticke bezpecnosti, 264/2025 Sb.) is the Czech Republic's comprehensive cybersecurity regulation that transposes EU directives -- primarily the [NIS2](@/glossary/nis2.md) Directive (EU 2022/2555) -- into national law while adding Czech-specific requirements reflecting national security priorities and the country's critical infrastructure landscape. The regulation defines obligations for operators of essential services, digital service providers, and public administration entities regarding cybersecurity risk management, incident reporting, security measures, and supply chain security.

## Overview

The regulation replaced the earlier Czech cybersecurity law (181/2014 Sb.) with a significantly expanded scope and more stringent requirements. Where the previous law applied primarily to operators of critical information infrastructure and selected information systems, ZKB 264/2025 Sb. extends coverage to a broader range of entities, aligning with NIS2's expanded scope while adding Czech-specific sectors and thresholds. This expansion reflects the evolving threat landscape, where cyber attacks increasingly target mid-size organizations and supply chains rather than focusing exclusively on large critical infrastructure operators.

ZKB operates within a multi-layered regulatory framework. At the European level, NIS2 sets the baseline requirements that all EU member states must implement. At the national level, ZKB transposes these requirements into Czech law, adding obligations specific to Czech infrastructure, governance structures, and enforcement mechanisms. The Czech National Cyber and Information Security Agency (NUKIB) serves as the national competent authority, overseeing compliance, receiving incident reports, and conducting audits.

The regulation distinguishes between two categories of regulated entities: essential entities (operators of critical infrastructure, large digital service providers, public administration) and important entities (mid-size organizations in covered sectors). Essential entities face more stringent requirements, including proactive security audits by NUKIB, higher fines for non-compliance, and mandatory supply chain security assessments. Important entities have somewhat lighter obligations but must still implement core security measures and report significant incidents.

### Regulatory Timeline

| Date | Event |
|------|-------|
| 2014 | Original Czech cybersecurity law (181/2014 Sb.) enacted |
| 2016 | NIS Directive (EU 2016/1148) adopted |
| 2022 | NIS2 Directive (EU 2022/2555) published |
| 2024 | Czech government begins ZKB drafting process |
| 2025 | ZKB 264/2025 Sb. enacted, replacing 181/2014 Sb. |
| 2025 Q3 | Compliance deadline for essential entities |
| 2026 Q1 | Compliance deadline for important entities |

## Technical Details

### ZKB Compliance Domains

| Domain | ZKB Section | NIS2 Article | Key Requirements | Essential | Important |
|--------|-------------|-------------|-----------------|-----------|-----------|
| Risk Management | Sec. 8-10 | Art. 21(1) | Documented risk assessment methodology | Mandatory | Mandatory |
| Incident Response | Sec. 12-14 | Art. 23 | 24-hour NUKIB notification (stricter than NIS2) | Mandatory | Mandatory |
| Supply Chain | Sec. 15-17 | Art. 21(2)(d) | Critical supplier assessment | Mandatory | Recommended |
| Access Control | Sec. 19 | Art. 21(2)(i) | [RBAC](@/glossary/rbac.md), MFA, privilege management | Mandatory | Mandatory |
| [Encryption](@/glossary/encryption.md) | Sec. 20 | Art. 21(2)(h) | Data protection at rest and in transit | Mandatory | Mandatory |
| Business Continuity | Sec. 21 | Art. 21(2)(c) | Recovery plans, backup procedures | Mandatory | Mandatory |
| [Vulnerability](@/glossary/vulnerability.md) Mgmt | Sec. 23 | Art. 21(2)(e) | Regular scanning, patch management | Mandatory | Mandatory |
| Security Awareness | Sec. 24 | Art. 21(2)(g) | Staff training, management accountability | Mandatory | Mandatory |
| Network Security | Sec. 26 | Art. 21(2)(a) | Segmentation, monitoring, filtering | Mandatory | Mandatory |
| Audit | Sec. 18 | N/A | Certified auditor assessment | Mandatory | Not required |

### NIS2 vs ZKB Comparison

| Aspect | NIS2 Directive | ZKB 264/2025 Sb. |
|--------|---------------|------------------|
| Scope | EU-wide baseline | Czech national implementation |
| Authority | ENISA coordination | NUKIB (national authority) |
| Incident notification | 72 hours | 24 hours (stricter) |
| Language | Any EU language | Czech mandatory for NUKIB reports |
| Audit requirement | Member state discretion | Mandatory for essential entities |
| Supply chain | General requirement | Specific assessment methodology |
| Penalties | Up to EUR 10M / 2% revenue | Aligned with NIS2 maximums |
| Personnel security | Not specified | Clearance required for critical roles |

### Czech-Specific Requirements Beyond NIS2

ZKB adds six major categories of requirements that go beyond the NIS2 baseline:

1. **Stricter incident notification** (24 hours vs 72 hours) -- Czech national security interests demand faster reporting to NUKIB for coordinated response
2. **Mandatory certified audits** -- Essential entities must undergo regular audits by NUKIB-certified auditors, a requirement not mandated by NIS2
3. **Personnel security clearance** -- Critical system administrators at essential entities must obtain security clearance from the National Security Authority (NBU)
4. **Czech-language reporting** -- All formal communications with NUKIB, including incident reports and audit documentation, must be in Czech
5. **NUKIB-specified risk methodology** -- Risk assessments must follow methodologies published by NUKIB, not just any recognized framework
6. **Supply chain assessment specifics** -- Assessment methodology and frequency for critical suppliers are specified in implementing regulations

## Implementation in Prismatic Platform

Within the Prismatic Platform, ZKB compliance assessment is integrated alongside [NIS2](@/glossary/nis2.md) in Prismatic Perimeter, reflecting the platform's Czech origin and primary market. The compliance assessment engine evaluates organizations against both EU-level (NIS2) and Czech-specific (ZKB) requirements simultaneously, identifying gaps between current security posture and regulatory obligations.

### ZKB Compliance Assessment Engine

```elixir
defmodule PrismaticPerimeter.Compliance.ZKB do
  @moduledoc """
  ZKB (264/2025 Sb.) compliance assessment engine.
  Evaluates Czech cybersecurity regulation requirements.
  """

  @type entity_category :: :essential | :important
  @type compliance_domain :: :risk_management | :incident_response | :supply_chain
                          | :access_control | :encryption | :business_continuity
                          | :vulnerability_management | :awareness_training
                          | :network_security | :asset_management

  @type compliance_result :: %{
    entity_category: entity_category(),
    overall_score: float(),
    overall_status: :compliant | :partial | :non_compliant,
    domain_results: %{compliance_domain() => domain_assessment()},
    czech_specific_requirements: [requirement_status()],
    nis2_alignment: float(),
    remediation_actions: [remediation()]
  }

  @type domain_assessment :: %{
    domain: compliance_domain(),
    score: float(),
    status: :compliant | :partial | :non_compliant,
    controls_assessed: non_neg_integer(),
    controls_passing: non_neg_integer(),
    findings: [finding()]
  }

  @type requirement_status :: %{
    requirement_id: String.t(),
    description: String.t(),
    section: String.t(),
    status: :met | :partially_met | :not_met | :not_applicable,
    evidence: [String.t()]
  }

  @type remediation :: %{
    priority: :critical | :high | :medium | :low,
    domain: compliance_domain(),
    action: String.t(),
    effort_estimate: String.t(),
    deadline_recommendation: Date.t()
  }

  @spec assess(String.t(), keyword()) :: {:ok, compliance_result()} | {:error, term()}
  def assess(organization, opts \\ []) do
    category = Keyword.get(opts, :category, :important)

    with {:ok, asset_data} <- collect_assessment_data(organization),
         {:ok, domain_results} <- assess_all_domains(asset_data, category),
         {:ok, czech_specific} <- assess_czech_requirements(asset_data, category) do
      overall = calculate_overall_score(domain_results, czech_specific)

      result = %{
        entity_category: category,
        overall_score: overall.score,
        overall_status: overall.status,
        domain_results: domain_results,
        czech_specific_requirements: czech_specific,
        nis2_alignment: calculate_nis2_alignment(domain_results),
        remediation_actions: generate_remediation_plan(domain_results, czech_specific)
      }

      :telemetry.execute(
        [:prismatic, :compliance, :zkb, :assessment_complete],
        %{score: overall.score, domains: map_size(domain_results)},
        %{organization: organization, category: category, status: overall.status}
      )

      {:ok, result}
    end
  end
end
```

### Czech-Specific Requirements Module

```elixir
defmodule PrismaticPerimeter.Compliance.ZKB.CzechRequirements do
  @moduledoc """
  Czech-specific requirements that extend beyond NIS2 baseline.
  Reflects national priorities and infrastructure considerations.
  """

  @czech_specific_requirements [
    %{
      id: "ZKB-CZ-01",
      section: "Sec. 12",
      description: "NUKIB notification within 24 hours for significant incidents",
      nis2_equivalent: "Article 23 (72-hour notification)",
      note: "Czech requirement is stricter than NIS2 baseline",
      applies_to: [:essential, :important]
    },
    %{
      id: "ZKB-CZ-02",
      section: "Sec. 15",
      description: "Supply chain security assessment for critical suppliers",
      nis2_equivalent: "Article 21(2)(d)",
      note: "Czech law specifies assessment methodology and frequency",
      applies_to: [:essential]
    },
    %{
      id: "ZKB-CZ-03",
      section: "Sec. 18",
      description: "Mandatory cybersecurity audit by certified auditor",
      nis2_equivalent: nil,
      note: "Czech-specific requirement not in NIS2 baseline",
      applies_to: [:essential]
    },
    %{
      id: "ZKB-CZ-04",
      section: "Sec. 22",
      description: "Czech language incident reporting to NUKIB CERT",
      nis2_equivalent: "Article 23",
      note: "Language and format specifications are Czech-specific",
      applies_to: [:essential, :important]
    },
    %{
      id: "ZKB-CZ-05",
      section: "Sec. 25",
      description: "Risk assessment methodology aligned with NUKIB guidelines",
      nis2_equivalent: "Article 21(1)",
      note: "NUKIB specifies acceptable methodologies",
      applies_to: [:essential, :important]
    },
    %{
      id: "ZKB-CZ-06",
      section: "Sec. 30",
      description: "Personnel security clearance for critical system administrators",
      nis2_equivalent: nil,
      note: "Czech-specific personnel security requirement",
      applies_to: [:essential]
    }
  ]

  @spec assess_czech_requirements(map(), atom()) :: {:ok, [map()]} | {:error, term()}
  def assess_czech_requirements(assessment_data, category) do
    results =
      @czech_specific_requirements
      |> Enum.filter(fn req -> category in req.applies_to end)
      |> Enum.map(fn req ->
        %{
          requirement_id: req.id,
          description: req.description,
          section: req.section,
          status: evaluate_requirement(req, assessment_data),
          evidence: collect_evidence(req, assessment_data)
        }
      end)

    {:ok, results}
  end

  @spec evaluate_requirement(map(), map()) :: :met | :partially_met | :not_met
  defp evaluate_requirement(%{id: "ZKB-CZ-01"}, data) do
    case get_in(data, [:incident_response, :notification_time_hours]) do
      hours when is_number(hours) and hours <= 24 -> :met
      hours when is_number(hours) and hours <= 72 -> :partially_met
      _ -> :not_met
    end
  end

  defp evaluate_requirement(%{id: "ZKB-CZ-02"}, data) do
    case get_in(data, [:supply_chain, :assessment_completed]) do
      true -> :met
      _ -> :not_met
    end
  end

  defp evaluate_requirement(_req, _data), do: :not_met
end
```

### Unified NIS2/ZKB Compliance Assessment

```elixir
defmodule PrismaticPerimeter.Compliance.UnifiedAssessment do
  @moduledoc """
  Unified compliance assessment combining NIS2 and ZKB frameworks.
  Shows overlap, gaps, and Czech-specific additions.
  """

  @type unified_result :: %{
    nis2: map(),
    zkb: map(),
    overlap_coverage: float(),
    czech_additions: non_neg_integer(),
    unified_score: float(),
    framework_comparison: [comparison_item()]
  }

  @type comparison_item :: %{
    domain: atom(),
    nis2_score: float(),
    zkb_score: float(),
    gap: float(),
    notes: String.t()
  }

  @spec unified_assessment(String.t(), keyword()) :: {:ok, unified_result()} | {:error, term()}
  def unified_assessment(organization, opts \\ []) do
    nis2_task = Task.async(fn ->
      PrismaticPerimeter.Compliance.NIS2.assess(organization, opts)
    end)

    zkb_task = Task.async(fn ->
      PrismaticPerimeter.Compliance.ZKB.assess(organization, opts)
    end)

    {:ok, nis2} = Task.await(nis2_task, 120_000)
    {:ok, zkb} = Task.await(zkb_task, 120_000)

    comparison = build_framework_comparison(nis2, zkb)

    {:ok, %{
      nis2: nis2,
      zkb: zkb,
      overlap_coverage: calculate_overlap(nis2, zkb),
      czech_additions: count_czech_additions(zkb),
      unified_score: (nis2.overall_score + zkb.overall_score) / 2,
      framework_comparison: comparison
    }}
  end

  @spec build_framework_comparison(map(), map()) :: [comparison_item()]
  defp build_framework_comparison(nis2, zkb) do
    all_domains = MapSet.union(
      MapSet.new(Map.keys(nis2.domain_results)),
      MapSet.new(Map.keys(zkb.domain_results))
    )

    Enum.map(all_domains, fn domain ->
      nis2_score = get_in(nis2, [:domain_results, domain, :score]) || 0.0
      zkb_score = get_in(zkb, [:domain_results, domain, :score]) || 0.0

      %{
        domain: domain,
        nis2_score: nis2_score,
        zkb_score: zkb_score,
        gap: abs(nis2_score - zkb_score),
        notes: generate_gap_notes(domain, nis2_score, zkb_score)
      }
    end)
  end
end
```

### Penalty Structure

```elixir
defmodule PrismaticPerimeter.Compliance.ZKB.Penalties do
  @moduledoc """
  ZKB penalty structure for non-compliance.
  Graduated penalties based on entity category and violation severity.
  """

  @type penalty_assessment :: %{
    entity_category: atom(),
    violation_severity: atom(),
    max_fine_eur: non_neg_integer(),
    max_fine_czk: non_neg_integer(),
    additional_sanctions: [String.t()]
  }

  @penalties %{
    essential: %{
      critical: %{max_eur: 10_000_000, or_revenue_pct: 2.0},
      high: %{max_eur: 7_000_000, or_revenue_pct: 1.4},
      medium: %{max_eur: 3_000_000, or_revenue_pct: 0.6},
      low: %{max_eur: 1_000_000, or_revenue_pct: 0.2}
    },
    important: %{
      critical: %{max_eur: 7_000_000, or_revenue_pct: 1.4},
      high: %{max_eur: 5_000_000, or_revenue_pct: 1.0},
      medium: %{max_eur: 2_000_000, or_revenue_pct: 0.4},
      low: %{max_eur: 500_000, or_revenue_pct: 0.1}
    }
  }

  @spec assess_penalty_risk(atom(), atom()) :: penalty_assessment()
  def assess_penalty_risk(entity_category, violation_severity) do
    penalty = get_in(@penalties, [entity_category, violation_severity])
    czk_rate = 25.0

    %{
      entity_category: entity_category,
      violation_severity: violation_severity,
      max_fine_eur: penalty.max_eur,
      max_fine_czk: round(penalty.max_eur * czk_rate),
      additional_sanctions: additional_sanctions(entity_category, violation_severity)
    }
  end

  @spec additional_sanctions(atom(), atom()) :: [String.t()]
  defp additional_sanctions(:essential, :critical) do
    [
      "Temporary suspension of authorization to operate",
      "Public disclosure of non-compliance",
      "Management personal liability",
      "NUKIB-mandated corrective action plan"
    ]
  end

  defp additional_sanctions(:essential, _), do: ["NUKIB-mandated corrective action plan"]

  defp additional_sanctions(:important, :critical) do
    ["Public disclosure of non-compliance", "Corrective action plan required"]
  end

  defp additional_sanctions(:important, _), do: []
end
```

### Compliance Assessment Pipeline

```
Organization Data Collection
    |
    +-- Asset Discovery (EASM)
    +-- Configuration Analysis
    +-- Policy Documentation Review
    +-- Technical Control Verification
    |
    v
Parallel Framework Assessment
    |
    +-- NIS2 Assessment Engine ----+
    +-- ZKB Assessment Engine -----+-- Unified Score
    +-- SOC 2 Assessment Engine ---+
    |
    v
Gap Analysis + Remediation Plan
    |
    +-- Priority-ranked actions
    +-- Effort estimates
    +-- Deadline recommendations
    +-- Penalty risk assessment
    |
    v
Dashboard (/perimeter/compliance)
```

### Usage Examples

```elixir
# Full ZKB compliance assessment
{:ok, result} = PrismaticPerimeter.Compliance.ZKB.assess("organization.cz",
  category: :essential
)

# Unified NIS2 + ZKB assessment
{:ok, unified} = PrismaticPerimeter.Compliance.UnifiedAssessment.unified_assessment(
  "organization.cz",
  category: :essential
)

# Check Czech-specific requirements only
{:ok, czech} = PrismaticPerimeter.Compliance.ZKB.CzechRequirements.assess_czech_requirements(
  assessment_data,
  :essential
)

# Assess penalty risk
risk = PrismaticPerimeter.Compliance.ZKB.Penalties.assess_penalty_risk(:essential, :high)
```

### Dashboard and CLI Access

The compliance dashboard at `/perimeter/compliance` provides:
- Unified NIS2/ZKB compliance score
- Domain-by-domain breakdown with gap analysis
- Czech-specific requirement status
- Remediation action prioritization
- Penalty risk assessment
- Historical compliance trend tracking

```bash
# Run compliance assessment
/perimeter assess --target=organization.cz --framework=zkb --category=essential

# View compliance status
/perimeter compliance --framework=zkb

# Generate compliance report
/perimeter report --framework=zkb --format=pdf
```

## Comparison with Alternatives

| Framework | Scope | Authority | Focus | Prismatic Support |
|-----------|-------|-----------|-------|-------------------|
| **ZKB 264/2025 Sb.** | Czech Republic | NUKIB | Critical infrastructure cybersecurity | Full assessment engine |
| **[NIS2](@/glossary/nis2.md) (EU 2022/2555)** | EU-wide | ENISA | Baseline cybersecurity for essential/important entities | Full assessment engine |
| **ISO 27001** | Global | ISO | Information security management systems | Partial mapping |
| **SOC 2** | Global (US-centric) | AICPA | Service organization controls | Assessment engine |
| **GDPR** | EU-wide | National DPAs | Data protection and privacy | Partial mapping |
| **DORA** | EU (financial) | EBA/EIOPA/ESMA | Digital operational resilience | Roadmap |

ZKB is unique among these frameworks in combining EU-level requirements (NIS2 transposition) with Czech-specific additions. Organizations operating in the Czech Republic must comply with ZKB regardless of whether they also comply with NIS2, ISO 27001, or SOC 2 -- though compliance with these other frameworks provides significant evidence toward ZKB compliance.

## Best Practices

1. **Assess NIS2 and ZKB together**. Since ZKB transposes NIS2, most controls satisfy both frameworks simultaneously. Unified assessment prevents duplication and identifies the Czech-specific additions that require additional attention.

2. **Prioritize Czech-specific requirements**. Areas where ZKB is stricter than NIS2 (24-hour incident notification, mandatory audits, personnel clearance) require specific attention because NIS2-only compliance is insufficient.

3. **Engage with NUKIB guidelines**. NUKIB publishes implementation guides and acceptable risk assessment methodologies. Aligning with NUKIB's preferred approaches reduces audit friction.

4. **Implement continuous compliance monitoring**. ZKB compliance is not a one-time assessment. The regulation expects ongoing compliance, which requires continuous monitoring through [EASM](@/glossary/easm.md) tools rather than periodic audits.

5. **Document everything in Czech**. Official incident reports, audit documentation, and NUKIB communications must be in Czech. Maintain Czech-language documentation alongside English technical documentation.

6. **Plan personnel clearance early**. Security clearance processing through NBU takes months. Essential entities should begin the clearance process for critical administrators well before compliance deadlines.

7. **Map existing controls to ZKB domains**. Organizations with ISO 27001 or SOC 2 controls already in place will find significant overlap with ZKB requirements. Systematic mapping avoids duplicate effort.

## Common Pitfalls

- **Assuming NIS2 compliance equals ZKB compliance**: ZKB adds Czech-specific requirements not present in NIS2. Organizations that implement only the NIS2 baseline will have gaps in Czech-specific areas such as 24-hour notification, mandatory audits, and personnel clearance.

- **Missing the 24-hour notification window**: ZKB requires incident notification to NUKIB within 24 hours, stricter than NIS2's 72-hour window. Organizations calibrated to NIS2 timing may violate Czech requirements.

- **Ignoring supply chain assessment specifics**: ZKB specifies assessment methodology and frequency for critical suppliers, not just general supply chain security. Generic supply chain policies may not satisfy the Czech requirements.

- **Underestimating personnel security requirements**: For essential entities, ZKB requires security clearance for critical system administrators. This requirement has no NIS2 equivalent and requires advance planning due to clearance processing times.

- **Not engaging certified auditors early**: Essential entities must undergo mandatory cybersecurity audits by NUKIB-certified auditors. These auditors have limited availability, and scheduling should begin well before compliance deadlines.

- **Treating compliance as a one-time project**: ZKB mandates ongoing compliance, not just initial certification. Without continuous monitoring and automated [security assessment](@/glossary/security-assessment.md), organizations drift out of compliance between formal audits.

## Use Cases

**Czech Critical Infrastructure Operators**: Energy companies, telecommunications providers, healthcare institutions, and financial services organizations operating in the Czech Republic must achieve and maintain ZKB compliance. The Prismatic Perimeter EASM engine automates technical control verification across these sectors.

**Multi-National Companies with Czech Operations**: Organizations headquartered outside the Czech Republic but operating Czech subsidiaries must comply with ZKB for their Czech operations. The unified NIS2/ZKB assessment engine identifies where EU-wide compliance suffices and where Czech-specific controls are needed.

**Cybersecurity Consulting Firms**: Consultants advising Czech organizations on cybersecurity compliance use the ZKB assessment engine to generate baseline compliance reports, identify gaps, and prioritize remediation actions with effort estimates and deadline recommendations.

**Public Administration IT Security**: Czech government agencies and municipalities subject to ZKB use the compliance dashboard to track their security posture against regulatory requirements and demonstrate compliance during NUKIB audits.

**Supply Chain Security Assessment**: Essential entities required to assess critical suppliers use the [EASM](@/glossary/easm.md) and [attack surface](@/glossary/attack-surface.md) analysis capabilities to evaluate supplier security posture against ZKB supply chain requirements.

## Related Concepts

- [NIS2 Directive](@/glossary/nis2.md) -- EU-level directive that ZKB implements nationally
- [EASM](@/glossary/easm.md) -- External attack surface management performing ZKB compliance assessment
- [Security Rating](@/glossary/security-rating.md) -- Quantified score incorporating ZKB compliance posture
- [Compliance Framework](@/glossary/compliance-framework.md) -- Broader category of regulatory frameworks
- [Sanctions Screening](@/glossary/sanctions-screening.md) -- Related regulatory compliance capability
- [Security Assessment](@/glossary/security-assessment.md) -- Technical evaluation supporting ZKB compliance
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- Required scanning under ZKB Sec. 23
- [Penetration Testing](@/glossary/penetration-testing.md) -- Security testing supporting audit requirements
- [Attack Surface](@/glossary/attack-surface.md) -- Asset discovery foundational to ZKB scope determination
- [Audit Logging](@/glossary/audit-logging.md) -- Evidence collection supporting ZKB audit requirements
- [Encryption](@/glossary/encryption.md) -- Data protection mandated by ZKB Sec. 20
- [RBAC](@/glossary/rbac.md) -- Access control mechanism satisfying ZKB Sec. 19

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory including Prismatic Perimeter
- [Security Operations](@/glossary/security-operations.md) -- Operational security practices
- [Vulnerability](@/glossary/vulnerability.md) -- Vulnerability management required by ZKB

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
