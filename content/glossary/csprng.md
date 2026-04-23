+++
title = "CSPRNG"
description = "Cryptographically Secure Pseudo-Random Number Generator -- an algorithm producing random numbers suitable for cryptographic applications where predictability would compromise security."
weight = 50

[extra]
category = "security"
tags = ["csprng", "cryptography", "random", "security", "entropy", "prng", "key-generation", "nonce", "token", "erlang-crypto"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "advanced"
audience = ["security-engineers", "developers", "cryptographers", "architects"]
related_terms = ["hmac-signature", "aes", "entropy", "nonce", "token", "session-id", "key-derivation"]
key_concepts = ["entropy-source", "unpredictability", "backtracking-resistance", "prediction-resistance", "seed"]
platforms = ["beam", "erlang", "elixir", "openssl"]
prerequisites = ["cryptography-fundamentals", "probability-theory", "information-theory"]
use_cases = ["key-generation", "token-creation", "nonce-generation", "session-ids", "salt-generation"]
complexity = "high"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["CSPRNG", "cryptographic", "random", "number generator", "glossary", "security", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "CSPRNG - Prismatic Platform"
+++

## Definition and Overview

A Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) is an algorithm that produces sequences of numbers that are computationally indistinguishable from truly random sequences. Unlike standard pseudo-random number generators (PRNGs) used for simulations or games, CSPRNGs must satisfy stringent security requirements: an adversary who knows the algorithm and has observed arbitrarily many output bits cannot predict the next bit with probability significantly better than 50%.

The distinction between a PRNG and a CSPRNG is critical in security-sensitive applications. A standard PRNG like Mersenne Twister produces statistically well-distributed numbers but is entirely deterministic -- observing 624 consecutive 32-bit outputs allows full state recovery and prediction of all future outputs. A CSPRNG, by contrast, maintains security even against adversaries with substantial computational resources. This property is essential for generating cryptographic keys, session tokens, nonces, and any value whose unpredictability is a security requirement.

Modern CSPRNGs draw initial entropy from hardware sources (CPU thermal noise, interrupt timing jitter, mouse movements) and use cryptographic primitives (block ciphers, hash functions) to stretch this entropy into arbitrary-length output streams. The BEAM virtual machine delegates to OpenSSL's CSPRNG implementation through the `:crypto` module, providing Elixir and Erlang applications with access to operating system entropy pools without requiring custom implementation.

## Technical Deep Dive

CSPRNGs must satisfy three formal security properties that distinguish them from ordinary PRNGs:

| Property | Definition | Consequence of Violation |
|----------|-----------|------------------------|
| **Next-bit unpredictability** | Given k output bits, no polynomial-time algorithm can predict bit k+1 with probability > 1/2 + negligible | Attacker can predict tokens, keys, nonces |
| **Backtracking resistance** | Compromised internal state does not reveal previously generated outputs | Past sessions compromised by current state leak |
| **Prediction resistance** | Compromised internal state does not allow prediction of future outputs after re-seeding | Forward secrecy violated even after state recovery |

### Common CSPRNG Constructions

| Construction | Basis | Used By | Performance |
|-------------|-------|---------|-------------|
| **CTR_DRBG** | AES in counter mode | NIST SP 800-90A, OpenSSL | Fast, hardware-accelerated |
| **HASH_DRBG** | SHA-256/SHA-512 | NIST SP 800-90A | Moderate, widely available |
| **HMAC_DRBG** | HMAC-SHA-256 | NIST SP 800-90A, Java | Moderate, proven security |
| **ChaCha20** | ChaCha20 stream cipher | Linux /dev/urandom, arc4random | Very fast, cache-timing resistant |
| **Fortuna** | AES-256 + SHA-256 | FreeBSD, macOS | Robust entropy management |

### Entropy Sources

The security of any CSPRNG ultimately depends on the quality of its entropy source. Modern systems combine multiple sources:

```
Hardware Sources:
  - CPU RDRAND/RDSEED instructions (Intel, AMD)
  - Thermal noise from hardware components
  - Interrupt timing jitter (keyboard, disk, network)
  - Platform-specific (TPM, HSM)

Software Sources:
  - Process scheduling timing
  - Memory allocation patterns
  - Network packet arrival times
  - User input timing (mouse, keyboard)
```

## Architecture and Implementation

The architecture of a CSPRNG consists of three core components: an entropy accumulator that collects randomness from hardware and software sources, a seed manager that maintains and periodically refreshes the internal state, and an output generator that produces the actual random byte sequences.

The entropy accumulator continuously gathers environmental noise and estimates the accumulated entropy in bits. When sufficient entropy has been collected (typically 256 bits for modern security levels), the seed manager mixes it into the generator's internal state through a cryptographic mixing function. The output generator then uses this state to produce random bytes on demand, typically through a block cipher in counter mode or a hash-based construction.

Re-seeding is a critical operation that prevents catastrophic failure if the internal state is ever compromised. By periodically mixing fresh entropy into the state, a CSPRNG ensures that even a state compromise is transient -- after the next re-seed, the generator's output is once again unpredictable to an adversary who knew the previous state.

## Usage in Prismatic Platform

The Prismatic Platform relies on CSPRNGs for all security-critical random value generation, from API tokens and session identifiers to cryptographic nonces and salts. Elixir's `:crypto.strong_rand_bytes/1` function provides the primary interface to the system CSPRNG.

```elixir
defmodule Prismatic.Security.TokenGenerator do
  @moduledoc """
  Generates cryptographically secure tokens using BEAM's
  :crypto module, which delegates to OpenSSL's CSPRNG.

  All tokens in the platform use this module to ensure
  unpredictability and resistance to brute-force attacks.
  """

  @token_byte_length 32
  @api_key_byte_length 48
  @nonce_byte_length 16

  @spec generate_session_token() :: String.t()
  def generate_session_token do
    @token_byte_length
    |> :crypto.strong_rand_bytes()
    |> Base.url_encode64(padding: false)
  end

  @spec generate_api_key() :: String.t()
  def generate_api_key do
    prefix = "prism_"
    random_part =
      @api_key_byte_length
      |> :crypto.strong_rand_bytes()
      |> Base.url_encode64(padding: false)

    prefix <> random_part
  end

  @spec generate_nonce() :: binary()
  def generate_nonce do
    :crypto.strong_rand_bytes(@nonce_byte_length)
  end

  @spec generate_csrf_token() :: String.t()
  def generate_csrf_token do
    :crypto.strong_rand_bytes(24)
    |> Base.url_encode64(padding: false)
  end

  @doc """
  Generates a time-limited token by combining CSPRNG output
  with a timestamp and HMAC signature.
  """
  @spec generate_timed_token(String.t(), pos_integer()) :: String.t()
  def generate_timed_token(secret_key, ttl_seconds) do
    nonce = :crypto.strong_rand_bytes(@nonce_byte_length)
    expires_at = System.system_time(:second) + ttl_seconds
    payload = <<expires_at::64, nonce::binary>>

    signature =
      :crypto.mac(:hmac, :sha256, secret_key, payload)
      |> binary_part(0, 16)

    Base.url_encode64(payload <> signature, padding: false)
  end
end
```

### Security Considerations in BEAM

| Concern | BEAM Behavior | Mitigation |
|---------|--------------|------------|
| Process isolation | Each process has independent memory | CSPRNG state not shared between processes |
| Hot code upgrade | Module reload during runtime | `:crypto` state persists through upgrades |
| Distribution | Erlang distribution protocol | Tokens generated locally, not transmitted via distribution |
| Memory inspection | Process heap readable via `:erlang.process_info/2` | Generate tokens immediately before use, do not store in process state |

The platform enforces CSPRNG usage through Credo checks that flag usage of `:rand.uniform/1` or `Enum.random/1` in security-sensitive modules. The forbidden patterns enforcement system blocks any use of weak randomness in authentication, session management, or cryptographic code paths.

## Cross-References

- **HMAC Signature** -- Message authentication using keyed hashes
- [CSRF](@/glossary/csrf.md) -- Cross-site request forgery prevention requires CSPRNG tokens
- [AES](@/glossary/aes.md) -- Block cipher used in CTR_DRBG construction
- [Session Management](@/glossary/session.md) -- Session tokens require cryptographic randomness
- **Livebooks**: `security_compliance/` notebooks demonstrate token generation and analysis
- **Academy**: APISecurityAnalysis topic covers secure token practices

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
