+++
title = "System Prompt"
weight = 50
[extra]
description = "Instruction context provided to an LLM before user interaction, defining behavior, constraints, and domain expertise for agent operation"
category = "ai"
related_terms = ["llm", "agent", "temperature", "aiad", "prompt-engineering", "token", "context-window"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["system prompt", "LLM", "instruction", "agent", "AI", "glossary", "Prismatic Platform"]
tags = ["glossary", "ai", "agents"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "System Prompt - Prismatic Platform"
+++

## Definition & Overview

A system prompt is the instruction text provided to a Large Language Model (LLM) before any user interaction begins. It defines the model's persona, capabilities, constraints, and behavioral guidelines for the current session. Unlike user prompts (which represent specific requests), the system prompt establishes the persistent context within which all subsequent interactions are interpreted. System prompts are the primary mechanism for specializing general-purpose LLMs into domain-specific agents.

System prompts operate at the foundational layer of LLM interaction. They set the "rules of engagement" -- what the model should and should not do, how it should format responses, what domain knowledge it should prioritize, and what safety constraints it must respect. A well-crafted system prompt transforms a generic language model into a focused specialist: a security analyst, a code reviewer, a data pipeline debugger, or an OSINT intelligence collector.

In the Prismatic Platform, system prompts are the core mechanism through which 1,090 AIAD agents are specialized. Each agent's `.agent.md` specification file defines the system prompt that transforms a base LLM into a domain-specific agent. The CLAUDE.md file itself serves as a system prompt for Claude Code sessions, establishing the platform's NO MERCY doctrine, quality standards, and operational protocols. The platform's approach treats system prompts as version-controlled, auditable configuration -- not as ephemeral text.

## Technical Deep Dive

### AIAD Agent System Prompt Structure

Each AIAD agent defines its system prompt through a structured specification:

```elixir
defmodule PrismaticAgents.SystemPrompt do
  @moduledoc """
  Builds system prompts for AIAD agents from their
  specification files and platform context.
  """

  @type prompt_config :: %{
    role: String.t(),
    domain: atom(),
    capabilities: [String.t()],
    constraints: [String.t()],
    doctrine: String.t(),
    examples: [map()],
    context: map()
  }

  @spec build(prompt_config()) :: String.t()
  def build(config) do
    """
    # Agent: #{config.role}

    ## Domain
    #{config.domain}

    ## Capabilities
    #{format_list(config.capabilities)}

    ## Constraints
    #{format_list(config.constraints)}

    ## Doctrine
    #{config.doctrine}

    ## Platform Context
    - Platform: Prismatic Platform (Elixir/OTP umbrella, 141 apps)
    - Quality Standard: 100/100, NO MERCY doctrine
    - OSINT Tools: 127 self-registering adapters
    - Storage: 7 pluggable backends via adapter pattern
    - Agent Count: 1,090 AIAD agents across 16 domains

    ## Response Format
    - Be direct, concise, and technical
    - Use {:ok, _} / {:error, _} patterns in code
    - Follow Elixir best practices (OTP-first, functional purity)
    - Include @spec annotations on all public functions
    """
  end

  defp format_list(items) do
    items |> Enum.map(&"- #{&1}") |> Enum.join("\n")
  end
end
```

### Dynamic Context Injection

System prompts can be enriched with runtime context:

```elixir
defmodule PrismaticAgents.ContextEnricher do
  @moduledoc """
  Enriches system prompts with live platform context.
  Injects current metrics, recent changes, and session state.
  """

  @spec enrich(String.t(), keyword()) :: String.t()
  def enrich(base_prompt, opts \\ []) do
    context_sections = [
      maybe_add_quality_context(opts),
      maybe_add_session_context(opts),
      maybe_add_codebase_context(opts)
    ]
    |> Enum.reject(&is_nil/1)
    |> Enum.join("\n\n")

    "#{base_prompt}\n\n## Live Context\n#{context_sections}"
  end

  defp maybe_add_quality_context(opts) do
    if Keyword.get(opts, :include_quality, false) do
      """
      ### Quality State
      - Score: 100/100
      - Warnings: 0
      - Dialyzer violations: 0
      - Credo violations: 0
      - QDP remaining: 0
      """
    end
  end

  defp maybe_add_session_context(opts) do
    if Keyword.get(opts, :include_session, false) do
      case load_latest_session() do
        {:ok, session} ->
          """
          ### Session Context
          - Previous session: #{session.description}
          - Key decisions: #{inspect(session.decisions)}
          - Pending items: #{inspect(session.next_steps)}
          """
        _ -> nil
      end
    end
  end

  defp maybe_add_codebase_context(opts) do
    if Keyword.get(opts, :include_codebase, false) do
      """
      ### Codebase State
      - Apps: 115 umbrella applications
      - Recent commits: #{recent_commit_summary()}
      - Modified files: #{modified_files_summary()}
      """
    end
  end

  defp load_latest_session do
    # Load from .claude/session-context/
    {:error, :not_implemented}
  end

  defp recent_commit_summary, do: "See git log"
  defp modified_files_summary, do: "See git status"
end
```

### Prompt Template System

The platform uses templates for consistent prompt construction across agent types:

```elixir
defmodule PrismaticAgents.PromptTemplates do
  @moduledoc """
  Standardized prompt templates for different agent archetypes.
  Ensures consistent behavior across agents of the same type.
  """

  @spec security_agent(String.t(), keyword()) :: String.t()
  def security_agent(specialization, opts \\ []) do
    """
    You are a security specialist agent focused on #{specialization}.

    ## Operating Principles
    - Follow NABLA epistemic framework: require signal plurality
    - Apply NO MERCY doctrine: zero tolerance for security gaps
    - Use evidence-based analysis: every claim needs backing
    - Preserve contradictions: conflicting signals are valuable

    ## Security Context
    - Authorized for: CTF, defensive research, authorized pentesting
    - Forbidden: malicious actions, unauthorized access, real exploits
    - Simulation only: synthetic data, no production access

    #{Keyword.get(opts, :additional_context, "")}
    """
  end

  @spec osint_agent(String.t(), keyword()) :: String.t()
  def osint_agent(domain, opts \\ []) do
    """
    You are an OSINT intelligence analyst specializing in #{domain}.

    ## Intelligence Standards
    - Multi-source verification required (NABLA signal plurality)
    - Confidence levels must be stated explicitly
    - Source provenance must be traceable
    - Temporal decay applies to all findings

    ## Available Tools
    - 157 OSINT tools across 7 categories
    - Tool execution via PrismaticOsintCore.ToolRegistry
    - Rate-limited external API access

    #{Keyword.get(opts, :additional_context, "")}
    """
  end
end
```

## Architecture & Implementation

System prompts in the Prismatic Platform are treated as code artifacts -- version-controlled, reviewed, tested, and deployed through the same CI/CD pipeline as application code. Each agent's `.agent.md` file in the `.aiad/agents/` directory contains the full system prompt specification in a structured YAML format.

The platform enforces consistency through the AIAD standard, which requires every agent specification to include: role definition, capability list, constraint list, doctrine alignment, enforcement block, and escalation protocol. This structured approach prevents "prompt drift" where system prompts diverge from intended behavior over time.

Context window management is a practical concern for system prompts. The platform's CLAUDE.md file alone is substantial; combined with session context, codebase state, and agent-specific instructions, system prompts must be engineered to stay within model context limits while preserving essential information. The platform uses tiered context injection -- mandatory context always included, optional context added based on available space.

## Usage in Prismatic Platform

System prompts are constructed and used across all agent interactions:

```elixir
# Build agent-specific system prompt
prompt = PrismaticAgents.PromptTemplates.security_agent("vulnerability analysis")
enriched = PrismaticAgents.ContextEnricher.enrich(prompt, include_quality: true)

# CLAUDE.md serves as the system prompt for Claude Code sessions
# AIAD .agent.md files serve as system prompts for specialized agents
```

## Cross-References

- [AIAD](/glossary/aiad/) - Agent specification standard defining system prompt structure
- [LLM](/glossary/llm/) - Language model that consumes system prompts
- **Temperature** - Parameter affecting response generation alongside prompts
- [Agent](/glossary/agent/) - Specialized entity created through system prompt configuration

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
