+++
title = "GitOps"
weight = 51
[extra]
category = "quality"
description = "Operational framework using Git as the single source of truth for infrastructure and deployment, ensuring all system state changes flow through version-controlled, auditable, and reproducible Git commits"
related_terms = ["continuous-deployment", "continuous-integration", "gitlab-ci", "docker", "quality-gates", "release", "fly-io", "infrastructure"]
tags = ["quality", "devops", "infrastructure", "deployment", "ci-cd", "automation"]
keywords = ["GitOps", "infrastructure as code", "declarative infrastructure", "Git source of truth", "deployment automation", "drift detection", "reconciliation loop", "immutable deployments", "GitLab CI", "continuous delivery"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Infrastructure & Operations"
implementation_status = "production"
authority_level = "platform-core"
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
acronym = ""
difficulty_level = "intermediate"
importance = "critical"
prerequisites = ["continuous-integration", "docker", "gitlab-ci"]
learning_path = ["continuous-integration", "continuous-deployment", "gitops", "release", "infrastructure"]
word_count = 1699
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GitOps - Prismatic Platform"
+++

## Definition and Overview

GitOps is an operational framework that uses Git repositories as the single source of truth for declarative infrastructure and application configuration. All changes to infrastructure, deployments, and operational state are made exclusively through Git commits, pull requests, and automated reconciliation loops. The core principle is that the desired state of every system is declared in version-controlled files, and automated agents continuously reconcile the actual state of deployed environments with the declared state in Git. GitOps provides complete audit trails, instant rollback capabilities, reproducible environments, and a unified workflow for both application code and infrastructure changes.

The GitOps model was formalized by Weaveworks in 2017, building on earlier practices of Infrastructure as Code (IaC) and Continuous Delivery. What distinguishes GitOps from general IaC is the emphasis on Git as the sole mechanism for making changes -- operators do not SSH into servers, click through dashboards, or run ad hoc scripts. Every change, no matter how small, flows through Git. This constraint transforms operations from an imperative activity ("run this command on this server") into a declarative one ("the desired state is X; the system will converge to X automatically").

The reconciliation loop is the heart of GitOps. An automated agent monitors the Git repository for changes and compares the declared state against the actual state of the target environment. When a difference is detected (a "drift"), the agent automatically applies changes to bring the environment into compliance. This model provides self-healing properties: if someone manually modifies a production server, the GitOps agent detects the drift and reverts the change to match the Git-declared state.

GitOps operates on two fundamental models: push-based and pull-based. In push-based GitOps (used by most CI/CD platforms including GitLab CI), the CI pipeline pushes changes to the target environment when commits are merged. In pull-based GitOps (used by ArgoCD, Flux), an agent running inside the target environment pulls changes from Git. Pull-based models provide stronger security guarantees because the target environment does not need to expose inbound access to the CI system.

## Historical Context and Evolution

The trajectory from manual server administration to GitOps represents a fundamental shift in how infrastructure is conceived and managed:

| Era | Approach | Change Mechanism | Audit Trail | Rollback |
|-----|----------|-----------------|-------------|----------|
| **1990s** | Manual administration | SSH + scripts | Operator memory | Backup restoration |
| **2000s** | Configuration management (Puppet, Chef) | Declarative manifests | Partial (run logs) | Re-converge to previous state |
| **2010s** | Infrastructure as Code (Terraform, CloudFormation) | Declarative + plan/apply | State files | State file rollback |
| **2017+** | GitOps (Flux, ArgoCD, GitLab) | Git commits only | Complete Git history | `git revert` |

Each transition increased the declarativeness, auditability, and reproducibility of infrastructure management. GitOps represents the current apex of this progression, where the Git repository becomes the canonical representation of system state and Git operations become the sole mechanism for state changes.

## Technical Deep Dive

### Declarative State Management

The foundation of GitOps is declaring all system state in version-controlled files. For the Prismatic Platform, this encompasses multiple configuration layers:

| Configuration Layer | File | Purpose |
|-------------------|------|---------|
| **CI/CD Pipeline** | `.gitlab-ci.yml` | Build, test, quality gate, deployment stages |
| **Container Image** | `Dockerfile` | Application packaging and runtime environment |
| **Deployment Target** | `fly.toml` | Fly.io deployment specification (scaling, regions, services) |
| **Application Config** | `config/*.exs` | Elixir application configuration per environment |
| **Infrastructure** | `docker-compose.yml` | Local development environment specification |
| **Quality Gates** | `.credo.exs` | Static analysis configuration |
| **Git Hooks** | `.githooks/*` | Pre-commit, commit-msg, pre-push enforcement scripts |
| **Agent Definitions** | `.aiad/agents/*.agent.md` | AIAD agent specifications and configurations |

Each of these files is version-controlled, reviewed through merge requests, and applied automatically by the reconciliation pipeline. No configuration exists only in a deployment dashboard or SSH session.

### Reconciliation Architecture

The GitOps reconciliation loop follows a four-phase cycle:

```
Phase 1: Observe          Phase 2: Diff             Phase 3: Act              Phase 4: Verify
+--------------+         +--------------+          +--------------+          +--------------+
| Monitor Git  |-------->| Compare      |--------->| Apply        |--------->| Health Check |
| repository   |         | desired vs   |          | changes to   |          | and confirm  |
| for changes  |         | actual state |          | target env   |          | convergence  |
+--------------+         +--------------+          +--------------+          +--------------+
       ^                                                                            |
       |                                                                            |
       +----------------------------------------------------------------------------+
                                    Continuous Loop
```

In the Prismatic Platform's push-based model, GitLab CI serves as the reconciliation agent. When a commit is merged to the `main` branch, the pipeline executes the full quality enforcement sequence, builds a new container image, and deploys it to the target environment. The pipeline only proceeds to deployment if all quality gates pass, ensuring that the deployed state always reflects a quality-verified commit.

### Drift Detection and Correction

Drift occurs when the actual state of a deployed environment diverges from the declared state in Git. GitOps systems handle drift through detection and correction:

```elixir
defmodule PrismaticGitOps.DriftDetector do
  @moduledoc """
  Detects configuration drift between Git-declared state and deployed state.
  Reports discrepancies for automated or manual correction.
  """

  @type drift_report :: %{
    component: String.t(),
    expected: term(),
    actual: term(),
    severity: :info | :warning | :critical,
    detected_at: DateTime.t()
  }

  @spec detect_drift(String.t()) :: {:ok, list(drift_report())} | {:error, term()}
  def detect_drift(environment) do
    with {:ok, declared} <- load_declared_state(environment),
         {:ok, actual} <- query_actual_state(environment) do
      drifts =
        declared
        |> Map.keys()
        |> Enum.flat_map(fn key ->
          case {Map.get(declared, key), Map.get(actual, key)} do
            {same, same} -> []
            {expected, actual_val} ->
              [%{
                component: key,
                expected: expected,
                actual: actual_val,
                severity: classify_severity(key),
                detected_at: DateTime.utc_now()
              }]
          end
        end)

      {:ok, drifts}
    end
  end

  defp classify_severity("security_" <> _), do: :critical
  defp classify_severity("scaling_" <> _), do: :warning
  defp classify_severity(_), do: :info

  defp load_declared_state(environment) do
    config_path = "config/#{environment}.exs"
    fly_config = "fly.toml"

    with {:ok, app_config} <- parse_elixir_config(config_path),
         {:ok, deploy_config} <- parse_fly_toml(fly_config) do
      {:ok, Map.merge(app_config, deploy_config)}
    end
  end

  defp query_actual_state(environment) do
    case System.cmd("fly", ["status", "--app", "prismatic-#{environment}", "--json"]) do
      {output, 0} -> Jason.decode(output)
      {error, _code} -> {:error, {:fly_status_failed, error}}
    end
  end
end
```

### Immutable Deployments

GitOps pairs naturally with immutable deployments, where each deployment creates a new container image rather than modifying an existing one. The Prismatic Platform's Dockerfile defines the complete runtime environment:

```dockerfile
# Multi-stage build for reproducible, minimal images
FROM hexpm/elixir:1.19.0-erlang-27.0-debian-bookworm AS build

WORKDIR /app
ENV MIX_ENV=prod

# Dependencies (cached layer)
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs ./apps/
RUN mix deps.get --only prod && mix deps.compile

# Application code
COPY . .
RUN mix release prismatic

# Runtime (minimal image)
FROM debian:bookworm-slim AS runtime
COPY --from=build /app/_build/prod/rel/prismatic ./
CMD ["bin/prismatic", "start"]
```

Every Git commit that passes quality gates produces a new immutable image tagged with the commit SHA. Rollback is trivial: deploy the image from the previous commit. The Git log provides a complete history of every image that has ever been deployed.

### Secrets Management in GitOps

A critical challenge in GitOps is managing secrets (API keys, database credentials, tokens) that cannot be stored in Git. The Prismatic Platform addresses this through GitLab CI variables:

| Secret Category | Storage | Access Control |
|----------------|---------|----------------|
| **API Tokens** | GitLab CI Variables (masked, protected) | Protected branches only |
| **Database URLs** | GitLab CI Variables (masked, protected) | Protected branches only |
| **Deployment Keys** | GitLab CI Variables (protected) | Deployment jobs only |
| **Encryption Keys** | Fly.io Secrets | Runtime environment only |

Secrets never appear in Git history, CI logs, or container images. They are injected at deployment time through environment variables, maintaining the GitOps principle while protecting sensitive data.

### GitOps and the Pre-Commit Pipeline

The Prismatic Platform extends GitOps principles to the developer workstation through an 11-phase pre-commit pipeline that enforces quality before code even reaches the repository:

```elixir
defmodule PrismaticGitOps.PreCommitPipeline do
  @moduledoc """
  11-phase pre-commit pipeline ensuring every commit meets
  GitOps quality standards before entering the repository.
  """

  @phases [
    {1, :compilation, "mix compile --warnings-as-errors"},
    {2, :formatting, "mix format --check-formatted"},
    {3, :credo, "mix credo --strict"},
    {4, :dialyzer, "mix dialyzer"},
    {5, :tests, "mix test"},
    {6, :forbidden_patterns, "mix quality.forbidden_patterns"},
    {7, :quality_gates, "mix quality.gates"},
    {8, :template_validation, "scripts/validate-promo-templates.sh"},
    {9, :quality_standard, "mix quality.enforce_standard"},
    {10, :design_consistency, "scripts/validate-design-consistency.sh"},
    {11, :secret_scanning, "scripts/scan-secrets.sh"}
  ]

  @spec run_pipeline(list(String.t())) :: :ok | {:error, {integer(), atom(), String.t()}}
  def run_pipeline(staged_files) do
    @phases
    |> Enum.reduce_while(:ok, fn {phase_num, phase_name, command}, :ok ->
      case execute_phase(phase_name, command, staged_files) do
        :ok -> {:cont, :ok}
        {:error, msg} -> {:halt, {:error, {phase_num, phase_name, msg}}}
      end
    end)
  end
end
```

## Architecture and Implementation

### Multi-Environment GitOps Pipeline

The Prismatic Platform operates a three-environment GitOps pipeline:

```
Developer Workstation          Staging Environment         Production Environment
+--------------------+        +---------------------+    +---------------------+
| Pre-commit hooks   |        | prismatic-staging    |    | prismatic-prod      |
| Local quality gates|        | .fly.dev             |    | .fly.dev            |
| Unit tests         |        |                      |    |                      |
|                    |   CI   | Auto-deploy on merge |  M | Manual trigger after |
| git push ----------|------->| to main branch       |--->| staging validation   |
|                    |        |                      |    |                      |
+--------------------+        | Smoke tests          |    | Health checks        |
                              | Integration tests    |    | Canary deployment    |
                              +---------------------+    +---------------------+
                                                    M = Manual Gate
```

Staging receives automatic deployments on every merge to `main`. Production requires explicit manual triggering after staging validation. This two-phase approach balances speed (automatic staging) with safety (manual production gate).

### GitOps Compliance Validator

```elixir
defmodule PrismaticGitOps.ComplianceValidator do
  @moduledoc """
  Validates that all infrastructure and deployment changes follow GitOps principles.
  Ensures no manual modifications exist outside Git-tracked configuration.
  """

  @required_files [
    ".gitlab-ci.yml",
    "Dockerfile",
    "fly.toml",
    "docker-compose.yml",
    ".credo.exs"
  ]

  @spec validate_gitops_compliance() :: {:ok, :compliant} | {:error, list(String.t())}
  def validate_gitops_compliance do
    violations =
      check_required_files() ++
      check_no_manual_overrides() ++
      check_pipeline_coverage() ++
      check_secret_isolation()

    case violations do
      [] -> {:ok, :compliant}
      violations -> {:error, violations}
    end
  end

  defp check_required_files do
    @required_files
    |> Enum.reject(&File.exists?/1)
    |> Enum.map(&"Missing required GitOps file: #{&1}")
  end

  defp check_no_manual_overrides do
    case System.cmd("fly", ["config", "show", "--app", "prismatic-prod", "--json"]) do
      {output, 0} ->
        deployed = Jason.decode!(output)
        declared = parse_fly_toml()

        if configs_match?(deployed, declared),
          do: [],
          else: ["Drift detected: deployed config differs from fly.toml"]

      _ ->
        ["Unable to verify deployment state"]
    end
  end

  defp check_pipeline_coverage do
    case File.read(".gitlab-ci.yml") do
      {:ok, content} ->
        stages = extract_stages(content)
        required = ["compile", "analyze", "test", "quality", "deploy"]

        missing = required -- stages
        Enum.map(missing, &"Missing required pipeline stage: #{&1}")

      {:error, _} ->
        ["Missing .gitlab-ci.yml"]
    end
  end

  defp check_secret_isolation do
    # Verify no secrets in tracked files
    {output, 0} = System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD"])

    output
    |> String.split("\n", trim: true)
    |> Enum.filter(&secret_file?/1)
    |> Enum.map(&"Secret file tracked in Git: #{&1}")
  end

  defp secret_file?(path) do
    String.ends_with?(path, ".env") or
    String.contains?(path, "credentials") or
    String.contains?(path, "secret")
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform implements GitOps as its sole operational methodology. No infrastructure or deployment change occurs outside of Git.

### GitOps-Managed Components

| Component | Git-Tracked File | Reconciliation Method |
|-----------|-----------------|----------------------|
| **CI Pipeline** | `.gitlab-ci.yml` | GitLab CI auto-applies on push |
| **Container Build** | `Dockerfile` | CI builds new image on merge |
| **Deployment Config** | `fly.toml` | `fly deploy` in CI pipeline |
| **Quality Enforcement** | `.credo.exs`, `.githooks/*` | Pre-commit + CI validation |
| **Agent Definitions** | `.aiad/agents/*.agent.md` | AIAD indexer on commit |
| **Application Config** | `config/*.exs` | Compiled into release |
| **Documentation** | `sites/promo/content/*.md` | Zola build + GitHub Pages deploy |

### Session Discipline Integration

GitOps principles are enforced in every development session through the mandatory session discipline protocol:

```elixir
defmodule PrismaticGitOps.SessionCompliance do
  @moduledoc """
  Ensures development sessions follow GitOps principles.
  All changes must flow through Git with proper tracking.
  """

  @spec validate_session_compliance() :: :ok | {:error, list(String.t())}
  def validate_session_compliance do
    checks = [
      check_no_uncommitted_infra_changes(),
      check_pipeline_config_valid(),
      check_deployment_config_tracked(),
      check_hooks_enabled()
    ]

    violations = Enum.flat_map(checks, fn
      :ok -> []
      {:error, msg} -> [msg]
    end)

    case violations do
      [] -> :ok
      violations -> {:error, violations}
    end
  end

  defp check_hooks_enabled do
    if File.exists?(".githooks/pre-commit"),
      do: :ok,
      else: {:error, "Pre-commit hooks not configured"}
  end
end
```

### Rollback Procedure

GitOps enables instant rollback through Git history:

```bash
# View deployment history
git log --oneline --format="%h %s" -- fly.toml Dockerfile .gitlab-ci.yml

# Rollback to previous deployment
git revert HEAD --no-edit
git push origin main
# CI pipeline automatically deploys the reverted state

# Emergency rollback (bypasses CI, requires manual trigger)
fly deploy --image registry.fly.io/prismatic-prod:PREVIOUS_SHA
```

## GitOps Maturity Model

Organizations adopt GitOps progressively. The following maturity model describes the stages of adoption:

| Level | Name | Characteristics | Prismatic Status |
|-------|------|-----------------|------------------|
| **L0** | Manual | SSH administration, undocumented changes | Superseded |
| **L1** | Version Controlled | Config in Git, but manually applied | Superseded |
| **L2** | CI-Automated | CI applies changes on merge | Active (push-based) |
| **L3** | Self-Healing | Drift detection and automatic correction | Partially implemented |
| **L4** | Policy-Driven | OPA/Rego policies gate all changes | Planned |
| **L5** | Autonomous | AI-driven infrastructure optimization | Research phase |

The Prismatic Platform operates at L2 with L3 capabilities for specific components. The session discipline protocol and pre-commit pipeline provide additional enforcement layers that go beyond typical L2 implementations.

## Best Practices

**Declare everything in Git.** Every configuration file, deployment specification, pipeline definition, and operational procedure should be version-controlled. If a configuration exists only in a dashboard or environment variable, it is not GitOps-compliant. Document external configurations and track their expected values in Git.

**Use merge requests for all changes.** Never push directly to the main branch. Merge requests provide review, discussion, and audit trail for every change. Configure branch protection rules to enforce this workflow. The review process catches configuration errors before they reach production.

**Implement staged deployment.** Deploy to staging automatically on merge, then require manual approval for production. This provides a validation stage where integration tests, smoke tests, and manual verification can occur before production changes. The staging environment should mirror production as closely as possible.

**Version container images with commit SHAs.** Tag every container image with the Git commit SHA that produced it. This creates a bidirectional link between Git history and deployed artifacts. Given any deployed image, you can immediately find the exact source code and configuration that produced it.

**Monitor drift continuously.** Even with GitOps, drift can occur through manual interventions, provider-side changes, or automation failures. Implement drift detection that compares deployed state against Git-declared state and alerts on discrepancies.

**Enforce GitOps at the developer workstation.** Pre-commit hooks that validate configuration files, scan for secrets, and enforce quality standards extend GitOps principles to the earliest stage of the development lifecycle.

## Common Pitfalls

**Storing secrets in Git.** The most dangerous GitOps anti-pattern is committing API keys, database credentials, or tokens to the repository. Even if removed later, secrets remain in Git history. Use external secret management (GitLab CI variables, Vault, cloud provider secret managers) and verify through pre-commit hooks that no secrets are tracked.

**Incomplete state declaration.** If only part of the infrastructure is declared in Git, the benefits of GitOps are undermined. Manual configurations that exist outside Git become invisible, undocumented, and unrecoverable. Audit all configuration sources and ensure they are tracked.

**Ignoring drift after deployment.** GitOps does not end at deployment. Without continuous drift detection, manual changes can accumulate in production, creating an ever-widening gap between the declared and actual state. When the next Git-driven deployment occurs, unexpected interactions between the Git state and the drifted state can cause failures.

**Overly complex pipeline configuration.** GitLab CI YAML has a 10-level nesting limit. Complex pipelines should extract logic to scripts rather than embedding it in YAML. Pipeline configuration should be readable and maintainable, not a demonstration of YAML's capabilities.

**Missing rollback procedures.** GitOps makes rollback possible through `git revert`, but teams must practice and document the procedure before a production incident. An untested rollback process is not a rollback process.

**Treating GitOps as a tool rather than a discipline.** GitOps is not a product you install; it is a set of principles you follow. Installing ArgoCD or Flux does not make an organization GitOps-compliant if teams continue to make manual changes outside of Git.

## Related Concepts

- [Continuous Integration](/glossary/continuous-integration/) -- Validation pipeline triggered by Git commits in the GitOps workflow
- [Continuous Deployment](/glossary/continuous-deployment/) -- Automated deployment driven by GitOps reconciliation
- [GitLab CI/CD](/glossary/gitlab-ci/) -- CI/CD platform implementing push-based GitOps reconciliation
- [Docker](/glossary/docker/) -- Container runtime producing immutable deployment artifacts
- [Quality Gates](/glossary/quality-gates/) -- Automated enforcement ensuring only quality-verified code deploys
- [Fly.io](/glossary/fly-io/) -- Deployment target managed through GitOps configuration
- [Release](/glossary/release/) -- Elixir release packaging integrated into the GitOps deployment pipeline
- [Infrastructure](/glossary/infrastructure/) -- Foundational systems managed through GitOps practices

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Infrastructure as code tooling
- [Commands](/commands/) -- Platform commands including deployment operations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
