+++
title = "/chatgpt-pack"
weight = 230
[extra]
category = "Development"
description = "Context packing for ChatGPT collaboration and knowledge transfer"
syntax = "/chatgpt-pack [options]"
authority = "L2+"
agent = "chatgpt-bridge"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1228
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-pack", "Context", "ChatGPT", "commands", "Development", "Prismatic Platform", "Archive", "ChatGPT Projects"]
tags = ["commands", "development", "chatgpt-pack", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-pack - Prismatic Platform"
+++

## Overview

The **/chatgpt-pack** command creates optimized context archives of the Prismatic Platform's codebase, documentation, and configuration for upload to ChatGPT Projects. This command addresses the fundamental challenge of cross-LLM collaboration: providing ChatGPT with sufficient platform context to produce relevant, accurate, and architecturally informed responses during consultation and analysis sessions. Rather than manually selecting and copying files, the pack command intelligently selects, prioritizes, and compresses platform content to fit within ChatGPT's project upload limits while maximizing information density.

The necessity of context packing arises from the asymmetry between local development environments and cloud-based LLM services. Claude Code operates within the local development context with full filesystem access, but ChatGPT requires explicit context provision through its Projects feature. A platform of the Prismatic scale -- 90 umbrella applications, 6,652 Elixir source files, 11,308 documentation files, and over 2.8 million lines of code -- cannot be uploaded in its entirety. The **/chatgpt-pack** command solves this by applying intelligent content selection algorithms that prioritize the most informationally dense files, exclude build artifacts and dependencies, and optimize the archive structure for ChatGPT's file processing capabilities. A well-constructed 100MB focused archive often produces better consultation outcomes than a 500MB full dump, because ChatGPT can process the focused context more effectively within its attention window.

The command is executed by the `chatgpt-bridge` agent through the `chatgpt-archive-specialist` subsystem within the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) framework. It supports four archive modes -- standard, fast, full, and incremental -- and four content focus options that control the balance between documentation, source code, and architecture content. The command produces compressed ZIP archives with configurable target sizes, respecting ChatGPT's 512MB maximum per project. As part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), it integrates with [/chatgpt-sync](@/commands/chatgpt-sync.md) for automated project synchronization and [/chatgpt-consult](@/commands/chatgpt-consult.md) for context preparation in consultation workflows.

## Usage

```bash
/chatgpt-pack [--mode <archive_mode>] [--target-size <size>] [--focus <content_focus>] [--since <date_or_commit>] [--output <filename>]
```

### Standard Archive Creation

```bash
# Create standard comprehensive archive (default ~400MB)
/chatgpt-pack

# Fast lightweight archive for quick consultations (~100MB)
/chatgpt-pack --mode fast

# Full detailed archive with maximum content (~512MB)
/chatgpt-pack --mode full --target-size 512MB
```

### Incremental Archives

```bash
# Archive only changes since last week
/chatgpt-pack --mode incremental --since "2025-11-28"

# Changes since specific git commit
/chatgpt-pack --mode incremental --since "a1b2c3d"

# Changes since last archive upload
/chatgpt-pack --mode incremental --since last-upload
```

### Focused Archives

```bash
# Documentation-focused for architecture discussions
/chatgpt-pack --focus documentation --target-size 100MB

# Source code focused for code reviews
/chatgpt-pack --focus source --target-size 300MB

# Architecture focused for strategic planning sessions
/chatgpt-pack --focus architecture --target-size 50MB
```

### Custom Archives

```bash
# Custom output filename with descriptive name
/chatgpt-pack --output "prismatic-v2-consultation.zip"

# Full optimized archive with custom name
/chatgpt-pack --mode full --focus balanced --target-size 450MB --output "prismatic-complete.zip"
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `--mode` | enum | No | `standard` | Archive creation mode: `standard` (~400MB, 2-4 min), `fast` (~100MB, 30-60s), `full` (~500MB, 5-10 min), `incremental` (variable, 10-30s) |
| `--target-size` | string | No | `400MB` | Target archive size (e.g., `100MB`, `400MB`, `512MB`); upper bound, not exact |
| `--since` | string | No | -- | For incremental mode: date (`YYYY-MM-DD`), git commit hash, or `last-upload` |
| `--output` | string | No | Auto-generated | Custom output filename; auto-generated includes platform version and timestamp |
| `--focus` | enum | No | `balanced` | Content focus: `documentation`, `source`, `architecture`, `balanced` |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Tactical Execution) |
| **Executing Agent** | `chatgpt-bridge` (via `chatgpt-archive-specialist`) |
| **Agent Classification** | L2 Archive Specialist |
| **Status** | Production |
| **Usage Frequency** | Low |
| **Category** | Development |
| **Domain** | Archive Management / Cross-LLM Context Transfer |
| **AIAD Version** | 1.0.0 |
| **Size Constraints** | ChatGPT Projects: 512MB maximum upload |

## Technical Implementation

The **/chatgpt-pack** command delegates to the `chatgpt-archive-specialist` agent, which implements a multi-phase archive creation pipeline: content enumeration, priority scoring, size-constrained selection, compression, and post-creation validation. The priority scoring algorithm ensures that the most informationally valuable files are included first when the target size imposes selection constraints.

```elixir
defmodule Prismatic.LLM.ChatGPT.ArchiveSpecialist do
  @moduledoc """
  Creates optimized context archives for ChatGPT Projects.
  Applies intelligent content selection and compression within size constraints.
  """

  @focus_priorities %{
    documentation: %{docs: 1.0, readme: 1.0, claude_md: 0.95, source: 0.3, config: 0.5, tests: 0.1},
    source: %{source: 1.0, config: 0.7, docs: 0.2, readme: 0.4, tests: 0.5, claude_md: 0.3},
    architecture: %{docs: 0.9, claude_md: 1.0, readme: 0.8, source: 0.2, config: 0.6, tests: 0.1},
    balanced: %{source: 0.7, docs: 0.8, readme: 0.9, claude_md: 0.95, config: 0.6, tests: 0.3}
  }

  @spec create_archive(keyword()) :: {:ok, String.t(), ArchiveMetrics.t()} | {:error, term()}
  def create_archive(opts \\ []) do
    mode = Keyword.get(opts, :mode, :standard)
    focus = Keyword.get(opts, :focus, :balanced)
    target_size = parse_size(Keyword.get(opts, :target_size, "400MB"))

    with {:ok, candidates} <- enumerate_candidates(mode, opts),
         {:ok, scored} <- score_candidates(candidates, focus),
         {:ok, selected} <- select_within_budget(scored, target_size),
         {:ok, archive_path} <- compress_archive(selected, opts),
         {:ok, metrics} <- validate_archive(archive_path) do
      {:ok, archive_path, metrics}
    end
  end

  defp select_within_budget(scored_files, target_size) do
    selected =
      scored_files
      |> Enum.sort_by(& &1.priority, :desc)
      |> Enum.reduce_while({[], 0}, fn file, {acc, total} ->
        new_total = total + file.compressed_estimate
        if new_total <= target_size do
          {:cont, {[file | acc], new_total}}
        else
          {:halt, {acc, total}}
        end
      end)
      |> elem(0)
      |> Enum.reverse()

    {:ok, selected}
  end
end
```

The content scoring system assigns priority weights based on the selected focus mode. In `documentation` focus, README files, CLAUDE.md files, and documentation directories receive the highest scores. In `source` focus, Elixir source files and configuration are prioritized. The `balanced` mode uses a calibrated mix that provides comprehensive platform coverage. Files are sorted by priority score and selected greedily until the target size budget is exhausted, ensuring the most valuable content always makes it into the archive regardless of constraints.

The incremental mode leverages git's change detection to identify files modified since a specified point in time, dramatically reducing archive size and creation time for ongoing consultations. The `last-upload` reference point is tracked in the platform's sync metadata, enabling fully automated incremental updates.

Post-creation validation verifies archive integrity (ZIP format validity), confirms size compliance, scans for sensitive data that should not be uploaded (credentials, API keys, environment files), and generates a content manifest summarizing what was included and excluded.

## Workflow Integration

The **/chatgpt-pack** command fits into several cross-LLM workflow patterns. In the **initial consultation setup workflow**, a `full` or `standard` archive is created and uploaded to a ChatGPT Project before the first consultation session. This one-time setup provides ChatGPT with comprehensive platform context, enabling high-quality consultations through [/chatgpt-consult](@/commands/chatgpt-consult.md).

In the **continuous synchronization workflow**, the command is paired with [/chatgpt-sync](@/commands/chatgpt-sync.md) for automated project updates. After each significant development milestone, an `incremental` archive captures only the changes, keeping the ChatGPT Project current without re-uploading the entire platform context.

The **focused consultation workflow** uses purpose-specific archives. Before an architecture discussion, create a `documentation` or `architecture` focused archive. Before a code review session, create a `source` focused archive. This targeted approach maximizes the relevance of context within ChatGPT's processing capacity.

The command also integrates with CI/CD through the `mix chatgpt.sync` task and the `.gitlab-ci/chatgpt-sync.yml` pipeline configuration, enabling automatic archive creation and upload on every merge to the main branch.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `chatgpt-bridge` agent via archive specialist |
| [/chatgpt-sync](@/commands/chatgpt-sync.md) | Archives uploaded via sync command |
| [/chatgpt-consult](@/commands/chatgpt-consult.md) | Context preparation for consultation sessions |
| [/chatgpt-analyze](@/commands/chatgpt-analyze.md) | Context archives support analysis sessions |
| [/chatgpt-bridge](@/commands/chatgpt-bridge.md) | Archive upload through bridge API |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation |
| [Telemetry](@/glossary/telemetry.md) | Archive creation [metrics](@/glossary/metrics.md): size, duration, content density |
| Git Integration | Change detection for incremental mode via `git log` and `git diff` |
| ChatGPT Projects API | Target upload destination for archives |
| Security Scanner | Prevents inclusion of secrets and credentials |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Archive creation must complete successfully or fail with explicit diagnostics. No partial archives are produced. Size constraints are enforced strictly -- if the target size cannot accommodate the minimum required content for the selected focus, the command fails with a clear message rather than producing an inadequate archive. Sensitive data scanning is mandatory; archives containing detected credentials or API keys are rejected.
- **NO DOUBTS**: Archive content manifests provide complete transparency about what is included and excluded. File selection priorities are deterministic and reproducible. Incremental mode change detection uses git's authoritative change tracking rather than filesystem timestamps. Post-creation validation confirms archive integrity before reporting success.
- **Regression Protection**: Archive creation logic, content scoring algorithms, and security scanning rules include test suites that validate output structure, size compliance, and sensitive data exclusion against reference test cases.

## Best Practices

1. **Match archive to consultation type**: Use `--focus documentation` for architecture discussions, `--focus source` for code reviews. Mismatched focus wastes context window on irrelevant content.
2. **Prefer incremental for ongoing work**: If you have an existing ChatGPT project, use `--mode incremental` to send only recent changes rather than rebuilding the full archive each time.
3. **Use fast mode for quick questions**: Spending 5 minutes creating a 500MB archive for a simple question is wasteful. Fast mode produces a usable archive in under a minute.
4. **Respect size limits**: ChatGPT Projects have a 512MB upload limit. Stay within 450MB for the target size to leave headroom for compression overhead.
5. **Automate with CI/CD**: Configure automatic archive creation and sync on merge to main, ensuring the ChatGPT Project always reflects the current platform state.
6. **Review the security scan**: Always check the post-creation validation output to confirm that no sensitive data was included, especially when using `full` mode with broad content selection.

## Related Commands

- [/chatgpt-consult](@/commands/chatgpt-consult.md) - Consult ChatGPT for alternative perspectives and solutions
- [/chatgpt-sync](@/commands/chatgpt-sync.md) - Synchronize context and progress between Claude and ChatGPT
- [/chatgpt-bridge](@/commands/chatgpt-bridge.md) - ChatGPT bridge operations for cross-LLM coordination
- [/chatgpt-analyze](@/commands/chatgpt-analyze.md) - Launch ChatGPT ANALYZE conversation for deep code analysis
- [/chatgpt-convert](@/commands/chatgpt-convert.md) - Convert content between LLM-specific formats and prompts
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)