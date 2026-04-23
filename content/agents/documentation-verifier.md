+++
title = "documentation-verifier"
weight = 142
[extra]
domain = "quality"
level = "L3"
description = "Code-comment consistency checking, return type documentation verification, example code validation, and synchronization between docs and implementation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "genstage", "ets"]
domain_normalized = "quality"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 216
quality_score = 42
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["documentation-verifier", "Code-comment", "agents", "agent", "Prismatic Platform", "Pass", "Documentation", "Verification"]
tags = ["agents", "agent", "documentation-verifier", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "documentation-verifier - Prismatic Platform"
+++

## Overview

The Documentation Verifier operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Quality domain of the Prismatic Platform. This agent performs fine-grained verification of code-comment consistency, return type documentation accuracy, example code validity, and synchronization between documentation artifacts and their corresponding implementations. While the Documentation Validation Commander operates at the strategic campaign level, the Documentation Verifier works at the individual module and function level, ensuring that every `@doc`, `@moduledoc`, and `@spec` annotation accurately reflects the current implementation.

In a codebase of 6,652 Elixir source files containing approximately 2.8 million lines of code, documentation at the function level is both essential and fragile. Refactoring operations that modify function signatures, rename parameters, or change return types frequently leave documentation annotations behind. The Documentation Verifier detects these discrepancies through systematic introspection of compiled modules, comparing documented claims against actual typespecs, function arities, and runtime behavior sampled through example code execution.

The agent integrates with the platform's [quality gates](/glossary/quality-gates/) pipeline, treating documentation accuracy as a quality dimension subject to the same enforcement rigor as compilation warnings and [Credo](/glossary/credo/) violations. Documentation inaccuracies contribute to [Quality Debt Points](/glossary/qdp/) (QDP) and are tracked through the same elimination infrastructure used for code quality issues.

## Architecture

The Documentation Verifier employs a three-pass verification architecture that progressively deepens analysis from structural checks through semantic validation to runtime verification.

```
Pass 1: Static Analysis          Pass 2: Introspection         Pass 3: Runtime
  - @doc presence check            - Typespec comparison          - Example execution
  - @moduledoc presence            - Arity verification           - Return type check
  - @spec format validation        - Parameter name match         - Exception validation
  - Comment syntax check           - Deprecation consistency      - Performance sampling
         |                                |                              |
         +------------- Merge + QDP Scoring -------- Trinity Gate -------+
                                |
                        Verification Report
```

**Pass 1: Static Analysis.** The first pass examines documentation artifacts without requiring compilation. It verifies presence of `@moduledoc` and `@doc` annotations, validates `@spec` syntax, checks comment formatting consistency, and identifies documentation-free public functions. This pass runs in under 50ms per module and provides rapid feedback during development.

**Pass 2: Module Introspection.** The second pass compiles modules and uses Elixir introspection capabilities to compare documentation against compiled artifacts. `Code.Typespec.fetch_specs/1` retrieves actual typespecs for comparison against documented return types. `Module.__info__(:functions)` verifies that documented functions exist with correct arities. `Code.fetch_docs/1` retrieves structured documentation for semantic analysis.

**Pass 3: Runtime Verification.** The third pass executes example code blocks embedded in documentation to verify they produce the documented results. This catches documentation examples that have become invalid due to API changes. Example execution occurs in sandboxed processes with timeout limits to prevent hanging or resource exhaustion from invalid examples.

## Core Capabilities

**Code-Comment Consistency Checking.** The verifier analyzes inline comments and `@doc` annotations for consistency with the code they describe. When a function's implementation changes but its documentation does not update to reflect the new behavior, the verifier flags the discrepancy. Pattern matching between documented parameter descriptions and actual parameter names identifies renamed-but-not-redocumented parameters.

**Return Type Documentation Verification.** Documented return types in `@spec` annotations are compared against the actual return patterns observed through module introspection and, where available, through sample execution. Type mismatches between documented and actual return types are classified as critical quality violations because they directly mislead consumers of the API.

**Example Code Validation.** Documentation examples embedded in `@doc` annotations using the `iex>` convention are extracted and executed in sandboxed environments. Examples that raise exceptions, produce different output than documented, or fail to compile are flagged. This capability ensures that documentation examples serve as executable specifications rather than stale illustrations.

**Synchronization Monitoring.** The verifier tracks the relationship between source file modification timestamps and documentation update timestamps. When a module's implementation changes without a corresponding documentation update, the verifier adds the module to a drift tracking list. Drift age is reported in verification results, enabling prioritization of documentation updates.

**Property-Based Documentation Testing.** Beyond individual example validation, the verifier generates property-based tests from documented type specifications. If a function is documented as accepting `non_neg_integer()` and returning `{:ok, binary()}`, the verifier generates random inputs within the documented type domain and verifies that outputs conform to the documented return type.

**QDP Integration.** Documentation quality issues are quantified as [Quality Debt Points](/glossary/qdp/) and integrated into the platform's debt elimination infrastructure. Undocumented public functions, inaccurate typespecs, and broken examples each contribute configurable QDP scores, enabling prioritization alongside other quality debt categories.

## Implementation

```elixir
defmodule PrismaticAgents.DocumentationVerifier do
  @moduledoc """
  L3 Documentation Verifier - fine-grained verification of
  code-comment consistency, return types, and example validity.
  """
  use GenServer

  alias PrismaticAgents.DocumentationVerifier.{
    StaticAnalyzer,
    ModuleIntrospector,
    ExampleRunner,
    QDPScorer
  }

  @type verification_result :: %{
    module: module(),
    pass1_static: [finding()],
    pass2_introspection: [finding()],
    pass3_runtime: [finding()],
    qdp_score: non_neg_integer(),
    verified_at: DateTime.t()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec verify_module(module(), keyword()) ::
    {:ok, verification_result()} | {:error, term()}
  def verify_module(module, opts \\ []) do
    GenServer.call(__MODULE__, {:verify, module, opts}, 60_000)
  end

  @impl true
  def handle_call({:verify, module, opts}, _from, state) do
    result =
      with {:ok, static} <- StaticAnalyzer.analyze(module),
           {:ok, introspection} <- ModuleIntrospector.compare(module),
           {:ok, runtime} <- ExampleRunner.execute(module, opts) do
        qdp = QDPScorer.compute(static, introspection, runtime)
        {:ok, %{
          module: module,
          pass1_static: static.findings,
          pass2_introspection: introspection.findings,
          pass3_runtime: runtime.findings,
          qdp_score: qdp,
          verified_at: DateTime.utc_now()
        }}
      end

    {:reply, result, state}
  end
end
```

## Integration Points

| Component | Integration Type | Purpose |
|-----------|-----------------|---------|
| [Quality Gates](/glossary/quality-gates/) | Pipeline Stage | Documentation verification as a quality gate requirement |
| [Prismatic Safety](/glossary/quality-floor-guardian/) | Quality Monitoring | Verification results feed into quality floor guardian |
| [GitLab CI](/glossary/gitlab-ci/)/CD | Pipeline Enforcement | Automated verification during CI with blocking on critical failures |
| [documentation-validation-commander](/agents/documentation-validation-commander/) | Command Authority | Receives campaign directives and reports verification results |
| [ETS](/glossary/ets/) | Cache Layer | Verification results cached per module with invalidation on recompilation |
| [Telemetry](/glossary/telemetry/) | Observability | Per-module verification metrics and QDP contribution tracking |

## Operational Workflow

**Phase 1: Module Discovery.** The verifier scans the compilation manifest to identify all compiled modules across the 90 umbrella applications. Modules are classified by documentation priority: public API modules receive highest priority, internal implementation modules receive standard priority, and test helper modules receive lowest priority.

**Phase 2: Three-Pass Verification.** Each module passes through the static analysis, introspection, and runtime verification passes sequentially. Results from earlier passes inform later passes -- for example, if static analysis identifies a missing `@spec`, the introspection pass skips typespec comparison for that function and focuses on arity and parameter name verification.

**Phase 3: QDP Scoring.** Verification findings are converted to Quality Debt Points using configurable scoring rules. Missing `@moduledoc` contributes 3 QDP. Missing `@spec` on a public function contributes 2 QDP. Inaccurate return type documentation contributes 5 QDP. Broken example code contributes 4 QDP. The total QDP score for each module is tracked over time to measure documentation quality trends.

**Phase 4: Report Generation.** Verification results are compiled into structured reports that identify specific discrepancies, their locations, their QDP contributions, and suggested corrections. Reports are delivered to the Documentation Validation Commander for campaign-level aggregation and to the quality gates pipeline for enforcement.

**Phase 5: Regression Tracking.** The verifier maintains historical records of per-module verification results, enabling trend analysis. Modules with improving documentation quality scores are identified as positive evolution signals. Modules with degrading scores trigger investigation into whether code changes are outpacing documentation updates.

## NABLA Compliance

| Axiom | Verification Enforcement |
|-------|--------------------------|
| **Signal Plurality** | Documentation accuracy requires agreement between static analysis, introspection, and runtime verification passes |
| **Contradiction Preservation** | When documentation contradicts code, both the documented and actual behaviors are recorded in the verification report |
| **Provenance Mandatory** | Every finding includes the specific file, line number, function, and comparison data that constitutes the evidence |
| **Time Decay** | Verification results are timestamped and invalidated when the verified module is recompiled |
| **Source Independence** | Each verification pass uses independent analysis methods to prevent shared-mode failures |

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.DocumentationVerifier,
  # QDP scoring weights
  missing_moduledoc_qdp: 3,
  missing_spec_qdp: 2,
  inaccurate_return_type_qdp: 5,
  broken_example_qdp: 4,
  missing_doc_public_fn_qdp: 2,

  # Example execution
  example_timeout_ms: 5_000,
  example_sandbox_memory_limit: :megabytes_50,
  skip_expensive_examples: false,

  # Verification scope
  skip_test_modules: true,
  skip_private_modules: false,
  priority_modules_regex: ~r/^Prismatic\./
```

## Performance

| Metric | Target | Description |
|--------|--------|-------------|
| **Static Analysis** | < 50ms/module | Pass 1 structural verification per module |
| **Introspection** | < 200ms/module | Pass 2 typespec and arity comparison per module |
| **Example Execution** | < 5s/module | Pass 3 sandboxed example running per module |
| **Full Codebase Scan** | < 30 min | All 6,652 source files verified |
| **QDP Accuracy** | > 90% | Agreement between automated scoring and manual review |
| **Cache Hit Rate** | > 80% | Unchanged modules served from verification cache |

## Related Resources

- [**cascade-quality-specialist**](/agents/cascade-quality-specialist/) (L3) - Systematic CASCADE elimination specialist preventing quality debt through pattern-based evolution
- [**hbfs-quality-evolution**](/agents/hbfs-quality-evolution/) (L3) - Drives continuous quality evolution through HBFS optimization methodology
- [**integration-testing-specialist**](/agents/integration-testing-specialist/) (L3) - End-to-end integration testing across system boundaries
- [**documentation-validation-commander**](/agents/documentation-validation-commander/) (L3) - Strategic commander coordinating documentation quality campaigns
- [Quality Gates](/glossary/quality-gates/) - Platform quality enforcement pipeline consuming verification results

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)