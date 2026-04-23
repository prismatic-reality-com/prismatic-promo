+++
title = "SOC 2"
weight = 53
[extra]
category = "security"
description = "Service Organization Control Type 2 audit framework for trust services evaluating security, availability, processing integrity, confidentiality, and privacy controls"
related_terms = ["compliance-framework", "iso-27001", "gdpr", "nis2", "rbac", "encryption-at-rest", "security-rating", "easm", "zkb"]
difficulty = "intermediate"
importance = "critical"
platform_relevance = "high"
date_created = "2025-05-15"
date_updated = "2026-02-22"
version = "2.0.0"
audience = ["compliance-officers", "security-engineers", "platform-architects", "auditors", "ctos"]
prerequisites = ["compliance-framework", "rbac", "encryption-at-rest"]
domain = "compliance"
related_patterns = ["continuous-compliance", "control-mapping", "evidence-collection", "audit-trail", "defense-in-depth"]
see_also = ["architecture", "technologies", "apps"]
acronyms = ["SOC", "AICPA", "TSC", "SSAE", "ISAE", "CPA", "TSP", "CC", "RBAC", "JWT", "MFA", "TLS", "SIEM"]
standards = ["SSAE-18", "ISAE-3402", "TSP-Section-100", "AICPA-Trust-Services-Criteria-2017"]
tools = ["telemetry", "quality-gates", "pre-commit-hooks", "sobelow", "mix-audit"]
platforms = ["beam", "fly-io", "postgresql", "prismatic-platform"]
keywords = ["SOC 2 compliance", "trust services criteria", "security audit framework", "Type 2 report", "continuous compliance monitoring", "AICPA audit", "service organization controls", "SOC 2 readiness"]
tags = ["compliance", "security", "audit", "soc2", "trust-services"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1366
date_modified = "2026-02-23"
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "SOC 2 - Prismatic Platform"
+++

## Definition and Overview

SOC 2 (Service Organization Control Type 2) is an auditing framework developed by the American Institute of Certified Public Accountants (AICPA) that evaluates the design and operational effectiveness of an organization's controls across five trust service criteria: security, availability, processing integrity, confidentiality, and privacy. Unlike SOC 1, which focuses on financial reporting controls, SOC 2 is specifically designed for technology and cloud service providers that process, store, or transmit customer data. The framework is governed by SSAE 18 (Statement on Standards for Attestation Engagements) in the United States and ISAE 3402 internationally.

The distinction between Type 1 and Type 2 is critical. A SOC 2 Type 1 report evaluates whether controls are designed appropriately at a specific point in time -- a snapshot assessment. A SOC 2 Type 2 report evaluates whether those controls operated effectively over a sustained period, typically six to twelve months. Type 2 is significantly more rigorous because it requires evidence of consistent control operation rather than merely documenting that controls exist. Enterprises and regulated industries overwhelmingly require Type 2 reports from their service providers because design alone does not guarantee execution.

SOC 2 has become the de facto trust standard for SaaS and cloud service providers in North America. For European markets, SOC 2 complements [ISO 27001](/glossary/iso-27001/) certification and [GDPR](/glossary/gdpr/) compliance. Organizations subject to [NIS2 Directive](/glossary/nis2/) obligations often find that SOC 2 controls map closely to NIS2 security requirements, creating synergies in compliance programs that address both frameworks simultaneously.

The Prismatic Platform's architecture demonstrates strong alignment with SOC 2 trust service criteria through its quality gates, structured [telemetry](/glossary/telemetry/), [RBAC](/glossary/rbac/) authentication, comprehensive audit logging across all 115 umbrella applications, and the compliance assessment engine within Prismatic Perimeter that includes SOC 2 control mapping alongside NIS2 and [ZKB](/glossary/zkb/) frameworks.

## Historical Context and Industry Adoption

SOC 2 emerged from the evolution of SAS 70 (Statement on Auditing Standards No. 70), which was the dominant service auditor framework from 1992 to 2011. SAS 70 focused primarily on internal controls over financial reporting, making it poorly suited for technology companies whose primary risk was data security rather than financial accuracy. The AICPA introduced SOC 1, SOC 2, and SOC 3 reports in 2011 to address this gap, with SOC 2 specifically targeting technology service organizations.

The Trust Services Criteria (TSC) were updated in 2017 to align with the COSO 2013 framework (Committee of Sponsoring Organizations of the Treadway Commission), creating a more structured and comprehensive control framework. The 2017 update organized controls into Common Criteria (CC) series, with CC1 through CC9 covering control environment, communication, risk assessment, monitoring, logical access, system operations, change management, and additional criteria.

Adoption has accelerated dramatically since 2020, driven by enterprise procurement requirements, cloud migration, and increasing regulatory scrutiny. SOC 2 Type 2 reports are now a baseline expectation for B2B SaaS companies -- customer security questionnaires routinely ask for SOC 2 reports, and procurement departments often block vendor selection without them. This makes SOC 2 readiness a competitive differentiator for platforms like Prismatic.

## Five Trust Service Criteria

SOC 2 evaluates controls across five distinct criteria, each addressing a different dimension of service trustworthiness:

| Criterion | Focus | Key Controls | Prismatic Alignment |
|-----------|-------|-------------|-------------------|
| **Security** (mandatory) | Protection against unauthorized access | Firewalls, encryption, access controls, MFA | [RBAC](/glossary/rbac/), JWT auth, structured logging, Sobelow |
| **Availability** | System uptime and performance | SLAs, disaster recovery, capacity planning | Fly.io deployment, health checks, [OTP](/glossary/otp/) supervision trees |
| **Processing Integrity** | Accurate and complete processing | Input validation, error handling, QA | Quality gates, zero-warning compilation, test coverage |
| **Confidentiality** | Protection of sensitive information | Encryption, access restrictions, data classification | Encryption at rest, role-based access, data isolation |
| **Privacy** | Personal information handling | Consent management, data retention, access rights | [GDPR](/glossary/gdpr/) alignment, data minimization, audit trails |

Security is the only mandatory criterion -- organizations select which additional criteria to include based on their service characteristics and customer requirements. Most technology companies include security and availability at minimum; organizations handling sensitive data add confidentiality and privacy.

## Control Categories and Common Criteria

SOC 2 controls are organized into Common Criteria (CC) series that map to organizational processes:

```elixir
defmodule PrismaticPerimeter.Compliance.SOC2 do
  @moduledoc """
  SOC 2 compliance assessment engine.
  Maps platform controls to SOC 2 trust service criteria.
  Provides continuous monitoring and evidence collection
  for audit readiness.
  """

  @type control_category :: %{
    id: String.t(),
    criterion: trust_criterion(),
    cc_series: String.t(),
    description: String.t(),
    control_type: :preventive | :detective | :corrective,
    evidence_sources: [atom()],
    assessment: :compliant | :partial | :non_compliant | :not_assessed,
    last_assessed: DateTime.t() | nil
  }

  @type trust_criterion :: :security | :availability | :processing_integrity
                        | :confidentiality | :privacy

  @type assessment_result :: %{
    overall: :compliant | :partial | :non_compliant,
    by_criterion: %{trust_criterion() => float()},
    controls: [control_category()],
    evidence_count: non_neg_integer(),
    assessed_at: DateTime.t(),
    next_assessment: DateTime.t()
  }

  @controls [
    # CC6: Logical and Physical Access Controls
    %{id: "CC6.1", criterion: :security, cc_series: "CC6",
      description: "Logical and physical access controls",
      control_type: :preventive,
      evidence_sources: [:rbac_config, :auth_logs, :session_management]},

    %{id: "CC6.2", criterion: :security, cc_series: "CC6",
      description: "User authentication and authorization",
      control_type: :preventive,
      evidence_sources: [:jwt_implementation, :api_auth_plugs, :role_definitions]},

    %{id: "CC6.3", criterion: :security, cc_series: "CC6",
      description: "Encryption of data in transit and at rest",
      control_type: :preventive,
      evidence_sources: [:tls_config, :database_encryption, :certificate_management]},

    # CC7: System Operations
    %{id: "CC7.1", criterion: :security, cc_series: "CC7",
      description: "Security event monitoring and alerting",
      control_type: :detective,
      evidence_sources: [:telemetry_events, :siem_integration, :alert_configuration]},

    %{id: "CC7.2", criterion: :security, cc_series: "CC7",
      description: "System operations monitoring",
      control_type: :detective,
      evidence_sources: [:health_checks, :supervision_tree, :seadf_healing]},

    %{id: "CC7.3", criterion: :security, cc_series: "CC7",
      description: "Incident detection and response",
      control_type: :detective,
      evidence_sources: [:color_team_records, :incident_logs, :escalation_records]},

    # CC8: Change Management
    %{id: "CC8.1", criterion: :processing_integrity, cc_series: "CC8",
      description: "Change management and quality assurance",
      control_type: :preventive,
      evidence_sources: [:quality_gates, :pre_commit_hooks, :ci_pipeline, :git_history]},

    # A1: Availability Controls
    %{id: "A1.1", criterion: :availability, cc_series: "A1",
      description: "System capacity planning and monitoring",
      control_type: :preventive,
      evidence_sources: [:fly_io_config, :resource_limits, :scaling_policies]},

    %{id: "A1.2", criterion: :availability, cc_series: "A1",
      description: "Disaster recovery and backup procedures",
      control_type: :corrective,
      evidence_sources: [:backup_config, :recovery_procedures, :failover_testing]},

    # PI1: Processing Integrity Controls
    %{id: "PI1.1", criterion: :processing_integrity, cc_series: "PI1",
      description: "Input validation and error handling",
      control_type: :preventive,
      evidence_sources: [:quality_gates, :typespec_coverage, :validation_modules]},

    %{id: "PI1.2", criterion: :processing_integrity, cc_series: "PI1",
      description: "Quality assurance and testing",
      control_type: :detective,
      evidence_sources: [:test_coverage, :regression_tests, :quality_dna]}
  ]

  @spec assess_compliance() :: assessment_result()
  def assess_compliance do
    assessed_controls = Enum.map(@controls, &assess_control/1)

    %{
      overall: calculate_overall_status(assessed_controls),
      by_criterion: calculate_criterion_scores(assessed_controls),
      controls: assessed_controls,
      evidence_count: count_evidence(assessed_controls),
      assessed_at: DateTime.utc_now(),
      next_assessment: DateTime.add(DateTime.utc_now(), 24 * 3600, :second)
    }
  end

  defp assess_control(control) do
    evidence = collect_evidence(control.evidence_sources)

    assessment = cond do
      all_evidence_present?(evidence) -> :compliant
      some_evidence_present?(evidence) -> :partial
      true -> :non_compliant
    end

    Map.merge(control, %{assessment: assessment, last_assessed: DateTime.utc_now()})
  end
end
```

## Audit Evidence Collection

SOC 2 Type 2 requires continuous evidence collection over the audit window. The Prismatic Platform automates this through [telemetry](/glossary/telemetry/)-driven evidence capture:

```elixir
defmodule PrismaticPerimeter.Compliance.SOC2.EvidenceCollector do
  @moduledoc """
  Collects and stores audit evidence for SOC 2 Type 2 reporting.
  Evidence must span the full audit window (typically 6-12 months).
  Automated collection eliminates manual evidence gathering gaps.
  """

  @type evidence_record :: %{
    control_id: String.t(),
    evidence_type: :configuration | :log | :policy | :test_result | :metric,
    content: term(),
    collected_at: DateTime.t(),
    retention_until: DateTime.t(),
    hash: String.t()
  }

  @spec collect_security_evidence() :: {:ok, [evidence_record()]} | {:error, term()}
  def collect_security_evidence do
    evidence = [
      collect_auth_logs(),
      collect_rbac_configuration(),
      collect_encryption_status(),
      collect_vulnerability_scan_results(),
      collect_incident_response_logs(),
      collect_access_review_records()
    ]
    |> List.flatten()
    |> Enum.map(&sign_evidence/1)

    {:ok, evidence}
  end

  @spec collect_processing_integrity_evidence() :: {:ok, [evidence_record()]} | {:error, term()}
  def collect_processing_integrity_evidence do
    evidence = [
      collect_quality_gate_results(),
      collect_test_coverage_reports(),
      collect_deployment_logs(),
      collect_change_management_records(),
      collect_code_review_records()
    ]
    |> List.flatten()
    |> Enum.map(&sign_evidence/1)

    {:ok, evidence}
  end

  defp collect_quality_gate_results do
    %{
      control_id: "PI1.2",
      evidence_type: :test_result,
      content: %{
        quality_score: 100,
        domains_passing: 13,
        domains_total: 13,
        qdp_count: 0,
        test_count: 5883,
        warnings_count: 0,
        dialyzer_violations: 0,
        credo_violations: 0
      },
      collected_at: DateTime.utc_now(),
      retention_until: DateTime.add(DateTime.utc_now(), 365 * 2, :day),
      hash: ""
    }
  end

  defp sign_evidence(evidence) do
    content_binary = :erlang.term_to_binary(evidence.content)
    hash = Base.encode16(:crypto.hash(:sha256, content_binary), case: :lower)
    %{evidence | hash: hash}
  end
end
```

## Prismatic Platform SOC 2 Alignment

The platform's existing architecture provides substantial SOC 2 coverage through its enforced quality practices:

| SOC 2 Requirement | CC ID | Prismatic Implementation | Evidence Source |
|-------------------|-------|------------------------|----------------|
| Access Control | CC6.1 | [RBAC](/glossary/rbac/) with role definitions | `prismatic_web` auth plugs |
| Authentication | CC6.2 | JWT with token refresh | API authentication module |
| Encryption | CC6.3 | TLS 1.3 + PostgreSQL encryption | Fly.io TLS, database config |
| Monitoring | CC7.1 | [Telemetry](/glossary/telemetry/) across 115 apps | Telemetry event streams |
| System Operations | CC7.2 | [OTP](/glossary/otp/) supervision trees + [self-healing](/glossary/self-healing/) | SEADF healing records |
| Incident Response | CC7.3 | [Color Team](/glossary/color-teams/) security operations | [Purple Team](/glossary/purple-team/) closure records |
| Change Management | CC8.1 | 11-phase pre-commit + quality gates | Git hooks, CI pipeline logs |
| Risk Assessment | CC3.2 | [Security ratings](/glossary/security-rating/) + [EASM](/glossary/easm/) | Prismatic Perimeter assessments |
| Vendor Management | CC9.2 | Dependency auditing | `mix deps.audit` results |

## Continuous Compliance Monitoring

Rather than preparing for SOC 2 audits as periodic events, the platform implements continuous compliance monitoring through a dedicated [GenServer](/glossary/genserver/):

```elixir
defmodule PrismaticPerimeter.Compliance.ContinuousMonitor do
  @moduledoc """
  Continuously monitors SOC 2 control effectiveness.
  Detects control degradation before audit periods.
  Emits telemetry events for dashboard visualization
  and alerting on compliance drift.
  """

  use GenServer

  @check_interval :timer.hours(24)

  @type state :: %{
    last_assessment: PrismaticPerimeter.Compliance.SOC2.assessment_result() | nil,
    trend: :improving | :stable | :degrading,
    consecutive_degradations: non_neg_integer(),
    history: [map()]
  }

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{last_assessment: nil, trend: :stable, consecutive_degradations: 0, history: []}}
  end

  @impl true
  def handle_info(:daily_check, state) do
    assessment = PrismaticPerimeter.Compliance.SOC2.assess_compliance()
    new_trend = assess_trend(state, assessment)

    if degraded?(state.last_assessment, assessment) do
      :telemetry.execute(
        [:prismatic, :compliance, :soc2, :degradation],
        %{severity: degradation_severity(state.consecutive_degradations + 1)},
        %{from: state.last_assessment, to: assessment, trend: new_trend}
      )
    end

    schedule_check()

    {:noreply, %{
      last_assessment: assessment,
      trend: new_trend,
      consecutive_degradations: count_consecutive(state, assessment),
      history: Enum.take([assessment | state.history], 365)
    }}
  end

  defp schedule_check, do: Process.send_after(self(), :daily_check, @check_interval)

  defp degradation_severity(count) when count >= 5, do: :critical
  defp degradation_severity(count) when count >= 3, do: :high
  defp degradation_severity(_), do: :medium
end
```

## SOC 2 Report Generation

```elixir
defmodule PrismaticPerimeter.Compliance.SOC2.ReportGenerator do
  @moduledoc """
  Generates SOC 2 assessment reports in formats suitable for
  auditor review and customer distribution. Reports include
  control assessments, evidence summaries, and exception details.
  """

  @type report :: %{
    organization: String.t(),
    report_type: String.t(),
    period: {Date.t(), Date.t()},
    criteria_assessed: [atom()],
    overall_opinion: atom(),
    control_results: [map()],
    evidence_summary: map(),
    exceptions: [map()],
    management_response: map()
  }

  @spec generate_report(keyword()) :: {:ok, String.t()} | {:error, term()}
  def generate_report(opts \\ []) do
    assessment = PrismaticPerimeter.Compliance.SOC2.assess_compliance()
    period = Keyword.get(opts, :period, last_12_months())
    evidence = collect_period_evidence(period)

    report = %{
      organization: "Prismatic Platform",
      report_type: "SOC 2 Type 2",
      period: period,
      criteria_assessed: [:security, :availability, :processing_integrity],
      overall_opinion: assessment.overall,
      control_results: assessment.controls,
      evidence_summary: summarize_evidence(evidence),
      exceptions: find_exceptions(assessment),
      management_response: generate_management_response(assessment)
    }

    {:ok, format_report(report, Keyword.get(opts, :format, :html))}
  end
end
```

## Comparison with Other Compliance Frameworks

| Framework | Origin | Focus | Mandatory Criteria | Audit Type | Prismatic Support |
|-----------|--------|-------|-------------------|------------|-------------------|
| **SOC 2** | AICPA (US) | Technology service providers | Security only | CPA firm attestation | Full assessment engine |
| **[ISO 27001](/glossary/iso-27001/)** | ISO (International) | Information security management | All Annex A controls | Certification body audit | Control mapping |
| **[NIS2](/glossary/nis2/)** | EU | Critical infrastructure cybersecurity | All requirements for in-scope | Regulatory enforcement | Compliance assessment |
| **[GDPR](/glossary/gdpr/)** | EU | Personal data protection | All applicable articles | Supervisory authority | Privacy controls |
| **[ZKB](/glossary/zkb/)** | Czech Republic | Cybersecurity regulation | All applicable measures | National authority | Compliance dashboard |
| **PCI DSS** | PCI SSC | Payment card data | All applicable requirements | QSA assessment | Control mapping |
| **HIPAA** | US HHS | Health information | All applicable standards | Self-assessment + audit | Not implemented |

## Dashboard Access

The compliance dashboard at `/perimeter/compliance` provides real-time SOC 2 posture visualization alongside [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) assessments. The dashboard displays:

- Overall compliance status per trust criterion (percentage score)
- Individual control assessment status with drill-down
- Evidence collection timeline showing gaps
- Trend analysis over the audit window
- Exception tracking with management response status
- Cross-framework mapping (SOC 2 controls mapped to NIS2/ZKB requirements)

## Best Practices

1. **Implement controls before the audit window begins**. SOC 2 Type 2 requires controls to operate effectively throughout the entire audit period. Last-minute implementations are visible to auditors as gaps in the evidence timeline.

2. **Automate evidence collection continuously**. Manual evidence gathering is error-prone and time-consuming. The Prismatic Platform's [telemetry](/glossary/telemetry/) system provides automated evidence collection for all technical controls.

3. **Map controls to multiple criteria**. A single control like [RBAC](/glossary/rbac/) addresses security, confidentiality, and privacy criteria simultaneously. Document these mappings to demonstrate comprehensive coverage efficiently.

4. **Monitor control effectiveness, not just existence**. A firewall rule that exists but is not enforced provides no security. Continuous monitoring verifies that controls are operating as designed.

5. **Align SOC 2 with other compliance frameworks**. [NIS2](/glossary/nis2/), [ISO 27001](/glossary/iso-27001/), and SOC 2 share many requirements. Unified compliance programs reduce duplication and cost. The Prismatic Platform's compliance engine maps controls across all three frameworks.

6. **Engage engineering early**. SOC 2 controls map directly to technical implementations. Compliance programs designed without engineering input produce controls that do not reflect actual system behavior.

## Common Pitfalls

- **Treating SOC 2 as a checkbox exercise**: SOC 2 evaluates whether controls actually work, not whether documentation exists. Paper compliance without operational effectiveness fails Type 2 audits.

- **Ignoring the audit window**: Evidence gaps during the audit period create exceptions in the final report. Continuous monitoring prevents gaps from forming.

- **Selecting only the security criterion**: While security is the only mandatory criterion, customers increasingly expect availability and processing integrity coverage. Omitting these criteria may raise questions during customer due diligence.

- **Not involving engineering in compliance**: SOC 2 controls map to technical implementations. Compliance teams without engineering involvement produce controls that do not reflect actual system behavior.

- **Overscoping the first audit**: Start with security and one additional criterion. Add more criteria in subsequent audit cycles as control maturity improves.

## Related Concepts

- [NIS2 Directive](/glossary/nis2/) - EU cybersecurity directive with overlapping requirements
- [ISO 27001](/glossary/iso-27001/) - International security management standard
- [GDPR](/glossary/gdpr/) - Privacy regulation addressing the privacy trust criterion
- [RBAC](/glossary/rbac/) - Access control implementing security criteria
- [Compliance Framework](/glossary/compliance-framework/) - Broader category of audit frameworks
- [ZKB](/glossary/zkb/) - Czech cybersecurity regulation complementing SOC 2
- [Security Rating](/glossary/security-rating/) - Quantified assessment incorporating compliance posture
- [EASM](/glossary/easm/) - External attack surface management informing risk assessment
- [Telemetry](/glossary/telemetry/) - Instrumentation providing automated evidence collection
- [Color Teams](/glossary/color-teams/) - Security operations supporting incident response controls

## See Also

- [Architecture](/architecture/) - Platform architecture overview
- [Technologies](/technologies/) - Technology stack details
- [Apps](/apps/) - Application directory including Prismatic Perimeter

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
