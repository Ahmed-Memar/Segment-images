VerifyJWT Parameters Analysis (Access Token Control)

Parameter| XML Element| Important for Access Token Control?| Enforce Now (V2)?| Accepted Values / Rule| Justification
Algorithm| "<Algorithm>"| ✅ Critical| ✅ Yes (ERROR)| Must be present. Reject "none". Prefer strong algorithms (RS256, ES256, PS256).| Defines how the JWT signature is verified. Without it, signature validation is unreliable and vulnerable to algorithm confusion attacks.
Key (Public / Secret)| "<PublicKey>" / "<SecretKey>"| ✅ Critical| ✅ Yes (ERROR)| Must be present and consistent with Algorithm: HS* → SecretKey, RS*/PS*/ES* → PublicKey (Value, Certificate, or JWKS).| Without a key, no cryptographic verification is performed. This ensures the token is actually signed by a trusted authority.
Issuer| "<Issuer>"| ✅ High| ✅ Yes (WARNING)| Should be present and non-empty.| Ensures the token is issued by a trusted Identity Provider. Prevents accepting tokens from unintended sources.
Audience| "<Audience>"| ✅ High| ✅ Yes (WARNING)| Should be present and contain the expected API audience.| Prevents token reuse across different APIs (token confusion attack).
IgnoreUnresolvedVariables| "<IgnoreUnresolvedVariables>"| ⚠️ Important| ✅ Yes (WARNING if true)| Must be "false" (or absent, default = false).| Prevents silent bypass of validation if a variable (e.g., key reference) is not resolved.
Source| "<Source>"| ⚠️ Medium| ❌ No (INFO only)| Optional. Default is "request.header.authorization".| Explicit definition improves clarity, but default behavior is already secure.
Key Source (ref vs inline)| "<PublicKey><Value>"| ⚠️ Medium| ⚠️ Yes (WARNING)| Should use "ref=" (KVM or variable), avoid hardcoded values.| Hardcoded keys expose sensitive data in source code and reduce security.
Expiration (exp claim)| (implicit)| ✅ High| ❌ No| Automatically enforced by Apigee VerifyJWT.| No need to enforce in plugin; already handled by the runtime.
Not Before (nbf claim)| (implicit)| ⚠️ Medium| ❌ No| Automatically handled if present.| Managed by Apigee; not required for plugin enforcement.
Subject| "<Subject>"| ⚠️ Low| ❌ No (V3)| Any value| Too context-specific; depends on business logic.
AdditionalClaims| "<AdditionalClaims>"| ⚠️ Low| ❌ No (V3)| Custom claims| Business-specific validation (scope, roles); not generic.
TimeAllowance| "<TimeAllowance>"| ⚠️ Low| ❌ No (V3)| Optional skew value| Impacts time tolerance; not critical for core validation.
JWKS Advanced Handling (kid, rotation)| "<JWKS>"| ⚠️ Medium| ❌ No (V3)| Basic presence accepted| Advanced key rotation logic adds complexity; deferred.
JWE / Encrypted JWT| "<Type>" / advanced| ❌ Not relevant (V2)| ❌ No| Not supported in V2| Rare and complex use cases; out of scope for current requirement.

---

Summary (V2 Strategy)

For the Access Token Control requirement, the plugin enforces:

- Mandatory (ERROR):
  
  - Algorithm must be defined and secure
  - Key must be present and consistent with algorithm

- Recommended (WARNING):
  
  - Issuer should be defined
  - Audience should be defined
  - IgnoreUnresolvedVariables must not be true
  - Keys should not be hardcoded

- Not enforced (handled by Apigee or deferred):
  
  - exp / nbf claims (handled by Apigee)
  - Source (default is secure)
  - Subject, AdditionalClaims (business logic)
  - Advanced JWT features (JWE, key rotation, etc.)

This approach ensures strong security coverage for ~90% of real-world use cases while keeping the plugin maintainable and aligned with Apigee best practices.