+++
title = "Configuration Management in a Large Elixir Umbrella"
date = 2026-03-24
description = "Managing configuration across a 94-app umbrella: compile-time vs runtime config, environment variables, application-specific settings, and avoiding common pitfalls."

[extra]
author = "Tomas Korcak (korczis)"
category = "architecture"
tags = ["elixir", "configuration", "umbrella", "deployment", "architecture"]
reading_time = "9 min"
keywords = ["elixir configuration", "umbrella config", "runtime.exs", "environment variables", "config management"]
image = "/images/blog/configuration-management-umbrella.png"
word_count = 1280
date_created = "2026-03-24"
date_modified = "2026-03-24"
quality_score = 88
see_also = ["configuration", "umbrella", "release", "otp-release", "mix"]
image_alt = "Configuration Management in Elixir Umbrella - Prismatic Platform"
+++

Configuration in an Elixir umbrella with 94 applications is a solved problem if you follow the right patterns. It becomes a nightmare if you do not. This post documents the configuration architecture used in the Prismatic Platform, covering compile-time vs runtime config, the role of environment variables, and pitfalls specific to large umbrellas.

## The Configuration Hierarchy

Elixir has four configuration files, loaded in order:

| File | When Loaded | Purpose |
|---|---|---|
| `config/config.exs` | Compile time | Defaults, static values |
| `config/dev.exs` | Compile time (dev) | Development overrides |
| `config/test.exs` | Compile time (test) | Test environment settings |
| `config/prod.exs` | Compile time (prod) | Production static settings |
| `config/runtime.exs` | Application start | Runtime-dynamic values |

The critical distinction: `config.exs` through `prod.exs` are evaluated at **compile time**. Values are baked into the release. `runtime.exs` is evaluated when the application starts, making it the only place for truly dynamic configuration.

## The Mix.env() Trap

The most dangerous pattern in production Elixir:

```elixir
# NEVER DO THIS IN LIB/ CODE
def get_api_key do
  if Mix.env() == :prod do
    System.get_env("API_KEY")
  else
    "dev-key-123"
  end
end
```

`Mix.env()` is not available in releases. This code crashes in production. The correct approach:

```elixir
# In config/runtime.exs
config :prismatic_osint, :shodan_api_key, System.get_env("SHODAN_API_KEY")

# In lib/ code
def get_api_key do
  Application.get_env(:prismatic_osint, :shodan_api_key)
end
```

## Application-Specific Configuration

Each umbrella app owns its configuration namespace. The convention:

```elixir
# config/config.exs - defaults for all environments
config :prismatic_dd,
  max_entities_per_case: 500,
  scoring_timeout_ms: 30_000,
  pipeline_batch_size: 50

config :prismatic_osint,
  adapter_timeout_ms: 15_000,
  max_concurrent_queries: 10,
  rate_limit_per_second: 5

config :prismatic_web,
  port: 4000,
  session_ttl_hours: 24
```

Apps access their own config:

```elixir
defmodule Prismatic.DD.Config do
  @moduledoc """
  Configuration access for the DD application.
  Centralizes all config reads with defaults.
  """

  @spec max_entities_per_case() :: pos_integer()
  def max_entities_per_case do
    Application.get_env(:prismatic_dd, :max_entities_per_case, 500)
  end

  @spec scoring_timeout() :: pos_integer()
  def scoring_timeout do
    Application.get_env(:prismatic_dd, :scoring_timeout_ms, 30_000)
  end

  @spec pipeline_batch_size() :: pos_integer()
  def pipeline_batch_size do
    Application.get_env(:prismatic_dd, :pipeline_batch_size, 50)
  end
end
```

This Config module pattern provides:
- A single place to see all configuration an app uses
- Defaults that prevent crashes from missing config
- Type documentation via `@spec`
- Easy testing via `Application.put_env/3` in test setup

## Runtime Configuration

`runtime.exs` is the only correct place for values that vary between deployments:

```elixir
# config/runtime.exs
import Config

# Database (always runtime)
config :prismatic_storage,
  database_url: System.get_env("DATABASE_URL") || raise("DATABASE_URL not set"),
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

# External APIs (secrets must be runtime)
config :prismatic_osint,
  shodan_api_key: System.get_env("SHODAN_API_KEY"),
  virustotal_api_key: System.get_env("VIRUSTOTAL_API_KEY"),
  censys_api_id: System.get_env("CENSYS_API_ID"),
  censys_api_secret: System.get_env("CENSYS_API_SECRET")

# Web server
if config_env() == :prod do
  config :prismatic_web, PrismaticWeb.Endpoint,
    url: [host: System.get_env("PHX_HOST") || "example.com", port: 443, scheme: "https"],
    http: [
      port: String.to_integer(System.get_env("PORT") || "4000"),
      transport_options: [socket_opts: [:inet6]]
    ],
    secret_key_base: System.get_env("SECRET_KEY_BASE") || raise("SECRET_KEY_BASE not set")
end
```

## Feature Flags via Configuration

For features that need to be toggled per environment:

```elixir
# config/config.exs
config :prismatic_web,
  features: %{
    demo_mode: false,
    osint_live_search: true,
    dd_dataroom: true,
    academy: true
  }

# config/runtime.exs - override via env vars
if System.get_env("PRISMATIC_DEMO_MODE") == "true" do
  config :prismatic_web,
    features: %{
      demo_mode: true,
      osint_live_search: false,
      dd_dataroom: false,
      academy: true
    }
end
```

Access in code:

```elixir
defmodule Prismatic.Features do
  @spec enabled?(atom()) :: boolean()
  def enabled?(feature) do
    features = Application.get_env(:prismatic_web, :features, %{})
    Map.get(features, feature, false)
  end
end
```

## Cross-App Configuration Dependencies

Some configuration spans multiple apps. The pattern: configure in the owning app, read via a shared config module:

```elixir
# prismatic_storage owns the database config
config :prismatic_storage, Prismatic.Repo,
  url: System.get_env("DATABASE_URL"),
  pool_size: 10

# Other apps reference prismatic_storage's Repo
# They do NOT duplicate the database config
defmodule Prismatic.DD.Storage do
  alias Prismatic.Repo  # Defined in prismatic_storage
  # Uses the same Repo, same config
end
```

Never duplicate configuration across apps. One app owns it, others depend on that app.

## Testing Configuration

In tests, override config per-test using `Application.put_env/4`:

```elixir
setup do
  original = Application.get_env(:prismatic_osint, :adapter_timeout_ms)
  Application.put_env(:prismatic_osint, :adapter_timeout_ms, 100)

  on_exit(fn ->
    if original do
      Application.put_env(:prismatic_osint, :adapter_timeout_ms, original)
    else
      Application.delete_env(:prismatic_osint, :adapter_timeout_ms)
    end
  end)

  :ok
end

test "times out with short timeout" do
  assert {:error, :timeout} = OSINTAdapter.query("slow-target")
end
```

For test-specific config, use `config/test.exs`:

```elixir
# config/test.exs
config :prismatic_storage, Prismatic.Repo,
  pool: Ecto.Adapters.SQL.Sandbox

config :prismatic_osint,
  adapter_timeout_ms: 1_000,
  max_concurrent_queries: 2

config :prismatic_web, PrismaticWeb.Endpoint,
  server: false
```

## Validation at Boot

Crash early if required configuration is missing:

```elixir
defmodule Prismatic.ConfigValidator do
  @moduledoc """
  Validates required configuration at application startup.
  """

  @required_vars [
    {:prismatic_storage, :database_url, "DATABASE_URL"},
    {:prismatic_web, [PrismaticWeb.Endpoint, :secret_key_base], "SECRET_KEY_BASE"}
  ]

  @spec validate!() :: :ok
  def validate! do
    missing =
      @required_vars
      |> Enum.filter(fn {app, key, _env_name} ->
        is_nil(get_nested_env(app, key))
      end)
      |> Enum.map(fn {_app, _key, env_name} -> env_name end)

    if missing != [] do
      raise """
      Missing required environment variables:
      #{Enum.join(missing, "\n  ")}
      """
    end

    :ok
  end
end
```

Call `ConfigValidator.validate!()` in your application's `start/2` callback.

## Summary

| Rule | Rationale |
|---|---|
| Never use `Mix.env()` in lib/ code | Unavailable in releases |
| Secrets in `runtime.exs` only | Not baked into release artifacts |
| One app owns each config namespace | No duplication, clear ownership |
| Config module per app | Centralized access with defaults |
| Validate at boot | Fail fast on missing config |
| `Application.put_env` for test overrides | Isolated test configuration |

Configuration is infrastructure. Treat it with the same rigor as database schemas and API contracts.
