+++
title = "EU Sanctions"
weight = 30
[extra]
category = "eu"
type = "sanctions"
module = "EuSanctions"
description = "European Union Consolidated Sanctions List for compliance and entity screening"
has_api = true
url = "https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions"
rate_limit = "No official limit"
capabilities = ["Entity Search", "Person Search", "Vessel Search", "Sanctions Program Lookup", "Fuzzy Name Matching", "Regime Classification"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1630
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Sanctions", "European", "Union", "Consolidated", "List", "osint", "Prismatic Platform", "OFAC"]
tags = ["osint", "eu", "eu-sanctions", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "EU Sanctions - Prismatic Platform"
+++

## Overview

The EU Consolidated Sanctions List is the authoritative dataset of all persons, groups, entities, and vessels subject to EU restrictive measures (financial sanctions). Maintained by the European Commission's Directorate-General for Financial Stability, Financial Services and Capital Markets Union (DG FISMA), this list consolidates sanctions across all EU regulations into a single searchable dataset. The consolidated list aggregates designations from over 30 sanctions regimes targeting specific countries, terrorism, cyber attacks, chemical weapons proliferation, and human rights violations.

For any organization operating within the European Union or dealing with EU-connected entities, screening against the EU sanctions list is not optional -- it is a legal obligation under EU regulations. Council Regulation (EC) No 2580/2001, Council Regulation (EC) No 881/2002, and their successors require all EU persons and entities to freeze the funds and economic resources of designated persons and ensure that no funds or economic resources are made available to them. Failure to comply carries severe penalties including criminal prosecution, substantial fines, and license revocation.

The sanctions list is updated frequently, often within 24 hours of new Council Decisions or Regulations being published in the Official Journal of the European Union. New designations can occur at any time, particularly in response to geopolitical events, making continuous monitoring essential for compliance. The list includes not only individuals and entities but also vessels (ships) subject to port entry restrictions, and designations from multiple regulatory frameworks covering different policy objectives.

Within the Prismatic platform, the EU Sanctions list is a core data source for the compliance screening pipeline, integrated with [OFAC](/osint/ofac/) (US sanctions) to provide dual-jurisdiction coverage essential for entities operating across both EU and US regulatory environments. The combination of EU and US sanctions screening is a minimum requirement for virtually all financial compliance programs.

## Data Sources and Coverage

The EU Consolidated Sanctions List aggregates designations from multiple EU regulatory frameworks and sanctions regimes.

| Data Type | Description | Coverage |
|-----------|-------------|---------|
| **Persons** | Individuals subject to asset freezes and travel bans | All designated individuals |
| **Entities** | Organizations, companies, groups under sanctions | All designated entities |
| **Vessels** | Ships subject to port entry bans or asset freezes | Maritime sanctions |
| **Sanctions Programs** | Regime-specific sanctions packages | 30+ active regimes |
| **Identifiers** | Passport numbers, national IDs, registration numbers | Where available |
| **Aliases** | Known aliases, transliterations, former names | Multiple per entry |
| **Addresses** | Known addresses and locations | Where available |
| **Designating Authority** | EU regulation reference for each listing | All entries |
| **Listing Dates** | Original designation and amendment dates | All entries |
| **Reasons** | Stated reasons for designation | Most entries |

### Major Sanctions Regimes

| Regime | Target | Key Regulations | Designated Entries |
|--------|--------|----------------|-------------------|
| **Russia/Ukraine** | Russian government, oligarchs, entities | EU 269/2014, 833/2014 | 2,000+ |
| **Iran** | Nuclear program related entities | EU 267/2012 | 500+ |
| **DPRK** | North Korean government and entities | EU 329/2007 | 100+ |
| **Syria** | Syrian government and associates | EU 36/2012 | 300+ |
| **Belarus** | Lukashenko regime supporters | EU 765/2006 | 200+ |
| **Terrorism** | Designated terrorist organizations | EU 2580/2001, 881/2002 | 400+ |
| **Libya** | Former regime associates | EU 204/2011 | 100+ |
| **Cyber Attacks** | Actors behind significant cyber attacks | EU 2019/796 | 10+ |
| **Chemical Weapons** | Chemical weapons proliferation actors | EU 2018/1542 | 20+ |

### Data Format and Structure

The consolidated list is published in XML format with a well-defined schema. Each entry contains a unique EU reference ID, the subject type (person, entity, vessel), one or more names with alias types (primary, alias, maiden name), identification documents with types and issuing countries, addresses with structured fields, birth date and place information for individuals, and the specific EU regulations and article references for the designation.

## Technical Architecture

The EU sanctions data is published through the EU Open Data Portal and directly downloadable from the DG FISMA website. The data architecture supports multiple access patterns for different compliance needs.

The XML consolidated list provides the complete structured dataset suitable for bulk download and local database synchronization. The XML schema defines entity types, name structures, identifier formats, and regulation references. Updates are published as complete dataset replacements rather than incremental changes, requiring full-file comparison for change detection.

The EU Sanctions Map provides a web interface for interactive browsing and searching of sanctions data, organized by regime and entity type. While useful for manual research, it is not suitable for programmatic access.

For compliance screening purposes, the standard approach is to download the full XML list, parse it into a local database, and perform name matching against the local copy. This ensures screening performance is not dependent on external API availability and enables sophisticated fuzzy matching algorithms.

The Prismatic adapter implements a local sanctions database synchronized from the EU XML feed, with configurable update frequency (default hourly check, download on change). Name matching uses a multi-algorithm approach combining exact matching, Levenshtein distance, Jaro-Winkler similarity, and phonetic matching (Soundex, Metaphone) to handle transliterations, name variations, and character encoding differences common in sanctions data.

## API Integration

The Prismatic adapter implements comprehensive sanctions screening with fuzzy name matching and multi-regime support.

```elixir
defmodule PrismaticOsint.Adapters.EuSanctions do
  @moduledoc """
  EU Consolidated Sanctions List adapter for compliance screening
  within the Prismatic OSINT pipeline. Implements local database
  with fuzzy name matching for reliable screening.
  """

  @data_url "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content"

  # Search by entity name with fuzzy matching
  def search(name, opts \\ []) do
    threshold = Keyword.get(opts, :fuzzy_threshold, 0.85)

    with {:ok, matches} <- local_fuzzy_search(name, threshold) do
      {:ok, Enum.map(matches, &format_match/1)}
    end
  end

  # Search by person name with fuzzy matching
  def search_person(first_name, last_name, opts \\ []) do
    threshold = Keyword.get(opts, :fuzzy_threshold, 0.85)
    full_name = "#{first_name} #{last_name}"

    with {:ok, matches} <- local_fuzzy_search(full_name, threshold) do
      {:ok, Enum.filter(matches, &(&1.subject_type == :person))}
    end
  end

  # Screen a list of entities (bulk screening)
  def screen_batch(entities) when is_list(entities) do
    results = Enum.map(entities, fn entity ->
      case search(entity.name, fuzzy_threshold: 0.80) do
        {:ok, []} -> {entity, :clear, []}
        {:ok, matches} ->
          max_confidence = Enum.max_by(matches, & &1.confidence)
          status = if max_confidence.confidence >= 0.95, do: :match, else: :review_required
          {entity, status, matches}
      end
    end)

    {:ok, %{
      matches: Enum.filter(results, fn {_, s, _} -> s == :match end),
      clear: Enum.filter(results, fn {_, s, _} -> s == :clear end),
      review_required: Enum.filter(results, fn {_, s, _} -> s == :review_required end)
    }}
  end

  # Get full sanctions list for a specific regime
  def get_regime(regime_name) do
    with {:ok, entries} <- local_filter_by_regime(regime_name) do
      {:ok, entries}
    end
  end

  # Download and sync latest consolidated list
  def sync_list do
    with {:ok, xml} <- download_xml(@data_url),
         {:ok, entries} <- parse_sanctions_xml(xml),
         :ok <- update_local_database(entries) do
      {:ok, %{total_entries: length(entries), synced_at: DateTime.utc_now()}}
    end
  end

  # Check if specific identifiers are sanctioned
  def check_identifier(opts) do
    type = Keyword.fetch!(opts, :type)
    value = Keyword.fetch!(opts, :value)

    with {:ok, matches} <- local_identifier_search(type, value) do
      {:ok, matches}
    end
  end
end
```

### Dual-Jurisdiction Compliance Screening Pipeline

```elixir
defmodule PrismaticCompliance.Screening.SanctionsScreener do
  @moduledoc """
  Automated sanctions screening against EU and US lists.
  Mandatory for KYC/AML compliance in dual-jurisdiction environments.
  """

  alias PrismaticOsint.Adapters.{EuSanctions, Ofac}

  def screen_entity(entity) do
    tasks = [
      Task.async(fn -> EuSanctions.search(entity.name, fuzzy_threshold: 0.80) end),
      Task.async(fn -> Ofac.search(entity.name, fuzzy_threshold: 0.80) end)
    ]

    [eu_results, ofac_results] = Task.await_many(tasks, 15_000)

    {:ok, %{
      entity: entity,
      eu_sanctions: categorize_results(eu_results),
      ofac_sanctions: categorize_results(ofac_results),
      overall_risk: calculate_sanctions_risk(eu_results, ofac_results),
      requires_manual_review: any_potential_matches?(eu_results, ofac_results),
      screening_timestamp: DateTime.utc_now(),
      next_screening_due: DateTime.add(DateTime.utc_now(), 30, :day)
    }}
  end

  defp categorize_results({:ok, results}) do
    %{
      exact_matches: Enum.filter(results, &(&1.confidence >= 0.95)),
      potential_matches: Enum.filter(results, &(&1.confidence >= 0.80 and &1.confidence < 0.95)),
      low_matches: Enum.filter(results, &(&1.confidence < 0.80))
    }
  end

  defp categorize_results(_), do: %{exact_matches: [], potential_matches: [], low_matches: []}
end
```

## Use Cases

### KYC/AML Compliance

EU sanctions screening is a mandatory component of Know Your Customer (KYC) and Anti-Money Laundering (AML) programs for all EU-regulated entities. Key compliance workflows include mandatory screening for financial institutions during customer onboarding and periodic review, customer and beneficial owner verification against the consolidated list, ongoing monitoring of existing business relationships with configurable screening frequency, cross-reference with [OFAC](/osint/ofac/) for comprehensive dual-jurisdiction coverage, and automated alert generation for potential matches requiring enhanced due diligence.

### Supply Chain Due Diligence

EU sanctions regulations extend beyond financial services to all economic activities. Supply chain applications include vendor and supplier sanctions screening before establishing business relationships, [NIS2](/apps/prismatic-compliance/) supply chain security requirements that include sanctions compliance, third-party risk management incorporating sanctions exposure assessment, monitoring supply chain partners for new designations that may affect existing contracts, and assessing geographic risk for supply chains with exposure to sanctioned jurisdictions.

### Corporate Intelligence and Risk Assessment

EU sanctions data provides intelligence for broader corporate risk assessment. Applications include cross-referencing Czech registry data ([ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/)) with sanctions listings, assessing beneficial owner sanctions exposure through [Companies House](/osint/companies-house/) PSC data, geopolitical risk analysis for business operations in sanctioned or near-sanctioned jurisdictions, and monitoring sanctions regime changes for impact on existing business relationships.

### Cryptocurrency Compliance

EU sanctions increasingly include cryptocurrency-related designations, particularly related to the Russian sanctions regime. Screening applications include matching cryptocurrency addresses against EU-designated entities, cross-referencing with [Chainalysis](/osint/chainalysis/) for blockchain-based sanctions matching, monitoring for new crypto-specific designations, and assessing cryptocurrency service providers for sanctions compliance.

## Data Quality and Validation

EU sanctions list data quality is high given its legal authority and the rigorous process for designations. However, several challenges affect screening accuracy.

Name transliteration creates significant matching challenges. Designated individuals from non-Latin script countries may have multiple valid transliterations of their names. The consolidated list often includes multiple aliases, but transliteration variations can still produce false negatives if matching algorithms are too strict.

Identifier availability varies by entry. Some designations include passport numbers, national IDs, and tax numbers that enable high-confidence matching. Others include only names and addresses, requiring fuzzy name matching that produces both false positives and false negatives.

Update frequency is generally rapid (within 24 hours of Official Journal publication) but can vary for complex regulatory packages. The Prismatic adapter checks for updates hourly and triggers immediate re-screening of monitored entities when changes are detected.

De-listings occur when designations are overturned by the EU General Court or when sanctions regimes are amended. The Prismatic adapter tracks de-listings and updates screening results accordingly, preventing false positive alerts for de-listed entities.

## Platform Integration

Within the Prismatic ecosystem, the EU Sanctions list is integrated as a core compliance data source alongside [OFAC](/osint/ofac/) for dual-jurisdiction sanctions screening. The screening pipeline is invoked automatically during entity verification workflows, triggered by both new entity onboarding and periodic review cycles.

The [Prismatic Perimeter](/apps/prismatic-perimeter/) security rating engine incorporates sanctions screening results as a critical factor in entity risk assessment. Any sanctions match (exact or potential) triggers maximum risk classification for the affected entity.

The compliance monitoring system maintains a screening schedule for all monitored entities and triggers re-screening when the sanctions list is updated, ensuring continuous compliance.

## NABLA Compliance

**Signal Plurality**: Sanctions screening always combines EU and US (OFAC) lists at minimum. For high-risk assessments, additional national sanctions lists are included. No sanctions decision is based on a single list.

**Contradiction Preservation**: When an entity appears on one sanctions list but not another, both signals are preserved. Presence on any authoritative sanctions list triggers compliance action regardless of absence from other lists.

**Time Decay**: Sanctions designations are treated as current until explicitly de-listed. There is no confidence decay for active designations. De-listings are tracked with effective dates and applied retroactively to screening records.

**Provenance Mandatory**: All sanctions screening results include the list version (download timestamp), the matching algorithm used, the confidence score, the specific regulation reference for any match, and the screening timestamp.

**Source Independence**: The EU sanctions list is treated as an independent authoritative source from OFAC and national lists. Each list carries independent compliance obligations that cannot be satisfied by screening against other lists alone.

## Performance and Rate Limits

| Aspect | Details |
|--------|---------|
| **Authentication** | None required (public dataset) |
| **Rate Limit** | No official limit for XML download |
| **Data Formats** | XML (primary), CSV, PDF |
| **Update Frequency** | Updated within 24 hours of new EU regulations |
| **Cost** | Free (public EU data) |
| **Local Screening** | Sub-millisecond for exact match, <100ms for fuzzy match |
| **List Size** | ~4,000 entries across all regimes |

The Prismatic adapter maintains a local copy of the sanctions database synchronized hourly from the EU data source. Local screening eliminates external API dependency and enables high-throughput batch screening operations.

## Related Resources

- [OFAC](/osint/ofac/) - US Treasury sanctions (SDN list)
- [ARES](/osint/ares/) - Czech business register for entity identification
- [Justice.cz](/osint/justice-cz/) - Czech Commercial Register for UBO data
- [Companies House](/osint/companies-house/) - UK corporate data for cross-border screening
- [VR.cz](/osint/vr-cz/) - Czech public registers with beneficial owners
- [Chainalysis](/osint/chainalysis/) - Cryptocurrency sanctions screening
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Sanctions compliance in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)