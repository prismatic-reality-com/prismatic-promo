+++
title = "/prismatic-api-endpoints"
weight = 1470
[extra]
category = "API"
description = "List all auto-discovered API endpoints from facade modules"
syntax = "/prismatic-api-endpoints [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1129
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["prismatic-api-endpoints", "List", "commands", "API", "Prismatic Platform", "OpenAPI", "HTTP"]
tags = ["commands", "api", "prismatic-api-endpoints", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/prismatic-api-endpoints - Prismatic Platform"
+++

## Overview

**/prismatic-api-endpoints** is a production command in the **API** category of the Prismatic Platform that lists all auto-discovered API endpoints from the platform's facade modules. The command provides a comprehensive inventory of the REST API surface area that the [Prismatic API](@/glossary/prismatic-api.md) gateway exposes through its automatic introspection mechanism, enabling operators to understand which platform functions are accessible via HTTP, their expected parameters, return types, and documentation status.

The Prismatic API implements a unique auto-introspecting architecture that eliminates manual endpoint registration. At boot time, the API gateway scans all `Prismatic*` facade modules using Elixir introspection functions (`Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`, `Module.__info__/1`) to discover public functions, their type specifications, and documentation. These discoveries are cached in ETS and exposed as REST endpoints through a generic dispatch controller. The `/prismatic-api-endpoints` command provides visibility into this discovery process, showing exactly which functions have been discovered, their HTTP methods, parameter mappings, and OpenAPI schema status.

This command operates under the **L2+** authority level and is executed by the `elixir-core-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command serves as a diagnostic and documentation tool for the API infrastructure, enabling operators to verify that expected endpoints are discoverable and correctly configured.

Understanding the discovered endpoint inventory is essential for API consumers, integration developers, and platform operators. The endpoint list reveals the complete public API surface area, enabling developers to identify available functionality without reading source code. It also serves as a health check for the discovery mechanism itself -- if expected endpoints are missing, it indicates a problem with module loading, type specification, or the discovery scanner.

## Architecture

The endpoint listing architecture leverages the API gateway's ETS-cached registry, which is populated during application boot by the scanner process.

```
Boot-Time Discovery                ETS Registry               /prismatic-api-endpoints
┌──────────────────┐           ┌──────────────────┐          ┌──────────────────┐
│ Module Scanner   │           │ Endpoint Table   │          │ Registry Query   │
│                  │           │                  │          │                  │
│ For each         │           │ Key: {app,action}│          │ List all entries │
│ Prismatic*       │──────>    │ Val: %{          │──────>   │ Filter by params │
│ module:          │  insert   │   module: ...,   │  query   │ Format output    │
│   - fetch_docs   │           │   function: ..., │          │ Sort & group     │
│   - fetch_specs  │           │   arity: ...,    │          │                  │
│   - __info__     │           │   spec: ...,     │          │ Table / JSON /   │
│                  │           │   docs: ...,     │          │ OpenAPI          │
└──────────────────┘           │   http_method: ..│          └──────────────────┘
                               │ }                │
                               └──────────────────┘
```

The scanner applies a set of heuristics to determine the HTTP method for each discovered function. Functions with 0-2 parameters are mapped to GET requests (query string parameters). Functions with more than 2 parameters or those that perform state changes (detected by naming conventions like `create_`, `update_`, `delete_`) are mapped to POST requests. This automatic HTTP method assignment follows REST conventions while requiring zero manual configuration.

The type specification mapper (`TypeMapper`) converts Elixir `@spec` AST nodes into [OpenAPI](@/glossary/openapi.md) 3.0 JSON Schema definitions. This enables automatic generation of request/response schemas for each endpoint, providing type-safe API documentation without manual schema authoring.

## Usage

### List Endpoints

```bash
# List all discovered endpoints
/prismatic-api-endpoints

# List endpoints for specific app
/prismatic-api-endpoints --app perimeter

# List endpoints with full type information
/prismatic-api-endpoints --detail full

# List endpoints grouped by module
/prismatic-api-endpoints --group-by module
```

### Search and Filter

```bash
# Find endpoints matching a pattern
/prismatic-api-endpoints --search "security"

# Filter by HTTP method
/prismatic-api-endpoints --method GET
/prismatic-api-endpoints --method POST

# Filter by documentation status
/prismatic-api-endpoints --documented-only
/prismatic-api-endpoints --undocumented-only
```

### Export and Integration

```bash
# Export endpoint list as JSON
/prismatic-api-endpoints --format json --output endpoints.json

# Generate curl examples for all endpoints
/prismatic-api-endpoints --curl-examples

# Compare endpoints between environments
/prismatic-api-endpoints --diff staging
```

### Diagnostic Operations

```bash
# Show discovery statistics
/prismatic-api-endpoints --stats

# Show endpoints with missing type specs
/prismatic-api-endpoints --missing-specs

# Verify endpoint health
/prismatic-api-endpoints --verify --health-check
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--app` | string | all | Filter by application name |
| `--detail` | enum | standard | Detail level: minimal, standard, full |
| `--group-by` | enum | app | Grouping: app, module, method, none |
| `--search` | string | none | Search pattern for endpoint names |
| `--method` | enum | all | Filter by HTTP method: GET, POST, all |
| `--documented-only` | flag | false | Show only documented endpoints |
| `--undocumented-only` | flag | false | Show only undocumented endpoints |
| `--curl-examples` | flag | false | Generate curl command examples |
| `--diff` | string | none | Compare against named environment |
| `--stats` | flag | false | Show discovery statistics |
| `--missing-specs` | flag | false | Show endpoints without type specs |
| `--verify` | flag | false | Verify endpoint accessibility |
| `--health-check` | flag | false | Perform health check on all endpoints |
| `--format` | enum | table | Output: table, json, openapi, markdown |
| `--output` | path | stdout | Output file path |
| `--sort` | enum | app | Sort: app, method, name, arity |

## Execution Flow

The endpoint listing follows a straightforward query-and-format pipeline.

**Phase 1 -- Registry Query** (< 10ms): The command queries the ETS endpoint registry populated during boot-time discovery. The query is filtered by the specified parameters (app, method, search pattern). ETS provides O(1) lookup by key and efficient table scanning for filtered queries.

**Phase 2 -- Enrichment** (< 50ms): For each matching endpoint, additional metadata is collected: documentation content (from `Code.fetch_docs/1`), type specification details (from `Code.Typespec.fetch_specs/1`), and OpenAPI schema status. If `--curl-examples` is requested, example curl commands are generated using the endpoint's parameter specifications.

**Phase 3 -- Formatting** (< 50ms): Results are formatted according to the specified output mode. Table format shows a compact listing with columns for app, action, method, arity, and documentation status. JSON format produces a structured array suitable for programmatic consumption. OpenAPI format generates a partial OpenAPI 3.0 specification containing only the matched endpoints. Markdown format produces documentation-ready output.

**Phase 4 -- Diagnostics** (optional, 1-5 seconds): If `--verify` or `--health-check` is specified, the command performs live endpoint verification by issuing HTTP requests to each discovered endpoint and reporting response status, timing, and error codes. This identifies endpoints that are discoverable but not functioning correctly.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic API](@/apps/prismatic-api.md) | Core Application | ETS endpoint registry source |
| [/prismatic-api-status](@/commands/prismatic-api-status.md) | Complementary | API gateway health and configuration |
| [/prismatic-api-rescan](@/commands/prismatic-api-rescan.md) | Complementary | Trigger endpoint re-discovery |
| [/prismatic-api-spec](@/commands/prismatic-api-spec.md) | Complementary | Full OpenAPI specification |
| [OpenAPI](@/glossary/openapi.md) | Standard | OpenAPI 3.0 schema generation |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | `elixir-core-specialist` agent |
| [Telemetry](@/glossary/telemetry.md) | Observability | Discovery metrics and endpoint counts |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Endpoint documentation coverage |

## Best Practices

**Review After Deployment**: Run `/prismatic-api-endpoints --stats` after each deployment to verify that the expected number of endpoints are discovered. A drop in endpoint count may indicate module loading failures or configuration issues.

**Monitor Documentation Coverage**: Use `--undocumented-only` to identify endpoints that lack documentation. All public API endpoints should have documentation and type specifications to ensure the auto-generated OpenAPI spec is complete.

**Generate Client Libraries**: Export the endpoint list in JSON or OpenAPI format to feed automated client library generators. This ensures that API clients stay synchronized with the latest endpoint inventory.

**Use Health Checks**: Periodically run `--verify --health-check` to catch endpoints that are discoverable but non-functional. This proactive monitoring catches issues before API consumers encounter them.

**Compare Environments**: Use `--diff staging` before production deployments to verify that staging and production have consistent endpoint inventories. Discrepancies may indicate configuration drift or incomplete deployments.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| ETS registry empty | Warning with scanner status | Run [/prismatic-api-rescan](@/commands/prismatic-api-rescan.md) |
| App not found | Error with available apps | Verify app name in registry |
| Health check failure | Error details per endpoint | Investigate failing endpoints |
| No matching endpoints | Empty result with filter info | Adjust search/filter criteria |
| OpenAPI export error | Error with schema details | Fix type specs for affected modules |
| Diff target unavailable | Error with available targets | Verify environment name |

## Advanced Usage

### CI/CD Integration

```bash
# Endpoint regression check in CI
/prismatic-api-endpoints --format json --output current-endpoints.json
diff expected-endpoints.json current-endpoints.json || exit 1

# Documentation coverage gate
/prismatic-api-endpoints --stats --format json | \
  jq '.documentation_coverage' | \
  test $(cat) -ge 95 || echo "Documentation coverage below 95%"
```

### API Catalog Generation

```bash
# Generate full API catalog documentation
/prismatic-api-endpoints --detail full --curl-examples \
  --format markdown --output api-catalog.md

# Generate per-app API documentation
for app in perimeter agents storage; do
  /prismatic-api-endpoints --app $app --detail full \
    --format markdown --output docs/api-$app.md
done
```

### Endpoint Discovery Debugging

```bash
# Show raw discovery data for debugging
/prismatic-api-endpoints --app perimeter --detail full --format json

# List modules that were scanned but produced no endpoints
/prismatic-api-endpoints --scan-report --show-excluded
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The endpoint listing must accurately reflect the complete discoverable API surface. Endpoints with missing documentation or type specifications are flagged, not hidden. Health check results are reported faithfully.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Endpoint metadata is derived directly from Elixir module introspection, not from manual configuration that could become stale. The [NABLA](@/glossary/nabla-infinity.md) axiom of Provenance Mandatory is satisfied: every endpoint entry is traceable to a specific module, function, and type specification in the codebase.

## Related Commands

- [/prismatic-api-status](@/commands/prismatic-api-status.md) - [Prismatic API](@/glossary/prismatic-api.md) auto-introspecting REST gateway status
- [/prismatic-api-rescan](@/commands/prismatic-api-rescan.md) - Trigger endpoint re-scan of all Prismatic facade modules
- [/prismatic-api-spec](@/commands/prismatic-api-spec.md) - Generate and view [OpenAPI](@/glossary/openapi.md) 3.0 specification
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)