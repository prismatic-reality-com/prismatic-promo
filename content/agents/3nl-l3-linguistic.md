+++
title = "3nl-l3-linguistic"
weight = 13
[extra]
domain = "general"
level = "L3"
description = "Natural language understanding and semantic analysis for the 3NL framework"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl", "genserver", "ets", "osint"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1800
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["3nl-l3-linguistic", "Natural", "agents", "agent", "Prismatic Platform", "Linguistic", "Czech", "Entity"]
tags = ["agents", "agent", "3nl-l3-linguistic", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "3nl-l3-linguistic - Prismatic Platform"
+++

## Overview

The [3NL](@/glossary/three-nl.md) L3 Linguistic agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent providing the language understanding layer of the Three-Layer Neural-Logical-Linguistic (3NL) framework within the Prismatic Platform. This agent implements natural language processing, semantic analysis, entity extraction, and contextual interpretation capabilities that enable the platform to reason about unstructured text data. Where L1 Logic handles formal proofs and L2 Neural handles pattern recognition, L3 Linguistic bridges the gap between human-readable information and machine-processable knowledge.

Natural language understanding is critical in the Prismatic ecosystem because many intelligence sources produce unstructured text: [OSINT](@/glossary/osint.md) reports, compliance regulations, security advisories, and Czech business [registry](@/glossary/registry-otp.md) documents all arrive as natural language. The L3 Linguistic agent transforms this unstructured content into structured knowledge representations that can be processed by other reasoning layers and consumed by downstream intelligence agents. This transformation preserves nuance, handles ambiguity explicitly, and flags linguistic uncertainty rather than making silent assumptions.

The agent's design reflects a core epistemic principle: natural language is inherently ambiguous, and any system that processes natural language must acknowledge that ambiguity rather than silently resolving it. When a sentence admits multiple interpretations, the L3 Linguistic agent produces all plausible interpretations with associated confidence scores rather than selecting one and discarding the rest. This approach aligns with the NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom -- multiple valid readings of a text are preserved as legitimate epistemic signals, not collapsed into a single best guess that erases the uncertainty inherent in the source material.

## Operational Domain

The L3 Linguistic agent operates within the 3NL framework as the natural language processing engine. It receives text analysis requests from the 3NL Coordinator, applies linguistic analysis techniques to extract meaning, and returns structured representations with confidence annotations. This agent is particularly valuable for intelligence analysis, document processing, and any scenario involving human-generated text.

The operational scope covers four primary language processing modes. Entity extraction identifies persons, organizations, locations, dates, and domain-specific entities within text. Semantic analysis determines meaning beyond literal text through context interpretation and domain-specific terminology mapping. Sentiment and intent classification evaluates tone, purpose, and urgency in communications. Language detection and cross-lingual processing handles multilingual corpora, with particular strength in Czech and English -- the two primary languages of the platform's intelligence workloads.

## Key Capabilities

- **Named entity recognition** extracting persons, organizations, locations, dates, numbers, emails, URLs, and phone numbers from unstructured text with confidence scores and source provenance tracking, supporting eight entity types across multiple languages
- **Semantic analysis** determining meaning beyond literal text through context interpretation, idiom resolution, and domain-specific terminology mapping for Czech and English language sources, with explicit disambiguation of polysemous terms
- **Sentiment and intent classification** analyzing text for emotional tone, authorial intent, and urgency indicators, particularly useful for OSINT intelligence assessment and threat evaluation, producing three-class (positive/negative/neutral) sentiment with continuous confidence scores
- **Cross-lingual processing** handling Czech, English, German, and French language sources with language-aware tokenization, stop word filtering, and morphological analysis, supporting the platform's multinational intelligence and regulatory compliance workloads
- **Ambiguity detection and reporting** explicitly identifying linguistic ambiguities rather than silently resolving them, supporting the NABLA Unknown Valid axiom by treating uncertainty as legitimate data that downstream consumers can evaluate in context
- **Response generation** producing natural language outputs in both template-driven and LLM-assisted modes, enabling the platform to communicate findings in human-readable form while maintaining traceability to source evidence

## Technical Architecture

The L3 Linguistic agent is implemented as an [OTP](@/glossary/otp.md) application with a [GenServer](@/glossary/genserver.md) managing the NLP pipeline state, entity extraction models, and language detection heuristics. The agent maintains language-specific processing modules that are activated based on detected input language, ensuring that tokenization, stemming, and entity recognition use language-appropriate rules.

```elixir
defmodule Prismatic3NL.Layers.L3Linguistic do
  use GenServer

  @supported_languages [:en, :cs, :de, :fr]
  @entity_types [:person, :location, :organization, :date,
                 :number, :email, :url, :phone]

  def extract_entities(text, opts \\ []) do
    GenServer.call(__MODULE__, {:extract_entities, text, opts})
  end

  def detect_language(text) do
    GenServer.call(__MODULE__, {:detect_language, text})
  end

  def analyze_sentiment(text, opts \\ []) do
    GenServer.call(__MODULE__, {:sentiment, text, opts})
  end

  def generate(prompt, opts \\ []) do
    mode = Keyword.get(opts, :mode, :template)
    GenServer.call(__MODULE__, {:generate, prompt, mode, opts})
  end

  @impl true
  def handle_call({:extract_entities, text, opts}, _from, state) do
    lang = detect_input_language(text, state)
    pipeline = get_language_pipeline(lang, state)
    entities = run_entity_extraction(text, pipeline, @entity_types)
    annotated = attach_provenance(entities, text, lang)
    {:reply, {:ok, annotated}, state}
  end
end
```

The entity extraction pipeline operates in three stages. First, language detection identifies the input language using n-gram frequency analysis and character set heuristics. Second, language-specific tokenization splits the input into processing units appropriate for the detected language -- Czech text requires different tokenization rules than English due to rich morphology and diacritical marks. Third, the entity recognition module scans tokenized text using pattern matching, gazetteers (curated lists of known entities), and contextual classification to identify and categorize entities.

The semantic analysis subsystem maintains domain-specific ontologies that map terms to concepts within the Prismatic Platform's knowledge domains. For cybersecurity intelligence, terms like "breach," "exfiltration," and "lateral movement" map to specific threat categories. For Czech business intelligence, terms like "spolecnost s rucenim omezenym" (limited liability company) and "jednatel" (managing director) map to corporate entity types. These ontologies ensure that semantic analysis produces domain-relevant structured output rather than generic linguistic annotations.

## Decision Framework

The L3 Linguistic agent's decision framework operates on a multi-dimensional confidence model where each linguistic output carries separate confidence scores for different aspects of the analysis.

| Analysis Dimension | Confidence Metric | Threshold |
|-------------------|------------------|-----------|
| Language detection | Detection probability | >= 0.95 for routing |
| Entity extraction | Per-entity confidence | >= 0.70 for inclusion |
| Sentiment classification | Class probability | >= 0.60 for classification |
| Semantic interpretation | Interpretation plausibility | All above 0.40 preserved |
| Ambiguity detection | Ambiguity score | > 0.30 triggers explicit flagging |

When entity extraction confidence falls below 0.70, the entity is included in results but flagged as low-confidence, allowing consuming agents to decide whether to use it based on their own tolerance for uncertainty. This approach avoids both the over-reporting of noisy entity extraction and the under-reporting that comes from aggressive confidence filtering.

For ambiguous text where multiple interpretations exist, the agent produces all plausible interpretations ranked by estimated probability. The 3NL Coordinator can then route these alternative interpretations to L1 Logic for consistency checking or to L2 Neural for pattern-based disambiguation. This multi-layer approach to ambiguity resolution leverages the complementary strengths of all three reasoning layers.

## Authority Level

**L3** - Strategic Command. The L3 Linguistic agent holds multi-domain coordination authority for text processing operations across all platform domains. Its authority scope covers natural language analysis requests from intelligence agents, compliance agents, and security monitoring agents. The agent operates in a read-only posture toward source documents, producing structured annotations without modifying original text.

The L3 designation permits direct coordination with peer reasoning layers and the ability to request additional context from domain-specific agents when linguistic analysis requires domain expertise. The authority does not extend to enforcement actions or state modifications -- the linguistic layer interprets and structures information but does not act on it autonomously.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [3nl-coordinator](@/agents/3nl-coordinator.md) | Coordination Hub | Receives text analysis requests and returns structured linguistic outputs |
| [3nl-l1-logic](@/agents/3nl-l1-logic.md) | Peer Layer | Provides formal logic validation for linguistically derived propositions |
| [3nl-l2-neural](@/agents/3nl-l2-neural.md) | Peer Layer | Provides neural pattern recognition for text classification tasks |
| [3nl-l7-transcendent](@/agents/3nl-l7-transcendent.md) | Transcendent Layer | Transcendent semantic synthesis across consciousness layers |
| [bayesian-analyst](@/agents/bayesian-analyst.md) | Confidence Partner | Quantifies uncertainty in linguistic interpretations using probabilistic methods |
| [email-intelligence-specialist](@/agents/email-intelligence-specialist.md) | Intelligence Consumer | Consumes entity extraction for email-based intelligence profiling |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Language detection** | < 5ms | < 10ms | Time for language identification on input text |
| **Entity extraction** | < 80ms | < 150ms | Time for full entity extraction on typical document |
| **Sentiment analysis** | < 30ms | < 50ms | Time for sentiment classification with confidence |
| **Semantic analysis** | < 120ms | < 200ms | Time for full semantic analysis with ontology mapping |
| **Supported languages** | 4 | 4+ | Number of languages with full NLP pipeline support |
| **Entity type coverage** | 8 types | 8+ types | Number of named entity types recognized |

## Enforcement

All L3 Linguistic operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Linguistic analysis must include confidence scores for all extracted entities and semantic interpretations. Ambiguous text must be flagged explicitly rather than silently resolved. No linguistic output is accepted as ground truth without cross-validation through at least one additional reasoning layer. Source language and translation confidence are mandatory metadata for all processed text. The NABLA [Signal Plurality](@/glossary/signal-plurality.md) axiom requires that linguistic conclusions used for critical decisions be corroborated by at least one non-linguistic signal source -- preventing critical actions from being taken solely on the basis of natural language interpretation, which is inherently subject to ambiguity.

## Related Resources

- [3NL Framework](@/glossary/three-nl.md) -- The multi-paradigm reasoning architecture
- [OSINT Sources](@/osint/_index.md) -- Intelligence sources producing natural language text for linguistic analysis
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing ambiguity preservation
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-agent intelligence coordination
- [Technologies](@/technologies/_index.md) -- Platform technology stack including NLP infrastructure
- [Glossary](@/glossary/_index.md) -- Technical terminology and domain concepts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)