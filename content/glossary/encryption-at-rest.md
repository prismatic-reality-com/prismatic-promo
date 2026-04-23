+++
title = "Encryption at Rest"
weight = 45
[extra]
category = "security"
description = "Protecting stored data by encrypting it on disk so unauthorized access yields only ciphertext"
related_terms = ["tls", "postgresql", "rbac", "jwt", "easm", "plug"]
tier = "TIER_1"
domain = "cryptography"
complexity = "advanced"
audience = ["security-engineers", "backend-developers", "architects", "compliance-officers"]
maturity = "production"
standard_algorithm = "AES-256-GCM"
key_management = "hierarchical"
compliance_relevance = ["gdpr", "nis2", "zkb", "iso-27001", "soc2", "pci-dss"]
prismatic_integration = "cloak-ecto"
platform_modules = ["prismatic_storage_core", "prismatic_storage_ecto", "prismatic_perimeter"]
encryption_library = "cloak"
key_hierarchy = "root-kek-dek"
performance_impact = "1-5% CPU with AES-NI"
enforcement_level = "mandatory"
data_classification = ["critical", "high", "medium", "low"]
keywords = ["encryption", "AES-256-GCM", "Cloak", "field-level encryption", "key management", "data protection", "AEAD", "cryptography"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1915
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "security", "encryption-at-rest", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Encryption at Rest - Prismatic Platform"
+++

## Definition

Encryption at rest is the practice of protecting stored data by encrypting it before writing to persistent storage -- databases, file systems, backups, and archives. When properly implemented, even if an attacker gains physical access to storage media, database files, or backup tapes, they obtain only ciphertext that is computationally infeasible to decrypt without the corresponding encryption keys. This protection layer is distinct from and complementary to [TLS](@/glossary/tls.md) (encryption in transit), which protects data as it moves across networks.

Encryption at rest operates transparently to application logic in most implementations: the application reads and writes plaintext data, while the encryption and decryption operations occur at a layer below -- the database engine, file system driver, or application middleware. This transparency is critical for adoption because it means that existing business logic does not need modification to benefit from encryption protection. The application interacts with data in its natural form; the encryption layer handles the cryptographic operations invisibly.

The practice is a fundamental security control required by virtually every modern compliance framework. GDPR mandates "appropriate technical measures" for personal data protection (Article 32), [NIS2](@/glossary/nis2.md) requires "encryption" as a cybersecurity risk-management measure (Article 21), [ISO 27001](@/glossary/iso-27001.md) specifies cryptographic controls (Annex A.10), and SOC 2 Trust Services Criteria require encryption for data at rest. For platforms handling sensitive intelligence data, encryption at rest is not optional -- it is a baseline requirement that forms part of the minimum security posture expected by regulators, customers, and security-conscious stakeholders.

## Encryption Algorithms

The choice of encryption algorithm determines the security strength, performance characteristics, and operational complexity of an encryption-at-rest implementation. Modern implementations overwhelmingly favor Authenticated Encryption with Associated Data (AEAD) algorithms that provide both confidentiality and integrity in a single operation:

| Algorithm | Type | Key Size | Mode | Performance | Status |
|-----------|------|----------|------|-------------|--------|
| **AES-256-GCM** | Symmetric block cipher | 256-bit | AEAD | High (hardware-accelerated) | Recommended |
| **AES-256-CBC** | Symmetric block cipher | 256-bit | Block | High | Acceptable (legacy) |
| **AES-128-GCM** | Symmetric block cipher | 128-bit | AEAD | Very high | Acceptable |
| **ChaCha20-Poly1305** | Symmetric stream cipher | 256-bit | AEAD | High (no AES-NI needed) | Recommended (mobile/ARM) |
| **XChaCha20-Poly1305** | Symmetric stream cipher | 256-bit | AEAD | High | Recommended (extended nonce) |

AES-256-GCM (Galois/Counter Mode) is the industry standard for encryption at rest. GCM is an Authenticated Encryption with Associated Data (AEAD) mode, meaning it provides both confidentiality (the data is encrypted) and integrity (any tampering is detected). Unlike CBC mode, GCM does not require separate integrity verification and is resistant to padding oracle attacks. The authentication tag produced by GCM ensures that any modification to the ciphertext, IV, or associated data is detected during decryption, preventing bit-flipping attacks that plague unauthenticated encryption modes.

Modern processors include AES-NI (Advanced Encryption Standard New Instructions) hardware acceleration, making AES-GCM operations effectively free from a performance perspective -- encryption and decryption operate at memory bandwidth speeds rather than being CPU-bound. On systems without AES-NI (some ARM processors, older hardware), ChaCha20-Poly1305 provides equivalent security with better software-only performance. The Prismatic Platform uses AES-256-GCM as its primary encryption algorithm, leveraging Erlang's `:crypto` module which interfaces directly with OpenSSL's AES-NI-accelerated implementation.

## Key Management

Key management is widely considered the most challenging aspect of encryption at rest. The encryption algorithm may be unbreakable, but if the keys are poorly managed, the entire scheme collapses. A system that encrypts data with AES-256-GCM but stores the encryption key alongside the encrypted data provides no meaningful protection -- an attacker who accesses the storage also accesses the key.

| Concern | Description | Best Practice |
|---------|-------------|---------------|
| **Key generation** | Keys must be cryptographically random | Use OS CSPRNG (`/dev/urandom`, `:crypto.strong_rand_bytes/1`) |
| **Key storage** | Keys must be stored separately from encrypted data | Hardware Security Module (HSM) or dedicated key vault |
| **Key hierarchy** | Multiple layers prevent single-key compromise | Data Encryption Key (DEK) wrapped by Key Encryption Key (KEK) |
| **Key rotation** | Periodic key replacement limits exposure | Rotate KEK quarterly, re-encrypt DEKs automatically |
| **Key backup** | Recovery must be possible without compromising security | Encrypted key escrow with split knowledge |
| **Key destruction** | Retired keys must be securely destroyed | Cryptographic erasure, verified destruction |

### Key Hierarchy Architecture

A properly designed key management system uses a hierarchical structure that separates key duties and minimizes the blast radius of any single key compromise:

```
Root Key (HSM / Hardware-Protected)
    |
    +-- Key Encryption Key (KEK) [per environment]
            |
            +-- Data Encryption Key (DEK) [per table/field]
            |       |
            |       +-- Encrypted Data (ciphertext)
            |
            +-- Data Encryption Key (DEK) [per table/field]
                    |
                    +-- Encrypted Data (ciphertext)
```

The root key never leaves the HSM. The KEK encrypts the DEKs, and the DEKs encrypt the actual data. This hierarchy means that key rotation at the KEK level only requires re-encrypting the DEKs (small), not re-encrypting all data (potentially massive). This design principle is fundamental to operationally sustainable encryption -- without it, key rotation becomes prohibitively expensive for large datasets.

```elixir
defmodule Prismatic.KeyManagement.Hierarchy do
  @moduledoc """
  Implements hierarchical key management for encryption at rest.
  Root -> KEK -> DEK architecture ensures that key rotation
  does not require re-encryption of all stored data.
  """

  @type key_level :: :root | :kek | :dek
  @type wrapped_key :: %{
    ciphertext: binary(),
    iv: binary(),
    tag: binary(),
    wrapped_by: key_level()
  }

  @spec generate_dek() :: {:ok, binary()} | {:error, term()}
  def generate_dek do
    case :crypto.strong_rand_bytes(32) do
      key when is_binary(key) and byte_size(key) == 32 ->
        {:ok, key}

      _ ->
        {:error, :key_generation_failed}
    end
  end

  @spec wrap_dek(binary(), binary()) :: {:ok, wrapped_key()} | {:error, term()}
  def wrap_dek(dek, kek) do
    iv = :crypto.strong_rand_bytes(12)

    case :crypto.crypto_one_time_aead(:aes_256_gcm, kek, iv, dek, <<>>, true) do
      {ciphertext, tag} ->
        {:ok, %{ciphertext: ciphertext, iv: iv, tag: tag, wrapped_by: :kek}}

      _ ->
        {:error, :wrapping_failed}
    end
  end

  @spec unwrap_dek(wrapped_key(), binary()) :: {:ok, binary()} | {:error, :decryption_failed}
  def unwrap_dek(%{ciphertext: ct, iv: iv, tag: tag}, kek) do
    case :crypto.crypto_one_time_aead(:aes_256_gcm, kek, iv, ct, <<>>, tag, false) do
      dek when is_binary(dek) -> {:ok, dek}
      :error -> {:error, :decryption_failed}
    end
  end
end
```

## Encryption Levels

Encryption at rest can be implemented at multiple levels, each with different trade-offs between granularity, performance, and operational complexity:

| Level | Granularity | Performance Impact | Key Management Complexity | Protection Scope |
|-------|-------------|-------------------|--------------------------|-----------------|
| **Full Disk Encryption** | Entire disk/volume | Minimal (hardware) | Low | Physical theft, decommissioned drives |
| **File System Encryption** | Per-file or per-directory | Low | Medium | Unauthorized file access |
| **Database-Level (TDE)** | Entire database | Low | Medium | Database file theft, backup theft |
| **Table-Level** | Per-table | Low-medium | Medium-high | Per-table access control |
| **Column/Field-Level** | Per-column or per-field | Medium | High | Fine-grained data protection |
| **Application-Level** | Per-value | Variable | Highest | Maximum control, searchable encryption |

For platforms handling mixed-sensitivity data, the recommended approach is layered encryption: full disk encryption as a baseline, database-level TDE for defense in depth, and field-level encryption for the most sensitive data (PII, credentials, API keys, OSINT intelligence). This layered approach ensures that even if one encryption boundary is compromised, the most sensitive data retains its own independent protection.

## Elixir Libraries for Encryption

The Elixir ecosystem provides several libraries for implementing encryption at rest, each addressing different levels of the encryption stack:

| Library | Purpose | Approach | Prismatic Usage |
|---------|---------|----------|-----------------|
| **Cloak** | Ecto field encryption | Transparent encryption/decryption on schema fields | Primary encryption library |
| **Cloak.Ecto** | Cloak + Ecto integration | Custom Ecto types that auto-encrypt/decrypt | Field-level encryption for PII |
| **ExCrypto** | Low-level crypto wrapper | Erlang `:crypto` with Elixir ergonomics | Custom encryption operations |
| **Vault** | HashiCorp Vault client | External key management and transit encryption | Production key management |

```elixir
# Cloak configuration for field-level encryption
# config/config.exs
config :prismatic, Prismatic.Vault,
  ciphers: [
    default: {
      Cloak.Ciphers.AES.GCM,
      tag: "AES.GCM.V1",
      key: Base.decode64!(System.get_env("CLOAK_KEY")),
      iv_length: 12
    }
  ]

# Encrypted Ecto schema
defmodule Prismatic.Credentials.APIKey do
  @moduledoc """
  Schema for storing API keys with field-level encryption.
  The key_value field is encrypted at rest using Cloak AES-256-GCM.
  The key_hash field provides searchability without decryption.
  """
  use Ecto.Schema

  schema "api_keys" do
    field :provider, :string
    field :key_value, Prismatic.Encrypted.Binary    # Encrypted at rest
    field :key_hash, Cloak.Ecto.SHA256              # Searchable hash
    field :last_used_at, :utc_datetime_usec
    field :expires_at, :utc_datetime_usec

    belongs_to :user, Prismatic.Accounts.User
    timestamps(type: :utc_datetime_usec)
  end
end

# Custom encrypted type
defmodule Prismatic.Encrypted.Binary do
  @moduledoc """
  Cloak-backed encrypted binary type for Ecto schemas.
  Automatically encrypts on write and decrypts on read.
  """
  use Cloak.Ecto.Binary, vault: Prismatic.Vault
end
```

## Context in Prismatic

The Prismatic Platform implements encryption at rest across multiple data categories, with each category receiving an appropriate encryption level based on sensitivity classification:

| Data Category | Sensitivity | Encryption Level | Algorithm | Key Rotation |
|--------------|-------------|-----------------|-----------|-------------|
| **User credentials** | Critical | Field-level (Cloak) | AES-256-GCM | 90 days |
| **API keys** | Critical | Field-level (Cloak) | AES-256-GCM | 90 days |
| **OSINT intelligence** | High | Field-level (Cloak) | AES-256-GCM | 180 days |
| **PII (names, emails)** | High | Field-level (Cloak) | AES-256-GCM | 180 days |
| **Session data** | Medium | Database TDE | AES-256 | 365 days |
| **Audit logs** | Medium | Database TDE | AES-256 | 365 days |
| **Configuration** | Low | Full disk encryption | Platform-provided | Platform-managed |
| **Database backups** | Critical | Backup encryption | AES-256-GCM | Per-backup key |

The platform uses [PostgreSQL](@/glossary/postgresql.md) as its primary data store, with Cloak.Ecto providing transparent field-level encryption. Encrypted fields use custom [Ecto](@/glossary/ecto.md) types that automatically encrypt on write and decrypt on read, making encryption invisible to business logic. Searchable encrypted fields use SHA-256 hashes stored alongside the ciphertext, enabling exact-match lookups without decryption.

For the Prismatic Perimeter [EASM](@/glossary/easm.md) module, discovered asset data containing IP addresses, hostnames, and service banners is encrypted at the field level before storage. This protects sensitive reconnaissance data from unauthorized access, even by database administrators who have access to the underlying PostgreSQL instance.

```elixir
defmodule Prismatic.Accounts.User do
  @moduledoc """
  User schema with field-level encryption for PII fields.
  Email and name are encrypted at rest; email_hash enables
  efficient lookup without decryption.
  """
  use Ecto.Schema

  schema "users" do
    field :email, Prismatic.Encrypted.Binary         # Encrypted value
    field :email_hash, Cloak.Ecto.SHA256             # Searchable hash
    field :name, Prismatic.Encrypted.Binary           # Encrypted value
    field :roles, {:array, :string}                   # Not encrypted (needed for queries)
    field :provider, :string                          # Not encrypted (non-sensitive)

    timestamps(type: :utc_datetime_usec)
  end

  @spec get_by_email(String.t()) :: {:ok, t()} | {:error, :not_found}
  def get_by_email(email) do
    email_hash = Cloak.Ecto.SHA256.hash(email)

    case from(u in __MODULE__, where: u.email_hash == ^email_hash) |> Repo.one() do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end
end
```

## Key Rotation Strategy

Key rotation is essential for limiting the window of exposure if a key is compromised. The Prismatic Platform implements a multi-phase rotation strategy:

```elixir
defmodule Prismatic.KeyManagement.Rotation do
  @moduledoc """
  Manages key rotation for encryption at rest.
  Supports rolling rotation where old ciphertexts are re-encrypted
  with new keys during normal read operations (lazy migration).
  """

  @spec rotate_cipher(atom(), map()) :: {:ok, map()} | {:error, term()}
  def rotate_cipher(vault_module, new_cipher_config) do
    with {:ok, _} <- validate_cipher_config(new_cipher_config),
         {:ok, _} <- register_new_cipher(vault_module, new_cipher_config),
         {:ok, stats} <- schedule_lazy_migration(vault_module) do
      {:ok, %{
        new_cipher: new_cipher_config.tag,
        records_pending: stats.total_records,
        estimated_completion: stats.estimated_time
      }}
    end
  end

  @spec migrate_record(module(), map()) :: {:ok, map()} | {:error, term()}
  def migrate_record(schema_module, record) do
    encrypted_fields = Cloak.Ecto.encrypted_fields(schema_module)

    changeset =
      Enum.reduce(encrypted_fields, Ecto.Changeset.change(record), fn field, cs ->
        current_value = Map.get(record, field)
        Ecto.Changeset.force_change(cs, field, current_value)
      end)

    case Repo.update(changeset) do
      {:ok, updated} -> {:ok, updated}
      {:error, changeset} -> {:error, {:migration_failed, changeset}}
    end
  end
end
```

The rotation strategy uses three phases:

| Phase | Action | Duration | Impact |
|-------|--------|----------|--------|
| **Phase 1: Add New Key** | New cipher added to vault, becomes default for writes | Immediate | Zero downtime |
| **Phase 2: Lazy Migration** | Reads decrypt with old key, re-encrypt with new key on write | Days-weeks | Zero downtime |
| **Phase 3: Retire Old Key** | Old cipher removed after all records migrated | After Phase 2 complete | Verify all migrated first |

## Compliance Requirements

Encryption at rest is mandated or strongly recommended by all major compliance frameworks relevant to the Prismatic Platform:

| Framework | Requirement | Article/Section | Enforcement |
|-----------|-------------|-----------------|-------------|
| **GDPR** | "Appropriate technical measures" including encryption | Article 32(1)(a) | Mandatory for personal data |
| **[NIS2](@/glossary/nis2.md)** | "Policies on the use of cryptography and encryption" | Article 21(2)(h) | Mandatory for essential entities |
| **ZKB 264/2025** | Data protection through cryptographic controls | Section 4.3 | Mandatory for Czech critical infrastructure |
| **[ISO 27001](@/glossary/iso-27001.md)** | Cryptographic controls policy and key management | A.10.1.1, A.10.1.2 | Required for certification |
| **SOC 2** | Encryption of sensitive information at rest | CC6.1, CC6.7 | Required for Type II report |
| **PCI DSS** | Encrypt stored cardholder data | Requirement 3 | Mandatory for payment data |

The Prismatic Perimeter EASM module assesses whether discovered assets implement encryption at rest as part of compliance scoring. Assets without encryption at rest receive significant penalty deductions in NIS2 and ZKB compliance assessments, directly impacting the organization's security rating grade.

## Performance Considerations

| Factor | Impact | Mitigation |
|--------|--------|------------|
| **Encryption overhead** | 1-5% CPU for AES-GCM with AES-NI | Hardware acceleration (AES-NI) |
| **Key lookup latency** | Microseconds per field for cached DEKs | ETS-cached DEK lookup |
| **Searchability loss** | Encrypted fields cannot be indexed or queried | Hash columns for exact match |
| **Sorting limitation** | Encrypted fields cannot be sorted | Maintain plaintext sort columns for non-sensitive data |
| **Range query loss** | Encrypted fields defeat range indexes | Order-preserving encryption (OPE) for specific cases |
| **Backup size** | Encrypted data may be slightly larger (IV + tag) | Negligible for GCM (28 bytes per field) |
| **Memory overhead** | Decrypted values held in process memory | Short-lived process patterns, avoid caching plaintext |

## Best Practices

**Encrypt at the Right Level**: Not all data requires field-level encryption. Use field-level encryption for PII, credentials, and intelligence data. Use database-level TDE for general data protection. Use full disk encryption as a baseline. Over-encrypting creates unnecessary complexity and performance overhead.

**Never Store Keys with Data**: The encryption key must be stored in a separate system from the encrypted data. If both are on the same disk, physical access compromises everything. Use environment variables, vault services, or HSMs for key storage.

**Use AEAD Algorithms**: Always prefer authenticated encryption (GCM, Poly1305) over unauthenticated modes (CBC, CTR). AEAD prevents ciphertext tampering that unauthenticated modes cannot detect.

**Implement Key Rotation**: Design for key rotation from the start. Cloak's multi-cipher support enables rolling key rotation without downtime. Schedule rotation before keys expire, and verify all records are migrated before retiring old keys.

**Test Encryption in Development**: Use the same encryption configuration in development and production. This catches integration issues early and ensures that development data patterns match production behavior.

**Monitor Key Operations**: Log all key management operations (generation, rotation, destruction) in the [audit trail](@/glossary/audit-trail.md). Key management events are critical security signals that should trigger alerts if unexpected.

## Common Pitfalls

**Encrypting Everything**: Encrypting fields that do not contain sensitive data adds complexity and performance overhead without security benefit. Classify data by sensitivity and encrypt only what needs protection.

**Forgetting Backups**: Encrypted databases are only protected if backups are also encrypted. An unencrypted backup of an encrypted database exposes the plaintext data. Ensure backup encryption uses independent keys.

**Losing Keys**: If encryption keys are lost and no backup exists, the encrypted data is permanently irrecoverable. Implement secure key backup and recovery procedures, tested regularly.

**Static IV/Nonce**: Reusing the same initialization vector with the same key in GCM mode completely breaks the security guarantee. Always generate a fresh random IV for every encryption operation.

## Related Terms

- [TLS](@/glossary/tls.md) - Complementary encryption for data in transit
- [PostgreSQL](@/glossary/postgresql.md) - Primary data store implementing column-level encryption
- [RBAC](@/glossary/rbac.md) - Access control complementing encryption for defense in depth
- [JWT](@/glossary/jwt.md) - Token storage requires encryption of signing keys at rest
- [EASM](@/glossary/easm.md) - Assesses encryption at rest in compliance scoring
- [API Gateway](@/glossary/api-gateway.md) - Protects encrypted data endpoints
- [Plug](@/glossary/plug.md) - Middleware handling encryption context in request pipeline
- [Observability](@/glossary/observability.md) - Monitoring encryption key rotation and failures
- [Risk Score](@/glossary/risk-score.md) - Missing encryption at rest impacts risk calculations
- [Ecto](@/glossary/ecto.md) - ORM integration through Cloak.Ecto for transparent encryption
- [OWASP](@/glossary/owasp.md) - A02 Cryptographic Failures addressed by encryption at rest

## See Also

- [Architecture](@/architecture/_index.md) - Storage security architecture
- [Apps](@/apps/_index.md) - Prismatic storage applications
- [Technologies](@/technologies/_index.md) - Cloak, ExCrypto, and cryptographic libraries

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
