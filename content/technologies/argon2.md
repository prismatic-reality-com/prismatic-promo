+++
title = "Argon2"
weight = 81
[extra]
category = "security"
description = "Memory-hard password hashing algorithm providing defense against GPU and ASIC-based cracking attacks"
url = "https://hexdocs.pm/argon2_elixir/"
version = "4.0+"
icon = "argon2"
color = "rose"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1025
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Argon2", "Memory-hard", "ASIC-based", "technologies", "security", "Prismatic Platform", "Acceptable", "Good"]
tags = ["technologies", "security", "argon2", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Argon2 - Prismatic Platform"
+++

## Overview

Argon2 is the password hashing algorithm used in the Prismatic Platform for secure credential storage. Winner of the Password Hashing Competition (PHC) in 2015, Argon2 is specifically designed to be resistant to GPU and ASIC-based cracking attacks by requiring significant memory in addition to CPU time -- making parallel cracking attempts prohibitively expensive. This memory-hardness property is what distinguishes Argon2 from older algorithms like bcrypt and scrypt, which are primarily CPU-bound and increasingly vulnerable to specialized hardware attacks.

The Prismatic Platform uses Argon2id (the hybrid variant) for all password hashing operations. This variant combines Argon2i's resistance to side-channel attacks with Argon2d's resistance to GPU cracking, providing the best overall security profile for credential storage. The platform's authentication system never stores plain-text passwords -- all credentials are hashed with Argon2id before storage in [PostgreSQL](@/technologies/postgresql.md), and verification occurs by rehashing the provided password and comparing the result.

Argon2's configurable parameters (memory, iterations, parallelism) allow the platform to tune the hashing cost to balance security and user experience, targeting a hash time of approximately 500ms on production hardware. This deliberate slowness is a feature, not a bug -- it ensures that even if the password database is compromised, attackers face an enormous computational cost to crack individual passwords. The platform implements automatic parameter upgrades so that as hardware improves, existing password hashes are transparently rehashed with stronger parameters during the next successful login.

## Key Features

Argon2 provides a comprehensive set of security properties that make it the current gold standard for password hashing in production systems.

- **Memory-Hard**: Requires configurable memory (64MB+ per hash by default) making GPU/ASIC parallelism expensive
- **Time-Hard**: Configurable iteration count for CPU cost tuning, scaling with Moore's Law over time
- **Parallelism**: Multi-threaded hashing with configurable lane count for optimal utilization of modern CPUs
- **Side-Channel Resistant**: Argon2id variant resists timing attacks through data-independent memory access patterns
- **Salt Generation**: Automatic cryptographic salt generation ensuring identical passwords produce different hashes
- **PHC Winner**: Peer-reviewed, competition-winning algorithm vetted by the international cryptographic community
- **Parameter Encoding**: Hash output self-describes its parameters, enabling transparent parameter upgrades
- **OWASP Recommended**: Designated as the primary choice for password hashing in OWASP guidelines

| Property | Argon2id | bcrypt | scrypt | PBKDF2 |
|----------|----------|--------|--------|--------|
| Memory-hardness | Yes (configurable) | No | Yes (configurable) | No |
| Side-channel resistance | Yes (hybrid) | Partial | No | No |
| GPU resistance | Strong | Moderate | Strong | Weak |
| ASIC resistance | Strong | Moderate | Moderate | Weak |
| PHC winner | Yes | No (predates PHC) | No | No |
| OWASP primary choice | Yes | Acceptable | Acceptable | Acceptable |
| Parameter self-encoding | Yes | Yes | Varies | Varies |

## Platform Integration

Argon2 secures all credential storage in the platform through a dedicated password module that encapsulates hashing, verification, and parameter management. The module is used by the authentication system in [prismatic_web](@/apps/prismatic-web.md) and any service that handles user credentials.

```elixir
defmodule PrismaticWeb.Auth.Password do
  @moduledoc """
  Argon2id password hashing with automatic parameter upgrades.
  All credential storage in the platform flows through this module.
  """

  @doc "Hash a password with Argon2id using platform-standard parameters"
  @spec hash(String.t()) :: String.t()
  def hash(password) do
    Argon2.hash_pwd_salt(password,
      t_cost: 3,         # 3 iterations
      m_cost: 16,        # 64MB memory (2^16 KB)
      parallelism: 4     # 4 threads
    )
  end

  @doc "Verify a password against its stored hash"
  @spec verify(String.t(), String.t()) :: boolean()
  def verify(password, hash) do
    Argon2.verify_pass(password, hash)
  end

  @doc "Check if a hash needs rehashing due to parameter upgrade"
  @spec needs_rehash?(String.t()) :: boolean()
  def needs_rehash?(hash) do
    Argon2.needs_rehash?(hash, t_cost: 3, m_cost: 16)
  end

  @doc "Perform no-op hash to prevent timing attacks on invalid usernames"
  @spec no_user_verify() :: false
  def no_user_verify do
    Argon2.no_user_verify()
  end
end
```

The authentication pipeline transparently upgrades password hashes when parameters change:

```elixir
defmodule PrismaticWeb.Auth.Session do
  @moduledoc "Session authentication with transparent Argon2 parameter upgrades."

  alias PrismaticWeb.Auth.Password
  alias PrismaticStorage.Repo
  alias PrismaticWeb.Schema.User

  @spec authenticate(String.t(), String.t()) :: {:ok, User.t()} | {:error, :invalid_credentials}
  def authenticate(email, password) do
    case Repo.get_by(User, email: email) do
      nil ->
        Password.no_user_verify()
        {:error, :invalid_credentials}

      user ->
        if Password.verify(password, user.hashed_password) do
          maybe_rehash(user, password)
          {:ok, user}
        else
          {:error, :invalid_credentials}
        end
    end
  end

  defp maybe_rehash(user, password) do
    if Password.needs_rehash?(user.hashed_password) do
      user
      |> Ecto.Changeset.change(hashed_password: Password.hash(password))
      |> Repo.update()
    end
  end
end
```

## Architecture

Argon2 sits at the security foundation layer of the platform's authentication architecture. It is the last line of defense protecting user credentials in the event of a database compromise.

| Layer | Component | Protection |
|-------|-----------|------------|
| Transport | SSL/TLS | Encryption in transit |
| Application | Rate Limiting | Brute-force prevention |
| Session | JOSE/JWT | Stateless authentication tokens |
| Credential | **Argon2id** | **Password hashing at rest** |
| Storage | [PostgreSQL](@/technologies/postgresql.md) | Encrypted storage backend |

The platform's defense-in-depth strategy means Argon2 is never the only protection mechanism, but it is the critical one that protects credentials even when all other layers have been compromised. The authentication flow ensures that plaintext passwords exist in memory only for the duration of the hash comparison and are never logged, cached, or transmitted after initial receipt.

## Performance Characteristics

Argon2's deliberate computational cost is tuned to balance user experience with security. The platform's parameters target specific performance characteristics on production hardware.

| Parameter | Value | Effect |
|-----------|-------|--------|
| `t_cost` (iterations) | 3 | CPU time per hash |
| `m_cost` (memory) | 16 (64MB) | Memory per hash operation |
| `parallelism` | 4 | Threads per hash |
| **Hash time** | **~500ms** | **Deliberate slowness for security** |
| Salt length | 16 bytes | Automatic random generation |
| Output length | 32 bytes | Hash digest size |

The 500ms target means that even a modest password database of 100,000 users would require approximately 14 hours of continuous single-threaded computation to attempt one password per account. With the memory requirement, an attacker cannot simply parallelize across thousands of GPU cores as each hash requires 64MB of dedicated memory.

## Configuration

Argon2 is configured through the application environment with parameters that can be adjusted per deployment environment. Test environments use reduced parameters for faster test execution.

```elixir
# config/config.exs - Production parameters
config :argon2_elixir,
  t_cost: 3,
  m_cost: 16,
  parallelism: 4,
  argon2_type: 2  # Argon2id

# config/test.exs - Reduced parameters for test speed
config :argon2_elixir,
  t_cost: 1,
  m_cost: 10,      # 1MB instead of 64MB
  parallelism: 1,
  argon2_type: 2
```

## Best Practices

The platform enforces strict security practices for password handling that extend beyond the hashing algorithm itself.

- **Always use Argon2id** -- never Argon2i or Argon2d in isolation; the hybrid variant provides the strongest security profile
- **Call `no_user_verify/0`** when a username is not found to prevent timing-based user enumeration attacks
- **Implement automatic rehashing** -- check `needs_rehash?/1` on every successful login to transparently upgrade parameters
- **Use reduced parameters in test environments** -- full production parameters make test suites unacceptably slow
- **Never log passwords** -- ensure no logging middleware captures request bodies containing credentials
- **Monitor hash times** -- if production hash times drop significantly below target, parameters should be increased
- **Store full hash strings** -- Argon2's output includes algorithm, version, parameters, salt, and hash; store the complete string
- **Review parameters annually** -- as hardware improves, increase `t_cost` and `m_cost` to maintain the target hash time

## Comparison

The platform chose Argon2id over other password hashing algorithms based on a comprehensive security analysis aligned with OWASP and NIST recommendations.

| Criterion | Argon2id | bcrypt | scrypt | PBKDF2-SHA256 |
|-----------|----------|--------|--------|---------------|
| Year introduced | 2015 | 1999 | 2009 | 2000 |
| Memory usage per hash | 64MB (configurable) | 4KB (fixed) | Configurable | Negligible |
| GPU resistance | Excellent | Good | Good | Poor |
| ASIC resistance | Excellent | Moderate | Good | Poor |
| Side-channel resistance | Excellent (hybrid) | Good | Poor | Good |
| Parameter flexibility | 3 independent knobs | 1 (cost factor) | 3 knobs | 2 knobs |
| OWASP recommendation | Primary choice | Acceptable | Acceptable | Acceptable |
| Elixir library maturity | Mature (argon2_elixir) | Mature (bcrypt_elixir) | Limited | Built-in (Plug.Crypto) |

## Related Technologies

- [PostgreSQL](@/technologies/postgresql.md) - Credential storage backend where hashed passwords are persisted
- [Phoenix Framework](@/technologies/phoenix.md) - Web framework providing the authentication endpoints
- [Elixir](@/technologies/elixir.md) - Runtime environment through the argon2_elixir NIF binding
- [BEAM](@/technologies/beam.md) - Virtual machine that manages the NIF thread pool for Argon2 operations
- [Docker](@/technologies/docker.md) - Container environment where Argon2 NIF libraries must be compiled

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - User authentication and session management
- [prismatic_auth](@/apps/prismatic-auth.md) - Authentication module housing the password hashing logic
- [prismatic_safety](@/apps/prismatic-safety.md) - Security audit monitoring of authentication operations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)