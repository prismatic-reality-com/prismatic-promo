+++
title = "Epistemic Reasoning"
weight = 50
[extra]
description = "The systematic process of forming, evaluating, revising, and justifying beliefs based on evidence, logical inference, formal verification, and probabilistic analysis within knowledge-producing systems"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "epistemic-systems"
related_concepts = ["nabla-infinity", "bayesian-reasoning", "logical-reasoning", "formal-verification", "trinity-gate", "confidence-threshold", "signal-plurality"]
implementation_status = "production"
authority_level = "platform-doctrine"
difficulty_rating = 8
prerequisites = ["nabla-infinity", "bayesian-reasoning", "logical-reasoning", "formal-verification"]
learning_path = ["logical-reasoning", "bayesian-reasoning", "formal-verification", "epistemic-reasoning", "trinity-gate"]
interactive_demos = ["/labs/glossary/epistemic-reasoning"]
code_examples = ["EpistemicReasoner GenServer", "Bayesian belief update", "Trinity Gate verification pipeline"]
external_resources = ["https://plato.stanford.edu/entries/epistemology/", "https://en.wikipedia.org/wiki/Epistemic_logic"]
version_introduced = "0.12.0"
stability_level = "stable"
testing_scenarios = ["belief revision under contradictory evidence", "confidence threshold calibration", "multi-axiom compliance verification"]
keywords = ["epistemic reasoning", "belief formation", "evidence evaluation", "logical inference", "bayesian updating", "formal verification", "knowledge justification"]
tags = ["glossary", "epistemic", "reasoning", "nabla", "trinity-gate", "bayesian", "formal-verification"]
related_terms = ["nabla-infinity", "bayesian-reasoning", "logical-reasoning", "formal-verification", "trinity-gate", "confidence-threshold", "signal-plurality", "contradiction-preservation", "epistemic-pipeline", "epistemic-coordination", "evidence", "provenance-mandatory"]
word_count = 1869
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Epistemic Reasoning - Prismatic Platform"
+++

## Definition

Epistemic reasoning is the systematic cognitive and computational process of forming, evaluating, revising, and justifying beliefs based on evidence, logical inference, and formal verification methods. It encompasses the full lifecycle of knowledge production: from raw observation through evidence assessment, hypothesis formation, confidence calibration, contradiction handling, and ultimately justified belief establishment.

Unlike informal reasoning, epistemic reasoning demands explicit tracking of *why* a belief is held, *what evidence* supports it, *how confident* the reasoner should be, and *under what conditions* the belief should be revised. In the Prismatic Platform, all epistemic reasoning is governed by the seven non-negotiable axioms of the [NABLA Infinity](@/glossary/nabla-infinity.md) framework, ensuring that no belief is established without traceable provenance, adequate evidence plurality, and passage through the [Trinity Gate](@/glossary/trinity-gate.md).

## Overview

Epistemic reasoning sits at the intersection of epistemology (the philosophical study of knowledge), logic (formal rules of valid inference), probability theory (quantifying uncertainty), and systems engineering (building reliable knowledge-producing machines). While humans perform epistemic reasoning intuitively -- weighing evidence, updating beliefs, resolving contradictions -- computational systems require explicit, auditable reasoning pipelines.

The need for rigorous epistemic reasoning in software systems has grown dramatically with the proliferation of AI agents, automated decision systems, and intelligence fusion platforms. When a system makes a claim -- "this domain is malicious," "this company is NIS2 compliant," "this vulnerability is critical" -- stakeholders must be able to trace the reasoning chain from raw evidence through inferential steps to final conclusion. Black-box claims are unacceptable.

Prismatic's approach to epistemic reasoning is distinctive in several ways. First, it treats uncertainty as a first-class citizen rather than an error to eliminate. Second, it requires multiple independent evidence sources before establishing beliefs ([Signal Plurality](@/glossary/signal-plurality.md)). Third, it preserves contradictions rather than resolving them prematurely ([Contradiction Preservation](@/glossary/contradiction-preservation.md)). Fourth, it subjects all significant claims to a three-gate verification process: structural consistency, logical consistency, and formal necessity (the [Trinity Gate](@/glossary/trinity-gate.md)).

### The Reasoning Lifecycle

```
Observation --> Evidence Assessment --> Hypothesis Formation --> Bayesian Update
     |                                                              |
     v                                                              v
Signal Collection --> Provenance Check --> Confidence Calibration --> Trinity Gate
     |                                                              |
     v                                                              v
Raw Data --> NABLA Compliance --> Belief Revision --> Justified Belief / Explicit Uncertainty
```

## Technical Details

### Reasoning Modes

Epistemic reasoning in Prismatic operates across four complementary modes:

**Deductive Reasoning**: Starting from established premises and deriving conclusions through valid logical steps. If all NABLA axioms are satisfied and the Trinity Gate passes, the conclusion is established. Deductive reasoning provides certainty but requires strong premises. Implemented through the logical consistency gate of Trinity.

**Inductive Reasoning**: Generalizing from specific observations to broader conclusions. Pattern detection across OSINT sources, security scans, and compliance assessments uses inductive reasoning. Conclusions carry confidence levels rather than certainty. Implemented through [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) with explicit prior and posterior tracking.

**Abductive Reasoning**: Inferring the best explanation for a set of observations. When multiple hypotheses could explain the same evidence, abductive reasoning evaluates which explanation best accounts for all available signals. Used extensively in threat analysis and incident investigation.

**Analogical Reasoning**: Reasoning from known cases to novel situations based on structural similarity. When encountering a new attack pattern, the system reasons by analogy with previously observed patterns. Requires careful validation to prevent false analogies.

### Bayesian Belief Update Framework

The core mathematical framework for epistemic reasoning in Prismatic uses Bayesian updating:

```
P(H|E) = P(E|H) * P(H) / P(E)
```

Where:
- P(H|E) is the posterior probability of hypothesis H given evidence E
- P(E|H) is the likelihood of observing evidence E if H is true
- P(H) is the prior probability of H before observing E
- P(E) is the marginal probability of observing E

This is applied iteratively as new evidence arrives, with each update producing a new posterior that becomes the prior for the next update. The [Confidence Threshold](@/glossary/confidence-threshold.md) determines when accumulated evidence is sufficient to establish a belief for action.

### NABLA Axiom Compliance

Every epistemic reasoning process must satisfy all seven NABLA axioms:

| Axiom | Reasoning Requirement |
|-------|-----------------------|
| Signal Plurality | Minimum 2 independent signals before belief establishment |
| Contradiction Preservation | Contradictory evidence preserved, never silently discarded |
| Absence Informative | Missing expected evidence treated as signal, not ignored |
| Time Decay | Evidence quality weighted by recency with exponential decay |
| Unknown Valid | "I don't know" is a valid and sometimes mandatory conclusion |
| Source Independence | Independent sources weighted higher than correlated sources |
| Provenance Mandatory | Every belief must trace to specific evidence with full chain |

## Implementation in Prismatic Platform

### Epistemic Reasoner Module

```elixir
defmodule Prismatic.Epistemic.Reasoner do
  @moduledoc """
  Core epistemic reasoning engine implementing Bayesian belief
  updating with NABLA axiom enforcement and Trinity Gate validation.

  All belief formation passes through this module. No belief is
  established without meeting confidence thresholds, satisfying
  axiom compliance, and passing the Trinity Gate when required.
  """

  alias Prismatic.Epistemic.{Belief, Evidence, Signal, TrinityGate}

  @type hypothesis :: %{
    id: String.t(),
    claim: String.t(),
    prior: float(),
    posterior: float(),
    evidence_chain: [Evidence.t()],
    reasoning_mode: :deductive | :inductive | :abductive | :analogical,
    nabla_compliant: boolean(),
    trinity_passed: boolean()
  }

  @type reasoning_result ::
    {:belief_established, Belief.t()}
    | {:insufficient_evidence, hypothesis()}
    | {:contradiction_detected, hypothesis(), hypothesis()}
    | {:unknown, String.t()}

  @spec reason(String.t(), [Evidence.t()], keyword()) :: reasoning_result()
  def reason(claim, evidence_set, opts \\ []) do
    confidence_threshold = Keyword.get(opts, :threshold, 0.80)
    require_trinity = Keyword.get(opts, :trinity, true)

    with {:ok, validated_evidence} <- validate_evidence_set(evidence_set),
         {:ok, hypothesis} <- form_hypothesis(claim, validated_evidence),
         {:ok, updated} <- bayesian_update(hypothesis, validated_evidence),
         {:ok, nabla_checked} <- check_nabla_compliance(updated),
         {:ok, final} <- maybe_trinity_gate(nabla_checked, require_trinity) do
      if final.posterior >= confidence_threshold do
        {:belief_established, Belief.from_hypothesis(final)}
      else
        {:insufficient_evidence, final}
      end
    else
      {:contradiction, h1, h2} ->
        {:contradiction_detected, h1, h2}

      {:nabla_violation, axiom, _hypothesis} ->
        {:unknown, "NABLA axiom #{axiom} violated - belief cannot be established"}

      {:error, reason} ->
        {:unknown, "Reasoning failed: #{inspect(reason)}"}
    end
  end

  @spec bayesian_update(hypothesis(), [Evidence.t()]) ::
    {:ok, hypothesis()} | {:error, atom()}
  def bayesian_update(hypothesis, evidence_list) do
    updated =
      Enum.reduce(evidence_list, hypothesis, fn evidence, acc ->
        likelihood = compute_likelihood(evidence, acc.claim)
        marginal = compute_marginal(evidence)
        new_posterior = acc.posterior * likelihood / marginal

        %{acc |
          posterior: clamp(new_posterior, 0.0, 1.0),
          evidence_chain: [evidence | acc.evidence_chain]
        }
      end)

    {:ok, updated}
  end

  @spec form_hypothesis(String.t(), [Evidence.t()]) ::
    {:ok, hypothesis()} | {:error, atom()}
  defp form_hypothesis(claim, evidence) do
    prior = compute_prior(claim, evidence)

    hypothesis = %{
      id: generate_hypothesis_id(),
      claim: claim,
      prior: prior,
      posterior: prior,
      evidence_chain: [],
      reasoning_mode: infer_reasoning_mode(evidence),
      nabla_compliant: false,
      trinity_passed: false
    }

    {:ok, hypothesis}
  end

  @spec check_nabla_compliance(hypothesis()) ::
    {:ok, hypothesis()} | {:nabla_violation, atom(), hypothesis()}
  defp check_nabla_compliance(hypothesis) do
    checks = [
      {:signal_plurality, &check_signal_plurality/1},
      {:provenance_mandatory, &check_provenance/1},
      {:time_decay, &apply_time_decay/1},
      {:source_independence, &check_source_independence/1}
    ]

    Enum.reduce_while(checks, {:ok, hypothesis}, fn {axiom, check_fn}, {:ok, h} ->
      case check_fn.(h) do
        {:ok, updated_h} -> {:cont, {:ok, updated_h}}
        {:error, _} -> {:halt, {:nabla_violation, axiom, h}}
      end
    end)
  end

  @spec check_signal_plurality(hypothesis()) :: {:ok, hypothesis()} | {:error, atom()}
  defp check_signal_plurality(hypothesis) do
    independent_sources =
      hypothesis.evidence_chain
      |> Enum.map(& &1.source_id)
      |> Enum.uniq()
      |> length()

    if independent_sources >= 2 do
      {:ok, hypothesis}
    else
      {:error, :insufficient_signal_plurality}
    end
  end

  @spec check_provenance(hypothesis()) :: {:ok, hypothesis()} | {:error, atom()}
  defp check_provenance(hypothesis) do
    all_have_provenance =
      Enum.all?(hypothesis.evidence_chain, fn e ->
        not is_nil(e.source_id) and not is_nil(e.collection_method)
      end)

    if all_have_provenance do
      {:ok, hypothesis}
    else
      {:error, :missing_provenance}
    end
  end

  @spec apply_time_decay(hypothesis()) :: {:ok, hypothesis()}
  defp apply_time_decay(hypothesis) do
    decayed_chain =
      Enum.map(hypothesis.evidence_chain, fn evidence ->
        age_hours = DateTime.diff(DateTime.utc_now(), evidence.timestamp, :hour)
        decay_factor = :math.exp(-age_hours / 720)
        %{evidence | weight: evidence.weight * decay_factor}
      end)

    {:ok, %{hypothesis | evidence_chain: decayed_chain}}
  end

  @spec check_source_independence(hypothesis()) :: {:ok, hypothesis()}
  defp check_source_independence(hypothesis) do
    source_groups =
      Enum.group_by(hypothesis.evidence_chain, & &1.source_family)

    adjusted_chain =
      Enum.map(hypothesis.evidence_chain, fn evidence ->
        group_size = length(Map.get(source_groups, evidence.source_family, []))
        independence_factor = if group_size > 1, do: 1.0 / group_size, else: 1.2
        %{evidence | weight: evidence.weight * independence_factor}
      end)

    {:ok, %{hypothesis | evidence_chain: adjusted_chain}}
  end

  @spec maybe_trinity_gate(hypothesis(), boolean()) ::
    {:ok, hypothesis()} | {:error, atom()}
  defp maybe_trinity_gate(hypothesis, false), do: {:ok, hypothesis}

  defp maybe_trinity_gate(hypothesis, true) do
    case TrinityGate.verify(hypothesis) do
      {:ok, proof} ->
        {:ok, %{hypothesis | trinity_passed: true, proof: proof}}

      {:error, gate, reason} ->
        {:error, {:trinity_failure, gate, reason}}
    end
  end

  @spec compute_likelihood(Evidence.t(), String.t()) :: float()
  defp compute_likelihood(evidence, _claim) do
    base = evidence.relevance_score || 0.5
    quality = evidence.quality_score || 0.5
    base * quality
  end

  @spec compute_marginal(Evidence.t()) :: float()
  defp compute_marginal(_evidence), do: 0.5

  @spec compute_prior(String.t(), [Evidence.t()]) :: float()
  defp compute_prior(_claim, _evidence), do: 0.5

  @spec infer_reasoning_mode([Evidence.t()]) ::
    :deductive | :inductive | :abductive | :analogical
  defp infer_reasoning_mode(evidence) do
    cond do
      Enum.all?(evidence, & &1.type == :formal_proof) -> :deductive
      Enum.all?(evidence, & &1.type == :observation) -> :inductive
      Enum.any?(evidence, & &1.type == :analogy) -> :analogical
      true -> :abductive
    end
  end

  @spec clamp(float(), float(), float()) :: float()
  defp clamp(value, min_val, max_val) do
    value |> max(min_val) |> min(max_val)
  end

  @spec generate_hypothesis_id() :: String.t()
  defp generate_hypothesis_id do
    "hyp_" <> Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
  end
end
```

### Reasoning Audit Trail

Every reasoning step produces an auditable trail:

```elixir
defmodule Prismatic.Epistemic.ReasoningAudit do
  @moduledoc """
  Immutable audit trail for epistemic reasoning processes.
  Every belief formation, revision, and rejection is logged
  with full provenance for post-hoc analysis and accountability.
  """

  @type audit_entry :: %{
    timestamp: DateTime.t(),
    hypothesis_id: String.t(),
    action: :formed | :updated | :established | :rejected | :contradicted,
    evidence_used: [String.t()],
    prior: float(),
    posterior: float(),
    nabla_status: map(),
    trinity_status: map() | nil,
    reasoning_mode: atom()
  }

  @spec log_reasoning_step(audit_entry()) :: :ok
  def log_reasoning_step(entry) do
    :telemetry.execute(
      [:prismatic, :epistemic, :reasoning, :step],
      %{posterior: entry.posterior, prior: entry.prior},
      %{
        hypothesis_id: entry.hypothesis_id,
        action: entry.action,
        reasoning_mode: entry.reasoning_mode
      }
    )

    append_to_audit_log(entry)
  end

  @spec append_to_audit_log(audit_entry()) :: :ok
  defp append_to_audit_log(entry) do
    :ets.insert(:epistemic_audit_log, {entry.timestamp, entry})
    :ok
  end
end
```

## Comparison with Alternatives

### vs. Classical Logic Systems

Classical logic systems (Prolog, theorem provers) operate in a binary true/false domain. They cannot represent partial belief, graded confidence, or principled uncertainty. Epistemic reasoning extends classical logic with probability, confidence intervals, and explicit "unknown" states. Classical logic is a component of epistemic reasoning (the deductive mode) but not a replacement.

### vs. Pure Bayesian Networks

Bayesian networks provide excellent probabilistic reasoning but lack the epistemic infrastructure for provenance tracking, contradiction preservation, and formal verification. They answer "what is the probability?" but not "why should we trust this probability?" Prismatic uses Bayesian updating as the core mathematical mechanism but wraps it in NABLA axioms for epistemic rigor.

### vs. Dempster-Shafer Theory

Dempster-Shafer theory provides a framework for reasoning under uncertainty that distinguishes between uncertainty and ignorance, which Bayesian approaches conflate. It assigns belief masses to sets of hypotheses rather than individual hypotheses. Prismatic's approach is compatible with Dempster-Shafer and uses it for certain fusion operations, but wraps it in the broader NABLA framework.

### vs. Fuzzy Logic

Fuzzy logic handles vagueness (degree of membership in a category) rather than uncertainty (degree of belief in a proposition). "This server is somewhat vulnerable" (fuzzy) is different from "I'm 70% confident this server is vulnerable" (epistemic). Prismatic uses epistemic confidence levels, not fuzzy membership degrees.

### vs. Large Language Model Reasoning

LLMs perform a form of pattern-based reasoning that can appear epistemic but lacks the formal properties required by NABLA. LLM outputs have no provenance chain, no explicit confidence calibration, no contradiction tracking, and no formal verification. Prismatic uses LLM outputs as evidence sources that feed into the epistemic reasoning pipeline, not as reasoning engines themselves.

## Best Practices

1. **Always track reasoning mode explicitly.** Label whether a conclusion was reached through deduction, induction, abduction, or analogy. Different modes carry different levels of certainty and require different validation approaches.

2. **Calibrate confidence thresholds to context.** Critical security decisions require 0.95 confidence with mandatory Trinity Gate. Exploratory analysis can proceed at 0.60 confidence. Never apply a single threshold across all contexts.

3. **Update incrementally, not batch.** Process evidence as it arrives rather than accumulating and processing in bulk. Incremental Bayesian updating provides real-time confidence tracking and enables early detection of significant shifts.

4. **Audit every reasoning step.** The reasoning audit trail is not optional overhead -- it is essential for debugging false beliefs, identifying systematic biases, and demonstrating accountability to stakeholders.

5. **Test reasoning with known outcomes.** Build test cases where the correct conclusion is known and verify that the reasoning engine reaches it through the expected path. This validates not just the output but the reasoning process.

6. **Separate evidence collection from reasoning.** The agents that collect evidence should not perform reasoning. The agents that reason should not collect evidence. This separation prevents confirmation bias where collection is influenced by prior beliefs.

## Common Pitfalls

1. **Conflating confidence with probability.** Confidence 0.8 does not mean "80% chance of being true." It means "given the evidence evaluated, my degree of justified belief is 0.8." The distinction matters for calibration and communication.

2. **Base rate neglect.** Failing to account for the prior probability of a hypothesis before evaluating evidence. A high-confidence finding from a single source is less meaningful for a rare event than for a common one.

3. **Confirmation bias in evidence selection.** Seeking evidence that supports an existing hypothesis while ignoring disconfirming evidence. The Signal Plurality axiom partially mitigates this by requiring independent sources, but architectural separation of collection and reasoning is the stronger defense.

4. **Anchoring on initial evidence.** The first piece of evidence disproportionately influences the final conclusion because it sets the prior. Mitigate by using uninformative priors (0.5) and letting evidence drive the posterior.

5. **Overconfidence from correlated sources.** Ten articles citing the same original report do not constitute ten independent signals. The Source Independence axiom requires identifying source families and discounting correlated evidence.

6. **Reasoning about reasoning without bounds.** Meta-epistemic reasoning (reasoning about the quality of reasoning) can recurse infinitely. Set explicit depth limits and evaluate reasoning quality through empirical calibration, not infinite meta-analysis.

## Use Cases

### Threat Intelligence Assessment

When evaluating whether a threat actor is targeting a specific sector, the epistemic reasoning engine combines multiple intelligence sources: OSINT feeds, dark web monitoring, historical attack patterns, and vulnerability databases. Each source contributes evidence with explicit provenance. The Bayesian update framework produces a calibrated confidence level, and the Trinity Gate verifies the assessment before it triggers defensive actions.

### Compliance Determination

Determining whether an organization meets NIS2 requirements involves reasoning across multiple evidence dimensions: technical controls, policy documents, incident response capabilities, and supply chain assessments. Each dimension produces evidence with different reliability levels. Epistemic reasoning synthesizes these into a justified compliance determination with explicit uncertainty about areas where evidence is insufficient.

### Anomaly Classification

When the platform detects anomalous behavior, epistemic reasoning determines whether it represents a genuine threat, a benign anomaly, or insufficient information to classify. The abductive reasoning mode generates candidate explanations, Bayesian updating evaluates each against the evidence, and the system may conclude "unknown" when evidence is insufficient -- a valid and important output.

### Security Rating Computation

The Prismatic Perimeter security rating system uses epistemic reasoning to produce A-F grades. Rather than simple scoring, the system reasons about what each piece of evidence means for overall security posture, accounts for evidence quality and recency, and produces grades with explicit confidence intervals.

## Theoretical Foundations

### Epistemic Logic (Modal Logic of Knowledge)

Epistemic reasoning is formalized in modal logic using operators K (knows) and B (believes). Key axioms include:

- **Distribution**: K(p -> q) -> (Kp -> Kq) -- knowledge distributes over implication
- **Truthfulness**: Kp -> p -- knowledge implies truth (beliefs do not)
- **Positive Introspection**: Kp -> KKp -- if you know something, you know that you know it
- **Negative Introspection**: ~Kp -> K(~Kp) -- if you don't know, you know you don't

Prismatic's "Unknown Valid" axiom directly implements negative introspection: the system explicitly tracks and reports what it does not know.

### Decision Theory Integration

Epistemic reasoning connects to decision theory through expected utility calculations. A belief with confidence 0.8 about a critical threat triggers different responses than the same confidence about a minor issue. The reasoning engine provides calibrated inputs to the decision layer, which weights them by consequence severity.

## Related Concepts

- [NABLA Infinity](@/glossary/nabla-infinity.md) - The 7-axiom framework governing all epistemic reasoning in Prismatic
- [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) - The probabilistic updating mechanism at the core of inductive epistemic reasoning
- [Logical Reasoning](@/glossary/logical-reasoning.md) - Formal logic systems providing the deductive component of epistemic reasoning
- [Formal Verification](@/glossary/formal-verification.md) - Mathematical proof methods implementing the formal necessity gate of Trinity
- [Trinity Gate](@/glossary/trinity-gate.md) - The 3-gate verification required for high-confidence belief establishment
- [Confidence Threshold](@/glossary/confidence-threshold.md) - Context-dependent thresholds that determine when beliefs justify action
- [Signal Plurality](@/glossary/signal-plurality.md) - The axiom requiring multiple independent evidence sources
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) - The axiom preventing premature contradiction resolution
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) - The processing pipeline implementing the full reasoning lifecycle
- [Epistemic Coordination](@/glossary/epistemic-coordination.md) - Cross-agent coordination of reasoning outputs
- [Evidence](@/glossary/evidence.md) - The fundamental input to epistemic reasoning processes
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) - The axiom requiring full traceability of all evidence and beliefs

## See Also

- [Epistemic Attack](@/glossary/epistemic-attack.md) - Attacks that target reasoning processes to produce false beliefs
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) - System resilience against reasoning manipulation
- [Epistemic Validation](@/glossary/epistemic-validation.md) - Validation of reasoning outputs and processes
- [Evidence Over Opinion](@/glossary/evidence-over-opinion.md) - The principle that evidence must override subjective assessment
- [Time Decay](@/glossary/time-decay.md) - Temporal weighting applied to evidence during reasoning

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
