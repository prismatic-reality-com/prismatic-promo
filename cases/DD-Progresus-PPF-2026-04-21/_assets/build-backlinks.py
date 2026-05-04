#!/usr/bin/env python3
"""
Backlinks builder — injects BACKLINKS/RELATED/GRAPH sections into every .md in the workspace.

Idempotent via BACKLINKS_START / BACKLINKS_END delimiters.
Consumes `.graph.json` at workspace root (nodes + edges).
"""
from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
GRAPH = WORKSPACE / ".graph.json"
MANIFEST = WORKSPACE / ".manifest.json"

START = "<!-- BACKLINKS_START -->"
END = "<!-- BACKLINKS_END -->"

BACKLINK_RE = re.compile(
    re.escape(START) + r".*?" + re.escape(END) + r"\s*", re.DOTALL
)


def rel(from_file: str, to_file: str) -> str:
    """Return POSIX-style relative path from one workspace-relative path to another."""
    src = (WORKSPACE / from_file).resolve().parent
    dst = (WORKSPACE / to_file).resolve()
    try:
        p = os.path.relpath(dst, src)
    except ValueError:
        p = str(dst)
    p = p.replace(os.sep, "/")
    if not (p.startswith("./") or p.startswith("../")):
        p = "./" + p
    return p


def load_graph() -> dict:
    with GRAPH.open() as f:
        return json.load(f)


def load_manifest_tags() -> dict[str, set[str]]:
    """Return {file_id: {tags}} — pull from .manifest.json if usable, else empty."""
    if not MANIFEST.exists():
        return {}
    try:
        with MANIFEST.open() as f:
            m = json.load(f)
    except Exception:
        return {}
    out: dict[str, set[str]] = {}
    items = m.get("files") or m.get("entries") or m
    if isinstance(items, dict):
        for fid, data in items.items():
            if isinstance(data, dict):
                t = data.get("tags") or []
                if isinstance(t, list):
                    out[fid] = set(str(x).lower() for x in t)
    elif isinstance(items, list):
        for row in items:
            if isinstance(row, dict):
                fid = row.get("id") or row.get("path")
                t = row.get("tags") or []
                if fid and isinstance(t, list):
                    out[fid] = set(str(x).lower() for x in t)
    return out


def fallback_tags(md_path: Path) -> set[str]:
    """Extract tags from markdown H2/H3 headers + filename tokens."""
    tags: set[str] = set()
    try:
        txt = md_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return tags
    for m in re.finditer(r"^#{2,3}\s+(.+?)$", txt, re.MULTILINE):
        words = re.findall(r"[A-Za-z]{3,}", m.group(1).lower())
        tags.update(words[:6])
    tags.update(re.findall(r"[a-z]{3,}", md_path.stem.lower()))
    stop = {"the", "and", "for", "with", "this", "that", "from", "into", "are",
            "not", "was", "all", "has", "had", "have", "but", "its", "your",
            "readme", "index", "pass", "intel", "file", "files", "report",
            "reports"}
    return {t for t in tags if t not in stop}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def collect_backlinks(graph: dict) -> dict[str, list[dict]]:
    """{target_file: [{source, count, label}, ...]} aggregated by source."""
    out: dict[str, dict[str, dict]] = defaultdict(dict)
    for e in graph.get("edges", []):
        src = e.get("from")
        dst = e.get("to")
        if not src or not dst:
            continue
        if src == dst:
            continue
        bucket = out[dst].setdefault(src, {"count": 0, "labels": []})
        bucket["count"] += int(e.get("count") or 1)
        lbl = e.get("label")
        if lbl and lbl not in bucket["labels"]:
            bucket["labels"].append(lbl)
    final: dict[str, list[dict]] = {}
    for tgt, srcs in out.items():
        rows = []
        for s, d in srcs.items():
            rows.append({
                "source": s,
                "count": d["count"],
                "label": (d["labels"][0] if d["labels"] else None),
            })
        rows.sort(key=lambda r: (-r["count"], r["source"]))
        final[tgt] = rows
    return final


def compute_related(
    all_ids: list[str], tag_map: dict[str, set[str]], threshold: float = 0.3
) -> dict[str, list[tuple[str, float]]]:
    """Top-5 per file by Jaccard similarity above threshold."""
    out: dict[str, list[tuple[str, float]]] = {}
    ids_md = [i for i in all_ids if i.endswith(".md")]
    for a in ids_md:
        ta = tag_map.get(a, set())
        if not ta:
            continue
        scores = []
        for b in ids_md:
            if a == b:
                continue
            tb = tag_map.get(b, set())
            s = jaccard(ta, tb)
            if s >= threshold:
                scores.append((b, s))
        scores.sort(key=lambda x: -x[1])
        if scores:
            out[a] = scores[:5]
    return out


def nice_title(node: dict) -> str:
    t = node.get("title") or ""
    if t and t not in ("README", "Readme", "Index"):
        return t
    return node["id"].split("/")[-1]


def render_block(
    md_id: str,
    backs: list[dict],
    related: list[tuple[str, float]],
    nodes_by_id: dict[str, dict],
) -> str:
    lines = [START, "", "---", "", "## 🔗 Zpětné odkazy", ""]
    if backs:
        lines.append("Na tento soubor odkazují:")
        lines.append("")
        for b in backs[:15]:
            src = b["source"]
            link = rel(md_id, src)
            node = nodes_by_id.get(src, {})
            title = node.get("title") or src
            count = b["count"]
            cnt_s = f" ({count}×)" if count > 1 else ""
            label = b.get("label")
            suffix = f" — {label}" if label else (f" — {title}" if title and title != src else "")
            lines.append(f"- [{src}]({link}){suffix}{cnt_s}")
    else:
        lines.append("*Žádné příchozí odkazy ve znalostním grafu.*")
    lines.append("")
    lines.append("## 🏷️ Související soubory (podle shody tagů)")
    lines.append("")
    if related:
        for rid, score in related:
            link = rel(md_id, rid)
            node = nodes_by_id.get(rid, {})
            title = nice_title(node) if node else rid
            lines.append(f"- [{rid}]({link}) — podobnost {score:.2f} · {title}")
    else:
        lines.append("*Žádné silně související soubory (shoda tagů pod prahem 0,3).*")
    lines.append("")
    lines.append("## 🌐 Pohled grafu")
    lines.append("")
    portal = rel(md_id, "index.html")
    sitemap = rel(md_id, "sitemap.html")
    search = rel(md_id, "search.html")
    focus = md_id.replace("/", "%2F")
    lines.append(f"[Otevřít v portálu]({portal}) · [Mapa stránek]({sitemap}) · [Hledat]({search}) · Focus ID: `{focus}`")
    lines.append("")
    lines.append("---")
    lines.append("*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*")
    lines.append(END)
    return "\n".join(lines)


def inject(md_path: Path, block: str) -> bool:
    """Inject/replace the backlinks block in a markdown file. Returns True if changed."""
    original = md_path.read_text(encoding="utf-8")
    if START in original and END in original:
        new = BACKLINK_RE.sub(block + "\n", original, count=1)
    else:
        trimmed = original.rstrip() + "\n\n"
        new = trimmed + block + "\n"
    if new != original:
        md_path.write_text(new, encoding="utf-8")
        return True
    return False


def main(dry_run: bool = False) -> int:
    graph = load_graph()
    nodes_by_id = {n["id"]: n for n in graph.get("nodes", [])}
    all_ids = list(nodes_by_id.keys())
    backlinks = collect_backlinks(graph)

    tag_map = load_manifest_tags()
    for nid, node in nodes_by_id.items():
        if not nid.endswith(".md"):
            continue
        tags = set(str(x).lower() for x in (node.get("tags") or []))
        fp = WORKSPACE / nid
        if fp.exists():
            tags |= fallback_tags(fp)
        if nid in tag_map:
            tags |= tag_map[nid]
        tag_map[nid] = tags

    related = compute_related(all_ids, tag_map)

    stats = {
        "processed": 0,
        "changed": 0,
        "with_backlinks": 0,
        "orphans": [],
        "backlink_counts": {},
        "related_popularity": defaultdict(int),
    }

    for md_id in sorted(nid for nid in all_ids if nid.endswith(".md")):
        fp = WORKSPACE / md_id
        if not fp.exists():
            continue
        if md_id == "BACKLINKS-AUDIT.md":
            continue
        stats["processed"] += 1
        backs = backlinks.get(md_id, [])
        rel_list = related.get(md_id, [])
        stats["backlink_counts"][md_id] = sum(b["count"] for b in backs)
        if backs:
            stats["with_backlinks"] += 1
        if not backs and not rel_list:
            stats["orphans"].append(md_id)
        for rid, _ in rel_list:
            stats["related_popularity"][rid] += 1

        block = render_block(md_id, backs, rel_list, nodes_by_id)
        if dry_run:
            continue
        if inject(fp, block):
            stats["changed"] += 1

    stats["related_popularity"] = dict(stats["related_popularity"])
    out_json = WORKSPACE / "_assets" / "backlinks-stats.json"
    out_json.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    print(f"[backlinks] processed={stats['processed']} changed={stats['changed']} "
          f"with_backlinks={stats['with_backlinks']} orphans={len(stats['orphans'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main(dry_run=("--dry-run" in sys.argv)))
