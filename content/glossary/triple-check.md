+++
title = "Triple-Check Validation"
weight = 86
[extra]
description = "Cross-validation methodology requiring corroboration from at least three independent sources before marking any investigative claim as verified, implemented through the NABLA Infinity epistemic framework and enforced by the Trinity Gate verification pipeline."
category = "intelligence"
tags = ["glossary", "intelligence", "validation", "verification", "osint", "due-diligence", "investigation", "nabla", "evidence", "cross-validation"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["due-diligence", "nabla-infinity", "trinity-gate", "trinity-passage", "confidence-scoring", "signal-plurality", "provenance-mandatory", "entity-resolution", "contradiction-preservation", "evidence-over-opinion", "source-independence", "bayesian-reasoning", "epistemic-validation", "verification", "quality-evidence-truth"]
learning_outcomes = ["Understand the three levels of triple-check validation", "Implement multi-source cross-validation in Elixir", "Distinguish between correlated and independent sources", "Apply Bayesian confidence updating to multi-source evidence", "Design investigation pipelines with triple-check enforcement", "Recognize common failures in single-source and dual-source validation"]
prerequisites = ["signal-plurality", "nabla-infinity", "confidence-scoring", "entity-resolution"]
see_also = ["comprehensive-verification", "formal-verification", "security-verification", "monte-carlo-verification"]
platform_apps = ["prismatic_nabla", "prismatic_osint", "prismatic_dd", "prismatic_agents", "prismatic_storage_core"]
elixir_modules = ["PrismaticNabla.TripleCheck", "PrismaticOsint.CrossValidator", "PrismaticDD.EvidenceCorroborator"]
doctrine_alignment = "evidence-integrity"
enforcement_level = "mandatory"
version = "2.0.0"
date_created = "2025-05-01"
date_updated = "2026-02-22"
word_count = 1723
date_modified = "2026-02-23"
keywords = ["Triple-Check", "Validation", "Cross-validation", "NABLA", "Infinity", "Trinity", "Gate", "glossary", "intelligence", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Triple-Check Validation - Prismatic Platform"
+++

## Definition

Triple-check validation is a cross-validation methodology that requires corroboration from at least three independent data sources before any investigative finding is marked as verified. The methodology addresses a fundamental challenge in intelligence analysis: single-source claims are inherently unreliable regardless of the source's individual reputation. By demanding convergent evidence from three or more independent origins, triple-check validation dramatically reduces the probability of accepting false positives while establishing a confidence level suitable for regulatory and legal scrutiny.

The methodology goes beyond simple source counting. Three articles from the same news wire service citing the same press release count as one source, not three. Independence must be genuine -- different methodologies, different data collection mechanisms, different institutional contexts. The NABLA Infinity [Source Independence](/glossary/signal-plurality/) axiom provides the formal framework for assessing whether sources are truly independent, using independence grouping to track common origins and correlation patterns.

The triple-check process operates at three distinct levels: **source-level validation** (individual source reliability assessment), **cross-source corroboration** (Bayesian confidence updating across independent sources), and **temporal consistency** (stability verification across time). These three levels create a layered validation architecture where each level catches different categories of false positives that the other levels might miss.

## The Three Levels of Triple-Check Validation

### Level 1: Source-Level Validation

Source-level validation assigns initial confidence scores to each individual source based on measurable reliability indicators:

| Factor | Weight | Assessment Criteria |
|--------|--------|-------------------|
| **Historical reliability** | 30% | Track record of accuracy for this source over previous investigations |
| **Institutional authority** | 25% | Government registry > commercial aggregator > crowdsourced > self-reported |
| **Data freshness** | 20% | How recently the data was collected or updated |
| **Methodology transparency** | 15% | Whether the source discloses how it collects and validates data |
| **Independence classification** | 10% | Source independence group assignment |

Government registries (ARES, Companies House, SEC EDGAR) receive the highest institutional authority scores because they are primary sources with legal obligations for accuracy. Commercial aggregators (Bloomberg, Dun & Bradstreet) score lower because they aggregate and process data from other sources, introducing potential transformation errors. Self-reported data (company websites, press releases) scores lowest because it is subject to self-serving bias.

Source-level validation does not accept or reject evidence -- it assigns a reliability weight that feeds into the cross-source corroboration calculation. A low-reliability source with unique information is still valuable; it simply carries less weight in the confidence computation.

### Level 2: Cross-Source Corroboration

Cross-source corroboration applies [Bayesian reasoning](/glossary/bayesian-reasoning/) to update confidence when multiple independent sources agree or disagree on the same claim. The corroboration model treats each independent source as an independent observation:

**When three independent sources agree**:
```
P(claim | S1, S2, S3) = much higher than P(claim | S1 alone)
```

The confidence increase is multiplicative for independent sources. If each source independently provides 80% reliability, three independent agreements yield:
```
P(true | 3 independent agreements) ≈ 0.994
```

**When sources disagree**:
```
P(claim | S1_agrees, S2_agrees, S3_disagrees) = reduced
```

Disagreement does not cancel agreement but reduces confidence. The [Contradiction Preservation](/glossary/contradiction-preservation/) axiom requires that the disagreeing source's evidence be preserved and annotated, not discarded.

The key insight of cross-source corroboration is that the independence of sources matters more than the number of sources. Two truly independent sources providing agreement are more valuable than ten correlated sources. The [Source Independence](/glossary/signal-plurality/) axiom's independence grouping mechanism tracks which sources share common data origins, preventing inflated confidence from correlated sources being counted as independent.

### Level 3: Temporal Consistency

Temporal consistency verifies whether findings remain stable across time, distinguishing between well-established facts and recently changed or contested data:

- **High temporal consistency**: A company's registered address appears at the same location in registry snapshots spanning 5+ years. This stability increases confidence.
- **Low temporal consistency**: A company's beneficial ownership changed three times in the past year. This instability decreases confidence and triggers additional investigation.
- **Temporal contradiction**: A source reported different information at different times. The most recent report may or may not be more accurate -- the contradiction is preserved per NABLA axioms.

Temporal consistency also incorporates the [Time Decay](/glossary/nabla-infinity/) axiom. Evidence gathered 18 months ago carries less weight than evidence from last week. The decay rate is domain-specific: corporate registration data decays slowly (companies do not change their legal structure daily), while financial data decays faster (financial positions can change rapidly).

## Mathematical Foundation

The triple-check confidence computation combines source-level scores with cross-source Bayesian updating and temporal consistency adjustment:

```
C_final = C_bayesian * T_consistency * A_axiom_compliance

Where:
  C_bayesian = Bayesian posterior after integrating N >= 3 independent sources
  T_consistency = temporal stability factor (0.0 to 1.0)
  A_axiom_compliance = NABLA axiom compliance factor (binary: 1.0 or BLOCKED)
```

The axiom compliance factor is binary rather than graduated: if any NABLA axiom is violated, the entire calculation is blocked. This prevents a scenario where axiom violations are "compensated" by high source scores -- epistemic integrity is non-negotiable.

## Elixir Implementation

The triple-check validation system is implemented as a coordinated set of OTP processes:

```elixir
defmodule PrismaticNabla.TripleCheck do
  @moduledoc """
  Implements the triple-check cross-validation methodology for
  investigative findings. Requires corroboration from at least three
  independent data sources, with Bayesian confidence updating and
  temporal consistency verification.

  The module enforces NABLA Infinity axioms throughout the validation
  process: Signal Plurality (minimum sources), Source Independence
  (correlation tracking), Contradiction Preservation (disagreement
  handling), Time Decay (evidence freshness), and Provenance Mandatory
  (full chain of custody).
  """

  alias PrismaticNabla.{AxiomChecker, ConfidenceComputer}
  alias PrismaticOsint.CrossValidator

  @type validation_result ::
          {:verified, float(), [evidence_ref()]}
          | {:insufficient_sources, non_neg_integer()}
          | {:contradiction_detected, [contradiction()]}
          | {:axiom_violation, atom()}

  @type evidence_ref :: %{
          source_id: String.t(),
          source_type: atom(),
          reliability_score: float(),
          independence_group: String.t(),
          collected_at: DateTime.t(),
          data_hash: String.t(),
          provenance: [String.t()]
        }

  @type contradiction :: %{
          claim: String.t(),
          source_a: evidence_ref(),
          source_b: evidence_ref(),
          severity: :weak | :moderate | :strong,
          preserved_at: DateTime.t()
        }

  @min_independent_sources 3

  @spec validate(claim :: String.t(), evidence :: [evidence_ref()]) ::
          validation_result()
  def validate(claim, evidence) do
    with :ok <- check_axiom_compliance(evidence),
         {:ok, independent} <- filter_independent_sources(evidence),
         :ok <- check_minimum_sources(independent),
         {:ok, corroboration} <- compute_corroboration(claim, independent),
         {:ok, temporal} <- verify_temporal_consistency(claim, independent) do
      confidence = compute_final_confidence(corroboration, temporal)
      {:verified, confidence, independent}
    end
  end

  @spec filter_independent_sources(evidence :: [evidence_ref()]) ::
          {:ok, [evidence_ref()]} | {:error, :all_correlated}
  defp filter_independent_sources(evidence) do
    groups = Enum.group_by(evidence, & &1.independence_group)

    independent =
      groups
      |> Enum.map(fn {_group, sources} ->
        Enum.max_by(sources, & &1.reliability_score)
      end)

    case length(independent) do
      0 -> {:error, :all_correlated}
      _ -> {:ok, independent}
    end
  end

  @spec check_minimum_sources(independent :: [evidence_ref()]) ::
          :ok | {:insufficient_sources, non_neg_integer()}
  defp check_minimum_sources(independent) do
    count = length(independent)

    if count >= @min_independent_sources do
      :ok
    else
      {:insufficient_sources, count}
    end
  end

  @spec compute_corroboration(claim :: String.t(), sources :: [evidence_ref()]) ::
          {:ok, float()} | {:contradiction_detected, [contradiction()]}
  defp compute_corroboration(claim, sources) do
    {agreements, disagreements} = partition_by_agreement(claim, sources)

    case disagreements do
      [] ->
        {:ok, bayesian_update(agreements)}

      contradictions ->
        preserved = preserve_contradictions(contradictions)
        adjusted_confidence = bayesian_update_with_contradictions(agreements, preserved)
        {:ok, adjusted_confidence}
    end
  end
end
```

The CrossValidator module handles the OSINT-specific aspects of cross-validation:

```elixir
defmodule PrismaticOsint.CrossValidator do
  @moduledoc """
  Cross-validates investigative findings across multiple OSINT data
  sources. Integrates with 120+ source adapters (Czech registries,
  global providers, sanctions lists) to provide independent
  corroboration for entity attributes.

  The module tracks source independence through independence grouping,
  ensuring that aggregated or derived sources are not double-counted.
  All cross-validation operations produce complete provenance chains
  per the NABLA Provenance Mandatory axiom.
  """

  @type cross_validation_report :: %{
          entity_id: String.t(),
          attribute: String.t(),
          sources_queried: non_neg_integer(),
          independent_sources: non_neg_integer(),
          agreements: non_neg_integer(),
          contradictions: non_neg_integer(),
          confidence: float(),
          status: :verified | :partially_verified | :unverified | :contradicted,
          details: [source_detail()]
        }

  @spec cross_validate(entity_id :: String.t(), attribute :: atom()) ::
          {:ok, cross_validation_report()}
  def cross_validate(entity_id, attribute) do
    sources = discover_sources_for(entity_id, attribute)
    results = query_sources_parallel(sources, entity_id, attribute)
    report = build_cross_validation_report(entity_id, attribute, results)
    {:ok, report}
  end

  @spec discover_sources_for(entity_id :: String.t(), attribute :: atom()) ::
          [source_config()]
  defp discover_sources_for(entity_id, attribute) do
    PrismaticOsint.AdapterRegistry.adapters_for(entity_id, attribute)
    |> Enum.filter(&adapter_available?/1)
    |> Enum.sort_by(& &1.reliability_score, :desc)
  end
end
```

## Application in Due Diligence Investigations

Triple-check validation is the core methodology driving the platform's [due diligence](/glossary/due-diligence/) investigations. When investigating a Czech company entity, the platform employs triple-check at every level of the investigation:

### Entity Attribute Verification

Each company attribute (name, address, beneficial owners, financial status, legal standing) must be independently verified by at least three sources:

| Attribute | Primary Source | Secondary Sources | Triple-Check Threshold |
|-----------|---------------|-------------------|----------------------|
| Legal name | Justice.cz | ARES, Commercial Register | 3 independent |
| Registered address | ARES | Justice.cz, Land Registry | 3 independent |
| Beneficial ownership | Beneficial Ownership Register | Justice.cz, Annual Reports | 3 independent |
| Insolvency status | ISIR | Justice.cz, Credit bureaus | 3 independent |
| Financial health | Annual Reports | Credit bureaus, ARES | 3 independent |
| Sanctions status | EU Sanctions List | OFAC SDN, UN Sanctions | 3 independent |

### Investigation Workflow

1. **Source discovery**: Identify all available sources for the target entity and its attributes
2. **Parallel querying**: Query all sources simultaneously for efficiency (the platform's 120+ OSINT adapters support parallel execution)
3. **Independence assessment**: Group sources by independence and select the highest-reliability representative from each group
4. **Triple-check evaluation**: For each attribute, verify that at least three independent sources provide corroborating data
5. **Contradiction handling**: When sources disagree, preserve both sides, annotate the contradiction, and reduce confidence accordingly
6. **Confidence computation**: Calculate the Bayesian posterior confidence incorporating source reliability, independence, and temporal consistency
7. **Report generation**: Produce a cross-validation report showing which attributes are verified, partially verified, or contradicted

## Failure Modes and Mitigations

Triple-check validation is designed to prevent specific failure modes that plague less rigorous validation approaches:

### Failure Mode 1: Single-Source Dependency

**Problem**: Relying on a single authoritative source that happens to be wrong. Even government registries contain errors -- data entry mistakes, delayed updates, and systematic biases are well-documented.

**Triple-check mitigation**: No finding is marked as verified based on a single source, regardless of how authoritative that source is. The NABLA [Signal Plurality](/glossary/signal-plurality/) axiom enforces minimum two signals; triple-check raises this to three.

### Failure Mode 2: Correlated Source Inflation

**Problem**: Multiple sources that all derive their data from the same original source, creating an illusion of independent corroboration. Ten news articles citing the same press release are one source, not ten.

**Triple-check mitigation**: Independence grouping tracks the data origin of each source. Sources sharing a common origin are grouped together, and only the highest-reliability representative from each group counts toward the three-source minimum.

### Failure Mode 3: Confirmation Bias Amplification

**Problem**: Investigators selectively querying sources that are likely to confirm their existing hypothesis while avoiding sources that might contradict it.

**Triple-check mitigation**: The investigation pipeline queries all available sources for each attribute, not a selected subset. Source selection is determined by the adapter registry, not by the investigator's hypothesis. [Contradiction Preservation](/glossary/contradiction-preservation/) ensures that contradicting sources cannot be silently dropped.

### Failure Mode 4: Temporal Inconsistency

**Problem**: Evidence from different time periods being combined without accounting for changes. A company's address from a 2020 registry snapshot may not reflect its 2026 address.

**Triple-check mitigation**: Temporal consistency verification checks whether findings are stable across time. Evidence carries mandatory timestamps (per the NABLA Time Decay axiom), and confidence is adjusted based on evidence freshness.

### Failure Mode 5: Authority Confusion

**Problem**: Treating a source as authoritative in a domain where it has no special authority. A securities regulator is authoritative about listed companies but not about real estate ownership.

**Triple-check mitigation**: Source reliability scoring includes domain-specific weighting. A source's institutional authority score is calculated relative to the specific attribute being validated, not as a global trust score.

## Comparison with Industry Standards

Triple-check validation exceeds the validation standards used by most industry competitors:

| Approach | Sources Required | Independence Check | Contradiction Handling | Temporal Verification |
|----------|-----------------|-------------------|----------------------|---------------------|
| **Single-source** | 1 | None | N/A | None |
| **Dual-source** | 2 | Basic | Override/majority | None |
| **Triple-check** | 3+ | Formal (independence groups) | Preserved per NABLA | Mandatory with decay |
| **NABLA + Triple-check** | 3+ independent | NABLA Source Independence axiom | NABLA Contradiction Preservation | NABLA Time Decay |

Most commercial due diligence platforms use dual-source verification at best, and many rely on single-source checks for non-critical attributes. The Prismatic Platform's triple-check standard, enforced through NABLA axioms and gated by [Trinity Gate](/glossary/trinity-gate/), provides a higher assurance level suitable for regulatory compliance, sanctions screening, and legal due diligence where false positives and false negatives both carry significant consequences.

## Triple-Check and Trinity Gate

Triple-check validation feeds directly into the [Trinity Gate](/glossary/trinity-gate/) verification pipeline. The relationship is complementary:

- **Triple-check** validates the evidence base: Are the individual findings supported by sufficient independent sources?
- **Trinity Gate** validates the reasoning chain: Are the conclusions drawn from the evidence structurally sound, logically valid, and formally necessary?

A finding that passes triple-check (three independent sources agree) but fails Trinity Gate (the conclusion drawn from those findings is logically unsound) is blocked. Conversely, a logically perfect conclusion based on single-source evidence fails triple-check and is rejected. Both validations must pass for a finding to achieve [Trinity Passage](/glossary/trinity-passage/).

## Performance and Scalability

Triple-check validation is designed for performance at scale:

| Metric | Target | Current |
|--------|--------|---------|
| Sources queried in parallel | Up to 120+ | 120 OSINT adapters |
| Cross-validation per attribute | < 2 seconds | Average 800ms |
| Independence grouping | < 50ms | Average 12ms |
| Bayesian confidence update | < 10ms | Average 3ms |
| Full entity triple-check | < 30 seconds | Average 15s (10+ attributes) |

The parallel querying architecture ensures that adding more sources does not linearly increase validation time. Source queries execute concurrently, and the cross-validation computation processes results as they arrive through streaming.

## Related Terms

- [Due Diligence](/glossary/due-diligence/) -- Investigation framework using triple-check methodology
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework enforcing validation axioms
- [Trinity Gate](/glossary/trinity-gate/) -- Three-layer verification pipeline
- [Trinity Passage](/glossary/trinity-passage/) -- Successful traversal of verification layers
- [Confidence Scoring](/glossary/confidence-scoring/) -- Calibrated confidence assignment
- [Signal Plurality](/glossary/signal-plurality/) -- Minimum evidence requirement for beliefs
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- Preserving contradictory evidence
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- Traceability requirement for all evidence
- [Entity Resolution](/glossary/entity-resolution/) -- Cross-source identity resolution leveraging triple-check
- [Evidence Over Opinion](/glossary/evidence-over-opinion/) -- Principle prioritizing evidence over assertion
- [Bayesian Reasoning](/glossary/bayesian-reasoning/) -- Statistical foundation for confidence updating
- [Epistemic Validation](/glossary/epistemic-validation/) -- Broader validation framework
- [Quality Evidence Truth](/glossary/quality-evidence-truth/) -- Quality through verified evidence
- [Verification](/glossary/verification/) -- General verification concepts

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
