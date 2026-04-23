+++
title = "Prismatic 3NL"
weight = 22
[extra]
icon = "language"
color = "cyan"
description = "Three Natural Language framework for epistemic processing and semantic analysis"
category = "Intelligence"
files = "290"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1258
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "3NL", "Three", "Natural", "Language", "apps", "Intelligence", "Prismatic Platform", "Level", "Czech"]
tags = ["apps", "intelligence", "prismatic-3nl", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic 3NL - Prismatic Platform"
+++

## Abstract

Prismatic [3NL](/glossary/three-nl/) (Three Natural Language) is the platform's epistemic natural language processing framework, implementing a three-level pipeline that transforms raw text through syntactic analysis (Level 1), semantic interpretation (Level 2), and epistemic verification (Level 3). Unlike conventional NLP systems that terminate at entity extraction or sentiment analysis, 3NL extends processing into the epistemic domain where extracted claims are assessed for truth value, assigned confidence scores, and verified against independent sources per the NABLA axiom framework. The system processes Czech and English text with full diacritics support, cross-language [entity resolution](/glossary/entity-resolution/), and transliteration normalization. Each processing level produces typed output that serves as input to the next, with provenance metadata propagated through the entire pipeline. The framework powers intelligence extraction from [OSINT](/glossary/osint/) sources, report generation with epistemic confidence annotations, and [knowledge graph](/glossary/knowledge-graph/) population from unstructured text.

## 1. Introduction

### 1.1 Problem Statement

Intelligence analysis relies heavily on unstructured text from diverse sources: news articles, government filings, social media posts, corporate disclosures, and technical reports. Extracting actionable intelligence from this text requires more than entity recognition and relationship extraction. Analysts need to know not just what claims a document makes, but how confident they can be in those claims, whether independent sources corroborate them, and how the claims relate to existing knowledge. Standard NLP pipelines stop at the semantic level, leaving epistemic assessment as a manual analytical step.

Prismatic 3NL automates this epistemic layer, producing intelligence output where every extracted fact carries a confidence score, source provenance, and cross-reference to corroborating or contradicting evidence.

### 1.2 Design Goals

1. **Three-level processing pipeline** -- syntactic, semantic, and epistemic processing as distinct, composable stages.
2. **Epistemic integration** -- NABLA axiom enforcement at the processing level, with [confidence scoring](/glossary/confidence-scoring/) and provenance tracking for all extracted facts.
3. **Bilingual support** -- full Czech and English processing with cross-language entity resolution.
4. **Pipeline composability** -- each level can be invoked independently or as part of the full pipeline.
5. **Provenance propagation** -- every output datum carries complete lineage from source text through each processing stage.
6. **Knowledge graph integration** -- extracted entities and relationships are structured for direct ingestion into [Prismatic Graph](/apps/prismatic-graph/).

### 1.3 Scope

Prismatic 3NL covers text processing from raw input through epistemic verification. It does not implement speech-to-text (handled by [Prismatic Audio](/apps/prismatic-audio/)), image text extraction, or language translation. Cross-language entity resolution operates on pre-extracted entities, not full document translation.

## 2. Architecture

### 2.1 System Design

```
Raw Text Input
       |
  L1: Syntactic Processor
  (Tokenization, POS tagging, NER, Parse tree)
       |
  L2: Semantic Analyzer
  (Relationship extraction, Context resolution, Coreference)
       |
  L3: Epistemic Verifier
  (Truth assessment, Confidence scoring, Source verification)
       |
  Verified Intelligence Output
  (Claims + Confidence + Provenance + Cross-references)
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `Prismatic3NL` | Public facade: `process/2`, `extract_entities/1`, `analyze_semantics/1`, `verify_claims/2` |
| `Prismatic3NL.Syntactic` | Level 1: [tokenization](/glossary/tokenization/), part-of-speech tagging, named entity recognition, parse tree construction |
| `Prismatic3NL.Semantic` | Level 2: relationship extraction, context resolution, coreference resolution, temporal anchoring |
| `Prismatic3NL.Epistemic` | Level 3: claim extraction, truth value assessment, confidence scoring, source cross-verification |
| `Prismatic3NL.Czech` | Czech language specialization: diacritics handling, ICO/DIC recognition, legal entity type parsing |
| `Prismatic3NL.EntityResolver` | Cross-language entity resolution and normalization |
| `Prismatic3NL.ProvenanceTracker` | Pipeline-wide provenance metadata propagation |
| `Prismatic3NL.ConfidenceEngine` | NABLA-compliant confidence scoring and propagation |

### 2.3 Process Topology

```
Prismatic3NL.Application (Supervisor, :one_for_one)
+-- Prismatic3NL.Pipeline (GenServer)
|     Pipeline orchestration and level sequencing
+-- Prismatic3NL.EntityCache (GenServer)
|     ETS-backed entity resolution cache
+-- Prismatic3NL.ConfidenceEngine (GenServer)
|     Confidence computation with NABLA axiom enforcement
+-- Task.Supervisor
      Parallel document processing
```

### 2.4 Data Flow

Text enters through the facade, which routes it through the three levels sequentially. Level 1 tokenizes the text, identifies entities, and constructs a parse tree. Level 2 resolves relationships between entities, resolves coreferences, and anchors temporal expressions. Level 3 extracts explicit and implicit claims, assesses their truth values against the knowledge base, scores confidence using the NABLA plurality axiom, and attaches source provenance. The output is a structured intelligence document with claims, confidence scores, and cross-references.

## 3. Implementation

### 3.1 Key Algorithms

**Entity Resolution**. Cross-language entity resolution matches Czech and English references to the same entity using normalized names, known aliases, and contextual disambiguation. The resolver maintains an entity cache in [ETS](/glossary/ets/) for fast lookup and uses fuzzy matching with configurable thresholds for names that differ only in transliteration.

**Confidence Propagation**. When a claim derived at Level 3 depends on entities or relationships extracted at Levels 1 and 2, the confidence of the derived claim is bounded by the minimum confidence of its constituent parts. This ensures that uncertain entity extraction does not produce high-confidence conclusions.

### 3.2 Data Structures

```elixir
defmodule Prismatic3NL.VerifiedClaim do
  @type t :: %__MODULE__{
    claim: String.t(),
    subject: Entity.t(),
    predicate: atom(),
    object: Entity.t() | term(),
    confidence: float(),
    truth_value: :verified | :plausible | :unverified | :contradicted,
    sources: [Source.t()],
    provenance: Provenance.t(),
    temporal_anchor: DateTime.t() | nil,
    corroborating: [reference()],
    contradicting: [reference()]
  }
end
```

### 3.3 API Surface

```elixir
# Full 3NL pipeline
@spec process(String.t(), keyword()) :: {:ok, IntelligenceDocument.t()} | {:error, term()}
Prismatic3NL.process("Company XYZ received a 10M CZK subsidy", level: 3)

# Level 1: Entity extraction
@spec extract_entities(String.t()) :: {:ok, [Entity.t()]}
Prismatic3NL.extract_entities(text)

# Level 2: Semantic analysis
@spec analyze_semantics(String.t()) :: {:ok, SemanticGraph.t()}
Prismatic3NL.analyze_semantics(text)

# Level 3: Epistemic verification
@spec verify_claims([Claim.t()], keyword()) :: {:ok, [VerifiedClaim.t()]}
Prismatic3NL.verify_claims(claims, sources: evidence)
```

### 3.4 Configuration

```elixir
config :prismatic_3nl,
  default_level: 3,
  languages: [:en, :cs],
  confidence_threshold: 0.6,
  entity_cache_ttl: :timer.hours(24),
  max_document_length: 100_000,
  nabla_enforcement: :strict,
  knowledge_base: :prismatic_graph
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Nabla](/apps/prismatic-nabla/) | Confidence scoring axiom enforcement |
| [Prismatic Graph](/apps/prismatic-graph/) | Knowledge base for claim verification |
| [Prismatic Storage](/apps/prismatic-storage/) | Entity and claim persistence |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | Intelligence extraction from source text |
| [Prismatic Compliance](/apps/prismatic-compliance/) | Regulatory document analysis |
| [Prismatic Narrative](/apps/prismatic-narrative/) | Report generation with epistemic annotations |

### 4.3 Inter-Process Communication

Document processing tasks are dispatched via Task.[Supervisor](/glossary/supervisor/) for parallelism. The entity cache is shared via ETS for concurrent access. Confidence engine interactions are synchronous [GenServer](/glossary/genserver/) calls to maintain scoring consistency.

### 4.4 External Integrations

No external NLP services are used; all processing runs locally for data sovereignty. Language models are loaded at boot time from bundled resources.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| L1 Syntactic (per document) | 10-50ms | Depends on document length |
| L2 Semantic (per document) | 20-100ms | Depends on entity density |
| L3 Epistemic (per document) | 50-200ms | Depends on claim count and KB queries |
| Full pipeline (per document) | 80-350ms | Sum of three levels |
| Entity resolution (cached) | < 1ms | ETS lookup |

### 5.2 Scalability

Document processing is stateless per document and parallelizes linearly via Task.Supervisor. The entity cache improves performance for repeated entity lookups across documents in a batch.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 256 MB | 1 GB (with language models) |
| CPU | 2 cores | 4 cores |

## 6. Testing Strategy

### 6.1 Unit Tests

Each processing level has tests with annotated corpora (gold-standard entity, relationship, and claim annotations) to verify extraction accuracy. Czech-specific tests cover diacritics handling and legal entity recognition.

### 6.2 Integration Tests

Full pipeline tests exercise the three-level sequence with known documents and verify end-to-end claim extraction accuracy against human-annotated ground truth.

### 6.3 Property-Based Testing

StreamData generators produce random text fragments to verify that the pipeline never crashes, confidence scores remain bounded between 0.0 and 1.0, and provenance chains are always complete.

## 7. Security Considerations

### 7.1 Threat Model

Adversarial text crafted to produce incorrect entity extraction or false confidence scores could corrupt the intelligence pipeline. Mitigations include input sanitization, confidence bounds enforcement, and mandatory multi-source verification at Level 3.

### 7.2 Access Control

3NL processing requires `osint_query` permission through [Prismatic Auth](/apps/prismatic-auth/). Output documents containing personal data are subject to [GDPR](/glossary/gdpr/) retention policies.

## 8. Operational Considerations

### 8.1 Deployment

Deploys as part of the umbrella [release](/glossary/release/) with bundled language resources. No external NLP services required.

### 8.2 Monitoring

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :_3nl, :process]`, `[:prismatic, :_3nl, :entity_resolved]`, `[:prismatic, :_3nl, :claim_verified]`. [Metrics](/glossary/metrics/) include per-level processing latency, entity cache hit rate, and confidence score distributions.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Low confidence scores | Insufficient corroborating sources | Expand source coverage |
| Slow L3 processing | Knowledge base queries slow | Check graph database performance |
| Czech entities not resolved | Missing diacritics normalization | Verify Czech language module loaded |
| Memory growth | Entity cache unbounded | Check TTL configuration |

## 9. Future Work

Planned enhancements include support for additional languages (German, Slovak, Polish), deep learning-based entity extraction to complement rule-based methods, real-time streaming document processing, and integration with external fact-checking databases.

## References

- [Prismatic Nabla](/apps/prismatic-nabla/) -- Epistemic confidence framework
- [Prismatic Graph](/apps/prismatic-graph/) -- Knowledge graph for claim verification
- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Intelligence source pipeline
- [Prismatic Audio](/apps/prismatic-audio/) -- Speech-to-text for audio sources

## Related Agents

- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Enforces evidence provenance and confidence scoring requirements across the epistemic verification pipeline
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Facilitates cross-domain knowledge transfer between the three processing levels and external intelligence systems
- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Orchestrates continuous improvement of the 3NL pipeline through autonomous evolution cycles

## Related Capabilities

- [Trinity Gate](/capabilities/trinity-gate/) -- Three-layer verification gate ensuring structural, logical, and formal consistency of epistemic claims produced at Level 3
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Combines syntactic, semantic, and epistemic paradigms for comprehensive natural language intelligence extraction
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Seven non-negotiable axioms governing confidence scoring, provenance tracking, and signal plurality in the epistemic layer

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)