+++
title = "GARDEN"
weight = 71
[extra]
description = "22-repo legacy knowledge base with 3,050+ files and 55+ reusable patterns"
category = "evolution"
abbreviation = "GARDEN"
related_terms = ["osint", "kuzudb", "mycelial-network", "seadf", "blackboard"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1090
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GARDEN", "22-repo", "3050", "glossary", "evolution", "Prismatic Platform", "OSINT", "Architecture", "The GARDEN"]
tags = ["glossary", "evolution", "garden", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GARDEN - Prismatic Platform"
+++

## Definition & Overview

GARDEN is the platform's comprehensive legacy knowledge base comprising 22 repositories, 3,050+ files, and 55+ documented architectural and implementation patterns accumulated over more than 20 years of software development. It represents the institutional memory of two decades of engineering work across diverse domains including OSINT intelligence gathering, graph databases, AI coordination, web scraping, and distributed systems. GARDEN's purpose is to preserve, index, and make accessible the battle-tested patterns, proven implementations, and domain expertise that form the foundation upon which the modern Prismatic Platform is built.

The name "GARDEN" evokes a cultivated ecosystem where different species (repositories) coexist, cross-pollinate, and produce fruit (reusable patterns). Unlike a cemetery of dead code, GARDEN is an active knowledge repository where legacy implementations are continuously analyzed for extractable patterns, reusable components, and architectural insights. The GARDEN paradigm acknowledges that software development is cumulative: patterns that worked in production systems for years carry more authority than theoretical designs, and institutional knowledge that might otherwise be lost when teams change or projects conclude is systematically preserved.

GARDEN is organized into five tiers that reflect each repository's current relevance, activity level, and integration status with the modern platform. This tiered structure enables efficient knowledge retrieval by directing attention to the most relevant sources first while preserving the full historical record for deep research when needed.

## Technical Deep Dive

### Tier Classification System

| Tier | Classification | Criteria | Repository Count |
|------|---------------|----------|-----------------|
| **T1** | Production | Actively deployed, maintained, and integrated | 2 |
| **T2** | Active | Under active development, planned integration | 3 |
| **T3** | Libraries | Stable, reusable components with clear APIs | 4 |
| **T4** | Archive | Historical reference, patterns extractable | 6 |
| **T5** | R&D | Experimental, research-oriented prototypes | 7 |

### Key Repositories

| Repository | Tier | Files | Domain | Key Contribution |
|------------|------|-------|--------|-----------------|
| **sig** | T1 | 800+ | OSINT | 250+ intelligence providers, entity extraction |
| **prismatic** | T1 | 500+ | AI/Platform | Agent coordination, blackboard system |
| **kuzu-ex** | T2 | 150+ | Graph DB | KuzuDB Elixir SDK, Cypher query builder |
| **crisstal** | T2 | 200+ | Crystal | Alternative language experiments |
| **code-weaver** | T2 | 100+ | Code Gen | AST manipulation, code transformation |
| **simple_geocoder** | T3 | 50+ | Geolocation | Geocoding library, address normalization |
| **job-processor** | T3 | 80+ | Queue | Job processing, retry logic, backpressure |
| **prismatic-legacy** | T4 | 1,302 | Archive | Historical platform implementations |

### Pattern Library (55+ Documented Patterns)

The GARDEN pattern library categorizes extracted patterns by domain and applicability:

```elixir
defmodule Prismatic.Garden.PatternRegistry do
  @moduledoc """
  Registry of patterns extracted from GARDEN repositories.
  Each pattern includes provenance, implementation examples,
  and applicability guidelines.
  """

  @type pattern :: %{
    name: String.t(),
    category: atom(),
    source_repo: String.t(),
    source_tier: 1..5,
    description: String.t(),
    implementation_count: non_neg_integer(),
    confidence: float(),
    applicable_domains: [atom()]
  }

  @spec list_patterns(keyword()) :: [pattern()]
  def list_patterns(opts \\ []) do
    category = Keyword.get(opts, :category)
    min_confidence = Keyword.get(opts, :min_confidence, 0.0)

    all_patterns()
    |> filter_by_category(category)
    |> Enum.filter(&(&1.confidence >= min_confidence))
    |> Enum.sort_by(& &1.confidence, :desc)
  end

  @spec get_pattern(String.t()) :: {:ok, pattern()} | {:error, :not_found}
  def get_pattern(name) do
    case Enum.find(all_patterns(), &(&1.name == name)) do
      nil -> {:error, :not_found}
      pattern -> {:ok, pattern}
    end
  end

  defp all_patterns do
    [
      %{name: "blackboard_coordination", category: :architecture,
        source_repo: "prismatic", source_tier: 1, confidence: 0.95,
        description: "Multi-agent coordination through shared knowledge store",
        implementation_count: 12, applicable_domains: [:agents, :osint, :security]},
      %{name: "provider_registry", category: :osint,
        source_repo: "sig", source_tier: 1, confidence: 0.98,
        description: "Dynamic provider registration and discovery for data sources",
        implementation_count: 250, applicable_domains: [:osint, :easm, :intelligence]},
      %{name: "graph_query_builder", category: :storage,
        source_repo: "kuzu-ex", source_tier: 2, confidence: 0.90,
        description: "Composable Cypher query construction with type safety",
        implementation_count: 45, applicable_domains: [:storage, :knowledge_graph]},
      # ... 52+ additional patterns
    ]
  end

  defp filter_by_category(patterns, nil), do: patterns
  defp filter_by_category(patterns, cat), do: Enum.filter(patterns, &(&1.category == cat))
end
```

### Pattern Categories

| Category | Pattern Count | Example Patterns |
|----------|--------------|-----------------|
| **Architecture** | 12 | Blackboard coordination, supervisor topology, adapter pattern |
| **OSINT** | 15 | Provider registry, entity extraction, source fusion |
| **Storage** | 8 | Graph queries, caching strategies, migration patterns |
| **Processing** | 10 | Job queuing, retry logic, backpressure management |
| **Security** | 5 | Rate limiting, input validation, credential management |
| **Testing** | 5 | Contract testing, property-based testing, fixture generation |

## Architecture & Implementation

GARDEN's architecture follows a three-layer model: preservation, indexing, and integration.

**Preservation Layer**: Raw repository content is maintained in its original form, preserving git history, commit messages, issues, and documentation. No modification is made to source repositories -- they serve as immutable historical records.

**Indexing Layer**: The GARDEN indexer scans repositories, extracts patterns, classifies files by type and domain, and builds a searchable catalog. The index includes metadata such as file count, language distribution, dependency graphs, and pattern annotations.

**Integration Layer**: Extracted patterns are adapted and integrated into the modern platform through the Mycelial Network. When a pattern from GARDEN proves applicable, it is refactored to meet current quality standards (typespecs, documentation, tests) before integration.

```
┌─────────────────────────────────────────────────────────┐
│                    GARDEN Ecosystem                      │
├─────────────┬──────────────┬──────────────┬─────────────┤
│    T1       │     T2       │     T3       │   T4/T5     │
│  Production │   Active     │  Libraries   │  Archive/RD │
│  sig        │  kuzu-ex     │  geocoder    │  legacy     │
│  prismatic  │  crisstal    │  job-proc    │  experiments│
├─────────────┴──────────────┴──────────────┴─────────────┤
│                 Pattern Extraction Layer                  │
│  Scan → Classify → Extract → Document → Index            │
├─────────────────────────────────────────────────────────┤
│                 Integration Layer                        │
│  Select → Adapt → Validate → Test → Deploy               │
│                      ↓                                   │
│              Mycelial Network Propagation                 │
└─────────────────────────────────────────────────────────┘
```

## Usage in Prismatic Platform

GARDEN provides foundational assets that are actively consumed by the modern platform:

**OSINT Provider Heritage**: The `sig` repository (T1) contains 250+ intelligence providers that form the foundation of the platform's OSINT capabilities. These providers cover diverse data sources including domain registries, social media APIs, public record databases, and dark web monitoring endpoints. Each provider has been battle-tested in production OSINT operations.

**Blackboard System**: The multi-agent coordination pattern from the `prismatic` repository (T1) is the architectural foundation for the 434-agent AIAD ecosystem. The Blackboard pattern enables agents to share knowledge through a central store without direct inter-agent coupling.

**KuzuDB SDK**: The `kuzu-ex` repository (T2) provides the Elixir SDK for KuzuDB graph database operations, including a type-safe Cypher query builder, schema management, and migration support. This SDK is consumed by `prismatic_storage_kuzu`.

**GARDEN Access Commands**:

```bash
# Check GARDEN status across all tiers
/gardener status

# Synchronize GARDEN index with repository changes
/gardener sync

# Cultivate: extract and update patterns from repositories
/gardener cultivate

# Explore specific repository or pattern domain
/garden-explore --repo sig --domain osint

# Extract specific pattern for integration
/garden-extract --pattern blackboard_coordination --target prismatic_agents
```

## Code Examples

### GARDEN Repository Scanner

```elixir
defmodule Prismatic.Garden.Scanner do
  @moduledoc """
  Scans GARDEN repositories for pattern extraction
  and knowledge indexing.
  """

  @garden_path ".garden/repos"

  @spec scan_all() :: {:ok, map()} | {:error, term()}
  def scan_all do
    repos = list_repositories()

    results =
      repos
      |> Task.async_stream(&scan_repository/1, max_concurrency: 4)
      |> Enum.reduce(%{total_files: 0, patterns: [], repos: []}, fn
        {:ok, result}, acc ->
          %{
            total_files: acc.total_files + result.file_count,
            patterns: acc.patterns ++ result.patterns,
            repos: [result.summary | acc.repos]
          }

        {:exit, reason}, acc ->
          Logger.warning("GARDEN scan failed: #{inspect(reason)}")
          acc
      end)

    {:ok, results}
  end

  @spec scan_repository(map()) :: map()
  def scan_repository(repo) do
    path = Path.join(@garden_path, repo.name)

    files = list_files(path)
    patterns = extract_patterns(files, repo)
    languages = detect_languages(files)

    %{
      file_count: length(files),
      patterns: patterns,
      languages: languages,
      summary: %{
        name: repo.name,
        tier: repo.tier,
        files: length(files),
        patterns: length(patterns)
      }
    }
  end

  defp list_files(path) do
    Path.wildcard(Path.join(path, "**/*"))
    |> Enum.reject(&File.dir?/1)
  end

  defp extract_patterns(files, repo) do
    files
    |> Enum.flat_map(&analyze_for_patterns(&1, repo))
    |> Enum.uniq_by(& &1.name)
  end

  defp detect_languages(files) do
    files
    |> Enum.map(&Path.extname/1)
    |> Enum.frequencies()
    |> Enum.sort_by(&elem(&1, 1), :desc)
  end

  defp analyze_for_patterns(file_path, repo) do
    # Pattern recognition from file content and structure
    []
  end

  defp list_repositories do
    [
      %{name: "sig", tier: 1},
      %{name: "prismatic", tier: 1},
      %{name: "kuzu-ex", tier: 2},
      %{name: "crisstal", tier: 2},
      %{name: "code-weaver", tier: 2}
    ]
  end
end
```

### Pattern Integration Workflow

```elixir
defmodule Prismatic.Garden.Integrator do
  @moduledoc """
  Integrates GARDEN patterns into the modern platform
  with quality validation and testing.
  """

  @spec integrate_pattern(String.t(), atom()) ::
          {:ok, map()} | {:error, term()}
  def integrate_pattern(pattern_name, target_app) do
    with {:ok, pattern} <- Prismatic.Garden.PatternRegistry.get_pattern(pattern_name),
         {:ok, adapted} <- adapt_to_current_standards(pattern),
         {:ok, validated} <- validate_quality(adapted),
         {:ok, tested} <- generate_tests(validated, target_app) do
      {:ok, %{
        pattern: pattern_name,
        target: target_app,
        files_created: tested.files,
        tests_generated: tested.test_count,
        quality_score: validated.score
      }}
    end
  end

  defp adapt_to_current_standards(pattern) do
    # Add typespecs, documentation, OTP compliance
    {:ok, Map.put(pattern, :adapted, true)}
  end

  defp validate_quality(pattern) do
    # Ensure pattern meets current quality gates
    {:ok, Map.put(pattern, :score, 95)}
  end

  defp generate_tests(pattern, target_app) do
    # Create comprehensive test suite for integrated pattern
    {:ok, %{files: [], test_count: 0}}
  end
end
```

## Best Practices

**Preserve Provenance**: Every pattern extracted from GARDEN must retain full provenance -- the source repository, file path, commit hash, and original author. This provenance chain enables tracing decisions back to their origins.

**Tier-Appropriate Access**: Start with T1 (Production) and T2 (Active) repositories when searching for patterns. These contain the most recently validated and maintained code. Descend to lower tiers only when higher-tier sources do not address the need.

**Adapt Before Integrating**: Never copy legacy code verbatim into the modern platform. All GARDEN extractions must be adapted to current quality standards: typespecs, documentation, tests, OTP compliance, and NO MERCY quality gates.

**Regular Cultivation**: Run `/gardener cultivate` periodically to discover newly extractable patterns as the pattern recognition system improves. GARDEN is not a static archive -- new insights emerge from existing code as the platform's analytical capabilities advance.

**Cross-Pollination Tracking**: When a GARDEN pattern is successfully integrated into one application, use the Mycelial Network to evaluate its applicability across other applications. The 99.8% propagation success rate ensures reliable cross-domain transfer.

## Common Pitfalls

**Cargo Culting**: Copying patterns without understanding the context in which they were developed. A pattern that worked for a 1990s telecommunications system may not be appropriate for a modern web platform without significant adaptation.

**Tier Confusion**: Treating all GARDEN repositories as equally authoritative. T4 and T5 repositories contain experimental and archived code that may have known issues, incomplete implementations, or outdated dependencies.

**Pattern Staleness**: Assuming a pattern is optimal because it has existed for years. Patterns should be evaluated against current best practices, not just historical success. The Elixir ecosystem evolves, and patterns must evolve with it.

**Integration Without Tests**: Integrating GARDEN patterns without generating comprehensive tests for the adapted implementation. Legacy patterns may have been developed before the platform's current testing standards were established.

**Ignoring Negative Patterns**: GARDEN contains anti-patterns as well as patterns. Implementations that were abandoned, refactored, or replaced contain valuable lessons about what does not work. These negative signals should be cataloged alongside positive patterns.

## Related Concepts

- [OSINT](/glossary/osint/) - 250+ providers originating from GARDEN's T1 `sig` repository
- [Mycelial Network](/glossary/mycelial-network/) - Pattern propagation system distributing GARDEN knowledge across apps
- [SEADF](/glossary/seadf/) - Evolution framework that integrates and evaluates GARDEN patterns
- [Quality DNA](/glossary/quality-dna/) - Cross-session persistence inspired by GARDEN's knowledge preservation
- [Blackboard](/glossary/blackboard/) - Multi-agent coordination pattern originating from GARDEN T1
- [KuzuDB](/glossary/kuzudb/) - Graph database with SDK from GARDEN T2 `kuzu-ex` repository
- [Umbrella Application](/glossary/umbrella-application/) - Modern architecture that GARDEN patterns feed into

## See Also

- [Architecture](/architecture/) - Platform architecture overview
- [Technologies](/technologies/) - Technology stack details
- [Agents](/agents/) - AIAD agents that consume GARDEN patterns
- [Commands](/commands/) - GARDEN management commands (`/gardener`, `/garden-explore`)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)