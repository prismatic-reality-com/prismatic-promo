+++
title = "User"
weight = 50
[extra]
description = "Platform identity entity representing an authenticated individual with roles, permissions, and activity history"
category = "security"
related_terms = ["authentication", "authorization", "token", "rbac"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["user", "identity", "authentication", "authorization", "RBAC", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "User - Prismatic Platform"
+++

## Definition & Overview

A user is the fundamental identity entity within the Prismatic Platform, representing an authenticated individual who interacts with the system. Each user has a unique identifier, a set of assigned roles that determine their access level, a collection of permissions that fine-tune their capabilities, and an activity history that tracks their interactions with platform features. Users are the subjects of all authorization decisions, the owners of all tracked progress, and the actors behind all audited operations.

The user model in the Prismatic Platform extends beyond simple authentication to encompass the full lifecycle of platform interaction. From their first login, users accumulate a rich profile: Academy learning progress across topics and tracks, OSINT tool execution history, DD entity exploration patterns, and session context that persists across Claude Code interactions. This comprehensive user model enables personalized experiences like track recommendations based on knowledge gaps and frequently-used tool shortcuts.

User management follows the principle of least privilege, where users are granted the minimum permissions necessary for their role. The platform's RBAC (Role-Based Access Control) system supports hierarchical roles (viewer, analyst, administrator, operator) with fine-grained permissions that can be scoped to specific resources. This ensures that an analyst can execute OSINT tools but cannot modify system configuration, while an administrator has full platform control.

## Technical Deep Dive

The user entity in the platform is represented as an Ecto schema with role-based access control:

```elixir
defmodule PrismaticAuth.User do
  @moduledoc """
  User entity with role-based access control, supporting
  authentication, authorization, and activity tracking.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{
    id: Ecto.UUID.t(),
    email: String.t(),
    name: String.t(),
    roles: [String.t()],
    permissions: [String.t()],
    active: boolean(),
    last_login_at: DateTime.t() | nil,
    metadata: map()
  }

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "users" do
    field :email, :string
    field :name, :string
    field :password_hash, :string, redact: true
    field :roles, {:array, :string}, default: ["viewer"]
    field :permissions, {:array, :string}, default: []
    field :active, :boolean, default: true
    field :last_login_at, :utc_datetime_usec
    field :metadata, :map, default: %{}

    timestamps(type: :utc_datetime_usec)
  end

  @required_fields [:email, :name]
  @optional_fields [:roles, :permissions, :active, :metadata]

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(user, attrs) do
    user
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+\.[^\s]+$/)
    |> unique_constraint(:email)
    |> validate_roles()
  end

  defp validate_roles(changeset) do
    valid_roles = MapSet.new(["viewer", "analyst", "operator", "administrator"])

    validate_change(changeset, :roles, fn :roles, roles ->
      invalid = Enum.reject(roles, &MapSet.member?(valid_roles, &1))

      case invalid do
        [] -> []
        _ -> [roles: "invalid roles: #{Enum.join(invalid, ", ")}"]
      end
    end)
  end
end
```

Authorization checks use the user's roles and permissions:

```elixir
defmodule PrismaticAuth.Authorization do
  @moduledoc """
  Role-based authorization with hierarchical permissions
  and resource-scoped access control.
  """

  @role_hierarchy %{
    "viewer" => 0,
    "analyst" => 1,
    "operator" => 2,
    "administrator" => 3
  }

  @role_permissions %{
    "viewer" => ["read:tools", "read:academy", "read:glossary"],
    "analyst" => ["read:tools", "execute:tools", "read:academy", "write:academy",
                   "read:dd", "read:perimeter", "read:glossary"],
    "operator" => ["read:tools", "execute:tools", "manage:tools",
                    "read:academy", "write:academy", "manage:academy",
                    "read:dd", "write:dd", "read:perimeter", "execute:perimeter",
                    "read:glossary"],
    "administrator" => ["*"]
  }

  @spec authorized?(PrismaticAuth.User.t(), String.t()) :: boolean()
  def authorized?(%{roles: roles, permissions: permissions}, required_permission) do
    has_wildcard = "*" in effective_permissions(roles, permissions)
    has_permission = required_permission in effective_permissions(roles, permissions)

    has_wildcard or has_permission
  end

  @spec has_role?(PrismaticAuth.User.t(), String.t()) :: boolean()
  def has_role?(%{roles: roles}, required_role) do
    required_level = Map.get(@role_hierarchy, required_role, 0)

    Enum.any?(roles, fn role ->
      Map.get(@role_hierarchy, role, 0) >= required_level
    end)
  end

  defp effective_permissions(roles, extra_permissions) do
    role_perms =
      roles
      |> Enum.flat_map(fn role -> Map.get(@role_permissions, role, []) end)

    MapSet.new(role_perms ++ extra_permissions)
    |> MapSet.to_list()
  end
end
```

## Architecture & Implementation

The user system integrates with multiple platform subsystems:

**Authentication Layer**: Users authenticate via email/password or API tokens. The authentication layer produces JWT tokens containing the user's ID, roles, and permissions. These tokens are verified by the `APIAuth` plug on every request to the PrismaticAPI gateway and by the LiveView session system for web interactions.

**Session Management**: Phoenix LiveView sessions are bound to authenticated users. The session carries user context (ID, roles, preferences) that persists across page navigations without re-authentication. Session state is stored server-side with only an opaque session ID transmitted to the client.

**Activity Tracking**: Every significant user action is recorded: OSINT tool executions, Academy topic completions, DD entity explorations, and Perimeter scan requests. This activity data feeds the recommendation engine and provides audit trails for compliance reporting.

**Profile Enrichment**: The user profile accumulates derived data over time: most-used OSINT tools, Academy completion percentage, preferred tool categories, and active learning tracks. This enrichment happens asynchronously through telemetry event handlers to avoid impacting request latency.

```elixir
defmodule PrismaticAuth.UserContext do
  @moduledoc """
  Builds rich user context from authentication data,
  combining identity with preferences and activity.
  """

  @spec build(String.t()) :: {:ok, map()} | {:error, :not_found}
  def build(user_id) do
    with {:ok, user} <- PrismaticAuth.Users.get(user_id),
         progress <- PrismaticAcademy.ProgressTracker.get_progress(user_id),
         activity <- PrismaticTracking.EventCollector.get_summary(user_id) do
      context = %{
        user: user,
        academy_progress: progress,
        recent_tools: activity.recent_tools,
        preferred_categories: activity.preferred_categories,
        session_count: activity.session_count
      }

      {:ok, context}
    end
  end
end
```

## Usage in Prismatic Platform

Users interact with the platform through LiveView dashboards that adapt based on their role and preferences:

```elixir
defmodule PrismaticWeb.UserLive.Profile do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, session, socket) do
    user_id = session["user_id"]

    case PrismaticAuth.UserContext.build(user_id) do
      {:ok, context} ->
        {:ok, assign(socket,
          user: context.user,
          progress: context.academy_progress,
          recent_tools: context.recent_tools,
          preferred_categories: context.preferred_categories
        )}

      {:error, :not_found} ->
        {:ok, redirect(socket, to: "/login")}
    end
  end
end
```

The authorization system protects routes and actions throughout the platform, ensuring that users can only access features appropriate to their role. The OSINT toolbox checks `execute:tools` permission before allowing tool execution. The DD pipeline checks `write:dd` permission before allowing entity modifications.

## Cross-References

- [Token](/glossary/token/) - Authentication credential
- [Authentication](/glossary/authentication/) - Identity verification
- [Authorization](/glossary/authorization/) - Access control
- [RBAC](/glossary/rbac/) - Role-Based Access Control
- [Tracking](/glossary/tracking/) - User activity monitoring

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
