+++
title = "Warmup"
weight = 50
[extra]
description = "Initialization phase that pre-loads caches, compiles code, and establishes connections before serving production traffic"
category = "performance"
related_terms = ["cache", "ttl", "benchmark", "jit"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["warmup", "initialization", "cache warming", "benchmark warmup", "JIT compilation", "glossary", "Prismatic Platform"]
tags = ["glossary", "performance"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Warmup - Prismatic Platform"
+++

## Definition & Overview

Warmup is the initialization phase during which a system pre-loads caches, compiles hot code paths, establishes database connections, and performs other preparatory operations before it is ready to serve production traffic at full performance. During warmup, response times are typically higher than steady-state because caches are cold (empty), connection pools are being established, JIT compilers have not yet optimized frequently-executed code, and process schedulers have not yet adapted to the workload pattern.

Understanding warmup is critical for two contexts: benchmarking and deployment. In benchmarking, warmup iterations must be discarded to avoid measuring initialization overhead rather than steady-state performance. In deployment, new instances must complete warmup before receiving production traffic, otherwise users experience degraded performance until caches fill and connections stabilize.

The Prismatic Platform experiences warmup during three scenarios: application boot (ETS registries being populated from BEAM chunks, database connection pools being established), deployment (new instances on Fly.io replacing old ones), and Benchee performance tests (initial iterations warming the BEAM's JIT compiler and ETS caches). Each scenario requires different warmup strategies to ensure accurate measurement or reliable service.

## Technical Deep Dive

The platform's benchmark warmup configuration uses Benchee:

```elixir
defmodule PrismaticBenchmark.Runner do
  @moduledoc """
  Benchmark runner with configurable warmup periods
  to ensure accurate steady-state measurements.
  """

  @default_warmup_seconds 2
  @default_measurement_seconds 5

  @spec run(String.t(), map(), keyword()) :: :ok
  def run(name, scenarios, opts \\ []) do
    warmup = Keyword.get(opts, :warmup, @default_warmup_seconds)
    time = Keyword.get(opts, :time, @default_measurement_seconds)

    Benchee.run(scenarios,
      warmup: warmup,
      time: time,
      memory_time: Keyword.get(opts, :memory_time, 2),
      reduction_time: Keyword.get(opts, :reduction_time, 2),
      print: [
        benchmarking: true,
        configuration: true
      ],
      formatters: [
        {Benchee.Formatters.Console, extended_statistics: true},
        {Benchee.Formatters.HTML, file: "benchmarks/output/#{name}.html"}
      ],
      title: name
    )

    :ok
  end
end
```

Application-level warmup that pre-populates critical caches at boot:

```elixir
defmodule PrismaticWarmup.BootSequence do
  @moduledoc """
  Application boot warmup that pre-populates ETS caches,
  establishes connections, and verifies readiness.
  """

  require Logger

  @warmup_steps [
    {:ets_registries, &__MODULE__.warm_ets_registries/0},
    {:db_connections, &__MODULE__.warm_db_connections/0},
    {:tool_configs, &__MODULE__.warm_tool_configs/0},
    {:search_indexes, &__MODULE__.warm_search_indexes/0}
  ]

  @spec run() :: {:ok, map()} | {:error, term()}
  def run do
    start = System.monotonic_time(:millisecond)

    results =
      @warmup_steps
      |> Enum.map(fn {name, warmup_fn} ->
        step_start = System.monotonic_time(:millisecond)
        result = warmup_fn.()
        duration = System.monotonic_time(:millisecond) - step_start

        Logger.info("Warmup step #{name} completed in #{duration}ms")
        {name, %{status: result, duration_ms: duration}}
      end)
      |> Map.new()

    total_duration = System.monotonic_time(:millisecond) - start
    all_ok = Enum.all?(results, fn {_, %{status: s}} -> s == :ok end)

    if all_ok do
      {:ok, %{steps: results, total_duration_ms: total_duration}}
    else
      failed = Enum.filter(results, fn {_, %{status: s}} -> s != :ok end) |> Map.new()
      {:error, %{failed_steps: failed, total_duration_ms: total_duration}}
    end
  end

  def warm_ets_registries do
    tables = [:osint_tool_registry, :academy_topics, :dd_source_registry]

    Enum.each(tables, fn table ->
      case :ets.info(table) do
        :undefined -> :ok
        info -> Logger.info("ETS #{table}: #{Keyword.get(info, :size, 0)} entries")
      end
    end)

    :ok
  end

  def warm_db_connections do
    repos = [PrismaticDd.Repo]

    Enum.each(repos, fn repo ->
      case Ecto.Adapters.SQL.query(repo, "SELECT 1", []) do
        {:ok, _} -> :ok
        {:error, reason} -> Logger.warning("DB warmup failed: #{inspect(reason)}")
      end
    end)

    :ok
  end

  def warm_tool_configs do
    count = PrismaticOsintCore.ToolRegistry.count()
    Logger.info("OSINT Tool Registry: #{count} tools loaded")
    :ok
  end

  def warm_search_indexes do
    :ok
  end
end
```

## Architecture & Implementation

Warmup in the Prismatic Platform operates at multiple layers:

**BEAM VM Warmup**: The BEAM virtual machine includes a JIT compiler (since OTP 24) that optimizes frequently-executed code paths at runtime. During the first few seconds after application start, function calls are interpreted rather than running JIT-compiled native code. The warmup phase allows the JIT to compile hot paths before production traffic arrives.

**OTP Application Startup**: The platform's supervision tree starts processes in dependency order. GenServers like ToolRegistry, TopicRegistry, and SourceRegistry populate their ETS tables during `init/1`. This phase constitutes the application-level warmup, during which the system is not ready to serve requests that depend on registry data.

**Connection Pool Warmup**: Ecto connection pools (configured via `pool_size` in repo configuration) establish database connections lazily by default. The warmup sequence forces a connection check on each repo to ensure the pool is populated before the first user request arrives.

**Cache Warmup**: ETS caches for TTL-managed data start empty. The warmup sequence can optionally pre-populate frequently accessed cache entries (like tool configurations) to avoid a thundering herd of cache misses when the first wave of requests hits an empty cache.

**Deployment Warmup**: On Fly.io, new instances receive a health check grace period. The health endpoint returns 503 until warmup completes, preventing the load balancer from routing traffic to an instance that is still initializing.

## Usage in Prismatic Platform

The platform integrates warmup into the application lifecycle:

```elixir
defmodule Prismatic.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PrismaticDd.Repo,
      PrismaticOsintCore.ToolRegistry,
      PrismaticAcademy.TopicRegistry,
      PrismaticDd.SourceRegistry,
      {PrismaticWarmup.ReadinessProbe, []},
      PrismaticWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Prismatic.Supervisor]
    result = Supervisor.start_link(children, opts)

    Task.start(fn ->
      case PrismaticWarmup.BootSequence.run() do
        {:ok, report} ->
          PrismaticWarmup.ReadinessProbe.set_ready()
          Logger.info("Boot warmup complete in #{report.total_duration_ms}ms")

        {:error, report} ->
          Logger.error("Boot warmup failed: #{inspect(report.failed_steps)}")
      end
    end)

    result
  end
end
```

The ReadinessProbe GenServer tracks whether warmup is complete, and the health check endpoint consults it before returning a 200 status. This ensures Fly.io only routes traffic to fully warmed instances.

## Cross-References

- [Cache](/glossary/cache/) - Storage layer requiring warmup
- [TTL](/glossary/ttl/) - Cache lifetime management
- [Time to First Byte](/glossary/time-to-first-byte/) - Performance affected by warmup
- [Uptime](/glossary/uptime/) - Availability during warmup transitions
- [ETS](/glossary/ets/) - In-memory storage populated during warmup

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
