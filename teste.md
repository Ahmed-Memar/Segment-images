# ApigeeLint Security Plugins

This repository provides an Apigee security scanner based on
[ApigeeLint](https://github.com/apigee/apigeelint) and custom security rules.

The scanner is distributed as an executable npm package and consumed through a
reusable GitLab CI template.

## How it works

The reusable CI job:

1. installs a tagged version of this repository as an npm package;
2. recursively discovers every directory named `apiproxy`;
3. runs ApigeeLint with the custom security plugins;
4. merges the findings from all discovered bundles;
5. generates a GitLab SAST report.

Consumer projects do not need to copy the plugins, scripts or converter.

---

# Consumer projects

## Prerequisites

Before using the scanner:

- the consumer project must contain one or more Apigee proxy bundles;
- the scanner project must authorize the consumer project or its parent group
  in **Settings > CI/CD > Job token permissions**;
- the corporate Artifactory credentials used by the shared pipeline must be
  available to the job.

Do not store Artifactory credentials directly in the repository.

## GitLab CI configuration

Keep the existing corporate pipeline include and add the scanner template:

```yaml
include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - project: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
    ref: 'v0.1.0'
    file: '/ci/apigeelint-security.yml'

variables:
  # Fixed path of the scanner project.
  APIGEELINT_SECURITY_PROJECT_PATH: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'

  # Must match the tag used by the include above.
  APIGEELINT_SECURITY_REF: 'v0.1.0'

  # Directory under which Apigee proxy bundles are stored.
  APIGEE_PROXY_ROOT: 'apiproxies'
```

### Values that can be changed

| Value | Usage |
|---|---|
| Scanner `project` | Fixed. Do not change it. |
| Template `file` | Fixed. Do not change it. |
| `APIGEELINT_SECURITY_PROJECT_PATH` | Fixed. Do not change it. |
| `ref` | Change when adopting a newer scanner release. |
| `APIGEELINT_SECURITY_REF` | Change with `ref`; both values must be identical. |
| `APIGEE_PROXY_ROOT` | Change according to the consumer repository structure. |

The bundles do not need to follow a fixed structure below
`APIGEE_PROXY_ROOT`. The scanner searches recursively for directories named
`apiproxy`.

Example:

```text
repository/
├── .gitlab-ci.yml
└── apiproxies/
    ├── proxy-a/
    │   └── apiproxy/
    └── team/subdirectory/proxy-b/
        └── apiproxy/
```

## Generated results

The job produces:

- `gl-sast-report.json`: GitLab SAST report;
- `apigeelint-results.json`: merged raw ApigeeLint findings;
- `apigeelint-stderr.log`: technical ApigeeLint messages.

The findings are displayed in the GitLab pipeline **Security** tab.

A finding returned by ApigeeLint does not represent a technical execution
failure. The job fails only when the scanner cannot run or cannot generate a
valid report.

---

# Scanner development

This section is intended for maintainers of this repository.

## Requirements

- Node.js 20 or newer;
- npm;
- Bash, or Git Bash on Windows;
- npm configured to use the corporate Artifactory registry.

Corporate proxy and Artifactory configuration is environment-specific and
should follow the internal npm documentation.

## Install dependencies

```bash
npm ci
```

## Run the scanner locally

Scan all bundles under the default `apiproxies` directory:

```bash
npm run scan -- apiproxies
```

A different root directory can be provided:

```bash
npm run scan -- path/to/proxies
```

The command executes the packaged CLI:

```text
apigeelint-security scan [proxy-root]
```

## Validate the npm package

Check the files that will be included in the package:

```bash
npm run pack:check
```

The package must contain only the runtime files declared in `package.json`,
including:

- `bin/`;
- `scripts/`;
- `security-lint-plugins/`;
- `convert-apigeelint-to-gitlab-sast.js`;
- `README.md`.

The `test_npm_package` CI job also creates the package, installs it in an
isolated directory and runs it against the repository test bundles.

## Project structure

```text
apigeelint-security-plugins/
├── bin/
│   └── apigeelint-security.js
├── ci/
│   └── apigeelint-security.yml
├── scripts/
│   └── scan-all-apigee-proxies.sh
├── security-lint-plugins/
├── apiproxies/
├── convert-apigeelint-to-gitlab-sast.js
├── package.json
├── package-lock.json
└── README.md
```

### Main components

- `bin/apigeelint-security.js`  
  Public CLI entry point.

- `scripts/scan-all-apigee-proxies.sh`  
  Discovers and scans all Apigee bundles.

- `security-lint-plugins/`  
  Custom ApigeeLint security rules.

- `convert-apigeelint-to-gitlab-sast.js`  
  Converts the merged ApigeeLint results into GitLab SAST format.

- `ci/apigeelint-security.yml`  
  Reusable CI job imported by consumer projects.

## Optional rule exclusions

The scanner contains a default list of excluded native ApigeeLint rules.

Advanced consumers can replace that list through:

```yaml
variables:
  APIGEELINT_EXCLUDED_RULES: 'BN005,BN006,...'
```

Providing this variable replaces the complete default exclusion list.

---

# Releases

The package is installed directly from a GitLab tag. It is not published to a
public npm registry.

For a new release:

1. update the version in `package.json`;
2. update `package-lock.json`;
3. run the local scanner and package checks;
4. merge the changes;
5. create a matching Git tag such as `v0.2.0`;
6. update consumer projects when they are ready to adopt the new version.

The npm package version and Git tag must remain aligned:

```text
package.json version: 0.2.0
Git tag:              v0.2.0
```

Existing release tags must not be moved or reused.

---

# Troubleshooting

## CI job token authentication is rejected

Confirm that the consumer project or its parent group is present in the scanner
project's **CI/CD job token allowlist**.

## No `apiproxy` directory is found

Verify the value of:

```yaml
APIGEE_PROXY_ROOT
```

It must point to an existing directory in the consumer repository.

## npm installation fails

Verify that the Artifactory variables are available to the job and that the
internal npm registry is reachable from the runner.

## The Security tab is empty

Check that the job generated and uploaded:

```text
gl-sast-report.json
```