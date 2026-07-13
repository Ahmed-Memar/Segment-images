# Use the BNP internal Node.js image already accepted by the pipeline.
ARG CI_REGISTRY
FROM ${CI_REGISTRY}/node:25.8.1-yarn-v2

# Scanner source code and dependencies are stored here.
WORKDIR /opt/apigeelint-security

# Copy dependency descriptors first to improve build cache reuse.
COPY package.json package-lock.json ./

# Configure npm authentication during the image build.
ARG ARTIFACTORY_PROD_USER
ARG ARTIFACTORY_PROD_PASSWORD

RUN AUTH_B64="$(printf '%s:%s' \
        "$ARTIFACTORY_PROD_USER" \
        "$ARTIFACTORY_PROD_PASSWORD" | base64 | tr -d '\n')" \
    && printf '%s\n' \
        "registry=https://repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/" \
        "//repo.artifactory-dogen.group.echonet/artifactory/api/npm/registry.npmjs.org/:_auth=${AUTH_B64}" \
        "always-auth=true" \
        "strict-ssl=false" \
        > /root/.npmrc \
    && npm ci \
    && rm -f /root/.npmrc \
    && npm cache clean --force

# Copy the scanner implementation.
COPY security-lint-plugins/ ./security-lint-plugins/
COPY scripts/ ./scripts/
COPY convert-apigeelint-to-gitlab-sast.js ./

# Ensure the execution script can be run.
RUN chmod +x scripts/run-all-apiproxies.sh

# Consumer projects will be mounted in this directory.
WORKDIR /workspace

# Execute the scanner when the container starts.
ENTRYPOINT ["/opt/apigeelint-security/scripts/run-all-apiproxies.sh"]








.git
.gitignore
.gitlab-ci.yml

node_modules

apiproxies

apigeelint-results.json
apigeelint-stderr.log
gl-sast-report.json

README.md