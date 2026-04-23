+++
title = "aiad-hot-reload-coordinator"
weight = 26
[extra]
domain = "domain"
level = "L3"
description = "Hot code reloading coordination for live AIAD agent specification updates with state preservation, dependency-aware sequencing, and automatic rollback"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "hot-code-reload", "telemetry", "beam", "genserver", "supervision-tree", "ets"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["aiad-hot-reload-coordinator", "AIAD", "agents", "agent", "Prismatic Platform", "GenServer", "BEAM"]
tags = ["agents", "agent", "aiad-hot-reload-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "aiad-hot-reload-coordinator - Prismatic Platform"
+++

## Overview

The [AIAD](@/glossary/aiad.md) Hot Reload Coordinator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent that manages live updates to agent specifications without requiring system restarts or deployment cycles. Leveraging the [BEAM](@/glossary/beam.md) virtual machine's native [hot code reload](@/glossary/hot-code-reload.md)ing capabilities, this agent enables real-time modification of agent behavior, configuration, and coordination patterns while the platform continues serving requests. This is essential for maintaining the platform's zero-downtime operational guarantee.

Hot code reloading in a 400+ agent ecosystem is not as simple as swapping a module. The Hot Reload Coordinator must ensure state consistency across reloaded agents, validate that new specifications are compatible with in-flight operations, and coordinate reload timing to prevent partial updates that could leave the agent ecosystem in an inconsistent state. The coordinator implements a two-phase reload [protocol](@/glossary/protocol.md): first validating the new specification against the current runtime state, then executing the reload with rollback capability if post-reload health checks fail.

The two-phase approach addresses a fundamental tension in live code updates: the need for speed (minimize the window where old and new code coexist) versus the need for safety (ensure the new code does not corrupt existing state or break ongoing operations). By separating validation from execution, the coordinator can perform thorough compatibility checks without holding any locks, then execute the actual code swap in a minimal time window with pre-built rollback capability.

## Architecture

The Hot Reload Coordinator is implemented as a [GenServer](@/glossary/genserver.md) within the `prismatic_agents` [supervision tree](@/glossary/supervision-tree.md). The architecture separates three concerns: specification validation, code swap execution, and post-reload verification.

The validation layer checks structural compatibility between the new specification and the current runtime state. If a [GenServer](@/glossary/genserver.md) state structure changes between versions, the validator identifies the required state transformation and generates a migration function. If the new specification changes the agent's coordination table (adding or removing peer agents), the validator ensures all referenced agents exist and are ready to accept the updated coordination pattern.

The execution layer leverages BEAM's built-in code loading mechanism through `:code.load_binary/3` and `:code.purge/1`. For specification-only changes (metadata, configuration), the update is applied through ETS table writes without module code changes. For behavioral changes that require module recompilation, the coordinator uses Erlang's code upgrade protocol, calling `code_change/3` callbacks on affected GenServers to migrate state between versions.

The verification layer monitors reloaded agents for a configurable observation window (default 30 seconds), checking health metrics, error rates, and state consistency. If any check fails, the coordinator executes an automatic rollback to the pre-reload state using the backup created before the swap.

```elixir
defmodule PrismaticAgents.HotReloadCoordinator do
  use GenServer

  @observation_window_ms 30_000
  @max_concurrent_reloads 5

  def reload(agent_id, new_spec, opts \\ []) do
    GenServer.call(__MODULE__, {:reload, agent_id, new_spec, opts}, :timer.minutes(2))
  end

  def reload_batch(agent_specs, opts \\ []) do
    GenServer.call(__MODULE__, {:reload_batch, agent_specs, opts}, :timer.minutes(10))
  end

  @impl true
  def handle_call({:reload, agent_id, new_spec, opts}, _from, state) do
    with {:ok, validated} <- validate_compatibility(agent_id, new_spec),
         {:ok, backup} <- create_pre_reload_backup(agent_id),
         {:ok, reloaded} <- execute_code_swap(agent_id, validated),
         {:ok, verified} <- observe_post_reload(agent_id, @observation_window_ms) do
      emit_telemetry(:reload_success, %{agent_id: agent_id})
      {:reply, {:ok, verified}, log_reload(state, agent_id, new_spec)}
    else
      {:error, stage, reason} ->
        rollback_to_backup(agent_id, backup)
        emit_telemetry(:reload_rollback, %{agent_id: agent_id, stage: stage})
        {:reply, {:error, %{stage: stage, reason: reason}}, state}
    end
  end

  defp validate_compatibility(agent_id, new_spec) do
    current_state = get_agent_state(agent_id)
    case check_state_migration(current_state, new_spec) do
      {:ok, migration_fn} -> {:ok, %{spec: new_spec, migration: migration_fn}}
      {:error, :incompatible} -> {:error, :validation, :state_incompatible}
    end
  end

  defp execute_code_swap(agent_id, validated) do
    case validated.migration do
      nil -> apply_spec_only_update(agent_id, validated.spec)
      migration_fn -> apply_code_update(agent_id, validated.spec, migration_fn)
    end
  end
end
```

## Core Capabilities

- **Two-phase reload protocol** that validates specification compatibility before executing code swap, with automatic rollback if post-reload health checks detect degraded behavior or state corruption
- **Dependency-aware reload sequencing** that identifies agents dependent on the reloading target and coordinates reload ordering to maintain consistency across the agent communication graph
- **State migration during reload** preserving GenServer state across code versions by implementing state transformation functions that adapt existing state to new specification requirements
- **Selective module targeting** enabling reload of individual [agent module](@/glossary/agent-module.md)s without affecting the broader ecosystem, minimizing blast radius during iterative development cycles
- **Batch reload coordination** supporting coordinated updates of multiple agents in dependency order, ensuring that inter-agent communication remains consistent throughout the batch reload process
- **Reload [audit trail](@/glossary/audit-trail.md)** recording every hot reload event with before/after specification versions, triggering session, and post-reload validation results for compliance and debugging

## Implementation

The implementation builds on BEAM's native code loading primitives with additional coordination logic for multi-agent consistency.

The batch reload function resolves the dependency graph of affected agents and sequences reloads in topological order, ensuring that leaf agents (those with no dependents) are reloaded first and root agents (those depended upon by many others) are reloaded last. This ordering minimizes the window where agents at different specification versions must communicate.

For specification-only updates that do not require module recompilation, the coordinator updates the specification in the AIAD registry ETS table and notifies the affected agent through a GenServer cast. The agent reads the updated specification on its next operation cycle, avoiding any disruption to in-flight work.

For behavioral updates requiring module changes, the coordinator uses Erlang's `sys:suspend/1` to pause the target GenServer, applies the code change through `:code.load_binary/3`, calls `sys:change_code/4` to trigger the `code_change/3` callback for state migration, and then resumes the process with `sys:resume/1`. This sequence ensures that no messages are lost during the code swap and that state is correctly migrated to the new version.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [aiad-dashboard-commander](@/agents/aiad-dashboard-commander.md) | Visibility Partner | Displays reload events and post-reload health status on monitoring dashboards |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Pre-reload Validator | Validates new specifications before reload execution |
| [aiad-deployment-engine](@/agents/aiad-deployment-engine.md) | Deployment Fallback | Handles cases where hot reload is insufficient and full deployment is required |
| [aiad-backup-manager](@/agents/aiad-backup-manager.md) | Safety Net | Provides pre-reload backup for rollback capability |
| [alert-management-specialist](@/agents/alert-management-specialist.md) | Alert Router | Routes reload failure alerts to operations teams |

## Operational Workflow

The hot reload workflow follows a structured sequence with safety gates at each transition.

**Pre-Reload Validation.** The coordinator receives a reload request specifying the target agent and new specification. It validates the new specification against the AIAD schema, checks state migration compatibility, resolves the dependency graph, and creates a pre-reload backup. If any validation check fails, the reload is rejected before any code changes occur.

**Reload Execution.** For specification-only updates, the ETS registry is updated atomically. For code changes, the target GenServer is suspended, code is swapped, state is migrated, and the process is resumed. The entire execution phase targets sub-second completion to minimize the suspension window.

**Post-Reload Observation.** The coordinator monitors the reloaded agent for the observation window (default 30 seconds), checking process health, error rates, telemetry output, and state consistency. If any metric degrades beyond acceptable thresholds, automatic rollback executes immediately.

**Rollback Protocol.** If post-reload checks fail, the coordinator restores the pre-reload specification from the backup, re-executes the code swap in reverse, and verifies that the original behavior is restored. The rollback is logged as an incident for investigation.

## NABLA Compliance

The Hot Reload Coordinator operates under NABLA Infinity axiom compliance for reload safety assurance.

**Signal Plurality.** Post-reload health assessment combines multiple independent signals: process health (supervision tree signal), error rate (telemetry signal), state consistency (internal validation signal), and functional correctness (test signal). No single signal determines reload success.

**Provenance Mandatory.** Every reload event is recorded with complete provenance: the triggering session, the pre-reload specification version, the post-reload specification version, the state migration applied, and the observation window results. This audit trail enables any behavioral change to be traced to its reload event.

**Time Decay.** Pre-reload compatibility assessments are valid only for the current runtime state. If significant time elapses between validation and execution (due to queued reloads), the validation is refreshed to prevent stale compatibility assessments from authorizing incompatible reloads.

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.HotReloadCoordinator,
  observation_window_ms: 30_000,
  max_concurrent_reloads: 5,
  suspension_timeout_ms: 5_000,
  auto_rollback_on_failure: true,
  emit_audit_trail: true,
  telemetry_prefix: [:prismatic_agents, :hot_reload]
```

The AIAD specification at `.aiad/agents/aiad-hot-reload-coordinator.agent.md` defines L3 strategic command authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. The `max_concurrent_reloads` limit prevents resource exhaustion during batch operations.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Spec-only reload** | < 100ms | < 500ms | Time for specification-only update (no code change) |
| **Code swap reload** | < 2s | < 5s | Time for full code swap with state migration |
| **Batch reload (10 agents)** | < 30s | < 60s | Time for coordinated multi-agent reload |
| **Rollback execution** | < 1s | < 2s | Time to restore pre-reload state |
| **Observation window** | 30s | 30s | Duration of post-reload health monitoring |
| **Reload success rate** | > 98% | > 95% | Percentage of reloads completing without rollback |

## Related Resources

- [BEAM Hot Code Loading](@/glossary/hot-code-reload.md) -- BEAM virtual machine code loading mechanism
- [AIAD Standard](@/capabilities/aiad-standard.md) -- Agent specification standard for reloadable specifications
- [OTP Code Upgrade](@/glossary/otp.md) -- OTP code_change callback protocol
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture including live update capabilities
- [Applications](@/apps/_index.md) -- Platform applications hosting reloadable agents
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Telemetry events for reload monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)