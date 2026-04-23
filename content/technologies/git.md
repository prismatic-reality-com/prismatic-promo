+++
title = "Git"
weight = 91
[extra]
category = "tools"
description = "Distributed version control system for tracking source code changes and team collaboration"
url = "https://git-scm.com"
version = "2.43+"
icon = "git"
color = "orange"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 948
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Git", "Distributed", "technologies", "tools", "Prismatic Platform", "Credo"]
tags = ["technologies", "tools", "git", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Git - Prismatic Platform"
+++

## Overview

Git is the version control system managing the entire Prismatic Platform codebase -- over 37,000 files, 2.8 million lines of code, and 90 umbrella applications. Git's distributed architecture enables multiple developers and AI agents to work on different branches simultaneously while maintaining a clean, auditable history of every change. The repository represents one of the most comprehensive Elixir codebases in existence, and Git's performance characteristics are critical for maintaining developer productivity at this scale.

The Prismatic Platform extends Git with custom hooks that enforce quality standards before every commit and push. The pre-commit hook runs formatting checks, [Credo](/technologies/credo/) analysis, compilation with warnings-as-errors, and targeted tests; the commit-msg hook validates conventional commit format; and the pre-push hook runs the full quality gate suite. These hooks are mandatory -- `--no-verify` bypasses are absolutely forbidden by platform policy and constitute an L4 Supreme Review violation under the [NO MERCY](/capabilities/no-mercy/) doctrine.

The platform's `git-trees.sh` script provides optimized codebase exploration using `git ls-tree`, which is approximately 100x faster than `find` or `ls -R` for the platform's 37,000+ file repository, executing in ~80ms versus 500ms+. This optimization is mandated for all platform agents and tools that need to explore the codebase structure.

## Key Features

- **Distributed**: Full repository history on every developer machine, enabling offline work and fast local operations
- **Branching**: Lightweight branches for feature development and experimentation with near-instant creation and switching
- **Hooks**: Pre-commit, commit-msg, and pre-push automation enforcing quality gates at every stage
- **Bisect**: Binary search for regression-introducing commits across the repository's extensive history
- **Worktrees**: Multiple working trees from a single repository for parallel development on different branches
- **Submodules**: Cross-repository dependency management for the GARDEN ecosystem of 22 legacy repositories
- **Conventional Commits**: Enforced commit message format (`type(scope): subject`) for automated changelog generation
- **Signed Commits**: GPG-signed commits for cryptographic verification of authorship

## Platform Integration

Git with custom hooks enforces quality standards on every change. The hook system represents the first line of defense in the platform's multi-layered quality enforcement.

```bash
#!/bin/bash
# .githooks/pre-commit - Prismatic Platform quality enforcement
set -e

echo "=== Pre-commit Quality Gates ==="

# Phase 1: Format check
echo "[1/4] Checking formatting..."
mix format --check-formatted

# Phase 2: Credo analysis
echo "[2/4] Running Credo..."
mix credo --strict --format flycheck

# Phase 3: Compilation with zero warnings
echo "[3/4] Compiling with --warnings-as-errors..."
mix compile --warnings-as-errors

# Phase 4: Template validation (for promo site changes)
if git diff --cached --name-only | grep -q "sites/promo/"; then
  echo "[4/4] Validating promo templates..."
  ./scripts/validate-promo-templates.sh
fi

echo "=== All pre-commit gates passed ==="
```

The Git Trees optimization provides fast codebase exploration that all platform tools must use.

```bash
# Git trees for fast codebase exploration
./scripts/git-trees.sh stats         # ~80ms repository statistics
./scripts/git-trees.sh apps          # List applications with file counts
./scripts/git-trees.sh find "\.ex$"  # Find Elixir files by pattern
./scripts/git-trees.sh recent 20     # 20 most recently modified files
./scripts/git-trees.sh elixir        # All Elixir files only
./scripts/git-trees.sh size          # Largest files in repository
./scripts/git-trees.sh duplicates    # Find duplicate filenames
```

## Architecture

Git occupies the version control layer of the platform's development infrastructure, with hooks providing enforcement of quality gates before changes enter the repository.

| Component | Role | Location |
|-----------|------|----------|
| Repository | Monorepo containing all 90 umbrella apps | `/Users/korczis/dev/prismatic-platform/` |
| Hooks | Quality gate enforcement | `.githooks/` |
| Git Trees | Fast codebase exploration | `scripts/git-trees.sh` and `mix git_trees` |
| Branch Strategy | Feature branches, main-only deploys | `feature/*`, `fix/*`, `main` |
| CI Integration | Pipeline triggers on every push | [GitLab CI/CD](/technologies/gitlab-ci/) |
| GARDEN Repos | 22 legacy knowledge repositories | External, referenced via GARDEN guide |

The repository structure follows the [Elixir](/technologies/elixir/) umbrella convention with all applications under the `apps/` directory, shared configuration at the root, and platform-wide tooling in `scripts/` and `.aiad/`.

## Performance Characteristics

Git performance is critical for the Prismatic Platform due to the repository's size and the frequency of operations performed by both human developers and AI agents.

| Operation | Time | Notes |
|-----------|------|-------|
| `git status` | ~150ms | 37,000+ tracked files |
| `git ls-tree` (git-trees.sh) | ~80ms | Optimized codebase exploration |
| `find` equivalent | ~500ms+ | Traditional approach, 6x slower |
| `git log --oneline -20` | ~10ms | Recent history |
| `git diff HEAD` | ~200ms | Full working tree diff |
| `git checkout branch` | ~300ms | Branch switching |
| `git bisect` (per step) | ~500ms | Compilation + test per step |
| Pre-commit hooks (full) | ~15-30s | Format + Credo + compile |

The Git Trees optimization (`git ls-tree -r --name-only HEAD`) is mandated over `find` for codebase exploration because it reads directly from Git's internal tree objects rather than scanning the filesystem, bypassing `.gitignore` processing and filesystem overhead.

## Hook System

The platform's Git hook system is the enforcement mechanism for the [quality gates](/capabilities/quality-gates/). Every hook is mandatory, and bypass flags are forbidden.

| Hook | Trigger | Enforcement | Bypass Allowed |
|------|---------|-------------|----------------|
| `pre-commit` | Before commit creation | Format, Credo, compilation, template validation | NO |
| `commit-msg` | After message input | Conventional commit format validation | NO |
| `pre-push` | Before push to remote | Full quality gate suite | NO |

```bash
# Hook installation (one-time setup)
git config core.hooksPath .githooks

# Verify hooks are active
git config --get core.hooksPath
# Output: .githooks
```

The commit message hook enforces the Conventional Commits format required by the platform.

```bash
#!/bin/bash
# .githooks/commit-msg - Conventional commit validation
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|chore|ci)\(.+\): .{1,50}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "ERROR: Commit message must follow Conventional Commits format"
  echo "Format: type(scope): subject"
  echo "Types: feat, fix, docs, style, refactor, perf, test, chore, ci"
  exit 1
fi
```

## Configuration

Git configuration for the Prismatic Platform standardizes behavior across all developers and CI environments.

```bash
# Git configuration for Prismatic Platform
git config core.hooksPath .githooks          # Custom hooks directory
git config commit.gpgSign true               # Signed commits
git config pull.rebase true                  # Rebase on pull (no merge commits)
git config branch.autoSetupRebase always     # Auto-rebase for new branches
git config diff.algorithm histogram          # Better diff algorithm for large files
git config core.fsmonitor true               # Filesystem monitor for faster status
git config feature.manyFiles true            # Optimizations for large repositories
```

The `.gitignore` is carefully maintained to exclude build artifacts, dependencies, and sensitive files while tracking all source code, configuration, and documentation.

## Best Practices

- **Never use `--no-verify`** -- bypassing hooks is an L4 violation under the NO MERCY doctrine; if hooks fail, fix the underlying issue
- **Use conventional commits** -- format `type(scope): subject` with types: feat, fix, docs, style, refactor, perf, test, chore, ci
- **Commit atomically** -- one logical change per commit; do not batch unrelated changes
- **Push frequently** -- unpushed commits at session end are an L2 violation; push after every successful commit
- **Use Git Trees** -- always use `./scripts/git-trees.sh` or `mix git_trees` instead of `find` or `ls -R` for codebase exploration
- **Rebase over merge** -- keep the history linear; the `pull.rebase true` configuration enforces this
- **Sign commits** -- GPG signatures verify authorship; AI-generated commits include the `Co-Authored-By` footer
- **Branch naming** -- use `feature/description` for features and `fix/description` for bug fixes; keep branches short-lived

## Comparison with Alternatives

| Feature | Git | Mercurial | SVN | Perforce |
|---------|-----|-----------|-----|----------|
| Distribution | Fully distributed | Fully distributed | Centralized | Centralized |
| Branching Cost | Near-zero | Near-zero | Copy-based | Stream-based |
| Large Repo Support | Good (with optimizations) | Good | Moderate | Excellent |
| Hook System | Pre/post hooks | Extensions | Pre/post hooks | Triggers |
| Elixir Tooling | Excellent | Limited | None | None |
| CI/CD Integration | Universal | Limited | Limited | P4 plugins |
| Community | Dominant | Niche | Legacy | Enterprise |

Git is the universal standard for version control in the Elixir ecosystem, with native support from [Hex](/technologies/mix/) (package manager), [GitLab CI/CD](/technologies/gitlab-ci/), and all development tools. The platform's monorepo approach also ensures that cross-application refactoring can be performed atomically in a single commit, maintaining consistency across the entire umbrella.

## Related Technologies

- [GitLab CI/CD](/technologies/gitlab-ci/) - CI/CD pipeline integration triggered by Git events
- [Docker](/technologies/docker/) - Containerized builds from Git repository
- [Credo](/technologies/credo/) - Code quality analysis enforced via Git hooks
- [Dialyzer](/technologies/dialyzer/) - Static type analysis enforced via Git hooks
- [Mix](/technologies/mix/) - Build tool invoked by Git hooks for compilation and testing

## Related Apps

- All 90 Prismatic Platform applications are managed in a single Git monorepo
- [prismatic_safety](/apps/prismatic-safety/) - Quality Floor Guardian enforced through Git hooks
- [prismatic_claude](/apps/prismatic-claude/) - Session lifecycle integrated with Git commit tracking

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)