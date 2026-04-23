+++
title = "Decision Envelopes: Why Sealed Intelligence Beats Mutable Maps"
date = 2026-04-09
description = "The DecisionEnvelope pattern turns ephemeral analysis into auditable evidence. How Prismatic uses sealed envelopes, epistemic/aleatoric uncertainty decomposition, and closed-loop reconciliation to make decisions you can defend."

[extra]
author = "Tomáš Korcak (korczis)"
category = "architecture"
tags = ["decision-engine", "nabla-infinity", "uncertainty", "envelope", "architecture"]
reading_time = "8 min"
keywords = ["decision envelope", "sealed intelligence", "epistemic uncertainty", "Nabla Infinity"]
image = "/images/blog/decision-envelope.png"
featured = true
word_count = 540
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 35
see_also = ["genserver", "otp", "telemetry", "query-plan", "liveview"]
image_alt = "Decision Envelopes: Sealed Intelligence in Prismatic"
+++

Most analytics pipelines end in a `Map`. Prismatic's decision pipeline ends in a `DecisionEnvelope` — an immutable, provenance-tagged, uncertainty-decomposed record that the rest of the platform treats as ground truth. The distinction matters more than it sounds.

## The problem with mutable decisions

A mutable result is a liability. Any caller can mutate a field, drop a provenance tag, or round a confidence score. Six months later, when a regulator asks *why* the system flagged an entity, the answer is "we don't know — the map was rewritten."

Sealed envelopes solve this by construction:

```elixir
defmodule PrismaticDD.Decision.Envelope do
  @enforce_keys [:id, :fields, :confidence, :uncertainty, :provenance, :sealed_at]
  defstruct [:id, :fields, :confidence, :uncertainty, :provenance, :sealed_at]

  def seal(fields, opts) do
    %__MODULE__{
      id: UUID.uuid4(),
      fields: Enum.map(fields, &freeze/1),
      confidence: opts[:confidence],
      uncertainty: decompose_uncertainty(fields),
      provenance: opts[:provenance],
      sealed_at: DateTime.utc_now()
    }
  end
end
```

Once sealed, the envelope is the record. Downstream callers can reject it, but they cannot silently edit it. That is the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine in practice.

## Epistemic vs aleatoric uncertainty

A single confidence number hides two very different failure modes:

- **Epistemic** — uncertainty from *missing information*. Collect more data; it shrinks.
- **Aleatoric** — uncertainty from *noisy signal*. Collect more data; it does not shrink.

Treating them as the same number is how analysts end up "gathering more evidence" on problems that gathering cannot solve. Prismatic's `UncertaintyEstimator` decomposes them using bootstrap resampling and leave-one-out estimation, then stores both in the envelope:

```elixir
%DecisionEnvelope{
  confidence: 0.82,
  uncertainty: %{epistemic: 0.11, aleatoric: 0.07},
  ...
}
```

If epistemic dominates, the UI surfaces an "investigate further" affordance. If aleatoric dominates, it surfaces "decide now; more data won't help." That single distinction saves hours per case.

## Closed-loop reconciliation

Sealed does not mean forgotten. When an outcome arrives — the entity was sanctioned, the transaction did clear, the domain was malicious — the reconciliation loop attaches that outcome to the original envelope and updates the calibration of the scoring engine. Over time, the platform learns which source × query-type combinations are over- or under-confident.

This runs as a [GenServer](@/glossary/genserver.md) behind a `Task.Supervisor`, emits [telemetry](@/glossary/telemetry.md) per reconciliation, and never blocks the decision path. It is a background consumer, not a critical-path mutator — exactly how [OTP](@/glossary/otp.md) supervision trees are meant to be used.

## Where to learn more

- **Academy**: [Decision Core Fundamentals](/academy/learn/decision-core-fundamentals) — full walkthrough
- **Academy**: [Monte Carlo Fundamentals](/academy/learn/monte-carlo-fundamentals) — how uncertainty is estimated
- **Glossary**: [GenServer](@/glossary/genserver.md), [OTP](@/glossary/otp.md), [Telemetry](@/glossary/telemetry.md)

A decision you cannot defend is a decision you should not have made. Sealed envelopes are the difference between "we think" and "we can prove."
