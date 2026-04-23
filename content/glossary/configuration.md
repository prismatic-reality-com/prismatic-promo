+++
title = "Configuration"
weight = 50
[extra]
description = "System settings management encompassing application parameters, environment variables, feature flags, and runtime options that control platform behavior without code changes"
category = "architecture"
related_terms = ["configuration-drift", "compile-time", "containerization", "connection-pool", "consistency"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["configuration", "config management", "environment variables", "feature flags", "runtime config", "glossary", "Prismatic Platform"]
tags = ["glossary", "architecture", "configuration"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Configuration - Prismatic Platform"
+++

## Definition & Overview

Configuration is the set of parameters, settings, and options that control a software system's behavior without requiring code changes. Configuration separates the "what to do" (code) from the "how to do it" (settings), enabling the same codebase to operate differently across environments (development, staging, production), deployment targets (local, cloud, container), and operational contexts (high-throughput, low-latency, debugging).

Configuration management has evolved through several paradigms: hardcoded values (anti-pattern), configuration files (static), environment variables (twelve-factor app), configuration servers (dynamic), and configuration-as-code (versioned, reviewed). Modern platforms typically use a layered approach where defaults are overridden by environment-specific values, which are overridden by runtime configurations.

The Prismatic Platform uses Elixir's multi-layered configuration system: `config/config.exs` for compile-time defaults, `config/dev.exs`/`config/prod.exs` for environment overrides, `config/runtime.exs` for runtime configuration from environment variables, and `Application.compile_env/3` for compile-time configuration validation. The umbrella architecture adds complexity -- each of the 115 apps may have its own configuration namespace, and the PrismaticSupervisor manages configuration-dependent startup ordering.

## Technical Deep Dive

### Configuration Layers

| Layer | File | When Evaluated | Mutability |
|-------|------|---------------|------------|
| **Defaults** | `config/config.exs` | Compile-time | Immutable after build |
| **Environment** | `config/{dev,test,prod}.exs` | Compile-time | Immutable after build |
| **Runtime** | `config/runtime.exs` | Application start | Per-deployment |
| **Application Env** | `Application.put_env/3` | Runtime | Dynamic |
| **System Env** | `System.get_env/1` | Runtime | External |
| **ETS** | Feature flags | Runtime | Dynamic, sub-ms |

### Elixir Configuration Pattern

```elixir
# config/config.exs - Compile-time defaults
import Config

config :prismatic_web,
  port: 4000,
  check_origin: true

config :prismatic_storage_ets,
  read_concurrency: true,
  write_concurrency: false

config :prismatic_supervisor,
  registry_backend: PrismaticSupervisor.Registry.ETS

# config/prod.exs - Production overrides
import Config

config :prismatic_supervisor,
  registry_backend: PrismaticSupervisor.Registry.Horde

# config/runtime.exs - Runtime from environment
import Config

if config_env() == :prod do
  config :prismatic_web,
    port: String.to_integer(System.get_env("PORT") || "4000"),
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE"),
    url: [host: System.get_env("PHX_HOST") || "prismatic-prod.fly.dev"]

  config :prismatic, PrismaticStorage.Repo,
    url: System.fetch_env!("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")
end
```

### Configuration Validation

```elixir
defmodule PrismaticConfig.Validator do
  @moduledoc """
  Validates platform configuration at startup.
  Catches misconfigurations before they cause runtime errors.
  Integrates with PrismaticSupervisor's dependency-aware startup.
  """

  @type validation_result :: {:ok, map()} | {:error, [String.t()]}

  @required_prod_vars ~w(
    DATABASE_URL
    SECRET_KEY_BASE
    PHX_HOST
  )

  @spec validate_environment() :: validation_result()
  def validate_environment do
    errors = if Mix.env() == :prod do
      @required_prod_vars
      |> Enum.reject(&System.get_env/1)
      |> Enum.map(&"Missing required env var: #{&1}")
    else
      []
    end

    config_errors = validate_config_consistency()

    case errors ++ config_errors do
      [] -> {:ok, %{env: Mix.env(), validated_at: DateTime.utc_now()}}
      found -> {:error, found}
    end
  end

  defp validate_config_consistency do
    checks = [
      check_port_range(:prismatic_web, :port, 1024, 65535),
      check_pool_size(:prismatic, PrismaticStorage.Repo),
      check_backend_module(:prismatic_supervisor, :registry_backend)
    ]

    Enum.reject(checks, &is_nil/1)
  end

  defp check_port_range(app, key, min, max) do
    port = Application.get_env(app, key)
    if port && (port < min or port > max) do
      "#{app}.#{key} = #{port} outside valid range #{min}-#{max}"
    end
  end

  defp check_pool_size(app, repo) do
    config = Application.get_env(app, repo, [])
    pool = Keyword.get(config, :pool_size, 10)
    if pool < 1 or pool > 100, do: "#{inspect(repo)} pool_size #{pool} outside 1-100 range"
  end

  defp check_backend_module(app, key) do
    module = Application.get_env(app, key)
    if module && not Code.ensure_loaded?(module) do
      "#{app}.#{key} = #{inspect(module)} is not a loaded module"
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform's configuration architecture follows the twelve-factor app methodology, with Elixir-specific enhancements. Compile-time configuration (`Application.compile_env/3`) is used for values that influence code generation, such as the PrismaticSupervisor registry backend (ETS for dev, Horde for prod). Runtime configuration (`config/runtime.exs`) reads secrets and deployment-specific values from environment variables, keeping sensitive data out of the codebase.

The umbrella architecture requires careful configuration namespacing. Each of the 115 apps uses its own OTP application name as the configuration namespace, preventing key collisions. Cross-app configuration dependencies are managed through the PrismaticSupervisor's DependencyResolver, which ensures that apps with configuration dependencies start in the correct order.

Feature flags are stored in ETS for sub-millisecond access, enabling runtime behavior changes without deployment. This is particularly useful for the OSINT toolbox, where individual tools can be enabled/disabled at runtime, and for the Perimeter module, where compliance frameworks can be activated per-tenant.

## Usage in Prismatic Platform

The Fly.io deployment pipeline manages production configuration through environment secrets (`fly secrets set`). Sensitive values like `DATABASE_URL`, `SECRET_KEY_BASE`, and API keys are stored as Fly secrets and injected as environment variables at runtime. The `config/runtime.exs` file reads these values and applies them to the application configuration.

The Ollama local AI integration uses configuration to manage model selection and fallback behavior. The `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` environment variables control whether requests go to the local Ollama instance or the cloud API, enabling seamless switching between local and cloud AI without code changes.

The Quality DNA system persists configuration state across sessions in `.claude/quality-dna/current-state.json`, enabling the Quality Floor Guardian to detect configuration drift between sessions and alert when platform configuration deviates from the established baseline.

## Cross-References

- [Configuration Drift](/glossary/configuration-drift/) - environment state divergence
- [Compile-Time](/glossary/compile-time/) - build phase configuration evaluation
- [Containerization](/glossary/containerization/) - container configuration management
- [Connection Pool](/glossary/connection-pool/) - pool configuration settings
- **Consistency** - configuration consistency across environments
- **Livebooks**: `livebooks/domains/platform_administration/` - configuration management
- **Academy**: Platform configuration and deployment topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
