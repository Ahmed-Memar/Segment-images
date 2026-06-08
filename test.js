/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * Validation process:
 * 1. Build a registry of ServiceCallout response variables.
 * 2. Check whether a valid JSONThreatProtection policy exists in PreFlow.
 * 3. If a valid policy exists in PreFlow, consider the proxy globally protected.
 * 4. Otherwise, analyze JSON usage in PreFlow using explicit JSON indicators.
 * 5. Validate request flows using a default JSON assumption:
 *    - POST, PUT and PATCH flows are assumed to process JSON request bodies.
 *    - Flows that clearly process XML are ignored and handled by
 *      XMLThreatProtection validation.
 * 6. Verify that a JSONThreatProtection policy is present and correctly
 *    configured wherever required.
 * 7. Report validation errors and warnings.
 *
 * @param {Object} endpoint Apigee ProxyEndpoint object.
 * @param {Function} cb Callback function.
 *
 * @returns {void}
 */