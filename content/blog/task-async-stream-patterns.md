+++
title = "Task.async_stream Patterns: The One OSINT Concurrency Primitive You Actually Need"
date = 2026-04-09
description = "You don't need a job queue for 50 parallel OSINT lookups. You need Task.async_stream with the right timeout, the right max_concurrency, and `on_timeout: :kill_task`. Here's the recipe and the three gotchas."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["task", "concurrency", "async", "osint", "elixir"]
reading_time = "6 min"
keywords = ["Task.async_stream", "Elixir concurrency", "OSINT parallelism", "async patterns"]
image = "/images/blog/task-async-stream.png"
word_count = 500
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["task-module", "concurrency", "fault-tolerance", "backpressure", "osint"]
image_alt = "Task.async_stream Patterns"
+++

Most Elixir concurrency problems do not need Broadway, Oban, or GenStage. They need `Task.async_stream`. For the shape "fan out 50 things, collect results, don't let one slow one hold up the rest", there is no simpler primitive in the language. But it has three knobs that matter and one flag people always forget.

## The recipe

```elixir
adapters
|> Task.async_stream(
  fn adapter -> adapter.search(query) end,
  max_concurrency: 10,
  timeout: 5_000,
  on_timeout: :kill_task,
  ordered: false
)
|> Enum.map(fn
  {:ok, {:ok, result}}   -> {:ok, result}
  {:ok, {:error, reason}} -> {:error, reason}
  {:exit, reason}         -> {:error, {:timeout_or_crash, reason}}
end)
```

## Knob 1: max_concurrency

Defaults to `System.schedulers_online/0`. That is almost never what you want. For IO-bound OSINT work, the right number is "how many concurrent connections the slowest upstream can tolerate," which is usually 5–20. For CPU-bound parsing, the default is fine. For mixed workloads, measure — do not guess.

## Knob 2: timeout

The per-task timeout. A slow adapter must not pause the whole stream. 5 seconds is a reasonable default for HTTP-backed adapters. Longer than 10 is almost certainly a design smell — if you need a 30-second budget, you probably want a job queue instead.

## Knob 3: on_timeout

This is the flag everyone forgets. The default is `:exit`, which means a timeout propagates as an exception into the caller. That is almost always wrong. `:kill_task` converts the timeout into a clean `{:exit, :timeout}` in the result stream, and the caller decides what to do. The [fault tolerance](/glossary/fault-tolerance) you actually want is opt-in.

## Gotcha 1: ordered vs unordered

`ordered: false` lets results come back as they finish. This matters when one task is much slower than the others — unordered streams feel 10× faster even though they do the same work. Use `ordered: true` only when the caller's order matters (it usually doesn't).

## Gotcha 2: linked supervision

`Task.async_stream/3` links tasks to the caller. A crash in the caller kills everything. For long-running fan-outs, use `Task.Supervisor.async_stream_nolink` under a dedicated supervisor — crashes are isolated, the caller is safe.

## Gotcha 3: inside GenServers

`Task.async_stream` inside a `handle_call` blocks the GenServer until every task finishes. Do not do this. Either drive the fan-out from the caller or reply immediately and stream results back via PubSub.

## Where to go next

- **Academy**: [OTP Fundamentals](/academy/learn/otp-fundamentals) — Task and supervision primitives
- **Glossary**: [Task Module](/glossary/task-module), [Concurrency](/glossary/concurrency), [Fault Tolerance](/glossary/fault-tolerance), [Backpressure](/glossary/backpressure), [OSINT](/glossary/osint)

Five seconds. Ten concurrent. Kill on timeout. Unordered. That is 90% of the concurrency you ever needed.
