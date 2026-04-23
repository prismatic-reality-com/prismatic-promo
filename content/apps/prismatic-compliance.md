+++
title = "Prismatic Compliance"
weight = 18
[extra]
icon = "clipboard-check"
color = "blue"
description = "NIS2, GDPR, and ZKB compliance assessment with automated evidence collection"
category = "Compliance"
files = "380"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1106
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Compliance", "NIS2", "GDPR", "apps", "Prismatic Platform", "Evidence", "PrismaticCompliance"]
tags = ["apps", "compliance", "prismatic-compliance", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Compliance - Prismatic Platform"
+++

## Abstract

Prismatic Compliance provides automated compliance assessment against major European regulatory frameworks: the [NIS2](/glossary/nis2/) Directive (EU 2022/2555), [GDPR](/glossary/gdpr/) (EU 2016/679), and the Czech [ZKB](/glossary/zkb/) (Zakon o kyberneticke bezpecnosti, 264/2025 Sb.). The system evaluates organizations against 100+ regulatory controls across these frameworks, collecting evidence automatically from platform intelligence sources -- [OSINT](/glossary/osint/) scans, [security rating](/glossary/security-rating/)s, audit logs, and configuration assessments -- and generating compliance reports with gap analysis, remediation tracking, and deadline management. Compliance assessment results integrate directly into [Prismatic Perimeter](/apps/prismatic-perimeter/) security ratings, ensuring that compliance gaps influence security scores. The architecture separates framework definitions (control catalogs with requirement mappings), assessment engines (individual control evaluation with scoring), evidence collection (automated gathering from 15+ platform sources), and reporting (PDF, HTML, and JSON output with remediation recommendations).

## 1. Introduction

### 1.1 Problem Statement

European organizations face overlapping regulatory requirements from NIS2, GDPR, and national implementations like the Czech ZKB. Compliance assessment traditionally involves manual audits, spreadsheet-based evidence tracking, and consultant-dependent gap analysis. This approach is expensive, infrequent, and often outdated by the time reports are delivered. For a security intelligence platform that continuously monitors organizations, compliance assessment can be automated by mapping security findings to regulatory controls.

Prismatic Compliance closes this gap by continuously evaluating compliance posture using the same intelligence data that drives security ratings, producing always-current compliance assessments with evidence traced to their sources.

### 1.2 Design Goals

1. **Multi-framework support** -- NIS2, ZKB, and GDPR assessed through a unified engine with framework-specific control catalogs.
2. **Automated evidence collection** -- evidence gathered from OSINT scans, security assessments, audit logs, and configuration data without manual intervention.
3. **Continuous assessment** -- compliance posture updated in real time as new intelligence becomes available.
4. **Evidence provenance** -- every assessment is traceable to specific evidence sources with collection timestamps.
5. **Remediation tracking** -- gap analysis with prioritized remediation items, progress tracking, and deadline management.
6. **Report generation** -- compliance reports in PDF, HTML, and JSON formats for different stakeholder audiences.

### 1.3 Scope

Prismatic Compliance covers compliance assessment and reporting. It does not implement the security controls themselves (which are assessed through platform intelligence) or provide legal advice on regulatory interpretation.

## 2. Architecture

### 2.1 System Design

```
Intelligence Sources
  (OSINT, Security Scans, Audit Logs, Config)
       |
  Evidence Collector (automated gathering)
       |
  +----+----+----+----+
  |    |    |    |    |
  NIS2   ZKB   GDPR  Custom
  Engine Engine Engine Engine
       |
  Control Assessment (per-control scoring)
       |
  Gap Analysis (non-compliant controls identified)
       |
  +----+----+
  |         |
  Reports   Remediation Tracker
  (PDF/HTML/JSON) (prioritized items)
       |
  Perimeter Security Rating Integration
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticCompliance` | Public facade: `assess/3`, `collect_evidence/2`, `generate_report/2`, `remediation_progress/2` |
| `PrismaticCompliance.Frameworks.NIS2` | NIS2 Directive control catalog (42 controls across Article 21) |
| `PrismaticCompliance.Frameworks.ZKB` | Czech ZKB control catalog (38 Czech-specific controls) |
| `PrismaticCompliance.Frameworks.GDPR` | GDPR article catalog (24 key articles) |
| `PrismaticCompliance.Assessment.ControlEngine` | Individual control assessment with evidence evaluation |
| `PrismaticCompliance.Assessment.Scorer` | Scoring and aggregation across controls |
| `PrismaticCompliance.Assessment.GapAnalysis` | Compliance gap identification and prioritization |
| `PrismaticCompliance.Evidence.Collector` | Automated evidence gathering from platform sources |
| `PrismaticCompliance.Evidence.Validator` | Evidence quality and completeness verification |
| `PrismaticCompliance.Reporting.Generator` | Report generation in multiple formats |
| `PrismaticCompliance.Remediation.Tracker` | Remediation item lifecycle and progress tracking |

### 2.3 Process Topology

```
PrismaticCompliance.Application (Supervisor, :one_for_one)
+-- PrismaticCompliance.Evidence.Collector (GenServer)
|     Scheduled evidence collection from platform sources
+-- PrismaticCompliance.Remediation.Tracker (GenServer)
|     Remediation item tracking and deadline monitoring
+-- Task.Supervisor
      Parallel assessment execution
```

### 2.4 Data Flow

Evidence is collected from platform intelligence sources (OSINT scan results, security ratings, audit logs, configuration data). The ControlEngine evaluates each control against available evidence, producing per-control compliance status (compliant, partially_compliant, non_compliant). The Scorer aggregates control results into framework-level scores. GapAnalysis identifies non-compliant controls and generates prioritized remediation items. Reports are generated from assessment results with evidence references.

## 3. Implementation

### 3.1 Key Algorithms

**Control Assessment**. Each control in the catalog defines required evidence types and assessment criteria. The ControlEngine evaluates whether collected evidence satisfies the criteria, producing a compliance status and confidence score. Controls with insufficient evidence are marked as `unassessable` rather than non-compliant.

**Framework Scoring**. Framework-level scores are computed as weighted averages of control scores, with weights reflecting control criticality. Critical controls (incident handling, access control) carry higher weights than administrative controls.

### 3.2 Data Structures

```elixir
defmodule PrismaticCompliance.Assessment do
  @type t :: %__MODULE__{
    framework: atom(),
    target: String.t(),
    overall_score: 0..100,
    status: :compliant | :partially_compliant | :non_compliant,
    controls: %{String.t() => ControlResult.t()},
    evidence: [Evidence.t()],
    remediation_items: [RemediationItem.t()],
    assessed_at: DateTime.t()
  }
end
```

### 3.3 API Surface

```elixir
# Assess compliance
@spec assess(atom(), String.t(), keyword()) :: {:ok, Assessment.t()} | {:error, term()}
PrismaticCompliance.assess(:nis2, "example.com", entity_type: :essential)

# Collect evidence
@spec collect_evidence(atom(), String.t()) :: {:ok, [Evidence.t()]}
PrismaticCompliance.collect_evidence(:nis2, "example.com")

# Generate report
@spec generate_report(String.t(), keyword()) :: {:ok, Report.t()}
PrismaticCompliance.generate_report("example.com",
  frameworks: [:nis2, :zkb, :gdpr], format: :pdf)

# Track remediation
@spec remediation_progress(String.t(), atom()) :: {:ok, Progress.t()}
PrismaticCompliance.remediation_progress("example.com", :nis2)
```

### 3.4 Configuration

```elixir
config :prismatic_compliance,
  frameworks: [:nis2, :zkb, :gdpr],
  evidence_collection_interval: :timer.hours(24),
  assessment_cache_ttl: :timer.hours(6),
  report_formats: [:pdf, :html, :json],
  remediation_reminder_days: [30, 14, 7, 1]
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Security ratings for compliance evidence |
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | OSINT data for technical control evidence |
| [Prismatic Auth](/apps/prismatic-auth/) | Audit log data for access control evidence |
| [Prismatic Audit](/apps/prismatic-audit/) | [Audit trail](/glossary/audit-trail/) for compliance reporting |
| [Prismatic Storage](/apps/prismatic-storage/) | Evidence and assessment persistence |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Compliance results in security ratings |
| [Prismatic CER](/apps/prismatic-cer/) | Evidence repository integration |
| [Prismatic Web](/apps/prismatic-web/) | Compliance dashboard data |

### 4.3 Inter-Process Communication

Evidence collection runs as scheduled tasks. Assessment execution is parallelized via Task.[Supervisor](/glossary/supervisor/). Results are published via [PubSub](/glossary/pubsub/) for dashboard updates.

### 4.4 External Integrations

No external compliance services. All framework definitions and assessment logic are implemented locally.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single control assessment | 10-50ms | Evidence evaluation |
| Full NIS2 assessment (42 controls) | 500ms-2s | Parallel control evaluation |
| Evidence collection (15 sources) | 2-10s | Parallel source queries |
| Report generation (PDF) | 1-5s | Template rendering |

### 5.2 Scalability

Control assessments are independent and parallelize linearly. Evidence collection parallelizes across sources.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 256 MB | 512 MB |
| CPU | 2 cores | 4 cores |

## 6. Testing Strategy

### 6.1 Unit Tests

Control assessment tests verify correct evaluation for known evidence combinations. Framework scoring tests verify weighted aggregation. Gap analysis tests verify correct identification of non-compliant controls.

### 6.2 Integration Tests

End-to-end tests exercise the full assessment pipeline from evidence collection through control evaluation to report generation.

### 6.3 Property-Based Testing

StreamData generators produce random evidence sets to verify that assessment scores are always within 0-100 and that compliance status is consistent with control results.

## 7. Security Considerations

### 7.1 Threat Model

Manipulated evidence could produce false compliance assessments. Mitigations include evidence provenance tracking, multi-source evidence requirements, and assessment audit trails.

### 7.2 Access Control

Compliance assessment requires `compliance_read` permission. Report generation requires `report_create` permission.

## 8. Operational Considerations

### 8.1 Deployment

Deploys as part of the umbrella [release](/glossary/release/). Framework definitions are bundled with the application.

### 8.2 Monitoring

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :compliance, :assessed]`, `[:prismatic, :compliance, :evidence_collected]`, `[:prismatic, :compliance, :report_generated]`.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Low compliance scores | Insufficient evidence | Run evidence collection; check OSINT source health |
| Unassessable controls | Missing evidence types | Enable additional evidence sources |
| Report generation slow | Large evidence set | Increase report generation timeout |
| Stale assessments | Collection not running | Verify Collector [GenServer](/glossary/genserver/) health |

## 9. Future Work

Planned enhancements include [ISO 27001](/glossary/iso-27001/) framework support, automated regulatory change tracking with impact analysis, compliance benchmarking against industry peers, and integration with external GRC platforms.

## References

- [NIS2 Directive](https://eur-lex.europa.eu/eli/dir/2022/2555) -- EU cybersecurity directive
- [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679) -- General Data Protection Regulation
- [ZKB 264/2025 Sb.](https://www.zakonyprolidi.cz/cs/2025-264) -- Czech Cybersecurity Act
- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- Security rating integration
- [Prismatic CER](/apps/prismatic-cer/) -- Evidence repository

## Related Agents

- [CER Compliance Commander](/agents/cer-compliance-commander/) -- Commands compliance evidence collection and assessment workflows across NIS2, GDPR, and ZKB regulatory frameworks
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Enforces evidence quality, completeness, and provenance requirements for regulatory compliance assessments
- [GitLab Security Specialist Agent](/agents/gitlab-security-specialist-agent/) -- Reviews compliance assessment implementation for security and accuracy of regulatory control mappings

## Related Capabilities

- [NABLA Axioms](/capabilities/nabla-axioms/) -- Signal plurality and provenance mandatory axioms ensure compliance assessments are backed by multiple independent evidence sources
- [Trinity Gate](/capabilities/trinity-gate/) -- Three-layer verification ensures compliance conclusions pass structural, logical, and formal consistency checks
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Synthesizes evidence from 15+ platform sources into unified compliance posture assessments across frameworks

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)