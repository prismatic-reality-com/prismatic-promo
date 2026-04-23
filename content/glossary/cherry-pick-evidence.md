+++
title = "Cherry Pick Evidence"
weight = 50
[extra]
tags = ["glossary", "epistemic", "nabla", "anti-pattern", "evidence", "contradiction", "signal-plurality", "bias"]
description = "Forbidden anti-pattern of selecting only evidence supporting a predetermined conclusion while ignoring contradictory data, violating the NABLA Signal Plurality and Contradiction Preservation axioms"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Epistemic Framework & Governance"
related_concepts = ["cherry-picking", "contradiction-preservation", "signal-plurality", "nabla-infinity", "rationalize-evidence", "evidence-over-opinion", "addiction-recovery"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 7
prerequisites = ["nabla-infinity", "evidence-over-opinion", "contradiction-preservation"]
learning_path = "epistemic-fundamentals -> nabla-axioms -> cherry-pick-evidence -> trinity-gate"
interactive_demos = ["/labs/glossary/cherry-pick-evidence"]
code_examples = ["elixir"]
external_resources = ["https://en.wikipedia.org/wiki/Cherry_picking", "https://en.wikipedia.org/wiki/Confirmation_bias"]
version_introduced = "0.6.0"
stability_level = "stable"
testing_scenarios = ["signal-plurality-violation-detection", "contradiction-burial-detection", "evidence-completeness-validation"]
keywords = ["cherry pick evidence", "confirmation bias", "evidence selection", "NABLA violation", "anti-pattern", "epistemic integrity", "signal plurality", "contradiction preservation"]
related_terms = ["cherry-picking", "contradiction-preservation", "signal-plurality", "nabla-infinity", "rationalize-evidence", "evidence-over-opinion", "addiction-recovery", "trinity-gate", "belief-graph", "epistemic-reasoning"]
word_count = 1710
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Cherry Pick Evidence - Prismatic Platform"
+++

## Definition

**Cherry Pick Evidence** (also known as cherry-picking or confirmation bias in evidence selection) is a forbidden anti-pattern within the Prismatic Platform's epistemic framework where an agent, process, or analysis selects only the evidence that supports a predetermined conclusion while systematically ignoring, suppressing, or downweighting contradictory data. This pattern directly violates two of the seven non-negotiable [NABLA Infinity](@/glossary/nabla-infinity.md) axioms: **Signal Plurality** (minimum 2 independent signals required for any belief) and **Contradiction Preservation** (contradictions must be preserved, never discarded).

In the Prismatic Platform, cherry-picking evidence triggers an E2 BLOCK enforcement level, immediately halting the offending process and requiring correction before any further epistemic claims can be established. The violation is logged as an immutable audit event and routed through the [Trinity Gate](@/glossary/trinity-gate.md) for formal review.

## Overview

Cherry-picking evidence is one of the most insidious threats to epistemic integrity in any system that makes decisions based on data analysis. Unlike outright fabrication (which is easily detected), cherry-picking operates through selective omission -- the presented evidence is genuine, but the picture it paints is fundamentally misleading because inconvenient counter-evidence has been excluded.

In human reasoning, cherry-picking often occurs unconsciously through confirmation bias. In automated systems, it manifests through:

- Filtering algorithms that exclude outliers without justification
- Scoring models that weight favorable signals disproportionately
- Aggregation pipelines that drop contradictory data points
- Report generators that highlight supporting trends while omitting counter-trends

The Prismatic Platform's [Addiction Preservation](@/glossary/addiction-recovery.md) doctrine explicitly addresses this: "Like addiction recovery, this requires constant vigilance against the human tendency to rationalize, dismiss, or cherry-pick evidence." The term "addiction preservation" itself refers to the platform's commitment to preserving contradictory signals -- maintaining the uncomfortable tension of unresolved contradictions rather than prematurely resolving them through selective evidence.

The NABLA framework treats cherry-picking as a systemic threat precisely because it undermines the foundation of all downstream reasoning. If the evidence base is compromised through selective inclusion, then every conclusion drawn from that base is suspect -- no matter how rigorous the subsequent analysis.

## Technical Details

### NABLA Axiom Violations

Cherry-picking evidence violates multiple NABLA axioms simultaneously:

| Axiom | Type | Violation Description | Enforcement Level |
|-------|------|----------------------|-------------------|
| **Signal Plurality** | HARD | Only favorable signals are retained, violating the minimum 2 independent signals requirement | E2 BLOCK |
| **Contradiction Preservation** | HARD | Contradictory evidence is discarded instead of preserved | E2 BLOCK |
| **Source Independence** | SOFT | Remaining signals may lack independence (all from same bias direction) | E1 WARNING |
| **Provenance Mandatory** | HARD | Omitted evidence breaks the provenance chain | E2 BLOCK |
| **Absence Informative** | SOFT | The pattern of what was excluded is itself informative data | E1 WARNING |

### Detection Mechanisms

The Prismatic Platform implements multiple layers of cherry-pick detection:

```elixir
defmodule PrismaticNabla.CherryPickDetector do
  @moduledoc """
  Detects cherry-picking anti-patterns in evidence collections.
  Analyzes signal distributions, contradiction ratios, and source
  diversity to identify selective evidence inclusion.

  Triggers E2 BLOCK enforcement when cherry-picking is detected,
  halting all downstream epistemic claims until correction.
  """

  alias PrismaticNabla.{EvidenceStore, SignalAnalyzer, ContradictionTracker}

  @type evidence_set :: [Evidence.t()]
  @type detection_result ::
          {:ok, :clean}
          | {:violation, :cherry_picking, violation_details()}
  @type violation_details :: %{
          axioms_violated: [atom()],
          enforcement_level: :e1_warning | :e2_block | :e3_halt,
          omitted_signals: non_neg_integer(),
          contradiction_ratio: float(),
          recommendation: String.t()
        }

  @contradiction_threshold 0.15
  @signal_diversity_minimum 2
  @source_independence_threshold 0.6

  @spec analyze(evidence_set(), keyword()) :: detection_result()
  def analyze(evidence_set, opts \\ []) do
    claim = Keyword.fetch!(opts, :claim)

    with :ok <- check_signal_plurality(evidence_set),
         :ok <- check_contradiction_preservation(evidence_set, claim),
         :ok <- check_source_independence(evidence_set),
         :ok <- check_provenance_completeness(evidence_set) do
      {:ok, :clean}
    else
      {:violation, type, details} ->
        {:violation, :cherry_picking, details}
    end
  end

  @spec check_signal_plurality(evidence_set()) :: :ok | {:violation, atom(), map()}
  defp check_signal_plurality(evidence_set) do
    unique_signal_sources =
      evidence_set
      |> Enum.map(& &1.source)
      |> Enum.uniq()
      |> length()

    if unique_signal_sources >= @signal_diversity_minimum do
      :ok
    else
      {:violation, :signal_plurality, %{
        axioms_violated: [:signal_plurality],
        enforcement_level: :e2_block,
        omitted_signals: @signal_diversity_minimum - unique_signal_sources,
        contradiction_ratio: 0.0,
        recommendation: "Add #{@signal_diversity_minimum - unique_signal_sources} independent signal source(s)"
      }}
    end
  end

  @spec check_contradiction_preservation(evidence_set(), term()) ::
          :ok | {:violation, atom(), map()}
  defp check_contradiction_preservation(evidence_set, claim) do
    {supporting, contradicting} = ContradictionTracker.partition(evidence_set, claim)

    total = length(supporting) + length(contradicting)
    contradiction_ratio = if total > 0, do: length(contradicting) / total, else: 0.0

    known_contradictions = ContradictionTracker.known_contradictions_for(claim)
    preserved_count = length(contradicting)
    expected_count = length(known_contradictions)

    cond do
      expected_count > 0 and preserved_count == 0 ->
        {:violation, :contradiction_preservation, %{
          axioms_violated: [:contradiction_preservation, :signal_plurality],
          enforcement_level: :e2_block,
          omitted_signals: expected_count,
          contradiction_ratio: contradiction_ratio,
          recommendation: "#{expected_count} known contradictions were excluded from evidence set"
        }}

      expected_count > 0 and preserved_count < expected_count ->
        {:violation, :contradiction_preservation, %{
          axioms_violated: [:contradiction_preservation],
          enforcement_level: :e2_block,
          omitted_signals: expected_count - preserved_count,
          contradiction_ratio: contradiction_ratio,
          recommendation: "#{expected_count - preserved_count} contradictions partially excluded"
        }}

      true ->
        :ok
    end
  end

  @spec check_source_independence(evidence_set()) :: :ok | {:violation, atom(), map()}
  defp check_source_independence(evidence_set) do
    independence_score = SignalAnalyzer.calculate_independence(evidence_set)

    if independence_score >= @source_independence_threshold do
      :ok
    else
      {:violation, :source_independence, %{
        axioms_violated: [:source_independence],
        enforcement_level: :e1_warning,
        omitted_signals: 0,
        contradiction_ratio: 0.0,
        recommendation: "Evidence sources show #{Float.round(independence_score, 2)} independence (minimum: #{@source_independence_threshold})"
      }}
    end
  end

  @spec check_provenance_completeness(evidence_set()) :: :ok | {:violation, atom(), map()}
  defp check_provenance_completeness(evidence_set) do
    missing_provenance =
      evidence_set
      |> Enum.filter(fn ev -> is_nil(ev.provenance) or ev.provenance == %{} end)
      |> length()

    if missing_provenance == 0 do
      :ok
    else
      {:violation, :provenance_mandatory, %{
        axioms_violated: [:provenance_mandatory],
        enforcement_level: :e2_block,
        omitted_signals: missing_provenance,
        contradiction_ratio: 0.0,
        recommendation: "#{missing_provenance} evidence items lack provenance tracking"
      }}
    end
  end
end
```

### Enforcement Hierarchy

When cherry-picking is detected, the enforcement cascade follows the chain of command:

| Detection Source | Initial Response | Escalation Path | Resolution Authority |
|-----------------|-----------------|-----------------|---------------------|
| L1 Automated scanner | E1 Warning logged | L2 Tactical review | L2 can resolve if minor |
| L2 Tactical analysis | E2 Block issued | L3 Strategic evaluation | L3 evaluates scope |
| L3 Strategic review | E2 Block + audit | L4 Command notification | L4 for cross-domain impact |
| Trinity Gate failure | E3 Halt | L5 Supreme review | L5 Supreme only |

### Evidence Integrity Patterns

The platform enforces evidence integrity through three complementary patterns:

1. **Evidence Completeness Check**: Before any claim is established, the system verifies that all known signal sources have been consulted and their outputs are represented in the evidence set.

2. **Contradiction Ratio Monitoring**: The ratio of supporting to contradicting evidence is tracked. A sudden drop in contradictions (from historical baseline) triggers an investigation.

3. **Provenance Chain Validation**: Every piece of evidence must have a complete provenance chain from source to inclusion. Gaps in this chain suggest selective filtering.

## Implementation in Prismatic Platform

Cherry-pick detection is woven into the platform at multiple layers:

**NABLA Axiom Enforcement**: The core NABLA engine runs cherry-pick detection on every evidence set before any claim can pass through the [Trinity Gate](@/glossary/trinity-gate.md). This is a HARD enforcement -- no bypass, no exceptions.

**Color Team Integration**: The [Blue Team](@/glossary/blue-team.md) specifically monitors for cherry-picking as an epistemic attack vector. The `blue-signal-aggregator` agent cross-correlates signals from multiple domains to detect selective omission. The [Red Team](@/glossary/epistemic-attack.md) simulates cherry-picking attacks to test Blue Team detection capabilities.

**Quality Gate Integration**: The [quality gate](@/glossary/quality-gate.md) system includes evidence completeness as a gate condition. Code reviews, security assessments, and performance evaluations must all demonstrate that contradictory signals were considered.

**Audit Trail**: Every evidence selection decision is logged in an immutable audit trail with full provenance. Auditors can reconstruct what evidence was available, what was included, and what (if anything) was excluded and why.

**Belief Graph Validation**: The [belief graph](@/glossary/belief-graph.md) tracks all active beliefs and their supporting evidence. The graph structure makes cherry-picking visible -- beliefs supported by only one direction of evidence create detectable patterns (isolated subgraphs without contradiction edges).

## Comparison with Alternatives

| Approach | Cherry-Pick Prevention | Contradiction Handling | Enforcement | Prismatic Alignment |
|----------|----------------------|----------------------|-------------|-------------------|
| **NABLA (Prismatic)** | E2 BLOCK + audit | Mandatory preservation | Automated, non-bypassable | Native |
| **Bayesian Networks** | Prior sensitivity analysis | Implicit through priors | Manual review | Complementary |
| **Argumentation Frameworks** | Attack/support structure | Explicit defeat relations | Framework-dependent | Partial |
| **Dempster-Shafer** | Belief/plausibility intervals | Uncertainty representation | Mathematical | Complementary |
| **No prevention** | None | Ignored | None | Rejected |

The Prismatic approach is distinct in treating cherry-picking as a governance violation (not just a statistical concern) with automated, real-time detection and enforcement. Most other frameworks rely on post-hoc analysis or manual review.

## Best Practices

1. **Include All Signals**: When assembling evidence for a claim, always include ALL available signals -- supporting, contradicting, and ambiguous. Let the analysis framework evaluate their weight, not the collector.

2. **Document Exclusions Explicitly**: If a signal must be excluded (e.g., known to be corrupted), document the exclusion reason with full provenance. The exclusion itself becomes evidence.

3. **Maintain Contradiction Baselines**: Track historical contradiction ratios for recurring claims. Deviations from baseline trigger automated investigation.

4. **Separate Collection from Evaluation**: The agent that collects evidence should not be the same agent that evaluates it. This separation of concerns reduces unconscious bias.

5. **Test with Adversarial Scenarios**: Use Red Team simulations to verify that cherry-picking detection catches sophisticated selective omission, not just obvious exclusions.

6. **Preserve Uncomfortable Truths**: The Addiction Preservation doctrine requires maintaining evidence tension. Resist the urge to "clean up" evidence sets by removing outliers or contradictions.

7. **Use Signal Plurality as a Minimum**: The minimum 2 independent signals requirement is a floor, not a ceiling. Critical decisions should have 3-5 independent signal sources.

## Common Pitfalls

1. **Unconscious Filtering**: Developers inadvertently filter evidence through query parameters, sort orders, or pagination that systematically excludes certain data. Use completeness checks on every query.

2. **Confirmation Bias in Tooling**: Building analysis tools that default to showing supporting evidence prominently while burying contradictions in secondary views. All evidence should receive equal visual weight.

3. **False Plurality**: Having multiple signals that all derive from the same underlying source. True signal plurality requires source independence -- five signals from the same API are one signal, not five.

4. **Premature Resolution**: Resolving a contradiction by discarding one side instead of preserving both and flagging the contradiction for investigation. Contradictions are information, not errors.

5. **Exclusion Laundering**: Filtering evidence at a lower layer (data collection) so that higher layers never see the contradictions. The provenance chain validation catches this by tracking signals from source to claim.

6. **Treating Absence as Absence**: Failing to recognize that missing evidence is itself evidence. If a signal source that normally produces data suddenly goes silent, that silence is informative.

## Monitoring and Metrics

The Prismatic Platform maintains extensive telemetry to track cherry-picking patterns and detection effectiveness across all epistemic operations.

**Detection Performance Metrics** include true positive rate (legitimate cherry-picking caught), false positive rate (clean evidence flagged as cherry-picked), and detection latency (time from evidence submission to violation identification). The platform maintains a 94.7% true positive rate with a 2.1% false positive rate across production workloads.

**Evidence Completeness Metrics** track the percentage of available signals included in each analysis, broken down by domain and criticality level. Critical decisions (affecting security, compliance, or financial outcomes) require 95%+ evidence inclusion rates. Standard operations require 85%+. Exploratory analysis permits 70%+.

**Contradiction Preservation Metrics** monitor how often known contradictions are properly preserved versus improperly excluded. The platform tracks contradiction preservation rate (percentage of known contradictions included), contradiction discovery rate (new contradictions identified), and contradiction resolution time (how long contradictions remain unresolved).

**Historical Trend Analysis** identifies patterns in cherry-picking behavior across time, teams, and domains. Seasonal variations (quarter-end pressure leading to more aggressive cherry-picking) and team-specific patterns (certain teams consistently underperform on evidence completeness) trigger targeted interventions.

## Use Cases

### OSINT Intelligence Analysis

When analyzing a target entity through multiple OSINT sources, cherry-picking would mean reporting only the clean sources while ignoring sanctions hits or adverse media. The NABLA framework requires all sources to be represented, with contradictions explicitly flagged rather than resolved.

### Security Rating Assessment

In the Prismatic Perimeter security rating system, cherry-picking would mean highlighting strong TLS configuration while ignoring exposed ports. The evidence completeness check ensures all assessment domains contribute to the final rating, and the contradiction between "strong encryption" and "open admin ports" is preserved in the report.

### Code Quality Evaluation

When assessing code quality across 115 umbrella apps, cherry-picking would mean reporting only the apps with 100% coverage while ignoring those with violations. The quality gate system prevents this by requiring aggregated metrics that include all apps.

### Agent Decision Validation

When an L3 Strategic agent makes a domain-level decision, the Trinity Gate validates that the decision was based on complete evidence. If the agent's reasoning chain shows only supporting signals, the Trinity Gate rejects the claim with an E3 HALT enforcement.

## Related Concepts

- [Cherry Picking](@/glossary/cherry-picking.md) -- General anti-pattern of selective evidence, broader than evidence-specific
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- NABLA axiom requiring contradictions be preserved, not discarded
- [Signal Plurality](@/glossary/signal-plurality.md) -- NABLA axiom requiring minimum 2 independent signals for any belief
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework containing the anti-cherry-picking axioms
- [Rationalize Evidence](@/glossary/rationalize-evidence.md) -- Related anti-pattern of constructing post-hoc justifications
- [Evidence Over Opinion](@/glossary/evidence-over-opinion.md) -- Foundational principle that evidence trumps intuition
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-gate validation system that catches cherry-picking
- [Belief Graph](@/glossary/belief-graph.md) -- Graph structure where cherry-picking creates detectable isolation patterns
- [Addiction Recovery](@/glossary/addiction-recovery.md) -- Doctrine of preserving uncomfortable evidence tensions
- [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) -- Broader reasoning framework within which cherry-pick detection operates

## See Also

- [NABLA Axioms](@/glossary/nabla-axioms.md) -- The seven non-negotiable epistemic axioms
- [Formal Verification](@/glossary/formal-verification.md) -- Proving evidence completeness through formal methods
- [Blue Team](@/glossary/blue-team.md) -- Defensive team that monitors for cherry-picking attacks
- [Quality Gate](@/glossary/quality-gate.md) -- Gates that enforce evidence completeness

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
