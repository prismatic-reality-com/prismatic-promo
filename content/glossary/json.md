+++
title = "JSON"
weight = 50
[extra]
description = "JavaScript Object Notation (JSON) is a lightweight, text-based data interchange format derived from JavaScript object literal syntax that has become the universal standard for structured data exchange across web APIs, configuration files, and distributed systems"
category = "data"
subcategory = "serialization"
difficulty = "beginner"
technology_type = "data_format"
platform_component = "data_interchange"
paradigm = "text_based"
runtime = "language_independent"
specification = "RFC 8259, ECMA-404"
prerequisite_concepts = ["data_structures", "key_value_pairs", "text_encoding", "api_design"]
use_cases = ["api_responses", "configuration_files", "data_exchange", "logging", "inter_service_communication", "document_storage"]
benefits = ["human_readable", "language_independent", "lightweight", "wide_tooling_support", "native_browser_parsing"]
implementation_patterns = ["request_response", "event_payload", "configuration", "document_storage", "streaming"]
quality_metrics = ["parse_time", "encoding_speed", "payload_size", "schema_compliance"]
integration_points = ["jason", "poison", "postgresql_jsonb", "meilisearch", "rest_api", "openapi"]
related_disciplines = ["web_development", "api_design", "data_engineering", "distributed_systems"]
related_terms = ["json-schema", "api", "endpoint", "pipeline", "serialization", "rest", "graphql", "ecto", "postgresql", "meilisearch", "openapi-spec", "data-modeling", "protocol", "message-passing"]
tags = ["glossary", "json", "data-format", "serialization", "api", "interchange", "configuration", "web-standards"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
quality_score = 92
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "JSON is the universal data interchange format used throughout Prismatic Platform for API responses, tool configurations, OSINT results, and inter-service communication"
date_created = "2026-02-24"
date_modified = "2026-04-08"
keywords = ["JSON", "JavaScript Object Notation", "data interchange", "serialization", "API format", "structured data", "JSON encoding", "JSON decoding", "Jason library", "JSONB PostgreSQL", "RFC 8259", "ECMA-404"]
image = "/images/sections/glossary.png"
image_alt = "JSON - Prismatic Platform"
word_count = 3800
see_also = ["capabilities", "architecture", "api"]
+++

## Definition

JavaScript Object Notation (JSON) is a lightweight, text-based data interchange format that uses human-readable text to represent structured data as key-value pairs and ordered lists. Originally derived from JavaScript object literal syntax (ECMA-262, 3rd Edition, 1999), JSON has become language-independent and is now formalized in two overlapping standards: RFC 8259 (published by the IETF) and ECMA-404 (published by Ecma International). Its simplicity, ubiquity, and native support in virtually every programming language make it the dominant format for web [APIs](/glossary/api/), configuration files, and data exchange between [distributed systems](/glossary/distribution/).

JSON supports six data types: strings, numbers, booleans, null, objects (unordered key-value maps), and arrays (ordered sequences). This minimal type system covers the vast majority of real-world data exchange needs while remaining trivially parseable by machines and readable by humans. The format's success stems from hitting a sweet spot between expressiveness and simplicity -- complex enough to represent most structured data, simple enough that a complete parser can be written in a few hundred lines of code.

## Overview

JSON emerged in the early 2000s as a simpler alternative to XML for data interchange in web applications. Douglas Crockford popularized the format, recognizing that JavaScript's object literal notation was already a practical [serialization](/glossary/serialization/) format that could serve as a lightweight wire protocol. Where XML required verbose opening and closing tags, schemas, namespaces, and processing instructions, JSON needed only braces, brackets, colons, and commas. This minimalism made JSON payloads smaller, faster to parse, and easier for developers to read and write by hand.

The format's adoption accelerated with the rise of AJAX (Asynchronous JavaScript and XML -- which, ironically, increasingly used JSON instead of XML) and RESTful web services. By the mid-2010s, JSON had effectively replaced XML as the default data format for web APIs. Today, JSON is used not only for API communication but also for configuration files (package.json, tsconfig.json), database document storage (MongoDB, CouchDB, PostgreSQL [JSONB](/glossary/postgresql/)), log formatting (structured logging), and inter-process communication in [microservice architectures](/glossary/microservices/).

| Aspect | JSON | XML | YAML | MessagePack |
|--------|------|-----|------|-------------|
| **Readability** | High | Medium | Very High | Binary (none) |
| **Parse speed** | Fast | Slow | Slow | Very Fast |
| **Payload size** | Medium | Large | Medium | Small |
| **Type system** | 6 types | Extensible | Rich | 6+ types |
| **Comments** | No | Yes | Yes | No |
| **Schema support** | JSON Schema | XSD/DTD | None native | None native |
| **Binary data** | Base64 only | Base64/CDATA | Base64 only | Native |
| **Streaming** | JSON Lines | SAX parser | No | Yes |
| **Browser native** | Yes | Partial | No | No |

### JSON Syntax Fundamentals

A JSON document is either an object (enclosed in `{}`) or an array (enclosed in `[]`). Objects contain zero or more key-value pairs where keys must be double-quoted strings and values can be any JSON type. Arrays contain zero or more ordered values of any type.

```json
{
  "name": "Prismatic Platform",
  "version": "18.4.0",
  "apps_count": 94,
  "agents_count": 552,
  "active": true,
  "deprecated_features": null,
  "domains": ["osint", "dd", "perimeter", "security", "intelligence"],
  "health": {
    "score": 87.4,
    "grade": "B",
    "pillars_enforced": 18
  }
}
```

Key syntax rules that differentiate JSON from JavaScript object literals:

1. **Keys must be double-quoted strings** -- single quotes and unquoted keys are invalid
2. **No trailing commas** -- the last element in an object or array must not have a trailing comma
3. **No comments** -- JSON has no comment syntax (a deliberate design choice)
4. **No undefined** -- only `null` is supported for absent values
5. **Numbers cannot have leading zeros** -- `07` is invalid, `0.7` is valid
6. **Strings must use double quotes** -- single quotes are not valid JSON

## Technical Deep Dive

### Parsing and Encoding in the BEAM Ecosystem

JSON parsing in the BEAM ecosystem relies on libraries like [Jason](https://hex.pm/packages/jason) (pure Elixir, fast) and Poison (legacy). Jason uses binary pattern matching and IO lists for exceptional encoding performance -- typically 2-5x faster than equivalent libraries in other runtimes. The BEAM's immutable binary handling means JSON strings are never copied unnecessarily during parsing, and large JSON documents can be streamed through [processes](/glossary/process/) without memory pressure.

Jason achieves its performance through several techniques specific to the BEAM:

- **Binary pattern matching**: Parsing uses `<<byte, rest::binary>>` patterns that the BEAM optimizes into efficient C-level operations
- **IO lists for encoding**: Instead of concatenating strings (which copies bytes), Jason builds IO lists -- nested lists of binaries and integers that the BEAM's I/O subsystem flattens lazily at write time
- **NIF acceleration**: Optional NIF (Native Implemented Function) acceleration for hot paths
- **Protocol-based encoding**: The `Jason.Encoder` [protocol](/glossary/protocol/) enables custom type encoding without modifying the library

```elixir
# Jason encoding benchmark (typical results on modern hardware)
# Simple map:    ~2.5 million encodes/second
# Complex nested: ~400,000 encodes/second
# Large list:     ~50,000 encodes/second (1000 elements)

# Decoding benchmark
# Simple JSON:    ~1.8 million decodes/second
# Complex nested: ~350,000 decodes/second
```

### Security Considerations

Key considerations in production JSON handling include: [schema](/glossary/json-schema/) validation (ensuring documents conform to expected structure), encoding of special types (dates, decimals, atoms), handling of large documents (streaming vs. full-load), and security (preventing atom exhaustion from untrusted input). In [Elixir](/glossary/elixir/), `Jason.decode/2` with the `keys: :atoms!` option safely converts keys to existing atoms only, preventing atom table exhaustion attacks from untrusted JSON input.

Atom table exhaustion is a particularly insidious attack vector in BEAM languages. The atom table has a fixed maximum size (default 1,048,576 atoms) and atoms are never garbage collected. An attacker who can submit arbitrary JSON with novel key names and have those keys converted to atoms via `String.to_atom/1` can crash the entire BEAM VM. This is why the ZERO doctrine mandates `String.to_existing_atom/1` and `keys: :atoms!` for all untrusted input.

```elixir
# DANGEROUS: Creates atoms from untrusted input
Jason.decode!(payload, keys: :atoms)    # ❌ ZERO violation

# SAFE: Only converts to pre-existing atoms
Jason.decode!(payload, keys: :atoms!)   # ✅ ZERO compliant

# SAFEST: Keep keys as strings for untrusted external data
Jason.decode!(payload)                  # ✅ Default string keys
```

### JSON Limitations and Alternatives

JSON has well-known limitations: no native date/time type, no distinction between integers and floats, no comments, no support for binary data without Base64 encoding, and no built-in schema mechanism. For specific use cases, alternatives may be more appropriate:

| Limitation | Alternative | Use Case |
|-----------|-------------|----------|
| No binary data | MessagePack, [Protocol Buffers](/glossary/protocol/) | File transfers, media |
| No comments | YAML, JSONC | Configuration files |
| No streaming | JSON Lines (NDJSON) | Log ingestion, event streams |
| No schema | [JSON Schema](/glossary/json-schema/) | API validation |
| Large payloads | CBOR, Protocol Buffers | High-throughput services |
| No date type | ISO 8601 strings (convention) | Time-series data |

Despite these limitations, JSON remains the default choice for human-facing APIs and configuration because its simplicity and universal tooling support outweigh the benefits of more feature-rich alternatives.

## Usage in Prismatic Platform

JSON pervades every layer of the Prismatic Platform, serving as the primary data interchange format across all subsystems:

### REST API Layer

The [OpenApiSpex](https://hex.pm/packages/open_api_spex)-based REST API (`prismatic_api`, port 4004) uses JSON exclusively for request and response bodies. All [endpoints](/glossary/endpoint/) follow a consistent envelope pattern:

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-04-08T10:30:00Z",
    "version": "v1"
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1542
  }
}
```

### OSINT Tool Results

All 157 OSINT tools return structured JSON results, stored as JSONB columns in [PostgreSQL](/glossary/postgresql/) for efficient querying and indexing. The standardized result format enables cross-tool correlation and [pipeline](/glossary/pipeline/) processing:

```json
{
  "tool": "czech-ares",
  "query": "Navigara",
  "results": [
    {
      "ico": "12345678",
      "name": "Navigara s.r.o.",
      "address": "Praha 1",
      "status": "active",
      "confidence": 0.95
    }
  ],
  "metadata": {
    "execution_time_ms": 342,
    "source": "ARES API",
    "cached": false
  }
}
```

### DD Pipeline Entity Attributes

The DD (Due Diligence) [pipeline](/glossary/pipeline/) stores entity attributes as JSONB, enabling flexible schema evolution without [migrations](/glossary/schema-migration/). Entity attributes can vary by entity type (person, company, domain) while sharing a common storage mechanism.

### Quality DNA State Files

Quality DNA state files (`.claude/quality-dna/current-state.json`) persist quality metrics across sessions, enabling trend analysis and regression detection.

### JSONB in PostgreSQL

The platform's JSONB usage in PostgreSQL deserves special attention. JSONB (Binary JSON) stores JSON data in a decomposed binary format that enables:

- **GIN indexes**: Sub-millisecond containment queries across heterogeneous entity attributes
- **SQL-level querying**: PostgreSQL's JSONB operators (`@>`, `?`, `#>>`, `||`) provide powerful querying without application-level deserialization
- **Partial updates**: `jsonb_set()` modifies nested values without rewriting the entire document
- **Path queries**: `jsonb_path_query()` supports SQL/JSON path expressions for complex extractions

```sql
-- Find entities with specific attribute (GIN-indexed, sub-ms)
SELECT * FROM entities WHERE attributes @> '{"risk_level": "high"}'::jsonb;

-- Extract nested value
SELECT attributes #>> '{address,city}' FROM entities;

-- Conditional aggregation over JSONB fields
SELECT 
  attributes->>'entity_type' AS type,
  COUNT(*) AS count
FROM entities
GROUP BY attributes->>'entity_type';
```

## Code Examples

### Encoding with Jason

```elixir
defmodule PrismaticApi.ResponseEncoder do
  @moduledoc """
  Encodes API responses to JSON with consistent formatting.

  Provides standardized JSON encoding for all API responses,
  ensuring consistent metadata, timestamps, and error formatting
  across all endpoints.
  """

  @spec encode_response(map(), keyword()) :: {:ok, String.t()} | {:error, Jason.EncodeError.t()}
  def encode_response(data, opts \\ []) do
    data
    |> Map.put(:timestamp, DateTime.utc_now())
    |> Map.put(:platform, "prismatic")
    |> Jason.encode(opts)
  end

  @spec encode_response!(map(), keyword()) :: String.t()
  def encode_response!(data, opts \\ []) do
    data
    |> Map.put(:timestamp, DateTime.utc_now())
    |> Map.put(:platform, "prismatic")
    |> Jason.encode!(opts)
  end

  @doc """
  Encodes to IO data for streaming responses.
  Avoids binary concatenation overhead for large payloads.
  """
  @spec encode_to_iodata(map()) :: {:ok, iodata()} | {:error, Jason.EncodeError.t()}
  def encode_to_iodata(data) do
    Jason.encode_to_iodata(data)
  end
end
```

### Safe Decoding of Untrusted Input

```elixir
defmodule PrismaticOsintCore.ResultParser do
  @moduledoc """
  Safely parses JSON results from external OSINT APIs.

  All external JSON is decoded with string keys to prevent
  atom table exhaustion (ZERO doctrine compliance). Keys are
  converted to atoms only when matching a known allowlist.
  """

  @allowed_keys ~w(tool query results metadata confidence source)a

  @spec parse_result(String.t()) :: {:ok, map()} | {:error, term()}
  def parse_result(json_string) when is_binary(json_string) do
    case Jason.decode(json_string) do
      {:ok, decoded} ->
        {:ok, normalize_keys(decoded)}

      {:error, %Jason.DecodeError{} = error} ->
        {:error, {:json_decode, error}}
    end
  end

  defp normalize_keys(map) when is_map(map) do
    Map.new(map, fn {key, value} ->
      atom_key = safe_to_atom(key)
      {atom_key || key, normalize_keys(value)}
    end)
  end

  defp normalize_keys(list) when is_list(list) do
    Enum.map(list, &normalize_keys/1)
  end

  defp normalize_keys(value), do: value

  defp safe_to_atom(key) when is_binary(key) do
    case String.to_existing_atom(key) do
      atom when atom in @allowed_keys -> atom
      _ -> nil
    end
  rescue
    ArgumentError -> nil
  end
end
```

### JSONB Queries in Ecto

```elixir
defmodule PrismaticDd.Repo.Queries do
  @moduledoc """
  JSONB query helpers for DD entity attributes.

  Provides composable Ecto query fragments for querying
  entity attributes stored as PostgreSQL JSONB columns.
  """
  import Ecto.Query

  @doc """
  Finds entities where attributes contain the given key-value pair.
  Uses GIN index for sub-millisecond performance.
  """
  @spec entities_with_attribute(String.t(), term()) :: Ecto.Query.t()
  def entities_with_attribute(key, value) do
    from(e in PrismaticDd.Schemas.EntityRecord,
      where: fragment("attributes @> ?::jsonb", ^Jason.encode!(%{key => value}))
    )
  end

  @doc """
  Extracts a nested JSONB value as a string.
  """
  @spec extract_attribute(Ecto.Query.t(), String.t()) :: Ecto.Query.t()
  def extract_attribute(query, path) do
    from(e in query,
      select_merge: %{
        extracted: fragment("attributes #>> ?", ^String.split(path, "."))
      }
    )
  end

  @doc """
  Filters entities by JSONB array containment.
  Example: entities where tags array contains "high-risk".
  """
  @spec entities_with_tag(String.t()) :: Ecto.Query.t()
  def entities_with_tag(tag) do
    from(e in PrismaticDd.Schemas.EntityRecord,
      where: fragment("attributes->'tags' ? ?", ^tag)
    )
  end
end
```

### Custom Jason.Encoder Implementation

```elixir
defmodule PrismaticDd.Schemas.EntityRecord do
  @moduledoc """
  DD entity record with custom JSON encoding.
  """

  defstruct [:id, :name, :entity_type, :attributes, :confidence, :inserted_at]

  defimpl Jason.Encoder do
    def encode(entity, opts) do
      %{
        id: entity.id,
        name: entity.name,
        type: entity.entity_type,
        attributes: entity.attributes,
        confidence: entity.confidence,
        created_at: entity.inserted_at
      }
      |> Jason.Encode.map(opts)
    end
  end
end
```

### JSON Lines (NDJSON) Streaming

```elixir
defmodule PrismaticOsintCore.StreamParser do
  @moduledoc """
  Parses newline-delimited JSON (NDJSON/JSON Lines) streams.

  Used for processing large result sets from OSINT tools
  that return streaming JSON output.
  """

  @spec parse_stream(Enumerable.t()) :: Enumerable.t()
  def parse_stream(line_stream) do
    line_stream
    |> Stream.map(&String.trim/1)
    |> Stream.reject(&(&1 == ""))
    |> Stream.map(fn line ->
      case Jason.decode(line) do
        {:ok, data} -> {:ok, data}
        {:error, reason} -> {:error, {line, reason}}
      end
    end)
    |> Stream.filter(&match?({:ok, _}, &1))
    |> Stream.map(fn {:ok, data} -> data end)
  end
end
```

## Best Practices

### Encoding and Decoding

Use Jason (not Poison) for all new Elixir JSON encoding and decoding -- Jason is faster, actively maintained, and implements the `Jason.Encoder` [protocol](/glossary/protocol/) for custom type encoding. Always use `keys: :atoms!` (not `keys: :atoms`) when decoding untrusted input to prevent atom table exhaustion. For maximum safety with external data, prefer string keys entirely and convert to atoms only through an explicit allowlist.

### Database Storage

Store flexible, schema-less data as PostgreSQL JSONB rather than serialized JSON text columns to enable GIN indexing and SQL-level queries. Create GIN indexes on JSONB columns that will be queried with containment operators. Use `jsonb_set()` for partial updates rather than rewriting entire documents.

### API Design

Define `Jason.Encoder` implementations for all custom structs that appear in API responses. When encoding large datasets, use `Jason.encode_to_iodata/1` to avoid unnecessary binary concatenation. Validate JSON structure with [JSON Schema](/glossary/json-schema/) before processing untrusted documents from external OSINT sources.

### Performance

For high-throughput scenarios, consider these optimizations:

1. **IO lists over strings**: Use `Jason.encode_to_iodata/1` -- the BEAM can write IO lists directly to sockets without materializing the full binary
2. **Streaming for large payloads**: Use JSON Lines (NDJSON) for datasets that don't fit comfortably in memory
3. **Selective decoding**: For large documents where you only need specific fields, consider streaming JSON parsers or PostgreSQL JSONB extraction at the query level
4. **Caching**: Cache frequently-accessed JSON encodings in [ETS](/glossary/ets/) to avoid redundant encoding work

### Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| `keys: :atoms` with untrusted input | VM crash via atom exhaustion | Use `keys: :atoms!` or string keys |
| Encoding `DateTime` without protocol | `Jason.EncodeError` at runtime | Implement `Jason.Encoder` or convert to ISO 8601 |
| Large JSON in a single `Repo.all` | Memory pressure, timeout | Stream with `Repo.stream` + JSON Lines |
| String concatenation for building JSON | O(n^2) memory, slow | Use IO lists via `Jason.encode_to_iodata` |
| Floating point in financial data | Precision loss | Use `Decimal` + custom encoder |
| Assuming key ordering | Fragile tests, broken logic | JSON objects are unordered by spec |

## Historical Context

JSON's history is intertwined with the evolution of web development. Douglas Crockford identified the format around 2001, recognizing that JavaScript's object literal notation was already a de facto serialization format being used informally by developers. He registered the domain json.org and published a simple specification that fit on a single business card.

The format gained official recognition through RFC 4627 (2006), later superseded by RFC 7159 (2014) and finally RFC 8259 (2017). ECMA International standardized JSON as ECMA-404 in 2013. The existence of two overlapping standards reflects JSON's unusual standardization path -- it was already in widespread use before any formal specification existed.

JSON's success catalyzed the development of an ecosystem of supporting standards: JSON Schema for validation, JSON Pointer (RFC 6901) for addressing values within documents, JSON Patch (RFC 6902) for describing modifications, JSON Merge Patch (RFC 7396) for simpler modifications, and JSON-LD for linked data.

## Ecosystem and Tooling

### Elixir/BEAM Libraries

| Library | Type | Performance | Status |
|---------|------|-------------|--------|
| **Jason** | Pure Elixir | Fastest | Active, recommended |
| **Poison** | Pure Elixir | Good | Legacy, avoid for new code |
| **jiffy** | NIF (C) | Very fast | Use when NIF overhead acceptable |
| **jsx** | Pure Erlang | Good | Erlang ecosystem |
| **Jaxon** | Streaming NIF | Fast for large docs | Streaming-only use cases |

### Supporting Standards

- **[JSON Schema](/glossary/json-schema/)**: Vocabulary for annotating and validating JSON documents -- used in [OpenAPI specs](/glossary/openapi-spec/) for API validation
- **JSON Pointer** (RFC 6901): String syntax for identifying specific values within a JSON document
- **JSON Patch** (RFC 6902): Format for describing changes to a JSON document
- **JSON-LD**: Method of encoding Linked Data using JSON -- used in SEO structured data
- **JSON Lines / NDJSON**: Newline-delimited JSON for streaming and log formats

## Related Terms

- [JSON Schema](/glossary/json-schema/) -- vocabulary for annotating and validating JSON documents
- [API](/glossary/api/) -- application programming interfaces that use JSON as their primary format
- [REST](/glossary/rest/) -- architectural style where JSON is the dominant representation format
- [Pipeline](/glossary/pipeline/) -- data processing pipelines that transform JSON between stages
- [Endpoint](/glossary/endpoint/) -- specific API URLs that accept and return JSON
- [Serialization](/glossary/serialization/) -- the general process of converting data to transmittable formats
- [Protocol](/glossary/protocol/) -- Elixir protocols, including Jason.Encoder for custom encoding
- [ETS](/glossary/ets/) -- in-memory storage often used to cache decoded JSON
- [PostgreSQL](/glossary/postgresql/) -- database with native JSONB support for JSON storage
- [Meilisearch](/glossary/meilisearch/) -- full-text search engine that indexes JSON documents
- [OpenAPI Spec](/glossary/openapi-spec/) -- API specification format built on JSON Schema
- [GraphQL](/glossary/graphql/) -- query language that uses JSON for response payloads
- [Ecto](/glossary/ecto/) -- database wrapper with JSONB fragment support
- [Data Modeling](/glossary/data-modeling/) -- design of data structures that JSON represents

## See Also

- [Architecture](/architecture/) -- platform architecture using JSON throughout
- [Capabilities](/capabilities/) -- platform capabilities built on JSON interchange
- [API Documentation](/api/) -- REST API specification using JSON
- [OSINT Toolbox](/osint/toolbox/) -- 157 tools returning structured JSON results
- [DD Pipeline](/hub/dd/pipeline/) -- entity processing with JSONB storage

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
