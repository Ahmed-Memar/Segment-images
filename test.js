const ruleId = 'EX-CS010';

const {
  getPreFlowRequestSteps,
  getFlowRequestSteps,
  findFlowsNotMatching,
} = require('./lib/security-lib');

const { stepUsesJSON } = require('./EX-CS002-CheckJSONThreatProtection');
const { stepUsesXML } = require('./EX-CS003-CheckXMLThreatProtection');

/**
 * Regular expression used to detect HTTP methods
 * that usually contain a request body.
 * Supported methods: POST, PUT, PATCH
 */
const BODY_METHOD_REGEX =
  /request\.verb\s*(?:=|==)\s*['"]?(POST|PUT|PATCH)['"]?/i;

const plugin = {
  ruleId,
  name: 'Detect Unknown Payload Format',
  message:
    'Unable to detect JSON or XML usage indicators. Manual verification may be required.',
  fatal: false,
  severity: 1,
  nodeType: 'Bundle',
  enabled: true
};

/**
 * Main plugin entry point executed for each ProxyEndpoint.
 *
 * Logic:
 * - PreFlow is checked globally (applies to all requests)
 * - Each Flow is checked individually
 * - Only POST / PUT / PATCH flows are validated
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
    const condition = flow.getCondition();
    const expression = condition ? condition.getExpression() || '' : '';

    // Ignore flows that are not POST / PUT / PATCH
    if (!BODY_METHOD_REGEX.test(expression)) {
      return {
        isValid: true,
        details: []
      };
    }

    let hasJSON = preFlowHasJSON;
    let hasXML = preFlowHasXML;

    const steps = getFlowRequestSteps(flow.getElement()) || [];

    steps.forEach(step => {
      if (stepUsesJSON(endpoint, step)) {
        hasJSON = true;
      }

      if (stepUsesXML(endpoint, step)) {
        hasXML = true;
      }
    });

    const details = [];

    if (!hasJSON && !hasXML) {
      details.push({
        message: 'No JSON or XML usage indicators were detected in request flow.',
        line: flow.lineNumber,
        column: flow.columnNumber
      });
    }

    return {
      isValid: hasJSON || hasXML,
      details
    };
  });

  // ===== REPORT WARNINGS =====
  if (invalidFlows.length > 0) {
    invalidFlows.forEach(flow => {
      const messages = flow.details.map(d => d.message);

      endpoint.addMessage({
        plugin,
        line: flow.line,
        column: flow.column,
        message: `Flow "${flow.name}" is not compliant: ${messages.join(' AND ')}`
      });
    });

    return cb(null, true);
  }

  return cb(null, false);
};

module.exports = {
  plugin,
  onProxyEndpoint
};