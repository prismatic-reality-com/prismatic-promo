+++
title = "Credo"
weight = 54
[extra]
category = "quality"
description = "Elixir static code analysis tool enforced in strict mode across all umbrella applications for consistency, readability, and anti-pattern detection"
related_terms = ["quality-gates", "dialyzer", "zero-warning-policy", "clean-run", "typespec", "pre-commit-hooks", "elixir", "ast", "static-analysis", "credo-check"]
tags = ["glossary", "quality", "elixir", "static-analysis", "credo", "linting", "code-quality", "ast", "pre-commit"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 97
technical_level = "intermediate-to-advanced"
domain_category = "quality-assurance"
implementation_status = "production"
authority_level = "L3-strategic"
code_examples = true
version_introduced = "gen-1"
stability_level = "stable"
keywords = ["credo", "elixir static analysis", "code linting", "AST analysis", "strict mode", "quality enforcement", "naming conventions", "cyclomatic complexity"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
platforms = ["Prismatic Platform", "BEAM/OTP"]
prerequisites = ["elixir-basics", "mix-tooling", "compilation"]
learning_outcomes = ["Understand Credo's AST-based analysis model", "Configure Credo for strict mode enforcement", "Write custom Credo checks for project-specific conventions", "Integrate Credo into pre-commit hooks and CI pipelines"]
word_count = 1822
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Credo - Prismatic Platform"
+++

## Definition and Overview

Credo is a static code analysis tool for the Elixir programming language that inspects source code for consistency, readability, and common anti-patterns without executing it. Unlike runtime testing, which validates behavior, Credo operates on the Abstract Syntax Tree (AST) of Elixir source files, examining structural patterns, naming conventions, code complexity, documentation completeness, and stylistic consistency. When run in strict mode (`mix credo --strict`), it enforces all check categories with elevated priority thresholds, treating even low-priority suggestions as issues that must be addressed.

Credo fills a critical gap in the [Elixir](/glossary/elixir/) quality ecosystem. While the compiler catches syntax errors and undefined functions, and [Dialyzer](/glossary/dialyzer/) catches type-level discrepancies through success typing, neither tool addresses code style, design patterns, or cognitive complexity. Credo completes the static analysis triad by examining the aspects of code quality that affect human readability and long-term maintainability. Together, these three tools -- compiler, Dialyzer, and Credo -- form a comprehensive static analysis defense that catches errors at multiple levels of abstraction.

The tool was created by Rene Foehring and has become the standard linting tool in the Elixir ecosystem, with over 4,800 stars on GitHub and inclusion in most Elixir project templates. Its check system is extensible, allowing organizations to define custom checks that enforce project-specific conventions. Credo's output format includes priority levels (A through F), file locations with line numbers, and actionable explanations that guide developers toward fixes.

## Historical Context and Motivation

Before Credo, the Elixir ecosystem lacked a standardized code analysis tool. Developers relied on manual code review and ad-hoc linting scripts. This gap was particularly problematic in larger codebases where maintaining consistent style across multiple contributors became increasingly difficult. The Ruby ecosystem had RuboCop, JavaScript had ESLint, and Python had Pylint -- but Elixir needed its own tool that understood the language's unique constructs: pipe operators, pattern matching, macros, behaviours, and the actor model.

Credo was designed from the ground up to understand Elixir's AST rather than relying on regular expressions or text-based pattern matching. This architectural decision enables checks that are impossible with simpler approaches: detecting unused pipe chains, identifying when pattern matching is used inconsistently, or finding cases where module aliases are imported but not used. The AST-based approach also means Credo can distinguish between syntactically similar but semantically different constructs, reducing false positives.

The Prismatic Platform adopted Credo in strict mode from its earliest generation, establishing a zero-violation baseline that has been maintained through all 19 generations of evolution. This early adoption avoided the painful "Credo retrofit" that many projects face when they attempt to enable strict mode on a codebase with thousands of existing violations.

## Technical Deep Dive

### Check Categories

Credo organizes its checks into five categories, each targeting a distinct aspect of code quality:

| Category | Purpose | Example Checks | Strict Impact |
|----------|---------|----------------|---------------|
| **Consistency** | Uniform code style across the codebase | Parentheses usage, alias ordering, pipe consistency | All checks enforced |
| **Readability** | Human comprehension of code | Naming conventions, module documentation, function length | Priority threshold lowered |
| **Refactoring** | Code structure improvement opportunities | Cyclomatic complexity, nesting depth, code duplication | All opportunities flagged |
| **Warning** | Potential bugs and dangerous patterns | Unused variables, unreachable code, missing pattern clauses | Zero tolerance |
| **Design** | Architectural and design principles | Module coupling, function arity, alias organization | All violations reported |

### Severity and Priority System

Each Credo check produces findings with a priority level:

```
Priority A (highest): Definite issues - must fix immediately
Priority B (high):    Likely issues - should fix before merge
Priority C (medium):  Suggestions - improve when convenient
Priority D (low):     Minor style - nice to have
Priority F (lowest):  Informational - awareness only
```

In normal mode, Credo reports only priority A and B issues. In strict mode (`--strict`), the threshold drops to include C, D, and F priorities, making every check actionable. The Prismatic Platform mandates strict mode, meaning even the lowest-priority suggestions must be addressed before code passes the [quality gate](/glossary/quality-gates/).

### AST-Based Analysis

Credo operates on Elixir's AST representation, which the compiler exposes through `Code.string_to_quoted/1`. This approach enables structural analysis impossible with regex-based linters:

```elixir
# Credo can detect this anti-pattern in the AST:
# Nested conditionals that should be flattened
if condition_a do
  if condition_b do
    if condition_c do
      do_something()
    end
  end
end

# And suggest this refactored version:
if condition_a and condition_b and condition_c do
  do_something()
end
```

The AST-based approach also enables scope-aware analysis. Credo correctly distinguishes between a variable named `_unused` (intentionally ignored) and a variable `result` that was assigned but never read (potentially a bug). Regex-based tools cannot make this distinction because they lack syntactic context.

### Configuration System

Credo is configured through `.credo.exs`, a file that returns an Elixir map defining which checks to enable, their parameters, and project-specific overrides:

```elixir
# .credo.exs
%{
  configs: [
    %{
      name: "default",
      strict: true,
      files: %{
        included: ["lib/", "src/", "web/", "apps/"],
        excluded: [~r"/_build/", ~r"/deps/", ~r"/node_modules/"]
      },
      checks: %{
        enabled: [
          # Consistency
          {Credo.Check.Consistency.ExceptionNames, []},
          {Credo.Check.Consistency.LineEndings, []},
          {Credo.Check.Consistency.ParameterPatternMatching, []},
          {Credo.Check.Consistency.SpaceAroundOperators, []},
          {Credo.Check.Consistency.SpaceInParentheses, []},
          {Credo.Check.Consistency.TabsOrSpaces, []},

          # Readability
          {Credo.Check.Readability.AliasOrder, []},
          {Credo.Check.Readability.FunctionNames, []},
          {Credo.Check.Readability.LargeNumbers, []},
          {Credo.Check.Readability.MaxLineLength, [max_length: 120]},
          {Credo.Check.Readability.ModuleDoc, []},
          {Credo.Check.Readability.ModuleNames, []},
          {Credo.Check.Readability.PredicateFunctionNames, []},
          {Credo.Check.Readability.SinglePipe, []},

          # Refactoring
          {Credo.Check.Refactor.CyclomaticComplexity, [max_complexity: 10]},
          {Credo.Check.Refactor.Nesting, [max_nesting: 3]},
          {Credo.Check.Refactor.PipeChainStart, []},

          # Warning
          {Credo.Check.Warning.ApplicationConfigInModuleAttribute, []},
          {Credo.Check.Warning.BoolOperationOnSameValues, []},
          {Credo.Check.Warning.ExpensiveEmptyEnumCheck, []},
          {Credo.Check.Warning.IExPry, []},
          {Credo.Check.Warning.MapGetUnsafePass, []},
          {Credo.Check.Warning.OperationOnSameValues, []},
          {Credo.Check.Warning.UnusedEnumOperation, []},
          {Credo.Check.Warning.UnusedKeywordOperation, []},
          {Credo.Check.Warning.UnusedListOperation, []},
          {Credo.Check.Warning.UnusedStringOperation, []},
          {Credo.Check.Warning.UnusedTupleOperation, []},

          # Design
          {Credo.Check.Design.AliasUsage, [if_nested_deeper_than: 2]},
          {Credo.Check.Design.DuplicatedCode, []}
        ],
        disabled: []
      }
    }
  ]
}
```

### Credo's Internal Execution Pipeline

Understanding Credo's internal architecture helps when developing custom checks or diagnosing performance bottlenecks. The execution pipeline proceeds through four distinct phases:

1. **Configuration Loading**: Reads `.credo.exs`, merges with defaults, resolves file inclusion/exclusion patterns
2. **File Collection and Parsing**: Walks the directory tree, filters files, parses each into a `%SourceFile{}` struct containing the AST, raw source, and metadata
3. **Check Execution**: Runs each enabled check against each parsed source file, collecting issues with priorities and locations
4. **Result Formatting**: Aggregates issues, sorts by priority and location, formats output according to the requested format (text, JSON, SARIF)

```elixir
defmodule PrismaticCredo.PipelineInspector do
  @moduledoc """
  Inspects and reports on Credo's internal pipeline stages
  for performance monitoring and debugging purposes.
  """

  @spec measure_pipeline_stages(keyword()) :: %{
    config_time_ms: non_neg_integer(),
    parse_time_ms: non_neg_integer(),
    check_time_ms: non_neg_integer(),
    format_time_ms: non_neg_integer(),
    total_time_ms: non_neg_integer(),
    files_parsed: non_neg_integer(),
    checks_executed: non_neg_integer(),
    issues_found: non_neg_integer()
  }
  def measure_pipeline_stages(opts \\ []) do
    {config_time, config} = :timer.tc(fn -> load_config(opts) end)
    {parse_time, source_files} = :timer.tc(fn -> parse_files(config) end)
    {check_time, issues} = :timer.tc(fn -> run_checks(config, source_files) end)
    {format_time, _output} = :timer.tc(fn -> format_results(issues, config) end)

    %{
      config_time_ms: div(config_time, 1_000),
      parse_time_ms: div(parse_time, 1_000),
      check_time_ms: div(check_time, 1_000),
      format_time_ms: div(format_time, 1_000),
      total_time_ms: div(config_time + parse_time + check_time + format_time, 1_000),
      files_parsed: length(source_files),
      checks_executed: length(config.checks.enabled),
      issues_found: length(issues)
    }
  end

  defp load_config(opts), do: Credo.ConfigBuilder.parse(opts)
  defp parse_files(config), do: Credo.Sources.find(config)
  defp run_checks(config, files), do: Credo.Check.Runner.run(files, config)
  defp format_results(issues, config), do: Credo.CLI.Output.format(issues, config)
end
```

## Architecture and Implementation

### Integration in the Quality Pipeline

Credo occupies a specific position in the Prismatic Platform's multi-layer quality enforcement architecture:

```
Source Code
    |
    v
Layer 1: Compiler (syntax, undefined functions, unused variables)
    |
    v
Layer 2: Credo (style, patterns, complexity, naming, documentation)
    |
    v
Layer 3: Dialyzer (types, contracts, unreachable code via success typing)
    |
    v
Layer 4: Custom Quality Gates (13 domain-specific checks)
    |
    v
Quality-Verified Code
```

Each layer catches different classes of defects. The compiler catches syntactic issues (milliseconds). Credo catches structural and stylistic issues (seconds). Dialyzer catches type-level issues (minutes due to PLT construction). The custom quality gates catch domain-specific violations. This layered approach ensures that each tool operates on code that has already passed the preceding layer's checks, reducing noise and false positives.

### Execution Model

Credo's execution follows a three-phase model:

1. **File Collection**: Scans the project directory tree, applying inclusion/exclusion patterns from configuration
2. **AST Parsing**: Parses each collected file into its AST representation using Elixir's compiler
3. **Check Execution**: Runs each enabled check against each parsed AST, collecting findings with locations and priorities

For large codebases, Credo supports parallel execution across files using multiple BEAM schedulers. The Prismatic Platform's 6,652 Elixir source files complete Credo analysis in approximately 15-30 seconds, fast enough for [pre-commit hook](/glossary/pre-commit-hooks/) integration.

### Custom Check Development

Organizations can define custom Credo checks to enforce project-specific conventions:

```elixir
defmodule PrismaticCredo.Check.Warning.ForbiddenNaming do
  @moduledoc """
  Ensures no modules use forbidden naming patterns (Manager, Handler, Utils, Helper).

  Per the Elixir Best Practices Policy, these suffixes indicate
  unclear responsibilities and should be replaced with more
  descriptive names.
  """
  use Credo.Check,
    base_priority: :high,
    category: :warning

  @forbidden_suffixes ~w(Manager Handler Utils Helper Util)

  @impl Credo.Check
  def run(%SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    Credo.Code.prewalk(source_file, &traverse(&1, &2, issue_meta))
  end

  defp traverse({:defmodule, meta, [{:__aliases__, _, parts} | _]} = ast, issues, issue_meta) do
    module_name = parts |> Enum.map(&to_string/1) |> Enum.join(".")
    last_part = parts |> List.last() |> to_string()

    if Enum.any?(@forbidden_suffixes, &String.ends_with?(last_part, &1)) do
      new_issue = issue_for(issue_meta, meta[:line], module_name, last_part)
      {ast, [new_issue | issues]}
    else
      {ast, issues}
    end
  end

  defp traverse(ast, issues, _issue_meta), do: {ast, issues}

  defp issue_for(issue_meta, line_no, module_name, suffix) do
    format_issue(
      issue_meta,
      message: "Module `#{module_name}` uses forbidden suffix '#{suffix}'",
      trigger: module_name,
      line_no: line_no
    )
  end
end
```

### Platform-Specific Custom Checks

The Prismatic Platform maintains a dedicated `prismatic_credo` application that houses all custom checks. These checks enforce platform-specific conventions that go beyond Credo's defaults:

```elixir
defmodule PrismaticCredo.Check.Regression.HardcodedCIValues do
  @moduledoc """
  Detects hardcoded CI-specific values in application code that
  should be read from configuration or environment variables.

  This check prevents brittle code that breaks across environments.
  """
  use Credo.Check,
    base_priority: :high,
    category: :warning

  @hardcoded_patterns [
    ~r/localhost:\d{4}/,
    ~r/127\.0\.0\.1:\d+/,
    ~r/CI=true/,
    ~r/MIX_ENV=test/
  ]

  @impl Credo.Check
  def run(%SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    source_file
    |> Credo.Code.to_tokens()
    |> Enum.reduce([], fn
      {:bin_string, {line, _col, _}, value}, issues when is_binary(value) ->
        if hardcoded_ci_value?(value) do
          [format_issue(issue_meta,
            message: "Hardcoded CI/environment value detected: #{inspect(value)}",
            line_no: line
          ) | issues]
        else
          issues
        end

      _, issues ->
        issues
    end)
  end

  defp hardcoded_ci_value?(value) do
    Enum.any?(@hardcoded_patterns, &Regex.match?(&1, value))
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform enforces Credo in strict mode as a mandatory, non-bypassable quality gate across all 115 umbrella applications and 6,652 Elixir source files.

### Enforcement Points

Credo runs at three enforcement points in the development workflow:

| Enforcement Point | Command | Scope | Failure Impact |
|-------------------|---------|-------|----------------|
| **Pre-commit hook** | `mix credo --strict` | Changed files | Commit blocked |
| **CI pipeline** | `mix credo --strict` | All files | Merge request blocked |
| **Quality gates** | `mix quality.gates` | All files (includes Credo) | Deployment blocked |

### Current Status

The platform maintains zero Credo violations across all source files:

```elixir
# Running Credo analysis
$ mix credo --strict

# Result: 0 issues found across 6,652 files
# Checking 6,652 source files...
#
# Analysis took 28.3 seconds (24.1s for parsing, 4.2s for analysis)
#
# 0 issues found.
```

### Integration with Quality DNA

Credo results are persisted in the [Quality DNA](/glossary/quality-dna/) system, providing cross-session tracking of Credo compliance:

```elixir
defmodule PrismaticQuality.CredoTracker do
  @moduledoc """
  Tracks Credo compliance across sessions in Quality DNA.
  """

  @spec record_credo_result(map()) :: :ok
  def record_credo_result(result) do
    PrismaticQuality.DNA.update(%{
      domain: :credo,
      violations: result.issue_count,
      files_checked: result.file_count,
      categories: %{
        consistency: result.consistency_count,
        readability: result.readability_count,
        refactoring: result.refactoring_count,
        warning: result.warning_count,
        design: result.design_count
      },
      timestamp: DateTime.utc_now()
    })
  end
end
```

### Enforced Naming Conventions

The platform's Credo configuration enforces specific naming rules aligned with the Elixir Best Practices Policy:

| Pattern | Status | Rationale |
|---------|--------|-----------|
| `*Manager` suffix | Forbidden | Indicates unclear responsibilities |
| `*Handler` suffix | Forbidden | Too generic, hides actual behavior |
| `*Utils` suffix | Forbidden | Dumping ground for unrelated functions |
| `*Helper` suffix | Forbidden | Signals missing abstraction |
| `snake_case` functions | Required | Elixir convention |
| `PascalCase` modules | Required | Elixir convention |
| `@moduledoc` present | Required | Every module must be documented |

## Code Examples

### Running Credo with Detailed Output

```elixir
defmodule Mix.Tasks.Quality.Credo do
  @moduledoc """
  Runs Credo with detailed reporting and Quality DNA integration.
  """
  use Mix.Task

  @shortdoc "Run Credo strict with reporting"

  @impl Mix.Task
  def run(_args) do
    {output, exit_code} = System.cmd("mix", ["credo", "--strict", "--format", "json"],
      stderr_to_stdout: true
    )

    case exit_code do
      0 ->
        result = Jason.decode!(output)
        report_success(result)

      code ->
        result = Jason.decode!(output)
        report_failure(result, code)
        Mix.raise("Credo strict check failed with #{length(result["issues"])} issues")
    end
  end

  defp report_success(result) do
    Mix.shell().info("Credo: 0 issues across #{result["file_count"]} files")
    PrismaticQuality.CredoTracker.record_credo_result(%{
      issue_count: 0,
      file_count: result["file_count"]
    })
  end

  defp report_failure(result, _code) do
    issues = result["issues"]

    Enum.each(issues, fn issue ->
      Mix.shell().error(
        "  #{issue["filename"]}:#{issue["line_no"]} - #{issue["message"]} [#{issue["category"]}]"
      )
    end)
  end
end
```

### Integrating Credo into a GenServer Quality Monitor

```elixir
defmodule PrismaticSafety.CredoMonitor do
  @moduledoc """
  Monitors Credo compliance as part of the Quality Floor Guardian system.
  Emits telemetry events for dashboarding and alerting.
  """
  use GenServer

  @check_interval :timer.minutes(30)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()
    {:ok, %{last_check: nil, violations: 0, status: :unknown}}
  end

  @impl GenServer
  def handle_info(:check_credo, state) do
    new_state = run_credo_check(state)
    schedule_check()
    {:noreply, new_state}
  end

  defp run_credo_check(state) do
    case System.cmd("mix", ["credo", "--strict", "--format", "json"]) do
      {_output, 0} ->
        %{state | last_check: DateTime.utc_now(), violations: 0, status: :clean}

      {output, _code} ->
        result = Jason.decode!(output)
        count = length(result["issues"])
        :telemetry.execute([:prismatic, :quality, :credo], %{violations: count}, %{})
        %{state | last_check: DateTime.utc_now(), violations: count, status: :violations_found}
    end
  end

  defp schedule_check do
    Process.send_after(self(), :check_credo, @check_interval)
  end
end
```

### Credo Check for Unsafe Map Access Detection

```elixir
defmodule PrismaticCredo.Check.Warning.UnsafeMapAccess do
  @moduledoc """
  Detects unsafe map access patterns that may raise KeyError at runtime.
  Recommends Map.get/3 or pattern matching instead of map[key] or map.key
  for maps that may not contain the expected key.
  """
  use Credo.Check,
    base_priority: :high,
    category: :warning

  @impl Credo.Check
  def run(%SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    Credo.Code.prewalk(source_file, &traverse(&1, &2, issue_meta))
  end

  defp traverse({{:., meta, [Access, :get]}, _, [map_ast, _key]} = ast, issues, issue_meta)
       when not is_nil(meta[:line]) do
    {ast, maybe_add_issue(issues, issue_meta, meta[:line], map_ast)}
  end

  defp traverse(ast, issues, _issue_meta), do: {ast, issues}

  defp maybe_add_issue(issues, issue_meta, line_no, _map_ast) do
    [format_issue(issue_meta,
      message: "Consider using Map.get/3 with a default value for safer access",
      line_no: line_no
    ) | issues]
  end
end
```

## Comparison with Other Static Analysis Tools

| Tool | Language | Analysis Type | Severity System | Custom Checks | CI Integration |
|------|----------|---------------|-----------------|---------------|----------------|
| **Credo** | Elixir | AST-based | A-F priorities | Yes (behaviours) | Excellent |
| **ESLint** | JavaScript | AST-based | error/warn/off | Yes (plugins) | Excellent |
| **RuboCop** | Ruby | AST-based | Offense severity | Yes (cops) | Good |
| **Pylint** | Python | AST-based | Convention/Refactor/Warning/Error | Yes (checkers) | Good |
| **Clippy** | Rust | Compiler plugin | Allow/Warn/Deny/Forbid | Limited | Native |
| **SonarQube** | Multi-language | Multi-strategy | Blocker/Critical/Major/Minor | Yes (rules) | Enterprise |

Credo's advantage in the Elixir ecosystem is its native understanding of Elixir idioms. ESLint does not understand pipe operators; RuboCop does not understand pattern matching; Pylint does not understand behaviours. Credo was built for Elixir and checks Elixir-specific patterns that generic tools would miss.

## Best Practices

**Run Credo in strict mode from day one.** Retrofitting strict mode onto an existing codebase with thousands of violations is painful. Starting with strict mode from the first commit establishes the standard before [technical debt](/glossary/technical-debt/) can accumulate. The Prismatic Platform's zero-violation state was achieved through consistent enforcement since early generations.

**Integrate Credo into pre-commit hooks.** Running Credo before commits provides immediate feedback, preventing violations from entering the repository. The cost of a 15-30 second pre-commit check is negligible compared to the cost of discovering violations in CI minutes later.

**Customize checks for your project.** Credo's default configuration is a good starting point, but production projects benefit from custom checks that enforce project-specific conventions. The naming convention enforcement (no Manager/Handler/Utils/Helper) is an example of a project-specific check that Credo's extensibility enables.

**Use Credo alongside, not instead of, Dialyzer.** Credo and [Dialyzer](/glossary/dialyzer/) are complementary, not competing tools. Credo catches style and pattern issues; Dialyzer catches type errors. Running only one leaves an entire category of defects undetected. The triple-layer approach (compiler + Credo + Dialyzer) provides comprehensive coverage.

**Keep Credo updated.** New Credo versions introduce additional checks that catch previously undetectable patterns. Regular updates expand the safety net without requiring manual check development.

**Use JSON output for CI integration.** The `--format json` flag produces machine-readable output that CI systems can parse, annotate pull requests, and track trends over time. The platform uses JSON output to feed Credo results into the Quality DNA system.

## Common Pitfalls

**Disabling checks instead of fixing code.** When Credo reports an issue, the temptation is to disable the check rather than address the underlying code problem. This creates a progressively weakened configuration that eventually provides no value. The Prismatic Platform forbids check disabling without documented justification.

**Ignoring complexity warnings.** Cyclomatic complexity and nesting depth warnings indicate functions that are difficult to understand and maintain. These warnings predict future bugs more reliably than most other checks. Refactor immediately rather than increasing the complexity threshold.

**Treating Credo as a formatter.** Credo is not a code formatter -- it reports issues but does not automatically fix them. Use `mix format` for formatting and Credo for higher-level analysis. The two tools serve different purposes and should both be present in the quality pipeline.

**Over-relying on inline suppression.** Credo supports inline comment suppression (`# credo:disable-for-this-file`), but excessive use defeats the purpose of the tool. Limit suppression to genuine false positives and document the reason for each suppression.

**Neglecting the design category.** Many teams focus on warning and readability checks while ignoring the design category. Design checks catch architectural issues (coupling, arity explosion, alias misuse) that are more expensive to fix later. Address design issues early.

## Related Concepts

- [Quality Gates](/glossary/quality-gates/) -- Enforcement pipeline including Credo as a mandatory check
- [Dialyzer](/glossary/dialyzer/) -- Complementary type analysis tool forming the second static analysis layer
- [Zero Warning Policy](/glossary/zero-warning-policy/) -- Related compilation standard ensuring zero warnings
- [Clean Run](/glossary/clean-run/) -- Overall quality runtime standard that Credo contributes to
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- Local enforcement running Credo before commits
- [Typespec](/glossary/typespec/) -- Type annotations that Credo checks for documentation completeness
- [Continuous Integration](/glossary/continuous-integration/) -- CI pipeline where Credo runs as a mandatory stage
- [Elixir](/glossary/elixir/) -- The programming language Credo analyzes
- [Quality DNA](/glossary/quality-dna/) -- Cross-session quality tracking system that persists Credo results
- [Technical Debt](/glossary/technical-debt/) -- Accumulated quality shortcuts that strict Credo enforcement prevents

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Agents](/agents/) -- AIAD agents enforcing Credo compliance

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
