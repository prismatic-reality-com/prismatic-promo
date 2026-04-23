#!/usr/bin/env python3
"""
Fix root-relative links in content markdown files.

Problem: Links like [text](/apps/prismatic-web/) are rendered as root-relative
paths in the HTML output. On GitHub Pages with a subpath deployment
(e.g., /prismatic-promo/), these links break because they resolve to
the root domain instead of the subpath.

Solution: Convert them to Zola internal links: [text](@/apps/prismatic-web.md)
which Zola resolves to the correct full URL at build time.
"""

import re
import sys
from pathlib import Path
from collections import defaultdict


CONTENT_DIR = Path('/private/tmp/prismatic-promo/content')

# Sections that have content pages
SECTIONS = (
    'apps', 'agents', 'teams', 'commands', 'capabilities',
    'glossary', 'architecture', 'technologies', 'osint',
    'registry', 'faq'
)

# Pattern: markdown links using /section/path/ instead of @/section/path.md
SECTION_PATTERN = '|'.join(SECTIONS)
ROOT_REL_LINK = re.compile(
    r'\[([^\]]*)\]\((/(' + SECTION_PATTERN + r')(/[^)]*)?)\)'
)


def resolve_target(url):
    """Convert a root-relative URL to a Zola @/ path."""
    path = url.strip('/')
    if not path:
        return None

    # Check if it's a section index: /apps/ -> @/apps/_index.md
    parts = path.split('/')
    if len(parts) == 1:
        # Section root: /apps/ -> @/apps/_index.md
        candidate = CONTENT_DIR / parts[0] / '_index.md'
        if candidate.exists():
            return '@/' + parts[0] + '/_index.md'

    # Check for specific page: /apps/prismatic-web/ -> @/apps/prismatic-web.md
    md_candidate = CONTENT_DIR / (path + '.md')
    if md_candidate.exists():
        return '@/' + path + '.md'

    # Check for _index.md in subdirectory
    idx_candidate = CONTENT_DIR / path / '_index.md'
    if idx_candidate.exists():
        return '@/' + path + '/_index.md'

    return None


def fix_file(file_path, dry_run=False):
    """Fix root-relative links in a single file. Returns (fixed_count, errors)."""
    text = file_path.read_text(encoding='utf-8')
    fixed_count = 0
    errors = []

    def replacer(match):
        nonlocal fixed_count
        link_text = match.group(1)
        url = match.group(2)

        zola_path = resolve_target(url)
        if zola_path:
            fixed_count += 1
            return f'[{link_text}]({zola_path})'
        else:
            errors.append(f'Cannot resolve: {url}')
            return match.group(0)

    new_text = ROOT_REL_LINK.sub(replacer, text)

    if not dry_run and new_text != text:
        file_path.write_text(new_text, encoding='utf-8')

    return fixed_count, errors


def main():
    dry_run = '--dry-run' in sys.argv
    verbose = '--verbose' in sys.argv or '-v' in sys.argv

    if dry_run:
        print("DRY RUN - no files will be modified")
        print()

    total_fixed = 0
    total_errors = 0
    files_modified = 0
    all_errors = []

    md_files = sorted(CONTENT_DIR.rglob('*.md'))
    print(f"Scanning {len(md_files)} content files...")

    for md_file in md_files:
        fixed, errors = fix_file(md_file, dry_run=dry_run)
        if fixed > 0:
            files_modified += 1
            total_fixed += fixed
            rel = str(md_file.relative_to(CONTENT_DIR))
            if verbose:
                print(f"  Fixed {fixed} links in {rel}")
        if errors:
            total_errors += len(errors)
            rel = str(md_file.relative_to(CONTENT_DIR))
            for e in errors:
                all_errors.append(f"  {rel}: {e}")

    print()
    print("=" * 60)
    print("FIX REPORT")
    print("=" * 60)
    print(f"Files scanned:    {len(md_files)}")
    print(f"Files modified:   {files_modified}")
    print(f"Links fixed:      {total_fixed}")
    print(f"Errors:           {total_errors}")
    print("=" * 60)

    if all_errors:
        print("\nERRORS:")
        for e in all_errors:
            print(e)

    if dry_run:
        print("\nTo apply fixes, run without --dry-run")

    return 1 if total_errors > 0 else 0


if __name__ == '__main__':
    sys.exit(main())
