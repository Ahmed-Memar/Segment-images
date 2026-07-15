include:
  - project: 'Production-mutualisee/IPS/IDO/gitlab-cicd/pipelines'
    file: '.gitlab-ci.yml'

stages:
  - build
  - test

build_scanner_image:
  stage: build

  image:
    name: fr2.icr.io/a100133-hprd/builder:latest
    pull_policy: always

  tags:
    - a100133-buildah

  variables:
    BUILDAH_ISOLATION: chroot
    STORAGE_DRIVER: vfs

  script:
    - buildah --version

    - |
      buildah bud \
        --file Dockerfile \
        --tag apigeelint-security-plugins:$CI_COMMIT_SHORT_SHA \
        --build-arg CI_REGISTRY="$CI_REGISTRY" \
        --build-arg ARTIFACTORY_PROD_USER="$ARTIFACTORY_PROD_USER" \
        --build-arg ARTIFACTORY_PROD_PASSWORD="$ARTIFACTORY_PROD_PASSWORD" \
        .

    - buildah images

  rules:
    - if: '$CI_COMMIT_BRANCH == "docker-runtime"'

default:
  image: $CI_REGISTRY/node:25.8.1-yarn-v2

test_pipeline:
  stage: test