+++
title = "Umbrella Architecture at Scale: Managing 94 OTP Applications"
date = 2026-03-03
description = "Lessons learned from building and maintaining a 94-app Elixir umbrella project. Covers dependency management, compilation strategies, testing patterns, and when umbrella architecture breaks down."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["elixir", "otp", "umbrella", "architecture", "scaling", "erlang"]
reading_time = "11 min"
keywords = ["Elixir umbrella project", "OTP application architecture", "large Elixir codebase", "umbrella at scale", "Elixir monorepo", "OTP supervision patterns"]
image = "/images/blog/umbrella-architecture.png"
word_count = 1950
date_created = "2026-03-03"
date_modified = "2026-03-03"
quality_score = 85
see_also = ["architecture", "developers", "capabilities"]
image_alt = "Umbrella Architecture at Scale: Managing 94 OTP Applications - Prismatic Platform"
+++

Prismatic Platform is a single Elixir umbrella project containing 94 OTP applications. This is not a typical setup. Most Elixir teams work with 3-10 apps. This post shares what we have learned managing an umbrella at this scale.

## Why Umbrella

The umbrella architecture provides three properties that alternatives lack:

**Compile-time dependency checking**: The Elixir compiler validates that dependencies between apps are declared in `mix.exs`. If `prismatic_web` calls a function in `prismatic_osint_core`, that dependency must be explicit. This prevents accidental coupling.

**Independent compilation**: Each app compiles independently. When you change `prismatic_nabla`, only apps that depend on it recompile. In a monolithic project, any change recompiles everything.

**Release granularity**: You can build releases containing specific subsets of apps. A worker node might include only `prismatic_osint_sources` and `prismatic_storage_ecto`, excluding the entire web interface.

## The 94-App Landscape

Our apps fall into natural layers:

```
Layer 1: Core (12 apps)
├── prismatic              # Core business logic
├── prismatic_auth         # Authentication/authorization
├── prismatic_telemetry    # Metrics and telemetry
├── prismatic_nabla        # Epistemic confidence framework
└── ...

Layer 2: Storage (8 apps)
├── prismatic_storage_core # Storage trait system
├── prismatic_storage_ecto # PostgreSQL adapter
├── prismatic_storage_ets  # In-memory cache
├── prismatic_storage_meilisearch  # Full-text search
└── prismatic_storage_kuzudb       # Graph database

Layer 3: Domain (35 apps)
├── prismatic_osint_core           # OSINT framework
├── prismatic_osint_sources        # 157 OSINT adapters
├── prismatic_compliance           # NIS2/ZKB compliance
├── prismatic_dd                   # Due diligence engine
├── prismatic_perimeter            # EASM system
└── ...

Layer 4: Interface (15 apps)
├── prismatic_web          # Phoenix web interface
├── prismatic_api          # REST API gateway
├── prismatic_mcp          # Model Context Protocol
└── ...

Layer 5: Tools (24 apps)
├── prismatic_agents       # Agent runtime
├── prismatic_quality_intelligence # Quality analysis
└── ...
```

## Dependency Management at Scale

The most critical discipline in a large umbrella is dependency hygiene. Every app declares its dependencies explicitly:

```elixir
# apps/prismatic_dd/mix.exs
defp deps do
  [
    {:prismatic, in_umbrella: true},
    {:prismatic_storage_ecto, in_umbrella: true},
    {:prismatic_nabla, in_umbrella: true},
    {:prismatic_osint_core, in_umbrella: true},
    # External dependencies
    {:ecto_sql, "~> 3.11"},
    {:jason, "~> 1.4"}
  ]
end
```

Rules we enforce:

1. **No circular dependencies** -- the compiler catches these, but they indicate architectural problems
2. **Layer discipline** -- Layer 1 apps never depend on Layer 3+. Storage apps never depend on domain apps.
3. **Explicit over implicit** -- if you use a module from another app, declare the dependency
4. **Version constraints on all external deps** -- no floating versions, no git dependencies pointing at branches

## Compilation Strategy

Full compilation of 94 apps takes time. We use several strategies to keep development fast:

**Focused compilation**: During development, compile only the app you are working on:

```bash
cd apps/prismatic_dd && mix compile
```

**Parallel compilation**: Elixir compiles files in parallel within each app and compiles independent apps in parallel.

**Incremental compilation**: The compiler tracks file dependencies and only recompiles what changed. This works well until you change a shared type or behaviour, which triggers cascading recompilation.

**CI compilation**: In CI, we compile with `--warnings-as-errors` to catch all issues:

```bash
mix compile --warnings-as-errors --force
```

## Testing Patterns

With 94 apps, running the full test suite takes significant time. Our approach:

**Per-app testing**: Most development uses per-app tests:

```bash
cd apps/prismatic_dd && mix test
```

**Changed-app testing**: CI runs tests only for apps that changed (based on git diff) plus their dependents.

**Integration tagging**: Cross-app tests are tagged:

```elixir
@tag :integration
test "DD pipeline processes OSINT results" do
  # This test touches prismatic_dd + prismatic_osint_core
end
```

**Async test isolation**: Tests that touch the database use `async: false` to prevent pool contention. Pure unit tests use `async: true`.

## When Umbrella Breaks Down

The umbrella architecture has limitations:

**Shared configuration**: All apps share the same `config/` directory. This means every app's configuration is loaded at startup, even if the app is not started. We mitigate this with runtime configuration:

```elixir
# config/runtime.exs
if config_env() == :prod do
  config :prismatic_storage_ecto, PrismaticStorageEcto.Repo,
    url: System.get_env("DATABASE_URL")
end
```

**Mix task namespace collisions**: Two apps cannot define the same mix task name. We prefix all custom tasks with their app name.

**Release complexity**: Building a release with 94 apps requires careful configuration of which apps start automatically and which are loaded on demand.

**IDE performance**: Language servers and code intelligence tools can struggle with 94 apps. We use `.formatter.exs` at the root level and app-specific `.credo.exs` files.

## Lessons Learned

After 18 months with this architecture:

1. **Start with fewer, larger apps** -- split when you have a clear boundary, not preemptively
2. **Enforce layer discipline from day one** -- it is nearly impossible to untangle later
3. **Invest in per-app testing** -- the full suite is for CI, not local development
4. **Document dependency decisions** -- why does app X depend on app Y?
5. **Monitor compilation times** -- if full compile exceeds 2 minutes, investigate dependency chains

The umbrella architecture is not for every project. It shines when you have genuine domain boundaries, shared infrastructure, and a team that understands OTP supervision. For most Elixir projects, a single app with well-organized contexts is sufficient.

---

*Learn more about our architecture at [Architecture Documentation](@/architecture/_index.md) or explore the [Developer Portal](@/developers/_index.md) for contribution guidelines.*
