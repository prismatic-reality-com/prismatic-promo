+++
title = "OAuth"
weight = 50
[extra]
description = "Open Authorization protocol that enables secure delegated access, allowing applications to act on behalf of users without sharing credentials."
category = "security"
related_terms = ["authentication", "authorization", "jwt", "api"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OAuth", "authorization", "authentication", "access token", "security", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "OAuth - Prismatic Platform"
+++

## Definition & Overview

OAuth (Open Authorization) is an open standard protocol that enables secure delegated access to resources. It allows users to grant third-party applications limited access to their accounts on a service without sharing their credentials (username and password). Instead, the service issues access tokens with defined scopes and lifetimes, enabling fine-grained control over what the third-party application can do and for how long.

OAuth 2.0, the current version, defines four grant types (authorization flows) for different use cases: Authorization Code (for server-side web applications), Implicit (deprecated, for browser-based apps), Resource Owner Password Credentials (for trusted applications), and Client Credentials (for machine-to-machine communication). OAuth 2.1, currently in draft, simplifies the specification by removing deprecated flows and mandating security best practices like PKCE (Proof Key for Code Exchange).

The Prismatic Platform implements OAuth for multiple integration points. OSINT tools that require API authentication (Shodan, VirusTotal, GitHub) use OAuth-based token management. The platform's API gateway supports OAuth bearer tokens for external consumer authentication. The MCP server uses token-based authorization for AI agent access control. Understanding OAuth is essential for operating and extending the platform's integration capabilities.

## Technical Deep Dive

The OAuth 2.0 Authorization Code flow, the most secure and widely used grant type, involves four parties: the Resource Owner (user), the Client (application requesting access), the Authorization Server (issues tokens), and the Resource Server (hosts the protected resources). The flow proceeds in discrete steps: the client redirects the user to the authorization server, the user authenticates and consents, the authorization server redirects back with an authorization code, the client exchanges the code for an access token (server-to-server), and the client uses the access token to access resources.

Access tokens are bearer tokens: any entity presenting a valid token can access the associated resources. This makes token security critical. Tokens should have short lifetimes (minutes to hours), be transmitted only over HTTPS, and be stored securely. Refresh tokens, which have longer lifetimes, allow obtaining new access tokens without re-authentication, but must be stored even more securely as they grant extended access.

```elixir
defmodule PrismaticApi.Auth.OAuthProvider do
  @moduledoc """
  OAuth 2.0 provider implementation for the Prismatic API.
  Supports Authorization Code and Client Credentials flows.
  """

  alias PrismaticApi.Auth.TokenStore

  @type token_response :: %{
    access_token: String.t(),
    token_type: String.t(),
    expires_in: pos_integer(),
    refresh_token: String.t() | nil,
    scope: String.t()
  }

  @access_token_ttl 3600
  @refresh_token_ttl 86_400 * 30

  @spec authorize(map()) :: {:ok, String.t()} | {:error, term()}
  def authorize(%{response_type: "code", client_id: client_id, scope: scope} = params) do
    with {:ok, client} <- validate_client(client_id),
         {:ok, _} <- validate_redirect_uri(client, params.redirect_uri),
         {:ok, _} <- validate_scope(scope) do
      code = generate_authorization_code(client_id, scope)
      {:ok, code}
    end
  end

  @spec exchange_code(String.t(), String.t()) :: {:ok, token_response()} | {:error, term()}
  def exchange_code(authorization_code, client_id) do
    with {:ok, code_data} <- TokenStore.get_and_delete_code(authorization_code),
         true <- code_data.client_id == client_id do
      issue_tokens(code_data.client_id, code_data.scope)
    else
      _ -> {:error, :invalid_grant}
    end
  end

  @spec client_credentials(String.t(), String.t(), String.t()) ::
    {:ok, token_response()} | {:error, term()}
  def client_credentials(client_id, client_secret, scope) do
    with {:ok, client} <- validate_client(client_id),
         :ok <- verify_secret(client, client_secret),
         {:ok, _} <- validate_scope(scope) do
      issue_tokens(client_id, scope)
    end
  end

  @spec validate_token(String.t()) :: {:ok, map()} | {:error, :invalid_token}
  def validate_token(access_token) do
    case TokenStore.get(access_token) do
      {:ok, token_data} ->
        if DateTime.compare(DateTime.utc_now(), token_data.expires_at) == :lt do
          {:ok, token_data}
        else
          {:error, :expired_token}
        end

      :error ->
        {:error, :invalid_token}
    end
  end

  defp issue_tokens(client_id, scope) do
    access_token = :crypto.strong_rand_bytes(32) |> Base.url_encode64(padding: false)
    refresh_token = :crypto.strong_rand_bytes(48) |> Base.url_encode64(padding: false)

    token_data = %{
      client_id: client_id,
      scope: scope,
      expires_at: DateTime.add(DateTime.utc_now(), @access_token_ttl)
    }

    TokenStore.store(access_token, token_data, @access_token_ttl)
    TokenStore.store_refresh(refresh_token, token_data, @refresh_token_ttl)

    {:ok, %{
      access_token: access_token,
      token_type: "Bearer",
      expires_in: @access_token_ttl,
      refresh_token: refresh_token,
      scope: scope
    }}
  end

  defp generate_authorization_code(client_id, scope) do
    code = :crypto.strong_rand_bytes(24) |> Base.url_encode64(padding: false)
    TokenStore.store_code(code, %{client_id: client_id, scope: scope}, 600)
    code
  end

  defp validate_client(_client_id), do: {:ok, %{}}
  defp validate_redirect_uri(_client, _uri), do: {:ok, true}
  defp validate_scope(_scope), do: {:ok, true}
  defp verify_secret(_client, _secret), do: :ok
end
```

Scope management is central to OAuth security. Scopes define what actions a token authorizes (e.g., `read:osint`, `write:entities`, `admin:users`). The platform defines granular scopes for each API capability, ensuring that tokens carry minimum necessary privileges. An OSINT-only integration receives tokens scoped to `read:osint execute:osint` and cannot access DD entities or admin functions.

## Architecture & Implementation

The platform's OAuth implementation integrates with the API gateway at the Plug middleware level. The `PrismaticWeb.Plugs.APIAuth` plug extracts the Bearer token from the Authorization header, validates it against the TokenStore, and populates the connection's assigns with the authenticated client identity and authorized scopes. Downstream controllers and LiveView pages can then enforce scope-based authorization on individual operations.

Token storage uses ETS for active tokens (sub-millisecond validation) with PostgreSQL as the durable backing store for refresh tokens and revocation tracking. When a token is revoked (by the user or by an admin), the ETS entry is immediately deleted and a revocation record is written to PostgreSQL. Token validation checks ETS first (hot path) and falls back to PostgreSQL for tokens that may have been evicted from the cache.

The OSINT adapters that require API keys use a simplified OAuth-like pattern: API keys are stored encrypted in the platform's configuration, and each adapter retrieves its key at request time. For adapters that support full OAuth (like GitHub's API), the platform stores refresh tokens and automatically refreshes access tokens before they expire.

## Usage in Prismatic Platform

OAuth-protected API endpoint middleware:

```elixir
defmodule PrismaticWeb.Plugs.APIAuth do
  @moduledoc """
  Plug for OAuth bearer token authentication on API endpoints.
  Validates tokens and enforces scope-based authorization.
  """

  import Plug.Conn

  alias PrismaticApi.Auth.OAuthProvider

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, opts) do
    required_scope = Keyword.get(opts, :scope)

    with {:ok, token} <- extract_bearer_token(conn),
         {:ok, token_data} <- OAuthProvider.validate_token(token),
         :ok <- check_scope(token_data, required_scope) do
      conn
      |> assign(:current_client, token_data.client_id)
      |> assign(:token_scope, token_data.scope)
    else
      {:error, reason} ->
        conn
        |> put_status(401)
        |> Phoenix.Controller.json(%{error: "unauthorized", reason: to_string(reason)})
        |> halt()
    end
  end

  defp extract_bearer_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> {:ok, token}
      _ -> {:error, :missing_token}
    end
  end

  defp check_scope(_token_data, nil), do: :ok
  defp check_scope(%{scope: scope}, required) do
    granted = String.split(scope, " ")
    if required in granted, do: :ok, else: {:error, :insufficient_scope}
  end
end
```

OAuth integration provides the security boundary between external consumers and the platform's capabilities, ensuring that API access is authenticated, scoped, and auditable.

## Cross-References

- [Authentication](/glossary/authentication/) - Identity verification that OAuth builds upon
- [Authorization](/glossary/authorization/) - Access control that OAuth enables
- [JWT](/glossary/jwt/) - Token format often used with OAuth
- [API](/glossary/api/) - Interface layer protected by OAuth
- [OSINT](/glossary/osint/) - Tools using OAuth for external API access

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
