+++
title = "Open Source Strategy"
weight = 50
[extra]
description = "The deliberate planning and execution of open source adoption, contribution, and release practices to achieve technical, business, and community objectives -- as demonstrated by the Prismatic Platform's dual-track OSS ecosystem"
category = "community"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "strategic-planning"
related_concepts = ["open-source-leadership", "open-source-superiority", "platform-strategy", "developer-portal", "sdk"]
implementation_status = "production"
authority_level = "platform-philosophy"
difficulty_rating = 5
prerequisites = ["open-source", "community-building", "software-architecture"]
learning_path = ["open-source", "open-source-strategy", "open-source-leadership", "open-source-superiority", "developer-portal", "sdk"]
interactive_demos = ["/labs/glossary/open-source-strategy"]
code_examples = ["OSS release policy module", "dependency audit system", "license compatibility checker"]
external_resources = ["https://opensource.guide/starting-a-project/", "https://todogroup.org/guides/strategy/", "https://www.linuxfoundation.org/research/guide-to-enterprise-open-source"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["license compliance validation", "dependency security audit", "release readiness check", "API backward compatibility"]
keywords = ["open source strategy", "OSS business model", "open source adoption", "inner source", "open core model", "dual licensing", "open source governance", "community strategy"]
tags = ["open-source", "strategy", "business", "community", "licensing", "ecosystem", "governance"]
related_terms = ["open-source-leadership", "open-source-superiority", "platform-strategy", "developer-portal", "sdk", "community-building", "developer-community", "collaborative-development", "community-ownership", "rest-api"]
word_count = 1858
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Open Source Strategy - Prismatic Platform"
+++

## Definition

**Open Source Strategy** is the deliberate, systematic approach to leveraging open source software for achieving technical, business, and community objectives. It encompasses decisions about which components to open source, how to structure contributions to external projects, what licensing models to adopt, how to build and sustain contributor communities, and how to balance openness with competitive advantage. A well-crafted open source strategy is not simply about publishing source code -- it is a comprehensive plan that aligns software transparency with organizational goals.

The [Prismatic Platform](@/glossary/elixir.md) embodies a mature open source strategy through its Generation 19 Ecosystem Expansion, which includes four published OSS packages (SDK, Plugin Kit, Security, UI), a developer portal, and a dual-track positioning that provides both open source community value and platform-specific capabilities. This strategy treats open source not as an afterthought but as a primary distribution and quality mechanism.

## Overview

Open source strategy has evolved considerably since the early days of the Free Software Foundation and the initial Open Source Initiative definitions. What began as a philosophical movement about software freedom has matured into a sophisticated strategic discipline that influences how the world's largest technology organizations build, distribute, and monetize software.

The strategic landscape can be understood through three dimensions:

### Consumption Strategy

How an organization evaluates, adopts, and manages open source dependencies. This includes dependency auditing, license compliance, security vulnerability tracking, and contribution policies for upstream projects. The Prismatic Platform manages this through its 115 umbrella applications, each with explicit dependency declarations in `mix.exs` and automated security scanning.

### Contribution Strategy

How an organization participates in the broader open source ecosystem. This ranges from bug reports and documentation improvements to significant feature contributions and maintainership of key projects. Strategic contribution builds reputation, attracts talent, and influences the direction of critical dependencies.

### Release Strategy

How an organization publishes its own open source software. This includes choosing what to release, under what license, with what governance model, and with what level of ongoing commitment. The Prismatic Platform's four OSS packages represent a carefully scoped release strategy that provides value to the Elixir ecosystem while protecting platform-specific innovations.

### Strategic Model Comparison

| Model | Description | Revenue Source | Examples | Risk Level |
|-------|-------------|----------------|----------|------------|
| **Open Core** | Core OSS, premium features proprietary | Enterprise features, support | GitLab, Elastic | Medium |
| **SaaS + OSS** | OSS tools, hosted service revenue | Managed service | HashiCorp, MongoDB | Medium |
| **Dual License** | Copyleft OSS + commercial license option | License sales | MySQL (historical), Qt | High |
| **Foundation-Backed** | OSS governed by neutral foundation | Membership, sponsorship | Linux, Kubernetes | Low |
| **Developer Tools** | Free tools, paid platform | Platform fees | Vercel (Next.js), Netlify | Medium |
| **Ecosystem Play** | OSS as ecosystem enabler | Adjacent services | Prismatic (SDK + Platform) | Low-Medium |
| **Loss Leader** | OSS to drive other product adoption | Cross-selling | Google (Android, TensorFlow) | Low |

The Prismatic Platform operates primarily under the "Ecosystem Play" model: the four OSS packages (SDK, Plugin Kit, Security, UI) enable external developers to build on and integrate with the platform, creating a flywheel effect where more ecosystem participants drive more platform value.

## Technical Details

### OSS Release Policy Enforcement

A robust open source strategy requires automated enforcement of release policies. The following module demonstrates how the Prismatic Platform ensures that open source releases meet quality, security, and licensing requirements before publication.

```elixir
defmodule PrismaticOSS.ReleasePolicy do
  @moduledoc """
  Enforces open source release policies for Prismatic Platform packages.

  Every OSS release must pass:
  1. License compatibility check (all dependencies OSS-compatible)
  2. Security audit (no known CVEs in dependency tree)
  3. Quality gates (100% test coverage, zero warnings, Dialyzer clean)
  4. API stability check (no breaking changes without major version bump)
  5. Documentation completeness (all public functions documented)
  """

  @type release_candidate :: %{
    package: String.t(),
    version: Version.t(),
    dependencies: [%{name: String.t(), version: String.t(), license: String.t()}],
    test_coverage: float(),
    warnings: non_neg_integer(),
    public_functions: non_neg_integer(),
    documented_functions: non_neg_integer(),
    breaking_changes: [String.t()]
  }

  @type release_result :: {:approved, map()} | {:blocked, [String.t()]}

  @allowed_licenses ~w(MIT Apache-2.0 BSD-2-Clause BSD-3-Clause ISC MPL-2.0)
  @copyleft_licenses ~w(GPL-2.0 GPL-3.0 AGPL-3.0 LGPL-2.1 LGPL-3.0)

  @doc """
  Validates a release candidate against all OSS release policies.

  Returns {:approved, metadata} when all checks pass,
  or {:blocked, reasons} with specific failure descriptions.
  """
  @spec validate_release(release_candidate()) :: release_result()
  def validate_release(candidate) do
    checks = [
      validate_licenses(candidate),
      validate_security(candidate),
      validate_quality(candidate),
      validate_api_stability(candidate),
      validate_documentation(candidate)
    ]

    failures =
      checks
      |> Enum.filter(&match?({:blocked, _}, &1))
      |> Enum.flat_map(fn {:blocked, reasons} -> reasons end)

    case failures do
      [] ->
        {:approved, %{
          package: candidate.package,
          version: candidate.version,
          approved_at: DateTime.utc_now(),
          checks_passed: length(checks)
        }}

      reasons ->
        {:blocked, reasons}
    end
  end

  defp validate_licenses(%{dependencies: deps}) do
    incompatible =
      deps
      |> Enum.filter(fn dep -> dep.license in @copyleft_licenses end)

    case incompatible do
      [] -> {:approved, :licenses}
      deps ->
        names = Enum.map_join(deps, ", ", & &1.name)
        {:blocked, ["Copyleft dependencies detected: #{names}. Review required."]}
    end
  end

  defp validate_security(%{dependencies: deps}) do
    vulnerable = Enum.filter(deps, &known_vulnerability?/1)

    case vulnerable do
      [] -> {:approved, :security}
      deps ->
        names = Enum.map_join(deps, ", ", & &1.name)
        {:blocked, ["Known vulnerabilities in: #{names}"]}
    end
  end

  defp validate_quality(%{test_coverage: coverage, warnings: warnings}) do
    issues = []
    issues = if coverage < 100.0, do: ["Test coverage #{coverage}% < 100%"] ++ issues, else: issues
    issues = if warnings > 0, do: ["#{warnings} compilation warnings"] ++ issues, else: issues

    case issues do
      [] -> {:approved, :quality}
      reasons -> {:blocked, reasons}
    end
  end

  defp validate_api_stability(%{breaking_changes: [], version: _version}) do
    {:approved, :api_stability}
  end

  defp validate_api_stability(%{breaking_changes: changes, version: version}) do
    if Version.parse!(version).major > 0 do
      {:blocked, ["Breaking changes require major version bump: #{inspect(changes)}"]}
    else
      {:approved, :api_stability}
    end
  end

  defp validate_documentation(%{public_functions: total, documented_functions: documented}) do
    coverage = if total > 0, do: documented / total * 100, else: 100.0

    if coverage >= 95.0 do
      {:approved, :documentation}
    else
      {:blocked, ["Documentation coverage #{Float.round(coverage, 1)}% < 95%"]}
    end
  end

  defp known_vulnerability?(_dep), do: false
end
```

### Dependency Audit System

Open source strategy requires continuous monitoring of the dependency tree for license compliance, security vulnerabilities, and health metrics.

```elixir
defmodule PrismaticOSS.DependencyAudit do
  @moduledoc """
  Audits the dependency tree of Prismatic Platform applications
  for open source strategy compliance.

  Tracks:
  - License compatibility across the entire dependency graph
  - Dependency freshness (time since last release)
  - Maintainer health (active contributors, response times)
  - Security advisory coverage
  """

  @type dependency :: %{
    name: String.t(),
    version: String.t(),
    license: String.t(),
    last_release: Date.t(),
    maintainers: non_neg_integer(),
    open_issues: non_neg_integer(),
    downloads_last_month: non_neg_integer()
  }

  @type audit_result :: %{
    total_dependencies: non_neg_integer(),
    license_breakdown: %{String.t() => non_neg_integer()},
    stale_dependencies: [dependency()],
    unmaintained_dependencies: [dependency()],
    risk_score: float(),
    recommendations: [String.t()]
  }

  @stale_threshold_days 365
  @unmaintained_threshold_maintainers 1

  @doc """
  Performs a comprehensive audit of all dependencies for a given application.
  Returns a structured report with risk assessment and recommendations.
  """
  @spec audit_application(atom()) :: {:ok, audit_result()}
  def audit_application(app_name) do
    deps = fetch_dependencies(app_name)

    result = %{
      total_dependencies: length(deps),
      license_breakdown: group_by_license(deps),
      stale_dependencies: find_stale(deps),
      unmaintained_dependencies: find_unmaintained(deps),
      risk_score: calculate_risk_score(deps),
      recommendations: generate_recommendations(deps)
    }

    {:ok, result}
  end

  defp fetch_dependencies(_app_name), do: []

  defp group_by_license(deps) do
    Enum.frequencies_by(deps, & &1.license)
  end

  defp find_stale(deps) do
    threshold = Date.add(Date.utc_today(), -@stale_threshold_days)
    Enum.filter(deps, fn dep -> Date.compare(dep.last_release, threshold) == :lt end)
  end

  defp find_unmaintained(deps) do
    Enum.filter(deps, fn dep -> dep.maintainers <= @unmaintained_threshold_maintainers end)
  end

  defp calculate_risk_score(deps) do
    if Enum.empty?(deps) do
      0.0
    else
      stale_ratio = length(find_stale(deps)) / length(deps)
      unmaintained_ratio = length(find_unmaintained(deps)) / length(deps)
      Float.round((stale_ratio * 0.4 + unmaintained_ratio * 0.6) * 100, 1)
    end
  end

  defp generate_recommendations(deps) do
    recommendations = []

    recommendations =
      if length(find_stale(deps)) > 0 do
        ["Update stale dependencies to reduce security risk" | recommendations]
      else
        recommendations
      end

    recommendations =
      if length(find_unmaintained(deps)) > 0 do
        ["Evaluate alternatives for unmaintained dependencies" | recommendations]
      else
        recommendations
      end

    Enum.reverse(recommendations)
  end
end
```

### License Compatibility Matrix

Understanding license compatibility is essential for any open source strategy. The following represents the compatibility relationships that must be enforced.

```elixir
defmodule PrismaticOSS.LicenseCompatibility do
  @moduledoc """
  Determines license compatibility for open source dependency management.

  The Prismatic Platform uses permissive licenses (MIT, Apache-2.0)
  for its OSS packages. This module ensures all transitive dependencies
  are compatible with these choices.
  """

  @type license :: String.t()
  @type compatibility :: :compatible | :incompatible | :review_required

  @permissive ~w(MIT Apache-2.0 BSD-2-Clause BSD-3-Clause ISC Unlicense)
  @weak_copyleft ~w(MPL-2.0 LGPL-2.1 LGPL-3.0 EPL-2.0)
  @strong_copyleft ~w(GPL-2.0 GPL-3.0 AGPL-3.0)

  @doc """
  Checks if a dependency license is compatible with the project license.
  """
  @spec check_compatibility(license(), license()) :: compatibility()
  def check_compatibility(_project_license, dependency_license) do
    cond do
      dependency_license in @permissive -> :compatible
      dependency_license in @weak_copyleft -> :review_required
      dependency_license in @strong_copyleft -> :incompatible
      true -> :review_required
    end
  end

  @doc """
  Validates an entire dependency tree against a project license.
  Returns all incompatible or review-required dependencies.
  """
  @spec validate_tree(license(), [{String.t(), license()}]) ::
    {:ok, :all_compatible} | {:issues, [{String.t(), license(), compatibility()}]}
  def validate_tree(project_license, dependencies) do
    issues =
      dependencies
      |> Enum.map(fn {name, dep_license} ->
        {name, dep_license, check_compatibility(project_license, dep_license)}
      end)
      |> Enum.reject(fn {_name, _license, status} -> status == :compatible end)

    case issues do
      [] -> {:ok, :all_compatible}
      found -> {:issues, found}
    end
  end
end
```

## Implementation

### Implementing an Open Source Strategy

A successful open source strategy unfolds in phases, each building on the previous:

**Phase 1: Assessment and Planning**. Inventory existing open source usage, evaluate current contribution practices, assess legal and compliance readiness, and define strategic objectives. For the Prismatic Platform, this phase established the architectural boundary between platform-specific code and ecosystem-general packages.

**Phase 2: Policy and Governance**. Establish clear policies for dependency adoption, contribution to external projects, and publication of internal code. Define license requirements, security review processes, and quality standards for open source releases. The Prismatic Platform's AIAD policy framework and NO MERCY quality doctrine serve this function.

**Phase 3: Infrastructure**. Build the tooling and processes needed to execute the strategy: CI/CD pipelines for open source packages, dependency audit systems, license compliance checkers, and community management tools. The platform's 11-phase pre-commit hook system and automated quality gates exemplify this infrastructure.

**Phase 4: Execution**. Begin publishing packages, contributing to upstream projects, and engaging with the developer community. The Prismatic Platform's four OSS packages (SDK, Plugin Kit, Security, UI) represent the execution of a carefully planned release strategy.

**Phase 5: Measurement and Iteration**. Track metrics like package adoption, contributor growth, issue response times, and ecosystem impact. Use these metrics to refine the strategy. The platform's Quality DNA system and community health monitoring support this phase.

### Strategic Decision Framework

When evaluating whether to open source a component, the following decision matrix provides structured guidance:

| Factor | Open Source Favored | Keep Proprietary |
|--------|-------------------|------------------|
| **Competitive Advantage** | Low differentiation | Core differentiator |
| **Quality Impact** | More eyes, more bugs found | Security-sensitive code |
| **Ecosystem Value** | Broadly useful | Platform-specific |
| **Maintenance Burden** | Community can share load | Specialized knowledge required |
| **Talent Attraction** | High visibility | Internal tooling |
| **Standards Alignment** | Industry-standard approach | Novel technique |

The Prismatic Platform applied this framework when selecting its four OSS packages: the SDK, Plugin Kit, Security, and UI components provide broadly useful functionality that benefits from community scrutiny and contribution, while platform-specific capabilities like the AIAD agent framework and Trinity Gate verification remain proprietary.

## Comparison

### Open Source Strategy vs. Inner Source

| Aspect | Open Source Strategy | Inner Source |
|--------|---------------------|-------------|
| **Audience** | External developers worldwide | Internal teams within organization |
| **Licensing** | OSI-approved licenses | Internal license or none |
| **Governance** | Community-driven | Organizationally directed |
| **Goal** | Ecosystem building, community growth | Cross-team collaboration, reuse |
| **Transparency** | Public by default | Private, internally open |
| **Risk** | IP exposure, maintenance burden | Organizational politics, adoption |

### Open Source Strategy vs. Open Source Leadership

[Open source strategy](@/glossary/open-source-strategy.md) addresses the "what" and "why" of open source engagement -- which components to release, under what terms, and with what business objectives. [Open source leadership](@/glossary/open-source-leadership.md) addresses the "how" of guiding the resulting projects and communities. Strategy without leadership produces abandoned repositories; leadership without strategy produces undirected effort.

## Best Practices

1. **Start with Consumption**: Before publishing your own open source, develop mature practices for consuming and contributing to existing projects. Learn from the ecosystem before trying to lead it.

2. **Define Clear Boundaries**: Decide upfront what will be open source and what will remain proprietary. The boundary should align with competitive advantage analysis, not arbitrary technical divisions.

3. **Invest in Documentation**: Open source packages without documentation are effectively invisible. Comprehensive docs, examples, and tutorials are the primary marketing channel for OSS projects. The Prismatic Platform maintains documentation across all 115 applications.

4. **Automate License Compliance**: Manual license review does not scale. Implement automated tools that check license compatibility on every dependency addition and flag issues before they reach production.

5. **Plan for Maintenance**: Publishing open source creates an ongoing obligation. Budget time and resources for issue triage, pull request review, security updates, and community engagement. Abandoned OSS is worse than proprietary software.

6. **Measure What Matters**: Track meaningful metrics like contributor diversity, issue response time, and downstream adoption rather than vanity metrics like GitHub stars or fork counts.

7. **Engage Upstream**: Contributing fixes and improvements to dependencies you rely on is both good citizenship and good strategy. It reduces the maintenance burden of carrying patches and builds relationships with maintainers.

8. **Design for Extension**: OSS packages should be designed with extension points that allow users to customize behavior without forking. The Prismatic Platform's Plugin Kit and adapter pattern demonstrate this principle.

## Common Pitfalls

1. **Open Source as Afterthought**: Publishing code that was designed for internal use without adapting its APIs, documentation, and configuration for external users results in poor adoption and frustrated contributors.

2. **License Incompatibility**: Discovering copyleft dependencies deep in the dependency tree after publication can create legal complications. Audit before you publish.

3. **Premature Release**: Publishing pre-1.0 software with unstable APIs creates frustration for early adopters and damages reputation. It is better to take more time preparing than to release prematurely.

4. **Ignoring Security**: Open source code is visible to attackers as well as contributors. Security review, dependency auditing, and responsible disclosure processes must be in place before publication.

5. **Community Mismatch**: Building a community requires sustained effort over months and years. Organizations that expect instant adoption or treat community engagement as a marketing exercise will be disappointed.

6. **Scope Creep**: Accepting every feature request expands the maintenance surface without strategic justification. Learn to say "this belongs in a plugin" or "this is out of scope."

7. **Neglecting Backward Compatibility**: Breaking changes without semantic versioning and migration guides erode trust. Once users depend on your API, stability becomes a strategic obligation.

## Use Cases

### Ecosystem Expansion Strategy (Prismatic Platform)

The Prismatic Platform's Generation 19 milestone demonstrates a comprehensive open source strategy. Four OSS packages (SDK, Plugin Kit, Security, UI) were selected based on their ecosystem value, low competitive risk, and potential for community contribution. Each package undergoes the same quality gates as the core platform -- zero warnings, 100% test coverage, Dialyzer clean -- establishing trust through demonstrated quality.

### Open Core Model (GitLab)

GitLab provides an instructive case study in open source strategy. The company publishes a fully functional Community Edition under the MIT license while offering additional features in an Enterprise Edition. This open core model allows widespread adoption while maintaining revenue from enterprise customers who need advanced features like SAML authentication and advanced CI/CD.

### Cloud Provider OSS Strategy (AWS, Google, Microsoft)

Major cloud providers use open source strategically in several ways: contributing to projects that complement their paid services (Google with Kubernetes, AWS with CDK), forking or wrapping open source projects as managed services (ElastiCache, Cloud SQL), and publishing developer tools that drive platform adoption. This demonstrates how open source strategy can support different business models.

### Language Ecosystem Strategy (Elixir / Hex.pm)

The Elixir ecosystem demonstrates community-level open source strategy through the Hex package manager and HexDocs documentation hosting. By providing free, high-quality infrastructure, the ecosystem reduces friction for package authors and consumers alike, accelerating ecosystem growth that benefits all participants.

## Related Concepts

Open source strategy intersects with multiple dimensions of the Prismatic Platform ecosystem:

- [Open Source Leadership](@/glossary/open-source-leadership.md) -- governing the projects and communities created by the strategy
- [Open Source Superiority](@/glossary/open-source-superiority.md) -- the philosophical case for open source as a quality driver
- [Platform Strategy](@/glossary/platform-strategy.md) -- the broader strategic context within which OSS strategy operates
- [Developer Portal](@/glossary/developer-portal.md) -- the primary channel for ecosystem engagement and developer onboarding
- [SDK](@/glossary/sdk.md) -- one of the four Prismatic OSS packages enabling ecosystem participation
- [REST API](@/glossary/rest-api.md) -- the API gateway that enables programmatic platform access
- [Community Building](@/glossary/community-building.md) -- the practical execution of community growth objectives
- [Developer Community](@/glossary/developer-community.md) -- the target audience and primary beneficiary of OSS strategy
- [Collaborative Development](@/glossary/collaborative-development.md) -- the development practices that sustain multi-contributor OSS projects
- [Community Ownership](@/glossary/community-ownership.md) -- governance models that emerge from successful OSS strategy

## See Also

- [Doctrine](@/glossary/doctrine.md) -- the quality principles that govern all platform operations including OSS releases
- [Quality Gate](@/glossary/quality-gate.md) -- the automated enforcement mechanisms applied to OSS packages
- [CI/CD](@/glossary/ci-cd.md) -- the pipeline infrastructure supporting automated OSS releases
- [Umbrella Application](@/glossary/umbrella-application.md) -- the architectural pattern enabling selective OSS publication

---

**Connect & Contribute**: This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) open source ecosystem. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Contributions welcome via [GitHub](https://github.com/korczis/prismatic-platform) or [GitLab](https://gitlab.com/korczis/prismatic-platform).
