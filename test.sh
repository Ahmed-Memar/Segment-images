#!/usr/bin/env bash

set -euo pipefail

# Scanner package root (works from consumer repositories).
PACKAGE_ROOT="${APIGEELINT_PACKAGE_ROOT:-$(
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
)}"

# Resolve the ApigeeLint CLI from the installed package.
APIGEELINT_CLI="$(
  node -e \
    "process.stdout.write(require.resolve('apigeelint/cli.js', { paths: [process.argv[1]] }))" \
    "$PACKAGE_ROOT"
)"

# Directory containing the proxy bundles to scan.
PROXY_ROOT="${APIGEE_PROXY_ROOT:-apiproxies}"

# Output files.
FINAL_REPORT="${APIGEELINT_REPORT_FILE:-apigeelint-results.json}"
STDERR_LOG="${APIGEELINT_STDERR_FILE:-apigeelint-stderr.log}"

# Native ApigeeLint rules excluded from the security scan.
DEFAULT_EXCLUDED_RULES="BN005,BN006,BN007,BN010,BN011,BN013,BN014,P0034,CC003,CC004,CC005,CC007,CC050,TD002,TD006,TD007,P0007,P0012,P0013,..."   # <-- keep your full current list

EXCLUDED_RULES="${APIGEELINT_EXCLUDED_RULES:-$DEFAULT_EXCLUDED_RULES}"

# Temporary reports are removed automatically.
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/apigeelint-results.XXXXXX")"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

if [[ ! -d "$PROXY_ROOT" ]]; then
  echo "Apigee proxy root directory does not exist: $PROXY_ROOT" >&2
  exit 1
fi

# Initialize output files.
printf '[]\n' > "$FINAL_REPORT"
: > "$STDERR_LOG"

# Discover every Apigee proxy bundle.
mapfile -d '' PROXY_PATHS < <(
  find "$PROXY_ROOT" -type d -name apiproxy -print0
)

if (( ${#PROXY_PATHS[@]} == 0 )); then
  echo "No apiproxy directory found under: $PROXY_ROOT" >&2
  exit 1
fi

echo "Found ${#PROXY_PATHS[@]} Apigee proxy bundle(s)."

INDEX=0

for PROXY_PATH in "${PROXY_PATHS[@]}"; do
  TEMP_REPORT="$TMP_DIR/result-${INDEX}.json"

  echo "Scanning: $PROXY_PATH"

  # Findings return a non-zero exit code, so validate the report instead.
  set +e

  node "$APIGEELINT_CLI" \
    -f json.js \
    -x "$PACKAGE_ROOT/security-lint-plugins" \
    -e "$EXCLUDED_RULES" \
    -s "$PROXY_PATH" \
    -w "$TEMP_REPORT" \
    -q \
    2>>"$STDERR_LOG"

  APIGEELINT_EXIT=$?

  set -e

  echo "ApigeeLint exit code: $APIGEELINT_EXIT"

  # Missing report means the scan failed.
  if [[ ! -s "$TEMP_REPORT" ]]; then
    echo "Missing or empty report for: $PROXY_PATH" >&2
    cat "$STDERR_LOG" >&2 || true
    exit 1
  fi

  # Merge the current report into the final report.
  node - "$FINAL_REPORT" "$TEMP_REPORT" <<'NODE'
"use strict";

const fs = require("node:fs");

/**
 * Read and parse a JSON report.
 *
 * @param {string} filePath Report path.
 * @returns {Array}
 */
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Unable to parse ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

const finalReportPath = process.argv[2];
const currentReportPath = process.argv[3];

const finalReport = readJson(finalReportPath);
const currentReport = readJson(currentReportPath);

if (!Array.isArray(finalReport) || !Array.isArray(currentReport)) {
  console.error("Invalid ApigeeLint report.");
  process.exit(1);
}

finalReport.push(...currentReport);

fs.writeFileSync(
  finalReportPath,
  `${JSON.stringify(finalReport, null, 2)}\n`,
  "utf8",
);
NODE

  INDEX=$((INDEX + 1))
done

echo "All Apigee proxy bundles were scanned successfully."