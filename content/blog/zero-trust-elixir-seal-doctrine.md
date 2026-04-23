+++
title = "Zero Trust in Elixir: The SEAL Security Doctrine"
date = 2026-03-05
description = "Implementing the SEAL security doctrine in Elixir: parameterized Ecto queries, environment variable secrets management, Code.eval prevention, input validation boundaries, and OWASP Top 10 mapping."

[extra]
author = "Tomas Korcak (korczis)"
category = "security"
tags = ["security", "seal", "elixir", "ecto", "owasp"]
reading_time = "8 min"
keywords = ["elixir security", "seal doctrine", "parameterized queries", "code eval prevention", "owasp elixir"]
image = "/images/blog/zero-trust-elixir-seal-doctrine.png"
word_count = 1070
date_created = "2026-03-05"
date_modified = "2026-03-05"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Zero Trust Elixir SEAL Doctrine - Prismatic Platform"
+++

## Why SEAL Exists

Every security breach starts with a violated assumption. SQL injection assumes queries are safely constructed. Hardcoded secrets assume the repository is private. Code evaluation assumes input is trusted. The SEAL (Security Enforcement Absolute Lock) doctrine eliminates these assumptions at the code level, making entire categories of vulnerabilities structurally impossible.

SEAL is not a guideline — it is enforced through pre-commit hooks, CI pipeline checks, and AST analysis mix tasks. Code that violates SEAL principles cannot be committed, cannot pass CI, and cannot reach production. This is security-by-construction, not security-by-review.

## OWASP Top 10 Mapping

SEAL maps directly to the OWASP Top 10 categories with specific Elixir enforcement patterns:

| OWASP Category | SEAL Rule | Enforcement | Detection |
|---------------|-----------|-------------|-----------|
| A01: Broken Access Control | RBAC via Casbin | Runtime + Test | Integration tests |
| A02: Cryptographic Failures | No hardcoded secrets | Pre-commit grep | Pattern scan |
| A03: Injection | Parameterized queries only | AST analysis | `fragment/1` scan |
| A04: Insecure Design | Input validation boundaries | Code review | Architecture review |
| A05: Security Misconfiguration | Environment-based config | Config validation | Startup checks |
| A06: Vulnerable Components | Dependency audit | CI pipeline | `mix deps.audit` |
| A07: Auth Failures | Session management | Runtime + Test | Auth module tests |
| A08: Data Integrity Failures | `:safe` binary_to_term | Pre-commit grep | Pattern scan |
| A09: Logging Failures | Structured logging mandatory | OTEL doctrine | Telemetry audit |
| A10: SSRF | URL allowlisting | Runtime validation | Request interceptor |

## Parameterized Ecto Queries

SQL injection through string interpolation in Ecto fragments is the most common Elixir-specific vulnerability. SEAL mandates parameterized queries everywhere:

```elixir
# BANNED by SEAL — SQL injection via string interpolation
defmodule Unsafe do
  import Ecto.Query

  # This allows arbitrary SQL injection through the value parameter
  def search_bad(value) do
    from(u in "users", where: fragment("name = '#{value}'"))
  end
end

# SEAL-compliant — parameterized query
defmodule Prismatic.Accounts.UserQuery do
  @moduledoc """
  SEAL-compliant user query builder with parameterized fragments.
  All dynamic values are passed as query parameters, never interpolated.
  """

  import Ecto.Query

  @spec search_by_name(Ecto.Queryable.t(), String.t()) :: Ecto.Query.t()
  def search_by_name(queryable, name) do
    from(u in queryable, where: fragment("name = ?", ^name))
  end

  @spec search_by_pattern(Ecto.Queryable.t(), String.t()) :: Ecto.Query.t()
  def search_by_pattern(queryable, pattern) do
    sanitized = sanitize_like_pattern(pattern)
    from(u in queryable, where: fragment("name ILIKE ?", ^sanitized))
  end

  @spec filter_by_ids(Ecto.Queryable.t(), list(integer())) :: Ecto.Query.t()
  def filter_by_ids(queryable, ids) when is_list(ids) do
    from(u in queryable, where: u.id in ^ids)
  end

  defp sanitize_like_pattern(pattern) do
    pattern
    |> String.replace("\\", "\\\\")
    |> String.replace("%", "\\%")
    |> String.replace("_", "\\_")
    |> then(&"%#{&1}%")
  end
end
```

## Environment Variable Secrets Management

Hardcoded secrets are detected by pre-commit hooks scanning for common patterns. SEAL mandates all secrets come from environment variables or a vault:

```elixir
# BANNED by SEAL — hardcoded API key
defmodule UnsafeConfig do
  def api_key, do: "sk-1234567890abcdef"
end

# SEAL-compliant — environment variable with validation
defmodule Prismatic.Config.Secrets do
  @moduledoc """
  SEAL-compliant secrets management.
  All secrets are sourced from environment variables at runtime.
  Missing required secrets cause immediate startup failure.
  """

  @spec fetch!(String.t()) :: String.t()
  def fetch!(env_var) do
    case System.get_env(env_var) do
      nil ->
        raise RuntimeError,
          "Required secret #{env_var} not configured. " <>
          "Set it as an environment variable before starting the application."

      "" ->
        raise RuntimeError,
          "Secret #{env_var} is set but empty. Provide a valid value."

      value ->
        value
    end
  end

  @spec fetch(String.t(), String.t() | nil) :: String.t() | nil
  def fetch(env_var, default \\ nil) do
    System.get_env(env_var) || default
  end

  @spec configured?(String.t()) :: boolean()
  def configured?(env_var) do
    case System.get_env(env_var) do
      nil -> false
      "" -> false
      _ -> true
    end
  end
end
```

The pre-commit hook that catches hardcoded secrets scans for patterns like API keys, passwords, and tokens:

```elixir
# Patterns detected by SEAL pre-commit hook
@secret_patterns [
  ~r/(?:api[_-]?key|secret|password|token)\s*[:=]\s*["'][a-zA-Z0-9+\/=]{16,}/i,
  ~r/sk-[a-zA-Z0-9]{20,}/,
  ~r/ghp_[a-zA-Z0-9]{36}/,
  ~r/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  ~r/AKIA[0-9A-Z]{16}/
]
```

## Code.eval Prevention

`Code.eval_string/1` executes arbitrary Elixir code at runtime. If user input reaches this function, it enables remote code execution. SEAL bans all forms of runtime code evaluation:

```elixir
# BANNED by SEAL — arbitrary code execution
Code.eval_string(user_input)
Code.eval_quoted(user_ast)
Code.compile_string(user_code)

# SEAL-compliant — controlled execution via allowlist
defmodule Prismatic.SafeEval do
  @moduledoc """
  SEAL-compliant safe expression evaluator.
  Only allows pre-approved operations through an explicit allowlist.
  No arbitrary code execution is possible.
  """

  @allowed_operations %{
    "add" => &Kernel.+/2,
    "subtract" => &Kernel.-/2,
    "multiply" => &Kernel.*/2,
    "divide" => &safe_divide/2,
    "uppercase" => &String.upcase/1,
    "lowercase" => &String.downcase/1
  }

  @spec evaluate(String.t(), list()) :: {:ok, term()} | {:error, :forbidden_operation}
  def evaluate(operation, args) when is_binary(operation) and is_list(args) do
    case Map.get(@allowed_operations, operation) do
      nil ->
        {:error, :forbidden_operation}

      func ->
        try do
          {:ok, apply(func, args)}
        rescue
          e in [ArithmeticError, FunctionClauseError] ->
            {:error, {:evaluation_failed, Exception.message(e)}}
        end
    end
  end

  defp safe_divide(_, 0), do: raise(ArithmeticError, "division by zero")
  defp safe_divide(a, b), do: a / b
end
```

## Input Validation Boundaries

SEAL enforces input validation at system boundaries — the point where external data enters the system. Internal function calls between trusted modules do not need redundant validation:

```elixir
defmodule Prismatic.Validation.Boundary do
  @moduledoc """
  Input validation at system boundaries.
  Validates and sanitizes all external input before it enters
  the trusted internal domain.
  """

  @spec validate_email(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def validate_email(input) when is_binary(input) do
    trimmed = String.trim(input)

    cond do
      byte_size(trimmed) > 254 ->
        {:error, "Email exceeds maximum length"}

      not Regex.match?(~r/^[^\s@]+@[^\s@]+\.[^\s@]+$/, trimmed) ->
        {:error, "Invalid email format"}

      true ->
        {:ok, String.downcase(trimmed)}
    end
  end

  def validate_email(_), do: {:error, "Email must be a string"}

  @spec validate_ip(String.t()) :: {:ok, :inet.ip_address()} | {:error, String.t()}
  def validate_ip(input) when is_binary(input) do
    case :inet.parse_address(String.to_charlist(String.trim(input))) do
      {:ok, ip} -> {:ok, ip}
      {:error, _} -> {:error, "Invalid IP address format"}
    end
  end

  @spec validate_domain(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def validate_domain(input) when is_binary(input) do
    trimmed = String.trim(input) |> String.downcase()

    cond do
      byte_size(trimmed) > 253 ->
        {:error, "Domain exceeds maximum length"}

      not Regex.match?(~r/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, trimmed) ->
        {:error, "Invalid domain format"}

      true ->
        {:ok, trimmed}
    end
  end
end
```

## Enforcement Infrastructure

SEAL enforcement operates at three levels. Pre-commit hooks run grep-based pattern scans that catch the most common violations in under 100ms. CI runs AST-based analysis via mix tasks that detect subtler patterns like indirect Code.eval calls through variable references. Runtime guards in production reject malformed input at system boundaries before it can reach any business logic.

| Enforcement Level | Tool | Speed | Coverage |
|------------------|------|-------|----------|
| Pre-commit | grep pattern scan | < 100ms | String.to_atom, hardcoded secrets, fragment interpolation |
| CI pipeline | AST mix task | < 30s | Code.eval chains, unsafe binary_to_term, indirect patterns |
| Runtime | Boundary validation | Per-request | All external input at API/LiveView boundaries |
| Monitoring | Telemetry + alerts | Continuous | Anomalous query patterns, auth failures |

The SEAL doctrine transforms security from an afterthought into a structural property of the codebase. Violations are impossible to commit, not just discouraged. This is the difference between security policy and security architecture.
