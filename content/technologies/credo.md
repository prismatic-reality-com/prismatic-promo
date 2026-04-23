+++
title = "Credo"
weight = 61
[extra]
category = "testing"
description = "Static code analysis tool for enforcing consistent code quality and style in Elixir projects"
url = "https://hexdocs.pm/credo/"
version = "1.7+"
icon = "credo"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1123
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Credo", "Static", "Elixir", "technologies", "testing", "Prismatic Platform", "Hard", "Dialyzer"]
tags = ["technologies", "testing", "credo", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Credo - Prismatic Platform"
+++

## Overview

Credo is the code quality analysis tool that enforces consistent style, design, and readability standards across the Prismatic Platform's 13,000+ [Elixir](/technologies/elixir/) files. It performs static analysis to identify code smells, complexity issues, naming violations, and consistency problems -- ensuring that the platform's codebase maintains professional quality standards at scale. Where [Dialyzer](/technologies/dialyzer/) finds type-level bugs that guarantee runtime failures, Credo focuses on the human-readable qualities of code: clarity, consistency, and maintainability.

The Prismatic Platform runs Credo in strict mode as a mandatory quality gate. Zero Credo warnings are tolerated -- every issue must be resolved before code can be merged. This enforcement is part of the platform's [NO MERCY](/capabilities/no-mercy/) doctrine and is checked at three levels: in the pre-commit hook on the developer's machine, in the CI/CD pipeline on every push, and in the quality gate system (`mix quality.gates`). The result is a uniformly clean, readable codebase that any developer can navigate and understand immediately, regardless of which team member authored a particular module.

Credo's checks cover design principles (function length, cyclomatic complexity, nesting depth), consistency (naming conventions, alias ordering, module structure), readability (pipe chain formatting, string interpolation, operator spacing), and refactoring opportunities (duplicated code, unused variables, unnecessary conditions). The platform extends Credo's default checks with custom rules specific to the Prismatic Platform's coding standards, including forbidden naming patterns (no Manager, Handler, Utils modules) and mandatory documentation requirements.

## Key Features

Credo provides a comprehensive static analysis engine that evaluates code quality across multiple dimensions, from structural design to surface-level formatting.

- **Strict Mode**: Maximum enforcement of all quality checks, used as the platform's default with zero-tolerance for violations
- **Design Checks**: Function complexity, nesting depth, arity limits, and module cohesion analysis for structural quality
- **Consistency Checks**: Naming conventions, alias ordering, module attribute placement, and import grouping for uniform style
- **Readability Checks**: Pipe chain formatting, string interpolation preferences, and operator spacing for clear code
- **Refactoring Suggestions**: Unused variables, duplicated code patterns, and unnecessary conditions for continuous improvement
- **Custom Checks**: Extensible check system for project-specific rules like forbidden naming patterns and mandatory annotations
- **Priority System**: Issues categorized by severity (high, normal, low) for focused remediation and CI/CD gate integration
- **Explain Mode**: Detailed explanations for every check with good and bad code examples for developer education

| Check Category | Examples | Platform Enforcement |
|---------------|----------|---------------------|
| Design | `CyclomaticComplexity`, `Nesting`, `AliasUsage` | Hard block (max complexity: 10) |
| Readability | `MaxLineLength`, `ModuleDoc`, `StrictModuleLayout` | Hard block (max line: 100) |
| Refactoring | `FunctionArity`, `CondStatements`, `NegatedConditions` | Hard block (max arity: 5) |
| Warning | `UnsafeToAtom`, `ApplicationConfigInModuleAttribute` | Hard block (security-critical) |
| Consistency | `MultiAliasImportRequireUse`, `ParameterPatternMatching` | Soft warning (style preference) |
| Custom | No Manager/Handler/Utils naming, mandatory @moduledoc | Hard block (platform policy) |

## Platform Integration

Credo enforces code quality standards at multiple levels: in the developer's editor, in the pre-commit hook, and in the CI/CD pipeline. This multi-layered enforcement ensures that quality issues are caught as early as possible in the development workflow.

```elixir
# .credo.exs - Prismatic Platform configuration
%{
  configs: [
    %{
      name: "default",
      strict: true,
      color: true,
      checks: %{
        enabled: [
          # Design checks
          {Credo.Check.Design.AliasUsage, priority: :high},
          {Credo.Check.Design.TagTODO, exit_status: 2},
          {Credo.Check.Design.TagFIXME, exit_status: 2},

          # Readability checks
          {Credo.Check.Readability.MaxLineLength, max_length: 100},
          {Credo.Check.Readability.ModuleDoc, []},
          {Credo.Check.Readability.StrictModuleLayout, []},

          # Refactoring checks
          {Credo.Check.Refactor.CyclomaticComplexity, max_complexity: 10},
          {Credo.Check.Refactor.Nesting, max_nesting: 3},
          {Credo.Check.Refactor.FunctionArity, max_arity: 5},

          # Warning checks
          {Credo.Check.Warning.LazyLogging, false},
          {Credo.Check.Warning.UnsafeToAtom, []},
          {Credo.Check.Warning.ApplicationConfigInModuleAttribute, []}
        ],
        disabled: [
          # Disabled with justification
          {Credo.Check.Readability.AliasOrder, false}  # Conflicts with grouping by domain
        ]
      }
    }
  ]
}
```

The pre-commit hook runs Credo on changed files before allowing a commit, providing fast feedback without analyzing the entire codebase:

```bash
# .githooks/pre-commit excerpt
CHANGED_EX_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.exs\?$')
if [ -n "$CHANGED_EX_FILES" ]; then
  mix credo --strict $CHANGED_EX_FILES
  if [ $? -ne 0 ]; then
    echo "Credo violations found. Fix before committing."
    exit 1
  fi
fi
```

## Architecture

Credo fits into the platform's quality enforcement pipeline alongside [Dialyzer](/technologies/dialyzer/), [ExUnit](/technologies/exunit/), and the compilation warning system. Each tool addresses a different dimension of code quality, and together they provide comprehensive coverage.

| Quality Layer | Tool | What It Catches | Enforcement |
|--------------|------|-----------------|-------------|
| Type Safety | [Dialyzer](/technologies/dialyzer/) | Type mismatches, unreachable code | `mix dialyzer` (CI blocking) |
| Code Quality | **Credo** | **Style, design, readability issues** | **`mix credo --strict` (CI blocking)** |
| Compilation | `mix compile` | Unused variables, undefined functions | `--warnings-as-errors` (CI blocking) |
| Runtime Correctness | [ExUnit](/technologies/exunit/) | Logic errors, edge cases | `mix test` (CI blocking) |
| Coverage | ExCoveralls | Untested code paths | Coverage threshold (CI blocking) |

Credo operates at the AST (Abstract Syntax Tree) level, analyzing the parsed representation of Elixir source code. This means it can reason about code structure (function nesting, module organization) beyond what simple pattern-matching tools like linters can detect. Each check receives the AST and returns a list of issues with file locations, descriptions, and priorities.

## Performance Characteristics

Credo is optimized for fast feedback during development while scaling to large codebases in CI environments.

| Metric | Value | Notes |
|--------|-------|-------|
| Full codebase analysis | 15-30 seconds | All 13,000+ Elixir files |
| Changed files only | 1-3 seconds | Pre-commit hook (typical 5-20 files) |
| Single file analysis | < 500ms | Editor integration feedback |
| Memory usage | ~200MB | Full codebase analysis |
| Check count | 50+ built-in | Plus custom platform checks |
| False positive rate | Near zero | Strict mode checks are precise |

The pre-commit hook optimization (analyzing only changed files) ensures that Credo never becomes a bottleneck in the development workflow. Full analysis runs in CI where the 15-30 second cost is acceptable.

## Configuration

Credo is run through Mix with various output formats for different contexts, from interactive development to CI pipeline integration.

```bash
# Developer workflow
mix credo --strict                       # Full analysis with strict enforcement
mix credo --strict --format json         # JSON output for CI pipeline parsing
mix credo suggest                        # Show improvement suggestions with explanations
mix credo explain Credo.Check.Design.AliasUsage  # Detailed explanation of a specific check

# CI/CD pipeline
mix credo --strict --format flycheck     # Machine-readable output for automated checks
mix credo --strict --min-priority=high   # Only high-priority issues (fast gate)
```

## Best Practices

The platform enforces Credo conventions that go beyond the default configuration to maintain the highest code quality standards across all 90 umbrella applications.

- **Run in strict mode always** -- the platform's zero-tolerance policy means strict mode is the only accepted mode; non-strict is never used
- **Fix issues immediately** -- do not accumulate Credo debt; the pre-commit hook enforces this at commit time before code leaves the developer's machine
- **Use `mix credo explain`** to understand unfamiliar checks -- every check has a detailed explanation with good and bad examples for learning
- **Keep cyclomatic complexity below 10** -- complex functions should be broken into smaller, composable functions that each do one thing
- **Follow `@moduledoc` convention** -- every public module must have documentation; Credo enforces this via the `ModuleDoc` check
- **Integrate with your editor** -- most Elixir editors support inline Credo annotations via LSP or plugins for real-time feedback
- **Never disable checks without justification** -- the `.credo.exs` configuration documents why each disabled check is disabled
- **Review new check additions** -- when Credo releases new checks, evaluate them for inclusion in the platform's configuration

## Comparison

Credo was chosen as the Elixir code quality tool for its comprehensive check coverage, strict mode enforcement, and seamless integration with the Mix build system.

| Criterion | Credo | ESLint (JS) | Pylint (Python) | Clippy (Rust) |
|-----------|-------|-------------|-----------------|---------------|
| Language | Elixir-specific | JavaScript | Python | Rust |
| Check types | Design + Style + Safety | Style + Best Practices | Style + Error Detection | Correctness + Performance |
| Strict mode | Built-in | Configurable | Configurable | Built-in |
| Custom checks | Plugin system | Plugin system | Plugin system | Limited |
| AST-based analysis | Yes | Yes | Yes | Yes (MIR) |
| Mix integration | Native | npm scripts | pip | Cargo |
| Explain mode | Built-in per check | MDN references | Minimal | Built-in per lint |
| Priority system | High/Normal/Low | Error/Warning/Info | Error/Warning/Convention | Allow/Warn/Deny |

## Related Technologies

- [Dialyzer](/technologies/dialyzer/) - Type-level static analysis complementing Credo's style and design analysis
- [ExUnit](/technologies/exunit/) - Runtime testing that complements Credo's static analysis
- [Elixir](/technologies/elixir/) - The language that Credo analyzes, leveraging its AST representation
- [Git](/technologies/git/) - Pre-commit hooks that enforce Credo compliance before code enters the repository
- [BEAM](/technologies/beam/) - Runtime where Credo executes as a Mix task

## Related Apps

- All 90 Prismatic Platform applications enforce Credo strict mode with zero violations as a mandatory quality gate
- [prismatic_safety](/apps/prismatic-safety/) - Quality Floor Guardian that monitors Credo compliance across the platform
- [prismatic_web](/apps/prismatic-web/) - LiveView modules held to strict readability standards by Credo
- [prismatic_agents](/apps/prismatic-agents/) - Agent modules validated for design quality and naming conventions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)