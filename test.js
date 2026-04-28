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

// ✅ Signal fort 1 : ExtractVariables avec JSONPayload
const hasExtractVariablesJSONPayload = function (endpoint) {
  const policies = getPoliciesByType(endpoint, 'ExtractVariables') || [];

  return policies.some(policy => {
    const jsonPayload = xpath.select('/ExtractVariables/JSONPayload', policy.getElement());
    return jsonPayload.length > 0;
  });
};

// ✅ Signal fort 2 : Transformation JSON explicite
const hasJSONTransformationPolicy = function (endpoint) {
  return (
    (getPoliciesByType(endpoint, 'JSONToXML') || []).length > 0 ||
    (getPoliciesByType(endpoint, 'XMLToJSON') || []).length > 0
  );
};

// ✅ Signal fort 3 : Content-Type JSON défini
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

// 🎯 Détection finale simplifiée (signaux forts uniquement)
const usesJSON = function (endpoint) {
  const result =
    hasExtractVariablesJSONPayload(endpoint) ||
    hasJSONTransformationPolicy(endpoint) ||
    hasAssignMessageJSONContentType(endpoint);

  debug(`JSON usage detected: ${result}`);

  return result;
};

const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  // ✅ Appliquer le contrôle seulement si JSON est utilisé
  if (!usesJSON(endpoint)) {
    debug('No JSON usage detected → skipping JSONThreatProtection check');

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