+++
title = "/validate"
weight = 140
[extra]
category = "Development"
description = "Input validation and data integrity enforcement"
syntax = "/validate [options]"
authority = "L2+"
agent = "validation-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1110
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["validate", "Input", "commands", "Development", "Prismatic Platform", "Value", "Ecto"]
tags = ["commands", "development", "validate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/validate - Prismatic Platform"
+++

## Overview

**/validate** is a production command in the **Development** category of the Prismatic Platform. It performs comprehensive validation of inputs, data structures, configurations, and system state, enforcing data integrity rules across the umbrella codebase. The command validates everything from individual function inputs and Ecto changeset rules to cross-application configuration consistency and deployment readiness. It serves as both a development tool (validating code correctness) and an operational tool (validating system state before critical operations).

This command operates under the **L2+** authority level and is executed by the `validation-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The validation-specialist agent has expertise in Ecto changeset patterns, Phoenix parameter validation, schema verification, and cross-application consistency checking.

In a platform with 90+ umbrella applications sharing data through defined interfaces, validation failures at boundaries are a primary source of runtime errors. `/validate` addresses this by providing systematic validation at every boundary: function inputs against @spec types, Ecto changesets against schema constraints, API parameters against OpenApiSpex schemas, configuration values against expected types and ranges, and system state against operational invariants. The command can also generate validation code for modules that lack it, producing Ecto changeset functions, parameter validation plugs, and input sanitization logic.

## Architecture

The validation system operates as a multi-layer verification pipeline.

### Validation Architecture

```
             /validate
                 |
          Validation Orchestrator
                 |
          +------+------+------+
          |      |      |      |
       Input   Schema  Config  State
       Valid   Valid   Valid   Valid
          |      |      |      |
    +-----+-+ +--+--+ +-+--+ +--+--+
    |   |   | |  |  | |  |  | |  |  |
   Type Range Ecto API  Env  Runtime Inv
   Check Check Cast Spec Var  State  Check
    |   |   | |  |  | |  |  | |  |  |
    +---+---+-+--+--+-+--+--+-+--+--+
                 |
          Validation Report
```

### Validation Layers

| Layer | Scope | Technique | Coverage |
|-------|-------|-----------|----------|
| **Input Validation** | Function parameters | @spec type checking, guard clause verification | Public functions |
| **Schema Validation** | Data structures | Ecto changeset, embedded schema | All Ecto schemas |
| **API Validation** | HTTP parameters | OpenApiSpex schema validation | All API endpoints |
| **Config Validation** | Application configuration | Type checking, range verification, required keys | All config files |
| **State Validation** | Runtime system state | Invariant checking, health assessment | Running application |
| **Cross-App Validation** | Interface contracts | Contract test verification | Module boundaries |

### Validation Types

| Type | Description | Example |
|------|-------------|---------|
| **Type** | Value matches expected type | `is_binary(name)`, `is_integer(score)` |
| **Range** | Value within acceptable bounds | `score >= 300 and score <= 900` |
| **Format** | Value matches expected pattern | Email format, URL format, UUID format |
| **Required** | Value is present (not nil) | `not is_nil(domain)` |
| **Referential** | Value references existing entity | Foreign key exists in referenced table |
| **Business Rule** | Value satisfies domain constraint | `end_date > start_date` |
| **Consistency** | Values are internally consistent | `total == sum(items)` |

## Usage

```bash
# Validate specific module's input handling
/validate --module PrismaticPerimeter.SecurityRating

# Validate Ecto schema changesets
/validate --schema PrismaticPerimeter.Asset

# Validate application configuration
/validate --config prismatic_web

# Validate all API endpoint parameters
/validate --api prismatic_api

# Validate runtime system state
/validate --state

# Validate cross-application contracts
/validate --contracts

# Generate validation code for a module
/validate --generate PrismaticPerimeter.ComplianceAssessment

# Run all validation checks
/validate --all

# Export validation report
/validate --all --format json --export ./validation-report.json

# Dry run showing validation plan
/validate --dry-run --all
```

### Practical Examples

```bash
# Pre-deployment validation of all configurations
/validate --config --all --environment production --verbose

# Validate Perimeter module data integrity
/validate --schema PrismaticPerimeter.Asset --schema PrismaticPerimeter.SecurityRating --verbose

# Generate comprehensive input validation for new module
/validate --generate PrismaticPerimeter.ScanResult --include-changesets --include-guards

# Cross-application contract validation
/validate --contracts --app "prismatic_web,prismatic_api,prismatic_perimeter" --verbose

# Runtime state validation before maintenance
/validate --state --checks "ets_tables,genservers,database_connections" --format json
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--module` | `string` | none | Specific module to validate |
| `--schema` | `string` | none | Specific Ecto schema to validate |
| `--config` | `string` | none | Application configuration to validate |
| `--api` | `string` | none | API application to validate |
| `--state` | `flag` | false | Validate runtime system state |
| `--contracts` | `flag` | false | Validate cross-application contracts |
| `--generate` | `string` | none | Generate validation code for module |
| `--all` | `flag` | false | Run all validation checks |
| `--app` | `string` | all | Target application(s) |
| `--environment` | `enum` | `dev` | Environment: `dev`, `staging`, `production` |
| `--verbose` | `flag` | false | Detailed validation results |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export validation report |
| `--dry-run` | `flag` | false | Show validation plan without executing |
| `--include-changesets` | `flag` | false | Include Ecto changeset generation |
| `--include-guards` | `flag` | false | Include guard clause generation |
| `--checks` | `string` | all | Specific state checks to run |
| `--strict` | `flag` | false | Fail on any validation warning |

## Execution Flow

### Phase 1: Scope Resolution

The orchestrator determines the validation scope based on options. For `--module`, the target module is loaded and its public functions are extracted with their @spec types. For `--schema`, the Ecto schema definition is loaded with field types, validations, and constraints. For `--config`, configuration files are parsed and expected types are determined.

### Phase 2: Rule Extraction

Validation rules are extracted from the codebase: @spec types become type checks, changeset functions become schema validations, guard clauses become range checks, and documentation annotations become business rule validations. For `--generate` mode, the system analyzes the module to infer appropriate validation rules.

### Phase 3: Validation Execution

Rules are executed against the target. For static validation (module, schema, config), rules are checked against the code structure. For runtime validation (state), rules are checked against the live system. Each rule produces a pass/fail/warning result with specific evidence.

### Phase 4: Cross-Reference Checking

Validation results are cross-referenced across applications. A schema field validated in one application is checked for consistent validation in consuming applications. API parameter types are verified against the calling code's expectations. Configuration values are checked for consistency across environments.

### Phase 5: Reporting

Results are aggregated into a validation report showing: total checks run, pass/fail/warning counts, specific failure details with remediation suggestions, and overall validation health score. For `--generate` mode, the generated validation code is included in the output.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/test](@/commands/test.md) | Peer | Tests verify validation behavior |
| [/code](@/commands/code.md) | Upstream | Code generation includes validation |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Validation results affect gate passage |
| [/security-audit](@/commands/security-audit.md) | Peer | Input validation is a security concern |
| [/route-test](@/commands/route-test.md) | Peer | Route tests include parameter validation |
| [Ecto](@/glossary/ecto.md) | Framework | Changeset validation infrastructure |
| [OpenApiSpex](@/glossary/openapi-spec.md) | Framework | API parameter validation |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Validation execution metrics |

## Best Practices

### Validate at Boundaries

Focus validation at system boundaries: API endpoints, Phoenix controllers, GenServer handle_call/cast/info, and public module interfaces. Internal functions can rely on the boundary validation having already occurred. This produces the best balance of safety and performance.

### Schema-Driven Validation

Let Ecto schemas drive validation through changeset functions. The changeset pattern provides a standard, composable approach to validation that integrates naturally with Phoenix forms, API processing, and database operations.

### Early Validation

Validate inputs as early as possible in the processing pipeline. A malformed input caught at the API parameter level is far cheaper than one caught during database insertion. Use `/validate --module` to verify that public functions validate their inputs before processing.

### Configuration Validation at Boot

Use `/validate --config --environment production` as part of the deployment pipeline. Configuration errors discovered at boot time (missing keys, wrong types, out-of-range values) are far less costly than those discovered during runtime under production load.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `TYPE_MISMATCH` | Value does not match expected type | Fix the value or update the type specification |
| `RANGE_VIOLATION` | Value outside acceptable range | Adjust value or range constraints |
| `REQUIRED_MISSING` | Required value is nil or absent | Provide the required value |
| `FORMAT_INVALID` | Value does not match expected format | Fix format or update format specification |
| `CONTRACT_VIOLATION` | Cross-application contract mismatch | Align producer and consumer expectations |
| `CONFIG_INVALID` | Configuration value fails validation | Fix configuration value |
| `STATE_INVARIANT_BROKEN` | Runtime state violates invariant | Investigate and restore valid state |
| `GENERATION_FAILURE` | Cannot generate validation for module | Check module structure |

## Advanced Usage

### Custom Validation Rules

Define project-specific validation rules:

```bash
/validate --custom-rules ./validation-rules/prismatic-rules.yaml --all
```

### Validation Code Generation with Tests

Generate validation code with accompanying test suite:

```bash
/validate --generate PrismaticPerimeter.ScanResult --include-changesets --include-guards --include-tests
```

### Continuous Validation

Set up continuous validation during development:

```bash
/validate --watch --module PrismaticPerimeter.SecurityRating --verbose
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every public function must validate its inputs. Every Ecto schema must have changeset validation. No unvalidated data crosses application boundaries.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every validation failure includes the specific rule violated, the invalid value, and a remediation suggestion.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/security-audit](@/commands/security-audit.md) - Comprehensive application security audit and vulnerability scan
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/route-test](@/commands/route-test.md) - Route testing and HTTP endpoint verification
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)