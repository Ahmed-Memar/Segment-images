build_scanner_image:
  stage: build

  image:
    name: image-registry.openshift-image-registry.svc:5000/ns001b004551/buildah:0.2-beta

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