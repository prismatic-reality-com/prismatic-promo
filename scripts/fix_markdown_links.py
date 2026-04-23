#!/usr/bin/env python3
"""
fix_markdown_links.py — rewrite bare `](/path/)` markdown links.

Zola only auto-prefixes `base_url` for links using its internal `@/...`
syntax. Bare markdown links like `[X](/blog/foo/)` are treated as
absolute paths and emitted unchanged, which 404s on a subpath deploy
(github.io/blog/foo/ instead of github.io/prismatic-promo/blog/foo/).

This script rewrites bare internal links to Zola internal-link syntax
when a matching content file exists. Links that don't resolve are left
alone (logged as warnings for manual review).

Targets every `.md` file under `content/`. Dry-run by default; pass
`--apply` to write back.

Strategy per match:
  1. Parse `](/path)` — extract `path` without leading/trailing slash.
  2. If `content/<path>.md` exists → rewrite to `](@/<path>.md)`.
  3. Else if `content/<path>/_index.md` or `content/<path>/index.md`
     exists → rewrite to `](@/<path>/_index.md)`.
  4. Else — leave as-is and log a WARN (dead link — needs manual fix).
"""
from __future__ import annotations

import argparse
import pathlib
import re
import sys
from typing import Tuple, List

CONTENT_ROOT = pathlib.Path(__file__).resolve().parent.parent / "content"
LINK_PATTERN = re.compile(r"\]\((/[a-zA-Z][^)\s]*)\)")


def resolve_target(path: str) -> str | None:
    """Return the Zola-internal-link form for `path`, or None if no
    content file maps to it."""
    # Strip leading slash + optional trailing slash
    clean = path.strip("/")
    if not clean:
        return None

    # Try content/<clean>.md first (direct page like /blog/foo → blog/foo.md)
    direct = CONTENT_ROOT / f"{clean}.md"
    if direct.exists():
        return f"@/{clean}.md"

    # Try content/<clean>/_index.md (section index like /blog/ → blog/_index.md)
    index = CONTENT_ROOT / clean / "_index.md"
    if index.exists():
        return f"@/{clean}/_index.md"

    # Try content/<clean>/index.md (some systems use index.md)
    plain_index = CONTENT_ROOT / clean / "index.md"
    if plain_index.exists():
        return f"@/{clean}/index.md"

    return None


def rewrite_file(path: pathlib.Path) -> Tuple[str, int, List[str]]:
    """Returns (new_content, rewrites_applied, warnings)."""
    text = path.read_text(encoding="utf-8")
    warnings: List[str] = []
    rewrites = 0

    def replace(match: re.Match) -> str:
        nonlocal rewrites
        raw_path = match.group(1)
        # Skip anchor-only, query strings — rewrite the path portion only
        base = raw_path.split("#")[0].split("?")[0]
        target = resolve_target(base)
        if target:
            rewrites += 1
            # Preserve any fragment / query
            suffix = raw_path[len(base):]
            return f"]({target}{suffix})"
        # No content file found — this is a dead link or an asset path
        # (/images/, /js/, /css/). Leave images/JS/CSS alone; warn about
        # others.
        if not base.startswith(("/images/", "/js/", "/css/", "/static/",
                                 "/atom.xml", "/rss.xml", "/sitemap.xml")):
            warnings.append(f"{path.relative_to(CONTENT_ROOT)}: unresolved {raw_path}")
        return match.group(0)

    new_text = LINK_PATTERN.sub(replace, text)
    return new_text, rewrites, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write changes to disk.")
    parser.add_argument("--section", default=None,
                        help="Limit rewriting to a single section (e.g. blog).")
    args = parser.parse_args()

    root = CONTENT_ROOT / args.section if args.section else CONTENT_ROOT
    if not root.exists():
        print(f"ERROR: {root} does not exist", file=sys.stderr)
        return 1

    total_rewrites = 0
    all_warnings: List[str] = []
    changed: List[Tuple[pathlib.Path, str]] = []

    for md in sorted(root.rglob("*.md")):
        new_text, rewrites, warnings = rewrite_file(md)
        total_rewrites += rewrites
        all_warnings.extend(warnings)
        if new_text != md.read_text(encoding="utf-8"):
            changed.append((md, new_text))

    print(f"Files scanned: {sum(1 for _ in root.rglob('*.md'))}")
    print(f"Files to modify: {len(changed)}")
    print(f"Total rewrites: {total_rewrites}")
    print(f"Unresolved (dead) links: {len(all_warnings)}")

    if all_warnings:
        print("\nFirst 20 unresolved:")
        for w in all_warnings[:20]:
            print(f"  {w}")

    if args.apply and changed:
        for path, content in changed:
            path.write_text(content, encoding="utf-8")
        print(f"\n✅ Applied {len(changed)} files.")
    elif changed and not args.apply:
        print("\n(Dry run — re-run with --apply to write.)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
