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
    "scan": "node bin/apigeelint-security.js scan",
    "pack:check": "npm pack --dry-run"
  },
  "dependencies": {
    "apigeelint": "2.77.1"
  },
  "engines": {
    "node": ">=20"
  }
}