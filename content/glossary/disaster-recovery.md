+++
title = "Disaster Recovery"
weight = 11
[extra]
category = "security"
description = "Strategies and procedures for restoring systems and data after catastrophic failures"
related_terms = ["incident-response", "fault-tolerance", "blue-green-deployment", "postgresql", "self-healing"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1347
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Disaster", "Recovery", "Strategies", "glossary", "security", "Prismatic Platform", "Seconds"]
tags = ["glossary", "security", "disaster-recovery", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Disaster Recovery - Prismatic Platform"
+++

## Definition

Disaster Recovery (DR) encompasses the strategies, policies, procedures, and technical mechanisms for restoring critical systems, data, and operations after catastrophic events. These events include hardware failures, data center outages, data corruption, ransomware attacks, natural disasters, and cascading software failures. DR planning defines two fundamental metrics: Recovery Time Objective (RTO), the maximum acceptable duration of downtime before business operations are critically impacted, and Recovery Point Objective (RPO), the maximum acceptable amount of data loss measured in time. Together, RTO and RPO form the contractual foundation of any disaster recovery strategy, dictating the required investment in backup frequency, replication topology, and failover automation.

The discipline extends beyond simple backup and restore. Modern disaster recovery encompasses automated failover mechanisms, geographic redundancy, data replication strategies, runbook automation, chaos engineering for DR validation, and continuous recovery testing. The goal is not merely to recover from disasters but to ensure that recovery is predictable, tested, and achievable within defined time constraints regardless of the failure mode.

## Overview

Disaster recovery exists within a broader continuity spectrum that ranges from high-availability design (preventing outages) through incident response (managing active incidents) to full disaster recovery (restoring from catastrophic loss). The relationship between these disciplines is hierarchical: high availability reduces the frequency of incidents requiring DR activation, incident response manages events before they escalate to disaster-level impact, and DR provides the ultimate safety net when prevention and management fail.

The evolution of DR practices mirrors the evolution of computing infrastructure. In the mainframe era, DR meant offsite tape storage and cold standby facilities. The client-server era introduced warm standby with periodic data replication. The cloud era enabled hot standby with real-time replication and sub-minute failover. Modern cloud-native architectures, particularly those built on the BEAM virtual machine, introduce a new paradigm where application-level fault tolerance (supervision trees, process isolation, let-it-crash philosophy) handles the majority of failure modes that previously required infrastructure-level DR intervention.

| DR Tier | Description | RTO | RPO | Cost |
|---------|-------------|-----|-----|------|
| **Tier 0** | No DR capability | Undefined | Undefined | None |
| **Tier 1** | Offsite backup (tape/cold storage) | Days | Hours to days | Low |
| **Tier 2** | Hot backup site with periodic sync | Hours | Minutes to hours | Medium |
| **Tier 3** | Active-passive with real-time replication | Minutes | Seconds | High |
| **Tier 4** | Active-active multi-region | Seconds | Near-zero | Very high |
| **Tier 5** | Self-healing with automatic failover | Sub-second | Zero (synchronous) | Highest |

## Technical Details

### Recovery Strategies

Disaster recovery strategies are selected based on the intersection of RTO/RPO requirements, budget constraints, and system architecture. The primary strategies include:

**Backup and Restore**: The simplest DR strategy involves periodic full and incremental backups stored in geographically separate locations. Recovery involves provisioning new infrastructure and restoring from the most recent backup. This approach has the longest RTO (hours to days) and RPO (determined by backup frequency) but the lowest cost and operational complexity.

**Pilot Light**: A minimal version of the production environment runs continuously in a secondary region. Core infrastructure (database replicas, base AMIs, DNS configuration) is maintained in a ready-to-scale state. During a disaster, the pilot light environment is scaled up to handle production traffic. RTO is typically 10-30 minutes.

**Warm Standby**: A scaled-down but fully functional copy of the production environment runs in a secondary region, handling a portion of traffic or serving as a read replica. Failover involves scaling up the secondary environment and redirecting traffic. RTO ranges from minutes to under an hour.

**Multi-Region Active-Active**: The application runs simultaneously across multiple geographic regions, with traffic distributed by global load balancers. Each region can handle the full production load independently. Data is replicated synchronously or asynchronously between regions. This provides the lowest RTO (seconds) and near-zero RPO but requires the most sophisticated application architecture.

### Data Replication Topologies

| Topology | Mechanism | RPO | Latency Impact | Complexity |
|----------|-----------|-----|----------------|------------|
| **Synchronous replication** | Write confirmed after all replicas acknowledge | Zero | High (waits for slowest replica) | Medium |
| **Asynchronous replication** | Write confirmed after primary only | Seconds to minutes | None | Low |
| **Semi-synchronous** | Write confirmed after N of M replicas | Near-zero | Medium | High |
| **Log shipping** | WAL/binlog shipped periodically | Minutes | None | Low |
| **Streaming replication** | Continuous WAL streaming | Seconds | Minimal | Medium |

### PostgreSQL Continuous Archiving

PostgreSQL's Write-Ahead Log (WAL) provides the foundation for point-in-time recovery (PITR):

```elixir
defmodule PrismaticBackup.WALManager do
  @moduledoc """
  Manages PostgreSQL WAL archiving for point-in-time recovery.
  Monitors archive status and triggers alerts on replication lag.
  """

  use GenServer

  @archive_check_interval :timer.minutes(5)

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    state = %{
      archive_path: Keyword.fetch!(opts, :archive_path),
      max_lag_seconds: Keyword.get(opts, :max_lag_seconds, 300),
      last_archived_lsn: nil
    }

    schedule_check()
    {:ok, state}
  end

  @impl GenServer
  def handle_info(:check_archive, state) do
    case check_replication_lag(state) do
      {:ok, lag_seconds} when lag_seconds > state.max_lag_seconds ->
        :telemetry.execute(
          [:prismatic, :backup, :replication_lag_exceeded],
          %{lag_seconds: lag_seconds},
          %{threshold: state.max_lag_seconds}
        )

      {:ok, _lag_seconds} ->
        :ok

      {:error, reason} ->
        :telemetry.execute(
          [:prismatic, :backup, :check_failed],
          %{},
          %{reason: reason}
        )
    end

    schedule_check()
    {:noreply, state}
  end

  defp check_replication_lag(state) do
    query = "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))"

    case Ecto.Adapters.SQL.query(PrismaticStorage.Repo, query, []) do
      {:ok, %{rows: [[lag]]}} -> {:ok, trunc(lag)}
      {:error, reason} -> {:error, reason}
    end
  end

  defp schedule_check do
    Process.send_after(self(), :check_archive, @archive_check_interval)
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements disaster recovery through multiple complementary layers, each addressing different failure modes and recovery requirements:

### Infrastructure Layer (Fly.io)

Fly.io provides the infrastructure foundation for geographic failover. The platform deploys to multiple regions with automatic health checking and traffic routing. When a region becomes unhealthy, Fly.io routes traffic to surviving regions within seconds. The `fly.toml` configuration declares the desired deployment topology:

```elixir
defmodule PrismaticInfra.HealthCheck do
  @moduledoc """
  Health check endpoint for Fly.io load balancer integration.
  Reports system readiness including database connectivity,
  ETS table availability, and critical process liveness.
  """

  @spec check() :: {:ok, map()} | {:error, map()}
  def check do
    checks = %{
      database: check_database(),
      ets_tables: check_ets_tables(),
      critical_processes: check_critical_processes(),
      disk_space: check_disk_space()
    }

    if Enum.all?(Map.values(checks), &(&1 == :ok)) do
      {:ok, checks}
    else
      {:error, checks}
    end
  end

  defp check_database do
    case Ecto.Adapters.SQL.query(PrismaticStorage.Repo, "SELECT 1", []) do
      {:ok, _} -> :ok
      {:error, _} -> :degraded
    end
  end

  defp check_ets_tables do
    required_tables = [:agent_registry, :quality_dna, :session_cache]

    if Enum.all?(required_tables, &(:ets.info(&1) != :undefined)) do
      :ok
    else
      :degraded
    end
  end

  defp check_critical_processes do
    critical = [PrismaticAgents.Registry, PrismaticSafety.QualityFloorGuardian]

    if Enum.all?(critical, &(Process.whereis(&1) != nil)) do
      :ok
    else
      :degraded
    end
  end

  defp check_disk_space do
    case System.cmd("df", ["-P", "/"], stderr_to_stdout: true) do
      {output, 0} ->
        usage = parse_disk_usage(output)
        if usage < 90, do: :ok, else: :degraded

      _ ->
        :unknown
    end
  end
end
```

### Application Layer (BEAM/OTP)

The BEAM virtual machine provides application-level disaster recovery through supervision trees and the let-it-crash philosophy. Process crashes are isolated and automatically recovered by supervisors. This handles the vast majority of transient failures without any infrastructure-level intervention:

| Failure Mode | Recovery Mechanism | RTO | Automated |
|-------------|-------------------|-----|-----------|
| Process crash | Supervisor restart | Microseconds | Yes |
| Node partition | Horde redistribution | Seconds | Yes |
| Database timeout | Circuit breaker + retry | Seconds | Yes |
| ETS table loss | Heir process + rebuild | Milliseconds | Yes |
| Full node crash | Fly.io region failover | Seconds | Yes |
| Data corruption | PostgreSQL PITR | Minutes | Manual trigger |
| Region outage | Multi-region failover | Seconds | Yes |

### Quality State Recovery

The platform persists quality state through multiple mechanisms to survive catastrophic restarts:

- **Quality DNA**: Persisted to `.claude/quality-dna/current-state.json` for cross-session continuity
- **Session Context**: Saved to `.claude/session-context/` with structured summaries
- **Git Repository**: All code and configuration version-controlled with full history
- **ETS Snapshots**: Critical ETS tables periodically serialized to disk

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| **Manual DR** | Simple, low cost | Slow RTO, human error prone | Small systems |
| **Cloud-native DR (Fly.io)** | Fast failover, automated | Vendor dependency | Web applications |
| **BEAM Supervision** | Sub-second recovery, built-in | Application-level only | Elixir/Erlang systems |
| **Kubernetes DR** | Declarative, portable | Complex, resource heavy | Container orchestration |
| **Database Replication** | Strong consistency options | Database-specific | Data-centric systems |
| **Multi-cloud DR** | No vendor lock-in | Highest complexity | Enterprise critical |

## Best Practices

1. **Define RTO/RPO Before Architecture**: Recovery objectives must drive technical decisions, not the reverse. The Prismatic Platform targets sub-minute RTO for application failures and under-30-minute RTO for data-level recovery.

2. **Test Recovery Regularly**: Untested DR plans are unreliable. Regular chaos engineering exercises validate that failover mechanisms work as designed. The platform's SEADF self-healing framework provides continuous micro-validation of recovery paths.

3. **Automate Everything**: Manual recovery steps are error-prone under stress. Every recovery procedure should be automated and executable with a single command or triggered automatically by health monitoring.

4. **Layer Recovery Mechanisms**: No single recovery mechanism covers all failure modes. The platform layers BEAM supervision (process crashes), Fly.io health checks (node failures), PostgreSQL replication (data corruption), and Git version control (code/config recovery).

5. **Monitor Recovery Readiness**: Replication lag, backup freshness, and failover test results should be continuously monitored. Alert on degraded DR readiness, not just on actual failures.

6. **Document Runbooks**: Even with automation, human-in-the-loop procedures need clear, tested runbooks. Include decision trees for failure classification and escalation paths.

## Use Cases

- **Database Corruption Recovery**: PostgreSQL PITR restores the database to any point in time within the WAL retention window, recovering from accidental deletions, schema migration failures, or data corruption.

- **Region-Level Outage**: Fly.io multi-region deployment enables automatic traffic rerouting when an entire availability zone or region becomes unavailable, maintaining platform availability.

- **Cascading Process Failures**: OTP supervision trees contain and recover from cascading failures. The Quality Floor Guardian monitors system health and triggers EMERGENCY-level responses when fitness drops below thresholds.

- **Ransomware/Security Breach**: Immutable infrastructure (Docker images rebuilt from source, Git-versioned configuration) enables clean environment reconstruction without trusting potentially compromised running systems.

- **Quality State Recovery**: Quality DNA persistence and session context files enable the platform to resume from its last known good state after complete session restarts, preserving evolutionary progress across generations.

## Related Concepts

- [Incident Response](/glossary/incident-response/) - Immediate response procedures preceding disaster recovery activation
- [Fault Tolerance](/glossary/fault-tolerance/) - Design property that reduces the frequency of disaster recovery activation
- [Blue-Green Deployment](/glossary/blue-green-deployment/) - Deployment strategy enabling instant environment rollback
- [Self-Healing](/glossary/self-healing/) - Automated recovery for non-catastrophic degradation via SEADF
- [PostgreSQL](/glossary/postgresql/) - Primary database with WAL-based point-in-time recovery
- [Supervisor](/glossary/supervisor/) - OTP behaviour providing automatic process restart
- [Let It Crash](/glossary/let-it-crash/) - Philosophy enabling rapid recovery through supervised restarts
- [Quality DNA](/glossary/quality-dna/) - Cross-session state persistence surviving platform restarts
- [Docker](/glossary/docker/) - Immutable container images enabling clean environment reconstruction
- [Fly.io](/glossary/fly-io/) - Deployment platform providing multi-region failover infrastructure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)