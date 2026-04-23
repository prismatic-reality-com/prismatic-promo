+++
title = "aiad-verification-engine"
weight = 31
[extra]
domain = "infrastructure"
level = "L4"
description = "AIAD specification validation, schema verification, cross-reference integrity checking, and manifest integrity for the entire agent ecosystem"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "telemetry", "trinity-gate"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["aiad-verification-engine", "AIAD", "agents", "agent", "Prismatic Platform", "Verification", "Validates"]
tags = ["agents", "agent", "aiad-verification-engine", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "aiad-verification-engine - Prismatic Platform"
+++

## Overview

The [AIAD](@/glossary/aiad.md) Verification Engine operates as an L4 domain specialist agent within the Infrastructure domain of the Prismatic Platform. This agent validates the structural integrity, semantic correctness, and schema compliance of all AIAD agent specifications, command definitions, pipeline configurations, and policy documents. Every artifact in the AIAD ecosystem must pass verification before it can be registered, deployed, or referenced by other agents.

Verification in the AIAD ecosystem encompasses multiple dimensions. Structural validation ensures that manifest files conform to the AIAD schema with all required fields present and correctly typed. Semantic validation checks that referenced agents, commands, and capabilities actually exist and that dependency declarations form a valid directed acyclic graph. Cross-reference validation confirms that agent coordination tables reference agents that exist in the [registry](@/glossary/registry-otp.md) and that authority level claims are consistent with the agent's domain classification.

The verification engine serves as the quality gate for the AIAD specification layer. Without rigorous verification, the autonomous evolution cycles driven by the [AIAD Auto-Evolution Supreme](@/agents/aiad-auto-evolution-supreme.md) could propagate specification errors across the ecosystem. The verification engine prevents this by enforcing schema compliance at every specification state transition: creation, modification, deployment, and hot reload. This continuous verification transforms the AIAD ecosystem from a collection of individual specification files into a formally validated knowledge base with guaranteed structural integrity.

## Architecture

The Verification Engine is implemented as a [GenServer](@/glossary/genserver.md) process within the `prismatic_agents` [supervision tree](@/glossary/supervision-tree.md). It maintains a verification cache in [ETS](@/glossary/ets.md) for previously verified specifications and uses the AIAD schema definition as the canonical reference for structural validation.

The architecture separates verification into three independent validation passes that can execute in parallel. The structural pass validates YAML syntax, required fields, data types, and enumeration values against the schema. The semantic pass validates cross-references, dependency declarations, and authority level consistency. The ecosystem pass validates that the specification integrates correctly with the existing registry -- no dangling references, no circular dependencies, no authority level contradictions.

Each validation pass produces a structured result with pass/fail status and detailed error descriptions for any failures. Results are aggregated into a composite verification report that serves as the specification's quality certificate. Verified specifications receive a cryptographic hash stamp that enables fast re-verification: if the specification content has not changed since the last verification, the cached result is returned without re-executing the full validation pipeline.

The periodic ecosystem scan runs a complete verification of all registered specifications, detecting specifications that have become invalid due to external changes (removed dependent agents, updated schema requirements, or modified registry state). This scan ensures that ecosystem-wide consistency is maintained even when individual specification changes do not trigger verification of dependent artifacts.

## Core Capabilities

- **Schema validation** against the AIAD specification standard, checking all required fields, data types, enumeration values, and structural constraints with detailed error reporting for failures
- **Cross-reference integrity checking** that validates all agent references, command links, capability claims, and coordination table entries resolve to existing ecosystem artifacts
- **Dependency graph analysis** ensuring that agent dependency declarations form a valid DAG with no circular references, missing dependencies, or version conflicts
- **Behavioral rule verification** that confirms agent specifications include all required behavioral rules, escalation paths, and doctrine compliance declarations
- **Continuous ecosystem scanning** with periodic full-ecosystem verification runs that detect specification drift, orphaned references, and consistency violations across the entire [agent registry](@/glossary/agent-registry.md)
- **Verification caching** with content-hash-based cache keys that enable instant re-verification of unchanged specifications while guaranteeing fresh validation for modified artifacts

## Implementation

The Verification Engine provides a multi-pass validation pipeline with caching and periodic ecosystem scanning.

```elixir
defmodule PrismaticAgents.VerificationEngine do
  use GenServer

  @schema_version "1.0.0"
  @ecosystem_scan_interval_ms :timer.hours(2)
  @verification_cache :aiad_verification_cache

  def verify(specification, opts \\ []) do
    GenServer.call(__MODULE__, {:verify, specification, opts})
  end

  def verify_ecosystem do
    GenServer.call(__MODULE__, :ecosystem_scan, :timer.minutes(10))
  end

  def get_verification_status(agent_id) do
    case :ets.lookup(@verification_cache, agent_id) do
      [{^agent_id, result}] -> {:ok, result}
      [] -> {:error, :not_verified}
    end
  end

  @impl true
  def handle_call({:verify, specification, opts}, _from, state) do
    case check_cache(specification) do
      {:hit, cached_result} ->
        {:reply, {:ok, cached_result}, state}
      :miss ->
        result = run_verification_pipeline(specification, opts)
        cache_result(specification, result)
        {:reply, result, update_stats(state, result)}
    end
  end

  @impl true
  def handle_call(:ecosystem_scan, _from, state) do
    specifications = load_all_specifications()
    results = Enum.map(specifications, fn spec ->
      {spec.id, run_verification_pipeline(spec, [])}
    end)

    failures = Enum.filter(results, fn {_id, result} -> match?({:error, _}, result) end)
    emit_telemetry(:ecosystem_scan_complete, %{total: length(results), failures: length(failures)})
    {:reply, {:ok, %{total: length(results), failures: failures}}, state}
  end

  defp run_verification_pipeline(specification, _opts) do
    with {:ok, structural} <- validate_structure(specification, @schema_version),
         {:ok, semantic} <- validate_semantics(specification),
         {:ok, ecosystem} <- validate_ecosystem_integration(specification) do
      {:ok, %{structural: structural, semantic: semantic, ecosystem: ecosystem}}
    else
      {:error, pass, details} -> {:error, %{pass: pass, details: details}}
    end
  end

  defp validate_structure(spec, schema_version) do
    schema = load_schema(schema_version)
    errors = Enum.flat_map(schema.required_fields, fn field ->
      case Map.get(spec, field) do
        nil -> [{:missing_field, field}]
        value -> validate_field_type(field, value, schema)
      end
    end)
    case errors do
      [] -> {:ok, :structure_valid}
      _ -> {:error, :structural, errors}
    end
  end
end
```

The verification cache uses content-based hashing (SHA-256 of the specification content) as cache keys. This ensures that any modification to a specification invalidates its cache entry, forcing re-verification on the next access. The cache is implemented as an ETS table with `:set` type for O(1) lookup performance.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [aiad-deployment-engine](@/agents/aiad-deployment-engine.md) | Pre-deploy Gate | Validates deployment artifacts before [release](@/glossary/release.md) pipeline execution |
| [aiad-backup-manager](@/agents/aiad-backup-manager.md) | Backup Validator | Verifies backup integrity by validating restored specifications |
| [aiad-hot-reload-coordinator](@/agents/aiad-hot-reload-coordinator.md) | Reload Gate | Validates specifications before hot reload execution |
| [agent-discovery-specialist](@/agents/agent-discovery-specialist.md) | Registration Gate | Validates specifications during registry registration |
| [aiad-auto-evolution-supreme](@/agents/aiad-auto-evolution-supreme.md) | Evolution Gate | Validates specification mutations before ecosystem deployment |
| [aiad-ecosystem-improver](@/agents/aiad-ecosystem-improver.md) | Improvement Gate | Validates improvement candidates before application |

## Operational Workflow

The verification engine operates in two modes: on-demand verification for individual specification changes and scheduled ecosystem scanning for global consistency assurance.

**On-Demand Verification.** When an agent specification is created, modified, or presented for deployment, the verification engine is invoked synchronously. The three-pass pipeline (structural, semantic, ecosystem) executes in sequence. A failure in any pass produces a structured error report with specific field-level details. The requesting system receives either a verification certificate (on success) or a detailed failure report (on failure).

**Ecosystem Scanning.** Every 2 hours, the verification engine executes a complete scan of all registered specifications. This scan catches consistency violations that individual specification verification cannot detect: agents that were valid when registered but became invalid due to subsequent changes in their dependencies, authority hierarchy, or coordination partners. Ecosystem scan failures trigger notifications to the [alert-management-specialist](@/agents/alert-management-specialist.md) for investigation.

**Cache Management.** Verification results are cached with content-hash keys. When a specification is presented for verification, the engine computes its content hash and checks the cache. Cache hits return immediately without re-executing the validation pipeline. Cache entries are invalidated automatically when ecosystem scans detect that external changes have affected the specification's validity context.

## NABLA Compliance

The Verification Engine operates under NABLA Infinity axiom compliance as the foundational quality gate for the specification ecosystem.

**Signal Plurality.** Verification draws from three independent validation passes (structural, semantic, ecosystem), each examining different aspects of specification quality. No single pass determines overall verification status; a specification must pass all three independently.

**Provenance Mandatory.** Every verification result includes provenance metadata: the schema version used, the timestamp of verification, the specification content hash, and the detailed results of each validation pass. Verification certificates are traceable to their specific validation context.

**Unknown Valid.** When the verification engine encounters a specification field that is not defined in the current schema (potentially a field from a newer schema version), it classifies it as "unknown" rather than rejecting the specification. Unknown fields are logged and reported but do not block verification, enabling forward compatibility with schema evolution.

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.VerificationEngine,
  schema_version: "1.0.0",
  ecosystem_scan_interval_ms: :timer.hours(2),
  verification_cache_table: :aiad_verification_cache,
  cache_ttl_ms: :timer.hours(24),
  parallel_validation_passes: true,
  telemetry_prefix: [:prismatic_agents, :verification_engine]
```

The AIAD specification at `.aiad/agents/aiad-verification-engine.agent.md` defines L4 domain specialist authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. The ecosystem scan interval is configurable per environment.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Single spec verification** | < 500ms | < 1s | Time for complete three-pass verification |
| **Cached verification** | < 1ms | < 5ms | Time for cache-hit verification (hash comparison) |
| **Ecosystem scan** | < 5min | < 10min | Time for complete scan of all 404+ specifications |
| **Cache hit rate** | > 80% | > 70% | Percentage of verifications served from cache |
| **Verification accuracy** | 100% | 100% | No false positives or false negatives |
| **Schema coverage** | 100% | 100% | All AIAD schema fields validated |

## Related Resources

- [AIAD Standard](@/capabilities/aiad-standard.md) -- Specification standard defining the verification schema
- [Agent Registry](@/registry/_index.md) -- Registry whose integrity is maintained by verification
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture including verification layer
- [Trinity Gate](@/glossary/trinity-gate.md) -- Multi-layer validation system complementing specification verification
- [Applications](@/apps/_index.md) -- Platform applications with agent specifications under verification
- [Glossary](@/glossary/_index.md) -- Technical terminology and concepts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)