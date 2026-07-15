stages:
  - build
  - test





build_scanner_image:
  stage: build

  # Internal BNP image containing Buildah.
  image:
    name: $CI_REGISTRY/buildah:0.2-beta

  variables:
    # Configuration recommended for rootless Buildah.
    BUILDAH_ISOLATION: chroot
    STORAGE_DRIVER: vfs

  script:
    # Display the Buildah version.
    - buildah --version

    # Build the ApigeeLint security scanner image.
    - |
      buildah bud \
        --file Dockerfile \
        --tag apigeelint-security:$CI_COMMIT_SHORT_SHA \
        --build-arg CI_REGISTRY="$CI_REGISTRY" \
        --build-arg ARTIFACTORY_PROD_USER="$ARTIFACTORY_PROD_USER" \
        --build-arg ARTIFACTORY_PROD_PASSWORD="$ARTIFACTORY_PROD_PASSWORD" \
        .

    # Confirm that the image was created.
    - buildah images

  rules:
    - if: '$CI_COMMIT_BRANCH == "docker-runtime"'