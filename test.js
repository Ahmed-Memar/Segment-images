publish_release:
  stage: release

  # Download only the package validated by test_npm_package.
  dependencies:
    - test_npm_package

  # Publish only semantic version tags such as v0.2.1.
  rules:
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/'

  script:
    - |
      set -eu

      PACKAGE_NAME="apigeelint-security-plugins"
      PACKAGE_VERSION="${CI_COMMIT_TAG#v}"
      PACKAGE_FILE="$(cat package-tarball-name.txt)"
      EXPECTED_FILE="${PACKAGE_NAME}-${PACKAGE_VERSION}.tgz"

      echo "Release tag: ${CI_COMMIT_TAG}"
      echo "Package version: ${PACKAGE_VERSION}"
      echo "Package file: ${PACKAGE_FILE}"

      if [ "${PACKAGE_FILE}" != "${EXPECTED_FILE}" ]; then
        echo "ERROR: expected ${EXPECTED_FILE}, but found ${PACKAGE_FILE}."
        exit 1
      fi

      if [ ! -s "${PACKAGE_FILE}" ]; then
        echo "ERROR: package file ${PACKAGE_FILE} is missing or empty."
        exit 1
      fi

      export PACKAGE_NAME
      export PACKAGE_VERSION
      export PACKAGE_FILE

      node <<'NODE'
      const fs = require("fs");

      const {
        CI_API_V4_URL,
        CI_PROJECT_ID,
        CI_JOB_TOKEN,
        CI_COMMIT_TAG,
        PACKAGE_NAME,
        PACKAGE_VERSION,
        PACKAGE_FILE
      } = process.env;

      const packageUrl =
        `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}` +
        `/packages/generic/${PACKAGE_NAME}/${PACKAGE_VERSION}/${PACKAGE_FILE}`;

      async function request(url, options) {
        const response = await fetch(url, options);
        const responseBody = await response.text();

        if (!response.ok) {
          throw new Error(
            `${options.method} ${url} failed: ` +
            `${response.status} ${responseBody}`
          );
        }

        return responseBody;
      }

      async function main() {
        console.log(`Publishing ${PACKAGE_FILE} to the Package Registry...`);

        await request(packageUrl, {
          method: "PUT",
          headers: {
            "JOB-TOKEN": CI_JOB_TOKEN,
            "Content-Type": "application/octet-stream"
          },
          body: fs.readFileSync(PACKAGE_FILE)
        });

        console.log(`Creating GitLab Release ${CI_COMMIT_TAG}...`);

        const releaseBody = {
          name: `ApigeeLint Security Scanner ${CI_COMMIT_TAG}`,
          tag_name: CI_COMMIT_TAG,
          description:
            "Standalone ApigeeLint Security Scanner package " +
            "for local offline execution.",
          assets: {
            links: [
              {
                name: PACKAGE_FILE,
                url: packageUrl,
                direct_asset_path: `/${PACKAGE_FILE}`,
                link_type: "package"
              }
            ]
          }
        };

        await request(
          `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/releases`,
          {
            method: "POST",
            headers: {
              "JOB-TOKEN": CI_JOB_TOKEN,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(releaseBody)
          }
        );

        console.log(`Release ${CI_COMMIT_TAG} created successfully.`);
        console.log(`Published package: ${packageUrl}`);
      }

      main().catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
      NODE