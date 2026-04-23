+++
title = "Release"
weight = 12
[extra]
category = "infrastructure"
description = "OTP release packaging that bundles compiled application, ERTS runtime, and configuration into a self-contained deployable unit."
related_terms = ["docker", "fly-io", "hot-code-reload", "mix", "beam", "supervisor", "endpoint", "cluster"]
acronym = ""
technical_domain = "Deployment & Operations"
complexity_level = "Advanced"
platform_relevance = "Critical"
elixir_libraries = ["mix", "elixir_release", "distillery"]
phoenix_integration = "Full - release includes Phoenix endpoint, runtime config, boot scripts"
beam_specific = true
prismatic_modules = ["PrismaticStorage.Release", "PrismaticWeb.Endpoint", "PrismaticSupervisor"]
deployment_target = "Fly.io"
release_name = "prismatic"
umbrella_apps = 115
runtime_config = "config/runtime.exs"
docker_base_image = "hexpm/elixir:1.19.0-erlang-27.0-debian-bookworm"
runner_image = "debian:bookworm-slim"
twelve_factor_compliant = true
industry_standard = "OTP Releases, Docker, Kubernetes"
first_introduced = "Gen 1"
last_updated = "2026-02-22"
tags = ["release", "deployment", "otp", "docker", "fly-io", "erts", "mix-release", "production", "ci-cd"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1067
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Release", "ERTS", "glossary", "infrastructure", "Prismatic Platform", "BEAM", "Elixir", "Docker", "Compile"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Release - Prismatic Platform"
+++

## Definition

An OTP Release is a self-contained, deployable package that bundles a compiled Elixir/Erlang application together with the Erlang Runtime System (ERTS), all compiled dependencies, boot scripts, and configuration into a single directory that can run on a target machine without requiring Elixir, Erlang, or any development tools to be installed. Releases are the standard production deployment artifact for [BEAM](@/glossary/beam.md) applications, analogous to Docker images for containerized services, JARs for Java applications, or statically-linked Go binaries -- but with the unique addition of including the entire runtime system, ensuring that the deployed artifact is completely self-sufficient and insensitive to the target machine's system-level package versions.

The `mix release` command (introduced in Elixir 1.9, replacing the third-party Distillery library) handles the release assembly process: compiling all applications and their dependencies to BEAM bytecode (.beam files), copying the ERTS from the build machine, generating boot scripts that define the startup order based on the OTP application dependency graph, and creating wrapper scripts for start, stop, remote console, and health check operations. The resulting release directory is hermetic -- it contains everything needed to run, making it ideal for deployment to bare-metal servers, virtual machines, or [Docker](@/glossary/docker.md) containers. The hermetic nature also ensures reproducibility: the same release artifact behaves identically regardless of the target environment, eliminating the "works on my machine" class of deployment failures.

Releases support runtime configuration through `config/runtime.exs`, which is evaluated at boot time (not compile time), enabling the same release artifact to be deployed to different environments by varying environment variables. This separation of build artifact from environment configuration is a key principle of the twelve-factor app methodology and is essential for CI/CD pipelines that build once and deploy to staging and production sequentially. Compile-time configuration (`config/config.exs`, `config/prod.exs`) is baked into the release and cannot be changed without rebuilding, while runtime configuration (`config/runtime.exs`) is evaluated fresh on every boot.

## Implementation in Prismatic Platform

The Prismatic Platform builds releases for deployment to [Fly.io](@/glossary/fly-io.md) via multi-stage Docker containers. The umbrella application produces a single release named `prismatic` containing all 115 apps with their [supervision trees](@/glossary/supervisor.md), started in dependency order by the OTP boot script. The PrismaticSupervisor provides compositional supervision with dependency-aware startup, domain supervisors, and pluggable backends:

```elixir
defmodule PrismaticStorage.Release do
  @moduledoc """
  Release-time operations for the Prismatic Platform.
  Provides database migration, seed data loading, and
  health check functions callable via `bin/prismatic eval`.
  """

  @app :prismatic_storage

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

  @spec seed() :: :ok
  def seed do
    load_app()

    for repo <- repos() do
      seed_file = priv_path(repo, "seeds.exs")

      if File.exists?(seed_file) do
        {:ok, _, _} = Ecto.Migrator.with_repo(repo, fn _repo ->
          Code.eval_file(seed_file)
        end)
      end
    end

    :ok
  end

  @spec health_check() :: {:ok, map()} | {:error, term()}
  def health_check do
    load_app()

    checks = %{
      database: check_database(),
      ets_tables: check_ets(),
      processes: Process.list() |> length(),
      memory_mb: div(:erlang.memory(:total), 1_048_576),
      uptime_seconds: :erlang.statistics(:wall_clock) |> elem(0) |> div(1000)
    }

    case checks.database do
      :ok -> {:ok, checks}
      {:error, _} = error -> error
    end
  end

  defp check_database do
    case Ecto.Adapters.SQL.query(PrismaticStorage.Repo, "SELECT 1") do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, "Database unreachable: #{inspect(reason)}"}
    end
  end

  defp check_ets do
    :ets.all() |> length()
  end

  defp load_app do
    Application.ensure_all_started(@app)
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp priv_path(repo, filename) do
    app = Keyword.fetch!(repo.config(), :otp_app)
    Application.app_dir(app, ["priv", "repo", filename])
  end
end
```

Runtime configuration loads environment variables for database URLs, API keys, secret key bases, [cluster](@/glossary/cluster.md) settings, and feature flags through `config/runtime.exs`. The CI/CD pipeline in GitLab builds the release artifact, runs the full test suite against it, and deploys to staging before production.

## Release Assembly Process

The release build follows a deterministic pipeline that transforms source code into a self-contained deployment artifact:

```
Source Code (115 apps)
      |
      v
  mix deps.get --only prod
      |  Fetch production dependencies
      v
  mix compile --warnings-as-errors
      |  All .ex files compiled to .beam bytecode
      |  Zero warnings enforced (QDP policy)
      v
  mix assets.deploy
      |  Compile TailwindCSS, minify JavaScript
      |  Generate asset digests for cache busting
      v
  mix release prismatic
      |  1. Resolve OTP application dependency graph
      |  2. Copy compiled .beam files from all 115 apps
      |  3. Copy ERTS (Erlang Runtime System) from build machine
      |  4. Generate boot scripts (.script, .boot) with startup order
      |  5. Copy config/runtime.exs for boot-time evaluation
      |  6. Apply rel/overlays (vm.args, env.sh, process manifest)
      |  7. Generate bin/prismatic wrapper scripts
      v
  _build/prod/rel/prismatic/
      |-- bin/prismatic       # Start/stop/remote_console/eval scripts
      |-- lib/                # Compiled .beam files for all 115 apps
      |-- erts-15.0/          # Erlang Runtime System (BEAM VM, scheduler, GC)
      |-- releases/
      |     |-- 0.1.0/
      |     |     |-- start.boot    # OTP boot script (app startup order)
      |     |     |-- sys.config    # Compile-time config snapshot
      |     |     |-- runtime.exs   # Boot-time config (env var resolution)
      |     |     |-- vm.args       # BEAM VM arguments (schedulers, memory, limits)
      |     |-- RELEASES          # Release metadata
      |-- tmp/                # Runtime temporary files (BEAM crash dumps, etc.)
```

## Release Configuration

The release is configured in the umbrella root `mix.exs` with settings that control which executables to include, which applications to bundle, and post-assembly steps:

```elixir
defmodule PrismaticPlatform.MixProject do
  @moduledoc """
  Umbrella project configuration with release settings
  for the Prismatic Platform.
  """

  use Mix.Project

  @spec project() :: keyword()
  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: [
        prismatic: [
          include_executables_for: [:unix],
          applications: [
            runtime_tools: :permanent,
            observer_cli: :permanent
          ],
          steps: [:assemble, :tar],
          cookie: "prismatic_cookie_#{Mix.env()}",
          strip_beams: Mix.env() == :prod,
          include_erts: true
        ]
      ]
    ]
  end
end
```

| Configuration | Location | Evaluated At | Use Case |
|--------------|----------|-------------|----------|
| **config/config.exs** | Source | Compile time | Default values, static config, logger setup |
| **config/dev.exs** | Source | Compile time | Development-specific settings |
| **config/test.exs** | Source | Compile time | Test-specific settings, sandbox repos |
| **config/prod.exs** | Source | Compile time | Production-specific defaults |
| **config/runtime.exs** | Release | Boot time | Environment-specific values (DATABASE_URL, etc.) |
| **rel/vm.args.eex** | Release | Boot time | BEAM VM tuning parameters |
| **rel/env.sh.eex** | Release | Boot time | Shell environment setup |
| **rel/overlays/** | Release | Assembly time | Files copied into release directory |

### Runtime Configuration

```elixir
# config/runtime.exs -- evaluated at release boot time
import Config

if config_env() == :prod do
  # Database configuration from environment
  config :prismatic_storage, PrismaticStorage.Repo,
    url: System.fetch_env!("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "20")),
    ssl: System.get_env("DATABASE_SSL", "true") == "true",
    socket_options: if(System.get_env("IPV6") == "true", do: [:inet6], else: [])

  # Phoenix endpoint configuration
  config :prismatic_web, PrismaticWeb.Endpoint,
    url: [host: System.fetch_env!("PHX_HOST"), port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: String.to_integer(System.get_env("PORT", "4000"))
    ],
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE"),
    server: true

  # Cluster configuration for distributed BEAM nodes on Fly.io
  config :prismatic, :cluster,
    topologies: [
      fly6pn: [
        strategy: Cluster.Strategy.DNSPoll,
        config: [
          query: System.get_env("FLY_APP_NAME", "prismatic") <> ".internal",
          node_basename: System.get_env("FLY_APP_NAME", "prismatic"),
          poll_interval: 5_000
        ]
      ]
    ]

  # API gateway configuration
  config :prismatic_api, PrismaticApi.Endpoint,
    http: [port: String.to_integer(System.get_env("API_PORT", "4004"))],
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE"),
    server: true

  # Feature flags
  config :prismatic, :features,
    easm_enabled: System.get_env("EASM_ENABLED", "true") == "true",
    osint_enabled: System.get_env("OSINT_ENABLED", "true") == "true",
    api_enabled: System.get_env("API_ENABLED", "true") == "true"
end
```

### VM Arguments

The BEAM VM is tuned for the Prismatic Platform's workload through `rel/vm.args.eex`:

```
# rel/vm.args.eex -- BEAM VM tuning
## Node name and cookie for distribution
-name <%= release.name %>@${FLY_PRIVATE_IP:-127.0.0.1}
-setcookie ${RELEASE_COOKIE}

## Process limits (1M for agent-heavy workload with 530 agents)
+P 1048576
+Q 65536

## Scheduler configuration (match Fly.io machine CPU count)
+S ${SCHEDULERS:-4}:${SCHEDULERS:-4}
+SDcpu ${SCHEDULERS:-4}:${SCHEDULERS:-4}

## Memory allocator tuning
+MBas aobf    # Binary allocator: address order best fit
+MHas aobf    # Heap allocator: address order best fit
+MMmcs 30     # Max cached segments per allocator carrier

## ETS table limit
+e 65536

## Atom table size (large codebase needs more atoms)
+t 1048576

## Distribution protocol (IPv6 on Fly.io internal network)
-proto_dist inet6_tcp

## Kernel settings
-kernel inet_dist_listen_min 4370
-kernel inet_dist_listen_max 4380
```

| VM Argument | Default | Prismatic Value | Purpose |
|-------------|---------|-----------------|---------|
| `+P` | 262,144 | 1,048,576 | Max processes (530 agents + connections + workers) |
| `+Q` | 65,536 | 65,536 | Max ports (file handles, sockets) |
| `+S` | CPU count | 4:4 | Online:available schedulers |
| `+e` | 2,053 | 65,536 | Max ETS tables |
| `+t` | 1,048,576 | 1,048,576 | Atom table size |
| `+MBas` | gf | aobf | Binary allocator strategy |

## Docker Multi-Stage Build

The release is built inside a multi-stage Docker build that separates the build environment (with full toolchain) from the runtime environment (minimal OS + release only):

```dockerfile
# Stage 1: Build (full toolchain)
FROM hexpm/elixir:1.19.0-erlang-27.0-debian-bookworm AS builder

WORKDIR /app
ENV MIX_ENV=prod

# Install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git npm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Cache dependency resolution
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/*/
COPY config config
RUN mix deps.get --only prod && mix deps.compile

# Compile application
COPY apps apps
COPY priv priv
RUN mix compile --warnings-as-errors

# Build assets (TailwindCSS, JavaScript)
COPY apps/prismatic_web/assets apps/prismatic_web/assets
RUN cd apps/prismatic_web && mix assets.deploy

# Assemble release
RUN mix release prismatic

# Stage 2: Runtime (minimal image)
FROM debian:bookworm-slim AS runner

RUN apt-get update -y && \
    apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8

WORKDIR /app
RUN chown nobody:nogroup /app
USER nobody:nogroup

COPY --from=builder --chown=nobody:nogroup /app/_build/prod/rel/prismatic ./

ENV PHX_HOST=prismatic-prod.fly.dev
ENV PORT=4000

CMD ["bin/prismatic", "start"]
```

| Build Stage | Base Image | Size | Contents |
|------------|-----------|------|----------|
| **Builder** | hexpm/elixir (1.2GB) | ~2GB with deps | Full Elixir/Erlang toolchain, npm, build-essential |
| **Runner** | debian:bookworm-slim (80MB) | ~150MB | ERTS, compiled BEAM files, runtime libs only |

The size reduction from ~2GB to ~150MB is achieved by excluding the entire Elixir/Erlang toolchain, npm, source code, and build artifacts from the runtime image. Only the compiled release directory is copied.

## Release Operations

The release binary supports several operational commands through generated wrapper scripts:

| Command | Purpose | Example |
|---------|---------|---------|
| `bin/prismatic start` | Start in foreground | Production entry point in Docker CMD |
| `bin/prismatic start_iex` | Start with IEx shell | Development and debugging |
| `bin/prismatic daemon` | Start as background daemon | Traditional server deployment |
| `bin/prismatic stop` | Stop running instance | Graceful shutdown with drain |
| `bin/prismatic remote` | Connect IEx to running node | Live production debugging |
| `bin/prismatic rpc` | Execute function on running node | Health checks, diagnostics |
| `bin/prismatic eval` | Execute one-off command | Database migrations, seeds |
| `bin/prismatic pid` | Get OS PID of running instance | Process management |
| `bin/prismatic version` | Print release version | Deployment verification |

```bash
# Run database migrations at deploy time (before starting the app)
bin/prismatic eval "PrismaticStorage.Release.migrate()"

# Seed initial data
bin/prismatic eval "PrismaticStorage.Release.seed()"

# Remote shell into production for live debugging
bin/prismatic remote

# Health check via RPC (useful for liveness probes)
bin/prismatic rpc "PrismaticStorage.Release.health_check()"

# Evaluate arbitrary Elixir in the release context
bin/prismatic eval "IO.inspect(:erlang.memory())"
```

## Hot Code Reload vs. Immutable Deployment

While [hot code reload](@/glossary/hot-code-reload.md) is a legendary BEAM capability, modern Elixir releases favor immutable deployments (build new release, deploy, restart) over in-place upgrades for production systems:

| Approach | Method | Risk | Complexity | Use Case |
|----------|--------|------|------------|----------|
| **Immutable Deploy** | Build new release, replace old | Low (rollback = deploy previous) | Low | Standard production (recommended) |
| **Hot Upgrade** | `mix release --upgrade` with appups | Medium (state migration required) | High | Zero-downtime critical systems |
| **Rolling Restart** | Deploy to instances sequentially | Low (instances restart independently) | Low | Clustered deployments on Fly.io |
| **Blue-Green** | Deploy to parallel environment, switch | Very Low (instant rollback) | Medium | Critical production with canary |

The Prismatic Platform uses rolling restarts on Fly.io -- new release images are deployed to instances one at a time, maintaining availability through the load balancer while each instance restarts with the new code. The BEAM's fast startup time (typically under 5 seconds for the full platform) makes rolling restarts practical without the complexity of hot code upgrades.

## Deployment Pipeline

The complete deployment pipeline from code push to production:

```
git push --> GitLab CI Pipeline
                |
                v
            Build Stage: mix deps.get && mix compile --warnings-as-errors
                |
                v
            Test Stage: mix test --cover (121 tests)
                |
                v
            Quality Stage: mix quality.gates (13 domains, 0 QDP required)
                |
                v
            Release Stage: mix release prismatic
                |
                v
            Docker Stage: docker build --tag registry/prismatic:$CI_COMMIT_SHA
                |
                v
            Deploy Staging: fly deploy --app prismatic-staging --image $TAG
                |
                v
            Verify Staging: health checks + smoke tests + performance verification
                |  (<250ms page load, <100ms server render)
                v
            Deploy Production: fly deploy --app prismatic-prod --strategy rolling
                |
                v
            Verify Production: health check + quality DNA snapshot
```

Each stage is a gate: failure at any stage prevents progression to the next. The Quality Stage is particularly strict, requiring 0 [QDP](@/glossary/qdp.md) across all 13 quality domains before the release can be assembled. This ensures that no quality regression ever reaches production.

## Release Observability

Deployed releases emit [telemetry](@/glossary/observability.md) events that provide visibility into runtime behavior:

```elixir
defmodule PrismaticRelease.Telemetry do
  @moduledoc """
  Release-level telemetry for monitoring deployment health,
  boot time, and resource utilization.
  """

  @spec emit_boot_telemetry() :: :ok
  def emit_boot_telemetry do
    :telemetry.execute(
      [:prismatic, :release, :boot],
      %{
        boot_time_ms: boot_duration_ms(),
        process_count: length(Process.list()),
        ets_table_count: length(:ets.all()),
        memory_mb: div(:erlang.memory(:total), 1_048_576)
      },
      %{
        release_name: "prismatic",
        node: node(),
        otp_release: :erlang.system_info(:otp_release) |> to_string()
      }
    )

    :ok
  end

  defp boot_duration_ms do
    {wall_clock_ms, _} = :erlang.statistics(:wall_clock)
    wall_clock_ms
  end
end
```

## Related Terms

- [Docker](@/glossary/docker.md) - Container packaging for release deployment
- [Fly.io](@/glossary/fly-io.md) - Production hosting platform for releases
- [Hot Code Reload](@/glossary/hot-code-reload.md) - BEAM capability for live code updates
- [Mix](@/glossary/mix.md) - Build tool that assembles releases
- [BEAM](@/glossary/beam.md) - Runtime system bundled in releases (ERTS)
- [Supervisor](@/glossary/supervisor.md) - OTP process hierarchy started by release boot scripts
- [Endpoint](@/glossary/endpoint.md) - Phoenix web server started during release boot
- [Cluster](@/glossary/cluster.md) - Multi-node configuration via release runtime.exs
- [Hex](@/glossary/hex.md) - Package manager whose deps are compiled into releases
- [Observability](@/glossary/observability.md) - Monitoring infrastructure for deployed releases
- [QDP](@/glossary/qdp.md) - Quality gates that must pass before release assembly

## See Also

- [Architecture](@/architecture/_index.md) - Deployment and release architecture
- [Technologies](@/technologies/_index.md) - Infrastructure and hosting stack

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
