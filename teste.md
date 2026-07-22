# ApigeeLint Security Scanner

This repository provides an Apigee security scanner based on
[ApigeeLint](https://github.com/apigee/apigeelint) and custom security plugins.

The scanner recursively discovers directories named `apiproxy`, runs the
security controls and generates a GitLab SAST report.

## Consumer usage

Two execution modes are available:

1. GitLab CI, which is the recommended method;
2. local execution with the standalone package.

## GitLab CI — Recommended

### Prerequisites

The consumer repository must contain one or more Apigee proxy bundles.

The consumer project or its parent group must also be authorized in the
scanner project's:

```text
Settings > CI/CD > Job token permissions
```

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


### Generated reports

The scanner generates:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

- `apigeelint-results.json` contains the merged ApigeeLint findings;
- `apigeelint-stderr.log` contains technical messages generated during the
  scan;
- `gl-sast-report.json` contains the findings converted to GitLab SAST format. Then it is published as a GitLab SAST report. 

After the pipeline completes, open its **Security** tab to review the
findings.

ApigeeLint findings do not fail the CI job. The job fails only when the
scanner cannot run or cannot generate a valid report.

## Local execution — Optional

Local execution can be used to scan proxies before pushing changes.

The standalone package already contains ApigeeLint and its runtime
dependencies. No npm registry, Artifactory configuration or `.npmrc` file is
required.

### Requirements

- Node.js 20 or later;
- Bash or Git Bash;
- access to the ApigeeLint Security Scanner project in GitLab.

### Obtain the standalone package

For each released scanner version, a standalone `.tgz` package is published
with the corresponding GitLab release.

To obtain version `v0.2.1`:

1. open the ApigeeLint Security Scanner project in GitLab:

   ```text
   gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins
   ```

2. go to **Deploy > Releases**;
3. open release `v0.2.1`;
4. download:

   ```text
   apigeelint-security-plugins-0.2.1.tgz
   ```

5. copy the downloaded file to the root of the consumer project.

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

Access to GitLab is required only to download the package. After the package
has been downloaded, installation and scanner execution do not require an npm
registry, Artifactory configuration or a `.npmrc` file.

### Install the scanner

From the consumer project directory:

```bash
npm install --offline --no-save --package-lock=false \
  ./apigeelint-security-plugins-0.2.1.tgz
```

### Scan multiple proxies

```bash
./node_modules/.bin/apigeelint-security scan mybundles
```

The scanner recursively discovers and scans every directory named
`apiproxy`.

### Scan one proxy

```bash
./node_modules/.bin/apigeelint-security scan \
  path/to/my-proxy/apiproxy
```

The reports are generated in the current working directory:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

An individual `ApigeeLint exit code: 1` means that findings were detected. It
does not mean that the complete scanner execution failed.

### Files not to commit

Add these entries to the consumer project's `.gitignore` when necessary:

```gitignore
node_modules/
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
apigeelint-security-plugins-*.tgz
```

## Scanner development

This section is intended for scanner maintainers.

### Requirements

- Node.js 20 or later;
- npm;
- Bash or Git Bash;
- access to the corporate npm Artifactory.

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
  path/to/my-proxy/apiproxy
```

### Validate the package

```bash
npm run pack:check
```

The package must contain:

- the public CLI;
- the scanner script;
- the GitLab SAST converter;
- the custom security plugins;
- the bundled runtime dependencies.

Test bundles, CI files and generated reports must not be packaged.

### Generate the standalone package

```bash
npm pack
```

For version `0.2.1`, the generated package is:

```text
apigeelint-security-plugins-0.2.1.tgz
```

Verify that ApigeeLint is bundled:

```bash
tar -tf apigeelint-security-plugins-0.2.1.tgz \
  | grep "node_modules/apigeelint/package.json"
```

Expected result:

```text
package/node_modules/apigeelint/package.json
```

The GitLab `test_npm_package` job also installs and executes the generated
package in an isolated directory.

## Main project files

```text
bin/apigeelint-security.js
    Public CLI entry point.

scripts/scan-all-apigee-proxies.sh
    Discovers and scans apiproxy directories.

security-lint-plugins/
    Custom security controls.

convert-apigeelint-to-gitlab-sast.js
    Converts findings to GitLab SAST format.

ci/apigeelint-security.yml
    Reusable CI template for consumer projects.

apiproxies/
    Test bundles used by the scanner project.
```

## Release process

Scanner versions are distributed through immutable Git tags.

The Git tag, npm package version and standalone package must remain aligned:

```text
package.json: 0.2.1
Git tag:      v0.2.1
Package:      apigeelint-security-plugins-0.2.1.tgz
```

To publish a new version:

1. update `package.json` and `package-lock.json`;
2. update the default version in `ci/apigeelint-security.yml`;
3. update the README examples;
4. run the local scan and package validations;
5. commit and push the changes;
6. verify that the GitLab pipeline succeeds;
7. merge the branch and create the corresponding Git tag;
8. generate and provide the standalone `.tgz` package.

Example:

```bash
git tag -a v0.2.1 -m "ApigeeLint security scanner v0.2.1"
git push origin v0.2.1
```

Existing release tags must not be moved or reused.

Consumer projects should always reference a released tag rather than `main`
or a development branch.

## Troubleshooting

### CI authentication is rejected

Confirm that the consumer project or its parent group is authorized in:

```text
Settings > CI/CD > Job token permissions
```

### No proxy is found

Verify that `APIGEE_PROXY_ROOT` points to an existing directory containing one
or more directories named `apiproxy`.

For local execution, verify the path passed to the command:

```bash
./node_modules/.bin/apigeelint-security scan mybundles
```

### The Security tab is empty

Verify that the scanner job generated and uploaded:

```text
gl-sast-report.json
```

Also check:

```text
apigeelint-results.json
apigeelint-stderr.log
```

### The scanner version cannot be installed

Verify that both values reference the same existing tag:

```yaml
ref: 'v0.2.1'

variables:
  APIGEELINT_SECURITY_REF: 'v0.2.1'
```

### Local installation fails

Verify that:

- Node.js 20 or later is installed;
- the `.tgz` file exists at the provided path;
- the complete standalone package was downloaded.

```bash
npm install --offline --no-save --package-lock=false \
  ./apigeelint-security-plugins-0.2.1.tgz
```