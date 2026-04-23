+++
title = "NBU / Czech Security Authority"
weight = 60
[extra]
category = "czech"
type = "regulatory"
module = "CzechNbu"
description = "Czech National Security Authority - clearance registry and cybersecurity"
has_api = false
url = "https://nbu.cz"
rate_limit = "Public website, restricted data"
capabilities = ["Security Clearance Registry", "Classified Info Handling", "Cybersecurity Standards", "Supplier Verification", "NATO/EU Clearance", "Industrial Security"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1403
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["NBU", "Czech", "Security", "Authority", "National", "osint", "Prismatic Platform", "The NBU", "NATO"]
tags = ["osint", "czech", "nbu---czech-security-authority", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "NBU / Czech Security Authority - Prismatic Platform"
+++

## Overview

The National Security Authority (NBU -- Narodni bezpecnostni urad) is the Czech Republic's central government body responsible for administering and enforcing the national security clearance framework, protecting classified information, and establishing cybersecurity governance standards across both public and private sector entities. Established under Act No. 412/2005 Sb. on the protection of classified information and security clearance, the NBU operates as an independent authority with broad regulatory powers over the entire lifecycle of classified information handling.

For [OSINT](@/glossary/osint.md) analysts, the NBU represents a unique intelligence source that reveals which companies and individuals have been vetted by the state to handle sensitive information. The presence or absence of a facility security clearance is a strong signal in defense and critical infrastructure investigations, as it indicates both the trustworthiness assessment by the state and the entity's involvement in classified contracts. Understanding the NBU's role and data is essential for anyone conducting due diligence on Czech defense contractors, critical infrastructure operators, or government technology suppliers.

The NBU also serves as the Czech national authority for NATO and EU classified information, manages the national CERT (GovCERT.CZ), and certifies cryptographic products and information systems for classified use. Its scope expanded significantly with the implementation of the Czech Cybersecurity Act (Act No. 181/2014 Sb.), making it the primary cybersecurity regulator for critical information infrastructure and essential service operators.

## Data Sources and Registries

The NBU maintains several registries and databases that are partially accessible for intelligence purposes. Understanding what data exists and its accessibility level is crucial for effective collection planning.

| Data Source | Description | Access Level |
|-------------|-------------|--------------|
| **Facility Security Clearance Registry** | Companies authorized to handle classified information at various levels | Partially public -- cleared entities listed, details restricted |
| **Personnel Security Clearances** | Individuals who hold active security clearances | Not public -- confirmation only through official channels |
| **Certified Products List** | Cryptographic products and IT systems certified for classified use | Public -- published on nbu.cz |
| **Cybersecurity Regulations** | Decrees and standards under the Cybersecurity Act | Public -- published in legal collections |
| **Audit and Inspection Results** | Compliance assessments of critical infrastructure operators | Not public -- aggregated statistics only |
| **NATO/EU Clearance Records** | Cross-recognition of clearances for international classified work | Restricted -- verification through NATO/EU channels |

### Clearance Levels

The Czech security clearance system follows a tiered model aligned with NATO and EU classification frameworks:

| Czech Level | NATO Equivalent | EU Equivalent | Scope |
|-------------|----------------|---------------|-------|
| Vyhrazene | NATO RESTRICTED | RESTREINT UE | Basic sensitive information |
| Duverene | NATO CONFIDENTIAL | CONFIDENTIEL UE | Information whose disclosure could harm national interests |
| Tajne | NATO SECRET | SECRET UE | Serious damage to national security |
| Prisne tajne | COSMIC TOP SECRET | TRES SECRET UE | Exceptionally grave damage |

## API Integration and Data Collection

The NBU does not provide an official REST API for programmatic access. Intelligence collection from NBU sources requires a combination of web scraping, document analysis, and cross-referencing with other Czech registries. The Prismatic Platform adapter implements a multi-layered collection strategy.

```elixir
defmodule Prismatic.Osint.CzechNbu do
  @moduledoc """
  NBU (National Security Authority) OSINT adapter.

  Collects security clearance information, cybersecurity standards,
  and certified product data from NBU public sources.
  """

  @base_url "https://www.nbu.cz"

  @doc """
  Search for entities with facility security clearances.
  Returns matching cleared entities with available metadata.
  """
  @spec search_cleared(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def search_cleared(entity_name, opts \\ []) do
    with {:ok, html} <- fetch_clearance_registry(opts),
         {:ok, entries} <- parse_clearance_entries(html),
         filtered <- filter_by_name(entries, entity_name) do
      {:ok, filtered}
    end
  end

  @doc """
  Verify if a specific entity holds an active facility security clearance.
  Cross-references with ARES data for entity identification.
  """
  @spec verify_clearance(keyword()) :: {:ok, map()} | {:error, :not_found | term()}
  def verify_clearance(opts) do
    ico = Keyword.fetch!(opts, :ico)

    with {:ok, entity} <- Prismatic.Osint.Ares.lookup(ico),
         {:ok, clearances} <- search_cleared(entity.name),
         {:ok, match} <- find_exact_match(clearances, ico) do
      {:ok, %{
        entity: entity.name,
        ico: ico,
        clearance_level: match.level,
        valid_until: match.expiry,
        scope: match.scope,
        verified_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Retrieve current cybersecurity standards and requirements
  for critical infrastructure operators.
  """
  @spec standards(keyword()) :: {:ok, [map()]} | {:error, term()}
  def standards(opts \\ []) do
    domain = Keyword.get(opts, :domain, :all)

    with {:ok, documents} <- fetch_cybersecurity_standards(),
         filtered <- filter_by_domain(documents, domain) do
      {:ok, Enum.map(filtered, &parse_standard_document/1)}
    end
  end

  @doc """
  Retrieve the list of certified cryptographic products and systems.
  """
  @spec certified_products(keyword()) :: {:ok, [map()]} | {:error, term()}
  def certified_products(opts \\ []) do
    category = Keyword.get(opts, :category, :all)

    with {:ok, products} <- fetch_certified_products_list(),
         filtered <- filter_by_category(products, category) do
      {:ok, filtered}
    end
  end
end
```

### Collection Strategy

Given the absence of an official API, the collection pipeline employs several techniques:

| Technique | Application | Reliability |
|-----------|-------------|-------------|
| **Web Scraping** | Clearance registry pages, certified products lists | Medium -- layout changes require adapter updates |
| **Document Parsing** | PDF decisions, regulatory documents | High -- structured document formats |
| **Cross-Registry Correlation** | ARES ICO matching, Justice.cz director lookup | High -- authoritative identifiers |
| **RSS/Atom Feeds** | News and announcements from nbu.cz | High -- stable feed format |
| **Legal Database Mining** | Sbirka zakonu for new regulations | High -- structured legal databases |

## Query Examples

Practical intelligence queries against NBU data through the Prismatic Platform:

```elixir
# Verify a defense contractor's clearance status
{:ok, clearance} = Prismatic.Osint.CzechNbu.verify_clearance(ico: "25672541")
# => %{entity: "Aero Vodochody AEROSPACE a.s.", clearance_level: :tajne, ...}

# Find all entities with NATO SECRET level clearances
{:ok, nato_cleared} = Prismatic.Osint.CzechNbu.search_cleared("",
  level: :nato_secret,
  active_only: true
)

# Get cybersecurity requirements for energy sector
{:ok, standards} = Prismatic.Osint.CzechNbu.standards(
  domain: :critical_infrastructure,
  sector: :energy
)

# Cross-reference clearance with procurement data
{:ok, clearance} = Prismatic.Osint.CzechNbu.verify_clearance(ico: "12345678")
{:ok, contracts} = Prismatic.Osint.VerejneZakazky.by_supplier(ico: "12345678")

enriched = %{
  entity: clearance.entity,
  clearance_level: clearance.clearance_level,
  government_contracts: length(contracts),
  total_contract_value: Enum.sum(Enum.map(contracts, & &1.value)),
  classified_work_indicator: clearance.clearance_level in [:tajne, :prisne_tajne]
}
```

## Use Cases

### Supply Chain Security Assessment

Security clearance verification is a fundamental component of supply chain due diligence for organizations operating in defense, critical infrastructure, and government technology sectors. The NBU clearance registry enables analysts to verify that prospective suppliers have undergone the rigorous vetting process required for handling classified information. This includes checks on financial stability, criminal background, foreign ownership and control, and organizational security measures.

Key supply chain intelligence activities include verifying that contractors hold the appropriate clearance level for the work being tendered, assessing the breadth of the cleared supplier base in specific technical domains, identifying potential single points of failure where only one or two cleared suppliers exist for critical capabilities, and monitoring clearance revocations that might signal financial distress or security incidents.

### Defense Industry Competitive Intelligence

The NBU clearance registry effectively maps the Czech defense and security industrial base. Companies holding facility security clearances represent the subset of Czech industry that is authorized to participate in classified work. Analyzing this population reveals market structure, competitive dynamics, and potential partnership opportunities.

Analysts can map the cleared entity landscape by clearance level to understand which companies can compete for the most sensitive contracts, track new clearance grants as indicators of companies entering the defense market, and identify clearance revocations that may signal companies exiting the sector or experiencing security issues.

### Cybersecurity Compliance Assessment

Since the implementation of the Czech Cybersecurity Act, the NBU has become the primary regulator for cybersecurity across critical information infrastructure and essential services. Understanding NBU cybersecurity standards and their alignment with European frameworks such as [NIS2](@/glossary/nis2.md) is essential for compliance assessment and regulatory risk evaluation.

The Prismatic Platform maps NBU cybersecurity requirements against NIS2 directive provisions and ZKB 264/2025 Sb. requirements, enabling organizations to assess their compliance posture against multiple overlapping regulatory frameworks simultaneously.

### NATO/EU Classified Program Participation

For investigations involving international defense cooperation, NBU data reveals Czech entities authorized to participate in NATO and EU classified programs. This is particularly relevant for assessing multinational defense supply chains, understanding technology transfer pathways, and evaluating the Czech defense industrial base's integration into Western alliance structures.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No official API** | Collection requires scraping and parsing | Multi-source validation, robust parser maintenance |
| **Personnel clearances not public** | Cannot verify individual clearance holders | Focus on facility clearances, cross-reference with procurement |
| **Clearance details restricted** | Exact scope and conditions not published | Infer from procurement contract requirements |
| **Update frequency unclear** | Registry may not reflect recent changes | Timestamp all data, periodic re-verification |
| **Language barrier** | Primary content in Czech only | Automated translation with manual verification |
| **Redacted information** | Sensitive details removed from public versions | Cross-reference with other registries for gap filling |

## Legal and Ethical Considerations

All NBU data collection through the Prismatic Platform is limited to publicly accessible information. The following legal and ethical boundaries apply:

Classified information is never targeted, collected, or stored by the platform. All collection activities respect the boundaries established by Czech law, particularly Act No. 412/2005 Sb. on classified information protection. Security clearance verification is conducted only through publicly available registry information, never through unauthorized access to restricted databases. Personnel security clearance information is handled in compliance with GDPR requirements, and individual clearance status is only processed where there is a legitimate basis.

The NBU's own website terms of use are respected, and collection rates are kept at levels that do not impact service availability. Any data obtained through NBU sources is stored and processed in accordance with the Prismatic Platform's data governance framework and applicable Czech and EU data protection regulations.

## Platform Integration Architecture

Within the Prismatic Platform, NBU data feeds into multiple intelligence pipelines:

```elixir
# NBU data integration pipeline
defmodule Prismatic.Pipeline.NbuEnrichment do
  @moduledoc """
  Enrichment pipeline that augments entity profiles with NBU clearance
  and cybersecurity compliance data.
  """

  def enrich_entity(entity) do
    entity
    |> check_facility_clearance()
    |> assess_cybersecurity_compliance()
    |> evaluate_defense_sector_participation()
    |> calculate_security_trust_score()
  end

  defp check_facility_clearance(%{ico: ico} = entity) do
    case Prismatic.Osint.CzechNbu.verify_clearance(ico: ico) do
      {:ok, clearance} ->
        Map.put(entity, :nbu_clearance, %{
          level: clearance.clearance_level,
          active: true,
          verified_at: clearance.verified_at
        })

      {:error, :not_found} ->
        Map.put(entity, :nbu_clearance, %{level: :none, active: false})
    end
  end
end
```

The NBU enrichment pipeline integrates with the broader entity intelligence system, contributing to composite risk scores and compliance assessments used in the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) EASM module.

## Best Practices for NBU Intelligence

Effective use of NBU data in OSINT operations requires understanding both the authoritative nature of the source and its inherent limitations. Clearance data should always be cross-referenced with [ARES](@/osint/ares.md) business registry records to ensure correct entity identification through ICO matching. Procurement data from [Verejne zakazky](@/osint/verejne-zakazky.md) provides contextual evidence of the types of classified work an entity performs. Temporal analysis of clearance grants and revocations, correlated with financial data from [Justice.cz](@/osint/justice-cz.md), can reveal early warning signals of organizational instability.

Analysts should maintain awareness that the public clearance registry represents a snapshot, and recent changes may not yet be reflected. Building a longitudinal dataset through periodic collection enables trend analysis and anomaly detection that point-in-time queries cannot provide. The Prismatic Platform's automated collection scheduling ensures continuous monitoring of NBU sources with configurable alerting on detected changes.

## Related Sources

- [ARES](@/osint/ares.md) - Business [registry](@/glossary/registry-otp.md) for entity identification via ICO
- [Verejne zakazky](@/osint/verejne-zakazky.md) - Defense and government procurement contracts
- [EU Sanctions](@/osint/eu-sanctions.md) - [Sanctions screening](@/glossary/sanctions-screening.md) for cleared entities
- [Justice.cz](@/osint/justice-cz.md) - Commercial register for ownership and financial data
- [UOHS](@/osint/uohs.md) - Competition authority decisions on defense sector mergers
- [Hlidac statu](@/osint/hlidac-statu.md) - Government watchdog analytics on public spending
- [Registr smluv](@/osint/registr-smluv.md) - Contract registry for classified contract metadata

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)