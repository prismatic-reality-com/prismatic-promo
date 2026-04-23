+++
title = "Hypothesis Generation"
weight = 35
[extra]
category = "intelligence"
description = "Deterministic creation of multiple competing interpretations for a decision problem"
related_terms = ["decision-core", "scoring", "determinism"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 450
date_created = "2026-04-08"
date_modified = "2026-04-08"
quality_score = 85
difficulty = "intermediate"
tags = ["glossary", "hypothesis", "decision-core", "intelligence"]
image = "/images/sections/glossary.png"
image_alt = "Hypothesis Generation - Prismatic Platform"
see_also = ["architecture", "developers"]
keywords = ["hypothesis", "competing interpretations", "deterministic generation", "decision analysis"]
+++

## Definition

**Hypothesis Generation** is the process of creating multiple competing interpretations, routes, or answers for a given decision problem. In the Prismatic Decision Core, this is deterministic -- the same input always produces the same set of hypotheses.

## Technical Deep Dive

### Standard Hypothesis Set

For every decision input, the generator produces at minimum:

1. **Positive** ("Proceed") - The straightforward favorable interpretation
2. **Alternative** ("Defer") - A plausible alternative suggesting more information is needed
3. **Contrary** ("Reject") - The failure or negative scenario

Additional hypotheses are generated when:
- **Constraints are present** - A conditional proceed hypothesis is added
- **Rich structured data** (4+ fields) - A partial proceed (phased approach) hypothesis is added

### Hypothesis Structure

Each hypothesis includes:

```elixir
%{
  ordinal: 1,                          # Position in the set
  claim: "Proceed with...",            # The hypothesis statement
  reasoning_summary: "Because...",     # Brief justification
  assumptions: ["Market stable", ...], # What must be true
  supporting_signals: ["Revenue up"],  # Evidence in favor
  contradictory_signals: ["Risk X"]    # Evidence against
}
```

### Signal Extraction

Signals are extracted from:
- **Structured data fields** - Field existence and key names
- **Problem statement text** - Keyword matching for opportunity/growth/benefit signals
- **Constraints** - Constraint keys become conditional signals

### Determinism Guarantee

The generator uses no randomness. Signal extraction, hypothesis ordering, and claim construction are all deterministic functions of the input data.

## Related Terms

- [Decision Core](@/glossary/decision-core.md) - The full decision pipeline
- [Calibration Loop](@/glossary/calibration-loop.md) - Feedback from outcomes

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
