#!/bin/bash
# GitHub Pages Deployment Script
# Handles the complete build and deploy cycle for the promo site

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMO_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="${DEPLOY_DIR:-/private/tmp/prismatic-promo-fresh}"
GITHUB_REPO="${GITHUB_REPO:-git@github.com:korczis/prismatic-promo.git}"
BASE_URL="${BASE_URL:-https://prismatic-reality.com}"

echo "🚀 SUPREME COORDINATOR - GitHub Pages Deployment"
echo "================================================================"
echo "Source: $PROMO_DIR"
echo "Deploy: $DEPLOY_DIR"
echo "Repo: $GITHUB_REPO"
echo "URL: $BASE_URL"
echo ""

# Function to ensure deploy directory is ready
prepare_deploy_directory() {
    echo "📁 Preparing deployment directory..."

    # Create deploy directory if it doesn't exist
    mkdir -p "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"

    # Initialize git if needed
    if [[ ! -d ".git" ]]; then
        echo "   Initializing git repository..."
        git init
        git remote add origin "$GITHUB_REPO"
    fi

    # Ensure we're on main branch
    local current_branch
    current_branch=$(git branch --show-current 2>/dev/null || echo "")
    if [[ "$current_branch" != "main" ]]; then
        echo "   Switching to main branch..."
        git checkout -B main
    fi

    # Clean any existing content
    find . -maxdepth 1 ! -name '.git' ! -name '.github' ! -name '.' -exec rm -rf {} \; 2>/dev/null || true

    echo "✅ Deploy directory ready"
}

# Function to build the site
build_site() {
    echo "🔨 Building site with memory-efficient strategy..."

    cd "$PROMO_DIR"

    # Ensure TailwindCSS is built
    echo "   Building TailwindCSS..."
    npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify

    # Use memory-efficient build strategy
    echo "   Running memory-efficient Zola build..."
    STRATEGY=fast ./scripts/memory-efficient-build.sh "$DEPLOY_DIR" "$BASE_URL"

    echo "✅ Site built successfully"
}

# Function to deploy to GitHub Pages
deploy_to_github() {
    echo "🚀 Deploying to GitHub Pages..."

    cd "$DEPLOY_DIR"

    # Add all files
    git add .

    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo "   No changes to deploy"
        return 0
    fi

    # Create deployment commit
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local page_count
    page_count=$(find . -name "*.html" | wc -l)
    local file_count
    file_count=$(find . -type f | wc -l)

    git commit -m "deploy: $page_count pages, $file_count files - $timestamp

🚀 Automated deployment via memory-efficient build strategy
📊 Statistics:
   - HTML pages: $page_count
   - Total files: $file_count
   - Build time: $(date)
   - Strategy: Memory-efficient (no external link checking)

🎯 SUPREME COORDINATOR deployment complete"

    # Push to GitHub
    echo "   Pushing to GitHub..."
    git push origin main --force-with-lease

    echo "✅ Deployed successfully to GitHub Pages"
    echo "🌐 Site will be available at: $BASE_URL"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        echo "   Attempt $attempt/$max_attempts - checking $BASE_URL"

        if curl -s -f "$BASE_URL" >/dev/null; then
            echo "✅ Site is live and responding"
            return 0
        fi

        echo "   Site not ready yet, waiting 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done

    echo "⚠️  Site verification timed out, but deployment may still succeed"
    echo "   Check manually: $BASE_URL"
    return 1
}

# Main execution
main() {
    echo "🎯 Starting deployment process..."
    echo ""

    # Check prerequisites
    if ! command -v zola >/dev/null 2>&1; then
        echo "❌ Error: Zola not installed"
        echo "   Install: https://www.getzola.org/documentation/getting-started/installation/"
        exit 1
    fi

    if ! command -v npx >/dev/null 2>&1; then
        echo "❌ Error: Node.js/npm not installed"
        exit 1
    fi

    # Execute deployment steps
    prepare_deploy_directory
    echo ""

    build_site
    echo ""

    deploy_to_github
    echo ""

    verify_deployment
    echo ""

    echo "🎉 SUPREME COORDINATOR - Deployment Mission Complete"
    echo "================================================================"
    echo "✅ Site deployed successfully"
    echo "🌐 Live at: $BASE_URL"
    echo "📊 GitHub Pages: https://github.com/korczis/prismatic-promo"
    echo ""
    echo "📈 Deployment statistics:"
    cd "$DEPLOY_DIR"
    echo "   HTML pages: $(find . -name '*.html' | wc -l)"
    echo "   Total files: $(find . -type f | wc -l)"
    echo "   Repository size: $(du -sh .)"
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h")
        echo "GitHub Pages Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy (default)  Complete build and deployment"
        echo "  build-only        Build site without deployment"
        echo "  deploy-only       Deploy existing build"
        echo ""
        echo "Environment variables:"
        echo "  DEPLOY_DIR        Deployment directory (default: /private/tmp/prismatic-promo-fresh)"
        echo "  GITHUB_REPO       GitHub repository (default: git@github.com:korczis/prismatic-promo.git)"
        echo "  BASE_URL          Site base URL (default: https://prismatic-reality.com)"
        exit 0
        ;;
    "build-only")
        build_site
        ;;
    "deploy-only")
        prepare_deploy_directory
        deploy_to_github
        verify_deployment
        ;;
    "deploy"|*)
        main
        ;;
esac