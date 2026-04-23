+++
title = "Geolocation"
description = "The process of determining the geographic position of a device, IP address, or entity using GPS, network signals, IP databases, or OSINT data for intelligence analysis and asset mapping."
weight = 50

[extra]
category = "osint"
tags = ["geolocation", "gps", "ip-geolocation", "osint", "location", "mapping", "coordinates", "gis", "maxmind", "lat-lon"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["osint-analysts", "developers", "security-engineers", "investigators"]
related_terms = ["exif", "ip-address", "gps", "mapping", "gis", "asset-discovery", "reconnaissance"]
key_concepts = ["ip-geolocation", "gps-coordinates", "cell-tower-triangulation", "wifi-positioning", "geocoding"]
platforms = ["prismatic-osint", "maxmind", "beam", "geoip"]
prerequisites = ["networking-basics", "gps-fundamentals", "osint-basics"]
use_cases = ["asset-mapping", "threat-geolocation", "osint-investigation", "compliance-jurisdiction", "network-attribution"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Geolocation", "GPS", "IP geolocation", "glossary", "OSINT", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Geolocation - Prismatic Platform"
+++

## Definition and Overview

Geolocation is the identification or estimation of the real-world geographic location of an object, device, or network entity. In cybersecurity and OSINT contexts, geolocation serves multiple purposes: mapping an organization's infrastructure assets to physical locations, determining the geographic origin of network attacks, verifying claimed locations of entities under investigation, and establishing jurisdictional relevance for compliance analysis.

Multiple technical methods exist for determining geographic position, each with different precision levels, requirements, and applicability. GPS (Global Positioning System) provides meter-level accuracy for devices with GPS receivers. IP geolocation uses databases mapping IP address ranges to geographic areas, typically accurate to city level. Cell tower triangulation and WiFi positioning provide intermediate accuracy for mobile devices. EXIF metadata embedded in photographs can contain precise GPS coordinates. Social media analysis, address records, and domain registration data provide entity-level geolocation through OSINT methods.

The reliability and precision of geolocation data vary dramatically by method. GPS coordinates in EXIF data can pinpoint a location to within meters. IP geolocation for fixed infrastructure (data centers, offices) is typically accurate to city level. IP geolocation for mobile or VPN-using entities can be wildly inaccurate, sometimes placing the entity in an entirely wrong country. Understanding the precision and limitations of each geolocation method is critical for intelligence analysis -- overconfident geolocation claims can lead to incorrect attribution and misguided response actions.

## Technical Deep Dive

### Geolocation Methods

| Method | Precision | Requirements | OSINT Relevance |
|--------|-----------|-------------|----------------|
| **GPS/GNSS** | 1-5 meters | GPS receiver | EXIF extraction, mobile device tracking |
| **IP Geolocation** | City level (~10-50 km) | IP address only | Server location, attack origin |
| **Cell Tower** | 100-1000 meters | Cell network metadata | Mobile device location |
| **WiFi Positioning** | 10-50 meters | WiFi AP database (e.g., Google) | Indoor/urban location |
| **Address Geocoding** | Building level | Street address | Entity physical location |
| **Reverse Geocoding** | N/A (coordinate to address) | Lat/lon coordinates | Converting GPS to address |
| **Social Media** | Varies | User posts, check-ins | Activity location patterns |
| **Domain WHOIS** | Organization level | Domain name | Registrant location |

### IP Geolocation Databases

| Database | Coverage | Update Frequency | Accuracy |
|----------|----------|-----------------|----------|
| **MaxMind GeoLite2** | Global | Weekly | ~80% city-level |
| **MaxMind GeoIP2** | Global | Continuous | ~90% city-level |
| **IP2Location** | Global | Monthly | ~85% city-level |
| **DB-IP** | Global | Monthly | ~80% city-level |
| **RIPE NCC** | European | Real-time (API) | Registry-level |

### Coordinate Systems

| System | Format | Example | Use Case |
|--------|--------|---------|----------|
| **WGS 84** | Decimal degrees | 50.0755, 14.4378 | GPS, mapping APIs |
| **DMS** | Degrees/minutes/seconds | 50d04'31.8"N, 14d26'16.1"E | EXIF, traditional navigation |
| **UTM** | Zone + easting/northing | 33U 458123 5546789 | Military, surveying |
| **MGRS** | Grid reference | 33UUQ 58123 46789 | Military communication |
| **Plus Codes** | Open Location Code | 9F2P8Q2W+V7 | Universal addressing |

## Architecture and Implementation

Geolocation architecture in intelligence platforms consists of three layers: data collection (gathering location signals from IP databases, EXIF data, WHOIS records, and social media), resolution (converting raw signals into standardized coordinates with precision estimates), and analysis (mapping, clustering, and correlating geographic data for intelligence production).

The collection layer interfaces with multiple data sources. IP geolocation uses offline MaxMind database lookups (GeoLite2 or GeoIP2) for high-throughput server-side resolution without external API calls. EXIF geolocation extracts GPS tags from image files. Address geocoding uses external APIs (Nominatim, Google Maps Geocoding) to convert street addresses to coordinates.

The resolution layer standardizes all location data into WGS 84 decimal degree coordinates with associated precision estimates. A GPS coordinate from EXIF carries a precision of ~5 meters, while an IP geolocation result carries a precision of ~50 kilometers. These precision estimates are critical for downstream analysis -- merging a 5-meter GPS fix with a 50-kilometer IP estimate requires understanding that the two signals have fundamentally different reliability levels.

## Usage in Prismatic Platform

The Prismatic Platform integrates geolocation into the OSINT toolbox for asset mapping, the Perimeter module for attack surface geographic distribution, and the DD pipeline for entity location verification.

```elixir
defmodule Prismatic.OSINT.Geolocation do
  @moduledoc """
  Multi-method geolocation resolution for OSINT investigations.
  Combines IP geolocation, EXIF extraction, and address
  geocoding with precision tracking for each method.
  """

  @type coordinates :: %{
    latitude: float(),
    longitude: float(),
    precision_meters: float(),
    method: atom(),
    confidence: float()
  }

  @spec geolocate_ip(String.t()) :: {:ok, coordinates()} | {:error, term()}
  def geolocate_ip(ip_address) do
    case :locus.lookup(:geoip_db, ip_address) do
      {:ok, %{location: %{latitude: lat, longitude: lon}, city: city}} ->
        {:ok, %{
          latitude: lat,
          longitude: lon,
          precision_meters: 50_000.0,
          method: :ip_geolocation,
          confidence: 0.7,
          metadata: %{city: city, ip: ip_address}
        }}

      {:error, reason} ->
        {:error, {:geolocation_failed, reason}}
    end
  end

  @spec geolocate_address(String.t()) :: {:ok, coordinates()} | {:error, term()}
  def geolocate_address(address) do
    case geocode_via_nominatim(address) do
      {:ok, %{lat: lat, lon: lon}} ->
        {:ok, %{
          latitude: lat,
          longitude: lon,
          precision_meters: 100.0,
          method: :address_geocoding,
          confidence: 0.85,
          metadata: %{address: address}
        }}

      {:error, reason} ->
        {:error, {:geocoding_failed, reason}}
    end
  end

  @spec merge_locations(list(coordinates())) :: coordinates()
  def merge_locations(locations) do
    best = Enum.min_by(locations, & &1.precision_meters)

    %{best |
      confidence: calculate_merged_confidence(locations),
      method: :merged
    }
  end

  defp calculate_merged_confidence(locations) do
    locations
    |> Enum.map(& &1.confidence)
    |> then(fn confs -> 1.0 - Enum.reduce(confs, 1.0, fn c, acc -> acc * (1.0 - c) end) end)
    |> min(0.99)
  end

  defp geocode_via_nominatim(_address), do: {:error, :not_configured}
end
```

The Perimeter module's asset discovery uses IP geolocation to map an organization's external infrastructure on a world map, highlighting geographic concentration risks and jurisdictional exposure. The OSINT toolbox integrates geolocation into investigation workflows, automatically resolving IP addresses and extracting EXIF coordinates from collected images.

## Cross-References

- [EXIF](/glossary/exif/) -- Image metadata containing GPS coordinates
- **IP Address** -- Network address for IP geolocation
- **Asset Discovery** -- Infrastructure mapping using geolocation
- **Reconnaissance** -- OSINT phase using geolocation
- **Livebooks**: `osint_intelligence/` notebooks demonstrate geolocation workflows
- **Academy**: SocialMediaOSINT topic covers geolocation in investigations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
