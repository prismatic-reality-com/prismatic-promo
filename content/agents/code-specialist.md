+++
title = "code-specialist"
weight = 87
[extra]
domain = "development"
level = "L3"
description = "Intelligent code generation with multi-phase requirement refinement, automated quality assurance, and genetic quality patterns"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1700
quality_score = 92
keywords = ["code generation", "OTP patterns", "GenServer", "requirement refinement", "genetic quality patterns", "test generation"]
tags = ["prismatic", "agent", "code-generation", "development-domain", "elixir"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "code-specialist - Prismatic Platform"
+++

## Overview

The Code Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Development domain of the Prismatic Platform. This agent provides intelligent code generation with multi-phase requirement refinement, producing production-ready [Elixir](@/glossary/elixir.md) code that follows [OTP](@/glossary/otp.md) conventions, functional programming best practices, and the platform's established quality patterns. Every generated code artifact includes comprehensive typespecs, proper error handling with `{:ok, _}` / `{:error, _}` tuples, and accompanying test suites.

Code generation in the Prismatic ecosystem is not template-based copy-paste. The Code Specialist implements a multi-phase refinement process: first analyzing the requirement to identify the appropriate OTP pattern ([GenServer](@/glossary/genserver.md), [Supervisor](@/glossary/supervisor.md), Task, Agent), then generating the implementation with proper [supervision tree](@/glossary/supervision-tree.md) integration, then producing property-based tests that verify behavioral correctness, and finally validating the output against [quality gates](@/glossary/quality-gates.md) including [Credo](@/glossary/credo.md), [Dialyzer](@/glossary/dialyzer.md), and compilation with warnings-as-errors. The generated code is indistinguishable from hand-written expert Elixir.

## Operational Domain

The Development domain covers all code creation, modification, and maintenance activities within the Prismatic Platform. The Code Specialist serves as the primary code generation engine, working alongside the database specialist for schema-related code and the documentation specialist for inline documentation. This agent ensures that all generated code meets the platform's meta-rule: it could not be written identically in Node.js.

## Multi-Phase Requirement Refinement

The Code Specialist employs a four-phase refinement pipeline that transforms ambiguous requirements into precise, testable specifications before generating any code.

| Phase | Input | Output | Validation |
|---|---|---|---|
| 1. Requirement Analysis | Natural language description | Structured requirement specification | Completeness check |
| 2. Pattern Selection | Requirement specification | OTP pattern and architecture decision | Pattern fitness evaluation |
| 3. Code Generation | Pattern + specification | Implementation with typespecs and docs | Compilation + Credo + Dialyzer |
| 4. Test Generation | Implementation + specification | Unit, integration, and property tests | Coverage verification |

```elixir
defmodule PrismaticAgents.CodeSpecialist do
  use GenServer

  @phases [:analyze, :select_pattern, :generate, :test, :validate]

  def generate(requirement, opts \\ []) do
    GenServer.call(__MODULE__, {:generate, requirement, opts}, :timer.minutes(5))
  end

  @impl true
  def handle_call({:generate, requirement, opts}, _from, state) do
    with {:ok, spec} <- analyze_requirement(requirement),
         {:ok, pattern} <- select_otp_pattern(spec),
         {:ok, code} <- generate_implementation(spec, pattern),
         {:ok, tests} <- generate_tests(spec, code),
         {:ok, validated} <- validate_output(code, tests) do
      {:reply, {:ok, validated}, update_generation_log(state, validated)}
    else
      {:error, phase, reason} ->
        {:reply, {:error, %{phase: phase, reason: reason}}, state}
    end
  end

  defp select_otp_pattern(spec) do
    cond do
      spec.requires_state and spec.requires_concurrency ->
        {:ok, :genserver}
      spec.requires_supervision ->
        {:ok, :supervisor}
      spec.requires_async ->
        {:ok, :task}
      spec.requires_temporary_state ->
        {:ok, :agent}
      true ->
        {:ok, :module}
    end
  end
end
```

## Genetic Quality Pattern Application

The Code Specialist applies genetically evolved quality patterns to all generated code. These patterns represent the accumulated optimization knowledge of the platform, extracted from thousands of successful code changes and refined through evolutionary selection.

### CASCADE Pattern Coverage

| CASCADE Pattern | Detection | Auto-Fix | Prevention |
|---|---|---|---|
| Type Mismatch | Dialyzer integration | Typespec correction | Spec-first generation |
| Dead Code | Compilation analysis | Removal with verification | Minimal generation principle |
| Empty Check | AST pattern matching | Guard clause insertion | Default clause generation |
| Timer Replacement | Process.sleep detection | GenServer timer substitution | OTP-native timing |
| Nuclear Cache | Stale cache detection | Cache invalidation insertion | TTL-aware caching |

## Code Generation Standards

All code produced by the Code Specialist adheres to strict standards that ensure production-readiness from the moment of creation.

```elixir
# Example: Generated GenServer with full quality compliance
defmodule PrismaticExample.MetricsCollector do
  @moduledoc """
  Collects and aggregates platform metrics from telemetry events.
  Implements periodic flush to persistent storage.
  """

  use GenServer

  require Logger

  @type metric :: %{
    name: String.t(),
    value: number(),
    tags: map(),
    timestamp: DateTime.t()
  }

  @flush_interval_ms :timer.seconds(30)
  @max_buffer_size 10_000

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.get(opts, :name, __MODULE__)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec record(String.t(), number(), map()) :: :ok
  def record(name, value, tags \\ %{}) do
    GenServer.cast(__MODULE__, {:record, name, value, tags})
  end

  @impl true
  def init(opts) do
    schedule_flush()
    {:ok, %{buffer: [], storage: Keyword.fetch!(opts, :storage)}}
  end

  @impl true
  def handle_cast({:record, name, value, tags}, state) do
    metric = %{name: name, value: value, tags: tags, timestamp: DateTime.utc_now()}
    new_buffer = [metric | state.buffer]

    if length(new_buffer) >= @max_buffer_size do
      flush_buffer(new_buffer, state.storage)
      {:noreply, %{state | buffer: []}}
    else
      {:noreply, %{state | buffer: new_buffer}}
    end
  end

  @impl true
  def handle_info(:flush, state) do
    flush_buffer(state.buffer, state.storage)
    schedule_flush()
    {:noreply, %{state | buffer: []}}
  end

  defp schedule_flush, do: Process.send_after(self(), :flush, @flush_interval_ms)

  defp flush_buffer([], _storage), do: :ok
  defp flush_buffer(buffer, storage), do: storage.write_batch(buffer)
end
```

## Key Capabilities

- **OTP-native code generation** producing GenServers, Supervisors, and process architectures that leverage [BEAM](@/glossary/beam.md) concurrency primitives, proper supervision strategies, and fault-tolerant design patterns
- **Multi-phase requirement refinement** that clarifies ambiguous requirements through structured analysis before generating code, preventing rework from misunderstood specifications
- **Comprehensive test generation** including unit tests, integration tests, and [property-based tests](@/glossary/property-based-testing.md) using StreamData, ensuring generated code has complete coverage from the moment of creation
- **Genetic quality pattern application** using platform-evolved quality patterns including [CASCADE pattern](@/glossary/cascade-pattern.md)s for common issues like type mismatch, dead code, and empty check elimination
- **Safe refactoring execution** with three-stage verification: pre-refactor snapshot, incremental transformation with intermediate validation, and post-refactor [regression test](@/glossary/regression-test.md)ing with rollback capability
- **[Typespec](@/glossary/typespec.md) and documentation generation** producing complete `@spec` annotations and `@doc` strings for every public function, maintaining the platform's 100% typespec coverage standard

## Authority Level

**L3** - Strategic Command. Multi-domain coordination and specialized operational command. The Code Specialist can generate code across any application in the umbrella but coordinates with domain-specific agents for context-sensitive decisions.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [database-specialist](@/agents/database-specialist.md) | Schema Partner | Coordinates on database-related code including [Ecto](@/glossary/ecto.md) schemas and migrations |
| [code-review-specialist-agent-v20](@/agents/code-review-specialist-agent-v20.md) | Quality Reviewer | Reviews generated code for pattern compliance and quality standards |
| [explain-specialist](@/agents/explain-specialist.md) | Documentation Partner | Provides code explanation and documentation for generated artifacts |
| [test-specialist](@/agents/test-specialist.md) | Test Partner | Collaborates on comprehensive test generation strategies |

## Enforcement

All code generation operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Generated code must compile with zero warnings, pass Credo strict mode, include complete typespecs, and have accompanying tests with full coverage. No generated code may contain stubs, mocks, placeholders, TODOs, or FIXMEs. Every artifact is production-ready from the moment of creation, with no deferred quality work permitted. The NABLA Evidence axioms require all generated patterns to have traceable provenance linking back to the genetic quality pattern that produced them.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)