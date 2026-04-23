+++
title = "UN Sanctions List"
weight = 60
[extra]
category = "sanctions"
type = "sanctions"
module = "UnSanctions"
description = "United Nations Security Council consolidated sanctions list binding on all 193 UN member states"
has_api = true
url = "https://www.un.org/securitycouncil/sanctions"
rate_limit = "No strict limit (public XML dataset)"
capabilities = ["Sanctions Screening", "Entity Search", "Individual Search", "Narrative Summaries", "Regime Filtering", "XML Data Feed", "Alias Search", "Identifier Search"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 698
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Sanctions", "List", "United", "Nations", "Security", "Council", "osint", "Prismatic Platform", "OFAC", "Name"]
tags = ["osint", "sanctions", "un-sanctions-list", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "UN Sanctions List - Prismatic Platform"
+++

## Overview

The United Nations Security Council Consolidated Sanctions List contains all individuals, entities, and vessels subject to sanctions measures imposed by the UN Security Council. Unlike national sanctions programs (such as [OFAC](/osint/ofac/) or [EU Sanctions](/osint/eu-sanctions/)), UN sanctions are binding on all 193 UN member states under Chapter VII of the UN Charter, making this list the most universally applicable sanctions regime in existence.

The list consolidates designations from all active UN sanctions committees, including those targeting terrorism (ISIL/Al-Qaeda), nuclear proliferation (DPRK, Iran), and regional conflicts (Libya, South Sudan, Yemen, Somalia, Central African Republic, Mali, DRC). Each entry includes the designated individual or entity name, aliases, identifying information (dates of birth, passport numbers, national IDs), and a narrative summary explaining the reasons for designation.

For compliance professionals, screening against the UN sanctions list is a fundamental requirement. While [OFAC](/osint/ofac/) and [EU Sanctions](/osint/eu-sanctions/) include their own extensions beyond UN designations, the UN list represents the baseline that all nations are legally required to enforce. The Prismatic platform integrates all three lists into a unified tri-jurisdiction screening pipeline that ensures comprehensive global sanctions compliance.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Individuals** | Name, aliases, date of birth, nationality, passport numbers |
| **Entities** | Organization name, aliases, addresses, registration numbers |
| **Sanctions Committees** | Designating committee and resolution reference |
| **Narrative Summaries** | Reasons for designation and background |
| **Aliases** | Known aliases, former names, transliterations |
| **Identifiers** | Passport, national ID, tax ID numbers |
| **Addresses** | Known addresses and jurisdictions |
| **List Dates** | Date of listing, date of last update |

### UN Sanctions Committees

| Committee | Target | Key Resolutions |
|-----------|--------|----------------|
| **1267/1989/2253** | ISIL and Al-Qaeda | Terrorism asset freeze, travel ban, arms embargo |
| **1718** | DPRK (North Korea) | Nuclear/ballistic missile programs |
| **2231** | Iran | Nuclear program (JCPOA-related) |
| **1970** | Libya | Conflict parties, arms embargo |
| **2206** | South Sudan | Conflict parties |
| **2140** | Yemen | Houthi leadership, conflict parties |
| **751** | Somalia/Eritrea | Al-Shabaab, arms embargo |
| **2127** | Central African Republic | Armed groups |

## Integration with Prismatic

The UN Sanctions List integrates with the Prismatic platform's tri-jurisdiction [sanctions screening](/glossary/sanctions-screening/) pipeline, complementing [OFAC](/osint/ofac/) and [EU Sanctions](/osint/eu-sanctions/) for comprehensive global coverage.

```elixir
# Search by name
{:ok, results} = UnSanctions.search("Osama", fuzzy_threshold: 0.85)
# => %{
#   matches: [
#     %{reference_number: "QDi.004",
#       name: "USAMA MUHAMMAD AWAD BIN LADEN",
#       type: :individual,
#       committee: "1267/1989/2253",
#       listed_on: ~D[2001-10-08],
#       nationality: "Saudi Arabia",
#       aliases: ["Osama bin Laden", "The Prince", "The Emir"],
#       date_of_birth: ~D[1957-03-10],
#       narrative: "Founder and leader of Al-Qaeda...",
#       identifiers: []}
#   ]
# }

# Search by identifier
{:ok, results} = UnSanctions.search_identifier(type: :passport, value: "AB123456")

# Get full list by committee
{:ok, committee_list} = UnSanctions.get_committee("1718")  # DPRK

# Download consolidated XML
{:ok, full_list} = UnSanctions.download_consolidated(format: :xml)

# Screen entity against all committees
{:ok, screening} = UnSanctions.screen(entity_name: "Target Entity",
  fuzzy_threshold: 0.80,
  committees: :all
)

# Check for recent additions
{:ok, recent} = UnSanctions.recent_changes(since: ~D[2025-01-01])
```

### Tri-Jurisdiction Compliance Pipeline

```elixir
defmodule PrismaticCompliance.Screening.TriJurisdictionScreener do
  @moduledoc """
  Comprehensive sanctions screening against UN, US (OFAC), and EU
  sanctions lists for maximum compliance coverage.
  """

  def comprehensive_screen(entity) do
    tasks = [
      Task.async(fn -> UnSanctions.search(entity.name, fuzzy_threshold: 0.80) end),
      Task.async(fn -> Ofac.search(entity.name, fuzzy_threshold: 0.80) end),
      Task.async(fn -> EuSanctions.search(entity.name, fuzzy_threshold: 0.80) end)
    ]

    [un, ofac, eu] = Task.await_many(tasks, 20_000)

    all_matches = collect_all_matches(un, ofac, eu)

    {:ok, %{
      entity: entity,
      screening_result: if(Enum.empty?(all_matches), do: :clear, else: :hit),
      un_sanctions: extract_ok(un),
      ofac_sanctions: extract_ok(ofac),
      eu_sanctions: extract_ok(eu),
      jurisdictions_hit: count_jurisdictions(un, ofac, eu),
      total_matches: length(all_matches),
      highest_confidence: highest_confidence(all_matches),
      action_required: determine_action(all_matches),
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

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | None required (public dataset) |
| **Rate Limit** | No strict limit (responsible use expected) |
| **Data Formats** | XML (primary), HTML (web search) |
| **Update Frequency** | Updated after each committee decision |
| **Cost** | Free (UN public data) |

### Data Access Methods
- **XML Download**: Full consolidated list in structured XML
- **Web Search**: Online search tool at scsanctions.un.org
- **Notifications**: Email notifications for list changes
- **API**: No official [REST API](/glossary/rest-api/); XML parsing required

## Use Cases

### Global Sanctions Compliance
- Baseline sanctions screening required by all 193 UN member states
- Complement [OFAC](/osint/ofac/) and [EU Sanctions](/osint/eu-sanctions/) for full coverage
- Mandatory for international financial institutions and trade operations

### Counter-Terrorism Screening
- Screen individuals and entities against the 1267/1989/2253 terrorism list
- Cross-reference with [OFAC SDGT](/osint/ofac/) for comprehensive terrorism screening
- Monitor for new designations and de-listings

### Corporate Due Diligence
- Screen business partners, suppliers, and customers against the UN list
- Cross-reference with Czech registries ([ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/))
- Assess country-level sanctions risk for business operations

## Related Sources

- [OFAC](/osint/ofac/) - US Treasury sanctions (extends beyond UN designations)
- [EU Sanctions](/osint/eu-sanctions/) - European Union sanctions (implements UN + EU-specific)
- [ARES](/osint/ares/) - Czech business register for entity identification
- [Justice.cz](/osint/justice-cz/) - Czech Commercial Register for UBO verification
- [Chainalysis](/osint/chainalysis/) - Cryptocurrency sanctions screening

## Fuzzy Name Matching

Sanctions screening requires sophisticated name matching algorithms because designated individuals and entities use aliases, transliterations, and name variations. The Prismatic screening pipeline implements multiple matching strategies:

| Algorithm | Description | Use Case |
|-----------|-------------|----------|
| **Exact Match** | Character-for-character comparison | Primary screening |
| **Levenshtein Distance** | Edit distance between strings | Typo tolerance |
| **Jaro-Winkler** | Weighted prefix similarity | Name transposition handling |
| **Soundex/Metaphone** | Phonetic similarity | Cross-language transliteration |
| **Token Set Ratio** | Unordered word matching | Name reordering tolerance |
| **Alias Expansion** | Search across all known aliases | Multi-identity matching |

The combination of these algorithms with configurable confidence thresholds ensures that legitimate matches are not missed while minimizing false positives that would overwhelm compliance teams.

### Screening Decision Framework

| Match Confidence | Decision | Action Required |
|-----------------|----------|----------------|
| **95-100%** | Confirmed Match | Block transaction, file SAR |
| **80-94%** | Probable Match | Manual review within 24 hours |
| **60-79%** | Possible Match | Enhanced due diligence |
| **Below 60%** | Unlikely Match | Document and clear |

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Sanctions in security and compliance ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)