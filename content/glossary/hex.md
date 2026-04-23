+++
title = "Hex"
weight = 12
[extra]
category = "infrastructure"
description = "Package manager for the Erlang/Elixir ecosystem providing dependency resolution, publishing, and package hosting."
related_terms = ["mix", "ecto", "phoenix", "beam", "broadway", "openapi", "docker", "release", "dialyzer", "property-based-testing"]
abbreviation = "N/A"
domain = "Package Management and Distribution"
complexity = "Intermediate"
beam_specific = true
registry_url = "https://hex.pm"
docs_url = "https://hexdocs.pm"
package_count = "15,000+"
resolver_type = "SAT-solver"
elixir_integration = "Native via Mix"
prismatic_usage = "Critical Infrastructure"
platform_component = "All umbrella applications"
first_introduced = "Gen 1"
current_generation = "Gen 19"
quality_impact = "High"
security_impact = "Critical"
key_commands = ["deps.get", "deps.compile", "hex.audit", "hex.outdated", "hex.publish"]
lockfile = "mix.lock"
dependency_count_platform = "200+"
umbrella_app_count = 115
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1499
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Hex", "Package", "ErlangElixir", "glossary", "infrastructure", "Prismatic Platform", "Elixir", "Docker"]
tags = ["glossary", "infrastructure", "hex", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Hex - Prismatic Platform"
+++

## Definition

Hex is the official package manager for the Erlang and Elixir ecosystems, serving as the central registry for discovering, downloading, and publishing reusable libraries. Hosted at hex.pm, the registry contains over 15,000 packages and processes millions of downloads monthly. Hex handles dependency resolution using a SAT-solver-based algorithm that evaluates semantic version constraints across the entire dependency graph, producing a deterministic `mix.lock` file that guarantees reproducible builds across development machines, CI pipelines, and production environments.

Hex integrates natively with [Mix](@/glossary/mix.md), Elixir's build tool, making dependency management a seamless part of the development workflow. Dependencies are declared in `mix.exs` with version constraints (e.g., `~> 1.7`), and `mix deps.get` resolves and downloads them. Hex also supports private repositories for organizations that need to host proprietary packages alongside public ones, and it provides package signing, checksum verification, and retirement (marking packages as deprecated or compromised).

Beyond package management, Hex serves as the foundation of the Elixir ecosystem's quality infrastructure. Packages publish documentation to HexDocs (docs.hex.pm), enabling consistent API documentation across the ecosystem. The `mix hex.audit` command checks for retired or vulnerable packages, and `mix hex.outdated` identifies available updates -- both critical for maintaining the security posture that platforms like Prismatic require.

## Historical Context and Ecosystem Role

Hex was created in 2014 by Eric Meadows-Jonsson as the Elixir ecosystem's answer to npm (JavaScript), PyPI (Python), and RubyGems (Ruby). Before Hex, Elixir developers relied on Git dependencies for third-party code, which provided no versioning guarantees, no conflict resolution, and no centralized discovery. Hex transformed the Elixir ecosystem from a collection of Git repositories into a proper package ecosystem with semantic versioning, dependency resolution, and centralized documentation.

The name "Hex" is a playful reference to Hex, the computer from Terry Pratchett's Discworld novels -- a thinking machine built from ants and magic. Like its fictional namesake, Hex performs seemingly magical feats of package resolution by coordinating thousands of version constraints into a consistent solution.

Hex's design makes several deliberate choices that distinguish it from other package managers:

| Design Choice | Hex Approach | Alternative Approach | Rationale |
|--------------|-------------|---------------------|-----------|
| **Resolution scope** | Flat dependency tree | Nested (npm-style) | Prevents version duplication, reduces binary size |
| **Lock granularity** | Single lockfile per project | Per-package locks | Ensures global consistency across all dependencies |
| **Checksum verification** | SHA-256 per package | Optional or trust-based | Prevents supply chain attacks |
| **Documentation hosting** | Integrated (HexDocs) | Separate hosting | Ensures documentation availability for all packages |
| **Retirement support** | Built-in | Advisory-only | Enables proactive security response |

## Implementation in Prismatic Platform

The Prismatic Platform manages dependencies across 115 umbrella applications through a shared Hex configuration. A single `mix.lock` at the project root ensures version consistency -- every umbrella app uses exactly the same version of shared dependencies like [Phoenix](@/glossary/phoenix.md), [Ecto](@/glossary/ecto.md), and [Broadway](@/glossary/broadway.md).

### Key Hex Dependencies

| Package | Purpose | Version Constraint | Category |
|---------|---------|-------------------|----------|
| **phoenix** | Web framework | `~> 1.7.14` | Core |
| **phoenix_live_view** | Real-time UI | `~> 1.0` | Core |
| **ecto_sql** | Database abstraction | `~> 3.11` | Core |
| **broadway** | Data pipeline | `~> 1.1` | Data Processing |
| **openapi_spex** | API documentation | `~> 3.18` | API |
| **oban** | Background jobs | `~> 2.17` | Infrastructure |
| **finch** | HTTP client | `~> 0.18` | Networking |
| **jason** | JSON encoding | `~> 1.4` | Serialization |
| **mint** | Low-level HTTP | `~> 1.5` | Networking |
| **stream_data** | Property-based testing | `~> 0.6` | Testing |
| **credo** | Static analysis | `~> 1.7` | Quality |
| **dialyxir** | Type checking | `~> 1.4` | Quality |
| **excoveralls** | Coverage reporting | `~> 0.18` | Testing |
| **telemetry** | Instrumentation | `~> 1.0` | Observability |

The NO MERCY doctrine requires keeping all dependencies current and audited. The CI/CD pipeline runs `mix hex.audit` to detect retired packages and `mix deps.audit` for known vulnerabilities. Hex packages are cached in the GitLab CI runner and in [Docker](@/glossary/docker.md) build layers to minimize build times. The platform avoids unnecessary dependencies -- each new Hex dependency must justify its inclusion against the principle of minimal attack surface.

## Package Declaration and Version Constraints

Dependencies are declared in `mix.exs` using Hex version constraint syntax:

```elixir
defmodule PrismaticPlatform.MixProject do
  @moduledoc """
  Root mix project for the Prismatic Platform umbrella.
  Manages shared dependencies across 115 umbrella applications.
  """

  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      dialyzer: [plt_add_apps: [:mix]],
      preferred_cli_env: [
        "test.all": :test,
        "quality.gates": :dev
      ]
    ]
  end

  defp deps do
    [
      # Core framework
      {:phoenix, "~> 1.7.14"},
      {:phoenix_live_view, "~> 1.0"},
      {:phoenix_live_dashboard, "~> 0.8.4"},

      # Database and storage
      {:ecto_sql, "~> 3.11"},
      {:postgrex, ">= 0.0.0"},

      # Data processing
      {:broadway, "~> 1.1"},
      {:gen_stage, "~> 1.2"},

      # API
      {:open_api_spex, "~> 3.18"},

      # HTTP and networking
      {:finch, "~> 0.18"},
      {:mint, "~> 1.5"},
      {:req, "~> 0.5"},

      # Serialization
      {:jason, "~> 1.4"},

      # Background jobs
      {:oban, "~> 2.17"},

      # Observability
      {:telemetry, "~> 1.0"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},

      # Quality (dev/test only)
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false},
      {:excoveralls, "~> 0.18", only: :test},
      {:stream_data, "~> 0.6", only: [:dev, :test]}
    ]
  end
end
```

## Version Constraint Semantics

Version constraint operators determine how liberally Hex may resolve versions:

| Operator | Example | Meaning | Risk Level |
|----------|---------|---------|-----------|
| `==` | `"== 1.0.0"` | Exactly this version | Lowest (no updates) |
| `~>` | `"~> 1.7"` | >= 1.7.0 and < 2.0.0 | Low (minor updates) |
| `~>` | `"~> 1.7.3"` | >= 1.7.3 and < 1.8.0 | Lowest practical (patch only) |
| `>=` | `">= 1.0.0"` | This version or newer | High (any version) |
| `and` | `">= 1.0.0 and < 2.0.0"` | Range constraint | Medium (bounded range) |

The pessimistic constraint operator (`~>`) is the most commonly used, allowing patch-level updates while preventing breaking changes. The Prismatic Platform uses `~> major.minor` for core dependencies (allowing minor updates) and `~> major.minor.patch` for dependencies where even minor updates have caused issues historically.

### Version Constraint Selection Strategy

```elixir
# Strategy for the Prismatic Platform:
#
# 1. Core framework (Phoenix, Ecto): ~> major.minor
#    Allows minor updates for features and fixes
{:phoenix, "~> 1.7"},

# 2. Stable utilities (Jason, Telemetry): ~> major.minor
#    These rarely break
{:jason, "~> 1.4"},

# 3. Sensitive dependencies: ~> major.minor.patch
#    Lock to patch-level when minor updates have broken before
{:phoenix_live_view, "~> 1.0.0"},

# 4. Dev/test tools: ~> major.minor
#    Less critical, accept broader updates
{:credo, "~> 1.7", only: [:dev, :test], runtime: false},
```

## Dependency Resolution

Hex's resolver evaluates all version constraints across the entire dependency graph simultaneously. For a platform like Prismatic with 115 umbrella apps, this means resolving potentially hundreds of transitive dependencies into a single consistent set of versions.

```
mix.exs (115 apps) --> Hex Resolver (SAT solver)
                          |
                          v
                     mix.lock (deterministic)
                          |
                          v
               ~/.hex/packages/ (cached tarballs)
                          |
                          v
                    deps/ (extracted source)
                          |
                          v
                   _build/ (compiled BEAM files)
```

| Stage | Command | Output |
|-------|---------|--------|
| **Resolve** | `mix deps.get` | Downloads and locks all dependencies |
| **Compile** | `mix deps.compile` | Compiles dependency source to BEAM bytecode |
| **Lock** | `mix.lock` | Deterministic version pins for reproducibility |
| **Audit** | `mix hex.audit` | Checks for retired or vulnerable packages |
| **Update** | `mix deps.update <pkg>` | Re-resolves a specific dependency |
| **Outdated** | `mix hex.outdated` | Lists available version updates |
| **Tree** | `mix deps.tree` | Visualizes the dependency graph |
| **Unlock** | `mix deps.unlock <pkg>` | Removes version lock for re-resolution |

### Conflict Resolution

When two umbrella apps require incompatible versions of the same dependency, Hex reports a conflict:

```
Dependencies have diverged:
* phoenix (Hex package)
  the dependency phoenix ~> 1.7.0 is overridden by another dependency
  - prismatic_web requires ~> 1.7.14
  - prismatic_api requires ~> 1.6.0
```

Resolution strategies:

| Strategy | When to Use | Trade-off |
|----------|-------------|-----------|
| **Upgrade both** | Both apps can use newer version | Requires testing both |
| **Override** | One constraint is unnecessarily tight | May hide real incompatibilities |
| **Fork** | Upstream package is abandoned | Maintenance burden |
| **Replace** | Better alternative exists | Migration effort |

## Lockfile and Reproducibility

The `mix.lock` file is Hex's mechanism for ensuring that every environment -- developer workstation, CI runner, production [Docker](@/glossary/docker.md) build -- uses identical dependency versions:

```elixir
# mix.lock (excerpt)
%{
  "phoenix": {:hex, :phoenix, "1.7.14",
    "a7d0b3f1bc95987044ddada111e77bd7f75646a08518942c72e5440c2bba2b7b",
    [:mix], [
      {:phoenix_pubsub, "~> 2.1", [hex: :phoenix_pubsub]},
      {:phoenix_template, "~> 1.0", [hex: :phoenix_template]},
      {:plug, "~> 1.14", [hex: :plug]},
      {:telemetry, "~> 0.4 or ~> 1.0", [hex: :telemetry]},
      {:websock_adapter, "~> 0.5.3", [hex: :websock_adapter]}
    ], "hexpm", "c7859bc56cc5dfef19ecfc240775dae7a59c7f12c..."},
}
```

Each entry contains the package name, version, SHA-256 checksum, build tool, dependency list, and registry source. The checksum ensures package integrity -- if hex.pm serves a different tarball than what was locked, the build fails.

## Package Publishing

Publishing a package to Hex makes it available to the entire Elixir ecosystem. The Prismatic Platform has published 4 OSS packages as part of its Gen 19 Ecosystem Expansion:

```elixir
defmodule PrismaticSDK.MixProject do
  @moduledoc """
  Mix project for the Prismatic SDK - published to hex.pm.
  """

  use Mix.Project

  def project do
    [
      app: :prismatic_sdk,
      version: "0.1.0",
      elixir: "~> 1.15",
      description: description(),
      package: package(),
      deps: deps(),
      docs: docs()
    ]
  end

  defp description do
    "SDK for integrating with the Prismatic Platform"
  end

  defp package do
    [
      name: "prismatic_sdk",
      licenses: ["Apache-2.0"],
      links: %{"GitHub" => "https://github.com/korczis/prismatic-sdk"},
      files: ~w(lib .formatter.exs mix.exs README.md LICENSE CHANGELOG.md),
      maintainers: ["Tomas Korcak"]
    ]
  end

  defp docs do
    [
      main: "PrismaticSDK",
      extras: ["README.md", "CHANGELOG.md"],
      source_url: "https://github.com/korczis/prismatic-sdk"
    ]
  end
end
```

| Command | Purpose |
|---------|---------|
| `mix hex.publish` | Publish package to hex.pm |
| `mix hex.publish docs` | Publish documentation to HexDocs |
| `mix hex.retire <pkg> <version> <reason>` | Mark a version as retired |
| `mix hex.info <pkg>` | Display package information |
| `mix hex.search <query>` | Search the registry |

## Private Repositories

Organizations can host private packages using Hex's organization feature or self-hosted repositories:

| Feature | Public hex.pm | Hex Organizations | Self-Hosted |
|---------|--------------|-------------------|-------------|
| **Access** | Public | Team members | Internal network |
| **Cost** | Free | Subscription | Infrastructure cost |
| **Auth** | API key | Organization key | Custom |
| **Use Case** | Open source | Proprietary libraries | Air-gapped environments |

```elixir
# Using a private Hex organization
defp deps do
  [
    {:internal_lib, "~> 1.0", organization: "mycompany"}
  ]
end
```

## Security and Auditing

Hex provides several security mechanisms critical for platforms operating under strict security policies:

| Mechanism | Command | Purpose |
|-----------|---------|---------|
| **Package Checksums** | Automatic via `mix.lock` | Verify package integrity |
| **Retirement** | `mix hex.audit` | Detect deprecated/compromised packages |
| **Outdated Check** | `mix hex.outdated` | Identify packages needing updates |
| **Dependency Tree** | `mix deps.tree` | Audit transitive dependency chains |
| **License Scan** | Third-party tools | Verify license compatibility |

The Prismatic Platform's CI pipeline enforces:
1. `mix hex.audit` passes with zero retired packages
2. No dependencies with known CVEs (checked via `mix deps.audit`)
3. All dependencies locked (no floating versions)
4. Dependency updates reviewed monthly as part of security maintenance

### Supply Chain Security

Hex provides several defenses against supply chain attacks:

| Attack Vector | Hex Defense | Additional Measures |
|---------------|-------------|-------------------|
| **Typosquatting** | Name reservation, popularity signals | Manual review of new dependencies |
| **Package compromise** | SHA-256 checksums in lockfile | Lock to specific versions |
| **Dependency confusion** | Organization namespacing | Private repository priority |
| **Malicious updates** | Lockfile pins prevent auto-update | Review `mix.lock` diffs in PRs |
| **Abandoned packages** | Retirement system | Monitor maintenance status |

## Docker Integration

Hex dependencies are cached in Docker build layers to minimize build times:

```dockerfile
# Multi-stage build with Hex caching
FROM elixir:1.19-alpine AS build

# Install Hex and Rebar (cached layer)
RUN mix local.hex --force && mix local.rebar --force

# Copy dependency definition files first (cached layer)
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs ./apps/

# Fetch dependencies (cached until mix.exs or mix.lock changes)
RUN mix deps.get --only prod

# Copy application source and compile
COPY . .
RUN MIX_ENV=prod mix release
```

This Dockerfile structure ensures that `mix deps.get` is only re-executed when `mix.exs` or `mix.lock` changes, leveraging Docker's layer caching to skip dependency resolution on code-only changes.

## Best Practices

**Use Pessimistic Version Constraints**: Prefer `~>` over `>=` for version constraints. The pessimistic operator allows patch-level updates while preventing breaking major version changes, balancing security updates with stability.

**Audit Dependencies Regularly**: Run `mix hex.audit` and `mix hex.outdated` as part of the CI pipeline and monthly security maintenance. Retired packages and known vulnerabilities must be addressed promptly.

**Minimize Dependency Count**: Each new Hex dependency increases the attack surface and maintenance burden. Justify every dependency against the principle of minimal surface -- if a simple function can replace a library, prefer the function.

**Lock All Dependencies**: Always commit `mix.lock` to version control. Never use floating versions in production. The lockfile ensures reproducible builds across all environments.

**Review Lockfile Changes**: When `mix.lock` changes in a pull request, review the version changes carefully. Unexpected version jumps or new transitive dependencies may indicate supply chain issues.

**Use Environment-Specific Dependencies**: Mark development and test dependencies with `only: [:dev, :test], runtime: false` to prevent them from being included in production builds.

## Use Cases

- **Dependency Management**: Managing hundreds of transitive dependencies across 115 umbrella applications with a single deterministic `mix.lock` file
- **Security Auditing**: Running `mix hex.audit` in CI to detect retired or compromised packages before they reach production
- **Build Reproducibility**: Ensuring identical dependency versions across developer workstations, CI runners, and Docker production builds through lockfile enforcement
- **Private Package Hosting**: Distributing internal libraries through Hex organizations for proprietary code shared between projects
- **Ecosystem Integration**: Accessing the Elixir ecosystem's 15,000+ packages including Phoenix, Ecto, Broadway, and OpenApiSpex
- **OSS Distribution**: Publishing Prismatic SDK, Plugin Kit, Security, and UI packages to hex.pm for community use

## Related Concepts

- [Mix](@/glossary/mix.md) - Build tool that integrates with Hex for dependency management
- [Ecto](@/glossary/ecto.md) - Database library distributed as a Hex package
- [Phoenix](@/glossary/phoenix.md) - Web framework distributed as a Hex package
- [Broadway](@/glossary/broadway.md) - Data pipeline library from the Hex ecosystem
- [OpenAPI](@/glossary/openapi.md) - OpenApiSpex Hex package for API specification
- [Docker](@/glossary/docker.md) - Container builds that cache Hex dependencies
- [Release](@/glossary/release.md) - Production packaging that includes compiled Hex deps
- [BEAM](@/glossary/beam.md) - Virtual machine executing compiled Hex packages
- [Dialyzer](@/glossary/dialyzer.md) - Static analysis tool that operates on compiled dependencies
- [Property-Based Testing](@/glossary/property-based-testing.md) - StreamData Hex package for generative tests

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture and dependency strategy
- [Technologies](@/technologies/_index.md) - Technology stack and key packages

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
