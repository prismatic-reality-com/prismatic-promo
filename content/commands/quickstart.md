+++
title = "/quickstart"
weight = 130
[extra]
category = "Development"
description = "Project quickstart scaffolding and boilerplate generation"
syntax = "/quickstart [options]"
authority = "L2+"
agent = "quickstart-generator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1091
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quickstart", "Project", "commands", "Development", "Prismatic Platform", "Generated", "Phase", "AIAD", "LiveView"]
tags = ["commands", "development", "quickstart", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/quickstart - Prismatic Platform"
+++

## Overview

**/quickstart** is a production command in the **Development** category of the Prismatic Platform. It generates complete, production-ready scaffolding for new umbrella applications, modules, LiveView pages, API endpoints, and other common platform components. Every generated artifact complies with the platform's quality standards from the moment of creation: typespecs are present, tests are included, documentation is written, [Credo](@/glossary/credo.md) passes, and the code compiles with zero warnings. The command eliminates the gap between "new file created" and "file meets platform standards."

This command operates under the **L2+** authority level and is executed by the `quickstart-generator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level allows any developer to scaffold new components without elevated permissions, while the generated code automatically inherits platform-wide quality enforcement.

In a platform with 90+ umbrella applications and strict quality gates, manually creating new components requires knowledge of dozens of conventions: file locations, module naming, supervision tree integration, test structure, quality DNA initialization, and CLAUDE.md documentation. `/quickstart` encodes all of this institutional knowledge into templates that produce correct, complete scaffolding every time. This encoding of institutional knowledge into executable templates is a key productivity multiplier: it reduces the time from "I need a new component" to "I have a fully compliant component" from hours to seconds.

## Syntax and Usage

```bash
/quickstart --type=<component_type> --name=<name> [options]
```

The command requires a component type and name, with optional parameters for customization.

```bash
# Create a new umbrella application
/quickstart --type app --name prismatic_analytics

# Create a new Elixir module
/quickstart --type module --name PrismaticAnalytics.Aggregator

# Create a LiveView page
/quickstart --type liveview --name Analytics --path /analytics

# Create a GenServer
/quickstart --type genserver --name PrismaticAnalytics.Worker

# Create an API endpoint
/quickstart --type api-endpoint --name analytics --actions list,show,create

# Create an AIAD agent
/quickstart --type agent --name analytics-specialist

# Dry run (show what would be generated)
/quickstart --type app --name prismatic_test --dry-run

# Generate with verbose output
/quickstart --type module --name PrismaticTest.Foo --verbose

# Create a context with schema and migration
/quickstart --type context --name Analytics --schema Metric --fields "name:string,value:float,timestamp:utc_datetime_usec"

# Create a Mix task for data export
/quickstart --type mix-task --name analytics.export --description "Export analytics data to CSV"
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--type` | enum | required | Component type (see supported types) |
| `--name` | string | required | Component name (module name or app name) |
| `--description` | string | auto | Description for documentation |
| `--path` | string | auto | Route path (for LiveView/controller) |
| `--layout` | enum | `default` | Layout template: `default`, `sidebar`, `dashboard` |
| `--actions` | string | `index,show` | Controller/API actions to generate |
| `--fields` | string | none | Schema fields (name:type format) |
| `--app` | string | auto | Target umbrella application |
| `--dry-run` | flag | false | Preview generated files without writing |
| `--verbose` | flag | false | Show detailed generation progress |
| `--no-tests` | flag | false | Skip test file generation |
| `--no-docs` | flag | false | Skip documentation generation |
| `--force` | flag | false | Overwrite existing files |
| `--template` | string | default | Custom template name |

### Supported Component Types

| Component | Generated Files | Description |
|-----------|----------------|-------------|
| **app** | mix.exs, application.ex, supervisor, CLAUDE.md, quality DNA | Complete umbrella application |
| **module** | .ex, _test.exs | Elixir module with typespecs and tests |
| **liveview** | live.ex, live.html.heex, _test.exs | Phoenix LiveView page |
| **controller** | controller.ex, view.ex, templates, _test.exs | Phoenix controller stack |
| **context** | context.ex, schema.ex, migration, _test.exs | Phoenix context with schema |
| **genserver** | genserver.ex, _test.exs | OTP GenServer with supervision |
| **agent** | .agent.md, .cmd.md | AIAD agent and command specification |
| **api-endpoint** | controller.ex, schema.ex, _test.exs | REST API endpoint with OpenApiSpex |
| **mix-task** | task.ex, _test.exs | Mix task with help text and tests |

## Implementation Architecture

The quickstart system is template-driven with configurable generators for each component type.

```
             /quickstart
                   |
          Component Classifier
                   |
          +--------+--------+
          |        |        |
       Template  Context   Validator
       Selector  Builder   Engine
          |        |        |
          +--------+--------+
                   |
           Template Renderer
                   |
          +--------+--------+
          |        |        |
       File      Config   Integration
       Writer    Updater   Linker
          |        |        |
          +--------+--------+
                   |
           Quality Validator
                   |
           Output Summary
```

### Execution Phases

**Phase 1 -- Input Validation**: The command validates all inputs: component type is supported, name follows platform conventions (PascalCase for modules, snake_case for applications), path does not conflict with existing routes, and target location is correct.

**Phase 2 -- Context Building**: A template context is assembled containing: module names, file paths, application configuration, test module names, documentation templates, and platform-specific metadata (quality DNA defaults, AIAD compliance markers).

**Phase 3 -- Template Rendering**: Templates are rendered with the context. Each template produces one or more files. Templates include conditional sections based on options (e.g., sidebar layout includes navigation components).

**Phase 4 -- File Writing**: Generated files are written to the filesystem. For umbrella applications, this includes creating directory structures, updating the umbrella mix.exs, and initializing git tracking. Existing files are never overwritten unless `--force` is specified.

**Phase 5 -- Integration Linking**: The generated component is integrated into the platform: umbrella applications are added to the workspace, routes are registered in the router, supervision trees are updated, and Quality DNA is initialized.

**Phase 6 -- Quality Validation**: The generated code is immediately validated through the quality gate pipeline. Every generated file must pass compilation, Credo, and typespec checks. If validation fails, the generation is rolled back and the template bug is reported.

## Examples

### Complete Application Scaffold

```bash
/quickstart --type app --name prismatic_analytics --description "Real-time analytics engine"
# Creates:
#   apps/prismatic_analytics/mix.exs
#   apps/prismatic_analytics/lib/prismatic_analytics.ex
#   apps/prismatic_analytics/lib/prismatic_analytics/application.ex
#   apps/prismatic_analytics/lib/prismatic_analytics/supervisor.ex
#   apps/prismatic_analytics/test/prismatic_analytics_test.exs
#   apps/prismatic_analytics/test/test_helper.exs
#   apps/prismatic_analytics/CLAUDE.md
#   apps/prismatic_analytics/.claude/quality-dna/current-state.json
# All files compile with zero warnings, pass Credo, include typespecs
```

### LiveView Dashboard with Sidebar

```bash
/quickstart --type liveview --name AnalyticsDashboard --path /analytics --layout sidebar
# Creates LiveView module, template, and test with sidebar navigation
# pre-configured for TailwindCSS and Flowbite components
```

### AIAD Agent Specification

```bash
/quickstart --type agent --name analytics-specialist
# Creates:
#   .aiad/agents/analytics-specialist.agent.md
#   .aiad/commands/analytics.cmd.md
# Both files follow AIAD standard format with enforcement blocks
```

## Integration with Platform

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/code](@/commands/code.md) | Downstream | Scaffolded code is then developed via /code |
| [/test](@/commands/test.md) | Downstream | Generated tests are run via /test |
| [/quality-gates](@/commands/quality-gates.md) | Validation | Generated code must pass quality gates |
| [Quality DNA](@/glossary/quality-dna.md) | Initialization | Quality DNA created for new applications |
| [AIAD Registry](@/glossary/aiad.md) | Registration | Generated agents registered in AIAD index |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Generation metrics tracked |
| Umbrella Mix.exs | Configuration | New applications added to umbrella deps |
| Phoenix Router | Route registration | New LiveViews/controllers registered |

## Workflow Integration

The /quickstart command serves as the starting point for all new component development:

1. **New Feature Development**: Begin by scaffolding the required components (module, LiveView, context), then implement business logic using [/code](@/commands/code.md). The scaffold ensures the correct structure exists before development begins.

2. **New Application Creation**: When a feature set grows large enough to warrant its own umbrella application, `/quickstart --type app` creates the complete application structure with all platform conventions pre-applied.

3. **API Expansion**: Adding new API endpoints follows the pattern: scaffold with `/quickstart --type api-endpoint`, implement business logic, verify with [/test](@/commands/test.md), then deploy.

4. **Agent Registration**: New AIAD agents are scaffolded with `/quickstart --type agent`, ensuring they follow the standard specification format and are immediately discoverable by the agent registry.

5. **TDD Workflow**: Generated test files include basic structure and edge case placeholders. Fill in the test cases before implementing the actual logic (Test-Driven Development approach).

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Generated code meets 100% quality standards from creation. No placeholder implementations, no TODO stubs, no missing typespecs.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Generated scaffolding is validated through the quality gate pipeline before delivery. Any generation failure is rolled back completely.

NABLA axiom compliance:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | Every generated file includes generation metadata (template, version, timestamp) |
| **Signal Plurality** | Multiple validation checks (compile, Credo, typespec) confirm quality |
| **Evidence-Based** | Quality gate results provide empirical evidence of scaffold correctness |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Input validation | < 1s | ~100ms |
| Template rendering | < 5s | ~1s |
| File writing | < 3s | ~500ms |
| Quality validation | < 30s | ~10s |
| Total (module) | < 15s | ~5s |
| Total (application) | < 60s | ~20s |
| Total (LiveView) | < 30s | ~10s |

The quality validation phase dominates execution time for new applications, as it requires compilation of the newly generated code. For simpler components (modules, mix tasks), the total execution time is under 5 seconds.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/ui-enhance](@/commands/ui-enhance.md) - UI/UX enhancement with [TailwindCSS](@/glossary/tailwindcss.md) and [Flowbite](@/glossary/flowbite.md)
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)