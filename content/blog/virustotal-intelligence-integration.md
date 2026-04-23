+++
title = "VirusTotal Intelligence Integration: Multi-Query Threat Analysis in Elixir"
date = 2026-02-26
description = "Building a VirusTotal adapter for threat intelligence: file hash lookups, URL scanning, IP reputation checks, domain reports, and efficient multi-query batching in Elixir."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["virustotal", "threat-intelligence", "elixir", "malware", "osint"]
reading_time = "8 min"
keywords = ["virustotal api", "threat intelligence", "malware analysis", "elixir adapter", "file hash lookup"]
image = "/images/blog/virustotal-intelligence-integration.png"
word_count = 1080
date_created = "2026-02-26"
date_modified = "2026-02-26"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "VirusTotal Intelligence Integration - Prismatic Platform"
+++

## VirusTotal as a Threat Intelligence Cornerstone

VirusTotal aggregates results from over 70 antivirus engines and dozens of URL/domain scanners. When investigating a suspicious entity — whether a file hash found on a compromised server, a URL extracted from a phishing email, or an IP address linked to command-and-control infrastructure — VirusTotal provides multi-vendor consensus that no single engine can match.

Building an effective VirusTotal adapter means handling four distinct query types (files, URLs, IPs, domains), normalizing wildly different response structures into a uniform format, and batching queries to respect API quotas while maximizing throughput.

## HTTP Client Foundation

The adapter wraps VirusTotal's v3 REST API with proper authentication, retry logic, and structured error handling:

```elixir
defmodule Prismatic.OSINT.Adapters.VirusTotal do
  @moduledoc """
  VirusTotal v3 API adapter for multi-vector threat intelligence.
  Supports file hash, URL, IP, and domain lookups with batch querying.
  """

  @behaviour Prismatic.OSINT.Adapter

  require Logger

  @base_url "https://www.virustotal.com/api/v3"
  @max_retries 3
  @retry_backoff_ms 1_000

  @spec lookup(atom(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def lookup(type, indicator, opts \\ []) when type in [:file, :url, :ip, :domain] do
    path = build_path(type, indicator)
    api_key = Keyword.get(opts, :api_key, get_api_key())

    headers = [{"x-apikey", api_key}, {"accept", "application/json"}]

    case request_with_retry(path, headers, @max_retries) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, normalize(type, body)}

      {:ok, %{status: 404}} ->
        {:ok, %{found: false, indicator: indicator, type: type}}

      {:ok, %{status: 429}} ->
        {:error, :rate_limited}

      {:ok, %{status: status}} ->
        {:error, {:unexpected_status, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp build_path(:file, hash), do: "#{@base_url}/files/#{hash}"
  defp build_path(:url, url), do: "#{@base_url}/urls/#{Base.url_encode64(url, padding: false)}"
  defp build_path(:ip, ip), do: "#{@base_url}/ip_addresses/#{ip}"
  defp build_path(:domain, domain), do: "#{@base_url}/domains/#{domain}"

  defp request_with_retry(url, headers, retries_left) do
    case Req.get(url, headers: headers) do
      {:ok, %{status: 429}} when retries_left > 0 ->
        backoff = (@max_retries - retries_left + 1) * @retry_backoff_ms
        Process.sleep(backoff)
        request_with_retry(url, headers, retries_left - 1)

      result ->
        result
    end
  end
end
```

## Response Normalization

Each VirusTotal endpoint returns data in a different structure. The normalization layer produces a consistent format regardless of query type:

| Query Type | Raw Response Fields | Normalized Output |
|-----------|-------------------|-------------------|
| File hash | `last_analysis_stats`, `sha256`, `type_description` | Detection ratio, file type, first/last seen |
| URL | `last_analysis_stats`, `last_http_response_content_length` | Detection ratio, HTTP status, final URL |
| IP address | `as_owner`, `country`, `last_analysis_stats` | ASN, geolocation, reputation score |
| Domain | `registrar`, `creation_date`, `last_analysis_stats` | Registrar, age, DNS records, reputation |

```elixir
defp normalize(:file, %{"data" => %{"attributes" => attrs}}) do
  stats = attrs["last_analysis_stats"] || %{}
  total = Enum.sum(Map.values(stats))
  malicious = stats["malicious"] || 0

  %{
    type: :file,
    found: true,
    sha256: attrs["sha256"],
    sha1: attrs["sha1"],
    md5: attrs["md5"],
    file_type: attrs["type_description"],
    size: attrs["size"],
    detection_ratio: if(total > 0, do: malicious / total, else: 0.0),
    malicious_count: malicious,
    total_engines: total,
    first_seen: parse_timestamp(attrs["first_submission_date"]),
    last_seen: parse_timestamp(attrs["last_analysis_date"]),
    tags: attrs["tags"] || [],
    confidence: calculate_confidence(stats, attrs)
  }
end

defp normalize(:ip, %{"data" => %{"attributes" => attrs}}) do
  stats = attrs["last_analysis_stats"] || %{}

  %{
    type: :ip,
    found: true,
    ip: attrs["ip_address"] || attrs["id"],
    asn: attrs["asn"],
    as_owner: attrs["as_owner"],
    country: attrs["country"],
    reputation: attrs["reputation"] || 0,
    malicious_count: stats["malicious"] || 0,
    total_engines: Enum.sum(Map.values(stats)),
    network: attrs["network"],
    confidence: calculate_ip_confidence(stats, attrs)
  }
end

defp normalize(:domain, %{"data" => %{"attributes" => attrs}}) do
  stats = attrs["last_analysis_stats"] || %{}

  %{
    type: :domain,
    found: true,
    domain: attrs["id"],
    registrar: attrs["registrar"],
    creation_date: parse_timestamp(attrs["creation_date"]),
    reputation: attrs["reputation"] || 0,
    malicious_count: stats["malicious"] || 0,
    total_engines: Enum.sum(Map.values(stats)),
    categories: attrs["categories"] || %{},
    dns_records: extract_dns(attrs),
    confidence: calculate_domain_confidence(stats, attrs)
  }
end

defp normalize(:url, %{"data" => %{"attributes" => attrs}}) do
  stats = attrs["last_analysis_stats"] || %{}
  total = Enum.sum(Map.values(stats))
  malicious = stats["malicious"] || 0

  %{
    type: :url,
    found: true,
    url: attrs["url"],
    final_url: attrs["last_final_url"],
    detection_ratio: if(total > 0, do: malicious / total, else: 0.0),
    malicious_count: malicious,
    total_engines: total,
    http_status: attrs["last_http_response_code"],
    content_length: attrs["last_http_response_content_length"],
    confidence: calculate_url_confidence(stats, attrs)
  }
end
```

## Multi-Query Batching

The free VirusTotal API tier allows 4 requests per minute. Even premium tiers benefit from batching to maximize throughput. The batcher collects pending queries and dispatches them in optimal groups:

```elixir
defmodule Prismatic.OSINT.Adapters.VirusTotal.Batcher do
  @moduledoc """
  Batches VirusTotal API queries to optimize rate limit usage.
  Collects pending queries and dispatches them at the maximum allowed rate.
  """

  use GenServer

  require Logger

  @dispatch_interval_ms 15_000
  @max_batch_size 4

  defstruct queue: :queue.new(), pending_callers: [], api_key: nil

  @spec enqueue(atom(), String.t()) :: {:ok, map()} | {:error, term()}
  def enqueue(type, indicator) do
    GenServer.call(__MODULE__, {:enqueue, type, indicator}, 60_000)
  end

  @impl true
  def init(opts) do
    schedule_dispatch()
    {:ok, %__MODULE__{api_key: Keyword.fetch!(opts, :api_key)}}
  end

  @impl true
  def handle_call({:enqueue, type, indicator}, from, state) do
    new_queue = :queue.in({type, indicator, from}, state.queue)
    {:noreply, %{state | queue: new_queue}}
  end

  @impl true
  def handle_info(:dispatch, state) do
    {batch, remaining} = dequeue_batch(state.queue, @max_batch_size)

    Enum.each(batch, fn {type, indicator, from} ->
      result = Prismatic.OSINT.Adapters.VirusTotal.lookup(type, indicator,
        api_key: state.api_key)
      GenServer.reply(from, result)
    end)

    schedule_dispatch()
    {:noreply, %{state | queue: remaining}}
  end

  defp dequeue_batch(queue, count) do
    Enum.reduce_while(1..count, {[], queue}, fn _, {batch, q} ->
      case :queue.out(q) do
        {{:value, item}, new_q} -> {:cont, {[item | batch], new_q}}
        {:empty, q} -> {:halt, {batch, q}}
      end
    end)
  end

  defp schedule_dispatch do
    Process.send_after(self(), :dispatch, @dispatch_interval_ms)
  end
end
```

## Confidence Scoring

VirusTotal confidence depends on engine consensus strength and data recency:

| Factor | Weight | Logic |
|--------|--------|-------|
| Engine consensus | 0.35 | Higher weight when 90%+ engines agree (benign or malicious) |
| Engine count | 0.20 | More engines scanning = higher confidence |
| Data freshness | 0.25 | Exponential decay from last analysis date |
| Tag quality | 0.10 | Named malware families increase confidence |
| Reputation score | 0.10 | Community votes and historical reputation |

```elixir
defp calculate_confidence(stats, attrs) do
  total = Enum.sum(Map.values(stats))
  malicious = stats["malicious"] || 0

  consensus =
    if total > 0 do
      ratio = max(malicious / total, 1.0 - malicious / total)
      ratio
    else
      0.0
    end

  engine_coverage = min(total / 70.0, 1.0)

  freshness =
    case parse_timestamp(attrs["last_analysis_date"]) do
      nil -> 0.3
      dt ->
        age_days = DateTime.diff(DateTime.utc_now(), dt, :day)
        max(1.0 - age_days / 365.0, 0.1)
    end

  tag_quality = if(length(attrs["tags"] || []) > 0, do: 1.0, else: 0.5)
  reputation = normalize_reputation(attrs["reputation"] || 0)

  (consensus * 0.35 + engine_coverage * 0.20 + freshness * 0.25 +
     tag_quality * 0.10 + reputation * 0.10)
  |> Float.round(3)
end
```

## Integration with the OSINT Mesh

The VirusTotal adapter plugs into the broader OSINT mesh through entity enrichment. When an investigation discovers a suspicious IP, the mesh automatically fans out queries to VirusTotal, Shodan, and other adapters in parallel. Results are merged with conflict resolution: when VirusTotal says an IP is malicious but another source disagrees, the confidence-weighted consensus determines the final risk score.

The adapter emits `:telemetry` events for every API call, tracking latency, quota consumption, and cache hit rates. This feeds into the platform's observability layer, enabling real-time dashboards that show exactly how threat intelligence queries are performing across all integrated sources.
