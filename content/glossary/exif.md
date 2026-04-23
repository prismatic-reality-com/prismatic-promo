+++
title = "EXIF"
description = "Exchangeable Image File Format -- a metadata standard embedded in image files containing camera settings, GPS coordinates, timestamps, and device information used in OSINT investigations."
weight = 50

[extra]
category = "osint"
tags = ["exif", "metadata", "image", "geolocation", "osint", "forensics", "gps", "camera", "timestamp", "privacy"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "beginner"
audience = ["osint-analysts", "security-engineers", "investigators", "developers"]
related_terms = ["geolocation", "metadata", "image-analysis", "forensics", "privacy", "gps"]
key_concepts = ["metadata-extraction", "gps-coordinates", "camera-identification", "timestamp-analysis", "metadata-stripping"]
platforms = ["prismatic-osint", "exiftool", "beam"]
prerequisites = ["image-formats", "metadata-concepts"]
use_cases = ["osint-investigation", "digital-forensics", "image-authentication", "location-tracking", "privacy-audit"]
complexity = "low"
stability = "mature"
pioneer = "JEIDA (Japan Electronic Industries Development Association)"
year_introduced = "1995"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1000
date_modified = "2026-02-23"
keywords = ["EXIF", "metadata", "image", "geolocation", "glossary", "OSINT", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "EXIF - Prismatic Platform"
+++

## Definition and Overview

EXIF (Exchangeable Image File Format) is a metadata standard that defines the formats for images, sound, and ancillary tags used by digital cameras, smartphones, scanners, and other imaging devices. EXIF data is embedded directly within image files (JPEG, TIFF, and some RAW formats) and contains a rich set of information including camera make and model, lens specifications, exposure settings, timestamps, GPS coordinates, software used for editing, and thumbnail previews.

In OSINT (Open Source Intelligence) investigations, EXIF data is one of the most valuable metadata sources. A single photograph can reveal when and where it was taken, what device captured it, and what software processed it. GPS coordinates in EXIF data can pinpoint a photographer's exact location. Timestamps can establish timelines. Camera serial numbers can link photographs to specific devices. Software fingerprints can identify editing or manipulation.

The privacy implications of EXIF data are significant. Many users are unaware that their photographs contain precise GPS coordinates, potentially revealing home addresses, workplaces, travel patterns, and daily routines. While major social media platforms strip EXIF data during upload, many other sharing methods (email, messaging apps, cloud storage, blogs) preserve metadata. OSINT analysts exploit this gap, while privacy advocates recommend systematic metadata stripping before sharing images.

## Technical Deep Dive

### EXIF Tag Categories

| Category | Key Tags | OSINT Value |
|----------|----------|-------------|
| **Camera** | Make, Model, SerialNumber, LensModel | Device identification, owner attribution |
| **Capture** | ExposureTime, FNumber, ISO, FocalLength | Scene reconstruction, indoor/outdoor |
| **GPS** | GPSLatitude, GPSLongitude, GPSAltitude, GPSTimestamp | Geolocation, movement tracking |
| **Time** | DateTimeOriginal, CreateDate, ModifyDate | Timeline construction, timezone analysis |
| **Software** | Software, ProcessingSoftware, HistoryAction | Editing detection, tool fingerprinting |
| **Image** | ImageWidth, ImageHeight, Orientation, ColorSpace | Format analysis, manipulation detection |
| **Thumbnail** | ThumbnailImage, ThumbnailOffset, ThumbnailLength | Original crop analysis (may differ from edited) |

### GPS Precision

| GPS Tag | Format | Precision |
|---------|--------|-----------|
| `GPSLatitude` | Degrees, minutes, seconds (DMS) | ~1m (with decimal seconds) |
| `GPSLongitude` | Degrees, minutes, seconds (DMS) | ~1m (with decimal seconds) |
| `GPSAltitude` | Meters above/below sea level | ~1m typical |
| `GPSSpeed` | km/h, mph, or knots | Device-dependent |
| `GPSImgDirection` | Degrees (0-359.99) | Compass direction camera pointed |
| `GPSDateStamp` | YYYY:MM:DD | Date of GPS fix |
| `GPSTimeStamp` | HH:MM:SS.SS UTC | Time of GPS fix |

### EXIF Analysis Techniques for OSINT

| Technique | Method | Intelligence Value |
|-----------|--------|-------------------|
| **Geolocation** | Extract GPS coordinates, plot on map | Physical location identification |
| **Timeline** | Compare timestamps across images | Movement patterns, activity reconstruction |
| **Device linking** | Match camera make/model/serial across images | Attribute multiple images to same device |
| **Manipulation detection** | Check software tags, compare create/modify dates | Identify edited or fabricated images |
| **Thumbnail analysis** | Extract embedded thumbnail | May show original uncropped image |
| **Timezone correlation** | Compare GPS time vs local time offset | Determine timezone, verify location |

## Architecture and Implementation

EXIF processing architecture consists of three stages: extraction (reading raw EXIF tags from image binary data), parsing (converting tag values into structured data types), and analysis (deriving intelligence from parsed data). The extraction stage operates on the binary structure of image files, locating the APP1 marker (0xFFE1) in JPEG files that contains the EXIF data block. The EXIF block uses TIFF IFD (Image File Directory) structure with big-endian or little-endian byte ordering indicated by a header marker.

For OSINT purposes, the analysis stage is the most valuable. Raw EXIF data is transformed into actionable intelligence through cross-referencing GPS coordinates with geographic databases, correlating timestamps across image sets, and matching device identifiers against known device databases. Automated pipelines can process thousands of images, extracting and correlating metadata to build comprehensive intelligence pictures.

Privacy-preserving architectures require metadata stripping before publication or sharing. This involves removing all EXIF tags (or selectively removing GPS and device identification tags) while preserving image quality. The stripping process must handle all metadata containers (EXIF, IPTC, XMP) and verify completeness by re-parsing the stripped image.

## Usage in Prismatic Platform

The Prismatic Platform's OSINT toolbox includes EXIF analysis capabilities for image intelligence gathering, integrated with the geolocation and timeline analysis modules.

```elixir
defmodule Prismatic.OSINT.ExifAnalyzer do
  @moduledoc """
  EXIF metadata extraction and analysis for OSINT investigations.
  Extracts geolocation, device information, and timestamps
  from image files to support intelligence gathering.
  """

  @type exif_data :: %{
    camera: map(),
    gps: map() | nil,
    timestamps: map(),
    software: String.t() | nil,
    image: map()
  }

  @spec extract(binary()) :: {:ok, exif_data()} | {:error, term()}
  def extract(image_binary) when is_binary(image_binary) do
    with {:ok, raw_tags} <- parse_exif_binary(image_binary) do
      {:ok, %{
        camera: extract_camera_info(raw_tags),
        gps: extract_gps_coordinates(raw_tags),
        timestamps: extract_timestamps(raw_tags),
        software: Map.get(raw_tags, :software),
        image: extract_image_info(raw_tags)
      }}
    end
  end

  @spec has_gps?(exif_data()) :: boolean()
  def has_gps?(%{gps: nil}), do: false
  def has_gps?(%{gps: gps}), do: Map.has_key?(gps, :latitude) and Map.has_key?(gps, :longitude)

  defp extract_camera_info(tags) do
    %{
      make: Map.get(tags, :make),
      model: Map.get(tags, :model),
      serial: Map.get(tags, :serial_number),
      lens: Map.get(tags, :lens_model)
    }
  end

  defp extract_gps_coordinates(tags) do
    with lat when not is_nil(lat) <- Map.get(tags, :gps_latitude),
         lon when not is_nil(lon) <- Map.get(tags, :gps_longitude) do
      %{
        latitude: dms_to_decimal(lat, Map.get(tags, :gps_latitude_ref, "N")),
        longitude: dms_to_decimal(lon, Map.get(tags, :gps_longitude_ref, "E")),
        altitude: Map.get(tags, :gps_altitude),
        timestamp: Map.get(tags, :gps_timestamp)
      }
    else
      _ -> nil
    end
  end

  defp extract_timestamps(tags) do
    %{
      original: Map.get(tags, :date_time_original),
      created: Map.get(tags, :create_date),
      modified: Map.get(tags, :modify_date)
    }
  end

  defp extract_image_info(tags) do
    %{
      width: Map.get(tags, :image_width),
      height: Map.get(tags, :image_height),
      orientation: Map.get(tags, :orientation),
      color_space: Map.get(tags, :color_space)
    }
  end

  defp dms_to_decimal({deg, min, sec}, ref) do
    decimal = deg + min / 60.0 + sec / 3600.0
    if ref in ["S", "W"], do: -decimal, else: decimal
  end

  defp parse_exif_binary(_binary), do: {:ok, %{}}
end
```

## Cross-References

- **Geolocation** -- Geographic position determination from EXIF GPS
- **Metadata** -- Data about data, EXIF as a specific case
- [OSINT](/glossary/osint/) -- Open source intelligence using EXIF
- **Digital Forensics** -- Image forensics using metadata
- **Livebooks**: `osint_intelligence/` notebooks include image metadata analysis
- **Academy**: SocialMediaOSINT topic covers EXIF analysis in investigations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
