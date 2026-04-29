const ruleId = 'EX-CS002';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');

const {
  findFlowsNotMatching,
  getPreFlowRequestSteps,
  getFlowRequestSteps,
  getStepName
} = require('./lib/security-lib.js');

const plugin = {
  ruleId: ruleId,
  name: "Check JSONThreatProtection",
  message: "Checks if JSONThreatProtection is present and correctly configured",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true,
};

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

/**
 * configCheckCallback function:
 * Validates the configuration of a JSONThreatProtection policy.
 */
const configCheckCallback = function (policy) {

  const requiredCritical = [
    'ContainerDepth',
    'ObjectEntryCount',
    'StringValueLength'
  ];

  const optional = [
    'ArrayElementCount',
    'ObjectEntryNameLength'
  ];

  const allFields = [...requiredCritical, ...optional];
  const element = policy.getElement();

  // ✅ IMPROVEMENT: helper to avoid repeating xpath.select
  const getFieldNodes = (field) =>
    xpath.select(`/JSONThreatProtection/${field}`, element);

  const presentFields = allFields.filter(field => {
    return getFieldNodes(field).length > 0;
  });

  let hasError = false; // ✅ IMPROVEMENT: fix return logic bug

  // ERROR → no configuration at all
  if (presentFields.length === 0) {
    hasError = true;

    policy.addMessage({
      plugin: plugin,
      line: element.lineNumber,
      column: element.columnNumber,
      message: `JSONThreatProtection "${policy.getName()}" has no configuration defined`
    });
  }

  // WARNING → missing critical fields
  const missingCritical = requiredCritical.filter(field => {
    return getFieldNodes(field).length === 0;
  });

  if (missingCritical.length > 0) {
    policy.addMessage({
      plugin: warningPlugin,
      line: element.lineNumber,
      column: element.columnNumber,
      message: `JSONThreatProtection "${policy.getName()}" is missing critical configuration: ${missingCritical.join(', ')}`
    });
  }

  return !hasError; // ✅ IMPROVEMENT: correct return for .every()
};

// get text from XML node
const getNodeText = function (node) {
  return node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';
};

// Get policy object from step
const getPolicyByName = function (endpoint, name) {
  return endpoint.parent.getPolicies().find(p => p.getName() === name);
};

const getPolicyFromStep = function (endpoint, step) {
  const name = getStepName(step);

  // ✅ IMPROVEMENT: safe guard
  if (!name) return null;

  return getPolicyByName(endpoint, name);
};

/**
 * Determines whether a given Step uses JSON processing.
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

    return headers.some(h =>
      getNodeText(h).toLowerCase().includes('application/json')
    );
  }

  return false;
};

/**
 * Extracts JSONThreatProtection policies from steps.
 */
const getJTPPoliciesFromSteps = function (endpoint, steps) {
  return steps
    .map(step => getPolicyFromStep(endpoint, step))
    .filter(p => p && p.getType() === 'JSONThreatProtection');
};

/**
 * Checks if any step uses JSON.
 */
const stepsUseJSON = function (endpoint, steps) {
  return steps.some(step => stepUsesJSON(endpoint, step));
};

/**
 * Main plugin entry point
 */
const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  let hasIssue = false;

  // ===== PRE-FLOW CHECK =====
  const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];
  const preFlowJTP = getJTPPoliciesFromSteps(endpoint, preFlowSteps);

  // If PreFlow has protection → stop here
  if (preFlowJTP.length > 0) {
    preFlowJTP.forEach(policy => {
      if (!configCheckCallback(policy)) {
        hasIssue = true;
      }
    });

    return cb(null, hasIssue);
  }

  // If PreFlow uses JSON but no protection
  // ✅ IMPROVEMENT: avoid double computation
  const preFlowJsonSteps = preFlowSteps.filter(step => stepUsesJSON(endpoint, step));

  if (preFlowJsonSteps.length > 0) {
    hasIssue = true;

    endpoint.addMessage({
      plugin,
      line: endpoint.getElement().lineNumber,
      column: endpoint.getElement().columnNumber,
      message: `PreFlow is not compliant: ${preFlowJsonSteps.map(s => `"${getStepName(s)}"`).join(', ')} use JSON but no JSONThreatProtection found`
    });
  }

  // ===== FLOW CHECK =====
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {

    const steps = getFlowRequestSteps(flow) || [];

    // ✅ IMPROVEMENT: avoid double computation
    const jsonSteps = steps.filter(step => stepUsesJSON(endpoint, step));

    if (jsonSteps.length === 0) {
      return { isValid: true, details: [] };
    }

    const jtpPolicies = getJTPPoliciesFromSteps(endpoint, steps);

    // Missing protection
    if (jtpPolicies.length === 0) {
      return {
        isValid: false,
        details: jsonSteps.map(step => ({
          message: `Flow "${flow.getAttribute('name')}" - Step "${getStepName(step)}" uses JSON but no JSONThreatProtection found`, // ✅ IMPROVEMENT message
          line: step.lineNumber,
          column: step.columnNumber
        }))
      };
    }

    // Invalid configuration
    const configValid = jtpPolicies.every(policy => configCheckCallback(policy));

    return {
      isValid: configValid,
      details: configValid ? [] : [{
        message: `Invalid JSONThreatProtection configuration in flow "${flow.getAttribute('name')}"`, // ✅ IMPROVEMENT message
        line: flow.lineNumber,
        column: flow.columnNumber
      }]
    };
  });

  // ===== REPORT =====
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