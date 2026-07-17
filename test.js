#!/usr/bin/env node

"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");

/**
 * Absolute path to the installed scanner package.
 *
 * The CLI may be executed from any consumer repository. Resolving paths from
 * the package directory ensures that bundled scripts and converters are found
 * independently of the consumer project's directory structure.
 *
 * @type {string}
 */
const packageRoot = path.resolve(__dirname, "..");

/**
 * Displays the public command-line interface of the scanner.
 *
 * This function is called when the supplied command is missing or unsupported.
 *
 * @returns {void}
 */
function printUsage() {
  console.log(`
Usage:
  apigeelint-security scan [proxy-root]

Example:
  apigeelint-security scan apiproxies
`);
}

/**
 * Executes a child process while forwarding its output directly to the caller.
 *
 * The consumer pipeline therefore receives the original scanner logs instead
 * of buffered or reformatted output.
 *
 * @param {string} executable Executable to run.
 * @param {string[]} args Arguments passed to the executable.
 * @param {NodeJS.ProcessEnv} [env=process.env] Environment of the child process.
 * @returns {number} Child-process exit code.
 */
function runCommand(executable, args, env = process.env) {
  const result = spawnSync(executable, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env,
  });

  if (result.error) {
    console.error(
      `Unable to start "${executable}": ${result.error.message}`,
    );
    return 1;
  }

  if (result.signal) {
    console.error(
      `"${executable}" was terminated by signal ${result.signal}.`,
    );
    return 1;
  }

  return result.status ?? 1;
}

/**
 * Runs the complete Apigee security analysis.
 *
 * The current implementation delegates bundle discovery and ApigeeLint
 * execution to the packaged Bash script, then converts the aggregated findings
 * into GitLab's SAST report format.
 *
 * Generated files are written into the current consumer repository:
 *
 * - apigeelint-results.json
 * - apigeelint-stderr.log
 * - gl-sast-report.json
 *
 * @param {string} proxyRoot Root directory containing the Apigee bundles.
 * @returns {number} Zero when scan and conversion succeed; otherwise non-zero.
 */
function scanProxies(proxyRoot) {
  const scanScript = path.join(
    packageRoot,
    "scripts",
    "run-all-apiproxies.sh",
  );

  const scanStatus = runCommand(
    "bash",
    [scanScript],
    {
      ...process.env,
      APIGEE_PROXY_ROOT: proxyRoot,
      APIGEELINT_PACKAGE_ROOT: packageRoot,
    },
  );

  if (scanStatus !== 0) {
    return scanStatus;
  }

  const converter = path.join(
    packageRoot,
    "convert-apigeelint-to-gitlab-sast.js",
  );

  return runCommand(process.execPath, [
    converter,
    "apigeelint-results.json",
    "gl-sast-report.json",
  ]);
}

/**
 * Parses CLI arguments and starts the requested operation.
 *
 * @returns {number} Process exit code.
 */
function main() {
  const [, , command, proxyRootArg] = process.argv;

  if (command !== "scan") {
    printUsage();
    return 1;
  }

  const proxyRoot = path.resolve(
    process.cwd(),
    proxyRootArg || "apiproxies",
  );

  return scanProxies(proxyRoot);
}

process.exitCode = main();