build_scanner_image:
  stage: build

  extends: .buildah:build

  variables:
    IMAGE_NAME: apigeelint-security-plugins
    BUILD_CONTEXT: .




include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

  - project: 'market-place/a100133/ci-cd/gitlab-ci-templates'
    ref: '0.16.4'
    file: 'buildah/buildah.yml'