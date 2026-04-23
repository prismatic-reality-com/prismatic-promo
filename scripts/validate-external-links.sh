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
