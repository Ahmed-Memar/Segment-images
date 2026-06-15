4. Exclude CORS preflight flows because they are OPTIONS requests used for CORS negotiation and are not subject to access token validation.

5. Exclude RaiseFault-only flows because they only return an error response and do not process protected API operations.