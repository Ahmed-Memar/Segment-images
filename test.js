const ruleId = 'EX-CS002';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');
const SecurityLib = require('./security-lib.js');

const {
  findFlowsNotMatching,
  getPoliciesByType,
  getFlowRequestSteps,
  getStepName
} = SecurityLib;

const plugin = {
  ruleId: ruleId,
  name: "Check JSONThreatProtection",
  message: "Checks if JSONThreatProtection is present and correctly configured",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true,
};

/**
 * Validate JSONThreatProtection configuration
 */
const configCheckCallback = function (policy) {
  let compliant = true;

  [
    'ArrayElementCount',
    'ContainerDepth',
    'ObjectEntryCount',
    'ObjectEntryNameLength',
    'StringValueLength'
  ].forEach(config => {
    let item = xpath.select(`/JSONThreatProtection/${config}`, policy.getElement());

    if (item.length === 0) {
      compliant = false;

      policy.addMessage({
        plugin: plugin,
        line: policy.getElement().lineNumber,
        column: policy.getElement().columnNumber,
        message: `Required JSONThreatProtection configuration "${config}" not found for "${policy.getName()}"`
      });
    }
  });

  return compliant;
};

/**
 * Helper: safely extract text from XML node
 */
const getNodeText = function (node) {
  return node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';
};

/**
 * === JSON DETECTION (STRONG SIGNALS ONLY) ===
 */

/**
 * Strong signal: ExtractVariables with JSONPayload
 */
const hasExtractVariablesJSONPayload = function (endpoint) {
  const policies = getPoliciesByType(endpoint, 'ExtractVariables') || [];

  return policies.some(policy => {
    const jsonPayload = xpath.select('/ExtractVariables/JSONPayload', policy.getElement());
    return jsonPayload.length > 0;
  });
};

/**
 * Strong signal: JSON transformation policies
 */
const hasJSONTransformationPolicy = function (endpoint) {
  return (
    (getPoliciesByType(endpoint, 'JSONToXML') || []).length > 0 ||
    (getPoliciesByType(endpoint, 'XMLToJSON') || []).length > 0
  );
};

/**
 * Strong signal: AssignMessage sets Content-Type = application/json
 */
const hasAssignMessageJSONContentType = function (endpoint) {
  const policies = getPoliciesByType(endpoint, 'AssignMessage') || [];

  return policies.some(policy => {
    const headers = xpath.select(
      '/AssignMessage//Headers/Header[@name="Content-Type" or @name="content-type"]',
      policy.getElement()
    );

    return headers.some(header => {
      const value = getNodeText(header).toLowerCase();
      return value.includes('application/json');
    });
  });
};

/**
 * Final JSON usage detection
 */
const usesJSON = function (endpoint) {
  const result =
    hasExtractVariablesJSONPayload(endpoint) ||
    hasJSONTransformationPolicy(endpoint) ||
    hasAssignMessageJSONContentType(endpoint);

  debug(`JSON usage detected: ${result}`);
  return result;
};

/**
 * MAIN ENTRY POINT
 */
const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  // Skip if no JSON usage
  if (!usesJSON(endpoint)) {
    debug('No JSON usage detected → skipping JSONThreatProtection check');
    return cb(null, false);
  }

  /**
   * === FLOW-LEVEL VALIDATION USING GENERIC HELPER ===
   */
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {

    const steps = getFlowRequestSteps(flow) || [];

    // Detect if flow manipulates JSON (weak heuristic: step name)
    const usesJsonInFlow = steps.some(step =>
      getStepName(step).toLowerCase().includes('json')
    );

    // Skip flows not using JSON
    if (!usesJsonInFlow) {
      return {
        isValid: true,
        details: []
      };
    }

    // Check if JSONThreatProtection is applied in this flow
    const hasJTP = steps.some(step =>
      getStepName(step).toLowerCase().includes('json-threat') ||
      getStepName(step).toLowerCase().includes('jtp')
    );

    if (!hasJTP) {
      return {
        isValid: false,
        details: [{
          message: 'Missing JSONThreatProtection in flow',
          line: flow.lineNumber,
          column: flow.columnNumber
        }]
      };
    }

    return {
      isValid: true,
      details: []
    };
  });

  /**
   * === REPORT ERRORS ===
   */
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
  onProxyEndpoint,
};