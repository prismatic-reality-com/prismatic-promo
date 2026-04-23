+++
title = "Competency"
weight = 50
[extra]
description = "A measurable skill proficiency level representing an individual's demonstrated ability to perform specific tasks within a defined domain"
category = "education"
related_terms = ["certification", "completion", "assessment", "curriculum", "comprehension"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["competency", "skill level", "proficiency", "learning outcome", "capability mapping", "glossary", "Prismatic Platform"]
tags = ["glossary", "education", "skills"]
quality_score = 75
see_also = ["capabilities", "academy"]
image = "/images/sections/glossary.png"
image_alt = "Competency - Prismatic Platform"
+++

## Definition & Overview

Competency is a measurable, demonstrable capability that combines knowledge, skills, and behaviors required to perform specific tasks effectively within a defined domain. Unlike simple knowledge (knowing facts) or skills (performing actions), competency integrates both with judgment -- the ability to apply the right knowledge and skills in the right context. Competency models typically define multiple proficiency levels, from novice awareness through expert mastery.

The concept originates from educational psychology (Bloom's Taxonomy, 1956) and was formalized for professional development by McClelland (1973), who argued that competencies predict job performance better than traditional aptitude tests. Modern competency frameworks like SFIA (Skills Framework for the Information Age), NICE (National Initiative for Cybersecurity Education), and the European e-Competence Framework provide standardized competency catalogs for the technology industry.

In the Prismatic Platform, competency is operationalized through the Academy's learning path system. Each topic registers its target competencies via the self-registering `PrismaticAcademy.Topic` behaviour, and the `ProgressTracker` GenServer monitors learner progress toward competency thresholds. Competencies map to the platform's three difficulty levels (beginner, intermediate, advanced) and serve as prerequisites for certification and elevated platform access.

## Technical Deep Dive

### Competency Proficiency Model

| Level | Label | Description | Assessment Method |
|-------|-------|-------------|-------------------|
| 1 | **Awareness** | Can recognize concepts and terminology | Multiple choice |
| 2 | **Knowledge** | Can explain concepts and relationships | Short answer |
| 3 | **Application** | Can apply concepts in guided scenarios | Lab exercises |
| 4 | **Analysis** | Can analyze complex situations independently | Case studies |
| 5 | **Synthesis** | Can create novel solutions combining multiple domains | Capstone project |
| 6 | **Mastery** | Can teach, evaluate, and advance the domain | Peer review + contribution |

### Competency Tracking Implementation

```elixir
defmodule PrismaticAcademy.CompetencyTracker do
  @moduledoc """
  Tracks learner competency progression across Academy topics.
  Competency levels are derived from topic completion, lab results,
  and assessment scores using a weighted evidence model.
  """

  @type competency_record :: %{
    learner_id: String.t(),
    domain: atom(),
    competency: String.t(),
    level: 1..6,
    evidence: [evidence()],
    last_assessed: DateTime.t()
  }

  @type evidence :: %{
    type: :topic_completion | :lab_result | :assessment | :peer_review,
    source_id: String.t(),
    score: float(),
    weight: float(),
    timestamp: DateTime.t()
  }

  @spec assess_competency(String.t(), atom(), String.t()) :: {:ok, competency_record()}
  def assess_competency(learner_id, domain, competency_name) do
    evidence = gather_evidence(learner_id, domain, competency_name)
    weighted_score = calculate_weighted_score(evidence)
    level = score_to_level(weighted_score)

    record = %{
      learner_id: learner_id,
      domain: domain,
      competency: competency_name,
      level: level,
      evidence: evidence,
      last_assessed: DateTime.utc_now()
    }

    {:ok, record}
  end

  @spec meets_prerequisite?(String.t(), atom(), String.t(), 1..6) :: boolean()
  def meets_prerequisite?(learner_id, domain, competency_name, required_level) do
    case assess_competency(learner_id, domain, competency_name) do
      {:ok, record} -> record.level >= required_level
      _ -> false
    end
  end

  defp gather_evidence(learner_id, domain, competency_name) do
    topic_evidence = gather_topic_completions(learner_id, domain, competency_name)
    lab_evidence = gather_lab_results(learner_id, domain, competency_name)
    assessment_evidence = gather_assessments(learner_id, domain, competency_name)

    topic_evidence ++ lab_evidence ++ assessment_evidence
  end

  defp calculate_weighted_score(evidence) do
    total_weight = Enum.sum(Enum.map(evidence, & &1.weight))

    if total_weight > 0 do
      weighted_sum = Enum.sum(Enum.map(evidence, fn e -> e.score * e.weight end))
      weighted_sum / total_weight
    else
      0.0
    end
  end

  defp score_to_level(score) when score >= 0.95, do: 6
  defp score_to_level(score) when score >= 0.85, do: 5
  defp score_to_level(score) when score >= 0.70, do: 4
  defp score_to_level(score) when score >= 0.55, do: 3
  defp score_to_level(score) when score >= 0.35, do: 2
  defp score_to_level(_score), do: 1

  defp gather_topic_completions(_learner_id, _domain, _name), do: []
  defp gather_lab_results(_learner_id, _domain, _name), do: []
  defp gather_assessments(_learner_id, _domain, _name), do: []
end
```

### Domain Competency Map

| Domain | Key Competencies | Academy Topics |
|--------|-----------------|----------------|
| **OSINT** | Signal synthesis, source evaluation, identity resolution | OSINTSignalSynthesis, SocialMediaOSINT |
| **Security** | Threat hunting, vulnerability assessment, incident response | AdvancedThreatHunting, APISecurityAnalysis |
| **Data Analysis** | Statistical reasoning, visualization, pattern recognition | Data analysis livebooks |
| **Platform** | OTP design, supervision trees, distributed systems | Architecture topics |
| **Compliance** | Regulatory knowledge, audit methodology, risk assessment | Compliance topics |

## Architecture & Implementation

The competency system is tightly integrated with the Academy's metaprogramming architecture. When a topic registers itself via `use PrismaticAcademy.Topic` and `register_topic/1`, it declares its target competencies as part of the topic configuration. The TopicRegistry stores these competency declarations in its ETS tables, and the InterconnectionEngine builds a competency dependency graph using `:digraph` that maps prerequisite relationships between competencies.

The ProgressTracker GenServer maintains per-learner competency state, updating competency levels as new evidence accumulates (topic completions, lab results, assessment scores). Each evidence item carries a weight and a timestamp, enabling time-decay adjustments where recent evidence counts more heavily than older evidence -- aligned with NABLA Infinity's Time Decay axiom.

Competency data feeds into multiple platform systems: the certification engine (prerequisites for credential issuance), the access control system (elevated permissions for higher competency levels), and the recommendation engine (suggesting next learning steps based on competency gaps).

## Usage in Prismatic Platform

The Academy dashboard at `/academy` displays competency radar charts showing a learner's profile across all domains. Gaps between current and target competency levels are highlighted, with recommended topics and labs to close each gap. The InterconnectionEngine suggests cross-domain learning paths that develop complementary competencies simultaneously.

For OSINT operations, competency levels determine which tools and capabilities an operator can access. Level 1-2 operators have access to basic lookup tools, while Level 5-6 operators can execute complex multi-source investigations and manage agent orchestration. This competency-gated access ensures that sensitive intelligence operations are conducted by appropriately skilled personnel.

The Color Team assignments consider competency profiles when composing team rosters. Red Team operations require high adversarial thinking competency, Blue Team operations require strong defensive analysis competency, and Purple Team synthesis requires both -- plus advanced synthesis and communication competencies.

## Cross-References

- [Certification](@/glossary/certification.md) - credential validation built on competency
- **Completion** - learning progress metric feeding competency
- [Assessment](@/glossary/assessment.md) - evaluation method for competency measurement
- [Curriculum](@/glossary/curriculum.md) - structured learning path developing competencies
- [Comprehension](@/glossary/comprehension.md) - understanding level within competency
- **Livebooks**: `livebooks/domains/academy_learning/` - competency tracking exercises
- **Academy**: All topics define target competencies via self-registration

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
