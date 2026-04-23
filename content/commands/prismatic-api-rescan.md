+++
title = "/prismatic-api-rescan"
weight = 1480
[extra]
category = "API"
description = "Trigger endpoint re-scan of all Prismatic facade modules"
syntax = "/prismatic-api-rescan [options]"
authority = "L3"
agent = "elixir-core-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1202
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["prismatic-api-rescan", "Trigger", "Prismatic", "commands", "API", "Prismatic Platform", "Phase"]
tags = ["commands", "api", "prismatic-api-rescan", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/prismatic-api-rescan - Prismatic Platform"
+++

## Overview

**/prismatic-api-rescan** is a production command in the **API** category of the Prismatic Platform that triggers a complete re-scan of all Prismatic facade modules to refresh the API endpoint registry. The command forces the [Prismatic API](/glossary/prismatic-api/) gateway's scanner process to re-execute its boot-time discovery procedure, updating the ETS-cached endpoint registry with any newly added, modified, or removed facade module functions. This is essential after hot code reloading, new module deployment, or when the endpoint registry needs to be synchronized with the current codebase state.

The Prismatic API's auto-introspection architecture discovers endpoints once during application boot and caches them in ETS for performance. While this design provides sub-millisecond endpoint resolution during request handling, it means that changes to facade modules after boot -- whether through hot code upgrades, new module compilation, or dynamic module loading -- are not automatically reflected in the API surface area. The `/prismatic-api-rescan` command bridges this gap by providing on-demand registry refresh without requiring application restart.

This command operates under the **L3** authority level, reflecting the elevated privileges required for operations that modify the API gateway's runtime behavior. It is executed by the `elixir-core-specialist` agent. The L3 authority level ensures that only operators with sufficient access can trigger rescans, preventing unauthorized modifications to the public API surface area. This is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

The rescan operation is designed to be safe for production use. It follows an atomic swap pattern: the new endpoint registry is built completely in a shadow ETS table before atomically replacing the live registry. This ensures that in-flight API requests are never served from an incomplete or inconsistent registry. If the rescan fails for any reason, the previous registry remains intact and the failure is logged with full diagnostic context.

## Architecture

The rescan architecture implements an atomic registry replacement pattern that maintains zero-downtime API availability during the scan process.

```
/prismatic-api-rescan
        │
        v
  Scanner Process (GenServer)
        │
        ├── Phase 1: Module Enumeration
        │   └── :code.all_loaded() + Application.spec()
        │         Filter: Prismatic* modules only
        │
        ├── Phase 2: Introspection
        │   ├── Code.fetch_docs/1 ────> Documentation
        │   ├── Code.Typespec.fetch_specs/1 ──> Type Specs
        │   └── Module.__info__(:functions) ──> Function List
        │
        ├── Phase 3: Schema Generation
        │   └── TypeMapper.to_openapi_schema/1
        │         Elixir @spec AST -> JSON Schema
        │
        ├── Phase 4: Shadow Registry Build
        │   └── :ets.new(:endpoints_shadow, ...)
        │         Insert all discovered endpoints
        │
        └── Phase 5: Atomic Swap
            └── :ets.rename(:endpoints_shadow, :endpoints_live)
                  │
                  v
            Telemetry Event
            [:prismatic_api, :rescan, :completed]
            %{endpoints_count: N, duration_ms: T}
```

The five-phase pipeline ensures complete isolation between the discovery process and live API serving. Phases 1-3 are read-only operations that examine module metadata without affecting runtime behavior. Phase 4 builds the new registry in a separate ETS table that is invisible to the request dispatcher. Phase 5 performs the atomic swap in a single operation, making the transition instantaneous and invisible to API consumers.

The scanner process is implemented as a GenServer within the Prismatic API supervision tree. It maintains state about the last successful scan (timestamp, endpoint count, duration) and provides diagnostic information to monitoring tools. The GenServer serializes scan requests to prevent concurrent rescans that could cause resource contention or ETS table naming conflicts.

## Usage

### Basic Rescan

```bash
# Trigger full endpoint rescan
/prismatic-api-rescan

# Rescan with verbose output
/prismatic-api-rescan --verbose

# Rescan specific application modules only
/prismatic-api-rescan --app perimeter
```

### Diagnostic Rescan

```bash
# Dry-run: show what would change without applying
/prismatic-api-rescan --dry-run

# Rescan with diff against current registry
/prismatic-api-rescan --diff

# Rescan with detailed discovery logging
/prismatic-api-rescan --debug
```

### Automated Rescan

```bash
# Rescan after deployment
/prismatic-api-rescan --post-deploy --verify

# Scheduled periodic rescan
/prismatic-api-rescan --schedule 1h

# Rescan with health check after completion
/prismatic-api-rescan --health-check
```

### Validation

```bash
# Rescan and compare against expected endpoint count
/prismatic-api-rescan --expect-count 150 --fail-on-mismatch

# Rescan and verify OpenAPI spec generation
/prismatic-api-rescan --validate-openapi

# Rescan and report documentation coverage
/prismatic-api-rescan --report-coverage
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--verbose` | flag | false | Show detailed discovery output |
| `--app` | string | all | Limit rescan to specific application |
| `--dry-run` | flag | false | Show changes without applying |
| `--diff` | flag | false | Show diff against current registry |
| `--debug` | flag | false | Enable detailed discovery logging |
| `--post-deploy` | flag | false | Post-deployment mode with extra validation |
| `--verify` | flag | false | Verify endpoints after rescan |
| `--schedule` | duration | none | Schedule periodic rescans |
| `--health-check` | flag | false | Run health check after rescan |
| `--expect-count` | integer | none | Expected endpoint count |
| `--fail-on-mismatch` | flag | false | Fail if count doesn't match expectation |
| `--validate-openapi` | flag | false | Validate OpenAPI spec after rescan |
| `--report-coverage` | flag | false | Report documentation coverage |
| `--force` | flag | false | Force rescan even if registry is fresh |
| `--timeout` | duration | 30s | Maximum scan duration |
| `--format` | enum | table | Output: table, json, markdown |
| `--output` | path | stdout | Output file path |

## Execution Flow

The rescan operation follows the five-phase pipeline with additional validation and reporting steps.

**Phase 1 -- Module Enumeration** (< 100ms): The scanner enumerates all loaded Elixir modules and filters for those matching the `Prismatic*` namespace pattern. Application configuration is consulted to identify additional modules that should be included or excluded from scanning. The module list is compared against the previous scan to identify new, removed, and unchanged modules.

**Phase 2 -- Module Introspection** (100ms-1s): Each qualifying module is introspected using three Elixir reflection functions. `Module.__info__(:functions)` returns the list of exported functions with arities. `Code.fetch_docs/1` retrieves embedded documentation. `Code.Typespec.fetch_specs/1` extracts `@spec` type annotations. Functions that are private, deprecated, or explicitly excluded via module attributes are filtered out.

**Phase 3 -- Schema Generation** (100ms-2s): For each discovered function, the TypeMapper converts the Elixir `@spec` AST into [OpenAPI](/glossary/openapi/) 3.0 JSON Schema definitions. Parameter types are mapped to JSON Schema types (atom -> string, integer -> integer, map -> object, list -> array). Return types are mapped to response schemas. Complex types (union types, structs, custom types) are handled through configurable type mapping rules.

**Phase 4 -- Shadow Registry Build** (< 100ms): A new ETS table is created with the `:endpoints_shadow` name. All discovered endpoints are inserted into this shadow table with their complete metadata: module, function, arity, HTTP method, parameter schema, response schema, and documentation. The insertion is performed as a batch operation for efficiency.

**Phase 5 -- Atomic Swap and Reporting** (< 10ms): The shadow table is atomically renamed to replace the live endpoint table. The previous live table is deleted. A telemetry event is emitted with the scan results (endpoint count, duration, changes detected). If `--verify` is specified, a quick validation pass confirms that all endpoints in the new registry are accessible.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic API](/apps/prismatic-api/) | Core Application | Scanner process and ETS registry |
| [/prismatic-api-endpoints](/commands/prismatic-api-endpoints/) | Downstream | Endpoint listing reflects rescan results |
| [/prismatic-api-spec](/commands/prismatic-api-spec/) | Downstream | OpenAPI spec regenerated from new registry |
| [/prismatic-api-status](/commands/prismatic-api-status/) | Diagnostic | Status reflects last scan timestamp |
| [OpenAPI](/glossary/openapi/) | Standard | Schema generation during rescan |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `elixir-core-specialist` agent |
| [Telemetry](/glossary/telemetry/) | Observability | Rescan timing, endpoint delta metrics |
| [Quality Gates](/glossary/quality-gates/) | Validation | Post-rescan endpoint health check |

## Best Practices

**Rescan After Hot Code Upgrades**: Whenever modules are hot-loaded or recompiled in a running system, trigger a rescan to ensure the API registry reflects the current code. Stale registries can cause 404 errors for newly added endpoints or serve deprecated function signatures.

**Use Dry-Run in Production**: Before executing a production rescan, run `--dry-run` to preview the changes. This shows which endpoints will be added, removed, or modified without affecting the live registry.

**Monitor Endpoint Count**: Use `--expect-count` with `--fail-on-mismatch` in CI/CD pipelines to catch unintended endpoint removals. A sudden drop in endpoint count typically indicates a module loading failure rather than intentional API changes.

**Schedule Periodic Rescans**: In development environments, schedule rescans with `--schedule 1h` to automatically pick up code changes. In production, manual rescans tied to deployment events are preferred for predictability.

**Validate OpenAPI After Rescan**: Use `--validate-openapi` to ensure that the regenerated OpenAPI specification is valid after rescan. Invalid specs can break API documentation and client library generation.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Concurrent rescan attempt | Queued behind active scan | Wait for current scan to complete |
| Module introspection failure | Skip module with warning | Investigate module loading issue |
| Type spec parse error | Endpoint registered without schema | Fix `@spec` in source module |
| ETS table creation failure | Rescan aborted, live registry preserved | Check ETS table limits |
| Atomic swap failure | Rescan aborted, live registry preserved | Investigate ETS naming conflict |
| Timeout exceeded | Partial scan aborted | Increase `--timeout` or narrow `--app` |
| Endpoint count mismatch | Warning or failure per `--fail-on-mismatch` | Investigate missing modules |

## Advanced Usage

### CI/CD Integration

```bash
# Post-deployment rescan with full validation
/prismatic-api-rescan --post-deploy --verify --validate-openapi \
  --expect-count 150 --fail-on-mismatch --health-check

# Generate deployment report
/prismatic-api-rescan --diff --format json --output rescan-report.json
```

### Development Workflow

```bash
# Rescan after adding new facade module
/prismatic-api-rescan --verbose --diff

# Debug why endpoint isn't discovered
/prismatic-api-rescan --debug --app my_new_app --format json
```

### Production Monitoring

```bash
# Periodic rescan with alerting
/prismatic-api-rescan --schedule 6h --health-check \
  --alert-on "endpoint-count-change,health-check-failure"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The rescan process must complete fully or not at all -- partial registry updates are never applied. Every discoverable module is scanned; failures in individual modules are logged but do not prevent scanning of remaining modules. Post-scan validation is available and recommended.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The `--dry-run` option enables informed decision-making before committing to registry changes. The `--diff` option provides clear visibility into exactly what changed. The [NABLA](/glossary/nabla-infinity/) axiom of Provenance Mandatory is satisfied: every endpoint in the registry is traceable to a specific module and function in the codebase, with the scan timestamp providing temporal context.

## Related Commands

- [/prismatic-api-status](/commands/prismatic-api-status/) - [Prismatic API](/glossary/prismatic-api/) auto-introspecting REST gateway status
- [/prismatic-api-endpoints](/commands/prismatic-api-endpoints/) - List all auto-discovered API endpoints from facade modules
- [/prismatic-api-spec](/commands/prismatic-api-spec/) - Generate and view [OpenAPI](/glossary/openapi/) 3.0 specification
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)