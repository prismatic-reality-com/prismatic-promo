+++
title = "The 18-Pillar Doctrine: Building Self-Enforcing Software Quality"
date = 2026-03-01
description = "How Prismatic Platform enforces quality through 18 complementary pillars covering architecture, testing, security, performance, and documentation -- all validated automatically at every commit."

[extra]
author = "Tomas Korcak (korczis)"
category = "architecture"
tags = ["doctrine", "quality", "enforcement", "pre-commit", "ci-cd", "architecture"]
reading_time = "12 min"
keywords = ["software quality enforcement", "automated quality gates", "18-pillar doctrine", "pre-commit hooks", "CI/CD quality", "Elixir code quality"]
image = "/images/blog/18-pillar-doctrine.png"
word_count = 2100
date_created = "2026-03-01"
date_modified = "2026-03-01"
quality_score = 88
see_also = ["quality-gate", "quality-gates", "zero-tolerance", "no-mercy-no-doubts", "aiad"]
image_alt = "The 18-Pillar Doctrine: Building Self-Enforcing Software Quality - Prismatic Platform"
+++

Quality in software is either enforced or aspirational. Aspirational quality erodes under deadline pressure. Enforced quality compounds. This post describes how Prismatic Platform achieves consistent quality across 94 umbrella applications through 18 complementary enforcement pillars.

## The Problem with Manual Quality

Most engineering teams rely on code review and tribal knowledge to maintain quality. This breaks down at scale:

- **Knowledge silos** -- new contributors don't know the conventions
- **Review fatigue** -- reviewers miss patterns after the 50th file
- **Inconsistency** -- different reviewers enforce different standards
- **Drift** -- conventions evolve but codebases don't update retroactively

The solution is to encode quality rules as automated checks that run at every commit.

## The 18 Pillars

Prismatic's doctrine is organized into 18 pillars, each targeting a specific quality dimension:

| Pillar | Code | Domain | Enforcement |
|--------|------|--------|-------------|
| Three Nested Loops | 3NL | Architecture | Conceptual |
| No Mercy No Doubts | NMND | Execution | Pre-commit |
| No Way Back | NWB | Permanence | CI |
| Flowbite LLM | FLLM | CSS Hygiene | Pre-commit |
| Max 5 Minutes | M5M | Time Discipline | CI |
| No Claim Left Behind | NCLB | Evidence | CI |
| Total Assurance | TACH | Testing | Pre-commit |
| Zero Errors | ZERO | Runtime Safety | Pre-commit |
| Performance Fence | PERF | Performance | Pre-commit |
| Security Lock | SEAL | Security | Pre-commit |
| Dependency Hygiene | DEPS | Dependencies | Pre-commit |
| Documentation Standard | DOCS | Documentation | Pre-commit |
| Observability Layer | OTEL | Telemetry | CI |
| Traceability Linkage | GITL | Git Practices | CI |
| Knowledge Coverage | KNOW | Learning | CI |
| README Enforcement | RDME | Documentation | Pre-commit |
| No Link Left Behind | NLLB | Link Integrity | CI |
| Repository Hygiene | HYGIENE | Cleanliness | Pre-commit |

The pillars divide into three enforcement tiers:

1. **Pre-commit blocking** (9 pillars) -- prevents violations from entering the repository
2. **CI enforcement** (17 pillars) -- validates the full doctrine in continuous integration
3. **Advisory** -- tracks metrics without blocking

## How Pre-Commit Enforcement Works

Every `git commit` triggers a series of validation checks:

```bash
# ZERO: Scan for banned patterns
grep -rn "String.to_atom" staged_files  # Blocks atom table exhaustion

# SEAL: Scan for hardcoded secrets
grep -rn "api_key.*=.*\"sk-" staged_files  # Blocks credential leaks

# PERF: Scan for performance anti-patterns
grep -rn "length(.*)==.*0" staged_files  # Blocks O(n) emptiness checks

# TACH: Verify test file existence
# For every changed lib/*.ex, ensure test/*_test.exs exists

# DOCS: Verify documentation
# Changed modules must have @moduledoc and @doc

# DEPS: Verify dependency hygiene
# No overrides without justification comments

# RDME: Verify README existence
# Every umbrella app must have README.md
```

These checks run in under 2 seconds and catch the most common violations before they reach the repository.

## ZERO: Runtime Safety

The ZERO pillar prevents three categories of runtime crashes:

**Atom table exhaustion**: Erlang's atom table is finite (1,048,576 atoms by default). Converting untrusted strings to atoms with `String.to_atom/1` can exhaust this table, crashing the entire VM.

```elixir
# Banned
String.to_atom(user_input)

# Required
String.to_existing_atom(user_input)
```

**Silent error swallowing**: Bare rescue blocks hide the root cause of failures, making debugging impossible.

```elixir
# Banned
rescue _ -> :error

# Required -- catch specific exceptions
rescue e in [Ecto.NoResultsError] ->
  Logger.warning("Record not found: #{inspect(e)}")
  {:error, :not_found}
```

**Unsafe deserialization**: `binary_to_term/1` without the `:safe` option can create atoms from untrusted data.

```elixir
# Banned
:erlang.binary_to_term(data)

# Required
:erlang.binary_to_term(data, [:safe])
```

## PERF: Performance Gates

The PERF pillar catches three anti-patterns that cause production performance issues:

**O(n) emptiness checks**: `length/1` traverses the entire list to count elements. Checking `length(list) == 0` is O(n) when `list == []` is O(1).

**Unbounded queries**: `Repo.all(query)` without a `limit` clause can return millions of rows, consuming all available memory.

**N+1 queries**: Iterating over a collection and making a database query for each element generates N+1 queries instead of a single batch query.

## TACH: Testing Doctrine

The TACH pillar ensures that every module has corresponding test coverage:

- Every `lib/*.ex` file must have a `test/*_test.exs` file
- Pure modules (validators, parsers) should use property-based testing with ExUnitProperties
- Cross-app modules should have integration tests tagged with `@tag :integration`
- LiveView changes should have E2E tests tagged with `@tag :e2e`

The pre-commit hook blocks commits that add or modify library code without corresponding test files.

## SEAL: Security Enforcement

The SEAL pillar prevents three classes of security vulnerabilities:

- **SQL injection** via string interpolation in Ecto fragments
- **Hardcoded secrets** in source code (API keys, passwords, tokens)
- **Code injection** via `Code.eval_string/1` with untrusted input

## Real-World Impact

Since deploying the 18-pillar doctrine, Prismatic has achieved:

- Zero atom table exhaustion incidents in production
- Zero SQL injection vulnerabilities in security audits
- Consistent test coverage across all 94 umbrella apps
- Documentation coverage for all public modules
- Sub-250ms page load times enforced by PERF gates

The doctrine is not about perfection -- it is about preventing the classes of defects that cause production incidents. Each pillar was added in response to a real incident or a category of bugs that consumed engineering time.

## Building Your Own Doctrine

The approach generalizes to any codebase:

1. **Identify recurring defect categories** -- what types of bugs consume the most engineering time?
2. **Encode rules as automated checks** -- grep patterns, AST analysis, or custom mix tasks
3. **Start with pre-commit blocking** -- fast checks that catch violations before they enter the repository
4. **Add CI enforcement** -- slower, more comprehensive checks that run in the pipeline
5. **Track metrics over time** -- measure the reduction in defect categories

The key insight is that quality enforcement must be automated and non-bypassable. Any check that can be skipped with `--no-verify` will be skipped under pressure.

## Conclusion

Eighteen pillars may sound like overkill. In practice, each pillar targets a specific failure mode that we encountered in production or during development. The overhead is minimal -- pre-commit checks run in under 2 seconds -- while the protection is comprehensive.

Quality is a system property, not an individual discipline. The 18-pillar doctrine makes quality a property of the development process itself, not something that depends on any individual's vigilance.

---

*Explore the full doctrine at [Architecture Documentation](/architecture/) or try the [Quality Gates command](/developers/) to validate your own code against the doctrine.*
