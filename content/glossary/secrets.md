+++
title = "Secrets"
weight = 50
[extra]
description = "Sensitive configuration values including API keys, database credentials, and encryption keys requiring secure storage"
category = "security"
related_terms = ["permission", "pii", "runtime", "scope", "provenance"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["secrets", "API keys", "credentials", "encryption", "environment variables", "security", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "infrastructure", "configuration"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Secrets - Prismatic Platform"
+++

## Definition & Overview

Secrets are sensitive configuration values that grant access to protected resources or enable cryptographic operations. Common categories include API keys (authenticating requests to external services), database credentials (connection strings with passwords), encryption keys (protecting data at rest and in transit), signing keys (JWT tokens, webhook signatures), and service tokens (inter-service authentication). Secrets require fundamentally different handling than regular configuration -- they must never appear in source code, logs, error messages, or client-side output.

The principle of secrets management follows three rules: secrets must be stored securely (encrypted at rest), transmitted securely (encrypted in transit), and accessed minimally (principle of least privilege). A comprehensive secrets management strategy also includes rotation (regular key changes), auditing (logging secret access), and revocation (immediate invalidation when compromise is suspected).

The Prismatic Platform handles secrets through environment variables loaded at runtime via `config/runtime.exs`. In production, secrets are managed by Fly.io's secrets system, which encrypts values at rest and injects them as environment variables at boot time. The platform's pre-commit hooks and CI pipeline scan for accidental secret exposure, blocking commits that contain patterns matching API keys, passwords, or tokens in source code.

## Technical Deep Dive

Secret detection in the Prismatic Platform operates at multiple levels: pre-commit hooks scan staged files for secret patterns, CI pipelines run comprehensive scans on every push, and runtime validation ensures required secrets are present at application startup.

```elixir
defmodule PrismaticSafety.SecretScanner do
  @moduledoc """
  Scans source files for accidentally committed secrets.
  Integrated into pre-commit hooks and CI pipeline.
  """

  @type violation :: %{
    file: String.t(),
    line: non_neg_integer(),
    pattern: String.t(),
    severity: :critical | :warning
  }

  @secret_patterns [
    {~r/(?:api[_-]?key|apikey)\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']/i, "API Key", :critical},
    {~r/(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/i, "Password", :critical},
    {~r/(?:secret[_-]?key)\s*[:=]\s*["'][a-zA-Z0-9+\/=]{20,}["']/i, "Secret Key", :critical},
    {~r/(?:access[_-]?token)\s*[:=]\s*["'][a-zA-Z0-9._-]{20,}["']/i, "Access Token", :critical},
    {~r/(?:aws[_-]?secret)\s*[:=]\s*["'][a-zA-Z0-9\/+=]{30,}["']/i, "AWS Secret", :critical},
    {~r/glpat-[a-zA-Z0-9_-]{20,}/, "GitLab Token", :critical},
    {~r/ghp_[a-zA-Z0-9]{36}/, "GitHub Token", :critical},
    {~r/sk-[a-zA-Z0-9]{40,}/, "OpenAI API Key", :critical},
    {~r/-----BEGIN (?:RSA )?PRIVATE KEY-----/, "Private Key", :critical},
    {~r/(?:postgres|mysql):\/\/\w+:[^@\s]+@/, "Database URL", :critical}
  ]

  @whitelisted_paths ~w(.env.example config/test.exs test/ docs/)

  @spec scan(String.t()) :: {:ok, [violation()]}
  def scan(path) do
    violations =
      path
      |> gather_files()
      |> Enum.reject(&whitelisted?/1)
      |> Task.async_stream(&scan_file/1, max_concurrency: System.schedulers_online())
      |> Enum.flat_map(fn {:ok, v} -> v end)

    {:ok, violations}
  end

  @spec scan_staged() :: {:ok, [violation()]}
  def scan_staged do
    {output, 0} = System.cmd("git", ["diff", "--cached", "--name-only"])

    staged_files =
      output
      |> String.split("\n", trim: true)
      |> Enum.reject(&whitelisted?/1)

    violations =
      staged_files
      |> Task.async_stream(&scan_file/1, max_concurrency: System.schedulers_online())
      |> Enum.flat_map(fn {:ok, v} -> v end)

    {:ok, violations}
  end

  defp scan_file(file) do
    case File.read(file) do
      {:ok, content} ->
        lines = String.split(content, "\n")

        Enum.flat_map(@secret_patterns, fn {pattern, name, severity} ->
          lines
          |> Enum.with_index(1)
          |> Enum.filter(fn {line, _} -> Regex.match?(pattern, line) end)
          |> Enum.map(fn {_line, line_num} ->
            %{file: file, line: line_num, pattern: name, severity: severity}
          end)
        end)

      {:error, _} ->
        []
    end
  end

  defp gather_files(path) do
    Path.wildcard(Path.join(path, "**/*.{ex,exs,json,yml,yaml,toml,env}"))
  end

  defp whitelisted?(file) do
    Enum.any?(@whitelisted_paths, &String.contains?(file, &1))
  end
end
```

Runtime secret validation ensures all required secrets are present at application startup, failing fast with clear error messages rather than encountering cryptic errors later when a missing API key causes a service call to fail.

```elixir
defmodule PrismaticInfra.SecretValidator do
  @moduledoc """
  Validates that all required secrets are present at runtime.
  Fails fast at application startup if critical secrets are missing.
  """

  @required_secrets %{
    production: [
      "DATABASE_URL",
      "SECRET_KEY_BASE",
      "PHX_HOST"
    ],
    optional: [
      "GITLAB_TOKEN",
      "ANTHROPIC_AUTH_TOKEN",
      "SENTRY_DSN"
    ]
  }

  @spec validate!() :: :ok
  def validate! do
    env = Application.get_env(:prismatic, :env, :dev)
    required = Map.get(@required_secrets, env, [])

    missing = Enum.reject(required, &System.get_env/1)

    case missing do
      [] ->
        :ok

      vars ->
        raise """
        Missing required environment variables for #{env}:
        #{Enum.map_join(vars, "\n", &"  - #{&1}")}

        Set these variables before starting the application.
        """
    end
  end

  @spec mask(String.t()) :: String.t()
  def mask(secret) when byte_size(secret) > 8 do
    visible = String.slice(secret, 0, 4)
    "#{visible}***#{String.slice(secret, -4, 4)}"
  end

  def mask(_secret), do: "****"
end
```

## Architecture & Implementation

The Prismatic Platform's secrets architecture follows the twelve-factor app methodology: configuration is stored in the environment, not in the codebase. In development, secrets are loaded from `.env` files (which are in `.gitignore`). In production, Fly.io's `fly secrets set` command stores encrypted values that are injected as environment variables at boot time.

The architecture separates secret categories by access scope. Database credentials are available only to repository modules. API keys for external services are available only to the specific adapter that uses them. The `SECRET_KEY_BASE` for Phoenix is available only to endpoint modules. This scoped access minimizes the blast radius of a compromised secret.

Secret rotation is supported through the platform's configuration architecture. New secret values can be set in the environment without application restart (for services that re-read environment variables) or with a rolling restart (for services that read secrets at boot time).

## Usage in Prismatic Platform

Secrets are accessed through `System.get_env/1` in `config/runtime.exs` and validated at application startup. The secret scanner runs in the pre-commit hook pipeline.

```elixir
# config/runtime.exs pattern
database_url =
  System.get_env("DATABASE_URL") ||
    raise "DATABASE_URL is not set"

# Fly.io secret management
# fly secrets set DATABASE_URL="postgres://..." SECRET_KEY_BASE="..."
# fly secrets list
# fly secrets unset OLD_KEY
```

## Cross-References

- [Permission](/glossary/permission/) - Access rights governing who can read secrets
- [PII](/glossary/pii/) - Personal data protected by encryption keys stored as secrets
- [Runtime](/glossary/runtime/) - Execution phase where secrets are loaded from environment
- [Scope](/glossary/scope/) - Assessment boundaries protected by scoped secret access
- [Provenance](/glossary/provenance/) - Audit trail for secret access events

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
