+++
title = "AIAD Agent: automated"
weight = 46
[extra]
domain = "critical-automation"
level = "L3"
description = "Automated dependency detection and management agent ensuring all 90 umbrella applications maintain current, secure, and compatible dependency trees"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "color-teams", "telemetry", "osint", "genserver", "ets", "umbrella-application"]
domain_normalized = "general"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2050
quality_score = 95
keywords = ["dependency management", "vulnerability detection", "automated scanning", "hex packages", "CVE correlation", "umbrella dependencies"]
tags = ["prismatic", "agent", "critical-automation", "dependency-management", "security"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Agent: automated - Prismatic Platform"
+++

## Overview

The [AIAD](/glossary/aiad/) Automated Agent operates as an L3 strategic command agent within the Critical Automation domain of the Prismatic Platform. This agent detects missing, outdated, or vulnerable dependencies across the platform's 90 [umbrella application](/glossary/umbrella-application/)s, ensuring that every application maintains a current, secure, and internally consistent dependency tree. In a monorepo with nearly 100 applications sharing common libraries, dependency management is not a peripheral concern -- it is a critical automation function that directly impacts compilation success, security posture, and runtime stability.

The dependency landscape in the Prismatic Platform is complex by nature. Umbrella applications share dependencies through the root `mix.exs` but can also declare application-specific overrides. A version conflict between two applications that share a transitive dependency can cause compilation failures, runtime crashes, or subtle behavioral differences that are difficult to diagnose. The Automated Agent prevents these scenarios by continuously monitoring dependency declarations, detecting version conflicts before they reach compilation, and identifying outdated packages that may contain known security vulnerabilities. This proactive monitoring transforms dependency management from a reactive maintenance task into a continuous automated assurance function, deeply integrated with the platform's [telemetry](/glossary/telemetry/) infrastructure and [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework.

Beyond version management, the agent tracks dependency health signals from external registries (Hex.pm for Elixir packages, npm for JavaScript dependencies used in the promo site). When a dependency is deprecated, archived, or flagged with a security advisory, the Automated Agent surfaces this information with recommended remediation paths. This proactive monitoring aligns with the [Trinity Gate](/glossary/trinity-gate/) validation requirements -- every dependency claim is backed by structural analysis, logical consistency checks, and formal verification of version constraint compatibility.

## Architecture

The Automated Agent operates as a [GenServer](/glossary/genserver/) that maintains the dependency graph in memory and persists scan results to the platform's quality metrics infrastructure. The dependency graph is represented as a directed acyclic graph where nodes are packages and edges represent version-constrained dependency relationships.

The graph construction process begins by scanning all `mix.exs` files across the 90 umbrella applications, extracting dependency declarations with version constraints. Each dependency is resolved to its actual version from the `mix.lock` file, and transitive dependencies are expanded to build the complete dependency closure. The resulting graph enables rapid conflict detection: if two applications require incompatible versions of the same transitive dependency, the graph structure immediately reveals the conflict path.

Scan results are stored in [ETS](/glossary/ets/) for fast access by the enforcement commander and dashboard systems. Telemetry events under `[:prismatic_agents, :automated, :dependency, *]` provide real-time visibility into dependency health metrics. The agent maintains a vulnerability cache that correlates current dependency versions against known CVE databases, with cache invalidation triggered by external registry polling on a 6-hour cycle.

```elixir
defmodule AIAD.Automated.DependencyScanner do
  use GenServer

  @scan_interval_ms :timer.hours(6)
  @vulnerability_sources [:hex_advisories, :mix_audit, :cve_database]

  def scan_all_apps do
    GenServer.call(__MODULE__, :full_scan, :timer.minutes(5))
  end

  def check_vulnerabilities do
    GenServer.call(__MODULE__, :vuln_check, :timer.minutes(2))
  end

  def get_dependency_graph do
    GenServer.call(__MODULE__, :get_graph)
  end

  def check_conflicts do
    GenServer.call(__MODULE__, :check_conflicts)
  end

  @impl true
  def handle_call(:full_scan, _from, state) do
    apps = discover_umbrella_apps()
    deps = Enum.flat_map(apps, &parse_mix_deps/1)
    graph = build_dependency_graph(deps)
    conflicts = detect_version_conflicts(graph)
    outdated = find_outdated_packages(graph)
    deprecated = check_deprecation_status(graph)

    scan_result = %{
      conflicts: conflicts,
      outdated: outdated,
      deprecated: deprecated,
      total_deps: graph_size(graph),
      scanned_at: DateTime.utc_now()
    }

    store_in_ets(scan_result)
    emit_scan_telemetry(scan_result)
    {:reply, {:ok, scan_result}, %{state | graph: graph, last_scan: scan_result}}
  end

  @impl true
  def handle_call(:vuln_check, _from, state) do
    vulnerabilities = Enum.flat_map(@vulnerability_sources, fn source ->
      correlate_dependencies(state.graph, source)
    end)

    classified = classify_vulnerabilities(vulnerabilities)
    {:reply, {:ok, classified}, %{state | last_vuln_check: classified}}
  end

  defp classify_vulnerabilities(vulns) do
    Enum.group_by(vulns, fn vuln ->
      case vuln.severity do
        s when s >= 9.0 -> :critical
        s when s >= 7.0 -> :high
        s when s >= 4.0 -> :moderate
        _ -> :low
      end
    end)
  end
end
```

The vulnerability check integrates with Hex.pm's security advisory feed and the `mix_audit` tool to identify packages with known CVEs. Vulnerability classification uses CVSS scores to determine severity, with critical vulnerabilities (9.0+) triggering immediate deployment blocks and high vulnerabilities (7.0+) requiring remediation within 48 hours.

## Key Capabilities

- **Cross-application dependency scanning** -- Analyzes `mix.exs` files across all 90 umbrella applications to build a unified dependency graph with version constraints, override tracking, and conflict detection
- **Security vulnerability detection** -- Correlates current dependency versions against known vulnerability databases to identify packages requiring immediate upgrade due to published CVEs or security advisories
- **Version conflict resolution** -- Detects cases where two or more applications require incompatible versions of the same transitive dependency and recommends resolution strategies that maintain compatibility
- **Deprecation monitoring** -- Tracks dependency lifecycle status on external registries and alerts when a dependency is deprecated, archived, or transferred to a new maintainer
- **Automated upgrade proposals** -- Generates dependency upgrade recommendations that include compatibility analysis, changelog summaries, and impact assessment for the affected umbrella applications
- **Lockfile consistency verification** -- Ensures that `mix.lock` accurately reflects the resolved dependency tree and that no phantom or orphaned dependencies exist

## Authority Level

**L3** - Strategic Command. The Automated Agent holds multi-domain coordination authority for dependency management across the entire umbrella ecosystem. This authority permits scanning all application dependency declarations, correlating vulnerability data from external registries, and issuing deployment blocks when critical vulnerabilities are detected. The L3 designation enables coordination with deployment engines, quality gate enforcers, and dashboard systems to propagate dependency health information across the platform.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `mix deps.scan` | Execute full dependency scan across all umbrella applications | L3 |
| `mix deps.vulnerabilities` | Check all dependencies against CVE databases | L3 |
| `mix deps.conflicts` | Detect version conflicts in dependency graph | L3 |
| `mix deps.outdated` | Report outdated packages with upgrade recommendations | L3 |
| `mix deps.health` | Display comprehensive dependency health dashboard | L3 |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [absolute-enforcement-commander-v6](/agents/absolute-enforcement-commander-v6/) | Integrates dependency checks into pre-commit quality gates |
| [aiad-deployment-engine](/agents/aiad-deployment-engine/) | Validates dependency consistency before deployment |
| [alert-management-specialist](/agents/alert-management-specialist/) | Routes dependency vulnerability alerts to appropriate teams |
| [aiad-verification-engine](/agents/aiad-verification-engine/) | Validates dependency declarations in agent specifications |
| [aiad-dashboard-commander](/agents/aiad-dashboard-commander/) | Displays dependency health metrics on monitoring dashboards |

## Enforcement

All dependency management operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No deployment may proceed with unresolved critical vulnerabilities. The [Trinity Gate](/glossary/trinity-gate/) validates dependency changes across all four layers: structural consistency (dependency graph forms valid DAG), logical consistency (version constraints are satisfiable), formal necessity (no known CVEs in resolved versions), and epistemic validation (multiple vulnerability sources confirm findings). The [NABLA Infinity](/glossary/nabla-infinity/) Signal Plurality axiom requires that vulnerability assessments combine at least two independent sources -- Hex.pm advisories, mix_audit results, and CVE database correlations -- before any classification decision. Provenance is mandatory: every dependency recommendation traces to specific CVE identifiers, advisory sources, affected version ranges, and recommended remediation versions. Time Decay enforcement ensures that cached vulnerability data older than 24 hours is marked as potentially stale, preventing operators from acting on outdated information.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)