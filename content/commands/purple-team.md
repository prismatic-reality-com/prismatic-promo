+++
title = "/purple-team"
weight = 1180
[extra]
category = "Color Teams"
description = "Purple team Red-Blue synthesis and closure analysis"
syntax = "/purple-team [options]"
authority = "L3"
agent = "purple-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1177
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["purple-team", "Purple", "Red-Blue", "commands", "Color Teams", "Prismatic Platform", "Blue", "Purple Team", "Blue Team"]
tags = ["commands", "color-teams", "purple-team", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/purple-team - Prismatic Platform"
+++

## Overview

**/purple-team** is a production command in the **[Color Teams](/glossary/color-teams/)** category of the Prismatic Platform that orchestrates the Purple Team's core mission: synthesizing Red Team adversarial findings with Blue Team defensive assessments to achieve genuine epistemic closure. The Purple Team occupies the central position in the platform's six-team security architecture, serving as the sole authority for closure state transitions -- the determination that a security finding has been adequately addressed and that the defensive posture genuinely covers the identified attack surface.

Purple Team operations embody the principle that "Purple is the property of the system when it stops lying to itself." The team's function is fundamentally different from simply combining Red and Blue outputs. It actively hunts for false closure -- situations where a finding appears resolved but actually remains exploitable through unconsidered attack vectors, environmental changes, or regression traps. The Purple Team maintains anti-metric enforcement, refusing to allow superficial quantitative measures to substitute for genuine security understanding.

This command operates under the **L3** authority level and is executed by the `purple-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level is required because Purple Team operations involve synthesizing information from both adversarial and defensive domains, requiring strategic oversight that lower authority levels cannot provide.

The command coordinates four specialized Purple Team agents: the `purple-coordinator` (synthesis hub and closure authority), `purple-mapper` (bidirectional Red-Blue finding mapping), `purple-closure-analyst` (4-condition closure evaluation and false closure detection), and `purple-regression-guard` (regression trap management and deployment gate enforcement). Together, these agents form the critical feedback loop that transforms isolated Red and Blue observations into actionable defensive improvements.

## Architecture

The Purple Team architecture implements a bidirectional synthesis loop between adversarial findings and defensive postures.

```
Red Team Findings          Blue Team Posture
      |                          |
      v                          v
+------------------+    +------------------+
| Finding Ingestion|    | Posture Ingestion|
+------------------+    +------------------+
      |                          |
      +--------+    +------------+
               |    |
               v    v
        +------------------+
        | Purple Mapper    |
        | (bidirectional)  |
        +------------------+
               |
               v
        +------------------+
        | Closure Analyst  |
        | (4-condition)    |
        +------------------+
               |
               v
        +------------------+     +------------------+
        | Regression Guard |---->| Deployment Gate  |
        | (trap management)|     | (block/allow)    |
        +------------------+     +------------------+
               |
               v
        +------------------+
        | Purple Report    |
        | (synthesis)      |
        +------------------+
```

### Four Closure Conditions

A finding achieves closure only when all four conditions are simultaneously satisfied:

| Condition | Description | Verification Method |
|-----------|-------------|---------------------|
| **C1: Defense Exists** | A specific defensive control addresses the finding | Blue Team evidence review |
| **C2: Defense Effective** | The control actually prevents the attack vector | Red Team re-simulation |
| **C3: No Bypass** | No alternative attack path circumvents the control | Gray Team boundary exploration |
| **C4: No Regression** | The defense remains effective after future changes | Regression guard monitoring |

## Usage

### Synthesis Operations

```bash
# Run full Purple Team synthesis cycle
/purple-team closure

# Map specific Red Team finding to Blue Team defenses
/purple-team map --finding RED-2026-0142

# Evaluate closure status for all open findings
/purple-team closure --evaluate-all

# Check for false closure conditions
/purple-team closure --detect-false
```

### Status and Reporting

```bash
# Get Purple Team operational status
/purple-team status

# Generate synthesis report
/purple-team report

# Show open findings awaiting closure
/purple-team open-findings

# Display closure statistics
/purple-team stats
```

### Regression Management

```bash
# Check regression traps for a specific finding
/purple-team regression --finding RED-2026-0142

# Activate regression monitoring for recently closed findings
/purple-team regression --monitor-closed --window 30d

# Review deployment gates
/purple-team gates

# Force deployment gate evaluation
/purple-team gates --evaluate
```

### Advanced Analysis

```bash
# Detect blind spots in Red-Blue coverage
/purple-team blind-spots

# Analyze closure velocity over time
/purple-team velocity --window 90d

# Run anti-metric validation
/purple-team anti-metric --validate

# Cross-reference with Gray Team boundary findings
/purple-team cross-reference --team gray
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closure` | `subcommand` | -- | Run closure evaluation cycle |
| `map` | `subcommand` | -- | Map findings to defenses |
| `status` | `subcommand` | -- | Show Purple Team operational status |
| `report` | `subcommand` | -- | Generate synthesis report |
| `regression` | `subcommand` | -- | Regression trap management |
| `gates` | `subcommand` | -- | Deployment gate operations |
| `--finding` | `string` | `nil` | Specific finding ID to operate on |
| `--evaluate-all` | `boolean` | `false` | Evaluate closure for all open findings |
| `--detect-false` | `boolean` | `false` | Actively hunt for false closure conditions |
| `--monitor-closed` | `boolean` | `false` | Enable monitoring of recently closed findings |
| `--window` | `string` | `7d` | Time window for analysis operations |
| `--format` | `json \| text \| table` | `text` | Output format |
| `--verbose` | `boolean` | `false` | Include detailed analysis for each finding |
| `--team` | `string` | `nil` | Cross-reference with specific team findings |

## Execution Flow

1. **Finding Ingestion** -- The Purple coordinator collects all open findings from the Red Team and current defensive posture assessments from the Blue Team. Findings are normalized into a common schema that enables bidirectional mapping.

2. **Bidirectional Mapping** -- The `purple-mapper` agent creates a mapping matrix between Red findings and Blue defenses. Each Red finding is mapped to the Blue defensive controls that claim to address it, and each Blue control is mapped to the Red findings it covers.

3. **Coverage Gap Analysis** -- The mapping matrix is analyzed for gaps: Red findings with no corresponding Blue defense (uncovered attacks), Blue defenses with no Red finding (potentially unnecessary controls), and partially covered findings (defense exists but does not fully mitigate).

4. **4-Condition Closure Evaluation** -- For each finding that has a mapped defense, the `purple-closure-analyst` evaluates all four closure conditions. This involves reviewing evidence from Red re-simulations, Blue defensive tests, Gray boundary explorations, and regression guard reports.

5. **False Closure Detection** -- The analyst actively searches for false closure indicators: defenses that pass tests but would fail under slightly modified attack conditions, environmental dependencies that could change, and assumptions that are not codified as invariants.

6. **Regression Guard Update** -- The `purple-regression-guard` updates its trap registry with newly closed findings, ensuring that future code changes are checked against the conditions that enable each defense.

7. **Report Generation** -- A comprehensive synthesis report is generated, including closure status per finding, coverage gaps, false closure warnings, regression risk assessments, and recommended actions.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [Red Team](/glossary/red-team/) | Adversarial finding ingestion | Attack surface input |
| [Blue Team](/glossary/blue-team/) | Defensive posture assessment | Defense verification |
| [Gray Team](/glossary/color-teams/) | Boundary exploration for bypass detection | C3 condition |
| [White Team](/glossary/color-teams/) | Formal proofs for defense correctness | C2 condition |
| [Black Team](/glossary/color-teams/) | Theoretical threat models for blind spots | Threat modeling |
| [Quality Gates](/glossary/quality-gates/) | Deployment gate enforcement | Gate control |
| [NABLA](/glossary/nabla-infinity/) | Contradiction preservation in findings | Epistemics |
| [Trinity Gate](/glossary/trinity-gate/) | Closure claims require Trinity passage | Verification |

## Best Practices

1. **Never rush closure** -- The pressure to close findings quickly is the primary source of false closure. Allow the 4-condition evaluation to complete fully before accepting closure.

2. **Preserve contradictions** -- When Red and Blue assessments disagree about whether a finding is addressed, preserve both perspectives. The disagreement itself is valuable signal.

3. **Monitor anti-metrics** -- Purple Team uses anti-metrics: measures that should NOT improve. If "findings closed per day" increases dramatically, it likely indicates false closure rather than genuine improvement.

4. **Cross-reference teams** -- Regularly cross-reference Purple findings with Gray Team boundary explorations. Gray often surfaces edge cases that invalidate closure conditions.

5. **Regression traps are permanent** -- Once a regression trap is set for a closed finding, it remains active indefinitely. Do not remove traps even for "obviously" stable defenses.

6. **Document closure reasoning** -- Every closure decision must include written reasoning explaining why all four conditions are satisfied. Future team members need this context.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :finding_not_found}` | Specified finding ID does not exist | Verify finding ID against Red Team registry |
| `{:error, :incomplete_mapping}` | Cannot complete Red-Blue mapping | Some findings may lack Blue Team assessment; request Blue Team review |
| `{:error, :closure_blocked}` | One or more closure conditions not met | Review which conditions failed and address gaps |
| `{:error, :false_closure_detected}` | Previously closed finding shows closure violation | Reopen finding and re-evaluate all four conditions |
| `{:error, :regression_trap_triggered}` | Code change conflicts with defense assumptions | Block deployment until defense is verified against new code |

## Advanced Usage

### Custom Closure Criteria

```elixir
# Add application-specific closure criteria beyond the standard four
PurpleTeam.ClosureAnalyst.add_criterion(:compliance, fn finding ->
  case finding.compliance_frameworks do
    [] -> {:skip, "No compliance requirements"}
    frameworks -> verify_compliance_coverage(finding, frameworks)
  end
end)
```

### Automated Synthesis Cycles

```bash
# Schedule periodic synthesis with notification
/purple-team closure --evaluate-all --notify purple-coordinator@prismatic.local

# Integration with CI/CD
/purple-team gates --evaluate --format json --exit-code
# Exit code 0 = all gates pass, 1 = deployment blocked
```

### Finding Lifecycle Tracking

```bash
# Track a finding from discovery through closure
/purple-team track --finding RED-2026-0142 --timeline

# Export finding lifecycle for audit
/purple-team export --finding RED-2026-0142 --format json --include-evidence
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. False closure is treated as a critical violation. No finding is closed without all four conditions verified. Deployment gates block releases with unresolved Purple Team concerns.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Closure decisions require documented evidence for each condition. Contradictory assessments from Red and Blue teams are preserved and analyzed, never suppressed.

Purple Team operations are the primary enforcement mechanism for the [NABLA](/glossary/nabla-infinity/) Contradiction Preservation axiom in the security domain. The team's explicit mission is to prevent the system from "lying to itself" about its security posture.

## Related Commands

- [/color-team](/commands/color-team/) - Color team status overview across all 6 teams
- [/red-team](/commands/red-team/) - [Red team](/glossary/red-team/) adversarial simulation scenario execution
- [/blue-team](/commands/blue-team/) - [Blue team](/glossary/blue-team/) epistemic defense posture assessment
- [/manipulation-detect](/commands/manipulation-detect/) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](/commands/manipulation-protect/) - Activate manipulation protection defenses
- [/manipulation-techniques](/commands/manipulation-techniques/) - View manipulation technique taxonomy and counter-measures

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)