+++
title = "Supervision Trees for OSINT Pipelines: Let It Crash, Keep the Evidence"
date = 2026-04-09
description = "How Prismatic structures supervision trees so that a single flaky OSINT adapter never brings down a case. DynamicSupervisor, Task.Supervisor, and the one-for-one rule that saved production."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["otp", "supervision", "osint", "fault-tolerance", "elixir"]
reading_time = "7 min"
keywords = ["OTP supervision", "DynamicSupervisor", "OSINT fault tolerance", "let it crash"]
image = "/images/blog/supervision-trees.png"
word_count = 530
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["otp", "supervision-tree", "dynamic-supervisor", "genserver", "fault-tolerance"]
image_alt = "Supervision Trees for OSINT Pipelines"
+++

When a Czech ARES lookup times out, or a Shodan rate-limit returns 429, or a scraped forum changes its HTML — you do not want the whole case to die. You want *that* adapter to die, the supervisor to log it, and every other adapter to keep working. This is [OTP](/glossary/otp) [supervision](/glossary/supervision-tree) used as intended.

## The wrong shape

The tempting shape is one big GenServer that sequentially calls every adapter:

```elixir
# ❌ One crash kills the pipeline
def handle_call({:run, query}, _, state) do
  results = Enum.map(@adapters, fn a -> a.search(query) end)
  {:reply, results, state}
end
```

An exception in adapter 3 aborts adapters 4–20. The user sees nothing.

## The right shape

Spawn each adapter under a `Task.Supervisor` with `async_stream_nolink`:

```elixir
Task.Supervisor.async_stream_nolink(
  PrismaticOsint.TaskSup,
  adapters,
  fn a -> a.search(query) end,
  max_concurrency: 10,
  timeout: 5_000,
  on_timeout: :kill_task
)
|> Enum.map(fn
  {:ok, result} -> {:ok, result}
  {:exit, reason} -> {:error, reason}
end)
```

Every adapter is isolated. A crash in one is a `{:exit, reason}` in the result list — not an exception in the caller. The [GenServer](/glossary/genserver) driving the pipeline never dies.

## DynamicSupervisor for long-lived monitors

Short-lived fan-outs use `Task.Supervisor`. Long-lived monitors (continuous OSINT, domain watch) use [DynamicSupervisor](/glossary/dynamic-supervisor):

```elixir
DynamicSupervisor.start_child(
  PrismaticOsint.MonitorSup,
  {PrismaticOsint.Monitor, query: q, interval: :timer.minutes(15)}
)
```

Each monitor is its own process with its own state, its own restart policy, and its own failure surface. When one crashes twice in 60 seconds, the `:one_for_one` strategy with `max_restarts: 3` lets it die for good — and the next scheduled run re-creates it fresh.

## Telemetry on every restart

A restart you cannot see is a bug you cannot fix. Every supervisor in `/hub` emits telemetry on child crashes:

```elixir
:telemetry.execute(
  [:osint, :monitor, :crash],
  %{count: 1},
  %{adapter: adapter, reason: reason}
)
```

The dashboard groups crashes per adapter per hour. When a new adapter starts showing up in the top 5, it gets a ticket before users notice.

## The rule

> Put crashes where supervision can see them, put evidence where supervision cannot erase it.

A crashed adapter is fine. A crashed pipeline is a bug. A crashed envelope is a disaster. Sealed evidence lives outside the supervision tree — in the database, stamped and immutable — so even a total supervisor restart cannot rewrite history.

## Where to go next

- **Academy**: [OTP Fundamentals](/academy/learn/otp-fundamentals) — runnable supervision tree exercises
- **Academy**: [First Agent](/academy/learn/first-agent) — build your first supervised adapter
- **Glossary**: [OTP](/glossary/otp), [Supervision Tree](/glossary/supervision-tree), [DynamicSupervisor](/glossary/dynamic-supervisor), [GenServer](/glossary/genserver), [Fault Tolerance](/glossary/fault-tolerance)

Let it crash. Just make sure the right thing crashes.
