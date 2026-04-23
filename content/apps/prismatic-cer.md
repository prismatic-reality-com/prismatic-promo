+++
title = "Prismatic CER"
weight = 72
[extra]
icon = "document-check"
color = "blue"
description = "Compliance and Evidence Repository for regulatory audit trail management"
category = "Compliance"
files = "105"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1174
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "CER", "Compliance", "Evidence", "Repository", "apps", "Prismatic Platform", "PrismaticCer", "GDPR"]
tags = ["apps", "compliance", "prismatic-cer", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic CER - Prismatic Platform"
+++

## Abstract

Prismatic CER (Compliance and Evidence Repository) provides structured storage and management of compliance evidence, audit artifacts, and regulatory documentation within the Prismatic Platform. It supports [NIS2](@/glossary/nis2.md) Directive (EU 2022/2555), [GDPR](@/glossary/gdpr.md), ZKB 264/2025 Sb. (Czech cybersecurity law), and custom [compliance framework](@/glossary/compliance-framework.md)s by maintaining a tamper-proof repository of evidence collected from platform operations. The system implements SHA-256 content-addressable storage for tamper detection, continuous gap analysis against active frameworks, and an Auditor Portal via [Phoenix LiveView](@/glossary/phoenix-liveview.md) for authorized evidence review. In regulated industries, the ability to demonstrate compliance is as important as being compliant -- CER ensures the platform can produce auditable evidence chains for any compliance claim at any time.

## 1. Introduction

### 1.1 Problem Statement

Organizations operating under multiple regulatory frameworks face a persistent challenge: producing verifiable evidence of compliance on demand. Traditional approaches -- manual document collection, spreadsheet-based tracking, and ad-hoc audit preparation -- are fragile, incomplete, and cannot scale across the dozens of regulatory requirements that modern cybersecurity and data protection frameworks mandate. When an auditor requests evidence for a specific NIS2 article or GDPR obligation, organizations without automated evidence management spend weeks assembling documentation that may be incomplete or outdated.

Prismatic CER automates the entire evidence lifecycle: collection from platform operations, classification by framework and requirement, tamper-proof storage with cryptographic verification, continuous gap analysis, and on-demand report generation.

### 1.2 Design Goals

1. **Tamper-proof storage** -- SHA-256 content hashing with hash chain verification for all evidence artifacts.
2. **Multi-framework support** -- NIS2, GDPR, ZKB, and custom framework definitions with requirement hierarchies.
3. **Continuous gap analysis** -- proactive identification of missing, stale, or insufficient evidence.
4. **Automated collection** -- event hooks on platform operations for automatic evidence capture.
5. **Audit-ready reporting** -- PDF, HTML, and JSON report generation with complete evidence chains.
6. **NABLA compliance** -- all evidence entries carry provenance metadata per the provenance mandatory axiom.

### 1.3 Scope

CER covers evidence storage, framework mapping, gap analysis, and report generation. It does not implement the regulatory frameworks themselves (which are defined as data) or perform the compliance activities (which are performed by other platform modules whose outputs become evidence).

## 2. Architecture

### 2.1 System Design

```
Platform Operations → Event Hooks → Evidence Collector → Evidence Store
      ↓                    ↓               ↓                   ↓
  Scan Results        Classification    SHA-256 Hash       PostgreSQL
  Audit Logs          Framework Map     Chain Verify       Content-Addressable
  Policy Docs         Requirement Tag   Provenance Track   Version History
      ↓                    ↓               ↓                   ↓
                    Framework Registry → Assessment Engine → Gap Report
                           ↓                    ↓                ↓
                    NIS2/GDPR/ZKB         Scoring            Remediation
                    Custom Defs           Threshold Check     Tracking
                           ↓                    ↓                ↓
                    Auditor Portal (LiveView at /compliance)
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticCer` | Public facade: `store_evidence/1`, `compliance_report/2`, `gap_analysis/1`, `verify_chain/1` |
| `PrismaticCer.EvidenceStore` | PostgreSQL-backed content-addressable storage with SHA-256 hashing |
| `PrismaticCer.FrameworkRegistry` | Framework definitions (NIS2, GDPR, ZKB) with requirement hierarchies |
| `PrismaticCer.AssessmentEngine` | Continuous evidence evaluation against framework requirements |
| `PrismaticCer.GapAnalyzer` | Missing, stale, and insufficient evidence identification |
| `PrismaticCer.ReportGenerator` | Compliance report generation in PDF, HTML, and JSON formats |
| `PrismaticCer.EvidenceCollector` | Event hook integration for automatic evidence capture |
| `PrismaticCer.HashChain` | Cryptographic hash chain management for tamper detection |
| `PrismaticCer.AuditorPortal` | LiveView dashboard for authorized evidence review |

### 2.3 Process Topology

```
PrismaticCer.Application (Supervisor, :one_for_one)
+-- PrismaticCer.EvidenceStore (GenServer)
|     Content-addressable storage, hash chain management
+-- PrismaticCer.AssessmentEngine (GenServer)
|     Continuous compliance scoring and gap detection
+-- PrismaticCer.EvidenceCollector (GenServer)
|     Platform event subscription and automatic evidence capture
+-- Task.Supervisor
      Report generation and batch assessment tasks
```

### 2.4 Data Flow

Platform operations emit events (security scans, policy updates, configuration changes) that the EvidenceCollector captures through PubSub subscriptions. Each captured artifact is classified by framework and requirement, hashed with SHA-256, and stored with full provenance metadata. The AssessmentEngine continuously evaluates collected evidence against active framework requirements, producing compliance scores and identifying gaps. The GapAnalyzer categorizes gaps by severity and generates remediation tracking entries. Reports are generated on demand through the ReportGenerator or scheduled for periodic delivery.

## 3. Implementation

### 3.1 Evidence Lifecycle

Evidence progresses through defined stages: **Collection** (automatic or manual capture), **Classification** (framework and requirement mapping), **Review** (human verification of evidence quality), **Approval** (authorized sign-off for audit readiness), and **Archival** (retention policy-compliant long-term storage). Each stage transition is recorded with timestamp, actor, and reason for full traceability.

### 3.2 Data Structures

```elixir
defmodule PrismaticCer.Evidence do
  @type t :: %__MODULE__{
    id: String.t(),
    framework: atom(),
    requirement: String.t(),
    evidence_type: atom(),
    document: binary(),
    hash: String.t(),
    chain_hash: String.t(),
    metadata: %{
      collected_at: DateTime.t(),
      collector: String.t(),
      confidence: float(),
      description: String.t()
    },
    status: :collected | :reviewed | :approved | :archived,
    version: pos_integer(),
    provenance: Provenance.t()
  }
end
```

### 3.3 API Surface

```elixir
# Store compliance evidence with full metadata
{:ok, evidence} = PrismaticCer.store_evidence(%{
  framework: :nis2,
  requirement: "Article 21.2(a)",
  evidence_type: :policy_document,
  document: document_binary,
  metadata: %{
    collected_at: DateTime.utc_now(),
    collector: "automated:perimeter_scan",
    confidence: 0.95,
    description: "Risk analysis policy document for network security"
  }
})

# Generate a comprehensive compliance report
{:ok, report} = PrismaticCer.compliance_report(:nis2,
  format: :pdf,
  sections: [:executive_summary, :requirement_mapping, :gap_analysis],
  as_of: ~D[2026-01-31])

# Run gap analysis for a specific framework
{:ok, gaps} = PrismaticCer.gap_analysis(:nis2)
# => %{total_requirements: 45, evidenced: 38, gaps: 7,
#      compliance_score: 84.4, critical_gaps: ["Article 21.2(e)", ...]}

# Verify evidence chain integrity
{:ok, :verified} = PrismaticCer.verify_chain(evidence_id)
```

### 3.4 Configuration

```elixir
config :prismatic_cer,
  frameworks: [:nis2, :gdpr, :zkb],
  evidence_store: PrismaticCer.EvidenceStore.Postgres,
  hash_algorithm: :sha256,
  gap_analysis_interval: :timer.hours(6),
  retention_policies: %{
    nis2: :years_5,
    gdpr: :years_3,
    zkb: :years_5
  },
  report_formats: [:pdf, :html, :json],
  auditor_portal_path: "/compliance"
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Storage Ecto](@/apps/prismatic-storage-ecto.md) | PostgreSQL persistence for evidence data |
| [Prismatic Nabla](@/apps/prismatic-nabla.md) | Provenance tracking for evidence entries |
| [Prismatic Web](@/apps/prismatic-web.md) | Auditor Portal LiveView dashboard |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Security assessment artifacts stored as compliance evidence |
| [Prismatic Override](@/apps/prismatic-override.md) | Emergency action audit logs for incident compliance |
| [Prismatic Narrative](@/apps/prismatic-narrative.md) | Intelligence reports stored as compliance documentation |
| [Prismatic Compression](@/apps/prismatic-compression.md) | Evidence archival with retention policy enforcement |
| [Prismatic Presales](@/apps/prismatic-presales.md) | Compliance capabilities for customer engagements |

### 4.3 Inter-Process Communication

Evidence collection uses PubSub subscriptions to platform events. Assessment operations run as supervised tasks. Report generation executes as background tasks with progress tracking.

## 5. Testing Strategy

### 5.1 Unit Tests

Evidence store tests verify correct hashing, chain verification, and tamper detection. Framework registry tests validate requirement hierarchy loading and mapping correctness. Assessment engine tests verify scoring accuracy against known evidence-to-requirement mappings.

### 5.2 Integration Tests

Full compliance pipeline tests exercise evidence collection from platform events through classification, storage, assessment, gap analysis, and report generation.

### 5.3 Property-Based Testing

StreamData generators produce random evidence entries and framework configurations to verify that hash chains maintain integrity under all valid operations and that gap analysis correctly identifies missing requirements.

## 6. Performance

### 6.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Evidence storage | < 50ms | Hash computation + PostgreSQL write |
| Chain verification | < 100ms | Sequential hash chain walk |
| Gap analysis (NIS2, 45 requirements) | < 500ms | Full requirement mapping scan |
| Report generation (PDF) | 1-5s | Depends on evidence volume |
| Compliance score computation | < 200ms | Cached requirement counts |

### 6.2 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 512 MB |
| Disk | 1 GB | 10 GB (evidence artifacts) |

## 7. NABLA Compliance

CER is a primary consumer and enforcer of the provenance mandatory axiom. Every evidence entry carries full provenance metadata: source system, collection timestamp, collector identity, confidence level, and hash chain linkage. The [Trinity Gate](@/glossary/trinity-gate.md) validates that compliance claims are structurally consistent (evidence maps to requirements), logically consistent (evidence supports the claim), and formally verifiable (hash chains are intact).

## 8. Supported Frameworks

### 8.1 NIS2 Directive (EU 2022/2555)

Evidence mapping for all Article 21 requirements covering risk analysis policies, incident handling procedures, business continuity measures, supply chain security, and security in network and information systems.

### 8.2 GDPR

Compliance documentation covering data processing records, data protection impact assessments, consent management records, and data breach notification logs.

### 8.3 ZKB 264/2025 Sb.

Czech cybersecurity requirements with Czech-language report generation, covering critical information infrastructure, significant information systems, and digital service providers.

## 9. Operational Considerations

### 9.1 Deployment

Deploys as part of the umbrella [release](@/glossary/release.md). Requires PostgreSQL for evidence storage. The Auditor Portal is accessible at `/compliance` through the platform web interface.

### 9.2 Monitoring

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :cer, :evidence_stored]`, `[:prismatic, :cer, :gap_detected]`, `[:prismatic, :cer, :report_generated]`, `[:prismatic, :cer, :chain_verified]`.

### 9.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Chain verification failure | Evidence tampered or missing | Investigate evidence integrity, restore from backup |
| Low compliance score | Missing evidence collection hooks | Add event subscriptions for uncovered operations |
| Report generation timeout | Large evidence volume | Increase task timeout or reduce report scope |

## 10. Future Work

Planned enhancements include automated evidence collection from CI/CD pipeline artifacts, cross-framework requirement deduplication (shared controls between NIS2 and GDPR), evidence quality scoring with machine learning, and integration with external audit management platforms for bidirectional evidence exchange.

## References

- [NIS2 Directive](https://eur-lex.europa.eu/eli/dir/2022/2555) -- EU cybersecurity directive
- [GDPR](https://gdpr-info.eu/) -- General Data Protection Regulation
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) -- Security posture assessments

## Related Agents

- [CER Compliance Commander](@/agents/cer-compliance-commander.md) -- Orchestrates compliance evidence collection and gap remediation campaigns
- [Evidence Enforcement Agent](@/agents/evidence-enforcement-agent.md) -- Ensures all compliance claims carry verifiable evidence chains
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews compliance architecture for regulatory alignment

## Related Capabilities

- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Provenance mandatory axiom ensures all evidence is traceable to source
- [Trinity Gate](@/capabilities/trinity-gate.md) -- Formal verification of compliance claim consistency
- [AIAD Compliance](@/capabilities/aiad-compliance.md) -- Platform-wide compliance standard enforcement across all modules

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)