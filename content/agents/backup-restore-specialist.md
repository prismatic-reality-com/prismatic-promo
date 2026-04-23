+++
title = "backup-restore-specialist"
weight = 50
[extra]
domain = "infrastructure"
level = "L3"
description = "Database backup strategies and disaster recovery expert ensuring data protection across all platform persistence layers"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.1.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["backup-restore-specialist", "Database", "agents", "agent", "Prismatic Platform", "Infrastructure"]
tags = ["agents", "agent", "backup-restore-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "backup-restore-specialist - Prismatic Platform"
+++

## Overview

The Backup Restore Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent manages comprehensive backup strategies and [disaster recovery](/glossary/disaster-recovery/) procedures for all platform data stores, ensuring that the system can recover from data loss, corruption, or catastrophic failure with minimal downtime and zero data loss within defined recovery point objectives (RPO). The specialist designs, implements, tests, and maintains backup pipelines that protect [PostgreSQL](/glossary/postgresql/) databases, [ETS](/glossary/ets/) state snapshots, configuration files, and [AIAD](/glossary/aiad/) agent specifications.

Backup and disaster recovery are insurance against the worst-case scenario. The Backup Restore Specialist ensures that this insurance is always valid by scheduling regular backup verification, executing periodic recovery drills, and maintaining documented runbooks for every recovery scenario. In an intelligence platform handling compliance records and security assessments, the ability to demonstrate verified backup integrity is itself a compliance requirement under [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) frameworks.

A backup that has never been tested is not a backup -- it is a hope, and hope is not a strategy. This principle drives the specialist's verification-first approach where every backup is tested through automated restore-and-validate cycles before being considered valid.

## Operational Domain

The agent operates across all data persistence layers within the platform. For PostgreSQL, it manages automated backup schedules using pg_dump for logical backups and WAL archiving for point-in-time recovery. For ETS tables containing runtime agent state, it coordinates periodic state snapshots to persistent storage. For configuration and specification files, it ensures that git-based version control provides an additional recovery vector beyond traditional backups. For KuzuDB graph databases, it manages graph snapshot exports that capture entity relationships in a recoverable format.

## Key Capabilities

- **Automated backup scheduling** managing regular PostgreSQL logical backups, WAL continuous archiving, and ETS state snapshots with configurable retention policies and storage rotation

- **Point-in-time recovery** enabling precise recovery to any moment using WAL-based continuous archiving, allowing restoration to the exact second before a failure or corruption event

- **Backup integrity verification** automatically testing backup files through periodic restore-and-validate cycles that confirm recoverability before a disaster actually occurs

- **Disaster recovery planning** maintaining documented recovery procedures for every failure scenario, from single-table corruption to complete infrastructure loss

- **Recovery drill execution** conducting scheduled recovery tests that exercise the full restore pipeline, measuring actual recovery time against RTO targets

- **Cross-region backup replication** ensuring backup copies exist in geographically separate locations to protect against regional infrastructure failures

## Backup Architecture

The Backup Restore Specialist manages a multi-layer backup architecture that provides defense in depth against data loss.

### PostgreSQL Backup Layer

PostgreSQL backups operate on two complementary strategies.

**Logical Backups** using pg_dump produce portable, human-readable backup files that can restore individual tables, schemas, or entire databases. These backups run on a configurable schedule (default: daily) with retention policies that maintain 7 daily, 4 weekly, and 12 monthly backup copies. Logical backups serve as the primary recovery mechanism for selective data restoration.

**WAL Continuous Archiving** captures every database change in sequence, enabling point-in-time recovery (PITR) to any moment within the WAL retention window. WAL archiving provides recovery granularity measured in seconds rather than the hours between logical backups. This layer is critical for minimizing data loss in failure scenarios: the RPO for WAL-based recovery approaches zero under normal operating conditions.

### ETS State Snapshot Layer

ETS tables containing runtime agent state, fitness scores, and evolutionary generation data are periodically snapshotted to persistent storage. Snapshots use Erlang's `:ets.tab2file/2` for atomic capture and `:ets.file2tab/1` for restoration. Snapshot frequency is configurable per table based on the table's change rate and criticality.

### Configuration and Specification Layer

AIAD agent specifications, platform configuration files, and operational parameters are protected through git-based version control as the primary backup mechanism, supplemented by periodic archive snapshots for defense in depth. This layer enables precise configuration rollback to any historical state.

### Graph Database Layer

KuzuDB graph snapshots capture the full entity relationship graph including nodes, edges, and property data. Graph backups support both full snapshot export and incremental change capture for efficient storage utilization.

## Recovery Procedures

The specialist maintains documented recovery procedures for every anticipated failure scenario.

| Scenario | Recovery Method | RTO Target | RPO Target |
|----------|----------------|-----------|-----------|
| Single table corruption | Logical restore from pg_dump | < 15 min | < 24 hours |
| Database corruption | WAL PITR to pre-corruption state | < 30 min | < 1 second |
| ETS table loss | Rebuild from persistent snapshot | < 5 min | < snapshot interval |
| Configuration corruption | Git rollback to known-good state | < 2 min | Zero (versioned) |
| Complete database loss | Full restore from logical backup + WAL replay | < 2 hours | < 1 second |
| Infrastructure failure | Cross-region restore from replicated backups | < 4 hours | < 1 minute |

## Recovery Drill Program

The specialist conducts scheduled recovery drills that exercise the full restore pipeline to verify that backups are actually recoverable.

**Monthly Drills** test logical backup restoration for randomly selected databases, verifying data integrity, schema correctness, and query functionality post-restore. Results are documented as compliance evidence.

**Quarterly Drills** test WAL point-in-time recovery by restoring to a specific timestamp and validating data consistency against known-good snapshots from that point. These drills verify that the WAL archive chain is complete and continuous.

**Annual Drills** test full disaster recovery procedures including cross-region restore, infrastructure reprovisioning, and complete platform recovery from backup. These drills measure actual RTO against defined targets and identify gaps in recovery procedures.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to mandate backup policies, schedule recovery drills, and halt operations if backup integrity is compromised.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [aiad-backup-manager](/agents/aiad-backup-manager/) | Coordinates AIAD specification backup operations specifically | Infrastructure |
| [data-integrity-specialist](/agents/data-integrity-specialist/) | Validates data integrity during backup creation and restore verification | Infrastructure |
| [database-core-specialist](/agents/database-core-specialist/) | Provides database-level expertise for PostgreSQL backup optimization | Infrastructure |
| [autonomous-healing-commander](/agents/autonomous-healing-commander/) | Coordinates backup restoration during Level 4-5 healing scenarios | Supreme |

## Performance Metrics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Backup success rate | 99.9% | > 99.5% | Percentage of scheduled backups completing successfully |
| Verification pass rate | 100% | > 99% | Percentage of backups passing integrity verification |
| WAL archive completeness | 100% | 100% | WAL chain continuity without gaps |
| Monthly drill pass rate | 100% | 100% | Recovery drill success rate |
| Logical backup RPO | < 24 hours | < 24 hours | Maximum data loss for logical backup recovery |
| WAL PITR RPO | < 1 second | < 5 seconds | Maximum data loss for WAL-based recovery |

## Enforcement

The Backup Restore Specialist operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Backup schedules are non-negotiable and must execute without gaps. Every backup must be integrity-verified before being considered valid. Recovery drills are mandatory and their results are documented as compliance evidence. A backup that has never been tested is not a backup. Failed backup verifications trigger immediate investigation and remediation. Recovery drill failures are treated as production incidents requiring root cause analysis and corrective action. The [NABLA Infinity](/glossary/nabla-infinity/) [Provenance Mandatory](/glossary/provenance-mandatory/) axiom requires complete audit trails for all backup operations, ensuring full traceability from backup creation through verification through restoration.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)