#!/usr/bin/env python3
"""
Comprehensive Link Testing System
Tests all links across the entire Prismatic Platform website
"""

import os
import re
import requests
from pathlib import Path
from collections import defaultdict
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

class LinkTester:
    def __init__(self, base_url="https://prismatic-reality.com", content_dir="/private/tmp/prismatic-promo/content"):
        self.base_url = base_url
        self.content_dir = Path(content_dir)
        self.results = defaultdict(list)
        self.link_patterns = [
            r'\[([^\]]+)\]\(([^)]+)\)',  # Markdown links
            r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([^<]+)</a>',  # HTML links
        ]
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'PrismaticPlatform-LinkTester/1.0'
        })

    def extract_links_from_content(self, file_path):
        """Extract all links from a markdown file."""
        links = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            for pattern in self.link_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    if len(match) == 2:
                        # Markdown style: (text, url)
                        text, url = match
                        if isinstance(match[0], str) and isinstance(match[1], str):
                            links.append({
                                'text': text,
                                'url': url,
                                'file': str(file_path),
                                'type': 'markdown'
                            })
                    elif len(match) == 2:
                        # HTML style: (url, text)
                        url, text = match
                        links.append({
                            'text': text,
                            'url': url,
                            'file': str(file_path),
                            'type': 'html'
                        })

        except Exception as e:
            print(f"Error reading {file_path}: {e}")

        return links

    def normalize_url(self, url):
        """Convert relative URLs to absolute URLs."""
        if url.startswith('http'):
            return url
        elif url.startswith('/'):
            return f"{self.base_url}{url}"
        elif url.startswith('@/'):
            # Zola internal link
            relative_path = url[2:]
            return f"{self.base_url}/{relative_path}"
        elif url.startswith('#'):
            # Fragment identifier - skip
            return None
        elif url.startswith('mailto:'):
            # Email link - skip
            return None
        else:
            # Relative path
            return f"{self.base_url}/{url}"

    def test_url(self, url, timeout=10):
        """Test if a URL returns a successful response."""
        try:
            response = self.session.head(url, timeout=timeout, allow_redirects=True)
            if response.status_code < 400:
                return {'status': 'success', 'code': response.status_code}
            else:
                # Try GET request for URLs that don't support HEAD
                response = self.session.get(url, timeout=timeout, allow_redirects=True)
                if response.status_code < 400:
                    return {'status': 'success', 'code': response.status_code}
                else:
                    return {'status': 'error', 'code': response.status_code, 'error': f"HTTP {response.status_code}"}

        except requests.exceptions.Timeout:
            return {'status': 'error', 'error': 'Timeout'}
        except requests.exceptions.ConnectionError:
            return {'status': 'error', 'error': 'Connection Error'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def scan_all_files(self):
        """Scan all markdown files for links."""
        all_links = []
        file_count = 0

        for md_file in self.content_dir.rglob('*.md'):
            file_count += 1
            links = self.extract_links_from_content(md_file)
            all_links.extend(links)

        print(f"📊 Scanned {file_count} files, found {len(all_links)} links")
        return all_links

    def test_links_concurrent(self, links, max_workers=20):
        """Test links concurrently for faster execution."""
        results = []
        unique_urls = {}

        # Deduplicate URLs while keeping track of source files
        for link in links:
            normalized_url = self.normalize_url(link['url'])
            if normalized_url:
                if normalized_url not in unique_urls:
                    unique_urls[normalized_url] = []
                unique_urls[normalized_url].append(link)

        print(f"🔗 Testing {len(unique_urls)} unique URLs...")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_url = {
                executor.submit(self.test_url, url): (url, sources)
                for url, sources in unique_urls.items()
            }

            completed = 0
            for future in as_completed(future_to_url):
                url, sources = future_to_url[future]
                test_result = future.result()

                for source_link in sources:
                    result = {
                        **source_link,
                        'normalized_url': url,
                        'test_result': test_result
                    }
                    results.append(result)

                completed += 1
                if completed % 50 == 0:
                    print(f"  ✅ Completed {completed}/{len(unique_urls)} URL tests")

        return results

    def generate_report(self, results):
        """Generate comprehensive test report."""
        report = {
            'summary': {
                'total_links': len(results),
                'success_count': 0,
                'error_count': 0,
                'error_rate': 0
            },
            'errors': [],
            'success': [],
            'by_file': defaultdict(lambda: {'success': 0, 'errors': 0}),
            'by_error_type': defaultdict(int)
        }

        for result in results:
            file_name = os.path.basename(result['file'])
            test_result = result['test_result']

            if test_result['status'] == 'success':
                report['summary']['success_count'] += 1
                report['success'].append(result)
                report['by_file'][file_name]['success'] += 1
            else:
                report['summary']['error_count'] += 1
                report['errors'].append(result)
                report['by_file'][file_name]['errors'] += 1
                error_type = test_result.get('error', f"HTTP {test_result.get('code', 'Unknown')}")
                report['by_error_type'][error_type] += 1

        if report['summary']['total_links'] > 0:
            report['summary']['error_rate'] = (report['summary']['error_count'] / report['summary']['total_links']) * 100

        return report

    def print_report(self, report):
        """Print human-readable test report."""
        print("\n" + "="*80)
        print("🔗 LINK TESTING REPORT")
        print("="*80)

        summary = report['summary']
        print(f"📊 SUMMARY:")
        print(f"  Total Links: {summary['total_links']}")
        print(f"  ✅ Successful: {summary['success_count']} ({100-summary['error_rate']:.1f}%)")
        print(f"  ❌ Errors: {summary['error_count']} ({summary['error_rate']:.1f}%)")

        if report['errors']:
            print(f"\n❌ ERRORS BY TYPE:")
            for error_type, count in sorted(report['by_error_type'].items(), key=lambda x: x[1], reverse=True):
                print(f"  {error_type}: {count}")

            print(f"\n❌ DETAILED ERRORS:")
            for error in report['errors'][:20]:  # Show first 20 errors
                print(f"  🔴 {error['text']} -> {error['normalized_url']}")
                print(f"     File: {os.path.basename(error['file'])}")
                print(f"     Error: {error['test_result']['error']}")
                print()

        print(f"\n📁 ERRORS BY FILE:")
        for file_name, stats in sorted(report['by_file'].items(), key=lambda x: x[1]['errors'], reverse=True):
            if stats['errors'] > 0:
                print(f"  {file_name}: {stats['errors']} errors, {stats['success']} success")

        print("="*80)

        return summary['error_rate'] < 5.0  # Return True if error rate is acceptable

    def save_report(self, report, output_file="link-test-report.json"):
        """Save detailed report to JSON file."""
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        print(f"💾 Detailed report saved to {output_file}")

def main():
    print("🔗 Prismatic Platform Link Testing System")
    print("=" * 50)

    tester = LinkTester()

    # Scan all files for links
    all_links = tester.scan_all_files()

    if not all_links:
        print("❌ No links found to test")
        return False

    # Test all links
    results = tester.test_links_concurrent(all_links)

    # Generate and display report
    report = tester.generate_report(results)
    success = tester.print_report(report)

    # Save detailed report
    tester.save_report(report)

    return success

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)