+++
title = "/white-verify"
weight = 1190
[extra]
category = "Color Teams"
description = "White team constructive verification and formal proofs"
syntax = "/white-verify [options]"
authority = "L3"
agent = "white-verifier-commander"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1216
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["white-verify", "White", "commands", "Color Teams", "Prismatic Platform", "White Team", "Trinity Gate", "Property", "Phase"]
tags = ["commands", "color-teams", "white-verify", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/white-verify - Prismatic Platform"
+++

## Overview

**/white-verify** is a production command in the **[Color Teams](/glossary/color-teams/)** category of the Prismatic Platform. It executes constructive verification campaigns through the [White Team](/glossary/white-team/), the platform's verification-focused security team that proves systems hold rather than attempting to break them (which is the [Red Team](/glossary/red-team/)'s domain). The White Team produces formal proofs, contract validations, invariant verifications, and property-based evidence that system components satisfy their specified requirements. Unlike testing (which searches for failures), White Team verification constructs positive evidence of correctness.

This command operates under the **L3** authority level and is executed by the `white-verifier-commander` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The White Team is one of six [Color Teams](/glossary/color-teams/) in the platform's adversarial-defensive security architecture. The L3 authority level grants verification access across the entire codebase, including security-sensitive modules.

The White Team operates with 3 agents: the `white-verifier-commander` (L3 Strategic Commander) who orchestrates verification campaigns, the `white-contract-validator` (L4 Specialist) who validates interface contracts and behavioral specifications, and the `white-invariant-prover` (L4 Specialist) who constructs property-based tests, Lean4 formal proofs, and fault injection analyses. All White Team output passes through the Trinity Gate before being accepted as verification evidence.

## Architecture

The White Team verification system operates as a progressive methodology pipeline with increasing rigor levels.

### Verification Architecture

```
             /white-verify
                   |
          White Verifier Commander
                   |
          +--------+--------+
          |                 |
    Contract           Invariant
    Validator          Prover
          |                 |
    +-----+-----+    +-----+-----+
    |     |     |    |     |     |
   API   Proto  Behav Prop  Lean4  Fault
   Valid  Valid  Valid Test  Proof  Inject
    |     |     |    |     |     |
    +-----+-----+----+-----+-----+
                   |
          Evidence Assembler
                   |
          +--------+--------+
          |        |        |
       Proof     Contract  Property
       Artifact  Report    Report
          |        |        |
          +--------+--------+
                   |
          Trinity Gate Submission
```

### Verification Levels

| Level | Name | Method | Rigor | Tool |
|-------|------|--------|-------|------|
| **L0** | Smoke | Basic function call verification | Low | ExUnit |
| **L1** | Contract | Interface contract testing | Medium | ExUnit + Custom |
| **L2** | Property | Property-based testing | Medium-High | StreamData |
| **L3** | Invariant | System invariant verification | High | StreamData + Custom |
| **L4** | Fault Injection | Behavior under failure conditions | High | Custom + Chaos |
| **L5** | Formal Proof | Mathematical proof of correctness | Maximum | Lean4 |

### White Team Agents

| Agent | Role | Key Capability | Authority |
|-------|------|----------------|-----------|
| `white-verifier-commander` | Strategic Commander | Campaign orchestration, composite proof construction | L3 |
| `white-contract-validator` | Contract Specialist | Interface/behaviour/protocol/API validation | L4 |
| `white-invariant-prover` | Invariant Specialist | Property-based testing, Lean4 proofs, fault injection | L4 |

### Verification Evidence Types

| Evidence Type | Description | Weight | Source |
|---------------|-------------|--------|--------|
| **Formal Proof** | Lean4 mechanically verified proof | 1.0 | Invariant Prover |
| **Property Proof** | StreamData property holding over 1000+ inputs | 0.8 | Invariant Prover |
| **Contract Satisfaction** | All contract assertions pass | 0.7 | Contract Validator |
| **Fault Tolerance** | System recovers from injected faults | 0.6 | Invariant Prover |
| **Smoke Evidence** | Basic functionality confirmed | 0.3 | Commander |

## Usage

```bash
# Run White Team verification campaign
/white-verify

# Verify specific module
/white-verify --target PrismaticPerimeter.SecurityRating

# Run specific verification level
/white-verify --level L2 --target PrismaticPerimeter.AssetDiscovery

# Verify all contracts for an application
/white-verify --contracts --app prismatic_perimeter

# Run formal proof campaign
/white-verify --level L5 --target PrismaticPerimeter.SecurityRating.calculate

# Property-based verification
/white-verify --level L2 --property "score always between 300 and 900"

# Fault injection verification
/white-verify --level L4 --target PrismaticStorage.ETS.Adapter

# Export verification evidence
/white-verify --format json --export ./verification-evidence.json

# Show verification status dashboard
/white-verify --status

# Dry run showing verification plan
/white-verify --dry-run --target PrismaticPerimeter
```

### Practical Examples

```bash
# Pre-release verification campaign across critical modules
/white-verify --level L3 --app prismatic_perimeter --format markdown --export ./release-verification.md

# Formal proof of security property
/white-verify --level L5 --property "unauthenticated requests never access protected data" --verbose

# Contract verification for all storage adapters
/white-verify --contracts --app prismatic_storage_core --verbose

# Fault injection testing for OTP supervision trees
/white-verify --level L4 --target PrismaticSupervisor --faults "process_crash,timeout,network_partition"

# Comprehensive verification with Trinity Gate submission
/white-verify --level L3 --all --submit-to-trinity --format json --export ./trinity-evidence.json

# Property-based verification of data integrity
/white-verify --level L2 --target PrismaticPerimeter.ComplianceAssessment --properties ./properties.yaml
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--target` | `string` | none | Module or function to verify |
| `--app` | `string` | none | Application to verify |
| `--all` | `flag` | false | Verify all eligible modules |
| `--level` | `enum` | `L2` | Verification level: `L0`, `L1`, `L2`, `L3`, `L4`, `L5` |
| `--contracts` | `flag` | false | Focus on contract verification |
| `--property` | `string` | none | Specific property to verify |
| `--properties` | `path` | none | YAML file with property definitions |
| `--faults` | `string` | auto | Fault types for injection testing |
| `--submit-to-trinity` | `flag` | false | Submit evidence to Trinity Gate |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export evidence to file |
| `--status` | `flag` | false | Show verification status dashboard |
| `--verbose` | `flag` | false | Detailed verification output |
| `--dry-run` | `flag` | false | Show verification plan |
| `--lean4-timeout` | `duration` | `60s` | Lean4 proof search timeout |
| `--streamdata-runs` | `integer` | 1000 | Number of StreamData test runs |

## Execution Flow

### Phase 1: Campaign Planning

The commander analyzes the verification target and plans the campaign: which modules need verification, what verification levels are appropriate, what properties should be checked, and how evidence should be assembled. The plan considers existing verification evidence to avoid redundant work.

### Phase 2: Contract Validation

The contract validator examines all module interfaces: @spec types are tested with representative inputs, Behaviour implementations are verified against their callbacks, Protocol implementations are tested against protocol contracts, and API endpoints are validated against their OpenApiSpex schemas. Each passing contract becomes evidence.

### Phase 3: Property-Based Verification

The invariant prover generates StreamData generators for property-based testing. Properties are derived from @spec types, documentation assertions, and explicitly specified properties. Each property is tested over the configured number of runs (default 1000). Properties that hold become strong verification evidence.

### Phase 4: Fault Injection (Level L4)

For fault injection verification, the prover systematically introduces failures: process crashes, timeout conditions, network partitions, and resource exhaustion. System behavior under each fault condition is observed and verified against recovery expectations. OTP supervision trees are specifically tested for correct restart behavior.

### Phase 5: Formal Proof (Level L5)

For formal proof verification, critical properties are translated into Lean4 theorems. The Lean4 proof assistant searches for proofs within the configured timeout. Successful proofs provide the highest-weight verification evidence. Failed proof searches do not prove the property false -- they indicate that automated proof is insufficient.

### Phase 6: Evidence Assembly and Trinity Submission

All evidence from the campaign is assembled into a composite verification report. Evidence is weighted by type, cross-referenced for consistency, and formatted for the requested output. When `--submit-to-trinity` is enabled, evidence is submitted to the Trinity Gate for rigidity score updating.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/color-team](/commands/color-team/) | Parent | White Team is part of the 6-team color infrastructure |
| [/red-team](/commands/red-team/) | Counter | Red findings drive White verification priorities |
| [/blue-team](/commands/blue-team/) | Consumer | Blue Team uses White evidence for defensive confidence |
| [/purple-team](/commands/purple-team/) | Synthesis | Purple coordinates Red-Blue-White closure loops |
| [/trinity](/commands/trinity/) | Consumer | Trinity Gate consumes White Team evidence |
| [/trinity-3nl-fusion](/commands/trinity-3nl-fusion/) | Consumer | Fusion pipeline uses White evidence for Gate 3 |
| [/lean](/commands/lean/) | Engine | Lean4 backend for formal proofs |
| [/formal-verify](/commands/formal-verify/) | Peer | General formal verification operations |
| [Telemetry](/glossary/telemetry/) | Monitoring | Verification campaign metrics |

## Best Practices

### Progressive Verification

Start at L0 (smoke) and progress upward. Each level builds on the confidence established by the previous level. Jumping directly to L5 (formal proof) wastes resources if the module fails basic contract validation at L1.

### Red-White Pairing

After every Red Team adversarial scenario, run a corresponding White Team verification. Red findings identify weaknesses; White verification confirms that fixes actually work. This Red-White cycle is more rigorous than either operation alone.

### Evidence Persistence

Always use `--export` and `--submit-to-trinity` for verification campaigns. Transient verification evidence that is not persisted must be regenerated on every assessment cycle. Persisted evidence accumulates, building an increasingly strong verification portfolio.

### Fault Injection Scope

When using L4 fault injection, start with the most likely failure modes (process crashes, timeouts) before testing exotic scenarios (network partitions, disk failures). The most common failures should be verified first because they are most likely to occur in production.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `TARGET_NOT_FOUND` | Verification target module does not exist | Check module name and path |
| `NO_CONTRACT` | Module has no verifiable contracts | Add @spec, @behaviour, or @protocol |
| `STREAMDATA_FAILURE` | Property falsified during testing | Property does not hold; investigate counterexample |
| `LEAN4_TIMEOUT` | Formal proof search exceeded timeout | Simplify property or increase timeout |
| `LEAN4_UNAVAILABLE` | Lean4 toolchain not available | Install Lean4 or skip L5 verification |
| `FAULT_INJECTION_CRASH` | System did not recover from injected fault | Supervision tree or recovery logic needs attention |
| `TRINITY_SUBMISSION_FAILED` | Cannot submit evidence to Trinity Gate | Check Trinity Gate availability |
| `EVIDENCE_INCONSISTENT` | Conflicting evidence from different levels | Manual review of conflicting results required |

## Advanced Usage

### Custom Property Definitions

Define verification properties in YAML:

```bash
/white-verify --properties ./verification/security-properties.yaml --level L3 --verbose
```

### Verification Campaign Templates

Use predefined campaign templates:

```bash
/white-verify --campaign "pre-release" --app prismatic_perimeter --export ./pre-release-evidence.json
```

### Cross-Module Verification

Verify properties that span multiple modules:

```bash
/white-verify --cross-module --targets "PrismaticPerimeter.SecurityRating,PrismaticPerimeter.ComplianceAssessment" --property "rating consistency"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every verification level is executed completely. Evidence artifacts are never fabricated or approximated. Failed verifications are reported without exception.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All White Team output passes Trinity Gate validation. Verification evidence includes methodology, inputs, outputs, and reproducibility instructions.

## Related Commands

- [/color-team](/commands/color-team/) - Color team status overview across all 6 teams
- [/red-team](/commands/red-team/) - [Red team](/glossary/red-team/) adversarial simulation scenario execution
- [/blue-team](/commands/blue-team/) - [Blue team](/glossary/blue-team/) epistemic defense posture assessment
- [/purple-team](/commands/purple-team/) - Purple team synthesis and Red-Blue closure coordination
- [/trinity](/commands/trinity/) - Trinity system status and rigidity score verification
- [/trinity-3nl-fusion](/commands/trinity-3nl-fusion/) - Validate input through Trinity-3NL fusion pipeline
- [/lean](/commands/lean/) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/formal-verify](/commands/formal-verify/) - Formal verification of system properties and invariants

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)