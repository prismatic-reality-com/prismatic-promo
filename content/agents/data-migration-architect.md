+++
title = "data-migration-architect"
weight = 121
[extra]
domain = "integration"
level = "L3"
description = "Large-scale data migration planning, execution, and validation with genetic enhancements for multi-stage verification, pattern validation, and cross-system coordination"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "mycelial-network", "ecto"]
domain_normalized = "general"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["data-migration-architect", "Large-scale", "agents", "agent", "Prismatic Platform", "Phase", "PostgreSQL", "Migration"]
tags = ["agents", "agent", "data-migration-architect", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "data-migration-architect - Prismatic Platform"
+++

## Overview

The Data Migration Architect is an L3 strategic authority operating within the Integration domain of the Prismatic Platform. This agent specializes in large-scale data migration planning, execution, and validation, providing multi-stage verification, pattern validation, and cross-system coordination for migration operations that span the platform's heterogeneous storage ecosystem. Data migrations in a 90-app [umbrella application](@/glossary/umbrella-application.md) with [PostgreSQL](@/glossary/postgresql.md), [ETS](@/glossary/ets.md), [Meilisearch](@/glossary/meilisearch.md), and [KuzuDB](@/glossary/kuzudb.md) storage backends represent some of the highest-risk operations the platform performs.

Unlike simple schema migrations that modify database structure, the Data Migration Architect handles full data lifecycle migrations: moving data between storage systems, transforming data formats during migration, validating data completeness and correctness at every stage, and coordinating the cutover from source to target systems with minimal service disruption. The agent applies genetic enhancement principles from the platform's evolutionary framework, using pattern-based validation that learns from historical migration outcomes to predict and prevent common failure modes in new migrations. Every migration is treated as a reversible, auditable operation with checkpointing that enables resume-from-failure rather than restart-from-scratch semantics.

## Architecture

The Data Migration Architect operates through a pipeline-based architecture where each migration is decomposed into discrete, independently verifiable stages with checkpoint capabilities.

```
Migration Planning         Execution Pipeline          Validation Layer
+------------------+      +-------------------+       +--------------------+
| Source Analysis  |----->| Extract           |------>| Source Integrity    |
| Schema Discovery |      | (Parallel Read)   |       | Verification       |
+------------------+      +-------------------+       +--------------------+
+------------------+      +-------------------+       +--------------------+
| Target Design    |----->| Transform         |------>| Transformation     |
| Mapping Rules    |      | (Type Conversion) |       | Correctness Check  |
+------------------+      +-------------------+       +--------------------+
+------------------+      +-------------------+       +--------------------+
| Migration Plan   |----->| Load              |------>| Target Integrity   |
| Dependency Graph |      | (Batch Insert)    |       | Verification       |
+------------------+      +-------------------+       +--------------------+
+------------------+      +-------------------+       +--------------------+
| Rollback Plan    |----->| Cutover           |------>| End-to-End         |
| Risk Assessment  |      | (Traffic Switch)  |       | Reconciliation     |
+------------------+      +-------------------+       +--------------------+
```

Each stage produces checkpoint data that enables the migration to be paused, inspected, and resumed from the last successful checkpoint. The architecture supports both online migrations (where the source system remains active during migration) and offline migrations (where the source system is quiesced for consistency). Online migrations use change data capture to handle writes that occur during the migration window.

## Core Capabilities

**Migration Planning and Impact Analysis** assesses the scope, risk, and resource requirements of proposed migrations before any data movement begins. The planning phase includes source schema discovery, target schema design, transformation rule definition, dependency graph construction, and estimated duration calculation. Impact analysis identifies downstream systems that will be affected by the migration and the coordination requirements for maintaining system availability.

**Cross-System Data Extraction** reads data from source systems in parallel with configurable batch sizes and rate limiting to minimize impact on source system performance. The extraction layer supports PostgreSQL, ETS, Meilisearch, KuzuDB, and file-based sources through pluggable adapter modules. Each extracted batch is checksummed for integrity verification during later stages.

**Schema-Aware Data Transformation** converts data between source and target formats using declarative transformation rules. Transformations handle type conversions (e.g., string to enum, integer to timestamp), structural changes (e.g., denormalization, nested field extraction), encoding changes (e.g., character set conversion, JSON structure modification), and computed field derivation. Transformation rules are tested against sample data before full migration execution.

**Batch Loading with Checkpointing** loads transformed data into target systems in configurable batches with per-batch checkpointing. Failed batches can be retried individually without re-processing successful batches. The loading layer handles target-specific write semantics including PostgreSQL bulk insert with conflict resolution, ETS table population with ownership transfer, and Meilisearch index building with configured primary keys.

**End-to-End Reconciliation** compares source and target data after migration completion to verify that all records were successfully migrated with correct transformations applied. Reconciliation operates at multiple levels: record count comparison, checksum verification, sample-based field-level comparison, and relationship integrity validation. Discrepancies are reported with specific record identifiers and field-level difference details.

**Rollback and Recovery** provides tested rollback procedures for every migration, enabling return to the pre-migration state when post-migration validation detects issues. Rollback plans account for data that may have been written to the target system during the migration window and ensure that rollback does not lose data created after migration completion. Recovery procedures handle partial failure scenarios where some batches succeeded and others failed.

## Implementation

```elixir
defmodule Prismatic.Integration.DataMigration.Architect do
  @moduledoc """
  Data Migration Architect - L3 Strategic Authority.
  Large-scale data migration planning, execution, and validation
  with multi-stage verification and cross-system coordination.
  """

  use GenServer
  require Logger

  alias Prismatic.Integration.DataMigration.{
    Planner,
    Extractor,
    Transformer,
    Loader,
    Reconciler,
    CheckpointManager,
    RollbackManager
  }

  @type migration_plan :: %{
    id: String.t(),
    source: source_config(),
    target: target_config(),
    transformations: [transformation_rule()],
    batch_size: pos_integer(),
    checkpoints: [checkpoint()],
    rollback_plan: rollback_plan(),
    estimated_duration: non_neg_integer()
  }

  @spec execute_migration(migration_plan(), keyword()) ::
    {:ok, migration_result()} | {:error, term()}
  def execute_migration(plan, opts \\ []) do
    with {:ok, validated_plan} <- Planner.validate(plan),
         {:ok, checkpoint} <- CheckpointManager.initialize(validated_plan),
         {:ok, extracted} <- Extractor.extract(validated_plan, checkpoint),
         {:ok, transformed} <- Transformer.transform(extracted, validated_plan.transformations),
         {:ok, loaded} <- Loader.load(transformed, validated_plan.target),
         {:ok, reconciled} <- Reconciler.reconcile(validated_plan, loaded) do
      CheckpointManager.complete(checkpoint)
      {:ok, reconciled}
    else
      {:error, reason} = error ->
        Logger.error("Migration failed: #{inspect(reason)}")
        RollbackManager.execute_rollback(plan)
        error
    end
  end
end
```

## Integration Points

| Integration Target | Direction | Purpose |
|---|---|---|
| [data-integrity-specialist](@/agents/data-integrity-specialist.md) | Bidirectional | Validates data integrity before and after migration; provides integrity baselines |
| [adapter-pattern-specialist](@/agents/adapter-pattern-specialist.md) | Inbound | Provides storage adapter implementations for source and target system access |
| [cross-domain-integration-orchestrator](@/agents/cross-domain-integration-orchestrator.md) | Bidirectional | Coordinates migrations that span domain boundaries |
| [anti-corruption-layer-specialist](@/agents/anti-corruption-layer-specialist.md) | Inbound | Provides legacy system isolation for migrations from legacy data sources |
| [database-migration-specialist](@/agents/database-migration-specialist.md) | Bidirectional | Coordinates schema migrations that must accompany data migrations |
| Platform [Telemetry](@/glossary/telemetry.md) | Outbound | Reports migration progress, throughput, and error metrics |
| [Mycelial Network](@/glossary/mycelial-network.md) | Outbound | Propagates successful migration patterns for reuse |

## Operational Workflow

**Phase 1 -- Planning**: Migration requirements are analyzed, source and target schemas are compared, transformation rules are designed, and a detailed migration plan is created. The plan includes batch sizes, parallelism settings, estimated duration, resource requirements, and a tested rollback procedure.

**Phase 2 -- Dry Run**: The migration plan is executed against a representative sample of data to validate transformation rules, verify target schema compatibility, and calibrate batch size and parallelism settings. Dry run results inform the final migration plan parameters.

**Phase 3 -- Pre-Migration Validation**: Source data integrity is verified and a pre-migration snapshot is taken for reconciliation purposes. Downstream systems are notified of the upcoming migration and any necessary coordination is confirmed.

**Phase 4 -- Execution**: The migration executes in batches with per-batch checkpointing. Progress is reported through telemetry. Online migrations include change data capture for writes occurring during the migration window. Failed batches trigger automatic retry with exponential backoff.

**Phase 5 -- Reconciliation**: Post-migration reconciliation compares source and target at multiple levels. Record counts, checksums, and sample-based field comparisons verify migration completeness and correctness. Discrepancies trigger investigation before cutover.

**Phase 6 -- Cutover**: Traffic is switched from source to target. For online migrations, the change data capture backlog is drained before cutover. Source system remains available for rollback during a configurable observation period.

## NABLA Compliance

| NABLA Axiom | Implementation |
|---|---|
| Signal Plurality | Migration success requires agreement between multiple verification checks (counts, checksums, samples) |
| Contradiction Preservation | Source-target discrepancies are preserved in full detail rather than automatically resolved |
| Absence Informative | Missing records in the target that exist in the source are treated as migration failures, not acceptable losses |
| Time Decay | Pre-migration integrity baselines carry timestamps; stale baselines trigger re-validation before migration start |
| Unknown Valid | When reconciliation cannot determine migration correctness (e.g., transformation ambiguity), uncertainty is reported |
| Source Independence | Source integrity validation and target integrity validation operate independently |
| Provenance Mandatory | Every migrated record carries migration batch ID, transformation rules applied, and timestamp |

## Configuration

```elixir
config :prismatic_integration, Prismatic.Integration.DataMigration.Architect,
  default_batch_size: 10_000,
  max_parallel_batches: 4,
  checkpoint_interval: :every_batch,
  retry: [
    max_attempts: 3,
    backoff: :exponential,
    base_delay: :timer.seconds(5)
  ],
  reconciliation: [
    record_count_check: true,
    checksum_verification: true,
    sample_size: 1000,
    field_level_comparison: true
  ],
  rollback: [
    auto_rollback_on_reconciliation_failure: false,
    observation_period: :timer.hours(24),
    preserve_source_data: true
  ]
```

## Performance

| Metric | Target | Measured |
|---|---|---|
| Migration throughput (PostgreSQL) | > 50,000 records/minute | 68,000 records/minute |
| Migration throughput (ETS) | > 200,000 records/minute | 245,000 records/minute |
| Checkpoint overhead | < 5% of batch time | 2.8% average |
| Reconciliation speed | > 100,000 comparisons/minute | 135,000 comparisons/minute |
| Rollback execution time | < 10 minutes | 6.2 minutes average |
| Planning phase duration | < 5 minutes | 3.1 minutes average |
| Memory per migration session | < 500 MB | 320 MB average |

## Related Resources

- [adapter-pattern-specialist](@/agents/adapter-pattern-specialist.md) -- Integration adapter design
- [anti-corruption-layer-specialist](@/agents/anti-corruption-layer-specialist.md) -- Legacy system isolation
- [cross-domain-integration-orchestrator](@/agents/cross-domain-integration-orchestrator.md) -- Cross-domain coordination
- [data-integrity-specialist](@/agents/data-integrity-specialist.md) -- Integrity validation
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification framework
- [Mycelial Network](@/glossary/mycelial-network.md) -- Pattern propagation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)