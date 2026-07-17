#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");

const packageMetadata = require("./package.json");
const apigeelintMetadata = require("apigeelint/package.json");

const inputFile =
  process.argv[2] || "apigeelint-results.json";

const outputFile =
  process.argv[3] || "gl-sast-report.json";

/**
 * Converts an ApigeeLint file path into a project-relative Unix path.
 *
 * @param {string} filePath Path returned by ApigeeLint.
 * @returns {string} Normalized project-relative path.
 */
function normalizePath(filePath) {
  if (!filePath) {
    return "unknown";
  }

  let normalized = String(filePath).replaceAll("\\", "/");

  const projectDir = (
    process.env.CI_PROJECT_DIR || process.cwd()
  ).replaceAll("\\", "/");

  if (normalized.startsWith(`${projectDir}/`)) {
    normalized = normalized.slice(projectDir.length + 1);
  }

  return normalized.replace(/^\.\/+/, "") || "unknown";
}

/**
 * Creates a deterministic UUID for a finding.
 *
 * @param {string} value Stable finding key.
 * @returns {string} UUID-like identifier.
 */
function stableUuid(value) {
  const hash = crypto
    .createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, 32);

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    (
      (Number.parseInt(hash.slice(16, 17), 16) & 0x3) |
      0x8
    ).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}

/**
 * Maps an ApigeeLint severity to a GitLab SAST severity.
 *
 * @param {number|string} value ApigeeLint severity.
 * @returns {"High"|"Medium"|"Low"} GitLab severity.
 */
function mapSeverity(value) {
  const severity = String(value).toLowerCase();

  if (severity === "2" || severity === "error") {
    return "High";
  }

  if (severity === "1" || severity === "warning") {
    return "Medium";
  }

  return "Low";
}

/**
 * Returns the current UTC timestamp.
 *
 * @returns {string} RFC 3339 timestamp.
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Encodes HTML-sensitive characters for safe display in GitLab.
 *
 * @param {string} text Message to encode.
 * @returns {string} HTML-encoded message.
 */
function htmlEncode(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Reads and validates the ApigeeLint JSON report.
 *
 * @param {string} filePath Input report path.
 * @returns {Array<object>} ApigeeLint results.
 */
function readApigeeLintReport(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  let report;

  try {
    report = JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    );
  } catch (error) {
    throw new Error(
      `Unable to parse ${filePath}: ${error.message}`,
    );
  }

  if (!Array.isArray(report)) {
    throw new Error(
      "Unexpected ApigeeLint JSON format: expected an array.",
    );
  }

  return report;
}

/**
 * Converts an ApigeeLint report into a GitLab SAST report.
 *
 * @returns {void}
 */
function main() {
  const apigeeResults = readApigeeLintReport(inputFile);
  const vulnerabilities = [];

  for (const fileResult of apigeeResults) {
    const filePath = normalizePath(fileResult.filePath);

    const messages = Array.isArray(fileResult.messages)
      ? fileResult.messages
      : [];

    for (const message of messages) {
      const ruleId = String(
        message.ruleId || "APIGEELINT",
      );

      const parsedLine = Number(message.line);

      const line =
        Number.isInteger(parsedLine) && parsedLine > 0
          ? parsedLine
          : 1;

      const text = htmlEncode(
        message.message || "ApigeeLint finding",
      );

      const severity = mapSeverity(message.severity);

      const stableKey = [
        ruleId,
        filePath,
        line,
        text,
      ].join("|");

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
        version: packageMetadata.version,

        vendor: {
          name: "Internal",
        },

        url: "https://github.com/apigee/apigeelint",
      },

      scanner: {
        id: "apigeelint",
        name: "ApigeeLint",
        version: apigeelintMetadata.version,

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

  fs.writeFileSync(
    outputFile,
    JSON.stringify(gitlabSastReport, null, 2),
  );

  console.log(
    `Converted ${vulnerabilities.length} ApigeeLint findings to ${outputFile}`,
  );
}

try {
  main();
} catch (error) {
  console.error(
    `SAST conversion failed: ${error.message}`,
  );

  process.exit(1);
}