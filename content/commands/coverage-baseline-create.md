+++
title = "/coverage-baseline-create"
weight = 2150
[extra]
category = "Quality"
description = "Create coverage baseline for regression tracking and enforcement"
syntax = "/coverage-baseline-create [options]"
authority = "L2+"
agent = "quality-unified-supreme"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 834
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["coverage-baseline-create", "Create", "commands", "Quality", "Prismatic Platform", "GitLab", "Coverage", "AIAD", "Architecture"]
tags = ["commands", "quality", "coverage-baseline-create", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/coverage-baseline-create - Prismatic Platform"
+++

## Overview

The **/coverage-baseline-create** command establishes test coverage baselines that serve as the foundation for the Prismatic Platform's coverage regression prevention system. A coverage baseline captures the current state of test coverage -- percentage, lines covered, files tested -- and stores it both locally and in GitLab artifacts for branch-specific tracking. Once a baseline exists, subsequent code changes must maintain or improve upon it, preventing the gradual erosion of test coverage that plagues long-lived software projects.

Coverage baselines are branch-specific, meaning each feature branch, release branch, and the main branch maintain independent baselines. This design allows teams to set appropriate coverage expectations for different development contexts while ensuring that the main branch's coverage never regresses. The baseline system integrates directly with the platform's pre-commit hooks and CI/CD pipeline, creating an automated enforcement loop that requires zero manual intervention.

This command operates under the **L2+** authority level and is executed by the `quality-unified-supreme` agent, which coordinates all quality enforcement activities across the platform. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command plays a critical role in the platform's quality infrastructure, which has achieved and maintains a 100/100 quality score across 13 quality domains.

The underlying implementation executes `mix test --cover` to measure actual coverage, parses the output to extract precise metrics, stores the baseline in ETS for runtime access, writes a local backup file for persistence, and optionally uploads the baseline to GitLab as a pipeline artifact. A read-after-write verification step ensures data integrity across all storage layers.

## Architecture

### Baseline Storage Architecture

```
Coverage Baseline System
========================

MEASUREMENT LAYER
    +-- mix test --cover
    +-- Coverage data extraction
    +-- Percentage calculation
    +-- Line-level tracking
    |
    v
LOCAL STORAGE LAYER
    +-- ETS table (runtime access)
    +-- Local file backup (.coverage-baseline.json)
    +-- Branch-specific isolation
    |
    v
REMOTE STORAGE LAYER
    +-- GitLab artifact upload
    +-- Pipeline-associated storage
    +-- Cross-environment sharing
    |
    v
VERIFICATION LAYER
    +-- Read-after-write validation
    +-- Integrity hash checking
    +-- Storage consistency verification
```

### Baseline Data Structure

```json
{
  "baseline": {
    "branch": "main",
    "commit_sha": "abc123f7890",
    "coverage_percentage": 83.4,
    "lines_covered": 4532,
    "lines_total": 5431,
    "created_at": "2026-01-31T12:30:00Z",
    "created_by": "coverage-enforcement-supreme",
    "comment": "Initial baseline after refactoring"
  },
  "metadata": {
    "platform": "prismatic-platform",
    "enforcer": "ARCHER-SUPREME",
    "version": "1.0.0",
    "verification": "read-after-write"
  }
}
```

## Usage

### Basic Baseline Creation

```bash
# Create baseline for current branch (most common usage)
/coverage-baseline-create

# Create baseline for a specific branch
/coverage-baseline-create --branch develop

# Create baseline with descriptive comment
/coverage-baseline-create --comment "Baseline after major test suite overhaul"
```

### Force Overwrite

```bash
# Overwrite existing baseline (requires explicit --force)
/coverage-baseline-create --force

# Force overwrite with comment explaining reason
/coverage-baseline-create --force --comment "Post-refactoring baseline reset - coverage increased from 75% to 85%"
```

### Local-Only Operations

```bash
# Create baseline without uploading to GitLab
/coverage-baseline-create --upload-gitlab false

# Useful for local development before pushing
/coverage-baseline-create --upload-gitlab false --comment "Local development baseline"
```

## Options & Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **--branch** | string | No | current branch | Target branch for baseline association |
| **--force** | boolean | No | false | Force overwrite of existing baseline |
| **--upload-gitlab** | boolean | No | true | Upload baseline to GitLab artifacts |
| **--comment** | string | No | -- | Descriptive comment for baseline creation context |

## Execution Flow

```
/coverage-baseline-create [options]
    |
    v
PHASE 1: PRE-FLIGHT CHECKS (< 1s)
    +-- Verify branch exists
    +-- Check for existing baseline (conflict detection)
    +-- Validate GitLab credentials (if upload enabled)
    +-- Confirm force flag if baseline exists
    |
    v
PHASE 2: COVERAGE MEASUREMENT (30-120s)
    +-- Execute mix test --cover
    +-- Parse coverage output
    +-- Extract percentage, lines, files
    +-- Validate test suite passes (all green required)
    |
    v
PHASE 3: BASELINE CREATION (< 1s)
    +-- Build baseline data structure
    +-- Store in ETS table
    +-- Write local file backup
    +-- Generate integrity hash
    |
    v
PHASE 4: REMOTE STORAGE (< 5s)
    +-- Upload to GitLab artifacts
    +-- Associate with pipeline
    +-- Tag with branch and commit
    |
    v
PHASE 5: VERIFICATION (< 2s)
    +-- Read-after-write validation (local)
    +-- Read-after-write validation (GitLab)
    +-- Integrity hash comparison
    +-- Report creation success
```

### Success Output

```
Creating coverage baseline...
Measuring current coverage...
Coverage: 85.6% (4532/5291 lines)
Comment: Initial baseline after refactoring
Baseline created locally
Uploading to GitLab...
GitLab artifact uploaded: artifacts/12345/baseline.json
Verification: baseline readable from GitLab
Baseline set: 85.6% for branch 'main'

Exit Code: 0
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `quality-unified-supreme` agent | Agent coordinates all quality enforcement |
| [AIAD](/glossary/aiad/) Registry | Command specification and discovery | Registered in quality category |
| [Quality Gates](/glossary/quality-gates/) | Direct quality gate enforcement | Baselines feed into pre-commit quality gates |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) and event tracking | Coverage metrics emitted as telemetry events |
| GitLab CI/CD | Artifact storage and pipeline integration | Baselines stored as pipeline artifacts |
| Pre-commit Hooks | Regression prevention enforcement | `.githooks/pre-commit` checks against baseline |
| Quality DNA | Cross-session quality continuity | Baselines contribute to quality DNA state |

### CI/CD Integration

```yaml
# .gitlab-ci.yml coverage enforcement
coverage_check:
  script:
    - mix coverage.enforce --branch $CI_COMMIT_BRANCH
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  artifacts:
    paths:
      - .coverage-baseline.json
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cover/cobertura.xml
```

### Pre-commit Hook Integration

```bash
# .githooks/pre-commit (coverage enforcement section)
if [ -f .coverage-baseline.json ]; then
  BASELINE=$(jq '.baseline.coverage_percentage' .coverage-baseline.json)
  CURRENT=$(mix test --cover 2>&1 | grep "Coverage" | awk '{print $2}')
  if (( $(echo "$CURRENT < $BASELINE" | bc -l) )); then
    echo "Coverage regression detected: $CURRENT% < $BASELINE%"
    exit 1
  fi
fi
```

## Best Practices

1. **Create baselines after significant test improvements** -- Establish a new baseline after adding substantial test coverage to lock in the improvement and prevent regression.

2. **Always include descriptive comments** -- Future developers examining baseline history need context for why each baseline was set. Comments like "Post-security-audit coverage expansion" are far more useful than no comment.

3. **Use branch-specific baselines** -- Feature branches should have their own baselines that reflect the coverage expectations for that specific work stream.

4. **Never force-overwrite to lower coverage** -- The `--force` flag exists for legitimate resets (major refactoring, test framework migration), not for circumventing coverage requirements.

5. **Verify GitLab upload success** -- The command performs read-after-write verification automatically, but confirm the artifact appears in GitLab if network issues are suspected.

6. **Coordinate baselines with quality DNA** -- After creating a baseline, verify that the quality DNA state file at `.claude/quality-dna/current-state.json` reflects the updated coverage target.

## Error Handling

| Error | Exit Code | Cause | Resolution |
|-------|-----------|-------|------------|
| Existing baseline conflict | 1 | Baseline already exists for branch | Use `--force` to overwrite |
| Test failures | 2 | Tests fail during coverage measurement | Fix test failures first |
| GitLab upload failure (403) | 0 | Authentication or permission issue | Check GITLAB_TOKEN; baseline created locally |
| GitLab upload failure (network) | 0 | Network connectivity issue | Baseline created locally; retry upload later |
| Coverage measurement failure | 2 | mix test --cover fails to execute | Check mix.exs coverage configuration |
| Verification mismatch | 3 | Read-after-write hash mismatch | Retry; check storage layer integrity |

### Error Output Examples

```
# Existing baseline conflict
Baseline already exists for branch 'main'
Existing: 83.4% (commit: def456a, created: 2026-01-10)
Current:  85.6% (commit: abc123f)
Use --force to overwrite existing baseline
Exit Code: 1

# Test failure
Failed to measure coverage
Tests failed: 3 failures, 42 total
Cannot create baseline from failing tests
Fix test failures before creating baseline
Exit Code: 2
```

## Advanced Usage

### Programmatic Baseline Management

```elixir
# Create baseline programmatically
{:ok, baseline} = PrismaticQuality.CoverageBaseline.create(%{
  branch: "main",
  force: false,
  upload_gitlab: true,
  comment: "Automated baseline after CI pass"
})

# Query existing baseline
{:ok, current} = PrismaticQuality.CoverageBaseline.get("main")

# Compare current coverage against baseline
{:ok, comparison} = PrismaticQuality.CoverageBaseline.compare("main")
# => %{baseline: 83.4, current: 85.6, delta: +2.2, status: :improved}

# List all baselines across branches
{:ok, baselines} = PrismaticQuality.CoverageBaseline.list_all()
```

### Baseline History Tracking

```bash
# View baseline history for a branch
mix coverage.enforce --history --branch main

# Compare baselines between branches
mix coverage.enforce --compare main..feature/new-api

# Export baseline data for external analysis
mix coverage.enforce --export-json coverage-report.json
```

### Integration with Quality Floor Guardian

The Quality Floor Guardian monitors coverage baselines as part of its autonomous quality enforcement:

| Coverage Level | Guardian Response |
|---------------|-------------------|
| Above baseline | OPTIMAL -- monitor only |
| At baseline | WARNING -- alert on any decrease |
| 1-2% below baseline | CRITICAL -- auto-evolution trigger |
| 3%+ below baseline | EMERGENCY -- block commits, escalate |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for coverage regression. Once a baseline is established, coverage can only go up. No commits bypass coverage checks. No baselines are lowered without force flag and explicit justification.
- **NO DOUBTS**: Full coverage measurement before baseline creation. Read-after-write verification ensures data integrity. Evidence-based metrics with precise line counts, not approximations.

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)