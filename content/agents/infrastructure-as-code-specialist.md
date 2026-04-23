+++
title = "infrastructure-as-code-specialist"
weight = 210
[extra]
domain = "infrastructure"
level = "L3"
description = "Terraform, Ansible, and infrastructure automation expert"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1700
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["infrastructure-as-code-specialist", "Terraform", "Ansible", "agents", "agent", "Prismatic Platform", "Infrastructure", "Docker", "Dockerfile"]
tags = ["agents", "agent", "infrastructure-as-code-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "infrastructure-as-code-specialist - Prismatic Platform"
+++

## Overview

The Infrastructure as Code Specialist is an L3 strategic authority operating within the Infrastructure domain of the Prismatic Platform. This agent manages the declarative definition, version control, and automated provisioning of all platform infrastructure through tools including Terraform, Ansible, [Docker](@/glossary/docker.md) Compose, and [Fly.io](@/glossary/fly-io.md) configuration files. Every infrastructure component -- from database instances to edge computing nodes -- is defined in code, reviewed through merge requests, and deployed through automated pipelines.

Infrastructure as Code (IaC) eliminates configuration drift, the silent divergence between intended and actual infrastructure state that causes production incidents. The IaC Specialist ensures that the production environment can be fully reconstructed from version-controlled definitions, that infrastructure changes undergo the same review rigor as application code, and that rollback to any previous infrastructure state is achievable through git revert operations. This discipline is particularly critical for the platform's Fly.io deployment, where edge node configuration must be consistent across all regions.

## Operational Domain

The agent operates at the intersection of development practices and infrastructure operations. It translates architectural requirements into declarative infrastructure definitions, manages state files and locking for Terraform operations, and coordinates infrastructure changes with application deployment schedules to prevent incompatible state transitions. The specialist also maintains Dockerfile optimization, ensuring multi-stage builds produce minimal production images.

## Infrastructure Definition Layers

The IaC Specialist manages infrastructure definitions across multiple layers, each with distinct tooling and lifecycle management.

| Layer | Tool | Scope | State Management |
|---|---|---|---|
| Cloud Resources | Terraform | Fly.io machines, volumes, networks | Remote state with locking |
| Configuration | Ansible | Runtime config, environment variables | Idempotent playbooks |
| Containers | Docker / Dockerfile | Application images, build pipelines | Multi-stage builds |
| Orchestration | Fly.io TOML | Deployment topology, health checks | Version-controlled config |
| Database | Ecto Migrations | Schema, indexes, constraints | Forward-only migrations |
| Secrets | Fly.io Secrets / Vault | API keys, credentials, tokens | Encrypted at rest |

## Docker Optimization

The specialist maintains production Dockerfile configurations that follow strict optimization principles for minimal image size, security, and build performance.

```dockerfile
# Multi-stage Elixir production build
# Managed by Infrastructure as Code Specialist

# Stage 1: Build
FROM elixir:1.19-otp-27-alpine AS builder

RUN apk add --no-cache build-base git

WORKDIR /app

ENV MIX_ENV=prod

COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/*/
RUN mix deps.get --only prod && mix deps.compile

COPY . .
RUN mix release prismatic

# Stage 2: Runtime
FROM alpine:3.19 AS runner

RUN apk add --no-cache libstdc++ openssl ncurses-libs \
    && adduser -D -h /app prismatic

WORKDIR /app
USER prismatic

COPY --from=builder --chown=prismatic /app/_build/prod/rel/prismatic ./

ENV PHX_SERVER=true
EXPOSE 4000

CMD ["bin/prismatic", "start"]
```

## Fly.io Deployment Configuration

```elixir
defmodule PrismaticAgents.InfrastructureAsCode do
  @moduledoc """
  Infrastructure as Code management engine.
  Coordinates declarative infrastructure definitions
  with deployment automation.
  """

  use GenServer

  @type drift_report :: %{
    resource: String.t(),
    expected_state: map(),
    actual_state: map(),
    drift_type: :added | :removed | :modified,
    severity: :low | :medium | :high | :critical
  }

  @spec detect_drift() :: {:ok, [drift_report()]} | {:error, term()}
  def detect_drift do
    GenServer.call(__MODULE__, :detect_drift, :timer.minutes(5))
  end

  @impl true
  def handle_call(:detect_drift, _from, state) do
    with {:ok, declared} <- load_declared_state(),
         {:ok, actual} <- fetch_actual_state() do
      drifts = compare_states(declared, actual)
      {:reply, {:ok, drifts}, %{state | last_drift_check: DateTime.utc_now()}}
    end
  end

  defp compare_states(declared, actual) do
    declared
    |> Map.keys()
    |> Enum.flat_map(fn resource ->
      case {Map.get(declared, resource), Map.get(actual, resource)} do
        {expected, actual} when expected == actual -> []
        {expected, nil} -> [%{resource: resource, drift_type: :removed, expected_state: expected, actual_state: nil, severity: :critical}]
        {expected, actual} -> [%{resource: resource, drift_type: :modified, expected_state: expected, actual_state: actual, severity: classify_severity(expected, actual)}]
      end
    end)
  end
end
```

## Configuration Drift Detection

The IaC Specialist continuously monitors for configuration drift across all infrastructure layers.

| Detection Method | Layer | Frequency | Response |
|---|---|---|---|
| Terraform plan | Cloud resources | Per-deployment + hourly | Alert + auto-remediate |
| Docker image comparison | Container images | Per-build | Rebuild from source |
| Config hash comparison | Runtime configuration | Continuous | Alert + restore declared state |
| Fly.io API inspection | Deployment topology | Every 15 minutes | Alert + reconcile |
| Migration status check | Database schema | Per-deployment | Run pending migrations |

## Key Capabilities

- **Declarative infrastructure management** defining all platform infrastructure in version-controlled configuration files that serve as the single source of truth for environment state
- **Configuration drift detection** continuously comparing live infrastructure against declared state and alerting when undeclared changes are detected in production
- **Docker optimization** maintaining multi-stage Dockerfile builds that minimize image size, eliminate unnecessary dependencies, and enforce non-root execution for security
- **Fly.io deployment configuration** managing edge computing topology, region selection, scaling policies, and health check definitions for the platform's production deployment
- **Infrastructure change review** ensuring all infrastructure modifications pass through merge request review with plan output inspection before any apply operation
- **Secret management** integrating infrastructure provisioning with secure credential storage, ensuring secrets are never committed to repository history or exposed in configuration files

## Infrastructure Change Pipeline

| Stage | Action | Gate | Failure Response |
|---|---|---|---|
| Plan | Generate infrastructure change plan | Human review required | Revise plan |
| Validate | Check plan against policy constraints | Automated policy checks | Block deployment |
| Apply | Execute infrastructure changes | Health checks pass | Automatic rollback |
| Verify | Compare actual vs expected state | Zero drift detected | Investigation + remediation |
| Monitor | Continuous post-change observation | No anomalies in 30 min window | Rollback if degradation |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md). Multi-domain coordination with authority to approve or reject infrastructure changes and enforce IaC standards across all platform environments.

## Coordination

| Agent | Relationship | Domain |
|---|---|---|
| [flyio-deployment-specialist](@/agents/flyio-deployment-specialist.md) | Coordinates Fly.io-specific deployment configuration and scaling policies | Infrastructure |
| [docker-build-specialist](@/agents/docker-build-specialist.md) | Collaborates on container image optimization and build pipeline efficiency | Infrastructure |
| [deployment-commander-agent](@/agents/deployment-commander-agent.md) | Receives deployment directives and ensures infrastructure readiness for releases | Deployment |
| [secrets-management-specialist](@/agents/secrets-management-specialist.md) | Coordinates secure credential management for infrastructure provisioning | Security |

## Integration

| Component | Relationship |
|---|---|
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | Infrastructure pipeline execution and state management |
| [Fly.io](@/glossary/fly-io.md) | Primary deployment target for production infrastructure |
| [PostgreSQL](@/glossary/postgresql.md) | Database infrastructure provisioning and migration |
| Platform [Telemetry](@/glossary/telemetry.md) | Infrastructure health metrics and drift detection signals |

## Enforcement

The Infrastructure as Code Specialist operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No manual infrastructure changes are permitted in any environment. Every infrastructure modification must be defined in code, reviewed, and applied through automated pipelines. Configuration drift is treated as an L2 violation requiring immediate remediation. Infrastructure state files are secured with mandatory encryption and access controls. All infrastructure changes maintain full [audit trail](@/glossary/audit-trail.md) provenance for compliance and forensic analysis.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)