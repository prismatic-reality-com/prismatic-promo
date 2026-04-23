+++
title = "/review"
weight = 850
[extra]
category = "Architecture"
description = "Code review and architectural review execution"
syntax = "/review [options]"
authority = "L3"
agent = "review-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1114
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["review", "Code", "commands", "Architecture", "Prismatic Platform", "Step"]
tags = ["commands", "architecture", "review", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/review - Prismatic Platform"
+++

## Overview

**/review** is a production command in the **Architecture** category of the Prismatic Platform that performs comprehensive code review and architectural review operations. This command automates the systematic examination of code changes against the platform's quality standards, architectural conventions, security requirements, and performance expectations. It serves as the platform's primary mechanism for ensuring that all code modifications meet the exacting standards required by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine before they are integrated into the codebase.

The review command goes beyond surface-level syntax checking to perform deep semantic analysis of code changes. It evaluates whether new code follows established OTP patterns, whether function signatures are consistent with existing API conventions, whether error handling follows the `{:ok, _}` / `{:error, _}` pattern, whether supervision tree modifications maintain fault tolerance properties, and whether new modules comply with the platform's naming and organization standards.

Architectural review mode examines higher-level concerns: whether new applications properly declare their dependencies, whether cross-application communication follows established protocols, whether new GenServer processes have appropriate supervision, and whether data flow patterns maintain the separation of concerns between the platform's storage, business logic, and presentation layers. This mode is particularly critical for changes that span multiple umbrella applications, where the blast radius of a poor architectural decision can affect dozens of downstream modules.

This command operates under the **L3** authority level and is executed by the `review-specialist` agent, which combines deep knowledge of Elixir/OTP best practices with specific expertise in the Prismatic Platform's architectural conventions. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The review system implements a multi-dimensional analysis architecture that examines code changes from several complementary perspectives.

```
Code Changes (diff or file set)
    |
    v
[Review Coordinator]
    |
    +---> [Correctness Analyzer]
    |     +---> Logic errors, edge cases, nil safety
    |     +---> Pattern matching completeness
    |     +---> Error handling coverage
    |
    +---> [Convention Analyzer]
    |     +---> OTP pattern compliance
    |     +---> Naming standards
    |     +---> Module structure
    |     +---> Documentation coverage
    |
    +---> [Security Analyzer]
    |     +---> Input validation
    |     +---> Authentication/authorization
    |     +---> Unsafe operations
    |     +---> Dependency vulnerabilities
    |
    +---> [Performance Analyzer]
    |     +---> Query efficiency (N+1 detection)
    |     +---> Memory patterns
    |     +---> Algorithmic complexity
    |     +---> Cache utilization
    |
    +---> [Architecture Analyzer]
          +---> Dependency direction
          +---> Layer separation
          +---> Supervision topology
          +---> API boundary compliance
    |
    v
[Finding Synthesis] --> Prioritize, Deduplicate, Contextualize
    |
    v
Review Report with Actionable Findings
```

Each analyzer operates independently to prevent cross-contamination of concerns. The synthesis layer then combines findings from all analyzers, removes duplicates, prioritizes by severity, and adds contextual information to make each finding actionable.

## Usage

```bash
# Review current uncommitted changes
/review

# Review a specific branch against main
/review --branch=feature/perimeter-easm

# Review a specific file
/review --file=apps/prismatic_perimeter/lib/security_rating.ex

# Review with architectural focus
/review --mode=architecture

# Review with security focus
/review --mode=security

# Review a specific commit
/review --commit=abc123

# Review a pull request by number
/review --pr=142

# Review with severity filter
/review --min-severity=warning

# Comprehensive review with all analyzers
/review --full

# Review with inline code suggestions
/review --suggest
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--branch` | string | - | Branch to review against main |
| `--file` | string | - | Specific file to review |
| `--commit` | string | - | Specific commit hash to review |
| `--pr` | integer | - | Pull request number to review |
| `--mode` | enum | full | Review mode: `code`, `architecture`, `security`, `performance`, `full` |
| `--min-severity` | enum | info | Minimum severity: `info`, `warning`, `error`, `critical` |
| `--full` | boolean | false | Enable all analyzers at maximum depth |
| `--suggest` | boolean | false | Include code fix suggestions |
| `--format` | enum | text | Output format: `text`, `json`, `markdown`, `github` |
| `--context` | integer | 3 | Lines of context around findings |
| `--app` | string | all | Focus review on specific application |
| `--checklist` | string | - | Custom review checklist file |
| `--ignore` | string | - | Patterns to ignore during review |

## Execution Flow

The review command follows a systematic execution flow that ensures thorough analysis without overwhelming the reviewer with noise.

**Step 1 - Change Identification**: The target changes are identified based on the provided options. For branch reviews, the diff against main is computed. For file reviews, the current content is analyzed in its entirety. For PR reviews, the PR's complete diff is fetched via the GitHub/GitLab API.

**Step 2 - Context Loading**: The review coordinator loads relevant context including the target files' test coverage data, their position in the dependency graph, their modification history, and any existing review comments from previous review cycles.

**Step 3 - Parallel Analysis**: All configured analyzers execute in parallel against the identified changes. Each analyzer produces a set of findings with severity, location, description, and optional fix suggestion.

**Step 4 - Finding Synthesis**: Raw findings from all analyzers are synthesized. Duplicate findings (where multiple analyzers flag the same issue from different perspectives) are merged. Findings are prioritized by severity and relevance. False positives from known safe patterns are filtered.

**Step 5 - Report Generation**: The synthesized findings are formatted into the requested output format. Each finding includes the file path, line number, severity, analyzer source, description, and (when `--suggest` is enabled) a concrete code fix.

**Step 6 - Metrics Recording**: Review metrics (findings count by severity, analysis coverage, execution time) are recorded via [telemetry](@/glossary/telemetry.md) for trend analysis.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `review-specialist` | Deep Elixir/OTP and platform convention expertise |
| [/analyze](@/commands/analyze.md) | Architectural input | Architecture analyzer draws from analyze output |
| [/regression-check](@/commands/regression-check.md) | Convention validation | 25 custom checks inform convention analysis |
| [Quality Gates](@/glossary/quality-gates.md) | Standard enforcement | Review validates quality gate compliance |
| [/reconnaissance](@/commands/reconnaissance.md) | Context provider | Structural context for architectural analysis |
| [/security-audit](@/commands/security-audit.md) | Security validation | Security analyzer shares rules with audit |
| [Telemetry](@/glossary/telemetry.md) | Metrics tracking | Review metrics enable trend analysis |
| GitHub/GitLab API | PR integration | Fetch PR diffs and post review comments |

## Best Practices

Run code review before committing, not after. Catching issues before they enter the git history is cleaner than fixing them in subsequent commits. Use `/review` as part of your pre-commit workflow alongside [/regression-check](@/commands/regression-check.md) to ensure that code meets all standards before it leaves your local environment.

Use `--mode=architecture` for any change that introduces new modules, modifies supervision trees, or changes cross-application dependencies. Architectural issues are the most expensive to fix after the fact, making early detection critical.

Enable `--suggest` when reviewing unfamiliar parts of the codebase. The code suggestions provide concrete examples of how the platform's conventions apply to the specific code being reviewed, serving as both a correction mechanism and a learning tool.

Review PRs with `--format=github` to post findings directly as GitHub review comments. This integrates the automated review with the human review workflow, ensuring that both automated and human findings are visible in a single interface.

Focus on `--min-severity=warning` for routine reviews and drop to `--min-severity=info` for thorough pre-release reviews. Info-level findings include style suggestions and minor improvements that are valuable during polish phases but distracting during rapid development.

## Error Handling

Review errors are handled gracefully to ensure that partial results are always available. If one analyzer fails (for example, the performance analyzer cannot access the database to check query patterns), the remaining analyzers continue and the report notes the missing analysis with a diagnostic message.

```
REVIEW REPORT
Target: feature/perimeter-easm (14 files changed)
Analyzers: Correctness [OK], Convention [OK], Security [OK], Performance [SKIPPED], Architecture [OK]
Performance Analyzer: Skipped - database connection unavailable for query analysis

Findings: 7 total (1 critical, 2 warning, 4 info)

[CRITICAL] apps/prismatic_perimeter/lib/scanner.ex:67
  Analyzer: Security
  Finding: User-supplied domain passed directly to DNS resolution without validation
  Suggestion: Add domain validation using PrismaticPerimeter.Validators.valid_domain?/1

[WARNING] apps/prismatic_perimeter/lib/rating_engine.ex:142
  Analyzer: Correctness
  Finding: Pattern match on {:ok, result} does not handle {:error, _} case
  Suggestion: Add {:error, reason} clause or use with/do pattern
...
```

## Advanced Usage

Advanced review operations support custom review rules, integration with formal verification, and automated fix application.

```bash
# Review with custom checklist for compliance
/review --checklist=.aiad/checklists/nis2-compliance.yml --mode=security

# Review and auto-apply all non-breaking suggestions
/review --suggest --auto-apply --severity=info

# Review comparing two branches
/review --compare=feature/v1..feature/v2

# Review with formal property verification
/review --formal-verify --properties=liveness,safety

# Generate review metrics report for sprint retrospective
/review --metrics --window=14d --format=markdown
```

The `--auto-apply` flag enables automatic application of review suggestions for findings at or below the specified severity level. This is useful for bulk-fixing style and convention issues but should never be used for warning-level or above findings, which require human judgment.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The review command examines every changed line against every applicable standard. Critical findings block integration. No violation is suppressed without explicit justification.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding is backed by specific evidence from the code change, referenced against a concrete standard or convention, and accompanied by an actionable description. No finding is raised without a clear basis.

## Related Commands

- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/architect](@/commands/architect.md) - Architecture design and recommendation generation
- [/migrate](@/commands/migrate.md) - Safe migration planning with rollback strategies
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/security-audit](@/commands/security-audit.md) - Comprehensive application security audit and vulnerability scan

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)