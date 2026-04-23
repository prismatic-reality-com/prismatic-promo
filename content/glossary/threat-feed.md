+++
title = "Threat Feed"
weight = 50
[extra]
description = "Real-time stream of cyber threat intelligence data including indicators of compromise, vulnerability disclosures, and adversary tactics"
category = "security"
related_terms = ["stix", "taxii", "ioc", "osint", "threat-intelligence", "signal", "vulnerability"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["threat feed", "threat intelligence", "CTI", "IOC", "real-time", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "threat-intelligence"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Threat Feed - Prismatic Platform"
+++

## Definition & Overview

A threat feed is a continuous stream of cyber threat intelligence data that provides real-time or near-real-time information about threats, vulnerabilities, malicious infrastructure, and adversary activities. Threat feeds deliver structured data -- IP addresses of known command-and-control servers, domain names used in phishing campaigns, file hashes of malware samples, CVE vulnerability disclosures -- that security systems consume to detect, prevent, and respond to threats.

Threat feeds vary along several dimensions: source (open source vs. commercial vs. government), format (STIX/TAXII, CSV, JSON, custom), latency (real-time push vs. periodic pull), scope (targeted vs. comprehensive), and reliability (vetted indicators vs. raw community submissions). The value of a threat feed depends not just on the data it provides but on the signal-to-noise ratio, the timeliness of indicators, and the operational context attached to each indicator.

In the Prismatic Platform, threat feeds are a primary intelligence source for the Perimeter EASM module and the OSINT toolbox. External feeds are consumed through TAXII clients or direct API integrations, with each feed entry converted to a NABLA signal with proper provenance, confidence scoring, and temporal metadata. The platform's epistemic framework applies signal plurality requirements to threat feed data, preventing single-feed dependency and ensuring that automated defensive actions are based on corroborated intelligence.

## Technical Deep Dive

### Feed Aggregation Engine

The platform aggregates multiple threat feeds into a unified intelligence stream:

```elixir
defmodule PrismaticThreatIntel.FeedAggregator do
  @moduledoc """
  Aggregates multiple threat feeds into a unified intelligence stream.
  Deduplicates indicators, correlates across sources, and applies
  confidence scoring based on multi-source corroboration.
  """

  use GenServer

  alias PrismaticNabla.Signal

  defstruct feeds: %{}, indicators: %{}, correlation_table: %{}

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    feeds = Keyword.get(opts, :feeds, %{})
    {:ok, %__MODULE__{feeds: feeds}}
  end

  @spec ingest(String.t(), [map()]) :: {:ok, non_neg_integer()}
  def ingest(feed_id, indicators) do
    GenServer.call(__MODULE__, {:ingest, feed_id, indicators})
  end

  @spec lookup_indicator(String.t()) :: {:ok, map()} | {:error, :not_found}
  def lookup_indicator(indicator_value) do
    GenServer.call(__MODULE__, {:lookup, indicator_value})
  end

  @impl true
  def handle_call({:ingest, feed_id, indicators}, _from, state) do
    {new_count, updated_state} =
      Enum.reduce(indicators, {0, state}, fn indicator, {count, st} ->
        key = normalize_indicator(indicator)

        existing = Map.get(st.indicators, key, %{sources: [], first_seen: nil})

        updated = %{
          value: indicator.value,
          type: indicator.type,
          sources: Enum.uniq([feed_id | existing.sources]),
          first_seen: existing.first_seen || DateTime.utc_now(),
          last_seen: DateTime.utc_now(),
          confidence: calculate_confidence(length(Enum.uniq([feed_id | existing.sources]))),
          metadata: Map.merge(existing[:metadata] || %{}, indicator[:metadata] || %{})
        }

        {count + 1, %{st | indicators: Map.put(st.indicators, key, updated)}}
      end)

    {:reply, {:ok, new_count}, updated_state}
  end

  @impl true
  def handle_call({:lookup, value}, _from, state) do
    key = normalize_indicator(%{value: value})
    case Map.get(state.indicators, key) do
      nil -> {:reply, {:error, :not_found}, state}
      indicator -> {:reply, {:ok, indicator}, state}
    end
  end

  defp normalize_indicator(%{value: value}) do
    value |> String.trim() |> String.downcase()
  end

  defp calculate_confidence(source_count) do
    # More sources = higher confidence (up to 0.95)
    min(0.95, 0.5 + source_count * 0.15)
  end
end
```

### Feed-to-Signal Conversion

Threat feed entries are converted to NABLA signals for epistemic processing:

```elixir
defmodule PrismaticThreatIntel.FeedSignalConverter do
  @moduledoc """
  Converts threat feed indicators to NABLA signals
  with proper provenance and confidence metadata.
  """

  @spec convert(map(), String.t()) :: {:ok, map()} | {:error, term()}
  def convert(indicator, feed_id) do
    signal_attrs = %{
      source: %{
        adapter: PrismaticThreatIntel.FeedAggregator,
        query: indicator.value,
        source_type: classify_feed(feed_id),
        independence_group: String.to_atom(feed_id)
      },
      observation: %{
        indicator_type: indicator.type,
        indicator_value: indicator.value,
        severity: indicator[:severity] || :medium,
        tags: indicator[:tags] || [],
        context: indicator[:metadata] || %{}
      },
      confidence: indicator.confidence,
      domain: :threat_intelligence,
      provenance: %{
        pipeline: "threat_feed",
        tool_slug: feed_id,
        raw_response_hash: hash_indicator(indicator),
        transformation_chain: [:feed_raw, :normalized, :signal]
      },
      tags: [String.to_atom(indicator.type), :threat_feed]
    }

    {:ok, signal_attrs}
  end

  defp classify_feed("osint_" <> _), do: :primary
  defp classify_feed("commercial_" <> _), do: :primary
  defp classify_feed("community_" <> _), do: :secondary
  defp classify_feed(_), do: :secondary

  defp hash_indicator(indicator) do
    :crypto.hash(:sha256, inspect(indicator))
    |> Base.encode16(case: :lower)
    |> binary_part(0, 16)
  end
end
```

### Indicator Matching for Security Monitoring

The platform matches threat feed indicators against observed network activity:

```elixir
defmodule PrismaticPerimeter.IndicatorMatcher do
  @moduledoc """
  Matches observed network indicators against threat feed data
  for real-time threat detection in Perimeter EASM.
  """

  alias PrismaticThreatIntel.FeedAggregator

  @spec check_domain(String.t()) :: {:clean, map()} | {:threat, map()}
  def check_domain(domain) do
    case FeedAggregator.lookup_indicator(domain) do
      {:ok, indicator} when indicator.confidence > 0.7 ->
        {:threat, %{
          domain: domain,
          indicator: indicator,
          action: :block,
          confidence: indicator.confidence,
          sources: indicator.sources
        }}

      {:ok, indicator} ->
        {:threat, %{
          domain: domain,
          indicator: indicator,
          action: :investigate,
          confidence: indicator.confidence,
          sources: indicator.sources
        }}

      {:error, :not_found} ->
        {:clean, %{domain: domain, checked_at: DateTime.utc_now()}}
    end
  end

  @spec check_ip(String.t()) :: {:clean, map()} | {:threat, map()}
  def check_ip(ip) do
    case FeedAggregator.lookup_indicator(ip) do
      {:ok, indicator} -> {:threat, %{ip: ip, indicator: indicator}}
      {:error, :not_found} -> {:clean, %{ip: ip}}
    end
  end
end
```

## Architecture & Implementation

The threat feed architecture follows a producer-consumer pattern. Feed sources (TAXII clients, API pollers, webhook receivers) produce raw indicator data. The aggregation engine deduplicates, correlates, and scores indicators. The signal converter transforms scored indicators into NABLA signals. The indicator matcher consumes the aggregated data for real-time security checks.

Feed reliability is tracked per-source. Feeds that produce indicators later confirmed as false positives have their confidence weighting reduced automatically. Feeds that consistently produce accurate, timely indicators receive higher weighting. This adaptive scoring ensures that the platform's threat intelligence quality improves over time.

The platform stores indicator history in PostgreSQL for compliance auditing and historical analysis, with ETS caching for real-time matching performance. Indicators have configurable TTL based on type: IP addresses expire faster (infrastructure rotates) than malware hashes (static artifacts).

## Usage in Prismatic Platform

Threat feeds power the Perimeter EASM security assessments:

```elixir
# Check a domain against threat feeds
case PrismaticPerimeter.IndicatorMatcher.check_domain("suspicious.example.com") do
  {:threat, details} -> handle_threat(details)
  {:clean, _} -> :ok
end

# Ingest new feed data
PrismaticThreatIntel.FeedAggregator.ingest("commercial_feed_1", indicators)
```

## Cross-References

- [STIX](/glossary/stix/) - Standard format for threat feed data
- [TAXII](/glossary/taxii/) - Transport protocol for threat feed delivery
- [Signal](/glossary/signal/) - Platform format produced from threat feed indicators
- [OSINT](/glossary/osint/) - Intelligence discipline contributing to threat feeds

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
