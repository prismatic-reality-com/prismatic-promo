+++
title = "OFAC SDN List"
weight = 31
[extra]
category = "sanctions"
type = "sanctions"
module = "Ofac"
description = "US Treasury OFAC Specially Designated Nationals and Blocked Persons List"
has_api = true
url = "https://sanctionssearch.ofac.treas.gov"
rate_limit = "No official limit"
capabilities = ["SDN Search", "Entity Screening", "Fuzzy Name Matching", "Program Lookup", "Consolidated Screening", "Vessel Search", "Address Search"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1285
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OFAC", "SDN", "List", "Treasury", "Specially", "Designated", "Nationals", "Blocked", "osint", "sanctions"]
tags = ["osint", "sanctions", "ofac-sdn-list", "prismatic"]
quality_score = 77
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "OFAC SDN List - Prismatic Platform"
+++

## Overview

The Office of Foreign Assets Control (OFAC) of the US Department of Treasury administers and enforces economic and trade sanctions programs against targeted foreign countries, regimes, terrorists, international narcotics traffickers, and entities engaged in activities related to the proliferation of weapons of mass destruction. The Specially Designated Nationals and Blocked Persons List (SDN List) identifies individuals, companies, and entities whose assets are blocked and with whom US persons are generally prohibited from dealing.

OFAC sanctions have extraterritorial reach: any transaction touching the US financial system, involving US-origin goods or technology, or conducted by US persons is subject to OFAC compliance. This extraterritorial jurisdiction makes the SDN list relevant for organizations worldwide, not just those based in the United States. European companies with US dollar transactions, US-manufactured components in their supply chains, or US person employees must all comply with OFAC regulations, making the SDN list a cornerstone of global sanctions compliance programs.

For [OSINT](@/glossary/osint.md) investigators and compliance professionals, the SDN list provides authoritative sanctions designation data with rich identifying information including aliases, identity documents, addresses, vessel details, and cryptocurrency wallet addresses. The breadth of identifying data enables precise screening that goes beyond simple name matching, reducing false positives while maintaining comprehensive detection of sanctioned parties.

## Data Sources and Coverage

OFAC maintains multiple sanctions lists, with the SDN list being the most comprehensive and widely screened. The data is derived from executive orders, statutory authorities, and international sanctions obligations. OFAC also contributes to the US Government's Consolidated Screening List (CSL), which aggregates sanctions and export control lists from multiple agencies.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **SDN Entries** | Individuals, entities, and vessels designated by OFAC | 12,000+ entries |
| **Programs** | Sanctions programs (SDGT, UKRAINE-EO, IRAN, etc.) | 30+ programs |
| **Aliases** | Known aliases, alternate names, transliterations | Multiple per entry |
| **Identifiers** | Passport, tax ID, registration numbers, SWIFT codes | Comprehensive |
| **Addresses** | Known addresses and jurisdictions | Global coverage |
| **Vessels** | Ship names, IMO numbers, flags, tonnage | Maritime sanctions |
| **Aircraft** | Tail numbers, serial numbers, operators | Aviation sanctions |
| **Digital Currency** | Cryptocurrency wallet addresses | Growing coverage |

### Major Sanctions Programs

| Program | Code | Target |
|---------|------|--------|
| **Global Terrorism** | SDGT | Designated terrorist organizations |
| **Ukraine/Russia** | UKRAINE-EO13661/13662/13685 | Russian government, oligarchs |
| **Iran** | IRAN/IFSR/IRGC | Iranian government, IRGC |
| **North Korea** | DPRK | North Korean entities |
| **Narcotics** | SDNTK | Drug trafficking organizations |
| **Cyber** | CYBER2 | Malicious cyber actors |
| **Global Magnitsky** | GLOMAG | Human rights abusers |

### Consolidated Screening List (CSL)

OFAC also contributes to the US Government's Consolidated Screening List, which aggregates screening lists from multiple federal agencies including OFAC SDN, OFAC Sectoral Sanctions (SSI), BIS Entity List, BIS Denied Persons, BIS Unverified List, and State Department lists. The CSL provides a single API endpoint for comprehensive US government screening.

## Technical Architecture

The Prismatic Platform integrates OFAC through a dual-path architecture: direct SDN list ingestion for comprehensive offline screening and CSL API queries for real-time screening operations. The SDN list is downloaded in XML format and parsed into a local screening database optimized for fuzzy name matching. The CSL API at `api.trade.gov/consolidated_screening_list` provides real-time query capability for interactive screening workflows.

The fuzzy matching engine implements a multi-algorithm approach combining Levenshtein distance, Jaro-Winkler similarity, and phonetic matching (Soundex/Metaphone) to handle transliteration variations, misspellings, and alias patterns common in sanctions screening. Configurable threshold parameters allow operators to balance sensitivity against false positive rates based on their risk appetite and regulatory requirements.

The local screening database is updated automatically when OFAC publishes new designations, typically within hours of publication. A change detection mechanism identifies additions, modifications, and removals from previous list versions, generating alerts for compliance teams when monitored entities appear on new designations.

Batch screening operations process entity lists in parallel using configurable worker pools, enabling screening of thousands of entities per minute against the full SDN list. Results include match confidence scores, matching algorithms triggered, and specific SDN entry details for analyst review.

## API Integration

OFAC screening is integrated into the Prismatic compliance pipeline alongside [EU Sanctions](@/osint/eu-sanctions.md), providing comprehensive dual-jurisdiction sanctions coverage.

```elixir
# Search SDN list by name
{:ok, results} = Ofac.search("Rosneft", fuzzy_threshold: 0.85)
# => [
#   %{
#     sdn_id: "12345",
#     name: "ROSNEFT OIL COMPANY",
#     type: :entity,
#     program: "UKRAINE-EO13662",
#     country: "Russia",
#     listed_on: ~D[2014-07-16],
#     remarks: "Executive Order 13662 Directive 2",
#     identifiers: [
#       %{type: :registration_number, value: "1027700043502"},
#       %{type: :swift_bic, value: "ROSNRUMM"}
#     ],
#     addresses: [%{city: "Moscow", country: "Russia"}]
#   }
# ]

# Search by identifier (passport, tax ID, etc.)
{:ok, results} = Ofac.search_identifier(type: :passport, value: "AB123456")

# Full consolidated screening list search
{:ok, results} = Ofac.search_consolidated("Entity Name",
  lists: [:sdn, :ssi, :bis_entity],
  fuzzy_threshold: 0.80
)

# Screen multiple entities in batch
{:ok, screening} = Ofac.screen_batch([
  %{name: "Company A", country: "RU"},
  %{name: "Person B", type: :individual},
  %{name: "Company C", country: "US"}
])

# Download latest SDN list
{:ok, sdn_list} = Ofac.download_sdn(format: :xml)

# Search by program
{:ok, program_entries} = Ofac.get_program("UKRAINE-EO13662")

# Check cryptocurrency addresses
{:ok, check} = Ofac.check_crypto_address("bc1q...")
```

### Dual-Jurisdiction Screening Pipeline

```elixir
defmodule PrismaticCompliance.Screening.DualJurisdictionScreener do
  @moduledoc """
  Comprehensive sanctions screening against both EU and US sanctions lists.
  Required for entities with transatlantic business relationships.
  """

  def comprehensive_screen(entity) do
    tasks = [
      Task.async(fn -> Ofac.search(entity.name, fuzzy_threshold: 0.80) end),
      Task.async(fn -> Ofac.search_consolidated(entity.name, lists: [:ssi, :bis_entity]) end),
      Task.async(fn -> EuSanctions.search(entity.name, fuzzy_threshold: 0.80) end)
    ]

    [sdn, consolidated, eu] = Task.await_many(tasks, 20_000)

    matches = collect_all_matches(sdn, consolidated, eu)

    {:ok, %{
      entity: entity,
      screening_result: if(Enum.empty?(matches), do: :clear, else: :hit),
      ofac_sdn: extract_ok(sdn),
      ofac_consolidated: extract_ok(consolidated),
      eu_sanctions: extract_ok(eu),
      total_matches: length(matches),
      highest_confidence: highest_confidence(matches),
      action_required: determine_action(matches),
      screening_id: generate_screening_id(),
      timestamp: DateTime.utc_now()
    }}
  end

  defp determine_action(matches) do
    cond do
      Enum.any?(matches, &(&1.confidence >= 0.95)) -> :block_and_report
      Enum.any?(matches, &(&1.confidence >= 0.80)) -> :manual_review
      Enum.any?(matches, &(&1.confidence >= 0.60)) -> :enhanced_due_diligence
      true -> :clear
    end
  end
end
```

## Use Cases

### KYC/AML Compliance
- Customer and counterparty screening mandatory for US-connected transactions
- Ongoing monitoring with periodic rescreening at configurable intervals
- Combined with [EU Sanctions](@/osint/eu-sanctions.md) and [UN Sanctions](@/osint/un-sanctions.md) for comprehensive tri-jurisdiction coverage
- Audit trail generation for regulatory examination readiness

### Transaction Monitoring
- Real-time payment screening against SDN list for wire transfer compliance
- Cryptocurrency transaction compliance using OFAC-listed wallet addresses
- Trade finance document screening for sanctioned parties, vessels, and ports of origin
- Correspondent banking compliance for international payment routing

### Corporate Due Diligence
- M&A target sanctions exposure assessment including subsidiaries and beneficial owners
- Board member and UBO screening against all OFAC programs
- Cross-reference with [Czech registries](@/osint/ares.md) for CEE operations involving US-connected entities
- Supply chain compliance for [NIS2](@/apps/prismatic-compliance.md) requirements and US export controls

### Maritime and Aviation Compliance
- Vessel screening using IMO numbers, vessel names, and flag state data
- Aircraft screening using tail numbers and operator identification
- Port call analysis for sanctions evasion detection through deceptive shipping practices

## Data Quality

OFAC data quality benefits from its status as a US government authoritative source with legal enforcement backing. Designations are based on classified and unclassified intelligence, diplomatic reports, and law enforcement investigations, providing high confidence in the accuracy of entries.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Authority** | Excellent -- US Treasury official sanctions | Legal enforcement backing |
| **Identifying Data** | Very high -- multiple identifiers per entry | Aliases, documents, addresses |
| **Currency** | High -- updated as new designations are published | Near real-time updates |
| **Completeness** | High for US sanctions; partial for non-US designations | US-centric scope |
| **Fuzzy Matching Support** | Excellent -- aliases and transliterations included | Multiple name formats |
| **Cryptocurrency Coverage** | Growing -- wallet addresses increasingly included | Expanding digital asset coverage |

### Data Access Methods

| Method | Details |
|--------|---------|
| **Direct Download** | XML/CSV from OFAC website |
| **Sanctions Search Tool** | Web-based search at sanctionssearch.ofac.treas.gov |
| **CSL API** | RESTful API from trade.gov |
| **OFAC SDN Advanced** | Structured XML with full metadata |
| **Authentication** | None required (public dataset) |
| **Cost** | Free (US Government public data) |

## Platform Integration

Within the Prismatic Platform, OFAC screening is a core component of the compliance pipeline. The adapter integrates with the broader sanctions screening framework that includes EU Sanctions and UN Sanctions, providing unified tri-jurisdiction screening through a single API call.

OFAC screening results feed into the Prismatic Perimeter security rating through the compliance component, where sanctions exposure -- including both direct matches and close associations -- affects the overall entity risk score. The screening pipeline supports both automated pass/fail decisions for clear matches and manual review workflows for borderline cases.

## NABLA Compliance

OFAC integration satisfies NABLA epistemic requirements through its authoritative provenance and comprehensive identifying data. The Provenance Mandatory axiom is met through SDN entry references that link each designation to its authorizing executive order or statutory authority. Signal Plurality is enforced by cross-referencing OFAC matches with EU Sanctions and UN Sanctions data, requiring multi-jurisdiction confirmation for automated blocking decisions.

The Unknown Valid axiom is particularly important in sanctions screening, where the absence of a match does not guarantee that an entity is not sanctioned under other jurisdictions or that a match below the fuzzy threshold does not represent a true positive. The platform explicitly acknowledges these epistemic limitations in screening results.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Single name search (local)** | < 50ms | 10-30ms |
| **Fuzzy name search (local)** | < 200ms | 50-150ms |
| **CSL API query** | < 1s | 300-700ms |
| **Batch screening (1,000 entities)** | < 60s | 20-40s |
| **SDN list ingestion** | < 120s | 40-80s |
| **Change detection cycle** | < 30s | 5-15s |

The local screening database with pre-computed fuzzy matching indices enables sub-second screening operations suitable for real-time transaction monitoring. Batch operations leverage parallel processing with configurable worker pools.

## Related Resources

- [EU Sanctions](@/osint/eu-sanctions.md) - European Union sanctions list
- [UN Sanctions](@/osint/un-sanctions.md) - United Nations Security Council sanctions
- [ARES](@/osint/ares.md) - Czech business register for entity identification
- [Justice.cz](@/osint/justice-cz.md) - Czech Commercial Register for UBO verification
- [VR.cz](@/osint/vr-cz.md) - Czech public registers with beneficial ownership
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Sanctions in compliance ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)