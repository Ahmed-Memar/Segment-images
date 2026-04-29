const ruleId = 'EX-CS002';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');
const SecurityLib = require('./security-lib.js');

const {
  findFlowsNotMatching,
  getPoliciesByType,
  getPreFlowRequestSteps,
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
        message: `Missing configuration "${config}" in JSONThreatProtection "${policy.getName()}"`
      });
    }
  });

  return compliant;
};

/**
 * Helper: get text from XML node
 */
const getNodeText = function (node) {
  return node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';
};

/**
 * Get policy object from step
 */
const getPolicyByName = function (endpoint, name) {
  return endpoint.parent.getPolicies().find(p => p.getName() === name);
};

const getPolicyFromStep = function (endpoint, step) {
  const name = getStepName(step);
  return name ? getPolicyByName(endpoint, name) : null;
};

/**
 * === JSON DETECTION (REAL SIGNALS) ===
 */
const stepUsesJSON = function (endpoint, step) {
  const policy = getPolicyFromStep(endpoint, step);
  if (!policy) return false;

  if (policy.getType() === 'ExtractVariables') {
    const jsonPayload = xpath.select('/ExtractVariables/JSONPayload', policy.getElement());
    return jsonPayload.length > 0;
  }

  if (policy.getType() === 'JSONToXML' || policy.getType() === 'XMLToJSON') {
    return true;
  }

  if (policy.getType() === 'AssignMessage') {
    const headers = xpath.select(
      '/AssignMessage//Headers/Header[@name="Content-Type" or @name="content-type"]',
      policy.getElement()
    );

    return headers.some(h => getNodeText(h).toLowerCase().includes('application/json'));
  }

  return false;
};

const stepIsJSONThreatProtection = function (endpoint, step) {
  const policy = getPolicyFromStep(endpoint, step);
  return policy && policy.getType() === 'JSONThreatProtection';
};

const getJTPPoliciesFromSteps = function (endpoint, steps) {
  return steps
    .map(step => getPolicyFromStep(endpoint, step))
    .filter(p => p && p.getType() === 'JSONThreatProtection');
};

const stepsUseJSON = function (endpoint, steps) {
  return steps.some(step => stepUsesJSON(endpoint, step));
};

/**
 * === MAIN ===
 */
const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  let hasIssue = false;

  /**
   * ===== PRE-FLOW CHECK =====
   */
  const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];
  const preFlowJTP = getJTPPoliciesFromSteps(endpoint, preFlowSteps);

  // If PreFlow has JTP → global protection → stop here
  if (preFlowJTP.length > 0) {
    preFlowJTP.forEach(policy => {
      if (!configCheckCallback(policy)) {
        hasIssue = true;
      }
    });

    return cb(null, hasIssue);
  }

  // If PreFlow uses JSON but no protection → detailed message
  if (stepsUseJSON(endpoint, preFlowSteps)) {
    hasIssue = true;

    const jsonSteps = preFlowSteps.filter(step => stepUsesJSON(endpoint, step));

    endpoint.addMessage({
      plugin,
      line: endpoint.getElement().lineNumber,
      column: endpoint.getElement().columnNumber,
      message: `PreFlow is not compliant: ${jsonSteps.map(s => `"${getStepName(s)}"`).join(', ')} use JSON but no JSONThreatProtection found`
    });
  }

  /**
   * ===== FLOW CHECK =====
   */
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const steps = getFlowRequestSteps(flow) || [];

    // Skip flows not using JSON
    if (!stepsUseJSON(endpoint, steps)) {
      return { isValid: true, details: [] };
    }

    const jtpPolicies = getJTPPoliciesFromSteps(endpoint, steps);

    // ❌ Missing protection → detailed per step
    if (jtpPolicies.length === 0) {
      const jsonSteps = steps.filter(step => stepUsesJSON(endpoint, step));

      return {
        isValid: false,
        details: jsonSteps.map(step => ({
          message: `Step "${getStepName(step)}" uses JSON but no JSONThreatProtection found`,
          line: step.lineNumber,
          column: step.columnNumber
        }))
      };
    }

    // ❌ Invalid configuration
    const configValid = jtpPolicies.every(policy => configCheckCallback(policy));

    return {
      isValid: configValid,
      details: configValid ? [] : [{
        message: 'Invalid JSONThreatProtection configuration',
        line: flow.lineNumber,
        column: flow.columnNumber
      }]
    };
  });

  /**
   * ===== REPORT =====
   */
  if (invalidFlows.length > 0) {
    hasIssue = true;

    invalidFlows.forEach(flow => {
      const messages = flow.details.map(d => d.message);

      endpoint.addMessage({
        plugin,
        line: flow.line,
        column: flow.column,
        message: `Flow "${flow.name}" is not compliant: ${messages.join(' AND ')}`
      });
    });
  }

  return cb(null, hasIssue);
};

module.exports = {
  plugin,
  onProxyEndpoint,
};