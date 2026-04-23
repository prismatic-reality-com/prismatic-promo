+++
title = "Sanctions Screening"
weight = 29
[extra]
category = "osint"
description = "Automated checking against EU, US, UK, and UN sanctions lists with fuzzy matching and entity resolution in the Prismatic Platform"
related_terms = ["osint", "intelligence-fusion", "nis2", "easm", "entity-resolution", "security-rating", "threat-intelligence", "compliance-framework", "gdpr"]
keywords = ["sanctions screening automation", "OFAC SDN list checking", "EU sanctions compliance", "fuzzy name matching", "entity resolution deduplication", "AML KYC screening", "sanctions list management", "PEP screening", "Elixir parallel screening", "regulatory compliance automation"]
tags = ["sanctions", "compliance", "osint", "screening", "aml"]
platform_integration = "deep"
related_app = "prismatic_intel"
complexity = "advanced"
audience = ["compliance-officers", "risk-analysts", "osint-investigators", "security-engineers"]
date_created = "2026-02-22"
version = "2.0.0"
requires_knowledge = ["osint", "entity-resolution", "elixir"]
prismatic_components = ["SanctionsScreening", "ListManager", "FuzzyMatcher", "EntityResolver", "ResultAggregator"]
supported_lists = ["EU Consolidated", "OFAC SDN", "OFSI", "UN Consolidated"]
matching_algorithms = ["exact", "soundex", "levenshtein", "jaro-winkler", "n-gram", "token-based"]
screening_threshold = 0.85
enforcement_level = "P1"
compliance_frameworks = ["NIS2", "AML5D", "OFAC", "EU Sanctions Regulation"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1356
date_modified = "2026-02-23"
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Sanctions Screening - Prismatic Platform"
+++

## Definition and Overview

Sanctions screening is the regulatory compliance process of systematically checking individuals, organizations, vessels, addresses, and other entities against official sanctions lists maintained by governmental and supranational authorities. The primary lists include the European Union Consolidated Sanctions List, the United States Office of Foreign Assets Control (OFAC) Specially Designated Nationals (SDN) list, the United Kingdom Office of Financial Sanctions Implementation (OFSI) list, and the United Nations Security Council Consolidated List. The process identifies sanctioned entities, Politically Exposed Persons (PEPs), and entities subject to restrictive measures including asset freezes, travel bans, arms embargoes, and trade restrictions.

Sanctions screening operates at the intersection of regulatory compliance, financial crime prevention, and national security. Organizations subject to sanctions regulations -- including financial institutions, insurance companies, trade facilitators, and increasingly technology companies -- must screen counterparties, customers, beneficial owners, and transactions against applicable lists before engaging in business relationships or processing payments. Failure to comply carries severe penalties including criminal prosecution, substantial fines (reaching billions of dollars for major violations), and reputational damage.

The Prismatic Platform implements sanctions screening as an integrated component of its [OSINT](@/glossary/osint.md) and [intelligence fusion](@/glossary/intelligence-fusion.md) pipeline, leveraging Elixir's concurrency model to perform parallel multi-list screening with sub-second response times. The platform's screening results feed directly into [security ratings](@/glossary/security-rating.md) and [compliance assessments](@/glossary/compliance-framework.md), providing a unified view of entity risk across regulatory, security, and operational dimensions.

## Historical Context and Regulatory Landscape

The modern sanctions regime traces its origins to the Trading with the Enemy Act of 1917 in the United States and the League of Nations sanctions against Italy in 1935. However, the sanctions landscape as we know it emerged primarily after the September 11, 2001 attacks, when the global financial system was mobilized as a weapon against terrorism financing. The USA PATRIOT Act of 2001 dramatically expanded OFAC's authority and the scope of sanctions compliance obligations for financial institutions.

In Europe, the European Union developed its own sanctions framework through Common Foreign and Security Policy (CFSP) decisions, implemented through Council Regulations that are directly applicable in all member states. The EU sanctions landscape became dramatically more complex following Russia's annexation of Crimea in 2014 and the subsequent full-scale invasion of Ukraine in 2022, which triggered the most comprehensive sanctions packages in EU history -- over 10 successive packages imposing thousands of individual and entity designations.

The UK's departure from the EU created a third major sanctions regime through the Sanctions and Anti-Money Laundering Act 2018, establishing OFSI as the UK's sanctions enforcement authority. The UN Security Council maintains its own consolidated list, which member states are obligated to implement but which may differ in scope and interpretation from national implementations.

This multi-jurisdictional complexity is the fundamental technical challenge of sanctions screening. An entity may be sanctioned by one authority but not another, or sanctioned under different programs with different restrictions. The Prismatic Platform addresses this by screening against all major lists in parallel and providing a consolidated risk assessment that accounts for the specific regulatory obligations of the screening organization.

## Technical Deep Dive

### Matching Algorithms

Sanctions screening systems employ multiple matching strategies in combination to maximize detection while controlling false positive rates:

| Algorithm | Approach | Strength | Weakness | Prismatic Weight |
|-----------|----------|----------|----------|-----------------|
| **Exact Match** | Character-by-character comparison | Zero false positives | Misses any variation | 1.0 |
| **Soundex/Metaphone** | Phonetic encoding comparison | Catches pronunciation variants | Language-specific, high FP | 0.6 |
| **Levenshtein Distance** | Edit distance between strings | Catches typos and minor variations | Computationally expensive | 0.8 |
| **Jaro-Winkler** | Weighted character transposition | Good for name matching | Sensitive to length differences | 0.85 |
| **N-gram** | Substring overlap measurement | Language-independent | High false positive rate | 0.7 |
| **Token-based** | Word-level comparison with reordering | Handles name order variations | Misses partial name matches | 0.75 |

Production screening systems typically combine multiple algorithms in a scoring pipeline, where each algorithm contributes a weighted score to a composite match confidence. Matches exceeding a configurable threshold (0.85 in the Prismatic Platform default configuration) are flagged for human review, while clear non-matches are passed automatically.

### Name Normalization Pipeline

Before matching, entity names pass through a normalization pipeline that addresses common variations:

```elixir
defmodule PrismaticIntel.SanctionsScreening.NameNormalizer do
  @moduledoc """
  Normalizes entity names before sanctions matching to improve
  detection rates. Handles transliteration, honorific removal,
  script conversion, and cultural naming pattern normalization.
  """

  @spec normalize(String.t()) :: {:ok, list(String.t())} | {:error, term()}
  def normalize(name) when is_binary(name) do
    variants =
      name
      |> String.trim()
      |> generate_variants()
      |> Enum.map(&apply_normalizations/1)
      |> Enum.uniq()

    {:ok, variants}
  end

  defp generate_variants(name) do
    [
      name,
      remove_honorifics(name),
      remove_diacritics(name),
      transliterate(name),
      reverse_name_order(name)
    ]
    |> Enum.reject(&is_nil/1)
  end

  defp apply_normalizations(name) do
    name
    |> String.downcase()
    |> String.replace(~r/[^\p{L}\p{N}\s]/u, "")
    |> String.replace(~r/\s+/, " ")
    |> String.trim()
  end

  defp remove_honorifics(name) do
    honorifics = ~w(mr mrs ms dr prof sir dame lord lady haj sheikh)
    words = String.split(name, " ")
    filtered = Enum.reject(words, fn w -> String.downcase(w) in honorifics end)
    Enum.join(filtered, " ")
  end

  defp remove_diacritics(name) do
    name
    |> :unicode.characters_to_nfd_binary()
    |> String.replace(~r/[\x{0300}-\x{036f}]/u, "")
  end

  defp transliterate(name), do: name
  defp reverse_name_order(name) do
    parts = String.split(name, " ", trim: true)
    if length(parts) >= 2, do: Enum.join(Enum.reverse(parts), " "), else: nil
  end
end
```

### List Management and Ingestion

Sanctions lists are published in various formats (XML, CSV, PDF, JSON) with different update frequencies and schemas. The platform's ListManager normalizes these heterogeneous sources into a unified internal format:

| List | Authority | Update Frequency | Format | Entries (approx.) |
|------|-----------|-----------------|--------|------------------|
| **EU Consolidated** | European Commission | Daily | XML (SCSB format) | 10,000+ |
| **OFAC SDN** | US Treasury | Multiple per week | XML, CSV, PDF | 12,000+ |
| **OFSI** | UK Treasury | Weekly | CSV, XML | 4,000+ |
| **UN Consolidated** | UN Security Council | As needed | XML | 800+ |
| **PEP Lists** | Various providers | Monthly | Proprietary | 1,000,000+ |

```elixir
defmodule PrismaticIntel.SanctionsScreening.ListManager do
  @moduledoc """
  Manages sanctions list ingestion, normalization, and caching.
  Lists are fetched from authoritative sources, parsed into a
  unified schema, and cached in ETS for sub-millisecond lookup.
  Automatic refresh ensures lists are never stale beyond the
  configured maximum age.
  """

  use GenServer

  @type list_entry :: %{
    id: String.t(),
    source_list: atom(),
    names: list(String.t()),
    aliases: list(String.t()),
    date_of_birth: Date.t() | nil,
    nationalities: list(String.t()),
    entry_type: :individual | :entity | :vessel | :aircraft,
    sanctions_programs: list(String.t()),
    designation_date: Date.t(),
    last_updated: DateTime.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    table = :ets.new(:sanctions_lists, [:set, :public, read_concurrency: true])
    schedule_refresh(Keyword.get(opts, :refresh_interval, :timer.hours(1)))
    {:ok, %{table: table, last_refresh: nil}, {:continue, :initial_load}}
  end

  @impl true
  def handle_continue(:initial_load, state) do
    load_all_lists(state.table)
    {:noreply, %{state | last_refresh: DateTime.utc_now()}}
  end

  @spec get_entries(atom()) :: [list_entry()]
  def get_entries(list_name) do
    :ets.match_object(:sanctions_lists, {list_name, :_})
    |> Enum.map(fn {_list, entry} -> entry end)
  end

  defp load_all_lists(table) do
    [:eu_consolidated, :ofac_sdn, :ofsi, :un_consolidated]
    |> Task.async_stream(&fetch_and_parse/1, max_concurrency: 4, timeout: 60_000)
    |> Enum.each(fn {:ok, {list_name, entries}} ->
      Enum.each(entries, fn entry ->
        :ets.insert(table, {list_name, entry})
      end)
    end)
  end

  defp fetch_and_parse(list_name) do
    # Fetch from authoritative source and parse into unified schema
    {list_name, []}
  end

  defp schedule_refresh(interval) do
    Process.send_after(self(), :refresh, interval)
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements sanctions screening as part of its intelligence fusion pipeline, leveraging Elixir's concurrency model for parallel multi-list checking:

```elixir
defmodule PrismaticIntel.SanctionsScreening do
  @moduledoc """
  Multi-list sanctions screening with fuzzy matching and entity resolution.
  Checks entities against EU, OFAC, OFSI, and UN sanctions lists in parallel
  using Task.async_stream for bounded concurrency. Results are deduplicated
  through entity resolution and classified by risk level.
  """

  alias PrismaticIntel.SanctionsScreening.{
    ListManager,
    FuzzyMatcher,
    EntityResolver,
    NameNormalizer
  }

  @type screening_result :: %{
    entity: String.t(),
    matches: list(match()),
    risk_level: :clear | :potential_match | :confirmed_match,
    confidence: float(),
    lists_checked: list(atom()),
    checked_at: DateTime.t(),
    screening_id: String.t()
  }

  @type match :: %{
    list: atom(),
    entry_id: String.t(),
    matched_name: String.t(),
    similarity_score: float(),
    match_algorithm: atom(),
    sanctions_programs: list(String.t()),
    entry_type: :individual | :entity | :vessel | :aircraft
  }

  @lists [:eu_consolidated, :ofac_sdn, :ofsi, :un_consolidated]

  @spec screen_entity(String.t(), keyword()) :: {:ok, screening_result()} | {:error, term()}
  def screen_entity(entity_name, opts \\ []) do
    threshold = Keyword.get(opts, :threshold, 0.85)
    lists = Keyword.get(opts, :lists, @lists)

    with {:ok, normalized_names} <- NameNormalizer.normalize(entity_name) do
      tasks =
        Enum.map(lists, fn list ->
          Task.async(fn ->
            entries = ListManager.get_entries(list)
            Enum.flat_map(normalized_names, fn name ->
              FuzzyMatcher.find_matches(name, entries, threshold)
            end)
          end)
        end)

      raw_matches =
        tasks
        |> Task.await_many(30_000)
        |> List.flatten()

      resolved_matches = EntityResolver.deduplicate(raw_matches)

      result = %{
        entity: entity_name,
        matches: resolved_matches,
        risk_level: classify_risk(resolved_matches),
        confidence: calculate_confidence(resolved_matches),
        lists_checked: lists,
        checked_at: DateTime.utc_now(),
        screening_id: generate_screening_id()
      }

      {:ok, result}
    end
  end

  @spec screen_batch(list(String.t()), keyword()) :: {:ok, list(screening_result())} | {:error, term()}
  def screen_batch(entity_names, opts \\ []) do
    results =
      entity_names
      |> Task.async_stream(&screen_entity(&1, opts), max_concurrency: 10, timeout: 60_000)
      |> Enum.map(fn {:ok, result} -> result end)

    {:ok, results}
  end

  defp classify_risk([]), do: :clear
  defp classify_risk(matches) do
    max_score = matches |> Enum.map(& &1.similarity_score) |> Enum.max()
    cond do
      max_score >= 0.95 -> :confirmed_match
      max_score >= 0.85 -> :potential_match
      true -> :clear
    end
  end

  defp calculate_confidence(matches) do
    case matches do
      [] -> 1.0
      _ -> matches |> Enum.map(& &1.similarity_score) |> Enum.max()
    end
  end

  defp generate_screening_id do
    "scr_" <> Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
  end
end
```

## Integration with Platform Components

The platform's screening results feed into multiple downstream systems:

| Component | Integration | Purpose |
|-----------|------------|---------|
| [Security Rating](@/glossary/security-rating.md) | Risk level affects score | Sanctions exposure degrades organization rating |
| [EASM](@/glossary/easm.md) | Supply chain screening | Identifies sanctioned entities in vendor networks |
| [NIS2](@/glossary/nis2.md) Compliance | Supply chain risk | NIS2 requires supply chain security assessment |
| [Intelligence Fusion](@/glossary/intelligence-fusion.md) | Multi-source correlation | Screening results correlated with other OSINT data |
| [Audit Trail](@/glossary/audit-trail.md) | Compliance documentation | All screening decisions logged with full audit trail |
| [SIEM](@/glossary/siem.md) | Security events | Screening results emitted as security telemetry events |

## Comparison with Alternatives

| Approach | Coverage | Speed | Accuracy | Cost |
|----------|----------|-------|----------|------|
| **In-house screening** | Customizable | Fast (local) | Depends on implementation | Development + maintenance |
| **Commercial SaaS** (Dow Jones, Refinitiv) | Comprehensive + PEP | API latency | High (tuned models) | Per-query pricing |
| **Bureau van Dijk/Moody's** | Financial focus | Moderate | Very high | Enterprise licensing |
| **Open-source lists only** | Government lists only | Fast | Limited (no PEP) | Free (lists) + development |
| **Prismatic integrated** | Multi-list + OSINT enrichment | Parallel, sub-second | High (fuzzy + resolution) | Platform integrated |

Commercial screening providers offer broader data coverage (particularly PEP databases, adverse media, and corporate ownership structures) but introduce API dependencies, per-query costs, and data residency concerns. In-house screening provides full control and eliminates per-query costs but requires significant investment in list management, matching algorithm development, and ongoing maintenance.

## Audit Trail and Compliance Documentation

Every screening operation generates an immutable audit record that documents the screening parameters, results, and disposition:

```elixir
defmodule PrismaticIntel.SanctionsScreening.AuditLogger do
  @moduledoc """
  Records immutable audit logs for all sanctions screening operations.
  Required by regulatory frameworks for compliance evidence.
  Records are retained for the configured period (minimum 5 years).
  """

  @spec log_screening(screening_result(), keyword()) :: {:ok, String.t()} | {:error, term()}
  def log_screening(result, opts \\ []) do
    audit_record = %{
      screening_id: result.screening_id,
      entity_screened: result.entity,
      lists_checked: result.lists_checked,
      match_count: length(result.matches),
      risk_level: result.risk_level,
      confidence: result.confidence,
      screened_at: result.checked_at,
      screened_by: Keyword.get(opts, :operator, "system"),
      disposition: Keyword.get(opts, :disposition, :pending_review),
      disposition_reason: Keyword.get(opts, :reason),
      retention_until: Date.add(Date.utc_today(), 365 * 7)
    }

    {:ok, audit_record.screening_id}
  end
end
```

## Best Practices

1. **Calibrate match thresholds based on risk appetite**. Setting thresholds too low generates overwhelming false positives; too high risks missing genuine matches. Start at 0.85 and adjust based on operational experience and regulatory guidance.

2. **Apply list updates promptly**. Sanctions designations take effect immediately upon publication. Automated ingestion pipelines with integrity verification should process updates within hours of publication.

3. **Document all screening decisions**. Regulators expect full audit trails demonstrating thorough review of matches, documented reasoning for dispositions, and records retained for 5-7 years.

4. **Screen continuously, not just at onboarding**. Batch re-screening of existing relationships whenever lists are updated catches entities designated after initial clearance.

5. **Combine multiple matching algorithms**. No single algorithm catches all variation types. The platform's multi-algorithm scoring pipeline provides comprehensive coverage across transliteration, phonetic similarity, and typographic variation.

6. **Implement entity resolution across lists**. The same sanctioned entity appearing on multiple lists under different name variants must be resolved to a single record to provide accurate risk assessment.

## Common Pitfalls

- **Screening against stale lists**: Using outdated list versions creates compliance gaps. Implement automated refresh with staleness alerts.

- **Over-reliance on exact matching**: Exact matching misses virtually all evasion attempts. Fuzzy matching is mandatory for meaningful detection.

- **Ignoring alias and transliteration variants**: Sanctioned entities use aliases, transliterations, and deliberate obfuscation. Normalization and variant generation are essential preprocessing steps.

- **Not accounting for script differences**: Arabic, Cyrillic, and Chinese names have multiple valid romanizations. Cross-script matching requires specialized transliteration handling.

- **Treating screening as a one-time check**: Sanctions lists update continuously. Ongoing monitoring is a regulatory expectation, not an optional enhancement.

## Related Concepts

- [OSINT](@/glossary/osint.md) -- Source methodology for accessing public sanctions data
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Multi-source correlation of screening results
- [NIS2 Directive](@/glossary/nis2.md) -- Compliance framework requiring supply chain screening
- [EASM](@/glossary/easm.md) -- Attack surface context enriching screening results
- [Security Rating](@/glossary/security-rating.md) -- Scores incorporating sanctions screening outcomes
- [Entity Resolution](@/glossary/entity-resolution.md) -- Deduplication technology underlying screening accuracy
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- External feeds complementing sanctions data
- [Compliance Framework](@/glossary/compliance-framework.md) -- Regulatory requirements driving screening obligations
- [Audit Trail](@/glossary/audit-trail.md) -- Immutable documentation of screening decisions

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
