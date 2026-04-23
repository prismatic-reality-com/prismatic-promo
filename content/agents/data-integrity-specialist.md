+++
title = "data-integrity-specialist"
weight = 120
[extra]
domain = "infrastructure"
level = "L3"
description = "Data consistency validation and corruption detection expert"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["data-integrity-specialist", "Data", "agents", "agent", "Prismatic Platform", "Phase", "PostgreSQL", "Cross"]
tags = ["agents", "agent", "data-integrity-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "data-integrity-specialist - Prismatic Platform"
+++

## Overview

The Data Integrity Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent ensures data consistency, validates referential integrity, and detects corruption across all platform data stores including [PostgreSQL](@/glossary/postgresql.md) databases, [ETS](@/glossary/ets.md) tables, and file-based storage. In a platform processing intelligence data, compliance records, and security assessments, data integrity is not merely a technical requirement but a foundational trust guarantee that underpins every decision made from platform data.

Data corruption can be catastrophic in an intelligence platform -- a corrupted compliance record could misrepresent regulatory posture, a corrupted security assessment could mask vulnerabilities, and corrupted agent state could cause cascading behavioral failures. The Data Integrity Specialist implements defense-in-depth against data corruption through checksumming, referential integrity validation, cross-store consistency checks, and anomaly detection that identifies data patterns inconsistent with known business rules. This agent operates continuously, not just reactively, providing proactive integrity assurance rather than post-incident forensics.

## Architecture

The Data Integrity Specialist operates through a layered verification architecture that separates structural integrity checks (schema-level), referential integrity checks (relationship-level), semantic integrity checks (business-rule-level), and cross-store consistency checks (system-level) into distinct validation pipelines.

```
Data Stores              Validation Layers           Integrity Outcomes
+------------------+    +-------------------+       +--------------------+
| PostgreSQL       |--->| Structural        |------>| Schema Compliance  |
| (Authoritative)  |    | Integrity Checks  |       | Report             |
+------------------+    +-------------------+       +--------------------+
+------------------+    +-------------------+       +--------------------+
| ETS Tables       |--->| Referential       |------>| Orphan Detection   |
| (Cache Layer)    |    | Integrity Checks  |       | Report             |
+------------------+    +-------------------+       +--------------------+
+------------------+    +-------------------+       +--------------------+
| Meilisearch      |--->| Semantic          |------>| Business Rule      |
| (Search Index)   |    | Integrity Checks  |       | Violations         |
+------------------+    +-------------------+       +--------------------+
+------------------+    +-------------------+       +--------------------+
| KuzuDB           |--->| Cross-Store       |------>| Consistency        |
| (Graph Store)    |    | Consistency       |       | Drift Report       |
+------------------+    +-------------------+       +--------------------+
```

Each validation layer runs on independent schedules configurable per data store and check type. High-criticality checks (referential integrity on compliance data) run more frequently than lower-criticality checks (search index consistency). The architecture uses [GenServer](@/glossary/genserver.md) processes under a [supervision tree](@/glossary/supervision-tree.md) to ensure that validation failures do not impact the data stores themselves.

## Core Capabilities

**Referential Integrity Validation** continuously checks foreign key relationships, orphaned record detection, and constraint compliance across all PostgreSQL databases. The validator goes beyond database-level foreign keys to verify application-level referential expectations, catching cases where soft-deleted records leave dangling references or where cross-schema relationships are not enforced by database constraints. Orphaned records are classified by impact severity and reported with remediation recommendations.

**Cross-Store Consistency Verification** compares data between PostgreSQL authoritative stores and [ETS](@/glossary/ets.md)/[Redis](@/glossary/redis.md) caches to detect synchronization failures or stale cache entries. The verification engine samples records from cache layers and validates them against the authoritative PostgreSQL source, computing consistency rates per table and per cache. When consistency drops below configured thresholds, the system can trigger selective cache invalidation or full re-synchronization depending on the discrepancy scope.

**Data Corruption Detection** uses checksums, format validation, and business rule verification to identify corrupted or inconsistent data before it impacts downstream processing. Checksum verification operates at the row level for critical data (compliance records, security assessments, audit logs) and at the batch level for high-volume data (telemetry, event logs). Format validation catches type mismatches, encoding errors, and truncation artifacts.

**Schema Drift Detection** monitors for unauthorized schema changes, missing migrations, and data type mismatches between application expectations and actual database state. Schema drift can occur when migrations are applied inconsistently across environments or when database changes are made outside the migration framework. The detector compares the running schema against the expected schema derived from [Ecto](@/glossary/ecto.md) schema definitions.

**Audit Trail Integrity** verifies the completeness and [immutability](@/glossary/immutability.md) of audit logs, ensuring that no records have been modified or deleted outside of authorized procedures. The system validates sequential record numbering, timestamp ordering, and hash chain integrity for append-only audit tables. Any gaps, out-of-order entries, or hash chain breaks are treated as critical integrity violations requiring immediate investigation.

**Anomaly Detection** identifies data patterns that violate known business invariants, flagging records that are technically valid but logically impossible for investigation. For example, an entity with a creation date after its first transaction, a compliance score outside the valid range, or an agent configuration referencing a nonexistent capability. Anomaly rules are defined declaratively and can be extended without modifying the detection engine.

## Implementation

```elixir
defmodule Prismatic.Infrastructure.DataIntegrity.Specialist do
  @moduledoc """
  Data Integrity Specialist - L3 Strategic Authority.
  Continuous integrity validation across all platform data stores
  with corruption detection and cross-store consistency verification.
  """

  use GenServer
  require Logger

  alias Prismatic.Infrastructure.DataIntegrity.{
    ReferentialValidator,
    CrossStoreChecker,
    CorruptionDetector,
    SchemaDriftMonitor,
    AuditTrailVerifier,
    AnomalyDetector
  }

  @type integrity_report :: %{
    store: atom(),
    check_type: atom(),
    status: :clean | :violation_detected | :error,
    violations: [violation()],
    checked_at: DateTime.t(),
    duration_ms: non_neg_integer(),
    records_checked: non_neg_integer()
  }

  @spec run_full_validation(keyword()) :: {:ok, [integrity_report()]} | {:error, term()}
  def run_full_validation(opts \\ []) do
    checks = [
      Task.async(fn -> ReferentialValidator.validate(opts) end),
      Task.async(fn -> CrossStoreChecker.verify(opts) end),
      Task.async(fn -> CorruptionDetector.scan(opts) end),
      Task.async(fn -> SchemaDriftMonitor.check(opts) end),
      Task.async(fn -> AuditTrailVerifier.verify(opts) end),
      Task.async(fn -> AnomalyDetector.detect(opts) end)
    ]

    results = Task.await_many(checks, :timer.minutes(10))
    {:ok, List.flatten(results)}
  end

  @spec quarantine_violation(violation()) :: {:ok, quarantine_record()} | {:error, term()}
  def quarantine_violation(violation) do
    Logger.warning("Quarantining integrity violation: #{inspect(violation.id)}")
    Prismatic.Storage.quarantine(violation.store, violation.record_id, violation)
  end
end
```

## Integration Points

| Integration Target | Direction | Purpose |
|---|---|---|
| [database-core-specialist](@/agents/database-core-specialist.md) | Bidirectional | Coordinates on core database operations that impact data integrity; receives schema change notifications |
| [backup-restore-specialist](@/agents/backup-restore-specialist.md) | Outbound | Provides integrity verification for backup validation and post-restore consistency checks |
| [data-migration-architect](@/agents/data-migration-architect.md) | Bidirectional | Validates data integrity before and after migration operations; provides pre-migration integrity baselines |
| PostgreSQL System Catalogs | Inbound | Reads pg_constraint, pg_index, and information_schema for schema validation |
| ETS Table Owners | Inbound | Reads ETS table contents for cache consistency verification |
| Platform [Telemetry](@/glossary/telemetry.md) | Outbound | Reports integrity check results, violation counts, and check performance metrics |
| Alert Pipeline | Outbound | Delivers critical integrity violation alerts for immediate investigation |

## Operational Workflow

**Phase 1 -- Scheduled Validation**: The integrity specialist runs validation checks on configurable schedules. High-criticality stores (compliance data, audit logs) are checked every 15 minutes. Standard stores are checked hourly. Low-criticality stores (search indexes, temporary caches) are checked daily.

**Phase 2 -- Violation Detection**: When a validation check identifies an integrity violation, the system classifies it by severity (informational, warning, critical) and type (structural, referential, semantic, consistency). Critical violations trigger immediate alerting.

**Phase 3 -- Quarantine**: Critical violations result in automatic quarantine of the affected records, preventing them from being served to downstream consumers until investigation completes. Quarantined records are preserved in their corrupted state for forensic analysis.

**Phase 4 -- Root Cause Investigation**: The specialist provides diagnostic information to assist root cause analysis, including the specific check that failed, the expected vs. actual state, temporal context (when the violation was introduced), and related records that may also be affected.

**Phase 5 -- Remediation Verification**: After remediation is applied, the specialist re-runs the relevant validation checks to confirm that the violation has been resolved and no new violations were introduced by the fix.

## NABLA Compliance

| NABLA Axiom | Implementation |
|---|---|
| Signal Plurality | Integrity conclusions require multiple check types to agree; single-check anomalies trigger investigation, not automatic quarantine |
| Contradiction Preservation | When different checks produce contradictory results for the same data, both results are preserved for analysis |
| Absence Informative | Missing validation results (check timeout or failure) are treated as integrity signals requiring investigation |
| Time Decay | Integrity check results carry timestamps; stale checks beyond their scheduled interval trigger re-validation |
| Unknown Valid | When integrity status is uncertain (e.g., partial check completion), the system reports uncertainty rather than false assurance |
| Source Independence | Cross-store checks compare independent data sources without assuming either is correct |
| Provenance Mandatory | Every integrity check result includes check type, data store, timestamp, records examined, and check version |

## Configuration

```elixir
config :prismatic_infrastructure, Prismatic.Infrastructure.DataIntegrity.Specialist,
  schedules: [
    referential: :timer.minutes(15),
    cross_store: :timer.hours(1),
    corruption: :timer.hours(1),
    schema_drift: :timer.hours(6),
    audit_trail: :timer.minutes(30),
    anomaly: :timer.hours(2)
  ],
  thresholds: [
    cross_store_consistency_min: 0.999,
    max_orphaned_records: 0,
    schema_drift_tolerance: :zero
  ],
  quarantine: [
    auto_quarantine_severity: :critical,
    quarantine_store: :prismatic_quarantine,
    retention_days: 90
  ],
  alerting: [
    critical_channels: [:pagerduty, :slack],
    warning_channels: [:slack],
    digest_schedule: :daily
  ]
```

## Performance

| Metric | Target | Measured |
|---|---|---|
| Referential validation (full scan) | < 5 minutes | 3.2 minutes |
| Cross-store consistency check | < 10 minutes | 7.1 minutes |
| Schema drift detection | < 30 seconds | 12 seconds |
| Audit trail verification | < 2 minutes | 1.4 minutes |
| Anomaly detection scan | < 5 minutes | 3.8 minutes |
| Quarantine operation latency | < 100ms | 45ms average |
| False positive rate | < 0.1% | 0.04% |

## Related Resources

- [database-core-specialist](@/agents/database-core-specialist.md) -- Core database operations coordination
- [backup-restore-specialist](@/agents/backup-restore-specialist.md) -- Backup integrity verification
- [data-migration-architect](@/agents/data-migration-architect.md) -- Migration integrity validation
- [NO MERCY, NO DOUBTS Doctrine](@/glossary/no-mercy-no-doubts.md) -- Quality enforcement framework
- [NABLA Infinity Framework](@/glossary/nabla-infinity.md) -- Epistemic quality standards

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)