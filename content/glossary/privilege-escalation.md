+++
title = "Privilege Escalation"
weight = 50
[extra]
tags = ["glossary", "security", "privilege-escalation", "authorization", "rbac", "blue-team", "attack-surface", "vulnerability", "color-teams"]
description = "Security vulnerability where an attacker gains higher access levels than authorized, monitored by Blue Team auth-sentinel and prevented through RBAC enforcement in Prismatic Platform"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "security-operations"
related_concepts = ["authorization", "rbac", "attack-surface", "vulnerability", "blue-team", "security-operations", "authentication"]
implementation_status = "production"
authority_level = "P0-security"
difficulty_rating = 8
prerequisites = ["authentication", "authorization", "rbac", "security"]
learning_path = "fundamentals -> threat-modeling -> detection -> prevention -> incident-response"
interactive_demos = ["/labs/glossary/privilege-escalation"]
code_examples = ["auth_sentinel", "rbac_enforcer", "privilege_monitor", "escalation_detector"]
external_resources = ["https://owasp.org/www-project-web-security-testing-guide/", "https://attack.mitre.org/tactics/TA0004/", "https://cwe.mitre.org/data/definitions/269.html"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["vertical_escalation_detection", "horizontal_escalation_detection", "role_boundary_enforcement", "session_hijack_prevention"]
keywords = ["privilege-escalation", "security", "authorization", "rbac", "vertical-escalation", "horizontal-escalation", "least-privilege", "access-control", "blue-team", "auth-sentinel"]
related_terms = ["authorization", "rbac", "security-operations", "blue-team", "vulnerability", "attack-surface", "authentication", "zero-trust", "penetration-testing", "audit-trail"]
word_count = 1809
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Privilege Escalation - Prismatic Platform"
+++

## Definition

Privilege escalation is a class of security vulnerability in which an attacker, unauthorized user, or compromised process gains access rights beyond what was initially granted or intended. It represents one of the most critical threat categories in information security because it transforms a limited-access breach into a full-system compromise. The MITRE ATT&CK framework classifies privilege escalation as Tactic TA0004, recognizing it as a fundamental adversarial objective in post-exploitation scenarios.

Privilege escalation manifests in two primary forms: **vertical escalation**, where a lower-privileged user gains higher-privileged access (e.g., user to administrator); and **horizontal escalation**, where a user accesses resources belonging to another user at the same privilege level (e.g., accessing another customer's data). Both forms can result from software vulnerabilities, configuration errors, or design flaws in [authorization](/glossary/authorization/) systems.

In the Prismatic Platform, privilege escalation prevention is enforced through multi-layered defenses: the [Blue Team](/glossary/blue-team/) auth-sentinel agent monitors for escalation attempts in real-time, [RBAC](/glossary/rbac/) enforcement prevents unauthorized role assumption, and the [Color Teams](/glossary/color-teams/) architecture provides adversarial testing through [Red Team](/glossary/red-team/) simulations of escalation scenarios.

## Overview

Privilege escalation sits at the intersection of [authentication](/glossary/authentication/) (verifying identity) and [authorization](/glossary/authorization/) (granting permissions). While authentication ensures a user is who they claim to be, and authorization determines what they can access, privilege escalation exploits gaps between these two systems or flaws within the authorization layer itself.

The severity of privilege escalation vulnerabilities is reflected in their prevalence among major security frameworks. OWASP includes "Broken Access Control" as the number one vulnerability in its Top 10 list. CWE-269 (Improper Privilege Management) and CWE-284 (Improper Access Control) are among the most commonly reported weaknesses in production software. The Common Vulnerability Scoring System (CVSS) rates privilege escalation vectors with high base scores, reflecting their potential for catastrophic impact.

### Vertical Privilege Escalation

Vertical escalation occurs when a user with limited permissions obtains the privileges of a higher-authority role. Common vectors include:

- **Insecure Direct Object References (IDOR)**: Accessing administrative endpoints by guessing or manipulating URL parameters, API endpoints, or request payloads.
- **Role Manipulation**: Modifying session tokens, JWT claims, or cookie values to change the assigned role.
- **Function-Level Access Control Bypass**: Calling administrative functions that lack proper authorization checks.
- **SQL Injection into Authorization Tables**: Modifying database records that control role assignments.
- **Exploiting Default Credentials**: Using default administrative passwords that were never changed.

### Horizontal Privilege Escalation

Horizontal escalation occurs when a user accesses resources belonging to another user at the same privilege level. This is often more subtle than vertical escalation because the attacker already has valid credentials for the system:

- **Parameter Tampering**: Changing user IDs in API requests to access another user's data.
- **Session Confusion**: Exploiting race conditions or session management flaws to assume another user's session.
- **Predictable Resource Identifiers**: Guessing sequential or predictable IDs to access other users' resources.
- **Shared State Contamination**: Exploiting shared caches, temporary files, or in-memory state to cross user boundaries.

### Compound Escalation

Sophisticated attacks chain horizontal and vertical escalation: first accessing a privileged user's account through horizontal escalation, then using that account's elevated permissions for vertical escalation to administrative access.

## Technical Details

### MITRE ATT&CK Privilege Escalation Techniques

The MITRE ATT&CK framework catalogs privilege escalation techniques under Tactic TA0004:

| Technique ID | Name | Platform Relevance |
|-------------|------|-------------------|
| T1548 | Abuse Elevation Control Mechanism | OS-level, container escape |
| T1134 | Access Token Manipulation | JWT/session token attacks |
| T1098 | Account Manipulation | Role assignment modification |
| T1547 | Boot or Logon Autostart | Persistent privilege escalation |
| T1068 | Exploitation for Privilege Escalation | Vulnerability exploitation |
| T1078 | Valid Accounts | Credential reuse, default passwords |
| T1055 | Process Injection | Runtime code injection |

### Authorization Model Vulnerabilities

Privilege escalation vulnerabilities typically arise from flaws in one of three authorization model components:

**1. Policy Decision Point (PDP) Flaws**: The component that evaluates access requests against policies contains logic errors, allowing unauthorized access. Missing "deny by default" rules, incomplete role hierarchies, or race conditions in policy evaluation can create escalation paths.

**2. Policy Enforcement Point (PEP) Flaws**: The component that intercepts requests and enforces PDP decisions is bypassed. This includes missing authorization checks on API endpoints, client-side-only enforcement, or enforcement gaps in middleware chains.

**3. Policy Information Point (PIP) Flaws**: The data sources used for authorization decisions (user roles, group memberships, resource ownership) are manipulated. This includes direct database manipulation, cache poisoning, or LDAP injection.

### BEAM Process Isolation and Privilege Boundaries

The [BEAM](/glossary/beam/) virtual machine provides unique security properties relevant to privilege escalation prevention:

1. **Process Memory Isolation**: Each BEAM process has its own heap, preventing memory-based privilege escalation between processes. A compromised process cannot read or write another process's memory.

2. **Message-Based Communication**: Processes communicate exclusively through message passing, creating natural enforcement points for access control checks at process boundaries.

3. **No Shared Mutable State**: The absence of shared memory eliminates an entire class of privilege escalation vectors based on race conditions in shared state modification.

4. **Supervision Trees**: Compromised processes can be terminated and restarted by [supervisors](/glossary/supervisor/), limiting the duration of any privilege escalation.

## Implementation in Prismatic Platform

### Blue Team Auth-Sentinel

The [Blue Team](/glossary/blue-team/) auth-sentinel is a dedicated L2 Operational Specialist agent that continuously monitors for privilege escalation indicators:

```elixir
defmodule PrismaticSecurity.AuthSentinel do
  @moduledoc """
  Blue Team auth-sentinel agent that monitors authentication boundaries
  and detects privilege escalation attempts in real-time.
  """

  use GenServer

  @type escalation_type :: :vertical | :horizontal | :compound
  @type severity :: :low | :medium | :high | :critical
  @type detection :: %{
    type: escalation_type(),
    severity: severity(),
    user_id: String.t(),
    attempted_role: String.t(),
    current_role: String.t(),
    timestamp: DateTime.t(),
    evidence: map()
  }

  @detection_window_seconds 300
  @max_role_switches_per_window 3
  @max_failed_auth_per_window 10

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec check_authorization(String.t(), String.t(), String.t()) ::
          :authorized | {:escalation_detected, detection()}
  def check_authorization(user_id, requested_resource, current_role) do
    GenServer.call(__MODULE__, {:check_auth, user_id, requested_resource, current_role})
  end

  @spec report_failed_auth(String.t(), map()) :: :ok
  def report_failed_auth(user_id, context) do
    GenServer.cast(__MODULE__, {:failed_auth, user_id, context})
  end

  @impl true
  @spec init(keyword()) :: {:ok, map()}
  def init(_opts) do
    state = %{
      role_switches: %{},
      failed_auths: %{},
      active_detections: []
    }

    schedule_cleanup()
    {:ok, state}
  end

  @impl true
  def handle_call({:check_auth, user_id, resource, current_role}, _from, state) do
    case detect_escalation(user_id, resource, current_role, state) do
      nil ->
        {:reply, :authorized, state}

      detection ->
        new_state = record_detection(state, detection)
        emit_telemetry(detection)
        {:reply, {:escalation_detected, detection}, new_state}
    end
  end

  @impl true
  def handle_cast({:failed_auth, user_id, context}, state) do
    window_key = current_window_key()
    path = [:failed_auths, user_id, window_key]

    count = get_in(state, path) || 0
    new_state = put_in_nested(state, path, count + 1)

    if count + 1 >= @max_failed_auth_per_window do
      detection = %{
        type: :vertical,
        severity: :high,
        user_id: user_id,
        attempted_role: "unknown",
        current_role: Map.get(context, :current_role, "unknown"),
        timestamp: DateTime.utc_now(),
        evidence: %{
          failed_attempts: count + 1,
          window_seconds: @detection_window_seconds,
          last_context: context
        }
      }

      emit_telemetry(detection)
      {:noreply, record_detection(new_state, detection)}
    else
      {:noreply, new_state}
    end
  end

  @impl true
  def handle_info(:cleanup, state) do
    cutoff = DateTime.add(DateTime.utc_now(), -@detection_window_seconds, :second)

    cleaned_detections =
      Enum.filter(state.active_detections, fn d ->
        DateTime.compare(d.timestamp, cutoff) == :gt
      end)

    schedule_cleanup()
    {:noreply, %{state | active_detections: cleaned_detections}}
  end

  @spec detect_escalation(String.t(), String.t(), String.t(), map()) :: detection() | nil
  defp detect_escalation(user_id, resource, current_role, state) do
    cond do
      admin_resource?(resource) && !admin_role?(current_role) ->
        %{
          type: :vertical,
          severity: :critical,
          user_id: user_id,
          attempted_role: "admin",
          current_role: current_role,
          timestamp: DateTime.utc_now(),
          evidence: %{resource: resource, reason: "non-admin accessing admin resource"}
        }

      excessive_role_switches?(user_id, state) ->
        %{
          type: :compound,
          severity: :high,
          user_id: user_id,
          attempted_role: "multiple",
          current_role: current_role,
          timestamp: DateTime.utc_now(),
          evidence: %{reason: "excessive role switching detected"}
        }

      true ->
        nil
    end
  end

  @spec admin_resource?(String.t()) :: boolean()
  defp admin_resource?(resource), do: String.starts_with?(resource, "/admin")

  @spec admin_role?(String.t()) :: boolean()
  defp admin_role?(role), do: role in ["admin", "super_admin", "system"]

  @spec excessive_role_switches?(String.t(), map()) :: boolean()
  defp excessive_role_switches?(user_id, state) do
    window_key = current_window_key()
    count = get_in(state, [:role_switches, user_id, window_key]) || 0
    count >= @max_role_switches_per_window
  end

  @spec record_detection(map(), detection()) :: map()
  defp record_detection(state, detection) do
    %{state | active_detections: [detection | state.active_detections]}
  end

  @spec emit_telemetry(detection()) :: :ok
  defp emit_telemetry(detection) do
    :telemetry.execute(
      [:prismatic, :security, :privilege_escalation],
      %{count: 1},
      detection
    )
  end

  @spec current_window_key() :: integer()
  defp current_window_key do
    div(System.os_time(:second), @detection_window_seconds)
  end

  @spec schedule_cleanup() :: reference()
  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, @detection_window_seconds * 1_000)
  end

  @spec put_in_nested(map(), [atom() | String.t()], term()) :: map()
  defp put_in_nested(map, [key], value), do: Map.put(map, key, value)

  defp put_in_nested(map, [key | rest], value) do
    inner = Map.get(map, key, %{})
    Map.put(map, key, put_in_nested(inner, rest, value))
  end
end
```

### RBAC Enforcement Layer

The platform's [RBAC](/glossary/rbac/) system implements defense-in-depth against privilege escalation through multiple enforcement points:

```elixir
defmodule PrismaticSecurity.RBACEnforcer do
  @moduledoc """
  Role-Based Access Control enforcement with privilege escalation
  prevention. Implements deny-by-default and least-privilege principles.
  """

  @type role :: :viewer | :analyst | :operator | :admin | :super_admin
  @type permission :: atom()
  @type enforcement_result :: :allowed | {:denied, String.t()}

  @role_hierarchy %{
    viewer: 0,
    analyst: 1,
    operator: 2,
    admin: 3,
    super_admin: 4
  }

  @role_permissions %{
    viewer: [:read_public, :read_own],
    analyst: [:read_public, :read_own, :read_team, :run_analysis],
    operator: [:read_public, :read_own, :read_team, :run_analysis, :write_own, :execute_tools],
    admin: [:read_public, :read_own, :read_team, :read_all, :run_analysis, :write_own, :write_all, :execute_tools, :manage_users],
    super_admin: [:read_public, :read_own, :read_team, :read_all, :run_analysis, :write_own, :write_all, :execute_tools, :manage_users, :manage_system, :manage_policies]
  }

  @spec check_permission(role(), permission()) :: enforcement_result()
  def check_permission(role, permission) do
    permissions = Map.get(@role_permissions, role, [])

    case permission in permissions do
      true -> :allowed
      false -> {:denied, "Role #{role} lacks permission #{permission}"}
    end
  end

  @spec check_role_transition(role(), role()) :: enforcement_result()
  def check_role_transition(current_role, target_role) do
    current_level = Map.get(@role_hierarchy, current_role, 0)
    target_level = Map.get(@role_hierarchy, target_role, 0)

    cond do
      target_level > current_level ->
        {:denied, "Cannot escalate from #{current_role} to #{target_role}"}

      target_level == current_level && current_role != target_role ->
        {:denied, "Horizontal role transition from #{current_role} to #{target_role} requires explicit grant"}

      true ->
        :allowed
    end
  end

  @spec validate_token_claims(map()) :: {:ok, role()} | {:error, String.t()}
  def validate_token_claims(claims) do
    with {:ok, role} <- extract_role(claims),
         :ok <- validate_role_exists(role),
         :ok <- validate_not_expired(claims),
         :ok <- validate_issuer(claims) do
      {:ok, role}
    end
  end

  @spec extract_role(map()) :: {:ok, role()} | {:error, String.t()}
  defp extract_role(%{"role" => role}) when is_binary(role) do
    case String.to_existing_atom(role) do
      atom when atom in [:viewer, :analyst, :operator, :admin, :super_admin] ->
        {:ok, atom}

      _ ->
        {:error, "Invalid role: #{role}"}
    end
  rescue
    ArgumentError -> {:error, "Unknown role atom: #{role}"}
  end

  defp extract_role(_), do: {:error, "Missing role claim"}

  @spec validate_role_exists(role()) :: :ok | {:error, String.t()}
  defp validate_role_exists(role) do
    case Map.has_key?(@role_permissions, role) do
      true -> :ok
      false -> {:error, "Role #{role} not defined in RBAC policy"}
    end
  end

  @spec validate_not_expired(map()) :: :ok | {:error, String.t()}
  defp validate_not_expired(%{"exp" => exp}) do
    case exp > System.os_time(:second) do
      true -> :ok
      false -> {:error, "Token expired"}
    end
  end

  defp validate_not_expired(_), do: {:error, "Missing expiration claim"}

  @spec validate_issuer(map()) :: :ok | {:error, String.t()}
  defp validate_issuer(%{"iss" => "prismatic-platform"}), do: :ok
  defp validate_issuer(%{"iss" => issuer}), do: {:error, "Untrusted issuer: #{issuer}"}
  defp validate_issuer(_), do: {:error, "Missing issuer claim"}
end
```

### Red Team Escalation Simulation

The [Red Team](/glossary/red-team/) conducts simulated privilege escalation attacks using synthetic data within sandboxed environments to test the platform's defenses:

```elixir
defmodule PrismaticSecurity.RedTeam.EscalationScenario do
  @moduledoc """
  Red Team privilege escalation simulation scenarios.
  Operates exclusively in sandbox with synthetic data.
  """

  @type scenario :: :token_manipulation | :idor | :role_injection | :session_hijack
  @type result :: %{
    scenario: scenario(),
    success: boolean(),
    vector: String.t(),
    mitigations: [String.t()],
    recommendations: [String.t()]
  }

  @spec simulate(scenario(), map()) :: {:ok, result()}
  def simulate(:token_manipulation, context) do
    # Simulate JWT claim modification attack
    original_token = Map.get(context, :token, generate_synthetic_token(:viewer))
    tampered_token = tamper_role_claim(original_token, :super_admin)

    detection_result = PrismaticSecurity.RBACEnforcer.validate_token_claims(tampered_token)

    {:ok, %{
      scenario: :token_manipulation,
      success: match?({:error, _}, detection_result),
      vector: "JWT role claim modification",
      mitigations: ["Token signature validation", "Server-side role lookup", "Token binding"],
      recommendations: assess_recommendations(detection_result)
    }}
  end

  def simulate(:idor, context) do
    user_id = Map.get(context, :user_id, "user_001")
    target_id = Map.get(context, :target_id, "user_002")

    auth_result = PrismaticSecurity.AuthSentinel.check_authorization(
      user_id,
      "/api/users/#{target_id}/data",
      "analyst"
    )

    {:ok, %{
      scenario: :idor,
      success: auth_result == :authorized,
      vector: "Direct object reference to another user's resource",
      mitigations: ["Resource ownership validation", "Auth-sentinel monitoring", "Request signing"],
      recommendations: assess_recommendations(auth_result)
    }}
  end

  @spec generate_synthetic_token(atom()) :: map()
  defp generate_synthetic_token(role) do
    %{
      "sub" => "synthetic_user_#{:rand.uniform(1000)}",
      "role" => Atom.to_string(role),
      "iss" => "prismatic-platform",
      "exp" => System.os_time(:second) + 3600
    }
  end

  @spec tamper_role_claim(map(), atom()) :: map()
  defp tamper_role_claim(token, target_role) do
    Map.put(token, "role", Atom.to_string(target_role))
  end

  @spec assess_recommendations(term()) :: [String.t()]
  defp assess_recommendations({:error, _}), do: ["Defense effective - continue monitoring"]
  defp assess_recommendations(:authorized), do: ["CRITICAL: Authorization bypass detected", "Review resource ownership checks"]
  defp assess_recommendations({:escalation_detected, _}), do: ["Detection working - review response procedures"]
  defp assess_recommendations(_), do: ["Review authorization logic"]
end
```

## Comparison with Alternatives

### Defense-in-Depth vs Single-Layer Authorization

| Approach | Prismatic (Defense-in-Depth) | Single-Layer Auth |
|----------|------------------------------|-------------------|
| Enforcement points | Plug middleware + GenServer + RBAC + Auth-Sentinel | Single middleware check |
| Detection capability | Real-time behavioral analysis | Binary allow/deny |
| Escalation response | Automated detection + alert + block | Silent failure or crash |
| Testing methodology | Red Team simulation + property-based testing | Manual penetration testing |
| Bypass resistance | Multiple independent layers | Single point of failure |

### RBAC vs ABAC vs ReBAC

The Prismatic Platform uses RBAC (Role-Based Access Control) as its primary authorization model:

- **RBAC**: Assigns permissions to roles; users inherit permissions through role membership. Simple, auditable, well-suited for organizational hierarchies.
- **ABAC** (Attribute-Based Access Control): Evaluates attributes of users, resources, and environment. More flexible but harder to audit and reason about.
- **ReBAC** (Relationship-Based Access Control): Evaluates relationships between entities (e.g., Google Zanzibar). Excellent for social graphs but adds infrastructure complexity.

RBAC was chosen for the platform because it provides clear privilege boundaries that are easy to audit, align with the [violation protocol](/glossary/violation-protocol/), and integrate with the hierarchical agent authority structure (L1-L5).

### BEAM vs Traditional Process Isolation

Traditional Unix process isolation provides privilege boundaries through user/group permissions and capabilities. BEAM process isolation operates at a finer granularity within a single OS process, with microsecond-scale process creation and no shared memory. This enables per-request process isolation without the overhead of OS-level process management.

## Best Practices

### 1. Implement Deny-by-Default

Every authorization check must default to denial. A missing permission check must result in access denial, not access grant. This is enforced by the platform's RBAC enforcer, which returns `{:denied, reason}` for any role-permission combination not explicitly whitelisted.

### 2. Validate Authorization Server-Side

Never rely on client-side authorization checks. The client can be controlled by an attacker. All authorization decisions must be made server-side, with the client's role determined from signed, server-verified tokens.

### 3. Use Least Privilege Principle

Grant the minimum permissions required for each role. The platform's role hierarchy is deliberately minimal (5 roles), with each role receiving only the permissions necessary for its function.

### 4. Monitor for Behavioral Anomalies

Privilege escalation attempts often manifest as behavioral anomalies before they succeed. The Blue Team auth-sentinel monitors for excessive role switches, repeated failed authorization attempts, and access patterns inconsistent with the user's role.

### 5. Audit All Authorization Decisions

Every authorization check, whether granted or denied, should be logged to an [audit trail](/glossary/audit-trail/) for forensic analysis and compliance reporting.

### 6. Rotate and Expire Credentials

Session tokens and API keys must have limited lifetimes and be rotated regularly. The platform enforces token expiration validation in every authorization check.

## Common Pitfalls

### Missing Authorization on Internal APIs

Internal APIs between microservices often lack authorization checks under the assumption that only trusted services call them. In practice, compromised services or network-level attacks can exploit these unprotected endpoints for privilege escalation.

### Role Explosion

Creating too many fine-grained roles makes the RBAC system difficult to audit and maintain, increasing the risk of misconfigured permissions that enable escalation. Keep the role hierarchy simple and use permission composition within roles rather than creating new roles for every access pattern.

### Insufficient Session Invalidation

When a user's role is downgraded or revoked, existing sessions may retain the old privileges until they expire. Implement immediate session invalidation on role changes to prevent "zombie sessions" with elevated privileges.

### Client-Side Role Storage

Storing role information in client-accessible locations (cookies, localStorage, URL parameters) enables trivial role manipulation. Always derive the user's role from a server-verified, cryptographically signed token.

### Ignoring Horizontal Escalation

Organizations often focus on vertical escalation (user-to-admin) while neglecting horizontal escalation (user-to-user). Both are equally dangerous: horizontal escalation compromises data privacy and can serve as a stepping stone to vertical escalation.

## Use Cases

### Color Team Security Operations

The Prismatic Platform's [Color Teams](/glossary/color-teams/) architecture uses privilege escalation as a central testing scenario. The [Red Team](/glossary/red-team/) simulates escalation attacks, the [Blue Team](/glossary/blue-team/) detects and defends, and the [Purple Team](/glossary/purple-team/) synthesizes findings to close gaps.

### EASM Security Ratings

The [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM system evaluates external organizations' exposure to privilege escalation vulnerabilities as part of security rating calculations. Exposed administrative interfaces, default credentials, and misconfigured access controls reduce the target's security score.

### Agent Authority Hierarchy

The platform's 530+ [AIAD](/glossary/aiad/) agents operate within a 5-level authority hierarchy (L1-L5). Each agent can only invoke capabilities at or below its authority level. The agent runtime enforces this hierarchy to prevent lower-level agents from escalating to strategic or supreme authority.

### API Gateway Authorization

The [Prismatic API](/glossary/prismatic-api/) gateway inherits authorization from `PrismaticWeb.Plugs.APIAuth` and enforces RBAC on all auto-discovered endpoints. The generic dispatch controller validates that the requesting user's role has permission to invoke the target function before execution.

### Compliance Requirements

[NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) compliance frameworks require organizations to implement and monitor access controls. The platform's privilege escalation detection and RBAC enforcement directly satisfy these regulatory requirements.

## Related Concepts

- [Authorization](/glossary/authorization/): The access control mechanism that privilege escalation attacks attempt to bypass
- [RBAC](/glossary/rbac/): Role-Based Access Control model preventing unauthorized role assumption
- [Blue Team](/glossary/blue-team/): Defensive security team operating the auth-sentinel monitoring
- [Red Team](/glossary/red-team/): Adversarial team simulating escalation attacks for defense validation
- [Attack Surface](/glossary/attack-surface/): Total exposure area where escalation vectors may exist
- [Vulnerability](/glossary/vulnerability/): Software weaknesses that enable privilege escalation
- [Authentication](/glossary/authentication/): Identity verification that precedes authorization checks
- [Zero Trust](/glossary/zero-trust/): Security model assuming no implicit trust within network boundaries
- [Audit Trail](/glossary/audit-trail/): Immutable record of authorization decisions for forensic analysis
- [Penetration Testing](/glossary/penetration-testing/): Authorized security testing including escalation attempts
- [Color Teams](/glossary/color-teams/): Multi-team adversarial-defensive security architecture
- [Security Operations](/glossary/security-operations/): Operational security monitoring and incident response

## See Also

- [RBAC](/glossary/rbac/) for the role-based access control implementation
- [Blue Team](/glossary/blue-team/) for defensive security monitoring
- [Red Team](/glossary/red-team/) for adversarial escalation simulation
- [OWASP](/glossary/owasp/) for web security vulnerability classification
- [CVE](/glossary/cve/) for vulnerability identification standards
- [Compliance Framework](/glossary/compliance-framework/) for NIS2/ZKB access control requirements
- [Security Rating](/glossary/security-rating/) for EASM security assessment
- [Injection Vulnerability](/glossary/injection-vulnerability/) for SQL injection-based escalation vectors

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
