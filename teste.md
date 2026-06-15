### Design Decisions

The following flow types are excluded from access token validation coverage checks:

1. CORS preflight flows, because they are OPTIONS requests used for CORS negotiation and do not carry access tokens.

2. RaiseFault-only flows, because they only return an error response and do not process protected API operations.