+++
title = "scripts-infrastructure-supreme"
weight = 360
[extra]
domain = "mycelial-propagation"
level = "L1"
description = "Supreme authority over infrastructure scripting, build tooling, and deployment automation across the entire Prismatic Platform"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["mycelial-network", "seadf", "aiad", "supervision-tree", "dynamic-supervisor", "process-isolation", "message-passing", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "ecosystem"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["scripts-infrastructure-supreme", "Supreme", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "Shell"]
tags = ["agents", "agent", "scripts-infrastructure-supreme", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "scripts-infrastructure-supreme - Prismatic Platform"
+++

## Overview

The scripts-infrastructure-supreme operates as an L1 Supreme Authority within the Prismatic Platform's mycelial-propagation domain, governing all infrastructure scripting, build system automation, deployment pipelines, and operational tooling that forms the connective tissue of the platform's 90-application [umbrella architecture](/glossary/umbrella-application/). In a platform of this scale, infrastructure scripts are not mere convenience utilities -- they are load-bearing components that every developer session, CI/CD pipeline, and production deployment depends upon. This agent ensures that every script is production-grade, idempotent, well-documented, and subject to the same quality standards as application code.

Built on the [AIAD](/glossary/aiad/) standard and operating under the [NO MERCY](/glossary/no-mercy/) doctrine, the scripts-infrastructure-supreme treats infrastructure as code with absolute rigor. Shell scripts undergo static analysis, Mix tasks are tested and typespec'd, deployment automation includes rollback capabilities, and all tooling integrates with the platform's [telemetry](/glossary/telemetry/) infrastructure for observability. The agent's L1 authority reflects the critical nature of infrastructure -- a broken deployment script or misconfigured build tool can cascade across every application in the umbrella.

## Operational Domain

The mycelial-propagation domain encompasses the infrastructure layer that connects and sustains all platform applications, analogous to the mycelial network in biological ecosystems that distributes nutrients between organisms. This domain covers shell scripts in `scripts/`, Mix tasks across all applications, Git hooks in `.githooks/`, CI/CD pipeline configurations, Docker build infrastructure, release management tooling, and developer environment setup automation. The agent manages the propagation of infrastructure changes across the platform, ensuring that updates to shared tooling are consistently applied and that no application is left with stale or incompatible infrastructure dependencies.

The domain also includes the platform's Git Trees infrastructure (`scripts/git-trees.sh` and `mix git_trees`), which provides 100x faster codebase exploration compared to traditional file system traversal -- a critical capability for a codebase exceeding 37,000 files and 2.8 million lines of code.

## Key Capabilities

- **Shell script governance** -- Enforces consistent patterns across all shell scripts including proper error handling (`set -euo pipefail`), argument validation, help text generation, and exit code semantics. Every script in `scripts/` must be executable, self-documenting, and idempotent where applicable
- **Mix task architecture** -- Designs and maintains the platform's extensive Mix task ecosystem, ensuring tasks follow [OTP](/glossary/otp/) conventions, accept consistent argument formats, provide `--help` output, and integrate with the quality gate pipeline
- **Git hook management** -- Maintains the multi-phase pre-commit hook system in `.githooks/` that enforces compilation warnings, Credo compliance, template validation, design consistency, and regression prevention before any commit reaches the repository
- **Deployment automation** -- Governs Fly.io deployment scripts, Docker build configurations, and release tooling that takes applications from development through staging to production with zero-downtime guarantees
- **Developer environment setup** -- Manages onboarding automation that configures shell environments, installs dependencies, sets up database connections, and validates that a developer's local environment matches production requirements
- **[Autonomous self-healing](/capabilities/autonomous-self-healing/)** with automatic detection and repair of broken infrastructure components through the [SEADF](/glossary/seadf/) evolution framework
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing infrastructure health metrics under the `:prismatic, :infrastructure` namespace

## Architecture and Design Principles

The scripts-infrastructure-supreme enforces several architectural principles across all infrastructure components. First, every script must be idempotent -- running it multiple times produces the same result as running it once. This property is essential for CI/CD reliability where pipeline stages may be retried. Second, all scripts must fail loudly and early, using strict error handling to prevent silent failures that could corrupt deployment state.

The agent maintains a layered infrastructure architecture where low-level shell scripts provide atomic operations, Mix tasks compose those operations into domain-specific workflows, and CI/CD configurations orchestrate tasks into complete pipelines. This separation enables testing at each layer independently while maintaining composability.

| Layer | Implementation | Examples |
|-------|---------------|----------|
| **Atomic Operations** | Shell scripts in `scripts/` | `git-trees.sh`, `deploy-dd-data.sh`, `setup-mcp-servers.sh` |
| **Domain Workflows** | Mix tasks in `apps/*/lib/mix/tasks/` | `mix quality.gates`, `mix autoheal.cycle`, `mix promo.enhance` |
| **Pipeline Orchestration** | CI/CD configurations | `.gitlab-ci.yml`, GitHub Actions workflows |
| **Developer Tooling** | Environment setup | Shell aliases, editor configs, hook installation |

## Authority Level

**L1** - Supreme Authority - Platform-wide strategic and tactical control over all infrastructure scripting and automation. This agent has override authority over any infrastructure change proposed by lower-level agents and can mandate infrastructure standards that all applications must comply with.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/scripts status` | Display health status of all infrastructure scripts and hooks | L1+ |
| `/scripts audit` | Audit all scripts for compliance with infrastructure standards | L1+ |
| `/scripts validate` | Run validation suite across all shell scripts and Mix tasks | L1+ |
| `/infrastructure deploy` | Execute deployment pipeline with full verification | L1+ |
| `/infrastructure hooks` | Verify and reinstall Git hook infrastructure | L2+ |

## Integration with Platform Systems

The scripts-infrastructure-supreme integrates with virtually every platform system given the foundational nature of infrastructure tooling.

| System | Integration Point |
|--------|------------------|
| **Quality Gates** | Pre-commit hooks enforce all quality checks before code reaches the repository |
| **[SEADF](/glossary/seadf/)** | Infrastructure evolution triggered by `mix autoevolve` pipeline integration |
| **[Mycelial Network](/glossary/mycelial-network/)** | Script propagation follows mycelial pathways for cross-application distribution |
| **CI/CD Pipeline** | All pipeline stages execute infrastructure scripts managed by this agent |
| **[Telemetry](/glossary/telemetry/)** | Infrastructure metrics feed into platform-wide observability dashboards |
| **Developer Experience** | Environment setup scripts reduce onboarding time from hours to minutes |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [seadf-ecosystem-commander](/agents/seadf-ecosystem-commander/) | Receives evolution directives that trigger infrastructure adaptation |
| [code-quality-commander](/agents/code-quality-commander/) | Infrastructure scripts enforce quality gates defined by the quality commander |
| [shell-setup-specialist](/agents/shell-setup-specialist/) | Delegates developer shell environment configuration to the setup specialist |
| [source-archive-specialist](/agents/source-archive-specialist/) | Archive packaging scripts maintained under infrastructure governance |

## Quality Standards and Enforcement

All infrastructure scripts managed by this agent must meet rigorous quality standards enforced through automated validation.

| Standard | Requirement | Enforcement |
|----------|-------------|-------------|
| **Error Handling** | `set -euo pipefail` in all shell scripts | Pre-commit hook Phase 1 |
| **Documentation** | Usage text via `--help` flag | Automated audit scan |
| **Idempotency** | Multiple executions produce same result | Integration test suite |
| **Exit Codes** | Meaningful exit codes (0 success, 1 general, 2 usage) | Static analysis |
| **Permissions** | Correct executable permissions (`chmod +x`) | Git hook validation |
| **Shellcheck** | Zero warnings from shellcheck analysis | CI pipeline gate |

The [NO MERCY](/glossary/no-mercy/) doctrine mandates that infrastructure failures are treated with the same severity as application bugs. A broken deployment script is a production-blocking defect, a missing Git hook is a quality regression vector, and an undocumented Mix task is a maintenance liability. No infrastructure component is permitted to exist outside the quality gate framework.

## Evolutionary Adaptation

Through [SEADF](/glossary/seadf/) integration, the scripts-infrastructure-supreme continuously evolves infrastructure tooling based on observed usage patterns, failure modes, and developer feedback. When a script consistently triggers errors in CI, the agent analyzes failure patterns and proposes hardening changes. When new applications are added to the umbrella, infrastructure templates are automatically propagated to ensure consistent tooling coverage. This evolutionary approach ensures that infrastructure keeps pace with the platform's growth trajectory from 90 applications toward its expansion roadmap.

## Related Agents

Agents in the **mycelial-propagation** domain work together to maintain the connective infrastructure that enables the entire platform ecosystem to function as a cohesive unit rather than a collection of isolated applications. The scripts-infrastructure-supreme provides the L1 authority that ensures infrastructure standards are universally applied and consistently maintained across all 37,000+ files in the platform.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)