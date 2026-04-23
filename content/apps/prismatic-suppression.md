+++
title = "Prismatic Suppression"
weight = 60
[extra]
icon = "x-circle"
color = "gray"
description = "Alert suppression, noise reduction, and false positive management"
category = "Operations"
files = "95"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1300
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Suppression", "Alert", "apps", "Operations", "Prismatic Platform", "During"]
tags = ["apps", "operations", "prismatic-suppression", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Suppression - Prismatic Platform"
+++

## Overview

Prismatic Suppression manages alert fatigue by providing intelligent noise reduction, false positive management, and alert suppression capabilities. In a platform that continuously monitors [attack surface](@/glossary/attack-surface.md)s, analyzes influence operations, scans communications for manipulation, and processes IoT sensor data, the raw volume of findings can overwhelm even experienced analysts. Without intelligent filtering, critical findings drown in a sea of expected, benign, or duplicate alerts. Suppression ensures that analyst attention is directed to findings that actually matter.

The module learns from analyst feedback to automatically tune detection sensitivity and filter out known benign patterns. When an analyst marks a finding as a false positive, Suppression records the decision with context and generates a candidate suppression rule. After enough consistent feedback on similar findings, the rule is automatically promoted from candidate to active, reducing future noise without manual rule authoring. This feedback loop means the platform becomes more precise over time as analysts interact with it.

Suppression also provides maintenance window support. During planned infrastructure changes -- certificate rotations, DNS migrations, server maintenance -- the module temporarily suppresses findings that would be expected consequences of the change, preventing a flood of known-benign alerts from distracting analysts from genuine issues.

## Architecture

```
Finding Input Stream
       |
  Rule Engine (ETS-backed pattern matching)
       |
  +----+----+----+
  |         |         |
Match     Pass      Demote
(suppress) (deliver) (lower priority)
  |         |         |
Audit Log  Analyst   Secondary
           Console   Review Queue
       |
  Feedback Processor
       |
  +----+----+
  |         |
Candidate  Active
Rules      Rules
```

Suppression is implemented as a [GenServer](@/glossary/genserver.md) maintaining a rule set in [ETS](@/glossary/ets.md) for fast [pattern matching](@/glossary/pattern-matching.md) on every incoming finding. The **Rule Engine** evaluates findings against active suppression rules using pattern matching on finding attributes (source, type, entity, severity). The **Feedback Processor** collects analyst decisions, identifies patterns in false positive reports, and generates candidate rules. The **Maintenance Scheduler** manages time-windowed suppression rules that automatically activate and deactivate based on scheduled maintenance events.

All suppression decisions are logged to [PostgreSQL](@/glossary/postgresql.md) for auditability, and [Telemetry](@/glossary/telemetry.md) events track suppression rates, false positive rates, and analyst feedback [metrics](@/glossary/metrics.md).

## Rule Engine Design

The Rule Engine is the performance-critical component of the Suppression system. Every finding that enters the platform must be evaluated against all active suppression rules before being delivered to analysts, making rule evaluation latency a direct contributor to end-to-end finding delivery time. The engine achieves sub-millisecond evaluation by maintaining compiled rule sets in ETS and using Elixir's pattern matching capabilities for efficient multi-attribute comparison.

Rules are organized into a priority hierarchy. Entity-specific rules (targeting a specific domain or IP address) take precedence over source-specific rules (targeting all findings from a particular OSINT provider), which take precedence over type-specific rules (targeting all findings of a certain category). This hierarchy prevents overly broad rules from inadvertently masking targeted rules and provides predictable behavior when multiple rules apply to the same finding.

Each rule carries metadata that supports lifecycle management: a creation timestamp, an expiration date (mandatory for all rules to prevent permanent blind spots), a creator identifier (analyst or automated system), a match counter (tracking how many findings the rule has suppressed), and a confidence score (reflecting the strength of evidence supporting the rule). Rules that expire are automatically deactivated and moved to an archive for historical analysis.

## Feedback-Driven Learning

The Feedback Processor implements a statistical approach to automatic rule generation. When analysts mark findings as false positives, the processor records the finding's attributes and the analyst's reason code. Over time, patterns emerge -- if five or more findings with the same combination of source, type, and entity pattern are marked as false positives with consistent reason codes, the processor generates a candidate suppression rule.

Candidate rules undergo a validation period before promotion to active status. During this period, the system logs which findings would have been suppressed by the candidate rule, allowing analysts to review the proposed rule's impact without actually suppressing any findings. If the candidate rule's projected suppression targets align with analyst expectations (measured by the ratio of would-have-been-suppressed findings that analysts continue to mark as false positives), the rule is promoted to active status.

This two-phase approach prevents premature rule activation. A burst of similar findings that analysts initially dismiss might later prove to contain genuine threats as the investigation progresses. The validation period provides a buffer that catches these situations before the system commits to suppression.

## Key Features

### Suppression Rules
- Pattern-based alert suppression matching on any combination of finding attributes
- Time-windowed suppression for maintenance windows with automatic activation and expiry
- Source-specific noise filtering targeting known-noisy data sources with adjusted thresholds
- Entity-level suppression with mandatory expiry preventing permanent blind spots

### False Positive Management
- Analyst feedback collection with structured reason codes and context
- Automatic rule generation from consistent feedback patterns across multiple analysts
- False positive rate monitoring per detection rule for continuous tuning effectiveness measurement
- Rule tuning recommendations surfacing detection rules with highest false positive rates

### Noise Reduction
- Signal-to-noise ratio optimization using adaptive scoring based on entity context
- Duplicate alert consolidation grouping related findings into single enriched alerts
- Low-confidence finding demotion moving uncertain results to a secondary review queue
- Contextual relevance scoring adjusting finding priority based on the target entity's profile

## Maintenance Window Support

Maintenance windows represent a critical operational challenge for continuous monitoring platforms. When an organization performs a planned certificate rotation, the platform would normally detect the certificate change and generate findings about TLS configuration modifications. Without maintenance window support, these expected changes produce a burst of findings that dilute analyst attention and reduce trust in the alerting system.

The Maintenance Scheduler accepts structured maintenance window declarations that specify the affected entity, the expected change types, and the time window. During the maintenance window, findings matching the declared change types for the specified entity are automatically suppressed with a special maintenance disposition that distinguishes them from false positive suppressions in audit records.

After the maintenance window closes, the Scheduler performs a reconciliation check. Findings that occurred during the window but do not match the expected change types are released from suppression and delivered to analysts with a flag indicating they occurred during a maintenance period. This ensures that genuinely unexpected changes during maintenance are not lost.

## Usage

```elixir
# Create a suppression rule for expected findings
PrismaticSuppression.suppress(%{
  pattern: %{source: :shodan, type: :open_port, port: 80},
  entity: "example.com",
  reason: "Known web server, expected open port",
  expires: ~U[2026-03-01 00:00:00Z]
})

# Create a maintenance window suppression
PrismaticSuppression.maintenance_window(%{
  entity: "example.com",
  description: "Certificate rotation",
  suppress_types: [:certificate_expiry, :tls_change],
  starts: ~U[2026-02-15 02:00:00Z],
  ends: ~U[2026-02-15 06:00:00Z]
})

# Report a false positive with context
PrismaticSuppression.false_positive(finding_id,
  analyst: "analyst@prismatic.io",
  reason: :known_infrastructure,
  context: "Internal monitoring endpoint, not externally accessible")

# Get suppression effectiveness statistics
{:ok, stats} = PrismaticSuppression.stats()
# => %{active_rules: 47, findings_suppressed_24h: 1_230,
#      false_positive_rate: 0.03, analyst_feedback_pending: 5}
```

## Testing

```bash
mix test apps/prismatic_suppression/test
mix test apps/prismatic_suppression/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Rule Matching | 12 | Pattern evaluation, priority ordering, expiration |
| Feedback Processing | 8 | Candidate generation, validation, promotion |
| Maintenance Windows | 6 | Activation, deactivation, reconciliation |
| Noise Reduction | 8 | Deduplication, demotion, relevance scoring |
| Audit Trail | 4 | Complete decision logging, provenance tracking |

## Integration Points

Suppression sits in the finding delivery path for every detection module. [Prismatic Perimeter](@/apps/prismatic-perimeter.md) routes [EASM](@/glossary/easm.md) findings through Suppression before dashboard display. [Prismatic Influence](@/apps/prismatic-influence.md) and [Prismatic Manipulation](@/apps/prismatic-manipulation.md) filter alerts through Suppression to prevent analyst fatigue. [Prismatic Embodiment](@/apps/prismatic-embodiment.md) sensor alerts pass through Suppression's noise reduction before triggering responses via [Prismatic Override](@/apps/prismatic-override.md).

## NABLA Compliance

Suppression decisions are fully auditable, with every suppressed finding logged with the rule that matched, the rule's creator, and the suppression timestamp, satisfying the Provenance Mandatory axiom. The Contradiction Preservation axiom is respected by logging suppressed findings rather than discarding them -- all findings remain accessible in the audit trail even when they are not surfaced to analysts. The Absence Informative axiom guides the system's approach to rule expiration: the absence of a finding that was previously common is itself informative and may indicate that a suppression rule is masking a genuine change. Expiration dates prevent this masking from becoming permanent.

## Performance

| Metric | Value |
|--------|-------|
| Rule evaluation latency | Sub-millisecond per finding |
| Active rule capacity | 10,000+ rules in ETS |
| Feedback processing | Near real-time |
| Maintenance window accuracy | 100% (deterministic time matching) |
| Audit log write latency | Milliseconds (PostgreSQL) |

## Related Components

- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) -- EASM findings filtered through suppression rules
- [Prismatic Override](@/apps/prismatic-override.md) -- Emergency suppression during [incident response](@/glossary/incident-response.md)
- [Prismatic Influence](@/apps/prismatic-influence.md) -- Influence campaign alerts filtered for noise reduction
- [Prismatic CER](@/apps/prismatic-cer.md) -- Suppression audit logs stored for compliance review

## Related Agents

- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Manages alert lifecycle and noise reduction strategies
- [Evolution Analyzer Specialist](@/agents/evolution-analyzer-specialist.md) -- Analyzes suppression rule effectiveness and recommends tuning
- [Evidence Enforcement Agent](@/agents/evidence-enforcement-agent.md) -- Ensures suppression decisions are backed by documented rationale

## Related Capabilities

- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Continuous signal-to-noise ratio monitoring across all detection modules
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-source alert correlation for intelligent deduplication
- [Quality Gates](@/capabilities/quality-gates.md) -- Validates suppression rules do not inadvertently mask genuine threats

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)