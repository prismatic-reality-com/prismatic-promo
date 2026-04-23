+++
title = "/quality-evolve"
weight = 570
[extra]
category = "Evolution"
description = "Quality-focused evolution targeting specific quality domains"
syntax = "/quality-evolve [options]"
authority = "L3"
agent = "evolution-orchestrator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1218
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-evolve", "Quality-focused", "commands", "Evolution", "Prismatic Platform", "Phase", "Domain", "Every"]
tags = ["commands", "evolution", "quality-evolve", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/quality-evolve - Prismatic Platform"
+++

## Overview

**/quality-evolve** is a production command in the **Evolution** category of the Prismatic Platform. It drives targeted evolution cycles focused on improving specific [quality domains](@/glossary/quality-dna.md), systematically identifying quality deficiencies, generating improvement candidates, validating their effectiveness through automated testing, and promoting successful improvements into the production codebase. Unlike general-purpose evolution commands such as [/evolve](@/commands/evolve.md), which operate across the entire platform, `/quality-evolve` concentrates its efforts on a single quality domain per execution cycle, enabling deeper analysis and more effective improvements.

This command operates under the **L3** authority level and is executed by the `evolution-orchestrator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level grants the command permission to modify source code, update quality configurations, and trigger compilation and test cycles as part of the evolution process.

The Prismatic Platform tracks quality across 13 domains: Dialyzer, [Credo](@/glossary/credo.md), Compilation, DateTime Precision, Guard Functions, `@impl` Coverage, Memory Safety, Performance, Regression Prevention, Timing Patterns, TODO Management, Typespec Coverage, and Unsafe Map Access. Each domain has specific metrics, detection rules, and improvement strategies. `/quality-evolve` encapsulates the domain-specific knowledge needed to improve any of these 13 areas.

The evolutionary approach to quality improvement represents a fundamental shift from manual code review and ad-hoc fixing to systematic, automated, and validated quality enhancement. Each evolution cycle follows a measure-analyze-improve-validate loop that ensures improvements are real (validated by tests), safe (no regressions introduced), and permanent (committed to the codebase with quality DNA updates).

## Syntax and Usage

```bash
/quality-evolve [options]
```

The command accepts options for domain selection, iteration control, and strategy configuration.

```bash
# Evolve all quality domains (one cycle each)
/quality-evolve

# Evolve specific domain
/quality-evolve --domain dialyzer

# Evolve with specific iteration count
/quality-evolve --domain credo --iterations 5

# Dry run showing proposed improvements
/quality-evolve --domain memory-safety --dry-run

# Evolve with aggressive improvement strategy
/quality-evolve --domain typespec --strategy aggressive

# Evolve specific application only
/quality-evolve --domain compilation --app prismatic_web

# Show current quality scores per domain
/quality-evolve --status

# Evolve with detailed progress reporting
/quality-evolve --domain performance --verbose

# Multi-domain evolution campaign
/quality-evolve --domains dialyzer,credo,typespec --iterations 3
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--domain` | string | all | Quality domain to target |
| `--domains` | string | all | Comma-separated list of domains |
| `--app` | string | all | Specific umbrella application to evolve |
| `--iterations` | integer | 3 | Number of evolution cycles per domain |
| `--strategy` | enum | `balanced` | Evolution strategy: `conservative`, `balanced`, `aggressive`, `targeted` |
| `--dry-run` | flag | false | Show proposed improvements without executing |
| `--status` | flag | false | Display current quality scores |
| `--verbose` | flag | false | Detailed progress reporting |
| `--max-changes` | integer | 50 | Maximum code changes per cycle |
| `--rollback-on-regression` | flag | true | Rollback if quality score decreases |
| `--commit` | flag | false | Auto-commit improvements after validation |
| `--report` | path | none | Export evolution report to file |
| `--severity` | string | all | Filter violations by severity: `high`, `medium`, `low` |
| `--checks` | string | all | Filter by specific check categories |

The `--strategy` parameter controls the aggressiveness of the evolution. Conservative mode makes only high-confidence, well-tested improvements with minimal risk of side effects. Balanced mode (default) applies a mix of safe and moderately complex improvements. Aggressive mode attempts more ambitious fixes that may require manual review. Targeted mode focuses on specific violation types identified through prior analysis.

## Implementation Architecture

The quality evolution system operates as a feedback loop: measure, analyze, generate improvements, test, and promote.

```
              /quality-evolve
                    |
           Domain Selector
                    |
           Quality Measurer
                    |
          +--------+--------+
          |        |        |
       Defect   Pattern   Benchmark
       Scanner  Analyzer  Collector
          |        |        |
          +--------+--------+
                    |
          Improvement Generator
                    |
          +--------+--------+
          |        |        |
       Code     Config    Pattern
       Fixer    Tuner     Propagator
          |        |        |
          +--------+--------+
                    |
           Validation Gate
                    |
          +--------+--------+
          |        |        |
       Compile   Test     Quality
       Check     Suite    Score
          |        |        |
          +--------+--------+
                    |
           Promotion Decision
```

### Domain-Specific Strategies

| Domain | Strategy | Typical Improvement Per Cycle |
|--------|----------|------------------------------|
| **Dialyzer** | Type annotation addition, spec correction | 5-20 violations fixed |
| **Credo** | Code style normalization, complexity reduction | 10-50 issues resolved |
| **Compilation** | Warning elimination, deprecation updates | 2-10 warnings fixed |
| **Memory Safety** | Unsafe access replacement, guard addition | 3-15 patterns fixed |
| **Typespec Coverage** | `@spec` generation from runtime analysis | 10-30 specs added |
| **Performance** | Hot path optimization, query tuning | 5-15% improvement |
| **Guard Functions** | Guard clause addition for public functions | 5-20 guards added |
| **@impl Coverage** | Missing @impl annotation addition | 10-40 annotations added |
| **Unsafe Map Access** | Map.get/Access replacement for bracket access | 5-25 patterns fixed |

### Evolution Phases

**Phase 1 -- Domain Assessment**: The target domain is assessed for current quality score, violation count, and improvement potential. Historical trends are analyzed to identify whether the domain is improving, stable, or degrading.

**Phase 2 -- Defect Scanning**: Domain-specific scanners identify all current violations, categorize them by severity and fixability, and rank them by expected improvement impact.

**Phase 3 -- Improvement Generation**: Based on scan results, the improvement generator creates code modifications: automated fixes (deterministic corrections for well-understood patterns), heuristic fixes (best-effort corrections based on pattern analysis), and configuration updates (tuning domain-specific settings for stricter enforcement).

**Phase 4 -- Validation**: Every proposed improvement passes through a validation gate: compilation check (`mix compile --warnings-as-errors` must pass), test suite (all existing tests must continue to pass), quality score (domain quality score must not decrease), and cross-domain impact (changes must not introduce violations in other domains).

**Phase 5 -- Promotion**: Validated improvements are applied to the codebase. If `--commit` is enabled, changes are automatically committed with conventional commit messages. Quality DNA is updated to reflect the new state.

## Examples

### Comprehensive Dialyzer Evolution

```bash
/quality-evolve --domain dialyzer --iterations 10 --strategy aggressive
# Cycle 1: 15 type annotation fixes applied
# Cycle 2: 8 spec corrections applied
# Cycle 3: 12 return type annotations added
# ... (continues for 10 cycles)
# Total: 67 violations fixed, quality score 100/100
```

### Safe Memory Safety Improvement

```bash
/quality-evolve --domain memory-safety --dry-run --verbose
# Proposed improvements:
#   1. Replace map[:key] with Map.get(map, :key) in 12 locations
#   2. Add guard clauses to 5 public functions accepting maps
#   3. Replace unsafe Access.get with safe alternatives in 3 modules
# Estimated quality improvement: +8 points
# Risk assessment: LOW (all changes are structural replacements)
```

### Application-Specific Typespec Evolution

```bash
/quality-evolve --domain typespec --app prismatic_api --strategy targeted
# Targets prismatic_api specifically, adding @spec annotations
# to all public functions that currently lack them
```

## Integration with Platform

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Improvements validated against quality gates |
| [/quality-unified](@/commands/quality-unified.md) | Peer | Unified quality assessment feeds into evolution targets |
| [/quality-hbfs](@/commands/quality-hbfs.md) | Peer | Hottest-bug-first prioritization guides evolution |
| [/evolve](@/commands/evolve.md) | Framework | Part of broader ecosystem evolution |
| [/regression-check](@/commands/regression-check.md) | Validation | Regression checks validate improvements |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Gate compliance required for promotion |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Evolution metrics and quality trends |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Epistemic | Evidence-based improvement decisions |
| [Quality DNA](@/glossary/quality-dna.md) | State tracking | Cross-session quality state persistence |

## Workflow Integration

The /quality-evolve command integrates into the platform's quality management workflow at several levels:

1. **Daily Quality Improvement**: Scheduled evolution cycles run with conservative strategy, continuously improving quality scores without risk of regressions. This creates a "quality ratchet" that prevents quality from degrading over time.

2. **Pre-Release Quality Campaigns**: Before major releases, aggressive evolution campaigns target remaining quality violations. Multi-domain evolution (`--domains dialyzer,credo,typespec`) addresses all quality fronts simultaneously.

3. **Post-Incident Quality Response**: After quality regressions are detected, targeted evolution cycles address the specific domain that regressed. The rollback-on-regression safeguard prevents further degradation.

4. **New Application Bootstrap**: When new umbrella applications are created via [/quickstart](@/commands/quickstart.md), quality evolution establishes baseline quality by running all domains against the new application.

5. **Cross-Domain Awareness**: Quality domains are interconnected. Improving Dialyzer compliance often requires adding typespecs (affecting the Typespec Coverage domain). Using `--domains` to evolve related domains together produces better results than treating them independently.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Improvements that degrade any quality domain are rejected. Every evolution cycle must leave the codebase in a better or equal state -- never worse.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every improvement is validated through compilation, testing, and quality scoring. No speculative improvements are promoted without empirical validation.

NABLA axiom compliance:

| Axiom | Enforcement |
|-------|-------------|
| **Evidence-Based** | Every improvement validated by compilation, tests, and quality scoring |
| **Provenance Mandatory** | Each change traceable to specific violation, scanner, and evolution cycle |
| **Signal Plurality** | Multiple validation signals (compile, test, quality score) required for promotion |
| **Contradiction Preservation** | Cross-domain impacts tracked; improvements that fix one domain but break another are flagged |
| **Time Decay** | Quality scores timestamped; degradation trends trigger automatic evolution |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Domain assessment | < 30s | ~10s |
| Defect scanning | < 60s per domain | ~20s per domain |
| Improvement generation | < 2min per cycle | ~45s per cycle |
| Validation (compile + test) | < 5min | ~2min |
| Single evolution cycle | < 10min | ~4min |
| Full 13-domain evolution | < 2hr | ~45min |
| Quality DNA update | < 5s | ~1s |

The validation phase dominates execution time, as it requires full compilation and test suite execution. For large umbrella applications, parallel compilation significantly reduces this overhead. The `--app` parameter limits the scope and proportionally reduces execution time.

## Related Commands

- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](@/glossary/observability.md)
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-unified](@/commands/quality-unified.md) - Unified quality command with quick, full, pre-commit and CI modes
- [/quality-hbfs](@/commands/quality-hbfs.md) - Hottest-bug-first search for quality assessment prioritization
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec with emergence detection
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)