+++
title = "source-archive-specialist"
weight = 380
[extra]
domain = "domain"
level = "L3"
description = "The Source Archive Specialist creates optimized code packages:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 137
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["source-archive-specialist", "Source", "Archive", "Specialist", "agents", "agent", "Prismatic Platform", "Tier", "Source Archive"]
tags = ["agents", "agent", "source-archive-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "source-archive-specialist - Prismatic Platform"
+++

## Overview

The Source Archive Specialist is an L3 agent operating in the **domain** domain of the Prismatic Platform. This agent creates optimized code packages, manages source code archival processes, and ensures that the platform's codebase is properly packaged for distribution, backup, and historical preservation. In a platform with 90 umbrella applications and over 2.8 million lines of code, systematic source archival is not merely a convenience but a critical operational requirement for disaster recovery, audit compliance, and knowledge preservation.

Source code archival extends beyond simple backup. The Source Archive Specialist understands the semantic structure of the codebase, creating intelligent archives that preserve not just files but their relationships, dependencies, compilation artifacts, and historical context. This enables precise point-in-time reconstruction of any version of the platform, supporting both regulatory compliance requirements and the platform's self-evolution capabilities.

This agent is part of the platform's 434-strong autonomous agent ecosystem, operating under [AIAD](@/glossary/aiad.md) standard compliance and enforcing the [NO MERCY](@/glossary/no-mercy.md) doctrine for archive integrity.

## Core Responsibilities

| Responsibility | Description | Frequency |
|---------------|-------------|-----------|
| **Code Packaging** | Create optimized release packages for deployment | Per release |
| **Archive Generation** | Generate compressed, deduplicated source archives | Daily |
| **Dependency Bundling** | Package dependencies with exact version locks | Per release |
| **Historical Snapshots** | Maintain point-in-time codebase snapshots | Weekly |
| **Integrity Verification** | Validate archive checksums and completeness | Continuous |
| **Cleanup Management** | Prune old archives according to retention policy | Monthly |
| **Audit Trail** | Maintain provenance records for all archives | Continuous |

## Archive Architecture

The Source Archive Specialist maintains a multi-tier archive architecture that balances storage efficiency with retrieval speed.

```
Tier 1: Hot Archives (Current + Last 7 days)
├── Full source packages with compiled artifacts
├── Immediately accessible for rollback
└── Stored on high-performance storage

Tier 2: Warm Archives (Last 30 days)
├── Source-only packages (no compiled artifacts)
├── Available within minutes for reconstruction
└── Stored on standard storage

Tier 3: Cold Archives (Last 365 days)
├── Compressed, deduplicated archives
├── Available within hours for reconstruction
└── Stored on archival storage

Tier 4: Deep Archives (Historical)
├── Maximum compression, minimum redundancy
├── Available within days for reconstruction
└── Stored on long-term archival storage
```

| Tier | Retention | Compression | Retrieval Time | Storage Cost |
|------|-----------|-------------|----------------|-------------|
| **Hot** | 7 days | None | Instant | High |
| **Warm** | 30 days | gzip | Minutes | Medium |
| **Cold** | 365 days | zstd (max) | Hours | Low |
| **Deep** | Indefinite | zstd + dedup | Days | Minimal |

## Technical Implementation

```elixir
defmodule PrismaticAgents.SourceArchiveSpecialist do
  @moduledoc """
  L3 Source Archive Specialist agent.
  Creates optimized code packages and manages source archival.
  """

  use GenServer
  require Logger

  @archive_check_interval_ms :timer.hours(6)

  defstruct [
    :last_archive_at,
    :archive_inventory,
    :storage_metrics,
    :integrity_status,
    status: :monitoring
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_archive_check()
    {:ok, %__MODULE__{archive_inventory: load_inventory()}}
  end

  @impl true
  def handle_info(:archive_check, state) do
    integrity = verify_archive_integrity(state.archive_inventory)
    storage = calculate_storage_metrics(state.archive_inventory)

    :telemetry.execute(
      [:prismatic, :agents, :source_archive, :check],
      %{archives_verified: length(integrity.verified), issues: length(integrity.issues)},
      %{total_storage_mb: storage.total_mb}
    )

    schedule_archive_check()

    {:noreply, %{state |
      integrity_status: integrity,
      storage_metrics: storage,
      last_archive_at: DateTime.utc_now()
    }}
  end

  @spec create_release_package(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def create_release_package(version, opts \\ []) do
    include_deps = Keyword.get(opts, :include_deps, true)
    compression = Keyword.get(opts, :compression, :zstd)

    with {:ok, files} <- collect_source_files(),
         {:ok, deps} <- if(include_deps, do: collect_dependencies(), else: {:ok, []}),
         {:ok, archive} <- create_archive(files ++ deps, version, compression),
         {:ok, checksum} <- calculate_checksum(archive) do
      {:ok, %{
        version: version,
        path: archive,
        checksum: checksum,
        file_count: length(files) + length(deps),
        created_at: DateTime.utc_now()
      }}
    end
  end
end
```

## Package Types

The Source Archive Specialist produces several types of code packages, each optimized for its specific use case.

| Package Type | Contents | Size | Use Case |
|-------------|----------|------|----------|
| **Release Package** | Compiled BEAM files, config, scripts | ~50 MB | Production deployment |
| **Source Package** | All `.ex`, `.exs`, config, docs | ~120 MB | Development distribution |
| **Full Archive** | Source + deps + compiled + docs | ~300 MB | Complete backup |
| **Minimal Archive** | Core source only, no deps | ~40 MB | Code review, audit |
| **Delta Package** | Changes since last archive | ~1-10 MB | Incremental backup |

## Integrity Verification

Every archive produced by the Source Archive Specialist includes cryptographic integrity verification to detect corruption or tampering.

| Verification Method | Algorithm | Scope | Frequency |
|--------------------|-----------|-------|-----------|
| **File Checksum** | SHA-256 | Individual files | At creation |
| **Archive Checksum** | SHA-512 | Complete archive | At creation + daily |
| **Manifest Verification** | HMAC-SHA-256 | File listing | At creation + weekly |
| **Cross-Reference** | Merkle tree | Archive set | Monthly |

## Storage Metrics

| Metric | Current | Target |
|--------|---------|--------|
| **Total archive storage** | 2.4 GB | < 5 GB |
| **Archive count** | 156 | Managed by retention |
| **Average archive size** | 15.4 MB | < 50 MB |
| **Deduplication ratio** | 78% | > 70% |
| **Integrity check pass rate** | 100% | 100% |

## Retention Policy Management

The Source Archive Specialist enforces a structured retention policy that balances storage costs against the need for historical reconstruction capability. Different archive tiers follow different retention schedules, with automatic promotion and demotion between tiers as archives age.

| Policy Rule | Application | Automation |
|------------|-------------|------------|
| **7-Day Hot Window** | All archives remain in hot tier for first 7 days | Automatic demotion to warm on day 8 |
| **30-Day Warm Retention** | Warm archives retained for 30 days before cold migration | Automatic compression and migration |
| **365-Day Cold Retention** | Cold archives retained for one year | Annual review for deep archive migration |
| **Indefinite Deep Storage** | Milestone releases and tagged versions kept permanently | Manual tagging by Strategic Command |
| **Emergency Preservation** | Any archive can be frozen to prevent automatic deletion | Manual freeze by L2+ authority |
| **Regulatory Compliance** | Archives related to compliance reports retained 7 years | Automatic compliance tagging |

### Archive Reconstruction Verification

The Source Archive Specialist periodically verifies that archived packages can be successfully reconstructed into a working development environment. This verification catches subtle corruption issues that checksum verification alone cannot detect.

```elixir
defmodule PrismaticAgents.SourceArchiveSpecialist.ReconstructionVerifier do
  @moduledoc """
  Verifies that archived packages can be fully reconstructed
  into working development environments.
  """

  @spec verify_reconstruction(String.t()) :: {:ok, map()} | {:error, term()}
  def verify_reconstruction(archive_path) do
    temp_dir = create_temp_workspace()

    with {:ok, _} <- extract_archive(archive_path, temp_dir),
         {:ok, _} <- verify_file_completeness(temp_dir),
         {:ok, _} <- verify_dependency_resolution(temp_dir),
         {:ok, compile_result} <- attempt_compilation(temp_dir),
         {:ok, _} <- verify_test_execution(temp_dir) do
      cleanup_workspace(temp_dir)

      {:ok, %{
        archive: archive_path,
        files_verified: compile_result.file_count,
        compilation: :success,
        tests: :passed,
        verified_at: DateTime.utc_now()
      }}
    else
      {:error, reason} ->
        cleanup_workspace(temp_dir)
        {:error, %{archive: archive_path, failure: reason}}
    end
  end
end
```

| Verification Check | Frequency | Scope | Pass Rate Target |
|-------------------|-----------|-------|-----------------|
| **Hot Archive Reconstruction** | Weekly | Latest 3 archives | 100% |
| **Warm Archive Reconstruction** | Monthly | Random sample of 5 | 100% |
| **Cold Archive Reconstruction** | Quarterly | Random sample of 3 | 100% |
| **Deep Archive Reconstruction** | Annually | All milestone archives | 100% |

## Integration Points

- [**Quality Gates**](@/capabilities/quality-gates.md) -- Archive creation gated by quality checks
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Archive metrics and storage monitoring
- [**Autonomous Self-Healing**](@/capabilities/autonomous-self-healing.md) -- Auto-repair corrupted archives
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- Full agent specification compliance

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 8 rules defined |
| [Telemetry](@/glossary/telemetry.md) integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Disaster Recovery Integration

The Source Archive Specialist plays a critical role in the platform's disaster recovery strategy. In the event of a catastrophic failure -- data center loss, repository corruption, or supply chain attack -- the archive system provides the foundation for rapid platform reconstruction.

| Recovery Scenario | Archive Tier Used | Recovery Time Objective | Recovery Point Objective |
|------------------|-------------------|------------------------|--------------------------|
| **Repository Corruption** | Hot (Tier 1) | < 1 hour | < 1 day |
| **Build System Failure** | Hot (Tier 1) | < 2 hours | < 1 day |
| **Data Center Loss** | Warm (Tier 2) | < 8 hours | < 7 days |
| **Compliance Audit** | Cold/Deep (Tier 3-4) | < 24 hours | Point-in-time |
| **Historical Investigation** | Deep (Tier 4) | < 72 hours | Specific version |

## Related Agents

- [**Shell Setup Specialist**](@/agents/shell-setup-specialist.md) -- Development environment configuration for archive tooling
- [**Scalability Architect**](@/agents/scalability-architect.md) -- Storage scaling for archive growth
- [**Strategic Command**](@/agents/strategic-command.md) -- Archive retention policy governance

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to create, manage, and verify source code archives across the entire platform.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)