#!/usr/bin/env node

const fs = require("fs");
const crypto = require("crypto");

const inputFile = process.argv[2] || "apigeelint-results.json";
const outputFile = process.argv[3] || "gl-sast-report.json";

/**
 * Normalizes a file path to a project-relative Unix-style path.
 *
 * @param {string} filePath Original file path from ApigeeLint.
 * @returns {string} Normalized relative file path.
 */
function normalizePath(filePath) {
  if (!filePath) return "unknown";

  let normalized = String(filePath).replace(/\\/g, "/");

  const projectDir = (process.env.CI_PROJECT_DIR || process.cwd()).replace(/\\/g, "/");

  if (normalized.startsWith(projectDir + "/")) {
    normalized = normalized.slice(projectDir.length + 1);
  }

  return normalized.replace(/^\.\/+/, "") || "unknown";
}

/**
 * Generates a stable UUID from a deterministic input string.
 * The same finding always produces the same identifier.
 *
 * @param {string} value Stable input value.
 * @returns {string} UUID-like identifier.
 */
function stableUuid(value) {
  const hash = crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}

/**
 * Maps an ApigeeLint severity to a GitLab SAST severity.
 *
 * @param {number|string} apigeeSeverity ApigeeLint severity.
 * @returns {string} GitLab severity.
 */
function mapSeverity(apigeeSeverity) {
  if (apigeeSeverity === 2 || apigeeSeverity === "2" || apigeeSeverity === "error") {
    return "High";
  }

  if (apigeeSeverity === 1 || apigeeSeverity === "1" || apigeeSeverity === "warning") {
    return "Medium";
  }

  return "Low";
}

/**
 * Returns the current timestamp in GitLab SAST format.
 *
 * @returns {string} Timestamp (YYYY-MM-DDTHH:mm:ss).
 */
function getTimestamp() {
  return new Date().toISOString().slice(0, 19);
}

/**
 * Converts an ApigeeLint JSON report into a GitLab SAST report.
 */
function main() {
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const apigeeResults = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  if (!Array.isArray(apigeeResults)) {
    console.error("Unexpected ApigeeLint JSON format: expected an array.");
    process.exit(1);
  }

  const vulnerabilities = [];

  for (const fileResult of apigeeResults) {
    const filePath = normalizePath(fileResult.filePath);
    const messages = Array.isArray(fileResult.messages) ? fileResult.messages : [];

    for (const message of messages) {
      const ruleId = message.ruleId || "APIGEELINT";
      const line = Number(message.line) || 1;
      const text = message.message || "ApigeeLint finding";
      const severity = mapSeverity(message.severity);

      const stableKey = `${ruleId}|${filePath}|${line}|${text}`;

      vulnerabilities.push({
        id: stableUuid(stableKey),
        category: "sast",
        name: `ApigeeLint ${ruleId}`,
        message: text,
        description: `ApigeeLint rule ${ruleId}: ${text}`,
        severity,
        confidence: "Medium",
        scanner: {
          id: "apigeelint",
          name: "ApigeeLint",
        },
        location: {
          file: filePath,
          start_line: line,
          end_line: line,
        },
        identifiers: [
          {
            type: "apigeelint_rule_id",
            name: `ApigeeLint rule ${ruleId}`,
            value: ruleId,
            url: "https://github.com/apigee/apigeelint",
          },
        ],
      });
    }
  }

  const timestamp = getTimestamp();

  const gitlabSastReport = {
    version: "15.2.4",
    schema:
      "https://gitlab.com/gitlab-org/security-products/security-report-schemas/-/raw/master/dist/sast-report-format.json",
    scan: {
      analyzer: {
        id: "apigeelint-security-plugins",
        name: "ApigeeLint Security Plugins",
        version: "1.0.0",
        vendor: {
          name: "Internal",
        },
        url: "https://github.com/apigee/apigeelint",
      },
      scanner: {
        id: "apigeelint",
        name: "ApigeeLint",
        version: "2.77.1",
        vendor: {
          name: "Apigee",
        },
        url: "https://github.com/apigee/apigeelint",
      },
      type: "sast",
      start_time: timestamp,
      end_time: timestamp,
      status: "success",
    },
    vulnerabilities,
  };

  fs.writeFileSync(outputFile, JSON.stringify(gitlabSastReport, null, 2));

  console.log(`Converted ${vulnerabilities.length} ApigeeLint findings to ${outputFile}`);
}

main();