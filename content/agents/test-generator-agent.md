+++
title = "Test Generator Agent"
weight = 398
[extra]
domain = "quality-assurance"
level = "L3"
description = "Automates the generation of comprehensive, production-ready tests for GenServer modules as part of the M47 Mass Testing Initiative targeting 968 GenServers across the platform."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "otp", "seadf"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Test", "Generator", "Agent", "Automates", "GenServer", "Mass", "Testing", "Initiative", "GenServers", "agents"]
tags = ["agents", "agent", "test-generator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Test Generator Agent - Prismatic Platform"
+++

## Overview

The Test Generator Agent is an L3 strategic command agent operating within the Prismatic Platform's quality-assurance domain, purpose-built to automate the generation of comprehensive, production-ready tests for [GenServer](/glossary/genserver/) modules across the platform. Created as part of the M47 Mass Testing Initiative targeting 968 GenServers, this agent addresses the fundamental challenge of achieving complete test coverage across a large-scale [OTP](/glossary/otp/) application ecosystem where manual test creation cannot scale to meet coverage requirements.

The platform's quality standard demands 100% test passage with comprehensive coverage of all behavioral contracts. With 968 GenServer modules representing the core stateful components of the system, automated test generation provides the only viable path to complete coverage within practical timeframes. Operating under the [AIAD](/glossary/aiad/) standard and [No Mercy, No Doubts](/glossary/no-mercy/) doctrine, the agent generates tests that meet production-quality standards with zero tolerance for brittle, flaky, or incomplete test cases.

## Theoretical Foundations

Automated test generation draws from multiple theoretical traditions in software engineering research. The field of search-based software testing (SBST) applies metaheuristic optimization algorithms to the problem of generating test inputs that maximize code coverage. Genetic algorithms, simulated annealing, and hill climbing have all been successfully applied to test generation, and the Test Generator Agent implements adapted versions of these techniques for the Elixir/OTP context.

Specification-based test generation, grounded in the work of Gaudel and others, derives test cases from formal or semi-formal specifications. In the OTP context, GenServer callback specifications (@spec annotations) serve as the specification basis. The agent analyzes function signatures, return type specifications, and behavioral contracts to generate test cases that exercise the specified behavior systematically.

[Property-based testing](/glossary/property-based-testing/), pioneered by QuickCheck and implemented in Elixir through StreamData, provides a complementary approach where tests verify invariant properties rather than specific input-output pairs. The agent generates property-based tests that verify behavioral invariants such as "init always returns a valid state", "handle_call with valid input always returns a valid reply", and "handle_info never crashes the server".

The theory of mutation testing provides the quality metric for generated tests. By systematically introducing small changes (mutations) to the code under test and verifying that the generated tests detect these mutations, the agent validates that its generated tests are truly effective at catching defects rather than merely achieving superficial coverage metrics.

## Core Capabilities

**GenServer-Aware Test Generation** produces tests that are specifically designed for OTP GenServer modules, understanding the lifecycle (init, terminate), synchronous calls (handle_call), asynchronous casts (handle_cast), info message handling (handle_info), and code change (code_change) callbacks. Generated tests exercise each callback through the GenServer interface rather than calling functions directly, ensuring that tests validate the complete OTP behavior including process management.

**Specification-Driven Test Cases** analyzes @spec type annotations to generate test inputs that cover the specified type domain. For each specified input type, the agent generates representative values, boundary values, and error-inducing values. For example, a spec accepting `non_neg_integer()` generates tests with 0, 1, large integers, and verifies appropriate error handling for negative inputs.

**Property-Based Test Generation** creates StreamData-based property tests that verify behavioral invariants across large randomized input spaces. Properties are derived from common GenServer behavioral contracts and from module-specific patterns identified through code analysis.

**State Transition Testing** models GenServer state as a state machine and generates test sequences that exercise state transitions systematically. The agent identifies distinct state configurations reachable through different callback sequences and generates tests that verify behavior in each state.

**Regression Test Generation** creates targeted tests for code areas that have historically contained defects, as identified by the [CASCADE](/glossary/cascade/) pattern library and bug fix history. These tests focus on the specific failure modes that have occurred in the past, preventing recurrence.

## Architecture and Implementation

The Test Generator Agent operates as a supervised [OTP](/glossary/otp/) process with a multi-stage generation pipeline.

| Component | Function | Implementation |
|-----------|----------|---------------|
| Module Analyzer | Parse GenServer module structure and specs | AST analysis + Code.fetch_docs |
| Input Generator | Produce test inputs from type specifications | Type-aware value generation |
| Property Deriver | Identify and formalize behavioral invariants | Pattern matching + heuristic rules |
| Test Composer | Assemble test cases into ExUnit test modules | Template-based code generation |
| Quality Validator | Verify generated tests compile and pass | ExUnit execution + coverage check |
| Batch Processor | Manage parallel generation across 968 modules | Task.async_stream coordination |

The module analyzer performs deep inspection of each GenServer module, extracting callback function signatures, type specifications, module documentation, and structural patterns. This analysis produces a module profile that drives subsequent generation stages.

The input generator implements type-aware value generation that produces representative values for all Elixir types encountered in GenServer specifications. The generator handles complex types including unions, recursive types, custom structs, and opaque types through a compositional approach where complex type generators are built from simpler type generators.

## Test Generation Methodology

The generation process follows a structured methodology that produces consistently high-quality test modules.

| Phase | Activity | Output |
|-------|----------|--------|
| Analysis | Parse module structure, specs, and documentation | Module profile |
| Planning | Determine test strategy based on module complexity | Test plan |
| Generation | Produce test cases for each callback | Raw test cases |
| Composition | Assemble test cases into ExUnit module | Complete test file |
| Validation | Compile and execute generated tests | Validated test module |
| Quality Check | Verify coverage and mutation survival | Quality-assured test module |

The planning phase determines the appropriate test strategy based on module complexity. Simple GenServers with few callbacks and straightforward state receive concise test suites. Complex GenServers with many state transitions, external dependencies, or concurrent interactions receive more extensive test suites with additional property tests and state machine coverage.

## Generated Test Structure

Generated tests follow a consistent structure that maintains readability and maintainability.

Each generated test module includes setup blocks that start the GenServer under test with appropriate initial state, individual test cases for each callback function with descriptive names, property-based tests for behavioral invariants, edge case tests derived from type boundary analysis, and cleanup logic that properly terminates the GenServer after each test.

Tests use the Arrange-Act-Assert pattern consistently. The Arrange phase establishes the GenServer state required for the test scenario. The Act phase invokes the callback through the GenServer interface (GenServer.call, GenServer.cast, or direct send). The Assert phase verifies the expected return value, state change, and any side effects.

## Integration Points

| System | Integration Purpose | Data Flow |
|--------|-------------------|-----------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent lifecycle and task dispatch | Bidirectional |
| [Trinity Gate](/glossary/trinity-gate/) | Generated test quality verification | Mandatory check |
| [SEADF](/glossary/seadf/) | Testing effectiveness tracking | Bidirectional |
| [Prismatic Telemetry](/glossary/telemetry/) | Generation metrics and events | Write |
| [AIAD Registry](/glossary/registry-otp/) | Agent specification and discovery | Read |
| [Systematic Verifier](/agents/systematic-verifier/) | Integration with verification pipeline | Bidirectional |

## Quality Assurance

Generated test quality is validated through multiple mechanisms. Compilation verification ensures that all generated tests compile without warnings. Execution verification confirms that generated tests pass against the current codebase. Coverage analysis verifies that generated tests achieve the target coverage threshold for the module under test. Mutation testing validates that generated tests effectively detect artificially introduced defects.

The agent tracks generation quality metrics including tests generated per module, coverage achieved, mutation kill rate, and the ratio of generated tests that require human modification versus those that are production-ready as generated.

## Related Agents

The Test Generator Agent produces tests that are executed by the [systematic-verifier](/agents/systematic-verifier/) as part of the verification pipeline. The [test-specialist](/agents/test-specialist/) provides broader testing expertise that informs generation strategies. The [type-annotation-analyst](/agents/type-annotation-analyst/) ensures that type specifications used as generation inputs are accurate and complete.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)