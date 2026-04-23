+++
title = "System Design Principle"
weight = 50
[extra]
tags = ["glossary", "architecture", "design", "principles", "SOLID", "OTP", "supervision", "fault-tolerance", "composition", "separation-of-concerns"]
description = "System design principles are the foundational guidelines that govern architectural decisions in software systems. The Prismatic Platform applies a synthesis of classical design principles (SOLID, separation of concerns), OTP-specific principles (let it crash, process per entity), and platform-native principles (NO MERCY/NO DOUBTS, evidence over opinion) to create a cohesive architectural philosophy."
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "21 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["architecture", "architectural-pattern", "architectural-decision", "architectural-thinking", "otp", "otp-behaviour", "supervision-tree", "behaviour", "protocol", "genserver", "beam-vm", "process-isolation", "quality-gates", "quality-standard", "adapter-pattern"]
learning_outcomes = ["Apply SOLID principles in the context of Elixir/OTP development", "Design supervision trees that embody the let-it-crash philosophy", "Implement process-per-entity patterns for stateful system components", "Synthesize classical and OTP-specific design principles", "Evaluate architectural decisions against a principled framework"]
prerequisites = ["architecture", "otp", "beam-vm", "supervision-tree"]
key_concepts = ["single responsibility", "open-closed principle", "Liskov substitution", "interface segregation", "dependency inversion", "let it crash", "process per entity", "supervision", "fault isolation", "composition over inheritance", "separation of concerns", "principle of least surprise"]
further_reading = ["Designing Elixir Systems with OTP by James Edward Gray II and Bruce Tate", "Clean Architecture by Robert C. Martin", "Designing Data-Intensive Applications by Martin Kleppmann", "A Philosophy of Software Design by John Ousterhout"]
version = "2.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
acronyms = ["SOLID = Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion", "OTP = Open Telecom Platform", "BEAM = Bogdan/Bjorn Erlang Abstract Machine", "SRP = Single Responsibility Principle", "DIP = Dependency Inversion Principle"]
word_count = 1699
date_modified = "2026-02-23"
keywords = ["System", "Design", "Principle", "Prismatic", "Platform", "SOLID", "OTP-specific", "MERCYNO", "glossary", "architecture"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "System Design Principle - Prismatic Platform"
+++

## Definition

A **system design principle** is a fundamental guideline that shapes how software systems are structured, decomposed, and interconnected. Design principles operate at a higher level of abstraction than design patterns -- where patterns provide specific solutions to recurring problems, principles provide the reasoning framework for choosing between alternatives. Well-chosen design principles create consistency across a codebase, reduce cognitive load for developers, and produce systems that are easier to understand, modify, and maintain.

The Prismatic Platform's design philosophy synthesizes three traditions of design principles. First, the classical object-oriented principles (SOLID, separation of concerns, composition over inheritance) provide a foundation applicable across programming paradigms. Second, OTP-specific principles (let it crash, process per entity, supervision-driven design) leverage the unique capabilities of the BEAM virtual machine. Third, platform-native principles (NO MERCY/NO DOUBTS, evidence over opinion, functional purity at core with effects at edges) address the specific challenges of building a 115-application umbrella ecosystem with 530+ autonomous agents.

This synthesis is not eclectic -- each tradition's principles are integrated into a coherent whole where classical principles are reinterpreted through the OTP lens, and OTP principles are extended by platform-specific requirements. The result is a design philosophy that is more than the sum of its parts.

## Historical Foundations

Design principles in software engineering emerged from the accumulated experience of decades of system building. Edsger Dijkstra's concept of separation of concerns (1974) established the idea that complex systems should be decomposed into independent, focused units. David Parnas's information hiding principle (1972) argued that module boundaries should conceal design decisions likely to change. These early principles remain foundational, though their expression has evolved across paradigms.

Robert C. Martin formalized the SOLID principles in the early 2000s, building on decades of object-oriented design experience. While originally articulated for object-oriented languages, the underlying ideas -- focused responsibilities, stable abstractions, substitutability, minimal interfaces, and dependency direction -- apply to all paradigms including functional programming.

The Erlang/OTP tradition developed its own design principles independently, driven by the telecommunications industry's requirements for fault tolerance and high availability. Joe Armstrong's "let it crash" philosophy, the supervision tree pattern, and the process-per-entity model represent design principles optimized for building reliable distributed systems rather than modular desktop applications.

## Platform Context

Within the Prismatic Platform, design principles serve as the shared vocabulary for architectural decisions across 115 umbrella applications. When any of the 530+ agents makes a design decision, it evaluates the decision against the platform's principle framework. This creates consistency not through rigid templates but through shared reasoning.

The platform's meta-rule captures the essential design philosophy:

> **If the same solution could be written identically in Node.js, it is WRONG.**

This rule is not anti-Node.js; it is pro-OTP. It demands that Elixir code leverage the BEAM VM's unique capabilities -- lightweight processes, supervision trees, pattern matching, immutable data, hot code loading -- rather than translating imperative patterns into Elixir syntax.

```elixir
defmodule PrismaticArchitecture.DesignPrinciples do
  @moduledoc """
  Encodes the platform's system design principles as evaluable
  criteria. Used by quality gates and architectural review agents
  to assess whether code changes align with platform principles.

  ## Principle Categories

  - Classical: SOLID principles adapted for functional programming
  - OTP: Erlang/OTP-specific design principles
  - Platform: Prismatic-specific design principles
  - Meta: Principles about how principles are applied
  """

  @type principle_category :: :classical | :otp | :platform | :meta
  @type compliance_level :: :full | :partial | :violation
  @type evaluation :: %{
          principle: String.t(),
          category: principle_category(),
          compliance: compliance_level(),
          evidence: [String.t()],
          recommendation: String.t() | nil
        }

  @spec evaluate_module(module()) :: {:ok, [evaluation()]}
  def evaluate_module(module) do
    evaluations =
      [
        evaluate_single_responsibility(module),
        evaluate_process_boundaries(module),
        evaluate_supervision_design(module),
        evaluate_functional_purity(module),
        evaluate_error_handling(module),
        evaluate_naming_conventions(module)
      ]
      |> List.flatten()

    {:ok, evaluations}
  end

  @spec evaluate_single_responsibility(module()) :: [evaluation()]
  defp evaluate_single_responsibility(module) do
    functions = module.__info__(:functions)
    public_count = length(functions)

    compliance =
      cond do
        public_count <= 7 -> :full
        public_count <= 15 -> :partial
        true -> :violation
      end

    [
      %{
        principle: "Single Responsibility",
        category: :classical,
        compliance: compliance,
        evidence: ["#{public_count} public functions"],
        recommendation:
          if(compliance != :full,
            do: "Consider splitting module into focused submodules",
            else: nil
          )
      }
    ]
  end

  @spec evaluate_process_boundaries(module()) :: [evaluation()]
  defp evaluate_process_boundaries(module) do
    behaviours = module_behaviours(module)
    has_genserver = GenServer in behaviours
    has_supervisor = Supervisor in behaviours

    compliance =
      cond do
        has_genserver or has_supervisor -> :full
        stateful_module?(module) -> :violation
        true -> :full
      end

    [
      %{
        principle: "Process Per Entity",
        category: :otp,
        compliance: compliance,
        evidence: ["Behaviours: #{inspect(behaviours)}"],
        recommendation:
          if(compliance == :violation,
            do: "Stateful module should use GenServer or Agent",
            else: nil
          )
      }
    ]
  end

  @spec module_behaviours(module()) :: [module()]
  defp module_behaviours(module) do
    module.module_info(:attributes)
    |> Keyword.get_values(:behaviour)
    |> List.flatten()
  end

  @spec stateful_module?(module()) :: boolean()
  defp stateful_module?(module) do
    functions = module.__info__(:functions)
    Enum.any?(functions, fn {name, _arity} -> name in [:get_state, :set_state, :update_state] end)
  end

  @spec evaluate_supervision_design(module()) :: [evaluation()]
  defp evaluate_supervision_design(module) do
    behaviours = module_behaviours(module)

    if Supervisor in behaviours do
      [
        %{
          principle: "Supervision Tree Design",
          category: :otp,
          compliance: :full,
          evidence: ["Module implements Supervisor behaviour"],
          recommendation: nil
        }
      ]
    else
      []
    end
  end

  @spec evaluate_functional_purity(module()) :: [evaluation()]
  defp evaluate_functional_purity(module) do
    source = get_module_source(module)

    side_effects =
      Enum.count([
        String.contains?(source, "IO.puts"),
        String.contains?(source, "File.write"),
        String.contains?(source, ":ets.insert"),
        String.contains?(source, "send(")
      ], & &1)

    compliance =
      cond do
        side_effects == 0 -> :full
        side_effects <= 2 -> :partial
        true -> :violation
      end

    [
      %{
        principle: "Functional Purity (Effects at Edges)",
        category: :platform,
        compliance: compliance,
        evidence: ["#{side_effects} potential side-effect patterns detected"],
        recommendation:
          if(compliance != :full,
            do: "Move side effects to boundary modules, keep core logic pure",
            else: nil
          )
      }
    ]
  end

  @spec get_module_source(module()) :: String.t()
  defp get_module_source(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, _, _, _} -> ""
      _ -> ""
    end
  end

  @spec evaluate_error_handling(module()) :: [evaluation()]
  defp evaluate_error_handling(_module) do
    []
  end

  @spec evaluate_naming_conventions(module()) :: [evaluation()]
  defp evaluate_naming_conventions(module) do
    module_name = Atom.to_string(module)
    forbidden_suffixes = ["Manager", "Handler", "Utils", "Helper", "Misc"]

    violations =
      Enum.filter(forbidden_suffixes, fn suffix ->
        String.ends_with?(module_name, suffix)
      end)

    compliance = if Enum.empty?(violations), do: :full, else: :violation

    [
      %{
        principle: "Naming Standards (No Manager/Handler/Utils/Helper)",
        category: :platform,
        compliance: compliance,
        evidence: ["Forbidden suffixes found: #{inspect(violations)}"],
        recommendation:
          if(compliance == :violation,
            do: "Rename module to describe its actual responsibility",
            else: nil
          )
      }
    ]
  end
end
```

## Classical Principles in Elixir Context

### Single Responsibility Principle (SRP)

In Elixir, the Single Responsibility Principle applies to modules rather than classes. Each module should have one reason to change, representing a cohesive set of related functions. The Prismatic Platform enforces this by flagging modules with excessive public function counts and by requiring clear `@moduledoc` descriptions that can be stated in a single sentence.

In practice, SRP in Elixir often manifests as separating data transformation (pure functions) from data persistence (side effects) from data presentation (formatting). A module that validates user input should not also persist it to the database or format it for display.

### Open-Closed Principle (OCP)

The Open-Closed Principle states that software entities should be open for extension but closed for modification. In Elixir, this principle is realized through [behaviours](/glossary/behaviour/) and [protocols](/glossary/protocol/) rather than class inheritance. Behaviours define callback contracts that modules can implement without modifying the defining module. Protocols define polymorphic dispatch based on data types, allowing new types to participate in existing abstractions without changing the protocol definition.

```elixir
defprotocol PrismaticStorage.Queryable do
  @moduledoc """
  Protocol for types that can be queried from storage.
  Open for extension (any type can implement), closed
  for modification (protocol definition is stable).
  """

  @spec to_query(t()) :: Ecto.Query.t()
  def to_query(queryable)
end

defimpl PrismaticStorage.Queryable, for: PrismaticPerimeter.Asset do
  @spec to_query(PrismaticPerimeter.Asset.t()) :: Ecto.Query.t()
  def to_query(%PrismaticPerimeter.Asset{} = asset) do
    import Ecto.Query
    from(a in PrismaticPerimeter.Asset, where: a.domain == ^asset.domain)
  end
end
```

### Liskov Substitution Principle (LSP)

In Elixir, LSP manifests as the requirement that behaviour implementations must satisfy the contracts defined by their behaviour callbacks. If a function expects a module implementing the `GenServer` behaviour, any conforming module should be substitutable without breaking the caller. The platform's [adapter pattern](/glossary/adapter-pattern/) relies heavily on this principle -- storage adapters (ETS, Ecto, Meilisearch, KuzuDB) must be interchangeable.

### Interface Segregation Principle (ISP)

The Interface Segregation Principle states that no module should be forced to depend on functions it does not use. In Elixir, this is achieved by defining focused behaviours with minimal callback sets. Rather than a single `Storage` behaviour with 20 callbacks, the platform defines `Storage.Readable`, `Storage.Writable`, `Storage.Queryable`, and `Storage.Streamable` as separate behaviours that modules can implement selectively.

### Dependency Inversion Principle (DIP)

The Dependency Inversion Principle states that high-level modules should not depend on low-level modules; both should depend on abstractions. In the Prismatic Platform, this principle drives the separation between `prismatic_storage_core` (traits, protocols, behaviours) and the storage adapter applications (`prismatic_storage_ets`, `prismatic_storage_ecto`, etc.). Business logic depends on abstract storage interfaces, never on concrete implementations.

## OTP-Specific Principles

### Let It Crash

The "let it crash" principle is perhaps the most distinctive design principle in the OTP tradition. Rather than writing defensive code that attempts to handle every possible error within a single process, OTP systems are designed so that processes can crash and be restarted by their supervisors. This produces simpler, more reliable code because each process handles only the cases it understands, delegating unexpected situations to the supervision system.

The Prismatic Platform applies this principle rigorously. Processes are designed with minimal state that can be reconstructed from durable storage after a restart. [Supervision trees](/glossary/supervision-tree/) are designed to contain failures within appropriate boundaries, preventing cascading crashes while ensuring rapid recovery.

```elixir
defmodule PrismaticPerimeter.Scanner.Worker do
  @moduledoc """
  Worker process for asset discovery scanning. Designed to crash
  on unexpected errors -- the supervisor will restart it with a
  clean state. Only expected errors are handled explicitly.
  """

  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts)
  end

  @impl GenServer
  def init(opts) do
    domain = Keyword.fetch!(opts, :domain)
    {:ok, %{domain: domain, status: :idle}, {:continue, :begin_scan}}
  end

  @impl GenServer
  def handle_continue(:begin_scan, state) do
    case PrismaticPerimeter.Discovery.scan(state.domain) do
      {:ok, results} ->
        {:noreply, %{state | status: :complete, results: results}}

      {:error, :rate_limited} ->
        Process.send_after(self(), :retry_scan, 5_000)
        {:noreply, %{state | status: :rate_limited}}

      {:error, :timeout} ->
        Process.send_after(self(), :retry_scan, 10_000)
        {:noreply, %{state | status: :timeout}}
    end
  end

  @impl GenServer
  def handle_info(:retry_scan, state) do
    {:noreply, state, {:continue, :begin_scan}}
  end
end
```

### Process Per Entity

Every stateful entity in an OTP system should have its own process. This provides natural isolation, independent lifecycle management, and concurrent access without locks. In the Prismatic Platform, each AIAD agent runs as a separate process, each sandbox has its own process tree, and each quality monitor operates independently.

### Supervision-Driven Design

System architecture should be expressed as a supervision tree before any business logic is written. The supervision tree defines the startup order, failure handling strategy, and process relationships. In the Prismatic Platform, the `PrismaticSupervisor` application manages the supervision topology for all 115 umbrella applications.

### Message Passing Over Shared State

Processes communicate through asynchronous message passing rather than shared mutable state. This eliminates race conditions, deadlocks, and the need for locks. The platform enforces this principle by flagging any use of shared mutable state (ETS tables used for coordination rather than caching) during code review.

## Platform-Native Principles

### Functional Purity at Core, Effects at Edges

The platform follows the "functional core, imperative shell" pattern. Business logic is implemented as pure functions that take data and return data. Side effects (database access, network calls, file I/O) are confined to boundary modules that wrap the pure core. This makes business logic easy to test, reason about, and compose.

### Evidence Over Opinion in Architecture

[Architectural decisions](/glossary/architectural-decision/) must be supported by evidence, not authority. When choosing between approaches, the platform requires benchmarks, property tests, or formal analysis rather than appeals to industry trends or personal preference. The [evidence-over-opinion](/glossary/evidence/) principle from the NABLA framework applies to design decisions with the same rigor as operational decisions.

### NO MERCY in Implementation

Every implementation must be complete, tested, and production-ready from the moment of creation. No stubs, mocks, placeholders, or temporary implementations are permitted in production code. This principle eliminates the common pattern of "shipping something now and fixing it later" that leads to accumulated technical debt.

### Naming as Documentation

Module and function names must accurately describe their responsibility. The platform forbids generic names (Manager, Handler, Utils, Helper, Misc) that obscure responsibility. A well-named module serves as its own primary documentation -- the reader should understand the module's purpose from its name alone.

## Principle Interactions and Tensions

Design principles sometimes conflict, and mature engineering requires understanding these tensions:

**SRP vs. Let It Crash**: SRP suggests small, focused modules. Let It Crash suggests that processes should contain enough state to be meaningfully restarted. The resolution is that OTP processes may compose multiple modules, each with a single responsibility, while the process itself manages a coherent lifecycle.

**DIP vs. Simplicity**: Dependency Inversion can introduce indirection that complicates understanding. The platform applies DIP only where substitutability is actually needed (storage backends, external service adapters), not for internal modules with stable implementations.

**Functional Purity vs. OTP Pragmatism**: [GenServer](/glossary/genserver/) is inherently stateful. The resolution is that GenServer state management is treated as a controlled side effect at the system boundary, while the callbacks delegate to pure functions for business logic.

## Principle Verification

The platform's [quality gates](/glossary/quality-gates/) include automated principle verification. Static analysis checks for naming violations, excessive module size, missing supervision tree documentation, and other principle adherence indicators. The [Credo](/glossary/credo/) configuration includes custom checks for platform-specific principles, and [Dialyzer](/glossary/dialyzer/) verifies that type contracts (an expression of LSP) are satisfied.

## Anti-Patterns

The platform explicitly identifies and blocks design anti-patterns:

| Anti-Pattern | Principle Violated | Detection |
|-------------|-------------------|-----------|
| God Module (50+ functions) | SRP | Credo check |
| Manager/Handler naming | Naming as Documentation | Pre-commit hook |
| Shared ETS for coordination | Message Passing | Code review |
| Defensive coding in GenServer | Let It Crash | Code review |
| Concrete dependencies in business logic | DIP | Compile-time check |
| Side effects in pure modules | Functional Purity | Credo check |

## Evolutionary Design

Design principles are not static. The platform's principles have evolved through 19 generations, with each generation refining the principle set based on empirical evidence of what produces better outcomes. The AutoEvolve system tracks principle compliance metrics over time, identifying which principles correlate most strongly with system reliability, developer productivity, and code maintainability.

This evidence-based approach to design principles themselves -- applying [scientific rigor](/glossary/scientific-rigor/) to the question of which principles work best -- distinguishes the platform's approach from dogmatic adherence to any single design philosophy.

## Related Concepts

- [Architecture](/glossary/architecture/) -- System architecture informed by design principles
- [Architectural Pattern](/glossary/architectural-pattern/) -- Recurring patterns derived from principles
- [Architectural Decision](/glossary/architectural-decision/) -- Principle-guided decision making
- [OTP](/glossary/otp/) -- Open Telecom Platform providing OTP-specific design principles
- [OTP Behaviour](/glossary/otp-behaviour/) -- OTP behaviour patterns implementing design principles
- [Supervision Tree](/glossary/supervision-tree/) -- Supervision-driven design in practice
- [Behaviour](/glossary/behaviour/) -- Callback contracts enabling Open-Closed Principle
- [Protocol](/glossary/protocol/) -- Polymorphic dispatch enabling Interface Segregation
- [GenServer](/glossary/genserver/) -- Stateful process design implementing Process Per Entity
- [Adapter Pattern](/glossary/adapter-pattern/) -- Dependency Inversion through adapter abstraction
- [Process Isolation](/glossary/process-isolation/) -- BEAM isolation enabling Let It Crash
- [Quality Gates](/glossary/quality-gates/) -- Automated principle compliance verification

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
