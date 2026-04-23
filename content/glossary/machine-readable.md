+++
title = "Machine-Readable"
weight = 50
[extra]
tags = ["glossary", "core", "data-formats", "automation", "interoperability", "api", "structured-data", "serialization"]
description = "Machine-readable refers to data formatted in a structured way that can be automatically parsed, processed, and interpreted by software without human intervention, enabling automation, API integration, and programmatic analysis across the Prismatic Platform."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["api", "json-schema", "openapi", "rest-api", "data-pipeline", "etl", "structured-logging", "schema", "metadata-management", "typespec"]
keywords = ["machine-readable", "structured data", "data formats", "JSON", "XML", "YAML", "API contracts", "schema validation", "data serialization", "programmatic access"]
testing_scenarios = ["JSON schema validation against OpenAPI spec", "round-trip serialization/deserialization correctness", "malformed input rejection with clear error messages", "encoding handling for international character sets", "backward compatibility of schema evolution"]
prerequisites = ["api", "schema"]
learning_path = ["schema", "json-schema", "machine-readable", "openapi", "rest-api", "api-gateway"]
date_created = "2026-02-22"
word_count = 1875
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Machine-Readable - Prismatic Platform"
+++

## Definition

**Machine-readable** describes data that is structured and formatted in a way that software systems can automatically parse, interpret, and process without human intervention. Machine-readable data follows well-defined schemas, uses consistent encoding, and adheres to standardized formats such as JSON, XML, YAML, CSV, Protocol Buffers, or MessagePack. The key distinction from human-readable data is that machine-readable formats prioritize unambiguous parsing and programmatic access over visual clarity, although many modern formats (notably JSON and YAML) achieve both.

Within the Prismatic Platform, machine-readability is a foundational architectural requirement. The platform's 115 umbrella applications communicate through machine-readable protocols, the 530 AIAD agents consume and produce machine-readable specifications, the Prismatic API auto-discovers endpoints through machine-readable type annotations, and the quality infrastructure outputs machine-readable reports that drive autonomous decision-making. Every configuration file, every API response, every quality metric, and every agent specification is designed for programmatic consumption.

## Overview

The concept of machine-readable data emerged alongside the earliest computers, which required strictly formatted punch cards and tape encodings. As computing evolved, so did the sophistication of machine-readable formats. The 1960s introduced standardized character encodings (ASCII, EBCDIC). The 1970s brought structured file formats and database query languages. The 1980s and 1990s produced XML and related standards (XSD, XSLT, XPath) for document interchange. The 2000s saw JSON emerge as a lighter-weight alternative, and the 2010s brought Protocol Buffers, MessagePack, and other binary formats optimized for performance.

The spectrum from human-readable to machine-readable is not binary but gradual. At one extreme, natural language text requires sophisticated NLP to parse computationally. At the other extreme, binary protocols like Protocol Buffers are highly efficient for machines but opaque to humans. In between lie formats like JSON and YAML that balance human readability with machine parseability -- a balance that makes them dominant in modern software development.

Machine-readability extends beyond data formats to encompass APIs, specifications, and documentation. An OpenAPI specification is machine-readable because tools can automatically generate client libraries, validation logic, and documentation from it. A typespec annotation in Elixir is machine-readable because Dialyzer can verify type correctness automatically. A Credo configuration is machine-readable because the static analysis tool can enforce coding standards without human interpretation.

The Prismatic Platform takes machine-readability to its logical conclusion: the entire platform's behavior is defined through machine-readable artifacts. AIAD agent specifications (`.agent.md` files with YAML frontmatter) define agent capabilities, authority levels, and interaction protocols. Policy documents define enforcement rules. Configuration files define runtime behavior. Quality DNA (`.claude/quality-dna/current-state.json`) persists quality metrics in machine-readable JSON for cross-session continuity. This commitment to machine-readability enables the platform's autonomous operations -- if an artifact cannot be parsed by software, it cannot participate in automated workflows.

The distinction between syntactically machine-readable and semantically machine-readable is important. A JSON file is syntactically machine-readable (any JSON parser can extract its structure), but semantic understanding requires a schema that defines what the fields mean, what values are valid, and how the data relates to other data. The Prismatic Platform enforces semantic machine-readability through OpenApiSpex schemas, Elixir typespecs, and explicit configuration validators.

## Technical Details

### Structured Data Encoding in Elixir

Elixir provides multiple approaches to machine-readable data handling. Jason is the standard JSON library, and built-in support for Erlang term format provides efficient binary serialization.

```elixir
defmodule Prismatic.Data.MachineReadable do
  @moduledoc """
  Utilities for producing and consuming machine-readable data
  across the Prismatic Platform. Ensures consistent serialization,
  schema validation, and format negotiation.
  """

  @type format :: :json | :msgpack | :etf | :csv | :yaml
  @type encode_result :: {:ok, binary()} | {:error, term()}
  @type decode_result :: {:ok, term()} | {:error, term()}

  @spec encode(term(), format()) :: encode_result()
  def encode(data, :json) do
    case Jason.encode(data, pretty: false) do
      {:ok, json} -> {:ok, json}
      {:error, reason} -> {:error, {:json_encode_failed, reason}}
    end
  end

  def encode(data, :etf) do
    try do
      {:ok, :erlang.term_to_binary(data, [:compressed])}
    rescue
      error -> {:error, {:etf_encode_failed, error}}
    end
  end

  def encode(_data, format) do
    {:error, {:unsupported_format, format}}
  end

  @spec decode(binary(), format()) :: decode_result()
  def decode(binary, :json) when is_binary(binary) do
    case Jason.decode(binary) do
      {:ok, decoded} -> {:ok, decoded}
      {:error, reason} -> {:error, {:json_decode_failed, reason}}
    end
  end

  def decode(binary, :etf) when is_binary(binary) do
    try do
      {:ok, :erlang.binary_to_term(binary, [:safe])}
    rescue
      error -> {:error, {:etf_decode_failed, error}}
    end
  end

  def decode(_binary, format) do
    {:error, {:unsupported_format, format}}
  end

  @doc """
  Validates data against a schema definition, ensuring
  semantic machine-readability beyond syntactic correctness.
  """
  @spec validate(map(), map()) :: :valid | {:invalid, list(String.t())}
  def validate(data, schema) when is_map(data) and is_map(schema) do
    errors =
      schema
      |> Enum.flat_map(fn {field, rules} ->
        validate_field(data, field, rules)
      end)

    case errors do
      [] -> :valid
      found -> {:invalid, found}
    end
  end

  defp validate_field(data, field, %{required: true} = rules) do
    case Map.get(data, field) do
      nil -> ["Field '#{field}' is required but missing"]
      value -> validate_value(field, value, rules)
    end
  end

  defp validate_field(data, field, rules) do
    case Map.get(data, field) do
      nil -> []
      value -> validate_value(field, value, rules)
    end
  end

  defp validate_value(field, value, %{type: :string}) when not is_binary(value) do
    ["Field '#{field}' must be a string, got #{inspect(value)}"]
  end
  defp validate_value(field, value, %{type: :integer}) when not is_integer(value) do
    ["Field '#{field}' must be an integer, got #{inspect(value)}"]
  end
  defp validate_value(_field, _value, _rules), do: []
end
```

### API Response Formatting

The Prismatic API ensures all responses are machine-readable with consistent structure, proper content types, and schema-compliant payloads.

```elixir
defmodule Prismatic.API.ResponseFormatter do
  @moduledoc """
  Formats all API responses in a consistent, machine-readable
  structure. Every response includes metadata (timestamp, version,
  request_id) alongside the payload, enabling automated processing
  by consumers.
  """

  @type response_envelope :: %{
    data: term(),
    meta: %{
      timestamp: String.t(),
      version: String.t(),
      request_id: String.t(),
      pagination: map() | nil
    },
    errors: list(error_detail()) | nil
  }

  @type error_detail :: %{
    code: String.t(),
    message: String.t(),
    field: String.t() | nil,
    detail: String.t() | nil
  }

  @spec success(term(), keyword()) :: response_envelope()
  def success(data, opts \\ []) do
    %{
      data: data,
      meta: %{
        timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
        version: "1.0.0",
        request_id: Keyword.get(opts, :request_id, generate_request_id()),
        pagination: Keyword.get(opts, :pagination)
      },
      errors: nil
    }
  end

  @spec error(list(error_detail()), keyword()) :: response_envelope()
  def error(errors, opts \\ []) do
    %{
      data: nil,
      meta: %{
        timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
        version: "1.0.0",
        request_id: Keyword.get(opts, :request_id, generate_request_id()),
        pagination: nil
      },
      errors: errors
    }
  end

  defp generate_request_id do
    :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
  end
end
```

### Machine-Readable Quality Reports

The quality infrastructure produces machine-readable output that drives autonomous decision-making in the Quality Floor Guardian and AutoHeal systems.

```elixir
defmodule Prismatic.Quality.MachineReport do
  @moduledoc """
  Generates machine-readable quality reports in JSON format.
  These reports are consumed by the Quality Floor Guardian,
  AutoHeal, AutoEvolve, and CI/CD pipeline for automated
  quality enforcement decisions.
  """

  @type quality_report :: %{
    score: non_neg_integer(),
    domains: map(),
    violations: list(violation()),
    timestamp: String.t(),
    generation: non_neg_integer(),
    pass: boolean()
  }

  @type violation :: %{
    domain: String.t(),
    severity: :warning | :error | :critical,
    file: String.t(),
    line: non_neg_integer() | nil,
    message: String.t(),
    rule: String.t()
  }

  @spec generate() :: {:ok, quality_report()}
  def generate do
    domains = evaluate_all_domains()

    score = domains
      |> Map.values()
      |> Enum.map(& &1.score)
      |> then(fn scores ->
        if scores == [], do: 0,
        else: Enum.sum(scores) |> div(length(scores))
      end)

    violations = domains
      |> Map.values()
      |> Enum.flat_map(& &1.violations)

    report = %{
      score: score,
      domains: Map.new(domains, fn {k, v} -> {k, Map.delete(v, :violations)} end),
      violations: violations,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      generation: 19,
      pass: score >= 95 and Enum.all?(violations, &(&1.severity != :critical))
    }

    {:ok, report}
  end

  defp evaluate_all_domains do
    %{
      dialyzer: %{score: 100, violations: []},
      credo: %{score: 100, violations: []},
      compilation: %{score: 100, violations: []},
      typespec: %{score: 100, violations: []},
      test_coverage: %{score: 100, violations: []}
    }
  end
end
```

### OpenAPI Auto-Introspection

The Prismatic API uses machine-readable Elixir type annotations to automatically generate OpenAPI specifications, eliminating the need for separate API documentation.

```elixir
defmodule Prismatic.API.TypeMapper do
  @moduledoc """
  Maps Elixir @spec AST to OpenAPI JSON Schema, enabling
  automatic machine-readable API documentation from source code.
  """

  @spec elixir_type_to_openapi(term()) :: map()
  def elixir_type_to_openapi(:string), do: %{"type" => "string"}
  def elixir_type_to_openapi(:integer), do: %{"type" => "integer"}
  def elixir_type_to_openapi(:float), do: %{"type" => "number", "format" => "float"}
  def elixir_type_to_openapi(:boolean), do: %{"type" => "boolean"}
  def elixir_type_to_openapi(:atom), do: %{"type" => "string"}
  def elixir_type_to_openapi({:list, inner_type}) do
    %{"type" => "array", "items" => elixir_type_to_openapi(inner_type)}
  end
  def elixir_type_to_openapi({:map, _key_type, value_type}) do
    %{"type" => "object", "additionalProperties" => elixir_type_to_openapi(value_type)}
  end
  def elixir_type_to_openapi(_unknown), do: %{"type" => "object"}
end
```

## Implementation in Prismatic Platform

### AIAD Agent Specifications

Every one of the 530 AIAD agents is defined through a machine-readable `.agent.md` file containing YAML frontmatter. This frontmatter specifies the agent's name, tier, authority level, capabilities, dependencies, enforcement requirements, and interaction protocols. Tools like `./.aiad/bin/aiad index` parse these specifications to build the agent registry, validate inter-agent dependencies, and enforce policy compliance. Without machine-readable agent specs, the autonomous agent orchestration system could not function.

### Prismatic API Auto-Discovery

The Prismatic API (port 4004) demonstrates machine-readability at its most powerful. At boot time, the Scanner module introspects all `Prismatic*` facade modules using `Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`, and `Module.__info__/1`. These machine-readable metadata sources are automatically converted into OpenAPI 3.0 specifications, route definitions, and type-safe request/response schemas. The result is a fully documented REST API generated entirely from source code annotations -- zero manual API documentation required.

### Quality DNA Persistence

The Quality DNA system stores quality metrics in machine-readable JSON at `.claude/quality-dna/current-state.json` within each of the 115 umbrella applications. These files are consumed by the Quality Floor Guardian to track quality trends across sessions, by the AutoHeal system to identify degradation, and by the AutoEvolve system to drive fitness improvements. The machine-readable format enables autonomous quality management without human interpretation of dashboards or reports.

### Structured Logging

The platform uses structured logging in JSON format, making every log entry machine-readable. Log entries include timestamps, severity levels, module origins, correlation IDs, and structured data payloads. This enables automated log analysis, alerting, and debugging through tools that parse the machine-readable format rather than regex-matching against human-readable text.

### Configuration as Machine-Readable Code

All platform configuration uses Elixir's `config/*.exs` files, which are themselves machine-readable Elixir code. This approach provides type safety (compile-time validation), composability (environment-specific overrides), and traceability (version-controlled in git). The pre-commit hooks validate configuration consistency by parsing these machine-readable files and checking for contradictions.

## Comparison

| Format | Human-Readable | Machine-Readable | Parse Speed | Schema Support | Prismatic Usage |
|---|---|---|---|---|---|
| **JSON** | Good | Excellent | Fast | JSON Schema, OpenAPI | API responses, Quality DNA, config |
| **YAML** | Excellent | Good | Moderate | JSON Schema | AIAD specs, CI/CD, policies |
| **XML** | Moderate | Good | Slow | XSD, DTD, RelaxNG | Legacy integrations only |
| **Protocol Buffers** | Poor | Excellent | Very Fast | Built-in (.proto) | Not currently used |
| **Elixir Terms (.exs)** | Good | Excellent | Fast | Typespecs, Dialyzer | Configuration, mix tasks |
| **CSV** | Good | Moderate | Fast | None built-in | Data exports, OSINT imports |
| **TOML** | Good | Good | Fast | None standard | Zola site configuration |
| **Natural Language** | Excellent | Poor | Requires NLP | None | User-facing documentation |

## Best Practices

**Define schemas before data.** Always start with a schema definition that specifies field names, types, required/optional status, and valid ranges. Use JSON Schema for JSON data, OpenApiSpex for API contracts, and Elixir typespecs for function signatures. A schema transforms syntactically parseable data into semantically meaningful data.

**Use consistent envelope patterns.** All API responses should follow a consistent structure (data, meta, errors) that consumers can rely on. This enables generic client libraries that handle pagination, error extraction, and metadata processing without per-endpoint customization.

**Version your machine-readable formats.** Include a version field in all machine-readable data structures. When schemas evolve, consumers need to know which version they are processing. The Prismatic Platform includes version fields in API responses, quality reports, and agent specifications.

**Prefer text-based formats for configuration.** While binary formats are more efficient, text-based formats (JSON, YAML, TOML) are diff-friendly, version-control-friendly, and debuggable. Reserve binary formats for high-throughput data paths where parsing performance matters.

**Validate on both producer and consumer.** The producer should validate that data conforms to the schema before serialization. The consumer should validate after deserialization. This defense-in-depth approach catches errors at the earliest possible point and prevents corrupted data from propagating through the system.

**Include metadata in all machine-readable outputs.** Timestamps, versions, source identifiers, and correlation IDs enable automated tracing, debugging, and auditing. The Prismatic API includes these in every response envelope.

## Common Pitfalls

**Assuming parsing equals understanding.** Just because a JSON parser can extract field values does not mean the consuming system understands the data. Without schema documentation, field names are ambiguous, value ranges are unknown, and relationships between fields are unclear. Always pair data formats with schema definitions.

**Overloading human-readable formats.** Embedding complex machine-readable structures in formats designed for human consumption (like Markdown) creates brittle parsing. The AIAD `.agent.md` files use YAML frontmatter (machine-readable) separated from Markdown body (human-readable), keeping the two concerns distinct.

**Ignoring encoding issues.** Machine-readable data must handle character encoding explicitly. UTF-8 is the universal standard, but edge cases with BOM markers, surrogate pairs, and non-printable characters can cause subtle parsing failures. Always specify encoding explicitly and validate input encoding before processing.

**Breaking backward compatibility.** When you change a machine-readable schema, existing consumers may break. Follow semantic versioning for schemas: additive changes (new optional fields) are backward-compatible, removals and type changes are breaking. The Prismatic API versions its specification to manage schema evolution.

**Using machine-readable formats for human workflows.** Requiring users to edit JSON or YAML directly is error-prone. Provide CLI tools, web interfaces, or template generators that produce machine-readable output from human-friendly input. The AIAD command system provides user-friendly commands that generate machine-readable agent specifications.

**Neglecting error formats.** Machine-readable error responses are as important as success responses. Structured error formats with error codes, messages, field references, and remediation hints enable automated error handling and recovery.

## Use Cases

**Auto-Introspecting REST API**: The Prismatic API demonstrates the ultimate machine-readable architecture. Elixir source code with typespecs and docs annotations is the single source of truth. The API scanner reads these machine-readable annotations at boot time and generates a complete OpenAPI 3.0 specification, route table, and Swagger UI. Adding a new API endpoint requires only writing an Elixir function with proper typespecs -- no separate API documentation, no route configuration, no schema definition.

**Quality Infrastructure Automation**: The entire quality pipeline operates on machine-readable data. `mix quality.gates` produces machine-readable exit codes and JSON output. The pre-commit hooks parse these outputs to make pass/fail decisions. The Quality Floor Guardian consumes quality reports to trigger auto-healing. No human reads a dashboard to decide if quality is acceptable -- the machine-readable pipeline handles it autonomously.

**AIAD Agent Orchestration**: The 530 AIAD agents are defined, discovered, validated, and orchestrated through machine-readable specifications. The `./.aiad/bin/aiad index` command parses all agent specifications, builds a dependency graph, validates enforcement requirements, and produces a machine-readable registry. This enables automated agent deployment, capability discovery, and policy enforcement.

**OSINT Data Integration**: The 120 OSINT tools consume machine-readable data from external sources (JSON APIs from Shodan, VirusTotal, ARES) and produce machine-readable intelligence reports. Entity resolution, risk scoring, and compliance assessment all operate on structured, schema-validated data that flows through the pipeline without human interpretation.

**CI/CD Pipeline Integration**: The GitLab CI/CD pipeline consumes machine-readable test results, quality gate outputs, and deployment configurations. Every pipeline stage produces machine-readable artifacts that subsequent stages consume, enabling fully automated build-test-deploy workflows.

## Related Concepts

Machine-readable data connects to data management and API concepts across the platform:

- [API](@/glossary/api.md) -- the primary interface through which machine-readable data is exchanged between systems
- [JSON Schema](@/glossary/json-schema.md) -- the schema language for validating machine-readable JSON data
- [OpenAPI](@/glossary/openapi.md) -- the machine-readable specification standard for REST API contracts
- [REST API](@/glossary/rest-api.md) -- the architectural style for machine-readable web service interfaces
- [Data Pipeline](@/glossary/data-pipeline.md) -- the infrastructure for processing and transforming machine-readable data flows
- [ETL](@/glossary/etl.md) -- Extract, Transform, Load operations on machine-readable data sources
- [Structured Logging](@/glossary/structured-logging.md) -- machine-readable log entries enabling automated analysis
- [Schema](@/glossary/schema.md) -- the structural definition that gives semantic meaning to machine-readable data
- [Metadata Management](@/glossary/metadata-management.md) -- organizing and maintaining machine-readable descriptive information
- [Typespec](@/glossary/typespec.md) -- Elixir's machine-readable type annotation system

## See Also

- [Prismatic API](@/glossary/prismatic-api.md) -- the auto-introspecting REST gateway built on machine-readable type annotations
- [OpenAPI Spec](@/glossary/openapi-spec.md) -- the machine-readable API specification generated by the Prismatic API
- [Swagger UI](@/glossary/swagger-ui.md) -- the interactive documentation generated from machine-readable OpenAPI specs
- [AIAD](@/glossary/aiad.md) -- the agent standard using machine-readable YAML specifications
- [Quality DNA](@/glossary/quality-dna.md) -- machine-readable JSON persistence for quality metrics
- [Dialyzer](@/glossary/dialyzer.md) -- static analysis consuming machine-readable typespecs

---

**Connect & Contribute**: This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) documentation. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Contributions welcome via [GitHub](https://github.com/korczis/prismatic-platform) or [GitLab](https://gitlab.com/korczis/prismatic-platform).
