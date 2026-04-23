+++
title = "/propagate-pattern"
weight = 1230
[extra]
category = "Documentation"
description = "Propagate successful patterns across the ecosystem"
syntax = "/propagate-pattern [options]"
authority = "L2+"
agent = "pattern-propagator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1103
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["propagate-pattern", "Propagate", "commands", "Documentation", "Prismatic Platform", "PrismaticMycelium", "Pattern", "GARDEN", "File"]
tags = ["commands", "documentation", "propagate-pattern", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/propagate-pattern - Prismatic Platform"
+++

## Overview

**/propagate-pattern** is a production command in the **Documentation** category of the Prismatic Platform that identifies successful implementation patterns in one part of the codebase and systematically propagates them across the entire ecosystem. The command leverages the platform's mycelial pattern detection infrastructure to find proven solutions -- whether architectural patterns, error handling approaches, test structures, or configuration conventions -- and applies them consistently to modules and applications that would benefit from the same approach.

Pattern propagation is a core mechanism of the platform's self-evolving architecture. When a developer solves a problem well in one umbrella application, that solution should not remain isolated. The propagate-pattern command analyzes the structural signature of the pattern, identifies candidate locations across the 90+ umbrella applications where the same problem exists (or could exist), generates transformation plans, and optionally applies the changes with full regression test coverage.

This command operates under the **L2+** authority level and is executed by the `pattern-propagator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The pattern propagation system processes patterns at rates exceeding 500,000 patterns per second using the platform's optimized mycelial network, making ecosystem-wide consistency checks and transformations practical even at the platform's current scale of 6,600+ Elixir source files.

The command draws on the [GARDEN](@/glossary/garden.md) legacy knowledge base of 55+ proven patterns accumulated over 20+ years of development, combining historical pattern wisdom with real-time codebase analysis to ensure that propagated patterns are not merely syntactically correct but architecturally sound.

## Architecture

The pattern propagation system operates through a pipeline that moves from pattern identification through validation to application.

```
Pattern Source
      |
      v
+------------------+
| Pattern Analyzer |
| (AST extraction) |
+------------------+
      |
      v
+------------------+     +------------------+
| Candidate Finder |<--->| Pattern Library  |
| (mycelial scan)  |     | (55+ patterns)   |
+------------------+     +------------------+
      |
      v
+------------------+
| Transform Planner|
| (diff generation)|
+------------------+
      |
      v
+------------------+     +------------------+
| Pattern Applier  |---->| Regression       |
| (code transform) |     | Validator        |
+------------------+     +------------------+
```

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Pattern Analyzer** | `PrismaticMycelium.PatternAnalyzer` | Extracts structural signatures from source patterns |
| **Candidate Finder** | `PrismaticMycelium.CandidateFinder` | Identifies locations where pattern applies |
| **Pattern Library** | `PrismaticMycelium.PatternLibrary` | Curated library of proven platform patterns |
| **Transform Planner** | `PrismaticMycelium.TransformPlanner` | Generates transformation diffs for each candidate |
| **Pattern Applier** | `PrismaticMycelium.PatternApplier` | Applies transformations with rollback capability |
| **Regression Validator** | `PrismaticMycelium.RegressionValidator` | Verifies no regressions after transformation |

## Usage

### Pattern Discovery and Propagation

```bash
# Propagate a pattern from a specific module
/propagate-pattern --source apps/prismatic_perimeter/lib/prismatic_perimeter/scanner.ex

# Propagate a named pattern from the library
/propagate-pattern --pattern "genserver-with-telemetry"

# Dry-run showing what would change
/propagate-pattern --source apps/prismatic/lib/prismatic/facade.ex --dry-run

# Propagate with automatic application
/propagate-pattern --pattern "error-tuple-handling" --apply
```

### Pattern Analysis

```bash
# Analyze a module for extractable patterns
/propagate-pattern --analyze apps/prismatic_storage_ets/lib/adapter.ex

# List all patterns in the library
/propagate-pattern --list

# Show pattern details
/propagate-pattern --describe "supervision-tree-standard"

# Find patterns similar to a code snippet
/propagate-pattern --similar "GenServer.call(server, {:get, key})"
```

### Scoped Propagation

```bash
# Propagate only within a specific application
/propagate-pattern --pattern "ok-error-handling" --scope prismatic_perimeter

# Propagate across all storage adapters
/propagate-pattern --pattern "adapter-contract" --scope "prismatic_storage_*"

# Propagate to test files only
/propagate-pattern --pattern "test-setup-pattern" --scope-type test
```

### Reporting

```bash
# Generate a pattern coverage report
/propagate-pattern --report

# Show pattern adoption statistics
/propagate-pattern --stats

# Export propagation plan as JSON
/propagate-pattern --pattern "telemetry-events" --dry-run --format json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--source` | `string` | `nil` | Source file containing the pattern to extract and propagate |
| `--pattern` | `string` | `nil` | Named pattern from the pattern library |
| `--analyze` | `string` | `nil` | File to analyze for extractable patterns |
| `--list` | `boolean` | `false` | List all available patterns in the library |
| `--describe` | `string` | `nil` | Show detailed description of a named pattern |
| `--similar` | `string` | `nil` | Find patterns similar to a code snippet |
| `--dry-run` | `boolean` | `false` | Show planned transformations without applying |
| `--apply` | `boolean` | `false` | Apply transformations to candidate files |
| `--scope` | `string` | `all` | Limit propagation to matching applications |
| `--scope-type` | `string` | `all` | File type filter: source, test, config |
| `--report` | `boolean` | `false` | Generate pattern coverage report |
| `--stats` | `boolean` | `false` | Show pattern adoption statistics |
| `--format` | `json \| text` | `text` | Output format |
| `--max-candidates` | `integer` | `50` | Maximum number of candidate locations to process |
| `--confidence` | `float` | `0.8` | Minimum confidence threshold for candidate matches |

## Execution Flow

1. **Pattern Identification** -- The source pattern is identified either by extracting it from a specified source file using AST analysis or by loading it from the named pattern library. The pattern's structural signature is computed, capturing the essential code shape while abstracting variable names and specific values.

2. **Candidate Discovery** -- The mycelial network scans the entire codebase for locations that exhibit structural similarity to the identified pattern. Each candidate is scored by confidence level based on the degree of structural match.

3. **Contextual Analysis** -- Each candidate location is analyzed in context to determine whether the pattern transformation is appropriate. Factors include surrounding code structure, existing patterns in the same module, and application-specific constraints.

4. **Transform Planning** -- For each viable candidate, a transformation plan is generated as a structured diff showing exactly what code changes would be made. The plan preserves existing behavior while introducing the pattern.

5. **Validation** -- If `--apply` is specified, each transformation is applied incrementally and validated. Compilation is checked, existing tests are run, and any regressions cause automatic rollback of that specific transformation.

6. **Reporting** -- A summary report is generated showing how many candidates were found, how many were transformed, and any skipped locations with reasons.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [Mycelium](@/glossary/mycelial-network.md) | Pattern detection and propagation engine | Core infrastructure |
| [GARDEN](@/glossary/garden.md) | 55+ proven patterns from 20+ years | Pattern library |
| [Quality Gates](@/glossary/quality-gates.md) | Post-propagation quality validation | Regression prevention |
| [SEADF](@/glossary/seadf.md) | Autonomous pattern evolution tracking | Evolution tracking |
| [Git Trees](@/glossary/git-trees.md) | Fast codebase scanning for candidates | File discovery |
| [Credo](@/glossary/credo.md) | Style consistency verification | Code quality |
| [Telemetry](@/glossary/telemetry.md) | Propagation event tracking and metrics | Observability |

## Best Practices

1. **Always dry-run first** -- Before applying pattern propagations, run with `--dry-run` to review all planned transformations. Patterns that are appropriate in one context may be harmful in another.

2. **Start with high confidence** -- Use `--confidence 0.9` initially to propagate only the most certain matches. Lower the threshold gradually as you build confidence in the pattern's applicability.

3. **Scope incrementally** -- Propagate to a single application first (`--scope prismatic_perimeter`), verify the results, then broaden the scope to the full ecosystem.

4. **Document new patterns** -- When extracting a pattern from source code, add it to the pattern library with a description, rationale, and known exceptions. This makes the pattern reusable without re-extraction.

5. **Test after propagation** -- Always run the full test suite for affected applications after applying propagations. The regression validator catches compilation and test failures but cannot detect subtle behavioral changes.

6. **Review GARDEN patterns** -- Before creating new patterns, check the GARDEN library for existing patterns that address the same concern. Reusing proven patterns is preferred over creating new ones.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :pattern_not_found}` | Named pattern does not exist in library | Use `--list` to see available patterns |
| `{:error, :no_candidates}` | No matching locations found in codebase | Lower `--confidence` or broaden `--scope` |
| `{:error, :transform_failed, file}` | Transformation produced invalid code | Review the transform plan; the file may have unusual structure |
| `{:error, :regression_detected, test}` | Applied pattern caused test failure | The pattern is not appropriate for this location; rollback applied |
| `{:error, :compilation_failed}` | Transformed code does not compile | Check type compatibility between pattern and target context |

## Advanced Usage

### Custom Pattern Definition

```elixir
# Define a custom pattern programmatically
pattern = %PrismaticMycelium.Pattern{
  name: "supervised-genserver",
  description: "GenServer with proper supervision tree integration",
  signature: {:defmodule, :_, [{:use, :_, [:GenServer]}, {:start_link, 1}, {:init, 1}]},
  transform: fn ast -> MyTransforms.add_supervision(ast) end,
  constraints: [requires: [:supervisor], excludes: [:task]]
}
PrismaticMycelium.PatternLibrary.register(pattern)
```

### Pattern Composition

```bash
# Apply multiple patterns in sequence
/propagate-pattern --pattern "ok-error-handling" --pattern "telemetry-events" --apply

# Chain patterns with validation between each
/propagate-pattern --chain "error-handling,telemetry,supervision" --validate-each
```

### Pattern Metrics

```bash
# Measure pattern adoption across the codebase
/propagate-pattern --stats --format json
# => {"patterns": 55, "adopted": 48, "coverage": 0.87, "candidates_remaining": 234}
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every propagated pattern must pass compilation and regression tests. No partial propagations are committed -- either all transformations in a scope succeed or all are rolled back.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Pattern applicability is determined by structural analysis with quantified confidence scores, not heuristic guessing. Each transformation plan is fully specified before any code is modified.

Pattern propagation enforces the [NABLA](@/glossary/nabla-infinity.md) Source Independence axiom by requiring that patterns prove their value independently across multiple applications before being promoted to the pattern library.

## Related Commands

- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/mycelialize](@/commands/mycelialize.md) - Biological-inspired pattern propagation at 500K patterns/sec
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/optimize](@/commands/optimize.md) - Performance optimization with measurement validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)