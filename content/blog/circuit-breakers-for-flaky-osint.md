+++
title = "Circuit Breakers for Flaky OSINT Sources: Fail Fast, Recover Quietly"
date = 2026-04-09
description = "Some OSINT sources are up 99.9% of the time. Some are up 73%. Retrying a down source synchronously is how pipelines die. Circuit breakers turn a 30-second timeout into a 1-millisecond :circuit_open."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["circuit-breaker", "resilience", "osint", "retry", "fault-tolerance"]
reading_time = "6 min"
keywords = ["circuit breaker Elixir", "OSINT resilience", "fail fast", "retry pattern"]
image = "/images/blog/circuit-breakers.png"
word_count = 500
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["fault-tolerance", "retry", "rate-limiting", "telemetry", "observability"]
image_alt = "Circuit Breakers for Flaky OSINT Sources"
+++

A polite scraper hits a flaky source and waits 30 seconds for a TCP timeout. It does this 100 times an hour. That is *50 minutes of wall-clock time per hour spent waiting on one dead source*. Meanwhile every other adapter is healthy and the dashboard looks fine. The fix is a circuit breaker, and in Elixir it is about 80 lines of [GenServer](@/glossary/genserver.md) wrapped around a few counters.

## The three states

A circuit breaker is a tiny [state machine](@/glossary/state-machine.md):

- **closed** — traffic flows, failures are counted.
- **open** — traffic is rejected immediately with `{:error, :circuit_open}`.
- **half-open** — one probe request is allowed; success closes, failure re-opens.

The trick is the transition rules. Too sensitive and you flap. Too tolerant and you are back to 50 minutes per hour of timeouts.

## The rules that actually work

- **Open on:** 5+ failures in a 30-second rolling window OR 3 consecutive failures.
- **Cool-down:** exponential, starting at 10s, doubling up to 5 minutes.
- **Half-open probe:** exactly one in-flight probe. Concurrent probes defeat the purpose.
- **Close on:** probe success.

```elixir
defmodule PrismaticOsint.Breaker do
  use GenServer

  def call(name, fun) do
    case GenServer.call(name, :state) do
      :open   -> {:error, :circuit_open}
      :closed -> record(name, safely(fun))
      :half_open -> probe(name, fun)
    end
  end

  defp safely(fun) do
    try do
      {:ok, fun.()}
    catch
      kind, reason -> {:error, {kind, reason}}
    end
  end
end
```

The `try/catch` wraps the user function so a crash never leaves the breaker in an inconsistent state. The `:error` path feeds the counter; the `:ok` path resets it.

## Wire it into the pipeline

Every OSINT adapter gets wrapped at the boundary:

```elixir
def search(query, opts) do
  Breaker.call(breaker_for(__MODULE__), fn ->
    HTTPoison.get!(url(query), [], recv_timeout: 5_000)
  end)
end
```

That is it. The adapter does not know about the breaker's internal state. The pipeline does not know about the adapter's flakiness. Both stay boring, which is the goal.

## Telemetry is non-negotiable

Every state transition emits [telemetry](@/glossary/telemetry.md):

```elixir
:telemetry.execute([:osint, :breaker, :open], %{count: 1}, %{adapter: name})
:telemetry.execute([:osint, :breaker, :half_open], %{count: 1}, %{adapter: name})
:telemetry.execute([:osint, :breaker, :closed], %{count: 1}, %{adapter: name})
```

A breaker that opens and never closes is a source that died. A breaker that flaps is a source with intermittent issues (and possibly a wrong cool-down). Without [observability](@/glossary/observability.md) you cannot tell which is which.

## Where to go next

- **Academy**: [OTP Fundamentals](/academy/otp-fundamentals) — the GenServer under the breaker
- **Glossary**: [Fault Tolerance](@/glossary/fault-tolerance.md), [Retry](@/glossary/retry.md), [Rate Limiting](@/glossary/rate-limiting.md), [Telemetry](@/glossary/telemetry.md), [Observability](@/glossary/observability.md)

Fail fast. Recover quietly. Let the healthy sources do the work.
