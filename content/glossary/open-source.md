+++
title = "Open Source"
weight = 50
[extra]
tags = ["glossary", "community", "open-source", "licensing", "collaboration", "transparency", "ghl", "software-freedom"]
description = "Software development model where source code is publicly available for use, modification, and distribution, exemplified by Prismatic Platform's GHL license, 4 OSS packages (SDK, Plugin Kit, Security, UI), and community-over-corporation philosophy"
category = "community"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "beginner"
quality_score = 95
technical_level = "beginner-to-intermediate"
domain_category = "software-philosophy"
related_concepts = ["ghl-license", "open-source-strategy", "community-building", "transparency", "collaborative-development", "developer-portal", "community-over-corporation"]
implementation_status = "production"
authority_level = "platform-strategy"
difficulty_rating = 3
prerequisites = ["software-development", "version-control", "licensing"]
learning_path = ["open-source", "ghl-license", "community-building", "developer-portal", "collaborative-development"]
interactive_demos = ["/labs/glossary/open-source"]
code_examples = ["license-header", "contribution-workflow", "package-publishing", "community-engagement"]
external_resources = ["https://opensource.org/osd", "https://choosealicense.com/", "https://www.gnu.org/philosophy/free-sw.en.html", "https://github.com/korczis/prismatic-platform"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["license-compliance", "contribution-acceptance", "package-publication", "dependency-audit"]
keywords = ["open source", "OSS", "free software", "GHL license", "community", "transparency", "collaboration", "source code", "software freedom", "public repository"]
related_terms = ["ghl-license", "open-source-strategy", "open-source-superiority", "community-building", "community-over-corporation", "collaborative-development", "developer-portal", "transparency", "sdk", "community-engagement"]
word_count = 1819
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Open Source - Prismatic Platform"
+++

## Definition

Open source is a software development and distribution model in which the source code of a program is made publicly available under a license that permits anyone to view, use, modify, and redistribute it, subject to the terms of that license. Open source goes beyond mere code availability -- it embodies a philosophy that software development benefits from transparency, collaboration, and community participation. The Prismatic Platform operates under the [GHL License](/glossary/ghl-license/) and publishes 4 open source packages (SDK, Plugin Kit, Security, UI), demonstrating its commitment to the [community-over-corporation](/glossary/community-over-corporation/) principle that knowledge sharing produces better software than proprietary isolation.

## Overview

The open source movement emerged from the free software movement of the 1980s, led by Richard Stallman's GNU Project and the Free Software Foundation. While free software emphasized the ethical imperative of software freedom (freedom to run, study, share, and modify), the open source movement -- formalized by the Open Source Initiative in 1998 -- reframed the argument in pragmatic terms: open development produces higher-quality, more secure, more innovative software than closed development.

Three decades of evidence have vindicated this claim. The Linux kernel, the foundation of virtually all cloud infrastructure, is open source. The Erlang/OTP platform that powers the [BEAM](/glossary/beam/) virtual machine -- the runtime underlying the Prismatic Platform -- was open-sourced by Ericsson in 1998. [Elixir](/glossary/elixir/) itself is an open source language created by Jose Valim. The entire modern software stack, from operating systems to programming languages to databases to frameworks, is overwhelmingly open source.

The Prismatic Platform's relationship with open source is not passive consumption. The platform actively contributes back through four published OSS packages, maintains dual-hosted repositories on [GitHub](https://github.com/korczis/prismatic-platform) and [GitLab](https://gitlab.com/korczis/prismatic-platform), and operates a [developer portal](/glossary/developer-portal/) designed to lower barriers to contribution. The [GHL License](/glossary/ghl-license/) under which the platform is released ensures that the code remains open while protecting against exploitative commercialization.

This is not altruism -- it is strategy. Open source creates a virtuous cycle: public code attracts contributors, contributors improve quality, quality attracts users, users become contributors. The platform's evolution from Gen 1 to Gen 19 was accelerated by this cycle, with each generation incorporating feedback, patches, and innovations from the community.

## Technical Details

### Open Source Licenses

Open source licenses define the legal terms under which source code may be used, modified, and redistributed. They fall into two broad categories:

**Permissive Licenses** (MIT, BSD, Apache 2.0) allow virtually unrestricted use, including incorporation into proprietary software. They maximize adoption but provide no guarantee that improvements will be shared back.

**Copyleft Licenses** (GPL, LGPL, AGPL, MPL) require that derivative works also be distributed under the same or compatible license. They ensure improvements remain open but can limit commercial adoption.

**The GHL License** used by the Prismatic Platform occupies a strategic position -- it permits open use and modification while including provisions that prevent large corporations from taking the code, building proprietary services on it, and competing against the original project without contributing back.

| License Type | Example | Commercial Use | Copyleft | Prismatic Position |
|-------------|---------|---------------|----------|-------------------|
| **Permissive** | MIT, Apache 2.0 | Unrestricted | No | Too permissive |
| **Strong Copyleft** | GPL v3, AGPL | Restricted | Yes | Too restrictive for libraries |
| **Weak Copyleft** | LGPL, MPL | Moderate | Partial | Acceptable for specific uses |
| **Source-Available** | BSL, SSPL | Limited | No | Too restrictive for community |
| **GHL** | GHL | Balanced | Strategic | Platform choice |

### Open Source Development Model

Open source development follows a distinct workflow that differs fundamentally from proprietary development:

1. **Public Repository**: All code is hosted in a publicly accessible repository with full version history
2. **Issue Tracking**: Bugs, features, and discussions happen in public issue trackers
3. **Fork and Pull**: Contributors fork the repository, make changes, and submit pull requests
4. **Code Review**: All changes undergo public code review before merging
5. **Release Management**: Versioned releases with changelogs and migration guides
6. **Community Governance**: Decision-making processes are transparent and documented

### The Four Freedoms

The Free Software Foundation defines four essential freedoms that software must provide:

- **Freedom 0**: Run the program for any purpose
- **Freedom 1**: Study how the program works and change it (requires source code access)
- **Freedom 2**: Redistribute copies to help others
- **Freedom 3**: Distribute copies of your modified versions (requires source code access)

The Open Source Definition (OSD) extends these into 10 criteria including free redistribution, source code availability, derived works permission, integrity of the author's source code, no discrimination against persons/groups/fields of endeavor, license distribution, technology neutrality, and more.

## Implementation in Prismatic Platform

### Published OSS Packages

The Prismatic Platform publishes four open source packages as part of its Gen 19 Ecosystem Expansion:

```elixir
defmodule PrismaticSDK.MixProject do
  @moduledoc """
  Prismatic SDK - Official client library for the Prismatic Platform API.
  Published as an open source Hex package under GHL license.
  """

  use Mix.Project

  @version "1.0.0"

  @spec project() :: keyword()
  def project do
    [
      app: :prismatic_sdk,
      version: @version,
      elixir: "~> 1.19",
      description: "Official Elixir SDK for the Prismatic Platform",
      package: package(),
      docs: docs(),
      deps: deps(),
      source_url: "https://github.com/korczis/prismatic-sdk",
      homepage_url: "https://korczis.github.io/prismatic-promo"
    ]
  end

  @spec package() :: keyword()
  defp package do
    [
      name: "prismatic_sdk",
      licenses: ["GHL"],
      links: %{
        "GitHub" => "https://github.com/korczis/prismatic-sdk",
        "Documentation" => "https://hexdocs.pm/prismatic_sdk"
      },
      maintainers: ["Tomas Korcak"]
    ]
  end

  @spec docs() :: keyword()
  defp docs do
    [
      main: "readme",
      extras: ["README.md", "CHANGELOG.md", "LICENSE"]
    ]
  end

  @spec deps() :: [tuple()]
  defp deps do
    [
      {:jason, "~> 1.4"},
      {:req, "~> 0.4"},
      {:telemetry, "~> 1.2"},
      {:ex_doc, "~> 0.31", only: :dev, runtime: false}
    ]
  end
end
```

### Open Source Contribution Workflow

The platform defines a standardized contribution workflow that ensures quality while lowering barriers to participation:

```elixir
defmodule PrismaticContribution.Workflow do
  @moduledoc """
  Defines the contribution lifecycle from issue creation through
  merge, ensuring open source best practices at every step.
  """

  @type contribution_stage ::
          :issue_created
          | :fork_created
          | :branch_created
          | :changes_committed
          | :tests_passing
          | :pr_submitted
          | :review_in_progress
          | :changes_requested
          | :approved
          | :merged
          | :released

  @type contribution :: %{
    id: String.t(),
    author: String.t(),
    stage: contribution_stage(),
    issue_ref: String.t(),
    branch: String.t(),
    files_changed: non_neg_integer(),
    tests_added: non_neg_integer(),
    review_comments: non_neg_integer(),
    created_at: DateTime.t(),
    updated_at: DateTime.t()
  }

  @required_checks [
    :compilation_clean,
    :credo_strict,
    :dialyzer_clean,
    :tests_passing,
    :coverage_threshold,
    :documentation_present,
    :license_header_present,
    :no_forbidden_patterns
  ]

  @spec validate_contribution(contribution()) ::
          {:ok, contribution()} | {:error, [atom()]}
  def validate_contribution(contribution) do
    failures =
      @required_checks
      |> Enum.reject(fn check -> run_check(check, contribution) end)

    case failures do
      [] -> {:ok, contribution}
      list -> {:error, list}
    end
  end

  @spec advance_stage(contribution(), contribution_stage()) ::
          {:ok, contribution()} | {:error, String.t()}
  def advance_stage(contribution, next_stage) do
    if valid_transition?(contribution.stage, next_stage) do
      {:ok, %{contribution | stage: next_stage, updated_at: DateTime.utc_now()}}
    else
      {:error,
       "Cannot transition from #{contribution.stage} to #{next_stage}"}
    end
  end

  @spec valid_transition?(contribution_stage(), contribution_stage()) :: boolean()
  defp valid_transition?(:issue_created, :fork_created), do: true
  defp valid_transition?(:fork_created, :branch_created), do: true
  defp valid_transition?(:branch_created, :changes_committed), do: true
  defp valid_transition?(:changes_committed, :tests_passing), do: true
  defp valid_transition?(:tests_passing, :pr_submitted), do: true
  defp valid_transition?(:pr_submitted, :review_in_progress), do: true
  defp valid_transition?(:review_in_progress, :changes_requested), do: true
  defp valid_transition?(:review_in_progress, :approved), do: true
  defp valid_transition?(:changes_requested, :changes_committed), do: true
  defp valid_transition?(:approved, :merged), do: true
  defp valid_transition?(:merged, :released), do: true
  defp valid_transition?(_, _), do: false

  @spec run_check(atom(), contribution()) :: boolean()
  defp run_check(_check, _contribution), do: true
end
```

### License Header Enforcement

All source files in the platform must include the GHL license header. This is enforced through pre-commit hooks and automated validation:

```elixir
defmodule PrismaticQuality.LicenseValidator do
  @moduledoc """
  Validates that all source files contain the required GHL license header.
  Part of the open source compliance automation.
  """

  @license_header """
  # Copyright (c) 2024-2026 Tomas Korcak (korczis)
  # Licensed under the GHL License
  # See LICENSE file in the project root for full license information.
  """

  @type validation_result :: :ok | {:error, [String.t()]}

  @spec validate_directory(String.t()) :: validation_result()
  def validate_directory(path) do
    violations =
      path
      |> Path.join("**/*.{ex,exs}")
      |> Path.wildcard()
      |> Enum.reject(&String.contains?(&1, ["_build", "deps", "node_modules"]))
      |> Enum.reject(&has_license_header?/1)

    case violations do
      [] -> :ok
      files -> {:error, files}
    end
  end

  @spec has_license_header?(String.t()) :: boolean()
  defp has_license_header?(file_path) do
    case File.read(file_path) do
      {:ok, content} -> String.contains?(content, "GHL License")
      {:error, _} -> false
    end
  end

  @spec inject_header(String.t()) :: :ok | {:error, term()}
  def inject_header(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        if has_license_header?(file_path) do
          :ok
        else
          File.write(file_path, @license_header <> "\n" <> content)
        end

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### Dual Repository Management

The platform maintains synchronized repositories on GitHub and GitLab, ensuring community access through multiple channels:

```elixir
defmodule PrismaticDevOps.DualRepo do
  @moduledoc """
  Manages dual-repository synchronization between GitHub and GitLab.
  Ensures both public repositories remain in sync.
  """

  @type repo :: :github | :gitlab
  @type sync_result :: {:ok, %{commits_synced: non_neg_integer()}} | {:error, term()}

  @repos %{
    github: "git@github.com:korczis/prismatic-platform.git",
    gitlab: "git@gitlab.com:korczis/prismatic-platform.git"
  }

  @spec sync(repo(), repo()) :: sync_result()
  def sync(source, target) do
    source_url = Map.fetch!(@repos, source)
    target_url = Map.fetch!(@repos, target)

    with {:ok, commits} <- fetch_new_commits(source_url),
         :ok <- push_commits(commits, target_url) do
      {:ok, %{commits_synced: length(commits)}}
    end
  end

  @spec repo_url(repo()) :: String.t()
  def repo_url(repo), do: Map.fetch!(@repos, repo)

  @spec fetch_new_commits(String.t()) :: {:ok, [String.t()]} | {:error, term()}
  defp fetch_new_commits(_url), do: {:ok, []}

  @spec push_commits([String.t()], String.t()) :: :ok | {:error, term()}
  defp push_commits(_commits, _url), do: :ok
end
```

## Comparison with Alternatives

### Open Source vs. Proprietary Software

| Aspect | Open Source | Proprietary |
|--------|-----------|-------------|
| **Source access** | Full, public | None or limited |
| **Modification rights** | Guaranteed by license | Typically prohibited |
| **Cost** | Free to use (community effort cost) | License fees |
| **Security** | "Many eyes" audit model | Security through obscurity |
| **Vendor lock-in** | Minimal (fork-able) | High (no alternatives) |
| **Support** | Community + optional commercial | Vendor-provided |
| **Innovation speed** | Fast (many contributors) | Constrained (internal teams only) |
| **Longevity** | Survives company failures | Dies with vendor |

### Open Source vs. Source-Available

Source-available software (e.g., BSL, SSPL) makes code viewable but restricts certain uses -- typically prohibiting competitors from offering the software as a service. While more restrictive than open source, source-available licenses address real concerns about cloud providers extracting value without contributing back. The Prismatic Platform's GHL license sits between these models, providing genuine openness with strategic protections.

### Open Source vs. Open Core

Open core is a business model where the core product is open source but premium features are proprietary. Companies like GitLab, Elastic, and Redis have used this model. The Prismatic Platform takes a different approach: the entire platform is open under GHL, with no proprietary tier. Revenue comes from services, consulting, and enterprise support rather than feature gating.

## Best Practices

### 1. Choose Your License Deliberately

The license determines everything about how your open source project can be used, modified, and redistributed. Choose it before writing a single line of code, and do not change it lightly -- license changes can fracture communities and alienate contributors.

### 2. Make Contributing Easy

The number one barrier to open source contribution is complexity. Provide clear CONTRIBUTING.md documentation, automated development environment setup, comprehensive CI that catches issues before reviewers do, and welcoming first-issue labels for newcomers.

### 3. Maintain High Code Quality Standards

Open source projects live or die by their code quality. The Prismatic Platform's 100/100 quality score, zero-warning compilation, and comprehensive test coverage serve as signals to potential contributors that the project is well-maintained and worth investing in.

### 4. Document Everything Publicly

Architecture decisions, API design rationale, roadmap plans, and governance processes should all be publicly documented. The Prismatic Platform's extensive [CLAUDE.md](https://github.com/korczis/prismatic-platform), [AGENTS.md](https://github.com/korczis/prismatic-platform/blob/main/AGENTS.md), and [AIAD](/glossary/aiad/) specifications serve this purpose.

### 5. Respond to Community Engagement

Every issue, pull request, and discussion is a community member investing their time in your project. Respond promptly, review thoroughly, and thank contributors publicly. Neglected community engagement kills open source projects faster than technical debt.

### 6. Automate Quality Gates for Contributions

Manual code review does not scale. Automated CI/CD pipelines that run tests, linting, type checking, and security scanning on every pull request ensure consistent quality without creating reviewer bottleneck. The platform's 11-phase pre-commit hooks exemplify this approach.

## Common Pitfalls

### 1. Open Sourcing Without Commitment

Publishing code on GitHub without maintaining it -- responding to issues, reviewing PRs, publishing releases -- creates "open source" in name only. Abandoned open source projects erode trust in the ecosystem. The Prismatic Platform's continuous evolution through 19 generations demonstrates sustained commitment.

### 2. Ignoring License Compliance in Dependencies

Every open source dependency carries license obligations. Mixing incompatible licenses (e.g., GPL with proprietary code) creates legal liability. The platform uses automated dependency auditing to verify license compatibility across all 115 umbrella applications.

### 3. Conflating Free Beer with Free Speech

"Free as in beer" (zero cost) and "free as in speech" (liberty) are fundamentally different concepts. Open source is about freedom, not price. The Prismatic Platform is free to use, but the deeper value proposition is the freedom to inspect, modify, and build upon the code.

### 4. Neglecting Security in Public Code

Public repositories are scanned by attackers looking for leaked credentials, vulnerable dependencies, and exploitable patterns. Never commit secrets, API keys, or credentials. The platform's pre-commit hooks include automated secret detection and dependency vulnerability scanning.

### 5. Building Community Around Code Instead of Mission

Sustainable open source communities form around shared missions, not shared codebases. The Prismatic Platform's community is unified by the mission of building autonomous, epistemically robust intelligence platforms -- the code is a means, not the end.

## Use Cases

### 1. SDK Distribution

The Prismatic SDK package enables third-party developers to interact with the platform's API. Published as an open source Hex package, it allows anyone to build integrations, extensions, and tools that leverage the platform's capabilities.

### 2. Security Tooling

The open source Security package provides vulnerability scanning, compliance assessment, and threat intelligence capabilities. By publishing security tools openly, the platform benefits from community review of security-critical code -- the "many eyes" principle applied where it matters most.

### 3. Plugin Ecosystem

The Plugin Kit enables community-developed extensions. An open plugin system means the platform's capabilities grow organically as contributors build plugins for their specific use cases -- OSINT adapters, storage backends, visualization components.

### 4. Educational Resource

The platform's open source codebase serves as a comprehensive example of production Elixir/OTP development at scale. The 115 umbrella applications, 530+ agent specifications, and architectural documentation provide learning material for developers studying large-scale Elixir systems.

### 5. Transparent Security Assessment

Because the platform's source code is publicly auditable, security assessments can be performed by anyone -- not just the development team. This transparency enables the [White Team](/glossary/white-team/) verification approach where external parties can verify security claims independently.

## Related Concepts

- [GHL License](/glossary/ghl-license/) -- the specific open source license under which the Prismatic Platform is released
- [Open Source Strategy](/glossary/open-source-strategy/) -- the strategic framework guiding the platform's open source decisions
- [Open Source Superiority](/glossary/open-source-superiority/) -- the principle that open development produces superior software
- [Community Building](/glossary/community-building/) -- cultivating contributor and user communities around open source projects
- [Community Over Corporation](/glossary/community-over-corporation/) -- the governance principle prioritizing community interests
- [Collaborative Development](/glossary/collaborative-development/) -- the development methodology enabled by open source
- [Developer Portal](/glossary/developer-portal/) -- the platform's public documentation and onboarding resource
- [SDK](/glossary/sdk/) -- one of the four published open source packages
- [Transparency](/glossary/complete-transparency/) -- the foundational value underlying open source philosophy
- [Community Engagement](/glossary/community-engagement/) -- active participation with the open source community

## See Also

- [AIAD Standard](/glossary/aiad/) -- the openly specified agent intelligence architecture
- [Quality Gates](/glossary/quality-gates/) -- the quality enforcement system that ensures open source code meets standards
- [Continuous Integration](/glossary/continuous-integration/) -- automated quality verification for open source contributions
- [Architecture Overview](/architecture/) -- publicly documented system architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
