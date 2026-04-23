+++
title = "Defensive Posture"
weight = 50
[extra]
tags = ["glossary", "security", "blue-team", "color-teams", "threat-assessment", "posture", "defensive", "epistemic"]
description = "The assessed state of a system's defensive readiness against threats, evaluated by the Blue Team through multi-domain evidence synthesis including authentication boundaries, behavioral drift, configuration integrity, and cross-domain signal correlation"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Security Operations & Threat Defense"
related_concepts = ["blue-team", "defensive-security", "security-assessment", "color-teams", "threat-assessment", "security-rating", "easm"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 8
prerequisites = ["color-teams", "blue-team", "security-assessment", "threat-assessment", "nabla-infinity"]
learning_path = ["security-assessment", "threat-assessment", "blue-team", "defensive-posture", "color-teams", "security-rating", "easm"]
interactive_demos = ["/labs/glossary/defensive-posture"]
code_examples = ["Defensive posture evaluator GenServer", "Multi-domain evidence aggregator", "Posture scoring engine with drift detection"]
external_resources = ["https://www.nist.gov/cyberframework", "https://attack.mitre.org/", "https://owasp.org/www-project-top-ten/"]
version_introduced = "0.9.0"
stability_level = "stable"
testing_scenarios = ["posture degradation detection", "multi-domain signal correlation accuracy", "drift-induced posture change alerting", "Red-Blue loop closure verification"]
keywords = ["defensive posture", "security posture", "Blue Team", "threat readiness", "security assessment", "evidence synthesis", "drift detection", "posture scoring", "NIST framework", "attack surface"]
related_terms = ["blue-team", "defensive-security", "security-assessment", "color-teams", "threat-assessment", "security-rating", "easm", "attack-surface", "compliance-framework", "epistemic-robustness"]
word_count = 2050
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Defensive Posture - Prismatic Platform"
+++

## Definition

Defensive posture is the comprehensive, evidence-based assessment of a system's readiness to detect, resist, and recover from adversarial threats. It encompasses the current state of authentication boundaries, the integrity of configurations, the effectiveness of monitoring, the speed of incident response, and the overall resilience of the defense stack. Unlike a static security checklist, defensive posture is a dynamic, continuously evaluated measurement that reflects the system's actual defensive capability at any given moment.

In the Prismatic Platform, defensive posture is assessed by the [Blue Team](/glossary/blue-team/) through multi-domain evidence synthesis grounded in the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework. The Blue Team does not produce alerts or opinions; it produces structured evidence about the system's defensive state, evaluated against the platform's seven NABLA axioms. This evidence feeds into the [Purple Team](/glossary/color-teams/)'s synthesis process, where defensive posture is compared against adversarial findings from the [Red Team](/glossary/color-teams/) to identify gaps.

## Overview

Every system has a defensive posture, whether it is consciously assessed or not. An unmonitored system with default passwords and no patching has a defensive posture -- an extremely weak one. The value of explicitly measuring and tracking defensive posture lies in making the implicit explicit: transforming a vague sense of "we're probably secure" into a quantified, evidence-backed assessment that can drive investment, prioritize remediation, and satisfy compliance requirements.

The concept originates from military doctrine, where "defensive posture" describes a unit's preparation for enemy attack: positions fortified, fields of fire established, reserves positioned, communications tested. Translating this to cybersecurity, defensive posture encompasses network segmentation, access control configuration, vulnerability patch status, logging completeness, incident response readiness, and backup integrity.

The Prismatic Platform's approach to defensive posture is distinguished by its epistemic rigor. Traditional security tools generate alerts based on signature matching or threshold violations. The Blue Team instead produces evidence that passes through the NABLA axiom framework: evidence must come from multiple independent sources ([Signal Plurality](/glossary/signal-plurality/)), contradictory signals must be preserved ([Contradiction Preservation](/glossary/contradiction-preservation/)), and all evidence must have traceable provenance ([Provenance Mandatory](/glossary/provenance-mandatory/)). This approach eliminates false confidence and produces a posture assessment that genuinely reflects reality.

The defensive posture assessment integrates with the broader [Color Teams](/glossary/color-teams/) framework. The Red Team probes for weaknesses through simulated attacks. The Blue Team assesses the defense against those probes. The Purple Team synthesizes both perspectives into a unified understanding of the system's security state. The White Team verifies that defenses formally satisfy their specifications. This adversarial-defensive loop continuously refines the posture assessment.

## Technical Details

### Posture Dimensions

The Prismatic Platform evaluates defensive posture across seven dimensions, each contributing to the overall posture score:

**Authentication Boundary Integrity (ABI):** The strength and completeness of authentication mechanisms. Measured by: password policy compliance, MFA adoption rate, token expiration enforcement, session management correctness, API key rotation frequency.

**Configuration Integrity (CI):** The extent to which system configurations match their intended secure state. Measured by: configuration drift from baselines, unauthorized change detection, infrastructure-as-code compliance, secret management practices.

**Vulnerability Exposure (VE):** The system's exposure to known vulnerabilities. Measured by: patch currency (days since latest patches applied), CVE exposure count, critical vulnerability remediation time, dependency vulnerability status.

**Monitoring Completeness (MC):** The thoroughness of security monitoring and logging. Measured by: log coverage (percentage of components with active logging), alert rule coverage, log retention compliance, SIEM integration completeness.

**Incident Response Readiness (IRR):** The system's preparedness to respond to security incidents. Measured by: runbook completeness, mean time to detection (MTTD), mean time to response (MTTR), drill frequency, escalation path functionality.

**Network Segmentation (NS):** The effectiveness of network boundaries in containing lateral movement. Measured by: micro-segmentation implementation, firewall rule compliance, zero-trust architecture adoption, east-west traffic monitoring.

**Data Protection (DP):** The security of data at rest, in transit, and in use. Measured by: encryption coverage, key management practices, data classification completeness, DLP policy enforcement.

### Posture Scoring Model

Each dimension receives a score from 0.0 to 1.0 based on evidence evaluation. The overall posture score is a weighted average, with weights reflecting the dimension's importance in the current threat landscape:

| Dimension | Default Weight | Critical Adjustment |
|-----------|---------------|---------------------|
| Authentication Boundary | 0.20 | +0.05 during credential attacks |
| Configuration Integrity | 0.15 | +0.05 during supply chain threats |
| Vulnerability Exposure | 0.20 | +0.10 during active exploitation |
| Monitoring Completeness | 0.10 | +0.05 during incident investigation |
| Incident Response | 0.15 | +0.10 during active incidents |
| Network Segmentation | 0.10 | +0.05 during lateral movement |
| Data Protection | 0.10 | +0.05 during data breach scenarios |

The posture score maps to a qualitative grade consistent with the platform's [Security Rating](/glossary/security-rating/) system: A (0.90-1.00), B (0.80-0.89), C (0.70-0.79), D (0.60-0.69), F (below 0.60).

### Drift Detection

Defensive posture is not static; it degrades over time as configurations drift, patches fall behind, and threat landscapes evolve. The Blue Team's drift detection agents continuously monitor for posture degradation:

- **Configuration drift:** Detected by comparing current state against approved baselines
- **Behavioral drift:** Detected through anomaly detection on system behavior metrics
- **Dependency drift:** Detected by monitoring for newly disclosed vulnerabilities in dependencies
- **Performance drift:** Detected through latency and throughput baseline deviation

## Implementation in Prismatic Platform

### Defensive Posture Evaluator

The posture evaluator aggregates evidence from multiple Blue Team agents into a unified assessment:

```elixir
defmodule Prismatic.Security.DefensivePosture do
  @moduledoc """
  Evaluates the platform's defensive posture through multi-domain
  evidence synthesis.

  Aggregates signals from Blue Team specialists (auth sentinel,
  drift detector, signal aggregator) into a scored, evidence-backed
  posture assessment. All evidence passes NABLA axiom validation.
  """

  use GenServer

  alias Prismatic.Security.PostureScore
  alias Prismatic.Nabla.AxiomValidator

  @type dimension ::
          :authentication_boundary
          | :configuration_integrity
          | :vulnerability_exposure
          | :monitoring_completeness
          | :incident_response
          | :network_segmentation
          | :data_protection

  @type evidence :: %{
    dimension: dimension(),
    source: String.t(),
    score: float(),
    confidence: float(),
    timestamp: DateTime.t(),
    details: map()
  }

  @type posture_assessment :: %{
    overall_score: float(),
    grade: :a | :b | :c | :d | :f,
    dimensions: %{dimension() => float()},
    evidence_count: non_neg_integer(),
    assessed_at: DateTime.t(),
    drift_detected: boolean(),
    alerts: [String.t()]
  }

  @default_weights %{
    authentication_boundary: 0.20,
    configuration_integrity: 0.15,
    vulnerability_exposure: 0.20,
    monitoring_completeness: 0.10,
    incident_response: 0.15,
    network_segmentation: 0.10,
    data_protection: 0.10
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec submit_evidence(evidence()) :: :ok | {:error, :axiom_violation, atom()}
  def submit_evidence(evidence) do
    GenServer.call(__MODULE__, {:submit_evidence, evidence})
  end

  @spec assess() :: {:ok, posture_assessment()}
  def assess do
    GenServer.call(__MODULE__, :assess)
  end

  @spec get_dimension(dimension()) :: {:ok, float(), [evidence()]} | {:error, :no_evidence}
  def get_dimension(dimension) do
    GenServer.call(__MODULE__, {:get_dimension, dimension})
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:posture_evidence, [:bag, :protected])

    state = %{
      table: table,
      weights: @default_weights,
      last_assessment: nil,
      assessment_interval: :timer.minutes(5)
    }

    schedule_periodic_assessment(state.assessment_interval)
    {:ok, state}
  end

  @impl true
  def handle_call({:submit_evidence, evidence}, _from, state) do
    case AxiomValidator.validate_evidence(evidence) do
      {:ok, :valid} ->
        :ets.insert(state.table, {evidence.dimension, evidence})
        emit_telemetry(:evidence_submitted, evidence)
        {:reply, :ok, state}

      {:error, :axiom_violation, axiom} ->
        emit_telemetry(:evidence_rejected, %{evidence: evidence, axiom: axiom})
        {:reply, {:error, :axiom_violation, axiom}, state}
    end
  end

  @impl true
  def handle_call(:assess, _from, state) do
    assessment = compute_assessment(state)
    {:reply, {:ok, assessment}, %{state | last_assessment: assessment}}
  end

  @impl true
  def handle_call({:get_dimension, dimension}, _from, state) do
    case :ets.lookup(state.table, dimension) do
      [] ->
        {:reply, {:error, :no_evidence}, state}

      entries ->
        evidence_list = Enum.map(entries, fn {_dim, ev} -> ev end)
        score = compute_dimension_score(evidence_list)
        {:reply, {:ok, score, evidence_list}, state}
    end
  end

  @impl true
  def handle_info(:periodic_assessment, state) do
    assessment = compute_assessment(state)

    if state.last_assessment do
      check_posture_drift(state.last_assessment, assessment)
    end

    schedule_periodic_assessment(state.assessment_interval)
    {:noreply, %{state | last_assessment: assessment}}
  end

  @spec compute_assessment(map()) :: posture_assessment()
  defp compute_assessment(state) do
    dimensions = Map.keys(state.weights)
      |> Map.new(fn dim ->
        case :ets.lookup(state.table, dim) do
          [] -> {dim, 0.0}
          entries ->
            evidence_list = Enum.map(entries, fn {_d, ev} -> ev end)
            {dim, compute_dimension_score(evidence_list)}
        end
      end)

    overall = dimensions
      |> Enum.reduce(0.0, fn {dim, score}, acc ->
        weight = Map.fetch!(state.weights, dim)
        acc + score * weight
      end)

    evidence_count = :ets.info(state.table, :size)

    alerts = dimensions
      |> Enum.filter(fn {_dim, score} -> score < 0.60 end)
      |> Enum.map(fn {dim, score} ->
        "CRITICAL: #{dim} at #{Float.round(score, 2)} (below 0.60 threshold)"
      end)

    %{
      overall_score: Float.round(overall, 4),
      grade: PostureScore.to_grade(overall),
      dimensions: dimensions,
      evidence_count: evidence_count,
      assessed_at: DateTime.utc_now(),
      drift_detected: length(alerts) > 0,
      alerts: alerts
    }
  end

  @spec compute_dimension_score([evidence()]) :: float()
  defp compute_dimension_score(evidence_list) do
    recent = evidence_list
      |> Enum.sort_by(& &1.timestamp, {:desc, DateTime})
      |> Enum.take(10)

    if Enum.empty?(recent) do
      0.0
    else
      weighted_sum = Enum.reduce(recent, 0.0, fn ev, acc ->
        acc + ev.score * ev.confidence
      end)

      total_weight = Enum.reduce(recent, 0.0, fn ev, acc ->
        acc + ev.confidence
      end)

      if total_weight > 0, do: weighted_sum / total_weight, else: 0.0
    end
  end

  @spec check_posture_drift(posture_assessment(), posture_assessment()) :: :ok
  defp check_posture_drift(previous, current) do
    drift = abs(current.overall_score - previous.overall_score)

    if drift > 0.05 do
      emit_telemetry(:posture_drift_detected, %{
        previous_score: previous.overall_score,
        current_score: current.overall_score,
        drift_magnitude: drift,
        degraded_dimensions: find_degraded_dimensions(previous, current)
      })
    end

    :ok
  end

  @spec find_degraded_dimensions(posture_assessment(), posture_assessment()) :: [dimension()]
  defp find_degraded_dimensions(previous, current) do
    Map.keys(current.dimensions)
    |> Enum.filter(fn dim ->
      prev_score = Map.get(previous.dimensions, dim, 0.0)
      curr_score = Map.get(current.dimensions, dim, 0.0)
      curr_score < prev_score - 0.05
    end)
  end

  defp schedule_periodic_assessment(interval) do
    Process.send_after(self(), :periodic_assessment, interval)
  end

  defp emit_telemetry(event, metadata) do
    :telemetry.execute(
      [:prismatic, :security, :defensive_posture, event],
      %{count: 1},
      metadata
    )
  end
end
```

### Posture Score Grade Mapper

```elixir
defmodule Prismatic.Security.PostureScore do
  @moduledoc """
  Maps numerical posture scores to letter grades and provides
  threshold validation for security rating compliance.
  """

  @type grade :: :a | :b | :c | :d | :f

  @spec to_grade(float()) :: grade()
  def to_grade(score) when score >= 0.90, do: :a
  def to_grade(score) when score >= 0.80, do: :b
  def to_grade(score) when score >= 0.70, do: :c
  def to_grade(score) when score >= 0.60, do: :d
  def to_grade(_score), do: :f

  @spec meets_threshold?(float(), grade()) :: boolean()
  def meets_threshold?(score, required_grade) do
    grade_order = %{a: 5, b: 4, c: 3, d: 2, f: 1}
    actual = Map.fetch!(grade_order, to_grade(score))
    required = Map.fetch!(grade_order, required_grade)
    actual >= required
  end

  @spec format(float()) :: String.t()
  def format(score) do
    grade = to_grade(score)
    percentage = Float.round(score * 100, 1)
    "#{String.upcase(to_string(grade))} (#{percentage}%)"
  end
end
```

### Blue Team Signal Aggregator Integration

The Blue Team's signal aggregator feeds evidence into the defensive posture evaluator:

```elixir
defmodule Prismatic.BlueTeam.PostureFeeder do
  @moduledoc """
  Feeds Blue Team specialist findings into the defensive posture
  evaluator. Converts specialist-specific signals into standardized
  posture evidence with NABLA-compliant metadata.
  """

  alias Prismatic.Security.DefensivePosture

  @spec feed_auth_sentinel_finding(map()) :: :ok | {:error, term()}
  def feed_auth_sentinel_finding(finding) do
    evidence = %{
      dimension: :authentication_boundary,
      source: "blue-auth-sentinel",
      score: calculate_auth_score(finding),
      confidence: Map.get(finding, :confidence, 0.85),
      timestamp: DateTime.utc_now(),
      details: %{
        finding_type: finding.type,
        affected_component: finding.component,
        severity: finding.severity
      }
    }

    DefensivePosture.submit_evidence(evidence)
  end

  @spec feed_drift_detection(map()) :: :ok | {:error, term()}
  def feed_drift_detection(finding) do
    dimension = classify_drift_dimension(finding.drift_type)

    evidence = %{
      dimension: dimension,
      source: "blue-drift-detector",
      score: 1.0 - finding.drift_magnitude,
      confidence: Map.get(finding, :confidence, 0.80),
      timestamp: DateTime.utc_now(),
      details: %{
        drift_type: finding.drift_type,
        baseline: finding.baseline,
        current: finding.current,
        drift_rate: finding.drift_rate
      }
    }

    DefensivePosture.submit_evidence(evidence)
  end

  @spec calculate_auth_score(map()) :: float()
  defp calculate_auth_score(%{severity: :critical}), do: 0.20
  defp calculate_auth_score(%{severity: :high}), do: 0.40
  defp calculate_auth_score(%{severity: :medium}), do: 0.65
  defp calculate_auth_score(%{severity: :low}), do: 0.85
  defp calculate_auth_score(%{severity: :info}), do: 0.95
  defp calculate_auth_score(_), do: 0.50

  @spec classify_drift_dimension(atom()) :: DefensivePosture.dimension()
  defp classify_drift_dimension(:configuration), do: :configuration_integrity
  defp classify_drift_dimension(:behavioral), do: :monitoring_completeness
  defp classify_drift_dimension(:dependency), do: :vulnerability_exposure
  defp classify_drift_dimension(:performance), do: :network_segmentation
  defp classify_drift_dimension(_), do: :configuration_integrity
end
```

## Comparison with Alternatives

### Defensive Posture vs. Vulnerability Count

Many organizations measure security by counting vulnerabilities: "we have 47 critical, 230 high." This raw count provides no context about exploit probability, compensating controls, or business impact. Defensive posture provides a multidimensional assessment that accounts for these factors, producing an actionable score rather than an overwhelming list.

### Defensive Posture vs. Compliance Checkbox

Compliance frameworks (SOC2, ISO 27001) define controls that must be implemented. Passing an audit means controls exist on paper. Defensive posture measures whether controls actually function: are logs actually being reviewed? Are alerts actually being responded to? Are patches actually being applied? Compliance says "we have a firewall"; posture says "the firewall blocks 98.7% of unauthorized traffic."

### Defensive Posture vs. Penetration Test Results

Penetration tests provide point-in-time snapshots of vulnerability. Defensive posture provides continuous assessment. A system might pass a penetration test on Monday and have degraded posture by Friday due to configuration drift. The Prismatic Platform's continuous posture evaluation detects this degradation in near real-time.

### NIST CSF vs. Prismatic Posture Model

The NIST Cybersecurity Framework (CSF) defines five functions: Identify, Protect, Detect, Respond, Recover. The Prismatic posture model maps to these functions but adds epistemic rigor through NABLA axiom enforcement. NIST CSF assessments often rely on subjective maturity ratings; Prismatic posture assessments are computed from machine-verifiable evidence with quantified confidence scores.

### SecurityScorecard/BitSight vs. Prismatic Security Rating

Commercial rating platforms like SecurityScorecard and BitSight assess external-facing security signals. The Prismatic Platform's [Prismatic Perimeter](/glossary/easm/) provides similar external assessment, but defensive posture also incorporates internal signals that external scanners cannot observe: internal configuration state, authentication patterns, and response readiness.

## Best Practices

**Assess continuously, not periodically.** Defensive posture changes constantly. Monthly or quarterly assessments miss the daily degradation that accumulates between assessments. The platform evaluates posture every five minutes with sub-second evidence ingestion from Blue Team agents.

**Require evidence from multiple independent sources.** A single monitoring tool saying "everything is fine" is insufficient. The NABLA [Signal Plurality](/glossary/signal-plurality/) axiom requires confirmation from at least two independent sources before updating posture scores. This prevents single-source blindness.

**Preserve contradictory signals.** If the auth sentinel reports strong authentication while the drift detector reports credential reuse patterns, both signals must be preserved and investigated. The [Contradiction Preservation](/glossary/contradiction-preservation/) axiom prevents the posture system from smoothing over inconvenient contradictions.

**Weight dimensions dynamically.** During an active ransomware campaign targeting your industry, vulnerability exposure should be weighted higher than normal. During a supply chain attack wave, configuration integrity becomes more critical. Dynamic weighting ensures the posture assessment reflects the current threat landscape.

**Track posture trends, not just current state.** A posture score of B today is concerning if it was A last week, but encouraging if it was D last month. Trend analysis reveals whether security investments are producing results and whether posture is degrading faster than it is improving.

**Integrate with the Red-Blue loop.** Defensive posture assessment is most valuable when it incorporates Red Team findings. A dimension might score well against Blue Team monitoring but poorly when the Red Team's adversarial simulations expose blind spots. The [Purple Team](/glossary/color-teams/) synthesis ensures both perspectives inform the posture.

## Common Pitfalls

**Measuring what is easy, not what matters.** It is easy to measure patch count and hard to measure incident response effectiveness. Organizations that optimize for easy metrics develop blind spots in hard-to-measure areas. The seven-dimension model ensures all critical aspects are covered, even those that require sophisticated measurement.

**Alert fatigue masking posture degradation.** When monitoring generates too many alerts, operators stop responding, and the monitoring completeness dimension degrades silently. The platform addresses this through evidence quality scoring: alerts that are consistently ignored receive lower confidence weights, reducing their influence on posture scores.

**Treating posture as a number to optimize.** Goodhart's Law warns that once a metric becomes a target, it ceases to be a good metric. If teams optimize for posture score rather than actual security, they game the measurements. The NABLA axiom framework -- particularly source independence and provenance -- makes gaming more difficult because evidence must come from independent, verifiable sources.

**Ignoring configuration drift between assessments.** If assessments are periodic, configuration drift between assessments creates a false sense of security. The platform's continuous drift detection agents monitor configuration state in near real-time, feeding drift evidence into posture assessment as it occurs.

**Static weight assignments.** Using the same dimension weights regardless of threat context produces posture assessments that do not reflect actual risk. During an active campaign targeting authentication (credential stuffing, phishing), authentication boundary integrity should be weighted more heavily. Dynamic weighting is essential for context-sensitive posture assessment.

## Use Cases

### Blue Team Evidence Synthesis

The Blue Team commander aggregates evidence from three specialists: the auth sentinel (monitoring authentication boundaries), the drift detector (tracking configuration and behavioral drift), and the signal aggregator (correlating cross-domain signals). Each specialist contributes evidence to specific posture dimensions, and the commander synthesizes these into a unified defensive posture report for the Purple Team.

### Security Rating for External Parties

The [Prismatic Perimeter](/glossary/easm/) module generates [Security Ratings](/glossary/security-rating/) for external organizations. These ratings are derived from observable defensive posture indicators: DNS configuration, certificate management, email security headers, and vulnerability exposure. The posture model converts these external signals into the same seven-dimension framework used for internal assessment.

### NIS2 and ZKB Compliance Reporting

Regulatory compliance under NIS2 (EU) and ZKB 264/2025 (Czech Republic) requires organizations to demonstrate their security posture. The platform's posture assessment provides auditable, evidence-backed compliance data with full provenance chains, meeting the regulatory requirement for demonstrable security capability.

### Purple Team Closure Verification

Before the Purple Team can declare a Red-Blue finding "closed," it must verify that the defensive posture has improved in the affected dimension. If the Red Team identified an authentication weakness, the Purple closure analyst checks that the authentication boundary dimension has recovered to the required threshold. Posture improvement is the evidence that a finding has been genuinely remediated, not just acknowledged.

### Pre-Deployment Security Gate

Before any production deployment, the platform checks the current defensive posture against minimum thresholds. If the overall posture is below grade C, deployment is blocked. If a specific dimension critical to the deployment (such as monitoring completeness for a new service) is below threshold, deployment is deferred until the posture improves. This prevents deploying new code into an already-compromised environment.

## Related Concepts

- [Blue Team](/glossary/blue-team/) -- The four-agent team responsible for assessing and maintaining defensive posture
- [Defensive Security](/glossary/defensive-security/) -- The broader discipline of protecting systems from adversarial threats
- [Security Assessment](/glossary/security-assessment/) -- The process of evaluating security controls and their effectiveness
- [Color Teams](/glossary/color-teams/) -- The six-team security framework within which posture assessment operates
- [Threat Assessment](/glossary/threat-assessment/) -- The evaluation of threats that the defensive posture must counter
- [Security Rating](/glossary/security-rating/) -- The A-F grade derived from posture assessment for external reporting
- [EASM](/glossary/easm/) -- External Attack Surface Management that contributes external posture signals
- [Attack Surface](/glossary/attack-surface/) -- The total exposure area that defensive posture must protect
- [Compliance Framework](/glossary/compliance-framework/) -- Regulatory frameworks that require demonstrable defensive posture
- [Epistemic Robustness](/glossary/epistemic-robustness/) -- The quality of evidence backing posture assessments

## See Also

- [NABLA Infinity](/glossary/nabla-infinity/) -- The epistemic framework governing evidence quality in posture assessment
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- NABLA axiom critical for honest posture assessment
- [Signal Plurality](/glossary/signal-plurality/) -- NABLA axiom requiring multiple evidence sources for posture dimensions
- [Data Provenance](/glossary/data-provenance/) -- Traceability of evidence feeding into posture assessments
- [Audit Trail](/glossary/audit-trail/) -- Record of all posture assessment events for compliance and forensics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
