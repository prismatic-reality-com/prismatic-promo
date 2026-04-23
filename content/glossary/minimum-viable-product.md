+++
title = "Minimum Viable Product"
weight = 50
[extra]
tags = ["glossary", "product", "agile", "strategy", "development", "iteration", "lean"]
description = "A development strategy that delivers the smallest functional version of a product capable of validating core hypotheses with real users, enabling evidence-based iteration rather than speculative feature accumulation"
category = "product"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["proof-of-concept", "continuous-integration", "testing", "quality-gates", "architecture", "scalability", "iteration", "continuous-deployment", "feature-flag", "telemetry"]
keywords = ["minimum viable product software", "MVP development strategy", "lean startup MVP", "Elixir MVP architecture", "iterative product development", "hypothesis-driven development", "MVP vs prototype", "feature prioritization MVP", "build-measure-learn", "MVP quality standards"]
difficulty_level = "intermediate"
platform_relevance = "high"
elixir_version = "1.19+"
otp_version = "27+"
last_updated = "2026-02-22"
word_count = 2107
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Minimum Viable Product - Prismatic Platform"
+++

## Definition

A Minimum Viable Product (MVP) is the smallest functional version of a product that can be released to real users to validate core hypotheses about value, usability, and feasibility. The MVP concept, popularized by Eric Ries in "The Lean Startup," addresses a fundamental problem in product development: the uncertainty about whether what you are building is what users actually need. Rather than spending months or years building a complete product based on assumptions, the MVP approach delivers a stripped-down but functional version that generates real user feedback, enabling evidence-based iteration.

The critical distinction in the MVP concept lies in the word "viable." An MVP is not a broken prototype, a proof of concept, or a demo. It is a product that users can actually use for its intended purpose, even if it lacks advanced features, polish, or scale. Viability means the core value proposition works: the fundamental problem the product solves is addressed, the critical user journey is complete, and the quality bar meets the minimum standard for real usage. What an MVP lacks are secondary features, edge case handling, and optimization -- things that can be added based on observed user behavior rather than predicted user needs.

## Overview

The MVP philosophy challenges a deeply ingrained instinct in software engineering: the desire for completeness. Engineers naturally want to handle every edge case, optimize every query, and build every feature before releasing. This instinct, while admirable from a craftsmanship perspective, frequently leads to products that are technically excellent but miss the market. The MVP counters this by reframing the release decision from "is it complete?" to "is it sufficient to learn what we need to learn?"

This reframing has profound implications for architecture, quality, and engineering culture. A well-executed MVP is not an excuse for shoddy engineering. Instead, it requires harder architectural decisions: which components need production-grade quality from day one (authentication, data integrity, core business logic) and which can be deferred (admin dashboards, reporting, advanced search). It demands clear thinking about what hypotheses the product tests and what metrics will validate or invalidate those hypotheses.

### The Build-Measure-Learn Cycle

The MVP sits within a larger iterative framework:

```
    ┌─────────────────────────────────────────────┐
    │                                             │
    │   BUILD (MVP)                               │
    │   Implement minimum feature set             │
    │                     │                       │
    │                     v                       │
    │   MEASURE                                   │
    │   Collect usage data, user feedback          │
    │                     │                       │
    │                     v                       │
    │   LEARN                                     │
    │   Validate/invalidate hypotheses             │
    │                     │                       │
    │                     v                       │
    │   DECIDE                                    │
    │   Persevere, pivot, or abandon              │
    │                     │                       │
    └─────────────────────┘                       │
                                                  │
    (Loop until product-market fit achieved)       │
    └─────────────────────────────────────────────┘
```

Each cycle takes the minimum time possible, reducing the cost of being wrong and increasing the speed of learning. In practice, an MVP cycle for a software product might be 2-6 weeks, compared to 6-18 months for a traditional waterfall release.

### MVP in Platform Engineering

In platform engineering contexts like the Prismatic Platform, the MVP concept applies not only to user-facing products but also to internal components, frameworks, and tools. The Prismatic Perimeter EASM module exemplifies this: its M46 milestone delivered a minimum viable external attack surface management system with security ratings (A-F), basic asset discovery, NIS2/ZKB compliance assessment, and a LiveView dashboard. These features validated the core hypothesis that security posture can be assessed and rated through external scanning, while deferring advanced features like continuous monitoring, historical trend analysis, and API-driven automation to subsequent iterations.

## Technical Details

### MVP Architecture in Elixir/OTP

Designing an MVP architecture in Elixir requires balancing the desire for production-grade OTP patterns with the need to ship quickly. The key insight is that OTP's supervision tree architecture naturally supports MVP development: you can build a minimal supervision tree with core GenServers and add additional processes, workers, and supervisors as the product evolves.

```elixir
defmodule PrismaticMVP.Application do
  @moduledoc """
  MVP application demonstrating a minimal but production-grade
  OTP supervision tree. Core services (auth, data, web) are
  included from day one. Analytics, notifications, and advanced
  features are added in subsequent iterations.
  """

  use Application

  @impl Application
  def start(_type, _args) do
    children = [
      # MVP Core: these services are essential from day one
      {PrismaticMVP.Repo, []},
      {PrismaticMVP.Auth.TokenStore, []},
      {PrismaticMVP.Core.Engine, []},

      # MVP Web: minimal LiveView interface
      {PrismaticMVPWeb.Endpoint, []},

      # MVP Telemetry: measure from day one, even in MVP
      {PrismaticMVP.Telemetry.Reporter, interval: :timer.seconds(30)}

      # DEFERRED: These will be added in post-MVP iterations
      # {PrismaticMVP.Analytics.Pipeline, []},
      # {PrismaticMVP.Notifications.Dispatcher, []},
      # {PrismaticMVP.Search.Indexer, []},
      # {PrismaticMVP.Reports.Generator, []},
    ]

    opts = [strategy: :one_for_one, name: PrismaticMVP.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### Feature Flag-Gated MVP Expansion

Feature flags enable progressive MVP expansion without code branching or separate deployments:

```elixir
defmodule PrismaticMVP.FeatureGate do
  @moduledoc """
  Feature gate for progressive MVP expansion. Controls which
  features are available based on configuration, user cohort,
  or rollout percentage. Enables A/B testing of new features
  and gradual rollout from MVP to full product.
  """

  use GenServer

  @type feature :: atom()
  @type gate_config :: %{
    enabled: boolean(),
    rollout_percentage: float(),
    allowed_users: MapSet.t(String.t()),
    description: String.t(),
    added_in: String.t()
  }

  @mvp_features %{
    core_workflow: %{
      enabled: true, rollout_percentage: 100.0,
      allowed_users: MapSet.new(), description: "Core MVP workflow",
      added_in: "v0.1.0"
    },
    basic_auth: %{
      enabled: true, rollout_percentage: 100.0,
      allowed_users: MapSet.new(), description: "Basic authentication",
      added_in: "v0.1.0"
    },
    dashboard: %{
      enabled: true, rollout_percentage: 100.0,
      allowed_users: MapSet.new(), description: "Minimal dashboard",
      added_in: "v0.1.0"
    }
  }

  @post_mvp_features %{
    advanced_search: %{
      enabled: false, rollout_percentage: 0.0,
      allowed_users: MapSet.new(), description: "Full-text search",
      added_in: "v0.2.0"
    },
    analytics: %{
      enabled: false, rollout_percentage: 0.0,
      allowed_users: MapSet.new(), description: "Usage analytics",
      added_in: "v0.2.0"
    },
    notifications: %{
      enabled: false, rollout_percentage: 0.0,
      allowed_users: MapSet.new(), description: "Email/push notifications",
      added_in: "v0.3.0"
    },
    reporting: %{
      enabled: false, rollout_percentage: 0.0,
      allowed_users: MapSet.new(), description: "Export and reporting",
      added_in: "v0.3.0"
    }
  }

  @spec enabled?(feature()) :: boolean()
  def enabled?(feature) do
    GenServer.call(__MODULE__, {:enabled?, feature, nil})
  end

  @spec enabled?(feature(), String.t()) :: boolean()
  def enabled?(feature, user_id) do
    GenServer.call(__MODULE__, {:enabled?, feature, user_id})
  end

  @spec enable(feature()) :: :ok
  def enable(feature) do
    GenServer.call(__MODULE__, {:enable, feature})
  end

  @impl GenServer
  def init(_opts) do
    features = Map.merge(@mvp_features, @post_mvp_features)
    {:ok, %{features: features}}
  end

  @impl GenServer
  def handle_call({:enabled?, feature, user_id}, _from, state) do
    result =
      case Map.get(state.features, feature) do
        nil -> false
        %{enabled: false} -> false
        %{enabled: true, allowed_users: users, rollout_percentage: pct} ->
          cond do
            user_id != nil and MapSet.member?(users, user_id) -> true
            pct >= 100.0 -> true
            pct <= 0.0 -> false
            true -> :erlang.phash2(user_id || "", 100) < pct
          end
      end

    {:reply, result, state}
  end

  @impl GenServer
  def handle_call({:enable, feature}, _from, state) do
    new_features = Map.update!(state.features, feature, fn config ->
      %{config | enabled: true, rollout_percentage: 100.0}
    end)
    {:reply, :ok, %{state | features: new_features}}
  end
end
```

### MVP Metrics Collection

An MVP must include measurement from day one to validate hypotheses:

```elixir
defmodule PrismaticMVP.HypothesisTracker do
  @moduledoc """
  Tracks MVP hypothesis validation metrics. Each hypothesis
  has defined success criteria that are evaluated against
  collected usage data to determine whether the MVP validates
  or invalidates the hypothesis.
  """

  @type hypothesis :: %{
    id: String.t(),
    statement: String.t(),
    metric: atom(),
    success_threshold: number(),
    current_value: number(),
    status: :untested | :validating | :validated | :invalidated,
    started_at: DateTime.t(),
    evidence: [map()]
  }

  @spec define_hypothesis(String.t(), String.t(), atom(), number()) :: hypothesis()
  def define_hypothesis(id, statement, metric, threshold) do
    %{
      id: id,
      statement: statement,
      metric: metric,
      success_threshold: threshold,
      current_value: 0,
      status: :untested,
      started_at: DateTime.utc_now(),
      evidence: []
    }
  end

  @spec record_evidence(hypothesis(), number(), map()) :: hypothesis()
  def record_evidence(hypothesis, value, context \\ %{}) do
    evidence = %{value: value, recorded_at: DateTime.utc_now(), context: context}

    updated = %{hypothesis |
      current_value: value,
      evidence: [evidence | hypothesis.evidence],
      status: :validating
    }

    evaluate_hypothesis(updated)
  end

  @spec evaluate_hypothesis(hypothesis()) :: hypothesis()
  def evaluate_hypothesis(%{evidence: evidence} = hypothesis) when length(evidence) < 10 do
    hypothesis
  end

  def evaluate_hypothesis(hypothesis) do
    if hypothesis.current_value >= hypothesis.success_threshold do
      %{hypothesis | status: :validated}
    else
      %{hypothesis | status: :invalidated}
    end
  end

  @spec summary(hypothesis()) :: String.t()
  def summary(hypothesis) do
    "#{hypothesis.id}: #{hypothesis.status} " <>
    "(#{hypothesis.current_value}/#{hypothesis.success_threshold}, " <>
    "#{length(hypothesis.evidence)} data points)"
  end
end
```

## Implementation

Implementing an MVP requires a disciplined approach that resists both over-engineering and under-engineering.

### Step 1: Hypothesis Definition

Before writing code, define the hypotheses the MVP will test. Each hypothesis should be specific, measurable, and falsifiable. Example: "Security engineers will use an A-F security rating to assess third-party vendor risk" (Prismatic Perimeter hypothesis). Define the success metric (e.g., "50% of trial users run at least 3 security assessments in the first week") and the data collection mechanism.

### Step 2: Feature Scoping

Map each hypothesis to the minimum features required to test it. Use the MoSCoW method (Must have, Should have, Could have, Won't have) to ruthlessly prioritize. Features that do not directly test a hypothesis are deferred. The Prismatic Perimeter MVP included security ratings, basic asset discovery, and compliance assessment (Must have) while deferring continuous monitoring, API access, and multi-tenant isolation (Won't have for MVP).

### Step 3: Architecture for Evolution

Design the architecture to support iteration, not just the MVP feature set. This means clean module boundaries, well-defined APIs between components, and supervision tree structures that accommodate additional processes. OTP's "let it crash" philosophy aligns naturally with MVP development: build the happy path correctly, let the supervisor handle unexpected failures, and add resilience incrementally.

### Step 4: Quality in the Core

Apply full production-grade quality to the MVP's core: authentication, data integrity, and the primary value proposition. Apply reduced quality standards to secondary elements: admin interfaces, edge cases, and cosmetic polish. This selective quality investment maximizes learning speed while protecting user trust. The Prismatic Platform's quality gates apply to all code, but the feature scope of an MVP is deliberately constrained.

### Step 5: Instrumentation from Day One

Embed telemetry and usage tracking into the MVP from the first commit. Without measurement, the MVP cannot fulfill its purpose of validating hypotheses. Track not just technical metrics (latency, errors) but behavioral metrics (which features are used, in what order, how often, by whom). The HypothesisTracker module above demonstrates this pattern.

### Step 6: Release and Learn

Release to a defined cohort (beta users, internal team, design partners) and collect feedback through both quantitative metrics and qualitative interviews. Resist the urge to fix cosmetic issues before gathering learning. The goal is not a polished product but validated understanding of user needs.

## Comparison

### MVP vs. Prototype

| Dimension | MVP | Prototype |
|-----------|-----|-----------|
| **Users** | Real users in real scenarios | Internal team or focus groups |
| **Quality** | Production-grade core, minimal scope | Throwaway quality, exploration-focused |
| **Data** | Real data, real transactions | Synthetic or mock data |
| **Purpose** | Validate market hypotheses | Validate technical feasibility |
| **Lifecycle** | Evolves into the product | Discarded after learning |
| **Deployment** | Production infrastructure | Local or staging only |

### MVP vs. MMP (Minimum Marketable Product)

The Minimum Marketable Product extends the MVP by adding the minimum polish, documentation, and completeness required for commercial viability. An MVP may be functional but rough around the edges; an MMP is ready for paying customers. The MMP typically follows one or more MVP iterations that have validated the core hypotheses.

### MVP vs. Walking Skeleton

A walking skeleton is a thin end-to-end implementation that exercises the full architectural stack without implementing complete features. It is narrower than an MVP (covering the technical architecture rather than the user experience) and is used primarily to validate architectural decisions. An MVP includes enough feature depth for user validation; a walking skeleton may only demonstrate that the pieces connect.

### MVP vs. Feature Creep

Feature creep is the MVP's natural enemy. The tendency to add "just one more feature" before release undermines the MVP's core value: speed to learning. Every additional feature delays feedback and increases the cost of being wrong about user needs. Discipline in maintaining the minimum scope is the hardest aspect of MVP development.

## Best Practices

**Define "viable" before you start building.** The most common MVP failure is building something that is not viable -- too incomplete for users to extract value. Before coding, define the minimum complete user journey that delivers the core value proposition. If the MVP cannot stand alone as a useful product for its intended users, it needs more scope, not less.

**Invest in architecture, economize on features.** A well-architected MVP with three features is more valuable than a poorly-architected product with thirty features. Clean module boundaries, proper supervision trees, and well-defined APIs enable rapid iteration in subsequent cycles. Poor architecture calcifies and makes every subsequent change more expensive.

**Measure hypothesis validation, not feature usage.** Usage metrics (DAU, session length, click-through rates) are inputs to hypothesis evaluation, not goals in themselves. Define hypotheses before launch and evaluate them rigorously after collecting sufficient data. A feature with high usage may still invalidate its hypothesis if users use it differently than expected.

**Set a time box and hold it.** MVP development should have a fixed time constraint (typically 2-6 weeks for software). When the time box expires, ship whatever is ready that constitutes a viable product. If nothing viable exists within the time box, the scope was too ambitious, not the timeline too short.

**Communicate MVP scope explicitly.** Users, stakeholders, and team members must understand that the MVP intentionally lacks features. Without explicit communication, an MVP release is perceived as a low-quality product rather than a strategic learning tool. Frame the release as "Phase 1 focused on X, with Y and Z coming in subsequent releases."

**Plan the next iteration before launching the MVP.** Having a clear plan for what happens after MVP launch (regardless of outcomes) maintains team momentum and demonstrates that the MVP is a beginning, not an end.

## Common Pitfalls

**The "M" is too minimal.** An MVP that is too stripped-down fails to deliver value, generating negative user feedback that invalidates the entire approach rather than the specific hypotheses. Users need enough functionality to achieve their goal, even if the path is not optimized.

**The "V" is ignored.** Shipping broken, buggy software and calling it an MVP damages trust and produces misleading feedback. Users who encounter bugs cannot evaluate the core value proposition because they are distracted by quality issues. Core functionality must work reliably.

**Building an MVP with no measurement.** An MVP that does not collect usage data or user feedback is just a rushed product release. Without measurement, the build-measure-learn cycle breaks, and the team cannot make evidence-based decisions about what to build next.

**Refusing to kill a failed MVP.** The MVP approach is only valuable if the team is willing to pivot or abandon based on evidence. If the organization has already committed to the product regardless of MVP results, the MVP exercise is theater. The willingness to invalidate hypotheses and change direction is the MVP's core value.

**Confusing MVP with technical debt.** An MVP defers features, not quality. Cutting corners on architecture, testing, or security to ship faster creates technical debt that compounds as the product evolves. The MVP's limited scope should reduce development time; quality shortcuts do not.

**One MVP fits all.** Different markets, user segments, and problem domains require different MVP strategies. An enterprise security tool MVP (like Prismatic Perimeter) requires higher quality and completeness than a consumer social app MVP, because enterprise buyers have lower tolerance for rough edges and higher expectations for reliability.

## Use Cases

### Prismatic Perimeter EASM MVP

The Prismatic Perimeter module delivered its M46 MVP with security ratings (A-F grades, 300-900 numeric scores), basic asset discovery (domains, IPs, certificates), NIS2/ZKB compliance assessment, and a LiveView dashboard. These features validated the core hypothesis that security posture can be externally assessed and rated. Post-MVP iterations added continuous monitoring, historical trends, and API-driven automation based on user feedback indicating which capabilities were most valued.

### Prismatic API Auto-Discovery

The REST API gateway MVP delivered generic endpoint dispatch (`/api/v1/:app/:action`), automatic module discovery, basic OpenAPI specification generation, and SwaggerUI. This validated the hypothesis that automatic introspection could replace manual API definition. Subsequent iterations added type mapping refinements, authentication, and rate limiting.

### Open Source Package Launch

The platform's 4 OSS packages (SDK, Plugin Kit, Security, UI) each started as MVPs with minimal API surfaces, basic documentation, and core functionality. Usage patterns from early adopters guided API evolution, feature prioritization, and documentation improvements. The SDK's initial release included only 5 functions; the current version includes 40+, with each addition driven by observed developer needs.

### Internal Tool Validation

Internal engineering tools (Quality Floor Guardian, AutoEvolve scanner, Git Trees) were developed as MVPs validated by the platform's own engineering team. The Quality Floor Guardian MVP simply reported quality scores; based on team feedback, it evolved to include automated blocking, trend analysis, and predictive warnings.

## Related Concepts

- [Proof of Concept](@/glossary/proof-of-concept.md) -- Technical feasibility validation that often precedes MVP development
- [Continuous Integration](@/glossary/continuous-integration.md) -- Automation infrastructure enabling rapid MVP iteration cycles
- [Testing](@/glossary/testing.md) -- Quality assurance applied selectively to MVP core functionality
- [Quality Gates](@/glossary/quality-gates.md) -- Automated enforcement ensuring MVP quality meets minimum standards
- [Architecture](@/glossary/architecture.md) -- System design enabling MVP evolution into full product
- [Scalability](@/glossary/scalability.md) -- Growth dimension intentionally deferred in MVP design
- [Continuous Deployment](@/glossary/continuous-deployment.md) -- Release automation enabling rapid MVP iteration
- [Feature Flag](@/glossary/feature-flag.md) -- Progressive feature enablement for post-MVP expansion
- [Telemetry](@/glossary/telemetry.md) -- Measurement infrastructure validating MVP hypotheses
- [Canary Release](@/glossary/canary-release.md) -- Gradual rollout strategy for MVP to production

## See Also

- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- EASM module developed using MVP methodology (M46)
- [Prismatic API](@/glossary/prismatic-api.md) -- Auto-introspecting REST gateway developed as an MVP
- [Apps](@/apps/_index.md) -- 115 umbrella applications, many originating as validated MVPs
- [Architecture](@/architecture/_index.md) -- Platform architecture designed to support iterative MVP evolution

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
