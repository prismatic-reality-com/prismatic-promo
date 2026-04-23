+++
title = "AIAD Injection Coordinator Agent"
weight = 27
[extra]
domain = "medium"
level = "L3"
description = "Orchestrates intelligent knowledge transfer from Prismatic Platform to external projects, coordinating project analysis, component selection, adaptation, and safe deployment with automatic rollback"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "color-teams", "telemetry", "osint", "no-mercy", "lean4", "genserver"]
domain_normalized = "predator"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1850
quality_score = 92
keywords = ["knowledge transfer", "project injection", "multi-language", "safe deployment", "rollback capability", "pipeline orchestration"]
tags = ["prismatic", "agent", "knowledge-transfer", "injection", "cross-platform"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Injection Coordinator Agent - Prismatic Platform"
+++

## Overview

The [AIAD](@/glossary/aiad.md) Injection Coordinator Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent responsible for orchestrating the complete knowledge transfer pipeline from the Prismatic Platform to external projects. This agent coordinates the end-to-end process of exporting the platform's battle-tested AI-assisted development infrastructure -- agents, commands, workflows, protocols, and quality gates -- to target projects of any language or framework. The injection process is not a simple copy operation; it is an intelligent, multi-stage pipeline that analyzes the target, selects relevant components, adapts them for the target environment, deploys with safe merge strategies, and verifies installation success with rollback capability.

The knowledge transfer challenge is significant. The Prismatic Platform's AIAD infrastructure is deeply integrated with Elixir, [OTP](@/glossary/otp.md), and the platform's specific architecture. Exporting this infrastructure to a Python Django project, a Node.js Express application, or a Rust CLI tool requires more than file copying -- it requires intelligent adaptation that preserves the intent and value of each component while expressing it in the target's native idioms. The Injection Coordinator orchestrates this multi-agent pipeline, delegating analysis, selection, adaptation, and deployment to specialized sub-agents while maintaining overall pipeline coherence.

The safe deployment mechanism is critical. External projects may already have partial AIAD installations, conflicting configurations, or sensitive files that must not be overwritten. The coordinator implements a backup-first merge strategy: existing files are backed up before any modification, conflicts are detected and resolved through configurable merge strategies, and the entire installation can be rolled back if verification detects problems.

## Operational Domain

The Injection Coordinator operates across the knowledge transfer domain, which spans the boundary between the Prismatic Platform's internal infrastructure and external target projects. This cross-boundary operation requires understanding of multiple programming languages, frameworks, and project structures. The agent coordinates with four specialized sub-agents that handle the distinct phases of the transfer pipeline.

## Key Capabilities

- **End-to-end pipeline orchestration** coordinating the Project Analyzer, Intelligence Selector, Adaptation Engine, and Template Generator through a sequenced pipeline that produces fully adapted, deployment-ready AIAD infrastructure for any target project
- **Multi-language project analysis** detecting the target project's primary language (Elixir, Python, Node.js, Rust, Go, Ruby, Java), framework (Phoenix, Django, Express, React, Rails, Spring Boot), project structure (monorepo, microservices, CLI), and existing capabilities (testing, CI/CD, API, database)
- **Safe deployment with rollback** implementing backup-first installation that preserves existing files, detects merge conflicts, and provides complete rollback capability if post-installation verification fails
- **Verification and validation** running post-installation checks that confirm all deployed components are structurally valid, internally consistent, and free of residual Prismatic-specific references
- **Installation reporting** generating comprehensive reports documenting every component installed, every adaptation applied, and every conflict resolved, providing full traceability for the knowledge transfer
- **Incremental injection** supporting partial installations that add specific components to projects with existing AIAD infrastructure without disrupting previously installed components

## Technical Architecture

The Injection Coordinator implements a pipeline pattern where each stage's output feeds the next stage's input, with the coordinator maintaining overall state and handling inter-stage communication.

```elixir
defmodule AIAD.InjectionCoordinator do
  @pipeline_stages [:analyze, :select, :adapt, :generate, :deploy, :verify]

  def inject(target_path, opts \\ []) do
    with {:ok, analysis} <- AIAD.ProjectAnalyzer.analyze(target_path),
         {:ok, selected} <- AIAD.IntelligenceSelector.select(analysis),
         {:ok, adapted} <- AIAD.AdaptationEngine.adapt_batch(selected, analysis),
         {:ok, templates} <- AIAD.TemplateGenerator.generate(adapted, analysis),
         {:ok, backup_id} <- create_backup(target_path),
         {:ok, deployed} <- deploy_to_target(templates, target_path, opts),
         {:ok, verified} <- verify_installation(deployed, target_path) do
      report = generate_installation_report(analysis, selected, adapted, deployed)
      {:ok, %{report: report, backup_id: backup_id, components: length(deployed)}}
    else
      {:error, stage, reason} ->
        rollback_if_needed(target_path, stage)
        {:error, %{stage: stage, reason: reason}}
    end
  end
end
```

The pipeline's error handling follows the fail-fast principle with automatic rollback. If any stage fails after deployment has begun, the coordinator uses the pre-deployment backup to restore the target project to its original state. This ensures that a failed injection never leaves the target project in a partially modified state.

## Decision Framework

| Pipeline Decision | Criteria | Outcome |
|------------------|----------|---------|
| Component relevance | Score >= 0.5 on 0-1 scale | Include in deployment |
| Language match | Exact = 1.0, compatible = 0.7, generic = 0.5 | Affects selection weight |
| Existing AIAD detected | Version and completeness check | Incremental vs full injection |
| Merge conflict | File exists with different content | Backup + configurable strategy |
| Verification failure | Post-install check fails | Automatic rollback |
| Adaptation quality | Score < 100 (residual references) | Block deployment |

## Authority Level

**L3** - Strategic Command. The Injection Coordinator holds multi-domain coordination authority for the complete knowledge transfer pipeline. This permits orchestration of the four specialized sub-agents (Analyzer, Selector, Adaptation Engine, Template Generator) and write access to target project directories. The L3 designation enables cross-domain operation that spans internal AIAD infrastructure and external project structures.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [AIAD Project Analyzer Agent](@/agents/aiad-project-analyzer-agent.md) | Pipeline Stage 1 | Analyzes target project language, framework, and structure |
| [AIAD Intelligence Selector Agent](@/agents/aiad-intelligence-selector-agent.md) | Pipeline Stage 2 | Selects relevant components based on project analysis |
| [AIAD Adaptation Engine Agent](@/agents/aiad-adaptation-engine-agent.md) | Pipeline Stage 3 | Removes Prismatic references and adapts for target |
| [AIAD Template Generator Agent](@/agents/aiad-template-generator-agent.md) | Pipeline Stage 4 | Generates tailored configurations and templates |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Post-deploy Gate | Validates installation integrity |
| [aiad-backup-manager](@/agents/aiad-backup-manager.md) | Safety Net | Manages pre-deployment backups for rollback |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Full injection pipeline** | < 2min | < 5min | End-to-end time for complete project injection |
| **Project analysis** | < 10s | < 30s | Time for target project analysis |
| **Component selection** | < 5s | < 10s | Time for relevance scoring and selection |
| **Adaptation batch** | < 30s | < 60s | Time for batch adaptation of selected components |
| **Deployment success rate** | > 95% | > 90% | Percentage of injections completing without rollback |
| **Supported target languages** | 7 | 7+ | Programming languages with full injection support |

## Enforcement

All injection operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No injection deploys components with residual Prismatic-specific references -- the Adaptation Engine's zero-tolerance scan is a blocking gate. Pre-deployment backups are mandatory and verified before any target directory modification. Post-deployment verification must pass before the injection is considered complete. Failed injections trigger automatic rollback with no manual intervention required. Every injection produces an immutable installation report documenting all changes for audit purposes. The target project's existing files are never silently overwritten -- conflicts are detected, reported, and resolved through explicit merge strategies.

## Related Resources

- [AIAD Standard](@/capabilities/aiad-standard.md) -- Specification standard defining injectable components
- [AIAD Adaptation Engine Agent](@/agents/aiad-adaptation-engine-agent.md) -- Adaptation pipeline for reference removal
- [AIAD Intelligence Selector Agent](@/agents/aiad-intelligence-selector-agent.md) -- Relevance-based component selection
- [Commands](@/commands/_index.md) -- Includes the `/inject` knowledge transfer command
- [Technologies](@/technologies/_index.md) -- Platform technology stack including supported target languages
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture and knowledge transfer patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)