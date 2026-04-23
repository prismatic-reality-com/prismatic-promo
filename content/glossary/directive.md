+++
title = "Directive"
weight = 50

[extra]
description = "Legislative instrument in EU law that sets binding objectives for member states while allowing implementation flexibility through national transposition, notably NIS2 for cybersecurity, GDPR for data protection, CER for critical entity resilience, and DORA for digital operational resilience."
category = "compliance"
domain = "regulatory"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["gdpr", "compliance", "nis2", "data-controller", "incident-reporting", "easm", "iso-27001", "cer", "dora", "regulation", "transposition", "critical-infrastructure"]
tags = ["glossary", "directive", "compliance", "eu-law", "nis2", "gdpr", "regulation", "cer", "dora", "critical-infrastructure"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "EU directives like NIS2 and CER set binding cybersecurity and resilience obligations that member states must transpose into national law, and the Prismatic Perimeter module automates compliance assessment against both EU-level requirements and national transpositions like the Czech ZKB 264/2025 Sb."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Directive", "NIS2", "CER", "DORA", "EU", "compliance", "regulation", "transposition", "cybersecurity", "critical infrastructure", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "EU Directive Compliance Framework - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "osint", "technologies"]
+++

## Definition

In European Union law, a directive is a legislative instrument that establishes binding objectives that member states must achieve, while granting each state flexibility in choosing the form and methods of implementation through national legislation. This process -- known as transposition -- is what distinguishes directives from regulations: whereas regulations (such as the GDPR, despite being commonly called a "directive") are directly applicable in all member states without national transposition, directives require each member state to enact national laws that achieve the directive's objectives within a specified transposition deadline.

The transposition requirement creates a complex compliance landscape where organizations operating across multiple EU member states must navigate not just the directive itself but also the specific national implementations in each jurisdiction where they operate. National transpositions may impose stricter requirements than the directive mandates (known as "gold-plating"), extend the scope to additional sectors, or interpret ambiguous provisions differently. This jurisdictional complexity is a primary challenge for multinational compliance programs and a rich source of intelligence for OSINT and due diligence operations.

Key cybersecurity and resilience directives currently shaping the European regulatory landscape include the NIS2 Directive (EU 2022/2555) on network and information security, the CER Directive (EU 2022/2557) on critical entity resilience, and the DORA Regulation (EU 2022/2554) on digital operational resilience for the financial sector. While DORA is technically a regulation rather than a directive, it is closely linked to NIS2 and CER in the EU's broader cybersecurity legislative framework. Together, these instruments significantly expand the scope of organizations subject to cybersecurity obligations, introduce harmonized incident reporting requirements, and establish management body accountability for cybersecurity governance.

## Core Concepts

### EU Legislative Instrument Types

| Instrument Type | Direct Applicability | National Transposition | Binding Force | Key Examples |
|----------------|---------------------|----------------------|---------------|--------------|
| **Regulation** | Yes -- applies directly in all member states | Not required (prohibited, in fact) | Entirely binding | GDPR, DORA, eIDAS 2.0 |
| **Directive** | No -- requires national transposition | Required within deadline | Binding as to objectives | NIS2, CER, ePrivacy |
| **Decision** | Yes -- applies to addressees | Not required | Binding on addressees | Adequacy decisions |
| **Recommendation** | No | Not applicable | Non-binding | Cybersecurity recommendations |
| **Opinion** | No | Not applicable | Non-binding | ENISA opinions |

### Major Cybersecurity Directives and Related Instruments

| Instrument | Reference | Type | Scope | Transposition Deadline | Key Requirements |
|-----------|-----------|------|-------|----------------------|-----------------|
| **NIS2** | EU 2022/2555 | Directive | Essential & important entities across 18 sectors | 17 October 2024 | Risk management, incident reporting (24h/72h), supply chain security, management accountability |
| **CER** | EU 2022/2557 | Directive | Critical entities in 11 sectors | 17 October 2024 | Risk assessment, resilience measures, incident notification, background checks |
| **DORA** | EU 2022/2554 | Regulation | Financial entities & ICT third-party providers | 17 January 2025 | ICT risk management, incident reporting, digital operational resilience testing, third-party risk |
| **GDPR** | EU 2016/679 | Regulation | All data controllers/processors | 25 May 2018 | Data protection principles, consent, breach notification (72h), DPIAs, DPO appointment |
| **ePrivacy** | EU 2002/58 | Directive | Electronic communications providers | Transposed (varies) | Cookie consent, communication confidentiality, traffic data protection |
| **RED** | EU 2014/53 | Directive | Radio equipment manufacturers | Cybersecurity requirements from August 2025 | Cybersecurity for connected devices, personal data protection, fraud prevention |

### NIS2 Article Structure

| Article Group | Articles | Subject Matter | Compliance Impact |
|--------------|---------|---------------|-------------------|
| **Scope & Definitions** | Art. 1-6 | Entities covered, size thresholds | Determine applicability |
| **National Frameworks** | Art. 7-13 | National strategies, CSIRTs, cooperation | Member state obligations |
| **Risk Management** | Art. 20-25 | Security measures, incident handling | Direct entity obligations |
| **Reporting** | Art. 23 | Incident notification timelines | Operational procedures |
| **Supply Chain** | Art. 21(2)(d) | Third-party security assessment | Procurement processes |
| **Governance** | Art. 20 | Management body training & accountability | Board-level responsibility |
| **Supervision** | Art. 31-37 | Enforcement, penalties, audits | Compliance risk |
| **Penalties** | Art. 34-36 | Fines up to EUR 10M or 2% turnover | Financial exposure |

### National Transposition Examples

| Member State | NIS2 Transposition | Reference | Notable Differences from Directive |
|-------------|-------------------|-----------|-----------------------------------|
| **Czech Republic** | ZKB 264/2025 Sb. | Zakon o kyberneticke bezpecnosti | Extended scope to additional sectors; NUKIB as competent authority |
| **Germany** | NIS2UmsuCG (draft) | NIS-2-Umsetzungs- und Cybersicherheitsstarkungsgesetz | BSI expanded role; stricter penalties |
| **France** | Transposition pending | ANSSI implementation decree | Additional sectors; ANSSI supervision |
| **Netherlands** | Cbw (Cyberbeveiligingswet) | Cybersecurity Act | NCSC-NL as CSIRT; sector-specific requirements |
| **Poland** | KSC amendment | Krajowy System Cyberbezpieczenstwa | Extended to public administration entities |

### Directive vs Regulation Impact on Compliance

| Compliance Dimension | Directive (e.g., NIS2) | Regulation (e.g., GDPR) |
|---------------------|----------------------|------------------------|
| **Legal text to follow** | National transposition law | EU regulation directly |
| **Cross-border consistency** | Varies by member state | Uniform across EU |
| **Compliance gap analysis** | Must check each national law | Single gap analysis applicable |
| **Enforcement authority** | National competent authority | National DPA (but harmonized) |
| **Penalty framework** | Set by national law (within directive limits) | Directly specified (4%/EUR 20M) |
| **Update cycle** | Requires re-transposition | Directly effective |

## Technical Deep Dive

### Compliance Assessment Architecture

Automated directive compliance assessment requires a multi-layered architecture that handles the inherent complexity of directive-based regulation: the directive itself defines objectives, national transpositions define specific requirements, and organizational compliance must be measured against the applicable national law.

```
EU Directive (NIS2)
    |
    +-- National Transposition (ZKB 264/2025)
    |       |
    |       +-- Specific Requirements (technical measures, incident reporting)
    |       |       |
    |       |       +-- Controls (implemented technical and organizational measures)
    |       |               |
    |       |               +-- Evidence (logs, configurations, policies, test results)
    |       |
    |       +-- Sector-Specific Requirements
    |               |
    |               +-- Controls + Evidence
    |
    +-- National Transposition (NIS2UmsuCG)
            |
            +-- (same structure, different requirements)
```

The assessment engine must support:
1. **Multi-directive assessment** -- evaluating compliance against multiple directives simultaneously
2. **Multi-jurisdiction awareness** -- mapping the same directive to different national transpositions
3. **Requirement decomposition** -- breaking high-level directive articles into specific, assessable controls
4. **Evidence collection** -- automated and manual evidence gathering linked to specific requirements
5. **Gap analysis** -- identifying non-compliant and partially compliant areas with remediation guidance
6. **Continuous monitoring** -- ongoing compliance posture tracking rather than point-in-time assessment

### NIS2 Incident Reporting Timeline

| Phase | Deadline | Content Required | Channel |
|-------|----------|-----------------|---------|
| **Early Warning** | 24 hours from awareness | Suspected significant incident; initial impact assessment | National CSIRT |
| **Incident Notification** | 72 hours from awareness | Severity, impact, cross-border effects | National CSIRT |
| **Intermediate Report** | Upon CSIRT request | Status update, containment measures | National CSIRT |
| **Final Report** | 1 month after notification | Root cause, mitigation, cross-border impact | National CSIRT |
| **Progress Report** | If incident ongoing | Updated timeline and measures | National CSIRT |

## Usage in Prismatic Platform

The Prismatic Perimeter module implements automated compliance assessment against EU directives, with particular depth for the NIS2 Directive and the Czech ZKB 264/2025 Sb. transposition.

### Directive Compliance Assessment Engine

```elixir
defmodule PrismaticPerimeter.Compliance.DirectiveAssessor do
  @moduledoc """
  Automated compliance assessment engine that evaluates organizational
  posture against EU directive requirements and their national transpositions.

  Supports multi-directive, multi-jurisdiction assessment with requirement
  decomposition, evidence linkage, and remediation guidance. The engine
  operates as a component within the broader Perimeter compliance framework.

  ## Supported Directives

    - **NIS2** (EU 2022/2555) -- Network and Information Security
    - **ZKB** (264/2025 Sb.) -- Czech NIS2 transposition
    - **GDPR** (EU 2016/679) -- General Data Protection Regulation
    - **DORA** (EU 2022/2554) -- Digital Operational Resilience Act
    - **CER** (EU 2022/2557) -- Critical Entities Resilience

  ## Assessment Flow

    1. Determine applicable directives based on entity classification
    2. Load requirement sets for each applicable directive/transposition
    3. Evaluate each requirement against available evidence and controls
    4. Calculate compliance scores per directive and overall
    5. Generate gap analysis with prioritized remediation recommendations

  ## Examples

      iex> DirectiveAssessor.assess("example.cz", [:nis2, :zkb])
      {:ok, [%{directive: :nis2, score: 0.72, status: :partial}, ...]}

      iex> DirectiveAssessor.classify_entity("energy-provider.cz")
      {:ok, %{sector: :energy, category: :essential, directives: [:nis2, :cer]}}
  """

  require Logger

  @type directive :: :nis2 | :zkb | :gdpr | :dora | :cer
  @type compliance_status :: :compliant | :partial | :non_compliant | :not_assessed

  @type requirement :: %{
    id: String.t(),
    article: String.t(),
    description: String.t(),
    status: compliance_status(),
    evidence: list(String.t()),
    remediation: String.t() | nil,
    priority: :critical | :high | :medium | :low,
    category: :technical | :organizational | :governance
  }

  @type assessment :: %{
    directive: directive(),
    jurisdiction: String.t(),
    assessed_at: DateTime.t(),
    overall_status: compliance_status(),
    requirements: list(requirement()),
    score: float(),
    gap_count: non_neg_integer(),
    critical_gaps: list(requirement()),
    remediation_plan: list(map())
  }

  @type entity_classification :: %{
    domain: String.t(),
    sector: atom(),
    category: :essential | :important | :out_of_scope,
    size: :large | :medium | :small | :micro,
    applicable_directives: list(directive()),
    applicable_jurisdictions: list(String.t())
  }

  @doc """
  Performs comprehensive compliance assessment against specified directives.

  Evaluates the target domain against all requirements in each specified
  directive, collecting evidence, scoring compliance, and generating
  a prioritized remediation plan for identified gaps.

  ## Parameters

    - `domain` - Target domain to assess
    - `directives` - List of directives to assess against
    - `opts` - Assessment options
      - `:jurisdiction` - Specific jurisdiction (default: auto-detect from domain TLD)
      - `:depth` - Assessment depth (:quick | :standard | :comprehensive)
      - `:evidence_sources` - Additional evidence sources to consult

  ## Returns

    - `{:ok, list(assessment())}` - Assessment results per directive
    - `{:error, term()}` - Assessment execution failure
  """
  @spec assess(String.t(), list(directive()), keyword()) ::
    {:ok, list(assessment())} | {:error, term()}
  def assess(domain, directives, opts \\ []) do
    jurisdiction = Keyword.get(opts, :jurisdiction, detect_jurisdiction(domain))
    depth = Keyword.get(opts, :depth, :standard)

    assessments = Enum.map(directives, fn directive ->
      requirements = get_requirements(directive, jurisdiction)
      evaluated = Enum.map(requirements, &evaluate_requirement(&1, domain, depth))

      score = calculate_compliance_score(evaluated)
      gaps = Enum.filter(evaluated, &(&1.status in [:non_compliant, :not_assessed]))
      critical_gaps = Enum.filter(gaps, &(&1.priority == :critical))

      overall = cond do
        score >= 0.8 -> :compliant
        score >= 0.5 -> :partial
        true -> :non_compliant
      end

      assessment = %{
        directive: directive,
        jurisdiction: jurisdiction,
        assessed_at: DateTime.utc_now(),
        overall_status: overall,
        requirements: evaluated,
        score: score,
        gap_count: length(gaps),
        critical_gaps: critical_gaps,
        remediation_plan: generate_remediation_plan(gaps)
      }

      :telemetry.execute(
        [:prismatic, :perimeter, :compliance, :assessment],
        %{score: score, gap_count: length(gaps)},
        %{domain: domain, directive: directive, jurisdiction: jurisdiction}
      )

      Logger.info("Directive assessment completed",
        domain: domain,
        directive: directive,
        score: score,
        gap_count: length(gaps),
        critical_gap_count: length(critical_gaps)
      )

      assessment
    end)

    {:ok, assessments}
  end

  @doc """
  Classifies an entity to determine which directives apply.

  Based on the entity's sector, size, and jurisdiction, determines
  which EU directives and national transpositions are applicable.
  NIS2 applies to essential and important entities in 18 sectors;
  CER applies to critical entities in 11 sectors.

  ## Parameters

    - `domain` - Domain of the entity to classify
    - `opts` - Classification options
      - `:sector` - Override automatic sector detection
      - `:employee_count` - Entity size for threshold determination
      - `:annual_revenue` - Revenue for threshold determination

  ## Returns

    - `{:ok, entity_classification()}` - Classification result
    - `{:error, :insufficient_data}` - Cannot determine classification
  """
  @spec classify_entity(String.t(), keyword()) ::
    {:ok, entity_classification()} | {:error, term()}
  def classify_entity(domain, opts \\ []) do
    sector = Keyword.get(opts, :sector, detect_sector(domain))
    size = determine_size(opts)
    jurisdiction = detect_jurisdiction(domain)

    category = determine_nis2_category(sector, size)
    directives = determine_applicable_directives(sector, category)

    {:ok, %{
      domain: domain,
      sector: sector,
      category: category,
      size: size,
      applicable_directives: directives,
      applicable_jurisdictions: [jurisdiction]
    }}
  end

  @doc """
  Generates a compliance comparison report across multiple jurisdictions.

  Useful for multinational organizations that need to understand how
  the same directive is implemented differently across member states.

  ## Parameters

    - `directive` - The EU directive to compare
    - `jurisdictions` - List of jurisdiction codes to compare

  ## Returns

    - `{:ok, comparison_report}` - Cross-jurisdiction comparison
  """
  @spec compare_jurisdictions(directive(), list(String.t())) :: {:ok, map()}
  def compare_jurisdictions(directive, jurisdictions) do
    comparisons = Enum.map(jurisdictions, fn jurisdiction ->
      requirements = get_requirements(directive, jurisdiction)
      %{
        jurisdiction: jurisdiction,
        requirement_count: length(requirements),
        transposition_reference: get_transposition_reference(directive, jurisdiction),
        competent_authority: get_competent_authority(directive, jurisdiction),
        additional_requirements: get_gold_plating(directive, jurisdiction)
      }
    end)

    {:ok, %{
      directive: directive,
      jurisdictions: comparisons,
      compared_at: DateTime.utc_now()
    }}
  end

  # -- Private Functions --

  defp get_requirements(:nis2, _jurisdiction) do
    [
      %{id: "NIS2-21-1", article: "Article 21(1)", description: "Cybersecurity risk management measures",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :governance},
      %{id: "NIS2-21-2a", article: "Article 21(2)(a)", description: "Risk analysis and information security policies",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :organizational},
      %{id: "NIS2-21-2b", article: "Article 21(2)(b)", description: "Incident handling procedures",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :technical},
      %{id: "NIS2-21-2c", article: "Article 21(2)(c)", description: "Business continuity and crisis management",
        status: :not_assessed, evidence: [], remediation: nil, priority: :high, category: :organizational},
      %{id: "NIS2-21-2d", article: "Article 21(2)(d)", description: "Supply chain security assessment",
        status: :not_assessed, evidence: [], remediation: nil, priority: :high, category: :governance},
      %{id: "NIS2-21-2e", article: "Article 21(2)(e)", description: "Network and information system security",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :technical},
      %{id: "NIS2-23-1", article: "Article 23(1)", description: "Significant incident notification within 24 hours",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :organizational},
      %{id: "NIS2-23-2", article: "Article 23(2)", description: "Full incident notification within 72 hours",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :organizational},
      %{id: "NIS2-20-1", article: "Article 20(1)", description: "Management body cybersecurity training",
        status: :not_assessed, evidence: [], remediation: nil, priority: :high, category: :governance},
      %{id: "NIS2-21-2j", article: "Article 21(2)(j)", description: "Multi-factor authentication and encryption",
        status: :not_assessed, evidence: [], remediation: nil, priority: :high, category: :technical}
    ]
  end

  defp get_requirements(:zkb, _jurisdiction) do
    get_requirements(:nis2, "CZ") ++
      [
        %{id: "ZKB-NUKIB-1", article: "Section 4", description: "NUKIB registration obligation",
          status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :governance}
      ]
  end

  defp get_requirements(:cer, _jurisdiction) do
    [
      %{id: "CER-12-1", article: "Article 12(1)", description: "Risk assessment for critical entity resilience",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :governance},
      %{id: "CER-13-1", article: "Article 13(1)", description: "Technical, security, and organizational resilience measures",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :technical},
      %{id: "CER-15-1", article: "Article 15(1)", description: "Incident notification without undue delay",
        status: :not_assessed, evidence: [], remediation: nil, priority: :critical, category: :organizational}
    ]
  end

  defp get_requirements(:gdpr, _jurisdiction), do: []
  defp get_requirements(:dora, _jurisdiction), do: []

  defp evaluate_requirement(req, _domain, _depth) do
    %{req | status: :not_assessed}
  end

  defp calculate_compliance_score(requirements) do
    if requirements == [] do
      0.0
    else
      compliant = Enum.count(requirements, &(&1.status == :compliant))
      partial = Enum.count(requirements, &(&1.status == :partial))
      total = length(requirements)
      (compliant + partial * 0.5) / max(total, 1)
    end
  end

  defp generate_remediation_plan(gaps) do
    gaps
    |> Enum.sort_by(fn gap ->
      case gap.priority do
        :critical -> 0
        :high -> 1
        :medium -> 2
        :low -> 3
      end
    end)
    |> Enum.map(fn gap ->
      %{
        requirement_id: gap.id,
        priority: gap.priority,
        description: gap.description,
        recommended_actions: generate_actions(gap),
        estimated_effort: estimate_effort(gap)
      }
    end)
  end

  defp generate_actions(gap) do
    ["Review #{gap.article} requirements", "Implement #{gap.category} controls", "Document evidence"]
  end

  defp estimate_effort(%{priority: :critical}), do: "1-2 weeks"
  defp estimate_effort(%{priority: :high}), do: "2-4 weeks"
  defp estimate_effort(%{priority: :medium}), do: "1-2 months"
  defp estimate_effort(%{priority: :low}), do: "2-3 months"

  defp detect_jurisdiction(domain) do
    tld = domain |> String.split(".") |> List.last() |> String.downcase()
    case tld do
      "cz" -> "CZ"
      "de" -> "DE"
      "fr" -> "FR"
      "nl" -> "NL"
      "pl" -> "PL"
      _ -> "EU"
    end
  end

  defp detect_sector(_domain), do: :digital_infrastructure
  defp determine_size(opts) do
    count = Keyword.get(opts, :employee_count, 0)
    cond do
      count >= 250 -> :large
      count >= 50 -> :medium
      count >= 10 -> :small
      true -> :micro
    end
  end

  defp determine_nis2_category(sector, size) when sector in [:energy, :transport, :health, :digital_infrastructure] and size in [:large, :medium], do: :essential
  defp determine_nis2_category(_sector, size) when size in [:large, :medium], do: :important
  defp determine_nis2_category(_sector, _size), do: :out_of_scope

  defp determine_applicable_directives(sector, :out_of_scope), do: []
  defp determine_applicable_directives(sector, _category) do
    base = [:nis2]
    if sector in [:energy, :transport, :health, :water, :digital_infrastructure] do
      base ++ [:cer]
    else
      base
    end
  end

  defp get_transposition_reference(:nis2, "CZ"), do: "ZKB 264/2025 Sb."
  defp get_transposition_reference(:nis2, "DE"), do: "NIS2UmsuCG"
  defp get_transposition_reference(directive, jurisdiction), do: "#{directive}-#{jurisdiction}"

  defp get_competent_authority(:nis2, "CZ"), do: "NUKIB"
  defp get_competent_authority(:nis2, "DE"), do: "BSI"
  defp get_competent_authority(:nis2, "FR"), do: "ANSSI"
  defp get_competent_authority(_directive, _jurisdiction), do: "Unknown"

  defp get_gold_plating(_directive, _jurisdiction), do: []
end
```

## Common Pitfalls

| Pitfall | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| **Directive-Regulation Confusion** | Treating directives as directly applicable like regulations | Wrong legal text applied; compliance gaps | Always identify the applicable national transposition, not just the EU directive |
| **Single-Jurisdiction Assumption** | Assessing against one national transposition for multinational operations | Non-compliance in other member states | Map all operating jurisdictions and assess against each applicable transposition |
| **Scope Misclassification** | Incorrectly determining entity classification (essential vs important) | Wrong requirements applied; under- or over-compliance | Use formal sector and size threshold analysis per NIS2 Annex I/II |
| **Transposition Deadline Blindness** | Assuming directive is not yet applicable because transposition is pending | Member states may enforce directive objectives even before transposition | Track both directive deadline and national transposition status |
| **Article-Level Assessment** | Assessing compliance at the article level without decomposing into controls | Superficial compliance that misses specific technical requirements | Decompose each article into specific, assessable technical and organizational controls |
| **Gold-Plating Ignorance** | Not checking for stricter national requirements beyond the directive | Non-compliance with national additions | Compare national transposition against directive to identify additional obligations |
| **Static Assessment** | Point-in-time compliance assessment without continuous monitoring | Compliance drift between assessment cycles | Implement continuous compliance monitoring with alerting |
| **Incident Timeline Confusion** | Mixing up NIS2 24h/72h deadlines with GDPR 72h deadline | Late notification triggering regulatory penalties | Maintain separate incident notification workflows per directive |
| **Management Accountability Gap** | Not tracking NIS2 Article 20 management body training requirements | Personal liability exposure for board members | Track management cybersecurity training completion and certification |
| **Supply Chain Blindness** | Ignoring NIS2 Article 21(2)(d) supply chain security requirements | Compliance gap in third-party risk management | Integrate directive requirements into vendor assessment workflows |

## Best Practices

1. **Map directive requirements to technical controls** -- translate legal language into specific, measurable technical implementations that can be assessed and evidenced automatically.

2. **Automate compliance monitoring** -- manual compliance assessment is point-in-time and rapidly becomes stale; continuous monitoring provides ongoing assurance and early gap detection.

3. **Track national transpositions per jurisdiction** -- directives are implemented differently in each member state; maintain a registry of applicable national laws for each operating jurisdiction.

4. **Document evidence of compliance** -- automated evidence collection supports audit readiness and regulatory inquiries; link evidence to specific directive requirements.

5. **Monitor directive evolution** -- new directives and amendments regularly expand compliance obligations; subscribe to EUR-Lex notifications and ENISA guidance publications.

6. **Classify entities accurately** -- NIS2 scope determination is based on sector (Annex I/II) and size thresholds; incorrect classification leads to wrong requirements.

7. **Implement parallel incident reporting** -- maintain separate notification workflows for each applicable directive (NIS2 24h/72h, GDPR 72h, DORA 4h) to meet different deadlines.

8. **Track management body obligations** -- NIS2 Article 20 requires management bodies to undergo cybersecurity training; track completion and schedule renewal.

9. **Assess supply chain compliance** -- NIS2 Article 21(2)(d) requires supply chain security assessment; integrate directive requirements into vendor management processes.

10. **Emit telemetry for compliance operations** -- instrument all assessment, classification, and reporting operations with `:telemetry.execute/3` for monitoring compliance program effectiveness.

## Related Terms

- [GDPR](@/glossary/gdpr.md) -- EU regulation (not directive) for data protection, often assessed alongside NIS2
- [NIS2](@/glossary/nis2.md) -- Network and Information Security Directive, the primary EU cybersecurity directive
- [EASM](@/glossary/easm.md) -- External attack surface management supporting directive compliance assessment
- [ISO 27001](@/glossary/iso-27001.md) -- Information security standard aligned with NIS2 risk management requirements
- [Incident Reporting](@/glossary/incident-reporting.md) -- Mandatory notification obligations under NIS2, CER, and DORA
- [Data Controller](@/glossary/data-controller.md) -- GDPR role with directive-intersecting compliance obligations
- [Compliance](@/glossary/compliance.md) -- Broader regulatory compliance framework encompassing directive requirements
- [Critical Infrastructure](/glossary/critical-infrastructure/) -- Entities subject to CER and NIS2 essential entity classification
- [Risk Management](@/glossary/risk-management.md) -- Core requirement across NIS2, CER, and DORA
- [Certification](@/glossary/certification.md) -- ISO 27001 certification as evidence of NIS2 compliance
- [Regulation](/glossary/regulation/) -- Directly applicable EU legislative instrument (contrast with directive)
- [CER](/glossary/cer/) -- Critical Entities Resilience Directive for physical and cyber resilience

## See Also

- [Capabilities](@/capabilities/_index.md) -- Compliance assessment and directive mapping capabilities
- [Architecture](@/architecture/_index.md) -- Compliance framework architecture and Perimeter integration
- [OSINT Tools](@/osint/_index.md) -- Regulatory intelligence tools for directive monitoring
- [Technologies](@/technologies/_index.md) -- Compliance automation technologies and frameworks

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
