+++
title = "Permission"
weight = 50
[extra]
description = "Granular access right within a role-based access control system governing resource operations"
category = "security"
related_terms = ["access-control", "scope", "secrets", "pii", "rbac", "authorization", "authentication"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["permission", "RBAC", "access control", "authorization", "security", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "rbac", "access-control"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Permission - Prismatic Platform"
+++

## Definition & Overview

A permission is a discrete authorization unit that grants or denies the ability to perform a specific operation on a specific resource within a system. Permissions form the atomic building blocks of Role-Based Access Control (RBAC), where they are grouped into roles, and roles are assigned to users or system actors. The combination of subject (who), action (what operation), and object (which resource) defines the permission tuple that governs every access decision.

Permission models range from simple binary allow/deny flags to complex attribute-based systems (ABAC) that evaluate contextual conditions. In RBAC, permissions are typically expressed as verb-noun pairs: `read:assets`, `write:reports`, `execute:osint_tools`, `admin:users`. This granularity enables the principle of least privilege, where each actor receives only the minimum permissions required for their function, reducing the blast radius of compromised credentials.

The Prismatic Platform implements a hierarchical permission system that spans its 115 umbrella applications. Permissions are defined at the application level, aggregated into roles at the domain level, and enforced through Plug-based middleware in both the web interface and REST API. The system supports permission inheritance (a domain admin inherits all application-level permissions within that domain), conditional permissions (time-bounded, IP-restricted), and audit logging of all access decisions.

## Technical Deep Dive

Permission enforcement in Elixir/Phoenix applications follows a pipeline pattern. Each HTTP request or LiveView event passes through authorization plugs that resolve the current user's effective permissions and compare them against the required permissions for the requested operation. The enforcement point is as close to the resource as possible, following the defense-in-depth principle.

```elixir
defmodule PrismaticWeb.Plugs.Authorization do
  @moduledoc """
  Plug-based permission enforcement for HTTP and API requests.
  Resolves effective permissions from role hierarchy and evaluates
  against resource requirements.
  """

  import Plug.Conn

  @type permission :: {atom(), atom()}

  @spec require_permission(Plug.Conn.t(), permission()) :: Plug.Conn.t()
  def require_permission(conn, {action, resource} = permission) do
    user = conn.assigns[:current_user]

    case evaluate_permission(user, permission) do
      :granted ->
        conn
        |> assign(:authorized, true)
        |> log_access_decision(user, permission, :granted)

      :denied ->
        conn
        |> log_access_decision(user, permission, :denied)
        |> put_status(:forbidden)
        |> Phoenix.Controller.put_view(PrismaticWeb.ErrorJSON)
        |> Phoenix.Controller.render(:"403")
        |> halt()
    end
  end

  defp evaluate_permission(nil, _permission), do: :denied

  defp evaluate_permission(user, {action, resource}) do
    effective_permissions = resolve_effective_permissions(user)

    cond do
      MapSet.member?(effective_permissions, {:admin, :all}) -> :granted
      MapSet.member?(effective_permissions, {action, resource}) -> :granted
      MapSet.member?(effective_permissions, {action, :all}) -> :granted
      true -> :denied
    end
  end

  defp resolve_effective_permissions(user) do
    user.roles
    |> Enum.flat_map(& &1.permissions)
    |> Enum.map(fn p -> {p.action, p.resource} end)
    |> MapSet.new()
  end

  defp log_access_decision(conn, user, {action, resource}, decision) do
    :telemetry.execute(
      [:prismatic, :authorization, :decision],
      %{timestamp: System.system_time(:millisecond)},
      %{
        user_id: user && user.id,
        action: action,
        resource: resource,
        decision: decision,
        ip: conn.remote_ip |> :inet.ntoa() |> to_string(),
        path: conn.request_path
      }
    )

    conn
  end
end
```

Permission definitions are structured as schemas that support hierarchical grouping, conditional evaluation, and temporal constraints. The schema design enables both compile-time permission validation (ensuring referenced permissions exist) and runtime dynamic permission evaluation.

```elixir
defmodule PrismaticAuth.Permission do
  @moduledoc """
  Permission schema supporting hierarchical RBAC with
  conditional evaluation and temporal constraints.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "permissions" do
    field :action, Ecto.Enum, values: [:read, :write, :execute, :admin, :delete]
    field :resource, :string
    field :description, :string
    field :domain, :string
    field :conditions, :map, default: %{}
    field :expires_at, :utc_datetime, default: nil

    many_to_many :roles, PrismaticAuth.Role, join_through: "role_permissions"

    timestamps(type: :utc_datetime_usec)
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(permission, attrs) do
    permission
    |> cast(attrs, [:action, :resource, :description, :domain, :conditions, :expires_at])
    |> validate_required([:action, :resource])
    |> validate_format(:resource, ~r/^[a-z_]+$/)
    |> unique_constraint([:action, :resource])
  end

  @spec active?(t()) :: boolean()
  def active?(%__MODULE__{expires_at: nil}), do: true
  def active?(%__MODULE__{expires_at: expires_at}) do
    DateTime.compare(DateTime.utc_now(), expires_at) == :lt
  end
end
```

## Architecture & Implementation

The permission system in Prismatic follows a layered architecture. At the bottom layer, permissions are defined per umbrella application. The middle layer aggregates these into domain-level roles. The top layer provides a unified authorization API consumed by both the Phoenix web interface and the REST API gateway.

Permission resolution uses ETS caching for sub-millisecond access decisions. Role-permission mappings are loaded into an ETS table at application startup and refreshed on role changes via PubSub notifications. This avoids database queries on every request while maintaining consistency through event-driven cache invalidation.

```elixir
defmodule PrismaticAuth.PermissionCache do
  @moduledoc """
  ETS-backed permission cache with PubSub-driven invalidation.
  Provides sub-millisecond permission lookups for request authorization.
  """

  use GenServer

  @table :permission_cache
  @pubsub_topic "auth:permissions"

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, @pubsub_topic)
    load_all_permissions()
    {:ok, %{}}
  end

  @spec lookup(binary()) :: {:ok, MapSet.t()} | {:error, :not_found}
  def lookup(user_id) do
    case :ets.lookup(@table, {:user, user_id}) do
      [{_, permissions}] -> {:ok, permissions}
      [] -> {:error, :not_found}
    end
  end

  @impl true
  def handle_info({:permission_changed, user_id}, state) do
    reload_user_permissions(user_id)
    {:noreply, state}
  end

  defp load_all_permissions do
    PrismaticAuth.Repo.all_user_permissions()
    |> Enum.each(fn {user_id, permissions} ->
      :ets.insert(@table, {{:user, user_id}, MapSet.new(permissions)})
    end)
  end

  defp reload_user_permissions(user_id) do
    permissions = PrismaticAuth.Repo.user_permissions(user_id)
    :ets.insert(@table, {{:user, user_id}, MapSet.new(permissions)})
  end
end
```

## Usage in Prismatic Platform

Permissions in the Prismatic Platform govern access to OSINT tools, DD pipeline operations, Perimeter assessments, and administrative functions. LiveView pages enforce permissions at mount time and on each event handler, ensuring that UI-level authorization cannot be bypassed.

```elixir
defmodule PrismaticWeb.OsintToolboxLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, session, socket) do
    user = get_user_from_session(session)

    socket =
      socket
      |> assign(:current_user, user)
      |> assign(:can_execute, has_permission?(user, {:execute, :osint_tools}))
      |> assign(:can_admin, has_permission?(user, {:admin, :osint_tools}))

    {:ok, socket}
  end

  @impl true
  def handle_event("run_tool", %{"tool_slug" => slug}, socket) do
    if socket.assigns.can_execute do
      {:noreply, execute_tool(socket, slug)}
    else
      {:noreply, put_flash(socket, :error, "Insufficient permissions")}
    end
  end

  defp has_permission?(user, permission) do
    case PrismaticAuth.PermissionCache.lookup(user.id) do
      {:ok, permissions} -> MapSet.member?(permissions, permission)
      {:error, :not_found} -> false
    end
  end
end
```

## Cross-References

- **Scope** - Boundary definition that permissions enforce
- **Secrets** - Sensitive values protected by permission-gated access
- [PII](@/glossary/pii.md) - Personal data requiring strict permission controls
- **Self-Registration** - OSINT tools auto-register their permission requirements
- **Server** - Services that enforce permissions at the API boundary

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
