+++
title = "LiveView Hub Patterns: Building Intelligence UI That Survives Contact With Reality"
date = 2026-04-09
description = "Intelligence workflows demand UI that streams, degrades gracefully, and never deadlocks the BEAM. Here are the LiveView patterns Prismatic uses across /hub — async mounts, PubSub fan-out, and the one rule that prevents 90% of prod crashes."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["liveview", "phoenix", "pubsub", "async", "patterns"]
reading_time = "7 min"
keywords = ["Phoenix LiveView patterns", "LiveView async mount", "PubSub fan-out", "intelligence UI"]
image = "/images/blog/liveview-hub.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["liveview", "phoenix", "genserver", "telemetry", "query-plan"]
image_alt = "LiveView Hub Patterns for Intelligence UI"
+++

Intelligence UIs fail in distinctive ways. A single slow adapter blocks a whole dashboard. A PubSub storm fans out to ten thousand subscribers. A `mount/3` crash takes down every in-flight investigation. After 700+ routes and a lot of prod incidents, Prismatic's `/hub` LiveViews converged on five patterns that survive contact with reality.

## 1. Never block in mount

The single most expensive mistake is doing work in [mount/3](/glossary/liveview). The socket is not connected yet on the first call; doing a 2-second OSINT query there means the user stares at a blank page and the supervisor sees a slow mount.

```elixir
def mount(params, _session, socket) do
  if connected?(socket), do: send(self(), {:load, params})
  {:ok, assign(socket, :loading, true, :data, nil)}
end

def handle_info({:load, params}, socket) do
  case PrismaticOsint.search(params["q"], timeout: 5_000) do
    {:ok, data} -> {:noreply, assign(socket, loading: false, data: data)}
    {:error, _} -> {:noreply, assign(socket, loading: false, error: true)}
  end
rescue
  e -> {:noreply, assign(socket, loading: false, error: Exception.message(e))}
end
```

Note the `rescue` is specific — bare rescues are banned under [zero-tolerance](/glossary/zero-tolerance) error handling. Also note the timeout: no external call is ever unbounded.

## 2. PubSub topics are a contract, not a free-for-all

Every `/hub` page subscribes to exactly the topics it needs, named in a documented convention:

- `dd:case:<id>` — per-case updates
- `osint:run:<run_id>` — per-run execution stream
- `system_events` — global broadcasts (use sparingly)

Naming conventions let you grep production. "Which LiveViews subscribe to this topic?" should be a 5-second answer.

## 3. Async streams for big lists

The glossary page has 400+ terms. The agent registry has 552. Rendering them in mount is a nonstarter. Phoenix LiveView streams are the right primitive:

```elixir
def mount(_params, _session, socket) do
  {:ok, stream(socket, :terms, load_terms(), limit: 100)}
end
```

Streams keep the DOM under control and the memory bounded. Memory bounded matters because LiveView processes are long-lived [GenServers](/glossary/genserver) — a leak in one socket multiplies across every connected client.

## 4. Avoid N+1 at the mount boundary

An innocent `Enum.map(cases, &Repo.get(Entity, &1.entity_id))` is a [query-plan](/glossary/query-plan) violation that only surfaces when a case has 50 entities. Batch fetch once, join in memory. The pre-commit perf checker catches the common shapes; code review catches the rest.

## 5. LiveView is not a place for business logic

Business logic lives in contexts. LiveView orchestrates. If you find yourself computing confidence scores or resolving entities inside a handler, the code is in the wrong module.

## Where to go next

- **Academy**: [LiveView Dashboards](/academy/learn/liveview-dashboards) — the LiveView side of /hub
- **Glossary**: [LiveView](/glossary/liveview), [Phoenix](/glossary/phoenix), [GenServer](/glossary/genserver), [OTP](/glossary/otp)

Five patterns, one rule: the UI must fail open, never block, and never lie about state. Everything else is details.
