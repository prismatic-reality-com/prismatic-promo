+++
title = "rapid-feature-specialist"
weight = 334
[extra]
domain = "primary-producer"
level = "L2"
description = "Ultra-fast feature implementation specialist for 5-15 minute delivery"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["rapid-feature-specialist", "Ultra-fast", "5-15", "agents", "agent", "Prismatic Platform", "Dialyzer", "Credo", "Pattern"]
tags = ["agents", "agent", "rapid-feature-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "rapid-feature-specialist - Prismatic Platform"
+++

## Overview

The rapid-feature-specialist operates as an L2 Tactical Operations authority within the Prismatic Platform's primary-producer domain, providing ultra-fast feature implementation with a target delivery window of 5 to 15 minutes per feature. This agent specializes in the execution phase of feature development, taking well-defined feature specifications and implementing them at maximum velocity while maintaining full compliance with the platform's quality standards across all 13 quality domains.

Speed without quality is not speed -- it is technical debt creation. The rapid-feature-specialist achieves its execution velocity not by cutting corners but by applying deep knowledge of the platform's architecture, conventions, and patterns to minimize decision-making time during implementation. The agent knows exactly which modules to create, which patterns to apply, which tests to write, and which configuration to add for any standard feature type. This pattern expertise transforms implementation from a creative problem-solving exercise into a disciplined execution protocol.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine, this agent delivers features that pass all quality gates immediately. The 5-15 minute delivery target includes not just code writing but also test creation, quality gate verification, and commit preparation. Delivery is not counted as complete until the feature compiles with zero warnings, passes all tests, and satisfies Dialyzer and Credo in strict mode.

## Rapid Delivery Methodology

The agent's delivery methodology is structured around four compressed phases that overlap where possible.

**Instant analysis** evaluates the feature specification to identify the implementation pattern, required modules, affected applications, and necessary test categories. This phase targets completion in under 30 seconds, leveraging the agent's deep knowledge of the platform architecture to map features to implementation patterns immediately.

**Parallel generation** creates all required artifacts simultaneously: application code, test suites, configuration changes, and documentation. Unlike sequential development where each file is created in isolation, parallel generation produces all artifacts from a unified understanding of the feature, ensuring consistency without requiring post-generation reconciliation.

**Rapid verification** executes quality gates on the generated code, running compilation, Credo, and focused Dialyzer checks in parallel. The agent uses targeted verification that checks only the affected modules rather than the entire umbrella, reducing gate execution time from minutes to seconds while maintaining equivalent confidence.

**Instant commit** packages the verified feature into a production-ready commit with proper Conventional Commits formatting, including all necessary metadata and change descriptions. The commit is immediately ready for push and CI/CD pipeline execution.

## Key Capabilities

- **5-15 minute feature delivery** -- Implements complete features including code, tests, configuration, and documentation within a compressed delivery window, without quality compromise
- **Pattern-driven implementation** -- Applies deep knowledge of platform patterns to transform feature specifications into implementations without iterative design exploration
- **Parallel artifact generation** -- Creates all required files simultaneously from a unified feature understanding, eliminating sequential dependency bottlenecks
- **Targeted verification** -- Runs focused quality gate checks on affected modules only, achieving full confidence in seconds rather than minutes
- **Zero-rework delivery** -- Features pass all quality gates on first verification, eliminating fix-recheck cycles that dominate conventional development timelines
- **Multi-application features** -- Implements features that span multiple umbrella applications, coordinating cross-application dependencies during the compressed delivery window
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed feature implementation from specification to commit
- **[Telemetry integration](/capabilities/telemetry-integration/)** for delivery time tracking and quality compliance rate monitoring

## Delivery Time Breakdown

| Phase | Target Duration | Activities |
|-------|----------------|------------|
| **Analysis** | <30 seconds | Pattern identification, module mapping, dependency analysis |
| **Generation** | 2-5 minutes | Code, tests, config, docs creation in parallel |
| **Verification** | 1-3 minutes | Targeted compilation, Credo, Dialyzer, test execution |
| **Commit** | <30 seconds | Formatting, message generation, staging |
| **Total** | 5-15 minutes | End-to-end feature delivery |

## Implementation Architecture

```elixir
defmodule PrismaticDev.RapidFeatureSpecialist do
  @moduledoc """
  Ultra-fast feature implementation engine delivering
  complete, quality-compliant features in 5-15 minutes.
  """

  alias PrismaticDev.{PatternMatcher, ParallelGenerator, TargetedVerifier}

  @type delivery_result :: %{
    feature: String.t(),
    delivery_time_ms: non_neg_integer(),
    files_created: non_neg_integer(),
    tests_generated: non_neg_integer(),
    quality_status: :all_passing,
    commit_ready: boolean()
  }

  @spec deliver(map(), keyword()) :: {:ok, delivery_result()} | {:error, term()}
  def deliver(spec, opts \\ []) do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, pattern} <- PatternMatcher.identify(spec),
         {:ok, artifacts} <- ParallelGenerator.generate(pattern, spec),
         {:ok, _} <- TargetedVerifier.verify(artifacts) do
      elapsed = System.monotonic_time(:millisecond) - start_time

      {:ok, %{
        feature: spec.name,
        delivery_time_ms: elapsed,
        files_created: length(artifacts.files),
        tests_generated: length(artifacts.tests),
        quality_status: :all_passing,
        commit_ready: true
      }}
    end
  end
end
```

## Feature Pattern Catalog

| Pattern | Delivery Time | Complexity | Files Generated |
|---------|--------------|------------|-----------------|
| **CRUD Context** | 5-8 minutes | Low | 6-8 files |
| **LiveView Page** | 8-12 minutes | Medium | 4-6 files |
| **GenServer Service** | 5-8 minutes | Low | 3-5 files |
| **Storage Adapter** | 10-15 minutes | Medium | 5-7 files |
| **API Endpoint** | 8-12 minutes | Medium | 5-8 files |
| **Agent + Command** | 5-8 minutes | Low | 3-4 files |
| **Cross-App Feature** | 12-15 minutes | High | 8-12 files |

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](/glossary/tactical-execution/) with authority to implement features, create modules, generate tests, and prepare production-ready commits within the delivery window.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/rapid-feature deliver` | Implement a feature from specification with full quality compliance | L2+ |
| `/rapid-feature patterns` | List available feature patterns with estimated delivery times | L2+ |
| `/rapid-feature status` | Display current delivery metrics and velocity trends | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quickstart-specialist](/agents/quickstart-specialist/) | Scaffolding templates used as generation foundations |
| [quality-gates-specialist](/agents/quality-gates-specialist/) | Targeted verification delegates to quality gate execution |
| [refactor-specialist-coordinator](/agents/refactor-specialist-coordinator/) | Rapid features follow refactoring-friendly patterns for future maintenance |
| [quality-enforcement-commander](/agents/quality-enforcement-commander/) | Delivered features must pass full enforcement pipeline |

## Enforcement

Rapid feature delivery operates under strict [NO MERCY](/glossary/no-mercy/) enforcement: speed never justifies quality compromise. Every delivered feature must pass all 13 quality domains with zero violations. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that delivery claims are verified through actual gate execution, not assumed from template compliance. The [Trinity Gate](/glossary/trinity-gate/) validates that delivered features maintain structural consistency with the existing codebase architecture.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)