+++
title = "Logical Reasoning"
weight = 50
[extra]
description = "The systematic process of using formal logic to derive conclusions from premises, implemented in Prismatic through the Trinity Gate's logical consistency check that validates all reasoning chains"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "Epistemic Framework"
related_concepts = ["formal logic", "deductive inference", "soundness and completeness", "reasoning chains", "proof theory"]
implementation_status = "production"
authority_level = "standard"
difficulty_rating = 8
prerequisites = ["logical-consistency", "trinity-gate", "formal-verification", "nabla-infinity"]
learning_path = ["logical-consistency", "rule-based-reasoning", "bayesian-reasoning", "logical-reasoning", "formal-verification"]
interactive_demos = ["/labs/glossary/logical-reasoning"]
code_examples = ["Elixir Pattern Matching", "Rule Engine", "Proof Validation"]
external_resources = ["https://plato.stanford.edu/entries/logic-classical/", "https://leanprover.github.io/", "https://hexdocs.pm/stream_data/StreamData.html"]
version_introduced = "0.6.0"
stability_level = "stable"
testing_scenarios = ["modus ponens validation", "contradiction detection", "circular reasoning detection", "premise validity checking", "chain-of-thought verification", "formal proof generation"]
keywords = ["logical reasoning", "deduction", "inference", "modus ponens", "syllogism", "proof", "soundness", "validity", "consistency", "Trinity Gate", "epistemic"]
tags = ["glossary", "epistemic", "logic", "reasoning", "trinity-gate", "formal-methods", "verification"]
related_terms = ["logical-consistency", "epistemic-reasoning", "bayesian-reasoning", "formal-verification", "trinity-gate", "rule-based-reasoning", "modal-logic", "lean4", "nabla-infinity", "theorem-proving", "knowledge-graph", "ontology", "agent", "consciousness-traits", "agent-tier", "aiad"]
word_count = 2031
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Logical Reasoning - Prismatic Platform"
+++

## Definition

Logical reasoning is the systematic process of deriving conclusions from premises using well-defined rules of inference. It encompasses the formal methods by which agents, systems, and humans move from known facts and assumptions to new knowledge while preserving truth. A logically valid argument guarantees that if the premises are true, the conclusion must be true. A logically sound argument is both valid and has true premises.

In the Prismatic Platform, logical reasoning is not an abstract philosophical concern -- it is an engineered subsystem. The [Trinity Gate](/glossary/trinity-gate/)'s second gate (Logical Consistency) validates that all reasoning chains produced by the platform's 530+ [agents](/glossary/agent/) follow valid logical rules. No claim passes through the Trinity Gate without demonstrating that its reasoning chain is free of logical fallacies, circular arguments, and unsupported jumps. This enforcement ensures that the platform's epistemic foundation -- the [NABLA Infinity](/glossary/nabla-infinity/) framework -- rests on sound logical ground rather than on persuasive but invalid reasoning.

## Overview

Logical reasoning divides into three primary categories, each with distinct characteristics and applications in the Prismatic Platform:

**Deductive Reasoning** proceeds from general premises to specific conclusions with certainty. If "all AIAD agents have a tier classification" and "Archer Supreme is an AIAD agent," then "Archer Supreme has a tier classification." The conclusion is guaranteed by the premises. Deductive reasoning powers the platform's [rule-based reasoning](/glossary/rule-based-reasoning/) systems, authority validation, and formal compliance checks.

**Inductive Reasoning** proceeds from specific observations to general conclusions with probability, not certainty. If "the last 1,000 requests to /api/v1/health completed in under 5ms," then "the next request will probably complete in under 5ms." The conclusion is supported but not guaranteed. Inductive reasoning powers the platform's [Bayesian reasoning](/glossary/bayesian-reasoning/) systems, anomaly detection, and predictive analytics.

**Abductive Reasoning** infers the best explanation for observed facts. If "the deployment pipeline failed" and "the most common cause of pipeline failure is a compilation warning," then "a compilation warning probably caused the failure." The conclusion is the most likely explanation, not a guaranteed one. Abductive reasoning powers the platform's diagnostic systems, root cause analysis, and autoheal mechanisms.

The relationship between these three forms is complementary, not competing. The platform uses all three, but with different trust levels and verification requirements:

| Reasoning Type | Trust Level | Trinity Gate Requirement | Use Case |
|---------------|-------------|------------------------|----------|
| Deductive | Highest (certain if premises true) | Gate 2: Logical Consistency | Authority validation, compliance |
| Inductive | Medium (probabilistic) | Gate 1: Structural + Gate 2: Logical | Anomaly detection, prediction |
| Abductive | Lowest (best guess) | All 3 Gates recommended | Diagnostics, root cause analysis |

Formal logic provides the mathematical foundation for all three forms. Propositional logic deals with statements that are true or false and their combinations through logical connectives (AND, OR, NOT, IMPLIES). Predicate logic extends propositional logic with variables, quantifiers (for all, there exists), and predicates that express properties and relationships. [Modal logic](/glossary/modal-logic/) adds operators for necessity and possibility, which the Trinity Gate's third gate (Formal Necessity) uses to verify claims that must hold across all possible states.

The platform's commitment to logical reasoning reflects a core architectural decision: autonomous agents making decisions that affect a production platform must reason correctly, not just persuasively. An LLM can generate plausible-sounding justifications for incorrect conclusions. Logical reasoning provides the formal tools to detect and reject such failures before they propagate through the system.

## Technical Details

### Core Inference Rules

The platform's logical reasoning engine implements standard inference rules:

| Rule | Form | Description |
|------|------|-------------|
| **Modus Ponens** | P, P -> Q, therefore Q | If P is true and P implies Q, then Q is true |
| **Modus Tollens** | ~Q, P -> Q, therefore ~P | If Q is false and P implies Q, then P is false |
| **Hypothetical Syllogism** | P -> Q, Q -> R, therefore P -> R | Chain of implications |
| **Disjunctive Syllogism** | P OR Q, ~P, therefore Q | Eliminating a disjunct |
| **Conjunction Introduction** | P, Q, therefore P AND Q | Combining facts |
| **Universal Instantiation** | forall x: P(x), therefore P(a) | Applying general rule to specific case |
| **Existential Generalization** | P(a), therefore exists x: P(x) | Generalizing from specific case |

### Reasoning Chain Representation

Reasoning chains are represented as directed acyclic graphs (DAGs) where nodes are propositions and edges are inference steps:

```
Premise 1: "Agent X has tier L3"
Premise 2: "L3 agents can override L1 and L2 decisions"
                    |
                    v (Modus Ponens)
Intermediate: "Agent X can override L1 and L2 decisions"
Premise 3: "Agent Y has tier L1"
                    |
                    v (Universal Instantiation + Modus Ponens)
Conclusion: "Agent X can override Agent Y's decisions"
```

The DAG structure ensures:
- No circular reasoning (acyclicity)
- Every conclusion traceable to premises (provenance)
- Every inference step identifiable and verifiable (auditability)

### Logical Consistency Verification

The Trinity Gate's logical consistency check verifies reasoning chains against a set of structural and semantic validators:

1. **Acyclicity Check**: The reasoning DAG must be acyclic. Circular reasoning is immediately rejected.
2. **Rule Validity**: Each inference step must correspond to a valid inference rule. Ad hoc reasoning steps are rejected.
3. **Premise Grounding**: All premises must be traceable to known facts, axioms, or validated observations. Unsupported premises are flagged.
4. **Contradiction Detection**: The set of conclusions must be internally consistent. If a reasoning chain produces both P and ~P, it is rejected.
5. **Relevance Filtering**: Premises must be relevant to the conclusion. Valid but irrelevant reasoning chains (red herrings) are flagged.

### Formal Methods Integration

For high-confidence decisions (confidence threshold >= 0.95), the platform integrates with [Lean4](/glossary/lean4/) for machine-checked proofs:

```
-- Lean4 proof that L5 agents can override all lower tiers
theorem l5_override_universal (agent : Agent) (target : Agent)
  (h1 : agent.tier = Tier.L5) (h2 : target.tier ≠ Tier.L5) :
  can_override agent target := by
  unfold can_override
  simp [h1, h2, tier_ordering]
```

## Implementation in Prismatic Platform

### Reasoning Engine

The logical reasoning engine is implemented as a GenServer that evaluates reasoning chains submitted by agents:

```elixir
defmodule PrismaticAgents.Reasoning.LogicalEngine do
  @moduledoc """
  Evaluates logical reasoning chains for validity, soundness,
  and consistency. Implements the Trinity Gate's second gate
  (Logical Consistency) as a programmatic verification system.
  """

  use GenServer

  alias PrismaticAgents.Reasoning.{Chain, Validator, Contradiction}

  @type proposition :: String.t()
  @type inference_rule :: :modus_ponens | :modus_tollens | :hypothetical_syllogism |
                          :disjunctive_syllogism | :conjunction_intro | :conjunction_elim |
                          :universal_instantiation | :existential_generalization
  @type reasoning_step :: %{
    premises: [proposition()],
    rule: inference_rule(),
    conclusion: proposition()
  }
  @type chain :: %{
    id: String.t(),
    steps: [reasoning_step()],
    final_conclusion: proposition(),
    confidence: float()
  }
  @type validation_result :: %{
    valid: boolean(),
    sound: boolean(),
    issues: [String.t()],
    confidence: float()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec validate_chain(chain()) :: {:ok, validation_result()} | {:error, term()}
  def validate_chain(chain) do
    GenServer.call(__MODULE__, {:validate, chain})
  end

  @spec check_consistency([proposition()]) :: {:ok, :consistent} | {:error, {:contradiction, proposition(), proposition()}}
  def check_consistency(propositions) do
    GenServer.call(__MODULE__, {:consistency, propositions})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{validations: 0, rejections: 0}}
  end

  @impl GenServer
  def handle_call({:validate, chain}, _from, state) do
    result = perform_validation(chain)

    :telemetry.execute(
      [:prismatic_agents, :reasoning, :validation],
      %{count: 1, valid: result.valid},
      %{chain_id: chain.id}
    )

    updated_state = if result.valid do
      %{state | validations: state.validations + 1}
    else
      %{state | validations: state.validations + 1, rejections: state.rejections + 1}
    end

    {:reply, {:ok, result}, updated_state}
  end

  @impl GenServer
  def handle_call({:consistency, propositions}, _from, state) do
    result = Contradiction.detect(propositions)
    {:reply, result, state}
  end

  @spec perform_validation(chain()) :: validation_result()
  defp perform_validation(chain) do
    validators = [
      &Validator.check_acyclicity/1,
      &Validator.check_rule_validity/1,
      &Validator.check_premise_grounding/1,
      &Validator.check_contradiction_free/1,
      &Validator.check_relevance/1
    ]

    issues =
      validators
      |> Enum.flat_map(fn validator ->
        case validator.(chain) do
          :ok -> []
          {:error, issue} -> [issue]
          {:warning, issue} -> ["WARNING: #{issue}"]
        end
      end)

    errors = Enum.reject(issues, &String.starts_with?(&1, "WARNING:"))

    %{
      valid: Enum.empty?(errors),
      sound: Enum.empty?(issues),
      issues: issues,
      confidence: compute_confidence(chain, issues)
    }
  end

  @spec compute_confidence(chain(), [String.t()]) :: float()
  defp compute_confidence(chain, issues) do
    base_confidence = chain.confidence
    penalty_per_warning = 0.05
    warning_count = length(issues) - length(Enum.reject(issues, &String.starts_with?(&1, "WARNING:")))

    max(0.0, base_confidence - warning_count * penalty_per_warning)
  end
end
```

### Contradiction Detection

The contradiction detection module identifies logical contradictions within proposition sets:

```elixir
defmodule PrismaticAgents.Reasoning.Contradiction do
  @moduledoc """
  Detects logical contradictions within sets of propositions.
  A contradiction occurs when a proposition set entails both
  P and NOT P. Uses negation normal form for efficient detection.
  """

  @type proposition :: String.t()
  @type detection_result ::
          {:ok, :consistent}
          | {:error, {:contradiction, proposition(), proposition()}}

  @spec detect([proposition()]) :: detection_result()
  def detect(propositions) do
    normalized = Enum.map(propositions, &normalize/1)
    find_contradiction(normalized, MapSet.new())
  end

  @spec normalize(proposition()) :: {atom(), String.t()}
  defp normalize("NOT " <> rest), do: {:negated, String.trim(rest)}
  defp normalize("~" <> rest), do: {:negated, String.trim(rest)}
  defp normalize(prop), do: {:positive, String.trim(prop)}

  @spec find_contradiction([{atom(), String.t()}], MapSet.t()) :: detection_result()
  defp find_contradiction([], _seen), do: {:ok, :consistent}

  defp find_contradiction([{polarity, content} | rest], seen) do
    opposite = opposite_polarity(polarity)
    opposite_key = {opposite, content}

    if MapSet.member?(seen, opposite_key) do
      positive = if polarity == :positive, do: content, else: "NOT #{content}"
      negative = if polarity == :negated, do: content, else: "NOT #{content}"
      {:error, {:contradiction, positive, negative}}
    else
      find_contradiction(rest, MapSet.put(seen, {polarity, content}))
    end
  end

  @spec opposite_polarity(atom()) :: atom()
  defp opposite_polarity(:positive), do: :negated
  defp opposite_polarity(:negated), do: :positive
end
```

### Trinity Gate Integration

The logical reasoning engine integrates with the Trinity Gate as Gate 2 (Logical Consistency):

```elixir
defmodule PrismaticAgents.TrinityGate.Gate2 do
  @moduledoc """
  Trinity Gate - Gate 2: Logical Consistency.
  Validates that reasoning chains follow valid logical rules,
  contain no contradictions, and derive conclusions correctly
  from premises.
  """

  alias PrismaticAgents.Reasoning.LogicalEngine

  @type gate_input :: %{
    reasoning_chain: LogicalEngine.chain(),
    confidence_threshold: float()
  }
  @type gate_result :: {:pass, map()} | {:fail, String.t()}

  @spec evaluate(gate_input()) :: gate_result()
  def evaluate(%{reasoning_chain: chain, confidence_threshold: threshold}) do
    case LogicalEngine.validate_chain(chain) do
      {:ok, %{valid: true, confidence: confidence}} when confidence >= threshold ->
        {:pass, %{
          gate: :logical_consistency,
          confidence: confidence,
          chain_id: chain.id
        }}

      {:ok, %{valid: true, confidence: confidence}} ->
        {:fail, "Logical consistency passed but confidence #{confidence} below threshold #{threshold}"}

      {:ok, %{valid: false, issues: issues}} ->
        {:fail, "Logical consistency failed: #{Enum.join(issues, "; ")}"}

      {:error, reason} ->
        {:fail, "Logical engine error: #{inspect(reason)}"}
    end
  end
end
```

## Comparison with Alternatives

### Logical Reasoning vs. Statistical Reasoning

| Aspect | Logical Reasoning | Statistical/[Bayesian Reasoning](/glossary/bayesian-reasoning/) |
|--------|------------------|-----------------------------------|
| **Certainty** | Absolute (given true premises) | Probabilistic (confidence intervals) |
| **Premises** | Binary (true/false) | Continuous (probability distributions) |
| **Handling Uncertainty** | Cannot directly handle uncertainty | Designed for uncertainty |
| **Scalability** | Complexity grows with proposition count | Handles large datasets naturally |
| **Platform Use** | Authority validation, compliance | Anomaly detection, prediction |
| **Trinity Gate** | Gate 2 (Logical Consistency) | Supplementary to Gate 1 (Structural) |

### Logical Reasoning vs. LLM Reasoning

LLMs perform approximate reasoning through pattern matching on training data. They can produce reasoning chains that appear valid but contain subtle logical errors. The platform addresses this gap by feeding LLM-generated reasoning chains through the logical reasoning engine for formal validation. This combination leverages the LLM's ability to generate creative hypotheses while ensuring that the final reasoning chain meets formal logical standards.

| Aspect | Formal Logical Reasoning | LLM Reasoning |
|--------|------------------------|---------------|
| **Correctness** | Provably correct (if valid) | Probabilistically correct |
| **Flexibility** | Limited to defined inference rules | Handles novel situations |
| **Speed** | Fast for small chain; exponential for complex | Constant time (model inference) |
| **Transparency** | Fully transparent proof chain | Black-box attention mechanism |
| **Platform Role** | Verification layer | Generation layer |

### Logical Reasoning vs. Fuzzy Logic

Fuzzy logic extends classical logic by allowing truth values between 0 and 1, handling vagueness that classical logic cannot represent. The platform uses classical logic for the Trinity Gate (where binary validity is required) and fuzzy logic concepts within the confidence scoring system (where degrees of certainty are meaningful).

## Best Practices

1. **Explicit Premises**: Every reasoning chain must start with explicitly stated premises. Implicit assumptions are the primary source of logical errors. The NABLA axiom of Provenance Mandatory enforces this.

2. **Minimal Inference Chains**: Prefer shorter reasoning chains over longer ones. Each inference step introduces a potential error point. If a conclusion can be reached in 3 steps rather than 7, use 3.

3. **Premise Validation**: Validate premises against ground truth before constructing reasoning chains. A valid argument with false premises produces a false conclusion -- logical validity does not guarantee truth.

4. **Contradiction as Signal**: When the reasoning engine detects a contradiction, treat it as valuable information rather than an error to suppress. Per [NABLA Infinity](/glossary/nabla-infinity/) Axiom 2 (Contradiction Preservation), contradictions reveal gaps in understanding.

5. **Separate Reasoning Types**: Do not mix deductive and inductive reasoning in the same chain without clearly marking the transition. Inductive steps reduce the overall chain's certainty even if the deductive steps are valid.

6. **Formal Proofs for Critical Paths**: Use [Lean4](/glossary/lean4/) formal proofs for security-critical and safety-critical reasoning chains. Machine-checked proofs eliminate human error in proof validation.

7. **Audit Trail Preservation**: Preserve the complete reasoning chain, including rejected branches and intermediate steps, in the audit log. Future analysis may reveal patterns in reasoning failures.

## Common Pitfalls

1. **Affirming the Consequent**: The fallacy of concluding P from "P -> Q" and "Q." Example: "If the deployment failed, the tests will fail. The tests failed. Therefore the deployment failed." This is invalid -- tests can fail for many reasons.

2. **Circular Reasoning**: Using the conclusion as a premise. The acyclicity check in the reasoning engine catches explicit circularity, but agents can construct implicit circular arguments that require deeper analysis.

3. **False Dilemma**: Presenting only two options when more exist. "Either we optimize for latency or for throughput" ignores that many optimizations improve both.

4. **Composition Fallacy**: Assuming that what is true of parts must be true of the whole. "Each individual module compiles without warnings" does not guarantee "the entire system compiles without warnings" (cross-module dependencies can introduce warnings).

5. **Equivocation**: Using the same term with different meanings in different premises. The platform's [ontology](/glossary/ontology/) system mitigates this by enforcing consistent term definitions across reasoning chains.

6. **Appeal to Complexity**: Accepting a conclusion because the reasoning chain is complex and therefore "must be right." The reasoning engine treats all chains equally regardless of length or complexity.

7. **Ignoring Base Rates**: In hybrid reasoning chains that combine deduction with probabilistic elements, failing to account for base rates leads to systematic overconfidence. The Bayesian reasoning module corrects for this when integrated with logical chains.

## Use Cases

### Agent Authority Validation

When an agent attempts to override another agent's decision, the authority validation system constructs a deductive reasoning chain: "Agent X has tier L3. L3 agents can override L1 and L2 agents. Agent Y has tier L2. Therefore Agent X can override Agent Y." This chain is validated by the logical reasoning engine before the override is permitted, ensuring that authority decisions are logically sound.

### Quality Gate Reasoning

The quality gate system uses logical reasoning to determine whether code changes should be blocked: "The compilation produced 3 warnings. The policy requires zero warnings. Warning count (3) is greater than zero. Therefore the commit must be blocked." The reasoning chain is trivial but explicit, creating an auditable justification for every gate decision.

### Security Rating Derivation

The Perimeter EASM system derives security ratings through multi-step logical reasoning: "Domain X has an expired SSL certificate (finding F1). Expired certificates indicate poor security hygiene (rule R7). Poor security hygiene reduces the security score by 50 points (scoring rule S3). Therefore Domain X loses 50 points from its security score." Each step is traceable and verifiable.

### Epistemic Conflict Resolution

When the [epistemic reasoning](/glossary/epistemic-reasoning/) system detects conflicting evidence from multiple sources, logical reasoning helps resolve the conflict by examining whether the conflict is genuine (contradictory premises) or apparent (different premises leading to different but compatible conclusions). The contradiction detection module distinguishes between these cases.

### Compliance Verification

NIS2 and ZKB compliance assessment requires chains of regulatory reasoning: "Article 21 of NIS2 requires risk management measures. Risk management measures include vulnerability management (Article 21(2)(e)). The system does not perform vulnerability scanning. Therefore the system is non-compliant with Article 21(2)(e)." The reasoning chain creates a defensible audit trail for compliance assessments.

## Related Concepts

- [Logical Consistency](/glossary/logical-consistency/) -- The property of a reasoning chain being free of contradictions and valid in form
- [Epistemic Reasoning](/glossary/epistemic-reasoning/) -- Broader reasoning about knowledge, belief, and justified claims
- [Bayesian Reasoning](/glossary/bayesian-reasoning/) -- Probabilistic reasoning that complements logical deduction under uncertainty
- [Formal Verification](/glossary/formal-verification/) -- Mathematical proof methods that provide the highest assurance of reasoning correctness
- [Trinity Gate](/glossary/trinity-gate/) -- Three-gate verification system where Gate 2 enforces logical consistency
- [Rule-Based Reasoning](/glossary/rule-based-reasoning/) -- Applying predefined rules to derive conclusions, a specific form of deductive reasoning
- [Modal Logic](/glossary/modal-logic/) -- Logic of necessity and possibility used in Trinity Gate's third gate
- [Lean4](/glossary/lean4/) -- Interactive theorem prover for machine-checked logical proofs
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework requiring provenance and logical grounding for all beliefs
- [Theorem Proving](/glossary/theorem-proving/) -- Automated and interactive proof construction for formal verification
- [Knowledge Graph](/glossary/knowledge-graph/) -- Structured representation of facts that serve as premises for reasoning
- [Ontology](/glossary/ontology/) -- Formal domain models ensuring consistent term definitions in reasoning chains
- [Consciousness Traits](/glossary/consciousness-traits/) -- Emergent behaviors in L5 agents that include novel reasoning patterns
- [Agent](/glossary/agent/) -- Autonomous entities whose reasoning chains are validated by the logical engine

## See Also

- [Agent Tier](/glossary/agent-tier/) -- Authority levels where higher tiers require stronger logical justification
- [AIAD](/glossary/aiad/) -- Agent standard specifying reasoning requirements per agent type
- [Quality Gate](/glossary/quality-gate/) -- Enforcement system using logical reasoning for merge decisions
- [Observability](/glossary/observability/) -- Monitoring of reasoning engine performance and rejection rates

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
