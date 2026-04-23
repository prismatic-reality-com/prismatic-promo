+++
title = "AIAD Adaptation Engine Agent"
weight = 19
[extra]
domain = "primary"
level = "L3"
description = "Specialist agent for removing all Prismatic-specific references and adapting AIAD components for deployment to external projects across multiple languages and frameworks"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "ecto", "no-mercy", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Adaptation", "Engine", "Agent", "Specialist", "Prismatic-specific", "agents", "Prismatic Platform", "Prismatic", "Adaptation Engine"]
tags = ["agents", "agent", "aiad-adaptation-engine-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Adaptation Engine Agent - Prismatic Platform"
+++

## Overview

The [AIAD](@/glossary/aiad.md) Adaptation Engine Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Primary domain of the Prismatic Platform. This agent is responsible for removing all Prismatic-specific references from AIAD components and adapting them for deployment to external projects. When the AIAD knowledge transfer system exports agents, commands, workflows, and protocols to a target project, the Adaptation Engine ensures that every Prismatic module name, internal URL, file path, and platform-specific example is replaced with framework-agnostic equivalents appropriate for the target environment.

The challenge of knowledge transfer adaptation is not simply find-and-replace substitution. Prismatic references are embedded at multiple semantic levels: module names in code examples (`Prismatic.*`, `PrismaticStorage.*`, `PrismaticWeb.*`), internal URLs (`localhost:4000`, `prismatic-prod.fly.dev`), file paths (`apps/prismatic/`, `lib/prismatic/`), project names in documentation, and domain-specific concepts that assume Prismatic infrastructure. The Adaptation Engine applies pattern-aware transformation that understands the semantic role of each reference and produces contextually appropriate replacements. A module name in a code example is replaced with a properly formatted target-language equivalent; a URL is either replaced with a generic placeholder or removed entirely; a file path is translated to the target project's directory structure.

Quality validation ensures 100% reference removal. After adaptation, every component undergoes automated scanning for residual Prismatic-specific patterns. Any surviving reference is treated as an adaptation failure and triggers remediation. This zero-tolerance approach prevents knowledge transfer from accidentally leaking internal platform details into external projects.

## Architecture

The Adaptation Engine implements a multi-pass transformation pipeline where each pass targets a specific category of Prismatic reference. The pipeline is designed for composability -- passes can be added, removed, or reordered without affecting the overall transformation logic.

The first pass handles module name references, which are the most semantically complex transformation. A Prismatic module name like `PrismaticStorage.Adapters.ETS` must be translated into the target language's module naming convention: `your_project.storage.adapters.memory` for Python, `@your-project/storage/adapters/memory` for Node.js, or `your_project::storage::adapters::memory` for Rust. The adaptation engine maintains a substitution rule library for each supported language and framework combination, with rules that understand the structural relationship between source and target module hierarchies.

The second pass handles URL references, replacing internal endpoints with generic placeholders or removing them entirely when no meaningful generic equivalent exists. The third pass transforms file paths to match the target project's directory conventions. The fourth pass adapts code examples from Elixir to the target language, preserving the intent and structure while using target-language idioms.

After all transformation passes complete, a validation pass scans the entire adapted component for residual Prismatic patterns. This zero-residual validation is a blocking quality gate -- no component proceeds to deployment with surviving references.

## Core Capabilities

- **Multi-level reference detection** identifying Prismatic-specific patterns across module names, project names, internal URLs, file paths, code examples, and documentation text using configurable pattern categories with language-aware matching
- **Framework-agnostic substitution** replacing Prismatic references with contextually appropriate alternatives based on the target project's language (Elixir, Python, Node.js, Rust, Go, Ruby, Java) and framework (Phoenix, Django, Express, React, Rails, Spring Boot)
- **Code example adaptation** transforming Elixir code examples into equivalent examples in the target language, preserving the intent and structure of the example while using target-language idioms and conventions
- **Quality validation with zero-tolerance scanning** running automated post-adaptation scans that detect any surviving Prismatic references, treating residual references as blocking failures that prevent component deployment
- **Batch adaptation pipeline** processing multiple components in parallel with consistent transformation rules, ensuring that inter-component references remain valid after adaptation
- **Adaptation report generation** producing detailed reports documenting every transformation applied, enabling audit and review of the adaptation process

## Implementation

The Adaptation Engine implements the multi-pass transformation pipeline with zero-residual validation.

```elixir
defmodule AIAD.AdaptationEngine do
  @prismatic_patterns [
    {~r/Prismatic\w*\./, :module_name},
    {~r/PrismaticStorage\w*\./, :module_name},
    {~r/PrismaticWeb\w*\./, :module_name},
    {~r/prismatic-platform/, :project_name},
    {~r/prismatic\.fly\.dev/, :url},
    {~r/localhost:4000/, :url},
    {~r/apps\/prismatic\w*\//, :file_path}
  ]

  @spec adapt(component :: map(), target :: map()) ::
    {:ok, adapted :: map(), report :: map()} | {:error, term()}
  def adapt(component, target) do
    with {:ok, pass1} <- remove_module_references(component, target),
         {:ok, pass2} <- remove_url_references(pass1, target),
         {:ok, pass3} <- remove_path_references(pass2, target),
         {:ok, pass4} <- adapt_code_examples(pass3, target),
         {:ok, validated} <- validate_zero_residual(pass4) do
      report = build_adaptation_report(component, validated)
      {:ok, validated, report}
    end
  end

  def adapt_batch(components, target) do
    results = Task.async_stream(components, fn component ->
      adapt(component, target)
    end, max_concurrency: System.schedulers_online())

    {adapted, errors} = Enum.split_with(results, &match?({:ok, _}, &1))
    case errors do
      [] -> {:ok, Enum.map(adapted, fn {:ok, result} -> result end)}
      _ -> {:error, {:batch_failures, errors}}
    end
  end

  defp validate_zero_residual(component) do
    residual = scan_for_patterns(component, @prismatic_patterns)
    case residual do
      [] -> {:ok, component}
      patterns -> {:error, {:residual_references, patterns}}
    end
  end

  defp remove_module_references(component, target) do
    rules = load_module_rules(target.language, target.framework)
    transformed = apply_substitution_rules(component, rules)
    {:ok, transformed}
  end
end
```

The batch adaptation pipeline processes multiple components in parallel using `Task.async_stream` with concurrency limited to available schedulers. This enables efficient adaptation of large component sets (50+ specifications) while preventing resource exhaustion. Inter-component references are validated after batch adaptation to ensure that adapted cross-references remain valid.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [agent-discovery-specialist](@/agents/agent-discovery-specialist.md) | Registry Source | Provides the agent catalog for adaptation target identification |
| [AIAD Intelligence Selector Agent](@/agents/aiad-intelligence-selector-agent.md) | Pipeline Predecessor | Selects components for adaptation based on relevance scoring |
| [AIAD Injection Coordinator Agent](@/agents/aiad-injection-coordinator-agent.md) | Pipeline Orchestrator | Coordinates the end-to-end knowledge transfer including adaptation |
| [AIAD Template Generator Agent](@/agents/aiad-template-generator-agent.md) | Template Provider | Provides language-specific templates that guide adaptation rules |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Quality Gate | Validates adapted components against AIAD schema requirements |

## Operational Workflow

The adaptation workflow follows a structured pipeline with quality gates at each stage.

| Reference Type | Detection Pattern | Transformation Strategy |
|---------------|------------------|----------------------|
| Module names | `Prismatic*.*` | Language-specific module naming |
| Project names | `prismatic-platform`, `Prismatic Platform` | Target project name substitution |
| Internal URLs | `localhost:4000`, `*.fly.dev` | Generic URL or removal |
| File paths | `apps/prismatic*/`, `lib/prismatic*/` | Target project structure mapping |
| Code examples | Elixir-specific syntax | Target language equivalent |
| Configuration | Platform-specific config keys | Generic configuration templates |

The adaptation quality score (0-100) measures transformation completeness. A score of 100 indicates zero residual Prismatic references. Scores below 100 trigger re-adaptation with enhanced pattern detection. The target quality threshold is 100 -- partial adaptation is not acceptable for deployment.

The operational sequence proceeds as: component reception from the Intelligence Selector, multi-pass transformation through all reference categories, zero-residual validation, adaptation report generation, and handoff to the Template Generator. Each stage emits telemetry events for pipeline monitoring and performance tracking.

## NABLA Compliance

The Adaptation Engine operates under NABLA Infinity axiom compliance for transformation quality assurance.

**Signal Plurality.** Adaptation quality is validated through multiple independent signals: pattern-based residual scanning, structural schema validation, and syntactic correctness checking of adapted code examples. No single validation mechanism determines adaptation quality.

**Provenance Mandatory.** Every transformation is logged in the adaptation report with the source pattern, applied rule, target substitution, and the component section affected. This provenance enables audit of the adaptation process and debugging of unexpected transformations.

**Unknown Valid.** When the adaptation engine encounters a Prismatic reference that does not match any known pattern category, it flags the reference as "unknown" rather than silently ignoring it. Unknown references are included in the adaptation report for human review, preventing silent leakage of platform-specific content.

## Configuration

```elixir
config :aiad, AIAD.AdaptationEngine,
  prismatic_patterns: :default,
  supported_languages: [:elixir, :python, :nodejs, :rust, :go, :ruby, :java],
  batch_concurrency: System.schedulers_online(),
  zero_residual_enforcement: true,
  report_generation: true,
  telemetry_prefix: [:aiad, :adaptation_engine]
```

The substitution rule library is maintained as a separate configuration module with per-language and per-framework rule sets. Rules are versioned and can be extended without modifying the core adaptation engine logic. The zero-residual enforcement flag is enabled by default and cannot be disabled in production contexts.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Single component adaptation** | < 500ms | < 1s | Time to fully adapt one component |
| **Batch adaptation (50 components)** | < 10s | < 30s | Parallel batch processing throughput |
| **Reference removal rate** | 100% | 100% | Zero residual Prismatic references post-adaptation |
| **Code example accuracy** | > 95% | > 98% | Syntactic correctness of adapted code examples |
| **Supported languages** | 7 | 7+ | Programming languages with adaptation rules |
| **Adaptation report completeness** | 100% | 100% | All transformations documented in report |

## Related Resources

- [AIAD Standard](@/capabilities/aiad-standard.md) -- Agent specification standard defining adaptable component formats
- [AIAD Intelligence Selector Agent](@/agents/aiad-intelligence-selector-agent.md) -- Component selection preceding adaptation
- [AIAD Injection Coordinator Agent](@/agents/aiad-injection-coordinator-agent.md) -- Orchestrator for the complete knowledge transfer pipeline
- [Technologies](@/technologies/_index.md) -- Platform technology stack including supported target languages
- [Commands](@/commands/_index.md) -- Commands including the `/inject` knowledge transfer command
- [Applications](@/apps/_index.md) -- Platform applications providing source components for adaptation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)