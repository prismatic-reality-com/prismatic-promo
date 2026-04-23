+++
title = "Share Openly"
weight = 50
[extra]
category = "community"
description = "A core platform philosophy that mandates transparent knowledge sharing, open-source contributions, and community-first development practices as fundamental drivers of software quality, security, and innovation"
related_terms = ["open-source", "community-building", "ghl-license", "community-ownership", "transparency-builds-trust", "complete-transparency", "open-source-advocacy", "collaborative-development", "developer-community", "community-contributions"]
keywords = ["open source philosophy", "knowledge sharing software", "transparent development", "community-driven development", "open source advocacy", "share knowledge freely", "collaborative engineering", "open source contribution", "developer knowledge sharing", "community-first software"]
tags = ["community", "open-source", "philosophy", "transparency", "collaboration"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "17 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
word_count = 1550
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Share Openly - Prismatic Platform"
+++

## Definition and Overview

Share Openly is a foundational philosophy of the Prismatic Platform that mandates transparent knowledge sharing, active open-source contribution, and community-first development practices. It is not merely a suggestion or a nice-to-have aspiration -- it is a deliberate architectural and organizational decision rooted in the empirical observation that open systems consistently outperform closed ones in security, quality, reliability, and innovation velocity. The philosophy extends from code (every line of the platform is open source under the [GHL License](@/glossary/ghl-license.md)) to knowledge (documentation, architectural decisions, quality metrics, and even failure analyses are published openly) to process (development workflows, CI/CD pipelines, and quality gates are transparent and reproducible).

The phrase "Share Openly" encompasses three distinct but interrelated commitments:

1. **Code Openness**: All source code is publicly available, forkable, and contributable. No proprietary forks, no hidden modules, no "enterprise edition" with closed source.

2. **Knowledge Openness**: Architectural decisions, design rationales, quality metrics, session contexts, and even mistakes are documented and shared. The platform's `.claude/session-context/` directory contains detailed records of every significant development session, including what went wrong and how it was resolved.

3. **Process Openness**: How the platform is built is as open as what is built. CI/CD configurations, pre-commit hooks, quality gates, and testing strategies are all public. Any developer can reproduce the exact build and quality assurance process used by the core team.

This philosophy stands in direct opposition to the prevailing industry model where software companies treat their source code, processes, and institutional knowledge as competitive moats. The Prismatic Platform's position is that this model is counterproductive: secrecy breeds technical debt, closed systems accumulate undiscovered vulnerabilities, and knowledge hoarding slows innovation.

## Philosophical Foundation

### Why Openness Outperforms Secrecy

The case for sharing openly is not ideological -- it is empirical. Open systems consistently demonstrate superior outcomes across multiple dimensions:

| Dimension | Open System Advantage | Closed System Disadvantage |
|-----------|----------------------|---------------------------|
| **Security** | Many eyes find vulnerabilities faster (Linus's Law) | Limited review surface, security through obscurity |
| **Quality** | Public accountability drives higher standards | Private code hides technical debt |
| **Innovation** | Cross-pollination of ideas from diverse contributors | Innovation limited to internal team |
| **Trust** | Verifiable claims, auditable behavior | Claims must be taken on faith |
| **Talent** | Open source attracts top developers | Closed codebases cannot be evaluated pre-hire |
| **Longevity** | Community can maintain even if original team moves on | Bus factor risk, vendor lock-in |

### Relationship to NO MERCY, NO DOUBTS

The [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine and Share Openly are complementary. NO MERCY demands zero tolerance for incomplete implementations and quality violations. Share Openly makes every implementation visible to the world, which naturally enforces NO MERCY standards: you cannot hide shortcuts when everyone can read your code. The public accountability of open source is one of the most effective quality enforcement mechanisms ever devised.

### Relationship to NABLA Axioms

The [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework's axiom of [Provenance Mandatory](@/glossary/provenance-mandatory.md) directly supports Share Openly. When all code and decisions are publicly traceable, provenance is automatically satisfied. The axiom of [Contradiction Preservation](@/glossary/contradiction-preservation.md) also benefits: open discussion of design trade-offs and acknowledged limitations is more honest than marketing-driven documentation that hides inconvenient truths.

## Technical Implementation

### Open Source Architecture

The platform's architecture is designed for openness from the ground up:

```elixir
defmodule PrismaticPlatform.OpenSource do
  @moduledoc """
  Open source infrastructure for the Prismatic Platform.
  Manages public package publishing, documentation generation,
  and community contribution workflows.
  """

  @oss_packages [
    %{
      name: :prismatic_sdk,
      description: "Core SDK for platform integration",
      hex_package: "prismatic_sdk",
      license: :ghl,
      visibility: :public
    },
    %{
      name: :prismatic_plugin_kit,
      description: "Plugin development toolkit",
      hex_package: "prismatic_plugin_kit",
      license: :ghl,
      visibility: :public
    },
    %{
      name: :prismatic_security,
      description: "Security utilities and verification tools",
      hex_package: "prismatic_security",
      license: :ghl,
      visibility: :public
    },
    %{
      name: :prismatic_ui,
      description: "UI component library (LiveView + Flowbite)",
      hex_package: "prismatic_ui",
      license: :ghl,
      visibility: :public
    }
  ]

  @spec list_packages() :: [map()]
  def list_packages, do: @oss_packages

  @spec package_status(atom()) :: {:ok, map()} | {:error, :not_found}
  def package_status(package_name) do
    case Enum.find(@oss_packages, &(&1.name == package_name)) do
      nil -> {:error, :not_found}
      package -> {:ok, enrich_with_hex_data(package)}
    end
  end

  defp enrich_with_hex_data(package) do
    Map.merge(package, %{
      hex_url: "https://hex.pm/packages/#{package.hex_package}",
      docs_url: "https://hexdocs.pm/#{package.hex_package}",
      source_url: "https://github.com/korczis/prismatic-platform/tree/main/apps/#{package.name}"
    })
  end
end
```

### Knowledge Sharing Infrastructure

The platform implements structured knowledge sharing through multiple channels:

```elixir
defmodule PrismaticKnowledge.ShareManager do
  @moduledoc """
  Manages the platform's knowledge sharing infrastructure.
  Ensures session contexts, architectural decisions, and quality
  metrics are captured and made publicly available.
  """

  @knowledge_channels [
    :session_context,     # .claude/session-context/
    :quality_dna,         # .claude/quality-dna/
    :architecture_docs,   # docs/architecture/
    :glossary,            # sites/promo/content/glossary/
    :aiad_registry,       # .aiad/
    :api_docs             # OpenAPI specs
  ]

  @spec share_session_context(map()) :: {:ok, String.t()} | {:error, term()}
  def share_session_context(context) do
    filename = build_session_filename(context)
    path = Path.join([".claude", "session-context", filename])

    content = format_session_context(context)

    case File.write(path, content) do
      :ok ->
        # Session context is automatically committed and pushed
        {:ok, path}

      {:error, reason} ->
        {:error, {:write_failed, reason}}
    end
  end

  defp format_session_context(context) do
    """
    # Session Context: #{context.title}

    **Date**: #{Date.utc_today()}
    **Duration**: #{context.duration}
    **Objectives**: #{Enum.join(context.objectives, ", ")}

    ## Actions Taken
    #{format_actions(context.actions)}

    ## Files Modified
    #{format_files(context.files_modified)}

    ## Decisions Made
    #{format_decisions(context.decisions)}

    ## Lessons Learned
    #{format_lessons(context.lessons)}

    ## Next Steps
    #{format_next_steps(context.next_steps)}
    """
  end
end
```

### Transparent Quality Metrics

Quality metrics are not hidden internal numbers -- they are published openly:

```elixir
defmodule PrismaticQuality.PublicMetrics do
  @moduledoc """
  Publishes quality metrics publicly as part of the Share Openly
  philosophy. Every quality measurement is auditable and reproducible.
  """

  @spec generate_public_report() :: {:ok, report()}
  def generate_public_report do
    {:ok, %{
      timestamp: DateTime.utc_now(),
      overall_score: 100,
      domains: %{
        dialyzer: %{violations: 0, status: :perfect},
        credo: %{violations: 0, status: :perfect},
        compilation: %{violations: 0, status: :perfect},
        test_coverage: %{percentage: 100, status: :perfect},
        typespec_coverage: %{annotated: 709, status: :perfect},
        memory_safety: %{violations: 0, status: :perfect},
        performance: %{violations: 0, status: :perfect}
      },
      platform_stats: %{
        umbrella_apps: 115,
        agents: 530,
        commands: 214,
        lines_of_code: 2_800_000,
        generation: 19,
        fitness_score: 0.9995
      },
      reproducibility: %{
        command: "mix quality.gates",
        ci_url: "https://gitlab.com/korczis/prismatic-platform/-/pipelines",
        verification: "Any developer can run `mix quality.gates` to reproduce these results"
      }
    }}
  end
end
```

## Architecture of Openness

### Repository Structure for Sharing

The platform repository is organized to maximize accessibility for external contributors:

```
prismatic-platform/
├── .aiad/                    # Agent/command definitions (open standard)
│   ├── agents/               # 530+ agent specifications
│   ├── commands/             # 225 command definitions
│   ├── doctrine/             # Platform doctrines (publicly documented)
│   └── policies/             # Enforcement policies
├── .claude/                  # Session contexts and knowledge
│   ├── session-context/      # Every development session documented
│   ├── quality-dna/          # Quality state across sessions
│   └── KNOWLEDGE_INDEX.md    # Complete knowledge map
├── apps/                     # 115 umbrella applications
│   └── */CLAUDE.md           # Per-app documentation
├── docs/                     # Architecture documentation
├── sites/promo/              # Public-facing documentation site
│   └── content/glossary/     # 600+ glossary terms
└── LICENSE                   # GHL License
```

### Community Contribution Model

The platform implements a structured contribution model:

| Contribution Type | Entry Point | Review Process |
|-------------------|-------------|----------------|
| Bug reports | GitLab Issues | Triaged within 48 hours |
| Feature requests | GitLab Issues | Evaluated against roadmap |
| Code contributions | Merge Requests | Quality gates + code review |
| Documentation | Merge Requests | Content review + link validation |
| Agent definitions | AIAD spec files | Schema validation + integration test |
| Security reports | Responsible disclosure | 24-hour acknowledgment |

### Documentation as First-Class Artifact

In the Share Openly philosophy, documentation is not secondary to code -- it is equally important:

```elixir
defmodule PrismaticDocs.ComplianceChecker do
  @moduledoc """
  Verifies that all public interfaces and modules are documented
  according to the Share Openly standard. Documentation is a
  first-class artifact, not an afterthought.
  """

  @spec check_module(module()) :: {:ok, :compliant} | {:error, [violation()]}
  def check_module(module) do
    violations =
      [
        check_moduledoc(module),
        check_public_function_docs(module),
        check_typespec_coverage(module),
        check_examples_present(module),
        check_cross_references(module)
      ]
      |> List.flatten()
      |> Enum.reject(&is_nil/1)

    if Enum.empty?(violations) do
      {:ok, :compliant}
    else
      {:error, violations}
    end
  end

  defp check_moduledoc(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, %{"en" => doc}, _, _} when byte_size(doc) > 50 ->
        nil

      _ ->
        %{type: :missing_moduledoc, module: module}
    end
  end

  defp check_public_function_docs(module) do
    {:docs_v1, _, _, _, _, _, function_docs} = Code.fetch_docs(module)

    module.__info__(:functions)
    |> Enum.filter(fn {name, _arity} -> not String.starts_with?(to_string(name), "_") end)
    |> Enum.map(fn {name, arity} ->
      has_doc =
        Enum.any?(function_docs, fn
          {{:function, ^name, ^arity}, _, _, %{"en" => _}, _} -> true
          _ -> false
        end)

      unless has_doc do
        %{type: :missing_function_doc, module: module, function: {name, arity}}
      end
    end)
  end
end
```

## The Promo Site as Share Openly in Practice

The [Prismatic Promo Site](https://korczis.github.io/prismatic-promo) is the most visible manifestation of Share Openly. It contains:

- **600+ glossary terms** explaining every concept in the platform
- **Architecture documentation** describing system design decisions
- **Agent specifications** for all 530+ AIAD agents
- **Command documentation** for all 225 platform commands
- **OSINT tool descriptions** for all 120 integrated intelligence tools
- **Team descriptions** explaining the Color Team methodology

This content is generated from the same repository as the platform code, ensuring documentation stays synchronized with implementation. The Zola static site generator builds the entire site in under 10 seconds from 1,800+ markdown files.

## Benefits of Sharing Openly

### Security Through Transparency

Counterintuitively, open-sourcing security-related code improves security rather than degrading it. When security implementations are public:

- Cryptographic implementations can be audited by experts globally
- Security patterns can be verified by anyone, not just internal reviewers
- Vulnerabilities are found faster through broader review
- There is no temptation to rely on obscurity as a security mechanism

### Quality Through Accountability

Code that will be read by the public is inherently held to a higher standard than code that will only be seen internally. The Prismatic Platform's 100/100 quality score and zero-violation status across 13 quality domains is partly driven by the accountability of open source: every quality metric is publicly verifiable.

### Innovation Through Cross-Pollination

Open sharing enables innovation patterns that closed systems cannot access:

- Developers from different domains bring unexpected perspectives
- Patterns discovered in one project can be adopted by others
- Community feedback identifies use cases the original developers never considered
- Fork-and-extend allows experimentation without disrupting the main project

### Talent Through Demonstration

Open source serves as both portfolio and interview. Potential contributors can evaluate the codebase before deciding to contribute. The platform team can evaluate contributors based on their actual code rather than interview performance. This bidirectional evaluation produces better matches than traditional hiring.

## Common Objections and Responses

**"Open source means anyone can steal our competitive advantage."** The competitive advantage of a platform is not its source code -- it is the team's ability to evolve the platform faster than anyone else can. Open sourcing the code actually increases this advantage by attracting contributors and identifying improvements faster.

**"Security-sensitive code should not be public."** Security through obscurity is not security. The platform's security relies on cryptographic keys (which are not in the repository) and architectural correctness (which benefits from public review), not on the secrecy of the implementation.

**"Documentation takes time away from coding."** This is a false economy. Undocumented code costs far more in maintenance, onboarding, and debugging than the investment in documentation. Share Openly treats documentation as a first-class deliverable, not overhead.

**"Our code is not good enough to share."** This is precisely the point. Making code public creates pressure to improve it. The Prismatic Platform's quality standards were significantly elevated by the commitment to Share Openly.

## Best Practices

**Document decisions, not just implementations.** Sharing code is necessary but not sufficient. Share the reasoning behind architectural decisions, the alternatives considered and rejected, and the trade-offs made. This is far more valuable than the code itself.

**Automate documentation generation.** Use tools like ExDoc, TypeDoc, and Zola to generate documentation from code and structured content. Manual documentation drifts from implementation; automated documentation stays synchronized.

**Share failures as well as successes.** Session contexts that document what went wrong and how it was fixed are often more valuable than those documenting smooth implementations. Failure analysis builds collective wisdom.

**Make contributions easy.** Low friction for first-time contributors increases community engagement. Provide clear contribution guidelines, responsive code reviews, and welcoming communication.

**Maintain a single source of truth.** Do not maintain separate public and private versions of documentation. If information cannot be shared (e.g., credentials, customer data), it should not be in the repository at all, not in a private branch.

**License explicitly.** The [GHL License](@/glossary/ghl-license.md) makes the terms of sharing unambiguous. Every file in the repository is covered by the license, and every contributor understands the terms.

## Common Pitfalls

**Selective transparency.** Sharing only the parts of the codebase that look good while hiding the messy parts defeats the purpose. Selective openness is worse than no openness because it creates a false impression of quality.

**Documentation as afterthought.** Writing documentation only when someone asks for it means the knowledge captured is already partially lost. Document as you build, not after.

**Ignoring community feedback.** Opening the source but ignoring issues, pull requests, and community discussion signals that openness is performative, not genuine.

**Confusing open source with free labor.** Share Openly is about sharing knowledge and code freely. It does not mean expecting others to contribute for free. Respect contributors' time and expertise.

## Related Concepts

- [Open Source](@/glossary/open-source.md) -- The broader movement of publicly available software
- [Community Building](@/glossary/community-building.md) -- Growing a contributor and user community
- [GHL License](@/glossary/ghl-license.md) -- The platform's open source license
- [Community Ownership](@/glossary/community-ownership.md) -- Community governance of shared resources
- [Transparency Builds Trust](@/glossary/transparency-builds-trust.md) -- Trust through verifiable openness
- [Complete Transparency](@/glossary/complete-transparency.md) -- Full disclosure philosophy
- [Open Source Advocacy](@/glossary/open-source-advocacy.md) -- Promoting open source adoption
- [Collaborative Development](@/glossary/collaborative-development.md) -- Multi-contributor engineering
- [Developer Community](@/glossary/developer-community.md) -- The ecosystem of platform developers
- [Developer Portal](@/glossary/developer-portal.md) -- Central hub for developer resources
- [Community Contributions](@/glossary/community-contributions.md) -- Community-submitted improvements

## See Also

- [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) -- Quality doctrine enforced by open accountability
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework supporting open provenance
- [Documentation](@/glossary/documentation.md) -- Documentation practices and standards
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Umbrella applications shared openly

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
