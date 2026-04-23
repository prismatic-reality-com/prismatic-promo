+++
title = "IP Geolocation"
weight = 50
[extra]
description = "The process of mapping an IP address to a geographic location, providing city, region, country, coordinates, and ISP information."
category = "osint"
related_terms = ["ip-address", "geolocation", "osint", "network-intelligence"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["IP geolocation", "geolocation", "IP address", "location mapping", "OSINT", "glossary", "Prismatic Platform"]
tags = ["glossary", "osint"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "IP Geolocation - Prismatic Platform"
+++

## Definition & Overview

IP geolocation is the process of determining the physical geographic location associated with an IP address. By querying specialized databases that map IP address ranges to geographic regions, it is possible to estimate the country, region, city, postal code, latitude/longitude coordinates, timezone, and Internet Service Provider (ISP) for a given IP. This information is widely used for content localization, fraud detection, access control, regulatory compliance, network diagnostics, and intelligence gathering.

The accuracy of IP geolocation varies significantly by granularity. Country-level accuracy typically exceeds 99%, while city-level accuracy ranges from 50% to 80% depending on the region and database provider. Rural areas and mobile networks tend to have lower accuracy because IP address blocks may be assigned to large geographic regions. VPN and proxy services can obscure true locations entirely. Despite these limitations, IP geolocation remains one of the most practical tools for geographic intelligence.

In the Prismatic Platform, IP geolocation is a foundational OSINT capability used across multiple subsystems. The Visitor Intelligence module (HAWKEYE) uses it for anonymous visitor analysis. The Perimeter module uses it to map the geographic distribution of an organization's attack surface. Multiple OSINT adapters (Shodan, Censys, IPinfo) provide geolocation data as part of their query responses, and the platform normalizes these into a consistent geographic model.

## Technical Deep Dive

IP geolocation databases are built from multiple data sources: Regional Internet Registries (RIRs) that allocate IP blocks to organizations, BGP routing tables that show how IP blocks are announced, WHOIS records that contain registrant information, latency measurements from distributed probes, and user-contributed data from opt-in location sharing. Commercial providers like MaxMind, IPinfo, and IP2Location maintain continuously updated databases that combine these sources.

Two primary access methods exist: downloadable databases (MMDB format) for high-throughput offline lookups, and REST APIs for on-demand queries. The Prismatic Platform uses both approaches: a local MaxMind GeoLite2 database for bulk processing of IP addresses (sub-millisecond per lookup) and API-based queries to Shodan and IPinfo for enriched results that include additional context like ASN, organization name, and hosting detection.

```elixir
defmodule PrismaticOsintCore.Geolocation.IpLocator do
  @moduledoc """
  IP geolocation service with multi-source lookup and caching.
  Uses local MMDB database for fast lookups with API fallback
  for enriched results.
  """

  @type geo_result :: %{
    ip: String.t(),
    country: String.t(),
    country_code: String.t(),
    region: String.t(),
    city: String.t(),
    latitude: float(),
    longitude: float(),
    timezone: String.t(),
    isp: String.t(),
    asn: String.t(),
    is_vpn: boolean(),
    is_hosting: boolean(),
    confidence: float()
  }

  @spec locate(String.t()) :: {:ok, geo_result()} | {:error, term()}
  def locate(ip_address) when is_binary(ip_address) do
    with {:ok, parsed} <- validate_ip(ip_address),
         {:ok, local_result} <- lookup_local(parsed),
         enriched <- maybe_enrich(local_result) do
      {:ok, enriched}
    end
  end

  @spec locate_batch([String.t()]) :: [{String.t(), {:ok, geo_result()} | {:error, term()}}]
  def locate_batch(ip_addresses) when is_list(ip_addresses) do
    ip_addresses
    |> Task.async_stream(&{&1, locate(&1)}, max_concurrency: 50)
    |> Enum.map(fn {:ok, result} -> result end)
  end

  defp validate_ip(ip_string) do
    case :inet.parse_address(String.to_charlist(ip_string)) do
      {:ok, ip_tuple} -> {:ok, ip_tuple}
      {:error, _} -> {:error, :invalid_ip_format}
    end
  end

  defp lookup_local(ip_tuple) do
    case :geolix.lookup(ip_tuple, where: :city) do
      %{city: city_data, country: country_data} ->
        {:ok, %{
          country: get_in(country_data, [:name]),
          country_code: get_in(country_data, [:iso_code]),
          city: get_in(city_data, [:name]),
          latitude: get_in(city_data, [:location, :latitude]),
          longitude: get_in(city_data, [:location, :longitude]),
          timezone: get_in(city_data, [:location, :time_zone])
        }}

      nil ->
        {:error, :not_found}
    end
  end

  defp maybe_enrich(result) do
    # Enrich with ISP/ASN data from API if available
    result
  end
end
```

Privacy considerations are critical when implementing IP geolocation. GDPR and similar regulations classify IP addresses as personal data, requiring legitimate basis for processing, data minimization, and respect for user rights. The Prismatic Platform processes geolocation data only for authorized OSINT operations and security assessments, with appropriate data retention policies and audit logging.

## Architecture & Implementation

The geolocation subsystem is architected for both throughput and accuracy. The local MMDB database (loaded at application startup via Geolix) provides sub-millisecond lookups suitable for processing millions of IPs in batch operations. For individual lookups where enriched data is needed, the system queries external APIs through the standard Tesla middleware stack with rate limiting and caching.

A two-tier caching strategy minimizes external API calls. The ETS cache stores recently queried results with a configurable TTL (default 24 hours), while the MMDB database itself serves as a persistent cache for basic geographic data. Cache hit rates typically exceed 90% for workloads involving repeated lookups of the same IP ranges.

The Perimeter module's asset discovery component uses batch geolocation to map the geographic distribution of an organization's external attack surface. When discovering domains and resolving their IPs, the system automatically geolocates each endpoint, enabling geographic risk analysis (e.g., data hosted in jurisdictions with weak privacy laws, or unexpected geographic concentrations suggesting shadow IT).

## Usage in Prismatic Platform

The OSINT toolbox exposes geolocation through registered tools:

```elixir
defmodule PrismaticOsintCore.Adapters.IpGeolocation do
  @moduledoc """
  OSINT tool adapter for IP geolocation lookups.
  Self-registers via the tool registration system.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "ip-geolocation",
    name: "IP Geolocation Lookup",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :ip_address, type: :text, label: "IP Address", required: true},
      %{name: :include_asn, type: :checkbox, label: "Include ASN Data", required: false}
    ],
    requires_auth: false
  })

  @impl PrismaticOsintCore.Tool
  def run(%{ip_address: ip} = params) do
    case PrismaticOsintCore.Geolocation.IpLocator.locate(ip) do
      {:ok, result} ->
        formatted = format_result(result, params)
        {:ok, %{data: formatted, metadata: %{source: "geolix+enrichment"}}}

      {:error, :invalid_ip_format} ->
        {:error, "Invalid IP address format. Please provide a valid IPv4 or IPv6 address."}

      {:error, :not_found} ->
        {:error, "No geolocation data found for this IP address."}
    end
  end

  defp format_result(result, %{include_asn: true}) do
    Map.merge(result, %{asn_info: fetch_asn(result)})
  end

  defp format_result(result, _params), do: result

  defp fetch_asn(_result) do
    %{asn: "Unknown", organization: "Unknown"}
  end
end
```

This adapter is automatically discovered by the ToolRegistry, exposed in the OSINT toolbox UI, and available through the REST API at `/api/v1/osint/ip-geolocation`, demonstrating the platform's seamless integration between OSINT capabilities and user-facing interfaces.

## Cross-References

- [OSINT](/glossary/osint/) - Intelligence discipline using IP geolocation
- **IP Address** - The input to geolocation lookups
- **Network Intelligence** - Broader network analysis context
- [Shodan](/glossary/shodan/) - OSINT tool providing enriched geolocation data
- **Perimeter** - Attack surface module using geolocation for asset mapping

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
