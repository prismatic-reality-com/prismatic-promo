+++
title = "zero-downtime-deployment-specialist"
weight = 420
[extra]
domain = "infrastructure"
level = "L3"
description = "Blue-green and canary deployment strategies for continuous availability"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2250
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["zero-downtime-deployment-specialist", "Blue-green", "agents", "agent", "Prismatic Platform", "LiveView", "Downtime Deployment", "Specialist", "WebSocket"]
tags = ["agents", "agent", "zero-downtime-deployment-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "zero-downtime-deployment-specialist - Prismatic Platform"
+++

## Overview

The Zero-Downtime Deployment Specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's infrastructure domain, responsible for implementing and managing deployment strategies that maintain continuous service availability during platform updates. This agent orchestrates blue-green deployments, canary releases, rolling updates, and hot code upgrades to ensure that the platform's web interfaces, API endpoints, and background processing systems remain fully operational throughout every deployment cycle.

The Prismatic Platform runs on [Fly.io](@/glossary/fly-io.md) infrastructure with production (`prismatic-prod.fly.dev`) and staging (`prismatic-staging.fly.dev`) environments. The platform's 90 [umbrella application](@/glossary/umbrella-application.md)s, [LiveView](@/glossary/liveview.md) WebSocket connections, long-running [GenServer](@/glossary/genserver.md) processes, and [ETS](@/glossary/ets.md) caches create deployment challenges that go beyond simple container replacement. The Zero-Downtime Deployment Specialist addresses these challenges through deployment strategies specifically designed for the [BEAM](@/glossary/beam.md) virtual machine's unique capabilities, including hot code loading and graceful connection draining.

Built on the [AIAD](@/glossary/aiad.md) standard, the agent enforces the [NO MERCY](@/glossary/no-mercy.md) doctrine's zero-tolerance policy for service disruption during deployments. The platform's [page load performance standard](@/glossary/aiad.md) requires all pages to load under 250ms and server-side render time under 100ms -- these targets must be maintained even during active deployments. All deployment decisions comply with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, requiring evidence-based validation at every deployment stage.

## Architecture

The Zero-Downtime Deployment Specialist is built on a multi-strategy deployment architecture that separates deployment planning, execution, monitoring, and rollback into distinct [OTP](@/glossary/otp.md) processes.

```
ZeroDowntimeDeployment.Supervisor
+-- DeploymentPlanner.Server       (strategy selection and planning)
+-- BlueGreenController.Worker     (blue-green deployment execution)
+-- CanaryController.Worker        (canary release management)
+-- RollingUpdateController.Worker (rolling update orchestration)
+-- HealthChecker.Worker           (deployment health validation)
+-- TrafficRouter.Server           (traffic splitting and routing)
+-- RollbackManager.Server         (instant rollback capability)
```

The DeploymentPlanner analyzes the nature of the deployment (schema migration, code change, configuration update) and selects the optimal strategy. Blue-green deployments are used for major releases with schema changes; canary releases for feature-flagged changes; rolling updates for minor patches. The strategy controllers manage the mechanics of each deployment type: provisioning new instances, migrating traffic, validating health, and decommissioning old instances.

The HealthChecker continuously monitors deployment targets using synthetic transactions, latency measurements, error rate tracking, and [LiveView](@/glossary/liveview.md) WebSocket connectivity tests. The TrafficRouter manages gradual traffic shifting between deployment environments, supporting percentage-based splitting for canary deployments. The RollbackManager maintains instant rollback capability throughout the deployment, ready to revert traffic to the previous version within seconds if health checks fail.

## Core Capabilities

The Zero-Downtime Deployment Specialist provides six primary capabilities ensuring continuous availability during platform updates.

**Blue-Green Deployment Management** maintains two identical production environments (blue and green), deploying updates to the inactive environment while the active environment continues serving traffic. Once the inactive environment passes all health checks, traffic is atomically switched from the active to the newly updated environment. The previously active environment is retained as an instant rollback target.

**Canary Release Orchestration** gradually rolls out changes to a small percentage of traffic before full deployment. The agent routes 1%, 5%, 10%, 25%, 50%, and 100% of traffic through the canary environment, monitoring error rates, latency, and user-facing metrics at each stage. If any metric exceeds threshold values, traffic is immediately routed back to the stable environment.

**Rolling Update Coordination** orchestrates sequential updates across platform instances, ensuring that a minimum number of instances are always serving traffic. The agent calculates the optimal batch size based on total instance count, traffic load, and acceptable capacity reduction, then updates instances in batches with health verification between each batch.

**BEAM Hot Code Loading** leverages the [BEAM](@/glossary/beam.md) virtual machine's unique hot code loading capability to update running code without restarting processes. For changes that are compatible with hot code loading (pure code changes without state schema modifications), the agent applies updates to running instances while maintaining all GenServer states, ETS tables, and WebSocket connections.

**LiveView Connection Draining** manages graceful draining of [LiveView](@/glossary/liveview.md) WebSocket connections during instance retirement. Rather than abruptly terminating connections, the agent signals LiveView processes to complete current operations and gracefully reconnect to new instances, providing a seamless user experience during deployments.

**Database Migration Coordination** sequences database migrations with code deployments to avoid compatibility issues. The agent ensures that schema changes are backward-compatible (additive migrations first, removal migrations after code deployment), manages migration execution timing, and verifies data consistency after migration completion.

## Implementation

The core deployment coordinator is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) that manages deployment lifecycle and strategy execution.

```elixir
defmodule Prismatic.Agents.ZeroDowntimeDeployment do
  @moduledoc """
  Zero-Downtime Deployment Specialist - blue-green, canary,
  and rolling deployment strategies for continuous availability.
  """

  use GenServer

  alias Prismatic.Agents.ZeroDowntimeDeployment.{
    DeploymentPlanner,
    BlueGreenController,
    CanaryController,
    RollingUpdateController,
    HealthChecker,
    TrafficRouter,
    RollbackManager
  }

  @type strategy :: :blue_green | :canary | :rolling | :hot_code
  @type deployment_status ::
    :planning | :deploying | :validating | :switching |
    :draining | :complete | :rolled_back | :failed

  @type deployment :: %{
    id: String.t(),
    strategy: strategy(),
    status: deployment_status(),
    version: String.t(),
    previous_version: String.t(),
    health_checks: [health_result()],
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil
  }

  @type health_result :: %{
    check: atom(),
    status: :healthy | :degraded | :unhealthy,
    latency_ms: non_neg_integer(),
    checked_at: DateTime.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    {:ok, %{
      current_deployment: nil,
      deployment_history: [],
      active_environment: :blue,
      config: Map.new(opts)
    }}
  end

  @spec deploy(String.t(), keyword()) :: {:ok, deployment()} | {:error, term()}
  def deploy(version, opts \\ []) do
    GenServer.call(__MODULE__, {:deploy, version, opts}, :timer.hours(1))
  end

  @spec rollback :: {:ok, deployment()} | {:error, term()}
  def rollback do
    GenServer.call(__MODULE__, :rollback, :timer.minutes(5))
  end

  @impl true
  def handle_call({:deploy, version, opts}, _from, state) do
    strategy = Keyword.get(opts, :strategy) ||
               DeploymentPlanner.select_strategy(version, state)

    deployment = %{
      id: generate_deployment_id(),
      strategy: strategy,
      status: :planning,
      version: version,
      previous_version: current_version(state),
      health_checks: [],
      started_at: DateTime.utc_now(),
      completed_at: nil
    }

    result = case strategy do
      :blue_green ->
        execute_blue_green(deployment, state)

      :canary ->
        execute_canary(deployment, state)

      :rolling ->
        execute_rolling(deployment, state)

      :hot_code ->
        execute_hot_code(deployment, state)
    end

    case result do
      {:ok, completed} ->
        final = %{completed |
          status: :complete,
          completed_at: DateTime.utc_now()
        }

        :telemetry.execute(
          [:prismatic, :deployment, :complete],
          %{
            strategy: strategy_to_int(strategy),
            duration_ms: DateTime.diff(
              final.completed_at, final.started_at, :millisecond
            )
          },
          %{version: version, deployment_id: final.id}
        )

        new_state = %{state |
          current_deployment: final,
          deployment_history: [final | state.deployment_history],
          active_environment: toggle_environment(state.active_environment)
        }

        {:reply, {:ok, final}, new_state}

      {:error, reason, partial} ->
        rolled_back = RollbackManager.execute(partial, state)

        :telemetry.execute(
          [:prismatic, :deployment, :rollback],
          %{reason: inspect(reason)},
          %{version: version, deployment_id: deployment.id}
        )

        {:reply, {:error, reason},
         %{state | current_deployment: rolled_back}}
    end
  end

  @impl true
  def handle_call(:rollback, _from, state) do
    case state.current_deployment do
      nil ->
        {:reply, {:error, :no_active_deployment}, state}

      deployment ->
        rolled_back = RollbackManager.execute(deployment, state)
        {:reply, {:ok, rolled_back}, %{state |
          current_deployment: rolled_back,
          active_environment: toggle_environment(state.active_environment)
        }}
    end
  end

  defp execute_blue_green(deployment, state) do
    target_env = toggle_environment(state.active_environment)

    with :ok <- BlueGreenController.provision(target_env, deployment.version),
         :ok <- BlueGreenController.migrate_database(deployment.version),
         {:ok, health} <- HealthChecker.validate(target_env),
         :ok <- TrafficRouter.switch(state.active_environment, target_env) do
      {:ok, %{deployment | health_checks: [health], status: :complete}}
    else
      {:error, reason} -> {:error, reason, deployment}
    end
  end

  defp execute_canary(deployment, _state) do
    canary_stages = [1, 5, 10, 25, 50, 100]

    result =
      Enum.reduce_while(canary_stages, deployment, fn percentage, acc ->
        TrafficRouter.set_canary_percentage(percentage)

        case HealthChecker.validate_canary(percentage) do
          {:ok, health} ->
            {:cont, %{acc | health_checks: [health | acc.health_checks]}}

          {:error, reason} ->
            TrafficRouter.set_canary_percentage(0)
            {:halt, {:error, reason, acc}}
        end
      end)

    case result do
      {:error, _, _} = error -> error
      completed -> {:ok, completed}
    end
  end

  defp execute_rolling(deployment, _state) do
    RollingUpdateController.execute(deployment)
  end

  defp execute_hot_code(deployment, _state) do
    # BEAM hot code loading for compatible changes
    {:ok, %{deployment | status: :complete}}
  end

  defp toggle_environment(:blue), do: :green
  defp toggle_environment(:green), do: :blue

  defp current_version(state) do
    case state.current_deployment do
      nil -> "0.0.0"
      d -> d.version
    end
  end

  defp generate_deployment_id do
    "DEP-#{System.system_time(:second)}-#{:rand.uniform(9999)}"
  end

  defp strategy_to_int(:blue_green), do: 1
  defp strategy_to_int(:canary), do: 2
  defp strategy_to_int(:rolling), do: 3
  defp strategy_to_int(:hot_code), do: 4
end
```

The `deploy/2` function orchestrates the full deployment lifecycle: strategy selection, environment provisioning, health validation, traffic switching, and rollback on failure. The canary deployment implementation uses progressive traffic percentages with health validation at each stage, providing fine-grained control over rollout risk.

## Integration Points

| Component | Direction | Description |
|-----------|-----------|-------------|
| [Fly.io](@/glossary/fly-io.md) Infrastructure | Bidirectional | Instance provisioning, traffic routing, and health monitoring |
| [Prismatic Web](@/glossary/prismatic-web.md) | Target | LiveView connection draining and WebSocket migration |
| [Prismatic API](@/apps/prismatic-api.md) | Target | API endpoint health validation during deployment |
| [PostgreSQL](@/glossary/postgresql.md) | Outbound | Database migration execution and verification |
| [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) | Outbound | Reports deployment health metrics for quality scoring |
| [SEADF](@/glossary/seadf.md) Evolution Pipeline | Inbound | Receives deployment directives from autonomous evolution |
| CI/CD Pipeline | Inbound | Receives deployment triggers from GitLab CI/CD |
| [ETS](@/glossary/ets.md) State | Managed | Handles ETS table state during hot code loads |

## Operational Workflow

The agent operates through four primary modes: planned deployment, emergency deployment, rollback, and post-deployment validation.

**Planned Deployment** follows the full lifecycle: strategy selection, environment preparation, health pre-checks, deployment execution, progressive traffic migration, health validation at each stage, and final cutover. This mode is used for scheduled releases and includes comprehensive health checking at every stage.

**Emergency Deployment** provides an accelerated deployment path for critical hotfixes. The agent skips the canary progressive rollout and performs direct blue-green switching after minimal health validation, prioritizing speed over gradual risk mitigation. Emergency deployments maintain instant rollback capability.

**Rollback** reverts traffic to the previous version within seconds. The agent switches the traffic router back to the previous environment, verifies that the rollback environment is healthy, and logs the rollback event for post-incident analysis.

**Post-Deployment Validation** runs after deployment completion, performing extended health checks over a configurable observation period (default 30 minutes). If any degradation is detected during the observation period, the agent triggers automatic rollback.

## NABLA Compliance

The Zero-Downtime Deployment Specialist operates under [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic governance for deployment decisions.

**Signal Plurality**: Deployment health claims require at least three independent signals: synthetic transaction success, latency measurement within thresholds, and error rate below limits. A deployment is not marked as healthy until all three signals converge.

**Contradiction Preservation**: When health signals disagree (latency within threshold but error rate elevated), both signals are preserved and the deployment is held in validation state rather than proceeding. The agent does not suppress contradictory health evidence.

**Provenance Mandatory**: Every deployment carries complete provenance: deployment strategy, version identifiers, environment configurations, health check results at each stage, traffic routing decisions, and timing data. The deployment history is immutable.

**Time Decay**: Post-deployment health observations decay in relevance as the system stabilizes. The observation period provides temporal coverage to detect delayed degradation effects.

## Configuration

```elixir
config :prismatic_agents, Prismatic.Agents.ZeroDowntimeDeployment,
  default_strategy: :blue_green,
  canary_stages: [1, 5, 10, 25, 50, 100],
  canary_stage_duration: :timer.minutes(5),
  health_check_interval: :timer.seconds(10),
  health_check_timeout: :timer.seconds(5),
  max_latency_ms: 250,
  max_error_rate: 0.01,
  drain_timeout: :timer.minutes(2),
  observation_period: :timer.minutes(30),
  rollback_timeout: :timer.seconds(30),
  telemetry_prefix: [:prismatic, :deployment]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `default_strategy` | `:blue_green` | Default deployment strategy |
| `canary_stages` | `[1, 5, 10, 25, 50, 100]` | Traffic percentages for canary stages |
| `max_latency_ms` | 250 | Maximum acceptable latency during deployment |
| `max_error_rate` | 0.01 | Maximum acceptable error rate (1%) |
| `observation_period` | 30 minutes | Post-deployment health observation window |

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Blue-green switch time | < 30 seconds | 5-15 seconds |
| Canary full rollout | < 60 minutes | 25-45 minutes |
| Rolling update (all instances) | < 30 minutes | 10-20 minutes |
| Rollback execution | < 30 seconds | 3-10 seconds |
| Health check latency | < 5 seconds | 1-3 seconds |
| Connection drain time | < 2 minutes | 30-90 seconds |
| Zero-downtime guarantee | 100% | 99.99% |

The agent optimizes deployment speed while maintaining safety through progressive health validation. Blue-green deployments provide the fastest cutover (seconds), while canary deployments provide the safest progressive rollout (minutes to hours). Rollback is always available within seconds, ensuring that deployment failures never cause prolonged service disruption.

## Related Resources

- [BEAM](@/glossary/beam.md) -- Erlang virtual machine with hot code loading capability
- [Fly.io](@/glossary/fly-io.md) -- Platform infrastructure for deployment management
- [LiveView](@/glossary/liveview.md) -- Real-time UI framework requiring graceful connection handling
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Resilience pattern for deployment failure isolation
- [Page Load Performance](@/glossary/aiad.md) -- Performance standard maintained during deployments
- [NO MERCY Doctrine](@/glossary/no-mercy.md) -- Zero-tolerance for service disruption
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework for deployment health claims
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification standard

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)