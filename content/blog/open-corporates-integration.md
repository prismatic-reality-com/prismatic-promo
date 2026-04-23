+++
title = "OpenCorporates Integration: Global Company Intelligence in Elixir"
date = 2026-03-03
description = "Integrating OpenCorporates API for global company search, jurisdiction mapping, officer lookups, filing analysis, and normalizing corporate data across 140+ jurisdictions in Elixir."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["opencorporates", "company-data", "elixir", "due-diligence", "osint"]
reading_time = "8 min"
keywords = ["opencorporates api", "company search", "officer lookup", "corporate intelligence", "jurisdiction mapping"]
image = "/images/blog/open-corporates-integration.png"
word_count = 1050
date_created = "2026-03-03"
date_modified = "2026-03-03"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "OpenCorporates Integration - Prismatic Platform"
+++

## Corporate Data at Scale

OpenCorporates is the largest open database of company information in the world, covering over 200 million companies across 140+ jurisdictions. For due diligence and intelligence work, it provides a single API to query company registrations, officer appointments, filing histories, and corporate relationships that would otherwise require navigating dozens of national registries with different formats, languages, and access methods.

Building an effective OpenCorporates adapter means handling jurisdiction-specific quirks, normalizing wildly different corporate structures into a common model, and orchestrating multi-step lookups that chain company search with officer discovery and filing retrieval.

## Company Search Adapter

The adapter wraps OpenCorporates' REST API with structured query building, pagination handling, and response normalization:

```elixir
defmodule Prismatic.OSINT.Adapters.OpenCorporates do
  @moduledoc """
  OpenCorporates API adapter for global company intelligence.
  Supports company search, officer lookup, and filing retrieval
  across 140+ jurisdictions.
  """

  @behaviour Prismatic.OSINT.Adapter

  require Logger

  @base_url "https://api.opencorporates.com/v0.4"

  @spec search_companies(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  def search_companies(query, opts \\ []) do
    params =
      [q: query, per_page: Keyword.get(opts, :per_page, 30)]
      |> maybe_add(:jurisdiction_code, Keyword.get(opts, :jurisdiction))
      |> maybe_add(:company_type, Keyword.get(opts, :company_type))
      |> maybe_add(:current_status, Keyword.get(opts, :status))
      |> add_api_token()

    case Req.get("#{@base_url}/companies/search", params: params) do
      {:ok, %{status: 200, body: %{"results" => %{"companies" => companies}}}} ->
        normalized = Enum.map(companies, fn %{"company" => c} -> normalize_company(c) end)
        {:ok, normalized}

      {:ok, %{status: 401}} ->
        {:error, :unauthorized}

      {:ok, %{status: 429}} ->
        {:error, :rate_limited}

      {:ok, %{status: status, body: body}} ->
        {:error, {:unexpected_response, status, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec get_company(String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def get_company(jurisdiction, company_number) do
    url = "#{@base_url}/companies/#{jurisdiction}/#{company_number}"
    params = add_api_token([])

    case Req.get(url, params: params) do
      {:ok, %{status: 200, body: %{"results" => %{"company" => company}}}} ->
        {:ok, normalize_company_full(company)}

      {:ok, %{status: 404}} ->
        {:error, :not_found}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp normalize_company(raw) do
    %{
      name: raw["name"],
      company_number: raw["company_number"],
      jurisdiction: raw["jurisdiction_code"],
      status: raw["current_status"],
      incorporation_date: parse_date(raw["incorporation_date"]),
      dissolution_date: parse_date(raw["dissolution_date"]),
      company_type: raw["company_type"],
      registered_address: raw["registered_address_in_full"],
      opencorporates_url: raw["opencorporates_url"],
      source: :opencorporates,
      retrieved_at: DateTime.utc_now()
    }
  end
end
```

## Jurisdiction Mapping

Different jurisdictions use different company numbering schemes, status labels, and company type classifications. The jurisdiction mapper normalizes these into a common taxonomy:

| Jurisdiction | Company Number Format | Status Labels | Example |
|-------------|----------------------|---------------|---------|
| CZ (Czech Republic) | 8-digit ICO | Active/Dissolved/In Liquidation | `27082440` |
| GB (United Kingdom) | 8-char alphanum | Active/Dissolved/Liquidation | `00445790` |
| US_DE (Delaware) | Variable numeric | Good Standing/Void/Cancelled | `2854032` |
| DE (Germany) | HRB + number | Active/Liquidation/Deleted | `HRB 86891` |
| SK (Slovakia) | 8-digit ICO | Active/Cancelled/In Bankruptcy | `35763469` |

```elixir
defmodule Prismatic.OSINT.OpenCorporates.JurisdictionMapper do
  @moduledoc """
  Maps jurisdiction-specific corporate terminology to a unified taxonomy.
  Handles company types, statuses, and identifier formats across jurisdictions.
  """

  @status_mapping %{
    "Active" => :active,
    "Good Standing" => :active,
    "Live" => :active,
    "Dissolved" => :dissolved,
    "Void" => :dissolved,
    "Cancelled" => :dissolved,
    "Deleted" => :dissolved,
    "In Liquidation" => :liquidation,
    "Liquidation" => :liquidation,
    "In Bankruptcy" => :bankruptcy,
    "Administration" => :administration
  }

  @company_type_mapping %{
    "s.r.o." => :limited_liability,
    "a.s." => :joint_stock,
    "Ltd" => :limited_liability,
    "Plc" => :public_limited,
    "GmbH" => :limited_liability,
    "AG" => :joint_stock,
    "LLC" => :limited_liability,
    "Corp" => :corporation,
    "Inc" => :corporation
  }

  @spec normalize_status(String.t()) :: atom()
  def normalize_status(status) do
    Map.get(@status_mapping, status, :unknown)
  end

  @spec normalize_company_type(String.t(), String.t()) :: atom()
  def normalize_company_type(raw_type, jurisdiction) do
    matched =
      Enum.find(@company_type_mapping, fn {pattern, _} ->
        String.contains?(raw_type || "", pattern)
      end)

    case matched do
      {_, type} -> type
      nil -> infer_from_jurisdiction(raw_type, jurisdiction)
    end
  end

  defp infer_from_jurisdiction(_, "cz"), do: :czech_entity
  defp infer_from_jurisdiction(_, "sk"), do: :slovak_entity
  defp infer_from_jurisdiction(_, _), do: :unknown
end
```

## Officer Lookups

Corporate officers (directors, secretaries, shareholders) connect companies into networks. The officer lookup retrieves appointments and builds relationship graphs:

```elixir
@spec search_officers(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
def search_officers(name, opts \\ []) do
  params =
    [q: name, per_page: Keyword.get(opts, :per_page, 30)]
    |> maybe_add(:jurisdiction_code, Keyword.get(opts, :jurisdiction))
    |> add_api_token()

  case Req.get("#{@base_url}/officers/search", params: params) do
    {:ok, %{status: 200, body: %{"results" => %{"officers" => officers}}}} ->
      normalized = Enum.map(officers, fn %{"officer" => o} ->
        %{
          name: o["name"],
          position: o["position"],
          start_date: parse_date(o["start_date"]),
          end_date: parse_date(o["end_date"]),
          current: o["end_date"] == nil,
          company: %{
            name: get_in(o, ["company", "name"]),
            number: get_in(o, ["company", "company_number"]),
            jurisdiction: get_in(o, ["company", "jurisdiction_code"])
          },
          source: :opencorporates
        }
      end)
      {:ok, normalized}

    {:error, reason} ->
      {:error, reason}
  end
end
```

## Filing Analysis

Corporate filings reveal financial health, structural changes, and compliance patterns. Annual returns show whether a company is actively maintained, while extraordinary filings (director changes, address moves, share allocations) indicate operational events:

```elixir
@spec get_filings(String.t(), String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
def get_filings(jurisdiction, company_number, opts \\ []) do
  url = "#{@base_url}/companies/#{jurisdiction}/#{company_number}/filings"
  params = add_api_token(per_page: Keyword.get(opts, :per_page, 50))

  case Req.get(url, params: params) do
    {:ok, %{status: 200, body: %{"results" => %{"filings" => filings}}}} ->
      analyzed =
        filings
        |> Enum.map(fn %{"filing" => f} -> normalize_filing(f) end)
        |> analyze_filing_patterns()

      {:ok, analyzed}

    {:error, reason} ->
      {:error, reason}
  end
end

defp analyze_filing_patterns(filings) do
  sorted = Enum.sort_by(filings, & &1.date, {:desc, Date})

  %{
    filings: sorted,
    total_count: length(sorted),
    latest_filing: List.first(sorted),
    filing_gap_days: calculate_filing_gap(sorted),
    has_recent_activity: recent_activity?(sorted),
    director_changes: count_by_type(sorted, :director_change),
    address_changes: count_by_type(sorted, :address_change),
    compliance_score: score_filing_compliance(sorted)
  }
end
```

| Filing Pattern | Indicator | Risk Signal |
|---------------|-----------|-------------|
| Regular annual returns | Active maintenance | Low risk |
| > 2 year filing gap | Possible dormancy | Medium risk |
| Multiple director changes in 90 days | Instability or restructuring | High risk |
| Address changed to virtual office | Possible shell company | Medium risk |
| No filings since incorporation | Shelf company | High risk |
| Late annual returns | Compliance issues | Low-Medium risk |

## Integration with Due Diligence Workflows

The OpenCorporates adapter integrates into the platform's due diligence pipeline as a primary corporate data source. When an investigation targets a company, the pipeline automatically searches OpenCorporates, retrieves the full company profile, discovers all officers, and pulls filing history. Officer names are then cross-referenced against sanctions lists and PEP databases, while the filing analysis feeds into the financial health assessment module.

The jurisdiction mapper ensures consistent handling regardless of where the target company is registered, enabling cross-border investigations that span multiple jurisdictions with unified data quality and risk scoring.
