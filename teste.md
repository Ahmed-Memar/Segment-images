# ApigeeLint Security Scanner

This repository provides an Apigee security scanner based on
[ApigeeLint](https://github.com/apigee/apigeelint) and custom security plugins.

It recursively discovers Apigee proxy bundles, runs the security controls and
generates a GitLab SAST report.

## How it works

The reusable CI job:

1. installs a tagged version of this repository as an npm package;
2. recursively discovers every directory named `apiproxy`;
3. runs ApigeeLint with the custom security plugins;
4. merges the findings from all discovered bundles;
5. generates a GitLab SAST report.

Consumer projects do not need to copy the scanner plugins, scripts or
converter.

## Consumer usage

Two options are available:

1. GitLab CI, which is the recommended method;
2. local execution with the standalone package.

## 1. GitLab CI — Recommended

### Prerequisites

Before using the scanner:

- the consumer project must contain one or more Apigee proxy bundles;
- the scanner project must authorize the consumer project or its parent group
  in **Settings > CI/CD > Job token permissions**;
- the corporate Artifactory configuration and credentials used by the shared
  pipeline must be available to the CI job.

The scanner package is installed directly from its GitLab repository.
Therefore, the CI job token allowlist must be configured before the consumer
pipeline can install and execute the scanner.

The scanner expects a repository structure similar to:

```text
consumer-project/
├── .gitlab-ci.yml
└── apiproxies/
    ├── proxy1/
    │   └── apiproxy/
    └── proxy2/
        └── apiproxy/
```

The scanner searches recursively for directories named `apiproxy`. A consumer
repository can therefore contain one or several proxies under the same root
directory.

Add the following configuration to the consumer project's `.gitlab-ci.yml`:

```yaml
include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - project: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
    ref: 'v0.2.1'
    file: '/ci/apigeelint-security.yml'

variables:
  APIGEELINT_SECURITY_REF: 'v0.2.1'
  APIGEE_PROXY_ROOT: 'apiproxies'
```

If the root directory is not named `apiproxies`, update
`APIGEE_PROXY_ROOT` accordingly.

`ref` and `APIGEELINT_SECURITY_REF` must use the same scanner version.

### Configurable values

| Variable | Default | Description |
|---|---|---|
| `APIGEE_PROXY_ROOT` | `apiproxies` | Root directory searched recursively for `apiproxy` bundles |
| `APIGEELINT_SECURITY_REF` | `v0.2.1` | Version of the scanner package installed by the CI job |

The scanner project path and reusable template path are maintained internally
and do not need to be configured by consumer projects.

### Generated reports

The CI job generates:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

- `apigeelint-results.json` contains the merged ApigeeLint findings;
- `apigeelint-stderr.log` contains technical messages generated during the
  scan;
- `gl-sast-report.json` contains the findings converted to GitLab SAST format.

`gl-sast-report.json` is published as a GitLab SAST report. After the pipeline
completes, open the pipeline and go to the **Security** tab to review the
detected findings.

ApigeeLint findings do not stop the scan. A job fails only when the scanner
cannot run or cannot generate a valid report.

## 2. Local execution — Optional

Local execution can be used to check Apigee proxies before pushing changes.

The standalone package already contains ApigeeLint and its required runtime
dependencies. No npm registry, Artifactory configuration or `.npmrc` file is
required.

### Requirements

- Node.js 20 or later;
- Bash or Git Bash;
- the standalone scanner package:

```text
apigeelint-security-plugins-0.2.1.tgz
```

Download the standalone package and place it in the project directory
containing the proxies.

Example:

```text
consumer-project/
├── apigeelint-security-plugins-0.2.1.tgz
└── mybundles/
    ├── proxy1/
    │   └── apiproxy/
    └── proxy2/
        └── apiproxy/
```

### Install the scanner

From the consumer project directory, run:

```bash
npm install --offline --no-save --package-lock=false \
  ./apigeelint-security-plugins-0.2.1.tgz
```

The `--offline` option ensures that npm does not contact an npm registry or
Artifactory.

The `--no-save` and `--package-lock=false` options prevent the scanner from
being added as a permanent project dependency.

### Scan a directory

Scan every proxy under the default `apiproxies` directory:

```bash
./node_modules/.bin/apigeelint-security scan apiproxies
```

Scan proxies stored under another directory:

```bash
./node_modules/.bin/apigeelint-security scan mybundles
```

The scanner recursively searches the provided path for directories named
`apiproxy`.

For example, if `mybundles` contains eight `apiproxy` directories, the scanner
automatically discovers and scans all eight bundles.

### Scan one specific proxy

```bash
./node_modules/.bin/apigeelint-security scan \
  path/to/my-proxy/apiproxy
```

### Local reports

The scan generates the following files in the current working directory:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

An `ApigeeLint exit code: 1` displayed for an individual proxy means that
ApigeeLint detected findings. It does not mean that the complete scanner
execution failed.

A successful complete execution ends with messages similar to:

```text
All Apigee proxy bundles were scanned successfully.
Converted 108 ApigeeLint findings to gl-sast-report.json
```

The number of bundles and findings depends on the scanned project.

### Files that should not be committed

Add the following entries to the consumer project's `.gitignore` when
necessary:

```gitignore
node_modules/
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
apigeelint-security-plugins-*.tgz
```

The standalone package is intended for temporary local execution and should
not be added as a permanent project dependency.

## Scanner development

This section is intended for maintainers of the scanner and its custom
security plugins.

### Requirements

- Node.js 20 or later;
- npm;
- Bash or Git Bash;
- npm configured to use the corporate Artifactory registry.

Artifactory access is required to install the dependencies used to build the
scanner package. It is not required by consumers who install the standalone
`.tgz` package locally.

### Install dependencies

```bash
npm ci
```

### Run the complete test scan

```bash
npm run scan -- apiproxies
```

### Scan one test proxy

```bash
npm run scan -- \
  apiproxies/common/odm-shared-oauth2_server/apiproxy
```

### Validate the generated report

Verify that the generated report is valid JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8')); console.log('SAST report valid')"
```

Verify that the timestamps use the format required by the GitLab SAST schema:

```bash
node -e 'const r=require("./gl-sast-report.json"); const p=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/; if(!p.test(r.scan.start_time)||!p.test(r.scan.end_time)){console.error("Invalid GitLab timestamps");process.exit(1)} console.log("GitLab timestamps valid")'
```

Expected timestamp format:

```text
YYYY-MM-DDTHH:mm:ss
```

Example:

```text
2026-07-21T14:29:27
```

### Validate the package contents

Run:

```bash
npm run pack:check
```

The package must contain:

- the public CLI;
- the scanner script;
- the GitLab SAST converter;
- the custom security plugins;
- the README;
- the bundled runtime dependencies required for offline execution.

Test proxy bundles, CI configuration files and generated reports must not be
included in the package.

Because the runtime dependencies are bundled, the package contents contain
more files than a normal package without bundled dependencies.

### Generate the standalone package

```bash
npm pack
```

For version `0.2.1`, this generates:

```text
apigeelint-security-plugins-0.2.1.tgz
```

Verify that ApigeeLint is included in the package:

```bash
tar -tf apigeelint-security-plugins-0.2.1.tgz \
  | grep "node_modules/apigeelint/package.json"
```

Expected result:

```text
package/node_modules/apigeelint/package.json
```

### Validate offline installation

Create an isolated test directory:

```bash
cd "$HOME"
rm -rf apigeelint-offline-test
mkdir apigeelint-offline-test
cd apigeelint-offline-test
npm init -y
```

Remove any previous test cache and install the package with offline mode and
an empty cache:

```bash
rm -rf node_modules package-lock.json
rm -rf "$HOME/apigeelint-empty-cache"

npm install --offline \
  --cache "$HOME/apigeelint-empty-cache" \
  --no-save \
  --package-lock=false \
  "$HOME/apigeelint-security-plugins/apigeelint-security-plugins-0.2.1.tgz"
```

Run the packaged scanner against a directory containing test bundles:

```bash
./node_modules/.bin/apigeelint-security scan \
  "$HOME/consumer project/mybundles"
```

A successful installation with `--offline` and an empty cache confirms that
the standalone package contains every required runtime dependency.

The `test_npm_package` GitLab CI job performs the same type of isolated package
validation automatically.

### Main project files

```text
bin/apigeelint-security.js
    Public CLI entry point.

scripts/scan-all-apigee-proxies.sh
    Discovers and scans every apiproxy directory.

security-lint-plugins/
    Custom ApigeeLint security controls.

convert-apigeelint-to-gitlab-sast.js
    Converts ApigeeLint findings to GitLab SAST format.

ci/apigeelint-security.yml
    Reusable GitLab CI template for consumer projects.

apiproxies/
    Test bundles used only by the scanner project.

package.json
    npm package metadata, CLI declaration and bundled dependencies.

.gitlab-ci.yml
    Internal scanner validation pipeline.
```

### Native ApigeeLint exclusions

The scanner excludes a predefined set of native ApigeeLint rules by default.

These exclusions are maintained by the scanner project so that consumer
projects receive the same security control configuration.

## Release process

The scanner supports two distribution methods:

- GitLab CI installs the scanner directly from an immutable Git tag;
- local users install the standalone `.tgz` package.

The scanner is not published to the public npm registry.

Scanner versions are published as immutable Git tags.

### Publish a new version

To publish a new scanner version:

1. update the version in `package.json`;
2. update `package-lock.json`;
3. update the default version in `ci/apigeelint-security.yml`;
4. update all version examples in the README;
5. run the JavaScript and Bash syntax checks;
6. run the complete local test scan;
7. validate the generated SAST report;
8. run `npm run pack:check`;
9. generate the standalone package with `npm pack`;
10. verify that ApigeeLint is included in the `.tgz`;
11. verify that the package can be installed with `npm install --offline`;
12. commit and push the changes;
13. verify that both GitLab validation jobs succeed;
14. merge the branch;
15. create and push the corresponding Git tag;
16. make the generated standalone `.tgz` package available to local
    consumers.

The npm package version and Git tag must remain aligned:

```text
package.json version: 0.2.1
Git tag:              v0.2.1
Package:              apigeelint-security-plugins-0.2.1.tgz
```

Example:

```bash
git tag -a v0.2.1 -m "ApigeeLint security scanner v0.2.1"
git push origin v0.2.1
```

Generate the standalone package from the released version:

```bash
npm ci
npm pack
```

The generated release file is:

```text
apigeelint-security-plugins-0.2.1.tgz
```

Existing release tags must not be moved, replaced or reused.

Consumer projects should always reference a released version tag rather than
`main` or a development branch.

## Troubleshooting

### CI job token authentication is rejected

Confirm that the consumer project or its parent group is authorized in the
scanner project's:

```text
Settings > CI/CD > Job token permissions
```

Without this authorization, the consumer pipeline cannot install the scanner
package from its GitLab repository.

### No `apiproxy` directory is found

Verify the value of:

```text
APIGEE_PROXY_ROOT
```

It must point to an existing directory in the consumer repository.

The scanner then searches recursively below that directory for folders named
`apiproxy`.

For local execution, verify that the path passed to the CLI exists:

```bash
./node_modules/.bin/apigeelint-security scan mybundles
```

### CI npm installation fails

Verify that:

- the consumer project is authorized through the CI job token allowlist;
- the Artifactory configuration and credentials are available to the CI job;
- the internal npm registry is reachable from the GitLab runner;
- `APIGEELINT_SECURITY_REF` references an existing scanner tag.

### Local package installation fails

Verify that:

- Node.js 20 or later is installed;
- the `.tgz` path is correct;
- the package version exists;
- the complete standalone package was downloaded;
- the installation command uses the local `.tgz` file.

Example:

```bash
npm install --offline --no-save --package-lock=false \
  ./apigeelint-security-plugins-0.2.1.tgz
```

Verify that the package contains ApigeeLint:

```bash
tar -tf apigeelint-security-plugins-0.2.1.tgz \
  | grep "node_modules/apigeelint/package.json"
```

### The Security tab is empty

Verify that the scanner job generated and uploaded:

```text
gl-sast-report.json
```

Also check the job logs and the following artifacts:

```text
apigeelint-results.json
apigeelint-stderr.log
```

If GitLab reports a security report parsing error, verify that
`scan.start_time` and `scan.end_time` use this exact format:

```text
YYYY-MM-DDTHH:mm:ss
```

The values must not contain milliseconds or a trailing `Z`.

### The scanner version cannot be installed

Verify that the following values reference the same existing version:

```yaml
ref: 'v0.2.1'
```

```yaml
variables:
  APIGEELINT_SECURITY_REF: 'v0.2.1'
```

Also verify that the corresponding package version is:

```text
0.2.1
```