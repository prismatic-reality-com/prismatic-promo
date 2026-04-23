+++
title = "Runtime"
weight = 50
[extra]
description = "Execution phase configuration and BEAM virtual machine environment governing process scheduling and memory management"
category = "elixir"
related_terms = ["process", "scheduler", "run-queue", "profiling", "plt", "secrets"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["runtime", "BEAM", "VM", "configuration", "execution", "release", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir", "otp", "infrastructure"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Runtime - Prismatic Platform"
+++

## Definition & Overview

Runtime refers to both the execution phase of a program (as opposed to compile time) and the virtual machine environment in which the program executes. In Elixir, the runtime is the BEAM virtual machine -- a process-oriented, garbage-collected, preemptively scheduled execution environment designed for concurrency, fault tolerance, and soft real-time performance. Runtime configuration covers settings that are resolved when the application starts (rather than when it compiles), enabling environment-specific behavior without recompilation.

The distinction between compile-time and runtime configuration is critical in Elixir releases. Compile-time configuration (`config/config.exs`) is baked into the release and cannot be changed without recompilation. Runtime configuration (`config/runtime.exs`) is evaluated when the application starts, reading from environment variables, files, or external sources. This separation enables the same release artifact to be deployed across development, staging, and production environments with different configurations.

The Prismatic Platform uses runtime configuration extensively for environment-specific settings: database connection strings, API keys, feature flags, scheduler counts, memory limits, and service endpoints. The `config/runtime.exs` file reads from environment variables set by the deployment infrastructure (Fly.io), ensuring that sensitive values never appear in the codebase or compiled artifacts.

## Technical Deep Dive

Elixir's runtime configuration system uses `Config.Reader` to evaluate `config/runtime.exs` at application boot time. This file has access to `System.get_env/1` and can perform conditional logic based on the deployment environment.

```elixir
# config/runtime.exs
import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise "DATABASE_URL environment variable is not set"

  config :prismatic, PrismaticDd.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    ssl: true,
    socket_options: [:inet6]

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "SECRET_KEY_BASE environment variable is not set"

  config :prismatic_web, PrismaticWeb.Endpoint,
    http: [
      port: String.to_integer(System.get_env("PORT") || "4000"),
      transport_options: [socket_opts: [:inet6]]
    ],
    secret_key_base: secret_key_base,
    server: true

  config :prismatic_api, PrismaticApi.Endpoint,
    http: [port: String.to_integer(System.get_env("API_PORT") || "4004")],
    secret_key_base: secret_key_base,
    server: true
end
```

BEAM runtime parameters control virtual machine behavior at a level below Elixir configuration. These are set via the `ELIXIR_ERL_OPTIONS` environment variable or the `vm.args` file in releases.

```elixir
defmodule PrismaticInfra.RuntimeConfig do
  @moduledoc """
  Runtime configuration management for BEAM VM parameters
  and application settings. Provides introspection for
  monitoring dashboards.
  """

  @spec beam_info() :: map()
  def beam_info do
    %{
      otp_release: :erlang.system_info(:otp_release) |> to_string(),
      erts_version: :erlang.system_info(:version) |> to_string(),
      schedulers: :erlang.system_info(:schedulers),
      schedulers_online: :erlang.system_info(:schedulers_online),
      process_limit: :erlang.system_info(:process_limit),
      process_count: :erlang.system_info(:process_count),
      atom_limit: :erlang.system_info(:atom_limit),
      atom_count: :erlang.system_info(:atom_count),
      memory: memory_info(),
      uptime_seconds: :erlang.statistics(:wall_clock) |> elem(0) |> div(1000)
    }
  end

  @spec memory_info() :: map()
  def memory_info do
    mem = :erlang.memory()

    %{
      total_bytes: Keyword.get(mem, :total),
      processes_bytes: Keyword.get(mem, :processes),
      ets_bytes: Keyword.get(mem, :ets),
      atom_bytes: Keyword.get(mem, :atom),
      binary_bytes: Keyword.get(mem, :binary),
      code_bytes: Keyword.get(mem, :code),
      system_bytes: Keyword.get(mem, :system)
    }
  end

  @spec app_config(atom()) :: keyword()
  def app_config(app) do
    Application.get_all_env(app)
  end

  @spec validate_required_env([String.t()]) :: :ok | {:error, [String.t()]}
  def validate_required_env(vars) do
    missing = Enum.reject(vars, &System.get_env/1)

    case missing do
      [] -> :ok
      vars -> {:error, vars}
    end
  end
end
```

Release configuration in Elixir uses `mix release` to produce self-contained deployable artifacts. The Prismatic Platform configures its releases with custom steps for database migration, seed data, and health checks.

```elixir
defmodule PrismaticPlatform.Release do
  @moduledoc """
  Release tasks for database migration and system preparation.
  Executed at runtime during deployment via release commands.
  """

  @app :prismatic

  @spec migrate() :: :ok
  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end

    :ok
  end

  @spec rollback(module(), integer()) :: :ok
  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
    :ok
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
```

## Architecture & Implementation

The Prismatic Platform's runtime architecture spans the BEAM VM, OTP application tree, and deployment infrastructure. At the VM level, scheduler configuration and memory limits are tuned for the deployment target (Fly.io instances with specific CPU/memory profiles). At the OTP level, the supervision tree is constructed at runtime based on the application configuration. At the infrastructure level, Fly.io provides health checks, rolling deployments, and automatic restarts.

The runtime configuration is validated at application start. If required environment variables are missing or invalid, the application crashes immediately with a clear error message rather than starting in a partially configured state that might cause subtle failures later.

## Usage in Prismatic Platform

Runtime introspection is exposed through the health check API and monitoring dashboard. The `/api/v1/health` endpoint reports BEAM runtime statistics, and the LiveView dashboard provides real-time visualization of runtime metrics.

```elixir
defmodule PrismaticWeb.RuntimeDashboardLive do
  use PrismaticWeb, :live_view

  @refresh_interval 5_000

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Process.send_after(self(), :refresh, @refresh_interval)
    end

    socket =
      socket
      |> assign(:beam_info, PrismaticInfra.RuntimeConfig.beam_info())
      |> assign(:memory, PrismaticInfra.RuntimeConfig.memory_info())

    {:ok, socket}
  end

  @impl true
  def handle_info(:refresh, socket) do
    Process.send_after(self(), :refresh, @refresh_interval)

    socket =
      socket
      |> assign(:beam_info, PrismaticInfra.RuntimeConfig.beam_info())
      |> assign(:memory, PrismaticInfra.RuntimeConfig.memory_info())

    {:noreply, socket}
  end
end
```

## Cross-References

- [Process](@/glossary/process.md) - BEAM execution units managed by the runtime scheduler
- **Scheduler** - Runtime component managing process execution
- [Run Queue](@/glossary/run-queue.md) - Runtime queue depth indicating system load
- [Profiling](@/glossary/profiling.md) - Runtime performance measurement techniques
- **Secrets** - Sensitive values loaded at runtime from environment variables

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
