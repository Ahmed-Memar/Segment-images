Introduce GitLab CI pipeline with automatic proxy scanning and SAST reporting

## Summary

Introduce a reusable GitLab CI pipeline to automate Apigee security scanning.

### Changes
- Add a GitLab CI pipeline for security analysis.
- Run ApigeeLint with custom security plugins.
- Automatically discover and scan all Apigee proxy bundles.
- Generate GitLab SAST reports.
- Publish analysis artifacts for GitLab Security.