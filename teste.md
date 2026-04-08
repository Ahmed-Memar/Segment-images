## API Sensitivity Handling

Some security requirements depend on the sensitivity level of the API (S1, S2, S3, S4), as defined in the Security Matrix.

This information is not available in the Apigee proxy bundle and must be provided externally during the execution of the plugins.

### Environment Variable

The sensitivity level is provided via an environment variable injected by the CI/CD pipeline:

- **Name:** APIGEE_LINT_API_SENSITIVITY
- **Allowed values:** S1, S2, S3, S4

### Behavior

- If the variable is defined with a valid value:
  - The plugin applies the control according to the sensitivity level

- If the variable is not defined or has an invalid value:
  - A warning is generated
  - The sensitivity defaults to **S4** (most restrictive level)

### Rationale

This approach ensures:
- A secure default behavior
- Compatibility with different CI/CD environments
- No dependency on proxy configuration