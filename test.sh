#!/usr/bin/env bash

set -euo pipefail

# Root directory containing the test proxy bundles.
PROXY_ROOT="${APIGEE_PROXY_ROOT:-apiproxies}"

# Output files.
FINAL_REPORT="apigeelint-results.json"
STDERR_LOG="apigeelint-stderr.log"
TMP_DIR=".apigeelint-results"

# Native ApigeeLint rules excluded from the security scan.
EXCLUDED_RULES="BN005,BN006,BN013,TD006,BN014,PO034,CC003,BN007,CC004,CC007,TD007,PO007,PO012,PO013,PO033,TD002,PO030,PO031,ST003,ST004,ST005,ST006,CC050"

rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

# Initialize output files.
printf '[]\n' > "$FINAL_REPORT"
: > "$STDERR_LOG"

# Discover every Apigee bundle.
mapfile -d '' PROXY_PATHS < <(
  find "$PROXY_ROOT" -type d -name apiproxy -print0
)

if [ "${#PROXY_PATHS[@]}" -eq 0 ]; then
  echo "No apiproxy directory found under: $PROXY_ROOT"
  exit 1
fi

echo "Found ${#PROXY_PATHS[@]} Apigee proxy bundle(s)."

INDEX=0

for PROXY_PATH in "${PROXY_PATHS[@]}"; do
  TEMP_REPORT="$TMP_DIR/result-${INDEX}.json"

  echo "Scanning: $PROXY_PATH"

  # Findings may return a non-zero exit code, so execution is captured.
  set +e

  node node_modules/apigeelint/cli.js \
    -f json.js \
    -x security-lint-plugins \
    -e "$EXCLUDED_RULES" \
    -s "$PROXY_PATH" \
    -w "$TEMP_REPORT" \
    -q \
    2>> "$STDERR_LOG"

  APIGEELINT_EXIT=$?

  set -e

  echo "ApigeeLint exit code: $APIGEELINT_EXIT"

  # A missing report indicates a technical scan failure.
  if [ ! -s "$TEMP_REPORT" ]; then
    echo "Missing or empty report for: $PROXY_PATH"
    cat "$STDERR_LOG" || true
    exit 1
  fi

  # Validate and merge the current report into the final report.
  node - "$FINAL_REPORT" "$TEMP_REPORT" <<'NODE'
const fs = require("fs");

const finalReportPath = process.argv[2];
const currentReportPath = process.argv[3];

const finalReport = JSON.parse(
  fs.readFileSync(finalReportPath, "utf8")
);

const currentReport = JSON.parse(
  fs.readFileSync(currentReportPath, "utf8")
);

if (!Array.isArray(finalReport) || !Array.isArray(currentReport)) {
  console.error(`Invalid ApigeeLint report: ${currentReportPath}`);
  process.exit(1);
}

finalReport.push(...currentReport);

fs.writeFileSync(
  finalReportPath,
  JSON.stringify(finalReport, null, 2)
);
NODE

  INDEX=$((INDEX + 1))
done

rm -rf "$TMP_DIR"

echo "All Apigee proxy bundles were scanned successfully."