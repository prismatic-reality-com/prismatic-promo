+++
title = "Shodan Integration Guide: Building an OSINT Adapter in Elixir"
date = 2026-02-25
description = "Step-by-step guide to integrating Shodan's internet device search engine into an Elixir-based OSINT platform, covering API setup, banner parsing, service fingerprinting, CVE correlation, and rate limiting."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["shodan", "osint", "elixir", "integration", "security"]
reading_time = "8 min"
keywords = ["shodan api", "osint adapter", "elixir integration", "service fingerprinting", "cve correlation"]
image = "/images/blog/shodan-integration-guide.png"
word_count = 1050
date_created = "2026-02-25"
date_modified = "2026-02-25"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Shodan Integration Guide - Prismatic Platform"
+++

## Why Shodan Matters for Intelligence Platforms

Shodan indexes every internet-connected device it can reach. Unlike traditional search engines that crawl web pages, Shodan scans ports, grabs banners, and fingerprints services. For an OSINT platform, this data is invaluable: it reveals the external attack surface of any organization, exposes misconfigured services, and correlates discovered software versions against known CVEs.

Building a robust Shodan adapter in Elixir requires careful attention to three areas: API communication with proper rate limiting, banner parsing with structured data extraction, and confidence scoring that weights results based on data freshness and completeness.

## Adapter Behaviour Design

Every OSINT adapter in our platform implements a common behaviour. This guarantees a uniform interface regardless of the underlying data source. The behaviour defines four callbacks that every adapter must satisfy:

```elixir
defmodule Prismatic.OSINT.Adapter do
  @moduledoc """
  Behaviour for OSINT data source adapters.
  All adapters must implement search, enrich, normalize, and health callbacks.
  """

  @type query :: String.t() | map()
  @type result :: {:ok, list(map())} | {:error, term()}
  @type health :: :healthy | :degraded | :unavailable

  @callback search(query(), keyword()) :: result()
  @callback enrich(map(), keyword()) :: {:ok, map()} | {:error, term()}
  @callback normalize(map()) :: map()
  @callback health_check() :: health()
end
```

The Shodan adapter implements this behaviour with a GenServer backing for connection pooling and rate limit tracking:

```elixir
defmodule Prismatic.OSINT.Adapters.Shodan do
  @moduledoc """
  Shodan internet device search adapter.
  Provides host lookup, search, and CVE correlation capabilities.
  """

  use GenServer
  @behaviour Prismatic.OSINT.Adapter

  require Logger

  @base_url "https://api.shodan.io"
  @rate_limit_per_second 1
  @banner_fields ~w(ip_str port transport product version os cpe vulns timestamp)

  defstruct [:api_key, :last_request_at, requests_this_second: 0]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    api_key = Keyword.fetch!(opts, :api_key)
    GenServer.start_link(__MODULE__, %__MODULE__{api_key: api_key}, name: __MODULE__)
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl Prismatic.OSINT.Adapter
  def search(query, opts \\ []) do
    GenServer.call(__MODULE__, {:search, query, opts}, 30_000)
  end

  @impl Prismatic.OSINT.Adapter
  def enrich(%{ip: ip} = entity, opts) do
    case host_lookup(ip, opts) do
      {:ok, host_data} ->
        enriched = Map.merge(entity, %{
          shodan_ports: extract_ports(host_data),
          shodan_vulns: extract_vulns(host_data),
          shodan_os: host_data["os"],
          confidence: calculate_confidence(host_data)
        })
        {:ok, enriched}

      {:error, reason} ->
        Logger.warning("Shodan enrich failed for #{ip}: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @impl Prismatic.OSINT.Adapter
  def normalize(raw) do
    %{
      source: :shodan,
      ip: raw["ip_str"],
      ports: Enum.map(raw["data"] || [], & &1["port"]),
      services: Enum.map(raw["data"] || [], &parse_banner/1),
      vulns: raw["vulns"] || [],
      last_seen: raw["last_update"],
      normalized_at: DateTime.utc_now()
    }
  end

  @impl Prismatic.OSINT.Adapter
  def health_check do
    case Req.get("#{@base_url}/api-info", params: [key: get_api_key()]) do
      {:ok, %{status: 200}} -> :healthy
      {:ok, %{status: 429}} -> :degraded
      _ -> :unavailable
    end
  end
end
```

## Banner Parsing and Service Fingerprinting

Shodan banners contain the raw response data from each discovered service. Parsing these banners correctly is critical for accurate fingerprinting. Each banner includes fields like product name, version, CPE identifiers, and sometimes vulnerability references:

```elixir
defp parse_banner(banner) do
  %{
    port: banner["port"],
    transport: banner["transport"] || "tcp",
    product: banner["product"],
    version: banner["version"],
    cpe: banner["cpe"] || [],
    vulns: Map.keys(banner["vulns"] || %{}),
    fingerprint: generate_fingerprint(banner),
    raw_length: byte_size(banner["data"] || "")
  }
end

defp generate_fingerprint(banner) do
  components = [
    banner["product"],
    banner["version"],
    to_string(banner["port"]),
    banner["transport"]
  ]

  components
  |> Enum.reject(&is_nil/1)
  |> Enum.join(":")
  |> then(&:crypto.hash(:sha256, &1))
  |> Base.encode16(case: :lower)
  |> binary_part(0, 16)
end
```

## CVE Correlation

When Shodan identifies software versions, we can correlate them against known vulnerabilities. The platform maintains a local CVE cache updated daily and performs real-time lookups for high-priority targets:

| Field | Source | Update Frequency | Purpose |
|-------|--------|------------------|---------|
| `cpe` | Shodan banner | Per-scan | Software identification via CPE 2.3 |
| `vulns` | Shodan enrichment | Per-scan | Direct CVE references from Shodan |
| `cve_details` | Local NVD cache | Daily | CVSS scores, descriptions, references |
| `exploit_refs` | ExploitDB correlation | Weekly | Known public exploits |
| `risk_score` | Platform calculation | Real-time | Composite risk from all factors |

```elixir
defp correlate_cves(banner) do
  cpes = banner["cpe"] || []
  shodan_vulns = Map.keys(banner["vulns"] || %{})

  local_matches =
    cpes
    |> Enum.flat_map(&Prismatic.CVE.Cache.lookup_by_cpe/1)
    |> Enum.uniq_by(& &1.cve_id)

  all_cve_ids =
    (shodan_vulns ++ Enum.map(local_matches, & &1.cve_id))
    |> Enum.uniq()

  %{
    cve_count: length(all_cve_ids),
    critical: Enum.count(local_matches, &(&1.cvss >= 9.0)),
    high: Enum.count(local_matches, &(&1.cvss >= 7.0 and &1.cvss < 9.0)),
    cve_ids: all_cve_ids
  }
end
```

## Rate Limiting Strategy

Shodan enforces strict rate limits. The free tier allows one request per second; paid plans vary. Our adapter handles this with a token-bucket approach inside the GenServer state:

```elixir
@impl true
def handle_call({:search, query, opts}, _from, state) do
  case check_rate_limit(state) do
    {:ok, new_state} ->
      result = execute_search(query, opts, new_state.api_key)
      {:reply, result, new_state}

    {:rate_limited, new_state} ->
      wait_ms = calculate_wait(new_state)
      Process.send_after(self(), :reset_rate_counter, wait_ms)
      {:reply, {:error, {:rate_limited, wait_ms}}, new_state}
  end
end

defp check_rate_limit(state) do
  now = System.monotonic_time(:millisecond)
  elapsed = now - (state.last_request_at || 0)

  if elapsed >= 1000 or state.requests_this_second < @rate_limit_per_second do
    new_state =
      if elapsed >= 1000 do
        %{state | requests_this_second: 1, last_request_at: now}
      else
        %{state | requests_this_second: state.requests_this_second + 1}
      end

    {:ok, new_state}
  else
    {:rate_limited, state}
  end
end
```

## Confidence Scoring

Not all Shodan results are equally reliable. Data freshness, banner completeness, and scan method all affect confidence. We compute a 0.0-1.0 confidence score for every result:

| Factor | Weight | Scoring Logic |
|--------|--------|---------------|
| Data age | 0.30 | 1.0 if < 7 days, linear decay to 0.1 at 365 days |
| Banner completeness | 0.25 | Ratio of populated fields to total expected fields |
| Version specificity | 0.20 | 1.0 for exact version, 0.5 for major only, 0.2 for product only |
| CVE correlation | 0.15 | 1.0 if CVEs confirmed by multiple sources |
| Port responsiveness | 0.10 | 1.0 if port confirmed responsive in last scan |

```elixir
defp calculate_confidence(host_data) do
  age_score = score_data_age(host_data["last_update"])
  completeness = score_completeness(host_data)
  version_score = score_version_specificity(host_data["data"] || [])
  cve_score = score_cve_correlation(host_data)
  port_score = if host_data["ports"] != [], do: 1.0, else: 0.2

  (age_score * 0.30 +
     completeness * 0.25 +
     version_score * 0.20 +
     cve_score * 0.15 +
     port_score * 0.10)
  |> Float.round(3)
end
```

## Production Considerations

Running Shodan at scale requires attention to API key rotation, result caching, and graceful degradation. We cache host lookups in ETS with a configurable TTL (default 6 hours) and fall back to cached data when rate-limited. The adapter emits telemetry events for every API call, enabling real-time monitoring of quota consumption and error rates.

The combination of structured banner parsing, multi-source CVE correlation, and weighted confidence scoring transforms raw Shodan data into actionable intelligence that integrates seamlessly with the broader OSINT mesh.
