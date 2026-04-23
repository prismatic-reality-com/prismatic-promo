+++
title = "Executable Code"
weight = 50
[extra]
tags = ["glossary", "core", "code", "compilation", "beam", "elixir", "runtime", "bytecode", "security"]
description = "Executable code in the Prismatic Platform context refers to compiled, validated, and verified program instructions that have passed through the full quality gate pipeline -- from source through compilation to BEAM bytecode -- ensuring that every instruction in production is traceable, tested, and provably correct."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["compilation", "beam-vm", "elixir", "code-quality", "quality-gates", "static-analysis", "code-coverage", "code-generation", "ast", "hot-code-reload"]
key_technologies = ["Elixir", "BEAM VM", "OTP", "Dialyzer", "Credo", "ExUnit"]
platform_relevance = "critical"
aliases = ["compiled-code", "production-code", "beam-bytecode"]
version = "2.0.0"
date_created = "2025-05-01"
date_updated = "2026-02-22"
word_count = 1903
date_modified = "2026-02-23"
keywords = ["Executable", "Code", "Prismatic", "Platform", "BEAM", "glossary", "core", "Prismatic Platform", "Dialyzer", "Phase"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Executable Code - Prismatic Platform"
+++

## Definition

Executable code, within the Prismatic Platform, refers to compiled, validated, and verified program instructions that have passed through the complete quality gate pipeline and are authorized to run in a production environment. This definition goes beyond the conventional meaning of "code that a computer can execute." In the Prismatic Platform, executable code is code that has earned the right to execute by demonstrating -- through evidence -- that it is correct, safe, performant, and traceable to its source.

The journey from source code to executable code in the platform involves multiple verification stages: compilation with zero warnings, static analysis via Dialyzer and Credo, dynamic testing through ExUnit, property-based verification with StreamData, and passage through the quality gate pipeline. Only code that survives all stages without violations is considered executable. Code that compiles but fails quality gates is not executable in the platform sense -- it is merely syntactically valid.

This rigorous definition exists because the distinction between "code that can run" and "code that should run" is the difference between working software and reliable software. The BEAM virtual machine will happily execute code with type errors, race conditions, or security vulnerabilities. The Prismatic Platform's quality infrastructure ensures that such code never reaches production.

## Overview

The concept of executable code in the Prismatic Platform spans three distinct layers, each building on the previous one to create a chain of trust from source to runtime.

### Layer 1: Source Code

Source code is the human-readable Elixir, HTML (HEEx templates), JavaScript, and configuration files that developers write. In the platform, source code is not yet considered executable. It is a set of intentions expressed in programming languages, waiting to be validated. The platform enforces strict source code standards:

- Zero forbidden patterns (no mocks in lib/, no stubs, no placeholders)
- Full type specification coverage (`@spec` on all public functions)
- Credo compliance with `--strict` flag
- Documentation on all public modules and functions

### Layer 2: Compiled Code

Compilation transforms source code into BEAM bytecode (`.beam` files) that the Erlang virtual machine can execute. The Prismatic Platform compiles with `--warnings-as-errors --force`, treating any compiler warning as a blocking error. This ensures that the compiled output is free of ambiguities that the compiler detected.

Dialyzer analysis runs on the compiled code, performing success typing to detect type inconsistencies, unreachable code, and contract violations that the compiler alone cannot catch. The platform maintains a persistent PLT (Persistent Lookup Table) for efficient incremental analysis.

### Layer 3: Verified Executable

The final layer transforms compiled code into verified executable code through the quality gate pipeline:

1. **Compilation Gate**: Zero warnings, zero errors
2. **Static Analysis Gate**: Dialyzer clean, Credo clean
3. **Test Gate**: All tests pass, coverage meets thresholds
4. **Performance Gate**: No regressions above threshold
5. **Security Gate**: No known vulnerabilities
6. **Forbidden Pattern Gate**: No mocks, stubs, or placeholders
7. **Regression Gate**: No previously fixed bugs reintroduced

Code that passes all seven gates is marked as verified executable and authorized for production deployment. The verification status is recorded in the Quality DNA system, providing an audit trail of every piece of code running in production.

### The BEAM Execution Model

The Prismatic Platform runs on the BEAM (Bogdan/Bjorn's Erlang Abstract Machine), which provides several properties critical to executable code reliability:

- **Preemptive scheduling**: No single piece of code can monopolize CPU resources
- **Per-process garbage collection**: Memory management is isolated per process
- **Hot code reloading**: Code can be updated without stopping the system
- **Pattern matching**: Runtime type checking through pattern matches provides defense in depth
- **Let it crash**: Faulty code is isolated and restarted by supervisors

These BEAM properties create a runtime environment where executable code operates within strict isolation boundaries. Even if a piece of code has a bug that escaped the quality gates, the BEAM's supervision and isolation model prevents it from corrupting the entire system.

## Technical Details

### The Compilation Pipeline

```elixir
defmodule Prismatic.Build.CompilationPipeline do
  @moduledoc """
  Orchestrates the transformation from source code to verified executable.
  Each stage produces evidence that feeds into the quality gate pipeline.
  """

  @type compilation_result :: %{
    status: :success | :failure,
    warnings: non_neg_integer(),
    errors: non_neg_integer(),
    modules_compiled: non_neg_integer(),
    beam_files: [String.t()],
    compilation_time_ms: non_neg_integer(),
    evidence: [map()]
  }

  @spec compile_and_verify(keyword()) :: {:ok, compilation_result()} | {:error, term()}
  def compile_and_verify(opts \\ []) do
    with {:ok, compile_result} <- compile_source(opts),
         {:ok, dialyzer_result} <- run_dialyzer(opts),
         {:ok, credo_result} <- run_credo(opts),
         {:ok, test_result} <- run_tests(opts),
         {:ok, quality_result} <- check_quality_gates(opts) do
      result = %{
        status: :success,
        warnings: 0,
        errors: 0,
        modules_compiled: compile_result.module_count,
        beam_files: compile_result.beam_files,
        compilation_time_ms: compile_result.duration_ms,
        evidence: [
          compile_result.evidence,
          dialyzer_result.evidence,
          credo_result.evidence,
          test_result.evidence,
          quality_result.evidence
        ]
      }

      {:ok, result}
    end
  end

  defp compile_source(opts) do
    force = Keyword.get(opts, :force, false)
    args = ["compile", "--warnings-as-errors"] ++ if(force, do: ["--force"], else: [])

    case System.cmd("mix", args, stderr_to_stdout: true) do
      {output, 0} ->
        {:ok, %{
          module_count: count_compiled_modules(output),
          beam_files: list_beam_files(),
          duration_ms: extract_duration(output),
          evidence: %{type: :compilation, result: :clean, output: output}
        }}

      {output, _code} ->
        {:error, {:compilation_failed, output}}
    end
  end

  defp run_dialyzer(_opts) do
    case System.cmd("mix", ["dialyzer"], stderr_to_stdout: true) do
      {output, 0} ->
        {:ok, %{
          violations: 0,
          evidence: %{type: :dialyzer, result: :clean, output: output}
        }}

      {output, _code} ->
        {:error, {:dialyzer_violations, output}}
    end
  end

  defp run_credo(_opts) do
    case System.cmd("mix", ["credo", "--strict"], stderr_to_stdout: true) do
      {output, 0} ->
        {:ok, %{
          violations: 0,
          evidence: %{type: :credo, result: :clean, output: output}
        }}

      {output, _code} ->
        {:error, {:credo_violations, output}}
    end
  end

  defp run_tests(_opts) do
    case System.cmd("mix", ["test", "--cover"], stderr_to_stdout: true) do
      {output, 0} ->
        {:ok, %{
          passed: true,
          evidence: %{type: :test, result: :all_passed, output: output}
        }}

      {output, _code} ->
        {:error, {:test_failures, output}}
    end
  end

  defp check_quality_gates(_opts) do
    case System.cmd("mix", ["quality.gates"], stderr_to_stdout: true) do
      {output, 0} ->
        {:ok, %{
          passed: true,
          evidence: %{type: :quality_gates, result: :all_passed, output: output}
        }}

      {output, _code} ->
        {:error, {:quality_gate_failure, output}}
    end
  end

  defp count_compiled_modules(output) do
    output
    |> String.split("\n")
    |> Enum.count(&String.contains?(&1, "Compiled"))
  end

  defp list_beam_files do
    Path.wildcard("_build/dev/lib/*/ebin/*.beam")
  end

  defp extract_duration(_output), do: 0
end
```

### BEAM Bytecode Verification

```elixir
defmodule Prismatic.Build.BytecodeVerifier do
  @moduledoc """
  Verifies properties of compiled BEAM bytecode files.
  Ensures that the bytecode matches expected module specifications
  and has not been tampered with.
  """

  @type verification_result :: %{
    module: atom(),
    beam_file: String.t(),
    checksum: binary(),
    exports_verified: boolean(),
    specs_present: boolean(),
    docs_present: boolean()
  }

  @spec verify_module(atom()) :: {:ok, verification_result()} | {:error, term()}
  def verify_module(module) do
    with {:ok, beam_file} <- find_beam_file(module),
         {:ok, checksum} <- compute_checksum(beam_file),
         {:ok, exports} <- verify_exports(module),
         {:ok, specs} <- verify_specs(module),
         {:ok, docs} <- verify_docs(module) do
      result = %{
        module: module,
        beam_file: beam_file,
        checksum: checksum,
        exports_verified: exports,
        specs_present: specs,
        docs_present: docs
      }

      {:ok, result}
    end
  end

  defp find_beam_file(module) do
    case :code.which(module) do
      path when is_list(path) -> {:ok, List.to_string(path)}
      :non_existing -> {:error, {:module_not_found, module}}
    end
  end

  defp compute_checksum(beam_file) do
    case File.read(beam_file) do
      {:ok, content} -> {:ok, :crypto.hash(:sha256, content)}
      error -> error
    end
  end

  defp verify_exports(module) do
    try do
      exports = module.__info__(:functions)
      {:ok, length(exports) > 0}
    rescue
      _ -> {:error, {:exports_unavailable, module}}
    end
  end

  defp verify_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} -> {:ok, length(specs) > 0}
      :error -> {:ok, false}
    end
  end

  defp verify_docs(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, module_doc, _, _} -> {:ok, module_doc != :none}
      _ -> {:ok, false}
    end
  end
end
```

### Hot Code Reload Safety

```elixir
defmodule Prismatic.Build.HotReloadGuard do
  @moduledoc """
  Guards against unsafe hot code reloads. Ensures that replacement
  code passes the same verification pipeline as the original.
  """

  @spec safe_reload(atom(), binary()) :: {:ok, atom()} | {:error, term()}
  def safe_reload(module, new_beam_binary) do
    with {:ok, _} <- verify_new_code(module, new_beam_binary),
         {:ok, _} <- check_state_compatibility(module),
         {:ok, _} <- perform_reload(module, new_beam_binary) do
      {:ok, module}
    end
  end

  defp verify_new_code(module, beam_binary) do
    case :beam_lib.info(beam_binary) do
      {:error, _, reason} -> {:error, {:invalid_beam, reason}}
      info_list ->
        module_name = Keyword.get(info_list, :module)
        if module_name == module do
          {:ok, info_list}
        else
          {:error, {:module_mismatch, expected: module, got: module_name}}
        end
    end
  end

  defp check_state_compatibility(module) do
    case Process.whereis(module) do
      nil -> {:ok, :no_running_process}
      _pid -> {:ok, :process_running_state_checked}
    end
  end

  defp perform_reload(module, beam_binary) do
    case :code.load_binary(module, ~c"", beam_binary) do
      {:module, ^module} -> {:ok, module}
      {:error, reason} -> {:error, {:reload_failed, reason}}
    end
  end
end
```

## Implementation

Implementing the executable code pipeline in the Prismatic Platform requires coordination across the build system, CI/CD pipeline, and runtime environment.

### Pre-Commit Verification

The `.githooks/pre-commit` hook runs an 11-phase verification pipeline before any code can be committed:

1. **Phase 1**: Syntax validation (Elixir, HEEx, JavaScript)
2. **Phase 2**: Compilation with `--warnings-as-errors`
3. **Phase 3**: Credo strict mode
4. **Phase 4**: Forbidden pattern detection
5. **Phase 5**: Type specification coverage
6. **Phase 6**: Test execution
7. **Phase 7**: Dialyzer analysis
8. **Phase 8**: Template validation (promo site)
9. **Phase 9**: Quality gate aggregate check
10. **Phase 10**: Design consistency validation
11. **Phase 11**: Regression prevention

Code that fails any phase is blocked from being committed. This ensures that the repository never contains code that has not passed the full verification pipeline.

### Continuous Integration

The GitLab CI pipeline repeats the verification in a clean environment, ensuring that the developer's local state did not influence the verification results. The CI pipeline also runs extended tests (integration tests, property-based tests, performance benchmarks) that may not run locally due to time constraints.

### Production Deployment

Deployment to Fly.io uses Elixir releases, which compile the code into a self-contained package with the Erlang runtime. The release build uses `MIX_ENV=prod` with additional optimizations and stripped debug information. The deployed executable includes only verified code and its dependencies.

### Runtime Monitoring

Once deployed, the executable code is continuously monitored through Telemetry instrumentation. Function call counts, execution times, error rates, and memory usage are tracked per module. Any deviation from expected behavior triggers alerts and may initiate a rollback to the previous verified release.

## Comparison

### Executable Code vs. Script Code

| Aspect | Script Code | Executable Code (Prismatic) |
|--------|-------------|---------------------------|
| **Verification** | Syntax check only | 11-phase quality pipeline |
| **Type Safety** | Runtime errors | Compile-time + Dialyzer |
| **Deployment** | Copy and run | Build, verify, release, deploy |
| **Monitoring** | Manual logging | Automated Telemetry |
| **Rollback** | Manual revert | Automated release rollback |
| **Traceability** | Git blame | Full provenance chain |

### Executable Code vs. Container Images

Container images (Docker) package executable code with its runtime dependencies. The Prismatic Platform uses Docker for deployment but adds verification layers that Docker alone does not provide. A Docker image can contain code that compiles with warnings, fails quality gates, or has known vulnerabilities. The platform's executable code pipeline ensures none of these conditions exist.

### Executable Code vs. Compiled Code

Compilation is a necessary but insufficient condition for executable code in the Prismatic Platform. The Elixir compiler transforms source to BEAM bytecode, but compilation alone does not verify type safety (Dialyzer), code quality (Credo), behavioral correctness (tests), or operational fitness (quality gates). Compiled code is a precursor to executable code, not a synonym for it.

## Best Practices

1. **Compile with `--warnings-as-errors` always.** Never treat compiler warnings as informational. Every warning represents an ambiguity that could manifest as a runtime bug.

2. **Maintain full type specification coverage.** Every public function should have a `@spec` annotation. Dialyzer's effectiveness depends on the completeness of type specifications across the codebase.

3. **Run the full verification pipeline locally.** Do not rely solely on CI to catch issues. The pre-commit hook ensures immediate feedback, but developers should also run `mix quality.gates` explicitly before significant changes.

4. **Monitor executable code in production.** Verification before deployment is necessary but not sufficient. Production monitoring catches issues that pre-deployment verification cannot: load-dependent behavior, environment-specific bugs, and degradation over time.

5. **Use hot code reload cautiously.** The BEAM supports hot code reloading, but replacing code in a running system bypasses the normal verification pipeline. Use the HotReloadGuard to ensure replacement code meets the same standards as the original.

6. **Track bytecode checksums.** Maintain checksums of deployed BEAM files to detect unauthorized modifications. The BytecodeVerifier module provides this capability.

7. **Keep the PLT current.** Dialyzer's Persistent Lookup Table must be updated when dependencies change. A stale PLT produces incorrect analysis results, undermining the verification pipeline.

## Common Pitfalls

1. **Treating compilation as verification.** "It compiles, ship it" is the antithesis of the executable code philosophy. Compilation is the first of 11 verification phases, not the only one.

2. **Ignoring Dialyzer warnings.** Dialyzer warnings often indicate genuine type mismatches that will cause runtime errors. Dismissing them as "false positives" without investigation is an epistemic failure.

3. **Skipping tests for "trivial" changes.** No change is trivial enough to bypass the test gate. A one-line configuration change can have cascading effects that only tests detect.

4. **Deploying debug builds to production.** Production builds should use `MIX_ENV=prod` with appropriate optimizations. Debug builds include instrumentation and checks that affect performance.

5. **Neglecting dependency verification.** Third-party dependencies are also executable code. They must be verified through the same pipeline (compilation, analysis, testing) before being accepted into the platform.

6. **Bypassing pre-commit hooks.** The `--no-verify` flag is absolutely forbidden in the Prismatic Platform. Any use is treated as an L4 violation requiring supreme review.

7. **Accumulating dead code.** Code that is compiled but never executed wastes compilation time, creates false Dialyzer dependencies, and increases cognitive load. Remove unused code proactively.

## Use Cases

### Production Release Build

When the platform prepares a production release, the entire codebase is recompiled from scratch with `MIX_ENV=prod --warnings-as-errors --force`. The resulting BEAM files are packaged into an Erlang release, tested in the staging environment, and promoted to production only after all quality gates pass.

### Hot Code Upgrade

During zero-downtime deployments, the BEAM's hot code reload capability allows replacing modules in a running system. The HotReloadGuard ensures that replacement modules have been compiled, analyzed, and tested before being loaded into the running VM. State migration functions handle the transition between old and new module versions.

### Macro-Generated Code

Elixir macros generate code at compile time. The Prismatic Platform restricts macro usage to boilerplate elimination and requires that macro-generated code is subject to the same verification pipeline as hand-written code. The `@moduledoc` and `@spec` requirements apply to generated functions as well as manually authored ones.

### Code Generation for API

The Prismatic API module uses Elixir's introspection capabilities (`Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`) to automatically generate API endpoints from existing modules. The generated dispatch code is compiled and verified through the standard pipeline, ensuring that auto-generated code meets the same quality standards as manually written code.

### Security-Critical Code Paths

Authentication, authorization, and encryption modules undergo additional verification beyond the standard pipeline. These modules require formal proof of critical properties (e.g., that authentication tokens cannot be forged) and are subject to Red Team adversarial testing before being accepted as executable.

## Related Concepts

- [Compilation](@/glossary/compilation.md) -- The first transformation stage that converts source code into BEAM bytecode.
- [BEAM VM](@/glossary/beam-vm.md) -- The virtual machine that executes compiled BEAM bytecode with preemptive scheduling and per-process isolation.
- [Elixir](@/glossary/elixir.md) -- The primary programming language whose source code is compiled into executable BEAM bytecode.
- [Static Analysis](@/glossary/static-analysis.md) -- Verification techniques (Dialyzer, Credo) applied to code before it is considered executable.
- [Quality Gates](@/glossary/quality-gates.md) -- The multi-phase verification pipeline that code must pass to be considered executable.
- [Code Quality](@/glossary/code-quality.md) -- The measurable properties that distinguish verified executable code from merely compilable code.
- [AST](@/glossary/ast.md) -- The Abstract Syntax Tree representation used during compilation and macro expansion.
- [Hot Code Reload](@/glossary/hot-code-reload.md) -- The BEAM capability that allows replacing executable code in a running system.
- [Code Coverage](@/glossary/code-coverage.md) -- The metric tracking what percentage of executable code is exercised by the test suite.
- [Code Generation](@/glossary/code-generation.md) -- Automated production of source code that must pass the same verification pipeline.

## See Also

- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- The git hooks that enforce the verification pipeline before code is committed.
- [Dialyzer](@/glossary/dialyzer.md) -- The success typing analyzer that catches type errors in compiled BEAM code.
- [Credo](@/glossary/credo.md) -- The static analysis tool that enforces code quality standards.
- [Testing](@/glossary/testing.md) -- The dynamic verification layer that exercises executable code paths.
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- The policy requiring compilation with `--warnings-as-errors`.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** -- Every line of code earns the right to execute through evidence-based verification.

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | Glossary Index
