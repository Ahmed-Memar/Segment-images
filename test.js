#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const packageRoot = path.resolve(__dirname, "..");

function printUsage() {
  console.log(`
Usage:
  apigeelint-security scan [proxy-root]

Example:
  apigeelint-security scan apiproxies
`);
}

const [, , command, proxyRootArg] = process.argv;

if (command !== "scan") {
  printUsage();
  process.exit(1);
}

const proxyRoot = path.resolve(process.cwd(), proxyRootArg || "apiproxies");

const scan = spawnSync(
  "bash",
  [path.join(packageRoot, "scripts", "run-all-apiproxies.sh")],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      APIGEE_PROXY_ROOT: proxyRoot,
      APIGEELINT_PACKAGE_ROOT: packageRoot,
    },
  }
);

if (scan.error) {
  console.error(`Unable to start the scanner: ${scan.error.message}`);
  process.exit(1);
}

if (scan.status !== 0) {
  process.exit(scan.status ?? 1);
}

const conversion = spawnSync(
  process.execPath,
  [
    path.join(packageRoot, "convert-apigeelint-to-gitlab-sast.js"),
    "apigeelint-results.json",
    "gl-sast-report.json",
  ],
  {
    cwd: process.cwd(),
    stdio: "inherit",
  }
);

if (conversion.error) {
  console.error(`Unable to convert the report: ${conversion.error.message}`);
  process.exit(1);
}

process.exit(conversion.status ?? 0);






PACKAGE_ROOT="${APIGEELINT_PACKAGE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"





node "$PACKAGE_ROOT/node_modules/apigeelint/cli.js" \





-x "$PACKAGE_ROOT/security-lint-plugins" \





{
  "name": "apigeelint-security-plugins",
  "version": "0.1.0",
  "description": "ApigeeLint security scanner with custom API security plugins",
  "private": true,
  "license": "UNLICENSED",
  "bin": {
    "apigeelint-security": "bin/apigeelint-security.js"
  },
  "files": [
    "bin/",
    "scripts/",
    "security-lint-plugins/",
    "convert-apigeelint-to-gitlab-sast.js",
    "README.md"
  ],
  "scripts": {
    "sec-audit": "node node_modules/apigeelint/cli.js -f table.js -x security-lint-plugins/",
    "pack:check": "npm pack --dry-run"
  },
  "dependencies": {
    "apigeelint": "2.77.1"
  },
  "engines": {
    "node": ">=20"
  }
}