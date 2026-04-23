#!/usr/bin/env python3
"""
phase1_normalize.py - Phase 1: Schema Normalization + Domain Canonicalization

Processes agent frontmatter to:
1. Normalize domain values to 25 canonical forms
2. Add academic_tier, glossary_terms, domain_normalized, quality_score
3. Ensure all standard fields present (status, agent_count)
4. Calculate word_count and quality_score baseline

Usage:
    python3 scripts/phase1_normalize.py [--dry-run] [--level L1] [--limit 100]
"""

import os
import re
import sys
import json
from pathlib import Path
from datetime import date

AGENTS_DIR = Path("content/agents")
GLOSSARY_DIR = Path("content/glossary")

# ============================================================================
# DOMAIN NORMALIZATION MAP
# Maps 166 raw domain values -> 25 canonical domains
# ============================================================================

DOMAIN_NORMALIZATION = {
    "infrastructure": [
        "infrastructure", "deployment",
        "devops,-ci/cd,-yaml-validation", "devops,-ci/cd,-quality-gates-**authority",
        "cicd-workflow-unification", "cicd-enforcement",
        "api-infrastructure",
    ],
    "intelligence": [
        "intelligence", "investigations", "advanced-intelligence-coordination",
        "session-intelligence", "execution-intelligence",
        "entity-resolution-synthesis",
    ],
    "osint": [
        "osint", "osint/czech", "osint-architecture",
    ],
    "security": [
        "security", "security-operations", "security-specialist-strategic",
        "security,-compliance,-vulnerability", "safety",
    ],
    "quality": [
        "quality", "quality-assurance", "quality-intelligence",
        "quality-evolution", "quality-enforcement", "quality-analysis",
        "quality-&-compliance", "supreme-quality-guardian",
    ],
    "development": [
        "development", "developer-productivity", "developer-experience",
        "code-analysis-architecture", "code-review,-merge-requests,-quality",
        "debugging", "compilation", "elixir-otp",
    ],
    "strategic": [
        "strategic", "strategic-coordination", "strategic-command",
    ],
    "epistemic": [
        "epistemic", "epistemic-synthesis", "epistemic-defense",
        "adversarial-epistemics", "boundary-exploration",
        "simulation-analysis",
    ],
    "evolution": [
        "evolution", "meta-evolution", "genetic-optimization-|-agent-evolution",
        "innovation-apex-predator", "neuroevolution",
        "evolutionary-|-mycelial-propagation",
    ],
    "ecosystem": [
        "ecosystem", "ecosystem-engineer", "ecosystem-analysis-|-health-assessment",
        "mycelium", "mycelial", "mycelial-propagation",
        "cross-pollination", "pattern-propagation",
        "cross-platform-pattern-distribution", "network-healing",
        "health-monitoring",
    ],
    "social": [
        "social", "twitter/x", "linkedin", "facebook", "reddit",
        "discord", "telegram", "tiktok", "youtube",
    ],
    "financial": [
        "financial", "investment", "market-analysis", "cryptocurrency",
        "business-intelligence", "business", "corporate",
    ],
    "czech": [
        "czech", "czech-republic-legal-intelligence", "czech-pattern-recognition",
        "czech-business-intelligence", "prague",
    ],
    "compliance": [
        "compliance", "regulatory",
    ],
    "documentation": [
        "documentation", "documentation-quality", "document",
    ],
    "aiad": [
        "aiad-enhanced", "aiad-ecosystem", "aiad-automation-specialist",
        "aiad-knowledge-management-specialist",
    ],
    "orchestration": [
        "orchestration", "coordination", "ai-workflow-orchestration",
        "ai-consultation-workflows", "collaborative-intelligence",
    ],
    "supreme": [
        "supreme", "cosmic", "cosmic++", "cosmic-clearance",
        "cosmic-supreme-authority", "cosmic-clearance---ecosystem-evolution",
        "absolute-authority", "ultimate-apex-predator",
        "universal-intelligence", "omega",
        "apex-predator", "apex",
    ],
    "llm": [
        "llm", "llm-operations", "ai-platform-integration",
        "ai-project-lifecycle-management",
    ],
    "performance": [
        "performance", "optimization", "statistical-computing",
    ],
    "risk": [
        "risk", "risk-management",
    ],
    "verification": [
        "verification",
    ],
    "architecture": [
        "architecture", "modernization",
    ],
    "primary": [
        "primary", "primary-producer",
    ],
    "predator": [
        "medium-predator", "large-predator",
        "large", "medium",
    ],
    "general": [
        "general", "domain", "specialist", "tactical-specialist",
        "domain-expertise", "execution", "tactical",
        "session-context-compression-intelligence",
        "hidden", "cross", "critical", "critical-organism",
        "critical-automation", "p0-critical", "real",
        "multi-class", "consolidation", "decomposer",
        "3nl-transcendent", "emergent-intelligence",
        "emergence-detection",
        ":-#-osint,-storage,-presales,-mcp,-etc.",
        "meta-learning-optimization",
        "archer-supreme-mission-support",
        "auto-enhancement", "integration",
        "production-repositories", "library-repositories",
        "platform-core-repositories", "prismatic-specific",
        "ai-archive-management", "gitlab-api,-automation,-integration",
        "geopolitical", "political", "reputation", "identity",
        "biometric", "automatic-enforcement", "authority-level",
        "research",
    ],
}

# Build reverse lookup: raw_domain -> canonical
DOMAIN_REVERSE = {}
for canonical, variants in DOMAIN_NORMALIZATION.items():
    for variant in variants:
        DOMAIN_REVERSE[variant.lower()] = canonical


# ============================================================================
# GLOSSARY TERM DETECTION
# Maps domain -> relevant glossary terms
# ============================================================================

EXISTING_GLOSSARY = [
    # Original 20 terms
    "aiad", "nabla-infinity", "trinity-gate", "mycelial-network", "cascade",
    "no-mercy", "no-doubts", "qdp",
    "otp", "genserver", "supervision-tree", "pvm",
    "3nl", "seadf", "liveview",
    "osint", "easm",
    "flowbite",
    "garden", "color-teams",
    # 25 new terms (Phase 1 core glossary)
    "beam", "phoenix", "ecto", "ets", "telemetry",
    "genstage", "dynamic-supervisor", "circuit-breaker", "backpressure",
    "process-isolation", "message-passing", "umbrella-application",
    "hot-code-reload",
    "nis2", "zkb", "rbac", "attack-surface",
    "kuzudb", "meilisearch", "postgresql", "openapi",
    "lean4", "property-based-testing",
    "entity-resolution", "ollama",
]

DOMAIN_TERM_AFFINITY = {
    "infrastructure": ["otp", "beam", "genserver", "supervision-tree", "ets",
                        "dynamic-supervisor", "circuit-breaker", "umbrella-application",
                        "postgresql", "aiad", "seadf", "telemetry"],
    "intelligence": ["osint", "entity-resolution", "nabla-infinity", "trinity-gate",
                      "aiad", "kuzudb", "postgresql"],
    "osint": ["osint", "easm", "entity-resolution", "nabla-infinity", "trinity-gate",
              "aiad", "garden", "kuzudb", "attack-surface"],
    "security": ["easm", "attack-surface", "rbac", "color-teams", "trinity-gate",
                  "aiad", "nabla-infinity", "nis2", "zkb"],
    "quality": ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad",
                "property-based-testing", "telemetry"],
    "development": ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix",
                     "liveview", "aiad", "ets", "hot-code-reload", "umbrella-application"],
    "strategic": ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate"],
    "epistemic": ["nabla-infinity", "trinity-gate", "3nl", "aiad", "color-teams",
                   "lean4", "property-based-testing"],
    "evolution": ["seadf", "mycelial-network", "aiad", "cascade", "nabla-infinity",
                   "genstage", "backpressure"],
    "ecosystem": ["mycelial-network", "seadf", "aiad", "supervision-tree",
                   "dynamic-supervisor", "process-isolation", "message-passing"],
    "social": ["osint", "entity-resolution", "nabla-infinity", "trinity-gate",
               "aiad", "garden", "kuzudb"],
    "financial": ["osint", "entity-resolution", "nabla-infinity", "aiad", "trinity-gate"],
    "czech": ["osint", "aiad", "nabla-infinity", "garden", "zkb", "nis2"],
    "compliance": ["nis2", "zkb", "no-mercy", "no-doubts", "trinity-gate", "aiad",
                    "attack-surface"],
    "documentation": ["aiad", "seadf", "no-mercy", "meilisearch"],
    "aiad": ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity",
             "otp", "genserver"],
    "orchestration": ["aiad", "otp", "genserver", "supervision-tree",
                       "dynamic-supervisor", "message-passing"],
    "supreme": ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate",
                "seadf", "otp", "beam"],
    "llm": ["aiad", "ollama", "otp", "genserver", "nabla-infinity", "circuit-breaker"],
    "performance": ["otp", "beam", "ets", "aiad", "cascade", "seadf", "telemetry",
                     "backpressure"],
    "risk": ["nabla-infinity", "trinity-gate", "aiad", "no-mercy", "attack-surface"],
    "verification": ["trinity-gate", "lean4", "property-based-testing", "nabla-infinity",
                      "aiad", "no-mercy", "no-doubts"],
    "architecture": ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl",
                      "umbrella-application", "ecto", "phoenix"],
    "primary": ["aiad", "seadf", "mycelial-network", "otp"],
    "predator": ["aiad", "seadf", "mycelial-network", "nabla-infinity"],
    "general": ["aiad", "no-mercy", "no-doubts", "otp"],
}

# Universal terms added to every agent
UNIVERSAL_TERMS = ["aiad"]


# ============================================================================
# QUALITY SCORE CALCULATION
# ============================================================================

def calculate_quality_score(body, frontmatter):
    """Calculate quality score 0-100 based on current content state."""
    extra = frontmatter.get("extra", {})
    score = 0

    # Frontmatter completeness (20 points)
    required_fields = ["domain", "level", "description", "category",
                       "status", "domain_normalized", "glossary_terms"]
    present = sum(1 for f in required_fields if f in extra)
    score += int((present / len(required_fields)) * 20)

    # Content sections (30 points)
    sections = ["## Overview", "## Operational Model", "## Capabilities",
                "## Technical Architecture", "## Integration Points",
                "## Doctrine Compliance", "## Related Agents",
                "## Further Reading"]
    present_sections = sum(1 for s in sections if s in body)
    score += int((present_sections / len(sections)) * 30)

    # Word count (15 points)
    word_count = len(body.split())
    if word_count >= 800:
        score += 15
    elif word_count >= 600:
        score += 12
    elif word_count >= 400:
        score += 8
    elif word_count >= 200:
        score += 4

    # Glossary links (15 points)
    glossary_links = body.count("@/glossary/")
    if glossary_links >= 6:
        score += 15
    elif glossary_links >= 4:
        score += 12
    elif glossary_links >= 2:
        score += 8
    elif glossary_links >= 1:
        score += 4

    # Related agent links (10 points)
    agent_links = body.count("@/agents/")
    if agent_links >= 4:
        score += 10
    elif agent_links >= 2:
        score += 7
    elif agent_links >= 1:
        score += 4

    # No generic boilerplate (10 points)
    generic_phrases = [
        "contributing to the self-evolving, deterministic intelligence infrastructure",
        "work together to provide comprehensive coverage of their operational area",
        "422-strong autonomous agent ecosystem",
    ]
    has_generic = any(phrase in body for phrase in generic_phrases)
    if not has_generic:
        score += 10

    return min(score, 100)


# ============================================================================
# TOML FRONTMATTER PARSING AND SERIALIZATION
# ============================================================================

def parse_agent_file(filepath):
    """Parse a +++ delimited TOML frontmatter file into (frontmatter_dict, body_str)."""
    content = filepath.read_text(encoding="utf-8")

    # Match +++ ... +++ ... body
    match = re.match(r'^\+\+\+\n(.*?)\n\+\+\+\n(.*)', content, re.DOTALL)
    if not match:
        return None, content

    toml_str = match.group(1)
    body = match.group(2)

    # Simple TOML parser for our known structure
    fm = {"extra": {}}

    for line in toml_str.split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line == "[extra]":
            continue

        m = re.match(r'^(\w+)\s*=\s*(.+)$', line)
        if m:
            key = m.group(1)
            val_raw = m.group(2).strip()

            # Parse value
            if val_raw.startswith('"') and val_raw.endswith('"'):
                val = val_raw[1:-1]
            elif val_raw.startswith('['):
                # Parse array
                val = json.loads(val_raw.replace("'", '"'))
            else:
                try:
                    val = int(val_raw)
                except ValueError:
                    try:
                        val = float(val_raw)
                    except ValueError:
                        val = val_raw

            # Determine if this is in [extra] section
            # Simple heuristic: title and weight are top-level, rest under extra
            if key in ("title", "weight"):
                fm[key] = val
            else:
                fm["extra"][key] = val

    return fm, body


def serialize_frontmatter(fm, body):
    """Serialize frontmatter dict + body back to +++ TOML +++ markdown format."""
    lines = ["+++"]

    # Top-level fields
    if "title" in fm:
        lines.append(f'title = "{fm["title"]}"')
    if "weight" in fm:
        lines.append(f'weight = {fm["weight"]}')

    # [extra] section
    lines.append("[extra]")
    extra = fm.get("extra", {})

    # Ordered fields for consistent output
    field_order = [
        "domain", "level", "description", "category",
        "status", "agent_count",
        "academic_tier", "glossary_terms", "domain_normalized",
        "content_version", "last_enhanced", "word_count", "quality_score",
    ]

    written = set()
    for key in field_order:
        if key in extra:
            lines.append(format_toml_value(key, extra[key]))
            written.add(key)

    # Any remaining extra fields not in standard order
    for key, val in extra.items():
        if key not in written:
            lines.append(format_toml_value(key, val))

    lines.append("+++")
    lines.append("")

    return "\n".join(lines) + body


def format_toml_value(key, val):
    """Format a single TOML key = value line."""
    if isinstance(val, str):
        return f'{key} = "{val}"'
    elif isinstance(val, bool):
        return f'{key} = {"true" if val else "false"}'
    elif isinstance(val, int):
        return f'{key} = {val}'
    elif isinstance(val, float):
        return f'{key} = {val}'
    elif isinstance(val, list):
        items = ", ".join(f'"{v}"' if isinstance(v, str) else str(v) for v in val)
        return f'{key} = [{items}]'
    else:
        return f'{key} = "{val}"'


# ============================================================================
# NORMALIZATION LOGIC
# ============================================================================

def normalize_domain(raw_domain):
    """Map raw domain string to canonical domain."""
    if not raw_domain:
        return "general"
    raw_lower = raw_domain.lower().strip()
    return DOMAIN_REVERSE.get(raw_lower, "general")


def detect_glossary_terms(domain_normalized, level, description, body):
    """Detect relevant glossary terms for this agent."""
    terms = set()

    # Domain affinity terms
    if domain_normalized in DOMAIN_TERM_AFFINITY:
        for term in DOMAIN_TERM_AFFINITY[domain_normalized]:
            terms.add(term)

    # Universal terms
    for term in UNIVERSAL_TERMS:
        terms.add(term)

    # Content-based detection
    content = (description + " " + body).lower()
    term_patterns = {
        # Original terms
        "otp": ["otp", "genserver", "supervisor", "beam"],
        "genserver": ["genserver", "gen_server"],
        "supervision-tree": ["supervision tree", "supervisor", "supervision"],
        "nabla-infinity": ["nabla", "epistemic", "axiom", "signal plurality"],
        "trinity-gate": ["trinity gate", "trinity-gate", "formal verification"],
        "osint": ["osint", "open source intelligence", "intelligence gathering"],
        "easm": ["easm", "attack surface", "external attack"],
        "cascade": ["cascade", "quality pattern"],
        "qdp": ["qdp", "quality debt"],
        "color-teams": ["color team", "red team", "blue team", "purple team", "gray team"],
        "mycelial-network": ["mycelial", "mycelium"],
        "seadf": ["seadf", "self-evolving"],
        "3nl": ["3nl", "three-level"],
        "liveview": ["liveview", "live view", "live_view"],
        "pvm": ["pvm", "platform vm"],
        "garden": ["garden", "legacy knowledge"],
        "no-mercy": ["no mercy", "no-mercy", "nm/nd"],
        "no-doubts": ["no doubts", "no-doubts", "nm/nd"],
        "flowbite": ["flowbite"],
        # New terms
        "beam": ["beam", "virtual machine", "erlang abstract"],
        "phoenix": ["phoenix", "liveview", "endpoint"],
        "ecto": ["ecto", "changeset", "migration", "repo"],
        "ets": ["ets", "erlang term storage", "ets table"],
        "telemetry": ["telemetry", "metrics", "instrumentation"],
        "genstage": ["genstage", "gen_stage", "pipeline"],
        "dynamic-supervisor": ["dynamicsupervisor", "dynamic_supervisor", "dynamic supervisor"],
        "circuit-breaker": ["circuit breaker", "circuit-breaker"],
        "backpressure": ["backpressure", "back-pressure", "demand-driven"],
        "process-isolation": ["process isolation", "crash isolation", "fault isolation"],
        "message-passing": ["message passing", "message-passing", "mailbox"],
        "umbrella-application": ["umbrella", "umbrella application"],
        "hot-code-reload": ["hot code", "hot reload", "code reload", "zero-downtime"],
        "nis2": ["nis2", "nis 2", "2022/2555", "network and information security"],
        "zkb": ["zkb", "264/2025", "kyberneticke bezpecnosti"],
        "rbac": ["rbac", "role-based", "access control"],
        "attack-surface": ["attack surface", "attack-surface"],
        "kuzudb": ["kuzudb", "kuzu", "graph database"],
        "meilisearch": ["meilisearch", "full-text search"],
        "postgresql": ["postgresql", "postgres", "psql"],
        "openapi": ["openapi", "swagger", "openapispex"],
        "lean4": ["lean4", "lean 4", "theorem prover", "formal proof"],
        "property-based-testing": ["property-based", "streamdata", "property test"],
        "entity-resolution": ["entity resolution", "entity-resolution", "record linkage", "identity resolution"],
        "ollama": ["ollama", "local ai", "local llm"],
    }

    for term, patterns in term_patterns.items():
        for pattern in patterns:
            if pattern in content:
                terms.add(term)
                break

    # Filter to only existing glossary terms
    valid_terms = [t for t in terms if t in EXISTING_GLOSSARY]

    # Sort by relevance (domain affinity terms first)
    affinity = DOMAIN_TERM_AFFINITY.get(domain_normalized, [])
    def sort_key(t):
        if t in affinity:
            return (0, affinity.index(t))
        return (1, 0)

    valid_terms.sort(key=sort_key)
    return valid_terms[:10]


def determine_academic_tier(word_count, section_count, glossary_link_count):
    """Determine academic tier based on current content quality."""
    if word_count >= 600 and section_count >= 6 and glossary_link_count >= 4:
        return "whitepaper"
    elif word_count >= 300 and section_count >= 4:
        return "technical"
    else:
        return "overview"


def process_agent(filepath, dry_run=False):
    """Process a single agent file for Phase 1 normalization."""
    fm, body = parse_agent_file(filepath)
    if fm is None:
        return {"file": filepath.name, "status": "SKIP", "reason": "no frontmatter"}

    extra = fm.get("extra", {})
    original_domain = extra.get("domain", "")

    # 1. Normalize domain
    domain_normalized = normalize_domain(original_domain)

    # 2. Detect glossary terms
    level = extra.get("level", "L3")
    description = extra.get("description", "")
    glossary_terms = detect_glossary_terms(domain_normalized, level, description, body)

    # 3. Calculate metrics
    word_count = len(body.split())
    sections = [line for line in body.split("\n") if line.startswith("## ")]
    section_count = len(sections)
    glossary_link_count = body.count("@/glossary/")

    # 4. Determine academic tier
    academic_tier = determine_academic_tier(word_count, section_count, glossary_link_count)

    # 5. Calculate quality score
    # Temporarily add new fields for scoring
    extra["domain_normalized"] = domain_normalized
    extra["glossary_terms"] = glossary_terms
    quality_score = calculate_quality_score(body, fm)

    # 6. Set all enriched fields
    extra.setdefault("status", "Active")
    extra.setdefault("agent_count", 1)
    extra["academic_tier"] = academic_tier
    extra["glossary_terms"] = glossary_terms
    extra["domain_normalized"] = domain_normalized
    extra["content_version"] = "1.0.0"
    extra["last_enhanced"] = str(date.today())
    extra["word_count"] = word_count
    extra["quality_score"] = quality_score

    fm["extra"] = extra

    result = {
        "file": filepath.name,
        "status": "OK",
        "domain_raw": original_domain,
        "domain_normalized": domain_normalized,
        "level": level,
        "academic_tier": academic_tier,
        "glossary_terms": glossary_terms,
        "word_count": word_count,
        "quality_score": quality_score,
    }

    if not dry_run:
        output = serialize_frontmatter(fm, body)
        filepath.write_text(output, encoding="utf-8")
        result["written"] = True

    return result


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    dry_run = "--dry-run" in sys.argv
    level_filter = None
    limit = None

    for i, arg in enumerate(sys.argv):
        if arg == "--level" and i + 1 < len(sys.argv):
            level_filter = sys.argv[i + 1]
        if arg == "--limit" and i + 1 < len(sys.argv):
            limit = int(sys.argv[i + 1])

    agent_files = sorted(AGENTS_DIR.glob("*.md"))
    agent_files = [f for f in agent_files if f.name != "_index.md"]

    if level_filter:
        # Pre-filter by level
        filtered = []
        for f in agent_files:
            content = f.read_text(encoding="utf-8")
            if f'level = "{level_filter}"' in content:
                filtered.append(f)
        agent_files = filtered

    if limit:
        agent_files = agent_files[:limit]

    print(f"Phase 1: Schema Normalization")
    print(f"  Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print(f"  Level filter: {level_filter or 'ALL'}")
    print(f"  Files to process: {len(agent_files)}")
    print(f"  Date: {date.today()}")
    print()

    results = []
    domain_stats = {}
    tier_stats = {"overview": 0, "technical": 0, "whitepaper": 0}
    score_sum = 0
    score_count = 0

    for filepath in agent_files:
        result = process_agent(filepath, dry_run)
        results.append(result)

        if result["status"] == "OK":
            dn = result["domain_normalized"]
            domain_stats[dn] = domain_stats.get(dn, 0) + 1
            tier_stats[result["academic_tier"]] += 1
            score_sum += result["quality_score"]
            score_count += 1

    # Print summary
    print("=" * 60)
    print("PHASE 1 RESULTS")
    print("=" * 60)
    print(f"\nProcessed: {len(results)} agents")
    print(f"Successful: {sum(1 for r in results if r['status'] == 'OK')}")
    print(f"Skipped: {sum(1 for r in results if r['status'] == 'SKIP')}")

    if score_count > 0:
        print(f"\nAverage Quality Score: {score_sum / score_count:.1f}")
        scores = [r["quality_score"] for r in results if r["status"] == "OK"]
        print(f"Score Range: {min(scores)} - {max(scores)}")
        print(f"Below 20: {sum(1 for s in scores if s < 20)}")
        print(f"20-49: {sum(1 for s in scores if 20 <= s < 50)}")
        print(f"50-79: {sum(1 for s in scores if 50 <= s < 80)}")
        print(f"80+: {sum(1 for s in scores if s >= 80)}")

    print(f"\nAcademic Tier Distribution:")
    for tier, count in sorted(tier_stats.items()):
        print(f"  {tier}: {count}")

    print(f"\nDomain Distribution (top 15):")
    for domain, count in sorted(domain_stats.items(), key=lambda x: -x[1])[:15]:
        print(f"  {domain}: {count}")

    # Write detailed report
    report = {
        "phase": 1,
        "date": str(date.today()),
        "mode": "dry_run" if dry_run else "live",
        "total_processed": len(results),
        "successful": sum(1 for r in results if r["status"] == "OK"),
        "average_score": round(score_sum / score_count, 1) if score_count else 0,
        "tier_distribution": tier_stats,
        "domain_distribution": domain_stats,
        "agents": results,
    }

    report_path = Path("scripts/phase1_report.json")
    report_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    print(f"\nDetailed report: {report_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
