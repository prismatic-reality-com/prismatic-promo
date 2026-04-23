+++
title = "ramon-mode-guardian"
weight = 333
[extra]
domain = "security-operations"
level = "L4"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["easm", "attack-surface", "rbac", "color-teams", "trinity-gate", "aiad", "nabla-infinity", "nis2", "zkb", "no-doubts"]
domain_normalized = "security"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 1800
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ramon-mode-guardian", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "Ramon Mode", "Elevated", "RBAC", "Normal"]
tags = ["agents", "agent", "ramon-mode-guardian", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "ramon-mode-guardian - Prismatic Platform"
+++

## Overview

The ramon-mode-guardian operates as an L4 Domain Authority within the Prismatic Platform's security-operations domain, serving as the dedicated guardian for the platform's defensive operational mode known as "Ramon Mode." This hardened security posture is activated during heightened threat conditions, security incidents, or when the platform processes sensitive intelligence operations requiring elevated security guarantees. The guardian manages the transition between normal operational mode and Ramon Mode, enforces the additional security constraints that Ramon Mode imposes, and monitors compliance throughout the elevated security period.

Ramon Mode represents a defense-in-depth posture that tightens security controls beyond normal operational parameters. Under Ramon Mode, [RBAC](/glossary/rbac/) permissions are restricted to minimum necessary access, [attack surface](/glossary/attack-surface/) exposure is minimized by disabling non-essential services, audit logging is elevated to maximum verbosity, and all inter-agent communications require additional authentication verification. The guardian ensures these elevated controls are applied consistently and cannot be degraded while the mode is active.

Built on the [AIAD](/glossary/aiad/) standard and integrated with the platform's [color team](/glossary/color-teams/) security architecture, the ramon-mode-guardian operates under the [NO DOUBTS](/glossary/no-doubts/) principle: security mode transitions are evidence-based decisions backed by threat intelligence, and the guardian requires verifiable justification before either activating or deactivating Ramon Mode. The [Trinity Gate](/glossary/trinity-gate/) validates mode transition decisions for structural consistency, ensuring that all security control changes are applied atomically.

## Security Mode Architecture

The guardian manages a state machine that governs the platform's security posture transitions.

**Normal mode** represents the platform's standard operational posture with full feature availability, standard RBAC permissions, and baseline audit logging. This mode optimizes for development velocity and feature accessibility while maintaining the platform's quality enforcement and standard security controls.

**Elevated mode** is an intermediate posture activated when threat indicators suggest increased risk without confirmed active threats. Elevated mode enables enhanced logging, restricts access to sensitive intelligence operations, and increases monitoring frequency for anomaly detection. Development operations continue with minimal restriction.

**Ramon Mode** is the full defensive posture activated during confirmed security incidents, active threat engagement, or high-sensitivity operational periods. This mode applies maximum security restrictions including minimum-privilege RBAC, service isolation, elevated audit trails, and restricted inter-agent communication. Development operations may be paused or restricted depending on the threat assessment.

**Lockdown mode** is the emergency posture activated under extreme threat conditions. All non-essential operations are suspended, external network access is severed, and the platform enters a preservation state focused entirely on security integrity. Only L1 Supreme Authority agents can operate in lockdown mode.

## Key Capabilities

- **Security mode state management** -- Manages atomic transitions between normal, elevated, Ramon Mode, and lockdown security postures with full rollback capability
- **RBAC restriction enforcement** -- Dynamically tightens [RBAC](/glossary/rbac/) permissions to minimum necessary access during elevated security postures, ensuring privilege reduction is applied consistently across all agents
- **Attack surface minimization** -- Disables non-essential services, closes unnecessary network ports, and restricts API endpoints during heightened security modes, reducing the platform's [attack surface](/glossary/attack-surface/) exposure
- **Audit trail elevation** -- Increases logging verbosity and audit capture during security mode activations, ensuring complete forensic capability for post-incident analysis
- **[NIS2](/glossary/nis2/)/[ZKB](/glossary/zkb/) compliance integration** -- Security mode transitions maintain compliance with NIS2 Directive and ZKB regulatory requirements for incident response procedures
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with threat-triggered automatic mode escalation
- **[Telemetry integration](/capabilities/telemetry-integration/)** for security mode state tracking and compliance monitoring

## Mode Transition Matrix

| From | To | Trigger | Authority Required | Duration |
|------|----|---------|--------------------|----------|
| Normal | Elevated | Threat indicator detection | L4+ | Automatic |
| Elevated | Ramon Mode | Confirmed threat or sensitive ops | L3+ | Manual approval |
| Ramon Mode | Lockdown | Active critical threat | L1 Supreme | Emergency |
| Ramon Mode | Elevated | Threat mitigation confirmed | L3+ | Manual approval |
| Elevated | Normal | Threat indicators cleared | L4+ | Cool-down period |
| Lockdown | Ramon Mode | Critical threat contained | L1 Supreme | Manual approval |

## Implementation Architecture

```elixir
defmodule PrismaticSecurity.RamonModeGuardian do
  @moduledoc """
  Security posture state machine managing transitions between
  normal, elevated, Ramon Mode, and lockdown operational modes.
  """

  use GenServer

  @type security_mode :: :normal | :elevated | :ramon_mode | :lockdown
  @type transition_result :: {:ok, security_mode()} | {:error, term()}

  defstruct [
    :current_mode,
    :activated_at,
    :activated_by,
    :threat_level,
    :restrictions_applied,
    :audit_level
  ]

  @spec activate_ramon_mode(String.t(), keyword()) :: transition_result()
  def activate_ramon_mode(justification, opts \\ []) do
    GenServer.call(__MODULE__, {:transition, :ramon_mode, justification, opts})
  end

  @spec current_mode() :: security_mode()
  def current_mode do
    GenServer.call(__MODULE__, :current_mode)
  end

  @impl GenServer
  def handle_call({:transition, target_mode, justification, opts}, _from, state) do
    with :ok <- validate_transition(state.current_mode, target_mode),
         :ok <- verify_authority(target_mode, opts),
         :ok <- verify_justification(justification) do
      new_state = apply_mode_restrictions(state, target_mode)
      {:reply, {:ok, target_mode}, new_state}
    else
      {:error, reason} -> {:reply, {:error, reason}, state}
    end
  end
end
```

## Security Controls by Mode

| Control | Normal | Elevated | Ramon Mode | Lockdown |
|---------|--------|----------|------------|----------|
| **RBAC** | Standard | Tightened | Minimum privilege | L1 only |
| **Audit Logging** | Standard | Enhanced | Maximum | Maximum + forensic |
| **API Access** | Full | Restricted sensitive | Essential only | Disabled |
| **Inter-Agent Auth** | Standard | Enhanced | Mutual TLS | Isolated |
| **External Network** | Full | Monitored | Restricted | Severed |
| **Development Ops** | Full | Normal | Restricted | Suspended |

## Authority Level

**L4** - Domain Authority - Specialized security domain expertise with authority to manage security mode transitions, enforce elevated security controls, and monitor compliance during heightened security postures.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/ramon-mode status` | Display current security mode and active restrictions | L4+ |
| `/ramon-mode activate` | Initiate Ramon Mode with justification | L3+ |
| `/ramon-mode deactivate` | Transition from Ramon Mode to elevated with confirmation | L3+ |
| `/ramon-mode audit` | Display security mode transition history and audit trail | L4+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-bypass-enforcer-agent](/agents/quality-bypass-enforcer-agent/) | Security mode enforcement protected from bypass attempts |
| [prismatic-supreme-commander](/agents/prismatic-supreme-commander/) | Lockdown mode transitions require supreme authority approval |
| [quality-enforcement-commander](/agents/quality-enforcement-commander/) | Quality enforcement maintained during all security modes |
| [route-testing-supreme](/agents/route-testing-supreme/) | Route availability verified after mode transitions |

## Enforcement

Security mode transitions comply with the [NO MERCY](/glossary/no-mercy/) doctrine: once Ramon Mode is activated, all restrictions are applied atomically and without exception. No agent can operate outside the restrictions of the active security mode. The [NO DOUBTS](/glossary/no-doubts/) principle requires evidence-based justification for every mode transition. The [NABLA Infinity](/glossary/nabla-infinity/) framework ensures that threat signals from multiple independent sources are required before escalating to higher security modes, preventing single-source false alarm escalation. The [Trinity Gate](/glossary/trinity-gate/) validates mode transition integrity.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)