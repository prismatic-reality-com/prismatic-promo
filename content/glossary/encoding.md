+++
title = "Encoding"
weight = 50

[extra]
description = "Transformation of data from one representation to another for storage, transmission, or processing -- including character encoding (UTF-8), serialization (JSON, ETF), binary encoding (Base64), URL encoding, HTML entity encoding, and compression encoding (gzip, brotli)"
category = "data"
domain = "data-engineering"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["etl", "data-pipeline", "http", "api", "json", "erlang", "binary", "utf-8", "base64", "serialization", "injection", "xss", "ecto"]
tags = ["glossary", "encoding", "utf-8", "json", "serialization", "binary", "base64", "url-encoding", "html-encoding", "etf", "security"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The Prismatic Platform leverages Erlang Term Format for internal encoding, JSON for API serialization, UTF-8 for all text processing, and context-appropriate output encoding at every system boundary to prevent data corruption and injection attacks"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Encoding", "UTF-8", "JSON", "serialization", "Base64", "URL encoding", "HTML encoding", "ETF", "Erlang Term Format", "character encoding", "binary encoding", "content encoding", "glossary", "Prismatic Platform", "injection prevention", "XSS", "output encoding"]
image = "/images/sections/glossary.png"
image_alt = "Encoding - Prismatic Platform"
word_count = 3500
see_also = ["technologies", "architecture", "capabilities", "security"]
+++

## Definition

Encoding is the process of transforming data from one representation to another, typically for storage, transmission, or processing. It is one of the most pervasive concerns in software engineering -- nearly every layer of a system performs some form of encoding or decoding. Correct encoding handling is critical for data integrity, security, and interoperability; encoding mismatches are among the most common sources of data corruption, display errors, and security vulnerabilities in production systems.

Encoding encompasses several distinct domains. **Character encoding** maps characters to byte sequences (UTF-8, ASCII, ISO-8859-1). **Data serialization** converts structured data to byte streams for storage or transmission (JSON, Protocol Buffers, Erlang Term Format, MessagePack). **Content encoding** applies compression or transfer transformations (gzip, brotli, deflate). **Binary encoding** represents arbitrary binary data in text-safe formats (Base64, hex). **URL encoding** (percent-encoding) escapes special characters for use in URI components. **Output encoding** transforms data for safe inclusion in specific contexts to prevent injection attacks (HTML entity encoding, JavaScript string escaping, SQL parameterization).

In the BEAM ecosystem, encoding takes on particular significance because Erlang Term Format (ETF) provides a native serialization format that preserves the full richness of Erlang/Elixir data types -- atoms, tuples, PIDs, references, and binaries -- which JSON and most other formats cannot represent. The Prismatic Platform uses ETF for internal inter-node communication and distributed state transfer, JSON for external API boundaries, and UTF-8 as the universal character encoding for all text processing.

## Core Concepts

### Encoding Type Matrix

| Encoding Domain | Format | Direction | Primary Use Case | Prismatic Usage |
|----------------|--------|-----------|-----------------|-----------------|
| **Character** | UTF-8 | Bidirectional | Universal text representation | All string data, database storage |
| **Character** | ASCII | Decode only | Legacy system interop | External data ingestion |
| **Character** | ISO-8859-2 | Decode only | Czech/Slovak text legacy | OSINT Czech source scraping |
| **Serialization** | JSON | Bidirectional | API responses, configuration | REST API, OpenApiSpex, config files |
| **Serialization** | ETF | Bidirectional | Internal message passing | Inter-node communication, ETS dumps |
| **Serialization** | Protocol Buffers | Bidirectional | High-performance RPC | gRPC service interfaces |
| **Binary** | Base64 | Bidirectional | Binary data in text contexts | File attachments, JWT tokens, cookies |
| **Binary** | Hex | Bidirectional | Hash representation | Checksums, cryptographic digests |
| **URL** | Percent encoding | Bidirectional | HTTP query parameters | API query strings, redirect URLs |
| **HTML** | Entity encoding | Encode only | XSS prevention | LiveView template output |
| **Compression** | gzip | Bidirectional | Transfer encoding | HTTP response compression |
| **Compression** | brotli | Bidirectional | Static asset compression | Pre-compressed static files |

### Character Encoding Comparison

| Property | UTF-8 | UTF-16 | ASCII | ISO-8859-1 |
|----------|-------|--------|-------|------------|
| **Byte width** | Variable (1-4) | Variable (2-4) | Fixed (1) | Fixed (1) |
| **ASCII compatible** | Yes | No | Yes | Partial |
| **Unicode coverage** | Full | Full | 128 chars | 256 chars |
| **Czech/Slovak support** | Yes | Yes | No | Partial |
| **BEAM native** | Yes | No | Yes (subset) | No |
| **Web standard** | Yes | Rare | Legacy | Legacy |
| **Space efficiency (English)** | Excellent | Poor | Excellent | Excellent |
| **Space efficiency (CJK)** | Good (3 bytes) | Good (2 bytes) | N/A | N/A |

### Serialization Format Comparison

| Property | JSON | ETF | Protocol Buffers | MessagePack |
|----------|------|-----|-----------------|-------------|
| **Human readable** | Yes | No | No | No |
| **Schema required** | No | No | Yes | No |
| **Preserves Elixir types** | Partial | Full | No | Partial |
| **Atom support** | No (strings) | Yes | No | No |
| **Tuple support** | No (arrays) | Yes | No | No |
| **PID/Ref support** | No | Yes | No | No |
| **Speed (Elixir)** | Fast (Jason) | Very fast | Fast (Protox) | Fast |
| **Cross-language** | Universal | Erlang/Elixir | Universal | Universal |
| **Security risk** | Low | Medium (atoms) | Low | Low |

### Encoding at System Boundaries

| Boundary | Input Encoding | Output Encoding | Validation Required |
|----------|---------------|-----------------|-------------------|
| **HTTP API request** | JSON (body), URL (params) | N/A | UTF-8 validation, size limits |
| **HTTP API response** | N/A | JSON (body), gzip (transfer) | Schema validation |
| **Database write** | ETF -> SQL | N/A | UTF-8 validation |
| **Database read** | N/A | SQL -> ETF | Type casting |
| **Inter-node message** | ETF | ETF | `:safe` flag on decode |
| **LiveView render** | N/A | HTML entity encoding | Auto-escaped by Phoenix |
| **File upload** | Base64 or multipart | N/A | Content-type validation |
| **OSINT source** | Varies (UTF-8, ISO-8859) | N/A | Charset detection + conversion |
| **WebSocket** | JSON | JSON | Schema validation |

## Technical Deep Dive

### UTF-8 in the BEAM VM

Elixir strings are UTF-8 encoded binaries. The BEAM VM provides native support for UTF-8 through binary pattern matching, the `String` module, and the `~r//u` regex modifier for Unicode-aware matching. This makes UTF-8 handling in Elixir significantly more ergonomic than in many other languages.

However, not all binaries are valid UTF-8. Data arriving from external sources -- file uploads, API requests, OSINT scraping, database imports -- must be validated before being treated as strings. The `String.valid?/1` function performs this check efficiently by scanning the binary for valid UTF-8 byte sequences.

The Prismatic Platform enforces UTF-8 validation at every system boundary where external data enters the system. This is particularly important for the OSINT subsystem, which ingests data from diverse sources that may use legacy character encodings (ISO-8859-2 for Czech/Slovak sources, Windows-1252 for certain European sources, or even raw bytes).

### Erlang Term Format (ETF) Security

ETF is the native serialization format for Erlang/Elixir terms. It can represent any Erlang term, including atoms, tuples, maps, binaries, PIDs, and references. While powerful for internal communication, ETF poses a security risk when decoding untrusted data: the default `:erlang.binary_to_term/1` will create new atoms, which can exhaust the atom table (limited to ~1 million atoms by default) and crash the VM.

The `:safe` flag on `:erlang.binary_to_term/2` prevents atom creation from untrusted input by only allowing atoms that already exist in the atom table. The Prismatic Platform's ZERO doctrine **bans** bare `binary_to_term/1` -- all ETF decoding must use the `:safe` option.

### JSON Encoding with Jason

The Prismatic Platform uses Jason as its JSON encoder/decoder. Jason is the fastest pure-Elixir JSON library, outperforming Poison by 2-5x on typical payloads. It implements the `Jason.Encoder` protocol, which allows custom types to define their own JSON serialization.

Key considerations for JSON encoding in the platform:
- Atoms are encoded as strings (`:active` becomes `"active"`)
- Tuples are not natively representable; they must be converted to lists or maps
- DateTime structs are encoded as ISO 8601 strings
- Large integers are encoded as JSON numbers (potential precision loss in JavaScript for values > 2^53)
- Binary data must be Base64-encoded before JSON serialization

### Output Encoding for Security

Output encoding is the primary defense against injection attacks. The encoding strategy depends entirely on the output context:

- **HTML context**: Entity-encode `<`, `>`, `&`, `"`, `'` to prevent XSS
- **HTML attribute context**: Entity-encode plus additional characters
- **JavaScript context**: JavaScript-encode to prevent script injection
- **URL context**: Percent-encode to prevent parameter pollution
- **SQL context**: Parameterized queries (not encoding -- Ecto handles this)
- **CSS context**: CSS-encode to prevent style injection

Phoenix LiveView automatically HTML-encodes all dynamic content rendered in templates, providing XSS protection by default. However, using `raw/1` or `Phoenix.HTML.raw/1` bypasses this protection and must be used with extreme caution.

### Content Encoding and Compression

HTTP content encoding (gzip, brotli) reduces transfer sizes by 60-90% for text-based responses. The Prismatic Platform configures Plug compression for all JSON and HTML responses. Static assets are pre-compressed with brotli for maximum compression ratio.

The platform's Bandit HTTP server handles `Accept-Encoding` negotiation automatically, selecting the best encoding supported by the client. For large OSINT report artifacts, streaming compression is used to avoid buffering entire responses in memory.

## Usage in Prismatic Platform

- **API Serialization**: All REST API responses use JSON encoding via Jason, with OpenApiSpex schema validation ensuring consistent structure
- **Inter-Node Communication**: Distributed Erlang uses ETF for cluster communication between Fly.io nodes
- **OSINT Data Ingestion**: Character encoding detection and conversion for 157+ OSINT sources, with automatic UTF-8 normalization
- **Database Storage**: Ecto handles encoding/decoding between Elixir types and PostgreSQL wire protocol, with JSONB columns using Jason
- **LiveView Rendering**: Phoenix auto-escapes all dynamic content with HTML entity encoding, preventing XSS by default
- **File Processing**: Base64 encoding for binary attachments in JSON payloads, multipart encoding for direct file uploads
- **Token Management**: Base64url encoding for JWT tokens, session cookies, and CSRF tokens
- **Search Indexing**: UTF-8 normalized text sent to Meilisearch for full-text indexing
- **Compression**: gzip for dynamic responses, brotli for pre-compressed static assets
- **Czech Text Processing**: ISO-8859-2 to UTF-8 conversion for legacy Czech business registry data

## Code Examples

### Comprehensive Encoding Module

```elixir
defmodule Prismatic.Encoding do
  @moduledoc """
  Encoding utilities for the Prismatic Platform, handling serialization,
  character encoding validation, secure output encoding, and format
  conversion across API and web boundaries.

  This module provides a unified interface for all encoding operations
  in the platform, ensuring consistent behavior and security guarantees
  across all system boundaries.

  ## Supported Formats

    - `:json` - JSON encoding/decoding via Jason
    - `:etf` - Erlang Term Format with mandatory `:safe` flag
    - `:base64` - Base64 encoding for binary-to-text conversion
    - `:base64url` - URL-safe Base64 variant for tokens
    - `:url` - RFC 3986 percent-encoding for URI components
    - `:html` - HTML entity encoding for XSS prevention
    - `:hex` - Hexadecimal encoding for hashes and digests

  ## Security

  All ETF decoding uses the `:safe` flag (ZERO doctrine compliance).
  HTML encoding covers all five critical characters (`<`, `>`, `&`, `"`, `'`).
  URL encoding follows RFC 3986 strict mode.

  ## Examples

      iex> Prismatic.Encoding.encode(%{name: "test"}, :json)
      {:ok, ~s({"name":"test"})}

      iex> Prismatic.Encoding.encode("hello world", :base64)
      {:ok, "aGVsbG8gd29ybGQ="}

      iex> Prismatic.Encoding.decode("aGVsbG8gd29ybGQ=", :base64)
      {:ok, "hello world"}

  """

  require Logger

  @type encoding_format :: :json | :etf | :base64 | :base64url | :url | :html | :hex

  @doc """
  Encodes data into the specified format.

  ## Parameters

    - `data` - The data to encode
    - `format` - The target encoding format

  ## Returns

    - `{:ok, encoded}` on success
    - `{:error, reason}` on failure

  ## Examples

      iex> Prismatic.Encoding.encode(%{key: "value"}, :json)
      {:ok, ~s({"key":"value"})}

      iex> Prismatic.Encoding.encode(<<1, 2, 3>>, :base64)
      {:ok, "AQID"}

      iex> Prismatic.Encoding.encode("hello & world", :html)
      {:ok, "hello &amp; world"}

  """
  @spec encode(term(), encoding_format()) :: {:ok, binary()} | {:error, term()}
  def encode(data, :json) do
    case Jason.encode(data) do
      {:ok, json} -> {:ok, json}
      {:error, reason} -> {:error, {:json_encode, reason}}
    end
  end

  def encode(data, :etf) do
    {:ok, :erlang.term_to_binary(data)}
  end

  def encode(data, :base64) when is_binary(data) do
    {:ok, Base.encode64(data)}
  end

  def encode(data, :base64url) when is_binary(data) do
    {:ok, Base.url_encode64(data, padding: false)}
  end

  def encode(data, :url) when is_binary(data) do
    {:ok, URI.encode(data)}
  end

  def encode(data, :html) when is_binary(data) do
    {:ok, safe_html_encode(data)}
  end

  def encode(data, :hex) when is_binary(data) do
    {:ok, Base.encode16(data, case: :lower)}
  end

  def encode(_data, format) do
    {:error, {:unsupported_format, format}}
  end

  @doc """
  Decodes data from the specified format.

  For ETF decoding, the `:safe` flag is always applied to prevent
  atom table exhaustion from untrusted input (ZERO doctrine compliance).

  ## Parameters

    - `data` - The encoded binary data
    - `format` - The source encoding format

  ## Returns

    - `{:ok, decoded}` on success
    - `{:error, reason}` on failure

  ## Examples

      iex> Prismatic.Encoding.decode(~s({"key":"value"}), :json)
      {:ok, %{"key" => "value"}}

      iex> Prismatic.Encoding.decode("AQID", :base64)
      {:ok, <<1, 2, 3>>}

  """
  @spec decode(binary(), encoding_format()) :: {:ok, term()} | {:error, term()}
  def decode(data, :json) when is_binary(data) do
    case Jason.decode(data) do
      {:ok, decoded} -> {:ok, decoded}
      {:error, reason} -> {:error, {:json_decode, reason}}
    end
  end

  def decode(data, :etf) when is_binary(data) do
    try do
      # ZERO doctrine: ALWAYS use :safe to prevent atom table exhaustion
      {:ok, :erlang.binary_to_term(data, [:safe])}
    rescue
      ArgumentError -> {:error, :invalid_etf}
    end
  end

  def decode(data, :base64) when is_binary(data) do
    case Base.decode64(data) do
      {:ok, decoded} -> {:ok, decoded}
      :error -> {:error, :invalid_base64}
    end
  end

  def decode(data, :base64url) when is_binary(data) do
    case Base.url_decode64(data, padding: false) do
      {:ok, decoded} -> {:ok, decoded}
      :error -> {:error, :invalid_base64url}
    end
  end

  def decode(data, :url) when is_binary(data) do
    {:ok, URI.decode(data)}
  end

  def decode(data, :hex) when is_binary(data) do
    case Base.decode16(data, case: :mixed) do
      {:ok, decoded} -> {:ok, decoded}
      :error -> {:error, :invalid_hex}
    end
  end

  def decode(_data, format) do
    {:error, {:unsupported_format, format}}
  end

  @doc """
  Validates that a binary is valid UTF-8 encoded text.

  This should be called at every system boundary where external
  data enters the platform (API requests, file uploads, OSINT
  source scraping, database imports).

  ## Examples

      iex> Prismatic.Encoding.validate_utf8("Hello, world!")
      :ok

      iex> Prismatic.Encoding.validate_utf8(<<0xFF, 0xFE>>)
      {:error, :invalid_utf8}

  """
  @spec validate_utf8(binary()) :: :ok | {:error, :invalid_utf8}
  def validate_utf8(data) when is_binary(data) do
    if String.valid?(data), do: :ok, else: {:error, :invalid_utf8}
  end

  @doc """
  Encodes a string for safe inclusion in HTML content.
  Escapes the five critical characters that can enable XSS attacks.

  Note: Phoenix LiveView performs this automatically for all dynamic
  content. This function is for cases where manual encoding is needed
  (e.g., generating HTML strings outside of templates).

  ## Examples

      iex> Prismatic.Encoding.safe_html_encode("<script>alert('xss')</script>")
      "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"

  """
  @spec safe_html_encode(String.t()) :: String.t()
  def safe_html_encode(input) when is_binary(input) do
    input
    |> String.replace("&", "&amp;")
    |> String.replace("<", "&lt;")
    |> String.replace(">", "&gt;")
    |> String.replace("\"", "&quot;")
    |> String.replace("'", "&#39;")
  end

  @doc """
  Detects the character encoding of a binary by examining byte patterns.
  Returns the detected encoding or `:unknown` if detection fails.

  Used by the OSINT subsystem when ingesting data from sources that
  may not declare their encoding in HTTP headers.

  ## Examples

      iex> Prismatic.Encoding.detect_charset("Hello")
      {:ok, :utf8}

      iex> Prismatic.Encoding.detect_charset(<<0xEF, 0xBB, 0xBF>> <> "Hello")
      {:ok, :utf8_bom}

  """
  @spec detect_charset(binary()) :: {:ok, atom()} | {:error, :unknown}
  def detect_charset(<<0xEF, 0xBB, 0xBF, _rest::binary>>), do: {:ok, :utf8_bom}
  def detect_charset(<<0xFF, 0xFE, _rest::binary>>), do: {:ok, :utf16_le}
  def detect_charset(<<0xFE, 0xFF, _rest::binary>>), do: {:ok, :utf16_be}

  def detect_charset(data) when is_binary(data) do
    if String.valid?(data) do
      {:ok, :utf8}
    else
      {:error, :unknown}
    end
  end

  @doc """
  Converts a binary from a source charset to UTF-8.
  Supports common legacy encodings encountered in Czech/Slovak OSINT sources.

  ## Examples

      iex> Prismatic.Encoding.to_utf8(latin2_binary, :iso_8859_2)
      {:ok, "Czech text with diacritics"}

  """
  @spec to_utf8(binary(), atom()) :: {:ok, String.t()} | {:error, term()}
  def to_utf8(data, :utf8) when is_binary(data) do
    if String.valid?(data), do: {:ok, data}, else: {:error, :invalid_utf8}
  end

  def to_utf8(data, charset) when is_binary(data) do
    try do
      converted = :unicode.characters_to_binary(data, charset, :utf8)

      case converted do
        result when is_binary(result) -> {:ok, result}
        {:error, _, _} -> {:error, {:conversion_failed, charset}}
        {:incomplete, _, _} -> {:error, {:incomplete_input, charset}}
      end
    rescue
      e in ArgumentError -> {:error, {:unsupported_charset, charset, Exception.message(e)}}
    end
  end
end
```

### JSON Schema Validation for API Boundaries

```elixir
defmodule Prismatic.Encoding.JsonValidator do
  @moduledoc """
  JSON validation utilities for API boundary enforcement.
  Ensures incoming JSON conforms to expected structure and encoding
  before being processed by the platform.

  ## Examples

      iex> schema = %{required: ["name", "type"], types: %{"name" => :string, "type" => :string}}
      iex> Prismatic.Encoding.JsonValidator.validate(~s({"name": "test", "type": "entity"}), schema)
      {:ok, %{"name" => "test", "type" => "entity"}}

  """

  @doc """
  Validates a JSON string against a schema definition.
  Performs UTF-8 validation, JSON parsing, and structural validation.

  ## Examples

      iex> Prismatic.Encoding.JsonValidator.validate(~s({"key": "value"}), %{required: ["key"]})
      {:ok, %{"key" => "value"}}

  """
  @spec validate(binary(), map()) :: {:ok, map()} | {:error, term()}
  def validate(json_string, schema) when is_binary(json_string) do
    with :ok <- Prismatic.Encoding.validate_utf8(json_string),
         {:ok, decoded} <- Jason.decode(json_string),
         :ok <- validate_structure(decoded, schema) do
      {:ok, decoded}
    end
  end

  @doc """
  Validates the size of a JSON payload to prevent abuse.
  The Prismatic Platform enforces a 10MB maximum by default.

  ## Examples

      iex> Prismatic.Encoding.JsonValidator.validate_size("small", 1_000_000)
      :ok

  """
  @spec validate_size(binary(), non_neg_integer()) :: :ok | {:error, :payload_too_large}
  def validate_size(data, max_bytes \\ 10_485_760) do
    if byte_size(data) <= max_bytes, do: :ok, else: {:error, :payload_too_large}
  end

  defp validate_structure(data, %{required: required_keys}) when is_map(data) do
    missing = Enum.reject(required_keys, &Map.has_key?(data, &1))

    if missing == [] do
      :ok
    else
      {:error, {:missing_keys, missing}}
    end
  end

  defp validate_structure(_data, _schema), do: :ok
end
```

### ETF Safety Wrapper

```elixir
defmodule Prismatic.Encoding.SafeETF do
  @moduledoc """
  Safe Erlang Term Format encoding/decoding with ZERO doctrine compliance.
  Wraps `:erlang.binary_to_term/2` with mandatory `:safe` flag and
  additional validation for untrusted data.

  The BEAM VM has a finite atom table (approximately 1,048,576 atoms by default).
  Decoding ETF from untrusted sources without the `:safe` flag can create
  arbitrary atoms, exhausting the table and crashing the VM. This module
  enforces the `:safe` flag on all decode operations.

  ## Examples

      iex> data = :erlang.term_to_binary(%{key: "value"})
      iex> Prismatic.Encoding.SafeETF.decode(data)
      {:ok, %{key: "value"}}

  """

  @doc """
  Safely decodes ETF binary data with the `:safe` flag.
  Only atoms that already exist in the atom table will be recognized.

  ## Examples

      iex> Prismatic.Encoding.SafeETF.decode(:erlang.term_to_binary([1, 2, 3]))
      {:ok, [1, 2, 3]}

  """
  @spec decode(binary()) :: {:ok, term()} | {:error, :invalid_etf | :unsafe_term}
  def decode(data) when is_binary(data) do
    try do
      {:ok, :erlang.binary_to_term(data, [:safe])}
    rescue
      ArgumentError -> {:error, :invalid_etf}
    end
  end

  @doc """
  Encodes an Elixir term to ETF binary format.

  ## Examples

      iex> {:ok, binary} = Prismatic.Encoding.SafeETF.encode(%{hello: "world"})
      iex> is_binary(binary)
      true

  """
  @spec encode(term()) :: {:ok, binary()}
  def encode(term) do
    {:ok, :erlang.term_to_binary(term)}
  end

  @doc """
  Round-trip encodes and decodes a term to verify ETF safety.
  Useful for testing that a term can survive safe deserialization.

  ## Examples

      iex> Prismatic.Encoding.SafeETF.round_trip(%{existing_atom: "value"})
      {:ok, %{existing_atom: "value"}}

  """
  @spec round_trip(term()) :: {:ok, term()} | {:error, term()}
  def round_trip(term) do
    with {:ok, encoded} <- encode(term),
         {:ok, decoded} <- decode(encoded) do
      {:ok, decoded}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Severity | Mitigation |
|---------|--------|----------|------------|
| **Bare `binary_to_term/1`** | Atom table exhaustion, VM crash | Critical | Always use `binary_to_term(data, [:safe])` |
| **Missing UTF-8 validation** | Mojibake, data corruption | High | Validate at every system boundary |
| **Double encoding** | Garbled output (`&amp;amp;`) | Medium | Encode once, at the output boundary |
| **Using `raw/1` in LiveView** | XSS vulnerability | Critical | Avoid `raw/1`; use auto-escaping |
| **JSON number precision loss** | Incorrect large integer values | Medium | Use strings for IDs > 2^53 |
| **Assuming UTF-8 input** | Silent data corruption | High | Always detect/validate charset first |
| **ETF for external APIs** | Interoperability failure | High | Use JSON for external, ETF for internal only |
| **Forgetting URL encoding** | Broken query parameters, injection | Medium | Use `URI.encode_www_form/1` for params |
| **Charset mismatch in OSINT** | Corrupted intelligence data | High | Detect charset, convert to UTF-8 at ingestion |
| **No payload size limits** | Memory exhaustion from large payloads | High | Enforce max payload size at API boundary |
| **String.to_atom with user input** | Atom table exhaustion | Critical | Use `String.to_existing_atom/1` or allowlist |
| **Mixing encoding contexts** | HTML encoded in URL context | Medium | Use context-appropriate encoding function |

## Best Practices

1. **Always use `:safe` flag when decoding ETF**: `:erlang.binary_to_term/2` with `[:safe]` prevents atom table exhaustion attacks from untrusted input. This is enforced by the ZERO doctrine.

2. **Validate UTF-8 at every system boundary**: Check encoding validity when receiving data from external sources -- API requests, file uploads, OSINT scraping, database imports from legacy systems.

3. **Use Jason for JSON encoding/decoding**: Jason provides the fastest JSON encoding/decoding in the Elixir ecosystem, with proper Unicode support and configurable encoding via the `Jason.Encoder` protocol.

4. **Encode output appropriately for context**: HTML encoding for web output, URL encoding for query parameters, Base64 for binary data in text contexts. Never mix encoding contexts.

5. **Prefer ETF over JSON for internal communication**: Erlang Term Format is faster and preserves Elixir types (atoms, tuples, PIDs) that JSON cannot represent. Use JSON only at external API boundaries.

6. **Never use `raw/1` with untrusted data**: Phoenix LiveView auto-escapes all dynamic content. Bypassing this with `raw/1` creates XSS vulnerabilities.

7. **Detect charset before conversion**: When ingesting data from OSINT sources or legacy systems, detect the character encoding before attempting conversion to UTF-8.

8. **Enforce payload size limits**: Apply maximum size limits on all incoming data to prevent memory exhaustion attacks via oversized JSON, Base64, or multipart payloads.

9. **Use `String.to_existing_atom/1` instead of `String.to_atom/1`**: When converting user-supplied strings to atoms, always use the `_existing_` variant to prevent atom table exhaustion.

10. **Pre-compress static assets with brotli**: For maximum compression ratio on static files, pre-compress with brotli at build time rather than compressing on-the-fly with gzip.

## Related Terms

- [HTTP](@/glossary/http.md) -- protocol requiring proper content and transfer encoding
- [Data Pipeline](@/glossary/data-pipeline.md) -- processing pipelines with encoding transformations at each stage
- [Injection](@/glossary/injection.md) -- vulnerability class prevented by proper output encoding
- [ETL](@/glossary/etl.md) -- extract-transform-load processes with encoding conversion
- [Binary](@/glossary/binary.md) -- the fundamental data type underlying all encoding operations
- [JSON](@/glossary/json.md) -- the primary serialization format for external API boundaries
- [API](@/glossary/api.md) -- system interfaces requiring consistent encoding contracts
- [XSS](@/glossary/xss.md) -- cross-site scripting prevented by HTML output encoding
- [Erlang](@/glossary/erlang.md) -- the runtime providing ETF and native binary handling
- [Ecto](@/glossary/ecto.md) -- database wrapper handling SQL encoding/decoding
- [Security](@/glossary/security.md) -- encoding as a security defense layer
- [Compression](/glossary/compression/) -- content encoding for transfer efficiency

## See Also

- [Technologies](@/technologies/_index.md) -- serialization technologies used in the platform
- [Architecture](@/architecture/_index.md) -- platform encoding architecture and data flow
- [Capabilities](@/capabilities/_index.md) -- platform capabilities requiring encoding support
- [Security](@/glossary/security.md) -- security implications of encoding decisions

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
