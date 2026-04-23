+++
title = "Reasoning Error"
weight = 50
[extra]
category = "epistemic"
description = "A systematic flaw in the logical process of deriving conclusions from evidence, detected and prevented by the Prismatic Platform through formal verification, Trinity Gate validation, and NABLA Infinity axiom enforcement."
related_terms = ["epistemic-reasoning", "trinity-gate", "nabla-infinity", "bias-detection", "formal-verification", "logical-consistency", "rationalize-evidence", "confidence-scoring", "evidence-over-opinion", "contradiction-preservation"]
tags = ["glossary", "epistemic", "logic", "verification", "reasoning", "quality", "formal-methods"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
platform_relevance = "critical"
use_cases = ["epistemic validation", "formal verification", "decision auditing", "AI safety", "quality assurance"]
word_count = 1545
date_modified = "2026-02-23"
keywords = ["Reasoning", "Error", "Prismatic", "Platform", "Trinity", "Gate", "NABLA", "Infinity", "glossary", "epistemic"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Reasoning Error - Prismatic Platform"
+++

## Definition

A reasoning error is a systematic flaw in the logical process of deriving conclusions from premises, evidence, or observations. Unlike random mistakes or typos, reasoning errors are structural: they follow recognizable patterns that consistently produce incorrect conclusions from correct inputs. The inputs may be valid, the conclusion may even happen to be correct, but the inferential process connecting them is broken.

Reasoning errors are distinct from factual errors (wrong data) and from rationalization (motivated distortion). A factual error means the input is wrong. Rationalization means the reasoner knows the conclusion and selects evidence to support it. A reasoning error means the inferential machinery itself is faulty -- the reasoner genuinely follows what seems like valid logic but arrives at an incorrect conclusion because the logical steps contain a structural flaw.

In the context of the Prismatic Platform, reasoning errors threaten both human decision-making (architecture choices, priority decisions, quality assessments) and automated reasoning (AI agent inference, rule-based systems, epistemic pipelines). The platform addresses reasoning errors through multiple layers: [formal verification](@/glossary/formal-verification.md), [Trinity Gate](@/glossary/trinity-gate.md) validation, [NABLA Infinity](@/glossary/nabla-infinity.md) axiom enforcement, and [static analysis](@/glossary/static-analysis.md) of logical structures.

## Taxonomy of Reasoning Errors

Reasoning errors fall into several categories, each requiring different detection and prevention strategies:

### Deductive Errors

Deductive errors violate the rules of formal logic. The conclusion does not follow from the premises, even though the argument appears valid in natural language.

| Error | Description | Example |
|-------|-------------|---------|
| **Affirming the consequent** | If P then Q; Q is true; therefore P is true | "If the server is down, requests fail. Requests are failing, so the server must be down." (Could be network issue) |
| **Denying the antecedent** | If P then Q; P is false; therefore Q is false | "If we have tests, bugs are caught. We have no tests for this module, so there are no bugs." |
| **Undistributed middle** | All A are B; all C are B; therefore all A are C | "All GenServers handle state. All Agents handle state. Therefore all GenServers are Agents." |
| **Composition fallacy** | What is true of parts is true of the whole | "Each function is O(1), so the pipeline is O(1)." (Pipeline may call functions N times) |
| **Division fallacy** | What is true of the whole is true of each part | "The system handles 10K req/s, so each endpoint handles 10K req/s." |

### Inductive Errors

Inductive errors draw incorrect generalizations from observations:

| Error | Description | Example |
|-------|-------------|---------|
| **Hasty generalization** | Concluding from too few examples | "We tested with 3 users and found no issues, so the feature is ready." |
| **Sampling bias** | Generalizing from a non-representative sample | "No developer on the team has had this problem" (team uses macOS; problem affects Linux) |
| **Survivorship bias** | Drawing conclusions only from surviving examples | "Our architecture must be good because we have not lost any customers." (Ignores customers who never signed up) |
| **Base rate neglect** | Ignoring prior probabilities | "The test caught a bug, so this code area must be buggy." (Test coverage is 98%; finding one bug is expected) |
| **Regression fallacy** | Attributing random variation to a cause | "We deployed a fix and performance improved" (Performance naturally fluctuates) |

### Causal Errors

Causal errors incorrectly establish cause-and-effect relationships:

| Error | Description | Example |
|-------|-------------|---------|
| **Post hoc ergo propter hoc** | Temporal sequence implies causation | "We added monitoring and incidents decreased." (Incidents were already decreasing) |
| **Confounding variable** | Hidden variable causes both observed effects | "Teams using Elixir have fewer bugs." (Teams choosing Elixir may also be more experienced) |
| **Reverse causation** | Effect mistaken for cause | "Complex code has more tests." (Complex code requires more tests, not the reverse) |

## Formal Detection of Reasoning Errors

The Prismatic Platform implements formal reasoning error detection through multiple complementary systems:

```elixir
defmodule PrismaticEpistemic.ReasoningValidator do
  @moduledoc """
  Validates reasoning chains for structural correctness.

  Operates on formalized argument structures:
  - Premises: a set of propositions taken as given
  - Inference steps: transformations that derive new propositions
  - Conclusion: the final derived proposition

  Each inference step must correspond to a valid logical rule.
  Steps that do not correspond to any known rule are flagged
  as potential reasoning errors.
  """

  alias PrismaticEpistemic.{Proposition, InferenceStep, ArgumentChain}

  @type validation_result :: %{
    valid: boolean(),
    errors: list(reasoning_error()),
    warnings: list(reasoning_warning()),
    confidence: float()
  }

  @type reasoning_error :: %{
    step: non_neg_integer(),
    error_type: error_type(),
    description: String.t(),
    severity: :critical | :major | :minor
  }

  @type error_type ::
    :affirming_consequent
    | :denying_antecedent
    | :undistributed_middle
    | :composition_fallacy
    | :division_fallacy
    | :hasty_generalization
    | :circular_reasoning
    | :non_sequitur
    | :false_dichotomy

  @spec validate(ArgumentChain.t()) :: {:ok, validation_result()}
  def validate(%ArgumentChain{} = chain) do
    errors =
      chain.steps
      |> Enum.with_index()
      |> Enum.flat_map(fn {step, index} ->
        validate_step(step, index, chain.premises, previous_conclusions(chain, index))
      end)

    warnings = check_inductive_strength(chain)
    confidence = compute_chain_confidence(chain, errors)

    {:ok, %{
      valid: Enum.empty?(errors),
      errors: errors,
      warnings: warnings,
      confidence: confidence
    }}
  end

  defp validate_step(step, index, premises, prior_conclusions) do
    available_propositions = MapSet.union(premises, prior_conclusions)

    []
    |> check_affirming_consequent(step, index, available_propositions)
    |> check_denying_antecedent(step, index, available_propositions)
    |> check_circular_reasoning(step, index, premises)
    |> check_non_sequitur(step, index, available_propositions)
    |> check_false_dichotomy(step, index, available_propositions)
  end

  defp check_affirming_consequent(errors, step, index, propositions) do
    case step.rule do
      {:modus_ponens, antecedent, consequent} ->
        if MapSet.member?(propositions, consequent) and
           not MapSet.member?(propositions, antecedent) do
          [%{
            step: index,
            error_type: :affirming_consequent,
            description: "Step #{index} affirms the consequent: concludes #{inspect(antecedent)} from #{inspect(consequent)}",
            severity: :critical
          } | errors]
        else
          errors
        end

      _ ->
        errors
    end
  end

  defp check_denying_antecedent(errors, step, index, propositions) do
    case step.rule do
      {:modus_tollens, antecedent, consequent} ->
        negated_antecedent = Proposition.negate(antecedent)

        if MapSet.member?(propositions, negated_antecedent) and
           step.conclusion == Proposition.negate(consequent) do
          [%{
            step: index,
            error_type: :denying_antecedent,
            description: "Step #{index} denies the antecedent: concludes not-#{inspect(consequent)} from not-#{inspect(antecedent)}",
            severity: :critical
          } | errors]
        else
          errors
        end

      _ ->
        errors
    end
  end

  defp check_circular_reasoning(errors, step, index, premises) do
    if MapSet.member?(premises, step.conclusion) do
      [%{
        step: index,
        error_type: :circular_reasoning,
        description: "Step #{index} concludes a premise: #{inspect(step.conclusion)} is already assumed",
        severity: :major
      } | errors]
    else
      errors
    end
  end

  defp check_non_sequitur(errors, step, index, available) do
    required_inputs = InferenceStep.required_propositions(step)
    missing = MapSet.difference(required_inputs, available)

    if MapSet.size(missing) > 0 do
      [%{
        step: index,
        error_type: :non_sequitur,
        description: "Step #{index} requires #{inspect(MapSet.to_list(missing))} which are not established",
        severity: :critical
      } | errors]
    else
      errors
    end
  end

  defp check_false_dichotomy(errors, step, index, available) do
    case step.rule do
      {:disjunctive_syllogism, options} when length(options) == 2 ->
        if InferenceStep.exhaustive?(options, available) do
          errors
        else
          [%{
            step: index,
            error_type: :false_dichotomy,
            description: "Step #{index} presents a false dichotomy: #{inspect(options)} may not be exhaustive",
            severity: :major
          } | errors]
        end

      _ ->
        errors
    end
  end

  defp previous_conclusions(chain, index) do
    chain.steps
    |> Enum.take(index)
    |> Enum.map(& &1.conclusion)
    |> MapSet.new()
  end

  defp check_inductive_strength(chain) do
    chain.steps
    |> Enum.with_index()
    |> Enum.flat_map(fn {step, index} ->
      case step.evidence_count do
        n when n < 3 ->
          [%{step: index, warning: "Inductive step #{index} based on only #{n} observations"}]
        _ ->
          []
      end
    end)
  end

  defp compute_chain_confidence(chain, errors) do
    base_confidence = 1.0
    error_penalty = length(errors) * 0.2
    step_penalty = length(chain.steps) * 0.02

    max(0.0, base_confidence - error_penalty - step_penalty)
    |> Float.round(4)
  end
end
```

## Trinity Gate Reasoning Validation

The [Trinity Gate](@/glossary/trinity-gate.md) provides three independent checks against reasoning errors, each targeting different error categories:

### Gate 1: Structural Consistency

The structural consistency gate verifies that the belief graph forms a valid directed acyclic graph (DAG). Reasoning errors that create circular dependencies (circular reasoning, begging the question) are detected as cycles in the graph:

```elixir
defmodule PrismaticEpistemic.StructuralConsistencyGate do
  @moduledoc """
  Trinity Gate 1: Verifies the belief graph has no cycles.
  Cycles indicate circular reasoning -- a conclusion that
  depends on itself through a chain of inferences.
  """

  alias PrismaticEpistemic.BeliefGraph

  @spec check(BeliefGraph.t()) :: :pass | {:fail, list(cycle())}
  def check(%BeliefGraph{} = graph) do
    case BeliefGraph.find_cycles(graph) do
      [] -> :pass
      cycles -> {:fail, cycles}
    end
  end
end
```

### Gate 2: Logical Consistency

The [logical consistency](@/glossary/logical-consistency.md) gate verifies that the set of beliefs does not contain contradictions. Reasoning errors that produce contradictory conclusions (affirming and denying the same proposition) are detected as inconsistencies in the proposition set.

### Gate 3: Formal Necessity

The formal necessity gate uses [Lean4](@/glossary/lean4.md) formal proofs to verify that critical claims can be derived from axioms using only valid inference rules. This is the strongest check: any reasoning error that produces a conclusion that cannot be formally proven is caught at this gate.

## Reasoning Errors in AI Systems

AI systems -- particularly large language models -- are susceptible to reasoning errors that mirror human cognitive biases but have different root causes:

| AI Reasoning Error | Description | Human Analog |
|-------------------|-------------|--------------|
| **Pattern completion** | LLM completes a pattern rather than reasoning about it | Hasty generalization |
| **Training distribution bias** | Model reflects biases in training data | Sampling bias |
| **Hallucination** | Model generates plausible but fabricated claims | Confabulation |
| **Sycophancy** | Model agrees with user rather than reasoning independently | Authority bias |
| **Chain-of-thought degradation** | Errors compound across long reasoning chains | Cascading inference errors |

The Prismatic Platform addresses AI reasoning errors through:

- **Structured output enforcement**: AI agents produce typed, validated outputs rather than free-text reasoning
- **[Evidence provenance](@/glossary/data-provenance.md)**: Every AI-generated claim must reference verifiable source data
- **Multi-agent verification**: Critical conclusions require agreement from independent agents
- **[Confidence scoring](@/glossary/confidence-scoring.md)**: Quantitative confidence prevents false certainty

## NABLA Axioms as Reasoning Error Prevention

The [NABLA Infinity](@/glossary/nabla-infinity.md) axioms address specific categories of reasoning errors:

| Axiom | Reasoning Error Prevented |
|-------|--------------------------|
| **Signal Plurality** | Hasty generalization (requires multiple signals) |
| **Contradiction Preservation** | False dichotomy (preserves all positions) |
| **Absence Informative** | Survivorship bias (missing data is tracked) |
| **Time Decay** | Stale evidence error (beliefs must have timestamps) |
| **Unknown Valid** | False certainty (uncertainty is legitimate) |
| **Source Independence** | Authority bias (sources weighted by independence) |
| **Provenance Mandatory** | Non-sequitur (claims must trace to evidence) |

Each axiom makes a specific class of reasoning error structurally impossible rather than merely discouraged. A system that enforces signal plurality cannot commit hasty generalization because it refuses to establish beliefs from a single observation. A system that enforces contradiction preservation cannot commit false dichotomy because it maintains all positions simultaneously.

## Reasoning Errors in Software Engineering

Software engineering decisions are particularly vulnerable to reasoning errors because the feedback loops are long (a bad architecture decision may not reveal itself for months) and the reasoning is often informal (architectural decisions are discussed in meetings, not proven in formal systems).

### The Correlation-Causation Error in Performance

"We added caching and response times improved." This ignores confounding variables: perhaps the database was under load from a batch job that completed, or the user population shifted to a less demanding workload. Proper performance reasoning requires controlled experiments ([A/B testing](@/glossary/performance-testing.md)) and statistical analysis.

### The Composition Error in Complexity

"Each microservice is simple, so the system is simple." This commits the composition fallacy: the complexity of a [distributed system](@/glossary/distributed-system.md) is not the sum of its components' complexities but includes the interaction complexity between all pairs of components. A system with N microservices has O(N^2) potential interaction patterns.

### The Appeal to Popularity Error in Technology Choice

"Everyone uses this framework, so it must be the best choice for our project." Framework popularity correlates with community size and available libraries, but not necessarily with fitness for a specific use case. The Prismatic Platform's choice of [Elixir](@/glossary/elixir.md) and [OTP](@/glossary/otp.md) deliberately prioritizes fitness for purpose over popularity.

### The Neglect of Base Rate Error in Bug Reports

"This user reported a bug, so there is a bug." User reports have a base rate of true positives that must be considered. Some reports are misunderstandings, configuration errors, or network issues. Reasoning correctly requires assessing the prior probability that a report represents a real defect.

## Automated Reasoning Error Prevention

The platform integrates reasoning error prevention into automated workflows:

```elixir
defmodule PrismaticEpistemic.DecisionAuditor do
  @moduledoc """
  Audits architectural and operational decisions for reasoning errors.
  Applied to all significant platform decisions including architecture
  changes, dependency additions, and quality policy modifications.
  """

  @type decision :: %{
    statement: String.t(),
    premises: list(String.t()),
    evidence: list(evidence_item()),
    alternatives_considered: list(String.t()),
    confidence: float()
  }

  @type audit_result :: %{
    reasoning_valid: boolean(),
    errors_detected: list(String.t()),
    missing_evidence: list(String.t()),
    recommendation: :approve | :revise | :reject
  }

  @spec audit(decision()) :: {:ok, audit_result()}
  def audit(%{} = decision) do
    errors = []

    errors =
      if length(decision.evidence) < 2 do
        ["Signal plurality violation: only #{length(decision.evidence)} evidence items" | errors]
      else
        errors
      end

    errors =
      if Enum.empty?(decision.alternatives_considered) do
        ["False dichotomy risk: no alternatives were considered" | errors]
      else
        errors
      end

    errors =
      if decision.confidence > 0.95 and length(decision.evidence) < 5 do
        ["Overconfidence: confidence #{decision.confidence} with only #{length(decision.evidence)} evidence items" | errors]
      else
        errors
      end

    contradicting =
      Enum.filter(decision.evidence, fn e -> e.polarity == :contradicting end)

    errors =
      if Enum.empty?(contradicting) and length(decision.evidence) > 3 do
        ["Confirmation bias risk: no contradicting evidence in #{length(decision.evidence)} items" | errors]
      else
        errors
      end

    recommendation =
      cond do
        length(errors) >= 3 -> :reject
        length(errors) >= 1 -> :revise
        true -> :approve
      end

    {:ok, %{
      reasoning_valid: Enum.empty?(errors),
      errors_detected: errors,
      missing_evidence: identify_missing_evidence(decision),
      recommendation: recommendation
    }}
  end

  defp identify_missing_evidence(decision) do
    required_evidence_types = [:performance_data, :user_feedback, :alternative_comparison]

    present_types =
      decision.evidence
      |> Enum.map(& &1.type)
      |> MapSet.new()

    required_evidence_types
    |> Enum.reject(&MapSet.member?(present_types, &1))
    |> Enum.map(&"Missing evidence type: #{&1}")
  end
end
```

## The Cost of Reasoning Errors

Reasoning errors compound over time. A single incorrect inference becomes a premise for subsequent reasoning, and each subsequent step may introduce additional errors. In software systems, this manifests as:

- **Architectural debt**: Wrong reasoning about system requirements leads to architectures that must be rebuilt
- **Security vulnerabilities**: Wrong reasoning about threat models leaves attack surfaces unprotected
- **Performance problems**: Wrong reasoning about workload characteristics leads to inefficient designs
- **Quality degradation**: Wrong reasoning about test coverage leads to false confidence in correctness

The platform's [quality gates](@/glossary/quality-gate.md) and [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine exist precisely to catch reasoning errors before they compound into systemic problems.

## Prevention Strategies

| Strategy | Mechanism | Platform Implementation |
|----------|-----------|------------------------|
| **Formal verification** | Prove correctness mathematically | [Lean4](@/glossary/lean4.md) proofs, [Dialyzer](@/glossary/dialyzer.md) type checking |
| **Adversarial review** | Have someone argue the opposite position | [Red team](@/glossary/red-team.md) epistemic attacks |
| **Evidence plurality** | Require multiple independent data sources | NABLA Signal Plurality axiom |
| **Confidence calibration** | Compare predicted and actual outcomes | Bayesian [confidence scoring](@/glossary/confidence-scoring.md) |
| **Pre-mortem analysis** | Assume the decision failed and reason backward | Purple team closure analysis |
| **Structured argumentation** | Formalize arguments before evaluating them | Argument chain validation |
| **Automated auditing** | Machine-check reasoning structures | DecisionAuditor, Trinity Gate |

## Related Terms

- [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) -- Formal framework for correct reasoning about knowledge
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer verification catching reasoning errors
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework with axioms preventing reasoning errors
- [Bias Detection](@/glossary/bias-detection.md) -- Automated identification of systematic reasoning biases
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proof of reasoning correctness
- [Logical Consistency](@/glossary/logical-consistency.md) -- Property of belief systems without contradictions
- [Rationalize Evidence](@/glossary/rationalize-evidence.md) -- Motivated distortion related to reasoning errors
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Quantitative reasoning about certainty
- [Evidence Over Opinion](@/glossary/evidence-over-opinion.md) -- Principle prioritizing evidence-based reasoning
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Axiom preventing premature resolution of contradictions

## See Also

- [Architecture](@/architecture/_index.md) -- Platform epistemic architecture
- [Capabilities](@/capabilities/_index.md) -- Reasoning validation capabilities
- Glossary -- Complete glossary index

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
