#!/usr/bin/env bash
# Run Decision Engine 10-stage runtime pipeline on Kellner Cluster (AMALAR) DD case.
# Prerequisites: cwd = repo root; Elixir + Mix deps installed.
#
# Output: pretty-printed verdict + reasoning trace (default), or JSON with --json.
# CLI signature: mix dd.runtime_pipeline --file <inputs> --actors <actors> --subject-type person|company [--json] [--verbose]
#
# Usage:
#   ./apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/run-pipeline.sh           # pretty
#   ./apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/run-pipeline.sh --json    # machine
#   ./apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports/run-pipeline.sh --verbose # full trace

set -euo pipefail

CASE_DIR="apps/prismatic_web/priv/dd_cases/2026-04-28-kellner-cluster-amalar/reports"
INPUTS="$CASE_DIR/inputs.txt"
ACTORS="$CASE_DIR/actors.txt"

if [[ ! -f "$INPUTS" ]] || [[ ! -f "$ACTORS" ]]; then
  echo "ERROR: missing $INPUTS or $ACTORS"
  exit 1
fi

EXTRA_ARGS="$*"

mix dd.runtime_pipeline \
  --file "$INPUTS" \
  --actors "$ACTORS" \
  --subject-type person \
  $EXTRA_ARGS
