+++
title = "FAQ"
description = "Frequently asked questions about the Prismatic Platform covering architecture, capabilities, development workflow, and deployment"
sort_by = "weight"
template = "faq/list.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
word_count = 2200
difficulty = "beginner"
image = "/images/sections/faq.png"
image_alt = "Prismatic Platform frequently asked questions"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "documentation"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
glossary_terms = ["AIAD", "OTP", "3NL", "NABLA"]
keywords = ["Prismatic Platform FAQ", "Elixir OTP questions answered", "AI agent platform overview", "OSINT platform guide", "security platform FAQ", "architecture design decisions", "development workflow guide", "platform deployment questions"]
tags = ["faq", "documentation", "guide", "overview"]
see_also = ["architecture", "apps", "glossary"]
total_questions = 25
date_modified = "2026-02-23"
+++

Frequently asked questions about the Prismatic Platform -- a comprehensive reference covering platform fundamentals, architectural decisions, intelligence capabilities, development workflows, quality enforcement, and deployment infrastructure. This FAQ consolidates the most common inquiries from developers, security professionals, intelligence analysts, and compliance officers evaluating or working with the platform.

## Abstract

The Prismatic Platform is an enterprise-grade AI-orchestrated intelligence and development infrastructure built on Elixir/OTP. With 93 umbrella applications, 434 autonomous agents, 121+ OSINT source integrations, and approximately 2.8 million lines of code, the platform represents a significant engineering effort at the intersection of artificial intelligence, open-source intelligence, cybersecurity, and formal verification. This FAQ section addresses the questions that arise most frequently when encountering a system of this scale and ambition, organized into six thematic categories: platform overview, architecture and design, capabilities and features, development and workflow, quality and compliance, and operational deployment.

The answers provided here are intended to be self-contained and accessible to readers with varying levels of technical depth. Where a question warrants deeper exploration, references point to the relevant section of this documentation site. The FAQ is maintained alongside the platform codebase and updated to reflect the current state of the system as of February 2026.

---

## 1. Platform Overview

This section addresses foundational questions about what the Prismatic Platform is, who it serves, and the principles that govern its development.

### Q: What is the Prismatic Platform?

The Prismatic Platform is an AI-orchestrated intelligence, security, and development infrastructure implemented as an Elixir/OTP umbrella project. It comprises 93 OTP applications running on a single BEAM virtual machine, coordinated through supervision trees, PubSub event buses, and a pluggable storage adapter layer. The platform hosts 434 autonomous AI agents operating across 14 domains -- from open-source intelligence gathering and external attack surface management to formal verification with Lean 4 theorem proofs.

At its core, the platform unifies capabilities that are typically fragmented across dozens of separate tools: OSINT data collection from 121+ sources, due diligence investigation workflows, security rating computation comparable to products like BitSight and SecurityScorecard, AI agent orchestration with epistemic quality controls, and a self-evolving quality infrastructure that has progressed through 18 generations of autonomous improvement. The entire system achieves microsecond inter-service latency without the operational complexity of distributed microservices, because all applications share the same Erlang runtime.

### Q: What problem does the Prismatic Platform solve?

Intelligence, security, and compliance operations typically require teams to integrate dozens of specialized tools -- threat intelligence feeds, OSINT databases, compliance assessment frameworks, security scanners, case management systems, and reporting platforms -- each with its own data model, authentication scheme, and operational overhead. The Prismatic Platform consolidates these capabilities into a single, fault-tolerant runtime where data flows between subsystems through direct function calls and in-process message passing rather than network APIs.

This consolidation eliminates several categories of operational friction. Data enrichment that would require multiple API calls across separate services happens through parallel in-process queries. Security ratings that depend on asset discovery, vulnerability assessment, and compliance mapping are computed within a single supervision tree. Intelligence workflows that combine Czech registry data, global threat feeds, and sanctions screening share a unified entity model rather than requiring ETL pipelines between disconnected systems.

### Q: Who is the Prismatic Platform designed for?

The platform serves four primary audiences. Security teams use the Perimeter (EASM) module for external attack surface management, security ratings, and continuous compliance monitoring against frameworks like NIS2 and ZKB. Intelligence analysts use the OSINT integration layer and due diligence workflows to investigate entities across 121+ data sources, with particular depth in Czech government registries. Developers working on the platform itself interact with the 434-agent ecosystem, quality enforcement infrastructure, and the AIAD (AI Agent Definition) standard for defining new agents and commands. Compliance officers use the automated compliance assessment engine to evaluate organizational posture against EU and Czech regulatory requirements, generating evidence-based reports with confidence scores.

### Q: What programming languages and frameworks does the platform use?

The primary implementation language is Elixir, running on the BEAM (Erlang Virtual Machine) with OTP (Open Telecom Platform) for fault tolerance and concurrency. Web interfaces are built with Phoenix Framework and LiveView for real-time server-rendered dashboards. The data layer uses PostgreSQL (via Ecto) as the primary relational store, ETS (Erlang Term Storage) for high-speed in-memory caching, Meilisearch for full-text search, KuzuDB for graph queries, and Redis for distributed caching and rate limiting. Formal verification uses Lean 4 for theorem proving. AI capabilities integrate Claude (Anthropic) for complex reasoning and local Ollama models (qwen3-coder, deepseek-coder, gpt-oss:20b) for low-latency inference. The front-end styling uses TailwindCSS with Flowbite components exclusively -- custom CSS and inline styles are forbidden by platform policy.

### Q: What does "Generation 18" mean?

The platform tracks its evolutionary state using a generation counter. Each generation represents a measurable improvement cycle driven by autonomous evolution protocols that execute during every development session. These protocols scan for quality improvements, detect code patterns that can be optimized, eliminate technical debt, and validate that the platform's fitness score (a composite metric covering quality, performance, and architectural health) improves or at least does not regress. The platform has progressed from Generation 1 through Generation 18, achieving a fitness score of 0.999 -- near the theoretical maximum. This is not a version number in the traditional sense; it reflects the cumulative effect of thousands of autonomous improvement cycles applied across the platform's 2.8 million lines of code.

---

## 2. Architecture and Design

These questions address the technical decisions underlying the platform's structure, runtime characteristics, and data architecture.

### Q: Why was Elixir/OTP chosen over other technology stacks?

The choice is driven by three requirements that disqualify most runtime environments. First, the BEAM scheduler provides preemptive scheduling across lightweight processes with sub-millisecond context switching, which is essential when 434 AI agents, web dashboard connections, and background crawl jobs share the same runtime. Second, each Erlang process has its own heap and garbage-collects independently, meaning a crash in one process does not corrupt another's memory -- OTP supervisors automatically restart failed processes according to configurable strategies, making the system self-healing at the process level. Third, the BEAM supports hot code loading, enabling module replacement in a running system without dropping connections. The platform enforces a meta-rule to maintain idiomatic Elixir: "If the same solution could be written identically in Node.js, it is WRONG."

### Q: Why is the project structured as an umbrella rather than microservices?

The umbrella structure provides microservice-like modularity -- independent compilation, isolated testing, explicit dependency declarations enforced at compile time -- without microservice operational overhead. There is no service discovery, no network serialization between components, no distributed tracing requirement, and no container orchestration complexity. All 93 applications share a single BEAM node, communicating through direct function calls and message passing with microsecond latency. A failure in the Perimeter application's supervision tree does not propagate to the Web application's supervision tree because the top-level supervisor uses the `:one_for_one` restart strategy. This delivers fault isolation equivalent to separate services while maintaining the deployment simplicity of a monolith.

### Q: What is the 3NL (Three Nested Levels) framework?

3NL is the architectural abstraction framework that organizes all platform components across three levels. Level 1 (Strategic) encompasses public APIs, facade modules, and external interfaces -- the surface that consumers interact with. Level 2 (Tactical) covers inter-application coordination, pipeline orchestration, and agent messaging -- the connective tissue between domains. Level 3 (Operational) contains OTP process internals, ETS operations, and BEAM-level optimizations -- the implementation details that consumers should never depend on. The framework ensures that code at each level interacts only with appropriate abstractions. A web controller at Level 1 calls a facade function at Level 1; it never reaches into a GenServer's internal state at Level 3.

### Q: What is the AIAD standard?

AIAD (AI Agent Definition) is the platform's specification format for defining agents, commands, pipelines, policies, and adapters. Every agent is defined in a YAML file under `.aiad/agents/` with structured metadata including its name, domain, authority level (L1 through L5), available tools and capabilities, behavioral rules, input/output contracts, and compliance requirements with the NO MERCY / NO DOUBTS doctrine. The standard enables machine-readable agent definitions that the platform's runtime can introspect, validate, and enforce. There are currently 404 AIAD-defined agents (434 including runtime-generated ones) and 210 AIAD-defined commands across the platform. The AIAD auto-indexer (`./.aiad/bin/aiad index`) maintains a registry that keeps all agent and command metadata synchronized.

### Q: How does the storage adapter architecture work?

The storage layer implements a behaviour-based adapter pattern through the `PrismaticStorage.Adapter` behaviour. All storage operations -- `store/3`, `fetch/2`, `delete/2`, `list/2` -- route through this uniform interface regardless of the underlying backend. The platform currently implements five adapters: ETS for microsecond-latency in-memory operations, Ecto/PostgreSQL for persistent relational data, Meilisearch for typo-tolerant full-text search, KuzuDB for graph traversal queries, and Redis for distributed caching. Domain code never references a specific backend directly; it calls the adapter protocol, and the configuration determines which implementation handles the request. This makes it possible to swap storage backends without changing any domain logic.

---

## 3. Capabilities and Features

These questions cover the platform's intelligence gathering, security assessment, and AI orchestration capabilities.

### Q: What OSINT capabilities does the platform provide?

The platform integrates 121+ intelligence sources organized across multiple categories. Czech government registries include ARES (business register), Justice.cz (commercial register), RZP (trade licensing), the Insolvency Register, CUZK (land registry), CEDR (subsidies database), and CNB (central bank data), among others. Global intelligence sources include Shodan, Censys, VirusTotal, AbuseIPDB, GreyNoise, and specialized threat feeds. Sanctions screening covers OFAC SDN (US Treasury), the EU Consolidated Sanctions List, and UN Security Council sanctions with fuzzy entity matching. All sources implement a standard adapter interface enabling hot-swapping, unified error handling, and circuit breaker protection. When a primary source fails, the system automatically falls to alternatives and then to cached data, maintaining continuous intelligence gathering even during multi-source outages.

### Q: What is the Perimeter (EASM) module?

Prismatic Perimeter is the platform's External Attack Surface Management capability, designed to compete with commercial products like BitSight, Black Kite, and SecurityScorecard. It provides A-F security ratings computed on a 300-900 numeric scale, automated asset discovery across domains, IP addresses, TLS certificates, cloud resources, and exposed services, and compliance assessment against the NIS2 Directive (EU 2022/2555) and ZKB (Czech Cybersecurity Act 264/2025 Sb.). Ratings are evidence-based with confidence levels attached to each finding. The module exposes a real-time LiveView dashboard at `/perimeter` with sub-pages for asset inventory, compliance assessment, and the advanced EASM view.

### Q: What are color teams and how do they operate?

The platform implements six color-coded security teams with 20 specialized agents. The Gray team (3 agents) performs boundary exploration and edge case discovery in read-only mode. The Red team (4 agents) runs adversarial simulations using five epistemic attack primitives -- truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking -- all executing in sandboxed environments with synthetic data only. The Blue team (4 agents) maintains defensive posture through evidence synthesis and drift detection. The Purple team (4 agents) closes the Red-Blue feedback loop, detecting false closures and managing regression traps. The White team (3 agents) performs constructive verification using property-based testing and formal Lean 4 proofs. The Black team (2 agents) operates under maximum isolation, producing abstract threat models without ever generating executable content. All teams operate under strict safety protocols: no real data, no network access for Red/Black operations, and automated ethics checks every 10-15 seconds.

### Q: What is NABLA Infinity and the Trinity Gate?

NABLA Infinity is the platform's epistemic framework governing how beliefs are formed, validated, and propagated through the system. It enforces seven non-negotiable axioms: Signal Plurality (minimum two independent signals for any belief), Contradiction Evidence (both sides of conflicts must be preserved), Absence Informative (missing signals are tracked as evidence), Time Decay (mandatory timestamps on all data), Unknown Valid ("I don't know" is an acceptable and honest response), Source Independence (independent sources receive higher weight), and Provenance Mandatory (all beliefs must be traceable to their origin). The Trinity Gate is a three-layer validation barrier that every belief must pass before influencing decisions: Structural Consistency (graph-theoretic validation), Logical Consistency (rule-based evaluation), and Formal Necessity (modal logic verification with optional Lean 4 proof). If any gate fails, the operation is halted for review.

### Q: How does the AI Drift detection system work?

The AI Drift module (application `ai_drift`) monitors AI-assisted decisions for statistical drift from established baselines. It uses Kolmogorov-Smirnov and Cramer-von Mises statistical tests to detect when the distribution of AI outputs has shifted significantly from the baseline distribution. When drift is detected, the system generates alerts through configurable channels (webhooks, PubSub events, dashboard notifications), logs the drift event with full provenance, and can trigger automatic baseline recomputation. The module includes a governance decision registry for tracking which AI-influenced decisions were made and their outcomes over time. This is particularly relevant for compliance contexts where organizations must demonstrate that AI systems are operating within expected parameters.

---

## 4. Development and Workflow

These questions address how developers work with the platform, run tests, and contribute code.

### Q: How do I get started with the platform?

The basic setup sequence is: clone the repository, install Elixir 1.19+ and Erlang/OTP, then run `mix deps.get` to fetch dependencies, `mix compile` to build the platform (approximately 45 seconds for a clean build), and `mix test` to execute the test suite. The platform requires PostgreSQL for persistent storage and optionally Redis and Meilisearch for full capabilities. For codebase exploration, the platform provides `mix git_trees` (or the faster shell script `./scripts/git-trees.sh`) which operates approximately 100 times faster than standard `find` commands on the 37,000+ file repository. Individual applications can be compiled and tested in isolation with `mix test apps/prismatic_perimeter`.

### Q: How do I create a new AIAD agent?

Create a YAML file under `.aiad/agents/` following the `agent-spec` schema. The file must define the agent's name, description, domain classification, authority level (L1-L5), available tools and capabilities, behavioral rules, input/output contracts, and NM/ND enforcement compliance block. After creating the file, run `./.aiad/bin/aiad index` to update the agent registry. The platform will automatically discover and validate the new agent definition at the next boot. Every agent must include the mandatory enforcement block declaring compliance with the NO MERCY / NO DOUBTS doctrine.

### Q: How do I add a new command to the platform?

Commands follow the same AIAD standard as agents. Create a YAML file under `.aiad/commands/` following the `command-spec` schema, defining the command's name, syntax, description, parameters, execution logic, and authorization requirements. Run `./.aiad/bin/aiad index` to register it. Commands can be invoked through the platform's command interface and are discoverable through the command registry at `.claude/COMMAND_REGISTRY.md`.

### Q: What is the testing strategy?

The platform uses a multi-level testing approach with 5,864 test files. Unit tests use ExUnit with the Arrange-Act-Assert pattern. Property-based testing discovers edge cases through random input generation. Integration tests run against real database instances rather than mocks. End-to-end tests validate complete workflows. The test suite is organized into three phases: Phase 1 (36 Workflow/Step tests), Phase 2 (41 Storage/Web/Agent tests), and Phase 3 (44 E2E tests). Every bug fix requires mandatory regression tests following a strict protocol: identify the root cause, create a test that fails with unfixed code, apply the fix, verify the test passes. Commits are blocked without compliance.

### Q: How do quality gates work?

Quality gates are automated pre-commit checks that all must pass before any code can be merged. The gate sequence includes: zero compilation warnings (enforced with `--warnings-as-errors`), Credo strict mode compliance (all checks must pass), Dialyzer type analysis (full PLT verification), test suite passage, coverage requirements, and zero Quality Debt Points. The Quality Floor Guardian monitors these metrics continuously with four escalation levels: OPTIMAL (100-99%, monitor only), WARNING (98-99%, alert and investigate), CRITICAL (95-98%, auto-evolution trigger), and EMERGENCY (below 95%, block commits and escalate). The platform currently maintains a perfect 100/100 quality score across all 13 quality domains with zero violations.

---

## 5. Quality and Compliance

These questions address the platform's quality enforcement philosophy, compliance capabilities, and operational standards.

### Q: What does "NO MERCY, NO DOUBTS" mean in practice?

NO MERCY / NO DOUBTS is the platform's universal doctrine governing all development and operational decisions. NO MERCY enforces zero tolerance for incomplete implementations, untested code, quality violations, stubs, mocks, placeholders, TODOs, or FIXMEs. Every line of code must be production-ready from the moment of creation. All quality gates must pass before any merge. Bug fixes without regression tests are rejected. The `--no-verify` flag is absolutely forbidden. NO DOUBTS requires full investigation before action, decisive execution once a decision is made, evidence backing for every claim (through tests, benchmarks, or verification), and validated results with no unvalidated claims or unchecked outputs. Violations are classified from L1 (minor deviation, warning plus immediate correction) through L4 (doubt-compromised, rejection plus supreme review).

### Q: What is the platform's quality score and how is it measured?

The platform maintains a 100/100 quality score measured across 13 domains: Dialyzer (type analysis), Credo (code quality), Compilation (zero warnings), DateTime Precision, Guard Functions, @impl Coverage (709 implementations), Memory Safety, Performance, Regression Prevention, Timing Patterns, TODO Management, Typespec Coverage, and Unsafe Map Access. Each domain must show zero violations for the score to remain at 100. The Quality DNA system (`.claude/quality-dna/current-state.json`) persists quality metrics across development sessions, enabling trend analysis and regression detection over time.

### Q: How does the platform handle NIS2 and ZKB compliance?

The Perimeter compliance engine maps security controls to the requirements of the NIS2 Directive (EU 2022/2555) and the Czech Cybersecurity Act (ZKB 264/2025 Sb.). For each framework, the engine evaluates the target organization's security posture against the specified control requirements, generates gap analysis reports identifying areas of non-compliance, computes compliance scores with confidence levels, and produces remediation guidance. Compliance assessments can be triggered programmatically through the Elixir API (`PrismaticPerimeter.assess_compliance/2`) or through the REST API and LiveView dashboard at `/perimeter/compliance`.

### Q: What audit and traceability features exist?

The platform implements immutable, append-only audit logging through the `prismatic_audit` application. Every state-changing operation produces an audit record with full provenance -- who performed the action, when, from what context, and with what parameters. The NABLA Provenance Mandatory axiom extends this to the epistemic layer: every belief formed by the system must be traceable to its source signals. The combination of audit logging, event sourcing for critical subsystems, and epistemic provenance tracking provides a comprehensive traceability chain from raw intelligence signals through synthesized beliefs to the decisions and actions they inform.

---

## 6. Conclusion and Further Reading

This FAQ covers the most frequently encountered questions about the Prismatic Platform. For deeper exploration of specific topics, consult the following sections of this documentation site:

- **Architecture** -- Technical deep-dive into OTP supervision trees, storage adapters, event sourcing, and the epistemic pipeline
- **Applications** -- Complete catalog of all 93 umbrella applications with their domains and capabilities
- **Agents** -- Documentation of the 434-agent ecosystem, authority levels, and AIAD specification
- **OSINT Sources** -- Detailed reference for all 121+ intelligence source integrations
- **Capabilities** -- Platform doctrines, quality enforcement mechanisms, and evolution protocols
- **Technologies** -- Technology stack reference covering Elixir, Phoenix, PostgreSQL, and all supporting systems
- **Glossary** -- Definitions for platform-specific terminology including AIAD, 3NL, NABLA, OTP, and NM/ND

For questions not addressed here, the platform's CLAUDE.md file (located at the repository root) serves as the authoritative reference for all platform conventions, protocols, and standards.

---

*FAQ content reflects the platform state as of 2026-02-06. Question count and technical details are updated to match the current codebase.*

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
