+++
title = "Environment"
description = "A deployment target configuration (development, staging, production) that determines application behavior, resource allocation, security posture, and external service connections."
weight = 50

[extra]
category = "devops"
tags = ["environment", "deployment", "dev", "staging", "production", "configuration", "mix-env", "elixir", "infrastructure", "fly-io"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "beginner"
audience = ["developers", "devops-engineers", "architects", "sre"]
related_terms = ["deployment", "configuration", "mix-env", "docker", "fly-io", "ci-cd", "release"]
key_concepts = ["environment-parity", "configuration-injection", "secret-management", "environment-variable", "mix-env"]
platforms = ["elixir", "beam", "fly-io", "docker", "gitlab-ci"]
prerequisites = ["deployment-basics", "configuration-management"]
use_cases = ["multi-environment-deployment", "configuration-management", "secret-management", "testing-isolation"]
complexity = "low"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Environment", "deployment", "dev", "staging", "production", "glossary", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Environment - Prismatic Platform"
+++

## Definition and Overview

In software engineering, an environment refers to a distinct deployment target where an application runs with a specific configuration profile. Each environment serves a different purpose in the software development lifecycle: development environments support rapid iteration with debug tooling, staging environments mirror production for pre-release validation, and production environments serve real users with optimized performance and security configurations.

Environments are distinguished by their configuration values, connected services, resource allocation, security posture, and operational characteristics. The principle of environment parity (from the Twelve-Factor App methodology) states that development, staging, and production should be as similar as possible to minimize deployment surprises. However, practical differences are unavoidable -- development uses local databases while production uses managed clusters, staging may have synthetic data while production has real data, and debug tooling is enabled in development but disabled in production.

In the Elixir ecosystem, the Mix build tool provides first-class environment support through `MIX_ENV`, which controls compile-time configuration, dependency selection, and code compilation. The standard environments are `:dev` (development), `:test` (testing), and `:prod` (production), though custom environments can be defined. Importantly, `MIX_ENV` is a compile-time concept in Elixir releases -- the environment is baked into the compiled release artifact, and runtime configuration uses a separate mechanism (`config/runtime.exs`).

## Technical Deep Dive

### Standard Environment Hierarchy

| Environment | Purpose | Configuration Profile |
|-------------|---------|----------------------|
| **Development** (`:dev`) | Local coding, debugging, rapid iteration | Debug logging, code reload, local services, seed data |
| **Test** (`:test`) | Automated testing, CI/CD pipelines | In-memory/sandboxed DB, mocked externals, deterministic seeds |
| **Staging** | Pre-production validation, integration testing | Production-like config, synthetic data, restricted access |
| **Production** (`:prod`) | Live user-facing deployment | Optimized compilation, structured logging, real services, secrets |

### Elixir Configuration Layers

Elixir uses a layered configuration system where each layer can override values from the previous:

```
config/config.exs          # Base configuration (all environments)
  |
  +-- config/dev.exs       # Development overrides (MIX_ENV=dev)
  +-- config/test.exs      # Test overrides (MIX_ENV=test)
  +-- config/prod.exs      # Production overrides (MIX_ENV=prod)
  |
  +-- config/runtime.exs   # Runtime configuration (reads env vars at boot)
```

### Environment Variable Categories

| Category | Examples | Injection Method |
|----------|---------|-----------------|
| **Application Config** | `PORT`, `HOST`, `LOG_LEVEL` | `config/runtime.exs` |
| **Secrets** | `SECRET_KEY_BASE`, `DATABASE_URL` | Fly.io secrets, Vault, env vars |
| **Feature Flags** | `ENABLE_OSINT`, `ENABLE_DD` | Runtime config + ETS cache |
| **Service URLs** | `DATABASE_URL`, `REDIS_URL`, `MEILISEARCH_URL` | Runtime config |
| **Build Info** | `GIT_SHA`, `BUILD_TIME`, `MIX_ENV` | Compile-time config |

## Architecture and Implementation

Environment management architecture in modern deployments separates compile-time from runtime configuration. Compile-time configuration (determined by `MIX_ENV`) controls which code paths are compiled, which dependencies are included, and how the application binary is structured. Runtime configuration (read at application boot) controls operational parameters like database URLs, API keys, port numbers, and feature flags.

This separation is critical for Elixir releases, where the compiled artifact is immutable once built. A single release binary compiled with `MIX_ENV=prod` can be deployed to multiple environments (staging, production, canary) by varying runtime environment variables. This ensures that the exact same binary tested in staging is deployed to production, eliminating "works on my machine" discrepancies.

Secret management varies by environment. Development uses `.env` files (excluded from version control via `.gitignore`), CI/CD uses pipeline-scoped variables, and production uses platform-native secret stores (Fly.io secrets, AWS Secrets Manager, HashiCorp Vault). The principle is that secrets never appear in source code, configuration files, or build artifacts.

## Usage in Prismatic Platform

The Prismatic Platform runs across three deployment targets with environment-specific configuration managed through Mix config files and Fly.io secrets.

```elixir
# config/runtime.exs
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

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "SECRET_KEY_BASE environment variable is not set"

  config :prismatic_web, PrismaticWeb.Endpoint,
    url: [host: System.get_env("PHX_HOST") || "prismatic-prod.fly.dev", port: 443, scheme: "https"],
    http: [port: String.to_integer(System.get_env("PORT") || "4000")],
    secret_key_base: secret_key_base

  config :prismatic_api, PrismaticApi.Endpoint,
    url: [host: System.get_env("PHX_HOST") || "prismatic-prod.fly.dev", port: 443, scheme: "https"],
    http: [port: String.to_integer(System.get_env("API_PORT") || "4004")],
    secret_key_base: secret_key_base
end
```

### Platform Environment Matrix

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| **MIX_ENV** | `dev` | `prod` | `prod` |
| **Database** | Local PostgreSQL | Fly Postgres | Fly Postgres (HA) |
| **Meilisearch** | `localhost:7700` | Fly service | Fly service (HA) |
| **KuzuDB** | Local file store | Fly volume | Fly volume (persistent) |
| **ETS Backend** | Local ETS | Local ETS | Horde (distributed) |
| **Logging** | Console, debug level | JSON, info level | JSON, info level |
| **Code Reload** | Enabled | Disabled | Disabled |
| **Warnings** | Displayed | `--warnings-as-errors` | `--warnings-as-errors` |
| **OSINT API Keys** | Test/sandbox keys | Staging keys | Production keys |
| **Fly Host** | `localhost:4000` | `prismatic-staging.fly.dev` | `prismatic-prod.fly.dev` |

```elixir
defmodule Prismatic.Environment do
  @moduledoc """
  Environment detection and configuration helpers.
  Provides runtime environment information for feature
  flags and operational decisions.
  """

  @spec current_env() :: :dev | :test | :prod
  def current_env, do: Application.get_env(:prismatic, :env, :dev)

  @spec production?() :: boolean()
  def production?, do: current_env() == :prod

  @spec staging?() :: boolean()
  def staging? do
    production?() and
      System.get_env("FLY_APP_NAME") == "prismatic-staging"
  end

  @spec feature_enabled?(atom()) :: boolean()
  def feature_enabled?(feature) do
    Application.get_env(:prismatic, :features, [])
    |> Keyword.get(feature, false)
  end
end
```

## Cross-References

- [Deployment](/glossary/deployment/) -- Process of releasing to environments
- **Configuration** -- Environment-specific settings
- **Health Check** -- Environment health verification
- [Docker](/glossary/docker/) -- Container-based environment isolation
- **Livebooks**: `platform_administration/` notebooks cover environment management
- **Academy**: DevOpsSecurityPipeline topic covers environment security

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
