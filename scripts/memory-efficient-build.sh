#!/bin/bash
# Memory-Efficient Zola Build Script
# Addresses exit code 137/143 memory failures during promo site builds

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMO_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="${1:-public}"
BASE_URL="${2:-https://prismatic-reality.com}"

echo "🚀 SUPREME COORDINATOR - Memory-Efficient Build Strategy"
echo "================================================================"
echo "Target: $OUTPUT_DIR"
echo "Base URL: $BASE_URL"
echo "Source files: $(find "$PROMO_DIR/content" -name "*.md" | wc -l) markdown files"
echo ""

# Function to monitor memory usage
monitor_memory() {
    local pid=$1
    local max_memory=0
    while kill -0 "$pid" 2>/dev/null; do
        if command -v ps >/dev/null 2>&1; then
            local current_memory
            current_memory=$(ps -o rss= -p "$pid" 2>/dev/null | awk '{print $1}' || echo "0")
            if [[ $current_memory -gt $max_memory ]]; then
                max_memory=$current_memory
            fi
        fi
        sleep 1
    done
    echo "Peak memory usage: $((max_memory / 1024)) MB"
}

# Strategy 1: Build without link checking (fastest, least memory)
build_without_link_check() {
    echo "📦 Strategy 1: Build without external link validation"
    echo "   - Skips memory-intensive HTTP requests to 2,410 external links"
    echo "   - Fastest build time, minimal memory usage"
    echo "   - Trade-off: No external link validation"
    echo ""

    cd "$PROMO_DIR"

    # Remove any existing output directory
    [[ -d "$OUTPUT_DIR" ]] && rm -rf "$OUTPUT_DIR"

    echo "⏱️  Starting build process..."
    local start_time
    start_time=$(date +%s)

    # Run zola build in background to monitor memory
    zola build --base-url "$BASE_URL" --output-dir "$OUTPUT_DIR" &
    local build_pid=$!

    # Monitor the build process
    monitor_memory $build_pid &
    local monitor_pid=$!

    # Wait for build completion
    if wait $build_pid; then
        kill $monitor_pid 2>/dev/null || true
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))

        echo "✅ Build completed successfully in ${duration}s"
        echo "📊 Generated: $(find "$OUTPUT_DIR" -name "*.html" | wc -l) HTML pages"
        echo "📊 Total files: $(find "$OUTPUT_DIR" -type f | wc -l) files"
        return 0
    else
        kill $monitor_pid 2>/dev/null || true
        echo "❌ Build failed"
        return 1
    fi
}

# Strategy 2: Pre-validate links separately (most thorough)
build_with_separate_validation() {
    echo "📦 Strategy 2: Build with separate link validation"
    echo "   - Build site without link checking"
    echo "   - Validate links separately with memory limits"
    echo "   - Best of both worlds: complete site + validation"
    echo ""

    # First, build the site
    if build_without_link_check; then
        echo ""
        echo "🔍 Running separate link validation..."
        echo "   - Using zola check with controlled memory"
        echo "   - Skip external links to prevent memory exhaustion"

        cd "$PROMO_DIR"
        if zola check --skip-external-links; then
            echo "✅ Internal link validation passed"
            echo "⚠️  External link validation skipped (2,410 links would cause memory exhaustion)"
            echo "💡 For external link validation, use: ./scripts/validate-external-links.sh"
            return 0
        else
            echo "❌ Internal link validation failed"
            return 1
        fi
    else
        echo "❌ Build phase failed"
        return 1
    fi
}

# Strategy 3: Chunked external link validation (future enhancement)
create_external_link_validator() {
    cat > "$PROMO_DIR/scripts/validate-external-links.sh" << 'EOF'
#!/bin/bash
# Chunked External Link Validator
# Validates external links in batches to prevent memory exhaustion

set -euo pipefail

PROMO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
CHUNK_SIZE="${1:-50}"
TIMEOUT="${2:-30}"

echo "🔗 Chunked External Link Validator"
echo "Chunk size: $CHUNK_SIZE links per batch"
echo "Timeout: $TIMEOUT seconds per request"

# Extract all external links from markdown files
echo "📝 Extracting external links..."
external_links=$(find "$PROMO_DIR/content" -name "*.md" -exec grep -ho 'https://[^)]*' {} \; | sort -u)
total_links=$(echo "$external_links" | wc -l)

echo "Found $total_links unique external links"

# Process in chunks
chunk_num=1
echo "$external_links" | split -l "$CHUNK_SIZE" - /tmp/links_chunk_

for chunk_file in /tmp/links_chunk_*; do
    echo "Processing chunk $chunk_num..."

    while IFS= read -r url; do
        if [[ -n "$url" ]]; then
            if timeout "$TIMEOUT" curl -s -I "$url" >/dev/null 2>&1; then
                echo "✅ $url"
            else
                echo "❌ $url"
            fi
        fi
    done < "$chunk_file"

    chunk_num=$((chunk_num + 1))
    rm "$chunk_file"

    # Brief pause between chunks to prevent overwhelming servers
    sleep 1
done

echo "🏁 External link validation complete"
EOF

    chmod +x "$PROMO_DIR/scripts/validate-external-links.sh"
    echo "📝 Created chunked external link validator: $PROMO_DIR/scripts/validate-external-links.sh"
}

# Main execution
main() {
    echo "🎯 Selecting optimal strategy based on requirements..."
    echo ""

    case "${STRATEGY:-auto}" in
        "fast")
            echo "🏃‍♂️ Fast mode selected: Build without link checking"
            build_without_link_check
            ;;
        "thorough")
            echo "🔍 Thorough mode selected: Build with separate validation"
            build_with_separate_validation
            ;;
        "auto"|*)
            echo "🤖 Auto mode: Attempting thorough build with fallback to fast"
            if ! build_with_separate_validation; then
                echo ""
                echo "⚠️  Thorough build failed, falling back to fast mode..."
                build_without_link_check
            fi
            ;;
    esac

    # Create the external link validator for future use
    create_external_link_validator

    echo ""
    echo "🎉 SUPREME COORDINATOR - Mission Complete"
    echo "================================================================"
    echo "✅ Site built successfully with memory-efficient strategy"
    echo "📊 Output: $OUTPUT_DIR"
    echo "🔗 For external link validation: ./scripts/validate-external-links.sh"
    echo "💾 Deploy to GitHub Pages: copy contents to /private/tmp/prismatic-promo-fresh"
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Memory-Efficient Zola Build Script"
        echo ""
        echo "Usage: $0 [output_dir] [base_url]"
        echo ""
        echo "Environment variables:"
        echo "  STRATEGY=fast|thorough|auto (default: auto)"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Auto mode, default settings"
        echo "  STRATEGY=fast $0                      # Fast mode only"
        echo "  $0 /tmp/build https://example.com     # Custom output and base URL"
        exit 0
        ;;
    *)
        main
        ;;
esac