#!/usr/bin/env python3
"""
Comprehensive Link Regression Test Suite for Prismatic Platform Site.

Tests ALL internal links across three phases:
  Phase 1: Content file @/ links (Zola internal links)
  Phase 2: Built HTML internal links (base_url-prefixed)
  Phase 3: REGRESSION GUARDS - detects anti-patterns that cause broken links

Regression patterns detected:
  R1: Root-relative links (/section/slug/) in content markdown
      These MUST use @/section/slug.md format for Zola to resolve correctly
  R2: Literal @/ strings in built HTML (unprocessed Zola links)
      These indicate @/ links inside code blocks that render as literal text
  R3: Missing base_url prefix in built HTML links
      Internal links must include the base_url for subpath deployments

Exit code 1 on ANY failure. Designed for CI/pre-commit integration.
"""

import os
import re
import json
import sys
from pathlib import Path
from collections import defaultdict


# Valid sections in the site
SECTIONS = (
    'apps', 'agents', 'teams', 'commands', 'capabilities',
    'glossary', 'architecture', 'technologies', 'osint',
    'registry', 'faq'
)

SECTION_PATTERN = '|'.join(SECTIONS)


class LocalLinkTester:
    def __init__(self, content_dir, public_dir, base_url="https://prismatic-reality.com"):
        self.content_dir = Path(content_dir)
        self.public_dir = Path(public_dir)
        self.base_url = base_url
        self.results = {
            'total_links': 0,
            'success': 0,
            'errors': 0,
            'skipped': 0,
            'error_details': [],
            'warnings': [],
            'regressions': []
        }

    def extract_links(self, file_path):
        """Extract markdown links from a file, excluding code blocks."""
        links = []
        try:
            content = file_path.read_text(encoding='utf-8')
        except Exception:
            return links

        # Remove code blocks to avoid false positives
        # Remove fenced code blocks (```...```)
        content_no_code = re.sub(r'```[\s\S]*?```', '', content)
        # Remove inline code (`...`)
        content_no_code = re.sub(r'`[^`]+`', '', content_no_code)

        # Markdown links: [text](url)
        for match in re.finditer(r'\[([^\]]*)\]\(([^)]+)\)', content_no_code):
            text, url = match.group(1), match.group(2)
            # Calculate line number from original content
            line = content[:content.find(match.group(0))].count('\n') + 1 if match.group(0) in content else 0
            links.append({
                'text': text,
                'url': url,
                'file': str(file_path),
                'line': line
            })

        return links

    def resolve_zola_link(self, url):
        """Resolve a Zola @/ internal link to a local path."""
        if url.startswith('@/'):
            relative = url[2:]
            content_path = self.content_dir / relative
            return content_path
        return None

    def resolve_absolute_link(self, url):
        """Resolve an absolute path link to a built file."""
        if url.startswith('/'):
            path = url.strip('/')
            if not path:
                return self.public_dir / 'index.html'

            full = self.public_dir / path
            if full.is_file():
                return full

            idx = self.public_dir / path / 'index.html'
            if idx.is_file():
                return idx

            html = self.public_dir / (path + '.html')
            if html.is_file():
                return html

            return None
        return None

    def test_link(self, link):
        """Test a single link and return result."""
        url = link['url']

        # Skip external links, fragments, and special protocols
        if url.startswith(('http://', 'https://', 'mailto:', 'tel:', '#')):
            return 'skip', 'external or fragment'

        # Skip template variables
        if '{{' in url or '{%' in url:
            return 'skip', 'template variable'

        # Test Zola internal links (@/)
        if url.startswith('@/'):
            resolved = self.resolve_zola_link(url)
            if resolved and resolved.exists():
                return 'ok', str(resolved)
            else:
                return 'error', f'Content file not found: {resolved}'

        # Test absolute path links
        if url.startswith('/'):
            resolved = self.resolve_absolute_link(url)
            if resolved:
                return 'ok', str(resolved)
            else:
                return 'error', f'Built page not found for: {url}'

        # Relative links
        return 'skip', 'relative link'

    def scan_content(self):
        """Phase 1: Scan all content files and test links."""
        md_files = list(self.content_dir.rglob('*.md'))
        print(f"Scanning {len(md_files)} content files...")

        for md_file in sorted(md_files):
            links = self.extract_links(md_file)
            for link in links:
                self.results['total_links'] += 1
                status, detail = self.test_link(link)

                if status == 'ok':
                    self.results['success'] += 1
                elif status == 'error':
                    self.results['errors'] += 1
                    self.results['error_details'].append({
                        'url': link['url'],
                        'file': link['file'],
                        'line': link['line'],
                        'text': link['text'],
                        'reason': detail
                    })
                elif status == 'skip':
                    self.results['skipped'] += 1

    def scan_built_html(self):
        """Phase 2: Verify built HTML files have no broken internal links."""
        html_files = list(self.public_dir.rglob('*.html'))
        print(f"Scanning {len(html_files)} built HTML files...")

        for html_file in sorted(html_files):
            try:
                content = html_file.read_text(encoding='utf-8')
            except Exception:
                continue

            # Check href attributes for absolute internal links
            for match in re.finditer(r'href="(/[^"]*)"', content):
                url = match.group(1)
                if url.startswith(('/css/', '/js/', '/images/', '/data/', '/favicon')):
                    continue

                self.results['total_links'] += 1
                resolved = self.resolve_absolute_link(url)
                if resolved:
                    self.results['success'] += 1
                else:
                    self.results['errors'] += 1
                    rel_path = str(html_file.relative_to(self.public_dir))
                    self.results['error_details'].append({
                        'url': url,
                        'file': f'public/{rel_path}',
                        'line': 0,
                        'text': '',
                        'reason': f'Built page not found for: {url}'
                    })

    def regression_check_root_relative_in_content(self):
        """R1: Detect root-relative links in content that should use @/ syntax.

        Links like [text](/apps/prismatic-web/) in markdown content will be
        rendered as root-relative paths in HTML, breaking on subpath deployments
        (e.g., GitHub Pages with /prismatic-promo/ prefix).

        These MUST use Zola's @/section/slug.md syntax instead.
        """
        pattern = re.compile(
            r'\[([^\]]*)\]\((/(' + SECTION_PATTERN + r')(/[^)]*)?)\)'
        )
        count = 0

        for md_file in sorted(self.content_dir.rglob('*.md')):
            text = md_file.read_text(encoding='utf-8')

            # Remove code blocks
            text_no_code = re.sub(r'```[\s\S]*?```', '', text)
            text_no_code = re.sub(r'`[^`]+`', '', text_no_code)

            for m in pattern.finditer(text_no_code):
                url = m.group(2)
                link_text = m.group(1)
                count += 1
                rel = str(md_file.relative_to(self.content_dir))
                self.results['regressions'].append({
                    'type': 'R1',
                    'description': 'Root-relative link in content (must use @/ syntax)',
                    'url': url,
                    'text': link_text,
                    'file': rel,
                    'fix': f'Change [{link_text}]({url}) to [{link_text}](@/{url.strip("/")}.md)'
                })

        return count

    def regression_check_literal_at_in_html(self):
        """R2: Detect literal @/ strings in built HTML output.

        If @/ appears in the HTML output, it means a Zola internal link was
        placed inside a code block or other non-processed context. These show
        as literal text to users rather than clickable links.
        """
        count = 0
        for html_file in sorted(self.public_dir.rglob('*.html')):
            content = html_file.read_text(encoding='utf-8')
            occurrences = len(re.findall(r'@/', content))
            if occurrences > 0:
                rel = str(html_file.relative_to(self.public_dir))
                count += occurrences
                self.results['regressions'].append({
                    'type': 'R2',
                    'description': 'Literal @/ in built HTML (unprocessed Zola link)',
                    'url': '@/...',
                    'text': '',
                    'file': f'public/{rel}',
                    'fix': 'Move @/ link outside code blocks or convert to plain text'
                })

        return count

    def regression_check_missing_base_url(self):
        """R3: Detect internal links in built HTML that lack base_url prefix.

        On subpath deployments (e.g., GitHub Pages with /prismatic-promo/),
        all internal links must include the base_url prefix. Links like
        href="/apps/..." will resolve to the wrong path.
        """
        pattern = re.compile(
            r'href="(/(' + SECTION_PATTERN + r')/[^"]*)"'
        )
        count = 0
        for html_file in sorted(self.public_dir.rglob('*.html')):
            content = html_file.read_text(encoding='utf-8')
            for m in pattern.finditer(content):
                url = m.group(1)
                count += 1
                rel = str(html_file.relative_to(self.public_dir))
                self.results['regressions'].append({
                    'type': 'R3',
                    'description': 'Missing base_url prefix in built HTML link',
                    'url': url,
                    'text': '',
                    'file': f'public/{rel}',
                    'fix': f'Source content must use @/ link syntax for Zola to add base_url'
                })

        return count

    def run_regression_checks(self):
        """Phase 3: Run all regression guards."""
        r1 = self.regression_check_root_relative_in_content()
        r2 = self.regression_check_literal_at_in_html()
        r3 = self.regression_check_missing_base_url()
        return r1 + r2 + r3

    def report(self):
        """Generate and print report."""
        total = self.results['total_links']
        success = self.results['success']
        errors = self.results['errors']
        skipped = self.results['skipped']
        tested = success + errors
        regressions = self.results['regressions']

        print("\n" + "=" * 60)
        print("LINK REGRESSION TEST REPORT")
        print("=" * 60)
        print(f"Total links found:    {total}")
        print(f"Tested (internal):    {tested}")
        print(f"Skipped (external):   {skipped}")
        print(f"Successful:           {success}")
        print(f"Errors:               {errors}")

        if tested > 0:
            success_rate = (success / tested) * 100
            print(f"Success rate:         {success_rate:.1f}%")

        print(f"\nRegression patterns:  {len(regressions)}")

        # Count by type
        by_type = defaultdict(int)
        for r in regressions:
            by_type[r['type']] += 1
        for rtype in sorted(by_type.keys()):
            desc = {
                'R1': 'Root-relative links in content',
                'R2': 'Literal @/ in built HTML',
                'R3': 'Missing base_url in built HTML'
            }.get(rtype, rtype)
            print(f"  {rtype}: {by_type[rtype]} ({desc})")

        print("=" * 60)

        if errors > 0:
            print(f"\nBROKEN LINKS ({errors}):")
            print("-" * 60)

            by_url = defaultdict(list)
            for err in self.results['error_details']:
                by_url[err['url']].append(err)

            for url, occurrences in sorted(by_url.items()):
                print(f"\n  URL: {url}")
                print(f"  Reason: {occurrences[0]['reason']}")
                print(f"  Referenced from ({len(occurrences)} files):")
                for occ in occurrences[:5]:
                    print(f"    - {occ['file']}:{occ['line']}")
                if len(occurrences) > 5:
                    print(f"    ... and {len(occurrences) - 5} more")

        if regressions:
            print(f"\nREGRESSION PATTERNS ({len(regressions)}):")
            print("-" * 60)

            by_type_detail = defaultdict(list)
            for r in regressions:
                by_type_detail[r['type']].append(r)

            for rtype in sorted(by_type_detail.keys()):
                items = by_type_detail[rtype]
                print(f"\n  {rtype} - {items[0]['description']}:")
                for item in items[:10]:
                    print(f"    {item['file']}: {item['url']}")
                if len(items) > 10:
                    print(f"    ... and {len(items) - 10} more")

        total_failures = errors + len(regressions)
        if total_failures == 0:
            print("\nALL CHECKS PASSED")
        else:
            print(f"\nFAILED: {total_failures} issue(s) found")

        return total_failures

    def save_report(self, output_path):
        """Save report as JSON."""
        report = {
            'summary': {
                'total_links': self.results['total_links'],
                'success_count': self.results['success'],
                'error_count': self.results['errors'],
                'skipped_count': self.results['skipped'],
                'regression_count': len(self.results['regressions']),
                'success_rate': (self.results['success'] / max(1, self.results['success'] + self.results['errors'])) * 100
            },
            'errors': self.results['error_details'],
            'regressions': self.results['regressions']
        }
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\nReport saved to: {output_path}")


def main():
    content_dir = '/private/tmp/prismatic-promo/content'
    public_dir = '/private/tmp/prismatic-promo/public'
    report_path = '/private/tmp/prismatic-promo/link-test-report-local.json'

    tester = LocalLinkTester(content_dir, public_dir)

    # Phase 1: Test all @/ links in content files
    print("Phase 1: Testing content file links...")
    tester.scan_content()

    # Phase 2: Test built HTML internal links
    print("\nPhase 2: Testing built HTML links...")
    tester.scan_built_html()

    # Phase 3: Regression guards
    print("\nPhase 3: Running regression checks...")
    tester.run_regression_checks()

    # Report
    failures = tester.report()
    tester.save_report(report_path)

    # Exit code
    sys.exit(1 if failures > 0 else 0)


if __name__ == '__main__':
    main()
