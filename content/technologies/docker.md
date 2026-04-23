+++
title = "Docker"
weight = 50
[extra]
category = "infrastructure"
description = "Container platform for consistent development, testing, and deployment environments"
url = "https://www.docker.com"
version = "25+"
icon = "docker"
color = "blue"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1008
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Docker", "Container", "technologies", "infrastructure", "Prismatic Platform", "BEAM", "Multi"]
tags = ["technologies", "infrastructure", "docker", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Docker - Prismatic Platform"
+++

## Overview

Docker provides containerization for the Prismatic Platform, ensuring consistent environments across development, testing, staging, and production. The platform uses multi-stage Docker builds to create minimal production images that include only the compiled [BEAM](/technologies/beam/) release, significantly reducing attack surface and deployment size. Docker eliminates the environment parity problem that plagues complex multi-service applications by packaging the entire runtime -- from operating system libraries to compiled application code -- into reproducible, immutable containers.

The Prismatic Platform's Docker configuration handles the complexity of building an [Elixir](/technologies/elixir/) umbrella application with 90 apps, native NIF dependencies (including KuzuDB bindings), and multiple service integrations. Multi-stage builds separate compilation (with dev tools, compilers, and build dependencies) from the final runtime image (Alpine Linux with only the BEAM runtime and system libraries), resulting in production images under 100MB despite the platform's scale. This separation ensures that build tools, source code, and development dependencies never appear in production containers.

Docker Compose orchestrates the platform's local development environment, spinning up [PostgreSQL](/technologies/postgresql/), Redis, Meilisearch, KuzuDB, and [Ollama](/technologies/ollama/) alongside the Elixir application for a complete development stack that mirrors production. A single `docker compose up` gives any developer a fully operational platform instance with all dependencies running and properly configured.

## Key Features

Docker provides the containerization foundation that makes the Prismatic Platform's deployment reproducible and environment-agnostic.

- **Multi-Stage Builds**: Separate build and runtime stages, keeping final images minimal (< 100MB) and secure
- **Layer Caching**: Efficient rebuilds by caching dependency layers -- only recompiled when `mix.exs` or `mix.lock` change
- **Compose**: Multi-service orchestration for local development with health checks, dependency ordering, and persistent volumes
- **Health Checks**: Container health monitoring that Fly.io uses for rolling deployments and automatic container replacement
- **Volume Mounts**: Persistent data storage for PostgreSQL, Meilisearch, and Ollama across container restarts
- **Networking**: Service discovery via Docker DNS, allowing containers to reach each other by service name
- **BuildKit**: Parallel layer building and cache mounts for faster CI builds
- **Security Scanning**: Integration with vulnerability scanning tools to audit base images and dependencies

| Build Stage | Contents | Size | Purpose |
|-------------|----------|------|---------|
| `deps` | Mix dependencies, compiled libs | ~800MB | Dependency resolution and compilation |
| `build` | Full application, compiled code | ~1.2GB | Application compilation and release building |
| `runtime` | BEAM release only, Alpine Linux | ~80MB | Production execution, minimal attack surface |

## Platform Integration

Docker packages the platform for consistent deployment across all environments. The Dockerfile uses three stages: dependencies, compilation, and runtime. Each stage is optimized for caching efficiency so that changing application code does not trigger a full dependency rebuild.

```dockerfile
# Stage 1: Dependencies
FROM elixir:1.19-otp-27-alpine AS deps
RUN apk add --no-cache git build-base
WORKDIR /app

ENV MIX_ENV=prod
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/*/
RUN mix deps.get --only prod && mix deps.compile

# Stage 2: Compile application
FROM deps AS build
COPY config config/
COPY apps apps/
COPY priv priv/
RUN mix compile --warnings-as-errors
RUN mix phx.digest
RUN mix release prismatic

# Stage 3: Minimal runtime image
FROM alpine:3.19 AS runtime
RUN apk add --no-cache libstdc++ openssl ncurses-libs
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --from=build /app/_build/prod/rel/prismatic ./
RUN chown -R app:app /app
USER app

ENV PHX_SERVER=true
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["/app/bin/prismatic", "start"]
```

Docker Compose defines the full development stack with service dependencies, health checks, and persistent volumes:

```yaml
# docker-compose.yml
services:
  prismatic:
    build: .
    ports:
      - "4000:4000"
      - "4004:4004"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      meilisearch:
        condition: service_started
    environment:
      - DATABASE_URL=ecto://postgres:postgres@postgres/prismatic_dev
      - REDIS_URL=redis://redis:6379
      - MEILI_URL=http://meilisearch:7700

  postgres:
    image: timescale/timescaledb:latest-pg16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

  meilisearch:
    image: getmeili/meilisearch:v1.6
    volumes:
      - meilidata:/meili_data
    environment:
      MEILI_ENV: development

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollamadata:/root/.ollama

volumes:
  pgdata:
  redisdata:
  meilidata:
  ollamadata:
```

## Architecture

Docker serves as the deployment packaging layer in the platform's infrastructure architecture, bridging the gap between development environments and production deployments.

| Environment | Docker Role | Configuration |
|-------------|-------------|---------------|
| Development | Docker Compose for services | `docker-compose.yml` with volume mounts |
| CI/CD | Build and test container | GitLab CI with Docker-in-Docker |
| Staging | Full container deployment | Fly.io with `fly.toml` configuration |
| Production | Immutable container release | Fly.io with rolling deployments and health checks |

The platform's container architecture follows the principle of immutable infrastructure: production containers are never modified after creation. Any change requires building a new image, pushing it to the registry, and deploying it through the CI/CD pipeline. This approach eliminates configuration drift and ensures every deployment is reproducible.

```
Development Workflow:
  Code Change --> Docker Build (multi-stage) --> Image Registry
                                                      |
  CI/CD Pipeline: Test --> Quality Gates --> Push Image
                                                      |
  Deployment: Fly.io Pull --> Health Check --> Rolling Deploy
                                                      |
  Production: Immutable Container --> Health Monitoring
```

## Performance Characteristics

Docker build and deployment performance is optimized through layer caching, multi-stage builds, and BuildKit features. The platform's build times are designed to keep the CI/CD feedback loop under 10 minutes.

| Operation | Duration | Optimization |
|-----------|----------|-------------|
| Full Docker build (cold) | 8-12 minutes | Multi-stage with dependency caching |
| Incremental build (deps cached) | 2-4 minutes | Only application code recompiled |
| Image push to registry | 30-60 seconds | Layer deduplication |
| Container startup | 3-5 seconds | BEAM runtime initialization |
| Health check response | < 10ms | `/health` endpoint |
| Rolling deployment | 30-60 seconds | Zero-downtime with health gates |
| Production image size | ~80MB | Alpine base, release-only |
| Development compose up | 15-30 seconds | All services with health checks |

## Configuration

The `.dockerignore` file excludes development artifacts, keeping the build context small and preventing secrets from leaking into the image.

```
# .dockerignore
_build/
deps/
.git/
.env*
node_modules/
priv/plts/
*.secret.exs
.claude/
.aiad/
```

Fly.io deployment configuration integrates with Docker for production deployments:

```toml
# fly.toml
app = "prismatic"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[env]
  PHX_HOST = "prismatic-prod.fly.dev"
  PHX_SERVER = "true"

[http_service]
  internal_port = 4000
  force_https = true

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    path = "/health"
    timeout = "5s"
```

## Best Practices

The platform enforces Docker best practices that balance build speed, security, and deployment reliability.

- **Never run as root** -- add a non-root user in the runtime stage for defense-in-depth (the Dockerfile creates an `app` user)
- **Pin base image versions** -- use `alpine:3.19` not `alpine:latest` to ensure reproducible builds across time
- **Use `--warnings-as-errors` in the build stage** -- catch compilation warnings before they reach production
- **Cache dependency layers** -- copy `mix.exs` and `mix.lock` before application code so dependency changes trigger rebuilds independently
- **Add health checks** -- the `HEALTHCHECK` instruction enables orchestrators to detect unhealthy containers and replace them automatically
- **Use `.dockerignore`** -- prevent `.env` files, `.git` history, and build artifacts from inflating the build context or leaking secrets
- **Minimize layers** -- combine related `RUN` commands to reduce image layer count and size
- **Scan images for vulnerabilities** -- integrate image scanning in CI to catch known CVEs in base images and dependencies

## Comparison

Docker was chosen as the platform's containerization technology for its ecosystem maturity, tooling support, and integration with Fly.io deployment infrastructure. The multi-stage build pattern also enables reproducible builds across CI environments, ensuring that the exact same binary artifact is tested in staging and deployed to production.

| Criterion | Docker | Podman | Nix | Direct BEAM Release |
|-----------|--------|--------|-----|-------------------|
| Ecosystem maturity | Excellent | Good | Good | N/A |
| Multi-service orchestration | Compose | Pod concept | Nix shells | Manual |
| CI/CD integration | Universal | Growing | Niche | Build tool specific |
| Image registry support | Universal | Docker-compatible | Nix cache | N/A |
| Fly.io integration | Native | Compatible | Limited | Supported |
| Build reproducibility | Layer caching | Layer caching | Hermetic | Mix release |
| Development experience | Compose up | Similar to Docker | Different paradigm | Native Elixir |

## Related Technologies

- [Elixir](/technologies/elixir/) - Application language compiled inside Docker build stages
- [BEAM](/technologies/beam/) - Runtime included in the production Docker image
- [PostgreSQL](/technologies/postgresql/) - Database container in both development and production stacks
- [Git](/technologies/git/) - Source control triggering Docker builds through CI/CD
- [Erlang/OTP](/technologies/erlang-otp/) - OTP release system (`mix release`) that Docker packages

## Related Apps

- All 90 Prismatic Platform applications are containerized in a single umbrella release Docker image
- [prismatic_api](/apps/prismatic-api/) - API gateway exposed on port 4004 in the container
- [prismatic_web](/apps/prismatic-web/) - Main web application exposed on port 4000 in the container
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Security scanning services running within the containerized environment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)