+++
title = "Building Self-Healing OTP Supervision Trees"
date = 2026-03-09
description = "How Prismatic uses OTP supervision strategies, circuit breakers, and remediation registries to build systems that recover from failures automatically without human intervention."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["otp", "supervision", "fault-tolerance", "elixir", "self-healing", "resilience"]
reading_time = "10 min"
keywords = ["OTP supervision tree", "Elixir fault tolerance", "self-healing systems", "circuit breaker pattern", "OTP restart strategies", "BEAM resilience"]
image = "/images/blog/otp-supervision.png"
word_count = 1750
date_created = "2026-03-09"
date_modified = "2026-03-09"
quality_score = 85
see_also = ["architecture", "developers", "capabilities"]
image_alt = "Building Self-Healing OTP Supervision Trees - Prismatic Platform"
+++

The BEAM virtual machine was designed for systems that must never stop. Erlang's "let it crash" philosophy is not about being careless -- it is about designing supervision hierarchies where individual process failures are expected, isolated, and recovered automatically. This post describes how Prismatic builds on OTP supervision to create systems that heal themselves.

## Supervision Strategies

OTP provides three supervision strategies. Choosing the right one determines how failures propagate:

**`:one_for_one`** -- restart only the crashed child. Use when children are independent:

```elixir
children = [
  {PrismaticOsintSources.Adapters.Czech.ARES, []},
  {PrismaticOsintSources.Adapters.Czech.Justice, []},
  {PrismaticOsintSources.Adapters.Global.Shodan, []}
]

Supervisor.init(children, strategy: :one_for_one)
```

If the ARES adapter crashes, Justice and Shodan continue unaffected.

**`:one_for_all`** -- restart all children when any crashes. Use when children share state:

```elixir
children = [
  {Pipeline.Coordinator, []},
  {Pipeline.WorkerPool, []},
  {Pipeline.ResultCollector, []}
]

Supervisor.init(children, strategy: :one_for_all)
```

The coordinator, worker pool, and result collector share pipeline state. If any crashes, all must restart to re-synchronize.

**`:rest_for_one`** -- restart the crashed child and all children started after it. Use for ordered dependencies:

```elixir
children = [
  {Database.Pool, []},        # Must start first
  {Cache.Layer, []},           # Depends on database
  {API.Server, []}             # Depends on cache
]

Supervisor.init(children, strategy: :rest_for_one)
```

If the cache crashes, the API server restarts too (since it depends on the cache), but the database pool continues.

## Restart Intensity

Every supervisor has a restart intensity: the maximum number of restarts allowed within a time window before the supervisor itself crashes:

```elixir
Supervisor.init(children,
  strategy: :one_for_one,
  max_restarts: 5,
  max_seconds: 60
)
```

This says: if more than 5 restarts happen within 60 seconds, something is fundamentally wrong -- escalate to the parent supervisor.

Setting this correctly requires understanding your failure modes:

- **Transient network errors**: high max_restarts (10+), short window (30s)
- **Configuration errors**: low max_restarts (2-3), longer window (60s)
- **Resource exhaustion**: very low max_restarts (1-2), with backoff

## The Remediation Registry

Prismatic extends basic supervision with a remediation registry that tracks failure patterns and applies targeted fixes:

```elixir
defmodule Prismatic.Singularity.RemediationRegistry do
  @remediations %{
    :database_connection_lost => &reconnect_database/1,
    :ets_table_missing => &recreate_ets_table/1,
    :adapter_rate_limited => &apply_backoff/1,
    :memory_pressure => &trigger_gc/1
  }

  def remediate(failure_type, context) do
    case Map.get(@remediations, failure_type) do
      nil -> {:error, :no_remediation}
      remediation_fn -> remediation_fn.(context)
    end
  end
end
```

When a process crashes, the supervisor's init callback can consult the remediation registry before restarting:

1. Classify the failure (database timeout, resource exhaustion, configuration error)
2. Apply the appropriate remediation (reconnect, GC, backoff)
3. Restart the process with the remediation applied

## Circuit Breakers

For external dependencies (HTTP APIs, databases), we use circuit breakers to prevent cascade failures:

```
Closed (normal) ──[5 failures]──► Open (stopped)
                                       │
                                  [30s timeout]
                                       │
                                       ▼
                                  Half-Open (testing)
                                       │
                              [success]─┼─[failure]
                                 │      │      │
                                 ▼      │      ▼
                              Closed    │    Open
                                       │
```

When an OSINT adapter fails 5 consecutive times, the circuit opens. No requests are sent for 30 seconds. Then a single test request is made. If it succeeds, the circuit closes. If it fails, the circuit reopens.

This prevents a single failing dependency from consuming all available connections and timeouts.

## Lessons Learned at Scale

After running 94 OTP applications in production:

**Supervision trees should mirror your failure domains**. If two components fail together, they should be supervised together. If they fail independently, supervise them independently.

**Log before restart**. OTP restarts are silent by default. Add telemetry to track restart frequency and reasons:

```elixir
:telemetry.execute(
  [:prismatic, :supervisor, :restart],
  %{count: 1},
  %{child: child_id, reason: reason}
)
```

**Design for partial availability**. Not every component needs to be running for the system to be useful. A dashboard that shows "OSINT data temporarily unavailable" is better than a dashboard that returns 500.

**Test your supervision tree**. Kill processes in your test environment and verify they restart correctly. This is not theoretical -- it catches real bugs in restart sequences.

## Conclusion

Self-healing is not magic. It is the disciplined application of OTP supervision strategies, circuit breakers, and remediation patterns. The BEAM gives you the primitives; your job is to organize them into a hierarchy that matches your failure domains.

The goal is not to prevent all failures -- it is to ensure that failures are contained, recovered, and logged without human intervention. In a system with 94 OTP applications, this is not optional.

---

*Learn more about OTP patterns in the [Interactive Academy](/academy/) or explore the [Architecture Documentation](/architecture/) for supervision tree diagrams.*
