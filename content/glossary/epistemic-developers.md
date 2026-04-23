+++
title = "Epistemic Developers"
description = "Epistemic Developers - software engineers who practice evidence-based reasoning, contradiction preservation, and rigorous verification as core development disciplines, treating code as testable hypotheses rather than assumed truths, and building systems that maintain epistemic integrity under adversarial conditions."
weight = 50

[extra]
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "epistemic-philosophy"
related_concepts = ["epistemic reasoning", "NABLA infinity", "contradiction preservation", "evidence-based development", "Trinity Gate", "formal verification", "adversarial thinking"]
implementation_status = "production"
authority_level = "L3-strategic"
prerequisites = ["software engineering fundamentals", "critical thinking", "understanding of formal logic", "familiarity with scientific method"]
learning_path = ["software engineering", "critical thinking", "epistemic reasoning", "formal verification", "adversarial security", "platform epistemic engineering"]
interactive_demos = false
code_examples = true
external_resources = ["https://plato.stanford.edu/entries/epistemology/", "https://en.wikipedia.org/wiki/Epistemology", "https://hexdocs.pm/stream_data/StreamData.html"]
version_introduced = "0.5.0"
stability_level = "stable"
testing_scenarios = ["hypothesis validation testing", "contradiction detection in code", "evidence chain verification", "belief network consistency checking"]
keywords = ["epistemic developers", "evidence-based development", "contradiction preservation", "epistemic reasoning", "code as hypothesis", "formal verification", "truth-seeking development", "adversarial thinking", "NABLA", "Trinity Gate"]
tags = ["epistemic", "philosophy", "development-practice", "verification", "evidence", "platform", "advanced"]
related_terms = ["epistemic-reasoning", "nabla-infinity", "contradiction-preservation", "evidence", "trinity-gate", "formal-verification", "adversarial-thinking", "code-as-hypothesis", "bayesian-reasoning", "proves-before-claiming"]
date_created = "2026-02-22"
word_count = 2172
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Epistemic Developers - Prismatic Platform"
+++

## Definition

**Epistemic Developers** are software engineers who have internalized the principles of epistemology -- the branch of philosophy concerned with the nature, sources, and limits of knowledge -- and apply these principles systematically to software development. An epistemic developer treats every piece of code as a testable hypothesis rather than an assumed truth, preserves contradictory evidence rather than discarding it, maintains explicit confidence levels for technical decisions, and subjects all claims to rigorous verification before accepting them as established knowledge.

The concept goes beyond "writing good tests" or "following best practices." Epistemic development is a fundamental orientation toward truth-seeking in software engineering: the recognition that software systems encode beliefs about the world, that those beliefs can be wrong, that wrongness has consequences, and that the only defense against systematic error is disciplined epistemic practice -- the same discipline that separates science from superstition.

Within the Prismatic Platform, the epistemic developer philosophy is codified in the NABLA Infinity framework, enforced through the Trinity Gate verification system, and operationalized through the color-team security architecture. Every developer contributing to the platform is expected to practice epistemic development: questioning assumptions, preserving contradictions, demanding evidence, and proving before claiming.

## Overview

Traditional software development operates on implicit trust: developers trust that their understanding of requirements is correct, that their mental models of the system are accurate, that their code does what they think it does, and that their tests cover the important cases. Epistemic development systematically challenges each of these trust assumptions.

The epistemic developer framework rests on seven foundational principles, directly derived from the NABLA Infinity axioms:

**1. Signal Plurality**: No belief about the system should rest on a single source of evidence. If a function appears to work based on one test, that is insufficient. Multiple independent signals (unit tests, property-based tests, type checking, formal proofs, runtime monitoring) must converge before a claim is established.

**2. Contradiction Preservation**: When evidence contradicts existing beliefs about the system, both the evidence and the belief must be preserved and investigated. Discarding contradictory evidence -- whether a failing test that "shouldn't fail" or a performance anomaly that "doesn't make sense" -- is an epistemic violation.

**3. Absence as Information**: The absence of evidence is itself evidence. When a module has no tests, that is information about risk. When a function has no typespec, that is information about verification gaps. When a behavior has no documentation, that is information about knowledge silos. Epistemic developers track what is missing, not just what is present.

**4. Time Decay**: Knowledge about software degrades over time. A test that passed six months ago provides weaker evidence than a test that passed today. Dependencies change, requirements evolve, environments drift. Epistemic developers timestamp their beliefs and re-verify when confidence decays.

**5. Legitimate Uncertainty**: "I don't know" is a valid and valuable state. An epistemic developer who admits uncertainty about a system's behavior under edge cases is more trustworthy than one who claims certainty without evidence. The Prismatic Platform's confidence thresholds formalize this: different contexts require different confidence levels (0.50 for research, 0.95 for critical decisions).

**6. Source Independence**: Evidence from independent sources carries more weight than evidence from correlated sources. A test written by the same developer who wrote the implementation provides weaker evidence than a test written by a different developer or generated by a property-based testing framework.

**7. Provenance Mandatory**: Every technical decision, every architectural choice, every code change must be traceable to its evidence and reasoning. Epistemic developers document not just what they decided, but why, based on what evidence, and with what confidence level.

## Technical Details

Epistemic development principles translate into concrete coding practices and verification mechanisms. The following examples demonstrate how these principles manifest in the Prismatic Platform codebase.

### Confidence-Annotated Decision Making

```elixir
defmodule Prismatic.Epistemic.Decision do
  @moduledoc """
  Framework for making and recording epistemic decisions in code.

  Every significant technical decision should be recorded with
  its evidence, confidence level, and the conditions under which
  it should be revisited.
  """

  @type confidence :: float()
  @type evidence_source :: %{
    type: :test | :proof | :benchmark | :review | :analysis | :observation,
    description: String.t(),
    timestamp: DateTime.t(),
    independent: boolean()
  }

  @type decision :: %{
    id: String.t(),
    description: String.t(),
    confidence: confidence(),
    evidence: [evidence_source()],
    assumptions: [String.t()],
    revisit_conditions: [String.t()],
    decided_at: DateTime.t(),
    decided_by: String.t()
  }

  @confidence_thresholds %{
    critical: 0.95,
    standard: 0.80,
    exploratory: 0.60,
    research: 0.50
  }

  @spec record_decision(String.t(), keyword()) :: {:ok, decision()} | {:error, term()}
  def record_decision(description, opts) do
    evidence = Keyword.get(opts, :evidence, [])
    context = Keyword.get(opts, :context, :standard)
    assumptions = Keyword.get(opts, :assumptions, [])

    confidence = calculate_confidence(evidence)
    threshold = Map.fetch!(@confidence_thresholds, context)

    if confidence >= threshold do
      decision = %{
        id: generate_decision_id(),
        description: description,
        confidence: confidence,
        evidence: evidence,
        assumptions: assumptions,
        revisit_conditions: derive_revisit_conditions(assumptions),
        decided_at: DateTime.utc_now(),
        decided_by: Keyword.get(opts, :author, "system")
      }

      {:ok, decision}
    else
      {:error,
       {:insufficient_confidence,
        %{
          current: confidence,
          required: threshold,
          context: context,
          gap: threshold - confidence,
          suggestion: suggest_additional_evidence(evidence, threshold - confidence)
        }}}
    end
  end

  defp calculate_confidence(evidence) do
    if Enum.empty?(evidence) do
      0.0
    else
      # Independent sources contribute more than correlated ones
      independent_count = Enum.count(evidence, & &1.independent)
      total_count = length(evidence)

      base_confidence = min(1.0, total_count * 0.15)
      independence_bonus = min(0.3, independent_count * 0.1)
      diversity_bonus = evidence_type_diversity(evidence) * 0.2

      min(0.99, base_confidence + independence_bonus + diversity_bonus)
    end
  end

  defp evidence_type_diversity(evidence) do
    unique_types = evidence |> Enum.map(& &1.type) |> Enum.uniq() |> length()
    min(1.0, unique_types / 4)
  end

  defp derive_revisit_conditions(assumptions) do
    Enum.map(assumptions, fn assumption ->
      "Revisit if assumption no longer holds: #{assumption}"
    end)
  end

  defp suggest_additional_evidence(existing, gap) do
    existing_types = MapSet.new(Enum.map(existing, & &1.type))
    all_types = MapSet.new([:test, :proof, :benchmark, :review, :analysis, :observation])
    missing = MapSet.difference(all_types, existing_types)

    cond do
      gap > 0.3 ->
        "Significant confidence gap. Add #{Enum.join(MapSet.to_list(missing), ", ")} evidence."

      gap > 0.15 ->
        "Moderate confidence gap. Consider adding independent #{Enum.at(MapSet.to_list(missing), 0)} evidence."

      true ->
        "Small confidence gap. One more independent evidence source should suffice."
    end
  end

  defp generate_decision_id do
    "dec_#{System.unique_integer([:positive, :monotonic])}"
  end
end
```

### Contradiction Detection and Preservation

```elixir
defmodule Prismatic.Epistemic.ContradictionTracker do
  @moduledoc """
  Detects and preserves contradictions in the system's belief network.

  When two pieces of evidence or two system behaviors contradict
  each other, both MUST be preserved and investigated. This module
  provides the infrastructure for tracking active contradictions,
  their investigation status, and their resolution.

  Contradictions are NOT bugs to be fixed immediately -- they are
  signals that our understanding of the system is incomplete.
  """

  use GenServer

  require Logger

  @type contradiction :: %{
    id: String.t(),
    signal_a: map(),
    signal_b: map(),
    detected_at: DateTime.t(),
    status: :active | :investigating | :resolved | :accepted,
    investigation_notes: [String.t()],
    resolution: String.t() | nil
  }

  defstruct contradictions: %{}, active_count: 0

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec report_contradiction(map(), map(), String.t()) :: {:ok, String.t()}
  def report_contradiction(signal_a, signal_b, description) do
    GenServer.call(__MODULE__, {:report, signal_a, signal_b, description})
  end

  @spec active_contradictions() :: [contradiction()]
  def active_contradictions do
    GenServer.call(__MODULE__, :list_active)
  end

  @spec investigate(String.t(), String.t()) :: :ok | {:error, :not_found}
  def investigate(contradiction_id, note) do
    GenServer.call(__MODULE__, {:investigate, contradiction_id, note})
  end

  @spec resolve(String.t(), String.t()) :: :ok | {:error, :not_found}
  def resolve(contradiction_id, resolution) do
    GenServer.call(__MODULE__, {:resolve, contradiction_id, resolution})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %__MODULE__{}}
  end

  @impl GenServer
  def handle_call({:report, signal_a, signal_b, description}, _from, state) do
    id = "contradiction_#{System.unique_integer([:positive, :monotonic])}"

    contradiction = %{
      id: id,
      signal_a: signal_a,
      signal_b: signal_b,
      description: description,
      detected_at: DateTime.utc_now(),
      status: :active,
      investigation_notes: [],
      resolution: nil
    }

    Logger.warning(
      "EPISTEMIC CONTRADICTION DETECTED [#{id}]: #{description}"
    )

    :telemetry.execute(
      [:prismatic, :epistemic, :contradiction],
      %{count: 1},
      %{id: id, description: description}
    )

    new_state = %{
      state
      | contradictions: Map.put(state.contradictions, id, contradiction),
        active_count: state.active_count + 1
    }

    {:reply, {:ok, id}, new_state}
  end

  @impl GenServer
  def handle_call(:list_active, _from, state) do
    active =
      state.contradictions
      |> Map.values()
      |> Enum.filter(&(&1.status in [:active, :investigating]))

    {:reply, active, state}
  end

  @impl GenServer
  def handle_call({:investigate, id, note}, _from, state) do
    case Map.get(state.contradictions, id) do
      nil ->
        {:reply, {:error, :not_found}, state}

      contradiction ->
        updated = %{
          contradiction
          | status: :investigating,
            investigation_notes: [
              "#{DateTime.utc_now()}: #{note}" | contradiction.investigation_notes
            ]
        }

        new_state = %{
          state
          | contradictions: Map.put(state.contradictions, id, updated)
        }

        {:reply, :ok, new_state}
    end
  end

  @impl GenServer
  def handle_call({:resolve, id, resolution}, _from, state) do
    case Map.get(state.contradictions, id) do
      nil ->
        {:reply, {:error, :not_found}, state}

      contradiction ->
        updated = %{contradiction | status: :resolved, resolution: resolution}

        new_state = %{
          state
          | contradictions: Map.put(state.contradictions, id, updated),
            active_count: max(0, state.active_count - 1)
        }

        Logger.info("CONTRADICTION RESOLVED [#{id}]: #{resolution}")
        {:reply, :ok, new_state}
    end
  end
end
```

### Property-Based Testing for Epistemic Verification

```elixir
defmodule Prismatic.Epistemic.PropertyTest do
  @moduledoc """
  Property-based testing framework for epistemic verification.

  Instead of testing specific examples (which embed the developer's
  assumptions), property-based tests generate thousands of random
  inputs and verify that invariants hold across all of them.

  This is a core practice for epistemic developers because it
  provides evidence independent of the developer's mental model.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  alias Prismatic.Epistemic.Decision

  # Property: Confidence always increases with more independent evidence
  property "adding independent evidence never decreases confidence" do
    check all(
            base_evidence <- list_of(evidence_generator(), min_length: 1, max_length: 5),
            new_evidence <- evidence_generator()
          ) do
      new_independent = %{new_evidence | independent: true}

      {:ok, base_decision} =
        Decision.record_decision("test",
          evidence: base_evidence,
          context: :research,
          author: "test"
        )

      {:ok, augmented_decision} =
        Decision.record_decision("test",
          evidence: base_evidence ++ [new_independent],
          context: :research,
          author: "test"
        )

      assert augmented_decision.confidence >= base_decision.confidence
    end
  end

  # Property: Empty evidence always yields zero confidence
  property "no evidence means no confidence" do
    check all(description <- string(:alphanumeric, min_length: 1)) do
      result = Decision.record_decision(description, evidence: [], context: :research)
      assert {:error, {:insufficient_confidence, _}} = result
    end
  end

  # Property: Confidence is bounded between 0 and 1
  property "confidence is always in [0, 1] range" do
    check all(evidence <- list_of(evidence_generator(), min_length: 1, max_length: 20)) do
      case Decision.record_decision("test",
             evidence: evidence,
             context: :research,
             author: "test"
           ) do
        {:ok, decision} ->
          assert decision.confidence >= 0.0
          assert decision.confidence <= 1.0

        {:error, {:insufficient_confidence, %{current: confidence}}} ->
          assert confidence >= 0.0
          assert confidence <= 1.0
      end
    end
  end

  defp evidence_generator do
    gen all(
          type <- member_of([:test, :proof, :benchmark, :review, :analysis, :observation]),
          independent <- boolean(),
          description <- string(:alphanumeric, min_length: 5, max_length: 50)
        ) do
      %{
        type: type,
        description: description,
        timestamp: DateTime.utc_now(),
        independent: independent
      }
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform is designed by and for epistemic developers, with epistemic principles embedded at every level:

**NABLA Infinity Framework**: The platform's epistemic framework codifies the seven axioms (Signal Plurality, Contradiction Preservation, Absence Informative, Time Decay, Unknown Valid, Source Independence, Provenance Mandatory) as enforceable rules. Violations trigger automatic blocks and reviews, preventing epistemic shortcuts from entering the codebase.

**Trinity Gate Verification**: Every significant claim must pass three independent verification layers: Structural Consistency (belief network forms a valid DAG), Logical Consistency (propositions follow logical rules), and Formal Necessity (claims proven in formal systems). This three-gate system ensures that no claim is established through a single verification method.

**Color-Team Security Architecture**: The six color teams (Gray, Red, Blue, Purple, White, Black) embody epistemic development through adversarial-defensive synthesis. Red team challenges assumptions through adversarial simulation. Blue team defends through evidence synthesis. Purple team closes the loop through contradiction resolution. This structure ensures that the platform's security posture is tested against multiple independent adversarial perspectives.

**Quality DNA System**: The cross-session quality continuity system tracks quality metrics over time, preserving historical evidence of quality states. This enables the Time Decay axiom: current quality claims are supported by recent evidence, not stale measurements.

**530+ Specialized Agents**: Each agent operates within its domain with explicit confidence levels, evidence requirements, and verification protocols. The agent hierarchy (L1 through L5) maps to increasing epistemic authority: L1 agents can make low-confidence operational observations, while L5 supreme authority requires Trinity Gate passage for all decisions.

**Addiction Preservation Doctrine**: The platform's commitment to preserving contradictory signals, maintaining evidence plurality, and refusing to "smooth over" inconvenient truths. This doctrine directly implements the Contradiction Preservation axiom, requiring constant vigilance against the human tendency to rationalize, dismiss, or cherry-pick evidence.

## Comparison

| Development Philosophy | Epistemic Development | Test-Driven Development | Evidence-Based Software Engineering | Traditional Development |
|----------------------|----------------------|------------------------|-------------------------------------|----------------------|
| **Core Question** | "What do we actually know?" | "Does the code pass tests?" | "What does research say?" | "Does it work?" |
| **Evidence Standard** | Multiple independent signals | Passing test suite | Published studies | Developer judgment |
| **Contradiction Handling** | Preserve and investigate | Fix failing tests | Analyze conflicting studies | Ignore or defer |
| **Uncertainty** | Explicitly tracked with confidence | Binary (pass/fail) | Confidence intervals | Implicit/untracked |
| **Verification** | Trinity Gate (3 layers) | Single layer (tests) | Peer review | Code review |
| **Knowledge Decay** | Time-stamped, re-verified | CI runs | Literature reviews | Assumed stable |
| **Prismatic Adoption** | Core philosophy | Subset of practice | Informed by | Rejected |

### Epistemic Developer vs Conventional Developer

| Practice | Epistemic Developer | Conventional Developer |
|----------|--------------------|-----------------------|
| When test fails unexpectedly | Preserves contradiction, investigates root cause, documents findings | Fixes test or code to make it pass |
| When asked "will this scale?" | Provides benchmarks with confidence levels and conditions | Says "yes" based on intuition |
| When facing unknown behavior | Records "I don't know" with investigation plan | Makes assumption and moves on |
| When two tools give different results | Preserves both, investigates discrepancy | Trusts the one they prefer |
| When reviewing code | Checks evidence chain and assumptions | Checks code style and logic |

## Best Practices

1. **Annotate decisions with confidence levels**: Every significant technical decision should include an explicit confidence level (0.0-1.0) and the evidence supporting that confidence. Use structured decision records that capture assumptions, evidence sources, and revisit conditions.

2. **Practice contradiction preservation as a discipline**: When you encounter contradictory evidence (a test that "shouldn't fail," performance that "doesn't make sense"), resist the urge to dismiss it. Record both signals, investigate the discrepancy, and document the resolution. Contradictions are where learning happens.

3. **Use property-based testing for assumption-independent verification**: Example-based tests embed the developer's assumptions about what matters. Property-based tests with StreamData generate thousands of random inputs, providing evidence independent of the developer's mental model.

4. **Maintain provenance for all technical decisions**: Every architecture choice, dependency selection, and implementation strategy should be traceable to specific evidence. When asked "why did we choose this approach?", the answer should be a chain of evidence, not "someone decided."

5. **Track and re-verify aging beliefs**: Code that has not been tested recently, documentation that has not been updated, assumptions that have not been validated -- these are decaying beliefs. Implement systematic re-verification through continuous integration, scheduled audits, and freshness tracking.

6. **Seek independent evidence sources**: A test written by the same person who wrote the code provides weaker evidence than a test written by someone else, a property-based test, a formal proof, or a benchmark. Actively seek evidence from independent sources for critical claims.

7. **Document what you do not know**: Missing documentation, untested edge cases, unverified assumptions -- these are epistemic gaps that should be explicitly tracked. The platform's quality DNA system tracks what is measured and what is not.

8. **Apply different confidence thresholds for different contexts**: Critical production decisions require 0.95 confidence. Exploratory prototyping can proceed at 0.60. Research questions can be explored at 0.50. Match the rigor to the stakes.

## Common Pitfalls

1. **Epistemic theater**: Going through the motions of epistemic practice (documenting decisions, recording confidence levels) without genuine truth-seeking. If contradictions are always "resolved" by discarding the inconvenient signal, the practice is theater, not epistemology.

2. **Analysis paralysis from over-application**: Not every code change requires Trinity Gate passage. Epistemic discipline should scale with stakes: a CSS tweak does not need the same evidence standard as a cryptographic algorithm. Apply proportional rigor.

3. **Conflating confidence with certainty**: A confidence level of 0.95 does not mean "we are certain." It means "based on current evidence, there is a 5% chance we are wrong." Epistemic developers remain open to disconfirming evidence even at high confidence levels.

4. **Cherry-picking evidence**: Selectively citing evidence that supports a preferred conclusion while ignoring contradictory evidence. This is the most common and most dangerous epistemic anti-pattern. The Addiction Preservation doctrine specifically guards against this.

5. **False plurality**: Counting multiple correlated evidence sources as independent. Ten unit tests written by the same developer testing the same code path do not constitute ten independent signals. True plurality requires diversity of evidence types and sources.

6. **Treating the framework as bureaucracy**: If decision records and confidence annotations feel like paperwork rather than tools for better thinking, the framework is being applied mechanically rather than philosophically. The goal is better reasoning, not more documentation.

7. **Ignoring the "Unknown Valid" axiom**: Pressure to appear confident leads developers to assert knowledge they do not have. An epistemic developer who says "I don't know, but here's how we can find out" is more valuable than one who guesses confidently.

## Use Cases

**Security Assessment with Confidence Levels**: When the Prismatic Perimeter module assesses an organization's security posture, it does not simply produce a letter grade. It produces a grade with a confidence level, supported by specific evidence (discovered assets, identified vulnerabilities, compliance checks), and with explicit limitations (areas not yet assessed, data sources not yet consulted). This epistemic approach ensures that security consumers understand both what is known and what remains uncertain.

**Quality Gate Decisions**: The platform's 13-domain quality scoring system operates epistemically. Each quality dimension (Dialyzer compliance, Credo compliance, test coverage, and so on) provides an independent signal. The composite score reflects the convergence of these independent signals, not a single metric.

**OSINT Intelligence Analysis**: OSINT investigations inherently deal with uncertain, incomplete, and sometimes contradictory information. Epistemic developers building OSINT tools ensure that contradictory intelligence signals are preserved, that confidence levels reflect the reliability and independence of sources, and that analytical conclusions are traceable to their evidence chain.

**Agent Decision Chains**: When AIAD agents make decisions (such as routing an investigation, escalating a security alert, or recommending a remediation), the decision chain includes explicit confidence levels, evidence sources, and the conditions under which the decision should be revisited. This ensures that agent decisions are auditable and revisable.

**Adversarial Security Testing**: The Red-Blue-Purple team cycle is fundamentally epistemic: Red team generates adversarial hypotheses ("the system can be compromised via X"), Blue team generates defensive evidence ("the system resists X because of Y"), and Purple team synthesizes both into verified understanding. This cycle ensures that security claims are tested against adversarial thinking, not just defensive assumptions.

## Related Concepts

Epistemic development connects to the philosophical and technical foundations of the Prismatic Platform:

- [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) - The formal logical framework underlying epistemic development, covering belief revision, justification, and knowledge representation
- [NABLA Infinity](@/glossary/nabla-infinity.md) - The platform's epistemic framework that codifies the seven axioms governing how knowledge is established, maintained, and verified
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) - The axiom requiring that contradictory evidence be preserved rather than discarded, a core discipline for epistemic developers
- [Evidence](@/glossary/evidence.md) - The foundational currency of epistemic development, requiring multiple independent signals for any established belief
- [Trinity Gate](@/glossary/trinity-gate.md) - The three-layer verification system (structural, logical, formal) that epistemic developers must satisfy for critical claims
- [Formal Verification](@/glossary/formal-verification.md) - Mathematical proof techniques that provide the strongest form of evidence for software correctness
- [Adversarial Thinking](@/glossary/adversarial-thinking.md) - The discipline of deliberately challenging assumptions and testing beliefs against adversarial scenarios
- [Code as Hypothesis](@/glossary/code-as-hypothesis.md) - The principle that code represents testable hypotheses about the world rather than assumed truths
- [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) - The probabilistic framework for updating beliefs based on new evidence, underlying confidence level calculations
- [Proves Before Claiming](@/glossary/proves-before-claiming.md) - The epistemic principle that claims must be supported by evidence before they are asserted as knowledge

## See Also

- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) - The execution doctrine that transitions from epistemic exploration to decisive action once confidence thresholds are met
- [Scientific Rigor](@/glossary/scientific-rigor.md) - The broader discipline of applying scientific methodology to software development
- [Property-Based Testing](@/glossary/property-based-testing.md) - Testing methodology that generates evidence independent of developer assumptions
- [Red Team](@/glossary/red-team.md) - Adversarial simulation that challenges the system's epistemic assumptions
- [Purple Team](@/glossary/purple-team.md) - Synthesis and closure of epistemic gaps between adversarial and defensive perspectives

---

**Built with precision by the Prismatic Platform team.**

[GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
