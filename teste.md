## VerifyJWT Parameters Analysis (Access Token Control)

| Parameter | Decision & Enforcement | Accepted Values / Rule | Justification |
|----------|------------------------|------------------------|---------------|
| **Algorithm (`<Algorithm>`)** | Required (**ERROR**) | Must be present. Reject `"none"`. Prefer strong algorithms (RS256, ES256, PS256). | Defines how the JWT signature is verified. Without it, signature validation is unreliable and vulnerable to algorithm confusion attacks. |
| **Key (`<PublicKey>` / `<SecretKey>`)** | Required (**ERROR**) | Must be present and consistent with Algorithm: HS* → SecretKey, RS*/PS*/ES* → PublicKey (Value, Certificate, or JWKS). | Without a key, no cryptographic verification is performed. Ensures the token is actually signed by a trusted authority. |
| **Audience (`<Audience>`)** | Required (**ERROR**) | Must be present and contain the expected API audience. | Prevents token reuse across different APIs (token confusion attack). |
| **IgnoreUnresolvedVariables (`<IgnoreUnresolvedVariables>`)** | Must not be enabled (**ERROR**) | Must be `false` (or absent, default = false). | Prevents fail-open behavior where validation is bypassed if a variable cannot be resolved. |
| **TimeAllowance (`<TimeAllowance>`)** | Controlled (**WARNING / ERROR**) | ≤ 10 min: OK • 10–60 min: WARNING • > 60 min: ERROR | Excessive time tolerance weakens expiration control and may allow expired tokens to be accepted. |
| **Issuer (`<Issuer>`)** | Recommended (**WARNING**) | Should be present and non-empty. | Improves security by ensuring the token comes from a trusted source, but signature validation still works without it. |
| **Key Source (`<PublicKey><Value>`)** | Recommended (**WARNING**) | Should use `ref=` (KVM or variable), avoid hardcoded values. | Hardcoded keys expose sensitive data in source code but do not break token validation. |
| **Source (`<Source>`)** | Optional (no enforcement) | Default is `request.header.authorization`. | Default behavior is already secure; explicit definition is only for clarity. |
| **Expiration (`exp` claim)** | Handled by Apigee (no enforcement) | Automatically enforced by VerifyJWT. | No need to enforce in plugin; already handled by the runtime. |
| **Not Before (`nbf` claim)** | Handled by Apigee (no enforcement) | Automatically handled if present. | Managed by Apigee; not required for plugin enforcement. |
| **Subject (`<Subject>`)** | Out of scope | Any value | Depends on business logic; not relevant for generic access token validation. |
| **AdditionalClaims (`<AdditionalClaims>`)** | Out of scope | Custom claims | Business-specific validation (scope, roles); not generic. |
| **JWKS Advanced Handling (`<JWKS>`)** | Partially supported (no strict enforcement) | Basic presence accepted | Advanced key rotation logic adds complexity and is not required for this control. |
| **JWE / Encrypted JWT (`<Type>` / advanced)** | Out of scope | Not supported | Rare and complex use cases; not relevant for this requirement. |

---

### Summary

- **Required (ERROR):**
  - Algorithm
  - Key (consistent with algorithm)
  - Audience
  - IgnoreUnresolvedVariables (must not be true)
  - TimeAllowance (> 60 min)

- **Recommended (WARNING):**
  - Issuer
  - Avoid hardcoded keys
  - TimeAllowance (10–60 min)

- **No enforcement:**
  - Source (default is safe)
  - exp / nbf (handled by Apigee)

- **Out of scope:**
  - Subject
  - AdditionalClaims
  - Advanced JWT features