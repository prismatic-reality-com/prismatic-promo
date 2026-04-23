+++
title = "anti-corruption-layer-specialist"
weight = 33
[extra]
domain = "integration"
level = "L3"
description = "Legacy system isolation through anti-corruption layers with domain model protection, semantic mapping, protocol normalization, and migration path planning"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "mycelial-network", "ecto", "genserver", "behaviour", "adapter-pattern"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["anti-corruption-layer-specialist", "Legacy", "agents", "agent", "Prismatic Platform", "Translation", "Corruption Layer", "Specialist"]
tags = ["agents", "agent", "anti-corruption-layer-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "anti-corruption-layer-specialist - Prismatic Platform"
+++

## Overview

The Anti-Corruption Layer Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Integration domain of the Prismatic Platform. This agent designs and maintains protective boundaries between the platform's clean domain models and external or legacy systems whose data structures, naming conventions, and semantic assumptions would otherwise contaminate the core architecture. The anti-corruption layer pattern ensures that integration with imperfect external systems never degrades internal code quality.

Legacy system integration is one of the most persistent sources of technical debt in enterprise software. Without deliberate boundary management, foreign concepts leak into domain models, naming inconsistencies propagate through codebases, and external system limitations become permanent constraints on internal design. The Anti-Corruption Layer Specialist prevents this by establishing translation layers that map between external representations and internal domain language, keeping the Prismatic Platform's [Elixir](@/glossary/elixir.md) codebase free from external contamination.

The agent's scope extends beyond simple data transformation. It addresses semantic mapping (translating between different conceptual models), protocol normalization (wrapping legacy protocols behind modern interfaces), validation enforcement (rejecting malformed external data at the boundary), and migration planning (identifying opportunities to reduce anti-corruption layer complexity as legacy systems are modernized). This comprehensive approach ensures that external integrations remain isolated, testable, and replaceable.

## Architecture

The Anti-Corruption Layer Specialist manages a library of translation modules organized by external system integration. Each translation module implements the platform's `AntiCorruptionLayer` [behaviour](@/glossary/behaviour.md), ensuring consistent interface patterns across all boundary translations.

The architecture follows a layered structure. The outermost layer handles protocol normalization -- converting SOAP, REST, FTP, or proprietary binary protocols into a uniform internal message format. The middle layer handles semantic translation -- mapping external domain concepts to internal domain language with explicit transformation rules. The innermost layer handles validation -- ensuring that translated data conforms to internal type constraints and business rules before entering the domain model.

Each layer is implemented as a separate module within the translation module, enabling independent testing and evolution. The protocol layer can be updated when an external system modernizes its API without affecting the semantic or validation layers. The semantic layer can be refined as the platform's understanding of the external domain deepens. The validation layer enforces invariants that protect internal data integrity.

```elixir
defmodule PrismaticIntegration.AntiCorruptionLayer do
  @callback translate_inbound(external_data :: map()) ::
    {:ok, internal_data :: map()} | {:error, term()}

  @callback translate_outbound(internal_data :: map()) ::
    {:ok, external_data :: map()} | {:error, term()}

  @callback validate(translated_data :: map()) ::
    {:ok, validated :: map()} | {:error, [validation_error()]}
end

defmodule PrismaticIntegration.LegacyRegistry.ACL do
  @behaviour PrismaticIntegration.AntiCorruptionLayer

  @semantic_map %{
    "FIRMA_NAZEV" => :company_name,
    "ICO" => :registration_number,
    "SIDLO" => :registered_address,
    "DATUM_VZNIKU" => :incorporation_date
  }

  @impl true
  def translate_inbound(external_data) do
    translated = Enum.reduce(@semantic_map, %{}, fn {ext_key, int_key}, acc ->
      case Map.get(external_data, ext_key) do
        nil -> acc
        value -> Map.put(acc, int_key, normalize_value(int_key, value))
      end
    end)

    validate(translated)
  end

  @impl true
  def translate_outbound(internal_data) do
    reverse_map = Map.new(@semantic_map, fn {ext, int} -> {int, ext} end)
    external = Enum.reduce(reverse_map, %{}, fn {int_key, ext_key}, acc ->
      case Map.get(internal_data, int_key) do
        nil -> acc
        value -> Map.put(acc, ext_key, denormalize_value(ext_key, value))
      end
    end)
    {:ok, external}
  end

  @impl true
  def validate(translated_data) do
    errors = []
    |> validate_required(translated_data, [:company_name, :registration_number])
    |> validate_format(translated_data, :registration_number, ~r/^\d{8}$/)

    case errors do
      [] -> {:ok, translated_data}
      _ -> {:error, errors}
    end
  end
end
```

## Core Capabilities

- **Domain model protection** through translation layers that convert external data representations into internal domain structures, preventing foreign concepts from leaking into core business logic
- **Semantic mapping management** maintaining bidirectional translation dictionaries between external system terminology and Prismatic domain language, with versioned mapping histories for audit purposes
- **Legacy [protocol](@/glossary/protocol.md) normalization** that wraps outdated communication patterns like SOAP, FTP, or proprietary binary protocols behind modern Elixir [behaviour](@/glossary/behaviour.md)-based interfaces
- **Boundary validation enforcement** with strict input validation at every anti-corruption layer entry point, rejecting malformed or semantically invalid data before it enters the domain
- **Migration path planning** that identifies opportunities to gradually reduce anti-corruption layer complexity as legacy systems are modernized or replaced
- **Translation test generation** automatically generating property-based tests for translation modules that verify bidirectional consistency (translate inbound then outbound produces equivalent data)

## Implementation

The Anti-Corruption Layer infrastructure provides a behaviour-based framework with automatic test generation and monitoring.

The behaviour-based approach ensures that all translation modules implement the same interface, enabling the platform to treat external system integrations uniformly. When a new external system integration is added, the developer implements the `AntiCorruptionLayer` behaviour, providing `translate_inbound/1`, `translate_outbound/1`, and `validate/1` callbacks. The platform's test infrastructure automatically generates property-based tests that verify bidirectional translation consistency.

Translation modules are registered in an ETS-backed registry that enables runtime discovery and monitoring. The registry tracks translation module health metrics including translation success rates, validation failure rates, and average translation latency. These metrics feed into the alert management system for proactive monitoring of integration boundary health.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [adapter-pattern-specialist](@/agents/adapter-pattern-specialist.md) | Implementation Partner | Implements [adapter pattern](@/glossary/adapter-pattern.md)s within anti-corruption layer boundaries |
| [cross-domain-integration-orchestrator](@/agents/cross-domain-integration-orchestrator.md) | Integration Authority | Coordinates anti-corruption requirements across domain boundaries |
| [data-migration-architect](@/agents/data-migration-architect.md) | Migration Planner | Plans data migration strategies that respect anti-corruption boundaries |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Validation Partner | Verifies translation module compliance with the ACL behaviour |
| [alert-management-specialist](@/agents/alert-management-specialist.md) | Health Monitor | Routes translation failure alerts to integration teams |

## Operational Workflow

The anti-corruption layer operational workflow covers both the design of new translation layers and the ongoing maintenance of existing ones.

**New Integration Design.** When a new external system integration is required, the specialist analyzes the external system's data model, communication protocol, and semantic vocabulary. A translation specification is produced that documents the mapping between external and internal concepts, including edge cases, optional fields, and format differences. The specification is reviewed and approved before implementation begins.

**Translation Module Implementation.** The developer implements the `AntiCorruptionLayer` behaviour following the specification. Property-based tests are generated to verify bidirectional translation consistency. The module is registered in the translation registry and monitoring is activated. The module undergoes quality gate verification before production deployment.

**Ongoing Maintenance.** Translation modules are monitored for health metrics. When external systems change their data formats or protocols, the translation module is updated to accommodate the change without propagating it to internal consumers. Semantic mapping dictionaries are versioned, enabling rollback if a mapping change introduces translation errors.

**Migration Planning.** The specialist periodically reviews active translation layers, identifying opportunities to simplify or eliminate anti-corruption layers when external systems are modernized. Migration plans document the steps required to reduce translation complexity while maintaining backward compatibility during the transition period.

## NABLA Compliance

The Anti-Corruption Layer Specialist operates under NABLA Infinity axiom compliance for translation quality assurance.

**Signal Plurality.** Translation correctness is validated through multiple independent signals: unit tests for individual field translations, property-based tests for bidirectional consistency, integration tests for end-to-end data flow, and runtime monitoring for production translation health.

**Provenance Mandatory.** Every semantic mapping includes provenance: the external system documentation that defines the source field, the internal domain model that defines the target field, the rationale for the mapping, and the version history of mapping changes. This provenance enables audit of translation decisions.

**Contradiction Preservation.** When external data contains contradictory information (e.g., a status field says "active" but a date field indicates expiry), the translation layer preserves both signals in the internal representation rather than resolving the contradiction through suppression.

## Configuration

```elixir
config :prismatic_integration, PrismaticIntegration.AntiCorruptionLayer,
  translation_registry_table: :acl_translation_registry,
  monitoring_interval_ms: :timer.minutes(5),
  validation_strict_mode: true,
  test_generation_enabled: true,
  telemetry_prefix: [:prismatic_integration, :acl]
```

The AIAD specification at `.aiad/agents/anti-corruption-layer-specialist.agent.md` defines L3 strategic command authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. Strict validation mode is enabled by default and cannot be disabled in production environments.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Translation latency** | < 5ms | < 10ms | Time for single record inbound translation |
| **Validation pass rate** | > 99% | > 98% | Percentage of translated records passing validation |
| **Bidirectional consistency** | 100% | 100% | Translate(inbound(outbound(data))) == data |
| **Translation coverage** | 100% | 100% | External fields with defined internal mappings |
| **Active ACL modules** | 12 | N/A | Number of translation modules in production |
| **Migration progress** | 30% simplified | >25%/year | ACL modules simplified through external modernization |

## Related Resources

- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Implementation pattern used within anti-corruption layers
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture including integration boundaries
- [AIAD Standard](@/capabilities/aiad-standard.md) -- Agent specification standard for integration agents
- [Technologies](@/technologies/_index.md) -- Technology stack including external integration targets
- [Applications](@/apps/_index.md) -- Platform applications with external system integrations
- [Glossary](@/glossary/_index.md) -- Technical terminology and concepts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)