+++
title = "Axiom"
weight = 50
[extra]
description = "A foundational proposition accepted as self-evidently true without proof, serving as the basis for logical deduction -- in the Prismatic Platform, the 7 NABLA Infinity axioms govern all epistemic operations"
category = "epistemic"
related_terms = ["confidence", "confidence-score", "counterexample", "assertion", "completeness", "consistency", "accuracy"]
tags = ["glossary", "axiom", "nabla", "epistemic", "logic", "formal-verification", "trinity-gate", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
difficulty = "advanced"
quality_score = 88
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The 7 NABLA Infinity axioms are non-negotiable epistemic foundations governing all belief formation, evidence evaluation, and decision-making in the Prismatic Platform"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["axiom", "NABLA Infinity", "epistemic axiom", "signal plurality", "contradiction preservation", "provenance mandatory", "formal logic", "foundation", "Trinity Gate"]
image = "/images/sections/glossary.png"
image_alt = "Axiom - Prismatic Platform"
word_count = 1050
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

An axiom is a foundational proposition or principle that is accepted as self-evidently true without requiring proof. In formal logic and mathematics, axioms form the irreducible base from which all theorems are derived. In epistemic frameworks, axioms define the rules governing how knowledge is acquired, validated, and maintained. Axioms are not proven -- they are chosen as the starting points of a logical system, and the system's validity depends on the consistency and completeness of its axiom set.

In the Prismatic Platform, the NABLA Infinity framework defines 7 non-negotiable axioms that govern all epistemic operations -- from OSINT intelligence assessment to quality gate evaluation to the Trinity Gate formal verification system.

## Technical Deep Dive

### The 7 NABLA Infinity Axioms

| # | Axiom | Enforcement | Description |
|---|-------|-------------|-------------|
| 1 | **Signal Plurality** | HARD | Minimum 2 independent signals required for belief formation |
| 2 | **Contradiction Preservation** | HARD | Both sides of contradictions must be preserved, never discarded |
| 3 | **Absence Informative** | SOFT | Missing signals are tracked as meaningful data points |
| 4 | **Time Decay** | HARD | All beliefs must carry timestamps; older evidence is weighted less |
| 5 | **Unknown Valid** | HARD | "I don't know" is a legitimate and respectable epistemic state |
| 6 | **Source Independence** | SOFT | Independent sources receive higher weight than correlated sources |
| 7 | **Provenance Mandatory** | HARD | All beliefs must be traceable to their originating evidence |

### Axiom Enforcement Levels

| Enforcement | Behavior on Violation | Recovery |
|-------------|----------------------|----------|
| **HARD** | Operation BLOCKED immediately | Correction required before proceeding |
| **SOFT** | WARNING logged, investigation triggered | Manual review recommended |

### Axiom Interaction with Trinity Gate

The Trinity Gate requires all claims to pass three independent verification stages. Each stage assumes the axioms hold:

```
Axioms (Foundation)
    ↓
Structural Consistency (Graph Theory) -- belief network is valid DAG
    ↓
Logical Consistency (Rule-Based) -- propositions follow logical rules
    ↓
Formal Necessity (Modal Logic + Lean4) -- claims proven in formal systems
    ↓
ESTABLISHED CLAIM
```

## Architecture and Implementation

```elixir
defmodule PrismaticNabla.AxiomValidator do
  @moduledoc """
  Validates claims against the 7 NABLA Infinity axioms.
  Hard axiom violations block the operation; soft violations
  emit warnings and log for investigation.
  """

  @type claim :: %{
          proposition: String.t(),
          evidence: [map()],
          sources: [String.t()],
          timestamps: [DateTime.t()],
          provenance: map()
        }

  @type validation_result :: :ok | {:violation, atom(), String.t()}

  @spec validate_all(claim()) :: :ok | {:violations, [validation_result()]}
  def validate_all(claim) do
    violations =
      [
        validate_signal_plurality(claim),
        validate_contradiction_preservation(claim),
        validate_time_decay(claim),
        validate_unknown_valid(claim),
        validate_provenance_mandatory(claim)
      ]
      |> Enum.reject(&(&1 == :ok))

    if Enum.empty?(violations), do: :ok, else: {:violations, violations}
  end

  @spec validate_signal_plurality(claim()) :: :ok | {:violation, atom(), String.t()}
  defp validate_signal_plurality(%{sources: sources}) do
    unique_sources = Enum.uniq(sources)

    if length(unique_sources) >= 2 do
      :ok
    else
      {:violation, :signal_plurality, "Minimum 2 independent sources required, got #{length(unique_sources)}"}
    end
  end

  @spec validate_time_decay(claim()) :: :ok | {:violation, atom(), String.t()}
  defp validate_time_decay(%{timestamps: timestamps}) do
    if Enum.all?(timestamps, &is_struct(&1, DateTime)) do
      :ok
    else
      {:violation, :time_decay, "All evidence must carry valid timestamps"}
    end
  end

  @spec validate_provenance_mandatory(claim()) :: :ok | {:violation, atom(), String.t()}
  defp validate_provenance_mandatory(%{provenance: provenance}) when map_size(provenance) > 0 do
    :ok
  end

  defp validate_provenance_mandatory(_claim) do
    {:violation, :provenance_mandatory, "All beliefs must be traceable to originating evidence"}
  end
end
```

## Usage in Prismatic Platform

- **NABLA Framework**: All 7 axioms enforced across epistemic operations platform-wide
- **Trinity Gate**: Axiom compliance is a prerequisite for Trinity Gate passage
- **OSINT Intelligence**: Signal plurality and source independence axioms govern multi-source fusion
- **Blue Team Defense**: Contradiction preservation axiom prevents premature threat dismissal
- **Quality Gates**: Axiom-inspired quality checks (provenance for all quality claims)
- **Purple Team Synthesis**: Closure analysis validates axiom compliance in Red-Blue loop

## Code Examples

### Axiom-Aware Evidence Evaluator

```elixir
defmodule PrismaticNabla.EvidenceEvaluator do
  @moduledoc """
  Evaluates evidence strength with axiom-aware weighting.
  Applies time decay, source independence, and plurality requirements.
  """

  @spec evaluate(list(map())) :: {:ok, float()} | {:error, :axiom_violation}
  def evaluate(evidence_items) when length(evidence_items) < 2 do
    {:error, :axiom_violation}
  end

  def evaluate(evidence_items) do
    weighted_score =
      evidence_items
      |> Enum.map(fn item ->
        time_weight = compute_time_decay(item.timestamp)
        source_weight = if item.independent, do: 1.0, else: 0.7
        item.confidence * time_weight * source_weight
      end)
      |> then(fn scores -> Enum.sum(scores) / length(scores) end)

    {:ok, Float.round(weighted_score, 4)}
  end

  @spec compute_time_decay(DateTime.t()) :: float()
  defp compute_time_decay(timestamp) do
    age_hours = DateTime.diff(DateTime.utc_now(), timestamp, :hour)
    :math.exp(-0.001 * age_hours)
  end
end
```

## Best Practices

1. **Never bypass HARD axioms**: Hard axiom enforcement exists to prevent epistemic failures. There are no exceptions.
2. **Document axiom choice rationale**: When designing a formal system, explain why each axiom was chosen and what it prevents.
3. **Minimize axiom set**: Keep the axiom set as small as possible while maintaining completeness. Redundant axioms create maintenance burden.
4. **Test axiom enforcement**: Write tests that deliberately violate each axiom and verify the system correctly blocks the operation.
5. **Track soft violations**: Soft axiom violations are warnings, not ignorable noise. Monitor and investigate trends.

## Related Terms

- **Confidence** -- certainty levels governed by axiom requirements
- **Confidence Score** -- numeric expression of axiomatic confidence
- **Counterexample** -- evidence that challenges established axiom-based beliefs
- **Consistency** -- axiom set property ensuring no contradictions
- **Completeness** -- axiom set property ensuring all truths are derivable

## See Also

- [Trinity Gate](/glossary/trinity-gate/) -- three-stage verification requiring axiom compliance
- [NABLA Infinity Doctrine](/glossary/nabla-infinity/) -- the epistemic framework
- **Addiction Preservation** -- contradiction preservation principle

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
