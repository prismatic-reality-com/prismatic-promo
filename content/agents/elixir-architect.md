+++
title = "elixir-architect"
weight = 145
[extra]
domain = "elixir-otp"
level = "L3"
description = "Senior Elixir/OTP architect enforcing production-grade patterns, OTP principles, and functional programming discipline. Zero tolerance for shortcuts, hacks, or JavaScript mindset."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["elixir-architect", "Senior", "ElixirOTP", "Zero", "JavaScript", "agents", "agent", "Prismatic Platform", "Elixir"]
tags = ["agents", "agent", "elixir-architect", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "elixir-architect - Prismatic Platform"
+++

## Overview

The [Elixir](/glossary/elixir/) Architect operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Elixir [OTP](/glossary/otp/) domain of the Prismatic Platform. This agent enforces production-grade patterns, OTP principles, and functional programming discipline across the entire codebase. With zero tolerance for shortcuts, hacks, or imperative mindsets, the Elixir Architect ensures that every module, process, and [supervision tree](/glossary/supervision-tree/) adheres to the standards that make [BEAM](/glossary/beam/)-based systems reliable at scale.

The Prismatic Platform runs on Elixir 1.19+ with a 90-application [umbrella](/glossary/umbrella-application/) architecture spanning over 6,600 source files and approximately 2.8 million lines of code. At this scale, architectural discipline is not optional -- it is the difference between a system that runs reliably for years and one that collapses under its own complexity. The Elixir Architect reviews every structural decision against OTP principles: proper [process isolation](/glossary/process-isolation/), supervision tree design, message-passing patterns, and functional purity. Code that could be written identically in Node.js is rejected on principle, because if the solution does not leverage OTP and BEAM capabilities, it is the wrong solution for this platform.

The meta-rule -- "if the same solution could be written identically in Node.js, it is WRONG" -- captures the Elixir Architect's core philosophy. The BEAM runtime provides capabilities that no other runtime offers: lightweight processes, preemptive scheduling, fault isolation through process boundaries, hot code reloading, and location-transparent messaging. Code that ignores these capabilities wastes the platform's most significant architectural advantage.

## Operational Domain

The Elixir OTP domain encompasses all aspects of Elixir language usage, OTP design patterns, and BEAM runtime optimization within the platform. This includes [GenServer](/glossary/genserver/) design, supervision hierarchies, [ETS](/glossary/ets/) usage patterns, [hot code reload](/glossary/hot-code-reload/)ing strategies, and [Phoenix](/glossary/phoenix/)/[LiveView](/glossary/liveview/) architectural decisions. Every line of Elixir code in the platform falls within the Elixir Architect's review authority.

The domain requires deep understanding of both Elixir's high-level abstractions and the underlying BEAM primitives they compile to. The Elixir Architect understands how pattern matching compiles to instruction sequences, how GenServer calls translate to synchronous message exchanges, how supervision strategies map to process monitoring semantics, and how ETS tables implement concurrent data access. This understanding enables architectural guidance that is grounded in runtime behavior, not just language-level abstractions.

## Key Capabilities

The Elixir Architect provides six core architectural review and enforcement capabilities.

**OTP pattern enforcement** ensures that every stateful entity has its own process, supervision trees are documented before implementation, and process isolation is maintained. The architect reviews process boundaries to verify that failures in one component cannot cascade to others, that message protocols are well-defined, and that process lifetimes align with the data they manage. GenServer state is reviewed for size (large state should use ETS), access patterns (concurrent reads should use ETS or Agent), and lifecycle management.

**Functional purity review** verifies that side effects occur only at system edges and business logic remains in [pure function](/glossary/pure-function/)s with explicit inputs and outputs. The architect enforces a clear separation between pure computation and effectful operations: data transformation, validation, and business rules are implemented as pure functions; database access, API calls, and file I/O happen at module boundaries through explicit function calls. This separation makes code testable, composable, and reasonably predictable.

**Supervision tree architecture** designs and validates hierarchical process structures that provide [fault tolerance](/glossary/fault-tolerance/) through proper restart strategies. The architect evaluates supervision tree depth, restart intensity configuration, process dependency ordering, and the choice between static and dynamic supervision. Each supervision tree must be documented with a visual representation before implementation begins, showing process relationships, restart strategies, and failure propagation paths.

**ETS and state management review** examines concurrent data access patterns, table ownership models, and read/write optimization strategies. The architect distinguishes between appropriate ETS usage (shared read-heavy data, caching, agent registries) and inappropriate usage (primary data storage that should use a database, small data that fits in GenServer state). ETS table configuration is reviewed for access type (set, ordered_set, bag), read/write concurrency settings, and heir configuration for crash recovery.

**Phoenix and LiveView architectural review** evaluates real-time interface implementations for proper socket management, efficient diff computation, component isolation, and state management. The architect ensures that LiveView processes maintain minimal state (pushing computation to the view layer), that component boundaries align with update granularity, and that PubSub usage follows platform conventions for real-time event distribution.

**Anti-pattern detection** identifies forbidden patterns that indicate imperative thinking or architectural shortcuts. The following patterns trigger immediate review failure:

| Anti-Pattern | Why It Is Wrong | Correct Approach |
|-------------|-----------------|------------------|
| Shared mutable state | Violates process isolation | Each process owns its state |
| Manager/Handler/Utils naming | Meaningless names hide unclear responsibilities | Name by domain concept |
| Swallowed exceptions | Hides failure information | Let it crash, handle at supervision level |
| `Process.sleep` in production | Blocks scheduler thread | Use `Process.send_after` or state machines |
| Long-running `handle_call` | Blocks caller process | Use `handle_cast` + reply later, or async task |
| `String.to_atom` with user input | Atom table exhaustion | Use `String.to_existing_atom` or keep as string |

## Architectural Review Process

Every significant Elixir code change undergoes architectural review through a structured evaluation process.

```
Submission --> Pattern Analysis --> OTP Compliance --> Functional Purity --> Approval
     |               |                  |                    |                 |
  PR/change      Anti-pattern       Process design       Side effect       Merge
  submission     scan               evaluation           isolation         permitted
                 Naming review      Supervision check    Pure function     or
                 Code smell         State management     verification      rejected
                 detection          review
```

Review outcomes are binary: approved or rejected. There is no "approved with concerns" or "approved for now" -- code either meets the platform's architectural standards or it does not. Rejected code receives specific feedback identifying the violations and recommending corrections.

## Quality Gate Integration

The Elixir Architect's enforcement integrates with the platform's automated quality gate pipeline.

| Gate | Tool | Standard | Enforcement |
|------|------|----------|-------------|
| Compilation | `mix compile` | `--warnings-as-errors` | Blocking |
| Static analysis | `mix credo --strict` | All Credo checks | Blocking |
| Type checking | `mix dialyzer` | Zero type errors | Blocking |
| Test coverage | `mix test --cover` | 100% on new code | Blocking |
| Documentation | ExDoc annotations | All public functions | Blocking |

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command. The Elixir Architect has authority to reject any code change that violates OTP principles, mandate architectural patterns across all umbrella applications, and escalate repeated violations to L1 supreme authority.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [code-review-specialist-agent-v20](/agents/code-review-specialist-agent-v20/) | Review Partner | Coordinates on code-level review with Elixir-specific architectural focus |
| [database-architecture-specialist](/agents/database-architecture-specialist/) | Data Layer | Ensures [Ecto](/glossary/ecto/) schemas and database interactions follow OTP principles |
| [fix-specialist](/agents/fix-specialist/) | Remediation | Handles fixes for identified architectural violations |
| [elixir-core-specialist](/agents/elixir-core-specialist/) | Implementation | Translates architectural decisions into production implementations |

## The Meta-Rule

The Elixir Architect's most consequential enforcement is the meta-rule: if the same solution could be written identically in Node.js, it is wrong. This rule captures the fundamental requirement that Elixir code must leverage the BEAM runtime's unique capabilities. Stateful computations should use processes, not in-memory data structures with locking. Concurrent operations should use message passing, not callbacks or promises. Failure handling should use supervision trees, not try-catch blocks. Real-time features should use LiveView's server-rendered approach, not client-side JavaScript frameworks.

This meta-rule is not about language chauvinism. It is about ensuring that the platform receives the architectural benefits -- fault tolerance, scalability, hot code reloading, runtime introspection -- that justified the choice of Elixir and OTP in the first place.

## Enforcement

The Elixir Architect enforces [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine with particular severity. Every Elixir module must use `{:ok, _}` / `{:error, _}` return patterns. No magic macros beyond boilerplate reduction. All code must compile with `--warnings-as-errors` and pass `mix credo --strict`. Violations trigger immediate L2 blocking with mandatory correction before any merge is permitted. There are no exceptions, no deferrals, and no "we will fix it later" concessions.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)