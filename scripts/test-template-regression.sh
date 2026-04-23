#!/usr/bin/env bash
set -euo pipefail

# Prismatic Promo - Template Regression Test Suite
# Prevents recurrence of three critical visual rendering bugs:
#   1. <p> tags wrapping block-level markdown content (section.content|safe)
#   2. Duplicate section.content rendering in same template
#   3. Malformed Alpine.js x-data function syntax
#
# Usage:
#   ./scripts/test-template-regression.sh              # Run all tests
#   ./scripts/test-template-regression.sh --templates   # Template-only checks (no build required)
#   ./scripts/test-template-regression.sh --build       # Build + HTML output validation
#   ./scripts/test-template-regression.sh --all         # Full suite (templates + build + output)
#
# Exit codes:
#   0 = All tests pass
#   1 = Template source violations found
#   2 = Build output violations found
#   3 = Both template and build violations found

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$PROJECT_DIR/templates"
PUBLIC_DIR="$PROJECT_DIR/public"

# Counters
TEMPLATE_VIOLATIONS=0
BUILD_VIOLATIONS=0
TOTAL_TESTS=0
TOTAL_PASSED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Mode selection
MODE="${1:---templates}"

print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}======================================${NC}"
    echo -e "${BOLD}${CYAN}  Promo Template Regression Tests${NC}"
    echo -e "${BOLD}${CYAN}======================================${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BOLD}--- $1 ---${NC}"
}

pass() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
    echo -e "  ${GREEN}PASS${NC} $1"
}

fail() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "  ${RED}FAIL${NC} $1"
    if [ -n "${2:-}" ]; then
        echo -e "       ${YELLOW}$2${NC}"
    fi
}

warn() {
    echo -e "  ${YELLOW}WARN${NC} $1"
}

# ===========================================================================
# TEST GROUP 1: Block elements inside <p> tags (Bug #1)
# ===========================================================================
# Markdown rendered via {{ section.content | safe }} produces block-level
# elements (h1-h6, ul, ol, pre, div, table, blockquote). Wrapping this
# output in a <p> tag is invalid HTML and causes visual rendering bugs
# where browsers auto-close the <p> creating orphaned content.
#
# CORRECT:   <div class="prose ...">{{ section.content | safe }}</div>
# INCORRECT: <p class="...">{{ section.content | safe }}</p>
# ===========================================================================

test_no_p_wrapping_content() {
    print_section "Bug #1: Block elements in <p> tags"

    local violations=0

    # Use python for fast multi-line pattern detection across all templates
    local result
    result=$(python3 -c "
import os, re, glob

templates_dir = '$TEMPLATES_DIR'
project_dir = '$PROJECT_DIR'
violations = []
prose_count = 0

for template in sorted(glob.glob(os.path.join(templates_dir, '**', '*.html'), recursive=True)):
    rel_path = template[len(project_dir)+1:]
    with open(template, 'r') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        # Check if line has a <p opening tag
        if re.search(r'<p[\s>]', line):
            # Check this line and next 3 lines for content variable
            context = ''.join(lines[i:i+4])
            if re.search(r'section\.content\s*\|\s*safe|page\.content\s*\|\s*safe', context):
                violations.append(f'{rel_path}:{i+1}')

    # Also check for proper prose wrapper
    content_str = ''.join(lines)
    if re.search(r'section\.content.*safe|page\.content.*safe', content_str):
        # Check preceding context for div with prose class
        for i, line in enumerate(lines):
            if re.search(r'section\.content.*safe|page\.content.*safe', line):
                context_before = ''.join(lines[max(0,i-3):i+1])
                if re.search(r'<div\s[^>]*class=\"[^\"]*prose', context_before):
                    prose_count += 1
                    break

for v in violations:
    print(f'VIOLATION:{v}')
print(f'PROSE:{prose_count}')
" 2>&1)

    while IFS= read -r line; do
        if echo "$line" | grep -q "^VIOLATION:"; then
            local loc="${line#VIOLATION:}"
            violations=$((violations + 1))
            TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
            fail "$loc - <p> wraps markdown content (section.content|safe)" \
                 "Use <div class=\"prose ...\"> instead of <p> for rendered markdown"
        fi
    done <<< "$result"

    if [ "$violations" -eq 0 ]; then
        pass "No <p> tags wrapping block-level markdown content"
    fi

    local prose_count
    prose_count=$(echo "$result" | grep "^PROSE:" | head -1)
    prose_count="${prose_count#PROSE:}"
    if [ "${prose_count:-0}" -gt 0 ]; then
        pass "$prose_count templates correctly use <div class=\"prose\"> for content"
    fi
}

# ===========================================================================
# TEST GROUP 2: Duplicate content rendering (Bug #2)
# ===========================================================================
# Templates must render {{ section.content | safe }} at most once.
# Duplicate rendering causes the same content block to appear twice on
# the page, creating visual duplication.
# ===========================================================================

test_no_duplicate_content() {
    print_section "Bug #2: Duplicate content rendering"

    local violations=0

    for template in "$TEMPLATES_DIR"/**/*.html; do
        local rel_path="${template#$PROJECT_DIR/}"

        # Count occurrences of section.content | safe
        local section_count
        section_count=$(grep -c 'section\.content\s*|.*safe' "$template" 2>/dev/null || true)
        section_count="${section_count:-0}"
        section_count=$(echo "$section_count" | tr -d '[:space:]')

        if [ "$section_count" -gt 1 ]; then
            violations=$((violations + 1))
            TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
            fail "$rel_path - section.content rendered $section_count times (expected 0 or 1)" \
                 "Remove duplicate {{ section.content | safe }} renderings"
        fi

        # Count occurrences of page.content | safe
        local page_count
        page_count=$(grep -c 'page\.content\s*|.*safe' "$template" 2>/dev/null || true)
        page_count="${page_count:-0}"
        page_count=$(echo "$page_count" | tr -d '[:space:]')

        if [ "$page_count" -gt 1 ]; then
            violations=$((violations + 1))
            TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
            fail "$rel_path - page.content rendered $page_count times (expected 0 or 1)" \
                 "Remove duplicate {{ page.content | safe }} renderings"
        fi
    done

    if [ "$violations" -eq 0 ]; then
        pass "No duplicate content rendering in any template"
    fi
}

# ===========================================================================
# TEST GROUP 3: Alpine.js x-data syntax validation (Bug #3)
# ===========================================================================
# Templates with x-data="functionName()" must have a corresponding
# <script> block defining that function with valid JavaScript object
# literal syntax. Common issues:
#   - Trailing commas after last property
#   - Missing commas between properties
#   - Unclosed braces in template-generated data
#   - Invalid Tera template interpolation in JS objects
# ===========================================================================

test_alpine_js_syntax() {
    print_section "Bug #3: Alpine.js x-data syntax validation"

    local violations=0

    # Use python for fast validation across all templates
    local result
    result=$(python3 -c "
import os, re, glob

templates_dir = '$TEMPLATES_DIR'
project_dir = '$PROJECT_DIR'

for template in sorted(glob.glob(os.path.join(templates_dir, '**', '*.html'), recursive=True)):
    rel_path = template[len(project_dir)+1:]
    with open(template, 'r') as f:
        content = f.read()

    # Find all x-data function references
    xdata_refs = re.findall(r'x-data=\"([a-zA-Z_]\w*)\(\)\"', content)

    for func_name in xdata_refs:
        # Check function is defined
        if f'function {func_name}()' not in content and f'function {func_name} ()' not in content:
            print(f'FAIL:{rel_path} - x-data references \"{func_name}()\" but function not defined in template')
            continue

        # Check function has return statement
        func_match = re.search(rf'function\s+{re.escape(func_name)}\s*\(\)\s*\{{', content)
        if func_match:
            after_func = content[func_match.start():]
            if 'return' not in after_func[:2000]:
                print(f'FAIL:{rel_path} - Alpine.js function \"{func_name}()\" has no return statement')
                continue

            # Check for Tera loops inside function that lack loop.last comma handling
            loop_matches = list(re.finditer(r'\{%\s*for\s+\w+\s+in\s+\S+\s*%\}(.*?)\{%\s*endfor\s*%\}', after_func[:5000], re.DOTALL))
            for lm in loop_matches:
                loop_body = lm.group(1)
                if 'loop.last' not in loop_body and ',' in loop_body:
                    line_num = content[:func_match.start() + lm.start()].count(chr(10)) + 1
                    print(f'WARN:{rel_path}:{line_num} - Template loop may lack proper comma handling (no loop.last check)')

print('DONE')
" 2>&1)

    while IFS= read -r line; do
        if echo "$line" | grep -q "^FAIL:"; then
            local msg="${line#FAIL:}"
            violations=$((violations + 1))
            TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
            fail "$msg"
        elif echo "$line" | grep -q "^WARN:"; then
            local msg="${line#WARN:}"
            warn "$msg"
        fi
    done <<< "$result"

    if [ "$violations" -eq 0 ]; then
        pass "All Alpine.js x-data functions are properly defined"
    fi
}

# ===========================================================================
# TEST GROUP 4: Additional template structural validation
# ===========================================================================

test_template_structure() {
    print_section "Structural integrity checks"

    local violations=0

    for template in "$TEMPLATES_DIR"/**/*.html; do
        local rel_path="${template#$PROJECT_DIR/}"

        # Check that every opening <script> has a closing </script>
        local open_scripts
        local close_scripts
        open_scripts=$(grep -c '<script' "$template" 2>/dev/null || echo "0")
        open_scripts=$(echo "$open_scripts" | tr -d '[:space:]')
        close_scripts=$(grep -c '</script>' "$template" 2>/dev/null || echo "0")
        close_scripts=$(echo "$close_scripts" | tr -d '[:space:]')

        if [ "$open_scripts" -ne "$close_scripts" ]; then
            violations=$((violations + 1))
            TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
            fail "$rel_path - Mismatched script tags: $open_scripts opening vs $close_scripts closing"
        fi

        # Check that x-data references on elements have matching function definitions
        local xdata_refs
        xdata_refs=$(grep -oP 'x-data="\K[a-zA-Z_]\w*(?=\(\))' "$template" 2>/dev/null || true)

        for ref in $xdata_refs; do
            if ! grep -q "function $ref" "$template"; then
                violations=$((violations + 1))
                TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
                fail "$rel_path - x-data='$ref()' references undefined function"
            fi
        done

        # Check for unclosed Tera blocks
        # Count ONLY {% block ... %} opens (not endblock, if, for, set, etc.)
        # and {% endblock %} closes
        local block_opens
        local block_closes
        block_opens=$(grep -cE '\{%-?\s*block\s+\w' "$template" 2>/dev/null || echo "0")
        block_opens=$(echo "$block_opens" | tr -d '[:space:]')
        block_closes=$(grep -cE '\{%-?\s*endblock' "$template" 2>/dev/null || echo "0")
        block_closes=$(echo "$block_closes" | tr -d '[:space:]')

        if [ "$block_opens" -ne "$block_closes" ]; then
            violations=$((violations + 1))
            TEMPLATE_VIOLATIONS=$((TEMPLATE_VIOLATIONS + 1))
            fail "$rel_path - Mismatched Tera blocks: $block_opens opens vs $block_closes closes"
        fi
    done

    if [ "$violations" -eq 0 ]; then
        pass "All templates pass structural integrity checks"
    fi
}

# ===========================================================================
# TEST GROUP 5: Built HTML output validation (requires zola build)
# ===========================================================================

test_build_output_p_nesting() {
    print_section "Build output: <p> nesting validation"

    if [ ! -d "$PUBLIC_DIR" ]; then
        warn "No build output found at $PUBLIC_DIR - run 'zola build' first or use --all"
        return
    fi

    local violations=0

    # Check built HTML files for <p> tags containing block-level elements
    # This catches the runtime manifestation of Bug #1
    local block_elements="h1|h2|h3|h4|h5|h6|div|ul|ol|pre|table|blockquote|hr|form|fieldset|address|dl|figure|figcaption|main|nav|section|article|aside|header|footer|details|summary"

    # Sample key pages that use section.content
    local pages=(
        "agents/index.html"
        "architecture/index.html"
        "osint/index.html"
        "apps/index.html"
        "capabilities/index.html"
        "commands/index.html"
        "glossary/index.html"
        "teams/index.html"
    )

    for page in "${pages[@]}"; do
        local filepath="$PUBLIC_DIR/$page"
        if [ ! -f "$filepath" ]; then
            continue
        fi

        # Use Python for proper HTML parsing since regex on HTML is fragile
        local result
        result=$(python3 -c "
import sys
from html.parser import HTMLParser

class PNestingChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_p = False
        self.p_line = 0
        self.violations = []
        self.block_elements = set('h1 h2 h3 h4 h5 h6 div ul ol pre table blockquote hr form fieldset address dl figure figcaption main nav section article aside header footer details summary'.split())

    def handle_starttag(self, tag, attrs):
        if tag == 'p':
            self.in_p = True
            self.p_line = self.getpos()[0]
        elif self.in_p and tag in self.block_elements:
            self.violations.append(f'Line ~{self.getpos()[0]}: <{tag}> found inside <p> (opened at line ~{self.p_line})')

    def handle_endtag(self, tag):
        if tag == 'p':
            self.in_p = False

try:
    with open('$filepath', 'r') as f:
        content = f.read()
    checker = PNestingChecker()
    checker.feed(content)
    for v in checker.violations:
        print(v)
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
" 2>&1)

        if [ -n "$result" ]; then
            while IFS= read -r violation; do
                if echo "$violation" | grep -q "^ERROR:"; then
                    warn "$page - Parse error: $violation"
                else
                    violations=$((violations + 1))
                    BUILD_VIOLATIONS=$((BUILD_VIOLATIONS + 1))
                    fail "$page - $violation" \
                         "Block element nested inside <p> tag in built output"
                fi
            done <<< "$result"
        fi
    done

    if [ "$violations" -eq 0 ]; then
        pass "No block elements nested inside <p> tags in build output"
    fi
}

test_build_output_duplicate_content() {
    print_section "Build output: Duplicate content detection"

    if [ ! -d "$PUBLIC_DIR" ]; then
        warn "No build output found at $PUBLIC_DIR - run 'zola build' first or use --all"
        return
    fi

    local violations=0

    # Check for exact duplicate large text blocks in built pages
    # This catches the runtime manifestation of Bug #2
    local pages=(
        "agents/index.html"
        "architecture/index.html"
        "osint/index.html"
        "apps/index.html"
        "capabilities/index.html"
        "commands/index.html"
    )

    for page in "${pages[@]}"; do
        local filepath="$PUBLIC_DIR/$page"
        if [ ! -f "$filepath" ]; then
            continue
        fi

        local result
        result=$(python3 -c "
import sys
from html.parser import HTMLParser

class DuplicateContentDetector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_blocks = []
        self.current_text = ''
        self.in_script = False
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
        elif tag == 'style':
            self.in_style = True
        else:
            self.flush_text()

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
            self.current_text = ''
        elif tag == 'style':
            self.in_style = False
            self.current_text = ''
        else:
            self.flush_text()

    def handle_data(self, data):
        if not self.in_script and not self.in_style:
            stripped = data.strip()
            if stripped:
                self.current_text += ' ' + stripped

    def flush_text(self):
        text = self.current_text.strip()
        if len(text) > 100:  # Only check substantial text blocks
            self.text_blocks.append(text)
        self.current_text = ''

    def get_duplicates(self):
        seen = {}
        duplicates = []
        for block in self.text_blocks:
            # Normalize whitespace for comparison
            normalized = ' '.join(block.split())
            if normalized in seen:
                if seen[normalized] == 1:
                    duplicates.append(normalized[:120] + '...' if len(normalized) > 120 else normalized)
                seen[normalized] += 1
            else:
                seen[normalized] = 1
        return duplicates

try:
    with open('$filepath', 'r') as f:
        content = f.read()
    detector = DuplicateContentDetector()
    detector.feed(content)
    detector.flush_text()
    duplicates = detector.get_duplicates()
    for d in duplicates:
        print(f'DUPLICATE: {d}')
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
" 2>&1)

        if [ -n "$result" ] && echo "$result" | grep -q "^DUPLICATE:"; then
            while IFS= read -r line; do
                if echo "$line" | grep -q "^DUPLICATE:"; then
                    violations=$((violations + 1))
                    BUILD_VIOLATIONS=$((BUILD_VIOLATIONS + 1))
                    fail "$page - ${line#DUPLICATE: }"
                fi
            done <<< "$result"
        fi
    done

    if [ "$violations" -eq 0 ]; then
        pass "No duplicate content blocks detected in build output"
    fi
}

test_build_output_alpine_syntax() {
    print_section "Build output: Alpine.js data validation"

    if [ ! -d "$PUBLIC_DIR" ]; then
        warn "No build output found at $PUBLIC_DIR - run 'zola build' first or use --all"
        return
    fi

    local violations=0

    # Validate that Alpine.js function definitions in built output produce valid JS
    local pages=(
        "agents/index.html"
        "architecture/index.html"
        "osint/index.html"
    )

    for page in "${pages[@]}"; do
        local filepath="$PUBLIC_DIR/$page"
        if [ ! -f "$filepath" ]; then
            continue
        fi

        local result
        result=$(python3 -c "
import re
import sys

with open('$filepath', 'r') as f:
    content = f.read()

# Extract all script blocks
script_pattern = re.compile(r'<script[^>]*>(.*?)</script>', re.DOTALL)
scripts = script_pattern.findall(content)

for i, script in enumerate(scripts):
    # Find function definitions that return objects (Alpine.js pattern)
    func_pattern = re.compile(r'function\s+(\w+)\s*\(\)\s*\{', re.DOTALL)
    for match in func_pattern.finditer(script):
        func_name = match.group(1)
        func_start = match.start()

        # Check for 'return {' pattern
        return_match = re.search(r'return\s*\{', script[func_start:])
        if not return_match:
            print(f'ISSUE: function {func_name}() has no return object')
            continue

        # Extract the items array if present (template-generated data)
        # Use bracket-depth matching instead of regex for robust extraction
        items_start = script[func_start:].find('items: [')
        if items_start == -1:
            items_start = script[func_start:].find('items:[')
        if items_start >= 0:
            bracket_pos = script[func_start + items_start:].find('[')
            arr_start = func_start + items_start + bracket_pos
            depth = 0
            arr_end = arr_start
            for ci, char in enumerate(script[arr_start:]):
                if char == '[': depth += 1
                elif char == ']': depth -= 1
                if depth == 0:
                    arr_end = arr_start + ci
                    break
            items_content = script[arr_start+1:arr_end].strip()
            if items_content:
                # Check for trailing comma before closing bracket
                if re.search(r',\s*$', items_content):
                    print(f'WARN: function {func_name}() items array has trailing comma')

                # Check each object literal has balanced braces
                brace_depth = 0
                for char in items_content:
                    if char == '{':
                        brace_depth += 1
                    elif char == '}':
                        brace_depth -= 1
                    if brace_depth < 0:
                        print(f'ISSUE: function {func_name}() items array has unbalanced braces')
                        break

                if brace_depth != 0 and brace_depth > 0:
                    print(f'ISSUE: function {func_name}() items array has {brace_depth} unclosed braces')

        # Check for unescaped special characters in string literals
        string_props = re.findall(r'(\w+):\s*\"([^\"]*?)\"', script[func_start:func_start+5000])
        for prop_name, prop_value in string_props:
            if chr(10) in prop_value:
                print(f'ISSUE: function {func_name}() property {prop_name} contains unescaped newline')
" 2>&1)

        if [ -n "$result" ]; then
            while IFS= read -r line; do
                if echo "$line" | grep -q "^ISSUE:"; then
                    violations=$((violations + 1))
                    BUILD_VIOLATIONS=$((BUILD_VIOLATIONS + 1))
                    fail "$page - ${line#ISSUE: }"
                elif echo "$line" | grep -q "^WARN:"; then
                    warn "$page - ${line#WARN: }"
                fi
            done <<< "$result"
        fi
    done

    if [ "$violations" -eq 0 ]; then
        pass "All Alpine.js data structures in build output are syntactically valid"
    fi
}

# Ensure grep failures in conditional checks don't trigger set -e
# by wrapping all grep -q calls appropriately

# ===========================================================================
# Main execution
# ===========================================================================

print_header

case "$MODE" in
    --templates|-t)
        echo -e "Mode: ${BOLD}Template source validation${NC}"
        test_no_p_wrapping_content
        test_no_duplicate_content
        test_alpine_js_syntax
        test_template_structure
        ;;
    --build|-b)
        echo -e "Mode: ${BOLD}Build output validation${NC}"
        test_build_output_p_nesting
        test_build_output_duplicate_content
        test_build_output_alpine_syntax
        ;;
    --all|-a)
        echo -e "Mode: ${BOLD}Full regression suite${NC}"
        test_no_p_wrapping_content
        test_no_duplicate_content
        test_alpine_js_syntax
        test_template_structure
        echo ""
        echo -e "${BOLD}Running build output validation...${NC}"
        test_build_output_p_nesting
        test_build_output_duplicate_content
        test_build_output_alpine_syntax
        ;;
    --help|-h)
        echo "Usage: $0 [--templates|--build|--all|--help]"
        echo ""
        echo "Options:"
        echo "  --templates, -t  Template source checks only (default, no build required)"
        echo "  --build, -b      Build output HTML validation (requires zola build)"
        echo "  --all, -a        Full suite: templates + build output"
        echo "  --help, -h       Show this help"
        exit 0
        ;;
    *)
        echo -e "${RED}Unknown option: $MODE${NC}"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

# ===========================================================================
# Summary
# ===========================================================================

echo ""
echo -e "${BOLD}${CYAN}======================================${NC}"
echo -e "${BOLD}${CYAN}  Results Summary${NC}"
echo -e "${BOLD}${CYAN}======================================${NC}"
echo ""
echo -e "  Total tests:    ${BOLD}$TOTAL_TESTS${NC}"
echo -e "  Passed:         ${GREEN}${BOLD}$TOTAL_PASSED${NC}"
echo -e "  Failed:         ${RED}${BOLD}$((TOTAL_TESTS - TOTAL_PASSED))${NC}"

if [ "$TEMPLATE_VIOLATIONS" -gt 0 ]; then
    echo -e "  Template violations: ${RED}${BOLD}$TEMPLATE_VIOLATIONS${NC}"
fi
if [ "$BUILD_VIOLATIONS" -gt 0 ]; then
    echo -e "  Build violations:    ${RED}${BOLD}$BUILD_VIOLATIONS${NC}"
fi

echo ""

# Exit code logic
EXIT_CODE=0
if [ "$TEMPLATE_VIOLATIONS" -gt 0 ]; then
    EXIT_CODE=$((EXIT_CODE | 1))
fi
if [ "$BUILD_VIOLATIONS" -gt 0 ]; then
    EXIT_CODE=$((EXIT_CODE | 2))
fi

if [ "$EXIT_CODE" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}All regression tests passed.${NC}"
else
    echo -e "${RED}${BOLD}Regression tests FAILED - fix violations before proceeding.${NC}"
fi

echo ""
exit $EXIT_CODE
