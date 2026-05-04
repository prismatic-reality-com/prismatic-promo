#!/usr/bin/env python3
"""
Rewire markdown links in HTML and README files to route through reader.html.

Idempotent: skips links already containing reader.html.
Handles both HTML files (href="...") and markdown files ([text](...)).

Usage:
  python3 rewire-md-links.py                   # Rewire all known files
  python3 rewire-md-links.py --dry-run         # Preview changes
  python3 rewire-md-links.py --file path       # Rewire a single file
  python3 rewire-md-links.py --readmes         # Rewire only README.md files
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path
from typing import Iterable

WORKSPACE = Path(__file__).resolve().parent.parent

# Directories whose README.md we rewire (dashboard directories)
DASHBOARD_DIRS = [
    "01-intel",
    "02-entity",
    "03-financial",
    "04-legal",
    "05-osint",
    "06-reports",
    "07-sources",
    "08-comms-templates",
]

# HTML href="X.md" or href="./X.md" or href="./sub/X.md"
# Captures the path part and preserves quote/fragment/query.
HTML_HREF_RE = re.compile(
    r'''href=(?P<q>["'])(?P<path>(?:\./|\.\./|/|)(?![^"']*reader\.html)[^"'#?]+?\.md)(?P<frag>[#?][^"']*)?(?P=q)'''
)

# Markdown [text](path.md) or [text](./path.md) or [text](../path.md) — NOT absolute URLs
MD_LINK_RE = re.compile(
    r'\[(?P<text>[^\]]+?)\]\((?P<path>(?!https?://)(?!reader\.html)(?:\./|\.\./|/|)[^)\s]+?\.md)(?P<frag>[#?][^)]*)?\)'
)


def resolve_md_for_reader(readme_path: Path, link_path: str) -> str | None:
    """Given a README.md location and a relative .md link, resolve the path
    so that reader.html (at workspace root) can load it via ?file=<path>.

    Returns the workspace-relative path suitable for reader.html?file=<path>,
    or None if the target escapes the workspace.
    """
    readme_dir = readme_path.parent
    # strip leading ./
    cleaned = link_path.lstrip("./") if link_path.startswith("./") else link_path
    target = (readme_dir / link_path).resolve()
    try:
        rel = target.relative_to(WORKSPACE)
    except ValueError:
        return None
    return str(rel).replace(os.sep, "/")


def rewire_readme(readme_path: Path, dry_run: bool = False) -> int:
    """Rewire md links in a directory README to point to reader.html at
    workspace root. Returns number of replacements."""
    text = readme_path.read_text(encoding="utf-8")
    replacements = 0

    def _md_sub(m: re.Match) -> str:
        nonlocal replacements
        path = m.group("path")
        frag = m.group("frag") or ""
        # Skip if already routes through reader.html
        if "reader.html" in path:
            return m.group(0)
        resolved = resolve_md_for_reader(readme_path, path)
        if resolved is None:
            return m.group(0)
        # All READMEs in dashboard dirs are one level deep → reader.html is ../
        rel_to_reader = "../reader.html"
        replacements += 1
        return f'[{m.group("text")}]({rel_to_reader}?file={resolved}{frag})'

    new_text = MD_LINK_RE.sub(_md_sub, text)

    if replacements > 0 and not dry_run:
        readme_path.write_text(new_text, encoding="utf-8")
    return replacements


def rewire_html(html_path: Path, dry_run: bool = False, reader_prefix: str = "./reader.html") -> int:
    """Rewire href="...md" to route through reader.html. Returns count."""
    text = html_path.read_text(encoding="utf-8")
    replacements = 0

    def _href_sub(m: re.Match) -> str:
        nonlocal replacements
        q = m.group("q")
        path = m.group("path")
        frag = m.group("frag") or ""
        if "reader.html" in path:
            return m.group(0)
        # Normalize path — strip leading ./ for ?file= value
        file_value = path
        if file_value.startswith("./"):
            file_value = file_value[2:]
        replacements += 1
        return f'href={q}{reader_prefix}?file={file_value}{frag}{q}'

    new_text = HTML_HREF_RE.sub(_href_sub, text)

    if replacements > 0 and not dry_run:
        html_path.write_text(new_text, encoding="utf-8")
    return replacements


def rewire_root_md(md_path: Path, dry_run: bool = False) -> int:
    """Rewire md links inside a root-level markdown file to reader.html. Root
    markdown is rendered by reader.html itself; inline-md-autoload.js will
    intercept inline links, but for any top-level nav references we still
    rewrite to be safe."""
    text = md_path.read_text(encoding="utf-8")
    replacements = 0

    def _md_sub(m: re.Match) -> str:
        nonlocal replacements
        path = m.group("path")
        frag = m.group("frag") or ""
        if "reader.html" in path:
            return m.group(0)
        # path is relative to md_path
        resolved = resolve_md_for_reader(md_path, path)
        if resolved is None:
            return m.group(0)
        replacements += 1
        return f'[{m.group("text")}](./reader.html?file={resolved}{frag})'

    new_text = MD_LINK_RE.sub(_md_sub, text)

    if replacements > 0 and not dry_run:
        md_path.write_text(new_text, encoding="utf-8")
    return replacements


def iter_dashboard_readmes() -> Iterable[Path]:
    for d in DASHBOARD_DIRS:
        p = WORKSPACE / d / "README.md"
        if p.exists():
            yield p


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--file", help="Rewire a single file")
    ap.add_argument("--readmes", action="store_true", help="Only rewire dashboard READMEs")
    ap.add_argument("--root-md", action="store_true", help="Rewire root-level .md files")
    args = ap.parse_args()

    total = 0
    files_changed = 0

    if args.file:
        p = Path(args.file).resolve()
        if p.suffix == ".md":
            if p.parent == WORKSPACE:
                n = rewire_root_md(p, args.dry_run)
            else:
                n = rewire_readme(p, args.dry_run)
        else:
            n = rewire_html(p, args.dry_run)
        print(f"{p.relative_to(WORKSPACE)}: {n} replacements")
        return 0

    # Default: dashboard READMEs
    if args.readmes or (not args.root_md):
        for readme in iter_dashboard_readmes():
            n = rewire_readme(readme, args.dry_run)
            if n > 0:
                files_changed += 1
                total += n
                print(f"{readme.relative_to(WORKSPACE)}: {n} links rewired")

    if args.root_md:
        for md in WORKSPACE.glob("*.md"):
            n = rewire_root_md(md, args.dry_run)
            if n > 0:
                files_changed += 1
                total += n
                print(f"{md.relative_to(WORKSPACE)}: {n} links rewired")

    print(f"\nTotal: {total} links rewired across {files_changed} file(s){' (dry-run)' if args.dry_run else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
