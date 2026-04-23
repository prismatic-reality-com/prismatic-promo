+++
title = "AIAD Template Generator Agent"
weight = 30
[extra]
domain = "primary-producer"
level = "L3"
description = "Generates tailored CLAUDE.md configurations and adapts AIAD components (agents, commands, workflows, protocols) for target projects based on language, framework, and capabilities"
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
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Template", "Generator", "Agent", "Generates", "CLAUDEmd", "agents", "Prismatic Platform", "CLAUDE", "The Template"]
tags = ["agents", "agent", "aiad-template-generator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Template Generator Agent - Prismatic Platform"
+++

## Overview

The [AIAD](/glossary/aiad/) Template Generator Agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Primary Producer domain of the Prismatic Platform. This agent creates project-specific configurations by generating tailored `CLAUDE.md` files, adapting agent specifications for the target language and framework, customizing commands with correct syntax, adapting workflows to the target's tooling, and customizing quality gate protocols. The Template Generator is the final creative stage in the knowledge transfer pipeline, producing deployment-ready artifacts that are immediately usable in the target project.

The `CLAUDE.md` file is the centerpiece of every AIAD-equipped project. It serves as the master configuration document that guides LLM-assisted development, defining coding standards, testing requirements, quality gates, workflow conventions, and project-specific instructions. The Template Generator constructs this file dynamically from the project analysis report, populated with sections relevant to the detected language, framework, and capabilities. A Python Django project receives Python-specific coding standards, pytest testing conventions, and Django-specific workflow guidance. An Elixir Phoenix project receives different conventions entirely.

Beyond the `CLAUDE.md`, the Template Generator adapts individual agent and command specifications. An agent specification designed for the Elixir ecosystem includes Elixir code examples, OTP process patterns, and `mix` task integration. When adapted for a Python project, the same specification uses Python class examples, asyncio patterns, and `make`/`pytest` task integration. The structural intent -- quality enforcement, monitoring, automated testing -- remains identical, but the expression is native to the target environment.

## Operational Domain

The Primary Producer domain encompasses agents that create foundational platform artifacts. The Template Generator produces the configuration and specification artifacts that constitute the deployed AIAD infrastructure in target projects. This agent operates as the penultimate stage of the knowledge transfer pipeline, receiving adapted components from the Adaptation Engine and producing final deployment-ready files.

## Key Capabilities

- **Tailored CLAUDE.md generation** constructing project-specific master configuration files with language-appropriate coding standards, framework-specific workflow guidance, and capability-matched quality gate definitions
- **Agent specification adaptation** transforming agent spec templates to use target-language code examples, framework-appropriate patterns, and environment-specific integration points
- **Command syntax customization** adapting command specifications to use target project's build tools, task runners, and CLI conventions (e.g., `mix` commands become `make` or `npm run` commands)
- **Workflow adaptation** customizing development workflows to target the project's CI/CD system, testing framework, and deployment pipeline (GitHub Actions, GitLab CI, Jenkins, etc.)
- **Quality gate protocol customization** adapting quality enforcement rules to use target-language linting tools, formatters, and testing frameworks while preserving the enforcement intent
- **Template library management** maintaining versioned template libraries for each supported language and framework combination, enabling consistent and high-quality output generation

## Technical Architecture

The Template Generator uses a template composition architecture where base templates are combined with language-specific overlays and project-specific customizations to produce final output.

```elixir
defmodule AIAD.TemplateGenerator do
  @template_base_path "templates/"

  def generate(adapted_components, project_analysis) do
    claude_md = generate_claude_md(project_analysis)
    agents = adapt_agent_templates(adapted_components.agents, project_analysis)
    commands = adapt_command_templates(adapted_components.commands, project_analysis)
    workflows = adapt_workflow_templates(adapted_components.workflows, project_analysis)

    {:ok, %{
      claude_md: claude_md,
      agents: agents,
      commands: commands,
      workflows: workflows,
      total_files: count_output_files(agents, commands, workflows) + 1
    }}
  end

  defp generate_claude_md(analysis) do
    base = load_template("claude_md/base.md.eex")
    language_section = load_template("claude_md/#{analysis.language}.md.eex")
    framework_section = load_template("claude_md/#{analysis.framework}.md.eex")
    quality_section = build_quality_section(analysis.capabilities)

    EEx.eval_string(base, assigns: [
      project_name: analysis.project_name,
      language_section: language_section,
      framework_section: framework_section,
      quality_section: quality_section,
      capabilities: analysis.capabilities
    ])
  end
end
```

The template library uses EEx (Embedded Elixir) templates with conditional sections that activate based on detected project characteristics. The base `CLAUDE.md` template includes universal sections (project overview, NM/ND doctrine, quality gates) while language-specific and framework-specific overlays add targeted guidance. This layered approach ensures that generated configurations are comprehensive without being bloated with irrelevant sections.

Template versioning tracks which template version was used to generate each output file, enabling future updates when template improvements are available. The versioning system supports incremental regeneration -- updating only the sections affected by template changes without disrupting project-specific customizations.

## Decision Framework

| Template Decision | Input Signal | Output |
|------------------|-------------|--------|
| Coding standards section | Detected language | Language-specific style guide |
| Testing section | Detected test framework | Framework-specific test conventions |
| CI/CD section | Detected CI system | System-specific pipeline configuration |
| Quality gates | Detected linting/formatting tools | Tool-specific quality check commands |
| Workflow commands | Detected build system | Build-system-specific command syntax |
| Missing capability | Capability gap detected | Recommended tool with setup instructions |

## Authority Level

**L3** - Strategic Command. The Template Generator holds multi-domain coordination authority for configuration generation across all supported target environments. This permits the agent to access template libraries for all supported languages and frameworks, coordinate with the Adaptation Engine for component-level customization, and produce output files that span multiple AIAD artifact types (agents, commands, workflows, protocols).

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [adr-specialist](/agents/adr-specialist/) | ADR Integration | Generates ADR templates appropriate for the target project |
| [architecture-decision-specialist](/agents/architecture-decision-specialist/) | Architecture Guidance | Provides architectural decision patterns for template content |
| [Code Review Specialist Agent v2.0](/agents/code-review-specialist-agent-v20/) | Quality Standards | Contributes code review standards to generated quality gates |
| [AIAD Adaptation Engine Agent](/agents/aiad-adaptation-engine-agent/) | Pipeline Predecessor | Provides adapted components for template generation |
| [AIAD Injection Coordinator Agent](/agents/aiad-injection-coordinator-agent/) | Pipeline Orchestrator | Coordinates template generation within knowledge transfer pipeline |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **CLAUDE.md generation** | < 5s | < 10s | Time to generate tailored master configuration |
| **Agent template adaptation** | < 200ms/agent | < 500ms/agent | Per-agent template adaptation time |
| **Total template output** | < 15s | < 30s | Time for complete template generation pass |
| **Template accuracy** | > 95% | > 90% | Syntactic and semantic correctness of generated files |
| **Supported languages** | 7 | 7+ | Languages with complete template libraries |
| **Template library size** | > 50 templates | > 40 | Total template files across all languages |

## Enforcement

All template generation operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Generated `CLAUDE.md` files must include the NM/ND doctrine section regardless of target project type -- quality enforcement is universal. Generated code examples must be syntactically valid in the target language, verified through automated parsing. Template outputs are validated against the AIAD schema to ensure that generated specifications are structurally correct. Every generated file includes provenance metadata documenting which template version and project analysis produced it, ensuring full traceability from output to input.

## Related Resources

- [AIAD Standard](/capabilities/aiad-standard/) -- Specification standard defining template outputs
- [AIAD Injection Coordinator Agent](/agents/aiad-injection-coordinator-agent/) -- Pipeline orchestrator consuming generated templates
- [ADR Specialist](/agents/adr-specialist/) -- Architecture decision governance integrated into templates
- [Technologies](/technologies/) -- Technology stack informing template content
- [Commands](/commands/) -- Commands adapted for target project syntax
- [Applications](/apps/) -- Platform applications providing reference implementations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)