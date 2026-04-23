+++
title = "Specialized Variants"
weight = 50
[extra]
tags = ["glossary", "architecture", "patterns", "elixir", "design", "polymorphism", "otp", "composition"]
description = "Domain-specific adaptations of general-purpose abstractions that preserve core contracts while tailoring behavior, data structures, and performance characteristics to particular use cases -- a fundamental architectural pattern in the Prismatic Platform's 115-app umbrella ecosystem"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["adapter-pattern", "behaviour", "protocol", "composability", "architectural-pattern", "modularity", "pattern-matching", "typespec", "polymorphism", "bounded-context"]
related_concepts = ["behavioral specialization", "protocol dispatch", "adapter contracts", "domain-specific abstractions", "variant selection", "configuration-driven polymorphism"]
platforms = ["Prismatic Platform", "BEAM/OTP", "Phoenix LiveView"]
see_also = ["adapter-pattern", "behaviour-pattern", "protocol", "composability"]
key_takeaway = "Specialized variants enable a platform to maintain a single coherent architecture while adapting behavior to diverse domains -- storage backends, agent types, security models, and UI patterns all emerge as specializations of shared abstractions"
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1227
date_modified = "2026-02-23"
keywords = ["Specialized", "Variants", "Domain-specific", "Prismatic", "Platforms", "115-app", "glossary", "architecture", "Prismatic Platform", "Elixir"]
image = "/images/sections/glossary.png"
image_alt = "Specialized Variants - Prismatic Platform"
+++

## Definition

Specialized Variants are domain-specific adaptations of general-purpose abstractions that maintain contractual compatibility with the base abstraction while tailoring behavior, data structures, performance characteristics, or operational semantics to the requirements of a particular use case. In software architecture, this pattern enables platforms to support diverse domains (storage, security, communication, analysis) through a unified interface layer while allowing each domain to optimize for its specific constraints.

The concept draws from multiple traditions: polymorphism in object-oriented programming, [protocol](@/glossary/protocol.md) dispatch in Elixir, the Strategy pattern in design patterns literature, and parametric modules in ML-family languages. What distinguishes specialized variants from simple subclassing or implementation swapping is the emphasis on preserving the full behavioral contract of the base abstraction while introducing domain-specific extensions.

Within the Prismatic Platform, specialized variants are pervasive. The [storage layer](@/glossary/storage-pattern.md) provides ETS, Ecto, Meilisearch, and KuzuDB variants of a common storage contract. The [agent system](@/glossary/agent.md) provides 530+ variants of a common agent specification. The [security operations](@/glossary/color-teams.md) provide 6 color-team variants of a common security assessment model. Each variant is a specialization, not a deviation.

## Theoretical Foundations

### The Liskov Substitution Principle

Specialized variants must satisfy the Liskov Substitution Principle (LSP): any code that works with the base abstraction must work correctly with any variant. This means variants can extend but never contradict the base contract. In Elixir, [behaviours](@/glossary/behaviour.md) enforce this at compile time by requiring variant modules to implement all callback functions with the correct signatures.

### Protocol Dispatch and Ad-Hoc Polymorphism

Elixir [protocols](@/glossary/protocol.md) provide the language-level mechanism for specialized variants. A protocol defines a set of functions that any data type can implement, enabling polymorphic dispatch without inheritance hierarchies. This is ad-hoc polymorphism: the variant is associated with a type, not embedded in a class tree.

### Bounded Contexts and Domain-Driven Design

In Domain-Driven Design (DDD), [bounded contexts](@/glossary/bounded-context.md) define the scope within which a model is valid. Specialized variants map naturally to bounded contexts: the same abstract concept (e.g., "storage") takes different concrete forms in different contexts (e.g., in-memory cache vs. persistent database vs. search index). Each variant is the authoritative implementation within its bounded context.

### Category Theory Perspective

From a category theory perspective, specialized variants form a category where the base abstraction is an object, each variant is a morphism from the abstraction to a concrete domain, and variant composition (combining multiple specializations) follows functorial laws. This formalism, while rarely applied explicitly, ensures that variant architectures compose correctly.

## Variant Taxonomy in the Prismatic Platform

### Storage Variants

The platform's storage layer demonstrates the purest application of specialized variants:

| Variant | Domain | Optimization | Use Case |
|---------|--------|-------------|----------|
| `Storage.ETS` | In-memory | Microsecond access, no persistence | Caches, registries, real-time state |
| `Storage.Ecto` | Relational | ACID transactions, complex queries | Business data, audit trails |
| `Storage.Meilisearch` | Full-text search | Sub-50ms search, typo tolerance | User-facing search, content discovery |
| `Storage.KuzuDB` | Graph | Relationship traversal, pattern matching | Knowledge graphs, OSINT networks |

All four implement the `Prismatic.StorageCore.Adapter` behaviour, meaning any code written against the storage contract works with any backend.

### Agent Variants

The 530+ agents are specialized variants of the base agent specification:

| Variant Category | Count | Specialization |
|-----------------|-------|---------------|
| Strategic Commanders (L3) | ~50 | Decision-making, orchestration, resource allocation |
| Tactical Specialists (L2) | ~200 | Domain-specific analysis, execution, reporting |
| Operational Units (L1) | ~280 | Task execution, data collection, monitoring |

Each variant implements the AIAD agent specification but specializes for its domain (security, quality, OSINT, evolution, etc.).

### Security Variants

The [Color Team](@/glossary/color-teams.md) system provides security assessment variants:

- **Red Team**: Adversarial simulation (attack surface discovery, vulnerability exploitation)
- **Blue Team**: Defensive posture (signal aggregation, drift detection, auth monitoring)
- **Purple Team**: Synthesis (Red-Blue loop closure, regression guarding)
- **Gray Team**: Boundary exploration (edge case discovery, specification gap analysis)
- **White Team**: Constructive verification (formal proofs, contract validation)
- **Black Team**: Theoretical threat modeling (abstract threat models, worst-case analysis)

All six teams share a common security assessment interface but specialize their methodology.

## Platform Implementation in Elixir

### Behaviour-Based Variant System

```elixir
defmodule Prismatic.VariantSystem do
  @moduledoc """
  Core infrastructure for defining, registering, and dispatching
  to specialized variants. Provides compile-time contract verification
  and runtime variant selection based on context.
  """

  @type variant_spec :: %{
    module: module(),
    domain: atom(),
    capabilities: [atom()],
    constraints: [constraint()],
    priority: non_neg_integer()
  }

  @type constraint :: %{
    type: :latency | :throughput | :consistency | :availability,
    operator: :lt | :lte | :gt | :gte | :eq,
    value: term()
  }

  @type selection_context :: %{
    domain: atom(),
    required_capabilities: [atom()],
    performance_requirements: [constraint()],
    fallback_strategy: :error | :default | :best_effort
  }

  @callback variant_spec() :: variant_spec()
  @callback handles?(term()) :: boolean()
  @callback execute(term(), keyword()) :: {:ok, term()} | {:error, term()}

  defmacro __using__(opts) do
    domain = Keyword.fetch!(opts, :domain)

    quote do
      @behaviour Prismatic.VariantSystem

      @impl true
      def variant_spec do
        %{
          module: __MODULE__,
          domain: unquote(domain),
          capabilities: Module.get_attribute(__MODULE__, :capabilities, []),
          constraints: Module.get_attribute(__MODULE__, :constraints, []),
          priority: Module.get_attribute(__MODULE__, :priority, 50)
        }
      end

      defoverridable variant_spec: 0
    end
  end

  @spec select_variant(selection_context()) :: {:ok, module()} | {:error, :no_matching_variant}
  def select_variant(context) do
    case Registry.lookup(context.domain)
         |> filter_by_capabilities(context.required_capabilities)
         |> filter_by_constraints(context.performance_requirements)
         |> sort_by_priority()
         |> List.first() do
      nil -> handle_no_variant(context.fallback_strategy)
      variant -> {:ok, variant.module}
    end
  end

  @spec dispatch(selection_context(), term(), keyword()) :: {:ok, term()} | {:error, term()}
  def dispatch(context, input, opts \\ []) do
    with {:ok, variant_module} <- select_variant(context) do
      if variant_module.handles?(input) do
        variant_module.execute(input, opts)
      else
        {:error, {:unsupported_input, input, variant_module}}
      end
    end
  end

  defp filter_by_capabilities(variants, required) do
    Enum.filter(variants, fn v ->
      Enum.all?(required, &(&1 in v.capabilities))
    end)
  end

  defp filter_by_constraints(variants, constraints) do
    Enum.filter(variants, fn v ->
      Enum.all?(constraints, &constraint_satisfied?(&1, v.constraints))
    end)
  end

  defp constraint_satisfied?(required, variant_constraints) do
    case Enum.find(variant_constraints, &(&1.type == required.type)) do
      nil -> false
      vc -> compare_constraint(vc, required)
    end
  end

  defp compare_constraint(%{value: v1}, %{operator: :lt, value: v2}), do: v1 < v2
  defp compare_constraint(%{value: v1}, %{operator: :lte, value: v2}), do: v1 <= v2
  defp compare_constraint(%{value: v1}, %{operator: :gt, value: v2}), do: v1 > v2
  defp compare_constraint(%{value: v1}, %{operator: :gte, value: v2}), do: v1 >= v2
  defp compare_constraint(%{value: v1}, %{operator: :eq, value: v2}), do: v1 == v2

  defp sort_by_priority(variants) do
    Enum.sort_by(variants, & &1.priority, :desc)
  end

  defp handle_no_variant(:error), do: {:error, :no_matching_variant}
  defp handle_no_variant(:default), do: select_variant(%{domain: :default, required_capabilities: [], performance_requirements: [], fallback_strategy: :error})
  defp handle_no_variant(:best_effort), do: {:error, :no_matching_variant}
end
```

### Protocol-Based Variant Dispatch

```elixir
defprotocol Prismatic.Variant.Serializable do
  @moduledoc """
  Protocol enabling specialized variants to define their own
  serialization strategies while maintaining a unified interface.
  Each variant serializes optimally for its domain.
  """

  @doc "Serialize the variant to its preferred format"
  @spec serialize(t()) :: {:ok, binary()} | {:error, term()}
  def serialize(variant)

  @doc "Metadata about the serialization format"
  @spec format_info(t()) :: %{format: atom(), encoding: atom(), version: pos_integer()}
  def format_info(variant)
end

defmodule Prismatic.Variant.ETSRecord do
  @moduledoc "Specialized variant optimized for ETS storage"

  @enforce_keys [:key, :value, :inserted_at]
  defstruct [:key, :value, :inserted_at, :ttl, :metadata]

  @type t :: %__MODULE__{
    key: term(),
    value: term(),
    inserted_at: integer(),
    ttl: pos_integer() | nil,
    metadata: map()
  }
end

defimpl Prismatic.Variant.Serializable, for: Prismatic.Variant.ETSRecord do
  def serialize(%{key: key, value: value, inserted_at: ts, ttl: ttl}) do
    {:ok, :erlang.term_to_binary({key, value, ts, ttl})}
  end

  def format_info(_record) do
    %{format: :etf, encoding: :binary, version: 1}
  end
end

defmodule Prismatic.Variant.SearchDocument do
  @moduledoc "Specialized variant optimized for full-text search"

  @enforce_keys [:id, :content, :index]
  defstruct [:id, :content, :index, :facets, :embeddings, :boost_fields]

  @type t :: %__MODULE__{
    id: String.t(),
    content: map(),
    index: String.t(),
    facets: [String.t()],
    embeddings: [float()] | nil,
    boost_fields: [String.t()]
  }
end

defimpl Prismatic.Variant.Serializable, for: Prismatic.Variant.SearchDocument do
  def serialize(%{id: id, content: content, index: index, facets: facets}) do
    doc = %{"id" => id, "content" => content, "index" => index, "facets" => facets}
    {:ok, Jason.encode!(doc)}
  end

  def format_info(_doc) do
    %{format: :json, encoding: :utf8, version: 1}
  end
end

defmodule Prismatic.Variant.GraphNode do
  @moduledoc "Specialized variant optimized for graph traversal"

  @enforce_keys [:id, :label, :properties]
  defstruct [:id, :label, :properties, :edges_out, :edges_in]

  @type t :: %__MODULE__{
    id: String.t(),
    label: String.t(),
    properties: map(),
    edges_out: [{String.t(), String.t()}],
    edges_in: [{String.t(), String.t()}]
  }
end

defimpl Prismatic.Variant.Serializable, for: Prismatic.Variant.GraphNode do
  def serialize(%{id: id, label: label, properties: props}) do
    cypher = "CREATE (n:#{label} $props) SET n.id = $id"
    {:ok, :erlang.term_to_binary(%{cypher: cypher, params: %{id: id, props: props}})}
  end

  def format_info(_node) do
    %{format: :cypher, encoding: :binary, version: 1}
  end
end
```

## Design Patterns for Specialized Variants

### The Adapter Contract Pattern

Every family of variants shares a [behaviour](@/glossary/behaviour.md) (adapter contract) that defines the required interface. The contract includes both function signatures and semantic expectations documented in `@doc` and `@moduledoc`. Compile-time checking ensures all variants implement the full contract.

### The Registry Pattern

A central [registry](@/glossary/registry.md) tracks all available variants for each domain. The registry supports runtime variant discovery, capability querying, and dynamic variant selection. The Prismatic Platform uses ETS-backed registries for microsecond lookup performance.

### The Fallback Chain Pattern

When the preferred variant is unavailable (node down, service unreachable), a fallback chain selects the next-best variant automatically. This is critical for [resilience](@/glossary/reliability.md) in distributed systems. The chain preserves contract compatibility while degrading gracefully.

### The Composition Pattern

Complex operations compose multiple variants. A search-and-store operation might use the Meilisearch variant for indexing and the Ecto variant for persistence, coordinated through a [pipeline](@/glossary/pipeline.md) that treats both as interchangeable storage operations with different characteristics.

## Variant Selection Strategies

| Strategy | Mechanism | Use Case |
|----------|-----------|----------|
| **Static** | Compile-time configuration | Known environments (dev, test, prod) |
| **Context-based** | Runtime context inspection | Multi-tenant with per-tenant backends |
| **Capability-based** | Required capability matching | Feature-dependent variant selection |
| **Performance-based** | Constraint satisfaction | Latency-sensitive vs. throughput-optimized |
| **Adaptive** | Runtime metrics feedback | Self-optimizing variant selection |

## Anti-Patterns to Avoid

### Variant Explosion

Creating variants for every minor difference leads to an unmaintainable explosion of modules. Variants should represent genuinely different domains, not configuration differences. Use parameters within a variant rather than creating new variants for small behavioral changes.

### Contract Violation

Variants that silently deviate from the base contract (e.g., returning different error types, ignoring timeout parameters, changing consistency guarantees) create subtle bugs that surface only under specific conditions. The platform's [property-based testing](@/glossary/property-based-testing.md) catches these violations by testing all variants against the shared contract.

### Leaky Abstractions

When code that should work with any variant depends on implementation details of a specific variant, the abstraction leaks. This defeats the purpose of specialization. The platform enforces abstraction boundaries through strict module interfaces and [compilation](@/glossary/compilation.md) checks.

### Premature Specialization

Creating variants before understanding the domain well enough leads to poorly drawn boundaries. The platform follows a pattern of starting with a single general implementation, observing usage patterns, and extracting variants only when clear domain boundaries emerge.

## Testing Specialized Variants

Testing variants requires two complementary strategies:

1. **Contract tests**: Verify that every variant satisfies the full base contract. These tests are parameterized over all registered variants and run identically for each.

2. **Specialization tests**: Verify that each variant's domain-specific behavior works correctly. These tests are unique to each variant and exercise its specialized capabilities.

The Prismatic Platform provides `PrismaticStorage.AdapterContractTest` as a reusable contract test module that any storage variant can `use` to verify compliance.

## Performance Considerations

Variant dispatch adds a layer of indirection. In the Prismatic Platform, this overhead is minimized through:

- **Compile-time dispatch**: When the variant is known at compile time, the compiler eliminates indirection entirely
- **ETS-cached registries**: Runtime variant lookup completes in microseconds
- **Protocol consolidation**: Elixir's protocol consolidation compiles dispatch tables at build time
- **Pattern matching**: Elixir's pattern matching engine optimizes multi-clause dispatch to near-constant time

Benchmarks show variant dispatch adds less than 1 microsecond of overhead in the common case, which is negligible compared to the actual operation (storage I/O, network, computation).

## Related Concepts

- [Adapter Pattern](@/glossary/adapter-pattern.md) -- The structural pattern underlying variant implementation
- [Behaviour](@/glossary/behaviour.md) -- Elixir's mechanism for defining variant contracts
- [Protocol](@/glossary/protocol.md) -- Elixir's mechanism for type-based variant dispatch
- [Composability](@/glossary/composability.md) -- Building complex systems from variant compositions
- [Architectural Pattern](@/glossary/architectural-pattern.md) -- Higher-level patterns that leverage variants
- [Pattern Matching](@/glossary/pattern-matching.md) -- The dispatch mechanism for variant selection
- [Storage Pattern](@/glossary/storage-pattern.md) -- The most prominent variant family in the platform
- [Modularity](@/glossary/modularity.md) -- The design principle that variants enforce

See the Glossary index for the complete taxonomy of platform concepts.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
