+++
title = "Token"
weight = 50
[extra]
description = "Authentication credential or LLM processing unit representing a discrete element in security and AI contexts"
category = "security"
related_terms = ["authentication", "jwt", "api-key", "llm"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["token", "authentication", "JWT", "LLM tokens", "API key", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Token - Prismatic Platform"
+++

## Definition & Overview

A token is a fundamental concept with two distinct but equally important meanings in the Prismatic Platform. In the security context, a token is a cryptographic credential that represents an authenticated identity, granting access to protected resources without requiring repeated transmission of sensitive credentials like passwords. In the AI/LLM context, a token is the smallest unit of text processing, typically representing a word, subword, or character that large language models use to encode and generate text.

Authentication tokens, particularly JSON Web Tokens (JWT), form the backbone of the platform's API security model. They encode user identity, permissions, and expiration metadata in a cryptographically signed payload that can be verified without database lookups. This stateless verification is essential for the distributed architecture where the PrismaticAPI gateway on port 4004 must authenticate requests with minimal latency.

LLM tokens are the currency of AI inference. When the platform's 530+ AIAD agents interact with language models (whether Ollama's local models or cloud providers), every input and output is measured in tokens. Understanding token economics is critical for cost management, context window optimization, and response quality. A single English word typically maps to 1-2 tokens, while Elixir code may require 2-4 tokens per syntactic element.

## Technical Deep Dive

JWT tokens in the Prismatic Platform follow the RFC 7519 standard with platform-specific claims for RBAC integration:

```elixir
defmodule PrismaticAuth.Token do
  @moduledoc """
  JWT token generation and verification with platform-specific
  claims for role-based access control.
  """

  @signing_key_env "PRISMATIC_JWT_SECRET"
  @token_ttl_seconds 3_600
  @refresh_window_seconds 300

  @type claims :: %{
    sub: String.t(),
    iat: non_neg_integer(),
    exp: non_neg_integer(),
    roles: [String.t()],
    permissions: [String.t()]
  }

  @spec generate(String.t(), map()) :: {:ok, String.t()} | {:error, term()}
  def generate(user_id, opts \\ %{}) do
    now = System.system_time(:second)
    ttl = Map.get(opts, :ttl, @token_ttl_seconds)

    claims = %{
      "sub" => user_id,
      "iat" => now,
      "exp" => now + ttl,
      "roles" => Map.get(opts, :roles, ["viewer"]),
      "permissions" => Map.get(opts, :permissions, []),
      "jti" => generate_jti()
    }

    signer = Joken.Signer.create("HS256", signing_key())

    case Joken.encode_and_sign(claims, signer) do
      {:ok, token, _claims} -> {:ok, token}
      {:error, reason} -> {:error, {:token_generation_failed, reason}}
    end
  end

  @spec verify(String.t()) :: {:ok, claims()} | {:error, term()}
  def verify(token) do
    signer = Joken.Signer.create("HS256", signing_key())

    case Joken.verify_and_validate(token, signer) do
      {:ok, claims} -> {:ok, claims}
      {:error, [{:message, msg} | _]} -> {:error, {:invalid_token, msg}}
      {:error, reason} -> {:error, {:verification_failed, reason}}
    end
  end

  @spec needs_refresh?(map()) :: boolean()
  def needs_refresh?(%{"exp" => exp}) do
    System.system_time(:second) >= exp - @refresh_window_seconds
  end

  defp signing_key, do: System.fetch_env!(@signing_key_env)
  defp generate_jti, do: :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
end
```

For LLM token counting, the platform implements approximate tokenization that matches the behavior of common model tokenizers. This enables pre-flight cost estimation and context window management before sending requests to inference endpoints:

```elixir
defmodule PrismaticAI.TokenCounter do
  @moduledoc """
  Approximate token counting for LLM context window
  management and cost estimation.
  """

  @avg_chars_per_token 4.0
  @code_multiplier 1.3

  @spec count(String.t(), keyword()) :: non_neg_integer()
  def count(text, opts \\ []) do
    content_type = Keyword.get(opts, :type, :text)
    multiplier = if content_type == :code, do: @code_multiplier, else: 1.0

    text
    |> String.length()
    |> Kernel./(@ avg_chars_per_token)
    |> Kernel.*(multiplier)
    |> ceil()
  end

  @spec fits_context?(String.t(), pos_integer()) :: boolean()
  def fits_context?(text, max_tokens) do
    count(text) <= max_tokens
  end
end
```

## Architecture & Implementation

The Prismatic Platform's token architecture spans both security and AI domains with distinct but interconnected systems:

**Authentication Token Flow**: API requests arrive at the PrismaticAPI gateway, where the `APIAuth` plug extracts the Bearer token from the Authorization header. The token is verified against the signing key, claims are extracted, and the user's roles and permissions are injected into the connection assigns. This entire flow completes in under 1ms thanks to HMAC-based verification that requires no database lookups.

**Token Revocation**: Despite JWT's stateless nature, the platform maintains a revocation list in ETS for immediate token invalidation (user logout, security incidents). The revocation check adds negligible overhead since ETS lookups are sub-microsecond, while providing the ability to immediately cut off compromised tokens.

**LLM Token Budget Management**: Each AIAD agent has a configurable token budget per invocation. The budget tracks input tokens (prompt), output tokens (response), and total tokens (billing). When an agent approaches its budget limit, the system truncates context or switches to a more efficient model. The Ollama integration with local models (qwen3-coder, deepseek-coder) has no per-token cost but still enforces context window limits.

## Usage in Prismatic Platform

Tokens are integral to the platform's dual identity as both a security platform and an AI-powered system. The PrismaticAPI auto-introspecting REST gateway uses token-based authentication for all endpoints:

```elixir
defmodule PrismaticWeb.Plugs.APIAuth do
  @moduledoc """
  Authentication plug that validates Bearer tokens and
  injects user context into the connection.
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    with ["Bearer " <> token] <- Plug.Conn.get_req_header(conn, "authorization"),
         {:ok, claims} <- PrismaticAuth.Token.verify(token),
         false <- PrismaticAuth.Revocation.revoked?(claims["jti"]) do
      conn
      |> Plug.Conn.assign(:current_user_id, claims["sub"])
      |> Plug.Conn.assign(:user_roles, claims["roles"])
      |> Plug.Conn.assign(:user_permissions, claims["permissions"])
    else
      _ ->
        conn
        |> Plug.Conn.put_status(401)
        |> Phoenix.Controller.json(%{error: "unauthorized"})
        |> Plug.Conn.halt()
    end
  end
end
```

For AI operations, the OSINT toolbox's integration with LLM-powered analysis tracks token consumption per tool execution. When an OSINT tool like the threat intelligence analyzer processes results through an LLM, the token count is recorded for cost attribution and capacity planning.

## Cross-References

- [Authentication](@/glossary/authentication.md) - Identity verification process
- [JWT](@/glossary/jwt.md) - JSON Web Token standard
- **API Key** - Alternative authentication credential
- [LLM](@/glossary/llm.md) - Large language model context
- **User** - Platform identity entity

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
