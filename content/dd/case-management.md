+++
title = "Case Management and Investigation Workflow"
weight = 50
date = "2026-02-17"

[extra]
tags = ["case-management", "investigation", "workflow", "lifecycle", "collaboration", "due-diligence"]
icon = "folder-open"
color = "amber"
description = "Structured investigation workflow from case creation through evidence collection, analysis, review, and report generation with full audit trails"
category = "workflow"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "13 min"
word_count = 2400
difficulty = "intermediate"
image = "/images/dd/case-management.png"
image_alt = "Due diligence case management investigation workflow"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 89
see_also = ["methodology", "entity-management", "risk-assessment", "ma-due-diligence"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Case", "Management", "Investigation", "Workflow", "Structured", "Prismatic Platform", "Requires", "Tasks", "System"]
+++

## Abstract

The Case Management System provides the organizational and procedural framework for due diligence investigations within the Prismatic Platform. It manages the lifecycle of investigation cases from creation through assignment, scoping, evidence collection, analysis, review, and final report delivery, ensuring that every investigation follows a structured, auditable, and compliant process. Cases support hierarchical organization, role-based access control, collaborative workflows, and integration with all platform subsystems including [entity management](/dd/entity-management/), [graph analysis](/dd/graph-analysis/), [risk assessment](/dd/risk-assessment/), and [OSINT collection](/dd/osint-integration/). This document describes the case lifecycle, the workflow engine, collaboration features, access control model, and reporting capabilities.

## Introduction

### The Need for Structured Case Management

Due diligence investigations are complex, multi-step processes involving multiple analysts, dozens of data sources, hundreds of entity records, and regulatory requirements that mandate comprehensive audit trails. Without structured case management, investigations devolve into ad-hoc collections of notes, screenshots, and spreadsheets -- producing outputs that are difficult to review, impossible to audit, and vulnerable to incomplete coverage.

The Prismatic Platform's Case Management System addresses this by treating each investigation as a first-class workflow object with defined states, transitions, actors, and deliverables. Every action within an investigation -- from entity creation to source query to analyst note to risk score computation -- is captured within the case context, creating a complete record of how conclusions were reached.

### Design Principles

The case management system follows principles derived from both the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine and established investigation management practices:

1. **Complete Capture**: Every investigation action is recorded within the case context. No findings exist outside of a case.
2. **Structured Workflow**: Investigations follow defined lifecycle stages with explicit transition criteria.
3. **Role-Based Access**: Case data is accessible only to authorized users based on their role and assignment.
4. **Hierarchical Organization**: Complex investigations can be decomposed into sub-cases with independent lifecycles.
5. **Regulatory Compliance**: Case records satisfy the audit trail requirements of [NIS2](/glossary/nis2/), [AML/KYC](/dd/compliance/), and internal compliance frameworks.

## Case Lifecycle

### Lifecycle States

Every case progresses through a defined set of lifecycle states:

```
DRAFT --> SCOPED --> COLLECTING --> ANALYZING --> REVIEWING --> COMPLETE
  |         |           |              |             |            |
  v         v           v              v             v            v
CANCELLED  CANCELLED   PAUSED        PAUSED       REJECTED     ARCHIVED
```

| State | Description | Responsible Actor | Entry Criteria |
|-------|-------------|-------------------|----------------|
| **DRAFT** | Case created with initial parameters | Case creator | Case creation request |
| **SCOPED** | Investigation scope defined and approved | Lead analyst + reviewer | Scope document approved |
| **COLLECTING** | Active OSINT collection and entity enrichment | Platform + analysts | Scope approved, entities identified |
| **ANALYZING** | Evidence analysis, graph traversal, risk scoring | Lead analyst | Collection substantially complete |
| **REVIEWING** | Peer review of findings and assessments | Reviewer (senior analyst) | Analysis report drafted |
| **COMPLETE** | Investigation finalized, report delivered | Lead analyst | Review approved |
| **ARCHIVED** | Case archived for long-term retention | System | 90 days after completion |
| **CANCELLED** | Case terminated before completion | Case creator or reviewer | Cancellation approved |
| **PAUSED** | Case temporarily suspended | Lead analyst | Pause request with justification |

### State Transition Rules

State transitions are governed by explicit rules that prevent premature advancement:

- **DRAFT to SCOPED**: Requires scope document with defined entity targets, investigation objectives, timeline, and applicable regulatory framework
- **SCOPED to COLLECTING**: Requires at least one seed entity created and approved for investigation
- **COLLECTING to ANALYZING**: Requires minimum 80% of planned source queries completed with results processed
- **ANALYZING to REVIEWING**: Requires risk assessment computed for all primary entities, analyst summary drafted, and all critical contradictions resolved or documented
- **REVIEWING to COMPLETE**: Requires reviewer approval, all review comments addressed, and final report generated
- **Any state to CANCELLED**: Requires justification and approval from case creator or designated reviewer

## Workflow Engine

### Task Management

Within each lifecycle state, the workflow engine manages individual tasks that must be completed before the case can advance. Tasks are generated automatically based on the case scope and can also be created manually by analysts.

**Automatic Tasks** (generated by the platform):

| Task Type | Trigger | Assignment |
|-----------|---------|------------|
| Entity enrichment | New entity added to case | Platform (automated) |
| Source collection | Entity enrichment initiated | Platform (per source adapter) |
| Validation | Source data received | [Validation engine](/dd/methodology/) |
| Risk scoring | Entity validation complete | [Risk assessment](/dd/risk-assessment/) |
| Contradiction review | Cross-source contradiction detected | Lead analyst |
| Sanctions screening | New person/company entity | Platform (automated) |

**Manual Tasks** (created by analysts):

- Deep-dive investigation on specific entity or finding
- External source consultation (e.g., contacting registry directly)
- Legal review of specific document or filing
- Expert opinion request for specialized domain

### Task Prioritization

Tasks are prioritized using a composite scoring model that considers:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Entity importance** | 0.30 | Primary target entities receive highest priority |
| **Risk indicator** | 0.25 | Tasks related to flagged risk indicators are elevated |
| **Deadline proximity** | 0.20 | Tasks with approaching deadlines are prioritized |
| **Dependency count** | 0.15 | Tasks that block other tasks are prioritized |
| **Analyst capacity** | 0.10 | Tasks assigned to available analysts are prioritized |

### Parallel Execution

The workflow engine leverages [Elixir](/glossary/elixir/)/[OTP](/glossary/otp/) concurrency to execute independent tasks in parallel. Entity enrichment across multiple [OSINT sources](/dd/osint-integration/) runs concurrently, and independent entity investigations within the same case proceed simultaneously. The platform monitors task completion and triggers downstream tasks as their dependencies are satisfied.

## Hierarchical Case Organization

Complex investigations, particularly [M&A due diligence](/dd/ma-due-diligence/) engagements, often involve multiple investigation targets with distinct scopes. The case management system supports hierarchical case organization:

```
Parent Case: M&A Due Diligence - Acquisition of Target Group
    |
    +-- Child Case: Target Company A (primary target)
    |       |-- Entity Graph: 47 entities, 128 relationships
    |       |-- Risk Assessment: B+ (720/900)
    |       |-- Status: ANALYZING
    |
    +-- Child Case: Subsidiary B (material subsidiary)
    |       |-- Entity Graph: 23 entities, 56 relationships
    |       |-- Risk Assessment: A- (810/900)
    |       |-- Status: REVIEWING
    |
    +-- Child Case: Key Person Investigation (CEO, CFO)
    |       |-- Entity Graph: 12 entities, 34 relationships
    |       |-- Risk Assessment: In progress
    |       |-- Status: COLLECTING
    |
    +-- Child Case: IP and Technology Assessment
            |-- Entity Graph: 8 entities, 15 relationships
            |-- Status: SCOPED
```

Parent cases aggregate risk assessments from child cases, providing a consolidated view of the overall investigation. Child cases maintain independent lifecycles and can advance through states independently of each other.

## Access Control Model

### Role-Based Access Control

The case management system implements [RBAC](/glossary/rbac/) with four defined roles:

| Role | Permissions | Typical User |
|------|-------------|-------------|
| **Case Creator** | Create cases, define scope, assign analysts, cancel cases | Senior analyst, partner |
| **Lead Analyst** | Full investigation access, entity management, risk scoring, report drafting | Assigned investigation lead |
| **Analyst** | View case data, add notes, create manual tasks, contribute findings | Team member |
| **Reviewer** | View all case data, approve/reject transitions, add review comments | Senior analyst, compliance officer |

### Data Isolation

Case data is strictly isolated. An analyst assigned to Case A cannot access entity data, findings, or risk assessments from Case B unless they are also assigned to Case B. This isolation extends to:

- Database-level row security on entity records
- Case-scoped search indexes in [Meilisearch](/glossary/meilisearch/)
- Case-filtered graph queries in [KuzuDB](/glossary/kuzudb/)
- Case-scoped [audit trail](/glossary/audit-trail/) entries

### Audit Trail

Every action within a case generates an immutable audit trail entry. The audit trail captures:

- **Who**: User or system process that performed the action
- **What**: Specific action taken (entity created, source queried, note added, state transition)
- **When**: UTC timestamp with microsecond precision
- **Context**: Case ID, entity ID, and any additional contextual data
- **Justification**: For state transitions and manual overrides, the recorded justification

The audit trail is append-only and cannot be modified or deleted, satisfying regulatory requirements for investigation record-keeping.

## Collaboration Features

### Real-Time Collaboration

Built on [Phoenix LiveView](/glossary/liveview/), the case management interface provides real-time collaboration features:

- **Live entity updates**: When one analyst enriches an entity, all other case participants see updated data immediately
- **Concurrent note editing**: Multiple analysts can add notes to the same entity simultaneously
- **Real-time status**: Case dashboard shows current status, active tasks, and analyst activity
- **Notifications**: Configurable notifications for state transitions, contradiction alerts, and task assignments

### Investigation Notes

Analysts can attach structured notes to cases, entities, relationships, or individual findings. Notes support:

- Rich text formatting for detailed analysis narratives
- File attachments for supporting documents
- Tagging for categorization and search
- Visibility controls (private to analyst, shared with case team, shared with reviewers)
- Threading for discussion on specific findings

### Evidence Collection

The evidence collection system captures and organizes all investigative evidence:

| Evidence Type | Source | Storage |
|---------------|--------|---------|
| **Registry records** | Automated [OSINT collection](/dd/osint-integration/) | Structured entity data |
| **Documents** | Manual upload or registry download | Document store with metadata |
| **Screenshots** | Analyst-captured web evidence | Image store with annotations |
| **Notes** | Analyst observations and analysis | Note database with threading |
| **External reports** | Third-party intelligence reports | Document store with provenance |

All evidence carries chain-of-custody metadata documenting who collected it, when, from what source, and how it was processed.

## Reporting System

### Report Types

The platform generates several report types from case data:

| Report Type | Audience | Format | Content |
|-------------|----------|--------|---------|
| **Executive Summary** | Decision-makers | PDF, 2-5 pages | Key findings, risk rating, recommendation |
| **Detailed DD Report** | Legal/compliance | PDF, 20-50 pages | Full investigation narrative with evidence |
| **Risk Assessment** | Risk committee | PDF/HTML | Dimensional risk scores with supporting data |
| **Entity Profile** | Analysts | HTML/JSON | Comprehensive entity data with source attribution |
| **Compliance Mapping** | Regulators | PDF | Findings mapped to [NIS2](/glossary/nis2/)/[ZKB](/glossary/zkb/) requirements |
| **Graph Export** | Technical review | JSON/GraphML | Full relationship graph for external analysis |

### Report Generation Pipeline

Report generation follows a defined pipeline:

1. **Data Collection**: Aggregate all verified findings, risk scores, and analyst notes from the case
2. **Template Selection**: Choose appropriate report template based on report type and case category
3. **Content Generation**: Populate template sections with case data, including tables, charts, and graph visualizations
4. **Quality Check**: Validate report completeness against checklist (all entities covered, all risk dimensions scored, all contradictions documented)
5. **Review Insertion**: Include reviewer comments and sign-off section
6. **Export**: Generate final report in requested format(s)

### Compliance-Mapped Reporting

For regulated industries, the reporting system maps investigation findings to specific regulatory requirements. The [compliance module](/dd/compliance/) provides mapping templates for:

- **NIS2**: Supply chain security assessment requirements
- **ZKB**: Czech cybersecurity regulation entity verification
- **AML/KYC**: Customer due diligence and enhanced due diligence
- **GDPR**: Data processing impact assessments for investigated entities

Each compliance mapping identifies which investigation findings satisfy which regulatory requirements, creating a direct link between due diligence work and regulatory compliance.

## Integration Points

The case management system integrates with all major platform subsystems:

| Subsystem | Integration |
|-----------|-------------|
| **[Entity Management](/dd/entity-management/)** | Entities exist within case scope; case drives enrichment |
| **[Graph Analysis](/dd/graph-analysis/)** | Graph traversals scoped to case entities |
| **[Risk Assessment](/dd/risk-assessment/)** | Risk scores computed per case; aggregated in parent cases |
| **[OSINT Integration](/dd/osint-integration/)** | Source queries triggered by case workflow engine |
| **[Triple-Check Validation](/dd/methodology/)** | Validation pipeline processes case evidence |
| **[Compliance Mapping](/dd/compliance/)** | Regulatory frameworks applied to case findings |

## Conclusion

The Case Management System transforms due diligence from an unstructured collection of research activities into a governed, auditable, and reproducible investigation process. By enforcing structured workflows, maintaining comprehensive audit trails, supporting collaborative analysis, and generating compliance-mapped reports, the system ensures that every Prismatic due diligence investigation meets the evidentiary and procedural standards required by regulators, legal counsel, and corporate decision-makers.

## References

- [Entity Management System](/dd/entity-management/)
- [Triple-Check Methodology](/dd/methodology/)
- [Risk Assessment Framework](/dd/risk-assessment/)
- [M&A Due Diligence Workflow](/dd/ma-due-diligence/)
- [Compliance Framework Integration](/dd/compliance/)
- [OSINT Integration Framework](/dd/osint-integration/)
- [Phoenix LiveView](/glossary/liveview/)
- [RBAC](/glossary/rbac/)
- [Audit Trail](/glossary/audit-trail/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
