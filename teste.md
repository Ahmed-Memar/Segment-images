# Injection Attacks Prevention

## Description

APIs processing XML or JSON payloads must implement ThreatProtection policies to prevent malicious or excessively complex payloads.

## Evaluation

The API proxy must apply appropriate ThreatProtection policies and configure the required protection parameters when processing XML or JSON payloads.

---

# JSONThreatProtection

## Purpose

Protect APIs against malicious or excessively complex JSON payloads by enforcing structure and value validation controls.

## Detection Logic

The rule determines whether JSONThreatProtection is required using the following logic.

### PreFlow

A JSONThreatProtection policy configured in the request PreFlow is considered a global protection for the entire ProxyEndpoint.

If no JSONThreatProtection policy exists in the request PreFlow, the rule analyzes PreFlow request steps using explicit JSON processing indicators.

**Table: JSON processing indicators**

### Request Flows

POST, PUT and PATCH request flows are assumed to process JSON request bodies by default.

Flows that clearly process XML are excluded and handled by XMLThreatProtection.

## Configuration Requirements

The policy must be configured according to the following security rules:

**Table: JSONThreatProtection configuration requirements**

## Design Decisions

1. A valid JSONThreatProtection policy in request PreFlow is treated as global protection.
2. PreFlow analysis relies on explicit JSON processing indicators.
3. POST, PUT and PATCH request flows are assumed to process JSON request bodies by default.
4. Flows clearly processing XML are ignored by this control.
5. The approach intentionally favors security by minimizing false negatives.

## Rule Logic

1. Check whether JSONThreatProtection exists in request PreFlow.
2. Validate its configuration.
3. If valid, treat it as global protection and stop further analysis.
4. Otherwise, analyze PreFlow using JSON processing indicators.
5. Analyze each request flow.
6. Ignore flows that clearly process XML.
7. Consider POST, PUT and PATCH flows as JSON-processing flows.
8. Verify that JSONThreatProtection exists in the same flow.
9. Validate the policy configuration.

## References

Lint Rule: `EX-CS002-CheckJSONThreatProtection.js`

Apigee policy reference: `JSONThreatProtection`

---

# XMLThreatProtection

## Purpose

Protect APIs against malicious or excessively complex XML payloads by enforcing structure and value validation controls.

## Detection Logic

The rule detects XML processing using explicit XML processing indicators.

### PreFlow

A valid XMLThreatProtection policy configured in request PreFlow is considered global protection.

If no XMLThreatProtection policy exists in request PreFlow, the rule analyzes PreFlow request steps using XML processing indicators.

**Table: XML processing indicators**

### Request Flows

The rule analyzes request flows and detects explicit XML processing indicators.

## Configuration Requirements

The policy must be configured according to the following security rules:

**Table: XMLThreatProtection configuration requirements**

## Design Decisions

1. A valid XMLThreatProtection policy in request PreFlow is treated as global protection.
2. XML processing must be detected through explicit indicators.
3. HTTP methods are not used for XML detection.
4. Source classification is used when XML processing policies define a `<Source>`.

## Rule Logic

1. Build a registry of ServiceCallout response variables.
2. Check whether XMLThreatProtection exists in request PreFlow.
3. Validate its configuration.
4. If valid, treat it as global protection and stop further analysis.
5. Otherwise, analyze PreFlow and request flows using XML processing indicators.
6. Verify that XMLThreatProtection exists in the same flow.
7. Validate the policy configuration.

## References

Lint Rule: `EX-CS003-CheckXMLThreatProtection.js`

Apigee policy reference: `XMLThreatProtection`

---

# Source Classification

Both controls use the same source-classification mechanism when analyzing policies that define a `<Source>` element.

The objective is to determine whether the processed payload originates from:

- a trusted internal source,
- an untrusted external source,
- or an unknown source that cannot be classified automatically.

Source classification is used only when an explicit processing policy provides a `<Source>` element.

It is not used for the default JSON detection applied to POST, PUT and PATCH request flows.

**Table: Source classification**