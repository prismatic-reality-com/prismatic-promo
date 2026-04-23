+++
title = "cross-domain-quality-propagator"
weight = 106
[extra]
domain = "general"
level = "L3"
description = "Chain of custody for quality metrics ensuring cognitive accuracy and retrieval precision propagate consistently across all platform domains."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl", "mycelial-network", "quality-gates", "seadf"]
domain_normalized = "general"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1850
quality_score = 92
keywords = ["quality propagation", "cross-domain", "chain of custody", "cognitive accuracy", "retrieval precision", "mycelial network"]
tags = ["prismatic", "agent", "quality-assurance", "general-domain", "cross-domain"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cross-domain-quality-propagator - Prismatic Platform"
+++

## Overview

The Cross-Domain Quality Propagator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the General domain of the Prismatic Platform. This agent maintains the chain of custody for quality metrics, ensuring that cognitive accuracy and retrieval precision propagate consistently across all platform domains. In a system with 90 umbrella applications and hundreds of agents, quality cannot be enforced in isolation -- a quality improvement in one domain must propagate to dependent domains, and a quality regression in one area must be detected before it contaminates downstream consumers.

The fundamental challenge this agent addresses is quality coherence across domain boundaries. Individual domains may achieve excellent internal quality metrics while their cross-domain interactions introduce subtle quality degradation. Data transformed as it crosses domain boundaries may lose precision, gain latency, or accumulate errors that compound through processing pipelines. The Cross-Domain Quality Propagator monitors these cross-boundary quality flows, detecting degradation at the boundary and ensuring that quality standards are maintained end-to-end rather than merely point-to-point.

Quality propagation follows the [mycelial network](@/glossary/mycelial-network.md) architecture, using biological-inspired signal distribution to broadcast quality state changes throughout the platform ecosystem. When a domain's quality metrics change significantly -- whether through improvement or regression -- the quality signals propagate through the mycelial network, enabling dependent domains to adjust their behavior, recalibrate confidence scores, and trigger protective measures before degraded data reaches end users.

## Quality Chain of Custody

The chain of custody concept, borrowed from forensic science, ensures that quality metrics are tracked with full provenance throughout their lifecycle. Every quality measurement in the platform carries metadata recording when it was measured, which domain produced it, which measurement methodology was used, and how it has been transformed as it moved through processing stages.

This provenance tracking serves several purposes. It enables root cause analysis when quality regressions are detected, allowing engineers to trace a quality problem back to its source domain and specific measurement. It provides audit evidence demonstrating that quality standards were met at every processing stage. And it enables temporal analysis that reveals quality trends over time, identifying domains that are consistently improving and those that are gradually degrading.

The chain of custody encompasses both objective quality metrics (test pass rates, code coverage percentages, static analysis scores) and subjective quality indicators (intelligence confidence scores, data freshness assessments, source reliability ratings). Both categories are tracked with equal rigor because subjective quality indicators often have greater impact on downstream decision quality than objective code metrics.

Quality measurements are immutable once recorded. If a measurement is later found to be erroneous, it is not corrected in place but rather supplemented with a correction record that references the original measurement and explains the discrepancy. This immutability prevents quality history from being silently revised and ensures that trend analyses reflect the actual measurement history rather than a post-hoc cleaned version.

## Cognitive Accuracy Framework

Cognitive accuracy measures how faithfully the platform's processing operations preserve the meaning and significance of information as it flows through analytical pipelines. This is distinct from data accuracy (whether individual values are correct) and focuses instead on whether the conclusions drawn from data remain valid after processing.

The framework identifies several categories of cognitive accuracy loss. Aggregation loss occurs when detailed data is summarized in ways that obscure important distinctions. Translation loss occurs when data is converted between formats or representations with subtly different semantics. Context loss occurs when data is separated from the contextual information necessary for correct interpretation. Correlation loss occurs when relationships between data elements are severed during processing.

The propagator monitors for each category of cognitive accuracy loss at domain boundaries. When data crosses from the OSINT domain to the Intelligence domain, for example, the propagator verifies that aggregation operations preserve the distinctions that intelligence analysts need, that format translations maintain semantic fidelity, and that contextual information accompanies the data through the boundary crossing.

Cognitive accuracy is measured through calibration testing where the propagator sends known test data through cross-domain processing pipelines and verifies that the output preserves the essential characteristics of the input. Calibration test results are tracked over time to detect gradual cognitive accuracy degradation that might not be apparent from any single measurement.

## Retrieval Precision Propagation

Retrieval precision measures the platform's ability to find relevant information when it is needed, without returning excessive irrelevant results. The propagator ensures that retrieval precision standards are maintained across domain boundaries, where search and retrieval operations often interact with indexes, caches, and data stores maintained by different domains.

Cross-domain retrieval involves querying data that has been transformed and indexed by multiple domains. A search for a company name might retrieve results from the OSINT domain (web presence), the Czech domain (registry records), the financial domain (transaction records), and the compliance domain (screening results). The propagator ensures that each domain's retrieval components maintain precision standards and that cross-domain result merging does not introduce precision degradation through duplicate results, irrelevant matches, or missing results.

The propagator maintains precision baselines for key retrieval operations and monitors for deviations. When a domain's retrieval precision drops below its baseline, the propagator triggers investigation by the responsible domain team and may temporarily reduce the weight given to that domain's results in cross-domain retrieval until precision is restored.

Precision monitoring uses both automated testing with known-answer queries and sampling-based evaluation where human analysts assess the relevance of randomly selected retrieval results. The combination of automated and manual evaluation provides comprehensive precision monitoring that catches both systematic precision problems and subtle relevance issues that automated testing might miss.

## Quality Gate Integration

The propagator integrates with the platform's [quality gate](@/glossary/quality-gates.md) infrastructure to enforce quality standards at domain boundaries. Quality gates are checkpoints that data must pass through when crossing domain boundaries, verifying that the data meets the receiving domain's quality requirements before it is admitted.

Each quality gate implements domain-specific validation rules defined by the receiving domain. The OSINT domain requires source provenance metadata. The Intelligence domain requires minimum confidence scores. The Compliance domain requires data freshness within configurable thresholds. The propagator manages gate configuration, monitors gate pass rates, and reports on gate effectiveness.

Gate failure handling follows a configurable strategy. Hard gates reject non-compliant data entirely, preventing it from entering the receiving domain. Soft gates flag non-compliant data with quality warnings but allow it to proceed, enabling downstream processing to account for the quality issue. Progressive gates initially operate in soft mode and automatically escalate to hard mode when non-compliance rates exceed configurable thresholds.

## Cross-Domain Quality Metrics

The propagator maintains a comprehensive set of cross-domain quality metrics that provide platform-wide visibility into quality state. These metrics aggregate domain-level measurements into cross-domain indicators that reveal quality patterns invisible at the individual domain level.

End-to-end latency measures the time from data ingestion to intelligence product delivery, identifying bottlenecks in cross-domain processing chains. Data freshness tracks how current the platform's data is across all domains, highlighting domains where data staleness might affect intelligence quality. Cross-domain consistency measures whether different domains provide consistent information about the same entities, detecting inconsistencies that might indicate data quality issues.

Quality dashboards present these metrics to operators and domain owners, enabling proactive quality management rather than reactive quality firefighting. Trend analysis reveals gradual quality changes that might not trigger threshold-based alerts but indicate systemic issues requiring attention.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command with authority to define cross-domain quality standards, manage quality gates, and mandate quality improvements across domain boundaries.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [3nl-coordinator](@/agents/3nl-coordinator.md) | Quality Framework | Provides linguistic and logical quality analysis capabilities |
| [cross-pollination-specialist](@/agents/cross-pollination-specialist.md) | Pattern Sharing | Propagates quality improvement patterns across domains |
| [quality-floor-guardian](@/glossary/quality-floor-guardian.md) | Quality Monitoring | Monitors platform-wide quality floor and triggers alerts on regression |

## Enforcement

All quality propagation operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Quality gate bypasses are forbidden. Quality metric manipulation is treated as a security incident. Cross-domain quality regressions detected by the propagator trigger immediate investigation with blocking severity. Quality chain of custody records are immutable and tamper-evident. Every quality measurement must include methodology documentation sufficient for independent reproduction. Domains that consistently fail quality gates are escalated for remediation with mandatory improvement timelines.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)