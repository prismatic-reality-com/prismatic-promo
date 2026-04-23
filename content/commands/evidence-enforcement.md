+++
title = "/evidence-enforcement"
weight = 2050
[extra]
category = "Framework"
description = "Evidence-based enforcement for claims and assertions validation"
syntax = "/evidence-enforcement [options]"
authority = "L3"
agent = "evidence-enforcement-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1284
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evidence-enforcement", "Evidence-based", "commands", "Framework", "Prismatic Platform", "Axiom", "Trinity Gate", "Claims", "NABLA Infinity"]
tags = ["commands", "framework", "evidence-enforcement", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evidence-enforcement - Prismatic Platform"
+++

## Overview

**/evidence-enforcement** is a production command in the **Framework** category of the Prismatic Platform. It provides rigorous evidence-based enforcement for claims and assertions validation, ensuring that every decision, belief, and technical claim within the platform ecosystem is backed by verifiable evidence. This command is a direct operational expression of the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework and its seven non-negotiable axioms.

In complex AI-assisted development platforms, epistemic drift is a persistent threat. Claims propagate through agent chains, confidence levels are asserted without validation, and decisions accumulate on foundations of unverified assumptions. The `/evidence-enforcement` command systematically prevents this degradation by requiring that every assertion pass through structured evidence validation before being accepted as a basis for action.

The evidence-enforcement-specialist agent implements the full [Trinity Gate](/glossary/trinity-gate/) validation protocol: structural consistency (belief network forms a valid DAG), logical consistency (propositions follow logical rules), and formal necessity (claims proven in formal systems). Claims that fail any gate are blocked from propagation, and the operator receives detailed diagnostics explaining the specific validation failure.

This command operates under the **L3** authority level, reflecting its role as a strategic governance mechanism. L3 authority is required because evidence enforcement can block decisions and escalate violations to supreme review. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The evidence enforcement system is built on a layered validation architecture that mirrors the NABLA Infinity axiom hierarchy:

```
Claim Input --> Provenance Checker --> Plurality Validator --> Trinity Gate
                     |                       |                     |
               Source Registry         Signal Aggregator     Formal Verifier
                     |                       |                     |
               Origin Tracking          Multi-Source          Lean4 / Logic
                     \                   Correlation               /
                      \                      |                    /
                       --> Evidence Verdict Registry --> Action Gate
                                    |
                              Audit Logger
```

**Provenance Checker**: Validates that every claim has traceable origins. Claims without source attribution are immediately blocked (Axiom 7: Provenance Mandatory). The checker maintains a source registry mapping claims to their originating agents, data sources, and reasoning chains.

**Plurality Validator**: Enforces signal plurality (Axiom 1). Claims backed by a single source receive reduced confidence. The validator requires minimum two independent signals for belief establishment, with source independence scoring (Axiom 6) applied to weight corroborating evidence.

**Trinity Gate**: The final three-layer validation barrier. Structural consistency ensures the belief network remains a valid DAG. Logical consistency validates propositional coherence. Formal necessity optionally invokes [Lean4](/glossary/lean4/) proof verification for critical claims.

**Evidence Verdict Registry**: Stores all validation verdicts with full audit trails. Verdicts are immutable once issued, preserving the complete evidence history for later review and contradiction detection.

## Usage

### Basic Evidence Validation

```bash
# Validate a specific claim
/evidence-enforcement --claim="Module X has 100% test coverage"

# Check evidence status across all active claims
/evidence-enforcement --status

# Validate all claims in current session
/evidence-enforcement --validate-session
```

### Axiom-Specific Enforcement

```bash
# Check signal plurality for a decision
/evidence-enforcement --check-plurality --decision="migrate-to-horde"

# Validate provenance chain for a claim
/evidence-enforcement --trace-provenance --claim-id=CLM-2026-0142

# Enforce contradiction preservation
/evidence-enforcement --check-contradictions --domain=security-ratings

# Validate time decay on historical claims
/evidence-enforcement --check-decay --max-age=30d
```

### Governance Operations

```bash
# Generate evidence compliance report
/evidence-enforcement --report --format=table

# Audit evidence chain for a specific decision
/evidence-enforcement --audit --decision-id=DEC-2026-0087

# Enforce Trinity Gate on pending decisions
/evidence-enforcement --trinity-gate --pending
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--claim` | string | none | Specific claim text to validate |
| `--claim-id` | string | none | Claim identifier for existing registered claims |
| `--status` | flag | false | Display evidence enforcement status overview |
| `--validate-session` | flag | false | Validate all claims in current session context |
| `--check-plurality` | flag | false | Verify signal plurality for a decision |
| `--trace-provenance` | flag | false | Trace full provenance chain for a claim |
| `--check-contradictions` | flag | false | Detect preserved contradictions in a domain |
| `--check-decay` | flag | false | Evaluate time decay on historical claims |
| `--max-age` | string | 90d | Maximum age before claims require revalidation |
| `--trinity-gate` | flag | false | Apply full Trinity Gate validation |
| `--pending` | flag | false | Target only pending (unvalidated) claims |
| `--report` | flag | false | Generate evidence compliance report |
| `--audit` | flag | false | Full audit trail for a decision |
| `--decision-id` | string | none | Decision identifier for audit operations |
| `--format` | string | text | Output format (text, json, table) |
| `--domain` | string | all | Scope enforcement to a specific domain |

## Execution Flow

The `/evidence-enforcement` command follows a structured 7-phase validation pipeline:

1. **Claim Extraction**: The target claim or assertion is extracted and normalized. Natural language claims are parsed into structured propositions. For session validation, all claims from the current stack-based conversation are extracted.

2. **Provenance Verification**: Each claim is checked for source attribution. The system traces the claim back to its originating agent, data source, or reasoning chain. Claims without provenance are flagged as Axiom 7 violations.

3. **Plurality Assessment**: The system checks whether the claim is supported by multiple independent sources. Single-source claims receive reduced confidence scores. The source independence axiom (Axiom 6) is applied to detect correlated sources that appear independent but share common origins.

4. **Contradiction Detection**: The claim is checked against the existing belief network for contradictions. Detected contradictions are preserved (Axiom 2: Contradiction Preservation) rather than resolved -- both sides are maintained with explicit annotation.

5. **Time Decay Evaluation**: Historical claims are evaluated for staleness. Beliefs older than the configured threshold trigger revalidation requirements. The time decay axiom (Axiom 4) ensures that aging evidence does not persist unchallenged.

6. **Trinity Gate Passage**: For claims requiring high confidence (tau >= 0.95), the full Trinity Gate is applied: structural consistency, logical consistency, and formal necessity. Claims that fail any gate are blocked.

7. **Verdict Registration**: The validation verdict is recorded in the immutable evidence registry with full audit trail. Verdicts include the specific axioms checked, the validation outcome, confidence score, and any required follow-up actions.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [NABLA Infinity](/glossary/nabla-infinity/) | Framework | Direct enforcement of 7 epistemic axioms |
| [Trinity Gate](/glossary/trinity-gate/) | Validation | 3-layer formal verification for critical claims |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Agent claims subject to evidence enforcement |
| [Quality Gates](/glossary/quality-gates/) | Governance | Evidence compliance as a quality gate prerequisite |
| [Telemetry](/glossary/telemetry/) | Monitoring | Evidence validation [metrics](/glossary/metrics/) and axiom violation tracking |
| [Lean4](/glossary/lean4/) | Formal Verification | Formal necessity proofs for critical claims |
| AIAD Registry | Discovery | Command specification and policy binding |
| [Color Teams](/glossary/color-teams/) | Security | Red/Blue team claims require evidence enforcement |

## Best Practices

**Enforce provenance from the start**: Retroactively adding provenance to established claims is significantly harder than requiring it at claim creation time. Configure evidence enforcement as a session lifecycle hook.

**Preserve contradictions explicitly**: When the system detects contradictory evidence, resist the temptation to resolve it prematurely. Contradictions are valuable signals. Use the `--check-contradictions` flag to surface preserved contradictions for informed decision-making.

**Calibrate time decay per domain**: Security claims decay faster than architectural decisions. Configure domain-specific `--max-age` thresholds: 7 days for security posture claims, 30 days for performance benchmarks, 90 days for architectural decisions.

**Use Trinity Gate selectively**: Full Trinity Gate validation is computationally expensive (especially the Lean4 formal necessity layer). Reserve it for critical decisions that will have broad platform impact. Use simpler plurality and provenance checks for routine claims.

**Audit before major decisions**: Before committing to significant architectural changes or production deployments, run `/evidence-enforcement --audit` on the decision chain to verify that every claim supporting the decision has adequate evidence.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `PROVENANCE_MISSING` | Claim has no traceable source | Add source attribution before resubmission |
| `PLURALITY_INSUFFICIENT` | Claim backed by fewer than 2 independent sources | Gather additional independent evidence |
| `TRINITY_GATE_STRUCTURAL_FAILURE` | Belief network contains cycles or invalid edges | Restructure claim dependencies to form valid DAG |
| `TRINITY_GATE_LOGICAL_FAILURE` | Logical inconsistency detected in propositions | Resolve logical contradictions or preserve explicitly |
| `TRINITY_GATE_FORMAL_FAILURE` | Lean4 proof could not be constructed | Provide formal proof or reduce claim confidence |
| `TIME_DECAY_EXPIRED` | Claim exceeds maximum age without revalidation | Revalidate claim with current evidence |
| `CONTRADICTION_UNACKNOWLEDGED` | Contradictory evidence exists but is not annotated | Acknowledge contradiction and preserve both signals |

## Advanced Usage

### Automated Evidence Collection

```bash
# Configure automatic evidence gathering for a domain
/evidence-enforcement --auto-collect --domain=security \
  --sources="cve-db,nist,osint-feeds" --interval=24h

# Chain evidence enforcement with quality gates
/evidence-enforcement --pre-gate --gate=deployment \
  --required-confidence=0.95 --trinity-gate
```

### Evidence Network Visualization

```bash
# Generate evidence dependency graph
/evidence-enforcement --visualize --domain=perimeter --format=mermaid

# Export full evidence network for external analysis
/evidence-enforcement --export --format=json --include-verdicts
```

### Cross-Session Evidence Continuity

Evidence verdicts persist across sessions through the [Quality DNA](/glossary/quality-dna/) system. When a new session starts, previously validated claims retain their verdict status unless time decay or new contradictory evidence triggers revalidation.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for unsubstantiated claims. Every assertion that influences platform decisions must pass evidence validation. No exceptions for "obvious" truths or "common knowledge."
- **NO DOUBTS**: Full investigation before accepting any claim. The evidence enforcement system embodies the NO DOUBTS principle by requiring verifiable evidence chains before claims can influence actions.

Evidence enforcement is the operational bridge between the NABLA Infinity epistemic framework and the NO MERCY, NO DOUBTS execution doctrine. The transition from exploration (uncertainty mapping) to execution (decisive action) can only occur when evidence enforcement confirms confidence >= 0.95 and Trinity Gate passage.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/rc1-orchestrate](/commands/rc1-orchestrate/) - Complete RC1 delivery pipeline execution with ROC optimization
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation
- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)