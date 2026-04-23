+++
title = "Parity"
description = "The practice of maintaining equivalent configurations across development, staging, and production environments to prevent deployment surprises and ensure consistent behavior."
weight = 50

[extra]
domain = "devops"
category = "devops"
related_terms = ["docker", "deployment", "environment", "twelve-factor", "otp-release", "configuration", "ci-cd", "infrastructure-as-code", "feature-flag", "mix-env", "runtime-config", "container"]
tags = ["glossary", "devops", "parity", "environment", "twelve-factor", "deployment", "docker", "configuration", "ci-cd"]
complexity_level = "intermediate"
complexity = "medium"
stability = "mature"
beam_related = true
platform_integration = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["parity", "environment parity", "dev-prod parity", "twelve-factor", "DevOps", "glossary", "Prismatic Platform", "OTP release", "Docker", "configuration"]
quality_score = 95
word_count = 3400
difficulty = "intermediate"
audience = ["developers", "devops", "sre", "architects"]
key_concepts = ["dev-prod-parity", "runtime-config", "service-parity", "data-parity", "configuration-parity", "build-once-deploy-many", "environment-variables", "backing-services"]
platforms = ["beam", "elixir", "docker", "fly-io"]
prerequisites = ["deployment-basics", "docker-fundamentals", "elixir-config"]
use_cases = ["deployment-reliability", "bug-reproduction", "environment-consistency", "ci-cd-pipeline", "production-debugging"]
key_takeaway = "Environment parity eliminates the 'works on my machine' class of bugs by ensuring development, staging, and production run identical code with only connection-string-level differences."
see_also = ["capabilities", "architecture", "deployment", "docker", "configuration"]
image = "/images/sections/glossary.png"
image_alt = "Parity - Prismatic Platform"
+++

## Definition and Overview

Environment parity (often called dev/prod parity) is the practice of keeping development, staging, and production environments as similar as possible in their configuration, infrastructure, backing services, and runtime behavior. The Twelve-Factor App methodology identifies this as factor X, emphasizing that gaps between environments are a major source of bugs that appear in production but cannot be reproduced in development. For Elixir/OTP applications, parity extends beyond infrastructure to include BEAM VM configuration, OTP release settings, and supervision tree topology.

Three types of gaps create environment drift. Time gaps: code sits in staging for weeks before reaching production, allowing the production environment to diverge through configuration changes, dependency updates, or infrastructure modifications. Personnel gaps: developers write code, separate operations staff deploy it, creating information asymmetry about what changed and why. Tool gaps: development uses SQLite while production uses PostgreSQL, or development uses an in-memory queue while production uses RabbitMQ. Each gap introduces opportunities for bugs that only manifest in the production configuration. In the BEAM ecosystem, a particularly dangerous gap is using `Mix.env()` in runtime code -- this function is unavailable in compiled releases, causing crashes that never appear during development.

The Prismatic Platform pursues strong environment parity through several mechanisms. Docker containers ensure the same OS, Elixir/Erlang versions, and system libraries across all environments. PostgreSQL is used in development, staging, and production (never SQLite or in-memory substitutes). The same ETS-based registries, Tesla HTTP clients, and Phoenix configurations run everywhere, with environment-specific differences limited to connection strings, API keys, and feature flags. The platform's `config/runtime.exs` is the single source of environment-specific configuration, evaluated at application startup from environment variables.

## Core Concepts

| Concept | Description | Parity Implication |
|---------|-------------|-------------------|
| **Dev/Prod Parity** | Factor X of Twelve-Factor App methodology | Minimize time, personnel, and tool gaps |
| **Runtime Configuration** | Config evaluated at application startup | `config/runtime.exs` reads env vars, same code everywhere |
| **Compile-Time Config** | Config baked into compiled release | `config/config.exs` must be environment-agnostic |
| **Build Once, Deploy Many** | Single artifact promoted through environments | OTP release built once in CI, deployed to staging then production |
| **Backing Services** | External services (DB, cache, search) | Same service types in all environments, different connection strings |
| **Service Parity** | Same service versions across environments | Pin PostgreSQL, Meilisearch, Redis versions in docker-compose |
| **Data Parity** | Representative data in non-production environments | Staging seeds mirror production patterns without real user data |
| **Configuration Parity** | Same config mechanisms everywhere | Environment variables via `System.get_env/1` in runtime.exs |
| **Infrastructure Parity** | Same OS, libraries, network topology | Docker containers from identical base images |
| **Feature Flags** | Controlled behavioral differences | Same code paths, different activation per environment |
| **OTP Release** | Self-contained deployment artifact | Includes BEAM VM, compiled code, boot scripts |
| **Mix.env() Trap** | Compile-time function unavailable in releases | Never use `Mix.env()` in runtime code; use config values |

## Technical Deep Dive

### Parity Dimensions

| Dimension | Development | Staging | Production | Risk If Divergent |
|-----------|-------------|---------|------------|-------------------|
| **OS** | macOS (native) or Docker | Docker (Debian) | Docker (Debian) | System library differences, DNS resolution, SSL |
| **Elixir Version** | `.tool-versions` | Dockerfile | Dockerfile | Syntax/behavior differences, missing functions |
| **Erlang/OTP Version** | `.tool-versions` | Dockerfile | Dockerfile | NIF compatibility, scheduler behavior, crypto |
| **PostgreSQL** | Docker Compose 16.x | Fly Postgres 16.x | Fly Postgres 16.x | Query planner differences, extension availability |
| **Meilisearch** | Docker Compose 1.x | Fly Machine 1.x | Fly Machine 1.x | Index format, ranking algorithm differences |
| **Configuration** | `config/dev.exs` + `runtime.exs` | `runtime.exs` only | `runtime.exs` only | Compile-time vs runtime config confusion |
| **Pool Size** | 10 (default) | 10 | 20+ (env var) | Connection exhaustion under load |
| **SSL** | Disabled | Enabled | Enabled | Certificate validation, TLS version |
| **Scheduler Count** | Auto (dev machine cores) | Auto (VM cores) | Auto (VM cores) | Concurrency behavior differences |
| **Memory** | Unlimited (dev machine) | Limited (VM) | Limited (VM) | OOM in production but not dev |

### Common Parity Violations and Consequences

| Violation | Symptom in Production | Prevention |
|-----------|----------------------|------------|
| Using SQLite in dev, PostgreSQL in prod | Query syntax differences, transaction semantics | Always use PostgreSQL everywhere |
| `Mix.env()` in runtime code | `UndefinedFunctionError` in releases | Use `Application.get_env/3` with runtime config |
| Hardcoded `localhost` URLs | Connection failures in containerized environments | Environment variables for all service URLs |
| Missing system libraries | NIF compilation failures, crypto errors | Docker base image parity |
| Different Erlang versions | Crypto module changes, NIF ABI incompatibility | Pin versions in `.tool-versions` and Dockerfile |
| In-memory mock instead of real service | Mock behavior diverges from real service | Use real services with test configuration |
| `config/dev.exs` secrets | Secrets missing in production runtime | All secrets via `System.get_env/1` in `runtime.exs` |
| Synchronous dev, async production | Race conditions only in production | Same async behavior in development |
| No connection pooling in dev | Pool exhaustion only under production load | Same pool configuration (scaled differently) |
| Different timezone settings | Date/time calculation discrepancies | UTC everywhere, explicit timezone handling |

### Runtime Configuration Pattern

Achieving parity requires discipline across multiple dimensions. Runtime parity means using the same language version, VM configuration, and dependency versions everywhere. The platform pins Elixir (1.19+) and Erlang versions in `.tool-versions` and the Dockerfile, ensuring identical BEAM behavior. Service parity means using the same backing services (database, cache, search) in all environments. The platform uses PostgreSQL everywhere, with environment-specific configuration only for connection parameters. Configuration parity means the same configuration mechanisms (environment variables via `config/runtime.exs`) across all environments.

The OTP release system contributes to parity by producing the same binary artifact that runs in all environments. The release is built once in CI and promoted through staging to production, ensuring no compilation differences between environments. Runtime behavior differences are controlled exclusively through environment variables, evaluated at startup by `config/runtime.exs`.

```elixir
# config/runtime.exs - Environment-agnostic configuration
# The SAME code runs in dev, staging, and production.
# Only environment variable VALUES differ between environments.
import Config

# Database - same PostgreSQL everywhere, different connection strings
database_url =
  System.get_env("DATABASE_URL") ||
    "postgres://postgres:postgres@localhost/prismatic_#{config_env()}"

config :prismatic, PrismaticDd.Repo,
  url: database_url,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: config_env() == :prod,
  ssl_opts: if(config_env() == :prod, do: [verify: :verify_none], else: [])

# Web server - same Phoenix config, different ports and hosts
port = String.to_integer(System.get_env("PORT") || "4000")
host = System.get_env("PHX_HOST") || "localhost"

config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: host, port: 443, scheme: "https"],
  http: [port: port],
  server: true,
  secret_key_base: System.get_env("SECRET_KEY_BASE") ||
    "dev-only-fallback-key-that-is-at-least-64-bytes-long-for-development-use"

# OSINT API keys - same adapter code, different credentials
config :prismatic_osint_core,
  shodan_api_key: System.get_env("SHODAN_API_KEY"),
  virustotal_api_key: System.get_env("VIRUSTOTAL_API_KEY"),
  censys_api_id: System.get_env("CENSYS_API_ID"),
  censys_api_secret: System.get_env("CENSYS_API_SECRET")

# Feature flags - same code paths, different activation
config :prismatic,
  feature_flags: %{
    perimeter_scanning: System.get_env("ENABLE_PERIMETER_SCAN") == "true",
    dd_auto_refresh: System.get_env("ENABLE_DD_AUTO_REFRESH") == "true",
    demo_mode: System.get_env("PRISMATIC_DEMO_MODE") == "true"
  }

# Meilisearch - same client config, different URLs
config :prismatic_storage_meilisearch,
  url: System.get_env("MEILI_URL") || "http://localhost:7700",
  api_key: System.get_env("MEILI_MASTER_KEY") || "dev-master-key"
```

### Docker Parity

Docker provides OS-level parity. The multi-stage Dockerfile builds the release on the same base image used in production, eliminating discrepancies in system libraries, SSL certificates, DNS resolution, and timezone handling. Development uses `docker-compose` to provide the same PostgreSQL, Redis, and Meilisearch versions as production.

```dockerfile
# Same base for build and runtime ensures library parity
ARG ELIXIR_VERSION=1.19.0
ARG OTP_VERSION=27.0
ARG DEBIAN_VERSION=bookworm-20240130-slim

# Build stage - compile the OTP release
FROM hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION} AS build

ENV MIX_ENV=prod
WORKDIR /app

# Install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git

# Install hex and rebar
RUN mix local.hex --force && mix local.rebar --force

# Install and compile dependencies first (caching layer)
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs ./apps/*/
RUN mix deps.get --only prod && mix deps.compile

# Copy application source and compile
COPY . .
RUN mix compile && mix assets.deploy && mix release

# Runtime stage - minimal image, same base OS
FROM debian:${DEBIAN_VERSION}

RUN apt-get update -y && \
    apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8

WORKDIR /app
COPY --from=build /app/_build/prod/rel/prismatic ./

CMD ["bin/prismatic", "start"]
```

### docker-compose.yml for Development Parity

```yaml
# docker-compose.yml - Match production service versions
version: "3.8"
services:
  postgres:
    image: postgres:16.2-bookworm    # Same major version as production
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  meilisearch:
    image: getmeili/meilisearch:v1.6  # Same version as production
    environment:
      MEILI_MASTER_KEY: dev-master-key
    ports:
      - "7700:7700"
    volumes:
      - meilidata:/meili_data

volumes:
  pgdata:
  meilidata:
```

## Architecture and Implementation

The platform's parity strategy is enforced at three levels. Infrastructure parity is maintained through Docker and infrastructure-as-code (Fly.io configuration files). Application parity is maintained through the OTP release system and environment variable-based configuration. Data parity is maintained through database migrations (same schema in all environments) and seed data (representative test data in staging that mirrors production patterns without containing real user data).

One deliberate parity deviation exists: the ETS/Horde backend selection. Development uses ETS (single-node, simpler debugging), while production can use Horde (distributed, multi-node). The `Registry.Behaviour` trait in PrismaticSupervisor abstracts this difference behind a common interface, so application code is identical regardless of the backend. This is a controlled deviation documented in the architecture.

Testing parity is achieved through the `DataCase` test helper that configures Ecto sandbox with the same PostgreSQL database (not an in-memory alternative), Tesla test adapters that validate the same HTTP contract as production clients, and integration tests that exercise the full Phoenix pipeline including plugs, authentication, and error handling.

### Parity Validation Pipeline

The CI pipeline validates parity at every stage:

1. **Build Validation**: Release built in Docker with same base image as production
2. **Service Validation**: Tests run against PostgreSQL (not SQLite), Meilisearch (not mock)
3. **Config Validation**: `mix check.consistency` verifies no `Mix.env()` calls in lib/
4. **Runtime Validation**: Release boots and passes health checks in CI container
5. **Schema Validation**: Migrations run clean on empty database (no manual steps)

## Usage in Prismatic Platform

Environment-agnostic module design ensures the same code runs everywhere:

```elixir
defmodule PrismaticOsintCore.HttpClient do
  @moduledoc """
  Environment-agnostic HTTP client configuration.

  Same Tesla middleware stack in all environments, differing only
  in timeout values and retry counts configured via application
  environment (ultimately from `config/runtime.exs` environment
  variables).

  ## Design Principles

  - No `Mix.env()` calls -- all configuration via Application.get_env
  - Same middleware stack everywhere -- no dev-only or prod-only middleware
  - Configurable timeouts -- production may need longer timeouts for slow APIs
  - Retry logic active everywhere -- not just production

  ## Examples

      iex> client = PrismaticOsintCore.HttpClient.build_client(base_url: "https://api.example.com")
      iex> is_struct(client, Tesla.Client)
      true
  """

  @doc """
  Builds a Tesla HTTP client with the platform-standard middleware stack.

  The middleware stack is identical across all environments. Only
  configuration values (timeouts, retry counts) differ based on
  application environment settings.

  ## Parameters

  - `opts` - Keyword list requiring `:base_url`

  ## Options

  - `:base_url` (required) - Base URL for the API
  - `:timeout` - Override default timeout (milliseconds)
  - `:max_retries` - Override default retry count

  ## Examples

      iex> client = PrismaticOsintCore.HttpClient.build_client(
      ...>   base_url: "https://api.shodan.io",
      ...>   timeout: 60_000
      ...> )
      iex> is_struct(client, Tesla.Client)
      true
  """
  @spec build_client(keyword()) :: Tesla.Client.t()
  def build_client(opts \\ []) do
    base_url = Keyword.fetch!(opts, :base_url)
    custom_timeout = Keyword.get(opts, :timeout)
    custom_retries = Keyword.get(opts, :max_retries)

    middleware = [
      {Tesla.Middleware.BaseUrl, base_url},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Timeout, timeout: custom_timeout || timeout()},
      {Tesla.Middleware.Retry, delay: 1_000, max_retries: custom_retries || max_retries()},
      {Tesla.Middleware.Logger, log_level: :debug}
    ]

    Tesla.client(middleware)
  end

  @doc """
  Returns the configured HTTP timeout in milliseconds.

  Reads from application environment, defaulting to 30 seconds.
  The value is set via `OSINT_HTTP_TIMEOUT` environment variable
  in `config/runtime.exs`.

  ## Examples

      iex> timeout = PrismaticOsintCore.HttpClient.timeout()
      iex> is_integer(timeout) and timeout > 0
      true
  """
  @spec timeout() :: pos_integer()
  def timeout do
    Application.get_env(:prismatic_osint_core, :http_timeout, 30_000)
  end

  @doc """
  Returns the configured maximum retry count.

  Reads from application environment, defaulting to 3 retries.
  The value is set via `OSINT_HTTP_MAX_RETRIES` environment variable
  in `config/runtime.exs`.

  ## Examples

      iex> retries = PrismaticOsintCore.HttpClient.max_retries()
      iex> is_integer(retries) and retries >= 0
      true
  """
  @spec max_retries() :: non_neg_integer()
  def max_retries do
    Application.get_env(:prismatic_osint_core, :http_max_retries, 3)
  end
end
```

### Controlled Deviations Registry

Not all parity deviations are accidental. Some are deliberate trade-offs documented in the platform:

```elixir
defmodule Prismatic.Parity.DeviationRegistry do
  @moduledoc """
  Documents deliberate parity deviations between environments.

  Each deviation must have a justification, the abstraction that
  hides it from application code, and the conditions under which
  it could be eliminated.

  ## Registered Deviations

  - `:registry_backend` - ETS in dev, Horde in distributed prod
  - `:ssl_termination` - Direct in dev, load balancer in prod
  - `:log_level` - :debug in dev, :info in prod

  ## Examples

      iex> devs = Prismatic.Parity.DeviationRegistry.all()
      iex> is_list(devs) and length(devs) > 0
      true
  """

  @type deviation :: %{
    id: atom(),
    description: String.t(),
    justification: String.t(),
    abstraction: String.t(),
    elimination_condition: String.t()
  }

  @deviations [
    %{
      id: :registry_backend,
      description: "ETS in single-node dev, Horde in multi-node production",
      justification: "Horde requires cluster formation, unnecessary in development",
      abstraction: "Registry.Behaviour trait provides common interface",
      elimination_condition: "Local Horde with single-node cluster in development"
    },
    %{
      id: :ssl_termination,
      description: "No SSL in development, SSL via load balancer in production",
      justification: "Local SSL certificates add development friction",
      abstraction: "Phoenix endpoint SSL config via environment variable",
      elimination_condition: "mkcert for local SSL certificates"
    },
    %{
      id: :log_level,
      description: "Debug logging in development, info in production",
      justification: "Debug output too verbose for production log volume",
      abstraction: "Logger level configured via LOG_LEVEL environment variable",
      elimination_condition: "Structured logging with sampling in production"
    }
  ]

  @doc """
  Returns all registered parity deviations.

  ## Examples

      iex> deviations = Prismatic.Parity.DeviationRegistry.all()
      iex> Enum.all?(deviations, &is_map/1)
      true
  """
  @spec all() :: list(deviation())
  def all, do: @deviations

  @doc """
  Returns a specific deviation by id, or nil if not found.

  ## Examples

      iex> dev = Prismatic.Parity.DeviationRegistry.get(:registry_backend)
      iex> dev.abstraction
      "Registry.Behaviour trait provides common interface"
  """
  @spec get(atom()) :: deviation() | nil
  def get(id) do
    Enum.find(@deviations, &(&1.id == id))
  end
end
```

Environment parity is a continuous discipline rather than a one-time achievement. The platform's CI pipeline validates parity by building the same Docker image used in production and running the full test suite against it, catching environment-specific issues before they reach staging or production.

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| `Mix.env()` in runtime code | Crashes in compiled releases (function undefined) | Use `Application.get_env/3` with `config/runtime.exs` |
| SQLite in dev, PostgreSQL in prod | Query syntax/behavior differences | Always use PostgreSQL in development |
| Hardcoded `localhost` | Connection failures in containers/cloud | Environment variables for all service URLs |
| `config/dev.exs` secrets | Missing secrets in production | All secrets via `System.get_env/1` |
| Different Elixir/OTP versions | Subtle behavior differences, NIF failures | Pin in `.tool-versions` and Dockerfile |
| In-memory mocks in dev | Mock diverges from real service behavior | Use real services with test configuration |
| Missing system libraries | NIF load failures, crypto errors in production | Docker base image parity |
| `System.get_env` at compile time | Value baked into release, cannot change at deploy | Only read env vars in `config/runtime.exs` or at runtime |
| Dev-only debug middleware | Different request processing paths | Same middleware stack everywhere, configure via flags |
| Manual database changes | Schema drift between environments | All changes via Ecto migrations, never manual DDL |
| Different pool sizes | Connection exhaustion only in production | Parameterize via env vars, test with production-like limits |
| Timezone assumptions | Date bugs in different server timezones | UTC everywhere, explicit timezone conversion |

## Best Practices

1. **Use `config/runtime.exs` for all environment-specific values** -- This file is evaluated at application startup (not compilation), making it the correct place for database URLs, API keys, feature flags, and service endpoints. Never put secrets in `config/dev.exs` or `config/prod.exs`.

2. **Never call `Mix.env()` in lib/ code** -- This function is unavailable in compiled OTP releases. Use `Application.get_env/3` to read configuration values set in `runtime.exs` based on `config_env()`.

3. **Pin all service versions in docker-compose** -- Use specific version tags (e.g., `postgres:16.2-bookworm`) rather than `latest` to ensure development matches production exactly. Update all environments simultaneously.

4. **Build releases once, deploy many times** -- The OTP release built in CI should be the exact artifact deployed to staging and production. Never rebuild for different environments.

5. **Use the same backing services everywhere** -- If production uses PostgreSQL, development must use PostgreSQL. If production uses Meilisearch, development must use Meilisearch. No in-memory substitutes.

6. **Document all deliberate deviations** -- When parity violations are intentional (e.g., ETS vs Horde), document the deviation, its justification, the abstraction hiding it, and conditions for elimination.

7. **Validate parity in CI** -- Run `mix check.consistency` to detect `Mix.env()` calls in lib/, verify runtime.exs parses correctly, and test the release boots in a production-like container.

8. **Minimize time between code completion and production deployment** -- Long staging periods allow environments to drift. Continuous deployment reduces the time gap.

9. **Use feature flags instead of environment-specific code paths** -- When behavior must differ between environments, use feature flags (evaluated at runtime from env vars) rather than compile-time conditionals.

10. **Test database migrations on empty databases** -- Run `mix ecto.create && mix ecto.migrate` in CI to ensure migrations work from scratch, not just incrementally on existing databases.

## Related Terms

- [Docker](@/glossary/docker.md) -- Containerization providing OS-level parity across environments
- [OTP Release](@/glossary/otp-release.md) -- Build artifact ensuring application-level parity
- [Deployment](@/glossary/deployment.md) -- Process of moving releases across environments
- [Configuration](@/glossary/configuration.md) -- Environment-specific settings management via runtime.exs
- [CI/CD](@/glossary/ci-cd.md) -- Continuous integration pipeline validating parity
- [Infrastructure as Code](/glossary/infrastructure-as-code/) -- Declarative infrastructure ensuring environment consistency
- [Feature Flag](@/glossary/feature-flag.md) -- Runtime-configurable behavior switches replacing environment conditionals
- [Mix.env](/glossary/mix-env/) -- Compile-time environment function, dangerous in runtime code
- [Twelve-Factor App](/glossary/twelve-factor/) -- Methodology defining parity as Factor X
- [Environment Variable](/glossary/environment-variable/) -- Primary mechanism for environment-specific configuration
- [Backing Service](/glossary/backing-service/) -- External services requiring version parity
- [Ecto Migration](/glossary/ecto-migration/) -- Database schema changes ensuring data-layer parity

## See Also

- [Capabilities](@/capabilities/_index.md) -- Platform deployment and operations capabilities
- [Architecture](@/architecture/_index.md) -- Infrastructure architecture ensuring parity
- **Twelve-Factor App** -- Methodology defining parity principles (Factor X)
- **Fly.io Configuration** -- `fly.toml` defining production infrastructure
- **docker-compose.yml** -- Development service configuration matching production
- **PERF Doctrine** -- Performance standards consistent across environments

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
