+++
title = "Cookie"
weight = 50

[extra]
description = "A dual-context term in the Prismatic Platform: (1) HTTP cookies for session management, secure authentication, CSRF protection, and SameSite enforcement in Phoenix web applications; (2) Erlang distribution cookies for BEAM cluster node authentication in distributed OTP systems"
category = "distributed-systems"
domain = "platform-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["cluster", "authentication", "credential", "configuration", "cipher-suite", "session", "csrf", "samesite", "http", "plug", "phoenix", "tls"]
tags = ["glossary", "distributed-systems", "erlang", "cookie", "session", "authentication", "http-cookie", "csrf", "samesite", "beam-cluster", "security"]
complexity_level = "intermediate"
platform_integration = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "24 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP", "Phoenix Framework"]
key_takeaway = "Cookies serve two critical roles in the Prismatic Platform: HTTP cookies for secure session management with SameSite/CSRF protection in Phoenix, and Erlang distribution cookies for authenticating nodes in the BEAM cluster on Fly.io"
date_created = "2026-02-23"
date_modified = "2026-04-02"
keywords = ["cookie", "HTTP cookie", "Erlang cookie", "session management", "CSRF", "SameSite", "secure cookie", "HttpOnly", "distributed node", "BEAM cluster", "node authentication", "epmd", "glossary", "Prismatic Platform", "Phoenix", "Plug.Session"]
image = "/images/sections/glossary.png"
image_alt = "Cookie - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "security", "authentication"]
+++

## Definition

The term "cookie" carries two distinct but equally important meanings in the Prismatic Platform, both centered on authentication and trust.

**HTTP Cookies** are small pieces of data sent by a web server and stored by the client's browser. They enable stateful interactions over the stateless HTTP protocol, powering session management, authentication persistence, CSRF protection, and user preference storage. In Phoenix applications, cookies are managed through `Plug.Session` and configured with security attributes including `Secure`, `HttpOnly`, `SameSite`, `Domain`, `Path`, and `Max-Age`. Proper cookie configuration is a critical security concern -- misconfigured cookies are a common vector for session hijacking, cross-site request forgery (CSRF), and cross-site scripting (XSS) attacks.

**Erlang Distribution Cookies** are shared secret tokens that authenticate nodes in a BEAM (Bogdan/Bjorn's Erlang Abstract Machine) cluster. Before two Erlang nodes can communicate, they must share the same cookie value. If the cookies do not match, the connection is refused. This simple authentication mechanism provides a basic trust boundary for distributed Erlang clusters, ensuring that only authorized nodes can join and exchange messages. The cookie mechanism predates modern authentication systems and is intentionally simple -- it provides node-level authentication but not encryption. For production deployments, it must be combined with TLS distribution (`:inet_tls_dist`) for confidentiality.

In the Prismatic Platform, both cookie types are critical infrastructure. HTTP cookies manage user sessions for the Phoenix web application on port 4000, while Erlang cookies authenticate the distributed cluster nodes running on Fly.io's private network.

## Core Concepts

### HTTP Cookie Security Attributes

| Attribute | Purpose | Prismatic Setting | Risk If Missing |
|-----------|---------|------------------|-----------------|
| `Secure` | Cookie only sent over HTTPS | `true` (production) | Session hijacking via HTTP sniffing |
| `HttpOnly` | Cookie inaccessible to JavaScript | `true` | XSS can steal session tokens |
| `SameSite=Lax` | Cookie sent on same-site + top-level navigation | `Lax` (default) | CSRF via cross-site POST |
| `SameSite=Strict` | Cookie only sent on same-site requests | Used for sensitive ops | Breaks legitimate cross-site navigation |
| `SameSite=None` | Cookie sent on all cross-site requests | Never (except OAuth) | CSRF vulnerability |
| `Domain` | Cookie scope (domain + subdomains) | Explicit domain | Cookie leakage to subdomains |
| `Path` | Cookie scope (URL path) | `/` | Cookie not sent for expected paths |
| `Max-Age` | Cookie lifetime in seconds | Session: 86400 (24h) | Session lives forever or dies with browser |
| `__Host-` prefix | Requires Secure, no Domain, Path=/ | Used for session ID | Weaker security guarantees |
| `__Secure-` prefix | Requires Secure flag | Used for preferences | Cookie may be sent over HTTP |

### HTTP Cookie Types in Prismatic Platform

| Cookie | Purpose | Attributes | Lifetime |
|--------|---------|-----------|----------|
| `_prismatic_key` | Session ID (encrypted) | Secure, HttpOnly, SameSite=Lax | 24 hours |
| `_csrf_token` | CSRF protection token | Secure, SameSite=Lax | Session |
| `_prismatic_live_token` | LiveView connection token | Secure, HttpOnly | 30 minutes |
| `_prismatic_remember` | Remember-me token | Secure, HttpOnly, SameSite=Lax | 30 days |
| `_prismatic_locale` | Language preference | Secure, SameSite=Lax | 1 year |

### Erlang Cookie Configuration Methods

| Method | Scope | Priority | Use Case |
|--------|-------|----------|----------|
| `~/.erlang.cookie` | User-wide | Lowest | Development default |
| `-setcookie <value>` | VM flag | Medium | Explicit per-node startup |
| `Node.set_cookie/2` | Runtime | Highest | Dynamic configuration |
| `RELEASE_COOKIE` env | Release | Medium | Elixir releases (production) |
| Secrets manager | External | External | Production (Fly.io secrets) |

### Erlang Cookie Security Concerns

| Concern | Risk Level | Mitigation |
|---------|-----------|------------|
| **Cookie in plaintext on disk** | Medium | File permissions (0400), env vars |
| **No encryption of traffic** | High | Enable TLS distribution (`:inet_tls_dist`) |
| **Cookie brute-force** | Low | Use 64+ character random cookies |
| **Cookie leakage in logs** | Medium | Never log cookie values, use secrets manager |
| **Same cookie across environments** | High | Unique cookies per environment (dev/staging/prod) |
| **Cookie in source control** | Critical | Never commit; use `fly secrets set` |

## Technical Deep Dive

### HTTP Cookie Security in Phoenix

Phoenix provides robust cookie handling through `Plug.Session` and the `Plug.CSRFProtection` middleware. The session cookie is encrypted using `Plug.Crypto` with a signing salt and encryption salt derived from the application's secret key base. This means even if an attacker intercepts the cookie, they cannot read or tamper with its contents without the secret key.

CSRF protection in Phoenix works by generating a unique token per session and embedding it in forms and AJAX requests via the `csrf_meta_tag()` function. The server validates this token on every state-changing request (POST, PUT, PATCH, DELETE). LiveView connections use a separate authentication mechanism through the `connect_params` and `mount/3` lifecycle, but the initial page load still relies on cookie-based session authentication.

The `SameSite` attribute is a critical defense against CSRF attacks. With `SameSite=Lax` (the Prismatic Platform default), the session cookie is sent on same-site requests and top-level navigations (clicking a link from another site), but not on cross-site form submissions or AJAX requests. This blocks the most common CSRF vectors while maintaining usability for legitimate link-following.

### Erlang Distribution Cookie Mechanics

When an Erlang node attempts to connect to another node, the following handshake occurs:

1. The connecting node sends its name and a challenge (random number)
2. The receiving node responds with its own challenge and a digest computed from the connecting node's challenge and the shared cookie
3. The connecting node verifies the digest and sends its own digest
4. If both digests are valid, the connection is established

This challenge-response protocol ensures the cookie itself is never transmitted over the network. However, without TLS, all subsequent messages are sent in plaintext, and an attacker who observes the handshake could potentially replay or compute the cookie through offline analysis.

For production deployments on Fly.io, the Prismatic Platform configures Erlang distribution within Fly.io's private WireGuard network (`fdaa::/16`), adding a network-level containment layer. Combined with the distribution cookie, this provides defense-in-depth: even if the private network were compromised, an attacker would need the cookie to join the cluster.

### LiveView Session Authentication

Phoenix LiveView introduces a unique cookie challenge. The initial HTTP request carries the session cookie and establishes a WebSocket connection. But WebSocket upgrade requests do not carry cookies in all browsers and proxy configurations. Phoenix solves this by embedding a signed session token in the page HTML, which the LiveView JavaScript client sends during the WebSocket handshake.

The `Plug.Session` cookie provides the initial authentication, and the LiveView token (derived from the session) maintains authentication for the WebSocket lifetime. The token has a configurable expiry (default: 1,209,600 seconds / 14 days in Phoenix), after which the WebSocket is disconnected and the user must re-authenticate.

### Cookie-Based CSRF in API vs. Browser Contexts

The Prismatic Platform's API gateway (port 4004) uses token-based authentication (API keys), not cookies. CSRF protection is therefore not needed for the API. The Phoenix web application (port 4000) uses cookie-based sessions and requires CSRF protection for all state-changing operations.

This separation is architecturally important: mixing cookie-based and token-based authentication in the same endpoint creates confusion about which CSRF protections apply. The Prismatic Platform maintains strict separation through different ports and router pipelines.

## Usage in Prismatic Platform

- **Session Management**: `_prismatic_key` encrypted session cookie with 24-hour lifetime, renewed on activity
- **CSRF Protection**: `csrf_meta_tag()` in all form templates, validated by `Plug.CSRFProtection`
- **LiveView Authentication**: Signed session token embedded in page HTML for WebSocket upgrade
- **Remember Me**: Long-lived `_prismatic_remember` cookie (30 days) with server-side token rotation
- **Erlang Cluster**: `RELEASE_COOKIE` set via `fly secrets set` for Fly.io multi-node deployment
- **Horde Registry**: Cookie-authenticated Erlang distribution for `PrismaticSupervisor.Registry.Horde`
- **Libcluster Discovery**: DNS-based peer discovery on Fly.io with cookie authentication for joining
- **Livebook Integration**: Shared cookie for distributed connection to the running platform
- **Development Multi-Node**: Matching cookies for local Horde testing (`iex --sname node1 --cookie dev_cookie`)
- **SameSite Enforcement**: `Lax` mode for session cookies, preventing cross-site CSRF attacks

## Code Examples

### Phoenix Session Cookie Configuration

```elixir
defmodule PrismaticWebWeb.Endpoint do
  @moduledoc """
  Phoenix endpoint configuration with secure cookie settings.
  Configures encrypted session cookies with HttpOnly, Secure,
  and SameSite attributes for defense-in-depth session security.
  """

  use Phoenix.Endpoint, otp_app: :prismatic_web

  # Session configuration with security hardening
  @session_options [
    store: :cookie,
    key: "_prismatic_key",
    signing_salt: "prismatic_sign",
    encryption_salt: "prismatic_enc",
    # 24-hour session lifetime
    max_age: 86_400,
    # Security attributes
    same_site: "Lax",
    secure: true,
    http_only: true,
    # Additional options
    extra: "SameSite=Lax"
  ]

  plug Plug.Session, @session_options
end
```

### Secure Cookie Management Module

```elixir
defmodule PrismaticWeb.CookieManager do
  @moduledoc """
  Centralized cookie management for the Prismatic web application.
  Handles session cookies, remember-me tokens, CSRF tokens, and
  locale preferences with consistent security attributes.

  All cookies are configured with defense-in-depth security:
  - Encrypted/signed content (Plug.Crypto)
  - HttpOnly flag (prevents JavaScript access)
  - Secure flag (HTTPS only in production)
  - SameSite=Lax (CSRF prevention)
  - Explicit Max-Age (no indefinite sessions)

  ## Security Model

  The cookie security model follows three layers:
  1. **Transport security**: Secure flag ensures HTTPS-only transmission
  2. **Access control**: HttpOnly prevents client-side JavaScript access
  3. **Origin control**: SameSite prevents cross-site request attachment

  ## Examples

      iex> conn = PrismaticWeb.CookieManager.set_session_cookie(conn, user_id: 123)
      iex> get_resp_header(conn, "set-cookie")
      ["_prismatic_key=...; path=/; HttpOnly; Secure; SameSite=Lax"]

  """

  import Plug.Conn

  require Logger

  @session_cookie "_prismatic_key"
  @remember_cookie "_prismatic_remember"
  @locale_cookie "_prismatic_locale"
  @csrf_cookie "_csrf_token"

  @session_max_age 86_400
  @remember_max_age 2_592_000
  @locale_max_age 31_536_000

  @type cookie_opts :: [
          secure: boolean(),
          http_only: boolean(),
          same_site: String.t(),
          max_age: non_neg_integer(),
          path: String.t()
        ]

  @doc """
  Sets a secure session cookie with encrypted content.
  The cookie is encrypted using the application's secret_key_base.

  ## Parameters

    - `conn` - The Plug connection
    - `session_data` - Data to store in the session

  ## Examples

      iex> conn = PrismaticWeb.CookieManager.set_session_cookie(conn, user_id: 123)
      iex> conn.status
      nil

  """
  @spec set_session_cookie(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def set_session_cookie(conn, session_data) do
    Enum.reduce(session_data, conn, fn {key, value}, acc ->
      put_session(acc, key, value)
    end)
  end

  @doc """
  Sets a remember-me cookie with a signed, long-lived token.
  The token is rotated on each use to prevent replay attacks.

  ## Parameters

    - `conn` - The Plug connection
    - `user_id` - The user ID to remember
    - `token` - A unique, random token for this remember-me session

  ## Examples

      iex> token = :crypto.strong_rand_bytes(32) |> Base.url_encode64()
      iex> conn = PrismaticWeb.CookieManager.set_remember_cookie(conn, 123, token)

  """
  @spec set_remember_cookie(Plug.Conn.t(), integer(), String.t()) :: Plug.Conn.t()
  def set_remember_cookie(conn, user_id, token) do
    signed_value = Phoenix.Token.sign(conn, "remember_me", {user_id, token})

    put_resp_cookie(conn, @remember_cookie, signed_value,
      max_age: @remember_max_age,
      http_only: true,
      secure: production?(),
      same_site: "Lax",
      path: "/"
    )
  end

  @doc """
  Verifies and extracts data from a remember-me cookie.
  Tokens older than 30 days are rejected.

  ## Examples

      iex> {:ok, {user_id, token}} = PrismaticWeb.CookieManager.verify_remember_cookie(conn)
      iex> user_id
      123

  """
  @spec verify_remember_cookie(Plug.Conn.t()) :: {:ok, {integer(), String.t()}} | {:error, atom()}
  def verify_remember_cookie(conn) do
    case conn.cookies[@remember_cookie] do
      nil ->
        {:error, :no_cookie}

      signed_value ->
        case Phoenix.Token.verify(conn, "remember_me", signed_value, max_age: @remember_max_age) do
          {:ok, {user_id, token}} -> {:ok, {user_id, token}}
          {:error, reason} -> {:error, reason}
        end
    end
  end

  @doc """
  Sets the locale preference cookie.

  ## Examples

      iex> conn = PrismaticWeb.CookieManager.set_locale_cookie(conn, "cs")

  """
  @spec set_locale_cookie(Plug.Conn.t(), String.t()) :: Plug.Conn.t()
  def set_locale_cookie(conn, locale) when locale in ["en", "cs", "sk"] do
    put_resp_cookie(conn, @locale_cookie, locale,
      max_age: @locale_max_age,
      secure: production?(),
      same_site: "Lax",
      path: "/"
    )
  end

  @doc """
  Clears all application cookies on logout.
  Ensures complete session termination with no residual state.

  ## Examples

      iex> conn = PrismaticWeb.CookieManager.clear_all(conn)

  """
  @spec clear_all(Plug.Conn.t()) :: Plug.Conn.t()
  def clear_all(conn) do
    conn
    |> configure_session(drop: true)
    |> delete_resp_cookie(@remember_cookie, path: "/")
    |> delete_resp_cookie(@locale_cookie, path: "/")
  end

  @doc """
  Returns the default secure cookie options for the current environment.

  ## Examples

      iex> PrismaticWeb.CookieManager.default_cookie_opts()
      [secure: true, http_only: true, same_site: "Lax", path: "/"]

  """
  @spec default_cookie_opts() :: cookie_opts()
  def default_cookie_opts do
    [
      secure: production?(),
      http_only: true,
      same_site: "Lax",
      path: "/"
    ]
  end

  defp production? do
    Application.get_env(:prismatic_web, :environment) == :prod
  end
end
```

### Erlang Distribution Cookie Configuration

```elixir
defmodule PrismaticCluster.NodeConnector do
  @moduledoc """
  Manages distributed node connections using Erlang cookies.
  Verifies cookie authentication before establishing connections.
  Used by PrismaticSupervisor for Horde registry cluster formation.

  ## Security Model

  The cookie provides node-level authentication only. For production
  deployments, this is combined with:
  - Fly.io private WireGuard network (network isolation)
  - TLS distribution (encryption, optional)
  - Firewall rules (port restriction)

  ## Examples

      iex> PrismaticCluster.NodeConnector.connect_node(:"prismatic@fdaa:0:1::1")
      {:ok, :"prismatic@fdaa:0:1::1"}

  """

  require Logger

  @type connection_result :: {:ok, atom()} | {:error, atom()}

  @doc """
  Connects to a remote BEAM node. The Erlang distribution cookie
  must match for the connection to succeed.

  Emits telemetry events on successful connection for cluster
  monitoring dashboards.

  ## Parameters

    - `node_name` - The fully qualified node name (e.g., `:"prismatic@fdaa:0:1::1"`)

  ## Examples

      iex> PrismaticCluster.NodeConnector.connect_node(:"prismatic@127.0.0.1")
      {:ok, :"prismatic@127.0.0.1"}

      iex> PrismaticCluster.NodeConnector.connect_node(:"unknown@10.0.0.1")
      {:error, :connection_failed}

  """
  @spec connect_node(atom()) :: connection_result()
  def connect_node(node_name) when is_atom(node_name) do
    case Node.connect(node_name) do
      true ->
        :telemetry.execute(
          [:prismatic, :cluster, :connected],
          %{count: 1},
          %{node: node_name}
        )

        Logger.info("Connected to node: #{node_name}")
        {:ok, node_name}

      false ->
        Logger.warning("Failed to connect to node: #{node_name}")
        {:error, :connection_failed}

      :ignored ->
        {:error, :not_distributed}
    end
  end

  @doc """
  Verifies that a remote node has the same cookie as this node.
  Uses RPC to query the remote node's cookie.

  ## Examples

      iex> PrismaticCluster.NodeConnector.verify_cookie_match(:"prismatic@127.0.0.1")
      true

  """
  @spec verify_cookie_match(atom()) :: boolean()
  def verify_cookie_match(node_name) when is_atom(node_name) do
    local_cookie = Node.get_cookie()

    case :rpc.call(node_name, Node, :get_cookie, []) do
      ^local_cookie -> true
      {:badrpc, _reason} -> false
      _other -> false
    end
  end

  @doc """
  Configures the Erlang distribution cookie from environment or config.
  Uses `String.to_existing_atom/1` for ZERO doctrine compliance.

  ## Parameters

    - `opts` - Keyword list with `:cookie` and optional `:node_name`

  ## Examples

      iex> PrismaticCluster.NodeConnector.configure_distribution(cookie: "my_secret_cookie")
      :ok

  """
  @spec configure_distribution(keyword()) :: :ok | {:error, term()}
  def configure_distribution(opts) do
    cookie = Keyword.get(opts, :cookie, Application.get_env(:prismatic, :erlang_cookie))
    node_name = Keyword.get(opts, :node_name, Node.self())

    if cookie do
      # ZERO doctrine: use to_existing_atom for known cookie values
      # Cookies are set at system startup, atom already exists
      cookie_atom =
        if is_atom(cookie) do
          cookie
        else
          String.to_existing_atom(cookie)
        end

      Node.set_cookie(node_name, cookie_atom)
      Logger.info("Distribution cookie configured for #{node_name}")
      :ok
    else
      {:error, :no_cookie_configured}
    end
  end

  @doc """
  Returns cluster status including connected nodes and cookie health.

  ## Examples

      iex> PrismaticCluster.NodeConnector.cluster_status()
      %{self: :"prismatic@127.0.0.1", nodes: [...], cookie_set: true}

  """
  @spec cluster_status() :: map()
  def cluster_status do
    %{
      self: Node.self(),
      nodes: Node.list(),
      node_count: length(Node.list()) + 1,
      cookie_set: Node.get_cookie() != :nocookie,
      distributed: Node.alive?()
    }
  end
end
```

### Release Cookie Configuration

```bash
# rel/env.sh.eex (Elixir release environment)
# Sets the Erlang cookie for distributed clustering.
# In production, RELEASE_COOKIE is set via `fly secrets set`.
# In development, falls back to a deterministic dev cookie.
export RELEASE_COOKIE="${RELEASE_COOKIE:-$(cat /run/secrets/erlang_cookie 2>/dev/null || echo 'prismatic_dev_cookie')}"
export RELEASE_DISTRIBUTION=name
export RELEASE_NODE="prismatic@${FLY_PRIVATE_IP:-127.0.0.1}"
```

## Common Pitfalls

| Pitfall | Impact | Severity | Mitigation |
|---------|--------|----------|------------|
| **Missing Secure flag in production** | Session hijacking via HTTP | Critical | Always set `secure: true` in production |
| **Missing HttpOnly flag** | XSS can steal session cookies | Critical | Always set `http_only: true` for session cookies |
| **SameSite=None without Secure** | Browser rejects the cookie entirely | High | Never use `SameSite=None` without `Secure` |
| **Erlang cookie in source control** | Cluster authentication compromised | Critical | Use `fly secrets set`, never commit cookies |
| **Same Erlang cookie for all environments** | Dev can join production cluster | High | Unique cookies per environment |
| **No cookie rotation on password change** | Old sessions remain valid | High | Invalidate all sessions on credential change |
| **Infinite session lifetime** | Stolen cookies valid forever | High | Set explicit `max_age`, enforce server-side expiry |
| **Cookie too large** | HTTP 431 errors, performance degradation | Medium | Keep cookies under 4KB, use server-side sessions |
| **`String.to_atom` for cookie values** | Atom table exhaustion (ZERO violation) | High | Use `String.to_existing_atom/1` or pre-defined atoms |
| **No TLS for Erlang distribution** | Cluster traffic in plaintext | High | Enable `:inet_tls_dist` for internet-facing clusters |
| **Missing CSRF protection** | Cross-site form submission attacks | Critical | Always use `csrf_meta_tag()` in forms |
| **Sharing cookies across subdomains** | Cookie leakage to untrusted subdomains | Medium | Set explicit `domain` attribute |

## Best Practices

1. **Always set Secure, HttpOnly, and SameSite on session cookies**: These three attributes form the minimum security baseline. Secure prevents HTTP transmission, HttpOnly prevents JavaScript access, SameSite prevents cross-site attachment.

2. **Use encrypted session cookies (Plug.Session with :cookie store)**: Phoenix encrypts session data using the application's `secret_key_base`, preventing both reading and tampering even if cookies are intercepted.

3. **Set explicit Max-Age on all cookies**: Never rely on browser-default session cookies that persist until the browser closes. Define explicit lifetimes: 24 hours for sessions, 30 days for remember-me, 1 year for preferences.

4. **Generate Erlang cookies with cryptographic randomness**: Use `openssl rand -hex 32` or `:crypto.strong_rand_bytes(32)` to generate 64-character random cookies. Never use dictionary words or predictable values.

5. **Store Erlang cookies in secrets management, never in code**: Use `fly secrets set RELEASE_COOKIE=<value>` for Fly.io, or a secrets manager for other platforms. Never commit cookies to git.

6. **Use different Erlang cookies per environment**: Development, staging, and production must have unique cookies to prevent accidental cross-environment cluster connections.

7. **Implement server-side session invalidation**: Cookie expiry alone is not sufficient. Maintain a server-side session store (ETS or database) to enable immediate session revocation on logout or security events.

8. **Enable TLS for Erlang distribution in production**: The cookie alone provides authentication, not encryption. Enable `:inet_tls_dist` for production clusters that communicate over untrusted networks.

9. **Rotate remember-me tokens on each use**: When a remember-me cookie is used to create a new session, generate a new token and replace the old one. This limits the window of exploitation for stolen tokens.

10. **Monitor cookie-related security events**: Track failed CSRF validations, expired session attempts, and invalid remember-me tokens as potential indicators of attack.

## Related Terms

- [Cluster](/glossary/cluster/) -- distributed node group using Erlang cookie authentication
- [Authentication](/glossary/authentication/) -- identity verification (cookies are one mechanism)
- [Session](/glossary/session/) -- stateful user interaction managed via cookies
- [CSRF](/glossary/csrf/) -- cross-site request forgery prevented by cookie SameSite and tokens
- [Configuration](/glossary/configuration/) -- cookie configuration management across environments
- [Cipher Suite](/glossary/cipher-suite/) -- TLS encryption for cookie transport and distribution
- [HTTP](/glossary/http/) -- protocol carrying cookie headers (Set-Cookie, Cookie)
- [Plug](/glossary/plug/) -- middleware framework managing cookie lifecycle in Phoenix
- [Phoenix](/glossary/phoenix/) -- web framework with built-in cookie security
- [TLS](/glossary/tls/) -- transport security for cookie transmission
- [XSS](/glossary/xss/) -- attack vector mitigated by HttpOnly cookies
- [Security](/glossary/security/) -- overall security architecture including cookie hardening

## See Also

- [Architecture](/architecture/) -- platform architecture with cookie security layers
- [Capabilities](/capabilities/) -- platform capability security requirements
- [Security](/glossary/security/) -- comprehensive security documentation
- **Livebooks**: `livebooks/domains/platform_administration/` -- cluster management with cookie configuration
- **Academy**: Distributed Erlang and cluster coordination topics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
