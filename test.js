## Summary

Packages the ApigeeLint security scanner as a reusable npm CLI and provides a shared GitLab CI template for consumer projects.

## Main changes

- added the `apigeelint-security` CLI;
- added recursive discovery of `apiproxy` bundles;
- packaged custom security plugins and the GitLab SAST converter;
- added the reusable CI template `ci/apigeelint-security.yml`;
- removed the abandoned Docker and Buildah implementation;
- updated the GitLab SAST report generation;
- fixed the GitLab timestamp format;
- updated the README and release documentation.

## Validation

- local scan completed successfully on 51 Apigee proxy bundles;
- npm package contents validated with `npm pack --dry-run`;
- scanner project pipeline succeeded;
- package tested from tag `v0.2.0`;
- consumer project pipeline succeeded;
- GitLab accepted the generated SAST report;
- 362 vulnerabilities are displayed in the consumer project's Security tab.