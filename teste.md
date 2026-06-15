Design Decisions

1. OAuthV2 is used for opaque tokens managed by the Authorization Server and is considered compliant when properly implemented.

2. VerifyJWT is used for self-contained JWT tokens and must be configured according to the defined security rules.

3. CORS preflight flows are excluded from validation coverage checks because they are OPTIONS requests used for CORS negotiation and do not carry access tokens.

4. RaiseFault-only flows are excluded from validation coverage checks because they only return an error response and do not process protected API operations.