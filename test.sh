#!/usr/bin/env bash

set -euo pipefail

# Absolute directory containing the installed scanner package.
#
# When the scanner is executed from a consumer repository, the current working
# directory belongs to that consumer. Package resources must therefore be
# resolved from the installed package itself, not from the current directory.
PACKAGE_ROOT="${APIGEELINT_PACKAGE_ROOT:-$(
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
)}"

# Resolve the ApigeeLint executable from the scanner package dependencies.
#
# Using require.resolve avoids depending on a global ApigeeLint installation or
# on the node_modules directory of the consumer project.
APIGEELINT_CLI="$(
  node -e \
    "process.stdout.write(require.resolve('apigeelint/cli.js', {
      paths: [process.argv[1]]
    }))" \
    "$PACKAGE_ROOT"
)"

# Root directory containing one or more Apigee proxy bundles.
#
# Each bundle is identified by an `apiproxy` directory found recursively below
# this root.
PROXY_ROOT="${APIGEE_PROXY_ROOT:-apiproxies}"

# Files generated in the repository from which the scanner is executed.
FINAL_REPORT="${APIGEELINT_REPORT_FILE:-apigeelint-results.json}"
STDERR_LOG="${APIGEELINT_STDERR_FILE:-apigeelint-stderr.log}"

# Keep your existing complete excluded-rules list unchanged here.
DEFAULT_EXCLUDED_RULES="BN005,BN006,BN007,BN010,BN011,BN013,BN014,P0034,CC003,CC004,CC005,CC007,CC050,TD002,TD006,TD007,P0007,P0012,P0013"

# A consumer may override the default exclusions without modifying the package.
EXCLUDED_RULES="${APIGEELINT_EXCLUDED_RULES:-$DEFAULT_EXCLUDED_RULES}"

# Temporary reports are isolated from the consumer repository and automatically
# removed when the script exits, including after an error or interruption.
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/apigeelint-results.XXXXXX")"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

# Fail early with an explicit message instead of letting `find` fail later.
if [[ ! -d "$PROXY_ROOT" ]]; then
  echo "Apigee proxy root directory does not exist: $PROXY_ROOT" >&2
  exit 1
fi

# Initialize deterministic output files.
printf '[]\n' > "$FINAL_REPORT"
: > "$STDERR_LOG"

# Discover every Apigee bundle safely.
#
# The null delimiter allows paths containing spaces or special characters.
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

  # ApigeeLint may return a non-zero status when findings are detected.
  #
  # Findings are expected security results, not necessarily a technical failure,
  # so the report file is checked separately before deciding whether to stop.
  set +e

  node "$APIGEELINT_CLI" \
    -f json.js \
    -x "$PACKAGE_ROOT/security-lint-plugins" \
    -e "$EXCLUDED_RULES" \
    -s "$PROXY_PATH" \
    -w "$TEMP_REPORT" \
    -q \
    2>> "$STDERR_LOG"

  APIGEELINT_EXIT=$?

  set -e

  echo "ApigeeLint exit code: $APIGEELINT_EXIT"

  # A missing or empty report indicates a technical execution failure.
  if [[ ! -s "$TEMP_REPORT" ]]; then
    echo "Missing or empty report for: $PROXY_PATH" >&2
    cat "$STDERR_LOG" >&2 || true
    exit 1
  fi

  # Validate both JSON files and append the current findings to the aggregated
  # report. The embedded Node program avoids dependencies such as jq.
  node - "$FINAL_REPORT" "$TEMP_REPORT" <<'NODE'
"use strict";

const fs = require("node:fs");

const finalReportPath = process.argv[2];
const currentReportPath = process.argv[3];

/**
 * Reads and parses an ApigeeLint JSON report.
 *
 * @param {string} filePath Path to the JSON report.
 * @returns {unknown} Parsed JSON value.
 */
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Unable to parse JSON report "${filePath}": ${error.message}`);
    process.exit(1);
  }
}

const finalReport = readJson(finalReportPath);
const currentReport = readJson(currentReportPath);

if (!Array.isArray(finalReport)) {
  console.error(`Invalid aggregated ApigeeLint report: ${finalReportPath}`);
  process.exit(1);
}

if (!Array.isArray(currentReport)) {
  console.error(`Invalid ApigeeLint report: ${currentReportPath}`);
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