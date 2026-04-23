+++
title = "NIS2 Directive"
weight = 65
[extra]
description = "EU cybersecurity directive (2022/2555) establishing a high common level of network and information security across all member states"
category = "security"
tags = ["cybersecurity-regulation", "eu-directive", "compliance", "incident-reporting", "risk-management", "supply-chain-security", "critical-infrastructure", "easm"]
related_terms = ["zkb", "easm", "security-rating", "sanctions-screening", "attack-surface", "compliance-framework", "gdpr", "prismatic-perimeter", "owasp", "hawkeye"]
abbreviation = "NIS2"
difficulty = "intermediate"
importance = "critical"
platform_relevance = "core"
date_created = "2025-07-20"
date_updated = "2026-02-22"
version = "3.0.0"
audience = ["compliance-officers", "security-engineers", "ciso", "legal-counsel", "platform-architects"]
prerequisites = ["compliance-framework", "easm", "security-rating"]
domain = "regulatory-compliance"
related_patterns = ["evidence-based-scoring", "continuous-assessment", "dual-framework-assessment", "supply-chain-depth", "incident-reporting-readiness"]
see_also = ["architecture/_index.md", "technologies/_index.md", "apps/prismatic-perimeter.md", "capabilities/_index.md"]
acronyms = ["NIS2", "CSIRT", "ENISA", "NUKIB", "TLS", "DNS", "DNSSEC", "SPF", "DMARC", "DKIM", "HSTS", "MFA"]
standards = ["EU-2022/2555", "ISO-27001", "NIST-CSF", "OWASP", "ZKB-264/2025"]
tools = ["PrismaticPerimeter.Compliance.NIS2", "PrismaticPerimeter.Compliance.Engine", "PrismaticPerimeter.Compliance.NIS2.EvidenceCollector"]
platforms = ["prismatic-platform", "prismatic-perimeter"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1743
date_modified = "2026-02-23"
keywords = ["NIS2", "Directive", "20222555", "glossary", "security", "Prismatic Platform", "Article", "Large", "Medium"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "NIS2 Directive - Prismatic Platform"
+++

## Definition and Overview

The NIS2 Directive (Directive (EU) 2022/2555) is the European Union's comprehensive cybersecurity legislation that establishes a high common level of cybersecurity across all member states. Adopted on December 14, 2022, and requiring transposition into national law by October 17, 2024, NIS2 represents a substantial evolution of the original NIS Directive (2016/1148) by dramatically expanding its scope from a few hundred organizations to tens of thousands across the EU, strengthening enforcement mechanisms with significant financial penalties, and introducing harmonized penalty structures that bring cybersecurity enforcement closer to the GDPR model.

NIS2 applies to two categories of entities: **essential entities** (large organizations in critical sectors such as energy, transport, banking, health, and digital infrastructure) and **important entities** (medium-sized organizations in sectors including postal services, waste management, food production, manufacturing, and digital providers). The directive mandates risk-based cybersecurity measures, incident reporting within strict timelines (24 hours for early warning, 72 hours for full notification), supply chain security assessments, and executive management accountability for cybersecurity posture.

The directive is significant because it shifts cybersecurity from a voluntary best practice to a mandatory regulatory requirement with teeth. Non-compliance can result in administrative fines of up to 10 million EUR or 2% of global annual turnover for essential entities, and up to 7 million EUR or 1.4% of turnover for important entities. Management bodies can be held personally liable for cybersecurity failures, creating individual accountability that goes beyond organizational penalties. This personal liability provision has fundamentally changed how C-level executives approach cybersecurity governance.

Within the Prismatic Platform, NIS2 compliance assessment is a core feature of [Prismatic Perimeter](@/glossary/prismatic-perimeter.md), the External Attack Surface Management application that evaluates organizations against NIS2 requirements and incorporates compliance posture into [Security Ratings](@/glossary/security-rating.md). The platform performs automated, evidence-based assessment against NIS2 Article 21 risk management measures and Article 23 incident reporting readiness.

## Scope and Entity Classification

NIS2 significantly expands the scope of EU cybersecurity regulation compared to the original NIS Directive. The classification system uses two dimensions -- sector criticality and organization size -- to determine which entities fall under the directive's requirements.

### Essential Entities (Annex I - High Criticality Sectors)

| Sector | Sub-sectors | Size Threshold |
|--------|-------------|----------------|
| **Energy** | Electricity, district heating/cooling, oil, gas, hydrogen | Large enterprises |
| **Transport** | Air, rail, water, road | Large enterprises |
| **Banking** | Credit institutions | Large enterprises |
| **Financial Market** | Trading venues, central counterparties | Large enterprises |
| **Health** | Healthcare providers, laboratories, pharma, medical devices | Large enterprises |
| **Drinking Water** | Suppliers and distributors | Large enterprises |
| **Wastewater** | Collection, disposal, treatment | Large enterprises |
| **Digital Infrastructure** | IXPs, DNS, TLD registries, cloud, data centers, CDNs, trust services | Regardless of size |
| **ICT Service Management** | Managed service providers, managed security service providers | Large enterprises |
| **Public Administration** | Central government entities | Regardless of size |
| **Space** | Ground-based infrastructure operators | Large enterprises |

### Important Entities (Annex II - Other Critical Sectors)

| Sector | Sub-sectors | Size Threshold |
|--------|-------------|----------------|
| **Postal and Courier** | Postal service providers | Medium enterprises |
| **Waste Management** | Waste collection and treatment | Medium enterprises |
| **Chemicals** | Manufacturing, production, distribution | Medium enterprises |
| **Food** | Production, processing, distribution | Medium enterprises |
| **Manufacturing** | Medical devices, computers, electronics, machinery, vehicles | Medium enterprises |
| **Digital Providers** | Online marketplaces, search engines, social networks | Medium enterprises |
| **Research** | Research organizations | Medium enterprises |

Entity classification must consider sector, size, and criticality thresholds precisely as defined in Articles 3 and 4. Incorrectly classifying an entity as "important" when it meets "essential" criteria leads to inadequate security measures and potential regulatory action.

## Risk Management Measures (Article 21)

Article 21 is the technical heart of NIS2, establishing the minimum set of cybersecurity risk management measures that all in-scope entities must implement. These measures are proportionate, meaning they should be appropriate to the risks posed to the security of network and information systems.

| Article | Measure | Description | Technical Implementation |
|---------|---------|-------------|--------------------------|
| 21.2(a) | Risk analysis and policies | Information system security policies | Documented risk assessment frameworks |
| 21.2(b) | Incident handling | Detection, response, and recovery procedures | SIEM integration, response playbooks |
| 21.2(c) | Business continuity | Backup management, disaster recovery, crisis management | DR testing, RTO/RPO definitions |
| 21.2(d) | Supply chain security | Security assessment of suppliers and service providers | Third-party risk scoring |
| 21.2(e) | Security in acquisition | Network and information system lifecycle security | Secure SDLC integration |
| 21.2(f) | Effectiveness assessment | Policies and procedures to assess measure effectiveness | Continuous monitoring, penetration testing |
| 21.2(g) | Cyber hygiene and training | Basic cyber hygiene practices and employee training | Security awareness programs |
| 21.2(h) | Cryptography | Policies on use of cryptography and encryption | TLS enforcement, key management |
| 21.2(i) | Human resources security | Access control policies, asset management | RBAC, privileged access management |
| 21.2(j) | Multi-factor authentication | MFA, continuous authentication, secured communications | SSO integration, certificate management |

## Incident Reporting Timeline (Article 23)

NIS2 mandates a structured incident reporting timeline that is considerably more demanding than the original NIS Directive. Significant incidents must be reported to the relevant CSIRT or competent authority according to the following schedule:

| Phase | Deadline | Content Required | Purpose |
|-------|----------|------------------|---------|
| **Early Warning** | Within 24 hours | Whether incident is suspected to be caused by unlawful or malicious acts, cross-border impact | Rapid awareness, coordination activation |
| **Incident Notification** | Within 72 hours | Updated assessment including severity, impact, indicators of compromise | Informed response, resource allocation |
| **Intermediate Report** | Upon request | Status updates on incident handling and recovery | Ongoing coordination |
| **Final Report** | Within 1 month | Root cause analysis, mitigation measures, cross-border impact assessment | Lessons learned, regulatory assessment |

For incidents with cross-border impact, entities must also notify the relevant ENISA (European Union Agency for Cybersecurity) contact point. The 24-hour early warning requirement is particularly challenging because it requires organizations to have detection capabilities, classification procedures, and reporting channels operational around the clock.

## Architecture and Implementation

The architecture for NIS2 compliance assessment within the Prismatic Platform requires multiple interconnected components that evaluate an organization's cybersecurity posture against the directive's requirements.

```elixir
defmodule PrismaticPerimeter.Compliance.NIS2 do
  @moduledoc """
  NIS2 Directive compliance assessment engine.

  Evaluates organizational cybersecurity posture against
  EU Directive 2022/2555 requirements across Article 21
  risk management measures and Article 23 reporting readiness.

  Assessment is evidence-based: every compliance score is backed
  by observable technical evidence collected through EASM discovery,
  DNS analysis, TLS probing, and certificate audit. No self-reported
  questionnaire data is accepted without technical corroboration.
  """

  @type entity_class :: :essential | :important | :out_of_scope
  @type compliance_grade :: :compliant | :partially_compliant | :non_compliant

  @type assessment_result :: %{
    overall_score: float(),
    grade: compliance_grade(),
    entity_classification: entity_class(),
    article_21_scores: %{String.t() => %{score: float(), status: compliance_grade()}},
    article_23_readiness: boolean(),
    gaps: [gap()],
    recommendations: [recommendation()],
    evidence_count: non_neg_integer(),
    assessed_at: DateTime.t()
  }

  @type gap :: %{
    article: String.t(),
    requirement: String.t(),
    severity: :critical | :high | :medium | :low,
    evidence: [String.t()],
    remediation: String.t()
  }

  @type recommendation :: %{
    priority: :immediate | :short_term | :medium_term,
    article: String.t(),
    action: String.t(),
    expected_impact: String.t()
  }

  @spec assess(String.t(), keyword()) :: {:ok, assessment_result()} | {:error, term()}
  def assess(domain, opts \\ []) do
    with {:ok, evidence} <- collect_evidence(domain, opts),
         {:ok, entity_class} <- classify_entity(domain, opts),
         {:ok, article_21} <- evaluate_article_21(evidence),
         {:ok, article_23} <- evaluate_article_23(evidence),
         {:ok, governance} <- evaluate_governance(evidence) do
      {:ok, compile_assessment(entity_class, article_21, article_23, governance)}
    end
  end

  defp collect_evidence(domain, opts) do
    timeout = Keyword.get(opts, :timeout, :timer.seconds(30))

    tasks = [
      Task.async(fn -> assess_tls_configuration(domain) end),
      Task.async(fn -> assess_dns_security(domain) end),
      Task.async(fn -> assess_certificate_hygiene(domain) end),
      Task.async(fn -> assess_header_security(domain) end),
      Task.async(fn -> assess_exposure_surface(domain, opts) end)
    ]

    results = Task.await_many(tasks, timeout)
    {:ok, merge_evidence(results)}
  end

  defp classify_entity(_domain, opts) do
    case Keyword.get(opts, :entity_class) do
      nil -> {:ok, :important}
      class when class in [:essential, :important, :out_of_scope] -> {:ok, class}
      _ -> {:error, :invalid_entity_classification}
    end
  end
end
```

## Evidence Collection Pipeline

Evidence collection is the foundation of NIS2 compliance assessment. The platform collects observable technical evidence from the external attack surface that maps to specific NIS2 requirements:

```elixir
defmodule PrismaticPerimeter.Compliance.NIS2.EvidenceCollector do
  @moduledoc """
  Collects technical evidence for NIS2 compliance assessment.
  Maps observable security controls to NIS2 Article 21 requirements.

  Evidence types:
  - TLS/Certificate evidence -> Article 21.2(h) Cryptography
  - DNS security evidence -> Article 21.2(a) Risk analysis
  - HTTP security headers -> Article 21.2(e) Security in acquisition
  - Exposure surface -> Article 21.2(d) Supply chain security
  - Authentication probes -> Article 21.2(j) Multi-factor authentication
  """

  @spec collect_tls_evidence(String.t()) :: {:ok, map()} | {:error, term()}
  def collect_tls_evidence(domain) do
    with {:ok, cert_chain} <- fetch_certificate_chain(domain),
         {:ok, tls_config} <- probe_tls_configuration(domain),
         {:ok, hsts_status} <- check_hsts_header(domain) do
      evidence = %{
        certificate_valid: cert_chain.valid?,
        certificate_expiry_days: cert_chain.days_until_expiry,
        certificate_issuer: cert_chain.issuer,
        tls_version: tls_config.highest_version,
        tls_versions_supported: tls_config.all_versions,
        weak_ciphers: tls_config.weak_cipher_count,
        strong_ciphers: tls_config.strong_cipher_count,
        hsts_enabled: hsts_status.enabled,
        hsts_max_age: hsts_status.max_age,
        hsts_include_subdomains: hsts_status.include_subdomains,
        maps_to_article: "21.2(h)",
        confidence: calculate_confidence(cert_chain, tls_config, hsts_status),
        collected_at: DateTime.utc_now()
      }

      {:ok, evidence}
    end
  end

  @spec collect_dns_evidence(String.t()) :: {:ok, map()} | {:error, term()}
  def collect_dns_evidence(domain) do
    with {:ok, dnssec} <- check_dnssec(domain),
         {:ok, spf} <- check_spf_record(domain),
         {:ok, dmarc} <- check_dmarc_record(domain),
         {:ok, dkim} <- check_dkim_record(domain) do
      evidence = %{
        dnssec_enabled: dnssec.enabled,
        dnssec_algorithm: dnssec.algorithm,
        spf_configured: spf.present?,
        spf_policy: spf.policy,
        dmarc_configured: dmarc.present?,
        dmarc_policy: dmarc.policy,
        dmarc_aggregate_reporting: dmarc.rua != nil,
        dkim_configured: dkim.present?,
        maps_to_article: "21.2(a)",
        confidence: calculate_dns_confidence(dnssec, spf, dmarc, dkim),
        collected_at: DateTime.utc_now()
      }

      {:ok, evidence}
    end
  end
end
```

## Compliance Dashboard and Usage

The compliance dashboard at `/perimeter/compliance` provides detailed NIS2 assessment alongside [ZKB](@/glossary/zkb.md) (Czech cybersecurity regulation). The dashboard displays per-article compliance scores, identified gaps with severity ratings, and actionable recommendations for remediation. NIS2 compliance factors directly influence the A-F security grade and 300-900 numeric [security rating](@/glossary/security-rating.md).

```elixir
# Assess a domain against NIS2 requirements
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2])

# Result structure
%{
  framework: :nis2,
  overall_score: 0.78,
  grade: :partially_compliant,
  entity_classification: :important,
  article_scores: %{
    "21.2(a)" => %{score: 0.85, status: :compliant},
    "21.2(b)" => %{score: 0.60, status: :partially_compliant},
    "21.2(c)" => %{score: 0.90, status: :compliant},
    "21.2(d)" => %{score: 0.45, status: :non_compliant},
    "21.2(e)" => %{score: 0.75, status: :partially_compliant},
    "21.2(h)" => %{score: 0.92, status: :compliant},
    "21.2(j)" => %{score: 0.70, status: :partially_compliant}
  },
  gaps: [
    %{article: "21.2(d)", requirement: "Supply chain security",
      severity: :high, recommendation: "Implement third-party risk scoring"},
    %{article: "21.2(b)", requirement: "Incident handling",
      severity: :medium, recommendation: "Establish 24-hour notification capability"}
  ]
}
```

## National Transposition Considerations

NIS2 requires transposition into national law by each EU member state, and member states may add requirements beyond the directive's minimum. This creates compliance complexity for organizations operating across multiple jurisdictions.

| Member State | National Law | Additional Requirements | Competent Authority |
|-------------|-------------|------------------------|---------------------|
| **Czech Republic** | ZKB 264/2025 Sb. | Czech language documentation, NUKIB-specific reporting | NUKIB |
| **Germany** | NIS2UmsuCG (draft) | BSI certification for critical infrastructure | BSI |
| **France** | Transposition (pending) | ANSSI certification programs | ANSSI |
| **Netherlands** | Wbni amendment | Dutch DPA coordination for cross-cutting incidents | NCSC-NL |

The [ZKB](@/glossary/zkb.md) (Czech Cybersecurity Act, 264/2025 Sb.) adds specific requirements not present in the directive itself, including mandatory Czech-language security documentation, NUKIB-specific audit requirements, and alignment with Czech critical infrastructure designations. The Prismatic Platform's dual-framework assessment capability handles NIS2 and ZKB simultaneously, identifying where requirements overlap and where they diverge.

## Integration Points

NIS2 assessment integrates with multiple platform components to provide comprehensive compliance visibility:

- **Asset Discovery**: [EASM](@/glossary/easm.md) discovery pipeline feeds domain, IP, certificate, and cloud resource data into the compliance engine
- **Security Ratings**: NIS2 compliance score contributes to the overall A-F security rating and 300-900 numeric score
- **OSINT Sources**: [OSINT](@/glossary/osint.md) data enriches compliance evidence through certificate transparency logs, DNS records, and exposed service detection
- **Incident Detection**: [HAWKEYE](@/glossary/hawkeye.md) visitor intelligence supports NIS2 Article 23 incident detection readiness
- **Quality Framework**: The platform's [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) pattern is applied to compliance monitoring, triggering alerts when compliance posture drifts below acceptable thresholds
- **[NABLA Infinity](@/glossary/nabla-infinity.md)**: Evidence plurality requirements ensure compliance scores are backed by multiple independent evidence sources

## Compliance Report Generation

```elixir
defmodule PrismaticPerimeter.Compliance.NIS2.Reporter do
  @moduledoc """
  Generates structured NIS2 compliance reports with gap analysis,
  remediation recommendations, and evidence inventories suitable
  for regulatory submission to CSIRTs and competent authorities.
  """

  @spec generate_report(map(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def generate_report(assessment, opts \\ []) do
    format = Keyword.get(opts, :format, :markdown)
    language = Keyword.get(opts, :language, :en)

    report = build_report_sections(assessment, language)
    formatted = format_report(report, format)

    {:ok, formatted}
  end

  defp build_report_sections(assessment, _language) do
    %{
      header: report_header(assessment),
      executive_summary: executive_summary(assessment),
      entity_classification: entity_classification_section(assessment),
      article_21_assessment: article_21_details(assessment),
      article_23_readiness: article_23_assessment(assessment),
      gap_analysis: gap_analysis(assessment),
      remediation_roadmap: remediation_roadmap(assessment),
      evidence_inventory: evidence_inventory(assessment),
      methodology: assessment_methodology()
    }
  end
end
```

## Best Practices

1. **Evidence-Based Scoring**: All compliance scores must be backed by observable technical evidence. Never assign compliance grades based on self-reported questionnaires alone. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework's signal plurality axiom applies directly -- compliance scores require multiple independent evidence sources.

2. **Continuous Assessment**: NIS2 compliance is not a point-in-time audit. Implement continuous monitoring through the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) pattern to detect compliance drift as external attack surfaces change. New subdomains appear, certificates expire, and configurations drift daily.

3. **Dual-Framework Assessment**: When operating in Czech jurisdiction, always assess NIS2 alongside [ZKB](@/glossary/zkb.md) (264/2025 Sb.) since requirements overlap but are not identical. The Prismatic Perimeter compliance module supports simultaneous dual-framework evaluation.

4. **Supply Chain Depth**: NIS2 Article 21.2(d) requires supply chain security assessment. Extend [EASM](@/glossary/easm.md) discovery beyond the primary domain to include third-party services, CDN providers, and cloud infrastructure dependencies.

5. **Incident Reporting Readiness**: Ensure the platform can generate Article 23 compliant early warnings within 24 hours. Pre-build reporting templates and automate evidence collection for incident notifications.

6. **Management Accountability**: Document the governance structure clearly. NIS2 introduces personal liability for management bodies -- ensure that cybersecurity responsibilities are formally assigned and acknowledged.

## Common Pitfalls

- **Scope Misclassification**: Incorrectly classifying an entity as "important" when it meets "essential" criteria leads to inadequate security measures and higher regulatory risk. Entity classification must consider sector, size, and criticality thresholds precisely as defined in Articles 3 and 4.

- **Transposition Variance**: NIS2 requires transposition into national law, and member states may add requirements. Czech transposition (ZKB) adds specific requirements not present in the directive itself. Always assess against both the directive and applicable national law.

- **Static Assessment**: Treating compliance as a one-time evaluation rather than a continuous process. Attack surfaces change daily -- new subdomains appear, certificates expire, and configurations drift. Compliance assessment must run continuously.

- **Evidence Gaps**: Relying on infrastructure-level evidence alone without considering governance, training, and process maturity. NIS2 requires both technical controls and organizational measures.

- **Penalty Underestimation**: Failing to communicate the severity of non-compliance penalties. For essential entities, fines can reach 10 million EUR or 2% of global annual turnover, whichever is higher. Personal liability for management adds individual risk.

- **24-Hour Reporting Overconfidence**: Assuming that existing monitoring and alerting infrastructure meets the 24-hour early warning requirement. The requirement demands not just detection but classification and formal notification within 24 hours.

## Related Concepts

- [ZKB](@/glossary/zkb.md) - Czech cybersecurity regulation (264/2025 Sb.) complementing NIS2 at national level
- [EASM](@/glossary/easm.md) - External Attack Surface Management system performing NIS2 compliance assessment
- [Security Rating](@/glossary/security-rating.md) - A-F grade incorporating NIS2 compliance posture
- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) - Application implementing NIS2 compliance assessment
- [Compliance Framework](@/glossary/compliance-framework.md) - General framework category that NIS2 belongs to
- [GDPR](@/glossary/gdpr.md) - EU data protection regulation with similar enforcement model
- [Sanctions Screening](@/glossary/sanctions-screening.md) - Related regulatory compliance capability
- [HAWKEYE](@/glossary/hawkeye.md) - Visitor intelligence supporting NIS2 incident detection
- [OWASP](@/glossary/owasp.md) - Security standards referenced in NIS2 implementation guidance
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework ensuring evidence-based compliance scoring

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Prismatic Perimeter App](@/apps/prismatic-perimeter.md) - EASM application documentation
- [OSINT Capabilities](@/capabilities/_index.md) - Intelligence capabilities powering compliance evidence

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
