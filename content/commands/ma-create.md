+++
title = "/ma-create"
weight = 740
[extra]
category = "M&A Operations"
description = "Create new M&A deal with target profiling and initial assessment"
syntax = "/ma-create [options]"
authority = "L4"
agent = "ma-deal-commander"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1444
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-create", "Create", "commands", "M&A Operations", "Prismatic Platform", "Deal", "OSINT", "TERMINATED", "Primary"]
tags = ["commands", "m&a-operations", "ma-create", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ma-create - Prismatic Platform"
+++

## Overview

**/ma-create** is a production command in the **M&A Operations** category of the Prismatic Platform that initiates new Mergers and Acquisitions deals by creating deal records, executing initial target profiling, and triggering the first round of intelligence collection. This command is the entry point for all M&A activity within the platform -- every deal in the pipeline begins with a `/ma-create` invocation that establishes the target profile, sets deal parameters, and activates the intelligence collection machinery.

This command operates under the **L4** authority level and is executed by the `ma-deal-commander` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L4 authority level is the highest operational authority in the platform, reflecting the strategic significance and resource commitment involved in initiating M&A deal pipelines. Only operators with supreme authority clearance can create new deals, ensuring that the platform's intelligence and analysis resources are deployed only for properly authorized acquisition activities.

Deal creation in the Prismatic Platform is not a passive record-keeping exercise. When a deal is created, the `ma-deal-commander` agent immediately initiates a cascade of preparatory operations: automated OSINT intelligence collection on the target through [/investigate](/commands/investigate/), key personnel identification through [/email-osint](/commands/email-osint/), digital infrastructure assessment through [/ghost-recon](/commands/ghost-recon/), and public record searches through [/google-hacking](/commands/google-hacking/). This proactive intelligence gathering ensures that by the time the first analyst reviews the deal, a substantial intelligence foundation has already been assembled.

## Architecture

The deal creation system operates as a multi-phase initialization pipeline that establishes the deal context and triggers downstream intelligence collection.

### Deal Creation Pipeline

```
/ma-create -> Input Validation -> Target Profiler -> Deal Registry -> Intel Trigger
                   |                    |                 |               |
                   v                    v                 v               v
             Parameter Check      Company Lookup     Deal Record     /investigate
             Target Validation    Industry Class     Status: NEW     /email-osint
             Duplicate Check      Size Estimation    Assigned Agent  /ghost-recon
                                  Geography Map      Timeline Set    /google-hacking
```

### Deal Lifecycle States

| State | Description | Transitions |
|-------|-------------|-------------|
| **NEW** | Deal created, initial profiling in progress | PROFILING |
| **PROFILING** | Intel collection and target analysis active | SCREENING |
| **SCREENING** | Initial viability assessment | ACTIVE, REJECTED |
| **ACTIVE** | Full due diligence underway | NEGOTIATION, ON_HOLD, TERMINATED |
| **NEGOTIATION** | Deal terms under negotiation | CLOSING, TERMINATED |
| **ON_HOLD** | Temporarily paused | ACTIVE, TERMINATED |
| **CLOSING** | Final closing procedures | COMPLETED, TERMINATED |
| **COMPLETED** | Deal successfully closed | (terminal) |
| **REJECTED** | Failed screening criteria | (terminal) |
| **TERMINATED** | Deal abandoned or failed | (terminal) |

### Deal Record Structure

| Field | Type | Description |
|-------|------|-------------|
| **deal_id** | string | Unique identifier (DEAL-YYYY-NNN format) |
| **target_name** | string | Target company or entity name |
| **target_domain** | string | Primary web domain |
| **target_type** | enum | Company, division, asset_bundle, IP_portfolio |
| **industry** | string | Primary industry classification |
| **geography** | string | Primary operating geography |
| **estimated_size** | range | Estimated deal size range |
| **strategic_rationale** | text | Why this target is being pursued |
| **deal_team** | list | Assigned analysts and agents |
| **created_at** | datetime | Deal creation timestamp |
| **state** | enum | Current lifecycle state |
| **confidence** | float | Overall deal confidence score |

## Usage

```bash
# Create a new deal with basic information
/ma-create "Acme Corporation" --domain=acme.com --type=company

# Create deal with full context
/ma-create "Target Tech Inc" --domain=targettech.io --type=company \
  --industry="Enterprise SaaS" --geography="US" \
  --size="50M-100M" --rationale="Cloud infrastructure expansion"

# Create deal for a division acquisition
/ma-create "Acme Cloud Division" --parent="Acme Corporation" \
  --type=division --domain=cloud.acme.com

# Create deal for IP portfolio
/ma-create "Patent Portfolio X" --type=ip_portfolio \
  --holder="Research Corp" --patents=47

# Create deal with automatic OSINT
/ma-create "Target Corp" --domain=target.com --auto-intel --intel-depth=full

# Create deal with custom team assignment
/ma-create "Target Corp" --domain=target.com \
  --team="analyst-1,analyst-2" --lead="ma-deal-commander"

# Create deal with timeline
/ma-create "Target Corp" --domain=target.com \
  --screening-deadline="2026-03-15" --target-close="2026-09-30"

# Dry run to preview deal creation
/ma-create "Target Corp" --domain=target.com --dry-run

# Create deal from template
/ma-create --template=saas-acquisition --target="Target Corp" --domain=target.com
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target_name` | string | required | Target entity name (positional argument) |
| `--domain` | string | none | Primary web domain of target |
| `--type` | string | company | Target type: company, division, asset_bundle, ip_portfolio |
| `--industry` | string | auto-detect | Industry classification |
| `--geography` | string | auto-detect | Primary operating geography |
| `--size` | string | none | Estimated deal size range (e.g., "50M-100M") |
| `--rationale` | string | none | Strategic rationale for the acquisition |
| `--parent` | string | none | Parent company for division acquisitions |
| `--patents` | integer | none | Number of patents for IP portfolio deals |
| `--auto-intel` | flag | true | Automatically trigger intelligence collection |
| `--intel-depth` | string | standard | Intelligence depth: quick, standard, full |
| `--team` | string | auto | Comma-separated team member identifiers |
| `--lead` | string | ma-deal-commander | Deal lead agent or analyst |
| `--screening-deadline` | string | +30d | Screening phase deadline |
| `--target-close` | string | none | Target closing date |
| `--template` | string | none | Deal template: saas-acquisition, asset-purchase, ip-acquisition |
| `--priority` | string | normal | Deal priority: low, normal, high, critical |
| `--dry-run` | flag | false | Preview deal creation without executing |
| `--format` | string | text | Output format: text, json, markdown |

## Execution Flow

1. **Input Validation**: All required parameters are validated. The target name is checked for uniqueness against existing deals to prevent duplicate entries. The domain, if provided, is validated as a resolvable hostname.

2. **Duplicate Detection**: The system searches existing active deals for potential duplicates based on target name similarity, domain match, and parent company overlap. If a potential duplicate is found, the operator is warned and must confirm or cancel.

3. **Target Profiling**: Automated target profiling begins immediately. If a domain is provided, WHOIS data, DNS records, and public web content are retrieved. Industry classification and geography detection are performed automatically if not explicitly specified.

4. **Company Lookup**: Public databases are queried for company information including incorporation details, registered agents, officers, financial filings (SEC, Companies House, etc.), and corporate structure. Results vary by geography and company type.

5. **Deal Record Creation**: A deal record is created in the M&A pipeline with a unique deal identifier in DEAL-YYYY-NNN format. The deal is initialized in the NEW state with all provided parameters and auto-detected information.

6. **Team Assignment**: The deal team is assembled. The `ma-deal-commander` agent is assigned as the primary coordinator. Additional specialist agents (financial, legal, operational, strategic, technical) are assigned based on deal complexity and type.

7. **Intelligence Triggering**: If `--auto-intel` is enabled (default), the system automatically dispatches intelligence collection requests through [/investigate](/commands/investigate/) for the target entity, [/email-osint](/commands/email-osint/) for key personnel, and [/ghost-recon](/commands/ghost-recon/) for digital infrastructure. These operations run asynchronously and results feed into the deal record as they complete.

8. **Timeline Initialization**: Deal milestones are established based on provided deadlines or default timelines. The screening phase, due diligence windows, and target close date are set. Automated reminders and escalation triggers are configured through [/ma-enforce](/commands/ma-enforce/).

9. **Notification**: Relevant stakeholders are notified of the new deal creation. The deal appears in the [/ma-dashboard](/commands/ma-dashboard/) pipeline view immediately.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `ma-deal-commander` | L4 authority deal initiation |
| [/ma-analyze](/commands/ma-analyze/) | Downstream analysis | Consumes deal context for analysis |
| [/ma-report](/commands/ma-report/) | Report generation | Creates reports from deal data |
| [/ma-dashboard](/commands/ma-dashboard/) | Pipeline visibility | New deals appear in dashboard |
| [/ma-status](/commands/ma-status/) | Status tracking | Deal progress monitoring |
| [/ma-enforce](/commands/ma-enforce/) | Compliance | Deadline and milestone enforcement |
| [/investigate](/commands/investigate/) | OSINT intelligence | Automatic target investigation |
| [/email-osint](/commands/email-osint/) | Personnel intel | Key personnel identification |
| [/ghost-recon](/commands/ghost-recon/) | Infrastructure intel | Digital infrastructure assessment |
| [/google-hacking](/commands/google-hacking/) | Search intel | Public information discovery |
| [Quality Gates](/glossary/quality-gates/) | Validation | Deal record completeness checks |
| [Telemetry](/glossary/telemetry/) | [Metrics](/glossary/metrics/) | Deal creation tracking |

## Best Practices

**Provide domain when available.** The domain is the single most valuable piece of targeting information for the intelligence collection system. WHOIS, DNS, certificate transparency, and web content analysis all key off the domain, and its presence dramatically increases the quality and speed of initial profiling.

**Set realistic timelines.** Deal timelines drive enforcement actions through [/ma-enforce](/commands/ma-enforce/). Overly aggressive timelines generate unnecessary escalation noise, while overly generous timelines reduce pipeline velocity. Calibrate based on deal complexity and team capacity.

**Use templates for common deal types.** Templates (SaaS acquisition, asset purchase, IP acquisition) pre-configure analysis scopes, team assignments, and timeline defaults appropriate to each deal type, reducing setup time and ensuring consistent coverage.

**Enable auto-intel for all deals.** The automatic intelligence collection provides a substantial head start on due diligence with minimal cost. Even for quick screening exercises, the OSINT data provides valuable context that improves screening accuracy.

**Review duplicate warnings carefully.** False positives in duplicate detection are common when targets have similar names or overlapping domains. However, true duplicates waste significant resources, so always investigate duplicate warnings before confirming.

**Document strategic rationale upfront.** The `--rationale` parameter captures the initial strategic thesis for the acquisition. This rationale serves as the reference point against which all subsequent analysis findings are evaluated during the deal lifecycle.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `target_name_required` | No target name provided | Provide target name as positional argument |
| `duplicate_detected` | Similar deal already exists in pipeline | Review existing deal, confirm or cancel |
| `domain_unresolvable` | Provided domain does not resolve | Verify domain spelling or omit if unavailable |
| `authority_insufficient` | Operator lacks L4 authority | Request authority elevation or delegate to authorized operator |
| `intel_dispatch_failed` | Intelligence collection could not be triggered | Check intelligence system health, retry manually |
| `template_not_found` | Specified deal template does not exist | List available templates or create deal without template |
| `invalid_size_format` | Deal size range in wrong format | Use format "NNM-NNM" (e.g., "50M-100M") |
| `team_member_not_found` | Specified team member does not exist | Verify team member identifiers |

## Advanced Usage

### Batch Deal Creation

Create multiple deals from a screening list.

```bash
# Create deals from CSV screening list
/ma-create --batch=targets.csv --auto-intel --intel-depth=quick --format=json

# Template-based batch creation
/ma-create --batch=saas-targets.csv --template=saas-acquisition --priority=high
```

### Deal Cloning

Clone an existing deal configuration for related targets.

```bash
# Clone deal parameters to new target
/ma-create "Similar Corp" --clone-from=DEAL-2026-001 --domain=similarcorp.com

# Clone with overrides
/ma-create "New Target" --clone-from=DEAL-2026-001 --size="100M-200M" --priority=critical
```

### Programmatic Deal Creation

Create deals through the platform API for automated screening workflows.

```bash
# API-driven deal creation
curl -X POST /api/v1/ma/create \
  -H "Content-Type: application/json" \
  -d '{"target_name": "Target Corp", "domain": "target.com", "type": "company"}'
```

### Custom Intelligence Profiles

Configure deal-specific intelligence collection parameters.

```bash
# Create deal with custom intel focus
/ma-create "Target Corp" --domain=target.com \
  --intel-focus="financial,legal,technical" \
  --intel-sources="sec-filings,patent-databases,github"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Deal creation either completes fully -- record created, team assigned, intelligence triggered -- or fails atomically with no partial state left in the pipeline.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Automatic intelligence collection begins immediately, ensuring that no deal proceeds to screening without an evidence base. Duplicate detection prevents resource waste on already-tracked targets.

## Related Commands

- [/ma-analyze](/commands/ma-analyze/) - Comprehensive M&A analysis including financial, legal and operational review
- [/ma-report](/commands/ma-report/) - Generate detailed M&A analysis report with visualizations
- [/ma-dashboard](/commands/ma-dashboard/) - M&A deal pipeline dashboard with real-time status tracking
- [/ma-status](/commands/ma-status/) - M&A deal pipeline status overview and progress tracking
- [/ma-enforce](/commands/ma-enforce/) - M&A enforcement actions for deal compliance and deadline tracking
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)