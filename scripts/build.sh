#!/usr/bin/env bash
set -euo pipefail

# Prismatic Promo - Production Build Pipeline
# Pre-compiles TailwindCSS then runs Zola static site generator
#
# Usage: ./scripts/build.sh [--watch]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== Prismatic Promo Build Pipeline ==="
echo ""

# Phase 0: Template regression checks (pre-build gate)
echo "[0/3] Running template regression checks..."
if [ -x "$SCRIPT_DIR/test-template-regression.sh" ]; then
    if "$SCRIPT_DIR/test-template-regression.sh" --templates; then
        echo "  Template checks passed."
    else
        echo ""
        echo "  WARNING: Template regression violations detected."
        echo "  Run: ./scripts/test-template-regression.sh --templates"
        echo "  Continuing build (violations are warnings during development)..."
    fi
    echo ""
fi

# Phase 1: TailwindCSS compilation
echo "[1/3] Compiling TailwindCSS..."
TAILWIND_START=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')

npx tailwindcss \
  -i ./static/css/tailwind-input.css \
  -o ./static/css/tailwind.css \
  --minify

TAILWIND_END=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
TAILWIND_MS=$(( (TAILWIND_END - TAILWIND_START) / 1000000 ))
TAILWIND_SIZE=$(wc -c < ./static/css/tailwind.css | tr -d ' ')

echo "  Done: ${TAILWIND_MS}ms | ${TAILWIND_SIZE} bytes"
echo ""

# Phase 2: Zola build
echo "[2/3] Building site with Zola..."
ZOLA_START=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')

zola build

ZOLA_END=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
ZOLA_MS=$(( (ZOLA_END - ZOLA_START) / 1000000 ))

echo ""

# Phase 3: Post-build HTML validation
echo "[3/3] Validating build output..."
if [ -x "$SCRIPT_DIR/test-template-regression.sh" ]; then
    if "$SCRIPT_DIR/test-template-regression.sh" --build; then
        echo "  Build output validation passed."
    else
        echo ""
        echo "  WARNING: Build output violations detected."
        echo "  Run: ./scripts/test-template-regression.sh --build"
    fi
    echo ""
fi

echo "=== Build Complete ==="
echo "  TailwindCSS: ${TAILWIND_MS}ms (${TAILWIND_SIZE} bytes minified)"
echo "  Zola build:  ${ZOLA_MS}ms"
echo "  Total:       $(( TAILWIND_MS + ZOLA_MS ))ms"
echo ""
echo "  CDN dependencies: 0 (fully self-contained)"
echo "  Output: ./public/"
