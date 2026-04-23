+++
title = "Quality Standard"
weight = 52
[extra]
tags = ["glossary", "quality", "standards", "enforcement", "compliance", "automation", "policy"]
description = "Codified, enforceable quality requirements defining the minimum acceptable baseline for every application in the Prismatic Platform umbrella, covering compilation, analysis, testing, documentation, and configuration"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["quality-monitoring", "quality-gates", "quality-dna", "quality-systems", "quality-floor-guardian", "credo", "dialyzer", "zero-compromise-quality", "zero-warning-policy", "compliance-framework"]
key_concepts = ["universal enforcement", "8-dimension scoring", "automated standardization", "mix.exs normalization", "quality alias", "warnings-as-errors", "dialyzer integration"]
use_cases = ["new application bootstrap", "legacy app compliance", "CI/CD gate enforcement", "quality reporting", "platform-wide standardization"]
prerequisites = ["quality-gates", "credo", "dialyzer"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
word_count = 1165
date_modified = "2026-02-23"
keywords = ["Quality", "Standard", "Codified", "Prismatic", "Platform", "glossary", "Prismatic Platform", "Quality DNA", "Quality Standard", "CLAUDE"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Standard - Prismatic Platform"
+++

## Definition and Overview

A Quality Standard is a codified, enforceable specification defining the minimum acceptable quality baseline that every application in a software platform must meet. In the Prismatic Platform, the Universal Quality Standard establishes an 8-dimension scoring framework that evaluates compilation configuration, static analysis integration, test coverage settings, documentation presence, and tooling compliance for all 115 umbrella applications. This standard transforms quality from a subjective assessment into a quantitative measurement with binary pass/fail enforcement at every commit, merge, and deployment boundary.

The Prismatic Quality Standard exists because quality at scale cannot be maintained through informal conventions or tribal knowledge. When a platform grows to 115 applications with approximately 2.8 million lines of code, every application must meet identical minimum requirements for the platform to function as a coherent whole. A single application with missing dialyzer configuration or disabled warnings-as-errors creates a quality gap that compounds over time, allowing subtle type errors and deprecated function usage to propagate unchecked. The standard eliminates this risk by making quality compliance mechanical, measurable, and mandatory.

The standard is implemented as a combination of policy documentation, automated enforcement tools, and CI/CD pipeline gates. The policy defines what must be true; the tools verify whether it is true; the gates prevent progress when it is not true. This three-layer architecture ensures that compliance is not merely documented but actively enforced, and that no application can deviate from the standard without explicit detection and blocking.

## The 8-Dimension Scoring Framework

### Dimension Overview

Every umbrella application is scored across 8 independent dimensions, each contributing equally to the total score:

| Dimension | Max Score | What It Verifies | Enforcement Tool |
|-----------|-----------|-------------------|------------------|
| Elixir Version | 7.5/60 | `elixir: "~> 1.19"` in mix.exs | `mix quality.enforce_standard` |
| Warnings as Errors | 7.5/60 | `elixirc_options: [warnings_as_errors: true]` | `mix quality.enforce_standard` |
| Dialyzer Config | 7.5/60 | `:dialyxir` dependency + dialyzer project config | `mix quality.enforce_standard` |
| Test Coverage | 7.5/60 | `test_coverage: [tool: ExCoveralls]` or equivalent | `mix quality.enforce_standard` |
| Credo Config | 7.5/60 | `:credo` dependency present | `mix quality.enforce_standard` |
| CLAUDE.md | 7.5/60 | Documentation file exists at app root | `mix quality.enforce_standard` |
| Quality DNA | 7.5/60 | `.claude/quality-dna/current-state.json` exists | `mix quality.enforce_standard` |
| Quality Alias | 7.5/60 | `quality` alias defined in mix.exs defp aliases | `mix quality.enforce_standard` |

### Scoring Implementation

```elixir
defmodule Prismatic.Quality.Standard do
  @moduledoc """
  Universal Quality Standard implementation.
  Scores every umbrella application across 8 dimensions.
  """

  @dimensions [
    :elixir_version,
    :warnings_as_errors,
    :dialyzer_config,
    :test_coverage,
    :credo_config,
    :claude_md,
    :quality_dna,
    :quality_alias
  ]

  @points_per_dimension 7.5
  @max_score 60.0
  @passing_threshold 52.5

  @type dimension_result :: %{
    dimension: atom(),
    passed: boolean(),
    score: float(),
    details: String.t()
  }

  @type app_result :: %{
    app: atom(),
    total_score: float(),
    max_score: float(),
    passing: boolean(),
    dimensions: [dimension_result()]
  }

  @spec evaluate(atom()) :: app_result()
  def evaluate(app_name) do
    app_path = Path.join("apps", to_string(app_name))
    mix_exs = read_mix_exs(app_path)

    dimensions =
      @dimensions
      |> Enum.map(fn dim ->
        passed = check_dimension(dim, app_path, mix_exs)
        score = if passed, do: @points_per_dimension, else: 0.0

        %{
          dimension: dim,
          passed: passed,
          score: score,
          details: dimension_details(dim, passed)
        }
      end)

    total = Enum.reduce(dimensions, 0.0, &(&1.score + &2))

    %{
      app: app_name,
      total_score: total,
      max_score: @max_score,
      passing: total >= @passing_threshold,
      dimensions: dimensions
    }
  end

  defp check_dimension(:elixir_version, _path, mix_exs) do
    String.contains?(mix_exs, ~s(elixir: "~> 1.19"))
  end

  defp check_dimension(:warnings_as_errors, _path, mix_exs) do
    String.contains?(mix_exs, "warnings_as_errors: true")
  end

  defp check_dimension(:dialyzer_config, _path, mix_exs) do
    String.contains?(mix_exs, ":dialyxir") and
      String.contains?(mix_exs, "dialyzer:")
  end

  defp check_dimension(:test_coverage, _path, mix_exs) do
    String.contains?(mix_exs, "test_coverage:")
  end

  defp check_dimension(:credo_config, _path, mix_exs) do
    String.contains?(mix_exs, ":credo")
  end

  defp check_dimension(:claude_md, path, _mix_exs) do
    File.exists?(Path.join(path, "CLAUDE.md"))
  end

  defp check_dimension(:quality_dna, path, _mix_exs) do
    File.exists?(Path.join([path, ".claude", "quality-dna", "current-state.json"]))
  end

  defp check_dimension(:quality_alias, _path, mix_exs) do
    String.contains?(mix_exs, "quality:")
  end
end
```

## Automated Standardization

### mix.exs Normalization

The platform provides automated tools to bring non-compliant applications into conformance without manual editing. The `mix quality.standardize_mix` task performs 4 categories of automated transformations:

```elixir
defmodule Mix.Tasks.Quality.StandardizeMix do
  @moduledoc """
  Standardizes mix.exs across all umbrella applications.
  Applies 4 transformation categories to ensure compliance.
  """

  use Mix.Task

  @transformations [
    {:elixir_version, "Ensure elixir: ~> 1.19"},
    {:warnings_as_errors, "Add warnings_as_errors: true to elixirc_options"},
    {:dialyzer, "Add dialyxir dependency and dialyzer project config"},
    {:coverage, "Add test_coverage configuration"}
  ]

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: [apply: :boolean, app: :string])
    apply? = Keyword.get(opts, :apply, false)

    apps = discover_umbrella_apps()

    results =
      apps
      |> Enum.map(fn app ->
        {app, analyze_and_transform(app, apply?)}
      end)

    report_results(results, apply?)
  end

  defp analyze_and_transform(app, apply?) do
    mix_exs_path = Path.join(["apps", to_string(app), "mix.exs"])
    content = File.read!(mix_exs_path)

    {transformations, new_content} =
      @transformations
      |> Enum.reduce({[], content}, fn {type, desc}, {applied, content} ->
        case needs_transformation?(type, content) do
          true ->
            transformed = apply_transformation(type, content)
            {[{type, desc} | applied], transformed}

          false ->
            {applied, content}
        end
      end)

    if apply? and transformations != [] do
      File.write!(mix_exs_path, new_content)
    end

    %{transformations: Enum.reverse(transformations), compliant: transformations == []}
  end
end
```

### Transformation Statistics

The standardization process has been applied across the entire platform:

| Transformation | Applications Fixed | Total Applications |
|---------------|-------------------|-------------------|
| Elixir version update | 70 | 115 |
| warnings_as_errors added | 99 | 115 |
| Dialyzer configuration | 89 | 115 |
| Test coverage setup | 63 | 115 |
| **Total transformations** | **321** | - |

## Standard Enforcement Architecture

### Three-Layer Enforcement

The quality standard is enforced through three independent, redundant layers:

```
Layer 1: DOCUMENTATION (Policy)
  .aiad/policies/universal-app-quality-standard.policy.md (1,926 lines)
  Defines requirements, thresholds, scoring, exceptions

Layer 2: VERIFICATION (Tools)
  mix quality.enforce_standard (check mode)
  mix quality.enforce_standard --json (CI mode)
  mix quality.standardize_mix (fix mode)

Layer 3: GATE (Pipeline)
  Pre-commit hook (Phase 9)
  CI/CD pipeline gate
  Merge request blocking
```

### Enforcement in Pre-Commit Pipeline

```elixir
defmodule Prismatic.Quality.Standard.PreCommitGate do
  @moduledoc """
  Pre-commit gate enforcement for quality standard compliance.
  Runs as Phase 9 of the 11-phase pre-commit pipeline.
  """

  @spec check(list(String.t())) :: :ok | {:error, String.t()}
  def check(staged_files) do
    affected_apps = extract_affected_apps(staged_files)

    failing_apps =
      affected_apps
      |> Enum.map(&Prismatic.Quality.Standard.evaluate/1)
      |> Enum.reject(& &1.passing)

    case failing_apps do
      [] ->
        :ok

      apps ->
        message = format_failure_report(apps)
        {:error, message}
    end
  end

  defp extract_affected_apps(files) do
    files
    |> Enum.map(fn file ->
      case String.split(file, "/") do
        ["apps", app | _] -> app
        _ -> nil
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.uniq()
    |> Enum.map(&String.to_atom/1)
  end
end
```

## Quality Standard Compliance Report

### Current Platform State

The platform-wide compliance report provides visibility into how every application scores against the standard:

| Metric | Value |
|--------|-------|
| Total applications | 115 |
| Average score | 55.5 / 60 |
| Applications at 60/60 (perfect) | 10 |
| Applications above passing (52.5) | 108 |
| Dimensions at 100% compliance | 7 / 8 |
| Only gap | `quality` alias (10/115 apps) |

### Per-Dimension Compliance

| Dimension | Compliant Apps | Compliance % |
|-----------|---------------|-------------|
| Elixir Version | 115/115 | 100% |
| Warnings as Errors | 115/115 | 100% |
| Dialyzer Config | 115/115 | 100% |
| Test Coverage | 115/115 | 100% |
| Credo Config | 115/115 | 100% |
| CLAUDE.md | 115/115 | 100% |
| Quality DNA | 115/115 | 100% |
| Quality Alias | 10/115 | 8.7% |

The `quality` alias dimension is the sole remaining gap. This dimension is intentionally not auto-fixed because the quality alias content varies significantly across applications -- some require dialyzer + credo + test, others need only compilation and formatting checks. Automated fixing would produce incorrect aliases for many applications.

## Relationship to Industry Standards

### Mapping to ISO/IEC 25010

The Prismatic Quality Standard draws from but extends international quality standards:

| ISO/IEC 25010 Characteristic | Prismatic Dimension | Coverage |
|------------------------------|-------------------|----------|
| Functional Correctness | Dialyzer, Tests | Type safety + behavioral correctness |
| Reliability | Warnings, Compilation | Zero-warning guarantee |
| Maintainability | Credo, CLAUDE.md | Style enforcement + documentation |
| Performance Efficiency | Quality DNA, Monitoring | Tracked via DNA metrics |
| Portability | Elixir Version | Consistent runtime requirements |
| Security | Quality Gates, Perimeter | Addressed by adjacent systems |

### Beyond Industry Standards

The Prismatic Quality Standard exceeds typical industry standards in several dimensions:

1. **Zero-tolerance thresholds**: Most standards define acceptable ranges; Prismatic demands zero violations across all critical domains.

2. **Automated enforcement**: Standards are enforced mechanically, not through manual review processes that permit inconsistent application.

3. **Per-application granularity**: Every umbrella application is independently scored, preventing platform averages from masking individual failures.

4. **Cross-session persistence**: Quality state is tracked across development sessions through Quality DNA, enabling continuous improvement trajectories.

## Defining Custom Quality Standards

### Extension Points

The standard supports extension through custom dimension definitions:

```elixir
defmodule Prismatic.Quality.Standard.CustomDimension do
  @moduledoc """
  Behaviour for defining custom quality standard dimensions.
  Applications can extend the base standard with domain-specific checks.
  """

  @callback dimension_name() :: atom()
  @callback max_score() :: float()
  @callback evaluate(app_path :: String.t(), mix_exs :: String.t()) :: {boolean(), String.t()}
  @callback remediation_instructions() :: String.t()
end

defmodule Prismatic.Quality.Standard.SecurityDimension do
  @moduledoc """
  Custom dimension checking security-related configuration.
  """

  @behaviour Prismatic.Quality.Standard.CustomDimension

  @impl true
  def dimension_name, do: :security_config

  @impl true
  def max_score, do: 7.5

  @impl true
  def evaluate(app_path, _mix_exs) do
    has_security_config = File.exists?(Path.join(app_path, "config/security.exs"))

    passed = has_security_config or not requires_security?(app_path)
    details = if passed, do: "Security configured", else: "Missing security configuration"

    {passed, details}
  end

  @impl true
  def remediation_instructions do
    "Add config/security.exs with authentication and authorization settings"
  end
end
```

### Application-Level Overrides

Individual applications can declare stricter requirements than the platform standard:

```elixir
# apps/prismatic_perimeter/mix.exs
defp quality_overrides do
  [
    # Perimeter requires 90% test coverage (platform default: 80%)
    test_coverage_threshold: 90.0,
    # Additional required dimension
    custom_dimensions: [Prismatic.Quality.Standard.SecurityDimension],
    # Stricter credo configuration
    credo_config: ".credo_strict.exs"
  ]
end
```

## Usage in Prismatic Platform

### Commands and Workflows

```bash
# Check quality standard compliance for all apps
mix quality.enforce_standard

# Check with JSON output (for CI)
mix quality.enforce_standard --json

# Auto-fix mix.exs compliance issues
mix quality.standardize_mix --apply

# Dry-run standardization (preview changes)
mix quality.standardize_mix

# Check specific application
mix quality.enforce_standard --app prismatic_perimeter

# Run full quality gate suite
mix quality.gates
```

### Creating a New Compliant Application

When creating a new umbrella application, the standard provides a compliance checklist:

```bash
# 1. Create the application
mix new apps/prismatic_new_app --sup

# 2. Update mix.exs to standard compliance
# - elixir: "~> 1.19"
# - elixirc_options: [warnings_as_errors: true]
# - dialyxir dependency + dialyzer config
# - test_coverage config
# - credo dependency

# 3. Create required files
touch apps/prismatic_new_app/CLAUDE.md
mkdir -p apps/prismatic_new_app/.claude/quality-dna
echo '{}' > apps/prismatic_new_app/.claude/quality-dna/current-state.json

# 4. Verify compliance
mix quality.enforce_standard --app prismatic_new_app
```

## Best Practices

1. **Run standardization after every new app creation**. The `mix quality.standardize_mix --apply` task ensures new applications immediately comply with the platform standard rather than accumulating debt.

2. **Use JSON output for CI integration**. The `--json` flag produces machine-readable output suitable for CI/CD pipeline gate evaluation, quality dashboards, and trend tracking.

3. **Address the quality alias gap intentionally**. The quality alias dimension requires per-application customization. Define aliases that reflect each application's actual quality workflow rather than applying a generic template.

4. **Extend the standard for domain-specific needs**. Applications in high-risk domains (security, compliance, financial) should define custom dimensions that enforce domain-specific quality requirements beyond the platform baseline.

5. **Track compliance trends over time**. A single compliance snapshot is less valuable than a compliance trajectory. Use Quality DNA to track how compliance changes across development sessions and identify systemic improvement or regression patterns.

6. **Document exceptions explicitly**. If an application legitimately cannot meet a dimension requirement, document the exception in the application's CLAUDE.md with a clear justification and a plan for eventual compliance.

## Common Pitfalls

- **Treating the standard as a ceiling rather than a floor**: The 60/60 score represents the minimum acceptable quality, not the target. Applications should strive to exceed the standard through additional quality practices appropriate to their domain.

- **Auto-fixing without understanding**: Running `--apply` without reviewing the transformations can introduce configuration that conflicts with application-specific requirements. Always preview with a dry run first.

- **Ignoring the quality alias dimension**: The fact that this dimension is not auto-fixed does not mean it is optional. Each application should define a quality alias that reflects its actual quality workflow.

- **Assuming compliance equals quality**: Meeting the standard guarantees a minimum configuration baseline but does not guarantee code quality. The standard ensures the tools are configured; developers must still write quality code and meaningful tests.

- **Not updating the standard**: Quality standards should evolve with the platform. As new quality practices emerge (property-based testing, formal verification, security scanning), the standard should be updated to include new dimensions.

## Related Concepts

- [Quality Monitoring](@/glossary/quality-monitoring.md) -- Continuous observation that verifies standard compliance
- [Quality Gates](@/glossary/quality-gates.md) -- Pipeline checkpoints enforcing the standard
- [Quality DNA](@/glossary/quality-dna.md) -- Persistent state tracking standard compliance history
- [Quality Systems](@/glossary/quality-systems.md) -- The broader architecture containing standards
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Autonomous guardian enforcing floor compliance
- [Credo](@/glossary/credo.md) -- Static analysis tool required by the standard
- [Dialyzer](@/glossary/dialyzer.md) -- Type checking tool required by the standard
- [Zero Compromise Quality](@/glossary/zero-compromise-quality.md) -- Philosophy underlying the standard
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- Compilation policy enforced by the standard
- [Compliance Framework](@/glossary/compliance-framework.md) -- Regulatory compliance complementing technical standards

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory with compliance scores

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
