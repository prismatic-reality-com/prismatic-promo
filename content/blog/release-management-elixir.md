+++
title = "Building and Deploying Elixir Releases"
date = 2026-03-26
description = "Complete guide to Elixir releases covering mix release configuration, runtime.exs, Docker multi-stage builds, Fly.io deployment, and hot upgrade patterns."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["elixir", "releases", "deployment", "docker", "fly.io"]
reading_time = "11 min"
keywords = ["elixir release", "mix release", "fly.io deployment", "docker elixir", "hot upgrade"]
image = "/images/blog/release-management-elixir.png"
word_count = 1400
date_created = "2026-03-26"
date_modified = "2026-03-26"
quality_score = 89
see_also = ["architecture", "developers", "configuration-management-umbrella"]
image_alt = "Release Management in Elixir - Prismatic Platform"
+++

An Elixir release is a self-contained package of your application, the Erlang runtime, and all dependencies. It runs without Elixir or Mix installed on the target system. This post covers the full release pipeline from configuration through Docker builds to Fly.io deployment.

## Release Configuration

Define your release in `mix.exs`:

```elixir
def project do
  [
    apps_path: "apps",
    releases: [
      prismatic: [
        applications: [
          prismatic_web: :permanent,
          prismatic_storage: :permanent,
          prismatic_dd: :permanent,
          prismatic_osint: :permanent,
          prismatic_auth: :permanent
        ],
        include_executables_for: [:unix],
        steps: [:assemble, :tar]
      ]
    ]
  ]
end
```

For umbrella projects, explicitly list which applications to include. Not every app needs to be in every release. You might have separate releases for web, workers, and migration tasks.

## Runtime Configuration

The `config/runtime.exs` file is evaluated when the release starts, not at compile time. This is where all deployment-specific values go:

```elixir
import Config

database_url =
  System.get_env("DATABASE_URL") ||
    raise """
    environment variable DATABASE_URL is missing.
    For example: ecto://USER:PASS@HOST/DATABASE
    """

config :prismatic_storage, Prismatic.Repo,
  url: database_url,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: System.get_env("DATABASE_SSL") == "true"

if config_env() == :prod do
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "SECRET_KEY_BASE environment variable is missing"

  config :prismatic_web, PrismaticWeb.Endpoint,
    http: [
      port: String.to_integer(System.get_env("PORT") || "4000"),
      transport_options: [socket_opts: [:inet6]]
    ],
    secret_key_base: secret_key_base,
    server: true
end
```

## Building the Release

```bash
# Set environment
export MIX_ENV=prod

# Compile and build
mix deps.get --only prod
mix compile
mix assets.deploy
mix release prismatic
```

The release is output to `_build/prod/rel/prismatic/`. The directory structure:

```
_build/prod/rel/prismatic/
  bin/
    prismatic          # Start/stop/remote console
    migrate            # Custom migration command
  lib/
    prismatic_web-0.1.0/
    prismatic_dd-0.1.0/
    ...
  releases/
    0.1.0/
      env.sh           # Environment setup
      vm.args          # BEAM VM arguments
  erts-14.0/           # Erlang runtime
```

## Custom Release Commands

Add migration and seed commands that run without Mix:

```elixir
# lib/prismatic/release.ex
defmodule Prismatic.Release do
  @moduledoc """
  Release commands for database migrations and seeds.
  Run via: bin/prismatic eval "Prismatic.Release.migrate()"
  """

  @app :prismatic_storage

  @spec migrate() :: :ok
  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} =
        Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
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

## Docker Multi-Stage Build

A production Dockerfile for an Elixir umbrella:

```dockerfile
# Stage 1: Build
FROM elixir:1.17-otp-27-alpine AS builder

RUN apk add --no-cache build-base git npm

WORKDIR /app

ENV MIX_ENV=prod

# Install hex and rebar
RUN mix local.hex --force && mix local.rebar --force

# Copy dependency manifests first (Docker layer caching)
COPY mix.exs mix.lock ./
COPY apps/prismatic_web/mix.exs apps/prismatic_web/
COPY apps/prismatic_storage/mix.exs apps/prismatic_storage/
COPY apps/prismatic_dd/mix.exs apps/prismatic_dd/
COPY apps/prismatic_osint/mix.exs apps/prismatic_osint/
COPY apps/prismatic_auth/mix.exs apps/prismatic_auth/

RUN mix deps.get --only prod
RUN mix deps.compile

# Copy application code
COPY apps/ apps/
COPY config/ config/
COPY priv/ priv/

# Build assets
RUN cd apps/prismatic_web && npm ci --prefix assets && npm run deploy --prefix assets
RUN mix assets.deploy

# Compile and build release
RUN mix compile
RUN mix release prismatic

# Stage 2: Runtime
FROM alpine:3.19 AS runtime

RUN apk add --no-cache libstdc++ openssl ncurses-libs

WORKDIR /app

COPY --from=builder /app/_build/prod/rel/prismatic ./

ENV HOME=/app
ENV PORT=4000

EXPOSE 4000

CMD ["bin/prismatic", "start"]
```

The multi-stage build ensures the final image contains only the runtime -- no Elixir, no Mix, no source code. Image size drops from 1.5GB to ~80MB.

## Fly.io Deployment

The `fly.toml` configuration:

```toml
app = "prismatic-prod"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[env]
  PHX_HOST = "prismatic.fly.dev"
  POOL_SIZE = "10"
  ECTO_IPV6 = "true"

[http_service]
  internal_port = 4000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

[[vm]]
  size = "shared-cpu-2x"
  memory = "1gb"

[deploy]
  release_command = "bin/prismatic eval Prismatic.Release.migrate"
```

Deploy with:

```bash
fly deploy --strategy rolling
```

The `release_command` runs migrations automatically before the new version starts accepting traffic.

## Health Checks

Configure health checks to ensure the new release is healthy before routing traffic:

```toml
[[services.http_checks]]
  interval = 10000
  timeout = 2000
  grace_period = "30s"
  method = "GET"
  path = "/api/v1/health"
```

The health endpoint should verify critical dependencies:

```elixir
defmodule PrismaticWeb.HealthController do
  use PrismaticWeb, :controller

  @spec check(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def check(conn, _params) do
    checks = %{
      database: check_database(),
      memory: check_memory(),
      uptime: System.monotonic_time(:second)
    }

    status = if Enum.all?(Map.values(checks), &(&1 == :ok or is_integer(&1))), do: 200, else: 503

    json(conn, %{status: status_label(status), checks: checks})
  end

  defp check_database do
    case Prismatic.Repo.query("SELECT 1") do
      {:ok, _} -> :ok
      {:error, _} -> :error
    end
  end

  defp check_memory do
    memory = :erlang.memory(:total)
    if memory < 900_000_000, do: :ok, else: :warning
  end

  defp status_label(200), do: "healthy"
  defp status_label(_), do: "unhealthy"
end
```

## VM Configuration

Tune the BEAM VM for production via `rel/vm.args.eex`:

```
## Increase process limit
+P 1000000

## Increase port limit
+Q 65536

## Enable SMP
-smp auto

## Set scheduler count
+S 4:4

## Enable kernel poll
+K true

## Set async thread pool size
+A 64

## Set distribution buffer busy limit
+zdbbl 8192

## Enable crash dump
-env ERL_CRASH_DUMP /tmp/erl_crash.dump
```

## Release Upgrades

For zero-downtime deployments on Fly.io, use rolling deploys:

```bash
# Deploy with rolling strategy (default)
fly deploy --strategy rolling

# Deploy to canary first
fly deploy --strategy canary
```

Rolling deploys start new machines, wait for health checks, then drain old machines. Traffic shifts gradually from old to new.

For true hot code upgrades (replacing code in a running BEAM), you need Distillery or manual appup files. This is rarely worth the complexity for web applications where rolling deploys achieve the same result.

## Summary

| Step | Command/File | Purpose |
|---|---|---|
| Configure release | `mix.exs` releases key | Define included apps |
| Runtime config | `config/runtime.exs` | Deploy-specific values |
| Build release | `mix release prismatic` | Package application |
| Docker build | Multi-stage Dockerfile | Minimal production image |
| Deploy | `fly deploy` | Ship to production |
| Migrate | `release_command` | Auto-run migrations |
| Health check | `/api/v1/health` | Verify deployment health |
| VM tuning | `rel/vm.args.eex` | BEAM performance |

Releases are the production standard for Elixir. They eliminate runtime dependencies, provide consistent deployments, and enable proper operational tooling.
