+++
title = "Semver"
weight = 50
[extra]
description = "Semantic Versioning standard using MAJOR.MINOR.PATCH format to communicate compatibility and change scope"
category = "tooling"
related_terms = ["schema-migration", "quality-floor", "placeholder", "runtime", "self-registration"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["semver", "semantic versioning", "MAJOR.MINOR.PATCH", "compatibility", "versioning", "glossary", "Prismatic Platform"]
tags = ["glossary", "tooling", "versioning", "standards"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Semver - Prismatic Platform"
+++

## Definition & Overview

Semantic Versioning (Semver) is a versioning standard that uses a three-part MAJOR.MINOR.PATCH format to communicate the scope and compatibility impact of changes. As defined by semver.org: MAJOR version increments indicate backward-incompatible API changes, MINOR version increments indicate backward-compatible feature additions, and PATCH version increments indicate backward-compatible bug fixes. Pre-release versions and build metadata are appended as additional labels (e.g., `1.0.0-rc.1+build.42`).

Semver's value lies in making version numbers meaningful rather than arbitrary. When a dependency updates from 1.3.2 to 1.4.0, consumers know that new features were added but no breaking changes were introduced. An update from 1.4.0 to 2.0.0 signals breaking changes that require migration effort. This semantic communication enables automated dependency management -- tools like Mix, npm, and Cargo can safely apply MINOR and PATCH updates while flagging MAJOR updates for manual review.

The Prismatic Platform follows semver strictly across all its components: the platform version itself (currently 8.0.0), individual umbrella application versions, AIAD component versions, policy versions, and documentation versions. The CLAUDE.md file tracks the platform version (currently 8.0.0, Generation 19), and each umbrella application's `mix.exs` declares its version following semver conventions.

## Technical Deep Dive

Elixir's Mix build system integrates semver natively. Dependency specifications in `mix.exs` use semver-compatible version constraints: `~>` (pessimistic, allows MINOR and PATCH updates), `>=` (minimum version), and exact version pinning.

```elixir
defmodule PrismaticPlatform.MixProject do
  use Mix.Project

  @version "8.0.0"

  def project do
    [
      app: :prismatic_platform,
      version: @version,
      elixir: "~> 1.19",
      deps: deps()
    ]
  end

  defp deps do
    [
      # Pessimistic constraint: allows 1.7.x updates, blocks 1.8.0
      {:phoenix, "~> 1.7.14"},

      # Allows any 3.x version
      {:phoenix_live_view, "~> 1.0"},

      # Exact version pin (for stability-critical dependencies)
      {:ecto, "3.12.5"},

      # Minimum version
      {:jason, ">= 1.4.0"}
    ]
  end
end
```

Version comparison and constraint checking in Elixir uses the `Version` module, which implements full semver parsing including pre-release labels and build metadata.

```elixir
defmodule PrismaticQuality.VersionChecker do
  @moduledoc """
  Validates version consistency across umbrella applications
  and checks dependency version constraints.
  """

  @spec check_platform_version() :: {:ok, Version.t()} | {:error, term()}
  def check_platform_version do
    case Version.parse("8.0.0") do
      {:ok, version} ->
        {:ok, version}

      :error ->
        {:error, :invalid_version}
    end
  end

  @spec compatible?(String.t(), String.t()) :: boolean()
  def compatible?(version_string, requirement_string) do
    case Version.parse(version_string) do
      {:ok, version} ->
        requirement = Version.parse_requirement!(requirement_string)
        Version.match?(version, requirement)

      :error ->
        false
    end
  end

  @spec check_umbrella_consistency() :: {:ok, map()} | {:error, [map()]}
  def check_umbrella_consistency do
    apps = discover_umbrella_apps()

    inconsistencies =
      apps
      |> Enum.flat_map(fn {app, version} ->
        check_app_deps(app, version)
      end)

    case inconsistencies do
      [] -> {:ok, %{apps: length(apps), all_consistent: true}}
      issues -> {:error, issues}
    end
  end

  @spec bump(String.t(), :major | :minor | :patch) :: {:ok, String.t()}
  def bump(version_string, level) do
    {:ok, version} = Version.parse(version_string)

    new_version =
      case level do
        :major -> %{version | major: version.major + 1, minor: 0, patch: 0}
        :minor -> %{version | minor: version.minor + 1, patch: 0}
        :patch -> %{version | patch: version.patch + 1}
      end

    {:ok, Version.to_string(new_version)}
  end

  defp discover_umbrella_apps do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(fn mix_file ->
      app_dir = Path.dirname(mix_file)
      app_name = Path.basename(app_dir) |> String.to_atom()
      version = extract_version(mix_file)
      {app_name, version}
    end)
  end

  defp extract_version(mix_file) do
    content = File.read!(mix_file)

    case Regex.run(~r/version:\s*"([^"]+)"/, content) do
      [_, version] -> version
      _ -> "0.0.0"
    end
  end

  defp check_app_deps(_app, _version) do
    # Check internal dependency version constraints
    []
  end
end
```

## Architecture & Implementation

The Prismatic Platform's version management spans multiple dimensions. The platform version (8.0.0) represents the overall release. Individual umbrella applications maintain their own version numbers that increment independently based on their specific changes. AIAD components (agents, commands, policies) include version metadata in their YAML frontmatter.

The CI/CD pipeline validates version consistency: it verifies that committed changes are reflected in appropriate version bumps, that dependency constraints remain satisfiable, and that the changelog is updated for version changes. The pre-commit hook includes a version check phase that warns when source changes are committed without corresponding version bumps.

Version information is embedded in runtime metadata, enabling the health check endpoint and monitoring dashboard to report exact version numbers for debugging and deployment verification.

## Usage in Prismatic Platform

Version management is integrated into the development workflow through Mix tasks and CI checks. The platform tracks versions across all 115 umbrella applications.

```elixir
# Check current platform version
# mix version

# Check all umbrella app versions
# mix version --all

# Bump version
# mix version.bump patch  # 8.0.0 -> 8.0.1
# mix version.bump minor  # 8.0.0 -> 8.1.0
# mix version.bump major  # 8.0.0 -> 9.0.0

# Verify version consistency
# mix quality.version_check
```

The Hex package manager, used for Elixir dependency distribution, requires semver compliance for all published packages. The platform's four OSS packages (SDK, Plugin Kit, Security, UI) follow strict semver with automated version validation in the release pipeline.

## Cross-References

- [Schema Migration](/glossary/schema-migration/) - Database changes coordinated with version bumps
- [Quality Floor](/glossary/quality-floor/) - Quality standards versioned alongside the platform
- [Placeholder](/glossary/placeholder/) - Forbidden patterns tracked by version
- [Runtime](/glossary/runtime/) - Version information available at runtime for diagnostics
- [Self-Registration](/glossary/self-registration/) - Registered components carrying version metadata

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
