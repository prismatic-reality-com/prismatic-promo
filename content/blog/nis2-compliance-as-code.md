+++
title = "NIS2 Compliance as Code: Turning a Directive Into a Pipeline"
date = 2026-04-09
description = "NIS2 is not a PDF to read — it's a set of obligations that can be modeled as data, checked by pipelines, and proven by evidence. How Prismatic turns Czech NIS2/ZKB compliance into something you can actually run in CI."

[extra]
author = "Tomáš Korcak (korczis)"
category = "security"
tags = ["nis2", "compliance", "zkb", "czech", "pipeline"]
reading_time = "8 min"
keywords = ["NIS2 compliance", "ZKB Czech cybersecurity act", "compliance as code", "Prismatic compliance"]
image = "/images/blog/nis2-code.png"
featured = true
word_count = 550
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 35
see_also = ["nis2", "compliance", "easm", "risk-assessment", "evidence"]
image_alt = "NIS2 Compliance as Code"
+++

Most [NIS2](@/glossary/nis2.md) programs start as a spreadsheet and end as a spreadsheet. That is a choice — not a fate. The directive and its Czech implementation (ZKB, Zákon o kybernetické bezpečnosti) describe obligations that map cleanly onto data structures and pipelines. Treat them that way and [compliance](@/glossary/compliance.md) stops being a quarterly fire drill.

## The three things that stay true

Strip NIS2 down and three obligations show up in every obligation table:

1. **You must know what you own.** Assets, dependencies, suppliers. Discoverable and current.
2. **You must know what can go wrong.** Threats, risks, scenarios. Ranked and revisited.
3. **You must prove you did something about it.** Controls, tests, incidents. With timestamps.

If any of the three cannot be answered in under a minute with live data, the program is failing silently.

## Obligation as a struct

Every obligation becomes a struct the compliance engine can reason about:

```elixir
%Obligation{
  id: "ZKB-2024-§11-risk-assessment",
  title: "Annual risk assessment required",
  evidence_types: [:risk_register, :approval_signature, :review_date],
  freshness: {:days, 365},
  severity: :high,
  check: &Checks.risk_assessment_current?/1
}
```

The `check` is a pure function over the evidence store. It either passes or fails with a concrete reason — never "yellow". Yellow is how compliance dies.

## Evidence is a first-class citizen

An obligation without [evidence](@/glossary/evidence.md) is aspirational. Every evidence record carries a type, a provenance, a validity window, and a pointer to the artifact:

```elixir
%Evidence{
  obligation_id: "ZKB-2024-§11-risk-assessment",
  type: :risk_register,
  source: :gitlab,
  artifact_url: "https://gitlab.com/.../risk-register-2026-Q1.md",
  valid_from: ~D[2026-01-15],
  valid_until: ~D[2027-01-15],
  signed_by: "ciso@example.cz",
  signature: "..."
}
```

The compliance engine joins obligations to evidence, filters by freshness, and emits a status *per obligation* every time CI runs. The dashboard is a read model over this join — nothing more, nothing less.

## Feeding from EASM, DD, and telemetry

Three upstream systems feed the evidence store automatically:

- **[EASM](@/glossary/easm.md)** — asset inventory, exposure findings, remediation timestamps.
- **DD pipelines** — supplier [risk assessments](@/glossary/risk-assessment.md), beneficial ownership snapshots.
- **Telemetry** — incident counts, mean time to detection, mean time to remediation.

Each feed writes evidence records with provenance. The compliance engine never invents data. If a feed stops, the obligations it backed go *stale* — not "still green because nobody noticed."

## The regulator test

The test is simple: a regulator asks *"can you show me the current status of obligation X and the evidence that supports it?"* If the answer involves opening Excel, the program is failing. If the answer is a URL to a live dashboard showing the status plus a link to every signed artifact — that is compliance as code.

## Where to go next

- **Academy**: [EASM Development](/academy/learn/easm-development) — the asset-side feed
- **Academy**: [DD Investigation](/academy/learn/dd-investigation) — the supplier-side feed
- **Glossary**: [NIS2](@/glossary/nis2.md), [Compliance](@/glossary/compliance.md), [EASM](@/glossary/easm.md), [Risk Assessment](@/glossary/risk-assessment.md), [Evidence](@/glossary/evidence.md)

The directive is long. The pattern is short. Obligations + evidence + checks + freshness. Everything else is presentation.
