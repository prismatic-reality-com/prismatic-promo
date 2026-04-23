+++
title = "commit-coordinator"
weight = 88
[extra]
domain = "medium-predator"
level = "L2"
description = "Specialized coordinator for Git commit operations with intelligent message generation, quality gate enforcement, conventional commit compliance, and mandatory GitLab issue validation ensuring every commit is traceable, well-described, and quality-verified."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "ecto", "no-mercy", "pre-commit-hooks", "quality-gates", "gitlab-ci"]
domain_normalized = "predator"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 92
keywords = ["git commit", "conventional commits", "quality gates", "commit validation", "GitLab integration", "session discipline"]
tags = ["prismatic", "agent", "git-operations", "predator-domain", "commit-management"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "commit-coordinator - Prismatic Platform"
+++

## Executive Summary

The Commit Coordinator operates as an L2 tactical operations agent within the Medium Predator domain of the Prismatic Platform. This agent specializes in Git commit operations, providing intelligent commit message generation, [quality gate](@/glossary/quality-gates.md) enforcement at commit time, Conventional Commits format compliance, and mandatory GitLab issue validation. Every commit passing through this agent is guaranteed to be traceable to a GitLab issue, formatted according to platform conventions, and verified against all quality gates before entering the repository.

In a platform where session discipline requires continuous committing with mandatory push-to-remote, the quality and consistency of commits is critical. Poorly formatted commit messages, commits without issue references, and commits that bypass quality gates create maintenance burden, break traceability, and allow defects to enter the codebase. The Commit Coordinator eliminates these failure modes by intercepting every commit operation and applying a comprehensive validation and enhancement pipeline.

## Architecture

The Commit Coordinator implements a four-layer pipeline architecture processing each commit operation.

```
+----------------------------------------------------------------------+
|         Commit Coordinator (L2)                                      |
+----------------------------------------------------------------------+
|  Pre-Commit Layer                                                     |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Quality Gate Check |  | Test Verification  |  | Warning Check    | |
|  | (All 13 domains)   |  | (Changed files)    |  | (Zero tolerance) | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Message Generation Engine                            |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  |  | Diff Analyzer |  | Type Classifier  |  | Scope Identifier  |  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Validation Layer          |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Format Validator   |  | Issue Link Check   |  | Co-Author Check  | |
|  | (Conv. Commits)    |  | (GitLab required)  |  | (AI attribution) | |
|  +--------------------+  +--------------------+  +------------------+ |
|                            |                                          |
|  Post-Commit Layer         |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Push Enforcer      |  | Issue Updater      |  | Session Logger   | |
|  | (Immediate push)   |  | (Progress note)    |  | (Context save)   | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Pre-Commit Layer validates code quality before the commit proceeds. The Message Generation Engine analyzes the diff to produce intelligent commit messages in Conventional Commits format. The Validation Layer ensures format compliance and issue traceability. The Post-Commit Layer enforces immediate push-to-remote and updates associated GitLab issues.

## Operational Domain

The Medium Predator domain encompasses agents with ecosystem-wide authority that enforce platform conventions through active monitoring and correction. The Commit Coordinator serves this domain by ensuring that the platform's commit stream maintains consistent quality, traceability, and format standards.

Commit quality in the Prismatic Platform is governed by strict session discipline: every commit must reference a GitLab issue, follow Conventional Commits format (`type(scope): subject`), pass all quality gates before commit, and be pushed to remote immediately after commit. The `--no-verify` flag is absolutely forbidden. These requirements are not guidelines but enforced rules that the Commit Coordinator implements as automated gates.

## Core Capabilities

**Intelligent Commit Message Generation** analyzes Git diffs to produce commit messages that accurately describe the change. The analyzer classifies changes by type (feat, fix, refactor, test, docs, chore, ci, perf), identifies the affected scope (application name or module), and generates a concise subject line under 50 characters. For complex changes, a multi-line body is generated explaining the rationale and impact.

**Quality Gate Enforcement** runs the platform's quality gate checks on all staged files before allowing the commit to proceed. This includes compilation with `--warnings-as-errors`, Credo strict mode analysis, and relevant test execution. Failed gates block the commit with clear error messages indicating which checks failed and how to resolve them.

**Conventional Commits Compliance** validates that every commit message follows the Conventional Commits specification: `type(scope): subject` format with body and footer sections as needed. The validator checks type validity, scope relevance, subject length, and footer format including the mandatory `Co-Authored-By` attribution for AI-generated commits.

**GitLab Issue Validation** ensures every commit references a valid GitLab issue. The validator checks that referenced issue numbers exist, are in an appropriate state (open or in-progress), and belong to the relevant milestone. Commits without issue references are blocked under the mandatory session tracking protocol.

**Bypass Prevention** actively detects and blocks attempts to bypass commit hooks using `--no-verify`, `--no-gpg-sign`, or other flags that skip validation. Bypass attempts are logged and escalated as L4 violations requiring supreme review.

## Implementation

```elixir
defmodule PrismaticGit.CommitCoordinator do
  @moduledoc """
  L2 Tactical Operations agent coordinating Git commit
  operations with quality gate enforcement.
  """

  use GenServer

  alias PrismaticGit.{DiffAnalyzer, MessageGenerator, QualityGateRunner}
  alias PrismaticGit.{FormatValidator, IssueLinker, PushEnforcer}

  defstruct [:active_branch, :issue_cache, :gate_results, :commit_log]

  @spec prepare_commit(map()) :: {:ok, map()} | {:error, term()}
  def prepare_commit(staged_changes) do
    GenServer.call(__MODULE__, {:prepare, staged_changes}, :timer.seconds(60))
  end

  @impl true
  def handle_call({:prepare, changes}, _from, state) do
    with {:ok, gate_result} <- QualityGateRunner.run(changes),
         {:ok, diff_analysis} <- DiffAnalyzer.analyze(changes),
         {:ok, message} <- MessageGenerator.generate(diff_analysis),
         {:ok, _validated} <- FormatValidator.validate(message),
         {:ok, _linked} <- IssueLinker.verify(message, state.issue_cache) do
      {:reply, {:ok, %{message: message, gates: gate_result}}, state}
    else
      {:error, _reason} = error -> {:reply, error, state}
    end
  end
end
```

## Authority Level

**L2** -- Tactical Operations -- Domain-specific tactical execution with authority to block commits that fail quality gates, format validation, or issue traceability requirements.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [commit-orchestrator](@/agents/commit-orchestrator.md) | Higher Authority | Receives strategic commit policies and priority overrides |
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality Authority | Defines quality gate requirements enforced at commit time |
| [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) | Guardrail Partner | Ensures commit-time gates match CI and deployment gates |

## Operational Workflow

**Phase 1 -- Pre-Commit Validation**: Quality gates run against staged changes. Failed gates produce specific error messages and block the commit.

**Phase 2 -- Message Generation**: The diff is analyzed and a Conventional Commits formatted message is generated with appropriate type, scope, and subject.

**Phase 3 -- Format and Issue Validation**: The commit message is validated for format compliance and GitLab issue reference correctness.

**Phase 4 -- Commit Execution**: With all validations passed, the commit proceeds with the validated message.

**Phase 5 -- Post-Commit Actions**: The commit is immediately pushed to remote. The associated GitLab issue is updated with progress information. Session context is saved.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Pre-commit gate latency | < 30s | 18s |
| Message generation accuracy | > 95% | 97% |
| Format compliance rate | 100% | 100% |
| Issue linkage rate | 100% | 100% |
| Bypass detection rate | 100% | 100% |
| Push-to-remote compliance | 100% | 100% |

## Enforcement

Commit coordination operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every commit must pass all quality gates, follow Conventional Commits format, and reference a valid GitLab issue. The `--no-verify` flag is absolutely forbidden. Bypass attempts trigger immediate L4 escalation. No exceptions, no workarounds.

## Related Resources

- [commit-orchestrator](@/agents/commit-orchestrator.md) -- Strategic commit orchestration
- [code-quality-commander](@/agents/code-quality-commander.md) -- Quality enforcement
- [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) -- Guardrail consistency
- [Quality Gates](@/capabilities/quality-gates.md) -- Platform quality enforcement
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)