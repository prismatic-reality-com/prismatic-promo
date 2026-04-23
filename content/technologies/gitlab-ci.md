+++
title = "GitLab CI/CD"
weight = 52
[extra]
category = "infrastructure"
description = "Integrated continuous integration and delivery pipelines for automated testing, quality enforcement, and deployment"
url = "https://docs.gitlab.com/ee/ci/"
version = "16+"
icon = "gitlab"
color = "orange"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 954
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GitLab", "CICD", "Integrated", "technologies", "infrastructure", "Prismatic Platform", "YAML", "Blocking", "Dialyzer", "Reject"]
tags = ["technologies", "infrastructure", "gitlab-ci-cd", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "GitLab CI/CD - Prismatic Platform"
+++

## Overview

GitLab CI/CD is the Prismatic Platform's automation backbone, running all testing, quality enforcement, and deployment pipelines. Every commit triggers a comprehensive pipeline that compiles with zero warnings, runs the full test suite, checks [Credo](/technologies/credo/) and [Dialyzer](/technologies/dialyzer/) compliance, and deploys to [Fly.io](/technologies/flyio/) -- all enforced by the platform's [NO MERCY](/capabilities/no-mercy/) quality doctrine. The pipeline serves as the final automated quality gate between development and production, ensuring that no code reaching the deployment stage has any known quality deficiency.

The Prismatic Platform's GitLab pipeline implements a 9-phase quality gate system: compilation, formatting, Credo analysis, Dialyzer type checking, unit tests, integration tests, security scans, performance benchmarks, and deployment. Every phase must pass before the pipeline proceeds, creating a strict sequential guarantee that later phases can rely on the validation performed by earlier ones. A formatting violation blocks testing; a test failure blocks deployment. There are no overrides, no manual bypasses, and no exceptions.

GitLab's pipeline-as-code approach through `.gitlab-ci.yml` enables the platform to version-control its entire CI/CD configuration alongside the codebase, with merge request pipelines providing pre-merge quality validation. This means the quality enforcement rules themselves are subject to the same review and versioning discipline as the application code.

## Key Features

- **Pipeline as Code**: YAML-defined CI/CD pipelines in version control, reviewed alongside application changes
- **Parallel Jobs**: Run independent pipeline stages concurrently to minimize total pipeline duration
- **Cache/Artifacts**: Efficient dependency caching and build artifact sharing between stages
- **Environments**: Staging and production deployment management with environment-specific variables
- **Merge Request Pipelines**: Pre-merge quality validation that blocks merge until all checks pass
- **Protected Branches**: Deployment restrictions ensuring only the `main` branch can deploy to production
- **Job Templates**: Reusable YAML anchors and `extends` for DRY pipeline definitions
- **Scheduled Pipelines**: Periodic quality sweeps and dependency vulnerability scanning

## Platform Integration

GitLab CI/CD enforces the platform's [quality gates](/capabilities/quality-gates/) on every commit with a multi-stage pipeline that mirrors the local [Git](/technologies/git/) hook enforcement.

```yaml
# .gitlab-ci.yml - Prismatic Platform CI/CD pipeline
image: elixir:1.19-otp-27

stages:
  - compile
  - quality
  - test
  - security
  - deploy

variables:
  MIX_ENV: test
  POSTGRES_DB: prismatic_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  LANG: C.UTF-8

# Dependency cache shared across all stages
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - deps/
    - _build/
    - priv/plts/

compile:
  stage: compile
  script:
    - mix deps.get
    - mix compile --warnings-as-errors --force
  artifacts:
    paths:
      - _build/
      - deps/
    expire_in: 1 hour

format_check:
  stage: quality
  script:
    - mix format --check-formatted
  needs: [compile]

credo:
  stage: quality
  script:
    - mix credo --strict
  needs: [compile]

dialyzer:
  stage: quality
  script:
    - mix dialyzer
  needs: [compile]
  cache:
    key: dialyzer-plt
    paths:
      - priv/plts/

test:
  stage: test
  script:
    - mix test --cover
  services:
    - postgres:16
    - redis:7
  needs: [compile, format_check, credo]
  coverage: '/(\d+\.\d+)% coverage/'

deploy_staging:
  stage: deploy
  script:
    - flyctl deploy --app prismatic-staging --strategy rolling
  only:
    - main
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev

deploy_production:
  stage: deploy
  script:
    - flyctl deploy --app prismatic --strategy rolling
  when: manual
  only:
    - main
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
```

## Architecture

The GitLab CI/CD pipeline architecture enforces a strict phase ordering where each stage validates a different aspect of code quality before allowing progression.

| Stage | Phase | Duration | Gate Type | Failure Response |
|-------|-------|----------|-----------|------------------|
| 1 | Compilation | ~60s | Blocking | Zero warnings tolerance |
| 2 | Format Check | ~10s | Blocking | Reject until formatted |
| 3 | Credo Analysis | ~30s | Blocking | Reject until compliant |
| 4 | Dialyzer | ~120s | Blocking | Reject until type-safe |
| 5 | Unit Tests | ~180s | Blocking | Reject until passing |
| 6 | Integration Tests | ~120s | Blocking | Reject until passing |
| 7 | Security Scan | ~60s | Warning | Alert but continue |
| 8 | Performance Check | ~90s | Blocking | Reject if > 250ms page load |
| 9 | Deployment | ~120s | Manual (prod) | Rollback on failure |

The total pipeline duration is approximately 8-12 minutes, with parallel execution of independent quality checks (format, Credo, and Dialyzer run concurrently in the quality stage).

## Pipeline Configuration Patterns

The platform enforces specific YAML patterns in GitLab CI to avoid the 10-level nesting limit and maintain readability.

| Pattern | Status | Reason |
|---------|--------|--------|
| `- command` | REQUIRED | Simple, clear command execution |
| `- 'cmd; cmd'` | REQUIRED | Multiple commands on one line |
| `- \|` (literal block) | FORBIDDEN | Nesting depth issues |
| `- >-` (folded block) | FORBIDDEN | Nesting depth issues |
| `<< EOF` (heredoc) | FORBIDDEN | Not supported in GitLab YAML |

Complex logic is extracted to shell scripts in the `scripts/` directory rather than embedded in YAML.

```yaml
# CORRECT: Simple commands, complex logic in scripts
security_scan:
  stage: security
  script:
    - ./scripts/security-scan.sh
    - ./scripts/dependency-audit.sh

# FORBIDDEN: Multi-line blocks in YAML
# security_scan:
#   script:
#     - |
#       if [ condition ]; then
#         complex_logic
#       fi
```

## Performance Characteristics

Pipeline performance directly impacts developer productivity. The platform tracks and optimizes CI/CD execution times.

| Metric | Target | Current | Optimization |
|--------|--------|---------|--------------|
| Total pipeline time | < 15 min | ~10 min | Parallel quality stages |
| Compilation stage | < 90s | ~60s | Incremental builds with cache |
| Test stage | < 300s | ~180s | Parallel test execution |
| Dialyzer stage | < 180s | ~120s | PLT caching across builds |
| Deployment stage | < 180s | ~120s | Rolling strategy |
| Cache hit rate | > 90% | ~95% | Branch-based cache keys |
| Artifact transfer | < 30s | ~15s | Scoped artifact paths |

Caching is the most impactful optimization. The `deps/` and `_build/` directories are cached across pipeline runs using the branch name as the cache key, reducing compilation time from minutes to seconds for incremental changes.

## Environment Management

GitLab CI/CD manages the platform's deployment environments with distinct configurations for each stage.

```yaml
# Environment-specific deployment configuration
.deploy_template: &deploy_defaults
  image: flyio/flyctl:latest
  before_script:
    - flyctl auth token "$FLY_API_TOKEN"

deploy_staging:
  <<: *deploy_defaults
  stage: deploy
  script:
    - flyctl deploy --app prismatic-staging --strategy rolling
    - flyctl status --app prismatic-staging
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev
  only:
    - main

deploy_production:
  <<: *deploy_defaults
  stage: deploy
  script:
    - flyctl deploy --app prismatic --strategy rolling
    - flyctl status --app prismatic
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
  when: manual
  only:
    - main
```

| Environment | URL | Deployment | Approval |
|-------------|-----|-----------|----------|
| Development | Local | Manual | None |
| Staging | prismatic-staging.fly.dev | Automatic on main | CI gates |
| Production | prismatic-prod.fly.dev | Manual trigger | Human + CI gates |

## Configuration

Pipeline variables and secrets are managed through GitLab's CI/CD settings, with sensitive values stored as protected or masked variables.

```yaml
# Pipeline variables
variables:
  MIX_ENV: test
  POSTGRES_DB: prismatic_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  ELIXIR_VERSION: "1.19"
  OTP_VERSION: "27"
  FLY_API_TOKEN: $FLY_API_TOKEN    # Protected variable
  GITLAB_TOKEN: $GITLAB_TOKEN       # Protected variable

# Service containers for testing
services:
  - name: postgres:16
    alias: postgres
  - name: redis:7
    alias: redis
  - name: getmeili/meilisearch:v1.6
    alias: meilisearch
```

## Best Practices

- **Keep scripts simple** -- extract complex logic to `scripts/*.sh` files rather than embedding multi-line scripts in YAML
- **Use `needs` for dependency management** -- explicitly declare job dependencies to enable maximum parallelism
- **Cache aggressively** -- cache `deps/`, `_build/`, and PLT files to avoid redundant compilation across pipeline runs
- **Scope artifacts** -- only pass necessary build artifacts between stages to minimize transfer time
- **Use protected variables** -- store API keys, tokens, and deployment credentials as protected masked variables
- **Run merge request pipelines** -- validate every merge request before it reaches the main branch
- **Monitor pipeline duration** -- track total pipeline time and investigate regressions; target under 15 minutes
- **Never skip stages** -- every stage in the pipeline serves a purpose; skipping a quality stage is an L3 violation

## Comparison with Alternatives

| Feature | GitLab CI/CD | GitHub Actions | Jenkins | CircleCI | Buildkite |
|---------|-------------|---------------|---------|----------|-----------|
| Configuration | YAML in repo | YAML in repo | Groovy/UI | YAML in repo | YAML + plugins |
| Built-in Registry | Container + Package | Container + Package | None | None | None |
| Environments | Built-in | Built-in | Plugin | Manual | Manual |
| Merge Pipelines | Native | Workflow dispatch | Plugin | Not native | Not native |
| Self-hosted | Yes (free) | Yes (enterprise) | Yes (primary) | No | Yes (agents) |
| Elixir Support | Native Docker | Native Docker | Plugin | Orb | Docker |
| Secret Management | Built-in | Built-in | Credentials | Contexts | Hooks |

GitLab CI/CD was chosen for the Prismatic Platform because it provides a unified DevOps platform -- issue tracking, code hosting, CI/CD, container registry, and deployment management in a single integrated system.

## Related Technologies

- [Docker](/technologies/docker/) - Container builds and service containers in CI pipeline
- [Fly.io](/technologies/flyio/) - Deployment target for staging and production environments
- [Dialyzer](/technologies/dialyzer/) - Static type checking executed in the quality stage
- [Credo](/technologies/credo/) - Code quality analysis executed in the quality stage
- [Git](/technologies/git/) - Version control triggering pipeline execution
- [PostgreSQL](/technologies/postgresql/) - Service container for test database
- [Redis](/technologies/redis/) - Service container for cache testing
- [Meilisearch](/technologies/meilisearch/) - Service container for search testing

## Related Apps

- All 90 Prismatic Platform applications share the unified CI/CD pipeline
- [prismatic_safety](/apps/prismatic-safety/) - Quality gates enforced by pipeline stages
- [prismatic_web](/apps/prismatic-web/) - Primary deployment target
- [prismatic_api](/apps/prismatic-api/) - API gateway deployment target

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)