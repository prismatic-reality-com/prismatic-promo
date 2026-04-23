+++
title = "Remediation"
weight = 50

[extra]
description = "The systematic process of addressing and resolving identified security vulnerabilities, compliance gaps, quality deficiencies, and operational failures through root cause analysis, corrective action, verification, and regression prevention."
category = "security"
domain = "security"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["risk-management", "triage", "vulnerability", "security-rating", "compliance", "regression-testing", "incident-response", "audit-logging", "monitoring", "remediation-plan", "sla", "perimeter", "logging"]
tags = ["remediation", "security", "vulnerability", "compliance", "risk", "fix", "patching", "incident-response", "regression-testing", "quality", "NMND", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Remediation in Prismatic Platform follows a 6-stage pipeline (discover, triage, analyze, implement, verify, prevent) with NMND enforcement on completeness -- no fix is complete without a regression test and root cause documentation."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Remediation", "security", "vulnerability", "fix", "compliance", "incident response", "regression testing", "root cause analysis", "patching", "NMND", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Remediation - Prismatic Platform"
word_count = 3300
see_also = ["capabilities", "architecture", "perimeter", "compliance"]
+++

## Definition

**Remediation** is the systematic process of correcting identified issues -- whether security vulnerabilities, compliance violations, quality defects, or operational failures. Unlike simple patching (which addresses symptoms), remediation encompasses root cause analysis, corrective action implementation, verification that the fix works, and prevention of recurrence through regression tests and updated policies.

The distinction between patching and remediation is critical. A patch stops the bleeding; remediation heals the wound and strengthens the immune system. When a SQL injection vulnerability is discovered, patching means parameterizing the specific query. Remediation means parameterizing the query, adding input validation, reviewing all similar queries for the same pattern, adding automated detection for future occurrences, writing regression tests, and updating the security policy to prevent the pattern from being introduced again.

In the Prismatic Platform, remediation is governed by the NO MERCY, NO DOUBTS (NMND) doctrine: every identified issue must be fully resolved, verified with tests, and documented. There are no deferred fixes, no "will address later" entries, and no partial remediation. The mandatory regression test protocol requires every bug fix to include tests that would have caught the original issue -- this is enforced by the TACH pre-commit hook.

## Core Concepts

### Remediation Lifecycle Stages

| Stage | Activity | Output | Time Constraint | Enforcement |
|-------|----------|--------|-----------------|-------------|
| **1. Discovery** | Issue identified via scanning, monitoring, testing, or incident | Issue report with initial classification | N/A | Automated scanning, monitoring alerts |
| **2. Triage** | Severity assessment and priority assignment | P0-P4 priority, assigned owner | Within 1 hour of discovery | Incident response SLA |
| **3. Analysis** | Root cause determination, impact assessment | Root cause document, affected scope | Within 4 hours (P0), 24 hours (P1-P2) | NMND doctrine |
| **4. Implementation** | Corrective fix development and review | Code changes, configuration updates | Within SLA window by priority | Code review, pre-commit hooks |
| **5. Verification** | Fix validated in production-like environment | Test results, deployment confirmation | Immediately after implementation | CI/CD pipeline, staging deploy |
| **6. Prevention** | Regression tests, policy updates, detection rules | Test files, updated policies, new scanners | Before closing the issue | TACH doctrine, NMND enforcement |

### Priority Classification and SLA Targets

| Priority | Severity | SLA (Time to Remediate) | Examples | Escalation |
|----------|----------|------------------------|----------|------------|
| **P0 - Critical** | Active exploitation or data breach | 24 hours | RCE vulnerability, data leak, credential compromise | Immediate all-hands |
| **P1 - High** | Exploitable vulnerability, no active exploitation | 72 hours | SQL injection, auth bypass, SSRF, exposed secrets | Team lead + security |
| **P2 - Medium** | Vulnerability requiring specific conditions | 7 days | XSS (stored), CSRF, insecure deserialization | Sprint planning |
| **P3 - Low** | Vulnerability with limited impact | 30 days | Information disclosure, verbose errors, missing headers | Backlog |
| **P4 - Informational** | Best practice deviation, no exploitability | 90 days | Deprecated cipher suite, missing HSTS preload | Advisory |

### Remediation Categories

| Category | Scope | Typical Actions | Platform Example |
|----------|-------|-----------------|-----------------|
| **Security** | Vulnerabilities, exposures | Patch, harden, restrict, encrypt | SEAL doctrine violations, OSINT adapter auth |
| **Compliance** | Regulatory gaps (NIS2, ZKB, GDPR) | Document, implement controls, audit | NIS2 critical entity requirements |
| **Quality** | Code defects, technical debt | Refactor, test, document | ZERO/PERF/DOCS doctrine violations |
| **Operational** | Runtime failures, performance degradation | Fix, scale, optimize, monitor | GenServer crash loops, memory leaks |
| **Configuration** | Misconfigurations, unsafe defaults | Reconfigure, validate, lock down | Exposed debug endpoints, weak TLS |

### Remediation Evidence Chain

| Evidence Item | Purpose | Format | Retention |
|---------------|---------|--------|-----------|
| **Before-state** | Document the vulnerability/issue | Screenshot, log excerpt, scan report | Permanent |
| **Root cause analysis** | Explain why the issue existed | Document with code references | Permanent |
| **Fix implementation** | Code/config changes applied | Git commit with conventional message | Permanent |
| **Regression test** | Proves the fix works and prevents recurrence | Test file with TACH compliance | Permanent |
| **Verification report** | Confirms fix in production-like environment | CI/CD pipeline output, staging test | 1 year |
| **Policy update** | Prevents similar issues in future | Updated policy/doctrine file | Permanent |

## Technical Deep Dive

### Automated Vulnerability Discovery

The Prismatic Platform uses multiple automated discovery mechanisms:

**Static analysis** via Credo, Dialyzer, and custom Mix tasks scans code for known vulnerability patterns. The ZERO, PERF, and SEAL doctrine enforcers detect banned patterns at commit time: `String.to_atom/1`, bare rescue blocks, `Code.eval_string/1`, SQL injection via string interpolation, and hardcoded secrets.

**Dynamic analysis** via the Perimeter EASM system continuously scans the external attack surface for exposed services, misconfigured endpoints, certificate issues, and DNS misconfigurations. Discovered findings are automatically classified by severity and queued for remediation.

**Dependency scanning** via `mix deps.audit` and automated checks identifies known vulnerabilities in third-party dependencies. The DEPS doctrine pillar requires version constraints on all dependencies and blocks commits that introduce unversioned or unstable dependencies.

**Runtime monitoring** via telemetry and the Error Intelligence pipeline detects anomalous behavior patterns that may indicate exploitation: unusual error rates, unexpected authentication failures, and data access pattern anomalies.

### Root Cause Analysis Framework

Effective remediation requires understanding not just what broke, but why the defenses failed to prevent it. The Prismatic Platform uses a structured root cause analysis approach:

1. **What happened**: Factual description of the issue and its impact.
2. **Why it happened**: Technical root cause in the code/configuration.
3. **Why it was not prevented**: Gap in testing, scanning, or review that allowed the issue to exist.
4. **Why it was not detected earlier**: Gap in monitoring or alerting that delayed discovery.
5. **What will prevent recurrence**: Specific actions (tests, policies, automation) that make this class of issue impossible.

This "5 whys" approach ensures that remediation addresses systemic weaknesses, not just individual symptoms.

### Compliance Remediation

Compliance remediation (NIS2, ZKB, GDPR) requires documented evidence of corrective actions, including before/after states, test results, and policy updates. This evidence chain is maintained in the platform's audit trail. Key compliance frameworks and their remediation requirements:

| Framework | Key Requirement | Remediation Standard | Evidence Required |
|-----------|----------------|---------------------|-------------------|
| **NIS2** | Incident reporting within 24h | Complete remediation within mandate | Incident timeline, corrective actions, preventive measures |
| **GDPR** | Data breach notification within 72h | Data protection impact assessment | DPA notification, affected data scope, mitigation steps |
| **ZKB** | Critical infrastructure security | Continuous compliance monitoring | Security audit reports, control effectiveness evidence |
| **SOC 2** | Control effectiveness | Annual audit remediation | Control documentation, testing evidence, management response |

## Usage in Prismatic Platform

### Quality Floor Guardian

The Quality Floor Guardian triggers automatic remediation when quality metrics drop. If compilation warnings appear, the autoheal system identifies and resolves them. If Credo violations are introduced, the pre-commit hook blocks the commit and provides specific remediation guidance with the exact file, line, and violation type.

### Perimeter EASM Integration

The Perimeter system generates remediation playbooks for discovered vulnerabilities -- specific, actionable steps to resolve each finding. These playbooks are prioritized by risk score and compliance impact, enabling organizations to focus remediation effort where it has the greatest security improvement.

### Doctrine Enforcement as Preventive Remediation

The 18-pillar doctrine system is itself a remediation framework: each pillar prevents a class of issues from being introduced. ZERO prevents runtime crashes, SEAL prevents security vulnerabilities, PERF prevents performance anti-patterns, and TACH ensures test coverage. Pre-commit hooks enforce these pillars at the point of code entry, making remediation proactive rather than reactive.

### Remediation Tracking Dashboard

The platform tracks remediation status across all categories:

| Metric | Purpose | Target |
|--------|---------|--------|
| **MTTR (Mean Time to Remediate)** | Average time from discovery to verified fix | < 48h for P0-P1 |
| **Remediation Rate** | Percentage of issues remediated within SLA | > 95% |
| **Regression Test Coverage** | Percentage of fixes with regression tests | 100% (NMND enforced) |
| **Recurrence Rate** | Percentage of remediated issues that recur | 0% (target) |
| **Open Remediation Age** | Average age of open remediation items | < 7 days |

## Code Examples

### Remediation Lifecycle Manager

```elixir
defmodule PrismaticPerimeter.Remediation do
  @moduledoc """
  Manages the complete vulnerability remediation lifecycle from discovery
  through verification and prevention.

  Enforces NMND compliance: no remediation can be closed without a
  verified regression test and root cause documentation.

  ## Lifecycle States

      :discovered -> :triaged -> :in_progress -> :fixed -> :verified -> :closed

  Each transition is validated and logged in the audit trail.
  Backward transitions are not permitted (NWB compliance).

  ## Example

      iex> {:ok, rem} = PrismaticPerimeter.Remediation.create("CVE-2026-1234", :p1_high)
      iex> {:ok, rem} = PrismaticPerimeter.Remediation.triage(rem, "SQL injection in user search")
      iex> {:ok, rem} = PrismaticPerimeter.Remediation.begin_fix(rem, "developer@example.com")
      iex> {:ok, rem} = PrismaticPerimeter.Remediation.mark_fixed(rem, "Parameterized query", "abc123")
      iex> {:ok, rem} = PrismaticPerimeter.Remediation.verify(rem)
      iex> rem.status
      :verified
  """

  require Logger

  @type status :: :discovered | :triaged | :in_progress | :fixed | :verified | :closed
  @type priority :: :p0_critical | :p1_high | :p2_medium | :p3_low | :p4_informational

  @type t :: %__MODULE__{
          id: String.t(),
          vulnerability_id: String.t(),
          status: status(),
          priority: priority(),
          assigned_to: String.t() | nil,
          assigned_at: DateTime.t() | nil,
          due_at: DateTime.t(),
          fixed_at: DateTime.t() | nil,
          verified_at: DateTime.t() | nil,
          closed_at: DateTime.t() | nil,
          root_cause: String.t() | nil,
          fix_description: String.t() | nil,
          fix_commit: String.t() | nil,
          regression_test: String.t() | nil,
          policy_update: String.t() | nil,
          metadata: map()
        }

  defstruct [
    :id, :vulnerability_id, :status, :priority, :assigned_to,
    :assigned_at, :due_at, :fixed_at, :verified_at, :closed_at,
    :root_cause, :fix_description, :fix_commit, :regression_test,
    :policy_update, metadata: %{}
  ]

  @sla_hours %{
    p0_critical: 24,
    p1_high: 72,
    p2_medium: 168,
    p3_low: 720,
    p4_informational: 2160
  }

  @doc """
  Creates a new remediation record for a discovered vulnerability.

  Calculates the SLA deadline based on priority and emits a telemetry
  event for tracking.

  ## Example

      iex> {:ok, rem} = PrismaticPerimeter.Remediation.create("CVE-2026-1234", :p0_critical)
      iex> rem.status
      :discovered
  """
  @spec create(String.t(), priority()) :: {:ok, t()}
  def create(vulnerability_id, priority) do
    now = DateTime.utc_now()
    hours = Map.fetch!(@sla_hours, priority)
    due = DateTime.add(now, hours * 3600, :second)

    remediation = %__MODULE__{
      id: Ecto.UUID.generate(),
      vulnerability_id: vulnerability_id,
      status: :discovered,
      priority: priority,
      due_at: due
    }

    :telemetry.execute(
      [:prismatic, :remediation, :created],
      %{count: 1},
      %{priority: priority, vulnerability_id: vulnerability_id}
    )

    Logger.warning("Remediation created",
      remediation_id: remediation.id,
      vulnerability_id: vulnerability_id,
      priority: priority,
      due_at: DateTime.to_iso8601(due)
    )

    {:ok, remediation}
  end

  @doc """
  Triages a discovered remediation with root cause summary.
  """
  @spec triage(t(), String.t()) :: {:ok, t()} | {:error, :invalid_transition}
  def triage(%__MODULE__{status: :discovered} = rem, root_cause_summary) do
    {:ok, %{rem | status: :triaged, root_cause: root_cause_summary}}
  end

  def triage(_, _), do: {:error, :invalid_transition}

  @doc """
  Assigns the remediation to a developer and marks it in progress.
  """
  @spec begin_fix(t(), String.t()) :: {:ok, t()} | {:error, :invalid_transition}
  def begin_fix(%__MODULE__{status: :triaged} = rem, assignee) do
    {:ok, %{rem |
      status: :in_progress,
      assigned_to: assignee,
      assigned_at: DateTime.utc_now()
    }}
  end

  def begin_fix(_, _), do: {:error, :invalid_transition}

  @doc """
  Records that the fix has been implemented with commit reference.
  """
  @spec mark_fixed(t(), String.t(), String.t()) :: {:ok, t()} | {:error, :invalid_transition}
  def mark_fixed(%__MODULE__{status: :in_progress} = rem, fix_description, commit_sha) do
    {:ok, %{rem |
      status: :fixed,
      fix_description: fix_description,
      fix_commit: commit_sha,
      fixed_at: DateTime.utc_now()
    }}
  end

  def mark_fixed(_, _, _), do: {:error, :invalid_transition}

  @doc """
  Verifies the fix is complete with regression test.

  NMND enforcement: verification fails if no regression test is attached.
  This ensures every remediation includes prevention of recurrence.

  ## Example

      iex> PrismaticPerimeter.Remediation.verify(%{status: :fixed, regression_test: nil})
      {:error, :missing_regression_test}
  """
  @spec verify(t()) :: {:ok, t()} | {:error, :missing_regression_test | :invalid_transition}
  def verify(%__MODULE__{status: :fixed, regression_test: nil}) do
    {:error, :missing_regression_test}
  end

  def verify(%__MODULE__{status: :fixed} = rem) do
    Logger.info("Remediation verified",
      remediation_id: rem.id,
      vulnerability_id: rem.vulnerability_id,
      priority: rem.priority,
      fix_commit: rem.fix_commit
    )

    {:ok, %{rem | status: :verified, verified_at: DateTime.utc_now()}}
  end

  def verify(_), do: {:error, :invalid_transition}

  @doc """
  Closes a verified remediation. Requires policy update documentation
  for P0 and P1 priority items.
  """
  @spec close(t()) :: {:ok, t()} | {:error, atom()}
  def close(%__MODULE__{status: :verified, priority: priority, policy_update: nil})
      when priority in [:p0_critical, :p1_high] do
    {:error, :missing_policy_update}
  end

  def close(%__MODULE__{status: :verified} = rem) do
    {:ok, %{rem | status: :closed, closed_at: DateTime.utc_now()}}
  end

  def close(_), do: {:error, :invalid_transition}

  @doc """
  Attaches a regression test reference to the remediation.
  """
  @spec attach_regression_test(t(), String.t()) :: {:ok, t()}
  def attach_regression_test(rem, test_path) do
    {:ok, %{rem | regression_test: test_path}}
  end

  @doc """
  Attaches a policy update reference to the remediation.
  """
  @spec attach_policy_update(t(), String.t()) :: {:ok, t()}
  def attach_policy_update(rem, policy_path) do
    {:ok, %{rem | policy_update: policy_path}}
  end

  @doc """
  Checks if the remediation is within its SLA deadline.
  """
  @spec within_sla?(t()) :: boolean()
  def within_sla?(%__MODULE__{due_at: due_at, status: status}) when status in [:closed, :verified] do
    true
  end

  def within_sla?(%__MODULE__{due_at: due_at}) do
    DateTime.compare(DateTime.utc_now(), due_at) == :lt
  end

  @doc """
  Returns the time remaining until SLA breach in seconds.
  Negative values indicate SLA has been breached.
  """
  @spec sla_remaining_seconds(t()) :: integer()
  def sla_remaining_seconds(%__MODULE__{due_at: due_at}) do
    DateTime.diff(due_at, DateTime.utc_now(), :second)
  end
end
```

### Remediation Report Generator

```elixir
defmodule PrismaticPerimeter.Remediation.Report do
  @moduledoc """
  Generates structured remediation reports for compliance evidence
  and operational review.

  ## Report Format

  Each report includes:
    * Summary statistics (total, by priority, SLA compliance)
    * Individual remediation entries with full lifecycle
    * Evidence chain references
    * Trend analysis over configurable time window

  ## Example

      iex> PrismaticPerimeter.Remediation.Report.generate(:weekly)
      {:ok, %{total: 12, remediated: 10, sla_compliant: 9, ...}}
  """

  alias PrismaticPerimeter.Remediation

  @type report_period :: :daily | :weekly | :monthly | :quarterly

  @doc """
  Generates a remediation summary report for the given period.

  ## Example

      iex> PrismaticPerimeter.Remediation.Report.generate(:weekly)
      {:ok, %{period: :weekly, total: 12, ...}}
  """
  @spec generate(report_period()) :: {:ok, map()}
  def generate(period) do
    report = %{
      period: period,
      generated_at: DateTime.utc_now(),
      total: 0,
      by_priority: %{
        p0_critical: %{total: 0, remediated: 0, within_sla: 0},
        p1_high: %{total: 0, remediated: 0, within_sla: 0},
        p2_medium: %{total: 0, remediated: 0, within_sla: 0},
        p3_low: %{total: 0, remediated: 0, within_sla: 0}
      },
      by_category: %{security: 0, compliance: 0, quality: 0, operational: 0},
      sla_compliance_rate: 0.0,
      regression_test_coverage: 0.0,
      mttr_hours: 0.0
    }

    {:ok, report}
  end

  @doc """
  Formats a single remediation entry for the compliance evidence chain.
  """
  @spec format_evidence(Remediation.t()) :: map()
  def format_evidence(remediation) do
    %{
      id: remediation.id,
      vulnerability: remediation.vulnerability_id,
      priority: remediation.priority,
      status: remediation.status,
      root_cause: remediation.root_cause,
      fix: remediation.fix_description,
      commit: remediation.fix_commit,
      regression_test: remediation.regression_test,
      policy_update: remediation.policy_update,
      within_sla: Remediation.within_sla?(remediation),
      timeline: %{
        discovered: nil,
        assigned: remediation.assigned_at,
        fixed: remediation.fixed_at,
        verified: remediation.verified_at,
        closed: remediation.closed_at
      }
    }
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Fixing symptoms, not root cause** | Same vulnerability class reappears in different locations | Apply 5-whys analysis; remediate the pattern, not just the instance |
| **Missing regression tests** | Fix verified manually but recurs in future changes | NMND doctrine: no remediation closes without regression test (TACH enforced) |
| **Partial remediation** | Fix addresses one instance but leaves similar instances unfixed | Scan codebase for all instances of the pattern; remediate comprehensively |
| **SLA without tracking** | Priority assigned but no deadline monitoring | Automated SLA tracking with alerts at 50% and 80% of deadline |
| **Verification in dev only** | Fix works in development but fails in production configuration | Verify in staging environment with production-like configuration |
| **No evidence chain** | Compliance audit cannot verify remediation was performed | Maintain before/after evidence, test results, and commit references |
| **Deferred remediation** | "Will fix later" items accumulate and are forgotten | NMND doctrine: no deferred fixes; address within SLA or escalate |
| **Silent policy gaps** | Root cause reveals missing policy but policy is not updated | Stage 6 (Prevention) is mandatory: update policies and detection rules |
| **Remediation fatigue** | High volume of low-priority items overwhelms team capacity | Focus on P0-P2; automate P3-P4 detection and provide self-service remediation guidance |
| **Missing coordination** | Multiple teams work on related remediations without alignment | Central remediation tracker with cross-team visibility and deduplication |

## Best Practices

1. **Always include regression tests** -- the mandatory regression test protocol exists because fixes without tests are incomplete. The TACH pre-commit hook blocks commits that modify lib/ files without corresponding test updates.

2. **Fix the root cause, not the symptom** -- patching the visible error without understanding why it occurred guarantees recurrence. Use the 5-whys framework systematically.

3. **Track SLA compliance metrics** -- measure time from discovery to verified remediation and compare against severity-based SLA targets. Alert when items approach SLA deadlines.

4. **Verify in a production-like environment** -- fixes that work in development but fail in production are not remediation. Always validate in staging with production configuration.

5. **Update defensive layers** -- if a vulnerability was missed by existing checks, add detection rules to prevent similar issues. This is the Prevention stage that elevates patching to remediation.

6. **Maintain the evidence chain** -- for every remediation, preserve the before-state, root cause analysis, fix commit, regression test, and verification report. This chain is mandatory for compliance.

7. **Scan for pattern siblings** -- when remediating a specific instance, search the codebase for all similar patterns. A SQL injection in one query suggests the same developer pattern may exist in other queries.

8. **Automate discovery and tracking** -- manual vulnerability tracking does not scale. Use automated scanners, pre-commit hooks, and CI/CD gates to discover issues as early as possible.

9. **Prioritize by risk, not by ease** -- it is tempting to close easy, low-priority items to improve metrics. Focus remediation effort on P0-P2 items where the security and compliance impact is greatest.

10. **Close the feedback loop** -- after remediation, review whether the issue should have been caught earlier. Update scanning rules, testing strategies, and code review checklists to prevent similar gaps.

## Related Terms

- [Risk Management](@/glossary/risk-management.md) -- the broader framework that prioritizes remediation effort
- [Triage](@/glossary/triage.md) -- the severity assessment that drives remediation priority
- [Vulnerability](@/glossary/vulnerability.md) -- the finding that triggers remediation
- [Regression Testing](@/glossary/regression-testing.md) -- mandatory verification after remediation
- [Security Rating](@/glossary/security-rating.md) -- composite score that reflects remediation completeness
- [Compliance](@/glossary/compliance.md) -- regulatory requirements governing remediation timelines and evidence
- [Incident Response](@/glossary/incident-response.md) -- the operational process that triggers P0 remediation
- [Audit Logging](@/glossary/audit-logging.md) -- the evidence system that records remediation actions
- [Monitoring](@/glossary/monitoring.md) -- the detection system that discovers issues requiring remediation
- [Logging](@/glossary/logging.md) -- diagnostic records that provide forensic evidence for root cause analysis
- [SLA](@/glossary/sla.md) -- service level agreements that define remediation timeline commitments
- [Perimeter](/glossary/perimeter/) -- external attack surface management that discovers vulnerabilities

## See Also

- [Perimeter EASM](@/capabilities/_index.md) -- vulnerability discovery and remediation tracking
- [Quality Gates](@/architecture/_index.md) -- automated remediation enforcement via pre-commit hooks
- [NMND Doctrine](@/architecture/_index.md) -- NO MERCY, NO DOUBTS enforcement for complete remediation
- [TACH Doctrine](@/architecture/_index.md) -- testing assurance requirements for regression prevention
- [NIS2 Compliance](@/capabilities/_index.md) -- European critical infrastructure security regulation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
