/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * Logic:
 * - Detect JSON or XML threat protection indicators
 * - Only POST / PUT / PATCH request flows are validated
 * - GET / DELETE / others are ignored
 * - If no JSON or XML indicators are found → WARNING
 *
 * @param {Object} endpoint - Apigee ProxyEndpoint object
 * @param {Function} cb - Callback function
 * @returns {void}
 */
const onProxyEndpoint = function (endpoint, cb) {
  let preFlowHasJSON = false;
  let preFlowHasXML = false;

  // ===== PRE-FLOW CHECK =====
  const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

  preFlowSteps.forEach(step => {
    if (stepUsesJSON(endpoint, step)) {
      preFlowHasJSON = true;
    }

    if (stepUsesXML(endpoint, step)) {
      preFlowHasXML = true;
    }
  });

  // ===== FLOW CHECK =====
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const expression = getCondition(flow) || '';

    // Ignore flows that are not POST / PUT / PATCH
    if (!BODY_METHOD_REGEX.test(expression)) {
      return {
        isValid: true
      };
    }

    let hasJSON = preFlowHasJSON;
    let hasXML = preFlowHasXML;

    const steps = getFlowRequestSteps(flow) || [];

    steps.forEach(step => {
      if (stepUsesJSON(endpoint, step)) {
        hasJSON = true;
      }

      if (stepUsesXML(endpoint, step)) {
        hasXML = true;
      }
    });

    return {
      isValid: hasJSON || hasXML
    };
  });

  // ===== REPORT WARNINGS =====
  if (invalidFlows.length > 0) {
    invalidFlows.forEach(flow => {
      endpoint.addMessage({
        plugin,
        line: flow.line,
        column: flow.column,
        message: `Flow "${flow.name}" may process a request body without detectable JSON/XML threat protection indicators. Manual verification recommended.`
      });
    });

    return cb(null, true);
  }

  return cb(null, false);
};