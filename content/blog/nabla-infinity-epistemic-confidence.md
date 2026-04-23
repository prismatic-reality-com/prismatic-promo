+++
title = "Nabla Infinity: An Epistemic Confidence Framework for Intelligence"
date = 2026-03-20
description = "Inside the Nabla epistemic framework: how Prismatic quantifies certainty, decomposes uncertainty into epistemic and aleatoric components, and prevents intelligence analysts from overconfident conclusions."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["nabla", "epistemic", "confidence", "intelligence", "uncertainty", "bayesian"]
reading_time = "10 min"
keywords = ["epistemic confidence framework", "uncertainty quantification", "intelligence analysis confidence", "Bayesian confidence scoring", "aleatoric uncertainty", "Nabla Infinity"]
image = "/images/blog/nabla-epistemic.png"
word_count = 1800
date_created = "2026-03-20"
date_modified = "2026-03-20"
quality_score = 87
see_also = ["architecture", "capabilities", "osint"]
image_alt = "Nabla Infinity: An Epistemic Confidence Framework for Intelligence - Prismatic Platform"
+++

Intelligence analysis is the art of making decisions under uncertainty. The challenge is not just knowing facts -- it is knowing how much you can trust those facts. Nabla Infinity is Prismatic's epistemic confidence framework. It quantifies certainty, distinguishes between types of uncertainty, and prevents analysts from drawing overconfident conclusions from incomplete data.

## The Problem with Binary Confidence

Traditional OSINT tools present results as "found" or "not found." This binary framing loses critical information:

- A company found in the official business registry (high confidence)
- A company found via web scraping (lower confidence)
- A company mentioned in an unverified social media post (low confidence)

All three are "found," but the reliability differs dramatically. Decisions based on web scraping results should be made differently than decisions based on registry data.

## The Nabla Confidence Score

Every piece of intelligence in Prismatic carries a Nabla confidence score:

```elixir
%NablaConfidence{
  value: 0.87,              # Overall confidence [0.0, 1.0]
  epistemic: 0.05,          # Uncertainty from incomplete information
  aleatoric: 0.08,          # Uncertainty from inherent ambiguity
  sources: [:ares, :justice, :whois],
  evidence_count: 12,
  last_verified: ~U[2026-03-20 14:30:00Z]
}
```

The `value` is the headline confidence. The `epistemic` and `aleatoric` components explain why it is not 1.0.

## Epistemic vs. Aleatoric Uncertainty

This distinction is the core insight of the framework:

**Epistemic uncertainty** comes from incomplete information. It can be reduced by gathering more data:

- We found the company in ARES but have not checked Justice.cz yet
- The domain WHOIS is privacy-protected; we do not know the registrant
- The latest financial report is 18 months old

**Aleatoric uncertainty** comes from inherent randomness or ambiguity. No amount of additional data eliminates it:

- Two companies with identical names in the same city
- A person whose name matches a sanctions list entry but may be a different individual
- Future behavior predictions based on historical patterns

The practical difference: high epistemic uncertainty means "investigate further." High aleatoric uncertainty means "present both possibilities and let the analyst decide."

## Source-Based Confidence Tiers

Prismatic assigns base confidence based on data source category:

| Tier | Confidence | Sources |
|------|-----------|---------|
| Official Registry | 0.95 - 1.00 | ARES, Justice, EU official databases |
| Commercial Database | 0.80 - 0.94 | Shodan, OpenCorporates, credit agencies |
| Verified Web | 0.70 - 0.84 | LinkedIn verified profiles, company websites |
| Web Scraping | 0.50 - 0.69 | Social media, forums, news articles |
| Derived | 0.30 - 0.49 | Computed from other data (entity resolution) |
| Unverified | 0.00 - 0.29 | Anonymous sources, unconfirmed reports |

These tiers establish a floor. Multi-source confirmation raises confidence. Contradictions between sources lower it.

## Confidence Aggregation

When multiple sources report the same fact, confidence increases using a Bayesian model:

```elixir
defmodule PrismaticNabla.Aggregation do
  @doc "Aggregate confidence from independent sources"
  @spec aggregate([float()]) :: float()
  def aggregate(confidences) when is_list(confidences) do
    1.0 - Enum.reduce(confidences, 1.0, fn c, acc ->
      acc * (1.0 - c)
    end)
  end
end
```

Three sources at 0.80 each: `1 - (0.2 * 0.2 * 0.2) = 0.992`

This assumes source independence. When sources share upstream data (e.g., two services that both pull from ARES), we apply a correlation discount to avoid overcounting.

## Confidence Decay

Intelligence ages. A company's address verified 2 years ago is less reliable than one verified yesterday:

```elixir
def apply_decay(confidence, verified_at, decay_rate \\ 0.01) do
  days_since = Date.diff(Date.utc_today(), verified_at)
  decay_factor = :math.exp(-decay_rate * days_since)
  confidence * decay_factor
end
```

With the default decay rate:
- 30 days old: 97% of original confidence
- 90 days old: 91% of original confidence
- 365 days old: 69% of original confidence

This creates natural pressure to re-verify intelligence periodically.

## Decision Thresholds

Different decisions require different confidence levels:

| Decision Type | Minimum Confidence | Rationale |
|--------------|-------------------|-----------|
| Internal report | 0.50 | Exploratory, caveats acceptable |
| Client deliverable | 0.75 | Professional standard |
| Legal proceeding | 0.90 | Must withstand challenge |
| Automated action | 0.95 | No human review |

The framework does not make decisions -- it provides the confidence information that enables humans and automated systems to make appropriately calibrated decisions.

## Uncertainty Visualization

The platform displays confidence visually:

- **Green (0.80+)** -- high confidence, multiple sources confirm
- **Yellow (0.60-0.79)** -- moderate confidence, some gaps
- **Orange (0.40-0.59)** -- low confidence, significant uncertainty
- **Red (0.00-0.39)** -- unverified, treat with extreme caution

Each score is clickable, revealing the source breakdown, epistemic/aleatoric decomposition, and suggestions for reducing uncertainty.

## Integration with Decision Engine

The recently added Decision Engine consumes Nabla confidence scores directly:

```elixir
PrismaticDD.DecisionEngine.run_full_pipeline(%{
  entity: entity,
  confidence_threshold: 0.75,
  uncertainty_budget: 0.15
})
```

The decision engine factors confidence into its scoring, hypothesis generation, and recommendations. Low-confidence inputs produce appropriately hedged outputs.

## Conclusion

The Nabla Infinity framework transforms intelligence from "we found X" into "we are 87% confident about X, primarily limited by incomplete Justice.cz data (epistemic) and name ambiguity (aleatoric)." This precision enables better decisions at every level -- from analyst investigations to automated compliance checks.

---

*Explore the [Architecture Documentation](@/architecture/_index.md) for framework details or try the [Interactive Academy](@/academy/_index.md) for hands-on exercises with confidence scoring.*
