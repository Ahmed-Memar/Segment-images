include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - local: '/ci/apigeelint-security.yml'








variables:
  # Path of the repository containing the npm scanner package.
  APIGEELINT_SECURITY_PROJECT_PATH: "$CI_PROJECT_PATH"

  # During development, install the exact commit being tested.
  APIGEELINT_SECURITY_REF: "$CI_COMMIT_SHA"

  # Test bundles contained in this repository.
  APIGEE_PROXY_ROOT: "apiproxies"










include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - local: '/ci/apigeelint-security.yml'

variables:
  APIGEELINT_SECURITY_PROJECT_PATH: "$CI_PROJECT_PATH"
  APIGEELINT_SECURITY_REF: "$CI_COMMIT_SHA"
  APIGEE_PROXY_ROOT: "apiproxies"

stages:
  - package
  - test