+++
title = "Concepts"
weight = 50
[extra]
tags = ["glossary", "core", "fundamentals", "mental-models", "abstractions", "engineering-principles"]
description = "Concepts are the fundamental mental models, abstractions, and theoretical constructs that form the intellectual foundation of software engineering, providing the vocabulary and reasoning frameworks through which engineers understand, communicate about, and design software systems."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Software Engineering Foundations"
related_concepts = ["abstractions", "mental models", "design principles", "architectural patterns", "type systems", "concurrency models", "programming paradigms", "engineering trade-offs"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = "intermediate"
prerequisites = ["architecture", "software-architecture", "building-software"]
learning_path = ["concepts", "architectural-pattern", "system-design-principle", "architecture", "complex-system-designs"]
interactive_demos = ["/labs", "/architecture"]
code_examples = true
external_resources = ["https://hexdocs.pm/elixir/introduction.html", "https://pragprog.com/titles/jgotp/designing-elixir-systems-with-otp/", "https://en.wikipedia.org/wiki/Abstraction_(computer_science)"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["concept validation", "abstraction leakage testing", "interface contract verification", "paradigm consistency checks", "mental model alignment"]
keywords = ["concepts", "abstractions", "mental models", "design principles", "programming paradigms", "engineering fundamentals", "software theory", "computational thinking"]
related_terms = ["architecture", "conceptual-framework", "architectural-pattern", "system-design-principle", "composability", "protocol", "behaviour", "abstraction", "determinism", "pure-function"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
acronym = ""
importance = "critical"
word_count = 1568
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Concepts - Prismatic Platform"
+++

## Definition

Concepts, in the context of software engineering, are the fundamental mental models, abstractions, and theoretical constructs that engineers use to understand, reason about, communicate, and design software systems. They exist at a level of abstraction above specific implementations, languages, or frameworks, providing the intellectual scaffolding that makes complex system design possible.

A concept is not code. It is the idea that code embodies. The concept of "process isolation" exists independently of its implementation in the BEAM VM, Kubernetes containers, or Unix processes. The concept of "eventual consistency" exists independently of any specific database or replication protocol. Understanding concepts at this abstract level enables engineers to transfer knowledge across technologies, evaluate trade-offs between approaches, and design novel solutions to new problems.

## Overview

Software engineering is a discipline built on concepts. Every line of code, every architectural decision, every operational procedure embodies one or more concepts -- sometimes explicitly, often implicitly. The quality of a software system depends not only on the correctness of its code but on the soundness of the concepts that inform its design.

### The Role of Concepts in Engineering

Concepts serve several essential functions in software engineering:

**Communication**: Concepts provide a shared vocabulary that enables precise technical discussion. When engineers discuss "idempotency," "referential transparency," or "back-pressure," they are invoking rich conceptual frameworks that compress complex ideas into single terms.

**Reasoning**: Concepts enable deductive reasoning about system behavior. If a function is pure (no side effects, deterministic output), then it is safe to memoize, parallelize, and test in isolation. This reasoning follows from the concept, not from reading the function's implementation.

**Transfer**: Concepts transfer across technologies. An engineer who understands the concept of supervision trees can apply that understanding whether working in Erlang, Elixir, Akka, or designing a custom process management system.

**Design**: Concepts guide design decisions. The concept of "separation of concerns" informs module boundaries. The concept of "fail-fast" informs error handling strategy. The concept of "least privilege" informs security architecture.

**Evaluation**: Concepts provide evaluation criteria. When assessing a proposed architecture, engineers apply conceptual lenses such as coupling, cohesion, scalability, and fault tolerance to evaluate the design's strengths and weaknesses.

### Concept Categories

Software engineering concepts can be organized into several categories:

**Computational concepts**: Algorithms, data structures, complexity classes, computability, type systems, formal languages.

**Architectural concepts**: Modularity, encapsulation, cohesion, coupling, layering, separation of concerns, dependency inversion.

**Concurrency concepts**: Processes, threads, synchronization, message passing, shared memory, deadlock, livelock, starvation.

**Distributed systems concepts**: Consistency, availability, partition tolerance, consensus, replication, sharding, eventual consistency.

**Quality concepts**: Correctness, reliability, performance, maintainability, testability, observability, security.

**Operational concepts**: Deployment, monitoring, incident response, capacity planning, disaster recovery.

**Epistemic concepts**: Confidence, evidence, contradiction, signal plurality, provenance, time decay -- concepts about how systems form and validate beliefs.

## Technical Details

### Concepts as Types

In strongly-typed languages, concepts often manifest as types. The type system provides a formal mechanism for expressing and enforcing conceptual constraints:

```elixir
defmodule Prismatic.Concepts.TypeManifestations do
  @moduledoc """
  Demonstrates how software engineering concepts manifest
  as type definitions, protocols, and behaviours in Elixir.
  """

  # Concept: Result type (success or failure)
  # Every operation that can fail returns an explicit result
  @type result(success, failure) :: {:ok, success} | {:error, failure}

  # Concept: Non-empty collection (at least one element)
  @type non_empty_list(element) :: [element, ...]

  # Concept: Bounded value (within a known range)
  @type confidence :: float()  # Constrained to 0.0..1.0 by convention

  # Concept: Entity with identity
  @type entity(id_type, data_type) :: %{
    id: id_type,
    data: data_type,
    created_at: DateTime.t(),
    updated_at: DateTime.t()
  }

  # Concept: Command (intention to change state)
  @type command :: %{
    type: atom(),
    payload: map(),
    issued_by: String.t(),
    issued_at: DateTime.t(),
    idempotency_key: String.t()
  }

  # Concept: Event (record of state change)
  @type event :: %{
    type: atom(),
    payload: map(),
    source: String.t(),
    occurred_at: DateTime.t(),
    sequence_number: pos_integer()
  }
end
```

### Concepts as Behaviours

Elixir behaviours capture concepts as contracts that modules must implement:

```elixir
defmodule Prismatic.Concepts.StorageAdapter do
  @moduledoc """
  The Storage Adapter concept: any system that can persistently
  store and retrieve data must implement these operations.
  This behaviour captures the concept independently of the
  storage technology.
  """

  @type key :: term()
  @type value :: term()
  @type error :: atom() | {atom(), term()}

  @callback init(config :: keyword()) :: {:ok, state :: term()} | {:error, error()}
  @callback get(state :: term(), key()) :: {:ok, value()} | {:error, :not_found | error()}
  @callback put(state :: term(), key(), value()) :: {:ok, state :: term()} | {:error, error()}
  @callback delete(state :: term(), key()) :: {:ok, state :: term()} | {:error, error()}
  @callback list(state :: term(), opts :: keyword()) :: {:ok, [value()]} | {:error, error()}
end
```

### Concepts as Protocols

Protocols capture the concept of polymorphic behavior -- the same operation expressed differently for different data types:

```elixir
defprotocol Prismatic.Concepts.Inspectable do
  @moduledoc """
  The Inspectable concept: any entity that can describe
  itself in a human-readable format for debugging and
  observability purposes.
  """

  @doc "Returns a human-readable description of the entity"
  @spec describe(t()) :: String.t()
  def describe(entity)

  @doc "Returns a structured summary suitable for logging"
  @spec summarize(t()) :: map()
  def summarize(entity)
end

defprotocol Prismatic.Concepts.Measurable do
  @moduledoc """
  The Measurable concept: any entity that can report
  quantitative metrics about its current state.
  """

  @doc "Returns current metrics as a keyword list"
  @spec metrics(t()) :: keyword()
  def metrics(entity)

  @doc "Returns the entity's health status"
  @spec health(t()) :: :healthy | :degraded | :unhealthy
  def health(entity)
end
```

### Concept Composition

One of the most powerful aspects of concepts is their composability -- simple concepts combine to form more complex ones:

```elixir
defmodule Prismatic.Concepts.Composition do
  @moduledoc """
  Demonstrates concept composition: combining simple concepts
  to form more complex, higher-order concepts.
  """

  # Concept: Pipeline (sequential composition of transformations)
  @spec pipeline(input :: term(), transformations :: [(term() -> term())]) :: term()
  def pipeline(input, transformations) do
    Enum.reduce(transformations, input, fn transform, acc ->
      transform.(acc)
    end)
  end

  # Concept: Retry with backoff (combining failure handling with timing)
  @spec with_retry((() -> {:ok, term()} | {:error, term()}), keyword()) ::
          {:ok, term()} | {:error, term()}
  def with_retry(operation, opts \\ []) do
    max_attempts = Keyword.get(opts, :max_attempts, 3)
    base_delay_ms = Keyword.get(opts, :base_delay_ms, 100)
    attempt_with_backoff(operation, 1, max_attempts, base_delay_ms)
  end

  defp attempt_with_backoff(operation, attempt, max_attempts, base_delay_ms) do
    case operation.() do
      {:ok, result} ->
        {:ok, result}

      {:error, _reason} when attempt < max_attempts ->
        delay = base_delay_ms * :math.pow(2, attempt - 1) |> round()
        Process.sleep(delay)
        attempt_with_backoff(operation, attempt + 1, max_attempts, base_delay_ms)

      {:error, reason} ->
        {:error, reason}
    end
  end

  # Concept: Circuit breaker (combining failure counting with state machine)
  @type circuit_state :: :closed | :open | :half_open

  @spec circuit_transition(circuit_state(), :success | :failure, non_neg_integer()) ::
          circuit_state()
  def circuit_transition(:closed, :failure, failure_count) when failure_count >= 5, do: :open
  def circuit_transition(:closed, _result, _count), do: :closed
  def circuit_transition(:open, _result, _count), do: :half_open
  def circuit_transition(:half_open, :success, _count), do: :closed
  def circuit_transition(:half_open, :failure, _count), do: :open
end
```

### Concept Hierarchies

Concepts exist in hierarchies -- abstract concepts decompose into more specific ones:

```
Fault Tolerance (abstract concept)
  |-- Process Isolation (mechanism concept)
  |     |-- BEAM processes (implementation)
  |     |-- OS processes (implementation)
  |     |-- Containers (implementation)
  |
  |-- Supervision (strategy concept)
  |     |-- one_for_one (specific strategy)
  |     |-- one_for_all (specific strategy)
  |     |-- rest_for_one (specific strategy)
  |
  |-- Circuit Breaking (pattern concept)
  |     |-- Failure counting (mechanism)
  |     |-- State machine (structure)
  |     |-- Recovery probing (strategy)
  |
  |-- Graceful Degradation (strategy concept)
        |-- Feature flags (mechanism)
        |-- Fallback responses (mechanism)
        |-- Load shedding (mechanism)
```

### Concept Orthogonality

A powerful design principle is concept orthogonality -- ensuring that different concepts can vary independently without affecting each other. In the Prismatic Platform, storage backend, agent behavior, and quality enforcement are orthogonal concepts:

```elixir
defmodule Prismatic.Concepts.Orthogonality do
  @moduledoc """
  Demonstrates concept orthogonality: independent concepts
  that can be composed without interference.
  """

  # Storage concept (independent of what is stored)
  @type storage_backend :: :ets | :ecto | :meilisearch | :kuzu

  # Agent concept (independent of how state is stored)
  @type agent_behavior :: :reactive | :proactive | :autonomous

  # Quality concept (independent of agent behavior or storage)
  @type quality_level :: :standard | :strict | :zero_tolerance

  # These three concepts compose orthogonally:
  # Any storage_backend x agent_behavior x quality_level is valid
  @spec configure(storage_backend(), agent_behavior(), quality_level()) :: map()
  def configure(backend, behavior, quality) do
    %{
      storage: configure_storage(backend),
      agent: configure_behavior(behavior),
      quality: configure_quality(quality)
    }
  end

  defp configure_storage(:ets), do: %{adapter: PrismaticStorageEts, opts: [read_concurrency: true]}
  defp configure_storage(:ecto), do: %{adapter: PrismaticStorageEcto, opts: [pool_size: 10]}
  defp configure_storage(:meilisearch), do: %{adapter: PrismaticStorageMeilisearch, opts: []}
  defp configure_storage(:kuzu), do: %{adapter: PrismaticStorageKuzu, opts: []}

  defp configure_behavior(:reactive), do: %{mode: :event_driven, polling: false}
  defp configure_behavior(:proactive), do: %{mode: :scheduled, polling: true}
  defp configure_behavior(:autonomous), do: %{mode: :self_directed, polling: true}

  defp configure_quality(:standard), do: %{checks: [:compilation, :tests]}
  defp configure_quality(:strict), do: %{checks: [:compilation, :tests, :credo, :dialyzer]}
  defp configure_quality(:zero_tolerance), do: %{checks: [:all], warnings_as_errors: true}
end
```

## Implementation in Prismatic Platform

The Prismatic Platform embodies concepts at every level of its architecture:

### AIAD Concept Framework

The AIAD (AI Agent Definition) standard provides a structured way to define and compose concepts through agents, commands, policies, and pipelines. Each AIAD component represents a concept (or concept composition) that the platform understands and can operate on.

### Behaviour-Driven Architecture

The platform uses Elixir behaviours extensively to capture concepts as contracts. The `PrismaticStorage.AdapterContractTest` provides a concrete example: it captures the concept of "storage adapter" as a set of testable properties that any storage implementation must satisfy.

### Protocol-Based Polymorphism

Core platform concepts like serialization, inspection, and measurement are expressed as protocols, allowing each subsystem to implement these concepts in its own way while maintaining a consistent interface.

### Quality Concepts

The platform's quality system embodies concepts like "zero tolerance" (no violations accepted), "regression prevention" (changes must not break existing behavior), and "comprehensive verification" (multiple verification techniques applied in layers).

### NABLA Infinity

The NABLA Infinity epistemic framework captures meta-concepts about knowledge itself: signal plurality (multiple evidence sources required), contradiction preservation (conflicting evidence is informative), provenance mandatory (all beliefs must be traceable). These are concepts about how to handle concepts.

### Concept Inventory

The Prismatic Platform maintains an explicit inventory of the concepts it embodies:

| Domain | Core Concepts | Implementation Mechanism |
|--------|--------------|--------------------------|
| **Concurrency** | Process isolation, message passing, supervision | BEAM processes, GenServer, Supervisor |
| **Storage** | Adapter pattern, polymorphic backends | Behaviours, protocols, contract tests |
| **Quality** | Zero regression, comprehensive verification | 13 quality domains, pre-commit pipeline |
| **Epistemic** | Signal plurality, contradiction preservation | NABLA axioms, Trinity Gate |
| **Security** | Adversarial verification, defense in depth | Color Teams, RBAC, EASM |
| **Evolution** | Generational progress, fitness scoring | AutoEvolve, generation tracking |
| **Governance** | Chain of command, authority tiers | AIAD tiers L1-L5, escalation protocols |

## Comparison with Alternatives

| Approach to Concept Management | Strengths | Limitations | Prismatic Position |
|-------------------------------|-----------|-------------|-------------------|
| **Informal documentation** | Accessible, flexible | Ambiguous, not enforceable | Supplementary |
| **Design patterns catalog** | Well-known, communicable | Static, language-specific | Used selectively |
| **Type systems** | Compiler-enforced, precise | Cannot express all concepts | Core mechanism |
| **Behaviours/interfaces** | Contract-based, testable | Structural only | Primary pattern |
| **Domain-driven design** | Business-aligned | Heavyweight process | Applied to bounded contexts |
| **Formal specification** | Mathematically precise | High cost, steep learning curve | Applied to critical invariants |

## Best Practices

1. **Name concepts explicitly**: When a concept influences your design, name it. Named concepts are communicable; unnamed concepts are invisible assumptions.

2. **Express concepts in the type system**: Wherever possible, encode conceptual constraints as types, behaviours, or protocols so the compiler enforces them.

3. **Document concept rationale**: Code comments should explain which concepts inform the design and why those concepts were chosen over alternatives.

4. **Test concept boundaries**: Write tests that verify conceptual invariants, not just implementation details. If the concept says "this function is pure," test that it has no side effects.

5. **Maintain a shared vocabulary**: A project glossary (like this one) ensures that all team members use the same terms for the same concepts.

6. **Compose concepts, do not duplicate**: When you need a new concept, first check whether it can be composed from existing concepts. Composition is more maintainable than independent invention.

7. **Evolve concepts deliberately**: When a concept needs to change, make the change explicit -- update documentation, rename types, migrate implementations.

8. **Learn concepts broadly**: Study concepts from multiple paradigms (functional, object-oriented, logic, concurrent). Each paradigm provides unique conceptual tools.

## Common Pitfalls

1. **Concept drift**: Using the same term for different concepts in different parts of the codebase. This creates confusion and integration bugs.

2. **Premature abstraction**: Creating abstract concepts before understanding the concrete cases they should cover. Abstractions should be extracted from experience, not invented speculatively.

3. **Concept overload**: Applying too many concepts simultaneously, creating cognitive overhead that makes the system harder to understand than the problem it solves.

4. **Ignoring concept tension**: Some concepts conflict (e.g., strong consistency vs. availability). Ignoring the tension leads to systems that poorly implement both.

5. **Implementation bias**: Conflating a concept with its most familiar implementation. The concept of "message passing" is not the same as "using RabbitMQ."

6. **Concept silos**: Different team members having fundamentally different conceptual models of the same system, leading to incompatible design decisions.

7. **Missing concepts**: Not having a concept for an important aspect of the system, forcing ad-hoc reasoning every time that aspect is relevant.

## Use Cases

- **Architecture design** where concepts like separation of concerns, dependency inversion, and bounded contexts guide module structure and communication patterns.
- **Technology evaluation** where understanding the underlying concepts of different technologies enables principled comparison and selection.
- **Team onboarding** where a well-defined concept vocabulary accelerates new team members' understanding of system design decisions.
- **Code review** where reviewers assess whether implementations correctly embody the intended concepts.
- **Refactoring** where concept clarity guides restructuring toward better conceptual alignment without changing external behavior.
- **Cross-platform development** where concepts transfer between implementations in different languages or frameworks.
- **System evolution** where understanding which concepts are fundamental versus incidental guides decisions about what to preserve and what to replace during major architectural changes.

## Related Concepts

Concepts connect to many foundational elements in the Prismatic Platform:

- [Architecture](@/glossary/architecture.md) -- the discipline of organizing concepts into coherent system structures
- [Conceptual Framework](@/glossary/conceptual-framework.md) -- a structured collection of related concepts that supports reasoning about a domain
- [Architectural Pattern](@/glossary/architectural-pattern.md) -- reusable solutions to recurring design problems, expressed as concept compositions
- [System Design Principle](@/glossary/system-design-principle.md) -- guidelines derived from concepts that direct design decisions
- [Composability](@/glossary/composability.md) -- the concept of building complex systems from simpler, combinable parts
- [Protocol](@/glossary/protocol.md) -- Elixir mechanism for expressing polymorphic concepts across types
- [Behaviour](@/glossary/behaviour.md) -- Elixir mechanism for expressing module-level conceptual contracts
- [Determinism](@/glossary/determinism.md) -- the concept that identical inputs always produce identical outputs
- [Pure Function](@/glossary/pure-function.md) -- a function embodying the concepts of determinism and side-effect freedom
- [Comprehension](@/glossary/comprehension.md) -- the cognitive process of understanding and internalizing concepts
- **Abstraction** -- the process of extracting common features from specific instances to form a concept

## See Also

- Glossary Index -- complete listing of all platform terminology
- [Software Architecture](@/glossary/software-architecture.md) -- the structural realization of architectural concepts
- [Doctrine](@/glossary/doctrine.md) -- the platform's operational concepts codified as non-negotiable principles
- [AIAD](@/glossary/aiad.md) -- the agent standard that operationalizes platform concepts as executable definitions

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
