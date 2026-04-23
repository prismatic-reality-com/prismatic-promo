+++
title = "Datove Schranky"
weight = 29
[extra]
category = "czech"
type = "company"
module = "DatoveSchranky"
description = "Czech Data Box Register (ISDS) - official electronic communication system for legal entities and public administration"
has_api = true
url = "https://www.mojedatovaschranka.cz"
rate_limit = "Public search available, ISDS API for authorized access"
capabilities = ["Data Box Search", "Entity Verification", "Box Status Check", "Organization Type Lookup", "Activity Verification", "Address Correlation"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1525
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Datove", "Schranky", "Czech", "Data", "Register", "ISDS", "osint", "Prismatic Platform", "ARES", "Data Box"]
tags = ["osint", "czech", "datove-schranky", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Datove Schranky - Prismatic Platform"
+++

## Overview

Datove Schranky (Data Boxes, formally ISDS - Informacni system datovych schranek) is the Czech Republic's mandatory electronic communication system established by Act No. 300/2008 Coll. Every legal entity registered in the Czech Republic is required to have a data box, and all official communication with public authorities must flow through this system. Since 2009, data boxes have replaced registered mail for official communications between legal entities and the state, making this register a uniquely reliable indicator of entity existence, activity, and legitimacy.

For [OSINT](/glossary/osint/) purposes, the data box register provides an independent verification [channel](/glossary/channel/) that is difficult to manipulate. If a legal entity claims to exist and operate in the Czech Republic, it must have an active data box. The register reveals entity type classification (legal entity, public authority, natural person in business), registered address, and box status (active, inactive, made inaccessible). The absence of a data box for a claimed legal entity is an immediate red flag indicating either that the entity does not exist, has been dissolved, or is operating irregularly.

The data box system is deeply integrated into Czech administrative processes. Court documents, tax notifications, social security communications, and licensing decisions are all delivered through data boxes. A message delivered to a data box is considered legally received after 10 days regardless of whether the recipient actually opens it. This legal significance means that data box status directly impacts an entity's ability to receive and respond to official communications, making it a proxy indicator for operational capacity.

Within the Prismatic platform, the Data Box Register provides an independent entity existence verification layer that complements [ARES](/osint/ares/) registration data and [Justice.cz](/osint/justice-cz/) commercial register information. The independence of the data box system from company registration processes makes it particularly valuable for detecting anomalies such as entities registered in the commercial register but without active data boxes, or vice versa.

## Data Sources and Coverage

The Data Box Register maintains records for all mandatory and voluntary data box holders in the Czech Republic, covering over 1 million entities.

| Data Type | Description | Coverage |
|-----------|-------------|---------|
| **Data Box ID** | Unique 7-character alphanumeric identifier | All registered boxes |
| **Entity Name** | Official name as registered in the system | Verified against registries |
| **ICO** | Company identification number (for legal entities) | All legal entities |
| **Entity Type** | Legal entity, public authority, natural person (business) | Classified |
| **Address** | Registered address as declared | Self-declared |
| **Box Status** | Active, inactive, made inaccessible | Current status |
| **Activity Type** | Business, public authority, profession | Categorized |
| **Accessibility** | Whether box accepts commercial messages | Configurable |
| **Creation Date** | Date the data box was created | Since 2009 |

### Data Box Types

| Type | Czech | Mandatory | Typical Entities | Count |
|------|-------|-----------|-----------------|-------|
| **OVM** | Organ verejne moci | Yes | Government bodies, municipalities, courts | ~30,000 |
| **PO** | Pravnicka osoba | Yes | Companies (s.r.o., a.s.), associations | ~700,000 |
| **PFO** | Podnikajici fyzicka osoba | Conditional | Self-employed, lawyers, notaries | ~200,000 |
| **FO** | Fyzicka osoba | No | Natural persons (voluntary) | ~100,000 |

### Verification Value

The data box register provides unique verification value because registration is legally mandatory, creating a strong expectation of presence. Box status reflects current operational capacity, as inactive boxes indicate potential dissolution or administrative problems. The register is maintained independently from company registries, providing a second verification dimension. Address data can be cross-referenced with registry addresses for consistency checking. Box type classification provides entity category verification independent of other sources.

## Technical Architecture

The Data Box system operates on a dual-access architecture. The public search interface allows anyone to look up data box information by entity name, ICO, or data box ID. The full ISDS API provides authenticated access for sending and receiving messages, managing box settings, and performing bulk lookups.

The public search interface is web-based and returns structured HTML results. The Prismatic adapter parses these results to extract entity name, ICO, data box ID, type, status, and address information. Search is supported by name, ICO, and data box ID, with fuzzy matching for name queries.

The ISDS API is a SOAP-based web service that requires client certificate authentication. Access is restricted to authorized entities (data box holders, system integrators). The API supports structured entity search, box status queries, and address verification. For the Prismatic platform, the public search interface provides sufficient data for entity verification purposes without requiring ISDS API credentials.

Data freshness is high, as box status changes (activation, deactivation, inaccessibility) are reflected in the public register within 24 hours. Entity name and address changes are updated as filings are processed.

## API Integration

The Prismatic adapter implements data box verification through the public search interface with structured HTML parsing.

```elixir
defmodule PrismaticOsint.Adapters.DatoveSchranky do
  @moduledoc """
  Czech Data Box Register adapter for entity verification
  within the Prismatic OSINT pipeline.
  """

  @base_url "https://www.mojedatovaschranka.cz"

  # Search data box by entity name
  def search(query, opts \\ []) do
    type = Keyword.get(opts, :type)
    params = build_search_params(query, type)

    with {:ok, html} <- fetch_search_results(params) do
      {:ok, parse_search_results(html)}
    end
  end

  # Lookup by ICO
  def by_ico(ico) do
    with {:ok, results} <- search(ico) do
      case Enum.find(results, &(&1.ico == ico)) do
        nil -> {:error, :not_found}
        box -> {:ok, box}
      end
    end
  end

  # Check box status
  def status(box_id) do
    with {:ok, html} <- fetch_box_detail(box_id) do
      {:ok, parse_box_status(html)}
    end
  end

  # Verify entity existence through data box
  def verify_entity(ico) do
    with {:ok, box} <- by_ico(ico) do
      {:ok, %{
        exists: true,
        active: box.status == :active,
        data_box_id: box.data_box_id,
        type: box.type,
        name: box.name,
        address: box.address,
        verified_at: DateTime.utc_now()
      }}
    else
      {:error, :not_found} ->
        {:ok, %{
          exists: false,
          active: false,
          data_box_id: nil,
          type: nil,
          verified_at: DateTime.utc_now()
        }}
    end
  end

  # Search public authority data boxes
  def search_authorities(query) do
    search(query, type: :ovm)
  end

  # Batch verification
  def batch_verify(icos) when is_list(icos) do
    tasks = Enum.map(icos, fn ico ->
      Task.async(fn -> {ico, verify_entity(ico)} end)
    end)

    results = Task.await_many(tasks, 30_000)
    {:ok, Enum.into(results, %{})}
  end
end
```

### Entity Existence Verification Pipeline

```elixir
defmodule PrismaticPerimeter.Verification.EntityExistence do
  @moduledoc """
  Multi-source entity existence verification combining data box,
  ARES, commercial register, and trade license data for maximum
  confidence entity validation.
  """

  alias PrismaticOsint.Adapters.{DatoveSchranky, Ares, JusticeCz, Rzp}

  def verify_entity(ico) do
    tasks = [
      Task.async(fn -> DatoveSchranky.verify_entity(ico) end),
      Task.async(fn -> Ares.get_by_ico(ico) end),
      Task.async(fn -> JusticeCz.get_company(ico) end),
      Task.async(fn -> Rzp.get_licenses(ico) end)
    ]

    [ds, ares, justice, rzp] = Task.await_many(tasks, 15_000)

    {:ok, %{
      ico: ico,
      data_box_active: match?({:ok, %{active: true}}, ds),
      ares_registered: match?({:ok, _}, ares),
      commercial_register: match?({:ok, _}, justice),
      trade_licenses: match?({:ok, _}, rzp),
      confidence: calculate_confidence(ds, ares, justice, rzp),
      anomalies: detect_anomalies(ds, ares, justice, rzp),
      verified_at: DateTime.utc_now()
    }}
  end

  defp calculate_confidence(ds, ares, justice, rzp) do
    sources_confirming =
      [ds, ares, justice, rzp]
      |> Enum.count(&match?({:ok, _}, &1))

    sources_confirming / 4.0
  end

  defp detect_anomalies(ds, ares, justice, rzp) do
    anomalies = []

    anomalies =
      if match?({:ok, _}, ares) and not match?({:ok, %{active: true}}, ds) do
        ["ARES registered but no active data box" | anomalies]
      else
        anomalies
      end

    anomalies =
      if match?({:ok, %{active: true}}, ds) and not match?({:ok, _}, ares) do
        ["Active data box but not found in ARES" | anomalies]
      else
        anomalies
      end

    anomalies
  end
end
```

## Use Cases

### Entity Verification and Existence Confirmation

The Data Box Register provides an independent confirmation channel for Czech entity existence. Key applications include independent confirmation of legal entity existence beyond company registry data, cross-verification of company data from [ARES](/osint/ares/) and [Justice.cz](/osint/justice-cz/) for consistency, detecting shell companies that are registered but have no active data box indicating operational inactivity, verifying address consistency across the data box register and company registries, and identifying entities that have been administratively dissolved through data box deactivation.

### Anomaly Detection for Due Diligence

Anomalies between the data box register and other Czech registries provide powerful intelligence signals. An entity present in ARES but without an active data box may indicate recent dissolution, administrative problems, or a defunct entity with a stale registry record. An entity with an active data box not found in ARES may indicate a foreign entity with Czech operations, a recently registered entity with processing lag, or data inconsistency requiring investigation. An entity with an inaccessible data box may indicate intentional communication avoidance, which is a significant due diligence red flag.

### Communication Intelligence

The data box register reveals official communication capabilities of entities. Analysts can determine the official communication channel for legal entities before initiating contact, verify government body data box IDs before submitting official communications, track entity status changes through data box activation and deactivation events, and identify entities that have opted out of commercial message receipt.

### Government Contractor Verification

For public procurement due diligence, the data box register verifies that potential government contractors have active data boxes required for official communication with contracting authorities. The absence of an active data box would prevent a contractor from receiving tender notifications and contract documentation, making it a practical indicator of contracting capacity.

## Data Quality and Validation

Data box register data quality is high for entity existence verification due to the legal mandate for registration. The 7-character alphanumeric data box ID serves as a stable entity identifier that does not change during the entity's lifetime, making it suitable for tracking across time.

Entity names in the data box register may differ slightly from company registry names due to character encoding, abbreviation conventions, or historical name changes. The Prismatic adapter implements fuzzy matching to handle name variations when cross-referencing with other Czech registries.

Address data is self-declared by the entity and may not always match the registered office address in the commercial register. Address discrepancies are flagged as anomalies rather than treated as errors, as entities may legitimately use different addresses for different registrations.

Box status transitions provide temporal intelligence. A box transitioning from active to inactive typically indicates entity dissolution or administrative deactivation, while a transition from active to inaccessible may indicate deliberate communication avoidance.

## Platform Integration

Within the Prismatic ecosystem, the Data Box Register provides an independent entity verification layer integrated into the multi-source entity existence verification pipeline. Verification results from the data box register are combined with [ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/), and [RZP](/osint/rzp/) data to produce a confidence-weighted entity existence score.

Anomaly detection across data sources feeds into the [Prismatic Perimeter](/apps/prismatic-perimeter/) risk assessment, where registry inconsistencies contribute negatively to entity security ratings.

## NABLA Compliance

**Signal Plurality**: Data box verification is always combined with at least two other Czech registry sources. No entity verification decision relies on data box data alone.

**Contradiction Preservation**: When data box status contradicts ARES registration (for example, active registration but inactive data box), both signals are preserved and the contradiction is explicitly flagged for analyst review.

**Time Decay**: Data box status is treated as current (refreshed within 24 hours). Historical status transitions are tracked and time-stamped for temporal analysis.

**Provenance Mandatory**: All data box data includes the query method (name, ICO, box ID), query timestamp, and source URL.

**Absence Informative**: The absence of a data box for a claimed Czech legal entity is treated as a strong negative signal, given the legal mandate for registration. This absence triggers automatic escalation in the verification pipeline.

## Performance and Rate Limits

| Aspect | Details |
|--------|---------|
| **Authentication** | Public search free; ISDS API requires certificate |
| **Rate Limit** | No official limit for public search; respectful use expected |
| **Data Format** | HTML (web search), XML/SOAP (ISDS API) |
| **Cost** | Public search free; ISDS integration requires authorized setup |
| **Coverage** | All mandatory data box holders (1M+ entities) |
| **Response Time** | 1-3 seconds for public search queries |

The Prismatic adapter caches entity verification results with 7-day TTL and batch verification results with 24-hour TTL. Anomaly detection results are cached for 30 days unless a re-verification is triggered by changes detected in other registries.

## Related Resources

- [ARES](/osint/ares/) - Primary entity identification register
- [Justice.cz](/osint/justice-cz/) - Commercial register cross-reference
- [RZP](/osint/rzp/) - Trade license verification
- [VR.cz](/osint/vr-cz/) - Unified public register portal
- [RES](/osint/res/) - Register of Economic Subjects
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Entity verification in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)