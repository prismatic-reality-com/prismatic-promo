+++
title = "Decision Core: Closing the Loop Between Intelligence and Outcome"
date = 2026-04-09
description = "The decision core is the thinnest layer of Prismatic — and the one that matters most. Six pipeline stages, one sealed envelope, and a reconciliation loop that makes the whole platform learn from its own mistakes."

[extra]
author = "Tomáš Korcak (korczis)"
category = "architecture"
tags = ["decision-core", "reconciliation", "uncertainty", "pipeline", "architecture"]
reading_time = "8 min"
keywords = ["decision core", "reconciliation loop", "closed loop intelligence", "Prismatic DD"]
image = "/images/blog/decision-core.png"
featured = true
word_count = 560
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 36
see_also = ["decision-core", "evidence", "confidence", "provenance", "pipeline"]
image_alt = "Decision Core Closed Loop"
+++

Most platforms produce outputs and move on. The [decision core](@/glossary/decision-core.md) in Prismatic does something different: it remembers what it decided, waits for the outcome, and adjusts its own confidence whenever the outcome disagrees with the prediction. That is the difference between a pipeline and a system that learns.

## The six stages

The decision [pipeline](@/glossary/pipeline.md) is deliberately boring: six stages, each with a single responsibility, each emitting telemetry at entry and exit.

```
Ingest  →  Score  →  Hypothesize  →  Estimate Uncertainty  →  Recommend  →  Seal
```

- **Ingest.** Collect the evidence envelope(s) the upstream gatherer produced.
- **Score.** Apply calibrated scorers per claim type. Calibrated means the scorer has a learned history, not a hand-tuned weight.
- **Hypothesize.** Generate alternative explanations for the evidence. A hypothesis nobody wrote down is a bias nobody caught.
- **Estimate Uncertainty.** Decompose into epistemic and aleatoric. Bootstrap over the evidence, leave-one-out over the scorers.
- **Recommend.** Produce the recommended action, with the top contributing [evidence](@/glossary/evidence.md) items attached.
- **Seal.** Freeze everything into an immutable envelope with full [provenance](@/glossary/provenance.md).

Each stage is a pure function from envelope to envelope. The pipeline is `Enum.reduce/3` over the stages. Failures short-circuit with an error envelope — never a silent partial result.

## Calibration is not "tune the weights"

A scorer that returns 0.9 "confident" results that turn out wrong 40% of the time is *miscalibrated*, not unlucky. The reconciliation loop fixes this: every outcome that arrives is joined back to the envelope that predicted it, and the calibration table per (scorer × claim-type) is updated.

```elixir
defmodule PrismaticDD.Decision.Reconciliation do
  def reconcile(envelope_id, outcome) do
    envelope = Repo.get!(DecisionEnvelope, envelope_id)
    for scorer <- envelope.scorers do
      Calibration.update(scorer.id, scorer.claim_type, scorer.score, outcome)
    end
  end
end
```

Over months, the calibration table becomes the most valuable asset in the platform. It encodes how wrong each scorer is, where, and when. A new scorer starts uncalibrated and its influence is capped until it earns a history.

## Hypotheses keep the model honest

The hypothesize stage is what most pipelines skip. It forces the engine to produce *alternatives* to the leading interpretation and check whether the evidence actually rules them out. If it doesn't — if the evidence is consistent with two stories — the envelope ships with both, and the [confidence](@/glossary/confidence.md) drops accordingly.

The cost is a few extra milliseconds per decision. The benefit is that the engine stops confidently preferring whichever story happens to be ranked first.

## The seal

The final stage is non-negotiable. Once sealed, an envelope is immutable. Any later correction creates a *new* envelope that retracts the earlier one; nothing overwrites. This is the property that makes the reconciliation loop trustworthy — because if you could silently edit an old decision, you could silently rewrite your own calibration history.

## Where to go next

- **Academy**: [Decision Core Fundamentals](/academy/learn/decision-core-fundamentals) — end-to-end walkthrough
- **Academy**: [Monte Carlo Fundamentals](/academy/learn/monte-carlo-fundamentals) — the uncertainty math
- **Glossary**: [Decision Core](@/glossary/decision-core.md), [Evidence](@/glossary/evidence.md), [Confidence](@/glossary/confidence.md), [Provenance](@/glossary/provenance.md), [Pipeline](@/glossary/pipeline.md)

Six boring stages. One sealed envelope. One learning loop. The whole game.
