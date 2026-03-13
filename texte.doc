Security Requirement

Data Schema Control

Description

Incoming request payloads must be validated against a defined schema (JSON or XML) to ensure that the data structure matches the expected format and to prevent malformed inputs or injection attacks.


---

Evaluation

The API proxy must validate incoming request payloads against a defined schema.

This validation ensures:

payload structure integrity

correct field types

prevention of malformed or unexpected data



---

Applicable Policies

Policy	API Type

OASValidation	REST / JSON APIs
MessageValidation	SOAP / XML APIs



---

Policy Implementation

OASValidation (REST APIs)

Purpose

Validate JSON request payload against an OpenAPI schema.

Configuration Requirements

Parameter	Required Value	Severity

ValidateMessageBody	true	Error
AllowUnspecifiedParameters (Query)	false	Error
AllowUnspecifiedParameters (Cookie)	false	Warning


Design Decisions

ValidateMessageBody must be enabled to ensure the request body is validated against the OpenAPI schema.

AllowUnspecifiedParameters (Query) must be set to false so that only declared query parameters are accepted.

AllowUnspecifiedParameters (Cookie) is treated as a warning because cookies may be added automatically by browsers or infrastructure components.

Headers are ignored in OASValidation checks because infrastructure components may inject additional headers.


Lint Rule

EX-CS005 — OASValidation Configuration Check


---

MessageValidation (SOAP APIs)

Purpose

Validate SOAP/XML payload against a WSDL or XSD schema.

Configuration Requirements

Parameter	Requirement

ResourceURL	must reference WSDL or XSD
SOAPMessage	required
Element	required when using WSDL


Design Decisions

ResourceURL must point to a valid WSDL or XSD so the payload can be validated against a schema.

SOAPMessage is required to validate the SOAP envelope content.

Element is required when using WSDL to identify the element or operation to validate.


Lint Rule

EX-CS006 — SOAP MessageValidation Configuration Check


---

Data Schema Validation – Global Rule

This rule ensures that APIs requiring payload validation implement at least one schema validation policy.

Rule Logic

For APIs receiving request bodies, at least one of the following policies must be implemented:

OASValidation

MessageValidation


SOAP-Specific Condition

For SOAP APIs, if the request does not contain a body, the validation check is skipped.

Design Decision

SOAP requests without payload are excluded because schema validation only applies when a request body is present.


Lint Rule

EX-CS007 — Data Schema Validation Global Check