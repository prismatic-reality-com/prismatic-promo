+++
title = "AIAD Project Analyzer Agent"
weight = 29
[extra]
domain = "primary"
level = "L3"
description = "Performs comprehensive analysis of target projects detecting language, framework, structure, capabilities, and existing AIAD installations to inform intelligent knowledge transfer decisions"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Project", "Analyzer", "Agent", "Performs", "agents", "Prismatic Platform", "Framework", "The Project"]
tags = ["agents", "agent", "aiad-project-analyzer-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Project Analyzer Agent - Prismatic Platform"
+++

## Overview

The [AIAD](@/glossary/aiad.md) Project Analyzer Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Primary domain of the Prismatic Platform. This agent performs comprehensive analysis of target projects to inform the knowledge transfer pipeline's component selection and adaptation decisions. By detecting the target project's primary language, framework, project structure, existing capabilities, and any prior AIAD installation, the analyzer produces a structured analysis report that serves as the foundation for all subsequent knowledge transfer decisions.

The analysis challenge is non-trivial. Modern software projects express their characteristics through diverse indicators: a `mix.exs` file signals Elixir, a `pyproject.toml` signals Python, a `Cargo.toml` signals Rust, but the presence of a `package.json` alongside a `mix.exs` in the platform's promo site indicates a polyglot project requiring nuanced analysis. The Project Analyzer uses a multi-signal detection heuristic that weights primary indicators (build system files) more heavily than secondary indicators (configuration files, directory structure) and produces confidence scores for each detected characteristic rather than making binary classifications.

Framework detection goes deeper than language detection. Within a Python project, the difference between Django, Flask, and FastAPI has significant implications for which AIAD components are relevant and how they should be adapted. The analyzer detects frameworks through dependency analysis (reading `requirements.txt`, `pyproject.toml`, or `Gemfile` for framework libraries), file structure analysis (Django's `manage.py` and `settings.py` pattern), and configuration analysis (framework-specific configuration files and directory conventions).

## Operational Domain

The Primary domain encompasses core platform operations producing foundational artifacts. The Project Analyzer operates as the first stage of the knowledge transfer pipeline, producing the analysis report consumed by the Intelligence Selector, Adaptation Engine, and Template Generator. The analyzer's output quality directly determines the quality of all downstream knowledge transfer decisions.

## Key Capabilities

- **Multi-language detection** identifying the target project's primary and secondary languages across seven supported languages (Elixir, Python, Node.js, Rust, Go, Ruby, Java) using weighted indicator analysis with primary indicators (build files) and secondary indicators (configuration, directory structure)
- **Framework detection** identifying specific web frameworks, libraries, and toolkits within the detected language ecosystem through dependency file analysis, configuration pattern recognition, and directory structure inference
- **Project structure analysis** classifying the target project's organizational pattern (monorepo, microservices, single application, CLI tool, library) based on directory layout, build configuration, and module organization
- **Capability assessment** detecting existing project capabilities including testing infrastructure, CI/CD pipelines, API endpoints, database integration, Docker configuration, and documentation, identifying both what the project has and what it lacks
- **Existing AIAD detection** scanning for prior AIAD installations to determine version, completeness, and compatibility, enabling incremental knowledge transfer that builds on existing infrastructure
- **Structured analysis report generation** producing a machine-readable JSON report containing all detection results with confidence scores, enabling downstream agents to make evidence-based decisions

## Technical Architecture

The Project Analyzer implements a multi-pass analysis pipeline where each pass targets a specific detection dimension, building on results from previous passes.

```elixir
defmodule AIAD.ProjectAnalyzer do
  @supported_languages [:elixir, :python, :nodejs, :rust, :go, :ruby, :java]

  @language_indicators %{
    elixir: %{primary: ["mix.exs"], secondary: [".formatter.exs", "config/config.exs"]},
    python: %{primary: ["requirements.txt", "pyproject.toml", "setup.py"],
              secondary: ["manage.py", "venv/", "__pycache__/"]},
    nodejs: %{primary: ["package.json"], secondary: ["node_modules/", "src/"]},
    rust: %{primary: ["Cargo.toml"], secondary: ["src/main.rs", "src/lib.rs"]},
    go: %{primary: ["go.mod"], secondary: ["main.go", "cmd/", "pkg/"]},
    ruby: %{primary: ["Gemfile"], secondary: ["lib/", "app/"]},
    java: %{primary: ["pom.xml", "build.gradle"], secondary: ["src/main/java/"]}
  }

  def analyze(target_path) do
    with {:ok, files} <- scan_project_files(target_path),
         {:ok, language} <- detect_language(files),
         {:ok, framework} <- detect_framework(files, language),
         {:ok, structure} <- analyze_structure(files, target_path),
         {:ok, capabilities} <- assess_capabilities(files, language, framework),
         {:ok, existing_aiad} <- detect_existing_aiad(files, target_path) do
      {:ok, build_analysis_report(language, framework, structure,
                                   capabilities, existing_aiad)}
    end
  end
end
```

Each detection function produces results with confidence scores. Language detection returns a ranked list of detected languages with confidence values, enabling the downstream pipeline to handle polyglot projects where multiple languages coexist. Framework detection correlates language with dependency declarations and file patterns to identify the specific framework in use. Structure analysis classifies the project organization pattern using heuristics -- the presence of `apps/` in an Elixir project indicates an umbrella structure; multiple `Dockerfile`s suggest microservices.

## Decision Framework

| Detection Dimension | Primary Indicators | Confidence Threshold |
|-------------------|-------------------|---------------------|
| Language | Build system files (mix.exs, Cargo.toml, etc.) | >= 0.90 for primary |
| Framework | Dependency declarations + config files | >= 0.80 for classification |
| Structure | Directory layout + build configuration | >= 0.70 for classification |
| Capabilities | Config files + test directories + CI configs | >= 0.60 per capability |
| Existing AIAD | `.aiad/` directory presence + version file | Binary (present/absent) |

When confidence falls below thresholds, the analyzer flags the dimension as uncertain rather than guessing. This uncertainty propagates to downstream agents, which can request human clarification or apply conservative defaults. The approach aligns with the NABLA Unknown Valid axiom: uncertain detection results are treated as legitimate data rather than forced into classifications.

## Authority Level

**L3** - Strategic Command. The Project Analyzer holds multi-domain coordination authority for project analysis operations. This permits read access to the target project's file system for non-destructive analysis. The agent never modifies target project files -- its operations are strictly read-only and observational. The L3 designation enables coordination with the pipeline orchestrator and downstream processing agents.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [AIAD Injection Coordinator Agent](@/agents/aiad-injection-coordinator-agent.md) | Pipeline Orchestrator | Invokes analysis as the first pipeline stage |
| [AIAD Intelligence Selector Agent](@/agents/aiad-intelligence-selector-agent.md) | Analysis Consumer | Consumes analysis report for component relevance scoring |
| [AIAD Adaptation Engine Agent](@/agents/aiad-adaptation-engine-agent.md) | Analysis Consumer | Uses language/framework detection to guide adaptation rules |
| [AIAD Template Generator Agent](@/agents/aiad-template-generator-agent.md) | Analysis Consumer | Uses project characteristics to generate tailored templates |
| [agent-discovery-specialist](@/agents/agent-discovery-specialist.md) | Registry Source | Provides agent catalog for existing AIAD compatibility checks |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Full analysis time** | < 10s | < 30s | Time for complete project analysis including all dimensions |
| **Language detection accuracy** | > 98% | > 95% | Correct primary language identification rate |
| **Framework detection accuracy** | > 95% | > 90% | Correct framework identification rate |
| **Capability detection completeness** | > 90% | > 85% | Detected capabilities as percentage of actual capabilities |
| **File scan coverage** | 100% | 100% | Percentage of project files included in analysis |
| **Report generation time** | < 1s | < 2s | Time to produce structured JSON analysis report |

## Enforcement

All analysis operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Analysis results must include confidence scores for every detection claim -- assertions without confidence quantification are rejected. The analyzer operates in strict read-only mode; any attempt to modify target project files is a violation. Detection heuristics are documented and versioned, ensuring reproducibility. When detection confidence falls below classification thresholds, the analyzer reports uncertainty explicitly rather than guessing. Every analysis produces a structured report that downstream agents can parse programmatically, ensuring that human-readable narrative never substitutes for machine-readable structured data.

## Related Resources

- [AIAD Standard](@/capabilities/aiad-standard.md) -- Specification standard for analyzable AIAD components
- [AIAD Injection Coordinator Agent](@/agents/aiad-injection-coordinator-agent.md) -- Pipeline orchestrator consuming analysis results
- [Technologies](@/technologies/_index.md) -- Platform technology stack informing detection heuristics
- [Applications](@/apps/_index.md) -- Platform applications providing reference project structures
- [Commands](@/commands/_index.md) -- Commands available for knowledge transfer operations
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)