+++
title = "CSV"
description = "Comma-Separated Values -- a plain-text tabular data format where fields are delimited by commas, widely used for data exchange between systems and spreadsheet applications."
weight = 50

[extra]
category = "data"
tags = ["csv", "data-format", "tabular", "import", "export", "parsing", "etl", "data-exchange", "nimble-csv", "streaming"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "beginner"
audience = ["developers", "data-engineers", "analysts", "architects"]
related_terms = ["json", "xml", "tsv", "etl", "data-pipeline", "streaming", "nimble-csv"]
key_concepts = ["field-delimiter", "quoting", "escaping", "header-row", "encoding", "streaming-parse"]
platforms = ["elixir", "beam", "nimble-csv", "csv-library"]
prerequisites = ["text-processing-basics", "data-formats"]
use_cases = ["data-import", "data-export", "report-generation", "etl-pipelines", "spreadsheet-interchange"]
complexity = "low"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["CSV", "Comma-Separated Values", "data format", "glossary", "Prismatic Platform"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "CSV - Prismatic Platform"
+++

## Definition and Overview

Comma-Separated Values (CSV) is a text-based tabular data format in which each line represents a data record and fields within each record are separated by commas. Despite its apparent simplicity, CSV has numerous edge cases involving quoting, escaping, encoding, and line termination that make robust parsing non-trivial. The format predates personal computers -- it was used with punch cards and Fortran in the 1960s -- and remains one of the most widely supported data interchange formats across virtually all platforms and programming languages.

CSV files have no formal specification that is universally followed. RFC 4180 defines a common format, but real-world CSV files vary widely in their use of delimiters (comma, semicolon, tab, pipe), quoting rules (double quotes, single quotes, no quoting), escape sequences (doubled quotes, backslash escaping), character encoding (UTF-8, Latin-1, Windows-1252), and line endings (LF, CRLF, CR). Robust CSV processing must handle this variation gracefully, either through explicit configuration or automatic detection.

The format's enduring popularity stems from its human readability, universal tool support (every spreadsheet application, database, and programming language can process CSV), and minimal overhead. For data exchange between heterogeneous systems, CSV often represents the lowest common denominator that all parties can produce and consume. However, CSV's lack of type information, schema definition, and hierarchical structure limits its suitability for complex data.

## Technical Deep Dive

### RFC 4180 Format Rules

| Rule | Description | Example |
|------|-------------|---------|
| **Delimiter** | Fields separated by comma | `field1,field2,field3` |
| **Records** | Records separated by CRLF | `row1\r\nrow2` |
| **Header** | Optional first row with field names | `name,age,email` |
| **Quoting** | Fields containing comma, CRLF, or quotes must be quoted | `"field,with,commas"` |
| **Escaping** | Double quotes escaped by doubling | `"He said ""hello"""` |
| **Whitespace** | Not trimmed (significant) | ` value ` preserves spaces |

### Common Dialect Variations

| Dialect | Delimiter | Quote | Escape | Encoding | Common In |
|---------|-----------|-------|--------|----------|-----------|
| **RFC 4180** | `,` | `"` | `""` | ASCII | Internet |
| **European** | `;` | `"` | `""` | UTF-8 | EU countries (comma = decimal) |
| **TSV** | `\t` | `"` | `""` | UTF-8 | Scientific data |
| **Pipe** | `\|` | `"` | `""` | UTF-8 | Legacy systems |
| **Excel (US)** | `,` | `"` | `""` | Windows-1252 | Microsoft Excel |
| **Excel (EU)** | `;` | `"` | `""` | Windows-1252 | Microsoft Excel |

### Performance Considerations

CSV parsing performance depends heavily on the approach used. Character-by-character parsing is correct but slow. SIMD-accelerated parsers can process CSV at gigabytes per second by exploiting CPU vector instructions to identify delimiters and quotes in parallel. Streaming parsers that operate on chunks avoid loading entire files into memory, enabling processing of files larger than available RAM.

```
Parsing Approaches (ordered by throughput):
  1. SIMD-accelerated (simdjson-style)  - ~2-5 GB/s
  2. Compiled NimbleCSV parser          - ~200-500 MB/s
  3. Stream-based chunk processing      - ~100-300 MB/s
  4. Line-by-line with String.split     - ~50-100 MB/s
  5. Character-by-character state machine - ~20-50 MB/s
```

## Architecture and Implementation

CSV processing in data pipelines follows a three-stage architecture: ingestion (reading and decoding the byte stream), parsing (converting text into structured records), and transformation (mapping parsed records into domain objects). Each stage can operate in streaming mode, processing data incrementally without buffering the entire file.

The ingestion stage handles file I/O, character encoding detection and conversion, and BOM (Byte Order Mark) handling. The parsing stage implements the CSV state machine -- tracking whether the current position is inside a quoted field, at a delimiter, or at a record boundary. The transformation stage applies schema validation, type coercion, and business rules to convert raw string tuples into typed domain records.

Streaming architecture is essential for production CSV processing. Rather than loading an entire file into memory, a streaming parser reads chunks from the file handle, processes complete records, and emits results lazily. In Elixir, this maps naturally to the `Stream` module and `Flow` library for parallel processing.

## Usage in Prismatic Platform

The Prismatic Platform uses NimbleCSV for high-performance CSV parsing in data import pipelines, OSINT data processing, and report generation. NimbleCSV compiles parser definitions at compile time, generating optimized parsing functions specific to each CSV dialect.

```elixir
defmodule Prismatic.Data.CSVProcessor do
  @moduledoc """
  High-performance CSV processing using NimbleCSV.
  Supports streaming processing of large files and
  multiple CSV dialects encountered in OSINT data feeds.
  """

  NimbleCSV.define(StandardCSV, separator: ",", escape: "\"")
  NimbleCSV.define(EuropeanCSV, separator: ";", escape: "\"")
  NimbleCSV.define(PipeCSV, separator: "|", escape: "\"")

  @type parse_options :: [
    headers: boolean(),
    skip_rows: non_neg_integer(),
    encoding: :utf8 | :latin1 | :windows_1252
  ]

  @spec stream_parse(Path.t(), module(), parse_options()) :: Enumerable.t()
  def stream_parse(file_path, parser \\ StandardCSV, opts \\ []) do
    skip = Keyword.get(opts, :skip_rows, 0)

    file_path
    |> File.stream!([:read, :utf8], 64_000)
    |> Stream.drop(skip)
    |> parser.parse_stream(skip_headers: false)
  end

  @spec parse_with_headers(Path.t(), module()) :: {:ok, list(map())} | {:error, term()}
  def parse_with_headers(file_path, parser \\ StandardCSV) do
    lines =
      file_path
      |> File.stream!([:read, :utf8], 64_000)
      |> Enum.to_list()

    case lines do
      [header_line | data_lines] ->
        [headers] = parser.parse_string(header_line, skip_headers: false)
        header_atoms = Enum.map(headers, &String.to_atom(String.trim(&1)))

        records =
          data_lines
          |> Enum.join()
          |> parser.parse_string(skip_headers: false)
          |> Enum.map(fn row ->
            Enum.zip(header_atoms, row) |> Map.new()
          end)

        {:ok, records}

      [] ->
        {:error, :empty_file}
    end
  end

  @doc """
  Generates a CSV string from a list of maps.
  Used for OSINT report export and data pipeline output.
  """
  @spec generate(list(map()), list(atom())) :: String.t()
  def generate(records, columns) do
    header = Enum.map_join(columns, ",", &to_string/1)

    rows =
      Enum.map(records, fn record ->
        Enum.map_join(columns, ",", fn col ->
          value = Map.get(record, col, "")
          escape_csv_field(to_string(value))
        end)
      end)

    Enum.join([header | rows], "\r\n")
  end

  defp escape_csv_field(value) do
    if String.contains?(value, [",", "\"", "\n", "\r"]) do
      "\"" <> String.replace(value, "\"", "\"\"") <> "\""
    else
      value
    end
  end
end
```

The platform's DD pipeline uses CSV processing for bulk entity imports from Czech registry data exports. OSINT adapters that produce tabular results (such as export functions for Shodan scan results or DNS record dumps) generate CSV output through this module.

## Cross-References

- [ETL](@/glossary/etl.md) -- Extract/Transform/Load pipelines consuming CSV
- [JSON](@/glossary/json.md) -- Alternative data interchange format
- **Streaming** -- Stream processing for large CSV files
- [Data Pipeline](@/glossary/data-pipeline.md) -- Pipeline architectures processing CSV
- **Livebooks**: `data_analysis/` notebooks demonstrate CSV loading and visualization
- **Academy**: AdvancedDataAnalysis topic covers CSV processing techniques

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
