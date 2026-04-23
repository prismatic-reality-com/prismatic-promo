+++
title = "llm-client-pattern-specialist"
weight = 221
[extra]
domain = "quality"
level = "L3"
description = "LLM Client return type verification (3-tuples), pattern matching correctness, usage tracking, integration testing, and contract compliance"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "seadf"]
domain_normalized = "quality"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 92
keywords = ["llm client", "pattern matching", "return type verification", "3-tuple", "contract compliance", "quality gates"]
tags = ["prismatic", "agent", "quality", "llm", "pattern-verification"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-client-pattern-specialist - Prismatic Platform"
+++

## Overview

The llm-client-pattern-specialist is an L3 [Strategic Command](/glossary/strategic-command/) agent operating within the quality domain of the Prismatic Platform. This agent specializes in verifying and enforcing correct usage patterns for the platform's LLM client library, with particular focus on return type verification (ensuring 3-tuple response patterns are correctly handled), [pattern matching](/glossary/pattern-matching/) correctness across all LLM client call sites, usage tracking for API consumption monitoring, integration testing validation, and contract compliance between the LLM client and its consumers. The agent has been genetically enhanced through the platform's evolutionary optimization framework to achieve high-precision detection of LLM client misuse patterns.

Built on the [AIAD](/glossary/aiad/) standard, this agent addresses a critical quality concern in platforms that integrate with LLM APIs. LLM client libraries typically return complex response structures (status tuples, nested maps, streaming responses) that are easily mishandled. Incorrect pattern matching on LLM responses can lead to silent data loss (ignoring error tuples), runtime crashes (matching on assumed response structure that varies by model), or degraded behavior (failing to handle rate limiting, token limits, or model-specific response variations). The llm-client-pattern-specialist systematically prevents these failure modes through static analysis and contract enforcement.

## Architecture

The pattern verification architecture analyzes all call sites of the platform's LLM client functions, examining how callers handle response values. The Prismatic Platform's LLM client returns 3-tuple responses of the form `{:ok, response, metadata}` or `{:error, reason, context}`, where the third element carries operational metadata (token counts, latency measurements, model identifier, request identifier) essential for cost tracking and performance monitoring.

```elixir
defmodule Prismatic.Quality.LLMPatternScanner do
  @moduledoc """
  Scans all LLM client call sites for pattern matching correctness,
  verifying 3-tuple handling and contract compliance.
  """

  use GenServer

  @type violation :: %{
    module: module(),
    function: atom(),
    line: non_neg_integer(),
    type: :incomplete_match | :missing_error | :metadata_discard,
    severity: :warning | :error | :critical
  }

  @spec scan_all() :: {:ok, [violation()]} | {:error, term()}
  def scan_all do
    GenServer.call(__MODULE__, :scan_all, :timer.minutes(5))
  end

  @impl true
  def handle_call(:scan_all, _from, state) do
    with {:ok, call_sites} <- discover_llm_call_sites(),
         {:ok, violations} <- analyze_patterns(call_sites) do
      emit_telemetry(violations)
      {:reply, {:ok, violations}, update_state(state, violations)}
    end
  end
end
```

The specialist detects several categories of misuse. Incomplete pattern matching occurs when callers match on 2-tuple patterns (`{:ok, response}`) instead of 3-tuples, silently discarding the metadata element that is needed for cost tracking and audit logging. Assumed structure matching occurs when callers destructure the response body assuming a specific nested structure that varies between LLM providers or model versions. Missing error handling occurs when callers match only the success case without handling the error tuple, creating unhandled match errors on API failures. Unsafe metadata access occurs when callers access metadata fields without nil-safety, creating failures when optional metadata fields are absent.

## Key Capabilities

- **3-tuple return type verification** -- Scans all LLM client call sites to verify correct handling of 3-tuple response patterns, flagging 2-tuple matches that discard metadata and incomplete pattern matches that miss error cases
- **Cross-provider pattern validation** -- Verifies that response handling code is compatible with all configured LLM providers (Claude, GPT, Ollama, local models), accounting for provider-specific response structure variations
- **Usage tracking enforcement** -- Ensures that token counts, latency measurements, and cost data from response metadata are correctly propagated to the platform's [telemetry](/glossary/telemetry/) and cost tracking systems
- **Contract compliance testing** -- Validates that the LLM client's behavioral contract (response types, error conditions, metadata guarantees) is maintained across client library updates
- **Integration test generation** -- Automatically generates integration tests that exercise all observed LLM client usage patterns against mock and live LLM endpoints
- **[Property-based testing](/glossary/property-based-testing/) support** -- Generates property-based tests that verify LLM client response handling invariants across randomized input combinations
- **[Quality gate integration](/capabilities/quality-gates/)** -- Blocks deployment when LLM client pattern violations are detected
- **[Telemetry integration](/capabilities/telemetry-integration/)** for pattern violation tracking and client usage monitoring

## Genetic Enhancement

The llm-client-pattern-specialist has been enhanced through the platform's genetic algorithm optimization framework, which evolves detection rules based on historical pattern violation data. The evolutionary process optimizes detection rules for precision (minimizing false positives that create developer friction) and recall (maximizing detection of genuine misuse patterns). Enhancement generations are tracked and versioned, enabling rollback if a new generation introduces detection regressions.

The genetic enhancement process has identified several non-obvious misuse patterns that would be difficult to detect through manual rule authoring. These include temporal patterns (code that handles responses correctly for the initially configured provider but breaks when providers are switched at runtime), composition patterns (code that correctly handles individual LLM calls but mishandles response aggregation in multi-call workflows), and degradation patterns (code that handles fresh API responses correctly but fails when processing cached or replayed responses with different metadata structures).

## Analysis Methodology

The specialist performs analysis at two levels: static analysis of source code and dynamic analysis of runtime behavior.

Static analysis scans the platform's Elixir AST (Abstract Syntax Tree) for all call sites of LLM client functions, extracting the pattern match expressions used to handle return values. Each pattern match is classified as complete (handles all documented return patterns), partial (handles some but not all patterns), or incorrect (uses patterns that do not match the client's documented return types). Static analysis runs as part of the quality gate pipeline and as a pre-commit check.

Dynamic analysis monitors actual LLM client calls at runtime, tracking which response patterns are observed in practice and whether any responses trigger match errors or fall through to catch-all handlers. Dynamic analysis complements static analysis by catching issues that static analysis cannot detect, such as runtime provider switching that changes response structures.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority enabling the specialist to analyze LLM client usage across all platform applications, enforce pattern compliance through quality gates, and coordinate with LLM infrastructure agents for contract evolution.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/llm-patterns scan` | Run pattern analysis across all LLM client call sites | L3+ |
| `/llm-patterns verify <module>` | Verify LLM client usage patterns in a specific module | L2+ |
| `/llm-patterns contract` | Validate current LLM client contract compliance | L3+ |
| `/llm-patterns report` | Generate detailed pattern analysis report | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [**llm-generic-bridge**](/agents/llm-generic-bridge/) (L4) | Maintains the LLM client contracts that the specialist enforces |
| [**llm-cost-manager**](/agents/llm-cost-manager/) (L4) | Depends on correct metadata propagation for cost tracking accuracy |
| [**llm-performance-optimizer**](/agents/llm-performance-optimizer/) (L3) | Depends on correct metadata propagation for latency tracking |
| [**cascade-quality-specialist**](/agents/cascade-quality-specialist/) (L3) | LLM client pattern violations contribute to CASCADE quality tracking |

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine prohibits deployment of code with known LLM client pattern violations. Every call site must correctly handle all documented response patterns including error cases and metadata. The [NO DOUBTS](/glossary/no-doubts/) principle requires that pattern analysis results include specific remediation guidance for each violation, enabling developers to resolve issues without consulting additional documentation. All pattern verification results pass through the [Trinity Gate](/glossary/trinity-gate/) validation framework, ensuring structural consistency of the analysis, logical consistency of violation classifications, and formal verification of contract compliance claims. The [NABLA Infinity](/glossary/nabla-infinity/) framework governs the epistemic rigor of pattern detection, requiring that violation claims are backed by concrete AST evidence with full provenance chains.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)