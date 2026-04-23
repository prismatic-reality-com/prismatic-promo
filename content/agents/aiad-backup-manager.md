+++
title = "aiad-backup-manager"
weight = 21
[extra]
domain = "infrastructure"
level = "L4"
description = "AIAD agent specification backup, versioning, and disaster recovery management with semantic diffing and point-in-time restoration"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "telemetry"]
domain_normalized = "infrastructure"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 92
keywords = ["backup management", "disaster recovery", "versioned specifications", "semantic diffing", "point-in-time restoration", "AIAD ecosystem"]
tags = ["prismatic", "agent", "infrastructure", "backup", "disaster-recovery"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "aiad-backup-manager - Prismatic Platform"
+++

## Overview

The [AIAD](/glossary/aiad/) Backup Manager operates as an L4 domain specialist agent within the Infrastructure domain of the Prismatic Platform. This agent is responsible for maintaining versioned backups of all AIAD agent specifications, command definitions, pipeline configurations, and policy documents. In a platform with over 400 autonomous agents, the ability to restore any agent specification to a known-good state is a critical infrastructure capability that prevents configuration drift from causing cascading failures.

The backup strategy extends beyond simple file copying. The AIAD Backup Manager maintains a versioned history of agent specifications with semantic diff tracking, enabling operators to understand exactly what changed between versions and why. When an agent specification update causes unexpected behavior, the backup manager provides instant rollback to any previous version with full provenance tracking of who made the change and which session context was active at the time.

The disaster recovery dimension of this agent addresses a scenario unique to autonomous agent ecosystems: the possibility that an evolution cycle introduces a specification mutation that passes validation but causes operational degradation. Because the [AIAD Auto-Evolution Supreme](/agents/aiad-auto-evolution-supreme/) can modify agent specifications autonomously, the Backup Manager serves as the safety net that ensures any autonomous modification can be fully reversed. This creates a bounded-risk environment where evolution can operate with confidence, knowing that the backup layer provides guaranteed reversibility.

## Operational Domain

The Infrastructure domain encompasses all operational concerns for the Prismatic Platform including deployment, storage, monitoring, and [disaster recovery](/glossary/disaster-recovery/). The AIAD Backup Manager specifically focuses on the persistence and recoverability of the AIAD ecosystem's configuration layer, ensuring that the platform's agent intelligence can survive hardware failures, misconfigurations, and accidental deletions.

The operational scope covers three backup tiers: specification-level backups (individual `.agent.md`, `.cmd.md`, and `.policy.md` files), ecosystem-level snapshots (the complete `.aiad/` directory at a point in time), and cross-environment replication (synchronizing backup state between development, staging, and production).

## Key Capabilities

- **Versioned specification backup** with semantic diff tracking that captures every change to agent specifications, command definitions, and policy documents with full provenance metadata including session context, triggering agent, and change rationale
- **Point-in-time recovery** enabling restoration of any individual agent specification or the entire AIAD ecosystem to a specific timestamp, with dependency resolution to ensure consistency across interconnected specifications
- **Incremental backup strategies** that minimize storage overhead by capturing only changed specifications while maintaining fast full-restore capability through snapshot layering with deduplication
- **Backup integrity verification** with cryptographic checksums (SHA-256) and periodic restore testing that validates backup completeness without requiring actual disaster recovery activation
- **Cross-environment synchronization** supporting backup replication across development, staging, and production environments with environment-specific configuration masking to prevent credential leakage
- **Automated pre-operation backup triggers** creating backup checkpoints before any potentially destructive operation: deployment, hot reload, specification evolution, or ecosystem-wide updates

## Technical Architecture

The Backup Manager is implemented as a [GenServer](/glossary/genserver/) process within the `prismatic_agents` [supervision tree](/glossary/supervision-tree/). It maintains an in-memory index of backup metadata in [ETS](/glossary/ets/) and stores backup artifacts on the filesystem with optional replication to external storage.

```elixir
defmodule PrismaticAgents.BackupManager do
  use GenServer

  @backup_base_path ".aiad/backups"
  @retention_days 90
  @integrity_check_interval_ms :timer.hours(4)

  def create_backup(scope, opts \\ []) do
    GenServer.call(__MODULE__, {:backup, scope, opts})
  end

  def restore(backup_id, opts \\ []) do
    GenServer.call(__MODULE__, {:restore, backup_id, opts}, :timer.minutes(5))
  end

  def verify_integrity(backup_id) do
    GenServer.call(__MODULE__, {:verify, backup_id})
  end

  @impl true
  def handle_call({:backup, scope, opts}, _from, state) do
    files = resolve_backup_scope(scope)
    checksums = compute_checksums(files)
    backup_id = store_backup(files, checksums, opts)
    emit_telemetry(:backup_created, %{id: backup_id, files: length(files)})
    {:reply, {:ok, backup_id}, update_index(state, backup_id)}
  end
end
```

The backup storage format uses a layered snapshot approach. A full snapshot captures the complete `.aiad/` directory tree with checksums for every file. Subsequent incremental snapshots capture only modified files, referencing the parent snapshot for unchanged content. Restoration reassembles the complete state from the snapshot chain, validating checksums at each layer. This approach reduces storage requirements by approximately 90% compared to full snapshots while maintaining the ability to restore any point-in-time state.

## Decision Framework

| Trigger Event | Backup Type | Scope | Retention |
|--------------|-------------|-------|-----------|
| Scheduled interval (every 4 hours) | Incremental | Changed files only | 90 days |
| Pre-deployment | Full snapshot | Entire `.aiad/` directory | 180 days |
| Pre-evolution cycle | Full snapshot | Affected specifications | 90 days |
| Manual request | Configurable | User-specified | User-specified |
| Integrity check failure | Emergency full | Entire `.aiad/` directory | Indefinite |

Restoration decisions follow the principle of minimum blast radius. When restoring a single specification, the Backup Manager resolves dependencies to identify which other specifications may need to be co-restored to maintain consistency. If an agent specification references other agents in its coordination table, restoring only the target specification while its coordination partners have evolved forward may create inconsistencies. The dependency resolution algorithm identifies the minimum set of specifications that must be co-restored and presents this to the operator for confirmation.

## Authority Level

**L4** - Domain Specialist. The Backup Manager holds focused domain authority for backup and recovery operations within the AIAD Infrastructure domain. This authority permits creating, storing, verifying, and restoring backup artifacts without requiring approval from higher-authority agents. The L4 designation constrains the agent to its specialization -- it manages backup state but does not make deployment decisions, evolution choices, or quality gate determinations.

The authority scope includes read access to all `.aiad/` specification files for backup purposes and write access to the backup storage location. Restoration operations that modify live specification files require explicit invocation rather than autonomous triggering, ensuring that the backup manager does not inadvertently overwrite intended changes.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [aiad-deployment-engine](/agents/aiad-deployment-engine/) | Deployment Partner | Triggers pre-deployment backups and validates rollback readiness |
| [aiad-verification-engine](/agents/aiad-verification-engine/) | Verification Partner | Verifies backup integrity and validates restored specifications |
| [alert-management-specialist](/agents/alert-management-specialist/) | Alert Router | Receives backup failure notifications for escalation |
| [aiad-auto-evolution-supreme](/agents/aiad-auto-evolution-supreme/) | Evolution Safety | Pre-evolution backups ensure reversibility of autonomous changes |
| [aiad-hot-reload-coordinator](/agents/aiad-hot-reload-coordinator/) | Reload Safety | Pre-reload backups protect against hot code loading failures |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Incremental backup time** | < 5s | < 10s | Time for incremental backup of changed specifications |
| **Full snapshot time** | < 30s | < 60s | Time for complete `.aiad/` directory backup |
| **Single spec restore** | < 2s | < 5s | Time to restore one specification with dependency check |
| **Full ecosystem restore** | < 2min | < 5min | Time for complete `.aiad/` ecosystem restoration |
| **Integrity check** | < 10s | < 30s | Time for full checksum verification of backup archive |
| **Storage efficiency** | > 90% dedup | > 85% | Reduction vs full snapshots through incremental layering |

## Enforcement

All backup operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No deployment may proceed without a verified backup of the current state. Backup integrity checks run on a continuous schedule (every 4 hours) and any checksum mismatch triggers immediate investigation. Backup retention policies are enforced without exception -- 90-day minimum retention for standard backups, 180-day for pre-deployment snapshots. Backup storage capacity is monitored with proactive alerting at 80% utilization, well before space exhaustion can compromise recovery capability. Every backup and restoration operation is recorded in the immutable [audit trail](/glossary/audit-trail/) with complete provenance metadata.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `mix aiad.backup create` | Create backup of specified scope (spec, ecosystem, full) | L4 |
| `mix aiad.backup restore` | Restore from backup ID with dependency resolution | L4 |
| `mix aiad.backup verify` | Verify integrity of backup archive via checksums | L4 |
| `mix aiad.backup list` | List available backup snapshots with metadata | L4 |
| `mix aiad.backup status` | Display backup health status and storage utilization | L4 |

## Related Resources

- [AIAD Standard](/capabilities/aiad-standard/) -- Specification standard defining backed-up artifacts
- [Disaster Recovery](/glossary/disaster-recovery/) -- Platform disaster recovery framework
- [AIAD Deployment Engine](/agents/aiad-deployment-engine/) -- Deployment agent consuming pre-deployment backups
- [Architecture Overview](/architecture/) -- Platform architecture including backup infrastructure
- [Applications](/apps/) -- Platform applications with backup dependencies
- [Technologies](/technologies/) -- Technology stack including storage infrastructure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)