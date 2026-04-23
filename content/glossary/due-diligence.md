+++
title = "Due Diligence"
weight = 50
[extra]
description = "Comprehensive investigation and analysis of a business entity, individual, or asset before a transaction, investment, or partnership, combining automated OSINT collection, entity resolution, sanctions screening, and cross-validated risk assessment."
category = "intelligence"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "compliance-intelligence"
related_concepts = ["kyc", "aml", "sanctions-screening", "beneficial-ownership", "entity-resolution"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 6
prerequisites = ["osint", "compliance-framework", "risk-assessment", "knowledge-graph"]
learning_path = ["compliance-framework", "kyc", "aml", "due-diligence", "sanctions-screening", "entity-resolution"]
interactive_demos = ["/labs/glossary/due-diligence"]
code_examples = ["elixir"]
external_resources = ["https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32015L0849", "https://www.sec.gov/education/smallbusiness/exemptofferings/due-diligence"]
version_introduced = "0.7.0"
stability_level = "stable"
testing_scenarios = ["entity-search-accuracy", "sanctions-hit-detection", "cross-source-validation", "risk-score-calibration", "false-positive-rate"]
keywords = ["due diligence", "KYC", "AML", "compliance", "entity resolution", "sanctions screening", "beneficial ownership", "risk assessment", "OSINT", "Czech registry", "ARES", "commercial register"]
tags = ["glossary", "intelligence", "compliance", "osint", "kyc", "aml", "risk-assessment", "entity-resolution", "sanctions"]
related_terms = ["kyc", "aml", "sanctions-screening", "beneficial-ownership", "entity-resolution", "osint", "compliance-framework", "risk-score", "knowledge-graph", "triple-check"]
word_count = 1728
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Due Diligence - Prismatic Platform"
+++

## Definition

Due diligence is the systematic investigation and evaluation of a business entity, individual, or asset conducted prior to entering into a transaction, partnership, investment, or engagement. The process aims to establish an evidence-based understanding of the target's financial health, legal standing, ownership structure, operational resilience, reputational profile, and regulatory compliance posture. Due diligence extends beyond traditional document review to encompass automated intelligence collection from open sources, entity resolution across fragmented datasets, graph-based relationship analysis, temporal pattern detection, sanctions and watchlist screening, and structured risk assessment against applicable regulatory frameworks.

Due diligence encompasses several specialized variants: commercial due diligence (market position, competitive landscape, customer concentration), financial due diligence (revenue verification, liability assessment, working capital analysis), legal due diligence (litigation history, regulatory compliance, contractual obligations), technical due diligence (technology stack, IP portfolio, technical debt), and compliance due diligence ([KYC](/glossary/kyc/)/[AML](/glossary/aml/), [sanctions screening](/glossary/sanctions-screening/), PEP identification, [beneficial ownership](/glossary/beneficial-ownership/) verification). Modern due diligence platforms automate the data collection and cross-validation phases while preserving human judgment for interpretation and risk assessment.

In the Prismatic Platform, due diligence is implemented as a comprehensive intelligence subsystem integrating 120+ [OSINT](/glossary/security-operations/) source adapters, 30+ Czech public registries, global sanctions databases, and a graph-based [entity resolution](/glossary/entity-resolution/) engine backed by KuzuDB.

## Overview

The practice of due diligence has its origins in securities law -- specifically Section 11 of the U.S. Securities Act of 1933, which established a "due diligence defense" for underwriters who could demonstrate they had conducted a reasonable investigation before offering securities. Over the following nine decades, the concept expanded far beyond securities to encompass mergers and acquisitions, venture capital investment, private equity transactions, commercial lending, partnership agreements, vendor onboarding, and regulatory compliance.

The regulatory landscape driving due diligence has intensified dramatically since the early 2000s:

**Anti-Money Laundering (AML)**: The Financial Action Task Force (FATF) recommendations, the EU Anti-Money Laundering Directives (AMLD4, AMLD5, AMLD6), and national transpositions require financial institutions and "obliged entities" to perform Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) on customers, beneficial owners, and transactions.

**Know Your Customer (KYC)**: Regulatory frameworks including the USA PATRIOT Act, EU AMLD, and local regulations require organizations to verify the identity of their customers, assess their risk profile, and monitor their transactions for suspicious activity.

**Sanctions Compliance**: Regulations from OFAC (US), the EU, the UN, and national authorities require screening against sanctions lists, identifying politically exposed persons (PEPs), and detecting sanctioned ownership structures that may be hidden through complex corporate layering.

**Beneficial Ownership Transparency**: The EU's 5th AMLD and national registers (including the Czech Republic's register of beneficial owners under Act No. 37/2021 Coll.) require identification and verification of ultimate beneficial owners holding more than 25% ownership or control.

The evolution from manual due diligence to automated, intelligence-driven due diligence represents a fundamental shift in capability. Manual processes involving document review by teams of analysts have given way to automated systems that can query hundreds of data sources in parallel, resolve entities across fragmented datasets, map corporate ownership graphs, detect sanctions hits through fuzzy matching, and generate risk scores -- all within minutes rather than weeks.

## Technical Details

### Due Diligence Pipeline Architecture

The Prismatic Platform implements due diligence as a multi-stage pipeline that progresses from data collection through entity resolution, cross-validation, risk scoring, and report generation:

```elixir
defmodule PrismaticDD.Pipeline do
  @moduledoc """
  Orchestrates the due diligence investigation pipeline.

  Stages:
  1. Entity identification and source planning
  2. Parallel OSINT data collection from 120+ adapters
  3. Entity resolution and record linkage
  4. Graph construction and relationship analysis
  5. Sanctions and watchlist screening
  6. Cross-source validation (triple-check)
  7. Risk scoring and grade assignment
  8. Report generation
  """

  alias PrismaticDD.{
    EntityResolver,
    SourceOrchestrator,
    SanctionsScreener,
    RiskEngine,
    ReportGenerator
  }

  @type entity_type :: :company | :individual | :trust | :foundation
  @type investigation_params :: %{
          name: String.t(),
          entity_type: entity_type(),
          jurisdiction: String.t(),
          identifiers: map(),
          depth: :standard | :enhanced | :deep
        }
  @type investigation_result :: %{
          entity: EntityResolver.resolved_entity(),
          sources_queried: pos_integer(),
          sources_responded: pos_integer(),
          sanctions_hits: [SanctionsScreener.hit()],
          risk_score: RiskEngine.score(),
          risk_grade: :A | :B | :C | :D | :F,
          confidence: float(),
          report_id: String.t(),
          duration_ms: pos_integer()
        }

  @spec investigate(investigation_params()) :: {:ok, investigation_result()} | {:error, term()}
  def investigate(%{name: name, entity_type: type} = params) when is_binary(name) do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, sources} <- plan_sources(params),
         {:ok, raw_data} <- collect_data(sources, params),
         {:ok, resolved} <- resolve_entity(raw_data, params),
         {:ok, graph} <- build_relationship_graph(resolved),
         {:ok, sanctions} <- screen_sanctions(resolved, graph),
         {:ok, validated} <- cross_validate(resolved, raw_data),
         {:ok, score} <- assess_risk(validated, sanctions, graph),
         {:ok, report_id} <- generate_report(validated, score, sanctions) do
      duration = System.monotonic_time(:millisecond) - start_time

      {:ok,
       %{
         entity: resolved,
         sources_queried: length(sources),
         sources_responded: count_responses(raw_data),
         sanctions_hits: sanctions,
         risk_score: score.numeric,
         risk_grade: score.grade,
         confidence: score.confidence,
         report_id: report_id,
         duration_ms: duration
       }}
    end
  end

  @spec plan_sources(investigation_params()) :: {:ok, [atom()]} | {:error, term()}
  defp plan_sources(%{jurisdiction: jurisdiction, entity_type: type, depth: depth}) do
    sources =
      SourceOrchestrator.available_sources()
      |> filter_by_jurisdiction(jurisdiction)
      |> filter_by_entity_type(type)
      |> filter_by_depth(depth)

    if Enum.empty?(sources) do
      {:error, :no_sources_available}
    else
      {:ok, sources}
    end
  end

  @spec collect_data([atom()], investigation_params()) :: {:ok, map()} | {:error, term()}
  defp collect_data(sources, params) do
    results =
      sources
      |> Task.async_stream(
        fn source -> SourceOrchestrator.query(source, params) end,
        max_concurrency: 20,
        timeout: :timer.seconds(30),
        on_timeout: :kill_task
      )
      |> Enum.reduce(%{}, fn
        {:ok, {:ok, source, data}}, acc -> Map.put(acc, source, data)
        {:ok, {:error, _source, _reason}}, acc -> acc
        {:exit, _reason}, acc -> acc
      end)

    {:ok, results}
  end

  @spec resolve_entity(map(), investigation_params()) :: {:ok, EntityResolver.resolved_entity()} | {:error, term()}
  defp resolve_entity(raw_data, params) do
    EntityResolver.resolve(raw_data, params)
  end

  @spec build_relationship_graph(EntityResolver.resolved_entity()) :: {:ok, map()} | {:error, term()}
  defp build_relationship_graph(entity) do
    PrismaticDD.GraphBuilder.build(entity)
  end

  @spec screen_sanctions(EntityResolver.resolved_entity(), map()) :: {:ok, [SanctionsScreener.hit()]} | {:error, term()}
  defp screen_sanctions(entity, graph) do
    SanctionsScreener.screen(entity, graph)
  end

  @spec cross_validate(EntityResolver.resolved_entity(), map()) :: {:ok, map()} | {:error, term()}
  defp cross_validate(entity, raw_data) do
    PrismaticDD.TripleCheck.validate(entity, raw_data)
  end

  @spec assess_risk(map(), [SanctionsScreener.hit()], map()) :: {:ok, RiskEngine.score()} | {:error, term()}
  defp assess_risk(validated, sanctions, graph) do
    RiskEngine.score(validated, sanctions, graph)
  end

  @spec generate_report(map(), RiskEngine.score(), [SanctionsScreener.hit()]) :: {:ok, String.t()} | {:error, term()}
  defp generate_report(entity, score, sanctions) do
    ReportGenerator.generate(entity, score, sanctions)
  end

  @spec count_responses(map()) :: non_neg_integer()
  defp count_responses(raw_data), do: map_size(raw_data)

  @spec filter_by_jurisdiction([atom()], String.t()) :: [atom()]
  defp filter_by_jurisdiction(sources, jurisdiction) do
    SourceOrchestrator.filter_by_jurisdiction(sources, jurisdiction)
  end

  @spec filter_by_entity_type([atom()], entity_type()) :: [atom()]
  defp filter_by_entity_type(sources, type) do
    SourceOrchestrator.filter_by_entity_type(sources, type)
  end

  @spec filter_by_depth([atom()], atom()) :: [atom()]
  defp filter_by_depth(sources, depth) do
    SourceOrchestrator.filter_by_depth(sources, depth)
  end
end
```

### Czech Registry Integration

The Prismatic Platform integrates with 30+ Czech public registries, providing comprehensive coverage of the Czech business ecosystem:

```elixir
defmodule PrismaticDD.CzechRegistries do
  @moduledoc """
  Unified interface to Czech public registries for due diligence.

  Integrates with ARES, Justice.cz (Commercial Register, ISIR),
  RZP (Trade Register), CUZK (Cadastral Registry), Registr Smluv
  (Contract Registry), and the Beneficial Ownership Register.
  """

  @type ico :: String.t()
  @type registry_result :: %{
          source: atom(),
          data: map(),
          fetched_at: DateTime.t(),
          confidence: float()
        }

  @registries [
    :ares,
    :justice_or,
    :justice_isir,
    :rzp,
    :cuzk,
    :registr_smluv,
    :beneficial_owners,
    :szr,
    :cedr,
    :ruian
  ]

  @spec search_by_ico(ico()) :: {:ok, [registry_result()]} | {:error, term()}
  def search_by_ico(ico) when is_binary(ico) and byte_size(ico) == 8 do
    results =
      @registries
      |> Task.async_stream(
        fn registry -> query_registry(registry, {:ico, ico}) end,
        max_concurrency: 10,
        timeout: :timer.seconds(15),
        on_timeout: :kill_task
      )
      |> Enum.flat_map(fn
        {:ok, {:ok, result}} -> [result]
        _ -> []
      end)

    {:ok, results}
  end

  def search_by_ico(_ico), do: {:error, :invalid_ico_format}

  @spec search_by_name(String.t(), keyword()) :: {:ok, [registry_result()]} | {:error, term()}
  def search_by_name(name, opts \\ []) when is_binary(name) do
    jurisdiction = Keyword.get(opts, :jurisdiction, "CZ")
    entity_type = Keyword.get(opts, :entity_type, :any)

    with {:ok, ares_results} <- query_registry(:ares, {:name, name}),
         candidates <- extract_icos(ares_results),
         {:ok, enriched} <- enrich_candidates(candidates) do
      filtered =
        enriched
        |> filter_by_entity_type_internal(entity_type)
        |> sort_by_relevance(name)

      {:ok, filtered}
    end
  end

  @spec query_registry(atom(), tuple()) :: {:ok, registry_result()} | {:error, term()}
  defp query_registry(registry, query) do
    adapter = registry_adapter(registry)
    adapter.search(query)
  end

  @spec registry_adapter(atom()) :: module()
  defp registry_adapter(:ares), do: PrismaticOSINT.Czech.ARES
  defp registry_adapter(:justice_or), do: PrismaticOSINT.Czech.Justice.CommercialRegister
  defp registry_adapter(:justice_isir), do: PrismaticOSINT.Czech.Justice.ISIR
  defp registry_adapter(:rzp), do: PrismaticOSINT.Czech.RZP
  defp registry_adapter(:cuzk), do: PrismaticOSINT.Czech.CUZK
  defp registry_adapter(:registr_smluv), do: PrismaticOSINT.Czech.RegistrSmluv
  defp registry_adapter(:beneficial_owners), do: PrismaticOSINT.Czech.BeneficialOwners
  defp registry_adapter(:szr), do: PrismaticOSINT.Czech.SZR
  defp registry_adapter(:cedr), do: PrismaticOSINT.Czech.CEDR
  defp registry_adapter(:ruian), do: PrismaticOSINT.Czech.RUIAN

  @spec extract_icos(registry_result()) :: [ico()]
  defp extract_icos(%{data: %{results: results}}) do
    Enum.map(results, & &1.ico)
  end

  defp extract_icos(_), do: []

  @spec enrich_candidates([ico()]) :: {:ok, [map()]} | {:error, term()}
  defp enrich_candidates(icos) do
    enriched =
      icos
      |> Task.async_stream(&search_by_ico/1, max_concurrency: 5, timeout: :timer.seconds(30))
      |> Enum.flat_map(fn
        {:ok, {:ok, results}} -> results
        _ -> []
      end)

    {:ok, enriched}
  end

  @spec filter_by_entity_type_internal([map()], atom()) :: [map()]
  defp filter_by_entity_type_internal(results, :any), do: results

  defp filter_by_entity_type_internal(results, type) do
    Enum.filter(results, fn r -> Map.get(r, :entity_type) == type end)
  end

  @spec sort_by_relevance([map()], String.t()) :: [map()]
  defp sort_by_relevance(results, _query), do: results
end
```

### Sanctions Screening

```elixir
defmodule PrismaticDD.SanctionsScreener do
  @moduledoc """
  Multi-list sanctions screening with fuzzy name matching,
  alias resolution, and ownership chain traversal.

  Screens against EU consolidated sanctions list, OFAC SDN,
  UN consolidated list, and national lists. Uses configurable
  fuzzy matching thresholds to balance detection sensitivity
  against false positive rates.
  """

  @type hit :: %{
          list: :eu | :ofac_sdn | :un | :national,
          match_type: :exact | :fuzzy | :alias | :ownership,
          matched_name: String.t(),
          target_name: String.t(),
          similarity_score: float(),
          entry_id: String.t(),
          designation_date: Date.t() | nil,
          programs: [String.t()]
        }

  @type screening_result :: %{
          hits: [hit()],
          screened_entities: pos_integer(),
          lists_checked: [atom()],
          screening_time_ms: pos_integer()
        }

  @fuzzy_threshold 0.85
  @ownership_depth 4

  @spec screen(map(), map()) :: {:ok, [hit()]} | {:error, term()}
  def screen(entity, relationship_graph) do
    names = extract_all_names(entity)
    related = extract_related_entities(relationship_graph, @ownership_depth)

    all_targets = names ++ related

    hits =
      [:eu, :ofac_sdn, :un]
      |> Task.async_stream(
        fn list -> screen_against_list(list, all_targets) end,
        max_concurrency: 3,
        timeout: :timer.seconds(60)
      )
      |> Enum.flat_map(fn
        {:ok, {:ok, list_hits}} -> list_hits
        _ -> []
      end)
      |> Enum.sort_by(& &1.similarity_score, :desc)
      |> deduplicate_hits()

    {:ok, hits}
  end

  @spec screen_against_list(atom(), [String.t()]) :: {:ok, [hit()]} | {:error, term()}
  defp screen_against_list(list, targets) do
    entries = load_sanctions_list(list)

    hits =
      for target <- targets,
          entry <- entries,
          similarity = calculate_similarity(target, entry.name),
          similarity >= @fuzzy_threshold do
        %{
          list: list,
          match_type: if(similarity == 1.0, do: :exact, else: :fuzzy),
          matched_name: target,
          target_name: entry.name,
          similarity_score: similarity,
          entry_id: entry.id,
          designation_date: entry.designation_date,
          programs: entry.programs
        }
      end

    {:ok, hits}
  end

  @spec extract_all_names(map()) :: [String.t()]
  defp extract_all_names(entity) do
    primary = [entity[:name] | Map.get(entity, :aliases, [])]
    transliterations = Enum.flat_map(primary, &generate_transliterations/1)
    Enum.uniq(primary ++ transliterations)
  end

  @spec extract_related_entities(map(), pos_integer()) :: [String.t()]
  defp extract_related_entities(graph, depth) do
    PrismaticDD.GraphTraversal.ownership_chain(graph, depth)
    |> Enum.map(& &1.name)
  end

  @spec calculate_similarity(String.t(), String.t()) :: float()
  defp calculate_similarity(a, b) do
    String.jaro_distance(String.downcase(a), String.downcase(b))
  end

  @spec generate_transliterations(String.t()) :: [String.t()]
  defp generate_transliterations(name) do
    [name]
  end

  @spec deduplicate_hits([hit()]) :: [hit()]
  defp deduplicate_hits(hits) do
    hits
    |> Enum.uniq_by(fn h -> {h.list, h.entry_id, h.matched_name} end)
  end

  @spec load_sanctions_list(atom()) :: [map()]
  defp load_sanctions_list(_list), do: []
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements due diligence as a comprehensive subsystem accessible through multiple interfaces:

### DD Intelligence Subsystem

The `prismatic_dd` OTP application provides the core due diligence engine with case management, [entity resolution](/glossary/entity-resolution/), graph analysis via KuzuDB, and the [triple-check](/glossary/triple-check/) cross-validation engine built on the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework.

### OSINT Source Integration

The platform integrates 120+ OSINT source adapters organized across categories:

- **Czech Registries** (28 adapters): ARES, Justice.cz (Commercial Register, ISIR), RZP, CUZK, Registr Smluv, Beneficial Owners, and more
- **Global Sources** (84 adapters): Shodan, VirusTotal, Censys, Hunter.io, and domain/IP intelligence providers
- **Sanctions Lists** (3 adapters): EU consolidated list, OFAC SDN, UN consolidated list
- **Regional Sources**: European Business Register (EU), Companies House (UK), SEC EDGAR (US)

### Risk Scoring Engine

The [risk scoring](/glossary/risk-score/) engine produces letter grades (A-F) with numeric scores (300-900) mapped to NIS2 and [ZKB](/glossary/zkb/) compliance requirements. Scores are calibrated against industry benchmarks and include confidence intervals that reflect the completeness and consistency of available data.

### Web Interface

The DD subsystem is accessible at `/dd` in the web application, with investigation tiles available in the [Labs](/labs) dashboard. The LiveView interface supports real-time progress tracking during investigations, interactive graph exploration of ownership structures, and exportable PDF reports.

### Triple-Check Validation

Every due diligence finding undergoes [triple-check](/glossary/triple-check/) cross-validation, requiring corroboration from at least three independent sources before establishing a claim as verified. This methodology is grounded in the [NABLA Infinity](/glossary/nabla-infinity/) [signal plurality](/glossary/signal-plurality/) axiom.

## Comparison with Alternatives

| Platform | Sources | Automation | Self-Hosted | Pricing |
|----------|---------|------------|-------------|---------|
| **Prismatic DD** | 120+ adapters, 30+ CZ registries | Full pipeline automation | Yes | Open source (GHL) |
| **Refinitiv World-Check** | Global PEP/sanctions, media | Screening + manual review | No (SaaS only) | $25K-250K/year |
| **Dow Jones Risk & Compliance** | Global sanctions, adverse media | Screening + alerts | No (SaaS only) | $30K-300K/year |
| **LexisNexis Risk Solutions** | US/global registries, litigation | Semi-automated | No (SaaS only) | $20K-200K/year |
| **OpenSanctions** | Global sanctions/PEP | Data only, no pipeline | Yes (data) | Free (data), paid (API) |
| **Maltego** | OSINT transforms | Transform-based | Desktop app | $5K-50K/year |

## Best Practices

1. **Source Diversity**: Query multiple independent sources for every data point. Single-source findings are inherently unreliable. The [triple-check](/glossary/triple-check/) methodology requires three independent corroborating sources.

2. **Entity Resolution First**: Before analyzing data, resolve entity identities across sources. The same entity may appear under different names, identifiers, and transliterations. Failing to resolve entities leads to fragmented and incomplete assessments.

3. **Ownership Chain Traversal**: Follow ownership chains to their ultimate [beneficial owners](/glossary/beneficial-ownership/). Complex corporate structures with shell companies, trusts, and nominee arrangements may be designed to obscure sanctioned or high-risk ownership.

4. **Temporal Analysis**: Examine not just current state but historical patterns. Directors who resigned shortly before enforcement actions, ownership changes coinciding with sanctions designations, and financial pattern shifts may indicate risk that snapshot analysis would miss.

5. **Fuzzy Matching Calibration**: Tune sanctions screening thresholds carefully. Too strict (>0.95) misses transliteration variants and aliases. Too loose (<0.80) generates excessive false positives. The platform default of 0.85 balances sensitivity with precision.

6. **Adverse Media Screening**: Include structured media screening alongside registry and sanctions checks. Adverse media often precedes formal enforcement actions and provides early warning of emerging risks.

7. **Continuous Monitoring**: Due diligence is not a point-in-time exercise. Implement continuous monitoring for changes in sanctions lists, registry data, beneficial ownership, and adverse media for ongoing relationships.

8. **Audit Trail**: Maintain an immutable [audit trail](/glossary/audit-trail/) of every query, source response, matching decision, and risk assessment. Regulators require demonstrable evidence of due diligence processes.

## Common Pitfalls

1. **Name-Only Screening**: Screening only against primary entity names without considering aliases, transliterations, former names, and associated entities. This misses sanctions hits that use variant spellings or alternative name forms.

2. **Ignoring Ownership Structures**: Performing due diligence only on the direct counterparty without investigating ownership chains. Sanctioned individuals frequently operate through layers of shell companies and nominee arrangements.

3. **Stale Data**: Relying on cached or infrequently updated source data. Sanctions lists, registry data, and beneficial ownership records change continuously. Investigations must use current data.

4. **False Confidence from Automation**: Treating automated screening results as definitive without human review. Automated systems excel at data collection and pattern matching but cannot replace human judgment for contextual interpretation and risk assessment.

5. **Jurisdiction Blindness**: Applying a single due diligence methodology across all jurisdictions without accounting for local regulatory requirements, available data sources, and cultural naming conventions.

6. **Threshold Rigidity**: Using fixed risk thresholds without considering context. A sanctions similarity score of 0.87 might be a clear match for a short name ("Li Wei") but a false positive for a long corporate name with common words.

7. **Missing Negative Indicators**: Focusing only on what is found without considering what is missing. The absence of expected registry entries, financial filings, or web presence can be more significant than any individual finding.

8. **Inadequate Documentation**: Performing due diligence without documenting methodology, sources queried, findings, and decisions. Incomplete documentation undermines the regulatory value of the entire process.

## Use Cases

### Pre-Investment Due Diligence

Venture capital and private equity firms use the platform to investigate target companies before investment. The pipeline queries Czech registries for financial health, commercial register for corporate structure, [beneficial ownership](/glossary/beneficial-ownership/) registry for UBO identification, sanctions lists for compliance, and global OSINT sources for reputational intelligence.

### KYC/AML Compliance

Financial institutions and obliged entities use the platform to perform Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) as required by [AML](/glossary/aml/) regulations. The automated pipeline significantly reduces the time required for [KYC](/glossary/kyc/) onboarding while maintaining regulatory compliance.

### Vendor Risk Assessment

Organizations use the platform to assess the security and compliance posture of vendors and suppliers. The investigation combines [security rating](/glossary/security-rating/) assessment (via [Prismatic Perimeter](/glossary/prismatic-perimeter/)) with entity investigation for comprehensive vendor risk assessment.

### Merger and Acquisition Due Diligence

M&A transactions require comprehensive investigation of target companies across financial, legal, technical, and compliance dimensions. The platform's multi-source intelligence collection and [entity resolution](/glossary/entity-resolution/) capabilities accelerate the data gathering phase from weeks to hours.

### Sanctions Compliance Monitoring

Organizations subject to sanctions regulations use the platform for continuous screening of counterparties, beneficial owners, and transaction participants against EU, OFAC, and UN sanctions lists. The fuzzy matching engine handles name variants, transliterations, and alias detection.

## Related Concepts

- [KYC](/glossary/kyc/) -- Know Your Customer compliance requirements for identity verification
- [AML](/glossary/aml/) -- Anti-Money Laundering regulatory framework and detection methodologies
- [Sanctions Screening](/glossary/sanctions-screening/) -- Automated screening against sanctions and watchlists
- [Beneficial Ownership](/glossary/beneficial-ownership/) -- Identification of ultimate beneficial owners behind corporate structures
- [Entity Resolution](/glossary/entity-resolution/) -- Record linkage and identity consolidation across fragmented data sources
- [Triple Check](/glossary/triple-check/) -- Three-source cross-validation methodology for establishing verified claims
- [Risk Score](/glossary/risk-score/) -- Quantified risk assessment output with letter grades and numeric scores
- [Knowledge Graph](/glossary/knowledge-graph/) -- Graph structure storing entity relationships and ownership chains
- [Compliance Framework](/glossary/compliance-framework/) -- Regulatory compliance assessment and enforcement infrastructure
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework enforcing evidence plurality and provenance tracking

## See Also

- [Security Rating](/glossary/security-rating/) -- Quantified security posture assessment for vendor risk
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- External Attack Surface Management complementing DD investigations
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulation relevant to compliance due diligence
- [Audit Trail](/glossary/audit-trail/) -- Immutable logging of investigation steps for regulatory evidence
- [Confidence Scoring](/glossary/confidence-scoring/) -- Quantified confidence levels for investigation findings
- [Security Assessment](/glossary/security-assessment/) -- Technical security evaluation of target entities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
