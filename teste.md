The plugin supports:
- Single or multiple algorithms defined in <Algorithm>
- Symmetric (HS*) and asymmetric (RS*/PS*/ES*) algorithms


3. If VerifyJWT is used:

• Validate required parameters
• Validate algorithm selection and strength
• Validate consistency between algorithm family and key type
• Validate Audience configuration
• Validate IgnoreUnresolvedVariables configuration
• Validate TimeAllowance thresholds
• Warn when Issuer is missing
• Warn when SecretKey/PublicKey values are hardcoded
• Apply security rules defined in the table

4. Exclude CORS preflight flows from validation coverage checks

5. Exclude RaiseFault-only flows from validation coverage checks



The control focuses on enforcing correct configuration of the VerifyJWT policy and ensuring access token validation is effectively enforced on protected API flows.