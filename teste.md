## Injection attacks prevention

### Description

APIs processing XML or JSON payloads must implement ThreatProtection policies to prevent malicious or excessively complex payloads.

### Evaluation

The API proxy must apply appropriate ThreatProtection policies and configure the required protection parameters when processing XML or JSON payloads.

A ThreatProtection policy configured in the ProxyEndpoint PreFlow Request is considered global protection for all request flows.

---

## Applicable Policies

## JSONThreatProtection

### Purpose

Protect APIs against malicious or excessively complex JSON payloads by enforcing structure and value validation controls.

### Detection Logic

The rule detects JSON processing in request flows using the following indicators:

| Indicator | Example | Source handling |
|---|---|---|
| ExtractVariables with JSONPayload | `<JSONPayload>` | `<Source>` is analyzed |
| JSONToXML policy | `<JSONToXML>` | `<Source>` is analyzed |
| AssignMessage JSON payload | `<Payload contentType="application/json">` | No source analysis, because AssignMessage has no `<Source>` element |

### Source Classification

| Source case | Severity | Why |
|---|---|---|
| Missing `<Source>` | ERROR | Defaults to `message`, which can represent client request data |
| `request`, `request.*`, `message`, `message.content` | ERROR | Direct client-controlled request data |
| ServiceCallout response from hardcoded external URL | ERROR | External backend data may be untrusted |
| Unknown source | WARNING | Source origin cannot be automatically verified; manual review is required |
| Dynamic ServiceCallout URL | WARNING | Trust level cannot be determined statically |
| `response`, `response.*` | IGNORE | Backend/internal response data |
| `AccessEntity.*`, `private.*`, `oauthv2.*` | IGNORE | Internal Apigee variables |
| ServiceCallout with `LocalTargetConnection` | IGNORE | Internal proxy/service call |
| ServiceCallout URL containing `.internal`, `.local`, or `localhost` | IGNORE | Internal/local target detected |

### Configuration Requirements

| Parameter | Description | Severity | Why |
|---|---|---|---|
| ContainerDepth | Defines the maximum nesting level of JSON objects and arrays. | ERROR | Excessive nesting may lead to parser abuse and resource exhaustion attacks. |
| ObjectEntryCount | Defines the maximum number of key-value pairs allowed in a JSON object. | WARNING | Large JSON objects may increase processing cost and memory usage. |
| StringValueLength | Defines the maximum length of string values in the JSON payload. | WARNING | Excessively large text values may increase payload processing overhead. |
| ArrayElementCount | Defines the maximum number of elements allowed in a JSON array. | WARNING | Large arrays may increase memory consumption and parsing complexity. |

### References

Lint Rule: `EX-CS002-CheckJSONThreatProtection.js`  
Apigee policy reference: `JSONThreatProtection`

---

## XMLThreatProtection

### Purpose

Protect APIs against malicious or excessively complex XML payloads by enforcing structure and value validation controls.

### Detection Logic

The rule detects XML processing in request flows using the following indicators:

| Indicator | Example | Source handling |
|---|---|---|
| ExtractVariables with XMLPayload | `<XMLPayload>` | `<Source>` is analyzed |
| XMLToJSON policy | `<XMLToJSON>` | `<Source>` is analyzed |
| AssignMessage XML payload | `<Payload contentType="text/xml">` or any content type containing `xml` | No source analysis, because AssignMessage has no `<Source>` element |

### Source Classification

| Source case | Severity | Why |
|---|---|---|
| Missing `<Source>` | ERROR | Defaults to `message`, which can represent client request data |
| `request`, `request.*`, `message`, `message.content` | ERROR | Direct client-controlled request data |
| ServiceCallout response from hardcoded external URL | ERROR | External backend data may be untrusted |
| Unknown source | WARNING | Source origin cannot be automatically verified; manual review is required |
| Dynamic ServiceCallout URL | WARNING | Trust level cannot be determined statically |
| `response`, `response.*` | IGNORE | Backend/internal response data |
| `AccessEntity.*`, `private.*`, `oauthv2.*` | IGNORE | Internal Apigee variables |
| ServiceCallout with `LocalTargetConnection` | IGNORE | Internal proxy/service call |
| ServiceCallout URL containing `.internal`, `.local`, or `localhost` | IGNORE | Internal/local target detected |

### Configuration Requirements

| Parameter | Description | Severity | Why |
|---|---|---|---|
| StructureLimits/NodeDepth | Defines the maximum nesting depth of XML elements. | ERROR | Deep XML structures may lead to parser abuse and resource exhaustion attacks. |
| StructureLimits/ChildCount | Defines the maximum number of child elements allowed per XML node. | WARNING | Excessive child elements may increase parsing complexity. |
| ValueLimits/Text | Defines the maximum length of text content inside XML elements. | WARNING | Large text values may increase processing overhead and memory usage. |
| ValueLimits/Attribute | Defines the maximum length of XML attribute values. | WARNING | Excessively large attribute values may increase payload size and parsing cost. |
| StructureLimits/AttributeCountPerElement | Defines the maximum number of attributes allowed on a single XML element. | WARNING | Excessive attributes may increase XML parsing complexity and memory usage. |

### References

Lint Rule: `EX-CS003-CheckXMLThreatProtection.js`  
Apigee policy reference: `XMLThreatProtection`

---

### Source Classification

Both controls use the same source classification logic when analyzing XML or JSON processing policies.

The objective is to determine whether the processed payload originates from a trusted internal source, an untrusted external source, or a source whose origin cannot be determined automatically. This classification allows the lint rule to decide whether a missing ThreatProtection policy should raise an ERROR, a WARNING, or be ignored.

---

## Design Decisions

1. The control evaluates request flows only.

2. A ThreatProtection policy configured in the ProxyEndpoint PreFlow Request is considered global protection for all request flows.

3. The control uses static analysis indicators to detect JSON or XML processing.

4. ExtractVariables and transformation policies use `<Source>` analysis.

5. AssignMessage does not use `<Source>` analysis because it has no `<Source>` element. The rule only checks whether the payload content type indicates JSON or XML.

6. ServiceCallout response variables are indexed before flow analysis to determine whether a source is internal, external, or unknown.

7. Unknown sources are reported as WARNING, because the plugin cannot automatically determine whether ThreatProtection is required.

8. Variables created outside the bundle, for example in Shared Flows or JavaScript, may not be resolved and are therefore classified as unknown.

---

## Rule Logic

1. Build a registry of ServiceCallout response variables.

2. Classify each ServiceCallout response variable:
   1. `LocalTargetConnection` → internal
   2. URL containing `.internal`, `.local`, or `localhost` → internal
   3. URL containing dynamic variables such as `{host}` → unknown
   4. Hardcoded external URL → external

3. Check whether a valid ThreatProtection policy exists in the PreFlow Request.
   1. If yes, validate its configuration.
   2. If valid, it is treated as global protection.

4. If no global protection exists, analyze each request flow.

5. Detect XML or JSON processing steps.

6. If processing is detected, check whether the corresponding ThreatProtection policy exists in the same flow.

7. Report:
   1. ERROR for high-risk or missing required protection.
   2. WARNING when the source origin cannot be automatically verified.
   3. IGNORE for trusted internal/backend sources.