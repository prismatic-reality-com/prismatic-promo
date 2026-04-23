+++
title = "Command Registry"
description = "Complete catalog of 216+ AIAD slash commands spanning development, intelligence, security, quality, and autonomous evolution domains"
sort_by = "weight"
template = "commands/list.html"
page_template = "commands/detail.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
word_count = 2600
difficulty = "intermediate"
image = "/images/sections/commands.png"
image_alt = "Prismatic Platform command registry architecture"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
related_articles = ["prismatic-agents", "aiad"]
glossary_terms = ["AIAD", "slash-command", "skill", "domain", "orchestration"]
keywords = ["AIAD slash commands", "AI command registry", "declarative command specification", "agent command routing", "CLI development tools", "orchestration commands", "intelligence commands", "automated task dispatch"]
tags = ["commands", "aiad", "cli", "orchestration", "automation"]
see_also = ["agents", "capabilities", "architecture"]
total_commands = 216
domains_count = 14
date_modified = "2026-02-23"
+++

216+ slash commands organized across 14 operational domains, forming the primary interaction surface of the Prismatic Platform. Every command is defined as a declarative AIAD specification, automatically discovered at boot time, and executable through Claude Code's Skill integration or direct invocation in the terminal.

## Abstract

The Prismatic Platform exposes its capabilities through a registry of over 216 slash commands, each defined as a declarative YAML specification file following the AIAD (Autonomous Intelligent Agent Directive) standard. Commands serve as the bridge between human intent and agent execution: a user issues `/investigate korczis@gmail.com comprehensive` and the platform resolves the command to the appropriate agent (`strategic-command`), validates parameters, assembles the required toolchain, and orchestrates a multi-phase intelligence workflow -- all without the user needing to know which of the 434 agents handles the request or how the internal pipeline is structured.

This document catalogs the complete command landscape, explains the specification format and auto-discovery mechanism, and provides detailed coverage of each operational domain. The command registry is not a static configuration file; it is a living index that re-synchronizes whenever new `.cmd.md` files are added to the `.aiad/commands/` directory, ensuring that the platform's interaction surface grows in lockstep with its capabilities.

## Introduction

### The Case for Slash Commands

Traditional software platforms expose functionality through menus, API endpoints, or configuration files. Each approach introduces friction: menus require navigation, APIs require HTTP client tooling, and configuration files require deployment cycles. Slash commands eliminate this friction by providing a single, uniform invocation pattern -- a forward slash followed by a verb and arguments -- that works identically whether the user is in a Claude Code session, a CI/CD pipeline script, or an interactive terminal.

The design draws from three established precedents. First, IRC and Slack slash commands demonstrated that `/verb argument` is an intuitive interaction pattern that users learn within seconds. Second, Unix shell commands proved that composable single-purpose tools outperform monolithic interfaces. Third, the Model Context Protocol (MCP) established that AI-assisted development benefits from structured tool invocations with typed parameters. The Prismatic command system synthesizes all three into a unified interface backed by the AIAD agent framework.

### The AIAD Standard

Every command in the registry adheres to the AIAD specification, which mandates:

- **Declarative definition**: Commands are defined in `.cmd.md` Markdown files containing a `command-spec` YAML block. No imperative code is required to register a command.
- **Agent binding**: Each command specifies exactly one agent responsible for execution. The agent provides the domain expertise, tool selection, and quality assurance for that command's mission.
- **Typed parameters**: Parameters declare their position, type, optionality, and default values. The runtime validates inputs before forwarding them to agents.
- **Doctrine compliance**: Commands operating in critical domains carry an enforcement block binding them to the NO MERCY, NO DOUBTS doctrine, ensuring zero-tolerance quality gates.

The result is a system where adding a new capability to the platform requires creating a single Markdown file and running the AIAD indexer. No router changes, no controller code, no deployment.

## Command Architecture

### The `.cmd.md` Specification Format

Each command lives in a dedicated file under `.aiad/commands/`. The file is standard Markdown with an embedded YAML specification block that the AIAD indexer parses during auto-discovery. The following is a representative example:

```yaml
command-spec:
  id: "investigate"
  name: "/investigate"
  version: "1.0.0"
  agent: "strategic-command"

  invocation:
    prefix: "/"
    argument_hint: "[SUBJECT] [investigation-depth]"
    model: "claude-opus-4.5"
    tools: [Task, WebFetch, Read, Write, Edit, Bash, Grep, Glob]

  parameters:
    - name: "subject"
      position: 1
      required: true
      type: "string"
    - name: "depth"
      position: 2
      required: false
      type: "string"
      default: "standard"
      options: ["quick", "standard", "comprehensive", "exhaustive"]

  enforcement:
    doctrine: "no-mercy-no-doubts"
    compliance: mandatory
    quality_gates: strict

  metadata:
    category: "intelligence"
    priority: "normal"
    source: ".claude/commands/investigate.md"
    aiad_version: "1.0.0"
```

The specification captures everything the runtime needs: which agent handles the command, what tools that agent may invoke, what parameters the user can supply, and what quality enforcement applies. The surrounding Markdown content provides human-readable documentation, usage examples, and architectural notes -- serving as both the machine-readable definition and the developer reference in a single file.

### Auto-Discovery and the AIAD Indexer

The platform does not maintain a hand-curated command routing table. Instead, the AIAD indexer scans the `.aiad/commands/` directory at boot time, parses every `.cmd.md` file, extracts the `command-spec` YAML block, and populates an in-memory registry backed by ETS (Erlang Term Storage). The index is also serialized to `.aiad/commands/registry.jsonl` for offline tooling and CI validation.

The indexer runs in under 200 milliseconds for the full 213-file directory. Adding a new command requires only:

1. Create a `.cmd.md` file in `.aiad/commands/`
2. Define the `command-spec` YAML block with the required fields
3. Run `./.aiad/bin/aiad index` to regenerate the registry

No application restart is needed for the JSONL index; the ETS registry refreshes on the next boot cycle or explicit reload via `/reload`.

### Skill Integration with Claude Code

Commands integrate with Claude Code through the Skill tool mechanism. When a user types a slash command in a Claude Code session, the runtime resolves it against the AIAD registry, constructs the agent invocation, and streams results back through the standard tool output interface. The Elixir-side dispatch follows this pattern:

```elixir
defmodule PrismaticClaude.CommandDispatcher do
  @moduledoc """
  Resolves slash commands to AIAD agent invocations.
  """

  @spec dispatch(String.t(), list(String.t())) :: {:ok, term()} | {:error, term()}
  def dispatch(command_name, args) do
    with {:ok, spec} <- Registry.lookup(command_name),
         {:ok, validated_args} <- Parameters.validate(spec.parameters, args),
         {:ok, agent} <- AgentPool.checkout(spec.agent),
         {:ok, result} <- Agent.execute(agent, spec, validated_args) do
      {:ok, result}
    end
  end
end
```

The dispatcher validates parameters against the spec, checks out the bound agent from the pool, and delegates execution. The agent handles all domain-specific logic, tool invocations, and quality gate enforcement internally.

## Command Domains

The 216+ commands are organized into 14 operational domains. Each domain groups commands that share a common operational concern and typically route to agents within the same specialization cluster.

| Domain | Commands | Description | Representative Commands |
|--------|----------|-------------|------------------------|
| **Development** | 28 | Code generation, refactoring, testing, debugging | `/code`, `/test`, `/fix`, `/refactor`, `/optimize` |
| **Intelligence** | 24 | OSINT investigation, reconnaissance, analysis | `/investigate`, `/email-osint`, `/ghost-recon`, `/delta-force` |
| **Quality Assurance** | 22 | Quality gates, scanning, enforcement, metrics | `/quality-gates`, `/cascade`, `/check`, `/quality-enforce` |
| **Evolution** | 20 | Self-evolution, genetic algorithms, mycelial patterns | `/evolve`, `/darwinize`, `/mycelialize`, `/meta-evolve` |
| **Orchestration** | 18 | Multi-agent coordination, mission planning | `/orchestrate`, `/archer-supreme`, `/coordinate`, `/plan` |
| **Automation** | 16 | Autonomous cycles, auto-healing, auto-evolution | `/auto`, `/auto-pro`, `/autoheal`, `/autoevolve` |
| **Security** | 14 | Audits, color-team operations, threat assessment | `/security-audit`, `/security-scan`, `/dark-ops` |
| **Infrastructure** | 14 | Deployment, CI/CD, backup, monitoring | `/deploy`, `/cicd-unified`, `/backup`, `/health` |
| **Documentation** | 12 | ADRs, compression, session tracking | `/doc`, `/adr`, `/compress`, `/chronic` |
| **Compliance** | 10 | CER screening, vetting, regulatory reporting | `/cer-screen`, `/cer-vet`, `/cer-report` |
| **Collaboration** | 10 | Brainstorming, ChatGPT bridge, estimation | `/brainstorm`, `/chatgpt-consult`, `/estimate` |
| **Version Control** | 10 | Commits, GitLab sync, MR management | `/commit`, `/gitlab-sync`, `/gitlab-mr` |
| **Performance** | 8 | Benchmarking, profiling, optimization | `/benchmark`, `/perf-profile`, `/performance-profile` |
| **Architecture** | 10 | System design, formal verification, NABLA | `/architect`, `/formal-verify`, `/lean`, `/trinity` |

## Development Commands

The development domain provides the day-to-day commands that engineers use to write, test, and improve code. Each command follows a multi-phase workflow: analysis, agent selection, interactive validation, execution, and quality verification.

**`/code`** is the primary code generation command. It accepts a natural language feature request, analyzes the affected systems and layers, auto-discovers specialist agents (Elixir core, Phoenix LiveView, database, storage), assembles a code team with mandatory QA reviewers, and produces implementation files with tests, documentation, and review reports. Every output passes four quality gates: code review, testing (80%+ coverage), static analysis (Credo, Dialyzer), and performance validation.

**`/test`** generates and executes tests for specified modules or features. It integrates with the platform's test infrastructure to produce unit tests, integration tests, and property-based tests using StreamData. The command enforces the NO MERCY requirement that all new code ships with comprehensive test coverage.

**`/fix`** targets specific bugs. It follows the mandatory regression test protocol: identify root cause, create a regression test that fails before the fix, apply the fix, verify the test passes, and report completion. No bug fix ships without a test proving the fix.

**`/refactor`** restructures existing code while preserving behavior. It uses the QA agents to verify that all existing tests continue passing after the refactoring, and generates new tests where coverage gaps are detected.

**`/optimize`** profiles code, identifies bottlenecks, applies targeted improvements, and benchmarks the results. It requires measurable evidence of improvement before the optimization is accepted.

## Intelligence Commands

The intelligence domain provides OSINT (Open Source Intelligence) capabilities through a suite of specialized commands modeled after military special operations units. All intelligence commands operate within authorized contexts only: CTF challenges, defensive security research, and explicit penetration testing engagements.

**`/investigate`** is the central intelligence hub. It accepts any subject type -- email addresses, domain names, company names, IP addresses, personal identifiers -- and routes to the `strategic-command` agent for multi-domain investigation. It supports configurable depth levels from `quick` (surface-level enumeration) to `exhaustive` (deep cross-referencing with mesh expansion).

**`/email-osint`** specializes in email-to-profile investigations. Given an email address, it performs breach database checks, social media correlation, domain registration lookups, and identity graph expansion through the `email-intelligence-specialist` agent.

**`/ghost-recon`** executes stealth OSINT reconnaissance with maximum operational security. It minimizes digital footprint during collection, uses passive techniques preferentially, and routes through the `tactical-command` agent with restricted tool permissions (no Write, no Edit -- read-only collection).

**`/delta-force`** provides precision OSINT operations with surgical accuracy. It focuses on extracting specific intelligence about narrowly defined targets rather than broad-spectrum collection.

**`/navy-seal`** handles deep-water OSINT in hostile digital environments. It operates at high priority with the `strategic-command` agent and is designed for targets where standard collection techniques face active countermeasures.

**`/google-hacking`** leverages advanced search operator techniques (Google dorks) to discover exposed assets, documents, and configuration files associated with target domains.

## Quality and Evolution Commands

The quality and evolution domains represent two sides of the same coin: quality commands enforce standards on the current codebase, while evolution commands drive the codebase toward higher fitness over time.

### Quality Commands

**`/quality-gates`** enforces the platform's mandatory quality checkpoints. It runs compilation with `--warnings-as-errors`, Credo in strict mode, and the full `mix quality.gates` static analysis suite. The command supports scoped checks (`compilation`, `credo`, `quality-score`, `all`) and configurable thresholds. It blocks progression on any failure by default, serving as a prerequisite for `/test`, `/orchestrate`, and `/deploy` workflows.

**`/cascade`** runs the CASCADE quality scanner, which detects and eliminates specific anti-pattern categories: Type Mismatch, Dead Code, Empty Check, Timer Replacement, and Nuclear Cache patterns. It supports auto-fix mode (`mix cascade.fix`) with dry-run preview and interactive review, achieving greater than 50% elimination rate per session with a 100% zero-regression safety guarantee.

**`/quality-enforce`** activates continuous quality enforcement for the current session, monitoring all file changes for violations and blocking commits that degrade the quality score.

### Evolution Commands

**`/evolve`** is the master evolution command (v5.1.0). It drives self-evolving AIAD ecosystem intelligence with recursive optimization and meta-learning. Modes include `scan` (identify improvement opportunities), `apply` (execute improvements), `mega` (full evolution cycle), and `status` (report current evolutionary state). The command has supreme authority and self-recursive classification.

**`/mycelialize`** propagates successful patterns across the codebase through the mycelial network metaphor. When a quality improvement succeeds in one module, `/mycelialize` identifies analogous locations across the 93 OTP applications and propagates the pattern, achieving 99.8% propagation success rate.

**`/darwinize`** applies Darwinian natural selection pressure. It evaluates code variants against fitness criteria (performance, correctness, maintainability), selects winners, and eliminates unfit implementations through the `darwinian-evolution-coordinator` agent.

**`/meta-evolve`** operates at the meta-level, evolving the evolution mechanisms themselves. It analyzes which evolution strategies produce the highest-fitness outcomes and adjusts the platform's evolutionary parameters accordingly.

## Security Commands

The security domain encompasses both defensive auditing and adversarial simulation through the platform's six-team color-coded security architecture.

**`/security-audit`** triggers a comprehensive multi-agent security review. It performs OWASP compliance checking, vulnerability assessment, dependency auditing, and threat analysis across the specified scope. The command routes to the `security-audit-specialist` agent with access to `Task`, `Read`, `Grep`, `Glob`, `Bash`, and `WebFetch` tools.

**`/security-scan`** provides automated security scanning for specific modules or the entire codebase, checking for common vulnerabilities (SQL injection patterns, XSS vectors, insecure deserialization, credential exposure).

**`/dark-ops`** activates advanced security operations for authorized penetration testing contexts. It operates under strict safety protocols with sandbox isolation and synthetic data only.

The color-team commands integrate with the platform's 20 security agents across six teams. Red team commands (`/red-team scenario`) generate adversarial simulation scenarios. Blue team commands (`/blue-team posture`) assess defensive posture through evidence synthesis. Purple team commands (`/purple-team closure`) drive Red-Blue loop closure and regression monitoring. All color-team operations enforce sandbox isolation, synthetic-data-only restrictions, and immutable audit logging.

## Orchestration Commands

Orchestration commands coordinate multi-agent operations for missions that span multiple domains, require strategic planning, and demand coordinated tactical execution.

**`/orchestrate`** is the platform's most sophisticated command. It accepts a complex mission description in natural language, performs mission complexity analysis (single-domain, cross-domain, or platform-wide), selects the appropriate command structure (Supreme, Strategic, and/or Tactical command levels), assembles agent teams organized into Alpha, Bravo, Charlie, and Delta squads, and presents an interactive mission plan with options to continue, refine, adjust tactics, proceed immediately, or exit. During execution, it maintains a real-time mission dashboard showing per-squad progress, quality gate status, elapsed time, and issue tracking.

**`/archer-supreme`** is the ultimate authority command for impossible missions. It carries critical priority, routes to the `archer-supreme` agent, and has access to the full tool suite. It operates under mandatory NO MERCY, NO DOUBTS enforcement with strict quality gates and zero tolerance for incomplete delivery.

**`/coordinate`** provides lighter-weight multi-agent coordination for tasks that need two to four agents working in sequence but do not require the full strategic-tactical planning overhead of `/orchestrate`.

**`/plan`** generates execution plans without performing execution, enabling users to review and approve multi-step operations before committing resources.

## Command Lifecycle

### Registration

A command enters the registry when a `.cmd.md` file is placed in `.aiad/commands/` and the AIAD indexer runs. The indexer validates the `command-spec` YAML against the AIAD schema, verifies that the referenced agent exists in the agent registry, checks parameter type declarations, and adds the command to both the ETS runtime registry and the `registry.jsonl` persistent index.

### Discovery

At query time, command discovery follows a resolution chain:

1. **Exact match**: `/investigate` resolves directly to the `investigate` command spec.
2. **Alias resolution**: Some commands declare aliases (e.g., `/check` aliases to `verify` and `validate`).
3. **Fuzzy matching**: If no exact match or alias is found, the dispatcher performs prefix matching and suggests corrections (e.g., `/investgate` suggests `/investigate`).

### Execution

Once resolved, the command enters a five-phase execution cycle:

1. **Parameter validation**: Inputs are checked against the spec's parameter declarations. Missing required parameters produce descriptive errors.
2. **Agent checkout**: The bound agent is checked out from the agent pool. If the agent is busy, the request queues with priority ordering.
3. **Tool assembly**: The tools declared in the spec's `invocation.tools` array are made available to the agent for the duration of execution.
4. **Mission execution**: The agent executes its workflow, which may include multi-phase operations, interactive validation checkpoints, and quality gate checks.
5. **Result delivery**: Output is formatted and streamed back to the invoking interface (Claude Code session, terminal, or CI pipeline).

### Feedback and Evolution

Post-execution, the command system captures telemetry: execution duration, success/failure status, quality gate results, and user satisfaction signals. The `/evolve` meta-system uses this telemetry to identify underperforming commands and evolve their specifications over time.

## Performance and Usage Metrics

The command registry is designed for interactive-latency response times. Key performance characteristics:

| Metric | Value |
|--------|-------|
| **Registry lookup** | < 1 ms (ETS key lookup) |
| **Parameter validation** | < 5 ms (schema validation) |
| **Agent checkout** | < 10 ms (pool management) |
| **Indexer full scan** | < 200 ms (213 files) |
| **Registry reload** | < 50 ms (ETS table swap) |
| **JSONL serialization** | < 100 ms (full registry) |

Usage patterns across the 14 domains show that development commands (`/code`, `/test`, `/fix`) account for approximately 40% of invocations, intelligence commands account for 20%, quality and evolution commands for 25%, and the remaining domains share the final 15%. The `/orchestrate` command, while invoked less frequently, accounts for the longest average execution time due to its multi-phase strategic-tactical workflow.

The registry's JSONL format enables external tooling integration. CI pipelines validate that all commands have passing quality gates. Documentation generators produce command reference pages from the specs. Monitoring dashboards track per-command success rates and latency distributions.

## Conclusion

The Prismatic Platform's command registry transforms a 93-application, 434-agent system into an approachable interface where a single slash command triggers precisely the right combination of agents, tools, and quality gates for any given task. The declarative AIAD specification format ensures that commands are self-documenting, automatically discoverable, and evolvable without code changes. The 14-domain organization provides navigability at scale, while the typed parameter system and doctrine enforcement blocks guarantee that every invocation meets the platform's quality standards.

The command system continues to grow with each platform evolution cycle. New capabilities surface as new `.cmd.md` files, the indexer incorporates them within milliseconds, and the interaction surface expands without version bumps, router changes, or deployment ceremonies. This is the design goal realized: a platform where adding capability is as simple as writing a Markdown file.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
