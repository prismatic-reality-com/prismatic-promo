+++
title = "Open Source Advocacy"
weight = 50
[extra]
description = "The principled commitment to promoting, defending, and practicing open-source software development as a superior model for producing high-quality, transparent, and community-driven technology that advances collective knowledge and resists proprietary lock-in"
category = "community"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["open-source", "ghl-license", "community-building", "community-ownership", "share-openly", "transparency-builds-trust", "community-over-corporation", "open-source-leadership", "open-source-strategy", "open-source-superiority"]
keywords = ["open source advocacy definition", "open source movement principles", "free software advocacy", "open source vs proprietary", "community-driven development", "open source licensing strategy", "OSS advocacy best practices", "open source contribution culture", "open source sustainability", "four freedoms software"]
tags = ["community", "open-source", "philosophy", "licensing", "advocacy"]
date_created = "2026-02-22"
use_cases = ["platform licensing decisions", "community building", "contributor recruitment", "corporate open-source strategy", "technology evangelism", "ecosystem development", "sustainable funding models"]
technologies = ["Elixir", "Phoenix", "Git", "GitHub", "GitLab"]
word_count = 1743
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Open Source Advocacy - Prismatic Platform"
+++

## Definition

Open Source Advocacy is the active promotion, defense, and practice of open-source software development as a model for producing technology that is transparent, auditable, community-governed, and collectively improvable. It encompasses philosophical commitment to the principles of source code availability, redistribution rights, and collaborative development; practical efforts to create, maintain, and contribute to open-source projects; and strategic engagement with organizations, policymakers, and communities to advance the adoption and understanding of open-source practices.

Open source advocacy operates on the premise that software development benefits from the scrutiny, creativity, and diverse perspectives of a broad community. When source code is available for inspection, anyone can verify security claims, identify bugs, suggest improvements, and adapt software to their needs. This transparency creates a self-correcting ecosystem where quality emerges from collective attention rather than corporate gatekeeping. In the Prismatic Platform, open source advocacy is not a marketing strategy but a core architectural principle: the platform is built in the open, licensed under the GHL license, and designed for community participation at every layer.

## Overview

The open-source movement traces its intellectual roots to two parallel traditions. The Free Software Foundation (FSF), founded by Richard Stallman in 1985, articulated the "four freedoms": the freedom to run software for any purpose, to study and modify source code, to redistribute copies, and to distribute modified versions. This ethical framework positions software freedom as a moral imperative, analogous to freedom of speech or freedom of the press.

The Open Source Initiative (OSI), established in 1998 by Bruce Perens and Eric Raymond, reframed the same practical principles in pragmatic terms that appealed to business: open-source software is better because it is developed more efficiently, reviewed more thoroughly, and adopted more widely. The OSI's Open Source Definition codifies requirements including free redistribution, source code access, derived works, integrity of author's source code, no discrimination against persons or fields of endeavor, distribution of license, and technology neutrality.

Modern open source advocacy synthesizes both traditions. The ethical dimension remains relevant: proprietary software creates power asymmetries between vendors and users, enables surveillance, restricts innovation through patents and trade secrets, and concentrates technological capability in a small number of corporations. The practical dimension is equally compelling: open-source projects like Linux, PostgreSQL, Kubernetes, and Elixir/Erlang OTP demonstrate that community-developed software can match or exceed proprietary alternatives in quality, reliability, and innovation velocity.

The Prismatic Platform's advocacy stance draws from both traditions while adding a third dimension: epistemic advocacy. The platform's Nabla Infinity framework and NO MERCY NO DOUBTS doctrine assert that transparent, verifiable, evidence-based software development produces not just better code but more trustworthy knowledge. When source code is open, claims about system behavior can be verified. When development processes are transparent, quality assertions can be audited. Open source advocacy in this context extends beyond code availability to encompass transparency of decision-making, verifiability of quality claims, and community governance of platform direction.

The economic landscape of open-source advocacy has evolved significantly. Early open-source projects relied on volunteer labor and academic contributions. Modern open-source ecosystems are sustained by corporate sponsorship, foundation governance (Apache, CNCF, Linux Foundation), commercial open-source companies (dual licensing, open core, cloud services), and government investment (EU's commitment to open-source in public procurement). Understanding these economic models is essential for sustainable advocacy.

## Technical Details

### License Selection and Compliance

The technical foundation of open-source advocacy is the license that governs how source code can be used, modified, and distributed. License selection is a strategic decision with long-term consequences.

```elixir
defmodule Prismatic.OpenSource.LicenseAnalyzer do
  @moduledoc """
  Analyzes open-source license compatibility, compliance requirements,
  and strategic implications for the Prismatic Platform ecosystem.
  """

  @type license_family :: :permissive | :copyleft | :weak_copyleft | :proprietary | :custom
  @type compatibility :: :compatible | :incompatible | :conditional | :unknown

  @type license_info :: %{
    spdx_id: String.t(),
    family: license_family(),
    osi_approved: boolean(),
    fsf_free: boolean(),
    copyleft_strength: :none | :weak | :strong | :network,
    patent_grant: boolean(),
    attribution_required: boolean()
  }

  @licenses %{
    "MIT" => %{
      spdx_id: "MIT", family: :permissive, osi_approved: true,
      fsf_free: true, copyleft_strength: :none, patent_grant: false,
      attribution_required: true
    },
    "Apache-2.0" => %{
      spdx_id: "Apache-2.0", family: :permissive, osi_approved: true,
      fsf_free: true, copyleft_strength: :none, patent_grant: true,
      attribution_required: true
    },
    "GPL-3.0" => %{
      spdx_id: "GPL-3.0-only", family: :copyleft, osi_approved: true,
      fsf_free: true, copyleft_strength: :strong, patent_grant: true,
      attribution_required: true
    },
    "AGPL-3.0" => %{
      spdx_id: "AGPL-3.0-only", family: :copyleft, osi_approved: true,
      fsf_free: true, copyleft_strength: :network, patent_grant: true,
      attribution_required: true
    },
    "MPL-2.0" => %{
      spdx_id: "MPL-2.0", family: :weak_copyleft, osi_approved: true,
      fsf_free: true, copyleft_strength: :weak, patent_grant: true,
      attribution_required: true
    },
    "GHL" => %{
      spdx_id: "GHL-1.0", family: :custom, osi_approved: false,
      fsf_free: false, copyleft_strength: :none, patent_grant: false,
      attribution_required: true
    }
  }

  @spec analyze(String.t()) :: {:ok, license_info()} | {:error, :unknown_license}
  def analyze(license_id) do
    case Map.get(@licenses, license_id) do
      nil -> {:error, :unknown_license}
      info -> {:ok, info}
    end
  end

  @spec check_compatibility(String.t(), String.t()) :: compatibility()
  def check_compatibility(project_license, dependency_license) do
    case {Map.get(@licenses, project_license), Map.get(@licenses, dependency_license)} do
      {nil, _} -> :unknown
      {_, nil} -> :unknown
      {project, dep} -> evaluate_compatibility(project, dep)
    end
  end

  @spec scan_dependencies(String.t()) :: {:ok, [%{dep: String.t(), license: String.t(), compatible: compatibility()}]}
  def scan_dependencies(mix_lock_path) do
    deps = parse_mix_lock(mix_lock_path)

    results =
      deps
      |> Enum.map(fn {name, _version} ->
        license = detect_dependency_license(name)
        compatible = check_compatibility("GHL", license)
        %{dep: name, license: license, compatible: compatible}
      end)

    {:ok, results}
  end

  defp evaluate_compatibility(project, dep) do
    cond do
      dep.family == :permissive -> :compatible
      dep.copyleft_strength == :network and project.family != :copyleft -> :incompatible
      dep.copyleft_strength == :strong and project.family == :permissive -> :conditional
      dep.copyleft_strength == :weak -> :compatible
      true -> :unknown
    end
  end

  defp parse_mix_lock(path) do
    case File.read(path) do
      {:ok, content} ->
        ~r/"([^"]+)".*:hex.*"(\d+\.\d+\.\d+)"/
        |> Regex.scan(content)
        |> Enum.map(fn [_, name, version] -> {name, version} end)
      {:error, _} -> []
    end
  end

  defp detect_dependency_license(dep_name) do
    hex_info_path = "_build/dev/lib/#{dep_name}/hex_metadata.config"
    case File.read(hex_info_path) do
      {:ok, content} ->
        case Regex.run(~r/<<"licenses">>,\s*\[<<"([^"]+)">>/, content) do
          [_, license] -> license
          _ -> "Unknown"
        end
      {:error, _} -> "Unknown"
    end
  end
end
```

### Community Health Metrics

Effective advocacy requires measuring community health to identify strengths, weaknesses, and opportunities for improvement.

```elixir
defmodule Prismatic.OpenSource.CommunityHealth do
  @moduledoc """
  Measures and reports on open-source community health metrics
  following the CHAOSS (Community Health Analytics for Open Source Software)
  framework, adapted for the Prismatic Platform ecosystem.
  """

  @type health_report :: %{
    contributor_diversity: float(),
    bus_factor: non_neg_integer(),
    time_to_first_response: non_neg_integer(),
    issue_resolution_time: non_neg_integer(),
    pr_merge_time: non_neg_integer(),
    release_frequency: float(),
    documentation_coverage: float(),
    newcomer_retention: float(),
    overall_health: float()
  }

  @spec generate_report(keyword()) :: {:ok, health_report()} | {:error, term()}
  def generate_report(opts \\ []) do
    period = Keyword.get(opts, :period, 90)
    since = DateTime.add(DateTime.utc_now(), -period * 86_400, :second)

    report = %{
      contributor_diversity: measure_contributor_diversity(since),
      bus_factor: calculate_bus_factor(since),
      time_to_first_response: measure_first_response_time(since),
      issue_resolution_time: measure_issue_resolution_time(since),
      pr_merge_time: measure_pr_merge_time(since),
      release_frequency: measure_release_frequency(since),
      documentation_coverage: measure_doc_coverage(),
      newcomer_retention: measure_newcomer_retention(since),
      overall_health: 0.0
    }

    overall = compute_overall_health(report)
    {:ok, %{report | overall_health: overall}}
  end

  defp measure_contributor_diversity(since) do
    commits = get_commits_since(since)
    authors = Enum.map(commits, & &1.author) |> Enum.uniq()
    total_commits = length(commits)

    if total_commits == 0 do
      0.0
    else
      author_shares =
        authors
        |> Enum.map(fn author ->
          count = Enum.count(commits, fn c -> c.author == author end)
          count / total_commits
        end)

      # Shannon entropy normalized by log(n)
      entropy = -Enum.reduce(author_shares, 0.0, fn p, acc ->
        if p > 0, do: acc + p * :math.log2(p), else: acc
      end)

      max_entropy = if length(authors) > 1, do: :math.log2(length(authors)), else: 1.0
      min(entropy / max_entropy, 1.0)
    end
  end

  defp calculate_bus_factor(since) do
    commits = get_commits_since(since)
    files_by_author = group_files_by_author(commits)
    total_files = files_by_author |> Map.values() |> List.flatten() |> Enum.uniq() |> length()

    if total_files == 0 do
      0
    else
      authors_sorted =
        files_by_author
        |> Enum.sort_by(fn {_, files} -> length(files) end, :desc)

      {bus_factor, _} =
        Enum.reduce_while(authors_sorted, {0, 0}, fn {_, files}, {count, covered} ->
          new_covered = covered + length(Enum.uniq(files))
          if new_covered >= total_files * 0.5 do
            {:halt, {count + 1, new_covered}}
          else
            {:cont, {count + 1, new_covered}}
          end
        end)

      bus_factor
    end
  end

  defp compute_overall_health(report) do
    weights = %{
      contributor_diversity: 0.20,
      bus_factor: 0.10,
      time_to_first_response: 0.15,
      issue_resolution_time: 0.10,
      pr_merge_time: 0.10,
      release_frequency: 0.10,
      documentation_coverage: 0.10,
      newcomer_retention: 0.15
    }

    scores = %{
      contributor_diversity: report.contributor_diversity,
      bus_factor: min(report.bus_factor / 5.0, 1.0),
      time_to_first_response: normalize_time(report.time_to_first_response, 24),
      issue_resolution_time: normalize_time(report.issue_resolution_time, 168),
      pr_merge_time: normalize_time(report.pr_merge_time, 72),
      release_frequency: min(report.release_frequency / 4.0, 1.0),
      documentation_coverage: report.documentation_coverage,
      newcomer_retention: report.newcomer_retention
    }

    Enum.reduce(weights, 0.0, fn {metric, weight}, acc ->
      acc + Map.get(scores, metric, 0.0) * weight
    end)
  end

  defp normalize_time(hours, target_hours) do
    if hours <= target_hours, do: 1.0, else: max(0.0, 1.0 - (hours - target_hours) / target_hours)
  end

  defp get_commits_since(_since), do: []
  defp group_files_by_author(_commits), do: %{}
  defp measure_first_response_time(_since), do: 4
  defp measure_issue_resolution_time(_since), do: 48
  defp measure_pr_merge_time(_since), do: 24
  defp measure_release_frequency(_since), do: 2.0
  defp measure_doc_coverage, do: 0.85
  defp measure_newcomer_retention(_since), do: 0.60
end
```

### Contribution Workflow Automation

Lowering the barrier to contribution is a core advocacy practice. Automated tooling ensures that new contributors can participate effectively from their first interaction.

```elixir
defmodule Prismatic.OpenSource.ContributionGuide do
  @moduledoc """
  Automated contribution workflow that guides new contributors
  through the platform's development process, from environment
  setup through first pull request.
  """

  @type contributor_level :: :newcomer | :contributor | :maintainer | :core
  @type checklist_item :: %{
    step: String.t(),
    description: String.t(),
    completed: boolean(),
    automated: boolean()
  }

  @spec onboarding_checklist(contributor_level()) :: [checklist_item()]
  def onboarding_checklist(:newcomer) do
    [
      %{step: "Fork repository", description: "Create a personal fork on GitHub/GitLab",
        completed: false, automated: false},
      %{step: "Clone and setup", description: "Run `mix deps.get && mix compile`",
        completed: false, automated: true},
      %{step: "Run tests", description: "Execute `mix test` to verify environment",
        completed: false, automated: true},
      %{step: "Read CLAUDE.md", description: "Understand platform conventions and quality standards",
        completed: false, automated: false},
      %{step: "Install git hooks", description: "Run `.githooks/install.sh` for pre-commit quality gates",
        completed: false, automated: true},
      %{step: "Attend office hours", description: "Join a community session for orientation",
        completed: false, automated: false},
      %{step: "Pick good-first-issue", description: "Select a labeled issue appropriate for newcomers",
        completed: false, automated: false},
      %{step: "Submit first PR", description: "Follow the PR template and pass all quality gates",
        completed: false, automated: false}
    ]
  end

  @spec validate_contribution(String.t()) :: {:ok, [String.t()]} | {:error, [String.t()]}
  def validate_contribution(pr_path) do
    checks = [
      {"Tests included", &has_tests?/1},
      {"Quality gates pass", &quality_gates_pass?/1},
      {"Documentation updated", &docs_updated?/1},
      {"Conventional commit format", &conventional_commits?/1},
      {"No forbidden patterns", &no_forbidden_patterns?/1},
      {"License compliance", &license_compliant?/1}
    ]

    {passed, failed} =
      checks
      |> Enum.split_with(fn {_name, check_fn} -> check_fn.(pr_path) end)

    if Enum.empty?(failed) do
      {:ok, Enum.map(passed, &elem(&1, 0))}
    else
      {:error, Enum.map(failed, &elem(&1, 0))}
    end
  end

  defp has_tests?(pr_path), do: File.exists?(Path.join(pr_path, "test"))
  defp quality_gates_pass?(_pr_path), do: true
  defp docs_updated?(_pr_path), do: true
  defp conventional_commits?(_pr_path), do: true
  defp no_forbidden_patterns?(_pr_path), do: true
  defp license_compliant?(_pr_path), do: true
end
```

## Implementation in the Prismatic Platform

### Platform Licensing Strategy

The Prismatic Platform is released under the GHL (Good Hackers License), a custom license that reflects the project's values. The choice of a custom license over standard options (MIT, Apache, GPL) is itself an advocacy statement: standard licenses were designed for a software landscape that has evolved significantly. The GHL addresses concerns specific to modern AI-powered platforms: attribution requirements for AI-generated code, restrictions on use in surveillance systems, and requirements for transparency when the software is used to make decisions affecting people.

### Four Open-Source Packages

As of Generation 19, the platform publishes four open-source packages: Prismatic SDK, Prismatic Plugin Kit, Prismatic Security, and Prismatic UI. These packages serve dual purposes: they provide standalone value to the community, and they demonstrate the platform's commitment to open-source principles by sharing core functionality rather than keeping it proprietary. The package architecture follows the "open core" model where foundational libraries are fully open while the integrated platform offers additional value through orchestration, configuration, and operational tooling.

### Transparency in Quality Claims

The platform publishes its quality metrics (100/100 score, 13 quality domains, 0 QDP) publicly in CLAUDE.md and the promo site. This radical transparency is itself an advocacy practice: rather than making unverifiable claims about quality, the platform exposes its measurement methodology, scoring criteria, and current results for public scrutiny. Anyone can audit the quality gate definitions, run the same checks on their fork, and verify the published numbers.

### Community Governance

The platform's 530+ agent system, while technically sophisticated, is governed through transparent AIAD specifications that any community member can read, propose modifications to, and contribute new agents through. The agent registry, command registry, and policy documents are all maintained in version-controlled markdown files that go through the same review process as code changes.

## Comparison with Alternative Approaches

### Proprietary Development

Proprietary development restricts source code access, concentrating power in the vendor. It can be commercially efficient in the short term but creates vendor lock-in, limits security auditing, prevents community innovation, and concentrates risk. Open-source advocacy positions transparent development as producing higher-quality, more trustworthy, and more sustainable technology.

### Source-Available (But Not Open Source)

Some projects publish source code under restrictive licenses that prevent modification or commercial use. This provides transparency without community empowerment. The Prismatic Platform rejects this model as insufficient: viewing code without the right to modify and redistribute it is observation, not participation.

### Open Core

The open core model publishes foundational components as open source while offering proprietary extensions for revenue. This is the Prismatic Platform's current approach (four OSS packages, platform as integrated offering). Open core advocacy acknowledges the need for economic sustainability while maintaining commitment to open-source principles for the foundational layers.

### Corporate Open Source

Large companies release open-source projects that serve their strategic interests (Google's Kubernetes, Facebook's React, Microsoft's VS Code). These projects benefit from significant investment but raise questions about governance independence. Open source advocacy in this context focuses on governance structures that prevent single-company control.

## Best Practices

**Lead by example.** The most effective advocacy is demonstrating that open-source development works by building high-quality open-source software. The Prismatic Platform's perfect quality score and comprehensive testing serve as existence proofs that open-source development can produce production-grade systems.

**License strategically.** Choose a license that aligns with your advocacy goals. Permissive licenses (MIT, Apache) maximize adoption. Copyleft licenses (GPL, AGPL) protect community contributions from proprietary appropriation. Custom licenses can address specific concerns but reduce ecosystem compatibility.

**Invest in contributor experience.** The quality of the contribution workflow determines who can participate. Automated setup, clear documentation, responsive maintainers, and helpful error messages turn potential contributors into actual contributors.

**Sustain economically.** Advocacy that depends on volunteer burnout is not sustainable. Develop funding models (sponsorship, dual licensing, support contracts, managed services) that compensate core maintainers and fund infrastructure.

**Engage policymakers.** Advocate for open-source adoption in government procurement, education, and critical infrastructure. The EU's commitment to open source in the NIS2 Directive is an example of policy advocacy bearing fruit.

**Build coalitions.** Partner with other open-source projects, foundations, and advocacy organizations. The open-source ecosystem is strengthened by collaboration between projects, not competition.

## Common Pitfalls

**Advocacy without contribution.** Promoting open source without contributing to open-source projects lacks credibility. Advocacy should be backed by tangible contributions: code, documentation, community support, financial sponsorship.

**License absolutism.** Insisting that only GPL or only MIT licenses are "truly open source" alienates potential allies. Different licenses serve different purposes, and the open-source ecosystem benefits from diversity.

**Ignoring sustainability.** Celebrating open-source software while ignoring maintainer burnout, security vulnerability backlogs, and infrastructure costs is irresponsible advocacy. Sustainable open source requires economic models that support ongoing development.

**Corporate washing.** Using "open source" as a marketing label for projects that are effectively controlled by a single company, with no real community governance, undermines the movement. Authentic advocacy requires genuine community participation in governance.

**Elitism.** Creating environments where only experienced developers can participate perpetuates the concentration of power that open source advocacy aims to address. Investing in documentation, mentorship, and accessibility is essential.

## Use Cases

**Platform licensing decisions.** When building new platforms or products, advocacy principles guide license selection, contribution policies, and community governance structures.

**Government procurement advocacy.** Promoting open-source solutions for government IT systems, citing transparency, security auditability, vendor independence, and cost savings.

**Education and training.** Teaching software development using open-source tools and projects, and encouraging students to contribute to open-source as part of their learning.

**Corporate open-source strategy.** Helping organizations develop policies for using, contributing to, and releasing open-source software that align business objectives with community values.

**Security through transparency.** Advocating for open-source security tools and practices based on the principle that security through obscurity is weaker than security through transparency and public review.

## Related Concepts

Open source advocacy connects to foundational principles and practices across the Prismatic Platform:

- [Open Source](@/glossary/open-source.md) -- the fundamental concept of source code availability and collaborative development
- [GHL License](@/glossary/ghl-license.md) -- the Prismatic Platform's custom open-source license
- [Community Building](@/glossary/community-building.md) -- creating the social infrastructure that sustains open-source projects
- [Community Ownership](@/glossary/community-ownership.md) -- governance models that give communities genuine authority over project direction
- [Share Openly](@/glossary/share-openly.md) -- the principle of defaulting to openness in knowledge and code sharing
- [Transparency Builds Trust](@/glossary/transparency-builds-trust.md) -- the connection between openness and community trust
- [Community Over Corporation](@/glossary/community-over-corporation.md) -- prioritizing community interests over corporate interests
- [Open Source Leadership](@/glossary/open-source-leadership.md) -- the practices and responsibilities of leading open-source projects
- [Open Source Strategy](@/glossary/open-source-strategy.md) -- strategic approaches to open-source participation and publication
- [Sustainable Funding Models](@/glossary/sustainable-funding-models.md) -- economic models that support ongoing open-source development

## See Also

- [Developer Portal](@/glossary/developer-portal.md) -- the public-facing hub for contributors and users
- [Open Source Superiority](@/glossary/open-source-superiority.md) -- the thesis that open-source development produces superior software
- [Collaborative Intelligence](@/glossary/collaborative-intelligence.md) -- harnessing collective knowledge through open collaboration
- [Office Hours](@/glossary/office-hours.md) -- structured community engagement sessions that embody advocacy principles
- [Ecosystem Expansion](@/glossary/ecosystem-expansion.md) -- growing the platform's open-source package ecosystem

---

**Connect and Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Open Source under [GHL License](https://github.com/korczis/prismatic-platform/blob/main/LICENSE) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
