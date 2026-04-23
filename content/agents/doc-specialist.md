+++
title = "doc-specialist"
weight = 138
[extra]
domain = "development"
level = "L3"
description = "Autonomous documentation generation agent with multi-format output and quality enforcement"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["doc-specialist", "Autonomous", "agents", "agent", "Prismatic Platform", "Documentation", "The Doc", "Specialist", "Doc Specialist", "CLAUDE"]
tags = ["agents", "agent", "doc-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "doc-specialist - Prismatic Platform"
+++

## Overview

The Doc Specialist operates as an L3 strategic command agent within the Development domain of the Prismatic Platform. This agent handles all documentation generation, maintenance, and quality enforcement across the platform's codebase of over 6,600 [Elixir](/glossary/elixir/) source files and 11,300 documentation files. Documentation in the Prismatic Platform is not optional supplementary material -- it is a mandatory quality artifact subject to the same [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) enforcement as production code. Every public function requires `@doc` and `@spec` annotations, every module requires `@moduledoc`, and every application requires a `CLAUDE.md` guide.

The [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard mandates comprehensive documentation at every level of the platform architecture. The Doc Specialist enforces these requirements while also generating documentation content that meets academic quality standards. Generated documentation is not boilerplate -- it explains the "why" behind design decisions, describes the behavioral contracts of modules and functions, and provides usage examples that demonstrate correct integration patterns.

In a platform with 90 [umbrella application](/glossary/umbrella-application/)s and 430+ autonomous agents, documentation serves as the primary knowledge transfer mechanism between components. Agents that need to interact with a module rely on its documentation to understand its interface contracts, error handling behavior, and configuration requirements. Poor documentation creates integration failures. The Doc Specialist prevents this by maintaining documentation quality as aggressively as the platform maintains code quality.

## Operational Domain

The Development domain encompasses all software engineering activities within the platform. The Doc Specialist focuses specifically on documentation as a development artifact, treating it with the same rigor as source code. This includes API documentation, architectural decision records, module guides, configuration references, and inline code comments that explain non-obvious behavior.

Documentation in the platform exists at five levels: inline comments (explaining "why" at the code level), function documentation (`@doc` with examples), module documentation (`@moduledoc` with behavior descriptions), application documentation (`CLAUDE.md` with architecture and usage), and platform documentation (cross-cutting architectural guides). The Doc Specialist generates and maintains content at all five levels.

## Key Capabilities

The Doc Specialist provides six core documentation capabilities spanning generation, validation, and maintenance.

**Module documentation generation** produces comprehensive `@moduledoc` content for [Elixir](/glossary/elixir/) modules, describing the module's purpose, its role within the application, its dependencies, its public interface, and its behavioral contracts. Generated module docs include usage examples that demonstrate correct integration patterns and common pitfalls to avoid.

**Function documentation generation** creates `@doc` content for public functions, including parameter descriptions, return value specifications, error conditions, and usage examples. Function docs explicitly describe side effects, process message requirements for [GenServer](/glossary/genserver/) functions, and [Ecto](/glossary/ecto/) changeset behavior for database-related functions.

**Type specification enforcement** validates that every public function has a corresponding `@spec` annotation and that the specification accurately describes the function's type signature. The agent generates type specifications when they are missing and flags specifications that are too broad (overly permissive) or inconsistent with the actual implementation.

**Application guide generation** produces `CLAUDE.md` files for each umbrella application, documenting the application's purpose, architecture, key modules, configuration, testing approach, and integration points. These guides serve as the entry point for any agent or developer working with the application for the first time.

**Documentation quality scoring** evaluates existing documentation against quality criteria including completeness (all public symbols documented), accuracy (docs match implementation), clarity (readable by target audience), and currency (docs updated with recent code changes). Quality scores identify documentation that needs enhancement.

**Cross-reference validation** verifies that documentation references -- links to other modules, function references, glossary terms -- resolve correctly and point to current content. Broken references degrade documentation utility and are treated as documentation defects requiring immediate correction.

## Documentation Standards

The platform enforces explicit documentation standards at each level.

| Level | Requirement | Enforcement | Tool |
|-------|-------------|-------------|------|
| Inline comments | Explain "why", not "what" | Code review | Manual + agent review |
| `@doc` | All public functions | Blocking | Credo + Doc Specialist |
| `@spec` | All public functions | Blocking | Dialyzer + Doc Specialist |
| `@moduledoc` | All modules | Blocking | Credo + Doc Specialist |
| `CLAUDE.md` | All applications | Blocking | Quality gates |

## Documentation Generation Pipeline

The Doc Specialist generates documentation through a structured pipeline that ensures accuracy and completeness.

```
Source Analysis --> Interface Extraction --> Content Generation --> Quality Check
       |                  |                       |                     |
   AST parsing       Public functions          Purpose/behavior     Completeness
   Module structure   Type specs               Examples             Accuracy
   Dependencies       Callbacks                Error conditions     Cross-refs
   Usage patterns     Configurations           Integration notes    Readability
```

The pipeline begins by analyzing the source code's AST (Abstract Syntax Tree) to understand module structure, function signatures, type specifications, and callback implementations. Interface extraction identifies all public symbols that require documentation. Content generation produces documentation text based on the code analysis combined with contextual understanding of the module's role within its application. Quality checking validates the generated documentation against platform standards.

## Documentation Formats

The Doc Specialist produces documentation in multiple formats to serve different audiences and use cases.

| Format | Audience | Content Focus |
|--------|----------|---------------|
| ExDoc annotations | Developers | API reference with examples |
| CLAUDE.md guides | Agents and developers | Application architecture and usage |
| AIAD agent specs | Agent ecosystem | Agent capabilities and integration |
| Architectural Decision Records | Architects | Design rationale and trade-offs |
| Glossary entries | All audiences | Term definitions with cross-references |

## Authority Level

**L3** - Strategic Command - The Doc Specialist operates at the strategic command level with authority to block merges that contain undocumented public interfaces, mandate documentation updates when code changes affect documented behavior, and coordinate documentation campaigns across multiple applications.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Phoenix](/glossary/phoenix/) Framework | Documentation target | Web application and [LiveView](/glossary/liveview/) component documentation |
| [Elixir](/glossary/elixir/)/[OTP](/glossary/otp/) | Language platform | ExDoc integration for API documentation generation |
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Documentation completeness as a blocking quality gate |
| ExDoc | Documentation tool | HTML documentation generation from annotations |
| [Credo](/glossary/credo/) | Static analysis | Missing documentation detection through static analysis rules |
| Git Trees | File discovery | Rapid identification of files needing documentation updates |

## Documentation Maintenance

Documentation maintenance is triggered by three events: new code creation (documentation required for all public interfaces), code modification (documentation updated to reflect behavioral changes), and periodic review (documentation quality scoring identifies stale or degraded content). The Doc Specialist monitors all three triggers and responds with appropriate documentation generation or update operations.

Documentation is treated as versioned content that must remain synchronized with the code it describes. When a function's behavior changes, its documentation must change in the same commit. When a module gains new public functions, their documentation must be present before the change merges. This synchronization is enforced through pre-commit hooks that verify documentation completeness.

## Enforcement

The Doc Specialist enforces [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine for documentation quality. Undocumented public functions block compilation through Credo's strict mode. Missing `@moduledoc` annotations trigger quality gate failures. CLAUDE.md files that fall below quality thresholds are flagged for enhancement. Documentation that contradicts the implementation is treated as a defect with the same severity as a failing test -- it must be corrected before the code merges.

## Related Agents

- [**code-specialist**](/agents/code-specialist/) (L3) - Intelligent code generation with documentation as a mandatory output
- [**database-specialist**](/agents/database-specialist/) (L3) - [PostgreSQL](/glossary/postgresql/) expertise with schema documentation requirements
- [**explain-specialist**](/agents/explain-specialist/) (L3) - Code explanation that complements generated documentation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)