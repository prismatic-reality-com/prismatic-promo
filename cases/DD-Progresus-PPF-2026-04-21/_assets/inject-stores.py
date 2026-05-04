#!/usr/bin/env python3
"""
inject-stores.py — Inject offline store <script> tags into every HTML file.

Why: reader.html, md-index.html, search.html, hover-previews, knowledge-graph,
and friends all prefer the window.DD_MD_STORE / window.DD_MANIFEST / window.DD_GRAPH
globals over fetch(), but those globals only exist if the corresponding .js
has been loaded. Over file:// we must inject the store scripts into every page
because fetch() does not work.

What we inject (just before `</head>`):
  <!-- BEGIN:DD_OFFLINE_STORE -->
  <script src="<rel>_assets/md-store.js"></script>
  <script src="<rel>_assets/manifest-store.js"></script>
  <script src="<rel>_assets/graph-store.js"></script>
  <!-- END:DD_OFFLINE_STORE -->

Relative path is computed automatically from each HTML file's location.
The sentinel comments make the injection idempotent — we skip files that
already contain the BEGIN marker (and refresh if asked).

Usage:
  python3 _assets/inject-stores.py            # inject/update in place
  python3 _assets/inject-stores.py --check    # report what would change, exit non-zero if dirty
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EXCLUDE_DIRS = {"raw", "rendered", "node_modules", ".git"}

BEGIN_MARK = "<!-- BEGIN:DD_OFFLINE_STORE -->"
END_MARK = "<!-- END:DD_OFFLINE_STORE -->"

BLOCK_RE = re.compile(
    re.escape(BEGIN_MARK) + r".*?" + re.escape(END_MARK),
    re.DOTALL,
)

HEAD_CLOSE_RE = re.compile(r"</head\s*>", re.IGNORECASE)


def discover_html_files() -> list[Path]:
    out: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if not fn.lower().endswith(".html"):
                continue
            if fn.endswith(".clean"):
                continue
            out.append(Path(dirpath) / fn)
    out.sort()
    return out


def rel_to_root(path: Path) -> str:
    """Relative prefix from the HTML file's dir back to workspace root."""
    depth = len(path.relative_to(ROOT).parts) - 1  # subtract filename
    if depth <= 0:
        return ""
    return "../" * depth


def build_block(path: Path) -> str:
    rel = rel_to_root(path)
    return (
        BEGIN_MARK + "\n"
        f'  <script src="{rel}_assets/md-store.js"></script>\n'
        f'  <script src="{rel}_assets/manifest-store.js"></script>\n'
        f'  <script src="{rel}_assets/graph-store.js"></script>\n'
        "  " + END_MARK
    )


def inject_into(html: str, block: str) -> tuple[str, str]:
    """
    Insert or refresh the offline-store block.

    Returns (new_html, status) where status is 'insert' / 'update' / 'skip' / 'no-head'.
    """
    if BLOCK_RE.search(html):
        new = BLOCK_RE.sub(block, html, count=1)
        return (new, "update" if new != html else "skip")

    m = HEAD_CLOSE_RE.search(html)
    if not m:
        return (html, "no-head")

    # Insert just before </head>, preserving indentation of the </head> line.
    line_start = html.rfind("\n", 0, m.start()) + 1
    indent = html[line_start:m.start()]
    if indent.strip():
        indent = ""
    inserted = indent + block + "\n" + indent
    new = html[: m.start()] + inserted + html[m.start() :]
    return (new, "insert")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="Report only; exit 1 if any file would change")
    args = ap.parse_args()

    files = discover_html_files()
    print(f"[inject-stores] scanning {len(files)} HTML files")

    dirty = False
    counts = {"insert": 0, "update": 0, "skip": 0, "no-head": 0}
    for p in files:
        try:
            original = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            original = p.read_text(encoding="utf-8", errors="replace")
        block = build_block(p)
        new, status = inject_into(original, block)
        counts[status] = counts.get(status, 0) + 1
        rel = p.relative_to(ROOT)
        if status in {"insert", "update"}:
            dirty = True
            if args.check:
                print(f"  [{status}] {rel}")
            else:
                p.write_text(new, encoding="utf-8")
                print(f"  [{status}] {rel}")
        elif status == "no-head":
            print(f"  [no-head] {rel}  (no </head> tag — skipped)")

    print(f"[inject-stores] summary: {counts}")
    if args.check:
        return 1 if dirty else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
