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

const getNodeText = function (node) {
  return node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';
};

const getPolicyByName = function (endpoint, name) {
  return endpoint.parent.getPolicies().find(policy => policy.getName() === name);
};

const getPolicyFromStep = function (endpoint, step) {
  const stepName = getStepName(step);
  return stepName ? getPolicyByName(endpoint, stepName) : null;
};

// NEW: Check if a step uses JSON based on the real policy type/configuration
const stepUsesJSON = function (endpoint, step) {
  const policy = getPolicyFromStep(endpoint, step);

  if (!policy) {
    return false;
  }

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

    return headers.some(header => {
      const value = getNodeText(header).toLowerCase();
      return value.includes('application/json');
    });
  }

  return false;
};

// NEW: Check if a step is JSONThreatProtection
const stepIsJSONThreatProtection = function (endpoint, step) {
  const policy = getPolicyFromStep(endpoint, step);
  return policy && policy.getType() === 'JSONThreatProtection';
};

// NEW: Get JSONThreatProtection policies used in a list of steps
const getJSONThreatProtectionPoliciesFromSteps = function (endpoint, steps) {
  return steps
    .map(step => getPolicyFromStep(endpoint, step))
    .filter(policy => policy && policy.getType() === 'JSONThreatProtection');
};

// NEW: Check if a list of steps uses JSON
const stepsUseJSON = function (endpoint, steps) {
  return steps.some(step => stepUsesJSON(endpoint, step));
};

const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  let hasIssue = false;

  // NEW: PreFlow check first
  const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];
  const preFlowJTPPolicies = getJSONThreatProtectionPoliciesFromSteps(endpoint, preFlowSteps);

  // If JSONThreatProtection exists in PreFlow, it protects globally.
  // So we only validate its configuration and skip flow-level checks.
  if (preFlowJTPPolicies.length > 0) {
    preFlowJTPPolicies.forEach(policy => {
      if (!configCheckCallback(policy)) {
        hasIssue = true;
      }
    });

    if (typeof cb === 'function') {
      return cb(null, hasIssue);
    }

    return;
  }

  // If PreFlow uses JSON but has no JSONThreatProtection, report it.
  if (stepsUseJSON(endpoint, preFlowSteps)) {
    hasIssue = true;

    endpoint.addMessage({
      plugin,
      line: endpoint.getElement().lineNumber,
      column: endpoint.getElement().columnNumber,
      message: 'PreFlow uses JSON but does not include JSONThreatProtection'
    });
  }

  // NEW: Flow-level validation only when no PreFlow protection exists
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const steps = getFlowRequestSteps(flow) || [];

    if (!stepsUseJSON(endpoint, steps)) {
      return {
        isValid: true,
        details: []
      };
    }

    const jtpPolicies = getJSONThreatProtectionPoliciesFromSteps(endpoint, steps);

    if (jtpPolicies.length === 0) {
      return {
        isValid: false,
        details: [{
          message: 'missing JSONThreatProtection in Request flow',
          line: flow.lineNumber,
          column: flow.columnNumber
        }]
      };
    }

    const configValid = jtpPolicies.every(policy => configCheckCallback(policy));

    return {
      isValid: configValid,
      details: configValid ? [] : [{
        message: 'invalid JSONThreatProtection configuration',
        line: flow.lineNumber,
        column: flow.columnNumber
      }]
    };
  });

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

  if (typeof cb === 'function') {
    return cb(null, hasIssue);
  }
};

module.exports = {
  plugin,
  onProxyEndpoint,
};