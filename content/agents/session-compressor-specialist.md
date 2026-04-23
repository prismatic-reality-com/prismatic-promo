+++
title = "session-compressor-specialist"
weight = 367
[extra]
domain = "session-context-compression-intelligence"
level = "L3"
description = "Analyzes session structure, content types, and compression candidates for optimal context preservation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session-compressor-specialist", "Analyzes", "agents", "agent", "Prismatic Platform", "Full", "Semantic", "Decision"]
tags = ["agents", "agent", "session-compressor-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "session-compressor-specialist - Prismatic Platform"
+++

## Overview

The session-compressor-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's session-context-compression-intelligence domain, responsible for analyzing session context artifacts, identifying compression opportunities, and reducing the storage and transmission overhead of session data while preserving its informational value. In a platform where every development session generates structured context files that accumulate over hundreds of sessions, uncompressed context storage becomes both a storage burden and a retrieval performance bottleneck. This agent applies intelligent compression that maintains semantic completeness while reducing data volume.

The challenge of session compression extends beyond simple text compression algorithms. Session context files contain heterogeneous content: structured metadata, prose descriptions of decisions, code snippets, file path lists, quality metrics, and cross-references to previous sessions. Different content types benefit from different compression strategies, and some content (such as key decisions and architectural rationale) must never be lossy-compressed because it represents irreplaceable institutional knowledge. The session-compressor-specialist navigates these requirements through content-aware compression that applies appropriate strategies to each content type.

## Operational Domain

The session-context-compression-intelligence domain covers the complete lifecycle of session context data from creation through long-term archival. Session context files are stored in `.claude/session-context/` following the naming convention `YYYY-MM-DD-{description}-session.md`. As the platform has evolved through hundreds of development sessions, this directory has accumulated significant volume that impacts context loading performance at session start.

The domain includes analysis of session content to identify redundancy between sessions, obsolete information that can be safely archived, and frequently-referenced context that should be optimized for fast retrieval. The agent also manages the relationship between full session records and compressed summaries, ensuring that compressed versions maintain sufficient detail for cross-session continuity.

## Key Capabilities

- **Content-type analysis** -- Classifies session content into categories (decisions, code changes, metrics, file lists, cross-references, prose descriptions) and applies type-appropriate compression strategies. Structural content like tables and lists compress differently than narrative prose
- **Semantic deduplication** -- Identifies information that is repeated across multiple session contexts (such as platform statistics, architecture descriptions, or repeated quality metrics) and consolidates these into shared reference points rather than duplicating storage
- **Lossless decision preservation** -- Ensures that all key decisions, architectural rationale, and irreversible actions are preserved at full fidelity regardless of compression applied to surrounding context. Decision records are tagged as compression-exempt
- **Progressive summarization** -- Implements a tiered retention policy where recent sessions maintain full detail, intermediate sessions retain structured summaries, and older sessions are compressed to essential decisions and outcomes only
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with automatic compression triggered when session context volume exceeds configured thresholds
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing compression metrics under the `:prismatic, :session_compression` namespace

## Compression Strategy Framework

The agent applies different compression strategies based on content type and age, balancing storage efficiency against information preservation.

| Content Type | Fresh (< 7 days) | Recent (7-30 days) | Archive (> 30 days) |
|-------------|-------------------|---------------------|---------------------|
| **Decisions** | Full preservation | Full preservation | Full preservation |
| **Code changes** | Full diff | Summary + key files | File list only |
| **Quality metrics** | Full detail | Summary statistics | Delta from baseline |
| **File lists** | Complete paths | Changed files only | Count summary |
| **Prose descriptions** | Full text | Condensed summary | Key points only |
| **Cross-references** | All links | Active links only | Critical links only |

## Session Context Architecture

Session context within the Prismatic Platform follows a structured format that enables systematic compression analysis.

| Section | Purpose | Compression Potential |
|---------|---------|---------------------|
| **Objectives** | What the session aimed to accomplish | Low -- unique per session |
| **Actions Taken** | Specific work performed | Medium -- pattern-based compression |
| **Files Modified** | List of changed files with descriptions | High -- path deduplication |
| **Deliverables** | Concrete outputs produced | Low -- reference value |
| **Key Decisions** | Architectural and design choices made | None -- always preserved |
| **Open Questions** | Unresolved items for future sessions | Medium -- resolution tracking |
| **Next Steps** | Recommended follow-up actions | Medium -- completion tracking |

## Compression Metrics

The agent tracks compression effectiveness across multiple dimensions to optimize its strategies over time.

| Metric | Description | Target |
|--------|-------------|--------|
| **Compression ratio** | Compressed size / original size | < 0.4 for archive tier |
| **Semantic retention** | Preserved information value / original value | > 0.95 for all tiers |
| **Decision completeness** | Preserved decisions / total decisions | 1.0 (100%, no loss) |
| **Retrieval latency** | Time to load compressed context | < 100ms for recent tier |
| **Deduplication rate** | Unique content / total content across sessions | > 0.7 |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority for session context compression with the ability to modify session storage strategies and manage the retention lifecycle across all session artifacts.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/session compress` | Trigger compression analysis and execution on session context store | L3+ |
| `/session compress --dry-run` | Analyze compression candidates without applying changes | L2+ |
| `/session storage` | Display session context storage statistics and compression metrics | L2+ |
| `/session deduplicate` | Identify and consolidate duplicate content across sessions | L3+ |
| `/session archive` | Move aged sessions to archive tier with appropriate compression | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [session-debrief-specialist](/agents/session-debrief-specialist/) | Produces the session context artifacts that this agent compresses |
| [session-context-coordinator](/agents/session-context-coordinator/) | Coordinates context loading where compression affects retrieval paths |
| [session-context-synthesizer](/agents/session-context-synthesizer/) | Synthesis operations consume compressed context and may require decompression |
| [session-pattern-analyzer](/agents/session-pattern-analyzer/) | Pattern analysis benefits from compressed views that highlight structural patterns |

## Quality Assurance

Compression operations must maintain complete fidelity for critical content types. The agent implements a verification protocol that compares compressed output against the original to validate that no critical information was lost.

| Verification Check | Method | Threshold |
|-------------------|--------|-----------|
| Decision preservation | Exact text comparison | 100% match |
| Metric accuracy | Numeric comparison | Zero deviation |
| Cross-reference integrity | Link validation | All links resolve |
| Structural completeness | Section presence check | All required sections present |
| Semantic coherence | Reconstruction test | Original meaning recoverable |

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that compression never compromises the platform's ability to maintain cross-session continuity. Any compression that would result in decision loss, context ambiguity, or broken cross-references is rejected. Compression operations maintain full audit trails per [NABLA Infinity](/glossary/nabla-infinity/) provenance requirements, enabling verification that compressed content remains equivalent to its original for all critical use cases.

## Related Agents

Agents in the **session-context-compression-intelligence** domain work together to manage the complete lifecycle of session knowledge, from creation through compression to archival. The session-compressor-specialist ensures that the growing body of session context remains manageable without sacrificing the institutional knowledge that enables effective cross-session development continuity.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)