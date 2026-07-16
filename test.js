variables:
  # Directory containing the Apigee proxy bundles.
  APIGEE_PROXY_ROOT: "apiproxies"

  # Stable scanner version used by consumer projects.
  APIGEELINT_SECURITY_REF: "v0.1.0"

  # Use a project-local npm cache.
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

apigeelint_security_sast:
  stage: test

  image:
    name: $CI_REGISTRY/node:25.8.1-yarn-v2

  cache:
    key: "apigeelint-security-${APIGEELINT_SECURITY_REF}"
    paths:
      - .npm/

  before_script:
    # Configure access to the internal npm registry.
    - |
      AUTH_B64=$(printf "%s:%s" \
        "$ARTIFACTORY_PROD_USER" \
        "$ARTIFACTORY_PROD_PASSWORD" \
        | base64 | tr -d '\n')

      cat > "$HOME/.npmrc" <<EOF
      registry=https://repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/
      //repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/:_auth=${AUTH_B64}
      always-auth=true
      strict-ssl=false
      EOF

  script:
    # Install the requested scanner version directly from GitLab.
    - |
      npm install --no-save \
        "git+https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/${APIGEELINT_SECURITY_PROJECT_PATH}.git#${APIGEELINT_SECURITY_REF}"

    # Ensure that the packaged CLI was installed locally.
    - test -x ./node_modules/.bin/apigeelint-security

    # Scan all Apigee bundles and generate the GitLab SAST report.
    - ./node_modules/.bin/apigeelint-security scan "$APIGEE_PROXY_ROOT"

    # Validate the generated report.
    - test -s gl-sast-report.json
    - node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8'))"

  artifacts:
    when: always

    reports:
      sast: gl-sast-report.json

    paths:
      - apigeelint-results.json
      - apigeelint-stderr.log
      - gl-sast-report.json

    expire_in: 1 week