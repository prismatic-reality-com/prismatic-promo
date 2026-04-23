+++
title = "pattern-matching-auditor"
weight = 289
[extra]
domain = "quality"
level = "L3"
description = "Verify pattern match arity (2-tuple vs 3-tuple), detect unreachable clauses, validate function return types, and ensure pattern matching correctness (GENETICALLY ENHANCED)"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "seadf"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2150
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pattern-matching-auditor", "Verify", "2-tuple", "3-tuple", "GENETICALLY", "ENHANCED", "agents", "agent", "Prismatic Platform", "Elixir"]
tags = ["agents", "agent", "pattern-matching-auditor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "pattern-matching-auditor - Prismatic Platform"
+++

## Overview

The Pattern Matching Auditor operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's quality domain, providing automated static analysis of Elixir [pattern matching](@/glossary/pattern-matching.md) usage across the platform's 90 umbrella applications and approximately 6,600 Elixir source files. Pattern matching is the fundamental control flow mechanism in Elixir and the broader [BEAM](@/glossary/beam.md) ecosystem, and errors in pattern matching -- mismatched tuple arities, unreachable clauses, incomplete case coverage, and inconsistent return type patterns -- represent a significant class of defects that can cause runtime crashes in production.

This agent is genetically enhanced through the [SEADF](@/glossary/seadf.md) evolutionary framework, continuously improving its detection heuristics based on historical defect data. Unlike Dialyzer, which performs type-level analysis, the Pattern Matching Auditor focuses specifically on structural pattern correctness: ensuring that every pattern match in the codebase correctly handles the data shapes it will encounter at runtime. The [NO MERCY](@/glossary/no-mercy.md) doctrine requires zero tolerance for pattern matching defects -- every identified issue must be resolved before code reaches production.

## Theoretical Foundations

Pattern matching correctness in Elixir programs can be decomposed into several formal properties. Arity consistency requires that all clauses matching against tuples in a given context agree on the tuple size or explicitly handle multiple arities. Exhaustiveness requires that the set of patterns in a case/cond/receive expression covers all values that the matched expression can produce. Reachability requires that every clause in a pattern match sequence can be triggered by at least one possible input value. Return type consistency requires that all clauses of a function return values conforming to a common type specification.

The agent's analysis engine models these properties as constraint satisfaction problems. For each pattern match site in the codebase, the engine extracts the set of matched patterns, constructs a pattern space covering all possible input shapes, and verifies that the patterns satisfy the required properties. This approach catches defects that manifest only under specific runtime conditions, which conventional testing often misses due to incomplete input coverage.

## Operational Domain

The quality domain encompasses all aspects of code correctness verification within the Prismatic Platform. The Pattern Matching Auditor specializes in the structural analysis of pattern matching constructs including function head patterns, case expressions, with expressions, receive blocks, and destructuring assignments. The agent maintains a continuously updated model of the platform's type landscape, tracking how data structures flow between modules and functions to understand the shapes that patterns must handle.

The agent's scope extends beyond simple local analysis to cross-module pattern flow tracking. When a function in module A produces a tagged tuple that is consumed by a pattern match in module B, the auditor verifies that module B's patterns correctly handle all possible return shapes from module A. This cross-module analysis catches a class of defects that are invisible to file-level static analysis tools.

## Key Capabilities

- **Tuple arity verification** -- Analyzes all pattern matches involving tuples to verify consistent arity handling, detecting mismatches where code expects a 2-tuple (e.g., `{:ok, value}`) but the matched expression can produce a 3-tuple (e.g., `{:ok, value, metadata}`), which would cause a `MatchError` at runtime

- **Unreachable clause detection** -- Identifies pattern match clauses that can never be reached because a preceding clause matches a superset of the same patterns, indicating either dead code or an ordering error that prevents intended behavior

- **Return type consistency validation** -- Verifies that all clauses of a multi-clause function return values conforming to the function's `@spec` typespec, detecting clauses that accidentally return raw values instead of tagged tuples or vice versa

- **Exhaustiveness analysis** -- Evaluates case expressions and function head patterns for completeness, identifying missing patterns that could cause `CaseClauseError` or `FunctionClauseError` at runtime with specific inputs

- **Cross-module pattern flow tracking** -- Traces data flow across module boundaries to verify that consuming patterns handle all shapes produced by upstream functions, catching interface mismatches between collaborating modules

- **[CASCADE](@/glossary/cascade.md) pattern detection** -- Identifies pattern matching anti-patterns that have been classified in the platform's [QDP](@/glossary/qdp.md) taxonomy, applying known fix patterns automatically where safe

- **[Property-based testing](@/glossary/property-based-testing.md) integration** -- Generates property-based test cases targeting identified pattern match sites to verify fix correctness under randomized inputs

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to flag pattern matching defects across any platform application and block deployment of code containing unresolved pattern matching errors.

## Genetic Enhancement

The SEADF evolutionary framework continuously improves the auditor's detection capabilities through genetic programming techniques. The agent maintains a population of detection heuristics that compete based on their ability to identify genuine defects while minimizing false positives. Each evolution cycle mutates and recombines successful heuristics, evaluates their performance against a corpus of known defects and known-good code, and selects the highest-performing variants for the next generation.

Historical defect data from the platform's issue tracking system provides the fitness function for evolution. Heuristics that would have caught past production defects receive higher fitness scores, while heuristics that flag correct code as defective receive penalties. This evolutionary pressure drives the auditor toward increasingly precise defect detection over time, adapting to the platform's evolving coding patterns and architectural decisions.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pattern-audit scan` | Execute pattern matching audit across specified applications | L3+ |
| `/pattern-audit report` | Generate detailed audit report with defect classifications | L3+ |
| `/pattern-audit fix` | Apply automated fixes for known pattern matching anti-patterns | L3+ |
| `/pattern-audit evolve` | Trigger genetic evolution cycle for detection heuristics | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [code-quality-commander](@/agents/code-quality-commander.md) | Pattern audit results feed into the platform's aggregate quality score |
| [pattern-quality-analyst](@/agents/pattern-quality-analyst.md) | Quality analysis of detected patterns informs audit prioritization |
| [pattern-propagator-specialist](@/agents/pattern-propagator-specialist.md) | Verified fix patterns propagated across similar code sites platform-wide |
| [performance-specialist](@/agents/performance-specialist.md) | Pattern matching efficiency analysis for performance-critical code paths |

## Detection Categories

The auditor classifies detected issues into severity categories that determine enforcement response:

| Category | Severity | Example | Action |
|----------|----------|---------|--------|
| **Arity Mismatch** | Critical | Matching 2-tuple against 3-tuple producer | Block deployment |
| **Unreachable Clause** | Warning | Dead match clause shadowed by broader pattern | Flag for removal |
| **Missing Pattern** | Critical | Incomplete case coverage for known input shapes | Block deployment |
| **Return Inconsistency** | Error | Function clause returns untagged value against tagged spec | Require fix |
| **Redundant Pattern** | Info | Duplicate pattern with identical handling | Suggest simplification |

## Enforcement

Pattern matching defects are enforced under the [NO MERCY](@/glossary/no-mercy.md) doctrine with zero tolerance for critical and error severity issues. All detected defects carry full diagnostic context including the exact code location, the conflicting patterns, example inputs that would trigger the defect, and suggested fixes. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that every reported defect includes a concrete demonstration scenario proving the defect's reachability, preventing false positive noise from disrupting development velocity.

## Related Agents

Agents in the **quality** domain collaborate to maintain the platform's perfect 100/100 quality score. The Pattern Matching Auditor contributes the pattern correctness dimension, working alongside type analysis, code style, test coverage, and documentation quality agents to ensure comprehensive code quality enforcement.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)