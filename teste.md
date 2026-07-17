# ApigeeLint Security Plugins

Security scanner for Apigee proxy bundles based on
[ApigeeLint](https://github.com/apigee/apigeelint) and custom security rules.

The scanner:

- discovers every `apiproxy` directory under a configured root directory;
- runs the custom security plugins on each proxy bundle;
- merges all ApigeeLint findings;
- converts the results to the GitLab SAST format;
- publishes the findings in the GitLab **Security** tab.

The recommended integration is the reusable GitLab CI template provided by this
repository.

---

## Architecture

The repository provides two reusable elements:

1. An npm CLI package named `apigeelint-security-plugins`.
2. A GitLab CI template located at:

```text
/ci/apigeelint-security.yml
```

The CLI command exposed by the package is:

```bash
apigeelint-security scan <proxy-root>
```

Example:

```bash
apigeelint-security scan apiproxies
```

The command generates the following files in the current directory:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

---

## Recommended usage in a consumer project

A consumer repository only needs:

- its Apigee proxy bundles;
- a `.gitlab-ci.yml` file including the reusable scanner template.

Example repository structure:

```text
consumer-project/
├── apiproxies/
│   ├── proxy-one/
│   │   └── apiproxy/
│   └── proxy-two/
│       └── apiproxy/
└── .gitlab-ci.yml
```

The scanner searches recursively, so the bundles can be organized in
subdirectories as long as each bundle contains an `apiproxy` directory.

### Consumer `.gitlab-ci.yml`

```yaml
include:
  # Shared CI configuration used by the organization.
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  # Reusable ApigeeLint Security scanner.
  - project: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
    ref: 'v0.1.0'
    file: '/ci/apigeelint-security.yml'

variables:
  # Repository containing the scanner npm package.
  APIGEELINT_SECURITY_PROJECT_PATH: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'

  # Immutable scanner version.
  APIGEELINT_SECURITY_REF: 'v0.1.0'

  # Directory containing the Apigee bundles in the consumer repository.
  APIGEE_PROXY_ROOT: 'apiproxies'
```

After the pipeline starts, the template automatically:

1. uses the approved Node.js CI image;
2. configures npm access to the internal registry;
3. installs the scanner from the requested Git tag;
4. scans all bundles under `APIGEE_PROXY_ROOT`;
5. validates the generated JSON report;
6. uploads the GitLab SAST report and debugging artifacts.

The consumer project does not need to copy the plugins, scripts or converter.

---

## Configuration variables

### `APIGEE_PROXY_ROOT`

Root directory containing the Apigee proxy bundles.

Default:

```yaml
APIGEE_PROXY_ROOT: 'apiproxies'
```

Example for bundles stored under `src/apis`:

```yaml
variables:
  APIGEE_PROXY_ROOT: 'src/apis'
```

The scanner recursively finds every directory named `apiproxy`.

---

### `APIGEELINT_SECURITY_REF`

Git tag or Git reference containing the scanner version to install.

Recommended value:

```yaml
APIGEELINT_SECURITY_REF: 'v0.1.0'
```

Consumer projects should use a stable tag instead of a development branch to
keep pipeline executions reproducible.

---

### `APIGEELINT_SECURITY_PROJECT_PATH`

Full GitLab path of the scanner repository.

```yaml
APIGEELINT_SECURITY_PROJECT_PATH: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
```

---

## GitLab access requirement

The scanner package is installed from this private GitLab repository with the
consumer pipeline's `CI_JOB_TOKEN`.

The consumer project must therefore be present in the scanner repository's
CI/CD job token allowlist.

Scanner project configuration:

```text
Settings
└── CI/CD
    └── Job token permissions
        └── CI/CD job token allowlist
```

Without this authorization, the installation fails with a message similar to:

```text
Authentication by CI/CD job token not allowed
```

No personal access token must be stored in the consumer project for this
integration.

---

## Pipeline result

The reusable job is named:

```text
apigeelint_security_sast
```

A successful execution produces:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

### `apigeelint-results.json`

Raw merged ApigeeLint findings for every discovered proxy bundle.

### `apigeelint-stderr.log`

Technical messages produced by ApigeeLint. This file is useful when a scan
cannot generate a valid report.

### `gl-sast-report.json`

Findings converted to the GitLab SAST report format.

GitLab displays these findings under:

```text
Pipeline
└── Security
```

Each finding contains, when available:

- the custom rule identifier;
- the severity;
- the security message;
- the affected file;
- the line number;
- a stable finding identifier.

---

## Important pipeline behavior

An ApigeeLint exit code caused by security findings does not stop the scan.

The scanner continues so it can:

- scan every proxy bundle;
- merge all findings;
- generate the final GitLab SAST report.

The job fails only when a technical problem prevents the scan from producing a
valid report, for example:

- no `apiproxy` directory is found;
- ApigeeLint cannot be started;
- a generated JSON report is missing or empty;
- a generated JSON report is invalid;
- the SAST conversion fails.

This distinction allows findings to be displayed in GitLab without treating
their presence as an execution failure.

---

## Local usage for scanner development

Local execution requires:

- Node.js 20 or later;
- npm;
- Bash.

Install the project dependencies:

```bash
npm install
```

Scan all test bundles stored under `apiproxies`:

```bash
./node_modules/.bin/apigeelint-security scan apiproxies
```

Alternatively:

```bash
npx apigeelint-security scan apiproxies
```

The command generates:

```text
apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json
```

Validate that the SAST report is valid JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8'))"
```

---

## Package validation

Before creating a new release, verify which files will be included in the npm
package:

```bash
npm run pack:check
```

Create the package tarball:

```bash
npm pack
```

The package contains only the files declared in the `files` property of
`package.json`, including:

```text
bin/
scripts/
security-lint-plugins/
convert-apigeelint-to-gitlab-sast.js
README.md
```

The test bundles under `apiproxies` are not distributed to consumer projects.

---

## Repository structure

```text
apigeelint-security-plugins/
├── apiproxies/
│   └── Test bundles used by this repository
├── bin/
│   └── apigeelint-security.js
├── ci/
│   └── apigeelint-security.yml
├── scripts/
│   └── run-all-apiproxies.sh
├── security-lint-plugins/
│   ├── Custom ApigeeLint security rules
│   └── lib/
│       └── Shared plugin utilities
├── convert-apigeelint-to-gitlab-sast.js
├── package.json
├── package-lock.json
└── README.md
```

### `bin/apigeelint-security.js`

Public CLI entry point installed by npm.

It:

1. validates the `scan` command;
2. resolves the requested proxy root;
3. starts the multi-bundle scan;
4. converts the merged results to GitLab SAST.

### `scripts/run-all-apiproxies.sh`

Discovers all `apiproxy` directories, executes ApigeeLint for each bundle and
merges the generated reports.

### `security-lint-plugins/`

Contains the custom security-oriented ApigeeLint rules.

### `convert-apigeelint-to-gitlab-sast.js`

Converts the merged ApigeeLint JSON report into a GitLab-compatible SAST
report.

### `ci/apigeelint-security.yml`

Reusable GitLab CI template consumed by Apigee repositories.

---

## Versioning

The scanner follows semantic versioning.

Example:

```text
v0.1.0
```

A consumer pipeline should reference the same version in both locations:

```yaml
include:
  - project: 'gf/ITG-ITRMG/CDF-EXI-AppSec/appsec-tools/apigeelint-security-plugins'
    ref: 'v0.1.0'
    file: '/ci/apigeelint-security.yml'

variables:
  APIGEELINT_SECURITY_REF: 'v0.1.0'
```

This ensures that the CI template and the installed scanner package come from
the same release.

When creating a new release:

1. update the package version;
2. update `package-lock.json`;
3. update the default scanner version in the CI template;
4. run the package and pipeline tests;
5. commit the changes;
6. create and push the corresponding Git tag.

Example:

```bash
git tag -a v0.2.0 -m "ApigeeLint security scanner v0.2.0"
git push origin v0.2.0
```

Existing consumer projects remain on their current version until they
explicitly update their tag.

---

## Troubleshooting

### No `apiproxy` directory found

Example:

```text
No apiproxy directory found under: apiproxies
```

Verify that:

- `APIGEE_PROXY_ROOT` points to the correct directory;
- the bundles were committed to the consumer repository;
- each bundle contains a directory named exactly `apiproxy`.

---

### CI job token authentication is rejected

Example:

```text
Authentication by CI/CD job token not allowed
```

Add the consumer project to the scanner repository's CI/CD job token allowlist.

---

### Scanner installation fails

Check that:

- `APIGEELINT_SECURITY_PROJECT_PATH` is correct;
- `APIGEELINT_SECURITY_REF` exists;
- the consumer project can access the scanner repository;
- the Git tag contains `package.json` and the CLI files.

---

### SAST report is missing

Check the `apigeelint-stderr.log` artifact.

A missing report generally means that:

- ApigeeLint could not process a bundle;
- the raw report was not generated;
- the raw report contained invalid JSON;
- the conversion script failed.

---

### npm cache does not exist

On the first pipeline execution, GitLab may display:

```text
WARNING: file does not exist
Failed to extract cache
```

This is expected when no cache has been created yet.

The cache is generated after the first successful execution and reused by
later pipelines for the same scanner version.

---

## Current release

```text
v0.1.0
```

This release provides:

- reusable installation from a Git tag;
- recursive discovery of Apigee bundles;
- custom security plugin execution;
- merged ApigeeLint results;
- GitLab SAST conversion;
- stable finding identifiers;
- reusable GitLab CI integration;
- npm dependency caching;
- raw debugging artifacts.