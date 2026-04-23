+++
title = "Containerization"
weight = 50
[extra]
description = "Packaging applications with their dependencies into isolated, portable containers for consistent deployment across environments, enabling reproducible builds and infrastructure-as-code practices."
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "deployment-and-infrastructure"
related_concepts = ["docker", "deployment", "blue-green-deployment", "fly-io", "continuous-deployment", "microservices", "infrastructure"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 6
prerequisites = ["docker", "deployment", "continuous-integration"]
learning_path = ["docker", "containerization", "blue-green-deployment", "fly-io", "continuous-deployment"]
interactive_demos = ["/labs/glossary/containerization"]
code_examples = ["Dockerfile multi-stage build", "Docker Compose orchestration", "Release configuration"]
external_resources = ["https://docs.docker.com/get-started/", "https://fly.io/docs/elixir/", "https://hexdocs.pm/mix/Mix.Tasks.Release.html"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["container build verification", "image size optimization", "security scan baseline", "deployment rollback", "health check validation"]
keywords = ["container", "docker", "deployment", "isolation", "portable", "multi-stage build", "alpine", "non-root", "OCI", "image"]
tags = ["glossary", "infrastructure", "docker", "deployment", "devops", "containers"]
related_terms = ["docker", "deployment", "blue-green-deployment", "fly-io", "continuous-deployment", "continuous-integration", "microservices", "production-environment", "release", "releases-elixir"]
word_count = 1879
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Containerization - Prismatic Platform"
+++

## Definition

Containerization is the practice of packaging an application together with its entire runtime environment -- operating system libraries, language runtimes, compiled artifacts, configuration files, and system dependencies -- into a single, self-contained unit called a container. Unlike virtual machines, which emulate entire hardware stacks, containers share the host operating system's kernel and isolate only the user space, achieving near-native performance with minimal overhead.

The fundamental guarantee of containerization is environmental consistency: a container that works on a developer's laptop will behave identically on a CI server, a staging environment, and a production cluster. This eliminates the "works on my machine" class of bugs by making the environment itself a versioned, reproducible artifact.

Containers are defined by a specification (most commonly the Open Container Initiative, or OCI, standard) and built from declarative configuration files (Dockerfiles). The resulting container images are immutable -- once built, they cannot be modified, only replaced by new images. This immutability provides auditability, rollback capability, and defense against configuration drift.

## Overview

Containerization emerged from decades of operating system research into process isolation. Unix chroot (1979) provided filesystem isolation. FreeBSD jails (2000) added process and network isolation. Linux namespaces (2002) and cgroups (2006) provided the kernel primitives that Docker (2013) packaged into an accessible developer experience. The OCI standard (2015) formalized the container image and runtime specifications, enabling an ecosystem of compatible tools.

The technology fundamentally changed how software is built, shipped, and operated. Before containers, deployment involved provisioning servers, installing dependencies, managing version conflicts, and maintaining complex configuration management systems (Puppet, Chef, Ansible). Each environment (development, staging, production) was a unique snowflake that drifted from its intended state over time. Containers replaced this fragile process with a single artifact that encapsulates the complete runtime environment.

For Elixir/OTP applications specifically, containerization interacts with the BEAM virtual machine in important ways. The BEAM provides its own process isolation, fault tolerance, and hot code reloading -- capabilities that overlap with container orchestration features. Understanding where BEAM responsibilities end and container responsibilities begin is essential for building effective Elixir deployments.

### Container Lifecycle

```
Dockerfile ─────> docker build ─────> Image (immutable) ─────> Container (running)
  (recipe)           (bake)           (artifact)                 (instance)
                                          |
                                          v
                                    Registry (store)
                                          |
                                          v
                                    docker pull ──> Container (running)
```

The lifecycle separates concerns: the Dockerfile defines what goes into the image, the build process creates the artifact, the registry distributes it, and the runtime instantiates it. Each stage has its own optimization strategies and failure modes.

## Technical Details

### Image Layer Architecture

Container images are composed of layers, each representing a filesystem change from the previous layer. Layers are content-addressable (identified by their SHA256 hash) and shared across images. This layer architecture has profound implications for build performance and image size.

```
┌─────────────────────────────────┐
│  Application code + config      │  Layer 5: COPY + CMD (changes often)
├─────────────────────────────────┤
│  Compiled release               │  Layer 4: mix release (changes on code change)
├─────────────────────────────────┤
│  Dependencies (compiled)        │  Layer 3: mix deps.compile (changes on dep change)
├─────────────────────────────────┤
│  Dependencies (fetched)         │  Layer 2: mix deps.get (changes on mix.lock change)
├─────────────────────────────────┤
│  Base image (Elixir + Erlang)   │  Layer 1: FROM hexpm/elixir (changes rarely)
├─────────────────────────────────┤
│  OS base (Alpine Linux)         │  Layer 0: Base OS (changes very rarely)
└─────────────────────────────────┘
```

Ordering Dockerfile instructions from least-frequently-changing to most-frequently-changing maximizes cache reuse. A code change only invalidates layer 4 and above; a dependency change invalidates layer 2 and above. Without this ordering, every code change would rebuild dependencies from scratch.

### Multi-Stage Builds

Multi-stage builds solve the tension between build-time requirements and runtime requirements. Building an Elixir release requires the Elixir compiler, Erlang/OTP, Hex, and potentially Node.js for asset compilation. Running the release requires only the Erlang/OTP runtime and system libraries. Multi-stage builds use a large builder image for compilation and copy only the compiled artifacts into a minimal runtime image.

```dockerfile
# ============================================================
# Stage 1: Build (large image with all build tools)
# ============================================================
FROM hexpm/elixir:1.19.0-erlang-27.2-alpine-3.21.2 AS builder

RUN apk add --no-cache build-base git

WORKDIR /app

ENV MIX_ENV=prod

# Install Hex and Rebar (changes rarely)
RUN mix local.hex --force && mix local.rebar --force

# Copy dependency manifests first (cache optimization)
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/*/

# Fetch and compile dependencies
RUN mix deps.get --only prod
RUN mix deps.compile

# Copy application source
COPY . .

# Compile and build release
RUN mix compile --warnings-as-errors
RUN mix release prismatic

# ============================================================
# Stage 2: Runtime (minimal image with only release artifacts)
# ============================================================
FROM alpine:3.21.2 AS runtime

RUN apk add --no-cache \
    libstdc++ \
    openssl \
    ncurses-libs \
    ca-certificates \
    curl

# Security: non-root user
RUN addgroup -S prismatic && adduser -S prismatic -G prismatic

WORKDIR /app

# Copy only the compiled release from builder
COPY --from=builder --chown=prismatic:prismatic /app/_build/prod/rel/prismatic ./

USER prismatic

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

EXPOSE 4000

ENTRYPOINT ["bin/prismatic"]
CMD ["start"]
```

### Image Size Optimization

Image size directly affects deployment speed, registry storage costs, and attack surface. Smaller images have fewer packages, fewer potential vulnerabilities, and faster pull times.

| Base Image | Size | Use Case | Security Profile |
|-----------|------|----------|-----------------|
| `ubuntu:24.04` | ~78 MB | Development, debugging | Large attack surface |
| `debian:bookworm-slim` | ~52 MB | Production (glibc apps) | Moderate attack surface |
| `alpine:3.21` | ~7 MB | Production (musl-compatible) | Minimal attack surface |
| `distroless/base` | ~20 MB | Production (no shell) | Extremely minimal |
| `scratch` | 0 MB | Static binaries only | Zero attack surface |

The Prismatic Platform uses Alpine Linux as the runtime base because Erlang/OTP releases are compatible with musl libc and the ~7 MB base provides an excellent size-to-functionality ratio. The builder stage uses the full `hexpm/elixir` Alpine variant for compilation tooling.

### Security Hardening

Container security follows the principle of least privilege: grant only the minimum capabilities required for the application to function.

```elixir
defmodule PrismaticDeploy.ContainerSecurity do
  @moduledoc """
  Container security configuration and validation.
  Enforces non-root execution, read-only filesystem, and minimal capabilities.
  """

  @type security_config :: %{
          user: String.t(),
          read_only_rootfs: boolean(),
          no_new_privileges: boolean(),
          dropped_capabilities: [String.t()],
          allowed_capabilities: [String.t()]
        }

  @spec default_security_config() :: security_config()
  def default_security_config do
    %{
      user: "prismatic",
      read_only_rootfs: true,
      no_new_privileges: true,
      dropped_capabilities: ["ALL"],
      allowed_capabilities: []
    }
  end

  @spec validate_config(security_config()) :: {:ok, security_config()} | {:error, [String.t()]}
  def validate_config(config) do
    violations =
      []
      |> check_non_root(config)
      |> check_read_only(config)
      |> check_no_new_privileges(config)
      |> check_capabilities(config)

    case violations do
      [] -> {:ok, config}
      errors -> {:error, errors}
    end
  end

  @spec check_non_root([String.t()], security_config()) :: [String.t()]
  defp check_non_root(violations, %{user: "root"}), do: ["Container must not run as root" | violations]
  defp check_non_root(violations, %{user: "0"}), do: ["Container must not run as UID 0" | violations]
  defp check_non_root(violations, _config), do: violations

  @spec check_read_only([String.t()], security_config()) :: [String.t()]
  defp check_read_only(violations, %{read_only_rootfs: false}) do
    ["Root filesystem should be read-only" | violations]
  end
  defp check_read_only(violations, _config), do: violations

  @spec check_no_new_privileges([String.t()], security_config()) :: [String.t()]
  defp check_no_new_privileges(violations, %{no_new_privileges: false}) do
    ["no-new-privileges must be enabled" | violations]
  end
  defp check_no_new_privileges(violations, _config), do: violations

  @spec check_capabilities([String.t()], security_config()) :: [String.t()]
  defp check_capabilities(violations, %{dropped_capabilities: caps}) do
    if "ALL" in caps, do: violations, else: ["All capabilities should be dropped" | violations]
  end
end
```

### Elixir Release Integration

Elixir releases (`mix release`) produce self-contained packages that include the Erlang runtime, compiled BEAM bytecode, and startup scripts. This aligns perfectly with containerization because the release is a single artifact that requires no build tools at runtime.

```elixir
defmodule PrismaticDeploy.ReleaseConfig do
  @moduledoc """
  Release configuration for containerized deployment.
  Handles runtime configuration, health checks, and clustering.
  """

  @spec runtime_config() :: keyword()
  def runtime_config do
    [
      database_url: fetch_env!("DATABASE_URL"),
      secret_key_base: fetch_env!("SECRET_KEY_BASE"),
      port: fetch_env("PORT", "4000") |> String.to_integer(),
      host: fetch_env!("PHX_HOST"),
      pool_size: fetch_env("POOL_SIZE", "10") |> String.to_integer(),
      cluster_enabled: fetch_env("CLUSTER_ENABLED", "false") == "true"
    ]
  end

  @spec fetch_env!(String.t()) :: String.t()
  defp fetch_env!(key) do
    System.get_env(key) ||
      raise """
      Environment variable #{key} is missing.
      Ensure it is set in the container environment.
      """
  end

  @spec fetch_env(String.t(), String.t()) :: String.t()
  defp fetch_env(key, default), do: System.get_env(key) || default

  @spec health_check() :: {:ok, map()} | {:error, term()}
  def health_check do
    checks = %{
      database: check_database(),
      disk_space: check_disk_space(),
      memory: check_memory(),
      beam_processes: check_beam_processes()
    }

    if Enum.all?(checks, fn {_k, v} -> v == :ok end) do
      {:ok, checks}
    else
      {:error, checks}
    end
  end

  defp check_database do
    case Ecto.Adapters.SQL.query(Prismatic.Repo, "SELECT 1", []) do
      {:ok, _} -> :ok
      {:error, _} -> :degraded
    end
  end

  defp check_disk_space do
    case :disksup.get_disk_data() do
      [_ | _] = disks ->
        if Enum.all?(disks, fn {_mount, _size, percent} -> percent < 90 end), do: :ok, else: :warning
      _ -> :unknown
    end
  end

  defp check_memory do
    memory = :erlang.memory(:total)
    max_memory = 512 * 1024 * 1024

    if memory < max_memory, do: :ok, else: :warning
  end

  defp check_beam_processes do
    process_count = :erlang.system_info(:process_count)
    process_limit = :erlang.system_info(:process_limit)

    if process_count < process_limit * 0.8, do: :ok, else: :warning
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform's containerization strategy follows the principles outlined in the platform's CLAUDE.md: Alpine images, multi-stage builds, non-root execution, and `.dockerignore` for build context optimization.

### Build Pipeline

The platform's [GitLab CI](/glossary/gitlab-ci/) pipeline builds container images on every push to the main branch. The pipeline stages ensure that only code passing all [quality gates](/glossary/quality-gates/) is containerized.

| Stage | Action | Gate |
|-------|--------|------|
| **compile** | `mix compile --warnings-as-errors` | Zero warnings |
| **test** | `mix test --cover` | 100% pass rate |
| **quality** | `mix quality.gates` | All domains passing |
| **credo** | `mix credo --strict` | Zero violations |
| **dialyzer** | `mix dialyzer` | Zero violations |
| **build** | `docker build --target runtime` | Image builds successfully |
| **scan** | `trivy image prismatic:latest` | No critical/high CVEs |
| **push** | Push to container registry | All gates passed |

### Deployment on Fly.io

The platform deploys to [Fly.io](/glossary/fly-io/), which provides container-native hosting with edge computing, automatic TLS, and multi-region deployment. Fly.io uses the container image directly, adding its own init system for process management and networking.

The deployment configuration in `fly.toml` maps container configuration to Fly.io's infrastructure:

| Container Concern | Fly.io Equivalent |
|-------------------|-------------------|
| `EXPOSE 4000` | `[[services]]` with internal port 4000 |
| Health check endpoint | `[[services.tcp_checks]]` or `[[services.http_checks]]` |
| Environment variables | `fly secrets set` (encrypted at rest) |
| Volume mounts | `[[mounts]]` for persistent storage |
| Scaling | `fly scale count` for horizontal, `fly scale vm` for vertical |

### Development-Production Parity

Docker Compose provides the development environment, ensuring that developers work against the same service topology as production:

| Service | Development | Production |
|---------|-------------|------------|
| PostgreSQL | `postgres:16-alpine` container | Fly.io managed Postgres |
| Redis | `redis:7-alpine` container | Fly.io managed Redis |
| Meilisearch | `getmeili/meilisearch` container | Fly.io managed instance |
| Application | `mix phx.server` (hot reload) | Container with compiled release |

The key difference is that development runs the application code directly (for hot reloading) while production runs the compiled release inside a container. This is an acceptable deviation because the container build process is tested in CI on every push.

## Comparison with Alternatives

### Containers vs. Virtual Machines

| Dimension | Containers | Virtual Machines |
|-----------|-----------|-----------------|
| **Isolation level** | Process/namespace isolation (shared kernel) | Full hardware virtualization (separate kernel) |
| **Startup time** | Milliseconds to seconds | Seconds to minutes |
| **Resource overhead** | ~10-50 MB per container | ~512 MB - 2 GB per VM |
| **Image size** | 10-500 MB typical | 1-20 GB typical |
| **Density** | Hundreds per host | Tens per host |
| **Security boundary** | Weaker (shared kernel) | Stronger (separate kernel) |
| **Use case** | Application packaging, microservices | Multi-tenant isolation, legacy OS support |

### Containers vs. BEAM Releases (No Container)

For Elixir applications, a legitimate alternative to containerization is deploying bare BEAM releases directly to VMs or bare metal. The BEAM provides its own process isolation, fault tolerance, and clustering capabilities.

| Dimension | Containerized Release | Bare BEAM Release |
|-----------|----------------------|-------------------|
| **Environment consistency** | Guaranteed by image immutability | Depends on host configuration |
| **Hot code upgrade** | Difficult (container replacement model) | Native BEAM capability |
| **Clustering** | Requires service discovery (libcluster) | Can use native Erlang distribution |
| **Resource isolation** | Kernel namespaces + cgroups | BEAM schedulers + process limits |
| **Operational complexity** | Higher (container runtime required) | Lower (just the release) |
| **Ecosystem compatibility** | Works with any orchestrator | Erlang-specific tooling only |

The Prismatic Platform chose containerization because the 115-application umbrella includes services beyond Elixir (PostgreSQL, Redis, Meilisearch, KuzuDB) that require unified deployment tooling.

### Docker vs. Podman vs. containerd

| Tool | Daemon | Rootless | OCI Compliant | Ecosystem |
|------|--------|----------|---------------|-----------|
| Docker | dockerd (daemon) | Yes (recent) | Yes | Largest (Docker Hub, Compose, Swarm) |
| Podman | Daemonless | Yes (native) | Yes | Growing (compatible with Docker CLI) |
| containerd | Low-level runtime | N/A (runtime) | Yes | Kubernetes default runtime |

## Best Practices

**Use multi-stage builds unconditionally**. There is no valid reason to ship build tools in a production image. Multi-stage builds separate compilation from execution, reducing image size by 60-90% and eliminating an entire class of attack surface.

**Pin base image versions explicitly**. `FROM alpine:3.21.2`, not `FROM alpine:latest`. Floating tags make builds non-reproducible. A base image update could introduce breaking changes or vulnerabilities without any application code change.

**Order Dockerfile layers by change frequency**. System dependencies first, application dependencies second, application code last. This maximizes Docker's build cache and reduces build times from minutes to seconds for code-only changes.

**Never run containers as root**. Create a dedicated user and group in the Dockerfile. Use `USER` directive before the `ENTRYPOINT`. This limits the blast radius of container escape vulnerabilities.

**Implement health checks**. The `HEALTHCHECK` directive tells the orchestrator how to determine if the container is functioning correctly. Without health checks, a container that has deadlocked or lost database connectivity will continue receiving traffic.

**Use `.dockerignore` aggressively**. Exclude `_build/`, `deps/`, `.git/`, `node_modules/`, test fixtures, and documentation from the build context. Large build contexts slow down builds and can accidentally include sensitive files.

## Common Pitfalls

**Including the entire build context in the image**. Without `.dockerignore`, Docker sends the entire working directory (potentially gigabytes of Git history, node_modules, and build artifacts) to the daemon, dramatically slowing builds.

**Running as root in production**. The default Docker user is root. If an attacker exploits a vulnerability in the containerized application, they gain root access inside the container, which is one step from host compromise on misconfigured systems.

**Using `latest` tags in production**. `latest` is mutable -- it points to whatever was most recently pushed. A production deployment that uses `latest` can receive a completely different image on each pull, making rollbacks impossible and debugging nightmare.

**Ignoring container image scanning**. Container images inherit vulnerabilities from their base images and installed packages. Without scanning (Trivy, Grype, Snyk), known CVEs in base image packages go undetected until exploited.

**Copying secrets into images**. Secrets (API keys, database passwords, TLS certificates) baked into an image are visible to anyone with access to the image. Use environment variables, mounted secrets, or secret management systems instead.

**Neglecting layer optimization**. Running `apt-get update && apt-get install` in separate `RUN` instructions creates an outdated package index layer that never gets refreshed. Combine related operations into single `RUN` instructions and clean up package caches.

## Use Cases

### Prismatic Platform Deployment

The 115-application umbrella is compiled into a single Elixir release, packaged into a container, and deployed to [Fly.io](/glossary/fly-io/). The container includes the compiled BEAM bytecode, Erlang/OTP runtime, and static assets. Database migrations run as a container entrypoint script before the application starts.

### CI/CD Pipeline Isolation

Each CI pipeline stage runs in its own container, ensuring that test environments are clean and reproducible. The [continuous integration](/glossary/continuous-integration/) pipeline uses containerized services (PostgreSQL, Redis) that are created fresh for each pipeline run, eliminating test pollution.

### Local Development Environment

Docker Compose orchestrates the platform's service dependencies for local development. Developers run `docker compose up` to start PostgreSQL, Redis, Meilisearch, and KuzuDB, then run the Elixir application directly on the host for hot code reloading. This hybrid approach combines the convenience of native development with the consistency of containerized services.

### Security Scanning and EASM

The [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM system uses containerized scanning tools to assess external attack surfaces. Each scan runs in an isolated container with network access restricted to the target, preventing lateral movement if a scanning tool is compromised.

## Related Concepts

- [Docker](/glossary/docker/) -- The dominant container runtime and the platform's primary containerization tool
- [Blue-Green Deployment](/glossary/blue-green-deployment/) -- Zero-downtime deployment strategy enabled by container immutability
- [Fly.io](/glossary/fly-io/) -- Container-native hosting platform used for Prismatic Platform deployment
- [Continuous Deployment](/glossary/continuous-deployment/) -- Automated deployment pipeline that produces and ships container images
- [Continuous Integration](/glossary/continuous-integration/) -- Pipeline that builds and validates container images before deployment
- [Release](/glossary/release/) -- Elixir release mechanism that produces the artifact packaged into containers
- [Microservices](/glossary/microservices/) -- Architecture pattern where each service runs in its own container
- [GitLab CI](/glossary/gitlab-ci/) -- CI/CD system that orchestrates container builds and deployments
- [Production Environment](/glossary/production-environment/) -- The target environment where containerized applications run
- [Quality Gates](/glossary/quality-gates/) -- Automated checks that must pass before container images are built
- [Fault Tolerance](/glossary/fault-tolerance/) -- System property enhanced by container isolation and orchestration

## See Also

- [Architecture](/architecture/) -- Platform deployment architecture
- [Capabilities](/capabilities/) -- Infrastructure capabilities enabled by containerization
- [Technologies](/technologies/) -- Technology stack including Docker, Fly.io, Alpine Linux

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
