+++
title = "TAXII"
weight = 50
[extra]
description = "Trusted Automated eXchange of Indicator Information - transport protocol for sharing STIX cyber threat intelligence between systems"
category = "security"
related_terms = ["stix", "threat-feed", "osint", "ioc", "api", "rest-api", "threat-intelligence"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TAXII", "threat intelligence", "STIX transport", "CTI sharing", "security", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "threat-intelligence"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "TAXII - Prismatic Platform"
+++

## Definition & Overview

Trusted Automated eXchange of Indicator Information (TAXII) is an application-layer protocol for exchanging cyber threat intelligence (CTI) over HTTPS. Developed alongside STIX by OASIS, TAXII defines how STIX-formatted threat data is discovered, requested, and delivered between systems. While STIX defines the format of threat intelligence data, TAXII defines the transport -- how that data moves between producers and consumers.

TAXII 2.1 uses a RESTful HTTP API with JSON payloads. It defines three primary services: Discovery (finding available API roots), Collections (logical groupings of STIX objects), and the ability to Get Objects from or Add Objects to those collections. TAXII supports two sharing models: Collections (pull-based, where consumers request data) and Channels (push-based, where producers send data to subscribers). The protocol handles pagination, filtering, and authentication, providing a complete framework for automated threat intelligence exchange.

In the Prismatic Platform, TAXII integration enables consumption of threat intelligence feeds from external providers (ISACs, government CERTs, commercial feeds) and potential publishing of platform-generated intelligence to partner organizations. The OSINT toolbox can ingest TAXII feeds, converting STIX objects into platform signals for NABLA epistemic processing. The Perimeter EASM module can consume vulnerability intelligence from TAXII feeds to enrich its security assessments.

## Technical Deep Dive

### TAXII Client Implementation

The platform implements a TAXII 2.1 client for consuming external feeds:

```elixir
defmodule PrismaticThreatIntel.TaxiiClient do
  @moduledoc """
  TAXII 2.1 client for consuming threat intelligence feeds.
  Supports discovery, collection browsing, and object retrieval.
  """

  @type config :: %{
    base_url: String.t(),
    api_root: String.t(),
    auth: {:basic, String.t(), String.t()} | {:bearer, String.t()},
    timeout: pos_integer()
  }

  @spec discover(config()) :: {:ok, map()} | {:error, term()}
  def discover(config) do
    url = "#{config.base_url}/taxii2/"
    headers = auth_headers(config) ++ [{"Accept", "application/taxii+json;version=2.1"}]

    case PrismaticHttp.SecureClient.get(url, headers: headers) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, Jason.decode!(body)}

      {:ok, %{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec list_collections(config()) :: {:ok, [map()]} | {:error, term()}
  def list_collections(config) do
    url = "#{config.base_url}/#{config.api_root}/collections/"
    headers = auth_headers(config) ++ [{"Accept", "application/taxii+json;version=2.1"}]

    case PrismaticHttp.SecureClient.get(url, headers: headers) do
      {:ok, %{status: 200, body: body}} ->
        %{"collections" => collections} = Jason.decode!(body)
        {:ok, collections}

      {:ok, %{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec get_objects(config(), String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def get_objects(config, collection_id, opts \\ []) do
    url = build_objects_url(config, collection_id, opts)
    headers = auth_headers(config) ++ [{"Accept", "application/stix+json;version=2.1"}]

    case PrismaticHttp.SecureClient.get(url, headers: headers) do
      {:ok, %{status: 200, body: body}} ->
        bundle = Jason.decode!(body)
        {:ok, bundle["objects"] || []}

      {:ok, %{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp build_objects_url(config, collection_id, opts) do
    base = "#{config.base_url}/#{config.api_root}/collections/#{collection_id}/objects/"
    params = build_query_params(opts)
    if params == "", do: base, else: "#{base}?#{params}"
  end

  defp build_query_params(opts) do
    opts
    |> Keyword.take([:added_after, :limit, :type])
    |> Enum.map(fn {k, v} -> "#{k}=#{v}" end)
    |> Enum.join("&")
  end

  defp auth_headers(%{auth: {:basic, user, pass}}) do
    encoded = Base.encode64("#{user}:#{pass}")
    [{"Authorization", "Basic #{encoded}"}]
  end

  defp auth_headers(%{auth: {:bearer, token}}) do
    [{"Authorization", "Bearer #{token}"}]
  end
end
```

### Feed Ingestion Pipeline

The platform processes TAXII feeds through a structured pipeline:

```elixir
defmodule PrismaticThreatIntel.FeedIngester do
  @moduledoc """
  Ingests STIX objects from TAXII feeds into the platform's
  signal system for NABLA epistemic processing.
  """

  alias PrismaticThreatIntel.{TaxiiClient, Stix.BundleParser}
  alias PrismaticNabla.Signal

  require Logger

  @spec ingest_feed(TaxiiClient.config(), String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def ingest_feed(config, collection_id, opts \\ []) do
    Logger.metadata(feed: collection_id, pipeline: "taxii_ingestion")
    Logger.info("Starting TAXII feed ingestion")

    with {:ok, objects} <- TaxiiClient.get_objects(config, collection_id, opts),
         {:ok, signals} <- convert_to_signals(objects),
         {:ok, count} <- store_signals(signals) do
      Logger.info("Feed ingestion completed", object_count: length(objects), signal_count: count)
      {:ok, %{objects_fetched: length(objects), signals_created: count}}
    else
      {:error, reason} ->
        Logger.error("Feed ingestion failed", error: inspect(reason))
        {:error, reason}
    end
  end

  defp convert_to_signals(objects) do
    json = Jason.encode!(%{"type" => "bundle", "id" => "bundle--temp", "objects" => objects})
    BundleParser.parse_bundle(json)
  end

  defp store_signals(signals) do
    stored = Enum.count(signals, fn signal ->
      case Signal.new(signal) do
        {:ok, s} ->
          PrismaticNabla.SignalStore.insert(s)
          true
        {:error, _} -> false
      end
    end)
    {:ok, stored}
  end
end
```

### Periodic Feed Polling

The platform schedules periodic TAXII feed polling:

```elixir
defmodule PrismaticThreatIntel.FeedScheduler do
  @moduledoc """
  Periodically polls configured TAXII feeds for new intelligence.
  Tracks last-fetched timestamps to request only new objects.
  """

  use GenServer

  defstruct feeds: %{}, last_fetched: %{}

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    feeds = Keyword.get(opts, :feeds, %{})
    schedule_polls(feeds)
    {:ok, %__MODULE__{feeds: feeds}}
  end

  @impl true
  def handle_info({:poll, feed_id}, state) do
    feed_config = state.feeds[feed_id]
    last = Map.get(state.last_fetched, feed_id)

    opts = if last, do: [added_after: DateTime.to_iso8601(last)], else: []

    case PrismaticThreatIntel.FeedIngester.ingest_feed(
      feed_config.taxii_config,
      feed_config.collection_id,
      opts
    ) do
      {:ok, _result} ->
        new_state = put_in(state.last_fetched[feed_id], DateTime.utc_now())
        schedule_poll(feed_id, feed_config.interval_ms)
        {:noreply, new_state}

      {:error, _reason} ->
        schedule_poll(feed_id, feed_config.interval_ms * 2)
        {:noreply, state}
    end
  end

  defp schedule_polls(feeds) do
    Enum.each(feeds, fn {id, config} -> schedule_poll(id, config.interval_ms) end)
  end

  defp schedule_poll(feed_id, interval) do
    Process.send_after(self(), {:poll, feed_id}, interval)
  end
end
```

## Architecture & Implementation

The TAXII integration follows the platform's standard patterns. The client module handles HTTP communication with SSRF protection. The ingestion pipeline converts external data to internal signals. The scheduler provides periodic polling with backoff on failure.

TAXII feeds are configured through application environment, enabling different feed configurations per deployment environment. Development environments may use public TAXII feeds for testing, while production environments connect to commercial and government-provided feeds.

The platform tracks ingestion state (last-fetched timestamps, object counts, error rates) in ETS for operational monitoring and in PostgreSQL for audit trails. This dual-storage approach ensures both real-time operational visibility and long-term compliance traceability.

## Usage in Prismatic Platform

TAXII feeds are consumed for threat intelligence enrichment:

```elixir
config = %{base_url: "https://taxii.example.com", api_root: "api1", auth: {:bearer, token}}
{:ok, collections} = PrismaticThreatIntel.TaxiiClient.list_collections(config)
{:ok, result} = PrismaticThreatIntel.FeedIngester.ingest_feed(config, "collection-123")
```

## Cross-References

- [STIX](/glossary/stix/) - Data format transported by TAXII
- [Threat Feed](/glossary/threat-feed/) - Intelligence stream delivered via TAXII
- [OSINT](/glossary/osint/) - Intelligence discipline consuming TAXII feeds
- [Signal](/glossary/signal/) - Platform-native format produced from TAXII data

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
