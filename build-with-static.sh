#!/bin/bash

# Promo site build with static file handling
# Usage: ./build-with-static.sh

set -e

echo "Building promo site with static files..."

# Clean build
rm -rf public
zola build

# Copy static files explicitly (workaround for Zola static file issue)
echo "Copying static files..."
cp -r static/* public/

# Verify critical files
if [ -f "public/js/glossary-data.js" ]; then
    echo "✅ glossary-data.js copied successfully"
else
    echo "❌ glossary-data.js missing"
    exit 1
fi

if [ -f "public/js/vendor/alpine.min.js" ]; then
    echo "✅ alpine.min.js copied successfully"
else
    echo "❌ alpine.min.js missing"
    exit 1
fi

echo "✅ Build completed successfully with all static assets"
echo "📊 Built $(find public -name "*.html" | wc -l | tr -d ' ') HTML pages"
echo "📁 Copied $(find public -name "*.js" | wc -l | tr -d ' ') JavaScript files"