+++
title = "deployment-health-monitor"
weight = 132
[extra]
domain = "infrastructure"
level = "L4"
description = "Real-time deployment health validation with automatic rollback triggers, canary analysis, pre/post baseline comparison, and multi-signal health correlation."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad", "telemetry"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["deployment-health-monitor", "Real-time", "agents", "agent", "Prismatic Platform", "Infrastructure", "Deployment Health", "Monitor"]
tags = ["agents", "agent", "deployment-health-monitor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "deployment-health-monitor - Prismatic Platform"
+++

## Overview

The Deployment Health Monitor is an L4 domain specialist operating within the Infrastructure domain of the Prismatic Platform. This agent provides real-time health validation during and immediately after deployment operations, monitoring a comprehensive set of health indicators to detect deployment-related issues before they impact users. When health [metrics](@/glossary/metrics.md) breach configurable thresholds during the deployment observation window, the monitor automatically triggers rollback procedures through the Deployment Rollback Specialist.

The observation window after a deployment is the most critical period for detecting issues that escaped testing. The Deployment Health Monitor tracks error rates, response latencies, database connection pool utilization, [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md) restart counts, and memory consumption patterns during this window. It compares these metrics against pre-deployment baselines to detect statistically significant deviations that indicate deployment-related regressions. The monitor's sensitivity is calibrated to detect real issues while avoiding false alarms from normal operational variance.

The monitor serves as the automated safety net that protects production service quality during the highest-risk period of every deployment. Without this continuous health validation, deployment issues that escaped testing would only be detected through user reports or manual monitoring, significantly extending the time to detection and the blast radius of deployment-related problems.

## Observation Window Management

The observation window is the period of heightened monitoring that follows every production deployment. The monitor manages this window through several distinct phases.

Pre-deployment baseline capture occurs before the deployment begins. The monitor collects current health metrics including error rates, response time distributions, resource utilization levels, and business metric baselines. These pre-deployment metrics serve as the reference against which post-deployment measurements are compared. Baseline capture spans a sufficient time window (typically 30 minutes) to establish statistically meaningful reference values that account for normal operational variance.

Active deployment monitoring engages when the deployment process begins. During this phase, the monitor increases its metric collection frequency from normal background monitoring rates to deployment-specific rates (typically every 5-10 seconds). This increased frequency provides rapid detection of issues that manifest during the deployment process itself, such as connection errors during rolling restarts or temporary latency spikes during traffic shifting.

Post-deployment observation continues for a configurable period (typically 15-30 minutes) after the deployment completes. This phase is critical for detecting issues that only manifest after the new version has been running under production load for some time, such as memory leaks, connection pool exhaustion, or cascading failures triggered by accumulated state changes.

Graduated relaxation progressively reduces monitoring intensity as the post-deployment window progresses without detected issues. If no anomalies are detected in the first 15 minutes, the monitor begins reducing collection frequency toward normal background rates. After the full observation window completes without issues, the monitor resumes standard monitoring mode.

## Multi-Signal Health Correlation

The monitor combines multiple health signals into a composite health assessment that is more reliable than any individual signal.

Error rate monitoring tracks the frequency and types of errors occurring across all platform endpoints. The monitor distinguishes between client errors (4xx status codes) that may reflect normal traffic patterns and server errors (5xx status codes) that likely indicate application issues. Error rate comparison against pre-deployment baselines uses statistical significance testing to detect genuine increases while filtering normal variance.

Response latency monitoring tracks the distribution of response times across all endpoints, focusing on p50, p95, and p99 percentiles. The monitor detects both median latency increases (suggesting general performance degradation) and tail latency increases (suggesting intermittent issues affecting a subset of requests). Latency comparison uses the pre-deployment distribution as the baseline, accounting for the natural variance in response times.

Resource utilization monitoring tracks CPU usage, memory consumption, and connection pool utilization for each application in the umbrella. The monitor detects resource utilization patterns that indicate potential issues such as steadily increasing memory consumption (suggesting a memory leak), connection pool approaching capacity (suggesting connection management issues), or CPU utilization spikes correlated with specific request patterns.

OTP supervision tree monitoring tracks the restart frequency of supervised processes. A deployment that causes increased process crashes will manifest as elevated supervision tree restart counts. The monitor compares restart rates against pre-deployment baselines and alerts when restart rates exceed normal levels.

Business metric monitoring tracks application-specific metrics that reflect business functionality. For example, intelligence query success rates, crawler data ingestion rates, and report generation throughput provide business-level indicators that complement technical health metrics. A deployment that passes all technical health checks but causes a drop in intelligence query success rates would be detected through this business metric layer.

## Canary Deployment Validation

For canary deployments, the monitor provides specialized validation that compares canary instance health against the stable fleet.

Canary isolation monitoring ensures that canary instances receive traffic proportional to the configured canary percentage, verifying that the traffic splitting mechanism is operating correctly. Incorrect traffic distribution could either under-expose the canary (missing issues) or over-expose it (amplifying the impact of potential issues).

Comparative analysis statistically compares error rates, latencies, and resource utilization between canary instances running the new version and stable instances running the previous version. This comparison eliminates external factors (traffic volume changes, upstream service variations) that affect both canary and stable instances equally, isolating the effect of the version change.

Progressive promotion recommendations advise the Deployment Commander on whether to increase the canary percentage, hold at the current percentage for additional observation, or roll back based on the canary analysis results. These recommendations include confidence levels that reflect the statistical strength of the comparison.

## Automatic Rollback Triggering

The monitor implements automatic rollback triggers that activate without human intervention when health metrics breach defined thresholds.

Threshold configuration defines the metric values that trigger rollback for each health signal. Thresholds are configured relative to pre-deployment baselines (for example, error rate exceeding baseline by more than 2x) rather than as absolute values, ensuring that thresholds adapt to the platform's normal operating characteristics.

Composite trigger evaluation combines multiple health signals into a single rollback decision. The monitor avoids triggering rollback on a single noisy metric by requiring that multiple signals agree before initiating rollback. A brief error rate spike accompanied by stable latency and resource utilization is likely a transient event, while simultaneous error rate increase and latency degradation strongly suggests a deployment-related issue.

Rollback execution coordination communicates the rollback decision to the Deployment Rollback Specialist with the triggering evidence (which metrics breached thresholds, by how much, and for how long). This evidence supports post-rollback analysis that determines whether the deployment issues can be fixed and re-deployed or whether more fundamental changes are needed.

## Deployment Impact Attribution

Distinguishing between deployment-related issues and concurrent external factors is essential for accurate health assessment.

External factor monitoring tracks environmental conditions that may affect health metrics independently of the deployment, including upstream service availability, network conditions, traffic volume patterns, and database performance. When health metric changes correlate with external factors, the monitor attributes the change to the external factor rather than the deployment.

Historical pattern matching compares observed metric patterns against historical deployment observations, identifying patterns that are characteristic of deployment issues versus patterns that are characteristic of normal operational variance. This historical context improves the monitor's ability to distinguish signal from noise.

## Authority Level

**L4** - Domain Specialist - Focused deployment health monitoring expertise with authority to trigger automatic rollbacks when health thresholds are breached during observation windows.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [deployment-commander-agent](@/agents/deployment-commander-agent.md) | Reports deployment health status and provides go/no-go recommendations | Deployment |
| [deployment-rollback-specialist](@/agents/deployment-rollback-specialist.md) | Triggers rollback procedures when deployment health thresholds are breached | Infrastructure |
| [health-monitoring-specialist](@/agents/health-monitoring-specialist.md) | Provides baseline health metrics for pre/post deployment comparison | Infrastructure |

## Enforcement

The Deployment Health Monitor operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every deployment must be monitored through its complete observation window. Monitoring cannot be bypassed or shortened for any reason. Automatic rollback triggers are non-overridable during the observation window. Health metric collection must be verified as operational before any deployment begins. Pre-deployment baseline capture is mandatory and must achieve minimum statistical significance before the deployment can proceed.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)