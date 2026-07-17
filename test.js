# Reusable GitLab CI template for the ApigeeLint security scanner.
#
# Consumer projects only need to:
#   1. include this file from an immutable Git tag;
#   2. define APIGEELINT_SECURITY_PROJECT_PATH;
#   3. optionally override APIGEE_PROXY_ROOT.
#
# The scanner generates a native GitLab SAST report without requiring the
# consumer repository to copy scanner code, plugins, or conversion scripts.

variables:
  # Directory in the consumer repository containing the Apigee proxy bundles.
  APIGEE_PROXY_ROOT: "apiproxies"

  # Immutable Git reference used to install the scanner package.
  APIGEELINT_SECURITY_REF: "v0.1.0"

  # Store downloaded npm packages inside the project workspace so GitLab can
  # cache them between pipelines.
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

apigeelint_security_sast:
  stage: test

  # Use the centrally available Node.js image already authorized by the shared
  # runners.
  image:
    name: "$CI_REGISTRY/node:25.8.1-yarn-v2"

  cache:
    # A different scanner version receives a separate dependency cache.
    key: "apigeelint-security-${APIGEELINT_SECURITY_REF}"
    paths:
      - .npm/

  before_script:
    # Validate variables required to download the scanner and dependencies.
    - |
      set -eu

      : "${APIGEELINT_SECURITY_PROJECT_PATH:?APIGEELINT_SECURITY_PROJECT_PATH is required}"
      : "${APIGEELINT_SECURITY_REF:?APIGEELINT_SECURITY_REF is required}"
      : "${ARTIFACTORY_PROD_USER:?ARTIFACTORY_PROD_USER is required}"
      : "${ARTIFACTORY_PROD_PASSWORD:?ARTIFACTORY_PROD_PASSWORD is required}"

    # Configure npm authentication for dependencies downloaded through the
    # internal Artifactory npm registry.
    - |
      AUTH_B64="$(
        printf '%s:%s' \
          "$ARTIFACTORY_PROD_USER" \
          "$ARTIFACTORY_PROD_PASSWORD" |
        base64 |
        tr -d '\n'
      )"

      cat > "$HOME/.npmrc" <<EOF
      registry=https://repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/
      //repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/:_auth=${AUTH_B64}
      strict-ssl=false
      EOF

      chmod 600 "$HOME/.npmrc"

  script:
    # Install the immutable scanner version directly from its GitLab project.
    # CI_JOB_TOKEN avoids distributing a permanent repository access token.
    - |
      npm install \
        --no-save \
        --no-audit \
        --no-fund \
        --prefer-offline \
        "git+https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${APIGEELINT_SECURITY_PROJECT_PATH}.git#${APIGEELINT_SECURITY_REF}"

    # Ensure that npm correctly exposed the packaged CLI executable.
    - test -x ./node_modules/.bin/apigeelint-security

    # Scan every Apigee bundle and generate gl-sast-report.json.
    - ./node_modules/.bin/apigeelint-security scan "$APIGEE_PROXY_ROOT"

    # Fail on a missing, empty, or invalid GitLab SAST report.
    - test -s gl-sast-report.json
    - node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8'))"

  artifacts:
    # Preserve diagnostic files even when a technical failure occurs.
    when: always

    reports:
      # Makes findings visible in GitLab's Security interface.
      sast: gl-sast-report.json

    paths:
      - apigeelint-results.json
      - apigeelint-stderr.log
      - gl-sast-report.json

    expire_in: 1 week