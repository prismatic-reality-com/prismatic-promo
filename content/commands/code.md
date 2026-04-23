+++
title = "/code"
weight = 50
[extra]
category = "Development"
description = "Core coding implementation and feature development"
syntax = "/code [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 848
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["code", "Core", "commands", "Development", "Prismatic Platform", "Review", "Zero"]
tags = ["commands", "development", "code", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/code - Prismatic Platform"
+++

## Overview

**/code** is a production command in the **Development** category of the Prismatic Platform and serves as the primary entry point for all code generation, feature implementation, and development tasks. This is the most frequently used command in the platform's 216-command arsenal, providing intelligent, multi-agent code generation with automated quality assurance, requirement refinement, and agent discovery that matches domain specialists to each coding task.

The `/code` command transforms a natural language description of a feature, bug fix, or refactoring task into a complete, production-ready implementation with tests, documentation, and quality validation. Rather than generating code in isolation, the command orchestrates a team of specialist agents -- implementation leads, domain experts, QA reviewers, and testing specialists -- who collaborate through a six-phase pipeline from request analysis through deliverable presentation.

This command operates under the **L2+** authority level and is executed by the `elixir-core-specialist` agent as the primary implementation lead, with dynamic agent discovery selecting additional specialists based on the coding request. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command enforces mandatory quality gates: no code is delivered without passing compilation, Credo analysis, Dialyzer type checking, and comprehensive test coverage.

The interactive validation phase ensures that implementations match developer intent before code generation begins. Users can continue with the proposed approach, refine requirements, adjust the implementation strategy, or proceed directly to generation -- maintaining developer control while leveraging the full power of multi-agent collaboration.

## Architecture

The `/code` command uses a six-phase pipeline architecture with intelligent agent discovery at its core.

```
USER INPUT ("Add Redis caching to storage adapters")
    |
    v
PHASE 1: REQUEST ANALYSIS & AGENT DISCOVERY
    |-- Parse code request
    |-- Identify affected systems/layers
    |-- Auto-discover relevant specialists
    |-- Select optimal agent team
    |
PHASE 2: REQUIREMENT REFINEMENT
    |-- Extract technical requirements
    |-- Agent-based requirement expansion
    |-- Generate acceptance criteria
    |-- Develop testing strategy
    |
PHASE 3: INTERACTIVE VALIDATION
    |-- Display refined requirements
    |-- Present implementation options
    |-- [C]ontinue / [R]efine / [A]djust / [P]roceed
    |
PHASE 4: CODE GENERATION
    |-- Multi-agent collaborative coding
    |-- Domain-specific implementations
    |-- Test generation (unit, integration)
    |-- Documentation generation
    |
PHASE 5: QUALITY ASSURANCE
    |-- mix format --check-formatted
    |-- mix credo --strict
    |-- mix test (all generated tests)
    |-- mix dialyzer
    |
PHASE 6: DELIVERABLE PRESENTATION
    |-- Source files, test files, docs
    |-- Quality reports
    |-- Deployment instructions
```

### Agent Team Composition

| Role | Agents | Selection Criteria |
|------|--------|-------------------|
| **Implementation Lead** | `elixir-core-specialist`, `phoenix-liveview-specialist`, `database-core-specialist` | Primary technology stack |
| **Domain Specialists** | `storage-core-architect`, `backend-performance-engineer`, `frontend-dashboard-specialist` | Affected subsystems |
| **QA Review** (mandatory) | `qa-review-specialist` | Always included |
| **QA Testing** (mandatory) | `qa-testing-specialist` | Always included |
| **Optional** | `security-specialist`, `backend-performance-engineer` | Based on request analysis |

## Usage

### Feature Implementation

```bash
# New feature with detailed description
/code "Add Redis caching layer to storage adapters for improved read performance"

# LiveView component implementation
/code "Create real-time dashboard widget showing agent execution metrics"

# API endpoint implementation
/code "Add REST endpoint for bulk asset import in Perimeter module"
```

### Bug Fixes

```bash
# Fix with auto-discovered specialists
/code "Fix memory leak in LiveView dashboard when subscribing to real-time updates"

# Targeted fix with scope
/code "Fix GenServer timeout in orchestrator module for large batch operations"
```

### Refactoring

```bash
# Structural refactoring
/code "Refactor storage adapter contract tests to use property-based testing"

# Performance refactoring
/code "Optimize ETS adapter query performance for large result sets"
```

### Infrastructure Code

```bash
# Configuration and setup
/code "Add Prometheus metrics exporter with custom telemetry handlers"

# Mix task creation
/code "Create mix task for database migration verification with rollback testing"
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `request` | string | required | Feature description, bug fix, or refactoring task |
| `--scope` | string | auto-detected | Limit to specific app or module |
| `--type` | string | auto-detected | Force type: feature, bugfix, refactor, test |
| `--agents` | string | auto-discovered | Override agent selection |
| `--skip-review` | boolean | false | Skip interactive validation (not recommended) |
| `--tests-only` | boolean | false | Generate only tests for existing code |
| `--docs-only` | boolean | false | Generate only documentation |

## Execution Flow

```
PHASE 1: REQUEST ANALYSIS (30s - 2 min)
    |-- Classify request type (feature/bugfix/refactor/test)
    |-- Identify affected layers (frontend/backend/database/api)
    |-- Extract technologies (Elixir/Phoenix/LiveView/Ecto)
    |-- Assess complexity (simple/medium/complex)
    |-- Identify testing needs
    |
PHASE 2: REQUIREMENT REFINEMENT (1-3 min)
    |-- Extract functional requirements
    |-- Extract non-functional requirements (performance, security)
    |-- Identify dependencies and constraints
    |-- Generate acceptance criteria
    |-- Develop testing strategy
    |
PHASE 3: INTERACTIVE VALIDATION (user-driven)
    |-- Present refined requirements
    |-- Show selected agent team with rationale
    |-- Display implementation approach options
    |-- Await user decision:
    |     [C] Continue with current approach
    |     [R] Refine requirements further
    |     [A] Adjust implementation strategy
    |     [P] Proceed to code generation
    |     [E] Exit and save refinement
    |
PHASE 4: CODE GENERATION (5-30 min)
    |-- Implementation lead generates core code
    |-- Specialists enhance domain-specific aspects
    |-- QA tester generates test suites
    |-- Documentation generated inline and separately
    |-- Initial code review by QA reviewer
    |
PHASE 5: QUALITY ASSURANCE (2-5 min)
    |-- Gate 1: Code style (mix format)
    |-- Gate 2: Static analysis (mix credo --strict)
    |-- Gate 3: Type checking (mix dialyzer)
    |-- Gate 4: Test execution (mix test)
    |-- Gate 5: Security scan (sobelow)
    |-- ALL GATES MUST PASS
    |
PHASE 6: DELIVERABLE PRESENTATION
    |-- Present generated source files
    |-- Show test results with coverage
    |-- Display quality gate results
    |-- Provide deployment instructions
    |-- Suggest next steps
```

## Quality Gates (Mandatory)

Every code generation must pass all five gates before delivery:

| Gate | Tool | Criteria | Blocking |
|------|------|----------|----------|
| **Code Style** | `mix format` | Properly formatted | Yes |
| **Static Analysis** | `mix credo --strict` | Zero issues | Yes |
| **Type Checking** | `mix dialyzer` | Zero warnings | Yes |
| **Testing** | `mix test` | All passing, 80%+ coverage | Yes |
| **Security** | `sobelow` | No security issues | Yes |

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Multi-agent collaboration | Dynamic team assembly |
| AIAD Registry | Agent discovery | Registry-based specialist selection |
| [Quality Gates](@/glossary/quality-gates.md) | Mandatory validation | All gates must pass |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Generation time, quality scores |
| Git Integration | Pre-commit validation | `.githooks/pre-commit` enforcement |
| CI/CD Pipeline | Post-generation validation | GitLab CI quality checks |

## Best Practices

1. **Be Specific in Requests**: "Add Redis caching to storage adapters" is better than "improve performance." Specific requests produce better agent selection and requirement refinement.

2. **Use Interactive Validation**: Do not skip the interactive phase with `--skip-review`. The refinement step catches misunderstandings before code generation begins, saving significant time.

3. **Review Generated Tests First**: Before examining implementation code, review the generated tests to verify they match your understanding of the requirements.

4. **One Feature Per Request**: Submit focused, single-feature requests rather than multi-feature bundles. The agent team selection is optimized for focused tasks.

5. **Provide Context for Bug Fixes**: Include error messages, stack traces, or reproduction steps in bug fix requests for more accurate root cause analysis.

6. **Iterate with Refinement**: If the initial implementation does not match intent, use the [R]efine option to adjust requirements rather than starting over with a new request.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `AGENT_DISCOVERY_FAILED` | No suitable specialist found | Provide more specific request description |
| `QUALITY_GATE_FAILED` | Generated code fails validation | Review gate output, adjust implementation |
| `COMPILATION_ERROR` | Generated code has syntax errors | Automatic retry with fix, or manual intervention |
| `TEST_FAILURE` | Generated tests fail | Review test assumptions, adjust implementation |
| `TIMEOUT` | Complex generation exceeded time limit | Break request into smaller tasks |

## Advanced Usage

### Deliverable Package Structure

```
code-deliverable-[timestamp]/
  source/
    lib/
      [new_module].ex
      [modified_module].ex
    config/
      [config_changes].exs
  test/
    [module]_test.exs
    [integration]_test.exs
  docs/
    IMPLEMENTATION.md
    API.md
  quality-reports/
    code-review.md
    test-results.txt
    credo-report.txt
    dialyzer-report.txt
  SUMMARY.md
```

### Auto-Update Agent Registry

The `/code` command automatically refreshes its agent discovery index when the AIAD agent registry changes, ensuring that new specialist agents are immediately available for team composition.

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Request Analysis | 30s - 2 min | Complexity-dependent |
| Requirement Refinement | 1-3 min | Agent collaboration overhead |
| Code Generation | 5-30 min | Scales with complexity |
| Quality Assurance | 2-5 min | Full gate execution |
| Total Pipeline | 10-40 min | End-to-end for typical feature |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every line of generated code must pass all five quality gates. No stubs, mocks, or placeholder implementations are delivered.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The requirement refinement phase ensures complete understanding before generation begins. Interactive validation confirms developer intent.

## Related Commands

- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/debug-investigation](@/commands/debug-investigation.md) - Comprehensive debugging investigation
- [/debug-types](@/commands/debug-types.md) - Troubleshoot Dialyzer type inference issues
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)