+++
title = "Prismatic Detection Engine"
weight = 46
[extra]
icon = "magnifying-glass-circle"
color = "amber"
description = "Rule-based and ML detection engine for threats, anomalies, and policy violations"
category = "Security"
files = "250"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 998
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Detection", "Engine", "Rule-based", "apps", "Security", "Prismatic Platform", "YAML", "PrismaticDetectionEngine", "Rule"]
tags = ["apps", "security", "prismatic-detection-engine", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Detection Engine - Prismatic Platform"
+++

## Overview

Prismatic Detection Engine combines rule-based and statistical detection methods to identify threats, anomalies, and policy violations across all platform intelligence streams. It processes events from [OSINT](@/glossary/osint.md) collection, security scans, and system monitoring to generate actionable findings with severity scores, evidence links, and recommended response actions.

The engine supports two complementary detection paradigms. Rule-based detection uses YAML-defined rules with Sigma compatibility for precise, deterministic matching against known threat patterns. Statistical detection employs time-series anomaly scoring, behavioral baseline deviation, and clustering algorithms to surface previously unknown threats that evade signature-based approaches. Both paradigms feed findings into a unified management layer that handles deduplication, correlation, and MITRE ATT&CK technique mapping.

Detection rules are version-controlled and support A/B testing, allowing security teams to evaluate new detection logic against historical data before promoting rules to production. The engine integrates tightly with [Prismatic Signals](@/apps/prismatic-signals.md) for real-time event ingestion and with [Prismatic Traits](@/apps/prismatic-traits.md) for behavioral baseline computation. The [NABLA](@/glossary/nabla-infinity.md) framework's [signal plurality](@/glossary/signal-plurality.md) axiom is enforced throughout the detection pipeline: findings from a single detection method are flagged as preliminary until corroborated by an independent method, preventing false positive proliferation that erodes analyst trust.

## Architecture

```
Event Sources --> Ingestion Layer --> Detection Pipeline --> Finding Store
      |               |                  |                  |
  OSINT Data      Normalization     Rule Engine         Deduplication
  Scan Results    Schema Mapping    Anomaly Detector    Correlation
  System Events   Enrichment        Pattern Matcher     ATT&CK Mapping
                                         |
                                  Alert Generation
                                         |
                                  Response Actions
```

The pipeline is built on [GenStage](@/glossary/genstage.md) for [backpressure](@/glossary/backpressure.md)-aware processing. Each detection stage runs as a supervised [OTP](@/glossary/otp.md) process, enabling independent scaling of rule evaluation and statistical computation based on load. The separation of detection stages means that adding new detection methods requires only implementing a new stage module and registering it with the pipeline supervisor.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticDetectionEngine` | Public facade: `evaluate/1`, `load_rules/1`, `anomaly_score/2`, `findings/1` |
| `PrismaticDetectionEngine.Application` | OTP application entry point and supervision tree |
| `PrismaticDetectionEngine.RuleEngine` | YAML rule parsing, compilation, and evaluation |
| `PrismaticDetectionEngine.AnomalyDetector` | Statistical anomaly detection with baseline management |
| `PrismaticDetectionEngine.PatternMatcher` | Multi-condition pattern matching with temporal operators |
| `PrismaticDetectionEngine.FindingStore` | Finding persistence, deduplication, and query interface |
| `PrismaticDetectionEngine.MitreMapper` | MITRE ATT&CK technique classification for findings |
| `PrismaticDetectionEngine.AlertGenerator` | Severity-based alert routing and notification dispatch |
| `PrismaticDetectionEngine.RuleCompiler` | YAML rule compilation into optimized intermediate representation |

## Key Features

### Rule Engine

The rule engine processes YAML-defined detection rules with a rich condition language supporting boolean logic, field comparisons, regular expressions, and temporal operators. Rules are compiled into an intermediate representation at load time for efficient evaluation against event streams. The compilation step transforms YAML conditions into an optimized match tree that evaluates in constant time per event regardless of rule complexity.

- YAML-defined detection rules with multi-condition logic and boolean operators
- Sigma rule compatibility for industry-standard threat detection patterns
- Temporal operators for sequence-based and time-windowed rules
- Rule versioning, A/B testing, and effectiveness scoring

```yaml
# Example detection rule in YAML
title: Suspicious DNS Resolution Pattern
id: dns-tunnel-detection-001
status: production
severity: high
mitre:
  technique: T1071.004
  tactic: command-and-control
detection:
  condition: selection AND NOT filter
  selection:
    event_type: dns_query
    query_length: ">50"
    query_entropy: ">4.0"
  filter:
    domain|endswith:
      - ".googleapis.com"
      - ".microsoft.com"
  timeframe: 5m
  threshold:
    count: 10
    field: source_ip
```

### Rule Compilation Pipeline

Rules pass through a multi-stage compilation pipeline that transforms human-readable YAML into an optimized evaluation structure:

```elixir
defmodule PrismaticDetectionEngine.RuleCompiler do
  @spec compile(String.t()) :: {:ok, CompiledRule.t()} | {:error, list(CompileError.t())}
  def compile(yaml_content) do
    with {:ok, parsed} <- YamlElixir.read_from_string(yaml_content),
         {:ok, validated} <- validate_schema(parsed),
         {:ok, conditions} <- compile_conditions(validated["detection"]),
         {:ok, mitre_map} <- resolve_mitre_mapping(validated["mitre"]) do
      {:ok, %CompiledRule{
        id: validated["id"],
        title: validated["title"],
        severity: parse_severity(validated["severity"]),
        conditions: conditions,
        mitre: mitre_map,
        compiled_at: DateTime.utc_now()
      }}
    end
  end
end
```

### Statistical Detection

- Time-series anomaly detection using z-score and CUSUM algorithms
- Behavioral baseline computation with configurable training windows
- Clustering for pattern discovery across entity populations
- Predictive models for emerging threat trajectory analysis

```elixir
# Anomaly detection configuration
defmodule PrismaticDetectionEngine.AnomalyDetector do
  @spec compute_baseline(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def compute_baseline(entity_id, opts \\ []) do
    window = Keyword.get(opts, :window, :days_30)
    method = Keyword.get(opts, :method, :z_score)

    with {:ok, historical} <- fetch_historical_metrics(entity_id, window),
         {:ok, baseline} <- calculate_baseline(historical, method) do
      {:ok, %{
        entity: entity_id,
        baseline: baseline,
        method: method,
        window: window,
        computed_at: DateTime.utc_now()
      }}
    end
  end

  @spec score(String.t(), map()) :: {:ok, AnomalyScore.t()} | {:error, term()}
  def score(entity_id, current_metrics) do
    with {:ok, baseline} <- fetch_baseline(entity_id),
         {:ok, deviation} <- compute_deviation(current_metrics, baseline) do
      {:ok, %AnomalyScore{
        entity: entity_id,
        score: deviation.magnitude,
        method: baseline.method,
        dimensions: deviation.per_dimension,
        anomalous: deviation.magnitude > baseline.threshold
      }}
    end
  end
end
```

### Finding Management

- Severity-scored findings with linked evidence artifacts
- Automatic deduplication across detection methods and time windows
- False positive management with feedback-driven tuning
- MITRE ATT&CK technique mapping for standardized threat classification

| Severity | Score Range | Response SLA | Auto-Actions |
|----------|-------------|--------------|--------------|
| Critical | 9.0-10.0 | Immediate | Alert, escalate, log |
| High | 7.0-8.9 | 4 hours | Alert, log |
| Medium | 4.0-6.9 | 24 hours | Log, queue review |
| Low | 1.0-3.9 | 72 hours | Log |
| Info | 0.1-0.9 | N/A | Log only |

### False Positive Management

The false positive management system uses analyst feedback to continuously improve detection accuracy. When an analyst marks a finding as a false positive, the system records the event context, rule ID, and dismissal reason. This feedback corpus is analyzed periodically to identify rules producing excessive false positives and to generate tuning recommendations:

| Feedback Action | Effect | Automation |
|-----------------|--------|------------|
| Mark as false positive | Suppress similar future findings | Automatic suppression rule generated |
| Confirm as true positive | Increase rule confidence weight | Weight adjustment propagated to scoring |
| Reclassify severity | Adjust severity model | Statistical model retrained |
| Add context | Enrich evidence chain | Context linked to finding provenance |

## Usage

```elixir
# Evaluate an event against all active detection rules
{:ok, findings} = PrismaticDetectionEngine.evaluate(event)

# Load detection rules from YAML directory
{:ok, loaded} = PrismaticDetectionEngine.load_rules("rules/network/*.yaml")
# => %{loaded: 47, valid: 45, errors: 2}

# Compute anomaly score for entity metrics
{:ok, score} = PrismaticDetectionEngine.anomaly_score(entity, metrics)
# => %{score: 3.2, baseline: 1.1, deviation: :high}

# Query findings for a specific entity
{:ok, findings} = PrismaticDetectionEngine.findings(
  entity: "example.com",
  severity: [:high, :critical],
  from: ~U[2026-01-01 00:00:00Z]
)

# A/B test a new rule against historical data
{:ok, results} = PrismaticDetectionEngine.ab_test(
  rule: new_rule,
  dataset: :last_30_days,
  compare_against: existing_rule
)
# => %{new_detections: 12, false_positives: 1, improvement: 0.23}
```

## NABLA Compliance

| NABLA Axiom | Detection Engine Enforcement | Implementation |
|-------------|------------------------------|----------------|
| Provenance Mandatory | Every finding includes rule ID, matched evidence, and source events | Full detection provenance chain |
| Signal Plurality | Findings require corroboration from multiple detection methods | Cross-method correlation before high-confidence classification |
| Source Independence | Rule-based and statistical detection operate independently | Separate GenStage stages with independent state |
| Time Decay | Finding confidence decays without re-confirmation | Temporal metadata on all findings with freshness scoring |
| Contradiction Preservation | Conflicting detections preserved for analyst review | Both rule-based and statistical results maintained independently |

## Testing

Detection rule tests use crafted event fixtures that should trigger specific rules and negative fixtures that should not match. Statistical detection tests verify baseline computation accuracy, anomaly scoring precision, and false positive rates against labeled datasets. Integration tests exercise the full pipeline from event ingestion through detection, finding storage, and alert generation.

Property-based tests generate random events to verify that no detection rule produces unbounded findings and that the pipeline maintains [backpressure](@/glossary/backpressure.md) under load. Rule compilation tests verify YAML parsing correctness, condition tree construction, and Sigma compatibility across all supported rule formats.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Signals](@/apps/prismatic-signals.md) | Real-time event stream ingestion for detection processing |
| [Prismatic Traits](@/apps/prismatic-traits.md) | Behavioral baselines for anomaly detection thresholds |
| [Prismatic IR PVM](@/apps/prismatic-ir-pvm.md) | Finding escalation triggers incident creation |
| [Prismatic OSINT Monitoring](@/apps/prismatic-osint-monitoring.md) | OSINT change events as detection inputs |
| [Prismatic Perimeter Core](@/apps/prismatic-perimeter-core.md) | [Security rating](@/glossary/security-rating.md) adjustments based on detection findings |
| [Prismatic Safety](@/apps/prismatic-safety.md) | Safety constraints on automated detection responses |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Rule evaluation (single event) | < 10ms | Compiled rules, ETS-backed |
| Anomaly scoring | < 50ms | Against pre-computed baselines |
| Finding deduplication | < 5ms | Hash-based with time window |
| Alert generation | < 100ms | Including notification dispatch |
| Rule loading (100 rules) | < 2s | YAML parse + compilation |
| A/B test (30-day dataset) | 5-30s | Depends on event volume |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :detection, :rule_match]`, `[:prismatic, :detection, :anomaly_scored]`, `[:prismatic, :detection, :finding_created]`.

## Related Resources

- [Prismatic Hawkeye](@/apps/prismatic-hawkeye.md) -- Visitor behavior detection for web threat analysis
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Configures detection rule alerting thresholds and false positive management
- [GitLab Security Specialist Agent](@/agents/gitlab-security-specialist-agent.md) -- Reviews detection rule logic for security coverage gaps
- [Evolution Analyzer Specialist](@/agents/evolution-analyzer-specialist.md) -- Analyzes detection rule effectiveness and recommends optimization
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Correlates detection findings across methods into unified threat assessments
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Real-time event ingestion and detection pipeline monitoring
- [Color Teams](@/capabilities/color-teams.md) -- Red Team patterns feed detection rule development while Blue Team validates coverage

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)