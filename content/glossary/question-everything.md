+++
title = "Question Everything"
weight = 52
[extra]
tags = ["glossary", "core", "philosophy", "epistemic", "nabla", "doctrine", "critical-thinking", "verification"]
description = "A foundational epistemic principle requiring systematic doubt, evidence-based verification, and resistance to assumption in all platform decisions, derived from the NABLA Infinity framework and Addiction Preservation doctrine"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["contradiction-preservation", "signal-plurality", "trinity-gate", "proves-before-claiming", "truth-over-convenience", "scientific-rigor", "code-as-hypothesis", "bayesian-reasoning", "cherry-picking", "addiction-recovery"]
key_concepts = ["systematic doubt", "evidence requirements", "assumption detection", "verification obligation", "epistemic humility", "belief provenance"]
use_cases = ["architectural decisions", "quality gate design", "threat modeling", "code review", "evolution strategy", "hypothesis testing"]
prerequisites = ["trinity-gate", "contradiction-preservation"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
word_count = 1289
date_modified = "2026-02-23"
keywords = ["Question", "Everything", "NABLA", "Infinity", "Addiction", "Preservation", "glossary", "core", "Prismatic Platform", "Question Everything"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Question Everything - Prismatic Platform"
+++

## Definition and Overview

Question Everything is a foundational epistemic principle that requires systematic doubt, rigorous evidence verification, and active resistance to unchallenged assumptions in all platform decisions, designs, and implementations. In the Prismatic Platform, this principle is not merely a cultural aspiration or a motivational slogan -- it is an operationalized engineering discipline embedded in the NABLA Infinity framework, enforced through the Trinity Gate verification system, and expressed through concrete mechanisms that prevent unsubstantiated claims from influencing platform behavior.

The principle derives from a recognition that software systems fail most catastrophically not from known risks but from unquestioned assumptions. The assumption that an API will always respond within 100ms. The assumption that a database transaction will never deadlock. The assumption that user input will conform to expected formats. The assumption that a dependency will maintain backward compatibility. Each unquestioned assumption represents a latent failure mode that persists in the system precisely because nobody thought to challenge it.

Question Everything operationalizes doubt as a systematic practice rather than an occasional impulse. Every claim about system behavior must be backed by verifiable evidence. Every architectural decision must survive adversarial challenge. Every quality metric must be validated against independent measurements. Every optimization must be benchmarked, not assumed. The platform's commitment to this principle is what transforms it from a collection of code into an epistemically sound engineering system where beliefs about the system correspond to the system's actual behavior.

## Philosophical Foundation

### Epistemic Humility in Software Engineering

The Question Everything principle draws from a long tradition of epistemic philosophy, adapted for the specific challenges of software engineering:

| Philosophical Tradition | Software Engineering Application |
|------------------------|--------------------------------|
| Socratic Method | Challenge every design assumption through structured questioning |
| Cartesian Doubt | Begin from what can be verified, not what is assumed |
| Popperian Falsification | Test hypotheses by trying to disprove them, not confirm them |
| Bayesian Reasoning | Update beliefs based on evidence strength and prior probability |
| Pragmatic Epistemology | Judge ideas by their practical consequences and testability |

In the Prismatic Platform, these traditions are synthesized into a practical engineering discipline that rejects both naive certainty ("it works because we think it works") and paralyzing skepticism ("we can never be sure of anything"). The middle path is structured verification: question everything, but accept conclusions that survive rigorous testing.

### Relationship to NABLA Infinity

Question Everything is a natural consequence of the NABLA Infinity framework's seven non-negotiable axioms:

```elixir
defmodule Prismatic.Epistemic.QuestionEverything do
  @moduledoc """
  Operationalization of the Question Everything principle.
  Provides systematic doubt mechanisms for platform decisions.
  """

  @nabla_axiom_mapping %{
    signal_plurality: "Never accept a single source of evidence",
    contradiction_preservation: "Never dismiss conflicting evidence",
    absence_informative: "Missing evidence is itself evidence",
    time_decay: "Old evidence may no longer be valid",
    unknown_valid: "Acknowledging uncertainty is a valid conclusion",
    source_independence: "Independent sources carry more weight",
    provenance_mandatory: "Every belief must be traceable to its origin"
  }

  @type challenge :: %{
    claim: String.t(),
    evidence_required: [atom()],
    evidence_provided: [map()],
    confidence: float(),
    axioms_satisfied: [atom()],
    axioms_violated: [atom()],
    verdict: :accepted | :challenged | :rejected
  }

  @spec challenge_claim(String.t(), list(map())) :: challenge()
  def challenge_claim(claim, evidence) do
    axiom_results =
      @nabla_axiom_mapping
      |> Enum.map(fn {axiom, _description} ->
        {axiom, check_axiom(axiom, evidence)}
      end)

    satisfied = Enum.filter(axiom_results, fn {_, v} -> v end) |> Enum.map(&elem(&1, 0))
    violated = Enum.filter(axiom_results, fn {_, v} -> not v end) |> Enum.map(&elem(&1, 0))

    confidence = length(satisfied) / length(Map.keys(@nabla_axiom_mapping))

    verdict = cond do
      length(violated) == 0 and confidence >= 0.95 -> :accepted
      length(violated) <= 2 and confidence >= 0.80 -> :challenged
      true -> :rejected
    end

    %{
      claim: claim,
      evidence_required: Map.keys(@nabla_axiom_mapping),
      evidence_provided: evidence,
      confidence: Float.round(confidence, 2),
      axioms_satisfied: satisfied,
      axioms_violated: violated,
      verdict: verdict
    }
  end

  defp check_axiom(:signal_plurality, evidence) do
    length(evidence) >= 2
  end

  defp check_axiom(:source_independence, evidence) do
    sources = Enum.map(evidence, & &1.source) |> Enum.uniq()
    length(sources) >= 2
  end

  defp check_axiom(:provenance_mandatory, evidence) do
    Enum.all?(evidence, &Map.has_key?(&1, :source))
  end

  defp check_axiom(:time_decay, evidence) do
    max_age_hours = 24 * 30
    Enum.all?(evidence, fn e ->
      DateTime.diff(DateTime.utc_now(), e.timestamp, :hour) < max_age_hours
    end)
  end

  defp check_axiom(_axiom, _evidence), do: true
end
```

## Operationalized Questioning Patterns

### Pattern 1: Architectural Decision Questioning

Every architectural decision must survive a structured questioning process before acceptance:

```elixir
defmodule Prismatic.Epistemic.ArchitecturalChallenge do
  @moduledoc """
  Structured questioning framework for architectural decisions.
  Every significant design choice must answer these challenges.
  """

  @mandatory_questions [
    "What evidence supports this design over alternatives?",
    "What assumptions does this design make about system behavior?",
    "What happens when those assumptions are violated?",
    "What are the failure modes and how are they handled?",
    "Has this been validated under adversarial conditions?",
    "What is the rollback strategy if this design proves wrong?",
    "What independent sources confirm this approach?",
    "What contradictory evidence exists and how is it addressed?"
  ]

  @type decision_record :: %{
    decision: String.t(),
    alternatives_considered: [String.t()],
    questions_answered: [{String.t(), String.t()}],
    evidence: [map()],
    assumptions: [String.t()],
    failure_modes: [String.t()],
    confidence: float(),
    trinity_gate_result: :passed | :failed
  }

  @spec challenge(String.t(), keyword()) :: decision_record()
  def challenge(decision, opts \\ []) do
    evidence = Keyword.get(opts, :evidence, [])
    alternatives = Keyword.get(opts, :alternatives, [])
    answers = Keyword.get(opts, :answers, %{})

    unanswered =
      @mandatory_questions
      |> Enum.filter(fn q -> not Map.has_key?(answers, q) end)

    case unanswered do
      [] ->
        build_decision_record(decision, alternatives, answers, evidence)

      questions ->
        raise ArgumentError,
          "Architectural decision incomplete. Unanswered questions: #{inspect(questions)}"
    end
  end

  defp build_decision_record(decision, alternatives, answers, evidence) do
    challenge_result = Prismatic.Epistemic.QuestionEverything.challenge_claim(decision, evidence)

    %{
      decision: decision,
      alternatives_considered: alternatives,
      questions_answered: Map.to_list(answers),
      evidence: evidence,
      assumptions: extract_assumptions(answers),
      failure_modes: extract_failure_modes(answers),
      confidence: challenge_result.confidence,
      trinity_gate_result: if(challenge_result.verdict == :accepted, do: :passed, else: :failed)
    }
  end
end
```

### Pattern 2: Code as Hypothesis

The Question Everything principle treats every line of code as a hypothesis about system behavior that must be validated through testing:

```elixir
defmodule Prismatic.Epistemic.CodeHypothesis do
  @moduledoc """
  Treats code as hypotheses that must be validated.
  Every function makes claims about system behavior;
  tests are the experiments that validate those claims.
  """

  @type hypothesis :: %{
    module: module(),
    function: atom(),
    claims: [String.t()],
    tests: [String.t()],
    validated: boolean(),
    confidence: float()
  }

  @spec analyze_module(module()) :: [hypothesis()]
  def analyze_module(module) do
    {:ok, functions} = fetch_public_functions(module)

    functions
    |> Enum.map(fn {name, arity} ->
      claims = extract_claims_from_spec(module, name, arity)
      tests = find_covering_tests(module, name, arity)

      %{
        module: module,
        function: name,
        claims: claims,
        tests: tests,
        validated: length(tests) > 0,
        confidence: calculate_test_confidence(claims, tests)
      }
    end)
  end

  defp extract_claims_from_spec(module, name, arity) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        specs
        |> Enum.filter(fn {{fn_name, fn_arity}, _} ->
          fn_name == name and fn_arity == arity
        end)
        |> Enum.flat_map(fn {_, spec_list} ->
          Enum.map(spec_list, &spec_to_claim/1)
        end)

      :error ->
        ["No @spec defined -- claims about this function are unverifiable"]
    end
  end

  defp calculate_test_confidence(claims, tests) do
    case {length(claims), length(tests)} do
      {0, _} -> 0.0
      {_, 0} -> 0.0
      {c, t} -> min(t / c, 1.0) |> Float.round(2)
    end
  end
end
```

### Pattern 3: Assumption Registry

The platform maintains an explicit registry of assumptions, transforming implicit assumptions into documented, monitorable artifacts:

```elixir
defmodule Prismatic.Epistemic.AssumptionRegistry do
  @moduledoc """
  Explicit registry of platform assumptions.
  Transforms implicit assumptions into documented,
  monitorable, and challengeable artifacts.
  """

  use GenServer

  @type assumption :: %{
    id: String.t(),
    description: String.t(),
    category: :performance | :reliability | :security | :compatibility | :behavioral,
    evidence: [map()],
    last_validated: DateTime.t(),
    validation_method: mfa(),
    risk_if_violated: :low | :medium | :high | :critical,
    status: :validated | :stale | :violated | :unverified
  }

  @impl true
  def init(_opts) do
    assumptions = load_assumption_registry()
    schedule_validation_sweep()
    {:ok, %{assumptions: assumptions}}
  end

  @spec register(map()) :: {:ok, String.t()} | {:error, term()}
  def register(assumption_params) do
    GenServer.call(__MODULE__, {:register, assumption_params})
  end

  @spec validate_all() :: [%{id: String.t(), status: atom()}]
  def validate_all do
    GenServer.call(__MODULE__, :validate_all, :timer.minutes(5))
  end

  @impl true
  def handle_call(:validate_all, _from, state) do
    results =
      state.assumptions
      |> Enum.map(fn {id, assumption} ->
        {module, function, args} = assumption.validation_method
        result = apply(module, function, args)

        updated = %{assumption |
          status: if(result, do: :validated, else: :violated),
          last_validated: DateTime.utc_now()
        }

        {id, updated}
      end)

    updated_assumptions = Map.new(results)

    violated =
      results
      |> Enum.filter(fn {_id, a} -> a.status == :violated end)
      |> Enum.map(fn {id, a} -> %{id: id, status: a.status, risk: a.risk_if_violated} end)

    if length(violated) > 0 do
      Prismatic.Quality.EventBus.emit(:assumption_violated, %{count: length(violated)}, %{violations: violated})
    end

    {:reply, Enum.map(results, fn {id, a} -> %{id: id, status: a.status} end),
     %{state | assumptions: updated_assumptions}}
  end

  @impl true
  def handle_info(:validation_sweep, state) do
    stale_assumptions =
      state.assumptions
      |> Enum.filter(fn {_id, a} ->
        DateTime.diff(DateTime.utc_now(), a.last_validated, :hour) > 24
      end)

    if length(stale_assumptions) > 0 do
      Prismatic.Quality.EventBus.emit(
        :assumptions_stale,
        %{count: length(stale_assumptions)},
        %{}
      )
    end

    schedule_validation_sweep()
    {:noreply, state}
  end

  defp schedule_validation_sweep do
    Process.send_after(self(), :validation_sweep, :timer.hours(6))
  end
end
```

## Application to Platform Operations

### Questioning Quality Metrics

Quality metrics themselves must be questioned. A quality score of 100/100 is meaningless if the underlying measurements are flawed:

| Question | Application |
|----------|-------------|
| Are the quality domains comprehensive? | Do 13 domains cover all quality dimensions that matter? |
| Are thresholds correctly calibrated? | Does zero-tolerance for all domains produce optimal outcomes? |
| Are measurements independent? | Do domains measure distinct aspects or redundant ones? |
| Are edge cases covered? | Do quality gates catch issues at system boundaries? |
| Is the scoring weighted correctly? | Do domain weights reflect actual quality impact? |
| Are there blind spots? | What quality issues exist that no domain measures? |

### Questioning Architectural Decisions

The platform's own architectural decisions are subject to the Question Everything principle:

```elixir
defmodule Prismatic.Epistemic.ArchitecturalAssumptions do
  @moduledoc """
  Documents and validates assumptions underlying
  the platform's core architectural decisions.
  """

  @platform_assumptions [
    %{
      id: "arch-001",
      assumption: "Umbrella application structure scales to 115+ apps",
      evidence: "Compilation time < 60s, test isolation maintained",
      validation: "mix compile --force timing + test independence verification",
      risk_if_wrong: :high,
      alternatives: ["Monolith", "Microservices", "Poncho projects"]
    },
    %{
      id: "arch-002",
      assumption: "ETS is sufficient for development-mode state storage",
      evidence: "Sub-millisecond reads, adequate for single-node development",
      validation: "Benchmark suite + memory usage monitoring",
      risk_if_wrong: :medium,
      alternatives: ["Redis", "Mnesia", "Agent-based storage"]
    },
    %{
      id: "arch-003",
      assumption: "Quality gates at pre-commit do not unacceptably slow development",
      evidence: "11-phase gate completes in < 30s for typical commits",
      validation: "Pre-commit timing telemetry + developer feedback",
      risk_if_wrong: :high,
      alternatives: ["Post-commit CI only", "Selective pre-commit", "Background checks"]
    },
    %{
      id: "arch-004",
      assumption: "Zero-tolerance thresholds produce better outcomes than tolerance bands",
      evidence: "Quality score maintained at 100/100 since Gen 15",
      validation: "Historical quality trajectory analysis",
      risk_if_wrong: :medium,
      alternatives: ["Configurable tolerance bands", "Progressive thresholds"]
    }
  ]

  @spec list_assumptions() :: [map()]
  def list_assumptions, do: @platform_assumptions

  @spec validate_assumption(String.t()) :: {:ok, map()} | {:error, String.t()}
  def validate_assumption(id) do
    case Enum.find(@platform_assumptions, &(&1.id == id)) do
      nil -> {:error, "Assumption #{id} not found"}
      assumption -> {:ok, run_validation(assumption)}
    end
  end
end
```

### Questioning Evidence Itself

The deepest application of Question Everything is questioning the evidence used to support conclusions. This creates a recursive verification structure:

| Level | What Is Questioned | Verification Method |
|-------|-------------------|-------------------|
| Level 0 | Raw measurements | Instrument calibration, collection correctness |
| Level 1 | Aggregated metrics | Aggregation algorithm verification |
| Level 2 | Threshold judgments | Threshold appropriateness analysis |
| Level 3 | Trend conclusions | Statistical validity assessment |
| Level 4 | Strategic decisions | Multi-source evidence requirement |
| Meta | The questioning process itself | Independent process audit |

## Integration with Color-Team Operations

### Red Team Application

The [Red Team](/glossary/red-team/) operationalizes Question Everything through adversarial simulation. By actively trying to break system assumptions, the Red Team discovers failure modes that passive monitoring misses.

### Blue Team Application

The [Blue Team](/glossary/blue-team/) applies Question Everything defensively, questioning whether security assumptions hold under observed conditions and whether defensive measures are actually effective.

### Purple Team Synthesis

The [Purple Team](/glossary/purple-team/) synthesizes questioning from both Red and Blue perspectives, identifying gaps where neither adversarial attack nor defensive monitoring has challenged a critical assumption.

## Usage in Prismatic Platform

### Commands and Workflows

```bash
# Validate platform assumptions
mix quality.gates                    # Challenge quality claims with evidence

# Challenge quality score
mix quality.enforce_standard --json  # Detailed per-dimension breakdown

# Challenge performance assumptions
mix performance.check                # Benchmark against thresholds

# Challenge compilation assumptions
mix compile --warnings-as-errors --force  # Verify zero-warning claim

# Challenge test coverage assumptions
mix test --cover                     # Verify coverage claims

# Challenge credo assumptions
mix credo --strict                   # Verify zero-violation claim

# Full platform questioning
mix autoheal.baseline                # Comprehensive evidence collection
```

### Implementing Question Everything in Code Reviews

When reviewing code, apply the principle systematically:

1. **Challenge assumptions**: What does this code assume about its inputs, environment, and dependencies?
2. **Challenge completeness**: What edge cases are not handled? What error paths are not tested?
3. **Challenge performance**: Is the performance assumption backed by benchmarks?
4. **Challenge security**: What trust boundaries does this code cross?
5. **Challenge necessity**: Is this code necessary, or does it solve a problem that does not actually exist?

## Best Practices

1. **Question assumptions, not people**. The principle targets beliefs and claims, never individuals. Questioning should be constructive and focused on improving the system, not demonstrating intellectual superiority.

2. **Prioritize questioning by risk**. Not every assumption deserves equal scrutiny. Focus questioning effort on high-risk assumptions where violation would cause significant damage.

3. **Document the answers**. Questioning is only valuable if the answers are captured. Use the Assumption Registry to record which assumptions have been validated, when, and by what method.

4. **Re-question periodically**. Assumptions that were valid yesterday may not be valid today. Schedule periodic re-validation of critical assumptions, especially after major changes.

5. **Automate where possible**. Manual questioning does not scale. Where assumptions can be expressed as testable properties, automate their validation through property-based testing, monitoring, or CI/CD gates.

6. **Accept validated conclusions**. Question Everything does not mean reject everything. Once a claim has survived rigorous questioning and passed the Trinity Gate, accept it with appropriate confidence and act decisively -- this is the transition from NABLA exploration to NO MERCY execution.

## Common Pitfalls

- **Analysis paralysis**: Questioning everything does not mean deciding nothing. The principle includes a confidence threshold (0.95 for critical decisions) beyond which questioning should yield to action.

- **Questioning as obstruction**: Using questions to block progress without genuine epistemic motivation is a misuse of the principle. Questions must be sincere and constructive.

- **Ignoring the meta-level**: Questioning every detail while never questioning the questioning process itself creates a blind spot. Periodically evaluate whether your questioning practices are effective.

- **Asymmetric questioning**: Questioning new ideas rigorously while leaving established assumptions unchallenged is a form of status quo bias. Apply equal scrutiny to existing beliefs and novel proposals.

- **Unfalsifiable claims**: Some claims are phrased in ways that make them impossible to disprove. Reject unfalsifiable claims as unscientific and reframe them as testable hypotheses.

## Historical Context in Prismatic Platform

The Question Everything principle has been operationalized progressively through platform generations:

| Generation | Advancement | Mechanism |
|-----------|-------------|-----------|
| Gen 1-5 | Manual code review | Ad hoc questioning during reviews |
| Gen 6-10 | Quality gates | Automated assumption validation at commit |
| Gen 11-14 | NABLA Infinity | Formal epistemic framework with axioms |
| Gen 15-17 | Trinity Gate | Three-pass verification for all claims |
| Gen 18-19 | Assumption Registry | Explicit tracking of platform assumptions |

## Related Concepts

- [Contradiction Preservation](/glossary/contradiction-preservation/) -- Preserving conflicting evidence rather than resolving prematurely
- [Signal Plurality](/glossary/signal-plurality/) -- Requiring multiple independent evidence sources
- [Trinity Gate](/glossary/trinity-gate/) -- Three-pass verification for claim validation
- [Proves Before Claiming](/glossary/proves-before-claiming/) -- Evidence-first approach to assertions
- [Truth Over Convenience](/glossary/truth-over-convenience/) -- Prioritizing accuracy over comfortable falsehoods
- [Scientific Rigor](/glossary/scientific-rigor/) -- Systematic methodology in engineering
- [Code as Hypothesis](/glossary/code-as-hypothesis/) -- Treating code as testable claims
- [Bayesian Reasoning](/glossary/bayesian-reasoning/) -- Evidence-weighted belief updating
- [Cherry Picking](/glossary/cherry-picking/) -- Anti-pattern of selective evidence use
- [Addiction Recovery](/glossary/addiction-recovery/) -- Epistemic vigilance against comfortable falsehoods

## See Also

- [Architecture](/architecture/) -- Platform architecture shaped by epistemic rigor
- [Technologies](/technologies/) -- Technology choices validated through questioning
- [Apps](/apps/) -- Applications built on verified assumptions

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
