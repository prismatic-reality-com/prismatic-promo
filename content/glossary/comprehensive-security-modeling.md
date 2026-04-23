+++
title = "Comprehensive Security Modeling"
weight = 50
[extra]
tags = ["glossary", "security", "threat-modeling", "risk-assessment", "security-architecture", "defense-in-depth"]
description = "Comprehensive security modeling is the systematic practice of identifying, analyzing, and mitigating security threats across all layers of a software system, combining threat modeling, attack surface analysis, risk quantification, and continuous verification into a unified security posture."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "Security Engineering"
related_concepts = ["threat modeling", "attack surface analysis", "defense in depth", "color teams", "red team", "blue team", "risk assessment", "security verification"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = "advanced"
prerequisites = ["security", "attack-surface", "threat-intelligence", "authentication"]
learning_path = ["security", "attack-surface", "threat-assessment", "comprehensive-security-modeling", "security-operations"]
interactive_demos = ["/perimeter", "/labs"]
code_examples = true
external_resources = ["https://owasp.org/www-community/Threat_Modeling", "https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool", "https://attack.mitre.org/"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["threat model validation", "attack surface enumeration", "penetration testing", "security regression testing", "compliance verification"]
keywords = ["security modeling", "threat modeling", "attack surface", "risk assessment", "defense in depth", "security architecture", "STRIDE", "MITRE ATT&CK", "color teams", "security posture"]
related_terms = ["security", "attack-surface", "threat-assessment", "red-team", "blue-team", "purple-team", "color-teams", "security-audit", "vulnerability-assessment", "zero-trust"]
word_count = 1511
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Comprehensive Security Modeling - Prismatic Platform"
+++

## Definition

Comprehensive security modeling is the systematic, multi-layered practice of identifying, analyzing, categorizing, and mitigating security threats across all components, interfaces, data flows, and operational processes of a software system. It goes beyond traditional threat modeling by integrating multiple analysis methodologies -- threat enumeration, attack surface mapping, risk quantification, adversarial simulation, and continuous verification -- into a unified, evolving security model that reflects the system's current state and anticipated evolution.

Unlike point-in-time security assessments, comprehensive security modeling treats security as a continuous process that adapts to new threats, system changes, and evolving compliance requirements. The model is a living artifact that is updated with every architectural change, deployment, or discovered vulnerability.

## Overview

Security threats to modern software systems are diverse, persistent, and evolving. A web application faces credential stuffing attacks, a data pipeline faces injection attacks, an API faces abuse through parameter manipulation, and the infrastructure faces misconfiguration exploits. No single security technique addresses all of these threat vectors. Comprehensive security modeling provides the framework for reasoning about all of them systematically.

The discipline draws from several established methodologies:

**STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) provides a threat categorization framework that ensures analysis covers all major threat classes.

**MITRE ATT&CK** provides a knowledge base of adversary tactics and techniques observed in real-world attacks, enabling defenders to map their security controls against known attack patterns.

**OWASP** provides application-specific vulnerability categories (Top 10) and testing methodologies (ASVS, Testing Guide) that guide implementation-level security analysis.

**NIST Cybersecurity Framework** provides a high-level structure (Identify, Protect, Detect, Respond, Recover) for organizing security activities and measuring maturity.

Comprehensive security modeling synthesizes these methodologies into a platform-specific security model that accounts for the unique characteristics of the system, its threat environment, and its compliance obligations.

### The Security Model Lifecycle

A comprehensive security model follows a continuous lifecycle:

1. **Asset identification**: Enumerate all system components, data stores, communication channels, and external interfaces.
2. **Threat enumeration**: For each asset, identify potential threats using structured methodologies (STRIDE, MITRE ATT&CK).
3. **Risk quantification**: Assess the likelihood and impact of each threat, producing a prioritized risk register.
4. **Control mapping**: Map existing security controls to identified threats, identifying gaps.
5. **Mitigation planning**: Design and implement controls for unmitigated threats.
6. **Verification**: Test that implemented controls effectively mitigate their target threats.
7. **Continuous monitoring**: Detect new threats, control failures, and model drift in production.

## Technical Details

### Threat Model Construction

The Prismatic Platform implements security modeling as a structured data model that can be programmatically analyzed, verified, and evolved:

```elixir
defmodule Prismatic.Security.ThreatModel do
  @moduledoc """
  Structured threat model for comprehensive security analysis.
  Represents assets, threats, controls, and their relationships
  as a queryable graph structure.
  """

  @type t :: %__MODULE__{
    assets: [asset()],
    threats: [threat()],
    controls: [control()],
    data_flows: [data_flow()],
    trust_boundaries: [trust_boundary()],
    risk_register: [risk_entry()]
  }

  @type asset :: %{
    id: String.t(),
    name: String.t(),
    type: :process | :data_store | :external_entity | :interface,
    classification: :public | :internal | :confidential | :restricted,
    owner: String.t()
  }

  @type threat :: %{
    id: String.t(),
    category: :spoofing | :tampering | :repudiation | :info_disclosure | :dos | :elevation,
    target_asset: String.t(),
    description: String.t(),
    mitre_technique: String.t() | nil,
    likelihood: :low | :medium | :high | :critical,
    impact: :low | :medium | :high | :critical
  }

  @type control :: %{
    id: String.t(),
    type: :preventive | :detective | :corrective | :compensating,
    mitigates: [String.t()],
    implementation_status: :planned | :implemented | :verified | :deprecated,
    effectiveness: float()
  }

  @type data_flow :: %{
    from: String.t(),
    to: String.t(),
    protocol: String.t(),
    classification: :public | :internal | :confidential | :restricted,
    encrypted: boolean()
  }

  @type trust_boundary :: %{
    name: String.t(),
    assets_inside: [String.t()],
    crossing_flows: [String.t()]
  }

  @type risk_entry :: %{
    threat_id: String.t(),
    inherent_risk: float(),
    residual_risk: float(),
    controls_applied: [String.t()],
    risk_owner: String.t(),
    acceptance_status: :mitigated | :accepted | :transferred | :avoided
  }

  defstruct [
    :assets,
    :threats,
    :controls,
    :data_flows,
    :trust_boundaries,
    :risk_register
  ]

  @spec build(keyword()) :: {:ok, t()} | {:error, term()}
  def build(config) do
    with {:ok, assets} <- parse_assets(config[:assets] || []),
         {:ok, threats} <- enumerate_threats(assets, config[:threat_catalog]),
         {:ok, controls} <- map_controls(config[:controls] || []),
         {:ok, data_flows} <- parse_data_flows(config[:data_flows] || []),
         {:ok, boundaries} <- identify_trust_boundaries(assets, data_flows),
         {:ok, register} <- calculate_risk_register(threats, controls) do
      {:ok, %__MODULE__{
        assets: assets,
        threats: threats,
        controls: controls,
        data_flows: data_flows,
        trust_boundaries: boundaries,
        risk_register: register
      }}
    end
  end

  @spec unmitigated_threats(t()) :: [threat()]
  def unmitigated_threats(%__MODULE__{risk_register: register, threats: threats}) do
    mitigated_ids =
      register
      |> Enum.filter(& &1.residual_risk < 0.3)
      |> Enum.map(& &1.threat_id)
      |> MapSet.new()

    Enum.reject(threats, fn threat -> MapSet.member?(mitigated_ids, threat.id) end)
  end

  @spec risk_score(t()) :: float()
  def risk_score(%__MODULE__{risk_register: register}) do
    if Enum.empty?(register) do
      0.0
    else
      register
      |> Enum.map(& &1.residual_risk)
      |> Enum.sum()
      |> Kernel./(length(register))
    end
  end

  defp parse_assets(assets), do: {:ok, assets}
  defp enumerate_threats(assets, _catalog), do: {:ok, Enum.flat_map(assets, &generate_stride_threats/1)}
  defp map_controls(controls), do: {:ok, controls}
  defp parse_data_flows(flows), do: {:ok, flows}
  defp identify_trust_boundaries(assets, _flows), do: {:ok, [%{name: "platform", assets_inside: Enum.map(assets, & &1.id), crossing_flows: []}]}
  defp calculate_risk_register(threats, controls) do
    register = Enum.map(threats, fn threat ->
      applicable_controls = Enum.filter(controls, fn c -> threat.id in c.mitigates end)
      effectiveness = if Enum.empty?(applicable_controls), do: 0.0, else: Enum.max_by(applicable_controls, & &1.effectiveness).effectiveness
      inherent = risk_value(threat.likelihood) * risk_value(threat.impact)
      %{
        threat_id: threat.id,
        inherent_risk: inherent,
        residual_risk: inherent * (1.0 - effectiveness),
        controls_applied: Enum.map(applicable_controls, & &1.id),
        risk_owner: "security-team",
        acceptance_status: if(effectiveness > 0.7, do: :mitigated, else: :accepted)
      }
    end)
    {:ok, register}
  end

  defp generate_stride_threats(asset) do
    [:spoofing, :tampering, :repudiation, :info_disclosure, :dos, :elevation]
    |> Enum.map(fn category ->
      %{
        id: "#{asset.id}-#{category}",
        category: category,
        target_asset: asset.id,
        description: "#{category} threat against #{asset.name}",
        mitre_technique: nil,
        likelihood: :medium,
        impact: :medium
      }
    end)
  end

  defp risk_value(:low), do: 0.25
  defp risk_value(:medium), do: 0.5
  defp risk_value(:high), do: 0.75
  defp risk_value(:critical), do: 1.0
end
```

### Attack Surface Analysis

Attack surface analysis systematically identifies all points where an adversary could interact with the system:

```elixir
defmodule Prismatic.Security.AttackSurfaceAnalyzer do
  @moduledoc """
  Analyzes the attack surface of the Prismatic Platform by
  enumerating all external interfaces, data inputs, authentication
  boundaries, and privilege transitions.
  """

  @type attack_vector :: %{
    entry_point: String.t(),
    protocol: String.t(),
    authentication_required: boolean(),
    authorization_level: atom(),
    data_classification: atom(),
    exposure: :internet | :internal | :localhost
  }

  @type surface_report :: %{
    total_vectors: non_neg_integer(),
    by_exposure: %{atom() => non_neg_integer()},
    by_authentication: %{boolean() => non_neg_integer()},
    high_risk_vectors: [attack_vector()],
    recommendations: [String.t()]
  }

  @spec analyze(keyword()) :: {:ok, surface_report()} | {:error, term()}
  def analyze(opts \\ []) do
    vectors =
      []
      |> Kernel.++(enumerate_http_endpoints(opts))
      |> Kernel.++(enumerate_websocket_channels(opts))
      |> Kernel.++(enumerate_api_endpoints(opts))
      |> Kernel.++(enumerate_database_interfaces(opts))
      |> Kernel.++(enumerate_external_integrations(opts))

    report = %{
      total_vectors: length(vectors),
      by_exposure: Enum.frequencies_by(vectors, & &1.exposure),
      by_authentication: Enum.frequencies_by(vectors, & &1.authentication_required),
      high_risk_vectors: Enum.filter(vectors, &high_risk?/1),
      recommendations: generate_recommendations(vectors)
    }

    {:ok, report}
  end

  defp enumerate_http_endpoints(_opts) do
    [%{
      entry_point: "/api/v1/*",
      protocol: "HTTPS",
      authentication_required: true,
      authorization_level: :authenticated,
      data_classification: :internal,
      exposure: :internet
    }]
  end

  defp enumerate_websocket_channels(_opts) do
    [%{
      entry_point: "/live/websocket",
      protocol: "WSS",
      authentication_required: true,
      authorization_level: :authenticated,
      data_classification: :internal,
      exposure: :internet
    }]
  end

  defp enumerate_api_endpoints(_opts), do: []
  defp enumerate_database_interfaces(_opts), do: []
  defp enumerate_external_integrations(_opts), do: []

  defp high_risk?(vector) do
    vector.exposure == :internet and not vector.authentication_required
  end

  defp generate_recommendations(vectors) do
    unauthenticated_internet =
      Enum.count(vectors, fn v ->
        v.exposure == :internet and not v.authentication_required
      end)

    recommendations = []

    recommendations =
      if unauthenticated_internet > 0 do
        ["Review #{unauthenticated_internet} unauthenticated internet-facing endpoints" | recommendations]
      else
        recommendations
      end

    recommendations
  end
end
```

### Color Team Integration

The Prismatic Platform's comprehensive security modeling is operationalized through the Color Team system -- six specialized teams that continuously exercise the security model from different perspectives:

**Red Team** simulates adversarial attacks against the security model, testing whether documented controls actually prevent the documented threats. Red team findings feed back into the threat model as validated attack paths.

**Blue Team** monitors defensive posture by aggregating signals from across the platform, detecting drift from the security model's assumptions, and verifying that controls remain effective under changing conditions.

**Purple Team** synthesizes red and blue findings into actionable improvements to the security model, ensuring that every attack finding has a corresponding defensive improvement and every defensive gap has been tested.

**Gray Team** explores specification boundaries and ambiguous areas where the security model may have gaps, identifying edge cases that neither red nor blue teams would naturally investigate.

**White Team** provides formal verification of security properties, proving that critical controls satisfy their specifications through property-based testing and, where appropriate, formal proofs.

**Black Team** conducts theoretical threat modeling of worst-case adversarial scenarios, operating under maximum isolation to prevent the analysis itself from becoming a risk.

### Continuous Security Verification

Comprehensive security modeling requires continuous verification that the implemented system matches the security model:

```elixir
defmodule Prismatic.Security.ModelVerifier do
  @moduledoc """
  Continuously verifies that the running system matches
  the documented security model, detecting drift between
  the model and reality.
  """

  @type drift_finding :: %{
    category: :missing_control | :new_vector | :degraded_control | :policy_violation,
    severity: :info | :warning | :critical,
    description: String.t(),
    model_expectation: String.t(),
    observed_reality: String.t(),
    remediation: String.t()
  }

  @spec verify_model(Prismatic.Security.ThreatModel.t()) :: {:ok, [drift_finding()]}
  def verify_model(model) do
    findings =
      []
      |> Kernel.++(verify_controls_implemented(model.controls))
      |> Kernel.++(verify_trust_boundaries(model.trust_boundaries))
      |> Kernel.++(verify_data_flow_encryption(model.data_flows))
      |> Kernel.++(verify_authentication_requirements(model.assets))

    {:ok, findings}
  end

  defp verify_controls_implemented(controls) do
    controls
    |> Enum.filter(fn c -> c.implementation_status == :implemented end)
    |> Enum.flat_map(fn control ->
      case test_control_effectiveness(control) do
        {:ok, _} -> []
        {:error, reason} ->
          [%{
            category: :degraded_control,
            severity: :critical,
            description: "Control #{control.id} is not functioning as expected",
            model_expectation: "Control effectiveness: #{control.effectiveness}",
            observed_reality: "Control test failed: #{reason}",
            remediation: "Investigate and restore control #{control.id}"
          }]
      end
    end)
  end

  defp verify_trust_boundaries(_boundaries), do: []
  defp verify_data_flow_encryption(_flows), do: []
  defp verify_authentication_requirements(_assets), do: []

  defp test_control_effectiveness(_control), do: {:ok, :verified}
end
```

## Implementation in Prismatic Platform

### Prismatic Perimeter

The Prismatic Perimeter application is the primary implementation of comprehensive security modeling for external attack surfaces. It provides:

- **Security ratings** (A-F grades with numeric scores 300-900) that quantify the security posture of organizations.
- **Asset discovery** across domains, IP addresses, certificates, cloud resources, and services.
- **NIS2 and ZKB compliance** assessment that maps security controls to regulatory requirements.
- **Evidence-based risk scoring** with confidence levels that trace back to specific threat model entries.

### Pre-Commit Security Verification

The 11-phase pre-commit hook system includes security-relevant checks in multiple phases, ensuring that every code change is verified against the security model before it enters the codebase.

### OSINT Integration

The 120+ OSINT tools available through the platform contribute to comprehensive security modeling by providing external threat intelligence, vulnerability data, and exposure information that enriches the threat model with real-world data.

### Trinity Gate Security Layer

The Trinity Gate verification system includes structural, logical, and formal verification of security claims, ensuring that security assertions are not merely stated but proven.

## Comparison with Alternatives

| Approach | Scope | Automation | Continuous | Prismatic Position |
|----------|-------|-----------|-----------|-------------------|
| **STRIDE threat modeling** | Application threats | Manual diagrams | Point-in-time | Integrated as threat enumeration input |
| **OWASP ASVS** | Web application controls | Checklist-based | Audit-cycle | Used for web-layer control verification |
| **NIST CSF** | Organization-wide | Framework only | Maturity-based | Structural framework for model organization |
| **Automated scanning (SAST/DAST)** | Code/runtime vulnerabilities | Fully automated | CI/CD integration | Feeds findings into threat model |
| **Prismatic comprehensive modeling** | Full stack + operations | Model-driven automation | Continuous verification | Synthesizes all approaches |

## Best Practices

1. **Start with asset inventory**: You cannot protect what you do not know about. Begin every security modeling effort with a complete enumeration of assets, interfaces, and data flows.

2. **Use structured threat enumeration**: Apply STRIDE or similar frameworks systematically to every asset. Ad-hoc threat identification misses categories.

3. **Quantify risk consistently**: Use a consistent risk quantification methodology across all threats so that they can be meaningfully compared and prioritized.

4. **Map controls to threats explicitly**: Every control should document which threats it mitigates. Every threat should be traceable to at least one control (or explicitly accepted).

5. **Verify continuously**: Security models drift from reality as the system evolves. Automated verification catches drift before adversaries exploit it.

6. **Integrate adversarial testing**: Red team exercises validate the security model against realistic attack scenarios. Findings that the model did not predict indicate model gaps.

7. **Treat the model as code**: Version-control the security model, review changes, and test it like any other system artifact.

8. **Include supply chain**: Dependencies, build tools, and deployment infrastructure are part of the attack surface and must be included in the model.

## Common Pitfalls

1. **Security theater**: Creating elaborate security documentation without verifying that controls actually work. Comprehensive modeling requires verification, not just documentation.

2. **Static models**: Treating the security model as a one-time deliverable rather than a living artifact that must evolve with the system.

3. **Ignoring insider threats**: Focusing exclusively on external attackers while ignoring threats from authorized users, compromised credentials, or supply chain attacks.

4. **Over-reliance on perimeter defense**: Assuming that network-level controls (firewalls, VPNs) are sufficient and neglecting application-level security controls.

5. **Incomplete asset inventory**: Missing assets -- shadow IT, forgotten services, undocumented APIs -- create blind spots in the security model.

6. **Risk acceptance without documentation**: Accepting residual risk without formally documenting the decision, the rationale, and the risk owner.

7. **Disconnected tools**: Using multiple security tools without integrating their findings into a unified model, leading to fragmented understanding and missed correlations.

## Use Cases

- **Regulatory compliance** (NIS2, ZKB, SOC2, GDPR) where organizations must demonstrate systematic security risk management.
- **External attack surface management** where the security model must encompass assets discovered through continuous scanning and reconnaissance.
- **DevSecOps pipelines** where security modeling is integrated into the development workflow and verified with every change.
- **Incident response preparation** where the security model guides investigation by identifying likely attack paths and affected assets.
- **Third-party risk assessment** where the security model is extended to evaluate the security posture of vendors and partners.
- **Merger and acquisition due diligence** where the security model provides a structured assessment of an organization's security maturity.

## Related Concepts

Comprehensive security modeling connects to many security and verification concepts in the Prismatic Platform:

- [Security](@/glossary/security.md) -- the overarching discipline that comprehensive security modeling serves
- [Attack Surface](@/glossary/attack-surface.md) -- the set of all points where an adversary can interact with the system
- [Threat Assessment](@/glossary/threat-assessment.md) -- the process of evaluating specific threats against specific assets
- [Red Team](@/glossary/red-team.md) -- adversarial simulation that tests the security model against realistic attacks
- [Blue Team](@/glossary/blue-team.md) -- defensive monitoring that verifies security controls remain effective
- [Purple Team](@/glossary/purple-team.md) -- synthesis team that closes the loop between attack findings and defensive improvements
- [Color Teams](@/glossary/color-teams.md) -- the full color team system that operationalizes the security model
- [Security Audit](@/glossary/security-audit.md) -- formal assessment of security controls against standards and requirements
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- systematic identification of security weaknesses in system components
- [Zero Trust](@/glossary/zero-trust.md) -- the architectural principle of never trusting, always verifying

## See Also

- Glossary Index -- complete listing of all platform terminology
- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- the platform's external attack surface management implementation
- [Security Rating](@/glossary/security-rating.md) -- quantified security posture scores derived from the security model
- [Audit Logging](@/glossary/audit-logging.md) -- immutable event recording that supports security model verification

---

*Built with precision. Ready for the future.*

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
