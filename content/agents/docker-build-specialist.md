+++
title = "docker-build-specialist"
weight = 139
[extra]
domain = "infrastructure"
level = "L3"
description = "Container image optimization and multi-stage build expert with security scanning"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["docker-build-specialist", "Container", "agents", "agent", "Prismatic Platform", "BEAM", "Build", "Elixir", "Dockerfile"]
tags = ["agents", "agent", "docker-build-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "docker-build-specialist - Prismatic Platform"
+++

## Overview

The [Docker](/glossary/docker/) Build Specialist operates as an L3 strategic command agent within the Infrastructure domain of the Prismatic Platform. This agent provides deep expertise in container image optimization, multi-stage build pipeline design, build cache management, security scanning, and production image hardening. In a platform that deploys 90 [umbrella application](/glossary/umbrella-application/)s as containerized [Elixir](/glossary/elixir/) releases to [Fly.io](/glossary/fly-io/) edge infrastructure, container image quality directly impacts deployment speed, runtime performance, security posture, and infrastructure costs.

The agent operates within the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard and follows the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. For container builds, this means zero tolerance for bloated images, unnecessary runtime dependencies, exposed build artifacts, or unscanned vulnerabilities. Every container image the platform produces must be minimal, secure, reproducible, and optimized for the [BEAM](/glossary/beam/) runtime's specific requirements.

The Prismatic Platform's Dockerfile implements a multi-stage build that separates compilation concerns from runtime requirements. The build stage includes Erlang/[OTP](/glossary/otp/), [Elixir](/glossary/elixir/), Node.js (for asset compilation), and all build-time dependencies. The runtime stage contains only the compiled release, its runtime dependencies, and the minimal operating system packages required for BEAM operation. The Docker Build Specialist ensures this separation is maintained correctly, that build caches are leveraged effectively, and that the resulting production images meet size, security, and performance targets.

## Operational Domain

The Infrastructure domain encompasses agents responsible for the platform's deployment infrastructure, monitoring systems, and operational tooling. The Docker Build Specialist focuses specifically on the containerization layer -- the translation of source code and configuration into deployable container images. This specialization sits between the development pipeline (which produces tested source code) and the deployment pipeline (which places container images onto infrastructure).

Container build optimization has cascading effects across the platform. Smaller images deploy faster, reducing deployment window duration. Well-layered images improve cache hit rates, reducing build times from minutes to seconds for incremental changes. Secure images reduce the attack surface exposed in production. The specialist's work amplifies the effectiveness of every deployment operation.

## Key Capabilities

The Docker Build Specialist provides six core capabilities addressing the complete container image lifecycle.

**Multi-stage build optimization** designs and maintains Dockerfile configurations that implement clean separation between build-time and runtime dependencies. The specialist ensures that build stages include only the tools needed for compilation and that runtime stages include only the artifacts needed for execution. For the Prismatic Platform, this means the build stage includes Erlang, Elixir, Node.js, and npm packages, while the runtime stage contains only the compiled OTP release and minimal OS packages.

**Build cache management** optimizes Docker layer ordering and COPY instructions to maximize build cache utilization. The specialist structures Dockerfiles so that frequently changing layers (application source code) appear after infrequently changing layers (OS packages, Elixir dependencies). This ordering ensures that dependency installation layers are cached across builds, reducing typical build times from 5+ minutes to under 60 seconds for source-only changes.

**Image size minimization** applies multiple techniques to reduce final image size: Alpine-based runtime images, multi-stage builds that exclude build tools, selective COPY instructions that include only release artifacts, and strip operations that remove debug symbols from compiled binaries. The specialist targets production images under 100MB, significantly below the multi-gigabyte images that naive Dockerfiles produce.

**Security scanning and hardening** integrates container vulnerability scanning into the build pipeline, detecting known CVEs in base images and installed packages before images enter the deployment pipeline. Hardening measures include non-root execution, read-only filesystem configuration where possible, minimal capability sets, and network exposure reduction through explicit port declarations.

**BEAM runtime optimization** configures container environments specifically for the BEAM virtual machine's operational requirements. This includes appropriate memory allocation settings (the BEAM manages its own memory allocation), scheduler configuration (matching BEAM schedulers to available CPU cores), and I/O thread configuration. The specialist ensures that containerized BEAM processes run with the same efficiency as bare-metal deployments.

**Reproducible builds** ensures that container builds produce identical images from identical inputs, regardless of build environment. This includes pinning base image digests (not just tags), locking dependency versions through mix.lock and package-lock.json, and using deterministic build flags that eliminate timestamps and other non-deterministic artifacts from the build output.

## Dockerfile Architecture

The platform's Dockerfile follows a three-stage pattern optimized for Elixir umbrella applications.

```
Stage 1: Build Environment (elixir:1.19-otp-27-alpine)
  |-- Install build dependencies (gcc, make, git)
  |-- Copy mix.exs, mix.lock (cache dependency installation)
  |-- Install Hex + Rebar dependencies
  |-- Copy application source code
  |-- Compile release with MIX_ENV=prod
  |-- Build and digest static assets

Stage 2: Asset Compilation (node:20-alpine)
  |-- Install npm dependencies
  |-- Compile TailwindCSS
  |-- Minify JavaScript bundles
  |-- Copy digested assets to release

Stage 3: Runtime (alpine:3.19)
  |-- Install runtime-only packages (libstdc++, openssl, ncurses)
  |-- Copy compiled release from build stage
  |-- Configure non-root user
  |-- Set BEAM runtime environment variables
  |-- Define health check endpoint
  |-- Expose application port
```

## Image Quality Metrics

The Docker Build Specialist tracks container image quality through quantitative metrics.

| Metric | Target | Description |
|--------|--------|-------------|
| Production image size | < 100MB | Final runtime image size excluding build artifacts |
| Build time (cache hit) | < 60s | Incremental build with dependency cache |
| Build time (cold) | < 5min | Full build without cache |
| CVE count (critical) | 0 | No critical vulnerabilities in production image |
| CVE count (high) | 0 | No high-severity vulnerabilities |
| Layer count | < 15 | Minimal layer count for efficient distribution |
| Startup time | < 5s | Container start to health check pass |

## Security Scanning Pipeline

Container security scanning operates as a mandatory gate in the build pipeline.

| Scan Type | Tool | Timing | Action on Finding |
|-----------|------|--------|-------------------|
| Base image CVE | Trivy | Pre-build | Block if critical/high CVEs |
| Dependency CVE | mix audit | During build | Block if known vulnerabilities |
| Runtime CVE | Trivy | Post-build | Block if critical/high CVEs |
| Secret detection | Gitleaks | Pre-build | Block if secrets detected |
| Configuration audit | Hadolint | Pre-build | Warn on Dockerfile anti-patterns |

## Authority Level

**L3** - Strategic Command - The Docker Build Specialist operates at the strategic command level with authority to mandate build pipeline standards, reject Dockerfile changes that degrade image quality, and coordinate with deployment agents on container image requirements.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [PostgreSQL](/glossary/postgresql/) | Runtime dependency | Database client libraries included in runtime image |
| [Fly.io](/glossary/fly-io/) | Deployment target | Container images deployed to Fly.io machine fleet |
| Docker Registry | Image storage | Versioned image storage and distribution |
| GitLab CI/CD | Build automation | Automated image builds triggered by CI pipeline |
| [Elixir](/glossary/elixir/) Release | Build output | OTP release artifacts packaged into container |
| TailwindCSS | Asset pipeline | CSS compilation integrated into build stages |

## Build Environment Management

The specialist maintains build environment configurations that ensure consistent builds across developer machines and CI infrastructure. Build environment parity prevents "works on my machine" failures and ensures that CI-built images are identical to locally tested images.

| Environment | Base Image | Cache Strategy | Use Case |
|-------------|-----------|---------------|----------|
| Local development | docker-compose | Volume-mounted source, persistent deps cache | Development iteration |
| CI/CD | GitLab Runner | Layer cache across pipeline runs | Automated builds |
| Production release | Multi-stage | Registry-cached intermediate layers | Deployment images |

## Enforcement

The Docker Build Specialist operates under [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Production images must pass all security scans before deployment. Image size regressions trigger investigation and correction. Dockerfile changes undergo review for cache efficiency, security implications, and size impact. No build artifact, debug tool, or development dependency is permitted in production images. Non-root execution is mandatory for all production containers.

## Related Agents

- [**devops-deployment-specialist**](/agents/devops-deployment-specialist/) (L2) - Deployment orchestration consuming built container images
- [**aiad-deployment-engine**](/agents/aiad-deployment-engine/) (L4) - Core deployment engine with formal verification
- [**aiad-verification-engine**](/agents/aiad-verification-engine/) (L4) - Build artifact verification and validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)