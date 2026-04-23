+++
title = "Security Modeling"
weight = 30
[extra]
description = "Formal and semi-formal techniques for representing, analyzing, and reasoning about security properties, threats, and controls in software systems"
category = "security"
related_terms = ["security-operations", "security-analyst", "threat-intelligence", "threat-assessment", "attack-surface", "risk-assessment", "zero-trust", "compliance-framework", "vulnerability-assessment", "adversarial-testing"]
keywords = ["security modeling methodology", "threat modeling STRIDE", "attack tree analysis", "security architecture modeling", "formal security verification", "STRIDE threat model", "DREAD risk scoring", "security property verification"]
tags = ["security", "modeling", "threat-modeling", "architecture", "formal-methods"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1342
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Modeling - Prismatic Platform"
+++

## Definition

Security modeling is the disciplined practice of creating formal and semi-formal representations of a system's security properties, threat landscape, trust boundaries, and defensive controls. It encompasses a family of analytical techniques -- threat modeling, attack tree analysis, security property verification, trust boundary mapping, and risk quantification -- that enable security professionals to reason systematically about what can go wrong, how likely it is, what the impact would be, and what controls are needed to bring risk to acceptable levels. Security modeling transforms security from a reactive discipline (responding to incidents after they occur) into a proactive engineering practice (designing systems that resist attacks by construction).

At its core, security modeling asks four fundamental questions articulated by Adam Shostack: (1) What are we building? (2) What can go wrong? (3) What are we going to do about it? (4) Did we do a good enough job? These questions, deceptively simple in formulation, require sophisticated analytical frameworks to answer rigorously. Security modeling provides those frameworks: data flow diagrams to answer question 1, threat taxonomies (STRIDE, MITRE ATT&CK, OWASP) to answer question 2, control catalogs and risk matrices to answer question 3, and verification methods (formal proofs, penetration testing, red teaming) to answer question 4.

## Overview

Security modeling exists because human intuition about security is consistently unreliable. Developers routinely underestimate the creativity of adversaries, overestimate the effectiveness of controls, and miss entire categories of threats because they think about systems from the perspective of legitimate use rather than adversarial abuse. Security modeling counteracts these cognitive biases by providing structured, systematic methods that force consideration of threats that intuition would overlook.

The practice has deep roots in both military strategic analysis and formal methods in computer science. Military threat modeling dates to Sun Tzu; formal security modeling began with Bell-LaPadula (1973) and the Clark-Wilson model (1987). Modern security modeling synthesizes these traditions into practical frameworks applicable to contemporary software systems.

| Modeling Approach | Origin | Strengths | Limitations |
|-------------------|--------|-----------|-------------|
| **STRIDE** | Microsoft (1999) | Structured threat categorization, accessible | Does not quantify risk |
| **Attack Trees** | Bruce Schneier (1999) | Visual, compositional, supports cost analysis | Can become large and complex |
| **DREAD** | Microsoft (2002) | Quantitative risk scoring | Subjective scoring, inconsistent |
| **PASTA** | Tony UcedaVelez (2012) | Business-aligned, risk-focused | Heavyweight process |
| **MITRE ATT&CK** | MITRE (2013) | Empirically grounded, adversary-behavior-focused | Primarily post-compromise |
| **LINDDUN** | KU Leuven (2011) | Privacy-focused threat modeling | Narrower scope (privacy only) |
| **Bell-LaPadula** | MITRE (1973) | Formally proven confidentiality properties | Does not address integrity |
| **Clark-Wilson** | Clark & Wilson (1987) | Integrity-focused, transaction-based | Complex to implement |

Within the Prismatic Platform, security modeling is operationalized through the [Color Teams](/glossary/color-teams/) framework, the [Perimeter](/glossary/attack-surface/) EASM system, and the formal verification infrastructure that proves security properties hold across system states.

## Technical Deep Dive

### Threat Modeling with STRIDE

STRIDE is the most widely adopted threat modeling framework. It categorizes threats into six types, each violating a specific security property:

| STRIDE Category | Security Property Violated | Example Threat |
|----------------|---------------------------|----------------|
| **S**poofing | Authentication | Attacker impersonates a legitimate user |
| **T**ampering | Integrity | Attacker modifies data in transit or at rest |
| **R**epudiation | Non-repudiation | Attacker denies performing an action |
| **I**nformation Disclosure | Confidentiality | Sensitive data exposed to unauthorized parties |
| **D**enial of Service | Availability | System rendered unavailable to legitimate users |
| **E**levation of Privilege | Authorization | Attacker gains higher privileges than authorized |

Implementing STRIDE analysis in the Prismatic Platform:

```elixir
defmodule PrismaticSecurity.ThreatModel do
  @moduledoc """
  STRIDE-based threat modeling engine for systematic
  identification and analysis of security threats.
  Operates on system data flow diagrams to produce
  comprehensive threat catalogs.
  """

  @type stride_category ::
    :spoofing | :tampering | :repudiation |
    :information_disclosure | :denial_of_service |
    :elevation_of_privilege

  @type threat :: %{
    id: String.t(),
    category: stride_category(),
    title: String.t(),
    description: String.t(),
    affected_component: String.t(),
    trust_boundary_crossed: boolean(),
    risk_score: float(),
    mitigations: [mitigation()],
    status: :identified | :mitigated | :accepted | :transferred
  }

  @type mitigation :: %{
    control: String.t(),
    effectiveness: :high | :medium | :low,
    implementation_status: :implemented | :planned | :not_planned
  }

  @type data_flow :: %{
    source: String.t(),
    destination: String.t(),
    data_classification: :public | :internal | :confidential | :restricted,
    protocol: String.t(),
    crosses_trust_boundary: boolean()
  }

  @type component :: %{
    name: String.t(),
    type: :process | :data_store | :external_entity,
    trust_level: :trusted | :semi_trusted | :untrusted,
    data_flows: [data_flow()]
  }

  @doc """
  Analyzes a system component for STRIDE threats.
  Each component type has different applicable threat categories:
  - Processes: all 6 STRIDE categories
  - Data stores: T, R, I, D
  - External entities: S, R
  - Data flows: T, I, D
  """
  @spec analyze_component(component()) :: [threat()]
  def analyze_component(%{type: :process} = component) do
    applicable_categories = [
      :spoofing, :tampering, :repudiation,
      :information_disclosure, :denial_of_service,
      :elevation_of_privilege
    ]

    Enum.flat_map(applicable_categories, fn category ->
      generate_threats(component, category)
    end)
  end

  def analyze_component(%{type: :data_store} = component) do
    applicable_categories = [
      :tampering, :repudiation,
      :information_disclosure, :denial_of_service
    ]

    Enum.flat_map(applicable_categories, fn category ->
      generate_threats(component, category)
    end)
  end

  def analyze_component(%{type: :external_entity} = component) do
    applicable_categories = [:spoofing, :repudiation]

    Enum.flat_map(applicable_categories, fn category ->
      generate_threats(component, category)
    end)
  end

  @doc """
  Performs STRIDE analysis across all components in a system model.
  Prioritizes threats that cross trust boundaries.
  """
  @spec analyze_system([component()]) :: %{
    total_threats: non_neg_integer(),
    by_category: %{stride_category() => non_neg_integer()},
    high_priority: [threat()],
    threats: [threat()]
  }
  def analyze_system(components) do
    all_threats = Enum.flat_map(components, &analyze_component/1)

    high_priority = Enum.filter(all_threats, fn threat ->
      threat.trust_boundary_crossed and threat.risk_score >= 0.7
    end)

    by_category = Enum.reduce(all_threats, %{}, fn threat, acc ->
      Map.update(acc, threat.category, 1, &(&1 + 1))
    end)

    %{
      total_threats: length(all_threats),
      by_category: by_category,
      high_priority: high_priority,
      threats: all_threats
    }
  end

  defp generate_threats(component, category) do
    templates = threat_templates(category)

    Enum.map(templates, fn template ->
      %{
        id: generate_threat_id(),
        category: category,
        title: String.replace(template.title, "{component}", component.name),
        description: String.replace(template.description, "{component}", component.name),
        affected_component: component.name,
        trust_boundary_crossed: has_boundary_crossing?(component),
        risk_score: calculate_initial_risk(category, component),
        mitigations: [],
        status: :identified
      }
    end)
  end

  defp threat_templates(:spoofing) do
    [%{
      title: "Identity spoofing of {component}",
      description: "An attacker could impersonate {component} to gain unauthorized access"
    }]
  end

  defp threat_templates(:tampering) do
    [%{
      title: "Data tampering in {component}",
      description: "An attacker could modify data processed or stored by {component}"
    }]
  end

  defp threat_templates(:repudiation) do
    [%{
      title: "Action repudiation at {component}",
      description: "A user could deny performing actions through {component} without audit trail"
    }]
  end

  defp threat_templates(:information_disclosure) do
    [%{
      title: "Information disclosure from {component}",
      description: "Sensitive information could be exposed through {component}"
    }]
  end

  defp threat_templates(:denial_of_service) do
    [%{
      title: "Denial of service against {component}",
      description: "An attacker could exhaust resources of {component}, causing unavailability"
    }]
  end

  defp threat_templates(:elevation_of_privilege) do
    [%{
      title: "Privilege escalation via {component}",
      description: "An attacker could gain elevated privileges through {component}"
    }]
  end

  defp has_boundary_crossing?(component) do
    Enum.any?(component.data_flows, & &1.crosses_trust_boundary)
  end

  defp calculate_initial_risk(category, component) do
    base = category_base_risk(category)
    boundary_modifier = if has_boundary_crossing?(component), do: 0.2, else: 0.0
    trust_modifier = trust_level_modifier(component.trust_level)

    min(base + boundary_modifier + trust_modifier, 1.0)
  end

  defp category_base_risk(:elevation_of_privilege), do: 0.8
  defp category_base_risk(:information_disclosure), do: 0.7
  defp category_base_risk(:tampering), do: 0.6
  defp category_base_risk(:spoofing), do: 0.6
  defp category_base_risk(:denial_of_service), do: 0.5
  defp category_base_risk(:repudiation), do: 0.4

  defp trust_level_modifier(:untrusted), do: 0.2
  defp trust_level_modifier(:semi_trusted), do: 0.1
  defp trust_level_modifier(:trusted), do: 0.0

  defp generate_threat_id do
    "THREAT-" <> (:crypto.strong_rand_bytes(6) |> Base.encode16(case: :upper))
  end
end
```

### Attack Tree Analysis

Attack trees provide a hierarchical decomposition of an adversary's goal into sub-goals, enabling quantitative analysis of attack feasibility and cost:

```elixir
defmodule PrismaticSecurity.AttackTree do
  @moduledoc """
  Attack tree construction and analysis for security modeling.
  Attack trees decompose adversary goals into sub-goals connected
  by AND/OR gates, enabling quantitative analysis of attack
  feasibility, cost, and required capability.
  """

  @type node_type :: :or | :and | :leaf

  @type attack_node :: %{
    id: String.t(),
    description: String.t(),
    node_type: node_type(),
    children: [attack_node()],
    cost: float() | nil,
    probability: float() | nil,
    skill_level: :novice | :intermediate | :expert | :nation_state,
    detection_difficulty: :easy | :moderate | :hard | :very_hard
  }

  @doc """
  Calculates the minimum cost to achieve the root goal.
  For OR nodes: minimum cost among children (cheapest path).
  For AND nodes: sum of all children costs (all required).
  """
  @spec minimum_attack_cost(attack_node()) :: float()
  def minimum_attack_cost(%{node_type: :leaf, cost: cost}), do: cost || :infinity

  def minimum_attack_cost(%{node_type: :or, children: children}) do
    children
    |> Enum.map(&minimum_attack_cost/1)
    |> Enum.min()
  end

  def minimum_attack_cost(%{node_type: :and, children: children}) do
    children
    |> Enum.map(&minimum_attack_cost/1)
    |> Enum.sum()
  end

  @doc """
  Calculates the probability of a successful attack.
  For OR nodes: 1 - product of (1 - p) for each child.
  For AND nodes: product of all child probabilities.
  """
  @spec attack_probability(attack_node()) :: float()
  def attack_probability(%{node_type: :leaf, probability: prob}), do: prob || 0.0

  def attack_probability(%{node_type: :or, children: children}) do
    complement_product = children
    |> Enum.map(&attack_probability/1)
    |> Enum.reduce(1.0, fn p, acc -> acc * (1.0 - p) end)

    1.0 - complement_product
  end

  def attack_probability(%{node_type: :and, children: children}) do
    children
    |> Enum.map(&attack_probability/1)
    |> Enum.reduce(1.0, fn p, acc -> acc * p end)
  end

  @doc """
  Identifies the cheapest attack path through the tree.
  Returns the sequence of leaf nodes representing the
  minimum-cost path to achieving the root goal.
  """
  @spec cheapest_path(attack_node()) :: [attack_node()]
  def cheapest_path(%{node_type: :leaf} = node), do: [node]

  def cheapest_path(%{node_type: :or, children: children}) do
    children
    |> Enum.map(fn child -> {minimum_attack_cost(child), cheapest_path(child)} end)
    |> Enum.min_by(fn {cost, _path} -> cost end)
    |> elem(1)
  end

  def cheapest_path(%{node_type: :and, children: children}) do
    Enum.flat_map(children, &cheapest_path/1)
  end
end
```

### Trust Boundary Analysis

Trust boundaries are the critical abstraction in security modeling -- they define where the system transitions between different levels of trust:

```elixir
defmodule PrismaticSecurity.TrustBoundary do
  @moduledoc """
  Trust boundary identification and analysis.
  Trust boundaries mark transitions between different trust
  levels in a system. Every data flow crossing a trust boundary
  is a potential attack vector that requires security controls.
  """

  @type trust_zone :: %{
    name: String.t(),
    trust_level: :external | :dmz | :internal | :privileged | :critical,
    components: [String.t()],
    controls: [control()]
  }

  @type control :: %{
    name: String.t(),
    type: :authentication | :authorization | :encryption | :validation |
          :logging | :rate_limiting | :filtering,
    strength: :strong | :moderate | :weak,
    verified: boolean()
  }

  @type boundary_crossing :: %{
    from_zone: trust_zone(),
    to_zone: trust_zone(),
    data_flow: String.t(),
    required_controls: [atom()],
    actual_controls: [control()],
    gap_analysis: [String.t()]
  }

  @doc """
  Analyzes all trust boundary crossings in a system model.
  Identifies gaps where required controls are missing or insufficient.
  """
  @spec analyze_boundaries([trust_zone()], [map()]) :: [boundary_crossing()]
  def analyze_boundaries(zones, data_flows) do
    zone_map = Map.new(zones, &{&1.name, &1})

    data_flows
    |> Enum.filter(fn flow ->
      source_zone = Map.get(zone_map, flow.source_zone)
      dest_zone = Map.get(zone_map, flow.dest_zone)
      source_zone != nil and dest_zone != nil and
        source_zone.trust_level != dest_zone.trust_level
    end)
    |> Enum.map(fn flow ->
      from = Map.fetch!(zone_map, flow.source_zone)
      to = Map.fetch!(zone_map, flow.dest_zone)
      required = required_controls(from.trust_level, to.trust_level)
      actual = find_actual_controls(from, to)
      gaps = identify_gaps(required, actual)

      %{
        from_zone: from,
        to_zone: to,
        data_flow: flow.description,
        required_controls: required,
        actual_controls: actual,
        gap_analysis: gaps
      }
    end)
  end

  defp required_controls(:external, :dmz) do
    [:authentication, :validation, :rate_limiting, :logging]
  end

  defp required_controls(:dmz, :internal) do
    [:authentication, :authorization, :encryption, :validation, :logging]
  end

  defp required_controls(:internal, :privileged) do
    [:authorization, :encryption, :logging]
  end

  defp required_controls(:privileged, :critical) do
    [:authorization, :encryption, :logging, :validation]
  end

  defp required_controls(_from, _to), do: [:logging]

  defp find_actual_controls(from_zone, to_zone) do
    from_zone.controls ++ to_zone.controls
  end

  defp identify_gaps(required, actual) do
    actual_types = Enum.map(actual, & &1.type)

    required
    |> Enum.reject(&(&1 in actual_types))
    |> Enum.map(&"Missing #{&1} control at trust boundary")
  end
end
```

## Platform Integration

### Security Modeling in the Prismatic Architecture

The Prismatic Platform applies security modeling at multiple layers:

| Layer | Modeling Technique | Application |
|-------|-------------------|-------------|
| **Network** | Trust boundary analysis | DMZ, internal zones, critical data stores |
| **Application** | STRIDE per component | LiveView endpoints, API gateway, GenServers |
| **Data** | Data flow diagrams | PII flows, credential management, audit trails |
| **Process** | Attack tree analysis | Authentication flows, authorization decisions |
| **Operational** | Risk quantification | Deployment security, supply chain analysis |

### Integration with Quality Gates

Security modeling results feed directly into the platform's [Quality Gates](/glossary/quality-gates/):

- **Pre-commit**: New code changes are checked against the threat model for affected components
- **CI/CD**: Security controls are verified for every deployment
- **Runtime**: [Monitoring](/glossary/monitoring/) validates that modeled security properties hold in production
- **Periodic review**: Threat models are refreshed when architecture changes or new threats emerge

### Color Team Security Modeling

The [Color Teams](/glossary/color-teams/) use security models as shared artifacts:

| Team | Use of Security Model |
|------|----------------------|
| **Red Team** | Uses attack trees to plan adversarial simulations |
| **Blue Team** | Uses STRIDE results to configure detection rules |
| **Purple Team** | Validates that Red findings are covered by Blue controls |
| **White Team** | Formally verifies security properties identified in the model |
| **Black Team** | Creates abstract threat models for theoretical worst cases |

## Industry Context

### Security Modeling Maturity

Organizations progress through security modeling maturity levels:

| Level | Description | Characteristics |
|-------|-------------|-----------------|
| **0: Ad Hoc** | No systematic security modeling | Security as afterthought, reactive only |
| **1: Initial** | Occasional threat modeling | Per-project, inconsistent methodology |
| **2: Defined** | Standardized methodology | Consistent use of STRIDE/PASTA, documented models |
| **3: Managed** | Quantitative risk analysis | Metrics-driven, cost-benefit analysis of controls |
| **4: Optimizing** | Continuous modeling | Automated, integrated into CI/CD, real-time updates |

### Regulatory Requirements

Multiple regulatory frameworks mandate or recommend security modeling:

| Framework | Requirement | Security Modeling Impact |
|-----------|------------|------------------------|
| **PCI DSS 4.0** | Requirement 6.3 | Threat modeling for custom applications |
| **NIST CSF 2.0** | ID.RA (Risk Assessment) | Systematic threat identification and analysis |
| **ISO 27001** | A.8 (Asset Management) | Risk-based security control selection |
| **NIS2 Directive** | Article 21 | Risk-based cybersecurity measures |
| **SOC 2** | CC3.2 | Risk assessment and threat identification |
| **GDPR** | Article 35 | Data Protection Impact Assessment (DPIA) |

## Anti-Patterns and Pitfalls

### Common Security Modeling Failures

| Anti-Pattern | Description | Remedy |
|-------------|-------------|--------|
| **Security theater modeling** | Creating models for compliance without genuine analysis | Tie models to real architectural decisions |
| **One-time modeling** | Modeling at design time, never updating | Integrate into CI/CD, refresh on architecture changes |
| **Threat list only** | Identifying threats without analyzing risk or planning mitigations | Complete the cycle: identify, analyze, mitigate, verify |
| **Over-modeling** | Spending months on exhaustive models before building | Iterative modeling aligned with development sprints |
| **Insider threat blindness** | Modeling only external threats | Include insider threat scenarios in trust boundary analysis |
| **Assumption blindness** | Not documenting trust assumptions | Explicitly list all assumptions in the threat model |

## Evolution and Future Directions

Security modeling is evolving in several directions:

- **Automated threat modeling**: Tools that analyze code, infrastructure-as-code, and architecture diagrams to automatically generate threat models
- **Continuous threat modeling**: Integration with CI/CD pipelines for real-time security model validation
- **AI-assisted modeling**: Language models that suggest threats and mitigations based on architectural patterns
- **Quantitative risk**: Moving from qualitative (high/medium/low) to quantitative (probabilistic, monetary) risk assessment using methods like FAIR (Factor Analysis of Information Risk)
- **Supply chain modeling**: Extending threat models to include third-party dependencies, build pipeline integrity, and software bill of materials (SBOM) analysis

The Prismatic Platform's integration of security modeling with [adversarial testing](/glossary/adversarial-testing/), [formal verification](/glossary/comprehensive-verification/), and the [Color Teams](/glossary/color-teams/) framework provides a comprehensive approach that addresses the full spectrum from theoretical threat analysis to empirical validation.

## Related Concepts

Security modeling connects to numerous platform concepts:

- [Security Operations](/glossary/security-operations/) -- The operational framework that consumes security model outputs
- [Security Analyst](/glossary/security-analyst/) -- The human role that performs and maintains security modeling
- [Attack Surface](/glossary/attack-surface/) -- The scope of exposure that security modeling maps
- [Threat Intelligence](/glossary/threat-intelligence/) -- External intelligence that informs threat model content
- [Risk Assessment](/glossary/risk-assessment/) -- Quantitative evaluation of threats identified by modeling
- [Zero Trust](/glossary/zero-trust/) -- Architecture paradigm that security modeling validates
- [Compliance Framework](/glossary/compliance-framework/) -- Regulatory requirements that drive modeling mandates
- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Tactical finding of weaknesses identified by models

## Summary

Security modeling provides the intellectual framework for reasoning about security before, during, and after system deployment. By systematically identifying threats through STRIDE analysis, quantifying attack feasibility through attack trees, mapping trust boundaries across architectural zones, and verifying that controls address identified risks, security modeling transforms security from hope-based assurance to evidence-based engineering. The Prismatic Platform operationalizes security modeling through automated threat analysis integrated with Color Team workflows, quality gates that enforce security controls, and formal verification that proves security properties hold. In a world where adversaries are creative, persistent, and well-resourced, security modeling is the discipline that ensures defenders think at least as systematically as attackers.

---

*Built with precision. Modeled against adversaries.*

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
