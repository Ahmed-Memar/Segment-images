# ApigeeLint Security Scanner

This repository provides an Apigee security scanner based on
[ApigeeLint](https://github.com/apigee/apigeelint) and custom security plugins.

It recursively discovers Apigee proxy bundles, runs the security controls and
generates a GitLab SAST report.

## Consumer usage

### GitLab CI

GitLab CI is the recommended way to use the scanner.

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

If the root directory is not named `apiproxies`, update
`APIGEE_PROXY_ROOT` in `.gitlab-ci.yml`.

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

`ref` and `APIGEELINT_SECURITY_REF` must use the same scanner version.

### Configurable values

| Variable | Default | Description |
|---|---|---|
| `APIGEE_PROXY_ROOT` | `apiproxies` | Directory searched recursively for `apiproxy` bundles |
| `APIGEELINT_SECURITY_REF` | `v0.2.0` | Scanner package version installed by the CI job |
| `APIGEELINT_EXCLUDED_RULES` | Scanner defaults | Optional complete override of the native ApigeeLint exclusion list |

The scanner project path and CI template path are internal implementation
details and should not be changed by consumer projects.


### Generated reports

The CI job generates:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

`gl-sast-report.json` is published as a GitLab SAST report and its findings are
available in the pipeline Security tab.

ApigeeLint findings do not stop the scan. A job fails only when the scanner
cannot run or cannot generate a valid report.

## Optional local usage for consumers

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

The package must contain only the CLI, scanner script, converter, plugins and
README. Test bundles and CI files must not be packaged.

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

The scanner owns the default native ApigeeLint exclusion list.

Consumer projects normally should not change it. For exceptional cases, the
entire list can be overridden with:

```yaml
variables:
  APIGEELINT_EXCLUDED_RULES: "BN005,BN006,..."
```

This replaces the default list; it does not append rules to it.

## Release process

Scanner versions are immutable Git tags.

For a new release:

1. update the version in `package.json`;
2. update `package-lock.json`;
3. update the default version in `ci/apigeelint-security.yml`;
4. update the README examples;
5. run the local validation commands;
6. commit and push the changes;
7. confirm that the GitLab pipeline succeeds;
8. merge the branch;
9. create and push the matching Git tag.

Example:

```bash
git tag -a v0.2.0 -m "ApigeeLint security scanner v0.2.0"
git push origin v0.2.0
```

Consumer projects should always use a version tag and never `main` or a
development branch.