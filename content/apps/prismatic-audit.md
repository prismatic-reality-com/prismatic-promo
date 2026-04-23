+++
title = "Prismatic Audit"
weight = 24
[extra]
icon = "clipboard-document-check"
color = "amber"
description = "Comprehensive audit trail system with tamper-proof event logging"
category = "Compliance"
files = "120"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1129
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Audit", "Comprehensive", "apps", "Compliance", "Prismatic Platform", "PrismaticAudit", "PostgreSQL"]
tags = ["apps", "compliance", "prismatic-audit", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Audit - Prismatic Platform"
+++

## Abstract

Prismatic Audit provides a tamper-proof audit logging system across the entire Prismatic Platform, recording every significant action, data access, and system event with full context including actor identity, timestamp, affected resources, and change details. The system implements cryptographic hash chaining where each audit entry includes the hash of the preceding entry, creating an append-only log where retrospective tampering is detectable through chain verification. Audit events cover user authentication and authorization, data access and modification, system configuration changes, API calls with parameters and results, background job execution, and agent operations. The [audit trail](/glossary/audit-trail/) supports regulatory compliance requirements for [NIS2](/glossary/nis2/), [GDPR](/glossary/gdpr/), and SOC 2 by providing structured evidence collection, subject access request fulfillment, and compliance report generation.

## 1. Introduction

### 1.1 Problem Statement

Regulatory frameworks including the NIS2 Directive (EU 2022/2555) and GDPR (EU 2016/679) require organizations to maintain comprehensive records of data processing activities, security events, and access decisions. Without a centralized audit system, compliance evidence is scattered across application logs, database change records, and system journals, making it impossible to reconstruct a complete timeline of events for auditors or incident investigators.

Prismatic Audit centralizes all audit-relevant events into a single, tamper-evident repository that serves both operational forensics and regulatory compliance.

### 1.2 Design Goals

1. **Tamper-proof storage** -- cryptographic hash chaining ensures retrospective modification of audit records is detectable.
2. **Comprehensive coverage** -- all security-relevant actions across all platform applications are captured.
3. **Compliance mapping** -- audit events are tagged with relevant regulatory requirements for automated compliance reporting.
4. **Query performance** -- audit trail queries by resource, actor, time range, or event type complete within seconds.
5. **Async operation** -- audit logging does not block the audited operation's critical path.
6. **Long-term retention** -- configurable retention policies with archival support for multi-year regulatory requirements.

### 1.3 Scope

Prismatic Audit covers audit event capture, storage, integrity verification, and compliance reporting. It does not implement real-time alerting (handled by [Prismatic Signals](/apps/prismatic-signals/)) or detailed system [metrics](/glossary/metrics/) (handled by [Prismatic Telemetry](/apps/prismatic-telemetry/)).

## 2. Architecture

### 2.1 System Design

```
Event Sources (all platform applications)
       |
  PrismaticAudit.log/2 (async)
       |
  Event Buffer (GenServer)
       |
  Hash Chain Construction
  (SHA-256 of previous entry + current entry)
       |
  Persistent Storage (PostgreSQL)
       |
  Query Engine (filtered retrieval, chain verification)
       |
  Compliance Reports (NIS2, GDPR, SOC 2)
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticAudit` | Public facade: `log/2`, `query/1`, `verify_chain/1`, `compliance_report/2` |
| `PrismaticAudit.EventBuffer` | [GenServer](/glossary/genserver/): async event batching and ordered persistence |
| `PrismaticAudit.HashChain` | Cryptographic hash chain construction and verification |
| `PrismaticAudit.Store` | [PostgreSQL](/glossary/postgresql/) persistence with indexed queries |
| `PrismaticAudit.QueryEngine` | Filtered retrieval by actor, resource, time range, event type |
| `PrismaticAudit.ComplianceReporter` | Regulatory report generation from audit data |
| `PrismaticAudit.RetentionManager` | Configurable retention policies with archival |

### 2.3 Process Topology

```
PrismaticAudit.Application (Supervisor, :one_for_one)
+-- PrismaticAudit.EventBuffer (GenServer)
|     Batches async audit events, flushes to storage periodically
+-- PrismaticAudit.RetentionManager (GenServer)
|     Periodic retention policy enforcement and archival
+-- PrismaticAudit.IntegrityChecker (GenServer)
      Periodic hash chain integrity verification
```

### 2.4 Data Flow

Platform applications call `PrismaticAudit.log/2` to record audit events. The call is asynchronous (cast to GenServer), so the audited operation is not blocked. The EventBuffer batches events and flushes them to PostgreSQL with hash chain construction. Each entry's hash incorporates the previous entry's hash, creating a tamper-evident chain. Queries retrieve events from PostgreSQL with indexed filters. Chain verification reads sequential entries and recomputes hashes to detect tampering.

## 3. Implementation

### 3.1 Key Algorithms

**Hash Chain Construction**. Each audit entry includes a `chain_hash` field computed as `SHA-256(previous_chain_hash || entry_id || event_type || actor || resource || timestamp || details_hash)`. The first entry in the chain uses a genesis hash derived from the system configuration. Chain verification recomputes hashes from any starting entry and compares against stored values.

**Event Batching**. The EventBuffer accumulates events for up to 100ms or 100 events (whichever threshold is reached first), then persists the batch in a single database transaction with hash chain computation. This amortizes database round-trip overhead while maintaining sub-second audit latency.

### 3.2 Data Structures

```elixir
defmodule PrismaticAudit.Event do
  @type t :: %__MODULE__{
    id: pos_integer(),
    event_type: atom(),
    actor: %{id: String.t(), type: :user | :system | :agent},
    resource: String.t(),
    action: atom(),
    details: map(),
    ip_address: String.t() | nil,
    timestamp: DateTime.t(),
    chain_hash: binary(),
    compliance_tags: [atom()]
  }
end
```

### 3.3 API Surface

```elixir
# Log an audit event
@spec log(atom(), map()) :: :ok
PrismaticAudit.log(:data_access, %{
  actor: current_user,
  resource: "entity:12345",
  action: :read,
  context: %{source: :api, ip: "1.2.3.4"}
})

# Query audit trail
@spec query(keyword()) :: {:ok, [Event.t()]}
PrismaticAudit.query(
  resource: "entity:12345",
  from: ~U[2026-01-01 00:00:00Z],
  to: ~U[2026-01-31 23:59:59Z])

# Verify chain integrity
@spec verify_chain(keyword()) :: {:ok, :verified} | {:error, {:tampered, pos_integer()}}
PrismaticAudit.verify_chain(from: 1, to: :latest)

# Generate compliance report
@spec compliance_report(atom(), keyword()) :: {:ok, Report.t()}
PrismaticAudit.compliance_report(:nis2, period: :last_quarter)
```

### 3.4 Configuration

```elixir
config :prismatic_audit,
  buffer_flush_interval: 100,
  buffer_flush_count: 100,
  hash_algorithm: :sha256,
  retention_days: 365 * 7,
  archive_after_days: 365 * 2,
  integrity_check_interval: :timer.hours(24),
  compliance_frameworks: [:nis2, :gdpr, :soc2]
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Storage](/apps/prismatic-storage/) | PostgreSQL persistence via [Ecto](/glossary/ecto/) adapter |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Auth](/apps/prismatic-auth/) | Authentication event logging |
| [Prismatic Compliance](/apps/prismatic-compliance/) | Compliance evidence from audit data |
| [Prismatic CER](/apps/prismatic-cer/) | Evidence repository integration |
| All platform applications | Event source |

### 4.3 Inter-Process Communication

Audit events are sent as asynchronous GenServer casts to the EventBuffer, ensuring zero-latency impact on audited operations. The EventBuffer communicates with PostgreSQL through Ecto. Integrity verification runs as a periodic background task.

### 4.4 External Integrations

PostgreSQL for persistent storage. No external audit services are used; all processing runs locally for data sovereignty.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Event logging (async) | < 1ms | Cast to GenServer |
| Batch flush (100 events) | 5-20ms | Single PostgreSQL transaction |
| Query by resource + time | 10-100ms | Indexed PostgreSQL query |
| Full chain verification (1M entries) | 30-60s | Sequential hash recomputation |

### 5.2 Scalability

Event batching amortizes database cost. Retention management keeps active table size bounded. Archive tables support long-term queries without impacting write performance.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 256 MB |
| Storage | 5 GB/year | 20 GB/year (full event details) |

## 6. Testing Strategy

### 6.1 Unit Tests

Hash chain tests verify correct computation and tamper detection. Event buffer tests verify batching behavior and flush timing. Query tests verify filtered retrieval accuracy.

### 6.2 Integration Tests

Full pipeline tests exercise event logging through persistence, retrieval, and chain verification. Compliance report tests verify correct event aggregation for each regulatory framework.

### 6.3 Property-Based Testing

StreamData generators produce random event sequences to verify that hash chains are always consistent, chain verification detects any single-entry modification, and queries return correct subsets of logged events.

## 7. Security Considerations

### 7.1 Threat Model

The primary threat is audit log tampering to conceal malicious activity. The hash chain makes post-hoc modification detectable. Additional mitigations include database-level access controls, periodic integrity verification, and write-ahead logging.

### 7.2 Access Control

Audit log write access is restricted to the EventBuffer process. Read access requires `audit_read` permission. Chain verification is accessible to `admin` role only.

## 8. Operational Considerations

### 8.1 Deployment

Requires PostgreSQL with indexed audit tables. Schema migrations are managed through Ecto. The integrity checker runs automatically after deployment.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :audit, :event_logged]`, `[:prismatic, :audit, :buffer_flushed]`, `[:prismatic, :audit, :integrity_check]`. Key metrics include events per second, buffer utilization, and chain integrity status.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Missing audit events | Buffer not flushing | Check EventBuffer process health |
| Chain verification failure | Database corruption or tampering | Investigate specific entry; compare with backups |
| Slow queries | Missing indexes | Add indexes on actor, resource, timestamp columns |
| Storage growth | Retention not enforced | Verify RetentionManager schedule |

## 9. Future Work

Planned enhancements include distributed audit log replication across nodes, real-time integrity streaming (verify as events are written), integration with external [SIEM](/glossary/siem/) systems, and blockchain-anchored audit proofs for regulatory submissions.

## References

- [Prismatic Compliance](/apps/prismatic-compliance/) -- [Compliance framework](/glossary/compliance-framework/) integration
- [Prismatic Auth](/apps/prismatic-auth/) -- Authentication event source
- [Prismatic CER](/apps/prismatic-cer/) -- Evidence repository
- [NIS2 Directive](https://eur-lex.europa.eu/eli/dir/2022/2555) -- EU cybersecurity directive

## Related Agents

- [CER Compliance Commander](/agents/cer-compliance-commander/) -- Coordinates compliance evidence collection from the audit trail for NIS2, GDPR, and SOC 2 regulatory reporting
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures all audit events carry complete provenance metadata and tamper-proof hash chain integrity
- [GitLab Security Specialist Agent](/agents/gitlab-security-specialist-agent/) -- Reviews audit trail access controls and cryptographic hash chain implementation for security vulnerabilities

## Related Capabilities

- [NABLA Axioms](/capabilities/nabla-axioms/) -- Provenance mandatory axiom ensures every audit event is traceable to its source with complete attribution
- [Trinity Gate](/capabilities/trinity-gate/) -- Structural and logical consistency verification of the hash chain ensuring tamper-evident audit log integrity
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Synthesizes audit trail data into compliance reports across multiple regulatory frameworks

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)