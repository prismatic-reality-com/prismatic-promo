+++
title = "Infrastructure"
description = "Comprehensive guide to software infrastructure -- the foundational systems, services, and tooling that support application deployment, scaling, monitoring, and operations within the Prismatic Platform."
weight = 50

[extra]
category = "architecture"
tags = ["infrastructure", "platform", "devops", "deployment", "containerization", "cloud", "monitoring", "scalability", "operations"]
status = "active"
author = "Tomas Korcak (korczis)"
date_created = "2026-02-22"
date_updated = "2026-02-22"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
key_takeaway = "Infrastructure encompasses the foundational hardware, software, networking, and operational tooling that enables applications to run reliably, scale efficiently, and recover from failures in production environments."
related_terms = ["docker", "fly-io", "ci-cd", "monitoring", "observability", "containerization", "scalability", "fault-tolerance", "deployment", "load-balancing"]
aliases = ["infra", "platform-infrastructure", "system-infrastructure"]
prerequisites = ["architecture", "deployment", "docker"]
see_also = ["containerization", "ci-cd", "monitoring", "observability"]
word_count = 1789
date_modified = "2026-02-23"
keywords = ["Infrastructure", "Comprehensive", "Prismatic", "Platform", "glossary", "architecture", "Prismatic Platform", "BEAM", "Elixir"]
image = "/images/sections/glossary.png"
image_alt = "Infrastructure - Prismatic Platform"
+++

## Definition

Infrastructure, in the context of software engineering, refers to the complete set of foundational components -- hardware, networking, operating systems, container runtimes, orchestration platforms, monitoring stacks, databases, message brokers, and operational tooling -- that collectively enable applications to be built, tested, deployed, operated, and scaled. Unlike application code which implements business logic, infrastructure provides the substrate upon which that logic executes. Modern infrastructure is increasingly defined, versioned, and managed as code (Infrastructure as Code, or IaC), enabling reproducibility, auditability, and automated provisioning that were impossible with traditional manual administration.

## Overview

The concept of infrastructure has undergone a dramatic transformation over the past two decades. What once meant physical servers in on-premises data centers has evolved into a multi-layered abstraction spanning bare metal, virtual machines, containers, serverless functions, and edge computing nodes. This evolution has not merely changed where software runs; it has fundamentally altered how teams design, deploy, and operate systems.

At the highest level, infrastructure can be decomposed into several layers:

**Compute Infrastructure** provides the processing capacity for running workloads. This ranges from bare-metal servers and virtual machines to container orchestration platforms like Kubernetes and serverless runtimes like AWS Lambda or Fly.io Machines. The BEAM virtual machine, which powers Elixir and Erlang applications, represents a unique compute substrate that provides lightweight process scheduling, preemptive multitasking, and per-process garbage collection at the language runtime level.

**Networking Infrastructure** encompasses load balancers, DNS services, CDNs, VPNs, firewalls, and service meshes that route traffic between components and protect them from unauthorized access. Modern networking infrastructure must handle service discovery, traffic shaping, mutual TLS, and geographic routing transparently.

**Storage Infrastructure** includes databases (relational, document, graph, time-series), object stores, file systems, caches, and message queues. The Prismatic Platform leverages PostgreSQL for relational data, ETS for in-memory caching, Meilisearch for full-text search, KuzuDB for graph queries, and Redis for distributed state.

**Observability Infrastructure** provides the telemetry, logging, tracing, and alerting systems necessary to understand system behavior in production. Without observability, infrastructure is a black box that cannot be diagnosed or optimized.

**Deployment Infrastructure** automates the process of building, testing, packaging, and releasing software changes. CI/CD pipelines, container registries, release management tools, and blue-green deployment strategies all fall within this category.

Within the Prismatic Platform, infrastructure is treated as a first-class concern with dedicated umbrella applications, automated provisioning, and comprehensive monitoring integrated directly into the development workflow.

## Technical Details

### Infrastructure as Code in Elixir

The Prismatic Platform treats infrastructure configuration as typed data structures rather than opaque YAML or HCL files. This enables compile-time validation, pattern matching over configuration, and programmatic infrastructure composition.

```elixir
defmodule Prismatic.Infrastructure.Config do
  @moduledoc """
  Typed infrastructure configuration with compile-time validation.
  Defines the complete infrastructure topology for the platform.
  """

  @type environment :: :dev | :staging | :production
  @type region :: :eu_central_1 | :us_east_1 | :ap_southeast_1

  @type cluster_config :: %{
          name: String.t(),
          environment: environment(),
          region: region(),
          instances: pos_integer(),
          instance_type: String.t(),
          min_instances: pos_integer(),
          max_instances: pos_integer(),
          auto_scale: boolean()
        }

  @type database_config :: %{
          adapter: :postgres | :ets | :meilisearch | :kuzudb,
          pool_size: pos_integer(),
          timeout: pos_integer(),
          ssl: boolean(),
          read_replicas: non_neg_integer()
        }

  @type infra_config :: %{
          cluster: cluster_config(),
          database: database_config(),
          monitoring: monitoring_config(),
          networking: networking_config()
        }

  @spec build(environment()) :: {:ok, infra_config()} | {:error, term()}
  def build(environment) do
    with {:ok, cluster} <- build_cluster(environment),
         {:ok, database} <- build_database(environment),
         {:ok, monitoring} <- build_monitoring(environment),
         {:ok, networking} <- build_networking(environment) do
      config = %{
        cluster: cluster,
        database: database,
        monitoring: monitoring,
        networking: networking
      }

      {:ok, config}
    end
  end

  @spec build_cluster(environment()) :: {:ok, cluster_config()} | {:error, term()}
  defp build_cluster(:production) do
    {:ok,
     %{
       name: "prismatic-prod",
       environment: :production,
       region: :eu_central_1,
       instances: 3,
       instance_type: "performance-2x",
       min_instances: 2,
       max_instances: 10,
       auto_scale: true
     }}
  end

  defp build_cluster(:staging) do
    {:ok,
     %{
       name: "prismatic-staging",
       environment: :staging,
       region: :eu_central_1,
       instances: 1,
       instance_type: "shared-cpu-1x",
       min_instances: 1,
       max_instances: 3,
       auto_scale: true
     }}
  end

  defp build_cluster(:dev) do
    {:ok,
     %{
       name: "prismatic-dev",
       environment: :dev,
       region: :eu_central_1,
       instances: 1,
       instance_type: "shared-cpu-1x",
       min_instances: 1,
       max_instances: 1,
       auto_scale: false
     }}
  end
end
```

### Health Monitoring Infrastructure

Production infrastructure requires continuous health monitoring with automatic remediation capabilities:

```elixir
defmodule Prismatic.Infrastructure.HealthMonitor do
  @moduledoc """
  Infrastructure health monitoring with automatic remediation.
  Tracks compute, networking, storage, and observability subsystems.
  """

  use GenServer
  require Logger

  @check_interval :timer.seconds(30)
  @degraded_threshold 0.85
  @critical_threshold 0.50

  @type health_status :: :healthy | :degraded | :critical | :unreachable
  @type component :: :database | :cache | :search | :graph | :broker | :dns

  @type health_report :: %{
          component: component(),
          status: health_status(),
          latency_ms: float(),
          last_checked: DateTime.t(),
          consecutive_failures: non_neg_integer(),
          metadata: map()
        }

  defstruct [:components, :reports, :remediation_history, :started_at]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    state = %__MODULE__{
      components: default_components(),
      reports: %{},
      remediation_history: [],
      started_at: DateTime.utc_now()
    }

    schedule_check()
    {:ok, state}
  end

  @impl true
  def handle_info(:check_health, state) do
    reports =
      state.components
      |> Task.async_stream(&check_component/1, timeout: 5_000, on_timeout: :kill_task)
      |> Enum.reduce(state.reports, fn
        {:ok, {component, report}}, acc ->
          Map.put(acc, component, report)

        {:exit, _reason}, acc ->
          acc
      end)

    new_state = %{state | reports: reports}
    new_state = maybe_remediate(new_state)

    emit_telemetry(new_state)
    schedule_check()
    {:noreply, new_state}
  end

  @spec check_component(component()) :: {component(), health_report()}
  defp check_component(component) do
    start_time = System.monotonic_time(:microsecond)

    {status, metadata} =
      case component do
        :database -> check_database()
        :cache -> check_cache()
        :search -> check_search()
        :graph -> check_graph()
        _other -> {:unreachable, %{reason: "unknown component"}}
      end

    latency_ms = (System.monotonic_time(:microsecond) - start_time) / 1_000

    report = %{
      component: component,
      status: status,
      latency_ms: latency_ms,
      last_checked: DateTime.utc_now(),
      consecutive_failures: count_failures(status),
      metadata: metadata
    }

    {component, report}
  end

  defp maybe_remediate(state) do
    critical_components =
      state.reports
      |> Enum.filter(fn {_component, report} -> report.status == :critical end)
      |> Enum.map(fn {component, _report} -> component end)

    Enum.reduce(critical_components, state, fn component, acc ->
      Logger.warning("Attempting remediation for critical component: #{component}")
      apply_remediation(acc, component)
    end)
  end

  defp schedule_check do
    Process.send_after(self(), :check_health, @check_interval)
  end
end
```

### Provisioning and Deployment

The platform uses a declarative deployment pipeline that manages infrastructure state transitions:

```elixir
defmodule Prismatic.Infrastructure.Deployer do
  @moduledoc """
  Declarative deployment pipeline for infrastructure provisioning.
  Manages state transitions from build through production release.
  """

  @type deploy_stage :: :build | :test | :package | :provision | :release | :verify
  @type deploy_result :: {:ok, map()} | {:error, deploy_stage(), term()}

  @spec deploy(String.t(), keyword()) :: deploy_result()
  def deploy(version, opts \\ []) do
    environment = Keyword.get(opts, :environment, :staging)
    strategy = Keyword.get(opts, :strategy, :rolling)

    pipeline = [
      {:build, &compile_release/2},
      {:test, &run_verification/2},
      {:package, &build_container/2},
      {:provision, &provision_infrastructure/2},
      {:release, &execute_release/2},
      {:verify, &post_deploy_verification/2}
    ]

    context = %{
      version: version,
      environment: environment,
      strategy: strategy,
      started_at: DateTime.utc_now(),
      artifacts: %{}
    }

    Enum.reduce_while(pipeline, {:ok, context}, fn {stage, handler}, {:ok, ctx} ->
      case handler.(stage, ctx) do
        {:ok, updated_ctx} ->
          Logger.info("Deploy stage #{stage} completed for #{version}")
          {:cont, {:ok, updated_ctx}}

        {:error, reason} ->
          Logger.error("Deploy stage #{stage} failed: #{inspect(reason)}")
          rollback(ctx, stage)
          {:halt, {:error, stage, reason}}
      end
    end)
  end
end
```

## Implementation

Implementing infrastructure within the Prismatic Platform follows a layered approach that separates concerns while maintaining cohesion through well-defined interfaces.

**Layer 1 -- Compute Foundation**: The BEAM VM serves as the primary compute substrate. Its lightweight process model (millions of concurrent processes), preemptive scheduling, and per-process garbage collection make it uniquely suited for infrastructure workloads that require high concurrency and fault isolation. Each Prismatic umbrella application runs within its own supervision tree, providing process-level isolation comparable to container-level isolation in other ecosystems.

**Layer 2 -- Container Orchestration**: For deployment to Fly.io, the platform uses multi-stage Docker builds that produce minimal Alpine-based images. The Dockerfile separates build dependencies from runtime dependencies, keeping production images lean. Fly.io Machines provide automatic geographic distribution, health-checked deployments, and auto-scaling based on connection count or CPU utilization.

**Layer 3 -- Data Infrastructure**: PostgreSQL serves as the primary relational store with connection pooling via DBConnection. ETS tables provide microsecond-latency caching for hot data paths. Meilisearch handles full-text search with typo-tolerant queries. KuzuDB manages graph relationships for entity resolution and knowledge graphs. Each storage backend implements the `PrismaticStorage.Adapter` behaviour, enabling seamless backend substitution.

**Layer 4 -- Observability Stack**: Telemetry events are emitted at every infrastructure boundary. The `:telemetry` library captures metrics for database query times, HTTP request latencies, GenServer call durations, and custom business events. Structured logging via Logger backends provides searchable, machine-parseable log output. Distributed tracing propagates correlation IDs across process boundaries.

**Layer 5 -- Security Infrastructure**: TLS termination, certificate management, API authentication (JWT, API keys), RBAC authorization, rate limiting, and input validation form the security infrastructure layer. The Prismatic Perimeter application extends this with external attack surface management and continuous security rating.

## Comparison

| Approach | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| **Bare Metal** | Maximum performance, full control | High operational overhead, slow provisioning | Latency-critical workloads |
| **Virtual Machines** | Good isolation, mature tooling | Resource overhead, slower scaling | Legacy applications |
| **Containers (Docker/K8s)** | Fast scaling, reproducible, portable | Orchestration complexity, networking overhead | Microservices architectures |
| **Serverless** | Zero ops, pay-per-use, auto-scale | Cold starts, vendor lock-in, limited runtimes | Event-driven workloads |
| **BEAM/OTP** | Built-in concurrency, fault tolerance, hot upgrades | Niche ecosystem, CPU-bound limitations | Concurrent, fault-tolerant systems |
| **PaaS (Fly.io/Heroku)** | Simplified ops, managed infrastructure | Less control, potential cost at scale | Small-to-medium deployments |

The Prismatic Platform combines BEAM/OTP for application-level infrastructure with Fly.io PaaS for deployment infrastructure, achieving a balance between operational simplicity and the powerful concurrency and fault-tolerance guarantees of the Erlang ecosystem.

## Best Practices

1. **Immutable Infrastructure**: Never modify running infrastructure in place. Build new instances from versioned artifacts, deploy them alongside existing instances, and decommission old ones after verification. This eliminates configuration drift and ensures reproducibility.

2. **Infrastructure as Code**: Define all infrastructure in version-controlled configuration files. Every environment -- development, staging, production -- should be reproducible from these definitions. The Prismatic Platform uses Elixir modules for typed infrastructure config and Dockerfiles for container definitions.

3. **Observability from Day One**: Instrument infrastructure with metrics, logging, and tracing before deploying to production. Retroactively adding observability to running systems is exponentially harder than building it in from the start.

4. **Least Privilege**: Grant the minimum permissions necessary for each infrastructure component. Database users should have only the privileges their application requires. Container processes should not run as root. Network access should be restricted to necessary ports and protocols.

5. **Automated Recovery**: Design infrastructure to self-heal. Use supervision trees for process recovery, health checks for container restarts, circuit breakers for dependency failures, and automatic scaling for load spikes. Human intervention should be the exception, not the rule.

6. **Capacity Planning**: Monitor resource utilization trends and plan capacity ahead of demand. Use auto-scaling for elastic workloads but set hard limits to prevent runaway costs. Profile applications under realistic load to understand resource requirements.

7. **Disaster Recovery**: Maintain tested backup and recovery procedures. Document recovery time objectives (RTO) and recovery point objectives (RPO). Regularly test failover procedures to verify they work under realistic conditions.

8. **Secret Management**: Never store secrets in code, environment variables in source control, or unencrypted configuration files. Use dedicated secret management services with audit logging, rotation policies, and access controls.

## Pitfalls

**Configuration Drift**: When infrastructure is managed manually or through ad-hoc scripts, configurations diverge between environments over time. What works in staging may fail in production because of subtle differences in package versions, environment variables, or network configurations. Immutable infrastructure and IaC prevent this.

**Monitoring Blind Spots**: Teams often monitor application metrics (request rates, error rates) but neglect infrastructure metrics (disk I/O, network saturation, connection pool exhaustion). Infrastructure failures frequently manifest as mysterious application-level symptoms that are impossible to diagnose without infrastructure-level visibility.

**Over-Engineering**: Not every application needs Kubernetes, a service mesh, and a multi-region active-active deployment. Infrastructure complexity has real costs in operational burden, debugging difficulty, and team cognitive load. Start simple and add complexity only when specific, measured requirements demand it.

**Ignoring the BEAM**: Elixir/Erlang applications running on the BEAM already have built-in infrastructure capabilities (process isolation, supervision, hot code upgrades, distribution) that other languages require external tools to achieve. Layering Docker orchestration, process managers, and service meshes on top of the BEAM often duplicates functionality that the runtime provides natively.

**Neglecting Security Updates**: Infrastructure components -- operating systems, container base images, database engines, reverse proxies -- require regular security patching. Automated dependency scanning and update workflows prevent known vulnerabilities from persisting in production.

**Single Points of Failure**: Any infrastructure component without redundancy is a ticking time bomb. Load balancers, databases, DNS servers, certificate authorities, and deployment pipelines all require redundancy or at minimum well-tested failover procedures.

## Use Cases

**Multi-Region Deployment**: A financial services platform deploys to three geographic regions with active-active PostgreSQL replication and geographic DNS routing. The infrastructure layer handles automatic failover, data consistency verification, and latency-based request routing transparently to the application layer.

**Auto-Scaling Event Processing**: An OSINT intelligence platform experiences bursty workloads when new data sources come online. The infrastructure automatically scales compute instances based on Broadway pipeline backpressure, processes the burst, and scales back down to minimize costs.

**Zero-Downtime Database Migration**: A production system with 99.99% uptime requirements migrates from a single PostgreSQL instance to a read-replica topology. The infrastructure layer manages connection routing, read/write splitting, and gradual traffic shifting without any application downtime.

**Development Environment Parity**: A team of 15 developers needs identical development environments that match production. Docker Compose definitions, seeded databases, and pre-configured Elixir releases ensure that every developer's environment behaves identically to staging and production.

**Compliance Infrastructure**: A platform operating under NIS2 and ZKB regulations implements automated compliance evidence collection, audit logging, data retention policies, and access control enforcement at the infrastructure level rather than scattering compliance logic across application code.

## Related Concepts

Infrastructure intersects with numerous other platform concepts:

- [Containerization](@/glossary/containerization.md) -- packaging applications and dependencies into portable, reproducible container images that run consistently across environments
- [CI/CD](@/glossary/ci-cd.md) -- continuous integration and deployment pipelines that automate building, testing, and releasing infrastructure changes
- [Monitoring](@/glossary/monitoring.md) -- collecting, aggregating, and alerting on infrastructure metrics to ensure operational health
- [Observability](@/glossary/observability.md) -- the ability to understand internal system state from external outputs including metrics, logs, and traces
- [Docker](@/glossary/docker.md) -- the container runtime and image format that serves as the foundation for modern deployment infrastructure
- [Fly.io](@/glossary/fly-io.md) -- the platform-as-a-service provider hosting the Prismatic Platform with edge computing and automatic scaling
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- the ability of infrastructure to continue operating correctly despite component failures
- [Scalability](@/glossary/scalability.md) -- the capacity of infrastructure to handle increasing workload by adding resources
- [Load Balancing](@/glossary/load-balancing.md) -- distributing incoming requests across multiple infrastructure instances to maximize throughput
- [Disaster Recovery](@/glossary/disaster-recovery.md) -- procedures and infrastructure for restoring operations after catastrophic failures
- [Security](@/glossary/security.md) -- protecting infrastructure from unauthorized access, data breaches, and operational disruption
- [Supervision Tree](@/glossary/supervision-tree.md) -- the OTP mechanism providing process-level infrastructure resilience within the BEAM

## See Also

- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine providing the compute foundation for Elixir infrastructure
- [PostgreSQL](@/glossary/postgresql.md) -- the primary relational database in the Prismatic Platform data infrastructure
- [ETS](@/glossary/ets.md) -- Erlang Term Storage providing in-memory caching infrastructure
- [Telemetry](@/glossary/telemetry.md) -- the instrumentation library powering Prismatic Platform observability infrastructure
- [Blue-Green Deployment](@/glossary/blue-green-deployment.md) -- a deployment strategy that maintains two identical production environments
- [GitLab CI](@/glossary/gitlab-ci.md) -- the CI/CD platform automating Prismatic Platform build and deployment pipelines

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Part of the Prismatic Platform Glossary | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
