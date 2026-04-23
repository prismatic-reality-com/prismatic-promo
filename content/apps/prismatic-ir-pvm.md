+++
title = "Prismatic IR PVM"
weight = 74
[extra]
icon = "shield-check"
color = "red"
description = "Incident Response with Patch and Vulnerability Management"
category = "Security"
files = "170"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1009
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "PVM", "Incident", "Response", "Patch", "Vulnerability", "Management", "apps", "Security", "Prismatic Platform"]
tags = ["apps", "security", "prismatic-ir-pvm", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic IR PVM - Prismatic Platform"
+++

## Overview

Prismatic IR [PVM](/glossary/pvm/) provides integrated [Incident Response](/glossary/incident-response/) with Patch and Vulnerability Management capabilities. It tracks discovered vulnerabilities from initial detection through remediation, manages patching workflows with SLA enforcement, and coordinates incident response activities when vulnerabilities are actively exploited. The module bridges the critical gap between vulnerability discovery and remediation execution that organizations frequently struggle with.

The system implements the full incident response lifecycle -- detect, contain, eradicate, and recover -- with automated playbook execution for common incident types. Each incident maintains a complete evidence chain with custody tracking, enabling post-incident forensic analysis and regulatory compliance reporting. Vulnerability data is enriched with [CVSS](https://www.first.org/cvss/) scoring, asset mapping, and patch availability monitoring to support risk-based prioritization decisions.

By integrating vulnerability management directly with incident response, IR PVM eliminates the organizational silos that typically delay remediation. When [Prismatic Detection Engine](/apps/prismatic-detection-engine/) identifies active exploitation of a known vulnerability, IR PVM automatically escalates the vulnerability to incident status and initiates the appropriate response playbook. The [NABLA](/glossary/nabla-infinity/) framework's [provenance mandatory](/glossary/provenance-mandatory/) axiom ensures that every step of the incident lifecycle is documented with cryptographic evidence chains that satisfy regulatory audit requirements under [NIS2](/glossary/nis2/) and [GDPR](/glossary/gdpr/).

## Architecture

```
Vulnerability Sources --> Vulnerability Registry --> Risk Prioritization
        |                       |                        |
  CVE Feeds              Asset Mapping            CVSS Scoring
  Scanner Results        Patch Availability        SLA Tracking
  OSINT Intelligence     Remediation Plans         Compliance
        |                       |                        |
Detection Engine --> Incident Creation --> Playbook Execution --> Recovery
                         |                    |
                   Evidence Collection    Post-Incident Review
                         |                    |
                   Chain of Custody       Lessons Learned
```

The architecture uses [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/)s to manage long-running incident workflows as stateful processes. Each active incident runs under its own supervised process, ensuring that a crash in one incident workflow cannot affect others. The state machine pattern ensures that incidents follow valid lifecycle transitions and that SLA timers are enforced.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticIrPvm` | Public facade: `track_vulnerability/1`, `create_incident/1`, `execute_playbook/2` |
| `PrismaticIrPvm.Application` | OTP application entry point with incident supervisor |
| `PrismaticIrPvm.VulnerabilityRegistry` | Vulnerability tracking with CVSS scoring and asset mapping |
| `PrismaticIrPvm.IncidentManager` | Incident lifecycle management with state machine enforcement |
| `PrismaticIrPvm.PlaybookEngine` | Automated response playbook execution with step tracking |
| `PrismaticIrPvm.PatchTracker` | Patch availability monitoring and deployment tracking |
| `PrismaticIrPvm.EvidenceChain` | Cryptographic evidence chain of custody management |
| `PrismaticIrPvm.SlaEnforcer` | SLA timer management with escalation on deadline breach |
| `PrismaticIrPvm.ComplianceReporter` | Regulatory compliance report generation |

## Key Features

### Vulnerability Management
- Vulnerability tracking from discovery through verified remediation with full state history
- CVSS v3.1 scoring with environmental and temporal adjustments for context-specific risk assessment
- Asset-vulnerability mapping with blast radius analysis showing cascading impact potential
- Patch availability monitoring with vendor advisory integration and automatic notification

### Vulnerability Risk Prioritization

The risk prioritization engine combines CVSS base scores with contextual factors to produce organization-specific risk rankings. Asset criticality, network exposure, and active exploitation intelligence from OSINT sources adjust the priority beyond what CVSS alone can capture:

| Factor | Weight | Source | Impact |
|--------|--------|--------|--------|
| CVSS base score | 0.30 | NVD, vendor advisories | Intrinsic vulnerability severity |
| Asset criticality | 0.25 | Asset inventory | Business impact of affected systems |
| Active exploitation | 0.20 | OSINT, threat feeds | Known exploitation in the wild |
| Network exposure | 0.15 | Perimeter scanning | Internet-facing vs. internal-only |
| Patch availability | 0.10 | Vendor tracking | Remediability assessment |

### Incident Response Lifecycle

The incident lifecycle is modeled as a state machine with well-defined transitions and mandatory evidence requirements at each stage:

| Phase | Actions | Evidence Required | SLA |
|-------|---------|-------------------|-----|
| Detection | Identify active exploitation | Detection rule match, logs | N/A |
| Containment | Isolate affected systems | Containment verification | 4 hours (critical) |
| Eradication | Remove threat from environment | Cleanup verification | 24 hours (critical) |
| Recovery | Restore normal operations | System health verification | 48 hours (critical) |
| Post-Incident | Review and lessons learned | Complete incident report | 5 business days |

```elixir
defmodule PrismaticIrPvm.IncidentManager do
  use GenStateMachine, callback_mode: :handle_event_function

  @type state :: :detected | :contained | :eradicated | :recovered | :reviewed | :closed

  def handle_event(:cast, {:transition, :contain}, :detected, data) do
    with :ok <- verify_containment_evidence(data),
         :ok <- start_sla_timer(data, :containment) do
      {:next_state, :contained, %{data | contained_at: DateTime.utc_now()}}
    end
  end

  def handle_event(:cast, {:transition, :eradicate}, :contained, data) do
    with :ok <- verify_eradication_evidence(data),
         :ok <- cancel_sla_timer(data, :containment),
         :ok <- start_sla_timer(data, :eradication) do
      {:next_state, :eradicated, %{data | eradicated_at: DateTime.utc_now()}}
    end
  end
end
```

### Playbook Execution
- Full incident lifecycle management (detect, contain, eradicate, recover) with automated step execution
- Playbook execution engine with step-by-step tracking and rollback capability
- Evidence collection with cryptographic chain of custody verification
- Post-incident review with lessons-learned tracking and pattern extraction for future detection

### Evidence Chain of Custody

The evidence chain module implements cryptographic integrity verification using SHA-256 hash chains. Each evidence item added to an incident extends the hash chain, creating a tamper-evident record that satisfies legal and regulatory evidence handling requirements:

```elixir
defmodule PrismaticIrPvm.EvidenceChain do
  @spec add_evidence(String.t(), Evidence.t()) :: {:ok, Evidence.t()} | {:error, term()}
  def add_evidence(incident_id, evidence) do
    previous_hash = get_chain_head(incident_id)
    entry_hash = compute_hash(previous_hash, evidence)

    entry = %EvidenceEntry{
      incident_id: incident_id,
      evidence: evidence,
      previous_hash: previous_hash,
      entry_hash: entry_hash,
      collected_by: evidence.collector,
      collected_at: DateTime.utc_now()
    }

    {:ok, persist_and_extend_chain(entry)}
  end
end
```

### Patch Management
- Patch deployment tracking with verification testing against staging environments
- SLA enforcement for remediation timelines by severity class with automatic escalation
- Exception management for deferred patches with risk acceptance documentation
- Compliance reporting on patch status across asset inventory for regulatory audits

## Usage

```elixir
# Track a new vulnerability with asset mapping
{:ok, vuln} = PrismaticIrPvm.track_vulnerability(%{
  cve: "CVE-2025-12345",
  assets: ["server-01", "server-02"],
  severity: :critical,
  cvss_score: 9.8
})

# Create incident from detected exploitation
{:ok, incident} = PrismaticIrPvm.create_incident(%{
  type: :exploitation,
  vulnerability: "CVE-2025-12345",
  affected_assets: ["server-01"],
  evidence: [network_capture, log_entries]
})

# Execute containment playbook
{:ok, _} = PrismaticIrPvm.execute_playbook(incident, :containment)

# Track patch deployment
{:ok, _} = PrismaticIrPvm.track_patch(%{
  vulnerability: "CVE-2025-12345",
  patch_id: "KB5025123",
  deployed_to: ["server-01", "server-02"],
  verified: true
})

# Generate compliance report
{:ok, report} = PrismaticIrPvm.compliance_report(window: :last_quarter)
# => %{vulnerabilities_tracked: 234, mean_time_to_remediate: "4.2 days", sla_compliance: 0.97}
```

## NABLA Compliance

| NABLA Axiom | IR PVM Enforcement | Implementation |
|-------------|-------------------|----------------|
| Provenance Mandatory | Every evidence item carries cryptographic chain of custody | Evidence chain module with SHA-256 hash verification |
| Signal Plurality | Incident classification requires multiple detection signals | Cross-method detection confirmation before escalation |
| Time Decay | SLA enforcement with temporal tracking | Deadline timers on all incident phases |
| Contradiction Preservation | Conflicting evidence preserved for post-incident review | All evidence maintained regardless of contradiction |
| Source Independence | Detection and vulnerability sources operate independently | Separate ingestion paths for CVE feeds, scanners, and OSINT |

## Testing

Vulnerability tracking tests verify CVSS scoring accuracy, asset mapping correctness, and state transition validity. Incident lifecycle tests verify state machine transitions, SLA enforcement, and evidence chain integrity using simulated incident scenarios. Playbook execution tests verify step-by-step execution, rollback behavior, and error handling.

Integration tests exercise the full pipeline from vulnerability detection through incident creation, playbook execution, and compliance reporting. Property-based tests generate random vulnerability and incident data to verify state machine invariants. Evidence chain tests verify cryptographic hash chain integrity using tamper injection to confirm detection of corrupted evidence.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Triggers incident creation on active exploitation detection |
| [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/) | Vulnerability data feeds into [security rating](/glossary/security-rating/) computation |
| [Prismatic OSINT Network](/apps/prismatic-osint-network/) | External vulnerability intelligence enrichment |
| [Prismatic Compliance](/apps/prismatic-compliance/) | [Compliance framework](/glossary/compliance-framework/) integration for remediation reporting |
| [Prismatic IR PVM Web](/apps/prismatic-ir-pvm-web/) | [LiveView](/glossary/liveview/) dashboard for incident and vulnerability management |
| [Prismatic Audit](/apps/prismatic-audit/) | Immutable [audit trail](/glossary/audit-trail/) for all incident response activities |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Vulnerability tracking | < 50ms | Registry insert with CVSS computation |
| Incident creation | < 100ms | Including SLA timer initialization |
| Playbook step execution | 1-30s | Depends on action type |
| Evidence chain verification | < 200ms | SHA-256 hash chain validation |
| Compliance report generation | 2-10s | Depends on reporting period scope |
| Risk prioritization (full) | < 500ms | Weighted scoring across all factors |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :ir_pvm, :vulnerability_tracked]`, `[:prismatic, :ir_pvm, :incident_created]`, `[:prismatic, :ir_pvm, :playbook_step]`.

## Related Resources

- [Prismatic Safety](/apps/prismatic-safety/) -- Safety constraints on incident response actions
- [GitLab Security Specialist Agent](/agents/gitlab-security-specialist-agent/) -- Coordinates vulnerability tracking across CI/CD
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages incident alert severity and escalation
- [Deployment Commander Agent](/agents/deployment-commander-agent/) -- Orchestrates patch deployment and rollback
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Enables immediate detection of active exploitation
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Automated playbook execution during incident response
- [Color Teams](/capabilities/color-teams/) -- Adversarial-defensive synthesis for vulnerability assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)