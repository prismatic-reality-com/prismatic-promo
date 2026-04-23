+++
title = "Artifact"
weight = 50

[extra]
description = "A tangible output produced during software development, testing, or intelligence operations -- including build outputs, reports, evidence documents, compiled releases, session artifacts, and provenance-tracked deliverables across the entire platform lifecycle"
category = "quality"
domain = "platform-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["binary", "compile-time", "ci-cd", "benchmark", "assertion", "completeness", "otp-release", "docker", "dialyzer", "telemetry", "provenance", "checksum", "retention"]
tags = ["glossary", "artifact", "build", "ci-cd", "release", "evidence", "output", "beam", "provenance", "report", "session"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Artifacts are the verifiable, provenance-tracked outputs of build, test, intelligence, and session processes that provide evidence of quality, compliance, and operational status across the entire platform lifecycle"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["artifact", "build artifact", "release artifact", "report artifact", "session artifact", "CI/CD output", "compiled binary", "test report", "intelligence report", "OTP release", "provenance", "checksum", "retention policy", "BEAM bytecode", "Docker image", "quality DNA"]
image = "/images/sections/glossary.png"
image_alt = "Artifact - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "agents", "ci-cd", "otp-release"]
+++

## Definition

An artifact is any tangible, verifiable output produced by a defined process during software development, testing, deployment, intelligence operations, or platform session management. The defining characteristic of an artifact is **traceability** -- every artifact must be linked to the process, inputs, configuration, and environment that produced it. This provenance chain enables auditing, reproducibility, and compliance verification across the entire platform lifecycle.

Artifacts span a broad spectrum of outputs. **Build artifacts** include compiled BEAM bytecode (`.beam` files), OTP releases, Docker images, and JavaScript bundles. **Test artifacts** include coverage reports, benchmark results, quality gate outputs, and property-based test shrink traces. **Report artifacts** include OSINT intelligence reports, DD entity analysis documents, compliance assessment outputs, and White Team formal verification proofs. **Session artifacts** are the outputs of AI-assisted development sessions -- quality DNA snapshots, session debrief documents, context preservation archives, and evolution tracking records.

In distributed systems built on the BEAM virtual machine, artifacts take on additional significance. An OTP release artifact encapsulates not just compiled code but the entire runtime configuration, boot script, and dependency tree needed to start a self-contained system. The Prismatic Platform treats every artifact as an immutable, checksummed entity with full provenance metadata, ensuring that the platform's 18-pillar doctrine compliance can be verified at any point in the development lifecycle.

## Core Concepts

### Artifact Taxonomy

| Category | Subcategory | Examples | Storage Location | Retention Policy |
|----------|-------------|---------|-----------------|-----------------|
| **Build** | Compilation | `.beam` files, `.app` resource files | `_build/` | Per release cycle |
| **Build** | Release | OTP release tarball, boot scripts | `_build/prod/rel/` | Permanent (tagged) |
| **Build** | Container | Docker images, layer caches | Container registry | 90 days + tagged |
| **Build** | Frontend | JS bundles, CSS, static assets | `priv/static/` | Per deployment |
| **Test** | Coverage | `cover/` HTML reports, `.coverdata` | `cover/` | 90 days in CI |
| **Test** | Benchmark | Benchee output, flame graphs | `benchmarks/` | Per benchmark run |
| **Test** | Quality | Credo reports, Dialyzer warnings | CI artifacts | 30 days |
| **Quality** | PLT | Dialyzer Persistent Lookup Table | `priv/plts/` | Persistent, versioned |
| **Quality** | DNA | Quality state snapshots | `.claude/quality-dna/` | Persistent |
| **Intelligence** | OSINT | Structured intelligence reports | PostgreSQL, S3 | Policy-based |
| **Intelligence** | DD | Entity exports, contradiction reports | PostgreSQL, exports | Case lifetime |
| **Security** | Audit | Compliance evidence, audit logs | Immutable storage | 7 years minimum |
| **Security** | Scan | Vulnerability reports, SAST output | CI artifacts | 90 days |
| **Session** | Debrief | Session context, decision log | `.claude/session-context/` | Persistent |
| **Session** | Archive | Compressed session state | `.claude/stack-conversation/` | Rolling 30 days |

### Artifact Provenance Model

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | UUID | Unique artifact identifier | `"a1b2c3d4-..."` |
| `type` | Atom | Category classification | `:build`, `:test`, `:intelligence` |
| `path` | String | Storage location (absolute or URI) | `"_build/prod/rel/prismatic/..."` |
| `size_bytes` | Integer | Artifact size in bytes | `45_678_912` |
| `checksum` | String | SHA-256 integrity hash | `"sha256:abc123..."` |
| `source_commit` | String | Git commit that produced it | `"5332180e2f"` |
| `produced_by` | String | Process or agent identifier | `"mix release"`, `"archer-supreme"` |
| `produced_at` | DateTime | UTC timestamp of creation | `~U[2026-04-02 10:30:00Z]` |
| `dependencies` | List | Input artifact IDs | `["dep-id-1", "dep-id-2"]` |
| `metadata` | Map | Category-specific metadata | `%{elixir_version: "1.18.0"}` |
| `retention_policy` | Atom | Lifecycle management rule | `:permanent`, `:rolling_90d` |

### Artifact Lifecycle States

| State | Description | Transitions To |
|-------|-------------|---------------|
| `producing` | Artifact is being generated | `available`, `failed` |
| `available` | Artifact is complete and accessible | `archived`, `expired` |
| `verified` | Integrity and provenance confirmed | `archived`, `promoted` |
| `promoted` | Artifact promoted to production | `archived` |
| `archived` | Moved to long-term storage | `expired` |
| `expired` | Past retention period, eligible for deletion | `deleted` |
| `failed` | Production process failed | (terminal) |
| `deleted` | Permanently removed | (terminal) |

## Technical Deep Dive

### Build Artifacts in the BEAM Ecosystem

The BEAM virtual machine compiles Elixir source code into `.beam` bytecode files -- one per module. These are the most fundamental build artifacts in any Elixir/Erlang system. The compilation process is managed by Mix, which tracks dependencies between modules and performs incremental compilation. The `_build/` directory contains the compilation output organized by environment (`dev`, `test`, `prod`).

An OTP release aggregates all `.beam` files, the ERTS (Erlang Runtime System), boot scripts, and configuration into a self-contained deployable unit. The Prismatic Platform produces release artifacts via `mix release`, which are then packaged into Docker images for deployment to Fly.io. Each release artifact carries a version tag derived from the git commit hash, ensuring traceability from deployed code back to source.

The platform's umbrella architecture (94+ apps) means a single release artifact contains bytecode from all umbrella applications. The release configuration in `rel/` controls which applications are included, their start order, and runtime configuration overlays.

### Report Artifacts and Intelligence Outputs

OSINT intelligence reports are structured artifacts produced by the platform's 157+ self-registering tool adapters. Each tool execution produces a report artifact containing the raw findings, normalized entities, confidence scores, and source attribution. These reports are stored in PostgreSQL with full-text search indexing via Meilisearch, enabling rapid retrieval and cross-referencing.

DD (Due Diligence) artifacts include entity analysis reports, contradiction detection outputs, and cross-archive correlation documents. The DD pipeline produces artifacts at each stage -- client fetch, entity loading, scoring, hypothesis generation, and recommendation synthesis. Each artifact references its predecessor, forming a traceable chain from raw data to final assessment.

### Session Artifacts and AI-Assisted Development

Session artifacts are unique to the Prismatic Platform's AI-Assisted Development (AIAD) workflow. Every development session produces:

- **Quality DNA** (`current-state.json`): A snapshot of the quality state of modified modules, including test coverage, doctrine compliance, and technical debt metrics.
- **Session debrief**: A structured summary of changes made, decisions taken, and outstanding work.
- **Stack conversation state**: Binary-serialized conversation context for session continuity.
- **Context preservation archives**: Compressed session state enabling perfect session restoration.

These artifacts enable the platform's cross-session intelligence capabilities, where each new session can leverage the accumulated knowledge from prior sessions.

### Artifact Integrity and Verification

Every artifact in the Prismatic Platform undergoes integrity verification through cryptographic checksumming. The platform uses SHA-256 as the standard hash algorithm, with checksums computed at artifact creation time and verified at every subsequent access. This prevents both accidental corruption and deliberate tampering.

For release artifacts destined for production deployment, the platform implements a multi-layer verification process: checksum verification, provenance chain validation (ensuring the artifact traces back to a signed commit), and doctrine compliance verification (ensuring the source code passed all 18-pillar doctrine checks before the artifact was produced).

## Usage in Prismatic Platform

- **OTP Releases**: Compiled releases for Fly.io deployment across staging and production environments, versioned by git commit hash
- **Docker Images**: Multi-stage build artifacts produced by the CI pipeline, with layer caching for fast rebuilds
- **Quality DNA**: `.claude/quality-dna/current-state.json` files that track cross-session quality state for every modified app
- **Dialyzer PLT**: Persistent Lookup Table artifact at `priv/plts/dialyzer.plt` that caches type analysis results across builds
- **OSINT Reports**: Structured intelligence artifacts from 157+ self-registering tool adapters, stored with full provenance
- **White Team Proofs**: Formal verification evidence artifacts from the security White Team operations
- **DD Contradiction Reports**: Cross-archive analysis artifacts identifying inconsistencies in due diligence materials
- **Session Context**: AI-assisted development session artifacts preserving decisions, state, and evolution tracking
- **Benchmark Results**: Benchee performance measurement artifacts used for regression detection
- **CI Pipeline Artifacts**: Test results, compilation warnings, Credo analysis, and doctrine compliance reports

## Code Examples

### Artifact Registry with Full Provenance Tracking

```elixir
defmodule PrismaticBuild.ArtifactRegistry do
  @moduledoc """
  Tracks build, test, intelligence, and session artifacts with full provenance
  metadata. Ensures every artifact is traceable to its source commit, build
  configuration, producing process, and input dependencies.

  The registry uses ETS for sub-millisecond lookups with PostgreSQL as the
  durable backing store. Artifacts are immutable once registered -- any
  modification produces a new artifact with a reference to its predecessor.

  ## Architecture

  The registry implements the artifact lifecycle state machine:

      producing -> available -> verified -> promoted -> archived -> expired -> deleted
                        \\-> failed (terminal)

  All state transitions emit telemetry events under the
  `[:prismatic, :artifact, :state_change]` prefix.

  ## Examples

      iex> artifact = %{
      ...>   id: "build-#{UUID.uuid4()}",
      ...>   type: :build,
      ...>   path: "_build/prod/rel/prismatic-0.1.0.tar.gz",
      ...>   size_bytes: 45_678_912,
      ...>   checksum: "sha256:abc123...",
      ...>   source_commit: "5332180e2f",
      ...>   produced_by: "mix release",
      ...>   produced_at: DateTime.utc_now(),
      ...>   metadata: %{elixir_version: "1.18.0", otp_version: "27.0"}
      ...> }
      iex> PrismaticBuild.ArtifactRegistry.register(artifact)
      :ok

  """

  use GenServer

  require Logger

  @type artifact_type :: :build | :test | :quality | :intelligence | :security | :session
  @type artifact_state :: :producing | :available | :verified | :promoted | :archived | :expired | :failed | :deleted
  @type retention_policy :: :permanent | :rolling_90d | :rolling_30d | :case_lifetime | :release_cycle

  @type artifact :: %{
          id: String.t(),
          type: artifact_type(),
          state: artifact_state(),
          path: String.t(),
          size_bytes: non_neg_integer(),
          checksum: String.t(),
          source_commit: String.t(),
          produced_by: String.t(),
          produced_at: DateTime.t(),
          dependencies: [String.t()],
          metadata: map(),
          retention_policy: retention_policy()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Registers a new artifact in the registry with full provenance metadata.
  The artifact is assigned the `:available` state upon successful registration.

  Emits a `[:prismatic, :artifact, :registered]` telemetry event with the
  artifact size and type as measurements and metadata respectively.

  ## Parameters

    - `artifact` - A map conforming to the `t:artifact/0` type

  ## Examples

      iex> PrismaticBuild.ArtifactRegistry.register(%{id: "test-1", type: :test, ...})
      :ok

  """
  @spec register(artifact()) :: :ok | {:error, :already_exists}
  def register(artifact) do
    GenServer.call(__MODULE__, {:register, artifact})
  end

  @doc """
  Retrieves all artifacts associated with a specific git commit SHA.

  ## Examples

      iex> PrismaticBuild.ArtifactRegistry.get_by_commit("5332180e2f")
      [%{id: "build-123", type: :build, ...}]

  """
  @spec get_by_commit(String.t()) :: [artifact()]
  def get_by_commit(commit_sha) do
    GenServer.call(__MODULE__, {:by_commit, commit_sha})
  end

  @doc """
  Retrieves all artifacts of a specific type, optionally filtered by state.

  ## Examples

      iex> PrismaticBuild.ArtifactRegistry.get_by_type(:build, state: :available)
      [%{id: "build-456", type: :build, state: :available, ...}]

  """
  @spec get_by_type(artifact_type(), keyword()) :: [artifact()]
  def get_by_type(type, opts \\ []) do
    GenServer.call(__MODULE__, {:by_type, type, opts})
  end

  @doc """
  Verifies the integrity of an artifact by recomputing its checksum
  and comparing against the stored value.

  ## Examples

      iex> PrismaticBuild.ArtifactRegistry.verify_integrity("build-123")
      {:ok, :verified}

  """
  @spec verify_integrity(String.t()) :: {:ok, :verified} | {:error, :checksum_mismatch | :not_found}
  def verify_integrity(artifact_id) do
    GenServer.call(__MODULE__, {:verify, artifact_id})
  end

  @doc """
  Transitions an artifact to a new lifecycle state. Validates that the
  transition is legal according to the state machine.

  ## Examples

      iex> PrismaticBuild.ArtifactRegistry.transition("build-123", :promoted)
      {:ok, :promoted}

  """
  @spec transition(String.t(), artifact_state()) :: {:ok, artifact_state()} | {:error, :invalid_transition}
  def transition(artifact_id, new_state) do
    GenServer.call(__MODULE__, {:transition, artifact_id, new_state})
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(:artifact_registry, [:set, :named_table, :protected])
    schedule_retention_sweep()
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_call({:register, artifact}, _from, state) do
    case :ets.lookup(:artifact_registry, artifact.id) do
      [] ->
        enriched = Map.put_new(artifact, :state, :available)
        :ets.insert(:artifact_registry, {artifact.id, enriched})

        :telemetry.execute(
          [:prismatic, :artifact, :registered],
          %{size: artifact.size_bytes},
          %{type: artifact.type, id: artifact.id}
        )

        Logger.info("Artifact registered: #{artifact.id} (#{artifact.type})")
        {:reply, :ok, state}

      _existing ->
        {:reply, {:error, :already_exists}, state}
    end
  end

  @impl GenServer
  def handle_call({:by_commit, sha}, _from, state) do
    results =
      :ets.tab2list(:artifact_registry)
      |> Enum.filter(fn {_id, art} -> art.source_commit == sha end)
      |> Enum.map(fn {_id, artifact} -> artifact end)

    {:reply, results, state}
  end

  @impl GenServer
  def handle_call({:by_type, type, opts}, _from, state) do
    filter_state = Keyword.get(opts, :state)

    results =
      :ets.tab2list(:artifact_registry)
      |> Enum.filter(fn {_id, art} ->
        art.type == type and (filter_state == nil or art.state == filter_state)
      end)
      |> Enum.map(fn {_id, artifact} -> artifact end)

    {:reply, results, state}
  end

  @impl GenServer
  def handle_call({:verify, artifact_id}, _from, state) do
    case :ets.lookup(:artifact_registry, artifact_id) do
      [{_id, artifact}] ->
        case compute_and_compare_checksum(artifact) do
          :ok ->
            updated = %{artifact | state: :verified}
            :ets.insert(:artifact_registry, {artifact_id, updated})

            :telemetry.execute(
              [:prismatic, :artifact, :verified],
              %{count: 1},
              %{type: artifact.type, id: artifact_id}
            )

            {:reply, {:ok, :verified}, state}

          {:error, reason} ->
            {:reply, {:error, reason}, state}
        end

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl GenServer
  def handle_call({:transition, artifact_id, new_state}, _from, state) do
    case :ets.lookup(:artifact_registry, artifact_id) do
      [{_id, artifact}] ->
        if valid_transition?(artifact.state, new_state) do
          updated = %{artifact | state: new_state}
          :ets.insert(:artifact_registry, {artifact_id, updated})

          :telemetry.execute(
            [:prismatic, :artifact, :state_change],
            %{count: 1},
            %{from: artifact.state, to: new_state, id: artifact_id}
          )

          {:reply, {:ok, new_state}, state}
        else
          {:reply, {:error, :invalid_transition}, state}
        end

      [] ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl GenServer
  def handle_info(:retention_sweep, state) do
    sweep_expired_artifacts()
    schedule_retention_sweep()
    {:noreply, state}
  end

  @valid_transitions %{
    producing: [:available, :failed],
    available: [:verified, :archived, :expired],
    verified: [:promoted, :archived],
    promoted: [:archived],
    archived: [:expired],
    expired: [:deleted]
  }

  defp valid_transition?(from, to) do
    to in Map.get(@valid_transitions, from, [])
  end

  defp compute_and_compare_checksum(%{path: path, checksum: expected}) do
    if File.exists?(path) do
      actual = "sha256:" <> (:crypto.hash(:sha256, File.read!(path)) |> Base.encode16(case: :lower))
      if actual == expected, do: :ok, else: {:error, :checksum_mismatch}
    else
      {:error, :file_not_found}
    end
  end

  defp sweep_expired_artifacts do
    now = DateTime.utc_now()

    :ets.tab2list(:artifact_registry)
    |> Enum.each(fn {id, artifact} ->
      if should_expire?(artifact, now) do
        :ets.insert(:artifact_registry, {id, %{artifact | state: :expired}})
        Logger.info("Artifact expired by retention policy: #{id}")
      end
    end)
  end

  defp should_expire?(%{retention_policy: :permanent}, _now), do: false

  defp should_expire?(%{retention_policy: :rolling_90d, produced_at: produced_at}, now) do
    DateTime.diff(now, produced_at, :day) > 90
  end

  defp should_expire?(%{retention_policy: :rolling_30d, produced_at: produced_at}, now) do
    DateTime.diff(now, produced_at, :day) > 30
  end

  defp should_expire?(_artifact, _now), do: false

  defp schedule_retention_sweep do
    Process.send_after(self(), :retention_sweep, :timer.hours(1))
  end
end
```

### Artifact Checksum Utility

```elixir
defmodule PrismaticBuild.ArtifactChecksum do
  @moduledoc """
  Cryptographic checksum utilities for artifact integrity verification.
  Supports SHA-256 (default), SHA-384, and SHA-512 algorithms.

  All artifacts in the Prismatic Platform must carry a checksum computed
  at creation time. This module provides the standard interface for
  computing and verifying these checksums.

  ## Examples

      iex> PrismaticBuild.ArtifactChecksum.compute("path/to/artifact.tar.gz")
      {:ok, "sha256:e3b0c44298fc1c149afbf4c8996fb924..."}

      iex> PrismaticBuild.ArtifactChecksum.verify("path/to/artifact.tar.gz", "sha256:e3b0c44...")
      :ok

  """

  @type algorithm :: :sha256 | :sha384 | :sha512

  @doc """
  Computes a checksum for the file at the given path using the specified algorithm.

  ## Examples

      iex> PrismaticBuild.ArtifactChecksum.compute("/tmp/test.txt", :sha256)
      {:ok, "sha256:abc123..."}

  """
  @spec compute(String.t(), algorithm()) :: {:ok, String.t()} | {:error, term()}
  def compute(path, algorithm \\ :sha256) do
    if File.exists?(path) do
      hash =
        File.stream!(path, 65_536)
        |> Enum.reduce(:crypto.hash_init(algorithm), fn chunk, acc ->
          :crypto.hash_update(acc, chunk)
        end)
        |> :crypto.hash_final()
        |> Base.encode16(case: :lower)

      {:ok, "#{algorithm}:#{hash}"}
    else
      {:error, :file_not_found}
    end
  end

  @doc """
  Verifies that a file's checksum matches the expected value.

  ## Examples

      iex> PrismaticBuild.ArtifactChecksum.verify("/tmp/test.txt", "sha256:abc123...")
      :ok

  """
  @spec verify(String.t(), String.t()) :: :ok | {:error, :checksum_mismatch | :file_not_found}
  def verify(path, expected_checksum) do
    [algo_str, _hash] = String.split(expected_checksum, ":", parts: 2)
    algorithm = String.to_existing_atom(algo_str)

    case compute(path, algorithm) do
      {:ok, ^expected_checksum} -> :ok
      {:ok, _different} -> {:error, :checksum_mismatch}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### Release Artifact Builder

```elixir
defmodule PrismaticBuild.ReleaseBuilder do
  @moduledoc """
  Orchestrates OTP release artifact production with full provenance tracking.
  Integrates with the ArtifactRegistry to ensure every release is tracked
  from source commit through deployment.

  ## Release Pipeline

  1. Compile all umbrella apps (`mix compile`)
  2. Build frontend assets (`mix assets.deploy`)
  3. Produce OTP release (`mix release`)
  4. Compute checksums for all release files
  5. Register release artifact with full provenance
  6. Package into Docker image (optional)

  """

  alias PrismaticBuild.{ArtifactRegistry, ArtifactChecksum}

  require Logger

  @doc """
  Builds a release artifact and registers it with full provenance metadata.
  Returns the registered artifact map on success.

  ## Examples

      iex> PrismaticBuild.ReleaseBuilder.build_and_register(env: :prod)
      {:ok, %{id: "release-...", type: :build, ...}}

  """
  @spec build_and_register(keyword()) :: {:ok, map()} | {:error, term()}
  def build_and_register(opts \\ []) do
    env = Keyword.get(opts, :env, :prod)
    commit = get_current_commit()

    with {:ok, release_path} <- build_release(env),
         {:ok, checksum} <- ArtifactChecksum.compute(release_path),
         {:ok, size} <- get_file_size(release_path) do
      artifact = %{
        id: "release-#{commit}-#{System.system_time(:millisecond)}",
        type: :build,
        state: :available,
        path: release_path,
        size_bytes: size,
        checksum: checksum,
        source_commit: commit,
        produced_by: "PrismaticBuild.ReleaseBuilder",
        produced_at: DateTime.utc_now(),
        dependencies: [],
        metadata: %{
          env: env,
          elixir_version: System.version(),
          otp_version: :erlang.system_info(:otp_release) |> to_string()
        },
        retention_policy: :permanent
      }

      case ArtifactRegistry.register(artifact) do
        :ok ->
          Logger.info("Release artifact registered: #{artifact.id}")
          {:ok, artifact}

        error ->
          error
      end
    end
  end

  defp build_release(env) do
    case System.cmd("mix", ["release", "--overwrite"], env: [{"MIX_ENV", to_string(env)}]) do
      {_output, 0} ->
        path = Path.join(["_build", to_string(env), "rel", "prismatic"])
        {:ok, path}

      {output, code} ->
        {:error, {:release_failed, code, output}}
    end
  end

  defp get_current_commit do
    case System.cmd("git", ["rev-parse", "--short", "HEAD"]) do
      {sha, 0} -> String.trim(sha)
      _ -> "unknown"
    end
  end

  defp get_file_size(path) do
    case File.stat(path) do
      {:ok, %{size: size}} -> {:ok, size}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Severity | Mitigation |
|---------|--------|----------|------------|
| **Missing checksums** | Cannot verify artifact integrity | Critical | Always compute SHA-256 at creation time |
| **No provenance metadata** | Cannot trace artifact to source | High | Require source_commit and produced_by fields |
| **Mutable artifacts** | Breaks integrity guarantees | Critical | Treat all artifacts as immutable; produce new ones |
| **Unversioned formats** | Cannot parse old artifacts | Medium | Include format version in metadata |
| **No retention policy** | Disk exhaustion from accumulated artifacts | High | Define retention by category, sweep expired |
| **Hardcoded paths** | Breaks across environments | Medium | Use relative paths or URI schemes |
| **Missing dependency tracking** | Cannot rebuild from inputs | Medium | Record all input artifact IDs |
| **Ignoring checksum failures** | Silent data corruption | Critical | Fail fast on any checksum mismatch |
| **Committing large artifacts to git** | Repository bloat | High | Use `.gitignore`, external storage for binaries |
| **Same retention for all types** | Either premature deletion or waste | Medium | Category-specific retention policies |
| **No cleanup automation** | Manual artifact management overhead | Medium | Scheduled retention sweeps via GenServer timer |
| **Unsigned releases** | Cannot verify artifact authenticity | High | Sign release artifacts with GPG or platform key |

## Best Practices

1. **Checksum all artifacts at creation time**: Every artifact must have a SHA-256 cryptographic checksum computed immediately upon creation, before any storage or transfer operation.

2. **Link artifacts to source commits**: Traceability from artifact to source code is non-negotiable. Every artifact carries the git commit SHA that produced it.

3. **Define retention policies per category**: Not all artifacts need indefinite storage. Build artifacts may expire after 90 days while security audit artifacts must be retained for 7 years.

4. **Treat artifacts as immutable**: Once produced, an artifact must never be modified. If a correction is needed, produce a new artifact with a reference to its predecessor.

5. **Version artifact formats**: As artifact structures evolve, maintain format versioning in metadata to ensure older artifacts can still be parsed by newer tooling.

6. **Track dependency chains**: Record which input artifacts were used to produce each output artifact, enabling full reproducibility and impact analysis.

7. **Automate retention sweeps**: Use scheduled processes (GenServer timers) to automatically expire and clean up artifacts past their retention period.

8. **Verify integrity on access**: Recompute and compare checksums whenever an artifact is retrieved from storage, especially before deployment.

9. **Separate artifact storage from source control**: Binary artifacts (releases, Docker images, PLT files) belong in artifact registries, not in git repositories.

10. **Emit telemetry for artifact lifecycle events**: Every registration, verification, promotion, and expiration should emit telemetry events for monitoring and alerting.

## Related Terms

- [Binary](@/glossary/binary.md) -- compiled executable artifacts in BEAM bytecode format
- [CI/CD](@/glossary/ci-cd.md) -- pipelines that produce and deploy artifacts
- [Benchmark](@/glossary/benchmark.md) -- performance test artifacts with measurement data
- [Assertion](@/glossary/assertion.md) -- test verification producing evidence artifacts
- [Completeness](@/glossary/completeness.md) -- artifact coverage across the platform
- [OTP Release](@/glossary/otp-release.md) -- self-contained deployment artifacts
- [Docker](@/glossary/docker.md) -- container image artifacts
- [Dialyzer](@/glossary/dialyzer.md) -- PLT artifacts for type analysis
- [Telemetry](@/glossary/telemetry.md) -- artifact lifecycle event emission
- [Checksum](/glossary/checksum/) -- integrity verification for artifacts
- [Provenance](@/glossary/provenance.md) -- origin tracking for artifact traceability
- [Quality Gates](@/glossary/quality-gates.md) -- quality artifact verification and enforcement

## See Also

- [CI/CD](@/glossary/ci-cd.md) -- artifact production and deployment pipelines
- [Quality Gates](@/glossary/quality-gates.md) -- quality artifact verification
- [Architecture](@/architecture/_index.md) -- platform artifact architecture
- [Capabilities](@/capabilities/_index.md) -- platform capability documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
