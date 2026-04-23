+++
title = "Development Workflow & CI/CD"
weight = 4
[extra]
description = "Setting up your environment, Git hooks, pre-commit checks, and the deployment pipeline"
category = "beginner"
difficulty = "beginner"
duration = "50 min"
prerequisites = ["getting-started", "quality-standards"]
glossary_terms = ["no-mercy", "quality-dna", "clean-run", "aiad", "cascade"]
technologies = ["elixir", "git", "gitlab-ci", "docker", "flyio"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1130
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Development", "Workflow", "CICD", "Setting", "academy", "beginner", "Prismatic Platform", "GitLab", "Step", "Quality DNA"]
tags = ["academy", "beginner", "development-workflow--ci-cd", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Development Workflow & CI/CD - Prismatic Platform"
+++

## Overview

The Prismatic Platform enforces a rigorous development workflow that ensures every commit is production-ready. This guide walks you through the complete development cycle -- from setting up your local environment to watching your code deploy through the CI/CD pipeline. You will understand every gate your code must pass and how to work efficiently within these constraints.

You will learn:

- How to configure Git hooks for automatic pre-commit quality enforcement
- The mandatory session discipline protocol (GitLab tracking, atomic commits, continuous push)
- How the CI/CD pipeline validates and deploys your changes
- How to use mix tasks for local quality verification
- The deployment pipeline from commit to production on Fly.io

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Completed [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md)
- Git installed with SSH access to the repository
- GitLab account with project access

## Core Concepts

### The Commit Lifecycle

Every commit passes through multiple gates. Understanding this flow prevents frustration:

```
Code Change
    |
    v
Local Tests (mix test <changed_files>)
    |
    v
Pre-Commit Hook (quality gates, warnings check, pattern scan)
    |
    v
Commit Created
    |
    v
Push to Remote (immediate -- no batching)
    |
    v
GitLab CI Pipeline (compile, test, credo, dialyzer, quality gates)
    |
    v
Merge Request Review
    |
    v
Production Deployment (Fly.io)
```

If any gate fails, the process stops. The pre-commit hook runs locally in seconds. The CI pipeline runs in minutes. Catching issues early saves significant time.

### Session Discipline Protocol

Every development session follows a strict protocol:

1. **Create GitLab issues** for your work items before writing any code
2. **Commit atomically** -- each commit represents one logical change
3. **Push immediately** after every commit -- no unpushed work at session end
4. **Test locally** before every commit
5. **All hooks must pass** -- `--no-verify` is absolutely forbidden

### Atomic Commits

A commit should contain exactly one logical change. If you are implementing a new agent, the commits might look like:

```
feat(agents): add MetricSentinel agent specification
feat(agents): implement MetricSentinel GenServer
test(agents): add MetricSentinel comprehensive tests
docs(agents): add MetricSentinel to agent registry
```

Do not batch all four changes into a single "add MetricSentinel" commit.

## Step-by-Step Guide

### Step 1: Install Git Hooks

The platform ships custom Git hooks in `.githooks/`. Install them:

```bash
git config core.hooksPath .githooks
```

This enables the pre-commit hook that runs quality gates before every commit. The hook performs:

- Compilation with `--warnings-as-errors`
- Quality pattern scanning (TODO, Process.sleep, unsafe map access)
- Template validation (for promo site changes)
- Regression test verification (for bug fixes)

### Step 2: Create a Feature Branch

```bash
git checkout -b feature/metric-sentinel
```

Branch naming follows conventions:
- `feature/description` for new features
- `fix/description` for bug fixes
- `refactor/description` for code improvements
- `test/description` for test additions

### Step 3: Set Up GitLab Issue Tracking

Before writing code, create a GitLab issue:

```bash
# Using the GitLab CLI or web interface
# Issue should describe: what, why, acceptance criteria
```

Reference the issue in your commits:

```bash
git commit -m "feat(agents): add MetricSentinel specification

Implements initial AIAD spec for the metric monitoring agent.

Refs: #1234"
```

### Step 4: Local Verification Cycle

Before every commit, run verification:

```bash
# Quick verification (30 seconds)
mix compile --warnings-as-errors && mix test apps/prismatic_agents/test/

# Full verification (2-3 minutes)
mix compile --warnings-as-errors && mix credo --strict && mix test

# Complete quality gates (5+ minutes, includes Dialyzer)
mix quality.gates
```

For iterative development, use the quick cycle and run full gates before the final push.

### Step 5: Commit and Push

```bash
# Stage specific files (never use git add -A blindly)
git add apps/prismatic_agents/lib/prismatic_agents/metric_sentinel.ex
git add apps/prismatic_agents/test/prismatic_agents/metric_sentinel_test.exs

# Commit (pre-commit hook runs automatically)
git commit -m "feat(agents): implement MetricSentinel GenServer"

# Push immediately
git push -u origin feature/metric-sentinel
```

### Step 6: CI Pipeline

When you push, the GitLab CI pipeline triggers automatically. The pipeline stages are:

```yaml
stages:
  - compile      # mix compile --warnings-as-errors
  - test         # mix test --cover
  - lint         # mix credo --strict
  - typecheck    # mix dialyzer
  - quality      # mix quality.gates
  - deploy       # fly deploy (main branch only)
```

Monitor the pipeline in the GitLab web interface. If any stage fails, fix the issue locally and push a new commit.

### Step 7: Deployment

Merges to `main` trigger automatic deployment:

```
main branch push
    |
    v
CI Pipeline (all stages pass)
    |
    v
Docker Build (multi-stage, alpine-based)
    |
    v
Fly.io Staging (prismatic-staging.fly.dev)
    |
    v
Smoke Tests
    |
    v
Fly.io Production (prismatic-prod.fly.dev)
```

## Code Examples

### GitLab CI Configuration Pattern

The platform uses simple command lists in CI YAML (no heredocs, no folded scalars):

```yaml
# CORRECT: simple command list
test:
  stage: test
  script:
    - mix deps.get
    - mix compile --warnings-as-errors
    - mix test --cover

# FORBIDDEN: multiline scalars (GitLab nesting limit)
# test:
#   script:
#     - |
#       mix deps.get
#       mix compile
```

### Pre-Commit Hook Structure

The pre-commit hook checks are ordered by speed:

```bash
# Phase 1: Compilation (fast, catches most issues)
mix compile --warnings-as-errors --force

# Phase 2: Pattern scanning (instant, catches anti-patterns)
# Scans for: TODO, FIXME, Process.sleep, length() > 0, bare map access

# Phase 3: Test execution (moderate, catches logic errors)
mix test --only changed

# Phase 4: Credo (moderate, catches style issues)
mix credo --strict --only-changed
```

### Quality DNA Tracking

Every session updates the Quality DNA file that tracks metrics across sessions:

```json
{
  "score": 100,
  "domains": {
    "dialyzer": {"violations": 0, "status": "perfect"},
    "credo": {"violations": 0, "status": "perfect"},
    "compilation": {"warnings": 0, "status": "perfect"},
    "typespec_coverage": {"coverage": 100, "status": "perfect"}
  },
  "timestamp": "2026-02-12T10:00:00Z",
  "generation": 18
}
```

### Dockerfile Pattern

The platform uses multi-stage Docker builds:

```dockerfile
# Build stage
FROM elixir:1.19-alpine AS builder
RUN apk add --no-cache build-base git
WORKDIR /app
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/
RUN mix deps.get --only prod
COPY . .
RUN MIX_ENV=prod mix release

# Runtime stage
FROM alpine:3.19
RUN apk add --no-cache libstdc++ openssl ncurses-libs
COPY --from=builder /app/_build/prod/rel/prismatic ./
USER nobody
CMD ["bin/prismatic", "start"]
```

## Common Pitfalls

**Batching multiple changes in one commit.** Each commit must be atomic. If you change an agent implementation and update a LiveView template, those are two separate commits.

**Forgetting to push after committing.** The session discipline protocol requires immediate push after every commit. Unpushed work at session end is treated as an L2 violation.

**Running `git add .` or `git add -A` without review.** Always stage specific files. Blanket adds can accidentally include `.env` files, large binaries, or unrelated changes.

**Ignoring CI pipeline failures.** A red pipeline is not "someone else's problem." If your commit broke the build, fix it immediately with a new commit (not an amend to the broken one).

**Writing CI YAML with multiline scalars.** GitLab has a 10-level nesting limit. Use simple command lists (`- command`) and extract complex logic to shell scripts in `scripts/`.

## Exercises

1. **Practice the full cycle.** Create a feature branch, make a small change, run local verification, commit, push, and watch the CI pipeline complete.

2. **Trigger a pre-commit failure.** Deliberately introduce a warning, attempt to commit, observe the hook output, fix the warning, and commit successfully.

3. **Read the CI configuration.** Open `.gitlab-ci.yml` and trace each stage. Identify which mix tasks run in each stage and what they validate.

4. **Explore the Quality DNA.** Read `.claude/quality-dna/current-state.json` and understand how the score is calculated from the 13 quality domains.

5. **Practice atomic commits.** Take a feature that requires changes to three files and create three separate, well-described commits rather than one combined commit.

## Summary

The Prismatic development workflow is designed around the principle that every commit is production-ready. Git hooks enforce quality locally, CI validates in the cloud, and deployment is automatic for the main branch. The session discipline protocol ensures continuous tracking, atomic commits, and immediate push. Working within these constraints is not a burden -- it is a practice that eliminates the debugging sessions, emergency hotfixes, and "works on my machine" problems that plague less disciplined codebases.

Key takeaways:

- Every commit passes through local hooks and CI quality gates
- Atomic commits: one logical change per commit
- Immediate push: no unpushed work at session end
- `--no-verify` is absolutely forbidden
- GitLab CI uses simple command lists, not multiline YAML scalars
- Multi-stage Docker builds keep production images minimal

## Practical Implementation

### In Prismatic Platform

The development workflow infrastructure spans these applications:

- **prismatic** (`apps/prismatic/`) -- Central mix tasks including `mix quality.gates`, `mix git_trees`, `mix autoevolve`, and `mix autoheal` that drive the session lifecycle
- **prismatic_claude** (`apps/prismatic_claude/`) -- `PrismaticClaude.SessionLifecycle` (905 lines) manages session hooks and events; `PrismaticClaude.SessionHooks` (522 lines) implements default hook behaviors for session start, pre-command, post-command, and session end phases
- **prismatic_safety** (`apps/prismatic_safety/`) -- Quality DNA persistence in `.claude/quality-dna/current-state.json` tracks metrics across sessions; Quality Floor Guardian monitors enforcement levels
- **prismatic_tooling** (`apps/prismatic_tooling/`) -- Developer tooling including Git Trees (`./scripts/git-trees.sh` and `mix git_trees`) for fast codebase navigation at ~80ms

### Code Examples from the Codebase

Session lifecycle hooks are implemented as OTP GenServer calls:

```elixir
# Session lifecycle triggers (from PrismaticClaude.SessionLifecycle)
SessionLifecycle.trigger(:session_start)   # mix autoheal.baseline && mix autoevolve status
SessionLifecycle.trigger(:pre_command)     # mix quality.gates.check --fast
SessionLifecycle.trigger(:post_command)    # mix autoevolve.scan --quick
SessionLifecycle.trigger(:session_end)     # mix autoheal.cycle && mix autoevolve.mega
```

Git hooks are stored in `.githooks/` and activated via:

```bash
git config core.hooksPath .githooks
# This enables pre-commit, commit-msg, and pre-push hooks
```

## See Also

### Related Applications
- [prismatic_claude](@/apps/prismatic-claude.md) -- Session lifecycle and hook management
- [prismatic_tooling](@/apps/prismatic-tooling.md) -- Git Trees and developer productivity tools
- [prismatic_safety](@/apps/prismatic-safety.md) -- Quality gates and floor guardian

### Glossary
- [Quality DNA](@/glossary/quality-dna.md) -- Persistent quality state tracked across development sessions
- [Quality Gates](@/glossary/quality-gates.md) -- Automated gates that block non-compliant code
- [Clean Run](@/glossary/clean-run.md) -- Zero warnings, zero debug logs
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- Local quality enforcement before commits
- [Session Discipline](@/glossary/session-discipline.md) -- Mandatory protocol for all development sessions
- [CASCADE](@/glossary/cascade.md) -- Systematic defect category elimination
- [Autoevolve](@/glossary/autoevolve.md) -- Autonomous platform evolution system
- [Autoheal](@/glossary/autoheal.md) -- Self-healing infrastructure

### Architecture
- [Telemetry](@/architecture/telemetry.md) -- Session and quality telemetry events

### Related Academy Topics
- [Quality Standards](@/academy/quality-standards.md) -- What the quality gates enforce
- [Self-Evolving Ecosystems](@/academy/evolution-patterns.md) -- How autoevolve and autoheal work
- [The AIAD Standard](@/academy/aiad-standard.md) -- Specifications that CI validates

## Next Steps

- [Building Your First Autonomous Agent](@/academy/first-agent.md) -- put the workflow into practice by building a real component
- [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md) -- deeper understanding of what the quality gates enforce
- [Building LiveView Dashboards](@/academy/liveview-dashboards.md) -- apply the workflow to frontend development

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)