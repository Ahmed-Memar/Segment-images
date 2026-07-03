script:
  - echo "Pipeline is running"
  - node --version
  - npm --version
  - |
    AUTH_B64=$(printf "%s:%s" "$ARTIFACTORY_PROD_USER" "$ARTIFACTORY_PROD_PASSWORD" | base64 | tr -d '\n')

    cat > "$HOME/.npmrc" <<EOF
    registry=https://repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/
    //repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/:_auth=${AUTH_B64}
    always-auth=true
    strict-ssl=false
    EOF

  - npm install
  - npx apigeelint --version