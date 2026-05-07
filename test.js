/**
 * Check whether the endpoint contains a policy of the given type.
 *
 * @param {Object} endpoint
 * @param {string} type
 * @returns {boolean}
 */
const hasPolicyType


---

/**
 * Retrieve all policies of the given type.
 *
 * @param {Object} endpoint
 * @param {string} type
 * @returns {Array<Object>}
 */
const getPoliciesByType


---

/**
 * Retrieve all Flow nodes from the ProxyEndpoint.
 *
 * @param {Object} endpoint
 * @returns {Array<Node>}
 */
const getFlows


---

/**
 * Extract the condition text from a Flow node.
 *
 * @param {Node} node
 * @returns {string}
 */
const getCondition


---

/**
 * Extract the step name from a Step node.
 *
 * @param {Node} node
 * @returns {string}
 */
const getStepName


---

/**
 * Retrieve a policy by name.
 *
 * @param {Object} endpoint
 * @param {string} name
 * @returns {Object|null}
 */
const getPolicyByName


---

/**
 * Resolve the policy referenced by a Step.
 *
 * @param {Object} endpoint
 * @param {Node} step
 * @returns {Object|null}
 */
const getPolicyFromStep


---

/**
 * Retrieve policies referenced by steps and filtered by type.
 *
 * @param {Object} endpoint
 * @param {Array<Node>} steps
 * @param {string} type
 * @returns {Array<Object>}
 */
const getPoliciesFromStepsByType


---

/**
 * Retrieve request steps from the PreFlow.
 *
 * @param {Object} endpoint
 * @returns {Array<Node>}
 */
const getPreFlowRequestSteps


---

/**
 * Retrieve request steps from a Flow.
 *
 * @param {Node} flow
 * @returns {Array<Node>}
 */
const getFlowRequestSteps