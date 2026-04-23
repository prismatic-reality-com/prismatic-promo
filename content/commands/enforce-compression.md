+++
title = "/enforce-compression"
weight = 1270
[extra]
category = "Documentation"
description = "Mandatory enforcement of automatic context compression across all AI providers"
syntax = "/enforce-compression [options]"
authority = "MANDATORY"
agent = "context-compression-enforcer"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1255
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["enforce-compression", "Mandatory", "commands", "Documentation", "Prismatic Platform", "AIAD", "Provider", "Target"]
tags = ["commands", "documentation", "enforce-compression", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/enforce-compression - Prismatic Platform"
+++

## Overview

**/enforce-compression** is a production command in the **Documentation** category of the Prismatic Platform. It provides mandatory enforcement of automatic context compression across all AI providers, ensuring that every interaction with language models operates within optimal token budgets without sacrificing critical information fidelity. In a platform with over 37,000 files and 2.8 million lines of code, uncompressed context would rapidly exhaust provider token limits and degrade response quality.

The command addresses a fundamental challenge in AI-assisted development: context windows are finite resources. When agents need to reason about large codebases, documentation corpora, or multi-step workflows, raw context easily exceeds the capacity of even the largest model windows. The `/enforce-compression` command solves this by enforcing compression policies at the protocol level, ensuring that all outbound context passes through structured compression pipelines before reaching any AI provider.

Context compression in the Prismatic Platform is not simple truncation. The context-compression-enforcer agent applies semantic compression algorithms that preserve the information density of technical content while reducing token count by 40-70%. This includes structural deduplication, reference collapsing, priority-weighted content selection, and adaptive summarization based on the specific task context.

This command operates under the **MANDATORY** authority level, meaning it cannot be bypassed or downgraded by any agent or operator. Every AI provider integration -- whether Anthropic Claude, local [Ollama](@/glossary/ollama.md) models, or future providers -- must comply with compression enforcement. The command is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The compression enforcement system operates as a middleware layer between the platform's agent execution engine and external AI provider APIs. Its architecture consists of four primary components:

```
Agent Request --> Compression Policy Engine --> Context Optimizer --> Provider API
                        |                           |
                  Policy Registry             Token Budget Manager
                        |                           |
                  Compression Rules           Provider Limits DB
```

**Compression Policy Engine**: Evaluates each outbound context against registered compression policies. Policies define minimum compression ratios, priority weights for different content types, and provider-specific token budgets. The engine operates as an OTP GenServer with ETS-backed policy caching for sub-millisecond lookups.

**Context Optimizer**: Performs the actual compression transformations. Supports multiple strategies including structural deduplication (removing repeated module definitions), reference collapsing (replacing inline content with references), hierarchical summarization (progressive detail reduction), and semantic chunking (splitting context into independently meaningful segments).

**Token Budget Manager**: Maintains real-time token budget accounting per provider, per session, and per agent. Tracks consumption against configurable limits and triggers compression escalation when budgets approach exhaustion.

**Provider Limits Database**: Stores provider-specific constraints including maximum context window sizes, optimal context-to-response ratios, and provider-recommended formatting guidelines.

## Usage

### Basic Enforcement

```bash
# Enforce compression on current session
/enforce-compression

# Check compression status across all providers
/enforce-compression --status

# Enforce with specific compression ratio target
/enforce-compression --ratio=0.6

# Dry run showing compression analysis without applying
/enforce-compression --dry-run
```

### Provider-Specific Enforcement

```bash
# Enforce compression for Anthropic Claude interactions
/enforce-compression --provider=anthropic --max-tokens=180000

# Enforce compression for local Ollama models with tighter limits
/enforce-compression --provider=ollama --max-tokens=8000

# Apply emergency compression when approaching limits
/enforce-compression --emergency --ratio=0.3
```

### Policy Management

```bash
# List all active compression policies
/enforce-compression --list-policies

# Apply a named compression profile
/enforce-compression --profile=high-density

# Validate compression compliance across all active sessions
/enforce-compression --validate-all
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--status` | flag | false | Display current compression status for all providers |
| `--ratio` | float | 0.5 | Target compression ratio (0.1 = aggressive, 0.9 = minimal) |
| `--provider` | string | all | Target specific AI provider (anthropic, ollama, openai) |
| `--max-tokens` | integer | provider-default | Maximum token budget for compressed context |
| `--dry-run` | flag | false | Analyze compression impact without applying changes |
| `--emergency` | flag | false | Activate emergency compression with aggressive reduction |
| `--profile` | string | standard | Named compression profile (standard, high-density, minimal) |
| `--list-policies` | flag | false | List all registered compression policies |
| `--validate-all` | flag | false | Validate compression compliance across all sessions |
| `--verbose` | flag | false | Include detailed compression statistics in output |
| `--format` | string | text | Output format (text, json, table) |

## Execution Flow

The `/enforce-compression` command follows a structured 6-phase execution flow:

1. **Policy Resolution**: The command resolves applicable compression policies based on the current provider configuration, session context, and agent requirements. Policies are loaded from the AIAD policy registry and cached in ETS for performance.

2. **Context Analysis**: The current context payload is analyzed for compressibility. This phase identifies duplicated content, low-priority sections, expandable references, and structural redundancies. The analysis produces a compression opportunity map.

3. **Budget Calculation**: Token budgets are calculated per provider, accounting for the specific model's context window, the expected response length, and any reserved tokens for system prompts or tool definitions.

4. **Compression Application**: Selected compression strategies are applied in priority order. Structural deduplication runs first (highest fidelity), followed by reference collapsing, then hierarchical summarization if further reduction is needed. Each strategy reports its compression contribution.

5. **Validation**: The compressed context is validated against quality thresholds. If compression has degraded information below acceptable levels (measured by semantic similarity scoring), the command escalates with warnings or rolls back to a less aggressive strategy.

6. **Enforcement Registration**: The compression configuration is registered as mandatory for the session, preventing any subsequent context expansion from bypassing the compression layer.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | All agent context passes through compression enforcement |
| [Prismatic Claude](@/apps/prismatic-claude.md) | Provider | Claude-specific compression policies and token budgets |
| [Quality Gates](@/glossary/quality-gates.md) | Validation | Pre/post compression quality verification |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Compression ratio [metrics](@/glossary/metrics.md), token savings tracking |
| [Session Lifecycle](@/glossary/session-discipline.md) | Hook | Automatic compression enforcement at session start |
| AIAD Registry | Discovery | Command specification, policy resolution, agent binding |
| [Ollama](@/glossary/ollama.md) Integration | Provider | Local model compression with tighter token budgets |

## Best Practices

**Set provider-appropriate ratios**: Local Ollama models with 8K context windows require much more aggressive compression (0.3-0.4 ratio) than Claude with 200K windows (0.5-0.7 ratio). Always configure provider-specific policies rather than relying on global defaults.

**Run dry-run before emergency compression**: Emergency compression mode can aggressively reduce context, potentially removing information needed for the current task. Always preview the impact with `--dry-run` first.

**Monitor compression metrics over time**: Use [telemetry](@/glossary/telemetry.md) dashboards to track compression ratios and token savings. Consistently high compression ratios may indicate that upstream agents are generating unnecessarily verbose context that should be addressed at the source.

**Prefer structural deduplication**: The highest-fidelity compression strategy. If your context contains repeated module definitions, import blocks, or boilerplate sections, structural deduplication can achieve 30-50% reduction with zero information loss.

**Integrate with session lifecycle hooks**: Configure automatic compression enforcement at session start rather than relying on manual invocation. This ensures every session benefits from compression without operator intervention.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `COMPRESSION_BELOW_QUALITY_THRESHOLD` | Aggressive compression degraded information quality | Increase ratio target or switch to less aggressive profile |
| `PROVIDER_NOT_CONFIGURED` | Target provider has no registered compression policy | Register provider in compression policy registry |
| `TOKEN_BUDGET_EXCEEDED` | Compressed context still exceeds provider limit | Apply emergency compression or split context across multiple requests |
| `POLICY_CONFLICT` | Multiple conflicting compression policies active | Resolve policy conflicts in AIAD policy registry |
| `COMPRESSION_ENGINE_TIMEOUT` | Context too large for compression within timeout | Increase timeout or pre-filter context before compression |

When errors occur, the command follows the platform's standard error handling protocol: errors are logged with full context to [telemetry](@/glossary/telemetry.md), the operator receives a structured error report, and the pre-compression context is preserved for retry. No context is silently dropped.

## Advanced Usage

### Custom Compression Strategies

Advanced operators can define custom compression strategies for domain-specific content:

```bash
# Register a custom compression strategy for OSINT reports
/enforce-compression --register-strategy=osint-reports \
  --preserve-fields="source,confidence,timestamp" \
  --compress-fields="raw_data,metadata" \
  --ratio=0.4

# Apply multi-stage compression pipeline
/enforce-compression --pipeline="dedup,reference-collapse,summarize" \
  --stage-ratios="0.8,0.6,0.4"
```

### Compression Metrics Analysis

```bash
# Generate compression effectiveness report
/enforce-compression --report --period=7d --format=json

# Compare compression ratios across providers
/enforce-compression --compare-providers --verbose
```

### Integration with Evolution System

The compression enforcement system participates in the platform's [evolution](@/commands/evolve.md) cycle. Compression policies are treated as evolvable artifacts -- the evolution-orchestrator can propose policy adjustments based on observed compression effectiveness metrics.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for uncompressed context reaching AI providers. Every byte of context must pass through the compression enforcement layer. No bypass mechanisms, no exceptions for "small" payloads.
- **NO DOUBTS**: Compression decisions are evidence-based. Token savings are measured and reported. Quality degradation is detected and prevented through semantic similarity scoring.

The MANDATORY authority level means this command operates at the highest enforcement tier. Unlike L2+ or L3 commands that can be scoped or delegated, MANDATORY commands are always active and cannot be suspended by any agent below SUPREME authority.

## Related Commands

- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/optimize](@/commands/optimize.md) - Performance optimization with measurement validation
- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)