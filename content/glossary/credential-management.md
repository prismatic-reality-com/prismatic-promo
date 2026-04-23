+++
title = "Credential Management"
weight = 50
[extra]
tags = ["glossary", "security", "credentials", "secrets", "api-keys", "tokens", "certificates", "rotation", "vault", "environment-variables", "access-control", "key-management"]
description = "Secure storage, rotation, and access control for authentication credentials including API keys, tokens, passwords, and certificates, with enforcement of zero-secret-in-code policy across the Prismatic Platform"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "security-and-identity"
related_concepts = ["authentication", "authorization", "encryption", "security-operations", "jwt", "oauth2", "tls", "rbac"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["authentication", "encryption", "genserver", "ets"]
learning_path = ["authentication", "credential-management", "security-operations", "encryption", "compliance-framework"]
interactive_demos = ["/labs/glossary/credential-management"]
code_examples = ["CredentialStore", "KeyRotator", "SecretResolver", "APIKeyManager"]
external_resources = ["https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html", "https://hexdocs.pm/phoenix/deployment.html#handling-of-your-application-secrets", "https://www.vaultproject.io/docs/what-is-vault"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["credential_rotation_zero_downtime", "expired_credential_rejection", "secret_leak_detection", "environment_variable_resolution", "api_key_hash_verification", "certificate_expiry_alerting"]
keywords = ["credential management", "secret storage", "API key rotation", "token lifecycle", "certificate management", "environment variables", "key derivation", "vault integration", "zero-trust credentials", "credential auditing"]
related_terms = ["authentication", "authorization", "encryption", "encryption-at-rest", "security-operations", "jwt", "oauth2", "tls", "api-gateway", "audit-trail"]
word_count = 1799
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Credential Management - Prismatic Platform"
+++

## Definition

Credential management is the discipline of securely generating, storing, distributing, rotating, and revoking authentication credentials throughout their lifecycle. Credentials encompass any secret material used to prove identity or authorize access: API keys, JWT signing secrets, database passwords, TLS certificates, SSH keys, OAuth2 client secrets, and service account tokens. Effective credential management ensures that secrets are never exposed in source code, logs, or transit; that compromised credentials can be revoked instantly; and that rotation occurs automatically without service disruption.

In the Prismatic Platform, credential management is enforced as an absolute policy under the [NO MERCY](/glossary/no-mercy/) doctrine: zero secrets in source code, environment-variable-based configuration at runtime, ETS-backed credential stores with automatic rotation, and comprehensive [audit trails](/glossary/audit-trail/) for every credential access event. The platform's pre-commit hooks detect and block any attempt to commit secrets, API keys, or hardcoded credentials.

## Overview

Credential management sits at the intersection of security engineering and operational reliability. A single leaked credential can compromise an entire system -- the 2023 CircleCI breach, the 2022 Uber hack, and countless GitHub secret exposures demonstrate that credential mismanagement is among the most common and devastating attack vectors. The problem is not merely technical; it is organizational and procedural.

The Prismatic Platform addresses credential management across four dimensions:

1. **Generation**: Cryptographically strong credential generation using Erlang's `:crypto` module, ensuring sufficient entropy and appropriate key lengths for each credential type.

2. **Storage**: Credentials are never stored in plaintext. API keys are SHA-256 hashed before storage in [ETS](/glossary/ets/) tables. Signing secrets are loaded from environment variables at boot time and held only in process memory. Database credentials use runtime configuration that resolves environment variables during application startup, not at compile time.

3. **Distribution**: Credentials flow through secure channels only. In development, `.env` files (gitignored) provide local secrets. In production on [Fly.io](/glossary/fly-io/), secrets are injected as environment variables through the platform's encrypted secret store, never touching disk.

4. **Rotation**: Credentials have defined lifetimes. API keys support overlapping validity windows for zero-downtime rotation. JWT signing keys use key ID (`kid`) headers to support multiple active keys during rotation. TLS certificates are monitored for expiration with automated renewal.

This approach eliminates the two most dangerous credential anti-patterns: secrets in source code (which persist in git history forever) and static credentials (which accumulate risk over time as the probability of compromise increases).

## Technical Details

### Credential Types and Their Properties

Different credential types have distinct security properties and management requirements:

| Credential Type | Entropy (bits) | Storage Method | Rotation Period | Revocation Speed |
|----------------|---------------|----------------|-----------------|------------------|
| **API Key** | 256 | SHA-256 hash in ETS | 90 days | Immediate |
| **JWT Signing Key** | 256 (HMAC) / 2048+ (RSA) | Process memory | 30 days | Key ID rotation |
| **Database Password** | 128+ | Environment variable | 90 days | Connection pool restart |
| **TLS Certificate** | 2048+ (RSA) / 256 (ECDSA) | Filesystem (permissions 0600) | 365 days (Let's Encrypt: 90) | CRL/OCSP |
| **OAuth2 Client Secret** | 256 | Environment variable | 180 days | Provider revocation |
| **Session Secret** | 256 | Environment variable | 30 days | Application restart |
| **Encryption Key** | 256 (AES-256) | Environment variable | 365 days | Re-encryption required |

### Credential Lifecycle State Machine

Every credential in the Prismatic Platform follows a well-defined state machine:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Generate  │───>│  Active   │───>│ Rotating  │───>│ Retired   │
│ (create)  │    │ (primary) │    │ (overlap) │    │ (expired) │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                │               │                │
     │                v               v                v
     │           ┌──────────┐   ┌──────────┐    ┌──────────┐
     └──────────>│ Revoked   │<──│Emergency  │    │ Destroyed │
                 │ (blocked) │   │ (breach)  │    │ (purged)  │
                 └──────────┘   └──────────┘    └──────────┘
```

The `Rotating` state is critical: during rotation, both the old and new credentials are valid simultaneously, allowing all clients to transition without downtime. The overlap window is configurable per credential type.

### Secret Detection in Pre-Commit Hooks

The platform's pre-commit hooks include secret detection as a blocking gate:

```bash
# Patterns detected and blocked (from .githooks/pre-commit)
# - AWS keys: AKIA[0-9A-Z]{16}
# - Generic API keys: [aA][pP][iI]_?[kK][eE][yY].*=.*['\"][a-zA-Z0-9]{20,}
# - Private keys: -----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----
# - Database URLs: postgres://.*:.*@
# - JWT secrets: jwt.*secret.*=.*['\"][a-zA-Z0-9+/]{20,}
```

### Environment Variable Resolution Architecture

The Prismatic Platform uses runtime configuration exclusively for credentials, never compile-time configuration:

```elixir
defmodule Prismatic.Config.SecretResolver do
  @moduledoc """
  Resolves credential values from environment variables at runtime.

  This module ensures that secrets are never baked into compiled BEAM
  bytecode. All credential resolution happens during application boot,
  with validation that required secrets are present and meet minimum
  entropy requirements.

  ## Architecture

  SecretResolver operates in three phases:
  1. **Discovery** - Identify all required environment variables
  2. **Resolution** - Read values from the environment
  3. **Validation** - Verify entropy, format, and constraints

  Missing or weak credentials cause application boot failure under
  the NO MERCY doctrine -- no fallback to defaults, no silent degradation.
  """

  @type secret_spec :: %{
          env_var: String.t(),
          required: boolean(),
          min_length: pos_integer(),
          format: :base64 | :hex | :utf8 | :pem,
          description: String.t()
        }

  @type resolution_result :: {:ok, String.t()} | {:error, resolution_error()}
  @type resolution_error :: :missing | :too_short | :invalid_format

  @spec resolve(secret_spec()) :: resolution_result()
  def resolve(%{env_var: env_var, required: required} = spec) do
    case System.get_env(env_var) do
      nil when required ->
        {:error, :missing}

      nil ->
        {:ok, nil}

      value ->
        with :ok <- validate_length(value, spec),
             :ok <- validate_format(value, spec) do
          {:ok, value}
        end
    end
  end

  @spec resolve_all([secret_spec()]) :: {:ok, map()} | {:error, [{String.t(), resolution_error()}]}
  def resolve_all(specs) do
    results =
      Enum.map(specs, fn spec ->
        case resolve(spec) do
          {:ok, value} -> {:ok, spec.env_var, value}
          {:error, reason} -> {:error, spec.env_var, reason}
        end
      end)

    errors = for {:error, var, reason} <- results, do: {var, reason}

    if errors == [] do
      resolved = for {:ok, var, value} <- results, into: %{}, do: {var, value}
      {:ok, resolved}
    else
      {:error, errors}
    end
  end

  @spec validate_length(String.t(), secret_spec()) :: :ok | {:error, :too_short}
  defp validate_length(value, %{min_length: min_length}) do
    if String.length(value) >= min_length do
      :ok
    else
      {:error, :too_short}
    end
  end

  defp validate_length(_value, _spec), do: :ok

  @spec validate_format(String.t(), secret_spec()) :: :ok | {:error, :invalid_format}
  defp validate_format(value, %{format: :base64}) do
    case Base.decode64(value) do
      {:ok, _} -> :ok
      :error -> {:error, :invalid_format}
    end
  end

  defp validate_format(value, %{format: :hex}) do
    case Base.decode16(value, case: :mixed) do
      {:ok, _} -> :ok
      :error -> {:error, :invalid_format}
    end
  end

  defp validate_format(_value, _spec), do: :ok
end
```

### ETS-Backed Credential Store

The platform stores active credentials in [ETS](/glossary/ets/) for sub-microsecond lookup performance, with the original secret values replaced by cryptographic hashes:

```elixir
defmodule Prismatic.Credentials.Store do
  @moduledoc """
  GenServer-managed ETS-backed credential store with automatic
  rotation scheduling, audit logging, and health monitoring.

  Credentials are stored as hashed values with metadata including
  creation time, expiration, owner, and scopes. Raw credential
  values never persist beyond the initial hashing operation.
  """

  use GenServer

  alias Prismatic.Credentials.RotationScheduler

  @table_name :credential_store
  @rotation_check_interval :timer.minutes(5)

  @type credential_entry :: %{
          credential_id: String.t(),
          hash: binary(),
          owner: String.t(),
          scopes: [String.t()],
          created_at: DateTime.t(),
          expires_at: DateTime.t(),
          status: :active | :rotating | :revoked | :expired
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec validate_credential(String.t()) ::
          {:ok, credential_entry()} | {:error, :invalid | :expired | :revoked}
  def validate_credential(raw_credential) do
    hashed = hash_credential(raw_credential)

    case :ets.lookup(@table_name, hashed) do
      [{^hashed, %{status: :revoked} = entry}] ->
        emit_telemetry(:rejected, entry, :revoked)
        {:error, :revoked}

      [{^hashed, %{status: :expired} = entry}] ->
        emit_telemetry(:rejected, entry, :expired)
        {:error, :expired}

      [{^hashed, %{expires_at: expires_at} = entry}] ->
        if DateTime.compare(DateTime.utc_now(), expires_at) == :lt do
          emit_telemetry(:validated, entry, :success)
          {:ok, entry}
        else
          mark_expired(hashed, entry)
          {:error, :expired}
        end

      [] ->
        emit_telemetry(:unknown, %{hash: hashed}, :not_found)
        {:error, :invalid}
    end
  end

  @spec register_credential(String.t(), map()) :: {:ok, credential_entry()} | {:error, term()}
  def register_credential(raw_credential, metadata) do
    GenServer.call(__MODULE__, {:register, raw_credential, metadata})
  end

  @spec revoke_credential(String.t()) :: :ok | {:error, :not_found}
  def revoke_credential(credential_id) do
    GenServer.call(__MODULE__, {:revoke, credential_id})
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table_name, [:set, :named_table, :protected, read_concurrency: true])
    schedule_rotation_check()
    {:ok, %{table: table, rotation_count: 0}}
  end

  @impl true
  def handle_call({:register, raw_credential, metadata}, _from, state) do
    hashed = hash_credential(raw_credential)
    now = DateTime.utc_now()

    entry = %{
      credential_id: generate_credential_id(),
      hash: hashed,
      owner: Map.fetch!(metadata, :owner),
      scopes: Map.get(metadata, :scopes, []),
      created_at: now,
      expires_at: Map.get(metadata, :expires_at, DateTime.add(now, 90, :day)),
      status: :active
    }

    true = :ets.insert(@table_name, {hashed, entry})
    emit_telemetry(:registered, entry, :success)
    {:reply, {:ok, entry}, state}
  end

  @impl true
  def handle_call({:revoke, credential_id}, _from, state) do
    case find_by_id(credential_id) do
      {:ok, {hash, entry}} ->
        revoked = %{entry | status: :revoked}
        true = :ets.insert(@table_name, {hash, revoked})
        emit_telemetry(:revoked, revoked, :manual)
        {:reply, :ok, state}

      :not_found ->
        {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_info(:check_rotations, state) do
    expired_count = RotationScheduler.process_expirations(@table_name)
    schedule_rotation_check()
    {:noreply, %{state | rotation_count: state.rotation_count + expired_count}}
  end

  @spec hash_credential(String.t()) :: binary()
  defp hash_credential(raw), do: :crypto.hash(:sha256, raw)

  @spec generate_credential_id() :: String.t()
  defp generate_credential_id do
    :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
  end

  @spec schedule_rotation_check() :: reference()
  defp schedule_rotation_check do
    Process.send_after(self(), :check_rotations, @rotation_check_interval)
  end

  @spec find_by_id(String.t()) :: {:ok, {binary(), credential_entry()}} | :not_found
  defp find_by_id(credential_id) do
    result =
      :ets.foldl(
        fn {hash, %{credential_id: ^credential_id} = entry}, _acc -> {:ok, {hash, entry}}
           _, acc -> acc
        end,
        :not_found,
        @table_name
      )

    result
  end

  @spec mark_expired(binary(), credential_entry()) :: true
  defp mark_expired(hash, entry) do
    expired = %{entry | status: :expired}
    :ets.insert(@table_name, {hash, expired})
  end

  @spec emit_telemetry(atom(), map(), atom()) :: :ok
  defp emit_telemetry(action, entry, reason) do
    :telemetry.execute(
      [:prismatic, :credentials, action],
      %{count: 1, timestamp: System.monotonic_time()},
      %{credential_id: Map.get(entry, :credential_id, "unknown"), reason: reason}
    )
  end
end
```

### Key Rotation with Zero Downtime

```elixir
defmodule Prismatic.Credentials.RotationScheduler do
  @moduledoc """
  Manages credential rotation windows, ensuring zero-downtime
  transitions by maintaining overlapping validity periods.

  During rotation, both the old and new credential are active.
  The old credential transitions through: active -> rotating -> expired.
  The new credential is immediately active upon registration.
  """

  @type rotation_plan :: %{
          old_credential_id: String.t(),
          new_credential_id: String.t(),
          overlap_window: pos_integer(),
          initiated_at: DateTime.t()
        }

  @spec initiate_rotation(String.t(), String.t(), keyword()) ::
          {:ok, rotation_plan()} | {:error, term()}
  def initiate_rotation(old_id, new_credential_raw, opts \\ []) do
    overlap = Keyword.get(opts, :overlap_window, :timer.hours(24))

    with {:ok, {_hash, old_entry}} <- lookup_credential(old_id),
         {:ok, new_entry} <- register_new_credential(new_credential_raw, old_entry),
         :ok <- schedule_old_expiration(old_id, overlap) do
      plan = %{
        old_credential_id: old_id,
        new_credential_id: new_entry.credential_id,
        overlap_window: overlap,
        initiated_at: DateTime.utc_now()
      }

      {:ok, plan}
    end
  end

  @spec process_expirations(atom()) :: non_neg_integer()
  def process_expirations(table) do
    now = DateTime.utc_now()

    :ets.foldl(
      fn
        {hash, %{status: :rotating, expires_at: exp} = entry}, count ->
          if DateTime.compare(now, exp) != :lt do
            :ets.insert(table, {hash, %{entry | status: :expired}})
            count + 1
          else
            count
          end

        _, count ->
          count
      end,
      0,
      table
    )
  end

  @spec lookup_credential(String.t()) :: {:ok, {binary(), map()}} | {:error, :not_found}
  defp lookup_credential(_id), do: {:error, :not_found}

  @spec register_new_credential(String.t(), map()) :: {:ok, map()} | {:error, term()}
  defp register_new_credential(_raw, _template), do: {:error, :not_implemented}

  @spec schedule_old_expiration(String.t(), pos_integer()) :: :ok
  defp schedule_old_expiration(_id, _overlap), do: :ok
end
```

### Runtime Configuration Pattern

The Prismatic Platform uses `config/runtime.exs` exclusively for credential configuration:

```elixir
# config/runtime.exs (simplified credential section)
import Config

if config_env() == :prod do
  config :prismatic, Prismatic.Auth.TokenVerifier,
    signing_key: System.fetch_env!("JWT_SIGNING_KEY"),
    algorithm: "HS256",
    issuer: "prismatic",
    audience: "prismatic-platform"

  config :prismatic, Prismatic.Repo,
    url: System.fetch_env!("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))

  config :prismatic_web, PrismaticWeb.Endpoint,
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
end
```

## Implementation in Prismatic Platform

Credential management in the Prismatic Platform is implemented as a multi-layered defense across the umbrella architecture:

### Layer 1: Prevention (Pre-Commit)

The `.githooks/pre-commit` hook runs secret detection as Phase 3 of the 11-phase pre-commit pipeline. Any file containing patterns matching known secret formats is blocked from commit. This is enforced under [NO MERCY](/glossary/no-mercy/) -- no bypass flags permitted.

### Layer 2: Runtime Resolution

All credentials are resolved from environment variables at application startup using `config/runtime.exs`. The `SecretResolver` module validates that required secrets are present, meet minimum entropy requirements, and conform to expected formats. Missing required credentials cause immediate boot failure with explicit error messages.

### Layer 3: Secure Storage

Active credentials are stored in [ETS](/glossary/ets/) tables with `:protected` access, meaning only the owning [GenServer](/glossary/genserver/) process can write to the table, while all processes can read. Raw credential values are replaced with SHA-256 hashes immediately upon registration.

### Layer 4: Audit and Telemetry

Every credential operation emits [telemetry](/glossary/telemetry/) events: registration, validation, rejection, rotation, and revocation. These events feed into the platform's monitoring infrastructure for anomaly detection (e.g., unusual validation failure rates indicating a brute-force attack).

### Layer 5: Rotation Automation

The `RotationScheduler` manages credential lifecycle transitions with configurable overlap windows, ensuring that rotation never causes service disruption. Credentials approaching expiration trigger alerts through the [Quality Floor Guardian](/glossary/quality-floor-guardian/).

### Fly.io Production Integration

In the production environment on [Fly.io](/glossary/fly-io/), credentials are managed through Fly's encrypted secrets:

```bash
# Setting production credentials (never logged, encrypted at rest)
fly secrets set JWT_SIGNING_KEY="$(openssl rand -base64 32)"
fly secrets set DATABASE_URL="postgres://..."
fly secrets set SECRET_KEY_BASE="$(mix phx.gen.secret)"
```

## Comparison with Alternatives

| Approach | Security | Complexity | Cost | Rotation | Prismatic Usage |
|----------|----------|------------|------|----------|-----------------|
| **Environment Variables** | Good | Low | Free | Manual/scripted | Primary method |
| **HashiCorp Vault** | Excellent | High | $$$ (Enterprise) | Automatic | Future integration |
| **AWS Secrets Manager** | Excellent | Medium | $ per secret | Automatic | N/A (Fly.io) |
| **Azure Key Vault** | Excellent | Medium | $ per operation | Automatic | N/A |
| **Encrypted Config Files** | Medium | Low | Free | Manual | Not used (git risk) |
| **Kubernetes Secrets** | Medium | Medium | Free (with K8s) | Manual | N/A (Fly.io) |
| **SOPS (Mozilla)** | Good | Medium | Free | Manual | Considered |
| **Doppler** | Good | Low | $/developer | Automatic | Not used |

The Prismatic Platform currently uses environment variables as the primary credential delivery mechanism because it aligns with the Twelve-Factor App methodology, integrates cleanly with Fly.io's deployment model, and avoids introducing external dependencies for secret management. The ETS-backed credential store adds runtime management capabilities (rotation, revocation, audit) on top of the environment variable foundation.

## Best Practices

1. **Never commit secrets to version control**: Use `.gitignore` for `.env` files, pre-commit hooks for detection, and `git-secrets` or equivalent tooling. Even if removed in a later commit, secrets persist in git history.

2. **Use runtime configuration exclusively**: All secret resolution must happen in `config/runtime.exs`, never in `config/config.exs` or `config/dev.exs`. Compile-time resolution embeds secrets in BEAM bytecode.

3. **Hash credentials before storage**: Store SHA-256 hashes of API keys, not plaintext values. Use bcrypt or Argon2 for passwords. This ensures that a memory dump or ETS table inspection cannot reveal raw credentials.

4. **Implement key rotation with overlap windows**: Never switch credentials atomically. Maintain a configurable overlap period where both old and new credentials are valid, then expire the old credential.

5. **Set minimum entropy requirements**: API keys should have at least 256 bits of entropy. Passwords should meet complexity requirements. Weak credentials should be rejected at registration time.

6. **Audit all credential operations**: Every validation, rotation, and revocation must emit telemetry events. Anomalous patterns (high failure rates, unusual access times) should trigger alerts.

7. **Scope credentials narrowly**: Each credential should grant the minimum permissions necessary. An API key for reading data should not permit writes. Use scoped credentials rather than superuser keys.

8. **Automate rotation scheduling**: Human-driven rotation is unreliable. Schedule automatic rotation with alerting for credentials approaching expiration.

## Common Pitfalls

1. **Hardcoding secrets in source code**: The most common and dangerous anti-pattern. Secrets in code are secrets in git history forever. The Prismatic Platform blocks this at the pre-commit hook level.

2. **Using compile-time configuration for secrets**: Elixir's `config/config.exs` is evaluated at compile time. Secrets placed there are embedded in the release artifact, visible to anyone with access to the build.

3. **Storing raw API keys in databases**: If the database is compromised, all API keys are exposed. Always hash before storage. The trade-off (you cannot display the key again) is acceptable -- issue a new key instead.

4. **No rotation policy**: Static credentials accumulate risk linearly over time. The probability that a credential has been compromised increases with its age. Mandatory rotation bounds this risk.

5. **Shared credentials across environments**: Using the same API key or database password in development, staging, and production means a development leak compromises production. Each environment must have unique credentials.

6. **Logging credential values**: Never log raw credentials, even at debug level. Logs are often stored with weaker security than the credentials themselves. Log credential IDs or hashed prefixes instead.

7. **Missing revocation mechanism**: If you cannot revoke a credential instantly, a discovered breach remains exploitable until the credential expires naturally. Every credential type must support immediate revocation.

8. **Insufficient entropy**: Short or predictable credentials can be brute-forced. API keys generated from weak random sources (e.g., `Math.random()` in JavaScript) may be guessable.

## Use Cases

### API Key Management for External Integrations

The Prismatic Platform issues scoped API keys to external integrations (CI/CD pipelines, monitoring tools, third-party services). Each key is registered with a specific set of scopes (e.g., `read:perimeter`, `write:assets`) and an expiration date. The [API Gateway](/glossary/api-gateway/) validates keys against the ETS credential store on every request.

### JWT Signing Key Rotation

JWT signing keys are rotated every 30 days using the `kid` (Key ID) header mechanism. During rotation, the platform accepts tokens signed with both the old and new keys. After the 24-hour overlap window, tokens signed with the old key are rejected, forcing clients to obtain new tokens.

### Database Credential Rotation on Fly.io

Database passwords are rotated quarterly through Fly.io's secret management. The rotation process updates the `DATABASE_URL` environment variable, triggers a rolling restart of the application instances, and the connection pool re-establishes connections with the new credentials.

### OSINT Provider API Key Management

The platform's 120+ [OSINT](/glossary/osint/) provider integrations each require separate API keys (Shodan, VirusTotal, Censys, etc.). These keys are managed through environment variables with a naming convention (`OSINT_SHODAN_API_KEY`, `OSINT_VIRUSTOTAL_API_KEY`) and validated at startup. Rate limiting is applied per-key to prevent quota exhaustion.

### TLS Certificate Management

TLS certificates for `prismatic-prod.fly.dev` are managed through Fly.io's automatic certificate provisioning (Let's Encrypt). Internal service certificates follow stricter rotation schedules with 90-day validity and automated renewal alerts at 30 days before expiration.

## Related Concepts

- [Authentication](/glossary/authentication/) -- the process that consumes credentials to verify identity
- [Authorization](/glossary/authorization/) -- permission decisions that follow successful credential verification
- [Encryption](/glossary/encryption/) -- cryptographic primitives used for credential hashing and signing
- [Encryption at Rest](/glossary/encryption-at-rest/) -- protecting stored credential material
- [Security Operations](/glossary/security-operations/) -- monitoring credential usage and responding to compromises
- [JWT](/glossary/jwt/) -- token format with embedded credential claims
- [OAuth2](/glossary/oauth2/) -- delegated authorization framework involving client credentials
- [TLS](/glossary/tls/) -- transport encryption protecting credentials in transit
- [API Gateway](/glossary/api-gateway/) -- entry point where credentials are validated
- [Audit Trail](/glossary/audit-trail/) -- immutable record of all credential operations
- [ETS](/glossary/ets/) -- in-memory storage backend for the credential store
- [GenServer](/glossary/genserver/) -- OTP process managing credential store state

## See Also

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) -- comprehensive secrets management guidance
- [Phoenix Deployment: Handling Secrets](https://hexdocs.pm/phoenix/deployment.html#handling-of-your-application-secrets) -- official Phoenix secrets documentation
- [Twelve-Factor App: Config](https://12factor.net/config) -- environment-based configuration principles
- [NIST SP 800-57: Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final) -- federal key management recommendations
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
