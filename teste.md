## SpikeArrest

### Purpose

Protect APIs against traffic spikes and basic denial-of-service attempts by limiting the rate of incoming requests.

### Detection Logic

The rule verifies that a SpikeArrest policy is applied to the API proxy.

A SpikeArrest policy is considered present when it is applied in:

- The request PreFlow, or
- Any request Flow.

### Configuration Requirements

The policy must be configured according to the following security rules:

| Parameter | Description | Severity | Why |
|------------|------------|------------|------------|
| Rate | Defines the maximum number of requests allowed during a given time interval. | ERROR | Without a rate limit, the policy cannot effectively protect the API against traffic spikes or excessive request volumes. |

### Design Decisions

- A SpikeArrest policy applied in the request PreFlow is treated as global protection.
- If no compliant SpikeArrest policy exists in the request PreFlow, request flows are evaluated individually.
- A SpikeArrest policy is considered compliant only when the required `Rate` element is present.

### Rule Logic

1. Check whether at least one SpikeArrest policy exists in the proxy bundle.
2. Validate the configuration of every SpikeArrest policy:
   - The policy must contain a `Rate` element.
3. Check whether a compliant SpikeArrest policy is applied:
   - In the request PreFlow, or
   - In every request Flow.
4. Report an ERROR when:
   - No SpikeArrest policy is applied where required.
   - A SpikeArrest policy is missing the required `Rate` element.

### References

Lint Rule: `EX-CS004-CheckSpikeArrest.js`

Apigee policy reference: `SpikeArrest`