+++
title = "Authentication and Authorization Design: Session Auth and Casbin RBAC in Phoenix"
date = 2026-03-07
description = "Designing authentication and authorization for a Phoenix application: session-based auth, Casbin RBAC integration, API key management, role hierarchy with admin/operator/viewer, and permission model."

[extra]
author = "Tomas Korcak (korczis)"
category = "security"
tags = ["authentication", "authorization", "casbin", "rbac", "phoenix"]
reading_time = "9 min"
keywords = ["phoenix authentication", "casbin rbac", "api key management", "role hierarchy", "session auth"]
image = "/images/blog/authentication-authorization-design.png"
word_count = 1100
date_created = "2026-03-07"
date_modified = "2026-03-07"
quality_score = 85
see_also = ["authentication", "authorization", "jwt", "oauth2", "rbac"]
image_alt = "Authentication and Authorization Design - Prismatic Platform"
+++

## Separating Authentication from Authorization

Authentication answers "who are you?" Authorization answers "what can you do?" These are fundamentally different concerns that must be implemented independently. A system where authentication logic is intertwined with permission checks becomes impossible to audit, difficult to extend, and fragile to changes in either domain.

Our platform uses session-based authentication for web users, API key authentication for programmatic access, and Casbin for the entire authorization layer. This separation means we can change how users log in without touching any permission logic, and we can modify the role hierarchy without changing a single line of authentication code.

## Session-Based Authentication

Phoenix provides excellent session infrastructure through Plug. Our auth module implements registration, login, and session management with secure defaults:

```elixir
defmodule Prismatic.Accounts.Auth do
  @moduledoc """
  Session-based authentication for web users.
  Handles registration, login, session management, and password hashing.
  """

  alias Prismatic.Accounts.User
  alias Prismatic.Repo

  import Ecto.Query

  @session_validity_days 30
  @max_sessions_per_user 5

  @spec register(map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def register(attrs) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @spec authenticate(String.t(), String.t()) :: {:ok, User.t()} | {:error, :invalid_credentials}
  def authenticate(email, password) do
    user =
      from(u in User,
        where: u.email == ^String.downcase(String.trim(email)),
        where: u.active == true,
        limit: 1
      )
      |> Repo.one()

    case user do
      nil ->
        Bcrypt.no_user_verify()
        {:error, :invalid_credentials}

      user ->
        if Bcrypt.verify_pass(password, user.password_hash) do
          {:ok, user}
        else
          {:error, :invalid_credentials}
        end
    end
  end

  @spec create_session(User.t(), map()) :: {:ok, map()}
  def create_session(user, metadata \\ %{}) do
    token = :crypto.strong_rand_bytes(32) |> Base.url_encode64(padding: false)

    session = %{
      user_id: user.id,
      token_hash: hash_token(token),
      expires_at: DateTime.add(DateTime.utc_now(), @session_validity_days * 86_400, :second),
      ip_address: metadata[:ip_address],
      user_agent: metadata[:user_agent],
      created_at: DateTime.utc_now()
    }

    enforce_session_limit(user.id)
    Repo.insert_all("user_sessions", [session])

    {:ok, %{token: token, expires_at: session.expires_at}}
  end

  defp hash_token(token) do
    :crypto.hash(:sha256, token) |> Base.encode64()
  end

  defp enforce_session_limit(user_id) do
    from(s in "user_sessions",
      where: s.user_id == ^user_id,
      order_by: [asc: s.created_at],
      offset: @max_sessions_per_user - 1
    )
    |> Repo.delete_all()
  end
end
```

## Auth Plug Pipeline

The authentication plug extracts the session token, validates it, and assigns the current user to the connection:

```elixir
defmodule PrismaticWeb.Plugs.RequireAuth do
  @moduledoc """
  Plug that requires authentication for protected routes.
  Validates session token and assigns current_user to conn.
  """

  import Plug.Conn
  import Phoenix.Controller

  alias Prismatic.Accounts.Auth

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    case get_session(conn, :session_token) do
      nil ->
        conn
        |> put_flash(:error, "You must be logged in to access this page.")
        |> redirect(to: "/login")
        |> halt()

      token ->
        case Auth.validate_session(token) do
          {:ok, user} ->
            assign(conn, :current_user, user)

          {:error, :expired} ->
            conn
            |> delete_session(:session_token)
            |> put_flash(:error, "Session expired. Please log in again.")
            |> redirect(to: "/login")
            |> halt()

          {:error, :invalid} ->
            conn
            |> delete_session(:session_token)
            |> redirect(to: "/login")
            |> halt()
        end
    end
  end
end
```

## Casbin RBAC Integration

Casbin is a policy engine that supports multiple access control models. We use it for RBAC (Role-Based Access Control) with a hierarchical role model:

| Role | Inherits From | Permissions | Use Case |
|------|--------------|-------------|----------|
| `viewer` | — | Read all resources, export reports | Analysts, stakeholders |
| `operator` | `viewer` | Create/edit investigations, run OSINT | Investigators, DD analysts |
| `admin` | `operator` | User management, system config, API keys | Platform administrators |
| `super_admin` | `admin` | Doctrine enforcement, deployment, audit | System owners |

The Casbin model definition:

```ini
# model.conf — RBAC with resource-level permissions
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
```

The Elixir integration wraps Casbin with a clean API:

```elixir
defmodule Prismatic.Authorization do
  @moduledoc """
  Casbin-based authorization engine.
  Provides role-based access control with hierarchical roles.
  """

  require Logger

  @enforcer_name :prismatic_casbin

  @spec can?(String.t() | integer(), String.t(), String.t()) :: boolean()
  def can?(user_id, resource, action) do
    subject = to_string(user_id)

    case Casbin.enforce(@enforcer_name, [subject, resource, action]) do
      {:ok, true} -> true
      {:ok, false} -> false
      {:error, reason} ->
        Logger.error("Casbin enforcement error: #{inspect(reason)}")
        false
    end
  end

  @spec assign_role(String.t() | integer(), String.t()) :: :ok | {:error, term()}
  def assign_role(user_id, role) do
    subject = to_string(user_id)
    Casbin.add_grouping_policy(@enforcer_name, [subject, role])
  end

  @spec remove_role(String.t() | integer(), String.t()) :: :ok | {:error, term()}
  def remove_role(user_id, role) do
    subject = to_string(user_id)
    Casbin.remove_grouping_policy(@enforcer_name, [subject, role])
  end

  @spec user_roles(String.t() | integer()) :: list(String.t())
  def user_roles(user_id) do
    subject = to_string(user_id)
    Casbin.get_roles_for_user(@enforcer_name, subject)
  end
end
```

## API Key Management

Programmatic access uses API keys instead of sessions. Keys are scoped to specific permissions and have independent expiry:

```elixir
defmodule Prismatic.Accounts.APIKey do
  @moduledoc """
  API key management for programmatic access.
  Keys are scoped, rate-limited, and independently revocable.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "api_keys" do
    field :name, :string
    field :key_hash, :string
    field :key_prefix, :string
    field :scopes, {:array, :string}, default: ["read"]
    field :rate_limit, :integer, default: 1000
    field :expires_at, :utc_datetime
    field :last_used_at, :utc_datetime
    field :revoked_at, :utc_datetime

    belongs_to :user, Prismatic.Accounts.User, type: :binary_id

    timestamps()
  end

  @spec generate(map()) :: {:ok, %{key: String.t(), record: t()}} | {:error, Ecto.Changeset.t()}
  def generate(attrs) do
    raw_key = "prism_" <> (:crypto.strong_rand_bytes(24) |> Base.url_encode64(padding: false))
    prefix = String.slice(raw_key, 0, 10)
    key_hash = :crypto.hash(:sha256, raw_key) |> Base.encode64()

    changeset =
      %__MODULE__{}
      |> cast(attrs, [:name, :scopes, :rate_limit, :expires_at, :user_id])
      |> validate_required([:name, :user_id])
      |> put_change(:key_hash, key_hash)
      |> put_change(:key_prefix, prefix)

    case Prismatic.Repo.insert(changeset) do
      {:ok, record} -> {:ok, %{key: raw_key, record: record}}
      {:error, changeset} -> {:error, changeset}
    end
  end
end
```

## Authorization Plug for LiveView

LiveView requires authorization checks both at mount time and for each event:

```elixir
defmodule PrismaticWeb.LiveAuth do
  @moduledoc """
  Authorization helpers for LiveView.
  Checks permissions on mount and provides authorize/3 for events.
  """

  import Phoenix.LiveView

  alias Prismatic.Authorization

  @spec on_mount(atom(), map(), map(), Phoenix.LiveView.Socket.t()) ::
    {:cont, Phoenix.LiveView.Socket.t()} | {:halt, Phoenix.LiveView.Socket.t()}
  def on_mount(:require_auth, _params, session, socket) do
    case session["user_id"] do
      nil ->
        {:halt, redirect(socket, to: "/login")}

      user_id ->
        {:cont, assign(socket, :current_user_id, user_id)}
    end
  end

  @spec authorize(Phoenix.LiveView.Socket.t(), String.t(), String.t()) ::
    :ok | {:error, :forbidden}
  def authorize(socket, resource, action) do
    user_id = socket.assigns[:current_user_id]

    if Authorization.can?(user_id, resource, action) do
      :ok
    else
      {:error, :forbidden}
    end
  end
end
```

| Auth Method | Transport | Token Type | Lifetime | Use Case |
|------------|-----------|-----------|----------|----------|
| Session | Cookie | Signed session | 30 days | Web UI access |
| API Key | Header (Authorization) | Bearer token | Configurable | REST API clients |
| LiveView | WebSocket | Session-derived | Session lifetime | Real-time dashboards |

The clean separation between authentication and authorization means adding new auth methods (OAuth, SAML, mTLS) requires only new authentication modules. The Casbin authorization layer remains completely untouched, and all existing permission policies apply automatically to users authenticated through any method.
