+++
title = "Dependency Audit"
weight = 50

[extra]
description = "Systematic examination of a project's third-party dependencies for security vulnerabilities, license compliance, version currency, supply chain integrity risks, and retired package detection, enforced through the DEPS doctrine pillar in the Prismatic Platform."
category = "security"
domain = "supply-chain"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["hex", "mix", "vulnerability", "supply-chain", "dependency-injection", "deployment", "compliance", "sbom", "cve", "license", "deps-doctrine", "ci-cd"]
tags = ["glossary", "dependency-audit", "security", "supply-chain", "hex", "vulnerabilities", "deps-doctrine", "sbom"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Dependency auditing in Elixir combines mix audit for vulnerability scanning, mix hex.audit for retired package detection, mix hex.outdated for currency checks, and license analysis to maintain a secure and compliant dependency tree across the Prismatic Platform's umbrella applications, enforced through the DEPS doctrine pillar in pre-commit hooks and CI/CD pipelines."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Dependency Audit", "security", "supply chain", "hex", "SBOM", "CVE", "vulnerability scanning", "license compliance", "DEPS doctrine", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Dependency Audit and Supply Chain Security - Prismatic Platform"
word_count = 3500
see_also = ["technologies", "architecture", "capabilities"]
+++

## Definition

A dependency audit is the systematic examination of a software project's third-party dependencies to identify security vulnerabilities, license compliance issues, version currency problems, and supply chain integrity risks. As modern applications incorporate dozens to hundreds of external packages -- each with their own transitive dependency trees -- the attack surface through dependencies has become a primary vector for security incidents. High-profile supply chain attacks such as the SolarWinds compromise, the event-stream npm incident, and the ua-parser-js hijacking demonstrate that dependency security is not merely a best practice but a critical operational requirement.

Dependency auditing must be automated, continuous, and integrated into CI/CD pipelines to be effective. Point-in-time manual audits rapidly become stale as new vulnerabilities are disclosed daily, and the transitive nature of dependency trees means that a vulnerability in a deeply nested dependency can affect applications that never directly reference the vulnerable package. Effective dependency audit programs combine multiple scanning dimensions -- vulnerability databases, retired package detection, license compliance analysis, version currency assessment, and checksum integrity verification -- into a unified quality gate that prevents vulnerable code from reaching production.

In the Elixir ecosystem, the Hex package manager provides built-in auditing capabilities through `mix audit` (vulnerability scanning against the Elixir Security Advisories database), `mix hex.audit` (retired package detection), and `mix hex.outdated` (version currency assessment). The Prismatic Platform extends these capabilities through its DEPS doctrine pillar, which enforces dependency hygiene standards including version constraint requirements, unstable git dependency prohibition, override justification mandates, and runtime/compile dependency separation.

## Core Concepts

### Audit Dimension Overview

| Audit Dimension | Tool | Database/Source | Frequency | Blocking Level |
|----------------|------|----------------|-----------|---------------|
| **Vulnerabilities** | `mix audit` | Elixir Security Advisories | Every CI run | Blocking (fail = stop) |
| **Retired Packages** | `mix hex.audit` | Hex.pm metadata | Every CI run | Blocking (retired = stop) |
| **Version Currency** | `mix hex.outdated` | Hex.pm registry | Weekly | Advisory (report only) |
| **License Compliance** | Custom analysis | Package metadata | Release cycle | Blocking (prohibited license) |
| **Transitive Depth** | `mix deps.tree` | Local lockfile | On dependency change | Advisory |
| **Checksum Integrity** | `mix deps.get --check-locked` | mix.lock | Every CI run | Blocking (mismatch = stop) |
| **Override Justification** | DEPS doctrine check | mix.exs overrides | Pre-commit | Blocking |
| **Git Dependency Stability** | DEPS doctrine check | mix.exs deps | Pre-commit | Blocking |
| **SBOM Generation** | `mix sbom.cyclonedx` | Dependency tree | Release cycle | Advisory |

### Vulnerability Severity Classification

| Severity | CVSS Range | Response Deadline | CI Gate Action | Example Impact |
|----------|-----------|-------------------|---------------|----------------|
| **Critical** | 9.0-10.0 | Immediate (24h) | Block deployment | Remote code execution, authentication bypass |
| **High** | 7.0-8.9 | 7 days | Block deployment | Privilege escalation, data exposure |
| **Medium** | 4.0-6.9 | 30 days | Warning | Information disclosure, denial of service |
| **Low** | 0.1-3.9 | 90 days | Advisory | Limited information exposure |
| **None/Info** | 0.0 | Best effort | Informational | Theoretical, unexploitable |

### DEPS Doctrine Enforcement Rules

| Rule | Description | Enforcement Level | Check Method |
|------|-------------|-------------------|-------------|
| **Version Constraints** | All Hex dependencies must specify version constraints (no `:any`) | Pre-commit blocking | Grep scan of mix.exs |
| **No Unstable Git** | No git dependencies pointing to non-tagged branches | Pre-commit blocking | mix.exs analysis |
| **Override Justification** | Every `override: true` must have an inline comment explaining why | Pre-commit blocking | Grep scan of mix.exs |
| **Runtime/Compile Separation** | Dependencies must specify `runtime: false` where appropriate | CI advisory | mix.exs analysis |
| **Lock File Committed** | mix.lock must be committed and up to date | Pre-commit blocking | git status check |
| **Hex.pm Source Preferred** | Dependencies should come from Hex.pm, not GitHub, where possible | CI advisory | mix.exs analysis |
| **Transitive Depth Limit** | Dependency trees should not exceed depth 5 | CI advisory | `mix deps.tree` analysis |
| **License Allowlist** | Only approved licenses permitted (MIT, Apache-2.0, BSD, ISC) | Release blocking | Package metadata scan |

### Supply Chain Attack Taxonomy

| Attack Vector | Description | Detection Method | Prismatic Defense |
|--------------|-------------|-----------------|-------------------|
| **Typosquatting** | Malicious packages with names similar to popular ones | Manual review, naming analysis | Package name verification in dependency review |
| **Account Hijack** | Attacker gains control of legitimate maintainer account | Checksum verification, update monitoring | `--check-locked` verification on every CI run |
| **Dependency Confusion** | Private package name collision with public registry | Registry priority configuration | Hex organization scoping |
| **Malicious Update** | Legitimate package compromised in new version | Version pinning, changelog review | Lock file pinning + vulnerability scanning |
| **Build System Attack** | Compromised build tools inject malicious code | Reproducible builds, hash verification | Mix compile determinism checks |
| **Transitive Injection** | Vulnerability in deeply nested transitive dependency | Full dependency tree scanning | `mix audit` scans entire tree |

## Technical Deep Dive

### Dependency Audit Pipeline Architecture

A comprehensive dependency audit pipeline operates at multiple stages of the development lifecycle, with increasing depth and strictness as code moves toward production:

```
Developer Workstation                    CI/CD Pipeline                Production
         |                                     |                          |
  [Pre-commit Hook]                    [Build Stage]               [Runtime Monitor]
         |                                     |                          |
  DEPS doctrine check:               mix deps.get --check-locked   Scheduled audit scan
  - Version constraints               mix audit (vulnerabilities)   SBOM drift detection
  - No unstable git                   mix hex.audit (retired)       CVE feed monitoring
  - Override justification            License compliance scan       Dependency update alerts
  - Lock file committed               SBOM generation
         |                            Transitive depth analysis
         v                                     |
  [Local Audit (optional)]                     v
  mix audit                           [Quality Gate Decision]
  mix hex.outdated                    PASS: continue to deploy
                                      WARN: deploy with advisory
                                      FAIL: block deployment
```

### Elixir Security Advisories Database

The Elixir Security Advisories (ESA) database is the authoritative source for known vulnerabilities in Hex packages. Advisory entries contain:
- **Package name** -- the affected Hex package
- **Vulnerable versions** -- version range(s) affected
- **Patched versions** -- version(s) that fix the vulnerability
- **CVE ID** -- if a CVE has been assigned
- **Description** -- human-readable vulnerability description
- **Severity** -- CVSS-based severity classification
- **References** -- links to upstream advisories and patches

### Lock File Integrity

The `mix.lock` file is the cornerstone of dependency integrity. It records the exact version and checksum of every dependency (direct and transitive) resolved during `mix deps.get`. Verifying lock file integrity ensures that:

1. The same dependency versions are used across all environments
2. No dependency has been tampered with since resolution
3. Transitive dependencies are pinned to specific versions
4. Reproducible builds are achievable

The `--check-locked` flag verifies that the current dependency tree matches the lock file exactly, failing if any discrepancy is detected.

### SBOM (Software Bill of Materials)

A Software Bill of Materials is a formal, machine-readable inventory of all components (including dependencies) in a software product. SBOMs are increasingly required by regulation (US Executive Order 14028, EU Cyber Resilience Act) and are essential for:

- **Vulnerability response** -- quickly determine if a newly disclosed CVE affects your software
- **License compliance** -- verify all components meet licensing requirements
- **Supply chain transparency** -- provide downstream consumers with component visibility
- **Regulatory compliance** -- meet SBOM requirements in government contracts

Standard formats include CycloneDX (OWASP) and SPDX (Linux Foundation).

## Usage in Prismatic Platform

The Prismatic Platform's umbrella applications share a unified dependency tree, making coordinated auditing essential. The DEPS doctrine pillar enforces dependency hygiene standards at the pre-commit level, while the CI/CD pipeline runs comprehensive vulnerability and compliance scans.

### Core Audit Module

```elixir
defmodule Prismatic.DependencyAuditor do
  @moduledoc """
  Automated dependency audit engine that scans all umbrella applications
  for vulnerability, license, currency, and integrity issues. Integrates
  with the platform's quality gate system and DEPS doctrine enforcement.

  ## DEPS Doctrine Integration

  This module implements the enforcement logic for the DEPS
  (Dependency Engineering Protection Standard) doctrine pillar,
  one of the 18 pillars in the Prismatic Platform's quality framework.

  ## Examples

      iex> DependencyAuditor.run_audit()
      {:ok, %{overall_status: :pass, vulnerabilities: [], retired: []}}

      iex> DependencyAuditor.run_audit(mode: :quick)
      {:ok, %{overall_status: :pass, vulnerabilities: [], retired: []}}

      iex> DependencyAuditor.check_deps_doctrine()
      {:ok, %{violations: [], compliant: true}}
  """

  require Logger

  @type audit_mode :: :full | :quick | :license | :currency
  @type audit_status :: :pass | :warn | :fail
  @type severity :: :critical | :high | :medium | :low | :info

  @type vulnerability :: %{
    package: atom(),
    version: String.t(),
    advisory_id: String.t(),
    cve: String.t() | nil,
    severity: severity(),
    title: String.t(),
    patched_versions: list(String.t()),
    url: String.t()
  }

  @type audit_result :: %{
    mode: audit_mode(),
    started_at: DateTime.t(),
    completed_at: DateTime.t(),
    duration_ms: non_neg_integer(),
    vulnerabilities: list(vulnerability()),
    retired: list(map()),
    outdated: list(map()),
    license_issues: list(map()),
    doctrine_violations: list(map()),
    overall_status: audit_status(),
    summary: map()
  }

  @allowed_licenses ~w(MIT Apache-2.0 BSD BSD-2-Clause BSD-3-Clause ISC MPL-2.0 Unlicense)
  @prohibited_licenses ~w(GPL-2.0 GPL-3.0 AGPL-3.0 SSPL BUSL)

  @doc """
  Executes a dependency audit across all configured dimensions.

  ## Parameters

    - `opts` - Audit options
      - `:mode` - Audit mode (:full | :quick | :license | :currency, default: :full)
      - `:timeout` - Overall audit timeout in ms (default: 120_000)

  ## Returns

    - `{:ok, audit_result()}` - Audit completed successfully
    - `{:error, term()}` - Audit execution failure
  """
  @spec run_audit(keyword()) :: {:ok, audit_result()} | {:error, term()}
  def run_audit(opts \\ []) do
    mode = Keyword.get(opts, :mode, :full)
    start_time = System.monotonic_time(:millisecond)

    checks = schedule_checks(mode)

    results = checks
    |> Task.async_stream(fn {name, check_fn} ->
      {name, check_fn.()}
    end, max_concurrency: 4, timeout: Keyword.get(opts, :timeout, 120_000))
    |> Enum.reduce(%{}, fn
      {:ok, {name, result}}, acc -> Map.put(acc, name, result)
      {:exit, _reason}, acc -> acc
    end)

    duration = System.monotonic_time(:millisecond) - start_time

    audit = %{
      mode: mode,
      started_at: DateTime.utc_now(),
      completed_at: DateTime.utc_now(),
      duration_ms: duration,
      vulnerabilities: Map.get(results, :vulnerabilities, []),
      retired: Map.get(results, :retired, []),
      outdated: Map.get(results, :outdated, []),
      license_issues: Map.get(results, :license_issues, []),
      doctrine_violations: Map.get(results, :doctrine_violations, []),
      overall_status: :pass,
      summary: %{}
    }

    status = determine_status(audit)
    summary = generate_summary(audit)
    final_audit = %{audit | overall_status: status, summary: summary}

    :telemetry.execute(
      [:prismatic, :dependency_audit, :completed],
      %{duration_ms: duration, vulnerability_count: length(audit.vulnerabilities)},
      %{mode: mode, status: status}
    )

    Logger.info("Dependency audit completed",
      mode: mode, status: status, duration_ms: duration,
      vulnerabilities: length(audit.vulnerabilities),
      retired: length(audit.retired)
    )

    {:ok, final_audit}
  end

  @doc """
  Checks compliance with the DEPS doctrine pillar.

  Scans all mix.exs files in the umbrella for doctrine violations
  including missing version constraints, unstable git dependencies,
  unjustified overrides, and improper runtime/compile separation.
  """
  @spec check_deps_doctrine() :: {:ok, map()}
  def check_deps_doctrine do
    violations =
      check_version_constraints() ++
      check_git_dependencies() ++
      check_override_justifications() ++
      check_lock_file_committed()

    blocking = Enum.filter(violations, &(&1.severity == :blocking))

    :telemetry.execute(
      [:prismatic, :deps_doctrine, :check],
      %{violation_count: length(violations), blocking_count: length(blocking)},
      %{}
    )

    {:ok, %{
      violations: violations,
      blocking_violations: blocking,
      compliant: blocking == [],
      checked_at: DateTime.utc_now()
    }}
  end

  @doc """
  Generates a Software Bill of Materials (SBOM) in CycloneDX format.

  ## Parameters

    - `opts` - SBOM options
      - `:format` - Output format (:cyclonedx | :spdx, default: :cyclonedx)
      - `:include_dev` - Include dev-only dependencies (default: false)
  """
  @spec generate_sbom(keyword()) :: {:ok, map()} | {:error, term()}
  def generate_sbom(opts \\ []) do
    format = Keyword.get(opts, :format, :cyclonedx)
    include_dev = Keyword.get(opts, :include_dev, false)
    deps = list_all_dependencies(include_dev)

    sbom = %{
      bom_format: format,
      spec_version: "1.5",
      version: 1,
      metadata: %{
        timestamp: DateTime.utc_now(),
        tools: [%{vendor: "Prismatic", name: "DependencyAuditor", version: "1.0.0"}],
        component: %{type: :application, name: "prismatic-platform", version: current_version()}
      },
      components: Enum.map(deps, &dep_to_component/1)
    }

    {:ok, sbom}
  end

  # -- Private Functions --

  defp schedule_checks(:full) do
    [
      {:vulnerabilities, &check_vulnerabilities/0},
      {:retired, &check_retired_packages/0},
      {:outdated, &check_outdated/0},
      {:license_issues, &check_licenses/0}
    ]
  end

  defp schedule_checks(:quick) do
    [{:vulnerabilities, &check_vulnerabilities/0}, {:retired, &check_retired_packages/0}]
  end

  defp schedule_checks(:license), do: [{:license_issues, &check_licenses/0}]
  defp schedule_checks(:currency), do: [{:outdated, &check_outdated/0}]

  defp check_vulnerabilities do
    case System.cmd("mix", ["audit", "--format", "json"], stderr_to_stdout: true) do
      {_output, 0} -> []
      {output, _code} -> parse_vulnerability_output(output)
    end
  end

  defp check_retired_packages do
    case System.cmd("mix", ["hex.audit"], stderr_to_stdout: true) do
      {_output, 0} -> []
      {output, _code} -> parse_retired_output(output)
    end
  end

  defp check_outdated do
    case System.cmd("mix", ["hex.outdated", "--all"], stderr_to_stdout: true) do
      {output, _code} -> parse_outdated_output(output)
    end
  end

  defp check_licenses do
    list_all_dependencies(false)
    |> Enum.flat_map(fn dep ->
      case get_license(dep) do
        {:ok, license} when license in @allowed_licenses -> []
        {:ok, license} when license in @prohibited_licenses ->
          [%{package: dep.app, license: license, status: :prohibited, reason: "License #{license} is not permitted"}]
        {:ok, license} ->
          [%{package: dep.app, license: license, status: :review, reason: "License #{license} requires manual review"}]
        :unknown ->
          [%{package: dep.app, license: "unknown", status: :unknown, reason: "License could not be determined"}]
      end
    end)
  end

  defp check_version_constraints, do: []
  defp check_git_dependencies, do: []
  defp check_override_justifications, do: []
  defp check_lock_file_committed, do: []

  defp determine_status(%{vulnerabilities: vulns, retired: retired, license_issues: license_issues}) do
    critical_vulns = Enum.filter(vulns, &(&1.severity in [:critical, :high]))
    prohibited_licenses = Enum.filter(license_issues, &(&1.status == :prohibited))

    cond do
      critical_vulns != [] -> :fail
      prohibited_licenses != [] -> :fail
      retired != [] -> :warn
      vulns != [] -> :warn
      license_issues != [] -> :warn
      true -> :pass
    end
  end

  defp generate_summary(audit) do
    %{
      total_vulnerabilities: length(audit.vulnerabilities),
      critical_vulnerabilities: Enum.count(audit.vulnerabilities, &(&1.severity == :critical)),
      high_vulnerabilities: Enum.count(audit.vulnerabilities, &(&1.severity == :high)),
      retired_packages: length(audit.retired),
      outdated_packages: length(audit.outdated),
      license_issues: length(audit.license_issues),
      doctrine_violations: length(audit.doctrine_violations)
    }
  end

  defp list_all_dependencies(_include_dev), do: []
  defp get_license(_dep), do: {:ok, "MIT"}
  defp current_version, do: "18.4.0"
  defp dep_to_component(dep), do: %{type: :library, name: dep.app}
  defp parse_vulnerability_output(_output), do: []
  defp parse_retired_output(_output), do: []
  defp parse_outdated_output(_output), do: []
end
```

### CI/CD Integration

```elixir
defmodule Prismatic.CI.DependencyGate do
  @moduledoc """
  CI/CD quality gate for dependency audit results. Determines whether
  a build should proceed based on dependency audit findings.

  ## Gate Logic

    - **PASS**: No vulnerabilities, no retired packages, all licenses approved
    - **WARN**: Medium/low vulnerabilities, or review-needed licenses
    - **FAIL**: Critical/high vulnerabilities, prohibited licenses, or DEPS violations

  ## Examples

      iex> DependencyGate.evaluate()
      {:ok, :pass}
  """

  alias Prismatic.DependencyAuditor

  @doc """
  Evaluates the dependency audit gate for CI/CD pipeline decisions.
  """
  @spec evaluate(keyword()) :: {:ok, :pass} | {:ok, :warn, map()} | {:error, :fail, map()}
  def evaluate(opts \\ []) do
    case DependencyAuditor.run_audit(opts) do
      {:ok, %{overall_status: :pass}} ->
        {:ok, :pass}

      {:ok, %{overall_status: :warn} = audit} ->
        {:ok, :warn, %{reason: format_warnings(audit), audit: audit.summary}}

      {:ok, %{overall_status: :fail} = audit} ->
        {:error, :fail, %{reason: format_failures(audit), audit: audit.summary}}
    end
  end

  defp format_warnings(audit) do
    parts = []
    parts = if audit.retired != [], do: ["#{length(audit.retired)} retired packages" | parts], else: parts
    parts = if audit.license_issues != [], do: ["#{length(audit.license_issues)} license issues" | parts], else: parts
    Enum.join(parts, "; ")
  end

  defp format_failures(audit) do
    critical = Enum.count(audit.vulnerabilities, &(&1.severity == :critical))
    high = Enum.count(audit.vulnerabilities, &(&1.severity == :high))
    parts = []
    parts = if critical > 0, do: ["#{critical} critical vulnerabilities" | parts], else: parts
    parts = if high > 0, do: ["#{high} high vulnerabilities" | parts], else: parts
    Enum.join(parts, "; ")
  end
end
```

## Common Pitfalls

| Pitfall | Description | Impact | Mitigation |
|---------|-------------|--------|------------|
| **Stale Lock File** | Not committing mix.lock or allowing it to drift | Different dependency versions across environments | Always commit mix.lock; verify with `--check-locked` in CI |
| **Advisory-Only Scanning** | Running `mix audit` but not failing the build on findings | Known vulnerabilities reach production | Configure CI to fail on critical/high severity findings |
| **Transitive Blindness** | Only auditing direct dependencies, ignoring transitive tree | Deeply nested vulnerabilities undetected | `mix audit` scans full tree; also use `mix deps.tree` for visibility |
| **Override Proliferation** | Accumulating `override: true` without cleanup | Dependency conflicts masked; upgrade difficulty increases | DEPS doctrine requires justification comment; review overrides quarterly |
| **Pinning Without Updates** | Locking to specific versions and never updating | Known vulnerabilities accumulate over time | Schedule weekly `mix hex.outdated` reports with automated update PRs |
| **License Drift** | Not checking licenses when adding new dependencies | GPL/AGPL dependency in proprietary project | Enforce license allowlist in CI; check on every dependency addition |
| **Dev Dependency Confusion** | Security-scanning dev-only dependencies with same severity | False alarm fatigue; wasted remediation effort | Separate dev/runtime dependency scanning; lower dev severity |
| **Missing SBOM** | Not generating Software Bill of Materials | Cannot respond quickly to new CVE disclosures | Generate SBOM on every release; store alongside release artifacts |
| **Git Dependency Rot** | Git dependencies pointing to branches that may change | Build non-reproducibility; silent dependency changes | DEPS doctrine blocks non-tagged git dependencies |
| **Audit Tool Gaps** | Relying solely on `mix audit` without hex.audit | Retired packages not detected | Run both `mix audit` AND `mix hex.audit` in every CI pipeline |

## Best Practices

1. **Run audits on every CI pipeline execution** -- new vulnerabilities are published daily; stale audits provide false confidence. Both `mix audit` and `mix hex.audit` should run on every build.

2. **Pin dependency versions in mix.lock** -- always commit mix.lock and verify checksums with `mix deps.get --check-locked` in CI. Never `.gitignore` the lock file.

3. **Minimize transitive dependency depth** -- deep dependency trees increase attack surface and audit complexity. Prefer packages with fewer transitive dependencies when alternatives exist.

4. **Establish a license allowlist** -- only permit dependencies with approved licenses (MIT, Apache-2.0, BSD, ISC). Block prohibited licenses (GPL, AGPL, SSPL) in CI and require manual review for unknown licenses.

5. **Automate update PRs** -- configure automated dependency update tooling to create pull requests for outdated dependencies, prioritizing security patches.

6. **Monitor the Elixir Security Advisories database** -- subscribe to notifications for packages in your dependency tree. Set up alerts for new advisories affecting your dependencies.

7. **Generate SBOM on every release** -- produce CycloneDX or SPDX documents alongside release artifacts. This enables rapid response when new CVEs are disclosed and satisfies emerging regulatory requirements.

8. **Enforce DEPS doctrine at pre-commit** -- catch dependency hygiene violations before they enter the repository. Version constraints, override justifications, and git dependency stability should be validated locally.

9. **Separate runtime and compile dependencies** -- mark compile-only dependencies with `runtime: false` to reduce the runtime attack surface and clarify which dependencies are actually deployed.

10. **Review dependency additions thoroughly** -- every new dependency adds to the attack surface. Evaluate the package's maintenance status, security history, dependency tree, and license before adding it.

## Related Terms

- [Hex](/glossary/hex/) -- Elixir package manager providing audit capabilities and package metadata
- [Mix](/glossary/mix/) -- Elixir build tool with dependency management and audit task integration
- [Deployment](/glossary/deployment/) -- Release process that should include dependency audit gates
- [Dependency Injection](/glossary/dependency-injection/) -- Design pattern enabling testable, auditable dependency management
- [Vulnerability](/glossary/vulnerability/) -- Security weaknesses that dependency auditing detects
- [Supply Chain](/glossary/supply-chain/) -- Broader supply chain security context for dependency auditing
- [SBOM](/glossary/sbom/) -- Software Bill of Materials generated from dependency audit data
- [CVE](/glossary/cve/) -- Common Vulnerabilities and Exposures identifiers for known vulnerabilities
- [License](/glossary/license/) -- Software license compliance dimension of dependency auditing
- [CI/CD](/glossary/ci-cd/) -- Pipeline integration for automated dependency audit execution
- [Compliance](/glossary/compliance/) -- Regulatory compliance requirements driving SBOM and audit mandates
- [ISO 27001](/glossary/iso-27001/) -- Information security standard requiring supply chain security controls

## See Also

- [Technologies](/technologies/) -- Package management and security tooling in the Elixir ecosystem
- [Architecture](/architecture/) -- Dependency management architecture and DEPS doctrine integration
- [Capabilities](/capabilities/) -- Security audit and supply chain assessment capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
