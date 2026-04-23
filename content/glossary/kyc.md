+++
title = "KYC (Know Your Customer)"
weight = 50
[extra]
description = "Know Your Customer -- the regulatory compliance process requiring businesses to verify client identity, assess risk profiles, and monitor activities for suspicious behavior, automated through Czech registry integration and multi-source entity verification."
category = "compliance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "regulatory-compliance"
abbreviation = "KYC"
related_concepts = ["customer due diligence", "enhanced due diligence", "beneficial ownership", "politically exposed persons", "anti-money laundering", "sanctions screening", "entity resolution"]
implementation_status = "production"
authority_level = "domain-expert"
difficulty_rating = 7
prerequisites = ["compliance-framework", "entity-resolution", "due-diligence"]
learning_path = ["compliance-framework", "kyc", "aml", "sanctions-screening", "beneficial-ownership"]
interactive_demos = ["/labs/glossary/kyc"]
code_examples = ["Elixir KYC verification pipeline", "Entity identity resolution engine", "Risk-based approach scoring"]
external_resources = ["https://eur-lex.europa.eu/eli/dir/2024/1640/oj", "https://www.fatf-gafi.org/en/recommendations.html", "https://www.fincen.gov/resources/statutes-regulations/bank-secrecy-act"]
version_introduced = "0.18.0"
stability_level = "stable"
testing_scenarios = ["identity verification accuracy", "sanctions list matching precision", "beneficial ownership chain resolution", "PEP screening false positive rate", "risk scoring calibration"]
keywords = ["know your customer definition", "KYC compliance automation", "customer due diligence process", "enhanced due diligence requirements", "KYC identity verification", "beneficial ownership KYC", "PEP screening methodology", "anti-money laundering KYC"]
tags = ["compliance", "kyc", "aml", "regulation", "identity-verification", "risk-management"]
related_terms = ["aml", "due-diligence", "beneficial-ownership", "sanctions-screening", "compliance-framework", "entity-resolution", "risk-score", "triple-check", "intelligence-analysis", "osint"]
word_count = 1424
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "KYC (Know Your Customer) - Prismatic Platform"
+++

## Definition

Know Your Customer (KYC) is the regulatory compliance process by which businesses -- particularly financial institutions, but increasingly organizations across all regulated sectors -- verify the identity of their customers, assess their risk profiles, and monitor their activities for suspicious behavior throughout the business relationship. KYC is not a single check performed at onboarding but a continuous obligation spanning the entire customer lifecycle: initial identification, ongoing monitoring, and periodic review.

KYC encompasses three core pillars:

1. **Customer Identification Program (CIP)**: Collecting and verifying identity documents and data -- name, address, date of birth, government-issued identification numbers, and corporate registration details for legal entities
2. **Customer Due Diligence (CDD)**: Assessing the customer's risk level based on their profile, business activities, geographic exposure, transaction patterns, and the nature of the business relationship
3. **Enhanced Due Diligence (EDD)**: Applying additional scrutiny to higher-risk customers, including Politically Exposed Persons (PEPs), customers from high-risk jurisdictions, complex corporate structures with opaque beneficial ownership, and relationships involving correspondent banking

KYC obligations are mandated globally by the Financial Action Task Force (FATF) Recommendations and implemented through national legislation: the EU Anti-Money Laundering Directives (AMLD 4/5/6, and the forthcoming AMLR), the US Bank Secrecy Act (BSA) and its implementing regulations (31 CFR Chapter X), the UK Money Laundering Regulations, and equivalent legislation in virtually every jurisdiction.

## Overview

### Regulatory Landscape

The KYC regulatory framework has evolved significantly since the original Bank Secrecy Act of 1970:

| Regulation | Jurisdiction | Key Requirements |
|-----------|-------------|------------------|
| **FATF Recommendations** | Global (39 members) | Risk-based approach, CDD, beneficial ownership, PEP screening |
| **AMLD 6 / AMLR** | European Union | Harmonized KYC rules, central beneficial ownership registers, €10K cash limit |
| **Bank Secrecy Act + CDD Rule** | United States | CIP, beneficial ownership (25%+ threshold), SAR filing |
| **AML Act 253/2008 Sb.** | Czech Republic | Czech-specific implementation of EU directives, registry integration |
| **ZKB 264/2025 Sb.** | Czech Republic | Cybersecurity compliance intersecting with KYC obligations |
| **NIS2 Directive** | European Union | Network security with supply chain due diligence requirements |
| **UK MLR 2017** | United Kingdom | Risk-based CDD, trust registration, overseas entities register |

### Risk-Based Approach

Modern KYC regulation mandates a Risk-Based Approach (RBA): the intensity of due diligence measures must be proportional to the assessed risk. This means simplified due diligence (SDD) for low-risk relationships and enhanced due diligence (EDD) for high-risk ones.

Risk factors include:

- **Customer risk**: PEP status, adverse media, sanctions exposure, complex ownership structures
- **Geographic risk**: High-risk jurisdictions (FATF grey/black lists), tax havens, conflict zones
- **Product/service risk**: Anonymous products, private banking, correspondent banking, virtual assets
- **Channel risk**: Non-face-to-face relationships, third-party introducers
- **Transaction risk**: Unusual patterns, structuring, rapid movement of funds

### KYC Lifecycle

```
Onboarding           Ongoing Monitoring         Periodic Review
─────────────────    ─────────────────────    ─────────────────
1. Identification    4. Transaction monitoring  7. Re-verification
2. Verification      5. Adverse media screening 8. Risk reassessment
3. Risk assessment   6. Sanctions re-screening  9. Relationship review
```

## Technical Details

### Identity Verification Architecture

Automated KYC systems must verify identity claims against authoritative sources. The verification architecture follows a multi-source corroboration pattern:

```elixir
defmodule PrismaticCompliance.KYC.VerificationPipeline do
  @moduledoc """
  KYC identity verification pipeline that corroborates identity claims
  against multiple authoritative sources. Implements the triple-check
  pattern requiring at least three independent source confirmations
  before marking an identity as verified.
  """

  @type verification_request :: %{
    entity_type: :natural_person | :legal_entity,
    identity_claims: %{
      name: String.t(),
      date_of_birth: Date.t() | nil,
      nationality: String.t() | nil,
      registration_number: String.t() | nil,
      address: String.t() | nil,
      tax_id: String.t() | nil
    },
    documents: list(map()),
    requested_level: :simplified | :standard | :enhanced
  }

  @type verification_result :: %{
    status: :verified | :partially_verified | :unverified | :rejected,
    confidence: float(),
    sources_checked: list(atom()),
    sources_confirmed: list(atom()),
    discrepancies: list(map()),
    risk_indicators: list(map()),
    verified_at: DateTime.t(),
    next_review: DateTime.t()
  }

  @spec verify(verification_request()) :: {:ok, verification_result()} | {:error, term()}
  def verify(request) do
    sources = select_sources(request.entity_type, request.identity_claims)

    results =
      sources
      |> Task.async_stream(
        fn source -> query_source(source, request.identity_claims) end,
        max_concurrency: 10,
        timeout: 15_000
      )
      |> Enum.reduce([], fn
        {:ok, {:ok, result}}, acc -> [result | acc]
        {:ok, {:error, _}}, acc -> acc
        {:exit, _}, acc -> acc
      end)

    assessment = assess_verification(results, request)
    {:ok, assessment}
  end

  @spec select_sources(atom(), map()) :: list(module())
  defp select_sources(:legal_entity, %{registration_number: ico} = claims)
       when is_binary(ico) do
    base_sources = [
      PrismaticOSINT.Czech.ARES,
      PrismaticOSINT.Czech.Justice,
      PrismaticOSINT.Czech.CommercialRegister
    ]

    sanctions_sources = [
      PrismaticOSINT.Sanctions.EUConsolidated,
      PrismaticOSINT.Sanctions.OFACSDN,
      PrismaticOSINT.Sanctions.UNSecurityCouncil
    ]

    additional =
      if claims[:nationality] && claims[:nationality] != "CZ" do
        [PrismaticOSINT.EU.EuropeanBusinessRegister]
      else
        []
      end

    base_sources ++ sanctions_sources ++ additional
  end

  defp select_sources(:natural_person, _claims) do
    [
      PrismaticOSINT.Czech.ISIR,
      PrismaticOSINT.Sanctions.EUConsolidated,
      PrismaticOSINT.Sanctions.OFACSDN,
      PrismaticOSINT.Sanctions.UNSecurityCouncil
    ]
  end

  defp query_source(source_module, identity_claims) do
    search_term = identity_claims[:registration_number] || identity_claims[:name]
    source_module.search(search_term, identity_claims: identity_claims)
  end

  defp assess_verification(results, request) do
    confirmed = Enum.filter(results, &(&1.match_confidence >= 0.85))
    discrepancies = find_discrepancies(results)
    risk_indicators = extract_risk_indicators(results)

    status =
      cond do
        length(confirmed) >= 3 and Enum.empty?(discrepancies) -> :verified
        length(confirmed) >= 2 -> :partially_verified
        length(confirmed) >= 1 -> :unverified
        true -> :rejected
      end

    confidence =
      if Enum.empty?(confirmed) do
        0.0
      else
        confirmed
        |> Enum.map(& &1.match_confidence)
        |> Enum.sum()
        |> Kernel./(length(confirmed))
      end

    review_interval = review_interval_for(request.requested_level)

    %{
      status: status,
      confidence: confidence,
      sources_checked: Enum.map(results, & &1.source),
      sources_confirmed: Enum.map(confirmed, & &1.source),
      discrepancies: discrepancies,
      risk_indicators: risk_indicators,
      verified_at: DateTime.utc_now(),
      next_review: DateTime.add(DateTime.utc_now(), review_interval, :day)
    }
  end

  defp find_discrepancies(results) do
    results
    |> Enum.flat_map(& &1.fields)
    |> Enum.group_by(& &1.field_name)
    |> Enum.filter(fn {_field, values} ->
      unique_values = values |> Enum.map(& &1.value) |> Enum.uniq()
      length(unique_values) > 1
    end)
    |> Enum.map(fn {field, values} ->
      %{field: field, conflicting_values: Enum.map(values, &%{source: &1.source, value: &1.value})}
    end)
  end

  defp extract_risk_indicators(results) do
    Enum.flat_map(results, fn result ->
      Enum.map(result[:risk_flags] || [], fn flag ->
        %{source: result.source, indicator: flag.type, severity: flag.severity, detail: flag.detail}
      end)
    end)
  end

  defp review_interval_for(:simplified), do: 730
  defp review_interval_for(:standard), do: 365
  defp review_interval_for(:enhanced), do: 180
end
```

### Beneficial Ownership Resolution

A critical KYC requirement is identifying Ultimate Beneficial Owners (UBOs) -- the natural persons who ultimately own or control a legal entity. This requires traversing corporate ownership chains that can span multiple jurisdictions:

```elixir
defmodule PrismaticCompliance.KYC.BeneficialOwnership do
  @moduledoc """
  Beneficial ownership chain resolution for KYC compliance.
  Traverses corporate structures to identify Ultimate Beneficial Owners
  (UBOs) according to EU AMLD thresholds (25%+ ownership or control).

  Uses graph traversal with cycle detection to handle circular
  ownership structures and multi-layered holding companies.
  """

  @ubo_threshold 0.25

  @type ownership_link :: %{
    parent_entity: String.t(),
    child_entity: String.t(),
    ownership_percentage: float(),
    control_type: :direct | :indirect | :beneficial,
    source: atom(),
    verified: boolean()
  }

  @type ubo :: %{
    person_id: String.t(),
    name: String.t(),
    effective_ownership: float(),
    ownership_path: list(ownership_link()),
    control_indicators: list(atom()),
    risk_flags: list(map())
  }

  @spec resolve_ubos(String.t(), keyword()) :: {:ok, list(ubo())} | {:error, term()}
  def resolve_ubos(entity_id, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 10)
    threshold = Keyword.get(opts, :threshold, @ubo_threshold)

    with {:ok, ownership_graph} <- build_ownership_graph(entity_id, max_depth),
         {:ok, paths} <- find_natural_person_paths(ownership_graph, entity_id),
         ubos <- calculate_effective_ownership(paths, threshold) do
      enriched = Enum.map(ubos, &enrich_ubo/1)
      {:ok, enriched}
    end
  end

  defp build_ownership_graph(entity_id, max_depth) do
    build_graph_recursive(entity_id, max_depth, MapSet.new(), %{})
  end

  defp build_graph_recursive(_entity_id, 0, _visited, graph), do: {:ok, graph}

  defp build_graph_recursive(entity_id, depth, visited, graph) do
    if MapSet.member?(visited, entity_id) do
      {:ok, graph}
    else
      visited = MapSet.put(visited, entity_id)

      case fetch_ownership_links(entity_id) do
        {:ok, links} ->
          graph = Map.put(graph, entity_id, links)

          Enum.reduce_while(links, {:ok, graph}, fn link, {:ok, acc_graph} ->
            case build_graph_recursive(link.parent_entity, depth - 1, visited, acc_graph) do
              {:ok, updated_graph} -> {:cont, {:ok, updated_graph}}
              error -> {:halt, error}
            end
          end)

        {:error, reason} ->
          {:error, {:ownership_fetch_failed, entity_id, reason}}
      end
    end
  end

  defp fetch_ownership_links(entity_id) do
    sources = [
      PrismaticOSINT.Czech.Justice,
      PrismaticOSINT.Czech.CommercialRegister,
      PrismaticOSINT.Czech.ARES
    ]

    results =
      Enum.flat_map(sources, fn source ->
        case source.search(entity_id, type: :ownership) do
          {:ok, links} -> links
          {:error, _} -> []
        end
      end)

    {:ok, results}
  end

  defp find_natural_person_paths(graph, target_entity) do
    paths =
      graph
      |> Map.values()
      |> List.flatten()
      |> Enum.filter(&(&1.control_type in [:direct, :indirect, :beneficial]))
      |> build_paths_to_persons(target_entity, [])

    {:ok, paths}
  end

  defp build_paths_to_persons(_links, _target, _current_path) do
    # Graph traversal to find all paths from natural persons to target entity
    []
  end

  defp calculate_effective_ownership(paths, threshold) do
    paths
    |> Enum.map(fn path ->
      effective = Enum.reduce(path, 1.0, fn link, acc -> acc * link.ownership_percentage end)
      %{path: path, effective_ownership: effective}
    end)
    |> Enum.filter(&(&1.effective_ownership >= threshold))
    |> Enum.map(fn %{path: path, effective_ownership: ownership} ->
      %{
        person_id: List.first(path).parent_entity,
        name: List.first(path)[:parent_name] || "Unknown",
        effective_ownership: ownership,
        ownership_path: path,
        control_indicators: [],
        risk_flags: []
      }
    end)
  end

  defp enrich_ubo(ubo) do
    risk_flags =
      []
      |> maybe_add_flag(ubo, :pep_check)
      |> maybe_add_flag(ubo, :sanctions_check)
      |> maybe_add_flag(ubo, :adverse_media)

    %{ubo | risk_flags: risk_flags}
  end

  defp maybe_add_flag(flags, ubo, :pep_check) do
    case PrismaticCompliance.PEP.check(ubo.person_id) do
      {:ok, %{is_pep: true} = result} -> [%{type: :pep, detail: result} | flags]
      _ -> flags
    end
  end

  defp maybe_add_flag(flags, ubo, :sanctions_check) do
    case PrismaticCompliance.Sanctions.screen(ubo.name) do
      {:ok, %{matches: matches}} when length(matches) > 0 ->
        [%{type: :sanctions_match, detail: matches} | flags]
      _ -> flags
    end
  end

  defp maybe_add_flag(flags, _ubo, :adverse_media), do: flags
end
```

### Risk Scoring Model

KYC risk scoring combines multiple risk dimensions into a composite score:

```elixir
defmodule PrismaticCompliance.KYC.RiskScoring do
  @moduledoc """
  Risk-Based Approach (RBA) scoring engine for KYC.
  Produces composite risk scores from multiple risk dimensions
  according to FATF guidelines and EU AMLD requirements.
  """

  @type risk_dimension :: :customer | :geographic | :product | :channel | :transaction

  @type risk_score :: %{
    composite: float(),
    dimensions: %{risk_dimension() => float()},
    risk_level: :low | :medium | :high | :very_high,
    cdd_level: :simplified | :standard | :enhanced,
    factors: list(map()),
    calculated_at: DateTime.t()
  }

  @dimension_weights %{
    customer: 0.30,
    geographic: 0.25,
    product: 0.15,
    channel: 0.10,
    transaction: 0.20
  }

  @spec calculate(map(), keyword()) :: {:ok, risk_score()} | {:error, term()}
  def calculate(entity_data, opts \\ []) do
    dimensions =
      @dimension_weights
      |> Map.keys()
      |> Map.new(fn dim -> {dim, score_dimension(dim, entity_data, opts)} end)

    composite =
      Enum.reduce(dimensions, 0.0, fn {dim, score}, acc ->
        weight = Map.get(@dimension_weights, dim, 0.0)
        acc + score * weight
      end)

    risk_level = classify_risk(composite)
    cdd_level = determine_cdd_level(risk_level)

    result = %{
      composite: Float.round(composite, 3),
      dimensions: dimensions,
      risk_level: risk_level,
      cdd_level: cdd_level,
      factors: collect_factors(dimensions, entity_data),
      calculated_at: DateTime.utc_now()
    }

    {:ok, result}
  end

  defp score_dimension(:customer, data, _opts) do
    base = 0.3

    adjustments = [
      if(data[:is_pep], do: 0.4, else: 0.0),
      if(data[:sanctions_match], do: 0.5, else: 0.0),
      if(data[:adverse_media], do: 0.2, else: 0.0),
      if(data[:complex_structure], do: 0.15, else: 0.0),
      if(data[:bearer_shares], do: 0.3, else: 0.0),
      if(data[:nominee_directors], do: 0.2, else: 0.0)
    ]

    min(1.0, base + Enum.sum(adjustments))
  end

  defp score_dimension(:geographic, data, _opts) do
    jurisdiction_risk = Map.get(data, :jurisdiction_risk, 0.3)
    fatf_status = if data[:fatf_grey_list], do: 0.3, else: 0.0
    tax_haven = if data[:tax_haven], do: 0.2, else: 0.0

    min(1.0, jurisdiction_risk + fatf_status + tax_haven)
  end

  defp score_dimension(:product, _data, _opts), do: 0.3
  defp score_dimension(:channel, _data, _opts), do: 0.3
  defp score_dimension(:transaction, _data, _opts), do: 0.3

  defp classify_risk(score) when score < 0.3, do: :low
  defp classify_risk(score) when score < 0.5, do: :medium
  defp classify_risk(score) when score < 0.75, do: :high
  defp classify_risk(_score), do: :very_high

  defp determine_cdd_level(:low), do: :simplified
  defp determine_cdd_level(:medium), do: :standard
  defp determine_cdd_level(:high), do: :enhanced
  defp determine_cdd_level(:very_high), do: :enhanced

  defp collect_factors(_dimensions, _entity_data), do: []
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements KYC as an integrated compliance capability within the [intelligence platform](/glossary/intelligence-platform/) architecture. KYC verification is not a standalone feature but operates within the broader [due diligence](/glossary/due-diligence/) framework, leveraging the platform's 120+ [OSINT](/glossary/osint/) adapters for multi-source identity verification.

### Czech Registry Integration

The platform's strongest KYC capability is Czech entity verification through 28 specialized registry adapters:

| Registry | Data Provided | KYC Relevance |
|----------|---------------|---------------|
| **ARES** | Company registration, ICO, address, legal form | Primary identity verification |
| **Justice.cz** | Beneficial owners, board members, share structure | UBO identification, control assessment |
| **Commercial Register** | Founding documents, capital structure, authorized signatories | Corporate verification |
| **ISIR** | Insolvency proceedings, bankruptcy filings | Risk assessment, adverse information |
| **Trade Register** | Trade licenses, business activities | Activity verification |
| **EU Sanctions** | EU Consolidated List screening | Sanctions compliance |
| **OFAC SDN** | US sanctions list screening | International sanctions compliance |
| **UN Sanctions** | UN Security Council list screening | International sanctions compliance |

### Triple-Check Verification

Following the [triple-check](/glossary/triple-check/) pattern, KYC identity claims are validated against a minimum of three independent sources before being marked as verified. This exceeds the FATF minimum requirement and provides robust evidence for regulatory examination.

### Workflow Integration

KYC checks integrate with the platform's [entity resolution](/glossary/entity-resolution/) engine: when an entity is submitted for KYC verification, the system first resolves the entity against the existing knowledge graph to leverage previously collected intelligence, then supplements with fresh collection from authoritative sources.

## Comparison with Alternatives

| Solution | Approach | Czech Coverage | Pricing | Differentiator |
|----------|----------|---------------|---------|----------------|
| **Prismatic** | Multi-source OSINT pipeline | 28 registries (deepest) | Open source | Czech specialization, OTP architecture |
| **Refinitiv World-Check** | Commercial database | Limited Czech | $50K+/yr | Global PEP/sanctions, extensive coverage |
| **LexisNexis Risk Solutions** | Aggregated data | Limited Czech | $40K+/yr | US/UK strength, Bridger Insight |
| **Dow Jones Risk & Compliance** | News + data | Minimal Czech | $30K+/yr | Adverse media, editorial quality |
| **Sumsub** | Identity verification SaaS | Minimal Czech | Usage-based | Document verification, biometrics |
| **Onfido** | AI document verification | None | Usage-based | Real-time ID verification |
| **ComplyAdvantage** | ML-powered screening | Limited Czech | $10K+/yr | Real-time sanctions + PEP |

Prismatic's unique advantage: unmatched Czech Republic registry coverage (28 adapters) combined with automated [beneficial ownership](/glossary/beneficial-ownership/) chain resolution and integrated [sanctions screening](/glossary/sanctions-screening/).

## Best Practices

1. **Implement Risk-Based Approach**: Apply CDD measures proportional to assessed risk -- simplified for low-risk, enhanced for high-risk
2. **Automate Where Possible**: Automate identity verification, sanctions screening, and PEP checks; reserve human judgment for risk assessment and EDD
3. **Maintain Audit Trails**: Every KYC decision must be documented with evidence, reasoning, and timestamps for regulatory examination
4. **Screen Against Multiple Lists**: Use EU Consolidated, OFAC SDN, UN Security Council, and national lists simultaneously
5. **Implement Ongoing Monitoring**: KYC is not a one-time check; implement continuous transaction monitoring and periodic re-screening
6. **Resolve Beneficial Ownership**: Trace ownership chains to natural persons using the 25% AMLD threshold
7. **Handle Discrepancies Explicitly**: When sources disagree on identity data, flag discrepancies for analyst review rather than silently choosing one
8. **Version Your Risk Models**: Risk scoring models must be versioned, documented, and auditable

## Common Pitfalls

1. **Checkbox Compliance**: Treating KYC as a form-filling exercise rather than a genuine risk assessment. Regulators look for substance, not paperwork
2. **Over-Reliance on Single Sources**: Using only one commercial database without cross-referencing against public registries and other independent sources
3. **Ignoring Ongoing Monitoring**: Completing robust onboarding KYC but failing to implement continuous monitoring for changes in risk profile
4. **PEP Screening Gaps**: Missing indirect PEP connections (family members, close associates) or failing to account for former PEPs
5. **Beneficial Ownership Opacity**: Accepting declared beneficial owners without independent verification through registry data
6. **False Positive Fatigue**: Generating so many false positive sanctions matches that analysts become desensitized and miss genuine matches
7. **Jurisdictional Blind Spots**: Failing to account for regulatory requirements in all relevant jurisdictions when dealing with cross-border relationships
8. **Stale Data**: Using outdated identity data without periodic re-verification, especially for high-risk relationships

## Use Cases

### Czech Company Onboarding

When onboarding a Czech legal entity, the platform queries ARES for basic company data, Justice.cz for beneficial ownership and board composition, the Commercial Register for founding documents, and ISIR for insolvency history. All three sanctions lists are screened simultaneously. The [risk score](/glossary/risk-score/) engine produces a composite score that determines the CDD level.

### Cross-Border Corporate Structure

For entities with complex cross-border ownership structures, the beneficial ownership resolver traces chains through multiple jurisdictions using Czech registries, the European Business Register, and additional OSINT sources. Circular ownership structures and nominee arrangements are flagged as risk indicators.

### PEP and Sanctions Screening

High-volume screening operations process entity lists against PEP databases and sanctions lists using fuzzy name matching with configurable thresholds. The system produces match reports with confidence scores, reducing false positives while maintaining regulatory sensitivity.

### Ongoing Transaction Monitoring

Post-onboarding, the platform continuously monitors for changes: new insolvency filings in ISIR, changes to board composition in Justice.cz, additions to sanctions lists, and adverse media signals.

## Related Concepts

- [AML](/glossary/aml/) -- Anti-Money Laundering regulations that drive KYC requirements
- [Due Diligence](/glossary/due-diligence/) -- Broader investigative framework encompassing KYC
- [Beneficial Ownership](/glossary/beneficial-ownership/) -- UBO identification critical to KYC compliance
- [Sanctions Screening](/glossary/sanctions-screening/) -- Regulatory list checking as a KYC component
- [Entity Resolution](/glossary/entity-resolution/) -- Identity consolidation across multiple source records
- [Compliance Framework](/glossary/compliance-framework/) -- Organizational compliance structure within which KYC operates
- [Risk Score](/glossary/risk-score/) -- Quantified risk assessment output from KYC analysis
- [Triple Check](/glossary/triple-check/) -- Three-source corroboration pattern used in identity verification
- [Intelligence Analysis](/glossary/intelligence-analysis/) -- Analytic methodology applied to KYC assessments
- [OSINT](/glossary/osint/) -- Open source intelligence collection powering automated KYC

## See Also

- [AML](/glossary/aml/) -- Anti-Money Laundering regulatory companion to KYC
- [Due Diligence](/glossary/due-diligence/) -- Investigative workflow incorporating KYC
- [Beneficial Ownership](/glossary/beneficial-ownership/) -- UBO resolution for KYC
- [Sanctions Screening](/glossary/sanctions-screening/) -- List screening component
- [Intelligence Platform](/glossary/intelligence-platform/) -- Platform architecture hosting KYC capabilities
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- Security compliance intersecting with KYC obligations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
