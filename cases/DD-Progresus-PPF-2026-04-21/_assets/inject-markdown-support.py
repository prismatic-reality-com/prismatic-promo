#!/usr/bin/env python3
"""inject-markdown-support.py — inject markdown-rendering assets into every HTML file.

Adds to <head>:
    - markdown plugin scripts (markdown-it + plugins)
    - _assets/md-embed.js (reusable renderer)
    - _assets/inline-md-autoload.js (page-level enhancer + drawer)

Optional (only if present in _assets/): markdown/custom.css, highlight.min.js,
dompurify.min.js. The injector references them only if they exist on disk, so
unavailable dependencies never break the page.

Idempotent: relies on a sentinel marker.
Respects relative path depth per file (matches inject-ux.py behaviour).
Skips .clean variants and raw/ captured HTML.

Usage:
    python3 _assets/inject-markdown-support.py [--dry-run] [workspace_root]
"""
import re
import sys
from pathlib import Path

MARKER = "<!-- mycelium-markdown:injected -->"

# Scripts always shipped by Track A; injected unconditionally.
MARKDOWN_PLUGIN_SCRIPTS = [
    "_assets/markdown/markdown-it.min.js",
    "_assets/markdown/markdownItAnchor.umd.js",
    "_assets/markdown/markdown-it-task-lists.js",
    "_assets/markdown/markdown-it-footnote.min.js",
    "_assets/markdown/markdown-it-mark.min.js",
    "_assets/markdown/markdown-it-attrs.browser.js",
    "_assets/markdown/markdown-it-deflist.min.js",
    "_assets/markdown/markdown-it-emoji.min.js",
]

# Always-injected core.
CORE_SCRIPTS = [
    "_assets/md-embed.js",
    "_assets/inline-md-autoload.js",
]

# Conditional scripts (injected only if file exists on disk).
OPTIONAL_SCRIPTS = [
    "_assets/highlight.min.js",
    "_assets/dompurify.min.js",
]

# Conditional stylesheets (injected only if file exists).
OPTIONAL_STYLES = [
    "_assets/markdown/custom.css",
]


def relative_prefix(html_path: Path, workspace_root: Path) -> str:
    rel = html_path.parent.relative_to(workspace_root)
    depth = len(rel.parts)
    if depth == 0:
        return "./"
    return "../" * depth


def build_head_block(prefix: str, workspace_root: Path) -> str:
    lines = [MARKER]

    for css in OPTIONAL_STYLES:
        if (workspace_root / css).exists():
            lines.append(f'  <link rel="stylesheet" href="{prefix}{css}">')

    for s in MARKDOWN_PLUGIN_SCRIPTS:
        # Always inject — if Track A hasn't shipped a plugin, md-embed gracefully degrades.
        lines.append(f'  <script defer src="{prefix}{s}"></script>')

    for s in OPTIONAL_SCRIPTS:
        if (workspace_root / s).exists():
            lines.append(f'  <script defer src="{prefix}{s}"></script>')

    for s in CORE_SCRIPTS:
        lines.append(f'  <script defer src="{prefix}{s}"></script>')

    return "\n".join(lines) + "\n"


def inject_before_head_close(text: str, block: str) -> tuple[str, bool]:
    if MARKER in text:
        return text, False
    pattern = re.compile(r"(\s*)</head>", re.IGNORECASE)
    m = pattern.search(text)
    if not m:
        return text, False
    indent = m.group(1) or "\n"
    replacement = f"\n{block}{indent}</head>"
    new_text = text[:m.start()] + replacement + text[m.end():]
    return new_text, True


def process_file(path: Path, workspace_root: Path, dry_run: bool) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as e:
        return f"ERROR_READ {path}: {e}"

    prefix = relative_prefix(path, workspace_root)
    block = build_head_block(prefix, workspace_root)
    new_text, changed = inject_before_head_close(text, block)

    if not changed:
        return "SKIP"

    if not dry_run:
        path.write_text(new_text, encoding="utf-8")

    return f"INJECTED depth-prefix={prefix!r}"


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]
    workspace = Path(args[0]).resolve() if args else Path(__file__).resolve().parent.parent

    if not (workspace / "_assets").is_dir():
        print(f"ERROR: _assets/ not found under {workspace}", file=sys.stderr)
        sys.exit(2)

    html_files = sorted(workspace.rglob("*.html"))

    def keep(p: Path) -> bool:
        parts = p.relative_to(workspace).parts
        if any(part == "raw" for part in parts):
            return False
        if p.name.endswith(".clean"):
            return False
        return True

    html_files = [p for p in html_files if keep(p)]

    counts = {"INJECTED": 0, "SKIP": 0, "ERROR": 0}
    for p in html_files:
        rel = p.relative_to(workspace)
        result = process_file(p, workspace, dry_run)
        if result.startswith("INJECTED"):
            counts["INJECTED"] += 1
            print(f"  [{result}] {rel}")
        elif result == "SKIP":
            counts["SKIP"] += 1
        else:
            counts["ERROR"] += 1
            print(f"  [{result}] {rel}")

    action = "WOULD INJECT" if dry_run else "INJECTED"
    print(f"\n{action}: {counts['INJECTED']} · SKIP: {counts['SKIP']} · ERROR: {counts['ERROR']}")
    print(f"Total HTML files scanned: {len(html_files)}")


if __name__ == "__main__":
    main()
