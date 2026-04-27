const ruleId = 'EX-CS002';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');
const SecurityLib = require('./security-lib.js');

const {
  PolicyChecker,
  getPoliciesByType,
  getFlows,
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

const hasExtractVariablesJSONPayload = function (endpoint) {
  const policies = getPoliciesByType(endpoint, 'ExtractVariables') || [];

  return policies.some(policy => {
    const jsonPayload = xpath.select('/ExtractVariables/JSONPayload', policy.getElement());
    return jsonPayload.length > 0;
  });
};

const hasJSONTransformationPolicy = function (endpoint) {
  return (
    (getPoliciesByType(endpoint, 'JSONToXML') || []).length > 0 ||
    (getPoliciesByType(endpoint, 'XMLToJSON') || []).length > 0
  );
};

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

const hasJSONInUsedStepName = function (endpoint) {
  const preFlowSteps = getPreFlowRequestSteps(endpoint) || [];

  for (let step of preFlowSteps) {
    const stepName = getStepName(step);

    if (stepName && stepName.toLowerCase().includes('json')) {
      return true;
    }
  }

  const flows = getFlows(endpoint) || [];

  for (let flow of flows) {
    const steps = getFlowRequestSteps(flow) || [];

    for (let step of steps) {
      const stepName = getStepName(step);

      if (stepName && stepName.toLowerCase().includes('json')) {
        return true;
      }
    }
  }

  return false;
};

const usesJSON = function (endpoint) {
  let score = 0;

  if (hasExtractVariablesJSONPayload(endpoint)) {
    score += 3;
  }

  if (hasJSONTransformationPolicy(endpoint)) {
    score += 3;
  }

  if (hasAssignMessageJSONContentType(endpoint)) {
    score += 2;
  }

  if (hasJSONInUsedStepName(endpoint)) {
    score += 1;
  }

  debug(`JSON usage detection score: ${score}`);

  return score >= 2;
};

const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  if (!usesJSON(endpoint)) {
    debug('No JSON usage detected, skipping JSONThreatProtection check');

    if (typeof cb === 'function') {
      return cb(null, false);
    }

    return;
  }

  let checker = new PolicyChecker(plugin, 'JSONThreatProtection', debug, configCheckCallback);
  let hasIssue = checker.check(endpoint);

  if (typeof cb === 'function') {
    cb(null, hasIssue);
  }
};

module.exports = {
  plugin,
  onProxyEndpoint,
};