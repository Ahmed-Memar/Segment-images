const ruleId = 'EX-CS008';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');

const plugin = {
  ruleId: ruleId,
  name: "Check HTTP Methods Control SOAP",
  message: "Ensure SOAP APIs explicitly restrict HTTP methods and reject unsupported verbs.",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true
};

const warningPlugin = JSON.parse(JSON.stringify(plugin));
warningPlugin.severity = 1;

/**
 * Helpers
 */

const hasPolicyType = (endpoint, type) =>
  endpoint.parent.getPolicies().some(p => p.getType() === type);

const getPoliciesByType = (endpoint, type) =>
  endpoint.parent.getPolicies().filter(p => p.getType() === type);

const isSOAPApi = endpoint =>
  hasPolicyType(endpoint, 'MessageValidation');

const isRESTApiCoveredByOAS = endpoint =>
  hasPolicyType(endpoint, 'OASValidation');

const isRaiseFaultPolicyName = (endpoint, policyName) =>
  getPoliciesByType(endpoint, 'RaiseFault')
    .some(p => p.getName() === policyName);

const conditionHasRequestVerb = condition =>
  typeof condition === 'string' && condition.includes('request.verb');

/**
 * Extractors
 */

const getProxyElement = endpoint => endpoint.getElement();

const getPreFlowSteps = endpoint =>
  xpath.select('/ProxyEndpoint/PreFlow/Request/Step', getProxyElement(endpoint));

const getFlows = endpoint =>
  xpath.select('/ProxyEndpoint/Flows/Flow', getProxyElement(endpoint));

const getCondition = node => {
  const condNode = xpath.select('Condition', node)[0];
  return (condNode && condNode.firstChild)
    ? condNode.firstChild.data.trim()
    : '';
};

const getStepName = node => {
  const nameNode = xpath.select('Name', node)[0];
  return (nameNode && nameNode.firstChild)
    ? nameNode.firstChild.data.trim()
    : '';
};

/**
 * Checks
 */

const checkPreFlowProtection = endpoint => {
  const steps = getPreFlowSteps(endpoint);

  for (let step of steps) {
    const condition = getCondition(step);
    const stepName = getStepName(step);

    if (conditionHasRequestVerb(condition) &&
        isRaiseFaultPolicyName(endpoint, stepName)) {
      return true;
    }
  }

  return false;
};

const checkFlowsProtection = endpoint => {
  const flows = getFlows(endpoint);

  if (flows.length === 0) return false;

  for (let flow of flows) {
    const condition = getCondition(flow);
    const stepNames = xpath.select('Request/Step/Name', flow);

    let hasVerb = conditionHasRequestVerb(condition);
    let hasRaiseFault = false;

    for (let step of stepNames) {
      const name = step.firstChild ? step.firstChild.data.trim() : '';
      if (isRaiseFaultPolicyName(endpoint, name)) {
        hasRaiseFault = true;
      }
    }

    if (!(hasVerb && hasRaiseFault)) {
      return false;
    }
  }

  return true;
};

const hasAnyVerbCheck = endpoint => {
  const steps = getPreFlowSteps(endpoint);
  const flows = getFlows(endpoint);

  for (let step of steps) {
    if (conditionHasRequestVerb(getCondition(step))) return true;
  }

  for (let flow of flows) {
    if (conditionHasRequestVerb(getCondition(flow))) return true;
  }

  return false;
};

const hasAnyRaiseFault = endpoint =>
  getPoliciesByType(endpoint, 'RaiseFault').length > 0;

/**
 * Main
 */

const onProxyEndpoint = function (endpoint, cb) {
  debug('Inspecting proxy endpoint "' + endpoint.getName() + '"');

  const el = getProxyElement(endpoint);
  const line = el.lineNumber;
  const column = el.columnNumber;

  // 1. Skip REST APIs
  if (isRESTApiCoveredByOAS(endpoint)) {
    return cb(null, false);
  }

  // 2. Only handle SOAP
  if (!isSOAPApi(endpoint)) {
    return cb(null, false);
  }

  // 3. Must have request.verb check
  if (!hasAnyVerbCheck(endpoint)) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'SOAP API does not implement explicit HTTP method control. ' +
        'No condition referencing "request.verb" was found.'
    });
    return cb(null, true);
  }

  // 4. Must have RaiseFault
  if (!hasAnyRaiseFault(endpoint)) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'HTTP method check detected for SOAP API, but no RaiseFault policy was found. ' +
        'Unsupported methods may reach backend.'
    });
    return cb(null, true);
  }

  // 5. PreFlow protection → PASS
  if (checkPreFlowProtection(endpoint)) {
    return cb(null, false);
  }

  // 6. Otherwise all flows must be protected
  if (!checkFlowsProtection(endpoint)) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'HTTP method control is not consistently applied across all flows. ' +
        'Each flow must validate request.verb and use a RaiseFault policy.'
    });
    return cb(null, true);
  }

  return cb(null, false);
};

module.exports = {
  plugin,
  onProxyEndpoint
};