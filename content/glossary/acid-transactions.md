+++
title = "ACID Transactions"
description = "ACID (Atomicity, Consistency, Isolation, Durability) transactions provide fundamental guarantees for reliable database operations, ensuring data integrity across concurrent operations in distributed systems like the Prismatic Platform."
weight = 30

[extra]
category = "data-engineering"
tags = ["glossary", "acid", "database", "transactions", "data-integrity", "postgresql", "ecto", "distributed-systems", "concurrency", "durability"]
related_terms = ["postgresql", "ecto", "database", "cap-theorem", "event-sourcing", "saga-pattern", "concurrency", "distributed-system", "schema", "validation"]
difficulty = "intermediate"
importance = "critical"
date_created = "2026-02-22"
date_modified = "2026-02-22"
version = "2.0.0"
platforms = ["prismatic", "elixir", "postgresql"]
domain = "database-systems"
audience = ["developers", "architects", "database-administrators"]
prerequisite_knowledge = ["relational-database-fundamentals", "sql-basics", "concurrency-concepts", "elixir-ecto-basics"]
learning_outcomes = ["Understand the four ACID properties and their guarantees", "Implement multi-operation transactions using Ecto.Multi", "Choose appropriate isolation levels for different workloads", "Design retry strategies for serialization conflicts"]
quality_score = 95
word_count_target = 2500
cross_references = 10
section_count = 14
has_code_examples = true
has_diagrams = false
review_status = "comprehensive"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
technical_level = "intermediate-to-advanced"
domain_category = "database-systems"
implementation_status = "production"
authority_level = "L3-strategic"
code_examples = true
version_introduced = "0.1.0"
stability_level = "stable"
keywords = ["ACID", "transactions", "atomicity", "consistency", "isolation", "durability", "database", "PostgreSQL", "Ecto", "data integrity"]
word_count = 1453
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "ACID Transactions - Prismatic Platform"
+++

## Overview

ACID transactions represent a set of four properties -- Atomicity, Consistency, Isolation, and Durability -- that guarantee reliable processing of database operations. These properties ensure that even under concurrent access, system failures, or network partitions, data remains in a valid and predictable state. First formalized by Andreas Reuter and Theo Harder in 1983, these guarantees became the cornerstone of relational database management systems and remain critical in modern distributed architectures.

In the [Prismatic Platform](/glossary/application/), ACID transactions are the backbone of all persistent data operations, enforced through [PostgreSQL](/glossary/postgresql/) and the [Ecto](/glossary/ecto/) library across the entire 115-application umbrella ecosystem. Every data mutation flows through Ecto changesets and transactions, ensuring data integrity at every layer.

---

## Definition and Properties

### Atomicity

Atomicity ensures that a transaction is treated as a single, indivisible unit of work. Either all operations within the transaction succeed, or none of them take effect. There is no partial application of changes. This is implemented through transaction logs and rollback mechanisms -- when a transaction begins, the database records all changes in a write-ahead log before applying them to the actual data pages. If the transaction fails at any point, the database uses the log to undo all changes.

### Consistency

Consistency guarantees that a transaction brings the database from one valid state to another valid state. All defined rules, constraints, cascades, and triggers must be satisfied before a transaction commits. This includes CHECK constraints, UNIQUE constraints, FOREIGN KEY constraints, and any application-level invariants enforced through Ecto changesets.

### Isolation

Isolation ensures that concurrent transactions execute as if they were serial -- one after another. The intermediate state of a transaction is invisible to other concurrent transactions, preventing phenomena like dirty reads, non-repeatable reads, and phantom reads. PostgreSQL implements isolation through Multi-Version Concurrency Control (MVCC) rather than locking, allowing readers and writers to operate concurrently without blocking each other.

### Durability

Durability guarantees that once a transaction has been committed, its effects persist permanently, even in the event of system crashes, power failures, or hardware malfunctions. This is achieved through PostgreSQL's Write-Ahead Logging (WAL) and checkpoint mechanisms.

Together, these four properties form the theoretical foundation upon which reliable data systems are built. In practice, systems often make calculated tradeoffs between strict ACID compliance and performance or availability, particularly in distributed environments where the [CAP theorem](/glossary/cap-theorem/) imposes fundamental constraints.

---

## Historical Context

The ACID acronym was coined in a 1983 paper by Andreas Reuter and Theo Harder, formalizing properties that database systems had been implementing since the 1970s. Jim Gray's pioneering work on transaction processing in the late 1970s established the theoretical foundations, and his concept of transaction isolation levels later became part of the SQL standard (SQL-92).

The evolution of ACID transactions has been marked by a tension between correctness and performance. Early systems used strict two-phase locking (2PL), which guaranteed serializability but created significant contention. The development of MVCC by Michael Stonebraker and others in the 1980s (first implemented in Postgres, the predecessor to PostgreSQL) provided a breakthrough -- concurrent reads and writes without mutual blocking.

The rise of distributed systems in the 2000s brought new challenges. Eric Brewer's CAP theorem (2000) demonstrated that distributed systems cannot simultaneously guarantee consistency, availability, and partition tolerance. This led to the BASE (Basically Available, Soft state, Eventually consistent) model and NoSQL databases that traded ACID guarantees for horizontal scalability. However, the pendulum has swung back: modern distributed databases like CockroachDB, YugabyteDB, and Google Spanner prove that ACID can be achieved at scale, albeit with latency tradeoffs.

---

## Technical Deep Dive

### Ecto.Multi for Atomic Multi-Step Operations

The Prismatic Platform uses `Ecto.Multi` extensively for complex business operations that span multiple database tables:

```elixir
alias Ecto.Multi

multi =
  Multi.new()
  |> Multi.insert(:user, User.changeset(%User{}, %{name: "Alice", email: "alice@example.com"}))
  |> Multi.insert(:profile, fn %{user: user} ->
    Profile.changeset(%Profile{}, %{user_id: user.id, bio: "New user"})
  end)
  |> Multi.update(:audit, fn %{user: user} ->
    AuditLog.changeset(%AuditLog{}, %{
      action: "user_created",
      entity_id: user.id,
      entity_type: "user"
    })
  end)

case Repo.transaction(multi) do
  {:ok, %{user: user, profile: profile, audit: _audit}} ->
    {:ok, user}

  {:error, failed_operation, changeset, _changes_so_far} ->
    # ALL operations rolled back automatically
    {:error, {failed_operation, changeset}}
end
```

### Isolation Levels

PostgreSQL supports four standard isolation levels, each providing different tradeoffs between correctness and performance:

| Level | Dirty Reads | Non-Repeatable Reads | Phantom Reads | Serialization Anomalies |
|-------|-------------|---------------------|---------------|------------------------|
| Read Uncommitted | Not possible* | Possible | Possible | Possible |
| Read Committed | Not possible | Possible | Possible | Possible |
| Repeatable Read | Not possible | Not possible | Not possible** | Possible |
| Serializable | Not possible | Not possible | Not possible | Not possible |

*PostgreSQL treats Read Uncommitted as Read Committed. **PostgreSQL's Repeatable Read also prevents phantom reads via snapshot isolation.

```elixir
# Setting isolation level in Ecto transactions
Repo.transaction(
  fn ->
    accounts = Repo.all(from a in Account, where: a.balance > 0, lock: "FOR UPDATE")

    Enum.each(accounts, fn account ->
      new_balance = account.balance + calculate_interest(account)
      Repo.update!(Account.changeset(account, %{balance: new_balance}))
    end)
  end,
  isolation_level: :serializable
)
```

### Transaction Retry with Exponential Backoff

Under Serializable isolation, the database may abort transactions to prevent anomalies. The platform implements retry logic:

```elixir
defmodule Prismatic.TransactionManager do
  @moduledoc """
  Manages complex multi-step transactions with proper isolation
  and conflict resolution across the Prismatic Platform.
  """

  alias Ecto.Multi
  alias Prismatic.Repo

  @spec execute_with_retry(Ecto.Multi.t(), keyword()) ::
          {:ok, map()} | {:error, term()}
  def execute_with_retry(multi, opts \\ []) do
    max_retries = Keyword.get(opts, :max_retries, 3)
    isolation = Keyword.get(opts, :isolation_level, :read_committed)

    do_execute(multi, isolation, max_retries, 0)
  end

  defp do_execute(_multi, _isolation, max_retries, attempt)
       when attempt >= max_retries do
    {:error, :max_retries_exceeded}
  end

  defp do_execute(multi, isolation, max_retries, attempt) do
    case Repo.transaction(multi, isolation_level: isolation) do
      {:ok, results} ->
        {:ok, results}

      {:error, :serialization_failure, _, _} ->
        backoff = :math.pow(2, attempt) |> round() |> :timer.seconds()
        Process.sleep(backoff)
        do_execute(multi, isolation, max_retries, attempt + 1)

      {:error, operation, changeset, _} ->
        {:error, {operation, changeset}}
    end
  end
end
```

### Write-Ahead Logging (WAL) and Durability Configuration

```elixir
# Production configuration for durability
config :prismatic, Prismatic.Repo,
  pool_size: 20,
  queue_target: 50,
  queue_interval: 1000,
  parameters: [
    synchronous_commit: "on",
    wal_level: "replica",
    checkpoint_timeout: "5min"
  ]
```

### Security Rating Calculation with ACID Guarantees

```elixir
defmodule Prismatic.SecurityRating.Calculator do
  @moduledoc """
  Calculates security ratings with full ACID guarantees.
  All rating updates are atomic - partial updates never occur.
  """

  alias Ecto.Multi

  def recalculate_rating(domain_id) do
    Multi.new()
    |> Multi.run(:current_rating, fn _repo, _changes ->
      fetch_current_rating(domain_id)
    end)
    |> Multi.run(:scan_results, fn _repo, _changes ->
      aggregate_scan_results(domain_id)
    end)
    |> Multi.run(:new_rating, fn _repo, %{scan_results: results} ->
      compute_rating(results)
    end)
    |> Multi.insert(:rating_record, fn %{new_rating: rating} ->
      SecurityRating.changeset(%SecurityRating{}, %{
        domain_id: domain_id,
        score: rating.score,
        grade: rating.grade,
        calculated_at: DateTime.utc_now()
      })
    end)
    |> Multi.run(:notify, fn _repo, %{rating_record: record} ->
      broadcast_rating_change(record)
    end)
    |> Repo.transaction()
  end
end
```

---

## ACID vs BASE

The BASE (Basically Available, Soft state, Eventually consistent) model represents the opposite end of the consistency spectrum:

| Property | ACID | BASE |
|----------|------|------|
| Consistency | Strong, immediate | Eventual |
| Availability | May sacrifice under contention | Prioritized |
| Partition tolerance | Limited in distributed settings | Built-in |
| Use case | Financial, compliance, security | Social media, caching, analytics |
| Prismatic usage | Primary data store (PostgreSQL) | Cache layers (ETS, Redis) |

### Distributed Transaction Approaches

| Approach | Pros | Cons | Prismatic Usage |
|----------|------|------|-----------------|
| Two-Phase Commit (2PC) | Strong consistency | Blocking, coordinator failure | Not used (single DB) |
| [Saga Pattern](/glossary/saga-pattern/) | Non-blocking, compensatable | Complex, eventual consistency | Cross-service workflows |
| [Event Sourcing](/glossary/event-sourcing/) | Full audit trail, replayable | Storage overhead, complexity | OSINT pipelines |
| Outbox Pattern | Reliable messaging + ACID | Additional table, polling | Event publishing |

---

## Best Practices

1. **Use Ecto.Multi for multi-step operations.** Never perform multiple independent `Repo.insert/update` calls outside a transaction when they must succeed or fail together.

2. **Choose the right isolation level.** Default to Read Committed for most operations. Use Serializable only when absolute correctness under high concurrency is required.

3. **Keep transactions short.** Long-running transactions hold locks and can cause contention. Move non-database work (HTTP calls, file I/O) outside the transaction boundary.

4. **Use advisory locks for application-level coordination.** PostgreSQL advisory locks provide lightweight locking without row-level contention.

5. **Handle serialization failures with retry logic.** Under Serializable isolation, always implement retry with exponential backoff.

6. **Validate data in changesets before the transaction.** Catching validation errors before entering a transaction reduces unnecessary rollbacks and connection usage.

7. **Monitor transaction duration and deadlocks.** Use PostgreSQL's `pg_stat_activity` and `log_lock_waits` to detect long-running transactions and deadlock patterns.

8. **Prefer optimistic concurrency control.** Use Ecto's `optimistic_lock/1` for low-contention updates rather than pessimistic `FOR UPDATE` locks.

---

## Common Pitfalls

1. **Transaction scope creep.** Placing external API calls, email sending, or file operations inside a transaction. These side effects cannot be rolled back and can cause transactions to hold connections indefinitely.

2. **N+1 transactions.** Executing individual transactions in a loop instead of batching operations into a single `Ecto.Multi` pipeline.

3. **Ignoring isolation level defaults.** PostgreSQL defaults to Read Committed, which allows non-repeatable reads. This can cause subtle bugs in read-modify-write patterns.

4. **Deadlock-prone ordering.** Accessing rows in inconsistent order across concurrent transactions. Always acquire locks in a deterministic order (e.g., by primary key ascending).

5. **[Connection pool](/glossary/connection-pooling/) exhaustion.** Long transactions combined with small pool sizes can starve other operations. Monitor pool checkout times via [telemetry](/glossary/telemetry/).

6. **Assuming distributed ACID.** Transactions across multiple databases or services do not automatically provide ACID guarantees. Use [saga patterns](/glossary/saga-pattern/) or event sourcing for cross-service consistency.

7. **Missing error handling on transaction failure.** Not matching on `{:error, operation, changeset, changes_so_far}` from `Ecto.Multi` transactions, losing diagnostic information.

---

## Use Cases

### Security Rating Calculation

The [Prismatic Perimeter](/glossary/prismatic-perimeter/) module calculates security ratings (A-F grades, 300-900 scores) for domains. Each rating calculation involves multiple database writes that must be atomic -- a partial rating update would leave the system in an inconsistent state.

### OSINT Data Ingestion

When ingesting data from OSINT sources (ARES, Justice Registry, Shodan), the platform uses transactions to ensure that entity records, relationship edges, and audit logs are either all committed or all rolled back.

### Agent State Management

The 530+ AIAD agents require consistent state transitions. When an agent moves from `idle` to `executing`, the state change, task assignment, and resource allocation all happen within a single transaction.

### Compliance Auditing

NIS2 and ZKB compliance assessments involve creating assessment records, linking evidence artifacts, and updating compliance scores. ACID transactions ensure that audit trails are complete and tamper-evident.

### Quality Gate Enforcement

The Quality DNA system records quality scores across 13 domains. Score updates, violation records, and trend data are written atomically to prevent quality metric inconsistencies.

---

## Related Technologies

| Technology | Relationship to ACID Transactions |
|---|---|
| [PostgreSQL](/glossary/postgresql/) | The primary ACID-compliant database engine used throughout the platform |
| [Ecto](/glossary/ecto/) | Elixir's database wrapper providing changeset-based ACID transaction support |
| [CAP Theorem](/glossary/cap-theorem/) | Fundamental theorem describing tradeoffs affecting ACID in distributed settings |
| [Event Sourcing](/glossary/event-sourcing/) | Alternative persistence pattern using immutable event streams |
| [Saga Pattern](/glossary/saga-pattern/) | Distributed transaction pattern using compensating actions |
| [Concurrency](/glossary/concurrency/) | Concurrent access patterns that ACID transactions safely handle |
| [Distributed System](/glossary/distributed-system/) | Architectures where ACID becomes more challenging to maintain |
| [Schema](/glossary/schema/) | Database schema definitions enforcing the Consistency property |
| [Validation](/glossary/validation/) | Input validation as the first line of defense for consistency |
| [Connection Pooling](/glossary/connection-pooling/) | Resource management critical for transaction throughput |

---

## See Also

- [Database](/glossary/database/) -- General database concepts and patterns
- [Eventual Consistency](/glossary/eventual-consistency/) -- The BASE alternative to ACID strong consistency
- [Outbox Pattern](/glossary/outbox-pattern/) -- Reliable event publishing combined with ACID transactions
- [ETS](/glossary/ets/) -- In-memory storage that does not provide full ACID guarantees
- [Idempotency](/glossary/idempotency/) -- Operation design that complements transaction retry strategies

---

## Connect & Contribute
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
