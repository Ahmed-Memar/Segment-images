# Injection attacks prevention

## Description

APIs processing XML or JSON payloads must implement ThreatProtection policies to prevent malicious or excessively complex payloads.

## Evaluation

The API proxy must apply appropriate ThreatProtection policies and configure the required protection parameters when processing XML or JSON payloads.

## Applicable Policies

# JSONThreatProtection

## Purpose

Protect APIs against malicious or excessively complex JSON payloads by enforcing structure and value validation controls.

## Detection Logic

The rule determines whether JSONThreatProtection is required using the following logic.

### PreFlow

If no JSONThreatProtection policy exists in the request PreFlow, the rule analyzes PreFlow request steps using explicit JSON processing indicators as follows:

*(same indicator table as today)*

### Request Flows

- POST, PUT and PATCH request flows are assumed to process JSON request bodies by default.
- Flows that clearly process XML are excluded and handled by XMLThreatProtection.

## Configuration Requirements

The policy must be configured according to the following security rules:

*(same configuration table as today)*

## Design Decisions

- A valid JSONThreatProtection policy in request PreFlow is treated as global protection.
- PreFlow analysis relies on explicit JSON processing indicators.
- POST, PUT and PATCH request flows are assumed to process JSON request bodies by default.

## References

Lint Rule: `EX-CS002-CheckJSONThreatProtection.js`

Apigee policy reference: `JSONThreatProtection`

---

# XMLThreatProtection

## Purpose

Protect APIs against malicious or excessively complex XML payloads by enforcing structure and value validation controls.

## Detection Logic

The rule determines whether XMLThreatProtection is required using the following indicators.

*(same indicator table as today)*

## Configuration Requirements

The policy must be configured according to the following security rules:

*(same configuration table as today)*

## Design Decisions

- A valid XMLThreatProtection policy in request PreFlow is treated as global protection.
- XML processing must be detected through explicit indicators.

## References

Lint Rule: `EX-CS003-CheckXMLThreatProtection.js`

Apigee policy reference: `XMLThreatProtection`

---

# Source Classification

Source classification is used when analyzing the `<Source>` parameter of JSON and XML processing policies.

It determines whether the payload source is trusted, untrusted or unknown.

It is used for:

- JSON processing detected through explicit indicators in PreFlow.
- XML processing detected in PreFlow and request flows.

It is not used for the default JSON detection applied to POST, PUT and PATCH request flows.

Source classification rules are summarized in the following table:

*(same source classification table as today)*