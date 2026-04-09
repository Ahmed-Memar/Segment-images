### Design Decisions

This control depends on the API sensitivity level.

- For APIs with sensitivity levels S2, S3, or S4:
  - Access token validation is mandatory
  - The plugin enforces the presence of a valid token validation mechanism (OAuthV2 VerifyAccessToken or VerifyJWT)

- For APIs with sensitivity level S1:
  - This control is not mandatory
  - However, in the current version of the plugin, the control is still enforced