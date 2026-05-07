/**
 * Apply matcherFn to each flow and collect invalid flows.
 *
 * @param {Object} endpoint - Proxy endpoint object
 * @param {Function} matcherFn - Function used to validate a flow
 * @returns {Array<Object>} Invalid flows with:
 * name {string}, line {number}, column {number}, details {Array<Object>}
 */