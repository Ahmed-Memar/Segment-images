| Matrix column name | Verifiable from API proxy only? | How? | Automate? | Why? |
|-------------------|----------------------------------|-------|-----------|-------|
| Credential type | Partial | Detect OAuth/JWT/authentication mechanisms used toward backend. | No | The bundle provides indicators but cannot reliably prove which credential type is required or effectively used. |
| Grant OAuth2 | Partial | Detect OAuth token exchange policies if present. | No | Trust-boundary decisions are business-dependent and cannot be inferred from the bundle alone. |
| Access token type | Partial | Detect JWT generation or token propagation toward backend. | No | The actual token format sent to the backend cannot always be reliably determined. |
| TLS | Yes | Verify HTTPS TargetEndpoint and SSLInfo configuration. | Yes | Backend TLS configuration is explicitly visible in the proxy bundle. |
| API / Backend authentication | Partial | Detect backend authentication mechanisms (OAuth, BasicAuth, JWT, etc.). | No | Presence of authentication-related configuration does not reliably prove enforcement or correctness. |