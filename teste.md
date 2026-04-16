## VerifyJWT Parameters Analysis (Access Token Control)

| Parameter | Decision & Enforcement | Accepted Values / Rule | Justification |
|----------|------------------------|------------------------|---------------|
| **Algorithm (`<Algorithm>`)** | Required (**ERROR**) | Must be present. Reject `none`. Prefer strong algorithms (RS256, ES256, PS256). | Defines how the JWT signature is verified. Without it, signature validation is unreliable and vulnerable to algorithm confusion attacks. |
| **Key (`<PublicKey>` / `<SecretKey>`)** | Required (**ERROR**) | Must be present and consistent with Algorithm: HS* → SecretKey, RS*/PS*/ES* → PublicKey (Value, Certificate, or JWKS). | Without a key, no cryptographic verification is performed. Ensures the token is actually signed by a trusted authority. |
| **Issuer (`<Issuer>`)** | Recommended (**WARNING**) | Should be present and non-empty. | Ensures the token is issued by a trusted Identity Provider and prevents accepting tokens from unintended sources. |
| **Audience (`<Audience>`)** | Recommended (**WARNING**) | Should be present and contain the expected API audience. | Prevents token reuse across different APIs (token confusion attack). |
| **IgnoreUnresolvedVariables (`<IgnoreUnresolvedVariables>`)** | Must not be enabled (**WARNING if true**) | Should be `false` (or absent, default = false). | Prevents silent bypass of validation if a variable (e.g., key reference) is not resolved. |
| **Key Source (`<PublicKey><Value>`)** | Recommended (**WARNING**) | Should use `ref=` (KVM or variable), avoid hardcoded values. | Hardcoded keys expose sensitive data in source code and reduce security. |
| **Source (`<Source>`)** | Optional (no enforcement) | Default is `request.header.authorization`. | Explicit definition improves clarity, but default behavior is already secure. |
| **Expiration (`exp` claim)** | Handled by Apigee (no enforcement) | Automatically enforced by VerifyJWT. | No need to enforce in plugin; already handled by the runtime. |
| **Not Before (`nbf` claim)** | Handled by Apigee (no enforcement) | Automatically handled if present. | Managed by Apigee; not required for plugin enforcement. |
| **Subject (`<Subject>`)** | Out of scope | Any value | Depends on business logic; not relevant for generic access token validation. |
| **AdditionalClaims (`<AdditionalClaims>`)** | Out of scope | Custom claims | Business-specific validation (scope, roles); not generic. |
| **TimeAllowance (`<TimeAllowance>`)** | Out of scope | Optional skew value | Impacts time tolerance; not critical for core validation. |
| **JWKS Advanced Handling (`<JWKS>`)** | Partially supported (no strict enforcement) | Basic presence accepted | Advanced key rotation logic adds complexity and is not required for this control. |
| **JWE / Encrypted JWT (`<Type>` / advanced)** | Out of scope | Not supported | Rare and complex use cases; not relevant for this requirement. |

---

### Summary

- **Required (ERROR):**
  - Algorithm
  - Key (consistent with algorithm)

- **Recommended (WARNING):**
  - Issuer
  - Audience
  - IgnoreUnresolvedVariables (must not be true)
  - Avoid hardcoded keys

- **No enforcement:**
  - Source (default is safe)
  - exp / nbf (handled by Apigee)

- **Out of scope:**
  - Subject
  - AdditionalClaims
  - TimeAllowance
  - Advanced JWT features