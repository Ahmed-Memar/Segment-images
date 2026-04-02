/**
 * Apply matcherFn to each flow and collect invalid ones
 * @param {Object} endpoint - Apigee endpoint
 * @param {(steps: Array, flow: Object) => {isValid: boolean, details: Array}} matcherFn
 * @returns {Array} invalid flows with metadata and details
 */