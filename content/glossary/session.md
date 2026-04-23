+++
title = "Session"
weight = 50
[extra]
description = "Authenticated user session providing identity continuity and state management across HTTP requests in stateless web architectures"
category = "security"
related_terms = ["authentication", "token", "jwt", "cookie", "plug", "phoenix", "ets", "genserver"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session", "authentication", "user identity", "state management", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "authentication"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Session - Prismatic Platform"
+++

## Definition & Overview

A session is a server-side or token-based mechanism that maintains user identity and state across multiple HTTP requests. Because HTTP is inherently stateless, sessions bridge the gap by associating a unique identifier (typically stored in a cookie or authorization header) with a server-side data store that holds user context, permissions, and transient application state. Sessions underpin authentication, authorization, and personalization in every web application.

In the Prismatic Platform, sessions operate at two distinct layers. The first is the Phoenix session layer, which manages browser-based interactions via encrypted cookies and ETS-backed server-side stores. The second is the API session layer, which uses bearer tokens validated through the `PrismaticWeb.Plugs.APIAuth` plug pipeline. Both layers converge on a unified identity model that grants access to OSINT tools, agent orchestration, and storage adapters based on the authenticated principal's role and permissions.

Session management in distributed Erlang/OTP systems presents unique challenges compared to traditional web frameworks. Since the BEAM VM supports clustering and process migration, sessions must be accessible across nodes. The Prismatic Platform addresses this through ETS-backed session stores on individual nodes with optional Redis synchronization for multi-node deployments, ensuring sub-millisecond session lookups without sacrificing cluster-wide consistency.

## Technical Deep Dive

Session management in Phoenix builds on the Plug specification, which defines a composable middleware pipeline. The session is initialized early in the pipeline and made available to all subsequent plugs and controller/LiveView code through the connection struct.

### Session Storage Backends

Phoenix supports multiple session storage strategies, each with distinct trade-offs:

```elixir
defmodule PrismaticWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :prismatic_web

  # Cookie-based session (encrypted, client-side storage)
  @session_options [
    store: :cookie,
    key: "_prismatic_session",
    signing_salt: "prismatic_salt",
    encryption_salt: "prismatic_enc_salt",
    max_age: 86_400,
    same_site: "Lax",
    secure: true,
    http_only: true
  ]

  plug Plug.Session, @session_options
end
```

For server-side session storage with ETS backing:

```elixir
defmodule PrismaticWeb.SessionStore do
  @moduledoc """
  ETS-backed session store providing sub-microsecond lookups
  and automatic expiration via periodic sweeps.
  """

  @behaviour Plug.Session.Store

  @table :prismatic_sessions
  @ttl_seconds 86_400

  @impl true
  def init(opts) do
    :ets.new(@table, [:named_table, :public, read_concurrency: true])
    opts
  end

  @impl true
  def get(_conn, sid, _opts) do
    case :ets.lookup(@table, sid) do
      [{^sid, data, expiry}] when expiry > System.system_time(:second) ->
        {sid, data}

      [{^sid, _data, _expired}] ->
        :ets.delete(@table, sid)
        {nil, %{}}

      [] ->
        {nil, %{}}
    end
  end

  @impl true
  def put(_conn, nil, data, _opts) do
    sid = Base.encode64(:crypto.strong_rand_bytes(96))
    expiry = System.system_time(:second) + @ttl_seconds
    :ets.insert(@table, {sid, data, expiry})
    sid
  end

  @impl true
  def put(_conn, sid, data, _opts) do
    expiry = System.system_time(:second) + @ttl_seconds
    :ets.insert(@table, {sid, data, expiry})
    sid
  end

  @impl true
  def delete(_conn, sid, _opts) do
    :ets.delete(@table, sid)
    :ok
  end
end
```

### LiveView Session Integration

Phoenix LiveView maintains session continuity through a signed token embedded in the initial page render, which is then used during the WebSocket upgrade:

```elixir
defmodule PrismaticWeb.LiveAuth do
  @moduledoc """
  LiveView mount hook that validates session tokens
  and injects current user into socket assigns.
  """

  import Phoenix.LiveView
  import Phoenix.Component

  def on_mount(:default, _params, session, socket) do
    case session do
      %{"user_id" => user_id} ->
        user = PrismaticAuth.get_user!(user_id)
        {:cont, assign(socket, :current_user, user)}

      _ ->
        {:halt, redirect(socket, to: "/login")}
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform implements a layered session architecture that separates concerns between transport, storage, and identity resolution.

The transport layer handles cookie encryption and token validation. Phoenix uses `Plug.Crypto` for AES-GCM encryption of cookie-based sessions, ensuring that session data cannot be tampered with or read by the client. For API sessions, bearer tokens are validated against a token registry that supports both long-lived API keys and short-lived JWT tokens.

The storage layer provides pluggable backends through the `Plug.Session.Store` behaviour. In development, ETS provides zero-dependency session storage. In production, the platform can switch to Redis-backed sessions for cross-node access. This pluggability follows the same adapter pattern used throughout the platform's storage layer.

Session expiration follows a dual strategy: absolute expiration (maximum session lifetime) and idle expiration (maximum time between requests). A background GenServer sweeps expired sessions from ETS at configurable intervals, preventing unbounded memory growth:

```elixir
defmodule PrismaticWeb.SessionSweeper do
  use GenServer

  @sweep_interval :timer.minutes(5)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_sweep()
    {:ok, %{}}
  end

  @impl true
  def handle_info(:sweep, state) do
    now = System.system_time(:second)
    expired = :ets.select(:prismatic_sessions, [{{:"$1", :_, :"$2"}, [{:<, :"$2", now}], [:"$1"]}])
    Enum.each(expired, &:ets.delete(:prismatic_sessions, &1))
    schedule_sweep()
    {:noreply, state}
  end

  defp schedule_sweep, do: Process.send_after(self(), :sweep, @sweep_interval)
end
```

## Usage in Prismatic Platform

Sessions in the Prismatic Platform govern access to all major subsystems. When a user authenticates, the session is populated with their identity, roles, and feature flags. This session data flows through Plug pipelines into LiveView mounts, API controllers, and agent orchestration contexts.

The OSINT toolbox (`/osint/toolbox`) uses session data to determine which tools a user can execute. Tools marked with `requires_auth: true` in their registration config check the session for valid credentials before execution. The session also tracks tool execution history for audit purposes.

For API access, sessions are represented as bearer tokens validated by the `APIAuth` plug:

```elixir
defmodule PrismaticWeb.Plugs.APIAuth do
  @moduledoc """
  Validates API bearer tokens and populates conn assigns
  with authenticated principal information.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- PrismaticAuth.verify_token(token) do
      conn
      |> assign(:current_user, claims.user)
      |> assign(:api_scopes, claims.scopes)
    else
      _ -> conn |> send_resp(401, "Unauthorized") |> halt()
    end
  end
end
```

## Cross-References

- [Authentication](@/glossary/authentication.md) - The process of verifying user identity that creates sessions
- [ETS](@/glossary/ets.md) - In-memory store used for high-performance session storage
- [Plug](@/glossary/plug.md) - Composable middleware specification that manages session lifecycle
- [Phoenix](@/glossary/phoenix.md) - Web framework providing session infrastructure
- [JWT](@/glossary/jwt.md) - Token format used for API session representation

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
