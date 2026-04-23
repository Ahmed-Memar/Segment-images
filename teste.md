# Access Token Control

## Description

APIs must validate access tokens using standard mechanisms (OAuthV2 or VerifyJWT) to ensure that only authorized requests are processed.

---

## Evaluation

The API proxy must:

- Implement at least one of the following:
  - OAuthV2 (VerifyAccessToken)
  - VerifyJWT

- Ensure that access token validation is enforced on incoming requests (PreFlow or all request flows)

- Verify that the VerifyJWT policy is correctly configured

---

## Sensitivity Condition

This control depends on the API sensitivity level:

- For APIs with sensitivity levels S2, S3, S4:  
  ➤ Access token validation is mandatory

- For APIs with sensitivity level S1:  
  ➤ This control is not mandatory

---

## Applicable Policies

### OAuthV2 (VerifyAccessToken)

#### Purpose

Validate OAuth2 access tokens issued by the Authorization Server.

---

#### Configuration Requirements

- The policy must be present when OAuth2 tokens are used  
- The VerifyAccessToken operation must be configured and correctly validate incoming tokens  

---

#### Design Decisions

OAuthV2 is used for opaque tokens managed by the Authorization Server.  
Considered compliant if properly implemented.

---

#### Rule Logic

- Check presence of OAuthV2 policy  
- Verify it performs access token validation  

---

### VerifyJWT

#### Purpose

Validate JWT access tokens by verifying signature and claims.

---

#### Configuration Requirements

The policy must be configured according to the defined security rules (see table below).

👉 The table is here  

---

#### Design Decisions

The control focuses on enforcing correct configuration of the VerifyJWT policy.

---

#### Rule Logic

The plugin performs the following checks:

1. Detect presence of an access token validation mechanism (OAuthV2 or VerifyJWT)

2. Ensure validation is enforced in the PreFlow or in all request flows

3. If VerifyJWT is used:
   - Validate required parameters  
   - Ensure parameters are correctly configured  
   - Apply security rules defined in the table  

---

## Lint Rule

EX-CS009 – Access Token Control