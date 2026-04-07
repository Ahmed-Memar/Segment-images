const ruleId = 'EX-CS009';

const debug = require('debug')('apigeelint:' + ruleId);
const xpath = require('xpath');
const {
  getPoliciesByType,
  getFlows,
  getStepName,
  getPreFlowRequestSteps,
  getFlowRequestSteps,
  findFlowsNotMatching
} = require('./lib/security-lib.js');

const plugin = {
  ruleId: ruleId,
  name: "Check Access Token Control",
  message: "Ensure APIs validate access tokens using OAuthV2 VerifyAccessToken or VerifyJWT.",
  fatal: false,
  severity: 2,
  nodeType: "Bundle",
  enabled: true
};

// Helpers

const getNodeText = node =>
  node && node.firstChild && node.firstChild.data
    ? node.firstChild.data.trim()
    : '';

const isVerifyAccessTokenPolicy = policy => {
  const el = policy.getElement();

  const operationNode =
    xpath.select('/OAuthV2/Operation', el)[0] ||
    xpath.select('/OAuthV2/@operation', el)[0] ||
    xpath.select('/OAuthV2/@Operation', el)[0];

  const operationValue =
    operationNode && operationNode.value
      ? String(operationNode.value).trim()
      : getNodeText(operationNode);

  return /^VerifyAccessToken$/i.test(operationValue);
};

const getValidAccessTokenPolicies = endpoint => {
  const oauthPolicies = getPoliciesByType(endpoint, 'OAuthV2')
    .filter(isVerifyAccessTokenPolicy);

  const verifyJwtPolicies = getPoliciesByType(endpoint, 'VerifyJWT');

  return [...oauthPolicies, ...verifyJwtPolicies];
};

const getValidAccessTokenPolicyNames = endpoint =>
  getValidAccessTokenPolicies(endpoint).map(policy => policy.getName());

const isValidAccessTokenPolicyUsed = (endpoint, policyName) =>
  getValidAccessTokenPolicyNames(endpoint).includes(policyName);

const checkPreFlowProtection = endpoint => {
  const steps = getPreFlowRequestSteps(endpoint);

  return steps.some(step =>
    isValidAccessTokenPolicyUsed(endpoint, getStepName(step))
  );
};

// Main

const onProxyEndpoint = function (endpoint, cb) {
  debug(`Inspecting proxy endpoint "${endpoint.getName()}"`);

  const el = endpoint.getElement();
  const line = el.lineNumber;
  const column = el.columnNumber;

  const validPolicies = getValidAccessTokenPolicies(endpoint);
  const validPolicyNames = validPolicies.map(policy => policy.getName());

  // 1. Presence check
  if (validPolicies.length === 0) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'API does not implement access token validation. Missing OAuthV2 with Operation="VerifyAccessToken" or VerifyJWT policy.'
    });

    return cb(null, true);
  }

  // 2. If PreFlow enforces token validation, consider the proxy compliant
  if (checkPreFlowProtection(endpoint)) {
    return cb(null, false);
  }

  const flows = getFlows(endpoint);

  // 3. No flows defined and no PreFlow protection => global error
  if (flows.length === 0) {
    endpoint.addMessage({
      plugin,
      line,
      column,
      message:
        'API defines access token validation policies but does not enforce them. No PreFlow or Flow applies OAuthV2 VerifyAccessToken or VerifyJWT.'
    });

    return cb(null, true);
  }

  // 4. Validate each Flow using a generic matcher
  const invalidFlows = findFlowsNotMatching(endpoint, (flow) => {
    const steps = getFlowRequestSteps(flow);

    const hasAccessTokenValidation = steps.some(step =>
      validPolicyNames.includes(getStepName(step))
    );

    const details = [];

    if (!hasAccessTokenValidation) {
      details.push({
        message: 'missing access token validation policy in Request flow (OAuthV2 VerifyAccessToken or VerifyJWT)',
        line: flow.lineNumber,
        column: flow.columnNumber
      });
    }

    return {
      isValid: hasAccessTokenValidation,
      details
    };
  });

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