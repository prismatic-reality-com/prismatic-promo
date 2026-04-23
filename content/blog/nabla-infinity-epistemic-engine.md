+++
title = "Nabla Infinity: An Epistemic Engine for Intelligence Platforms"
date = 2026-04-09
description = "Most platforms track what they know. Prismatic also tracks what it doesn't — and why. Nabla Infinity is the epistemic engine that turns uncertainty into a first-class signal."

[extra]
author = "Tomáš Korcak (korczis)"
category = "architecture"
tags = ["nabla-infinity", "epistemic", "uncertainty", "reasoning", "architecture"]
reading_time = "8 min"
keywords = ["Nabla Infinity", "epistemic reasoning", "uncertainty quantification", "intelligence platform"]
image = "/images/blog/nabla-infinity.png"
word_count = 540
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 35
see_also = ["nabla-infinity", "epistemic-reasoning", "epistemic-validation", "evidence", "confidence"]
image_alt = "Nabla Infinity Epistemic Engine"
+++

Most intelligence platforms are maximum-likelihood machines. They tell you *what* they think. [Nabla Infinity](@/glossary/nabla-infinity.md) (∇∞) is different: it also tells you *how* it knows, what would change its mind, and which parts of its answer are load-bearing. That is [epistemic reasoning](@/glossary/epistemic-reasoning.md), and it is the difference between an analyst tool and an opinion generator.

## Axioms, not heuristics

∇∞ is defined by a small set of axioms that every component of Prismatic must honor. Three are doing most of the work:

1. **Provenance is mandatory.** Every claim carries the source(s) that produced it. A claim with no provenance is not a claim; it is a guess.
2. **Uncertainty is decomposed.** Epistemic (reducible by more data) is separated from aleatoric (irreducible noise). A single "confidence" number is a bug.
3. **Retraction is cheap.** When new [evidence](@/glossary/evidence.md) contradicts an earlier claim, the older claim is *retracted*, not overwritten. The history survives.

These axioms are enforced by `mix nabla.verify`, which walks the call graph and fails CI if any decision path produces a claim that violates them.

## The shape of an epistemic claim

```elixir
%EpistemicClaim{
  statement: "Entity X is a subsidiary of Entity Y",
  confidence: 0.78,
  uncertainty: %{epistemic: 0.14, aleatoric: 0.08},
  provenance: [
    %{source: "czech-ares", ts: ~U[...], tier: :t1},
    %{source: "cross-shareholding-analysis", ts: ~U[...], tier: :t2}
  ],
  contradictions: [],
  retractable: true,
  retraction_trigger: "ARES update contradicting ownership"
}
```

Notice what is *not* there: no boolean "true/false". Intelligence is not boolean. An analyst who treats it as boolean will eventually be wrong in a way that matters.

## Retraction in practice

When a new signal arrives, the engine runs a contradiction check. If it contradicts an existing claim strongly enough, the claim is retracted and a new one takes its place — with a back-pointer to the retracted claim:

```elixir
%EpistemicClaim{
  statement: "Entity X is NOT a subsidiary of Entity Y",
  confidence: 0.91,
  retracts: "claim_01HX...",
  retraction_reason: "ARES snapshot 2026-04-09 shows direct ownership dissolved"
}
```

The UI then surfaces both: the current claim *and* the retracted one. Hiding retractions is how platforms lose trust.

## Why this matters for AI

LLM outputs are a firehose of confidence-free claims. Running them through ∇∞ forces them to wear their provenance on the outside: which source grounded which span, which spans had no grounding, which claims were retracted by later evidence. That single constraint eliminates most hallucination downstream — not because the model stops hallucinating, but because ungrounded claims never get past the envelope seal.

## Where to go next

- **Academy**: [Nabla Infinity Guide](/academy/learn/nabla-infinity-guide) — the full axiom set + runnable examples
- **Academy**: [Monte Carlo Fundamentals](/academy/learn/monte-carlo-fundamentals) — how uncertainty is estimated
- **Glossary**: [Nabla Infinity](@/glossary/nabla-infinity.md), [Epistemic Reasoning](@/glossary/epistemic-reasoning.md), [Epistemic Validation](@/glossary/epistemic-validation.md), [Evidence](@/glossary/evidence.md), [Confidence](@/glossary/confidence.md)

Know what you know. Know what you don't. Track both. Everything else is noise.
