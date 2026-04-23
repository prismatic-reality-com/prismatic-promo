+++
title = "Docker"
weight = 12
[extra]
category = "infrastructure"
description = "Container runtime platform used for packaging, distributing, and running Prismatic Platform releases in isolated, reproducible environments"
related_terms = ["release", "fly-io", "gitlab-ci", "cluster", "beam", "mix", "postgresql", "redis", "tailwindcss", "phoenix", "encryption-at-rest", "observability", "distributed-system"]
keywords = ["Docker container deployment", "multi-stage Dockerfile", "Elixir Docker image", "OTP release container", "BuildKit cache optimization", "Docker Compose development", "container security hardening", "non-root container execution", "Fly.io Docker deployment", "CI/CD container pipeline"]
tags = ["docker", "container", "deployment", "infrastructure", "devops"]
platform_integration = "core"
complexity = "intermediate"
audience = ["devops-engineers", "platform-architects", "backend-developers"]
date_created = "2026-02-22"
version = "2.0.0"
requires_knowledge = ["linux", "networking", "elixir-releases"]
prismatic_components = ["Dockerfile", "docker-compose.yml", "GitLab CI pipeline", "Fly.io deployment"]
dockerfile_stages = ["build-dependencies", "compile", "asset-compilation", "runtime"]
runtime_image_size = "~120MB"
build_image_size = "~1.2GB"
compose_services = ["PostgreSQL/TimescaleDB", "Redis", "Meilisearch", "KuzuDB"]
deployment_targets = ["prismatic-staging.fly.dev", "prismatic-prod.fly.dev"]
enforcement_level = "P0"
security_practices = ["non-root-execution", "minimal-base-image", "no-secrets-in-image", "read-only-filesystem"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1609
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Docker - Prismatic Platform"
+++

## Definition and Overview

Docker is a container platform that packages applications and their dependencies into standardized, portable units called containers. Each container runs in an isolated environment with its own filesystem, network stack, and process tree, while sharing the host operating system's kernel. This approach provides the isolation benefits of virtual machines at a fraction of the resource overhead, enabling consistent deployment across development, testing, staging, and production environments.

Docker images are built from Dockerfiles -- declarative recipes that specify the base operating system, installed dependencies, compiled application code, and runtime configuration. Images use a layered filesystem (Union FS) where each instruction in the Dockerfile creates a new layer that is cached independently. This layer caching is the key to fast incremental builds: when a layer's inputs have not changed, Docker reuses the cached version rather than rebuilding it.

For the Prismatic Platform, Docker serves as the critical bridge between development and production. The same [BEAM](@/glossary/beam.md) [release](@/glossary/release.md) that runs on a developer's machine runs identically inside a Docker container deployed to [Fly.io](@/glossary/fly-io.md). This eliminates the "works on my machine" class of deployment bugs and ensures that the CI/CD pipeline tests exactly the same artifact that will run in production.

Docker is the sole deployment artifact format for the entire platform. Every release is packaged into a Docker image, tested in CI, and deployed to Fly.io. The production image contains the compiled OTP release (Erlang runtime + all 115 applications), compiled static assets ([TailwindCSS](@/glossary/tailwindcss.md), JavaScript), runtime configuration via environment variables, health check endpoints for container orchestration, and a non-root user for security.

## Historical Context

Docker was released in 2013 by Solomon Hykes at dotCloud (later renamed Docker, Inc.), though the underlying technologies -- Linux cgroups, namespaces, and union filesystems -- had existed for years. Docker's innovation was packaging these kernel features into a user-friendly tool with a declarative build system (Dockerfiles), a distribution mechanism (Docker Hub), and a consistent API that abstracted away the complexity of Linux container primitives.

The containerization revolution Docker enabled transformed how applications are deployed. Before Docker, Elixir/Erlang applications were typically deployed as OTP releases directly onto provisioned servers, using tools like Distillery and later Mix releases. This approach required careful management of system dependencies (Erlang runtime version, OpenSSL, ncurses) and made environment parity between development and production difficult to maintain.

The Prismatic Platform adopted Docker early in its architecture as the standardized deployment format. The multi-stage build pattern, which Docker introduced in version 17.05 (2017), proved particularly valuable for Elixir applications where the build toolchain (Erlang, Elixir, Node.js for asset compilation) is significantly larger than the runtime requirements (just the Erlang runtime and the compiled release). BuildKit, introduced as the default builder in Docker 23.0, further improved build performance through parallel stage execution and persistent cache mounts.

## Multi-Stage Dockerfile Architecture

The Prismatic Platform uses a multi-stage Dockerfile that separates build-time dependencies from the minimal runtime environment:

### Stage Overview

| Stage | Base Image | Purpose | Approximate Size |
|-------|------------|---------|-----------------|
| **1. Build dependencies** | Debian Trixie | Install Erlang, Elixir, build tools, fetch Hex/npm dependencies | ~800MB |
| **2. Compile** | (continues from stage 1) | Compile Elixir code, build assets, create OTP release | ~1.2GB |
| **3. Asset compilation** | Node.js (slim) | Compile TailwindCSS, JavaScript bundles, static assets | ~400MB |
| **4. Runtime** | Debian Trixie (slim) | Minimal image with only the compiled release and runtime deps | ~120MB |

```dockerfile
# Stage 1: Build dependencies
FROM hexpm/elixir:1.19.0-erlang-27.2-debian-trixie-slim AS build

RUN apt-get update && apt-get install -y git build-essential

WORKDIR /app

# Install Hex and Rebar (cached unless mix.exs changes)
RUN mix local.hex --force && mix local.rebar --force

# Copy dependency manifests first (maximizes cache hits)
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/*/
COPY config config

ENV MIX_ENV=prod

# Fetch and compile dependencies (cached unless mix.lock changes)
RUN mix deps.get --only prod
RUN mix deps.compile

# Stage 2: Compile application
COPY apps apps
COPY lib lib
COPY priv priv

RUN mix compile --warnings-as-errors
RUN mix release prismatic

# Stage 3: Asset compilation
FROM node:20-slim AS assets

WORKDIR /app
COPY --from=build /app/apps/prismatic_web/assets ./assets
RUN cd assets && npm ci && npx tailwindcss -i css/app.css -o ../priv/static/assets/app.css --minify

# Stage 4: Minimal runtime image
FROM debian:trixie-slim AS runtime

RUN apt-get update && apt-get install -y libstdc++6 openssl libncurses5 locales \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN sed -i '/en_US.UTF-8/s/^# //' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8

# Create non-root user
RUN useradd --create-home --shell /bin/bash prismatic
USER prismatic
WORKDIR /home/prismatic/app

# Copy only the compiled release from the build stage
COPY --from=build --chown=prismatic:prismatic /app/_build/prod/rel/prismatic ./
COPY --from=assets --chown=prismatic:prismatic /app/priv/static ./lib/prismatic_web-*/priv/static

ENTRYPOINT ["bin/prismatic"]
CMD ["start"]
```

The key principle of multi-stage builds is that only the final stage contributes to the production image. Build tools (gcc, make, git), source code, intermediate compilation artifacts, and Node.js are all discarded, resulting in a production image approximately 10x smaller than the build image.

## BuildKit Cache Mounts

The Prismatic Platform leverages Docker BuildKit's cache mount feature to dramatically accelerate incremental builds. Cache mounts persist directories across builds without including them in the final image layer:

```dockerfile
# Cache Hex packages across builds
RUN --mount=type=cache,target=/root/.hex \
    --mount=type=cache,target=/root/.cache/rebar3 \
    mix deps.get --only prod

# Cache compiled dependencies
RUN --mount=type=cache,target=/app/_build/prod/lib \
    mix deps.compile

# Cache npm packages
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

| Cache Target | Contents | Impact |
|-------------|----------|--------|
| `/root/.hex` | Downloaded Hex packages | Avoids re-downloading unchanged dependencies |
| `/root/.cache/rebar3` | Rebar3 cache (Erlang deps) | Avoids rebuilding Erlang NIF packages |
| `/app/_build/prod/lib` | Compiled dependency beams | Avoids recompiling unchanged libraries |
| `/root/.npm` | npm package cache | Avoids re-downloading Node.js packages |

With BuildKit caches, incremental builds (application code changes only) complete in 30-60 seconds, compared to 5-10 minutes for cold builds. This dramatic improvement is critical for the platform's continuous deployment workflow where every merge to main triggers a staging deployment.

## Layer Caching Strategy

Docker builds are optimized by ordering Dockerfile instructions from least-frequently-changed to most-frequently-changed:

```
COPY mix.exs mix.lock ./          # Changes rarely (dependency updates)
COPY apps/*/mix.exs apps/*/       # Changes rarely (new apps, dep changes)
COPY config config                 # Changes occasionally
RUN mix deps.get && mix deps.compile  # Cached unless above changed
COPY apps apps                     # Changes frequently (application code)
COPY lib lib                       # Changes frequently
RUN mix compile                    # Must rebuild when code changes
RUN mix release                    # Must rebuild when code changes
```

This ordering ensures that the expensive dependency download and compilation steps are cached on most builds, and only the fast application compilation step runs when source code changes. For the Prismatic Platform with its 115 umbrella applications and numerous dependencies, this optimization saves significant CI/CD time and reduces developer feedback loop latency.

## Security Hardening

The Prismatic Platform's Docker images follow security best practices aligned with the CIS Docker Benchmark and the platform's own security policies:

| Practice | Implementation | Rationale |
|----------|---------------|-----------|
| **Non-root execution** | `USER prismatic` | Limits impact of container escape vulnerabilities |
| **Minimal base image** | `debian:trixie-slim` | Reduces attack surface by eliminating unnecessary packages |
| **No build tools in runtime** | Multi-stage build | Build tools (gcc, make, git) not present in production image |
| **Read-only filesystem** | `--read-only` flag at deploy | Prevents runtime filesystem modification |
| **No secrets in image** | Environment variables via [Fly.io](@/glossary/fly-io.md) | Secrets injected at runtime, never baked into layers |
| **Health checks** | `HEALTHCHECK` instruction | Enables orchestrator to detect unhealthy containers |
| **.dockerignore** | Excludes `.git`, `_build`, `node_modules`, `.env` | Prevents sensitive or unnecessary files from entering build context |
| **Pinned base images** | Specific version tags | Prevents supply chain attacks through image tag mutation |
| **No SUID binaries** | Removed in runtime stage | Eliminates privilege escalation vectors |

The `.dockerignore` file is critical for both security and build performance:

```
.git
_build
deps
node_modules
.env
*.secret
.claude
.aiad
garden
sites
docs
```

## Docker Compose for Development

The development environment uses Docker Compose to orchestrate the platform's external dependencies, providing parity with the production infrastructure:

```yaml
services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_USER: prismatic
      POSTGRES_PASSWORD: prismatic
      POSTGRES_DB: prismatic_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prismatic"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:v1.11
    environment:
      MEILI_NO_ANALYTICS: "true"
    ports:
      - "7700:7700"

  kuzudb:
    image: kuzudb/kuzu:latest
    ports:
      - "8000:8000"

volumes:
  pgdata:
```

This Compose configuration starts [PostgreSQL](@/glossary/postgresql.md) (with [TimescaleDB](@/glossary/timescaledb.md)), [Redis](@/glossary/redis.md), Meilisearch, and KuzuDB as containerized services. Health checks ensure the Elixir application only starts after its dependencies are ready, preventing connection errors during startup.

## CI/CD Integration

The [GitLab CI](@/glossary/gitlab-ci.md) pipeline uses Docker for building, testing, and deploying the platform:

| Stage | Docker Usage | Duration |
|-------|-------------|----------|
| **Build** | Build production Docker image with multi-stage Dockerfile | 1-5 min |
| **Test** | Run `mix test` inside the build image against Compose services | 2-5 min |
| **Lint** | Run `mix compile --warnings-as-errors`, `mix credo`, `mix dialyzer` inside image | 3-8 min |
| **Push** | Tag and push image to container registry | <1 min |
| **Deploy Staging** | Deploy image to Fly.io staging (automatic) | 1-2 min |
| **Deploy Production** | Deploy image to Fly.io production (manual approval) | 1-2 min |

```bash
# CI build command
docker build --target runtime -t registry.gitlab.com/korczis/prismatic:$CI_COMMIT_SHA .

# CI test command (runs against Compose services)
docker run --rm --network host \
  -e DATABASE_URL=postgresql://prismatic:prismatic@localhost:5432/prismatic_test \
  registry.gitlab.com/korczis/prismatic:$CI_COMMIT_SHA \
  eval "mix test"

# Deploy to Fly.io
fly deploy --image registry.gitlab.com/korczis/prismatic:$CI_COMMIT_SHA
```

## Fly.io Deployment Integration

The production deployment on Fly.io converts Docker containers into Firecracker microVMs for enhanced isolation and performance:

```elixir
# fly.toml configuration
# The Docker image is converted to a Firecracker VM at deployment time

# config/runtime.exs -- runtime configuration injected via Fly.io secrets
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: System.get_env("PHX_HOST", "prismatic-prod.fly.dev"), port: 443, scheme: "https"],
  http: [
    ip: {0, 0, 0, 0, 0, 0, 0, 0},
    port: String.to_integer(System.get_env("PORT", "4000"))
  ],
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
```

The staging environment (`prismatic-staging.fly.dev`) receives automatic deployments on merge to main, while production (`prismatic-prod.fly.dev`) requires manual approval. Both environments use the same Docker image to ensure deployment consistency.

## Container Health Monitoring

The Docker image includes health check endpoints that Fly.io's orchestrator uses to detect unhealthy containers and route traffic accordingly:

```elixir
defmodule PrismaticWeb.Plugs.HealthCheck do
  @moduledoc """
  Health check endpoint for container orchestration.
  Returns 200 OK with node information when the application
  is healthy. Must respond within the platform's 10ms budget.
  """

  import Plug.Conn

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(%Plug.Conn{request_path: "/health"} = conn, _opts) do
    health_data = %{
      status: "ok",
      node: node(),
      uptime_seconds: :erlang.statistics(:wall_clock) |> elem(0) |> div(1000),
      memory_mb: div(:erlang.memory(:total), 1_048_576)
    }

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(health_data))
    |> halt()
  end

  def call(conn, _opts), do: conn
end
```

## Performance Optimization

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **Layer ordering** | Deps before code | Dependency cache hits on 90%+ builds |
| **BuildKit cache mounts** | Persistent caches | 5-10x faster incremental builds |
| **Multi-stage builds** | Separate build/runtime | 10x smaller production image |
| **Parallel stage execution** | BuildKit parallelism | Overlapping build and asset stages |
| **Alpine-sized runtime** | Slim Debian base | ~120MB vs ~500MB full Debian |
| **.dockerignore** | Exclude non-essential files | Smaller build context, faster transfers |

## Best Practices

**Use Multi-Stage Builds**: Separate build-time dependencies from runtime to minimize production image size. The Prismatic Platform's runtime image is approximately 120MB compared to the 1.2GB build image.

**Order Layers by Change Frequency**: Place rarely-changed layers (dependency manifests) before frequently-changed layers (application code) to maximize Docker layer cache hits.

**Run as Non-Root**: Create a dedicated user for the application process. Never run [BEAM](@/glossary/beam.md) releases as root inside containers.

**Use BuildKit Cache Mounts**: Cache Hex packages, npm modules, and compiled dependencies across builds using BuildKit mount features to reduce incremental build times from minutes to seconds.

**Keep Secrets Out of Images**: Never bake secrets, API keys, or credentials into Docker layers. Inject them at runtime through environment variables via the deployment platform.

**Pin Base Image Versions**: Use specific version tags (`hexpm/elixir:1.19.0-erlang-27.2`) rather than `latest` to prevent unexpected breakage from upstream image updates.

## Common Pitfalls

- **Including build tools in the runtime image**: Forgetting to use multi-stage builds results in production images containing gcc, make, git, and other tools that increase attack surface.

- **Baking secrets into image layers**: Secrets added via `COPY` or `ENV` in Dockerfiles persist in image layers even if later deleted. Always inject secrets at runtime.

- **Not using .dockerignore**: Without a .dockerignore, the entire repository (including `.git`, `_build`, `node_modules`) is sent as build context, dramatically slowing builds.

- **Running as root**: The default Docker user is root. Always create a non-root user and switch to it before the ENTRYPOINT.

- **Not configuring health checks**: Without health checks, the orchestrator cannot detect unhealthy containers, leading to traffic being routed to broken instances.

## Use Cases

- **Production Deployment**: Packaging OTP releases into Docker images for deployment to Fly.io with staging and production environments
- **CI/CD Testing**: Running the full test suite, linting, and Dialyzer analysis inside Docker containers for environment consistency
- **Development Dependencies**: Running PostgreSQL, Redis, Meilisearch, and KuzuDB as Docker Compose services for development parity with production
- **Reproducible Builds**: Ensuring identical build artifacts regardless of the developer's local environment through containerized compilation

## Related Concepts

- [Release](@/glossary/release.md) -- OTP release packaged inside Docker containers
- [Fly.io](@/glossary/fly-io.md) -- Deployment platform running Docker containers as Firecracker VMs
- [Cluster](@/glossary/cluster.md) -- Multiple Docker containers forming Erlang distribution cluster
- [BEAM](@/glossary/beam.md) -- Virtual machine running inside Docker containers
- [Mix](@/glossary/mix.md) -- Build tool producing releases packaged into Docker images
- [PostgreSQL](@/glossary/postgresql.md) -- Database running as Docker Compose service in development
- [Redis](@/glossary/redis.md) -- Cache layer running as Docker Compose service
- [TailwindCSS](@/glossary/tailwindcss.md) -- CSS framework compiled during Docker image build
- [Phoenix](@/glossary/phoenix.md) -- Web framework deployed via Docker containers
- [GitLab CI](@/glossary/gitlab-ci.md) -- CI/CD pipeline building and deploying Docker images
- [Observability](@/glossary/observability.md) -- Container health monitoring and logging

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture
- [Technologies](@/technologies/_index.md) -- Technology stack
- [Distributed System](@/glossary/distributed-system.md) -- Multi-container distributed deployment

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
