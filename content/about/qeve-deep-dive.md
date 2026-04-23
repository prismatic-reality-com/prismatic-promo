+++
title = "QEVE Deep Dive"
weight = 5

[extra]
description = "Quantified Epistemic Verification Engine -- from AI scores to auditable, legally defensible conclusions."
audience = "technical"
difficulty = "advanced"
glossary_terms = ["qeve", "lean4", "nabla-infinity", "trinity-gate", "no-mercy"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2008
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["QEVE", "Deep", "Dive", "Quantified", "Epistemic", "Verification", "Engine", "about", "Prismatic Platform", "PASSED"]
tags = ["about", "qeve-deep-dive", "prismatic"]
quality_score = 82
see_also = ["capabilities", "architecture", "teams"]
image = "/images/sections/about.png"
image_alt = "QEVE Deep Dive - Prismatic Platform"
+++

## The Problem: "The Model Says 87%"

Imagine a due diligence scenario. Firm X is acquiring Firm Y. An AI-powered risk assessment tool evaluates Firm Y's cybersecurity posture and returns: **87% confidence that the security posture is adequate**.

What does that number mean? What model produced it? What data went in? What assumptions were made? What happens if one data source was inaccurate? Is 87% enough for a decision with nine-figure consequences?

These questions do not have satisfying answers with traditional AI scoring. The 87% is an opaque output of a model that may or may not be well-calibrated, trained on data that may or may not be representative, with assumptions that are implicit rather than explicit.

Now imagine the same scenario with Prismatic's [QEVE](@/glossary/qeve.md):

> The security posture assessment yields a confidence of 0.87 with a 95% credible interval of [0.82, 0.91]. This conclusion is based on 23 independent evidence signals from 8 sources, verified through the Trinity Gate (structural consistency: PASSED, logical consistency: PASSED, formal proof: PASSED for 4 of 6 critical properties, deferred for 2 non-critical). Robustness analysis shows the conclusion is stable under 15% evidence degradation but sensitive to source S3 (if S3 reliability drops below 0.6, confidence drops to 0.71). Full provenance chain available. 2 preserved contradictions noted: [details with source attribution and timestamps].

That is the difference between a score and a verified conclusion. The first is a number. The second is an auditable, defensible, actionable assessment.

## QEVE Architecture

The Quantified Epistemic Verification Engine combines three verification methodologies into a unified pipeline:

### Component 1: Lean4 Formal Proofs

[Lean4](@/glossary/lean4.md) is a theorem prover and programming language developed at Microsoft Research. It allows expressing mathematical propositions and constructing machine-checked proofs of those propositions.

In QEVE, Lean4 serves as the formal verification backbone. Security properties, consistency invariants, and critical system claims are expressed as Lean4 propositions. Proofs are constructed either manually (for novel properties) or semi-automatically (for properties that follow established patterns). The proofs are machine-checked -- if the proof compiles, it is correct.

Example: proving that an authentication token cannot be replayed after expiration:

```
-- Lean4 formal specification (simplified)
theorem token_no_replay (t : Token) (now : Timestamp) :
  t.expires_at < now -> not (valid_for_auth t now) := by
  intro h_expired
  simp [valid_for_auth]
  exact not_valid_when_expired t now h_expired
```

This is not pseudocode. It is a real Lean4 proof that the type checker verifies. If the proof is accepted by Lean4, the property holds for all possible tokens and timestamps -- not just the ones covered by test cases.

### Component 2: NABLA Epistemic Axioms

The [NABLA Infinity](@/glossary/nabla-infinity.md) framework provides the epistemic infrastructure. Its 7 axioms govern how evidence is gathered, evaluated, and synthesized:

| Axiom | Role in QEVE | Enforcement |
|-------|-------------|-------------|
| **Signal Plurality** | No conclusion based on single signal | HARD: blocks pipeline at L3 |
| **Contradiction Preservation** | Conflicting evidence tracked, not discarded | HARD: blocks premature resolution |
| **Absence Informative** | Missing expected signals are evidence | SOFT: logged and weighted |
| **Time Decay** | Older evidence weighted less | HARD: mandatory timestamps |
| **Unknown Valid** | Uncertainty is a legitimate output | HARD: forced confidence forbidden |
| **Source Independence** | Independent sources weighted higher | SOFT: correlation assessment |
| **Provenance Mandatory** | Every claim traceable to sources | HARD: unprovenanced claims rejected |

These axioms are not philosophical guidelines. They are enforcement rules implemented in the pipeline. A HARD axiom violation blocks the pipeline. A SOFT axiom violation triggers a warning and bias assessment.

### Component 3: Monte Carlo Robustness Testing

Formal proofs establish correctness under specified conditions. Monte Carlo testing establishes robustness under uncertainty -- how sensitive is the conclusion to variations in the underlying evidence?

The process:

1. Model the uncertainty in each evidence signal (confidence intervals, source reliability estimates)
2. Sample from the uncertainty distributions (thousands of Monte Carlo draws)
3. Re-evaluate the conclusion under each sample
4. Compute the distribution of outcomes
5. Report the conclusion with credible intervals and sensitivity analysis

This answers the critical question: **what would have to be wrong for this conclusion to change?**

If the conclusion is robust -- stable under wide variations in evidence quality -- it can be relied upon even in the presence of uncertainty. If it is sensitive -- dependent on a specific source or assumption -- that sensitivity is explicitly reported, and the decision-maker knows exactly what to monitor.

## The 5-Stage Pipeline

QEVE processes evidence through five stages:

### Stage 1: Evidence Ingestion and Validation

Raw signals enter the pipeline from multiple sources: Color Team findings, EASM scan results, drift detection alerts, external intelligence feeds, user-provided data, and automated analysis outputs.

Each signal is validated against NABLA axioms:

- Source identified and reliability assessed (Provenance Mandatory)
- Timestamp recorded (Time Decay)
- Independence from other signals evaluated (Source Independence)
- Missing expected signals noted (Absence Informative)

```elixir
defmodule PrismaticQeve.Evidence do
  @type t :: %__MODULE__{
    id: String.t(),
    source: String.t(),
    source_reliability: float(),
    timestamp: DateTime.t(),
    signal_type: atom(),
    content: term(),
    independence_group: String.t(),
    provenance_chain: [String.t()]
  }
end
```

### Stage 2: Hypothesis Formation

Validated evidence is synthesized into hypotheses -- candidate conclusions that the evidence might support. Multiple competing hypotheses are generated for every decision point.

This is where **Contradiction Preservation** is critical. When evidence supports conflicting hypotheses, both hypotheses are maintained. The pipeline does not pick a winner at this stage. It tracks the evidence supporting each hypothesis, the evidence contradicting each hypothesis, and the areas where evidence is missing.

```elixir
defmodule PrismaticQeve.Hypothesis do
  @type t :: %__MODULE__{
    id: String.t(),
    statement: String.t(),
    supporting_evidence: [Evidence.t()],
    contradicting_evidence: [Evidence.t()],
    missing_evidence: [String.t()],
    confidence: float(),
    confidence_interval: {float(), float()},
    status: :active | :verified | :rejected | :deferred
  }
end
```

### Stage 3: Formal Verification

Hypotheses that meet the confidence threshold for formal verification are translated into Lean4 propositions. The verification level depends on the criticality:

| Criticality | Verification Level | Method |
|------------|-------------------|--------|
| Critical (security, compliance) | L5: Full Lean4 proof | Machine-checked formal proof |
| High (architecture, performance) | L3-L4: Formal specification | Lean4 specification + boundary proofs |
| Medium (features, refactoring) | L1-L2: Contract testing | Property-based testing + contract validation |
| Low (cosmetic, documentation) | L0: Basic property testing | QuickCheck-style property tests |

Not every hypothesis requires L5 proof. The resource allocation is proportional to the risk. But for critical decisions -- security properties, compliance claims, architectural invariants -- full formal proof is required.

### Stage 4: Robustness Assessment

Verified hypotheses undergo Monte Carlo robustness testing:

1. Identify the key uncertainty parameters (source reliability, evidence completeness, model assumptions)
2. Define distributions for each parameter (based on historical calibration data)
3. Sample 10,000+ configurations from the joint distribution
4. Re-evaluate the hypothesis under each configuration
5. Compute the posterior distribution of confidence levels
6. Identify sensitivity: which parameters most affect the conclusion?

The output is a robustness report:

```elixir
defmodule PrismaticQeve.RobustnessReport do
  @type t :: %__MODULE__{
    hypothesis_id: String.t(),
    median_confidence: float(),
    credible_interval_95: {float(), float()},
    credible_interval_99: {float(), float()},
    sensitivity_ranking: [{String.t(), float()}],
    stability_under_degradation: %{
      five_percent: float(),
      ten_percent: float(),
      fifteen_percent: float(),
      twenty_percent: float()
    },
    critical_assumptions: [String.t()],
    sample_count: integer()
  }
end
```

### Stage 5: Trinity Gate Validation

The final stage. Every conclusion must pass the three-layer [Trinity Gate](@/glossary/trinity-gate.md):

**Layer 1: Structural Consistency (Graph Theory)**

The belief network -- the graph of claims, evidence, and reasoning steps -- must form a valid directed acyclic graph. No circular reasoning. No orphaned claims (conclusions without supporting evidence). No floating evidence (signals that do not connect to any conclusion).

**Layer 2: Logical Consistency (Rule-Based)**

The propositions must follow established logical rules. Modus ponens, modus tollens, and other inference rules are checked automatically. Contradictions are identified and must be explicitly acknowledged (per the Contradiction Preservation axiom) rather than hidden.

**Layer 3: Formal Necessity (Modal Logic + Lean4)**

For claims that require formal proof (determined by criticality in Stage 3), the Lean4 proofs must compile successfully. For claims that require modal logic reasoning (necessity, possibility, contingency), the modal logic checker validates the reasoning.

A claim that passes all three layers is **established**. A claim that fails any layer is **blocked** and requires remediation before it can be established.

## Confidence Scoring Formula

QEVE computes confidence as a weighted aggregation of evidence signals, adjusted for independence, time decay, and source reliability:

```
C(h) = sum(w_i * r_i * d(t_i) * s_i) / sum(w_i)

where:
  h   = hypothesis
  w_i = weight of evidence signal i (determined by relevance)
  r_i = reliability of source i (historical calibration)
  d() = time decay function (exponential decay with domain-specific half-life)
  t_i = age of signal i
  s_i = signal strength (how strongly the signal supports h)
```

Independence adjustment: signals from the same source or correlated sources are down-weighted to prevent double-counting. The independence assessment uses the Source Independence axiom to identify correlation groups.

Uncertainty bounds are computed via the Monte Carlo robustness assessment (Stage 4), which samples from the distributions of `r_i`, `d()`, and `s_i` to produce posterior distributions of `C(h)`.

## Due Diligence Use Case: Firm X Acquiring Firm Y

To make QEVE concrete, walk through a complete due diligence scenario:

### Setup

Firm X is acquiring Firm Y (a SaaS company) for EUR 50M. The board requires a cybersecurity due diligence assessment. Traditional approach: hire a consulting firm to run vulnerability scans and write a report. QEVE approach:

### Step 1: Evidence Ingestion

QEVE gathers evidence from multiple sources:

- EASM scan of Firm Y's external attack surface (14 domains, 47 IPs, 12 certificates)
- Public breach databases (0 known breaches)
- Certificate Transparency logs (all certificates valid, proper issuance)
- DNS configuration analysis (DNSSEC present, SPF/DKIM/DMARC configured)
- Technology stack fingerprinting (modern framework, recent patches)
- Public code repositories (no secrets detected in public repos)
- Compliance certifications (ISO 27001 certified, SOC 2 Type II)
- Employee security awareness indicators (security blog posts, conference talks)

23 evidence signals from 8 independent sources. NABLA Signal Plurality: satisfied.

### Step 2: Hypothesis Formation

Three competing hypotheses:

- **H1**: Security posture is adequate for the acquisition (supports proceeding)
- **H2**: Security posture has significant gaps requiring remediation (supports conditional proceeding)
- **H3**: Security posture is inadequate (supports not proceeding or major renegotiation)

Evidence distribution:

- H1: 17 supporting signals, 2 contradicting signals
- H2: 4 supporting signals, 6 contradicting signals
- H3: 2 supporting signals, 14 contradicting signals

Contradictions preserved: the 2 signals contradicting H1 are explicitly tracked (one outdated SSL configuration on a legacy subdomain, one permissive CORS policy on an internal API endpoint).

### Step 3: Formal Verification

Critical properties verified through Lean4:

- Token-based authentication prevents replay (L5 proof: PASSED)
- Authorization model prevents horizontal privilege escalation (L5 proof: PASSED)
- Data encryption at rest meets regulatory requirements (L4 specification: PASSED)
- Session management prevents fixation attacks (L5 proof: PASSED)

Non-critical properties tested:

- Logging completeness (L2 contract test: PASSED with 2 minor gaps)
- Error handling consistency (L1 property test: PASSED)

### Step 4: Robustness Assessment

Monte Carlo testing (10,000 samples):

- H1 median confidence: 0.87
- H1 95% credible interval: [0.82, 0.91]
- Stability under 15% evidence degradation: 0.83 (stable)
- Sensitivity: most sensitive to EASM scan completeness (if scan coverage drops below 60%, confidence drops to 0.74)
- Critical assumption: ISO 27001 certification is current and genuine

### Step 5: Trinity Gate

- Structural consistency: PASSED (valid DAG, no orphaned claims)
- Logical consistency: PASSED (2 contradictions acknowledged, no hidden conflicts)
- Formal necessity: PASSED (4/4 critical proofs accepted)

### Final Output

```
QEVE Due Diligence Assessment: Firm Y
========================================
Primary Conclusion: H1 (Security posture adequate)
Confidence: 0.87 [0.82, 0.91] (95% CI)
Trinity Gate: PASSED (3/3 layers)
Formal Proofs: 4/4 critical properties proven
Contradictions: 2 (legacy SSL, permissive CORS)
  Remediation estimate: 2-3 days engineering effort
  Impact on conclusion: negligible (confidence drops 0.02 if unresolved)
Robustness: Stable under 15% evidence degradation
Sensitivity: Monitor EASM scan completeness and ISO certification currency
Provenance: 23 signals from 8 sources, full chain available

Recommendation: Proceed with acquisition.
Condition: Remediate legacy SSL and CORS findings within 30 days post-close.
Monitor: EASM scan coverage and ISO 27001 renewal.
```

This is what separates QEVE from a vulnerability scan report. The board does not get a color-coded PDF with "HIGH" and "MEDIUM" labels. They get a quantified conclusion with uncertainty bounds, formal proofs of critical properties, explicit contradictions with remediation estimates, sensitivity analysis identifying what to monitor, and a complete provenance chain for audit.

## Score Aggregators vs. Verification Engine

The security ratings market is dominated by score aggregators: companies that collect data, apply proprietary algorithms, and produce scores. Prismatic's QEVE is architecturally different:

| Dimension | Score Aggregators | QEVE |
|-----------|------------------|------|
| **Methodology** | Proprietary, opaque | Open axioms, traceable pipeline |
| **Output** | Score (e.g., 780/900) | Conclusion with confidence interval |
| **Contradictions** | Resolved internally | Preserved and reported |
| **Verification** | Statistical correlation | Formal proofs (Lean4) |
| **Robustness** | Not reported | Monte Carlo with sensitivity |
| **Provenance** | "Based on multiple factors" | Complete signal-to-conclusion chain |
| **Auditability** | Score + factor weights | Full pipeline artifacts |
| **Legal Defensibility** | "Industry-standard methodology" | Machine-checked proofs + axiom compliance |

For organizations facing regulatory scrutiny (NIS2, ZKB, EU AI Act, SOC 2), the auditability difference is material. A regulator asking "why did you accept this security rating?" receives either "BitSight gave us an A" or "here is the formal proof that authentication prevents replay, the Monte Carlo assessment showing robustness under evidence variation, the complete provenance chain from 23 signals across 8 sources, and the 2 documented contradictions with their remediation timeline."

## Investor-Ready Explanation

For non-technical stakeholders who need to understand QEVE:

Traditional AI tools give you a **number**. QEVE gives you a **verified conclusion with proof**. The difference matters in three scenarios:

1. **Compliance**: When a regulator asks why you made a decision, QEVE provides a complete evidence trail. Traditional tools provide a score.

2. **Due Diligence**: When evaluating an acquisition target, QEVE tells you what the assessment is sensitive to -- what would have to be wrong for the conclusion to change. Traditional tools give you a grade.

3. **Risk Management**: When assessing ongoing risk, QEVE preserves contradictions and quantifies uncertainty. Traditional tools give you a single number that hides the nuance.

QEVE does not replace human judgment. It makes human judgment **verifiable**. The human decides what questions to ask. QEVE provides answers with proofs, uncertainty bounds, and sensitivity analysis. The human makes the final decision with full information, and the entire reasoning chain is preserved for audit.

## Next Steps

- [For Security & Risk](@/about/for-security.md) -- The Color Team architecture that feeds into QEVE
- [For Executives](@/about/for-executives.md) -- Business case and compliance positioning
- [For Architects](@/about/for-architects.md) -- The epistemic pipeline that houses QEVE
- [Glossary: QEVE](@/glossary/qeve.md) -- Concise definition and key concepts
- [Glossary: Trinity Gate](@/glossary/trinity-gate.md) -- The three-layer verification gate
- [Glossary: NABLA Infinity](@/glossary/nabla-infinity.md) -- The 7 epistemic axioms
- [Glossary: Lean4](@/glossary/lean4.md) -- The theorem prover behind formal proofs

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)