+++
title = "Prismatic Safety"
weight = 8
[extra]
icon = "shield-check"
color = "emerald"
description = "Quality Floor Guardian with autonomous monitoring and evolution triggers"
category = "Quality"
files = "445"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1408
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Safety", "Quality", "Floor", "Guardian", "apps", "Prismatic Platform", "Quality DNA", "PrismaticSafety"]
tags = ["apps", "quality", "prismatic-safety", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Safety - Prismatic Platform"
+++

## Abstract

Prismatic Safety is the platform's autonomous quality enforcement system, implementing continuous monitoring, predictive regression prevention, and automatic evolution triggering across 13 quality domains. The system's core component, the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md), operates as a [GenServer](@/glossary/genserver.md) that periodically evaluates the platform's quality score on a 0-100 scale and executes graduated response protocols: monitoring at 99-100, warning with investigation at 98-99, critical with automatic evolution triggers at 95-98, and emergency commit blocking below 95. The [Quality DNA](@/glossary/quality-dna.md) system provides cross-session continuity by persisting quality state, violation history, and intervention records in a structured JSON format. A predictive pre-commit hook analyzes staged changes for risk patterns -- including `length() > 0` anti-patterns, new `Process.sleep` usage, missing `@spec` annotations, and unsafe map access -- blocking commits that would degrade quality before they enter the codebase.

## 1. Introduction

### 1.1 Problem Statement

Software quality in a large codebase (6,652 [Elixir](@/glossary/elixir.md) source files across 90 [OTP](@/glossary/otp.md) applications) tends to degrade incrementally. Individual changes that are "good enough" accumulate into systemic debt: missing type specifications reduce [Dialyzer](@/glossary/dialyzer.md) effectiveness, anti-patterns degrade performance, and coding standard violations reduce readability. Traditional quality enforcement relies on periodic audits or manual code review, both of which introduce latency between degradation and detection.

Prismatic Safety solves this by making quality enforcement continuous, autonomous, and preemptive. The system detects quality degradation in real time, prevents it at commit time through predictive analysis, and automatically triggers corrective evolution when quality dips below defined thresholds.

### 1.2 Design Goals

1. **Continuous autonomous monitoring** -- quality is assessed continuously, not periodically, through a GenServer-based monitoring loop.
2. **Graduated response protocols** -- four severity levels with proportional automated responses, from passive monitoring to emergency commit blocking.
3. **Predictive prevention** -- [pre-commit hooks](@/glossary/pre-commit-hooks.md) analyze changes for known risk patterns before code enters the repository.
4. **Cross-session continuity** -- the Quality DNA system preserves quality state across development sessions, enabling trend analysis and intervention tracking.
5. **13-domain coverage** -- monitoring spans compilation, [Credo](@/glossary/credo.md), Dialyzer, memory safety, performance, datetime precision, guard functions, `@impl` coverage, regression prevention, timing patterns, TODO management, [typespec](@/glossary/typespec.md) coverage, and unsafe map access.
6. **Zero manual intervention** -- the system self-corrects through automatic evolution triggers without requiring human operator action.

### 1.3 Scope

Prismatic Safety covers quality monitoring, enforcement, and automatic remediation triggering. It does not implement the actual code fixes, which are performed by [Prismatic Annihilation](@/apps/prismatic-annihilation.md) and evolution agents. The pre-commit hook operates on staged changes; full codebase scanning is delegated to quality gate [mix task](@/glossary/mix-task.md)s.

## 2. Architecture

### 2.1 System Design

```
Continuous Monitoring Loop
       |
  Quality Floor Guardian (GenServer)
       |
  +----+----+----+----+
  |    |    |    |    |
  Domain   Domain  Domain  ...13 domains
  Scanner  Scanner Scanner
       |
  Score Aggregation (0-100)
       |
  +----+----+----+----+
  |         |         |         |
  OPTIMAL   WARNING   CRITICAL  EMERGENCY
  (99-100)  (98-99)   (95-98)   (<95)
  Monitor   Alert     Evolve    Block
       |
  Quality DNA Persistence
  (.claude/quality-dna/current-state.json)
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticSafety.QualityFloorGuardian` | GenServer: continuous monitoring, score calculation, response [protocol](@/glossary/protocol.md) execution |
| `PrismaticSafety.DomainScanner` | Per-domain quality assessment (compilation, Credo, Dialyzer, etc.) |
| `PrismaticSafety.QualityDna` | Cross-session state persistence, trend analysis, intervention history |
| `PrismaticSafety.RiskPatternDetector` | Static analysis for known anti-patterns and risk indicators |
| `PrismaticSafety.PreCommitHook` | Git hook integration for predictive quality regression prevention |
| `PrismaticSafety.EvolutionTrigger` | Automatic activation of evolution agents when quality thresholds breach |
| `PrismaticSafety.EmergencyProtocol` | Commit blocking, alert escalation, and recovery coordination |
| `PrismaticSafety.CrossAppIntegrationMapper` | Cross-application dependency quality impact analysis |

### 2.3 Process Topology

```
PrismaticSafety.Application (Supervisor, :one_for_one)
+-- PrismaticSafety.QualityFloorGuardian (GenServer)
|     Periodic quality checks, score maintenance, response protocol
+-- PrismaticSafety.RiskPatternDetector (GenServer)
|     Pattern database, AST analysis capabilities
+-- PrismaticSafety.QualityDna (GenServer)
|     State persistence, trend computation, intervention tracking
+-- PrismaticSafety.EvolutionTrigger (GenServer)
      Evolution agent coordination, trigger history
```

### 2.4 Data Flow

The Quality Floor Guardian executes periodic quality checks by invoking domain scanners for each of the 13 quality domains. Each scanner returns a domain-specific score and violation list. The Guardian aggregates these into a composite 0-100 score, compares against thresholds, and executes the appropriate response protocol. Quality DNA receives the score and violation data, persists it to disk, and computes trend [metrics](@/glossary/metrics.md). When a pre-commit hook fires, the Risk Pattern Detector analyzes staged files against its pattern database and returns a risk assessment that determines whether the commit proceeds.

## 3. Implementation

### 3.1 Key Algorithms

**Quality Score Computation**. The composite score is computed as a weighted average across 13 domains. Each domain contributes equally (weight 1/13), and each domain's score is binary: 100 if zero violations, or a scaled score based on violation severity and count. The composite is rounded to the nearest integer for threshold comparison.

**Risk Pattern Detection**. The pre-commit hook performs AST-level analysis on staged `.ex` and `.exs` files. It maintains a pattern database of known anti-patterns (currently 12 patterns) and scores each file for risk. Patterns include `length(list) > 0` (should be `list != []` for O(1) performance), bare `Process.sleep` in non-test code, missing `@spec` on public functions, and direct map access with `.` notation on user-supplied data.

### 3.2 Data Structures

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  use GenServer

  @type state :: %{
    quality_score: 0..100,
    domain_scores: %{atom() => domain_score()},
    response_level: :optimal | :warning | :critical | :emergency,
    last_check: DateTime.t(),
    check_interval: pos_integer(),
    violation_count: non_neg_integer(),
    evolution_triggered: boolean()
  }

  @type domain_score :: %{
    score: 0..100,
    violations: non_neg_integer(),
    details: [violation()],
    last_checked: DateTime.t()
  }

  @type violation :: %{
    domain: atom(),
    severity: :info | :warning | :error | :critical,
    file: String.t(),
    line: pos_integer() | nil,
    message: String.t(),
    pattern: atom() | nil
  }
end
```

### 3.3 API Surface

```elixir
# Current quality status
@spec quality_status() :: {:ok, QualityStatus.t()}
PrismaticSafety.quality_status()
# => {:ok, %{score: 100, level: :optimal, domains: 13, violations: 0}}

# Calculate quality score with domain breakdown
@spec calculate_quality_score() :: {:ok, QualityScore.t()}
PrismaticSafety.calculate_quality_score()
# => {:ok, %{score: 100, domains: %{compilation: 100, credo: 100, ...}}}

# Assess evolution need
@spec assess_evolution_need() :: :not_needed | {:needed, [evolution_action()]}
PrismaticSafety.assess_evolution_need()

# Emergency intervention
@spec emergency_intervention(atom()) :: {:ok, intervention_result()}
PrismaticSafety.emergency_intervention(:quality_floor_breach)

# Risk pattern scan on files
@spec scan_risk_patterns([String.t()]) :: {:ok, [RiskPattern.t()]}
PrismaticSafety.scan_risk_patterns(["lib/my_module.ex"])

# Quality DNA access
@spec quality_dna() :: {:ok, QualityDna.t()}
PrismaticSafety.quality_dna()
```

### 3.4 Configuration

```elixir
config :prismatic_safety,
  # Quality thresholds
  thresholds: %{
    optimal: 99,
    warning: 98,
    critical: 95,
    emergency: 0
  },

  # Monitoring
  check_interval: :timer.minutes(5),
  domains: [
    :compilation, :credo, :dialyzer, :memory_safety,
    :performance, :datetime_precision, :guard_functions,
    :impl_coverage, :regression_prevention, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ],

  # Quality DNA
  dna_path: ".claude/quality-dna/current-state.json",
  dna_backup_count: 10,

  # Risk patterns
  risk_patterns: [
    :length_gt_zero, :process_sleep, :missing_spec,
    :unsafe_map_dot, :bare_raise, :io_inspect,
    :hardcoded_secret, :missing_impl, :dead_code,
    :timer_sleep, :string_concat_in_loop, :unbounded_list
  ]
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Core](@/apps/prismatic-core.md) | Base configuration and entity definitions |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Quality metric emission and monitoring |
| [Prismatic Credo](@/apps/prismatic-credo.md) | Credo analysis results for quality scoring |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Claude](@/apps/prismatic-claude.md) | Session lifecycle quality gate integration |
| [Prismatic Annihilation](@/apps/prismatic-annihilation.md) | Receives evolution trigger signals |
| [Prismatic Web](@/apps/prismatic-web.md) | Quality dashboard data source |
| [Prismatic Agents](@/apps/prismatic-agents.md) | Quality enforcement doctrine compliance |

### 4.3 Inter-Process Communication

The Quality Floor Guardian publishes quality updates via [PubSub](@/glossary/pubsub.md) on the `"safety:quality_update"` topic. The Quality dashboard subscribes to this topic for real-time score display. Evolution triggers are dispatched as supervised tasks to prevent blocking the monitoring loop. Pre-commit hooks execute as external processes invoked by git.

### 4.4 External Integrations

Git hook integration via `.githooks/pre-commit-quality-protection` for pre-commit quality validation. Quality DNA state is persisted as JSON to `.claude/quality-dna/current-state.json` for cross-session continuity accessible to both the Elixir application and external tooling.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Full quality score calculation | 200-500ms | All 13 domains scanned |
| Single domain scan | 15-50ms | Depends on domain complexity |
| Risk pattern scan (single file) | 5-20ms | AST parsing and [pattern matching](@/glossary/pattern-matching.md) |
| Pre-commit hook (10 files) | 100-300ms | Parallel file analysis |
| Quality DNA persistence | < 5ms | JSON serialization to disk |

### 5.2 Scalability

Domain scanners execute independently and can be parallelized. The Quality Floor Guardian's monitoring loop is single-threaded by design (one authoritative quality score), but individual domain scans are dispatched concurrently. Pattern detection scales linearly with the number of staged files.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 256 MB |
| CPU | 1 core | 2 cores (for parallel domain scanning) |
| Disk | 10 MB | 50 MB (Quality DNA history) |

## 6. Testing Strategy

### 6.1 Unit Tests

Each domain scanner has unit tests with known-violation and clean codebases to verify correct scoring. Risk pattern detection tests cover all 12 patterns with positive and negative samples. Quality Floor Guardian tests verify threshold transitions and response protocol activation.

### 6.2 Integration Tests

End-to-end tests exercise the full monitoring loop from quality check through score calculation, threshold comparison, and response protocol execution. Pre-commit hook integration tests verify that commits with risk patterns are correctly blocked.

### 6.3 Property-Based Testing

StreamData generators produce random quality domain scores to verify that the composite score is always within 0-100, threshold transitions are monotonic, and response protocols are correctly ordered by severity.

## 7. Security Considerations

### 7.1 Threat Model

The primary threat is quality enforcement bypass through `--no-verify` git flags or direct manipulation of the Quality DNA state file. Mitigations include CLAUDE.md policy enforcement (documenting `--no-verify` as absolutely forbidden), Quality DNA integrity verification through checksums, and telemetry alerts on unexpected quality score changes.

### 7.2 Access Control

Quality Floor Guardian operates as a platform-internal service without external access. Quality DNA writes are restricted to the Guardian process. Pre-commit hooks execute with the committing user's filesystem permissions.

## 8. Operational Considerations

### 8.1 Deployment

Prismatic Safety deploys as part of the umbrella [release](@/glossary/release.md). The pre-commit hook must be installed separately via `.githooks/` symlink. Quality DNA state is preserved across deployments through its file-based persistence.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :safety, :quality_check]`, `[:prismatic, :safety, :threshold_breach]`, `[:prismatic, :safety, :evolution_triggered]`, `[:prismatic, :safety, :emergency_activated]`. Key metrics include quality score trend, domain violation counts, evolution trigger frequency, and pre-commit rejection rate.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Quality score dropping | New violations introduced | Run `mix quality.gates` to identify domain |
| Evolution triggered unexpectedly | Threshold misconfiguration | Check `thresholds` in config |
| Pre-commit hook slow | Large number of staged files | Split commit into smaller changesets |
| Quality DNA stale | Guardian process not running | Verify application started; check [supervisor](@/glossary/supervisor.md) |

## 9. Future Work

Planned enhancements include machine learning-based risk pattern detection trained on historical violation data, cross-application quality impact analysis for dependency chains, visual quality trend dashboards with anomaly highlighting, integration with [GitLab CI](@/glossary/gitlab-ci.md) for server-side quality enforcement, and quality score gamification for developer engagement.

## References

- [Prismatic Annihilation](@/apps/prismatic-annihilation.md) -- Technical debt elimination engine
- [Prismatic Credo](@/apps/prismatic-credo.md) -- Static analysis integration
- [Prismatic Claude](@/apps/prismatic-claude.md) -- Session lifecycle integration
- [Prismatic Telemetry](@/apps/prismatic-telemetry.md) -- Quality metric infrastructure
- [Quality DNA](.claude/quality-dna/README.md) -- State persistence documentation

## Related Agents

- [Evidence Enforcement Agent](@/agents/evidence-enforcement-agent.md) -- Ensures quality floor assessments are evidence-based with verifiable violation tracking
- [CICD Guardrails Enforcer](@/agents/cicd-guardrails-enforcer.md) -- Enforces pre-commit quality protection and CI/CD pipeline gate integration
- [Evolution Orchestrator Supreme](@/agents/evolution-orchestrator-supreme.md) -- Coordinates automatic evolution triggers when quality thresholds breach critical levels

## Related Capabilities

- [Quality Gates](@/capabilities/quality-gates.md) -- 13-domain quality scoring with graduated response protocols from monitoring to emergency blocking
- [No Mercy](@/capabilities/no-mercy.md) -- Zero-tolerance enforcement doctrine driving the quality floor guardian's uncompromising standards
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Automatic evolution triggers and predictive pre-commit regression prevention

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)