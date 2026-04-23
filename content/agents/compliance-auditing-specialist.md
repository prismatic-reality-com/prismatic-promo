+++
title = "compliance-auditing-specialist"
weight = 91
[extra]
domain = "infrastructure"
level = "L3"
description = "Regulatory compliance validation and audit preparation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.1.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["compliance-auditing-specialist", "Regulatory", "agents", "agent", "Prismatic Platform", "Compliance Auditing", "Specialist", "GDPR"]
tags = ["agents", "agent", "compliance-auditing-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "compliance-auditing-specialist - Prismatic Platform"
+++

## Overview

The Compliance Auditing Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent ensures continuous regulatory compliance through automated validation, evidence collection, and audit preparation across all applicable regulatory frameworks. It transforms compliance from a periodic manual exercise into a continuous automated process where the platform's compliance posture is verifiable at any moment, producing evidence-grade audit packages with cryptographic integrity guarantees.

Organizations operating in the European regulatory landscape face overlapping requirements from [NIS2](/glossary/nis2/), [GDPR](/glossary/gdpr/), Czech [ZKB](/glossary/zkb/) cybersecurity regulations, and sector-specific frameworks. The Compliance Auditing Specialist maintains mappings between these regulatory requirements and the platform's technical controls, continuously validating that each control is properly implemented, documented, and effective. When auditors arrive, the evidence is already collected, organized, and ready for presentation. This approach eliminates the traditional compliance scramble that consumes engineering resources and introduces risk through rushed documentation efforts.

The agent draws on the Prismatic Platform's 434-agent ecosystem to coordinate compliance verification across all operational domains. Rather than operating as an isolated compliance checker, the specialist integrates with security scanning agents, data integrity monitors, access control verifiers, and logging infrastructure agents to build a comprehensive, real-time compliance posture that reflects actual system behavior rather than aspirational documentation.

## Architecture

The Compliance Auditing Specialist follows a layered architecture that separates regulatory knowledge from technical verification, enabling independent evolution of both regulatory mappings and control assessment mechanisms.

```
+------------------------------------------------------------------+
|                   Compliance Auditing Specialist                  |
+------------------------------------------------------------------+
|  Regulatory Knowledge Layer                                       |
|  +------------------+  +------------------+  +-----------------+  |
|  | NIS2 Requirements|  | GDPR Controls    |  | ZKB Regulations |  |
|  | (EU 2022/2555)   |  | (EU 2016/679)    |  | (264/2025 Sb.)  |  |
|  +--------+---------+  +--------+---------+  +--------+--------+  |
|           |                      |                     |          |
|  +--------+----------------------+---------------------+--------+ |
|  |              Unified Control Mapping Engine                   | |
|  +------+---------------------------+---------------------------+ |
|         |                           |                             |
|  +------+------+           +--------+--------+                    |
|  | Evidence    |           | Gap Analysis    |                    |
|  | Collector   |           | Engine          |                    |
|  +------+------+           +--------+--------+                    |
|         |                           |                             |
|  +------+---------------------------+---------------------------+ |
|  |              Audit Package Generator                         | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

The Unified Control Mapping Engine maintains a directed acyclic graph that links regulatory requirements to technical controls, controls to evidence sources, and evidence sources to automated collection mechanisms. This graph structure enables impact analysis when regulations change, showing which controls and evidence collection routines must be updated.

Each regulatory framework is modeled as an independent module with its own requirement taxonomy, control mapping logic, and compliance scoring methodology. The modular design allows new frameworks to be added without modifying existing compliance logic, following the open-closed principle that governs Prismatic's extension architecture.

## Core Capabilities

The Compliance Auditing Specialist delivers six primary capabilities that span the entire compliance lifecycle from requirement analysis through audit presentation.

**Continuous Compliance Monitoring** automatically validates control implementation against regulatory requirements with real-time posture scoring and gap alerting. The monitoring system evaluates each control on a configurable schedule, producing time-series compliance data that reveals trends, detects drift, and enables predictive compliance analytics. When a control's effectiveness score drops below its threshold, the system generates an immediate alert with remediation guidance.

**Evidence Collection Automation** gathers audit artifacts from logs, configuration files, access records, and security scan results with cryptographic integrity verification. Every piece of evidence is timestamped, hashed, and linked to the specific control it supports. The collection system maintains an immutable audit trail that proves evidence was gathered through automated means at documented times, eliminating concerns about evidence fabrication or post-hoc documentation.

**Multi-Framework Assessment** simultaneously evaluates compliance posture against NIS2, GDPR, ZKB, and [ISO 27001](/glossary/iso-27001/) requirements through unified control mapping. Where requirements overlap across frameworks, the system identifies shared controls and consolidates evidence collection, reducing duplication while maintaining framework-specific reporting capabilities.

**Audit Preparation** produces structured, auditor-ready documentation packages with evidence cross-references, control descriptions, and compliance status summaries. Each package follows the target framework's expected format and includes executive summaries, detailed control assessments, evidence indexes, and gap remediation timelines.

**Gap Analysis and Remediation Tracking** identifies specific compliance gaps, recommends remediation actions, and tracks progress toward closure with deadline enforcement. The remediation tracker assigns ownership, monitors progress, and escalates overdue items through the platform's agent coordination system.

**Control Effectiveness Testing** verifies that implemented controls actually achieve their intended security or compliance outcome, not merely that they exist in documentation. The system periodically tests controls through automated scenarios, measuring actual protection delivered against the control's stated objective.

## Implementation

The Compliance Auditing Specialist is implemented as an [OTP](/glossary/otp/) application with a [supervision tree](/glossary/supervision-tree/) that manages concurrent compliance assessment workflows across multiple regulatory frameworks.

```elixir
defmodule PrismaticCompliance.AuditingSpecialist do
  @moduledoc """
  L3 Strategic Command agent for continuous compliance validation
  and automated audit preparation across regulatory frameworks.
  """

  use GenServer

  alias PrismaticCompliance.{ControlMapper, EvidenceCollector, GapAnalyzer}
  alias PrismaticCompliance.Frameworks.{NIS2, GDPR, ZKB, ISO27001}

  @frameworks [NIS2, GDPR, ZKB, ISO27001]
  @assessment_interval :timer.minutes(30)

  defstruct [
    :posture_scores,
    :active_gaps,
    :evidence_store,
    :last_assessment,
    :remediation_tracker
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    state = %__MODULE__{
      posture_scores: %{},
      active_gaps: [],
      evidence_store: EvidenceCollector.init_store(opts),
      last_assessment: nil,
      remediation_tracker: GapAnalyzer.init_tracker()
    }

    schedule_assessment()
    {:ok, state}
  end

  @impl true
  def handle_info(:run_assessment, state) do
    {:ok, results} = assess_all_frameworks(state)

    updated_state = %{state |
      posture_scores: results.scores,
      active_gaps: results.gaps,
      last_assessment: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic, :compliance, :assessment_complete],
      %{gap_count: length(results.gaps)},
      %{frameworks: @frameworks}
    )

    schedule_assessment()
    {:noreply, updated_state}
  end

  defp assess_all_frameworks(state) do
    results =
      @frameworks
      |> Task.async_stream(&assess_framework(&1, state), timeout: :timer.minutes(5))
      |> Enum.reduce(%{scores: %{}, gaps: []}, &merge_results/2)

    {:ok, results}
  end

  defp assess_framework(framework, state) do
    controls = ControlMapper.controls_for(framework)

    controls
    |> Enum.map(fn control ->
      evidence = EvidenceCollector.collect(control, state.evidence_store)
      effectiveness = ControlMapper.assess_effectiveness(control, evidence)
      %{control: control, evidence: evidence, score: effectiveness}
    end)
  end

  defp schedule_assessment do
    Process.send_after(self(), :run_assessment, @assessment_interval)
  end
end
```

The evidence collection subsystem uses a pluggable adapter architecture that accommodates diverse evidence source types, from log files and database queries to API responses and configuration snapshots.

## Integration Points

The Compliance Auditing Specialist integrates with multiple platform systems to gather comprehensive compliance evidence and coordinate remediation activities.

| Integration Target | Protocol | Purpose |
|-------------------|----------|---------|
| [Prismatic Perimeter](/glossary/prismatic-perimeter/) | GenServer calls | Security posture data for NIS2 technical controls |
| [ETS](/glossary/ets/) Evidence Store | Direct ETS access | High-performance evidence caching and retrieval |
| [PostgreSQL](/glossary/postgresql/) Audit Log | [Ecto](/glossary/ecto/) queries | Persistent evidence storage with integrity verification |
| GitLab CI/CD | REST API | Pipeline compliance evidence and deployment audit trails |
| Access Control System | Internal API | User access records for GDPR and ZKB requirements |
| [Prismatic Web](/glossary/prismatic-web/) | LiveView | Real-time compliance dashboard and audit report viewer |

The agent also coordinates with peer agents to obtain domain-specific compliance evidence.

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [cer-compliance-commander](/agents/cer-compliance-commander/) | Receives strategic compliance directives and reports audit readiness status | Compliance |
| [cloud-security-specialist](/agents/cloud-security-specialist/) | Coordinates on infrastructure security controls that support compliance requirements | Security |
| [data-integrity-specialist](/agents/data-integrity-specialist/) | Validates data handling practices against GDPR and data protection requirements | Infrastructure |

## Operational Workflow

The compliance auditing workflow operates as a continuous cycle with four primary phases that execute on overlapping schedules.

**Phase 1 -- Continuous Assessment** runs every 30 minutes, evaluating each regulatory framework's control set against current system state. The assessment produces posture scores per framework and identifies any controls that have drifted below effectiveness thresholds. Assessment results are persisted to both ETS for real-time dashboard access and PostgreSQL for historical trend analysis.

**Phase 2 -- Evidence Collection** operates on a control-specific schedule determined by each control's risk level and the volatility of its evidence sources. High-risk controls with volatile evidence (such as access logs) are collected every 5 minutes. Lower-risk controls with stable evidence (such as encryption configuration) are collected daily. All evidence receives a SHA-256 hash and timestamp at collection time.

**Phase 3 -- Gap Analysis** executes after every assessment cycle, comparing current posture scores against compliance thresholds defined per framework. Identified gaps are classified by severity (critical, high, medium, low), assigned to remediation owners through the agent coordination system, and tracked with configurable deadlines that align with audit schedules.

**Phase 4 -- Audit Package Generation** produces on-demand or scheduled audit documentation packages that aggregate assessment results, evidence artifacts, gap remediation status, and executive compliance summaries into framework-specific formats suitable for auditor consumption.

## NABLA Compliance

The Compliance Auditing Specialist enforces strict adherence to the NABLA Infinity epistemic framework across all compliance assessments.

**Signal Plurality**: Every compliance determination requires evidence from at least two independent sources. A control is not marked as compliant based solely on configuration existence; operational evidence of the control's effectiveness must also be present.

**Contradiction Preservation**: When evidence sources disagree on a control's compliance status, both signals are preserved and flagged for human review rather than automatically resolving to the more favorable interpretation.

**Provenance Mandatory**: All compliance evidence carries full provenance metadata including source system, collection timestamp, collection method, and the specific control requirement it addresses. Evidence without provenance is rejected from audit packages.

**Time Decay**: Compliance evidence is assigned freshness scores that decay over time. Stale evidence triggers re-collection before it can be used in audit packages. The decay rate is configurable per evidence type based on the volatility of the underlying control.

All compliance claims must pass the [Trinity Gate](/glossary/trinity-gate/) validation before being reported: structural consistency of the evidence graph, logical consistency of compliance inferences, and formal verification of critical control effectiveness claims.

## Configuration

The Compliance Auditing Specialist is configured through the platform's standard configuration system with framework-specific and global parameters.

```elixir
config :prismatic_compliance, PrismaticCompliance.AuditingSpecialist,
  frameworks: [:nis2, :gdpr, :zkb, :iso27001],
  assessment_interval: :timer.minutes(30),
  evidence_retention_days: 365,
  evidence_store: :postgresql,
  evidence_cache: :ets,
  gap_escalation_threshold: :high,
  audit_package_format: :pdf,
  dashboard_refresh_ms: 5_000,
  posture_alert_threshold: 0.85,
  control_effectiveness_minimum: 0.90
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `frameworks` | All four | Regulatory frameworks to assess |
| `assessment_interval` | 30 min | Time between full assessment cycles |
| `evidence_retention_days` | 365 | How long evidence is retained |
| `posture_alert_threshold` | 0.85 | Score below which alerts fire |
| `control_effectiveness_minimum` | 0.90 | Minimum control effectiveness score |

## Performance

The Compliance Auditing Specialist is engineered for continuous operation with minimal impact on platform performance.

| Metric | Target | Measured |
|--------|--------|----------|
| Full assessment cycle | < 5 minutes | 3.2 minutes |
| Single control evaluation | < 500ms | 180ms average |
| Evidence collection throughput | > 100 items/sec | 250 items/sec |
| Dashboard refresh latency | < 200ms | 85ms |
| Audit package generation | < 30 seconds | 18 seconds |
| Memory footprint | < 256 MB | 142 MB |

The ETS-based evidence cache provides sub-millisecond read access for dashboard queries while PostgreSQL handles durable storage and historical queries. Concurrent assessment of multiple frameworks via `Task.async_stream` ensures that individual slow controls do not block overall assessment completion.

## Related Resources

- [cer-compliance-commander](/agents/cer-compliance-commander/) -- Strategic compliance directives and audit coordination
- [cloud-security-specialist](/agents/cloud-security-specialist/) -- Infrastructure security controls for compliance
- [data-integrity-specialist](/agents/data-integrity-specialist/) -- Data protection compliance validation
- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- External attack surface compliance data
- [NIS2 Directive](/glossary/nis2/) -- EU Network and Information Systems security requirements
- [GDPR](/glossary/gdpr/) -- EU General Data Protection Regulation
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulatory framework
- [Quality Gates](/capabilities/quality-gates/) -- Platform quality enforcement infrastructure
- [AIAD Standard](/glossary/aiad/) -- Autonomous Intelligence Agent Design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)