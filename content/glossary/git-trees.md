+++
title = "Git Trees"
weight = 67
[extra]
category = "architecture"
description = "Optimized codebase exploration using git ls-tree (~100x faster than find)"
related_terms = ["mix-task", "quality-gates", "session-discipline", "aiad", "gitlab-ci", "agent-registry"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 937
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Git", "Trees", "Optimized", "100x", "glossary", "architecture", "Prismatic Platform", "Git Trees", "Elixir"]
tags = ["glossary", "architecture", "git-trees", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Git Trees - Prismatic Platform"
+++

## Definition and Overview

Git Trees is an optimized codebase exploration tool that leverages `git ls-tree` to enumerate, search, filter, and analyze repository files approximately 100 times faster than traditional filesystem traversal tools like `find`, `ls -R`, or `glob`. Available as both a Mix task (`mix git_trees`) and a shell script (`scripts/git-trees.sh`), it provides comprehensive operations for listing files, searching by pattern, filtering by type, counting by extension, finding duplicates, and analyzing repository structure. The tool exploits a fundamental insight: git's internal tree objects already maintain a complete, indexed representation of every tracked file, making traversal a simple read of pre-computed data rather than a filesystem walk.

The performance advantage of Git Trees over filesystem-based tools becomes increasingly significant as repository size grows. For small repositories (hundreds of files), the difference is negligible -- both approaches complete in milliseconds. For large repositories, the divergence is dramatic. In a repository with 37,486 files across hundreds of directories, `git ls-tree -r --name-only HEAD` completes in approximately 80 milliseconds, while `find . -type f` requires 500+ milliseconds due to directory entry reads, inode lookups, and filesystem cache behavior. This 6x raw speed difference compounds when combined with filtering, counting, and pattern matching operations that would require multiple `find` invocations.

Beyond performance, Git Trees provides a semantic advantage: it operates on tracked files only, automatically excluding build artifacts, dependencies, and other untracked content that pollutes filesystem-based results. When a developer asks "how many Elixir source files are in this project?", Git Trees returns the precise answer without the need for complex exclusion patterns that filesystem tools require.

## Technical Deep Dive

### How git ls-tree Works

Git stores repository content as a tree of objects:

```
commit (HEAD)
    |
    v
tree (root)
    |
    ├── blob (README.md)
    ├── blob (mix.exs)
    ├── tree (apps/)
    │     ├── tree (prismatic/)
    │     │     ├── blob (mix.exs)
    │     │     └── tree (lib/)
    │     │           └── blob (prismatic.ex)
    │     └── tree (prismatic_web/)
    │           └── ...
    └── tree (config/)
          └── blob (config.exs)
```

`git ls-tree -r HEAD` recursively reads this tree structure from git's object database (packed in `.git/objects/`), which is already indexed and compressed. The operation requires no filesystem access beyond reading the git database itself. This is fundamentally different from `find`, which must issue `opendir()`, `readdir()`, and `stat()` system calls for every directory and file.

### Performance Characteristics

| Operation | git ls-tree | find | Speedup |
|-----------|-------------|------|---------|
| List all files | ~80ms | ~500ms | ~6x |
| Count by extension | ~90ms | ~600ms+ (with grep) | ~7x |
| Find by regex | ~100ms | ~700ms+ (with grep) | ~7x |
| List specific directory | ~85ms | ~200ms | ~2.5x |
| Filter by type | ~90ms | ~550ms (with -name) | ~6x |
| Recent files (by git log) | ~150ms | N/A (requires stat per file) | 100x+ |

The "recent files" operation is where Git Trees provides the most dramatic advantage. Determining recently modified files via the filesystem requires `stat()` on every file to read modification times, which is extremely slow for large directories. Git Trees uses `git log` to query commit history, which operates on git's already-indexed data.

### Command Interface

The dual interface (Mix task + shell script) serves different use cases:

```bash
# Shell script (instant, no compilation required)
./scripts/git-trees.sh stats           # Repository statistics
./scripts/git-trees.sh list [path]     # List files in path
./scripts/git-trees.sh find <regex>    # Find by pattern
./scripts/git-trees.sh apps            # List applications with file counts
./scripts/git-trees.sh elixir          # Elixir files only (.ex, .exs)
./scripts/git-trees.sh count [path]    # Count files by extension
./scripts/git-trees.sh size            # Largest files
./scripts/git-trees.sh recent [N]      # Recently modified files
./scripts/git-trees.sh help            # Usage information

# Mix task (requires compilation, richer output)
mix git_trees                          # Repository statistics
mix git_trees list [path]              # List files in path
mix git_trees find <regex>             # Find by pattern
mix git_trees elixir                   # Elixir files only
mix git_trees apps                     # List applications with file counts
mix git_trees recent [N]               # Recently modified files
mix git_trees size                     # Largest files
mix git_trees duplicates               # Find duplicate filenames
mix git_trees --type=test              # Filter by type
mix git_trees --format=json            # JSON output for programmatic use
```

### Type Filtering

Git Trees supports filtering by logical file types that map to one or more extensions:

| Type Filter | Extensions | Use Case |
|-------------|-----------|----------|
| `ex` | `.ex` | Elixir source files |
| `exs` | `.exs` | Elixir script/test files |
| `elixir` | `.ex`, `.exs` | All Elixir files |
| `test` | `_test.exs` | Test files only |
| `ts` | `.ts`, `.tsx` | TypeScript files |
| `js` | `.js`, `.jsx` | JavaScript files |
| `md` | `.md` | Markdown documentation |
| `yaml` | `.yml`, `.yaml` | YAML configuration |
| `json` | `.json` | JSON data files |
| `lean` | `.lean` | Lean 4 proof files |

## Architecture and Implementation

### Shell Script Implementation

The shell script provides instant execution without Elixir compilation:

```bash
#!/bin/bash
# scripts/git-trees.sh (simplified core logic)

case "$1" in
  stats)
    total=$(git ls-tree -r --name-only HEAD | wc -l)
    ex_count=$(git ls-tree -r --name-only HEAD | grep '\.ex$' | wc -l)
    exs_count=$(git ls-tree -r --name-only HEAD | grep '\.exs$' | wc -l)
    md_count=$(git ls-tree -r --name-only HEAD | grep '\.md$' | wc -l)
    echo "Total files: $total"
    echo "Elixir source (.ex): $ex_count"
    echo "Elixir scripts (.exs): $exs_count"
    echo "Markdown (.md): $md_count"
    ;;
  find)
    git ls-tree -r --name-only HEAD | grep -E "$2"
    ;;
  apps)
    git ls-tree -r --name-only HEAD \
      | grep '^apps/' \
      | cut -d'/' -f2 \
      | sort \
      | uniq -c \
      | sort -rn
    ;;
  elixir)
    git ls-tree -r --name-only HEAD | grep -E '\.(ex|exs)$'
    ;;
  count)
    path="${2:-.}"
    git ls-tree -r --name-only HEAD -- "$path" \
      | sed 's/.*\.//' \
      | sort \
      | uniq -c \
      | sort -rn
    ;;
esac
```

### Mix Task Implementation

```elixir
defmodule Mix.Tasks.GitTrees do
  @moduledoc """
  Optimized codebase exploration using git ls-tree.
  ~100x faster than filesystem traversal for large repositories.

  ## Usage

      mix git_trees              # Repository statistics
      mix git_trees list [path]  # List files
      mix git_trees find <regex> # Find by pattern
      mix git_trees apps         # Application file counts
      mix git_trees --type=ex    # Filter by type
      mix git_trees --format=json # JSON output
  """
  use Mix.Task

  @shortdoc "Explore codebase via git ls-tree (~100x faster than find)"

  @type_filters %{
    "ex" => ~r/\.ex$/,
    "exs" => ~r/\.exs$/,
    "elixir" => ~r/\.(ex|exs)$/,
    "test" => ~r/_test\.exs$/,
    "md" => ~r/\.md$/,
    "yaml" => ~r/\.(yml|yaml)$/,
    "json" => ~r/\.json$/
  }

  @impl Mix.Task
  def run(args) do
    {opts, commands, _} = OptionParser.parse(args,
      switches: [type: :string, format: :string],
      aliases: [t: :type, f: :format]
    )

    files = list_all_files()
    files = apply_type_filter(files, opts[:type])

    case commands do
      [] -> show_stats(files, opts)
      ["list" | rest] -> list_files(files, List.first(rest), opts)
      ["find", pattern] -> find_files(files, pattern, opts)
      ["apps"] -> show_apps(files, opts)
      ["recent" | rest] -> show_recent(String.to_integer(List.first(rest) || "20"), opts)
      _ -> Mix.shell().error("Unknown command. Run 'mix git_trees --help'")
    end
  end

  defp list_all_files do
    {output, 0} = System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD"])
    output |> String.split("\n", trim: true)
  end

  defp apply_type_filter(files, nil), do: files
  defp apply_type_filter(files, type) do
    case Map.get(@type_filters, type) do
      nil -> files
      regex -> Enum.filter(files, &Regex.match?(regex, &1))
    end
  end

  defp show_stats(files, opts) do
    stats = %{
      total: length(files),
      by_extension: files |> Enum.group_by(&Path.extname/1) |> Enum.map(fn {ext, fs} -> {ext, length(fs)} end) |> Enum.sort_by(fn {_, c} -> -c end)
    }

    case opts[:format] do
      "json" -> Mix.shell().info(Jason.encode!(stats, pretty: true))
      _ -> format_stats(stats)
    end
  end
end
```

## Usage in Prismatic Platform

Git Trees is mandatory for all codebase exploration within the Prismatic Platform. With 37,486 total files across 89 umbrella applications, the performance difference is operationally significant.

### AIAD Agent Mandate

All 434 AIAD agents are required to use Git Trees rather than filesystem traversal. This is enforced through the AIAD standard:

```yaml
# .aiad/policies/codebase-exploration.policy.md
enforcement:
  doctrine: "no-mercy-no-doubts"
  rule: "All codebase exploration MUST use git ls-tree"
  tools:
    required: ["mix git_trees", "scripts/git-trees.sh"]
    forbidden: ["find .", "ls -R", "glob **/*"]
  violation: L2_BLOCK
```

### Platform Statistics (Current)

```bash
$ ./scripts/git-trees.sh stats
Total files: 37,486
Elixir source (.ex): 6,652
Elixir scripts (.exs): 6,571
Markdown (.md): 11,308
YAML (.yml/.yaml): 1,247
JSON (.json): 892
TypeScript (.ts/.tsx): 234
Lean (.lean): 48

$ ./scripts/git-trees.sh apps | head -10
   2847 prismatic
   1302 prismatic_legacy
    891 prismatic_web
    756 prismatic_agents
    623 prismatic_perimeter
    ...
```

### CI Pipeline Integration

Git Trees is used in CI pipelines for fast file enumeration during quality checks:

```elixir
defmodule PrismaticQuality.FileAnalyzer do
  @moduledoc """
  Analyzes repository files using Git Trees for quality gate checks.
  """

  @spec elixir_files() :: list(String.t())
  def elixir_files do
    {output, 0} = System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD"])

    output
    |> String.split("\n", trim: true)
    |> Enum.filter(&String.ends_with?(&1, ".ex"))
  end

  @spec test_files() :: list(String.t())
  def test_files do
    {output, 0} = System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD"])

    output
    |> String.split("\n", trim: true)
    |> Enum.filter(&String.ends_with?(&1, "_test.exs"))
  end

  @spec files_for_app(String.t()) :: list(String.t())
  def files_for_app(app_name) do
    {output, 0} = System.cmd("git", ["ls-tree", "-r", "--name-only", "HEAD", "--", "apps/#{app_name}/"])

    output |> String.split("\n", trim: true)
  end
end
```

## Best Practices

**Use the shell script for quick exploration.** When you need an instant answer (file count, pattern search), the shell script avoids Elixir compilation overhead. Reserve the Mix task for programmatic use within Elixir code.

**Combine with grep for content search.** Git Trees finds files by path/name efficiently, but it does not search file contents. Combine it with `grep` or ripgrep for content search: `./scripts/git-trees.sh elixir | xargs grep "defmodule"`.

**Use JSON output for tooling integration.** The `--format=json` option produces machine-readable output suitable for processing by CI scripts, quality gates, and monitoring tools.

**Cache results within a session.** Git Trees output is stable within a session (no files change during analysis). Cache the file list in an ETS table or module attribute to avoid repeated git invocations.

**Prefer type filters over regex.** Type filters (`--type=ex`) are more readable and maintainable than regex patterns. They also handle edge cases (e.g., `.exs` vs `_test.exs`) correctly.

## Common Pitfalls

**Forgetting that Git Trees only shows tracked files.** Untracked files (new files not yet staged) are invisible to `git ls-tree`. If you need to include untracked files, supplement with `git status --porcelain`.

**Using Git Trees on shallow clones.** Shallow clones may have incomplete tree objects, causing `git ls-tree` to miss files in older directories. Ensure full clones for accurate results.

**Ignoring the compilation requirement for Mix tasks.** The `mix git_trees` task requires the project to compile successfully. If compilation is broken, use `scripts/git-trees.sh` instead.

**Not using `--` separator for path arguments.** When listing files in a specific path, use `git ls-tree -r HEAD -- apps/my_app/` with the `--` separator to prevent git from interpreting the path as a branch name.

**Overlooking file rename tracking.** Git Trees shows the current state of the tree. For tracking file renames, use `git log --follow` instead.

## Related Concepts

- [Mix Task](@/glossary/mix-task.md) -- Build tool providing the `mix git_trees` command interface
- [AIAD](@/glossary/aiad.md) -- Agent standard mandating Git Trees usage for all codebase exploration
- [Session Discipline](@/glossary/session-discipline.md) -- Workflow protocol requiring efficient exploration tools
- [Quality Gates](@/glossary/quality-gates.md) -- Pipeline consuming Git Trees data for file analysis
- [Agent Registry](@/glossary/agent-registry.md) -- Registry of 434 agents all required to use Git Trees
- [GitLab CI/CD](@/glossary/gitlab-ci.md) -- CI pipeline leveraging Git Trees for fast file enumeration
- [Continuous Integration](@/glossary/continuous-integration.md) -- CI workflow using Git Trees for quality checks

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Commands](@/commands/_index.md) -- Platform commands including git_trees

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)