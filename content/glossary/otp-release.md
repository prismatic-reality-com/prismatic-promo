+++
title = "OTP Release"
weight = 50
[extra]
description = "A self-contained deployment package for Elixir/Erlang applications, including the BEAM VM, compiled code, and configuration."
category = "elixir"
related_terms = ["otp", "beam", "deployment", "docker"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OTP release", "deployment", "Elixir", "BEAM", "production", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "OTP Release - Prismatic Platform"
+++

## Definition & Overview

An OTP release is a self-contained, deployable package for Elixir and Erlang applications. It bundles the compiled application code (BEAM bytecode), all dependencies, the Erlang runtime system (ERTS), boot scripts, configuration, and optionally a stripped-down version of the BEAM virtual machine into a single artifact. A release can be copied to a target machine and started without requiring Elixir, Erlang, or Mix to be installed, making it the standard production deployment mechanism for BEAM-based applications.

Releases provide several advantages over running applications with `mix` in production. They include only the required OTP applications (not development tools), support runtime configuration through config providers, enable hot code upgrades (replacing running code without stopping the system), and produce deterministic artifacts suitable for containerized deployments. The release is the unit of deployment in the BEAM ecosystem, analogous to a Docker image in the container world or a JAR file in the Java ecosystem.

The Prismatic Platform builds OTP releases for both staging and production deployments on Fly.io. The release includes all 115 umbrella applications, the Phoenix web server, the API gateway, and all GenServer-based registries (ToolRegistry, TopicRegistry, SourceRegistry). The release configuration handles secret management through runtime configuration, database migration execution, and health check endpoint registration.

## Technical Deep Dive

Elixir's built-in release system (introduced in Elixir 1.9) uses `mix release` to build releases. The configuration in `mix.exs` and `config/runtime.exs` controls what is included in the release and how it is configured at startup. The release directory structure includes `bin/` (startup scripts), `lib/` (compiled applications), `releases/` (boot scripts and configuration), and optionally `erts-VERSION/` (the Erlang runtime).

Runtime configuration through `config/runtime.exs` is critical for production deployments because it runs when the release starts, not when it is built. This allows environment variables, secrets, and deployment-specific settings to be injected at startup time rather than baked into the release artifact. This separation of build-time and run-time configuration is essential for twelve-factor app compliance.

```elixir
# config/runtime.exs - Executed at release startup
import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise "DATABASE_URL environment variable is not set"

  config :prismatic, PrismaticDd.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    ssl: true,
    ssl_opts: [verify: :verify_peer]

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

  # API gateway on separate port
  config :prismatic_api, PrismaticApi.Endpoint,
    http: [port: String.to_integer(System.get_env("API_PORT") || "4004")],
    secret_key_base: secret_key_base,
    server: true

  # OSINT API keys from environment
  config :prismatic_osint_core,
    shodan_api_key: System.get_env("SHODAN_API_KEY"),
    virustotal_api_key: System.get_env("VIRUSTOTAL_API_KEY"),
    censys_api_id: System.get_env("CENSYS_API_ID"),
    censys_api_secret: System.get_env("CENSYS_API_SECRET")
end
```

Release health checks and startup probes ensure the system is fully operational before accepting traffic. The platform registers a startup callback that verifies database connectivity, ETS table creation, and registry population before reporting ready status to the orchestrator (Fly.io).

```elixir
# rel/overlays/bin/migrate
#!/bin/sh
# Release migration script - runs before app start
set -e

cd -P -- "$(dirname -- "$0")"
exec ./prismatic eval "PrismaticDd.Release.migrate()"
```

## Architecture & Implementation

The Prismatic Platform's release configuration handles the complexity of an umbrella application with 115 apps. The release includes a custom `PrismaticSupervisor` that orchestrates the startup order of all applications, ensuring dependencies are satisfied before dependents start. The dependency resolver builds a directed acyclic graph of application dependencies and starts them in topological order.

The Docker-based build process uses multi-stage builds for minimal image size. The build stage compiles the release on a full Elixir/Erlang image. The runtime stage copies only the release artifact into a slim Alpine Linux image, producing images under 100MB. The Dockerfile includes security hardening (non-root user, minimal packages, read-only filesystem).

Hot code upgrades, while supported by OTP releases, are not used in the Prismatic Platform's production deployment. Instead, the platform uses blue-green deployments on Fly.io, where new releases are deployed alongside the running version and traffic is switched after health checks pass. This approach is simpler to reason about and rollback, at the cost of brief downtime during the switch.

## Usage in Prismatic Platform

Release configuration in the umbrella project:

```elixir
# mix.exs - Release configuration
defmodule PrismaticPlatform.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      releases: releases(),
      # ...
    ]
  end

  defp releases do
    [
      prismatic: [
        include_executables_for: [:unix],
        applications: release_applications(),
        steps: [:assemble, &copy_extra_files/1],
        cookie: System.get_env("RELEASE_COOKIE") || "prismatic-secure-cookie"
      ]
    ]
  end

  defp release_applications do
    [
      # Core applications
      prismatic: :permanent,
      prismatic_web: :permanent,
      prismatic_api: :permanent,
      prismatic_supervisor: :permanent,

      # Data layer
      prismatic_dd: :permanent,
      prismatic_storage_ecto: :permanent,
      prismatic_storage_ets: :permanent,

      # Intelligence
      prismatic_osint_core: :permanent,
      prismatic_perimeter: :permanent,

      # Learning
      prismatic_academy: :permanent,

      # Runtime tools
      runtime_tools: :permanent,
      os_mon: :permanent
    ]
  end

  defp copy_extra_files(release) do
    # Copy migration scripts and static assets
    File.cp_r!("rel/overlays", release.path)
    release
  end
end

# Release helper module for migrations and maintenance
defmodule PrismaticDd.Release do
  @moduledoc """
  Release-time tasks: migrations, seeding, health checks.
  Executed via `bin/prismatic eval "PrismaticDd.Release.migrate()"`.
  """

  @spec migrate() :: :ok
  def migrate do
    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end

    :ok
  end

  @spec rollback(module(), integer()) :: :ok
  def rollback(repo, version) do
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
    :ok
  end

  defp repos do
    Application.fetch_env!(:prismatic, :ecto_repos)
  end
end
```

The release system ensures that every deployment of the Prismatic Platform is a self-contained, reproducible artifact that starts reliably in any environment with the correct environment variables, supporting the platform's multi-environment deployment strategy across staging and production.

## Cross-References

- [OTP](/glossary/otp/) - The framework providing release infrastructure
- [BEAM](/glossary/beam/) - Virtual machine included in releases
- [Docker](/glossary/docker/) - Container format for release deployment
- [Module](/glossary/module/) - Compiled code units included in releases
- [GenServer](/glossary/genserver/) - Processes started by release boot scripts

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
