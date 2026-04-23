+++
title = "Building Software"
weight = 50
[extra]
description = "The discipline and practice of constructing software systems from requirements through deployment, encompassing architecture design, implementation, testing, and operational excellence. In Prismatic context: OTP-first architecture, quality-first development, NO MERCY/NO DOUBTS enforcement, and continuous autonomous evolution."
category = "engineering"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "software-engineering"
related_concepts = ["software-architecture", "development-workflow", "continuous-integration", "code-quality", "elixir", "architectural-pattern", "performance"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["software-architecture", "elixir", "code-quality"]
learning_path = "platform-engineer"
interactive_demos = ["/labs/glossary/building-software"]
code_examples = ["elixir"]
external_resources = ["https://elixir-lang.org/", "https://www.erlang.org/doc/design_principles/des_princ.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["compilation-zero-warnings", "credo-strict", "dialyzer-clean", "quality-gates-pass", "test-coverage"]
keywords = ["software engineering", "OTP", "quality-first", "supervision trees", "umbrella applications", "continuous integration", "test-driven development"]
tags = ["glossary", "engineering", "elixir", "otp", "quality", "architecture"]
related_terms = ["software-architecture", "development-workflow", "continuous-integration", "code-quality", "elixir", "architectural-pattern", "performance", "code-reviews", "continuous-deployment", "autonomous-quality"]
word_count = 1572
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Building Software - Prismatic Platform"
+++

## Definition

Building software is the disciplined practice of transforming requirements, constraints, and domain knowledge into functioning, maintainable, and evolvable software systems. It encompasses the full lifecycle from problem analysis and architectural design through implementation, testing, deployment, and operational maintenance. The term deliberately emphasizes the constructive, engineering nature of software creation -- software is built with intention, structure, and craft, not merely written as code.

In the Prismatic Platform context, building software is governed by explicit doctrines and quality frameworks that elevate the practice beyond conventional development methodologies. The NO MERCY, NO DOUBTS doctrine mandates that every line of code is production-ready from the moment of creation, that all quality gates pass before any merge, and that incomplete implementations are rejected outright. This represents a fundamental philosophical position: software building is an engineering discipline with zero tolerance for technical debt accumulation.

## Overview

The practice of building software has evolved through several paradigmatic shifts: from waterfall methodologies through agile, from monolithic architectures through microservices, from manual deployment through continuous delivery. Each shift reflects a deepening understanding of software as a living system that must be designed for change, resilience, and operational clarity.

Modern software building integrates several interconnected disciplines:

- **Architecture** -- Structural decisions that constrain and enable all subsequent implementation choices
- **Implementation** -- Translation of architectural intent into working code with proper abstractions
- **Testing** -- Verification that the system behaves correctly under normal, edge, and adversarial conditions
- **Operations** -- Ensuring the built system runs reliably in production environments
- **Evolution** -- Adapting the system to changing requirements without degrading quality

The Prismatic Platform represents a particular philosophy of software building: the OTP-first, quality-gated, autonomously evolving approach. With 115 umbrella applications, 530+ agents, and approximately 2.8 million lines of code, the platform demonstrates that rigorous quality enforcement scales to large, complex systems when the architectural foundations are sound.

### The OTP-First Principle

The single most consequential architectural decision in the Prismatic Platform is the commitment to OTP (Open Telecom Platform) patterns as the foundation for all stateful systems. This means:

- Every stateful entity is managed by its own process
- Supervision trees define restart strategies and failure boundaries
- Message passing replaces shared mutable state
- Let-it-crash philosophy replaces defensive error handling
- The BEAM VM provides preemptive scheduling and soft real-time guarantees

This is not merely a technology choice but an architectural philosophy: the meta-rule states that **if the same solution could be written identically in Node.js, it is wrong**.

## Technical Details

### Quality Gate Architecture

The Prismatic build pipeline enforces quality through an 11-phase pre-commit system and continuous integration gates:

| Phase | Check | Enforcement | Failure Action |
|-------|-------|-------------|----------------|
| 1 | Compilation (`--warnings-as-errors`) | BLOCKING | Commit rejected |
| 2 | Credo strict analysis | BLOCKING | Commit rejected |
| 3 | Dialyzer type checking | BLOCKING | Commit rejected |
| 4 | Test suite execution | BLOCKING | Commit rejected |
| 5 | Coverage threshold (80%+) | BLOCKING | Commit rejected |
| 6 | Forbidden patterns scan | BLOCKING | Commit rejected |
| 7 | TODO/FIXME enforcement | WARNING | Flagged for review |
| 8 | Template validation | BLOCKING | Commit rejected |
| 9 | Security scan | BLOCKING | Commit rejected |
| 10 | Design consistency | BLOCKING | Commit rejected |
| 11 | Quality gates aggregate | BLOCKING | Commit rejected |

### Supervision Tree Design Pattern

```elixir
defmodule PrismaticPlatform.Application do
  @moduledoc """
  Root application supervisor for the Prismatic Platform.

  Demonstrates the OTP-first approach to building software:
  every stateful subsystem is a supervised process with explicit
  restart strategies, dependency ordering, and failure isolation.

  The supervision tree topology is designed before implementation
  begins -- structure precedes code.
  """

  use Application

  @impl Application
  @spec start(Application.start_type(), term()) :: {:ok, pid()} | {:error, term()}
  def start(_type, _args) do
    children = [
      # Infrastructure layer -- must start first
      {PrismaticStorage.Repo, []},
      {PrismaticStorage.ETS.Registry, []},

      # Core services layer -- depends on infrastructure
      {PrismaticAgents.Pool, pool_config()},
      {PrismaticEpistemic.Pipeline, []},

      # Application layer -- depends on core services
      {PrismaticWeb.Endpoint, []},
      {PrismaticAPI.Endpoint, []}
    ]

    opts = [
      strategy: :one_for_one,
      name: PrismaticPlatform.Supervisor,
      max_restarts: 10,
      max_seconds: 60
    ]

    Supervisor.start_link(children, opts)
  end

  @spec pool_config() :: keyword()
  defp pool_config do
    [
      size: Application.get_env(:prismatic_agents, :pool_size, 20),
      max_overflow: Application.get_env(:prismatic_agents, :max_overflow, 10)
    ]
  end
end
```

### Umbrella Application Architecture

The Prismatic Platform uses Elixir's umbrella application structure to enforce bounded contexts at the compilation level:

```
apps/
├── prismatic_storage_core/   # Traits, protocols, behaviors (no dependencies)
├── prismatic/                # Main API, coordination
├── prismatic_web/            # LiveView dashboards (port 4000)
├── prismatic_api/            # REST API (port 4004)
├── prismatic_agents/         # Agent runtime (530+ agents)
├── prismatic_epistemic/      # NABLA framework
├── prismatic_perimeter/      # EASM (security ratings)
├── prismatic_storage_ets/    # ETS adapter
├── prismatic_storage_ecto/   # PostgreSQL adapter
├── prismatic_storage_kuzu/   # KuzuDB graph adapter
├── prismatic_safety/         # Quality floor guardian
├── prismatic_claude/         # Session lifecycle
└── ... (115 total)
```

Each application has:
- Its own `mix.exs` with explicit dependencies
- Its own supervision tree
- Its own test suite
- Its own `CLAUDE.md` documentation
- Its own quality DNA state

### Functional Core, Imperative Shell

```elixir
defmodule PrismaticDD.InvestigationBuilder do
  @moduledoc """
  Demonstrates the functional core / imperative shell pattern
  for building software in the Prismatic Platform.

  Pure functions handle all business logic transformations.
  Side effects (database, network, file system) are pushed
  to the boundary of the system.
  """

  alias PrismaticDD.{Investigation, RiskAssessment, Finding}

  # ---- Functional Core (pure, testable, composable) ----

  @spec assess_risk(Investigation.t()) :: {:ok, RiskAssessment.t()} | {:error, atom()}
  def assess_risk(%Investigation{} = investigation) do
    with {:ok, factors} <- extract_risk_factors(investigation),
         {:ok, scores} <- score_factors(factors),
         {:ok, aggregate} <- aggregate_scores(scores),
         {:ok, assessment} <- classify_risk(aggregate) do
      {:ok, assessment}
    end
  end

  @spec extract_risk_factors(Investigation.t()) :: {:ok, [map()]} | {:error, atom()}
  defp extract_risk_factors(%Investigation{findings: findings}) do
    factors =
      findings
      |> Enum.flat_map(&Finding.risk_factors/1)
      |> Enum.reject(&is_nil/1)
      |> Enum.uniq_by(& &1.id)

    if factors == [] do
      {:error, :no_risk_factors}
    else
      {:ok, factors}
    end
  end

  @spec score_factors([map()]) :: {:ok, [map()]} | {:error, atom()}
  defp score_factors(factors) do
    scored =
      Enum.map(factors, fn factor ->
        %{factor | score: calculate_factor_score(factor)}
      end)

    {:ok, scored}
  end

  @spec aggregate_scores([map()]) :: {:ok, float()} | {:error, atom()}
  defp aggregate_scores(scored_factors) do
    total_weight = Enum.reduce(scored_factors, 0.0, &(&1.weight + &2))

    if total_weight == 0.0 do
      {:error, :zero_weight}
    else
      weighted_sum =
        Enum.reduce(scored_factors, 0.0, fn f, acc ->
          acc + f.score * f.weight
        end)

      {:ok, weighted_sum / total_weight}
    end
  end

  @spec classify_risk(float()) :: {:ok, RiskAssessment.t()} | {:error, atom()}
  defp classify_risk(score) when score >= 0.8, do: {:ok, %RiskAssessment{level: :critical, score: score}}
  defp classify_risk(score) when score >= 0.6, do: {:ok, %RiskAssessment{level: :high, score: score}}
  defp classify_risk(score) when score >= 0.4, do: {:ok, %RiskAssessment{level: :medium, score: score}}
  defp classify_risk(score) when score >= 0.0, do: {:ok, %RiskAssessment{level: :low, score: score}}
  defp classify_risk(_), do: {:error, :invalid_score}

  @spec calculate_factor_score(map()) :: float()
  defp calculate_factor_score(%{severity: :critical}), do: 1.0
  defp calculate_factor_score(%{severity: :high}), do: 0.8
  defp calculate_factor_score(%{severity: :medium}), do: 0.5
  defp calculate_factor_score(%{severity: :low}), do: 0.2
  defp calculate_factor_score(_), do: 0.1
end
```

### Development Workflow Enforcement

| Practice | Enforcement Mechanism | Authority |
|----------|----------------------|-----------|
| Atomic commits | Pre-commit hook rejects multi-concern changes | Session discipline protocol |
| Zero warnings | `--warnings-as-errors` flag on compilation | Quality gates |
| Type coverage | Dialyzer with persistent PLT | Static analysis |
| Code style | Credo strict mode | Pre-commit phase 2 |
| Test coverage | `--cover` flag with threshold enforcement | Quality gates |
| Regression tests | Mandatory for every bug fix | Regression test protocol |
| Documentation | `@moduledoc` and `@doc` required on public functions | Credo check |
| Continuous push | All commits pushed to remote immediately | Session discipline |

## Implementation in Prismatic Platform

### Autonomous Evolution

The Prismatic Platform does not merely build software -- it builds software that improves itself. The autonomous evolution framework operates at three levels:

1. **AutoHeal** -- Detects and repairs quality regressions automatically through `mix autoheal.cycle`
2. **AutoEvolve** -- Identifies improvement opportunities and applies them through `mix autoevolve.mega`
3. **Quality Floor Guardian** -- Monitors quality metrics and triggers corrective action when scores drop

This represents a shift from building software as a discrete activity to building software as a continuous, self-improving process.

### Quality DNA Persistence

Every application in the umbrella maintains a `.claude/quality-dna/current-state.json` file that tracks quality metrics across sessions. This enables:

- Cross-session continuity of quality improvements
- Regression detection across code review boundaries
- Historical trend analysis for architectural decisions
- Predictive quality modeling based on change patterns

### The NO MERCY Standard

The NO MERCY doctrine transforms conventional software building practices:

| Conventional Practice | NO MERCY Standard |
|----------------------|-------------------|
| "We'll fix it later" | Fix immediately or do not deliver |
| "Good enough for now" | Production-ready from creation |
| 80% test coverage target | 100% coverage on business logic |
| TODOs in code | Zero TODOs, zero FIXMEs |
| Mocks in production code | Zero mocks, stubs, or placeholders |
| Warnings tolerated | Zero warnings, `--warnings-as-errors` |

## Comparison with Alternatives

| Methodology | Philosophy | Quality Gate | Speed | Scale |
|-------------|-----------|-------------|-------|-------|
| **Move fast, break things** | Speed over correctness | Minimal | Fast initially | Debt accumulates |
| **Agile/Scrum** | Iterative delivery | Sprint review | Moderate | Team-dependent |
| **Extreme Programming** | Technical excellence | Pair programming, TDD | Moderate | Scales with discipline |
| **Prismatic (NM/ND)** | Zero tolerance for compromise | 11-phase automated gate | Steady, consistent | 115 apps, 2.8M LOC |
| **Formal methods** | Mathematical correctness | Proof obligations | Slow | Limited scope |

The Prismatic approach occupies a distinctive position: it demands the rigor of formal methods without the pace penalty, by automating quality enforcement through tooling rather than relying on human discipline alone. The 11-phase pre-commit pipeline catches regressions that code review misses, while the autonomous evolution framework continuously improves code quality without manual intervention.

## Best Practices

1. **Design the supervision tree before writing code** -- OTP architecture decisions constrain everything downstream. Document the process topology first.
2. **Push side effects to the boundary** -- Pure functions in the core, IO at the edges. This makes business logic testable without mocks.
3. **Use the type system aggressively** -- `@spec` on every public function, `@type` for domain concepts, Dialyzer in the CI pipeline.
4. **Enforce quality automatically** -- Human discipline fails at scale. Pre-commit hooks, CI gates, and automated analysis catch what code review misses.
5. **Build for evolution, not for today** -- Protocols, behaviours, and adapters allow the system to change without rewriting.
6. **Commit atomically and frequently** -- Each commit represents one logical change, tested and pushed immediately.
7. **Document the "why", not the "what"** -- `@moduledoc` explains purpose and design decisions, not API mechanics that the type system already describes.
8. **Profile before optimizing** -- Premature optimization is the root of complexity. Measure first with Benchee, then optimize the bottleneck.

## Common Pitfalls

1. **Building Node.js in Elixir** -- Writing single-threaded, callback-heavy code that ignores OTP patterns. If the code could be written identically in Node.js, it is wrong.
2. **Shared mutable state** -- Using ETS as a global mutable store without proper process ownership. Every ETS table should be owned by a specific GenServer.
3. **Monolithic thinking in an umbrella** -- Putting all code in one application instead of separating concerns into distinct umbrella apps with explicit dependencies.
4. **Skipping the type system** -- Omitting `@spec` and `@type` annotations, which removes the Dialyzer safety net and degrades documentation quality.
5. **Testing implementation, not behavior** -- Writing tests that assert on internal state rather than observable behavior, creating brittle tests that break on refactoring.
6. **Ignoring supervision strategy** -- Using `:one_for_one` everywhere without considering whether `:one_for_all` or `:rest_for_one` better captures the actual dependency relationships.
7. **Accumulating technical debt "temporarily"** -- There is no temporary debt. Every compromise persists until explicitly addressed, and the cost compounds.
8. **Over-engineering before understanding the domain** -- Building elaborate abstractions before the domain model is stable. Start simple, extract patterns when they repeat.

## Use Cases

### Enterprise Platform Development

Large-scale platforms with multiple subsystems benefit from umbrella architecture, where each bounded context is an independent application with explicit interfaces. The Prismatic Platform itself (115 applications) demonstrates this pattern.

### Real-Time Intelligence Systems

Systems that must process, analyze, and present intelligence in real-time require the concurrency and fault-tolerance guarantees that OTP provides. The BEAM VM's preemptive scheduling ensures that no single computation blocks the entire system.

### Compliance-Critical Systems

Systems operating under regulatory requirements (financial services, healthcare, defense) benefit from the automated quality enforcement approach. The 11-phase pre-commit pipeline provides auditable evidence that quality standards were met for every change.

### Long-Lived Systems

Systems expected to operate for years or decades benefit from the evolution-first approach. The autonomous evolution framework ensures that quality does not degrade over time, and the umbrella architecture allows individual subsystems to be replaced without affecting the whole.

### Multi-Team Development

Large engineering organizations benefit from umbrella architecture's enforcement of bounded contexts. Each team owns specific applications with explicit dependencies, preventing the coupling and coordination overhead that monolithic codebases create.

## Related Concepts

- [Software Architecture](@/glossary/software-architecture.md) -- Structural foundation for building software
- [Development Workflow](@/glossary/development-workflow.md) -- Process patterns for collaborative building
- [Continuous Integration](@/glossary/continuous-integration.md) -- Automated build and test pipeline
- [Code Quality](@/glossary/code-quality.md) -- Measurable properties of well-built software
- [Elixir](@/glossary/elixir.md) -- Primary implementation language for the platform
- [Architectural Pattern](@/glossary/architectural-pattern.md) -- Reusable structural solutions
- [Performance](@/glossary/performance.md) -- Runtime characteristics of built systems
- [Code Reviews](@/glossary/code-reviews.md) -- Human verification layer in the build process
- [Continuous Deployment](@/glossary/continuous-deployment.md) -- Automated release pipeline
- [Autonomous Quality](@/glossary/autonomous-quality.md) -- Self-improving quality enforcement

## See Also

- [Elixir Official Documentation](https://elixir-lang.org/docs.html) -- Language reference
- [OTP Design Principles](https://www.erlang.org/doc/design_principles/des_princ.html) -- Foundational OTP patterns
- [Designing Elixir Systems with OTP (Tate & DeLeo, 2019)](https://pragprog.com/titles/jgotp/designing-elixir-systems-with-otp/) -- OTP architecture guidance
- [A Philosophy of Software Design (Ousterhout, 2018)](https://web.stanford.edu/~ouster/cgi-bin/book.php) -- Software complexity management

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
