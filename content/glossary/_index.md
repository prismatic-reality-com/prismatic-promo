+++
title = "Glossary"
description = "Comprehensive terminology reference with 225+ defined terms covering architecture, doctrine, agents, intelligence, security, epistemic frameworks, distributed systems, and formal verification"
sort_by = "title"
template = "glossary/list.html"
page_template = "glossary/detail.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
word_count = 2500
difficulty = "beginner"
image = "/images/sections/glossary.png"
image_alt = "Prismatic Platform terminology and glossary reference"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "documentation"
content_version = "3.0.0"
last_enhanced = "2026-02-12"
quality_score = 98
related_articles = ["3nl", "aiad", "nabla"]
glossary_terms = ["glossary", "terminology", "cross-reference"]
keywords = ["platform terminology reference", "technical glossary definitions", "OSINT terminology guide", "Elixir OTP glossary", "cybersecurity terms defined", "epistemic framework vocabulary", "distributed systems glossary", "AI agent terminology"]
tags = ["glossary", "terminology", "reference", "documentation"]
see_also = ["architecture", "capabilities", "agents"]
total_terms = 225
categories_count = 7
date_modified = "2026-02-23"
+++

Comprehensive terminology reference for the Prismatic Platform. 225+ defined terms spanning architecture, doctrine, agents, intelligence, security, epistemic frameworks, and core technologies -- each with formal definitions, contextual usage, and cross-references to related concepts.

## Abstract

The Prismatic Platform operates at the intersection of multiple technical domains: distributed systems engineering, open-source intelligence, epistemic reasoning, autonomous agent orchestration, and external attack surface management. Each domain brings its own vocabulary, and the platform itself introduces novel concepts that have no established definitions elsewhere. This glossary serves as the authoritative terminology reference, providing precise definitions for 225+ terms organized across seven categories. Every term page follows a uniform structure -- Definition, Context, See Also -- ensuring that readers can navigate from any entry point to a coherent understanding of the platform's conceptual landscape.

The glossary is not a static dictionary. It is a living reference that evolves alongside the platform. New terms are added as capabilities emerge, existing definitions are refined as understanding deepens, and cross-references are maintained to preserve the semantic network that connects individual concepts into a unified whole.

## Introduction

### Why Terminology Matters

Large-scale software platforms accumulate terminology at a rate that outpaces informal documentation. Without a structured glossary, the same concept acquires multiple names across different subsystems, new contributors misinterpret established terms, and architectural discussions devolve into disagreements about definitions rather than substance.

The Prismatic Platform is particularly susceptible to terminological drift for three reasons. First, it spans multiple technical domains -- Elixir/OTP, OSINT, cybersecurity, epistemic logic, formal verification -- each with its own established vocabulary. Second, the platform introduces novel concepts (NABLA Infinity, Trinity Gate, 3NL Framework, Color Teams) that have no external definitions to reference. Third, the platform's 404+ autonomous agents, 210+ commands, and 90 OTP applications create a combinatorial explosion of named entities that must be distinguished from one another.

This glossary addresses these challenges by providing a single, authoritative source of definitions. Each term is assigned to exactly one of seven categories, given a formal definition grounded in its implementation, and linked to related terms through explicit cross-references.

### Knowledge Management Architecture

The glossary operates as the terminological layer of a broader knowledge management system. Terms defined here are referenced throughout all platform documentation -- architecture guides, capability descriptions, agent specifications, and tutorial content. The cross-reference system ensures that a reader encountering an unfamiliar term in any document can trace it back to its canonical definition and from there navigate to related concepts.

The relationship between the glossary and other documentation sections is bidirectional. Architecture pages reference glossary terms for precise definitions. Glossary term pages reference architecture pages for deeper technical context. This bidirectional linking creates a navigable knowledge graph rather than a linear document hierarchy.

## Term Categories

The 225+ glossary terms are organized into seven categories. Each category represents a distinct conceptual domain within the platform, though significant cross-referencing exists between categories.

### 1. Architecture (22 terms)

Terms describing the platform's structural design, runtime environment, and deployment topology. This category covers the foundational building blocks -- from the BEAM virtual machine and OTP supervision trees up through the umbrella application structure and storage adapter layer.

**Representative terms**: [BEAM](/glossary/beam/), [OTP](/glossary/otp/), [Supervisor](/glossary/supervisor/), [GenServer](/glossary/genserver/), [ETS](/glossary/ets/), [3NL Framework](/glossary/three-nl/), [Adapter Pattern](/glossary/adapter-pattern/), [Umbrella Application](/glossary/umbrella/), [Process Isolation](/glossary/process-isolation/), [Message Passing](/glossary/message-passing/)

Architecture terms form the vocabulary needed to understand how the platform's 90 OTP applications are organized, supervised, and interconnected. A reader who understands these terms can follow any architectural discussion in the platform documentation.

### 2. Doctrine (15 terms)

Terms describing the platform's operational philosophy, quality enforcement, and governance principles. The doctrine category defines the rules under which all development, testing, and deployment occurs -- from the NO MERCY/NO DOUBTS quality mandate to the specific violation protocols that enforce it.

**Representative terms**: [NM/ND (No Mercy, No Doubts)](/glossary/nm-nd/), [Clean Run](/glossary/clean-run/), [Zero-Warning Policy](/glossary/zero-warning-policy/), [Violation Protocol](/glossary/violation-protocol/), [Regression Test](/glossary/regression-test/), [Session Discipline](/glossary/session-discipline/), [Quality Debt](/glossary/quality-debt/), [QDP](/glossary/qdp/)

Doctrine terms are essential for understanding why certain development practices are enforced. They describe not just what the platform does, but the principles that govern how it is built and maintained.

### 3. Agent (18 terms)

Terms describing the platform's autonomous agent ecosystem, including agent classification, orchestration patterns, and the AIAD specification standard. The Prismatic Platform operates 404+ agents across 14 domains, each defined by a formal AIAD specification that declares its authority level, capabilities, and operational constraints.

**Representative terms**: [AIAD](/glossary/aiad/), [Agent](/glossary/agent/), [Agent Tier](/glossary/agent-tier/), [Agent Registry](/glossary/agent-registry/), [Archer Supreme](/glossary/archer-supreme/), [Supreme Commander](/glossary/supreme-commander/), [Strategic Command](/glossary/strategic-command/), [Tactical Execution](/glossary/tactical-execution/), [Autoevolve](/glossary/autoevolve/), [Autoheal](/glossary/autoheal/)

Agent terms describe the platform's most distinctive capability: a hierarchical system of autonomous agents that range from L1 tactical specialists to L5 supreme authority commanders, all governed by a uniform specification standard.

### 4. Intelligence (16 terms)

Terms from the open-source intelligence (OSINT) and due diligence domains, covering data collection methodologies, source types, analytical techniques, and intelligence fusion patterns. These terms originate from the intelligence community but are adapted for the platform's automated OSINT operations.

**Representative terms**: [OSINT](/glossary/osint/), [EASM](/glossary/easm/), [HAWKEYE](/glossary/hawkeye/), [Intelligence Fusion](/glossary/intelligence-fusion/), [Entity Resolution](/glossary/entity-resolution/), [Sanctions Screening](/glossary/sanctions-screening/), [Risk Score](/glossary/risk-score/), [Shodan](/glossary/shodan/), [Censys](/glossary/censys/), [GreyNoise](/glossary/greynoise/)

Intelligence terms bridge the gap between traditional OSINT methodology and the platform's automated implementation. A reader familiar with intelligence analysis will recognize these terms; a reader from a software engineering background will find them defined in implementable terms.

### 5. Security (14 terms)

Terms describing the platform's security architecture, including the Color Team adversarial-defensive framework, role-based access control, attack surface analysis, and epistemic security concepts. Security terms in this glossary extend beyond traditional application security to include the epistemic dimension -- protecting the integrity of the platform's knowledge and belief systems.

**Representative terms**: [Color Teams](/glossary/color-teams/), [Red Team](/glossary/red-team/), [Blue Team](/glossary/blue-team/), [Purple Team](/glossary/purple-team/), [Gray Team](/glossary/gray-team/), [White Team](/glossary/white-team/), [Black Team](/glossary/black-team/), [RBAC](/glossary/rbac/), [Attack Surface](/glossary/attack-surface/)

The Color Team terms deserve particular attention. While Red Team and Blue Team are established security concepts, the platform extends the model to six teams (Gray, Red, Blue, Purple, White, Black) with specific epistemic functions that go beyond traditional penetration testing and defense.

### 6. Epistemic (18 terms)

Terms from the platform's epistemic framework, covering belief formation, knowledge validation, formal verification, and the NABLA Infinity axiom system. This category contains the most novel terminology in the glossary -- concepts that are specific to the Prismatic Platform's approach to computational epistemology.

**Representative terms**: [NABLA Infinity](/glossary/nabla-infinity/), [Trinity Gate](/glossary/trinity-gate/), [Epistemic Pipeline](/glossary/epistemic-pipeline/), [Confidence Threshold](/glossary/confidence-threshold/), [Signal Plurality](/glossary/signal-plurality/), [Provenance Mandatory](/glossary/provenance-mandatory/), [Consciousness Traits](/glossary/consciousness-traits/), [QEVE](/glossary/qeve/), [Fitness Score](/glossary/fitness-score/)

Epistemic terms are foundational for understanding how the platform differs from conventional software systems. Traditional platforms process data; the Prismatic Platform forms beliefs about data and subjects those beliefs to formal verification before acting on them.

### 7. Technology (24 terms)

Terms describing the specific technologies, libraries, tools, and external services that compose the platform's technology stack. This category covers everything from programming languages and frameworks to databases, search engines, and deployment infrastructure.

**Representative terms**: [Elixir](/glossary/elixir/), [Phoenix](/glossary/phoenix/), [LiveView](/glossary/liveview/), [Ecto](/glossary/ecto/), [PostgreSQL](/glossary/postgresql/), [Meilisearch](/glossary/meilisearch/), [KuzuDB](/glossary/kuzudb/), [Redis](/glossary/redis/), [Docker](/glossary/docker/), [Lean4](/glossary/lean4/), [Ollama](/glossary/ollama/), [Hex](/glossary/hex/), [Mix](/glossary/mix/), [Credo](/glossary/credo/), [Dialyzer](/glossary/dialyzer/)

Technology terms serve as a bridge between the platform's domain-specific vocabulary and the broader software engineering ecosystem. A developer joining the project can start with these familiar terms and navigate outward to the platform-specific concepts they connect to.

## Architecture Terms -- Expanded Overview

Architecture terms define the structural vocabulary of the platform. The most fundamental term is **BEAM** (Bogdan/Bjorn's Erlang Abstract Machine), the virtual machine on which all Elixir code executes. The BEAM provides preemptive scheduling, per-process garbage collection, and soft real-time guarantees that underpin every other architectural decision.

Built on the BEAM is **OTP** (Open Telecom Platform), the framework library that provides supervision trees, generic server behaviours, and distributed systems primitives. OTP is not optional infrastructure -- it is the defining architectural pattern. Every stateful component in the platform lives inside a supervised process tree.

The **3NL Framework** (Three Nested Levels) organizes these architectural components into three abstraction tiers: Level 1 (operational compliance), Level 2 (strategic coordination), and Level 3 (systemic emergence). This layering ensures that implementation details do not leak across boundaries and that each level interacts only with appropriate abstractions.

Key OTP primitives in the glossary include **GenServer** (the generic server behaviour for stateful processes), **Supervisor** (the process that monitors and restarts child processes), **Dynamic Supervisor** (for runtime-spawned children), **ETS** (Erlang Term Storage for in-memory key-value operations), and **Registry** (process name registration and lookup).

## Doctrine Terms -- Expanded Overview

The platform's doctrine vocabulary centers on **NO MERCY, NO DOUBTS (NM/ND)**, the quality enforcement philosophy that governs all development. NO MERCY mandates zero tolerance for incomplete implementations, untested code, and quality violations. NO DOUBTS mandates full investigation before action and evidence-based verification of all results.

Supporting NM/ND are operational terms like **Clean Run** (compilation with zero warnings, all tests passing, all quality gates satisfied), **Zero-Warning Policy** (the compile-time enforcement that treats warnings as errors), and **Violation Protocol** (the L1-L4 escalation ladder for doctrine breaches).

**Quality Debt (QDP)** refers to accumulated quality violations tracked and eliminated through automated scanning. The platform maintains zero QDP through continuous enforcement. **Regression Test** describes the mandatory protocol requiring every bug fix to include a test that would have caught the original bug.

## Agent Terms -- Expanded Overview

The **AIAD** (AI-Agent Interface Definition) standard governs all 404+ agents. Each agent is classified into an **Agent Tier** from L1 (tactical specialist) through L5 (supreme authority). The **Agent Registry** serves as the central catalog, ETS-cached for O(1) lookup at runtime.

At the apex of the agent hierarchy sits **Archer Supreme**, the L5 strategic analysis agent that coordinates multi-domain operations. Below it, **Supreme Commander** agents direct domain-level strategy, while **Strategic Command** and **Tactical Execution** agents handle progressively more focused operations.

**Autoevolve** and **Autoheal** describe the platform's self-improvement mechanisms. Autoevolve scans for optimization opportunities and applies them autonomously. Autoheal detects quality regressions and repairs them without human intervention.

## Intelligence Terms -- Expanded Overview

**OSINT** (Open Source Intelligence) is the collection and analysis of publicly available information. The platform automates OSINT through 250+ data source adapters, combining results through **Intelligence Fusion** -- the synthesis of signals from multiple independent sources into unified analytical products.

**EASM** (External Attack Surface Management) is the security discipline implemented by the Prismatic Perimeter application. It discovers, catalogs, and monitors an organization's internet-facing assets, assigning **Risk Scores** based on observed vulnerabilities and configuration weaknesses.

**Entity Resolution** addresses the challenge of determining whether records from different sources refer to the same real-world entity. **Sanctions Screening** checks resolved entities against regulatory sanctions lists. Together, these capabilities form the due diligence pipeline.

External intelligence services referenced in the glossary include **Shodan** (internet-connected device search), **Censys** (internet-wide scanning and certificate transparency), and **GreyNoise** (internet background noise analysis).

## Security Terms -- Expanded Overview

The **Color Teams** framework organizes security operations into six specialized teams, each with distinct responsibilities:

| Team | Function | Glossary Entry |
|------|----------|----------------|
| **Gray** | Boundary exploration, edge case discovery | [Gray Team](/glossary/gray-team/) |
| **Red** | Adversarial simulation, epistemic attacks | [Red Team](/glossary/red-team/) |
| **Blue** | Defensive posture, signal aggregation | [Blue Team](/glossary/blue-team/) |
| **Purple** | Red-Blue synthesis, closure analysis | [Purple Team](/glossary/purple-team/) |
| **White** | Constructive verification, formal proofs | [White Team](/glossary/white-team/) |
| **Black** | Theoretical threat modeling (maximum isolation) | [Black Team](/glossary/black-team/) |

**RBAC** (Role-Based Access Control) governs API and dashboard access. **Attack Surface** refers to the totality of externally reachable endpoints, services, and assets that an adversary could target.

## Technology Terms -- Expanded Overview

The technology stack vocabulary spans five layers. At the language level: **Elixir** (the functional programming language), **Erlang** (the underlying runtime language), and **Lean4** (the theorem prover used for formal verification in the QEVE pipeline).

At the framework level: **Phoenix** (the web framework), **LiveView** (real-time server-rendered UI), **Ecto** (the database wrapper and query generator), and **Broadway** (the concurrent data processing pipeline library).

At the tooling level: **Mix** (the build tool), **Hex** (the package manager), **Credo** (the static analysis linter), **Dialyzer** (the type-checking tool), and **ExUnit** (the test framework).

At the infrastructure level: **PostgreSQL** (primary relational database), **Redis** (distributed cache), **Meilisearch** (full-text search), **KuzuDB** (embedded graph database), **Docker** (containerization), and **Fly.io** (deployment platform).

At the AI level: **Ollama** (local AI inference server) provides sub-3-second response times for code generation and analysis tasks.

## Cross-Reference System

Every glossary term page includes a "See Also" section linking to 3-5 related terms. These cross-references form a navigable graph that allows readers to explore conceptual neighborhoods rather than reading terms in isolation.

The cross-reference topology follows three patterns:

**Hierarchical references** link terms to their parent concepts. For example, [GenServer](/glossary/genserver/) references [OTP](/glossary/otp/), which references [BEAM](/glossary/beam/). A reader can follow these links upward to broader concepts or downward to specific implementations.

**Lateral references** link terms at the same abstraction level. For example, [Red Team](/glossary/red-team/) references [Blue Team](/glossary/blue-team/) and [Purple Team](/glossary/purple-team/). These links help readers understand how peer concepts relate to and complement each other.

**Cross-domain references** link terms across category boundaries. For example, [NABLA Infinity](/glossary/nabla-infinity/) (epistemic) references [Trinity Gate](/glossary/trinity-gate/) (epistemic) but also connects to [Color Teams](/glossary/color-teams/) (security) and [3NL Framework](/glossary/three-nl/) (architecture). These links reveal the integrative nature of the platform's design.

### Example Cross-Reference Network

Starting from the term **EASM**, a reader can navigate:

```
EASM (intelligence)
  --> Attack Surface (security) --> Color Teams (security) --> Red Team (security)
  --> Security Rating (security) --> Risk Score (intelligence)
  --> NIS2 (security) --> RBAC (security)
  --> HAWKEYE (intelligence) --> OSINT (intelligence)
```

This network spans three categories (intelligence, security, architecture) and connects a single starting term to eight related concepts, each with its own cross-references extending the graph further.

## Term Page Structure

Every glossary term follows a consistent three-section structure. This uniformity ensures that readers develop predictable expectations about what information each page provides.

### Canonical Structure

```markdown
+++
title = "Term Name"
weight = 10
[extra]
description = "One-sentence summary of the term"
category = "category_name"
abbreviation = "ABBR"
related_terms = ["term-a", "term-b", "term-c"]
+++

## Definition

A precise, implementation-grounded definition of the term. Typically
two to four sentences. States what the thing IS, not what it does
or why it matters. Uses present tense and active voice.

## Context

How this term manifests within the Prismatic Platform specifically.
References concrete applications, modules, routes, or configurations.
Provides the bridge between abstract definition and practical usage.

## See Also

- [Related Term A](/glossary/related-term-a/) - Brief relationship note
- [Related Term B](/glossary/related-term-b/) - Brief relationship note
- [Related Term C](/glossary/related-term-c/) - Brief relationship note
```

The **Definition** section answers "what is this?" in domain-neutral terms when possible. The **Context** section answers "how does Prismatic use this?" with specific implementation references. The **See Also** section answers "what should I read next?" with curated navigation paths.

### Metadata Fields

Each term page carries structured metadata in its TOML frontmatter:

| Field | Purpose | Example |
|-------|---------|---------|
| `title` | Display name | `"NABLA Infinity"` |
| `weight` | Sort order within the glossary | `31` |
| `description` | One-sentence summary for listing pages | `"Epistemic framework with 7 axioms"` |
| `category` | One of the seven category slugs | `"epistemic"` |
| `abbreviation` | Short form if applicable | `"NABLA"` |
| `related_terms` | Slugs of cross-referenced terms | `["trinity-gate", "three-nl"]` |

## Contributing New Terms

The glossary grows as the platform evolves. New terms should be added when any of the following conditions are met:

1. **A new concept is introduced** that does not map to an existing term. For example, when the QEVE verification pipeline was added, it required its own glossary entry because no existing term covered the combination of Lean4, NABLA, and Monte Carlo verification.

2. **An existing concept is referenced in three or more documents** without a glossary definition. This threshold indicates that the concept has sufficient usage density to warrant formal definition.

3. **A term is ambiguous across domains**. When the same word means different things in different contexts (e.g., "agent" in OTP versus "agent" in AIAD), separate glossary entries disambiguate the usages.

### Adding a Term

To add a new term, create a Markdown file at `sites/promo/content/glossary/<slug>.md` following the canonical structure described above. Assign it to one of the seven categories, provide 3-5 cross-references, and set a weight value that places it in appropriate alphabetical proximity to related terms.

After creating the term page:

1. Verify cross-references point to existing term pages
2. Add reciprocal cross-references in the related term pages
3. Update the term count in this index page's frontmatter
4. Rebuild the site to verify template rendering

### Quality Criteria for Terms

A well-written glossary entry satisfies four criteria:

- **Precision**: The definition is specific enough to distinguish this term from all other terms in the glossary
- **Groundedness**: The context section references concrete platform artifacts (modules, routes, configurations)
- **Navigability**: The cross-references create useful paths to related concepts, not just superficially similar terms
- **Brevity**: The entire entry fits on a single screen without scrolling. Detailed explanations belong in architecture or capability pages, not in the glossary

## Conclusion

The Prismatic Platform glossary is a structured knowledge artifact that serves three audiences simultaneously. For newcomers, it provides a curated entry point into the platform's conceptual landscape -- start with any term and navigate outward through cross-references until the relevant domain is understood. For active contributors, it provides a shared vocabulary that eliminates ambiguity in architectural discussions, code reviews, and documentation. For the platform itself, it provides the terminological foundation on which all other documentation is built.

The 225+ terms across seven categories represent the current state of the platform's vocabulary. As the platform continues to evolve -- new applications, new agents, new epistemic capabilities -- the glossary evolves in parallel, ensuring that the gap between what the platform does and what its documentation explains remains as close to zero as possible.

## References

### Related Sections

- [Architecture](/architecture/) -- Technical deep-dive using architecture terms
- [Platform Capabilities](/capabilities/) -- Doctrine and quality enforcement terms in action
- [Applications](/apps/) -- OTP application catalog referencing technology terms

### External References

- [Elixir Documentation](https://hexdocs.pm/elixir/) -- Canonical definitions for Elixir/OTP terms
- [Phoenix Framework Guides](https://hexdocs.pm/phoenix/) -- LiveView, PubSub, Channel terminology
- [OWASP Glossary](https://owasp.org/www-community/) -- Security terminology baselines
- [OSINT Framework](https://osintframework.com/) -- Intelligence collection terminology

---

*Glossary maintained as of 2026-02-12. Term count: 225. Categories: 7. All cross-references verified against existing term pages.*

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
