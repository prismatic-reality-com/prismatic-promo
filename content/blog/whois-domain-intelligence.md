+++
title = "WHOIS Domain Intelligence: Registrant Correlation and Historical Analysis"
date = 2026-02-28
description = "Deep dive into WHOIS-based intelligence gathering: registrant correlation across domains, historical lookups, privacy-protected domain handling, domain age scoring, and building a WHOIS parser in Elixir."

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["whois", "domain-intelligence", "osint", "elixir", "registrant-analysis"]
reading_time = "8 min"
keywords = ["whois lookup", "domain intelligence", "registrant correlation", "domain age scoring", "elixir parser"]
image = "/images/blog/whois-domain-intelligence.png"
word_count = 1040
date_created = "2026-02-28"
date_modified = "2026-02-28"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "WHOIS Domain Intelligence - Prismatic Platform"
+++

## WHOIS Data as an Intelligence Foundation

WHOIS records are the birth certificates of the internet. Every domain registration creates a record containing registrant contact information, registration dates, nameservers, and registrar details. For intelligence work, WHOIS data enables registrant correlation (linking seemingly unrelated domains to the same actor), infrastructure mapping, and domain age scoring for risk assessment.

Post-GDPR, many registrars redact personal information behind privacy shields. This does not eliminate WHOIS value — it shifts the focus to structural analysis: nameserver patterns, registrar preferences, creation date clusters, and the distinctive fingerprints that remain even when names and emails are hidden.

## WHOIS Record Parser

Raw WHOIS responses are unstructured text with no universal standard. Each registrar formats records differently. Our parser handles this chaos through pattern matching and a registry of known formats:

```elixir
defmodule Prismatic.OSINT.WHOIS.Parser do
  @moduledoc """
  Parses raw WHOIS response text into structured records.
  Handles format variations across registrars and TLDs.
  """

  @type parsed :: %{
    domain: String.t(),
    registrar: String.t() | nil,
    registrant: map(),
    dates: map(),
    nameservers: list(String.t()),
    status: list(String.t()),
    raw: String.t()
  }

  @field_patterns %{
    registrar: ~r/Registrar:\s*(.+)/i,
    created: ~r/Creat(?:ion|ed)\s*Date:\s*(.+)/i,
    updated: ~r/Updated?\s*Date:\s*(.+)/i,
    expires: ~r/Expir(?:y|ation)\s*Date:\s*(.+)/i,
    nameserver: ~r/Name\s*Server:\s*(.+)/i,
    status: ~r/(?:Domain\s*)?Status:\s*(.+)/i,
    registrant_name: ~r/Registrant\s*(?:Name|Organization):\s*(.+)/i,
    registrant_email: ~r/Registrant\s*(?:Email|Contact Email):\s*(.+)/i,
    registrant_country: ~r/Registrant\s*Country:\s*(.+)/i
  }

  @spec parse(String.t(), String.t()) :: {:ok, parsed()} | {:error, term()}
  def parse(raw_text, domain) do
    fields = Enum.reduce(@field_patterns, %{}, fn {key, pattern}, acc ->
      case Regex.scan(pattern, raw_text) do
        [] -> acc
        matches ->
          values = Enum.map(matches, fn [_, value] -> String.trim(value) end)
          Map.put(acc, key, values)
      end
    end)

    {:ok, %{
      domain: domain,
      registrar: fields |> Map.get(:registrar, []) |> List.first(),
      registrant: build_registrant(fields),
      dates: build_dates(fields),
      nameservers: fields |> Map.get(:nameserver, []) |> Enum.map(&String.downcase/1),
      status: Map.get(fields, :status, []),
      privacy_protected: privacy_detected?(fields, raw_text),
      raw: raw_text
    }}
  end

  defp build_registrant(fields) do
    %{
      name: fields |> Map.get(:registrant_name, []) |> List.first(),
      email: fields |> Map.get(:registrant_email, []) |> List.first(),
      country: fields |> Map.get(:registrant_country, []) |> List.first()
    }
  end

  defp build_dates(fields) do
    %{
      created: fields |> Map.get(:created, []) |> List.first() |> parse_date(),
      updated: fields |> Map.get(:updated, []) |> List.first() |> parse_date(),
      expires: fields |> Map.get(:expires, []) |> List.first() |> parse_date()
    }
  end
end
```

## Registrant Correlation Engine

The real power of WHOIS intelligence emerges when you correlate registrant data across thousands of domains. Even with privacy protection, patterns emerge:

| Correlation Signal | Privacy Resilient? | Strength |
|-------------------|-------------------|----------|
| Registrant email match | No (redacted post-GDPR) | Very High |
| Registrant organization match | Partial (sometimes visible) | High |
| Nameserver cluster | Yes | High |
| Registrar + creation date cluster | Yes | Medium |
| Nameserver + registrar combo | Yes | Medium-High |
| Country + registrar pattern | Yes | Low-Medium |

```elixir
defmodule Prismatic.OSINT.WHOIS.Correlator do
  @moduledoc """
  Correlates WHOIS records across domains to identify
  common registrants, infrastructure patterns, and actor clusters.
  """

  @spec correlate(list(map())) :: list(map())
  def correlate(whois_records) when is_list(whois_records) do
    records = Enum.filter(whois_records, &(&1.domain != nil))

    email_clusters = cluster_by(:registrant_email, records)
    ns_clusters = cluster_by(:nameservers, records)
    registrar_date_clusters = cluster_by_registrar_date(records)

    merge_clusters([email_clusters, ns_clusters, registrar_date_clusters])
    |> Enum.map(&score_cluster/1)
    |> Enum.sort_by(& &1.confidence, :desc)
  end

  defp cluster_by(:registrant_email, records) do
    records
    |> Enum.filter(&(&1.registrant.email != nil))
    |> Enum.reject(&privacy_email?(&1.registrant.email))
    |> Enum.group_by(& &1.registrant.email)
    |> Enum.filter(fn {_email, domains} -> length(domains) > 1 end)
    |> Enum.map(fn {email, domains} ->
      %{type: :email, key: email, domains: Enum.map(domains, & &1.domain),
        confidence: 0.95}
    end)
  end

  defp cluster_by(:nameservers, records) do
    records
    |> Enum.filter(&(&1.nameservers != []))
    |> Enum.group_by(fn r -> Enum.sort(r.nameservers) end)
    |> Enum.filter(fn {_ns, domains} -> length(domains) > 1 end)
    |> Enum.map(fn {ns, domains} ->
      %{type: :nameserver, key: Enum.join(ns, ","),
        domains: Enum.map(domains, & &1.domain),
        confidence: 0.80}
    end)
  end

  defp privacy_email?(email) do
    privacy_indicators = [
      "privacy", "proxy", "whoisguard", "contactprivacy",
      "domainsbyproxy", "withheld", "redacted"
    ]

    downcased = String.downcase(email)
    Enum.any?(privacy_indicators, &String.contains?(downcased, &1))
  end
end
```

## Domain Age Scoring

Domain age is a powerful risk indicator. Freshly registered domains are disproportionately used in phishing, spam, and malware campaigns. Our scoring function applies a non-linear curve that penalizes very young domains while rewarding established ones:

```elixir
defmodule Prismatic.OSINT.WHOIS.AgeScorer do
  @moduledoc """
  Scores domains based on registration age and lifecycle indicators.
  Young domains receive lower trust scores.
  """

  @spec score(map()) :: float()
  def score(%{dates: %{created: nil}}), do: 0.3

  def score(%{dates: %{created: created}}) do
    age_days = Date.diff(Date.utc_today(), created)

    base_score = cond do
      age_days < 1 -> 0.05
      age_days < 7 -> 0.10
      age_days < 30 -> 0.20
      age_days < 90 -> 0.35
      age_days < 365 -> 0.55
      age_days < 730 -> 0.75
      age_days < 1825 -> 0.85
      true -> 0.95
    end

    base_score
  end

  @spec risk_category(float()) :: atom()
  def risk_category(score) when score < 0.2, do: :critical
  def risk_category(score) when score < 0.4, do: :high
  def risk_category(score) when score < 0.6, do: :medium
  def risk_category(score) when score < 0.8, do: :low
  def risk_category(_score), do: :minimal
end
```

| Age Range | Base Score | Risk Category | Typical Use Case |
|-----------|-----------|---------------|------------------|
| < 1 day | 0.05 | Critical | Active phishing campaign |
| 1-7 days | 0.10 | Critical | Fresh spam infrastructure |
| 7-30 days | 0.20 | High | Recently provisioned attack domain |
| 30-90 days | 0.35 | High | Short-lived campaign domain |
| 90 days - 1 year | 0.55 | Medium | Possibly legitimate new business |
| 1-2 years | 0.75 | Low | Established presence |
| 2-5 years | 0.85 | Low | Well-established domain |
| 5+ years | 0.95 | Minimal | Long-standing legitimate domain |

## Historical WHOIS Lookups

Current WHOIS data shows only the present state. Historical WHOIS services reveal past registrant changes, nameserver migrations, and domain lifecycle events. These changes often correlate with ownership transfers, infrastructure compromises, or deliberate obfuscation:

```elixir
@spec historical_lookup(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
def historical_lookup(domain, opts \\ []) do
  provider = Keyword.get(opts, :provider, :whoisxml)

  case fetch_historical(provider, domain) do
    {:ok, records} ->
      parsed =
        records
        |> Enum.map(&parse_historical_record/1)
        |> Enum.sort_by(& &1.date, {:asc, Date})
        |> detect_changes()

      {:ok, parsed}

    {:error, reason} ->
      {:error, reason}
  end
end

defp detect_changes(sorted_records) do
  sorted_records
  |> Enum.chunk_every(2, 1, :discard)
  |> Enum.flat_map(fn [prev, curr] ->
    changes = diff_records(prev, curr)
    if changes != [] do
      [%{date: curr.date, changes: changes, from: prev, to: curr}]
    else
      []
    end
  end)
end
```

## Integration Points

WHOIS intelligence feeds into multiple platform workflows. During due diligence investigations, domain age and registrant data are automatically pulled for every entity's web presence. The correlator runs nightly across all domains discovered in active cases, surfacing hidden connections between seemingly unrelated entities. Phishing detection combines WHOIS age scoring with Certificate Transparency alerts — a newly registered domain appearing in CT logs for a brand name is a high-confidence phishing indicator.
