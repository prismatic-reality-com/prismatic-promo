+++
title = "Scope"
weight = 50
[extra]
description = "Defined boundary of a penetration test, security assessment, or OSINT investigation establishing authorized targets"
category = "security"
related_terms = ["permission", "sanctions", "pep", "pii", "secrets"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["scope", "penetration testing", "boundary", "authorization", "OSINT", "assessment", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "testing", "osint"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Scope - Prismatic Platform"
+++

## Definition & Overview

Scope defines the authorized boundaries of a security assessment, penetration test, or OSINT investigation. It specifies which systems, networks, domains, IP ranges, and data types may be examined, and equally importantly, which are explicitly excluded. A well-defined scope prevents unauthorized access, legal liability, and unintended disruption to systems that were not intended to be tested.

Scope documentation typically includes: in-scope targets (domains, IP ranges, applications), out-of-scope targets (production systems, third-party services), permitted techniques (passive reconnaissance, active scanning, exploitation), time windows (when testing may occur), and escalation procedures (whom to contact if issues arise). The scope document is a legally binding agreement between the testing party and the system owner.

The Prismatic Platform formalizes scope as a first-class data structure in its Perimeter and Color Team subsystems. Every security assessment, EASM scan, or OSINT investigation operates within a defined scope that is enforced programmatically. The Red Team's adversarial simulations are strictly scoped to synthetic targets within the PrismaticDark.Sandbox, and the OSINT toolbox enforces rate limits and authorization checks based on the scope configuration of each tool execution.

## Technical Deep Dive

Scope enforcement in the Prismatic Platform operates at the tool execution level. Before any OSINT tool or security scanner runs, the scope validator checks that the target falls within the authorized scope and that the requested technique is permitted.

```elixir
defmodule PrismaticPerimeter.Scope do
  @moduledoc """
  Scope definition and enforcement for security assessments
  and OSINT investigations. Programmatically prevents
  out-of-scope operations.
  """

  @type t :: %__MODULE__{
    id: binary(),
    name: String.t(),
    targets: [target()],
    exclusions: [target()],
    techniques: [atom()],
    time_window: time_window(),
    authorization: authorization(),
    created_at: DateTime.t()
  }

  @type target :: %{
    type: :domain | :ip_range | :url | :email_domain | :organization,
    value: String.t(),
    wildcard: boolean()
  }

  @type time_window :: %{
    start: DateTime.t(),
    end: DateTime.t(),
    timezone: String.t()
  }

  @type authorization :: %{
    authorizer: String.t(),
    document_ref: String.t(),
    signed_at: DateTime.t()
  }

  defstruct [:id, :name, :targets, :exclusions, :techniques, :time_window, :authorization, :created_at]

  @spec in_scope?(t(), String.t(), atom()) :: boolean()
  def in_scope?(%__MODULE__{} = scope, target, technique) do
    target_allowed?(scope, target) and
      technique_allowed?(scope, technique) and
      within_time_window?(scope) and
      not excluded?(scope, target)
  end

  @spec validate_target(t(), String.t()) :: :ok | {:error, String.t()}
  def validate_target(scope, target) do
    cond do
      not within_time_window?(scope) ->
        {:error, "Assessment time window has expired"}

      excluded?(scope, target) ->
        {:error, "Target #{target} is explicitly excluded from scope"}

      not target_allowed?(scope, target) ->
        {:error, "Target #{target} is not in scope"}

      true ->
        :ok
    end
  end

  defp target_allowed?(%{targets: targets}, target_value) do
    Enum.any?(targets, fn t ->
      case t.type do
        :domain ->
          if t.wildcard do
            String.ends_with?(target_value, t.value)
          else
            target_value == t.value
          end

        :ip_range ->
          ip_in_range?(target_value, t.value)

        :url ->
          String.starts_with?(target_value, t.value)

        _ ->
          target_value == t.value
      end
    end)
  end

  defp excluded?(%{exclusions: exclusions}, target_value) do
    Enum.any?(exclusions, fn excl ->
      target_value == excl.value or
        (excl.wildcard and String.ends_with?(target_value, excl.value))
    end)
  end

  defp technique_allowed?(%{techniques: techniques}, technique) do
    technique in techniques
  end

  defp within_time_window?(%{time_window: %{start: start_time, end: end_time}}) do
    now = DateTime.utc_now()
    DateTime.compare(now, start_time) in [:gt, :eq] and
      DateTime.compare(now, end_time) in [:lt, :eq]
  end

  defp within_time_window?(%{time_window: nil}), do: true

  defp ip_in_range?(_ip, _range) do
    # CIDR range check implementation
    true
  end
end
```

The scope enforcement is integrated into the OSINT tool execution pipeline as a mandatory pre-execution check.

```elixir
defmodule PrismaticOsint.ScopeEnforcer do
  @moduledoc """
  Mandatory scope enforcement for all OSINT tool executions.
  Blocks out-of-scope operations before they reach the tool adapter.
  """

  @spec enforce(PrismaticPerimeter.Scope.t(), String.t(), map()) :: :ok | {:error, String.t()}
  def enforce(scope, tool_slug, params) do
    target = extract_target(params)
    technique = tool_to_technique(tool_slug)

    case PrismaticPerimeter.Scope.validate_target(scope, target) do
      :ok ->
        if PrismaticPerimeter.Scope.in_scope?(scope, target, technique) do
          log_scoped_access(scope, tool_slug, target)
          :ok
        else
          {:error, "Technique #{technique} not permitted in current scope"}
        end

      {:error, reason} ->
        log_scope_violation(scope, tool_slug, target, reason)
        {:error, reason}
    end
  end

  defp extract_target(%{query: query}), do: query
  defp extract_target(%{domain: domain}), do: domain
  defp extract_target(%{target: target}), do: target
  defp extract_target(_), do: ""

  defp tool_to_technique("shodan-" <> _), do: :active_scanning
  defp tool_to_technique("virustotal-" <> _), do: :passive_reconnaissance
  defp tool_to_technique(_), do: :passive_reconnaissance

  defp log_scoped_access(scope, tool, target) do
    :telemetry.execute([:prismatic, :scope, :access], %{}, %{scope_id: scope.id, tool: tool, target: target})
  end

  defp log_scope_violation(scope, tool, target, reason) do
    :telemetry.execute([:prismatic, :scope, :violation], %{reason: reason}, %{scope_id: scope.id, tool: tool, target: target})
  end
end
```

## Architecture & Implementation

Scope management is centralized in the Perimeter module with scopes stored in PostgreSQL. Each assessment session is associated with a scope, and all tool executions within that session are validated against the scope before execution. Scope violations are logged to an immutable audit trail and trigger immediate alerts.

The Color Team security operations maintain separate scopes. The Red Team scope is strictly limited to synthetic targets within the PrismaticDark.Sandbox. The Blue Team scope encompasses the entire platform for defensive monitoring. These scopes cannot be modified by the teams themselves -- only platform administrators can alter scope definitions.

## Usage in Prismatic Platform

Scopes are created through the Perimeter dashboard and assigned to assessment sessions. The OSINT toolbox automatically enforces the active scope for all tool executions.

```elixir
# Create an assessment scope
scope = %PrismaticPerimeter.Scope{
  id: Ecto.UUID.generate(),
  name: "Q1 2026 External Assessment",
  targets: [
    %{type: :domain, value: "example.com", wildcard: true},
    %{type: :ip_range, value: "192.168.1.0/24", wildcard: false}
  ],
  exclusions: [
    %{type: :domain, value: "mail.example.com", wildcard: false}
  ],
  techniques: [:passive_reconnaissance, :active_scanning],
  time_window: %{
    start: ~U[2026-01-01 00:00:00Z],
    end: ~U[2026-03-31 23:59:59Z],
    timezone: "UTC"
  }
}
```

## Cross-References

- [Permission](/glossary/permission/) - Access rights that scope enforcement relies on
- [Sanctions](/glossary/sanctions/) - Screening operations requiring defined scope
- [PEP](/glossary/pep/) - PEP investigations conducted within authorized scope
- **Secrets** - Credentials governing access to scoped resources
- **Self-Registration** - OSINT tools declaring scope requirements at registration

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
