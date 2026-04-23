+++
title = "Releases (Elixir)"
weight = 50
[extra]
category = "technology"
description = "Self-contained deployment bundles with embedded BEAM runtime"
related_terms = ["mix", "otp", "docker", "fly-io", "beam", "hot-code-reload"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 980
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Releases", "Elixir", "Self-contained", "BEAM", "glossary", "technology", "Prismatic Platform", "Erlang"]
tags = ["glossary", "technology", "releases-elixir", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Releases (Elixir) - Prismatic Platform"
+++

## Definition & Overview

Elixir releases are self-contained deployment artifacts that bundle compiled application code, the Erlang Runtime System (ERTS), and all dependencies into a single distributable package. Built via `mix release`, releases produce a directory containing boot scripts, configuration files, and the BEAM virtual machine itself, eliminating the need for Elixir or Erlang to be installed on the target machine. Releases are the production-recommended deployment method for Elixir applications, offering deterministic builds, efficient startup, and operational simplicity.

The release system was introduced as a first-class feature in Elixir 1.9, replacing the previous community-maintained `distillery` library. It leverages the Erlang/OTP release handling infrastructure (`:systools` and `:release_handler`) while providing an idiomatic Elixir configuration experience through `mix.exs` release definitions and `config/runtime.exs` for environment-specific runtime configuration.

Releases differ fundamentally from development-mode execution (`mix phx.server`, `iex -S mix`). In development, code is compiled on-the-fly, configuration is resolved at compile time, and the full Mix build toolchain is available. In a release, everything is pre-compiled to BEAM bytecode (.beam files), configuration is resolved at boot time from environment variables, and Mix is not available -- the application runs directly on the BEAM VM with minimal overhead.

| Aspect | Development Mode | Release Mode |
|--------|-----------------|--------------|
| **Runtime** | Requires Elixir/Erlang installed | Self-contained ERTS |
| **Compilation** | On-the-fly | Pre-compiled .beam files |
| **Configuration** | `config/config.exs` (compile-time) | `config/runtime.exs` (boot-time) |
| **Mix Available** | Yes | No |
| **Start Command** | `mix phx.server` | `bin/app start` |
| **Size** | Full dev environment | Minimal runtime (~25-50MB) |
| **Hot Code Upgrade** | Automatic | Supported via relup files |

## Technical Deep Dive

### Release Structure

A compiled release produces a directory structure optimized for deployment:

```
_build/prod/rel/prismatic/
  bin/
    prismatic          # Main entry point script
    prismatic.bat      # Windows entry point
  erts-14.2/           # Embedded Erlang Runtime System
    bin/
    lib/
    include/
  lib/                 # Compiled application .beam files
    prismatic-0.1.0/
    prismatic_web-0.1.0/
    prismatic_perimeter-0.1.0/
    phoenix-1.7.12/
    ... (all dependencies)
  releases/
    0.1.0/
      elixir            # Elixir boot script
      elixir.bat
      env.sh            # Environment configuration
      env.bat
      start.boot        # OTP boot file
      start.script      # OTP script file
      sys.config        # System configuration
      vm.args           # BEAM VM arguments
```

### Build Pipeline

The release build pipeline follows a deterministic sequence:

```elixir
# In mix.exs - Release configuration
defmodule Prismatic.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      releases: [
        prismatic: [
          include_executables_for: [:unix],
          applications: [
            runtime_tools: :permanent,
            prismatic: :permanent,
            prismatic_web: :permanent,
            prismatic_api: :permanent,
            prismatic_perimeter: :permanent,
            prismatic_agents: :permanent
          ],
          steps: [:assemble, :tar],
          strip_beams: true,
          cookie: "prismatic-release-cookie"
        ]
      ]
    ]
  end
end
```

The build process compiles all applications, resolves the dependency graph, determines the boot order, and assembles the release directory. The `strip_beams: true` option removes debug information from .beam files, reducing the release size by approximately 30-40%.

### Runtime Configuration

Runtime configuration is the key differentiator between development and release modes. The `config/runtime.exs` file is evaluated at application boot time, allowing configuration to read from environment variables that are set at deploy time rather than compile time:

```elixir
# config/runtime.exs - Evaluated at boot time, not compile time
import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise "DATABASE_URL environment variable is not set"

  config :prismatic, Prismatic.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    ssl: true,
    ssl_opts: [verify: :verify_peer]

  config :prismatic_web, PrismaticWeb.Endpoint,
    url: [host: System.get_env("PHX_HOST") || "prismatic-prod.fly.dev", port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: String.to_integer(System.get_env("PORT") || "4000")
    ],
    secret_key_base: System.get_env("SECRET_KEY_BASE") ||
      raise "SECRET_KEY_BASE environment variable is not set"

  # Ollama local AI configuration
  config :prismatic, :ollama,
    base_url: System.get_env("OLLAMA_BASE_URL") || "http://localhost:11434",
    default_model: System.get_env("OLLAMA_MODEL") || "qwen3-coder",
    timeout: String.to_integer(System.get_env("OLLAMA_TIMEOUT") || "30000")

  # Meilisearch configuration
  config :prismatic, :meilisearch,
    url: System.get_env("MEILI_URL") || "http://localhost:7700",
    api_key: System.get_env("MEILI_MASTER_KEY")
end
```

### Custom Release Commands

Releases support custom commands for administrative tasks that run in the release context without Mix:

```elixir
# rel/overlays/bin/migrate
#!/bin/sh
set -eu

cd -P -- "$(dirname -- "$0")"
exec ./prismatic eval "Prismatic.Release.migrate()"

# lib/prismatic/release.ex
defmodule Prismatic.Release do
  @moduledoc """
  Release commands for database migrations and administrative tasks.
  These run without Mix in the release environment.
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

  @spec seed() :: :ok
  def seed do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, fn _repo ->
        seed_file = Application.app_dir(@app, "priv/repo/seeds.exs")
        if File.exists?(seed_file), do: Code.eval_file(seed_file)
      end)
    end

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

### Multi-Stage Docker Builds

The Prismatic Platform uses multi-stage Docker builds to produce minimal release containers. The build stage compiles the release in a full Elixir/Erlang environment, while the runtime stage contains only the compiled release and its minimal OS dependencies:

```dockerfile
# Build stage - full compilation environment
FROM hexpm/elixir:1.19.0-erlang-27.0-debian-bookworm AS build

RUN apt-get update && apt-get install -y build-essential git npm

WORKDIR /app
ENV MIX_ENV=prod

COPY mix.exs mix.lock ./
COPY apps/*/mix.exs ./apps/
RUN mix deps.get --only prod
RUN mix deps.compile

COPY . .
RUN mix assets.deploy
RUN mix release prismatic

# Runtime stage - minimal deployment image
FROM debian:bookworm-slim AS runtime

RUN apt-get update && \
    apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV LANG=en_US.UTF-8
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

WORKDIR /app
RUN useradd --create-home app
USER app

COPY --from=build --chown=app:app /app/_build/prod/rel/prismatic ./

ENV PHX_SERVER=true
CMD ["bin/prismatic", "start"]
```

### Fly.io Deployment Integration

The release integrates with [Fly.io](@/glossary/fly-io.md) for production deployment, using Fly's process management to handle health checks, rolling deployments, and geographic distribution:

```toml
# fly.toml
app = "prismatic-prod"

[build]
  dockerfile = "Dockerfile"

[deploy]
  strategy = "rolling"
  release_command = "bin/prismatic eval 'Prismatic.Release.migrate()'"

[env]
  PHX_HOST = "prismatic-prod.fly.dev"
  PORT = "4000"

[[services]]
  internal_port = 4000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

  [[services.http_checks]]
    interval = "15s"
    timeout = "5s"
    path = "/api/v1/health"
```

### Boot Order Management

In an umbrella application with 90 apps, boot ordering is critical. The [PrismaticSupervisor](@/glossary/supervisor.md) manages dependency-aware startup, ensuring that core services (storage, configuration) start before dependent applications (web, API, agents):

```elixir
defmodule PrismaticSupervisor.BootOrder do
  @moduledoc """
  Determines the correct boot order for all umbrella applications
  based on their declared dependencies. Used during release startup
  to ensure services are available before their dependents start.
  """

  @spec compute_boot_order([atom()]) :: {:ok, [atom()]} | {:error, :circular_dependency}
  def compute_boot_order(applications) do
    graph = build_dependency_graph(applications)

    case topological_sort(graph) do
      {:ok, sorted} -> {:ok, sorted}
      {:error, cycle} -> {:error, {:circular_dependency, cycle}}
    end
  end

  defp build_dependency_graph(applications) do
    Enum.reduce(applications, %{}, fn app, graph ->
      deps = Application.spec(app, :applications) || []
      prismatic_deps = Enum.filter(deps, &String.starts_with?(Atom.to_string(&1), "prismatic"))
      Map.put(graph, app, prismatic_deps)
    end)
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform uses Elixir releases as the exclusive production deployment method:

**Single Release Bundle**: All 90 umbrella applications compile into a single release artifact. This ensures that inter-application function calls remain zero-cost (direct BEAM module calls) rather than requiring network communication as in microservice architectures.

**Staging-Production Parity**: The same release artifact is deployed to both prismatic-staging.fly.dev and prismatic-prod.fly.dev, with environment-specific behavior controlled entirely through runtime configuration. This eliminates "works on staging but not production" discrepancies.

**Custom Administrative Commands**: Release commands handle database migrations (`bin/prismatic eval 'Prismatic.Release.migrate()'`), data seeding, cache warming, and health diagnostics without requiring Mix or the full development toolchain on production servers.

**Container Optimization**: Multi-stage Docker builds produce runtime images under 100MB, containing only the compiled release and minimal OS dependencies. This reduces deployment time, attack surface, and infrastructure costs.

## Best Practices

1. **Always Use `runtime.exs`**: Never hardcode environment-specific values in `config/config.exs`. All deployment-variable configuration belongs in `config/runtime.exs` where it reads from environment variables at boot time.

2. **Strip BEAM Files**: Enable `strip_beams: true` in release configuration to remove debug chunks from .beam files. This reduces release size significantly without affecting runtime behavior.

3. **Test Release Builds Locally**: Run `MIX_ENV=prod mix release` and test the resulting artifact locally before deploying. Many configuration and compilation issues only manifest in release mode.

4. **Include Health Check Endpoints**: Release applications should expose a lightweight health check endpoint that deployment infrastructure can probe. The Prismatic API's `/api/v1/health` responds in under 10ms.

5. **Use Release Overlays**: Place deployment-specific scripts, configuration templates, and utility files in `rel/overlays/` for inclusion in the release without modifying source code.

6. **Pin ERTS Version**: Lock the Erlang/OTP version in your build environment to ensure reproducible releases. Version mismatches between build and runtime ERTS cause cryptic failures.

7. **Validate Startup Order**: In umbrella applications, explicitly declare application dependencies and verify boot order. Missing dependencies cause runtime crashes that only appear in release mode.

## Common Pitfalls

- **Compile-Time vs Runtime Configuration**: Using `Application.get_env/3` in module attributes or `@constants` captures the compile-time value, not the runtime value from `runtime.exs`. Use function calls instead of module attributes for runtime-configurable values.

- **Missing Applications in Release**: Forgetting to include an application in the release configuration results in `(UndefinedFunctionError)` at runtime. Always verify the release includes all required applications.

- **Large Release Artifacts**: Including development dependencies, documentation, or test files inflates release size. Use `only: :prod` in dependency declarations and verify the release contents.

- **Cookie Mismatch**: BEAM nodes in a cluster must share the same cookie. Hardcoding cookies in `mix.exs` can conflict with deployment-set cookies. Use `RELEASE_COOKIE` environment variable for cluster configurations.

- **Path Assumptions**: Code that assumes relative paths work differently in release mode. Always use `Application.app_dir/2` or `:code.priv_dir/1` for file access in release contexts.

- **Missing Native Dependencies**: NIFs and ports require matching native libraries on the deployment target. Ensure the build and runtime environments share the same OS and architecture.

## Related Concepts

- [Mix](@/glossary/mix.md) - Build tool that compiles and assembles release artifacts
- [OTP](@/glossary/otp.md) - Runtime framework included in every release bundle
- [BEAM](@/glossary/beam.md) - Virtual machine embedded in release artifacts
- [Docker](@/glossary/docker.md) - Containerization wrapping releases for cloud deployment
- [Fly.io](@/glossary/fly-io.md) - Hosting platform running Prismatic release containers
- [Hot Code Reload](@/glossary/hot-code-reload.md) - Runtime code upgrade capability enabled by releases
- [Supervision Tree](@/glossary/supervision-tree.md) - Process hierarchy managing application startup in releases

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Apps](@/apps/_index.md) - The 90 umbrella applications bundled into a single release

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)