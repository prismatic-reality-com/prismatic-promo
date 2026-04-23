+++
title = "Implementing a Compliance-Grade Audit Trail in Elixir"
date = 2026-04-02
description = "Building an audit logging system with action tracking, IP logging, duration measurement, query patterns, and GDPR-compliant retention for regulatory compliance."

[extra]
author = "Tomas Korcak (korczis)"
category = "security"
tags = ["audit-trail", "compliance", "logging", "security", "gdpr"]
reading_time = "9 min"
keywords = ["audit trail implementation", "compliance logging elixir", "action tracking", "audit entry schema", "gdpr audit log", "regulatory compliance"]
image = "/images/blog/audit-trail-implementation.png"
word_count = 1300
date_created = "2026-04-02"
date_modified = "2026-04-02"
quality_score = 86
see_also = ["audit-trail", "ecto", "acid-transactions", "compliance", "evidence"]
image_alt = "Audit Trail Implementation - Prismatic Platform"
+++

When regulators ask "who accessed what, when, and why," you need an answer in minutes, not weeks. A compliance-grade audit trail captures every significant action in the system with enough context to reconstruct what happened, who did it, and how long it took. This is not application logging -- it is a legal record.

## Requirements

Our audit trail requirements come from three sources:

1. **GDPR Article 30**: Records of processing activities must be maintained.
2. **Czech Cybersecurity Act (ZKB 264/2025)**: Critical infrastructure operators must maintain audit logs for security-relevant events.
3. **Internal due diligence standards**: Every OSINT query, report generation, and data access must be traceable.

These requirements translate to concrete technical specifications: immutable log entries, IP attribution, action duration measurement, and configurable retention with automatic purging.

## The Audit Entry Schema

Every auditable action produces an audit entry:

```elixir
defmodule Prismatic.Audit.Entry do
  @moduledoc """
  Immutable audit log entry for compliance tracking.
  Captures who, what, when, where, and how long.
  """

  use Ecto.Schema

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "audit_entries" do
    field :actor_id, :binary_id
    field :actor_type, Ecto.Enum, values: [:user, :system, :api_key, :agent]
    field :actor_label, :string

    field :action, :string
    field :action_category, Ecto.Enum,
      values: [:data_access, :data_modification, :authentication,
               :authorization, :osint_query, :report_generation,
               :configuration_change, :export, :deletion]

    field :resource_type, :string
    field :resource_id, :string
    field :resource_label, :string

    field :ip_address_hash, :string
    field :user_agent, :string
    field :geo_country, :string

    field :duration_us, :integer
    field :status, Ecto.Enum, values: [:success, :failure, :partial]
    field :failure_reason, :string

    field :metadata, :map, default: %{}
    field :changes, :map, default: %{}

    field :session_id, :string
    field :request_id, :string
    field :correlation_id, :string

    timestamps(type: :utc_datetime_usec, updated_at: false)
  end
end
```

The schema is deliberately wide. Each field serves a specific compliance question:

- **actor_***: Who performed the action? Supports users, system processes, API keys, and AI agents.
- **action/action_category**: What was done? Categories enable efficient filtering for audit queries.
- **resource_***: What was acted upon? The type/id/label triple supports any entity type.
- **ip_address_hash**: Where did the request originate? Hashed for GDPR compliance.
- **duration_us**: How long did it take? Microsecond precision for performance auditing.
- **changes**: What changed? For modifications, captures before/after state.
- **correlation_id**: How does this relate to other actions? Links related audit entries across services.

## The Audit Module

The core audit module provides a clean API for recording actions:

```elixir
defmodule Prismatic.Audit do
  @moduledoc """
  Compliance-grade audit logging with automatic duration
  measurement and context capture.
  """

  alias Prismatic.Audit.{Entry, Writer}

  @spec record(atom(), map(), function()) :: term()
  def record(action_category, context, operation) do
    start_time = System.monotonic_time(:microsecond)

    try do
      result = operation.()
      duration = System.monotonic_time(:microsecond) - start_time

      Writer.write(%{
        action: context[:action] || "unknown",
        action_category: action_category,
        actor_id: context[:actor_id],
        actor_type: context[:actor_type] || :system,
        actor_label: context[:actor_label],
        resource_type: context[:resource_type],
        resource_id: context[:resource_id],
        resource_label: context[:resource_label],
        ip_address_hash: context[:ip_hash],
        user_agent: context[:user_agent],
        duration_us: duration,
        status: :success,
        metadata: context[:metadata] || %{},
        changes: context[:changes] || %{},
        session_id: context[:session_id],
        request_id: context[:request_id],
        correlation_id: context[:correlation_id]
      })

      result
    rescue
      e ->
        duration = System.monotonic_time(:microsecond) - start_time

        Writer.write(%{
          action: context[:action] || "unknown",
          action_category: action_category,
          actor_id: context[:actor_id],
          actor_type: context[:actor_type] || :system,
          duration_us: duration,
          status: :failure,
          failure_reason: Exception.message(e),
          metadata: context[:metadata] || %{}
        })

        reraise e, __STACKTRACE__
    end
  end
end
```

Usage at call sites is concise:

```elixir
def view_investigation(user, investigation_id) do
  Prismatic.Audit.record(:data_access, %{
    action: "view_investigation",
    actor_id: user.id,
    actor_type: :user,
    actor_label: user.email,
    resource_type: "investigation",
    resource_id: investigation_id
  }, fn ->
    Repo.get!(Investigation, investigation_id)
  end)
end
```

## Async Writing

Audit writes must never block the main operation. The Writer module uses a GenServer with a write-ahead buffer:

```elixir
defmodule Prismatic.Audit.Writer do
  @moduledoc """
  Async audit entry writer with write-ahead buffering.
  Flushes to database in batches for performance.
  """

  use GenServer

  @flush_interval_ms 1_000
  @max_buffer_size 100

  def write(entry_params) do
    GenServer.cast(__MODULE__, {:write, entry_params})
  end

  @impl true
  def handle_cast({:write, params}, state) do
    buffer = [params | state.buffer]

    if length(buffer) >= @max_buffer_size do
      flush(buffer)
      {:noreply, %{state | buffer: []}}
    else
      {:noreply, %{state | buffer: buffer}}
    end
  end

  @impl true
  def handle_info(:flush, state) do
    if state.buffer != [] do
      flush(state.buffer)
    end

    schedule_flush()
    {:noreply, %{state | buffer: []}}
  end

  defp flush(entries) do
    now = DateTime.utc_now()
    rows = Enum.map(entries, &Map.put(&1, :inserted_at, now))

    Repo.insert_all(Entry, rows,
      on_conflict: :nothing,
      conflict_target: [:id]
    )
  end
end
```

Batching audit writes reduces database round-trips from potentially hundreds per second to one per second. The 1-second flush interval and 100-entry buffer cap ensure that audit data is persisted promptly while minimizing I/O overhead.

## IP Handling

IP addresses are personally identifiable information under GDPR. We hash them before storage using the same rotating-salt approach as Hawkeye:

```elixir
defmodule Prismatic.Audit.IPHandler do
  @moduledoc """
  GDPR-compliant IP address handling for audit entries.
  """

  @spec hash_ip(tuple() | String.t()) :: String.t()
  def hash_ip(ip) when is_tuple(ip) do
    ip |> :inet.ntoa() |> to_string() |> hash_ip()
  end

  def hash_ip(ip_string) when is_binary(ip_string) do
    salt = get_current_salt()

    :crypto.hash(:sha256, "#{salt}:#{ip_string}")
    |> Base.encode16(case: :lower)
    |> binary_part(0, 16)
  end
end
```

## Query Patterns

Compliance officers need to answer specific questions quickly. We provide pre-built query functions:

```elixir
defmodule Prismatic.Audit.Queries do
  @moduledoc """
  Pre-built audit query patterns for compliance reporting.
  """

  import Ecto.Query

  @spec actions_by_user(binary(), Date.t(), Date.t()) :: Ecto.Query.t()
  def actions_by_user(user_id, from_date, to_date) do
    from(e in Entry,
      where: e.actor_id == ^user_id,
      where: e.inserted_at >= ^from_date,
      where: e.inserted_at <= ^to_date,
      order_by: [desc: e.inserted_at],
      limit: 1000
    )
  end

  @spec data_access_log(String.t(), String.t()) :: Ecto.Query.t()
  def data_access_log(resource_type, resource_id) do
    from(e in Entry,
      where: e.resource_type == ^resource_type,
      where: e.resource_id == ^resource_id,
      where: e.action_category == :data_access,
      order_by: [desc: e.inserted_at],
      limit: 1000
    )
  end

  @spec failed_actions(Date.t(), Date.t()) :: Ecto.Query.t()
  def failed_actions(from_date, to_date) do
    from(e in Entry,
      where: e.status == :failure,
      where: e.inserted_at >= ^from_date,
      where: e.inserted_at <= ^to_date,
      order_by: [desc: e.inserted_at],
      limit: 1000
    )
  end

  @spec osint_query_log(Date.t(), Date.t()) :: Ecto.Query.t()
  def osint_query_log(from_date, to_date) do
    from(e in Entry,
      where: e.action_category == :osint_query,
      where: e.inserted_at >= ^from_date,
      where: e.inserted_at <= ^to_date,
      order_by: [desc: e.inserted_at],
      limit: 1000
    )
  end
end
```

## Retention and Purging

Audit entries have configurable retention periods based on action category:

```elixir
@retention_periods %{
  authentication: 365,        # 1 year
  authorization: 365,         # 1 year
  data_access: 180,          # 6 months
  data_modification: 730,    # 2 years
  osint_query: 365,          # 1 year
  report_generation: 730,    # 2 years
  configuration_change: 730, # 2 years
  export: 365,               # 1 year
  deletion: 1825             # 5 years (deletion records kept longest)
}
```

A daily Oban job purges expired entries:

```elixir
defmodule Prismatic.Audit.PurgeWorker do
  use Oban.Worker, queue: :maintenance

  @impl Oban.Worker
  def perform(_job) do
    Enum.each(@retention_periods, fn {category, days} ->
      cutoff = DateTime.add(DateTime.utc_now(), -days, :day)

      {count, _} =
        from(e in Entry,
          where: e.action_category == ^category,
          where: e.inserted_at < ^cutoff
        )
        |> Repo.delete_all()

      if count > 0 do
        Logger.info("Purged #{count} audit entries for category #{category}")
      end
    end)

    :ok
  end
end
```

Note that deletion records are retained for 5 years -- the longest retention period. This ensures that even after data is purged, there is a record that the deletion occurred, satisfying GDPR's accountability requirements.

The audit trail is one of those features that nobody notices until an incident occurs or an auditor asks questions. Investing in a proper implementation early -- with structured schemas, async writing, IP privacy, and automatic retention management -- pays dividends when compliance deadlines arrive.
