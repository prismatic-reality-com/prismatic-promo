+++
title = "AES"
weight = 50
[extra]
description = "Advanced Encryption Standard -- a symmetric block cipher algorithm adopted as a federal standard, providing fast and secure encryption for data at rest and in transit"
category = "security"
related_terms = ["cipher-suite", "tls", "encryption-at-rest", "credential", "authentication", "compliance"]
tags = ["glossary", "aes", "encryption", "cryptography", "security", "symmetric-cipher", "block-cipher", "data-protection", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "AES is the industry-standard symmetric encryption algorithm used throughout the Prismatic Platform for protecting data at rest in ETS/PostgreSQL and securing credentials in configuration"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["AES", "Advanced Encryption Standard", "symmetric encryption", "AES-256", "block cipher", "GCM mode", "CBC mode", "Erlang crypto", "data encryption", "FIPS 197"]
image = "/images/sections/glossary.png"
image_alt = "AES - Prismatic Platform"
word_count = 1010
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

AES (Advanced Encryption Standard) is a symmetric block cipher algorithm standardized by NIST as FIPS 197, selected through an open international competition in 2001 to replace the aging DES standard. AES operates on fixed 128-bit blocks with key sizes of 128, 192, or 256 bits, providing a well-analyzed balance of security strength and computational performance. It is the most widely deployed encryption algorithm in the world, used in everything from TLS connections to disk encryption to database field-level protection.

In the Prismatic Platform, AES-256-GCM is the standard encryption algorithm for protecting sensitive data at rest, encrypting credential stores, and securing inter-service communication payloads.

## Technical Deep Dive

### AES Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Block size** | 128 bits (16 bytes) | Fixed for all key sizes |
| **Key sizes** | 128, 192, 256 bits | Platform standard: 256 |
| **Rounds** | 10 (AES-128), 12 (AES-192), 14 (AES-256) | More rounds = more security |
| **Structure** | Substitution-permutation network | SubBytes, ShiftRows, MixColumns, AddRoundKey |

### Modes of Operation

| Mode | Authentication | Parallelizable | Prismatic Usage |
|------|---------------|----------------|-----------------|
| **GCM** | Yes (AEAD) | Yes | Primary (credentials, API keys) |
| **CBC** | No (needs HMAC) | Decrypt only | Legacy compatibility |
| **CTR** | No (needs HMAC) | Yes | Streaming encryption |
| **CCM** | Yes (AEAD) | No | Not used |

### Why AES-256-GCM

GCM (Galois/Counter Mode) provides Authenticated Encryption with Associated Data (AEAD), meaning it simultaneously provides confidentiality AND integrity verification. A single operation encrypts the data and produces an authentication tag that detects any tampering. This eliminates an entire class of vulnerabilities (padding oracle attacks, ciphertext manipulation) that affect non-authenticated modes.

## Architecture and Implementation

### Erlang :crypto Integration

```elixir
defmodule PrismaticSecurity.Encryption do
  @moduledoc """
  AES-256-GCM encryption module for the Prismatic Platform.
  Uses Erlang's :crypto module backed by OpenSSL for
  hardware-accelerated AES operations via AES-NI instructions.
  """

  @aad "PrismaticPlatform-v1"
  @iv_size 12
  @tag_size 16

  @type ciphertext :: binary()
  @type encryption_error :: :encryption_failed | :invalid_key

  @spec encrypt(binary(), binary()) :: {:ok, ciphertext()} | {:error, encryption_error()}
  def encrypt(plaintext, key) when byte_size(key) == 32 do
    iv = :crypto.strong_rand_bytes(@iv_size)

    {ciphertext, tag} =
      :crypto.crypto_one_time_aead(
        :aes_256_gcm,
        key,
        iv,
        plaintext,
        @aad,
        @tag_size,
        true
      )

    {:ok, iv <> tag <> ciphertext}
  rescue
    _ -> {:error, :encryption_failed}
  end

  def encrypt(_plaintext, _key), do: {:error, :invalid_key}

  @spec decrypt(ciphertext(), binary()) :: {:ok, binary()} | {:error, :decryption_failed}
  def decrypt(<<iv::binary-size(@iv_size), tag::binary-size(@tag_size), ciphertext::binary>>, key)
      when byte_size(key) == 32 do
    case :crypto.crypto_one_time_aead(
           :aes_256_gcm,
           key,
           iv,
           ciphertext,
           @aad,
           tag,
           false
         ) do
      plaintext when is_binary(plaintext) -> {:ok, plaintext}
      :error -> {:error, :decryption_failed}
    end
  rescue
    _ -> {:error, :decryption_failed}
  end

  def decrypt(_data, _key), do: {:error, :decryption_failed}
end
```

## Usage in Prismatic Platform

- **Credential Storage**: API keys and tokens encrypted at rest with AES-256-GCM in PostgreSQL
- **Configuration Encryption**: Sensitive configuration values encrypted before storage
- **Session Data**: Phoenix session cookies use AES encryption via Plug.Crypto
- **OSINT Credentials**: Third-party API credentials for OSINT tools encrypted in the key store
- **Backup Encryption**: Database backups encrypted with AES-256-GCM before offsite storage
- **Inter-Service Payloads**: Sensitive data payloads encrypted when crossing service boundaries

## Code Examples

### Credential Store with AES Encryption

```elixir
defmodule PrismaticSecurity.CredentialStore do
  @moduledoc """
  Encrypted credential store backed by ETS with AES-256-GCM.
  Keys are derived from the application master key using HKDF.
  """

  alias PrismaticSecurity.Encryption

  @spec store_credential(String.t(), String.t()) :: :ok | {:error, term()}
  def store_credential(credential_id, secret_value) do
    key = derive_key(credential_id)

    case Encryption.encrypt(secret_value, key) do
      {:ok, encrypted} ->
        :ets.insert(:credential_store, {credential_id, encrypted})
        :ok

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec retrieve_credential(String.t()) :: {:ok, String.t()} | {:error, term()}
  def retrieve_credential(credential_id) do
    key = derive_key(credential_id)

    case :ets.lookup(:credential_store, credential_id) do
      [{^credential_id, encrypted}] -> Encryption.decrypt(encrypted, key)
      [] -> {:error, :not_found}
    end
  end

  @spec derive_key(String.t()) :: binary()
  defp derive_key(context) do
    master_key = Application.fetch_env!(:prismatic_security, :master_key)
    :crypto.mac(:hmac, :sha256, master_key, "credential:" <> context)
  end
end
```

## Best Practices

1. **Always use AES-256-GCM (AEAD)**: Never use ECB mode. Always prefer authenticated encryption to prevent ciphertext tampering.

2. **Never reuse initialization vectors**: Each encryption operation must use a unique, cryptographically random IV. IV reuse with GCM is catastrophic -- it reveals the authentication key.

3. **Derive keys with HKDF or PBKDF2**: Never use raw passwords as AES keys. Use proper key derivation functions.

4. **Rotate encryption keys regularly**: Implement key rotation with support for multiple active key versions during transition periods.

5. **Use hardware acceleration**: Ensure your deployment targets support AES-NI instructions for optimal performance. BEAM/OTP's :crypto module uses OpenSSL which automatically leverages AES-NI.

6. **Protect keys separately from ciphertext**: The encryption key must never be stored alongside the encrypted data. Use environment variables, HSMs, or dedicated key management services.

## Related Terms

- **Cipher Suite** -- protocol negotiation including AES selection
- **Credential** -- secrets protected by AES encryption
- **Compliance** -- regulatory requirements for encryption standards

## See Also

- [NIST FIPS 197: AES Standard](https://csrc.nist.gov/publications/detail/fips/197/final) -- official specification
- [Erlang :crypto Module](https://www.erlang.org/doc/man/crypto.html) -- BEAM cryptographic primitives
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
