+++
title = "/trinity-3nl-fusion"
weight = 1750
[extra]
category = "Formal Verification"
description = "Validate input through Trinity-3NL fusion pipeline"
syntax = "/trinity-3nl-fusion [options]"
authority = "L3"
agent = "trinity-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1157
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["trinity-3nl-fusion", "Validate", "Trinity-3NL", "commands", "Formal Verification", "Prismatic Platform", "Gate", "Trinity Gate", "Trinity", "Claim"]
tags = ["commands", "formal-verification", "trinity-3nl-fusion", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/trinity-3nl-fusion - Prismatic Platform"
+++

## Overview

**/trinity-3nl-fusion** is a production command in the **[Formal Verification](@/glossary/formal-verification.md)** category of the Prismatic Platform. It validates claims, beliefs, and system properties through the fused Trinity-[3NL](@/glossary/three-nl.md) verification pipeline, combining the Trinity Gate's three-layer consistency checks (structural, logical, formal) with the 3NL framework's three normalization levels (syntactic, semantic, pragmatic). This fusion produces the platform's highest confidence verification: claims that pass the Trinity-3NL fusion pipeline have been validated through six independent verification dimensions, achieving confidence levels that either dimension alone cannot reach.

This command operates under the **L3** authority level and is executed by the `trinity-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the command's access to the formal verification toolchain ([Lean4](@/glossary/lean4.md), Prolog) and its authority to issue binding verification verdicts that affect downstream operations.

The Trinity Gate alone validates structural consistency (belief network forms valid DAG), logical consistency (propositions follow logical rules), and formal necessity (claims proven in formal systems). The 3NL framework alone normalizes claims through syntactic standardization, semantic disambiguation, and pragmatic context alignment. The fusion pipeline combines these: first normalizing claims through 3NL to eliminate ambiguity, then subjecting the normalized claims to Trinity Gate verification. This two-stage process catches verification failures that each system misses independently -- ambiguous claims that pass Trinity, or normalized claims with hidden structural inconsistencies.

## Architecture

The fusion pipeline operates as a sequential two-stage system with feedback loops.

### Fusion Architecture

```
             /trinity-3nl-fusion
                      |
              Fusion Orchestrator
                      |
          +-----------+-----------+
          |                       |
    3NL Normalizer          Trinity Gate
          |                       |
    +-----+-----+          +-----+-----+
    |     |     |          |     |     |
   L1    L2    L3        Gate1  Gate2  Gate3
   Syn   Sem   Prag     Struct  Logic  Formal
    |     |     |          |     |     |
    +-----+-----+          +-----+-----+
          |                       |
    Normalized Claims       Gate Verdicts
          |                       |
          +-----------+-----------+
                      |
              Fusion Correlator
                      |
          +-----------+-----------+
          |           |           |
       Passed      Failed     Uncertain
       (High τ)    (Evidence)  (More data)
                      |
              Verdict Report
```

### Verification Dimensions

| Dimension | Source | What It Checks | Failure Mode |
|-----------|--------|---------------|--------------|
| **Syntactic Normalization** | 3NL L1 | Claim is well-formed and standardized | Malformed or ambiguous claim syntax |
| **Semantic Normalization** | 3NL L2 | Claim meaning is unambiguous | Multiple valid interpretations |
| **Pragmatic Normalization** | 3NL L3 | Claim is contextually appropriate | Context mismatch or scope violation |
| **Structural Consistency** | Trinity Gate 1 | Belief network is valid DAG | Circular dependencies or orphaned nodes |
| **Logical Consistency** | Trinity Gate 2 | Propositions follow logical rules | Contradiction or invalid inference |
| **Formal Necessity** | Trinity Gate 3 | Claims proven in formal system | Unprovable or falsifiable |

### Confidence Threshold Integration

| Context | Required Threshold | Trinity Gate | 3NL Level |
|---------|-------------------|-------------|-----------|
| **Critical Decisions** | 0.95 | ALL 3 gates MANDATORY | All 3 levels |
| **Standard Operations** | 0.80 | ALL 3 gates MANDATORY | L1 + L2 minimum |
| **Exploratory Analysis** | 0.60 | Gate 1 + 2 RECOMMENDED | L1 minimum |
| **Research Queries** | 0.50 | Gate 1 OPTIONAL | L1 optional |

## Usage

```bash
# Validate a claim through full fusion pipeline
/trinity-3nl-fusion "The security rating algorithm produces scores between 300 and 900"

# Validate with specific confidence threshold
/trinity-3nl-fusion --threshold 0.95 "All routes require authentication"

# Validate system property
/trinity-3nl-fusion --type property "PrismaticPerimeter.discover/1 always returns {:ok, _} or {:error, _}"

# Validate architectural claim
/trinity-3nl-fusion --type architecture "Storage adapters are interchangeable"

# Validate with verbose gate details
/trinity-3nl-fusion --verbose "Quality score cannot decrease during evolution"

# Batch validate multiple claims
/trinity-3nl-fusion --batch ./claims.yaml

# Export verification report
/trinity-3nl-fusion --format json --export ./verification-report.json

# Dry run showing verification plan
/trinity-3nl-fusion --dry-run "The platform has 216 commands"
```

### Practical Examples

```bash
# Verify security-critical claim before deployment
/trinity-3nl-fusion --threshold 0.95 --type security "No route exposes PII without authentication"

# Validate performance claim with formal proof
/trinity-3nl-fusion --type performance "Page load time is always under 250ms for health checks"

# Verify compliance claim for audit
/trinity-3nl-fusion --type compliance --formal-proof "NIS2 Article 21 requirements are fully addressed"

# Validate architectural invariant
/trinity-3nl-fusion --type invariant "Supervision trees restart failed processes within 5 seconds"

# Batch verification for release checklist
/trinity-3nl-fusion --batch ./release-claims.yaml --format markdown --export ./release-verification.md
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--threshold` | `float` | 0.80 | Required confidence threshold (0.0-1.0) |
| `--type` | `enum` | `claim` | Claim type: `claim`, `property`, `architecture`, `security`, `performance`, `compliance`, `invariant` |
| `--verbose` | `flag` | false | Show detailed gate-by-gate verification results |
| `--formal-proof` | `flag` | false | Require Lean4 formal proof for Gate 3 |
| `--batch` | `path` | none | Batch verify claims from YAML file |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export verification report |
| `--dry-run` | `flag` | false | Show verification plan without executing |
| `--skip-3nl` | `flag` | false | Skip 3NL normalization (Trinity-only mode) |
| `--skip-trinity` | `flag` | false | Skip Trinity Gate (3NL-only mode) |
| `--evidence` | `flag` | false | Include supporting evidence for each gate |
| `--counterexample` | `flag` | false | Search for counterexamples on failure |
| `--lean4-timeout` | `duration` | `30s` | Maximum time for Lean4 proof search |

## Execution Flow

### Phase 1: Claim Intake

The fusion orchestrator receives the claim and classifies it by type (property, architecture, security, etc.). The claim type determines which verification dimensions are most relevant and which confidence threshold applies.

### Phase 2: 3NL Normalization

The claim passes through three normalization levels. L1 (Syntactic) standardizes the claim into a canonical form, resolving abbreviations, normalizing terminology, and structuring the assertion. L2 (Semantic) disambiguates the claim's meaning, identifying any terms with multiple valid interpretations and resolving them to specific definitions. L3 (Pragmatic) aligns the claim with its operational context, ensuring the claim's scope matches its intended domain.

### Phase 3: Trinity Gate Verification

The normalized claim enters the Trinity Gate. Gate 1 (Structural Consistency) verifies that the claim's belief network forms a valid DAG without circular dependencies. Gate 2 (Logical Consistency) checks that the claim follows from its premises without contradictions. Gate 3 (Formal Necessity) attempts to prove the claim in a formal system -- Lean4 for mathematical properties, Prolog for logical rules.

### Phase 4: Fusion Correlation

Results from both pipelines are correlated. The fusion correlator checks for alignment: a claim that normalizes cleanly but fails a Trinity gate indicates a semantically valid but structurally unsound claim. A claim that passes Trinity but has 3NL normalization issues indicates a technically correct but ambiguously stated claim. Both patterns generate specific diagnostic feedback.

### Phase 5: Verdict Generation

The final verdict is computed as a confidence score incorporating all six dimensions. Claims meeting the threshold receive a PASSED verdict with supporting evidence. Claims below the threshold receive a FAILED verdict with specific gate failure details and remediation suggestions. Claims near the threshold receive an UNCERTAIN verdict with recommendations for additional evidence.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/trinity](@/commands/trinity.md) | Foundation | Trinity Gate system status and rigidity scores |
| [/lean](@/commands/lean.md) | Engine | Lean4 formal proof engine for Gate 3 |
| [/prolog](@/commands/prolog.md) | Engine | Prolog logical reasoning for Gate 2 |
| [/formal-verify](@/commands/formal-verify.md) | Peer | General formal verification of properties |
| [/nabla-status](@/commands/nabla-status.md) | Consumer | Fusion results feed NABLA epistemic health |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Verification verdicts inform gate passage |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Framework | Epistemic framework governing verification |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Verification latency and pass/fail rates |

## Best Practices

### Threshold Selection

Use 0.95 threshold for claims that affect security, compliance, or production stability. Use 0.80 for standard operational claims. Use 0.60 for exploratory analysis where false negatives are acceptable. Never use thresholds below 0.50 for claims that influence platform behavior.

### Claim Specificity

Vague claims produce weak verification results. "The system is secure" is unverifiable. "No unauthenticated user can access /perimeter/assets" is verifiable. Write claims as specific, falsifiable assertions for strongest verification.

### Batch Verification for Releases

Before every release, maintain a claims file (`release-claims.yaml`) containing all critical invariants and use `--batch` to verify them. This provides a formal release gate that catches regressions in system properties.

### Evidence Preservation

Use `--evidence --export` to preserve verification evidence for compliance audits. The exported report provides traceable proof chains for every passed claim, which auditors can independently verify.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `CLAIM_UNPARSEABLE` | Cannot normalize claim through 3NL | Rephrase claim in clearer terms |
| `SEMANTIC_AMBIGUITY` | Multiple valid interpretations found | Add qualifiers to disambiguate |
| `STRUCTURAL_CYCLE` | Belief network contains circular dependency | Restructure claim to eliminate cycles |
| `LOGICAL_CONTRADICTION` | Claim contradicts established facts | Review claim premises |
| `LEAN4_TIMEOUT` | Formal proof search exceeded timeout | Simplify claim or increase timeout |
| `LEAN4_UNPROVABLE` | No formal proof found | Claim may be false; review evidence |
| `FUSION_DIVERGENCE` | 3NL and Trinity produce conflicting results | Manual review required |

## Advanced Usage

### Custom Axiom Sets

Load project-specific axioms for verification:

```bash
/trinity-3nl-fusion --axioms ./axioms/prismatic-security.lean "Authentication is mandatory for all API endpoints"
```

### Incremental Verification

Verify a claim incrementally as evidence accumulates:

```bash
/trinity-3nl-fusion --incremental --claim-id "sec-001" --add-evidence ./new-evidence.json
```

### Counterexample Search

When a claim fails, search for specific counterexamples:

```bash
/trinity-3nl-fusion --counterexample --verbose "All storage adapters implement the full contract"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every verification dimension is checked without exception. No claim receives a PASSED verdict without meeting all required gate thresholds.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every verdict includes traceable evidence from each verification dimension. UNCERTAIN verdicts are never silently promoted to PASSED.

## Related Commands

- [/trinity](@/commands/trinity.md) - Trinity system status and rigidity score verification
- [/lean](@/commands/lean.md) - Execute Lean 4 code or prove a theorem with the lean-specialist agent
- [/prolog](@/commands/prolog.md) - Prolog-based logical reasoning and [inference](@/glossary/inference.md) operations
- [/formal-verify](@/commands/formal-verify.md) - Formal verification of system properties and invariants
- [/nabla-status](@/commands/nabla-status.md) - NABLA Infinity epistemic framework health and status
- [/white-verify](@/commands/white-verify.md) - White team constructive verification and formal proofs
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)