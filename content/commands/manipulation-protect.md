+++
title = "/manipulation-protect"
weight = 1120
[extra]
category = "Defensive Security"
description = "Activate manipulation protection defenses"
syntax = "/manipulation-protect [options]"
authority = "L3"
agent = "manipulation-detector"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1443
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-protect", "Activate", "commands", "Defensive Security", "Prismatic Platform", "Protection", "Maximum", "Lockdown"]
tags = ["commands", "defensive-security", "manipulation-protect", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/manipulation-protect - Prismatic Platform"
+++

## Overview

**/manipulation-protect** is a production command in the **Defensive Security** category of the Prismatic Platform that activates, configures, and manages manipulation protection defenses across the platform's epistemic systems. When [/manipulation-detect](@/commands/manipulation-detect.md) identifies manipulation attempts, this command deploys countermeasures that harden the platform against ongoing and future epistemic attacks. The protection system operates at multiple layers -- from individual agent hardening to platform-wide signal validation enforcement.

This command operates under the **L3** authority level and is executed by the `manipulation-detector` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level ensures that only authorized operators with security clearance can activate or modify protection defenses, preventing unauthorized weakening of the platform's epistemic integrity.

Manipulation protection in the Prismatic Platform is built on the defense-in-depth principle. No single protection mechanism is considered sufficient. Instead, the system deploys overlapping layers of defense that address each of the five manipulation categories: truth distortion protection (enhanced fact verification), confidence manipulation protection (statistical boundary enforcement), signal poisoning protection (source validation strengthening), drift induction protection (tighter baseline deviation thresholds), and salience hijacking protection (attention distribution monitoring).

The protection system integrates directly with the [NABLA](@/glossary/nabla-infinity.md) epistemic framework. When protection is activated, the NABLA axiom enforcement thresholds are tightened. Signal plurality requirements increase from 2 to 3 independent sources. Confidence scores require additional corroboration. Provenance chains must be complete and verifiable. These tighter requirements reduce the platform's susceptibility to epistemic attacks at the cost of slightly reduced processing speed and increased false-positive rates, a tradeoff that is acceptable during active threat conditions.

The [Blue Team](@/glossary/blue-team.md) develops and validates protection strategies through continuous adversarial testing with the [Red Team](@/glossary/red-team.md). The [Purple Team](@/glossary/purple-team.md) synthesizes findings from both teams to close the Red-Blue loop, ensuring that protection defenses are effective against known attack patterns and adaptive to novel techniques.

## Architecture

The protection system operates as a multi-layer defense deployment engine with configurable defense profiles and real-time effectiveness monitoring.

### Protection Architecture

```
/manipulation-protect -> Defense Controller -> Layer Deployer -> Monitor
                              |                     |              |
                              v                     v              v
                        Profile Loader         Agent Layer     Effectiveness
                        Rule Compiler          Channel Layer   False Positive
                        Threshold Config       Domain Layer    Performance
                        Policy Enforcer        Platform Layer  Adaptation
```

### Defense Layers

| Layer | Scope | Protection Mechanisms | Performance Impact |
|-------|-------|----------------------|-------------------|
| **Agent** | Individual agent | Input validation, output verification, behavior constraints | Low (< 5ms per request) |
| **Channel** | Data stream | Source authentication, integrity checks, rate limiting | Low (< 10ms per stream) |
| **Domain** | Analysis domain | Cross-validation requirements, confidence floor enforcement | Medium (< 50ms per analysis) |
| **Pipeline** | Intelligence pipeline | End-to-end provenance verification, plurality enforcement | Medium (< 100ms per pipeline run) |
| **Platform** | Entire platform | Global threshold tightening, emergency lockdown capability | Variable |

### Defense Profiles

| Profile | Description | Threshold Tightening | Use Case |
|---------|-------------|---------------------|----------|
| **Standard** | Default protection level | Baseline NABLA thresholds | Normal operations |
| **Elevated** | Increased vigilance | +20% threshold tightening | Elevated threat conditions |
| **High** | Active defense posture | +50% threshold tightening | Probable manipulation detected |
| **Maximum** | Full defensive mode | Maximum threshold enforcement | Confirmed attack in progress |
| **Lockdown** | Emergency restriction | All external inputs quarantined | Critical epistemic crisis |
| **Custom** | User-defined profile | Configurable per mechanism | Specific threat response |

### Protection Mechanisms

| Mechanism | Category | Description | NABLA Axiom |
|-----------|----------|-------------|-------------|
| **Enhanced Fact Verification** | Truth Distortion | Multi-source fact checking before knowledge base updates | Signal Plurality |
| **Confidence Boundary Enforcement** | Confidence Manipulation | Statistical bounds on confidence score changes | Contradiction Preservation |
| **Source Authentication** | Signal Poisoning | Cryptographic verification of signal sources | Provenance Mandatory |
| **Drift Threshold Tightening** | Drift Induction | Reduced tolerance for behavioral deviation | Time Decay |
| **Attention Distribution Monitoring** | Salience Hijacking | Enforced attention balance across targets | Source Independence |
| **Provenance Chain Verification** | All Categories | End-to-end provenance for all knowledge updates | Provenance Mandatory |
| **Plurality Enforcement** | All Categories | Increased minimum source count for beliefs | Signal Plurality |
| **Quarantine System** | All Categories | Isolation of suspicious inputs pending review | Unknown Valid |

## Usage

```bash
# Activate elevated protection
/manipulation-protect activate --profile=elevated

# Activate maximum protection
/manipulation-protect activate --profile=maximum

# Activate protection for specific layer
/manipulation-protect activate --layer=agent --target=sig-osint-commander --profile=high

# Activate protection for specific category
/manipulation-protect activate --category=signal-poisoning --profile=high

# View current protection status
/manipulation-protect status

# View protection for specific agent
/manipulation-protect status --agent=sig-osint-commander

# Deactivate protection (return to standard)
/manipulation-protect deactivate --profile=elevated

# Configure custom protection profile
/manipulation-protect configure --profile=custom-response \
  --plurality-minimum=3 --confidence-floor=0.7 \
  --drift-threshold=0.05 --source-auth=required

# Enable emergency lockdown
/manipulation-protect lockdown --reason="Confirmed epistemic attack on intelligence pipeline"

# Release lockdown
/manipulation-protect release-lockdown --verification="blue-team-clearance-2026-042"

# Quarantine specific input
/manipulation-protect quarantine --source="external-feed-alpha" \
  --reason="Suspected signal poisoning"

# Review quarantined items
/manipulation-protect quarantine --list
/manipulation-protect quarantine --review=QRN-2026-001

# Release quarantined item
/manipulation-protect quarantine --release=QRN-2026-001 --verification="analyst-approval"

# View protection effectiveness metrics
/manipulation-protect metrics --period=7d

# Export protection configuration
/manipulation-protect export --format=json --output=protection-config.json
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `action` | string | status | Action: activate, deactivate, status, configure, lockdown, release-lockdown, quarantine, metrics, export |
| `--profile` | string | standard | Protection profile: standard, elevated, high, maximum, lockdown, custom |
| `--layer` | string | all | Target layer: agent, channel, domain, pipeline, platform |
| `--target` | string | all | Specific target within layer |
| `--category` | string | all | Manipulation category to protect against |
| `--reason` | string | required for lockdown | Justification for protection activation |
| `--verification` | string | required for release | Verification code for lockdown release |
| `--source` | string | none | Source to quarantine |
| `--plurality-minimum` | integer | 2 | Minimum source count for custom profiles |
| `--confidence-floor` | float | 0.5 | Minimum confidence for custom profiles |
| `--drift-threshold` | float | 0.1 | Maximum drift tolerance for custom profiles |
| `--source-auth` | string | recommended | Source authentication: optional, recommended, required |
| `--period` | string | 24h | Metrics reporting period |
| `--format` | string | text | Output format: text, json, markdown |
| `--output` | string | stdout | Output file path |

## Execution Flow

1. **Profile Resolution**: The requested protection profile is resolved, loading all associated threshold values, mechanism configurations, and enforcement policies. Custom profiles are compiled from provided parameters.

2. **Current State Assessment**: The current protection state is assessed to determine what changes are needed. Upgrading from standard to elevated requires different actions than upgrading from elevated to maximum.

3. **Layer Deployment**: Protection mechanisms are deployed across the specified layers. Each layer receives its appropriate mechanism configurations. Deployment is atomic -- either all mechanisms deploy successfully or the entire activation is rolled back.

4. **NABLA Threshold Adjustment**: The NABLA framework's enforcement thresholds are adjusted according to the protection profile. Plurality requirements, confidence floors, provenance depth, and time decay parameters are all updated.

5. **Agent Hardening**: Individual agents receive updated behavioral constraints. Input validation rules are tightened. Output verification requirements are increased. Cross-validation frequencies are adjusted.

6. **Channel Protection**: Intelligence channels receive enhanced source authentication requirements, integrity checking, and rate limiting. Suspicious sources may be automatically quarantined.

7. **Monitoring Activation**: Enhanced monitoring is activated alongside protection mechanisms. The monitoring system tracks protection effectiveness, false positive rates, and performance impact in real-time.

8. **Effectiveness Tracking**: All protection activations are tracked with timestamps, triggering events, and effectiveness metrics. This data feeds the protection optimization loop and provides evidence for protection decisions.

9. **Notification**: Relevant operators and agents are notified of protection state changes. The [/manipulation-dashboard](@/commands/manipulation-dashboard.md) is updated to reflect the new protection posture.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `manipulation-detector` | Defense deployment and monitoring |
| [/manipulation-detect](@/commands/manipulation-detect.md) | Detection triggers | Detections trigger protection activation |
| [/manipulation-dashboard](@/commands/manipulation-dashboard.md) | Status display | Protection status shown in dashboard |
| [/manipulation-techniques](@/commands/manipulation-techniques.md) | Countermeasure reference | Technique-specific countermeasure deployment |
| [Color-Team](@/glossary/color-teams.md) | Security framework | Blue Team defense strategies |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Threshold management | Axiom enforcement level adjustment |
| [Quality Gates](@/glossary/quality-gates.md) | Quality integration | Protection integrated into quality checks |
| [Telemetry](@/glossary/telemetry.md) | Event tracking | Protection events logged |
| [/emergency](@/commands/emergency.md) | Crisis coordination | Lockdown coordinated with emergency protocol |

## Best Practices

**Escalate protection gradually.** Start with elevated protection and increase to high or maximum only if the threat persists or escalates. Maximum protection significantly impacts processing speed and increases false positives.

**Monitor false positive rates.** Protection mechanisms that are too aggressive create operational friction. Track false positive rates through `/manipulation-protect metrics` and adjust thresholds if false positives exceed 5% of total checks.

**Use custom profiles for targeted threats.** When the specific manipulation technique is identified, create a custom profile that targets that technique aggressively while leaving other mechanisms at standard levels. This minimizes collateral impact.

**Document lockdown reasons thoroughly.** Lockdowns are the most disruptive protection action. Clear, specific documentation of the triggering event and the expected conditions for release ensures that lockdowns are released promptly when safe.

**Review quarantine regularly.** Quarantined inputs accumulate if not reviewed. Establish a regular review cadence (daily during active threats, weekly during normal operations) to prevent legitimate data from being indefinitely blocked.

**Test protection effectiveness with Red Team.** Periodically activate protection profiles and run Red Team scenarios to validate that defenses are effective. Protection mechanisms that have not been tested against adversarial scenarios provide false confidence.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `authority_insufficient` | Operator lacks L3 authority | Request authority elevation |
| `profile_not_found` | Specified protection profile does not exist | Use built-in profile or create custom one |
| `lockdown_requires_reason` | Lockdown requested without justification | Provide `--reason` parameter |
| `release_requires_verification` | Lockdown release without verification code | Obtain verification from Blue Team commander |
| `deployment_failed` | Protection mechanism failed to deploy | Check system health, review deployment logs |
| `threshold_conflict` | Custom thresholds conflict with system requirements | Adjust custom thresholds to be within valid ranges |
| `quarantine_full` | Quarantine capacity exceeded | Review and release cleared items |
| `target_not_found` | Specified protection target does not exist | Verify target name with system inventory |

## Advanced Usage

### Automated Response Chains

Configure automated protection responses triggered by detection events.

```bash
# Auto-activate elevated on YELLOW threat
/manipulation-protect configure --auto-response \
  --trigger-level=elevated --profile=elevated

# Auto-lockdown on CRITICAL with multiple confirmations
/manipulation-protect configure --auto-response \
  --trigger-level=critical --profile=lockdown \
  --require-confirmations=2

# Auto-quarantine untrusted sources
/manipulation-protect configure --auto-quarantine \
  --source-trust-threshold=0.3
```

### Protection Testing

Validate protection effectiveness against known attack patterns.

```bash
# Run protection validation suite
/manipulation-protect test --scenarios=all --profile=elevated

# Test specific mechanism
/manipulation-protect test --mechanism=source-authentication --attack=signal-poisoning

# Benchmark protection performance impact
/manipulation-protect benchmark --profile=maximum --duration=60m
```

### Cross-Platform Protection

Coordinate protection across connected platform instances.

```bash
# Synchronize protection state across instances
/manipulation-protect sync --instances="prod,staging" --profile=elevated

# Propagate lockdown to all instances
/manipulation-protect lockdown --propagate=all --reason="Coordinated attack detected"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Protection mechanisms deploy fully or not at all -- no partial deployments. Lockdowns execute immediately without negotiation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Protection decisions are grounded in detection evidence. Effectiveness is measured, not assumed. False positive rates are tracked and managed.

## Related Commands

- [/manipulation-detect](@/commands/manipulation-detect.md) - Detect manipulation attempts using epistemic analysis
- [/manipulation-techniques](@/commands/manipulation-techniques.md) - View manipulation technique taxonomy and counter-measures
- [/manipulation-dashboard](@/commands/manipulation-dashboard.md) - Manipulation detection dashboard with threat indicators
- [/emergency](@/commands/emergency.md) - Emergency response and crisis management activation
- [/archer-supreme](@/commands/archer-supreme.md) - Supreme authority activation for platform-wide operations
- [/dark-ops](@/commands/dark-ops.md) - NABLA structural crisis detection and dark operations analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)