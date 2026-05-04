#!/usr/bin/env python3
"""inject-ux.py — inject UX enhancement scripts into every HTML file.

Idempotent: skips files that already contain the injection marker.
Adjusts relative path depth per file automatically.

Usage:
    python3 _assets/inject-ux.py [--dry-run] [workspace_root]
"""
import os
import sys
import re
from pathlib import Path

SCRIPTS = [
    "_assets/hover-previews.js",
    "_assets/keyboard-shortcuts.js",
    "_assets/state-sync.js",
    "_assets/connections.js",
]

MARKER = "<!-- mycelium-ux:injected -->"
META_MARKER = 'name="workspace-version"'
META_TAG = '<meta name="workspace-version" content="1.0.0">'


def relative_prefix(html_path: Path, workspace_root: Path) -> str:
    """Return ../ prefix required to reach workspace_root from html_path."""
    rel = html_path.parent.relative_to(workspace_root)
    depth = len(rel.parts)
    if depth == 0:
        return "./"
    return "../" * depth


def build_block(prefix: str) -> str:
    script_tags = "\n".join(f'  <script src="{prefix}{s}"></script>' for s in SCRIPTS)
    return f"{MARKER}\n{script_tags}\n"


def inject_head_meta(text: str) -> tuple[str, bool]:
    if META_MARKER in text:
        return text, False
    # Insert meta tag right after <head>.
    def repl(match):
        return match.group(0) + f"\n  {META_TAG}"
    new_text, n = re.subn(r"<head[^>]*>", repl, text, count=1, flags=re.IGNORECASE)
    return (new_text, n > 0)


def inject_scripts(text: str, prefix: str) -> tuple[str, bool]:
    if MARKER in text:
        return text, False
    block = build_block(prefix)
    # Insert before </body>, preserving indentation.
    pattern = re.compile(r"(\s*)</body>", re.IGNORECASE)
    m = pattern.search(text)
    if not m:
        # Append at end as fallback.
        return text + "\n" + block + "</body>\n", True
    indent = m.group(1) or ""
    replacement = f"\n{indent}{block}{indent}</body>"
    new_text = text[:m.start()] + replacement + text[m.end():]
    return new_text, True


def process_file(path: Path, workspace_root: Path, dry_run: bool) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as e:
        return f"ERROR_READ {path}: {e}"

    prefix = relative_prefix(path, workspace_root)
    new_text = text
    new_text, meta_added = inject_head_meta(new_text)
    new_text, scripts_added = inject_scripts(new_text, prefix)

    if not meta_added and not scripts_added:
        return "SKIP"

    if not dry_run:
        path.write_text(new_text, encoding="utf-8")

    bits = []
    if meta_added:
        bits.append("meta")
    if scripts_added:
        bits.append("scripts")
    return "INJECTED(" + "+".join(bits) + f") depth-prefix={prefix!r}"


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]
    workspace = Path(args[0]).resolve() if args else Path(__file__).resolve().parent.parent

    if not (workspace / "_assets").is_dir():
        print(f"ERROR: _assets/ not found under {workspace}", file=sys.stderr)
        sys.exit(2)

    html_files = sorted(workspace.rglob("*.html"))
    # Skip anything under raw/ (third-party captured HTML), backups, .clean variants.
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
