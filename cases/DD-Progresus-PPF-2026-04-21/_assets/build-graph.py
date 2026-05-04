#!/usr/bin/env python3
"""
build-graph.py - Build enriched knowledge graph for DD Progresus workspace

Scans all .md and .html files, extracts links, headings, tags, and computes:
- Node metadata (type, severity, title, excerpt, tags, size)
- Edge metadata (direct/implicit/weight/context)
- Clusters (by directory + content keywords)
- Related files (Jaccard similarity on tags)
- Stats (degrees, orphans, most-referenced)

Output: ../.graph.json (overwrites existing)
"""
import json
import os
import re
import sys
from pathlib import Path
from collections import defaultdict, Counter

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / ".graph.json"

# --- Classification rules -----------------------------------------------------

SEVERITY_KEYWORDS = {
    "critical": ["CRITICAL", "RED-FLAG", "RED-FLAGS", "URGENT", "SEVERE",
                 "DANCORE-FORENSIC", "MASTER-DD-REPORT", "MASTER-FINDINGS",
                 "HP-sharing-ban", "RF-1", "RF-2", "RF-3"],
    "high": ["PPF-PLAYBOOK", "VALUATION-DEFENSE", "MASTER-ACTION-PLAN",
             "ALTERNATIVE-BUYERS", "DATAROOM-INDEX", "contradictions"],
    "medium": ["financial-analysis", "legal-exposure", "osint-findings",
               "advisor-bench", "ppf-people", "principals-deep"],
}

CLUSTER_COLORS = {
    "legal": "#ef4444",      # red
    "financial": "#f59e0b",  # amber
    "entity": "#8b5cf6",     # violet
    "people": "#3b82f6",     # blue
    "osint": "#10b981",      # emerald
    "reports": "#f97316",    # orange
    "comms": "#a855f7",      # purple
    "sources": "#eab308",    # yellow
    "intel": "#06b6d4",      # cyan
    "root": "#6b7280",       # gray
}

DIR_TO_CLUSTER = {
    "01-intel": "intel",
    "02-entity": "entity",
    "03-financial": "financial",
    "04-legal": "legal",
    "05-osint": "osint",
    "06-reports": "reports",
    "07-sources": "sources",
    "08-comms-templates": "comms",
    "_assets": "root",
}

STOP_TAGS = {"the", "and", "for", "with", "this", "that", "from", "over",
             "into", "your", "have", "will", "been", "were", "they", "our"}


def classify_type(path: Path, rel: str):
    """Return (type, severity) for a file."""
    name = path.name
    stem = path.stem
    ext = path.suffix.lower()

    # Severity check first
    severity = None
    up = rel.upper()
    for sev, keywords in SEVERITY_KEYWORDS.items():
        if any(k in up for k in keywords):
            severity = sev
            break

    # Type classification
    if stem in ("00-INDEX", "README", "index"):
        return ("index", severity)
    if ext == ".html":
        if "raw" in rel.lower() or rel.endswith(".clean"):
            return ("raw", severity)
        return ("dashboard", severity)
    if "07-sources" in rel:
        return ("evidence", severity or "medium")
    if "08-comms-templates" in rel:
        return ("comms", severity or "medium")
    if severity == "critical":
        return ("red_flag", severity)
    if severity == "high":
        return ("report", severity)
    if ext == ".json":
        return ("data", severity)
    return ("markdown", severity)


def cluster_for(rel: str):
    for dir_prefix, cid in DIR_TO_CLUSTER.items():
        if rel.startswith(dir_prefix):
            return cid
    return "root"


def extract_links(content: str, ext: str):
    """Yield link targets. Strip fragments + queries for node matching."""
    if ext == ".md":
        # [text](target) - markdown link
        pattern = r'\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)'
        for m in re.finditer(pattern, content):
            label = m.group(1)
            target = m.group(2)
            if target.startswith(("http://", "https://", "mailto:", "tel:")):
                continue
            target = target.split("#")[0].split("?")[0]
            if not target:
                continue
            # Context = approximate line number
            line_no = content[: m.start()].count("\n") + 1
            yield label, target, line_no
    elif ext == ".html":
        # <a href="..."> - HTML link
        pattern = r'<a\b[^>]*?href="([^"]+)"[^>]*>([^<]*)</a>'
        for m in re.finditer(pattern, content, re.IGNORECASE):
            target = m.group(1)
            label = re.sub(r"\s+", " ", m.group(2)).strip()
            if target.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
                continue
            target = target.split("#")[0].split("?")[0]
            if not target:
                continue
            line_no = content[: m.start()].count("\n") + 1
            yield label, target, line_no


def extract_title_and_excerpt(content: str, ext: str):
    if ext == ".md":
        # First H1
        m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        title = m.group(1).strip() if m else None
        # Strip headers/links for excerpt
        stripped = re.sub(r"^#+\s+.*$", "", content, flags=re.MULTILINE)
        stripped = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", stripped)
        stripped = re.sub(r"[*_`>|]+", " ", stripped)
        stripped = re.sub(r"\s+", " ", stripped).strip()
        excerpt = stripped[:200]
        # Tags: all H2/H3 stems
        headers = re.findall(r"^#{2,3}\s+(.+)$", content, re.MULTILINE)
        tags = []
        for h in headers:
            words = re.findall(r"[A-Za-z]{4,}", h.lower())
            for w in words:
                if w not in STOP_TAGS:
                    tags.append(w)
        return title, excerpt, tags
    else:
        # HTML
        m = re.search(r"<title>([^<]+)</title>", content, re.IGNORECASE)
        title = None
        if m:
            title = re.sub(r"\s+", " ", m.group(1)).strip()
        if not title:
            m2 = re.search(r"<h1[^>]*>([^<]+)</h1>", content, re.IGNORECASE)
            if m2:
                title = re.sub(r"<[^>]+>", "", m2.group(1)).strip()
        # Excerpt: strip tags
        text = re.sub(r"<script\b[^>]*>.*?</script>", " ", content, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        excerpt = text[:200]
        # Tags from h2/h3
        headers = re.findall(r"<h[23][^>]*>([^<]+)</h[23]>", content, re.IGNORECASE)
        tags = []
        for h in headers:
            words = re.findall(r"[A-Za-z]{4,}", h.lower())
            for w in words:
                if w not in STOP_TAGS:
                    tags.append(w)
        return title, excerpt, tags


def resolve_target(from_rel: str, target: str, file_index):
    """Resolve a link target against workspace file index. Return canonical rel
    path if present, else None."""
    from_dir = os.path.dirname(from_rel)
    candidates = []
    # Absolute-from-root relative style (starts with ./ or folder name)
    norm = target.lstrip("./")
    # If starts with ../ walk up
    if target.startswith("../"):
        candidates.append(os.path.normpath(os.path.join(from_dir, target)))
    elif target.startswith("./"):
        candidates.append(os.path.normpath(os.path.join(from_dir, target[2:])))
    elif "/" in target:
        # workspace-relative + dir-relative
        candidates.append(target)
        candidates.append(os.path.normpath(os.path.join(from_dir, target)))
    else:
        # sibling first, then root
        candidates.append(os.path.normpath(os.path.join(from_dir, target)) if from_dir else target)
        candidates.append(target)

    for c in candidates:
        c = c.replace("\\", "/")
        if c in file_index:
            return c
    return None


def main():
    print(f"[build-graph] workspace: {ROOT}", file=sys.stderr)

    # --- Index all content files ---
    file_index = {}  # rel -> absolute path
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        rel = str(p.relative_to(ROOT)).replace("\\", "/")
        if rel.startswith("_assets/"):
            # Skip bundled JS/CSS libraries (but keep README.md there)
            if not rel.endswith(".md"):
                continue
        if rel.startswith("."):
            continue
        if p.suffix.lower() in (".md", ".html", ".json", ".tsv"):
            # Skip .clean duplicates
            if rel.endswith(".clean"):
                continue
            if rel == ".graph.json":
                continue
            if rel == ".manifest.json":
                continue
            file_index[rel] = p

    print(f"[build-graph] indexed {len(file_index)} files", file=sys.stderr)

    # --- Build nodes ---
    nodes = {}
    for rel, p in file_index.items():
        try:
            content = p.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            print(f"[warn] {rel}: {e}", file=sys.stderr)
            content = ""
        ext = p.suffix.lower()
        ntype, severity = classify_type(p, rel)
        title, excerpt, tags = extract_title_and_excerpt(content, ext)
        if not title:
            title = p.name
        tag_counter = Counter(tags)
        top_tags = [t for t, _ in tag_counter.most_common(8)]
        size = p.stat().st_size
        nodes[rel] = {
            "id": rel,
            "type": ntype,
            "severity": severity,
            "title": title,
            "excerpt": excerpt,
            "tags": top_tags,
            "size": size,
            "dirPath": os.path.dirname(rel) or "/",
            "cluster": cluster_for(rel),
            "ext": ext.lstrip("."),
            "aliases": [p.stem, p.name],
            "inbound": 0,
            "outbound": 0,
            "relatedFiles": [],
        }

    # --- Build edges ---
    edges = []
    edge_keys = set()
    link_context = defaultdict(list)  # (from,to) -> [line_numbers]
    for rel, p in file_index.items():
        try:
            content = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        ext = p.suffix.lower()
        mentions = Counter()
        for label, target, line_no in extract_links(content, ext):
            tgt = resolve_target(rel, target, file_index)
            if tgt and tgt != rel:
                mentions[tgt] += 1
                link_context[(rel, tgt)].append((label, line_no))
        for tgt, count in mentions.items():
            key = (rel, tgt)
            if key in edge_keys:
                continue
            edge_keys.add(key)
            # Pick first (label, line) as primary context
            label, line_no = link_context[key][0]
            weight = min(1.0, 0.2 + count * 0.1)
            edges.append({
                "from": rel,
                "to": tgt,
                "type": "direct",
                "label": label[:80] if label else "",
                "weight": round(weight, 2),
                "count": count,
                "context": f"line {line_no}",
            })
            nodes[rel]["outbound"] += 1
            if tgt in nodes:
                nodes[tgt]["inbound"] += 1

    # --- Implicit edges via Jaccard tag similarity ---
    # Only inside same cluster to cap N^2; also threshold at 0.35
    by_cluster = defaultdict(list)
    for rel, n in nodes.items():
        by_cluster[n["cluster"]].append(rel)

    implicit_count = 0
    for cid, members in by_cluster.items():
        for i, a in enumerate(members):
            ta = set(nodes[a]["tags"])
            if len(ta) < 3:
                continue
            for b in members[i + 1:]:
                tb = set(nodes[b]["tags"])
                if len(tb) < 3:
                    continue
                union = ta | tb
                if not union:
                    continue
                jaccard = len(ta & tb) / len(union)
                if jaccard >= 0.35:
                    key1 = (a, b)
                    key2 = (b, a)
                    if key1 not in edge_keys and key2 not in edge_keys:
                        edges.append({
                            "from": a,
                            "to": b,
                            "type": "implicit",
                            "label": f"tag overlap {jaccard:.2f}",
                            "weight": round(0.15 + jaccard * 0.3, 2),
                            "count": 0,
                            "context": f"tags: {','.join(sorted(ta & tb))[:60]}",
                        })
                        edge_keys.add(key1)
                        implicit_count += 1
                        nodes[a].setdefault("relatedFiles", []).append(b)
                        nodes[b].setdefault("relatedFiles", []).append(a)

    print(f"[build-graph] direct edges: {len(edges) - implicit_count}, implicit: {implicit_count}",
          file=sys.stderr)

    # --- Clusters ---
    clusters = []
    for cid, members in sorted(by_cluster.items()):
        clusters.append({
            "id": cid,
            "members": members,
            "color": CLUSTER_COLORS.get(cid, "#6b7280"),
            "count": len(members),
        })

    # --- Stats ---
    degrees = [(n["id"], n["inbound"] + n["outbound"]) for n in nodes.values()]
    degrees.sort(key=lambda x: -x[1])
    orphans = [nid for nid, d in degrees if d == 0]
    total_md = sum(1 for n in nodes.values() if n["ext"] == "md")
    total_html = sum(1 for n in nodes.values() if n["ext"] == "html")
    total_json = sum(1 for n in nodes.values() if n["ext"] == "json")
    avg_degree = round(sum(d for _, d in degrees) / len(degrees), 2) if degrees else 0
    max_degree = degrees[0][1] if degrees else 0

    stats = {
        "total_files": len(nodes),
        "total_md": total_md,
        "total_html": total_html,
        "total_json": total_json,
        "total_edges": len(edges),
        "direct_edges": len(edges) - implicit_count,
        "implicit_edges": implicit_count,
        "avg_degree": avg_degree,
        "max_degree": max_degree,
        "most_referenced": [{"id": nid, "degree": d} for nid, d in degrees[:10]],
        "orphan_nodes": orphans,
        "clusters": {c["id"]: c["count"] for c in clusters},
    }

    # --- Finalize node list (deduplicate relatedFiles) ---
    node_list = []
    for rel, n in nodes.items():
        n["relatedFiles"] = list(dict.fromkeys(n.get("relatedFiles", [])))[:8]
        node_list.append(n)

    out = {
        "version": "2.0",
        "generated": "2026-04-21",
        "nodes": node_list,
        "edges": edges,
        "clusters": clusters,
        "stats": stats,
    }

    OUTPUT.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"[build-graph] wrote {OUTPUT}", file=sys.stderr)
    print(f"[build-graph] nodes={len(node_list)} edges={len(edges)} "
          f"clusters={len(clusters)} orphans={len(orphans)}", file=sys.stderr)


if __name__ == "__main__":
    main()
