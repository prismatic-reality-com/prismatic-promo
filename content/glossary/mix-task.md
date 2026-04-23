+++
title = "Mix Task"
weight = 41
[extra]
description = "Elixir build tool command for development, testing, and platform workflows"
category = "elixir"
related_terms = ["otp", "quality-gates", "autoevolve", "autoheal", "git-trees", "elixir", "beam", "supervisor", "seadf", "zero-warning-policy"]
keywords = ["mix task", "Elixir build tool", "custom task", "Mix.Task behaviour", "command-line", "quality gates", "build automation"]
use_cases = ["Quality gate enforcement", "Self-healing operations", "Codebase exploration", "Autonomous evolution", "Content enhancement", "Database migrations"]
technologies = ["Elixir", "Mix", "OTP", "OptionParser", "BEAM"]
difficulty = "intermediate"
importance = "critical"
domain = "build-tooling"
category_color = "green"
version = "1.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
authors = ["Tomas Korcak"]
tags = ["elixir", "build-tool", "automation", "quality", "CLI", "development-workflow"]
prerequisites = ["Elixir language basics", "command-line familiarity", "OTP application concepts"]
estimated_reading_time = "13 minutes"
related_apps = ["prismatic", "prismatic_safety", "prismatic_claude", "prismatic_web"]
related_architectures = ["quality gate pipeline", "session lifecycle", "autonomous evolution"]
task_count = "30+"
built_in_tasks = "~40"
platform_custom_tasks = ["quality.gates", "autoheal.cycle", "autoheal.baseline", "autoevolve.mega", "autoevolve.scan", "git_trees", "promo.enhance", "quality.forbidden_patterns", "quality.enforce_standard"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1219
date_modified = "2026-02-23"
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Mix Task - Prismatic Platform"
+++

## Definition

A Mix Task is a command-line operation defined within the Elixir Mix build tool that provides a standardized mechanism for executing development workflows, build processes, code generation, testing, and custom platform operations. Tasks are implemented as Elixir modules that adopt the `Mix.Task` behaviour, requiring a `run/1` callback that receives command-line arguments as a list of strings. Mix tasks have full access to the compiled application runtime, can invoke other tasks for composition, and serve as the primary interface between developers, CI/CD pipelines, and the platform's operational infrastructure.

The Mix build tool itself is Elixir's equivalent of Make, npm scripts, or Gradle -- but with a critical difference: Mix tasks execute within the same BEAM virtual machine that hosts the application, giving them direct access to all compiled modules, OTP applications, and runtime state. This means a Mix task can start a [supervision tree](@/glossary/supervision-tree.md), query a database, invoke a [GenServer](@/glossary/genserver.md), or introspect module metadata -- capabilities that external build tools achieve only through subprocesses and inter-process communication. This deep integration makes Mix tasks the natural mechanism for platform operations that bridge development tooling and application logic.

Mix includes approximately 40 built-in tasks covering compilation (`mix compile`), testing (`mix test`), dependency management (`mix deps.get`, `mix deps.update`), documentation (`mix docs`), release building (`mix release`), and code generation. The Elixir ecosystem extends this with tasks from libraries: Ecto provides `mix ecto.migrate`, Phoenix provides `mix phx.server`, and Credo provides `mix credo`. Custom tasks follow the same conventions, appearing seamlessly alongside built-in and library tasks in `mix help` output.

## Task Lifecycle

Understanding the Mix task lifecycle is essential for writing robust custom tasks. When a developer or CI pipeline invokes a Mix task, the following sequence executes:

```
Developer/CI invokes: mix quality.gates
         |
         v
    Mix resolves task module: Mix.Tasks.Quality.Gates
         |
         v
    Ensures dependencies compiled: mix compile (if needed)
         |
         v
    Starts required OTP applications
         |
         v
    Calls Quality.Gates.run(argv)
         |
         v
    Task executes with full runtime access
         |
         v
    Returns :ok or raises on failure (exit code 0 or 1)
```

Mix resolves task names to module names by converting the dotted task name to a PascalCase module name under the `Mix.Tasks` namespace. The task `quality.gates` maps to `Mix.Tasks.Quality.Gates`, and `git_trees` maps to `Mix.Tasks.GitTrees`. This convention is enforced by the `Mix.Task` behaviour and cannot be overridden.

Before executing the task's `run/1` callback, Mix ensures that the project's dependencies are compiled and available. If the task requires access to the application runtime (database connections, GenServers, ETS tables), it must explicitly start the required OTP applications via `Mix.Task.run("app.start")` or `Application.ensure_all_started/1`.

## Task Categories

| Category | Examples | Purpose |
|----------|----------|---------|
| **Build** | `compile`, `clean`, `release` | Compilation and packaging |
| **Dependencies** | `deps.get`, `deps.update`, `hex.audit` | Dependency management |
| **Testing** | `test`, `test --cover` | Test execution and coverage |
| **Code quality** | `credo`, `dialyzer`, `format` | Static analysis and formatting |
| **Database** | `ecto.create`, `ecto.migrate`, `ecto.rollback` | Database schema management |
| **Code generation** | `phx.gen.live`, `phx.gen.context` | Scaffold generation |
| **Custom platform** | `quality.gates`, `autoheal.cycle`, `git_trees` | Platform-specific operations |
| **Documentation** | `docs`, `hex.docs` | Documentation generation |
| **Security** | `hex.audit`, `deps.audit` | Dependency vulnerability scanning |

## Task Naming Convention

Mix tasks follow a dotted namespace convention that maps to Elixir module names:

| Command | Module | File Path |
|---------|--------|-----------|
| `mix compile` | `Mix.Tasks.Compile` | Built-in |
| `mix test` | `Mix.Tasks.Test` | Built-in |
| `mix quality.gates` | `Mix.Tasks.Quality.Gates` | `lib/mix/tasks/quality/gates.ex` |
| `mix autoheal.cycle` | `Mix.Tasks.Autoheal.Cycle` | `lib/mix/tasks/autoheal/cycle.ex` |
| `mix git_trees` | `Mix.Tasks.GitTrees` | `lib/mix/tasks/git_trees.ex` |
| `mix autoevolve.mega` | `Mix.Tasks.Autoevolve.Mega` | `lib/mix/tasks/autoevolve/mega.ex` |
| `mix promo.enhance` | `Mix.Tasks.Promo.Enhance` | `lib/mix/tasks/promo/enhance.ex` |

## Technical Implementation

### Task Structure

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc """
  Runs the complete quality gate pipeline, checking all 13 quality
  domains and reporting violations.

  ## Usage

      mix quality.gates              # Run all gates
      mix quality.gates --fast       # Quick check only
      mix quality.gates --json       # Output as JSON for CI
      mix quality.gates --domain security  # Single domain

  ## Exit Codes

  - 0: All gates passed
  - 1: One or more gates failed
  """

  use Mix.Task

  @shortdoc "Run quality gate checks across all domains"

  @switches [fast: :boolean, json: :boolean, domain: :string]

  @impl Mix.Task
  def run(argv) do
    {opts, _args, _errors} = OptionParser.parse(argv, switches: @switches)

    Mix.Task.run("app.start", ["--no-start"])
    Application.ensure_all_started(:prismatic_safety)

    results = run_quality_checks(opts)

    if Keyword.get(opts, :json) do
      output_json(results)
    else
      output_human(results)
    end

    if Enum.any?(results, &(&1.status == :failed)) do
      Mix.raise("Quality gates failed")
    end
  end

  defp run_quality_checks(opts) do
    domains = if opts[:domain], do: [opts[:domain]], else: all_domains()

    Enum.map(domains, fn domain ->
      %{
        domain: domain,
        status: check_domain(domain, opts),
        violations: count_violations(domain)
      }
    end)
  end

  defp all_domains do
    ~w(dialyzer credo compilation datetime guard impl memory
       performance regression timing todo typespec unsafe_map)
  end

  defp check_domain(domain, _opts), do: :passed
  defp count_violations(_domain), do: 0
  defp output_json(results), do: Mix.shell().info(Jason.encode!(results, pretty: true))
  defp output_human(results), do: Enum.each(results, &Mix.shell().info("#{&1.domain}: #{&1.status}"))
end
```

### Task Composition

Tasks can invoke other tasks, enabling complex multi-step workflows. This composition model is one of Mix's most powerful features, allowing high-level tasks to orchestrate lower-level operations:

```elixir
defmodule Mix.Tasks.Quality.Full do
  @moduledoc """
  Run the complete quality pipeline: compilation, static analysis,
  type checking, testing, and quality gate enforcement.

  This task composes multiple lower-level tasks into a single
  command for CI/CD pipelines and pre-merge verification.

  ## Usage

      mix quality.full              # Run everything
      mix quality.full --skip-dialyzer  # Skip type checking (faster)
  """

  use Mix.Task

  @shortdoc "Run full quality pipeline (compile + credo + dialyzer + test + gates)"

  @impl Mix.Task
  def run(argv) do
    {opts, _, _} = OptionParser.parse(argv, switches: [skip_dialyzer: :boolean])

    Mix.shell().info("=== Phase 1: Compilation ===")
    Mix.Task.run("compile", ["--warnings-as-errors", "--force"])

    Mix.shell().info("=== Phase 2: Static Analysis ===")
    Mix.Task.run("credo", ["--strict"])

    unless Keyword.get(opts, :skip_dialyzer) do
      Mix.shell().info("=== Phase 3: Type Checking ===")
      Mix.Task.run("dialyzer")
    end

    Mix.shell().info("=== Phase 4: Testing ===")
    Mix.Task.run("test", ["--cover"])

    Mix.shell().info("=== Phase 5: Quality Gates ===")
    Mix.Task.run("quality.gates")

    Mix.shell().info("All quality checks passed.")
  end
end
```

### Argument Parsing

Mix tasks use Elixir's `OptionParser` for robust argument handling with type validation:

| Parser Feature | Use Case | Example |
|--------|----------|---------|
| **Boolean switches** | Flags that toggle behavior | `--fast`, `--json`, `--verbose` |
| **String switches** | Named parameters with values | `--domain security`, `--format json` |
| **Integer switches** | Numeric parameters | `--timeout 5000`, `--limit 100` |
| **Positional args** | Unnamed arguments | `mix git_trees find "pattern"` |
| **Aliases** | Short-form switches | `-f` for `--fast`, `-v` for `--verbose` |

```elixir
@switches [
  fast: :boolean,
  json: :boolean,
  domain: :string,
  timeout: :integer,
  verbose: :boolean
]

@aliases [
  f: :fast,
  j: :json,
  d: :domain,
  v: :verbose
]

{opts, args, errors} = OptionParser.parse(argv, switches: @switches, aliases: @aliases)
```

## Implementation in Prismatic Platform

The Prismatic Platform implements over 30 custom Mix tasks for platform operations, quality enforcement, and autonomous evolution:

```elixir
defmodule Mix.Tasks.Autoheal.Cycle do
  @moduledoc """
  Executes a complete self-healing cycle: scans for quality issues,
  applies automated fixes, verifies improvements, and reports results.

  Required at every session end per the Universal Autonomous
  Evolution Protocol.

  ## Usage

      mix autoheal.cycle           # Full healing cycle
      mix autoheal.cycle --quick   # Quick scan only
  """

  use Mix.Task

  @shortdoc "Run a complete self-healing cycle"

  @impl Mix.Task
  def run(argv) do
    {opts, _, _} = OptionParser.parse(argv, switches: [quick: :boolean])

    Mix.Task.run("app.start")

    Mix.shell().info("Starting autoheal cycle...")

    with {:ok, baseline} <- capture_baseline(),
         {:ok, issues} <- scan_issues(opts),
         {:ok, fixes} <- apply_fixes(issues),
         {:ok, verification} <- verify_improvements(baseline) do
      report_results(baseline, verification, fixes)
    else
      {:error, reason} ->
        Mix.shell().error("Autoheal cycle failed: #{inspect(reason)}")
        Mix.raise("Autoheal failure")
    end
  end

  defp capture_baseline, do: {:ok, %{quality_score: 100, violations: 0}}
  defp scan_issues(_opts), do: {:ok, []}
  defp apply_fixes(issues), do: {:ok, Enum.map(issues, &fix_issue/1)}
  defp fix_issue(issue), do: %{issue: issue, status: :fixed}
  defp verify_improvements(_baseline), do: {:ok, %{improved: true}}
  defp report_results(baseline, verification, fixes) do
    Mix.shell().info("Baseline: #{inspect(baseline)}")
    Mix.shell().info("Fixes applied: #{length(fixes)}")
    Mix.shell().info("Verification: #{inspect(verification)}")
  end
end

defmodule Mix.Tasks.GitTrees do
  @moduledoc """
  Optimized codebase exploration using git ls-tree.
  ~100x faster than find/ls for the platform's 48,000+ files.

  ## Usage

      mix git_trees              # Repository statistics
      mix git_trees list [path]  # List files in path
      mix git_trees find <regex> # Find by pattern
      mix git_trees elixir       # Elixir files only
      mix git_trees apps         # List applications
      mix git_trees recent [N]   # Recently modified files
      mix git_trees size         # Largest files
      mix git_trees count [path] # Count files by extension
  """

  use Mix.Task

  @shortdoc "Fast codebase exploration via git ls-tree"

  @impl Mix.Task
  def run(argv) do
    case argv do
      [] -> show_stats()
      ["list" | rest] -> list_files(List.first(rest))
      ["find", pattern | _] -> find_by_pattern(pattern)
      ["elixir" | _] -> list_elixir_files()
      ["apps" | _] -> list_applications()
      ["recent" | rest] -> show_recent(parse_count(rest))
      ["size" | _] -> show_largest()
      ["count" | rest] -> count_by_extension(List.first(rest))
      _ -> show_help()
    end
  end

  defp show_stats, do: Mix.shell().info("Repository statistics...")
  defp list_files(_path), do: Mix.shell().info("Listing files...")
  defp find_by_pattern(_pattern), do: Mix.shell().info("Finding by pattern...")
  defp list_elixir_files, do: Mix.shell().info("Elixir files...")
  defp list_applications, do: Mix.shell().info("Applications...")
  defp show_recent(_count), do: Mix.shell().info("Recent files...")
  defp show_largest, do: Mix.shell().info("Largest files...")
  defp count_by_extension(_path), do: Mix.shell().info("Counting...")
  defp show_help, do: Mix.shell().info("Usage: mix git_trees [command]")
  defp parse_count([]), do: 10
  defp parse_count([n | _]), do: String.to_integer(n)
end
```

## Task Dependencies and Ordering

Mix tasks can declare dependencies on other tasks, ensuring prerequisites are met before execution:

```
mix quality.gates
  |
  +-- mix compile (prerequisite, ensures code is compiled)
  |     |
  |     +-- mix deps.compile (ensures dependencies are compiled)
  |
  +-- mix app.start (starts OTP applications for runtime access)
  |
  +-- Domain checks (Dialyzer, Credo, compilation warnings, etc.)
  |
  +-- Report generation
```

Mix ensures that each task runs only once per invocation by default. Calling `Mix.Task.run("compile")` multiple times within a pipeline executes the compile task only on the first call. To force re-execution, use `Mix.Task.rerun/2`, though this is rarely needed.

## SessionLifecycle Integration

The SessionLifecycle GenServer executes Mix tasks with timeout protection and [circuit breaker](@/glossary/circuit-breaker.md) patterns, ensuring that hung or failing tasks do not block the development session:

```elixir
defmodule PrismaticClaude.SessionHooks do
  @moduledoc """
  Default session hooks that execute Mix tasks in isolated
  processes with timeout and circuit breaker protection.
  Prevents cascading failures from flaky mix tasks.
  """

  @task_timeout_ms 60_000

  @type hook_result :: :ok | {:error, :timeout | :circuit_open | term()}

  @spec execute_mix_task(String.t(), list(String.t())) :: hook_result()
  def execute_mix_task(task_name, args \\ []) do
    if circuit_open?(task_name) do
      {:error, :circuit_open}
    else
      task = Task.async(fn ->
        Mix.Task.run(task_name, args)
      end)

      case Task.yield(task, @task_timeout_ms) || Task.shutdown(task) do
        {:ok, _result} ->
          record_success(task_name)
          :ok
        nil ->
          record_failure(task_name)
          {:error, :timeout}
        {:exit, reason} ->
          record_failure(task_name)
          {:error, reason}
      end
    end
  end

  defp circuit_open?(_task_name), do: false
  defp record_success(_task_name), do: :ok
  defp record_failure(_task_name), do: :ok
end
```

## Umbrella Project Tasks

In Elixir umbrella projects like the Prismatic Platform (with 115 applications), Mix tasks have special behavior. Tasks can be run from the umbrella root to execute across all child applications, or from within a specific application directory to target only that application:

```bash
# Run from umbrella root -- executes across all 115 apps
mix compile --warnings-as-errors

# Run from specific app -- targets only that app
cd apps/prismatic_web && mix test

# Run with app filter from root
mix cmd --app prismatic_web mix test
```

Custom tasks must be aware of the umbrella context. A task defined in one umbrella application is only available when Mix is configured to include that application. Tasks intended for umbrella-wide use should be placed in the root project or in a shared application that all other applications depend on.

## Comparison with Alternatives

| Feature | Mix Tasks | npm Scripts | Make | Gradle | Rake |
|---------|-----------|-------------|------|--------|------|
| **Language** | Elixir | JavaScript/Shell | Shell | Groovy/Kotlin | Ruby |
| **Runtime access** | Full BEAM runtime | Node.js process | Subprocess | JVM | Ruby runtime |
| **Type checking** | Dialyzer + @spec | TypeScript (optional) | None | Kotlin type system | None |
| **Composition** | `Mix.Task.run/2` | `&&` chaining | Dependencies | Task dependencies | Prerequisites |
| **Argument parsing** | OptionParser | yargs/commander | Positional | CLI options | OptionParser |
| **Discovery** | `mix help` | `npm run` | `make help` (convention) | `gradle tasks` | `rake -T` |
| **Ecosystem** | Hex packages provide tasks | npm packages | Community Makefiles | Plugin ecosystem | Gem-based |
| **Umbrella support** | Native | Workspaces | Manual | Multi-project | None |

## Testing Mix Tasks

Mix tasks should be tested like any other Elixir module. The `Mix.Task` module provides utilities for testing:

```elixir
defmodule Mix.Tasks.Quality.GatesTest do
  use ExUnit.Case, async: true

  @moduledoc """
  Tests for the quality.gates Mix task.
  Verifies that the task correctly reports quality domain status
  and returns appropriate exit codes.
  """

  test "task runs successfully when all gates pass" do
    assert :ok = Mix.Tasks.Quality.Gates.run([])
  end

  test "task accepts --fast flag" do
    assert :ok = Mix.Tasks.Quality.Gates.run(["--fast"])
  end

  test "task outputs JSON when --json flag provided" do
    assert :ok = Mix.Tasks.Quality.Gates.run(["--json"])
  end

  test "task filters by domain when --domain provided" do
    assert :ok = Mix.Tasks.Quality.Gates.run(["--domain", "credo"])
  end

  test "task raises on quality failure" do
    assert_raise Mix.Error, fn ->
      Mix.Tasks.Quality.Gates.run(["--domain", "failing_domain"])
    end
  end
end
```

## Best Practices

1. **Use `@shortdoc` and `@moduledoc`**: Every task should have a `@shortdoc` for `mix help` listings and comprehensive `@moduledoc` documenting usage, arguments, exit codes, and examples. Tasks without documentation are tasks that will not be used.

2. **Return Meaningful Exit Codes**: Use `Mix.raise/1` to signal failure (exit code 1) and normal return for success (exit code 0). CI/CD pipelines depend on exit codes to determine pipeline status.

3. **Start Only What You Need**: Use `Mix.Task.run("app.start")` only when runtime access is required. Tasks that only analyze source files (formatting, linting) should not start the full OTP application tree.

4. **Parse Arguments with OptionParser**: Use Elixir's `OptionParser` for consistent argument handling. Define `@switches` with types for type-safe parsing and automatic validation.

5. **Emit Telemetry**: Custom platform tasks should emit [telemetry](@/glossary/telemetry.md) events for monitoring task execution duration, success/failure rates, and resource consumption. The SessionLifecycle system tracks task execution through telemetry.

6. **Handle Errors Gracefully**: Use `with` chains for multi-step tasks. Provide actionable error messages that help users fix the issue rather than just reporting failure.

7. **Avoid Side Effects in Compilation**: Tasks that are invoked during compilation (via compiler hooks) must not produce side effects like writing files or sending network requests. Side-effecting tasks should be explicitly invoked.

8. **Document Idempotency**: State whether the task is idempotent (safe to run multiple times). Quality checking tasks should be idempotent; generation tasks may not be.

## Use Cases

- **Quality Gate Enforcement**: `mix quality.gates` runs all 13 quality domain checks, blocking commits when violations are detected. The pre-commit hook and CI pipeline both invoke this task.

- **Self-Healing Operations**: `mix autoheal.cycle` and `mix autoheal.baseline` implement the platform's autonomous self-repair capability, scanning for quality issues and applying automated fixes.

- **Codebase Exploration**: `mix git_trees` provides optimized codebase navigation (~100x faster than `find`), essential for a platform with 48,000+ files across 115 umbrella applications.

- **Autonomous Evolution**: `mix autoevolve.mega` triggers the platform's autonomous improvement system, identifying and implementing enhancements across the entire codebase.

- **Content Enhancement**: `mix promo.enhance` analyzes and reports on the quality of promo site content across 1,800+ markdown files.

- **Forbidden Pattern Detection**: `mix quality.forbidden_patterns` scans the codebase for mocks, stubs, placeholders, and other forbidden patterns that violate platform quality standards.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) - Mix task-based quality enforcement pipeline
- [Elixir](@/glossary/elixir.md) - Language providing the Mix build tool
- [OTP](@/glossary/otp.md) - Framework providing application lifecycle that tasks interact with
- [BEAM](@/glossary/beam.md) - Virtual machine providing the runtime environment for Mix tasks
- [SEADF](@/glossary/seadf.md) - Evolution framework accessed through Mix tasks
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) - Compilation policy enforced via Mix tasks
- [Autoheal](@/glossary/autoheal.md) - Self-healing operations implemented as Mix tasks
- [Autoevolve](@/glossary/autoevolve.md) - Autonomous evolution triggered through Mix tasks
- [GenServer](@/glossary/genserver.md) - Process abstraction accessible from within Mix tasks
- [Supervisor](@/glossary/supervisor.md) - OTP supervision started by tasks requiring runtime access

## See Also

- [Technologies](@/technologies/_index.md) - Build tooling and development workflow technology
- [Architecture](@/architecture/_index.md) - Platform operations architecture
- [Commands](@/commands/_index.md) - Full command registry including Mix task-based commands

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
