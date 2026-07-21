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

### 1. GitLab CI — Recommended

#### Prerequisites

Before using the scanner:

- the consumer project must contain one or more Apigee proxy bundles;
- the scanner project must authorize the consumer project or its parent group
  in **Settings > CI/CD > Job token permissions**;
- the corporate Artifactory configuration and credentials used by the shared
  pipeline must be available to the CI job.

The scanner package is installed directly from its GitLab repository.
Therefore, the CI job token allowlist must be configured before the consumer
pipeline can install and execute the scanner.

The scanner expects a repository structure similar to the following:

```text
consumer-project/
├── .gitlab-ci.yml
└── apiproxies/
    ├── proxy1/
    │   └── apiproxy/
    └── proxy2/
        └── apiproxy/
```

The scanner searches recursively for directories named `apiproxy`, so a
consumer repository can contain one or several proxies under the same root
directory.

Add the following configuration to the consumer project's `.gitlab-ci.yml`:

```yaml
include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - project: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
    ref: 'v0.2.0'
    file: '/ci/apigeelint-security.yml'

variables:
  APIGEELINT_SECURITY_REF: 'v0.2.0'
  APIGEE_PROXY_ROOT: 'apiproxies'
```

If the root directory is not named `apiproxies`, update
`APIGEE_PROXY_ROOT` accordingly.

`ref` and `APIGEELINT_SECURITY_REF` must use the same scanner version.

#### Configurable values

| Variable | Default | Description |
|---|---|---|
| `APIGEE_PROXY_ROOT` | `apiproxies` | Root directory searched recursively for `apiproxy` bundles. |
| `APIGEELINT_SECURITY_REF` | `v0.2.0` | Version of the scanner package installed by the CI job. |

#### Generated reports

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

### 2. Local execution — Optional

Local execution can be used to check a proxy before pushing changes.

Requirements:

- Node.js 20 or later;
- npm access through the corporate Artifactory;
- Bash or Git Bash;
- read access to the scanner GitLab project.

Install a specific scanner version from GitLab:

```bash
npm install --no-save \
  "git+https://gitlab-homol-plus.staging.echonet/gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins.git#v0.2.0"
```

Scan every proxy under a directory:

```bash
./node_modules/.bin/apigeelint-security scan apiproxies
```

Scan proxies stored elsewhere:

```bash
./node_modules/.bin/apigeelint-security scan path/to/proxies
```

Scan one specific proxy:

```bash
./node_modules/.bin/apigeelint-security scan \
  path/to/my-proxy/apiproxy
```

The scanner recursively searches the provided path for directories named
`apiproxy`.

Do not commit `node_modules` or add the scanner as a permanent dependency of
the consumer project.

## Scanner development

This section is intended for maintainers of the scanner and its security
plugins.

### Requirements

- Node.js 20 or later;
- npm;
- Bash or Git Bash;
- npm configured to use the corporate Artifactory registry.

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

```bash
node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8')); console.log('SAST report valid')"
```

### Validate the package contents

```bash
npm run pack:check
```

The package must contain only the runtime files declared in `package.json`,
including the CLI, scanner script, converter, plugins and README.

Test bundles and CI files must not be included in the npm package.

The package validation CI job creates the package, installs it in an isolated
directory and executes it against the repository test bundles.

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
```

### Native ApigeeLint exclusions

The scanner excludes a predefined set of native ApigeeLint rules by default.

## Release process

The package is installed directly from a GitLab tag. It is not published to a
public npm registry.

Scanner versions are published as immutable Git tags.

To publish a new scanner version:

1. set the scanner version in `package.json`;
2. update `package-lock.json`;
3. set the default version in `ci/apigeelint-security.yml`;
4. update the README if required;
5. run the validation commands;
6. commit and push the changes;
7. verify that the GitLab pipeline succeeds;
8. merge the branch;
9. create and push the corresponding Git tag.

The npm package version and Git tag must remain aligned:

```text
package.json version: 0.2.0
Git tag:              v0.2.0
```

Example:

```bash
git tag -a v0.2.0 -m "ApigeeLint security scanner v0.2.0"
git push origin v0.2.0
```

Existing release tags must not be moved or reused.

Consumer projects should always reference a released version tag rather than
`main` or a development branch.

## Troubleshooting

### CI job token authentication is rejected

Confirm that the consumer project or its parent group is authorized in the
scanner project's **Settings > CI/CD > Job token permissions**.

Without this authorization, the consumer pipeline cannot install the scanner
package from its GitLab repository.

### No `apiproxy` directory is found

Verify the value of:

```yaml
APIGEE_PROXY_ROOT
```

It must point to an existing directory in the consumer repository. The scanner
then searches recursively below that directory for folders named `apiproxy`.

### npm installation fails

Verify that:

- the consumer project is authorized through the CI job token allowlist;
- the Artifactory configuration and credentials are available to the job;
- the internal npm registry is reachable from the GitLab runner;
- `APIGEELINT_SECURITY_REF` references an existing scanner tag.

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

### The scanner version cannot be installed

Verify that the following values reference the same existing version:

```yaml
ref: 'v0.2.0'

variables:
  APIGEELINT_SECURITY_REF: 'v0.2.0'
```