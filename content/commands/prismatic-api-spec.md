+++
title = "/prismatic-api-spec"
weight = 1490
[extra]
category = "API"
description = "Generate and view OpenAPI 3.0 specification"
syntax = "/prismatic-api-spec [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1056
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["prismatic-api-spec", "Generate", "OpenAPI", "commands", "API", "Prismatic Platform", "Elixir", "Prismatic"]
tags = ["commands", "api", "prismatic-api-spec", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/prismatic-api-spec - Prismatic Platform"
+++

## Overview

**/prismatic-api-spec** is a production command in the **API** category of the Prismatic Platform that generates, validates, and serves the complete [OpenAPI](/glossary/openapi/) 3.0 specification for the auto-introspecting REST gateway. The command introspects all `Prismatic*` facade modules at runtime, extracts function signatures via `Code.Typespec.fetch_specs/1` and documentation via `Code.fetch_docs/1`, then maps Elixir type specifications to JSON Schema definitions that conform to the OpenAPI 3.0.3 standard.

The specification generation process is fully automatic and requires zero manual annotation. Every public function that meets the facade discovery criteria is represented as an endpoint in the resulting specification document, complete with request schemas, response schemas, parameter descriptions, and example payloads. This eliminates the traditional burden of maintaining API documentation separately from implementation -- the specification is always an accurate reflection of what the platform actually exposes.

This command operates under the **L2+** authority level and is executed by the `elixir-core-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The generated specification powers the interactive SwaggerUI available at `/api/swaggerui` and serves as the canonical contract for all API consumers.

The command supports multiple output formats including JSON, YAML, and direct browser rendering through SwaggerUI. It integrates with [OpenApiSpex](https://hexdocs.pm/open_api_spex/) for schema validation, ensuring that the generated specification is not merely syntactically correct but semantically valid against the OpenAPI 3.0 meta-schema.

## Architecture

The specification generation pipeline follows a multi-stage architecture that transforms Elixir module metadata into a standards-compliant OpenAPI document.

```
Module Discovery          Type Extraction           Schema Mapping
    |                         |                         |
    v                         v                         v
+----------+           +------------+           +-----------+
| Scanner  | --------> | TypeMapper | --------> | ApiSpec   |
| (ETS)    |           | (AST->JSON)|           | (OpenAPI) |
+----------+           +------------+           +-----------+
    |                                                 |
    v                                                 v
+----------+                                   +-----------+
| Registry |                                   | SwaggerUI |
| (Cache)  |                                   | (Render)  |
+----------+                                   +-----------+
```

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Scanner** | `PrismaticApi.Scanner` | Discovers all `Prismatic*` facade modules at boot |
| **Registry** | `PrismaticApi.Registry` | ETS-backed cache of discovered endpoints |
| **TypeMapper** | `PrismaticApi.TypeMapper` | Converts Elixir `@spec` AST to OpenAPI JSON Schema |
| **ApiSpec** | `PrismaticApi.ApiSpec` | Assembles the complete OpenAPI 3.0 document |
| **SpecController** | `PrismaticApi.Controllers.SpecController` | Serves the specification as JSON or YAML |

The TypeMapper handles complex Elixir type conversions including union types, tuple return values, custom struct types, and recursive type references. It maintains a type resolution cache to avoid redundant AST traversal for commonly referenced types across multiple endpoints.

## Usage

### Basic Specification Generation

```bash
# Generate and display the full OpenAPI spec
/prismatic-api-spec

# Output specification as JSON to stdout
/prismatic-api-spec --format json

# Output specification as YAML
/prismatic-api-spec --format yaml

# Write specification to file
/prismatic-api-spec --output /tmp/prismatic-api.json
```

### Validation and Verification

```bash
# Validate the generated spec against OpenAPI 3.0 meta-schema
/prismatic-api-spec --validate

# Check for breaking changes against a baseline spec
/prismatic-api-spec --diff /path/to/baseline-spec.json

# Validate specific endpoint schemas only
/prismatic-api-spec --validate --endpoint perimeter/discover
```

### Filtered Output

```bash
# Generate spec for a specific application only
/prismatic-api-spec --app prismatic_perimeter

# Include only endpoints matching a pattern
/prismatic-api-spec --filter "security_*"

# Exclude internal/admin endpoints
/prismatic-api-spec --exclude-internal
```

### Integration with External Tools

```bash
# Generate client SDK from spec
/prismatic-api-spec --output /tmp/spec.json && openapi-generator generate -i /tmp/spec.json -g typescript-fetch

# Feed spec to Postman collection converter
/prismatic-api-spec --format json | openapi2postmanv2 --output collection.json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--format` | `json \| yaml` | `json` | Output format for the specification |
| `--output` | `string` | `stdout` | File path to write the specification |
| `--validate` | `boolean` | `false` | Validate against OpenAPI 3.0 meta-schema after generation |
| `--diff` | `string` | `nil` | Path to baseline spec for breaking change detection |
| `--app` | `string` | `all` | Filter specification to a specific umbrella application |
| `--filter` | `string` | `*` | Glob pattern to filter included endpoints |
| `--exclude-internal` | `boolean` | `false` | Exclude endpoints marked as internal |
| `--include-examples` | `boolean` | `true` | Include example request/response payloads |
| `--server-url` | `string` | auto-detected | Override the server URL in the specification |
| `--verbose` | `boolean` | `false` | Show detailed generation progress |

## Execution Flow

The specification generation follows a deterministic pipeline that ensures consistency between runs.

1. **Module Discovery** -- The Scanner queries the Erlang code server for all loaded modules matching the `Prismatic*` prefix. Each module is checked for public functions with documented `@spec` annotations.

2. **Type Extraction** -- For each qualifying function, `Code.Typespec.fetch_specs/1` retrieves the type specification AST. The TypeMapper traverses this AST to produce JSON Schema representations of parameters and return values.

3. **Documentation Extraction** -- `Code.fetch_docs/1` retrieves module and function documentation strings. These are cleaned, formatted, and attached to the corresponding OpenAPI operation as descriptions.

4. **Schema Assembly** -- The ApiSpec module assembles individual endpoint definitions into a complete OpenAPI 3.0 document structure, including `info`, `servers`, `paths`, `components/schemas`, and `security` sections.

5. **Validation** -- If `--validate` is specified, the assembled specification is validated against the OpenAPI 3.0 JSON meta-schema. Any violations are reported with path references.

6. **Output** -- The final specification is serialized to the requested format and written to the specified destination.

```elixir
# Programmatic specification generation
{:ok, spec} = PrismaticApi.ApiSpec.generate()
{:ok, json} = Jason.encode(spec, pretty: true)
```

## Integration Points

| System | Integration | Direction |
|--------|-------------|-----------|
| [Prismatic API](/apps/prismatic-api/) | Primary consumer -- serves spec at `/api/openapi` | Outbound |
| [SwaggerUI](/glossary/openapi/) | Interactive documentation at `/api/swaggerui` | Outbound |
| [Quality Gates](/glossary/quality-gates/) | Spec validation as a quality gate checkpoint | Bidirectional |
| [Telemetry](/glossary/telemetry/) | Emits `[:prismatic_api, :spec, :generated]` events | Outbound |
| [AIAD Registry](/glossary/aiad/) | Command discovery and execution routing | Inbound |
| CI/CD Pipeline | Spec diff detection for breaking change prevention | Outbound |
| Client SDK Generation | Input for `openapi-generator` and similar tools | Outbound |

The specification also integrates with the platform's authentication system, documenting security schemes and RBAC requirements for each endpoint. The `PrismaticWeb.Plugs.APIAuth` plug configuration is reflected in the `securitySchemes` section of the generated document.

## Best Practices

1. **Run after facade changes** -- Execute `/prismatic-api-spec --validate` after modifying any `Prismatic*` facade module to verify that the specification remains valid and that no unintended breaking changes were introduced.

2. **Maintain baseline specs** -- Store a baseline specification in version control and use `--diff` regularly to detect API contract changes before they reach production.

3. **Use type annotations** -- Ensure all facade functions have complete `@spec` annotations. Functions without specs are excluded from the generated specification, creating silent API documentation gaps.

4. **Document with @doc** -- Rich `@doc` strings on facade functions become operation descriptions in the specification. Include parameter descriptions, expected behavior, and error conditions.

5. **Version awareness** -- The specification includes the platform version. When deploying breaking changes, increment the API version to maintain backward compatibility.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :no_modules_found}` | No `Prismatic*` modules loaded | Ensure the application is compiled and modules are loaded |
| `{:error, :spec_validation_failed, errors}` | Generated spec fails OpenAPI validation | Review errors -- typically caused by unsupported Elixir types |
| `{:error, :type_mapping_failed, type}` | Elixir type cannot be mapped to JSON Schema | Add a custom type mapping or simplify the type annotation |
| `{:error, :output_write_failed}` | Cannot write to specified output path | Check file permissions and path validity |

When type mapping failures occur, the command logs a warning and continues generation, marking the affected endpoint with an `x-unmapped-type` extension so it can be identified and corrected without blocking the entire specification.

## Advanced Usage

### Custom Type Mappings

For Elixir types that do not have a direct JSON Schema equivalent, custom mappings can be registered.

```elixir
# Register a custom type mapping
PrismaticApi.TypeMapper.register_mapping(
  {:remote_type, MyApp.CustomType, :t},
  %{"type" => "object", "properties" => %{"id" => %{"type" => "string"}}}
)
```

### Specification Extensions

The generated specification supports OpenAPI extensions (prefixed with `x-`) for platform-specific metadata.

```json
{
  "x-prismatic-app": "prismatic_perimeter",
  "x-prismatic-authority": "L2+",
  "x-prismatic-agent": "elixir-core-specialist"
}
```

### Programmatic Access

```elixir
# Generate spec for a specific app
{:ok, spec} = PrismaticApi.ApiSpec.generate(app: :prismatic_perimeter)

# Extract endpoint list
endpoints = PrismaticApi.Registry.list_endpoints()

# Get schema for a specific type
{:ok, schema} = PrismaticApi.TypeMapper.map_type({:type, :map, []})
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The specification must be valid OpenAPI 3.0 or the command fails with explicit error messages. No partial specifications are emitted.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every endpoint in the specification is verified against its source module's actual type annotations before inclusion.

The command enforces [NABLA](/glossary/nabla-infinity/) axioms by maintaining provenance -- every schema definition traces back to its originating Elixir module and function, satisfying the Provenance Mandatory axiom.

## Related Commands

- [/prismatic-api-status](/commands/prismatic-api-status/) - [Prismatic API](/glossary/prismatic-api/) auto-introspecting REST gateway status
- [/prismatic-api-endpoints](/commands/prismatic-api-endpoints/) - List all auto-discovered API endpoints from facade modules
- [/prismatic-api-rescan](/commands/prismatic-api-rescan/) - Trigger endpoint re-scan of all Prismatic facade modules
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)