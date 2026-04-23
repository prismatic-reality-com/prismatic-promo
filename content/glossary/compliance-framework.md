+++
title = "Compliance Framework"
weight = 59
[extra]
category = "security"
description = "Structured set of regulatory requirements and controls organizations must satisfy"
related_terms = ["gdpr", "nis2", "zkb", "iso-27001", "security-rating"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1016
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Compliance", "Framework", "Structured", "glossary", "security", "Prismatic Platform", "GDPR", "NUKIB"]
tags = ["glossary", "security", "compliance-framework", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Compliance Framework - Prismatic Platform"
+++

## Definition and Overview

A compliance framework is a structured set of guidelines, regulations, and controls that organizations must implement to meet legal, regulatory, or industry requirements. Frameworks define what security controls are needed, how they should be implemented, and how compliance is assessed. Common frameworks include GDPR (data privacy), NIS2 (network security), ISO 27001 (information security management), SOC 2 (service organization controls), and PCI DSS (payment card industry).

Compliance frameworks serve as the bridge between abstract security goals and concrete, measurable controls. They translate legislative intent ("organizations must protect personal data") into specific technical and organizational requirements ("implement encryption for data at rest and in transit, maintain access logs for 12 months, conduct annual penetration testing"). This translation is critical because it provides a clear, auditable standard against which an organization's security posture can be measured.

The compliance landscape has grown increasingly complex as digital regulation expands globally. Organizations operating across jurisdictions must satisfy multiple overlapping frameworks simultaneously -- GDPR for EU data protection, NIS2 for network security, local regulations like the Czech ZKB, and industry standards like ISO 27001. This multi-framework reality demands automated assessment tools that can map technical findings to multiple regulatory requirements in parallel, which is precisely what [Prismatic Perimeter](/glossary/easm/) delivers.

## Technical Deep Dive

### Framework Taxonomy

Compliance frameworks can be categorized by their origin and enforceability:

| Category | Examples | Enforcement | Penalties |
|----------|---------|-------------|-----------|
| Regulatory (Mandatory) | GDPR, NIS2, ZKB, HIPAA | Legal requirement | Fines up to 2-4% of global revenue |
| Industry Standard | PCI DSS, SOC 2 | Contractual requirement | Loss of business relationships |
| Voluntary Standard | ISO 27001, NIST CSF | Self-imposed | Loss of certification |
| Internal Policy | Company security policies | Organizational | Disciplinary action |

### Control Categories

Most frameworks organize controls into common categories:

| Category | Description | Example Controls |
|----------|-------------|-----------------|
| Governance | Organizational structure and accountability | Security policy, roles and responsibilities, risk management |
| Access Control | Who can access what resources | Authentication, authorization, privilege management |
| Data Protection | Safeguarding data confidentiality and integrity | Encryption, backup, data classification |
| Network Security | Protecting network infrastructure | Firewalls, segmentation, intrusion detection |
| Incident Response | Handling security incidents | Detection, containment, notification, recovery |
| Business Continuity | Maintaining operations during disruptions | DR planning, redundancy, failover |
| Monitoring | Observing and recording system activity | Logging, alerting, audit trails |
| Supply Chain | Managing third-party security risks | Vendor assessment, contractual requirements |

### Framework Maturity Levels

Organizations progress through maturity levels in their compliance journey:

| Level | Name | Description |
|-------|------|-------------|
| 1 | Initial | Ad hoc controls, no formal framework |
| 2 | Developing | Framework selected, controls being implemented |
| 3 | Defined | Controls documented and consistently applied |
| 4 | Managed | Controls measured and monitored with metrics |
| 5 | Optimizing | Continuous improvement based on metrics and threat intelligence |

### NIS2 Directive (EU 2022/2555)

The Network and Information Security Directive 2 (NIS2) is the EU's primary cybersecurity regulation, replacing the original NIS Directive:

| Aspect | Detail |
|--------|--------|
| Scope | Essential and important entities across 18 sectors |
| Requirements | Risk management, incident reporting, supply chain security |
| Reporting | Significant incidents reported within 24 hours (early warning), 72 hours (full notification) |
| Penalties | Up to 10M EUR or 2% of global turnover for essential entities |
| Effective | October 2024 (member state transposition) |
| Key Articles | Art. 21 (risk management measures), Art. 23 (incident reporting) |

### ZKB 264/2025 Sb. (Czech Cybersecurity Act)

The Czech national transposition of NIS2 with additional local requirements:

| Aspect | Detail |
|--------|--------|
| Scope | Critical infrastructure, essential services, important entities |
| Registry | NUKIB (National Cyber and Information Security Agency) |
| Requirements | Security documentation, risk assessment, incident handling |
| Reporting | Aligned with NIS2 timelines plus NUKIB-specific requirements |
| Language | Czech language documentation required |
| Audit | Regular audits by NUKIB-certified auditors |

## Architecture and Implementation

### Compliance Assessment Engine

```elixir
defmodule PrismaticPerimeter.Compliance.Engine do
  @moduledoc """
  Multi-framework compliance assessment engine.
  Evaluates discovered assets against framework requirements
  and maps technical findings to regulatory controls.
  """

  @frameworks [:nis2, :zkb, :iso27001, :gdpr]

  @spec assess(String.t(), [atom()]) :: {:ok, map()} | {:error, term()}
  def assess(target, frameworks \\ [:nis2, :zkb]) do
    with {:ok, assets} <- PrismaticPerimeter.discover(target),
         {:ok, findings} <- analyze_security_posture(assets) do
      assessments = Enum.map(frameworks, fn framework ->
        {framework, assess_framework(framework, findings)}
      end)

      {:ok, %{
        target: target,
        assessed_at: DateTime.utc_now(),
        frameworks: Map.new(assessments),
        overall_status: calculate_overall_status(assessments)
      }}
    end
  end

  defp assess_framework(:nis2, findings) do
    controls = PrismaticPerimeter.Compliance.NIS2.controls()

    Enum.map(controls, fn control ->
      evidence = evaluate_control(control, findings)
      %{
        article: control.article,
        requirement: control.description,
        status: evidence.status,
        evidence: evidence.details,
        remediation: if(evidence.status == :fail, do: control.remediation)
      }
    end)
  end

  defp assess_framework(:zkb, findings) do
    controls = PrismaticPerimeter.Compliance.ZKB.controls()
    Enum.map(controls, fn control ->
      evaluate_control(control, findings)
    end)
  end
end
```

### Control Mapping

```elixir
defmodule PrismaticPerimeter.Compliance.NIS2 do
  @moduledoc """
  NIS2 Directive control definitions and assessment logic.
  Maps Article 21 requirements to technical checks.
  """

  def controls do
    [
      %{
        article: "Art. 21(2)(a)",
        description: "Policies on risk analysis and information system security",
        checks: [:security_policy, :risk_assessment, :asset_inventory],
        remediation: "Implement documented security policy and risk assessment process"
      },
      %{
        article: "Art. 21(2)(b)",
        description: "Incident handling",
        checks: [:incident_response_plan, :detection_capability, :notification_process],
        remediation: "Establish incident response procedures with 24h notification capability"
      },
      %{
        article: "Art. 21(2)(c)",
        description: "Business continuity and crisis management",
        checks: [:backup_strategy, :dr_plan, :bcp_testing],
        remediation: "Implement and test business continuity and disaster recovery plans"
      },
      %{
        article: "Art. 21(2)(d)",
        description: "Supply chain security",
        checks: [:vendor_assessment, :dependency_scanning, :third_party_monitoring],
        remediation: "Assess and monitor supply chain security including dependencies"
      },
      %{
        article: "Art. 21(2)(e)",
        description: "Security in network and information systems acquisition",
        checks: [:secure_development, :vulnerability_management, :patch_management],
        remediation: "Implement secure development lifecycle and vulnerability management"
      },
      %{
        article: "Art. 21(2)(h)",
        description: "Policies and procedures regarding use of cryptography and encryption",
        checks: [:tls_configuration, :certificate_management, :key_management],
        remediation: "Deploy strong cryptography with proper key and certificate management"
      },
      %{
        article: "Art. 21(2)(j)",
        description: "Use of multi-factor authentication and continuous authentication",
        checks: [:mfa_deployment, :authentication_strength, :session_management],
        remediation: "Deploy MFA for all administrative and critical system access"
      }
    ]
  end
end
```

### Compliance Report Generation

```elixir
defmodule PrismaticPerimeter.Compliance.Report do
  @moduledoc """
  Generates compliance assessment reports for regulatory submission.
  """

  @spec generate(map(), atom()) :: {:ok, String.t()}
  def generate(assessment, format \\ :markdown) do
    report = """
    # Compliance Assessment Report
    ## Target: #{assessment.target}
    ## Date: #{DateTime.to_iso8601(assessment.assessed_at)}

    ## Executive Summary
    #{executive_summary(assessment)}

    ## Framework Assessments
    #{framework_details(assessment.frameworks)}

    ## Gap Analysis
    #{gap_analysis(assessment)}

    ## Remediation Roadmap
    #{remediation_roadmap(assessment)}

    ## Evidence Inventory
    #{evidence_inventory(assessment)}
    """

    {:ok, report}
  end

  defp executive_summary(assessment) do
    total_controls = count_controls(assessment.frameworks)
    passing = count_passing(assessment.frameworks)
    percentage = Float.round(passing / max(total_controls, 1) * 100, 1)

    """
    Overall compliance score: #{percentage}% (#{passing}/#{total_controls} controls passing)
    Status: #{assessment.overall_status}
    Frameworks assessed: #{Map.keys(assessment.frameworks) |> Enum.join(", ")}
    """
  end
end
```

## Usage in Prismatic Platform

The Prismatic Perimeter implements compliance assessment for NIS2 and ZKB frameworks, with extensibility for additional frameworks.

### Compliance Dashboard

The compliance assessment is accessible via Phoenix LiveView at `/perimeter/compliance`:

```elixir
defmodule PrismaticPerimeterWeb.ComplianceLive do
  use PrismaticPerimeterWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket,
      frameworks: [:nis2, :zkb],
      assessment: nil,
      loading: false
    )}
  end

  @impl true
  def handle_event("assess", %{"target" => target}, socket) do
    {:ok, assessment} = PrismaticPerimeter.assess_compliance(
      target,
      socket.assigns.frameworks
    )

    {:noreply, assign(socket, assessment: assessment, loading: false)}
  end
end
```

### API Integration

```bash
# Assess compliance via REST API
curl -X POST http://localhost:4004/api/v1/perimeter/assess_compliance \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "frameworks": ["nis2", "zkb"]}'

# Response:
# {
#   "target": "example.com",
#   "overall_status": "partial_compliance",
#   "nis2": {"passing": 5, "failing": 2, "total": 7},
#   "zkb": {"passing": 4, "failing": 1, "total": 5}
# }
```

### Security Rating Contextualization

[Security ratings](/glossary/security-rating/) (A-F) are contextualized against specific compliance frameworks:

| Rating | NIS2 Implication | ZKB Implication |
|--------|-----------------|-----------------|
| A (850-900) | Full compliance expected | Full compliance expected |
| B (700-849) | Minor gaps, likely compliant | Minor gaps, remediation recommended |
| C (550-699) | Material gaps, partial compliance | Material gaps, NUKIB review risk |
| D (400-549) | Significant gaps, non-compliant | Significant gaps, enforcement risk |
| F (300-399) | Critical gaps, enforcement likely | Critical gaps, immediate action required |

## Best Practices

1. **Assess against multiple frameworks simultaneously** -- Organizations typically face multiple compliance obligations. Map findings to all applicable frameworks in a single assessment pass.

2. **Automate evidence collection** -- Manual evidence gathering is slow, error-prone, and stale by the time auditors review it. Automate technical control verification.

3. **Maintain continuous compliance** -- Point-in-time assessments create a false sense of security. Implement continuous monitoring to detect compliance drift between formal assessments.

4. **Map technical findings to business risk** -- Compliance gaps should be communicated in terms of regulatory risk (fines, enforcement actions), not just technical deficiencies.

5. **Version control your policies** -- Compliance documentation should be version-controlled, reviewed regularly, and updated when regulations change.

6. **Plan for framework evolution** -- Regulations change. Design your compliance engine to be extensible so new frameworks and updated control requirements can be added without architectural changes.

## Common Pitfalls

- **Checkbox compliance**: Implementing controls to pass audits rather than to genuinely protect the organization. This creates a false sense of security and fails under real-world threats.

- **Framework proliferation**: Attempting to comply with too many frameworks simultaneously without a unified control mapping. Use a master control framework (like NIST CSF) and map other frameworks to it.

- **Stale assessments**: Treating a point-in-time compliance assessment as a permanent state. Infrastructure and threats change continuously; assessments must be recurring.

- **Missing evidence**: Having controls in place but no evidence of their operation. Auditors require proof, not assertions.

- **Ignoring scope definition**: Failing to clearly define what systems and data are in scope for each framework. Scope creep or underscoping both create compliance risks.

## Related Concepts

- [GDPR](/glossary/gdpr/) -- EU data protection regulation assessed by the platform
- [NIS2](/glossary/nis2/) -- EU network and information security directive
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulation
- [Security Rating](/glossary/security-rating/) -- Technical score contextualized against compliance frameworks
- [EASM](/glossary/easm/) -- External attack surface management providing compliance data
- [CVE](/glossary/cve/) -- Vulnerability identifiers used in compliance assessments

## Further Reading

- [NIS2 Directive Full Text](https://eur-lex.europa.eu/eli/dir/2022/2555) -- Official EU legislation
- [Architecture](/architecture/) -- Compliance assessment architecture
- [Apps](/apps/) -- Prismatic Perimeter compliance features
- [Technologies](/technologies/) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)