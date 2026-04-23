#!/usr/bin/env python3
"""
quality_baseline.py - Generate quality baseline report for Phase 1 target agents.

Analyzes the first 100 priority agents (L1 + L2 + L4 + first 15 L3)
and produces a comprehensive quality baseline.
"""

import json
import sys
from pathlib import Path
from datetime import date
from collections import Counter

REPORT_PATH = Path("scripts/phase1_report.json")
OUTPUT_PATH = Path("scripts/quality_baseline_report.json")
OUTPUT_MD = Path("scripts/QUALITY_BASELINE.md")


def main():
    report = json.loads(REPORT_PATH.read_text())
    agents = report["agents"]

    # Build priority list: L1 + L2 + L4 + first 15 L3
    l1 = sorted([a for a in agents if a.get("level") == "L1"], key=lambda x: x["file"])
    l2 = sorted([a for a in agents if a.get("level") == "L2"], key=lambda x: x["file"])
    l4 = sorted([a for a in agents if a.get("level") == "L4"], key=lambda x: x["file"])
    l3 = sorted([a for a in agents if a.get("level") == "L3"], key=lambda x: x["file"])

    first_100 = l1 + l2 + l4 + l3[:15]

    # Calculate statistics
    scores = [a["quality_score"] for a in first_100]
    word_counts = [a["word_count"] for a in first_100]
    domains = Counter(a["domain_normalized"] for a in first_100)
    tiers = Counter(a["academic_tier"] for a in first_100)

    avg_score = sum(scores) / len(scores)
    avg_words = sum(word_counts) / len(word_counts)

    # Score distribution
    score_dist = {
        "0-19": sum(1 for s in scores if s < 20),
        "20-39": sum(1 for s in scores if 20 <= s < 40),
        "40-59": sum(1 for s in scores if 40 <= s < 60),
        "60-79": sum(1 for s in scores if 60 <= s < 80),
        "80-100": sum(1 for s in scores if s >= 80),
    }

    # Term frequency
    all_terms = []
    for a in first_100:
        all_terms.extend(a.get("glossary_terms", []))
    term_freq = Counter(all_terms)

    # Build JSON report
    json_report = {
        "generated": str(date.today()),
        "phase": "1",
        "target_agents": 100,
        "actual_agents": len(first_100),
        "level_distribution": {
            "L1": len(l1),
            "L2": len(l2),
            "L4": len(l4),
            "L3_first": min(15, len(l3)),
        },
        "quality_baseline": {
            "average_score": round(avg_score, 1),
            "min_score": min(scores),
            "max_score": max(scores),
            "median_score": sorted(scores)[len(scores) // 2],
            "target_score": 80,
            "gap_to_target": round(80 - avg_score, 1),
        },
        "word_count_baseline": {
            "average": round(avg_words, 0),
            "min": min(word_counts),
            "max": max(word_counts),
            "target_min": 600,
            "below_target": sum(1 for w in word_counts if w < 600),
        },
        "score_distribution": score_dist,
        "academic_tier_distribution": dict(tiers),
        "domain_distribution": dict(domains.most_common()),
        "glossary_term_frequency": dict(term_freq.most_common(20)),
        "per_level_scores": {
            "L1": {
                "count": len(l1),
                "avg_score": round(sum(a["quality_score"] for a in l1) / len(l1), 1),
                "avg_words": round(sum(a["word_count"] for a in l1) / len(l1), 0),
            },
            "L2": {
                "count": len(l2),
                "avg_score": round(sum(a["quality_score"] for a in l2) / len(l2), 1),
                "avg_words": round(sum(a["word_count"] for a in l2) / len(l2), 0),
            },
            "L4": {
                "count": len(l4),
                "avg_score": round(sum(a["quality_score"] for a in l4) / len(l4), 1),
                "avg_words": round(sum(a["word_count"] for a in l4) / len(l4), 0),
            },
            "L3_first15": {
                "count": min(15, len(l3)),
                "avg_score": round(sum(a["quality_score"] for a in l3[:15]) / min(15, len(l3)), 1),
                "avg_words": round(sum(a["word_count"] for a in l3[:15]) / min(15, len(l3)), 0),
            },
        },
        "agents": [
            {
                "file": a["file"],
                "level": a["level"],
                "domain_normalized": a["domain_normalized"],
                "quality_score": a["quality_score"],
                "word_count": a["word_count"],
                "academic_tier": a["academic_tier"],
                "glossary_terms_count": len(a.get("glossary_terms", [])),
            }
            for a in first_100
        ],
    }

    OUTPUT_PATH.write_text(json.dumps(json_report, indent=2), encoding="utf-8")

    # Build Markdown report
    md_lines = [
        "# Phase 1 Quality Baseline Report",
        "",
        f"**Generated**: {date.today()}",
        f"**Target Agents**: 100 (L1: {len(l1)}, L2: {len(l2)}, L4: {len(l4)}, L3: 15)",
        f"**Glossary Terms**: 45 (20 existing + 25 new)",
        "",
        "---",
        "",
        "## Quality Score Summary",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Average Score | {avg_score:.1f} / 100 |",
        f"| Min Score | {min(scores)} |",
        f"| Max Score | {max(scores)} |",
        f"| Target Score | 80 |",
        f"| Gap to Target | {80 - avg_score:.1f} points |",
        "",
        "## Score Distribution",
        "",
        "| Range | Count | Percentage |",
        "|-------|-------|------------|",
    ]

    for range_name, count in score_dist.items():
        pct = count / len(first_100) * 100
        md_lines.append(f"| {range_name} | {count} | {pct:.0f}% |")

    md_lines.extend([
        "",
        "## Per-Level Quality",
        "",
        "| Level | Count | Avg Score | Avg Words | Target Words |",
        "|-------|-------|-----------|-----------|--------------|",
    ])

    level_targets = {"L1": 1100, "L2": 900, "L4": 700, "L3_first15": 800}
    for level_key, data in json_report["per_level_scores"].items():
        target = level_targets.get(level_key, 700)
        md_lines.append(
            f"| {level_key} | {data['count']} | {data['avg_score']} | "
            f"{int(data['avg_words'])} | {target} |"
        )

    md_lines.extend([
        "",
        "## Academic Tier Distribution",
        "",
        "| Tier | Count | Percentage |",
        "|------|-------|------------|",
    ])
    for tier, count in tiers.most_common():
        pct = count / len(first_100) * 100
        md_lines.append(f"| {tier} | {count} | {pct:.0f}% |")

    md_lines.extend([
        "",
        "## Domain Distribution",
        "",
        "| Domain | Count |",
        "|--------|-------|",
    ])
    for domain, count in domains.most_common():
        md_lines.append(f"| {domain} | {count} |")

    md_lines.extend([
        "",
        "## Top Glossary Terms (by frequency)",
        "",
        "| Term | Agent Count |",
        "|------|-------------|",
    ])
    for term, count in term_freq.most_common(20):
        md_lines.append(f"| {term} | {count} |")

    md_lines.extend([
        "",
        "## Agent Detail (first 100 by priority)",
        "",
        "| # | File | Level | Domain | Score | Words | Tier | Terms |",
        "|---|------|-------|--------|-------|-------|------|-------|",
    ])
    for i, a in enumerate(first_100, 1):
        md_lines.append(
            f"| {i} | {a['file']} | {a['level']} | {a['domain_normalized']} | "
            f"{a['quality_score']} | {a['word_count']} | {a['academic_tier']} | "
            f"{len(a.get('glossary_terms', []))} |"
        )

    md_lines.extend([
        "",
        "---",
        "",
        "## Next Steps",
        "",
        "1. Phase 2: Content enrichment for L1 agents (23 agents, highest priority)",
        "2. Phase 2: Content enrichment for L2 agents (31 agents)",
        "3. Phase 2: Content enrichment for L4 agents (31 agents)",
        "4. Phase 2: Content enrichment for first L3 batch (15 agents)",
        "5. Target: Raise average score from current baseline to 80+",
        "",
    ])

    OUTPUT_MD.write_text("\n".join(md_lines), encoding="utf-8")

    # Print summary
    print("Phase 1 Quality Baseline Report")
    print("=" * 50)
    print(f"Agents Analyzed: {len(first_100)}")
    print(f"Average Quality Score: {avg_score:.1f}")
    print(f"Score Range: {min(scores)} - {max(scores)}")
    print(f"Gap to Target (80): {80 - avg_score:.1f} points")
    print(f"Average Word Count: {avg_words:.0f}")
    print(f"Agents Below 600 Words: {sum(1 for w in word_counts if w < 600)}")
    print(f"\nReports written to:")
    print(f"  JSON: {OUTPUT_PATH}")
    print(f"  Markdown: {OUTPUT_MD}")


if __name__ == "__main__":
    main()
