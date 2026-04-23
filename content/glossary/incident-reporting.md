+++
title = "Incident Reporting"
description = "NIS2-mandated notification process requiring organizations to report significant cybersecurity incidents to national authorities within strict timeframes (24h early warning, 72h full notification)."
weight = 50

[extra]
category = "compliance"
tags = ["incident-reporting", "nis2", "compliance", "notification", "csirt", "regulation", "eu", "cybersecurity", "mandatory", "timeline"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["compliance-officers", "security-engineers", "ciso", "architects", "legal"]
related_terms = ["csirt", "nis2", "compliance", "immutable-log", "event-log", "gap-analysis"]
key_concepts = ["early-warning", "full-notification", "intermediate-report", "final-report", "significant-incident"]
platforms = ["prismatic-perimeter", "prismatic-platform", "beam"]
prerequisites = ["nis2-basics", "incident-management", "compliance-frameworks"]
use_cases = ["regulatory-compliance", "incident-management", "csirt-coordination", "audit-readiness"]
complexity = "medium"
stability = "evolving"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["Incident Reporting", "NIS2", "compliance", "notification", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Incident Reporting - Prismatic Platform"
+++

## Definition and Overview

Incident reporting is the mandatory process of notifying designated national authorities and, in some cases, affected parties about significant cybersecurity incidents. Under the EU NIS2 Directive (Directive (EU) 2022/2555), essential and important entities must follow a structured multi-stage reporting timeline: an early warning within 24 hours of becoming aware of the incident, a full incident notification within 72 hours, an intermediate report upon request, and a final report within one month of the full notification.

The NIS2 Directive significantly expanded the scope and stringency of incident reporting requirements compared to the original NIS Directive (2016). The number of sectors covered increased from 7 to 18, penalties for non-compliance can reach 10 million EUR or 2% of global turnover, and the definition of a "significant incident" is broader. Organizations must have pre-established reporting procedures, trained personnel, and automated detection capabilities to meet these tight timelines.

Incident reporting is not merely a compliance checkbox -- it serves a critical function in national and European cybersecurity defense. Timely reporting enables national CSIRTs to detect emerging threats, coordinate cross-border responses, issue advisories to other organizations, and build a comprehensive picture of the threat landscape. The multi-stage approach balances the need for rapid initial notification (even with incomplete information) against the need for thorough final reporting (with root cause analysis and remediation details).

## Technical Deep Dive

### NIS2 Reporting Timeline

| Stage | Deadline | Content Requirements | Recipient |
|-------|----------|---------------------|-----------|
| **Early Warning** | 24 hours | Incident suspected/confirmed, initial classification, cross-border impact assessment | National CSIRT or competent authority |
| **Full Notification** | 72 hours | Severity assessment, impact scope, initial IoCs, affected systems/services | National CSIRT or competent authority |
| **Intermediate Report** | Upon request | Status update, evolving assessment, additional IoCs | National CSIRT or competent authority |
| **Final Report** | 1 month | Root cause, detailed impact, remediation actions, lessons learned | National CSIRT or competent authority |
| **Progress Report** | 1 month (ongoing) | Update if incident still active | National CSIRT or competent authority |

### Significant Incident Criteria (Article 23)

An incident is considered "significant" if it:

| Criterion | Threshold | Example |
|-----------|-----------|---------|
| **Service disruption** | Causes or is capable of causing severe operational disruption | 4+ hours critical service outage |
| **Financial impact** | Causes or is capable of causing significant financial losses | > EUR 500K estimated damage |
| **Affected parties** | Affects or is capable of affecting other persons by causing considerable damage | > 10,000 users impacted |
| **Data compromise** | Results in unauthorized access to sensitive data | Personal data or trade secrets exfiltrated |

### Reporting Content Requirements

| Report Stage | Required Fields | Optional Fields |
|-------------|----------------|----------------|
| **Early Warning** | Incident type, detection time, suspected impact, cross-border indicator | Initial IoCs, suspected threat actor |
| **Full Notification** | Severity classification, affected services, user impact, geographic scope, initial IoCs | Attack vector, malware family, C2 infrastructure |
| **Final Report** | Root cause analysis, total impact assessment, remediation timeline, prevention measures, lessons learned | Threat actor attribution, related incidents, updated IoCs |

### Czech Implementation (ZKB 264/2025 Sb.)

The Czech Republic implements NIS2 through the ZKB (Zakon o kyberneticke bezpecnosti) framework, which includes additional national requirements:

| Czech Requirement | Description |
|-------------------|-------------|
| **NUKIB notification** | Reports submitted to NUKIB (National Cyber and Information Security Agency) |
| **Czech language** | Reports in Czech or English (as agreed with NUKIB) |
| **Technical format** | Structured reporting through NUKIB's incident reporting portal |
| **Sector-specific** | Additional requirements for critical infrastructure operators |

## Architecture and Implementation

Automated incident reporting architecture consists of four components: detection (identifying when an incident meets reporting thresholds), classification (categorizing the incident and determining reporting obligations), reporting (generating and submitting structured reports), and tracking (monitoring compliance with reporting timelines and managing the multi-stage workflow).

The detection component integrates with the platform's monitoring and alerting systems. When thresholds are exceeded (service disruption duration, affected user count, data access anomalies), an automated assessment determines whether the event meets "significant incident" criteria. This assessment considers both quantitative thresholds and qualitative factors.

The classification component applies decision trees based on NIS2 Article 23 criteria and national implementing legislation. Different incident types (data breach, ransomware, DDoS, insider threat) follow different classification paths with different reporting requirements. The classification also determines the appropriate national authority (CSIRT, data protection authority, sector-specific regulator).

## Usage in Prismatic Platform

The Prismatic Perimeter module includes automated incident reporting workflows for NIS2 and ZKB compliance.

```elixir
defmodule PrismaticPerimeter.IncidentReporting do
  @moduledoc """
  NIS2/ZKB-compliant incident reporting workflow.
  Manages the multi-stage reporting timeline and
  generates structured reports for national authorities.
  """

  @type report_stage :: :early_warning | :full_notification | :intermediate | :final | :progress
  @type severity :: :critical | :high | :medium | :low

  @type incident_report :: %{
    incident_id: String.t(),
    stage: report_stage(),
    severity: severity(),
    incident_type: String.t(),
    detection_time: DateTime.t(),
    reporting_deadline: DateTime.t(),
    affected_services: list(String.t()),
    affected_users: non_neg_integer(),
    cross_border: boolean(),
    description: String.t(),
    indicators: list(map()),
    submitted_at: DateTime.t() | nil
  }

  @spec create_incident(map()) :: {:ok, incident_report()} | {:error, term()}
  def create_incident(params) do
    detection_time = DateTime.utc_now()

    report = %{
      incident_id: generate_incident_id(),
      stage: :early_warning,
      severity: classify_severity(params),
      incident_type: Map.fetch!(params, :type),
      detection_time: detection_time,
      reporting_deadline: DateTime.add(detection_time, 24 * 3600, :second),
      affected_services: Map.get(params, :services, []),
      affected_users: Map.get(params, :user_count, 0),
      cross_border: Map.get(params, :cross_border, false),
      description: Map.get(params, :description, ""),
      indicators: Map.get(params, :indicators, []),
      submitted_at: nil
    }

    schedule_deadline_reminders(report)
    log_to_immutable_audit(report)

    {:ok, report}
  end

  @spec advance_stage(incident_report()) :: {:ok, incident_report()} | {:error, term()}
  def advance_stage(%{stage: :early_warning} = report) do
    updated = %{report |
      stage: :full_notification,
      reporting_deadline: DateTime.add(report.detection_time, 72 * 3600, :second)
    }

    {:ok, updated}
  end

  def advance_stage(%{stage: :full_notification} = report) do
    updated = %{report |
      stage: :final,
      reporting_deadline: DateTime.add(report.detection_time, 30 * 24 * 3600, :second)
    }

    {:ok, updated}
  end

  @spec is_significant?(map()) :: boolean()
  def is_significant?(incident_params) do
    duration_hours = Map.get(incident_params, :disruption_hours, 0)
    affected_users = Map.get(incident_params, :affected_users, 0)
    financial_impact = Map.get(incident_params, :financial_impact_eur, 0)
    data_compromised = Map.get(incident_params, :data_compromised, false)

    duration_hours >= 4 or
      affected_users >= 10_000 or
      financial_impact >= 500_000 or
      data_compromised
  end

  @spec time_remaining(incident_report()) :: {:ok, integer()} | {:expired, integer()}
  def time_remaining(report) do
    remaining = DateTime.diff(report.reporting_deadline, DateTime.utc_now(), :second)
    if remaining > 0, do: {:ok, remaining}, else: {:expired, abs(remaining)}
  end

  defp classify_severity(%{affected_users: users}) when users >= 100_000, do: :critical
  defp classify_severity(%{data_compromised: true}), do: :critical
  defp classify_severity(%{affected_users: users}) when users >= 10_000, do: :high
  defp classify_severity(%{disruption_hours: hours}) when hours >= 4, do: :high
  defp classify_severity(_), do: :medium

  defp generate_incident_id do
    date = Date.utc_today() |> Date.to_iso8601() |> String.replace("-", "")
    random = :crypto.strong_rand_bytes(4) |> Base.encode16(case: :lower)
    "NIS2-#{date}-#{random}"
  end

  defp schedule_deadline_reminders(_report), do: :ok
  defp log_to_immutable_audit(_report), do: :ok
end
```

The Perimeter dashboard at `/perimeter/compliance` provides a real-time view of active incidents, reporting deadlines, and compliance status. Automated deadline reminders alert security teams when reporting windows are approaching, and the immutable log records all reporting activities for audit evidence.

## Cross-References

- [CSIRT](/glossary/csirt/) -- Teams receiving and processing incident reports
- [NIS2](/glossary/nis2/) -- EU directive mandating incident reporting
- [Immutable Log](/glossary/immutable-log/) -- Audit trail recording report submissions
- [Gap Analysis](/glossary/gap-analysis/) -- Assessing incident reporting readiness
- [Event Log](/glossary/event-log/) -- Event data supporting incident reports
- **Livebooks**: `security_compliance/` notebooks include incident reporting workflows
- **Academy**: ComplianceAutomationFramework topic covers reporting automation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
