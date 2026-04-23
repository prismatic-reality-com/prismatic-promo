+++
title = "/nmnd-status"
weight = 1250
[extra]
category = "Documentation"
description = "NO MERCY NO DOUBTS doctrine compliance verification"
syntax = "/nmnd-status [options]"
authority = "L2+"
agent = "nmnd-status-checker"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1118
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["nmnd-status", "MERCY", "DOUBTS", "commands", "Documentation", "Prismatic Platform", "Boolean"]
tags = ["commands", "documentation", "nmnd-status", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/nmnd-status - Prismatic Platform"
+++

## Overview

**/nmnd-status** is a production command in the **Documentation** category of the Prismatic Platform. It performs [NO MERCY](/glossary/no-mercy/) [NO DOUBTS](/glossary/no-doubts/) doctrine compliance verification, scanning the entire platform codebase, agent ecosystem, and operational processes to assess adherence to the foundational NM/ND governance framework.

The NO MERCY, NO DOUBTS doctrine is the universal enforcement framework governing all Prismatic Platform operations. Every agent, command, policy, and code artifact must comply with its requirements: zero tolerance for incomplete implementations, evidence-based decision making, full investigation before action, and verified results without exception. The `/nmnd-status` command provides the authoritative compliance assessment, identifying violations, measuring adherence metrics, and generating remediation guidance.

Unlike ad-hoc quality checks that examine specific technical domains, `/nmnd-status` evaluates compliance at the doctrine level -- a higher abstraction that encompasses code quality, test coverage, documentation completeness, agent behavior conformance, and operational procedure adherence. It answers the fundamental question: "Is the platform operating according to its governing principles?"

This command operates under the **L2+** authority level and is executed by the `nmnd-status-checker` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L2+ authority level grants read access across all platform components for comprehensive compliance assessment.

## Architecture

The `/nmnd-status` command implements a multi-domain compliance scanning architecture that evaluates NM/ND adherence across seven enforcement dimensions.

### Compliance Assessment Pipeline

```
Command Invocation --> Domain Scanner Registry
                            |
          +-----------------+-----------------+
          |        |        |        |        |
       Code     Tests    Agents   Docs    Ops
       Domain   Domain   Domain   Domain  Domain
          |        |        |        |        |
          +-----------------+-----------------+
                            |
                    Violation Aggregator
                            |
                    Severity Classifier
                            |
                    Compliance Report
```

### Enforcement Dimensions

| Dimension | NM Checks | ND Checks |
|-----------|-----------|-----------|
| **Code Quality** | Zero warnings, zero stubs, production-ready | Full typespecs, documented functions |
| **Test Coverage** | 100% target, no mocks in unit tests | Edge cases covered, regression tests present |
| **Agent Compliance** | All agents have enforcement block | Agent actions evidence-based |
| **Documentation** | All public APIs documented | Provenance and context provided |
| **Operations** | All hooks pass, no bypass flags | Verified results, audit trail |
| **Quality Gates** | All 13 domains at zero violations | Gates evidence-validated |
| **Doctrine Files** | Enforcement YAML present and valid | Version compliance verified |

## Usage

### Basic Status Check

```bash
# Full NM/ND compliance status
/nmnd-status

# Quick summary (counts only, no details)
/nmnd-status --summary

# Check specific dimension
/nmnd-status --dimension code-quality

# Check specific app within the umbrella
/nmnd-status --app prismatic_perimeter
```

### Detailed Analysis

```bash
# Full compliance report with violation details
/nmnd-status --verbose

# Export compliance report as JSON for CI integration
/nmnd-status --output json --file nmnd-compliance.json

# Show only violations (skip passing checks)
/nmnd-status --violations-only

# Check compliance of recent changes only
/nmnd-status --since "2026-02-01" --git-diff
```

### Remediation

```bash
# Generate remediation plan for violations
/nmnd-status --remediate

# Auto-fix trivially correctable violations
/nmnd-status --auto-fix --dry-run
/nmnd-status --auto-fix

# Track compliance trends over time
/nmnd-status --trend --days 30
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--dimension` | Enum | All | Specific dimension: `code`, `tests`, `agents`, `docs`, `ops`, `gates`, `doctrine` |
| `--app` | String | All | Specific umbrella app to check |
| `--summary` | Boolean | `false` | Show counts only without violation details |
| `--verbose` | Boolean | `false` | Include full violation context and file paths |
| `--violations-only` | Boolean | `false` | Show only failing checks |
| `--output` | Enum | `text` | Output format: `text`, `json`, `markdown`, `html` |
| `--file` | Path | - | Write report to file |
| `--auto-fix` | Boolean | `false` | Attempt automatic remediation of trivial violations |
| `--dry-run` | Boolean | `false` | Show what auto-fix would change without applying |
| `--remediate` | Boolean | `false` | Generate detailed remediation plan |
| `--since` | Date | - | Check only files modified since date |
| `--git-diff` | Boolean | `false` | Check only staged/unstaged changes |
| `--trend` | Boolean | `false` | Show compliance trend over time |
| `--days` | Integer | `7` | Number of days for trend analysis |
| `--threshold` | Float | `1.0` | Minimum compliance ratio (1.0 = 100%) |

## Execution Flow

**Phase 1 -- Scope Determination** (0-2s): The command determines the scope of the compliance check based on provided parameters. Full-platform checks enumerate all umbrella apps, AIAD components, and operational artifacts. Scoped checks target specific dimensions or applications.

**Phase 2 -- Domain Scanning** (2-30s): Each enforcement dimension is scanned by its specialized checker module. Scanners run concurrently and report findings to the Violation Aggregator. Code domain scanning is typically the most time-intensive phase, involving compilation analysis, typespec coverage, and pattern detection across 6,600+ Elixir source files.

**Phase 3 -- Violation Classification** (30-35s): Discovered violations are classified by severity according to the NM/ND violation protocol. L1 violations represent minor deviations requiring correction. L2 violations are quality violations that block operations. L3 violations indicate incomplete delivery requiring restart. L4 violations are doubt-compromised decisions requiring supreme review.

**Phase 4 -- Compliance Scoring** (35-38s): An overall compliance score is calculated as the ratio of passing checks to total checks, weighted by dimension importance. The score is compared against the configured threshold (default 1.0 for 100% compliance). Any score below threshold triggers a non-zero exit code for CI integration.

**Phase 5 -- Report Generation** (38-40s): The compliance report is assembled with dimension-level summaries, violation details (if verbose), compliance score, and trend data (if requested). Reports include actionable remediation steps for each violation category.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Managed by `nmnd-status-checker` agent |
| [Quality Gates](/glossary/quality-gates/) | Data source | Reads quality gate results as compliance input |
| [Telemetry](/glossary/telemetry/) | Observability | Compliance [metrics](/glossary/metrics/) and violation events |
| [AIAD Registry](/glossary/aiad/) | Scanning target | Validates all AIAD component compliance |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Stores compliance snapshots for trend analysis |
| [GitLab CI](/glossary/gitlab-ci/) | Pipeline gate | JSON output consumed by CI pipeline for gating |
| [Pre-commit hooks](/glossary/pre-commit-hooks/) | Enforcement | Triggers on commit to verify compliance |

## Best Practices

**Regular Assessment**: Run `/nmnd-status` at least once per development session. Compliance drift is easier to correct when caught early. The `--summary` flag provides quick verification without the overhead of full verbose reporting.

**CI Integration**: Include `/nmnd-status --output json --threshold 1.0` in CI pipelines as a mandatory gate. The JSON output provides machine-readable compliance data that integrates with notification systems and dashboards.

**Incremental Checking**: For large development sessions with many changes, use `--since` or `--git-diff` to check only modified code. This provides faster feedback without sacrificing coverage on the changed surface area.

**Trend Monitoring**: Use `--trend --days 30` periodically to detect gradual compliance degradation. A declining trend, even while remaining above threshold, indicates emerging issues that should be addressed proactively.

**Auto-Fix with Caution**: The `--auto-fix` capability handles trivial violations such as missing enforcement YAML blocks and standard documentation headers. Always preview with `--dry-run` first, and review changes before committing.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Compilation required | Triggers `mix compile` if needed | Slightly longer execution |
| Missing AIAD components | Reported as L2 violation | Included in compliance score |
| Inaccessible files | Skipped with warning | Noted in report, partial coverage |
| Corrupt quality DNA | Regenerated from current state | Historical trend may be incomplete |
| Git history unavailable | Trend analysis disabled | Warning, current status still reported |
| Large codebase timeout | Parallel scanning with timeout per domain | Domain marked as partial |

## Advanced Usage

### Custom Compliance Policies

Organizations can define custom NM/ND compliance policies that extend the standard checks:

```bash
# Apply a custom compliance policy
/nmnd-status --policy strict-security --threshold 1.0

# List available compliance policies
/nmnd-status --list-policies
```

### Compliance Dashboards

The command can generate data for real-time compliance monitoring:

```bash
# Generate dashboard-compatible metrics
/nmnd-status --output json --metrics-format prometheus

# Continuous compliance monitoring (watch mode)
/nmnd-status --watch --interval 300
```

### Cross-Session Compliance Tracking

Compliance data persists across sessions through the [Quality DNA](/glossary/quality-dna/) system:

```bash
# Compare compliance between sessions
/nmnd-status --compare session-2026-02-14 session-2026-02-15

# Generate compliance audit trail
/nmnd-status --audit-trail --from 2026-01-01 --to 2026-02-15
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The `/nmnd-status` command itself must produce complete, accurate compliance reports. No partial scans without explicit scope limitation. No unreported violations.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every compliance finding is backed by concrete file references, line numbers, and violation descriptions. No subjective assessments. All metrics are reproducible and verifiable.

As the doctrine's own compliance verification tool, `/nmnd-status` operates under heightened scrutiny. Its output is considered authoritative for platform governance decisions, making accuracy and completeness non-negotiable requirements.

## Related Commands

- [/nmnd](/commands/nmnd/) - NO MERCY NO DOUBTS doctrine activation and enforcement
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/chronic](/commands/chronic/) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](/commands/find-lowfruit/) - Identify low-hanging fruit improvements across codebase
- [/scan-mycelium](/commands/scan-mycelium/) - Mycelial pattern scanning across documentation and code
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)