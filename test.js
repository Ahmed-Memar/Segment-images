test_npm_package:
  stage: package

  script:
    # Configure npm authentication exactly like the existing job.
    - |
      AUTH_B64=$(printf "%s:%s" "$ARTIFACTORY_PROD_USER" "$ARTIFACTORY_PROD_PASSWORD" | base64 | tr -d '\n')

      cat > "$HOME/.npmrc" <<EOF
      registry=https://repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/
      //repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/:_auth=${AUTH_B64}
      always-auth=true
      strict-ssl=false
      EOF

    # Install dependencies and create the package tarball.
    - npm ci
    - npm pack

    # Install the generated package in an isolated directory.
    - mkdir package-consumer
    - cd package-consumer
    - npm init -y
    - npm install ../apigeelint-security-plugins-0.1.0.tgz

    # Run the packaged CLI against the repository test bundles.
    - npx apigeelint-security scan ../apiproxies

    # Validate the generated SAST report.
    - test -s gl-sast-report.json
    - node -e "JSON.parse(require('fs').readFileSync('gl-sast-report.json', 'utf8'))"

  artifacts:
    when: always
    paths:
      - apigeelint-security-plugins-0.1.0.tgz
      - package-consumer/apigeelint-results.json
      - package-consumer/apigeelint-stderr.log
      - package-consumer/gl-sast-report.json
    expire_in: 1 week







stages:
  - package
  - test