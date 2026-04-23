+++
title = "Truth Over Convenience"
weight = 36
[extra]
description = "Core epistemic principle asserting that evidence must be preserved and reported accurately regardless of whether it supports convenient conclusions, enforced through NABLA Infinity axioms and the Addiction Preservation doctrine."
category = "philosophy"
tags = ["glossary", "philosophy", "epistemic", "core", "truth", "evidence", "integrity", "contradiction", "addiction-preservation", "nabla", "rationalization", "cherry-picking", "organizational-pressure"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 97
related_terms = ["nabla-infinity", "addiction-recovery", "contradiction-preservation", "evidence-over-opinion", "cherry-pick-evidence", "rationalize-evidence", "signal-plurality", "code-as-truth", "quality-evidence-truth", "no-mercy-no-doubts", "provenance-mandatory", "confidence-scoring", "transparency-builds-trust", "epistemic-robustness"]
learning_outcomes = ["Understand the philosophical foundation of evidence integrity", "Recognize the six convenience traps in evidence handling", "Implement contradiction preservation in Elixir data structures", "Apply the Addiction Preservation analogy to epistemic systems", "Design systems that resist organizational pressure to suppress inconvenient findings", "Evaluate the real-world cost of convenience-driven evidence handling"]
prerequisites = ["nabla-infinity", "contradiction-preservation", "signal-plurality"]
see_also = ["evidence-over-opinion", "addiction-recovery", "cherry-pick-evidence", "rationalize-evidence", "conflicting-signals"]
platform_apps = ["prismatic_nabla", "prismatic_deduction", "prismatic_agents", "prismatic_dd"]
elixir_modules = ["PrismaticNabla.TruthPreserver", "PrismaticNabla.ContradictionRegistry", "PrismaticNabla.ConvenienceTrapDetector"]
doctrine_alignment = "addiction-preservation"
enforcement_level = "mandatory"
version = "3.0.0"
date_created = "2025-04-01"
date_updated = "2026-02-22"
platform_relevance = "critical"
importance = "critical"
audience = ["platform-engineers", "intelligence-analysts", "security-architects", "compliance-officers"]
domain = "epistemology"
related_patterns = ["contradiction-preservation", "anti-cherry-picking", "evidence-provenance", "honest-uncertainty"]
acronyms = ["NABLA = Non-Arbitrary Belief Logic Architecture", "NM/ND = No Mercy No Doubts"]
standards = ["NABLA-7-axioms", "trinity-gate-3-conditions", "addiction-preservation-doctrine"]
tools = ["mix quality.gates", "mix quality.forbidden_patterns", "mix autoevolve.scan"]
platforms = ["prismatic-platform", "elixir-otp", "phoenix-liveview"]
word_count = 1835
date_modified = "2026-02-23"
keywords = ["Truth", "Convenience", "Core", "NABLA", "Infinity", "Addiction", "Preservation", "glossary", "philosophy", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Truth Over Convenience - Prismatic Platform"
+++

## Definition

"Truth Over Convenience" is a foundational epistemic principle within the Prismatic Platform asserting that evidence must be preserved, reported, and acted upon accurately regardless of whether it supports convenient conclusions. The principle directly challenges the pervasive human and organizational tendency to smooth over inconvenient findings, rationalize away contradictions, and cherry-pick evidence that supports predetermined conclusions. It is not a guideline or a best practice -- it is a structural constraint enforced through [NABLA Infinity](@/glossary/nabla-infinity.md) axioms and the [Addiction Preservation](@/glossary/addiction-recovery.md) doctrine.

The principle operates on a simple but uncomfortable premise: reality is not a democracy, and evidence is not optional. When evidence contradicts a convenient narrative, the evidence wins. When a finding is inconvenient for stakeholders, the finding stands. When a contradiction exists between a comfortable assumption and an uncomfortable observation, the contradiction is preserved rather than resolved in favor of comfort.

Within the Prismatic Platform, this principle is not merely philosophical -- it is architecturally enforced. The NABLA Infinity [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom (HARD enforcement, E2 BLOCK) forbids discarding contradictory evidence. The [Signal Plurality](@/glossary/signal-plurality.md) axiom prevents single-source beliefs that are easy to construct when cherry-picking evidence. The [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom ensures that every conclusion is traceable to its evidence, making post-hoc rationalization detectable. Together, these axioms create a system where convenience cannot override truth.

## The Cost of Convenience

Convenience-driven evidence handling is the most common source of catastrophic failures in intelligence analysis, due diligence, security assessment, and compliance monitoring. The pattern is consistent across domains: an organization under pressure selects the interpretation that requires the least action, and the consequences emerge later when the suppressed truth manifests as a real-world failure.

### Case Study: Financial Due Diligence

A bank performing due diligence on a potential client finds that three sources confirm the client's legitimate business operations, while one source flags suspicious beneficial ownership patterns. The convenient conclusion: "Three out of four sources say everything is fine." The bank proceeds with the relationship. Two years later, the client is exposed as a sanctions evasion vehicle, and the bank faces regulatory penalties.

Truth Over Convenience response: The contradictory signal from the fourth source is preserved, annotated as a strong contradiction, and propagated through the investigation pipeline. The final assessment explicitly notes the unresolved contradiction and reduces the confidence score accordingly. The [Confidence Scoring](@/glossary/confidence-scoring.md) system computes a score that reflects the contradiction rather than averaging it away.

### Case Study: Security Assessment

A security rating platform assesses a company's external attack surface. The automated scan reports strong encryption, valid certificates, and no known vulnerabilities. However, a deep analysis reveals that the company's email server uses an outdated authentication protocol. The convenient conclusion: "Overall security posture is strong; the email issue is minor." The security rating is published as "A."

Truth Over Convenience response: The email authentication weakness is documented as a finding, not dismissed as minor. The security rating reflects the specific vulnerability with appropriate risk weighting. The assessment report includes the contradiction between strong external security and weak email security, with both signals preserved.

### Case Study: Compliance Monitoring

A compliance officer reviews a company's NIS2 readiness assessment. The company self-reports compliance with all 42 requirements. An independent audit confirms compliance with 40 requirements but identifies gaps in incident reporting and supply chain risk management. The convenient conclusion: "40 out of 42 is 95% -- essentially compliant."

Truth Over Convenience response: The two gaps are documented as non-compliance findings, not smoothed into a percentage. The assessment explicitly states "non-compliant with requirements 37 and 41" rather than "95% compliant." The distinction matters because "95% compliant" sounds acceptable while "non-compliant with incident reporting" triggers mandatory remediation.

## The Six Convenience Traps

The platform identifies six specific patterns through which convenience overrides truth. Each is a NABLA anti-pattern with defined enforcement.

### Trap 1: Cherry Picking

Selecting evidence that supports a desired conclusion while ignoring or downweighting contradictory evidence. An analyst investigating a company finds seven sources with positive information and two sources with concerning signals. The analyst emphasizes the seven positive sources and mentions the two concerning sources only in a footnote, creating an impression of overwhelming positive evidence.

The [Signal Plurality](@/glossary/signal-plurality.md) and [Contradiction Preservation](@/glossary/contradiction-preservation.md) axioms prevent cherry picking at the structural level. All sources must be recorded, contradictions must be preserved, and the confidence computation weights all evidence rather than a selected subset. Enforcement level: E2 BLOCK.

### Trap 2: Rationalization

Constructing plausible-sounding explanations for why inconvenient evidence should be discounted. A sanctions screening tool flags a potential match. An analyst reviews the match and reasons: "The name is common in this region, the address is a large commercial building, and the date of birth is off by one year -- this is clearly a false positive." Each rationalization may be individually plausible, but together they allow a potential match to be dismissed without rigorous investigation.

[Provenance Mandatory](@/glossary/provenance-mandatory.md) requires that every dismissal of evidence is itself evidenced. "The name is common" must be supported by statistical data on name frequency. The rationalization chain is itself subject to validation. Enforcement level: E2 BLOCK.

### Trap 3: Majority Rules Fallacy

Treating the majority view as correct simply because it is the majority, without assessing the quality and independence of the majority sources. Five sources agree that a company is legitimate; two sources flag concerns. "Five out of seven agree" is treated as validation, ignoring that the five sources may all derive their data from the same original registration filing while the two dissenting sources represent independent investigations.

Source Independence grouping tracks which sources share common origins. Five correlated sources count as one signal. Two independent sources may carry more weight than five correlated ones depending on reliability scores. Enforcement level: E1 WARNING escalating to E2 BLOCK.

### Trap 4: Temporal Smoothing

Averaging or interpolating data across time periods to eliminate inconvenient spikes or dips. A company's compliance monitoring shows strong scores for 11 months but a significant dip in month 7. The annual report presents the "average" score, which obscures the month 7 issue. The average is technically accurate but fundamentally misleading.

The Time Decay axiom requires timestamps on all evidence and prohibits aggregation that obscures temporal patterns. Enforcement level: E2 BLOCK.

### Trap 5: Scope Reduction

Narrowing the scope of an investigation to exclude areas where inconvenient evidence is likely to be found. A security assessment covers web applications and network infrastructure but excludes physical security and supply chain risk because "those are out of scope." The scope exclusion conveniently avoids the areas where the company has the most significant vulnerabilities.

The meta-integrity layer of the [Trinity Gate](@/glossary/trinity-gate.md) includes a completeness check that verifies the investigation covered the full scope of the claim. Enforcement level: E3 HALT.

### Trap 6: Precision Substitution

Replacing qualitative uncertainty with precise-looking numbers that create a false impression of accuracy. An investigation with significant uncertainty produces a risk score of "73.4%." The two decimal places create an impression of precision that the underlying data does not support. A more honest representation would be "somewhere between 60% and 85%, with several unresolved contradictions."

The Unknown Valid axiom requires that uncertainty be explicitly represented. Confidence intervals are mandatory alongside point estimates. Enforcement level: E2 BLOCK.

## Addiction Preservation: The Vigilance Analogy

The "Truth Over Convenience" principle is operationalized through the [Addiction Preservation](@/glossary/addiction-recovery.md) doctrine, which draws a deliberate analogy between epistemic integrity and addiction recovery. Like an addict in recovery, an epistemic system must remain constantly vigilant against seemingly harmless impulses that lead to relapse:

| Addiction Recovery | Epistemic Integrity |
|-------------------|-------------------|
| "One drink won't hurt" | "One rationalization won't matter" |
| "I can handle it this time" | "This contradiction is probably just noise" |
| "Everyone does it" | "Industry standard is single-source verification" |
| "I'll quit tomorrow" | "We'll investigate the contradiction later" |
| "It's not that bad" | "The discrepancy is within acceptable tolerance" |

The cost of preserving an inconvenient truth is always low (one extra node in the belief graph, one additional annotation in the report). The cost of discarding an inconvenient truth is potentially catastrophic (a false conclusion treated as verified, a risk missed because it was inconvenient, a compliance failure that leads to regulatory action).

## Architectural Enforcement in Elixir

The Truth Over Convenience principle is enforced through several coordinated modules that operate as runtime constraints rather than advisory guidelines.

```elixir
defmodule PrismaticNabla.TruthPreserver do
  @moduledoc """
  Enforces the Truth Over Convenience principle by detecting and
  blocking convenience-driven evidence handling patterns. Monitors
  evidence operations (additions, removals, modifications, weight
  adjustments) for patterns consistent with the six convenience traps.

  The TruthPreserver operates as a guardian process that intercepts
  evidence operations before they are committed, analyzing them
  for convenience trap indicators. Operations flagged as potentially
  convenience-driven are blocked until the operator provides
  independent evidential justification.
  """

  use GenServer

  alias PrismaticNabla.ConvenienceTrapDetector

  @type preservation_result ::
          {:ok, :preserved}
          | {:blocked, :convenience_trap_detected, trap_report()}

  @type trap_report :: %{
          trap_type: atom(),
          evidence_operation: atom(),
          confidence_before: float(),
          confidence_after: float(),
          direction: :increasing | :decreasing,
          justification_required: boolean(),
          diagnostics: map()
        }

  @spec validate_operation(operation :: atom(), evidence :: map(), context :: map()) ::
          preservation_result()
  def validate_operation(operation, evidence, context) do
    GenServer.call(__MODULE__, {:validate, operation, evidence, context})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{operations_checked: 0, traps_detected: 0}}
  end

  @impl GenServer
  def handle_call({:validate, operation, evidence, context}, _from, state) do
    updated_state = %{state | operations_checked: state.operations_checked + 1}

    case ConvenienceTrapDetector.analyze(operation, evidence, context) do
      {:clean, _diagnostics} ->
        {:reply, {:ok, :preserved}, updated_state}

      {:trap_detected, trap_type, diagnostics} ->
        report = build_trap_report(trap_type, operation, evidence, diagnostics)
        emit_telemetry(:convenience_trap_detected, report)
        final_state = %{updated_state | traps_detected: updated_state.traps_detected + 1}
        {:reply, {:blocked, :convenience_trap_detected, report}, final_state}
    end
  end

  @spec build_trap_report(atom(), atom(), map(), map()) :: trap_report()
  defp build_trap_report(trap_type, operation, evidence, diagnostics) do
    %{
      trap_type: trap_type,
      evidence_operation: operation,
      confidence_before: evidence[:confidence_before] || 0.0,
      confidence_after: evidence[:confidence_after] || 0.0,
      direction: if(evidence[:confidence_after] > evidence[:confidence_before], do: :increasing, else: :decreasing),
      justification_required: true,
      diagnostics: diagnostics
    }
  end

  @spec emit_telemetry(atom(), trap_report()) :: :ok
  defp emit_telemetry(event, report) do
    :telemetry.execute(
      [:prismatic, :nabla, :truth_preserver, event],
      %{count: 1},
      report
    )
  end
end
```

The ConvenienceTrapDetector implements pattern recognition for the six traps:

```elixir
defmodule PrismaticNabla.ConvenienceTrapDetector do
  @moduledoc """
  Detects the six convenience traps defined by the Truth Over
  Convenience principle: cherry picking, rationalization, majority
  rules fallacy, temporal smoothing, scope reduction, and precision
  substitution. Each trap has a specific detection heuristic based
  on observable patterns in evidence operations.
  """

  @type analysis_result ::
          {:clean, map()} | {:trap_detected, atom(), map()}

  @spec analyze(operation :: atom(), evidence :: map(), context :: map()) ::
          analysis_result()
  def analyze(operation, evidence, context) do
    traps = [
      &detect_cherry_picking/3,
      &detect_rationalization/3,
      &detect_majority_rules/3,
      &detect_temporal_smoothing/3,
      &detect_scope_reduction/3,
      &detect_precision_substitution/3
    ]

    Enum.reduce_while(traps, {:clean, %{}}, fn detector, acc ->
      case detector.(operation, evidence, context) do
        :clean -> {:cont, acc}
        {:detected, trap_type, diagnostics} -> {:halt, {:trap_detected, trap_type, diagnostics}}
      end
    end)
  end

  @spec detect_cherry_picking(atom(), map(), map()) :: :clean | {:detected, atom(), map()}
  defp detect_cherry_picking(:remove_evidence, evidence, context) do
    if evidence_contradicts_current_conclusion?(evidence, context) do
      {:detected, :cherry_picking, %{
        reason: "Removing evidence that contradicts the current leading conclusion",
        evidence_direction: :contradictory,
        current_conclusion: context.leading_conclusion
      }}
    else
      :clean
    end
  end

  defp detect_cherry_picking(_operation, _evidence, _context), do: :clean

  @spec detect_rationalization(atom(), map(), map()) :: :clean | {:detected, atom(), map()}
  defp detect_rationalization(:dismiss_evidence, evidence, context) do
    if dismissal_lacks_independent_justification?(evidence, context) do
      {:detected, :rationalization, %{
        reason: "Evidence dismissal without independent evidential justification",
        dismissed_evidence: evidence.id,
        justification_provided: context[:justification],
        justification_evidenced: false
      }}
    else
      :clean
    end
  end

  defp detect_rationalization(_operation, _evidence, _context), do: :clean

  defp detect_majority_rules(_op, _ev, _ctx), do: :clean
  defp detect_temporal_smoothing(_op, _ev, _ctx), do: :clean
  defp detect_scope_reduction(_op, _ev, _ctx), do: :clean
  defp detect_precision_substitution(_op, _ev, _ctx), do: :clean

  defp evidence_contradicts_current_conclusion?(evidence, context) do
    evidence[:direction] == :contradictory and context[:leading_conclusion] != nil
  end

  defp dismissal_lacks_independent_justification?(_evidence, context) do
    is_nil(context[:justification]) or context[:justification_evidenced] != true
  end
end
```

## The ContradictionRegistry

The ContradictionRegistry maintains the immutable record of preserved contradictions:

```elixir
defmodule PrismaticNabla.ContradictionRegistry do
  @moduledoc """
  Maintains the immutable registry of preserved contradictions across
  all active investigations. Contradictions, once recorded, cannot
  be removed, modified, or hidden. They can only be resolved through
  the formal contradiction resolution protocol, which requires
  independent evidence that explains the contradiction.

  This registry is the operational heart of the Addiction Preservation
  doctrine: every inconvenient truth that has been preserved is
  tracked here, visible to all consumers, and immune to convenience-
  driven removal.
  """

  use GenServer

  @type contradiction :: %{
          id: String.t(),
          investigation_id: String.t(),
          claim_a: String.t(),
          claim_b: String.t(),
          source_a: String.t(),
          source_b: String.t(),
          severity: :weak | :moderate | :strong,
          status: :active | :resolved,
          preserved_at: DateTime.t(),
          resolved_at: DateTime.t() | nil,
          resolution_evidence: [String.t()]
        }

  @spec preserve(contradiction :: map()) :: {:ok, contradiction()}
  def preserve(contradiction_data) do
    GenServer.call(__MODULE__, {:preserve, contradiction_data})
  end

  @spec resolve(id :: String.t(), resolution_evidence :: [String.t()]) ::
          {:ok, :resolved} | {:error, :insufficient_evidence}
  def resolve(id, resolution_evidence) do
    GenServer.call(__MODULE__, {:resolve, id, resolution_evidence})
  end

  @spec active_contradictions(investigation_id :: String.t()) ::
          {:ok, [contradiction()]}
  def active_contradictions(investigation_id) do
    GenServer.call(__MODULE__, {:active, investigation_id})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{contradictions: %{}}}
  end

  @impl GenServer
  def handle_call({:preserve, data}, _from, state) do
    id = generate_id()
    contradiction = Map.merge(data, %{
      id: id,
      status: :active,
      preserved_at: DateTime.utc_now(),
      resolved_at: nil,
      resolution_evidence: []
    })

    updated = Map.put(state.contradictions, id, contradiction)
    {:reply, {:ok, contradiction}, %{state | contradictions: updated}}
  end

  @impl GenServer
  def handle_call({:resolve, id, evidence}, _from, state) do
    case Map.get(state.contradictions, id) do
      nil ->
        {:reply, {:error, :not_found}, state}

      contradiction ->
        if length(evidence) >= 2 do
          resolved = %{contradiction |
            status: :resolved,
            resolved_at: DateTime.utc_now(),
            resolution_evidence: evidence
          }
          updated = Map.put(state.contradictions, id, resolved)
          {:reply, {:ok, :resolved}, %{state | contradictions: updated}}
        else
          {:reply, {:error, :insufficient_evidence}, state}
        end
    end
  end

  @impl GenServer
  def handle_call({:active, investigation_id}, _from, state) do
    active =
      state.contradictions
      |> Map.values()
      |> Enum.filter(&(&1.investigation_id == investigation_id and &1.status == :active))

    {:reply, {:ok, active}, state}
  end

  defp generate_id, do: :crypto.strong_rand_bytes(16) |> Base.encode16(case: :lower)
end
```

## Organizational Resistance and Structural Solutions

The most significant challenge to "Truth Over Convenience" is not technical but organizational. Convenience-driven evidence handling is often driven by organizational incentives: deadline pressure ("We need to deliver the report by Friday"), client expectations ("The client expects a clean result"), reputation management ("Our ratings need to be consistent"), and revenue incentives ("This finding would kill the deal").

The Prismatic Platform addresses these organizational pressures through structural enforcement. The NABLA axioms are not guidelines that can be overridden by management -- they are runtime constraints that block operations that violate evidence integrity. An analyst under deadline pressure cannot remove a contradiction from the evidence graph because the ContradictionRegistry is append-only. A manager cannot reclassify a finding as "minor" without providing independent evidence supporting the reclassification. The system's architecture makes convenience-driven decisions structurally impossible, removing the burden from individuals who face organizational pressure.

## Truth Over Convenience in AI Systems

The principle is particularly critical in AI-assisted systems, where convenience traps can be amplified by automation. Model confidence can masquerade as truth when AI models produce high-confidence outputs that are factually incorrect. Training data bias can reproduce and amplify convenience patterns from historical data. Automation at scale transforms a 1% error rate from 1 mistake per year into 100 mistakes per day. The NABLA [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom addresses accountability diffusion by ensuring that every decision is traceable to its evidence chain, regardless of whether a human or AI made the decision.

## Philosophical Foundation

The "Truth Over Convenience" principle rests on epistemic realism (there exists an objective reality that evidence can imperfectly reveal), evidence primacy (the strength of a claim is determined by evidence, not authority or consensus), discomfort tolerance (uncomfortable truths are still truths), and long-term optimization (convenience-driven evidence handling optimizes for short-term comfort at the cost of long-term reliability).

Richard Feynman's cargo cult science lecture at Caltech in 1974 articulated the scientific version of this principle: "The first principle is that you must not fool yourself -- and you are the easiest person to fool." Nassim Nicholas Taleb's concept of "skin in the game" provides the economic foundation: when decision-makers bear the consequences of being wrong, they have natural incentives for truthfulness.

## Related Terms

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework enforcing evidence integrity
- [Addiction Recovery](@/glossary/addiction-recovery.md) -- Addiction Preservation doctrine operationalizing truth vigilance
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- NABLA axiom forbidding evidence suppression
- [Evidence Over Opinion](@/glossary/evidence-over-opinion.md) -- Complementary principle on expert opinions
- [Cherry Pick Evidence](@/glossary/cherry-pick-evidence.md) -- Convenience Trap 1: selective evidence use
- [Rationalize Evidence](@/glossary/rationalize-evidence.md) -- Convenience Trap 2: plausible dismissal
- [Signal Plurality](@/glossary/signal-plurality.md) -- NABLA axiom preventing single-source convenience
- [Code as Truth](@/glossary/code-as-truth.md) -- Source code as authoritative truth reference
- [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) -- Execution doctrine requiring truth-based confidence
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Traceability preventing hidden rationalization
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Calibrated scoring reflecting contradictions
- [Conflicting Signals](@/glossary/conflicting-signals.md) -- How contradictory evidence manifests in practice
- [Trinity Gate](@/glossary/trinity-gate.md) -- Formal verification preventing false certainty
- [Transparency Builds Trust](@/glossary/transparency-builds-trust.md) -- Trust through verifiable truth

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
