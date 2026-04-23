+++
title = "Fly.io"
weight = 51
[extra]
category = "infrastructure"
description = "Global application deployment platform with edge computing, automatic TLS, and Elixir-native clustering"
url = "https://fly.io"
version = "Latest"
icon = "flyio"
color = "purple"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1011
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Flyio", "Global", "Elixir-native", "technologies", "infrastructure", "Prismatic Platform", "BEAM", "Pass"]
tags = ["technologies", "infrastructure", "flyio", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Fly.io - Prismatic Platform"
+++

## Overview

Fly.io is the deployment platform for the Prismatic Platform's production and staging environments. It provides globally distributed application hosting with automatic TLS, private networking, and native support for [BEAM](/technologies/beam/) clustering -- enabling the platform to run distributed [Elixir](/technologies/elixir/) nodes across multiple regions with transparent inter-node communication. Fly.io was selected specifically for its first-class Elixir and BEAM support, which eliminates the infrastructure complexity that other platforms require for distributed Erlang clustering.

The Prismatic Platform runs on Fly.io at `prismatic-prod.fly.dev` (production) and `prismatic-staging.fly.dev` (staging). Fly's support for BEAM distribution means the platform's [Erlang/OTP](/technologies/erlang-otp/) applications can form clusters across regions, sharing agent state and real-time events through Distributed Erlang with zero additional infrastructure. This is a significant architectural advantage: features like [Phoenix PubSub](/technologies/pubsub/) broadcasting, distributed [ETS](/technologies/ets/) replication, and global process registration work natively across Fly.io machines without requiring external message brokers or service meshes.

Fly.io's Machines API enables the platform to scale dynamically -- spinning up additional compute for intensive security scanning operations and scaling down during quiet periods, optimizing cost while maintaining responsiveness. The auto-start and auto-stop capabilities mean the platform pays only for active compute, with machines hibernating during periods of inactivity and waking within seconds when requests arrive.

## Key Features

- **BEAM Clustering**: Native Distributed Erlang support across regions via WireGuard-encrypted 6PN private networking
- **Global Distribution**: Deploy to 30+ regions worldwide with automatic request routing to the nearest healthy instance
- **Automatic TLS**: Free SSL certificates with automatic renewal via Let's Encrypt, supporting custom domains
- **Private Networking**: WireGuard-encrypted inter-machine communication on the `fly.internal` DNS domain
- **Machines API**: Programmatic VM management for auto-scaling with sub-second start times for pre-built images
- **Volume Storage**: Persistent NVMe-backed storage volumes for database files and application state
- **Health Checks**: HTTP, TCP, and script-based health checks with automatic machine replacement on failure
- **Secrets Management**: Encrypted environment variable storage accessible only to application machines

## Platform Integration

Fly.io hosts the platform with BEAM-native clustering, enabling distributed [GenServer](/technologies/genserver/) processes to communicate transparently across machines.

```elixir
defmodule PrismaticWeb.Release do
  @moduledoc """
  Release configuration for Fly.io deployment with BEAM clustering.
  """

  def start do
    # Connect to other Fly.io machines for clustering
    topologies = [
      fly6pn: [
        strategy: Cluster.Strategy.DNSPoll,
        config: [
          polling_interval: 5_000,
          query: System.get_env("FLY_APP_NAME") <> ".internal",
          node_basename: System.get_env("FLY_APP_NAME")
        ]
      ]
    ]

    {:ok, _} = Supervisor.start_link(
      [{Cluster.Supervisor, [topologies, [name: Prismatic.ClusterSupervisor]]}],
      strategy: :one_for_one
    )
  end

  def migrate do
    for repo <- Application.fetch_env!(:prismatic, :ecto_repos) do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end
end
```

The clustering configuration uses DNS polling on the `.internal` domain that Fly.io provides for all machines in an application. Every 5 seconds, the cluster supervisor queries DNS for peer machines and establishes Distributed Erlang connections to any new nodes.

## Architecture

Fly.io provides the entire production infrastructure stack for the Prismatic Platform, from edge routing to persistent storage.

| Layer | Fly.io Component | Platform Usage |
|-------|-----------------|----------------|
| Edge | Anycast routing | Global request distribution to nearest region |
| TLS | Automatic certificates | HTTPS termination with TLSv1.3 |
| Proxy | Fly Proxy | HTTP/2, WebSocket upgrade, connection pooling |
| Compute | Fly Machines | [Phoenix](/technologies/phoenix/) application instances |
| Networking | 6PN (WireGuard) | BEAM cluster communication, inter-service calls |
| Storage | Fly Volumes | [PostgreSQL](/technologies/postgresql/) data, [KuzuDB](/technologies/kuzudb/) graph files |
| DNS | `.fly.dev` | Public hostname, internal service discovery |
| Secrets | Encrypted vault | API keys, database credentials, signing keys |

The deployment topology places the primary application in the `fra` (Frankfurt) region, with the ability to add read replicas and edge workers in additional regions as traffic demands. Frankfurt was chosen for its proximity to the Czech Republic, where the platform's primary users and OSINT data sources are located.

## Performance Characteristics

Fly.io's infrastructure meets the platform's strict performance requirements enforced by the [quality gates](/capabilities/quality-gates/).

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| Cold start time | < 5s | ~3s | Pass |
| Warm request latency (fra) | < 50ms | ~15ms | Pass |
| WebSocket connection setup | < 100ms | ~40ms | Pass |
| Inter-node message latency | < 10ms | ~2ms (same region) | Pass |
| Machine wake time (auto-start) | < 3s | ~1.5s | Pass |
| TLS handshake | < 100ms | ~30ms | Pass |
| Volume I/O (NVMe) | > 100 MB/s | ~400 MB/s | Pass |

These measurements are collected through the platform's [telemetry](/capabilities/telemetry-integration/) system and validated against the requirement that all pages load under 250ms.

## Configuration

The `fly.toml` configuration file defines the deployment topology, scaling behavior, and health checks for the Prismatic Platform.

```toml
# fly.toml - Production deployment configuration
app = "prismatic"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[env]
  PHX_HOST = "prismatic-prod.fly.dev"
  PORT = "8080"
  RELEASE_COOKIE = "prismatic-cluster-cookie"
  ERL_AFLAGS = "-proto_dist inet6_tcp"
  ECTO_IPV6 = "true"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[[vm]]
  size = "shared-cpu-2x"
  memory = "1gb"
```

The configuration enforces HTTPS, sets up auto-scaling with at minimum one machine always running, and configures health checks that verify the Phoenix application is responding. The `ERL_AFLAGS` setting enables IPv6 for Distributed Erlang, which is required for Fly.io's 6PN private networking.

## Deployment Pipeline

Deployments to Fly.io are automated through the [GitLab CI/CD](/technologies/gitlab-ci/) pipeline. The deployment process follows a blue-green strategy where the new version is deployed alongside the existing one, and traffic is shifted only after health checks pass.

```yaml
# GitLab CI deployment stage
deploy_staging:
  stage: deploy
  script:
    - flyctl deploy --app prismatic-staging --strategy rolling
    - flyctl status --app prismatic-staging
  only:
    - main
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev

deploy_production:
  stage: deploy
  script:
    - flyctl deploy --app prismatic --strategy rolling
    - flyctl status --app prismatic
  when: manual
  only:
    - main
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
```

Production deployments require manual approval to ensure that a human reviews the changes before they reach the live system. Staging deployments happen automatically on every merge to main.

## Best Practices

- **Use DNS-based clustering** -- the `Cluster.Strategy.DNSPoll` strategy is the most reliable for Fly.io's 6PN networking; avoid `libcluster` strategies that rely on Kubernetes or AWS APIs
- **Set `min_machines_running = 1`** -- ensures at least one machine is always warm, preventing cold-start latency for the first request after an idle period
- **Configure `ERL_AFLAGS` for IPv6** -- Fly.io's internal networking uses IPv6; without this flag, Distributed Erlang connections fail silently
- **Use volumes for database storage** -- Fly volumes provide persistent NVMe storage that survives machine restarts; never rely on the ephemeral filesystem for stateful data
- **Run migrations in release commands** -- use `fly deploy --strategy rolling` with a release command that runs `PrismaticWeb.Release.migrate()` before the application starts
- **Monitor with `flyctl status`** -- regularly check machine health and resource usage to identify scaling needs before they become performance problems

## Comparison with Alternatives

| Feature | Fly.io | AWS ECS | Heroku | Railway | Render |
|---------|--------|---------|--------|---------|--------|
| BEAM Clustering | Native | Manual VPC setup | Not supported | Not supported | Not supported |
| Global Distribution | 30+ regions | 25+ regions | 2 regions | Limited | Limited |
| Auto-scaling | Machine-level | Task-level | Dyno-level | Instance-level | Instance-level |
| Cold Start | ~3s | ~30s (Fargate) | ~5s | ~5s | ~10s |
| WebSocket Support | Native | Via ALB | Supported | Supported | Supported |
| Persistent Storage | NVMe volumes | EBS | None (add-on) | None | Disk |
| Pricing Model | Per-machine-second | Per-vCPU-hour | Per-dyno-hour | Per-usage | Per-instance |
| Elixir Support | First-class | Generic | Buildpack | Nixpack | Buildpack |

Fly.io was chosen because it is the only platform that provides native BEAM clustering support without requiring custom networking infrastructure, making it the natural deployment target for a distributed Elixir application. The WireGuard-encrypted private network also eliminates the need for application-level encryption between cluster nodes, reducing operational complexity.

## Related Technologies

- [Docker](/technologies/docker/) - Container builds for Fly.io deployment images
- [GitLab CI/CD](/technologies/gitlab-ci/) - Automated deployment pipeline to Fly.io
- [Nginx](/technologies/nginx/) - Edge routing complement for advanced proxy configurations
- [PostgreSQL](/technologies/postgresql/) - Database hosted on Fly.io volumes
- [BEAM](/technologies/beam/) - Virtual machine with native clustering on Fly.io's 6PN network
- [Elixir](/technologies/elixir/) - Primary application language with first-class Fly.io support

## Related Apps

- [prismatic_web](/apps/prismatic-web/) - Primary web application deployed to Fly.io
- [prismatic_api](/apps/prismatic-api/) - REST API gateway running on Fly.io
- [prismatic_perimeter](/apps/prismatic-perimeter/) - EASM service utilizing Fly.io's global distribution
- All 90 Prismatic Platform applications deploy as a single release to Fly.io

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)