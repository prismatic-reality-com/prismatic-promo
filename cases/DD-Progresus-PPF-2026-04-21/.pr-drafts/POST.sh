#!/bin/bash
# Po-review post draft comments to PRs.
# Usage: review .pr-drafts/PR-21-comment.md and PR-17-comment.md, then run this script.
# Requires: gh CLI authenticated to arkadialabs/progresus-ai-transformation

set -euo pipefail
cd "$(dirname "$0")/.."

REPO="arkadialabs/progresus-ai-transformation"

echo "=== Posting comment to PR #21 ==="
gh pr comment 21 --repo "$REPO" --body-file .pr-drafts/PR-21-comment.md

echo ""
echo "=== Posting comment to PR #17 ==="
gh pr comment 17 --repo "$REPO" --body-file .pr-drafts/PR-17-comment.md

echo ""
echo "Done. View at:"
echo "  https://github.com/$REPO/pull/21"
echo "  https://github.com/$REPO/pull/17"
