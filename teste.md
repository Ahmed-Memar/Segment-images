Description

APIs processing XML or JSON payloads must implement ThreatProtection policies to prevent malicious payload structures, parser abuse, and resource exhaustion attacks.

The control validates the presence and configuration quality of XMLThreatProtection and JSONThreatProtection policies when XML or JSON processing is detected in request flows.


---

Evaluation

The API proxy must:

- Detect XML or JSON processing in request flows
- Ensure that the corresponding ThreatProtection policy is applied
- Verify that ThreatProtection configuration includes mandatory security limits
- Report incomplete hardening configuration through warnings


---

Applicable Policies

XMLThreatProtection

Purpose

Protect APIs against malicious or excessively complex XML payloads by enforcing structure and value limits.

Configuration Requirements

The policy must be configured according to the defined security rules as following:

👉 (insert XMLThreatProtection table here)


---

JSONThreatProtection

Purpose

Protect APIs against malicious or excessively complex JSON payloads by enforcing structure and value limits.

Configuration Requirements

The policy must be configured according to the defined security rules as following:

👉 (insert JSONThreatProtection table here)


---

Design Decisions

The control evaluates request flows only.

A ThreatProtection policy configured in the PreFlow is considered global protection for all request flows.

XML usage detection includes:
- ExtractVariables using XMLPayload
- XML transformation policies (XMLToJSON, JSONToXML, XSLTransform, XSLTransformation)
- AssignMessage policies setting Content-Type to application/xml or text/xml

JSON usage detection includes:
- ExtractVariables using JSONPayload
- JSON transformation policies (JSONToXML, XMLToJSON)
- AssignMessage policies setting Content-Type to application/json


---

Rule Logic

The plugin performs the following checks:

1. Detect XML or JSON processing in request flows

2. Ensure the corresponding ThreatProtection policy is applied:
   - In the PreFlow
   - Or in all request flows processing XML or JSON

3. If ThreatProtection is used:
   - Validate required configuration parameters
   - Apply security rules defined in the corresponding table

4. Report:
   - ERROR for missing mandatory protection
   - ERROR for missing required limits
   - WARNING for missing recommended hardening limits


---

Lint Rules

EX-CS002 - CheckJSONThreatProtection.js

EX-CS003 - CheckXMLThreatProtection.js