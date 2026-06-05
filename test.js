/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * Validation process:
 * 1. Build a registry of ServiceCallout response variables.
 * 2. Check whether a valid JSONThreatProtection policy exists in PreFlow.
 * 3. If a valid policy exists in PreFlow, consider the proxy globally protected.
 * 4. Otherwise, validate request flows using a default JSON assumption:
 *    - POST, PUT and PATCH flows are assumed to process JSON request bodies.
 *    - Flows that clearly process XML are ignored and handled by
 *      XMLThreatProtection validation.
 * 5. Verify that a JSONThreatProtection policy is present and correctly
 *    configured wherever required.
 * 6. Report validation errors.
 *
 * @param {Object} endpoint Apigee ProxyEndpoint object.
 * @param {Function} cb Callback function.
 *
 * @returns {void}
 */





// Registry used to classify ServiceCallout response variables
// as internal, external or unknown sources.