+++
title = "From Monolith to 94 Apps: Our Migration Journey"
date = 2026-03-30
description = "The story of how Prismatic Platform evolved from a single Elixir application to a 94-app umbrella project. Decisions, mistakes, and lessons from 18 months of progressive decomposition."

[extra]
author = "Tomas Korcak (korczis)"
category = "deep-dive"
tags = ["migration", "monolith", "umbrella", "architecture", "elixir", "decomposition"]
reading_time = "12 min"
keywords = ["monolith to microservices", "Elixir umbrella migration", "progressive decomposition", "architecture evolution", "monolith decomposition strategy"]
image = "/images/blog/monolith-to-94.png"
word_count = 2000
date_created = "2026-03-30"
date_modified = "2026-03-30"
quality_score = 86
see_also = ["architecture", "developers", "capabilities"]
image_alt = "From Monolith to 94 Apps: Our Migration Journey - Prismatic Platform"
+++

Prismatic Platform started as a single Elixir application. Today it is 94 OTP applications in an umbrella project. This post is the honest story of that journey: what worked, what did not, and what we would do differently.

## Phase 1: The Monolith (Month 1-3)

The initial application was a standard Phoenix project:

```
prismatic/
├── lib/
│   ├── prismatic/
│   │   ├── osint/          # OSINT adapters
│   │   ├── storage/        # Database operations
│   │   ├── auth/           # Authentication
│   │   └── web/            # Phoenix endpoint
│   └── prismatic_web/
│       ├── controllers/
│       ├── live/
│       └── templates/
└── test/
```

This worked perfectly for the first few months. Everything compiled together, tested together, and deployed together. Context switching between OSINT and web code was a single directory change.

**Why we moved on**: At around 50 modules and 15 OSINT adapters, compile times exceeded 30 seconds for any change. More importantly, there was no explicit boundary between OSINT logic, storage, and web rendering. Changes in one area caused unexpected cascading recompilation.

## Phase 2: First Extraction (Month 4-6)

The first extraction was storage. We created `prismatic_storage_core` as the trait system and `prismatic_storage_ets` as the first adapter:

```
apps/
├── prismatic/                    # Core business logic
├── prismatic_storage_core/       # Storage behaviour
├── prismatic_storage_ets/        # ETS adapter
├── prismatic_storage_ecto/       # PostgreSQL adapter
└── prismatic_web/                # Phoenix web interface
```

Five apps. Clean boundaries between storage implementations and business logic. Compile times dropped back to 5-10 seconds for most changes.

**Mistake #1**: We extracted storage before OSINT. In hindsight, OSINT had more independent modules and would have been an easier first extraction. Storage had deep coupling to the web layer that took weeks to untangle.

## Phase 3: OSINT Explosion (Month 7-12)

OSINT adapter development accelerated. We needed a framework:

```
apps/
├── prismatic_osint_core/         # Adapter behaviour + pipeline
├── prismatic_osint_sources/      # All OSINT adapters (self-registering)
├── prismatic_osint_monitoring/   # Continuous monitoring
└── ...
```

The self-registration pattern was the breakthrough: adapters register themselves at compile time using `@after_compile` hooks. No manual configuration, no adapter lists to maintain.

By month 12, we had 40+ apps. Compile times were fast for individual apps but the full umbrella took 2+ minutes.

**Mistake #2**: We created too many small apps. Some apps had 2-3 modules. The overhead of mix.exs configuration, test helpers, and supervision trees was not justified. We later consolidated several of these.

## Phase 4: Domain Specialization (Month 13-15)

Feature development drove further extraction:

- `prismatic_perimeter` / `prismatic_perimeter_web` -- EASM system
- `prismatic_dd` -- Due diligence engine
- `prismatic_compliance` -- NIS2/ZKB compliance
- `prismatic_nabla` -- Epistemic confidence framework
- `prismatic_hawkeye` / `prismatic_hawkeye_web` -- Visitor intelligence

Each domain got its own app (or app pair for backend/frontend separation). This enabled independent development and testing.

**Mistake #3**: We did not enforce layer discipline early enough. Some domain apps acquired dependencies on other domain apps, creating a tangled dependency graph. We spent Gen 16-17 untangling these cross-domain dependencies.

## Phase 5: Platform Infrastructure (Month 16-18)

The final wave added platform-level infrastructure:

- `prismatic_agents` -- Agent runtime for 552 AIAD agents
- `prismatic_mcp` -- Model Context Protocol server
- `prismatic_telemetry` -- Unified telemetry
- `prismatic_quality_intelligence` -- Quality analysis
- `prismatic_safety` -- Quality floor guardian
- `prismatic_singularity` -- Self-healing supervision

This brought us to the current 94-app count.

## What Worked

**Clear extraction criteria**: We extracted when we had a clear domain boundary with a small interface surface. OSINT adapters were ideal -- they share a single behaviour with 2 callbacks.

**Self-registration patterns**: The adapter, agent, and Academy topic self-registration pattern eliminated configuration management. Adding a module is sufficient; the system discovers it.

**Backend/frontend separation**: Apps like `prismatic_perimeter` (logic) and `prismatic_perimeter_web` (LiveView) allow the backend to be used without the web interface.

**ETS-backed registries**: Fast, concurrent data access without GenServer bottlenecks. Used consistently across OSINT adapters, agents, blog articles, and platform metrics.

## What Did Not Work

**Premature extraction**: Some apps were created because we thought they would grow, not because they needed isolation. These accumulated as maintenance overhead without providing value.

**Shared configuration complexity**: 94 apps sharing a single config directory creates confusion about where configuration should live. Runtime configuration helped but did not eliminate the problem.

**Test isolation challenges**: Some tests required data from multiple apps, forcing us to carefully manage database connection pools and async test configuration.

**IDE performance**: Language servers and code intelligence tools struggle with 94 apps. We adapted our tooling workflow to focus on individual apps during development.

## Lessons for Others

1. **Start monolithic** -- extract when you have evidence of the boundary, not when you think you might need it
2. **Extract bottom-up** -- storage and shared utilities first, then domain logic, then web layer
3. **Enforce dependencies from day one** -- the dependency graph is nearly impossible to fix retroactively
4. **Minimize app count** -- every app has overhead; create apps only when the boundary justifies it
5. **Self-registration over configuration** -- let modules declare their existence rather than maintaining lists
6. **Test at multiple levels** -- unit tests per app, integration tests across apps, E2E tests for workflows
7. **Track compile times** -- compile time is the canary for dependency problems

## Current State

The 94-app umbrella is stable and productive. Individual app compile times are 2-5 seconds. Per-app test runs complete in seconds. The full umbrella compile takes 2-3 minutes and the full test suite takes longer, but these run in CI, not during local development.

The architecture supports independent feature development: an OSINT adapter developer never needs to compile the web layer. A frontend developer never needs to compile the compliance engine. This independence is the primary value of the umbrella structure.

## Conclusion

The journey from monolith to 94 apps took 18 months and three major refactoring phases. The result is a system where domain boundaries are explicit, compilation is fast for focused work, and new features can be added without understanding the entire codebase. It is not the architecture we would have designed from scratch -- it is the architecture that emerged from progressive extraction guided by real development needs.

---

*Read more about the architecture at [Architecture Documentation](@/architecture/_index.md) or explore the [Umbrella Structure](@/blog/umbrella-architecture-at-scale.md) for technical patterns.*
