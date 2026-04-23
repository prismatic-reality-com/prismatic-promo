+++
title = "Security"
weight = 50
[extra]
category = "security"
description = "The comprehensive discipline of protecting software systems, data, and infrastructure from unauthorized access, modification, and disruption through defense-in-depth architectures, adversarial testing, formal verification, and continuous monitoring"
related_terms = ["security-synthesis", "security-verification", "authentication", "authorization", "encryption", "zero-trust", "attack-surface", "vulnerability", "owasp", "penetration-testing"]
keywords = ["software security architecture", "defense in depth Elixir", "BEAM VM security model", "security by design", "application security posture", "OTP security patterns", "process isolation security", "Erlang VM security", "security engineering platform", "comprehensive security framework"]
tags = ["security", "architecture", "defense-in-depth", "otp", "compliance"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
word_count = 1375
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security - Prismatic Platform"
+++

## Definition and Overview

Security in software engineering is the discipline of protecting systems, data, and infrastructure from unauthorized access, modification, disruption, and destruction. It encompasses everything from cryptographic primitives to organizational processes, from network perimeter defense to individual function input validation. In the Prismatic Platform, security is not an afterthought or an add-on layer -- it is a foundational architectural principle enforced through the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, validated by [Color Teams](@/glossary/color-teams.md), and verified through the [Trinity Gate](@/glossary/trinity-gate.md) framework.

The platform's approach to security is distinguished by three characteristics. First, it is adversarial by design: security claims are not accepted until they have survived active attack by the [Red Team](@/glossary/red-team.md). Second, it is formally verified: critical security invariants are proven correct through [formal verification](@/glossary/formal-verification.md) rather than merely tested. Third, it is continuously synthesized: individual security signals from diverse sources are combined through [Security Synthesis](@/glossary/security-synthesis.md) into a unified, confidence-scored posture rather than treated as isolated findings.

Security in the context of the BEAM virtual machine and OTP has unique characteristics that differentiate it from security in other runtime environments. The actor model, process isolation, immutable data, pattern matching, and supervision trees provide a fundamentally different security substrate than the shared-memory, mutable-state models of conventional platforms.

## Security Principles

### Defense in Depth

Defense in depth is the strategy of layering multiple independent security controls so that the failure of any single control does not compromise the entire system:

```
External Traffic
    |
    v
Layer 1: Network Perimeter  --  TLS termination, DDoS protection, WAF
    |
    v
Layer 2: Application  --  Authentication, authorization, rate limiting
    |
    v
Layer 3: Process  --  Process isolation, input validation
    |
    v
Layer 4: Data  --  Encryption at rest, parameterized queries
```

In the Prismatic Platform, each layer operates independently. A failure in the application layer (e.g., an authentication bypass) is contained by the process layer (process isolation prevents lateral movement) and the data layer (encryption at rest prevents data exfiltration even if processes are compromised).

### Principle of Least Privilege

Every component, process, and user should have exactly the permissions required to perform its function and no more. In OTP systems, this maps naturally to process-level isolation:

```elixir
defmodule PrismaticSecurity.PrivilegeEnforcer do
  @moduledoc """
  Enforces least privilege at the process level. Each GenServer
  declares its required capabilities, and the enforcer validates
  that no process exceeds its declared scope.
  """

  @type capability :: :read_data | :write_data | :network_access |
                      :file_system | :spawn_process | :admin_ops

  @spec enforce(pid(), capability()) :: :ok | {:error, :unauthorized}
  def enforce(pid, requested_capability) do
    declared = get_process_capabilities(pid)

    if requested_capability in declared do
      :ok
    else
      :telemetry.execute(
        [:prismatic, :security, :privilege_violation],
        %{count: 1},
        %{pid: pid, capability: requested_capability, declared: declared}
      )
      {:error, :unauthorized}
    end
  end

  defp get_process_capabilities(pid) do
    case Process.info(pid, :dictionary) do
      {:dictionary, dict} ->
        Keyword.get(dict, :__capabilities__, [])
      nil ->
        []
    end
  end
end
```

### Zero Trust Architecture

[Zero Trust](@/glossary/zero-trust.md) assumes that no request, user, or component is trustworthy by default, regardless of its network location or previous authentication status. Every request must be authenticated, authorized, and validated:

```elixir
defmodule PrismaticSecurity.ZeroTrust do
  @moduledoc """
  Zero Trust enforcement layer. Every request is verified regardless
  of origin, with no implicit trust based on network location.
  """

  @spec verify_request(map()) :: {:ok, verified_request()} | {:error, term()}
  def verify_request(request) do
    with {:ok, identity} <- authenticate(request),
         {:ok, authorized} <- authorize(identity, request.resource, request.action),
         {:ok, validated} <- validate_input(request.payload),
         {:ok, _rate_checked} <- check_rate_limit(identity),
         :ok <- log_access(identity, request) do
      {:ok, %{
        identity: identity,
        resource: authorized.resource,
        action: authorized.action,
        payload: validated,
        verified_at: DateTime.utc_now()
      }}
    end
  end

  defp authenticate(%{token: token}) do
    case PrismaticAuth.verify_token(token) do
      {:ok, claims} -> {:ok, claims}
      {:error, :expired} -> {:error, :authentication_failed}
      {:error, :invalid} -> {:error, :authentication_failed}
    end
  end

  defp authorize(identity, resource, action) do
    case PrismaticAuth.RBAC.check(identity.role, resource, action) do
      :allow -> {:ok, %{resource: resource, action: action}}
      :deny -> {:error, :authorization_failed}
    end
  end
end
```

## Technical Deep Dive

### BEAM VM Security Model

The BEAM virtual machine provides security properties at the runtime level that most platforms must implement in application code:

| BEAM Property | Security Benefit | Comparison |
|---------------|-----------------|------------|
| **Process isolation** | Fault containment, no shared memory corruption | vs. thread-based: shared memory = shared vulnerability |
| **Immutable data** | No race conditions, no TOCTOU vulnerabilities | vs. mutable state: concurrent mutation = security risk |
| **Pattern matching** | Explicit handling of all input shapes | vs. dynamic typing: unexpected input = potential exploit |
| **Supervision trees** | Automatic recovery from security failures | vs. crash = service unavailable |
| **Binary handling** | Safe binary parsing, no buffer overflows | vs. C/C++: buffer overflow = remote code execution |
| **Hot code reload** | Security patches without downtime | vs. restart-based: deployment gap = exposure window |

### Process Isolation as Security Boundary

In the BEAM, every process has its own heap, its own garbage collector, and no access to any other process's memory. This is a fundamentally stronger isolation model than OS threads sharing an address space:

```elixir
defmodule PrismaticSecurity.ProcessIsolation do
  @moduledoc """
  Demonstrates BEAM process isolation as a security boundary.
  Each security-critical operation runs in an isolated process
  with its own failure domain.
  """

  @spec isolated_operation(fun(), keyword()) :: {:ok, term()} | {:error, term()}
  def isolated_operation(operation, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 5_000)
    max_heap = Keyword.get(opts, :max_heap_size, 1_000_000)

    task =
      Task.async(fn ->
        Process.flag(:max_heap_size, %{size: max_heap, kill: true, error_logger: true})
        operation.()
      end)

    case Task.yield(task, timeout) || Task.shutdown(task) do
      {:ok, result} -> {:ok, result}
      {:exit, reason} -> {:error, {:process_crashed, reason}}
      nil -> {:error, :timeout}
    end
  end
end
```

### Input Validation and Sanitization

Security begins at the system boundary where external input enters the application. The platform enforces validation at every entry point:

```elixir
defmodule PrismaticSecurity.InputSanitizer do
  @moduledoc """
  Comprehensive input sanitization for all external-facing endpoints.
  Implements OWASP input validation guidelines with Elixir pattern matching.
  """

  @type validation_result :: {:ok, sanitized :: term()} | {:error, violations :: [String.t()]}

  @spec sanitize(map(), schema :: keyword()) :: validation_result()
  def sanitize(input, schema) when is_map(input) do
    results =
      schema
      |> Enum.map(fn {field, rules} ->
        value = Map.get(input, field) || Map.get(input, to_string(field))
        validate_field(field, value, rules)
      end)

    errors = Enum.filter(results, &match?({:error, _, _}, &1))

    if Enum.empty?(errors) do
      sanitized =
        results
        |> Enum.map(fn {:ok, field, value} -> {field, value} end)
        |> Map.new()

      {:ok, sanitized}
    else
      violations = Enum.map(errors, fn {:error, field, reason} -> "#{field}: #{reason}" end)
      {:error, violations}
    end
  end

  defp validate_field(field, value, rules) do
    Enum.reduce_while(rules, {:ok, field, value}, fn rule, {:ok, f, v} ->
      case apply_rule(rule, v) do
        {:ok, sanitized} -> {:cont, {:ok, f, sanitized}}
        {:error, reason} -> {:halt, {:error, f, reason}}
      end
    end)
  end

  defp apply_rule(:required, nil), do: {:error, "is required"}
  defp apply_rule(:required, ""), do: {:error, "cannot be empty"}
  defp apply_rule(:required, value), do: {:ok, value}

  defp apply_rule({:max_length, max}, value) when is_binary(value) do
    if String.length(value) <= max, do: {:ok, value}, else: {:error, "exceeds max length #{max}"}
  end

  defp apply_rule(:trim, value) when is_binary(value) do
    {:ok, String.trim(value)}
  end
end
```

### Authentication and Authorization

The platform implements [Authentication](@/glossary/authentication.md) (verifying identity) and [Authorization](@/glossary/authorization.md) (verifying permissions) as distinct, composable layers:

```elixir
defmodule PrismaticSecurity.RBAC do
  @moduledoc """
  Role-Based Access Control with hierarchical permission inheritance.
  Implements the principle of least privilege with explicit role
  definitions and permission grants.
  """

  @type role :: :viewer | :analyst | :operator | :admin | :supreme
  @type resource :: atom()
  @type action :: :read | :write | :delete | :admin

  @role_hierarchy %{
    supreme: [:admin, :operator, :analyst, :viewer],
    admin: [:operator, :analyst, :viewer],
    operator: [:analyst, :viewer],
    analyst: [:viewer],
    viewer: []
  }

  @permissions %{
    viewer: %{
      dashboard: [:read],
      reports: [:read],
      glossary: [:read]
    },
    analyst: %{
      osint: [:read, :write],
      perimeter: [:read, :write],
      investigations: [:read, :write]
    },
    operator: %{
      agents: [:read, :write],
      pipelines: [:read, :write, :delete],
      deployments: [:read, :write]
    },
    admin: %{
      users: [:read, :write, :delete, :admin],
      system: [:read, :write, :admin],
      security: [:read, :write, :admin]
    }
  }

  @spec check(role(), resource(), action()) :: :allow | :deny
  def check(role, resource, action) do
    effective_roles = [role | Map.get(@role_hierarchy, role, [])]

    allowed =
      effective_roles
      |> Enum.any?(fn r ->
        r
        |> then(&Map.get(@permissions, &1, %{}))
        |> then(&Map.get(&1, resource, []))
        |> Enum.member?(action)
      end)

    if allowed, do: :allow, else: :deny
  end
end
```

### Cryptographic Security

The platform uses Erlang's `:crypto` module (backed by OpenSSL) for all cryptographic operations:

```elixir
defmodule PrismaticSecurity.Crypto do
  @moduledoc """
  Cryptographic utilities for the Prismatic Platform.
  Wraps Erlang :crypto for HMAC, AES-GCM encryption, and
  secure random generation with proper key management.
  """

  @aes_key_size 32
  @iv_size 12
  @tag_size 16

  @spec encrypt(binary(), binary()) :: {:ok, binary()} | {:error, term()}
  def encrypt(plaintext, key) when byte_size(key) == @aes_key_size do
    iv = :crypto.strong_rand_bytes(@iv_size)

    {ciphertext, tag} =
      :crypto.crypto_one_time_aead(
        :aes_256_gcm, key, iv, plaintext, <<>>, @tag_size, true
      )

    {:ok, iv <> tag <> ciphertext}
  end

  @spec decrypt(binary(), binary()) :: {:ok, binary()} | {:error, :decryption_failed}
  def decrypt(<<iv::binary-size(@iv_size), tag::binary-size(@tag_size), ciphertext::binary>>, key)
      when byte_size(key) == @aes_key_size do
    case :crypto.crypto_one_time_aead(
           :aes_256_gcm, key, iv, ciphertext, <<>>, tag, false
         ) do
      plaintext when is_binary(plaintext) -> {:ok, plaintext}
      :error -> {:error, :decryption_failed}
    end
  end

  def decrypt(_, _), do: {:error, :decryption_failed}

  @spec constant_time_compare(binary(), binary()) :: boolean()
  def constant_time_compare(a, b) when byte_size(a) == byte_size(b) do
    :crypto.hash_equals(a, b)
  end

  def constant_time_compare(_, _), do: false
end
```

## Architecture and Implementation

### Security Architecture Layers

The Prismatic Platform implements security across five architectural layers:

| Layer | Responsibility | Key Modules |
|-------|---------------|-------------|
| **Perimeter** | External attack surface management | PrismaticPerimeter (EASM, ratings) |
| **Network** | TLS, certificate management, DNS security | Fly.io infrastructure, certificate monitoring |
| **Application** | Auth, RBAC, input validation, rate limiting | PrismaticAuth, PrismaticWeb.Plugs |
| **Process** | Isolation, supervision, resource limits | OTP supervision trees, process flags |
| **Data** | Encryption at rest, parameterized queries, audit | PrismaticStorage, Ecto changesets |

### Color Team Security Operations

The platform's security posture is continuously challenged and validated by 20 agents across 6 [Color Teams](@/glossary/color-teams.md):

| Team | Agents | Security Role |
|------|--------|---------------|
| [Gray Team](@/glossary/gray-team.md) | 3 | Boundary exploration, edge case discovery |
| [Red Team](@/glossary/red-team.md) | 4 | Adversarial attack simulation |
| [Blue Team](@/glossary/blue-team.md) | 4 | Defensive posture, drift detection |
| [Purple Team](@/glossary/purple-team.md) | 4 | Synthesis, closure, regression guarding |
| [White Team](@/glossary/white-team.md) | 3 | Formal verification, contract validation |
| [Black Team](@/glossary/black-team.md) | 2 | Theoretical threat modeling (maximum isolation) |

### Security Monitoring and Telemetry

All security-relevant events emit telemetry for real-time monitoring and post-incident analysis:

```elixir
defmodule PrismaticSecurity.TelemetryHandler do
  @moduledoc """
  Handles security-related telemetry events for monitoring,
  alerting, and audit trail maintenance.
  """

  @security_events [
    [:prismatic, :security, :authentication],
    [:prismatic, :security, :authorization],
    [:prismatic, :security, :rate_limit],
    [:prismatic, :security, :input_validation],
    [:prismatic, :security, :privilege_violation],
    [:prismatic, :security, :encryption],
    [:prismatic, :security, :audit]
  ]

  @spec attach() :: :ok
  def attach do
    :telemetry.attach_many(
      "prismatic-security-handler",
      @security_events,
      &handle_event/4,
      %{}
    )
  end

  defp handle_event([:prismatic, :security, :authentication], measurements, metadata, _config) do
    case metadata.result do
      :success ->
        Logger.info("Authentication success",
          user_id: metadata.user_id,
          method: metadata.method,
          duration_us: measurements.duration
        )

      :failure ->
        Logger.warning("Authentication failure",
          reason: metadata.reason,
          ip: metadata.ip,
          attempt_count: metadata.attempt_count
        )

        if metadata.attempt_count >= 5 do
          PrismaticSecurity.AlertManager.trigger(:brute_force_detected, metadata)
        end
    end
  end
end
```

## Usage in Prismatic Platform

### Prismatic Perimeter (EASM)

The [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) module implements External Attack Surface Management, providing:

- **Asset Discovery**: Domains, IPs, certificates, cloud resources, services
- **Security Ratings**: A-F grades with numeric scores (300-900)
- **Compliance Assessment**: NIS2 Directive, ZKB 264/2025 Sb.
- **Continuous Monitoring**: Real-time dashboard at `/perimeter`

### OSINT Security Intelligence

The platform integrates 120 [OSINT](@/glossary/osint.md) tools across 7 categories for security intelligence gathering, including Shodan, Censys, VirusTotal, GreyNoise, and specialized Czech registry adapters.

### Security in the CI/CD Pipeline

Security checks are integrated into every stage of the development lifecycle:

| Stage | Security Checks |
|-------|----------------|
| Pre-commit | Forbidden patterns, secret detection, template validation |
| CI Build | Compilation warnings, Credo security rules, Dialyzer |
| CI Test | Security property tests, contract tests, integration tests |
| Pre-deploy | Dependency audit, vulnerability scan, compliance check |
| Post-deploy | Smoke tests, perimeter scan, certificate verification |
| Runtime | Telemetry monitoring, anomaly detection, rate limiting |

## Best Practices

**Design for security from the start.** Retrofitting security onto an existing system is orders of magnitude more expensive and less effective than building it in. Every architectural decision should consider security implications.

**Use the BEAM's isolation model.** Process isolation in OTP is not just a reliability feature -- it is a security feature. Design your system so that security-critical operations run in isolated processes with minimal capabilities.

**Validate at every boundary.** Every function that receives external input must validate it. Every API endpoint must authenticate and authorize. Every database query must use parameterized statements. Never trust data from outside the current process.

**Make security observable.** If you cannot see security events happening in real time, you cannot respond to them. Emit telemetry for all security-relevant operations and build dashboards and alerts on top of that data.

**Practice adversarial thinking.** Do not just test the happy path. Ask "how could an attacker abuse this?" for every feature. Use the Red Team methodology to actively challenge your assumptions.

**Keep dependencies updated.** The most common vulnerability in production systems is a known CVE in an outdated dependency. Run `mix deps.audit` regularly and update promptly.

## Common Pitfalls

**Security as a checkbox.** Running a vulnerability scanner once per quarter is compliance theater, not security. Genuine security requires continuous monitoring, regular adversarial testing, and ongoing synthesis of security signals.

**Authentication without authorization.** Knowing who a user is (authentication) does not tell you what they should be allowed to do (authorization). Both must be implemented and tested independently.

**Logging sensitive data.** Security logging must never include passwords, tokens, PII, or other sensitive information. Use structured logging with explicit field selection to prevent accidental data exposure.

**Shared mutable state.** In non-BEAM systems, shared mutable state is a primary source of security vulnerabilities (race conditions, TOCTOU, concurrent modification). Even in Elixir, avoid ETS tables with `:public` access unless there is a compelling performance reason.

**Security through obscurity.** Relying on attackers not knowing your system architecture is not security. Assume the attacker knows everything about your system except your cryptographic keys.

**Ignoring the human factor.** The most sophisticated technical security is worthless if an operator can be socially engineered into bypassing it. Security awareness, process discipline, and the [Session Discipline](@/glossary/session-discipline.md) protocol are as important as cryptographic controls.

## Security Standards and Compliance

The platform targets compliance with multiple security frameworks:

| Standard | Scope | Status |
|----------|-------|--------|
| [OWASP Top 10](@/glossary/owasp.md) | Application security | Active enforcement |
| [NIS2](@/glossary/nis2.md) | EU cybersecurity directive | Compliance mapped |
| [ZKB](@/glossary/zkb.md) | Czech cybersecurity law | Compliance mapped |
| [GDPR](@/glossary/gdpr.md) | Data protection | Active enforcement |
| [ISO 27001](@/glossary/iso-27001.md) | ISMS | Framework aligned |
| [SOC 2](@/glossary/soc2.md) | Service organization controls | Audit trail ready |

## Related Concepts

- [Security Synthesis](@/glossary/security-synthesis.md) -- Combining security signals into unified posture
- [Security Verification](@/glossary/security-verification.md) -- Proving security properties hold
- [Authentication](@/glossary/authentication.md) -- Identity verification
- [Authorization](@/glossary/authorization.md) -- Permission enforcement
- [Zero Trust](@/glossary/zero-trust.md) -- Never-trust, always-verify architecture
- [Attack Surface](@/glossary/attack-surface.md) -- Total exposure area for potential attacks
- [OWASP](@/glossary/owasp.md) -- Web application security standards
- [Encryption](@/glossary/encryption.md) -- Data protection through cryptography
- [Color Teams](@/glossary/color-teams.md) -- Adversarial-defensive security organization
- [Trinity Gate](@/glossary/trinity-gate.md) -- Multi-gate validation for security claims
- [Penetration Testing](@/glossary/penetration-testing.md) -- Active vulnerability discovery

## See Also

- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- External Attack Surface Management
- [EASM](@/glossary/easm.md) -- External attack surface management concepts
- [Vulnerability](@/glossary/vulnerability.md) -- Security weakness classification
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Umbrella applications with security controls

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
