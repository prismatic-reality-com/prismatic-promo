+++
title = "Idempotency"
weight = 30
[extra]
category = "architecture"
description = "Property where repeating an operation produces the same result as executing it once, fundamental to distributed system correctness and fault tolerance"
related_terms = ["rest-api", "event-sourcing", "eventual-consistency", "fault-tolerance", "ecto", "cqrs", "distributed-system", "self-healing", "immutability", "pure-function"]
difficulty = "intermediate"
importance = "critical"
platform_relevance = "core"
date_created = "2025-06-15"
date_updated = "2026-02-22"
version = "2.0.0"
audience = ["backend-engineers", "distributed-systems-architects", "platform-engineers", "api-designers"]
prerequisites = ["rest-api", "ecto", "distributed-system"]
domain = "distributed-systems"
related_patterns = ["upsert", "conditional-write", "deduplication", "idempotency-key", "at-least-once-delivery", "exactly-once-semantics"]
see_also = ["architecture", "technologies", "capabilities"]
acronyms = ["UUID", "CAS", "MVCC"]
standards = ["RFC-7231", "RFC-9110", "HTTP-Semantics"]
tools = ["ecto", "oban", "broadway", "gen_stage"]
platforms = ["beam", "postgresql", "fly-io"]
keywords = ["idempotent operations", "idempotency key pattern", "distributed system correctness", "safe retry semantics", "at-least-once delivery", "exactly-once processing", "upsert pattern", "conflict resolution"]
tags = ["distributed-systems", "reliability", "api-design", "fault-tolerance", "data-integrity"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1619
date_modified = "2026-02-23"
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Idempotency - Prismatic Platform"
+++

## Definition

Idempotency is the property of an operation where executing it multiple times produces the same result and the same system state as executing it exactly once. In mathematical terms, a function `f` is idempotent if `f(f(x)) = f(x)` for all values of `x`. In distributed systems engineering, idempotency means that retrying a failed request -- whether due to network timeout, message duplication, partial processing, or client uncertainty about completion -- is always safe and will not produce unintended side effects such as duplicate records, double charges, or inconsistent state.

Idempotency is not merely a convenience property; in distributed systems it is a fundamental correctness requirement. Networks are unreliable, messages can be delivered more than once, clients cannot always distinguish between "the server never received my request" and "the server processed my request but I never received the response," and at-least-once delivery semantics mean that consumers may process the same event multiple times. Without idempotent operations, each of these failure modes can introduce data corruption that is difficult to detect and expensive to repair.

The concept operates at multiple levels of abstraction. At the HTTP protocol level, RFC 9110 defines specific idempotency guarantees for standard methods. At the application level, idempotency must be designed into business logic through techniques like idempotency keys, conditional writes, and upsert operations. At the infrastructure level, message processing systems must implement deduplication or ensure that their handlers are idempotent by construction. In the Prismatic Platform, idempotency is enforced as a non-negotiable architectural principle across all 115 umbrella applications, from storage adapter operations to [agent](/glossary/agent/) task handlers and quality gate checks.

## Historical Context and Theoretical Foundations

The term "idempotent" derives from Latin: *idem* (same) and *potens* (power) -- literally "same power." In abstract algebra, an idempotent element of a monoid satisfies `e * e = e`. The concept was first applied to computing by early database researchers who recognized that certain operations (like setting a value to a specific state, as opposed to incrementing it) were naturally safe to repeat. Roy Fielding's 2000 dissertation on REST formalized idempotency as a key property of HTTP methods, establishing the architectural foundation that modern [REST API](/glossary/rest-api/) design relies upon.

The importance of idempotency grew dramatically with the rise of distributed computing. Leslie Lamport's work on distributed consensus, the CAP theorem, and the FLP impossibility result all demonstrate that distributed systems cannot guarantee exactly-once message delivery in the general case. The pragmatic solution is at-least-once delivery combined with idempotent handlers -- a pattern that provides the correctness guarantees of exactly-once semantics without the impossibility constraints. Pat Helland's 2012 paper "Idempotence Is Not a Medical Condition" articulated this principle for enterprise systems, arguing that idempotency should be the default design assumption for all distributed operations.

In the context of [OTP](/glossary/otp/) and the BEAM virtual machine, idempotency takes on additional significance because [GenServer](/glossary/genserver/) processes can crash and restart at any time, potentially re-executing in-flight operations. The "let it crash" philosophy only works safely when crashed operations can be retried without producing duplicate side effects.

## HTTP Method Idempotency

The HTTP specification defines clear idempotency semantics for standard methods, which forms the basis for [REST API](/glossary/rest-api/) design:

| Method | Idempotent | Safe | Typical Use | Retry Safety |
|--------|-----------|------|-------------|-------------|
| **GET** | Yes | Yes | Read resource | Always safe to retry |
| **HEAD** | Yes | Yes | Read headers only | Always safe to retry |
| **PUT** | Yes | No | Replace entire resource | Safe -- same state regardless of retries |
| **DELETE** | Yes | No | Remove resource | Safe -- resource absent after first call |
| **PATCH** | No* | No | Partial update | Depends on implementation |
| **POST** | No | No | Create resource | Requires idempotency keys for safety |
| **OPTIONS** | Yes | Yes | Capability query | Always safe to retry |

*PATCH can be made idempotent through careful design (e.g., "set field X to value Y" rather than "increment field X").

The distinction between idempotent and safe methods is subtle but important. Safe methods (GET, HEAD, OPTIONS) do not modify server state at all. Idempotent methods (PUT, DELETE) may modify state on the first invocation but produce the same state on subsequent invocations. POST is neither safe nor idempotent -- each invocation may create a new resource. The Prismatic Platform's [REST API](/glossary/rest-api/) gateway on port 4004 enforces these semantics, requiring idempotency keys for all POST operations that create resources.

## Implementation Strategies

Several well-established patterns exist for implementing idempotent operations in distributed systems.

### Idempotency Keys

The most general approach assigns a unique key to each logical operation. The server tracks processed keys and returns the cached result for duplicate requests:

```elixir
defmodule PrismaticStorage.IdempotentProcessor do
  @moduledoc """
  Processes operations idempotently using client-provided idempotency keys.
  Duplicate requests return the cached result without re-executing.
  Keys are retained for 24 hours to handle late retries.
  """

  alias PrismaticStorage.Repo
  alias PrismaticStorage.IdempotencyRecord

  @type idempotency_key :: String.t()
  @type operation_fn :: (map() -> {:ok, any()} | {:error, any()})

  @spec process(idempotency_key(), map(), operation_fn()) ::
          {:ok, any()} | {:error, any()}
  def process(idempotency_key, params, operation_fn) do
    case Repo.get_by(IdempotencyRecord, key: idempotency_key) do
      %IdempotencyRecord{status: :completed, result: cached_result} ->
        {:ok, cached_result}

      %IdempotencyRecord{status: :processing, inserted_at: started_at} ->
        if stale_processing?(started_at) do
          retry_stale_operation(idempotency_key, params, operation_fn)
        else
          {:error, :operation_in_progress}
        end

      nil ->
        execute_with_tracking(idempotency_key, params, operation_fn)
    end
  end

  defp execute_with_tracking(key, params, operation_fn) do
    Repo.transaction(fn ->
      {:ok, record} = Repo.insert(%IdempotencyRecord{
        key: key,
        status: :processing,
        params_hash: hash(params)
      })

      case operation_fn.(params) do
        {:ok, result} ->
          Repo.update!(Ecto.Changeset.change(record, status: :completed, result: result))
          result

        {:error, reason} ->
          Repo.update!(Ecto.Changeset.change(record, status: :failed, error: reason))
          Repo.rollback(reason)
      end
    end)
  end

  defp stale_processing?(started_at) do
    DateTime.diff(DateTime.utc_now(), started_at, :second) > 300
  end

  defp retry_stale_operation(key, params, operation_fn) do
    Repo.delete_all(from r in IdempotencyRecord, where: r.key == ^key)
    execute_with_tracking(key, params, operation_fn)
  end

  defp hash(params), do: :crypto.hash(:sha256, :erlang.term_to_binary(params))
end
```

### Conditional Writes (Upserts)

Database upsert operations are naturally idempotent -- inserting the same record with the same unique key either succeeds on first execution or updates on subsequent attempts:

```elixir
defmodule PrismaticPerimeter.AssetStore do
  @moduledoc """
  Idempotent asset storage using Ecto upserts.
  Writing the same asset twice produces identical state.
  """

  alias PrismaticStorage.Repo
  alias PrismaticPerimeter.Asset

  @spec upsert_asset(map()) :: {:ok, Asset.t()} | {:error, Ecto.Changeset.t()}
  def upsert_asset(attrs) do
    %Asset{}
    |> Asset.changeset(attrs)
    |> Repo.insert(
      on_conflict: {:replace, [:updated_at, :status, :metadata, :risk_score]},
      conflict_target: [:domain, :asset_type],
      returning: true
    )
  end

  @spec upsert_batch([map()]) :: {:ok, non_neg_integer()} | {:error, term()}
  def upsert_batch(assets) when is_list(assets) do
    Repo.transaction(fn ->
      Enum.reduce(assets, 0, fn attrs, count ->
        case upsert_asset(attrs) do
          {:ok, _} -> count + 1
          {:error, changeset} -> Repo.rollback({:invalid_asset, changeset})
        end
      end)
    end)
  end
end
```

### Event Processing Deduplication

For [event sourcing](/glossary/event-sourcing/) systems, idempotent event handlers use event IDs to prevent duplicate processing:

```elixir
defmodule PrismaticAgents.EventHandler do
  @moduledoc """
  Idempotent event handler that tracks processed event IDs
  to prevent duplicate side effects from at-least-once delivery.
  """

  @spec handle(Event.t()) :: {:ok, :processed | :already_processed} | {:error, term()}
  def handle(%Event{id: event_id} = event) do
    if already_processed?(event_id) do
      {:ok, :already_processed}
    else
      with {:ok, result} <- apply_event(event),
           :ok <- mark_processed(event_id) do
        {:ok, :processed}
      end
    end
  end

  defp already_processed?(event_id) do
    case :ets.lookup(:processed_events, event_id) do
      [{^event_id, _timestamp}] -> true
      [] -> false
    end
  end

  defp mark_processed(event_id) do
    :ets.insert(:processed_events, {event_id, System.monotonic_time()})
    :ok
  end
end
```

## Idempotency in the Prismatic Platform

The Prismatic Platform enforces idempotency in all critical paths, treating it as a non-negotiable correctness requirement rather than an optimization. This principle is enforced across several architectural layers:

- **Storage Adapter Operations**: All storage adapters ([ETS](/glossary/ets/), [Ecto](/glossary/ecto/), Meilisearch, KuzuDB) implement upsert semantics. Writing the same entity twice with the same identifier produces the same state as writing it once. The `PrismaticStorage.AdapterContractTest` behaviour validates idempotent write semantics for all adapter implementations.

- **Quality Gate Checks**: Running `mix quality.gates` multiple times produces the same verdict. The quality checking pipeline is referentially transparent -- it reads code, analyzes it, and produces a report without modifying the codebase. This idempotent property enables safe retry of quality checks during CI pipeline failures.

- **Autoheal Cycles**: The SEADF healing framework is designed so that running `mix autoheal.cycle` multiple times converges to the same platform state. Each healing operation checks current state before acting, making repeated execution safe and convergent.

- **API Endpoints**: The [REST API](/glossary/rest-api/) on port 4004 follows HTTP idempotency conventions. PUT operations are inherently idempotent. POST operations that create resources accept client-provided idempotency keys for safe retry.

- **Agent Execution**: [Agent](/glossary/agent/) task handlers are designed to be idempotent. Re-executing an agent's task with the same parameters produces the same result, enabling safe retry after process crashes within the OTP supervision tree.

- **[QDP](/glossary/qdp/) Elimination**: Quality debt elimination operations are idempotent -- applying the same fix to already-fixed code is a no-op. The 0 QDP state is maintained through idempotent correction operations.

- **Pre-commit Hooks**: The 11-phase pre-commit pipeline is idempotent -- running it multiple times on the same code produces the same pass/fail result without modifying the working tree.

## Idempotency in Distributed Elixir

In a [clustered](/glossary/cluster/) BEAM deployment, idempotency is especially critical because network partitions between nodes can cause message duplication:

| Scenario | Without Idempotency | With Idempotency |
|----------|---------------------|------------------|
| **Network timeout during write** | Client retries, creates duplicate record | Client retries, same result returned |
| **Message delivered twice** | Event processed twice, double side effects | Second processing detected and skipped |
| **Node restart mid-operation** | Partial state left inconsistent | Retry completes or detects prior completion |
| **Split-brain recovery** | Conflicting states on each partition | Convergent state through idempotent reconciliation |
| **GenServer restart** | Lost in-flight operations | Operations retried safely by callers |
| **Oban job retry** | Duplicate background work | Job handler checks completion state first |

The BEAM's distributed process model introduces additional idempotency challenges. When a [GenServer](/glossary/genserver/) process on node A sends a message to a process on node B, and B crashes before acknowledging, A cannot know whether B processed the message. The only safe assumption is at-least-once delivery, which requires B's handler to be idempotent. The Prismatic Platform's `PrismaticSupervisor` ensures that all supervised processes handle restarts idempotently through the compositional supervision tree.

## Idempotency vs. Related Concepts

| Concept | Definition | Relationship to Idempotency |
|---------|-----------|---------------------------|
| **[Pure Function](/glossary/pure-function/)** | Same output for same input, no side effects | Pure functions are inherently idempotent for state |
| **Determinism** | Same output for same input (may have side effects) | Necessary but not sufficient for idempotency |
| **[Eventual Consistency](/glossary/eventual-consistency/)** | All replicas converge to same state | Relies on idempotent convergence operations |
| **At-Least-Once Delivery** | Messages delivered one or more times | Requires idempotent handlers for correctness |
| **Exactly-Once Semantics** | Messages processed exactly once | Achieved through idempotency + deduplication |
| **[Immutability](/glossary/immutability/)** | Data cannot be changed after creation | Naturally supports idempotent append operations |
| **Commutativity** | Order-independent operations | Idempotent + commutative = CRDT foundation |
| **Convergence** | System approaches stable state | Idempotent operations ensure convergence |

## Testing Idempotent Operations

Idempotency must be verified through specific test patterns that exercise the repeat-execution property:

```elixir
defmodule PrismaticStorage.IdempotencyTest do
  use ExUnit.Case, async: true

  alias PrismaticPerimeter.AssetStore
  alias PrismaticStorage.Repo

  describe "asset upsert idempotency" do
    test "inserting the same asset twice produces one record" do
      attrs = %{domain: "example.com", asset_type: :domain, status: :active}

      {:ok, first} = AssetStore.upsert_asset(attrs)
      {:ok, second} = AssetStore.upsert_asset(attrs)

      assert first.id == second.id
      assert Repo.aggregate(Asset, :count) == 1
    end

    test "concurrent upserts of the same asset are safe" do
      attrs = %{domain: "example.com", asset_type: :domain, status: :active}

      tasks = for _ <- 1..10 do
        Task.async(fn -> AssetStore.upsert_asset(attrs) end)
      end

      results = Task.await_many(tasks, 5_000)
      assert Enum.all?(results, fn {:ok, _} -> true; _ -> false end)
      assert Repo.aggregate(Asset, :count) == 1
    end

    test "processing same event twice has no additional effect" do
      event = %Event{id: "evt-001", type: :asset_discovered, payload: %{domain: "example.com"}}

      {:ok, :processed} = EventHandler.handle(event)
      {:ok, :already_processed} = EventHandler.handle(event)

      assert AssetRepo.count_by_domain("example.com") == 1
    end

    test "idempotency key prevents duplicate processing" do
      key = UUID.uuid4()
      params = %{amount: 100, recipient: "user-123"}

      {:ok, first_result} = IdempotentProcessor.process(key, params, &charge/1)
      {:ok, second_result} = IdempotentProcessor.process(key, params, &charge/1)

      assert first_result == second_result
      assert PaymentLog.count_charges("user-123") == 1
    end
  end
end
```

## Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Auto-increment as identity** | Retried inserts create new records | Use natural keys or client-generated UUIDs |
| **Non-idempotent counters** | `UPDATE SET count = count + 1` doubles on retry | Use `UPDATE SET count = :new_value` or track operation IDs |
| **Timestamp-dependent logic** | Different execution times produce different results | Use client-provided timestamps or event timestamps |
| **Side-effect ordering** | Email sent on each retry | Track side-effect completion separately from business logic |
| **Missing conflict handling** | Unique constraint violations on retry | Use `ON CONFLICT` / upsert patterns |
| **Unguarded state transitions** | State moved forward twice on retry | Use compare-and-swap with version vectors |
| **Non-deterministic random values** | Different random IDs on each retry | Generate IDs client-side or use deterministic derivation |

## Database-Level Idempotency Patterns

PostgreSQL provides several mechanisms for implementing idempotent operations at the database level, which the Prismatic Platform leverages through [Ecto](/glossary/ecto/):

```elixir
defmodule PrismaticStorage.IdempotentQueries do
  @moduledoc """
  Database-level idempotency patterns using PostgreSQL features
  through Ecto query composition.
  """

  import Ecto.Query

  @doc """
  Idempotent upsert with advisory lock to prevent race conditions.
  The advisory lock ensures only one concurrent upsert per key succeeds.
  """
  @spec locked_upsert(module(), map(), atom()) :: {:ok, struct()} | {:error, term()}
  def locked_upsert(schema, attrs, conflict_key) do
    lock_key = :erlang.phash2({schema, Map.get(attrs, conflict_key)})

    Repo.transaction(fn ->
      Repo.query!("SELECT pg_advisory_xact_lock($1)", [lock_key])

      schema
      |> struct()
      |> schema.changeset(attrs)
      |> Repo.insert(
        on_conflict: {:replace_all_except, [:id, :inserted_at]},
        conflict_target: [conflict_key],
        returning: true
      )
    end)
  end

  @doc """
  Conditional update using optimistic locking with version field.
  Only applies the update if the version matches, preventing lost updates.
  """
  @spec versioned_update(struct(), map()) :: {:ok, struct()} | {:error, :stale}
  def versioned_update(entity, changes) do
    result =
      from(e in entity.__struct__,
        where: e.id == ^entity.id and e.version == ^entity.version,
        update: [set: ^Map.to_list(Map.put(changes, :version, entity.version + 1))]
      )
      |> Repo.update_all([])

    case result do
      {1, _} -> {:ok, Repo.get!(entity.__struct__, entity.id)}
      {0, _} -> {:error, :stale}
    end
  end
end
```

## Message Queue Idempotency

When using message queues like Oban or Broadway for background job processing, idempotency becomes essential because jobs may be retried after timeouts or worker crashes:

```elixir
defmodule PrismaticAgents.Workers.ScanWorker do
  @moduledoc """
  Idempotent background worker for asset scanning.
  Uses Oban's unique job constraints combined with
  application-level deduplication for complete safety.
  """

  use Oban.Worker,
    queue: :scanning,
    max_attempts: 3,
    unique: [period: 300, keys: [:domain, :scan_type]]

  @impl Oban.Worker
  @spec perform(Oban.Job.t()) :: {:ok, map()} | {:error, term()}
  def perform(%Oban.Job{args: %{"domain" => domain, "scan_type" => scan_type}}) do
    scan_key = "#{domain}:#{scan_type}:#{Date.utc_today()}"

    case check_existing_scan(scan_key) do
      {:ok, existing_result} ->
        {:ok, existing_result}

      :not_found ->
        with {:ok, result} <- execute_scan(domain, scan_type),
             :ok <- store_result(scan_key, result) do
          {:ok, result}
        end
    end
  end
end
```

## Observability and Monitoring

Monitoring idempotent operations requires tracking both successful processing and duplicate detection to ensure the system is functioning correctly:

```elixir
defmodule PrismaticStorage.IdempotencyTelemetry do
  @moduledoc """
  Telemetry events for monitoring idempotent operation patterns.
  Tracks duplicate detection rates and processing latencies.
  """

  @spec emit_processed(String.t(), non_neg_integer()) :: :ok
  def emit_processed(operation, duration_us) do
    :telemetry.execute(
      [:prismatic, :idempotency, :processed],
      %{duration: duration_us},
      %{operation: operation, result: :new}
    )
  end

  @spec emit_duplicate(String.t()) :: :ok
  def emit_duplicate(operation) do
    :telemetry.execute(
      [:prismatic, :idempotency, :duplicate],
      %{count: 1},
      %{operation: operation, result: :duplicate}
    )
  end
end
```

## Related Terms

- [REST API](/glossary/rest-api/) - HTTP methods with defined idempotency semantics
- [Event Sourcing](/glossary/event-sourcing/) - Event replay requires idempotent projection handlers
- [Eventual Consistency](/glossary/eventual-consistency/) - Consistency model relying on idempotent convergence
- [Fault Tolerance](/glossary/fault-tolerance/) - Idempotency enables safe recovery from failures
- [CQRS](/glossary/cqrs/) - Command handlers benefit from idempotent design
- [Pure Function](/glossary/pure-function/) - Pure functions are naturally idempotent for state
- [Ecto](/glossary/ecto/) - Database library providing upsert and conflict resolution
- [Immutability](/glossary/immutability/) - Immutable data supports idempotent append patterns
- [Distributed System](/glossary/distributed-system/) - Environment where idempotency is essential
- [Self-Healing](/glossary/self-healing/) - Healing operations must be idempotent for convergence
- [GenServer](/glossary/genserver/) - OTP process model requiring idempotent restart handling
- [OTP](/glossary/otp/) - Supervision framework depending on idempotent process initialization

## See Also

- [Architecture](/architecture/) - Platform reliability and consistency patterns
- [Technologies](/technologies/) - Implementation approaches for idempotent systems
- [Capabilities](/capabilities/) - Idempotency in platform capability design

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
