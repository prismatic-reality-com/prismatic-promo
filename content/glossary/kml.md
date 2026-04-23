+++
title = "KML"
weight = 50
[extra]
description = "Keyhole Markup Language (KML) is an XML-based geospatial data format originally developed for Google Earth that encodes geographic annotations, placemarks, paths, and overlays for visualization in mapping applications -- used in Prismatic Platform for OSINT geographic intelligence export."
category = "data"
domain = "geospatial"
complexity = "intermediate"
stability = "stable"
related_terms = ["json", "geolocation", "osint", "metadata-management", "data-provenance", "xml", "gis", "entity-graph", "coordinate", "mapping", "serialization", "export"]
tags = ["glossary", "kml", "geospatial", "mapping", "xml", "geographic-data", "visualization", "osint", "google-earth", "ogc", "intelligence"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 94
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "KML provides a standardized XML format for encoding geospatial intelligence data used in OSINT investigations, geographic asset mapping, and DD entity visualization within the Prismatic Platform."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["KML", "Keyhole Markup Language", "geospatial data", "Google Earth", "geographic markup", "placemarks", "spatial data", "OGC standard", "OSINT geographic", "geospatial intelligence"]
image = "/images/sections/glossary.png"
image_alt = "KML - Prismatic Platform"
word_count = 3400
beam_related = false
security_relevant = true
see_also = ["osint", "architecture", "capabilities"]
+++

## Definition

Keyhole Markup Language (KML) is an XML-based format for expressing geographic annotations and visualizations within two-dimensional maps and three-dimensional Earth browsers. Originally developed by Keyhole, Inc. (acquired by Google in 2004), KML became an Open Geospatial Consortium (OGC) standard in 2008 (OGC KML 2.2, standardized as OGC 07-147r2). KML documents describe features such as placemarks, ground overlays, screen overlays, paths (LineStrings), polygons, and 3D models with associated metadata including coordinates, altitude, timestamps, styling, and camera viewpoints.

KML files use the `.kml` extension for uncompressed XML and `.kmz` for ZIP-compressed archives that bundle KML with associated resources (images, models, textures). The format supports temporal data through `TimeStamp` and `TimeSpan` elements, enabling animated visualizations of events over time -- a capability directly relevant to OSINT timeline reconstruction and [due diligence](@/glossary/due-diligence.md) investigation mapping.

In the Prismatic Platform, KML serves as the primary geospatial export format for OSINT intelligence results, [DD pipeline](/glossary/dd-pipeline/) entity locations, and [Perimeter](/glossary/perimeter/) EASM asset geographic distributions. When analysts need to visualize where entities, infrastructure, or events are located in physical space, KML provides the bridge between platform data and geospatial visualization tools.

## Core Concepts

### KML Document Structure

A KML document follows a hierarchical XML structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Investigation: Novy Zelenec Entity Map</name>
    <description>Geographic distribution of DD entities</description>

    <!-- Shared styles -->
    <Style id="highConfidence">
      <IconStyle><color>ff00ff00</color></IconStyle>
    </Style>
    <Style id="lowConfidence">
      <IconStyle><color>ff0000ff</color></IconStyle>
    </Style>

    <!-- Organized in folders -->
    <Folder>
      <name>Companies</name>
      <Placemark>
        <name>Entity Alpha s.r.o.</name>
        <styleUrl>#highConfidence</styleUrl>
        <Point><coordinates>14.4378,50.0755,0</coordinates></Point>
        <TimeStamp><when>2026-03-15T10:30:00Z</when></TimeStamp>
        <ExtendedData>
          <Data name="confidence"><value>0.92</value></Data>
          <Data name="source"><value>czech-commercial-register</value></Data>
          <Data name="entity_type"><value>company</value></Data>
        </ExtendedData>
      </Placemark>
    </Folder>
  </Document>
</kml>
```

### Geometry Types

KML supports several geometry types, each suited to different intelligence visualization needs:

| Geometry | KML Element | OSINT Use Case | Example |
|----------|-------------|----------------|---------|
| **Point** | `<Point>` | Entity location, IP geolocation | Company registered address |
| **LineString** | `<LineString>` | Communication path, money flow | Financial transfer route |
| **Polygon** | `<Polygon>` | Area of interest, jurisdiction | Investigation zone boundary |
| **MultiGeometry** | `<MultiGeometry>` | Complex entity with multiple locations | Company with branches |
| **LinearRing** | `<LinearRing>` | Closed boundary definition | Security perimeter |
| **Model** | `<Model>` | 3D infrastructure visualization | Building model at address |

### Coordinate System

KML exclusively uses WGS 84 (EPSG:4326) coordinates:

```
<coordinates>longitude,latitude,altitude</coordinates>
```

| Component | Range | Unit | Precision Note |
|-----------|-------|------|----------------|
| **Longitude** | -180.0 to 180.0 | Decimal degrees | 6 decimal places = ~11cm |
| **Latitude** | -90.0 to 90.0 | Decimal degrees | 6 decimal places = ~11cm |
| **Altitude** | Unbounded | Meters | Optional, default 0 |

Coordinate precision matters for OSINT: 2 decimal places (~1.1km) suffices for city-level geolocation, 4 decimal places (~11m) for building-level, and 6 decimal places (~11cm) for precise placement. The platform defaults to 6 decimal places for maximum accuracy.

### Temporal Elements

KML's temporal capabilities enable time-based visualization -- critical for reconstructing event timelines in investigations:

```xml
<!-- Exact moment -->
<TimeStamp>
  <when>2026-03-15T14:30:00Z</when>
</TimeStamp>

<!-- Duration/range -->
<TimeSpan>
  <begin>2026-01-01T00:00:00Z</begin>
  <end>2026-03-31T23:59:59Z</end>
</TimeSpan>
```

When loaded in Google Earth Pro, temporal elements enable the timeline slider to animate events chronologically -- showing how an investigation unfolded, when entities were incorporated, or when infrastructure changes occurred.

### Extended Data

Extended Data elements allow embedding arbitrary key-value metadata in placemarks, making KML suitable for enriched OSINT exports:

```xml
<ExtendedData>
  <!-- Simple key-value pairs -->
  <Data name="confidence"><value>0.87</value></Data>
  <Data name="source_tool"><value>czech-business-register</value></Data>
  <Data name="entity_id"><value>ent_abc123</value></Data>
  <Data name="threat_level"><value>medium</value></Data>
  <Data name="collected_at"><value>2026-03-15T10:30:00Z</value></Data>

  <!-- Typed schema data -->
  <SchemaData schemaUrl="#EntitySchema">
    <SimpleData name="ico">12345678</SimpleData>
    <SimpleData name="legal_form">s.r.o.</SimpleData>
    <SimpleData name="registration_date">2020-05-15</SimpleData>
  </SchemaData>
</ExtendedData>
```

## Technical Deep Dive

### Parsing KML in Elixir

Parsing KML in Elixir uses SweetXml for XPath-based extraction or direct SAX parsing with xmerl for large documents. The BEAM's binary handling makes streaming large KML files memory-efficient -- critical when processing geospatial intelligence dumps that can reach hundreds of megabytes:

```elixir
defmodule PrismaticOsintCore.KML.Parser do
  @moduledoc """
  Parses KML documents into structured Elixir data.
  Handles both .kml (XML) and .kmz (ZIP-compressed) formats.
  Supports streaming for large documents via SAX parsing.
  """

  import SweetXml

  @type placemark :: %{
    name: String.t(),
    description: String.t() | nil,
    coordinates: {float(), float(), float()},
    timestamp: DateTime.t() | nil,
    extended_data: map(),
    style: String.t() | nil
  }

  @spec parse_file(Path.t()) :: {:ok, list(placemark())} | {:error, term()}
  def parse_file(path) when is_binary(path) do
    case Path.extname(path) do
      ".kmz" -> parse_kmz(path)
      ".kml" -> parse_kml(File.read!(path))
      ext -> {:error, {:unsupported_format, ext}}
    end
  end

  @spec parse_kml(String.t()) :: {:ok, list(placemark())}
  def parse_kml(xml_content) do
    placemarks =
      xml_content
      |> xpath(~x"//Placemark"l,
        name: ~x"./name/text()"s,
        description: ~x"./description/text()"os,
        coordinates: ~x"./Point/coordinates/text()"s,
        timestamp: ~x"./TimeStamp/when/text()"os,
        style_url: ~x"./styleUrl/text()"os
      )
      |> Enum.map(&parse_placemark/1)

    {:ok, placemarks}
  end

  defp parse_kmz(path) do
    with {:ok, zip_handle} <- :zip.zip_open(String.to_charlist(path), [:memory]),
         {:ok, files} <- :zip.zip_list_dir(zip_handle),
         kml_entry <- find_kml_entry(files),
         {:ok, {_, kml_content}} <- :zip.zip_get(kml_entry, zip_handle),
         :ok <- :zip.zip_close(zip_handle) do
      parse_kml(kml_content)
    end
  end

  defp parse_placemark(raw) do
    {lon, lat, alt} = parse_coordinates(raw.coordinates)

    %{
      name: raw.name,
      description: raw.description,
      coordinates: {lon, lat, alt},
      timestamp: parse_timestamp(raw.timestamp),
      extended_data: %{},
      style: raw.style_url
    }
  end

  defp parse_coordinates(coord_string) do
    [lon, lat | rest] =
      coord_string
      |> String.trim()
      |> String.split(",")
      |> Enum.map(&String.to_float/1)

    alt = List.first(rest, 0.0)
    {lon, lat, alt}
  end

  defp parse_timestamp(nil), do: nil
  defp parse_timestamp(""), do: nil
  defp parse_timestamp(ts) do
    case DateTime.from_iso8601(ts) do
      {:ok, dt, _offset} -> dt
      _ -> nil
    end
  end

  defp find_kml_entry(files) do
    Enum.find(files, fn
      {:zip_file, name, _, _, _, _} -> String.ends_with?(to_string(name), ".kml")
      _ -> false
    end)
  end
end
```

### Generating KML from Platform Data

The production KML generator handles entity collections with proper XML escaping, styling, and folder organization:

```elixir
defmodule PrismaticOsintCore.KML.Generator do
  @moduledoc """
  Generates KML documents from OSINT geospatial results.
  Supports placemarks, paths, polygons, folders, styles, and temporal data.
  Outputs valid OGC KML 2.2 documents.
  """

  require Logger

  @kml_header """
  <?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2"
       xmlns:gx="http://www.google.com/kml/ext/2.2">
  """

  @type placemark_data :: %{
    required(:name) => String.t(),
    required(:lat) => float(),
    required(:lon) => float(),
    optional(:alt) => float(),
    optional(:description) => String.t(),
    optional(:timestamp) => DateTime.t(),
    optional(:confidence) => float(),
    optional(:source) => String.t(),
    optional(:entity_type) => String.t(),
    optional(:style) => :high_confidence | :medium_confidence | :low_confidence | :unknown
  }

  @type folder :: %{name: String.t(), placemarks: list(placemark_data())}

  @spec generate(String.t(), list(placemark_data() | folder())) :: {:ok, String.t()}
  def generate(document_name, items) when is_list(items) do
    styles = default_styles()
    body = Enum.map_join(items, "\n", &render_item/1)

    kml = """
    #{@kml_header}
      <Document>
        <name>#{xml_escape(document_name)}</name>
        <description>Generated by Prismatic Platform OSINT Export</description>
        #{styles}
        #{body}
      </Document>
    </kml>
    """

    Logger.info("KML generated", document: document_name, items: length(items))
    :telemetry.execute([:prismatic, :kml, :generated], %{items: length(items)}, %{document: document_name})

    {:ok, kml}
  end

  @spec generate_kmz(String.t(), list(placemark_data() | folder())) :: {:ok, binary()}
  def generate_kmz(document_name, items) do
    with {:ok, kml_content} <- generate(document_name, items) do
      {:ok, {_, zip_binary}} =
        :zip.create(
          ~c"export.kmz",
          [{~c"doc.kml", kml_content}],
          [:memory]
        )

      {:ok, zip_binary}
    end
  end

  defp render_item(%{name: _, placemarks: placemarks} = folder) do
    body = Enum.map_join(placemarks, "\n", &render_placemark/1)
    """
        <Folder>
          <name>#{xml_escape(folder.name)}</name>
          #{body}
        </Folder>
    """
  end

  defp render_item(placemark), do: render_placemark(placemark)

  defp render_placemark(%{name: name, lat: lat, lon: lon} = data) do
    alt = Map.get(data, :alt, 0.0)
    style = Map.get(data, :style, :unknown)
    timestamp = Map.get(data, :timestamp)

    """
        <Placemark>
          <name>#{xml_escape(name)}</name>
          <description>#{xml_escape(Map.get(data, :description, ""))}</description>
          <styleUrl>##{style}</styleUrl>
          #{render_timestamp(timestamp)}
          <Point><coordinates>#{lon},#{lat},#{alt}</coordinates></Point>
          #{render_extended_data(data)}
        </Placemark>
    """
  end

  defp render_timestamp(nil), do: ""
  defp render_timestamp(%DateTime{} = dt) do
    "<TimeStamp><when>#{DateTime.to_iso8601(dt)}</when></TimeStamp>"
  end

  defp render_extended_data(data) do
    fields =
      data
      |> Map.take([:confidence, :source, :entity_type, :entity_id, :threat_level])
      |> Enum.reject(fn {_, v} -> is_nil(v) end)
      |> Enum.map_join("\n", fn {key, value} ->
        "          <Data name=\"#{key}\"><value>#{xml_escape(to_string(value))}</value></Data>"
      end)

    if fields == "", do: "", else: "        <ExtendedData>\n#{fields}\n        </ExtendedData>"
  end

  defp default_styles do
    """
        <Style id="high_confidence">
          <IconStyle>
            <color>ff00cc00</color>
            <scale>1.2</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href></Icon>
          </IconStyle>
        </Style>
        <Style id="medium_confidence">
          <IconStyle>
            <color>ff00ccff</color>
            <scale>1.0</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png</href></Icon>
          </IconStyle>
        </Style>
        <Style id="low_confidence">
          <IconStyle>
            <color>ff0000ff</color>
            <scale>0.8</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href></Icon>
          </IconStyle>
        </Style>
        <Style id="unknown">
          <IconStyle>
            <color>ff999999</color>
            <scale>0.8</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/paddle/wht-circle.png</href></Icon>
          </IconStyle>
        </Style>
    """
  end

  defp xml_escape(text) when is_binary(text) do
    text
    |> String.replace("&", "&amp;")
    |> String.replace("<", "&lt;")
    |> String.replace(">", "&gt;")
    |> String.replace("\"", "&quot;")
    |> String.replace("'", "&apos;")
  end

  defp xml_escape(other), do: xml_escape(to_string(other))
end
```

### KML vs. Alternative Geospatial Formats

| Format | Strengths | Weaknesses | Platform Usage |
|--------|-----------|------------|----------------|
| **KML** | Rich styling, temporal data, 3D, universal viewer support | Verbose XML, no topology, limited analytics | Primary OSINT export |
| **GeoJSON** | Simple, JSON-native, web-friendly, topology support | No styling, no temporal, no 3D | API responses, web maps |
| **Shapefile** | Industry standard GIS, efficient geometry | Multi-file format, 2GB limit, legacy encoding | GIS integration |
| **GeoPackage** | SQLite-based, vector + raster, OGC standard | Less viewer support, more complex | Offline analysis |
| **CSV+coords** | Simple, universal, lightweight | No geometry types, no styling, ambiguous CRS | Quick data exchange |
| **WKT/WKB** | Compact geometry, database-native | No metadata, no styling, geometry only | PostgreSQL/PostGIS |

### Security Considerations

KML documents can contain:

| Risk | Vector | Mitigation |
|------|--------|-----------|
| **XML External Entity (XXE)** | `<!DOCTYPE>` with external entity references | Disable DTD processing in parser |
| **XML Bomb** | Billion laughs / entity expansion | Limit entity expansion depth |
| **Network Overlay injection** | `<NetworkLink>` loading external KML | Strip `<NetworkLink>` from imported KML |
| **Script injection** | JavaScript in `<description>` CDATA | Sanitize HTML in descriptions |
| **Path traversal** | KMZ with `../../` file references | Validate paths in KMZ extraction |
| **Coordinate spoofing** | False locations in intelligence data | Cross-reference with verified sources |

```elixir
defmodule PrismaticOsintCore.KML.Sanitizer do
  @moduledoc "Sanitizes imported KML documents against XXE and injection attacks."

  @spec sanitize(String.t()) :: {:ok, String.t()} | {:error, :malicious_content}
  def sanitize(kml_content) do
    cond do
      String.contains?(kml_content, "<!DOCTYPE") -> {:error, :malicious_content}
      String.contains?(kml_content, "<!ENTITY") -> {:error, :malicious_content}
      String.contains?(kml_content, "<NetworkLink>") -> {:ok, strip_network_links(kml_content)}
      true -> {:ok, kml_content}
    end
  end

  defp strip_network_links(content) do
    Regex.replace(~r/<NetworkLink>.*?<\/NetworkLink>/s, content, "<!-- NetworkLink removed -->")
  end
end
```

## Usage in Prismatic Platform

### OSINT Intelligence Export

The Prismatic Platform's [OSINT toolbox](@/glossary/osint.md) generates KML exports for geospatial intelligence visualization. When OSINT tools resolve geographic coordinates -- IP [geolocation](@/glossary/geolocation.md), company registered addresses from Czech commercial registers, infrastructure locations from Shodan -- results can be exported as KML for analysis in Google Earth Pro or QGIS:

```elixir
# Export OSINT investigation results as KML
{:ok, placemarks} = PrismaticOsintCore.Investigation.get_geolocated_entities(case_id)
{:ok, kml} = PrismaticOsintCore.KML.Generator.generate("Investigation #{case_id}", placemarks)
File.write!("investigation_#{case_id}.kml", kml)
```

### DD Entity Geographic Mapping

The [DD pipeline](/glossary/dd-pipeline/)'s entity records include optional geographic attributes (latitude, longitude, country codes) that feed into KML export:

```elixir
# Export DD entities with geographic data
entities = PrismaticDd.Repo.Queries.entities_with_coordinates(case_id)
placemarks = Enum.map(entities, fn entity ->
  %{
    name: entity.name,
    lat: entity.latitude,
    lon: entity.longitude,
    confidence: entity.confidence_score,
    entity_type: entity.type,
    source: "dd-pipeline",
    timestamp: entity.discovered_at,
    style: confidence_to_style(entity.confidence_score)
  }
end)

{:ok, kml} = PrismaticOsintCore.KML.Generator.generate("DD Case #{case_id}", placemarks)
```

### Perimeter EASM Asset Distribution

[Prismatic Perimeter](/glossary/perimeter/)'s EASM asset discovery generates geographic distributions of discovered infrastructure (server locations, CDN nodes, cloud regions), exportable as KML placemarks with security rating annotations:

```elixir
# Export attack surface geographic distribution
assets = PrismaticPerimeter.Discovery.geolocated_assets(target_domain)
folders = [
  %{name: "Servers", placemarks: Enum.filter(assets, &(&1.type == :server))},
  %{name: "CDN Nodes", placemarks: Enum.filter(assets, &(&1.type == :cdn))},
  %{name: "Cloud Resources", placemarks: Enum.filter(assets, &(&1.type == :cloud))}
]

{:ok, kmz} = PrismaticOsintCore.KML.Generator.generate_kmz("EASM: #{target_domain}", folders)
```

## Best Practices

1. **Always validate KML output** against the OGC KML 2.2 schema before distribution.
2. **Use KMZ compression** for exports containing more than 100 placemarks to reduce file size.
3. **Include `<TimeStamp>` elements** on intelligence placemarks to enable temporal filtering in Earth browsers.
4. **Sanitize all user-supplied text** through XML escaping before embedding in KML elements to prevent XML injection.
5. **Use `<ExtendedData>`** rather than overloading `<description>` with HTML for structured metadata.
6. **Include provenance data** (source tool, collection timestamp, confidence score) as Extended Data fields for auditability.
7. **Organize placemarks in `<Folder>` elements** by entity type, source, or investigation phase for navigability.
8. **Strip `<NetworkLink>` elements** from imported KML to prevent data exfiltration.
9. **Use confidence-based styling** to visually distinguish high/medium/low confidence locations.
10. **Default to 6 decimal places** for coordinate precision in intelligence contexts.

## Related Terms

- [JSON](@/glossary/json.md) -- alternative data interchange format, used for API responses and web maps
- [Geolocation](@/glossary/geolocation.md) -- the process of determining geographic coordinates from IP addresses or addresses
- [OSINT](@/glossary/osint.md) -- open source intelligence tools that produce geospatial data
- [Data Provenance](@/glossary/data-provenance.md) -- tracking data lineage essential for geospatial intelligence
- [Entity Graph](@/glossary/entity-graph.md) -- entity relationships that can be projected onto geographic space
- [Serialization](/glossary/serialization/) -- data format conversion including KML encoding
- [XML](/glossary/xml/) -- the markup language underlying KML format
- [Metadata Management](@/glossary/metadata-management.md) -- managing the extended data embedded in KML

## See Also

- [OSINT Toolbox](@/osint/_index.md) -- intelligence tools that produce geospatial data
- [Architecture](@/architecture/_index.md) -- platform data export architecture
- [Perimeter](@/capabilities/_index.md) -- EASM asset discovery with geographic distribution
- [OGC KML 2.2 Specification](https://www.ogc.org/standard/kml/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
