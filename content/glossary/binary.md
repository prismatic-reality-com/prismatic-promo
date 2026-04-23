+++
title = "Binary"
weight = 50
[extra]
description = "In Elixir/BEAM, a contiguous sequence of bytes used for efficient string representation, file I/O, network data, protocol encoding, and cryptographic operations -- the fundamental data type for raw byte manipulation with zero-copy sharing between processes"
category = "architecture"
domain = "beam-internals"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["compile-time", "artifact", "aes", "csv", "cache", "ets", "genserver", "pattern-matching", "iodata", "string", "encoding", "protocol", "cryptography", "erlang"]
tags = ["glossary", "binary", "elixir", "beam", "bytes", "string", "io", "encoding", "protocol", "otp", "pattern-matching", "refc-binary", "heap-binary", "sub-binary", "iodata", "binary-copy"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "24 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Binaries are the BEAM's fundamental byte sequence type, powering efficient string handling, network I/O, and cryptographic operations throughout the Prismatic Platform, with reference-counted sharing for zero-copy inter-process communication"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["binary", "Elixir binary", "BEAM binary", "byte sequence", "bitstring", "binary pattern matching", "iodata", "binary heap", "reference-counted binary", "heap binary", "sub-binary", "match context", "binary copy", "binary memory", "zero-copy", "binary protocol"]
image = "/images/sections/glossary.png"
image_alt = "Binary - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

In Elixir and the BEAM virtual machine, a binary is a contiguous sequence of bytes represented as a first-class data type. Binaries serve as the foundation for strings (Elixir strings are UTF-8 encoded binaries), file I/O operations, network protocol data, cryptographic operations, and any scenario requiring raw byte manipulation. The BEAM provides two storage strategies for binaries: heap binaries (up to 64 bytes, stored directly in process heap) and reference-counted binaries (larger than 64 bytes, stored in a shared binary heap with reference counting for efficient sharing between processes).

The binary type is one of the BEAM's most carefully engineered data structures. Unlike languages where strings are arrays of characters or objects with method dispatch overhead, BEAM binaries are raw byte sequences with O(1) size calculation, O(1) sub-binary creation, and compiler-optimized pattern matching that compiles to native code jump tables. This design makes binaries exceptionally efficient for parsing network protocols, processing HTTP responses, and handling file I/O -- all operations central to an intelligence platform.

In the Prismatic Platform, binaries are used extensively for HTTP response handling in OSINT adapters, AES-256-GCM encryption operations, CSV parsing in the DD pipeline, Phoenix channel data transmission, WebSocket message framing, binary protocol parsing for network intelligence, and ETS key-value storage where binary keys enable efficient lookups.

## Core Concepts

### Binary Types in the BEAM

| Type | Size | Storage Location | GC Behavior | Creation Cost | Sharing Cost |
|------|------|------------------|-------------|---------------|--------------|
| **Heap binary** | <= 64 bytes | Process heap | Normal process GC | Allocation + copy | Full copy between processes |
| **Refc binary** | > 64 bytes | Shared binary heap | Reference-counted | Allocation + copy | Reference copy only (~word size) |
| **Sub-binary** | Any | Points to existing binary | Shares parent reference | Constant (pointer + offset) | Reference copy |
| **Match context** | N/A | Optimized for pattern matching | Temporary, stack-allocated | Compiler-generated | Not shareable |

### Binary Operations Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `byte_size/1` | O(1) | Size stored in binary header |
| `binary_part/3` | O(1) | Creates sub-binary reference |
| Pattern match extraction | O(1) per fixed field | Compiled to native code |
| `<>` concatenation | O(n+m) | Copies both operands |
| IO list concatenation | O(1) | Deferred to output |
| `:binary.copy/1` | O(n) | Full copy, breaks reference |
| `String.split/2` | O(n) | Creates sub-binary list |
| `:erlang.term_to_binary/1` | O(n) | Serialization for ETS/distribution |

### Binary Encoding Formats

| Encoding | Bytes per Char | Use Case | Prismatic Usage |
|----------|---------------|----------|-----------------|
| **UTF-8** | 1-4 | Elixir strings, JSON, HTML | All text processing |
| **Latin-1** | 1 | Legacy encodings, charlists | Czech registry data (ISO-8859-2) |
| **Raw bytes** | 1 | Cryptographic data, hashes | AES ciphertext, SHA-256 digests |
| **Base64** | 4/3 ratio | Text-safe binary transport | API authentication tokens |
| **Hex** | 2 per byte | Human-readable binary display | Content hash display |

### Memory Layout

| Component | Size | Purpose |
|-----------|------|---------|
| **Binary header** | 1-3 words | Type tag, size, flags |
| **Refc header** | Additional 2 words | Reference count, pointer to data |
| **ProcBin** | 4-5 words per process | Per-process handle to refc binary |
| **Sub-binary header** | 3-4 words | Offset, size, pointer to parent |
| **Match context** | 4-5 words | Current position, remaining bits |

## Technical Deep Dive

### Reference-Counted Binary Internals

When a binary exceeds 64 bytes, the BEAM allocates it on a shared binary heap outside any process. Each process that holds a reference to this binary has a ProcBin structure on its process heap -- a lightweight handle containing a pointer to the shared data and participating in reference counting.

This architecture has profound implications for concurrent systems:

1. **Zero-copy message passing**: When a process sends a large binary in a message, only the ProcBin (approximately 5 words / 40 bytes on 64-bit) is copied. The binary data itself is shared. This makes distributing large HTTP response bodies across worker tasks nearly free.

2. **Garbage collection interaction**: The BEAM's per-process garbage collector tracks ProcBin structures. When a process's GC runs and finds a ProcBin is no longer reachable, it decrements the reference count. When the count reaches zero, the shared binary is freed. However, GC is triggered by heap growth -- a process that holds a reference to a large binary but allocates few new terms may not GC for a long time, keeping the binary alive.

3. **Binary memory pressure**: The BEAM tracks total binary memory separately. When binary memory exceeds a threshold, it can trigger forced GC across processes. You can monitor this with `:erlang.memory(:binary)` and per-process with `Process.info(pid, :binary)`.

### Sub-Binary Optimization

When you extract a portion of a binary using pattern matching or `binary_part/3`, the BEAM creates a sub-binary rather than copying the data. A sub-binary is a small header containing an offset and length pointing into the parent binary.

This optimization is critical for parsing protocols where you extract headers from a large packet -- the header extraction is O(1) regardless of packet size. However, it creates a hidden dependency: the sub-binary keeps the entire parent binary alive. If you extract a 10-byte header from a 10MB HTTP response and discard the response, the 10MB remains in memory because the sub-binary references it.

The solution is `:binary.copy/1`, which creates an independent copy of the sub-binary's data, releasing the reference to the parent. Use this when storing small extracts from large binaries in long-lived processes or ETS tables.

### Match Context Optimization

The BEAM compiler applies a critical optimization to sequential binary pattern matches. Instead of creating a new sub-binary for each match clause, it reuses a single "match context" -- a mutable structure that tracks the current position in the binary.

This means parsing a binary protocol with multiple sequential matches:

```elixir
<<version::8, length::16, type::8, payload::binary-size(length), rest::binary>> = packet
```

compiles to a single pass through the binary with no intermediate allocations. The compiler can apply this optimization when matches are in sequence and the binary variable flows directly from one match to the next. Introducing a function call or variable rebinding between matches can prevent the optimization.

### IO Lists: The Binary Concatenation Alternative

Binary concatenation with `<>` copies both operands into a new binary. For building responses incrementally, this creates O(n^2) behavior as each concatenation copies all previous data.

IO lists solve this by deferring concatenation to the final output stage. An IO list is a nested list of binaries, charlists, and other IO lists that the BEAM's I/O subsystem flattens efficiently into a single binary at write time. Phoenix and Plug use IO lists throughout their response pipeline, which is why building responses with lists is idiomatic:

```elixir
# O(n^2) - avoid
result = "{"
result = result <> "\"key\":"
result = result <> "\"value\""
result = result <> "}"

# O(n) - prefer
result = ["{", "\"key\":", "\"value\"", "}"]
```

Jason's `encode_to_iodata!/1` returns IO lists for this reason, and `Plug.Conn.send_resp/3` accepts IO lists natively.

## Usage in Prismatic Platform

- **OSINT Adapters**: HTTP response bodies (often 100KB-10MB) are received as binaries. Tesla's HTTP client returns binary bodies that are passed through adapter-specific parsers using binary pattern matching. Sub-binary references are used for header extraction; `:binary.copy/1` is applied before ETS storage.
- **AES-256-GCM Encryption**: The `prismatic_auth` app uses binaries for plaintext, ciphertext, initialization vectors (12 bytes), authentication tags (16 bytes), and keys (32 bytes). Binary pattern matching extracts these fixed-size fields from encrypted payloads.
- **CSV Processing**: The DD pipeline parses CSV data from binary streams. `String.split/2` creates sub-binary references for each field, minimizing memory allocation during large file processing.
- **Phoenix Channels**: WebSocket message payloads are transmitted as binaries. Phoenix's channel serializer converts Elixir terms to binary format for efficient wire transmission.
- **ETS Storage**: Binary keys and values in ETS tables benefit from heap binary optimization -- keys under 64 bytes are stored directly in the ETS table without reference counting overhead.
- **Content Hashing**: SHA-256 digests (32-byte binaries) are used for entity deduplication in the DD pipeline. Binary comparison of hashes is O(n) with early termination on mismatch.
- **Network Intelligence**: Binary protocol parsing for ASN lookups, DNS response decoding, and TLS certificate extraction uses pattern matching for structured field extraction.
- **Base64 Encoding**: API tokens and binary payloads are Base64-encoded for transport in JSON responses. `Base.encode64/1` and `Base.decode64!/1` operate on raw binary data.

## Code Examples

### Binary Protocol Parser with Match Context Optimization

```elixir
defmodule PrismaticOsintCore.BinaryParser do
  @moduledoc """
  Efficient binary parsing for OSINT adapter response processing.

  Uses binary pattern matching for zero-copy extraction of
  structured data from raw HTTP response bodies. Supports JSON,
  CSV, and custom binary protocol formats with format detection
  based on content-type headers and magic bytes.

  ## Architecture

  The parser exploits BEAM match context optimization for sequential
  field extraction, creating sub-binary references rather than copies.
  For long-lived storage, extracted fields are copied via
  `:binary.copy/1` to prevent parent binary retention.

  ## Examples

      iex> {:ok, data} = PrismaticOsintCore.BinaryParser.parse_response(
      ...>   ~s({"name": "test"}),
      ...>   :json
      ...> )
      iex> data["name"]
      "test"
  """

  require Logger

  @type parse_result :: {:ok, map()} | {:error, :invalid_format | :unsupported_format}

  @type format :: :json | :csv | :xml | :binary_protocol

  @doc """
  Parse an HTTP response body based on the specified format.

  Dispatches to format-specific parsers that use binary pattern
  matching for efficient extraction. Returns structured data
  or an error tuple.

  ## Examples

      iex> PrismaticOsintCore.BinaryParser.parse_response("{}", :json)
      {:ok, %{}}

      iex> PrismaticOsintCore.BinaryParser.parse_response("invalid", :json)
      {:error, :invalid_format}
  """
  @spec parse_response(binary(), format()) :: parse_result()
  def parse_response(body, :json) when is_binary(body) do
    case Jason.decode(body) do
      {:ok, decoded} -> {:ok, decoded}
      {:error, _} -> {:error, :invalid_format}
    end
  end

  def parse_response(body, :csv) when is_binary(body) do
    rows =
      body
      |> String.split("\n", trim: true)
      |> Enum.map(&String.split(&1, ","))

    case rows do
      [headers | data] -> {:ok, %{headers: headers, rows: data}}
      _ -> {:error, :invalid_format}
    end
  end

  def parse_response(_body, _format), do: {:error, :unsupported_format}

  @doc """
  Extract a fixed-size field from a binary at a given offset.

  Creates a sub-binary reference (O(1)) for the extracted field.
  Use `:binary.copy/1` on the result if storing long-term to
  prevent parent binary retention.

  ## Examples

      iex> {:ok, field} = PrismaticOsintCore.BinaryParser.extract_field(
      ...>   "Hello, World!",
      ...>   7,
      ...>   5
      ...> )
      iex> field
      "World"
  """
  @spec extract_field(binary(), non_neg_integer(), non_neg_integer()) ::
          {:ok, binary()} | {:error, :out_of_bounds}
  def extract_field(data, offset, length) when byte_size(data) >= offset + length do
    <<_skip::binary-size(offset), field::binary-size(length), _rest::binary>> = data
    {:ok, field}
  end

  def extract_field(_data, _offset, _length), do: {:error, :out_of_bounds}

  @doc """
  Extract a field and copy it to break the parent binary reference.

  Use this when the extracted field will be stored in a long-lived
  process, ETS table, or database, and the parent binary can be
  garbage collected.

  ## Examples

      iex> large_binary = String.duplicate("x", 1000)
      iex> {:ok, field} = PrismaticOsintCore.BinaryParser.extract_and_copy(
      ...>   large_binary, 0, 10
      ...> )
      iex> byte_size(field)
      10
  """
  @spec extract_and_copy(binary(), non_neg_integer(), non_neg_integer()) ::
          {:ok, binary()} | {:error, :out_of_bounds}
  def extract_and_copy(data, offset, length) do
    case extract_field(data, offset, length) do
      {:ok, field} -> {:ok, :binary.copy(field)}
      error -> error
    end
  end

  @doc """
  Detect binary format from magic bytes.

  Inspects the first bytes of a binary to determine its format
  without parsing the entire content.

  ## Examples

      iex> PrismaticOsintCore.BinaryParser.detect_format(~s({"key": "value"}))
      :json

      iex> PrismaticOsintCore.BinaryParser.detect_format("name,age\\nAlice,30")
      :csv
  """
  @spec detect_format(binary()) :: format() | :unknown
  def detect_format(<<"{", _rest::binary>>), do: :json
  def detect_format(<<"[", _rest::binary>>), do: :json
  def detect_format(<<"<?xml", _rest::binary>>), do: :xml
  def detect_format(<<"<", _rest::binary>>), do: :xml

  def detect_format(data) when is_binary(data) do
    if String.contains?(data, ",") and String.contains?(data, "\n") do
      :csv
    else
      :unknown
    end
  end
end
```

### Efficient Binary Construction with IO Lists

```elixir
defmodule PrismaticAPI.ResponseBuilder do
  @moduledoc """
  Builds API responses using IO lists for efficient binary concatenation.

  IO lists avoid the O(n^2) cost of repeated `<>` concatenation by
  deferring flattening to the final I/O write. Phoenix and Plug
  handle IO lists natively in response bodies.

  ## Performance

  For a response built from 100 fragments averaging 1KB each:
  - Binary concatenation: ~5ms (copies data at each step)
  - IO list construction: ~0.05ms (list cons cells only)
  - IO list flattening at write: ~0.1ms (single pass)

  ## Examples

      iex> iodata = PrismaticAPI.ResponseBuilder.build_json_response(%{status: "ok"})
      iex> IO.iodata_to_binary(iodata) =~ "status"
      true
  """

  @doc """
  Build a versioned JSON response as an IO list.

  The response is wrapped in a version envelope without copying
  the encoded payload data.
  """
  @spec build_json_response(map()) :: iodata()
  def build_json_response(data) do
    encoded = Jason.encode_to_iodata!(data)
    [~c"{\"version\":\"v1\",\"data\":", encoded, ~c"}"]
  end

  @doc """
  Build a chunked response body from a list of items.

  Each item is encoded independently and joined with newlines
  using IO list construction for zero-copy assembly.
  """
  @spec build_ndjson_response([map()]) :: iodata()
  def build_ndjson_response(items) when is_list(items) do
    items
    |> Enum.map(&Jason.encode_to_iodata!/1)
    |> Enum.intersperse("\n")
  end
end
```

### Binary Memory Monitoring

```elixir
defmodule PrismaticTelemetry.BinaryMemoryMonitor do
  @moduledoc """
  Monitors BEAM binary memory usage and emits telemetry events
  when thresholds are exceeded.

  Large binary accumulation is a common memory issue in systems
  processing HTTP responses. This monitor tracks system-wide
  binary memory and per-process binary holdings to identify
  processes retaining large binaries.

  ## Examples

      iex> report = PrismaticTelemetry.BinaryMemoryMonitor.snapshot()
      iex> is_integer(report.total_binary_memory)
      true
  """

  require Logger

  @type memory_report :: %{
          total_binary_memory: non_neg_integer(),
          process_count: non_neg_integer(),
          top_holders: [{pid(), non_neg_integer()}]
        }

  @doc """
  Take a snapshot of current binary memory usage.

  Returns total binary memory, process count, and the top 10
  processes by binary memory holding.
  """
  @spec snapshot() :: memory_report()
  def snapshot do
    total = :erlang.memory(:binary)

    top_holders =
      Process.list()
      |> Enum.map(fn pid ->
        case Process.info(pid, :binary) do
          {:binary, bins} ->
            total_size = bins |> Enum.map(&elem(&1, 1)) |> Enum.sum()
            {pid, total_size}

          nil ->
            {pid, 0}
        end
      end)
      |> Enum.sort_by(&elem(&1, 1), :desc)
      |> Enum.take(10)

    %{
      total_binary_memory: total,
      process_count: length(Process.list()),
      top_holders: top_holders
    }
  end
end
```

## Common Pitfalls

| Pitfall | Symptom | Root Cause | Solution |
|---------|---------|------------|----------|
| **Sub-binary memory leak** | Steadily growing memory | Small sub-binary keeps large parent alive | Use `:binary.copy/1` before long-term storage |
| **O(n^2) concatenation** | Slow response building | Repeated `<>` concatenation | Use IO lists and `IO.iodata_to_binary/1` at the end |
| **Unsafe binary_to_term** | Remote code execution | `:erlang.binary_to_term(data)` without `:safe` | Always use `:erlang.binary_to_term(data, [:safe])` |
| **Charlist confusion** | `~c"hello"` vs `"hello"` | Single-quoted strings are charlists, not binaries | Use double quotes for binaries; `is_binary/1` to verify |
| **UTF-8 byte vs char count** | Wrong string truncation | `byte_size/1` differs from `String.length/1` for multi-byte | Use `String.slice/3` for character-aware truncation |
| **Binary pattern in guard** | Compilation error | Pattern matching in guard clauses is limited | Move binary matches to function head, not `when` clause |
| **Forced GC not triggered** | Binary memory grows unbounded | Process holds ProcBin but does not allocate enough to trigger GC | Call `:erlang.garbage_collect(pid)` or increase binary_alloc threshold |
| **Large binary in message** | Unexpected copy cost | Binary <= 64 bytes copied in full (heap binary) | Only refc binaries (>64 bytes) benefit from zero-copy sharing |
| **Match context broken** | Slower parsing performance | Function call between sequential matches breaks optimization | Keep sequential matches in the same function clause |
| **Bitstring vs binary** | Runtime match failure | Bitstring has non-byte-aligned bits | Ensure data is byte-aligned or use `::bitstring` type |

## Best Practices

1. **Use pattern matching, not byte-at-a-time access**: Binary pattern matching is compiled to efficient native code with match context optimization. Avoid `binary_part/3` when patterns suffice -- the compiler generates better code for pattern matches.

2. **Prefer IO lists over binary concatenation**: Building responses with IO lists (`[a, b, c]`) avoids the O(n^2) copying that `a <> b <> c` requires. Phoenix, Plug, and Jason all support IO lists natively.

3. **Watch for binary memory leaks from sub-binaries**: Sub-binaries hold references to parent binaries. A 10-byte sub-binary can keep a 10MB parent alive. Monitor with `:erlang.memory(:binary)`.

4. **Use `:binary.copy/1` to break references**: When storing small extracts from large binaries in ETS, GenServer state, or database fields, copy them to release the parent. The copy cost is proportional to the extract size, not the parent size.

5. **Profile binary memory per process**: Use `Process.info(pid, :binary)` to identify processes retaining large binaries. The `recon` library provides `recon:bin_leak/1` for finding processes with stale binary references.

6. **Always use `:safe` option with `binary_to_term`**: Never call `:erlang.binary_to_term(data)` on untrusted input. The `:safe` option prevents atom creation and function references, blocking remote code execution attacks.

7. **Use `String.valid?/1` before UTF-8 operations**: External binary data may not be valid UTF-8. Attempting `String.downcase/1` or regex matching on invalid UTF-8 raises an error. Validate encoding at the system boundary.

8. **Leverage binary comprehensions for transformation**: Binary comprehensions (`for <<byte <- data>>, do: ...`) provide a clean syntax for byte-level transformations with good performance characteristics.

9. **Prefer `Jason.encode_to_iodata!/1` over `Jason.encode!/1`**: The iodata variant avoids a final binary concatenation step, which matters when the result flows directly to an I/O operation like `send_resp/3`.

10. **Monitor system binary memory in production**: Set up telemetry events for `:erlang.memory(:binary)` and alert when binary memory exceeds expected thresholds. Binary leaks are among the most common memory issues in long-running BEAM applications.

## Related Terms

- [AES](@/glossary/aes.md) -- cryptographic operations on binaries (ciphertext, IVs, keys)
- [CSV](@/glossary/csv.md) -- text data format parsed from binary streams
- [Artifact](@/glossary/artifact.md) -- compiled binary artifacts in the build pipeline
- [ETS](@/glossary/ets.md) -- in-memory storage with binary keys and values
- [Cache](@/glossary/cache.md) -- caching binary data with TTL expiration
- [Encoding](@/glossary/encoding.md) -- binary encoding formats (UTF-8, Base64, hex)
- [Pattern Matching](@/glossary/pattern-matching.md) -- binary pattern matching syntax and optimization
- [GenServer](@/glossary/genserver.md) -- processes holding binary state with GC implications
- [Compile-time](@/glossary/compile-time.md) -- binary literal compilation and optimization
- [Telemetry](@/glossary/telemetry.md) -- binary memory monitoring instrumentation
- [String](/glossary/string/) -- UTF-8 encoded binaries with Unicode operations
- [Protocol](@/glossary/protocol.md) -- binary protocol parsing for network intelligence

## See Also

- [Elixir Binary Documentation](https://hexdocs.pm/elixir/binaries-strings-and-charlists.html) -- official guide to binaries and strings
- [BEAM Binary Internals](https://www.erlang.org/doc/efficiency_guide/binaryhandling.html) -- efficiency guide for binary handling
- [Recon Library](https://hex.pm/packages/recon) -- binary leak detection and process inspection
- [Binary Module](https://www.erlang.org/doc/man/binary.html) -- Erlang binary manipulation functions
- [IO Data](https://hexdocs.pm/elixir/IO.html#module-io-data) -- IO list documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
