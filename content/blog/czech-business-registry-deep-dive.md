+++
title = "Czech Business Registry Deep Dive: ARES, Justice.cz, and Beyond"
date = 2026-03-13
description = "A technical guide to querying Czech business registries programmatically. Covers ARES XML API, Justice.cz scraping patterns, Insolvency Registry, and how Prismatic unifies these sources."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["czech", "ares", "osint", "registries", "business-intelligence", "api"]
reading_time = "11 min"
keywords = ["Czech ARES API", "Justice.cz scraping", "Czech business registry", "ICO lookup", "Czech company data", "insolvency registry API"]
image = "/images/blog/czech-registries.png"
word_count = 1900
date_created = "2026-03-13"
date_modified = "2026-03-13"
quality_score = 86
see_also = ["osint", "due-diligence", "entity-resolution", "kyc", "nis2"]
image_alt = "Czech Business Registry Deep Dive: ARES, Justice.cz, and Beyond - Prismatic Platform"
+++

The Czech Republic maintains several public business registries that provide rich data about companies, their ownership, financial health, and legal status. For OSINT practitioners, due diligence analysts, and compliance teams, these registries are essential data sources. This guide covers how to query them programmatically and how Prismatic unifies them into a single intelligence feed.

## The Czech Registry Landscape

| Registry | Operator | Data | Access |
|----------|----------|------|--------|
| ARES | Ministry of Finance | Business register aggregation | REST/XML API |
| Justice.cz | Ministry of Justice | Commercial register, directors | Web + SOAP |
| Insolvency Registry | Ministry of Justice | Insolvency proceedings | REST API |
| Trade Register | Municipal offices | Trade licenses | Web scraping |
| Beneficial Ownership | Ministry of Justice | UBO data | Restricted API |
| CUZK | Cadastral Office | Land and property records | Restricted |

## ARES: The Primary Gateway

ARES (Administrativni Registr Ekonomickych Subjektu) is the Czech government's aggregation point for business data. It pulls from multiple source registries and provides a unified API.

### Basic ICO Lookup

```elixir
defmodule PrismaticOsintSources.Adapters.Czech.ARES do
  @base_url "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest"

  def search(query, opts \\ []) do
    url = "#{@base_url}/ekonomicke-subjekty/vyhledat"

    params = %{
      "obchodniJmeno" => query,
      "start" => Keyword.get(opts, :offset, 0),
      "pocet" => Keyword.get(opts, :limit, 25)
    }

    case HTTPClient.get(url, params: params) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, parse_ares_response(body)}
      {:ok, %{status: status}} ->
        {:error, {:http_error, status}}
      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

ARES returns JSON with company details: ICO (identification number), name, registered address, legal form, date of establishment, and industry classification (CZ-NACE codes).

### Rate Limiting

ARES does not publish official rate limits but enforces them. Through empirical testing, we have established safe limits:

- **Search queries**: 30 requests per minute
- **ICO lookups**: 60 requests per minute
- **Burst**: up to 5 concurrent requests

Prismatic's adapter declares these limits in `metadata/0`, and the pipeline's circuit breaker enforces them automatically.

## Justice.cz: The Commercial Register

The Justice Registry (or.justice.cz) provides the official commercial register with director information, shareholder details, and corporate filings. Unlike ARES, Justice.cz does not provide a clean REST API.

### Data Available

- Company officers (directors, board members, supervisory board)
- Shareholders and ownership percentages
- Registered capital and share structure
- Historical changes (date-stamped)
- Filed documents (annual reports, articles of association)

### Access Pattern

Justice.cz exposes a SOAP endpoint and structured HTML pages. Prismatic's adapter handles both:

```elixir
def search(query, opts \\ []) do
  # First: try the structured endpoint
  case fetch_from_api(query) do
    {:ok, results} -> {:ok, results}
    {:error, _} ->
      # Fallback: structured HTML parsing
      fetch_from_web(query, opts)
  end
end
```

The HTML parsing extracts structured data from the registry's table-based layout, handling Czech diacritics and date formats.

## Insolvency Registry

The Czech Insolvency Registry (ISIR) provides data about insolvency proceedings -- a critical signal for due diligence:

```elixir
def search(query, opts \\ []) do
  url = "https://isir.justice.cz/isir/ueu/vysledek_lustrace.do"

  params = %{
    "ic" => query,           # ICO lookup
    "typ_osoby" => "P"       # P = pravnicka osoba (legal entity)
  }

  case HTTPClient.get(url, params: params) do
    {:ok, %{status: 200, body: body}} ->
      {:ok, parse_insolvency_results(body)}
    _ ->
      {:error, :insolvency_lookup_failed}
  end
end
```

A clean insolvency record is a positive signal. Active proceedings are a red flag. Historical proceedings require investigation into the resolution.

## Unifying Multiple Registries

The real power emerges when you combine data from all registries:

```elixir
def comprehensive_lookup(ico) do
  tasks = [
    Task.async(fn -> ARES.search(ico) end),
    Task.async(fn -> Justice.search(ico) end),
    Task.async(fn -> Insolvency.search(ico) end),
    Task.async(fn -> TradeRegister.search(ico) end)
  ]

  results = Task.await_many(tasks, timeout: 15_000)

  merge_results(results)
end
```

The `merge_results/1` function applies entity resolution to combine data from all sources into a single company profile with confidence scores per field.

## Data Quality Considerations

Czech registries have known quirks:

- **Address formats vary** across registries (ARES uses structured addresses, Justice uses free text)
- **Historical data** may show outdated information (company moved but registry not updated)
- **Diacritics handling** differs (some registries normalize, others preserve)
- **Response times** vary significantly (ARES: 200ms, Justice: 1-5s, ISIR: 500ms)

Prismatic handles these by normalizing all data to a common schema, tracking data freshness per source, and weighting more authoritative sources higher in conflict resolution.

## Confidence Scoring for Czech Sources

Czech official registries receive high confidence scores in Prismatic's evidence chain:

| Source | Confidence Range | Rationale |
|--------|-----------------|-----------|
| ARES | 0.95 - 1.00 | Official government aggregation |
| Justice.cz | 0.95 - 1.00 | Legal authority for commercial data |
| ISIR | 0.95 - 1.00 | Official insolvency records |
| Trade Register | 0.85 - 0.95 | Municipal, slightly less structured |
| Beneficial Ownership | 0.90 - 0.98 | Official but self-reported |

## Getting Started

Query Czech registries through Prismatic's unified OSINT interface:

```bash
# Using the OSINT API
curl -X POST http://localhost:4004/api/v1/osint/execute_tool \
  -H "Content-Type: application/json" \
  -d '{"slug": "czech-ares", "input": {"query": "27082440"}, "params": {}}'
```

Or use the interactive toolbox at `/hub/osint/tools` to explore all Czech adapters with a visual interface.

---

*Browse all 157 OSINT adapters at [OSINT Sources](@/osint/_index.md) or learn adapter development in the [Interactive Academy](@/academy/_index.md).*
