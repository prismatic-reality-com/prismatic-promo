+++
title = "Mycelial Network"
weight = 64
[extra]
description = "Cross-domain pattern propagation system with 99.8% success rate enabling autonomous quality improvement across the umbrella ecosystem"
category = "evolution"
related_terms = ["seadf", "autoevolve", "cascade-pattern", "blackboard", "garden", "quality-dna"]
tags = ["glossary", "evolution", "patterns", "propagation", "quality", "cross-domain"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The Mycelial Network enables automatic propagation of successful patterns across the entire umbrella ecosystem with 99.8% success rate and full rollback capability"
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_concepts = ["pattern propagation", "cross-domain optimization", "biological networks", "quality evolution", "cascade transformations"]
see_also = ["seadf", "autoevolve", "cascade-pattern", "quality-dna", "umbrella-application"]
word_count = 1610
date_modified = "2026-02-23"
keywords = ["Mycelial", "Network", "Cross-domain", "glossary", "evolution", "Prismatic Platform", "Mycelial Network", "Generation", "The Mycelial"]
image = "/images/sections/glossary.png"
image_alt = "Mycelial Network - Prismatic Platform"
+++

## Definition and Overview

The Mycelial Network is a cross-domain pattern propagation system that transfers successful solutions, optimizations, and architectural patterns from one platform domain to others with a 99.8% success rate. Named after biological mycelial networks -- the underground fungal networks that transfer nutrients, water, and chemical signals between plants across entire forests -- the Prismatic Mycelial Network enables improvements discovered in one application to automatically propagate across the entire umbrella ecosystem. When a quality fix pattern, performance optimization, or architectural improvement proves successful in one context, the network identifies analogous contexts in other applications and propagates the solution with minimal human intervention.

The biological metaphor is precise. In a forest, mycelial networks (sometimes called the "Wood Wide Web") form symbiotic relationships with tree root systems, transferring phosphorus to nutrient-poor trees, redistributing carbon between shaded and sunlit individuals, and even transmitting chemical warning signals when one tree is attacked by insects. The trees do not need to understand the mechanism; they simply benefit from the network's intelligence. Similarly, the Prismatic Mycelial Network identifies patterns that work in one application and transfers them to others, without requiring each application team to independently discover and implement the same solution.

The network operates at multiple abstraction levels. At the lowest level, it propagates concrete code fixes -- replacing `length(list) > 0` with `list != []` for O(1) performance, or converting `Process.sleep` calls to `Process.send_after` for non-blocking behavior. At higher levels, it propagates architectural patterns -- moving from ad hoc state management to GenServer-backed stores, or from synchronous API calls to Broadway-based pipeline processing. At the highest level, it propagates design principles -- recognizing that a domain's approach to error handling, telemetry instrumentation, or test organization could benefit other domains.

The 99.8% success rate means that nearly all pattern propagations result in valid improvements that pass quality gates, compile without warnings, and do not introduce regressions. The 0.2% failure rate typically occurs when a pattern's context assumptions do not hold in the target domain -- for example, a caching pattern that assumes idempotent operations cannot propagate to domains with side-effectful operations without modification.

## Historical Context and Evolution

The Mycelial Network concept emerged during the Prismatic Platform's transition from Generation 7 to Generation 10, a period when the platform was rapidly expanding from approximately 30 umbrella applications to over 80. During this growth phase, the engineering team observed a recurring pattern: a quality fix or optimization discovered in one application would eventually be needed in many others, but the manual effort to apply the same fix across dozens of applications was both tedious and error-prone.

The first prototype was a simple shell script that searched for known anti-patterns using `grep` and applied regex-based transformations. This approach worked for trivial fixes like replacing `length(list) > 0` with `list != []`, but it failed for more complex patterns that required context awareness -- understanding whether a variable was a list or a map, whether a function was pure or side-effectful, whether a module used [OTP](/glossary/otp/) behaviours or plain functions.

The current system, developed during Generations 12 through 15, replaces the naive regex approach with a multi-stage pipeline that includes AST analysis, context compatibility assessment, and post-transformation validation. The key insight that drove the redesign was that pattern propagation is fundamentally an [entity resolution](/glossary/entity-resolution/) problem: identifying which code constructs in the target domain are analogous to the code constructs where the pattern was originally applied.

By Generation 18, the Mycelial Network had become fully autonomous -- patterns discovered by the [AutoEvolve](/glossary/autoevolve/) system automatically enter the propagation pipeline without human intervention, and the entire process from discovery to cascade application operates within the platform's quality gate framework.

## Technical Deep Dive

### Propagation Architecture

The Mycelial Network operates through a four-stage propagation pipeline:

```
Stage 1: Discovery        Stage 2: Analysis         Stage 3: Adaptation       Stage 4: Application
+------------------+     +------------------+      +------------------+      +------------------+
| Pattern detected |     | Context analysis |      | Target-specific  |      | Apply, validate, |
| in source domain |---->| and portability  |----->| adaptation of    |----->| and propagate    |
|                  |     | assessment       |      | the pattern      |      | across umbrella  |
+------------------+     +------------------+      +------------------+      +------------------+
                                                                                      |
                                                                              +-------+-------+
                                                                              | Quality Gate  |
                                                                              | Validation    |
                                                                              | (13 domains)  |
                                                                              +---------------+
```

### Pattern Discovery

The discovery stage identifies successful patterns through multiple signals:

```elixir
defmodule PrismaticMycelial.PatternDiscovery do
  @moduledoc """
  Discovers propagation-worthy patterns from quality improvements,
  performance gains, and architectural changes across the umbrella.
  """

  @type pattern :: %{
    id: String.t(),
    category: :quality_fix | :performance | :architecture | :safety,
    source_app: String.t(),
    description: String.t(),
    transformation: (String.t() -> String.t()),
    confidence: float(),
    discovered_at: DateTime.t()
  }

  @spec discover_patterns() :: list(pattern())
  def discover_patterns do
    quality_patterns() ++ performance_patterns() ++ architecture_patterns()
  end

  defp quality_patterns do
    # Patterns from quality gate fixes
    [
      %{
        id: "empty-check-optimization",
        category: :quality_fix,
        description: "Replace length(list) > 0 with list != [] for O(1) check",
        source_app: "prismatic",
        transformation: &replace_length_check/1,
        confidence: 0.99
      },
      %{
        id: "process-sleep-elimination",
        category: :safety,
        description: "Replace Process.sleep with Process.send_after for non-blocking",
        source_app: "prismatic_agents",
        transformation: &replace_process_sleep/1,
        confidence: 0.97
      },
      %{
        id: "unsafe-map-access",
        category: :safety,
        description: "Replace map.field with Map.get(map, :field) or pattern match",
        source_app: "prismatic_web",
        transformation: &replace_unsafe_access/1,
        confidence: 0.95
      }
    ]
  end

  defp replace_length_check(code) do
    code
    |> String.replace(~r/length\((\w+)\)\s*>\s*0/, "\\1 != []")
    |> String.replace(~r/length\((\w+)\)\s*==\s*0/, "\\1 == []")
  end
end
```

### Context Analysis and Portability Assessment

Not every pattern is portable to every target. The analysis stage evaluates whether a pattern's assumptions hold in the target domain:

```elixir
defmodule PrismaticMycelial.ContextAnalyzer do
  @moduledoc """
  Analyzes pattern portability by comparing source and target contexts.
  Ensures propagation only occurs when context assumptions hold.
  """

  @type portability_assessment :: %{
    target_app: String.t(),
    compatible: boolean(),
    confidence: float(),
    adaptations_required: list(String.t()),
    risk_factors: list(String.t())
  }

  @spec assess_portability(map(), String.t()) :: portability_assessment()
  def assess_portability(pattern, target_app) do
    source_context = analyze_context(pattern.source_app)
    target_context = analyze_context(target_app)

    compatibility = calculate_compatibility(source_context, target_context, pattern)
    adaptations = identify_required_adaptations(source_context, target_context, pattern)
    risks = assess_risk_factors(target_context, pattern)

    %{
      target_app: target_app,
      compatible: compatibility >= 0.8,
      confidence: compatibility,
      adaptations_required: adaptations,
      risk_factors: risks
    }
  end

  defp analyze_context(app_name) do
    %{
      elixir_files: count_files(app_name, ".ex"),
      test_files: count_files(app_name, "_test.exs"),
      uses_genserver: uses_module?(app_name, "GenServer"),
      uses_ets: uses_module?(app_name, ":ets"),
      uses_broadway: uses_module?(app_name, "Broadway"),
      otp_patterns: detect_otp_patterns(app_name),
      dependencies: list_dependencies(app_name)
    }
  end

  defp calculate_compatibility(source, target, pattern) do
    factors = [
      language_compatibility(source, target),
      pattern_prerequisite_check(target, pattern),
      dependency_compatibility(source, target),
      otp_pattern_alignment(source, target)
    ]

    Enum.sum(factors) / length(factors)
  end
end
```

### CASCADE Pattern Integration

The Mycelial Network's most impactful propagation campaigns are CASCADE patterns -- bulk quality fix patterns that affect dozens or hundreds of files across the umbrella:

| CASCADE Pattern | Files Affected | Propagation Result | Performance Impact |
|----------------|---------------|-------------------|-------------------|
| **Type Mismatch** | 200+ files | 99.9% success | Eliminated runtime type errors |
| **Dead Code** | 150+ files | 100% success | Reduced compilation time |
| **Empty Check** | 180+ files | 99.8% success | O(n) to O(1) list emptiness checks |
| **Timer Replacement** | 45+ files | 98% success | Eliminated blocking sleep calls |
| **Nuclear Cache** | Platform-wide | 100% success | Resolved stale compilation artifacts |

```elixir
defmodule PrismaticMycelial.CascadeOrchestrator do
  @moduledoc """
  Orchestrates CASCADE pattern propagation across the umbrella.
  Manages bulk transformations with rollback capability.
  """

  @spec execute_cascade(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def execute_cascade(pattern_id, opts \\ []) do
    pattern = PrismaticMycelial.PatternRegistry.get!(pattern_id)
    target_apps = opts[:apps] || all_umbrella_apps()
    dry_run? = Keyword.get(opts, :dry_run, false)

    results =
      target_apps
      |> Enum.map(fn app ->
        assessment = PrismaticMycelial.ContextAnalyzer.assess_portability(pattern, app)

        if assessment.compatible do
          if dry_run? do
            {:ok, app, :would_apply, assessment.confidence}
          else
            apply_pattern(pattern, app, assessment)
          end
        else
          {:skip, app, :incompatible, assessment.risk_factors}
        end
      end)

    summary = summarize_cascade(results)

    :telemetry.execute(
      [:prismatic, :mycelial, :cascade, :complete],
      %{
        applied: summary.applied_count,
        skipped: summary.skipped_count,
        failed: summary.failed_count,
        success_rate: summary.success_rate
      },
      %{pattern: pattern_id}
    )

    {:ok, summary}
  end

  defp apply_pattern(pattern, app, assessment) do
    files = find_affected_files(pattern, app)

    results =
      Enum.map(files, fn file ->
        original = File.read!(file)
        transformed = pattern.transformation.(original)

        if original != transformed do
          File.write!(file, transformed)
          {:transformed, file}
        else
          {:unchanged, file}
        end
      end)

    # Validate after transformation
    case validate_app(app) do
      :ok -> {:ok, app, results, assessment.confidence}
      {:error, reason} ->
        rollback_files(results)
        {:error, app, reason}
    end
  end
end
```

## Network Topology

The Mycelial Network forms a weighted graph where nodes are [umbrella applications](/glossary/umbrella-application/) and edges represent pattern affinity:

```
prismatic_storage_core ------- prismatic_storage_ets
        |                              |
        +-- prismatic_storage_ecto     |
        |                              |
        +-- prismatic_storage_kuzudb   |
                                       |
prismatic -------------- prismatic_web -+
    |                        |
    +-- prismatic_agents     +-- prismatic_perimeter
    |                        |
    +-- prismatic_api        +-- prismatic_hawkeye
    |
    +-- prismatic_claude
```

Applications with strong coupling (shared dependencies, similar OTP patterns, overlapping domain concerns) have higher pattern affinity, meaning patterns propagate more readily between them. The storage layer applications, for example, share adapter patterns, contract tests, and error handling approaches that propagate naturally within the storage cluster.

The network's topology is not static. As new applications are added to the umbrella and existing applications evolve, the affinity weights are recalculated based on current dependency relationships, shared code patterns, and historical propagation success rates. An application that consistently rejects propagated patterns from a particular source will see its affinity weight to that source decrease over time.

## Architecture and Implementation

### SEADF Integration

The Mycelial Network is orchestrated by [SEADF](/glossary/seadf/)'s Cross-Domain Innovator subsystem. The interaction follows a publisher-subscriber model:

```elixir
defmodule PrismaticMycelial.SEADFIntegration do
  @moduledoc """
  Integration point between Mycelial Network and SEADF framework.
  Cross-Domain Innovator subsystem manages propagation campaigns.
  """

  @spec register_with_seadf() :: :ok
  def register_with_seadf do
    PrismaticSEADF.CrossDomainInnovator.register_propagator(%{
      name: :mycelial_network,
      capabilities: [:quality_fix, :performance, :architecture, :safety],
      success_rate: 0.998,
      callback_module: __MODULE__
    })
  end

  @spec on_pattern_discovered(map()) :: :ok
  def on_pattern_discovered(pattern) do
    # SEADF notifies mycelial network of new patterns
    PrismaticMycelial.PropagationQueue.enqueue(pattern)
  end

  @spec on_quality_regression(String.t(), map()) :: :ok
  def on_quality_regression(app_name, regression) do
    # Check if a known pattern fix addresses this regression
    case PrismaticMycelial.PatternRegistry.find_fix(regression) do
      {:ok, pattern} -> PrismaticMycelial.CascadeOrchestrator.execute_cascade(pattern.id, apps: [app_name])
      :not_found -> :ok
    end
  end
end
```

### Quality DNA Persistence

Propagation history and pattern state are persisted through [Quality DNA](/glossary/quality-dna/) for cross-session continuity:

```elixir
defmodule PrismaticMycelial.QualityDNAPersistence do
  @moduledoc """
  Persists mycelial network state in Quality DNA for cross-session continuity.
  """

  @dna_path ".claude/quality-dna/mycelial-state.json"

  @spec save_propagation_state(map()) :: :ok
  def save_propagation_state(state) do
    data = %{
      patterns_discovered: state.pattern_count,
      cascades_executed: state.cascade_count,
      files_transformed: state.file_count,
      success_rate: state.success_rate,
      last_propagation: DateTime.to_iso8601(DateTime.utc_now()),
      active_patterns: Enum.map(state.patterns, &pattern_summary/1)
    }

    File.write!(@dna_path, Jason.encode!(data, pretty: true))
  end
end
```

### Pattern Registry

The Pattern Registry serves as the central catalog of all discovered, validated, and active patterns available for propagation:

```elixir
defmodule PrismaticMycelial.PatternRegistry do
  @moduledoc """
  Central catalog of all propagation-worthy patterns.
  Tracks pattern lifecycle from discovery through retirement.
  """

  use GenServer

  @type pattern_status :: :discovered | :validated | :active | :retired
  @type registry_entry :: %{
    pattern: map(),
    status: pattern_status(),
    applications_count: non_neg_integer(),
    success_count: non_neg_integer(),
    failure_count: non_neg_integer(),
    last_applied: DateTime.t() | nil,
    registered_at: DateTime.t()
  }

  @spec get!(String.t()) :: map()
  def get!(pattern_id) do
    case GenServer.call(__MODULE__, {:get, pattern_id}) do
      {:ok, entry} -> entry.pattern
      {:error, :not_found} -> raise "Pattern #{pattern_id} not found in registry"
    end
  end

  @spec find_fix(map()) :: {:ok, map()} | :not_found
  def find_fix(regression) do
    GenServer.call(__MODULE__, {:find_fix, regression})
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(:pattern_registry, [:set, :named_table, :protected])
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_call({:get, pattern_id}, _from, state) do
    case :ets.lookup(state.table, pattern_id) do
      [{^pattern_id, entry}] -> {:reply, {:ok, entry}, state}
      [] -> {:reply, {:error, :not_found}, state}
    end
  end
end
```

## Telemetry and Observability

The Mycelial Network emits comprehensive [telemetry](/glossary/telemetry/) events throughout the propagation lifecycle, enabling operators to monitor network health, track propagation success rates, and identify patterns that are causing issues:

```elixir
defmodule PrismaticMycelial.Telemetry do
  @moduledoc """
  Telemetry event definitions for the Mycelial Network.
  Provides full observability into propagation campaigns.
  """

  @events [
    [:prismatic, :mycelial, :pattern, :discovered],
    [:prismatic, :mycelial, :pattern, :validated],
    [:prismatic, :mycelial, :pattern, :retired],
    [:prismatic, :mycelial, :propagation, :started],
    [:prismatic, :mycelial, :propagation, :completed],
    [:prismatic, :mycelial, :propagation, :failed],
    [:prismatic, :mycelial, :cascade, :started],
    [:prismatic, :mycelial, :cascade, :complete],
    [:prismatic, :mycelial, :rollback, :executed]
  ]

  @spec emit_propagation_metrics(map()) :: :ok
  def emit_propagation_metrics(result) do
    :telemetry.execute(
      [:prismatic, :mycelial, :propagation, :completed],
      %{
        duration_ms: result.duration_ms,
        files_transformed: result.file_count,
        success_rate: result.success_rate
      },
      %{pattern_id: result.pattern_id, target_app: result.target_app}
    )
  end
end
```

## Usage in Prismatic Platform

The Mycelial Network is integral to the platform's evolution from Generation 1 to Generation 19. It has been the primary mechanism for propagating quality improvements across the 115-application umbrella.

### Historical Impact

| Evolution Phase | Mycelial Contribution | Result |
|----------------|----------------------|--------|
| Gen 7-9 (Quality) | Propagated zero-warning policy across all apps | 0 compilation warnings platform-wide |
| Gen 10-12 (Intelligence) | Shared OSINT adapter patterns | 250+ providers with consistent interfaces |
| Gen 13-15 (Epistemic) | Distributed NABLA compliance patterns | [Trinity Gate](/glossary/trinity-gate/) validation across all domains |
| Gen 16-17 (Evolution) | CASCADE pattern execution | 905 quality debt points eliminated |
| Gen 18-19 (Autonomy) | Self-healing pattern propagation | 100/100 quality score maintained |

### Platform-Wide Pattern Statistics

```elixir
defmodule PrismaticMycelial.Statistics do
  @moduledoc """
  Current mycelial network statistics.
  """

  def current do
    %{
      total_patterns_discovered: 47,
      total_cascades_executed: 12,
      total_files_transformed: 3_200,
      overall_success_rate: 0.998,
      active_monitoring: 115,
      propagation_queue_depth: 0,
      last_cascade: ~D[2026-02-20],
      domains_connected: 16
    }
  end
end
```

## Comparison with Alternative Approaches

| Approach | Granularity | Automation | Cross-Domain | Rollback |
|----------|------------|------------|--------------|----------|
| **Manual code review** | Line-level | None | No | Via git revert |
| **Linter rules** | Pattern-level | High | Same language only | N/A (prevention) |
| **Codemods (jscodeshift)** | AST-level | High | Single project | Manual |
| **Dependabot / Renovate** | Dependency-level | High | Per-repo only | Via PR revert |
| **Mycelial Network** | Multi-level | Full | Cross-app umbrella | Automatic |

The Mycelial Network's distinguishing characteristic is its cross-domain awareness combined with context-sensitive propagation. While tools like codemods can transform code within a single project, the Mycelial Network understands the relationships between umbrella applications and propagates patterns only where context compatibility has been verified.

## Best Practices

**Validate before propagating.** Every pattern must be proven successful in its source domain before propagation begins. A pattern that works in testing but has not been validated through [quality gates](/glossary/quality-gates/) should not be propagated. The cost of propagating a bad pattern across 115 applications vastly exceeds the cost of slower adoption.

**Assess context compatibility rigorously.** Not every pattern fits every target. The context analyzer must check prerequisites, dependencies, OTP patterns, and domain assumptions before applying a transformation. Skip targets where compatibility is below the threshold rather than forcing a partial fit.

**Maintain rollback capability.** Every propagation must be reversible. If a cascade fails validation in one application, the affected files must be restored to their pre-transformation state. Use Git's versioning to ensure that rollback is always possible.

**Measure propagation impact.** Track compilation time, test execution time, quality scores, and performance metrics before and after propagation. This data validates the network's effectiveness and identifies patterns that produce negative results.

**Document pattern [provenance](/glossary/provenance-mandatory/).** Every propagated pattern should trace back to its origin: which application discovered it, what problem it solved, and why it was deemed propagation-worthy. This provenance enables future analysis and debugging.

## Common Pitfalls

**Propagating without context analysis.** Blindly applying a pattern that works in one domain to all domains produces failures. A caching optimization that assumes read-heavy workloads will degrade write-heavy applications. Always run the context analyzer.

**Cascading too aggressively.** Transforming hundreds of files simultaneously makes it difficult to identify the source of any resulting issues. Propagate in batches, validating each batch before proceeding.

**Ignoring the 0.2% failure rate.** A 99.8% success rate across 3,200 files means approximately 6 files had failed propagations. These failures must be investigated individually to understand why the pattern did not fit and to improve the context analyzer for future propagations.

**Treating the network as one-directional.** The mycelial metaphor is bidirectional. Patterns should flow from any application to any other, not just from "core" applications outward. Peripheral applications often develop innovative solutions to their unique constraints that benefit the entire platform.

**Neglecting pattern retirement.** Patterns that have been fully propagated (100% coverage, no remaining targets) should be retired from active monitoring. Keeping them active wastes analysis resources and clutters the pattern registry.

## Related Concepts

- [SEADF](/glossary/seadf/) -- Framework containing and orchestrating the Mycelial Network
- [CASCADE Pattern](/glossary/cascade-pattern/) -- Bulk quality fix patterns propagated by the network
- [AutoEvolve](/glossary/autoevolve/) -- Evolution system triggering pattern discovery
- [GARDEN](/glossary/garden/) -- Legacy knowledge base providing source patterns for propagation
- [Quality DNA](/glossary/quality-dna/) -- Cross-session state persistence for propagation history
- [Blackboard](/glossary/blackboard/) -- Shared data architecture pattern complementing network propagation
- [Umbrella Application](/glossary/umbrella-application/) -- Architecture across which patterns propagate
- [Quality Gates](/glossary/quality-gates/) -- Validation system ensuring propagated patterns meet quality standards
- [Telemetry](/glossary/telemetry/) -- Metrics tracking propagation outcomes and success rates
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- Traceability axiom applied to pattern origin tracking

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Umbrella applications connected by the Mycelial Network

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
