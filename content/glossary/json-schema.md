+++
title = "JSON Schema"
weight = 50
[extra]
tags = ["glossary", "technical", "json", "schema", "validation", "api", "openapi", "data-modeling", "specification"]
description = "JSON Schema is a declarative vocabulary for annotating and validating the structure, content, and semantics of JSON documents, enabling automated data validation, API contract enforcement, documentation generation, and code generation across programming languages and platforms."
category = "data"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_terms = ["openapi", "rest-api", "validation", "schema", "api-gateway", "typespec", "specification", "machine-readable", "documentation", "ecto"]
aliases = ["json-schema-validation", "json-schema-spec", "jsonschema"]
prerequisites = ["api", "rest-api", "schema"]
use_cases = ["api-validation", "configuration-validation", "data-modeling", "code-generation"]
word_count = 1697
date_modified = "2026-02-23"
keywords = ["JSON", "Schema", "glossary", "data", "Prismatic Platform", "JSON Schema", "Elixir", "OpenAPI"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "JSON Schema - Prismatic Platform"
+++

## Definition

**JSON Schema** is a declarative language for defining the structure, constraints, and semantics of JSON data. Written in JSON itself, a JSON Schema document describes what constitutes valid data for a given context: which properties are required, what types values must have, what ranges numbers must fall within, what patterns strings must match, and how nested structures must be organized. JSON Schema serves as a machine-readable contract between data producers and consumers, enabling automated validation, documentation generation, and code generation.

The specification is maintained by the JSON Schema organization and has progressed through several drafts, with Draft 2020-12 being the most recent stable version. JSON Schema is not tied to any specific programming language, framework, or platform. Validators exist for virtually every major programming language, making it a universal data contract format for heterogeneous systems.

JSON Schema occupies a specific niche in the data validation landscape: it validates the shape and content of JSON documents, not the business logic that produces or consumes them. A JSON Schema can ensure that an age field is a non-negative integer, but it cannot validate that the age value is consistent with a birth date field. Business rule validation remains the responsibility of application code.

## Overview

JSON's dominance as a data interchange format created a need for a formal way to describe and validate JSON structure. Before JSON Schema, validation was implemented ad-hoc in each application, leading to inconsistent validation rules, duplicated validation logic, and undocumented data contracts. JSON Schema addresses all three problems by providing a single source of truth for data structure that is both human-readable and machine-processable.

The relationship between JSON Schema and JSON data mirrors the relationship between a type system and values in a programming language. Just as a TypeScript interface defines what properties an object must have and what types those properties must be, a JSON Schema defines what properties a JSON document must contain and what constraints those properties must satisfy. The difference is that JSON Schema operates at the data exchange boundary, not at the language level.

In the broader API ecosystem, JSON Schema is a foundational building block. The OpenAPI Specification (formerly Swagger) uses JSON Schema to define request and response bodies. GraphQL's type system shares conceptual overlap with JSON Schema. Configuration management tools like Kubernetes and Terraform use JSON Schema for configuration file validation. Even IDE features like JSON file autocompletion rely on JSON Schema definitions.

Within the Prismatic Platform, JSON Schema plays several critical roles. The auto-introspecting REST API gateway maps Elixir `@spec` type annotations to JSON Schema types when generating OpenAPI specifications. Configuration files across the 115 umbrella applications are validated against JSON Schemas to catch errors early. And the AIAD agent specification format uses JSON Schema for structural validation of agent definition files.

## Technical Details

### JSON Schema Structure

A JSON Schema document is itself a JSON object with specific keywords that define validation rules:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://prismatic-platform.dev/schemas/agent-config.json",
  "title": "Agent Configuration",
  "description": "Configuration schema for Prismatic AIAD agents",
  "type": "object",
  "required": ["name", "tier", "domain", "authority_level"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]+$",
      "minLength": 3,
      "maxLength": 64,
      "description": "Unique identifier for the agent"
    },
    "tier": {
      "type": "string",
      "enum": ["L1", "L2", "L3", "L4", "L5"],
      "description": "Agent authority tier"
    },
    "domain": {
      "type": "string",
      "description": "Operational domain of the agent"
    },
    "authority_level": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "description": "Numeric authority level (1-5)"
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "enforcement": {
      "type": "object",
      "required": ["doctrine", "compliance"],
      "properties": {
        "doctrine": {
          "type": "string",
          "const": "no-mercy-no-doubts"
        },
        "compliance": {
          "type": "string",
          "enum": ["mandatory", "recommended", "optional"]
        }
      }
    }
  },
  "additionalProperties": false
}
```

### JSON Schema Validation in Elixir

The Prismatic Platform validates JSON data against schemas at runtime using Elixir:

```elixir
defmodule Prismatic.Schema.Validator do
  @moduledoc """
  JSON Schema validator for Prismatic Platform configurations and API payloads.
  Provides compile-time schema loading and runtime validation with detailed
  error reporting.
  """

  @type validation_error :: %{
    path: String.t(),
    message: String.t(),
    schema_path: String.t()
  }

  @type validation_result :: :ok | {:error, [validation_error()]}

  @schema_dir "priv/schemas"

  @spec validate(map(), String.t()) :: validation_result()
  def validate(data, schema_name) when is_map(data) and is_binary(schema_name) do
    with {:ok, schema} <- load_schema(schema_name),
         {:ok, resolved} <- resolve_references(schema) do
      do_validate(data, resolved, "#")
    end
  end

  @spec load_schema(String.t()) :: {:ok, map()} | {:error, term()}
  def load_schema(schema_name) do
    path = Path.join(@schema_dir, "#{schema_name}.json")

    case File.read(path) do
      {:ok, content} -> Jason.decode(content)
      {:error, reason} -> {:error, {:schema_not_found, schema_name, reason}}
    end
  end

  defp do_validate(data, schema, path) do
    errors =
      []
      |> check_type(data, schema, path)
      |> check_required(data, schema, path)
      |> check_properties(data, schema, path)
      |> check_constraints(data, schema, path)
      |> check_enum(data, schema, path)
      |> check_pattern(data, schema, path)

    case errors do
      [] -> :ok
      errors -> {:error, Enum.reverse(errors)}
    end
  end

  defp check_type(errors, data, %{"type" => "object"}, _path) when is_map(data), do: errors
  defp check_type(errors, data, %{"type" => "string"}, _path) when is_binary(data), do: errors
  defp check_type(errors, data, %{"type" => "integer"}, _path) when is_integer(data), do: errors
  defp check_type(errors, data, %{"type" => "number"}, _path) when is_number(data), do: errors
  defp check_type(errors, data, %{"type" => "boolean"}, _path) when is_boolean(data), do: errors
  defp check_type(errors, data, %{"type" => "array"}, _path) when is_list(data), do: errors
  defp check_type(errors, _data, %{"type" => expected}, path) do
    [%{path: path, message: "Expected type #{expected}", schema_path: path} | errors]
  end
  defp check_type(errors, _data, _schema, _path), do: errors

  defp check_required(errors, data, %{"required" => required}, path) when is_map(data) do
    Enum.reduce(required, errors, fn field, acc ->
      if Map.has_key?(data, field) do
        acc
      else
        [%{path: "#{path}/#{field}", message: "Required field missing: #{field}", schema_path: path} | acc]
      end
    end)
  end
  defp check_required(errors, _data, _schema, _path), do: errors

  defp check_properties(errors, data, %{"properties" => props}, path) when is_map(data) do
    Enum.reduce(props, errors, fn {key, prop_schema}, acc ->
      case Map.get(data, key) do
        nil -> acc
        value ->
          case do_validate(value, prop_schema, "#{path}/#{key}") do
            :ok -> acc
            {:error, prop_errors} -> prop_errors ++ acc
          end
      end
    end)
  end
  defp check_properties(errors, _data, _schema, _path), do: errors

  defp check_constraints(errors, value, schema, path) when is_number(value) do
    errors
    |> check_minimum(value, schema, path)
    |> check_maximum(value, schema, path)
  end
  defp check_constraints(errors, value, schema, path) when is_binary(value) do
    errors
    |> check_min_length(value, schema, path)
    |> check_max_length(value, schema, path)
  end
  defp check_constraints(errors, _value, _schema, _path), do: errors

  defp check_minimum(errors, value, %{"minimum" => min}, path) when value < min do
    [%{path: path, message: "Value #{value} below minimum #{min}", schema_path: path} | errors]
  end
  defp check_minimum(errors, _value, _schema, _path), do: errors

  defp check_maximum(errors, value, %{"maximum" => max}, path) when value > max do
    [%{path: path, message: "Value #{value} above maximum #{max}", schema_path: path} | errors]
  end
  defp check_maximum(errors, _value, _schema, _path), do: errors

  defp check_min_length(errors, value, %{"minLength" => min}, path) when byte_size(value) < min do
    [%{path: path, message: "String length below minimum #{min}", schema_path: path} | errors]
  end
  defp check_min_length(errors, _value, _schema, _path), do: errors

  defp check_max_length(errors, value, %{"maxLength" => max}, path) when byte_size(value) > max do
    [%{path: path, message: "String length above maximum #{max}", schema_path: path} | errors]
  end
  defp check_max_length(errors, _value, _schema, _path), do: errors

  defp check_enum(errors, value, %{"enum" => allowed}, path) do
    if value in allowed, do: errors,
    else: [%{path: path, message: "Value not in allowed set: #{inspect(allowed)}", schema_path: path} | errors]
  end
  defp check_enum(errors, _value, _schema, _path), do: errors

  defp check_pattern(errors, value, %{"pattern" => pattern}, path) when is_binary(value) do
    case Regex.compile(pattern) do
      {:ok, regex} ->
        if Regex.match?(regex, value), do: errors,
        else: [%{path: path, message: "Value does not match pattern: #{pattern}", schema_path: path} | errors]
      {:error, _} -> errors
    end
  end
  defp check_pattern(errors, _value, _schema, _path), do: errors

  defp resolve_references(schema), do: {:ok, schema}
end
```

### Elixir Type to JSON Schema Mapping

When generating OpenAPI specifications from Elixir type specs, the platform maps Elixir types to their JSON Schema equivalents:

```elixir
defmodule Prismatic.Schema.ElixirTypeMapper do
  @moduledoc """
  Maps Elixir typespec AST nodes to JSON Schema definitions.
  Used by the auto-introspecting API gateway to generate
  OpenAPI-compatible schemas from @spec annotations.
  """

  @type_mapping %{
    integer: %{"type" => "integer"},
    float: %{"type" => "number", "format" => "double"},
    number: %{"type" => "number"},
    binary: %{"type" => "string"},
    boolean: %{"type" => "boolean"},
    atom: %{"type" => "string"},
    pid: %{"type" => "string", "format" => "pid"},
    reference: %{"type" => "string", "format" => "reference"},
    pos_integer: %{"type" => "integer", "minimum" => 1},
    non_neg_integer: %{"type" => "integer", "minimum" => 0},
    neg_integer: %{"type" => "integer", "maximum" => -1}
  }

  @spec map_type(term()) :: map()
  def map_type({:type, _, type_name, []}) when is_map_key(@type_mapping, type_name) do
    Map.fetch!(@type_mapping, type_name)
  end

  def map_type({:type, _, :list, [inner]}) do
    %{"type" => "array", "items" => map_type(inner)}
  end

  def map_type({:type, _, :tuple, elements}) do
    %{
      "type" => "array",
      "items" => Enum.map(elements, &map_type/1),
      "minItems" => length(elements),
      "maxItems" => length(elements)
    }
  end

  def map_type({:type, _, :map, :any}) do
    %{"type" => "object"}
  end

  def map_type({:type, _, :union, types}) do
    null_types = Enum.filter(types, &null_type?/1)
    non_null = Enum.reject(types, &null_type?/1)

    schema = case non_null do
      [single] -> map_type(single)
      multiple -> %{"oneOf" => Enum.map(multiple, &map_type/1)}
    end

    if length(null_types) > 0 do
      Map.put(schema, "nullable", true)
    else
      schema
    end
  end

  def map_type(_unknown) do
    %{"type" => "string", "description" => "Unmapped Elixir type"}
  end

  defp null_type?({:atom, _, nil}), do: true
  defp null_type?(_), do: false
end
```

### Schema Composition

JSON Schema supports several composition keywords that enable building complex schemas from simpler components:

| Keyword | Purpose | Example Use |
|---------|---------|-------------|
| `$ref` | Reference another schema | Reuse common definitions |
| `allOf` | Must match ALL schemas | Extend a base schema with additional properties |
| `anyOf` | Must match AT LEAST ONE | Represent union types |
| `oneOf` | Must match EXACTLY ONE | Represent discriminated unions |
| `not` | Must NOT match | Exclude specific patterns |
| `if/then/else` | Conditional validation | Apply rules based on field values |

## Implementation

### Step 1: Define Schema Files

Create JSON Schema files in a dedicated directory within each application:

```
priv/schemas/
  agent-config.json
  api-request.json
  api-response.json
  telemetry-event.json
```

### Step 2: Compile-Time Schema Loading

Load and compile schemas at application startup for fast runtime validation:

```elixir
defmodule Prismatic.Schema.Registry do
  @moduledoc """
  Registry of compiled JSON Schema validators.
  Schemas are loaded once at startup and cached for runtime validation.
  """
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:schema_registry, [:set, :named_table, read_concurrency: true])
    load_all_schemas(table)
    {:ok, %{table: table}}
  end

  def validate(schema_name, data) do
    case :ets.lookup(:schema_registry, schema_name) do
      [{^schema_name, schema}] ->
        Prismatic.Schema.Validator.validate(data, schema)

      [] ->
        {:error, {:schema_not_found, schema_name}}
    end
  end

  defp load_all_schemas(table) do
    Path.wildcard("priv/schemas/*.json")
    |> Enum.each(fn path ->
      name = Path.basename(path, ".json")
      case File.read(path) do
        {:ok, content} ->
          case Jason.decode(content) do
            {:ok, schema} -> :ets.insert(table, {name, schema})
            {:error, _} -> :ok
          end
        {:error, _} -> :ok
      end
    end)
  end
end
```

### Step 3: API Request Validation

Integrate schema validation into the API request pipeline using Phoenix plugs.

### Step 4: OpenAPI Generation

Use the schema definitions as components in the generated OpenAPI specification, referencing them via `$ref` pointers.

## Comparison

| Feature | JSON Schema | XML Schema (XSD) | Protocol Buffers | Avro | TypeScript Types |
|---------|-------------|------------------|-----------------|------|-----------------|
| **Format** | JSON | XML | Binary + IDL | JSON + Binary | TypeScript source |
| **Validation** | Runtime | Runtime | Compile-time | Runtime | Compile-time |
| **Code Generation** | Optional | Common | Required | Required | Built-in (tsc) |
| **Human Readability** | High | Low | Medium | Medium | High |
| **Self-Describing** | Yes | Yes | No (needs .proto) | Yes | No (needs source) |
| **Ecosystem Size** | Very large | Large (declining) | Large | Medium | Very large |
| **Serialization** | JSON (text) | XML (text) | Binary (compact) | Binary (compact) | JSON (text) |
| **Evolution** | Additive-safe | Complex | Field numbering | Schema registry | Breaking changes |

### JSON Schema vs. Ecto Changeset Validation

In the Elixir ecosystem, Ecto changesets provide a rich validation system for database-bound data. JSON Schema and Ecto changesets serve different layers: JSON Schema validates data at the API boundary (before it enters the application), while Ecto changesets validate data at the persistence boundary (before it enters the database). Using both provides defense-in-depth validation, catching issues at the earliest possible point.

### JSON Schema vs. Protocol Buffers

Protocol Buffers (protobuf) define both schema and serialization format, producing compact binary representations. JSON Schema validates human-readable JSON text. Protobuf is preferred for high-throughput internal service communication; JSON Schema is preferred for public APIs where human readability and tooling compatibility matter.

## Best Practices

1. **Start with required fields**: Begin schema definitions with the `required` array, then define each required property. This makes the contract explicit: consumers know exactly what they must provide.

2. **Use strict mode**: Set `additionalProperties: false` to reject unexpected fields. This prevents schema drift where producers send fields that consumers silently ignore, leading to misunderstandings about what data is actually being exchanged.

3. **Version your schemas**: Include version information in schema `$id` URIs. When schemas evolve, maintain backward compatibility by only adding optional fields to existing versions and creating new schema versions for breaking changes.

4. **Compose with $ref**: Extract reusable definitions into shared schema files. Common patterns like pagination parameters, error responses, and entity identifiers should be defined once and referenced everywhere.

5. **Document with description**: Every property should have a `description` field. Schemas serve as documentation; make them self-explanatory. Include format expectations, business context, and example values.

6. **Validate at boundaries**: Apply JSON Schema validation at every system boundary: API ingress, configuration loading, event bus consumption, and external service responses. Defense in depth prevents malformed data from propagating.

7. **Test schema evolution**: When modifying schemas, test that existing valid documents remain valid under the new schema (backward compatibility) and that new documents are rejected by the old schema (forward compatibility awareness).

8. **Generate, do not handwrite**: Where possible, generate JSON Schemas from authoritative sources like Elixir type specifications, database schemas, or OpenAPI definitions rather than maintaining them manually.

## Common Pitfalls

1. **Schema-code divergence**: Maintaining schemas separately from the code they validate leads to drift. Generate schemas from code or validate code against schemas as part of the CI pipeline.

2. **Over-permissive schemas**: Schemas that allow `additionalProperties: true` (the default) do not catch typos in property names or unexpected fields. Be explicit about what is allowed.

3. **Missing format validation**: The `format` keyword (e.g., `"format": "email"`, `"format": "uri"`) is advisory by default. Most validators do not enforce format constraints unless explicitly configured to do so.

4. **Circular reference loops**: Complex schemas with mutual `$ref` references can cause infinite loops in naive validators. Use validators that handle circular references correctly or flatten schemas before validation.

5. **Performance impact of deep validation**: Schemas with deeply nested structures, many `allOf` compositions, or complex `pattern` constraints can be slow to validate. Profile validation performance for high-throughput APIs.

6. **Ignoring null handling**: JSON `null` is a distinct type in JSON Schema. A property typed as `"type": "string"` does not accept `null`. Use `"type": ["string", "null"]` or the `nullable` keyword for optional fields.

7. **Draft version confusion**: Different JSON Schema drafts use different keyword names and semantics. Ensure your validator supports the draft version your schemas are written in. Mixing draft versions causes subtle validation failures.

8. **Incomplete error reporting**: Some validators report only the first validation error. Use validators that collect all errors in a single pass, providing consumers with a complete list of issues to fix.

## Use Cases

### API Contract Enforcement

The primary use case: defining the exact structure of API request and response bodies. JSON Schema ensures that API consumers send valid data and receive data in the documented format. The OpenAPI Specification relies on JSON Schema for all data type definitions.

### Configuration File Validation

Validating application configuration files (JSON, YAML converted to JSON) against schemas catches misconfiguration before deployment. IDE plugins use JSON Schema to provide autocompletion and inline validation for configuration files.

### Event Schema Registry

In event-driven architectures, JSON Schema defines the structure of events published to message buses. A schema registry ensures that producers and consumers agree on event formats, preventing deserialization failures.

### Data Pipeline Validation

ETL pipelines validate incoming data against JSON Schemas before processing, catching malformed records at ingestion rather than discovering them during transformation or after loading.

### Form Generation

UI frameworks use JSON Schema to automatically generate form fields, validation rules, and error messages, ensuring that frontend validation matches backend expectations.

## Related Concepts

JSON Schema integrates with many technologies and concepts across the software development ecosystem:

- [OpenAPI](/glossary/openapi/) -- the API specification standard that uses JSON Schema for request/response body definitions
- [REST API](/glossary/rest-api/) -- the architectural style whose data contracts JSON Schema formalizes
- [Validation](/glossary/validation/) -- the broader concept of verifying data correctness that JSON Schema implements for JSON documents
- [Schema](/glossary/schema/) -- the general concept of structured data definitions that JSON Schema specializes for JSON
- [API Gateway](/glossary/api-gateway/) -- infrastructure that applies JSON Schema validation at the API boundary
- [TypeSpec](/glossary/typespec/) -- Elixir's type specification system that maps to JSON Schema types in the auto-introspecting API
- [Machine Readable](/glossary/machine-readable/) -- the property of JSON Schema that enables automated tooling and validation
- [Ecto](/glossary/ecto/) -- Elixir's database layer providing complementary changeset validation alongside JSON Schema API validation
- [Specification](/glossary/specification/) -- the broader concept of formal system descriptions that JSON Schema exemplifies
- [Documentation](/glossary/documentation/) -- JSON Schema serves as living, executable documentation for data structures

## See Also

- [OpenAPI Spec](/glossary/openapi-spec/) -- the specific OpenAPI specification version used in the Prismatic API gateway
- [Swagger UI](/glossary/swagger-ui/) -- interactive API documentation powered by OpenAPI schemas derived from JSON Schema
- [Prismatic API](/glossary/prismatic-api/) -- the auto-introspecting API gateway that generates JSON Schema from Elixir type specs
- [Introspection](/glossary/introspection/) -- the mechanism by which Elixir types are discovered and mapped to JSON Schema
- [GraphQL](/glossary/graphql/) -- an alternative API paradigm with its own type system comparable to JSON Schema

---

*[Prismatic Platform](https://github.com/korczis/prismatic-platform) is an open-source intelligent platform built with Elixir/OTP. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE).*
