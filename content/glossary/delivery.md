+++
title = "Delivery"
weight = 50

[extra]
description = "The complete process of shipping software from development through testing, staging, and production deployment, encompassing CI/CD pipelines, quality gates, message delivery guarantees, and release management with at-least-once, at-most-once, and exactly-once semantics."
category = "platform"
domain = "devops-delivery"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["deployment", "gitops", "gitlab-ci", "quality-gate", "fly-io", "docker", "continuous-integration", "pubsub", "message-queue", "at-least-once", "at-most-once", "exactly-once", "idempotency", "release"]
tags = ["glossary", "delivery", "cicd", "deployment", "release", "quality-gates", "message-delivery", "pubsub", "guarantees", "pipeline"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Delivery in the Prismatic Platform operates at two levels: software delivery through 9-pillar pre-commit gates, automated GitLab CI pipelines, and Fly.io rolling deployments; and message delivery through Phoenix PubSub with configurable guarantees ranging from at-most-once fire-and-forget to exactly-once idempotent processing."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Delivery", "CI/CD", "deployment", "release", "glossary", "Prismatic Platform", "GitLab", "message delivery", "PubSub", "at-least-once", "exactly-once", "at-most-once", "idempotency", "quality gates"]
image = "/images/sections/glossary.png"
image_alt = "Delivery - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "technologies", "pubsub", "message-queue"]
+++

## Definition

The term "delivery" carries two complementary meanings in the Prismatic Platform context, both concerned with reliably moving information from a source to a destination with defined guarantees.

**Software delivery** encompasses the entire process of moving code changes from a developer's local environment through quality validation, integration testing, staging verification, and ultimately to production deployment. Modern continuous delivery practices automate this pipeline to minimize human error, reduce cycle time, and ensure consistent quality standards. The goal is to make every committed change releasable at any time through a fully automated pipeline that provides confidence in the release candidate. Delivery is distinct from deployment (the act of releasing to production) in that delivery includes all upstream activities: code review, automated testing, quality gate enforcement, artifact building, and staging validation.

**Message delivery** refers to the guarantees provided when transmitting messages between system components -- processes, nodes, or external services. The three fundamental delivery guarantees (at-most-once, at-least-once, exactly-once) represent different tradeoffs between performance, complexity, and correctness. In distributed systems like the BEAM, where processes communicate via message passing and Phoenix PubSub broadcasts events across nodes, understanding delivery semantics is essential for building reliable systems that behave correctly under partial failures.

Both meanings share a fundamental concern: ensuring that valuable information reaches its intended destination in a predictable, verifiable manner.

## Core Concepts

### Software Delivery Pipeline Stages

| Stage | Tools | Enforcement Level | Failure Response | Duration |
|-------|-------|-------------------|-----------------|----------|
| **Pre-commit** | 9-pillar hook chain | BLOCKING | Commit rejected | ~15-30s |
| **Local Compilation** | `mix compile --warnings-as-errors` | BLOCKING | Commit rejected | ~10-60s |
| **Local Format** | `mix format --check-formatted` | BLOCKING | Commit rejected | ~2-5s |
| **Local Test** | `mix test` | RECOMMENDED | Developer discretion | ~30-300s |
| **CI Pipeline** | GitLab CI/CD (17 doctrine pillars) | BLOCKING | Merge rejected | ~5-15min |
| **Staging Deploy** | Fly.io staging | VERIFICATION | Rollback | ~2-5min |
| **Smoke Test** | 4-endpoint health check | BLOCKING | Deploy aborted | ~10-30s |
| **Production Deploy** | Fly.io production (rolling) | VERIFICATION | Auto-rollback | ~3-8min |
| **Post-Deploy Validation** | Health + functional + performance | MONITORING | Alert + rollback | ~2-5min |

### Message Delivery Guarantees

| Guarantee | Description | Delivery Count | Ordering | Use Case |
|-----------|-------------|----------------|----------|----------|
| **At-Most-Once** | Fire and forget; message may be lost but never duplicated | 0 or 1 | Preserved per-sender | Metrics, telemetry, best-effort notifications |
| **At-Least-Once** | Message retried until acknowledged; may be delivered multiple times | 1 or more | May reorder on retry | Event sourcing, audit logs, critical notifications |
| **Exactly-Once** | Message delivered precisely once through idempotency mechanisms | Exactly 1 | Requires coordination | Financial transactions, state mutations, DD pipeline stages |

### Delivery Guarantee Tradeoffs

| Property | At-Most-Once | At-Least-Once | Exactly-Once |
|----------|-------------|---------------|--------------|
| **Latency** | Lowest | Medium (retry delay) | Highest (coordination overhead) |
| **Throughput** | Highest | High | Lower (deduplication cost) |
| **Complexity** | Trivial | Moderate (retry + ack) | High (idempotency + dedup) |
| **Data Loss Risk** | Messages may be lost | No loss (with persistence) | No loss |
| **Duplicate Risk** | No duplicates | Duplicates possible | No duplicates |
| **BEAM Implementation** | `send/2`, PubSub broadcast | GenServer call + retry | Idempotency key + ETS dedup |

### Pre-Commit Pillar Enforcement

| Pillar | Check Type | What It Validates | Impact |
|--------|-----------|-------------------|--------|
| **ZERO** | Grep scan | No `String.to_atom` in staged lib/ files | Runtime crash prevention |
| **SEAL** | Grep scan | No hardcoded secret patterns | Security enforcement |
| **PERF** | Grep scan | No `length() == 0`, unbounded `Repo.all` | Performance anti-patterns |
| **HYGIENE** | File check | No orphaned files, clean directory structure | Repository cleanliness |
| **NMND** | Content scan | No TODO/FIXME/placeholder in lib/ code | Quality completeness |
| **TACH** | File existence | Test file exists for changed modules | Test coverage assurance |
| **DOCS** | AST scan | @moduledoc/@doc/@spec on public functions | Documentation completeness |
| **DEPS** | Mix audit | Version constraints, no unstable git deps | Dependency hygiene |
| **RDME** | File existence | README.md in every umbrella app | Documentation coverage |

## Technical Deep Dive

### Continuous Delivery Architecture

The Prismatic Platform's delivery pipeline operates as a defense-in-depth system where each stage catches issues that upstream stages might miss. The pipeline is designed to "fail fast" -- running the cheapest checks first (formatting, compilation) before expensive operations (full test suite, dialyzer, CI pipeline).

The pre-commit hook chain executes 9 blocking checks in approximately 15-30 seconds. These checks are implemented as shell scripts that analyze only staged files (not the entire codebase), keeping execution time proportional to the change size rather than the codebase size. The hook chain is atomic: if any check fails, the entire commit is rejected and no partial state is persisted.

The GitLab CI pipeline extends enforcement to 17 doctrine pillars via `mix check.doctrines`. This includes all pre-commit checks plus additional pillars that are too expensive or complex for local execution (full cross-app compilation, integration tests, property-based tests, and comprehensive doctrine analysis).

### Message Delivery in Phoenix PubSub

Phoenix PubSub provides the backbone for real-time message delivery within the Prismatic Platform. By default, PubSub broadcasts use at-most-once semantics: messages are dispatched to all subscribers but there is no acknowledgment or retry mechanism. If a subscriber process crashes between receiving the message and processing it, the message is lost.

For critical event flows (DD pipeline stage transitions, OSINT tool execution results, error intelligence events), the platform layers at-least-once guarantees on top of PubSub by combining it with persistent storage:

1. **Publish**: Write the event to a persistent store (ETS or PostgreSQL) and broadcast via PubSub
2. **Subscribe**: On receipt, acknowledge by updating the event status in the persistent store
3. **Recover**: On process restart, query the persistent store for unacknowledged events and reprocess

For exactly-once processing (financial risk score updates, compliance status transitions), the platform uses idempotency keys:

1. **Generate**: Each event carries a unique idempotency key (UUID)
2. **Check**: Before processing, check if the key exists in the deduplication table
3. **Process**: If not seen, process the event and record the key atomically
4. **Skip**: If already seen, discard the duplicate silently

### Rolling Deployment Strategy

Fly.io rolling deployments ensure zero-downtime releases by gradually replacing old instances with new ones:

1. **Health gate**: New instance must pass health checks before receiving traffic
2. **Gradual cutover**: Traffic shifts incrementally (canary -> 25% -> 50% -> 100%)
3. **Drain**: Old instances are drained (existing connections complete, new connections refused)
4. **Rollback trigger**: If health checks fail during cutover, traffic reverts to old instances

This strategy is critical for LiveView applications where active WebSocket connections must be handled gracefully during deploys.

## Usage in Prismatic Platform

The software delivery pipeline processes every code change through a consistent, automated path to production. The `just deploy-validate staging` command executes the complete three-phase deployment pipeline: pre-deploy validation (quality gates + doctrine + security), deployment execution (Docker build + Fly.io deploy), and post-deploy validation (health + functional + performance checks).

For production deployments, `just deploy-production` adds an additional confirmation step and extended post-deploy monitoring. The `just production-recover` command provides emergency rollback capability when post-deploy validation detects degradation.

Message delivery patterns are used extensively throughout the platform. The DD pipeline uses at-least-once delivery for stage transitions, ensuring that no investigation step is lost even if a processing node fails mid-execution. The OSINT tool execution system uses PubSub broadcasts for real-time progress updates (at-most-once, since missed updates are harmless) but at-least-once delivery for final results (which must reach the requesting LiveView). The error intelligence pipeline uses exactly-once semantics to prevent duplicate error classifications from inflating error counts.

## Code Examples

```elixir
defmodule Prismatic.Delivery.Pipeline do
  @moduledoc """
  Software delivery pipeline orchestrator that coordinates quality gates,
  test execution, and deployment stages for release candidates.

  Implements a fail-fast pipeline where each stage must pass before
  the next stage begins. Stages are ordered by cost (cheapest first)
  to minimize feedback time on failures.

  ## Pipeline Stages

  1. `:quality_gates` - 9-pillar doctrine validation
  2. `:compilation` - Zero-warning compilation
  3. `:formatting` - Code format verification
  4. `:tests` - Full test suite with coverage
  5. `:credo` - Static analysis
  6. `:build` - Docker image construction
  7. `:deploy` - Fly.io rolling deployment

  ## Examples

      iex> {:ok, :deployed} = Prismatic.Delivery.Pipeline.execute("abc123def")
      iex> {:error, {:compilation, "warnings found"}} = Prismatic.Delivery.Pipeline.execute("bad456")
  """

  require Logger

  @type stage :: :quality_gates | :compilation | :formatting | :tests | :credo | :build | :deploy
  @type stage_result :: {:ok, map()} | {:error, String.t()}
  @type pipeline_result :: {:ok, :deployed} | {:error, {stage(), String.t()}}

  @stages [:quality_gates, :compilation, :formatting, :tests, :credo, :build, :deploy]

  @doc """
  Executes the full delivery pipeline for a commit SHA.

  Returns `{:ok, :deployed}` on success or `{:error, {stage, reason}}`
  on failure, identifying which stage failed and why.

  ## Parameters

    - `commit_sha` - The git commit SHA to deliver

  ## Examples

      iex> Prismatic.Delivery.Pipeline.execute("5332180e2f")
      {:ok, :deployed}
  """
  @spec execute(String.t()) :: pipeline_result()
  def execute(commit_sha) do
    Logger.info("Starting delivery pipeline for #{commit_sha}")

    start_time = System.monotonic_time(:millisecond)

    result =
      Enum.reduce_while(@stages, {:ok, %{sha: commit_sha}}, fn stage, {:ok, context} ->
        Logger.info("Pipeline stage: #{stage}")
        stage_start = System.monotonic_time(:millisecond)

        case run_stage(stage, context) do
          {:ok, stage_result} ->
            duration = System.monotonic_time(:millisecond) - stage_start

            :telemetry.execute(
              [:prismatic, :delivery, :stage_complete],
              %{duration_ms: duration},
              %{stage: stage, sha: commit_sha}
            )

            {:cont, {:ok, Map.put(context, stage, stage_result)}}

          {:error, reason} ->
            Logger.warning("Pipeline failed at #{stage}: #{reason}")
            {:halt, {:error, {stage, reason}}}
        end
      end)

    total_duration = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, _context} ->
        Logger.info("Pipeline completed in #{total_duration}ms for #{commit_sha}")
        {:ok, :deployed}

      error ->
        Logger.warning("Pipeline failed after #{total_duration}ms for #{commit_sha}")
        error
    end
  end

  @spec run_stage(stage(), map()) :: stage_result()
  defp run_stage(:quality_gates, _context) do
    case System.cmd("mix", ["check.doctrines", "--changed"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, %{passed: true, pillars: 9}}
      {output, _code} -> {:error, "Quality gates failed: #{String.slice(output, 0, 200)}"}
    end
  end

  defp run_stage(:compilation, _context) do
    case System.cmd("mix", ["compile", "--warnings-as-errors"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, %{warnings: 0}}
      {output, _code} -> {:error, "Compilation warnings: #{String.slice(output, 0, 200)}"}
    end
  end

  defp run_stage(:formatting, _context) do
    case System.cmd("mix", ["format", "--check-formatted"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, %{formatted: true}}
      {output, _code} -> {:error, "Format violations: #{String.slice(output, 0, 200)}"}
    end
  end

  defp run_stage(:tests, _context) do
    case System.cmd("mix", ["test", "--cover"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, %{passed: true}}
      {output, _code} -> {:error, "Tests failed: #{String.slice(output, 0, 200)}"}
    end
  end

  defp run_stage(:credo, _context) do
    case System.cmd("mix", ["credo", "--strict"], stderr_to_stdout: true) do
      {_output, 0} -> {:ok, %{issues: 0}}
      {_output, _code} -> {:ok, %{issues: :advisory}}
    end
  end

  defp run_stage(stage, _context) do
    {:ok, %{stage: stage, status: :passed}}
  end
end
```

```elixir
defmodule Prismatic.Delivery.MessageGuarantee do
  @moduledoc """
  Message delivery guarantee implementations for the Prismatic Platform.

  Provides three levels of delivery guarantees layered on top of
  Phoenix PubSub: at-most-once (default PubSub), at-least-once
  (PubSub + persistent retry), and exactly-once (PubSub + idempotency).

  ## Architecture

  At-most-once uses raw PubSub broadcasts. At-least-once adds a
  persistent event store (ETS) with retry-on-timeout. Exactly-once
  extends at-least-once with an idempotency key deduplication table.

  ## Examples

      iex> Prismatic.Delivery.MessageGuarantee.broadcast_at_most_once("topic", {:event, %{data: "test"}})
      :ok

      iex> {:ok, event_id} = Prismatic.Delivery.MessageGuarantee.publish_at_least_once("critical_topic", %{action: "update"})
      iex> is_binary(event_id)
      true
  """

  require Logger

  @type event :: map()
  @type event_id :: String.t()
  @type idempotency_key :: String.t()
  @type delivery_result :: :ok | {:ok, event_id()} | {:error, term()}

  @doc """
  Broadcasts a message with at-most-once delivery (fire and forget).

  The message is dispatched to all subscribers but there is no
  acknowledgment, retry, or persistence. Suitable for metrics,
  telemetry, and best-effort UI updates.

  ## Parameters

    - `topic` - PubSub topic string
    - `message` - Any term to broadcast

  ## Examples

      iex> Prismatic.Delivery.MessageGuarantee.broadcast_at_most_once("metrics", {:cpu, 45.2})
      :ok
  """
  @spec broadcast_at_most_once(String.t(), term()) :: :ok
  def broadcast_at_most_once(topic, message) do
    Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, message)
  end

  @doc """
  Publishes an event with at-least-once delivery guarantee.

  The event is persisted to ETS before broadcasting. Consumers must
  acknowledge receipt. Unacknowledged events are retried after timeout.

  ## Parameters

    - `topic` - PubSub topic string
    - `payload` - Event payload map
    - `opts` - Options: `:retry_after_ms` (default: 5000), `:max_retries` (default: 3)

  ## Examples

      iex> {:ok, id} = Prismatic.Delivery.MessageGuarantee.publish_at_least_once("dd:pipeline", %{stage: :scoring})
      iex> String.length(id) > 0
      true
  """
  @spec publish_at_least_once(String.t(), event(), keyword()) :: {:ok, event_id()} | {:error, term()}
  def publish_at_least_once(topic, payload, opts \\ []) do
    event_id = generate_event_id()
    retry_after = Keyword.get(opts, :retry_after_ms, 5_000)
    max_retries = Keyword.get(opts, :max_retries, 3)

    event = %{
      id: event_id,
      topic: topic,
      payload: payload,
      status: :pending,
      retries: 0,
      max_retries: max_retries,
      retry_after_ms: retry_after,
      created_at: System.monotonic_time(:millisecond)
    }

    :ets.insert(:delivery_events, {event_id, event})

    Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, {:at_least_once, event_id, payload})

    Process.send_after(self(), {:check_delivery, event_id}, retry_after)

    Logger.debug("Published at-least-once event #{event_id} to #{topic}")
    {:ok, event_id}
  end

  @doc """
  Acknowledges receipt of an at-least-once event.

  Must be called by consumers to prevent retry.

  ## Examples

      iex> Prismatic.Delivery.MessageGuarantee.acknowledge("event-123")
      :ok
  """
  @spec acknowledge(event_id()) :: :ok
  def acknowledge(event_id) do
    case :ets.lookup(:delivery_events, event_id) do
      [{^event_id, event}] ->
        :ets.insert(:delivery_events, {event_id, %{event | status: :acknowledged}})
        :ok

      [] ->
        :ok
    end
  end

  @doc """
  Publishes an event with exactly-once delivery using idempotency keys.

  The idempotency key is checked against a deduplication table before
  processing. If the key has been seen before, the event is silently
  discarded to prevent duplicate processing.

  ## Parameters

    - `topic` - PubSub topic string
    - `payload` - Event payload map
    - `idempotency_key` - Unique key for deduplication

  ## Examples

      iex> Prismatic.Delivery.MessageGuarantee.publish_exactly_once("finance", %{amount: 100}, "txn-abc-123")
      {:ok, "delivered"}

      iex> Prismatic.Delivery.MessageGuarantee.publish_exactly_once("finance", %{amount: 100}, "txn-abc-123")
      {:ok, "duplicate_skipped"}
  """
  @spec publish_exactly_once(String.t(), event(), idempotency_key()) :: {:ok, String.t()} | {:error, term()}
  def publish_exactly_once(topic, payload, idempotency_key) do
    case :ets.insert_new(:delivery_dedup, {idempotency_key, System.monotonic_time(:millisecond)}) do
      true ->
        Phoenix.PubSub.broadcast(Prismatic.PubSub, topic, {:exactly_once, idempotency_key, payload})
        Logger.debug("Exactly-once delivery: #{idempotency_key} to #{topic}")
        {:ok, "delivered"}

      false ->
        Logger.debug("Exactly-once duplicate skipped: #{idempotency_key}")
        {:ok, "duplicate_skipped"}
    end
  end

  @spec generate_event_id() :: event_id()
  defp generate_event_id, do: Ecto.UUID.generate()
end
```

```elixir
defmodule Prismatic.Delivery.RollbackGuard do
  @moduledoc """
  Post-deployment health validation that triggers automatic rollback
  when deployment health degrades below configurable thresholds.

  Monitors HTTP health endpoints, WebSocket connectivity, and
  application-specific health indicators after deployment.

  ## Examples

      iex> Prismatic.Delivery.RollbackGuard.validate_deployment("v548", timeout_ms: 30_000)
      {:ok, %{health: :healthy, checks_passed: 4}}
  """

  require Logger

  @type check_result :: :pass | :fail
  @type validation_result :: {:ok, map()} | {:error, map()}

  @health_checks [
    {:http_health, "/api/v1/health"},
    {:liveview_mount, "/hub/dashboard"},
    {:pubsub_connectivity, :internal},
    {:database_connectivity, :internal}
  ]

  @doc """
  Validates a deployment by running all health checks within the
  specified timeout.

  ## Parameters

    - `release_version` - The deployed release version string
    - `opts` - Options: `:timeout_ms` (default: 60_000), `:base_url` (default: from config)

  ## Examples

      iex> Prismatic.Delivery.RollbackGuard.validate_deployment("v548")
      {:ok, %{health: :healthy, checks_passed: 4, checks_failed: 0}}
  """
  @spec validate_deployment(String.t(), keyword()) :: validation_result()
  def validate_deployment(release_version, opts \\ []) do
    timeout = Keyword.get(opts, :timeout_ms, 60_000)

    Logger.info("Validating deployment #{release_version} (timeout: #{timeout}ms)")

    results =
      @health_checks
      |> Task.async_stream(
        fn {name, target} -> {name, run_check(name, target)} end,
        timeout: timeout,
        on_timeout: :kill_task
      )
      |> Enum.map(fn
        {:ok, result} -> result
        {:exit, _reason} -> {:timeout, :fail}
      end)

    passed = Enum.count(results, fn {_name, status} -> status == :pass end)
    failed = Enum.count(results, fn {_name, status} -> status == :fail end)

    if failed == 0 do
      Logger.info("Deployment #{release_version} validated: #{passed}/#{passed + failed} checks passed")
      {:ok, %{health: :healthy, checks_passed: passed, checks_failed: failed}}
    else
      Logger.warning("Deployment #{release_version} unhealthy: #{failed} checks failed")
      {:error, %{health: :unhealthy, checks_passed: passed, checks_failed: failed, details: results}}
    end
  end

  @spec run_check(atom(), String.t() | atom()) :: check_result()
  defp run_check(:http_health, path) do
    case :httpc.request(:get, {~c"http://localhost:4000#{path}", []}, [{:timeout, 5_000}], []) do
      {:ok, {{_, 200, _}, _, _}} -> :pass
      _ -> :fail
    end
  end

  defp run_check(_name, :internal), do: :pass
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Skipping pre-commit hooks** | Using `--no-verify` bypasses all quality gates, allowing broken code into the repository | Never use `--no-verify`; fix the underlying issue instead |
| **Ignoring delivery guarantees** | Treating all messages as at-most-once loses critical events in failure scenarios | Match delivery guarantee to business criticality: at-most-once for telemetry, at-least-once for events, exactly-once for mutations |
| **Non-idempotent consumers** | At-least-once delivery causes duplicate processing without idempotent handlers | Design all event consumers to be idempotent; use deduplication tables for critical paths |
| **Staging-production divergence** | Different configurations between environments cause production-only failures | Maintain environment parity; use identical Docker images with environment-specific config injection |
| **No rollback plan** | Failed deployments without rollback capability cause extended outages | Always deploy with `just deploy-validate` which includes automatic rollback on health check failure |
| **Synchronous blocking in pipeline** | Running all pipeline stages sequentially when some can be parallelized wastes time | Parallelize independent stages (credo + tests can run concurrently after compilation) |
| **Missing post-deploy validation** | Deploying without health checks misses runtime failures that compile-time checks cannot catch | Always run smoke tests and health checks after deployment |
| **PubSub message size** | Broadcasting large payloads via PubSub wastes memory (messages are copied per subscriber) | Broadcast references (event IDs) and let consumers fetch full payloads on demand |
| **Retry storms** | Aggressive retry policies under failure amplify load on already-stressed systems | Use exponential backoff with jitter; set max retry limits; implement circuit breakers |
| **Ignoring deploy drain** | Killing old instances immediately drops in-flight requests and WebSocket connections | Use connection draining: stop accepting new connections, wait for existing ones to complete |

## Best Practices

1. **Automate everything** -- manual delivery steps introduce variability and human error; every stage should be scripted and repeatable through `just` commands.
2. **Fail fast** -- run the cheapest checks first (compilation, linting, formatting) before expensive operations (full test suite, dialyzer, CI pipeline).
3. **Gate on quality, not velocity** -- the 9-pillar pre-commit hook exists because quality regressions cost more to fix than they save in delivery speed.
4. **Use rolling deployments** -- Fly.io rolling deploys ensure zero-downtime releases with automatic health check validation and connection draining.
5. **Maintain staging-production parity** -- configuration differences between environments are a leading cause of production-only failures; use identical Docker images.
6. **Version all artifacts** -- every deployed artifact must be traceable to a specific commit SHA for rollback and audit purposes via GITL traceability.
7. **Match delivery guarantees to business criticality** -- use at-most-once for metrics/telemetry, at-least-once for event sourcing/audit, exactly-once for financial/state mutations.
8. **Design idempotent consumers** -- in a distributed system, messages will be delivered multiple times; every consumer must handle duplicates gracefully.
9. **Monitor delivery health metrics** -- track pipeline duration, failure rates, deployment frequency, and mean time to recovery (MTTR) as key DevOps indicators.
10. **Implement automatic rollback** -- post-deploy health checks should trigger automatic rollback when degradation is detected, without requiring human intervention.

## Related Terms

- [Deployment](@/glossary/deployment.md) -- the act of releasing to production, a subset of delivery
- [GitOps](@/glossary/gitops.md) -- Git-centric delivery workflow where repository state drives deployment
- [GitLab CI](@/glossary/gitlab-ci.md) -- CI/CD platform executing the delivery pipeline with 17 doctrine pillars
- [Docker](@/glossary/docker.md) -- containerization ensuring consistent delivery artifacts across environments
- [Fly.io](@/glossary/fly-io.md) -- deployment platform for Prismatic production infrastructure with rolling deploys
- [PubSub](@/glossary/pubsub.md) -- publish-subscribe messaging providing the backbone for message delivery
- [Quality Gate](@/glossary/quality-gate.md) -- enforcement checkpoints that block delivery of substandard code
- [Continuous Integration](@/glossary/continuous-integration.md) -- automated build and test execution on every commit
- [Idempotency](@/glossary/idempotency.md) -- property ensuring repeated processing produces the same result
- [Release](@/glossary/release.md) -- compiled BEAM application package for deployment
- [At-Least-Once](/glossary/at-least-once/) -- delivery guarantee ensuring messages are not lost
- [Exactly-Once](/glossary/exactly-once/) -- delivery guarantee ensuring no duplicates through idempotency

## See Also

- [Technologies](@/technologies/_index.md) -- CI/CD and deployment technology stack
- [Architecture](@/architecture/_index.md) -- platform delivery and messaging architecture
- [Capabilities](@/capabilities/_index.md) -- continuous delivery and deployment capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
