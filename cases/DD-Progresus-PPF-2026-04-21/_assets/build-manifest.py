#!/usr/bin/env python3
"""Build .manifest.json for the DD workspace search page.

Walks *.md + *.html under the workspace (excluding _assets/ and hidden dirs),
extracts title / excerpt / tags / dir / severity heuristic, emits valid JSON.
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

WS = Path(__file__).resolve().parent.parent
OUT = WS / ".manifest.json"

MD_H1_RE = re.compile(r"^# +(.+?)\s*$", re.MULTILINE)
MD_H2_H3_RE = re.compile(r"^#{2,3} +(.+?)\s*$", re.MULTILINE)
HTML_TITLE_RE = re.compile(r"<title>([^<]+)</title>", re.IGNORECASE)
HTML_H1_RE = re.compile(r"<h1[^>]*>([^<]+)</h1>", re.IGNORECASE)
HTML_H2_H3_RE = re.compile(r"<h[23][^>]*>([^<]+)</h[23]>", re.IGNORECASE)

SEV_PATTERNS = [
    ("resolved", re.compile(r"resolved|downgraded|\bclosed\b", re.IGNORECASE)),
    ("critical", re.compile(r"CRITICAL|🔴|blocker", re.IGNORECASE)),
    ("high", re.compile(r"\bHIGH\b|🟠|red[- ]flag", re.IGNORECASE)),
    ("medium", re.compile(r"\bMEDIUM\b|🟡", re.IGNORECASE)),
]


def classify_severity(text: str) -> str:
    for label, pattern in SEV_PATTERNS:
        if pattern.search(text):
            return label
    return "none"


def extract_md(raw: str) -> tuple[str, str, list[str]]:
    title_m = MD_H1_RE.search(raw)
    title = title_m.group(1).strip() if title_m else ""

    # Excerpt: strip headings, blockquotes, links, inline md, truncate.
    lines = []
    for line in raw.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("#"):
            continue
        if s.startswith(">"):
            continue
        if s.startswith("---"):
            continue
        if s.startswith("|"):
            continue
        if s.startswith("```"):
            continue
        if re.match(r"^\[[^\]]+\]\([^)]+\)$", s):
            continue
        lines.append(s)
        if len(lines) >= 4:
            break
    excerpt = " ".join(lines)
    # Strip markdown link syntax
    excerpt = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", excerpt)
    excerpt = re.sub(r"[`*_]", "", excerpt)
    excerpt = re.sub(r"\s+", " ", excerpt)
    excerpt = excerpt[:220]

    tags = [m.strip() for m in MD_H2_H3_RE.findall(raw)][:20]
    tags = [re.sub(r"[`*_]", "", t) for t in tags]
    return title, excerpt, tags


def extract_html(raw: str) -> tuple[str, str, list[str]]:
    title_m = HTML_TITLE_RE.search(raw)
    title = title_m.group(1).strip() if title_m else ""
    if not title:
        h1 = HTML_H1_RE.search(raw)
        title = h1.group(1).strip() if h1 else ""

    # Strip tags + entities for excerpt.
    text = re.sub(r"<[^>]+>", " ", raw)
    text = re.sub(r"&[a-zA-Z]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    excerpt = text[:220]

    tags = [m.strip() for m in HTML_H2_H3_RE.findall(raw)][:20]
    return title, excerpt, tags


def build():
    entries = []
    for path in sorted(WS.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix not in {".md", ".html"}:
            continue
        rel_parts = path.relative_to(WS).parts
        # Skip hidden dirs/files
        if any(p.startswith(".") for p in rel_parts):
            continue
        # Skip _assets/ except its README (documentation).
        if rel_parts[0] == "_assets" and path.name != "README.md":
            continue

        try:
            raw = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue

        if path.suffix == ".md":
            title, excerpt, tags = extract_md(raw)
            typ = "markdown"
        else:
            title, excerpt, tags = extract_html(raw)
            typ = "html"

        if not title:
            title = path.name

        directory = rel_parts[0] if len(rel_parts) > 1 else "root"

        sev_source = f"{title} {excerpt} {path.name}"
        severity = classify_severity(sev_source)

        try:
            mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
            mtime_str = mtime.strftime("%Y-%m-%dT%H:%M:%SZ")
        except OSError:
            mtime_str = ""

        entries.append({
            "path": str(path.relative_to(WS)),
            "title": title,
            "excerpt": excerpt,
            "tags": tags,
            "dir": directory,
            "type": typ,
            "severity": severity,
            "mtime": mtime_str,
        })

    manifest = {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "workspace": "DD-Progresus-PPF-2026-04-21",
        "files": entries,
    }

    OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    size = OUT.stat().st_size
    print(f"Wrote {OUT}")
    print(f"Size: {size:,} bytes")
    print(f"Files indexed: {len(entries)}")

    # Breakdown
    by_dir = {}
    by_sev = {}
    for e in entries:
        by_dir[e["dir"]] = by_dir.get(e["dir"], 0) + 1
        by_sev[e["severity"]] = by_sev.get(e["severity"], 0) + 1
    print(f"By dir: {by_dir}")
    print(f"By severity: {by_sev}")


if __name__ == "__main__":
    build()
